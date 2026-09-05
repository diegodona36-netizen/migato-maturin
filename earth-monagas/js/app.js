/**
 * Controlador Principal — Google Earth Pro Web (Edición Estado Monagas)
 * Robusto, 100% Operativo y Totalmente Individualizado
 */
import { CATALOGO_MONAGAS, findParishInCatalog } from "./catalogoMonagas.js?v=87";
import { AuthManager, forceCleanCacheAndReload } from "./authManager.js?v=87";
import { getAllParishesForSelector } from "./usersCatalog.js?v=87";
import { EarthStore } from "./earthStore.js?v=87";
import { EarthMapEngine } from "./mapEngine.js?v=87";
import { PropertiesDialog } from "./propertiesDialog.js?v=87";
import { ToolsManager } from "./toolsManager.js?v=87";
import { detectParishFromGeometry } from "./geoMonagas.js?v=87";
import { GEO_PARROQUIAS_OFICIAL } from "./geoOficialMonagas.js?v=87";
import { 
  getSavedFirebaseConfig, 
  saveFirebaseConfig, 
  isFirebaseConfigured, 
  initFirebase 
} from "./firebaseConfig.js?v=87";

class EarthMonagasApp {
  constructor() {
    window.earthApp = this;
    this.store = null;
    this.mapEngine = null;
    this.propDialog = null;
    this.toolsManager = null;
    this.authManager = new AuthManager();

    this.selectedMunId = "maturin";
    this.selectedParishId = "alto-de-los-godos";
    window.earthApp = this;

    this.init();
  }

  init() {
    this.store = new EarthStore(CATALOGO_MONAGAS);

    // Restaurar última parroquia activa trabajada por el usuario
    try {
      const savedMun = localStorage.getItem("migato_last_mun");
      const savedParish = localStorage.getItem("migato_last_parish");
      if (savedMun && savedParish && this.store.getParish(savedMun, savedParish)) {
        this.selectedMunId = savedMun;
        this.selectedParishId = savedParish;
      }
    } catch (e) {}

    // Leer parámetro URL para individualización (?p=caicara o ?p=san-simon)
    const urlParams = new URLSearchParams(window.location.search);
    const paramParish = urlParams.get("p") || urlParams.get("parroquia") || urlParams.get("parish");
    const paramMun = urlParams.get("mun") || urlParams.get("municipio");
    if (paramMun) {
      const matchMun = CATALOGO_MONAGAS.find(m => m.id === paramMun.toLowerCase().trim());
      if (matchMun) this.selectedMunId = matchMun.id;
    }
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
      (poly, type) => {
        this.handleStartGeometryEdit(poly, type);
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
    this.setupKmlImportModal();
    this.setupOverlayModal();
    this.setupParishSelectorModal();
    this.setupAuth();
    // Iniciar listener en tiempo real de Firestore ahora que mapEngine está listo
    this.store.startRealtimeSync();

    // Cargar parroquia activa inicial de inmediato sin animaciones bruscas
    this.selectParish(this.selectedMunId, this.selectedParishId, false);
    this.renderQuickParishBar();

    // Sincronización autoritativa desde Google Cloud Firestore
    this.store.syncFromCloud().then(() => {
      // Asegurar que la parroquia con más datos y sectores activos quede seleccionada y visible
      const recent = this.store.getMostRecentlyUpdatedParish();
      const targetMun = paramMun || (recent && recent.munId ? recent.munId : this.selectedMunId);
      const targetParish = paramParish || (recent && recent.parishId ? recent.parishId : this.selectedParishId);

      const shouldFly = (targetMun !== this.selectedMunId || targetParish !== this.selectedParishId);
      this.selectParish(targetMun, targetParish, shouldFly);
      this.renderQuickParishBar();
      this.renderPlacesTree();
      this.updateMilitanciaTally();

      const paramSector = urlParams.get("sector");
      if (paramSector) {
        setTimeout(() => {
          const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
          const poly = (parish?.poligonos || []).find(p => String(p.id) === String(paramSector));
          if (poly) {
            this.handleItemClick("poligono", poly.id);
            if (poly.vertices && poly.vertices.length > 0) {
              this.mapEngine?.map?.fitBounds(poly.vertices, { maxZoom: 16 });
            }
          }
        }, 300);
      }
    });

    // Polling de respaldo cada 20 segundos
    setInterval(() => {
      this.store.syncFromCloud();
    }, 20000);

    window.activateEarthTool = (toolName) => {
      // Regla de Oro Territorial: "Primero el Pote (Sub-Parroquia), luego el Agua (Sector Comunal)"
      if (toolName === "poligono") {
        const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
        const subps = parish?.subparroquias || [];
        if (subps.length === 0) {
          this.showSubParishRequiredModal(parish);
          return;
        }
        if (!this.activeSubParroquiaId) {
          if (subps.length === 1) {
            this.activeSubParroquiaId = String(subps[0].id);
            this.focusSubParish(subps[0].id, false);
          } else {
            this.showSelectSubParishModal(subps, parish);
            return;
          }
        }
      }
      if (this.toolsManager) {
        this.toolsManager.setActiveTool(toolName);
      }
    };
    if (window._pendingEarthTool) {
      window.activateEarthTool(window._pendingEarthTool);
      window._pendingEarthTool = null;
    }

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

  selectParish(munId, parishId, flyCamera = true) {
    try {
      this.activeSubParroquiaId = null;

      // Restricción de seguridad si la sesión está segmentada a una parroquia específica
      if (!this.isGeneralMode && this.authManager) {
        const currentUser = this.authManager.getCurrentUser();
        if (currentUser && currentUser.parroquiaId) {
          munId = currentUser.municipioId;
          parishId = currentUser.parroquiaId;
        }
      }

      let parish = this.store ? this.store.getParish(munId, parishId) : null;
      if (!parish && this.store) {
        const found = this.store.findParishById(parishId);
        if (found) {
          munId = found.munId;
          parishId = found.parishId;
          parish = found.parish;
        } else {
          munId = "maturin";
          parishId = "san-simon";
          parish = this.store.getParish("maturin", "san-simon");
        }
      }
      if (!parish) return;

      this.selectedMunId = munId;
      this.selectedParishId = parishId;

      try {
        localStorage.setItem("migato_last_mun", munId);
        localStorage.setItem("migato_last_parish", parishId);
      } catch(e) {}

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
      if (this.mapEngine) {
        this.mapEngine.showParishBoundary(parish.limite, parish.id, flyCamera);
        this.mapEngine.renderParishItems(parish, (type, item) => {
          this.handleMapItemSelection(type, item);
        });
      }

      this.updateMilitanciaTally();
      this.renderPlacesTree();
      this.renderQuickParishBar();
      if (this.mapEngine) {
        this.updateSpotlightButtonUI(this.mapEngine.spotlightEnabled);
      }

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
    } catch (err) {
      console.warn("[selectParish] Error controlado:", err);
    }
  }

  updateMilitanciaTally() {
    const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
    if (!parish) return;

    let totalMilitantes = 0;
    let totalCasas = 0;

    const polys = parish.poligonos || [];
    if (polys.length > 0) {
      // Los sectores son la fuente de verdad primaria (Nivel 5)
      polys.forEach(p => {
        totalMilitantes += parseInt(p.militantes !== undefined ? p.militantes : (p.habitantes || 0)) || 0;
        totalCasas += parseInt(p.casas || 0) || 0;
      });
    } else {
      // Fallback si solo se han trazado sub-parroquias sin sectores aún
      (parish.subparroquias || []).forEach(sp => {
        totalMilitantes += parseInt(sp.militantes !== undefined ? sp.militantes : (sp.habitantes || 0)) || 0;
        totalCasas += parseInt(sp.casas || 0) || 0;
      });
    }

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
      this.handleMapItemSelection(type, item);
    });

    if (typeof this.mapEngine.updateHierarchicalLOD === "function") {
      this.mapEngine.updateHierarchicalLOD();
    }
    this.renderPlacesTree();
  }

  clearSubParishFocus() {
    this.activeSubParroquiaId = null;
    const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
    if (parish) {
      this.mapEngine.showParishBoundary(parish.limite, parish.id, true);
      this.mapEngine.renderParishItems(parish, (type, item) => {
        this.handleMapItemSelection(type, item);
      });
    }
    if (typeof this.mapEngine.updateHierarchicalLOD === "function") {
      this.mapEngine.updateHierarchicalLOD();
    }
    this.renderPlacesTree();
  }

  startSectorInSubParish(subParishId) {
    const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
    const sp = (parish?.subparroquias || []).find(s => String(s.id) === String(subParishId));
    if (!sp) return;

    if (this.mapEngine?.map) {
      try { this.mapEngine.map.closePopup(); } catch(e) {}
    }
    this.closeSubParishModal();

    this.focusSubParish(subParishId, true);
    this.activeSubParroquiaId = String(subParishId);

    if (this.toolsManager) {
      this.toolsManager.setActiveTool("poligono");
    }
    this.showToast(`🎯 Trazando Sector Comunal dentro de: <strong>${sp.nombre}</strong>`, "sky");
  }

  openSubParishFicha(subParishId) {
    this.closeQuickStats();
    if (this.mapEngine?.map) {
      try { this.mapEngine.map.closePopup(); } catch(e) {}
    }
    const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
    const sp = (parish?.subparroquias || []).find(s => String(s.id) === String(subParishId));
    if (sp && this.propDialog) {
      this.propDialog.open("subparroquia", sp, this.selectedMunId, this.selectedParishId);
    }
  }

  findSubParish(subParishId) {
    const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
    return (parish?.subparroquias || []).find(s => String(s.id) === String(subParishId));
  }

  closeSubParishModal() {
    const modal = document.getElementById("modal-select-subparish");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  }

  showSubParishRequiredModal(parish) {
    const modal = document.getElementById("modal-select-subparish");
    const title = document.getElementById("modal-subparish-title");
    const body = document.getElementById("modal-subparish-body");
    if (!modal || !body) return;

    if (title) title.textContent = "Nivel 4 Requerido • Sub-Parroquia / Eje";

    body.innerHTML = `
      <div class="bg-purple-950/40 border border-purple-500/40 rounded-2xl p-3.5 text-xs text-slate-200 leading-relaxed space-y-2">
        <div class="flex items-center gap-2 text-purple-300 font-bold">
          <span class="text-base">📌</span>
          <span>Estructura Jerárquica Obligatoria</span>
        </div>
        <p>
          Para organizar tus comunidades, cada <strong>Sector Comunal (Nivel 5)</strong> debe pertenecer a una <strong>Sub-Parroquia o Eje Comunal (Nivel 4)</strong>.
        </p>
        <p class="text-slate-400">
          Actualmente la parroquia <strong>${parish?.nombre || 'activa'}</strong> no tiene ninguna sub-parroquia delimitada. Delimita primero el perímetro de la sub-parroquia en el satélite.
        </p>
      </div>

      <div class="flex flex-col sm:flex-row gap-2 pt-1">
        <button type="button" onclick="window.earthApp?.closeSubParishModal(); window.activateEarthTool('subparroquia');" class="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition cursor-pointer">
          <i data-lucide="shield" class="w-4 h-4"></i>
          <span>➕ Delimitar Sub-Parroquia Ahora</span>
        </button>
        <button type="button" onclick="window.earthApp?.closeSubParishModal();" class="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition cursor-pointer">
          Cancelar
        </button>
      </div>
    `;

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    if (window.lucide) { try { window.lucide.createIcons(); } catch(e){} }
  }

  showSelectSubParishModal(subps, parish) {
    const modal = document.getElementById("modal-select-subparish");
    const title = document.getElementById("modal-subparish-title");
    const body = document.getElementById("modal-subparish-body");
    if (!modal || !body) return;

    if (title) title.textContent = "Seleccionar Sub-Parroquia / Eje Comunal";

    body.innerHTML = `
      <p class="text-xs text-slate-300 leading-relaxed">
        Indica en cuál de las <strong>${subps.length} sub-parroquias</strong> de <strong>${parish?.nombre || 'la parroquia'}</strong> se ubicará este nuevo sector comunal:
      </p>

      <div class="max-h-60 overflow-y-auto space-y-1.5 pr-1 font-mono">
        ${subps.map(sp => {
          const childSectors = (parish?.poligonos || []).filter(p => String(p.subParroquiaId) === String(sp.id));
          return `
            <div onclick="window.earthApp?.startSectorInSubParish('${sp.id}');" class="p-2.5 rounded-xl bg-slate-950/80 hover:bg-purple-950/60 border border-slate-800 hover:border-purple-500/60 transition cursor-pointer flex items-center justify-between group">
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="w-3.5 h-3.5 rounded-md border shrink-0" style="background-color: ${sp.colorRelleno || '#a855f7'}; border-color: ${sp.colorBorde || '#c084fc'};"></span>
                <div class="truncate">
                  <strong class="text-white text-xs block truncate group-hover:text-purple-300">${sp.nombre}</strong>
                  <span class="text-[10px] text-slate-400">${sp.areaHa || 0} Ha • ${childSectors.length} sectores</span>
                </div>
              </div>
              <span class="text-xs text-sky-400 group-hover:translate-x-0.5 transition font-black shrink-0">Trazar ➔</span>
            </div>
          `;
        }).join("")}
      </div>

      <div class="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
        <button type="button" onclick="window.earthApp?.closeSubParishModal(); window.activateEarthTool('subparroquia');" class="text-xs text-purple-400 hover:text-purple-300 underline font-bold flex items-center gap-1 cursor-pointer">
          <span>+ Delimitar Nueva Sub-Parroquia</span>
        </button>
        <button type="button" onclick="window.earthApp?.closeSubParishModal();" class="text-[11px] text-slate-400 hover:text-slate-200 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer">
          Cancelar
        </button>
      </div>
    `;

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    if (window.lucide) { try { window.lucide.createIcons(); } catch(e){} }
  }

  detectSubParishFromGeometry(vertices, subparroquias) {
    if (!vertices || vertices.length < 3 || !subparroquias || subparroquias.length === 0) return null;
    let sumLat = 0, sumLng = 0;
    vertices.forEach(v => {
      sumLat += (v.lat !== undefined ? v.lat : v[0]);
      sumLng += (v.lng !== undefined ? v.lng : v[1]);
    });
    const centroid = { lat: sumLat / vertices.length, lng: sumLng / vertices.length };

    for (const sp of subparroquias) {
      if (!sp.vertices || sp.vertices.length < 3) continue;
      if (this.isPointInPolygon(centroid, sp.vertices)) {
        return sp;
      }
    }
    return null;
  }

  isPointInPolygon(point, vs) {
    const x = point.lat !== undefined ? point.lat : point[0];
    const y = point.lng !== undefined ? point.lng : point[1];
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      const xi = vs[i].lat !== undefined ? vs[i].lat : vs[i][0];
      const yi = vs[i].lng !== undefined ? vs[i].lng : vs[i][1];
      const xj = vs[j].lat !== undefined ? vs[j].lat : vs[j][0];
      const yj = vs[j].lng !== undefined ? vs[j].lng : vs[j][1];
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  deleteSubParish(subParishId) {
    if (confirm("¿Deseas eliminar esta Sub-Parroquia / Eje Comunal?")) {
      this.store.deleteItem(this.selectedMunId, this.selectedParishId, "subparroquias", subParishId);
      if (this.activeSubParroquiaId === String(subParishId)) {
        this.activeSubParroquiaId = null;
      }
      const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
      this.mapEngine.renderParishItems(parish, (t, it) => {
        this.handleMapItemSelection(t, it);
      });
      this.renderPlacesTree();
    }
  }

  renameSubParish(subParishId) {
    const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
    if (!parish) return;
    const sp = (parish.subparroquias || []).find(s => String(s.id) === String(subParishId));
    if (!sp) return;
    this.propDialog.open("subparroquia", sp, this.selectedMunId, this.selectedParishId);
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
        this.handleMapItemSelection(t, it);
      });
    });
  }

  toggleSubParishWithChildrenVisibility(subParishId) {
    const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
    if (!parish) return;
    const sp = (parish.subparroquias || []).find(s => String(s.id) === String(subParishId));
    if (!sp) return;

    const newVis = sp.visible === false ? true : false;
    sp.visible = newVis;

    // Conmutar también todos los sectores hijos de este eje (igual que en Google Earth Pro)
    (parish.poligonos || []).forEach(p => {
      if (String(p.subParroquiaId) === String(subParishId)) {
        p.visible = newVis;
      }
    });

    this.store.saveParish(this.selectedMunId, this.selectedParishId, parish);
    this.mapEngine.renderParishItems(parish, (t, it) => {
      this.handleMapItemSelection(t, it);
    });
    this.renderPlacesTree();
  }

  toggleSubParishFolder(subParishId) {
    this.collapsedFolders = this.collapsedFolders || new Set();
    const sid = String(subParishId);
    if (this.collapsedFolders.has(sid)) {
      this.collapsedFolders.delete(sid);
    } else {
      this.collapsedFolders.add(sid);
    }
    this.renderPlacesTree();
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

  renderQuickParishBar() {
    let bar = document.getElementById("earth-quick-parish-bar");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "earth-quick-parish-bar";
      bar.className = "fixed bottom-3 left-1/2 -translate-x-1/2 z-[1500] max-w-[95vw] overflow-x-auto flex items-center gap-1.5 px-3 py-2 bg-slate-950/95 border border-purple-500/60 rounded-2xl shadow-2xl backdrop-blur-md transition-all pointer-events-auto";
      document.body.appendChild(bar);
    }

    if (!this.isGeneralMode) {
      bar.classList.add("hidden");
      return;
    }

    const allParishes = this.store?.getAllParishesWithData() || [];
    if (allParishes.length === 0) {
      bar.classList.add("hidden");
      return;
    }
    bar.classList.remove("hidden");

    bar.innerHTML = `
      <div class="flex items-center gap-1 text-[10px] font-black uppercase text-purple-300 font-mono shrink-0 mr-1">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span class="hidden sm:inline">En Red:</span>
      </div>
      <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        ${allParishes.map(({ munId, parishId, parish: p }) => {
          const isActive = String(this.selectedParishId) === String(parishId);
          const count = (p.poligonos || []).length;
          const subCount = (p.subparroquias || []).length;
          const bg = isActive 
            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-300 shadow-md shadow-purple-900/50 font-black scale-105" 
            : "bg-slate-900/90 hover:bg-purple-950/80 text-slate-200 border-slate-700 font-bold hover:text-purple-200";
          return `
            <button onclick="window.earthApp.selectParish('${munId}', '${parishId}')" class="px-3 py-1.5 rounded-xl text-xs border flex items-center gap-2 shrink-0 transition-all active:scale-95 cursor-pointer ${bg}">
              <span>📍 ${p.nombre}</span>
              <span class="text-[10px] font-mono opacity-90 bg-black/40 px-1.5 py-0.5 rounded-md border border-white/10">
                ${count > 0 ? `${count} sec` : `${subCount} ejes`}
              </span>
            </button>
          `;
        }).join("")}
      </div>
    `;
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

    // Calcular totales de militancia y casas en la parroquia (sumando sectores y ejes)
    let totalMilitantes = 0;
    let totalCasas = 0;
    allPolys.forEach(p => {
      totalMilitantes += parseInt(p.militantes !== undefined ? p.militantes : (p.habitantes || 0)) || 0;
      totalCasas += parseInt(p.casas || 0) || 0;
    });
    allSubparroquias.forEach(sp => {
      totalMilitantes += parseInt(sp.militantes !== undefined ? sp.militantes : (sp.habitantes || 0)) || 0;
      totalCasas += parseInt(sp.casas || 0) || 0;
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

    // Buscar otras parroquias que tengan datos sincronizados en la red (ej. Aparicio)
    const otherParishesWithData = [];
    if (this.store && this.store.state && this.store.state.municipios) {
      Object.entries(this.store.state.municipios).forEach(([mId, mun]) => {
        Object.entries(mun.parroquias || {}).forEach(([pId, p]) => {
          if (mId === this.selectedMunId && pId === this.selectedParishId) return;
          const subCount = (p.subparroquias || []).length;
          const polyCount = (p.poligonos || []).length;
          if (subCount > 0 || polyCount > 0) {
            otherParishesWithData.push({ mId, pId, nombre: p.nombre, munNombre: mun.nombre, subCount, polyCount });
          }
        });
      });
    }

    let html = "";

    // Barra de acceso directo a otras parroquias sincronizadas en la red (solo en Dirección General)
    if (this.isGeneralMode && otherParishesWithData.length > 0 && !q) {
      html += `
        <div class="mb-3 p-2.5 bg-slate-950/90 border border-purple-500/50 rounded-2xl shadow-lg space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black uppercase text-purple-300 tracking-wider flex items-center gap-1">
              <span>🌐</span> Territorios con Datos en Red:
            </span>
            <span class="text-[9px] text-emerald-400 font-mono font-bold animate-pulse">● En Vivo</span>
          </div>
          <div class="flex flex-col gap-1">
            ${otherParishesWithData.map(op => `
              <button onclick="window.earthApp.selectParish('${op.mId}', '${op.pId}')" class="w-full px-2.5 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-left text-xs font-bold text-white flex items-center justify-between active:scale-95 transition cursor-pointer group">
                <span class="truncate group-hover:text-purple-300">📍 ${op.nombre} <span class="text-[10px] text-slate-400">(${op.munNombre})</span></span>
                <span class="text-[10px] text-purple-300 font-mono shrink-0 ml-1 font-black bg-purple-900/80 px-1.5 py-0.5 rounded border border-purple-700/50">
                  ${op.subCount} ejes • ${op.polyCount} sec ➔
                </span>
              </button>
            `).join("")}
          </div>
        </div>
      `;
    }

    html += `
      <!-- Tarjeta de Parroquia Activa con Resumen de Militancia -->
      <div class="bg-slate-950/90 p-3 rounded-2xl border border-sky-500/40 mb-3 shadow-lg">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[10px] font-bold text-sky-400 uppercase tracking-wider">${munObj?.nombre || 'Municipio'}</span>
          ${this.authManager.canSwitchParish() ? `
          <button onclick="window.earthApp.openParishSelector()" class="text-[10px] text-amber-400 hover:text-amber-300 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/30 active:scale-95 transition cursor-pointer">
            Cambiar ▾
          </button>` : `
          <button onclick="window.earthApp.openSessionModal()" class="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-950/60 hover:bg-emerald-900/80 px-2 py-0.5 rounded-lg border border-emerald-800/40 flex items-center gap-1 active:scale-95 transition cursor-pointer" title="Parroquia Asignada. Clic para cambiar de parroquia">
            <i data-lucide="lock" class="w-2.5 h-2.5"></i>
            <span>Asignada ▾</span>
          </button>`}
        </div>
        <h4 class="text-sm font-black text-white truncate">${pData.nombre}</h4>

        <!-- Resumen Territorial Limpio (Capa 5 y Capa 4) -->
        <div class="grid grid-cols-2 gap-2 mt-2 font-mono">
          <div class="bg-sky-950/70 border border-sky-600/40 p-1.5 rounded-xl text-center shadow-sm">
            <span class="text-[9px] text-sky-400 font-bold uppercase block mb-0.5">Sectores (Capa 5)</span>
            <span class="text-xs font-black text-sky-300">🔷 ${allPolys.length} Sectores</span>
          </div>
          <div class="bg-purple-950/70 border border-purple-600/40 p-1.5 rounded-xl text-center shadow-sm">
            <span class="text-[9px] text-purple-400 font-bold uppercase block mb-0.5">Ejes (Capa 4)</span>
            <span class="text-xs font-black text-purple-300">🟪 ${allSubparroquias.length} Ejes</span>
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
      <!-- SECCIÓN JERÁRQUICA: SUB-PARROQUIAS / EJES COMUNALES (NIVEL 4 Y 5 ESTILO GOOGLE EARTH PRO) -->
      <div class="mb-3">
        <div class="flex items-center justify-between px-2 py-1.5 bg-slate-950/60 rounded-xl border border-purple-900/40 mb-1.5">
          <span class="flex items-center gap-1.5 text-xs font-black text-purple-400 uppercase tracking-wide">
            <i data-lucide="folder-tree" class="w-4 h-4 text-purple-400"></i>
            <span>Carpetas de Ejes Comunales (${allSubparroquias.length})</span>
          </span>
          <span class="text-[10px] font-mono font-bold text-purple-300/80 bg-purple-950/80 px-2 py-0.5 rounded-md border border-purple-800/50">Nivel 4 ➔ 5</span>
        </div>
        <div class="space-y-2 mt-1">
    `;

    if (allSubparroquias.length === 0) {
      html += `
        <div class="text-[11px] text-slate-400 px-3 py-3 italic bg-slate-950/40 rounded-xl border border-slate-800/40 text-center space-y-2">
          <p>⚠️ No hay sub-parroquias / ejes comunales creados aún en esta parroquia.</p>
          <p class="text-slate-500 text-[10px]">Crea primero el eje contenedor (el pote) antes de vaciar los sectores comunales.</p>
          <button onclick="window.activateEarthTool('subparroquia')" class="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-black text-xs inline-flex items-center gap-1 shadow-lg transition active:scale-95 cursor-pointer">
            <i data-lucide="shield" class="w-3.5 h-3.5"></i>
            <span>+ Crear Primer Eje Comunal</span>
          </button>
        </div>
      `;
    } else {
      this.collapsedFolders = this.collapsedFolders || new Set();

      allSubparroquias.forEach(sp => {
        const isSelected = String(sp.id) === String(this.activeSubParroquiaId);
        const secInSp = allPolys.filter(p => String(p.subParroquiaId) === String(sp.id));

        // Si hay búsqueda activa, evaluar si el eje o algún sector coincide
        const matchSp = !q || sp.nombre.toLowerCase().includes(q);
        const filteredSecInSp = secInSp.filter(p => !q || p.nombre.toLowerCase().includes(q));
        if (q && !matchSp && filteredSecInSp.length === 0) return;

        const displaySecs = q ? filteredSecInSp : secInSp;
        const isCollapsed = this.collapsedFolders.has(String(sp.id));
        const isExpanded = !isCollapsed;

        // Rollup vivo de estadísticas del eje sumando sus sectores hijos
        let totCasas = 0, totFam = 0, totHab = 0, totVot = 0;
        secInSp.forEach(p => {
          totCasas += parseInt(p.casas || 0) || 0;
          totFam += parseInt(p.familias || 0) || 0;
          totHab += parseInt(p.habitantes || 0) || 0;
          totVot += parseInt(p.militantes !== undefined ? p.militantes : (p.habitantes || 0)) || 0;
        });

        html += `
          <div class="bg-slate-950/80 rounded-2xl border transition shadow-sm overflow-hidden ${isSelected ? 'border-purple-500 ring-1 ring-purple-500/40 shadow-purple-500/10' : 'border-slate-800/80'}">
            
            <!-- Cabecera de la Carpeta (Sub-Parroquia / Eje Comunal) -->
            <div class="p-2.5 flex items-center justify-between gap-1.5 hover:bg-purple-950/30 transition cursor-pointer" onclick="window.earthApp.toggleSubParishFolder('${sp.id}')">
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <button type="button" onclick="event.stopPropagation(); window.earthApp.toggleSubParishFolder('${sp.id}')" class="text-purple-400 hover:text-white p-0.5 text-xs font-mono transition">
                  ${isExpanded ? '▼' : '▶'}
                </button>
                <input type="checkbox" ${sp.visible !== false ? 'checked' : ''} 
                  onclick="event.stopPropagation()"
                  onchange="window.earthApp.toggleSubParishWithChildrenVisibility('${sp.id}')"
                  class="w-4 h-4 rounded bg-slate-900 border-purple-800 text-purple-600 focus:ring-0 cursor-pointer shrink-0" title="Mostrar u ocultar todo este eje con sus sectores">
                <span class="text-base shrink-0 select-none">${isExpanded ? '📂' : '📁'}</span>
                <div class="truncate min-w-0" onclick="event.stopPropagation(); window.earthApp.focusAndEdit('subparroquia', '${sp.id}', false)">
                  <span class="text-slate-100 font-black block truncate text-xs ${isSelected ? 'text-purple-300' : ''}">${sp.nombre}</span>
                  <div class="flex items-center gap-1.5 text-[10px] font-mono text-purple-300 flex-wrap">
                    <span>🏠 ${totCasas}</span>
                    <span>• 👥 ${totHab}</span>
                    <span>• 🗳️ ${totVot}</span>
                    <span class="text-sky-300 font-bold">• 🔷 ${secInSp.length} sec</span>
                  </div>
                </div>
              </div>

              <!-- Acciones del Eje -->
              <div class="flex items-center gap-1 shrink-0" onclick="event.stopPropagation()">
                <button onclick="window.earthApp.startSectorInSubParish('${sp.id}')" class="text-sky-400 hover:text-sky-200 p-1 transition" title="➕ Trazar Sector Comunal dentro de este eje">
                  <i data-lucide="plus-circle" class="w-4 h-4"></i>
                </button>
                <button onclick="window.earthApp.openSubParishFicha('${sp.id}')" class="text-slate-400 hover:text-purple-300 p-1 transition" title="Ficha y Propiedades del Eje">
                  <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
                </button>
                <button onclick="window.earthApp.focusSubParish('${sp.id}', true)" class="text-purple-400 hover:text-purple-200 p-1 transition" title="Enfocar en mapa">
                  <i data-lucide="crosshair" class="w-3.5 h-3.5"></i>
                </button>
                <button onclick="window.earthApp.deleteSubParish('${sp.id}')" class="text-slate-500 hover:text-red-400 p-1 transition" title="Eliminar eje">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </div>

            <!-- Contenido de la Carpeta: Lista de Sectores Hijos Indentados -->
            ${isExpanded ? `
              <div class="pl-6 pr-2.5 pb-2.5 pt-1 space-y-1.5 border-t border-purple-950 bg-slate-950/40">
                ${displaySecs.length === 0 ? `
                  <div class="text-[11px] text-slate-400 italic py-2 px-2 bg-slate-900/40 rounded-xl border border-slate-800/40 text-center">
                    No hay sectores trazados aún dentro de este eje.<br>
                    <button onclick="window.earthApp.startSectorInSubParish('${sp.id}')" class="text-sky-400 font-bold underline mt-1 inline-block">➕ Trazar el primer sector</button>
                  </div>
                ` : displaySecs.map(poly => {
                  const milCount = poly.militantes !== undefined ? poly.militantes : (poly.habitantes || 0);

                  return `
                    <div class="flex items-center justify-between py-1.5 px-2 bg-slate-900/70 hover:bg-slate-800/90 rounded-xl group text-xs border border-slate-800 transition shadow-sm">
                      <div class="flex items-center gap-2 truncate min-w-0">
                        <input type="checkbox" ${poly.visible !== false ? 'checked' : ''} 
                          onchange="window.earthApp.toggleItemVisibility('${this.selectedMunId}', '${this.selectedParishId}', 'poligono', '${poly.id}')"
                          class="w-3.5 h-3.5 rounded bg-slate-950 border-slate-700 text-sky-500 focus:ring-0 cursor-pointer shrink-0">
                        <span class="w-3 h-3 rounded-sm border shrink-0" style="background-color: ${poly.colorRelleno || '#38bdf8'}; border-color: ${poly.colorBorde || '#ffffff'};"></span>
                        <div class="truncate cursor-pointer min-w-0" onclick="window.earthApp.focusAndEdit('poligono', '${poly.id}', false)">
                          <span class="text-slate-200 font-bold block truncate group-hover:text-sky-300 text-xs">${poly.nombre}</span>
                          <div class="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 flex-wrap">
                            ${poly.casas ? `<span class="text-amber-400 font-bold">🏠 ${poly.casas}</span>` : ''}
                            ${poly.familias ? `<span class="text-sky-300">👨‍👩‍👧 ${poly.familias}</span>` : ''}
                            <span class="text-emerald-400 font-bold">👥 ${poly.habitantes || milCount}</span>
                            ${poly.militantes !== undefined ? `<span class="text-purple-300 font-bold">🗳️ ${poly.militantes}</span>` : ''}
                            ${poly.centroVotacion ? `<span class="text-slate-300 truncate max-w-[120px]" title="${poly.centroVotacion}">🏫 ${poly.centroVotacion}</span>` : ''}
                          </div>
                        </div>
                      </div>
                      <div class="flex items-center gap-1 shrink-0 ml-1">
                        <button onclick="window.earthApp.focusAndEdit('poligono', '${poly.id}', true)" class="text-slate-400 hover:text-sky-300 p-1 transition" title="Editar caracterización socio-política">
                          <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
                        </button>
                        <button onclick="window.earthApp.deleteItem('${this.selectedMunId}', '${this.selectedParishId}', 'poligono', '${poly.id}')" class="text-slate-500 hover:text-red-400 p-1 transition" title="Eliminar sector">
                          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                        </button>
                      </div>
                    </div>
                  `;
                }).join("")}
              </div>
            ` : ''}
          </div>
        `;
      });

      // Sectores huérfanos (si existiera alguno sin sub-parroquia asignada)
      const orphanSectors = allPolys.filter(p => !p.subParroquiaId || !allSubparroquias.some(sp => String(sp.id) === String(p.subParroquiaId)));
      if (orphanSectors.length > 0) {
        html += `
          <div class="bg-amber-950/40 rounded-2xl border border-amber-500/50 p-2.5 space-y-2 mt-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black text-amber-300 flex items-center gap-1.5">
                <span>⚠️</span>
                <span>Sectores sin Eje Asignado (${orphanSectors.length})</span>
              </span>
              <span class="text-[9px] text-amber-400 font-mono font-bold bg-amber-900/60 px-2 py-0.5 rounded">Asignar Eje</span>
            </div>
            <p class="text-[11px] text-amber-200/80 leading-tight">
              Estos sectores no están asignados a ninguna sub-parroquia. Toca cada uno para asignarlo a su eje contenedor:
            </p>
            <div class="space-y-1">
              ${orphanSectors.map(poly => `
                <div class="flex items-center justify-between py-1.5 px-2 bg-slate-900/90 rounded-xl border border-amber-500/30 text-xs">
                  <span class="text-white font-bold truncate">${poly.nombre}</span>
                  <button onclick="window.earthApp.focusAndEdit('poligono', '${poly.id}', true)" class="text-[10px] text-sky-400 hover:text-sky-300 font-bold underline">
                    Asignar Eje ➔
                  </button>
                </div>
              `).join("")}
            </div>
          </div>
        `;
      }
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

  openSessionModal() {
    const modalLogin = document.getElementById("modal-auth-login");
    const errorMsg = document.getElementById("auth-error-msg");
    const selectJurisdiction = document.getElementById("auth-select-jurisdiction");
    const inputUser = document.getElementById("auth-input-user");
    const inputPass = document.getElementById("auth-input-pass");

    if (errorMsg) errorMsg.classList.add("hidden");
    if (inputUser && !inputUser.value) inputUser.value = "admin";
    if (inputPass && !inputPass.value) inputPass.value = "admin";

    if (selectJurisdiction) {
      if (this.isGeneralMode) {
        selectJurisdiction.value = "general";
      } else if (this.selectedMunId && this.selectedParishId) {
        selectJurisdiction.value = `${this.selectedMunId}/${this.selectedParishId}`;
      }
    }

    if (modalLogin) {
      modalLogin.classList.remove("hidden");
      modalLogin.classList.add("flex");
      modalLogin.style.display = "flex";
    }

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      try { window.lucide.createIcons(); } catch(e){}
    }
  }

  openParishSelector() {
    if (!this.isGeneralMode) {
      this.openSessionModal();
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
        const parishStore = this.store.getParish(mun.id, p.id);
        const subCount = (parishStore?.subparroquias || []).length;
        const polyCount = (parishStore?.poligonos || []).length;
        const hasData = subCount > 0 || polyCount > 0;

        return `
          <button onclick="window.earthApp.selectParishFromModal('${mun.id}', '${p.id}')" class="px-3 py-2 rounded-xl text-left text-xs font-semibold transition flex items-center justify-between cursor-pointer ${isCurrent ? 'bg-sky-600 text-white font-black shadow-lg' : (hasData ? 'bg-purple-950/70 hover:bg-purple-900/90 text-purple-200 border border-purple-500/50' : 'bg-slate-800 hover:bg-slate-700 text-slate-200')}">
            <span class="truncate">${p.nombre}</span>
            <div class="flex items-center gap-1.5 shrink-0 ml-1">
              ${hasData ? `<span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-900/90 text-purple-300 border border-purple-700 font-black">${subCount} ejes • ${polyCount} sec</span>` : ''}
              <i data-lucide="chevron-right" class="w-3.5 h-3.5 opacity-60"></i>
            </div>
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

  handleMapItemSelection(type, item) {
    if (!item) return;

    if (type === "subparroquia") {
      this.activeSubParroquiaId = String(item.id);
      if (this.mapEngine) {
        this.mapEngine.highlightPolygon(item.id);
      }
      this.showQuickStats("subparroquia", item);
      this.renderPlacesTree();
    } else if (type === "poligono") {
      if (this.mapEngine) {
        this.mapEngine.highlightPolygon(item.id);
      }
      this.showQuickStats("poligono", item);
    } else {
      this.closeQuickStats();
      this.propDialog?.open(type, item, this.selectedMunId, this.selectedParishId);
    }
  }

  showQuickStats(type, item) {
    if (!item) return;
    this.currentQuickStatsItem = { type, item };

    const card = document.getElementById("card-quick-stats");
    if (!card) return;

    const badge = document.getElementById("quick-stats-type-badge");
    const subTitle = document.getElementById("quick-stats-subtitle");
    const title = document.getElementById("quick-stats-title");
    const elCasas = document.getElementById("quick-stats-casas");
    const elFamilias = document.getElementById("quick-stats-familias");
    const elHabitantes = document.getElementById("quick-stats-habitantes");
    const elVotantes = document.getElementById("quick-stats-votantes");
    const elCentro = document.getElementById("quick-stats-centro");
    const btnEdit = document.getElementById("btn-quick-stats-edit");

    const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);

    if (type === "subparroquia") {
      if (badge) badge.style.backgroundColor = item.colorRelleno || item.colorBorde || "#c084fc";
      if (subTitle) subTitle.textContent = "Sub-Parroquia / Eje Comunal";
      if (title) title.textContent = item.nombre || "Sub-Parroquia";

      const childSecs = (parish?.poligonos || []).filter(p => String(p.subParroquiaId) === String(item.id));
      let totCasas = 0, totFam = 0, totHab = 0, totVot = 0;
      childSecs.forEach(c => {
        totCasas += parseInt(c.casas || 0) || 0;
        totFam += parseInt(c.familias || 0) || 0;
        totHab += parseInt(c.habitantes || 0) || 0;
        totVot += parseInt(c.militantes !== undefined ? c.militantes : (c.habitantes || 0)) || 0;
      });

      if (elCasas) elCasas.textContent = totCasas.toLocaleString();
      if (elFamilias) elFamilias.textContent = totFam.toLocaleString();
      if (elHabitantes) elHabitantes.textContent = totHab.toLocaleString();
      if (elVotantes) elVotantes.textContent = totVot.toLocaleString();

      if (elCentro) elCentro.textContent = `${childSecs.length} Sectores Integrados`;
    } else {
      // Sector Comunal (poligono)
      if (badge) badge.style.backgroundColor = item.colorRelleno || item.colorBorde || "#facc15";

      let spName = "";
      if (item.subParroquiaId && parish?.subparroquias) {
        const sp = parish.subparroquias.find(s => String(s.id) === String(item.subParroquiaId));
        if (sp) spName = ` • ${sp.nombre}`;
      }
      if (subTitle) subTitle.textContent = `Sector Comunal${spName}`;
      if (title) title.textContent = item.nombre || "Sector";

      if (elCasas) elCasas.textContent = (parseInt(item.casas || 0) || 0).toLocaleString();
      if (elFamilias) elFamilias.textContent = (parseInt(item.familias || 0) || 0).toLocaleString();
      if (elHabitantes) elHabitantes.textContent = (parseInt(item.habitantes || 0) || 0).toLocaleString();
      const votantes = item.militantes !== undefined ? item.militantes : (item.habitantes || 0);
      if (elVotantes) elVotantes.textContent = (parseInt(votantes) || 0).toLocaleString();

      if (elCentro) elCentro.textContent = item.centroVotacion || "No asignado";
    }

    if (btnEdit) {
      btnEdit.onclick = () => {
        this.closeQuickStats();
        this.propDialog?.open(type, item, this.selectedMunId, this.selectedParishId);
      };
    }

    card.style.display = "block";
    if (window.lucide) {
      try { window.lucide.createIcons(); } catch(e) {}
    }
  }

  closeQuickStats() {
    const card = document.getElementById("card-quick-stats");
    if (card) {
      card.style.display = "none";
    }
    if (this.mapEngine) {
      this.mapEngine.clearPolygonHighlight();
    }
    this.currentQuickStatsItem = null;
  }

  focusAndEdit(type, itemId, openDialogDirectly = false) {
    if (type === "subparroquia") {
      this.focusSubParish(itemId, true);
      const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
      const sp = (parish?.subparroquias || []).find(s => String(s.id) === String(itemId));
      if (sp) {
        if (this.mapEngine) this.mapEngine.highlightPolygon(sp.id);
        if (openDialogDirectly) {
          this.closeQuickStats();
          this.propDialog?.open("subparroquia", sp, this.selectedMunId, this.selectedParishId);
        } else {
          this.showQuickStats("subparroquia", sp);
        }
      }
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
      if (this.mapEngine) this.mapEngine.highlightPolygon(item.id);
      if (openDialogDirectly) {
        this.closeQuickStats();
        this.propDialog.open(type, item, munId, parishId);
      } else {
        this.showQuickStats(type, item);
      }
    } else if (type === "ruta" && item.puntos && item.puntos.length > 0) {
      this.closeQuickStats();
      this.mapEngine.map.flyToBounds(L.polyline(item.puntos).getBounds(), { padding: [50, 50], duration: 1.0 });
      this.propDialog.open(type, item, munId, parishId);
    } else if (type === "marca" && item.lat !== undefined && item.lng !== undefined) {
      this.closeQuickStats();
      this.mapEngine.flyTo(item.lat, item.lng, 16);
      this.propDialog.open(type, item, munId, parishId);
    }
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

  async handleFinishedDrawing(type, newItem) {
    let targetMunId = this.selectedMunId || "maturin";
    let targetParishId = this.selectedParishId || "alto-de-los-godos";

    // Si el usuario no tiene parroquia activa asignada, auto-detectar
    if (!this.selectedParishId || this.selectedParishId === "monagas") {
      const geoPoints = newItem.vertices || (newItem.puntos ? newItem.puntos : (newItem.lat !== undefined ? [newItem.lat, newItem.lng] : null));
      if (geoPoints) {
        try {
          const detected = detectParishFromGeometry(geoPoints, GEO_PARROQUIAS_OFICIAL);
          if (detected && detected.parishId) {
            targetMunId = detected.munId || targetMunId;
            targetParishId = detected.parishId;
            this.selectParish(targetMunId, targetParishId);
          }
        } catch(geoErr) {
          console.warn("[AutoDetect] Error detectando parroquia:", geoErr);
        }
      }
    }

    try {
      localStorage.setItem("migato_last_mun", targetMunId);
      localStorage.setItem("migato_last_parish", targetParishId);
    } catch(e) {}

    newItem.munId = targetMunId;
    newItem.parishId = targetParishId;

    if (type === "subparroquia") {
      const parishStore = this.store.getParish(targetMunId, targetParishId);
      const existingCount = (parishStore?.subparroquias || []).length;
      if (!newItem.nombre || newItem.nombre === "Nuevo Eje / Sub-Parroquia") {
        newItem.nombre = `Eje Comunal ${existingCount + 1}`;
      }

      if (this.mapEngine && !this.mapEngine.hierarchicalVisibility?.l4) {
        this.mapEngine.toggleHierarchicalLayer("l4", true);
        const chk = document.getElementById("chk-layer-l4");
        if (chk) chk.checked = true;
      }

      this.showToast(`☁️ Guardando <strong>${newItem.nombre}</strong> en la nube...`, "purple");
      await this.store.addItemToParish(targetMunId, targetParishId, "subparroquias", newItem);
      this.activeSubParroquiaId = String(newItem.id);

      const parish = this.store.getParish(targetMunId, targetParishId);
      this.mapEngine.renderParishItems(parish, (t, it) => {
        this.handleMapItemSelection(t, it);
      });
      this.focusSubParish(newItem.id);
      this.renderPlacesTree();
      this.renderQuickParishBar();
      this.showToast(`✅ <strong>${newItem.nombre}</strong> asegurado en la nube. Pulsa <strong>[+ Sector Comunal]</strong> para trazar sectores dentro.`, "purple");
      return;
    }

    if (type === "poligono") {
      const parishStore = this.store.getParish(targetMunId, targetParishId);
      const subps = parishStore?.subparroquias || [];

      if (this.activeSubParroquiaId && subps.some(s => String(s.id) === String(this.activeSubParroquiaId))) {
        newItem.subParroquiaId = String(this.activeSubParroquiaId);
      } else {
        const detectedSp = this.detectSubParishFromGeometry(newItem.vertices, subps);
        if (detectedSp) {
          newItem.subParroquiaId = String(detectedSp.id);
        } else if (subps.length === 1) {
          newItem.subParroquiaId = String(subps[0].id);
        }
      }
    }

    if (type === "poligono" && this.mapEngine && !this.mapEngine.hierarchicalVisibility?.l5) {
      this.mapEngine.toggleHierarchicalLayer("l5", true);
      const chk = document.getElementById("chk-layer-l5");
      if (chk) chk.checked = true;
    }

    const key = type === "poligono" ? "poligonos" : (type === "ruta" ? "rutas" : (type === "subparroquia" ? "subparroquias" : "marcas"));
    this.showToast(`☁️ Guardando <strong>${newItem.nombre}</strong> en la nube...`, "sky");
    await this.store.addItemToParish(targetMunId, targetParishId, key, newItem);

    const parish = this.store.getParish(targetMunId, targetParishId);
    this.mapEngine.renderParishItems(parish, (t, it) => {
      this.handleMapItemSelection(t, it);
    });

    this.updateMilitanciaTally();
    this.renderPlacesTree();
    this.renderQuickParishBar();

    const toastColor = type === "poligono" ? "sky" : (type === "ruta" ? "emerald" : "rose");
    let msg = `✅ <strong>${newItem.nombre}</strong> asegurado en la nube con éxito en ${parish?.nombre || 'la Parroquia'}.`;
    if (type === "poligono" && newItem.subParroquiaId) {
      const spObj = (parish?.subparroquias || []).find(s => String(s.id) === String(newItem.subParroquiaId));
      if (spObj) {
        msg = `✅ Sector <strong>${newItem.nombre}</strong> asegurado en la nube y vinculado a: <strong class="text-purple-300">${spObj.nombre}</strong>.`;
      }
    }
    this.showToast(msg, toastColor);
  }

  async handleSaveProperties(type, itemId, updatedFields, targetMunId = null, targetParishId = null) {
    if (updatedFields?.isNew || this.propDialog?.currentItem?.isNew) {
      const draft = Object.assign({}, this.propDialog?.currentItem || {}, updatedFields);
      delete draft.isNew;

      const destMunId = targetMunId || this.selectedMunId;
      const destParishId = targetParishId || this.selectedParishId;
      const key = type === "poligono" ? "poligonos" : (type === "ruta" ? "rutas" : (type === "subparroquia" ? "subparroquias" : "marcas"));

      if (type === "subparroquia") {
        await this.store.addItemToParish(destMunId, destParishId, "subparroquias", draft);
        this.activeSubParroquiaId = String(draft.id);
        const parish = this.store.getParish(destMunId, destParishId);
        this.mapEngine.renderParishItems(parish, (t, it) => {
          this.handleMapItemSelection(t, it);
        });
        this.focusSubParish(draft.id);
        this.renderPlacesTree();
        this.showToast(`🟪 <strong>${draft.nombre}</strong> creado exitosamente.`, "purple");
        return;
      }

      if (type === "poligono" && !draft.subParroquiaId) {
        const parishStore = this.store.getParish(destMunId, destParishId);
        const subps = parishStore?.subparroquias || [];
        if (this.activeSubParroquiaId && subps.some(s => String(s.id) === String(this.activeSubParroquiaId))) {
          draft.subParroquiaId = String(this.activeSubParroquiaId);
        } else {
          const detectedSp = this.detectSubParishFromGeometry(draft.vertices, subps);
          if (detectedSp) {
            draft.subParroquiaId = String(detectedSp.id);
          } else if (subps.length === 1) {
            draft.subParroquiaId = String(subps[0].id);
          }
        }
      }

      await this.store.addItemToParish(destMunId, destParishId, key, draft);
      const parish = this.store.getParish(destMunId, destParishId);
      this.mapEngine.renderParishItems(parish, (t, it) => {
        this.handleMapItemSelection(t, it);
      });
      this.updateMilitanciaTally();
      this.renderPlacesTree();

      let msg = `✅ <strong>${draft.nombre}</strong> guardado y creado exitosamente.`;
      if (type === "poligono" && draft.subParroquiaId) {
        const spObj = (parish?.subparroquias || []).find(s => String(s.id) === String(draft.subParroquiaId));
        if (spObj) {
          msg = `✅ Sector <strong>${draft.nombre}</strong> vinculado a: <strong class="text-purple-300">${spObj.nombre}</strong>.`;
        }
      }
      this.showToast(msg, "emerald");
      return;
    }

    const key = type === "poligono" ? "poligonos" : (type === "ruta" ? "rutas" : (type === "subparroquia" ? "subparroquias" : "marcas"));
    const destMunId = targetMunId || this.selectedMunId;
    const destParishId = targetParishId || this.selectedParishId;

    if (destMunId !== this.selectedMunId || destParishId !== this.selectedParishId) {
      // Reubicar elemento a otra parroquia
      this.store.moveItem(this.selectedMunId, this.selectedParishId, destMunId, destParishId, key, itemId, updatedFields);
      // Cambiar de parroquia activa para enfocar y mostrar el elemento transferido
      this.selectParish(destMunId, destParishId);
    } else {
      await this.store.updateItem(this.selectedMunId, this.selectedParishId, key, itemId, updatedFields);
      const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
      this.mapEngine.renderParishItems(parish, (t, it) => {
        this.handleMapItemSelection(t, it);
      });
      this.updateMilitanciaTally();
      this.renderPlacesTree();
    }
  }

  handleLiveStylePreview(type, itemId, liveDraft) {
    const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
    if (!parish) return;

    const key = type === "poligono" ? "poligonos" : (type === "ruta" ? "rutas" : (type === "subparroquia" ? "subparroquias" : "marcas"));
    const item = (parish[key] || []).find(it => String(it.id) === String(itemId));
    if (item) {
      Object.assign(item, liveDraft);
      this.mapEngine.renderParishItems(parish, (t, it) => {
        this.handleMapItemSelection(t, it);
      });
    }
  }

  async deleteItem(munId, parishId, type, itemId) {
    if (confirm("¿Deseas eliminar este elemento de Google Earth?")) {
      const key = type === "poligono" ? "poligonos" : (type === "ruta" ? "rutas" : (type === "subparroquia" ? "subparroquias" : "marcas"));
      await this.store.deleteItem(munId, parishId, key, itemId);

      const parish = this.store.getParish(munId, parishId);
      this.mapEngine.renderParishItems(parish, (t, it) => {
        this.handleMapItemSelection(t, it);
      });
      this.updateMilitanciaTally();
      this.renderPlacesTree();
      this.renderQuickParishBar();
    }
  }

  toggleItemVisibility(munId, parishId, type, itemId) {
    const key = type === "poligono" ? "poligonos" : (type === "ruta" ? "rutas" : (type === "subparroquia" ? "subparroquias" : "marcas"));
    this.store.toggleItemVisibility(munId, parishId, key, itemId);

    const parish = this.store.getParish(munId, parishId);
    this.mapEngine.renderParishItems(parish, (t, it) => {
      this.handleMapItemSelection(t, it);
    });
  }

  handleStartGeometryEdit(poly, explicitType = null) {
    this.toolsManager.cancelActiveTool();
    const type = explicitType || (poly.subParroquiaId !== undefined ? "poligono" : "subparroquia");
    this.mapEngine.startEditingPolygonGeometry(poly, (updatedPoly) => {
      const areaHa = this.toolsManager.calculatePolygonAreaHa(updatedPoly.vertices);
      const perimetroM = this.toolsManager.calculatePerimeterMeters(updatedPoly.vertices);
      this.handleSaveProperties(type, updatedPoly.id, {
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
        if (this.mapEngine) {
          this.mapEngine.toggleHierarchicalLayer(level, chk.checked);
        }
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
    const btnSessionBadge = document.getElementById("btn-session-badge");
    const btnCloseAuth = document.getElementById("btn-close-auth-modal");
    const selectJurisdiction = document.getElementById("auth-select-jurisdiction");
    const btnTogglePass = document.getElementById("btn-toggle-pass-visibility");
    const inputPass = document.getElementById("auth-input-pass");
    const inputUser = document.getElementById("auth-input-user");

    // Registro en el objeto global para llamadas directas
    window.earthQuickLogin = (role, pass) => this.quickLogin(role, pass);
    window.quickLoginImmediate = (role, pass) => this.quickLogin(role, pass);

    // Botón de sesión en la barra superior
    if (btnSessionBadge) {
      btnSessionBadge.addEventListener("click", () => this.openSessionModal());
    }

    // Botón para cerrar el modal de sesión (volver al mapa)
    if (btnCloseAuth) {
      btnCloseAuth.addEventListener("click", () => {
        if (modalLogin) {
          modalLogin.classList.add("hidden");
          modalLogin.classList.remove("flex");
          modalLogin.style.display = "none";
        }
      });
    }

    // Poblar selector formal de las 44 parroquias agrupadas por municipio
    if (selectJurisdiction) {
      try {
        const allP = getAllParishesForSelector();
        selectJurisdiction.innerHTML = '<option value="general">👑 Dirección General (Acceso Central a Todo Monagas)</option>';
        let curMun = "";
        let optGroup = null;
        allP.forEach(p => {
          if (p.munNombre !== curMun) {
            curMun = p.munNombre;
            optGroup = document.createElement("optgroup");
            optGroup.label = `Municipio ${curMun}`;
            selectJurisdiction.appendChild(optGroup);
          }
          const opt = document.createElement("option");
          opt.value = `${p.munId}/${p.parishId}`;
          opt.textContent = `📍 Parroquia ${p.parishNombre}`;
          if (optGroup) optGroup.appendChild(opt);
        });
      } catch (err) {
        console.warn("Error poblando selector de jurisdicción:", err);
      }
    }

    // Alternar visibilidad de contraseña (ojo)
    if (btnTogglePass && inputPass) {
      btnTogglePass.addEventListener("click", () => {
        const isPass = inputPass.type === "password";
        inputPass.type = isPass ? "text" : "password";
        const icon = document.getElementById("icon-pass-visibility");
        if (icon) {
          icon.setAttribute("data-lucide", isPass ? "eye-off" : "eye");
          if (window.lucide && typeof window.lucide.createIcons === "function") {
            try { window.lucide.createIcons(); } catch(e){}
          }
        }
      });
    }

    // Formulario de inicio de sesión institucional
    if (formLogin) {
      formLogin.addEventListener("submit", (e) => {
        e.preventDefault();
        const jurisVal = selectJurisdiction?.value || "general";
        const userInput = (inputUser?.value || "").trim() || "admin";
        const passInput = (inputPass?.value || "").trim() || "admin";
        const rememberChk = document.getElementById("auth-chk-remember");
        const remember = rememberChk ? rememberChk.checked : true;

        // Si se eligió una parroquia en el selector de jurisdicción, vincular al ámbito seleccionado
        let identity = userInput;
        if (jurisVal && jurisVal !== "general") {
          if (userInput === "admin" || userInput === "") {
            identity = jurisVal;
          }
        } else {
          identity = (userInput && userInput !== "admin") ? userInput : "admin";
        }

        const res = this.authManager.login(identity, passInput, remember);
        if (!res.success) {
          if (errorMsg) {
            errorMsg.textContent = res.message || "Credenciales no válidas. Verifique sus datos.";
            errorMsg.classList.remove("hidden");
          }
          return;
        }

        if (errorMsg) errorMsg.classList.add("hidden");
        if (modalLogin) {
          modalLogin.classList.add("hidden");
          modalLogin.classList.remove("flex");
          modalLogin.style.display = "none";
        }

        this.applyUserScope();
        const roleText = res.user.rol === "admin" 
          ? "👑 Dirección General (Monagas)" 
          : `🔒 Parroquia ${res.user.parroquiaNombre || res.user.nombre}`;
        this.showToast(`Bienvenido: ${roleText}`, "success");
      });
    }

    // Botón de cierre de sesión institucional
    if (btnLogout) {
      btnLogout.addEventListener("click", () => {
        this.authManager.logout();
        this.openSessionModal();
        this.showToast("Sesión cerrada. Ingrese sus credenciales para continuar.", "info");
      });
    }

    // Comprobar si hay parámetro URL para auto-login (?u=admin o ?general=1 o ?p=jusepin)
    const urlParams = new URLSearchParams(window.location.search);
    const autoUser = urlParams.get("u") || urlParams.get("user") || urlParams.get("login");
    const autoGeneral = urlParams.get("general");

    if (autoGeneral === "1" || autoGeneral === "true" || autoUser) {
      this.quickLogin(autoUser || "admin", "admin");
      return;
    }

    // Cargar sesión activa guardada o abrir el portal de acceso institucional
    if (this.authManager.isAuthenticated()) {
      if (modalLogin) {
        modalLogin.classList.add("hidden");
        modalLogin.classList.remove("flex");
        modalLogin.style.display = "none";
      }
      this.applyUserScope();
    } else {
      this.openSessionModal();
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
        modalLogin.style.display = "none";
      }
      this.applyUserScope();
      const roleText = res.user.rol === "admin" 
        ? "👑 Dirección General (Monagas)" 
        : `🔒 Parroquia ${res.user.parroquiaNombre || res.user.nombre}`;
      this.showToast(`Bienvenido: ${roleText}`, "success");
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
    const badgeBtn = document.getElementById("btn-session-badge");
    const badgeIcon = document.getElementById("session-badge-icon");
    const badgeLabel = document.getElementById("session-badge-label");

    // Determinar si es Administrador General o Parroquia Segmentada
    const isGeneral = (user.rol === "admin" || (!user.parroquiaId && !user.municipioId));
    this.isGeneralMode = isGeneral;

    if (isGeneral) {
      // 👑 MODO CENTRAL / DIRECCIÓN GENERAL
      if (badgeBtn) {
        badgeBtn.className = "px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/50 text-amber-300 text-xs font-black flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm shrink-0";
        badgeBtn.title = "Sesión: Dirección General (Clic para cambiar a una Parroquia)";
      }
      if (badgeIcon) badgeIcon.textContent = "👑";
      if (badgeLabel) badgeLabel.textContent = "Dirección General";

      if (lockWrapper) {
        lockWrapper.innerHTML = '<i data-lucide="shield-check" class="w-3.5 h-3.5 text-amber-400 shrink-0"></i>';
      }
      if (arrowIcon) arrowIcon.classList.remove("hidden");
      if (navBtn) {
        navBtn.classList.remove("cursor-default");
        navBtn.title = "Territorio General de Monagas (Acceso Completo - Clic para cambiar)";
      }
      if (statusRole) {
        statusRole.textContent = "👑 Sala Central MIGATO (General)";
      }

      // Respetar última parroquia si existe
      const savedMun = localStorage.getItem("migato_last_mun");
      const savedParish = localStorage.getItem("migato_last_parish");
      if (savedMun && savedParish && this.store.getParish(savedMun, savedParish)) {
        this.selectedMunId = savedMun;
        this.selectedParishId = savedParish;
      } else {
        const recent = this.store.getMostRecentlyUpdatedParish();
        if (recent && recent.parishId) {
          this.selectedMunId = recent.munId;
          this.selectedParishId = recent.parishId;
        } else {
          this.selectedMunId = this.selectedMunId || "maturin";
          this.selectedParishId = this.selectedParishId || "san-simon";
        }
      }
    } else {
      // 🔒 MODO PARROQUIA SEGMENTADA (UNA POR UNA)
      const pName = user.parroquiaNombre || user.nombre || "Parroquia";
      const mName = user.municipioNombre || "";

      if (badgeBtn) {
        badgeBtn.className = "px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/50 text-emerald-300 text-xs font-black flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm shrink-0";
        badgeBtn.title = `Sesión Parroquial: ${pName} (${mName}) - Clic para cambiar de parroquia`;
      }
      if (badgeIcon) badgeIcon.textContent = "🔒";
      if (badgeLabel) badgeLabel.textContent = `${pName}`;

      if (lockWrapper) {
        lockWrapper.innerHTML = '<i data-lucide="lock" class="w-3.5 h-3.5 text-emerald-400 shrink-0"></i>';
      }
      if (arrowIcon) arrowIcon.classList.add("hidden");
      if (navBtn) {
        navBtn.title = `Parroquia Segmentada: ${pName} - Clic para cambiar de parroquia`;
      }
      if (statusRole) {
        statusRole.textContent = `🔒 ${pName} (${mName})`;
      }

      // Fijar OBLIGATORIAMENTE el territorio a la parroquia del usuario
      this.selectedMunId = user.municipioId;
      this.selectedParishId = user.parroquiaId;
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

    this.selectParish(this.selectedMunId, this.selectedParishId);
    this.renderPlacesTree();
    this.renderQuickParishBar();

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      try { window.lucide.createIcons(); } catch(e){}
    }
  }


  setupToolbarEvents() {
    // 0. Delegación global infalible para cualquier botón de herramienta (barra superior o barra móvil inferior)
    document.addEventListener("click", (e) => {
      const toolBtn = e.target.closest("[data-tool]");
      if (toolBtn && toolBtn.dataset.tool) {
        const tool = toolBtn.dataset.tool;
        window.activateEarthTool(tool);
      }
    });

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
      for (let i = 0; i < files.length; i++) {
        await this.importKmlFile(files[i]);
      }
    });

    const fileInput = document.getElementById("input-file-kml");
    if (fileInput) {
      fileInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (file) await this.importKmlFile(file);
        e.target.value = "";
      });
    }
  }

  setupKmlImportModal() {
    this.pendingKmlImport = null;

    const modal = document.getElementById("modal-kml-import");
    const btnClose = document.getElementById("btn-close-kml-import");
    const btnCancel = document.getElementById("btn-cancel-kml-import");
    const btnConfirm = document.getElementById("btn-confirm-kml-import");
    const cardCapa1 = document.getElementById("card-capa-1");
    const cardCapa2 = document.getElementById("card-capa-2");
    const radioCapa1 = document.getElementById("radio-layer-capa1");
    const radioCapa2 = document.getElementById("radio-layer-capa2");
    const selectParish = document.getElementById("kml-select-parish");
    const btnToggleAll = document.getElementById("btn-kml-toggle-all");

    if (!modal) return;

    const closeModal = () => {
      modal.style.display = "none";
      modal.classList.add("hidden");
      this.pendingKmlImport = null;
    };

    if (btnClose) btnClose.addEventListener("click", closeModal);
    if (btnCancel) btnCancel.addEventListener("click", closeModal);

    const setLayer = (layer) => {
      if (!this.pendingKmlImport) return;
      this.pendingKmlImport.selectedLayer = layer;
      const boxEje = document.getElementById("kml-box-eje-link");

      if (layer === "capa1") {
        if (radioCapa1) radioCapa1.checked = true;
        if (radioCapa2) radioCapa2.checked = false;
        if (cardCapa1) cardCapa1.className = "kml-layer-card cursor-pointer p-3.5 rounded-xl border-2 transition relative flex flex-col justify-between border-purple-500 bg-purple-950/40 shadow-[0_0_15px_rgba(168,85,247,0.25)]";
        if (cardCapa2) cardCapa2.className = "kml-layer-card cursor-pointer p-3.5 rounded-xl border-2 transition relative flex flex-col justify-between border-slate-700 bg-slate-800/40 hover:border-slate-600 opacity-60 hover:opacity-100";
        if (boxEje) boxEje.classList.add("hidden");
      } else {
        if (radioCapa2) radioCapa2.checked = true;
        if (radioCapa1) radioCapa1.checked = false;
        if (cardCapa2) cardCapa2.className = "kml-layer-card cursor-pointer p-3.5 rounded-xl border-2 transition relative flex flex-col justify-between border-sky-500 bg-sky-950/40 shadow-[0_0_15px_rgba(56,189,248,0.25)]";
        if (cardCapa1) cardCapa1.className = "kml-layer-card cursor-pointer p-3.5 rounded-xl border-2 transition relative flex flex-col justify-between border-slate-700 bg-slate-800/40 hover:border-slate-600 opacity-60 hover:opacity-100";
        if (boxEje) boxEje.classList.remove("hidden");
        this.updateKmlEjeOptions();
      }
      this.updateKmlImportModalUI();
    };

    if (cardCapa1) cardCapa1.addEventListener("click", () => setLayer("capa1"));
    if (cardCapa2) cardCapa2.addEventListener("click", () => setLayer("capa2"));
    if (radioCapa1) radioCapa1.addEventListener("change", () => setLayer("capa1"));
    if (radioCapa2) radioCapa2.addEventListener("change", () => setLayer("capa2"));

    if (selectParish) {
      selectParish.addEventListener("change", (e) => {
        if (!this.pendingKmlImport) return;
        const [mId, pId] = e.target.value.split("/");
        this.pendingKmlImport.targetMunId = mId;
        this.pendingKmlImport.targetParishId = pId;
        this.updateKmlEjeOptions();
        this.updateKmlImportModalUI();
      });
    }

    if (btnToggleAll) {
      btnToggleAll.addEventListener("click", () => {
        if (!this.pendingKmlImport || !this.pendingKmlImport.polygons) return;
        const allChecked = this.pendingKmlImport.polygons.every(p => p.checked);
        this.pendingKmlImport.polygons.forEach(p => p.checked = !allChecked);
        this.renderKmlItemsList();
        this.updateKmlImportModalUI();
      });
    }

    if (btnConfirm) {
      btnConfirm.addEventListener("click", async () => {
        await this.executeKmlImport();
      });
    }
  }

  updateKmlEjeOptions() {
    const selectEje = document.getElementById("kml-select-eje");
    if (!selectEje || !this.pendingKmlImport) return;

    const mId = this.pendingKmlImport.targetMunId;
    const pId = this.pendingKmlImport.targetParishId;
    const parish = this.store.getParish(mId, pId);
    const subps = parish?.subparroquias || [];

    selectEje.innerHTML = `<option value="">— Sin vincular a un Eje específico —</option>` +
      subps.map(sp => `<option value="${sp.id}">🟣 ${sp.nombre}</option>`).join("");
  }

  renderKmlItemsList() {
    const container = document.getElementById("kml-items-list");
    if (!container || !this.pendingKmlImport) return;

    const polys = this.pendingKmlImport.polygons || [];
    if (polys.length === 0) {
      container.innerHTML = `<div class="p-4 text-center text-slate-500 italic">No se detectaron polígonos cerrados en este archivo.</div>`;
      return;
    }

    container.innerHTML = polys.map((p, idx) => `
      <div class="flex items-center gap-2 p-2 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition">
        <input type="checkbox" data-idx="${idx}" class="kml-item-checkbox accent-emerald-500 w-4 h-4 rounded cursor-pointer shrink-0" ${p.checked ? "checked" : ""}>
        <div class="flex-1 min-w-0">
          <input type="text" data-idx="${idx}" value="${p.name.replace(/"/g, '&quot;')}" class="kml-item-name w-full bg-slate-800/80 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-400 font-semibold" placeholder="Nombre del polígono">
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <span class="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300 font-mono">${p.vertices.length} pts</span>
          <span class="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-[10px] text-emerald-300 font-bold font-mono">${p.areaHa || 0} Ha</span>
        </div>
      </div>
    `).join("");

    container.querySelectorAll(".kml-item-checkbox").forEach(cb => {
      cb.addEventListener("change", (e) => {
        const idx = parseInt(e.target.getAttribute("data-idx"), 10);
        if (this.pendingKmlImport && this.pendingKmlImport.polygons[idx]) {
          this.pendingKmlImport.polygons[idx].checked = e.target.checked;
          this.updateKmlImportModalUI();
        }
      });
    });

    container.querySelectorAll(".kml-item-name").forEach(inp => {
      inp.addEventListener("input", (e) => {
        const idx = parseInt(e.target.getAttribute("data-idx"), 10);
        if (this.pendingKmlImport && this.pendingKmlImport.polygons[idx]) {
          this.pendingKmlImport.polygons[idx].name = e.target.value.trim() || `Polígono ${idx + 1}`;
        }
      });
    });
  }

  updateKmlImportModalUI() {
    if (!this.pendingKmlImport) return;
    const polys = this.pendingKmlImport.polygons || [];
    const selectedCount = polys.filter(p => p.checked).length;
    const labelCount = document.getElementById("kml-selected-count");
    if (labelCount) labelCount.textContent = selectedCount;

    const btnConfirm = document.getElementById("btn-confirm-kml-import");
    const labelConfirm = document.getElementById("btn-confirm-kml-label");
    const parish = this.store.getParish(this.pendingKmlImport.targetMunId, this.pendingKmlImport.targetParishId);
    const parishName = parish ? parish.nombre : "Parroquia";

    if (labelConfirm) {
      if (this.pendingKmlImport.selectedLayer === "capa1") {
        labelConfirm.textContent = `Importar ${selectedCount} Polígonos a Capa 1 (Ejes Comunales) en ${parishName}`;
      } else {
        labelConfirm.textContent = `Importar ${selectedCount} Polígonos a Capa 2 (Sectores Comunales) en ${parishName}`;
      }
    }

    if (btnConfirm) {
      btnConfirm.disabled = selectedCount === 0;
      if (selectedCount === 0) {
        btnConfirm.classList.add("opacity-50", "cursor-not-allowed");
      } else {
        btnConfirm.classList.remove("opacity-50", "cursor-not-allowed");
      }
    }
  }

  async importKmlFile(file) {
    try {
      let text = "";
      const isKmz = file.name.toLowerCase().endsWith(".kmz");

      if (isKmz) {
        if (!window.JSZip) {
          throw new Error("Librería de descompresión KMZ cargando... Por favor intenta en un momento.");
        }
        const zip = await window.JSZip.loadAsync(file);
        const kmlEntry = Object.values(zip.files).find(f => f.name.toLowerCase().endsWith(".kml"));
        if (!kmlEntry) {
          throw new Error("El archivo .kmz comprimido no contiene ningún archivo .kml en su interior.");
        }
        text = await kmlEntry.async("string");
      } else {
        text = await file.text();
      }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "text/xml");

      const parseErrors = xmlDoc.getElementsByTagName("parsererror");
      if (parseErrors.length > 0) {
        throw new Error("El archivo no tiene un formato XML/KML válido.");
      }

      const placemarks = Array.from(xmlDoc.getElementsByTagName("Placemark"));
      const extractedPolygons = [];
      let detectedCapa = "capa1";

      placemarks.forEach((pm, idx) => {
        const name = pm.getElementsByTagName("name")[0]?.textContent?.trim() || `Polígono ${idx + 1}`;
        const desc = pm.getElementsByTagName("description")[0]?.textContent?.trim() || "";

        const extendedData = {};
        const dataNodes = pm.getElementsByTagName("Data");
        for (let d = 0; d < dataNodes.length; d++) {
          const key = dataNodes[d].getAttribute("name");
          const val = dataNodes[d].getElementsByTagName("value")[0]?.textContent?.trim();
          if (key && val) extendedData[key.toLowerCase()] = val;
        }
        const simpleDataNodes = pm.getElementsByTagName("SimpleData");
        for (let s = 0; s < simpleDataNodes.length; s++) {
          const key = simpleDataNodes[s].getAttribute("name");
          const val = simpleDataNodes[s].textContent?.trim();
          if (key && val) extendedData[key.toLowerCase()] = val;
        }

        const parentFolder = pm.closest("Folder");
        const folderName = parentFolder?.getElementsByTagName("name")[0]?.textContent?.toLowerCase() || "";
        const lowerName = name.toLowerCase();

        if (lowerName.includes("sector") || lowerName.includes("comunidad") || folderName.includes("sector") || folderName.includes("comunidad") || extendedData.capa === "capa_2" || extendedData.capa === "capa2") {
          detectedCapa = "capa2";
        } else if (lowerName.includes("eje") || lowerName.includes("sub-parroquia") || lowerName.includes("subparroquia") || folderName.includes("eje") || extendedData.capa === "capa_1" || extendedData.capa === "capa1") {
          detectedCapa = "capa1";
        }

        // Fallback: extraer datos de description si viene en texto o tabla HTML
        const extractDesc = (regex) => {
          const m = desc.match(regex);
          return m ? m[1].trim() : null;
        };
        const descCasas = extractDesc(/(?:casas?|viviendas?)\s*[:=]\s*(\d+)/i) || extractDesc(/<td>\s*(?:casas?|viviendas?)\s*<\/td>\s*<td>\s*(\d+)\s*<\/td>/i);
        const descFamilias = extractDesc(/(?:familias?)\s*[:=]\s*(\d+)/i) || extractDesc(/<td>\s*(?:familias?)\s*<\/td>\s*<td>\s*(\d+)\s*<\/td>/i);
        const descMilitantes = extractDesc(/(?:militantes?|habitantes?|personas?|electores?)\s*[:=]\s*(\d+)/i) || extractDesc(/<td>\s*(?:militantes?|habitantes?)\s*<\/td>\s*<td>\s*(\d+)\s*<\/td>/i);
        const descLider = extractDesc(/(?:l[ií]der|responsable|contacto)\s*[:=]\s*([^,\n<]+)/i) || extractDesc(/<td>\s*(?:l[ií]der|responsable)\s*<\/td>\s*<td>\s*([^<]+)\s*<\/td>/i);
        const descTelefono = extractDesc(/(?:tel[eé]fono|celular|tlf|m[oó]vil)\s*[:=]\s*([\d\-\s\+]+)/i) || extractDesc(/<td>\s*(?:tel[eé]fono|celular)\s*<\/td>\s*<td>\s*([^<]+)\s*<\/td>/i);

        const polyNodes = Array.from(pm.getElementsByTagName("Polygon"));
        polyNodes.forEach(polyNode => {
          const coordsText = polyNode.getElementsByTagName("coordinates")[0]?.textContent || "";
          const vertices = this.parseCoords(coordsText);
          if (vertices.length >= 3) {
            const areaHa = this.toolsManager ? this.toolsManager.calculatePolygonAreaHa(vertices) : 0;
            const perimetroM = this.toolsManager ? this.toolsManager.calculatePerimeterMeters(vertices) : 0;

            extractedPolygons.push({
              name,
              description: desc,
              vertices,
              areaHa,
              perimetroM,
              checked: true,
              casas: parseInt(extendedData.casas || extendedData.viviendas || descCasas || "0", 10) || 0,
              familias: parseInt(extendedData.familias || descFamilias || "0", 10) || 0,
              militantes: parseInt(extendedData.militantes || extendedData.habitantes || descMilitantes || "0", 10) || 0,
              lider: extendedData.lider || extendedData.responsable || descLider || "",
              telefono: extendedData.telefono || extendedData.celular || descTelefono || "",
              eje: extendedData.eje || extendedData.subparroquia || ""
            });
          }
        });
      });

      if (extractedPolygons.length === 0) {
        alert("⚠️ No se encontraron polígonos cerrados en el archivo KML. Asegúrate de que los elementos contengan polígonos trazados en Google Earth.");
        return;
      }

      this.openKmlImportModal(file.name, extractedPolygons, detectedCapa);
    } catch (err) {
      console.error("[KML Import Error]", err);
      alert("Error leyendo archivo de Google Earth: " + err.message);
    }
  }

  openKmlImportModal(fileName, polygons, suggestedLayer = "capa1") {
    const modal = document.getElementById("modal-kml-import");
    if (!modal) return;

    this.pendingKmlImport = {
      fileName,
      polygons,
      selectedLayer: suggestedLayer,
      targetMunId: this.selectedMunId,
      targetParishId: this.selectedParishId
    };

    const labelFileName = document.getElementById("kml-modal-filename");
    const badgeCount = document.getElementById("kml-badge-count");
    if (labelFileName) labelFileName.textContent = fileName;
    if (badgeCount) badgeCount.textContent = `${polygons.length} polígonos`;

    const selectParish = document.getElementById("kml-select-parish");
    if (selectParish) {
      const allParishes = getAllParishesForSelector();
      selectParish.innerHTML = allParishes.map(p => {
        const val = `${p.munId}/${p.id}`;
        const isSel = (p.munId === this.selectedMunId && p.id === this.selectedParishId);
        return `<option value="${val}" ${isSel ? "selected" : ""}>${p.nombre} (${p.munNombre})</option>`;
      }).join("");
    }

    const cardCapa1 = document.getElementById("card-capa-1");
    const cardCapa2 = document.getElementById("card-capa-2");
    const radioCapa1 = document.getElementById("radio-layer-capa1");
    const radioCapa2 = document.getElementById("radio-layer-capa2");
    const boxEje = document.getElementById("kml-box-eje-link");

    if (suggestedLayer === "capa1") {
      if (radioCapa1) radioCapa1.checked = true;
      if (radioCapa2) radioCapa2.checked = false;
      if (cardCapa1) cardCapa1.className = "kml-layer-card cursor-pointer p-3.5 rounded-xl border-2 transition relative flex flex-col justify-between border-purple-500 bg-purple-950/40 shadow-[0_0_15px_rgba(168,85,247,0.25)]";
      if (cardCapa2) cardCapa2.className = "kml-layer-card cursor-pointer p-3.5 rounded-xl border-2 transition relative flex flex-col justify-between border-slate-700 bg-slate-800/40 hover:border-slate-600 opacity-60 hover:opacity-100";
      if (boxEje) boxEje.classList.add("hidden");
    } else {
      if (radioCapa2) radioCapa2.checked = true;
      if (radioCapa1) radioCapa1.checked = false;
      if (cardCapa2) cardCapa2.className = "kml-layer-card cursor-pointer p-3.5 rounded-xl border-2 transition relative flex flex-col justify-between border-sky-500 bg-sky-950/40 shadow-[0_0_15px_rgba(56,189,248,0.25)]";
      if (cardCapa1) cardCapa1.className = "kml-layer-card cursor-pointer p-3.5 rounded-xl border-2 transition relative flex flex-col justify-between border-slate-700 bg-slate-800/40 hover:border-slate-600 opacity-60 hover:opacity-100";
      if (boxEje) boxEje.classList.remove("hidden");
      this.updateKmlEjeOptions();
    }

    this.renderKmlItemsList();
    this.updateKmlImportModalUI();

    modal.style.display = "flex";
    modal.classList.remove("hidden");
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  async executeKmlImport() {
    if (!this.pendingKmlImport) return;

    const { targetMunId, targetParishId, selectedLayer, polygons } = this.pendingKmlImport;
    const selectedPolys = polygons.filter(p => p.checked);

    if (selectedPolys.length === 0) {
      alert("⚠️ Selecciona al menos un polígono para importar.");
      return;
    }

    const selectEje = document.getElementById("kml-select-eje");
    const parentEjeId = selectEje ? selectEje.value : "";

    const btnConfirm = document.getElementById("btn-confirm-kml-import");
    if (btnConfirm) {
      btnConfirm.disabled = true;
      btnConfirm.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Guardando en la nube...`;
    }

    try {
      const now = Date.now();
      const itemsToSave = [];

      if (selectedLayer === "capa1") {
        selectedPolys.forEach((p, idx) => {
          itemsToSave.push({
            id: `sub-${targetMunId}-${targetParishId}-${now}-${idx}`,
            parroquiaId: targetParishId,
            nombre: p.name,
            alias: p.name,
            vertices: p.vertices,
            colorBorde: "#c084fc",
            anchoBorde: 2.5,
            colorRelleno: "#a855f7",
            opacidad: 0.15,
            areaHa: p.areaHa || 0,
            perimetroM: p.perimetroM || 0,
            visible: true,
            fecha: new Date().toISOString()
          });
        });

        await this.store.addBatchItemsToParish(targetMunId, targetParishId, "subparroquias", itemsToSave);
      } else {
        selectedPolys.forEach((p, idx) => {
          itemsToSave.push({
            id: `sec-${targetMunId}-${targetParishId}-${now}-${idx}`,
            subParroquiaId: parentEjeId || p.eje || "",
            ejeId: parentEjeId || p.eje || "",
            nombre: p.name,
            vertices: p.vertices,
            colorBorde: "#38bdf8",
            anchoBorde: 2,
            colorRelleno: "#38bdf8",
            opacidad: 0.35,
            areaHa: p.areaHa || 0,
            perimetroM: p.perimetroM || 0,
            militantes: p.militantes || 0,
            casas: p.casas || 0,
            familias: p.familias || 0,
            lider: p.lider || "",
            telefono: p.telefono || "",
            visible: true,
            fecha: new Date().toISOString()
          });
        });

        await this.store.addBatchItemsToParish(targetMunId, targetParishId, "poligonos", itemsToSave);
      }

      if (this.selectedMunId !== targetMunId || this.selectedParishId !== targetParishId) {
        this.selectParish(targetMunId, targetParishId, false);
      } else {
        const parish = this.store.getParish(targetMunId, targetParishId);
        this.mapEngine.renderParishItems(parish, (t, it) => this.handleMapItemSelection(t, it));
        this.renderPlacesTree();
      }

      const allVerts = itemsToSave.flatMap(it => it.vertices);
      if (allVerts.length > 0 && this.mapEngine?.map) {
        try {
          this.mapEngine.map.fitBounds(L.latLngBounds(allVerts), { padding: [50, 50], maxZoom: 16 });
        } catch(e) {}
      }

      const parish = this.store.getParish(targetMunId, targetParishId);
      const parishName = parish ? parish.nombre : targetParishId;
      const layerName = selectedLayer === "capa1" ? "Capa 1 (Ejes Comunales)" : "Capa 2 (Sectores Comunales)";

      const modal = document.getElementById("modal-kml-import");
      if (modal) {
        modal.style.display = "none";
        modal.classList.add("hidden");
      }
      this.pendingKmlImport = null;

      alert(`✅ Google Earth: Se importaron ${itemsToSave.length} polígonos exitosamente en ${layerName} de ${parishName} y se sincronizaron con Google Cloud Firestore.`);
    } catch (err) {
      console.error("[KML Execution Error]", err);
      alert("Error al importar polígonos: " + err.message);
    } finally {
      if (btnConfirm) {
        btnConfirm.disabled = false;
        btnConfirm.innerHTML = `<i data-lucide="cloud-upload" class="w-4 h-4"></i> <span id="btn-confirm-kml-label">Importar Polígonos a la Nube</span>`;
        if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
      }
    }
  }

  parseCoords(str) {
    if (!str || typeof str !== "string") return [];
    return str.trim().split(/\s+/).map(pt => {
      const parts = pt.split(",");
      if (parts.length >= 2) {
        const lng = parseFloat(parts[0]);
        const lat = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          return [lat, lng];
        }
      }
      return null;
    }).filter(p => p !== null);
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

  async forceSyncCloud() {
    const dot = document.getElementById("cloud-sync-dot");
    const text = document.getElementById("cloud-sync-text");
    if (dot) dot.className = "w-2 h-2 rounded-full bg-amber-400 animate-spin shrink-0";
    if (text) text.textContent = "Sincronizando...";

    // 1. Descargar primero para recibir datos frescos de la nube
    await this.store.syncFromCloud();
    // 2. Re-renderizar mapa inmediatamente con los datos frescos
    this.selectParish(this.selectedMunId, this.selectedParishId, false);
    this.renderQuickParishBar();
    this.renderPlacesTree();
    this.updateMilitanciaTally();

    if (dot) dot.className = "w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0";
    if (text) text.textContent = "En Red";

    this.showToast("☁️ Datos frescos sincronizados al 100% desde Google Cloud.", "sky");
  }

  openFirebaseConfigModal() {
    const modal = document.getElementById("modal-firebase-config");
    if (!modal) return;

    const statusTitle = document.getElementById("firebase-modal-status-title");
    const statusDesc = document.getElementById("firebase-modal-status-desc");
    const dot = document.getElementById("firebase-modal-dot");
    const inputProj = document.getElementById("firebase-input-projectid");
    const inputKey = document.getElementById("firebase-input-apikey");

    const cfg = getSavedFirebaseConfig();
    const isConfigured = isFirebaseConfigured();

    if (isConfigured) {
      if (statusTitle) statusTitle.textContent = "🔥 Conectado a Firebase Firestore";
      if (statusDesc) statusDesc.textContent = `Proyecto: ${cfg.projectId} • Sincronización en vivo activa`;
      if (dot) dot.className = "w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse";
      if (inputProj) inputProj.value = cfg.projectId || "";
      if (inputKey) inputKey.value = cfg.apiKey ? `${cfg.apiKey.substring(0, 8)}...` : "";
    } else {
      if (statusTitle) statusTitle.textContent = "⚙️ Firebase pendiente por conectar";
      if (statusDesc) statusDesc.textContent = "Pega tus credenciales abajo para activar la sincronización instantánea";
      if (dot) dot.className = "w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse";
    }

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    if (window.lucide) { try { window.lucide.createIcons(); } catch(e){} }
  }

  closeFirebaseConfigModal() {
    const modal = document.getElementById("modal-firebase-config");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  }

  saveFirebaseConfigFromUI() {
    const inputJson = document.getElementById("firebase-input-json");
    const inputProj = document.getElementById("firebase-input-projectid");
    const inputKey = document.getElementById("firebase-input-apikey");

    let config = null;

    // 1. Intentar leer JSON completo si se pegó
    if (inputJson && inputJson.value.trim()) {
      try {
        const raw = inputJson.value.trim();
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          config = new Function(`return ${jsonMatch[0]};`)();
        }
      } catch (e) {
        alert("El texto pegado en JSON no es válido. Verifica el formato.");
        return;
      }
    }

    // 2. Fallback a campos individuales
    if (!config && inputProj && inputProj.value.trim() && inputKey && inputKey.value.trim()) {
      config = {
        projectId: inputProj.value.trim(),
        apiKey: inputKey.value.trim()
      };
    }

    if (!config || !config.projectId || !config.apiKey) {
      alert("Por favor ingresa al menos el Project ID y el API Key de tu proyecto Firebase.");
      return;
    }

    const ok = saveFirebaseConfig(config);
    if (ok) {
      this.closeFirebaseConfigModal();
      this.showToast(`🔥 Conectado a Firebase: <strong>${config.projectId}</strong> en tiempo real`, "emerald");
      this.store.syncFromCloud();
    } else {
      console.warn("No se pudo conectar a Firebase.");
    }
  }

  onCloudDataMerged() {
    if (this.mapEngine && typeof this.mapEngine.renderParishItems === "function") {
      const parish = (this.selectedMunId && this.selectedParishId) ? this.store?.getParish(this.selectedMunId, this.selectedParishId) : null;
      this.mapEngine.renderParishItems(parish, (type, item) => {
        this.handleMapItemSelection(type, item);
      });
    }
    this.renderPlacesTree();
    this.updateMilitanciaTally();
    this.renderQuickParishBar();
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
