/**
 * Administrador de Herramientas de Dibujo y Geoprocesamiento — Google Earth Pro Web
 * Incluye: Deshacer punto, Vértices arrastrables interactivos y Ergonomía Móvil
 */

export class ToolsManager {
  constructor(mapEngine, onFinishItemCallback) {
    this.mapEngine = mapEngine;
    this.map = mapEngine.map;
    this.onFinishItemCallback = onFinishItemCallback;

    this.activeTool = null; // 'poligono', 'ruta', 'marca', 'regla'
    this.points = [];
    this.vertexMarkers = [];
    this.previewShape = null;

    this.initMapEvents();
    this.initKeyboardEvents();
  }

  initMapEvents() {
    this.map.on("click", (e) => this.handleMapClick(e));
    this.map.on("dblclick", (e) => {
      if (this.activeTool) {
        if (e && e.originalEvent) {
          try {
            e.originalEvent.preventDefault();
            e.originalEvent.stopPropagation();
          } catch(err) {}
        }
        this.finishCurrentDrawing();
      }
    });
  }

  initKeyboardEvents() {
    window.addEventListener("keydown", (e) => {
      if (!this.activeTool) return;
      if (e.key === "Escape") {
        this.cancelActiveTool();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        this.undoLastPoint();
      }
    });
  }

  setActiveTool(toolName) {
    try {
      if (this.activeTool === toolName) {
        // Si ya está activa, asegurarse de que la tarjeta de dibujo esté al frente y visible
        const banner = document.getElementById("earth-drawing-banner");
        if (banner) {
          banner.classList.remove("hidden");
          banner.classList.add("flex");
          banner.style.removeProperty("display");
          banner.style.setProperty("display", "flex", "important");
          banner.style.zIndex = "99999";
        }
        return;
      }
      this.cancelActiveTool();
      this.activeTool = toolName;

      // Actualizar botones de toolbar
      document.querySelectorAll(".btn-earth-tool").forEach(btn => {
        const isCurrent = btn.dataset.tool === toolName;
        btn.classList.toggle("active-tool", isCurrent);
      });

      const banner = document.getElementById("earth-drawing-banner");
      const bannerText = document.getElementById("earth-drawing-banner-text");
      const bannerParish = document.getElementById("earth-drawing-banner-parish");
      const bannerDot = document.getElementById("earth-drawing-banner-dot");
      const nameInput = document.getElementById("earth-draw-name-input");
      const sectorExtra = document.getElementById("earth-draw-sector-extra");
      const militantesInput = document.getElementById("earth-draw-militantes");
      const casasInput = document.getElementById("earth-draw-casas");
      const liveMeasure = document.getElementById("earth-live-measure");
      const liveMeasureSub = document.getElementById("earth-live-measure-sub");
      const liveMeasureSubLabel = document.getElementById("earth-live-measure-sub-label");
      const btnFinish = document.getElementById("btn-banner-finish");
      const btnFinishText = document.getElementById("btn-banner-finish-text");
      const mobileBar = document.getElementById("mobile-field-actions");

      if (toolName) {
        // Revelar dock flotante inmediatamente con máxima prioridad
        if (banner) {
          banner.classList.remove("hidden");
          banner.classList.add("flex");
          banner.style.removeProperty("display");
          banner.style.setProperty("display", "flex", "important");
          banner.style.zIndex = "99999";
        }

        if (mobileBar) mobileBar.classList.add("hidden");
        if (this.map && this.map.getContainer()) {
          this.map.getContainer().style.cursor = "crosshair";
        }
        if (this.map && this.map.doubleClickZoom) {
          try { this.map.doubleClickZoom.disable(); } catch(e) {}
        }
        if (this.mapEngine && typeof this.mapEngine.setDrawingMode === "function") {
          try { this.mapEngine.setDrawingMode(true); } catch(e) {}
        }

        const parishStore = window.earthApp?.store?.getParish(window.earthApp?.selectedMunId, window.earthApp?.selectedParishId);
        const parishName = parishStore?.nombre || "Parroquia Activa";

        if (banner) {
          // Ajustar color del borde del panel según la herramienta activa
          banner.classList.remove("border-sky-500/90", "border-purple-500/90", "border-emerald-500/90", "border-rose-500/90");
          if (toolName === "subparroquia") {
            banner.classList.add("border-purple-500/90");
            if (bannerDot) bannerDot.className = "w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.9)] shrink-0 animate-pulse";
            if (bannerText) bannerText.textContent = "Trazando Sub-Parroquia / Eje Comunal";
            const count = (parishStore?.subparroquias || []).length + 1;
            if (nameInput) nameInput.value = `Eje Comunal ${count}`;
            if (sectorExtra) sectorExtra.classList.remove("hidden");
            if (militantesInput) militantesInput.value = "0";
            if (casasInput) casasInput.value = "0";
            if (liveMeasureSubLabel) liveMeasureSubLabel.textContent = "Superficie / Área";
          } else if (toolName === "poligono") {
            banner.classList.add("border-sky-500/90");
            if (bannerDot) bannerDot.className = "w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)] shrink-0 animate-pulse";
            const activeSub = (parishStore?.subparroquias || []).find(sp => String(sp.id) === String(window.earthApp?.activeSubParroquiaId));
            if (activeSub) {
              if (bannerText) bannerText.innerHTML = `Trazando Sector en: <span class="text-purple-300 font-black">${activeSub.nombre}</span>`;
            } else {
              if (bannerText) bannerText.textContent = "Trazando Sector Comunal / Militancia";
            }
            const count = (parishStore?.poligonos || []).length + 1;
            if (nameInput) nameInput.value = `Sector Comunal ${count}`;
            if (sectorExtra) sectorExtra.classList.remove("hidden");
            if (militantesInput) militantesInput.value = "0";
            if (casasInput) casasInput.value = "0";
            if (liveMeasureSubLabel) liveMeasureSubLabel.textContent = "Superficie / Área";
          } else if (toolName === "ruta") {
            banner.classList.add("border-emerald-500/90");
            if (bannerDot) bannerDot.className = "w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)] shrink-0 animate-pulse";
            if (bannerText) bannerText.textContent = "Trazando Ruta / Calle";
            const count = (parishStore?.rutas || []).length + 1;
            if (nameInput) nameInput.value = `Calle ${count}`;
            if (sectorExtra) sectorExtra.classList.add("hidden");
            if (liveMeasureSubLabel) liveMeasureSubLabel.textContent = "Longitud de la Vía";
          } else if (toolName === "marca") {
            banner.classList.add("border-rose-500/90");
            if (bannerDot) bannerDot.className = "w-3 h-3 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.9)] shrink-0 animate-pulse";
            if (bannerText) bannerText.textContent = "Colocar Marca de Posición";
            const count = (parishStore?.marcas || []).length + 1;
            if (nameInput) nameInput.value = `Punto de Interés ${count}`;
            if (sectorExtra) sectorExtra.classList.add("hidden");
            if (liveMeasureSubLabel) liveMeasureSubLabel.textContent = "Coordenadas Lat, Lng";
          }

          if (bannerParish) {
            const activeSub = (parishStore?.subparroquias || []).find(sp => String(sp.id) === String(window.earthApp?.activeSubParroquiaId));
            if (toolName === "poligono" && activeSub) {
              bannerParish.textContent = `📍 ${parishName} • 🟪 ${activeSub.nombre}`;
            } else {
              bannerParish.textContent = `📍 ${parishName}`;
            }
          }
          if (btnFinishText) {
            const activeSub = (parishStore?.subparroquias || []).find(sp => String(sp.id) === String(window.earthApp?.activeSubParroquiaId));
            if (toolName === "poligono" && activeSub) {
              btnFinishText.textContent = `Guardar en ${activeSub.nombre}`;
            } else {
              btnFinishText.textContent = `Guardar en ${parishName}`;
            }
          }
          if (btnFinish) {
            btnFinish.classList.remove("pointer-events-none", "opacity-50");
          }
        }

        this.updateDrawingHint();
        if (liveMeasure) liveMeasure.textContent = "0 puntos";
        if (liveMeasureSub) liveMeasureSub.textContent = (toolName === "ruta" ? "0 m" : (toolName === "marca" ? "Sin fijar" : "0.00 Ha"));
        const compactLabel = document.getElementById("earth-live-measure-compact");
        if (compactLabel) compactLabel.textContent = "0 pts";
        const drawBody = document.getElementById("earth-drawing-body");
        if (drawBody && window.innerWidth < 640) {
          drawBody.classList.add("hidden");
        }

        if (window.lucide && typeof window.lucide.createIcons === "function") {
          try { window.lucide.createIcons(); } catch(e){}
        }
      } else {
        if (this.map && this.map.doubleClickZoom) {
          try { this.map.doubleClickZoom.enable(); } catch(e) {}
        }
        if (this.mapEngine && typeof this.mapEngine.setDrawingMode === "function") {
          try { this.mapEngine.setDrawingMode(false); } catch(e) {}
        }
        if (mobileBar) mobileBar.classList.remove("hidden");
        if (this.map && this.map.getContainer()) {
          this.map.getContainer().style.cursor = "";
        }
        if (banner) {
          banner.classList.add("hidden");
          banner.classList.remove("flex");
          banner.style.setProperty("display", "none", "important");
        }
      }
    } catch(err) {
      console.error("[ToolsManager] Error en setActiveTool:", err);
    }
  }

  cancelActiveTool() {
    this.activeTool = null;
    this.points = [];
    this.vertexMarkers = [];
    if (this.mapEngine && this.mapEngine.tempDrawingLayer) {
      this.mapEngine.tempDrawingLayer.clearLayers();
    }
    this.previewShape = null;

    if (this.map && this.map.doubleClickZoom) {
      try { this.map.doubleClickZoom.enable(); } catch(e) {}
    }

    if (this.mapEngine && typeof this.mapEngine.setDrawingMode === "function") {
      try { this.mapEngine.setDrawingMode(false); } catch(e) {}
    }

    const mobileBar = document.getElementById("mobile-field-actions");
    if (mobileBar) mobileBar.classList.add("hidden");

    document.querySelectorAll(".btn-earth-tool").forEach(btn => {
      btn.classList.remove("active-tool");
    });

    const banner = document.getElementById("earth-drawing-banner");
    if (banner) {
      banner.classList.add("hidden");
      banner.classList.remove("flex");
      banner.style.setProperty("display", "none", "important");
    }
    if (this.map && this.map.getContainer()) {
      this.map.getContainer().style.cursor = "";
    }
  }

  generateQuickQuadrant() {
    if (!this.map) return;
    try {
      let center = this.map.getCenter();
      let bounds = this.map.getBounds();

      if (this.activeTool === "poligono" && window.earthApp?.activeSubParroquiaId) {
        const pStore = window.earthApp?.store?.getParish(window.earthApp?.selectedMunId, window.earthApp?.selectedParishId);
        const activeSub = (pStore?.subparroquias || []).find(sp => String(sp.id) === String(window.earthApp?.activeSubParroquiaId));
        if (activeSub?.vertices && activeSub.vertices.length >= 3) {
          const spBounds = L.polygon(activeSub.vertices).getBounds();
          center = spBounds.getCenter();
          bounds = spBounds;
        }
      }

      const latSpan = Math.abs(bounds.getNorth() - bounds.getSouth()) * 0.16;
      const lngSpan = Math.abs(bounds.getEast() - bounds.getWest()) * 0.16;

      const p1 = [center.lat + latSpan, center.lng - lngSpan];
      const p2 = [center.lat + latSpan, center.lng + lngSpan];
      const p3 = [center.lat - latSpan, center.lng + lngSpan];
      const p4 = [center.lat - latSpan, center.lng - lngSpan];

      this.points = [p1, p2, p3, p4];
      if (this.mapEngine && this.mapEngine.tempDrawingLayer) {
        this.mapEngine.tempDrawingLayer.clearLayers();
      }
      this.vertexMarkers = [];

      const isSub = this.activeTool === "subparroquia";
      const vertexBg = isSub ? "bg-purple-600" : "bg-sky-500";
      const vertexBorder = isSub ? "border-purple-200" : "border-white";

      this.points.forEach((pt, idx) => {
        const vertexIcon = L.divIcon({
          className: "earth-vertex-marker-wrapper",
          html: `<div class="w-5 h-5 ${vertexBg} border-2 ${vertexBorder} rounded-full shadow-[0_0_12px_rgba(255,255,255,0.95)] cursor-move hover:scale-125 active:scale-95 transition flex items-center justify-center text-[10px] font-black text-white leading-none">${idx + 1}</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        const marker = L.marker(pt, { draggable: true, icon: vertexIcon, zIndexOffset: 1000 });
        marker.on("drag", (ev) => {
          try {
            this.points[idx] = [ev.latlng.lat, ev.latlng.lng];
            this.updatePreviewShape();
            this.updateLiveMeasurements();
          } catch(e) {}
        });
        if (this.mapEngine && this.mapEngine.tempDrawingLayer) {
          this.mapEngine.tempDrawingLayer.addLayer(marker);
        }
        this.vertexMarkers.push(marker);
      });

      this.updatePreviewShape();
      this.updateLiveMeasurements();
      this.updateDrawingHint();

      if (window.earthApp && typeof window.earthApp.showToast === "function") {
        window.earthApp.showToast("⚡ Cuadrante inicial de 4 esquinas generado. Arrastra las esquinas o pulsa [Guardar].", isSub ? "purple" : "sky");
      }
    } catch(err) {
      console.warn("[generateQuickQuadrant] Error:", err);
    }
  }

  handleMapClick(e) {
    if (!this.activeTool) return;
    try {
      if (!e || !e.latlng) return;
      const latlng = [e.latlng.lat, e.latlng.lng];

      if (this.activeTool === "marca") {
        this.points = [latlng];
        this.mapEngine.tempDrawingLayer.clearLayers();
        const marker = L.marker(latlng, {
          icon: L.divIcon({
            className: "earth-placemark-icon",
            html: `<div class="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.9)] border-2 border-white"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32]
          })
        });
        this.mapEngine.tempDrawingLayer.addLayer(marker);
        this.updateLiveMeasurements();
        this.updateDrawingHint();
        return;
      }

      // 1. Guardar punto en la secuencia de geometría (VITAL para polígonos y rutas)
      this.points.push(latlng);

      const isSub = this.activeTool === "subparroquia";
      const vertexBg = isSub ? "bg-purple-600" : "bg-sky-500";
      const vertexBorder = isSub ? "border-purple-200" : "border-white";
      const vertexIcon = L.divIcon({
        className: "earth-vertex-marker-wrapper",
        html: `<div class="w-5 h-5 ${vertexBg} border-2 ${vertexBorder} rounded-full shadow-[0_0_12px_rgba(255,255,255,0.95)] cursor-move hover:scale-125 active:scale-95 transition flex items-center justify-center text-[10px] font-black text-white leading-none">${this.points.length}</div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker(latlng, {
        draggable: true,
        icon: vertexIcon,
        zIndexOffset: 1000
      });

      // Doble clic sobre cualquier vértice para terminar el trazado de inmediato
      marker.on("dblclick", (ev) => {
        if (ev && ev.originalEvent) {
          try {
            ev.originalEvent.preventDefault();
            ev.originalEvent.stopPropagation();
          } catch(err) {}
        }
        this.finishCurrentDrawing();
      });

      // Evento de arrastre para acomodar vértices en vivo
      marker.on("drag", (ev) => {
        try {
          const newPos = [ev.latlng.lat, ev.latlng.lng];
          const idx = this.vertexMarkers.indexOf(marker);
          if (idx !== -1) {
            this.points[idx] = newPos;
            this.updatePreviewShape();
            this.updateLiveMeasurements();
          }
        } catch(dragErr) {
          console.warn("[ToolsManager] Error arrastrando vértice:", dragErr);
        }
      });

      this.mapEngine.tempDrawingLayer.addLayer(marker);
      this.vertexMarkers.push(marker);

      this.updatePreviewShape();
      this.updateLiveMeasurements();
      this.updateDrawingHint();

      // Feedback en vivo por cada vértice fijado
      if (window.earthApp && typeof window.earthApp.showToast === "function") {
        const pNum = this.points.length;
        if (pNum === 1) {
          window.earthApp.showToast(`📍 Vértice 1 fijado. Haz clic en el siguiente vértice.`, isSub ? "purple" : "sky");
        } else if (pNum === 2) {
          window.earthApp.showToast(`📍 Vértice 2 fijado. Haz clic en el 3er vértice para cerrar el perímetro.`, isSub ? "purple" : "sky");
        } else if (pNum === 3) {
          window.earthApp.showToast(`✅ 3 vértices colocados. Pulsa [Guardar en Parroquia] o haz doble clic.`, isSub ? "purple" : "sky");
        }
      }
    } catch (err) {
      console.error("[ToolsManager] Error en handleMapClick:", err);
    }
  }

  undoLastPoint() {
    if (this.points.length === 0) return;

    this.points.pop();
    const lastMarker = this.vertexMarkers.pop();
    if (lastMarker) {
      this.mapEngine.tempDrawingLayer.removeLayer(lastMarker);
    }

    this.updatePreviewShape();
    this.updateLiveMeasurements();
    this.updateDrawingHint();
  }

  updateDrawingHint() {
    const hint = document.getElementById("earth-drawing-banner-hint");
    if (!hint) return;
    const count = this.points.length;
    if (this.activeTool === "poligono" || this.activeTool === "subparroquia") {
      if (count === 0) {
        hint.textContent = "👉 Haz clic sobre el satélite para colocar el 1er punto";
      } else if (count === 1) {
        hint.textContent = "👉 Haz clic para colocar el 2do punto";
      } else if (count === 2) {
        hint.textContent = "👉 Haz clic en el 3er punto para formar el sector";
      } else {
        hint.textContent = `✅ ${count} puntos colocados. Pulsa [Guardar en Parroquia] o haz doble clic`;
      }
    } else if (this.activeTool === "ruta" || this.activeTool === "regla") {
      if (count === 0) {
        hint.textContent = "👉 Haz clic para iniciar el trazado de la calle";
      } else if (count === 1) {
        hint.textContent = "👉 Haz clic para continuar el trazado de la vía";
      } else {
        hint.textContent = `✅ ${count} puntos. Pulsa [Guardar en Parroquia] o haz doble clic`;
      }
    } else if (this.activeTool === "marca") {
      hint.textContent = count > 0 ? "✅ Marca colocada. Pulsa [Guardar en Parroquia]" : "👉 Haz clic en el lugar exacto del satélite donde colocar la marca";
    }
  }

  updatePreviewShape() {
    try {
      const isSub = this.activeTool === "subparroquia";
      const strokeColor = isSub ? "#c084fc" : "#38bdf8";
      const fillColor = isSub ? "#a855f7" : "#0284c7";

      if (this.activeTool === "poligono" || this.activeTool === "subparroquia") {
        if (this.points.length === 2) {
          if (this.previewShape && this.previewShapeType !== "line") {
            this.mapEngine.tempDrawingLayer.removeLayer(this.previewShape);
            this.previewShape = null;
          }
          if (this.previewShape) {
            this.previewShape.setLatLngs(this.points);
          } else {
            this.previewShape = L.polyline(this.points, {
              color: strokeColor,
              weight: 2,
              dashArray: "5, 5",
              interactive: false
            });
            this.previewShapeType = "line";
            this.mapEngine.tempDrawingLayer.addLayer(this.previewShape);
          }
        } else if (this.points.length >= 3) {
          // Con 3 o más puntos: mostrar polígono cerrado con relleno
          if (this.previewShape && this.previewShapeType !== "polygon") {
            this.mapEngine.tempDrawingLayer.removeLayer(this.previewShape);
            this.previewShape = null;
          }
          if (this.previewShape) {
            this.previewShape.setLatLngs(this.points);
          } else {
            this.previewShape = L.polygon(this.points, {
              color: strokeColor,
              weight: isSub ? 3 : 2.5,
              fillColor: fillColor,
              fillOpacity: isSub ? 0.22 : 0.35,
              dashArray: isSub ? "6, 4" : null,
              interactive: false
            });
            this.previewShapeType = "polygon";
            this.mapEngine.tempDrawingLayer.addLayer(this.previewShape);
          }
        } else if (this.previewShape) {
          this.mapEngine.tempDrawingLayer.removeLayer(this.previewShape);
          this.previewShape = null;
          this.previewShapeType = null;
        }
      } else if (this.activeTool === "ruta" || this.activeTool === "regla") {
        if (this.points.length >= 2) {
          if (this.previewShape && this.previewShapeType !== "route") {
            this.mapEngine.tempDrawingLayer.removeLayer(this.previewShape);
            this.previewShape = null;
          }
          if (this.previewShape) {
            this.previewShape.setLatLngs(this.points);
          } else {
            this.previewShape = L.polyline(this.points, {
              color: this.activeTool === "regla" ? "#f59e0b" : "#10b981",
              weight: 4,
              opacity: 0.95,
              dashArray: this.activeTool === "regla" ? "6, 6" : null,
              interactive: false
            });
            this.previewShapeType = "route";
            this.mapEngine.tempDrawingLayer.addLayer(this.previewShape);
          }
        } else if (this.previewShape) {
          this.mapEngine.tempDrawingLayer.removeLayer(this.previewShape);
          this.previewShape = null;
          this.previewShapeType = null;
        }
      }
    } catch (err) {
      console.warn("[ToolsManager] Error actualizando preview shape:", err);
    }
  }

  updateLiveMeasurements() {
    const meterLabel = document.getElementById("earth-live-measure");
    const subLabel = document.getElementById("earth-live-measure-sub");
    const btnFinish = document.getElementById("btn-banner-finish");

    const compactLabel = document.getElementById("earth-live-measure-compact");

    if (this.activeTool === "poligono" || this.activeTool === "subparroquia") {
      const areaHa = this.calculatePolygonAreaHa(this.points);
      const perimM = this.calculatePerimeterMeters(this.points);
      if (meterLabel) meterLabel.textContent = `${this.points.length} puntos`;
      if (subLabel) subLabel.textContent = `${areaHa} Ha • ${perimM} m`;
      if (compactLabel) compactLabel.textContent = `${this.points.length} pts • ${areaHa} Ha`;

      if (btnFinish) {
        if (this.points.length >= 3) {
          btnFinish.classList.remove("opacity-50", "pointer-events-none");
          btnFinish.classList.add("animate-pulse");
        } else {
          btnFinish.classList.add("opacity-50", "pointer-events-none");
          btnFinish.classList.remove("animate-pulse");
        }
      }
    } else if (this.activeTool === "ruta" || this.activeTool === "regla") {
      const lenM = this.calculatePerimeterMeters(this.points);
      if (meterLabel) meterLabel.textContent = `${this.points.length} puntos`;
      if (subLabel) subLabel.textContent = `${lenM} m (${(lenM / 1000).toFixed(2)} km)`;
      if (compactLabel) compactLabel.textContent = `${this.points.length} pts • ${(lenM / 1000).toFixed(2)} km`;

      if (btnFinish) {
        if (this.points.length >= 2) {
          btnFinish.classList.remove("opacity-50", "pointer-events-none");
          btnFinish.classList.add("animate-pulse");
        } else {
          btnFinish.classList.add("opacity-50", "pointer-events-none");
          btnFinish.classList.remove("animate-pulse");
        }
      }
    } else if (this.activeTool === "marca") {
      if (meterLabel) meterLabel.textContent = `${this.points.length} marca`;
      if (subLabel && this.points.length > 0) {
        subLabel.textContent = `${this.points[0][0].toFixed(5)}, ${this.points[0][1].toFixed(5)}`;
      }
      if (compactLabel) compactLabel.textContent = this.points.length > 0 ? "1 marca" : "0 marcas";
      if (btnFinish) {
        if (this.points.length >= 1) {
          btnFinish.classList.remove("opacity-50", "pointer-events-none");
        } else {
          btnFinish.classList.add("opacity-50", "pointer-events-none");
        }
      }
    }
  }

  cleanPoints(points) {
    if (!points || points.length < 2) return points || [];
    const cleaned = [points[0]];
    for (let i = 1; i < points.length; i++) {
      const prev = cleaned[cleaned.length - 1];
      const cur = points[i];
      // Si la distancia entre dos puntos seguidos es casi cero (< 0.5m), descartar duplicado
      const d = L.latLng(prev[0], prev[1]).distanceTo(L.latLng(cur[0], cur[1]));
      if (d > 0.5) {
        cleaned.push(cur);
      }
    }
    return cleaned;
  }

  finishCurrentDrawing() {
    const sanitizedPoints = this.cleanPoints(this.points);
    const customName = document.getElementById("earth-draw-name-input")?.value?.trim();
    const customMilitantes = parseInt(document.getElementById("earth-draw-militantes")?.value) || 0;
    const customCasas = parseInt(document.getElementById("earth-draw-casas")?.value) || 0;

    if (this.activeTool === "subparroquia") {
      if (sanitizedPoints.length < 3) {
        if (sanitizedPoints.length === 0) {
          this.generateQuickQuadrant();
          return;
        }
        if (window.earthApp?.showToast) {
          window.earthApp.showToast("⚠️ Un eje comunal necesita al menos 3 esquinas para delimitar su perímetro.", "amber");
        }
        return;
      }
      const areaHa = this.calculatePolygonAreaHa(sanitizedPoints);
      const perimetroM = this.calculatePerimeterMeters(sanitizedPoints);
      const newSubParish = {
        id: `SUBPAR-${Date.now()}`,
        nombre: customName || "Nuevo Eje / Sub-Parroquia",
        descripcion: "Eje o Circuito Comunal",
        militantes: customMilitantes,
        casas: customCasas,
        habitantes: customMilitantes,
        familias: customCasas,
        colorBorde: "#c084fc",
        anchoBorde: 2.5,
        colorRelleno: "#a855f7",
        opacidad: 0.2,
        vertices: [...sanitizedPoints],
        areaHa,
        perimetroM,
        visible: true,
        fecha: new Date().toISOString()
      };
      this.cancelActiveTool();
      if (this.onFinishItemCallback) this.onFinishItemCallback("subparroquia", newSubParish);
      return;
    }

    if (this.activeTool === "poligono") {
      if (sanitizedPoints.length < 3) {
        if (sanitizedPoints.length === 0) {
          this.generateQuickQuadrant();
          return;
        }
        if (window.earthApp?.showToast) {
          window.earthApp.showToast("⚠️ Un sector comunal necesita al menos 3 esquinas.", "amber");
        }
        return;
      }
      const areaHa = this.calculatePolygonAreaHa(sanitizedPoints);
      const perimetroM = this.calculatePerimeterMeters(sanitizedPoints);
      const newPoly = {
        id: `POLY-${Date.now()}`,
        nombre: customName || "Nuevo Sector Comunal",
        descripcion: "Comunidad / Consejo Comunal",
        militantes: customMilitantes,
        casas: customCasas,
        habitantes: customMilitantes,
        familias: customCasas,
        colorBorde: "#38bdf8",
        anchoBorde: 2,
        colorRelleno: "#38bdf8",
        opacidad: 0.35,
        vertices: [...sanitizedPoints],
        areaHa,
        perimetroM,
        visible: true,
        fecha: new Date().toISOString()
      };
      this.cancelActiveTool();
      if (this.onFinishItemCallback) this.onFinishItemCallback("poligono", newPoly);
      return;

    } else if (this.activeTool === "ruta") {
      if (sanitizedPoints.length < 2) {
        if (window.earthApp?.showToast) {
          window.earthApp.showToast("⚠️ Una ruta necesita al menos 2 puntos.", "amber");
        }
        return;
      }
      const longitudM = this.calculatePerimeterMeters(sanitizedPoints);
      const newRoute = {
        id: `ROUTE-${Date.now()}`,
        nombre: customName || "Nueva Calle / Ruta",
        descripcion: "",
        color: "#10b981",
        ancho: 4,
        puntos: [...sanitizedPoints],
        longitudM,
        visible: true,
        fecha: new Date().toISOString()
      };
      this.cancelActiveTool();
      if (this.onFinishItemCallback) this.onFinishItemCallback("ruta", newRoute);
      return;

    } else if (this.activeTool === "marca") {
      if (this.points.length < 1) {
        alert("Haz clic en el satélite para fijar la ubicación del punto.");
        return;
      }
      const newMark = {
        id: `MARK-${Date.now()}`,
        nombre: customName || "Nueva Marca de Posición",
        descripcion: "Punto de Interés",
        lat: this.points[0][0],
        lng: this.points[0][1],
        color: "#ef4444",
        visible: true,
        fecha: new Date().toISOString()
      };
      this.cancelActiveTool();
      if (this.onFinishItemCallback) this.onFinishItemCallback("marca", newMark);
      return;

    } else if (this.activeTool === "regla") {
      this.cancelActiveTool();
    }
  }

  calculatePerimeterMeters(points) {
    let total = 0;
    for (let i = 0; i < points.length - 1; i++) {
      total += L.latLng(points[i][0], points[i][1]).distanceTo(L.latLng(points[i + 1][0], points[i + 1][1]));
    }
    return Math.round(total);
  }

  calculatePolygonAreaHa(points) {
    if (points.length < 3) return 0;
    let area = 0;
    const n = points.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const xi = points[i][1] * 111320 * Math.cos((points[i][0] * Math.PI) / 180);
      const yi = points[i][0] * 110540;
      const xj = points[j][1] * 111320 * Math.cos((points[j][0] * Math.PI) / 180);
      const yj = points[j][0] * 110540;
      area += (xi * yj) - (xj * yi);
    }
    area = Math.abs(area) / 2.0;
    return Math.round((area / 10000) * 10) / 10;
  }
}
