/**
 * Motor Cartográfico Acelerado por GPU — Google Earth Pro Web (Monagas)
 */

export class EarthMapEngine {
  constructor(containerId, onCoordUpdate) {
    this.containerId = containerId;
    this.onCoordUpdate = onCoordUpdate;

    this.map = null;
    this.canvasRenderer = null;

    // Capas
    this.boundaryLayer = null;
    this.polygonsLayer = null;
    this.routesLayer = null;
    this.placemarksLayer = null;
    this.overlayLayer = null;
    this.tempDrawingLayer = null;

    this.init();
  }

  init() {
    this.canvasRenderer = L.canvas({ padding: 0.5, tolerance: 12 });

    const googleHybrid = L.tileLayer(
      "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
      { maxZoom: 21, maxNativeZoom: 20, attribution: "Google Satélite Híbrido" }
    );

    const esriSatellite = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 21, maxNativeZoom: 17, attribution: "Esri World Imagery" }
    );

    const osmStreets = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { maxZoom: 20, maxNativeZoom: 19, attribution: "OpenStreetMap" }
    );

    this.map = L.map(this.containerId, {
      center: [9.7469, -63.1812], // Maturín
      zoom: 13,
      preferCanvas: true,
      renderer: this.canvasRenderer,
      zoomSnap: 1,
      zoomDelta: 1,
      zoomAnimation: true,
      zoomControl: false,
      layers: [googleHybrid]
    });

    // Control de capas clásico
    L.control.layers(
      { "Satélite Google (Híbrido)": googleHybrid, "Satélite Esri": esriSatellite, "Calles OSM": osmStreets },
      null,
      { position: "topright" }
    ).addTo(this.map);

    // Grupos de capas
    this.boundaryLayer = L.layerGroup().addTo(this.map);
    this.polygonsLayer = L.layerGroup().addTo(this.map);
    this.routesLayer = L.layerGroup().addTo(this.map);
    this.placemarksLayer = L.layerGroup().addTo(this.map);
    this.overlayLayer = L.layerGroup().addTo(this.map);
    this.tempDrawingLayer = L.layerGroup().addTo(this.map);

    // Seguimiento dinámico de coordenadas en la barra de estado
    this.map.on("mousemove", (e) => {
      if (this.onCoordUpdate) {
        this.onCoordUpdate(e.latlng.lat, e.latlng.lng, this.getEyeAltitude());
      }
    });

    this.map.on("zoomend", () => {
      const center = this.map.getCenter();
      if (this.onCoordUpdate) {
        this.onCoordUpdate(center.lat, center.lng, this.getEyeAltitude());
      }
    });
  }

  getEyeAltitude() {
    // Estimación de la altitud visual de Google Earth según el nivel de zoom
    const z = this.map.getZoom();
    const altMap = {
      20: "120 m", 19: "250 m", 18: "500 m", 17: "1.0 km",
      16: "2.1 km", 15: "4.2 km", 14: "8.5 km", 13: "17 km",
      12: "35 km", 11: "70 km", 10: "140 km", 9: "280 km"
    };
    return altMap[z] || `${Math.round(40000 / Math.pow(2, z - 8))} km`;
  }

  flyTo(lat, lng, zoom = 14) {
    this.map.flyTo([lat, lng], zoom, { duration: 1.2 });
  }

  fitBounds(bounds) {
    this.map.flyToBounds(bounds, { padding: [50, 50], duration: 1.0 });
  }

  showParishBoundary(limite) {
    this.boundaryLayer.clearLayers();
    if (!limite || limite.length === 0) return;

    const bPoly = L.polygon(limite, {
      color: "#ffffff",
      weight: 2.5,
      opacity: 0.9,
      fill: false,
      dashArray: "8, 6",
      interactive: false,
      renderer: this.canvasRenderer
    });

    this.boundaryLayer.addLayer(bPoly);
    this.map.flyToBounds(bPoly.getBounds(), { padding: [40, 40], duration: 1.0 });
  }

  renderParishItems(parish, onSelectCallback) {
    this.polygonsLayer.clearLayers();
    this.routesLayer.clearLayers();
    this.placemarksLayer.clearLayers();

    if (!parish) return;

    // 1. Polígonos de Sectores
    (parish.poligonos || []).forEach(poly => {
      if (poly.visible === false) return;

      const pLayer = L.polygon(poly.vertices, {
        color: poly.colorBorde || "#38bdf8",
        weight: poly.anchoBorde || 2,
        opacity: 0.95,
        fillColor: poly.colorRelleno || "#38bdf8",
        fillOpacity: poly.opacidad !== undefined ? poly.opacidad : 0.35,
        renderer: this.canvasRenderer
      });

      pLayer.bindTooltip(`
        <div class="p-1 font-mono text-xs">
          <strong class="text-white block font-bold">${poly.nombre}</strong>
          <span class="text-[10px] text-sky-300">Área: ${poly.areaHa || 0} Ha • Per: ${poly.perimetroM || 0} m</span>
          ${poly.descripcion ? `<p class="text-[10px] text-slate-300 mt-0.5">${poly.descripcion}</p>` : ''}
        </div>
      `, { sticky: true, className: "earth-tooltip" });

      pLayer.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        if (onSelectCallback) onSelectCallback("poligono", poly);
      });

      this.polygonsLayer.addLayer(pLayer);
    });

    // 2. Rutas / Calles
    (parish.rutas || []).forEach(r => {
      if (r.visible === false) return;

      // Casing
      const casing = L.polyline(r.puntos, {
        color: "#0f172a",
        weight: (r.ancho || 4) + 3,
        opacity: 0.8,
        lineCap: "round",
        lineJoin: "round",
        renderer: this.canvasRenderer
      });

      // Línea central
      const line = L.polyline(r.puntos, {
        color: r.color || "#10b981",
        weight: r.ancho || 4,
        opacity: 1,
        lineCap: "round",
        lineJoin: "round",
        renderer: this.canvasRenderer
      });

      line.bindTooltip(`
        <div class="p-1 font-mono text-xs">
          <strong class="text-white block font-bold">${r.nombre}</strong>
          <span class="text-[10px] text-emerald-300">Longitud: ${r.longitudM || 0} m</span>
          ${r.descripcion ? `<p class="text-[10px] text-slate-300 mt-0.5">${r.descripcion}</p>` : ''}
        </div>
      `, { sticky: true, className: "earth-tooltip" });

      const handleClick = (e) => {
        L.DomEvent.stopPropagation(e);
        if (onSelectCallback) onSelectCallback("ruta", r);
      };

      casing.on("click", handleClick);
      line.on("click", handleClick);

      const group = L.featureGroup([casing, line]);
      this.routesLayer.addLayer(group);
    });

    // 3. Marcas de Posición / Placemarks
    (parish.marcas || []).forEach(m => {
      if (m.visible === false) return;

      const marker = L.circleMarker([m.lat, m.lng], {
        radius: 7,
        fillColor: m.color || "#e11d48",
        color: "#ffffff",
        weight: 2,
        fillOpacity: 1,
        renderer: this.canvasRenderer
      });

      marker.bindTooltip(`<strong>${m.nombre}</strong><br><span class="text-[10px]">${m.descripcion || ''}</span>`, {
        sticky: true,
        className: "earth-tooltip"
      });

      marker.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        if (onSelectCallback) onSelectCallback("marca", m);
      });

      this.placemarksLayer.addLayer(marker);
    });
  }

  // Superposición de imagen (Image Overlay)
  addImageOverlay(url, bounds, opacity = 0.65) {
    this.overlayLayer.clearLayers();
    const overlay = L.imageOverlay(url, bounds, { opacity: opacity }).addTo(this.overlayLayer);
    this.map.fitBounds(bounds);
    return overlay;
  }
}
