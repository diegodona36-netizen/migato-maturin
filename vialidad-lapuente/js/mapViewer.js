/**
 * Visor Cartográfico y Dibujador de Calles Interactivo — La Puente
 */

export class RoadMapViewer {
  constructor(containerId, onFinishDrawingCallback, onSelectTramoCallback) {
    this.containerId = containerId;
    this.onFinishDrawingCallback = onFinishDrawingCallback;
    this.onSelectTramoCallback = onSelectTramoCallback;

    this.map = null;
    this.tramosLayerGroup = null;
    this.drawingLayerGroup = null;
    this.userLocationLayer = null;

    // Estado del modo trazador
    this.isDrawingMode = false;
    this.currentDrawingPoints = [];
    this.drawingLine = null;
    this.drawingMarkers = [];

    this.init();
  }

  init() {
    // Capas Base: Satélite y Calles
    const esriSatellite = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19, attribution: "Esri Satellite" }
    );

    const osmStreets = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { maxZoom: 19, attribution: "OpenStreetMap" }
    );

    // Centro exacto de La Puente (Maturín)
    // Lat: 9.7185, Lng: -63.2120
    this.map = L.map(this.containerId, {
      center: [9.7185, -63.2120],
      zoom: 16,
      zoomControl: false,
      layers: [osmStreets]
    });

    L.control.zoom({ position: "topright" }).addTo(this.map);
    L.control.layers({ "Calles (OSM)": osmStreets, "Satélite (Esri)": esriSatellite }, null, { position: "topright" }).addTo(this.map);

    this.tramosLayerGroup = L.layerGroup().addTo(this.map);
    this.drawingLayerGroup = L.layerGroup().addTo(this.map);
    this.userLocationLayer = L.layerGroup().addTo(this.map);

    // Hito de Referencia: Sector La Puente
    const hitoLaPuente = L.circleMarker([9.7185, -63.2120], {
      radius: 7,
      fillColor: "#f59e0b",
      color: "#ffffff",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.95
    }).bindTooltip("<strong>📍 Sector La Puente</strong>", { permanent: true, direction: "top", offset: [0, -8] });
    this.map.addLayer(hitoLaPuente);

    // Eventos de Clic en el Mapa para Trazar Calles
    this.map.on("click", (e) => this.handleMapClick(e));
  }

  startDrawing() {
    this.isDrawingMode = true;
    this.currentDrawingPoints = [];
    this.drawingMarkers = [];
    this.drawingLayerGroup.clearLayers();
    this.map.getContainer().style.cursor = "crosshair";
  }

  cancelDrawing() {
    this.isDrawingMode = false;
    this.currentDrawingPoints = [];
    this.drawingMarkers = [];
    this.drawingLayerGroup.clearLayers();
    this.map.getContainer().style.cursor = "";
  }

  finishDrawing() {
    if (this.currentDrawingPoints.length < 2) {
      alert("Debes marcar al menos dos puntos sobre la calle para trazar el tramo.");
      return null;
    }

    const points = [...this.currentDrawingPoints];
    const longitudM = this.calculateLengthMeters(points);

    this.isDrawingMode = false;
    this.map.getContainer().style.cursor = "";
    this.drawingLayerGroup.clearLayers();

    if (this.onFinishDrawingCallback) {
      this.onFinishDrawingCallback(points, longitudM);
    }
    return { points, longitudM };
  }

  handleMapClick(e) {
    if (!this.isDrawingMode) return;

    const latlng = [e.latlng.lat, e.latlng.lng];
    this.currentDrawingPoints.push(latlng);

    // Crear marcador en el vértice
    const marker = L.circleMarker(latlng, {
      radius: 5,
      fillColor: "#f59e0b",
      color: "#ffffff",
      weight: 2,
      fillOpacity: 1
    });
    this.drawingLayerGroup.addLayer(marker);
    this.drawingMarkers.push(marker);

    // Dibujar o actualizar línea temporal
    if (this.drawingLine) {
      this.drawingLine.setLatLngs(this.currentDrawingPoints);
    } else {
      this.drawingLine = L.polyline(this.currentDrawingPoints, {
        color: "#f59e0b",
        weight: 6,
        dashArray: "6, 8",
        opacity: 0.95
      });
      this.drawingLayerGroup.addLayer(this.drawingLine);
    }
  }

  calculateLengthMeters(points) {
    let total = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = L.latLng(points[i][0], points[i][1]);
      const p2 = L.latLng(points[i + 1][0], points[i + 1][1]);
      total += p1.distanceTo(p2);
    }
    return Math.round(total);
  }

  renderSavedTramos(tramos) {
    this.tramosLayerGroup.clearLayers();

    const colorMap = {
      verde: "#10b981",
      amarillo: "#f59e0b",
      naranja: "#f97316",
      rojo: "#ef4444"
    };

    tramos.forEach(t => {
      const color = colorMap[t.color] || "#64748b";

      // Casing exterior para visibilidad óptima
      const casing = L.polyline(t.puntos, {
        color: "#0f172a",
        weight: 9,
        opacity: 0.85,
        lineCap: "round",
        lineJoin: "round"
      });

      // Línea principal de color
      const line = L.polyline(t.puntos, {
        color: color,
        weight: 6,
        opacity: 1,
        lineCap: "round",
        lineJoin: "round",
        className: "tramo-user-line"
      });

      const tooltipContent = `
        <div class="p-1 text-xs">
          <strong class="text-white block font-bold">${t.nombre}</strong>
          <span class="text-[10px] font-mono text-slate-300">${t.longitudM} metros</span>
          <span class="block text-[10px] font-bold mt-0.5" style="color: ${color}">● Estado: ${t.color.toUpperCase()}</span>
          ${t.detalle ? `<p class="text-[10px] text-slate-400 mt-1 italic">${t.detalle}</p>` : ''}
          ${t.foto ? `<p class="text-[10px] text-amber-300 font-bold mt-1">📷 Foto de evidencia</p>` : ''}
        </div>
      `;

      line.bindTooltip(tooltipContent, { sticky: true, className: "tramo-tooltip" });

      const handleClick = (e) => {
        L.DomEvent.stopPropagation(e);
        if (this.onSelectTramoCallback) {
          this.onSelectTramoCallback(t);
        }
      };

      casing.on("click", handleClick);
      line.on("click", handleClick);

      const group = L.featureGroup([casing, line]);
      this.tramosLayerGroup.addLayer(group);
    });
  }

  updateUserLocation(lat, lng) {
    this.userLocationLayer.clearLayers();

    const dot = L.circleMarker([lat, lng], {
      radius: 9,
      fillColor: "#38bdf8",
      color: "#ffffff",
      weight: 3,
      opacity: 1,
      fillOpacity: 0.95,
      className: "gps-pulse-dot"
    });

    dot.bindTooltip("<strong>📍 Tu Posición Actual</strong>", { permanent: true, direction: "top" });
    this.userLocationLayer.addLayer(dot);
    this.map.setView([lat, lng], 17, { animate: true });
  }

  focusOn(lat, lng) {
    this.map.setView([lat, lng], 17, { animate: true });
  }
}
