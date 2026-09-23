/**
 * Whiteboard.js — Trazado Georreferenciado y Pizarra Táctica sobre Leaflet
 * Movimiento Independiente Ganamos Todos (MIGATO) • Monagas
 * 
 * Permite realizar trazos a mano alzada (Lápiz) y polígonos delimitadores (Subrayado)
 * directamente como capas vectoriales nativas de Leaflet (L.polyline y L.polygon).
 * Las líneas y polígonos quedan matemáticamente anclados a las coordenadas geográficas,
 * manteniendo su escala, posición y forma exacta al hacer zoom o desplazar el mapa.
 */

export class Whiteboard {
  constructor(options = {}) {
    this.toolbar = document.getElementById(options.toolbarId || "whiteboard-toolbar");
    this.toggleBtn = document.getElementById(options.toggleBtnId || "btn-toggle-whiteboard");
    this.map = options.map || null;

    this.isActive = false;
    this.currentTool = "pen"; // "pen" | "polygon" | "line" | "eraser" | "pan"
    this.currentColor = "#facc15"; // Amarillo neón táctico por defecto
    this.currentLineWidth = 5; // Grosor medio

    this.drawnLayers = null;
    this.history = [];
    this.maxHistory = 40;

    // Estado del trazado libre (Lápiz)
    this.isDrawing = false;
    this.currentPolyline = null;

    // Estado del trazado de polígonos (Subrayador de límites y divisiones)
    this.polygonPoints = [];
    this.activePolygon = null;
    this.tempGuideLine = null;
    this.polygonMarkers = [];

    // Estado de línea recta
    this.lineStartPoint = null;

    this.init();
  }

  init() {
    if (this.map) {
      this.setupLeafletLayers();
    }

    // Atajo global de teclado: Ctrl + Z / Cmd + Z para Deshacer
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (this.isActive || this.hasDrawings()) {
          e.preventDefault();
          this.undo();
        }
      }
      if (e.key === "Escape" && this.isActive) {
        if (this.polygonPoints.length > 0) {
          this.cancelPolygon();
        } else {
          this.deactivate();
        }
      }
      if (e.key === "Enter" && this.isActive && this.currentTool === "polygon") {
        this.finishPolygon();
      }
    });
  }

  setMap(mapInstance) {
    this.map = mapInstance;
    this.setupLeafletLayers();
  }

  setupLeafletLayers() {
    if (!this.map) return;
    if (!this.drawnLayers) {
      this.drawnLayers = L.featureGroup().addTo(this.map);
    }
    if (this._eventsAttached) return;
    this._eventsAttached = true;

    const mapContainer = this.map.getContainer();

    // Eventos de puntero unificados (Touch, Stylus y Mouse)
    mapContainer.addEventListener("pointerdown", (e) => this.onPointerDown(e));
    window.addEventListener("pointermove", (e) => this.onPointerMove(e));
    window.addEventListener("pointerup", (e) => this.onPointerUp(e));
    window.addEventListener("pointercancel", (e) => this.onPointerUp(e));

    // Deshabilitar menú contextual al dibujar con clic secundario
    mapContainer.addEventListener("contextmenu", (e) => {
      if (this.isActive && (this.currentTool === "polygon" || this.currentTool === "pen")) {
        e.preventDefault();
        if (this.currentTool === "polygon") {
          this.finishPolygon();
        }
      }
    });
  }

  /* ========================================================================
     DETECCIÓN DE COORDENADAS Y FILTRADO DE EVENTOS
     ======================================================================== */

  isUIElement(e) {
    if (!e || !e.target) return false;
    return e.target.closest("#whiteboard-toolbar") || 
           e.target.closest("#lamina-header") || 
           e.target.closest("#lamina-sidebar") || 
           e.target.closest(".leaflet-control") || 
           e.target.closest("#modal-exportar-lamina") ||
           e.target.closest(".swal2-container");
  }

  getEventLatLng(e) {
    if (!this.map) return null;
    const rect = this.map.getContainer().getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;
    try {
      return this.map.containerPointToLatLng([x, y]);
    } catch (err) {
      return null;
    }
  }

  /* ========================================================================
     MANEJO DE EVENTOS DE TRAZADO GEORREFERENCIADO
     ======================================================================== */

  onPointerDown(e) {
    if (!this.isActive || this.isUIElement(e)) return;
    if (e.button !== 0 && e.pointerType === "mouse") return; // Solo clic primario

    const latlng = this.getEventLatLng(e);
    if (!latlng) return;

    if (this.currentTool === "pen") {
      // Modo Lápiz Libre Georreferenciado
      this.isDrawing = true;
      this.currentPolyline = L.polyline([latlng], {
        color: this.currentColor,
        weight: this.currentLineWidth,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round",
        smoothFactor: 1.0,
        interactive: true
      }).addTo(this.drawnLayers);

      const targetLine = this.currentPolyline;
      targetLine.on("click", (ev) => {
        if (this.currentTool === "eraser") {
          L.DomEvent.stopPropagation(ev);
          this.removeLayer(targetLine);
        }
      });

    } else if (this.currentTool === "polygon") {
      // Modo Polígono / Subrayador de Límite Territorial
      this.addPolygonVertex(latlng);

    } else if (this.currentTool === "line") {
      // Modo Línea Recta / Eje
      if (!this.lineStartPoint) {
        this.lineStartPoint = latlng;
      } else {
        const line = L.polyline([this.lineStartPoint, latlng], {
          color: this.currentColor,
          weight: this.currentLineWidth,
          opacity: 0.95,
          lineCap: "round",
          lineJoin: "round",
          interactive: true
        }).addTo(this.drawnLayers);

        line.on("click", (ev) => {
          if (this.currentTool === "eraser") {
            L.DomEvent.stopPropagation(ev);
            this.removeLayer(line);
          }
        });

        this.history.push({ type: "line", layer: line });
        this.lineStartPoint = null;
        if (this.tempGuideLine) {
          this.map.removeLayer(this.tempGuideLine);
          this.tempGuideLine = null;
        }
      }
    }
  }

  onPointerMove(e) {
    if (!this.isActive) return;

    const latlng = this.getEventLatLng(e);
    if (!latlng) return;

    if (this.currentTool === "pen" && this.isDrawing && this.currentPolyline) {
      this.currentPolyline.addLatLng(latlng);

    } else if (this.currentTool === "polygon" && this.polygonPoints.length > 0) {
      // Guía elástica interactiva al mover el cursor o dedo
      const lastPoint = this.polygonPoints[this.polygonPoints.length - 1];
      if (!this.tempGuideLine) {
        this.tempGuideLine = L.polyline([lastPoint, latlng], {
          color: this.currentColor,
          weight: 2,
          dashArray: "4, 4",
          opacity: 0.7
        }).addTo(this.map);
      } else {
        this.tempGuideLine.setLatLngs([lastPoint, latlng]);
      }

    } else if (this.currentTool === "line" && this.lineStartPoint) {
      if (!this.tempGuideLine) {
        this.tempGuideLine = L.polyline([this.lineStartPoint, latlng], {
          color: this.currentColor,
          weight: 2,
          dashArray: "4, 4",
          opacity: 0.7
        }).addTo(this.map);
      } else {
        this.tempGuideLine.setLatLngs([this.lineStartPoint, latlng]);
      }
    }
  }

  onPointerUp(e) {
    if (!this.isActive) return;

    if (this.currentTool === "pen" && this.isDrawing) {
      this.isDrawing = false;
      if (this.currentPolyline) {
        const pts = this.currentPolyline.getLatLngs();
        if (pts.length <= 1 && pts.length > 0) {
          // Si fue un punto o toque táctil único, duplicar punto para crear punto visible
          this.currentPolyline.addLatLng(pts[0]);
        }
        if (this.currentPolyline.getLatLngs().length > 0) {
          this.history.push({ type: "pen", layer: this.currentPolyline });
        } else {
          this.drawnLayers.removeLayer(this.currentPolyline);
        }
        this.currentPolyline = null;
      }
    }
  }

  /* ========================================================================
     MODO POLÍGONO / SUBRAYADOR DE LÍMITES PARROQUIALES
     ======================================================================== */

  addPolygonVertex(latlng) {
    // Si hace clic muy cerca del primer punto tras tener 3+ vértices, cerrar
    if (this.polygonPoints.length >= 3) {
      const first = this.polygonPoints[0];
      const dist = this.map.latLngToContainerPoint(first).distanceTo(this.map.latLngToContainerPoint(latlng));
      if (dist < 18) {
        this.finishPolygon();
        return;
      }
    }

    this.polygonPoints.push(latlng);

    if (!this.activePolygon) {
      this.activePolygon = L.polygon(this.polygonPoints, {
        color: this.currentColor,
        fillColor: this.currentColor,
        fillOpacity: 0.32,
        weight: this.currentLineWidth,
        dashArray: "6, 4",
        interactive: true
      }).addTo(this.drawnLayers);
    } else {
      this.activePolygon.setLatLngs(this.polygonPoints);
    }

    // Marcador circular táctico en el vértice
    const marker = L.circleMarker(latlng, {
      radius: 5,
      color: "#ffffff",
      fillColor: this.currentColor,
      fillOpacity: 1,
      weight: 2
    }).addTo(this.drawnLayers);
    this.polygonMarkers.push(marker);

    this.updatePolygonUI();
  }

  finishPolygon() {
    if (!this.activePolygon || this.polygonPoints.length < 3) {
      this.cancelPolygon();
      return;
    }

    // Borde sólido definitivo
    this.activePolygon.setStyle({ dashArray: null });

    // Retirar los marcadores temporales de los vértices
    this.polygonMarkers.forEach(m => this.drawnLayers.removeLayer(m));
    this.polygonMarkers = [];

    if (this.tempGuideLine) {
      this.map.removeLayer(this.tempGuideLine);
      this.tempGuideLine = null;
    }

    const poly = this.activePolygon;
    poly.on("click", (ev) => {
      if (this.currentTool === "eraser") {
        L.DomEvent.stopPropagation(ev);
        this.removeLayer(poly);
      }
    });

    this.history.push({ type: "polygon", layer: poly });
    this.activePolygon = null;
    this.polygonPoints = [];
    this.updatePolygonUI();
  }

  cancelPolygon() {
    if (this.activePolygon) {
      this.drawnLayers.removeLayer(this.activePolygon);
      this.activePolygon = null;
    }
    this.polygonMarkers.forEach(m => this.drawnLayers.removeLayer(m));
    this.polygonMarkers = [];
    this.polygonPoints = [];
    if (this.tempGuideLine) {
      this.map.removeLayer(this.tempGuideLine);
      this.tempGuideLine = null;
    }
    this.lineStartPoint = null;
    this.updatePolygonUI();
  }

  updatePolygonUI() {
    const btnFinish = document.getElementById("wb-btn-finish-poly");
    const indicator = document.getElementById("wb-tool-status");
    const pts = this.polygonPoints.length;

    if (btnFinish) {
      if (this.currentTool === "polygon" && pts >= 3) {
        btnFinish.classList.remove("hidden");
        btnFinish.classList.add("flex");
        btnFinish.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5"></i> <span>✓ Cerrar Polígono (${pts})</span>`;
        if (window.lucide && typeof window.lucide.createIcons === "function") {
          window.lucide.createIcons();
        }
      } else {
        btnFinish.classList.add("hidden");
        btnFinish.classList.remove("flex");
      }
    }

    if (indicator) {
      if (this.currentTool === "polygon") {
        indicator.textContent = pts === 0 ? "Modo Polígono: Haz clic en el mapa para marcar vértices del límite" : `Trazando polígono: ${pts} vértice(s). Clic en el primer punto o en "✓ Cerrar" para terminar.`;
      } else if (this.currentTool === "pen") {
        indicator.textContent = "Modo Lápiz: Arrastra sobre el mapa. El trazo queda anclado a las coordenadas.";
      } else if (this.currentTool === "line") {
        indicator.textContent = "Modo Línea: Clic en punto inicial y clic en punto final.";
      } else if (this.currentTool === "eraser") {
        indicator.textContent = "Modo Borrador: Haz clic en cualquier trazo para eliminarlo.";
      } else if (this.currentTool === "pan") {
        indicator.textContent = "Modo Navegación: Arrastra para mover el mapa libremente.";
      }
    }
  }

  /* ========================================================================
     CONTROL DE ESTADO, ACTIVACIÓN Y HERRAMIENTAS
     ======================================================================== */

  toggle() {
    if (this.isActive) {
      this.deactivate();
    } else {
      this.activate();
    }
  }

  activate(tool = "pen") {
    this.isActive = true;
    if (this.toolbar) {
      this.toolbar.classList.remove("hidden");
      this.toolbar.classList.add("flex");
    }
    if (this.toggleBtn) {
      this.toggleBtn.classList.add("bg-amber-100", "text-amber-900", "border-amber-400", "ring-2", "ring-amber-400/50");
      this.toggleBtn.classList.remove("bg-slate-100", "text-slate-700", "border-slate-300");
    }
    this.setTool(tool);
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  deactivate() {
    this.isActive = false;
    this.isDrawing = false;
    this.cancelPolygon();

    if (this.toolbar) {
      this.toolbar.classList.add("hidden");
      this.toolbar.classList.remove("flex");
    }
    if (this.toggleBtn) {
      this.toggleBtn.classList.remove("bg-amber-100", "text-amber-900", "border-amber-400", "ring-2", "ring-amber-400/50");
      this.toggleBtn.classList.add("bg-slate-100", "text-slate-700", "border-slate-300");
    }

    if (this.map) {
      this.map.dragging.enable();
      this.map.touchZoom.enable();
      this.map.doubleClickZoom.enable();
      this.map.scrollWheelZoom.enable();
      this.map.getContainer().style.cursor = "";
    }
  }

  setTool(tool) {
    if (this.polygonPoints.length > 0 && tool !== "polygon") {
      this.finishPolygon();
    }

    this.currentTool = tool; // "pen" | "polygon" | "line" | "eraser" | "pan"
    if (!this.map) return;

    const mapContainer = this.map.getContainer();

    if (tool === "pan") {
      this.map.dragging.enable();
      mapContainer.style.cursor = "grab";
    } else if (tool === "eraser") {
      this.map.dragging.disable();
      mapContainer.style.cursor = "cell";
    } else {
      this.map.dragging.disable();
      mapContainer.style.cursor = "crosshair";
    }

    this.map.scrollWheelZoom.enable();
    this.map.doubleClickZoom.enable();

    this.updateToolUI();
    this.updatePolygonUI();
  }

  setColor(color) {
    this.currentColor = color;
    if (this.currentTool === "eraser" || this.currentTool === "pan") {
      this.setTool("pen");
    }
    this.updateToolUI();
  }

  setLineWidth(width) {
    this.currentLineWidth = width;
    this.updateToolUI();
  }

  updateToolUI() {
    // Actualizar botones de color
    document.querySelectorAll(".wb-color-btn").forEach(btn => {
      const c = btn.getAttribute("data-color");
      if (c === this.currentColor && (this.currentTool === "pen" || this.currentTool === "polygon" || this.currentTool === "line")) {
        btn.classList.add("scale-125", "ring-2", "ring-white");
      } else {
        btn.classList.remove("scale-125", "ring-2", "ring-white");
      }
    });

    // Actualizar botón de herramientas
    const toolMap = {
      pen: "wb-tool-pen",
      polygon: "wb-tool-polygon",
      line: "wb-tool-line",
      eraser: "wb-btn-eraser",
      pan: "wb-btn-pan"
    };

    Object.entries(toolMap).forEach(([t, elId]) => {
      const el = document.getElementById(elId);
      if (!el) return;
      if (this.currentTool === t) {
        el.classList.add("bg-amber-500", "text-slate-950", "shadow-sm");
        el.classList.remove("bg-white/10", "text-slate-200");
      } else {
        el.classList.remove("bg-amber-500", "text-slate-950", "shadow-sm");
        el.classList.add("bg-white/10", "text-slate-200");
      }
    });
  }

  /* ========================================================================
     HISTORIAL, DESHACER Y LIMPIAR
     ======================================================================== */

  removeLayer(layer) {
    if (!layer || !this.drawnLayers) return;
    this.drawnLayers.removeLayer(layer);
    this.history = this.history.filter(h => h.layer !== layer);
  }

  undo() {
    if (this.history.length === 0) return;
    const item = this.history.pop();
    if (item && item.layer && this.drawnLayers) {
      this.drawnLayers.removeLayer(item.layer);
    }
  }

  clear() {
    if (this.drawnLayers) {
      this.drawnLayers.clearLayers();
    }
    this.history = [];
    this.cancelPolygon();
  }

  hasDrawings() {
    return this.drawnLayers && this.drawnLayers.getLayers().length > 0;
  }
}
