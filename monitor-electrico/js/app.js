/**
 * Controlador Principal — Monitor de Cortes Eléctricos Venezuela & Monagas
 */
import { IodaApiService } from "./iodaApi.js";
import { VenezuelaOutageMap } from "./map.js";
import { OutageCharts } from "./charts.js";

class AppController {
  constructor() {
    this.api = new IodaApiService();
    this.charts = new OutageCharts();
    this.map = new VenezuelaOutageMap("venezuela-map", (state) => this.selectState(state));
    
    this.activeTab = "tab-monagas";
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
      
      if (!this.selectedState) {
        this.selectedState = this.currentData.estados.find(s => s.nombre === "Monagas") || this.currentData.estados[0];
      } else {
        this.selectedState = this.currentData.estados.find(s => s.id === this.selectedState.id) || this.selectedState;
      }

      this.renderSummaryHeader();
      this.renderMonagasTab();
      this.renderStateDetailPanel();
      this.renderStateRanking();
      this.renderCortesElectricosTab();
      this.renderEventosTab();

      // Si la pestaña activa es estados, actualizar mapa
      if (this.activeTab === "tab-estados") {
        this.map.init();
        this.map.updateData(this.currentData.estados, this.selectedState?.id);
      } else if (this.activeTab === "tab-nacional") {
        this.renderNacionalTab();
      }

      if (window.lucide) {
        window.lucide.createIcons();
      }

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
        ? `<span class="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping mr-1.5"></span><span class="text-amber-500 font-bold">ACTUALIZANDO...</span>`
        : `<span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span><span class="text-emerald-600 font-bold">EN VIVO</span>`;
    }
  }

  renderSummaryHeader() {
    if (!this.currentData) return;
    const { resumen } = this.currentData;

    const countEventosEl = document.getElementById("stat-con-evento");
    const countRacionamientoEl = document.getElementById("stat-con-racionamiento");
    const countSinAnomaliaEl = document.getElementById("stat-sin-anomalia");
    const activeStateNameEl = document.getElementById("header-active-state-name");

    if (countEventosEl) countEventosEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-rose-500 mr-1.5"></span> ${resumen.conEvento} con evento detectado`;
    if (countRacionamientoEl) countRacionamientoEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-500 mr-1.5"></span> ${resumen.conRacionamiento} con posible racionamiento`;
    if (countSinAnomaliaEl) countSinAnomaliaEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span> ${resumen.sinAnomalias} sin anomalías`;
    if (activeStateNameEl && this.selectedState) activeStateNameEl.textContent = this.selectedState.nombre;
  }

  renderMonagasTab() {
    if (!this.currentData) return;

    const monagasState = this.currentData.estados.find(s => s.nombre === "Monagas");
    const monagasEvents = this.currentData.eventos.filter(e => e.region === "Monagas");
    const circuitos = this.currentData.circuitosMonagas || [];

    const kpiDisp = document.getElementById("monagas-kpi-disponibilidad");
    const kpiEv = document.getElementById("monagas-kpi-eventos");
    const kpiHrs = document.getElementById("monagas-kpi-promedio-horas");
    const kpiVolt = document.getElementById("monagas-kpi-voltaje");
    const rangeTag = document.getElementById("monagas-chart-range-tag");

    if (kpiDisp && monagasState) kpiDisp.textContent = `${monagasState.electricidadPct}%`;
    if (kpiEv) kpiEv.textContent = `${monagasEvents.length} eventos`;
    if (kpiHrs) {
      const hrsSinLuz = ((100 - (monagasState?.electricidadPct || 60)) / 100 * 24).toFixed(1);
      kpiHrs.textContent = `${hrsSinLuz} hrs/día`;
    }
    if (kpiVolt) kpiVolt.textContent = "109V (Fluctuante)";
    if (rangeTag) rangeTag.textContent = this.activeRange.toUpperCase();

    // Renderizar gráfico específico de Monagas
    this.charts.renderMonagasTimeline("monagas-timeline-chart", this.activeRange);

    // Renderizar lista de circuitos de Maturín
    const circuitosContainer = document.getElementById("monagas-circuitos-list");
    if (circuitosContainer) {
      circuitosContainer.innerHTML = "";
      circuitos.forEach(c => {
        const isCrit = c.estado === "CRÍTICO";
        const isDeg = c.estado === "DEGRADADO";
        const color = isCrit ? "text-red-600" : (isDeg ? "text-amber-600" : "text-emerald-600");
        const bg = isCrit ? "bg-red-50/70 border-red-200" : (isDeg ? "bg-amber-50/70 border-amber-200" : "bg-emerald-50/70 border-emerald-200");

        const div = document.createElement("div");
        div.className = `p-2.5 rounded-xl border text-xs flex items-center justify-between transition ${bg}`;
        div.innerHTML = `
          <div>
            <p class="font-bold text-slate-900 leading-tight">${c.nombre}</p>
            <p class="text-[10px] text-slate-500">${c.subestacion} • Voltaje: ${c.voltaje}V</p>
          </div>
          <div class="text-right shrink-0">
            <span class="font-mono font-bold text-xs ${color}">${c.disponibilidadPct}%</span>
            <span class="block text-[9px] text-slate-400 font-semibold">${c.fallas24h > 0 ? `${c.fallas24h} falla(s)` : "Estable"}</span>
          </div>
        `;
        circuitosContainer.appendChild(div);
      });
    }

    // Renderizar tabla de historial de Monagas
    const historyBody = document.getElementById("monagas-history-table-body");
    const countLabel = document.getElementById("monagas-events-count-label");
    if (countLabel) countLabel.textContent = `${monagasEvents.length} incidentes registrados en ${this.activeRange}`;

    if (historyBody) {
      historyBody.innerHTML = "";
      if (monagasEvents.length === 0) {
        historyBody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-xs text-slate-400">No se detectaron caídas de sondeo en Monagas en este rango.</td></tr>`;
      } else {
        monagasEvents.forEach(ev => {
          const tr = document.createElement("tr");
          tr.className = "border-b border-slate-100 hover:bg-slate-50 text-xs transition";
          
          const sevColor = ev.severidad === "CRÍTICO" ? "text-red-600 font-bold" : (ev.severidad === "ALTO" ? "text-orange-600 font-bold" : "text-amber-600 font-bold");
          const caidaColor = ev.caidaPct >= 60 ? "text-red-600 font-black" : "text-amber-600 font-bold";

          tr.innerHTML = `
            <td class="px-4 py-3 font-mono font-medium text-slate-800 whitespace-nowrap">${ev.fecha}</td>
            <td class="px-4 py-3 font-bold text-slate-900">📍 ${ev.tipo}</td>
            <td class="px-4 py-3 text-slate-600 whitespace-nowrap">${ev.duracion}</td>
            <td class="px-4 py-3 font-mono ${caidaColor}">-${ev.caidaPct}%</td>
            <td class="px-4 py-3 ${sevColor}">${ev.severidad}</td>
            <td class="px-4 py-3">
              <div class="font-medium text-slate-800">${ev.detalle}</div>
              <div class="text-[10px] text-emerald-700 font-mono">✓ ${ev.patron}</div>
            </td>
          `;
          historyBody.appendChild(tr);
        });
      }
    }
  }

  selectState(state) {
    this.selectedState = state;
    this.map.updateData(this.currentData.estados, state.id);
    this.renderStateDetailPanel();
    this.renderSummaryHeader();

    if (state.nombre === "Monagas") {
      this.renderMonagasTab();
    }
  }

  renderStateDetailPanel() {
    const panel = document.getElementById("state-detail-panel");
    if (!panel || !this.selectedState) return;

    const s = this.selectedState;
    const isCritical = s.severity === "CRÍTICO";
    const isHigh = s.severity === "ALTO";
    const isDegraded = s.severity === "DEGRADADO";

    const elecBadgeClass = (isCritical || isHigh) ? "bg-red-50 text-red-700 border-red-200" : (isDegraded ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200");
    const elecScoreColor = (isCritical || isHigh) ? "text-red-600" : (isDegraded ? "text-amber-600" : "text-emerald-600");

    let eventsHtml = "";
    if (s.eventos && s.eventos.length > 0) {
      s.eventos.forEach(ev => {
        eventsHtml += `
          <div class="p-3 rounded-xl bg-red-50/60 border border-red-100 text-xs space-y-1.5">
            <div class="flex items-center gap-1.5 font-bold text-red-950">
              <i data-lucide="zap" class="w-3.5 h-3.5 text-red-600"></i>
              <span>Evento registrado (${this.activeRange}):</span>
            </div>
            <p class="text-[11px] text-slate-800 font-semibold">
              ${ev.fecha} • -${ev.caidaPct}% • ${ev.duracion} • <span class="text-rose-600">📍 ${ev.tipo}</span>
            </p>
            <p class="text-[10px] text-emerald-700 font-medium">
              ✓ ${ev.patron}
            </p>
          </div>
        `;
      });
    }

    panel.innerHTML = `
      <div class="space-y-4">
        <!-- Header Estado -->
        <div class="flex items-center justify-between border-b pb-3">
          <div class="flex items-center gap-2">
            <h3 class="text-xl font-black text-slate-900">${s.nombre}</h3>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">${s.tier}</span>
          </div>
          <div class="flex items-center gap-2 text-xs font-bold">
            <span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">INTERNET</span>
            <span class="px-2 py-0.5 rounded ${elecBadgeClass} border">ELECTRICIDAD</span>
          </div>
        </div>

        <!-- Scores -->
        <div class="grid grid-cols-2 gap-3">
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p class="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <i data-lucide="globe" class="w-3.5 h-3.5 text-sky-600"></i> CONECTIVIDAD
            </p>
            <p class="text-3xl font-black text-emerald-600 mt-1">${s.conectividadPct}%</p>
          </div>

          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p class="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <i data-lucide="zap" class="w-3.5 h-3.5 text-amber-500"></i> ELECTRICIDAD
            </p>
            <p class="text-3xl font-black ${elecScoreColor} mt-1">${s.electricidadPct}%</p>
            <p class="text-[10px] text-slate-500 mt-0.5 leading-tight">
              ${s.eventCount > 0 ? `Eventos detectados: ${s.eventCount}` : "Monitoreo regular"}
              <span class="font-bold text-emerald-700 block">confianza ${s.confianza.toLowerCase()}</span>
            </p>
          </div>
        </div>

        <!-- Telemetría de Red Detallada -->
        <div class="space-y-2.5 text-xs font-medium pt-1">
          <div class="flex items-center justify-between">
            <span class="text-slate-600 flex items-center gap-1.5">
              <i data-lucide="activity" class="w-3.5 h-3.5 text-sky-600"></i> Sondeo Activo
            </span>
            <span class="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ${s.metrics.sondeoActivoPct}% (${s.metrics.probesActive}/${s.metrics.probesTotal})
            </span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-slate-600 flex items-center gap-1.5">
              <i data-lucide="percent" class="w-3.5 h-3.5 text-amber-600"></i> % Packet Loss
            </span>
            <span class="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              ${s.metrics.packetLossPct}% <span class="text-[10px] font-normal text-slate-400">(normal &lt;10%)</span>
            </span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-slate-600 flex items-center gap-1.5">
              <i data-lucide="clock" class="w-3.5 h-3.5 text-slate-600"></i> Latencia
            </span>
            <span class="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ${s.metrics.latenciaMs}ms <span class="text-[10px] font-normal text-slate-400">(base ${s.metrics.baseLatency}ms)</span>
            </span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-slate-600 flex items-center gap-1.5">
              <i data-lucide="share-2" class="w-3.5 h-3.5 text-emerald-600"></i> BGP Routes
            </span>
            <span class="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              100% Estable
            </span>
          </div>
        </div>

        <!-- Eventos detectados list -->
        ${eventsHtml}
      </div>
    `;
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
      const hasEvents = s.eventos && s.eventos.length > 0;
      const confBadgeColor = s.confianza === "ALTA" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : (s.confianza === "MEDIA" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-100 text-slate-600 border-slate-200");
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
            <span class="text-slate-400 text-xs transform transition-transform chevron-icon ${hasEvents ? "rotate-90" : ""}">▸</span>
            <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${color}"></span>
            <span class="font-bold text-sm text-slate-900">${s.nombre}</span>
            <span class="text-[10px] text-red-600 font-bold">${s.tier}</span>
          </div>

          <div class="flex items-center gap-4 text-xs">
            <span class="px-2 py-0.5 rounded font-bold border text-[10px] ${confBadgeColor}">${s.confianza}</span>
            <span class="font-mono font-black text-sm w-12 text-right" style="color: ${color}">${s.electricidadPct}%</span>
            <span class="text-slate-500 font-mono w-6 text-right font-bold">${s.eventCount}</span>
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

    const presentRegions = Array.from(new Set(this.currentData.eventos.map(e => e.region)));
    const distinctStates = ["Todos", "Monagas", ...presentRegions.filter(r => r !== "Monagas")];

    if (filterPillsContainer) {
      filterPillsContainer.innerHTML = "";
      distinctStates.forEach(st => {
        const isActive = this.eventStateFilter === st;
        const btn = document.createElement("button");
        btn.className = `px-3 py-1 text-xs font-semibold rounded-full transition ${isActive ? "bg-sky-600 text-white shadow-sm font-bold" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`;
        btn.textContent = st;
        btn.addEventListener("click", () => {
          this.eventStateFilter = st;
          this.renderEventosTab();
        });
        filterPillsContainer.appendChild(btn);
      });
    }

    let events = this.currentData.eventos;
    if (this.eventStateFilter !== "Todos") {
      events = events.filter(e => e.region === this.eventStateFilter);
    }

    tableBody.innerHTML = "";
    if (events.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-xs text-slate-400">No hay eventos registrados en este período con el filtro seleccionado.</td></tr>`;
      return;
    }

    events.forEach(ev => {
      const tr = document.createElement("tr");
      tr.className = "border-b border-slate-100 hover:bg-slate-50 transition text-xs";

      const fuenteBadge = ev.fuente === "SONDEO" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-purple-50 text-purple-700 border-purple-200";
      const sevColor = ev.severidad === "CRÍTICO" ? "text-red-600 font-bold" : (ev.severidad === "ALTO" ? "text-orange-600 font-bold" : "text-amber-600 font-bold");

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
          b.classList.toggle("bg-sky-600", isCurrent && target !== "tab-monagas");
          b.classList.toggle("bg-amber-500", isCurrent && target === "tab-monagas");
          b.classList.toggle("text-white", isCurrent && target !== "tab-monagas");
          b.classList.toggle("text-slate-950", isCurrent && target === "tab-monagas");
          b.classList.toggle("text-slate-700", !isCurrent);
          b.classList.toggle("hover:bg-slate-200", !isCurrent);
        });

        document.querySelectorAll(".tab-content").forEach(content => {
          content.classList.toggle("hidden", content.id !== target);
        });

        if (target === "tab-monagas") {
          setTimeout(() => {
            this.renderMonagasTab();
            if (window.lucide) window.lucide.createIcons();
          }, 50);
        } else if (target === "tab-estados") {
          setTimeout(() => {
            this.map.init();
            this.map.updateData(this.currentData.estados, this.selectedState?.id);
            this.map.map?.invalidateSize();
            if (window.lucide) window.lucide.createIcons();
          }, 50);
        } else if (target === "tab-nacional") {
          setTimeout(() => {
            this.renderNacionalTab();
            if (window.lucide) window.lucide.createIcons();
          }, 50);
        } else {
          if (window.lucide) window.lucide.createIcons();
        }
      });
    });

    const quickMonagasBtn = document.getElementById("btn-quick-monagas");
    if (quickMonagasBtn) {
      quickMonagasBtn.addEventListener("click", () => {
        const monagasTabBtn = document.querySelector([data-tab=tab-monagas]);
        if (monagasTabBtn) monagasTabBtn.click();
      });
    }
  }

  setupRangeButtons() {
    const rangeButtons = document.querySelectorAll(".range-btn");
    rangeButtons.forEach(btn => {
      btn.addEventListener("click", async () => {
        const range = btn.dataset.range;
        if (!range || range === this.activeRange) return;

        this.activeRange = range;
        this.eventStateFilter = "Todos";

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

    const btnExportMonagas = document.getElementById("btn-export-monagas");
    if (btnExportMonagas) {
      btnExportMonagas.addEventListener("click", () => this.exportMonagasCSV());
    }
  }

  exportMonagasCSV() {
    if (!this.currentData) return;
    const monagasEvents = this.currentData.eventos.filter(e => e.region === "Monagas");
    if (monagasEvents.length === 0) {
      alert("No hay eventos registrados en Monagas en este rango.");
      return;
    }

    const headers = ["Fecha", "Zona_Circuito", "Duracion", "Caida_Pct", "Severidad", "Score", "Detalle", "Patron"];
    const rows = monagasEvents.map(e => [
      `"${e.fecha}"`,
      `"${e.tipo}"`,
      `"${e.duracion}"`,
      `"${e.caidaPct}%"`,
      `"${e.severidad}"`,
      `"${e.score}"`,
      `"${e.detalle}"`,
      `"${e.patron}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Historial_Cortes_Electricos_Monagas_Maturin_${this.activeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

// Iniciar aplicación
window.addEventListener("DOMContentLoaded", () => {
  window.app = new AppController();
});
