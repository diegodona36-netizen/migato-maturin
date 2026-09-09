/**
 * Motor Cartográfico Acelerado por GPU — Google Earth Pro Web (Monagas)
 * Integrado con Capas Jerárquicas Oficiales (INE 2021) y Edición de Vértices
 */
import { GEO_ESTADO_OFICIAL, GEO_MUNICIPIOS_OFICIAL, GEO_PARROQUIAS_OFICIAL } from "./geoOficialMonagas.js?v=100";

export class EarthMapEngine {
  constructor(containerId, onCoordUpdate) {
    this.containerId = containerId;
    this.onCoordUpdate = onCoordUpdate;

    this.map = null;
    this.canvasRenderer = null;

    // Capas Base
    this.boundaryLayer = null;
    this.subParroquiasLayer = null;
    this.subParroquiaLabelsLayer = null;
    this.polygonsLayer = null;
    this.sectorLabelsLayer = null;
    this.routesLayer = null;
    this.placemarksLayer = null;
    this.overlayLayer = null;
    this.tempDrawingLayer = null;

    // Capas Jerárquicas Oficiales (LOD 1 a 5)
    this.layerL1_Estado = null;
    this.layerL2_Municipios = null;
    this.layerL3_Parroquias = null;
    this.layerL4_SubParroquias = null;
    this.layerCentros = null;

    // Estado explícito de visibilidad para filtros de capas (LOD 1 a 5)
    // Sectores y Ejes SIEMPRE activos y visibles por defecto para que el usuario no tenga que habilitarlos manualmente
    this.hierarchicalVisibility = {
      l1: false,
      l2: false,
      l3: false,
      l4: true,
      l5: true
    };
    this.autoZoomLOD = false; // Desactivado por defecto: los sectores y ejes nunca se ocultan al cambiar de zoom

    // Estado de Edición de Vértices
    this.editingPoly = null;
    this.editingVertexMarkers = [];
    this.onFinishGeometryEdit = null;
    this.leafletLayersMap = new Map();

    this.init();
  }

  init() {
    this.canvasRenderer = L.canvas({ padding: 0.5, tolerance: 12 });
    this.svgRenderer = L.svg({ padding: 0.5 });

    const googleHybrid = L.tileLayer(
      "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
      { maxZoom: 21, maxNativeZoom: 20, attribution: "Google Satélite Híbrido" }
    );

    const esriSatellite = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 21, maxNativeZoom: 17, attribution: "Esri World Imagery" }
    );

    const osmStreets = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { maxZoom: 20, maxNativeZoom: 19, attribution: "OpenStreetMap" }
    );

    const isTouchDevice = typeof window !== "undefined" && (
      "ontouchstart" in window ||
      (navigator && navigator.maxTouchPoints > 0) ||
      window.innerWidth < 768
    );
    this.isTouchDevice = isTouchDevice;

    this.map = L.map(this.containerId, {
      center: [9.7469, -63.1812], // Maturín
      zoom: 13,
      preferCanvas: true, // Aceleración por GPU en Canvas para eliminar miles de nodos SVG
      renderer: this.canvasRenderer,
      zoomSnap: 1,
      zoomDelta: 1,
      zoomAnimation: true,
      zoomControl: false,
      layers: [googleHybrid]
    });

    // Control de capas satelitales clásico
    L.control.layers(
      { "Satélite Google (Híbrido)": googleHybrid, "Satélite Esri": esriSatellite, "Calles OSM": osmStreets },
      null,
      { position: "topright" }
    ).addTo(this.map);

    // Botones de Zoom (+ y -) estilo Google Earth Pro aislados abajo a la derecha
    L.control.zoom({
      position: "bottomright"
    }).addTo(this.map);

    // Inicializar Grupos de Capas de Usuario
    this.boundaryLayer = L.layerGroup().addTo(this.map);
    this.subParroquiasLayer = L.layerGroup().addTo(this.map);
    this.subParroquiaLabelsLayer = L.layerGroup().addTo(this.map);
    this.polygonsLayer = L.layerGroup().addTo(this.map);
    this.sectorLabelsLayer = L.layerGroup().addTo(this.map);
    this.routesLayer = L.layerGroup().addTo(this.map);
    this.placemarksLayer = L.layerGroup().addTo(this.map);
    this.overlayLayer = L.layerGroup().addTo(this.map);
    this.tempDrawingLayer = L.layerGroup().addTo(this.map);

    this.spotlightEnabled = false; // Modo Foco desactivado por defecto para ver simultáneamente todos los sectores del estado
    this.currentParishLimite = null;
    this.currentParishId = null;

    // Inicializar Capas Jerárquicas Oficiales (LOD 1 a 5)
    this.initHierarchicalLayers();

    // Seguimiento de coordenadas optimizado:
    // En escritorio: mousemove
    // En pantallas táctiles: solo al soltar el mapa (moveend) para no gastar batería ni saturar la CPU
    if (!this.isTouchDevice) {
      this.map.on("mousemove", (e) => {
        if (this.onCoordUpdate) {
          this.onCoordUpdate(e.latlng.lat, e.latlng.lng, this.getEyeAltitude());
        }
      });
    }

    this.map.on("moveend", () => {
      const center = this.map.getCenter();
      if (this.onCoordUpdate) {
        this.onCoordUpdate(center.lat, center.lng, this.getEyeAltitude());
      }
    });

    this.map.on("zoomend", () => {
      const center = this.map.getCenter();
      if (this.onCoordUpdate) {
        this.onCoordUpdate(center.lat, center.lng, this.getEyeAltitude());
      }
      this.updateHierarchicalLOD();
    });

    this.map.on("click", (e) => {
      if (!window.earthApp?.toolsManager?.activeTool) {
        this.clearPolygonHighlight();
        if (window.earthApp) {
          window.earthApp.closeQuickStats();
        }
      }
    });
  }

  /**
   * Construye las capas oficiales de los 5 niveles jerárquicos
   */
  initHierarchicalLayers() {
    const isIsolated = typeof document !== "undefined" && document.documentElement.classList.contains("isolated-parish-view");
    if (isIsolated) {
      // MODO AISLAMIENTO PARROQUIAL (Operador móvil comunal):
      // NO instanciar los 13 municipios ni las 44 parroquias ajenas.
      // El teléfono móvil vuela inmediatamente a 60 FPS con mínimo consumo de RAM.
      this.layerL1_Estado = L.layerGroup();
      this.layerL2_Municipios = L.layerGroup();
      this.layerL3_Parroquias = L.layerGroup();
      this.layerL4_SubParroquias = L.layerGroup();
      return;
    }

    // 1. Capa L1: Estado Monagas (Oficial INE/IGVSB) - Capa puramente visual sin eventos invasivos
    this.layerL1_Estado = L.geoJSON(GEO_ESTADO_OFICIAL, {
      renderer: this.canvasRenderer,
      interactive: false,
      style: {
        color: "#f59e0b",
        weight: 3.5,
        opacity: 0.95,
        fillColor: "#f59e0b",
        fillOpacity: 0.06,
        dashArray: "8, 6",
        interactive: false
      },
      onEachFeature: (feature, layer) => {
        if (!this.isTouchDevice) {
          layer.bindTooltip(`
            <div class="p-2 font-mono text-xs max-w-[240px] bg-[#08061a] rounded-xl border border-amber-500/50 shadow-2xl">
              <div class="flex items-center justify-between border-b border-amber-800/60 pb-1 mb-1">
                <span class="text-[9px] uppercase tracking-wider text-amber-400 font-black">Nivel 1 • Macro</span>
                <span class="text-[9px] font-bold text-amber-200 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-700">Estado</span>
              </div>
              <strong class="text-white block font-black text-sm mb-0.5">Estado Monagas</strong>
              <span class="text-[10px] text-slate-300 block mb-1.5">13 Municipios • 44 Parroquias • 536 Centros de Votación</span>
              <span class="text-[9px] text-amber-300 font-bold block text-center">Acércate con el zoom para ver municipios</span>
            </div>
          `, { sticky: true, className: "earth-tooltip" });
        }
      }
    });

    // 2. Capa L2: 13 Municipios (Oficial INE) - Capa puramente visual e informativa
    this.layerL2_Municipios = L.geoJSON(GEO_MUNICIPIOS_OFICIAL, {
      renderer: this.canvasRenderer,
      interactive: false,
      style: (feature) => ({
        color: feature.properties.color || "#38bdf8",
        weight: 2,
        opacity: 0.9,
        fillColor: feature.properties.color || "#38bdf8",
        fillOpacity: 0.12,
        interactive: false
      })
    });

    // 3. Capa L3: 44 Parroquias Oficiales (INE 2021) - Visualización limpia sin interacción táctil invasiva
    this.layerL3_Parroquias = L.geoJSON(GEO_PARROQUIAS_OFICIAL, {
      renderer: this.canvasRenderer,
      interactive: false,
      style: (feature) => ({
        color: "#ffffff",
        weight: 1.5,
        opacity: 0.85,
        fillColor: feature.properties.color || "#10b981",
        fillOpacity: 0.14,
        dashArray: "5, 4",
        interactive: false
      })
    });

    // 4. Capa L4: Sub-Parroquias / Ejes (Dinámica, según parroquia activa)
    this.layerL4_SubParroquias = L.layerGroup();
  }

  toggleHierarchicalLayer(levelKey, visible, isUserManual = false) {
    if (isUserManual) {
      this.autoZoomLOD = false;
      const chkAuto = document.getElementById("chk-auto-zoom-lod");
      if (chkAuto) chkAuto.checked = false;
      const lblLod = document.getElementById("lbl-active-lod-name");
      if (lblLod) lblLod.textContent = "Control Manual";
    }

    if (this.hierarchicalVisibility.hasOwnProperty(levelKey)) {
      this.hierarchicalVisibility[levelKey] = !!visible;
    }

    this.applyVisibilityToLayers();
  }

  focusHierarchicalLayer(levelKey) {
    if (!this.map) return;

    // Si la capa está apagada, encenderla automáticamente para que el usuario vea a dónde vuela
    if (this.hierarchicalVisibility.hasOwnProperty(levelKey) && !this.hierarchicalVisibility[levelKey]) {
      this.toggleHierarchicalLayer(levelKey, true);
      const chk = document.getElementById(`chk-layer-${levelKey}`);
      if (chk) chk.checked = true;
    }

    if (levelKey === 'l1') {
      if (this.layerL1_Estado) {
        try {
          const b = this.layerL1_Estado.getBounds();
          if (b.isValid()) {
            this.map.flyToBounds(b, { padding: [30, 30], duration: 1.2 });
            return;
          }
        } catch(e) {}
      }
      this.map.flyTo([9.55, -63.15], 8, { duration: 1.2 });
      return;
    }

    if (levelKey === 'l2') {
      const currentMunId = window.earthApp?.selectedMunId || "maturin";
      let munFound = false;
      if (this.layerL2_Municipios) {
        this.layerL2_Municipios.eachLayer(ly => {
          if (munFound) return;
          const p = ly.feature?.properties;
          if (p && (String(p.id) === String(currentMunId) || String(p.municipioId) === String(currentMunId) || (p.nombre && p.nombre.toLowerCase().includes(currentMunId.toLowerCase())))) {
            try {
              const b = ly.getBounds();
              if (b.isValid()) {
                this.map.flyToBounds(b, { padding: [40, 40], duration: 1.2 });
                munFound = true;
              }
            } catch(e) {}
          }
        });
      }
      if (!munFound) {
        this.map.flyTo([9.7469, -63.1812], 10, { duration: 1.2 });
      }
      return;
    }

    if (levelKey === 'l3') {
      if (this.boundaryLayer) {
        try {
          const b = this.boundaryLayer.getBounds();
          if (b.isValid()) {
            this.map.flyToBounds(b, { padding: [40, 40], duration: 1.2 });
            return;
          }
        } catch(e) {}
      }
      if (this.currentParishLimite && this.currentParishLimite.length > 0) {
        try {
          const b = L.latLngBounds(this.currentParishLimite);
          if (b.isValid()) {
            this.map.flyToBounds(b, { padding: [40, 40], duration: 1.2 });
            return;
          }
        } catch(e) {}
      }
      this.map.flyTo([9.7469, -63.1812], 12, { duration: 1.2 });
      return;
    }

    if (levelKey === 'l4') {
      // Enfocar las sub-parroquias / ejes de la parroquia activa
      if (this.subParroquiasLayer) {
        try {
          const b = this.subParroquiasLayer.getBounds();
          if (b.isValid()) {
            this.map.flyToBounds(b, { padding: [40, 40], maxZoom: 15, duration: 1.2 });
            return;
          }
        } catch(e) {}
      }
      // Si aún no hay ejes en esta parroquia, volar al perímetro de la parroquia activa
      if (this.boundaryLayer) {
        try {
          const b = this.boundaryLayer.getBounds();
          if (b.isValid()) {
            this.map.flyToBounds(b, { padding: [40, 40], duration: 1.2 });
            return;
          }
        } catch(e) {}
      }
      this.map.flyTo([9.7469, -63.1812], 13, { duration: 1.2 });
      return;
    }

    if (levelKey === 'l5') {
      // Enfocar los sectores comunales de la parroquia activa
      if (this.polygonsLayer) {
        try {
          const b = this.polygonsLayer.getBounds();
          if (b.isValid()) {
            this.map.flyToBounds(b, { padding: [40, 40], maxZoom: 16, duration: 1.2 });
            return;
          }
        } catch(e) {}
      }
      // Si aún no hay sectores dibujados en esta parroquia, volar al perímetro de la parroquia activa
      if (this.boundaryLayer) {
        try {
          const b = this.boundaryLayer.getBounds();
          if (b.isValid()) {
            this.map.flyToBounds(b, { padding: [40, 40], duration: 1.2 });
            return;
          }
        } catch(e) {}
      }
      this.map.flyTo([9.7469, -63.1812], 14, { duration: 1.2 });
      return;
    }
  }

  getEyeAltitude() {
    const z = this.map.getZoom();
    const altMap = {
      20: "120 m", 19: "250 m", 18: "500 m", 17: "1.0 km",
      16: "2.1 km", 15: "4.2 km", 14: "8.5 km", 13: "17 km",
      12: "35 km", 11: "70 km", 10: "140 km", 9: "280 km"
    };
    return altMap[z] || `${Math.round(40000 / Math.pow(2, z - 8))} km`;
  }

  flyTo(lat, lng, zoom = 14) {
    this.map.flyTo([lat, lng], zoom, { duration: 1.2 });
  }

  fitBounds(bounds) {
    this.map.flyToBounds(bounds, { padding: [50, 50], duration: 1.0 });
  }

  showParishBoundary(limite, parishId = null, flyCamera = true) {
    this.currentParishLimite = limite;
    this.currentParishId = parishId;
    this.boundaryLayer.clearLayers();

    let coords = null;

    // 1. Intentar obtener polígono oficial del INE desde GEO_PARROQUIAS_OFICIAL
    if (parishId && GEO_PARROQUIAS_OFICIAL && GEO_PARROQUIAS_OFICIAL.features) {
      const cleanId = String(parishId).toLowerCase().replace(/_/g, "-");
      const feat = GEO_PARROQUIAS_OFICIAL.features.find(f => {
        if (!f.properties) return false;
        const fId = String(f.properties.id || "").toLowerCase().replace(/_/g, "-");
        const fNom = String(f.properties.nombre || "").toLowerCase();
        return fId === cleanId || fNom === cleanId;
      });
      if (feat && feat.geometry) {
        if (feat.geometry.type === "Polygon") {
          coords = feat.geometry.coordinates[0].map(c => [c[1], c[0]]);
        } else if (feat.geometry.type === "MultiPolygon") {
          const polygons = feat.geometry.coordinates.map(p => p[0].map(c => [c[1], c[0]]));
          coords = polygons.sort((a, b) => b.length - a.length)[0];
        }
      }
    }

    if (!coords && limite && limite.length > 0) {
      coords = limite;
    }

    if (!coords || coords.length === 0) return;

    // 2. Máscara de Foco (Efecto Velo Blanco Exterior SVG con fill-rule: evenodd)
    if (this.spotlightEnabled) {
      const worldBox = [
        [-90, -180],
        [-90, 180],
        [90, 180],
        [90, -180]
      ];

      // Máscara invertida con orificio para la parroquia activa (SVG con fill-rule: evenodd)
      const maskPoly = L.polygon([worldBox, coords], {
        fillColor: "#ffffff",
        fillOpacity: 0.78,
        color: "#ffffff",
        weight: 2,
        opacity: 0.9,
        fillRule: "evenodd",
        interactive: false,
        renderer: this.svgRenderer
      });
      this.boundaryLayer.addLayer(maskPoly);
    }

    // 3. Contorno Neón Brillante para la Parroquia Iluminada
    const bPoly = L.polygon(coords, {
      color: "#0284c7",
      weight: 3,
      opacity: 0.95,
      fill: false,
      dashArray: "6, 4",
      interactive: false,
      renderer: this.canvasRenderer
    });
    this.boundaryLayer.addLayer(bPoly);

    if (flyCamera) {
      this.map.flyToBounds(bPoly.getBounds(), { padding: [40, 40], duration: 1.2 });
    } else {
      this.map.fitBounds(bPoly.getBounds(), { padding: [40, 40], animate: false });
    }
  }

  showSubParishBoundary(spVertices, flyCamera = true) {
    this.currentSubParishVertices = spVertices;
    this.boundaryLayer.clearLayers();

    if (!spVertices || spVertices.length < 3) return;

    if (this.spotlightEnabled) {
      const worldBox = [
        [-90, -180],
        [-90, 180],
        [90, 180],
        [90, -180]
      ];

      const maskPoly = L.polygon([worldBox, spVertices], {
        fillColor: "#ffffff",
        fillOpacity: 0.78,
        color: "#ffffff",
        weight: 2,
        opacity: 0.9,
        fillRule: "evenodd",
        interactive: false,
        renderer: this.svgRenderer
      });
      this.boundaryLayer.addLayer(maskPoly);
    }

    const bPoly = L.polygon(spVertices, {
      color: "#c084fc",
      weight: 3,
      opacity: 0.95,
      fill: false,
      dashArray: "6, 4",
      interactive: false,
      renderer: this.canvasRenderer
    });
    this.boundaryLayer.addLayer(bPoly);

    if (flyCamera) {
      this.map.flyToBounds(bPoly.getBounds(), { padding: [50, 50], duration: 1.2 });
    } else {
      this.map.fitBounds(bPoly.getBounds(), { padding: [50, 50], animate: false });
    }
  }

  toggleSpotlight(enabled = null) {
    if (enabled !== null) {
      this.spotlightEnabled = !!enabled;
    } else {
      this.spotlightEnabled = !this.spotlightEnabled;
    }
    if (this.currentSubParishVertices && window.earthApp?.activeSubParroquiaId) {
      this.showSubParishBoundary(this.currentSubParishVertices, false);
    } else if (this.currentParishLimite || this.currentParishId) {
      this.showParishBoundary(this.currentParishLimite, this.currentParishId, false);
    } else if (window.earthApp?.selectedParishId) {
      const p = window.earthApp.store?.getParish(window.earthApp.selectedMunId, window.earthApp.selectedParishId);
      this.showParishBoundary(p?.limite || null, window.earthApp.selectedParishId, false);
    }
    return this.spotlightEnabled;
  }

  setDrawingMode(isDrawing) {
    this.isDrawingMode = !!isDrawing;
    try {
      if (this.map) {
        const container = this.map.getContainer();
        if (container) {
          container.classList.toggle("drawing-active", this.isDrawingMode);
        }
        try {
          if (typeof this.map.closePopup === "function") {
            this.map.closePopup();
          }
        } catch(e) {}
      }

      // Mantener la máscara de los alrededores translúcida durante el trazado para enlazar polígonos
      if (this.boundaryLayer) {
        this.boundaryLayer.eachLayer(l => {
          try {
            if (l.options && (l.options.fillColor === "#020617" || l.options.fillColor === "#000000" || l.options.fillColor === "#ffffff")) {
              l.setStyle({ fillOpacity: 0.78 });
            }
          } catch(e) {}
        });
      }

      const groups = [
        this.subParroquiasLayer,
        this.subParroquiaLabelsLayer,
        this.polygonsLayer,
        this.sectorLabelsLayer,
        this.routesLayer,
        this.placemarksLayer,
        this.boundaryLayer,
        this.layerL1_Estado,
        this.layerL2_Municipios,
        this.layerL3_Parroquias,
        this.layerL4_SubParroquias
      ];

      groups.forEach(group => {
        if (!group || typeof group.eachLayer !== "function") return;
        try {
          group.eachLayer(layer => {
            if (!layer) return;
            try {
              if (this.isDrawingMode) {
                if (layer._origInteractive === undefined) {
                  layer._origInteractive = Boolean(layer.options && layer.options.interactive !== false);
                }
                if (layer.options) layer.options.interactive = false;
                if (layer._path && layer._path.style) layer._path.style.pointerEvents = "none";
                if (layer._icon && layer._icon.style) layer._icon.style.pointerEvents = "none";
                if (typeof layer.getTooltip === "function" && layer.getTooltip() && typeof layer.closeTooltip === "function") {
                  try { layer.closeTooltip(); } catch(e) {}
                }
              } else {
                const wasInteractive = layer._origInteractive !== undefined ? layer._origInteractive : true;
                if (layer.options) layer.options.interactive = wasInteractive;
                if (layer._path && layer._path.style) layer._path.style.pointerEvents = "auto";
                if (layer._icon && layer._icon.style) layer._icon.style.pointerEvents = "auto";
              }
            } catch (eLayer) {}
          });
        } catch (eGroup) {}
      });
    } catch(err) {
      console.warn("[setDrawingMode] Error:", err);
    }
  }

  calculateCentroid(vertices) {
    if (!vertices || !Array.isArray(vertices) || vertices.length === 0) return null;
    let latSum = 0, lngSum = 0;
    vertices.forEach(v => {
      if (Array.isArray(v) && v.length >= 2) {
        latSum += v[0];
        lngSum += v[1];
      }
    });
    return [latSum / vertices.length, lngSum / vertices.length];
  }

  renderParishItems(activeParish, onSelectCallback) {
    this.polygonsLayer.clearLayers();
    this.routesLayer.clearLayers();
    this.placemarksLayer.clearLayers();
    if (this.subParroquiasLayer) this.subParroquiasLayer.clearLayers();
    if (this.subParroquiaLabelsLayer) this.subParroquiaLabelsLayer.clearLayers();
    if (this.sectorLabelsLayer) this.sectorLabelsLayer.clearLayers();
    if (this.leafletLayersMap) this.leafletLayersMap.clear();

    if (!activeParish) return;

    // Renderizar única y exclusivamente los elementos de la parroquia activa seleccionada
    const parishesToRender = [{
      munId: window.earthApp?.selectedMunId || "maturin",
      parishId: activeParish.id,
      parish: activeParish
    }];

    const isDrawing = !!(window.earthApp?.toolsManager?.activeTool);

    parishesToRender.forEach(({ munId, parishId, parish: pData }) => {
      if (!pData) return;
      const isActiveParish = true;

      // 0. Sub-Parroquias / Ejes Comunales (Nivel 4)
      (pData.subparroquias || []).forEach(sp => {
        try {
          if (sp.visible === false || !sp.vertices || sp.vertices.length < 3) return;

          const isFocused = String(window.earthApp?.activeSubParroquiaId || "") === String(sp.id || "");

          const spLayer = L.polygon(sp.vertices, {
            color: sp.colorBorde || "#c084fc",
            weight: isFocused ? 3.5 : (sp.anchoBorde || 2.5),
            opacity: 0.95,
            fillColor: sp.colorRelleno || "#a855f7",
            fill: true,
            fillOpacity: isFocused ? 0.12 : 0.08,
            dashArray: isFocused ? "8, 6" : "6, 4",
            interactive: !isDrawing,
            renderer: this.canvasRenderer
          });

          if (sp && sp.id) {
            this.leafletLayersMap.set(String(sp.id), spLayer);
          }

          if (!isDrawing && !this.isTouchDevice) {
            // Calcular consolidado suma viva de sectores dentro de este Eje Comunal
            const childSecs = (pData.poligonos || []).filter(p => String(p.subParroquiaId) === String(sp.id));
            let totCasas = 0, totFam = 0, totHab = 0, totVot = 0, totDuro = 0, totBlando = 0, totNuevo = 0;
            childSecs.forEach(c => {
              totCasas += parseInt(c.casas || 0) || 0;
              totFam += parseInt(c.familias || 0) || 0;
              totHab += parseInt(c.habitantes || 0) || 0;
              const v = parseInt(c.militantes !== undefined ? c.militantes : (c.habitantes || 0)) || 0;
              totVot += v;
              totDuro += parseInt(c.votoDuro || 0) || 0;
              totBlando += parseInt(c.votoBlando || 0) || 0;
              totNuevo += parseInt(c.votoNuevo || 0) || 0;
            });

            const polDuro = totDuro || Math.round(totVot * 0.60);
            const polBlando = totBlando || Math.round(totVot * 0.25);
            const polNuevo = totNuevo || Math.max(0, totVot - polDuro - polBlando);

            spLayer.bindTooltip(`
              <div class="p-2 font-mono text-xs max-w-[260px] bg-[#08061a] rounded-xl border border-purple-500/50 shadow-2xl">
                <div class="flex items-center justify-between gap-2 border-b border-purple-800/60 pb-1.5 mb-1.5">
                  <span class="text-[9px] uppercase tracking-wider text-purple-400 font-black flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full bg-purple-400"></span>
                    <span>Nivel 4 • Eje Comunal</span>
                  </span>
                  <span class="text-[9px] font-bold text-purple-200 bg-purple-900/80 px-1.5 py-0.5 rounded border border-purple-700">
                    ${childSecs.length} Sectores
                  </span>
                </div>
                <strong class="text-white block font-black text-sm mb-0.5">${sp.nombre}</strong>
                <span class="text-[10px] text-purple-200 block mb-2">📍 Parroquia ${pData.nombre || parishId}</span>
                
                <div class="grid grid-cols-2 gap-1.5 text-center text-[10px] font-mono bg-[#140e40]/90 p-1.5 rounded-lg border border-purple-900/50 mb-1.5">
                  <div class="bg-[#08061a]/90 p-1 rounded border border-amber-500/30">
                    <span class="text-[9px] text-amber-400 font-bold block uppercase">Casas</span>
                    <strong class="text-amber-200 text-xs">${totCasas.toLocaleString()}</strong>
                  </div>
                  <div class="bg-[#08061a]/90 p-1 rounded border border-sky-500/30">
                    <span class="text-[9px] text-sky-400 font-bold block uppercase">Familias</span>
                    <strong class="text-sky-200 text-xs">${totFam.toLocaleString()}</strong>
                  </div>
                  <div class="bg-[#08061a]/90 p-1 rounded border border-emerald-500/30">
                    <span class="text-[9px] text-emerald-400 font-bold block uppercase">Habitantes</span>
                    <strong class="text-emerald-200 text-xs">${totHab.toLocaleString()}</strong>
                  </div>
                  <div class="bg-[#08061a]/90 p-1 rounded border border-purple-500/30">
                    <span class="text-[9px] text-purple-400 font-bold block uppercase">Votantes</span>
                    <strong class="text-purple-200 text-xs">${totVot.toLocaleString()}</strong>
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-1 text-center font-mono text-[9px] mb-1.5 p-1 rounded-lg bg-slate-950/90 border border-purple-800/60">
                  <span class="text-emerald-300 font-bold" title="Voto Duro">🟢 ${polDuro.toLocaleString()}</span>
                  <span class="text-amber-300 font-bold" title="Voto Blando">🟡 ${polBlando.toLocaleString()}</span>
                  <span class="text-sky-300 font-bold" title="Voto Nuevo">🔵 ${polNuevo.toLocaleString()}</span>
                </div>

                <div class="flex items-center justify-between text-[9px] text-slate-400 pt-0.5 border-t border-purple-900/40">
                  <span>Área: ${sp.areaHa || 0} Ha</span>
                  <span>Perímetro: ${sp.perimetroM || 0} m</span>
                </div>
                <span class="text-[9px] text-purple-300 font-bold block mt-1 text-center">👉 Clic para enfocar y ver ficha</span>
              </div>
            `, { sticky: true, className: "earth-tooltip" });
          }

          spLayer.on("click", (e) => {
            if (e.originalEvent?.target?.blur) e.originalEvent.target.blur();
            if (document.activeElement?.blur) document.activeElement.blur();
            if (window.earthApp?.toolsManager?.activeTool) {
              L.DomEvent.stopPropagation(e);
              window.earthApp.toolsManager.handleMapClick(e);
              return;
            }
            L.DomEvent.stopPropagation(e);
            if (onSelectCallback) {
              onSelectCallback("subparroquia", sp, e);
            } else if (window.earthApp) {
              window.earthApp.focusSubParish(sp.id, false);
            }
          });

          if (this.subParroquiasLayer) this.subParroquiasLayer.addLayer(spLayer);

          // Marcador de Centroide visible en todo momento para el Eje
          const spCentroid = this.calculateCentroid(sp.vertices);
          if (spCentroid && this.subParroquiaLabelsLayer) {
            const spIcon = L.divIcon({
              className: "custom-subparish-pin",
              html: `<div class="px-2 py-0.5 rounded-full text-[10px] font-black border shadow-lg cursor-pointer whitespace-nowrap transition transform hover:scale-110 flex items-center gap-1 bg-purple-950/90 text-purple-200 border-purple-400" style="backdrop-filter: blur(4px);">
                <span class="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0"></span>
                <span>${sp.nombre}</span>
              </div>`,
              iconSize: null,
              iconAnchor: [30, 10]
            });
            const spMarker = L.marker(spCentroid, { icon: spIcon, interactive: !isDrawing });
            spMarker.on("click", (e) => {
              L.DomEvent.stopPropagation(e);
              if (onSelectCallback) {
                onSelectCallback("subparroquia", sp, e);
              } else if (window.earthApp) {
                window.earthApp.focusSubParish(sp.id, false);
              }
            });
            this.subParroquiaLabelsLayer.addLayer(spMarker);
          }
        } catch (err) {
          console.warn("[MapEngine] Error renderizando sub-parroquia:", sp, err);
        }
      });

      // 1. Polígonos de Sectores Comunales (Nivel 5)
      (pData.poligonos || []).forEach(poly => {
        try {
          const rawCoords = poly.vertices || poly.poligono || [];
          if (!poly.vertices && poly.poligono) poly.vertices = poly.poligono;
          if (poly.visible === false || rawCoords.length < 3) return;

          const pLayer = L.polygon(rawCoords, {
            color: poly.colorBorde || "#38bdf8",
            weight: poly.anchoBorde || (isActiveParish ? 2.5 : 2),
            opacity: isActiveParish ? 0.95 : 0.85,
            fillColor: poly.colorRelleno || "#38bdf8",
            fillOpacity: poly.opacidad !== undefined ? poly.opacidad : (isActiveParish ? 0.35 : 0.25),
            interactive: !isDrawing,
            renderer: this.canvasRenderer
          });

          if (poly && poly.id) {
            this.leafletLayersMap.set(String(poly.id), pLayer);
          }

          const milCount = poly.militantes !== undefined ? poly.militantes : (poly.habitantes || 0);
          const casasCount = poly.casas || 0;
          const famCount = poly.familias !== undefined ? poly.familias : casasCount;
          const habCount = poly.habitantes !== undefined ? poly.habitantes : milCount;
          const spObj = (pData.subparroquias || []).find(s => String(s.id) === String(poly.subParroquiaId));
          const spTag = spObj ? ` • ${spObj.nombre}` : "";
          const centroVot = poly.centroVotacion ? `🏫 ${poly.centroVotacion}` : "🏫 Centro no asignado";

          const duroCount = poly.votoDuro !== undefined ? poly.votoDuro : Math.round(milCount * 0.60);
          const blandoCount = poly.votoBlando !== undefined ? poly.votoBlando : Math.round(milCount * 0.25);
          const nuevoCount = poly.votoNuevo !== undefined ? poly.votoNuevo : Math.max(0, milCount - duroCount - blandoCount);

          if (!isDrawing && !this.isTouchDevice) {
            pLayer.bindTooltip(`
              <div class="p-2 font-mono text-xs max-w-[260px] bg-[#08061a] rounded-xl border border-sky-500/50 shadow-2xl">
                <div class="flex items-center justify-between gap-2 border-b border-sky-800/60 pb-1.5 mb-1.5">
                  <span class="text-[9px] uppercase tracking-wider text-sky-400 font-black flex items-center gap-1 truncate">
                    <span class="w-2 h-2 rounded-full bg-sky-400"></span>
                    <span class="truncate">Sector Comunal${spTag}</span>
                  </span>
                  <span class="text-[9px] font-bold text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-700 shrink-0">
                    Base
                  </span>
                </div>
                <strong class="text-white block font-black text-sm mb-0.5 truncate">${poly.nombre}</strong>
                <span class="text-[10px] text-slate-300 block mb-2 truncate">📍 Parroquia ${pData.nombre || parishId}</span>
                
                <div class="grid grid-cols-2 gap-1.5 text-center text-[10px] font-mono bg-[#140e40]/90 p-1.5 rounded-lg border border-sky-900/50 mb-1.5">
                  <div class="bg-[#08061a]/90 p-1 rounded border border-amber-500/30">
                    <span class="text-[9px] text-amber-400 font-bold block uppercase">Casas</span>
                    <strong class="text-amber-200 text-xs">${casasCount.toLocaleString()}</strong>
                  </div>
                  <div class="bg-[#08061a]/90 p-1 rounded border border-sky-500/30">
                    <span class="text-[9px] text-sky-400 font-bold block uppercase">Familias</span>
                    <strong class="text-sky-200 text-xs">${famCount.toLocaleString()}</strong>
                  </div>
                  <div class="bg-[#08061a]/90 p-1 rounded border border-emerald-500/30">
                    <span class="text-[9px] text-emerald-400 font-bold block uppercase">Habitantes</span>
                    <strong class="text-emerald-200 text-xs">${habCount.toLocaleString()}</strong>
                  </div>
                  <div class="bg-[#08061a]/90 p-1 rounded border border-purple-500/30">
                    <span class="text-[9px] text-purple-400 font-bold block uppercase">Votantes</span>
                    <strong class="text-purple-200 text-xs">${milCount.toLocaleString()}</strong>
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-1 text-center font-mono text-[9px] mb-1.5 p-1 rounded-lg bg-slate-950/90 border border-sky-800/60">
                  <span class="text-emerald-300 font-bold" title="Voto Duro">🟢 ${duroCount.toLocaleString()}</span>
                  <span class="text-amber-300 font-bold" title="Voto Blando">🟡 ${blandoCount.toLocaleString()}</span>
                  <span class="text-sky-300 font-bold" title="Voto Nuevo">🔵 ${nuevoCount.toLocaleString()}</span>
                </div>

                <div class="text-[10px] text-purple-200 font-medium truncate mb-1 bg-purple-950/60 px-1.5 py-1 rounded border border-purple-800/60">
                  ${centroVot}
                </div>

                <div class="flex items-center justify-between text-[9px] text-slate-400 pt-0.5 border-t border-sky-900/40">
                  <span>Área: ${poly.areaHa || 0} Ha</span>
                  <span>Perímetro: ${poly.perimetroM || 0} m</span>
                </div>
                <span class="text-[9px] text-sky-300 font-bold block mt-1 text-center">👉 Clic para abrir Ficha / Modificar</span>
              </div>
            `, { sticky: true, className: "earth-tooltip" });
          }

          pLayer.on("click", (e) => {
            if (e.originalEvent?.target?.blur) e.originalEvent.target.blur();
            if (document.activeElement?.blur) document.activeElement.blur();
            if (window.earthApp?.toolsManager?.activeTool) {
              L.DomEvent.stopPropagation(e);
              window.earthApp.toolsManager.handleMapClick(e);
              return;
            }
            L.DomEvent.stopPropagation(e);

            if (onSelectCallback) onSelectCallback("poligono", poly);
          });

          this.polygonsLayer.addLayer(pLayer);

          // Marcador de Centroide con militantes siempre visible en el mapa
          const centroid = this.calculateCentroid(rawCoords);
          if (centroid && this.sectorLabelsLayer) {
            const badgeIcon = L.divIcon({
              className: "custom-sector-pin",
              html: `<div class="px-2 py-0.5 rounded-full text-[10px] font-black border shadow-lg cursor-pointer whitespace-nowrap transition transform hover:scale-110 flex items-center gap-1 ${isActiveParish ? 'bg-sky-950/90 text-sky-200 border-sky-400' : 'bg-slate-900/90 text-slate-200 border-slate-600'}" style="backdrop-filter: blur(4px);">
                <span class="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0 animate-pulse"></span>
                <span>${poly.nombre}</span>
                ${milCount > 0 ? `<span class="text-[9px] text-sky-300 ml-0.5 font-mono">(${milCount})</span>` : ''}
              </div>`,
              iconSize: null,
              iconAnchor: [30, 10]
            });
            const badgeMarker = L.marker(centroid, { icon: badgeIcon, interactive: !isDrawing });
            badgeMarker.on("click", (e) => {
              L.DomEvent.stopPropagation(e);
              if (onSelectCallback) onSelectCallback("poligono", poly);
            });
            this.sectorLabelsLayer.addLayer(badgeMarker);
          }
        } catch (err) {
          console.warn("[MapEngine] Error renderizando sector comunal:", poly, err);
        }
      });

      // 2. Rutas / Calles
      (pData.rutas || []).forEach(r => {
        if (r.visible === false || !r.puntos || r.puntos.length < 2) return;

        const line = L.polyline(r.puntos, {
          color: r.color || "#10b981",
          weight: r.ancho || 4,
          opacity: isActiveParish ? 1 : 0.75,
          renderer: this.canvasRenderer
        });

        line.bindTooltip(`
          <div class="p-1 font-mono text-xs">
            <strong class="text-white block font-bold">${r.nombre}</strong>
            <span class="text-[10px] text-emerald-300">Longitud: ${r.longitudM || 0} m</span>
          </div>
        `, { sticky: true, className: "earth-tooltip" });

        line.on("click", (e) => {
          if (e.originalEvent?.target?.blur) e.originalEvent.target.blur();
          if (document.activeElement?.blur) document.activeElement.blur();
          if (window.earthApp?.toolsManager?.activeTool) {
            window.earthApp.toolsManager.handleMapClick(e);
            return;
          }
          L.DomEvent.stopPropagation(e);
          if (onSelectCallback) onSelectCallback("ruta", r);
        });

        this.routesLayer.addLayer(line);
      });

      // 3. Marcas de Posición
      (pData.marcas || []).forEach(m => {
        if (m.visible === false || m.lat === undefined || m.lng === undefined) return;

        const pinColor = m.color || "#f43f5e";
        const pinIcon = L.divIcon({
          className: "earth-placemark-pin-wrapper",
          html: `
            <div class="earth-placemark-pin transition transform hover:scale-125 active:scale-95" style="width: 28px; height: 36px; cursor: pointer; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.75)); pointer-events: auto;">
              <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Sombra en la base de contacto -->
                <ellipse cx="14" cy="35" rx="4.5" ry="1.5" fill="rgba(0,0,0,0.4)"/>
                <!-- Aguja de contacto exacto (14, 36) -->
                <path d="M14 36 L11.5 22 L16.5 22 Z" fill="#334155"/>
                <!-- Cabeza del pin -->
                <path d="M14 2 C7.9 2 3 6.9 3 13 C3 21 14 34 14 34 C14 34 25 21 25 13 C25 6.9 20.1 2 14 2 Z" fill="${pinColor}" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
                <!-- Reflejo interior blanco -->
                <circle cx="14" cy="13" r="4" fill="#ffffff"/>
              </svg>
            </div>
          `,
          iconSize: [28, 36],
          iconAnchor: [14, 36],
          popupAnchor: [0, -36],
          tooltipAnchor: [0, -36]
        });

        const marker = L.marker([m.lat, m.lng], { icon: pinIcon });
        marker.bindTooltip(`<strong>${m.nombre}</strong>`, { sticky: true });
        marker.on("click", (e) => {
          if (window.earthApp?.toolsManager?.activeTool) {
            window.earthApp.toolsManager.handleMapClick(e);
            return;
          }
          L.DomEvent.stopPropagation(e);
          if (onSelectCallback) onSelectCallback("marca", m);
        });
        this.placemarksLayer.addLayer(marker);
      });
    });

    // Aplicar estado de visibilidad jerárquica respetando LOD o filtros activos
    this.updateHierarchicalLOD();
  }

  /**
   * Conmuta el modo de Zoom Inteligente Automático (LOD dinámico)
   */
  setAutoZoomLOD(enabled) {
    this.autoZoomLOD = !!enabled;
    const chk = document.getElementById("chk-auto-zoom-lod");
    if (chk) chk.checked = this.autoZoomLOD;

    const lblLod = document.getElementById("lbl-active-lod-name");
    if (!this.autoZoomLOD) {
      if (lblLod) lblLod.textContent = "Control Manual";
    } else {
      this.updateHierarchicalLOD();
    }
  }

  /**
   * Refleja el estado de visibilidad en los checkboxes del panel lateral
   */
  syncCheckboxesUI(activeLodName = null) {
    ["l1", "l2", "l3", "l4", "l5"].forEach((lvl) => {
      const chk = document.getElementById(`chk-layer-${lvl}`);
      if (chk) {
        chk.checked = !!this.hierarchicalVisibility[lvl];
      }
    });

    const lblLod = document.getElementById("lbl-active-lod-name");
    if (lblLod && activeLodName) {
      lblLod.textContent = activeLodName;
    }

    const chkAuto = document.getElementById("chk-auto-zoom-lod");
    if (chkAuto) {
      chkAuto.checked = this.autoZoomLOD;
    }
  }

  /**
   * Aplica la visibilidad física a todas las capas del mapa Leaflet
   */
  applyVisibilityToLayers(currentZoom) {
    if (!this.map) return;
    const z = currentZoom !== undefined ? currentZoom : this.map.getZoom();

    // L1: Estado Monagas
    if (this.layerL1_Estado) {
      if (this.hierarchicalVisibility.l1) {
        if (!this.map.hasLayer(this.layerL1_Estado)) this.map.addLayer(this.layerL1_Estado);
      } else {
        if (this.map.hasLayer(this.layerL1_Estado)) this.map.removeLayer(this.layerL1_Estado);
      }
    }

    // L2: 13 Municipios
    if (this.layerL2_Municipios) {
      if (this.hierarchicalVisibility.l2) {
        if (!this.map.hasLayer(this.layerL2_Municipios)) this.map.addLayer(this.layerL2_Municipios);
      } else {
        if (this.map.hasLayer(this.layerL2_Municipios)) this.map.removeLayer(this.layerL2_Municipios);
      }
    }

    // L3: 44 Parroquias
    if (this.layerL3_Parroquias) {
      if (this.hierarchicalVisibility.l3) {
        if (!this.map.hasLayer(this.layerL3_Parroquias)) this.map.addLayer(this.layerL3_Parroquias);
      } else {
        if (this.map.hasLayer(this.layerL3_Parroquias)) this.map.removeLayer(this.layerL3_Parroquias);
      }
    }

    // L4: Sub-Parroquias (Ejes Comunales)
    const showSpLabels = z >= 13;
    if (this.subParroquiasLayer) {
      if (this.hierarchicalVisibility.l4) {
        if (!this.map.hasLayer(this.subParroquiasLayer)) this.map.addLayer(this.subParroquiasLayer);
        if (this.subParroquiaLabelsLayer) {
          if (showSpLabels && !this.map.hasLayer(this.subParroquiaLabelsLayer)) this.map.addLayer(this.subParroquiaLabelsLayer);
          else if (!showSpLabels && this.map.hasLayer(this.subParroquiaLabelsLayer)) this.map.removeLayer(this.subParroquiaLabelsLayer);
        }
      } else {
        if (this.map.hasLayer(this.subParroquiasLayer)) this.map.removeLayer(this.subParroquiasLayer);
        if (this.subParroquiaLabelsLayer && this.map.hasLayer(this.subParroquiaLabelsLayer)) this.map.removeLayer(this.subParroquiaLabelsLayer);
      }
    }

    // L5: Sectores Comunales (Base)
    const isMobileScreen = typeof window !== "undefined" && window.innerWidth < 640;
    const showSecLabels = isMobileScreen ? z >= 13 : z >= 12;
    if (this.polygonsLayer) {
      if (this.hierarchicalVisibility.l5) {
        if (!this.map.hasLayer(this.polygonsLayer)) this.map.addLayer(this.polygonsLayer);
        if (this.sectorLabelsLayer) {
          if (showSecLabels && !this.map.hasLayer(this.sectorLabelsLayer)) this.map.addLayer(this.sectorLabelsLayer);
          else if (!showSecLabels && this.map.hasLayer(this.sectorLabelsLayer)) this.map.removeLayer(this.sectorLabelsLayer);
        }
      } else {
        if (this.map.hasLayer(this.polygonsLayer)) this.map.removeLayer(this.polygonsLayer);
        if (this.sectorLabelsLayer && this.map.hasLayer(this.sectorLabelsLayer)) this.map.removeLayer(this.sectorLabelsLayer);
      }
    }
  }

  /**
   * Sincroniza la visibilidad de capas según el nivel de zoom (Zoom Inteligente)
   * o según la selección manual del usuario
   */
  updateHierarchicalLOD() {
    if (!this.map) return;
    const currentZoom = this.map.getZoom();
    const zoomValEl = document.getElementById("lbl-active-zoom-val");
    if (zoomValEl) zoomValEl.textContent = `Zoom ${currentZoom}`;

    if (this.autoZoomLOD) {
      let lodName = "Nivel 5 • Sectores";
      if (currentZoom < 10) {
        // Zoom macro: Todo el estado y los 13 municipios
        this.hierarchicalVisibility.l1 = true;
        this.hierarchicalVisibility.l2 = true;
        this.hierarchicalVisibility.l3 = false;
        this.hierarchicalVisibility.l4 = false;
        this.hierarchicalVisibility.l5 = false;
        lodName = "L1/L2 • Estado y Municipios";
      } else if (currentZoom >= 10 && currentZoom < 13) {
        // Zoom intermedio: 44 Parroquias oficiales visibles, municipios cerrados
        this.hierarchicalVisibility.l1 = false;
        this.hierarchicalVisibility.l2 = false;
        this.hierarchicalVisibility.l3 = true;
        this.hierarchicalVisibility.l4 = false;
        this.hierarchicalVisibility.l5 = false;
        lodName = "L3 • 44 Parroquias Oficiales";
      } else if (currentZoom >= 13 && currentZoom < 15) {
        // Zoom de eje comunal / sub-parroquias: parroquias cerradas, ejes comunales abiertos
        this.hierarchicalVisibility.l1 = false;
        this.hierarchicalVisibility.l2 = false;
        this.hierarchicalVisibility.l3 = false;
        this.hierarchicalVisibility.l4 = true;
        this.hierarchicalVisibility.l5 = false;
        lodName = "L4 • Ejes Comunales";
      } else {
        // Zoom comunal y catastral (>= 15): se abren todos los sectores comunales
        this.hierarchicalVisibility.l1 = false;
        this.hierarchicalVisibility.l2 = false;
        this.hierarchicalVisibility.l3 = false;
        this.hierarchicalVisibility.l4 = false;
        this.hierarchicalVisibility.l5 = true;
        lodName = "L5 • Sectores Comunales";
      }

      this.syncCheckboxesUI(lodName);
    }

    this.applyVisibilityToLayers(currentZoom);
  }

  /**
   * Modo Edición Interactiva de Vértices para Polígonos de Sectores
   */
  startEditingPolygonGeometry(poly, onUpdatedCallback) {
    this.stopEditingPolygonGeometry();
    this.editingPoly = poly;
    this.editingVertexMarkers = [];

    const banner = document.getElementById("earth-drawing-banner");
    const bannerText = document.getElementById("earth-drawing-banner-text");
    const liveMeasure = document.getElementById("earth-live-measure");

    if (banner) {
      banner.classList.remove("hidden");
      banner.classList.add("flex");
      banner.style.display = "flex";
      banner.style.zIndex = "9999";
      if (bannerText) bannerText.textContent = `Ajustando ${poly.nombre}: Arrastra los puntos amarillos sobre el satélite`;
      if (liveMeasure) liveMeasure.textContent = `${poly.vertices.length} vértices`;
    }

    const vertexIcon = L.divIcon({
      className: "earth-vertex-marker-wrapper",
      html: `<div class="w-4 h-4 bg-amber-400 border-2 border-slate-950 rounded-full shadow-lg cursor-move hover:scale-125 active:scale-95 transition"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    poly.vertices.forEach((pt, idx) => {
      const m = L.marker(pt, {
        draggable: true,
        icon: vertexIcon,
        zIndexOffset: 2000
      }).addTo(this.tempDrawingLayer);

      m.on("drag", (e) => {
        const newPos = [e.latlng.lat, e.latlng.lng];
        poly.vertices[idx] = newPos;
        const lLayer = this.leafletLayersMap ? this.leafletLayersMap.get(String(poly.id)) : null;
        if (lLayer) {
          lLayer.setLatLngs(poly.vertices);
        }
      });

      this.editingVertexMarkers.push(m);
    });

    this.onFinishGeometryEdit = onUpdatedCallback;
  }

  finishEditingPolygonGeometry() {
    if (this.editingPoly && this.onFinishGeometryEdit) {
      this.onFinishGeometryEdit(this.editingPoly);
    }
    this.stopEditingPolygonGeometry();
  }

  stopEditingPolygonGeometry() {
    this.editingPoly = null;
    this.onFinishGeometryEdit = null;
    this.tempDrawingLayer.clearLayers();
    this.editingVertexMarkers = [];

    const banner = document.getElementById("earth-drawing-banner");
    if (banner) {
      banner.classList.add("hidden");
      banner.classList.remove("flex");
      banner.style.display = "none";
    }
  }

  // Superposición de imagen (Image Overlay para Calcar Planos)
  addImageOverlay(url, bounds, opacity = 0.65) {
    this.overlayLayer.clearLayers();
    const overlay = L.imageOverlay(url, bounds, { opacity: opacity }).addTo(this.overlayLayer);
    this.map.fitBounds(bounds);
    return overlay;
  }

  // Resaltado de selección activa en Amarillo Neón al tocar polígono
  highlightPolygon(id) {
    this.clearPolygonHighlight();
    const layer = this.leafletLayersMap ? this.leafletLayersMap.get(String(id)) : null;
    if (!layer || typeof layer.setStyle !== "function") return;

    this.activeHighlightedLayer = layer;
    this.activeHighlightedOriginalStyle = {
      color: layer.options.color,
      weight: layer.options.weight,
      fillColor: layer.options.fillColor,
      fillOpacity: layer.options.fillOpacity,
      dashArray: layer.options.dashArray
    };

    layer.setStyle({
      color: "#facc15", // Amarillo Neón vibrante
      weight: 4.5,
      fillOpacity: Math.min((layer.options.fillOpacity !== undefined ? layer.options.fillOpacity : 0.3) + 0.25, 0.75),
      dashArray: null
    });

    try { layer.bringToFront(); } catch(e) {}
  }

  clearPolygonHighlight() {
    if (this.activeHighlightedLayer && this.activeHighlightedOriginalStyle) {
      try {
        this.activeHighlightedLayer.setStyle(this.activeHighlightedOriginalStyle);
      } catch(e) {}
    }
    this.activeHighlightedLayer = null;
    this.activeHighlightedOriginalStyle = null;
  }
}
