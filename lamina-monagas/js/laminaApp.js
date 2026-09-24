/**
 * ==========================================================================
 * LÁMINA CARTOGRÁFICA EJECUTIVA 120" — SALA SITUACIONAL ESTADO MONAGAS
 * Controlador Cartográfico Acelerado por GPU para Proyección y Exportación
 * ==========================================================================
 */

import { GEO_ESTADO_OFICIAL, GEO_MUNICIPIOS_OFICIAL, GEO_PARROQUIAS_OFICIAL } from "../../earth-monagas/js/geoOficialMonagas.js?v=240";
import { CATALOGO_MONAGAS, PARISH_ALIAS_MAP, resolveParishId } from "../../earth-monagas/js/catalogoMonagas.js?v=240";
import { getParishDemographics, getMunicipioDemographics, getParishColor as getBaseParishColor, PARISH_COLORS } from "../../earth-monagas/js/monagasDemographics.js?v=240";
import { 
  getMunicipios, 
  getParroquiasByMun, 
  getEjesByParish, 
  getSectoresByEje, 
  getSectoresByParish, 
  findSectorById, 
  ALL_SECTORES_FLAT,
  MONAGAS_TERRITORIO_COMPLETO
} from "../../earth-monagas/js/monagasSectoresCatalog.js?v=240";
import { SUBPARROQUIAS_MONAGAS, SUBPARROQUIAS_GODOS, SECTORES_LAPUENTE } from "../../earth-monagas/js/geoMonagas.js?v=240";
import { CENTROS_MATURIN } from "../../earth-monagas/js/centrosData.js?v=240";
import { 
  getComandoInfo, 
  getAssignedLeader, 
  saveAssignedComando, 
  getLeaderPool,
  COMANDOS_MUNICIPALES,
  COMANDOS_PARROQUIALES,
  COMANDOS_SECTORIALES
} from "./comandoData.js?v=260";
import { auditLogger } from "./auditLogger.js";
import { Whiteboard } from "./whiteboard.js?v=310";
import { LaminaColorStudio, HIGH_CONTRAST_MUN_PALETTE } from "./laminaColorStudio.js?v=400";

const BOUNDS_ESTADO_MONAGAS = [
  [8.38245, -64.06290],
  [10.32066, -61.99679]
];

const WORLD_BOX = [
  [-85.0511, -180],
  [-85.0511, 180],
  [85.0511, 180],
  [85.0511, -180]
];

function formatTitleCase(str) {
  if (!str) return "";
  const clean = String(str)
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  
  return clean
    .split(" ")
    .map(w => {
      const lower = w.toLowerCase();
      if (["de", "del", "la", "las", "los", "el", "y", "en"].includes(lower)) {
        return lower;
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ")
    .replace(/^De\b/i, "De")
    .replace(/^La\b/i, "La")
    .replace(/^El\b/i, "El");
}

export class LaminaApp {
  constructor() {
    this.map = null;
    this.level = "estado"; // "estado" | "municipio" | "parroquia" | "subparroquia" | "sector"
    this.activeMunId = null;
    this.activeParishId = null;
    this.activeSubParishId = null;
    this.activeSectorId = null;
    this.activeSubParishName = null;
    this.activeSectorName = null;

    // Foco fijo de parroquia para no alterar el zoom en subparroquias ni sectores
    this.currentParishBounds = null;
    this.currentParishRings = null;

    // Capas Base y Modo de Mapa
    this.baseLayers = {};
    this.currentBaseLayer = "satelite";

    // Capas Leaflet
    this.maskLayer = null;
    this.boundaryLayer = null;
    this.childEntitiesLayer = null;
    this.centrosLayer = null;

    this.activeTab = "stats"; // "stats" | "symbols"
    this.showCentros = true;
    this.whiteboard = null;

    // Estudio Rápido de Colores
    this.customMunColors = {};
    this.customParishColors = {};
    this.customSectorColors = {};
    // Subinterfaz Territorial, Datos y Comandos
    this.modalSelectedMun = "maturin";
    this.modalDrilldownParish = null;
    this.polygonOpacity = 0.26;
    this.loadCustomColors();
    window.laminaApp = this;

    this.init();
  }

  init() {
    this.initMap();
    this.initUIListeners();
    this.initWhiteboard();
    this.initColorStudio();
    this.updateBaseMapUI();

    // Inicialización del territorio condicionada a dimensiones válidas del contenedor
    let initialized = false;
    const checkAndInit = () => {
      if (initialized || !this.map) return true;
      this.map.invalidateSize();
      const size = this.map.getSize();
      if (size && size.x > 100 && size.y > 100) {
        initialized = true;
        this.parseURLParams(false);
        return true;
      }
      return false;
    };

    // 1. Intentar si el mapa ya tiene dimensiones calculadas
    if (!checkAndInit()) {
      // 2. Esperar al ciclo whenReady de Leaflet
      this.map.whenReady(() => {
        if (!checkAndInit()) {
          requestAnimationFrame(() => {
            if (!checkAndInit()) {
              setTimeout(checkAndInit, 100);
            }
          });
        }
      });
    }

    // Respaldo de seguridad final por si la ventana tarda en resolver tipografía o estilos
    setTimeout(() => {
      if (!initialized) {
        checkAndInit();
      }
    }, 350);

    window.addEventListener("load", () => {
      if (this.map) {
        this.map.invalidateSize();
        if (!initialized) checkAndInit();
      }
    });
  }

  initWhiteboard() {
    try {
      this.whiteboard = new Whiteboard({
        canvasId: "whiteboard-canvas",
        toolbarId: "whiteboard-toolbar",
        toggleBtnId: "btn-toggle-whiteboard",
        map: this.map
      });
    } catch (err) {
      console.warn("No se pudo inicializar la pizarra táctica:", err);
    }
  }

  initColorStudio() {
    try {
      this.colorStudio = new LaminaColorStudio(this);
      window.colorStudio = this.colorStudio;
    } catch (err) {
      console.warn("No se pudo inicializar el Estudio de Colores:", err);
    }
  }

  loadCustomColors() {
    try {
      this.customMunColors = Object.assign({}, HIGH_CONTRAST_MUN_PALETTE);
      const savedMun = localStorage.getItem("migato_custom_mun_colors");
      if (savedMun) {
        try {
          const parsed = JSON.parse(savedMun);
          if (parsed && typeof parsed === "object") {
            Object.assign(this.customMunColors, parsed);
          }
        } catch (e) {}
      }

      this.customParishColors = {};
      const savedParish = localStorage.getItem("migato_custom_parish_colors");
      if (savedParish) {
        try {
          const parsed = JSON.parse(savedParish);
          if (parsed && typeof parsed === "object") {
            this.customParishColors = parsed;
          }
        } catch (e) {}
      }

      this.customSectorColors = {};
      const savedSector = localStorage.getItem("migato_custom_sector_colors");
      if (savedSector) {
        try {
          const parsed = JSON.parse(savedSector);
          if (parsed && typeof parsed === "object") {
            this.customSectorColors = parsed;
          }
        } catch (e) {}
      }

      const savedOpacity = localStorage.getItem("migato_polygon_opacity");
      if (savedOpacity !== null && !isNaN(parseFloat(savedOpacity))) {
        this.polygonOpacity = parseFloat(savedOpacity);
      } else {
        this.polygonOpacity = 0.26;
      }
    } catch (e) {
      console.warn("[LaminaApp] Error cargando paleta de colores personalizada:", e);
    }
  }

  updatePolygonOpacity(val) {
    this.polygonOpacity = parseFloat(val);
    try {
      localStorage.setItem("migato_polygon_opacity", String(this.polygonOpacity));
    } catch (e) {}

    // Actualizar en vivo todas las capas poligonales activas
    if (this.childEntitiesLayer) {
      this.childEntitiesLayer.eachLayer(layer => {
        if (layer && typeof layer.setStyle === "function") {
          if (layer.entityType === "municipio" || layer.entityType === "parroquia") {
            layer.setStyle({ fillOpacity: this.polygonOpacity });
          } else if (layer.entityType === "subparroquia" || layer.entityType === "sector") {
            layer.setStyle({ fillOpacity: Math.min(0.40, this.polygonOpacity + 0.05) });
          }
        }
      });
    }
  }

  getMunicipalityColor(mId) {
    if (!mId) return "#1d4ed8";
    const cleanId = String(mId).toLowerCase().replace(/^mun-/, '').trim();
    if (this.customMunColors) {
      if (this.customMunColors[cleanId]) return this.customMunColors[cleanId];
      if (this.customMunColors[mId]) return this.customMunColors[mId];
    }
    if (HIGH_CONTRAST_MUN_PALETTE) {
      if (HIGH_CONTRAST_MUN_PALETTE[cleanId]) return HIGH_CONTRAST_MUN_PALETTE[cleanId];
      if (HIGH_CONTRAST_MUN_PALETTE[mId]) return HIGH_CONTRAST_MUN_PALETTE[mId];
    }
    const f = (GEO_MUNICIPIOS_OFICIAL.features || []).find(feat => feat.properties?.id === cleanId || feat.properties?.id === mId);
    return f?.properties?.color || (CATALOGO_MONAGAS || []).find(m => m.id === cleanId)?.color || "#1d4ed8";
  }

  getParishColor(pId, munId) {
    if (!pId) return "#2563eb";
    const cleanId = resolveParishId(pId);
    if (this.customParishColors) {
      if (this.customParishColors[cleanId]) return this.customParishColors[cleanId];
      if (this.customParishColors[pId]) return this.customParishColors[pId];
    }
    return getBaseParishColor(cleanId);
  }

  getSectorColor(secId, defaultColor = "#0284c7") {
    if (!secId) return defaultColor;
    if (this.customSectorColors) {
      if (this.customSectorColors[secId]) return this.customSectorColors[secId];
      const lower = String(secId).toLowerCase();
      for (const [k, v] of Object.entries(this.customSectorColors)) {
        if (String(k).toLowerCase() === lower) return v;
      }
    }
    return defaultColor;
  }

  updateLiveEntityColor(type, id, hexColor) {
    if (!id || !hexColor) return;
    hexColor = hexColor.toLowerCase();

    if (type === "municipio") {
      const cleanId = String(id).toLowerCase().replace(/^mun-/, '').trim();
      if (!this.customMunColors) this.customMunColors = {};
      this.customMunColors[cleanId] = hexColor;
      this.customMunColors[id] = hexColor;
      try {
        localStorage.setItem("migato_custom_mun_colors", JSON.stringify(this.customMunColors));
      } catch (e) {}

      // 1. Actualizar polígonos del mapa en vivo
      if (this.childEntitiesLayer) {
        this.childEntitiesLayer.eachLayer(layer => {
          if (layer.entityId === cleanId || layer.entityId === id) {
            layer.setStyle({
              color: "#ffffff",
              fillColor: hexColor
            });
          }
        });
      }

      // 2. Actualizar contorno del spotlight si estamos dentro de este municipio
      if (this.level === "municipio" && (this.activeMunId === cleanId || this.activeMunId === id) && this.spotlightLayer) {
        this.spotlightLayer.setStyle({ color: hexColor });
      }

      // 3. Actualizar badges en la lista lateral
      document.querySelectorAll(`[data-entity-id="${cleanId}"] .entity-badge-color, [data-entity-id="${id}"] .entity-badge-color`).forEach(el => {
        el.style.backgroundColor = hexColor;
      });

    } else if (type === "parroquia") {
      const cleanId = resolveParishId(id);
      if (!this.customParishColors) this.customParishColors = {};
      this.customParishColors[cleanId] = hexColor;
      this.customParishColors[id] = hexColor;
      try {
        localStorage.setItem("migato_custom_parish_colors", JSON.stringify(this.customParishColors));
      } catch (e) {}

      if (this.childEntitiesLayer) {
        this.childEntitiesLayer.eachLayer(layer => {
          if (layer.entityId === cleanId || layer.entityId === id) {
            layer.setStyle({
              color: "#ffffff",
              fillColor: hexColor
            });
          }
        });
      }

      document.querySelectorAll(`[data-entity-id="${cleanId}"] .entity-badge-color, [data-entity-id="${id}"] .entity-badge-color`).forEach(el => {
        el.style.backgroundColor = hexColor;
      });

    } else if (type === "sector" || type === "subsector") {
      if (!this.customSectorColors) this.customSectorColors = {};
      this.customSectorColors[id] = hexColor;
      try {
        localStorage.setItem("migato_custom_sector_colors", JSON.stringify(this.customSectorColors));
      } catch (e) {}

      if (this.childEntitiesLayer) {
        this.childEntitiesLayer.eachLayer(layer => {
          const lId = String(layer.entityId || layer.sectorId || "").toLowerCase();
          const targetId = String(id).toLowerCase();
          if (lId && (lId === targetId || lId.includes(targetId) || targetId.includes(lId))) {
            layer.setStyle({
              color: hexColor,
              fillColor: hexColor
            });
          }
        });
      }

      document.querySelectorAll(`[data-entity-id="${id}"] .entity-badge-color, [data-sector-id="${id}"] .entity-badge-color`).forEach(el => {
        el.style.backgroundColor = hexColor;
      });
    }
  }

  openColorStudio(tab = null) {
    if (!this.colorStudio) {
      this.initColorStudio();
    }
    if (this.colorStudio) {
      this.colorStudio.open(tab);
    }
  }

  initMap() {
    // Canvas acelerado por GPU
    const canvasRenderer = L.canvas({ padding: 0.5 });

    // Satélite Google Híbrido HD
    const googleHybrid = L.tileLayer(
      "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
      { maxZoom: 21, maxNativeZoom: 20, attribution: "" }
    );

    // Plano Cartográfico Google (Calles, avenidas, urbanizaciones y manzanas)
    const googleRoadmap = L.tileLayer(
      "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      { maxZoom: 21, maxNativeZoom: 20, attribution: "" }
    );

    this.baseLayers = {
      satelite: googleHybrid,
      plano: googleRoadmap
    };

    let savedBasemap = "satelite";
    try {
      savedBasemap = localStorage.getItem("migato_lamina_basemap") || "satelite";
      if (!this.baseLayers[savedBasemap]) savedBasemap = "satelite";
    } catch (e) {
      savedBasemap = "satelite";
    }
    this.currentBaseLayer = savedBasemap;

    // Inicializar centrado geométrico en el Estado Monagas con límites seguros de zoom
    this.map = L.map("map-lamina", {
      center: [9.60, -63.15],
      zoom: 9,
      minZoom: 7,
      maxZoom: 21,
      preferCanvas: true,
      renderer: canvasRenderer,
      zoomControl: false,
      attributionControl: false,
      layers: [this.baseLayers[savedBasemap]]
    });

    // Control de zoom discreto abajo a la izquierda
    L.control.zoom({ position: "bottomleft" }).addTo(this.map);

    // Pane exclusivo para el Velo Blanco exterior (z-index 450, no intercepta clics del usuario)
    this.map.createPane("spotlightPane");
    const spPane = this.map.getPane("spotlightPane");
    if (spPane) {
      spPane.style.zIndex = "450";
      spPane.style.pointerEvents = "none";
    }

    this.spotlightRenderer = L.svg({ pane: "spotlightPane", padding: 0.5 }).addTo(this.map);
    if (this.spotlightRenderer && this.spotlightRenderer._container) {
      this.spotlightRenderer._container.style.pointerEvents = "none";
    }

    // Inicializar grupos de capas
    this.maskLayer = L.layerGroup().addTo(this.map);
    this.boundaryLayer = L.layerGroup().addTo(this.map);
    this.childEntitiesLayer = L.layerGroup().addTo(this.map);
    this.centrosLayer = L.layerGroup().addTo(this.map);

    window.addEventListener("resize", () => {
      if (this.map) {
        this.map.invalidateSize();
        this.reframeCurrentEntity(false);
      }
    });
  }

  /**
   * Margen Asimétrico para centrar perfectamente el territorio
   * Deja espacio libre para el panel lateral derecho (384px) y cabecera superior (80px)
   */
  getVisibleBoundsPadding() {
    const sidePanel = document.getElementById("lamina-side-panel");
    const isMinimized = sidePanel && sidePanel.classList.contains("minimized");
    const isDesktop = window.innerWidth >= 1024;
    
    const rightPad = (isDesktop && !isMinimized) ? 400 : 35;
    const topPad = 85;
    const leftPad = 35;
    const bottomPad = 35;

    return {
      paddingTopLeft: [leftPad, topPad],
      paddingBottomRight: [rightPad, bottomPad]
    };
  }

  safeFitBounds(bounds, animate = true) {
    if (!bounds || !this.map) return;
    try {
      this.map.invalidateSize();
      const pad = this.getVisibleBoundsPadding();
      const mapSize = this.map.getSize();

      // Si el contenedor aún no tiene dimensiones mínimas en el DOM, esperar al siguiente ciclo
      if (!mapSize || mapSize.x < 100 || mapSize.y < 100) {
        setTimeout(() => this.safeFitBounds(bounds, animate), 100);
        return;
      }

      // Asegurar que los márgenes no superen el tamaño de la ventana
      const safeLeft = Math.min(pad.paddingTopLeft[0], Math.floor(mapSize.x * 0.08));
      const safeTop = Math.min(pad.paddingTopLeft[1], Math.floor(mapSize.y * 0.12));
      const safeRight = Math.min(pad.paddingBottomRight[0], Math.floor(mapSize.x * 0.32));
      const safeBottom = Math.min(pad.paddingBottomRight[1], Math.floor(mapSize.y * 0.08));

      const finalPaddingTopLeft = [safeLeft, safeTop];
      const finalPaddingBottomRight = [safeRight, safeBottom];

      if (animate) {
        this.map.flyToBounds(bounds, {
          paddingTopLeft: finalPaddingTopLeft,
          paddingBottomRight: finalPaddingBottomRight,
          duration: 0.65,
          easeLinearity: 0.25
        });
      } else {
        this.map.fitBounds(bounds, {
          paddingTopLeft: finalPaddingTopLeft,
          paddingBottomRight: finalPaddingBottomRight,
          animate: false
        });
      }
    } catch (e) {
      console.warn("[LaminaApp] Error ajustando encuadre de mapa:", e);
      try {
        this.map.fitBounds(bounds, { animate: false });
      } catch (err2) {}
    }
  }

  reframeCurrentEntity(animate = true) {
    if (this.level === "estado") {
      this.safeFitBounds(BOUNDS_ESTADO_MONAGAS, animate);
    } else if (this.level === "municipio" && this.activeMunId) {
      const cleanMunId = String(this.activeMunId).toLowerCase().replace(/_/g, "-").trim();
      const feat = (GEO_MUNICIPIOS_OFICIAL.features || []).find(f => {
        const id = String(f.properties?.id || f.properties?.ADM2_ES || "").toLowerCase().replace(/_/g, "-").trim();
        return id === cleanMunId || id.includes(cleanMunId) || cleanMunId.includes(id);
      });
      if (feat) this.safeFitBounds(L.geoJSON(feat).getBounds(), animate);
    } else if (this.currentParishBounds) {
      this.safeFitBounds(this.currentParishBounds, animate);
    }
  }

  parseURLParams(isInitial = false) {
    const params = new URLSearchParams(window.location.search);
    const bm = params.get("basemap") || params.get("mapa");
    if (bm && (bm === "plano" || bm === "satelite")) {
      this.setBaseMapType(bm);
    }

    const m = params.get("m");
    const p = params.get("p");
    const sp = params.get("sp");
    const sec = params.get("sec");

    const animate = !isInitial;

    if (sec) {
      this.selectSector(sec, p, m || "maturin", animate);
    } else if (sp) {
      this.selectSubParroquia(sp, p, m || "maturin", animate);
    } else if (p) {
      this.selectParroquia(p, m || "maturin", animate);
    } else if (m) {
      this.selectMunicipio(m, animate);
    } else {
      // Abre directamente el Estado Monagas oficial (13 Municipios) con el Velo Blanco
      this.selectEstado(animate);
    }

    if (params.get("colores") === "1" || params.get("color_studio") === "1") {
      const tabParam = params.get("tab");
      setTimeout(() => this.openColorStudio(tabParam), 400);
    }
  }

  initUIListeners() {
    window.laminaApp = this;

    // Navegación por pestañas: [ Datos | Comando | Leyenda ]
    const tabStats = document.getElementById("tab-btn-stats");
    const tabComando = document.getElementById("tab-btn-comando");
    const tabSymbols = document.getElementById("tab-btn-symbols");

    if (tabStats) tabStats.addEventListener("click", () => this.switchTab("stats"));
    if (tabComando) tabComando.addEventListener("click", () => this.switchTab("comando"));
    if (tabSymbols) tabSymbols.addEventListener("click", () => this.switchTab("symbols"));

    // Botón Minimizar / Expandir panel
    const btnMin = document.getElementById("btn-toggle-minimize-panel");
    if (btnMin) {
      btnMin.addEventListener("click", () => {
        const p = document.getElementById("lamina-side-panel");
        if (p) {
          p.classList.toggle("minimized");
          setTimeout(() => {
            if (this.map) this.map.invalidateSize();
            this.reframeCurrentEntity(true);
          }, 200);
        }
      });
    }

    // Botón Pantalla Completa
    const btnFull = document.getElementById("btn-fullscreen");
    if (btnFull) {
      btnFull.addEventListener("click", () => this.toggleFullscreen());
    }

    // Adaptación automática para Impresión y Exportación a PDF en orientación vertical
    window.addEventListener("beforeprint", () => {
      document.body.classList.add("printing-mode");
      if (this.map) {
        setTimeout(() => this.map.invalidateSize(), 50);
      }
    });
    window.addEventListener("afterprint", () => {
      document.body.classList.remove("printing-mode");
      if (this.map) {
        setTimeout(() => this.map.invalidateSize(), 100);
      }
    });

    // Modal de Asignación Directa de Responsable Territorial
    const btnOpenAsignar = document.getElementById("btn-open-asignar-modal");
    if (btnOpenAsignar) {
      btnOpenAsignar.addEventListener("click", () => {
        const currentId = this.activeSectorId || this.activeSubParishId || this.activeParishId || this.activeMunId;
        const currentName = document.getElementById("comando-nombre-label")?.textContent || currentId;
        this.openAsignarModal(currentId, currentName, this.activeParishId);
      });
    }

    const btnCloseModal = document.getElementById("btn-close-modal-asignar");
    const btnCancelModal = document.getElementById("btn-cancel-asignar");
    if (btnCloseModal) btnCloseModal.addEventListener("click", () => this.closeAsignarModal());
    if (btnCancelModal) btnCancelModal.addEventListener("click", () => this.closeAsignarModal());

    const formAsignar = document.getElementById("form-asignar-comando");
    if (formAsignar) {
      formAsignar.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSaveAsignacion();
      });
    }

    const inputAsignarNombre = document.getElementById("input-asignar-nombre");
    if (inputAsignarNombre) {
      inputAsignarNombre.addEventListener("input", () => {
        const val = inputAsignarNombre.value.trim().toLowerCase();
        if (!val) return;
        const pool = getLeaderPool();
        const match = pool.find(d => d.nombre.trim().toLowerCase() === val || (d.cedula && d.cedula.toLowerCase() === val));
        if (match) {
          const inputTelf = document.getElementById("input-asignar-telefono");
          const inputCargo = document.getElementById("input-asignar-cargo");
          const inputProf = document.getElementById("input-asignar-profesion");
          if (inputTelf) inputTelf.value = match.telefono || "";
          if (inputCargo && match.cargo) inputCargo.value = match.cargo;
          if (inputProf) inputProf.value = match.profesion || match.cedula || "";
        }
      });
    }

    // Sincronización reactiva con asignaciones de comandos desde otras pestañas
    window.addEventListener("storage", (e) => {
      if (e.key === "migato_comandos_asignados") {
        this.refreshCurrentView();
      }
    });
    window.addEventListener("focus", () => {
      this.refreshCurrentView();
    });

    // Atajo de teclado para alternar capa base: Tecla 'M' (Satélite HD vs Plano Cartográfico)
    window.addEventListener("keydown", (e) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;
      if (e.key === "m" || e.key === "M") {
        this.toggleBaseMapType();
      }
    });
  }

  refreshCurrentView(animate = false) {
    if (this.level === "sector" && this.activeSectorId) {
      this.selectSector(this.activeSectorId, this.activeParishId, this.activeMunId, animate);
    } else if (this.level === "subparroquia" && this.activeSubParishId) {
      this.selectSubParroquia(this.activeSubParishId, this.activeParishId, this.activeMunId, animate);
    } else if (this.level === "parroquia" && this.activeParishId) {
      this.selectParroquia(this.activeParishId, this.activeMunId, animate);
    } else if (this.level === "municipio" && this.activeMunId) {
      this.selectMunicipio(this.activeMunId, animate);
    } else {
      this.selectEstado(animate);
    }
  }

  openAsignarModal(entityId, entityName = "", parroquiaId = "") {
    const modal = document.getElementById("modal-asignar-comando");
    if (!modal) return;

    // Poblar datalist del pool de dirigentes
    const datalist = document.getElementById("datalist-pool-dirigentes");
    if (datalist) {
      const pool = getLeaderPool();
      datalist.innerHTML = "";
      pool.forEach(d => {
        const opt = document.createElement("option");
        opt.value = d.nombre;
        opt.textContent = `${d.cedula ? d.cedula + ' • ' : ''}${d.cargo || 'Dirigente'}`;
        datalist.appendChild(opt);
      });
    }

    const targetId = entityId || this.activeSectorId || this.activeSubParishId || this.activeParishId || this.activeMunId || "eje-1";
    const targetPId = parroquiaId || this.activeParishId || "alto-de-los-godos";
    const titleEl = document.getElementById("modal-asignar-title");
    const subEl = document.getElementById("modal-asignar-subtitle");
    const inputId = document.getElementById("input-asignar-id");
    const inputPId = document.getElementById("input-asignar-parroquia");
    const inputNombre = document.getElementById("input-asignar-nombre");
    const inputTelf = document.getElementById("input-asignar-telefono");
    const inputCargo = document.getElementById("input-asignar-cargo");
    const inputProf = document.getElementById("input-asignar-profesion");

    if (inputId) inputId.value = targetId;
    if (inputPId) inputPId.value = targetPId;

    const displayName = entityName || targetId;
    if (titleEl) titleEl.textContent = `Asignar Comando Gatero: ${displayName}`;
    if (subEl) subEl.textContent = `Red de Comandos Gateros MIGATO • ID: ${targetId}`;

    // Cargar datos previos si existen
    const defaultCargo = (this.level === "estado" || targetId.startsWith("mun-")) ? "Jefe Gatero Municipal" : ((this.level === "municipio" || targetId.startsWith("parr-") || targetId.startsWith("par-")) ? "Gatero Parroquial" : "Jefe Gatero Estatal");
    const prevAssigned = getAssignedLeader(targetId);
    if (prevAssigned) {
      if (inputNombre) inputNombre.value = prevAssigned.nombre || "";
      if (inputTelf) inputTelf.value = prevAssigned.telefono || "";
      if (inputCargo) inputCargo.value = prevAssigned.cargo || prevAssigned.rol || defaultCargo;
      if (inputProf) inputProf.value = prevAssigned.profesion || prevAssigned.cedula || "";
    } else {
      const info = getComandoInfo(this.level, targetId, targetPId, this.activeMunId);
      if (inputNombre) inputNombre.value = (info && info.general && !info.general.includes("Vacante") && !info.general.includes("Sin Asignar")) ? info.general : "";
      if (inputTelf) inputTelf.value = (info && info.telefono && !info.telefono.includes("0000")) ? info.telefono : "";
      if (inputCargo) inputCargo.value = defaultCargo;
      if (inputProf) inputProf.value = "";
    }

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    if (inputNombre) inputNombre.focus();
  }

  closeAsignarModal() {
    const modal = document.getElementById("modal-asignar-comando");
    if (!modal) return;
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }

  handleSaveAsignacion() {
    const id = document.getElementById("input-asignar-id")?.value;
    const pId = document.getElementById("input-asignar-parroquia")?.value;
    const nombre = document.getElementById("input-asignar-nombre")?.value?.trim();
    const telefono = document.getElementById("input-asignar-telefono")?.value?.trim();
    const cargo = document.getElementById("input-asignar-cargo")?.value;
    const profesion = document.getElementById("input-asignar-profesion")?.value?.trim();

    if (!id || !nombre) {
      alert("Por favor ingrese el nombre del responsable.");
      return;
    }

    const payload = {
      nombre,
      telefono,
      cargo,
      profesion,
      parroquiaId: pId
    };

    saveAssignedComando(id, payload);
    auditLogger.logEvent("ASIGNACION_COMANDO_TERRITORIAL", { id, payload });

    this.closeAsignarModal();

    // Refrescar vistas en vivo
    this.renderComandoSection();
    this.renderSymbolsSection();
    if (this.level === "parroquia") {
      this.selectParroquia(this.activeParishId, this.activeMunId);
    } else if (this.level === "subparroquia") {
      this.selectSubParroquia(this.activeSubParishId, this.activeParishId, this.activeMunId);
    } else if (this.level === "sector") {
      this.selectSector(this.activeSectorId, this.activeParishId, this.activeMunId);
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn("Fullscreen request error:", err);
      });
    } else {
      document.exitFullscreen().catch(err => {});
    }
  }

  /* ========================================================================
     SELECTOR DE CAPA BASE: SATÉLITE HD VS PLANO CARTOGRÁFICO
     ======================================================================== */

  setBaseMapType(type) {
    if (!this.map || !this.baseLayers || !this.baseLayers[type]) return;
    if (type === this.currentBaseLayer && this.map.hasLayer(this.baseLayers[type])) {
      this.updateBaseMapUI();
      return;
    }

    const oldLayer = this.baseLayers[this.currentBaseLayer];
    const newLayer = this.baseLayers[type];

    if (oldLayer && this.map.hasLayer(oldLayer)) {
      this.map.removeLayer(oldLayer);
    }
    if (newLayer && !this.map.hasLayer(newLayer)) {
      newLayer.addTo(this.map);
      if (typeof newLayer.bringToBack === "function") {
        newLayer.bringToBack();
      }
    }

    this.currentBaseLayer = type;
    try {
      localStorage.setItem("migato_lamina_basemap", type);
    } catch (e) {}

    this.updateBaseMapUI();
  }

  toggleBaseMapType() {
    const next = this.currentBaseLayer === "satelite" ? "plano" : "satelite";
    this.setBaseMapType(next);
  }

  updateBaseMapUI() {
    const btnToggle = document.getElementById("btn-toggle-basemap");
    const iconEl = document.getElementById("icon-basemap-type");
    const txtEl = document.getElementById("txt-basemap-type");

    if (btnToggle && txtEl) {
      if (this.currentBaseLayer === "satelite") {
        txtEl.textContent = "Plano";
        btnToggle.setAttribute("title", "Cambiar a Plano Cartográfico (Tecla M)");
        btnToggle.className = "px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shrink-0 shadow-2xs";
        if (iconEl) {
          iconEl.setAttribute("data-lucide", "map");
          iconEl.setAttribute("class", "w-4 h-4 text-indigo-600");
        }
      } else {
        txtEl.textContent = "Satélite";
        btnToggle.setAttribute("title", "Cambiar a Satélite HD (Tecla M)");
        btnToggle.className = "px-2.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shrink-0 shadow-2xs";
        if (iconEl) {
          iconEl.setAttribute("data-lucide", "satellite");
          iconEl.setAttribute("class", "w-4 h-4 text-sky-600");
        }
      }
    }

    const btnSat = document.getElementById("btn-basemap-sat");
    const btnPlano = document.getElementById("btn-basemap-plano");
    if (btnSat && btnPlano) {
      if (this.currentBaseLayer === "satelite") {
        btnSat.classList.add("active");
        btnPlano.classList.remove("active");
      } else {
        btnPlano.classList.add("active");
        btnSat.classList.remove("active");
      }
    }

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  switchTab(tabName) {
    this.activeTab = tabName;
    const statsSec = document.getElementById("side-stats-section");
    const comandoSec = document.getElementById("side-comando-section");
    const symbolsSec = document.getElementById("side-symbols-section");

    const btnStats = document.getElementById("tab-btn-stats");
    const btnComando = document.getElementById("tab-btn-comando");
    const btnSymbols = document.getElementById("tab-btn-symbols");

    [btnStats, btnComando, btnSymbols].forEach(btn => {
      if (btn) {
        btn.classList.remove("active", "bg-white", "text-slate-950", "shadow-sm");
        btn.classList.add("text-slate-600");
      }
    });

    if (statsSec) statsSec.style.display = tabName === "stats" ? "flex" : "none";
    if (comandoSec) comandoSec.style.display = tabName === "comando" ? "flex" : "none";
    if (symbolsSec) symbolsSec.style.display = tabName === "symbols" ? "block" : "none";

    const activeBtn = tabName === "stats" ? btnStats : tabName === "comando" ? btnComando : btnSymbols;
    if (activeBtn) {
      activeBtn.classList.add("active", "bg-white", "text-slate-950", "shadow-sm");
      activeBtn.classList.remove("text-slate-600");
    }

    this.activeTab = tabName;
    if (tabName === "comando") {
      this.renderComandoSection();
    } else if (tabName === "symbols") {
      this.renderSymbolsSection();
    }

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  /**
   * Generador de Velo Blanco Matemático
   * Crea un polígono invertido con un agujero (donut) exactamente en la geometría dada
   */
  applySpotlightMask(rings, strokeColor = "#2563eb", strokeWeight = 3.5) {
    this.maskLayer.clearLayers();
    this.boundaryLayer.clearLayers();

    if (!rings || rings.length === 0) return;

    // Normalizar coordenadas a array de anillos [[lat, lng], ...]
    let normalizedRings = [];
    if (Array.isArray(rings[0]) && typeof rings[0][0] === "number") {
      // Es un solo anillo: [[lat, lng], [lat, lng], ...]
      normalizedRings = [rings];
    } else if (Array.isArray(rings[0]) && Array.isArray(rings[0][0])) {
      // Es un conjunto de anillos
      normalizedRings = rings;
    }

    if (!normalizedRings || normalizedRings.length === 0) return;

    // 1. Velo Blanco Matemático Invertido (Donut Mask con fillRule: 'evenodd')
    // Cubre todo el exterior con blanco (#ffffff) para aislar el territorio y evitar fatiga mental
    const maskCoords = [WORLD_BOX, ...normalizedRings];
    const maskPoly = L.polygon(maskCoords, {
      pane: "spotlightPane",
      fillColor: "#ffffff",
      fillOpacity: 1.0,
      color: "#ffffff",
      weight: 1.5,
      opacity: 1.0,
      fillRule: "evenodd",
      interactive: false,
      renderer: this.spotlightRenderer
    });
    this.maskLayer.addLayer(maskPoly);

    // 2. Línea delimitadora nítida en el perímetro del territorio abierto
    normalizedRings.forEach(ring => {
      const bPoly = L.polygon(ring, {
        pane: "spotlightPane",
        color: strokeColor,
        weight: strokeWeight,
        opacity: 0.98,
        fill: false,
        dashArray: "6, 4",
        interactive: false,
        renderer: this.spotlightRenderer
      });
      this.boundaryLayer.addLayer(bPoly);
    });
  }

  // Helper para convertir coordenadas GeoJSON [lng, lat] a Leaflet [lat, lng]
  geoJsonCoordsToLeaflet(geometry) {
    if (!geometry || !geometry.coordinates) return [];
    const type = geometry.type;
    const coords = geometry.coordinates;

    if (type === "Polygon") {
      // coords: [ ring1, ring2, ... ]
      return coords[0].map(pt => [pt[1], pt[0]]);
    } else if (type === "MultiPolygon") {
      // coords: [ [ring1], [ring2] ]
      return coords.map(poly => poly[0].map(pt => [pt[1], pt[0]]));
    }
    return [];
  }

  /* ========================================================================
     NAVEGACIÓN MULTINIVEL (ESTADO -> MUNICIPIO -> PARROQUIA -> EJE -> SECTOR)
     ======================================================================== */

  // 1. NIVEL ESTADO MONAGAS
  selectEstado(animate = true) {
    if (this.whiteboard && this.whiteboard.isActive && this.whiteboard.currentTool !== "pan") {
      return;
    }
    this.level = "estado";
    this.activeMunId = null;
    this.activeParishId = null;
    this.activeSubParishId = null;
    this.activeSectorId = null;
    this.currentParishBounds = null;
    this.currentParishRings = null;

    try {
      const feat = GEO_ESTADO_OFICIAL.features ? GEO_ESTADO_OFICIAL.features[0] : GEO_ESTADO_OFICIAL;
      const rings = this.geoJsonCoordsToLeaflet(feat.geometry);

      this.applySpotlightMask(rings, "#2563eb", 4);
      if (this.childEntitiesLayer) this.childEntitiesLayer.clearLayers();
      if (this.centrosLayer) this.centrosLayer.clearLayers();

      // Dibujar los 13 Municipios en el canvas con colores diferenciados y tooltips informativos
      (GEO_MUNICIPIOS_OFICIAL.features || []).forEach(f => {
        const mId = f.properties?.id;
        const munColor = this.getMunicipalityColor(mId);
        const mName = f.properties?.nombre || "Municipio";
        const munObj = (CATALOGO_MONAGAS || []).find(m => m.id === mId);
        const parishCount = (munObj?.parroquias || []).length || 0;

        const op = this.polygonOpacity || 0.26;
        const layer = L.geoJSON(f, {
          style: {
            color: "#ffffff",
            weight: 2,
            opacity: 0.95,
            fillColor: munColor,
            fillOpacity: op
          }
        });
        layer.entityId = mId;
        layer.entityType = "municipio";

        layer.on({
          mouseover: () => layer.setStyle({ weight: 3, color: "#ffffff", fillOpacity: Math.min(0.55, op + 0.18) }),
          mouseout: () => layer.setStyle({ weight: 2, color: "#ffffff", fillOpacity: this.polygonOpacity || 0.26 }),
          click: () => this.selectMunicipio(mId)
        });

        layer.bindTooltip(`
          <div style="font-family: inherit; font-size: 11px; padding: 2px;">
            <span style="color: #64748b; font-weight: 800; font-size: 9px; text-transform: uppercase;">Municipio Oficial</span><br>
            <strong style="color: #0f172a; font-size: 12px; font-weight: 900;">MUNICIPIO ${mName.toUpperCase()}</strong><br>
            <span style="color: ${munColor}; font-size: 10px; font-weight: 700;">${parishCount} Parroquias</span>
          </div>
        `, { sticky: true, opacity: 0.95 });

        this.childEntitiesLayer.addLayer(layer);
      });

      this.safeFitBounds(BOUNDS_ESTADO_MONAGAS, animate);
    } catch (err) {
      console.error("[LaminaApp] Error renderizando municipios en selectEstado:", err);
    }

    this.updateHeaderUI("ESTADO MONAGAS", "13 MUNICIPIOS • SALA SITUACIONAL");
    this.renderSideStats({
      title: "ESTADO MONAGAS",
      color: "#2563eb",
      type: "Resumen Estadal Oficial",
      sub: "13 Municipios • 44 Parroquias",
      code: "13 MUNICIPIOS",
      hab: "1.020.000",
      vot: "678.920",
      cen: "536",
      cas: "44 Parroquias",
      casLabel: "Parroquias CNE",
      listTitle: "Municipios (Clic para enfocar)",
      listCount: (GEO_MUNICIPIOS_OFICIAL.features || []).length,
      items: (CATALOGO_MONAGAS || []).map(m => {
        const color = this.getMunicipalityColor(m.id);
        return {
          id: m.id,
          nombre: m.nombre,
          color: color,
          badge: `${(m.parroquias || []).length} parr.`,
          onClick: `laminaApp.selectMunicipio('${m.id}')`
        };
      })
    });
    this.renderComandoSection();
    this.renderSymbolsSection();
    this.updateBreadcrumbs();
    try {
      auditLogger.logEvent("SELECCION_ESTADO", { entidad: "Estado Monagas" });
    } catch (e) {}
  }

  // 2. NIVEL MUNICIPIO (MATURÍN, PIAR, CEDEÑO, ETC.)
  selectMunicipio(munId = "maturin", animate = true) {
    if (this.whiteboard && this.whiteboard.isActive && this.whiteboard.currentTool !== "pan") {
      return;
    }
    this.level = "municipio";
    this.activeMunId = munId;
    this.activeParishId = null;
    this.activeSubParishId = null;
    this.activeSectorId = null;
    this.currentParishBounds = null;
    this.currentParishRings = null;

    const cleanMunId = String(munId).toLowerCase().replace(/_/g, "-").trim();
    const feat = (GEO_MUNICIPIOS_OFICIAL.features || []).find(f => {
      const id = String(f.properties?.id || f.properties?.ADM2_ES || "").toLowerCase().replace(/_/g, "-").trim();
      return id === cleanMunId || id.includes(cleanMunId) || cleanMunId.includes(id);
    });

    const munObj = CATALOGO_MONAGAS.find(m => m.id === cleanMunId) || { id: "maturin", nombre: "Maturín", color: "#2563eb", parroquias: [] };
    const rawMunName = munObj.nombre || "Maturín";
    const cleanMunName = rawMunName.replace(/^municipio\s+/i, '').trim();
    const munColor = this.getMunicipalityColor(cleanMunId);

    const rings = feat ? this.geoJsonCoordsToLeaflet(feat.geometry) : [];
    this.applySpotlightMask(rings, munColor, 3.5);
    this.childEntitiesLayer.clearLayers();
    this.centrosLayer.clearLayers();

    // Renderizar las Parroquias oficiales de este municipio
    const parishFeats = (GEO_PARROQUIAS_OFICIAL.features || []).filter(f => {
      const fMun = String(f.properties?.municipioId || f.properties?.ADM2_ES || "maturin").toLowerCase().replace(/_/g, "-").trim();
      return fMun === cleanMunId || fMun.includes(cleanMunId) || cleanMunId.includes(fMun);
    });

    parishFeats.forEach(f => {
      const pId = f.properties?.id;
      const resolvedPId = resolveParishId(pId);
      const pColor = this.getParishColor(resolvedPId, cleanMunId);
      const pName = f.properties?.nombre || "Parroquia";

      const op = this.polygonOpacity || 0.26;
      const layer = L.geoJSON(f, {
        style: {
          color: "#ffffff",
          weight: 2,
          opacity: 0.95,
          fillColor: pColor,
          fillOpacity: op
        }
      });
      layer.entityId = resolvedPId;
      layer.entityType = "parroquia";

      layer.on({
        mouseover: () => {
          layer.setStyle({ weight: 3, color: "#ffffff", fillOpacity: Math.min(0.55, op + 0.18) });
        },
        mouseout: () => {
          layer.setStyle({ weight: 2, color: "#ffffff", fillOpacity: this.polygonOpacity || 0.26 });
        },
        click: () => {
          this.selectParroquia(pId, cleanMunId);
        }
      });
      this.childEntitiesLayer.addLayer(layer);

      layer.bindTooltip(`
        <div style="font-family: inherit; font-size: 11px; padding: 2px;">
          <span style="color: #64748b; font-weight: 800; font-size: 9px; text-transform: uppercase;">Parroquia Oficial</span><br>
          <strong style="color: #0f172a; font-size: 12px; font-weight: 900;">${pName.toUpperCase()}</strong>
        </div>
      `, { sticky: true, opacity: 0.95 });
    });

    const bounds = feat ? L.geoJSON(feat).getBounds() : (rings.length ? (Array.isArray(rings[0][0]) ? L.polygon(rings[0]).getBounds() : L.polygon(rings).getBounds()) : null);
    this.safeFitBounds(bounds, animate);

    const munDem = getMunicipioDemographics(cleanMunId) || {};
    const habFormatted = munDem.habitantes ? Number(munDem.habitantes).toLocaleString("es-VE") : (cleanMunId === "maturin" ? "547.014" : "—");
    const votFormatted = munDem.votantes ? Number(munDem.votantes).toLocaleString("es-VE") : (cleanMunId === "maturin" ? "402.085" : "—");
    const cenFormatted = munDem.centros ? Number(munDem.centros).toLocaleString("es-VE") : (cleanMunId === "maturin" ? "175" : "—");
    const parishCount = (munObj.parroquias || []).length;
    const casFormatted = `${parishCount} Parroquias`;

    this.updateHeaderUI(`MUNICIPIO ${cleanMunName.toUpperCase()}`, `ESTADO MONAGAS • ${parishCount} PARROQUIAS OFICIALES`);
    this.renderSideStats({
      title: `MUNICIPIO ${cleanMunName.toUpperCase()}`,
      color: munColor,
      type: "Resumen Municipal Oficial",
      sub: `Estado Monagas • ${parishCount} Parroquias`,
      code: `${parishCount} PARROQUIAS`,
      hab: habFormatted,
      vot: votFormatted,
      cen: cenFormatted,
      cas: casFormatted,
      casLabel: "Parroquias CNE",
      listTitle: "Parroquias (Clic para enfocar)",
      listCount: (munObj.parroquias || []).length,
      backBtn: {
        label: "Ver todo el Estado Monagas",
        count: "13",
        onClick: "laminaApp.selectEstado()"
      },
      items: (munObj.parroquias || []).map(p => {
        const resolvedPId = resolveParishId(p.id);
        const pColor = this.getParishColor(resolvedPId, cleanMunId);
        return {
          id: resolvedPId,
          nombre: p.nombre,
          color: pColor,
          badge: "Parroquia",
          onClick: `laminaApp.selectParroquia('${p.id}', '${cleanMunId}')`
        };
      })
    });
    this.renderComandoSection();
    this.renderSymbolsSection();
    this.updateBreadcrumbs();
    try {
      auditLogger.logEvent("SELECCION_MUNICIPIO", { municipioId: cleanMunId, nombre: munObj.nombre });
    } catch (e) {}
  }

  /**
   * Obtiene las subparroquias y polígonos comunitarios idénticos al Módulo 4 (Earth Monagas)
   * 1. Consulta primero el almacenamiento local de Módulo 4 (earth_monagas_places_v10_prod)
   * 2. Si no hay datos en caché local, carga los catálogos nativos completos de Módulo 4:
   *    - SUBPARROQUIAS_MONAGAS / SUBPARROQUIAS_GODOS (Alto de Los Godos • La Puente)
   *    - MONAGAS_TERRITORIO_COMPLETO (San Simón • Casco, Palo Negro, La Muralla y municipios)
   *    - SECTORES_LAPUENTE (18 sectores comunitarios reales con polígono)
   */
  getParishPolygonsData(munId, parishId) {
    const cleanMunId = String(munId || "maturin").toLowerCase().replace(/_/g, "-").trim();
    const cleanPId = String(parishId || "alto-de-los-godos").toLowerCase().replace(/_/g, "-").trim();
    const resolvedPId = resolveParishId(cleanPId);

    let subparroquias = [];
    let poligonos = [];

    // 1. Cargar desde el almacenamiento de Módulo 4 (Earth Monagas) si el usuario ya tiene datos locales
    try {
      const raw = localStorage.getItem("earth_monagas_places_v10_prod");
      if (raw) {
        const state = JSON.parse(raw);
        const mun = state.municipios?.[cleanMunId];
        const p = mun?.parroquias?.[resolvedPId] || mun?.parroquias?.[cleanPId];
        if (p) {
          if (Array.isArray(p.subparroquias) && p.subparroquias.length > 0) {
            subparroquias = p.subparroquias.filter(sp => (sp.vertices || sp.poligono) && (sp.vertices || sp.poligono).length >= 3);
          }
          if (Array.isArray(p.poligonos) && p.poligonos.length > 0) {
            poligonos = p.poligonos.filter(sec => (sec.vertices || sec.poligono) && (sec.vertices || sec.poligono).length >= 3);
          }
        }
      }
    } catch (e) {
      console.warn("[LaminaApp] Error leyendo datos locales de Módulo 4:", e);
    }

    // 2. Si no hay en localStorage, usar los polígonos nativos del Módulo 4
    if (resolvedPId === "alto-de-los-godos") {
      // Filtrar cualquier residuo sintético: Solo la Sub-Parroquia 6 (La Puente) es oficial
      subparroquias = subparroquias.filter(sp => {
        const id = String(sp.id || "").toLowerCase();
        const nom = String(sp.nombre || "").toLowerCase();
        return id === "subpar-1788965549962" || id === "sub-godos-6" || id === "sub-godos-lapuente" || nom.includes("puente") || nom.includes("parroquia 6");
      });

      if (subparroquias.length === 0) {
        // Cargar el único eje oficial digitalizado de Alto de los Godos: Sub-Parroquia 6 La Puente
        subparroquias = (SUBPARROQUIAS_GODOS || []).map(sp => ({
          id: sp.id,
          nombre: sp.nombre,
          alias: sp.alias || sp.nombre,
          colorBorde: sp.colorBorde || "#c084fc",
          colorRelleno: sp.colorRelleno || "#a855f7",
          anchoBorde: 2.5,
          vertices: sp.vertices || sp.poligono,
          sectoresCount: sp.sectoresCount || 18
        }));
      }

      if (poligonos.length === 0) {
        // Cargar los sectores comunitarios reales de La Puente de Módulo 4
        poligonos = (SECTORES_LAPUENTE || []).map(sec => ({
          ...sec,
          subParroquiaId: "sub-godos-6",
          vertices: sec.vertices || sec.poligono
        }));
      }
    } else {
      // Fallback a MONAGAS_TERRITORIO_COMPLETO para San Simón y el resto de parroquias
      const munObj = (MONAGAS_TERRITORIO_COMPLETO || []).find(m => {
        const mId = String(m.id || "").toLowerCase().replace(/_/g, "-");
        return mId === cleanMunId || (cleanMunId.includes("maturin") && mId === "maturin");
      });

      if (munObj && Array.isArray(munObj.parroquias)) {
        const pObj = munObj.parroquias.find(p => {
          const pId = String(p.id || "").toLowerCase().replace(/_/g, "-");
          return pId === cleanPId || pId === resolvedPId || resolveParishId(pId) === resolvedPId;
        });

        if (pObj) {
          if (subparroquias.length === 0 && Array.isArray(pObj.subparroquias) && pObj.subparroquias.length > 0) {
            subparroquias = pObj.subparroquias.map(sp => ({
              id: sp.id,
              nombre: sp.nombre,
              alias: sp.alias || sp.nombre,
              codigo: sp.codigo || "",
              colorBorde: sp.colorBorde || "#7c3aed",
              colorRelleno: sp.colorRelleno || "#a855f7",
              anchoBorde: sp.anchoBorde || 2.5,
              vertices: sp.vertices || sp.poligono || [],
              sectoresCount: Array.isArray(sp.sectores) ? sp.sectores.length : 0
            }));
          }

          if (poligonos.length === 0) {
            const allSecs = [];
            if (Array.isArray(pObj.subparroquias)) {
              pObj.subparroquias.forEach(sp => {
                if (Array.isArray(sp.sectores)) {
                  sp.sectores.forEach(sec => {
                    allSecs.push({
                      ...sec,
                      subParroquiaId: sp.id,
                      vertices: sec.vertices || sec.poligono || []
                    });
                  });
                }
              });
            }
            if (Array.isArray(pObj.sectores)) {
              pObj.sectores.forEach(sec => {
                allSecs.push({
                  ...sec,
                  vertices: sec.vertices || sec.poligono || []
                });
              });
            }
            if (allSecs.length > 0) {
              poligonos = allSecs;
            }
          }
        }
      }
    }

    // 3. Validación y filtrado geográfico estricto contra la frontera oficial de la parroquia
    const pFeat = (GEO_PARROQUIAS_OFICIAL.features || []).find(f => {
      const id = String(f.properties?.id || "").toLowerCase().replace(/_/g, "-").trim();
      return id === cleanPId || id === resolvedPId || resolveParishId(id) === resolvedPId;
    });

    let pBounds = null;
    if (pFeat) {
      try {
        pBounds = L.geoJSON(pFeat).getBounds();
      } catch (e) {}
    }

    const isInsideParish = (coords) => {
      if (!pBounds || !coords || coords.length < 3) return true;
      const avgLat = coords.reduce((sum, p) => sum + p[0], 0) / coords.length;
      const avgLng = coords.reduce((sum, p) => sum + p[1], 0) / coords.length;
      return pBounds.pad(0.08).contains([avgLat, avgLng]);
    };

    // Descartar subparroquias ficticias o cuyas coordenadas no caen en esta parroquia
    subparroquias = subparroquias.filter(sp => {
      const coords = sp.vertices || sp.poligono;
      return coords && coords.length >= 3 && isInsideParish(coords);
    });

    // En sectores, preservar el registro censal para el panel pero invalidar polígono en mapa si cae fuera
    poligonos = poligonos.map(sec => {
      const coords = sec.vertices || sec.poligono;
      const hasValid = coords && coords.length >= 3 && isInsideParish(coords);
      return {
        ...sec,
        hasValidPoly: hasValid,
        vertices: hasValid ? coords : null
      };
    });

    return { subparroquias, poligonos };
  }

  // 3. NIVEL PARROQUIA (ALTO DE LOS GODOS, LA PICA, SAN SIMÓN, ETC.)
  selectParroquia(parishId, munId = "maturin", animate = true) {
    if (this.whiteboard && this.whiteboard.isActive && this.whiteboard.currentTool !== "pan") {
      return;
    }
    this.level = "parroquia";
    this.activeMunId = munId;
    this.activeParishId = parishId;
    this.activeSubParishId = null;
    this.activeSectorId = null;
    this.activeSubParishName = null;
    this.activeSectorName = null;

    const cleanMunId = String(munId).toLowerCase().replace(/_/g, "-").trim();
    const cleanPId = String(parishId).toLowerCase().replace(/_/g, "-").trim();
    const resolvedPId = resolveParishId(cleanPId);
    const pColor = this.getParishColor(resolvedPId, cleanMunId);

    // Localizar geometría de la parroquia
    const feat = (GEO_PARROQUIAS_OFICIAL.features || []).find(f => {
      const id = String(f.properties?.id || "").toLowerCase().replace(/_/g, "-").trim();
      return id === cleanPId || id === resolvedPId || resolveParishId(id) === resolvedPId;
    });

    const rings = feat ? this.geoJsonCoordsToLeaflet(feat.geometry) : [];
    this.currentParishRings = rings;

    // APLICAR EL RECORTE EXACTO DEL VELO BLANCO A ESTA PARROQUIA
    this.applySpotlightMask(rings, pColor, 3.5);
    this.childEntitiesLayer.clearLayers();
    this.centrosLayer.clearLayers();

    // Dibujar el polígono de la parroquia activa con relleno sutil y borde nítido
    if (feat) {
      const pLayer = L.geoJSON(feat, {
        style: {
          color: pColor,
          weight: 2.8,
          opacity: 0.95,
          fillColor: pColor,
          fillOpacity: 0.15
        }
      });
      pLayer.entityId = resolvedPId;
      pLayer.entityType = "parroquia";
      this.childEntitiesLayer.addLayer(pLayer);
    }

    // Ajustar cámara a la parroquia con compensación asimétrica y respuesta suave
    const bounds = feat ? L.geoJSON(feat).getBounds() : (rings && rings.length > 0 ? (Array.isArray(rings[0][0]) ? L.polygon(rings[0]).getBounds() : L.polygon(rings).getBounds()) : null);
    this.currentParishBounds = bounds;
    this.safeFitBounds(bounds, animate);

    // Cargar y mostrar los Centros Electorales KML georreferenciados de esta parroquia
    this.renderCentrosVotacion(resolvedPId);

    const rawPName = feat?.properties?.nombre || (CATALOGO_MONAGAS.find(m => m.id === cleanMunId)?.parroquias || []).find(p => p.id === cleanPId)?.nombre || cleanPId;
    const cleanPName = formatTitleCase(rawPName);

    // Obtener subparroquias y sectores para el directorio lateral y el mapa
    const { subparroquias, poligonos } = this.getParishPolygonsData(cleanMunId, resolvedPId);

    // DIBUJAR LOS POLÍGONOS DE TODAS LAS SUBPARROQUIAS (EJES) EN EL MAPA
    if (subparroquias && subparroquias.length > 0) {
      subparroquias.forEach(sp => {
        const coords = sp.vertices || sp.poligono;
        if (coords && coords.length >= 3) {
          const spColor = this.getSectorColor(sp.id, sp.colorBorde || sp.color || "#8b5cf6");
          const spPoly = L.polygon(coords, {
            color: spColor,
            weight: 2.2,
            opacity: 0.95,
            fillColor: this.getSectorColor(sp.id, sp.colorRelleno || spColor),
            fillOpacity: 0.35,
            dashArray: "4, 4"
          });
          spPoly.entityId = sp.id;
          spPoly.sectorId = sp.id;
          spPoly.entityType = "subparroquia";

          spPoly.bindTooltip(`
            <div style="font-family: inherit; font-size: 11px; padding: 2px;">
              <span style="color: ${spColor}; font-weight: 800; font-size: 9.5px; text-transform: uppercase;">Sub-Parroquia / Eje</span><br>
              <strong style="color: #0f172a; font-size: 12px; font-weight: 900;">${formatTitleCase(sp.nombre)}</strong>
            </div>
          `, { sticky: true, opacity: 0.95 });

          spPoly.on({
            mouseover: () => spPoly.setStyle({ weight: 3.8, fillOpacity: 0.45 }),
            mouseout: () => spPoly.setStyle({ weight: 2.2, fillOpacity: 0.22 }),
            click: () => this.selectSubParroquia(sp.id, cleanPId, cleanMunId)
          });

          this.childEntitiesLayer.addLayer(spPoly);
        }
      });
    } else if (poligonos && poligonos.length > 0) {
      poligonos.forEach(sec => {
        const coords = sec.vertices || sec.poligono;
        if (sec.hasValidPoly !== false && coords && coords.length >= 3) {
          const sColor = this.getSectorColor(sec.id, sec.colorBorde || sec.color || "#0284c7");
          const secPoly = L.polygon(coords, {
            color: sColor,
            weight: 1.8,
            opacity: 0.9,
            fillColor: this.getSectorColor(sec.id, sec.colorRelleno || sColor),
            fillOpacity: 0.2,
            dashArray: "3, 3"
          });
          secPoly.entityId = sec.id;
          secPoly.sectorId = sec.id;
          secPoly.entityType = "sector";

          secPoly.bindTooltip(`
            <div style="font-family: inherit; font-size: 11px; padding: 2px;">
              <span style="color: #0284c7; font-weight: 800; font-size: 9.5px; text-transform: uppercase;">Sector Vecinal</span><br>
              <strong style="color: #0f172a; font-size: 12px; font-weight: 900;">${formatTitleCase(sec.nombre)}</strong>
            </div>
          `, { sticky: true, opacity: 0.95 });

          secPoly.on({
            mouseover: () => secPoly.setStyle({ weight: 3.2, fillOpacity: 0.4 }),
            mouseout: () => secPoly.setStyle({ weight: 1.8, fillOpacity: 0.2 }),
            click: () => this.selectSector(sec.id, cleanPId, cleanMunId)
          });

          this.childEntitiesLayer.addLayer(secPoly);
        }
      });
    }

    const munObj = CATALOGO_MONAGAS.find(m => m.id === cleanMunId) || { nombre: "Maturín", parroquias: [] };
    const rawMunName = munObj.nombre || "Maturín";
    const cleanMunName = rawMunName.replace(/^municipio\s+/i, '').trim();
    const totalParrs = (munObj.parroquias || []).length || 11;

    this.updateHeaderUI(`PARROQUIA ${cleanPName.toUpperCase()}`, `MUNICIPIO ${cleanMunName.toUpperCase()} • ESTADO MONAGAS`);
    
    // Preparar lista amigable de sectores/ejes para el panel lateral
    let listItems = [];
    if (subparroquias && subparroquias.length > 0) {
      listItems = subparroquias.map(sp => ({
        id: sp.id,
        nombre: sp.nombre,
        color: sp.colorBorde || pColor,
        badge: "Eje",
        onClick: `laminaApp.selectSubParroquia('${sp.id}', '${cleanPId}', '${cleanMunId}')`
      }));
    } else if (poligonos && poligonos.length > 0) {
      listItems = poligonos.map(sec => ({
        id: sec.id,
        nombre: formatTitleCase(sec.nombre),
        color: sec.colorBorde || pColor,
        badge: "Sector",
        onClick: `laminaApp.selectSector('${sec.id}', '${cleanPId}', '${cleanMunId}')`
      }));
    }

    const pDem = getParishDemographics(cleanMunId, cleanPId) || {};
    const pHab = pDem.habitantes ? Number(pDem.habitantes).toLocaleString("es-VE") : "52.340";
    const pVot = pDem.votantes ? Number(pDem.votantes).toLocaleString("es-VE") : "38.450";
    const pCen = pDem.centros ? Number(pDem.centros).toLocaleString("es-VE") : "18";
    const pSecFormatted = `${listItems.length} Sectores`;

    this.renderSideStats({
      title: cleanPName.toUpperCase(),
      color: pColor,
      type: "Parroquia Oficial",
      sub: `Municipio ${cleanMunName} • Estado Monagas`,
      code: "PARROQUIA",
      hab: pHab,
      vot: pVot,
      cen: pCen,
      cas: pSecFormatted,
      casLabel: "Sectores Oficiales",
      listTitle: subparroquias.length > 0 ? "Circuitos y Sectores" : "Sectores y Comunidades",
      listCount: listItems.length,
      backBtn: {
        label: `Ver todas las ${totalParrs} parroquias`,
        count: totalParrs,
        onClick: `laminaApp.selectMunicipio('${cleanMunId}')`
      },
      items: listItems
    });
    this.renderComandoSection();
    this.renderSymbolsSection();
    this.updateBreadcrumbs();
    try {
      auditLogger.logEvent("SELECCION_PARROQUIA", { parroquiaId: cleanPId, municipioId: cleanMunId, nombre: cleanPName });
    } catch (e) {}
  }

  // 4. NIVEL SUB-PARROQUIA / EJE TERRITORIAL (EL MAPA SE QUEDA EN ZOOM PARROQUIAL)
  selectSubParroquia(spId, parishId = "alto-de-los-godos", munId = "maturin", animate = true) {
    if (this.whiteboard && this.whiteboard.isActive && this.whiteboard.currentTool !== "pan") {
      return;
    }
    this.level = "subparroquia";
    this.activeMunId = munId;
    this.activeParishId = parishId;
    this.activeSubParishId = spId;
    this.activeSectorId = null;

    const cleanMunId = String(munId || "maturin").toLowerCase().replace(/_/g, "-").trim();
    const cleanPId = resolveParishId(parishId);
    const pColor = this.getParishColor(cleanPId, cleanMunId);

    this.childEntitiesLayer.clearLayers();
    this.centrosLayer.clearLayers();

    const { subparroquias, poligonos } = this.getParishPolygonsData(cleanMunId, cleanPId);

    // Buscar el eje
    const eje = subparroquias.find(e => String(e.id) === String(spId) || String(e.nombre).toLowerCase().includes(String(spId).toLowerCase())) || { id: spId, nombre: spId };
    this.activeSubParishName = eje.nombre;

    // Mantener el Velo Blanco delimitando la PARROQUIA
    if (!this.currentParishRings || this.currentParishRings.length === 0) {
      const feat = (GEO_PARROQUIAS_OFICIAL.features || []).find(f => {
        const id = String(f.properties?.id || "").toLowerCase().replace(/_/g, "-").trim();
        return id === cleanPId || resolveParishId(id) === cleanPId;
      });
      if (feat) {
        this.currentParishRings = this.geoJsonCoordsToLeaflet(feat.geometry);
      }
    }
    if (this.currentParishRings && this.currentParishRings.length > 0) {
      this.applySpotlightMask(this.currentParishRings, pColor, 3.5);
    }

    // Cámara adaptativa: no resetear el zoom bruscamente si el usuario está explorando en detalle
    const ejeCoords = eje.vertices || eje.poligono;
    if (this.map) {
      if (this.map.getZoom() < 13) {
        if (ejeCoords && ejeCoords.length >= 3) {
          this.safeFitBounds(L.latLngBounds(ejeCoords), animate);
        } else if (this.currentParishBounds) {
          this.safeFitBounds(this.currentParishBounds, animate);
        }
      } else if (eje.centro) {
        this.map.panTo(eje.centro, { animate: animate });
      }
    }

    // Centros de votación oficiales georreferenciados en la parroquia
    this.renderCentrosVotacion(cleanPId);

    // 1. DIBUJAR TODAS LAS SUBPARROQUIAS (LA SELECCIONADA DESTACADA, LAS DEMÁS DE FONDO)
    subparroquias.forEach(sp => {
      const coords = sp.vertices || sp.poligono;
      if (!coords || coords.length < 3) return;
      const isSelected = String(sp.id) === String(spId) || String(sp.nombre).toLowerCase() === String(eje.nombre).toLowerCase();
      if (isSelected) {
        const activeSpPoly = L.polygon(coords, {
          color: sp.colorBorde || "#7c3aed",
          weight: 3.5,
          opacity: 1,
          fillColor: sp.colorRelleno || "#a855f7",
          fillOpacity: 0.32
        });
        activeSpPoly.bindTooltip(`
          <div style="font-family: inherit; font-size: 11px; padding: 2px;">
            <span style="color: #7c3aed; font-weight: 800; font-size: 9.5px; text-transform: uppercase;">Eje Seleccionado</span><br>
            <strong style="color: #0f172a; font-size: 12px; font-weight: 900;">${formatTitleCase(sp.nombre)}</strong>
          </div>
        `, { sticky: true, opacity: 0.95 });
        this.childEntitiesLayer.addLayer(activeSpPoly);
      } else {
        const otherSpPoly = L.polygon(coords, {
          color: "#94a3b8",
          weight: 1.2,
          opacity: 0.65,
          fillColor: "#cbd5e1",
          fillOpacity: 0.08,
          dashArray: "3, 3"
        });
        otherSpPoly.bindTooltip(`
          <div style="font-family: inherit; font-size: 10px; padding: 2px;">
            <strong style="color: #475569;">${formatTitleCase(sp.nombre)}</strong>
          </div>
        `, { sticky: true, opacity: 0.9 });
        otherSpPoly.on("click", () => this.selectSubParroquia(sp.id, cleanPId, cleanMunId));
        this.childEntitiesLayer.addLayer(otherSpPoly);
      }
    });

    // 2. DIBUJAR ÚNICAMENTE LOS POLÍGONOS DE LOS SECTORES QUE PERTENECEN A ESTE EJE
    const isLaPuente = String(spId).toLowerCase().includes("puente") || String(spId).includes("6") || String(spId).includes("SUBPAR");
    const childSectores = poligonos.filter(p => {
      if (p.subParroquiaId && String(p.subParroquiaId) === String(spId)) return true;
      if (isLaPuente && (String(p.id).startsWith("POLY-") || p.subParroquiaId === "sub-godos-6" || !p.subParroquiaId)) return true;
      return false;
    });

    const sectoresToRender = childSectores;
    sectoresToRender.forEach(sec => {
      const sCoords = sec.vertices || sec.poligono;
      if (sec.hasValidPoly !== false && sCoords && sCoords.length >= 3) {
        const sColor = this.getSectorColor(sec.id, sec.colorBorde || sec.color || "#0284c7");
        const secPoly = L.polygon(sCoords, {
          color: sColor,
          weight: 1.8,
          opacity: 0.95,
          fillColor: this.getSectorColor(sec.id, sec.colorRelleno || sec.color || "#38bdf8"),
          fillOpacity: 0.28
        });
        secPoly.entityId = sec.id;
        secPoly.sectorId = sec.id;
        secPoly.entityType = "sector";
        secPoly.bindTooltip(`
          <div style="font-family: inherit; font-size: 11px; padding: 2px;">
            <span style="color: #0284c7; font-weight: 800; font-size: 9.5px; text-transform: uppercase;">Sector Vecinal</span><br>
            <strong style="color: #0f172a; font-size: 12px; font-weight: 900;">${formatTitleCase(sec.nombre)}</strong>
          </div>
        `, { sticky: true, opacity: 0.95 });
        secPoly.on({
          mouseover: () => secPoly.setStyle({ weight: 3.2, fillOpacity: 0.5 }),
          mouseout: () => secPoly.setStyle({ weight: 1.8, fillOpacity: 0.28 }),
          click: () => this.selectSector(sec.id, cleanPId, cleanMunId)
        });
        this.childEntitiesLayer.addLayer(secPoly);
      }
    });

    // Marcador central opcional
    if (eje.centro) {
      const ejeMarker = L.circleMarker(eje.centro, {
        radius: 7,
        fillColor: "#a855f7",
        fillOpacity: 0.95,
        color: "#ffffff",
        weight: 2
      });
      this.childEntitiesLayer.addLayer(ejeMarker);
    }

    const munObj = CATALOGO_MONAGAS.find(m => m.id === cleanMunId) || { nombre: "Maturín" };
    const rawMunName = munObj.nombre || "Maturín";
    const cleanMunName = rawMunName.replace(/^municipio\s+/i, '').trim();

    const cleanEjeTitle = formatTitleCase(eje.nombre).replace(/^sub\s*parroquia\s*/i, 'EJE ').trim();
    this.updateHeaderUI(`${cleanEjeTitle.toUpperCase()}`, `PARROQUIA ${cleanPName.toUpperCase()} • MUNICIPIO ${cleanMunName.toUpperCase()}`);

    const pDem = getParishDemographics(cleanMunId, cleanPId) || {};
    const totalEjes = Math.max(1, subparroquias.length || 1);
    const ejeHabVal = eje.habitantes || Math.round((pDem.habitantes || 50000) / totalEjes);
    const ejeVotVal = eje.votantes || Math.round((pDem.votantes || 35000) / totalEjes);
    const ejeCenVal = eje.centros || Math.max(1, Math.round((pDem.centros || 15) / totalEjes));
    const ejeSecFormatted = `${sectoresToRender.length} Sectores`;

    this.renderSideStats({
      title: formatTitleCase(eje.nombre).toUpperCase(),
      color: eje.colorBorde || "#a855f7",
      type: "Circuito Territorial",
      sub: `Parroquia ${cleanPName} • ${cleanMunName}`,
      code: "TERRITORIO",
      hab: Number(ejeHabVal).toLocaleString("es-VE"),
      vot: Number(ejeVotVal).toLocaleString("es-VE"),
      cen: Number(ejeCenVal).toLocaleString("es-VE"),
      cas: ejeSecFormatted,
      casLabel: "Sectores del Eje",
      listTitle: `Sectores de este Eje (${sectoresToRender.length})`,
      listCount: sectoresToRender.length,
      backBtn: {
        label: `Volver a Ejes de ${cleanPName}`,
        count: "⬅",
        onClick: `laminaApp.selectParroquia('${cleanPId}', '${cleanMunId}')`
      },
      items: sectoresToRender.map(s => ({
        id: s.id,
        nombre: formatTitleCase(s.nombre),
        color: s.colorBorde || "#38bdf8",
        badge: "Sector",
        onClick: `laminaApp.selectSector('${s.id}', '${cleanPId}', '${cleanMunId}')`
      }))
    });

    this.renderComandoSection();
    this.renderSymbolsSection();
    try {
      auditLogger.logEvent("SELECCION_SUBPARROQUIA_EJE", { ejeId: spId, parroquiaId: cleanPId, municipioId: cleanMunId, nombre: eje.nombre });
    } catch (e) {}
  }

  // 5. NIVEL SECTOR VECINAL (EL MAPA SE QUEDA EN ZOOM PARROQUIAL)
  selectSector(secId, parishId = "alto-de-los-godos", munId = "maturin", animate = true) {
    if (this.whiteboard && this.whiteboard.isActive && this.whiteboard.currentTool !== "pan") {
      return;
    }
    this.level = "sector";
    this.activeMunId = munId;
    this.activeParishId = parishId;
    this.activeSectorId = secId;

    const cleanMunId = String(munId || "maturin").toLowerCase().replace(/_/g, "-").trim();
    const cleanPId = resolveParishId(parishId);
    const pColor = this.getParishColor(cleanPId, cleanMunId);

    this.childEntitiesLayer.clearLayers();
    this.centrosLayer.clearLayers();
    this.renderCentrosVotacion(cleanPId);

    const { subparroquias, poligonos } = this.getParishPolygonsData(cleanMunId, cleanPId);
    let sec = poligonos.find(s => String(s.id) === String(secId) || String(s.nombre).toLowerCase() === String(secId).toLowerCase()) || findSectorById(secId);
    if (!sec) {
      sec = { id: secId, nombre: secId };
    }
    this.activeSectorName = sec.nombre;

    // 1. Mantener el Velo Blanco delimitando la PARROQUIA
    if (this.currentParishRings && this.currentParishRings.length > 0) {
      this.applySpotlightMask(this.currentParishRings, pColor, 3.5);
    }

    // 2. Comportamiento inteligente de cámara: NUNCA devolver el zoom si el usuario está explorando en detalle
    const sCoords = sec.vertices || sec.poligono;
    if (this.map) {
      if (sec.hasValidPoly !== false && sCoords && sCoords.length >= 3) {
        const secBounds = L.latLngBounds(sCoords);
        if (this.map.getZoom() < 14) {
          this.safeFitBounds(secBounds, animate);
        } else {
          this.map.panTo(secBounds.getCenter(), { animate: animate });
        }
      } else if (sec.centro) {
        if (this.map.getZoom() < 14) {
          this.map.setView(sec.centro, 15, { animate: animate });
        } else {
          this.map.panTo(sec.centro, { animate: animate });
        }
      }
    }

    // Centros de votación desactivados según directriz operativa

    // 1. Dibujar las subparroquias de fondo con trazo sutil
    subparroquias.forEach(sp => {
      const coords = sp.vertices || sp.poligono;
      if (coords && coords.length >= 3) {
        const otherSp = L.polygon(coords, {
          color: "#94a3b8",
          weight: 1,
          opacity: 0.5,
          fillColor: "#cbd5e1",
          fillOpacity: 0.05,
          dashArray: "3, 3"
        });
        otherSp.on("click", () => this.selectSubParroquia(sp.id, cleanPId, cleanMunId));
        this.childEntitiesLayer.addLayer(otherSp);
      }
    });

    // 2. Dibujar los demás sectores de este mismo eje con opacidad suave
    const isLaPuente = String(sec.subParroquiaId || sec.id || "").toLowerCase().includes("puente") || String(sec.subParroquiaId || sec.id || "").includes("6") || String(sec.id).startsWith("POLY-");
    const activeSubParishId = sec.subParroquiaId || (isLaPuente ? "sub-godos-6" : null);

    poligonos.forEach(s => {
      if (String(s.id) === String(secId)) return;
      if (activeSubParishId && s.subParroquiaId && s.subParroquiaId !== activeSubParishId) return;
      if (!isLaPuente && (String(s.id).startsWith("POLY-") || !s.subParroquiaId)) return;

      const sCoords = s.vertices || s.poligono;
      if (s.hasValidPoly !== false && sCoords && sCoords.length >= 3) {
        const otherSecPoly = L.polygon(sCoords, {
          color: "#94a3b8",
          weight: 1.2,
          opacity: 0.6,
          fillColor: "#e2e8f0",
          fillOpacity: 0.15
        });
        otherSecPoly.entityId = s.id;
        otherSecPoly.sectorId = s.id;
        otherSecPoly.entityType = "sector";
        otherSecPoly.bindTooltip(`<strong>${formatTitleCase(s.nombre)}</strong>`, { sticky: true, opacity: 0.85 });
        otherSecPoly.on("click", () => this.selectSector(s.id, cleanPId, cleanMunId));
        this.childEntitiesLayer.addLayer(otherSecPoly);
      }
    });

    // 3. Destacar el polígono del sector seleccionado si tiene coordenadas validadas
    if (sec.hasValidPoly !== false && sCoords && sCoords.length >= 3) {
      const sColor = this.getSectorColor(sec.id, sec.colorBorde || sec.color || "#0284c7");
      const secPoly = L.polygon(sCoords, {
        color: sColor,
        weight: 3.8,
        opacity: 1,
        fillColor: this.getSectorColor(sec.id, sec.colorRelleno || sec.color || "#38bdf8"),
        fillOpacity: 0.55
      });
      secPoly.entityId = sec.id;
      secPoly.sectorId = sec.id;
      secPoly.entityType = "sector";
      secPoly.bindTooltip(`
        <div style="font-family: inherit; font-size: 11px; padding: 2px;">
          <span style="color: #0284c7; font-weight: 900; font-size: 9.5px; text-transform: uppercase;">Sector Seleccionado</span><br>
          <strong style="color: #0f172a; font-size: 12px; font-weight: 900;">${formatTitleCase(sec.nombre)}</strong>
        </div>
      `, { permanent: true, direction: "top", offset: [0, -6] });
      this.childEntitiesLayer.addLayer(secPoly);
    }

    let markerPos = sec.centro;
    if (!markerPos && sCoords && sCoords.length > 0) {
      const avgLat = sCoords.reduce((sum, p) => sum + p[0], 0) / sCoords.length;
      const avgLng = sCoords.reduce((sum, p) => sum + p[1], 0) / sCoords.length;
      markerPos = [avgLat, avgLng];
    }

    if (sec.hasValidPoly !== false && markerPos) {
      const secMarker = L.circleMarker(markerPos, {
        radius: 6,
        fillColor: sec.colorBorde || sec.color || "#0284c7",
        fillOpacity: 0.95,
        color: "#ffffff",
        weight: 2
      });
      this.childEntitiesLayer.addLayer(secMarker);
    }

    const cleanPName = formatTitleCase(cleanPId);
    let cleanSecName = formatTitleCase(sec.nombre);
    if (/las\s+vigenes/i.test(cleanSecName)) cleanSecName = "Las Vírgenes";

    const munObj = CATALOGO_MONAGAS.find(m => m.id === cleanMunId) || { nombre: "Maturín" };
    const rawMunName = munObj.nombre || "Maturín";
    const cleanMunName = rawMunName.replace(/^municipio\s+/i, '').trim();

    this.updateHeaderUI(`SECTOR ${cleanSecName.toUpperCase()}`, `${cleanPName.toUpperCase()} • ${cleanMunName.toUpperCase()}`);

    const pDem = getParishDemographics(cleanMunId, cleanPId) || {};
    const secHabVal = sec.habitantes || Math.round((pDem.habitantes || 50000) / 16);
    const secVotVal = sec.votantes || Math.round((pDem.votantes || 35000) / 16);
    const secCenVal = sec.centros || 1;

    this.renderSideStats({
      title: `SECTOR ${cleanSecName.toUpperCase()}`,
      color: sec.colorBorde || sec.color || pColor,
      type: "Sector Comunitario",
      sub: `Parroquia ${cleanPName} • ${cleanMunName}`,
      code: "TERRITORIO",
      hab: Number(secHabVal).toLocaleString("es-VE"),
      vot: Number(secVotVal).toLocaleString("es-VE"),
      cen: Number(secCenVal).toLocaleString("es-VE"),
      cas: sec.centroVotacion ? "Asignado" : "Parroquia",
      casLabel: "Centro Electoral",
      listTitle: "Información de la Comunidad",
      listCount: 1,
      backBtn: {
        label: `Volver a Parroquia ${cleanPName}`,
        count: "⬅",
        onClick: `laminaApp.selectParroquia('${cleanPId}', '${cleanMunId}')`
      },
      items: [
        {
          id: sec.id,
          nombre: `Comunidad ${cleanSecName}`,
          color: sec.colorBorde || sec.color || pColor,
          badge: "Activo",
          onClick: ""
        }
      ]
    });
    this.renderComandoSection();
    this.renderSymbolsSection();
    this.updateBreadcrumbs();
    try {
      auditLogger.logEvent("SELECCION_SECTOR", { sectorId: secId, parroquiaId: cleanPId, municipioId: cleanMunId, nombre: cleanSecName });
    } catch (e) {}
  }

  // Renderizar centros de votación oficiales georreferenciados con pines CNE de alta visibilidad
  renderCentrosVotacion(parishId) {
    if (!this.centrosLayer) return;
    this.centrosLayer.clearLayers();
    if (!this.showCentros) return;

    const allCentros = (typeof CENTROS_MATURIN !== "undefined" && Array.isArray(CENTROS_MATURIN))
      ? CENTROS_MATURIN
      : ((typeof window !== "undefined" && Array.isArray(window.CENTROS_MATURIN)) ? window.CENTROS_MATURIN : []);

    if (!allCentros.length) return;

    const cleanPId = resolveParishId(parishId);
    const centros = allCentros.filter(c => {
      const cParish = resolveParishId(c.parroquia);
      return cParish === cleanPId || c.parroquia === parishId || !cleanPId;
    });

    centros.forEach(c => {
      if (!c.lat || !c.lng) return;

      const marker = L.circleMarker([c.lat, c.lng], {
        radius: 6,
        fillColor: "#ea580c",
        fillOpacity: 0.95,
        color: "#ffffff",
        weight: 2
      });

      marker.bindTooltip(`
        <div style="font-family: inherit; font-size: 11px; padding: 2px;">
          <span style="color: #ea580c; font-weight: 800; font-size: 9px; text-transform: uppercase;">Centro Electoral CNE</span><br>
          <strong style="color: #0f172a; font-size: 11.5px; font-weight: 900;">${c.nombre}</strong><br>
          <span style="color: #475569; font-size: 10px;">${c.electores ? c.electores.toLocaleString('es-VE') + ' electores' : ''} • ${c.mesas || 1} mesas</span>
        </div>
      `, { sticky: true, opacity: 0.95 });

      this.centrosLayer.addLayer(marker);
    });
  }

  /* ========================================================================
     ACTUALIZACIÓN DE INTERFAZ (BANNER, BREADCRUMBS, PANEL DERECHO)
     ======================================================================== */

  updateHeaderUI(title, subtitle) {
    const titleEl = document.getElementById("lamina-entity-title");
    const subEl = document.getElementById("lamina-entity-subtitle");
    if (titleEl) titleEl.textContent = title;
    if (subEl) subEl.textContent = subtitle;
  }

  updateBreadcrumbs() {
    const bcContainer = document.getElementById("lamina-breadcrumbs");
    if (!bcContainer) return;

    const items = [];

    // Nivel 1: Estado Monagas
    items.push(`
      <span class="breadcrumb-item ${this.level === 'estado' ? 'active' : ''}" onclick="event.stopPropagation(); laminaApp.selectEstado()" title="Ver todo el Estado Monagas">
        <span>🇻🇪 Monagas</span>
      </span>
    `);

    // Nivel 2: Municipio
    if (this.activeMunId) {
      const munObj = CATALOGO_MONAGAS.find(m => m.id === this.activeMunId) || { nombre: "Maturín" };
      const munClean = (munObj.nombre || "Maturín").replace(/^municipio\s+/i, '').trim();
      items.push(`
        <span class="breadcrumb-item ${this.level === 'municipio' ? 'active' : ''}" onclick="event.stopPropagation(); laminaApp.selectMunicipio('${this.activeMunId}')" title="Ver Municipio ${munClean}">
          <span>${munClean}</span>
        </span>
      `);
    }

    // Nivel 3: Parroquia
    if (this.activeParishId) {
      const pObj = (CATALOGO_MONAGAS.find(m => m.id === this.activeMunId)?.parroquias || []).find(p => p.id === this.activeParishId) || { nombre: this.activeParishId };
      const parishClean = (pObj.nombre || this.activeParishId).replace(/^parroquia\s+/i, '').trim();
      items.push(`
        <span class="breadcrumb-item ${this.level === 'parroquia' ? 'active' : ''}" onclick="event.stopPropagation(); laminaApp.selectParroquia('${this.activeParishId}', '${this.activeMunId}')" title="Ver Parroquia ${parishClean}">
          <span>${parishClean}</span>
        </span>
      `);
    }

    // Nivel 4: Sub-Parroquia / Eje
    if (this.activeSubParishId) {
      let spTitle = this.activeSubParishName ? formatTitleCase(this.activeSubParishName) : "Eje";
      spTitle = spTitle.replace(/^sub\s*parroquia\s*/i, 'Eje ').replace(/^eje\s*eje\s*/i, 'Eje ').trim();
      items.push(`
        <span class="breadcrumb-item ${this.level === 'subparroquia' ? 'active' : ''}" onclick="event.stopPropagation(); laminaApp.selectSubParroquia('${this.activeSubParishId}', '${this.activeParishId}', '${this.activeMunId}')" title="Ver ${spTitle}">
          <span>${spTitle}</span>
        </span>
      `);
    }

    // Nivel 5: Sector
    if (this.activeSectorId) {
      let secTitle = this.activeSectorName ? formatTitleCase(this.activeSectorName) : "Sector";
      if (/las\s+vigenes/i.test(secTitle)) secTitle = "Las Vírgenes";
      items.push(`
        <span class="breadcrumb-item ${this.level === 'sector' ? 'active' : ''}" title="Sector Activo: ${secTitle}">
          <span>${secTitle}</span>
        </span>
      `);
    }

    bcContainer.innerHTML = items.join('<span class="text-slate-300 font-bold px-0.5 select-none">/</span>');
  }

  renderSideStats(data) {
    const badgeEl = document.getElementById("side-badge-color");
    const titleEl = document.getElementById("side-entity-title");
    const typeEl = document.getElementById("side-entity-type");
    const subEl = document.getElementById("side-entity-sub");
    const codeEl = document.getElementById("side-entity-code");
    const habEl = document.getElementById("stat-val-hab");
    const votEl = document.getElementById("stat-val-vot");
    const cenEl = document.getElementById("stat-val-cen");
    const casEl = document.getElementById("stat-val-cas");
    const casLabelEl = document.getElementById("stat-lbl-cas");
    const listTitleEl = document.getElementById("side-list-title");
    const listCountEl = document.getElementById("side-list-count");
    const listEl = document.getElementById("side-interactive-list");

    if (badgeEl) {
      badgeEl.style.backgroundColor = data.color || "#0284c7";
      badgeEl.style.boxShadow = `0 0 10px ${data.color || "#0284c7"}88`;
    }
    if (titleEl) titleEl.textContent = data.title;
    if (typeEl) typeEl.textContent = data.type;
    if (subEl) subEl.textContent = data.sub || "";
    if (codeEl) codeEl.textContent = data.code;

    if (habEl) habEl.textContent = data.hab;
    if (votEl) votEl.textContent = data.vot;
    if (cenEl) cenEl.textContent = data.cen;
    if (casEl) casEl.textContent = data.cas;
    if (casLabelEl) casLabelEl.textContent = data.casLabel || "Parroquias CNE";

    if (listTitleEl) listTitleEl.textContent = data.listTitle;
    if (listCountEl) listCountEl.textContent = String(data.listCount || 0);

    if (listEl) {
      let html = "";
      if (data.backBtn) {
        html += `
          <div onclick="${data.backBtn.onClick}" 
               class="flex items-center justify-between p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 cursor-pointer mb-2 transition text-sm font-black"
               title="${data.backBtn.label}">
            <span class="flex items-center gap-1.5">
              <span>⬅</span>
              <span>${data.backBtn.label}</span>
            </span>
            <span class="bg-sky-200/80 text-sky-950 px-1.5 py-0.5 rounded font-mono text-sm">${data.backBtn.count}</span>
          </div>
        `;
      }

      if (data.items && data.items.length > 0) {
        html += data.items.map(item => `
          <div onclick="${item.onClick}" 
               class="territory-row" 
               data-entity-id="${item.id}"
               title="${item.nombre} • Clic para enfocar">
            <div class="flex items-center gap-2 truncate">
              <span class="entity-badge-color w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" style="background-color: ${item.color || '#0284c7'};"></span>
              <span class="font-bold text-sm text-slate-900 truncate">${item.nombre}</span>
            </div>
            <span class="text-sm font-extrabold text-slate-700 shrink-0 ml-1">
              ${item.badge}
            </span>
          </div>
        `).join("");
      } else {
        html += `
          <div class="p-3 text-center text-sm text-slate-700 italic">
            Sin entidades secundarias registradas
          </div>
        `;
      }

      listEl.innerHTML = html;
    }
  }

  // Renderizar la Estructura de Comando y Responsables Dinámica
  // Renderizar la Estructura de Comandos Gateros y Responsables Dinámica
  renderComandoSection() {
    const activeEntityId = this.activeSectorId || this.activeSubParishId || this.activeParishId || this.activeMunId || "estado";
    const info = getComandoInfo(this.level, activeEntityId, this.activeParishId, this.activeMunId);
    if (!info) return;

    const levelEl = document.getElementById("comando-level-label");
    const cargoEl = document.getElementById("comando-cargo-label");
    const nombreEl = document.getElementById("comando-nombre-label");
    const divisionEl = document.getElementById("comando-division-label");
    const telfEl = document.getElementById("comando-telf-label");
    const rolesContainer = document.getElementById("comando-roles-container");
    const subTitleEl = document.getElementById("comando-sub-title");
    const subCountEl = document.getElementById("comando-sub-count");
    const listEl = document.getElementById("comando-interactive-list");

    if (levelEl) levelEl.textContent = info.nivel;
    if (cargoEl) cargoEl.textContent = info.cargo || (this.level === "estado" ? "Jefe Gatero Estatal" : (this.level === "municipio" ? "Jefe Gatero Municipal" : "Gatero Parroquial"));
    
    if (nombreEl) {
      nombreEl.textContent = info.general;
      if (info.general.includes("Vacante") || info.general.includes("Sin Asignar")) {
        nombreEl.className = "text-sm font-semibold text-slate-400 italic block truncate";
      } else {
        nombreEl.className = "text-sm font-black text-slate-950 block truncate";
      }
    }
    
    if (divisionEl) divisionEl.textContent = info.division;
    
    if (telfEl) {
      if (info.telefono && info.telefono !== "+58 412-0000000" && !info.telefono.includes("0000")) {
        const cleanTelf = info.telefono.replace(/[^\d+]/g, '');
        telfEl.innerHTML = `
          <a href="https://wa.me/${cleanTelf.replace('+', '')}" target="_blank" rel="noopener noreferrer"
             class="text-emerald-700 hover:text-emerald-900 font-extrabold flex items-center gap-1 hover:underline cursor-pointer" title="Contactar por WhatsApp">
            <span>📲</span><span>${info.telefono}</span>
          </a>
        `;
      } else {
        telfEl.innerHTML = `<span>📱</span><span class="text-slate-500 font-medium">${info.telefono || "Sin teléfono registrado"}</span>`;
      }
    }

    // ELIMINAR roles burocráticos ficticios: erradicar "Operaciones y Logística", "Ciencia y Tecnología", etc.
    if (rolesContainer) {
      rolesContainer.innerHTML = "";
      rolesContainer.style.display = "none";
    }

    // Subdirectorios según nivel (Comandos Gateros)
    if (subTitleEl) {
      if (this.level === "estado") subTitleEl.textContent = "Comandos Gateros Municipales (13)";
      else if (this.level === "municipio") subTitleEl.textContent = "Comandos Gateros Parroquiales";
      else if (this.level === "parroquia") subTitleEl.textContent = "Centros CNE y Sectores";
      else subTitleEl.textContent = "Centros y Sectores del Eje";
    }

    if (subCountEl) {
      subCountEl.textContent = String((info.subdirectorios || []).length || (info.centrosAsignados || []).length || 0);
    }

    if (listEl) {
      let html = "";
      if (info.subdirectorios && info.subdirectorios.length > 0) {
        html = info.subdirectorios.map(sub => {
          const isAssigned = sub.isAssigned && !sub.responsable.includes("Vacante");
          const phoneLink = (sub.telefono && !sub.telefono.includes("0000")) ? `
            <a href="https://wa.me/${sub.telefono.replace(/[^\d]/g, '')}" target="_blank" rel="noopener noreferrer"
               onclick="event.stopPropagation()"
               class="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold ml-1.5 inline-flex items-center gap-0.5 hover:underline cursor-pointer" title="Contactar por WhatsApp">
              📲 ${sub.telefono}
            </a>
          ` : '';

          return `
          <div class="territory-row hover:border-sky-400 flex items-center justify-between gap-1 p-2 rounded-xl bg-white border border-slate-200 mb-1.5 shadow-2xs transition">
            <div onclick="${sub.onClick}" 
                 class="flex flex-col min-w-0 flex-1 cursor-pointer" 
                 title="Ver ${sub.nombre} • Clic para enfocar">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full ${isAssigned ? 'bg-emerald-500' : 'bg-amber-400'} shrink-0"></span>
                <span class="font-bold text-xs text-slate-900 truncate">${sub.nombre}</span>
              </div>
              <div class="flex items-center text-[10.5px] truncate ml-3.5 mt-0.5">
                <span class="${isAssigned ? 'font-semibold text-slate-800' : 'text-slate-400 italic'} truncate">
                  👤 ${sub.responsable}
                </span>
                ${phoneLink}
              </div>
            </div>
            <div class="flex items-center gap-1 shrink-0 ml-1">
              ${(this.level === 'estado' || this.level === 'municipio') ? `
              <button type="button" 
                      onclick="event.stopPropagation(); laminaApp.openAsignarModal('${sub.id}', '${sub.nombre.replace(/'/g, "\\'")}', '${this.activeParishId || 'alto-de-los-godos'}')"
                      class="px-2 py-1 rounded bg-sky-100 hover:bg-sky-200 text-sky-900 text-[10px] font-black border border-sky-300 shadow-2xs transition active:scale-95 cursor-pointer"
                      title="Asignar o editar Comando Gatero">
                ✏️ Asignar
              </button>` : ''}
              <span class="text-[10px] font-extrabold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                ${sub.parroquias ? `${sub.parroquias} parr.` : sub.centros ? `${sub.centros} centros` : 'Ver'}
              </span>
            </div>
          </div>
        `;
        }).join("");
      } else if (info.centrosAsignados && info.centrosAsignados.length > 0) {
        html += `
          <div class="p-2 rounded-xl bg-slate-50 border border-slate-200 mb-2 space-y-1">
            <span class="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Centros CNE Asignados:</span>
            ${info.centrosAsignados.map(c => `
              <div class="flex items-center gap-1.5 text-xs text-slate-800 font-bold">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0"></span>
                <span class="truncate">${c}</span>
              </div>
            `).join("")}
          </div>
        `;
        if (info.sectores && info.sectores.length > 0) {
          html += `
            <div class="p-2 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span class="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Sectores del Circuito:</span>
              ${info.sectores.map(s => `
                <div class="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                  <span class="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0"></span>
                  <span class="truncate">${s}</span>
                </div>
              `).join("")}
            </div>
          `;
        }
      } else {
        html = `
          <div class="p-3 text-center text-xs text-slate-500 italic">
            Directorio consolidado en este nivel
          </div>
        `;
      }
      listEl.innerHTML = html;
    }

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  // Menú de Leyenda reservado y en blanco para futuros parámetros operativos
  renderSymbolsSection() {
    const symbolsSec = document.getElementById("side-symbols-section");
    if (symbolsSec) {
      symbolsSec.innerHTML = "";
    }
  }

  /* ========================================================================
     EXPORTACIÓN Y CAPTURA DE PANTALLA HD (PNG 16:9 / 120 PULGADAS)
     ======================================================================== */

  openExportModal() {
    const modal = document.getElementById("modal-exportar-lamina");
    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
      if (window.lucide && typeof window.lucide.createIcons === "function") {
        window.lucide.createIcons();
      }
    }
  }

  closeExportModal() {
    const modal = document.getElementById("modal-exportar-lamina");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  }

  async capturarPantallaHD() {
    const btn = document.getElementById("btn-do-capture-png");
    const originalContent = btn ? btn.innerHTML : "";
    if (btn) {
      btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Capturando...</span>`;
      if (window.lucide && typeof window.lucide.createIcons === "function") {
        window.lucide.createIcons();
      }
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        alert("La captura automática no está soportada en este navegador.\n\nAlternativa recomendada: Presiona Win + Shift + S (Windows) o Cmd + Shift + 4 (Mac) para capturar la lámina directamente.");
        return;
      }

      // Ocultar modal para que no interfiera en la toma de imagen
      this.closeExportModal();
      await new Promise(r => setTimeout(r, 150));

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "browser",
          width: { ideal: 3840 },
          height: { ideal: 2160 }
        },
        audio: false
      });

      const video = document.createElement("video");
      video.srcObject = stream;
      video.muted = true;
      await video.play();

      // Esperar brevemente a que el fotograma esté nítido
      await new Promise(r => setTimeout(r, 350));

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || window.innerWidth;
      canvas.height = video.videoHeight || window.innerHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Detener transmisión de pantalla inmediatamente
      stream.getTracks().forEach(t => t.stop());

      // Generar nombre descriptivo oficial
      const d = new Date().toISOString().slice(0, 10);
      const entity = (this.activeSectorName || this.activeSubParishName || this.activeParishId || this.activeMunId || "Monagas").replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = `Lamina_MIGATO_${entity}_${d}.png`;

      // Descarga de archivo PNG
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.warn("Captura asistida:", err);
      // Si el usuario canceló la selección de ventana, reabrimos el modal
      if (err.name !== "NotAllowedError") {
        this.openExportModal();
      }
    } finally {
      if (btn) {
        btn.innerHTML = originalContent;
        if (window.lucide && typeof window.lucide.createIcons === "function") {
          window.lucide.createIcons();
        }
      }
    }
  }

  // =========================================================================
  // SUBINTERFAZ / CONSOLA DE MANDO TERRITORIAL, DATOS Y COMANDOS (120")
  // =========================================================================

  openTerritoryModal(munId = null) {
    if (munId) {
      this.modalSelectedMun = munId;
    } else if (this.activeMunId) {
      this.modalSelectedMun = this.activeMunId;
    } else {
      this.modalSelectedMun = "maturin";
    }
    this.modalDrilldownParish = null;

    const modal = document.getElementById("modal-territorio-interfaz");
    if (!modal) return;

    modal.classList.remove("hidden");
    modal.style.setProperty("display", "flex", "important");

    const input = document.getElementById("input-territory-modal-filter");
    if (input) {
      input.value = "";
      input.oninput = (e) => this.renderTerritoryModal(e.target.value);
      setTimeout(() => input.focus(), 80);
    }

    this.renderTerritoryModal("");
  }

  closeTerritoryModal() {
    const modal = document.getElementById("modal-territorio-interfaz");
    if (!modal) return;
    modal.classList.add("hidden");
    modal.style.setProperty("display", "none", "important");
  }

  setTerritoryModalMun(munId) {
    this.modalSelectedMun = munId;
    this.modalDrilldownParish = null;
    const input = document.getElementById("input-territory-modal-filter");
    if (input) input.value = "";
    this.renderTerritoryModal("");
  }

  drilldownParishInModal(parishId, munId = null) {
    this.modalDrilldownParish = {
      parishId: resolveParishId(parishId),
      rawParishId: parishId,
      munId: munId || this.modalSelectedMun || "maturin"
    };
    this.renderTerritoryModal("");
  }

  backFromParishDrilldown() {
    this.modalDrilldownParish = null;
    this.renderTerritoryModal("");
  }

  focusAndClose(level, id1, id2 = null, id3 = null) {
    this.closeTerritoryModal();
    if (level === "municipio") {
      this.selectMunicipio(id1);
    } else if (level === "parroquia") {
      this.selectParroquia(id1, id2 || this.modalSelectedMun || "maturin");
    } else if (level === "subparroquia") {
      this.selectSubParroquia(id1, id2, id3 || this.modalSelectedMun || "maturin");
    } else if (level === "sector") {
      this.selectSector(id1, id2, id3 || this.modalSelectedMun || "maturin");
    }
  }

  renderTerritoryModal(filterText = "") {
    const container = document.getElementById("modal-territory-content");
    if (!container) return;

    const q = (filterText || "").toLowerCase().trim();

    // MODO 1: BÚSQUEDA DINÁMICA EN TIEMPO REAL
    if (q.length >= 2) {
      let matchedParishes = [];
      let matchedSectors = [];
      let matchedDirigentes = [];

      // A. Buscar en Municipios y Parroquias
      (CATALOGO_MONAGAS || []).forEach(m => {
        (m.parroquias || []).forEach(p => {
          if (p.nombre.toLowerCase().includes(q) || (m.nombre || "").toLowerCase().includes(q)) {
            matchedParishes.push({ mun: m, parish: p });
          }
        });
      });

      // B. Buscar en Comandos (Dirigentes por nombre o cargo)
      Object.entries(COMANDOS_PARROQUIALES || {}).forEach(([pId, cmd]) => {
        if ((cmd.responsableGeneral || "").toLowerCase().includes(q) || (cmd.nombre || "").toLowerCase().includes(q)) {
          matchedDirigentes.push({
            tipo: "Parroquia",
            nombre: cmd.responsableGeneral,
            entidad: cmd.nombre,
            telefono: cmd.telefono,
            munId: cmd.municipioId || "maturin",
            parishId: pId
          });
        }
      });
      Object.entries(COMANDOS_MUNICIPALES || {}).forEach(([mId, cmd]) => {
        if ((cmd.responsableGeneral || "").toLowerCase().includes(q) || (cmd.nombre || "").toLowerCase().includes(q)) {
          matchedDirigentes.push({
            tipo: "Municipio",
            nombre: cmd.responsableGeneral,
            entidad: cmd.nombre,
            telefono: cmd.telefono,
            munId: mId
          });
        }
      });

      // C. Buscar en Sectores
      const seenSecs = new Set();
      (ALL_SECTORES_FLAT || []).forEach(sec => {
        if ((sec.nombre || "").toLowerCase().includes(q) || (sec.centroVotacion || "").toLowerCase().includes(q)) {
          if (!seenSecs.has(String(sec.id))) {
            seenSecs.add(String(sec.id));
            matchedSectors.push(sec);
          }
        }
      });
      matchedSectors = matchedSectors.slice(0, 30);

      let searchHtml = `
        <div class="space-y-4 py-1 overflow-y-auto max-h-[72vh] flex-1 pr-1">
          <!-- Barra de estado -->
          <div class="flex items-center justify-between bg-[#140e40] p-3 rounded-xl border border-[#2d1f85] shrink-0">
            <div class="flex items-center gap-2">
              <span class="text-base">🔍</span>
              <span class="text-sm text-slate-300">Resultados para: <strong class="text-sky-300 font-mono">"${filterText}"</strong></span>
            </div>
            <button type="button" onclick="const inp = document.getElementById('input-territory-modal-filter'); if(inp) { inp.value = ''; inp.focus(); } window.laminaApp?.renderTerritoryModal('');"
              class="px-2.5 py-1 rounded-lg bg-[#0e092e] hover:bg-[#23176d] text-slate-300 hover:text-white border border-[#2d1f85] text-xs font-bold transition cursor-pointer">
              ✖ Limpiar búsqueda
            </button>
          </div>
      `;

      if (matchedDirigentes.length > 0) {
        searchHtml += `
          <div>
            <span class="text-xs font-black uppercase text-amber-400 tracking-wider block mb-2">👤 Dirigentes y Comandos Coincidentes (${matchedDirigentes.length})</span>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              ${matchedDirigentes.map(d => `
                <div class="p-3 rounded-xl bg-[#140e40] border border-sky-400/40 flex items-center justify-between gap-3">
                  <div class="min-w-0 flex-1">
                    <span class="text-[10px] uppercase font-bold text-sky-300 block">${d.tipo} • ${d.entidad}</span>
                    <strong class="text-sm font-black text-white block truncate">${d.nombre}</strong>
                    <span class="text-xs font-mono text-emerald-400 font-bold block">📱 ${d.telefono}</span>
                  </div>
                  <button type="button" onclick="window.laminaApp?.focusAndClose('${d.tipo === 'Municipio' ? 'municipio' : 'parroquia'}', '${d.tipo === 'Municipio' ? d.munId : d.parishId}', '${d.munId}')"
                    class="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shrink-0">
                    Enfocar ➔
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      if (matchedParishes.length > 0) {
        searchHtml += `
          <div>
            <span class="text-xs font-black uppercase text-sky-400 tracking-wider block mb-2">📍 Parroquias Coincidentes (${matchedParishes.length})</span>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              ${matchedParishes.map(({ mun, parish }) => {
                const dem = getParishDemographics(parish.id, mun.id) || {};
                const cmd = COMANDOS_PARROQUIALES[parish.id] || getComandoInfo("parroquia", parish.id, parish.id, mun.id);
                return `
                  <div class="p-3 rounded-xl bg-[#140e40] border border-[#2d1f85] flex flex-col justify-between gap-2">
                    <div class="flex items-start justify-between gap-2">
                      <div>
                        <span class="text-[10px] uppercase font-bold text-slate-400 block">${(mun.nombre || mun.id).replace(/^Municipio\s+/i, '')}</span>
                        <strong class="text-sm font-black text-white block">${parish.nombre}</strong>
                      </div>
                      <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-900/60 text-sky-300 border border-sky-700/50">
                        ${Number(dem.votantes || 0).toLocaleString("es-VE")} elect.
                      </span>
                    </div>
                    <div class="text-xs text-slate-300 flex items-center justify-between border-t border-[#2d1f85]/60 pt-1.5">
                      <span class="truncate">👤 ${cmd?.responsableGeneral || 'Comando Parroquial'}</span>
                      <span class="font-mono text-emerald-400 font-bold shrink-0 ml-1">${cmd?.telefono || ''}</span>
                    </div>
                    <div class="flex items-center gap-1.5 pt-1">
                      <button type="button" onclick="window.laminaApp?.drilldownParishInModal('${parish.id}', '${mun.id}')"
                        class="flex-1 py-1.5 px-2 bg-[#23176d] hover:bg-[#2d1f85] text-sky-200 text-xs font-bold rounded-lg border border-sky-400/30 transition text-center cursor-pointer">
                        Ver Sectores
                      </button>
                      <button type="button" onclick="window.laminaApp?.focusAndClose('parroquia', '${parish.id}', '${mun.id}')"
                        class="py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-lg transition cursor-pointer">
                        Enfocar ➔
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }

      if (matchedSectors.length > 0) {
        searchHtml += `
          <div>
            <span class="text-xs font-black uppercase text-purple-400 tracking-wider block mb-2">🏘️ Sectores y Comunidades Coincidentes (${matchedSectors.length})</span>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              ${matchedSectors.map(s => {
                const sDem = s.votantes ? `${Number(s.votantes).toLocaleString("es-VE")} vot.` : '';
                return `
                  <div class="p-2.5 rounded-xl bg-[#140e40] border border-[#2d1f85] flex flex-col justify-between gap-1.5">
                    <div>
                      <span class="text-[9.5px] uppercase font-bold text-slate-400 block truncate">${s.parroquiaId || ''} • ${s.eje || 'Sector'}</span>
                      <strong class="text-xs font-black text-white block truncate">${s.nombre}</strong>
                    </div>
                    <div class="flex items-center justify-between text-[11px] text-slate-300">
                      <span class="font-mono text-sky-300">${sDem}</span>
                      <span class="text-[9px] text-slate-400 truncate max-w-[120px]">${s.centroVotacion || ''}</span>
                    </div>
                    <button type="button" onclick="window.laminaApp?.focusAndClose('sector', '${s.id}', '${s.parroquiaId}', '${s.municipioId}')"
                      class="mt-1 w-full py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] rounded-lg transition text-center cursor-pointer">
                      Enfocar en Lámina 120" ➔
                    </button>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }

      if (matchedDirigentes.length === 0 && matchedParishes.length === 0 && matchedSectors.length === 0) {
        searchHtml += `
          <div class="text-center py-10 bg-[#140e40] rounded-2xl border border-[#2d1f85] p-6 space-y-3">
            <span class="text-3xl">🔍</span>
            <p class="text-sm font-bold text-slate-200">No se encontraron parroquias, sectores ni dirigentes para "${filterText}".</p>
            <p class="text-xs text-slate-400 max-w-md mx-auto">Verifica la ortografía o regresa al directorio general de los 13 municipios de Monagas.</p>
            <button type="button" onclick="const inp = document.getElementById('input-territory-modal-filter'); if(inp) { inp.value = ''; inp.focus(); } window.laminaApp?.renderTerritoryModal('');"
              class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition cursor-pointer shadow-md">
              Ver los 13 Municipios
            </button>
          </div>
        `;
      }

      searchHtml += `</div>`;
      container.innerHTML = searchHtml;
      if (window.lucide && typeof window.lucide.createIcons === "function") {
        try { window.lucide.createIcons(); } catch(e){}
      }
      return;
    }

    // MODO 2: NAVEGADOR ESTRUCTURADO EN 2 COLUMNAS (13 MUNICIPIOS ➔ PARROQUIAS / SECTORES)
    const activeMunId = this.modalSelectedMun || "maturin";
    const munObj = (CATALOGO_MONAGAS || []).find(m => m.id === activeMunId) || CATALOGO_MONAGAS[0] || { id: "maturin", nombre: "Maturín", parroquias: [] };
    const munDem = getMunicipioDemographics(munObj.id) || {};
    const munComando = COMANDOS_MUNICIPALES[munObj.id] || getComandoInfo("municipio", munObj.id);

    let mainHtml = `
      <div class="flex flex-col md:flex-row gap-3 sm:gap-4 h-full min-h-0 flex-1 overflow-hidden">
        
        <!-- Pestaña Rápida de Municipios en Móvil (< md:) -->
        <div class="md:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 border-b border-[#2d1f85]/60 pb-2 shrink-0">
          ${(CATALOGO_MONAGAS || []).map(m => {
            const pCount = Array.isArray(m.parroquias) ? m.parroquias.length : 0;
            const isAct = m.id === activeMunId;
            return `
              <button type="button" onclick="window.laminaApp?.setTerritoryModalMun('${m.id}')"
                class="px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${isAct ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'bg-[#140e40] text-slate-300 hover:text-white border border-[#2d1f85]'}">
                <span>🏛️ ${(m.nombre || m.id).replace(/^Municipio\s+/i, '')}</span>
                <span class="text-[10px] font-mono opacity-80">(${pCount})</span>
              </button>
            `;
          }).join('')}
        </div>

        <!-- COLUMNA 1: LISTA DE LOS 13 MUNICIPIOS (Desktop md:) -->
        <div class="hidden md:flex flex-col w-52 lg:w-60 shrink-0 border-r border-[#2d1f85]/70 pr-3 space-y-1.5 overflow-y-auto max-h-[72vh]">
          <div class="text-xs font-black text-amber-400 uppercase tracking-wider px-1 pb-1 flex items-center justify-between border-b border-[#2d1f85]/50 shrink-0">
            <span>1. MUNICIPIOS</span>
            <span class="text-[11px] text-slate-400 font-mono">13 Total</span>
          </div>
          <div class="space-y-1 pt-1">
            ${(CATALOGO_MONAGAS || []).map(m => {
              const pCount = Array.isArray(m.parroquias) ? m.parroquias.length : 0;
              const isAct = m.id === activeMunId;
              return `
                <button type="button" onclick="window.laminaApp?.setTerritoryModalMun('${m.id}')"
                  class="w-full text-left p-2 rounded-xl transition flex items-center justify-between gap-2 cursor-pointer group ${isAct ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/20' : 'bg-[#140e40] hover:bg-[#23176d] text-slate-300 hover:text-white border border-[#2d1f85]'}">
                  <div class="flex items-center gap-1.5 truncate min-w-0">
                    <span class="text-sm shrink-0">🏛️</span>
                    <span class="text-xs truncate font-bold">${(m.nombre || m.id).replace(/^Municipio\s+/i, '')}</span>
                  </div>
                  <span class="text-[11px] font-mono px-1.5 py-0.2 rounded shrink-0 ${isAct ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-[#0e092e] text-slate-400 border border-[#2d1f85]'}">
                    ${pCount}
                  </span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- COLUMNA 2: DETALLES, PARROQUIAS Y DESGLOSE DEL MUNICIPIO SELECCIONADO -->
        <div class="flex-1 overflow-y-auto max-h-[72vh] space-y-3.5 pr-1 min-w-0">
    `;

    if (!this.modalDrilldownParish) {
      mainHtml += `
        <!-- BANNER FICHA 2 EN 1 DEL MUNICIPIO: COMANDO + DATOS -->
        <div class="bg-[#140e40] border border-[#2d1f85] rounded-2xl p-3.5 space-y-3 shadow-md">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-2.5 border-b border-[#2d1f85]/70">
            <div>
              <span class="text-[10px] font-black uppercase text-amber-400 tracking-widest block">MUNICIPIO OFICIAL</span>
              <h2 class="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>🏛️ Municipio ${(munObj.nombre || munObj.id).replace(/^Municipio\s+/i, '')}</span>
                <span class="text-xs font-mono px-2 py-0.5 rounded-full bg-sky-900/60 text-sky-300 border border-sky-700/50">
                  ${(munObj.parroquias || []).length} Parroquias
                </span>
              </h2>
            </div>
            <button type="button" onclick="window.laminaApp?.focusAndClose('municipio', '${munObj.id}')"
              class="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto">
              <i data-lucide="crosshair" class="w-3.5 h-3.5"></i>
              <span>Enfocar Municipio en Lámina 120"</span>
            </button>
          </div>

          <!-- Ficha de Comando Municipal -->
          <div class="p-2.5 rounded-xl bg-[#0e092e] border border-[#2d1f85] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
            <div class="flex items-center gap-2 min-w-0">
              <span class="text-base">👤</span>
              <div class="truncate">
                <span class="text-[9.5px] uppercase font-bold text-slate-400 block">Jefe de Comando Municipal</span>
                <strong class="text-xs font-black text-white block truncate">${munComando?.responsableGeneral || munComando?.general || 'Coordinador Municipal'}</strong>
              </div>
            </div>
            <div class="flex items-center gap-2 text-[11px] font-mono shrink-0">
              <span class="text-emerald-400 font-bold">📱 ${munComando?.telefono || '+58 412-0000000'}</span>
            </div>
          </div>

          <!-- Métricas Electorales Municipales (Grid 4) -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div class="p-2 rounded-xl bg-[#0e092e] border border-[#2d1f85]">
              <span class="text-[10px] text-slate-400 uppercase font-bold block">Habitantes</span>
              <strong class="text-sm font-mono font-black text-white">${Number(munDem.habitantes || 0).toLocaleString("es-VE")}</strong>
            </div>
            <div class="p-2 rounded-xl bg-[#0e092e] border border-[#2d1f85]">
              <span class="text-[10px] text-sky-400 uppercase font-bold block">Electores CNE</span>
              <strong class="text-sm font-mono font-black text-sky-200">${Number(munDem.votantes || 0).toLocaleString("es-VE")}</strong>
            </div>
            <div class="p-2 rounded-xl bg-[#0e092e] border border-[#2d1f85]">
              <span class="text-[10px] text-indigo-400 uppercase font-bold block">Centros CNE</span>
              <strong class="text-sm font-mono font-black text-indigo-200">${Number(munDem.centros || 0).toLocaleString("es-VE")}</strong>
            </div>
            <div class="p-2 rounded-xl bg-[#0e092e] border border-[#2d1f85]">
              <span class="text-[10px] text-emerald-400 uppercase font-bold block">Parroquias CNE</span>
              <strong class="text-sm font-mono font-black text-emerald-200">${(munObj.parroquias || []).length} Parroquias</strong>
            </div>
          </div>
        </div>

        <!-- LISTADO DE PARROQUIAS DEL MUNICIPIO -->
        <div class="space-y-2">
          <div class="flex items-center justify-between text-xs font-black text-slate-300 uppercase tracking-wider px-1">
            <span>2. PARROQUIAS OFICIALES (${(munObj.parroquias || []).length})</span>
            <span class="text-[10px] text-slate-400 font-normal">Toca para ver sectores o enfocar</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            ${(munObj.parroquias || []).map(p => {
              const pDem = getParishDemographics(p.id, munObj.id) || {};
              const pComando = COMANDOS_PARROQUIALES[p.id] || getComandoInfo("parroquia", p.id, p.id, munObj.id);
              const pColor = this.getParishColor(resolveParishId(p.id), munObj.id);

              return `
                <div class="p-3 rounded-2xl bg-[#140e40] border border-[#2d1f85] hover:border-sky-400/80 transition territory-modal-card flex flex-col justify-between gap-2.5 shadow-sm">
                  <!-- Header Parroquia -->
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="w-3 h-3 rounded-full shrink-0 shadow-xs" style="background-color: ${pColor};"></span>
                      <div class="truncate">
                        <strong class="text-sm font-black text-white block truncate">${p.nombre}</strong>
                        <span class="text-[10px] text-slate-400 font-bold block">${p.tipo || 'Parroquia'}</span>
                      </div>
                    </div>
                    <span class="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 shrink-0">
                      ${Number(pDem.votantes || 0).toLocaleString("es-VE")} elect.
                    </span>
                  </div>

                  <!-- Ficha de Comando Gatero -->
                  <div class="p-2 rounded-xl bg-[#0e092e]/80 border border-[#2d1f85]/80 text-[11px] flex items-center justify-between gap-2">
                    <div class="truncate">
                      <span class="text-[9px] uppercase font-bold text-slate-400 block">Comando Parroquial</span>
                      <span class="font-bold text-slate-200 block truncate">👤 ${pComando?.responsableGeneral || pComando?.general || 'Coordinador Parroquia'}</span>
                    </div>
                    <span class="font-mono text-emerald-400 text-[10px] font-bold shrink-0">${pComando?.telefono || ''}</span>
                  </div>

                  <!-- Botones de Acción -->
                  <div class="flex items-center gap-1.5 pt-1 border-t border-[#2d1f85]/60">
                    <button type="button" onclick="window.laminaApp?.drilldownParishInModal('${p.id}', '${munObj.id}')"
                      class="flex-1 py-1.5 px-2 bg-[#23176d] hover:bg-[#2d1f85] text-sky-200 text-xs font-bold rounded-xl border border-sky-400/30 transition text-center flex items-center justify-center gap-1 cursor-pointer">
                      <i data-lucide="folder-tree" class="w-3.5 h-3.5"></i>
                      <span>Ver Sectores</span>
                    </button>
                    <button type="button" onclick="window.laminaApp?.focusAndClose('parroquia', '${p.id}', '${munObj.id}')"
                      class="py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition flex items-center justify-center gap-1 cursor-pointer shadow-xs">
                      <span>Enfocar ➔</span>
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    } else {
      // VISTA DETALLADA / DRILLDOWN DE SUBPARROQUIAS Y SECTORES
      const pId = this.modalDrilldownParish.parishId;
      const rawPId = this.modalDrilldownParish.rawParishId;
      const mId = this.modalDrilldownParish.munId;
      const pObj = (munObj.parroquias || []).find(p => resolveParishId(p.id) === pId || p.id === rawPId) || { id: pId, nombre: formatTitleCase(pId) };
      const pDem = getParishDemographics(pId, mId) || {};
      const pComando = COMANDOS_PARROQUIALES[pId] || getComandoInfo("parroquia", pId, pId, mId);
      const { subparroquias, poligonos } = this.getParishPolygonsData(mId, pId);

      mainHtml += `
        <!-- HEADER DRILLDOWN CON BOTÓN DE RETORNO -->
        <div class="bg-[#140e40] border border-[#2d1f85] rounded-2xl p-3.5 space-y-3 shadow-md">
          <div class="flex items-center justify-between gap-2 pb-2 border-b border-[#2d1f85]/70">
            <button type="button" onclick="window.laminaApp?.backFromParishDrilldown()"
              class="px-2.5 py-1 rounded-xl bg-[#0e092e] hover:bg-[#23176d] text-sky-300 hover:text-white border border-[#2d1f85] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
              <span>⬅ Volver a Parroquias de ${(munObj.nombre || munObj.id).replace(/^Municipio\s+/i, '')}</span>
            </button>
            <button type="button" onclick="window.laminaApp?.focusAndClose('parroquia', '${rawPId}', '${mId}')"
              class="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-1 cursor-pointer shadow-xs">
              <i data-lucide="crosshair" class="w-3.5 h-3.5"></i>
              <span>Enfocar Parroquia</span>
            </button>
          </div>

          <div>
            <span class="text-[10px] font-black uppercase text-amber-400 tracking-widest block">DESGLOSE TERRITORIAL Y CENTROS CNE</span>
            <h2 class="text-base sm:text-lg font-black text-white">
              📍 Parroquia ${pObj.nombre}
            </h2>
            <div class="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1">
              <span>👤 <strong>Jefe Parroquial:</strong> ${pComando?.responsableGeneral || pComando?.general || 'Coordinador Parroquia'}</span>
              <span class="font-mono text-emerald-400 font-bold">📱 ${pComando?.telefono || '+58 412-0000000'}</span>
              <span class="font-mono text-sky-300">🗳️ ${Number(pDem.votantes || 0).toLocaleString("es-VE")} Electores</span>
              <span class="font-mono text-indigo-300">🏫 ${Number(pDem.centros || 0).toLocaleString("es-VE")} Centros CNE</span>
            </div>
          </div>
        </div>

        <!-- LISTADO DE SUBPARROQUIAS Y SECTORES -->
        <div class="space-y-3">
      `;

      if (subparroquias.length > 0) {
        subparroquias.forEach(sp => {
          const spSectores = poligonos.filter(sec => sec.subParroquiaId === sp.id || (sec.eje && sec.eje.includes(sp.nombre)));
          mainHtml += `
            <div class="bg-[#140e40] border border-[#2d1f85] rounded-2xl p-3 space-y-2">
              <div class="flex items-center justify-between border-b border-[#2d1f85]/60 pb-1.5">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  <strong class="text-xs sm:text-sm font-black text-white">${sp.nombre}</strong>
                </div>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  ${spSectores.length || sp.sectoresCount || 0} sectores
                </span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
                ${(spSectores.length > 0 ? spSectores : poligonos).map(sec => `
                  <div class="p-2 rounded-xl bg-[#0e092e] border border-[#2d1f85] flex flex-col justify-between gap-1 text-xs">
                    <div>
                      <strong class="text-xs font-black text-slate-100 block truncate">${sec.nombre}</strong>
                      <span class="text-[10px] text-slate-400 block truncate">${sec.centroVotacion || 'Comunidad'}</span>
                    </div>
                    <div class="flex items-center justify-between text-[10px] text-slate-300 border-t border-[#2d1f85]/50 pt-1">
                      <span class="font-mono text-sky-400">${sec.votantes ? `${Number(sec.votantes).toLocaleString("es-VE")} vot.` : 'Padrón CNE'}</span>
                      <button type="button" onclick="window.laminaApp?.focusAndClose('sector', '${sec.id}', '${pId}', '${mId}')"
                        class="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] rounded transition cursor-pointer">
                        Enfocar ➔
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        });
      } else if (poligonos.length > 0) {
        mainHtml += `
          <div class="bg-[#140e40] border border-[#2d1f85] rounded-2xl p-3 space-y-2">
            <span class="text-xs font-black uppercase text-slate-300 block mb-1">Sectores Vecinales (${poligonos.length})</span>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              ${poligonos.map(sec => `
                <div class="p-2 rounded-xl bg-[#0e092e] border border-[#2d1f85] flex flex-col justify-between gap-1 text-xs">
                  <div>
                    <strong class="text-xs font-black text-slate-100 block truncate">${sec.nombre}</strong>
                    <span class="text-[10px] text-slate-400 block truncate">${sec.centroVotacion || 'Sector Comunitario'}</span>
                  </div>
                  <div class="flex items-center justify-between text-[10px] text-slate-300 border-t border-[#2d1f85]/50 pt-1">
                    <span class="font-mono text-sky-400">${sec.votantes ? `${Number(sec.votantes).toLocaleString("es-VE")} vot.` : 'Padrón CNE'}</span>
                    <button type="button" onclick="window.laminaApp?.focusAndClose('sector', '${sec.id}', '${pId}', '${mId}')"
                      class="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] rounded transition cursor-pointer">
                      Enfocar ➔
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else {
        mainHtml += `
          <div class="text-center py-8 bg-[#140e40] rounded-2xl border border-[#2d1f85] p-5">
            <p class="text-xs text-slate-300 font-bold">Esta parroquia cuenta con padrón oficial consolidado.</p>
            <button type="button" onclick="window.laminaApp?.focusAndClose('parroquia', '${rawPId}', '${mId}')"
              class="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer">
              Enfocar Parroquia en Satélite ➔
            </button>
          </div>
        `;
      }

      mainHtml += `</div>`;
    }

    mainHtml += `
        </div>
      </div>
    `;

    container.innerHTML = mainHtml;
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      try { window.lucide.createIcons(); } catch(e){}
    }
  }
}

// Inicialización Segura y Exposición Global para Pantallas de Alta Resolución
function initLaminaApp() {
  if (!window.laminaApp) {
    window.laminaApp = new LaminaApp();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLaminaApp);
} else {
  initLaminaApp();
}
