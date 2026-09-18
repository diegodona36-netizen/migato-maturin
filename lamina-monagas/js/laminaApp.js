/**
 * ==========================================================================
 * LÁMINA CARTOGRÁFICA EJECUTIVA 120" — SALA SITUACIONAL ESTADO MONAGAS 2026
 * Controlador Cartográfico Acelerado por GPU para Proyección y Exportación
 * ==========================================================================
 */

import { GEO_ESTADO_OFICIAL, GEO_MUNICIPIOS_OFICIAL, GEO_PARROQUIAS_OFICIAL } from "../../earth-monagas/js/geoOficialMonagas.js?v=230";
import { CATALOGO_MONAGAS, PARISH_ALIAS_MAP, resolveParishId } from "../../earth-monagas/js/catalogoMonagas.js?v=230";
import { getParishDemographics, getMunicipioDemographics, getParishColor, PARISH_COLORS } from "../../earth-monagas/js/monagasDemographics.js?v=230";
import { 
  getMunicipios, 
  getParroquiasByMun, 
  getEjesByParish, 
  getSectoresByEje, 
  getSectoresByParish, 
  findSectorById, 
  ALL_SECTORES_FLAT 
} from "../../earth-monagas/js/monagasSectoresCatalog.js?v=230";
import { SUBPARROQUIAS_MONAGAS, SUBPARROQUIAS_GODOS, SECTORES_LAPUENTE } from "../../earth-monagas/js/geoMonagas.js?v=230";
import { getComandoInfo, getAssignedLeader, saveAssignedComando } from "./comandoData.js";
import { auditLogger } from "./auditLogger.js";

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
    this.level = "municipio"; // "estado" | "municipio" | "parroquia" | "subparroquia" | "sector"
    this.activeMunId = "maturin";
    this.activeParishId = null;
    this.activeSubParishId = null;
    this.activeSectorId = null;
    this.activeSubParishName = null;
    this.activeSectorName = null;

    // Foco fijo de parroquia para no alterar el zoom en subparroquias ni sectores
    this.currentParishBounds = null;
    this.currentParishRings = null;

    // Capas Leaflet
    this.maskLayer = null;
    this.boundaryLayer = null;
    this.childEntitiesLayer = null;
    this.centrosLayer = null;

    this.activeTab = "stats"; // "stats" | "symbols"
    this.showCentros = true;

    this.init();
  }

  init() {
    this.initMap();
    this.initUIListeners();
    this.parseURLParams();
  }

  initMap() {
    // Canvas acelerado por GPU
    const canvasRenderer = L.canvas({ padding: 0.5 });

    // Satélite Google Híbrido HD
    const googleHybrid = L.tileLayer(
      "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
      { maxZoom: 21, maxNativeZoom: 20, attribution: "" }
    );

    this.map = L.map("map-lamina", {
      center: [9.7469, -63.1812],
      zoom: 12,
      preferCanvas: true,
      renderer: canvasRenderer,
      zoomControl: false,
      attributionControl: false,
      layers: [googleHybrid]
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
  }

  parseURLParams() {
    const params = new URLSearchParams(window.location.search);
    const m = params.get("m") || "maturin";
    const p = params.get("p");
    const sp = params.get("sp");
    const sec = params.get("sec");

    this.activeMunId = m;
    if (sec) {
      this.selectSector(sec, p, m);
    } else if (sp) {
      this.selectSubParroquia(sp, p, m);
    } else if (p) {
      this.selectParroquia(p, m);
    } else {
      this.selectMunicipio(m);
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
        if (p) p.classList.toggle("minimized");
      });
    }

    // Botón Pantalla Completa
    const btnFull = document.getElementById("btn-fullscreen");
    if (btnFull) {
      btnFull.addEventListener("click", () => this.toggleFullscreen());
    }

    // Modal de Asignación Directa de Comando Sectorial
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
  }

  openAsignarModal(entityId, entityName = "", parroquiaId = "") {
    const modal = document.getElementById("modal-asignar-comando");
    if (!modal) return;

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
    if (titleEl) titleEl.textContent = `Asignar Responsable: ${displayName}`;
    if (subEl) subEl.textContent = `Polígono / Entidad ID: ${targetId}`;

    // Cargar datos previos si existen
    const prevAssigned = getAssignedLeader(targetId);
    if (prevAssigned) {
      if (inputNombre) inputNombre.value = prevAssigned.nombre || "";
      if (inputTelf) inputTelf.value = prevAssigned.telefono || "";
      if (inputCargo) inputCargo.value = prevAssigned.cargo || "Jefe de Comando Sectorial";
      if (inputProf) inputProf.value = prevAssigned.profesion || prevAssigned.cedula || "";
    } else {
      const info = getComandoInfo(this.level, targetId, targetPId, this.activeMunId);
      if (inputNombre) inputNombre.value = (info && info.general && !info.general.includes("Coordinador") && !info.general.includes("Responsable")) ? info.general : "";
      if (inputTelf) inputTelf.value = (info && info.telefono && !info.telefono.includes("0000")) ? info.telefono : "";
      if (inputCargo) inputCargo.value = "Jefe de Comando Sectorial";
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
    auditLogger.logEvent("ASIGNACION_COMANDO_SECTORIAL", { id, payload });

    this.closeAsignarModal();

    // Refrescar vistas en vivo
    this.renderComandoSection();
    if (this.level === "parroquia") {
      this.selectParroquia(this.activeParishId, this.activeMunId);
    } else if (this.level === "subparroquia") {
      this.selectSubParroquia(this.activeSubParishId, this.activeParishId, this.activeMunId);
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

    if (tabName === "comando") {
      this.renderComandoSection();
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

    // 1. Polígono Inverso: WORLD_BOX exterior + anillos interiores recortados
    const maskPoly = L.polygon([WORLD_BOX, ...normalizedRings], {
      pane: "spotlightPane",
      fillColor: "#ffffff",
      fillOpacity: 0.96,
      color: "#ffffff",
      weight: 2,
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
  selectEstado() {
    this.level = "estado";
    this.activeMunId = null;
    this.activeParishId = null;
    this.activeSubParishId = null;
    this.activeSectorId = null;

    const feat = GEO_ESTADO_OFICIAL.features ? GEO_ESTADO_OFICIAL.features[0] : GEO_ESTADO_OFICIAL;
    const rings = this.geoJsonCoordsToLeaflet(feat.geometry);

    this.applySpotlightMask(rings, "#f59e0b", 4);
    this.childEntitiesLayer.clearLayers();
    this.centrosLayer.clearLayers();

    // Dibujar los 13 Municipios en el canvas con colores diferenciados
    (GEO_MUNICIPIOS_OFICIAL.features || []).forEach(f => {
      const mId = f.properties?.id;
      const munColor = f.properties?.color || (CATALOGO_MONAGAS || []).find(m => m.id === mId)?.color || "#0284c7";
      const mName = f.properties?.nombre || "Municipio";
      const layer = L.geoJSON(f, {
        style: {
          color: munColor,
          weight: 2.2,
          opacity: 0.95,
          fillColor: munColor,
          fillOpacity: 0.22
        }
      });
      layer.on({
        mouseover: () => layer.setStyle({ weight: 3.8, fillOpacity: 0.45 }),
        mouseout: () => layer.setStyle({ weight: 2.2, fillOpacity: 0.22 }),
        click: () => this.selectMunicipio(mId)
      });
      this.childEntitiesLayer.addLayer(layer);
    });

    if (rings && rings.length > 0) {
      try {
        const bounds = L.polygon(rings).getBounds();
        this.map.flyToBounds(bounds, { padding: [40, 40], duration: 1.2 });
      } catch(e){}
    }

    this.updateHeaderUI("ESTADO MONAGAS", "13 MUNICIPIOS • SALA SITUACIONAL 2026");
    this.renderSideStats({
      title: "ESTADO MONAGAS",
      color: "#f59e0b",
      type: "Resumen Estadal",
      code: "13 MUNICIPIOS",
      hab: "1,020,000",
      vot: "678,920",
      cen: "536 Centros",
      cas: "285,000",
      listTitle: "Municipios (Clic para enfocar)",
      listCount: (GEO_MUNICIPIOS_OFICIAL.features || []).length,
      items: (CATALOGO_MONAGAS || []).map(m => {
        const feat = (GEO_MUNICIPIOS_OFICIAL.features || []).find(f => f.properties?.id === m.id);
        const color = feat?.properties?.color || m.color || "#0284c7";
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
    this.updateBreadcrumbs();
    auditLogger.logEvent("SELECCION_ESTADO", { entidad: "Estado Monagas" });
  }

  // 2. NIVEL MUNICIPIO (MATURÍN)
  selectMunicipio(munId = "maturin") {
    this.level = "municipio";
    this.activeMunId = munId;
    this.activeParishId = null;
    this.activeSubParishId = null;
    this.activeSectorId = null;

    const cleanMunId = String(munId).toLowerCase().replace(/_/g, "-").trim();
    const feat = (GEO_MUNICIPIOS_OFICIAL.features || []).find(f => {
      const id = String(f.properties?.id || f.properties?.ADM2_ES || "").toLowerCase().replace(/_/g, "-").trim();
      return id === cleanMunId || id.includes(cleanMunId) || cleanMunId.includes(id);
    });

    const rings = feat ? this.geoJsonCoordsToLeaflet(feat.geometry) : [];
    this.applySpotlightMask(rings, "#0284c7", 3.5);
    this.childEntitiesLayer.clearLayers();
    this.centrosLayer.clearLayers();

    const munObj = CATALOGO_MONAGAS.find(m => m.id === cleanMunId) || { id: "maturin", nombre: "Maturín", parroquias: [] };
    const rawMunName = munObj.nombre || "Maturín";
    const cleanMunName = rawMunName.replace(/^municipio\s+/i, '').trim();

    // Renderizar las 11 Parroquias oficiales con sus colores asignados
    const parishFeats = (GEO_PARROQUIAS_OFICIAL.features || []).filter(f => {
      const fMun = String(f.properties?.municipioId || f.properties?.ADM2_ES || "maturin").toLowerCase().replace(/_/g, "-").trim();
      return fMun === cleanMunId || fMun.includes(cleanMunId) || cleanMunId.includes(fMun);
    });

    parishFeats.forEach(f => {
      const pId = f.properties?.id;
      const resolvedPId = resolveParishId(pId);
      const pColor = getParishColor(resolvedPId);
      const pName = f.properties?.nombre || "Parroquia";

      const layer = L.geoJSON(f, {
        style: {
          color: pColor,
          weight: 2,
          opacity: 0.95,
          fillColor: pColor,
          fillOpacity: 0.22,
          dashArray: "5, 4"
        }
      });

      layer.on({
        mouseover: () => {
          layer.setStyle({ weight: 3.8, fillOpacity: 0.45 });
        },
        mouseout: () => {
          layer.setStyle({ weight: 2, fillOpacity: 0.22 });
        },
        click: () => {
          this.selectParroquia(pId, cleanMunId);
        }
      });
      this.childEntitiesLayer.addLayer(layer);

      // Tooltip suave al pasar el cursor (sin saturar la pantalla con etiquetas fijas)
      layer.bindTooltip(`
        <div style="font-family: inherit; font-size: 11px; padding: 2px;">
          <span style="color: #64748b; font-weight: 800; font-size: 9px; text-transform: uppercase;">Parroquia Oficial</span><br>
          <strong style="color: #0f172a; font-size: 12px; font-weight: 900;">${pName.toUpperCase()}</strong>
        </div>
      `, { sticky: true, opacity: 0.95 });
    });

    if (rings && rings.length > 0) {
      try {
        const bounds = Array.isArray(rings[0][0]) ? L.polygon(rings[0]).getBounds() : L.polygon(rings).getBounds();
        this.map.flyToBounds(bounds, { padding: [40, 40], duration: 1.2 });
      } catch(e){}
    }

    const munDem = getMunicipioDemographics(cleanMunId);
    this.updateHeaderUI(`MUNICIPIO ${cleanMunName.toUpperCase()}`, `ESTADO MONAGAS • ${(munObj.parroquias || []).length} PARROQUIAS OFICIALES`);
    this.renderSideStats({
      title: `MUNICIPIO ${cleanMunName.toUpperCase()}`,
      color: "#0284c7",
      type: "Resumen Municipal Oficial",
      sub: `Estado Monagas • ${(munObj.parroquias || []).length} Parroquias`,
      code: `${(munObj.parroquias || []).length} PARROQUIAS`,
      hab: munDem?.habitantes ? munDem.habitantes.toLocaleString("es-VE") : "547,000",
      vot: munDem?.votantes ? munDem.votantes.toLocaleString("es-VE") : "346,988",
      cen: munDem?.centros ? `${munDem.centros} Centros` : "175 Centros",
      cas: munDem?.casas ? munDem.casas.toLocaleString("es-VE") : "153,600",
      listTitle: "Parroquias (Clic para enfocar)",
      listCount: (munObj.parroquias || []).length,
      items: (munObj.parroquias || []).map(p => {
        const resolvedPId = resolveParishId(p.id);
        const pColor = getParishColor(resolvedPId);
        const pDem = getParishDemographics(cleanMunId, resolvedPId);
        return {
          id: p.id,
          nombre: p.nombre,
          color: pColor,
          badge: pDem?.votantes ? `${pDem.votantes.toLocaleString("es-VE")} elect.` : "Ver",
          onClick: `laminaApp.selectParroquia('${p.id}', '${cleanMunId}')`
        };
      })
    });
    this.renderComandoSection();
    this.updateBreadcrumbs();
    auditLogger.logEvent("SELECCION_MUNICIPIO", { municipioId: cleanMunId, nombre: munObj.nombre });
  }

  /**
   * Obtiene las subparroquias y polígonos comunitarios idénticos al Módulo 4 (Earth Monagas)
   * 1. Consulta primero el almacenamiento local de Módulo 4 (earth_monagas_places_v10_prod)
   * 2. Si no hay datos en caché local, carga los catálogos nativos completos de Módulo 4:
   *    - SUBPARROQUIAS_MONAGAS (10 subparroquias oficiales con polígono)
   *    - SUBPARROQUIAS_GODOS (Trazo de alta precisión de La Puente)
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
      if (subparroquias.length === 0) {
        // Cargar las 10 subparroquias oficiales del Módulo 4
        subparroquias = (SUBPARROQUIAS_MONAGAS || []).map(sp => ({
          id: sp.id,
          nombre: sp.nombre,
          alias: sp.alias || sp.nombre,
          colorBorde: sp.colorBorde || "#c084fc",
          colorRelleno: sp.colorRelleno || "#a855f7",
          anchoBorde: 2.5,
          vertices: sp.vertices || sp.poligono,
          sectoresCount: sp.sectoresCount || 0
        }));

        // Integrar el trazo de alta precisión de La Puente de SUBPARROQUIAS_GODOS
        if (Array.isArray(SUBPARROQUIAS_GODOS) && SUBPARROQUIAS_GODOS.length > 0) {
          SUBPARROQUIAS_GODOS.forEach(gSp => {
            const idx = subparroquias.findIndex(s => s.id === gSp.id || String(s.nombre).toLowerCase().includes("puente"));
            if (idx >= 0) {
              subparroquias[idx] = { ...subparroquias[idx], ...gSp, vertices: gSp.vertices || gSp.poligono };
            } else {
              subparroquias.push({ ...gSp, vertices: gSp.vertices || gSp.poligono });
            }
          });
        }
      }

      if (poligonos.length === 0) {
        // Cargar los 18 sectores comunitarios de La Puente de Módulo 4
        poligonos = (SECTORES_LAPUENTE || []).map(sec => ({
          ...sec,
          vertices: sec.vertices || sec.poligono
        }));
      }
    }

    return { subparroquias, poligonos };
  }

  // 3. NIVEL PARROQUIA (ALTO DE LOS GODOS, LA PICA, SAN SIMÓN, ETC.)
  selectParroquia(parishId, munId = "maturin") {
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
    const pColor = getParishColor(resolvedPId);

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

    // Ajustar cámara a la parroquia como cota máxima de zoom
    if (rings && rings.length > 0) {
      try {
        const bounds = Array.isArray(rings[0][0]) ? L.polygon(rings[0]).getBounds() : L.polygon(rings).getBounds();
        this.currentParishBounds = bounds;
        this.map.flyToBounds(bounds, { padding: [40, 40], duration: 1.0 });
      } catch(e){}
    }

    const rawPName = feat?.properties?.nombre || (CATALOGO_MONAGAS.find(m => m.id === cleanMunId)?.parroquias || []).find(p => p.id === cleanPId)?.nombre || cleanPId;
    const cleanPName = formatTitleCase(rawPName);

    // Obtener subparroquias y sectores para el directorio lateral y el mapa
    const { subparroquias, poligonos } = this.getParishPolygonsData(cleanMunId, resolvedPId);

    // DIBUJAR LOS POLÍGONOS DE TODAS LAS SUBPARROQUIAS (EJES) EN EL MAPA
    if (subparroquias && subparroquias.length > 0) {
      subparroquias.forEach(sp => {
        const coords = sp.vertices || sp.poligono;
        if (coords && coords.length >= 3) {
          const spColor = sp.colorBorde || sp.color || "#8b5cf6";
          const spPoly = L.polygon(coords, {
            color: spColor,
            weight: 2.2,
            opacity: 0.95,
            fillColor: sp.colorRelleno || spColor,
            fillOpacity: 0.22,
            dashArray: "4, 4"
          });

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
        if (coords && coords.length >= 3) {
          const sColor = sec.colorBorde || sec.color || "#0284c7";
          const secPoly = L.polygon(coords, {
            color: sColor,
            weight: 1.8,
            opacity: 0.9,
            fillColor: sec.colorRelleno || sColor,
            fillOpacity: 0.2,
            dashArray: "3, 3"
          });

          secPoly.bindTooltip(`
            <div style="font-family: inherit; font-size: 11px; padding: 2px;">
              <span style="color: #0284c7; font-weight: 800; font-size: 9.5px; text-transform: uppercase;">Sector Comunitario</span><br>
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

    const pDem = getParishDemographics(cleanMunId, resolvedPId);
    this.updateHeaderUI(`PARROQUIA ${cleanPName.toUpperCase()}`, `MUNICIPIO MATURÍN • ESTADO MONAGAS`);
    
    // Preparar lista amigable de sectores/ejes para el panel lateral
    let listItems = [];
    if (subparroquias && subparroquias.length > 0) {
      listItems = subparroquias.map(sp => ({
        id: sp.id,
        nombre: sp.nombre,
        color: sp.colorBorde || pColor,
        badge: `${(sp.sectores || []).length || sp.sectoresCount || 1} sect.`,
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

    this.renderSideStats({
      title: cleanPName.toUpperCase(),
      color: pColor,
      type: "Parroquia Oficial",
      sub: "Municipio Maturín • Estado Monagas",
      code: "OFICIAL CNE",
      hab: pDem?.habitantes ? pDem.habitantes.toLocaleString("es-VE") : "—",
      vot: pDem?.votantes ? pDem.votantes.toLocaleString("es-VE") : "—",
      cen: pDem?.centros ? `${pDem.centros} Centros` : "—",
      cas: pDem?.casas ? pDem.casas.toLocaleString("es-VE") : "—",
      listTitle: subparroquias.length > 0 ? "Ejes Territoriales / Sub-Parroquias" : "Sectores Censados",
      listCount: listItems.length,
      backBtn: {
        label: "Ver todas las 11 parroquias",
        count: 11,
        onClick: `laminaApp.selectMunicipio('${cleanMunId}')`
      },
      items: listItems
    });
    this.renderComandoSection();
    this.updateBreadcrumbs();
    auditLogger.logEvent("SELECCION_PARROQUIA", { parroquiaId: cleanPId, municipioId: cleanMunId, nombre: cleanPName });
  }

  // 4. NIVEL SUB-PARROQUIA / EJE TERRITORIAL (EL MAPA SE QUEDA EN ZOOM PARROQUIAL)
  selectSubParroquia(spId, parishId = "alto-de-los-godos", munId = "maturin") {
    this.level = "subparroquia";
    this.activeMunId = munId;
    this.activeParishId = parishId;
    this.activeSubParishId = spId;
    this.activeSectorId = null;

    const cleanMunId = String(munId || "maturin").toLowerCase().replace(/_/g, "-").trim();
    const cleanPId = resolveParishId(parishId);
    const pColor = getParishColor(cleanPId);

    this.childEntitiesLayer.clearLayers();
    this.centrosLayer.clearLayers();

    const { subparroquias, poligonos } = this.getParishPolygonsData(cleanMunId, cleanPId);

    // Buscar el eje
    const eje = subparroquias.find(e => String(e.id) === String(spId) || String(e.nombre).toLowerCase().includes(String(spId).toLowerCase())) || { id: spId, nombre: spId };
    this.activeSubParishName = eje.nombre;

    // REGLA CRÍTICA: Mantener el zoom y el Velo Blanco fijos en la PARROQUIA
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
    if (this.currentParishBounds) {
      this.map.flyToBounds(this.currentParishBounds, { padding: [40, 40], duration: 0.8 });
    }

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
      if (sCoords && sCoords.length >= 3) {
        const secPoly = L.polygon(sCoords, {
          color: sec.colorBorde || sec.color || "#0284c7",
          weight: 1.8,
          opacity: 0.95,
          fillColor: sec.colorRelleno || sec.color || "#38bdf8",
          fillOpacity: 0.28
        });
        secPoly.bindTooltip(`
          <div style="font-family: inherit; font-size: 11px; padding: 2px;">
            <span style="color: #0284c7; font-weight: 800; font-size: 9.5px; text-transform: uppercase;">Sector Comunitario</span><br>
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

    const cleanPName = formatTitleCase(cleanPId);

    this.updateHeaderUI(`${formatTitleCase(eje.nombre).toUpperCase()}`, `PARROQUIA ${cleanPName.toUpperCase()} • MUNICIPIO MATURÍN`);
    this.renderSideStats({
      title: formatTitleCase(eje.nombre).toUpperCase(),
      color: eje.colorBorde || "#a855f7",
      type: "Eje Comunal / Sub-Parroquia",
      sub: `Parroquia ${cleanPName} • Maturín`,
      code: "TERRITORIO",
      hab: eje.habitantes ? eje.habitantes.toLocaleString("es-VE") : "16,162",
      vot: eje.electores ? eje.electores.toLocaleString("es-VE") : "10,728",
      cen: eje.centros ? `${eje.centros} Centros` : "5 Centros",
      cas: eje.casas ? eje.casas.toLocaleString("es-VE") : "5,309",
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
    this.updateBreadcrumbs();
    auditLogger.logEvent("SELECCION_SUBPARROQUIA_EJE", { ejeId: spId, parroquiaId: cleanPId, municipioId: cleanMunId, nombre: eje.nombre });
  }

  // 5. NIVEL SECTOR VECINAL (EL MAPA SE QUEDA EN ZOOM PARROQUIAL)
  selectSector(secId, parishId = "alto-de-los-godos", munId = "maturin") {
    this.level = "sector";
    this.activeMunId = munId;
    this.activeParishId = parishId;
    this.activeSectorId = secId;

    const cleanMunId = String(munId || "maturin").toLowerCase().replace(/_/g, "-").trim();
    const cleanPId = resolveParishId(parishId);
    const pColor = getParishColor(cleanPId);

    this.childEntitiesLayer.clearLayers();
    this.centrosLayer.clearLayers();

    const { subparroquias, poligonos } = this.getParishPolygonsData(cleanMunId, cleanPId);
    let sec = poligonos.find(s => String(s.id) === String(secId) || String(s.nombre).toLowerCase() === String(secId).toLowerCase()) || findSectorById(secId);
    if (!sec) {
      sec = { id: secId, nombre: secId };
    }
    this.activeSectorName = sec.nombre;

    // REGLA CRÍTICA: Mantener el zoom y el Velo Blanco fijos en la PARROQUIA
    if (this.currentParishRings && this.currentParishRings.length > 0) {
      this.applySpotlightMask(this.currentParishRings, pColor, 3.5);
    }
    if (this.currentParishBounds) {
      this.map.flyToBounds(this.currentParishBounds, { padding: [40, 40], duration: 0.8 });
    }

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
      if (sCoords && sCoords.length >= 3) {
        const otherSecPoly = L.polygon(sCoords, {
          color: "#94a3b8",
          weight: 1.2,
          opacity: 0.6,
          fillColor: "#e2e8f0",
          fillOpacity: 0.15
        });
        otherSecPoly.bindTooltip(`<strong>${formatTitleCase(s.nombre)}</strong>`, { sticky: true, opacity: 0.85 });
        otherSecPoly.on("click", () => this.selectSector(s.id, cleanPId, cleanMunId));
        this.childEntitiesLayer.addLayer(otherSecPoly);
      }
    });

    // 3. Destacar el polígono del sector seleccionado con máxima nitidez
    const sCoords = sec.vertices || sec.poligono;
    if (sCoords && sCoords.length >= 3) {
      const secPoly = L.polygon(sCoords, {
        color: sec.colorBorde || sec.color || "#0284c7",
        weight: 3.8,
        opacity: 1,
        fillColor: sec.colorRelleno || sec.color || "#38bdf8",
        fillOpacity: 0.55
      });
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

    if (markerPos) {
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
    const cleanSecName = formatTitleCase(sec.nombre);

    this.updateHeaderUI(`SECTOR ${cleanSecName.toUpperCase()}`, `PARROQUIA ${cleanPName.toUpperCase()} • MUNICIPIO MATURÍN`);
    this.renderSideStats({
      title: `SECTOR ${cleanSecName.toUpperCase()}`,
      color: sec.colorBorde || sec.color || pColor,
      type: "Sector Comunitario",
      sub: `Parroquia ${cleanPName} • Maturín`,
      code: "CENSADO",
      hab: sec.habitantes ? sec.habitantes.toLocaleString("es-VE") : "2,450",
      vot: sec.electores ? sec.electores.toLocaleString("es-VE") : "1,200",
      cen: sec.centroVotacion || "1 Centro CNE",
      cas: sec.casas ? sec.casas.toLocaleString("es-VE") : "640",
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
    this.updateBreadcrumbs();
    auditLogger.logEvent("SELECCION_SECTOR", { sectorId: secId, parroquiaId: cleanPId, municipioId: cleanMunId, nombre: cleanSecName });
  }

  // Renderizar centros de votación en el mapa
  renderCentrosVotacion(parishId) {
    this.centrosLayer.clearLayers();
    if (typeof window.CENTROS_MATURIN === "undefined" || !Array.isArray(window.CENTROS_MATURIN)) {
      return;
    }

    const centros = window.CENTROS_MATURIN.filter(c => {
      const cParish = resolveParishId(c.parroquia);
      return cParish === parishId || c.parroquia === parishId;
    });

    centros.forEach(c => {
      if (!c.lat || !c.lng) return;

      const marker = L.circleMarker([c.lat, c.lng], {
        radius: 6,
        fillColor: "#e11d48",
        fillOpacity: 0.95,
        color: "#ffffff",
        weight: 1.5
      });

      marker.on("click", () => {
        const info = `
          <strong>${c.nombre}</strong><br>
          Electores: ${c.electores?.toLocaleString() || '—'}<br>
          Mesas: ${c.mesas || 1}
        `;
        alert(`🗳️ Centro CNE: ${c.nombre}\nElectores: ${c.electores}\nMesas: ${c.mesas}`);
      });

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

    let html = `
      <span class="breadcrumb-item ${this.level === 'estado' ? 'active' : ''}" onclick="laminaApp.selectEstado()">
        <span>🇻🇪 Monagas</span>
      </span>
    `;

    if (this.activeMunId) {
      const munObj = CATALOGO_MONAGAS.find(m => m.id === this.activeMunId) || { nombre: "Maturín" };
      html += `
        <span class="text-slate-400">/</span>
        <span class="breadcrumb-item ${this.level === 'municipio' ? 'active' : ''}" onclick="laminaApp.selectMunicipio('${this.activeMunId}')">
          <span>${munObj.nombre}</span>
        </span>
      `;
    }

    if (this.activeParishId) {
      const pObj = (CATALOGO_MONAGAS.find(m => m.id === this.activeMunId)?.parroquias || []).find(p => p.id === this.activeParishId) || { nombre: this.activeParishId };
      html += `
        <span class="text-slate-400">/</span>
        <span class="breadcrumb-item ${this.level === 'parroquia' ? 'active' : ''}" onclick="laminaApp.selectParroquia('${this.activeParishId}', '${this.activeMunId}')">
          <span>${pObj.nombre}</span>
        </span>
      `;
    }

    if (this.activeSubParishId) {
      const spTitle = this.activeSubParishName ? formatTitleCase(this.activeSubParishName) : "Eje";
      html += `
        <span class="text-slate-400">/</span>
        <span class="breadcrumb-item ${this.level === 'subparroquia' ? 'active' : ''}" onclick="laminaApp.selectSubParroquia('${this.activeSubParishId}', '${this.activeParishId}', '${this.activeMunId}')">
          <span>${spTitle}</span>
        </span>
      `;
    }

    if (this.activeSectorId) {
      const secTitle = this.activeSectorName ? formatTitleCase(this.activeSectorName) : "Sector";
      html += `
        <span class="text-slate-400">/</span>
        <span class="breadcrumb-item ${this.level === 'sector' ? 'active' : ''}">
          <span>${secTitle}</span>
        </span>
      `;
    }

    bcContainer.innerHTML = html;
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
               title="${item.nombre} • Clic para enfocar">
            <div class="flex items-center gap-2 truncate">
              <span class="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" style="background-color: ${item.color || '#0284c7'};"></span>
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
    if (cargoEl) cargoEl.textContent = info.nivel.includes("Sectorial") ? "Comando Sectorial" : "Responsable Principal";
    if (nombreEl) nombreEl.textContent = info.general;
    if (divisionEl) divisionEl.textContent = info.division;
    if (telfEl) telfEl.innerHTML = `<span>📱</span><span>${info.telefono}</span>`;

    // Renderizar roles clave
    if (rolesContainer) {
      if (info.roles && info.roles.length > 0) {
        rolesContainer.innerHTML = info.roles.map(r => `
          <div class="comando-role-row">
            <div class="flex items-center gap-1.5 min-w-0">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
              <span class="role-title truncate">${r.cargo}:</span>
              <span class="role-person truncate font-semibold text-slate-800">${r.responsable}</span>
            </div>
            <span class="text-[9.5px] px-1.5 py-0.2 rounded font-bold uppercase ${r.estado === 'Activo' || r.estado === 'En Operación' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'}">
              ${r.estado}
            </span>
          </div>
        `).join("");
      } else {
        rolesContainer.innerHTML = "";
      }
    }

    // Subdirectorios según nivel
    if (subTitleEl) {
      if (this.level === "estado") subTitleEl.textContent = "Comandos Municipales (13)";
      else if (this.level === "municipio") subTitleEl.textContent = "Comandos Parroquiales";
      else if (this.level === "parroquia") subTitleEl.textContent = "Comandos Sectoriales / Ejes";
      else subTitleEl.textContent = "Centros y Sectores del Eje";
    }

    if (subCountEl) {
      subCountEl.textContent = String((info.subdirectorios || []).length || (info.centrosAsignados || []).length || 0);
    }

    if (listEl) {
      let html = "";
      if (info.subdirectorios && info.subdirectorios.length > 0) {
        html = info.subdirectorios.map(sub => `
          <div class="territory-row hover:border-amber-400 flex items-center justify-between gap-1">
            <div onclick="${sub.onClick}" 
                 class="flex flex-col min-w-0 flex-1 cursor-pointer" 
                 title="Ver comando de ${sub.nombre} • Clic para enfocar">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                <span class="font-bold text-xs text-slate-900 truncate">${sub.nombre}</span>
              </div>
              <span class="text-[10.5px] text-slate-500 truncate ml-3.5">
                👤 ${sub.responsable}
              </span>
            </div>
            <div class="flex items-center gap-1 shrink-0 ml-1">
              <button type="button" 
                      onclick="event.stopPropagation(); laminaApp.openAsignarModal('${sub.id}', '${sub.nombre.replace(/'/g, "\\'")}', '${this.activeParishId || 'alto-de-los-godos'}')"
                      class="px-1.5 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-black border border-amber-300 shadow-2xs transition active:scale-95 cursor-pointer"
                      title="Asignar o editar responsable">
                ✏️ Asignar
              </button>
              <span class="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                ${sub.parroquias ? `${sub.parroquias} parr.` : sub.centros ? `${sub.centros} centros` : 'Ver'}
              </span>
            </div>
          </div>
        `).join("");
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
