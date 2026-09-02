/**
 * Controlador de Cartografía Leaflet, Capas y Edición en Vivo
 */

export class MapEditor {
  constructor(containerId, onHexagonClickCallback) {
    this.containerId = containerId;
    this.onHexagonClickCallback = onHexagonClickCallback;
    this.map = null;
    
    // Grupos de capas
    this.parishLayer = null;
    this.hexagonsLayer = null;
    this.kmlLayersGroup = null;
    this.drawLayer = null;
    this.drawControl = null;
    
    this.baseLayers = {};
    this.currentBaseLayer = null;

    this.init();
  }

  init() {
    // 1. Capas Base
    const esriSatellite = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19, attribution: "Esri Satellite" }
    );

    const osmStreets = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { maxZoom: 19, attribution: "OpenStreetMap" }
    );

    const cartoLight = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      { maxZoom: 19, attribution: "CartoDB Positron" }
    );

    this.baseLayers = {
      "Satelital (Esri)": esriSatellite,
      "Calles (OpenStreetMap)": osmStreets,
      "Cartográfico Claro": cartoLight
    };

    // Iniciar Mapa centrado en Maturín
    this.map = L.map(this.containerId, {
      center: [9.7469, -63.1812],
      zoom: 14,
      zoomControl: false,
      layers: [esriSatellite]
    });

    // Control de Zoom en esquina superior derecha
    L.control.zoom({ position: "topright" }).addTo(this.map);

    // Control de Capas Base
    L.control.layers(this.baseLayers, null, { position: "topright" }).addTo(this.map);

    // Capas Vectoriales
    this.parishLayer = L.layerGroup().addTo(this.map);
    this.hexagonsLayer = L.layerGroup().addTo(this.map);
    this.kmlLayersGroup = L.layerGroup().addTo(this.map);
    this.drawLayer = L.featureGroup().addTo(this.map);

    // Inicializar Herramientas de Dibujo Leaflet.pm si está disponible
    this.setupDrawingTools();
  }

  setupDrawingTools() {
    if (this.map.pm) {
      this.map.pm.addControls({
        position: "topleft",
        drawMarker: false,
        drawCircleMarker: false,
        drawPolyline: false,
        drawRectangle: true,
        drawPolygon: true,
        drawCircle: false,
        editMode: true,
        dragMode: false,
        cutPolygon: false,
        removalMode: true
      });

      this.map.on("pm:create", (e) => {
        const layer = e.layer;
        layer.setStyle({
          color: "#ec4899",
          weight: 3,
          fillColor: "#ec4899",
          fillOpacity: 0.25
        });
        layer.bindTooltip("Zona Dibujada a Mano", { permanent: false });
        this.drawLayer.addLayer(layer);
      });
    }
  }

  /**
   * Carga y enfoca el polígono perimetral de una parroquia
   */
  setParishBoundary(parishData) {
    this.parishLayer.clearLayers();

    const polygon = L.polygon(parishData.limitePoligono, {
      color: parishData.color || "#f59e0b",
      weight: 3,
      opacity: 0.9,
      fillColor: parishData.color || "#f59e0b",
      fillOpacity: 0.08,
      dashArray: "6, 6"
    });

    polygon.bindTooltip(`<strong>Parroquia ${parishData.nombre}</strong><br>Municipio ${parishData.municipio}`, {
      direction: "center",
      permanent: false,
      className: "parish-tooltip"
    });

    this.parishLayer.addLayer(polygon);

    // Volar con animación suave al área
    this.map.flyToBounds(polygon.getBounds(), {
      padding: [40, 40],
      duration: 1.2
    });
  }

  /**
   * Renderiza la malla de hexágonos generada
   */
  renderHexagons(hexagons, parishColor = "#f59e0b") {
    this.hexagonsLayer.clearLayers();

    hexagons.forEach(hex => {
      const isSelected = hex.activo;
      const fillColor = isSelected ? "#10b981" : parishColor;
      const fillOpacity = isSelected ? 0.45 : 0.15;
      const strokeColor = isSelected ? "#059669" : parishColor;
      const weight = isSelected ? 2.5 : 1.5;

      const hexPolygon = L.polygon(hex.vertices, {
        color: strokeColor,
        weight: weight,
        opacity: 0.85,
        fillColor: fillColor,
        fillOpacity: fillOpacity,
        className: "hex-polygon"
      });

      // Tooltip informativo al pasar el cursor
      hexPolygon.bindTooltip(
        `<div class="text-xs font-mono font-bold">
          <span>${hex.id}</span>
          <span class="block text-[10px] text-slate-400 font-normal">${hex.areaHa} Ha</span>
          <span class="block text-[10px] font-bold ${isSelected ? 'text-emerald-400' : 'text-amber-300'}">
            ${isSelected ? '● ASIGNADO' : '○ DISPONIBLE'}
          </span>
        </div>`,
        { direction: "center", permanent: false, sticky: true }
      );

      // Clic para alternar estado
      hexPolygon.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        hex.activo = !hex.activo;
        this.renderHexagons(hexagons, parishColor);
        if (this.onHexagonClickCallback) {
          this.onHexagonClickCallback(hex);
        }
      });

      this.hexagonsLayer.addLayer(hexPolygon);
    });
  }

  /**
   * Añade geometrías importadas de un archivo KML / KMZ
   */
  addKmlFeatures(features, fileName = "Plano Importado") {
    const kmlGroup = L.featureGroup();

    features.forEach(f => {
      const poly = L.polygon(f.coordenadas, {
        color: "#8b5cf6",
        weight: 3,
        opacity: 0.9,
        fillColor: "#8b5cf6",
        fillOpacity: 0.3
      });

      poly.bindPopup(`
        <div class="p-2 text-xs">
          <strong class="text-slate-900 block font-bold">${f.nombre}</strong>
          <span class="text-slate-500 text-[10px]">Origen: ${fileName}</span>
        </div>
      `);

      kmlGroup.addLayer(poly);
    });

    this.kmlLayersGroup.addLayer(kmlGroup);
    this.map.flyToBounds(kmlGroup.getBounds(), { padding: [50, 50] });
    return kmlGroup;
  }

  clearKmlLayers() {
    this.kmlLayersGroup.clearLayers();
  }

  clearDrawings() {
    this.drawLayer.clearLayers();
  }

  toggleHexagonLayer(show) {
    if (show) {
      this.map.addLayer(this.hexagonsLayer);
    } else {
      this.map.removeLayer(this.hexagonsLayer);
    }
  }
}
