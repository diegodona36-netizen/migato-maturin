/**
 * Motor Cartográfico de Venezuela — Monitor de Cortes Eléctricos
 */
export class VenezuelaOutageMap {
  constructor(containerId, onSelectStateCallback) {
    this.containerId = containerId;
    this.onSelectStateCallback = onSelectStateCallback;
    this.map = null;
    this.markersLayer = null;
    this.selectedStateId = null;
    this.statesData = [];
  }

  init() {
    if (this.map) return;
    const container = document.getElementById(this.containerId);
    if (!container) return;

    // Centro geográfico de Venezuela
    this.map = L.map(this.containerId, {
      center: [7.95, -65.9],
      zoom: 6,
      minZoom: 5,
      maxZoom: 10,
      zoomControl: true,
      attributionControl: false
    });

    // Capa base limpia y ejecutiva (CartoDB Positron)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd",
      maxZoom: 19
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);
  }

  updateData(statesData, selectedStateId = null) {
    this.statesData = statesData;
    this.selectedStateId = selectedStateId;
    if (!this.map || !this.markersLayer) return;

    this.markersLayer.clearLayers();

    statesData.forEach(state => {
      const isSelected = state.id === this.selectedStateId;
      const color = this.getSeverityColor(state.severity);
      const radius = this.calcRadius(state.score);

      // Marcador de burbuja proporcional
      const circle = L.circleMarker([state.lat, state.lng], {
        radius: radius,
        fillColor: color,
        color: isSelected ? "#0f172a" : color,
        weight: isSelected ? 3 : 1.5,
        opacity: 0.9,
        fillOpacity: isSelected ? 0.85 : 0.65,
        className: "state-bubble-marker " + (state.severity === "CRÍTICO" ? "pulse-critical" : "")
      });

      // Tooltip informativo
      const tooltipContent = `
        <div class="text-xs font-sans p-1">
          <p class="font-bold text-slate-900">${state.nombre} <span class="text-[10px] text-red-600 font-bold">${state.tier}</span></p>
          <p class="text-slate-600">⚡ Electricidad: <strong class="font-bold" style="color: ${color}">${state.electricidadPct}%</strong></p>
          <p class="text-slate-500 text-[10px]">Score de Impacto: ${state.score.toLocaleString()}</p>
        </div>
      `;
      circle.bindTooltip(tooltipContent, { direction: "top", offset: [0, -radius] });

      circle.on("click", () => {
        if (this.onSelectStateCallback) {
          this.onSelectStateCallback(state);
        }
      });

      this.markersLayer.addLayer(circle);

      // Etiqueta de texto debajo de la burbuja
      const textIcon = L.divIcon({
        className: "state-label-icon",
        html: `<div class="text-[10px] font-bold text-slate-700 pointer-events-none drop-shadow-sm text-center -mt-2">${state.nombre}</div>`,
        iconSize: [80, 20],
        iconAnchor: [40, -radius + 4]
      });
      L.marker([state.lat, state.lng], { icon: textIcon, interactive: false }).addTo(this.markersLayer);
    });
  }

  getSeverityColor(severity) {
    switch (severity) {
      case "CRÍTICO": return "#ef4444"; // Rojo
      case "ALTO": return "#f97316";    // Naranja
      case "DEGRADADO": return "#f59e0b";// Amarillo
      case "NORMAL":
      default: return "#10b981";       // Verde
    }
  }

  calcRadius(score) {
    if (score >= 8000) return 28;
    if (score >= 4000) return 22;
    if (score >= 2000) return 17;
    if (score >= 1000) return 13;
    if (score >= 400) return 10;
    return 7;
  }
}
