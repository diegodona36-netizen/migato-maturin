/**
 * Motor Cartográfico Acelerado por GPU — Google Earth Pro Web (Monagas)
 * Integrado con Capas Jerárquicas Oficiales (INE 2021) y Edición de Vértices
 */
import { GEO_ESTADO_OFICIAL, GEO_MUNICIPIOS_OFICIAL, GEO_PARROQUIAS_OFICIAL } from "./geoOficialMonagas.js?v=65";

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

    this.spotlightEnabled = false; // Modo Foco desactivado por defecto para ver simultáneamente todos los sectores del estado
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

    // 4. Capa L4: Sub-Parroquias / Ejes (Dinámica, según parroquia activa)
    this.layerL4_SubParroquias = L.layerGroup();
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

  renderParishItems(activeParish, onSelectCallback) {
    this.polygonsLayer.clearLayers();
    this.routesLayer.clearLayers();
    this.placemarksLayer.clearLayers();
    if (this.subParroquiasLayer) this.subParroquiasLayer.clearLayers();

    // Obtener todas las parroquias que contengan datos en el catálogo
    const allParishesWithData = window.earthApp?.store?.getAllParishesWithData() || [];
    
    // Asegurar que la parroquia activa esté presente en la lista de renderizado
    const parishesToRender = [...allParishesWithData];
    if (activeParish && !parishesToRender.some(p => String(p.parishId) === String(activeParish.id))) {
      parishesToRender.push({
        munId: window.earthApp?.selectedMunId || "maturin",
        parishId: activeParish.id,
        parish: activeParish
      });
    }

    if (parishesToRender.length === 0 && activeParish) {
      parishesToRender.push({
        munId: window.earthApp?.selectedMunId || "maturin",
        parishId: activeParish.id,
        parish: activeParish
      });
    }

    const isDrawing = !!(window.earthApp?.toolsManager?.activeTool);

    parishesToRender.forEach(({ munId, parishId, parish: pData }) => {
      if (!pData) return;
      const isActiveParish = String(parishId) === String(activeParish?.id);

      // 0. Sub-Parroquias / Ejes Comunales (Nivel 4)
      (pData.subparroquias || []).forEach(sp => {
        try {
          if (sp.visible === false || !sp.vertices || sp.vertices.length < 3) return;

          const isFocused = String(window.earthApp?.activeSubParroquiaId || "") === String(sp.id || "");

          const spLayer = L.polygon(sp.vertices, {
            color: sp.colorBorde || "#c084fc",
            weight: isFocused ? 3.5 : (isActiveParish ? (sp.anchoBorde || 2.5) : 2),
            opacity: isActiveParish ? 0.95 : 0.75,
            fillColor: sp.colorRelleno || "#a855f7",
            fill: true,
            fillOpacity: isFocused ? 0.12 : (isActiveParish ? 0.08 : 0.04),
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
                <span class="text-[10px] text-purple-200">Parroquia: ${pData.nombre || parishId}</span>
                <span class="text-[10px] text-purple-300 block">Área: ${sp.areaHa || 0} Ha • Per: ${sp.perimetroM || 0} m</span>
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

            if (window.earthApp && String(window.earthApp.selectedParishId) !== String(parishId)) {
              window.earthApp.selectParish(munId, parishId);
            }

            if (window.earthApp) {
              window.earthApp.focusSubParish(sp.id, false);
            }

            if (onSelectCallback) onSelectCallback("subparroquia", sp, e);
          });

          if (this.subParroquiasLayer) this.subParroquiasLayer.addLayer(spLayer);
        } catch (err) {
          console.warn("[MapEngine] Error renderizando sub-parroquia:", sp, err);
        }
      });

      // 1. Polígonos de Sectores Comunales (Nivel 5)
      (pData.poligonos || []).forEach(poly => {
        try {
          if (poly.visible === false || !poly.vertices || poly.vertices.length < 3) return;

          const pLayer = L.polygon(poly.vertices, {
            color: poly.colorBorde || "#38bdf8",
            weight: poly.anchoBorde || (isActiveParish ? 2.5 : 2),
            opacity: isActiveParish ? 0.95 : 0.85,
            fillColor: poly.colorRelleno || "#38bdf8",
            fillOpacity: poly.opacidad !== undefined ? poly.opacidad : (isActiveParish ? 0.35 : 0.25),
            interactive: !isDrawing,
            renderer: this.canvasRenderer
          });

          pLayer._polyData = poly;
          poly._leafletLayer = pLayer;

          const milCount = poly.militantes !== undefined ? poly.militantes : (poly.habitantes || 0);
          if (!isDrawing) {
            pLayer.bindTooltip(`
              <div class="p-1.5 font-mono text-xs max-w-[220px]">
                <span class="text-[9px] uppercase text-sky-400 font-black block tracking-wider">Sector Comunal</span>
                <strong class="text-white block font-bold text-sm truncate">${poly.nombre}</strong>
                <span class="text-[10px] text-sky-200 block truncate">📍 ${pData.nombre || parishId}</span>
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

            if (window.earthApp && String(window.earthApp.selectedParishId) !== String(parishId)) {
              window.earthApp.selectParish(munId, parishId);
            }

            if (onSelectCallback) onSelectCallback("poligono", poly);
          });

          this.polygonsLayer.addLayer(pLayer);
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
  }

  /**
   * Asegura la visibilidad permanente de todos los sectores y ejes en cualquier nivel de zoom
   */
  updateHierarchicalLOD() {
    if (!this.map) return;
    if (this.subParroquiasLayer && !this.map.hasLayer(this.subParroquiasLayer)) {
      this.map.addLayer(this.subParroquiasLayer);
    }
    if (this.polygonsLayer && !this.map.hasLayer(this.polygonsLayer)) {
      this.map.addLayer(this.polygonsLayer);
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
