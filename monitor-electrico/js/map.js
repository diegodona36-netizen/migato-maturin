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
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    const container = document.getElementById(this.containerId);
    if (!container) return;

    // Si el contenedor está oculto (display: none), posponer inicialización hasta que sea visible
    if (container.clientWidth === 0 || container.clientHeight === 0) {
      return;
    }

    try {
      this.map = L.map(this.containerId, {
        center: [7.9, -65.8],
        zoom: 6,
        minZoom: 5,
        maxZoom: 9,
        zoomControl: true,
        attributionControl: false
      });

      // Capa libre sin marcas de agua (Esri World Light Gray Base)
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 16,
        subdomains: ["server", "services"]
      }).addTo(this.map);

      this.markersLayer = L.layerGroup().addTo(this.map);
      this.initialized = true;

      // Renderizar datos pendientes si los hay
      if (this.statesData.length > 0) {
        this.updateData(this.statesData, this.selectedStateId);
      }
    } catch (e) {
      console.warn("Inicialización de mapa pospuesta:", e.message);
    }
  }

  updateData(statesData, selectedStateId = null) {
    this.statesData = statesData;
    this.selectedStateId = selectedStateId;

    if (!this.initialized || !this.map || !this.markersLayer) {
      return;
    }

    try {
      this.markersLayer.clearLayers();

      statesData.forEach(state => {
        const isSelected = state.id === this.selectedStateId;
        const color = this.getSeverityColor(state.severity);
        const radius = this.calcRadius(state.score);

        const circle = L.circleMarker([state.lat, state.lng], {
          radius: radius,
          fillColor: color,
          color: isSelected ? "#0f172a" : "#ffffff",
          weight: isSelected ? 3 : 1.5,
          opacity: 1.0,
          fillOpacity: isSelected ? 0.85 : 0.65,
          className: "state-bubble-marker"
        });

        const tooltipContent = `
          <div class="text-xs font-sans p-1.5 min-w-[140px]">
            <div class="flex items-center justify-between gap-2 border-b pb-1 mb-1">
              <strong class="text-slate-900 font-black">${state.nombre}</strong>
              <span class="text-[9px] font-bold px-1 rounded bg-red-100 text-red-700">${state.tier}</span>
            </div>
            <div class="text-slate-600 text-[11px] space-y-0.5">
              <p>⚡ Electricidad: <strong style="color: ${color}">${state.electricidadPct}%</strong></p>
              <p>🌐 Conectividad: <strong class="text-slate-800">${state.conectividadPct}%</strong></p>
              <p class="text-slate-400 text-[10px]">Score: ${state.score.toLocaleString()}</p>
            </div>
          </div>
        `;
        circle.bindTooltip(tooltipContent, { direction: "top", offset: [0, -radius] });

        circle.on("click", () => {
          if (this.onSelectStateCallback) {
            this.onSelectStateCallback(state);
          }
        });

        this.markersLayer.addLayer(circle);

        const labelHtml = `<span style="font-size: 9.5px; font-weight: 700; color: #334155; text-shadow: 0 1px 2px #fff, 0 -1px 2px #fff, 1px 0 2px #fff, -1px 0 2px #fff; pointer-events: none;">${state.nombre}</span>`;
        const textIcon = L.divIcon({
          className: "state-label-icon",
          html: `<div style="text-align: center; width: 90px; margin-left: -45px; margin-top: ${radius + 2}px;">${labelHtml}</div>`,
          iconSize: [0, 0]
        });
        L.marker([state.lat, state.lng], { icon: textIcon, interactive: false }).addTo(this.markersLayer);
      });
    } catch (e) {
      console.warn("Error actualizando marcadores de mapa:", e.message);
    }
  }

  getSeverityColor(severity) {
    switch (severity) {
      case "CRÍTICO": return "#ef4444";
      case "ALTO": return "#f97316";
      case "DEGRADADO": return "#f59e0b";
      case "NORMAL":
      default: return "#10b981";
    }
  }

  calcRadius(score) {
    if (score >= 8000) return 24;
    if (score >= 4000) return 18;
    if (score >= 2000) return 14;
    if (score >= 1000) return 11;
    if (score >= 400) return 9;
    return 7;
  }
}
