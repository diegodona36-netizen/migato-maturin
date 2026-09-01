/**
 * Motor Cartográfico GIS — Drenajes e Inundaciones de Maturín
 */
export class MaturinDrainageMap {
  constructor(containerId, onSelectCanalCallback) {
    this.containerId = containerId;
    this.onSelectCanalCallback = onSelectCanalCallback;
    this.map = null;
    this.canalesLayer = null;
    this.inundacionLayer = null;
    this.puntosCriticosLayer = null;
    this.selectedCanalId = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    const container = document.getElementById(this.containerId);
    if (!container || container.clientWidth === 0) return;

    try {
      this.map = L.map(this.containerId, {
        center: [9.746, -63.181],
        zoom: 13,
        minZoom: 11,
        maxZoom: 17,
        zoomControl: true,
        attributionControl: false
      });

      // Capa base limpia y profesional
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 17,
        subdomains: ["server", "services"]
      }).addTo(this.map);

      this.inundacionLayer = L.layerGroup().addTo(this.map);
      this.canalesLayer = L.layerGroup().addTo(this.map);
      this.puntosCriticosLayer = L.layerGroup().addTo(this.map);

      this.initialized = true;
    } catch (e) {
      console.warn("Inicialización de mapa pospuesta:", e.message);
    }
  }

  updateSimulation(simData, puntosCriticos = [], selectedCanalId = null) {
    this.selectedCanalId = selectedCanalId;
    if (!this.initialized || !this.map) return;

    try {
      this.canalesLayer.clearLayers();
      this.inundacionLayer.clearLayers();
      this.puntosCriticosLayer.clearLayers();

      // 1. Dibujar Manchas de Inundación 2D (Polígonos buffer)
      simData.detalles.forEach(c => {
        if (c.hidraulica.desborda && c.hidraulica.anchoInundacionM > 0) {
          const bufferRadius = Math.max(15, c.hidraulica.anchoInundacionM * 0.8);
          
          c.coordenadas.forEach(coord => {
            const circle = L.circle(coord, {
              radius: bufferRadius,
              fillColor: "#0284c7",
              color: "#0369a1",
              weight: 1,
              opacity: 0.7,
              fillOpacity: 0.35,
              interactive: false
            });
            this.inundacionLayer.addLayer(circle);
          });
        }
      });

      // 2. Dibujar Ejes de Caños
      simData.detalles.forEach(c => {
        const isSelected = c.canalId === this.selectedCanalId;
        const color = this.getSeverityColor(c.severidad);
        const weight = isSelected ? 6 : (c.hidraulica.desborda ? 5 : 3.5);

        const polyline = L.polyline(c.coordenadas, {
          color: color,
          weight: weight,
          opacity: 0.95,
          dashArray: c.hidraulica.desborda ? "4, 4" : null,
          className: "canal-vector-line cursor-pointer"
        });

        const tooltipHtml = `
          <div class="p-1.5 text-xs font-sans">
            <p class="font-bold text-slate-900 text-sm">${c.nombre}</p>
            <p class="text-slate-500 text-[10px]">${c.parroquia}</p>
            <div class="mt-1 space-y-0.5 border-t pt-1">
              <p>🌊 Caudal Q: <strong>${c.hidraulica.caudalQ} m³/s</strong></p>
              <p>📏 Altura Agua: <strong>${c.hidraulica.tiranteM}m</strong> / ${c.hidraulica.profundidadCanalM}m</p>
              <p>🚨 Estado: <strong style="color: ${color}">${c.severidad} ${c.hidraulica.desborda ? "(DESBORDE)" : ""}</strong></p>
            </div>
          </div>
        `;
        polyline.bindTooltip(tooltipHtml, { sticky: true });

        polyline.on("click", () => {
          if (this.onSelectCanalCallback) {
            this.onSelectCanalCallback(c);
          }
        });

        this.canalesLayer.addLayer(polyline);
      });

      // 3. Dibujar Puntos Críticos de Inspección
      puntosCriticos.forEach(p => {
        const markerColor = p.nivelRiesgo === "CRÍTICO" ? "#ef4444" : (p.nivelRiesgo === "ALTO" ? "#f97316" : "#10b981");
        
        const marker = L.circleMarker([p.lat, p.lng], {
          radius: 7,
          fillColor: markerColor,
          color: "#ffffff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.95
        });

        const pTooltip = `
          <div class="p-1 text-xs">
            <strong class="text-slate-900">${p.nombrePunto}</strong>
            <p class="text-slate-500 text-[10px]">${p.tipoEstructura} • Colapso: ${p.colapsoSedimentacionPct}%</p>
            <p class="text-[10px] text-red-600 font-bold">${p.familiasRiesgo} familias en riesgo</p>
          </div>
        `;
        marker.bindTooltip(pTooltip);

        this.puntosCriticosLayer.addLayer(marker);
      });

    } catch (e) {
      console.warn("Error actualizando mapa de drenajes:", e.message);
    }
  }

  getSeverityColor(sev) {
    switch (sev) {
      case "CRÍTICO": return "#ef4444"; // Rojo
      case "ALTO": return "#f97316";    // Naranja
      case "ALERTA": return "#f59e0b";  // Amarillo
      case "NORMAL":
      default: return "#0284c7";       // Azul
    }
  }
}
