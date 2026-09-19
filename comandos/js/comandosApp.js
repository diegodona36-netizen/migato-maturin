/**
 * Aplicación de Gestión de Comandos y Dirigentes Territoriales MIGATO • Monagas 2026
 */
import { MONAGAS_TERRITORIO_COMPLETO } from "../../earth-monagas/js/monagasSectoresCatalog.js?v=243";
import { SECTORES_LAPUENTE, SUBPARROQUIAS_GODOS } from "../../earth-monagas/js/geoMonagas.js?v=243";
import {
  getAllAssignments,
  getAssignment,
  saveAssignment,
  bulkAssign,
  removeAssignment,
  getLeaderPool,
  upsertDirigente,
  deleteDirigente,
  exportAllData,
  importAllData
} from "./comandoStorage.js?v=243";

function isMatchingEje(secEjeId, filterEjeId) {
  if (!filterEjeId || filterEjeId === "todos") return true;
  if (!secEjeId) return false;
  const s1 = String(secEjeId).trim().toLowerCase();
  const s2 = String(filterEjeId).trim().toLowerCase();
  if (s1 === s2) return true;
  // Soportar alias entre SUBPAR-1788965549962 y sub-godos-6 (Subparroquia 6 La Puente)
  const isP1 = s1 === "subpar-1788965549962" || s1 === "sub-godos-6" || s1.includes("puente") || s1.includes("godos-6");
  const isP2 = s2 === "subpar-1788965549962" || s2 === "sub-godos-6" || s2.includes("puente") || s2.includes("godos-6");
  if (isP1 && isP2) return true;
  return false;
}

class ComandosApp {
  constructor() {
    this.currentMunId = "maturin";
    this.currentParishId = "alto-de-los-godos";
    this.currentEjeId = "todos";
    this.initialSecId = null;
    this.selectedLeaderId = null;
    this.selectedSectorIds = new Set();
    this.activeTab = "tab-asignacion";

    this.init();
  }

  init() {
    this.readUrlParams();
    this.setupTabs();
    this.setupTerritorySelectors();
    this.setupLeaderPoolSelector();
    this.setupModalDirigente();
    this.setupEventListeners();
    this.renderActiveView();
    this.setupStorageSync();

    // Auto-focus y scroll hacia el sector preseleccionado si viene desde el mapa
    if (this.initialSecId) {
      setTimeout(() => {
        const targetCard = document.querySelector(`[data-sector-id="${this.initialSecId}"]`);
        if (targetCard) {
          targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
          targetCard.classList.add("ring-2", "ring-amber-400", "border-amber-400", "bg-amber-950/40");
        }
        const selectLeader = document.getElementById("select-leader-pool");
        if (selectLeader) selectLeader.focus();
        this.showToast(`Sector preseleccionado. Selecciona un dirigente y asigna en 1 clic.`, "info");
      }, 350);
    }
  }

  readUrlParams() {
    try {
      const url = new URL(window.location.href);
      const mun = url.searchParams.get("mun");
      const p = url.searchParams.get("p");
      const eje = url.searchParams.get("eje");
      const sec = url.searchParams.get("sec");
      const tab = url.searchParams.get("tab");

      if (mun) this.currentMunId = mun.toLowerCase().trim();
      if (p) this.currentParishId = p.toLowerCase().trim();
      if (eje) this.currentEjeId = eje.trim();
      if (sec) {
        this.initialSecId = sec.trim();
        this.selectedSectorIds.add(this.initialSecId);
      }
      if (tab) this.activeTab = tab;
    } catch (e) {}
  }

  setupTabs() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const targetTab = btn.dataset.tab;
        this.switchTab(targetTab);
      });
    });
  }

  switchTab(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll(".tab-btn").forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.classList.add("bg-amber-500", "text-slate-950", "shadow-lg");
        btn.classList.remove("text-slate-300", "hover:bg-slate-800/80");
      } else {
        btn.classList.remove("bg-amber-500", "text-slate-950", "shadow-lg");
        btn.classList.add("text-slate-300", "hover:bg-slate-800/80");
      }
    });

    document.querySelectorAll(".tab-content").forEach(content => {
      if (content.id === tabId) {
        content.classList.add("active");
      } else {
        content.classList.remove("active");
      }
    });

    if (tabId === "tab-asignacion") {
      this.renderSectoresList();
    } else if (tabId === "tab-directorio") {
      this.renderDirectorio();
    } else if (tabId === "tab-cobertura") {
      this.renderCobertura();
    }

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch (e) {}
    }
  }

  setupTerritorySelectors() {
    const selectMun = document.getElementById("select-mun");
    const selectParish = document.getElementById("select-parish");
    const selectEje = document.getElementById("select-eje");

    if (!selectMun || !selectParish || !selectEje) return;

    // Poblar Municipios
    selectMun.innerHTML = "";
    MONAGAS_TERRITORIO_COMPLETO.forEach(mun => {
      const opt = document.createElement("option");
      opt.value = mun.id;
      opt.textContent = `${mun.nombre} (${(mun.parroquias || []).length} Parroquias)`;
      if (mun.id === this.currentMunId) opt.selected = true;
      selectMun.appendChild(opt);
    });

    selectMun.addEventListener("change", () => {
      this.currentMunId = selectMun.value;
      this.updateParishSelector();
    });

    selectParish.addEventListener("change", () => {
      this.currentParishId = selectParish.value;
      this.updateEjeSelector();
    });

    selectEje.addEventListener("change", () => {
      this.currentEjeId = selectEje.value;
      this.selectedSectorIds.clear();
      this.renderSectoresList();
    });

    this.updateParishSelector();
  }

  updateParishSelector() {
    const selectParish = document.getElementById("select-parish");
    if (!selectParish) return;

    const mun = MONAGAS_TERRITORIO_COMPLETO.find(m => m.id === this.currentMunId) || MONAGAS_TERRITORIO_COMPLETO[0];
    selectParish.innerHTML = "";

    const parroquias = mun?.parroquias || [];
    let found = false;

    parroquias.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = `${p.nombre}`;
      if (p.id === this.currentParishId) {
        opt.selected = true;
        found = true;
      }
      selectParish.appendChild(opt);
    });

    if (!found && parroquias.length > 0) {
      this.currentParishId = parroquias[0].id;
      selectParish.value = this.currentParishId;
    }

    this.updateEjeSelector();
  }

  updateEjeSelector() {
    const selectEje = document.getElementById("select-eje");
    if (!selectEje) return;

    const mun = MONAGAS_TERRITORIO_COMPLETO.find(m => m.id === this.currentMunId);
    const parish = (mun?.parroquias || []).find(p => p.id === this.currentParishId);

    selectEje.innerHTML = '<option value="todos">🌟 Todos los Ejes Territoriales</option>';

    let subparroquias = parish?.subparroquias ? [...parish.subparroquias] : [];

    // Caso especial Alto de los Godos: únicamente Sub-Parroquia 6 La Puente
    if (this.currentParishId === "alto-de-los-godos") {
      subparroquias = [
        {
          id: "SUBPAR-1788965549962",
          nombre: "Sub-Parroquia 6 • La Puente",
          sectores: []
        }
      ];
    }

    // Si viene un sector preseleccionado (sec), buscar a qué eje pertenece para auto-enfocarlo
    if (this.initialSecId) {
      const allSecs = this.getActiveSectores(true);
      const targetSec = allSecs.find(s => String(s.id) === String(this.initialSecId));
      if (targetSec && targetSec.subParroquiaId) {
        this.currentEjeId = targetSec.subParroquiaId;
        this.selectedSectorIds.add(String(this.initialSecId));
      }
    }

    subparroquias.forEach(sp => {
      const opt = document.createElement("option");
      opt.value = sp.id;
      opt.textContent = sp.nombre || `Eje ${sp.id}`;
      if (sp.id === this.currentEjeId || isMatchingEje(sp.id, this.currentEjeId)) {
        opt.selected = true;
        this.currentEjeId = sp.id; // normalizar con la opción del select
      }
      selectEje.appendChild(opt);
    });

    this.renderSectoresList();
  }

  /**
   * Obtiene la lista unificada de sectores para el municipio, parroquia y eje activos
   */
  getActiveSectores(ignoreEjeFilter = false) {
    const mun = MONAGAS_TERRITORIO_COMPLETO.find(m => m.id === this.currentMunId);
    const parish = (mun?.parroquias || []).find(p => p.id === this.currentParishId);
    if (!parish) return [];

    let rawSectores = [];

    // Si es Alto de los Godos, integrar sectores oficiales + SECTORES_LAPUENTE
    if (this.currentParishId === "alto-de-los-godos") {
      // 1. Agregar sectores oficiales de la base
      (parish.subparroquias || []).forEach(sp => {
        (sp.sectores || []).forEach(sec => {
          rawSectores.push({
            ...sec,
            subParroquiaId: sp.id,
            subParroquiaNombre: sp.nombre,
            parroquiaId: this.currentParishId,
            municipioId: this.currentMunId
          });
        });
      });

      // 2. Integrar SECTORES_LAPUENTE preservando su ID de eje oficial
      SECTORES_LAPUENTE.forEach(sec => {
        if (!rawSectores.some(s => String(s.id) === String(sec.id))) {
          rawSectores.push({
            ...sec,
            subParroquiaId: sec.subParroquiaId || "SUBPAR-1788965549962",
            subParroquiaNombre: "Subparroquia 6 • La Puente",
            parroquiaId: "alto-de-los-godos",
            municipioId: "maturin"
          });
        }
      });
    } else {
      (parish.subparroquias || []).forEach(sp => {
        (sp.sectores || []).forEach(sec => {
          rawSectores.push({
            ...sec,
            subParroquiaId: sp.id,
            subParroquiaNombre: sp.nombre,
            parroquiaId: this.currentParishId,
            municipioId: this.currentMunId
          });
        });
      });
    }

    // Filtrar por eje si no está en "todos" y no se ignora el filtro
    if (!ignoreEjeFilter && this.currentEjeId && this.currentEjeId !== "todos") {
      rawSectores = rawSectores.filter(s => isMatchingEje(s.subParroquiaId, this.currentEjeId));
    }

    return rawSectores;
  }

  /**
   * Configura el selector de dirigentes del pool central
   */
  setupLeaderPoolSelector() {
    this.refreshLeaderPoolSelector();

    const select = document.getElementById("select-leader-pool");
    if (select) {
      select.addEventListener("change", () => {
        this.selectedLeaderId = select.value || null;
        this.renderSelectedLeaderDetails();
      });
    }
  }

  refreshLeaderPoolSelector() {
    const select = document.getElementById("select-leader-pool");
    if (!select) return;

    const pool = getLeaderPool();
    const currentVal = this.selectedLeaderId || select.value;

    select.innerHTML = '<option value="">-- Seleccionar Dirigente del Pool --</option>';

    pool.forEach(dir => {
      const opt = document.createElement("option");
      opt.value = dir.id;
      opt.textContent = `${dir.nombre} • ${dir.cargo || "Dirigente"}${dir.cedula ? ' (' + dir.cedula + ')' : ''}`;
      if (String(dir.id) === String(currentVal)) {
        opt.selected = true;
        this.selectedLeaderId = dir.id;
      }
      select.appendChild(opt);
    });

    this.renderSelectedLeaderDetails();
  }

  renderSelectedLeaderDetails() {
    const box = document.getElementById("box-leader-details");
    if (!box) return;

    if (!this.selectedLeaderId) {
      box.innerHTML = `
        <div class="text-center py-4 text-slate-400 text-xs">
          <i data-lucide="user-check" class="w-7 h-7 mx-auto text-slate-500 mb-1.5 opacity-60"></i>
          <p>Selecciona un dirigente para ver su credencial fija y asignarlo a los sectores marcados.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    const pool = getLeaderPool();
    const dir = pool.find(d => String(d.id) === String(this.selectedLeaderId));
    if (!dir) {
      this.selectedLeaderId = null;
      box.innerHTML = `
        <div class="text-center py-4 text-slate-400 text-xs">
          <p class="text-rose-400">Dirigente no encontrado en el pool.</p>
        </div>
      `;
      return;
    }

    // Contar sectores asignados actualmente
    const assignments = getAllAssignments();
    const assignedSectors = Object.values(assignments).filter(as => 
      (as.cedula && dir.cedula && as.cedula.trim().toUpperCase() === dir.cedula.trim().toUpperCase()) ||
      (as.nombre && as.nombre.trim().toLowerCase() === dir.nombre.trim().toLowerCase())
    );

    const cleanTelf = (dir.telefono || "").replace(/[^0-9+]/g, "");
    const waLink = cleanTelf ? `https://wa.me/${cleanTelf.replace('+', '')}` : null;

    box.innerHTML = `
      <div class="flex items-start justify-between gap-2 border-b border-[#2d1f85]/80 pb-2.5">
        <div>
          <span class="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">Credencial Oficial</span>
          <h4 class="font-black text-sm text-white flex items-center gap-1.5 mt-0.5">
            ${dir.nombre}
          </h4>
        </div>
        <button type="button" class="btn-edit-current-leader text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition cursor-pointer" title="Editar datos institucionales de este dirigente">
          <i data-lucide="edit-3" class="w-3 h-3"></i>
          <span>Editar</span>
        </button>
      </div>

      <!-- Cargo Institucional Fijo -->
      <div class="bg-purple-950/60 border border-purple-500/40 rounded-xl p-2.5 flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 min-w-0">
          <div class="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
            <i data-lucide="shield-check" class="w-4 h-4"></i>
          </div>
          <div class="min-w-0">
            <span class="text-[10px] font-black uppercase tracking-wider text-purple-300 block">Cargo Institucional Fijo</span>
            <span class="font-black text-xs text-white truncate block">${dir.cargo || "Jefe de Comando Sectorial"}</span>
          </div>
        </div>
        <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 shrink-0">
          ${assignedSectors.length} Sectores
        </span>
      </div>

      <!-- Datos de Contacto y Profesión -->
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
          <span class="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Cédula</span>
          <span class="font-mono font-bold text-amber-300">${dir.cedula || "No registrada"}</span>
        </div>
        <div class="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
          <span class="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Profesión</span>
          <span class="font-medium text-slate-200 truncate block">${dir.profesion || "No especificada"}</span>
        </div>
      </div>

      <div class="flex items-center justify-between gap-2 pt-1">
        <div class="flex items-center gap-1.5 text-xs font-mono text-slate-300 truncate">
          <i data-lucide="phone" class="w-3.5 h-3.5 text-slate-400 shrink-0"></i>
          <span class="truncate">${dir.telefono || "Sin teléfono"}</span>
        </div>
        ${waLink ? `
          <a href="${waLink}" target="_blank" class="py-1 px-2.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center gap-1 transition" title="Contactar por WhatsApp">
            <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
            <span>WhatsApp</span>
          </a>
        ` : ''}
      </div>
    `;

    box.querySelector(".btn-edit-current-leader")?.addEventListener("click", () => {
      this.openModalDirigente(dir);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  /**
   * Configura la ventana modal para crear y editar dirigentes en el pool
   */
  setupModalDirigente() {
    const modal = document.getElementById("modal-dirigente");
    const btnClose = document.getElementById("btn-modal-close");
    const btnCancel = document.getElementById("btn-modal-cancel");
    const form = document.getElementById("form-modal-dirigente");

    const quickNewBtn = document.getElementById("btn-quick-new-dirigente");
    const tab2NewBtn = document.getElementById("btn-nuevo-dirigente-tab2");

    quickNewBtn?.addEventListener("click", () => this.openModalDirigente());
    tab2NewBtn?.addEventListener("click", () => this.openModalDirigente());

    btnClose?.addEventListener("click", () => this.closeModalDirigente());
    btnCancel?.addEventListener("click", () => this.closeModalDirigente());

    modal?.addEventListener("click", (e) => {
      if (e.target === modal) this.closeModalDirigente();
    });

    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSaveModalDirigente();
    });
  }

  openModalDirigente(dir = null) {
    const modal = document.getElementById("modal-dirigente");
    const title = document.getElementById("modal-dirigente-title");
    const inputId = document.getElementById("modal-input-id");
    const inputNombre = document.getElementById("modal-input-nombre");
    const inputCedula = document.getElementById("modal-input-cedula");
    const inputTelf = document.getElementById("modal-input-telefono");
    const inputCargo = document.getElementById("modal-input-cargo");
    const inputProf = document.getElementById("modal-input-profesion");
    const inputNotas = document.getElementById("modal-input-notas");

    if (!modal) return;

    if (dir) {
      if (title) title.textContent = "Editar Dirigente en Pool";
      if (inputId) inputId.value = dir.id || "";
      if (inputNombre) inputNombre.value = dir.nombre || "";
      if (inputCedula) inputCedula.value = dir.cedula || "";
      if (inputTelf) inputTelf.value = dir.telefono || "";
      if (inputCargo) inputCargo.value = dir.cargo || "Jefe de Comando Sectorial";
      if (inputProf) inputProf.value = dir.profesion || "";
      if (inputNotas) inputNotas.value = dir.notas || "";
    } else {
      if (title) title.textContent = "Registrar Nuevo Dirigente";
      if (inputId) inputId.value = "";
      if (inputNombre) inputNombre.value = "";
      if (inputCedula) inputCedula.value = "";
      if (inputTelf) inputTelf.value = "";
      if (inputCargo) inputCargo.value = "Jefe de Comando Sectorial";
      if (inputProf) inputProf.value = "";
      if (inputNotas) inputNotas.value = "";
    }

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    inputNombre?.focus();
    if (window.lucide) window.lucide.createIcons();
  }

  closeModalDirigente() {
    const modal = document.getElementById("modal-dirigente");
    if (!modal) return;
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }

  handleSaveModalDirigente() {
    const inputId = document.getElementById("modal-input-id");
    const inputNombre = document.getElementById("modal-input-nombre");
    const inputCedula = document.getElementById("modal-input-cedula");
    const inputTelf = document.getElementById("modal-input-telefono");
    const inputCargo = document.getElementById("modal-input-cargo");
    const inputProf = document.getElementById("modal-input-profesion");
    const inputNotas = document.getElementById("modal-input-notas");

    const nombre = inputNombre?.value?.trim();
    if (!nombre) {
      alert("Debes ingresar el nombre del dirigente.");
      inputNombre?.focus();
      return;
    }

    const payload = {
      id: inputId?.value || undefined,
      nombre,
      cedula: inputCedula?.value?.trim() || "",
      telefono: inputTelf?.value?.trim() || "",
      cargo: inputCargo?.value || "Jefe de Comando Sectorial",
      profesion: inputProf?.value?.trim() || "",
      notas: inputNotas?.value?.trim() || ""
    };

    const saved = upsertDirigente(payload);
    if (saved) {
      this.selectedLeaderId = saved.id;
      this.refreshLeaderPoolSelector();
      this.renderDirectorio();
      this.closeModalDirigente();
      this.showToast(`✅ Dirigente ${saved.nombre} guardado en el pool`, "success");
    }
  }

  setupEventListeners() {
    // Checkbox Maestro Seleccionar Todos
    const checkAll = document.getElementById("check-select-all-sectors");
    if (checkAll) {
      checkAll.addEventListener("change", (e) => {
        const sectores = this.getActiveSectores();
        if (e.target.checked) {
          sectores.forEach(s => this.selectedSectorIds.add(String(s.id)));
        } else {
          this.selectedSectorIds.clear();
        }
        this.renderSectoresList();
      });
    }

    // Botón Asignar en Lote
    const formBulk = document.getElementById("form-bulk-assignment");
    if (formBulk) {
      formBulk.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleBulkAssignment();
      });
    }

    // Buscador en Directorio
    const searchDir = document.getElementById("input-search-directorio");
    if (searchDir) {
      searchDir.addEventListener("input", () => {
        this.renderDirectorio(searchDir.value.trim().toLowerCase());
      });
    }

    // Backup: Exportar JSON
    const btnExportJson = document.getElementById("btn-export-json");
    if (btnExportJson) {
      btnExportJson.addEventListener("click", () => this.exportBackupJson());
    }

    // Backup: Exportar CSV
    const btnExportCsv = document.getElementById("btn-export-csv");
    if (btnExportCsv) {
      btnExportCsv.addEventListener("click", () => this.exportDirectoryCsv());
    }

    // Backup: Importar JSON
    const inputImportJson = document.getElementById("input-import-json");
    if (inputImportJson) {
      inputImportJson.addEventListener("change", (e) => this.handleImportJson(e));
    }
  }

  setupStorageSync() {
    window.addEventListener("storage", (e) => {
      if (e.key === "migato_comandos_asignados" || e.key === "migato_pool_dirigentes_v1") {
        this.refreshLeaderPoolSelector();
        this.renderActiveView();
      }
    });

    window.addEventListener("migato:comandos-updated", () => {
      this.refreshLeaderPoolSelector();
      this.renderActiveView();
    });
  }

  renderActiveView() {
    if (this.activeTab === "tab-asignacion") {
      this.renderSectoresList();
    } else if (this.activeTab === "tab-directorio") {
      this.renderDirectorio();
    } else if (this.activeTab === "tab-cobertura") {
      this.renderCobertura();
    }
  }

  /**
   * Renderiza la lista de sectores con checkboxes y estatus de comando asignado
   */
  renderSectoresList() {
    const container = document.getElementById("sectores-list-container");
    const countBadge = document.getElementById("selected-sectors-count-badge");
    const checkAll = document.getElementById("check-select-all-sectors");
    if (!container) return;

    const sectores = this.getActiveSectores();
    const assignments = getAllAssignments();

    if (countBadge) {
      countBadge.textContent = `${this.selectedSectorIds.size} seleccionados de ${sectores.length}`;
    }

    if (checkAll) {
      checkAll.checked = sectores.length > 0 && this.selectedSectorIds.size === sectores.length;
    }

    if (sectores.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center text-slate-400">
          <i data-lucide="map-pin-off" class="w-10 h-10 mx-auto text-slate-500 mb-2"></i>
          <p class="font-bold">No se encontraron sectores registrados para el filtro seleccionado.</p>
          <p class="text-xs text-slate-500 mt-1">Selecciona otro Municipio, Parroquia o Eje.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = "";

    sectores.forEach(sec => {
      const secId = String(sec.id);
      const isSelected = this.selectedSectorIds.has(secId);
      const assignment = assignments[secId];

      const itemCard = document.createElement("div");
      itemCard.setAttribute("data-sector-id", secId);
      itemCard.className = `p-3 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isSelected
          ? "bg-amber-950/30 border-amber-400 shadow-md ring-2 ring-amber-400/50"
          : assignment
          ? "bg-[#140e40]/70 border-emerald-500/30 hover:border-emerald-500/60"
          : "bg-[#140e40]/40 border-[#2d1f85]/60 hover:border-slate-600"
      }`;

      // Left: Checkbox y Datos del Sector
      const leftCol = document.createElement("div");
      leftCol.className = "flex items-start sm:items-center gap-3 min-w-0 flex-1";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.className = "custom-checkbox shrink-0 mt-0.5 sm:mt-0";
      cb.checked = isSelected;
      cb.addEventListener("change", (e) => {
        if (e.target.checked) {
          this.selectedSectorIds.add(secId);
        } else {
          this.selectedSectorIds.delete(secId);
        }
        this.renderSectoresList();
      });

      const infoDiv = document.createElement("div");
      infoDiv.className = "min-w-0 flex-1";

      const titleH = document.createElement("h4");
      titleH.className = "font-black text-sm text-white flex items-center gap-2 truncate";
      titleH.innerHTML = `
        <span class="truncate">${sec.nombre || "Sector sin nombre"}</span>
        <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">ID: ${secId}</span>
      `;

      const metaP = document.createElement("p");
      metaP.className = "text-xs text-slate-400 flex items-center gap-3 mt-0.5 flex-wrap";
      metaP.innerHTML = `
        <span class="flex items-center gap-1 text-purple-300">
          <i data-lucide="layers" class="w-3 h-3"></i> ${sec.subParroquiaNombre || "Eje General"}
        </span>
        ${sec.casas ? `<span class="font-mono">🏠 ${sec.casas} casas</span>` : ''}
        ${sec.habitantes ? `<span class="font-mono">👥 ${sec.habitantes} hab.</span>` : ''}
      `;

      infoDiv.appendChild(titleH);
      infoDiv.appendChild(metaP);
      leftCol.appendChild(cb);
      leftCol.appendChild(infoDiv);

      // Right: Estado de Asignación / Botones
      const rightCol = document.createElement("div");
      rightCol.className = "flex items-center gap-2 shrink-0 self-end sm:self-auto";

      if (assignment) {
        const cleanTelf = (assignment.telefono || "").replace(/[^0-9+]/g, "");
        const waLink = cleanTelf ? `https://wa.me/${cleanTelf.replace('+', '')}` : null;

        rightCol.innerHTML = `
          <div class="text-right">
            <span class="text-[11px] font-black text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <i data-lucide="shield-check" class="w-3 h-3"></i> ${assignment.cargo || "Jefe de Comando"}
            </span>
            <div class="text-xs font-bold text-white truncate max-w-[200px]">${assignment.nombre}</div>
            <div class="text-[11px] font-mono text-slate-400">${assignment.telefono || "Sin teléfono"}</div>
          </div>
          ${waLink ? `
            <a href="${waLink}" target="_blank" class="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/50 text-emerald-300 transition" title="Contactar por WhatsApp">
              <i data-lucide="message-circle" class="w-4 h-4"></i>
            </a>
          ` : ''}
          <button type="button" class="btn-remove-assign p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 transition cursor-pointer" title="Desvincular comando de este sector">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        `;

        const btnRemove = rightCol.querySelector(".btn-remove-assign");
        if (btnRemove) {
          btnRemove.addEventListener("click", () => {
            if (confirm(`¿Desvincular al responsable ${assignment.nombre} de ${sec.nombre}?`)) {
              removeAssignment(secId);
              this.showToast(`Comando desvinculado de ${sec.nombre}`, "warning");
              this.renderSectoresList();
            }
          });
        }
      } else {
        rightCol.innerHTML = `
          <span class="text-[11px] font-bold text-slate-400 bg-slate-900/80 border border-slate-700 px-2 py-1 rounded-lg inline-flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Sin Asignar
          </span>
          <button type="button" class="btn-quick-fill py-1 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-black transition cursor-pointer" title="Marcar sólo este sector para asignar">
            + Asignar
          </button>
        `;

        const btnQuick = rightCol.querySelector(".btn-quick-fill");
        if (btnQuick) {
          btnQuick.addEventListener("click", () => {
            this.selectedSectorIds.clear();
            this.selectedSectorIds.add(secId);
            this.renderSectoresList();
            document.getElementById("select-leader-pool")?.focus();
          });
        }
      }

      itemCard.appendChild(leftCol);
      itemCard.appendChild(rightCol);
      container.appendChild(itemCard);
    });

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch (e) {}
    }
  }

  /**
   * Ejecuta la asignación en lote del dirigente seleccionado a todos los sectores marcados
   */
  handleBulkAssignment() {
    if (this.selectedSectorIds.size === 0) {
      alert("Por favor selecciona al menos un sector de la lista marcando las casillas.");
      return;
    }

    if (!this.selectedLeaderId) {
      alert("Por favor selecciona un dirigente del pool para asignarlo a los sectores marcados.");
      const sel = document.getElementById("select-leader-pool");
      if (sel) sel.focus();
      return;
    }

    const pool = getLeaderPool();
    const leader = pool.find(d => String(d.id) === String(this.selectedLeaderId));
    if (!leader) {
      alert("El dirigente seleccionado no se encuentra en el pool.");
      return;
    }

    const targetList = [];
    const allSectores = this.getActiveSectores();

    this.selectedSectorIds.forEach(id => {
      const sec = allSectores.find(s => String(s.id) === String(id));
      targetList.push({
        id,
        nombre: sec ? sec.nombre : id,
        municipioId: this.currentMunId,
        parroquiaId: this.currentParishId,
        subParroquiaId: sec ? sec.subParroquiaId : "",
        targetType: "sector"
      });
    });

    const assigned = bulkAssign(targetList, leader);

    this.showToast(`✅ ${leader.nombre} (${leader.cargo}) asignado con éxito a ${assigned.length} sectores.`, "success");

    // Limpiar selección y refrescar vistas
    this.selectedSectorIds.clear();
    this.renderSectoresList();
    this.renderSelectedLeaderDetails();
    this.renderDirectorio();
  }

  /**
   * Renderiza el directorio / pool central de cuadros y dirigentes
   */
  renderDirectorio(filterQuery = "") {
    const tableBody = document.getElementById("directorio-table-body");
    const countBadge = document.getElementById("total-dirigentes-badge");
    if (!tableBody) return;

    let pool = getLeaderPool();
    const assignments = getAllAssignments();

    // Contar cuántos sectores tiene asignado cada dirigente
    const assignmentCounts = {};
    Object.values(assignments).forEach(as => {
      const name = (as.nombre || "").trim().toLowerCase();
      assignmentCounts[name] = (assignmentCounts[name] || 0) + 1;
    });

    if (countBadge) {
      countBadge.textContent = `${pool.length} Registrados`;
    }

    if (filterQuery) {
      pool = pool.filter(d => 
        d.nombre.toLowerCase().includes(filterQuery) ||
        (d.cedula && d.cedula.toLowerCase().includes(filterQuery)) ||
        (d.telefono && d.telefono.includes(filterQuery)) ||
        (d.cargo && d.cargo.toLowerCase().includes(filterQuery)) ||
        (d.profesion && d.profesion.toLowerCase().includes(filterQuery))
      );
    }

    if (pool.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="p-8 text-center text-slate-400">
            <i data-lucide="users" class="w-8 h-8 mx-auto text-slate-500 mb-2"></i>
            No se encontraron dirigentes en el directorio con el término indicado.
          </td>
        </tr>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    tableBody.innerHTML = "";

    pool.forEach(dir => {
      const secCount = assignmentCounts[(dir.nombre || "").trim().toLowerCase()] || 0;
      const cleanTelf = (dir.telefono || "").replace(/[^0-9+]/g, "");
      const waLink = cleanTelf ? `https://wa.me/${cleanTelf.replace('+', '')}` : null;

      const tr = document.createElement("tr");
      tr.className = "border-b border-[#2d1f85]/50 hover:bg-[#140e40]/60 transition";

      tr.innerHTML = `
        <td class="p-3.5">
          <div class="font-black text-white text-sm">${dir.nombre}</div>
          <div class="text-xs text-slate-400">${dir.profesion || "Profesión no indicada"}</div>
        </td>
        <td class="p-3.5 font-mono text-xs font-bold text-amber-300">
          ${dir.cedula || "No registrada"}
        </td>
        <td class="p-3.5">
          <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-950 border border-purple-500/40 text-purple-300">
            ${dir.cargo || "Jefe de Comando"}
          </span>
        </td>
        <td class="p-3.5 font-mono text-xs text-slate-300">
          <div class="flex items-center gap-2">
            <span>${dir.telefono || "—"}</span>
            ${waLink ? `
              <a href="${waLink}" target="_blank" class="text-emerald-400 hover:text-emerald-300 transition" title="Enviar WhatsApp">
                <i data-lucide="message-circle" class="w-4 h-4"></i>
              </a>
            ` : ''}
          </div>
        </td>
        <td class="p-3.5 text-center">
          <span class="font-black font-mono px-2.5 py-1 rounded-lg ${secCount > 0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50' : 'bg-slate-900 text-slate-400'}">
            ${secCount}
          </span>
        </td>
        <td class="p-3.5 text-right whitespace-nowrap">
          <button type="button" class="btn-use-leader py-1.5 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-400/40 transition cursor-pointer mr-1" title="Asignar este dirigente a sectores">
            ⚡ Asignar
          </button>
          <button type="button" class="btn-edit-leader p-1.5 rounded-lg bg-sky-950/40 hover:bg-sky-900/60 text-sky-300 border border-sky-500/40 transition cursor-pointer mr-1" title="Editar datos institucionales del dirigente">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
          </button>
          <button type="button" class="btn-delete-leader p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 transition cursor-pointer" title="Eliminar del Pool">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </td>
      `;

      // Botón Usar Dirigente (Asignar)
      tr.querySelector(".btn-use-leader")?.addEventListener("click", () => {
        this.selectedLeaderId = dir.id;
        this.switchTab("tab-asignacion");
        this.refreshLeaderPoolSelector();
        const container = document.getElementById("sectores-list-container");
        if (container) container.scrollIntoView({ behavior: "smooth", block: "start" });
        this.showToast(`Dirigente preparado: ${dir.nombre} (${dir.cargo}). Selecciona los sectores a asignar.`, "info");
      });

      // Botón Editar Dirigente
      tr.querySelector(".btn-edit-leader")?.addEventListener("click", () => {
        this.openModalDirigente(dir);
      });

      // Botón Eliminar Dirigente
      tr.querySelector(".btn-delete-leader")?.addEventListener("click", () => {
        if (confirm(`¿Eliminar a ${dir.nombre} del pool de dirigentes?`)) {
          deleteDirigente(dir.id);
          if (this.selectedLeaderId === dir.id) this.selectedLeaderId = null;
          this.refreshLeaderPoolSelector();
          this.renderDirectorio(filterQuery);
          this.showToast(`Dirigente eliminado`, "warning");
        }
      });

      tableBody.appendChild(tr);
    });

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch (e) {}
    }
  }

  /**
   * Renderiza la matriz de cobertura y estadísticas
   */
  renderCobertura() {
    const assignments = getAllAssignments();
    const pool = getLeaderPool();

    let totalSectoresContados = 0;
    let totalAsignadosContados = 0;

    const parishBreakdown = [];

    const mun = MONAGAS_TERRITORIO_COMPLETO.find(m => m.id === "maturin") || MONAGAS_TERRITORIO_COMPLETO[0];

    (mun?.parroquias || []).forEach(p => {
      let pSectores = 0;
      let pAsignados = 0;

      (p.subparroquias || []).forEach(sp => {
        (sp.sectores || []).forEach(sec => {
          pSectores++;
          if (assignments[String(sec.id)]) {
            pAsignados++;
          }
        });
      });

      // Si es Alto de los Godos, incluir SECTORES_LAPUENTE
      if (p.id === "alto-de-los-godos") {
        SECTORES_LAPUENTE.forEach(sec => {
          pSectores++;
          if (assignments[String(sec.id)]) {
            pAsignados++;
          }
        });
      }

      totalSectoresContados += pSectores;
      totalAsignadosContados += pAsignados;

      const pct = pSectores > 0 ? Math.round((pAsignados / pSectores) * 100) : 0;
      parishBreakdown.push({
        id: p.id,
        nombre: p.nombre,
        sectores: pSectores,
        asignados: pAsignados,
        vacantes: pSectores - pAsignados,
        porcentaje: pct
      });
    });

    // Actualizar KPIs Globales
    const elTotal = document.getElementById("kpi-cobertura-total-sectores");
    const elAsignados = document.getElementById("kpi-cobertura-asignados");
    const elVacantes = document.getElementById("kpi-cobertura-vacantes");
    const elPool = document.getElementById("kpi-cobertura-pool");

    if (elTotal) elTotal.textContent = totalSectoresContados;
    if (elAsignados) {
      const pctGlobal = totalSectoresContados > 0 ? Math.round((totalAsignadosContados / totalSectoresContados) * 100) : 0;
      elAsignados.textContent = `${totalAsignadosContados} (${pctGlobal}%)`;
    }
    if (elVacantes) elVacantes.textContent = totalSectoresContados - totalAsignadosContados;
    if (elPool) elPool.textContent = pool.length;

    // Renderizar desglose por parroquia
    const container = document.getElementById("cobertura-parroquias-container");
    if (!container) return;

    container.innerHTML = "";

    parishBreakdown.forEach(p => {
      const card = document.createElement("div");
      card.className = "p-4 rounded-xl bg-[#140e40]/70 border border-[#2d1f85] space-y-2.5";

      card.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="font-black text-white text-sm">${p.nombre}</div>
          <span class="font-mono text-xs font-black px-2 py-0.5 rounded ${
            p.porcentaje >= 80 ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
            p.porcentaje >= 40 ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
            'bg-rose-950 text-rose-300 border border-rose-500/40'
          }">
            ${p.porcentaje}% Cobertura
          </span>
        </div>

        <!-- Barra de Progreso -->
        <div class="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-700">
          <div class="h-full rounded-full transition-all duration-500 ${
            p.porcentaje >= 80 ? 'bg-emerald-500' : p.porcentaje >= 40 ? 'bg-amber-500' : 'bg-rose-500'
          }" style="width: ${p.porcentaje}%"></div>
        </div>

        <div class="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>🟢 Asignados: <b class="text-emerald-400">${p.asignados}</b></span>
          <span>⚪ Vacantes: <b class="text-rose-400">${p.vacantes}</b></span>
          <span>Total: <b>${p.sectores}</b></span>
        </div>
      `;

      container.appendChild(card);
    });
  }

  exportBackupJson() {
    const data = exportAllData();
    const str = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const a = document.createElement("a");
    a.setAttribute("href", str);
    a.setAttribute("download", `MIGATO_Comandos_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    this.showToast("Backup JSON descargado correctamente", "success");
  }

  exportDirectoryCsv() {
    const assignments = getAllAssignments();
    const rows = [
      ["Sector ID", "Nombre Sector", "Municipio", "Parroquia", "Subparroquia / Eje", "Responsable", "Cedula", "Telefono", "Cargo", "Profesion", "Fecha Asignacion"]
    ];

    Object.values(assignments).forEach(as => {
      rows.push([
        `"${as.id || ''}"`,
        `"${as.targetName || ''}"`,
        `"${as.municipioId || ''}"`,
        `"${as.parroquiaId || ''}"`,
        `"${as.subParroquiaId || ''}"`,
        `"${as.nombre || ''}"`,
        `"${as.cedula || ''}"`,
        `"${as.telefono || ''}"`,
        `"${as.cargo || ''}"`,
        `"${as.profesion || ''}"`,
        `"${as.fechaAsignacion || ''}"`
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + rows.map(e => e.join(",")).join("\n");
    const a = document.createElement("a");
    a.setAttribute("href", encodeURI(csvContent));
    a.setAttribute("download", `MIGATO_Directorio_Comandos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    this.showToast("Directorio CSV exportado para Excel", "success");
  }

  handleImportJson(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (importAllData(json)) {
          this.showToast("Backup importado y sincronizado con éxito", "success");
          this.refreshLeaderPoolSelector();
          this.renderActiveView();
        } else {
          alert("El archivo no tiene el formato esperado.");
        }
      } catch (err) {
        alert("Error al leer archivo JSON: " + err.message);
      }
    };
    reader.readAsText(file);
  }

  showToast(message, type = "info") {
    const toast = document.getElementById("toast-notification");
    const toastMsg = document.getElementById("toast-message");
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;

    if (type === "success") {
      toast.className = "fixed bottom-6 right-6 z-[9999] px-4 py-3 rounded-2xl bg-emerald-600 text-white font-bold shadow-2xl flex items-center gap-2 show";
    } else if (type === "warning") {
      toast.className = "fixed bottom-6 right-6 z-[9999] px-4 py-3 rounded-2xl bg-amber-600 text-white font-bold shadow-2xl flex items-center gap-2 show";
    } else {
      toast.className = "fixed bottom-6 right-6 z-[9999] px-4 py-3 rounded-2xl bg-[#1d1554] border border-[#2d1f85] text-white font-bold shadow-2xl flex items-center gap-2 show";
    }

    setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  }
}

// Iniciar aplicación al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
  window.comandosApp = new ComandosApp();
});
