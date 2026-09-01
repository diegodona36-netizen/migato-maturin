/**
 * Motor Cartográfico GIS — Drenajes de Maturín (Puntos Reales de Infraestructura)
 */
export class MaturinDrainageMap {
  constructor(containerId, onSelectCanalCallback) {
    this.containerId = containerId;
    this.onSelectCanalCallback = onSelectCanalCallback;
    this.map = null;
    this.markersLayer = null;
    this.selectedCanalId = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    const container = document.getElementById(this.containerId);
    if (!container || container.clientWidth === 0) return;

    try {
      this.map = L.map(this.containerId, {
        center: [9.745, -63.181],
        zoom: 13,
        minZoom: 11,
        maxZoom: 17,
        zoomControl: true,
        attributionControl: false
      });

      // Capa base limpia y detallada con calles de Maturín
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        subdomains: ["a", "b", "c"]
      }).addTo(this.map);

      this.markersLayer = L.layerGroup().addTo(this.map);
      this.initialized = true;
    } catch (e) {
      console.warn("Inicialización de mapa pospuesta:", e.message);
    }
  }

  updateSimulation(simData, puntosCriticos = [], selectedCanalId = null) {
    this.selectedCanalId = selectedCanalId;
    if (!this.initialized || !this.map) return;

    try {
      this.markersLayer.clearLayers();

      // Dibujar Puntos Críticos Reales (Puentes, Alcantarillas, Pasos de Caños)
      puntosCriticos.forEach(p => {
        const isSelected = p.canoId === this.selectedCanalId;
        const color = p.nivelRiesgo === "CRÍTICO" ? "#ef4444" : (p.nivelRiesgo === "ALTO" ? "#f97316" : "#10b981");

        const marker = L.circleMarker([p.lat, p.lng], {
          radius: isSelected ? 11 : 8,
          fillColor: color,
          color: isSelected ? "#0f172a" : "#ffffff",
          weight: isSelected ? 3 : 2,
          opacity: 1,
          fillOpacity: 0.95
        });

        const tooltipHtml = `
          <div class="p-1.5 text-xs font-sans">
            <div class="flex items-center justify-between gap-2 border-b pb-1 mb-1">
              <strong class="text-slate-900 font-bold">${p.nombrePunto}</strong>
              <span class="text-[9px] font-bold px-1 rounded bg-red-100 text-red-700">${p.prioridad || "ALTA"}</span>
            </div>
            <p class="text-slate-500 text-[11px]">${p.parroquia} • ${p.tipoEstructura}</p>
            <div class="mt-1 space-y-0.5 border-t pt-1 text-[11px]">
              <p>⚠️ Obstrucción: <strong style="color: ${color}">${p.colapsoSedimentacionPct}%</strong></p>
              <p>🏠 Familias en Riesgo: <strong class="text-red-600">${p.familiasRiesgo}</strong></p>
              <p class="text-slate-600 text-[10px]">🚜 ${p.obraRequerida}</p>
            </div>
          </div>
        `;
        marker.bindTooltip(tooltipHtml, { direction: "top", offset: [0, -8] });

        marker.on("click", () => {
          if (this.onSelectCanalCallback) {
            this.onSelectCanalCallback(p);
          }
        });

        this.markersLayer.addLayer(marker);

        // Etiqueta de texto sobre el punto
        const labelHtml = `<span style="font-size: 10px; font-weight: 700; color: #1e293b; background: rgba(255,255,255,0.85); padding: 1px 4px; border-radius: 4px; border: 1px solid #cbd5e1; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">${p.nombrePunto.split("—")[0]}</span>`;
        const textIcon = L.divIcon({
          className: "point-label-icon",
          html: `<div style="text-align: center; white-space: nowrap; margin-left: -50%; margin-top: 10px;">${labelHtml}</div>`,
          iconSize: [0, 0]
        });
        L.marker([p.lat, p.lng], { icon: textIcon, interactive: false }).addTo(this.markersLayer);
      });

    } catch (e) {
      console.warn("Error actualizando mapa de puntos críticos:", e.message);
    }
  }
}
