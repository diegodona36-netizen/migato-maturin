/**
 * Administrador de Herramientas de Dibujo y Geoprocesamiento — Google Earth Pro Web
 */

export class ToolsManager {
  constructor(mapEngine, onFinishItemCallback) {
    this.mapEngine = mapEngine;
    this.map = mapEngine.map;
    this.onFinishItemCallback = onFinishItemCallback;

    this.activeTool = null; // 'poligono', 'ruta', 'marca', 'regla'
    this.points = [];
    this.drawingLayers = [];
    this.previewShape = null;

    this.initMapEvents();
  }

  initMapEvents() {
    this.map.on("click", (e) => this.handleMapClick(e));
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

    if (toolName) {
      this.map.getContainer().style.cursor = "crosshair";
      if (banner) {
        banner.classList.remove("hidden");
        banner.classList.add("flex");
        if (toolName === "poligono") bannerText.textContent = "Dibujando Polígono: Haz clics en el mapa para marcar los vértices.";
        else if (toolName === "ruta") bannerText.textContent = "Dibujando Ruta / Calle: Haz clics a lo largo de la vía.";
        else if (toolName === "marca") bannerText.textContent = "Marca de Posición: Haz un clic donde deseas colocar el marcador.";
        else if (toolName === "regla") bannerText.textContent = "Regla de Medición: Haz clics para medir distancias.";
      }
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

    this.points.push(latlng);

    // Dibujar vértice
    const marker = L.circleMarker(latlng, {
      radius: 4,
      fillColor: "#38bdf8",
      color: "#ffffff",
      weight: 1.5,
      fillOpacity: 1,
      renderer: this.mapEngine.canvasRenderer
    });
    this.mapEngine.tempDrawingLayer.addLayer(marker);

    // Actualizar previsualización
    if (this.activeTool === "poligono" && this.points.length >= 2) {
      if (this.previewShape) {
        this.previewShape.setLatLngs(this.points);
      } else {
        this.previewShape = L.polygon(this.points, {
          color: "#38bdf8",
          weight: 2,
          fillColor: "#38bdf8",
          fillOpacity: 0.35,
          renderer: this.mapEngine.canvasRenderer
        });
        this.mapEngine.tempDrawingLayer.addLayer(this.previewShape);
      }
    } else if (this.activeTool === "ruta" && this.points.length >= 2) {
      if (this.previewShape) {
        this.previewShape.setLatLngs(this.points);
      } else {
        this.previewShape = L.polyline(this.points, {
          color: "#10b981",
          weight: 4,
          opacity: 0.95,
          renderer: this.mapEngine.canvasRenderer
        });
        this.mapEngine.tempDrawingLayer.addLayer(this.previewShape);
      }
    }

    this.updateLiveMeasurements();
  }

  updateLiveMeasurements() {
    const meterLabel = document.getElementById("earth-live-measure");
    if (!meterLabel) return;

    if (this.activeTool === "poligono" && this.points.length >= 3) {
      const areaHa = this.calculatePolygonAreaHa(this.points);
      const perimM = this.calculatePerimeterMeters(this.points);
      meterLabel.textContent = `Área: ${areaHa} Ha | Perímetro: ${perimM} m`;
    } else if (this.activeTool === "ruta" && this.points.length >= 2) {
      const lenM = this.calculatePerimeterMeters(this.points);
      meterLabel.textContent = `Longitud: ${lenM} m (${(lenM / 1000).toFixed(2)} km)`;
    } else {
      meterLabel.textContent = `${this.points.length} puntos marcados`;
    }
  }

  finishCurrentDrawing() {
    if (this.activeTool === "poligono") {
      if (this.points.length < 3) {
        alert("Un polígono necesita al menos 3 puntos para delimitar un área.");
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
    // Proyección mercator aproximada para área
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
    return Math.round((area / 10000) * 10) / 10; // Hectáreas con 1 decimal
  }
}
