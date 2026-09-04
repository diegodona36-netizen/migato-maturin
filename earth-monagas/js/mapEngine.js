/**
 * Motor Cartográfico Acelerado por GPU — Google Earth Pro Web (Monagas)
 * Integrado con Capas Jerárquicas Oficiales (INE 2021) y Edición de Vértices
 */
import { GEO_ESTADO_OFICIAL, GEO_MUNICIPIOS_OFICIAL, GEO_PARROQUIAS_OFICIAL } from "./geoOficialMonagas.js?v=55";
import { SUBPARROQUIAS_GODOS } from "./geoMonagas.js?v=55";

export class EarthMapEngine {
  constructor(containerId, onCoordUpdate) {
    this.containerId = containerId;
    this.onCoordUpdate = onCoordUpdate;

    this.map = null;
    this.canvasRenderer = null;

    // Capas Base
    this.boundaryLayer = null;
    this.polygonsLayer = null;
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

    // Estado de Edición de Vértices
    this.editingPoly = null;
    this.editingVertexMarkers = [];
    this.onFinishGeometryEdit = null;

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

    this.map = L.map(this.containerId, {
      center: [9.7469, -63.1812], // Maturín
      zoom: 13,
      preferCanvas: true,
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
    this.polygonsLayer = L.layerGroup().addTo(this.map);
    this.routesLayer = L.layerGroup().addTo(this.map);
    this.placemarksLayer = L.layerGroup().addTo(this.map);
    this.overlayLayer = L.layerGroup().addTo(this.map);
    this.tempDrawingLayer = L.layerGroup().addTo(this.map);

    this.spotlightEnabled = true; // Modo Foco activo por defecto: alrededores en negro para concentrarse 100% en la parroquia
    this.currentParishLimite = null;
    this.currentParishId = null;

    // Inicializar Capas Jerárquicas Oficiales (LOD 1 a 5)
    this.initHierarchicalLayers();

    // Seguimiento dinámico de coordenadas en la barra de estado
    this.map.on("mousemove", (e) => {
      if (this.onCoordUpdate) {
        this.onCoordUpdate(e.latlng.lat, e.latlng.lng, this.getEyeAltitude());
      }
    });

    this.map.on("zoomend", () => {
      const center = this.map.getCenter();
      if (this.onCoordUpdate) {
        this.onCoordUpdate(center.lat, center.lng, this.getEyeAltitude());
      }
      this.updateHierarchicalLOD();
    });
  }

  /**
   * Construye las capas oficiales de los 5 niveles jerárquicos
   */
  initHierarchicalLayers() {
    // 1. Capa L1: Estado Monagas (Oficial INE/IGVSB)
    this.layerL1_Estado = L.geoJSON(GEO_ESTADO_OFICIAL, {
      style: {
        color: "#f59e0b",
        weight: 3.5,
        opacity: 0.95,
        fillColor: "#f59e0b",
        fillOpacity: 0.06,
        dashArray: "8, 6"
      },
      onEachFeature: (feature, layer) => {
        layer.bindTooltip(`
          <div class="p-1 font-mono text-xs">
            <strong class="text-amber-400 block font-bold text-sm">Estado Monagas</strong>
            <span class="text-[10px] text-slate-300">13 Municipios • 44 Parroquias • 536 Centros de Votación</span>
          </div>
        `, { sticky: true, className: "earth-tooltip" });
      }
    });

    // 2. Capa L2: 13 Municipios (Oficial INE)
    this.layerL2_Municipios = L.geoJSON(GEO_MUNICIPIOS_OFICIAL, {
      style: (feature) => ({
        color: feature.properties.color || "#38bdf8",
        weight: 2,
        opacity: 0.9,
        fillColor: feature.properties.color || "#38bdf8",
        fillOpacity: 0.12
      }),
      onEachFeature: (feature, layer) => {
        const p = feature.properties;
        layer.bindTooltip(`
          <div class="p-1 font-mono text-xs">
            <strong class="text-white block font-bold text-sm">Municipio ${p.nombre || p.ADM2_ES}</strong>
            <span class="text-[10px] text-sky-300">Capital: ${p.capital || 'N/D'} • ${p.parroquias_count || ''} Parroquias</span>
            ${p.electores ? `<span class="text-[10px] text-slate-400 block font-mono">Electores: ~${p.electores.toLocaleString()}</span>` : ''}
          </div>
        `, { sticky: true, className: "earth-tooltip" });
      }
    });

    // 3. Capa L3: 44 Parroquias Oficiales (INE 2021)
    this.layerL3_Parroquias = L.geoJSON(GEO_PARROQUIAS_OFICIAL, {
      style: (feature) => ({
        color: "#ffffff",
        weight: 1.5,
        opacity: 0.85,
        fillColor: feature.properties.color || "#10b981",
        fillOpacity: 0.14,
        dashArray: "5, 4"
      }),
      onEachFeature: (feature, layer) => {
        const p = feature.properties;
        layer.bindTooltip(`
          <div class="p-1 font-mono text-xs">
            <strong class="text-emerald-400 block font-bold">${p.nombre || p.ADM3_ES}</strong>
            <span class="text-[10px] text-slate-300">Municipio ${p.municipioNombre || p.ADM2_ES || 'Monagas'}</span>
            <span class="text-[9px] text-amber-400 block mt-0.5">👉 Clic para seleccionar y mapear</span>
          </div>
        `, { sticky: true, className: "earth-tooltip" });

        layer.on("click", (e) => {
          if (this.isDrawingMode || window.earthApp?.toolsManager?.activeTool) {
            window.earthApp?.toolsManager?.handleMapClick(e);
            return;
          }
          L.DomEvent.stopPropagation(e);
          if (window.earthApp) {
            window.earthApp.selectParish(p.municipioId, p.id);
          }
        });
      }
    });

    // 4. Capa L4: 10 Sub-Parroquias / Ejes de Alto de Los Godos
    this.layerL4_SubParroquias = L.layerGroup();
    SUBPARROQUIAS_GODOS.forEach(sp => {
      if (sp.poligono && sp.poligono.length > 0) {
        const poly = L.polygon(sp.poligono, {
          color: sp.color || "#a855f7",
          weight: 2,
          opacity: 0.9,
          fillColor: sp.color || "#a855f7",
          fillOpacity: 0.22,
          dashArray: "3, 3"
        });
        poly.bindTooltip(`
          <div class="p-1 font-mono text-xs">
            <strong class="text-purple-300 block font-bold">${sp.nombre}</strong>
            <span class="text-[10px] text-slate-300">${sp.habitantesAprox ? `~${sp.habitantesAprox} hab` : ''}</span>
          </div>
        `, { sticky: true, className: "earth-tooltip" });
        this.layerL4_SubParroquias.addLayer(poly);
      }

      const pin = L.circleMarker(sp.centro, {
        radius: 6,
        fillColor: sp.color || "#a855f7",
        color: "#ffffff",
        weight: 1.5,
        fillOpacity: 0.9
      });
      pin.bindTooltip(`<strong>${sp.nombre}</strong><br><span class="text-[10px]">Centro de Referencia para Mapeo</span>`, { sticky: true, className: "earth-tooltip" });
      this.layerL4_SubParroquias.addLayer(pin);
    });
  }

  toggleHierarchicalLayer(levelKey, visible) {
    const layerMap = {
      'l1': this.layerL1_Estado,
      'l2': this.layerL2_Municipios,
      'l3': this.layerL3_Parroquias,
      'l4': this.layerL4_SubParroquias,
      'l5': this.polygonsLayer
    };
    const target = layerMap[levelKey];
    if (!target) return;
    if (visible) {
      if (!this.map.hasLayer(target)) this.map.addLayer(target);
    } else {
      if (this.map.hasLayer(target)) this.map.removeLayer(target);
    }
  }

  focusHierarchicalLayer(levelKey) {
    const centerZoomMap = {
      'l1': { center: [9.55, -63.15], zoom: 8 },
      'l2': { center: [9.7469, -63.1812], zoom: 9 },
      'l3': { center: [9.7469, -63.1812], zoom: 11 },
      'l4': { center: [9.7280, -63.2060], zoom: 13 },
      'l5': { center: [9.7260, -63.2180], zoom: 14 }
    };
    const target = centerZoomMap[levelKey];
    if (target) {
      this.map.flyTo(target.center, target.zoom, { duration: 1.2 });
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

    // 2. Máscara de Foco (Efecto Reflector en Negro Azabache Universal SVG)
    if (this.spotlightEnabled) {
      const worldBox = [
        [-90, -180],
        [-90, 180],
        [90, 180],
        [90, -180]
      ];

      // Máscara invertida con orificio para la parroquia activa (SVG con fill-rule: evenodd)
      const maskPoly = L.polygon([worldBox, coords], {
        fillColor: "#000000",
        fillOpacity: 0.38,
        color: "#000000",
        weight: 0,
        fillRule: "evenodd",
        interactive: false,
        renderer: this.svgRenderer
      });
      this.boundaryLayer.addLayer(maskPoly);
    }

    // 3. Contorno Neón Brillante para la Parroquia Iluminada
    const bPoly = L.polygon(coords, {
      color: "#38bdf8",
      weight: 2.5,
      opacity: 0.95,
      fill: false,
      dashArray: "6, 4",
      interactive: false,
      renderer: this.canvasRenderer
    });

    this.boundaryLayer.addLayer(bPoly);

    if (flyCamera) {
      this.map.flyToBounds(bPoly.getBounds(), { padding: [40, 40], duration: 1.2 });
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
        fillColor: "#000000",
        fillOpacity: 0.38,
        color: "#000000",
        weight: 0,
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
            if (l.options && (l.options.fillColor === "#020617" || l.options.fillColor === "#000000")) {
              l.setStyle({ fillOpacity: 0.38 });
            }
          } catch(e) {}
        });
      }

      const groups = [
        this.subParroquiasLayer,
        this.polygonsLayer,
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

  renderParishItems(parish, onSelectCallback) {
    this.polygonsLayer.clearLayers();
    this.routesLayer.clearLayers();
    this.placemarksLayer.clearLayers();
    if (this.subParroquiasLayer) this.subParroquiasLayer.clearLayers();

    if (!parish) return;

    // 0. Sub-Parroquias / Ejes Comunales (Nivel 4) - INDIVIDUALIZACIÓN ESTRICTA POR PARROQUIA
    const subParishesToRender = parish.subparroquias || [];

    subParishesToRender.forEach(sp => {
      try {
        if (sp.visible === false || !sp.vertices || sp.vertices.length < 3) return;

        const isDrawing = !!(window.earthApp?.toolsManager?.activeTool);
        const isFocused = String(window.earthApp?.activeSubParroquiaId || "") === String(sp.id || "");

        const spLayer = L.polygon(sp.vertices, {
          color: sp.colorBorde || "#c084fc",
          weight: isFocused ? 3.5 : (sp.anchoBorde || 2.5),
          opacity: 0.95,
          fillColor: sp.colorRelleno || "#a855f7",
          fill: true,
          fillOpacity: isFocused ? 0.12 : 0.07,
          dashArray: isFocused ? "8, 6" : "6, 4",
          interactive: !isDrawing,
          renderer: this.canvasRenderer
        });

        spLayer._spData = sp;
        sp._leafletLayer = spLayer;

        if (!isDrawing) {
          spLayer.bindTooltip(`
            <div class="p-1 font-mono text-xs">
              <span class="text-[9px] uppercase tracking-wider text-purple-400 font-black block">Nivel 4 • Eje Comunal</span>
              <strong class="text-white block font-bold text-sm">${sp.nombre}</strong>
              <span class="text-[10px] text-purple-200">Área: ${sp.areaHa || 0} Ha • Per: ${sp.perimetroM || 0} m</span>
              <span class="text-[9px] text-sky-400 block mt-1 font-bold">${isFocused ? '🎯 Eje Activo (Línea Limítrofe)' : '👉 Clic para opciones y trazar sector'}</span>
            </div>
          `, { sticky: true, className: "earth-tooltip" });
        }

        spLayer.on("click", (e) => {
          if (window.earthApp?.toolsManager?.activeTool) {
            L.DomEvent.stopPropagation(e);
            window.earthApp.toolsManager.handleMapClick(e);
            return;
          }
          L.DomEvent.stopPropagation(e);

          // Enfocar eje en la app
          if (window.earthApp) {
            window.earthApp.focusSubParish(sp.id, false);
          }

          // Métricas de sectores hijos dentro de esta sub-parroquia
          const pStore = window.earthApp?.store?.getParish(window.earthApp?.selectedMunId, window.earthApp?.selectedParishId);
          const childSectors = (pStore?.poligonos || []).filter(p => String(p.subParroquiaId) === String(sp.id));
          const totalMil = childSectors.reduce((acc, c) => acc + (parseInt(c.militantes !== undefined ? c.militantes : (c.habitantes || 0)) || 0), 0);
          const clickLatLng = e.latlng || L.polygon(sp.vertices).getBounds().getCenter();

          const popupContent = `
            <div class="p-2.5 font-mono text-slate-100 min-w-[240px] max-w-[280px]">
              <div class="flex items-center justify-between gap-2 border-b border-purple-800/60 pb-1.5 mb-2">
                <span class="text-[9px] uppercase tracking-wider text-purple-400 font-black flex items-center gap-1">
                  <span>🟪 Nivel 4 • Eje Comunal</span>
                </span>
                <span class="text-[10px] px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 font-bold border border-purple-700/60">
                  ${childSectors.length} Sectores
                </span>
              </div>

              <strong class="text-white block font-bold text-sm leading-snug mb-1.5">${sp.nombre}</strong>

              <div class="text-[11px] text-slate-300 space-y-1 bg-slate-950/80 p-2 rounded-xl border border-slate-800 mb-2.5">
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">Área:</span>
                  <span class="text-purple-300 font-bold">${sp.areaHa || 0} Ha</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">Militancia:</span>
                  <span class="text-sky-300 font-bold">👥 ${totalMil.toLocaleString()}</span>
                </div>
              </div>

              <div class="space-y-1.5">
                <button type="button" onclick="window.earthApp?.startSectorInSubParish('${sp.id}');" class="w-full py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition cursor-pointer">
                  <span>➕ Trazar Sector Comunal aquí</span>
                </button>
                <div class="grid grid-cols-2 gap-1.5">
                  <button type="button" onclick="window.earthApp?.openSubParishFicha('${sp.id}');" class="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] border border-slate-700 text-center transition cursor-pointer">
                    📋 Ficha
                  </button>
                  <button type="button" onclick="window.earthApp?.clearSubParishFocus();" class="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] border border-slate-700 text-center transition cursor-pointer">
                    👁️ Ver Todo
                  </button>
                </div>
              </div>
            </div>
          `;

          L.popup({
            className: "earth-popup-subparish",
            autoPan: true,
            closeButton: true,
            offset: [0, -10]
          })
          .setLatLng(clickLatLng)
          .setContent(popupContent)
          .openOn(this.map);

          if (onSelectCallback) onSelectCallback("subparroquia", sp, e);
        });

        if (this.subParroquiasLayer) this.subParroquiasLayer.addLayer(spLayer);
      } catch (err) {
        console.warn("[MapEngine] Error renderizando sub-parroquia:", sp, err);
      }
    });

    // 1. Polígonos de Sectores Comunales (Nivel 5)
    (parish.poligonos || []).forEach(poly => {
      try {
        if (poly.visible === false || !poly.vertices || poly.vertices.length < 3) return;

        const isDrawing = !!(window.earthApp?.toolsManager?.activeTool);

        const pLayer = L.polygon(poly.vertices, {
          color: poly.colorBorde || "#38bdf8",
          weight: poly.anchoBorde || 2,
          opacity: 0.95,
          fillColor: poly.colorRelleno || "#38bdf8",
          fillOpacity: poly.opacidad !== undefined ? poly.opacidad : 0.35,
          interactive: !isDrawing,
          renderer: this.canvasRenderer
        });

        pLayer._polyData = poly;
        poly._leafletLayer = pLayer;

        const milCount = poly.militantes !== undefined ? poly.militantes : (poly.habitantes || 0);
        if (!isDrawing) {
          pLayer.bindTooltip(`
            <div class="p-1.5 font-mono text-xs max-w-[210px]">
              <span class="text-[9px] uppercase text-sky-400 font-black block tracking-wider">Sector Comunal</span>
              <strong class="text-white block font-bold text-sm truncate">${poly.nombre}</strong>
              <div class="flex items-center gap-1.5 mt-1 text-[10px] text-slate-200">
              <span class="text-sky-300 font-bold">👥 ${milCount} mil</span>
              ${poly.casas ? `<span class="text-amber-300 font-bold">• 🏠 ${poly.casas} casas</span>` : ''}
            </div>
            ${poly.lider ? `<div class="text-[10px] text-slate-300 mt-0.5 truncate">👤 ${poly.lider}</div>` : ''}
            ${poly.telefono ? `<div class="text-[10px] text-emerald-400 mt-0.5 font-bold">📱 ${poly.telefono}</div>` : ''}
            <span class="text-[9px] text-slate-400 block mt-1">Área: ${poly.areaHa || 0} Ha • Per: ${poly.perimetroM || 0} m</span>
            <span class="text-[9px] text-sky-400 font-bold block mt-1">👉 Clic para ver / editar Ficha</span>
          </div>
        `, { sticky: true, className: "earth-tooltip" });
      }

      pLayer.on("click", (e) => {
        if (window.earthApp?.toolsManager?.activeTool) {
          L.DomEvent.stopPropagation(e);
          window.earthApp.toolsManager.handleMapClick(e);
          return;
        }
        L.DomEvent.stopPropagation(e);
        if (onSelectCallback) onSelectCallback("poligono", poly);
      });

        this.polygonsLayer.addLayer(pLayer);
      } catch (err) {
        console.warn("[MapEngine] Error renderizando sector comunal:", poly, err);
      }
    });

    // 2. Rutas / Calles
    (parish.rutas || []).forEach(r => {
      if (r.visible === false) return;

      const casing = L.polyline(r.puntos, {
        color: "#0f172a",
        weight: (r.ancho || 4) + 3,
        opacity: 0.8,
        lineCap: "round",
        lineJoin: "round",
        renderer: this.canvasRenderer
      });

      const line = L.polyline(r.puntos, {
        color: r.color || "#10b981",
        weight: r.ancho || 4,
        opacity: 1,
        lineCap: "round",
        lineJoin: "round",
        renderer: this.canvasRenderer
      });

      line.bindTooltip(`
        <div class="p-1 font-mono text-xs">
          <strong class="text-white block font-bold">${r.nombre}</strong>
          <span class="text-[10px] text-emerald-300">Longitud: ${r.longitudM || 0} m</span>
          ${r.descripcion ? `<p class="text-[10px] text-slate-300 mt-0.5">${r.descripcion}</p>` : ''}
        </div>
      `, { sticky: true, className: "earth-tooltip" });

      const handleClick = (e) => {
        if (window.earthApp?.toolsManager?.activeTool) {
          window.earthApp.toolsManager.handleMapClick(e);
          return;
        }
        L.DomEvent.stopPropagation(e);
        if (onSelectCallback) onSelectCallback("ruta", r);
      };

      casing.on("click", handleClick);
      line.on("click", handleClick);

      const group = L.featureGroup([casing, line]);
      this.routesLayer.addLayer(group);
    });

    // 3. Marcas de Posición / Placemarks (Pushpins de Alta Visibilidad estilo Google Earth)
    (parish.marcas || []).forEach(m => {
      if (m.visible === false || m.lat === undefined || m.lng === undefined) return;

      const isDrawing = !!(window.earthApp?.toolsManager?.activeTool);
      const pinColor = m.color || "#ef4444";
      const pinIcon = L.divIcon({
        className: "earth-placemark-pin-wrapper",
        html: `
          <div style="transform: translate(-50%, -100%); cursor: pointer; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.8));">
            <svg width="26" height="34" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.37 0 0 5.37 0 12C0 20.25 12 32 12 32C12 32 24 20.25 24 12C24 5.37 18.63 0 12 0Z" fill="${pinColor}" stroke="#ffffff" stroke-width="1.8"/>
              <circle cx="12" cy="11" r="4.5" fill="#ffffff"/>
            </svg>
          </div>
        `,
        iconSize: [26, 34],
        iconAnchor: [13, 34]
      });

      const marker = L.marker([m.lat, m.lng], {
        icon: pinIcon,
        interactive: !isDrawing,
        zIndexOffset: 600
      });

      if (!isDrawing) {
        marker.bindTooltip(`
          <div class="p-1 font-mono text-xs max-w-[200px]">
            <span class="text-[9px] uppercase text-rose-400 font-bold block">Marca de Posición</span>
            <strong class="text-white block font-bold truncate">${m.nombre}</strong>
            <span class="text-[10px] text-slate-300 block">Lat: ${Number(m.lat).toFixed(5)}, Lng: ${Number(m.lng).toFixed(5)}</span>
            ${m.descripcion ? `<p class="text-[10px] text-slate-300 mt-0.5 truncate">${m.descripcion}</p>` : ''}
            <span class="text-[9px] text-sky-400 font-bold block mt-1">👉 Clic para ver / editar</span>
          </div>
        `, { sticky: true, className: "earth-tooltip" });
      }

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

    // Actualizar LOD y fragmentación según zoom y selección
    this.updateHierarchicalLOD();
  }

  /**
   * Controla la visualización por niveles de detalle (LOD) y fragmentación:
   * - Zoom < 14 (Vista general del Municipio): SOLAMENTE se ven las SUB-PARROQUIAS. Los sectores comunales permanecen totalmente cerrados/ocultos.
   * - Zoom >= 14 (Vista de detalle): SE CIERRAN LAS SUB-PARROQUIAS por completo y SOLAMENTE se ven los SECTORES COMUNALES.
   */
  updateHierarchicalLOD() {
    if (!this.map) return;
    const zoom = this.map.getZoom();
    const activeTool = window.earthApp?.toolsManager?.activeTool;
    const isDrawing = !!activeTool;

    // Umbral de transición (Zoom 14 es el punto de fragmentación)
    const isCloseZoom = zoom >= 14;

    if (isCloseZoom) {
      // 1. Zoom cercano (>= 14): Las sub-parroquias SE CIERRAN por completo
      if (this.subParroquiasLayer) {
        if (!isDrawing || activeTool !== "subparroquia") {
          if (this.map.hasLayer(this.subParroquiasLayer)) {
            this.map.removeLayer(this.subParroquiasLayer);
          }
        } else {
          if (!this.map.hasLayer(this.subParroquiasLayer)) {
            this.map.addLayer(this.subParroquiasLayer);
          }
        }
      }

      // 2. Zoom cercano (>= 14): SOLAMENTE se ven los sectores comunales
      if (this.polygonsLayer) {
        if (!this.map.hasLayer(this.polygonsLayer)) {
          this.map.addLayer(this.polygonsLayer);
        }
        this.polygonsLayer.eachLayer(layer => {
          const poly = layer._polyData;
          if (poly) {
            layer.setStyle({
              opacity: 0.95,
              fill: true,
              fillOpacity: poly.opacidad !== undefined ? poly.opacidad : 0.35,
              weight: poly.anchoBorde || 2,
              color: poly.colorBorde || "#38bdf8",
              fillColor: poly.colorRelleno || "#38bdf8"
            });
          }
        });
      }
    } else {
      // 1. Zoom lejano (< 14, al entrar al municipio): SOLAMENTE se ven las sub-parroquias
      if (this.subParroquiasLayer) {
        if (!this.map.hasLayer(this.subParroquiasLayer)) {
          this.map.addLayer(this.subParroquiasLayer);
        }
        this.subParroquiasLayer.eachLayer(layer => {
          const sp = layer._spData;
          if (sp) {
            layer.setStyle({
              color: sp.colorBorde || "#c084fc",
              weight: sp.anchoBorde || 2.5,
              opacity: 0.95,
              fill: true,
              fillColor: sp.colorRelleno || "#a855f7",
              fillOpacity: sp.opacidad !== undefined ? sp.opacidad : 0.22,
              dashArray: null
            });
          }
        });
      }

      // 2. Zoom lejano (< 14): Los sectores comunales SE CIERRAN por completo (no se ven)
      if (this.polygonsLayer) {
        if (!isDrawing || activeTool !== "poligono") {
          if (this.map.hasLayer(this.polygonsLayer)) {
            this.map.removeLayer(this.polygonsLayer);
          }
        } else {
          if (!this.map.hasLayer(this.polygonsLayer)) {
            this.map.addLayer(this.polygonsLayer);
          }
        }
      }
    }
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
        if (poly._leafletLayer) {
          poly._leafletLayer.setLatLngs(poly.vertices);
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
}
