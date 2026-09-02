/**
 * Controlador Principal — Tablero de Evaluación Semanal Juventud MIGATO
 */
import { MUNICIPIOS_MONAGAS } from "./dataMunicipios.js";
import { StorageService } from "./storage.js";
import { YouthCharts } from "./charts.js";

class JuventudDashboardApp {
  constructor() {
    this.charts = new YouthCharts();
    this.reportes = StorageService.getReportes();
    this.activeTab = "tab-consolidado";
    this.selectedMunicipioFilter = "todos";

    this.init();
  }

  init() {
    this.setupTabs();
    this.setupFilters();
    this.setupPhotoModal();
    this.setupExportButtons();

    this.renderDashboard();

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch(e) {}
    }
  }

  renderDashboard() {
    this.renderSummaryKPIs();
    this.renderFichasMunicipales();
    this.renderRankingTable();
    this.renderGlobalPhotoGallery();
    this.renderPrintableSummary();

    const totales = this.calculateGlobalTotals();
    this.charts.renderMunicipalComparison("municipal-comparison-chart", this.reportes);
    this.charts.renderAxesSummaryDoughnut("axes-summary-doughnut", totales);

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch(e) {}
    }
  }

  calculateGlobalTotals() {
    const totalCaptacion = this.reportes.reduce((acc, r) => acc + (r.captacion?.totalJovenes || 0), 0);
    const totalConversatorios = this.reportes.reduce((acc, r) => acc + (r.conversatorios?.totalRealizados || 0), 0);
    const totalAsistentes = this.reportes.reduce((acc, r) => acc + (r.conversatorios?.totalAsistentes || 0), 0);
    const totalCaminatas = this.reportes.reduce((acc, r) => acc + (r.caminatas?.totalRealizadas || 0), 0);
    const totalCasas = this.reportes.reduce((acc, r) => acc + (r.caminatas?.casasVisitadas || 0), 0);
    const totalFotos = this.reportes.reduce((acc, r) => acc + (r.fotos?.length || 0), 0);

    return {
      captacion: totalCaptacion,
      conversatorios: totalConversatorios,
      asistentes: totalAsistentes,
      caminatas: totalCaminatas,
      casas: totalCasas,
      fotos: totalFotos,
      municipiosEntregados: this.reportes.length,
      totalMunicipios: MUNICIPIOS_MONAGAS.length
    };
  }

  renderSummaryKPIs() {
    const totales = this.calculateGlobalTotals();

    const kpiCaptacion = document.getElementById("kpi-total-captacion");
    const kpiConversatorios = document.getElementById("kpi-total-conversatorios");
    const kpiCaminatas = document.getElementById("kpi-total-caminatas");
    const kpiSemaforo = document.getElementById("kpi-semaforo-entrega");

    if (kpiCaptacion) kpiCaptacion.textContent = `${totales.captacion.toLocaleString()} jóvenes`;
    if (kpiConversatorios) kpiConversatorios.textContent = `${totales.conversatorios} (${totales.asistentes.toLocaleString()} participantes)`;
    if (kpiCaminatas) kpiCaminatas.textContent = `${totales.caminatas} (${totales.casas.toLocaleString()} casas)`;
    if (kpiSemaforo) {
      kpiSemaforo.textContent = `${totales.municipiosEntregados} / ${totales.totalMunicipios} Municipios`;
    }
  }

  getFilteredReportes() {
    return this.reportes.filter(r => {
      const matchMun = this.selectedMunicipioFilter === "todos" || r.municipioId === this.selectedMunicipioFilter;
      return matchMun;
    });
  }

  renderFichasMunicipales() {
    const container = document.getElementById("fichas-municipales-grid");
    if (!container) return;

    const filtrados = this.getFilteredReportes();
    container.innerHTML = "";

    if (filtrados.length === 0) {
      container.innerHTML = `
        <div class="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
          <i data-lucide="inbox" class="w-12 h-12 mx-auto mb-2 text-slate-300"></i>
          <p class="font-bold text-slate-600">No hay informes registrados con este filtro.</p>
        </div>
      `;
      return;
    }

    filtrados.forEach(r => {
      const card = document.createElement("div");
      card.className = "bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition";

      let fotosHtml = "";
      if (r.fotos && r.fotos.length > 0) {
        fotosHtml = `
          <div class="pt-3 border-t border-slate-100">
            <span class="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <i data-lucide="image" class="w-3.5 h-3.5 text-amber-500"></i> Evidencias Fotográficas (${r.fotos.length})
            </span>
            <div class="grid grid-cols-2 gap-2">
              ${r.fotos.map(f => `
                <div class="group relative rounded-xl overflow-hidden aspect-video bg-slate-100 cursor-pointer border border-slate-200" onclick="window.juventudApp.openPhotoModal('${f.url}', '${f.titulo}', '${r.municipio}')">
                  <img src="${f.url}" alt="${f.titulo}" class="w-full h-full object-cover group-hover:scale-105 transition duration-200">
                  <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2 opacity-90 group-hover:opacity-100 transition">
                    <span class="text-[10px] font-bold text-white leading-tight truncate">${f.titulo}</span>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        `;
      } else {
        fotosHtml = `
          <div class="pt-3 border-t border-slate-100 text-center py-2 text-[11px] text-slate-400 italic">
            Sin fotos adjuntas en este reporte
          </div>
        `;
      }

      card.innerHTML = `
        <div class="p-5 space-y-4">
          
          <div class="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-black text-slate-900">${r.municipio}</h3>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  ${r.parroquia}
                </span>
              </div>
              <p class="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                <i data-lucide="user" class="w-3.5 h-3.5 text-slate-400"></i>
                <span>${r.responsable} (${r.cargo || "Secretario Juvenil"})</span>
              </p>
            </div>

            <div class="text-right shrink-0">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <i data-lucide="check-circle" class="w-3 h-3"></i> Entregado
              </span>
              <span class="text-[10px] text-slate-400 font-mono block mt-1">${r.fechaEntrega}</span>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2 text-center">
            
            <div class="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80">
              <span class="text-[10px] font-bold text-amber-800 uppercase block">🟡 Captación</span>
              <span class="text-xl font-black text-amber-600 block mt-0.5">${r.captacion?.totalJovenes || 0}</span>
              <span class="text-[9px] text-slate-500">jóvenes</span>
            </div>

            <div class="p-2.5 rounded-xl bg-sky-50/70 border border-sky-200/80">
              <span class="text-[10px] font-bold text-sky-800 uppercase block">🗣️ Asambleas</span>
              <span class="text-xl font-black text-sky-600 block mt-0.5">${r.conversatorios?.totalRealizados || 0}</span>
              <span class="text-[9px] text-slate-500">${r.conversatorios?.totalAsistentes || 0} part.</span>
            </div>

            <div class="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
              <span class="text-[10px] font-bold text-emerald-800 uppercase block">🚶‍♂️ Caminatas</span>
              <span class="text-xl font-black text-emerald-600 block mt-0.5">${r.caminatas?.totalRealizadas || 0}</span>
              <span class="text-[9px] text-slate-500">${r.caminatas?.casasVisitadas || 0} casas</span>
            </div>

          </div>

          <div class="space-y-2 text-xs">
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span class="font-bold text-slate-800 block text-[11px] mb-0.5">🌟 Logro Destacado de la Semana:</span>
              <p class="text-slate-600 leading-relaxed text-[11px]">${r.cualitativo?.logroPrincipal || "Sin registrar."}</p>
            </div>

            <div class="p-3 rounded-xl bg-rose-50/60 border border-rose-100 text-rose-950">
              <span class="font-bold block text-[11px] mb-0.5 text-rose-900">⚠️ Nudo Crítico / Requerimiento:</span>
              <p class="text-slate-700 leading-relaxed text-[11px]">${r.cualitativo?.nudoCritico || "Ninguno reportado."}</p>
            </div>
          </div>

          ${fotosHtml}

        </div>

        <div class="bg-slate-50 px-5 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-[11px] text-slate-500 font-mono">📱 ${r.telefono}</span>
          <span class="text-[11px] font-bold text-sky-600">🎯 Meta: ${r.cualitativo?.metaSiguienteSemana || "Despliegue continuo"}</span>
        </div>
      `;

      container.appendChild(card);
    });
  }

  renderRankingTable() {
    const tbody = document.getElementById("ranking-tbody");
    if (!tbody) return;

    tbody.innerHTML = "";
    
    const rankingData = this.reportes.map(r => {
      const score = ((r.captacion?.totalJovenes || 0) * 2) + ((r.conversatorios?.totalAsistentes || 0)) + ((r.caminatas?.casasVisitadas || 0) * 0.5);
      return { ...r, scoreCalculado: Math.round(score) };
    }).sort((a, b) => b.scoreCalculado - a.scoreCalculado);

    rankingData.forEach((r, idx) => {
      const tr = document.createElement("tr");
      tr.className = "border-b border-slate-100 hover:bg-slate-50 text-xs transition";
      
      const posColor = idx === 0 ? "text-amber-500 font-black" : (idx === 1 ? "text-slate-400 font-bold" : (idx === 2 ? "text-amber-700 font-bold" : "text-slate-400"));

      tr.innerHTML = `
        <td class="px-4 py-3 font-mono font-bold ${posColor}">#${idx + 1}</td>
        <td class="px-4 py-3 font-bold text-slate-900 flex items-center gap-2">
          <span>${r.municipio}</span>
          <span class="text-[10px] text-slate-400 font-normal">(${r.parroquia})</span>
        </td>
        <td class="px-4 py-3 text-slate-700">${r.responsable}</td>
        <td class="px-4 py-3 font-mono font-bold text-amber-600">${r.captacion?.totalJovenes || 0}</td>
        <td class="px-4 py-3 font-mono font-bold text-sky-600">${r.conversatorios?.totalRealizados || 0} (${r.conversatorios?.totalAsistentes || 0})</td>
        <td class="px-4 py-3 font-mono font-bold text-emerald-600">${r.caminatas?.totalRealizadas || 0} (${r.caminatas?.casasVisitadas || 0})</td>
        <td class="px-4 py-3 font-mono font-black text-right text-slate-900">${r.scoreCalculado} pts</td>
      `;
      tbody.appendChild(tr);
    });
  }

  renderGlobalPhotoGallery() {
    const container = document.getElementById("global-gallery-grid");
    if (!container) return;

    container.innerHTML = "";
    const todasLasFotos = [];
    this.reportes.forEach(r => {
      if (r.fotos && r.fotos.length > 0) {
        r.fotos.forEach(f => {
          todasLasFotos.push({ ...f, municipio: r.municipio, parroquia: r.parroquia, fecha: r.fechaEntrega });
        });
      }
    });

    if (todasLasFotos.length === 0) {
      container.innerHTML = `<div class="col-span-full p-8 text-center text-slate-400">No hay fotos cargadas aún.</div>`;
      return;
    }

    todasLasFotos.forEach(f => {
      const card = document.createElement("div");
      card.className = "group relative rounded-2xl overflow-hidden aspect-video bg-slate-900 cursor-pointer shadow-sm hover:shadow-lg transition duration-200 border border-slate-200";
      card.onclick = () => this.openPhotoModal(f.url, f.titulo, f.municipio);

      card.innerHTML = `
        <img src="${f.url}" alt="${f.titulo}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3 text-white">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 w-fit mb-1">${f.eje || "Evidencia"}</span>
          <h4 class="font-bold text-xs leading-tight">${f.titulo}</h4>
          <p class="text-[10px] text-slate-300 mt-0.5">${f.municipio} • ${f.parroquia}</p>
        </div>
      `;
      container.appendChild(card);
    });
  }

  renderPrintableSummary() {
    const container = document.getElementById("printable-summary-content");
    if (!container) return;

    const totales = this.calculateGlobalTotals();
    const hoy = new Date().toLocaleDateString("es-VE", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    container.innerHTML = `
      <div class="p-8 bg-white max-w-4xl mx-auto space-y-6 text-slate-900 border border-slate-200 rounded-2xl shadow-sm print:border-0 print:shadow-none">
        
        <div class="flex items-center justify-between border-b-2 border-slate-900 pb-4">
          <div>
            <span class="text-xs font-black tracking-widest uppercase text-amber-600">SECRETARÍA REGIONAL JUVENIL MIGATO</span>
            <h2 class="text-2xl font-black text-slate-900">Informe Ejecutivo de Despliegue Semanal</h2>
            <p class="text-xs text-slate-500 font-medium">Reunión Ordinaria de los Lunes • Monagas • ${hoy}</p>
          </div>
          <div class="text-right">
            <span class="px-3 py-1 bg-slate-900 text-white font-mono font-bold text-xs rounded-lg">DESPLIEGUE MONAGAS</span>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4 text-center">
          <div class="p-4 rounded-xl border border-amber-300 bg-amber-50">
            <span class="text-xs font-bold text-amber-800 uppercase block">🟡 Total Jóvenes Captados</span>
            <span class="text-3xl font-black text-amber-600 block mt-1">${totales.captacion}</span>
          </div>
          <div class="p-4 rounded-xl border border-sky-300 bg-sky-50">
            <span class="text-xs font-bold text-sky-800 uppercase block">🗣️ Conversatorios Realizados</span>
            <span class="text-3xl font-black text-sky-600 block mt-1">${totales.conversatorios}</span>
            <span class="text-[11px] text-slate-500">${totales.asistentes} participantes</span>
          </div>
          <div class="p-4 rounded-xl border border-emerald-300 bg-emerald-50">
            <span class="text-xs font-bold text-emerald-800 uppercase block">🚶‍♂️ Caminatas / Casas Tocadas</span>
            <span class="text-3xl font-black text-emerald-600 block mt-1">${totales.caminatas}</span>
            <span class="text-[11px] text-slate-500">${totales.casas} casas visitadas</span>
          </div>
        </div>

        <div class="space-y-2">
          <h3 class="text-sm font-black uppercase text-slate-900 tracking-wider">Desglose por Municipio</h3>
          <table class="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
            <thead class="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th class="p-2.5">Municipio / Parroquia</th>
                <th class="p-2.5">Responsable</th>
                <th class="p-2.5 text-center">Captación</th>
                <th class="p-2.5 text-center">Conversatorios</th>
                <th class="p-2.5 text-center">Caminatas</th>
                <th class="p-2.5">Logro Principal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${this.reportes.map(r => `
                <tr>
                  <td class="p-2.5 font-bold">${r.municipio} <span class="font-normal text-slate-400">(${r.parroquia})</span></td>
                  <td class="p-2.5">${r.responsable}</td>
                  <td class="p-2.5 font-mono font-bold text-center text-amber-600">${r.captacion?.totalJovenes || 0}</td>
                  <td class="p-2.5 font-mono font-bold text-center text-sky-600">${r.conversatorios?.totalRealizados || 0}</td>
                  <td class="p-2.5 font-mono font-bold text-center text-emerald-600">${r.caminatas?.totalRealizadas || 0}</td>
                  <td class="p-2.5 text-slate-600 text-[11px]">${r.cualitativo?.logroPrincipal || "-"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <div class="pt-8 flex items-center justify-between border-t border-slate-200">
          <div class="text-center w-64 border-t border-slate-400 pt-2">
            <p class="font-bold text-xs text-slate-900">Albany Ydrogo</p>
            <p class="text-[10px] text-slate-500">Secretaria Regional Juvenil MIGATO</p>
          </div>
          <div class="text-right text-[10px] text-slate-400 font-mono">
            Sistema Oficial de Gestión Territorial • MIGATO Monagas
          </div>
        </div>

      </div>
    `;
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
          b.classList.toggle("bg-amber-500", isCurrent);
          b.classList.toggle("text-slate-950", isCurrent);
          b.classList.toggle("font-bold", isCurrent);
          b.classList.toggle("text-slate-400", !isCurrent);
          b.classList.toggle("hover:bg-slate-800", !isCurrent);
        });

        document.querySelectorAll(".tab-content").forEach(content => {
          content.classList.toggle("hidden", content.id !== target);
        });

        if (window.lucide) {
          try { window.lucide.createIcons(); } catch(e) {}
        }
      });
    });
  }

  setupFilters() {
    const filterSelect = document.getElementById("filter-municipio-select");
    if (filterSelect) {
      filterSelect.innerHTML = `<option value="todos">Todos los Municipios (${this.reportes.length})</option>`;
      MUNICIPIOS_MONAGAS.forEach(m => {
        const count = this.reportes.filter(r => r.municipioId === m.id).length;
        filterSelect.innerHTML += `<option value="${m.id}">${m.nombre} (${count})</option>`;
      });

      filterSelect.addEventListener("change", (e) => {
        this.selectedMunicipioFilter = e.target.value;
        this.renderFichasMunicipales();
        if (window.lucide) { try { window.lucide.createIcons(); } catch(e){} }
      });
    }
  }

  setupPhotoModal() {
    const modal = document.getElementById("photo-modal");
    const modalImg = document.getElementById("photo-modal-img");
    const modalTitle = document.getElementById("photo-modal-title");
    const modalMun = document.getElementById("photo-modal-mun");
    const btnClose = document.getElementById("btn-close-photo-modal");

    this.openPhotoModal = (url, title, mun) => {
      if (modal && modalImg) {
        modalImg.src = url;
        if (modalTitle) modalTitle.textContent = title;
        if (modalMun) modalMun.textContent = `Municipio ${mun}`;
        modal.classList.remove("hidden");
        modal.classList.add("flex");
      }
    };

    const closeModal = () => {
      if (modal) {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
      }
    };

    if (btnClose) btnClose.addEventListener("click", closeModal);
    if (modal) modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  setupExportButtons() {
    const btnExportCSV = document.getElementById("btn-export-youth-csv");
    if (btnExportCSV) {
      btnExportCSV.addEventListener("click", () => this.exportCSV());
    }

    const btnPrint = document.getElementById("btn-print-summary");
    if (btnPrint) {
      btnPrint.addEventListener("click", () => {
        window.print();
      });
    }
  }

  exportCSV() {
    const headers = [
      "Semana",
      "Municipio",
      "Parroquia",
      "Responsable",
      "Telefono",
      "Captacion_Jovenes",
      "Sectores_Captacion",
      "Conversatorios_Realizados",
      "Asistentes_Conversatorios",
      "Temas_Conversatorios",
      "Caminatas_Realizadas",
      "Casas_Visitadas",
      "Logro_Principal",
      "Nudo_Critico",
      "Meta_Siguiente_Semana"
    ];

    const rows = this.reportes.map(r => [
      `"${r.semana}"`,
      `"${r.municipio}"`,
      `"${r.parroquia}"`,
      `"${r.responsable}"`,
      `"${r.telefono}"`,
      r.captacion?.totalJovenes || 0,
      `"${r.captacion?.sectoresPrincipales || ""}"`,
      r.conversatorios?.totalRealizados || 0,
      r.conversatorios?.totalAsistentes || 0,
      `"${r.conversatorios?.temasTratados || ""}"`,
      r.caminatas?.totalRealizadas || 0,
      r.caminatas?.casasVisitadas || 0,
      `"${r.cualitativo?.logroPrincipal || ""}"`,
      `"${r.cualitativo?.nudoCritico || ""}"`,
      `"${r.cualitativo?.metaSiguienteSemana || ""}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Juventud_MIGATO_Informe_Semanal_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  }
}

function startJuventudApp() {
  if (!window.juventudApp) {
    window.juventudApp = new JuventudDashboardApp();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startJuventudApp);
} else {
  startJuventudApp();
}
