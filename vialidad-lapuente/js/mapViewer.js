/**
 * Visor Cartográfico — Solución a Satélite sin límites y Trazado Tramo a Tramo
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

    this.isDrawingMode = false;
    this.currentDrawingPoints = [];
    this.drawingLine = null;
    this.drawingMarkers = [];

    this.init();
  }

  init() {
    // 1. Google Satélite Híbrido (Tiene fotos de satélite en máxima resolución con calles y nunca queda en blanco)
    const googleHybrid = L.tileLayer(
      "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
      {
        maxZoom: 21,
        maxNativeZoom: 20,
        attribution: "Google Satélite"
      }
    );

    // 2. Esri Satélite con maxNativeZoom: 17 (Previene el error 'Map data not yet available')
    const esriSatellite = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 21,
        maxNativeZoom: 17, // Leaflet reescala automáticamente si pasas del zoom 17, nunca queda gris
        attribution: "Esri Satellite"
      }
    );

    // 3. OpenStreetMap Calles
    const osmStreets = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 20,
        maxNativeZoom: 19,
        attribution: "OpenStreetMap"
      }
    );

    // Centro exacto de La Puente (Maturín)
    this.map = L.map(this.containerId, {
      center: [9.7185, -63.2120],
      zoom: 16,
      maxZoom: 21,
      zoomControl: false,
      layers: [googleHybrid] // Por defecto Google Satélite de alta nitidez
    });

    L.control.zoom({ position: "topright" }).addTo(this.map);
    
    // Control de Capas
    L.control.layers(
      {
        "Satélite Google (Recomendado)": googleHybrid,
        "Satélite Esri": esriSatellite,
        "Mapa de Calles (OSM)": osmStreets
      },
      null,
      { position: "topright" }
    ).addTo(this.map);

    this.tramosLayerGroup = L.layerGroup().addTo(this.map);
    this.drawingLayerGroup = L.layerGroup().addTo(this.map);
    this.userLocationLayer = L.layerGroup().addTo(this.map);

    // Hito de Referencia Sector La Puente
    const hito = L.circleMarker([9.7185, -63.2120], {
      radius: 6,
      fillColor: "#f59e0b",
      color: "#ffffff",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9
    }).bindTooltip("<strong>📍 Sector La Puente</strong>", { permanent: false, direction: "top" });
    this.map.addLayer(hito);

    // Clic en mapa para trazar
    this.map.on("click", (e) => this.handleMapClick(e));
  }

  startDrawing(startPoint = null) {
    this.isDrawingMode = true;
    this.currentDrawingPoints = [];
    this.drawingMarkers = [];
    this.drawingLayerGroup.clearLayers();
    this.drawingLine = null;
    this.map.getContainer().style.cursor = "crosshair";

    // Si viene de continuar el tramo anterior, fijar el primer punto
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
  }

  finishDrawing() {
    if (this.currentDrawingPoints.length < 2) {
      alert("Debes marcar al menos dos puntos sobre la calle para guardar el tramo.");
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
      radius: isAnchor ? 7 : 5,
      fillColor: isAnchor ? "#10b981" : "#f59e0b",
      color: "#ffffff",
      weight: 2,
      fillOpacity: 1
    });

    this.drawingLayerGroup.addLayer(marker);
    this.drawingMarkers.push(marker);

    if (this.drawingLine) {
      this.drawingLine.setLatLngs(this.currentDrawingPoints);
    } else if (this.currentDrawingPoints.length > 1) {
      this.drawingLine = L.polyline(this.currentDrawingPoints, {
        color: "#f59e0b",
        weight: 6,
        dashArray: "6, 8",
        opacity: 0.95,
        smoothFactor: 0
      });
      this.drawingLayerGroup.addLayer(this.drawingLine);
    }

    // Actualizar contador en vivo si existe
    const liveCounter = document.getElementById("live-drawing-length");
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

      // Casing para contraste
      const casing = L.polyline(t.puntos, {
        color: "#0f172a",
        weight: 10,
        opacity: 0.9,
        lineCap: "round",
        lineJoin: "round",
        smoothFactor: 0
      });

      // Línea con su color asignado (smoothFactor: 0 para evitar distorsión en zoom)
      const line = L.polyline(t.puntos, {
        color: color,
        weight: 6,
        opacity: 1,
        lineCap: "round",
        lineJoin: "round",
        smoothFactor: 0,
        className: "tramo-user-line"
      });

      // Puntos inicial y final del tramo para visualización clara de esquinas
      const startDot = L.circleMarker(t.puntos[0], {
        radius: 4,
        fillColor: color,
        color: "#ffffff",
        weight: 1.5,
        fillOpacity: 1
      });

      const endDot = L.circleMarker(t.puntos[t.puntos.length - 1], {
        radius: 4,
        fillColor: color,
        color: "#ffffff",
        weight: 1.5,
        fillOpacity: 1
      });

      const tooltipContent = `
        <div class="p-1 text-xs">
          <strong class="text-white block font-bold">${t.nombre}</strong>
          <span class="text-[10px] font-mono text-slate-300">${t.longitudM} metros</span>
          <span class="block text-[10px] font-bold mt-0.5" style="color: ${color}">● Estado: ${t.color.toUpperCase()}</span>
          ${t.detalle ? `<p class="text-[10px] text-slate-400 mt-0.5 italic">${t.detalle}</p>` : ''}
          ${t.foto ? `<p class="text-[10px] text-amber-300 font-bold mt-0.5">📷 Con foto adjunta</p>` : ''}
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

      const group = L.featureGroup([casing, line, startDot, endDot]);
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
    this.map.setView([lat, lng], 18, { animate: true });
  }
}
