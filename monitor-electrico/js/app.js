/**
 * Controlador Principal — Monitor de Cortes Eléctricos Venezuela
 */
import { IodaApiService } from "./iodaApi.js";
import { VenezuelaOutageMap } from "./map.js";
import { OutageCharts } from "./charts.js";

class AppController {
  constructor() {
    this.api = new IodaApiService();
    this.charts = new OutageCharts();
    this.map = new VenezuelaOutageMap("venezuela-map", (state) => this.selectState(state));
    
    this.activeTab = "tab-estados";
    this.activeRange = "24h";
    this.currentData = null;
    this.selectedState = null;
    this.eventStateFilter = "Todos";

    this.init();
  }

  async init() {
    this.setupTabs();
    this.setupRangeButtons();
    this.setupExportButton();

    this.map.init();
    await this.refreshData();

    // Auto-actualizar cada 60 segundos
    setInterval(() => this.refreshData(false), 60000);
  }

  async refreshData(showLoader = true) {
    if (showLoader) {
      this.setLoadingState(true);
    }
    
    try {
      this.currentData = await this.api.getOutageData(this.activeRange);
      
      // Si no hay estado seleccionado o el seleccionado no existe, elegir Táchira por defecto
      if (!this.selectedState && this.currentData.estados.length > 0) {
        this.selectedState = this.currentData.estados.find(s => s.nombre === "Táchira") || this.currentData.estados[0];
      } else if (this.selectedState) {
        this.selectedState = this.currentData.estados.find(s => s.id === this.selectedState.id) || this.selectedState;
      }

      this.renderSummaryHeader();
      this.map.updateData(this.currentData.estados, this.selectedState?.id);
      this.renderStateDetailPanel();
      this.renderStateRanking();
      this.renderCortesElectricosTab();
      this.renderEventosTab();
      this.renderNacionalTab();

    } catch (e) {
      console.error("Error cargando datos:", e);
    } finally {
      if (showLoader) {
        this.setLoadingState(false);
      }
    }
  }

  setLoadingState(loading) {
    const liveIndicator = document.getElementById("live-indicator");
    if (liveIndicator) {
      liveIndicator.innerHTML = loading 
        ? `<span class="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping mr-1.5"></span><span class="text-amber-300 font-bold">ACTUALIZANDO...</span>`
        : `<span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span><span class="text-emerald-300 font-bold">EN VIVO</span>`;
    }
  }

  renderSummaryHeader() {
    if (!this.currentData) return;
    const { resumen } = this.currentData;

    const countEventosEl = document.getElementById("stat-con-evento");
    const countRacionamientoEl = document.getElementById("stat-con-racionamiento");
    const countSinAnomaliaEl = document.getElementById("stat-sin-anomalia");

    if (countEventosEl) countEventosEl.textContent = `${resumen.conEvento} con evento detectado`;
    if (countRacionamientoEl) countRacionamientoEl.textContent = `${resumen.conRacionamiento} con posible racionamiento (inferido)`;
    if (countSinAnomaliaEl) countSinAnomaliaEl.textContent = `${resumen.sinAnomalias} sin anomalías`;
  }

  selectState(state) {
    this.selectedState = state;
    this.map.updateData(this.currentData.estados, state.id);
    this.renderStateDetailPanel();
  }

  renderStateDetailPanel() {
    const panel = document.getElementById("state-detail-panel");
    if (!panel || !this.selectedState) return;

    const s = this.selectedState;
    const isCritical = s.severity === "CRÍTICO";
    const isHigh = s.severity === "ALTO";
    const isDegraded = s.severity === "DEGRADADO";

    const elecBadgeClass = isCritical ? "bg-red-50 text-red-700 border-red-200" : (isHigh ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-amber-50 text-amber-700 border-amber-200");
    const elecScoreColor = isCritical ? "text-red-600" : (isHigh ? "text-orange-600" : "text-amber-600");

    let eventsHtml = "";
    if (s.eventos && s.eventos.length > 0) {
      s.eventos.forEach(ev => {
        eventsHtml += `
          <div class="p-3 rounded-xl bg-red-50/60 border border-red-100 text-xs space-y-1">
            <div class="flex items-center gap-1.5 font-bold text-red-900">
              <i data-lucide="zap" class="w-3.5 h-3.5 text-red-600"></i>
              <span>Eventos eléctricos detectados:</span>
            </div>
            <p class="text-[11px] text-slate-700 font-semibold">
              ${ev.fecha} • -${ev.caidaPct}% • ${ev.duracion} • <span class="text-purple-600 font-bold">⚠️ en curso</span> • <span class="text-rose-600">📍 ${ev.tipo}</span>
            </p>
            <p class="text-[10px] text-emerald-700 font-medium">
              ✓ ${ev.patron}
            </p>
          </div>
        `;
      });
    } else if (isDegraded) {
      eventsHtml = `
        <div class="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-xs text-amber-900">
          <p class="font-bold flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-amber-500"></span> Degradación leve</p>
          <p class="text-[11px] text-slate-600 mt-1">Uno o más indicadores muestran reducción moderada. Puede ser racionamiento rotativo o fluctuación normal.</p>
        </div>
      `;
    } else {
      eventsHtml = `
        <div class="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900">
          <p class="font-bold flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> Servicio Eléctrico Estable</p>
          <p class="text-[11px] text-slate-600 mt-1">Sin anomalías detectadas en los últimos sondeos de red.</p>
        </div>
      `;
    }

    panel.innerHTML = `
      <div class="space-y-4">
        <!-- Header Estado -->
        <div class="flex items-center justify-between border-b pb-3">
          <div class="flex items-center gap-2">
            <h3 class="text-lg font-black text-slate-900">${s.nombre}</h3>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">${s.tier}</span>
          </div>
          <div class="flex items-center gap-2 text-xs font-bold">
            <span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">INTERNET</span>
            <span class="px-2 py-0.5 rounded ${elecBadgeClass} border">ELECTRICIDAD</span>
          </div>
        </div>

        <!-- Score & Status -->
        <div class="grid grid-cols-2 gap-3">
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p class="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <i data-lucide="globe" class="w-3.5 h-3.5 text-sky-600"></i> CONECTIVIDAD
            </p>
            <p class="text-2xl font-black text-emerald-600 mt-1">${s.conectividadPct}%</p>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p class="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <i data-lucide="zap" class="w-3.5 h-3.5 text-amber-500"></i> ELECTRICIDAD
            </p>
            <p class="text-2xl font-black ${elecScoreColor} mt-1">${s.electricidadPct}%</p>
            <p class="text-[10px] text-slate-400 font-medium">Confianza: <span class="font-bold text-slate-700">${s.confianza}</span></p>
          </div>
        </div>

        <!-- Telemetría de Red -->
        <div class="space-y-2 text-xs font-medium">
          <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
            <span class="text-slate-600 flex items-center gap-1.5">
              <i data-lucide="activity" class="w-3.5 h-3.5 text-sky-600"></i> Sondeo Activo
            </span>
            <span class="font-mono font-bold text-slate-800">${s.metrics.sondeoActivoPct}% (${s.metrics.probesActive}/${s.metrics.probesTotal})</span>
          </div>

          <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
            <span class="text-slate-600 flex items-center gap-1.5">
              <i data-lucide="percent" class="w-3.5 h-3.5 text-amber-600"></i> Packet Loss
            </span>
            <span class="font-mono font-bold ${s.metrics.packetLossPct > 15 ? "text-amber-600" : "text-emerald-600"}">${s.metrics.packetLossPct}%</span>
          </div>

          <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
            <span class="text-slate-600 flex items-center gap-1.5">
              <i data-lucide="clock" class="w-3.5 h-3.5 text-slate-600"></i> Latencia
            </span>
            <span class="font-mono font-bold text-slate-800">${s.metrics.latenciaMs}ms <span class="text-[10px] text-slate-400">(base ${s.baseLatency}ms)</span></span>
          </div>

          <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
            <span class="text-slate-600 flex items-center gap-1.5">
              <i data-lucide="share-2" class="w-3.5 h-3.5 text-emerald-600"></i> BGP Routes
            </span>
            <span class="font-mono font-bold text-emerald-600">100% Estable</span>
          </div>

          <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
            <span class="text-slate-600 flex items-center gap-1.5">
              <i data-lucide="eye" class="w-3.5 h-3.5 text-orange-600"></i> Telescopio
            </span>
            <span class="font-mono font-bold text-orange-600">${s.metrics.telescopioPct}%</span>
          </div>
        </div>

        <!-- Eventos detectados list -->
        <div class="space-y-2 pt-2 border-t border-slate-100">
          ${eventsHtml}
        </div>
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  renderStateRanking() {
    const tableBody = document.getElementById("ranking-table-body");
    if (!tableBody || !this.currentData) return;

    tableBody.innerHTML = "";
    this.currentData.estados.slice(0, 10).forEach((s, idx) => {
      const isSelected = s.id === this.selectedState?.id;
      const color = this.map.getSeverityColor(s.severity);

      const tr = document.createElement("tr");
      tr.className = `cursor-pointer transition hover:bg-slate-100/80 ${isSelected ? "bg-sky-50 font-bold" : ""}`;
      tr.innerHTML = `
        <td class="px-3 py-2 text-slate-400 font-mono text-[11px]">${idx + 1}</td>
        <td class="px-3 py-2 text-slate-900 font-semibold flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full" style="background-color: ${color}"></span>
          <span>${s.nombre}</span>
          <span class="text-[9px] text-red-600 font-bold">${s.tier}</span>
        </td>
        <td class="px-3 py-2 text-right font-mono font-bold" style="color: ${color}">
          ${s.electricidadPct}%
        </td>
        <td class="px-3 py-2 text-right text-slate-500 font-mono text-[11px]">
          ${s.score.toLocaleString()}
        </td>
      `;

      tr.addEventListener("click", () => this.selectState(s));
      tableBody.appendChild(tr);
    });
  }

  renderCortesElectricosTab() {
    const listContainer = document.getElementById("cortes-list-container");
    if (!listContainer || !this.currentData) return;

    listContainer.innerHTML = "";

    this.currentData.estados.forEach(s => {
      const isCritical = s.severity === "CRÍTICO";
      const isHigh = s.severity === "ALTO";
      const hasEvents = s.eventos && s.eventos.length > 0;

      const confBadgeColor = s.confianza === "ALTA" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200";
      const color = this.map.getSeverityColor(s.severity);

      const stateDiv = document.createElement("div");
      stateDiv.className = "border-b border-slate-100 last:border-b-0";

      let innerDetails = "";
      if (hasEvents) {
        s.eventos.forEach(ev => {
          innerDetails += `
            <div class="p-3 my-2 rounded-xl bg-red-50/50 border border-red-100 text-xs space-y-1 ml-4 sm:ml-8">
              <p class="font-bold text-slate-900">${ev.detalle}</p>
              <p class="text-slate-600 font-mono text-[11px]">${ev.fecha} • -${ev.caidaPct}% • ${ev.duracion} • <span class="text-rose-600">📍 ${ev.tipo}</span></p>
              <p class="text-emerald-700 text-[10px]">✓ ${ev.patron}</p>
            </div>
          `;
        });
      }

      stateDiv.innerHTML = `
        <div class="flex items-center justify-between p-3.5 hover:bg-slate-50 cursor-pointer transition select-none corte-accordion-header">
          <div class="flex items-center gap-2">
            <span class="text-slate-400 text-xs transform transition-transform chevron-icon">▸</span>
            <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${color}"></span>
            <span class="font-bold text-sm text-slate-900">${s.nombre}</span>
            <span class="text-[10px] text-red-600 font-bold">${s.tier}</span>
          </div>

          <div class="flex items-center gap-4 text-xs">
            <span class="px-2 py-0.5 rounded font-bold border text-[10px] ${confBadgeColor}">${s.confianza}</span>
            <span class="font-mono font-black text-sm w-12 text-right" style="color: ${color}">${s.electricidadPct}%</span>
            <span class="text-slate-500 font-mono w-6 text-right">${s.eventCount}</span>
          </div>
        </div>

        <div class="corte-accordion-body ${hasEvents ? "" : "hidden"}">
          ${innerDetails}
        </div>
      `;

      const header = stateDiv.querySelector(".corte-accordion-header");
      const body = stateDiv.querySelector(".corte-accordion-body");
      const chevron = stateDiv.querySelector(".chevron-icon");

      header.addEventListener("click", () => {
        const isHidden = body.classList.contains("hidden");
        body.classList.toggle("hidden", !isHidden);
        chevron.style.transform = isHidden ? "rotate(90deg)" : "rotate(0deg)";
      });

      listContainer.appendChild(stateDiv);
    });
  }

  renderEventosTab() {
    const tableBody = document.getElementById("eventos-table-body");
    const filterPillsContainer = document.getElementById("eventos-filter-pills");
    if (!tableBody || !this.currentData) return;

    // Render Filter Pills
    if (filterPillsContainer) {
      const distinctStates = ["Todos", "Barinas", "Trujillo", "Táchira", "Zulia", "Sucre", "Nueva Esparta"];
      filterPillsContainer.innerHTML = "";
      distinctStates.forEach(st => {
        const isActive = this.eventStateFilter === st;
        const btn = document.createElement("button");
        btn.className = `px-3 py-1 text-xs font-semibold rounded-full transition ${isActive ? "bg-sky-600 text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`;
        btn.textContent = st;
        btn.addEventListener("click", () => {
          this.eventStateFilter = st;
          this.renderEventosTab();
        });
        filterPillsContainer.appendChild(btn);
      });
    }

    // Filtrar eventos
    let events = this.currentData.eventos;
    if (this.eventStateFilter !== "Todos") {
      events = events.filter(e => e.region === this.eventStateFilter);
    }

    tableBody.innerHTML = "";
    if (events.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-xs text-slate-400">No hay eventos registrados con este filtro.</td></tr>`;
      return;
    }

    events.forEach(ev => {
      const tr = document.createElement("tr");
      tr.className = "border-b border-slate-100 hover:bg-slate-50 transition text-xs";

      const fuenteBadge = ev.fuente === "SONDEO" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-purple-50 text-purple-700 border-purple-200";
      const sevColor = ev.severidad === "CRÍTICO" ? "text-red-600 font-bold" : "text-orange-600 font-bold";

      tr.innerHTML = `
        <td class="px-4 py-3 font-mono font-medium text-slate-800">${ev.fecha}</td>
        <td class="px-4 py-3 font-bold text-slate-900">${ev.region}</td>
        <td class="px-4 py-3 text-slate-600">${ev.duracion}</td>
        <td class="px-4 py-3"><span class="px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${fuenteBadge}">${ev.fuente}</span></td>
        <td class="px-4 py-3 ${sevColor}">${ev.severidad}</td>
        <td class="px-4 py-3 font-mono font-black text-right ${sevColor}">
          <div>${ev.score}</div>
          <div class="text-[10px] text-slate-400 font-normal">${ev.duracion}</div>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  renderNacionalTab() {
    this.charts.renderNationalTimeline("national-timeline-chart", this.activeRange);
  }

  setupTabs() {
    const navButtons = document.querySelectorAll(".nav-tab-btn");
    navButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.tab;
        if (!target) return;

        this.activeTab = target;
        navButtons.forEach(b => {
          const isCurrent = b.dataset.tab === target;
          b.classList.toggle("bg-sky-600", isCurrent);
          b.classList.toggle("text-white", isCurrent);
          b.classList.toggle("text-slate-600", !isCurrent);
          b.classList.toggle("hover:bg-slate-100", !isCurrent);
        });

        document.querySelectorAll(".tab-content").forEach(content => {
          content.classList.toggle("hidden", content.id !== target);
        });

        if (target === "tab-estados") {
          setTimeout(() => this.map.map?.invalidateSize(), 100);
        } else if (target === "tab-nacional") {
          setTimeout(() => this.renderNacionalTab(), 100);
        }
      });
    });
  }

  setupRangeButtons() {
    const rangeButtons = document.querySelectorAll(".range-btn");
    rangeButtons.forEach(btn => {
      btn.addEventListener("click", async () => {
        const range = btn.dataset.range;
        if (!range || range === this.activeRange) return;

        this.activeRange = range;
        rangeButtons.forEach(b => {
          const isCurrent = b.dataset.range === range;
          b.classList.toggle("bg-sky-600", isCurrent);
          b.classList.toggle("text-white", isCurrent);
          b.classList.toggle("bg-white", !isCurrent);
          b.classList.toggle("text-slate-700", !isCurrent);
        });

        await this.refreshData(true);
      });
    });

    const btnRefresh = document.getElementById("btn-refresh-data");
    if (btnRefresh) {
      btnRefresh.addEventListener("click", () => this.refreshData(true));
    }
  }

  setupExportButton() {
    const btnExport = document.getElementById("btn-export-events");
    if (btnExport) {
      btnExport.addEventListener("click", () => this.exportCSV());
    }
  }

  exportCSV() {
    if (!this.currentData || !this.currentData.eventos.length) {
      alert("No hay eventos disponibles para exportar.");
      return;
    }

    const headers = ["Fecha", "Región", "Duración", "Fuente", "Severidad", "Score", "Patrón"];
    const rows = this.currentData.eventos.map(e => [
      `"${e.fecha}"`,
      `"${e.region}"`,
      `"${e.duracion}"`,
      `"${e.fuente}"`,
      `"${e.severidad}"`,
      `"${e.score}"`,
      `"${e.patron}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Cortes_Electricos_Venezuela_IODA_${this.activeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Iniciar aplicación al cargar
window.addEventListener("DOMContentLoaded", () => {
  window.app = new AppController();
});
