/**
 * Aplicación de Gestión y Carga Rápida de Comandos Dateros MIGATO 2026
 * 
 * Estructura de 58 Posiciones:
 * - 1 Central Estatal (Sala Central Monagas)
 * - 13 Jefes Municipales (13 Municipios)
 * - 44 Dateros Sectoriales (44 Parroquias)
 */

import {
  CATALOGO_POSICIONES_DATEROS,
  getAllComandosDateros,
  saveComandoDatero,
  removeComandoDatero,
  getComandosDaterosStats,
  exportDaterosCSV,
  exportDaterosJSON
} from "./comandoStorage.js?v=270";

class ComandosDaterosApp {
  constructor() {
    this.currentLevelFilter = "all";
    this.currentMunFilter = "all";
    this.currentStatusFilter = "all";
    this.searchQuery = "";

    // Estado del modal de asignación rápida
    this.modalActivePositionId = null;
    this.modalSelectedLevel = "sectorial";

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupModalControls();
    this.readUrlParams();
    this.renderKPIs();
    this.renderTable();
    this.setupStorageSync();
  }

  readUrlParams() {
    try {
      const url = new URL(window.location.href);
      const mun = url.searchParams.get("mun");
      const p = url.searchParams.get("p");
      const level = url.searchParams.get("level");
      const action = url.searchParams.get("action");

      if (level && ["central", "municipal", "sectorial"].includes(level)) {
        this.currentLevelFilter = level;
        this.updateLevelPillsUI();
      }

      if (mun) {
        const selectMun = document.getElementById("select-filter-municipio");
        if (selectMun) {
          selectMun.value = mun.toLowerCase().trim();
          this.currentMunFilter = selectMun.value;
        }
      }

      if (action === "new" || p) {
        let targetPosId = null;
        if (p) {
          const matchP = CATALOGO_POSICIONES_DATEROS.find(pos => 
            pos.parroquiaId === p.toLowerCase().trim() || 
            pos.id === `parr-${p.toLowerCase().trim()}`
          );
          if (matchP) targetPosId = matchP.id;
        } else if (mun) {
          const matchM = CATALOGO_POSICIONES_DATEROS.find(pos => pos.municipioId === mun.toLowerCase().trim() && pos.nivel === "municipal");
          if (matchM) targetPosId = matchM.id;
        }

        setTimeout(() => {
          this.openModal(targetPosId || "central");
        }, 300);
      }
    } catch (e) {
      console.warn("Error leyendo URL params:", e);
    }
  }

  setupEventListeners() {
    // 1. Filtros de Nivel (Pills)
    document.querySelectorAll(".filter-level-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.currentLevelFilter = btn.dataset.level || "all";
        this.updateLevelPillsUI();
        this.renderTable();
      });
    });

    // 2. Filtro por Municipio
    const selectMun = document.getElementById("select-filter-municipio");
    if (selectMun) {
      selectMun.addEventListener("change", (e) => {
        this.currentMunFilter = e.target.value;
        this.renderTable();
      });
    }

    // 3. Filtro por Estado (Asignados vs Vacantes)
    const selectStatus = document.getElementById("select-filter-status");
    if (selectStatus) {
      selectStatus.addEventListener("change", (e) => {
        this.currentStatusFilter = e.target.value;
        this.renderTable();
      });
    }

    // 4. Buscador en Vivo
    const inputSearch = document.getElementById("input-search-datero");
    if (inputSearch) {
      inputSearch.addEventListener("input", (e) => {
        this.searchQuery = (e.target.value || "").trim().toLowerCase();
        this.renderTable();
      });
    }

    // 5. Botón Nuevo Datero (Carga Rápida)
    const btnNuevo = document.getElementById("btn-open-nuevo-datero");
    if (btnNuevo) {
      btnNuevo.addEventListener("click", () => {
        // Encontrar la primera posición vacante para pre-cargar
        const all = getAllComandosDateros();
        const firstVacant = all.find(d => !d.asignado);
        this.openModal(firstVacant ? firstVacant.id : "central");
      });
    }

    // 6. Exportar CSV
    const btnCsv = document.getElementById("btn-export-csv");
    if (btnCsv) {
      btnCsv.addEventListener("click", () => {
        exportDaterosCSV();
        this.showToast("Planilla CSV generada para Excel 📊", "success");
      });
    }

    // 7. Exportar JSON
    const btnJson = document.getElementById("btn-export-json");
    if (btnJson) {
      btnJson.addEventListener("click", () => {
        exportDaterosJSON();
        this.showToast("Respaldo JSON descargado con éxito 💾", "success");
      });
    }
  }

  updateLevelPillsUI() {
    document.querySelectorAll(".filter-level-btn").forEach(btn => {
      const isSelected = btn.dataset.level === this.currentLevelFilter;
      if (isSelected) {
        btn.className = "filter-level-btn py-1.5 px-3 rounded-lg text-xs font-black uppercase transition cursor-pointer bg-amber-500 text-slate-950 shadow-xs";
      } else {
        btn.className = "filter-level-btn py-1.5 px-3 rounded-lg text-xs font-bold uppercase transition cursor-pointer text-slate-300 hover:text-white";
      }
    });
  }

  renderKPIs() {
    const stats = getComandosDaterosStats();

    const centralEl = document.getElementById("kpi-central-val");
    if (centralEl) centralEl.textContent = `${stats.central.asignados} / ${stats.central.total}`;

    const munEl = document.getElementById("kpi-mun-val");
    if (munEl) munEl.textContent = `${stats.municipales.asignados} / ${stats.municipales.total}`;

    const secEl = document.getElementById("kpi-sec-val");
    if (secEl) secEl.textContent = `${stats.sectoriales.asignados} / ${stats.sectoriales.total}`;

    const totalEl = document.getElementById("kpi-total-val");
    if (totalEl) totalEl.textContent = `${stats.totalAsignados} / ${stats.total}`;

    const pctEl = document.getElementById("kpi-total-pct");
    if (pctEl) pctEl.textContent = `${stats.porcentaje}%`;

    const barEl = document.getElementById("kpi-progress-bar");
    if (barEl) barEl.style.width = `${stats.porcentaje}%`;
  }

  renderTable() {
    const tableBody = document.getElementById("dateros-table-body");
    const countBadge = document.getElementById("filtered-count-badge");
    if (!tableBody) return;

    let items = getAllComandosDateros();

    // 1. Filtrar por Nivel
    if (this.currentLevelFilter !== "all") {
      items = items.filter(d => d.nivel === this.currentLevelFilter);
    }

    // 2. Filtrar por Municipio
    if (this.currentMunFilter !== "all") {
      items = items.filter(d => d.municipioId === this.currentMunFilter);
    }

    // 3. Filtrar por Estado (Asignado vs Vacante)
    if (this.currentStatusFilter === "asignados") {
      items = items.filter(d => d.asignado);
    } else if (this.currentStatusFilter === "vacantes") {
      items = items.filter(d => !d.asignado);
    }

    // 4. Filtrar por Búsqueda de Texto
    if (this.searchQuery) {
      const q = this.searchQuery;
      items = items.filter(d => {
        return (d.nombre || "").toLowerCase().includes(q) ||
               (d.cedula || "").toLowerCase().includes(q) ||
               (d.telefono || "").toLowerCase().includes(q) ||
               (d.territorio || "").toLowerCase().includes(q) ||
               (d.municipioNombre || "").toLowerCase().includes(q) ||
               (d.parroquiaNombre || "").toLowerCase().includes(q) ||
               (d.rol || "").toLowerCase().includes(q);
      });
    }

    if (countBadge) {
      countBadge.textContent = `Mostrando ${items.length} de 58 posiciones`;
    }

    if (items.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="p-8 text-center text-slate-400 text-xs">
            <span class="text-2xl block mb-2">🔍</span>
            No se encontraron comandos dateros con los filtros actuales.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = items.map(d => {
      // Badge de Nivel
      let nivelBadge = "";
      if (d.nivel === "central") {
        nivelBadge = `<span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase">🏛️ Central</span>`;
      } else if (d.nivel === "municipal") {
        nivelBadge = `<span class="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-black uppercase">🏢 Municipal</span>`;
      } else {
        nivelBadge = `<span class="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-black uppercase">📍 Sectorial</span>`;
      }

      // Información de asignación
      let assignedHtml = "";
      if (d.asignado) {
        assignedHtml = `
          <div>
            <strong class="text-slate-100 font-bold block text-xs truncate">${d.nombre}</strong>
            <span class="text-[10.5px] font-mono text-slate-400 block">${d.cedula || 'C.I. No registrada'}</span>
          </div>
        `;
      } else {
        assignedHtml = `
          <div class="flex items-center gap-1.5">
            <span class="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold">
              ⚪ Vacante
            </span>
            <button type="button" onclick="window.comandosDaterosApp?.openModal('${d.id}')"
                    class="text-amber-400 hover:text-amber-300 text-[11px] font-bold underline cursor-pointer">
              + Asignar
            </button>
          </div>
        `;
      }

      // Contacto / WhatsApp
      let contactoHtml = "";
      if (d.asignado && d.telefono) {
        const cleanTelf = d.telefono.replace(/[^0-9]/g, "");
        const waLink = cleanTelf ? `https://wa.me/${cleanTelf.startsWith('58') ? cleanTelf : '58' + cleanTelf.replace(/^0+/, '')}` : '#';
        contactoHtml = `
          <a href="${waLink}" target="_blank" rel="noopener noreferrer"
             class="font-mono text-emerald-400 hover:text-emerald-300 font-bold text-xs flex items-center gap-1 transition"
             title="Enviar WhatsApp">
            <span>📱</span>
            <span>${d.telefono}</span>
          </a>
        `;
      } else {
        contactoHtml = `<span class="text-slate-500 text-xs">—</span>`;
      }

      return `
        <tr class="hover:bg-slate-800/40 transition">
          <!-- Territorio / Jurisdicción -->
          <td class="p-3.5">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full shrink-0 ${d.nivel === 'central' ? 'bg-amber-400' : d.nivel === 'municipal' ? 'bg-sky-400' : 'bg-purple-400'}"></span>
              <div class="min-w-0">
                <strong class="text-slate-100 font-black block truncate text-xs">${d.territorio}</strong>
                <span class="text-[10px] text-slate-400 block font-mono">${d.codigo || ''}</span>
              </div>
            </div>
          </td>

          <!-- Nivel -->
          <td class="p-3.5 text-center">
            ${nivelBadge}
          </td>

          <!-- Rol Datero -->
          <td class="p-3.5 font-bold text-slate-300 text-xs">
            ${d.rolAsignado || d.rol}
          </td>

          <!-- Datero Asignado -->
          <td class="p-3.5">
            ${assignedHtml}
          </td>

          <!-- Contacto -->
          <td class="p-3.5">
            ${contactoHtml}
          </td>

          <!-- Acciones -->
          <td class="p-3.5 text-right">
            <div class="flex items-center justify-end gap-1.5">
              <button type="button" onclick="window.comandosDaterosApp?.openModal('${d.id}')"
                      class="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 text-xs font-bold transition cursor-pointer"
                      title="${d.asignado ? 'Editar Asignación' : 'Asignar Datero'}">
                <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
              </button>

              ${d.asignado ? `
                <button type="button" onclick="window.comandosDaterosApp?.handleRemoveDatero('${d.id}')"
                        class="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition cursor-pointer"
                        title="Desasignar / Dejar Vacante">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join("");

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      try { window.lucide.createIcons(); } catch (e) {}
    }
  }

  setupModalControls() {
    const modal = document.getElementById("modal-datero");
    const btnClose = document.getElementById("btn-modal-close");
    const btnCancel = document.getElementById("btn-modal-cancel");
    const form = document.getElementById("form-modal-datero");

    if (btnClose) btnClose.addEventListener("click", () => this.closeModal());
    if (btnCancel) btnCancel.addEventListener("click", () => this.closeModal());

    // Tabs de nivel en modal
    document.querySelectorAll(".modal-level-choice").forEach(btn => {
      btn.addEventListener("click", () => {
        const targetLevel = btn.dataset.level;
        this.setModalLevel(targetLevel);
      });
    });

    // Cambio en selector de municipio del modal (actualiza parroquias)
    const selectMunModal = document.getElementById("modal-select-municipio");
    if (selectMunModal) {
      selectMunModal.addEventListener("change", () => {
        this.populateModalParishes(selectMunModal.value);
        this.syncModalPositionId();
      });
    }

    // Cambio en selector de parroquia del modal
    const selectParrModal = document.getElementById("modal-select-parroquia");
    if (selectParrModal) {
      selectParrModal.addEventListener("change", () => {
        this.syncModalPositionId();
      });
    }

    // Guardado del formulario
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSaveModal();
      });
    }
  }

  openModal(targetPositionId) {
    const modal = document.getElementById("modal-datero");
    if (!modal) return;

    const all = getAllComandosDateros();
    const pos = all.find(p => p.id === targetPositionId) || all[0];
    this.modalActivePositionId = pos.id;

    // Rellenar selectores de territorio
    this.populateModalMunicipios();
    this.setModalLevel(pos.nivel, pos);

    // Rellenar campos del formulario
    const inputNombre = document.getElementById("modal-input-nombre");
    const inputCedula = document.getElementById("modal-input-cedula");
    const inputTelf = document.getElementById("modal-input-telefono");
    const inputDisp = document.getElementById("modal-input-dispositivo");
    const inputNotas = document.getElementById("modal-input-notas");

    if (inputNombre) inputNombre.value = pos.nombre || "";
    if (inputCedula) inputCedula.value = pos.cedula || "";
    if (inputTelf) inputTelf.value = pos.telefono || "";
    if (inputDisp) inputDisp.value = pos.dispositivo || "";
    if (inputNotas) inputNotas.value = pos.notas || "";

    const titleEl = document.getElementById("modal-datero-title");
    if (titleEl) {
      titleEl.textContent = pos.asignado ? `Editar Comando: ${pos.territorio}` : `Asignar Comando: ${pos.territorio}`;
    }

    modal.classList.remove("hidden");
    modal.classList.add("flex");

    if (inputNombre) inputNombre.focus();
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      try { window.lucide.createIcons(); } catch (e) {}
    }
  }

  closeModal() {
    const modal = document.getElementById("modal-datero");
    if (!modal) return;
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }

  setModalLevel(level, posObj = null) {
    this.modalSelectedLevel = level;

    // Actualizar botones de nivel
    document.querySelectorAll(".modal-level-choice").forEach(btn => {
      const isSelected = btn.dataset.level === level;
      if (isSelected) {
        btn.className = "modal-level-choice py-2 px-2 rounded-lg text-xs font-black uppercase transition text-center bg-amber-500 text-slate-950 shadow-xs";
      } else {
        btn.className = "modal-level-choice py-2 px-2 rounded-lg text-xs font-bold uppercase transition text-center text-slate-300 hover:text-white";
      }
    });

    const munContainer = document.getElementById("modal-mun-container");
    const parrContainer = document.getElementById("modal-parr-container");
    const labelRol = document.getElementById("modal-label-rol");
    const labelCod = document.getElementById("modal-label-codigo");

    const selectMun = document.getElementById("modal-select-municipio");
    const selectParr = document.getElementById("modal-select-parroquia");

    if (level === "central") {
      if (munContainer) munContainer.classList.add("hidden");
      if (parrContainer) parrContainer.classList.add("hidden");
      if (labelRol) labelRol.textContent = "Jefe Datero Estatal (Central)";
      if (labelCod) labelCod.textContent = "MON-CEN";
      this.modalActivePositionId = "central";
    } else if (level === "municipal") {
      if (munContainer) munContainer.classList.remove("hidden");
      if (parrContainer) parrContainer.classList.add("hidden");
      if (labelRol) labelRol.textContent = "Jefe Datero Municipal";

      if (posObj && posObj.municipioId) {
        if (selectMun) selectMun.value = posObj.municipioId;
      }
      this.syncModalPositionId();
    } else { // sectorial
      if (munContainer) munContainer.classList.remove("hidden");
      if (parrContainer) parrContainer.classList.remove("hidden");
      if (labelRol) labelRol.textContent = "Datero Sectorial (Parroquial)";

      const munVal = (posObj && posObj.municipioId) ? posObj.municipioId : (selectMun ? selectMun.value || "maturin" : "maturin");
      if (selectMun) selectMun.value = munVal;
      this.populateModalParishes(munVal);

      if (posObj && posObj.id) {
        if (selectParr) selectParr.value = posObj.id;
      }
      this.syncModalPositionId();
    }
  }

  populateModalMunicipios() {
    const selectMun = document.getElementById("modal-select-municipio");
    if (!selectMun) return;

    const municipalPositions = CATALOGO_POSICIONES_DATEROS.filter(p => p.nivel === "municipal");
    selectMun.innerHTML = municipalPositions.map(m => `
      <option value="${m.municipioId}">${m.municipioNombre}</option>
    `).join("");
  }

  populateModalParishes(municipioId) {
    const selectParr = document.getElementById("modal-select-parroquia");
    if (!selectParr) return;

    const sectorialPositions = CATALOGO_POSICIONES_DATEROS.filter(p => p.nivel === "sectorial" && p.municipioId === municipioId);
    selectParr.innerHTML = sectorialPositions.map(p => `
      <option value="${p.id}">${p.parroquiaNombre}</option>
    `).join("");
  }

  syncModalPositionId() {
    const labelCod = document.getElementById("modal-label-codigo");
    const selectMun = document.getElementById("modal-select-municipio");
    const selectParr = document.getElementById("modal-select-parroquia");

    if (this.modalSelectedLevel === "central") {
      this.modalActivePositionId = "central";
    } else if (this.modalSelectedLevel === "municipal") {
      const mid = selectMun ? selectMun.value : "maturin";
      this.modalActivePositionId = `mun-${mid}`;
    } else {
      this.modalActivePositionId = selectParr ? selectParr.value : "parr-san-simon";
    }

    const pos = CATALOGO_POSICIONES_DATEROS.find(p => p.id === this.modalActivePositionId);
    if (labelCod && pos) {
      labelCod.textContent = pos.codigo || "";
    }
  }

  handleSaveModal() {
    const nombre = document.getElementById("modal-input-nombre")?.value?.trim();
    const cedula = document.getElementById("modal-input-cedula")?.value?.trim();
    const telefono = document.getElementById("modal-input-telefono")?.value?.trim();
    const dispositivo = document.getElementById("modal-input-dispositivo")?.value?.trim();
    const notas = document.getElementById("modal-input-notas")?.value?.trim();

    if (!nombre) {
      alert("Por favor ingrese el nombre del datero.");
      return;
    }

    if (!telefono) {
      alert("Por favor ingrese el número de teléfono o WhatsApp.");
      return;
    }

    this.syncModalPositionId();
    const targetId = this.modalActivePositionId;

    const success = saveComandoDatero(targetId, {
      nombre,
      cedula,
      telefono,
      dispositivo,
      notas
    });

    if (success) {
      this.closeModal();
      this.renderKPIs();
      this.renderTable();
      this.showToast(`Comando Datero asignado correctamente a ${targetId}.`, "success");
    } else {
      alert("Error al guardar la asignación. Verifique los datos.");
    }
  }

  handleRemoveDatero(positionId) {
    const pos = CATALOGO_POSICIONES_DATEROS.find(p => p.id === positionId);
    const nombrePos = pos ? pos.territorio : positionId;

    if (confirm(`¿Desea desasignar al datero de "${nombrePos}" y dejar la posición vacante?`)) {
      removeComandoDatero(positionId);
      this.renderKPIs();
      this.renderTable();
      this.showToast(`Posición en "${nombrePos}" marcada como vacante.`, "info");
    }
  }

  showToast(message, type = "success") {
    const toast = document.getElementById("toast-notification");
    const msgEl = document.getElementById("toast-message");
    if (!toast || !msgEl) return;

    msgEl.textContent = message;
    toast.classList.remove("translate-y-20", "opacity-0", "pointer-events-none");
    toast.classList.add("translate-y-0", "opacity-100");

    setTimeout(() => {
      toast.classList.remove("translate-y-0", "opacity-100");
      toast.classList.add("translate-y-20", "opacity-0", "pointer-events-none");
    }, 3200);
  }

  setupStorageSync() {
    window.addEventListener("storage", (e) => {
      if (e.key === "migato_comandos_dateros_v2" || e.key === "migato_comandos_asignados") {
        this.renderKPIs();
        this.renderTable();
      }
    });
  }
}

// Inicialización Global Segura
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.comandosDaterosApp = new ComandosDaterosApp();
  });
} else {
  window.comandosDaterosApp = new ComandosDaterosApp();
}

