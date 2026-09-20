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
  ALL_SECTORES_FLAT,
  MONAGAS_TERRITORIO_COMPLETO
} from "../../earth-monagas/js/monagasSectoresCatalog.js?v=230";
import { SUBPARROQUIAS_MONAGAS, SUBPARROQUIAS_GODOS, SECTORES_LAPUENTE } from "../../earth-monagas/js/geoMonagas.js?v=230";
import { 
  getComandoInfo, 
  getAssignedLeader, 
  saveAssignedComando, 
  getLeaderPool,
  COMANDOS_MUNICIPALES,
  COMANDOS_PARROQUIALES,
  COMANDOS_SECTORIALES
} from "./comandoData.js?v=252";
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
  }

  refreshCurrentView() {
    if (this.level === "sector" && this.activeSectorId) {
      this.selectSector(this.activeSectorId, this.activeParishId, this.activeMunId);
    } else if (this.level === "subparroquia" && this.activeSubParishId) {
      this.selectSubParroquia(this.activeSubParishId, this.activeParishId, this.activeMunId);
    } else if (this.level === "parroquia" && this.activeParishId) {
      this.selectParroquia(this.activeParishId, this.activeMunId);
    } else if (this.level === "municipio" && this.activeMunId) {
      this.selectMunicipio(this.activeMunId);
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

    this.applySpotlightMask(rings, "#2563eb", 4);
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
      color: "#2563eb",
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
    this.renderSymbolsSection();
    this.updateBreadcrumbs();
    auditLogger.logEvent("SELECCION_ESTADO", { entidad: "Estado Monagas" });
  }

  // 2. NIVEL MUNICIPIO (MATURÍN, PIAR, CEDEÑO, ETC.)
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

    const munObj = CATALOGO_MONAGAS.find(m => m.id === cleanMunId) || { id: "maturin", nombre: "Maturín", color: "#2563eb", parroquias: [] };
    const rawMunName = munObj.nombre || "Maturín";
    const cleanMunName = rawMunName.replace(/^municipio\s+/i, '').trim();
    const munColor = munObj.color || (cleanMunId === "maturin" ? "#2563eb" : "#059669");

    const rings = feat ? this.geoJsonCoordsToLeaflet(feat.geometry) : [];
    this.applySpotlightMask(rings, munColor, 3.5);
    this.childEntitiesLayer.clearLayers();
    this.centrosLayer.clearLayers();

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
      color: munColor,
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
    this.renderSymbolsSection();
    this.updateBreadcrumbs();
    auditLogger.logEvent("SELECCION_MUNICIPIO", { municipioId: cleanMunId, nombre: munObj.nombre });
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

    const pDem = getParishDemographics(cleanMunId, resolvedPId);
    this.updateHeaderUI(`PARROQUIA ${cleanPName.toUpperCase()}`, `MUNICIPIO ${cleanMunName.toUpperCase()} • ESTADO MONAGAS`);
    
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
      sub: `Municipio ${cleanMunName} • Estado Monagas`,
      code: "OFICIAL CNE",
      hab: pDem?.habitantes ? pDem.habitantes.toLocaleString("es-VE") : "—",
      vot: pDem?.votantes ? pDem.votantes.toLocaleString("es-VE") : "—",
      cen: pDem?.centros ? `${pDem.centros} Centros` : "—",
      cas: pDem?.casas ? pDem.casas.toLocaleString("es-VE") : "—",
      listTitle: subparroquias.length > 0 ? "Ejes Territoriales / Sub-Parroquias" : "Sectores Censados",
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
    this.renderSideStats({
      title: formatTitleCase(eje.nombre).toUpperCase(),
      color: eje.colorBorde || "#a855f7",
      type: "Eje Territorial / Sub-Parroquia",
      sub: `Parroquia ${cleanPName} • ${cleanMunName}`,
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
    this.renderSymbolsSection();
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
    let cleanSecName = formatTitleCase(sec.nombre);
    if (/las\s+vigenes/i.test(cleanSecName)) cleanSecName = "Las Vírgenes";

    const munObj = CATALOGO_MONAGAS.find(m => m.id === cleanMunId) || { nombre: "Maturín" };
    const rawMunName = munObj.nombre || "Maturín";
    const cleanMunName = rawMunName.replace(/^municipio\s+/i, '').trim();

    this.updateHeaderUI(`SECTOR ${cleanSecName.toUpperCase()}`, `PARROQUIA ${cleanPName.toUpperCase()} • MUNICIPIO ${cleanMunName.toUpperCase()}`);
    this.renderSideStats({
      title: `SECTOR ${cleanSecName.toUpperCase()}`,
      color: sec.colorBorde || sec.color || pColor,
      type: "Sector Comunitario",
      sub: `Parroquia ${cleanPName} • ${cleanMunName}`,
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
    this.renderSymbolsSection();
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

    const items = [];

    // Nivel 1: Estado
    items.push(`
      <span class="breadcrumb-item ${this.level === 'estado' ? 'active' : ''}" onclick="laminaApp.selectEstado()" title="Ver todo el Estado Monagas">
        <span>🇻🇪 Monagas</span>
      </span>
    `);

    // Nivel 2: Municipio
    if (this.activeMunId) {
      const munObj = CATALOGO_MONAGAS.find(m => m.id === this.activeMunId) || { nombre: "Maturín" };
      const munClean = (munObj.nombre || "Maturín").replace(/^municipio\s+/i, '').trim();
      items.push(`
        <span class="breadcrumb-item ${this.level === 'municipio' ? 'active' : ''}" onclick="laminaApp.selectMunicipio('${this.activeMunId}')" title="Ver Municipio ${munClean}">
          <span>${munClean}</span>
        </span>
      `);
    }

    // Nivel 3: Parroquia
    if (this.activeParishId) {
      const pObj = (CATALOGO_MONAGAS.find(m => m.id === this.activeMunId)?.parroquias || []).find(p => p.id === this.activeParishId) || { nombre: this.activeParishId };
      const parishClean = (pObj.nombre || this.activeParishId).replace(/^parroquia\s+/i, '').trim();
      items.push(`
        <span class="breadcrumb-item ${this.level === 'parroquia' ? 'active' : ''}" onclick="laminaApp.selectParroquia('${this.activeParishId}', '${this.activeMunId}')" title="Ver Parroquia ${parishClean}">
          <span>${parishClean}</span>
        </span>
      `);
    }

    // Nivel 4: Sub-Parroquia / Eje
    if (this.activeSubParishId) {
      let spTitle = this.activeSubParishName ? formatTitleCase(this.activeSubParishName) : "Eje";
      spTitle = spTitle.replace(/^sub\s*parroquia\s*/i, 'Eje ').replace(/^eje\s*eje\s*/i, 'Eje ').trim();
      items.push(`
        <span class="breadcrumb-item ${this.level === 'subparroquia' ? 'active' : ''}" onclick="laminaApp.selectSubParroquia('${this.activeSubParishId}', '${this.activeParishId}', '${this.activeMunId}')" title="Ver ${spTitle}">
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
              <span class="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0"></span>
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
          <div class="territory-row hover:border-sky-400 flex items-center justify-between gap-1">
            <div onclick="${sub.onClick}" 
                 class="flex flex-col min-w-0 flex-1 cursor-pointer" 
                 title="Ver comando de ${sub.nombre} • Clic para enfocar">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-sky-500 shrink-0"></span>
                <span class="font-bold text-xs text-slate-900 truncate">${sub.nombre}</span>
              </div>
              <span class="text-[10.5px] text-slate-500 truncate ml-3.5">
                👤 ${sub.responsable}
              </span>
            </div>
            <div class="flex items-center gap-1 shrink-0 ml-1">
              <button type="button" 
                      onclick="event.stopPropagation(); laminaApp.openAsignarModal('${sub.id}', '${sub.nombre.replace(/'/g, "\\'")}', '${this.activeParishId || 'alto-de-los-godos'}')"
                      class="px-1.5 py-0.5 rounded bg-sky-100 hover:bg-sky-200 text-sky-900 text-[10px] font-black border border-sky-300 shadow-2xs transition active:scale-95 cursor-pointer"
                      title="Asignar o editar responsable">
                ✏️ Asignar
              </button>
              <span class="text-[10px] font-extrabold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
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

  // Renderizar la Leyenda Territorial Dinámica y Árbol Jerárquico de Mando
  renderSymbolsSection() {
    const listEl = document.getElementById("legend-territory-list");
    const titleEl = document.getElementById("legend-territory-title");
    const countEl = document.getElementById("legend-territory-count");
    if (!listEl) return;

    if (this.level === "estado") {
      if (titleEl) {
        titleEl.innerHTML = `
          <span class="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0"></span>
          <span class="truncate">Municipios de Monagas (13)</span>
        `;
      }
      const municipios = CATALOGO_MONAGAS || [];
      if (countEl) countEl.textContent = String(municipios.length);

      listEl.innerHTML = municipios.map(m => {
        const demo = getMunicipioDemographics(m.id);
        const mColor = m.color || (m.id === "maturin" ? "#2563eb" : "#059669");
        const munCmd = COMANDOS_MUNICIPALES[m.id] || {};
        const respName = munCmd.responsableGeneral || "Coordinador Municipal";
        const totalVot = demo?.votantes ? Number(demo.votantes).toLocaleString("es-VE") : "—";
        const parrCount = (m.parroquias || []).length;

        return `
          <div onclick="laminaApp.selectMunicipio('${m.id}')"
               class="territory-row hover:border-sky-400 flex flex-col gap-1 p-2 rounded-xl border border-slate-200 bg-white cursor-pointer transition shadow-2xs">
            <div class="flex items-center justify-between gap-1.5">
              <div class="flex items-center gap-2 min-w-0">
                <span class="w-3.5 h-3.5 rounded-md shrink-0 shadow-2xs border border-black/10" style="background-color: ${mColor};"></span>
                <strong class="text-xs font-black text-slate-900 truncate">${formatTitleCase(m.nombre)}</strong>
              </div>
              <span class="text-[9.5px] font-extrabold text-sky-800 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200 shrink-0 font-mono">
                ${parrCount} parr.
              </span>
            </div>
            <div class="flex items-center justify-between text-[10.5px] text-slate-600 pt-0.5 border-t border-slate-100">
              <span class="truncate">👤 <span class="font-semibold text-slate-800">${respName}</span></span>
              <span class="font-mono text-slate-400 shrink-0 text-[10px]">${totalVot} elect.</span>
            </div>
          </div>
        `;
      }).join("");

    } else if (this.level === "municipio") {
      const cleanMunId = String(this.activeMunId || "maturin").toLowerCase().replace(/_/g, "-").trim();
      const munObj = CATALOGO_MONAGAS.find(m => m.id === cleanMunId) || { nombre: "Maturín", parroquias: [] };
      const rawMunName = munObj.nombre || "Maturín";
      const cleanMunName = rawMunName.replace(/^municipio\s+/i, '').trim();
      const munCmd = COMANDOS_MUNICIPALES[cleanMunId] || {
        responsableGeneral: "Coordinación Municipal Maturín",
        telefono: "+58 414-7654321"
      };
      const munDem = getMunicipioDemographics(cleanMunId);
      const parroquias = munObj.parroquias || [];

      if (titleEl) {
        titleEl.innerHTML = `
          <span class="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0"></span>
          <span class="truncate">Parroquias de ${cleanMunName}</span>
        `;
      }
      if (countEl) countEl.textContent = String(parroquias.length);

      let html = `
        <!-- Nivel 1: Tarjeta Cabecera Municipal -->
        <div class="chain-breadcrumb-card mb-2 bg-gradient-to-r from-sky-50 to-blue-50/50 border border-sky-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <span class="w-3.5 h-3.5 rounded-md bg-sky-600 text-white text-[9px] font-black flex items-center justify-center shadow-2xs">🏛️</span>
              <span class="text-[9.5px] font-black uppercase text-sky-900 tracking-wider">Nivel 1 • Municipio Activo</span>
            </div>
            <span class="px-1.5 py-0.2 rounded bg-sky-200 text-sky-900 font-extrabold text-[9px]">Comando Municipal</span>
          </div>
          <div class="mt-1 flex items-center justify-between">
            <strong class="text-xs font-black text-slate-900">${cleanMunName.toUpperCase()}</strong>
            <span class="text-[10px] font-mono text-sky-900 font-bold">${munDem?.votantes ? Number(munDem.votantes).toLocaleString("es-VE") : "346,988"} elect.</span>
          </div>
          <div class="mt-1 pt-1 border-t border-sky-200/60 flex items-center justify-between text-[10.5px]">
            <span class="text-slate-800 font-bold truncate">👤 ${munCmd.responsableGeneral}</span>
            <span class="text-sky-700 font-mono text-[10px] shrink-0 font-bold">${munCmd.telefono}</span>
          </div>
        </div>

        <div class="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-between">
          <span>Parroquias Oficiales (${parroquias.length}):</span>
          <span class="text-slate-400 font-normal normal-case text-[9.5px]">Clic para enfocar</span>
        </div>
      `;

      html += parroquias.map(p => {
        const resolvedPId = resolveParishId(p.id);
        const pColor = getParishColor(resolvedPId);
        const pDem = getParishDemographics(cleanMunId, resolvedPId);
        const pCmd = COMANDOS_PARROQUIALES[resolvedPId] || {};
        const pResp = pCmd.responsablePrincipal || `Comando ${formatTitleCase(p.nombre)}`;

        return `
          <div onclick="laminaApp.selectParroquia('${p.id}', '${cleanMunId}')"
               class="territory-row hover:border-purple-400 flex flex-col gap-1 p-2 rounded-xl border border-slate-200 bg-white cursor-pointer transition shadow-2xs">
            <div class="flex items-center justify-between gap-1.5">
              <div class="flex items-center gap-2 min-w-0">
                <span class="w-3.5 h-3.5 rounded-md shrink-0 border border-black/15 shadow-2xs" style="background-color: ${pColor};"></span>
                <strong class="text-xs font-black text-slate-900 truncate">${formatTitleCase(p.nombre)}</strong>
              </div>
              <span class="text-[9.5px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded font-bold shrink-0">
                ${pDem?.votantes ? `${Number(pDem.votantes).toLocaleString("es-VE")} elect.` : `${pDem?.centros || 0} c.`}
              </span>
            </div>
            <div class="flex items-center justify-between text-[10.5px] text-slate-600 pt-0.5 border-t border-slate-100">
              <span class="truncate">👤 <span class="font-semibold text-slate-800">${pResp}</span></span>
              <span class="text-[9.5px] text-purple-700 font-extrabold shrink-0">Ver Ejes ↗</span>
            </div>
          </div>
        `;
      }).join("");

      listEl.innerHTML = html;

    } else if (this.level === "parroquia" || this.level === "subparroquia" || this.level === "sector") {
      const cleanMunId = String(this.activeMunId || "maturin").toLowerCase().replace(/_/g, "-").trim();
      const cleanPId = String(this.activeParishId || "alto-de-los-godos").toLowerCase().replace(/_/g, "-").trim();
      const resolvedPId = resolveParishId(cleanPId);
      const { subparroquias, poligonos } = this.getParishPolygonsData(cleanMunId, resolvedPId);
      const pColor = getParishColor(resolvedPId);

      const munObj = CATALOGO_MONAGAS.find(m => m.id === cleanMunId) || { nombre: "Maturín" };
      const rawMunName = munObj.nombre || "Maturín";
      const cleanMunName = rawMunName.replace(/^municipio\s+/i, '').trim();
      const munCmd = COMANDOS_MUNICIPALES[cleanMunId] || { responsableGeneral: "Coordinación Municipal Maturín" };

      const parishFeat = (GEO_PARROQUIAS_OFICIAL.features || []).find(f => {
        const id = String(f.properties?.id || "").toLowerCase().replace(/_/g, "-").trim();
        return id === cleanPId || id === resolvedPId || resolveParishId(id) === resolvedPId;
      });
      const cleanPName = formatTitleCase(parishFeat?.properties?.nombre || cleanPId);
      const parishCmd = COMANDOS_PARROQUIALES[resolvedPId] || { responsablePrincipal: `Responsable Parroquial ${cleanPName}` };

      if (titleEl) {
        titleEl.innerHTML = `
          <span class="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0"></span>
          <span class="truncate">Estructura Jerárquica Táctica</span>
        `;
      }
      if (countEl) countEl.textContent = `${subparroquias.length} Eje • ${poligonos.length} Sec.`;

      let html = `
        <!-- Nivel 1 & 2: Ruta de Mando Superior Activa -->
        <div class="chain-breadcrumb-card mb-2 space-y-1.5">
          <div class="flex items-center justify-between text-[9.5px] font-black uppercase tracking-wider text-slate-500">
            <span>Ruta de Mando Territorial</span>
            <span class="text-sky-700 font-extrabold">Monagas 2026</span>
          </div>
          
          <!-- Municipio -->
          <div onclick="laminaApp.selectMunicipio('${cleanMunId}')" 
               class="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200 hover:border-sky-400 cursor-pointer transition text-xs shadow-2xs"
               title="Volver a vista municipal">
            <div class="flex items-center gap-1.5 min-w-0">
              <span class="px-1.5 py-0.2 rounded bg-sky-100 text-sky-900 font-black text-[9px] uppercase shrink-0">Mun</span>
              <strong class="text-slate-900 truncate text-[11px]">${cleanMunName}</strong>
            </div>
            <span class="text-[10px] text-slate-600 font-semibold truncate ml-2">👤 ${munCmd.responsableGeneral}</span>
          </div>

          <!-- Parroquia -->
          <div onclick="laminaApp.selectParroquia('${cleanPId}', '${cleanMunId}')" 
               class="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200 hover:border-purple-400 cursor-pointer transition text-xs shadow-2xs"
               title="Enfocar parroquia completa">
            <div class="flex items-center gap-1.5 min-w-0">
              <span class="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" style="background-color: ${pColor};"></span>
              <span class="px-1.5 py-0.2 rounded bg-purple-100 text-purple-900 font-black text-[9px] uppercase shrink-0">Parr</span>
              <strong class="text-slate-900 truncate text-[11px]">${cleanPName}</strong>
            </div>
            <span class="text-[10px] text-slate-600 font-semibold truncate ml-2">👤 ${parishCmd.responsablePrincipal}</span>
          </div>
        </div>
      `;

      // Nivel 3: Tarjeta Matriz de Eje (Sub-Parroquias / Ejes Territoriales)
      subparroquias.forEach(sp => {
        const ejeId = sp.id || "subpar-1788965549962";
        const assignedEje = getAssignedLeader(ejeId);
        const fallbackEje = COMANDOS_SECTORIALES[ejeId] || COMANDOS_SECTORIALES["sub-godos-lapuente"] || {};
        const ejeRespNombre = assignedEje ? assignedEje.nombre : (fallbackEje.responsableSectorial || `Responsable en Eje ${formatTitleCase(sp.nombre)}`);
        const ejeRespTel = assignedEje ? assignedEje.telefono : (fallbackEje.telefono || "+58 414-7654321");
        const ejeRespCargo = assignedEje ? assignedEje.cargo : (fallbackEje.cargo || "Jefe de Comando Sectorial");
        const isEjeAssigned = !!assignedEje;
        const ejeColor = sp.colorBorde || sp.colorRelleno || "#a855f7";

        // Filtrar sectores pertenecientes a este eje específico
        const spSectores = poligonos.filter(sec => {
          if (sec.subParroquiaId && String(sec.subParroquiaId) === String(ejeId)) return true;
          if (subparroquias.length === 1) return true;
          return false;
        });

        html += `
          <div class="eje-matrix-card p-2.5 space-y-2 mb-2">
            <!-- Encabezado del Eje Matriz -->
            <div class="flex items-center justify-between gap-2">
              <div onclick="laminaApp.selectSubParroquia('${ejeId}', '${cleanPId}', '${cleanMunId}')" 
                   class="flex items-center gap-2 min-w-0 cursor-pointer flex-1"
                   title="Enfocar polígono del Eje en el mapa">
                <span class="w-4 h-4 rounded-md text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-2xs" style="background-color: ${ejeColor};">🛡️</span>
                <div class="min-w-0">
                  <span class="text-[9px] font-black uppercase tracking-wider text-purple-800 block leading-none">Nivel 3 • Eje Matriz</span>
                  <strong class="text-xs font-black text-slate-950 truncate block">${sp.nombre || 'Sub-Parroquia / Eje'}</strong>
                </div>
              </div>
              <button type="button" 
                      onclick="event.stopPropagation(); laminaApp.openAsignarModal('${ejeId}', '${(sp.nombre || 'Sub-Parroquia / Eje').replace(/'/g, "\\'")}', '${cleanPId}')"
                      class="px-2 py-0.5 rounded bg-purple-600 hover:bg-purple-700 text-white font-black text-[9.5px] uppercase shadow-2xs transition active:scale-95 cursor-pointer shrink-0">
                ✏️ Asignar
              </button>
            </div>

            <!-- Ficha del Dirigente de Eje -->
            <div class="p-2 rounded-lg bg-white border border-purple-200 flex items-center justify-between text-xs shadow-2xs">
              <div class="flex flex-col min-w-0">
                <span class="text-[8.5px] font-black uppercase text-purple-700 tracking-wider">${ejeRespCargo}</span>
                <span class="font-bold text-slate-900 truncate">👤 ${ejeRespNombre}</span>
              </div>
              <div class="flex flex-col items-end shrink-0 ml-2">
                <span class="text-[9.5px] font-mono font-extrabold text-sky-800">${ejeRespTel}</span>
                <span class="px-1.5 py-0.2 rounded text-[8.5px] font-extrabold uppercase ${isEjeAssigned ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'}">
                  ${isEjeAssigned ? '● Activo' : '● En Guardia'}
                </span>
              </div>
            </div>

            <!-- Nivel 4: Contenedor Colapsable de Sectores Comunitarios Anidados -->
            <details open class="sectors-accordion">
              <summary class="flex items-center justify-between py-1.5 px-2 bg-purple-100/80 hover:bg-purple-200/80 text-purple-950 font-black text-[11px] cursor-pointer transition select-none">
                <span class="flex items-center gap-1.5">
                  <span class="accordion-chevron text-xs">▶</span>
                  <span>Nivel 4 • Sectores de Base</span>
                </span>
                <span class="text-[9.5px] font-bold text-purple-800 bg-white/90 px-2 py-0.2 rounded-full border border-purple-300">
                  ${spSectores.length} sectores
                </span>
              </summary>

              <!-- Lista interna con sangría y conectores -->
              <div class="p-1.5 tree-connector-line space-y-1 max-h-64 overflow-y-auto pr-1">
                ${spSectores.map(sec => {
                  const assigned = getAssignedLeader(sec.id);
                  const isSelected = this.activeSectorId === sec.id;
                  const secColor = sec.colorBorde || sec.colorRelleno || sec.color || "#0284c7";
                  const secVot = sec.votantes ? `${Number(sec.votantes).toLocaleString("es-VE")} elect.` : (sec.casas ? `${sec.casas} casas` : "");

                  return `
                    <div onclick="laminaApp.selectSector('${sec.id}', '${cleanPId}', '${cleanMunId}')"
                         class="sector-tree-row ${isSelected ? 'active' : ''}"
                         title="Clic para enfocar ${sec.nombre}">
                      <div class="flex items-center gap-1.5 min-w-0 flex-1">
                        <span class="w-2.5 h-2.5 rounded-full shrink-0 border border-black/15 shadow-2xs" style="background-color: ${secColor};"></span>
                        <div class="flex flex-col min-w-0">
                          <span class="font-bold text-[11px] text-slate-900 truncate leading-tight">${formatTitleCase(sec.nombre)}</span>
                          <span class="text-[9.5px] text-slate-500 truncate">
                            ${assigned ? `<span class="text-slate-700 font-semibold">👤 ${assigned.nombre}</span>` : '<span class="text-slate-400 italic">○ Vacante</span>'}
                          </span>
                        </div>
                      </div>
                      <div class="flex items-center gap-1 shrink-0 ml-1">
                        <button type="button" 
                                onclick="event.stopPropagation(); laminaApp.openAsignarModal('${sec.id}', '${sec.nombre.replace(/'/g, "\\'")}', '${cleanPId}')"
                                class="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-900 text-[9px] font-bold border border-slate-200 shadow-2xs transition active:scale-95"
                                title="Asignar dirigente">
                          ✏️
                        </button>
                        ${secVot ? `<span class="text-[9px] font-mono text-slate-400 shrink-0 font-bold">${secVot}</span>` : ''}
                      </div>
                    </div>
                  `;
                }).join("")}
              </div>
            </details>
          </div>
        `;
      });

      if (subparroquias.length === 0 && poligonos.length > 0) {
        html += `
          <div class="eje-matrix-card p-2.5 space-y-2 mb-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black uppercase tracking-wider text-slate-800">Sectores Comunitarios (${poligonos.length})</span>
            </div>
            <div class="p-1.5 tree-connector-line space-y-1 max-h-64 overflow-y-auto pr-1">
              ${poligonos.map(sec => {
                const assigned = getAssignedLeader(sec.id);
                const isSelected = this.activeSectorId === sec.id;
                const secColor = sec.colorBorde || sec.colorRelleno || sec.color || "#0284c7";
                const secVot = sec.votantes ? `${Number(sec.votantes).toLocaleString("es-VE")} elect.` : (sec.casas ? `${sec.casas} casas` : "");

                return `
                  <div onclick="laminaApp.selectSector('${sec.id}', '${cleanPId}', '${cleanMunId}')"
                       class="sector-tree-row ${isSelected ? 'active' : ''}"
                       title="Clic para enfocar ${sec.nombre}">
                    <div class="flex items-center gap-1.5 min-w-0 flex-1">
                      <span class="w-2.5 h-2.5 rounded-full shrink-0 border border-black/15 shadow-2xs" style="background-color: ${secColor};"></span>
                      <div class="flex flex-col min-w-0">
                        <span class="font-bold text-[11px] text-slate-900 truncate leading-tight">${formatTitleCase(sec.nombre)}</span>
                        <span class="text-[9.5px] text-slate-500 truncate">
                          ${assigned ? `<span class="text-slate-700 font-semibold">👤 ${assigned.nombre}</span>` : '<span class="text-slate-400 italic">○ Vacante</span>'}
                        </span>
                      </div>
                    </div>
                    <div class="flex items-center gap-1 shrink-0 ml-1">
                      <button type="button" 
                              onclick="event.stopPropagation(); laminaApp.openAsignarModal('${sec.id}', '${sec.nombre.replace(/'/g, "\\'")}', '${cleanPId}')"
                              class="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-900 text-[9px] font-bold border border-slate-200 shadow-2xs transition active:scale-95"
                              title="Asignar dirigente">
                        ✏️
                      </button>
                      ${secVot ? `<span class="text-[9px] font-mono text-slate-400 shrink-0 font-bold">${secVot}</span>` : ''}
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>
        `;
      } else if (subparroquias.length === 0 && poligonos.length === 0) {
        html += `
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span class="text-xs text-slate-500 font-medium">No hay subdivisiones registradas para esta parroquia</span>
          </div>
        `;
      }

      listEl.innerHTML = html;
    }

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
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
