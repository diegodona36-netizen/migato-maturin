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

    // Capa base oficial de OpenStreetMap (100% libre, sin marcas de agua ni API Keys)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(this.map);

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

      const pulseClass = estadoActual === 'rojo' ? 'pulse-red' : '';

      // Marcador Circular de Precisión Centrada (Punto central exacto anclado en [16, 16])
      const iconEmoji = this.currentMode === 'vialidad' ? '🛣️' : '🚰';
      const badgeHtml = sec.totalEncuestas > 1 
        ? `<div class="pin-badge">${sec.totalEncuestas}</div>` 
        : '';

      const iconHtml = `
        <div class="custom-target-marker" style="--marker-color: ${markerColor}">
          <div class="target-pulse"></div>
          <div class="target-core">
            <span>${iconEmoji}</span>
          </div>
          ${badgeHtml}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16], // El centro exacto [16, 16] está clavado en la coordenada
        popupAnchor: [0, -18]
      });

      const marker = L.marker([sec.lat, sec.lng], { icon: customIcon });

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

          <div class="text-[10px] text-slate-400 text-right">
            Última encuesta: ${sec.ultimaEncuesta ? sec.ultimaEncuesta.fecha : 'Reciente'}
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
