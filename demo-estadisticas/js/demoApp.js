/**
 * Controlador de Aplicación • Demo Aislada de Estadísticas y Censo Territorial Monagas
 * 100% Offline, Determinístico, sin dependencias de Firebase
 */

import { 
  MONAGAS_DEMO_DATA, 
  getAllSectorsFlattened, 
  computeTerritorialAggregates, 
  getMunicipalComparisonMatrix 
} from "./demoData.js";

export class DemoStatsApp {
  constructor() {
    this.selectedMunId = "todos";
    this.selectedParishId = "todas";
    this.searchQuery = "";
    this.activeTab = "stats"; // 'stats', 'sectors', 'cascade', 'architecture'
    
    // Paginación y ordenamiento del explorador de sectores
    this.sectorsPage = 1;
    this.sectorsPageSize = 12;
    this.sectorSortKey = "votantes";
    this.sectorSortAsc = false;

    // Ordenamiento de tabla municipal
    this.matrixSortKey = "votantes";
    this.matrixSortAsc = false;

    // Estados del árbol acordeón
    this.expandedParishes = new Set(["alto-de-los-godos", "san-simon", "punta-de-mata"]);
    this.expandedSubparroquias = new Set(["sub-godos-lapuente", "sub-ss-casco"]);

    this.nf = new Intl.NumberFormat("es-VE");

    this.init();
  }

  init() {
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    // Selector de Municipio
    const selectMun = document.getElementById("demo-filter-municipio");
    if (selectMun) {
      selectMun.addEventListener("change", (e) => {
        this.selectedMunId = e.target.value;
        this.selectedParishId = "todas";
        this.sectorsPage = 1;
        this.render();
      });
    }

    // Buscador reactivo
    const inputSearch = document.getElementById("demo-filter-search");
    if (inputSearch) {
      inputSearch.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.sectorsPage = 1;
        this.render();
      });
    }

    // Pestañas de Navegación
    document.querySelectorAll(".demo-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        if (tab) {
          this.activeTab = tab;
          this.updateTabUI();
        }
      });
    });

    // Botones de Exportación
    const btnCsv = document.getElementById("btn-demo-export-csv");
    if (btnCsv) {
      btnCsv.addEventListener("click", () => this.exportCSV());
    }

    const btnJson = document.getElementById("btn-demo-export-json");
    if (btnJson) {
      btnJson.addEventListener("click", () => this.exportJSON());
    }

    const btnReport = document.getElementById("btn-demo-situational-report");
    if (btnReport) {
      btnReport.addEventListener("click", () => this.openSituationalReportModal());
    }

    // Cerrar modal de informe situacional
    const modalReport = document.getElementById("modal-situational-report");
    const btnCloseReport = document.getElementById("btn-close-report-modal");
    if (btnCloseReport && modalReport) {
      btnCloseReport.addEventListener("click", () => {
        modalReport.classList.add("hidden");
        modalReport.classList.remove("flex");
        modalReport.style.display = "none";
      });
    }
    if (modalReport) {
      modalReport.addEventListener("click", (e) => {
        if (e.target === modalReport) {
          modalReport.classList.add("hidden");
          modalReport.classList.remove("flex");
          modalReport.style.display = "none";
        }
      });
    }
  }

  render() {
    this.updateParishPills();
    this.renderKPICards();
    this.renderMunicipalMatrix();
    this.renderTopSectors();
    this.renderSectorsTable();
    this.renderCascadeTree();
    this.updateTabUI();

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      try { window.lucide.createIcons(); } catch(e){}
    }
  }

  updateTabUI() {
    document.querySelectorAll(".demo-tab-btn").forEach(btn => {
      const isCurrent = btn.dataset.tab === this.activeTab;
      if (isCurrent) {
        btn.className = "demo-tab-btn px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition cursor-pointer";
      } else {
        btn.className = "demo-tab-btn px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs border border-slate-800 flex items-center gap-2 transition cursor-pointer";
      }
    });

    const panes = {
      stats: document.getElementById("pane-demo-stats"),
      sectors: document.getElementById("pane-demo-sectors"),
      cascade: document.getElementById("pane-demo-cascade"),
      architecture: document.getElementById("pane-demo-architecture")
    };

    Object.entries(panes).forEach(([key, el]) => {
      if (!el) return;
      if (key === this.activeTab) {
        el.classList.remove("hidden");
        el.style.display = "block";
      } else {
        el.classList.add("hidden");
        el.style.display = "none";
      }
    });

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      try { window.lucide.createIcons(); } catch(e){}
    }
  }

  updateParishPills() {
    const container = document.getElementById("demo-parish-pills");
    if (!container) return;

    let parishes = [];
    if (this.selectedMunId === "todos") {
      MONAGAS_DEMO_DATA.municipios.forEach(m => {
        m.parroquias.forEach(p => parishes.push({ ...p, munId: m.id, munNombre: m.nombre }));
      });
    } else {
      const mObj = MONAGAS_DEMO_DATA.municipios.find(m => m.id === this.selectedMunId);
      if (mObj) {
        parishes = mObj.parroquias.map(p => ({ ...p, munId: mObj.id, munNombre: mObj.nombre }));
      }
    }

    const allPill = `
      <button type="button" data-parish="todas" class="px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${this.selectedParishId === 'todas' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'}">
        🌐 Todas las Parroquias (${parishes.length})
      </button>
    `;

    const parishesPills = parishes.map(p => {
      const isSelected = p.id === this.selectedParishId;
      return `
        <button type="button" data-parish="${p.id}" class="px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition cursor-pointer ${isSelected ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'}">
          📍 ${p.nombre}
        </button>
      `;
    }).join("");

    container.innerHTML = allPill + parishesPills;

    container.querySelectorAll("button[data-parish]").forEach(btn => {
      btn.addEventListener("click", () => {
        this.selectedParishId = btn.dataset.parish;
        this.sectorsPage = 1;
        this.render();
      });
    });
  }

  renderKPICards() {
    const agg = computeTerritorialAggregates(this.selectedMunId, this.selectedParishId);

    const elCasas = document.getElementById("demo-kpi-casas");
    const elFamilias = document.getElementById("demo-kpi-familias");
    const elHabitantes = document.getElementById("demo-kpi-habitantes");
    const elVotantes = document.getElementById("demo-kpi-votantes");
    const elSectores = document.getElementById("demo-kpi-sectores");
    const elEjes = document.getElementById("demo-kpi-ejes");
    const elCentros = document.getElementById("demo-kpi-centros");
    const elHabCasa = document.getElementById("demo-kpi-ratio-hab");
    const elPadronPct = document.getElementById("demo-kpi-padron-pct");

    if (elCasas) elCasas.textContent = this.nf.format(agg.casas);
    if (elFamilias) elFamilias.textContent = this.nf.format(agg.familias);
    if (elHabitantes) elHabitantes.textContent = this.nf.format(agg.habitantes);
    if (elVotantes) elVotantes.textContent = this.nf.format(agg.votantes);
    if (elSectores) elSectores.textContent = this.nf.format(agg.totalSectores);
    if (elEjes) elEjes.textContent = `${agg.uniqueSubparroquias} Ejes Comunales`;
    if (elCentros) elCentros.textContent = `${agg.uniqueCentros} Centros CNE`;
    if (elHabCasa) elHabCasa.textContent = `${agg.avgHabCasa} hab/casa`;
    if (elPadronPct) elPadronPct.textContent = `${agg.pctVotantes}% Padrón`;

    // Actualizar subtítulo de jurisdicción
    const subtitle = document.getElementById("demo-territory-subtitle");
    if (subtitle) {
      if (this.selectedMunId === "todos") {
        subtitle.textContent = `Estado Monagas Completo • 13 Municipios • ${agg.uniqueParroquias} Parroquias • ${agg.totalSectores} Sectores Digitalizados`;
      } else {
        const m = MONAGAS_DEMO_DATA.municipios.find(x => x.id === this.selectedMunId);
        const p = m ? m.parroquias.find(x => x.id === this.selectedParishId) : null;
        if (p) {
          subtitle.textContent = `Municipio ${m.nombre} • Parroquia ${p.nombre} • ${agg.totalSectores} Sectores Censados`;
        } else {
          subtitle.textContent = `Municipio ${m ? m.nombre : ''} • ${agg.uniqueParroquias} Parroquias • ${agg.totalSectores} Sectores Censados`;
        }
      }
    }
  }

  renderMunicipalMatrix() {
    const tbody = document.getElementById("demo-matrix-tbody");
    if (!tbody) return;

    let matrix = getMunicipalComparisonMatrix();

    // Ordenamiento dinámico
    matrix.sort((a, b) => {
      let valA = a[this.matrixSortKey];
      let valB = b[this.matrixSortKey];
      if (typeof valA === "string") {
        return this.matrixSortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return this.matrixSortAsc ? valA - valB : valB - valA;
    });

    const totalCasas = matrix.reduce((sum, m) => sum + m.casas, 0);
    const totalHabitantes = matrix.reduce((sum, m) => sum + m.habitantes, 0);
    const totalVotantes = matrix.reduce((sum, m) => sum + m.votantes, 0);
    const totalSectores = matrix.reduce((sum, m) => sum + m.secCount, 0);

    tbody.innerHTML = matrix.map((m, idx) => {
      const isSelected = m.munId === this.selectedMunId;
      const pctVotantesDelTotal = ((m.votantes / (totalVotantes || 1)) * 100).toFixed(1);

      return `
        <tr class="border-b border-slate-800/80 hover:bg-slate-800/50 transition cursor-pointer ${isSelected ? 'bg-amber-500/10 border-amber-500/40' : ''}" onclick="window.demoApp.filterByMunRow('${m.munId}')">
          <td class="px-3 py-2.5 font-bold text-slate-100 flex items-center gap-2">
            <span class="text-[10px] font-mono text-slate-500">${idx + 1}.</span>
            <span class="text-amber-400 font-black">${m.nombre}</span>
            ${m.munId === 'maturin' ? '<span class="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[9px] font-bold rounded">Capital</span>' : ''}
          </td>
          <td class="px-3 py-2.5 text-center font-mono text-xs text-slate-300">${m.parroquiasCount}</td>
          <td class="px-3 py-2.5 text-center font-mono text-xs text-purple-300 font-bold">${m.subCount}</td>
          <td class="px-3 py-2.5 text-center font-mono text-xs text-sky-400 font-bold">${m.secCount}</td>
          <td class="px-3 py-2.5 text-right font-mono text-xs text-amber-300">${this.nf.format(m.casas)}</td>
          <td class="px-3 py-2.5 text-right font-mono text-xs text-slate-300">${this.nf.format(m.familias)}</td>
          <td class="px-3 py-2.5 text-right font-mono text-xs text-emerald-400 font-bold">${this.nf.format(m.habitantes)}</td>
          <td class="px-3 py-2.5 text-right font-mono text-xs text-white font-black bg-amber-500/5">${this.nf.format(m.votantes)}</td>
          <td class="px-3 py-2.5 text-center font-mono text-xs text-slate-400">${m.habCasa}</td>
          <td class="px-3 py-2.5 text-right font-mono text-xs text-sky-300 font-bold">${m.padronPct}%</td>
          <td class="px-3 py-2.5 text-center">
            <div class="flex items-center justify-center gap-1.5">
              <div class="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div class="bg-amber-400 h-full rounded-full" style="width: ${Math.min(100, pctVotantesDelTotal * 2)}%"></div>
              </div>
              <span class="text-[10px] font-mono text-slate-400 font-bold">${pctVotantesDelTotal}%</span>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    // Footer con totales macro
    const tfoot = document.getElementById("demo-matrix-tfoot");
    if (tfoot) {
      tfoot.innerHTML = `
        <tr class="bg-slate-900 font-mono text-xs font-black text-amber-400 border-t-2 border-amber-500/50">
          <td class="px-3 py-3">TOTAL ESTADO MONAGAS (13)</td>
          <td class="px-3 py-3 text-center">44</td>
          <td class="px-3 py-3 text-center text-purple-300">120+</td>
          <td class="px-3 py-3 text-center text-sky-400">${this.nf.format(totalSectores)}</td>
          <td class="px-3 py-3 text-right text-amber-300">${this.nf.format(totalCasas)}</td>
          <td class="px-3 py-3 text-right text-slate-300">${this.nf.format(matrix.reduce((s, m) => s + m.familias, 0))}</td>
          <td class="px-3 py-3 text-right text-emerald-400">${this.nf.format(totalHabitantes)}</td>
          <td class="px-3 py-3 text-right text-white font-black bg-amber-500/20">${this.nf.format(totalVotantes)}</td>
          <td class="px-3 py-3 text-center text-slate-300">${(totalHabitantes / (totalCasas || 1)).toFixed(2)}</td>
          <td class="px-3 py-3 text-right text-sky-300">${((totalVotantes / (totalHabitantes || 1)) * 100).toFixed(1)}%</td>
          <td class="px-3 py-3 text-center text-emerald-400 font-bold">100%</td>
        </tr>
      `;
    }

    // Cabeceras ordenables
    document.querySelectorAll(".demo-sort-header").forEach(th => {
      th.onclick = () => {
        const key = th.dataset.sort;
        if (key) {
          if (this.matrixSortKey === key) {
            this.matrixSortAsc = !this.matrixSortAsc;
          } else {
            this.matrixSortKey = key;
            this.matrixSortAsc = false;
          }
          this.renderMunicipalMatrix();
        }
      };
    });
  }

  filterByMunRow(munId) {
    this.selectedMunId = munId;
    this.selectedParishId = "todas";
    const select = document.getElementById("demo-filter-municipio");
    if (select) select.value = munId;
    this.render();
  }

  renderTopSectors() {
    const container = document.getElementById("demo-top-sectors-container");
    if (!container) return;

    let allSectors = getAllSectorsFlattened();
    if (this.selectedMunId !== "todos") {
      allSectors = allSectors.filter(s => s.munId === this.selectedMunId);
    }

    // Top 12 por cantidad de votantes
    const top = [...allSectors].sort((a, b) => b.votantes - a.votantes).slice(0, 12);
    const maxVot = top.length > 0 ? top[0].votantes : 1;

    container.innerHTML = top.map((s, i) => {
      const pctBar = ((s.votantes / maxVot) * 100).toFixed(0);
      return `
        <div class="p-3 bg-slate-950/80 border border-slate-800/80 hover:border-amber-500/50 rounded-2xl transition space-y-2">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <span class="text-[10px] font-mono text-slate-500 block">#${i + 1} • ${s.id}</span>
              <h4 class="text-xs font-black text-white truncate" title="${s.nombre}">${s.nombre}</h4>
              <span class="text-[10px] text-amber-400 font-semibold truncate block">${s.munNombre} ➔ ${s.parishNombre}</span>
            </div>
            <div class="text-right shrink-0">
              <span class="text-sm font-black font-mono text-amber-400">${this.nf.format(s.votantes)}</span>
              <span class="text-[9px] text-slate-400 block">votantes</span>
            </div>
          </div>
          
          <div class="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
            <div class="bg-gradient-to-r from-amber-500 to-orange-400 h-full rounded-full" style="width: ${pctBar}%"></div>
          </div>

          <div class="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5 border-t border-slate-800/50">
            <span>🏠 ${s.casas} casas</span>
            <span>👥 ${s.habitantes} hab</span>
            <span class="text-emerald-400 font-bold">✓ ${s.cobertura}%</span>
          </div>
        </div>
      `;
    }).join("");
  }

  renderSectorsTable() {
    const tbody = document.getElementById("demo-sectors-tbody");
    const countLabel = document.getElementById("demo-sectors-count-label");
    const pageLabel = document.getElementById("demo-sectors-page-label");
    if (!tbody) return;

    let sectors = getAllSectorsFlattened();

    // Filtros de municipio y parroquia
    if (this.selectedMunId !== "todos") {
      sectors = sectors.filter(s => s.munId === this.selectedMunId);
    }
    if (this.selectedParishId !== "todas") {
      sectors = sectors.filter(s => s.parishId === this.selectedParishId);
    }

    // Buscador
    if (this.searchQuery) {
      sectors = sectors.filter(s => 
        s.nombre.toLowerCase().includes(this.searchQuery) ||
        s.id.toLowerCase().includes(this.searchQuery) ||
        s.subParroquiaNombre.toLowerCase().includes(this.searchQuery) ||
        s.centroVotacion.toLowerCase().includes(this.searchQuery) ||
        s.parishNombre.toLowerCase().includes(this.searchQuery) ||
        s.munNombre.toLowerCase().includes(this.searchQuery)
      );
    }

    // Ordenamiento
    sectors.sort((a, b) => {
      let valA = a[this.sectorSortKey];
      let valB = b[this.sectorSortKey];
      if (typeof valA === "string") {
        return this.sectorSortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return this.sectorSortAsc ? valA - valB : valB - valA;
    });

    const totalCount = sectors.length;
    const totalPages = Math.ceil(totalCount / this.sectorsPageSize) || 1;
    this.sectorsPage = Math.min(this.sectorsPage, totalPages);

    const startIndex = (this.sectorsPage - 1) * this.sectorsPageSize;
    const paginated = sectors.slice(startIndex, startIndex + this.sectorsPageSize);

    if (countLabel) countLabel.textContent = `${totalCount} sectores encontrados`;
    if (pageLabel) pageLabel.textContent = `Pág. ${this.sectorsPage} de ${totalPages}`;

    if (paginated.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" class="text-center py-8 text-slate-400 text-xs">
            No se encontraron sectores con el criterio de búsqueda.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = paginated.map(s => `
      <tr class="border-b border-slate-800 hover:bg-slate-800/40 transition">
        <td class="px-3 py-2 font-mono text-[11px] text-amber-400 font-bold whitespace-nowrap">${s.id}</td>
        <td class="px-3 py-2 font-bold text-white text-xs whitespace-nowrap">${s.nombre}</td>
        <td class="px-3 py-2 text-[11px] text-purple-300 truncate max-w-[180px]">${s.subParroquiaNombre}</td>
        <td class="px-3 py-2 text-[11px] text-slate-300 whitespace-nowrap">${s.parishNombre}</td>
        <td class="px-3 py-2 text-[11px] text-slate-400 whitespace-nowrap">${s.munNombre}</td>
        <td class="px-3 py-2 text-right font-mono text-xs text-amber-300">${this.nf.format(s.casas)}</td>
        <td class="px-3 py-2 text-right font-mono text-xs text-slate-300">${this.nf.format(s.familias)}</td>
        <td class="px-3 py-2 text-right font-mono text-xs text-emerald-400 font-bold">${this.nf.format(s.habitantes)}</td>
        <td class="px-3 py-2 text-right font-mono text-xs text-white font-black bg-amber-500/10">${this.nf.format(s.votantes)}</td>
        <td class="px-3 py-2 text-[11px] text-slate-300 truncate max-w-[200px]" title="${s.centroVotacion}">${s.centroVotacion}</td>
      </tr>
    `).join("");

    // Botones de paginación
    const btnPrev = document.getElementById("btn-demo-sectors-prev");
    const btnNext = document.getElementById("btn-demo-sectors-next");
    if (btnPrev) {
      btnPrev.disabled = this.sectorsPage <= 1;
      btnPrev.onclick = () => {
        if (this.sectorsPage > 1) {
          this.sectorsPage--;
          this.renderSectorsTable();
        }
      };
    }
    if (btnNext) {
      btnNext.disabled = this.sectorsPage >= totalPages;
      btnNext.onclick = () => {
        if (this.sectorsPage < totalPages) {
          this.sectorsPage++;
          this.renderSectorsTable();
        }
      };
    }
  }

  renderCascadeTree() {
    const container = document.getElementById("demo-cascade-tree");
    if (!container) return;

    let munList = MONAGAS_DEMO_DATA.municipios;
    if (this.selectedMunId !== "todos") {
      munList = munList.filter(m => m.id === this.selectedMunId);
    }

    container.innerHTML = munList.map(m => {
      let filteredParishes = m.parroquias;
      if (this.selectedParishId !== "todas") {
        filteredParishes = filteredParishes.filter(p => p.id === this.selectedParishId);
      }

      if (filteredParishes.length === 0) return "";

      const parishesHtml = filteredParishes.map(p => {
        const isParishExpanded = this.expandedParishes.has(p.id);

        const subparroquiasHtml = p.subparroquias.map(sp => {
          const isSubExpanded = this.expandedSubparroquias.has(sp.id);

          const totalSubCasas = sp.sectores.reduce((sum, s) => sum + s.casas, 0);
          const totalSubHab = sp.sectores.reduce((sum, s) => sum + s.habitantes, 0);
          const totalSubVot = sp.sectores.reduce((sum, s) => sum + s.votantes, 0);

          const sectorsListHtml = sp.sectores.map(s => `
            <div class="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-xl hover:border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition">
              <div class="flex items-center gap-2 min-w-0">
                <span class="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                <span class="font-mono text-amber-400 font-bold text-[11px]">${s.id}</span>
                <span class="font-bold text-white truncate">${s.nombre}</span>
              </div>
              <div class="flex items-center gap-3 font-mono text-[11px] text-slate-300 shrink-0">
                <span>🏠 ${s.casas}</span>
                <span>👥 ${s.habitantes}</span>
                <span class="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold font-mono">🗳️ ${s.votantes}</span>
                <span class="text-[10px] text-slate-400 hidden md:inline truncate max-w-[160px]" title="${s.centroVotacion}">🏫 ${s.centroVotacion}</span>
              </div>
            </div>
          `).join("");

          return `
            <div class="border border-purple-500/30 bg-purple-950/20 rounded-2xl p-3 space-y-2.5">
              <div class="flex items-center justify-between cursor-pointer" onclick="window.demoApp.toggleSubparroquia('${sp.id}')">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="text-purple-400 text-sm">${isSubExpanded ? '▾' : '▸'}</span>
                  <span class="w-6 h-6 rounded-lg bg-purple-900/80 border border-purple-500/50 flex items-center justify-center text-purple-300 text-[10px] font-bold shrink-0">L4</span>
                  <h5 class="text-xs font-black text-purple-200 truncate">${sp.nombre}</h5>
                  <span class="text-[10px] font-mono text-slate-400">(${sp.sectores.length} sectores)</span>
                </div>
                <div class="flex items-center gap-2 font-mono text-[11px] text-purple-300 font-bold shrink-0">
                  <span>${this.nf.format(totalSubCasas)} casas</span>
                  <span>•</span>
                  <span>${this.nf.format(totalSubVot)} votantes</span>
                </div>
              </div>

              ${isSubExpanded ? `
                <div class="space-y-1.5 pl-4 border-l-2 border-purple-500/30 pt-1">
                  ${sectorsListHtml}
                </div>
              ` : ''}
            </div>
          `;
        }).join("");

        const totalParishCasas = p.subparroquias.reduce((acc, sp) => acc + sp.sectores.reduce((s, x) => s + x.casas, 0), 0);
        const totalParishVot = p.subparroquias.reduce((acc, sp) => acc + sp.sectores.reduce((s, x) => s + x.votantes, 0), 0);

        return `
          <div class="border border-slate-800 bg-slate-900/90 rounded-2xl p-3.5 space-y-3">
            <div class="flex items-center justify-between cursor-pointer border-b border-slate-800 pb-2.5" onclick="window.demoApp.toggleParish('${p.id}')">
              <div class="flex items-center gap-2 min-w-0">
                <span class="text-amber-400 text-sm">${isParishExpanded ? '▾' : '▸'}</span>
                <span class="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300 text-[10px] font-bold shrink-0">L3</span>
                <h4 class="text-xs sm:text-sm font-black text-white truncate">Parroquia ${p.nombre}</h4>
                <span class="text-[10px] text-slate-400 font-mono">(${p.subparroquias.length} Ejes)</span>
              </div>
              <div class="flex items-center gap-2 font-mono text-xs text-amber-400 font-black shrink-0">
                <span>${this.nf.format(totalParishCasas)} casas</span>
                <span>•</span>
                <span class="text-white">${this.nf.format(totalParishVot)} votantes</span>
              </div>
            </div>

            ${isParishExpanded ? `
              <div class="space-y-2.5 pl-2 pt-1">
                ${subparroquiasHtml}
              </div>
            ` : ''}
          </div>
        `;
      }).join("");

      return `
        <div class="bg-slate-900/95 border-2 border-amber-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div class="flex items-center gap-2.5">
              <span class="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-md">L2</span>
              <div>
                <h3 class="text-sm sm:text-base font-black text-white uppercase tracking-tight">${m.nombre}</h3>
                <span class="text-[10px] text-slate-400 font-mono">Capital: ${m.capital} • ${m.parroquias.length} Parroquias</span>
              </div>
            </div>
            <span class="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-mono font-black">
              100% Censado
            </span>
          </div>

          <div class="space-y-3">
            ${parishesHtml}
          </div>
        </div>
      `;
    }).join("");
  }

  toggleParish(parishId) {
    if (this.expandedParishes.has(parishId)) {
      this.expandedParishes.delete(parishId);
    } else {
      this.expandedParishes.add(parishId);
    }
    this.renderCascadeTree();
  }

  toggleSubparroquia(subId) {
    if (this.expandedSubparroquias.has(subId)) {
      this.expandedSubparroquias.delete(subId);
    } else {
      this.expandedSubparroquias.add(subId);
    }
    this.renderCascadeTree();
  }

  exportCSV() {
    let sectors = getAllSectorsFlattened();
    if (this.selectedMunId !== "todos") {
      sectors = sectors.filter(s => s.munId === this.selectedMunId);
    }
    if (this.selectedParishId !== "todas") {
      sectors = sectors.filter(s => s.parishId === this.selectedParishId);
    }

    const headers = [
      "ID Poligono",
      "Sector Comunal",
      "Eje Comunal (Subparroquia)",
      "Parroquia",
      "Municipio",
      "Casas Censadas",
      "Familias",
      "Habitantes",
      "Votantes Registrados",
      "Ratio Hab/Casa",
      "Padron Electoral %",
      "Centro Electoral Asignado",
      "Cobertura Censo %"
    ];

    const rows = sectors.map(s => [
      `"${s.id}"`,
      `"${s.nombre}"`,
      `"${s.subParroquiaNombre}"`,
      `"${s.parishNombre}"`,
      `"${s.munNombre}"`,
      s.casas,
      s.familias,
      s.habitantes,
      s.votantes,
      s.ratioHabCasa,
      s.ratioVotHab,
      `"${s.centroVotacion}"`,
      s.cobertura
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MIGATO_Censo_Demostracion_Monagas_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  exportJSON() {
    const agg = computeTerritorialAggregates(this.selectedMunId, this.selectedParishId);
    const exportObject = {
      meta: MONAGAS_DEMO_DATA.meta,
      jurisdiccionSeleccionada: {
        municipio: this.selectedMunId,
        parroquia: this.selectedParishId
      },
      resumenEjecutivo: {
        totalCasas: agg.casas,
        totalFamilias: agg.familias,
        totalHabitantes: agg.habitantes,
        totalVotantes: agg.votantes,
        totalSectores: agg.totalSectores,
        totalEjes: agg.uniqueSubparroquias,
        centrosCNE: agg.uniqueCentros,
        promedioHabitantesPorCasa: agg.avgHabCasa,
        porcentajePadron: agg.pctVotantes
      },
      sectores: agg.filteredSectors
    };

    const jsonStr = JSON.stringify(exportObject, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MIGATO_Censo_Dataset_Estructurado_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  openSituationalReportModal() {
    const modal = document.getElementById("modal-situational-report");
    const content = document.getElementById("report-modal-content");
    if (!modal || !content) return;

    const agg = computeTerritorialAggregates(this.selectedMunId, this.selectedParishId);
    const matrix = getMunicipalComparisonMatrix();

    let munName = "Estado Monagas (Completo)";
    if (this.selectedMunId !== "todos") {
      const m = MONAGAS_DEMO_DATA.municipios.find(x => x.id === this.selectedMunId);
      munName = m ? `Municipio ${m.nombre}` : this.selectedMunId;
    }

    content.innerHTML = `
      <div class="space-y-4 text-xs">
        <div class="border-b border-slate-800 pb-3">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">SALA SITUACIONAL • INFORME EJECUTIVO</span>
            <span class="text-[10px] font-mono text-slate-400">${new Date().toLocaleString("es-VE")}</span>
          </div>
          <h3 class="text-base font-black text-white mt-1">${munName}</h3>
          <p class="text-slate-400 text-[11px]">Consolidado para presentación ante equipos de ingeniería y dirección operativa.</p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
          <div class="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span class="text-[10px] text-slate-400 block">Viviendas Censadas</span>
            <span class="text-lg font-black text-amber-400">${this.nf.format(agg.casas)}</span>
          </div>
          <div class="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span class="text-[10px] text-slate-400 block">Familias Registradas</span>
            <span class="text-lg font-black text-sky-400">${this.nf.format(agg.familias)}</span>
          </div>
          <div class="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span class="text-[10px] text-slate-400 block">Habitantes Totales</span>
            <span class="text-lg font-black text-emerald-400">${this.nf.format(agg.habitantes)}</span>
          </div>
          <div class="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span class="text-[10px] text-slate-400 block">Padrón Electoral</span>
            <span class="text-lg font-black text-white">${this.nf.format(agg.votantes)}</span>
          </div>
        </div>

        <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 font-mono text-[11px]">
          <div class="flex justify-between text-slate-300">
            <span>Sectores / Polígonos Digitalizados:</span>
            <strong class="text-amber-400">${agg.totalSectores} polígonos</strong>
          </div>
          <div class="flex justify-between text-slate-300">
            <span>Ejes Comunales de Coordinación:</span>
            <strong class="text-purple-300">${agg.uniqueSubparroquias} ejes</strong>
          </div>
          <div class="flex justify-between text-slate-300">
            <span>Centros Electorales CNE Asociados:</span>
            <strong class="text-sky-300">${agg.uniqueCentros} escuelas</strong>
          </div>
          <div class="flex justify-between text-slate-300">
            <span>Densidad Promedio por Vivienda:</span>
            <strong class="text-emerald-400">${agg.avgHabCasa} habitantes/casa</strong>
          </div>
          <div class="flex justify-between text-slate-300">
            <span>Índice de Cobertura Comunal:</span>
            <strong class="text-white font-black">${agg.avgCobertura}% COMPLETADO</strong>
          </div>
        </div>

        <p class="text-[10px] text-slate-500 italic text-center">
          Documento generado determinísticamente para fines de auditoría técnica e ingeniería de software.
        </p>
      </div>
    `;

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    modal.style.display = "flex";
  }
}

// Inicialización global
window.addEventListener("DOMContentLoaded", () => {
  window.demoApp = new DemoStatsApp();
});
