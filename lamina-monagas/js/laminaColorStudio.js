/**
 * MIGATO 2026 - Estudio Rápido de Colores de Polígonos
 * Módulo de Calibración Cromática para Lámina Monagas (13 Municipios y 44 Parroquias)
 * 
 * Permite al usuario/comandante ajustar colores en tiempo real sin recargar,
 * aplicar paletas de alto contraste para evitar confusiones de vecindad,
 * copiar la configuración al portapapeles y ocultar la herramienta para presentaciones.
 */

import { CATALOGO_MONAGAS, resolveParishId } from "../../earth-monagas/js/catalogoMonagas.js?v=236";
import { GEO_MUNICIPIOS_OFICIAL } from "../../earth-monagas/js/geoOficialMonagas.js?v=236";
import { getParishColor as getOfficialParishColor, PARISH_COLORS } from "../../earth-monagas/js/monagasDemographics.js?v=236";

export const HIGH_CONTRAST_MUN_PALETTE = {
  "maturin": "#1e40af",         // Azul Royal Intenso
  "caripe": "#047857",          // Verde Esmeralda Montaña (¡Evita conflicto con rojos!)
  "acosta": "#0891b2",          // Cian Turquesa Capayacuar
  "cedeno": "#7c3aed",          // Violeta Imperial Caicara
  "piar": "#d97706",            // Ámbar Dorado Aragua
  "punceres": "#db2777",        // Rosa Fucsia Quiriquire
  "bolivar": "#dc2626",         // Rojo Carmesí Caripito (Único rojo en el norte)
  "ezequiel-zamora": "#ea580c", // Naranja Vivo Punta de Mata
  "santa-barbara": "#65a30d",   // Verde Lima Tapir
  "aguasay": "#eab308",         // Amarillo Maíz Curagua
  "libertador": "#4338ca",      // Índigo Profundo Temblador
  "uracoa": "#0d9488",          // Teal Petróleo Uracoa
  "sotillo": "#c026d3"          // Fucsia Orinoco Barrancas
};

export const ORIGINAL_MUN_PALETTE = {
  "maturin": "#1d4ed8",
  "caripe": "#e11d48",
  "cedeno": "#9333ea",
  "ezequiel-zamora": "#f97316",
  "libertador": "#06b6d4",
  "acosta": "#0284c7",
  "aguasay": "#dc2626",
  "bolivar": "#eab308",
  "piar": "#059669",
  "punceres": "#7c3aed",
  "santa-barbara": "#10b981",
  "sotillo": "#c026d3",
  "uracoa": "#84cc16"
};

export const QUICK_SWATCHES = [
  { name: "Azul Royal", hex: "#1e40af" },
  { name: "Verde Esmeralda", hex: "#047857" },
  { name: "Rojo Carmesí", hex: "#dc2626" },
  { name: "Naranja Vivo", hex: "#ea580c" },
  { name: "Violeta Imperial", hex: "#7c3aed" },
  { name: "Amarillo Dorado", hex: "#eab308" },
  { name: "Cian Océano", hex: "#0891b2" },
  { name: "Rosa Magenta", hex: "#db2777" },
  { name: "Verde Lima", hex: "#65a30d" },
  { name: "Teal Petróleo", hex: "#0d9488" },
  { name: "Fucsia Orinoco", hex: "#c026d3" },
  { name: "Índigo Profundo", hex: "#4338ca" }
];

export class LaminaColorStudio {
  constructor(app) {
    this.app = app;
    this.activeTab = "municipios"; // "municipios" | "parroquias"
    this.selectedParishMun = "maturin";
    this.isOpen = false;
    this.init();
  }

  init() {
    this.injectUI();
    this.bindEvents();
    this.checkButtonVisibility();
  }

  checkButtonVisibility() {
    try {
      const isHidden = localStorage.getItem("migato_color_studio_hidden") === "1";
      const btn = document.getElementById("btn-toggle-color-studio");
      if (btn && isHidden) {
        btn.classList.add("hidden");
      }
    } catch (e) {}
  }

  bindEvents() {
    // Atajo de teclado: Shift + C abre o cierra el editor de colores en cualquier momento
    window.addEventListener("keydown", (e) => {
      if (e.shiftKey && (e.key === "C" || e.key === "c")) {
        // Evitar activar si el usuario está escribiendo en un input
        if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;
        e.preventDefault();
        this.toggle();
      }
    });
  }

  injectUI() {
    if (document.getElementById("modal-color-studio")) return;

    const modal = document.createElement("div");
    modal.id = "modal-color-studio";
    modal.className = "fixed inset-0 z-[2000] bg-slate-950/70 backdrop-blur-sm hidden items-center justify-center p-3 sm:p-5 select-none";
    modal.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl border-2 border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        <!-- ENCABEZADO MODAL -->
        <div class="bg-gradient-to-r from-[#1d1554] to-[#2d1f85] text-white p-3.5 sm:p-4 flex items-center justify-between shrink-0 shadow-sm">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-xs shrink-0">
              <i data-lucide="palette" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-black text-sm sm:text-base uppercase tracking-tight text-white leading-tight">
                  Estudio Rápido de Colores
                </h3>
                <span class="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  MIGATO 2026
                </span>
              </div>
              <span class="text-[11px] text-sky-200/90 font-medium block leading-tight">
                Cambia el color de cualquier polígono al instante • Sin recargar
              </span>
            </div>
          </div>
          <button type="button" id="btn-close-color-studio" class="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 text-xl font-bold cursor-pointer transition">
            ✕
          </button>
        </div>

        <!-- BARRA SUPERIOR DE PREAJUSTES Y NAVEGACIÓN -->
        <div class="p-3 bg-slate-100 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          
          <!-- Pestañas de Nivel (Municipios vs Parroquias) -->
          <div class="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-300 w-full sm:w-auto shadow-xs">
            <button type="button" id="tab-color-mun" class="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 bg-[#1d1554] text-white shadow-xs">
              <i data-lucide="map" class="w-3.5 h-3.5 text-amber-400"></i>
              <span>13 Municipios</span>
            </button>
            <button type="button" id="tab-color-par" class="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 text-slate-600 hover:text-slate-950">
              <i data-lucide="layers" class="w-3.5 h-3.5 text-sky-600"></i>
              <span>Parroquias</span>
            </button>
          </div>

          <!-- Botones de Acción de Paleta Global -->
          <div class="flex items-center gap-1.5 w-full sm:w-auto justify-end flex-wrap">
            <button type="button" id="btn-preset-contrast" class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer" title="Aplica 13 colores completamente distintos donde ningún municipio vecino se parece">
              <i data-lucide="sparkles" class="w-3.5 h-3.5 text-emerald-200"></i>
              <span>Alto Contraste</span>
            </button>
            <button type="button" id="btn-preset-original" class="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[11px] transition cursor-pointer" title="Restablecer a la paleta oficial por defecto">
              Originales
            </button>
            <button type="button" id="btn-reset-colors" class="px-2 py-1 rounded-lg bg-slate-200 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition cursor-pointer" title="Borrar personalizaciones de tu navegador">
              Restablecer
            </button>
          </div>
        </div>

        <!-- CUERPO CON SCROLL -->
        <div id="color-studio-body" class="p-3 sm:p-4 overflow-y-auto flex-1 space-y-3 bg-slate-50 min-h-0 text-slate-900">
          <!-- Inyectado dinámicamente -->
        </div>

        <!-- PIE DEL MODAL -->
        <div class="p-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <button type="button" id="btn-copy-color-config" class="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer" title="Copia el código de los colores para pegarlo en el chat">
              <i data-lucide="copy" class="w-3.5 h-3.5 text-amber-400"></i>
              <span>Copiar Configuración para Diego</span>
            </button>
            <button type="button" id="btn-hide-color-tool" class="px-2.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition" title="Oculta el botón 'Colores' de la barra para que no estorbe en presentaciones (reactivable con Shift+C)">
              <i data-lucide="eye-off" class="w-3.5 h-3.5 text-slate-500"></i>
              <span class="hidden md:inline">Ocultar Botón</span>
            </button>
          </div>
          <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button type="button" id="btn-done-color-studio" class="w-full sm:w-auto px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs uppercase shadow-sm transition active:scale-95 cursor-pointer">
              Listo / Guardar
            </button>
          </div>
        </div>

      </div>
    `;

    document.body.appendChild(modal);

    // Toast flotante de notificación
    if (!document.getElementById("color-studio-toast")) {
      const toast = document.createElement("div");
      toast.id = "color-studio-toast";
      toast.className = "fixed top-6 right-6 z-[3000] px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-2xl border border-slate-700 flex items-center gap-2 transform transition-all duration-300 opacity-0 translate-y-[-10px] pointer-events-none";
      toast.innerHTML = `<span id="color-toast-icon">✓</span> <span id="color-toast-msg">Mensaje</span>`;
      document.body.appendChild(toast);
    }

    // Handlers
    document.getElementById("btn-close-color-studio")?.addEventListener("click", () => this.close());
    document.getElementById("btn-done-color-studio")?.addEventListener("click", () => this.close());
    
    document.getElementById("tab-color-mun")?.addEventListener("click", () => {
      this.activeTab = "municipios";
      this.updateTabsUI();
      this.renderBody();
    });

    document.getElementById("tab-color-par")?.addEventListener("click", () => {
      this.activeTab = "parroquias";
      this.updateTabsUI();
      this.renderBody();
    });

    document.getElementById("btn-preset-contrast")?.addEventListener("click", () => {
      this.applyPreset("high-contrast");
    });

    document.getElementById("btn-preset-original")?.addEventListener("click", () => {
      this.applyPreset("original");
    });

    document.getElementById("btn-reset-colors")?.addEventListener("click", () => {
      this.applyPreset("reset");
    });

    document.getElementById("btn-copy-color-config")?.addEventListener("click", () => {
      this.copyConfig();
    });

    document.getElementById("btn-hide-color-tool")?.addEventListener("click", () => {
      this.hideButton();
    });

    // Cerrar al hacer clic en el backdrop
    modal.addEventListener("click", (e) => {
      if (e.target === modal) this.close();
    });
  }

  showToast(message, isSuccess = true) {
    const toast = document.getElementById("color-studio-toast");
    const msgEl = document.getElementById("color-toast-msg");
    const iconEl = document.getElementById("color-toast-icon");
    if (!toast || !msgEl) return;

    msgEl.textContent = message;
    if (iconEl) iconEl.textContent = isSuccess ? "✨" : "ℹ️";
    toast.className = `fixed top-6 right-6 z-[3000] px-4 py-2.5 rounded-xl ${isSuccess ? 'bg-emerald-900 border-emerald-500 text-emerald-100' : 'bg-slate-900 border-slate-700 text-white'} font-bold text-xs shadow-2xl border flex items-center gap-2 transform transition-all duration-300 opacity-100 translate-y-0`;

    setTimeout(() => {
      toast.className = "fixed top-6 right-6 z-[3000] px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-2xl border border-slate-700 flex items-center gap-2 transform transition-all duration-300 opacity-0 translate-y-[-10px] pointer-events-none";
    }, 3200);
  }

  open(preferredTab = null) {
    const modal = document.getElementById("modal-color-studio");
    if (!modal) return;

    if (preferredTab) {
      this.activeTab = preferredTab;
    } else if (this.app.level === "municipio" && this.app.activeMunId) {
      this.activeTab = "parroquias";
      this.selectedParishMun = this.app.activeMunId;
    } else {
      this.activeTab = "municipios";
    }

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    this.isOpen = true;

    this.updateTabsUI();
    this.renderBody();

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  close() {
    const modal = document.getElementById("modal-color-studio");
    if (!modal) return;
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    this.isOpen = false;
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  updateTabsUI() {
    const tabMun = document.getElementById("tab-color-mun");
    const tabPar = document.getElementById("tab-color-par");
    if (!tabMun || !tabPar) return;

    if (this.activeTab === "municipios") {
      tabMun.className = "flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 bg-[#1d1554] text-white shadow-xs";
      tabPar.className = "flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 text-slate-600 hover:text-slate-950";
    } else {
      tabMun.className = "flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 text-slate-600 hover:text-slate-950";
      tabPar.className = "flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 bg-[#1d1554] text-white shadow-xs";
    }
  }

  renderBody() {
    const body = document.getElementById("color-studio-body");
    if (!body) return;

    if (this.activeTab === "municipios") {
      this.renderMunicipiosView(body);
    } else {
      this.renderParroquiasView(body);
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  renderMunicipiosView(container) {
    const items = (CATALOGO_MONAGAS || []).map(m => {
      const currentColor = this.app.getMunicipalityColor(m.id);
      return {
        id: m.id,
        nombre: m.nombre.replace(/^municipio\s+/i, '').trim(),
        parroquiasCount: (m.parroquias || []).length,
        color: currentColor
      };
    });

    let html = `
      <div class="flex items-center justify-between text-xs font-bold text-slate-500 pb-1">
        <span>Toca el cuadro de color o escribe el código HEX. Los polígonos del mapa cambian de inmediato.</span>
        <span class="font-mono font-black text-slate-700">${items.length} Municipios</span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
    `;

    items.forEach(item => {
      html += `
        <div class="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-400 transition shadow-2xs flex flex-col gap-2" id="color-row-mun-${item.id}">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <label class="relative w-8 h-8 rounded-lg overflow-hidden border-2 border-slate-300 shadow-xs cursor-pointer shrink-0 block" title="Haz clic para abrir el selector de color">
                <input type="color" value="${item.color}" data-mun-id="${item.id}" class="color-picker-input-mun absolute inset-0 w-[150%] h-[150%] -translate-x-2 -translate-y-2 cursor-pointer border-0 p-0">
              </label>
              <div class="min-w-0 flex-1">
                <strong class="font-black text-xs uppercase text-slate-900 block truncate leading-tight">
                  ${item.nombre}
                </strong>
                <span class="text-[10px] text-slate-500 font-semibold block leading-tight">
                  ${item.parroquiasCount} Parroquias
                </span>
              </div>
            </div>

            <div class="flex items-center gap-1 shrink-0">
              <input type="text" value="${item.color.toUpperCase()}" maxlength="7" data-mun-id="${item.id}"
                     class="color-hex-input-mun w-18 px-1.5 py-1 text-center font-mono font-black text-xs rounded-lg border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 uppercase">
              <button type="button" onclick="window.laminaApp && window.laminaApp.selectMunicipio('${item.id}'); window.colorStudio && window.colorStudio.open('parroquias');" 
                      class="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-sky-600 transition cursor-pointer" title="Enfocar este municipio y ver sus parroquias">
                <i data-lucide="chevron-right" class="w-4 h-4"></i>
              </button>
            </div>
          </div>

          <!-- Muestra de 8 chips rápidos -->
          <div class="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
            <span class="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Rápido:</span>
            ${QUICK_SWATCHES.slice(0, 8).map(sw => `
              <button type="button" 
                      data-swatch-mun="${item.id}" 
                      data-swatch-hex="${sw.hex}" 
                      style="background-color: ${sw.hex};" 
                      class="swatch-btn-mun w-4 h-4 rounded-full border border-black/15 shadow-2xs hover:scale-125 transition cursor-pointer shrink-0" 
                      title="${sw.name} (${sw.hex})">
              </button>
            `).join("")}
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;

    // Conectar eventos de cambio
    container.querySelectorAll(".color-picker-input-mun").forEach(inp => {
      inp.addEventListener("input", (e) => {
        const munId = e.target.dataset.munId;
        const color = e.target.value;
        this.applyMunicipalityColor(munId, color);
      });
    });

    container.querySelectorAll(".color-hex-input-mun").forEach(inp => {
      inp.addEventListener("change", (e) => {
        const munId = e.target.dataset.munId;
        let val = e.target.value.trim();
        if (!val.startsWith("#")) val = "#" + val;
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
          this.applyMunicipalityColor(munId, val);
        } else {
          e.target.value = this.app.getMunicipalityColor(munId).toUpperCase();
        }
      });
    });

    container.querySelectorAll(".swatch-btn-mun").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const munId = btn.dataset.swatchMun;
        const hex = btn.dataset.swatchHex;
        this.applyMunicipalityColor(munId, hex);
      });
    });
  }

  renderParroquiasView(container) {
    const munList = (CATALOGO_MONAGAS || []).map(m => ({
      id: m.id,
      nombre: m.nombre.replace(/^municipio\s+/i, '').trim(),
      parroquias: m.parroquias || []
    }));

    const activeMun = munList.find(m => m.id === this.selectedParishMun) || munList[0];

    let html = `
      <div class="flex flex-col sm:flex-row items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-slate-200">
        <div class="flex items-center gap-2">
          <i data-lucide="filter" class="w-4 h-4 text-sky-600"></i>
          <span class="text-xs font-black uppercase text-slate-700">Municipio Activo:</span>
        </div>
        <select id="select-parish-mun" class="px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-xs bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 cursor-pointer">
          ${munList.map(m => `
            <option value="${m.id}" ${m.id === activeMun.id ? 'selected' : ''}>
              ${m.nombre} (${m.parroquias.length} parroquias)
            </option>
          `).join("")}
        </select>
      </div>

      <div class="flex items-center justify-between text-xs font-bold text-slate-500 pt-1">
        <span>Parroquias de ${activeMun.nombre}:</span>
        <span class="font-mono font-black text-slate-700">${activeMun.parroquias.length} Parroquias</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
    `;

    activeMun.parroquias.forEach(p => {
      const resolvedPId = resolveParishId(p.id);
      const currentColor = this.app.getParishColor(resolvedPId, activeMun.id);
      const cleanPName = (p.nombre || p.id).replace(/^parroquia\s+/i, '').trim();

      html += `
        <div class="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-400 transition shadow-2xs flex flex-col gap-2" id="color-row-par-${resolvedPId}">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <label class="relative w-8 h-8 rounded-lg overflow-hidden border-2 border-slate-300 shadow-xs cursor-pointer shrink-0 block" title="Haz clic para abrir el selector de color">
                <input type="color" value="${currentColor}" data-parish-id="${resolvedPId}" class="color-picker-input-par absolute inset-0 w-[150%] h-[150%] -translate-x-2 -translate-y-2 cursor-pointer border-0 p-0">
              </label>
              <div class="min-w-0 flex-1">
                <strong class="font-black text-xs uppercase text-slate-900 block truncate leading-tight">
                  ${cleanPName}
                </strong>
                <span class="text-[10px] text-slate-500 font-mono block leading-tight">
                  ID: ${resolvedPId}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-1 shrink-0">
              <input type="text" value="${currentColor.toUpperCase()}" maxlength="7" data-parish-id="${resolvedPId}"
                     class="color-hex-input-par w-18 px-1.5 py-1 text-center font-mono font-black text-xs rounded-lg border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 uppercase">
            </div>
          </div>

          <!-- Muestra de 8 chips rápidos -->
          <div class="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
            <span class="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Rápido:</span>
            ${QUICK_SWATCHES.slice(0, 8).map(sw => `
              <button type="button" 
                      data-swatch-par="${resolvedPId}" 
                      data-swatch-hex="${sw.hex}" 
                      style="background-color: ${sw.hex};" 
                      class="swatch-btn-par w-4 h-4 rounded-full border border-black/15 shadow-2xs hover:scale-125 transition cursor-pointer shrink-0" 
                      title="${sw.name} (${sw.hex})">
              </button>
            `).join("")}
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;

    // Cambio de municipio en el dropdown
    const selectEl = document.getElementById("select-parish-mun");
    selectEl?.addEventListener("change", (e) => {
      this.selectedParishMun = e.target.value;
      if (this.app.level === "municipio" && this.app.activeMunId !== this.selectedParishMun) {
        this.app.selectMunicipio(this.selectedParishMun, false);
      }
      this.renderBody();
    });

    // Conectar eventos
    container.querySelectorAll(".color-picker-input-par").forEach(inp => {
      inp.addEventListener("input", (e) => {
        const pId = e.target.dataset.parishId;
        const color = e.target.value;
        this.applyParishColor(pId, color);
      });
    });

    container.querySelectorAll(".color-hex-input-par").forEach(inp => {
      inp.addEventListener("change", (e) => {
        const pId = e.target.dataset.parishId;
        let val = e.target.value.trim();
        if (!val.startsWith("#")) val = "#" + val;
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
          this.applyParishColor(pId, val);
        } else {
          e.target.value = this.app.getParishColor(pId, this.selectedParishMun).toUpperCase();
        }
      });
    });

    container.querySelectorAll(".swatch-btn-par").forEach(btn => {
      btn.addEventListener("click", () => {
        const pId = btn.dataset.swatchPar;
        const hex = btn.dataset.swatchHex;
        this.applyParishColor(pId, hex);
      });
    });
  }

  applyMunicipalityColor(mId, color) {
    if (!mId || !color) return;
    color = color.toLowerCase();

    // 1. Notificar a laminaApp para actualizar el mapa en vivo y memoria
    this.app.updateLiveEntityColor("municipio", mId, color);

    // 2. Sincronizar inputs en el modal
    const row = document.getElementById(`color-row-mun-${mId}`);
    if (row) {
      const picker = row.querySelector(".color-picker-input-mun");
      const hexInput = row.querySelector(".color-hex-input-mun");
      if (picker && picker.value.toLowerCase() !== color) picker.value = color;
      if (hexInput && hexInput.value.toUpperCase() !== color.toUpperCase()) hexInput.value = color.toUpperCase();
    }
  }

  applyParishColor(pId, color) {
    if (!pId || !color) return;
    color = color.toLowerCase();

    // 1. Notificar a laminaApp para actualizar el mapa en vivo y memoria
    this.app.updateLiveEntityColor("parroquia", pId, color);

    // 2. Sincronizar inputs en el modal
    const row = document.getElementById(`color-row-par-${pId}`);
    if (row) {
      const picker = row.querySelector(".color-picker-input-par");
      const hexInput = row.querySelector(".color-hex-input-par");
      if (picker && picker.value.toLowerCase() !== color) picker.value = color;
      if (hexInput && hexInput.value.toUpperCase() !== color.toUpperCase()) hexInput.value = color.toUpperCase();
    }
  }

  applyPreset(presetName) {
    if (presetName === "high-contrast") {
      Object.entries(HIGH_CONTRAST_MUN_PALETTE).forEach(([mId, hex]) => {
        this.app.updateLiveEntityColor("municipio", mId, hex);
      });
      this.showToast("Paleta de Alto Contraste aplicada (13 municipios diferenciados)");
    } else if (presetName === "original") {
      Object.entries(ORIGINAL_MUN_PALETTE).forEach(([mId, hex]) => {
        this.app.updateLiveEntityColor("municipio", mId, hex);
      });
      this.showToast("Paleta original restablecida");
    } else if (presetName === "reset") {
      try {
        localStorage.removeItem("migato_custom_mun_colors");
        localStorage.removeItem("migato_custom_parish_colors");
      } catch (e) {}
      this.app.customMunColors = {};
      this.app.customParishColors = {};
      if (this.app.level === "estado") {
        this.app.selectEstado(false);
      } else {
        this.app.selectMunicipio(this.app.activeMunId, false);
      }
      this.showToast("Valores de fábrica restablecidos");
    }

    this.renderBody();
  }

  copyConfig() {
    const config = {
      municipios: this.app.customMunColors || {},
      parroquias: this.app.customParishColors || {}
    };

    const text = JSON.stringify(config, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      this.showToast("¡Configuración copiada! Pégasela a Diego en el chat");
    }).catch(() => {
      // Fallback manual con prompt
      prompt("Copia este código y envíalo en el chat:", text);
    });
  }

  hideButton() {
    try {
      localStorage.setItem("migato_color_studio_hidden", "1");
    } catch (e) {}
    const btn = document.getElementById("btn-toggle-color-studio");
    if (btn) btn.classList.add("hidden");
    this.close();
    this.showToast("Botón oculto. Presiona Shift + C para reabrir", false);
  }

  showButton() {
    try {
      localStorage.removeItem("migato_color_studio_hidden");
    } catch (e) {}
    const btn = document.getElementById("btn-toggle-color-studio");
    if (btn) btn.classList.remove("hidden");
    this.showToast("Botón de colores visible");
  }
}
