/**
 * Motor Cartográfico Especializado en LÍNEAS y TRAMOS VIALES — Atlas Monagas
 * Cero polígonos internos. Renderizado en HTML5 Canvas GPU.
 */

export class AtlasMapEngine {
  constructor(containerId, onFinishDrawingCallback, onSelectLineCallback) {
    this.containerId = containerId;
    this.onFinishDrawingCallback = onFinishDrawingCallback;
    this.onSelectLineCallback = onSelectLineCallback;

    this.map = null;
    this.canvasRenderer = null;
    this.boundaryLayer = null;
    this.linesLayerGroup = null;
    this.drawingLayerGroup = null;

    this.isDrawingMode = false;
    this.currentDrawingPoints = [];
    this.drawingLine = null;
    this.drawingMarkers = [];

    this.init();
  }

  init() {
    this.canvasRenderer = L.canvas({ padding: 0.5, tolerance: 14 });

    const googleHybrid = L.tileLayer(
      "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
      { maxZoom: 21, maxNativeZoom: 20, attribution: "Google Satélite" }
    );

    const esriSatellite = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 21, maxNativeZoom: 17, attribution: "Esri Satellite" }
    );

    const osmStreets = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { maxZoom: 20, maxNativeZoom: 19, attribution: "OpenStreetMap" }
    );

    this.map = L.map(this.containerId, {
      center: [9.7469, -63.1812],
      zoom: 13,
      preferCanvas: true,
      renderer: this.canvasRenderer,
      zoomSnap: 1,
      zoomDelta: 1,
      zoomAnimation: true,
      zoomControl: false,
      layers: [googleHybrid]
    });

    // Controles separados para evitar cualquier colisión en móviles y laptops
    L.control.zoom({ position: "bottomleft" }).addTo(this.map);
    L.control.layers(
      { "Satélite Google": googleHybrid, "Satélite Esri": esriSatellite, "Calles OSM": osmStreets },
      null,
      { position: "topleft" }
    ).addTo(this.map);

    this.boundaryLayer = L.layerGroup().addTo(this.map);
    this.linesLayerGroup = L.layerGroup().addTo(this.map);
    this.drawingLayerGroup = L.layerGroup().addTo(this.map);

    this.map.on("click", (e) => this.handleMapClick(e));
  }

  loadParish(parish, savedLines = []) {
    // 1. Mostrar únicamente el borde perimetral sutil de la parroquia
    this.boundaryLayer.clearLayers();
    const boundaryPoly = L.polygon(parish.limite, {
      color: "#ffffff",
      weight: 3,
      opacity: 0.85,
      fill: false,
      dashArray: "8, 6",
      renderer: this.canvasRenderer
    });
    this.boundaryLayer.addLayer(boundaryPoly);

    this.map.flyToBounds(boundaryPoly.getBounds(), { padding: [40, 40], duration: 1.0 });

    // 2. Renderizar únicamente las LÍNEAS de calles
    this.renderLines(savedLines);
  }

  startDrawing(startPoint = null) {
    this.isDrawingMode = true;
    this.currentDrawingPoints = [];
    this.drawingMarkers = [];
    this.drawingLayerGroup.clearLayers();
    this.drawingLine = null;
    this.map.getContainer().style.cursor = "crosshair";

    if (startPoint && Array.isArray(startPoint)) {
      this.addDrawingPoint(startPoint, true);
    }
  }

  cancelDrawing() {
    this.isDrawingMode = false;
    this.currentDrawingPoints = [];
    this.drawingMarkers = [];
    this.drawingLayerGroup.clearLayers();
    this.drawingLine = null;
    this.map.getContainer().style.cursor = "";
  }

  undoLastPoint() {
    if (this.currentDrawingPoints.length === 0) return;

    this.currentDrawingPoints.pop();
    const lastMarker = this.drawingMarkers.pop();
    if (lastMarker) {
      this.drawingLayerGroup.removeLayer(lastMarker);
    }

    if (this.drawingLine) {
      if (this.currentDrawingPoints.length > 0) {
        this.drawingLine.setLatLngs(this.currentDrawingPoints);
      } else {
        this.drawingLayerGroup.removeLayer(this.drawingLine);
        this.drawingLine = null;
      }
    }

    const liveCounter = document.getElementById("live-drawing-meters");
    if (liveCounter) {
      const len = this.calculateLengthMeters(this.currentDrawingPoints);
      liveCounter.textContent = `${len} m`;
    }
  }

  finishDrawing() {
    if (this.currentDrawingPoints.length < 2) {
      alert("Debes marcar al menos dos puntos sobre la calle para trazar la línea.");
      return null;
    }

    const points = [...this.currentDrawingPoints];
    const longitudM = this.calculateLengthMeters(points);

    this.isDrawingMode = false;
    this.map.getContainer().style.cursor = "";
    this.drawingLayerGroup.clearLayers();
    this.drawingLine = null;

    if (this.onFinishDrawingCallback) {
      this.onFinishDrawingCallback(points, longitudM);
    }
    return { points, longitudM };
  }

  handleMapClick(e) {
    if (!this.isDrawingMode) return;
    this.addDrawingPoint([e.latlng.lat, e.latlng.lng]);
  }

  addDrawingPoint(latlng, isAnchor = false) {
    this.currentDrawingPoints.push(latlng);

    const marker = L.circleMarker(latlng, {
      radius: isAnchor ? 6 : 4,
      fillColor: isAnchor ? "#10b981" : "#f59e0b",
      color: "#ffffff",
      weight: 1.5,
      fillOpacity: 1,
      renderer: this.canvasRenderer
    });

    this.drawingLayerGroup.addLayer(marker);
    this.drawingMarkers.push(marker);

    if (this.drawingLine) {
      this.drawingLine.setLatLngs(this.currentDrawingPoints);
    } else if (this.currentDrawingPoints.length > 1) {
      this.drawingLine = L.polyline(this.currentDrawingPoints, {
        color: "#f59e0b",
        weight: 6,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round",
        dashArray: "6, 8",
        renderer: this.canvasRenderer
      });
      this.drawingLayerGroup.addLayer(this.drawingLine);
    }

    const liveCounter = document.getElementById("live-drawing-meters");
    if (liveCounter) {
      const len = this.calculateLengthMeters(this.currentDrawingPoints);
      liveCounter.textContent = `${len} m`;
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

  renderLines(lines) {
    this.linesLayerGroup.clearLayers();

    const colorMap = {
      verde: "#10b981",
      amarillo: "#f59e0b",
      naranja: "#f97316",
      rojo: "#ef4444"
    };

    lines.forEach(lineData => {
      const color = colorMap[lineData.color] || "#64748b";

      // Casing oscuro para que resalte sobre el satélite
      const casing = L.polyline(lineData.puntos, {
        color: "#090d16",
        weight: 9,
        opacity: 0.8,
        lineCap: "round",
        lineJoin: "round",
        renderer: this.canvasRenderer
      });

      // Línea principal coloreada
      const line = L.polyline(lineData.puntos, {
        color: color,
        weight: 6,
        opacity: 1,
        lineCap: "round",
        lineJoin: "round",
        renderer: this.canvasRenderer
      });

      const tooltipContent = `
        <div class="p-1 text-xs">
          <strong class="text-white block font-bold">${lineData.nombre}</strong>
          <span class="text-[10px] font-mono text-slate-300">${lineData.longitudM} metros</span>
          <span class="block text-[10px] font-bold mt-0.5" style="color: ${color}">● ${lineData.color.toUpperCase()}</span>
          ${lineData.detalle ? `<p class="text-[10px] text-slate-400 mt-0.5 italic">${lineData.detalle}</p>` : ''}
        </div>
      `;

      line.bindTooltip(tooltipContent, { sticky: true, className: "atlas-tooltip" });

      const handleClick = (e) => {
        L.DomEvent.stopPropagation(e);
        if (this.onSelectLineCallback) {
          this.onSelectLineCallback(lineData);
        }
      };

      casing.on("click", handleClick);
      line.on("click", handleClick);

      const group = L.featureGroup([casing, line]);
      this.linesLayerGroup.addLayer(group);
    });
  }

  focusOn(lat, lng) {
    this.map.setView([lat, lng], 17, { animate: true });
  }

  locateUser() {
    if (!navigator.geolocation) {
      alert("Tu navegador o teléfono no soporta geolocalización GPS.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (this.gpsMarker) {
          this.map.removeLayer(this.gpsMarker);
        }
        this.gpsMarker = L.circleMarker([lat, lng], {
          radius: 8,
          fillColor: "#38bdf8",
          color: "#ffffff",
          weight: 3,
          fillOpacity: 1,
          className: "gps-pulse-dot"
        }).addTo(this.map);
        this.gpsMarker.bindPopup("<strong>📍 Estás aquí</strong>").openPopup();
        this.map.setView([lat, lng], 17, { animate: true });
      },
      (err) => {
        alert("No se pudo obtener la ubicación GPS. Verifica los permisos de ubicación en tu teléfono.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  fitBounds(bounds) {
    this.map.fitBounds(bounds, { padding: [50, 50], duration: 1.0 });
  }
}
