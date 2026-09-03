/**
 * Motor Cartográfico y Generador de Cuadrantes — Atlas Monagas
 */

export class AtlasMapEngine {
  constructor(containerId, onSelectPolygonCallback) {
    this.containerId = containerId;
    this.onSelectPolygonCallback = onSelectPolygonCallback;

    this.map = null;
    this.canvasRenderer = null;
    this.boundaryLayer = null;
    this.polygonLayer = null;
    this.customDrawLayer = null;

    this.currentParish = null;
    this.poligonos = [];

    this.init();
  }

  init() {
    this.canvasRenderer = L.canvas({ padding: 0.5, tolerance: 12 });

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

    L.control.zoom({ position: "topright" }).addTo(this.map);
    L.control.layers(
      { "Satélite Google": googleHybrid, "Satélite Esri": esriSatellite, "Calles OSM": osmStreets },
      null,
      { position: "topright" }
    ).addTo(this.map);

    this.boundaryLayer = L.layerGroup().addTo(this.map);
    this.polygonLayer = L.layerGroup().addTo(this.map);
    this.customDrawLayer = L.layerGroup().addTo(this.map);
  }

  loadParish(parish, savedPolygons = []) {
    this.currentParish = parish;
    this.poligonos = [...savedPolygons];

    // 1. Dibujar Límite Oficial Parroquial
    this.boundaryLayer.clearLayers();
    const boundaryPoly = L.polygon(parish.limite, {
      color: "#ffffff",
      weight: 3.5,
      opacity: 0.95,
      fillColor: "#38bdf8",
      fillOpacity: 0.05,
      dashArray: "8, 6",
      renderer: this.canvasRenderer
    });
    this.boundaryLayer.addLayer(boundaryPoly);

    // Centrar mapa
    this.map.flyToBounds(boundaryPoly.getBounds(), { padding: [40, 40], duration: 1.0 });

    // Si ya hay polígonos guardados, renderizarlos; si no, generar cuadrícula automática inicial
    if (this.poligonos.length > 0) {
      this.renderPolygons();
    } else {
      this.generateAutomaticGrid(600); // 600m estándar
    }
  }

  generateAutomaticGrid(radiusM = 600) {
    if (!this.currentParish) return;

    const bounds = this.getBounds(this.currentParish.limite);
    const centerLat = (bounds.minLat + bounds.maxLat) / 2;

    const latMeters = 111320;
    const lngMeters = 111320 * Math.cos((centerLat * Math.PI) / 180);

    const dx = (Math.sqrt(3) * radiusM) / lngMeters;
    const dy = (1.5 * radiusM) / latMeters;

    this.poligonos = [];
    let counter = 1;
    let row = 0;

    for (let lat = bounds.minLat - 0.003; lat <= bounds.maxLat + 0.003; lat += dy) {
      const offsetLng = (row % 2 === 1) ? (dx / 2) : 0;
      for (let lng = bounds.minLng - 0.003 + offsetLng; lng <= bounds.maxLng + 0.003 + offsetLng; lng += dx) {
        const center = [lat, lng];
        const vertices = this.getHexVertices(lat, lng, radiusM);

        if (this.isPointInPoly(center, this.currentParish.limite)) {
          const areaHa = Math.round((Math.PI * Math.pow(radiusM, 2) * 0.82699) / 10000 * 10) / 10;
          this.poligonos.push({
            id: `${this.currentParish.codigo}-C${String(counter).padStart(2, "0")}`,
            center: center,
            vertices: vertices,
            areaHa: areaHa,
            estado: "disponible", // disponible, en_despliegue, cubierto, alerta
            responsable: "",
            telefono: "",
            sector: "",
            observaciones: ""
          });
          counter++;
        }
      }
      row++;
    }

    this.renderPolygons();
  }

  renderPolygons() {
    this.polygonLayer.clearLayers();

    const colorMap = {
      cubierto: { fill: "#10b981", stroke: "#047857", opacity: 0.55 },
      en_despliegue: { fill: "#f59e0b", stroke: "#b45309", opacity: 0.5 },
      alerta: { fill: "#ef4444", stroke: "#b91c1c", opacity: 0.6 },
      disponible: { fill: "#0284c7", stroke: "#38bdf8", opacity: 0.2 }
    };

    this.poligonos.forEach(poly => {
      const cfg = colorMap[poly.estado] || colorMap.disponible;

      const pLayer = L.polygon(poly.vertices, {
        color: cfg.stroke,
        weight: 1.5,
        fillColor: cfg.fill,
        fillOpacity: cfg.opacity,
        renderer: this.canvasRenderer
      });

      const estadoLabel = poly.estado === "cubierto" ? "🟢 CUBIERTO" :
        (poly.estado === "en_despliegue" ? "🟡 EN DESPLIEGUE" :
        (poly.estado === "alerta" ? "🔴 ALERTA / SIN CONTACTO" : "⚪ DISPONIBLE"));

      pLayer.bindTooltip(`
        <div class="p-1 text-xs font-mono">
          <strong class="text-white block font-bold">${poly.id}</strong>
          <span class="text-[10px] text-slate-300 font-normal">${poly.areaHa} Ha • ${poly.responsable || "Sin asignar"}</span>
          <div class="text-[10px] font-bold mt-0.5">${estadoLabel}</div>
        </div>
      `, { sticky: true, className: "atlas-tooltip" });

      pLayer.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        if (this.onSelectPolygonCallback) {
          this.onSelectPolygonCallback(poly);
        }
      });

      this.polygonLayer.addLayer(pLayer);
    });
  }

  getHexVertices(lat, lng, radiusM) {
    const latMeters = 111320;
    const lngMeters = 111320 * Math.cos((lat * Math.PI) / 180);
    const vertices = [];

    for (let i = 0; i < 6; i++) {
      const angle = (60 * i + 30) * Math.PI / 180;
      const dLat = (radiusM * Math.sin(angle)) / latMeters;
      const dLng = (radiusM * Math.cos(angle)) / lngMeters;
      vertices.push([lat + dLat, lng + dLng]);
    }
    vertices.push(vertices[0]);
    return vertices;
  }

  isPointInPoly(pt, poly) {
    const x = pt[1], y = pt[0];
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][1], yi = poly[i][0];
      const xj = poly[j][1], yj = poly[j][0];
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  getBounds(poly) {
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    poly.forEach(([lat, lng]) => {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    });
    return { minLat, minLng, maxLat, maxLng };
  }
}
