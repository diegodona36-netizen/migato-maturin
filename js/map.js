/**
 * Módulo del Mapa Interactivo de Maturín
 * Utiliza Leaflet + OpenStreetMap para visualización geolocalizada con semáforos.
 */

import { MATURIN_COORDINATES, PARROQUIAS_MATURIN } from './data.js';

export class MaturinMap {
  constructor(containerId = 'maturin-map') {
    this.containerId = containerId;
    this.map = null;
    this.markersLayer = null;
    this.currentMode = 'agua'; // 'agua' | 'vialidad' | 'combinado'
    this.selectedParroquia = 'todas';
    this.selectedColor = 'todos';
    this.sectoresData = [];
    this.onSectorClickCallback = null;
  }

  init() {
    if (this.map) return;

    const container = document.getElementById(this.containerId);
    if (!container) return;

    // Inicializar mapa de Leaflet centrado en Maturín
    this.map = L.map(this.containerId, {
      center: [MATURIN_COORDINATES.lat, MATURIN_COORDINATES.lng],
      zoom: MATURIN_COORDINATES.zoom,
      zoomControl: true
    });

    // Capa 1: Calles (OpenStreetMap oficial libre)
    const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    });

    // Capa 2: Satélite HD (Fotografía satelital real de Maturín sin API Keys)
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri &mdash; Fotografía Satelital',
      maxZoom: 19
    });

    osmLayer.addTo(this.map);

    // Selector de Capas (Calles / Satélite)
    L.control.layers({
      '🗺️ Mapa de Calles': osmLayer,
      '🛰️ Satélite HD': satelliteLayer
    }, null, { position: 'topright' }).addTo(this.map);

    window.maturinMapInstance = this;
    this.markersLayer = L.layerGroup().addTo(this.map);
  }

  setSectorClickCallback(callback) {
    this.onSectorClickCallback = callback;
  }

  /**
   * Actualiza los datos del mapa y redibuja los marcadores
   */
  updateData(sectoresAgrupados) {
    this.sectoresData = sectoresAgrupados || [];
    this.renderMarkers();
  }

  setMode(mode) {
    this.currentMode = mode;
    this.renderMarkers();
  }

  setFilters(parroquia = 'todas', color = 'todos') {
    this.selectedParroquia = parroquia;
    this.selectedColor = color;
    this.renderMarkers();
  }

  renderMarkers() {
    if (!this.map || !this.markersLayer) return;

    this.markersLayer.clearLayers();

    const filtered = this.sectoresData.filter(sec => {
      // Filtro de parroquia
      if (this.selectedParroquia !== 'todas' && sec.parroquia !== this.selectedParroquia) {
        return false;
      }

      // Filtro de color según el modo actual
      if (this.selectedColor !== 'todos') {
        const estadoActual = this.currentMode === 'vialidad' 
          ? sec.vialidadEstadoDominante 
          : sec.aguaEstadoDominante;
        if (estadoActual !== this.selectedColor) return false;
      }

      return true;
    });

    filtered.forEach(sec => {
      const estadoAgua = sec.aguaEstadoDominante;
      const estadoVialidad = sec.vialidadEstadoDominante;
      
      const estadoActual = this.currentMode === 'vialidad' ? estadoVialidad : estadoAgua;

      const markerColor = estadoActual === 'rojo' 
        ? '#EF4444' 
        : estadoActual === 'amarillo' 
        ? '#F59E0B' 
        : '#10B981';

      // 1. Halo o Anillo exterior pulsante (Vector nativo Leaflet)
      const glowMarker = L.circleMarker([sec.lat, sec.lng], {
        radius: 20,
        fillColor: markerColor,
        color: 'transparent',
        weight: 0,
        fillOpacity: 0.35,
        interactive: false
      });
      this.markersLayer.addLayer(glowMarker);

      // 2. Punto central vectorial nativo (CERO DESPLAZAMIENTO, 100% INMÓVIL EN CUALQUIER ZOOM)
      const marker = L.circleMarker([sec.lat, sec.lng], {
        radius: 12,
        fillColor: markerColor,
        color: '#FFFFFF',
        weight: 3.5,
        opacity: 1,
        fillOpacity: 0.95
      });

      // Al hacer clic en el punto, el mapa se centra automáticamente y hace zoom a la calle
      marker.on('click', () => {
        this.map.flyTo([sec.lat, sec.lng], Math.max(this.map.getZoom(), 16), {
          duration: 0.6
        });
        if (this.onSectorClickCallback) this.onSectorClickCallback(sec);
      });

      // Contenido del Popup informativo
      const popupHtml = `
        <div class="p-3 max-w-xs font-sans text-slate-800">
          <div class="flex items-center justify-between border-b pb-2 mb-2">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block">${sec.parroquia}</span>
              <h4 class="font-bold text-base text-slate-900 leading-tight">${sec.nombre}</h4>
            </div>
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              ${sec.totalEncuestas} ${sec.totalEncuestas === 1 ? 'encuesta' : 'encuestas'}
            </span>
          </div>

          <div class="space-y-2 mb-3">
            <!-- Estado Agua -->
            <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span class="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                <span>🚰</span> Agua:
              </span>
              <span class="inline-flex items-center gap-1 text-xs font-bold ${this.getTextColorClass(sec.aguaEstadoDominante)}">
                <span class="w-2.5 h-2.5 rounded-full ${this.getBgColorClass(sec.aguaEstadoDominante)}"></span>
                ${this.capitalize(sec.aguaEstadoDominante)}
              </span>
            </div>

            <!-- Estado Vialidad -->
            <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span class="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                <span>🛣️</span> Carreteras:
              </span>
              <span class="inline-flex items-center gap-1 text-xs font-bold ${this.getTextColorClass(sec.vialidadEstadoDominante)}">
                <span class="w-2.5 h-2.5 rounded-full ${this.getBgColorClass(sec.vialidadEstadoDominante)}"></span>
                ${this.capitalize(sec.vialidadEstadoDominante)}
              </span>
            </div>
          </div>

          ${sec.ultimaEncuesta && (sec.ultimaEncuesta.aguaObs || sec.ultimaEncuesta.vialidadObs) ? `
            <div class="text-xs text-slate-500 italic bg-amber-50 p-2 rounded border border-amber-200/60 mb-2">
              "${sec.ultimaEncuesta.aguaObs || sec.ultimaEncuesta.vialidadObs}"
            </div>
          ` : ''}

          <button onclick="window.maturinMapInstance.focusSector(${sec.lat}, ${sec.lng}, 18)" class="w-full mt-2 py-2 px-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all">
            🔍 Acercar al punto exacto (Zoom Máximo)
          </button>

          <div class="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
            <a href="https://www.google.com/maps/search/?api=1&query=${sec.lat},${sec.lng}" target="_blank" rel="noopener" class="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline">
              <span>📍</span> Ver en Google Maps
            </a>
            <span class="text-[10px] text-slate-400">
              ${sec.ultimaEncuesta ? sec.ultimaEncuesta.fecha : 'Reciente'}
            </span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 300, className: 'maturin-popup' });
      this.markersLayer.addLayer(marker);
    });
  }

  focusSector(lat, lng, zoom = 15) {
    if (this.map && lat && lng) {
      this.map.flyTo([lat, lng], zoom, { duration: 1.2 });
    }
  }

  resetView() {
    if (this.map) {
      this.map.flyTo([MATURIN_COORDINATES.lat, MATURIN_COORDINATES.lng], MATURIN_COORDINATES.zoom);
    }
  }

  invalidateSize() {
    if (this.map) {
      setTimeout(() => this.map.invalidateSize(), 200);
    }
  }

  getBgColorClass(color) {
    if (color === 'rojo') return 'bg-red-500';
    if (color === 'amarillo') return 'bg-amber-500';
    return 'bg-emerald-500';
  }

  getTextColorClass(color) {
    if (color === 'rojo') return 'text-red-600';
    if (color === 'amarillo') return 'text-amber-600';
    return 'text-emerald-600';
  }

  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
