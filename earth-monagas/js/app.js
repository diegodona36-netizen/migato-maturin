/**
 * Controlador Principal — Google Earth Pro Web (Edición Estado Monagas)
 * Robusto, 100% Operativo y Totalmente Individualizado
 */
import { CATALOGO_MONAGAS, findParishInCatalog } from "./catalogoMonagas.js?v=131";
import { AuthManager, forceCleanCacheAndReload } from "./authManager.js?v=131";
import { getAllParishesForSelector } from "./usersCatalog.js?v=131";
import { EarthStore } from "./earthStore.js?v=131";
import { EarthMapEngine } from "./mapEngine.js?v=131";
import { PropertiesDialog } from "./propertiesDialog.js?v=131";
import { ToolsManager } from "./toolsManager.js?v=131";
import { detectParishFromGeometry, SECTORES_LAPUENTE, SUBPARROQUIAS_GODOS } from "./geoMonagas.js?v=131";
import { GEO_PARROQUIAS_OFICIAL } from "./geoOficialMonagas.js?v=131";
import { getParishDemographics } from "./monagasDemographics.js?v=131";
import { 
  getMunicipios, 
  getParroquiasByMun, 
  getEjesByParish, 
  getSectoresByEje, 
  getSectoresByParish, 
  findSectorById, 
  searchSectores, 
  ALL_SECTORES_FLAT 
} from "./monagasSectoresCatalog.js?v=128";
import { 
  getSavedFirebaseConfig, 
  saveFirebaseConfig, 
  isFirebaseConfigured, 
  initFirebase 
} from "./firebaseConfig.js?v=128";

// Controladores globales infalibles accesibles en cualquier contexto
window.closeParishSelectorModal = function() {
  const modal = document.getElementById("modal-select-parish");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    modal.style.setProperty("display", "none", "important");
  }
};

window.selectParishGlobal = function(munId, parishId) {
  window.closeParishSelectorModal();
  if (window.earthApp && typeof window.earthApp.selectParish === "function") {
    window.earthApp.selectParish(munId, parishId, true);
  }
};

window.selectSectorGlobal = function(munId, parishId, sectorId) {
  if (window.earthApp && typeof window.earthApp.selectSectorFromModal === "function") {
    window.earthApp.selectSectorFromModal(munId, parishId, sectorId);
  }
};

window.selectSubParishGlobal = function(munId, parishId, spId) {
  if (window.earthApp && typeof window.earthApp.selectSubParishFromModal === "function") {
    window.earthApp.selectSubParishFromModal(munId, parishId, spId);
  }
};

window.setTerritoryModalFilterGlobal = function(munId) {
  if (window.earthApp && typeof window.earthApp.setTerritoryModalFilter === "function") {
    window.earthApp.setTerritoryModalFilter(munId);
  }
};

window.setTerritoryModalViewModeGlobal = function(mode) {
  if (window.earthApp) {
    window.earthApp.catalogViewMode = mode;
    const input = document.getElementById("input-filter-parish-modal");
    window.earthApp.renderParishesCatalog(input ? input.value : "");
  }
};

window.setTerritoryModalMunGlobal = function(munId) {
  if (window.earthApp && typeof window.earthApp.setModalMun === "function") {
    window.earthApp.setModalMun(munId);
  }
};

window.setTerritoryModalParishGlobal = function(parishId) {
  if (window.earthApp && typeof window.earthApp.setModalParish === "function") {
    window.earthApp.setModalParish(parishId);
  }
};

window.openParishSelectorGlobal = function() {
  const modal = document.getElementById("modal-select-parish");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    modal.style.setProperty("display", "flex", "important");
  }
  if (window.earthApp && typeof window.earthApp.openParishSelector === "function") {
    try {
      window.earthApp.openParishSelector();
    } catch(e) {
      console.warn("openParishSelectorGlobal warning:", e);
    }
  }
};

class EarthMonagasApp {
  constructor() {
    window.earthApp = this;
    window.earthApp.openParishSelector = () => this.openParishSelector();
    window.earthApp.closeParishSelector = () => window.closeParishSelectorModal();
    window.earthApp.selectParishFromModal = (m, p) => window.selectParishGlobal(m, p);
    window.earthApp.resetEarthFullData = () => window.resetEarthFullData ? window.resetEarthFullData() : forceCleanCacheAndReload();
    this.store = null;
    this.mapEngine = null;
    this.propDialog = null;
    this.toolsManager = null;
    this.authManager = new AuthManager();

    this.selectedMunId = "maturin";
    this.selectedParishId = "san-simon";
    this.activeSubParroquiaId = null;
    this.activeSectorId = null;
    this.catalogViewMode = "table";
    window.earthApp = this;
    window.toggleSpotlight = (enabled = null) => window.earthApp?.toggleSpotlight(enabled);
    window.closeQuickStats = () => window.earthApp?.closeQuickStats();
    window.clearSubParishFocus = () => window.earthApp?.clearSubParishFocus();
    window.clearSectorFocus = (toSub = true) => window.earthApp?.clearSectorFocus(toSub);
    window.focusMunicipio = (m, fly = true) => window.earthApp?.focusMunicipio(m, fly);
    window.focusEstado = (fly = true) => window.earthApp?.focusEstado(fly);

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

    // Leer parámetro URL para individualización (?p=caicara o ?p=alto-de-los-godos)
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

    window.earthApp.toggleBaseMapType = () => {
      const label = this.mapEngine.toggleBaseMapType();
      const lbl = document.getElementById("text-toggle-basemap");
      if (lbl) lbl.textContent = label;
      this.showToast(`🗺️ Capa base cambiada a: <strong>${label}</strong>`, "sky");
    };

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
      const recent = this.store.getMostRecentlyUpdatedParish();
      let targetMun = paramMun || this.selectedMunId;
      let targetParish = paramParish || this.selectedParishId;
      if (!paramParish && !localStorage.getItem("migato_last_parish") && recent && recent.parishId) {
        targetMun = recent.munId;
        targetParish = recent.parishId;
      }

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

    window.activateEarthTool = (toolName) => {
      this.closeQuickStats();
      // Regla de Oro Territorial: "Primero el Pote (Sub-Parroquia), luego el Agua (Sector Vecinal)"
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

    this.updateTerritorialFocusUI();

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
      this.activeSectorId = null;
      if (this.mapEngine) {
        this.mapEngine.activeFocusLevel = "parroquia";
      }

      // Navegación territorial abierta para todos los funcionarios y usuarios
      if (window.history && window.history.replaceState) {
        try {
          const u = new URL(window.location.href);
          u.searchParams.set("p", parishId);
          window.history.replaceState({}, "", u.toString());
        } catch(e) {}
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
          parishId = "alto-de-los-godos";
          parish = this.store.getParish("maturin", "alto-de-los-godos");
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
      document.title = `${parish.nombre} (${munObj ? munObj.nombre : 'Monagas'}) • MIGATO`;

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
      
      // Sincronizar enlace directo al formulario de carga para la parroquia seleccionada
      const quickCargaBtn = document.getElementById("btn-quick-form-carga");
      if (quickCargaBtn) {
        quickCargaBtn.href = `../carga/?p=${parishId}`;
      }
      const menuCargaLink = document.getElementById("menu-link-carga");
      if (menuCargaLink) {
        menuCargaLink.href = `../carga/?p=${parishId}`;
      }

      if (this.mapEngine) {
        this.updateSpotlightButtonUI(this.mapEngine.spotlightEnabled);
      }
      this.updateTerritorialFocusUI();

      // En pantallas móviles (< 768px), replegar el panel para ver el mapa
      if (window.innerWidth < 768) {
        const sidebar = document.getElementById("earth-sidebar");
        const backdrop = document.getElementById("sidebar-backdrop");
        if (sidebar) {
          sidebar.classList.add("hidden");
          sidebar.classList.remove("flex");
          sidebar.style.display = "none";
        }
        if (backdrop) {
          backdrop.classList.add("hidden");
          backdrop.style.display = "none";
        }
      } else {
        // En escritorio (>= 768px): Desplegar automáticamente el Panel de Lugares y Territorio
        this.userExplicitlyCollapsedSidebar = false;
        if (typeof this.toggleSidebar === "function") {
          this.toggleSidebar(true);
        } else {
          const sidebar = document.getElementById("earth-sidebar");
          const expandBtn = document.getElementById("btn-desktop-expand-sidebar");
          if (sidebar) {
            sidebar.classList.remove("hidden");
            sidebar.classList.add("flex");
            sidebar.style.display = "flex";
          }
          if (expandBtn) {
            expandBtn.style.display = "none";
            expandBtn.classList.add("hidden");
          }
        }
      }

      // Mostrar de inmediato la Ficha Flotante de Variables y Censo de la Parroquia
      this.showQuickStats("parroquia", parish);

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
    let polyMilitantes = 0;
    let polyCasas = 0;
    polys.forEach(p => {
      polyMilitantes += parseInt(p.militantes !== undefined ? p.militantes : (p.habitantes || 0)) || 0;
      polyCasas += parseInt(p.casas || 0) || 0;
    });

    let subMilitantes = 0;
    let subCasas = 0;
    (parish.subparroquias || []).forEach(sp => {
      subMilitantes += parseInt(sp.militantes !== undefined ? sp.militantes : (sp.habitantes || 0)) || 0;
      subCasas += parseInt(sp.casas || 0) || 0;
    });

    if (polyMilitantes > 0 || polyCasas > 0) {
      totalMilitantes = polyMilitantes;
      totalCasas = polyCasas;
    } else if (subMilitantes > 0 || subCasas > 0) {
      totalMilitantes = subMilitantes;
      totalCasas = subCasas;
    } else if (parish.electores || parish.poblacion) {
      totalMilitantes = parseInt(parish.electores || parish.poblacion || 0);
      totalCasas = Math.round(totalMilitantes / 3.8);
    }

    // Respaldo de variables oficiales de censo y CNE si la sumatoria de polígonos dio 0
    if (totalMilitantes === 0 && totalCasas === 0) {
      const demo = getParishDemographics(this.selectedMunId, this.selectedParishId);
      if (demo) {
        totalMilitantes = demo.votantes || demo.habitantes || 1000;
        totalCasas = demo.casas || Math.round(totalMilitantes / 3.8);
      }
    }

    const elMil = document.getElementById("tally-militantes-val");
    const elCas = document.getElementById("tally-casas-val");
    if (elMil) elMil.textContent = totalMilitantes.toLocaleString();
    if (elCas) elCas.textContent = totalCasas.toLocaleString();

    // Actualizar contadores vivos en la Barra Territorial (Sub-Parroquia y Sectores)
    const elEjes = document.getElementById("bar-tally-ejes");
    const elSecs = document.getElementById("bar-tally-sectores");
    if (elEjes) elEjes.textContent = (parish?.subparroquias || []).length;
    if (elSecs) elSecs.textContent = (parish?.poligonos || []).length;
  }

  updateDrawingBannerParishText() {
    const banner = document.getElementById("earth-drawing-banner");
    const bannerText = document.getElementById("earth-drawing-banner-text");
    if (banner && !banner.classList.contains("hidden") && this.toolsManager?.activeTool) {
      const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
      const parishName = parish ? parish.nombre : "";
      const toolName = this.toolsManager.activeTool;
      const parishSuffix = parishName ? ` (${parishName})` : "";
      if (toolName === "subparroquia") bannerText.textContent = `Trazando Sub-Parroquia / Eje Territorial${parishSuffix}`;
      else if (toolName === "poligono") bannerText.textContent = `Trazando Sector Vecinal / Militancia${parishSuffix}`;
      else if (toolName === "ruta") bannerText.textContent = `Trazando Ruta${parishSuffix}`;
      else if (toolName === "marca") bannerText.textContent = `Colocar Marca${parishSuffix}`;
    }
  }

  focusSubParish(subParishId, flyCamera = false) {
    const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
    if (!parish) return;
    const sp = (parish.subparroquias || []).find(s => String(s.id) === String(subParishId));
    if (!sp || !sp.vertices || sp.vertices.length < 3) return;

    this.activeSectorId = null;
    this.activeSubParroquiaId = String(subParishId);
    if (this.mapEngine) {
      if (this.mapEngine.spotlightEnabled) {
        this.mapEngine.showSubParishBoundary(sp.vertices, flyCamera);
      } else if (flyCamera) {
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
    this.updateTerritorialFocusUI();
    this.renderPlacesTree();
  }

  clearSubParishFocus() {
    this.activeSectorId = null;
    this.activeSubParroquiaId = null;
    this.closeQuickStats();
    const parish = this.store ? this.store.getParish(this.selectedMunId, this.selectedParishId) : null;
    if (parish) {
      if (this.mapEngine) {
        this.mapEngine.showParishBoundary(parish.limite, parish.id, true);
        if (parish.centro && (!this.mapEngine.activeFocusCoords || this.mapEngine.activeFocusCoords.length < 3)) {
          this.mapEngine.flyTo(parish.centro[0], parish.centro[1], parish.zoom || 14);
        }
        this.mapEngine.renderParishItems(parish, (type, item) => {
          this.handleMapItemSelection(type, item);
        });
      }
      this.showToast(`↩ Vista y velo restablecidos a toda la parroquia: <strong>${parish.nombre}</strong>`, "sky");
    }
    if (typeof this.mapEngine?.updateHierarchicalLOD === "function") {
      this.mapEngine.updateHierarchicalLOD();
    }
    this.updateTerritorialFocusUI();
    this.renderPlacesTree();
  }

  clearSectorFocus(toSubParish = true) {
    this.activeSectorId = null;
    this.closeQuickStats();

    const parish = this.store ? this.store.getParish(this.selectedMunId, this.selectedParishId) : null;
    if (!parish) return;

    if (toSubParish && this.activeSubParroquiaId) {
      const sp = (parish.subparroquias || []).find(s => String(s.id) === String(this.activeSubParroquiaId));
      if (sp && sp.vertices && sp.vertices.length >= 3) {
        this.focusSubParish(this.activeSubParroquiaId, false);
        this.showToast(`↩ Velo restablecido al Eje Territorial: <strong>${sp.nombre}</strong>`, "purple");
        this.updateTerritorialFocusUI();
        return;
      }
    }

    // Volver a toda la parroquia
    this.activeSubParroquiaId = null;
    if (this.mapEngine) {
      this.mapEngine.showParishBoundary(parish.limite, parish.id, false);
      this.mapEngine.renderParishItems(parish, (type, item) => {
        this.handleMapItemSelection(type, item);
      });
    }
    this.showToast(`↩ Velo restablecido a la Parroquia: <strong>${parish.nombre}</strong>`, "sky");
    this.updateTerritorialFocusUI();
    this.renderPlacesTree();
  }

  focusMunicipio(munId = null, flyCamera = true) {
    if (!munId) munId = this.selectedMunId || "maturin";
    this.selectedMunId = munId;
    this.activeSectorId = null;
    this.activeSubParroquiaId = null;
    this.closeQuickStats();

    if (this.mapEngine) {
      this.mapEngine.showMunicipioBoundary(munId, flyCamera);
    }

    const munObj = CATALOGO_MONAGAS.find(m => m.id === munId);
    const munNom = munObj ? munObj.nombre : munId;
    const parishCount = munObj?.parroquias?.length || 1;

    const navLoc = document.getElementById("nav-current-location");
    if (navLoc) {
      navLoc.textContent = `Municipio ${munNom} (${parishCount} Parroquias)`;
    }

    this.showToast(`🏛️ Enfocando Municipio <strong>${munNom}</strong> (${parishCount} Parroquias). Haz clic en cualquier parroquia para entrar.`, "sky");
    this.updateTerritorialFocusUI();
  }

  focusEstado(flyCamera = true) {
    this.activeSectorId = null;
    this.activeSubParroquiaId = null;
    this.closeQuickStats();

    if (this.mapEngine) {
      this.mapEngine.showStateBoundary(flyCamera);
    }

    const navLoc = document.getElementById("nav-current-location");
    if (navLoc) {
      navLoc.textContent = `Estado Monagas (13 Municipios)`;
    }

    this.showToast(`🗺️ Vista general del Estado Monagas (13 Municipios).`, "amber");
    this.updateTerritorialFocusUI();
  }

  updateTerritorialFocusUI() {
    const hud = document.getElementById("hud-territorial-focus");
    const hudContent = document.getElementById("hud-territorial-content");
    const btnReturnParish = document.getElementById("btn-return-parish");
    const parish = this.store ? this.store.getParish(this.selectedMunId, this.selectedParishId) : null;
    const munObj = CATALOGO_MONAGAS.find(m => m.id === this.selectedMunId);
    const munNom = munObj ? munObj.nombre : (this.selectedMunId || "Maturín");
    const parishCount = munObj?.parroquias?.length || 1;
    const focusLevel = this.mapEngine?.activeFocusLevel || (this.activeSectorId ? "sector" : (this.activeSubParroquiaId ? "subparroquia" : "parroquia"));

    // 1. Nivel Sector Vecinal (Solo cuando se selecciona un sector específico)
    if (this.activeSectorId && parish) {
      const sec = (parish.poligonos || []).find(p => String(p.id) === String(this.activeSectorId));
      const secName = sec?.nombre || "Sector Vecinal";
      let sp = null;
      if (sec?.subParroquiaId && parish.subparroquias) {
        sp = parish.subparroquias.find(s => String(s.id) === String(sec.subParroquiaId));
      }

      if (hud && hudContent) {
        hud.style.display = "block";
        hudContent.className = "flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#140e40]/95 border border-amber-500/70 shadow-2xl backdrop-blur-md text-xs";
        hudContent.innerHTML = `
          <span class="inline-flex items-center gap-1.5 font-bold text-amber-300">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 animate-pulse"></span>
            <span class="text-white font-extrabold max-w-[200px] truncate">${secName}</span>
          </span>
          <div class="h-3 w-px bg-amber-500/40"></div>
          ${sp ? `
            <button type="button" onclick="window.earthApp?.clearSectorFocus(true)"
              class="px-2 py-0.5 rounded-full bg-purple-900/80 hover:bg-purple-800 text-purple-100 font-bold text-[10px] flex items-center gap-1 border border-purple-400/50 transition active:scale-95 cursor-pointer"
              title="Volver al eje ${sp.nombre}">
              <span>↩ Eje: ${sp.nombre}</span>
            </button>
          ` : ''}
          <button type="button" onclick="window.earthApp?.clearSectorFocus(false)"
            class="px-2.5 py-0.5 rounded-full bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 hover:text-white font-bold text-[11px] flex items-center gap-1 border border-amber-500/40 transition active:scale-95 cursor-pointer"
            title="Volver a toda la parroquia ${parish.nombre}">
            <span>✕ Salir del Sector</span>
          </button>
        `;
      }
      return;
    }

    // 2. Nivel Sub-Parroquia / Eje Territorial (Solo cuando se selecciona un eje específico)
    if (this.activeSubParroquiaId && parish) {
      const sp = (parish.subparroquias || []).find(s => String(s.id) === String(this.activeSubParroquiaId));
      const spName = sp?.nombre || "Eje Territorial";

      if (hud && hudContent) {
        hud.style.display = "block";
        hudContent.className = "flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#140e40]/95 border border-purple-500/70 shadow-2xl backdrop-blur-md text-xs";
        hudContent.innerHTML = `
          <span class="inline-flex items-center gap-1.5 font-bold text-purple-300">
            <span class="w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0 animate-pulse"></span>
            <span class="text-white font-extrabold max-w-[200px] truncate">${spName}</span>
          </span>
          <div class="h-3 w-px bg-purple-500/40"></div>
          <button type="button" onclick="window.earthApp?.clearSubParishFocus()"
            class="px-2.5 py-0.5 rounded-full bg-purple-500/20 hover:bg-purple-500/40 text-purple-200 hover:text-white font-bold text-[11px] flex items-center gap-1 border border-purple-500/40 transition active:scale-95 cursor-pointer"
            title="Volver a toda la parroquia ${parish.nombre}">
            <span>✕ Salir del Eje</span>
          </button>
        `;
      }
      return;
    }

    // Para Parroquia, Municipio y Estado: El satélite debe permanecer 100% LIMPIO Y DESPEJADO
    if (hud) hud.style.display = "none";
    if (btnReturnParish) btnReturnParish.style.display = "none";
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
    this.showToast(`🎯 Trazando Sector Vecinal dentro de: <strong>${sp.nombre}</strong>`, "sky");
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
      modal.style.display = "none";
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
          Para organizar tus comunidades, cada <strong>Sector Vecinal (Nivel 5)</strong> debe pertenecer a una <strong>Sub-Parroquia o Eje Territorial (Nivel 4)</strong>.
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

    if (title) title.textContent = "Seleccionar Sub-Parroquia / Eje Territorial";

    body.innerHTML = `
      <p class="text-xs text-slate-300 leading-relaxed">
        Indica en cuál de las <strong>${subps.length} sub-parroquias</strong> de <strong>${parish?.nombre || 'la parroquia'}</strong> se ubicará este nuevo sector:
      </p>

      <div class="max-h-60 overflow-y-auto space-y-1.5 pr-1 font-mono">
        ${subps.map(sp => {
          const childSectors = (parish?.poligonos || []).filter(p => String(p.subParroquiaId) === String(sp.id));
          return `
            <div onclick="window.earthApp?.startSectorInSubParish('${sp.id}');" class="p-2.5 rounded-xl bg-[#140e40]/90 hover:bg-[#23176d]/80 border border-[#2d1f85] hover:border-purple-500/60 transition cursor-pointer flex items-center justify-between group">
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

      <div class="pt-2 border-t border-[#2d1f85] flex items-center justify-between gap-2">
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
    if (confirm("¿Deseas eliminar esta Sub-Parroquia / Eje Territorial?")) {
      this.store.deleteItem(this.selectedMunId, this.selectedParishId, "subparroquias", subParishId);
      if (this.activeSubParroquiaId === String(subParishId)) {
        this.clearSubParishFocus();
        return;
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
    this.expandedFolders = this.expandedFolders || new Set();
    const sid = String(subParishId);
    if (this.expandedFolders.has(sid)) {
      this.expandedFolders.delete(sid);
    } else {
      this.expandedFolders.add(sid);
    }
    this.renderPlacesTree();
  }

  toggleSpotlight(enabled = null) {
    if (this.mapEngine) {
      const isEnabled = this.mapEngine.toggleSpotlight(enabled);
      this.updateSpotlightButtonUI(isEnabled);
      return isEnabled;
    }
    return false;
  }

  updateSpotlightButtonUI(isEnabled) {
    const btn = document.getElementById("btn-toggle-spotlight");
    const txt = document.getElementById("text-toggle-spotlight");
    const icon = document.getElementById("icon-toggle-spotlight");
    if (btn && txt) {
      if (isEnabled) {
        btn.classList.add("bg-white", "text-slate-900", "border-white", "shadow-md");
        btn.classList.remove("bg-[#140e40]", "hover:bg-[#23176d]", "text-slate-200", "border-white/20");
        txt.textContent = "Velo Blanco: ON";
        if (icon) {
          icon.className = "w-3.5 h-3.5 text-amber-500 shrink-0";
          icon.setAttribute("data-lucide", "sun");
        }
        btn.title = "Velo blanco exterior ACTIVO (alrededores sombreados en blanco). Clic para quitar el velo y ver satélite 100% limpio.";
      } else {
        btn.classList.remove("bg-white", "text-slate-900", "border-white", "shadow-md");
        btn.classList.add("bg-[#140e40]", "hover:bg-[#23176d]", "text-slate-200", "border-white/20");
        txt.textContent = "Velo Blanco: OFF";
        if (icon) {
          icon.className = "w-3.5 h-3.5 text-slate-400 shrink-0";
          icon.setAttribute("data-lucide", "sun");
        }
        btn.title = "Velo blanco exterior DESACTIVADO (satélite limpio sin sombras). Clic para sombrear el exterior en blanco y enfocar la parroquia.";
      }
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    }
  }

  renderQuickParishBar() {
    // ELIMINADO DEFINITIVAMENTE: La vista satelital debe estar 100% limpia sin tickers ni carruseles inferiores
    const old = document.getElementById("earth-quick-parish-bar");
    if (old) old.remove();
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

    // Si hay un eje territorial seleccionado y no hay filtro de texto, filtrar polígonos por ese eje
    let displayPolys = allPolys;
    if (this.activeSubParroquiaId && !q) {
      displayPolys = allPolys.filter(p => String(p.subParroquiaId) === String(this.activeSubParroquiaId));
    } else if (q) {
      displayPolys = allPolys.filter(p => p.nombre.toLowerCase().includes(q));
    }

    const filteredRoutes = (pData.rutas || []).filter(r => !q || r.nombre.toLowerCase().includes(q));
    const filteredMarks = (pData.marcas || []).filter(m => !q || m.nombre.toLowerCase().includes(q));

    const currentUser = this.authManager.getCurrentUser();
    const isFieldOperator = currentUser && currentUser.rol === "operador";

    let html = "";

    html += `
      <!-- Tarjeta de Parroquia Activa con Resumen de Militancia (Interactiva para cambiar de Municipio / Parroquia) -->
      <div onclick="window.openParishSelectorGlobal ? window.openParishSelectorGlobal() : (window.earthApp && window.earthApp.openParishSelector ? window.earthApp.openParishSelector() : null)" class="bg-[#18114a] p-3 rounded-2xl border border-[#2d1f85] hover:border-sky-400/80 mb-3 shadow-xl cursor-pointer transition group" title="Clic aquí para cambiar de Municipio, Parroquia o Sector">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[10px] font-bold text-sky-400 uppercase tracking-wider">${munObj?.nombre || 'Municipio'}</span>
          ${this.authManager.canSwitchParish() ? `
          <button type="button" onclick="event.stopPropagation(); window.openParishSelectorGlobal ? window.openParishSelectorGlobal() : (window.earthApp && window.earthApp.openParishSelector ? window.earthApp.openParishSelector() : null)" class="text-[10px] text-amber-300 hover:text-white font-bold bg-amber-500/20 hover:bg-amber-500/35 px-2.5 py-1 rounded-lg border border-amber-500/50 active:scale-95 transition cursor-pointer flex items-center gap-1 shadow-sm">
            <span>Cambiar Municipio</span>
            <span>▾</span>
          </button>` : `
          <button type="button" onclick="event.stopPropagation(); window.earthApp.openSessionModal()" class="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-950/60 hover:bg-emerald-900/80 px-2 py-0.5 rounded-lg border border-emerald-800/40 flex items-center gap-1 active:scale-95 transition cursor-pointer" title="Parroquia Asignada. Clic para cambiar de parroquia">
            <i data-lucide="lock" class="w-2.5 h-2.5"></i>
            <span>Asignada ▾</span>
          </button>`}
        </div>
        <div class="flex items-center justify-between gap-2">
          <h4 class="text-sm font-black text-white group-hover:text-amber-300 transition truncate flex items-center gap-1.5">
            <span>${pData.nombre}</span>
          </h4>
          <span class="text-[10px] font-bold text-sky-300 group-hover:text-white bg-sky-500/20 px-2 py-0.5 rounded-lg border border-sky-400/40 shrink-0">Cambiar ▾</span>
        </div>

        <!-- Resumen Territorial Limpio (Capa 5 y Capa 4) -->
        <div class="grid grid-cols-2 gap-2 mt-2 font-mono">
          <div class="bg-[#0e092e] border border-[#2d1f85] p-1.5 rounded-xl text-center shadow-sm">
            <span class="text-[9px] text-sky-400 font-bold uppercase block mb-0.5">Sectores (Capa 5)</span>
            <span class="text-xs font-black text-sky-200">🔷 ${allPolys.length} Sectores</span>
          </div>
          <div class="bg-[#140e40] border border-[#2d1f85] p-1.5 rounded-xl text-center shadow-sm">
            <span class="text-[9px] text-indigo-300 font-bold uppercase block mb-0.5">Ejes (Capa 4)</span>
            <span class="text-xs font-black text-indigo-200">🟪 ${allSubparroquias.length} Ejes</span>
          </div>
        </div>

        <div class="flex items-center gap-1.5 mt-2 flex-wrap">
          <span class="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-300 bg-[#23176d]/30 px-2 py-0.5 rounded-lg border border-[#2d1f85]">
            <i data-lucide="shield" class="w-2.5 h-2.5"></i>
            <span>${allSubparroquias.length} ejes</span>
          </span>
          <span class="inline-flex items-center gap-1 text-[10px] font-bold text-sky-300 bg-[#140e40] px-2 py-0.5 rounded-lg border border-[#2d1f85]">
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
            <button onclick="window.earthApp.clearSubParishFocus()" class="text-[10px] text-purple-200 hover:text-white bg-purple-900/90 hover:bg-purple-800 px-2 py-1 rounded-lg border border-purple-400/50 transition font-bold flex items-center gap-1 cursor-pointer" title="Ver toda la parroquia">
              ↩ Ver Parroquia
            </button>
          </div>
        </div>
      `;
    }

    html += `
      <!-- SECCIÓN JERÁRQUICA: SUB-PARROQUIAS / EJES TERRITORIALES (NIVEL 4 Y 5) -->
      <div class="mb-3">
        <div class="flex items-center justify-between px-2.5 py-1.5 bg-[#100b33] rounded-xl border border-[#2d1f85] mb-1.5">
          <span class="flex items-center gap-1.5 text-xs font-black text-indigo-300 uppercase tracking-wide">
            <i data-lucide="folder-tree" class="w-4 h-4 text-indigo-400"></i>
            <span>Carpetas de Ejes Territoriales (${allSubparroquias.length})</span>
          </span>
          <span class="text-[10px] font-mono font-bold text-sky-300 bg-[#140e40] px-2 py-0.5 rounded-md border border-[#2d1f85]">Nivel 4 ➔ 5</span>
        </div>
        <div class="space-y-2 mt-1">
    `;

    if (allSubparroquias.length === 0) {
      html += `
        <div class="text-[11px] text-slate-400 px-3 py-3 italic bg-[#0e092e] rounded-xl border border-[#2d1f85] text-center space-y-2">
          <p>⚠️ No hay sub-parroquias / ejes territoriales creados aún en esta parroquia.</p>
          <p class="text-slate-400 text-[10px]">Crea primero el eje contenedor antes de registrar los sectores vecinales.</p>
          <button onclick="window.activateEarthTool('subparroquia')" class="px-3 py-1.5 bg-[#23176d] hover:bg-[#31228e] text-white rounded-xl font-black text-xs inline-flex items-center gap-1 shadow-lg border border-sky-400/50 transition active:scale-95 cursor-pointer">
            <i data-lucide="shield" class="w-3.5 h-3.5"></i>
            <span>+ Crear Primer Eje Territorial</span>
          </button>
        </div>
      `;
    } else {
      this.expandedFolders = this.expandedFolders || new Set();
      if (this.activeSubParroquiaId) {
        this.expandedFolders.add(String(this.activeSubParroquiaId));
      }

      allSubparroquias.forEach(sp => {
        const isSelected = String(sp.id) === String(this.activeSubParroquiaId);
        const secInSp = allPolys.filter(p => String(p.subParroquiaId) === String(sp.id));

        // Si hay búsqueda activa, evaluar si el eje o algún sector coincide
        const matchSp = !q || sp.nombre.toLowerCase().includes(q);
        const filteredSecInSp = secInSp.filter(p => !q || p.nombre.toLowerCase().includes(q));
        if (q && !matchSp && filteredSecInSp.length === 0) return;

        const displaySecs = q ? filteredSecInSp : secInSp;
        const isExpanded = q ? true : this.expandedFolders.has(String(sp.id));

        // Rollup vivo de estadísticas del eje sumando sus sectores hijos
        let totCasas = 0, totFam = 0, totHab = 0, totVot = 0;
        secInSp.forEach(p => {
          totCasas += parseInt(p.casas || 0) || 0;
          totFam += parseInt(p.familias || 0) || 0;
          totHab += parseInt(p.habitantes || 0) || 0;
          totVot += parseInt(p.militantes !== undefined ? p.militantes : (p.habitantes || 0)) || 0;
        });

        html += `
          <div class="bg-[#18114a] rounded-2xl border transition shadow-sm overflow-hidden ${isSelected ? 'border-sky-400 ring-1 ring-sky-400/40 bg-[#140e40]/90 shadow-lg' : 'border-[#2d1f85]'}">
            
            <!-- Cabecera de la Carpeta (Sub-Parroquia / Eje Territorial) -->
            <div class="p-2.5 flex items-center justify-between gap-1.5 hover:bg-[#140e40]/80 transition cursor-pointer" onclick="window.earthApp.toggleSubParishFolder('${sp.id}')">
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <button type="button" onclick="event.stopPropagation(); window.earthApp.toggleSubParishFolder('${sp.id}')" class="text-sky-400 hover:text-white p-0.5 text-xs font-mono transition cursor-pointer">
                  ${isExpanded ? '▼' : '▶'}
                </button>
                <input type="checkbox" ${sp.visible !== false ? 'checked' : ''} 
                  onclick="event.stopPropagation()"
                  onchange="window.earthApp.toggleSubParishWithChildrenVisibility('${sp.id}')"
                  class="w-4 h-4 rounded bg-[#140e40] border-[#2d1f85] text-indigo-500 focus:ring-0 cursor-pointer shrink-0" title="Mostrar u ocultar todo este eje con sus sectores">
                <span class="text-base shrink-0 select-none">${isExpanded ? '📂' : '📁'}</span>
                <div class="truncate min-w-0" onclick="event.stopPropagation(); window.earthApp.focusAndEdit('subparroquia', '${sp.id}', false)">
                  <span class="text-slate-100 font-black block truncate text-xs ${isSelected ? 'text-sky-300' : ''}">${sp.nombre}</span>
                  <div class="flex items-center gap-1.5 text-[10px] font-mono text-indigo-200 flex-wrap">
                    <span>🏠 ${totCasas}</span>
                    <span>• 👥 ${totHab}</span>
                    <span>• 🗳️ ${totVot}</span>
                    <span class="text-sky-300 font-bold">• 🔷 ${secInSp.length} sec</span>
                  </div>
                </div>
              </div>

              <!-- Acciones del Eje -->
              <div class="flex items-center gap-1 shrink-0" onclick="event.stopPropagation()">
                <button onclick="window.earthApp.startSectorInSubParish('${sp.id}')" class="text-sky-400 hover:text-sky-200 p-1 transition cursor-pointer" title="➕ Trazar Sector Vecinal dentro de este eje">
                  <i data-lucide="plus-circle" class="w-4 h-4"></i>
                </button>
                <button onclick="window.earthApp.openSubParishFicha('${sp.id}')" class="text-slate-400 hover:text-indigo-300 p-1 transition cursor-pointer" title="Ficha y Propiedades del Eje">
                  <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
                </button>
                <button onclick="window.earthApp.focusSubParish('${sp.id}', true)" class="text-indigo-400 hover:text-indigo-200 p-1 transition cursor-pointer" title="Enfocar en mapa">
                  <i data-lucide="crosshair" class="w-3.5 h-3.5"></i>
                </button>
                ${!isFieldOperator ? `
                <button onclick="window.earthApp.deleteSubParish('${sp.id}')" class="text-slate-500 hover:text-red-400 p-1 transition cursor-pointer" title="Eliminar eje">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
                ` : ''}
              </div>
            </div>

            <!-- Contenido de la Carpeta: Lista de Sectores Hijos Indentados -->
            ${isExpanded ? `
              <div class="pl-6 pr-2.5 pb-2.5 pt-1 space-y-1.5 border-t border-[#2d1f85]/60 bg-[#100b33]/90">
                ${displaySecs.length === 0 ? `
                  <div class="text-[11px] text-slate-400 italic py-2 px-2 bg-[#140e40]/40 rounded-xl border border-[#2d1f85]/40 text-center">
                    No hay sectores trazados aún dentro de este eje.
                    <br><button onclick="window.earthApp.startSectorInSubParish('${sp.id}')" class="text-sky-400 font-bold underline mt-1 inline-block">➕ Trazar el primer sector</button>
                  </div>
                ` : displaySecs.map(poly => {
                  const milCount = poly.militantes !== undefined ? poly.militantes : (poly.habitantes || 0);

                  return `
                    <div class="flex items-center justify-between py-1.5 px-2 bg-[#140e40]/90 hover:bg-[#23176d]/70 rounded-xl group text-xs border border-[#2d1f85]/60 transition shadow-sm">
                      <div class="flex items-center gap-2 truncate min-w-0">
                        <input type="checkbox" ${poly.visible !== false ? 'checked' : ''} 
                          onchange="window.earthApp.toggleItemVisibility('${this.selectedMunId}', '${this.selectedParishId}', 'poligono', '${poly.id}')"
                          class="w-3.5 h-3.5 rounded bg-[#0e092e] border-[#2d1f85] text-sky-500 focus:ring-0 cursor-pointer shrink-0">
                        <span class="w-3 h-3 rounded-sm border shrink-0" style="background-color: ${poly.colorRelleno || '#38bdf8'}; border-color: ${poly.colorBorde || '#ffffff'};"></span>
                        <div class="truncate cursor-pointer min-w-0" onclick="window.earthApp.focusAndEdit('poligono', '${poly.id}', false)">
                          <span class="text-slate-200 font-bold block truncate group-hover:text-sky-300 text-xs">${poly.nombre}</span>
                          <div class="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 flex-wrap">
                            ${poly.casas ? `<span class="text-amber-400 font-bold">🏠 ${poly.casas}</span>` : ''}
                            ${poly.familias ? `<span class="text-sky-300">👨‍👩‍👧 ${poly.familias}</span>` : ''}
                            <span class="text-emerald-400 font-bold">👥 ${poly.habitantes || milCount}</span>
                            ${poly.militantes !== undefined ? `<span class="text-indigo-300 font-bold">🗳️ ${poly.militantes}</span>` : ''}
                            ${poly.centroVotacion ? `<span class="text-slate-300 truncate max-w-[120px]" title="${poly.centroVotacion}">🏫 ${poly.centroVotacion}</span>` : ''}
                          </div>
                        </div>
                      </div>
                      <div class="flex items-center gap-1 shrink-0 ml-1">
                        <button onclick="window.earthApp.focusAndEdit('poligono', '${poly.id}', true)" class="text-slate-400 hover:text-sky-300 p-1 transition cursor-pointer" title="Editar caracterización socio-política">
                          <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
                        </button>
                        ${!isFieldOperator ? `
                        <button onclick="window.earthApp.deleteItem('${this.selectedMunId}', '${this.selectedParishId}', 'poligono', '${poly.id}')" class="text-slate-500 hover:text-red-400 p-1 transition cursor-pointer" title="Eliminar sector">
                          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                        </button>
                        ` : ''}
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
                <div class="flex items-center justify-between py-1.5 px-2 bg-[#140e40]/90 rounded-xl border border-amber-500/30 text-xs">
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
          <div class="text-[11px] text-slate-400 px-3 py-2.5 italic bg-[#0e092e]/60 rounded-xl border border-[#2d1f85]/40 text-center">
            No hay calles trazadas aún.
          </div>
        `;
      } else {
        filteredRoutes.forEach(r => {
          html += `
            <div class="flex items-center justify-between py-2 px-2.5 bg-[#140e40]/90 hover:bg-[#23176d]/70 rounded-xl group text-xs border border-[#2d1f85]/60 transition shadow-sm">
              <div class="flex items-center gap-2 truncate">
                <input type="checkbox" ${r.visible !== false ? 'checked' : ''} 
                  onchange="window.earthApp.toggleItemVisibility('${this.selectedMunId}', '${this.selectedParishId}', 'ruta', '${r.id}')"
                  class="w-4 h-4 rounded bg-[#0e092e] border-[#2d1f85] text-emerald-500 focus:ring-0 cursor-pointer">
                <span class="w-3.5 h-1 shrink-0 rounded" style="background-color: ${r.color || '#10b981'};"></span>
                <div class="truncate cursor-pointer" onclick="window.earthApp.focusAndEdit('ruta', '${r.id}')">
                  <span class="text-slate-200 font-bold block truncate group-hover:text-emerald-400">${r.nombre}</span>
                  <span class="text-[10px] text-slate-400 font-mono">${r.longitudM || 0} metros</span>
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
          <div class="text-[11px] text-slate-400 px-3 py-2 italic bg-[#0e092e]/60 rounded-xl border border-[#2d1f85]/40 text-center">
            No hay marcas aún.
          </div>
        `;
      } else {
        filteredMarks.forEach(m => {
          html += `
            <div class="flex items-center justify-between py-1.5 px-2.5 bg-[#140e40]/90 hover:bg-[#23176d]/70 rounded-xl group text-xs border border-[#2d1f85]/60 transition shadow-sm">
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
    const filterInput = document.getElementById("input-filter-parish-modal");

    if (btnOpen) {
      btnOpen.addEventListener("click", (e) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        this.openParishSelector();
      });
    }

    if (btnClose) {
      btnClose.addEventListener("click", (e) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        this.closeParishSelector();
      });
    }

    if (filterInput) {
      filterInput.addEventListener("input", (e) => {
        this.renderParishesCatalog(e.target.value);
      });
    }

    if (modal) {
      // Delegación de eventos infalible sobre el modal
      modal.addEventListener("click", (e) => {
        // 1. Clic en el backdrop exterior fuera de la tarjeta
        if (e.target === modal) {
          e.preventDefault();
          e.stopPropagation();
          this.closeParishSelector();
          return;
        }

        // 2. Clic en botón cerrar X
        if (e.target.closest("#btn-close-parish-modal, [data-action='close-parish-modal']")) {
          e.preventDefault();
          e.stopPropagation();
          this.closeParishSelector();
          return;
        }

        // 3. Clic en botón de seleccionar parroquia
        const parishBtn = e.target.closest("[data-action='select-parish']");
        if (parishBtn) {
          e.preventDefault();
          e.stopPropagation();
          const munId = parishBtn.dataset.munId;
          const parishId = parishBtn.dataset.parishId;
          if (munId && parishId) {
            this.closeParishSelector();
            this.selectParish(munId, parishId, true);
          }
          return;
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
    if (inputUser) inputUser.value = "";
    if (inputPass) inputPass.value = "";

    if (modalLogin) {
      modalLogin.classList.remove("hidden");
      modalLogin.classList.add("flex");
      modalLogin.style.setProperty("display", "flex", "important");
    }

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      try { window.lucide.createIcons(); } catch(e){}
    }
  }

  openParishSelector() {
    const modal = document.getElementById("modal-select-parish");
    if (!modal) return;

    // 1. Mostrar el modal INMEDIATAMENTE para garantizar respuesta instantánea al clic
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    modal.style.setProperty("display", "flex", "important");

    // 2. Mostrar TODOS los 13 municipios por defecto (sin filtrar prematuramente)
    this.modalMunFilter = "all";
    const filterInput = document.getElementById("input-filter-parish-modal");
    if (filterInput) filterInput.value = "";

    // 3. Renderizar catálogo oficial con protección total de errores
    try {
      this.renderParishesCatalog("");
    } catch(err) {
      console.error("Error al renderizar catálogo:", err);
    }

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      try { window.lucide.createIcons(); } catch(e){}
    }
    if (filterInput) {
      setTimeout(() => filterInput.focus(), 80);
    }
  }

  closeParishSelector() {
    window.closeParishSelectorModal();
  }

  setTerritoryModalFilter(munId) {
    this.modalMunFilter = munId;
    const filterInput = document.getElementById("input-filter-parish-modal");
    try {
      this.renderParishesCatalog(filterInput ? filterInput.value : "");
    } catch(e) {
      console.warn("Error en setTerritoryModalFilter:", e);
    }
  }

  setModalMun(munId) {
    this.setTerritoryModalFilter(munId);
  }

  setModalParish(parishId) {
    const munObj = CATALOGO_MONAGAS.find(m => m.parroquias.some(p => p.id === parishId));
    if (munObj) {
      this.modalMunFilter = munObj.id;
    }
    const filterInput = document.getElementById("input-filter-parish-modal");
    try {
      this.renderParishesCatalog(filterInput ? filterInput.value : "");
    } catch(e) {
      console.warn("Error en setModalParish:", e);
    }
  }

  getSectorsForParishCatalog(munId, parishId) {
    try {
      const parishData = this.store?.getParish(munId, parishId);
      return (parishData?.poligonos || []).slice();
    } catch(err) {
      console.warn("getSectorsForParishCatalog error:", munId, parishId, err);
      return [];
    }
  }

  renderParishesCatalog(filterText = "") {
    const catalog = document.getElementById("modal-parishes-catalog");
    if (!catalog) return;

    const q = (filterText || "").toLowerCase().trim();
    const activeFilter = this.modalMunFilter || "all";

    // 1. BARRA DE FILTRO POR MUNICIPIOS (PÍLDORAS DIRECTAS DE LOS 13 MUNICIPIOS + SWITCHER TABLA/TARJETAS)
    let pillsHtml = `
      <div class="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1 shrink-0 border-b border-[#2d1f85]/60 pb-2">
        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button type="button" onclick="window.setTerritoryModalFilterGlobal('all')"
            class="px-3 py-1.5 rounded-xl text-xs font-black transition shrink-0 cursor-pointer flex items-center gap-1.5 ${activeFilter === 'all' ? 'bg-amber-500 text-[#0e092e] shadow-md shadow-amber-500/20' : 'bg-[#140e40] text-slate-300 hover:text-white hover:bg-[#23176d] border border-[#2d1f85]'}">
            <span>⭐ Todos (13)</span>
          </button>
          ${CATALOGO_MONAGAS.map(m => {
            const isActive = activeFilter === m.id;
            return `
              <button type="button" onclick="window.setTerritoryModalFilterGlobal('${m.id}')"
                class="px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${isActive ? 'bg-sky-500 text-white font-black shadow-md border border-sky-300' : 'bg-[#140e40] text-slate-300 hover:text-white hover:bg-[#23176d] border border-[#2d1f85]'}">
                <span class="w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-slate-500'}"></span>
                <span>${m.nombre.replace(/^Municipio\s+/i, '')}</span>
                <span class="text-[10px] font-mono opacity-80 font-normal">(${m.parroquias.length})</span>
              </button>
            `;
          }).join("")}
        </div>

        <div class="flex items-center bg-[#0e092e] border border-[#2d1f85] rounded-xl p-0.5 shrink-0 ml-auto">
          <button type="button" onclick="window.setTerritoryModalViewModeGlobal('table')" title="Vista Tabla Oficial (Recomendada)"
            class="px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${this.catalogViewMode !== 'grid' ? 'bg-sky-500 text-white shadow-sm font-black' : 'text-slate-400 hover:text-white'}">
            <i data-lucide="table" class="w-3.5 h-3.5"></i>
            <span class="hidden sm:inline">Tabla</span>
          </button>
          <button type="button" onclick="window.setTerritoryModalViewModeGlobal('grid')" title="Vista Cuadrícula / Tarjetas"
            class="px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${this.catalogViewMode === 'grid' ? 'bg-sky-500 text-white shadow-sm font-black' : 'text-slate-400 hover:text-white'}">
            <i data-lucide="layout-grid" class="w-3.5 h-3.5"></i>
            <span class="hidden sm:inline">Tarjetas</span>
          </button>
        </div>
      </div>
    `;

    // 2. FILTRAR MUNICIPIOS SEGÚN PESTAÑA Y TEXTO DE BÚSQUEDA
    let targetMuns = CATALOGO_MONAGAS;
    if (activeFilter !== "all" && !q) {
      targetMuns = CATALOGO_MONAGAS.filter(m => m.id === activeFilter);
    }

    let munsHtml = "";

    targetMuns.forEach(mun => {
      const parishesList = mun.parroquias.filter(p => {
        if (!q) return true;
        const matchMun = mun.nombre.toLowerCase().includes(q);
        const matchParish = p.nombre.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
        const sectors = this.getSectorsForParishCatalog(mun.id, p.id);
        const matchSector = sectors.some(s => (s.nombre || "").toLowerCase().includes(q) || (s.centroVotacion || "").toLowerCase().includes(q));
        return matchMun || matchParish || matchSector;
      });

      if (parishesList.length === 0) return;

      munsHtml += `
        <div class="bg-[#18114a] border border-[#2d1f85] rounded-2xl p-3 sm:p-4 space-y-3 shadow-lg">
          <!-- Cabecera de Municipio -->
          <div class="flex items-center justify-between gap-2 border-b border-[#2d1f85]/80 pb-2.5">
            <div class="flex items-center gap-2 truncate min-w-0">
              <span class="text-base sm:text-lg">🏛️</span>
              <div>
                <h4 class="text-sm sm:text-base font-black text-amber-300 truncate">${mun.nombre}</h4>
                <span class="text-[10px] font-mono text-slate-400 font-bold">${mun.parroquias.length} Parroquias oficiales • Monagas</span>
              </div>
            </div>
            <button type="button" onclick="window.earthApp?.focusMunicipio('${mun.id}', true); window.earthApp?.closeParishSelector();"
              class="px-3 py-1.5 rounded-xl bg-sky-900/90 hover:bg-sky-800 text-sky-200 hover:text-white text-xs font-black border border-sky-400/50 transition shrink-0 cursor-pointer flex items-center gap-1 shadow-sm" title="Enfocar todo el Municipio ${mun.nombre} con velo blanco y ver todas sus parroquias">
              <i data-lucide="landmark" class="w-3.5 h-3.5 text-sky-400"></i>
              <span class="hidden sm:inline">Enfocar Municipio</span>
            </button>
          </div>

          <!-- Parroquias y Sectores -->
          <div class="space-y-3">
            ${parishesList.map(p => {
              const isCurrentParish = (this.selectedMunId === mun.id && this.selectedParishId === p.id);
              let sectors = this.getSectorsForParishCatalog(mun.id, p.id);
              
              if (q) {
                const matchParish = p.nombre.toLowerCase().includes(q) || mun.nombre.toLowerCase().includes(q);
                if (!matchParish) {
                  sectors = sectors.filter(s => (s.nombre || "").toLowerCase().includes(q) || (s.centroVotacion || "").toLowerCase().includes(q));
                }
              }

              let totalCasas = 0;
              let totalHabitantes = 0;
              let totalVotantes = 0;
              let mappedCount = 0;

              sectors.forEach(s => {
                if (s.casas) totalCasas += Number(s.casas) || 0;
                const hab = Number(s.habitantes || s.militantes) || 0;
                totalHabitantes += hab;
                const vot = Number(s.votantes || s.militantes) || 0;
                totalVotantes += vot;
                const hasCoords = (s.vertices && s.vertices.length > 0) || (s.poligono && s.poligono.length > 0);
                if (hasCoords) mappedCount++;
              });

              return `
                <div class="bg-[#140e40] rounded-xl border ${isCurrentParish ? 'border-sky-400 ring-1 ring-sky-400/40 shadow-lg shadow-sky-950/40' : 'border-[#2d1f85]'} p-3 space-y-2.5">
                  <!-- Cabecera de la Parroquia -->
                  <div class="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                    <div class="flex items-center gap-2 truncate min-w-0">
                      <span class="w-2.5 h-2.5 rounded-full ${isCurrentParish ? 'bg-emerald-400 animate-pulse' : 'bg-sky-400'} shrink-0"></span>
                      <span class="text-xs sm:text-sm font-black text-white truncate">${p.nombre}</span>
                      ${isCurrentParish ? `<span class="text-[9px] font-mono px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold shrink-0">● Parroquia Activa</span>` : ''}
                      <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-[#100b33] text-slate-300 border border-[#2d1f85] shrink-0 font-bold">${sectors.length} sectores</span>
                      ${totalCasas > 0 ? `<span class="hidden md:inline-flex text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/50 text-amber-300 border border-amber-500/30 font-bold">🏠 ${totalCasas.toLocaleString()} casas</span>` : ''}
                      ${totalHabitantes > 0 ? `<span class="hidden md:inline-flex text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 font-bold">👥 ${totalHabitantes.toLocaleString()} hab.</span>` : ''}
                    </div>

                    <div class="flex items-center gap-1.5 shrink-0 ml-auto">
                      <button type="button" onclick="window.selectParishGlobal('${mun.id}', '${p.id}')"
                        class="px-3 py-1.5 rounded-xl ${isCurrentParish ? 'bg-sky-500 text-white font-black shadow-md' : 'bg-sky-600/80 hover:bg-sky-500 text-sky-100 hover:text-white font-bold'} text-xs transition active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-sm">
                        <i data-lucide="crosshair" class="w-3.5 h-3.5"></i>
                        <span>Cargar Parroquia</span>
                      </button>
                      <a href="../carga/?p=${p.id}" target="_blank"
                        class="px-3 py-1.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-emerald-100 hover:text-white text-xs font-bold transition active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-sm border border-emerald-500/30" title="Abrir Formulario Oficial de Carga y Registro">
                        <i data-lucide="clipboard-list" class="w-3.5 h-3.5"></i>
                        <span class="font-bold">Carga</span>
                      </a>
                    </div>
                  </div>

                  <!-- Sectores de la Parroquia -->
                  ${sectors.length > 0 ? (
                    this.catalogViewMode === "grid" ? `
                      <!-- VISTA CUADRÍCULA (TARJETAS) -->
                      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 pt-1">
                        ${sectors.map(sec => {
                          const hasCoords = (sec.vertices && sec.vertices.length > 0) || (sec.poligono && sec.poligono.length > 0);
                          return `
                            <div onclick="window.selectSectorGlobal('${mun.id}', '${p.id}', '${sec.id}')"
                              class="p-2.5 rounded-xl bg-[#0e092e] hover:bg-[#18114a] border border-[#2d1f85]/80 hover:border-sky-400 text-left transition flex items-center justify-between gap-2 cursor-pointer group shadow-sm hover:shadow-sky-500/20">
                              <div class="truncate min-w-0 flex-1">
                                <div class="flex items-center gap-1.5 mb-0.5">
                                  <span class="w-2 h-2 rounded-full bg-sky-400 shrink-0 group-hover:scale-125 transition-transform" style="${sec.colorRelleno ? `background-color: ${sec.colorRelleno};` : ''}"></span>
                                  <span class="text-xs font-black text-white group-hover:text-sky-300 truncate">${sec.nombre}</span>
                                  ${hasCoords ? `<span class="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold shrink-0">Mapeado</span>` : ''}
                                </div>
                                <div class="flex items-center gap-2 text-[10px] font-mono text-slate-400 flex-wrap">
                                  ${sec.casas ? `<span class="text-amber-300 font-bold">🏠 ${Number(sec.casas).toLocaleString()}</span>` : ''}
                                  ${(sec.habitantes || sec.militantes) ? `<span class="text-emerald-300 font-bold">👥 ${Number(sec.habitantes || sec.militantes).toLocaleString()}</span>` : ''}
                                  ${sec.centroVotacion ? `<span class="text-slate-400 truncate max-w-[150px]" title="${sec.centroVotacion}">🏫 ${sec.centroVotacion}</span>` : ''}
                                </div>
                              </div>
                              <button type="button" class="px-2 py-1 rounded-lg bg-sky-500/20 group-hover:bg-sky-500 text-sky-300 group-hover:text-white font-black text-[11px] transition shrink-0 border border-sky-400/40 flex items-center gap-0.5">
                                <span>Ir</span>
                                <i data-lucide="chevron-right" class="w-3 h-3"></i>
                              </button>
                            </div>
                          `;
                        }).join("")}
                      </div>
                    ` : `
                      <!-- VISTA TABLA COMPLETA (PREDETERMINADA / OFICIAL) -->
                      <div class="overflow-x-auto rounded-xl border border-[#2d1f85]/80 bg-[#0e092e] shadow-inner mt-1">
                        <table class="w-full text-left border-collapse text-xs font-mono">
                          <thead>
                            <tr class="text-[10px] uppercase text-slate-400 bg-[#100b33] border-b border-[#2d1f85]/80">
                              <th class="py-2.5 px-3 text-center w-9 text-slate-500 font-semibold">#</th>
                              <th class="py-2.5 px-3 font-bold text-slate-200 min-w-[170px]">Sector Vecinal</th>
                              <th class="py-2.5 px-3 text-right font-bold text-amber-400 whitespace-nowrap">🏠 Casas</th>
                              <th class="py-2.5 px-3 text-right font-bold text-emerald-400 whitespace-nowrap">👥 Habitantes</th>
                              <th class="py-2.5 px-3 text-right font-bold text-purple-300 whitespace-nowrap">🗳️ Votantes</th>
                              <th class="py-2.5 px-3 font-bold text-slate-300 min-w-[190px]">🏫 Centro Electoral CNE</th>
                              <th class="py-2.5 px-3 text-center whitespace-nowrap">Estado</th>
                              <th class="py-2.5 px-3 text-center w-20 whitespace-nowrap">Acción</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-[#2d1f85]/60 text-slate-300">
                            ${sectors.map((sec, idx) => {
                              const hasCoords = (sec.vertices && sec.vertices.length > 0) || (sec.poligono && sec.poligono.length > 0);
                              const casasVal = sec.casas ? Number(sec.casas).toLocaleString() : '<span class="text-slate-600">-</span>';
                              const habVal = (sec.habitantes || sec.militantes) ? Number(sec.habitantes || sec.militantes).toLocaleString() : '<span class="text-slate-600">-</span>';
                              const votVal = (sec.votantes || sec.militantes) ? Number(sec.votantes || sec.militantes).toLocaleString() : '<span class="text-slate-600">-</span>';
                              const centro = sec.centroVotacion || '';
                              const colorDot = sec.colorRelleno || (hasCoords ? '#10b981' : '#38bdf8');

                              return `
                                <tr onclick="window.selectSectorGlobal('${mun.id}', '${p.id}', '${sec.id}')"
                                  class="hover:bg-[#23176d]/40 hover:text-white transition-colors cursor-pointer group">
                                  <td class="py-2 px-3 text-center text-slate-500 font-mono text-[11px]">${idx + 1}</td>
                                  <td class="py-2 px-3 font-sans font-bold text-white group-hover:text-sky-300 transition-colors">
                                    <div class="flex items-center gap-2 min-w-0">
                                      <span class="w-2.5 h-2.5 rounded-full shrink-0 group-hover:scale-125 transition-transform" style="background-color: ${colorDot}"></span>
                                      <span class="truncate" title="${sec.nombre}">${sec.nombre}</span>
                                    </div>
                                  </td>
                                  <td class="py-2 px-3 text-right font-mono text-amber-300 font-bold whitespace-nowrap">${casasVal}</td>
                                  <td class="py-2 px-3 text-right font-mono text-emerald-300 font-bold whitespace-nowrap">${habVal}</td>
                                  <td class="py-2 px-3 text-right font-mono text-purple-300 font-bold whitespace-nowrap">${votVal}</td>
                                  <td class="py-2 px-3 font-sans text-slate-300">
                                    ${centro ? `
                                      <div class="flex items-center gap-1.5 min-w-0" title="${centro}">
                                        <span class="shrink-0 text-slate-400">🏫</span>
                                        <span class="text-[11px] text-slate-300 group-hover:text-slate-100">${centro}</span>
                                      </div>
                                    ` : `
                                      <span class="text-slate-600 text-[11px] italic">Sin asignar</span>
                                    `}
                                  </td>
                                  <td class="py-2 px-3 text-center whitespace-nowrap">
                                    ${hasCoords ? `
                                      <span class="inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold">
                                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                        Mapeado
                                      </span>
                                    ` : `
                                      <span class="inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#140e40] text-slate-400 border border-[#2d1f85] font-medium">
                                        Por trazar
                                      </span>
                                    `}
                                  </td>
                                  <td class="py-2 px-3 text-center whitespace-nowrap" onclick="event.stopPropagation(); window.selectSectorGlobal('${mun.id}', '${p.id}', '${sec.id}');">
                                    <button type="button" class="px-2.5 py-1 rounded-lg bg-sky-500/20 group-hover:bg-sky-500 text-sky-300 group-hover:text-white font-bold text-[11px] transition shrink-0 border border-sky-400/40 flex items-center justify-center gap-1 w-full shadow-sm">
                                      <span>Ir</span>
                                      <i data-lucide="chevron-right" class="w-3 h-3"></i>
                                    </button>
                                  </td>
                                </tr>
                              `;
                            }).join("")}
                          </tbody>
                          <tfoot class="bg-[#100b33]/95 border-t border-[#2d1f85] font-mono text-[11px] text-slate-200">
                            <tr>
                              <td colspan="2" class="py-2 px-3 font-sans font-bold text-sky-300">
                                Total Parroquia (${sectors.length} sectores)
                              </td>
                              <td class="py-2 px-3 text-right text-amber-300 font-bold whitespace-nowrap">
                                ${totalCasas > 0 ? totalCasas.toLocaleString() : '-'}
                              </td>
                              <td class="py-2 px-3 text-right text-emerald-300 font-bold whitespace-nowrap">
                                ${totalHabitantes > 0 ? totalHabitantes.toLocaleString() : '-'}
                              </td>
                              <td class="py-2 px-3 text-right text-purple-300 font-bold whitespace-nowrap">
                                ${totalVotantes > 0 ? totalVotantes.toLocaleString() : '-'}
                              </td>
                              <td colspan="3" class="py-2 px-3 text-[10px] text-slate-400 font-sans italic text-right">
                                ${mappedCount} de ${sectors.length} sectores mapeados
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    `
                  ) : `
                    <div class="p-3 rounded-xl bg-[#0e092e]/80 border border-[#2d1f85]/60 flex items-center justify-between text-slate-300 text-xs">
                      <div class="flex items-center gap-2 min-w-0">
                        <span class="text-emerald-400 font-bold text-sm">✨</span>
                        <span class="text-slate-300 text-xs font-medium">Base de datos lista y limpia (0 sectores / polígonos). Lista para registrar polígonos reales.</span>
                      </div>
                      <button type="button" onclick="window.selectParishGlobal('${mun.id}', '${p.id}')"
                        class="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs cursor-pointer shrink-0 ml-2 shadow-sm transition">
                        Trazar en Satélite ➔
                      </button>
                    </div>
                  `}
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `;
    });

    if (!munsHtml) {
      munsHtml = `
        <div class="text-center py-10 bg-[#18114a] rounded-2xl border border-[#2d1f85] p-6 space-y-3">
          <p class="text-sm font-bold text-slate-300">No se encontraron resultados para "${filterText}".</p>
          <p class="text-xs text-slate-400">Intenta buscar por nombre de municipio (ej. Maturín, Caripe, Zamora), parroquia o sector.</p>
          <button type="button" onclick="window.setTerritoryModalFilterGlobal('all')"
            class="px-4 py-2 bg-[#140e40] hover:bg-[#23176d] text-sky-200 hover:text-white rounded-xl font-bold text-xs transition border border-[#2d1f85] cursor-pointer">
            Ver Todos los 13 Municipios
          </button>
        </div>
      `;
    }

    catalog.innerHTML = pillsHtml + munsHtml;

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      try { window.lucide.createIcons(); } catch(e){}
    }
  }

  selectSectorFromModal(munId, parishId, sectorId) {
    this.closeParishSelector();

    // 1. Si la parroquia seleccionada en el modal es distinta a la activa, cambiarla
    if (munId !== this.selectedMunId || parishId !== this.selectedParishId) {
      this.selectParish(munId, parishId, false);
    }

    // 2. Localizar el sector en la parroquia activa
    const parish = this.store?.getParish(this.selectedMunId, this.selectedParishId);
    let poly = (parish?.poligonos || []).find(p => String(p.id) === String(sectorId));

    if (!poly) {
      const anywhere = this.store?.findItemAnywhere("poligonos", sectorId);
      if (anywhere && anywhere.item) {
        if (anywhere.munId !== this.selectedMunId || anywhere.parishId !== this.selectedParishId) {
          this.selectParish(anywhere.munId, anywhere.parishId, false);
        }
        poly = anywhere.item;
      }
    }

    if (poly) {
      const coords = poly.vertices || poly.poligono;
      if (coords && coords.length > 0) {
        try {
          const bounds = L.polygon(coords).getBounds();
          if (bounds.isValid()) {
            this.mapEngine.map.flyToBounds(bounds, { padding: [60, 60], maxZoom: 17, duration: 1.2 });
          }
        } catch(e) {}
      } else if (poly.centro) {
        this.mapEngine.map.flyTo(poly.centro, 16, { duration: 1.2 });
      }

      if (this.mapEngine && poly.id) {
        this.mapEngine.highlightPolygon(poly.id);
      }

      this.showQuickStats("poligono", poly);
      this.showToast(`🎯 Sector enfocado: ${poly.nombre}`, "sky");
    }
  }

  selectSubParishFromModal(munId, parishId, spId) {
    this.closeParishSelector();
    if (munId !== this.selectedMunId || parishId !== this.selectedParishId) {
      this.selectParish(munId, parishId, false);
    }
    this.focusSubParish(spId, true);
    const parish = this.store?.getParish(this.selectedMunId, this.selectedParishId);
    const sp = (parish?.subparroquias || []).find(s => String(s.id) === String(spId));
    if (sp) {
      this.showQuickStats("subparroquia", sp);
      this.showToast(`🎯 Eje seleccionado: ${sp.nombre}`, "purple");
    }
  }

  selectParishFromModal(munId, parishId) {
    this.closeParishSelector();
    this.selectParish(munId, parishId, true);
  }

  handleMapItemSelection(type, item) {
    if (!item) return;

    if (type === "subparroquia") {
      this.activeSectorId = null;
      this.activeSubParroquiaId = String(item.id);
      if (this.mapEngine) {
        if (this.mapEngine.spotlightEnabled && item.vertices && item.vertices.length >= 3) {
          this.mapEngine.showSubParishBoundary(item.vertices, false);
        }
        this.mapEngine.highlightPolygon(item.id);
      }
      this.showQuickStats("subparroquia", item);
      this.updateTerritorialFocusUI();
      this.renderPlacesTree();
    } else if (type === "poligono") {
      this.activeSectorId = String(item.id);
      if (item.subParroquiaId) {
        this.activeSubParroquiaId = String(item.subParroquiaId);
      }
      if (this.mapEngine) {
        this.mapEngine.highlightPolygon(item.id);
        if (this.mapEngine.spotlightEnabled) {
          const rawCoords = item.vertices || item.poligono;
          if (rawCoords && rawCoords.length >= 3) {
            this.mapEngine.showSectorBoundary(rawCoords, false);
          }
        }
      }
      this.showQuickStats("poligono", item);
      this.updateTerritorialFocusUI();
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

    if (type === "parroquia") {
      const munObj = CATALOGO_MONAGAS.find(m => m.id === this.selectedMunId);
      if (badge) badge.style.backgroundColor = item.color || "#10b981";
      if (subTitle) subTitle.textContent = `Territorio Parroquial • Municipio ${munObj ? munObj.nombre : 'Monagas'}`;
      if (title) title.textContent = `Parroquia ${item.nombre || 'Parroquia'}`;

      const allPolys = item.poligonos || [];
      const allSub = item.subparroquias || [];

      let totCasas = 0, totFam = 0, totHab = 0, totVot = 0;
      allPolys.forEach(c => {
        totCasas += parseInt(c.casas || 0) || 0;
        totFam += parseInt(c.familias || 0) || 0;
        totHab += parseInt(c.habitantes || 0) || 0;
        totVot += parseInt(c.militantes !== undefined ? c.militantes : (c.habitantes || 0)) || 0;
      });

      if (totCasas === 0 && totHab === 0) {
        allSub.forEach(s => {
          totCasas += parseInt(s.casas || 0) || 0;
          totFam += parseInt(s.familias || 0) || 0;
          totHab += parseInt(s.habitantes || 0) || 0;
          totVot += parseInt(s.militantes !== undefined ? s.militantes : (s.habitantes || 0)) || 0;
        });
      }

      if (totHab === 0 && item.poblacion) totHab = item.poblacion;
      if (totVot === 0 && item.electores) totVot = item.electores;
      if (totCasas === 0 && totHab > 0) totCasas = Math.round(totHab / 3.8);
      if (totFam === 0 && totCasas > 0) totFam = Math.round(totCasas * 1.15);

      // Respaldo de variables oficiales de censo y CNE si sigue en 0
      const demo = getParishDemographics(this.selectedMunId, this.selectedParishId);
      if (demo) {
        if (totCasas === 0) totCasas = demo.casas;
        if (totFam === 0) totFam = demo.familias;
        if (totHab === 0) totHab = demo.habitantes;
        if (totVot === 0) totVot = demo.votantes;
      }

      if (elCasas) elCasas.textContent = totCasas.toLocaleString();
      if (elFamilias) elFamilias.textContent = totFam.toLocaleString();
      if (elHabitantes) elHabitantes.textContent = totHab.toLocaleString();
      if (elVotantes) elVotantes.textContent = totVot.toLocaleString();

      if (elCentro) {
        const centrosText = demo && demo.centros ? `${demo.centros} Centros CNE (${demo.mesas || 0} mesas) • ` : "";
        elCentro.textContent = `${centrosText}${allSub.length} Ejes Territoriales • ${allPolys.length} Sectores Mapeados`;
      }
      const spRow = document.getElementById("quick-stats-subparish-row");
      if (spRow) spRow.style.display = "none";
    } else if (type === "subparroquia") {
      if (badge) badge.style.backgroundColor = item.colorRelleno || item.colorBorde || "#c084fc";
      if (subTitle) subTitle.textContent = "Sub-Parroquia / Eje Territorial";
      if (title) title.textContent = item.nombre || "Sub-Parroquia";

      const childSecs = (parish?.poligonos || []).filter(p => String(p.subParroquiaId) === String(item.id));
      let totCasas = 0, totFam = 0, totHab = 0, totVot = 0;
      childSecs.forEach(c => {
        totCasas += parseInt(c.casas || 0) || 0;
        totFam += parseInt(c.familias || 0) || 0;
        totHab += parseInt(c.habitantes || 0) || 0;
        totVot += parseInt(c.militantes !== undefined ? c.militantes : (c.habitantes || 0)) || 0;
      });

      if (totCasas === 0 && totHab === 0) {
        totCasas = parseInt(item.casas || 0) || 0;
        totFam = parseInt(item.familias || 0) || 0;
        totHab = parseInt(item.habitantes || 0) || 0;
        totVot = parseInt(item.militantes !== undefined ? item.militantes : (item.habitantes || 0)) || 0;
      }

      // Si aún sigue en 0, calcular estimado proporcional según el número de ejes
      if (totCasas === 0 && totHab === 0) {
        const demo = getParishDemographics(this.selectedMunId, this.selectedParishId);
        const subCount = Math.max(1, (parish?.subparroquias || []).length);
        if (demo) {
          totCasas = Math.round(demo.casas / subCount);
          totFam = Math.round(demo.familias / subCount);
          totHab = Math.round(demo.habitantes / subCount);
          totVot = Math.round(demo.votantes / subCount);
        }
      }

      if (elCasas) elCasas.textContent = totCasas.toLocaleString();
      if (elFamilias) elFamilias.textContent = totFam.toLocaleString();
      if (elHabitantes) elHabitantes.textContent = totHab.toLocaleString();
      if (elVotantes) elVotantes.textContent = totVot.toLocaleString();

      if (elCentro) {
        elCentro.textContent = childSecs.length > 0 ? `${childSecs.length} Sectores Integrados` : (item.alias || "Sector Activo");
      }
      const spSubRow = document.getElementById("quick-stats-subparish-row");
      const spSubNameEl = document.getElementById("quick-stats-subparish-name");
      if (spSubRow && spSubNameEl) {
        spSubRow.style.display = "flex";
        spSubNameEl.textContent = item.nombre || "Eje Territorial";
      }
    } else {
      // Sector Vecinal (poligono)
      if (badge) badge.style.backgroundColor = item.colorRelleno || item.colorBorde || "#facc15";

      let spName = "";
      if (item.subParroquiaId && parish?.subparroquias) {
        const sp = parish.subparroquias.find(s => String(s.id) === String(item.subParroquiaId));
        if (sp) spName = ` • ${sp.nombre}`;
      }
      if (subTitle) subTitle.textContent = `Sector Vecinal${spName}`;
      if (title) title.textContent = item.nombre || "Sector";

      let cCas = parseInt(item.casas || 0) || 0;
      let cFam = parseInt(item.familias || 0) || 0;
      let cHab = parseInt(item.habitantes || 0) || 0;
      let cVot = parseInt(item.militantes !== undefined ? item.militantes : (item.votantes || item.habitantes || 0)) || 0;

      // Respaldo proporcional si el polígono no tiene números cargados
      if (cCas === 0 && cHab === 0) {
        const demo = getParishDemographics(this.selectedMunId, this.selectedParishId);
        const polyCount = Math.max(1, (parish?.poligonos || []).length);
        if (demo) {
          cCas = Math.max(50, Math.round(demo.casas / polyCount));
          cFam = Math.round(cCas * 1.15);
          cHab = Math.round(cCas * 3.8);
          cVot = Math.max(30, Math.round(demo.votantes / polyCount));
        }
      }

      if (elCasas) elCasas.textContent = cCas.toLocaleString();
      if (elFamilias) elFamilias.textContent = cFam.toLocaleString();
      if (elHabitantes) elHabitantes.textContent = cHab.toLocaleString();
      if (elVotantes) elVotantes.textContent = cVot.toLocaleString();

      if (elCentro) elCentro.textContent = item.centroVotacion || "No asignado";

      const spRow = document.getElementById("quick-stats-subparish-row");
      if (spRow) {
        let spObj = null;
        if (item.subParroquiaId && parish?.subparroquias) {
          spObj = parish.subparroquias.find(s => String(s.id) === String(item.subParroquiaId));
        } else if (this.activeSubParroquiaId && parish?.subparroquias) {
          spObj = parish.subparroquias.find(s => String(s.id) === String(this.activeSubParroquiaId));
        }
        if (spObj) {
          spRow.style.display = "flex";
          spRow.innerHTML = `
            <span class="text-purple-300 font-bold flex items-center gap-1 shrink-0">
              <span>🟪</span> Eje Territorial:
            </span>
            <div class="flex items-center gap-1.5 truncate max-w-[70%] justify-end">
              <span id="quick-stats-subparish-name" class="text-purple-100 font-extrabold truncate">${spObj.nombre || "Eje"}</span>
              <button type="button" onclick="window.earthApp?.focusSubParish('${spObj.id}', false)" class="text-[10px] text-purple-200 hover:text-white bg-purple-900/90 hover:bg-purple-800 px-1.5 py-0.5 rounded-lg border border-purple-400/50 transition font-bold shrink-0 cursor-pointer" title="Enfocar este Eje">
                Ver Eje
              </button>
              <button type="button" onclick="window.earthApp?.clearSectorFocus(false)" class="text-[10px] text-sky-200 hover:text-white bg-sky-900/90 hover:bg-sky-800 px-1.5 py-0.5 rounded-lg border border-sky-400/50 transition font-bold shrink-0 cursor-pointer" title="Ver toda la parroquia">
                ↩ Parroquia
              </button>
            </div>
          `;
        } else {
          spRow.style.display = "flex";
          spRow.innerHTML = `
            <span class="text-sky-300 font-bold flex items-center gap-1 shrink-0">
              <span>📍</span> Parroquia:
            </span>
            <div class="flex items-center gap-1.5 truncate max-w-[70%] justify-end">
              <span class="text-sky-100 font-extrabold truncate">${parish?.nombre || "Parroquia"}</span>
              <button type="button" onclick="window.earthApp?.clearSectorFocus(false)" class="text-[10px] text-sky-200 hover:text-white bg-sky-900/90 hover:bg-sky-800 px-1.5 py-0.5 rounded-lg border border-sky-400/50 transition font-bold shrink-0 cursor-pointer" title="Ver toda la parroquia">
                ↩ Parroquia
              </button>
            </div>
          `;
        }
      }
    }

    const linkDashboard = document.getElementById("btn-quick-stats-dashboard-link");
    if (linkDashboard) {
      if (type === "sector" || type === "poligono") {
        linkDashboard.href = `../dashboard-campana/?mun=${this.selectedMunId}&p=${this.selectedParishId}&search=${encodeURIComponent(item.nombre || "")}`;
      } else {
        linkDashboard.href = `../dashboard-campana/?mun=${this.selectedMunId}&p=${this.selectedParishId}`;
      }
    }

    const btnAddSectorInCard = document.getElementById("btn-quick-stats-action-sector");
    if (btnAddSectorInCard) {
      if (type === "subparroquia") {
        btnAddSectorInCard.style.display = "flex";
        btnAddSectorInCard.onclick = () => {
          this.closeQuickStats();
          this.startSectorInSubParish(item.id);
        };
      } else {
        btnAddSectorInCard.style.display = "none";
      }
    }

    if (btnEdit) {
      btnEdit.onclick = (e) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        const curType = type;
        const curItem = item;
        const curMun = this.selectedMunId;
        const curPar = this.selectedParishId;
        this.closeQuickStats();
        if (curType === "parroquia") {
          window.location.href = `../caracterizacion-voto/?p=${curPar}`;
          return;
        }
        setTimeout(() => {
          this.propDialog?.open(curType, curItem, curMun, curPar);
        }, 50);
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
      if (this.mapEngine) {
        this.mapEngine.map.flyToBounds(L.polygon(item.vertices).getBounds(), { padding: [50, 50], maxZoom: 17, duration: 1.0 });
        this.mapEngine.highlightPolygon(item.id);
        if (this.mapEngine.spotlightEnabled) {
          const parishObj = this.store?.getParish(munId, parishId);
          if (item.subParroquiaId && parishObj?.subparroquias) {
            const sp = parishObj.subparroquias.find(s => String(s.id) === String(item.subParroquiaId));
            if (sp && sp.vertices && sp.vertices.length >= 3) {
              this.activeSubParroquiaId = String(sp.id);
              this.mapEngine.showSubParishBoundary(sp.vertices, false);
            } else {
              this.activeSubParroquiaId = null;
              this.mapEngine.showParishBoundary(parishObj.limite || null, parishId, false);
            }
          } else if (parishObj) {
            this.activeSubParroquiaId = null;
            this.mapEngine.showParishBoundary(parishObj.limite || null, parishId, false);
          }
        }
      }
      if (openDialogDirectly) {
        this.closeQuickStats();
        this.propDialog.open(type, item, munId, parishId);
      } else {
        this.showQuickStats(type, item);
      }
      this.updateTerritorialFocusUI();
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
        newItem.nombre = `Eje Territorial ${existingCount + 1}`;
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
      this.showToast(`✅ <strong>${newItem.nombre}</strong> asegurado en la nube. Pulsa <strong>[+ Sector]</strong> para trazar sectores dentro.`, "purple");
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
      this.showToast(`✅ <strong>${updatedFields.nombre || 'Elemento'}</strong> reubicado y actualizado.`, "emerald");
    } else {
      const savedItem = await this.store.updateItem(this.selectedMunId, this.selectedParishId, key, itemId, updatedFields);
      const parish = this.store.getParish(this.selectedMunId, this.selectedParishId);
      this.mapEngine.renderParishItems(parish, (t, it) => {
        this.handleMapItemSelection(t, it);
      });
      this.updateMilitanciaTally();
      this.renderPlacesTree();
      this.showToast(`✅ Datos de <strong>${updatedFields.nombre || 'sector'}</strong> actualizados exitosamente.`, "emerald");

      // Refrescar ficha de estadísticas rápidas con los datos recién actualizados
      if (savedItem && (type === "poligono" || type === "subparroquia")) {
        this.showQuickStats(type, savedItem);
      }
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
    if (confirm("¿Deseas eliminar este elemento de la plataforma territorial MIGATO?")) {
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
        tabPlaces.classList.add("text-amber-300", "border-b-2", "border-amber-400", "bg-[#140e40]");
        tabPlaces.classList.remove("text-slate-400", "bg-[#100b33]");
        tabLayers.classList.remove("text-sky-300", "border-b-2", "border-sky-400", "bg-[#140e40]");
        tabLayers.classList.add("text-slate-400");

        if (viewPlaces) viewPlaces.classList.remove("hidden");
        if (viewLayers) viewLayers.classList.add("hidden");
      });

      tabLayers.addEventListener("click", () => {
        tabLayers.classList.add("text-sky-300", "border-b-2", "border-sky-400", "bg-[#140e40]");
        tabLayers.classList.remove("text-slate-400", "bg-[#100b33]");
        tabPlaces.classList.remove("text-amber-300", "border-b-2", "border-amber-400", "bg-[#140e40]");
        tabPlaces.classList.add("text-slate-400");

        if (viewPlaces) viewPlaces.classList.add("hidden");
        if (viewLayers) viewLayers.classList.remove("hidden");
      });
    }

    const chkAutoZoom = document.getElementById("chk-auto-zoom-lod");
    if (chkAutoZoom) {
      chkAutoZoom.checked = this.mapEngine ? this.mapEngine.autoZoomLOD : true;
      chkAutoZoom.addEventListener("change", (e) => {
        if (this.mapEngine) {
          this.mapEngine.setAutoZoomLOD(e.target.checked);
        }
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
          this.mapEngine.toggleHierarchicalLayer(level, chk.checked, false);
        }
        chk.addEventListener("change", (e) => {
          if (this.mapEngine) {
            this.mapEngine.toggleHierarchicalLayer(level, e.target.checked, true);
          }
        });
      }
    });

    if (this.mapEngine) {
      this.mapEngine.syncCheckboxesUI();
    }
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
        const userInput = (inputUser?.value || "").trim();
        const passInput = (inputPass?.value || "").trim();
        const rememberChk = document.getElementById("auth-chk-remember");
        const remember = rememberChk ? rememberChk.checked : true;

        if (!userInput || !passInput) {
          if (errorMsg) {
            errorMsg.textContent = "Ingrese su usuario y contraseña asignados.";
            errorMsg.classList.remove("hidden");
          }
          return;
        }

        const res = this.authManager.login(userInput, passInput, remember);
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
        const isJefe = res.user.nivel === "jefe" || res.user.username === "admin";
        const roleText = isJefe 
          ? "👑 Jefatura de Despacho (Solo Jefe)" 
          : (res.user.rol === "admin" ? "🌐 Dirección General (Militancia)" : `🔒 Parroquia ${res.user.parroquiaNombre || res.user.nombre}`);
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

    // Comprobar si hay parámetro URL para auto-login (?u=admin o ?u=admin-militancia o ?general=1)
    const urlParams = new URLSearchParams(window.location.search);
    const autoParish = urlParams.get("p") || urlParams.get("parroquia") || urlParams.get("parish");
    const autoMilitancia = urlParams.get("militancia") || urlParams.get("rol");
    const autoUser = urlParams.get("u") || urlParams.get("user") || urlParams.get("login") || autoParish || (autoMilitancia ? "alto-de-los-godos" : null);
    const autoGeneral = urlParams.get("general");

    if (autoGeneral === "1" || autoGeneral === "true" || autoUser) {
      if (autoUser === "admin") {
        this.quickLogin("admin", "admin");
      } else if (autoUser === "admin-militancia" || autoUser === "militancia" || autoGeneral === "1") {
        this.quickLogin("admin-militancia", "militancia");
      } else {
        this.quickLogin(autoUser, "admin");
      }
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
      // Auto-iniciar en Modo General de Militancia si no hay sesión
      this.quickLogin("admin-militancia", "militancia");
    }
  }

  quickLogin(identity = "admin-militancia", password = null) {
    let finalPass = password;
    if (!finalPass) {
      if (identity === "admin" || identity === "jefe") {
        finalPass = "admin";
      } else if (identity === "admin-militancia" || identity === "militancia" || identity === "general") {
        finalPass = "militancia";
      } else {
        finalPass = "admin";
      }
    }
    const res = this.authManager.login(identity, finalPass);
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
      const isJefe = res.user.nivel === "jefe" || res.user.username === "admin";
      const roleText = isJefe 
        ? "👑 Jefatura de Despacho (Solo Jefe)" 
        : (res.user.rol === "admin" ? "🌐 Dirección General (Militancia)" : `Parroquia ${res.user.parroquiaNombre || res.user.nombre}`);
      this.showToast(`Conectado: ${roleText}`, "info");
    } else {
      if (errorMsg) {
        errorMsg.textContent = res.message;
        errorMsg.classList.remove("hidden");
      }
    }
  }

  applyUserScope() {
    const urlParams = new URLSearchParams(window.location.search);
    const explicitParishParam = urlParams.get("p") || urlParams.get("parroquia") || urlParams.get("parish");
    const uParam = (urlParams.get("u") || urlParams.get("user") || "").toLowerCase();
    const isExplicitAdminParam = uParam === "admin" || uParam === "admin-militancia" || uParam === "jefe" || uParam === "general" || uParam === "militancia" || urlParams.get("general") === "1";

    let user = this.authManager.getCurrentUser();
    // Si no hay usuario o la sesión anterior no era admin, elevar según solicitud (o por defecto a admin-militancia)
    if (!user || user.rol !== "admin") {
      const isJefeReq = uParam === "admin" || uParam === "jefe" || uParam === "admin-admin";
      const loginId = isJefeReq ? "admin" : "admin-militancia";
      const loginPass = isJefeReq ? "admin" : "militancia";
      const loginRes = this.authManager.login(loginId, loginPass);
      if (loginRes && loginRes.success) {
        user = loginRes.user;
      }
    }
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

    // Administrador General o Jefe siempre tienen acceso pleno a todo el territorio
    const isLockedParish = !!explicitParishParam && urlParams.get("isolated") === "1" && user.rol !== "admin";
    const isGeneral = !isLockedParish;
    this.isGeneralMode = isGeneral;

    if (isGeneral) {
      // 👑 MODO CENTRAL / DIRECCIÓN GENERAL
      document.documentElement.classList.remove("isolated-parish-view");
      const isJefe = user.nivel === "jefe" || user.username === "admin";
      if (badgeBtn) {
        if (isJefe) {
          badgeBtn.className = "hidden sm:flex px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/50 text-amber-300 text-xs font-black items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm shrink-0";
          badgeBtn.title = "Sesión: Jefatura de Despacho Central (Solo Jefe)";
        } else {
          badgeBtn.className = "hidden sm:flex px-2.5 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/50 text-sky-300 text-xs font-black items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm shrink-0";
          badgeBtn.title = "Sesión: Dirección General - Militancia (Acceso Central)";
        }
      }
      if (badgeIcon) badgeIcon.textContent = isJefe ? "👑" : "🌐";
      if (badgeLabel) badgeLabel.textContent = isJefe ? "Jefe de Despacho" : "General (Militancia)";

      if (lockWrapper) {
        lockWrapper.innerHTML = isJefe
          ? '<i data-lucide="crown" class="w-3.5 h-3.5 text-amber-400 shrink-0"></i>'
          : '<i data-lucide="shield-check" class="w-3.5 h-3.5 text-sky-400 shrink-0"></i>';
      }
      if (arrowIcon) {
        arrowIcon.classList.remove("hidden");
        arrowIcon.style.display = "inline-block";
      }
      if (navBtn) {
        navBtn.classList.remove("cursor-default", "pointer-events-none");
        navBtn.style.pointerEvents = "auto";
        navBtn.style.cursor = "pointer";
        navBtn.onclick = (e) => {
          e?.preventDefault?.();
          e?.stopPropagation?.();
          this.openParishSelector();
        };
        navBtn.title = "Territorio General de Monagas (Acceso Completo - Clic para cambiar)";
      }
      const navLoc = document.getElementById("nav-current-location");
      if (navLoc) {
        const curP = this.store.getParish(this.selectedMunId, this.selectedParishId);
        const curM = CATALOGO_MONAGAS.find(m => m.id === this.selectedMunId);
        navLoc.textContent = curP ? `${curP.nombre} (${curM ? curM.nombre : 'Monagas'})` : "Monagas";
      }
      if (statusRole) {
        statusRole.textContent = isJefe ? "Sala Central (Jefe de Despacho)" : "Sala Central (Militancia General)";
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
          this.selectedParishId = this.selectedParishId || "alto-de-los-godos";
        }
      }
    } else {
      // 🔒 MODO PARROQUIA SEGMENTADA (UNA POR UNA)
      const pName = user.parroquiaNombre || user.nombre || "Parroquia";
      const mName = user.municipioNombre || "";

      // Ocultar por completo el badge de sesión para no tentar ni exponer coronas
      if (badgeBtn) {
        badgeBtn.classList.add("hidden");
        badgeBtn.classList.remove("flex");
      }

      if (lockWrapper) {
        lockWrapper.innerHTML = '<i data-lucide="map-pin" class="w-3.5 h-3.5 text-sky-400 shrink-0"></i>';
      }
      if (arrowIcon) arrowIcon.classList.remove("hidden");
      if (navBtn) {
        navBtn.classList.remove("pointer-events-none", "cursor-default");
        navBtn.style.pointerEvents = "auto";
        navBtn.style.cursor = "pointer";
        navBtn.onclick = (e) => {
          e?.preventDefault?.();
          e?.stopPropagation?.();
          this.openParishSelector();
        };
        navBtn.title = `Parroquia ${pName} - Clic para ver sectores`;
      }
      const navLoc = document.getElementById("nav-current-location");
      if (navLoc) {
        navLoc.textContent = pName;
      }
      if (statusRole) {
        statusRole.textContent = `Parroquia ${pName}`;
      }

      // Fijar OBLIGATORIAMENTE el territorio a la parroquia del usuario
      this.selectedMunId = user.municipioId;
      this.selectedParishId = user.parroquiaId;
    }

    const toolbarToolsRow = document.getElementById("toolbar-tools-row");
    const adminModuleLinks = document.getElementById("admin-module-links");
    const mobileSubparish = document.getElementById("btn-mobile-subparish");
    const mobilePolygon = document.getElementById("btn-mobile-polygon");
    const mobilePath = document.getElementById("btn-mobile-path");
    const mobilePlacemark = document.getElementById("btn-mobile-placemark");

    // La Barra Territorial (Sub-Parroquia y Sectores) siempre está visible para operar el territorio
    if (toolbarToolsRow) {
      toolbarToolsRow.classList.remove("hidden");
      toolbarToolsRow.classList.add("flex");
    }

    if (isGeneral) {
      if (adminModuleLinks) {
        adminModuleLinks.classList.remove("hidden");
        adminModuleLinks.classList.add("flex");
      }
      if (mobileSubparish) mobileSubparish.classList.remove("hidden");
      if (mobilePolygon) mobilePolygon.classList.remove("hidden");
      if (mobilePath) mobilePath.classList.remove("hidden");
      if (mobilePlacemark) mobilePlacemark.classList.remove("hidden");
      if (tabLayers) tabLayers.classList.remove("hidden");
    } else {
      // 🔒 MODO OPERADOR / PARROQUIAL
      if (adminModuleLinks) adminModuleLinks.classList.add("hidden");
      if (mobileSubparish) mobileSubparish.classList.add("hidden");
      if (mobilePolygon) mobilePolygon.classList.add("hidden");
      if (mobilePath) mobilePath.classList.add("hidden");
      if (mobilePlacemark) mobilePlacemark.classList.add("hidden");
      if (tabLayers) tabLayers.classList.add("hidden");

      // Abrir automáticamente el panel de Lugares para ver los sectores de la parroquia
      const sidebar = document.getElementById("earth-sidebar");
      if (sidebar && sidebar.classList.contains("hidden")) {
        sidebar.classList.remove("hidden");
        sidebar.classList.add("flex");
      }
    }

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

    // 5.1. Botón Alternar Velo Blanco Exterior
    const btnSpotlight = document.getElementById("btn-toggle-spotlight");
    if (btnSpotlight) {
      btnSpotlight.addEventListener("click", () => {
        this.toggleSpotlight();
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

    // 6.1 Navegación en cascada inteligente con la tecla Escape: Sector ➔ Eje ➔ Parroquia ➔ Municipio ➔ Estado
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        // 1. Cerrar modales si alguno está abierto
        const parishModal = document.getElementById("modal-select-parish");
        if (parishModal && parishModal.style.display !== "none" && !parishModal.classList.contains("hidden")) {
          this.closeParishSelector();
          return;
        }

        const propModal = document.getElementById("dialog-properties");
        if (propModal && propModal.style.display !== "none" && !propModal.classList.contains("hidden")) {
          this.propDialog?.close();
          return;
        }

        const quickCard = document.getElementById("card-quick-stats");
        const isQuickCardOpen = quickCard && quickCard.style.display !== "none";

        // 2. Si estamos en Sector Vecinal: regresar a Eje (si aplica) o a Parroquia
        if (this.activeSectorId) {
          if (isQuickCardOpen) this.closeQuickStats();
          this.clearSectorFocus(true);
          return;
        }

        // 3. Si estamos en Eje Territorial: regresar a Parroquia
        if (this.activeSubParroquiaId) {
          if (isQuickCardOpen) this.closeQuickStats();
          this.clearSubParishFocus();
          return;
        }

        if (isQuickCardOpen) {
          this.closeQuickStats();
          return;
        }

        // 4. Si estamos en Parroquia: subir a ver el Municipio completo
        if (this.mapEngine?.activeFocusLevel === "parroquia") {
          this.focusMunicipio();
          return;
        }

        // 5. Si estamos en Municipio: subir a ver todo el Estado Monagas
        if (this.mapEngine?.activeFocusLevel === "municipio") {
          this.focusEstado();
          return;
        }
      }
    });

    // 7. Toggle y división ágil de pantalla (Sidebar / Panel vs Mapa Satelital)
    const btnToggleSidebar = document.getElementById("btn-toggle-sidebar");
    const btnCloseSidebar = document.getElementById("btn-close-sidebar");
    const sidebar = document.getElementById("earth-sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    const btnDesktopExpand = document.getElementById("btn-desktop-expand-sidebar");

    const toggleSidebar = (open = null) => {
      if (!sidebar) return;
      const isMobile = window.innerWidth < 768;
      const isCurrentlyHidden = sidebar.classList.contains("hidden") || sidebar.style.display === "none";
      const willOpen = open !== null ? open : isCurrentlyHidden;

      if (willOpen) {
        this.userExplicitlyCollapsedSidebar = false;
        sidebar.classList.remove("hidden");
        sidebar.classList.add("flex");
        sidebar.style.display = "flex";

        if (isMobile) {
          sidebar.style.position = "absolute";
          sidebar.style.zIndex = "2500";
          if (backdrop) {
            backdrop.classList.remove("hidden");
            backdrop.style.display = "block";
            backdrop.style.zIndex = "2400";
          }
        } else {
          // MODO ESCRITORIO: División de pantalla limpia sin backdrop que tape el mapa
          sidebar.style.position = "";
          sidebar.style.zIndex = "40";
          if (backdrop) {
            backdrop.classList.add("hidden");
            backdrop.style.display = "none";
          }
          if (btnDesktopExpand) {
            btnDesktopExpand.style.display = "none";
            btnDesktopExpand.classList.add("hidden");
          }
          if (btnToggleSidebar) {
            btnToggleSidebar.classList.add("bg-[#23176d]", "border-sky-400/70", "text-white");
          }
        }
        this.closeQuickStats();
      } else {
        if (!isMobile) {
          this.userExplicitlyCollapsedSidebar = true;
        }
        sidebar.classList.add("hidden");
        sidebar.classList.remove("flex");
        sidebar.style.display = "none";

        if (backdrop) {
          backdrop.classList.add("hidden");
          backdrop.style.display = "none";
        }
        if (!isMobile && btnDesktopExpand) {
          btnDesktopExpand.style.display = "flex";
          btnDesktopExpand.classList.remove("hidden");
        }
        if (btnToggleSidebar) {
          btnToggleSidebar.classList.remove("bg-[#23176d]", "border-sky-400/70", "text-white");
        }
      }

      if (window.lucide && typeof window.lucide.createIcons === "function") {
        try { window.lucide.createIcons(); } catch(e){}
      }

      // Reajuste inmediato del motor de mapas de Leaflet al cambiar el ancho
      setTimeout(() => {
        if (this.mapEngine?.map?.invalidateSize) {
          this.mapEngine.map.invalidateSize();
        }
      }, 150);
    };

    this.toggleSidebar = toggleSidebar;
    window.earthApp.toggleSidebar = toggleSidebar;

    const resetNorth = () => {
      const p = this.store.getParish(this.selectedMunId, this.selectedParishId);
      if (p && this.mapEngine) {
        this.mapEngine.flyTo(p.centro[0], p.centro[1], p.zoom || 14);
      } else if (this.mapEngine) {
        this.mapEngine.flyTo(9.7469, -63.1812, 12);
      }
    };
    this.resetNorth = resetNorth;
    window.earthApp.resetNorth = resetNorth;
    if (this.toolsManager) {
      this.toolsManager.resetNorth = resetNorth;
    }

    const openLayers = () => {
      const tabLayers = document.getElementById("btn-sidebar-tab-layers");
      if (tabLayers) tabLayers.click();
      toggleSidebar(true);
    };
    this.openLayers = openLayers;
    window.earthApp.openLayers = openLayers;
    window.earthApp.closeParishSelector = () => window.closeParishSelectorModal();
    window.earthApp.selectParishFromModal = (m, p) => window.selectParishGlobal(m, p);

    if (btnToggleSidebar) btnToggleSidebar.addEventListener("click", () => toggleSidebar());
    if (btnCloseSidebar) btnCloseSidebar.addEventListener("click", () => toggleSidebar(false));
    if (backdrop) backdrop.addEventListener("click", () => toggleSidebar(false));

    // Estado inicial responsivo: en pantallas de escritorio (>= 768px), arrancar con pantalla dividida (panel visible)
    toggleSidebar(window.innerWidth >= 768);
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
      <div class="flex items-center gap-2 p-2 rounded-lg bg-[#140e40]/90 border border-[#2d1f85] hover:border-sky-400 transition">
        <input type="checkbox" data-idx="${idx}" class="kml-item-checkbox accent-emerald-500 w-4 h-4 rounded cursor-pointer shrink-0" ${p.checked ? "checked" : ""}>
        <div class="flex-1 min-w-0">
          <input type="text" data-idx="${idx}" value="${p.name.replace(/"/g, '&quot;')}" class="kml-item-name w-full bg-[#0e092e] border border-[#2d1f85] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-sky-400 font-semibold" placeholder="Nombre del polígono">
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <span class="px-1.5 py-0.5 rounded bg-[#100b33] border border-[#2d1f85] text-[10px] text-slate-300 font-mono">${p.vertices.length} pts</span>
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
        labelConfirm.textContent = `Importar ${selectedCount} Polígonos a Capa 1 (Ejes Territoriales) en ${parishName}`;
      } else {
        labelConfirm.textContent = `Importar ${selectedCount} Polígonos a Capa 2 (Sectores Vecinales) en ${parishName}`;
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
      const layerName = selectedLayer === "capa1" ? "Capa 1 (Ejes Territoriales)" : "Capa 2 (Sectores Vecinales)";

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
        const rawLng = parseFloat(parts[0]);
        const rawLat = parseFloat(parts[1]);
        if (!isNaN(rawLat) && !isNaN(rawLng)) {
          const lat = Math.round(rawLat * 1000000) / 1000000;
          const lng = Math.round(rawLng * 1000000) / 1000000;
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
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById("input-overlay-file");
        const file = fileInput?.files?.[0];
        if (!file) return;

        try {
          this.showToast("🖼️ Optimizando plano antes de colocar en satélite...", "purple");
          const optimized = await ImageOptimizer.compressImage(file, { maxDimension: 1600, quality: 0.82 });
          const bounds = this.mapEngine.map.getBounds();
          const op = parseFloat(inputOpacity.value) || 0.65;
          this.mapEngine.addImageOverlay(optimized.dataUrl, bounds, op);
          if (modal) {
            modal.classList.add("hidden");
            modal.classList.remove("flex");
          }
          this.showToast(`✅ Plano optimizado y superpuesto con éxito (${optimized.reduction} de compresión). Ya puedes calcar polígonos encima.`, "purple");
        } catch (err) {
          console.warn("Aviso optimizando imagen:", err);
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
          };
          reader.readAsDataURL(file);
        }
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
