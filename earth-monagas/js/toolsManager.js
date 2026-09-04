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
    this.cancelActiveTool();
    this.activeTool = toolName;

    // Actualizar botones de toolbar
    document.querySelectorAll(".btn-earth-tool").forEach(btn => {
      const isCurrent = btn.dataset.tool === toolName;
      btn.classList.toggle("active-tool", isCurrent);
    });

    const banner = document.getElementById("earth-drawing-banner");
    const bannerText = document.getElementById("earth-drawing-banner-text");
    const liveMeasure = document.getElementById("earth-live-measure");

    const mobileBar = document.getElementById("mobile-field-actions");
    if (toolName) {
      if (mobileBar) mobileBar.classList.add("hidden");
      this.map.getContainer().style.cursor = "crosshair";
      if (this.map && this.map.doubleClickZoom) {
        this.map.doubleClickZoom.disable();
      }
      if (this.mapEngine && typeof this.mapEngine.setDrawingMode === "function") {
        this.mapEngine.setDrawingMode(true);
      }
      if (banner) {
        banner.classList.remove("hidden");
        banner.classList.add("flex");
        const parishName = window.earthApp?.store?.getParish(window.earthApp?.selectedMunId, window.earthApp?.selectedParishId)?.nombre || "";
        const parishSuffix = parishName ? ` (${parishName})` : "";
        const activeSp = window.earthApp?.activeSubParroquiaId ? 
          window.earthApp?.store?.getParish(window.earthApp?.selectedMunId, window.earthApp?.selectedParishId)?.subparroquias?.find(s => String(s.id) === String(window.earthApp?.activeSubParroquiaId)) : null;
        const spContext = activeSp ? ` (en ${activeSp.nombre})` : parishSuffix;
        if (toolName === "subparroquia") bannerText.textContent = `Trazando Sub-Parroquia / Eje Comunal${parishSuffix}`;
        else if (toolName === "poligono") bannerText.textContent = `Trazando Sector Comunal / Militancia${spContext}`;
        else if (toolName === "ruta") bannerText.textContent = `Trazando Ruta / Calle${parishSuffix}`;
        else if (toolName === "marca") bannerText.textContent = `Colocar Marca${parishSuffix}`;
        else if (toolName === "regla") bannerText.textContent = "Regla: Haz clics para medir distancias";
      }
      this.updateDrawingHint();
      if (liveMeasure) liveMeasure.textContent = "0 puntos";
    } else {
      if (this.map && this.map.doubleClickZoom) {
        this.map.doubleClickZoom.enable();
      }
      if (this.mapEngine && typeof this.mapEngine.setDrawingMode === "function") {
        this.mapEngine.setDrawingMode(false);
      }
      if (mobileBar) mobileBar.classList.remove("hidden");
      this.map.getContainer().style.cursor = "";
      if (banner) {
        banner.classList.add("hidden");
        banner.classList.remove("flex");
      }
    }
  }

  cancelActiveTool() {
    this.activeTool = null;
    this.points = [];
    this.vertexMarkers = [];
    this.mapEngine.tempDrawingLayer.clearLayers();
    this.previewShape = null;

    if (this.map && this.map.doubleClickZoom) {
      this.map.doubleClickZoom.enable();
    }

    if (this.mapEngine && typeof this.mapEngine.setDrawingMode === "function") {
      this.mapEngine.setDrawingMode(false);
    }

    const mobileBar = document.getElementById("mobile-field-actions");
    if (mobileBar) mobileBar.classList.remove("hidden");

    document.querySelectorAll(".btn-earth-tool").forEach(btn => {
      btn.classList.remove("active-tool");
    });

    const banner = document.getElementById("earth-drawing-banner");
    if (banner) {
      banner.classList.add("hidden");
      banner.classList.remove("flex");
    }
    this.map.getContainer().style.cursor = "";
  }

  handleMapClick(e) {
    if (!this.activeTool) return;

    const latlng = [e.latlng.lat, e.latlng.lng];

    if (this.activeTool === "marca") {
      this.createPlacemark(latlng);
      return;
    }

    const pointIndex = this.points.length;
    this.points.push(latlng);

    // Vértice interactivo arrastrable (Draggable Vertex Marker)
    const vertexIcon = L.divIcon({
      className: "earth-vertex-marker-wrapper",
      html: `<div class="w-3.5 h-3.5 bg-sky-400 border-2 border-white rounded-full shadow-lg cursor-move hover:scale-125 active:scale-95 transition"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    const marker = L.marker(latlng, {
      draggable: true,
      icon: vertexIcon,
      zIndexOffset: 1000
    });

    // Evento de arrastre para acomodar vértices en vivo
    marker.on("drag", (ev) => {
      const newPos = [ev.latlng.lat, ev.latlng.lng];
      const idx = this.vertexMarkers.indexOf(marker);
      if (idx !== -1) {
        this.points[idx] = newPos;
        this.updatePreviewShape();
        this.updateLiveMeasurements();
      }
    });

    this.mapEngine.tempDrawingLayer.addLayer(marker);
    this.vertexMarkers.push(marker);

    this.updatePreviewShape();
    this.updateLiveMeasurements();
    this.updateDrawingHint();
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
        hint.textContent = `✅ ${count} puntos colocados. Clic para más esquinas o pulsa [Listo ✅]`;
      }
    } else if (this.activeTool === "ruta" || this.activeTool === "regla") {
      if (count === 0) {
        hint.textContent = "👉 Haz clic para iniciar el trazado de la calle";
      } else if (count === 1) {
        hint.textContent = "👉 Haz clic para continuar el trazado de la vía";
      } else {
        hint.textContent = `✅ ${count} puntos. Clic para continuar o pulsa [Listo ✅]`;
      }
    } else if (this.activeTool === "marca") {
      hint.textContent = "👉 Haz clic en el lugar exacto donde quieres colocar la marca";
    }
  }

  updatePreviewShape() {
    if (this.activeTool === "poligono" || this.activeTool === "subparroquia") {
      const isSub = this.activeTool === "subparroquia";
      const strokeColor = isSub ? "#c084fc" : "#38bdf8";
      const fillColor = isSub ? "#a855f7" : "#38bdf8";
      if (this.points.length >= 2) {
        if (this.previewShape) {
          this.previewShape.setLatLngs(this.points);
        } else {
          this.previewShape = L.polygon(this.points, {
            color: strokeColor,
            weight: isSub ? 3 : 2.5,
            fillColor: fillColor,
            fillOpacity: isSub ? 0.22 : 0.35,
            dashArray: isSub ? "6, 4" : null,
            interactive: false,
            renderer: this.mapEngine.canvasRenderer
          });
          this.mapEngine.tempDrawingLayer.addLayer(this.previewShape);
        }
      } else if (this.previewShape) {
        this.mapEngine.tempDrawingLayer.removeLayer(this.previewShape);
        this.previewShape = null;
      }
    } else if (this.activeTool === "ruta" || this.activeTool === "regla") {
      if (this.points.length >= 2) {
        if (this.previewShape) {
          this.previewShape.setLatLngs(this.points);
        } else {
          this.previewShape = L.polyline(this.points, {
            color: this.activeTool === "regla" ? "#f59e0b" : "#10b981",
            weight: 4,
            opacity: 0.95,
            dashArray: this.activeTool === "regla" ? "6, 6" : null,
            interactive: false,
            renderer: this.mapEngine.canvasRenderer
          });
          this.mapEngine.tempDrawingLayer.addLayer(this.previewShape);
        }
      } else if (this.previewShape) {
        this.mapEngine.tempDrawingLayer.removeLayer(this.previewShape);
        this.previewShape = null;
      }
    }
  }

  updateLiveMeasurements() {
    const meterLabel = document.getElementById("earth-live-measure");
    if (!meterLabel) return;

    if ((this.activeTool === "poligono" || this.activeTool === "subparroquia") && this.points.length >= 3) {
      const areaHa = this.calculatePolygonAreaHa(this.points);
      const perimM = this.calculatePerimeterMeters(this.points);
      meterLabel.textContent = `${areaHa} Ha • ${perimM} m`;
    } else if ((this.activeTool === "ruta" || this.activeTool === "regla") && this.points.length >= 2) {
      const lenM = this.calculatePerimeterMeters(this.points);
      meterLabel.textContent = `${lenM} m (${(lenM / 1000).toFixed(2)} km)`;
    } else {
      meterLabel.textContent = `${this.points.length} puntos`;
    }
  }

  finishCurrentDrawing() {
    if (this.activeTool === "subparroquia") {
      if (this.points.length < 3) {
        alert("Una sub-parroquia necesita al menos 3 esquinas para delimitar su perímetro.");
        return;
      }
      const areaHa = this.calculatePolygonAreaHa(this.points);
      const perimetroM = this.calculatePerimeterMeters(this.points);
      const newSubParish = {
        id: `SUBPAR-${Date.now()}`,
        nombre: "Nuevo Eje / Sub-Parroquia",
        descripcion: "Eje o Circuito Comunal",
        colorBorde: "#c084fc",
        anchoBorde: 2.5,
        colorRelleno: "#a855f7",
        opacidad: 0.2,
        vertices: [...this.points],
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
      if (this.points.length < 3) {
        alert("Un polígono necesita al menos 3 esquinas para formar un sector.");
        return;
      }
      const areaHa = this.calculatePolygonAreaHa(this.points);
      const perimetroM = this.calculatePerimeterMeters(this.points);
      const newPoly = {
        id: `POLY-${Date.now()}`,
        nombre: "Nuevo Sector Comunal",
        descripcion: "Comunidad / Consejo Comunal",
        colorBorde: "#38bdf8",
        anchoBorde: 2,
        colorRelleno: "#38bdf8",
        opacidad: 0.35,
        vertices: [...this.points],
        areaHa,
        perimetroM,
        visible: true,
        fecha: new Date().toISOString()
      };
      this.cancelActiveTool();
      if (this.onFinishItemCallback) this.onFinishItemCallback("poligono", newPoly);

    } else if (this.activeTool === "ruta") {
      if (this.points.length < 2) {
        alert("Una ruta necesita al menos 2 puntos para trazar la vía.");
        return;
      }
      const longitudM = this.calculatePerimeterMeters(this.points);
      const newRoute = {
        id: `ROUTE-${Date.now()}`,
        nombre: "Nueva Calle / Ruta",
        descripcion: "",
        color: "#10b981",
        ancho: 4,
        puntos: [...this.points],
        longitudM,
        visible: true,
        fecha: new Date().toISOString()
      };
      this.cancelActiveTool();
      if (this.onFinishItemCallback) this.onFinishItemCallback("ruta", newRoute);
    } else if (this.activeTool === "regla") {
      this.cancelActiveTool();
    }
  }

  createPlacemark(latlng) {
    const newMark = {
      id: `MARK-${Date.now()}`,
      nombre: "Nueva Marca de Posición",
      descripcion: "",
      lat: latlng[0],
      lng: latlng[1],
      color: "#e11d48",
      visible: true,
      fecha: new Date().toISOString()
    };
    this.cancelActiveTool();
    if (this.onFinishItemCallback) this.onFinishItemCallback("marca", newMark);
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
