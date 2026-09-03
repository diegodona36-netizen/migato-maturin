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
      btn.classList.toggle("bg-sky-600", isCurrent);
      btn.classList.toggle("text-white", isCurrent);
      btn.classList.toggle("shadow-inner", isCurrent);
    });

    const banner = document.getElementById("earth-drawing-banner");
    const bannerText = document.getElementById("earth-drawing-banner-text");
    const liveMeasure = document.getElementById("earth-live-measure");

    if (toolName) {
      this.map.getContainer().style.cursor = "crosshair";
      if (banner) {
        banner.classList.remove("hidden");
        banner.classList.add("flex");
        if (toolName === "poligono") bannerText.textContent = "Polígono: Toca el mapa para marcar esquinas";
        else if (toolName === "ruta") bannerText.textContent = "Ruta: Toca el mapa a lo largo de la calle";
        else if (toolName === "marca") bannerText.textContent = "Marca: Toca donde colocar el marcador";
        else if (toolName === "regla") bannerText.textContent = "Regla: Toca para medir distancias";
      }
      if (liveMeasure) liveMeasure.textContent = "0 puntos";
    } else {
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

    document.querySelectorAll(".btn-earth-tool").forEach(btn => {
      btn.classList.remove("bg-sky-600", "text-white", "shadow-inner");
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
  }

  updatePreviewShape() {
    if (this.activeTool === "poligono") {
      if (this.points.length >= 2) {
        if (this.previewShape) {
          this.previewShape.setLatLngs(this.points);
        } else {
          this.previewShape = L.polygon(this.points, {
            color: "#38bdf8",
            weight: 2.5,
            fillColor: "#38bdf8",
            fillOpacity: 0.35,
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

    if (this.activeTool === "poligono" && this.points.length >= 3) {
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
    if (this.activeTool === "poligono") {
      if (this.points.length < 3) {
        alert("Un polígono necesita al menos 3 esquinas para formar un sector.");
        return;
      }
      const areaHa = this.calculatePolygonAreaHa(this.points);
      const perimetroM = this.calculatePerimeterMeters(this.points);
      const newPoly = {
        id: `POLY-${Date.now()}`,
        nombre: "Nuevo Sector / Polígono",
        descripcion: "",
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
