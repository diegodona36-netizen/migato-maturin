/**
 * Visor Cartográfico Leaflet — Carretera Principal de La Puente
 */
import { ESTADOS_VIALES } from "./dataTramos.js";

export class RoadMapViewer {
  constructor(containerId, onSelectTramoCallback) {
    this.containerId = containerId;
    this.onSelectTramoCallback = onSelectTramoCallback;
    this.map = null;
    this.tramosLayerGroup = null;
    this.markersLayerGroup = null;
    this.userLocationLayer = null;
    this.tramoLines = {};
    this.selectedTramoId = null;

    this.init();
  }

  init() {
    const esriSatellite = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19, attribution: "Esri Satellite" }
    );

    const osmStreets = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { maxZoom: 19, attribution: "OpenStreetMap" }
    );

    this.map = L.map(this.containerId, {
      center: [9.7285, -63.2216], // Puente sobre el Caño Los Godos
      zoom: 15,
      zoomControl: false,
      layers: [esriSatellite]
    });

    L.control.zoom({ position: "topright" }).addTo(this.map);
    L.control.layers({ "Satélite (Esri)": esriSatellite, "Calles (OSM)": osmStreets }, null, { position: "topright" }).addTo(this.map);

    this.tramosLayerGroup = L.layerGroup().addTo(this.map);
    this.markersLayerGroup = L.layerGroup().addTo(this.map);
    this.userLocationLayer = L.layerGroup().addTo(this.map);
  }

  renderTramos(tramos, inspectionsData) {
    this.tramosLayerGroup.clearLayers();
    this.tramoLines = {};

    tramos.forEach(tramo => {
      const insp = inspectionsData[tramo.id] || {};
      const estadoId = insp.estado || "sin_inspeccionar";
      const estadoConfig = ESTADOS_VIALES[estadoId] || ESTADOS_VIALES.sin_inspeccionar;
      const isSelected = tramo.id === this.selectedTramoId;

      // Línea de sombra/borde exterior (casing) para resaltar sobre cualquier mapa satelital
      const casing = L.polyline(tramo.coordenadas, {
        color: isSelected ? "#ffffff" : "#0f172a",
        weight: isSelected ? 10 : 8,
        opacity: 0.9,
        lineCap: "round",
        lineJoin: "round"
      });

      // Línea central de color con el estado
      const line = L.polyline(tramo.coordenadas, {
        color: estadoConfig.color,
        weight: isSelected ? 7 : 5,
        opacity: 1,
        lineCap: "round",
        lineJoin: "round",
        className: "tramo-line-interactive"
      });

      // Tooltip informativo
      const fotosCount = (insp.fotos || []).length;
      const tooltipHtml = `
        <div class="p-1 text-xs font-sans">
          <div class="flex items-center justify-between gap-2 border-b border-slate-700 pb-1 mb-1">
            <strong class="text-white font-bold">${tramo.nombre}</strong>
            <span class="text-[9px] font-mono px-1 rounded bg-slate-800 text-slate-300">${tramo.longitudM} m</span>
          </div>
          <p class="text-[11px] font-bold" style="color: ${estadoConfig.color}">● ${estadoConfig.nombre}</p>
          ${fotosCount > 0 ? `<p class="text-[10px] text-amber-300 mt-0.5 font-bold">📷 ${fotosCount} foto(s) de evidencia</p>` : ''}
          <p class="text-[10px] text-slate-400 mt-0.5">Ref: ${tramo.puntosReferencia.join(" • ")}</p>
        </div>
      `;

      line.bindTooltip(tooltipHtml, { sticky: true, className: "tramo-tooltip" });

      // Evento de clic para inspeccionar
      const handleClick = (e) => {
        L.DomEvent.stopPropagation(e);
        this.selectTramo(tramo.id);
        if (this.onSelectTramoCallback) {
          this.onSelectTramoCallback(tramo, insp);
        }
      };

      casing.on("click", handleClick);
      line.on("click", handleClick);

      const group = L.featureGroup([casing, line]);
      this.tramosLayerGroup.addLayer(group);
      this.tramoLines[tramo.id] = { casing, line, tramo };
    });

    // Añadir hitos geográficos de referencia
    this.renderMilestones();
  }

  renderMilestones() {
    this.markersLayerGroup.clearLayers();

    const hitos = [
      { coords: [9.7348, -63.2082], label: "🏁 Inicio: Av. El Ejército / Fundemos", color: "#38bdf8" },
      { coords: [9.7303, -63.2202], label: "🌉 Puente sobre Caño Los Godos", color: "#f59e0b" },
      { coords: [9.7285, -63.2236], label: "🏛️ Plaza Bolívar / Módulo Policial", color: "#a855f7" },
      { coords: [9.7216, -63.2369], label: "📍 Fin: Salida Vía El Furrial", color: "#38bdf8" }
    ];

    hitos.forEach(h => {
      const marker = L.circleMarker(h.coords, {
        radius: 6,
        fillColor: h.color,
        color: "#ffffff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.95
      });

      marker.bindTooltip(`<strong>${h.label}</strong>`, { direction: "top", offset: [0, -6] });
      this.markersLayerGroup.addLayer(marker);
    });
  }

  selectTramo(tramoId) {
    this.selectedTramoId = tramoId;
    Object.keys(this.tramoLines).forEach(id => {
      const item = this.tramoLines[id];
      const isSelected = id === tramoId;
      item.casing.setStyle({
        color: isSelected ? "#ffffff" : "#0f172a",
        weight: isSelected ? 10 : 8
      });
      item.line.setStyle({
        weight: isSelected ? 7 : 5
      });
    });

    if (this.tramoLines[tramoId]) {
      this.map.panTo(this.tramoLines[tramoId].line.getBounds().getCenter(), { animate: true, duration: 0.8 });
    }
  }

  updateUserLocation(lat, lng) {
    this.userLocationLayer.clearLayers();

    const pulseMarker = L.circleMarker([lat, lng], {
      radius: 9,
      fillColor: "#38bdf8",
      color: "#ffffff",
      weight: 3,
      opacity: 1,
      fillOpacity: 0.9,
      className: "gps-pulse-dot"
    });

    pulseMarker.bindTooltip("<strong>📍 Tu Ubicación Actual</strong>", { permanent: true, direction: "top" });
    this.userLocationLayer.addLayer(pulseMarker);
    this.map.setView([lat, lng], 16, { animate: true });
  }
}
