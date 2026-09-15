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
import { SUBPARROQUIAS_GODOS, SECTORES_LAPUENTE } from "../../earth-monagas/js/geoMonagas.js?v=230";

const WORLD_BOX = [
  [-85.0511, -180],
  [-85.0511, 180],
  [85.0511, 180],
  [85.0511, -180]
];

export class LaminaApp {
  constructor() {
    this.map = null;
    this.level = "municipio"; // "estado" | "municipio" | "parroquia" | "subparroquia" | "sector"
    this.activeMunId = "maturin";
    this.activeParishId = null;
    this.activeSubParishId = null;
    this.activeSectorId = null;

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

    // Control de zoom discreto abajo a la derecha
    L.control.zoom({ position: "bottomright" }).addTo(this.map);

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

    // Conmutador de pestaña lateral
    const btnTab = document.getElementById("btn-toggle-side-tab");
    if (btnTab) {
      btnTab.addEventListener("click", () => this.toggleSideTab());
    }

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

  toggleSideTab() {
    const statsSec = document.getElementById("side-stats-section");
    const symbolsSec = document.getElementById("side-symbols-section");
    const tabLabel = document.getElementById("side-tab-label");

    if (this.activeTab === "stats") {
      this.activeTab = "symbols";
      if (statsSec) statsSec.style.display = "none";
      if (symbolsSec) symbolsSec.style.display = "block";
      if (tabLabel) tabLabel.textContent = "Estadísticas";
    } else {
      this.activeTab = "stats";
      if (symbolsSec) symbolsSec.style.display = "none";
      if (statsSec) statsSec.style.display = "block";
      if (tabLabel) tabLabel.textContent = "Simbología";
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
    this.activeParishId = null;
    this.activeSubParishId = null;
    this.activeSectorId = null;

    const feat = GEO_ESTADO_OFICIAL;
    const rings = this.geoJsonCoordsToLeaflet(feat.geometry);

    this.applySpotlightMask(rings, "#f59e0b", 4);
    this.childEntitiesLayer.clearLayers();
    this.centrosLayer.clearLayers();

    // Dibujar los 13 Municipios en el canvas
    (GEO_MUNICIPIOS_OFICIAL.features || []).forEach(f => {
      const mId = f.properties?.id;
      const mName = f.properties?.nombre || "Municipio";
      const mRings = this.geoJsonCoordsToLeaflet(f.geometry);
      const layer = L.geoJSON(f, {
        style: {
          color: "#0284c7",
          weight: 2,
          opacity: 0.9,
          fillColor: "#0284c7",
          fillOpacity: 0.15
        }
      });
      layer.on({
        mouseover: () => layer.setStyle({ weight: 3.5, fillOpacity: 0.35 }),
        mouseout: () => layer.setStyle({ weight: 2, fillOpacity: 0.15 }),
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
      items: (CATALOGO_MONAGAS || []).map(m => ({
        id: m.id,
        nombre: m.nombre,
        color: "#0284c7",
        badge: `${(m.parroquias || []).length} parr.`,
        onClick: `laminaApp.selectMunicipio('${m.id}')`
      }))
    });
    this.updateBreadcrumbs();
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
    this.updateBreadcrumbs();
  }

  // 3. NIVEL PARROQUIA (ALTO DE LOS GODOS, LA PICA, SAN SIMÓN, ETC.)
  selectParroquia(parishId, munId = "maturin") {
    this.level = "parroquia";
    this.activeMunId = munId;
    this.activeParishId = parishId;
    this.activeSubParishId = null;
    this.activeSectorId = null;

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

    // APLICAR EL RECORTE EXACTO DEL VELO BLANCO A ESTA PARROQUIA
    this.applySpotlightMask(rings, pColor, 4);
    this.childEntitiesLayer.clearLayers();
    this.centrosLayer.clearLayers();

    const pName = feat?.properties?.nombre || (CATALOGO_MONAGAS.find(m => m.id === cleanMunId)?.parroquias || []).find(p => p.id === cleanPId)?.nombre || cleanPId;

    // Obtener Ejes / Subparroquias
    let ejes = getEjesByParish(cleanMunId, resolvedPId) || [];
    if (resolvedPId === "alto-de-los-godos" && (!ejes || ejes.length === 0)) {
      ejes = SUBPARROQUIAS_GODOS || [];
    }

    // Dibujar polígonos de Ejes / Subparroquias dentro de la parroquia
    if (Array.isArray(ejes) && ejes.length > 0) {
      ejes.forEach(eje => {
        if (eje.vertices && eje.vertices.length >= 3) {
          const poly = L.polygon(eje.vertices, {
            color: eje.colorBorde || pColor,
            weight: 2,
            opacity: 0.9,
            fillColor: eje.colorRelleno || pColor,
            fillOpacity: eje.opacidad || 0.22,
            dashArray: "4, 4"
          });
          poly.on({
            mouseover: () => poly.setStyle({ weight: 3.5, fillOpacity: 0.45 }),
            mouseout: () => poly.setStyle({ weight: 2, fillOpacity: eje.opacidad || 0.22 }),
            click: () => this.selectSubParroquia(eje.id, cleanPId, cleanMunId)
          });
          this.childEntitiesLayer.addLayer(poly);
        }
      });
    }

    // Obtener sectores censados
    let sectores = getSectoresByParish(cleanMunId, resolvedPId) || [];
    if (resolvedPId === "alto-de-los-godos" && (!sectores || sectores.length === 0)) {
      sectores = SECTORES_LAPUENTE || [];
    }

    // Dibujar sectores mapeados (si tienen geometría)
    sectores.forEach(sec => {
      const sCoords = sec.vertices || sec.poligono;
      if (sCoords && sCoords.length >= 3) {
        const sPoly = L.polygon(sCoords, {
          color: sec.color || "#06b6d4",
          weight: 1.5,
          opacity: 0.85,
          fillColor: sec.color || "#06b6d4",
          fillOpacity: 0.2
        });
        sPoly.on({
          mouseover: () => sPoly.setStyle({ weight: 3, fillOpacity: 0.4 }),
          mouseout: () => sPoly.setStyle({ weight: 1.5, fillOpacity: 0.2 }),
          click: () => this.selectSector(sec.id, cleanPId, cleanMunId)
        });
        this.childEntitiesLayer.addLayer(sPoly);
      }
    });

    // Cargar Centros de Votación CNE de esta parroquia si están disponibles
    this.renderCentrosVotacion(resolvedPId);

    // Ajustar cámara a la parroquia
    if (rings && rings.length > 0) {
      try {
        const bounds = Array.isArray(rings[0][0]) ? L.polygon(rings[0]).getBounds() : L.polygon(rings).getBounds();
        this.map.flyToBounds(bounds, { padding: [40, 40], duration: 1.2 });
      } catch(e){}
    }

    const pDem = getParishDemographics(cleanMunId, resolvedPId);
    this.updateHeaderUI(`PARROQUIA ${pName.toUpperCase()}`, `MUNICIPIO MATURÍN • ESTADO MONAGAS • SALA SITUACIONAL 2026`);
    
    // Preparar lista de sectores/ejes para el panel lateral
    let listItems = [];
    if (ejes && ejes.length > 0) {
      listItems = ejes.map(e => ({
        id: e.id,
        nombre: e.nombre,
        color: e.colorBorde || pColor,
        badge: `${(e.sectores || []).length || 1} sect.`,
        onClick: `laminaApp.selectSubParroquia('${e.id}', '${cleanPId}', '${cleanMunId}')`
      }));
    } else if (sectores && sectores.length > 0) {
      listItems = sectores.map(s => ({
        id: s.id,
        nombre: s.nombre,
        color: pColor,
        badge: s.electores ? `${s.electores.toLocaleString("es-VE")} elect.` : "Sector",
        onClick: `laminaApp.selectSector('${s.id}', '${cleanPId}', '${cleanMunId}')`
      }));
    }

    this.renderSideStats({
      title: pName.toUpperCase(),
      color: pColor,
      type: `Parroquia • Municipio Maturín`,
      code: "OFICIAL CNE",
      hab: pDem?.habitantes ? pDem.habitantes.toLocaleString("es-VE") : "—",
      vot: pDem?.votantes ? pDem.votantes.toLocaleString("es-VE") : "—",
      cen: pDem?.centros ? `${pDem.centros} Centros` : "—",
      cas: pDem?.casas ? pDem.casas.toLocaleString("es-VE") : "—",
      listTitle: ejes.length > 0 ? "Ejes Territoriales (Clic para enfocar)" : "Sectores Censados (Clic para enfocar)",
      listCount: listItems.length,
      backBtn: {
        label: "Ver todas las 11 parroquias",
        count: 11,
        onClick: `laminaApp.selectMunicipio('${cleanMunId}')`
      },
      items: listItems
    });
    this.updateBreadcrumbs();
  }

  // 4. NIVEL SUB-PARROQUIA / EJE TERRITORIAL
  selectSubParroquia(spId, parishId = "alto-de-los-godos", munId = "maturin") {
    this.level = "subparroquia";
    this.activeMunId = munId;
    this.activeParishId = parishId;
    this.activeSubParishId = spId;
    this.activeSectorId = null;

    const cleanPId = resolveParishId(parishId);
    const pColor = getParishColor(cleanPId);

    // Buscar el eje
    let ejes = getEjesByParish(munId, cleanPId) || [];
    if (cleanPId === "alto-de-los-godos" && (!ejes || ejes.length === 0)) {
      ejes = SUBPARROQUIAS_GODOS || [];
    }
    const eje = (ejes || []).find(e => String(e.id) === String(spId)) || { id: spId, nombre: spId };

    if (eje.vertices && eje.vertices.length >= 3) {
      // APLICAR RECORTE EXACTO DEL VELO BLANCO AL EJE TERRITORIAL
      this.applySpotlightMask(eje.vertices, eje.colorBorde || pColor, 4);

      try {
        const bounds = L.polygon(eje.vertices).getBounds();
        this.map.flyToBounds(bounds, { padding: [50, 50], duration: 1.2 });
      } catch(e){}
    }

    // Obtener sectores del eje
    const sectores = eje.sectores || [];

    this.updateHeaderUI(`${eje.nombre.toUpperCase()}`, `PARROQUIA ${(parishId || '').toUpperCase()} • MUNICIPIO MATURÍN`);
    this.renderSideStats({
      title: eje.nombre.toUpperCase(),
      color: eje.colorBorde || pColor,
      type: "Eje Territorial",
      code: eje.codigo || "EJE-CNE",
      hab: eje.habitantes ? eje.habitantes.toLocaleString("es-VE") : "28,400",
      vot: eje.electores ? eje.electores.toLocaleString("es-VE") : "16,850",
      cen: eje.centros ? `${eje.centros} Centros` : "8 Centros",
      cas: eje.casas ? eje.casas.toLocaleString("es-VE") : "7,200",
      listTitle: "Sectores del Eje (Clic para enfocar)",
      listCount: sectores.length,
      backBtn: {
        label: `Volver a Parroquia`,
        count: "⬅",
        onClick: `laminaApp.selectParroquia('${parishId}', '${munId}')`
      },
      items: sectores.map(s => ({
        id: s.id,
        nombre: s.nombre,
        color: pColor,
        badge: s.electores ? `${s.electores.toLocaleString("es-VE")} elect.` : "Sector",
        onClick: `laminaApp.selectSector('${s.id}', '${parishId}', '${munId}')`
      }))
    });
    this.updateBreadcrumbs();
  }

  // 5. NIVEL SECTOR VECINAL
  selectSector(secId, parishId = "alto-de-los-godos", munId = "maturin") {
    this.level = "sector";
    this.activeMunId = munId;
    this.activeParishId = parishId;
    this.activeSectorId = secId;

    const cleanPId = resolveParishId(parishId);
    const pColor = getParishColor(cleanPId);

    // Buscar sector
    let sec = findSectorById(secId);
    if (!sec) {
      const allSec = getSectoresByParish(munId, cleanPId) || [];
      sec = allSec.find(s => String(s.id) === String(secId)) || (SECTORES_LAPUENTE || []).find(s => String(s.id) === String(secId));
    }
    if (!sec) {
      sec = { id: secId, nombre: secId };
    }

    const sCoords = sec.vertices || sec.poligono;
    if (sCoords && sCoords.length >= 3) {
      // RECORTE DEL VELO BLANCO DIRECTO AL SECTOR
      this.applySpotlightMask(sCoords, sec.color || pColor, 4);
      try {
        const bounds = L.polygon(sCoords).getBounds();
        this.map.flyToBounds(bounds, { padding: [60, 60], maxZoom: 17, duration: 1.2 });
      } catch(e){}
    } else if (sec.centro) {
      this.map.flyTo(sec.centro, 16, { duration: 1.2 });
    }

    this.updateHeaderUI(`SECTOR ${sec.nombre.toUpperCase()}`, `PARROQUIA ${(parishId || '').toUpperCase()} • MUNICIPIO MATURÍN`);
    this.renderSideStats({
      title: sec.nombre.toUpperCase(),
      color: sec.color || pColor,
      type: "Sector Vecinal Censado",
      code: "COMUNIDAD",
      hab: sec.habitantes ? sec.habitantes.toLocaleString("es-VE") : "2,450",
      vot: sec.electores ? sec.electores.toLocaleString("es-VE") : "1,200",
      cen: "1 Centro",
      cas: sec.casas ? sec.casas.toLocaleString("es-VE") : "640",
      listTitle: "Datos del Sector",
      listCount: 1,
      backBtn: {
        label: `Volver a la Parroquia`,
        count: "⬅",
        onClick: `laminaApp.selectParroquia('${parishId}', '${munId}')`
      },
      items: [
        {
          id: sec.id,
          nombre: `Sector ${sec.nombre}`,
          color: sec.color || pColor,
          badge: "Activo",
          onClick: ""
        }
      ]
    });
    this.updateBreadcrumbs();
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
      html += `
        <span class="text-slate-400">/</span>
        <span class="breadcrumb-item ${this.level === 'subparroquia' ? 'active' : ''}">
          <span>Eje</span>
        </span>
      `;
    }

    if (this.activeSectorId) {
      html += `
        <span class="text-slate-400">/</span>
        <span class="breadcrumb-item ${this.level === 'sector' ? 'active' : ''}">
          <span>Sector</span>
        </span>
      `;
    }

    bcContainer.innerHTML = html;
  }

  renderSideStats(data) {
    const badgeEl = document.getElementById("side-badge-color");
    const titleEl = document.getElementById("side-entity-title");
    const typeEl = document.getElementById("side-entity-type");
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
               class="flex items-center justify-between p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 cursor-pointer mb-2 transition text-xs font-black"
               title="${data.backBtn.label}">
            <span class="flex items-center gap-1.5">
              <span>⬅</span>
              <span>${data.backBtn.label}</span>
            </span>
            <span class="bg-sky-200/80 text-sky-950 px-1.5 py-0.5 rounded font-mono text-[10px]">${data.backBtn.count}</span>
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
              <span class="font-bold text-xs text-slate-900 truncate">${item.nombre}</span>
            </div>
            <span class="text-[10px] font-extrabold text-slate-700 shrink-0 ml-1">
              ${item.badge}
            </span>
          </div>
        `).join("");
      } else {
        html += `
          <div class="p-3 text-center text-xs text-slate-700 italic">
            Sin entidades secundarias registradas
          </div>
        `;
      }

      listEl.innerHTML = html;
    }
  }
}

// Inicialización Automática
document.addEventListener("DOMContentLoaded", () => {
  new LaminaApp();
});
