/**
 * Controlador Principal — Google Earth Pro Web (Edición Estado Monagas)
 * Robusto, 100% Operativo y Totalmente Individualizado
 */
import { CATALOGO_MONAGAS, findParishInCatalog } from "./catalogoMonagas.js?v=39";
import { AuthManager, forceCleanCacheAndReload } from "./authManager.js?v=39";
import { getAllParishesForSelector } from "./usersCatalog.js?v=39";
import { EarthStore } from "./earthStore.js?v=39";
import { EarthMapEngine } from "./mapEngine.js?v=39";
import { PropertiesDialog } from "./propertiesDialog.js?v=39";
import { ToolsManager } from "./toolsManager.js?v=39";
import { detectParishFromGeometry } from "./geoMonagas.js?v=39";
import { GEO_PARROQUIAS_OFICIAL } from "./geoOficialMonagas.js?v=39";

class EarthMonagasApp {
  constructor() {
    window.earthApp = this;
    this.store = null;
    this.mapEngine = null;
    this.propDialog = null;
    this.toolsManager = null;
    this.authManager = new AuthManager();

    this.selectedMunId = "maturin";
    this.selectedParishId = "jusepin";

    this.init();
  }

  init() {
    this.store = new EarthStore(CATALOGO_MONAGAS);

    // Leer parámetro URL para individualización (?p=caicara o ?p=alto-de-los-godos)
    const urlParams = new URLSearchParams(window.location.search);
    const paramParish = urlParams.get("p") || urlParams.get("parroquia");
    if (paramParish) {
      const pNorm = paramParish.toLowerCase().trim();
      for (const mun of CATALOGO_MONAGAS) {
        const match = mun.parroquias.find(p => 
          p.id.toLowerCase() === pNorm || 
          p.id.toLowerCase().includes(pNorm) ||
          p.nombre.toLowerCase().replace(/\s+/g, '-').includes(pNorm)
        );
        if (match) {
          this.selectedMunId = mun.id;
          this.selectedParishId = match.id;
          break;
        }
      }
    }

    this.mapEngine = new EarthMapEngine("earth-canvas", (lat, lng, eyeAlt) => {
      this.updateStatusBar(lat, lng, eyeAlt);
    });

    this.propDialog = new PropertiesDialog(
      (type, itemId, updated, targetMunId, targetParishId) => {
        this.handleSaveProperties(type, itemId, updated, targetMunId, targetParishId);
      },
      (type, itemId, liveDraft) => {
        this.handleLiveStylePreview(type, itemId, liveDraft);
      },
      (poly) => {
        this.handleStartGeometryEdit(poly);
      },
      (polyId) => {
        this.renderPlacesTree();
      }
    );

    this.toolsManager = new ToolsManager(this.mapEngine, (type, newItem) => {
      this.handleFinishedDrawing(type, newItem);
    });

    this.setupToolbarEvents();
    this.setupSidebarTabs();
    this.setupDragAndDrop();
    this.setupOverlayModal();
    this.setupParishSelectorModal();
    this.setupAuth();
    this.activeSubParroquiaId = null;

    // Cargar parroquia activa inicial
    this.selectParish(this.selectedMunId, this.selectedParishId);

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch(e){}
    }
  }

  updateStatusBar(lat, lng, eyeAlt) {
    const coordEl = document.getElementById("status-coords");
    const altEl = document.getElementById("status-eye-alt");

    if (coordEl) {
      const latDMS = this.toDMS(lat, true);
      const lngDMS = this.toDMS(lng, false);
      coordEl.textContent = `${latDMS} ${lngDMS}`;
    }

    if (altEl) {
      altEl.textContent = `Ojo: ${eyeAlt}`;
    }
  }

  toDMS(deg, isLat) {
    const dir = deg >= 0 ? (isLat ? "N" : "E") : (isLat ? "S" : "W");
    const absDeg = Math.abs(deg);
    const d = Math.floor(absDeg);
    const m = Math.floor((absDeg - d) * 60);
    const s = ((absDeg - d - m / 60) * 3600).toFixed(1);
    return `${d}°${m}'${s}"${dir}`;
  }

  selectParish(munId, parishId) {
    this.selectedMunId = munId;
    this.selectedParishId = parishId;
    this.activeSubParroquiaId = null;

    const parish = this.store.getParish(munId, parishId);
    if (!parish) return;

    const munObj = CATALOGO_MONAGAS.find(m => m.id === munId);
    const navLoc = document.getElementById("nav-current-location");
    if (navLoc) {
      if (window.innerWidth < 640) {
        navLoc.textContent = parish.nombre;
      } else {
        navLoc.textContent = `${parish.nombre} (${munObj ? munObj.nombre : 'Monagas'})`;
      }
      navLoc.parentElement.title = `${parish.nombre} - Municipio ${munObj ? munObj.nombre : 'Monagas'}`;
    }

    // Actualizar título de pestaña
    document.title = `${parish.nombre} (${munObj ? munObj.nombre : 'Monagas'}) • Google Earth Pro`;

    // Actualizar indicador de parroquia en banner de dibujo si está activo
    this.updateDrawingBannerParishText();

    // Mostrar perímetro con máscara foco y elementos de esta parroquia
    this.mapEngine.showParishBoundary(parish.limite, parish.id, true);
    this.mapEngine.renderParishItems(parish, (type, item) => {
      if (type === "subparroquia") {
        this.focusSubParish(item.id);
      } else {
        this.propDialog.open(type, item, this.selectedMunId, this.selectedParishId);
      }
    });

    this.updateMilitanciaTally();
    this.renderPlacesTree();
    this.updateSpotlightButtonUI(this.mapEngine.spotlightEnabled);

    // En pantallas móviles, replegar el sidebar para ver el mapa 100%
    if (window.innerWidth < 768) {
      const sidebar = document.getElementById("earth-sidebar");
      const backdrop = document.getElementById("sidebar-backdrop");
      if (sidebar) {
        sidebar.classList.add("hidden");
        sidebar.classList.remove("flex");
      }
      if (backdrop) backdrop.classList.add("hidden");
    }
  }

  updateMilitanciaTally() {
    const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
    if (!parish) return;

    let totalMilitantes = 0;
    let totalCasas = 0;

    (parish.poligonos || []).forEach(p => {
      totalMilitantes += parseInt(p.militantes !== undefined ? p.militantes : (p.habitantes || 0)) || 0;
      totalCasas += parseInt(p.casas || 0) || 0;
    });

    const elMil = document.getElementById("tally-militantes-val");
    const elCas = document.getElementById("tally-casas-val");
    if (elMil) elMil.textContent = totalMilitantes.toLocaleString();
    if (elCas) elCas.textContent = totalCasas.toLocaleString();
  }

  updateDrawingBannerParishText() {
    const banner = document.getElementById("earth-drawing-banner");
    const bannerText = document.getElementById("earth-drawing-banner-text");
    if (banner && !banner.classList.contains("hidden") && this.toolsManager?.activeTool) {
      const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
      const parishName = parish ? parish.nombre : "";
      const toolName = this.toolsManager.activeTool;
      const parishSuffix = parishName ? ` (${parishName})` : "";
      if (toolName === "subparroquia") bannerText.textContent = `Trazando Sub-Parroquia / Eje Comunal${parishSuffix}`;
      else if (toolName === "poligono") bannerText.textContent = `Trazando Sector Comunal / Militancia${parishSuffix}`;
      else if (toolName === "ruta") bannerText.textContent = `Trazando Ruta${parishSuffix}`;
      else if (toolName === "marca") bannerText.textContent = `Colocar Marca${parishSuffix}`;
    }
  }

  focusSubParish(subParishId, flyCamera = false) {
    const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
    if (!parish) return;
    const sp = (parish.subparroquias || []).find(s => String(s.id) === String(subParishId));
    if (!sp || !sp.vertices || sp.vertices.length < 3) return;

    this.activeSubParroquiaId = String(subParishId);
    if (flyCamera) {
      if (this.mapEngine.spotlightEnabled) {
        this.mapEngine.showSubParishBoundary(sp.vertices, true);
      } else {
        const bounds = L.polygon(sp.vertices).getBounds();
        this.mapEngine.fitBounds(bounds);
      }
    }

    // Re-renderizar elementos para que la sub-parroquia quede en modo "solo línea limítrofe" sin relleno que tape el satélite
    this.mapEngine.renderParishItems(parish, (type, item) => {
      if (type === "subparroquia") {
        this.focusSubParish(item.id, false);
      } else {
        this.propDialog.open(type, item, this.selectedMunId, this.selectedParishId);
      }
    });

    this.renderPlacesTree();
  }

  clearSubParishFocus() {
    this.activeSubParroquiaId = null;
    const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
    if (parish) {
      this.mapEngine.showParishBoundary(parish.limite, parish.id, true);
      this.mapEngine.renderParishItems(parish, (type, item) => {
        if (type === "subparroquia") {
          this.focusSubParish(item.id);
        } else {
          this.propDialog.open(type, item, this.selectedMunId, this.selectedParishId);
        }
      });
    }
    this.renderPlacesTree();
  }

  deleteSubParish(subParishId) {
    if (confirm("¿Deseas eliminar esta Sub-Parroquia / Eje Comunal?")) {
      this.store.deleteItem(this.selectedMunId, this.selectedParishId, "subparroquias", subParishId);
      if (this.activeSubParroquiaId === String(subParishId)) {
        this.activeSubParroquiaId = null;
      }
      const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
      this.mapEngine.renderParishItems(parish, (t, it) => {
        if (t === "subparroquia") this.focusSubParish(it.id);
        else this.propDialog.open(t, it, this.selectedMunId, this.selectedParishId);
      });
      this.renderPlacesTree();
    }
  }

  renameSubParish(subParishId) {
    const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
    if (!parish) return;
    const sp = (parish.subparroquias || []).find(s => String(s.id) === String(subParishId));
    if (!sp) return;
    const newName = prompt("Renombrar Sub-Parroquia o Eje Comunal:", sp.nombre);
    if (newName && newName.trim()) {
      sp.nombre = newName.trim();
      this.store.saveToStorage();
      this.renderPlacesTree();
      this.mapEngine.renderParishItems(parish, (t, it) => {
        if (t === "subparroquia") this.focusSubParish(it.id);
        else this.propDialog.open(t, it, this.selectedMunId, this.selectedParishId);
      });
    }
  }

  editSubParishGeometry(subParishId) {
    const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
    if (!parish) return;
    const sp = (parish.subparroquias || []).find(s => String(s.id) === String(subParishId));
    if (!sp) return;

    this.toolsManager.cancelActiveTool();
    this.mapEngine.startEditingPolygonGeometry(sp, (updatedSp) => {
      const areaHa = this.toolsManager.calculatePolygonAreaHa(updatedSp.vertices);
      const perimetroM = this.toolsManager.calculatePerimeterMeters(updatedSp.vertices);
      sp.vertices = updatedSp.vertices;
      sp.areaHa = areaHa;
      sp.perimetroM = perimetroM;
      this.store.saveToStorage();
      this.renderPlacesTree();
      this.mapEngine.renderParishItems(parish, (t, it) => {
        if (t === "subparroquia") this.focusSubParish(it.id);
        else this.propDialog.open(t, it, this.selectedMunId, this.selectedParishId);
      });
    });
  }

  updateSpotlightButtonUI(isEnabled) {
    const btn = document.getElementById("btn-toggle-spotlight");
    const txt = document.getElementById("text-toggle-spotlight");
    if (btn && txt) {
      if (isEnabled) {
        btn.classList.add("bg-purple-950/80", "text-purple-300", "border-purple-600/60");
        btn.classList.remove("bg-slate-800", "text-amber-300", "border-slate-700");
        txt.textContent = "Filtro Oscuro: ON";
        btn.title = "Filtro oscuro activo (alrededores sombreados). Clic para quitar la sombra y ver solo la alineación en satélite limpio.";
      } else {
        btn.classList.remove("bg-purple-950/80", "text-purple-300", "border-purple-600/60");
        btn.classList.add("bg-slate-800", "text-amber-300", "border-slate-700");
        txt.textContent = "Solo Alineación (Limpio)";
        btn.title = "Satélite 100% visible y limpio (sin filtro oscuro). Solo líneas limítrofes. Clic para activar sombra.";
      }
    }
  }

  /**
   * Renderiza el Árbol de Lugares de manera individualizada pero permitiendo
   * gestionar perfectamente todos los sectores y calles de la parroquia activa.
   */
  renderPlacesTree(filterQuery = "") {
    const container = document.getElementById("places-tree-content");
    if (!container) return;

    const munObj = CATALOGO_MONAGAS.find(m => m.id === this.selectedMunId);
    const pData = this.store.getParish(this.selectedMunId, this.selectedParishId);
    if (!pData) return;

    const q = filterQuery.toLowerCase().trim();

    const allSubparroquias = pData.subparroquias || [];
    const filteredSubparroquias = allSubparroquias.filter(sp => !q || sp.nombre.toLowerCase().includes(q));

    let allPolys = pData.poligonos || [];
    const activeSubParish = allSubparroquias.find(sp => String(sp.id) === String(this.activeSubParroquiaId));

    // Calcular totales de militancia y casas en la parroquia
    let totalMilitantes = 0;
    let totalCasas = 0;
    allPolys.forEach(p => {
      totalMilitantes += parseInt(p.militantes !== undefined ? p.militantes : (p.habitantes || 0)) || 0;
      totalCasas += parseInt(p.casas || 0) || 0;
    });

    // Si hay un eje comunal seleccionado y no hay filtro de texto, filtrar polígonos por ese eje
    let displayPolys = allPolys;
    if (this.activeSubParroquiaId && !q) {
      displayPolys = allPolys.filter(p => String(p.subParroquiaId) === String(this.activeSubParroquiaId));
    } else if (q) {
      displayPolys = allPolys.filter(p => p.nombre.toLowerCase().includes(q));
    }

    const filteredRoutes = (pData.rutas || []).filter(r => !q || r.nombre.toLowerCase().includes(q));
    const filteredMarks = (pData.marcas || []).filter(m => !q || m.nombre.toLowerCase().includes(q));

    let html = `
      <!-- Tarjeta de Parroquia Activa con Resumen de Militancia -->
      <div class="bg-slate-950/90 p-3 rounded-2xl border border-sky-500/40 mb-3 shadow-lg">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[10px] font-bold text-sky-400 uppercase tracking-wider">${munObj?.nombre || 'Municipio'}</span>
          ${this.authManager.canSwitchParish() ? `
          <button onclick="window.earthApp.openParishSelector()" class="text-[10px] text-amber-400 hover:text-amber-300 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/30 active:scale-95 transition">
            Cambiar ▾
          </button>` : `
          <span class="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-800/40 flex items-center gap-1">
            <i data-lucide="lock" class="w-2.5 h-2.5"></i>
            <span>Asignada</span>
          </span>`}
        </div>
        <h4 class="text-sm font-black text-white truncate">${pData.nombre}</h4>

        <!-- Tally de Militancia Parroquial en Vivo -->
        <div class="grid grid-cols-2 gap-2 mt-2 font-mono">
          <div class="bg-sky-950/70 border border-sky-600/40 p-1.5 rounded-xl text-center shadow-sm">
            <span class="text-[9px] text-sky-400 font-bold uppercase block mb-0.5">Total Militantes</span>
            <span class="text-xs font-black text-sky-300">👥 ${totalMilitantes.toLocaleString()}</span>
          </div>
          <div class="bg-amber-950/70 border border-amber-600/40 p-1.5 rounded-xl text-center shadow-sm">
            <span class="text-[9px] text-amber-400 font-bold uppercase block mb-0.5">Total Casas / Fam.</span>
            <span class="text-xs font-black text-amber-300">🏠 ${totalCasas.toLocaleString()}</span>
          </div>
        </div>

        <div class="flex items-center gap-1.5 mt-2 flex-wrap">
          <span class="inline-flex items-center gap-1 text-[10px] font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-lg border border-purple-800/40">
            <i data-lucide="shield" class="w-2.5 h-2.5"></i>
            <span>${allSubparroquias.length} ejes</span>
          </span>
          <span class="inline-flex items-center gap-1 text-[10px] font-bold text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded-lg border border-sky-800/40">
            <i data-lucide="layers" class="w-2.5 h-2.5"></i>
            <span>${allPolys.length} sectores</span>
          </span>
        </div>
      </div>
    `;

    // Si hay foco en una sub-parroquia, mostrar banner informativo con botón de desbloquear
    if (activeSubParish) {
      html += `
        <div class="mb-3 bg-purple-950/80 border border-purple-500/50 p-2.5 rounded-xl flex items-center justify-between shadow-lg">
          <div class="flex items-center gap-2 min-w-0">
            <span class="text-base leading-none">🎯</span>
            <div class="truncate text-xs">
              <span class="text-[9px] uppercase font-black text-purple-300 block tracking-wider">Eje Seleccionado</span>
              <span class="text-white font-black truncate block text-xs">${activeSubParish.nombre}</span>
              <span class="text-[10px] text-purple-200">${displayPolys.length} sectores dentro de este eje</span>
            </div>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <button onclick="window.earthApp.renameSubParish('${activeSubParish.id}')" class="text-[10px] text-purple-200 hover:text-white bg-purple-900/80 hover:bg-purple-800 px-2 py-1 rounded-lg border border-purple-500/50 transition font-bold" title="Renombrar eje">
              ✏️ Renombrar
            </button>
            <button onclick="window.earthApp.clearSubParishFocus()" class="text-[10px] text-purple-200 hover:text-white bg-purple-900/80 hover:bg-purple-800 px-2 py-1 rounded-lg border border-purple-500/50 transition font-bold" title="Ver toda la parroquia">
              ✕ Ver Todo
            </button>
          </div>
        </div>
      `;
    }

    html += `
      <!-- SECCIÓN: SUB-PARROQUIAS / EJES COMUNALES (NIVEL 4) -->
      <div class="mb-3">
        <div class="flex items-center justify-between px-2 py-1.5 bg-slate-950/60 rounded-xl border border-purple-900/40 mb-1.5">
          <span class="flex items-center gap-1.5 text-xs font-black text-purple-400 uppercase tracking-wide">
            <i data-lucide="shield" class="w-4 h-4 text-purple-400"></i>
            <span>Sub-Parroquias / Ejes (${filteredSubparroquias.length})</span>
          </span>
          <button onclick="window.earthApp.toolsManager.setActiveTool('subparroquia')" class="text-[10px] font-bold text-purple-300 hover:text-purple-200 bg-purple-500/10 hover:bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30 active:scale-95 transition" title="Trazar contorno de nuevo eje comunal">
            + Trazar Eje
          </button>
        </div>
        <div class="space-y-1 mt-1">
    `;

    if (filteredSubparroquias.length === 0) {
      html += `
        <div class="text-[11px] text-slate-500 px-3 py-2.5 italic bg-slate-950/40 rounded-xl border border-slate-800/40 text-center">
          ${filterQuery ? `No hay ejes con "<strong>${filterQuery}</strong>".` : `No hay sub-parroquias / ejes trazados aún.<br>Usa <strong>+ Trazar Eje</strong> o el botón <strong>+ Sub-Parroquia / Eje</strong> arriba.`}
        </div>
      `;
    } else {
      filteredSubparroquias.forEach(sp => {
        const isSelected = String(sp.id) === String(this.activeSubParroquiaId);
        const secInSp = allPolys.filter(p => String(p.subParroquiaId) === String(sp.id));
        const milInSp = secInSp.reduce((acc, p) => acc + (parseInt(p.militantes !== undefined ? p.militantes : (p.habitantes || 0)) || 0), 0);
        html += `
          <div class="flex items-center justify-between py-2 px-2.5 rounded-xl group text-xs border transition shadow-sm ${isSelected ? 'bg-purple-950/70 border-purple-500 shadow-purple-500/20 ring-1 ring-purple-500/40' : 'bg-slate-950/70 hover:bg-slate-800 border-slate-800/60'}">
            <div class="flex items-center gap-2 truncate min-w-0">
              <span class="w-3.5 h-3.5 rounded-md border shrink-0" style="background-color: ${sp.colorRelleno || '#a855f7'}; border-color: ${sp.colorBorde || '#c084fc'};"></span>
              <div class="truncate cursor-pointer min-w-0" onclick="window.earthApp.focusSubParish('${sp.id}', false)">
                <span class="text-slate-100 font-bold block truncate group-hover:text-purple-300 ${isSelected ? 'text-purple-300 font-black' : ''}">${sp.nombre}</span>
                <div class="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                  <span class="text-purple-300 font-bold">👥 ${milInSp} mil</span>
                  <span>• ${secInSp.length} sectores</span>
                  <span>• ${sp.areaHa || 0} Ha</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button onclick="window.earthApp.renameSubParish('${sp.id}')" class="text-slate-400 hover:text-purple-300 p-1 transition" title="Renombrar eje comunal">
                <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
              </button>
              <button onclick="window.earthApp.editSubParishGeometry('${sp.id}')" class="text-slate-400 hover:text-amber-300 p-1 transition" title="Ajustar vértices del perímetro">
                <i data-lucide="move" class="w-3.5 h-3.5"></i>
              </button>
              <button onclick="window.earthApp.focusSubParish('${sp.id}', true)" class="text-purple-400 hover:text-purple-200 p-1 transition" title="Enfocar eje y hacer zoom">
                <i data-lucide="crosshair" class="w-3.5 h-3.5"></i>
              </button>
              <button onclick="window.earthApp.deleteSubParish('${sp.id}')" class="text-slate-500 hover:text-red-400 p-1 transition" title="Eliminar eje">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>
        `;
      });
    }

    html += `
        </div>
      </div>

      <!-- SECCIÓN: SECTORES COMUNALES (NIVEL 5) -->
      <div class="mb-3">
        <div class="flex items-center justify-between px-2 py-1.5 bg-slate-950/60 rounded-xl border border-sky-900/40 mb-1.5">
          <span class="flex items-center gap-1.5 text-xs font-black text-sky-400 uppercase tracking-wide">
            <i data-lucide="home" class="w-4 h-4 text-sky-400"></i>
            <span>Sectores Comunales (${displayPolys.length})</span>
          </span>
          <button onclick="document.getElementById('btn-tool-polygon').click()" class="text-[10px] font-bold text-sky-300 hover:text-sky-200 bg-sky-500/10 hover:bg-sky-500/20 px-2 py-0.5 rounded border border-sky-500/30 active:scale-95 transition" title="Trazar nuevo sector comunal">
            ${this.activeSubParroquiaId ? '+ Trazar en este Eje' : '+ Nuevo Sector'}
          </button>
        </div>
        <div class="space-y-1 mt-1">
    `;

    if (displayPolys.length === 0) {
      const otherCount = allPolys.length;
      html += `
        <div class="text-[11px] text-slate-400 px-3 py-2.5 italic bg-slate-950/40 rounded-xl border border-slate-800/40 text-center">
          ${filterQuery ? `No se encontraron sectores con "<strong>${filterQuery}</strong>".<br><button onclick="document.getElementById('input-search-places').value=''; window.earthApp.renderPlacesTree('');" class="text-sky-400 underline mt-1">Borrar búsqueda</button>` : (this.activeSubParroquiaId ? (otherCount > 0 ? `No hay sectores trazados aún dentro de este eje específico (${otherCount} en el resto de la parroquia).<br><button onclick="window.earthApp.clearSubParishFocus()" class="text-sky-400 font-bold underline mt-1.5 inline-block">👀 Ver todos los ${otherCount} sectores</button>` : `No hay sectores comunales trazados aún en este eje.<br>Haz clic en <strong>+ Sector Comunal</strong> para comenzar a delimitarlo.`) : `No hay sectores comunales trazados aún.<br>Usa el botón <strong>+ Sector Comunal</strong> arriba para trazar el primero.`)}
        </div>
      `;
    } else {
      displayPolys.forEach(poly => {
        const milCount = poly.militantes !== undefined ? poly.militantes : (poly.habitantes || 0);
        const cleanPhone = (poly.telefono || "").replace(/\D/g, "");
        const waLink = cleanPhone ? (cleanPhone.startsWith("58") ? `https://wa.me/${cleanPhone}` : `https://wa.me/58${cleanPhone.replace(/^0/, '')}`) : null;

        html += `
          <div class="flex items-center justify-between py-2 px-2.5 bg-slate-950/70 hover:bg-slate-800 rounded-xl group text-xs border border-slate-800/60 transition shadow-sm">
            <div class="flex items-center gap-2 truncate min-w-0">
              <input type="checkbox" ${poly.visible !== false ? 'checked' : ''} 
                onchange="window.earthApp.toggleItemVisibility('${this.selectedMunId}', '${this.selectedParishId}', 'poligono', '${poly.id}')"
                class="w-4 h-4 rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0 cursor-pointer shrink-0">
              <span class="w-3.5 h-3.5 rounded-md border shrink-0" style="background-color: ${poly.colorRelleno || '#38bdf8'}; border-color: ${poly.colorBorde || '#ffffff'};"></span>
              <div class="truncate cursor-pointer min-w-0" onclick="window.earthApp.focusAndEdit('poligono', '${poly.id}')">
                <span class="text-slate-200 font-bold block truncate group-hover:text-sky-400">${poly.nombre}</span>
                <div class="flex items-center gap-1.5 text-[10px] font-mono flex-wrap">
                  <span class="text-sky-400 font-bold">👥 ${milCount} mil</span>
                  ${poly.casas ? `<span class="text-amber-400 font-bold">• 🏠 ${poly.casas} casas</span>` : ''}
                  ${poly.lider ? `<span class="text-slate-300 truncate max-w-[85px]">• 👤 ${poly.lider}</span>` : ''}
                  ${waLink ? `<a href="${waLink}" target="_blank" onclick="event.stopPropagation()" class="text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-950/80 px-1 py-0.2 rounded border border-emerald-700/50 flex items-center gap-0.5">📱 WhatsApp</a>` : ''}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button onclick="window.earthApp.focusAndEdit('poligono', '${poly.id}')" class="text-slate-400 hover:text-sky-300 p-1 transition" title="Editar ficha de militancia">
                <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
              </button>
              <button onclick="window.earthApp.deleteItem('${this.selectedMunId}', '${this.selectedParishId}', 'poligono', '${poly.id}')" class="text-slate-500 hover:text-red-400 p-1 transition" title="Eliminar sector">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        `;
      });
    }

    if (this.activeSubParroquiaId && allPolys.length > displayPolys.length && !filterQuery) {
      const otherCount = allPolys.length - displayPolys.length;
      html += `
        <div class="mt-2 pt-2 border-t border-slate-800/60 text-center">
          <button onclick="window.earthApp.clearSubParishFocus()" class="w-full py-1.5 px-2 bg-slate-900/60 hover:bg-slate-800 border border-slate-700/50 rounded-lg text-[11px] text-sky-400 hover:text-sky-300 font-bold flex items-center justify-center gap-1.5 transition">
            <span>Ver ${otherCount} sectores más de la parroquia ▾</span>
          </button>
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;

    // Solo mostrar rutas y marcas si existen o si no es operador de campo
    const currentUser = this.authManager.getCurrentUser();
    const isFieldOperator = currentUser && currentUser.rol === "operador";

    if (!isFieldOperator || filteredRoutes.length > 0) {
      html += `
        <!-- SECCIÓN: RUTAS Y CALLES -->
        <div class="mb-3">
          <div class="flex items-center justify-between px-2 py-1 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
            <span class="flex items-center gap-1.5 text-emerald-300">
              <i data-lucide="git-commit" class="w-3.5 h-3.5"></i>
              <span>Vialidad / Calles (${filteredRoutes.length})</span>
            </span>
          </div>
          <div class="space-y-1 mt-1">
      `;

      if (filteredRoutes.length === 0) {
        html += `
          <div class="text-[11px] text-slate-500 px-3 py-2.5 italic bg-slate-950/40 rounded-xl border border-slate-800/40 text-center">
            No hay calles trazadas aún.
          </div>
        `;
      } else {
        filteredRoutes.forEach(r => {
          html += `
            <div class="flex items-center justify-between py-2 px-2.5 bg-slate-950/70 hover:bg-slate-800 rounded-xl group text-xs border border-slate-800/60 transition shadow-sm">
              <div class="flex items-center gap-2 truncate">
                <input type="checkbox" ${r.visible !== false ? 'checked' : ''} 
                  onchange="window.earthApp.toggleItemVisibility('${this.selectedMunId}', '${this.selectedParishId}', 'ruta', '${r.id}')"
                  class="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer">
                <span class="w-3.5 h-1 shrink-0 rounded" style="background-color: ${r.color || '#10b981'};"></span>
                <div class="truncate cursor-pointer" onclick="window.earthApp.focusAndEdit('ruta', '${r.id}')">
                  <span class="text-slate-200 font-bold block truncate group-hover:text-emerald-400">${r.nombre}</span>
                  <span class="text-[10px] text-slate-500 font-mono">${r.longitudM || 0} metros</span>
                </div>
              </div>
              <button onclick="window.earthApp.deleteItem('${this.selectedMunId}', '${this.selectedParishId}', 'ruta', '${r.id}')" class="text-slate-500 hover:text-red-400 p-1 transition" title="Eliminar calle">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          `;
        });
      }

      html += `
          </div>
        </div>
      `;
    }

    if (!isFieldOperator || filteredMarks.length > 0) {
      html += `
        <!-- SECCIÓN: PUNTOS DE INTERÉS / MARCAS -->
        <div class="mb-3">
          <div class="flex items-center justify-between px-2 py-1 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
            <span class="flex items-center gap-1.5 text-amber-300">
              <i data-lucide="map-pin" class="w-3.5 h-3.5"></i>
              <span>Puntos de Interés / Marcas (${filteredMarks.length})</span>
            </span>
          </div>
          <div class="space-y-1 mt-1">
      `;

      if (filteredMarks.length === 0) {
        html += `
          <div class="text-[11px] text-slate-500 px-3 py-2 italic bg-slate-950/40 rounded-xl border border-slate-800 text-center">
            No hay marcas aún.
          </div>
        `;
      } else {
        filteredMarks.forEach(m => {
          html += `
            <div class="flex items-center justify-between py-1.5 px-2.5 bg-slate-950/70 hover:bg-slate-800 rounded-xl group text-xs border border-slate-800/60 transition shadow-sm">
              <div class="flex items-center gap-2 truncate cursor-pointer" onclick="window.earthApp.focusAndEdit('marca', '${m.id}')">
                <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${m.color || '#e11d48'};"></span>
                <div class="truncate">
                  <span class="text-slate-200 font-bold block truncate group-hover:text-amber-400">${m.nombre}</span>
                  <span class="text-[10px] text-slate-400 truncate block">${m.descripcion || ''}</span>
                </div>
              </div>
              <button onclick="window.earthApp.deleteItem('${this.selectedMunId}', '${this.selectedParishId}', 'marca', '${m.id}')" class="text-slate-500 hover:text-red-400 p-1 transition shrink-0" title="Eliminar marca">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          `;
        });
      }

      html += `
          </div>
        </div>
      `;
    }

    container.innerHTML = html;

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch(e){}
    }
  }

  setupParishSelectorModal() {
    const modal = document.getElementById("modal-select-parish");
    const btnOpen = document.getElementById("btn-open-parish-modal");
    const btnClose = document.getElementById("btn-close-parish-modal");

    if (btnOpen) {
      btnOpen.addEventListener("click", () => this.openParishSelector());
    }

    if (btnClose) {
      btnClose.addEventListener("click", () => {
        if (modal) {
          modal.classList.add("hidden");
          modal.classList.remove("flex");
        }
      });
    }
  }

  openParishSelector() {
    if (!this.authManager.canSwitchParish()) {
      const user = this.authManager.getCurrentUser();
      alert(`Acceso Restringido: Tu cuenta está asignada exclusivamente a la Parroquia ${user ? user.parroquiaNombre : 'asignada'} por razones de confidencialidad territorial.`);
      return;
    }
    const modal = document.getElementById("modal-select-parish");
    if (!modal) return;
    this.renderParishesCatalog();
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  renderParishesCatalog() {
    const catalog = document.getElementById("modal-parishes-catalog");
    if (!catalog) return;

    catalog.innerHTML = CATALOGO_MONAGAS.map(mun => {
      const isCurrentMun = mun.id === this.selectedMunId;
      const parishesButtons = mun.parroquias.map(p => {
        const isCurrent = isCurrentMun && p.id === this.selectedParishId;
        return `
          <button onclick="window.earthApp.selectParishFromModal('${mun.id}', '${p.id}')" class="px-3 py-2 rounded-xl text-left text-xs font-semibold transition flex items-center justify-between ${isCurrent ? 'bg-sky-600 text-white font-black shadow-lg' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}">
            <span>${p.nombre}</span>
            <i data-lucide="chevron-right" class="w-3.5 h-3.5 opacity-60"></i>
          </button>
        `;
      }).join("");

      return `
        <div class="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 space-y-2">
          <div class="flex items-center justify-between">
            <strong class="text-xs font-black text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
              <i data-lucide="map-pin" class="w-3.5 h-3.5"></i>
              <span>${mun.nombre}</span>
            </strong>
            <span class="text-[10px] text-slate-500 font-mono">${mun.parroquias.length} parroquias</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            ${parishesButtons}
          </div>
        </div>
      `;
    }).join("");

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch(e){}
    }
  }

  selectParishFromModal(munId, parishId) {
    const modal = document.getElementById("modal-select-parish");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
    this.selectParish(munId, parishId);
  }

  focusAndEdit(type, itemId) {
    if (type === "subparroquia") {
      this.focusSubParish(itemId);
      return;
    }

    let munId = this.selectedMunId;
    let parishId = this.selectedParishId;
    let parish = this.store.getParish(munId, parishId);
    const key = type === "poligono" ? "poligonos" : (type === "ruta" ? "rutas" : "marcas");
    let item = parish && parish[key] ? parish[key].find(i => String(i.id) === String(itemId)) : null;

    if (!item) {
      const anywhere = this.store.findItemAnywhere(key, itemId);
      if (anywhere && anywhere.item) {
        munId = anywhere.munId;
        parishId = anywhere.parishId;
        item = anywhere.item;
        this.selectParish(munId, parishId);
      }
    }

    if (!item) return;

    if (type === "poligono" && item.vertices && item.vertices.length > 0) {
      this.mapEngine.map.flyToBounds(L.polygon(item.vertices).getBounds(), { padding: [50, 50], maxZoom: 17, duration: 1.0 });
    } else if (type === "ruta" && item.puntos && item.puntos.length > 0) {
      this.mapEngine.map.flyToBounds(L.polyline(item.puntos).getBounds(), { padding: [50, 50], duration: 1.0 });
    } else if (type === "marca" && item.lat !== undefined && item.lng !== undefined) {
      this.mapEngine.flyTo(item.lat, item.lng, 16);
    }

    this.propDialog.open(type, item, munId, parishId);
  }

  showToast(message, type = "success") {
    let toast = document.getElementById("earth-toast-msg");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "earth-toast-msg";
      document.body.appendChild(toast);
    }
    const bgClass = type === "purple" ? "bg-purple-950/95 border-purple-500/80 text-purple-200 shadow-purple-950/50" : (type === "sky" ? "bg-sky-950/95 border-sky-500/80 text-sky-200 shadow-sky-950/50" : "bg-emerald-950/95 border-emerald-500/80 text-emerald-200 shadow-emerald-950/50");
    toast.className = `fixed top-14 left-1/2 -translate-x-1/2 z-[2500] px-4 py-2.5 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2 transition-all duration-300 pointer-events-none opacity-100 scale-100 backdrop-blur-md ${bgClass}`;
    toast.innerHTML = message;

    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      if (toast) {
        toast.classList.add("opacity-0", "scale-95");
      }
    }, 5000);
  }

  handleFinishedDrawing(type, newItem) {
    // La parroquia activa donde el usuario está trabajando SIEMPRE es el destino asignado
    const targetMunId = this.selectedMunId;
    const targetParishId = this.selectedParishId;

    newItem.munId = targetMunId;
    newItem.parishId = targetParishId;

    if (type === "subparroquia") {
      const spName = prompt("Nombre de la Sub-Parroquia o Eje Comunal:", newItem.nombre || "Eje Comunal 1");
      if (spName && spName.trim()) {
        newItem.nombre = spName.trim();
      }
      this.store.addItemToParish(targetMunId, targetParishId, "subparroquias", newItem);
      this.activeSubParroquiaId = String(newItem.id);

      const parish = this.store.getParish(targetMunId, targetParishId);
      this.mapEngine.renderParishItems(parish, (t, it) => {
        if (t === "subparroquia") this.focusSubParish(it.id);
        else this.propDialog.open(t, it, targetMunId, targetParishId);
      });
      this.focusSubParish(newItem.id);
      this.showToast(`🟪 <strong>${newItem.nombre}</strong> creado. Pulsa <strong>[+ Sector Comunal]</strong> para trazar sectores dentro.`, "purple");
      return;
    }

    if (type === "poligono" && this.activeSubParroquiaId) {
      newItem.subParroquiaId = this.activeSubParroquiaId;
    }

    const key = type === "poligono" ? "poligonos" : (type === "ruta" ? "rutas" : "marcas");
    this.store.addItemToParish(targetMunId, targetParishId, key, newItem);

    const parish = this.store.getParish(targetMunId, targetParishId);
    this.mapEngine.renderParishItems(parish, (t, it) => {
      if (t === "subparroquia") this.focusSubParish(it.id);
      else this.propDialog.open(t, it, targetMunId, targetParishId);
    });

    this.updateMilitanciaTally();
    this.propDialog.open(type, newItem, targetMunId, targetParishId);
    this.renderPlacesTree();
    this.showToast(`📍 <strong>${newItem.nombre}</strong> trazado exitosamente.`, "sky");
  }

  handleSaveProperties(type, itemId, updatedFields, targetMunId = null, targetParishId = null) {
    const key = type === "poligono" ? "poligonos" : (type === "ruta" ? "rutas" : "marcas");
    const destMunId = targetMunId || this.selectedMunId;
    const destParishId = targetParishId || this.selectedParishId;

    if (destMunId !== this.selectedMunId || destParishId !== this.selectedParishId) {
      // Reubicar elemento a otra parroquia
      this.store.moveItem(this.selectedMunId, this.selectedParishId, destMunId, destParishId, key, itemId, updatedFields);
      // Cambiar de parroquia activa para enfocar y mostrar el elemento transferido
      this.selectParish(destMunId, destParishId);
    } else {
      this.store.updateItem(this.selectedMunId, this.selectedParishId, key, itemId, updatedFields);
      const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
      this.mapEngine.renderParishItems(parish, (t, it) => this.propDialog.open(t, it, this.selectedMunId, this.selectedParishId));
      this.updateMilitanciaTally();
      this.renderPlacesTree();
    }
  }

  handleLiveStylePreview(type, itemId, liveDraft) {
    const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
    if (!parish) return;

    const key = type === "poligono" ? "poligonos" : (type === "ruta" ? "rutas" : "marcas");
    const item = (parish[key] || []).find(it => String(it.id) === String(itemId));
    if (item) {
      Object.assign(item, liveDraft);
      this.mapEngine.renderParishItems(parish, (t, it) => this.propDialog.open(t, it, this.selectedMunId, this.selectedParishId));
    }
  }

  deleteItem(munId, parishId, type, itemId) {
    if (confirm("¿Deseas eliminar este elemento de Google Earth?")) {
      const key = type === "poligono" ? "poligonos" : (type === "ruta" ? "rutas" : "marcas");
      this.store.deleteItem(munId, parishId, key, itemId);

      const parish = this.store.getParish(munId, parishId);
      this.mapEngine.renderParishItems(parish, (t, it) => this.propDialog.open(t, it, munId, parishId));
      this.updateMilitanciaTally();
      this.renderPlacesTree();
    }
  }

  toggleItemVisibility(munId, parishId, type, itemId) {
    const key = type === "poligono" ? "poligonos" : "rutas";
    this.store.toggleItemVisibility(munId, parishId, key, itemId);

    const parish = this.store.getParish(munId, parishId);
    this.mapEngine.renderParishItems(parish, (t, it) => this.propDialog.open(t, it, munId, parishId));
  }

  handleStartGeometryEdit(poly) {
    this.toolsManager.cancelActiveTool();
    this.mapEngine.startEditingPolygonGeometry(poly, (updatedPoly) => {
      const areaHa = this.toolsManager.calculatePolygonAreaHa(updatedPoly.vertices);
      const perimetroM = this.toolsManager.calculatePerimeterMeters(updatedPoly.vertices);
      this.handleSaveProperties("poligono", updatedPoly.id, {
        vertices: updatedPoly.vertices,
        areaHa,
        perimetroM
      });
    });
  }

  setupSidebarTabs() {
    const tabPlaces = document.getElementById("btn-sidebar-tab-places");
    const tabLayers = document.getElementById("btn-sidebar-tab-layers");
    const viewPlaces = document.getElementById("sidebar-view-places");
    const viewLayers = document.getElementById("sidebar-view-layers");

    if (tabPlaces && tabLayers) {
      tabPlaces.addEventListener("click", () => {
        tabPlaces.classList.add("text-amber-400", "border-b-2", "border-amber-500", "bg-slate-900");
        tabPlaces.classList.remove("text-slate-400");
        tabLayers.classList.remove("text-sky-400", "border-b-2", "border-sky-500", "bg-slate-900");
        tabLayers.classList.add("text-slate-400");

        if (viewPlaces) viewPlaces.classList.remove("hidden");
        if (viewLayers) viewLayers.classList.add("hidden");
      });

      tabLayers.addEventListener("click", () => {
        tabLayers.classList.add("text-sky-400", "border-b-2", "border-sky-500", "bg-slate-900");
        tabLayers.classList.remove("text-slate-400");
        tabPlaces.classList.remove("text-amber-400", "border-b-2", "border-amber-500", "bg-slate-900");
        tabPlaces.classList.add("text-slate-400");

        if (viewPlaces) viewPlaces.classList.add("hidden");
        if (viewLayers) viewLayers.classList.remove("hidden");
      });
    }

    const layerCheckboxes = [
      { id: "chk-layer-l1", level: "l1" },
      { id: "chk-layer-l2", level: "l2" },
      { id: "chk-layer-l3", level: "l3" },
      { id: "chk-layer-l4", level: "l4" },
      { id: "chk-layer-l5", level: "l5" }
    ];

    layerCheckboxes.forEach(({ id, level }) => {
      const chk = document.getElementById(id);
      if (chk) {
        chk.addEventListener("change", (e) => {
          this.mapEngine.toggleHierarchicalLayer(level, e.target.checked);
        });
      }
    });
  }


  setupAuth() {
    const modalLogin = document.getElementById("modal-auth-login");
    const formLogin = document.getElementById("form-auth-login");
    const errorMsg = document.getElementById("auth-error-msg");
    const btnLogout = document.getElementById("btn-user-logout");

    // Registro en el objeto global para acceso rápido desde HTML
    window.earthQuickLogin = (role, pass) => this.quickLogin(role, pass);
    window.quickLoginImmediate = (role, pass) => this.quickLogin(role, pass);

    // Formulario de inicio de sesión
    if (formLogin) {
      formLogin.addEventListener("submit", (e) => {
        e.preventDefault();
        const userInput = (document.getElementById("auth-input-user")?.value || "").trim() || "admin";
        const passInput = (document.getElementById("auth-input-pass")?.value || "").trim();

        const res = this.authManager.login(userInput, passInput);
        if (!res.success) {
          if (errorMsg) {
            errorMsg.textContent = res.message;
            errorMsg.classList.remove("hidden");
          }
          return;
        }

        if (errorMsg) errorMsg.classList.add("hidden");
        if (modalLogin) {
          modalLogin.classList.add("hidden");
          modalLogin.classList.remove("flex");
          modalLogin.style.setProperty("display", "none", "important");
        }

        this.applyUserScope();
      });
    }

    // Poblar selector de parroquias en el modal de inicio
    const selectParishModal = document.getElementById("auth-select-parroquia");
    if (selectParishModal) {
      try {
        const allP = getAllParishesForSelector();
        selectParishModal.innerHTML = '<option value="">-- O selecciona tu Parroquia directa --</option>';
        let curMun = "";
        let optGroup = null;
        allP.forEach(p => {
          if (p.munNombre !== curMun) {
            curMun = p.munNombre;
            optGroup = document.createElement("optgroup");
            optGroup.label = `Municipio ${curMun}`;
            selectParishModal.appendChild(optGroup);
          }
          const opt = document.createElement("option");
          opt.value = p.parishId;
          opt.textContent = `📍 Parroquia ${p.parishNombre}`;
          if (optGroup) optGroup.appendChild(opt);
        });

        selectParishModal.addEventListener("change", (e) => {
          const val = e.target.value;
          if (val) {
            this.quickLogin(val, "admin");
          }
        });
      } catch (err) {
        console.warn("Error poblando selector modal:", err);
      }
    }

    // Botón de cierre de sesión
    if (btnLogout) {
      btnLogout.addEventListener("click", () => {
        if (confirm("¿Deseas cerrar tu sesión de trabajo territorial?")) {
          this.authManager.logout();
          window.location.reload();
        }
      });
    }

    // Comprobar si hay parámetro URL para auto-login (?u=admin o ?general=1 o ?p=jusepin)
    const urlParams = new URLSearchParams(window.location.search);
    const autoUser = urlParams.get("u") || urlParams.get("user") || urlParams.get("login");
    const autoGeneral = urlParams.get("general");

    if (autoGeneral === "1" || autoGeneral === "true" || autoUser) {
      this.quickLogin(autoUser || "admin");
      return;
    }

    // Verificar si ya existe una sesión activa
    if (!this.authManager.isAuthenticated()) {
      if (modalLogin) {
        modalLogin.classList.remove("hidden");
        modalLogin.classList.add("flex");
        modalLogin.style.display = "flex";
      }
    } else {
      if (modalLogin) {
        modalLogin.classList.add("hidden");
        modalLogin.classList.remove("flex");
        modalLogin.style.setProperty("display", "none", "important");
      }
      this.applyUserScope();
    }
  }

  quickLogin(identity = "admin", password = "admin") {
    const res = this.authManager.login(identity, password || "admin");
    const modalLogin = document.getElementById("modal-auth-login");
    const errorMsg = document.getElementById("auth-error-msg");

    if (res.success) {
      if (errorMsg) errorMsg.classList.add("hidden");
      if (modalLogin) {
        modalLogin.classList.add("hidden");
        modalLogin.classList.remove("flex");
        modalLogin.style.setProperty("display", "none", "important");
      }
      this.applyUserScope();
    } else {
      if (errorMsg) {
        errorMsg.textContent = res.message;
        errorMsg.classList.remove("hidden");
      }
    }
  }

  applyUserScope() {
    const user = this.authManager.getCurrentUser();
    if (!user) return;

    const navBtn = document.getElementById("btn-open-parish-modal");
    const lockWrapper = document.getElementById("nav-lock-icon-wrapper");
    const arrowIcon = document.getElementById("nav-arrow-icon");
    const statusRole = document.getElementById("status-user-role");
    const btnAdvToggle = document.getElementById("btn-toggle-advanced-tools");
    const toolbarAdv = document.getElementById("toolbar-advanced-tools");
    const tabLayers = document.getElementById("btn-sidebar-tab-layers");

    if (user.rol === "operador") {
      this.isGeneralMode = false;
      // Bloqueo estricto al territorio asignado
      this.selectedMunId = user.municipioId;
      this.selectedParishId = user.parroquiaId;

      if (lockWrapper) {
        lockWrapper.innerHTML = '<i data-lucide="lock" class="w-3.5 h-3.5 text-emerald-400 shrink-0"></i>';
      }
      if (arrowIcon) arrowIcon.classList.add("hidden");
      if (navBtn) {
        navBtn.classList.add("cursor-default");
        navBtn.title = `Jurisdicción Asignada Exclusiva: ${user.parroquiaNombre}`;
      }
      if (statusRole) {
        statusRole.textContent = `🔒 ${user.nombre}`;
      }
      // Herramientas de dibujo (Ruta, Marca) siempre visibles en modo campo
      if (btnAdvToggle) btnAdvToggle.classList.add("hidden");
      if (toolbarAdv) {
        toolbarAdv.classList.remove("hidden");
        toolbarAdv.classList.add("flex");
      }
      if (tabLayers) tabLayers.classList.add("hidden");
    } else if (user.rol === "coordinador") {
      this.isGeneralMode = false;
      this.selectedMunId = user.municipioId;
      const mun = CATALOGO_MONAGAS.find(m => m.id === this.selectedMunId);
      if (mun && mun.parroquias.length > 0) {
        this.selectedParishId = mun.parroquias[0].id;
      }
      if (lockWrapper) {
        lockWrapper.innerHTML = '<i data-lucide="shield" class="w-3.5 h-3.5 text-sky-400 shrink-0"></i>';
      }
      if (arrowIcon) arrowIcon.classList.remove("hidden");
      if (navBtn) {
        navBtn.classList.remove("cursor-default");
        navBtn.title = `Coordinación Municipal ${user.municipioNombre}`;
      }
      if (statusRole) {
        statusRole.textContent = `🏛️ ${user.nombre}`;
      }
      if (btnAdvToggle) {
        btnAdvToggle.classList.remove("hidden");
        btnAdvToggle.classList.add("flex");
      }
      if (toolbarAdv) {
        toolbarAdv.classList.remove("hidden");
        toolbarAdv.classList.add("flex");
      }
      if (tabLayers) tabLayers.classList.remove("hidden");
    } else {
      // Super Admin / Usuario General (Acceso Total a Monagas)
      this.isGeneralMode = true;
      this.selectedMunId = this.selectedMunId || "maturin";
      this.selectedParishId = this.selectedParishId || "jusepin";

      if (lockWrapper) {
        lockWrapper.innerHTML = '<i data-lucide="shield-check" class="w-3.5 h-3.5 text-amber-400 shrink-0"></i>';
      }
      if (arrowIcon) arrowIcon.classList.remove("hidden");
      if (navBtn) {
        navBtn.classList.remove("cursor-default");
        navBtn.title = `Territorio General de Monagas (Acceso Completo)`;
      }
      if (statusRole) {
        statusRole.textContent = `👑 Sala Central MIGATO (General)`;
      }
      if (btnAdvToggle) {
        btnAdvToggle.classList.remove("hidden");
        btnAdvToggle.classList.add("flex");
      }
      if (toolbarAdv) {
        toolbarAdv.classList.remove("hidden");
        toolbarAdv.classList.add("flex");
      }
      if (tabLayers) tabLayers.classList.remove("hidden");
    }

    this.selectParish(this.selectedMunId, this.selectedParishId);
    this.renderPlacesTree();

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      try { window.lucide.createIcons(); } catch(e){}
    }
  }


  setupToolbarEvents() {
    // 1. Botones de herramientas principales
    // Conmutar herramientas avanzadas
    const btnAdvToggle = document.getElementById("btn-toggle-advanced-tools");
    const toolbarAdv = document.getElementById("toolbar-advanced-tools");
    if (btnAdvToggle && toolbarAdv) {
      btnAdvToggle.addEventListener("click", () => {
        const isHidden = toolbarAdv.classList.contains("hidden");
        toolbarAdv.classList.toggle("hidden", !isHidden);
        toolbarAdv.classList.toggle("flex", isHidden);
        btnAdvToggle.classList.toggle("bg-slate-700", isHidden);
        btnAdvToggle.classList.toggle("text-white", isHidden);
      });
    }

    // 0. Herramienta Sub-Parroquia / Eje Comunal (Nivel 4)
    const btnSubparish = document.getElementById("btn-tool-subparish");
    if (btnSubparish) {
      btnSubparish.addEventListener("click", () => {
        this.toolsManager.setActiveTool("subparroquia");
      });
    }

    // 0.1 Botón Alternar Foco Parroquial
    const btnSpotlight = document.getElementById("btn-toggle-spotlight");
    if (btnSpotlight) {
      btnSpotlight.addEventListener("click", () => {
        const isEnabled = this.mapEngine.toggleSpotlight();
        this.updateSpotlightButtonUI(isEnabled);
      });
    }

    const btnPoly = document.getElementById("btn-tool-polygon");
    if (btnPoly) {
      btnPoly.addEventListener("click", () => {
        this.toolsManager.setActiveTool("poligono");
      });
    }

    const btnPath = document.getElementById("btn-tool-path");
    if (btnPath) {
      btnPath.addEventListener("click", () => {
        this.toolsManager.setActiveTool("ruta");
      });
    }

    const btnPlacemark = document.getElementById("btn-tool-placemark");
    if (btnPlacemark) {
      btnPlacemark.addEventListener("click", () => {
        this.toolsManager.setActiveTool("marca");
      });
    }

    // 2. Banner Flotante (Deshacer, Listo, Cancelar)
    const btnUndo = document.getElementById("btn-banner-undo");
    if (btnUndo) {
      btnUndo.addEventListener("click", () => {
        this.toolsManager.undoLastPoint();
      });
    }

    const btnFinish = document.getElementById("btn-banner-finish");
    if (btnFinish) {
      btnFinish.addEventListener("click", () => {
        if (this.mapEngine && this.mapEngine.editingPoly) {
          this.mapEngine.finishEditingPolygonGeometry();
        } else {
          this.toolsManager.finishCurrentDrawing();
        }
      });
    }

    const btnCancel = document.getElementById("btn-banner-cancel");
    if (btnCancel) {
      btnCancel.addEventListener("click", () => {
        if (this.mapEngine && this.mapEngine.editingPoly) {
          this.mapEngine.stopEditingPolygonGeometry();
        } else {
          this.toolsManager.cancelActiveTool();
        }
      });
    }

    // 3. Buscador en árbol de lugares
    const searchPlaces = document.getElementById("input-search-places");
    if (searchPlaces) {
      searchPlaces.addEventListener("input", (e) => {
        this.renderPlacesTree(e.target.value);
      });
    }

    // 4. Abrir KML
    const btnOpenKmlTrigger = document.getElementById("btn-open-kml-trigger");
    const inputFileKml = document.getElementById("input-file-kml");
    if (btnOpenKmlTrigger && inputFileKml) {
      btnOpenKmlTrigger.addEventListener("click", () => inputFileKml.click());
    }

    // 5. Exportar KML nativo (Individual de la Parroquia Activa)
    const btnExport = document.getElementById("btn-export-kml");
    if (btnExport) {
      btnExport.addEventListener("click", () => {
        const kmlStr = this.store.exportToKml(this.selectedMunId, this.selectedParishId);
        const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
        const fileName = `${parish.nombre.replace(/\s+/g, '_')}_GoogleEarthPro.kml`;

        const blob = new Blob([kmlStr], { type: "application/vnd.google-earth.kml+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }

    // 6. Brújula / Reset Norte
    const btnCompass = document.getElementById("btn-compass-north");
    if (btnCompass) {
      btnCompass.addEventListener("click", () => {
        const p = this.store.getParish(this.selectedMunId, this.selectedParishId);
        if (p) this.mapEngine.flyTo(p.centro[0], p.centro[1], p.zoom || 14);
      });
    }

    // 7. Toggle y cierre ergonómico del sidebar en móvil
    const btnToggleSidebar = document.getElementById("btn-toggle-sidebar");
    const btnCloseSidebar = document.getElementById("btn-close-sidebar");
    const sidebar = document.getElementById("earth-sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");

    const toggleSidebar = (open = null) => {
      if (!sidebar) return;
      const willOpen = open !== null ? open : sidebar.classList.contains("hidden");
      if (willOpen) {
        sidebar.classList.remove("hidden");
        sidebar.classList.add("flex");
        if (backdrop) backdrop.classList.remove("hidden");
      } else {
        sidebar.classList.add("hidden");
        sidebar.classList.remove("flex");
        if (backdrop) backdrop.classList.add("hidden");
      }
    };

    if (btnToggleSidebar) btnToggleSidebar.addEventListener("click", () => toggleSidebar());
    if (btnCloseSidebar) btnCloseSidebar.addEventListener("click", () => toggleSidebar(false));
    if (backdrop) backdrop.addEventListener("click", () => toggleSidebar(false));
  }

  setupDragAndDrop() {
    const dropZone = window;

    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    dropZone.addEventListener("drop", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer.files;
      if (!files || files.length === 0) return;

      for (let i = 0; i < files.length; i++) {
        await this.importKmlFile(files[i]);
      }
    });

    const fileInput = document.getElementById("input-file-kml");
    if (fileInput) {
      fileInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (file) await this.importKmlFile(file);
      });
    }
  }

  async importKmlFile(file) {
    try {
      const text = await file.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "text/xml");

      const placemarks = xmlDoc.getElementsByTagName("Placemark");
      let count = 0;

      for (let i = 0; i < placemarks.length; i++) {
        const pm = placemarks[i];
        const name = pm.getElementsByTagName("name")[0]?.textContent || `Elemento ${i+1}`;
        const polygon = pm.getElementsByTagName("Polygon")[0];
        const line = pm.getElementsByTagName("LineString")[0];

        if (polygon) {
          const coords = polygon.getElementsByTagName("coordinates")[0]?.textContent || "";
          const vertices = this.parseCoords(coords);
          if (vertices.length >= 3) {
            this.store.addItemToParish(this.selectedMunId, this.selectedParishId, "poligonos", {
              id: `IMP-POLY-${Date.now()}-${i}`,
              nombre: name,
              colorBorde: "#f59e0b",
              anchoBorde: 2,
              colorRelleno: "#f59e0b",
              opacidad: 0.35,
              vertices,
              areaHa: this.toolsManager.calculatePolygonAreaHa(vertices),
              perimetroM: this.toolsManager.calculatePerimeterMeters(vertices),
              visible: true,
              fecha: new Date().toISOString()
            });
            count++;
          }
        } else if (line) {
          const coords = line.getElementsByTagName("coordinates")[0]?.textContent || "";
          const puntos = this.parseCoords(coords);
          if (puntos.length >= 2) {
            this.store.addItemToParish(this.selectedMunId, this.selectedParishId, "rutas", {
              id: `IMP-ROUTE-${Date.now()}-${i}`,
              nombre: name,
              color: "#10b981",
              ancho: 4,
              puntos,
              longitudM: this.toolsManager.calculatePerimeterMeters(puntos),
              visible: true,
              fecha: new Date().toISOString()
            });
            count++;
          }
        }
      }

      const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
      this.mapEngine.renderParishItems(parish, (t, it) => this.propDialog.open(t, it, this.selectedMunId, this.selectedParishId));
      this.renderPlacesTree();
      alert(`Google Earth Pro: Se importaron ${count} elementos KML en ${parish.nombre}`);
    } catch (err) {
      alert("Error importando archivo KML: " + err.message);
    }
  }

  parseCoords(str) {
    return str.trim().split(/\s+/).map(pt => {
      const parts = pt.split(",");
      return [parseFloat(parts[1]), parseFloat(parts[0])];
    }).filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));
  }

  setupOverlayModal() {
    const modal = document.getElementById("modal-image-overlay");
    const btnOpen = document.getElementById("btn-tool-overlay");
    const btnClose = document.getElementById("btn-close-overlay");
    const form = document.getElementById("form-image-overlay");
    const inputOpacity = document.getElementById("overlay-opacity");
    const labelOpacity = document.getElementById("overlay-opacity-val");

    if (btnOpen) {
      btnOpen.addEventListener("click", () => {
        if (modal) {
          modal.classList.remove("hidden");
          modal.classList.add("flex");
        }
      });
    }

    if (btnClose) {
      btnClose.addEventListener("click", () => {
        if (modal) {
          modal.classList.add("hidden");
          modal.classList.remove("flex");
        }
      });
    }

    if (inputOpacity && labelOpacity) {
      inputOpacity.addEventListener("input", (e) => {
        labelOpacity.textContent = `${Math.round(e.target.value * 100)}%`;
      });
    }

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const fileInput = document.getElementById("input-overlay-file");
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const imgUrl = event.target.result;
          const bounds = this.mapEngine.map.getBounds();
          const op = parseFloat(inputOpacity.value) || 0.65;
          this.mapEngine.addImageOverlay(imgUrl, bounds, op);
          if (modal) {
            modal.classList.add("hidden");
            modal.classList.remove("flex");
          }
          alert("Plano superpuesto con éxito sobre el satélite. Ya puedes calcar polígonos y calles encima.");
        };
        reader.readAsDataURL(file);
      });
    }
  }
}

function startEarth() {
  if (!window.earthApp) {
    window.earthApp = new EarthMonagasApp();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startEarth);
} else {
  startEarth();
}
