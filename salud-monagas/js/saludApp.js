/**
 * MIGATO • Módulo 5: Controlador de Pre-Diagnóstico de Infraestructura de Salud
 * Carga directa y universal para compatibilidad total en navegadores y móviles.
 */

(function(window) {
  'use strict';

  const CATALOGO_TERRITORIAL = window.CATALOGO_TERRITORIAL || [];
  const CATALOGO_TIPOS_ESTABLECIMIENTO = window.CATALOGO_TIPOS_ESTABLECIMIENTO || [];
  const CATALOGO_AREAS_SERVICIOS = window.CATALOGO_AREAS_SERVICIOS || [];
  const CATALOGO_FALLAS = window.CATALOGO_FALLAS || {};
  const OPCIONES_SOPORTE_VITAL = window.OPCIONES_SOPORTE_VITAL || {};
  const CENTROS_SALUD_INICIALES = window.CENTROS_SALUD_INICIALES || [];
const STORAGE_KEY = 'migato_salud_centros_v4';

// Estado global de la aplicación
const state = {
  centros: [],
  filtroMunicipio: 'todos',
  filtroTipoRed: 'todos',
  filtroRiesgo: 'todos',
  busqueda: '',
  centroSeleccionado: null,
  modoEdicion: false,
  precisionActual: 'exacta',
  mapaFormulario: null,
  marcadorFormulario: null,
  mapaGeneral: null,
  marcadoresGeneralLayer: null,
  mapaFichaImpresion: null
};

// ==============================================================
// 1. GESTIÓN DE DATOS Y ALMACENAMIENTO LOCAL
// ==============================================================

function inicializarDatos() {
  const centrosBase = (window.CENTROS_SALUD_INICIALES && window.CENTROS_SALUD_INICIALES.length > 0)
    ? window.CENTROS_SALUD_INICIALES
    : (CENTROS_SALUD_INICIALES || []);

  const guardados = localStorage.getItem(STORAGE_KEY);
  if (guardados) {
    try {
      const parsed = JSON.parse(guardados);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Sincronizar coordenadas exactas verificadas del catálogo base
        const mapBase = new Map(centrosBase.map(c => [c.id, c]));
        state.centros = parsed.map(p => {
          const base = mapBase.get(p.id);
          if (base && base.precision === 'exacta' && p.precision !== 'calibrada_usuario') {
            return {
              ...p,
              lat: base.lat,
              lng: base.lng,
              precision: 'exacta',
              sector: base.sector || p.sector
            };
          }
          return p;
        });
      } else {
        state.centros = [...centrosBase];
      }
    } catch (e) {
      console.error('Error al parsear centros guardados, usando iniciales', e);
      state.centros = [...centrosBase];
    }
  } else {
    state.centros = [...centrosBase];
    guardarEnStorage();
  }
}

function guardarEnStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.centros));
  actualizarContadoresKPI();
  renderDirectorioTabla();
  actualizarMapaGeneral();
}

function calcularNivelRiesgo(datos) {
  const soporte = datos.soporteVital || {};
  const fallas = datos.fallas || {};
  
  const planta = soporte.plantaElectrica || '';
  const agua = soporte.suministroAgua || '';
  const clima = soporte.climatizacion || '';
  
  let totalFallas = 0;
  Object.values(fallas).forEach(arr => {
    if (Array.isArray(arr)) totalFallas += arr.length;
  });

  // Criterios de ROJO (Riesgo Crítico / Inmediato)
  if (
    planta === 'Inoperativa' ||
    agua === 'Inexistente' ||
    clima === 'Cero Clima' ||
    (datos.tipoRed === 'hospitalaria' && datos.quirofanosOperativos === 0 && datos.quirofanosTotal > 0) ||
    totalFallas >= 8
  ) {
    return 'rojo';
  }

  // Criterios de AMARILLO (Alerta / Operación Parcial)
  if (
    agua === 'Cisterna' ||
    clima === 'Parcial' ||
    soporte.gasesMedicinales === 'Bombonas' ||
    (datos.tipoRed === 'comunal' && planta === 'No tiene') ||
    totalFallas >= 3
  ) {
    return 'amarillo';
  }

  // Si no presenta vulnerabilidades graves, es VERDE (Operatividad Estable)
  return 'verde';
}

// ==============================================================
// 2. INICIALIZACIÓN DE MAPAS LEAFLET
// ==============================================================

function initMapaFormulario() {
  if (state.mapaFormulario) return;
  if (typeof L === 'undefined') {
    console.warn('Leaflet aún no disponible para mapa-formulario');
    return;
  }

  const mapContainer = document.getElementById('mapa-formulario');
  if (!mapContainer || mapContainer._leaflet_id) return;

  const coordsIniciales = [9.7483, -63.1785];

  try {
    state.mapaFormulario = L.map('mapa-formulario', {
      zoomControl: true,
      attributionControl: false
    }).setView(coordsIniciales, 13);

    // Capa Satelital ESRI
    const satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19
    }).addTo(state.mapaFormulario);

    const streetsLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    });

    L.control.layers({
      '🛰️ Satelital': satLayer,
      '🗺️ Calles': streetsLayer
    }, null, { position: 'topright' }).addTo(state.mapaFormulario);

    const customPin = L.divIcon({
      className: 'custom-form-pin',
      html: '<div class="health-marker-pin rojo"><span class="health-marker-icon">+</span></div>',
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    state.marcadorFormulario = L.marker(coordsIniciales, {
      draggable: true,
      icon: customPin
    }).addTo(state.mapaFormulario);

    state.marcadorFormulario.on('dragend', function(e) {
      const pos = e.target.getLatLng();
      actualizarCoordenadasInputs(pos.lat, pos.lng, true);
    });

    state.mapaFormulario.on('click', function(e) {
      state.marcadorFormulario.setLatLng(e.latlng);
      actualizarCoordenadasInputs(e.latlng.lat, e.latlng.lng, true);
    });

    actualizarCoordenadasInputs(coordsIniciales[0], coordsIniciales[1], false);
  } catch (err) {
    console.error('Error inicializando mapa de formulario:', err);
  }
}

function procesarEnlaceOGoogleMaps(texto) {
  if (!texto) return null;
  const str = texto.trim();

  // 1. Coordenadas directas: 9.71751, -63.20721 o 9.71751 -63.20721
  const mSimple = str.match(/([+-]?\d+\.?\d*)[,\s]+([+-]?\d+\.?\d*)/);
  if (mSimple) {
    const lat = parseFloat(mSimple[1]);
    const lng = parseFloat(mSimple[2]);
    if (lat >= 7.5 && lat <= 11.5 && lng >= -65.5 && lng <= -61.0) {
      return { lat, lng };
    }
  }

  // 2. Formato Google Maps /@lat,lng
  const mAt = str.match(/@([+-]?\d+\.\d+),([+-]?\d+\.\d+)/);
  if (mAt) {
    return { lat: parseFloat(mAt[1]), lng: parseFloat(mAt[2]) };
  }

  // 3. Formato !3dlat!4dlng
  const m3d = str.match(/!3d([+-]?\d+\.\d+)!4d([+-]?\d+\.\d+)/);
  if (m3d) {
    return { lat: parseFloat(m3d[1]), lng: parseFloat(m3d[2]) };
  }

  // 4. Formato ?q=lat,lng o ll=lat,lng
  const mQ = str.match(/[?&](?:q|ll)=([+-]?\d+\.\d+),([+-]?\d+\.\d+)/);
  if (mQ) {
    return { lat: parseFloat(mQ[1]), lng: parseFloat(mQ[2]) };
  }

  return null;
}

function actualizarBadgePrecisionFormulario(tipo) {
  const container = document.getElementById('form-precision-status');
  if (!container) return;
  if (tipo === 'exacta' || tipo === 'calibrada_usuario') {
    container.innerHTML = `
      <div class="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px]">
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span>📍 Coordenada Exacta Verificada (${tipo === 'calibrada_usuario' ? 'Calibrada por Usuario' : 'Cartografía Satelital'})</span>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="flex items-center gap-1.5 text-amber-400 font-bold text-[10px]">
        <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
        <span>📍 Ubicación Referencial de Sector (Mueve el pin o presiona "Mi GPS" para fijar al techo)</span>
      </div>
    `;
  }
}

function actualizarCoordenadasInputs(lat, lng, esManual = false) {
  const inLat = document.getElementById('form-lat');
  const inLng = document.getElementById('form-lng');
  const dispCoord = document.getElementById('display-coordenadas');
  
  if (inLat) inLat.value = lat.toFixed(6);
  if (inLng) inLng.value = lng.toFixed(6);
  if (dispCoord) dispCoord.textContent = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

  if (esManual) {
    state.precisionActual = 'calibrada_usuario';
    const precInput = document.getElementById('form-precision');
    if (precInput) precInput.value = 'calibrada_usuario';
    actualizarBadgePrecisionFormulario('calibrada_usuario');
  }
}

function initMapaGeneral() {
  if (state.mapaGeneral) return;
  if (typeof L === 'undefined') {
    console.warn('Leaflet aún no disponible para mapa-general');
    return;
  }

  const mapContainer = document.getElementById('mapa-general');
  if (!mapContainer || mapContainer._leaflet_id) return;

  try {
    state.mapaGeneral = L.map('mapa-general', {
      zoomControl: true,
      attributionControl: false
    }).setView([9.6000, -63.2000], 9);

    const satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19
    }).addTo(state.mapaGeneral);

    const streetsLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    });

    L.control.layers({
      '🛰️ Satélite Monagas': satLayer,
      '🗺️ Mapa Urbano': streetsLayer
    }, null, { position: 'topright' }).addTo(state.mapaGeneral);

    state.marcadoresGeneralLayer = L.layerGroup().addTo(state.mapaGeneral);
    actualizarMapaGeneral();
  } catch (err) {
    console.error('Error inicializando mapa general:', err);
  }
}

function actualizarMapaGeneral() {
  if (!state.mapaGeneral || !state.marcadoresGeneralLayer) return;
  if (typeof L === 'undefined') return;

  state.marcadoresGeneralLayer.clearLayers();

  const filtrados = obtenerCentrosFiltrados();

  filtrados.forEach(c => {
    const color = c.nivelRiesgo || 'verde';
    const pinHtml = `
      <div class="health-marker-pin ${color}">
        ${color === 'rojo' ? '<div class="pulse-ring-rojo"></div>' : ''}
        <span class="health-marker-icon">🏥</span>
      </div>
    `;

    const customIcon = L.divIcon({
      className: 'health-marker-wrapper',
      html: pinHtml,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    const marker = L.marker([c.lat, c.lng], { icon: customIcon });

    const popupHtml = `
      <div class="p-3 min-w-[240px] text-xs font-sans text-slate-100">
        <div class="flex items-center justify-between gap-2 border-b border-indigo-900/60 pb-1.5 mb-2">
          <span class="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
            color === 'rojo' ? 'bg-red-950 text-red-400 border border-red-800' :
            color === 'amarillo' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
            'bg-emerald-950 text-emerald-400 border border-emerald-800'
          }">
            ${color === 'rojo' ? '⚠️ RIESGO CRÍTICO' : color === 'amarillo' ? '🟡 ALERTA' : '🟢 OPERATIVO'}
          </span>
          <span class="text-[10px] text-slate-400 font-mono">${(c.municipio || '').replace('Municipio ', '')}</span>
        </div>
        <h4 class="font-bold text-sm text-white mb-1 leading-snug">${c.nombre}</h4>
        <p class="text-indigo-200 text-[11px] mb-2">${c.clasificacionEspecificaLabel || c.clasificacionEspecifica} • ${c.parroquia}</p>
        
        <div class="mb-2">
          ${(c.precision === 'exacta' || c.precision === 'calibrada_usuario')
            ? `<div class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-700/80 text-[10px] text-emerald-300 font-bold">
                 <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                 <span>📍 Coordenada Exacta (${c.precision === 'calibrada_usuario' ? 'Ajustada en Campo' : 'Cartografía OSM / Satélite'})</span>
               </div>`
            : `<div class="p-1.5 rounded bg-amber-950/70 border border-amber-700/70 text-[10px] text-amber-300">
                 <div class="flex items-center gap-1 font-bold">
                   <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                   <span>📍 Ubicación Sectorial (Aproximada)</span>
                 </div>
                 <p class="text-[9px] text-amber-200/80 mt-0.5 leading-tight">Sin cartografía pública de edificio. Pulsa "Calibrar" o usa GPS para fijar el techo exacto.</p>
               </div>`
          }
        </div>

        <div class="grid grid-cols-2 gap-1.5 text-[10px] bg-indigo-950/70 p-2 rounded-lg border border-indigo-900/50 mb-3">
          <div>⚡ Planta: <strong class="text-white">${c.soporteVital?.plantaElectrica || 'N/A'}</strong></div>
          <div>💧 Agua: <strong class="text-white">${c.soporteVital?.suministroAgua || 'N/A'}</strong></div>
          <div>💨 Gases: <strong class="text-white">${c.soporteVital?.gasesMedicinales || 'N/A'}</strong></div>
          <div>❄️ Clima: <strong class="text-white">${c.soporteVital?.climatizacion || 'N/A'}</strong></div>
        </div>

        <div class="flex gap-1.5">
          <button onclick="window.editarCentro('${c.id}')" class="flex-1 py-2 bg-sky-500 hover:bg-sky-400 text-[#050814] font-black rounded-lg text-xs transition text-center shadow flex items-center justify-center gap-1">
            <span>📝 Realizar Registro / Diagnóstico</span>
          </button>
          <button onclick="window.calibrarEnMapa('${c.id}')" class="px-2.5 py-2 bg-[#1b134d] hover:bg-[#2b1f7d] text-amber-300 hover:text-amber-200 rounded-lg border border-amber-500/40 text-[10px] font-bold transition flex items-center justify-center gap-1" title="Ajustar y Calibrar Coordenadas Satelitales">
            🎯 Calibrar
          </button>
          <button onclick="window.verFichaCentro('${c.id}')" class="px-2.5 py-2 bg-[#140e40] hover:bg-[#2d1f85] text-slate-300 hover:text-white rounded-lg border border-[#2d1f85] text-[10px] font-bold transition" title="Ver Ficha Imprimible">
            Ficha
          </button>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml);
    state.marcadoresGeneralLayer.addLayer(marker);
  });
}

// ==============================================================
// 3. CASCADA DE MUNICIPIOS, PARROQUIAS Y SECTORES
// ==============================================================

function poblarMunicipios() {
  const selectMun = document.getElementById('form-municipio');
  const filtroMun = document.getElementById('filtro-municipio');

  const catTerritorial = (window.CATALOGO_TERRITORIAL && window.CATALOGO_TERRITORIAL.length > 0)
    ? window.CATALOGO_TERRITORIAL
    : (CATALOGO_TERRITORIAL || []);

  if (selectMun) {
    selectMun.innerHTML = '<option value="">-- Seleccione Municipio --</option>';
    catTerritorial.forEach(m => {
      selectMun.innerHTML += `<option value="${m.id}">${m.nombre}</option>`;
    });
  }

  if (filtroMun) {
    filtroMun.innerHTML = '<option value="todos">Todos los Municipios (13)</option>';
    catTerritorial.forEach(m => {
      filtroMun.innerHTML += `<option value="${m.id}">${m.nombre}</option>`;
    });
  }
}

function alCambiarMunicipio(municipioId) {
  const selectParr = document.getElementById('form-parroquia');
  const selectSec = document.getElementById('form-sector');
  if (!selectParr) return;

  selectParr.innerHTML = '<option value="">-- Seleccione Parroquia --</option>';
  if (selectSec) selectSec.innerHTML = '<option value="">-- Seleccione o escriba sector --</option>';

  const catTerritorial = (window.CATALOGO_TERRITORIAL && window.CATALOGO_TERRITORIAL.length > 0)
    ? window.CATALOGO_TERRITORIAL
    : (CATALOGO_TERRITORIAL || []);

  const mun = catTerritorial.find(m => m.id === municipioId);
  if (!mun) return;

  mun.parroquias.forEach(p => {
    selectParr.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
  });

  if (mun.parroquias.length > 0 && state.mapaFormulario && state.marcadorFormulario) {
    const coords = mun.parroquias[0].centro;
    state.mapaFormulario.flyTo(coords, 12.5, { duration: 1 });
    state.marcadorFormulario.setLatLng(coords);
    actualizarCoordenadasInputs(coords[0], coords[1]);
  }
}

function alCambiarParroquia(parroquiaId) {
  const selectMun = document.getElementById('form-municipio');
  const selectSec = document.getElementById('form-sector');
  if (!selectMun || !selectSec) return;

  const munId = selectMun.value;
  const catTerritorial = (window.CATALOGO_TERRITORIAL && window.CATALOGO_TERRITORIAL.length > 0)
    ? window.CATALOGO_TERRITORIAL
    : (CATALOGO_TERRITORIAL || []);

  const mun = catTerritorial.find(m => m.id === munId);
  if (!mun) return;

  const parr = mun.parroquias.find(p => p.id === parroquiaId);
  if (!parr) return;

  selectSec.innerHTML = '<option value="">-- Seleccione Sector --</option>';
  if (parr.sectores && parr.sectores.length > 0) {
    parr.sectores.forEach(s => {
      selectSec.innerHTML += `<option value="${s}">${s}</option>`;
    });
  }
  selectSec.innerHTML += '<option value="otro">+ Otro Sector (Ingresar manualmente)...</option>';

  if (parr.centro && state.mapaFormulario && state.marcadorFormulario) {
    state.mapaFormulario.flyTo(parr.centro, 14, { duration: 1 });
    state.marcadorFormulario.setLatLng(parr.centro);
    actualizarCoordenadasInputs(parr.centro[0], parr.centro[1]);
  }
}

// ==============================================================
// 4. TIPOS DE ESTABLECIMIENTO Y ÁREAS / FALLAS DINÁMICAS
// ==============================================================

function renderTiposEstablecimiento() {
  const container = document.getElementById('container-subtipos-mpps');
  const radiosRed = document.querySelectorAll('input[name="tipoRed"]');

  function actualizarSubtipos(redId) {
    if (!container) return;
    container.innerHTML = '';

    const catTipos = (window.CATALOGO_TIPOS_ESTABLECIMIENTO && window.CATALOGO_TIPOS_ESTABLECIMIENTO.length > 0)
      ? window.CATALOGO_TIPOS_ESTABLECIMIENTO
      : (CATALOGO_TIPOS_ESTABLECIMIENTO || []);

    const red = catTipos.find(r => r.id === redId);
    if (!red) return;

    let html = '<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">';
    red.subtipos.forEach(st => {
      html += `
        <label class="flex items-center gap-2 p-2.5 rounded-xl bg-[#140e40] border border-[#2d1f85] hover:border-sky-400/60 cursor-pointer text-xs transition">
          <input type="radio" name="clasificacionEspecifica" value="${st.codigo}" data-label="${st.nombre}" class="text-sky-500 focus:ring-sky-400 bg-slate-900 border-slate-700">
          <div>
            <span class="font-bold text-white block">${st.codigo}</span>
            <span class="text-[11px] text-slate-400 block">${st.nombre}</span>
          </div>
        </label>
      `;
    });
    html += '</div>';
    container.innerHTML = html;
  }

  radiosRed.forEach(r => {
    r.addEventListener('change', (e) => {
      actualizarSubtipos(e.target.value);
      evaluarSemaforoEnVivo();
    });
  });

  actualizarSubtipos('hospitalaria');
}

function renderAreasServiciosChecks() {
  const container = document.getElementById('container-areas-servicios');
  if (!container) return;

  const catAreas = (window.CATALOGO_AREAS_SERVICIOS && window.CATALOGO_AREAS_SERVICIOS.length > 0)
    ? window.CATALOGO_AREAS_SERVICIOS
    : (CATALOGO_AREAS_SERVICIOS || []);

  let html = '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">';
  catAreas.forEach(a => {
    html += `
      <div class="p-2.5 rounded-xl bg-[#140e40] border border-[#2d1f85] flex flex-col justify-between space-y-2">
        <label class="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
          <input type="checkbox" name="areaServicio" value="${a.id}" class="w-4 h-4 rounded text-sky-500 focus:ring-sky-400 bg-slate-900 border-slate-700">
          <span>${a.label}</span>
        </label>
        ${a.id === 'quirofanos' ? `
          <div class="flex items-center gap-2 pt-1 border-t border-[#2d1f85]/60 text-[11px]">
            <span class="text-slate-400">Total:</span>
            <input type="number" id="num-quirofanos-total" min="0" max="50" value="0" class="w-12 px-1.5 py-0.5 bg-[#0e092e] border border-slate-700 rounded text-center text-white">
            <span class="text-emerald-400 font-bold ml-1">Op:</span>
            <input type="number" id="num-quirofanos-op" min="0" max="50" value="0" class="w-12 px-1.5 py-0.5 bg-[#0e092e] border border-slate-700 rounded text-center text-white">
          </div>
        ` : ''}
        ${a.id === 'hospitalizacion' ? `
          <div class="flex items-center gap-2 pt-1 border-t border-[#2d1f85]/60 text-[11px]">
            <span class="text-slate-400">Camas Totales:</span>
            <input type="number" id="num-camas-hosp" min="0" max="1000" value="0" class="w-16 px-1.5 py-0.5 bg-[#0e092e] border border-slate-700 rounded text-center text-white">
          </div>
        ` : ''}
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

function renderFallasChecks() {
  const container = document.getElementById('container-fallas-detectadas');
  if (!container) return;

  const catFallas = (window.CATALOGO_FALLAS && Object.keys(window.CATALOGO_FALLAS).length > 0)
    ? window.CATALOGO_FALLAS
    : (CATALOGO_FALLAS || {});

  const grupos = [
    { key: 'electricas', titulo: '⚡ Fallas Eléctricas', items: catFallas.electricas || [] },
    { key: 'hidrosanitarias', titulo: '💧 Fallas Hidrosanitarias', items: catFallas.hidrosanitarias || [] },
    { key: 'estructurales', titulo: '🏗️ Estructurales y Arquitectónicas', items: catFallas.estructurales || [] },
    { key: 'climatizacion', titulo: '❄️ Climatización y Cadena de Frío', items: catFallas.climatizacion || [] },
    { key: 'bioseguridad', titulo: '☣️ Bioseguridad y Movilidad', items: catFallas.bioseguridad || [] }
  ];

  let html = '<div class="space-y-4">';
  grupos.forEach(g => {
    html += `
      <div class="bg-[#140e40] p-3.5 rounded-2xl border border-[#2d1f85]">
        <h4 class="text-xs font-black text-amber-300 uppercase tracking-wider mb-2.5 pb-1 border-b border-[#2d1f85]">${g.titulo}</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          ${g.items.map(item => `
            <label class="flex items-start gap-2 text-xs text-slate-300 hover:text-white cursor-pointer p-1 rounded hover:bg-[#1c1459] transition">
              <input type="checkbox" name="falla_${g.key}" value="${item.id}" class="w-3.5 h-3.5 mt-0.5 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700">
              <span class="leading-tight">${item.label}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;

  container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', evaluarSemaforoEnVivo);
  });
}

function evaluarSemaforoEnVivo() {
  const badge = document.getElementById('badge-semaforo-en-vivo');
  if (!badge) return;

  const datosTemp = recopilarDatosFormulario();
  const nivel = calcularNivelRiesgo(datosTemp);

  if (nivel === 'rojo') {
    badge.className = 'px-3 py-1 text-xs font-black uppercase tracking-wider bg-red-950 text-red-400 border border-red-600 rounded-full flex items-center gap-1.5 animate-pulse';
    badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-red-500"></span> ⚠️ RIESGO CRÍTICO DETECTADO';
  } else if (nivel === 'amarillo') {
    badge.className = 'px-3 py-1 text-xs font-black uppercase tracking-wider bg-amber-950 text-amber-400 border border-amber-600 rounded-full flex items-center gap-1.5';
    badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-500"></span> 🟡 ALERTA / COMPROMISO PARCIAL';
  } else {
    badge.className = 'px-3 py-1 text-xs font-black uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-600 rounded-full flex items-center gap-1.5';
    badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-500"></span> 🟢 SOPORTE OPERATIVO ESTABLE';
  }
}

// ==============================================================
// 5. RECOPILACIÓN Y GUARDADO DE PRE-DIAGNÓSTICO
// ==============================================================

function recopilarDatosFormulario() {
  const munSelect = document.getElementById('form-municipio');
  const parrSelect = document.getElementById('form-parroquia');
  const secSelect = document.getElementById('form-sector');
  const secCustom = document.getElementById('form-sector-custom');

  const sectorFinal = (secSelect && secSelect.value === 'otro') 
    ? (secCustom?.value || 'Sector Sin Especificar') 
    : (secSelect?.value || '');

  const tipoRedRadio = document.querySelector('input[name="tipoRed"]:checked');
  const subTipoRadio = document.querySelector('input[name="clasificacionEspecifica"]:checked');

  const areasServicios = [];
  document.querySelectorAll('input[name="areaServicio"]:checked').forEach(cb => {
    areasServicios.push(cb.value);
  });

  const fallas = {
    electricas: [],
    hidrosanitarias: [],
    estructurales: [],
    climatizacion: [],
    bioseguridad: []
  };

  ['electricas', 'hidrosanitarias', 'estructurales', 'climatizacion', 'bioseguridad'].forEach(k => {
    document.querySelectorAll(`input[name="falla_${k}"]:checked`).forEach(cb => {
      fallas[k].push(cb.value);
    });
  });

  const soporteVital = {
    plantaElectrica: document.querySelector('input[name="soporte_planta"]:checked')?.value || 'No tiene',
    suministroAgua: document.querySelector('input[name="soporte_agua"]:checked')?.value || 'Inexistente',
    gasesMedicinales: document.querySelector('input[name="soporte_gases"]:checked')?.value || 'Inexistente',
    climatizacion: document.querySelector('input[name="soporte_clima"]:checked')?.value || 'Cero Clima'
  };

  const idExistente = document.getElementById('form-centro-id')?.value;
  const nuevoId = idExistente || `centro-${Date.now()}`;

  const centro = {
    id: nuevoId,
    nombre: document.getElementById('form-nombre-centro')?.value.trim() || 'Centro de Salud Sin Nombre',
    estado: 'Monagas',
    area: 'Salud',
    municipioId: munSelect?.value || '',
    municipio: munSelect?.options[munSelect.selectedIndex]?.text || 'Municipio No Definido',
    parroquiaId: parrSelect?.value || '',
    parroquia: parrSelect?.options[parrSelect.selectedIndex]?.text || 'Parroquia No Definida',
    sector: sectorFinal,
    lat: parseFloat(document.getElementById('form-lat')?.value || '9.7483'),
    lng: parseFloat(document.getElementById('form-lng')?.value || '-63.1785'),
    tipoRed: tipoRedRadio?.value || 'hospitalaria',
    tipoRedLabel: tipoRedRadio?.parentElement?.querySelector('span')?.textContent || '',
    clasificacionEspecifica: subTipoRadio?.value || 'Hospital Tipo I',
    clasificacionEspecificaLabel: subTipoRadio?.dataset.label || subTipoRadio?.value || 'Hospital Tipo I',
    quirofanosTotal: parseInt(document.getElementById('num-quirofanos-total')?.value || '0', 10),
    quirofanosOperativos: parseInt(document.getElementById('num-quirofanos-op')?.value || '0', 10),
    camasHospitalizacion: parseInt(document.getElementById('num-camas-hosp')?.value || '0', 10),
    areasServicios: areasServicios,
    soporteVital: soporteVital,
    fallas: fallas,
    redRemision: document.getElementById('form-red-remision')?.value.trim() || 'HUMNT Maturín',
    observaciones: document.getElementById('form-observaciones')?.value.trim() || '',
    elaboradoPor: {
      nombre: document.getElementById('form-eval-nombre')?.value.trim() || 'Dr. Evaluador de Guardia',
      ci: document.getElementById('form-eval-ci')?.value.trim() || 'V-00.000.000',
      cargo: document.getElementById('form-eval-cargo')?.value.trim() || 'Enlace de Salud y Sala de Mando',
      telefono: document.getElementById('form-eval-telefono')?.value.trim() || '',
      fecha: document.getElementById('form-eval-fecha')?.value || new Date().toISOString().split('T')[0]
    },
    precision: document.getElementById('form-precision')?.value || (state.precisionActual || 'sectorial')
  };

  centro.nivelRiesgo = calcularNivelRiesgo(centro);
  return centro;
}

function guardarPreDiagnostico(e) {
  if (e) e.preventDefault();

  const centro = recopilarDatosFormulario();

  if (!centro.nombre || centro.nombre === 'Centro de Salud Sin Nombre') {
    alert('Por favor ingrese el Nombre Oficial del Centro de Salud.');
    document.getElementById('form-nombre-centro')?.focus();
    return;
  }

  if (!centro.municipioId || !centro.parroquiaId) {
    alert('Por favor seleccione Municipio y Parroquia de la jurisdicción.');
    return;
  }

  const idx = state.centros.findIndex(c => c.id === centro.id);
  if (idx >= 0) {
    state.centros[idx] = centro;
    alert(`Pre-diagnóstico actualizado correctamente: ${centro.nombre}`);
  } else {
    state.centros.unshift(centro);
    alert(`¡Pre-diagnóstico guardado exitosamente!
Centro: ${centro.nombre}
Nivel de Riesgo: ${centro.nivelRiesgo.toUpperCase()}`);
  }

  guardarEnStorage();
  limpiarFormulario();
  cambiarPestana('tab-directorio');
}

function limpiarFormulario() {
  const form = document.getElementById('form-pre-diagnostico');
  if (form) form.reset();
  
  const idInput = document.getElementById('form-centro-id');
  if (idInput) idInput.value = '';

  const fechaInput = document.getElementById('form-eval-fecha');
  if (fechaInput) fechaInput.value = new Date().toISOString().split('T')[0];

  state.precisionActual = 'exacta';
  const precInput = document.getElementById('form-precision');
  if (precInput) precInput.value = 'exacta';
  actualizarBadgePrecisionFormulario('exacta');

  state.modoEdicion = false;
  evaluarSemaforoEnVivo();
}

function calibrarEnMapa(id) {
  editarCentro(id);
  setTimeout(() => {
    const mapWidget = document.getElementById('mapa-formulario');
    if (mapWidget) {
      mapWidget.scrollIntoView({ behavior: 'smooth', block: 'center' });
      mapWidget.classList.add('ring-4', 'ring-sky-400');
      setTimeout(() => mapWidget.classList.remove('ring-4', 'ring-sky-400'), 3000);
    }
  }, 250);
}

function editarCentro(id) {
  const centro = state.centros.find(c => c.id === id);
  if (!centro) return;

  state.modoEdicion = true;
  cambiarPestana('tab-registro');

  document.getElementById('form-centro-id').value = centro.id;
  document.getElementById('form-nombre-centro').value = centro.nombre;

  state.precisionActual = centro.precision || 'sectorial';
  const precInput = document.getElementById('form-precision');
  if (precInput) precInput.value = state.precisionActual;
  actualizarBadgePrecisionFormulario(state.precisionActual);

  const selMun = document.getElementById('form-municipio');
  if (selMun) {
    selMun.value = centro.municipioId;
    alCambiarMunicipio(centro.municipioId);
  }

  setTimeout(() => {
    const selParr = document.getElementById('form-parroquia');
    if (selParr) {
      selParr.value = centro.parroquiaId;
      alCambiarParroquia(centro.parroquiaId);
    }

    setTimeout(() => {
      const selSec = document.getElementById('form-sector');
      if (selSec) {
        selSec.value = centro.sector;
      }
    }, 100);
  }, 100);

  if (centro.lat && centro.lng && state.mapaFormulario) {
    const pos = [centro.lat, centro.lng];
    state.mapaFormulario.setView(pos, 16);
    state.marcadorFormulario.setLatLng(pos);
    actualizarCoordenadasInputs(pos[0], pos[1], false);
  }

  const radioRed = document.querySelector(`input[name="tipoRed"][value="${centro.tipoRed}"]`);
  if (radioRed) {
    radioRed.checked = true;
    radioRed.dispatchEvent(new Event('change'));
  }

  setTimeout(() => {
    const radioSub = document.querySelector(`input[name="clasificacionEspecifica"][value="${centro.clasificacionEspecifica}"]`);
    if (radioSub) radioSub.checked = true;
  }, 150);

  document.querySelectorAll('input[name="areaServicio"]').forEach(cb => {
    cb.checked = (centro.areasServicios || []).includes(cb.value);
  });

  if (document.getElementById('num-quirofanos-total')) {
    document.getElementById('num-quirofanos-total').value = centro.quirofanosTotal || 0;
    document.getElementById('num-quirofanos-op').value = centro.quirofanosOperativos || 0;
  }
  if (document.getElementById('num-camas-hosp')) {
    document.getElementById('num-camas-hosp').value = centro.camasHospitalizacion || 0;
  }

  if (centro.soporteVital) {
    const p = document.querySelector(`input[name="soporte_planta"][value="${centro.soporteVital.plantaElectrica}"]`);
    if (p) p.checked = true;
    const a = document.querySelector(`input[name="soporte_agua"][value="${centro.soporteVital.suministroAgua}"]`);
    if (a) a.checked = true;
    const g = document.querySelector(`input[name="soporte_gases"][value="${centro.soporteVital.gasesMedicinales}"]`);
    if (g) g.checked = true;
    const c = document.querySelector(`input[name="soporte_clima"][value="${centro.soporteVital.climatizacion}"]`);
    if (c) c.checked = true;
  }

  if (centro.fallas) {
    Object.keys(centro.fallas).forEach(k => {
      const arr = centro.fallas[k] || [];
      document.querySelectorAll(`input[name="falla_${k}"]`).forEach(cb => {
        cb.checked = arr.includes(cb.value);
      });
    });
  }

  document.getElementById('form-red-remision').value = centro.redRemision || '';
  document.getElementById('form-observaciones').value = centro.observaciones || '';

  if (centro.elaboradoPor) {
    document.getElementById('form-eval-nombre').value = centro.elaboradoPor.nombre || '';
    document.getElementById('form-eval-ci').value = centro.elaboradoPor.ci || '';
    document.getElementById('form-eval-cargo').value = centro.elaboradoPor.cargo || '';
    document.getElementById('form-eval-telefono').value = centro.elaboradoPor.telefono || '';
    document.getElementById('form-eval-fecha').value = centro.elaboradoPor.fecha || '';
  }

  evaluarSemaforoEnVivo();
}

function eliminarCentro(id) {
  const centro = state.centros.find(c => c.id === id);
  if (!centro) return;

  if (confirm(`¿Confirma eliminar el pre-diagnóstico de "${centro.nombre}"? Esta acción no se puede deshacer.`)) {
    state.centros = state.centros.filter(c => c.id !== id);
    guardarEnStorage();
  }
}

// ==============================================================
// 6. GENERADOR DE FICHA TÉCNICA OFICIAL IMPRIMIBLE (1:1 PAPEL)
// ==============================================================

function renderFichaImprimible(centro) {
  const modal = document.getElementById('printable-sheet-modal');
  const bodyFicha = document.getElementById('printable-sheet-body');
  if (!modal || !bodyFicha) return;

  state.centroSeleccionado = centro;

  const box = (isChecked) => `<span class="ficha-box-check ${isChecked ? 'checked-x font-mono font-bold' : ''}">${isChecked ? 'X' : '&nbsp;'}</span>`;

  const hasFalla = (cat, fid) => (centro.fallas && centro.fallas[cat] && centro.fallas[cat].includes(fid));
  const hasArea = (aid) => (centro.areasServicios && centro.areasServicios.includes(aid));

  const html = `
    <div class="ficha-tecnica-salud">
      
      <!-- CABECERA PRINCIPAL -->
      <table class="ficha-table">
        <tr>
          <td colspan="4" class="ficha-header-title">
            PRE DIAGNÓSTICO DE INFRAESTRUCTURA
          </td>
        </tr>
        <tr>
          <td colspan="2" width="50%">
            <span class="ficha-label">Estado:</span> <span class="ficha-value">MONAGAS</span>
          </td>
          <td colspan="2" width="50%">
            <span class="ficha-label">Área:</span> <span class="ficha-value">SALUD</span>
          </td>
        </tr>
        <tr>
          <td width="25%">
            <span class="ficha-label">Municipio:</span> <span class="ficha-select-indicator">▼</span><br>
            <span class="ficha-value text-xs">${(centro.municipio || '').replace('Municipio ', '')}</span>
          </td>
          <td width="25%">
            <span class="ficha-label">Parroquia:</span> <span class="ficha-select-indicator">▼</span><br>
            <span class="ficha-value text-xs">${centro.parroquia || ''}</span>
          </td>
          <td width="25%">
            <span class="ficha-label">Sector:</span> <span class="ficha-select-indicator">▼</span><br>
            <span class="ficha-value text-xs">${centro.sector || 'Casco Central'}</span>
          </td>
          <td width="25%">
            <span class="ficha-label">Nombre del Centro:</span><br>
            <strong class="ficha-value text-xs">${centro.nombre}</strong>
          </td>
        </tr>
      </table>

      <!-- MAPA DE UBICACIÓN INTERACTIVO O ESTÁTICO -->
      <table class="ficha-table">
        <tr>
          <td style="background-color: #f8fafc; text-align: center; font-weight: 800; font-size: 8pt; padding: 2px 0; border-top: none;">
            MAPA DE UBICACIÓN (Coordenadas: ${(centro.lat || 9.7483).toFixed(5)}, ${(centro.lng || -63.1785).toFixed(5)})
          </td>
        </tr>
        <tr>
          <td style="padding: 0;">
            <div id="mapa-ficha-print" class="ficha-map-container"></div>
          </td>
        </tr>
      </table>

      <!-- TIPO DE ESTABLECIMIENTO -->
      <table class="ficha-table">
        <tr>
          <td width="24%" class="ficha-label" style="vertical-align: middle; background-color: #f8fafc;">
            Tipo de<br>Establecimiento
          </td>
          <td width="76%">
            <div class="grid grid-cols-2 gap-1 text-[8pt]">
              <div>${box(centro.tipoRed === 'comunal')} Red Comunal / Barrio Adentro (CPT, CDI, SRI)</div>
              <div>${box(centro.tipoRed === 'ambulatoria')} Red Ambulatoria Tradicional (Rural I-II, Urbano I-III)</div>
              <div>${box(centro.tipoRed === 'hospitalaria')} Red Hospitalaria Especializada (Tipo I, II, III, IV)</div>
              <div>${box(centro.tipoRed === 'otro')} Otro: ${centro.tipoRed === 'otro' ? centro.clasificacionEspecifica : '_______________________'}</div>
            </div>
          </td>
        </tr>
        <tr>
          <td class="ficha-label" style="vertical-align: middle; background-color: #f8fafc;">
            Clasificación<br>Específica (MPPS)
          </td>
          <td>
            <div class="space-y-1 text-[7.5pt]">
              <div>
                <strong>Red Comunal:</strong> 
                ${box(centro.clasificacionEspecifica === 'CPT I')} CPT I &nbsp;
                ${box(centro.clasificacionEspecifica === 'CPT II')} CPT II &nbsp;
                ${box(centro.clasificacionEspecifica === 'CPT III')} CPT III &nbsp;
                ${box(centro.clasificacionEspecifica === 'CDI')} CDI &nbsp;
                ${box(centro.clasificacionEspecifica === 'SRI')} SRI
              </div>
              <div>
                <strong>Ambulatoria:</strong> 
                ${box(centro.clasificacionEspecifica === 'Amb. Rural I')} Amb. Rural I &nbsp;
                ${box(centro.clasificacionEspecifica === 'Amb. Rural II')} Amb. Rural II &nbsp;
                ${box(centro.clasificacionEspecifica === 'Amb. Urbano I')} Amb. Urbano I &nbsp;
                ${box(centro.clasificacionEspecifica === 'Amb. Urbano II')} Amb. Urbano II &nbsp;
                ${box(centro.clasificacionEspecifica === 'Amb. Urbano III')} Amb. Urbano III
              </div>
              <div>
                <strong>Hospitalaria:</strong> 
                ${box(centro.clasificacionEspecifica === 'Hospital Tipo I')} Hospital Tipo I &nbsp;
                ${box(centro.clasificacionEspecifica === 'Hospital Tipo II')} Hospital Tipo II &nbsp;
                ${box(centro.clasificacionEspecifica === 'Hospital Tipo III')} Hospital Tipo III &nbsp;
                ${box(centro.clasificacionEspecifica === 'Hospital Tipo IV')} Hospital Tipo IV
              </div>
            </div>
          </td>
        </tr>
      </table>

      <!-- ÁREAS / SERVICIOS EVALUADOS -->
      <table class="ficha-table">
        <tr>
          <td width="24%" class="ficha-label" style="vertical-align: middle; background-color: #f8fafc;">
            Áreas / Servicios<br>Evaluados
          </td>
          <td width="76%">
            <div class="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[7.5pt]">
              <div>${box(hasArea('triaje'))} Triaje / Sala de Espera</div>
              <div>${box(hasArea('quirofanos'))} Quirófanos (N°: <u>${centro.quirofanosTotal || 0}</u> | Op: <u>${centro.quirofanosOperativos || 0}</u>)</div>
              <div>${box(hasArea('consulta_externa'))} Consulta Externa</div>
              <div>${box(hasArea('hospitalizacion'))} Hospitalización (N° Camas: <u>${centro.camasHospitalizacion || 0}</u>)</div>
              <div>${box(hasArea('emergencia_adultos'))} Emergencia Adultos</div>
              <div>${box(hasArea('aislamiento'))} Área de Aislamiento</div>
              <div>${box(hasArea('emergencia_pediatrica'))} Emergencia Pediátrica</div>
              <div>${box(hasArea('inmunizacion'))} Sala de Inmunización (PAI)</div>
              <div>${box(hasArea('sala_partos'))} Sala de Partos</div>
              <div>${box(hasArea('laboratorio'))} Laboratorio Clínico</div>
              <div>${box(hasArea('sala_curas'))} Sala de Cura / Yeso</div>
              <div>${box(hasArea('imagenologia'))} Imagenología (Rayos X / Eco)</div>
              <div>${box(hasArea('banco_sangre'))} Banco de Sangre</div>
              <div>${box(hasArea('farmacia'))} Farmacia Comunitaria</div>
              <div>${box(hasArea('desechos'))} Depósito de Desechos</div>
              <div>${box(hasArea('lavanderia'))} Área de Lavandería</div>
              <div>${box(hasArea('morgue'))} Área de Morgue</div>
              <div>${box(hasArea('ambulancia'))} Puesto de Ambulancia</div>
            </div>
          </td>
        </tr>
      </table>

      <!-- FALLAS DE INFRAESTRUCTURA DETECTADAS -->
      <table class="ficha-table">
        <tr>
          <td width="24%" class="ficha-label" style="vertical-align: middle; background-color: #f8fafc;">
            Fallas de<br>Infraestructura<br>Física Detectadas
          </td>
          <td width="76%">
            <div class="space-y-1 text-[7.2pt]">
              <div>
                <strong class="uppercase">Eléctricas:</strong><br>
                ${box(hasFalla('electricas', 'sin_planta'))} Sin planta eléctrica &nbsp;
                ${box(hasFalla('electricas', 'planta_inoperativa'))} Planta dañada/inop. &nbsp;
                ${box(hasFalla('electricas', 'sin_ats'))} Sin transf. ATS &nbsp;
                ${box(hasFalla('electricas', 'fluctuaciones'))} Fluctuaciones graves &nbsp;
                ${box(hasFalla('electricas', 'iluminacion_deficiente'))} Ilum. deficiente
              </div>
              <div>
                <strong class="uppercase">Hidrosanitarias:</strong><br>
                ${box(hasFalla('hidrosanitarias', 'sin_agua_tuberia'))} Sin agua por tubería &nbsp;
                ${box(hasFalla('hidrosanitarias', 'tanques_danados'))} Tanques dañados &nbsp;
                ${box(hasFalla('hidrosanitarias', 'fuga_tuberias'))} Fuga en tuberías &nbsp;
                ${box(hasFalla('hidrosanitarias', 'colapso_cloacas'))} Colapso cloacas &nbsp;
                ${box(hasFalla('hidrosanitarias', 'banos_inoperativos'))} Baños inoperativos
              </div>
              <div>
                <strong class="uppercase">Estructurales y Arquitectónicas:</strong><br>
                ${box(hasFalla('estructurales', 'filtraciones_techo'))} Filtraciones techos &nbsp;
                ${box(hasFalla('estructurales', 'cielo_raso_caido'))} Cielo raso caído &nbsp;
                ${box(hasFalla('estructurales', 'grietas_paredes'))} Grietas estructurales &nbsp;
                ${box(hasFalla('estructurales', 'puertas_danadas'))} Cerrajería/puertas dañadas &nbsp;
                ${box(hasFalla('estructurales', 'pisos_agrietados'))} Pisos agrietados
              </div>
              <div>
                <strong class="uppercase">Climatización y Cadena de Frío:</strong><br>
                ${box(hasFalla('climatizacion', 'quirofanos_sin_clima'))} Quirófanos sin A/A (Séptico) &nbsp;
                ${box(hasFalla('climatizacion', 'emergencia_sin_clima'))} Emergencia sin A/A &nbsp;
                ${box(hasFalla('climatizacion', 'cavas_vacunas_falla'))} Cavas vacunas fallando &nbsp;
                ${box(hasFalla('climatizacion', 'lab_imagen_sin_clima'))} Lab/Rayos X sin A/A
              </div>
              <div>
                <strong class="uppercase">Bioseguridad y Movilidad:</strong><br>
                ${box(hasFalla('bioseguridad', 'sin_cuarto_biologicos'))} Sin cuarto de biológicos &nbsp;
                ${box(hasFalla('bioseguridad', 'sin_ruta_diferenciada'))} Sin ruta limpia/sucia &nbsp;
                ${box(hasFalla('bioseguridad', 'falta_ambulancia'))} Sin ambulancia operativa &nbsp;
                ${box(hasFalla('bioseguridad', 'sin_rampas_ascensor'))} Sin rampas camilleras
              </div>
            </div>
          </td>
        </tr>
      </table>

      <!-- SOPORTE CRÍTICO Y VITAL -->
      <table class="ficha-table">
        <tr>
          <td width="24%" class="ficha-label" style="vertical-align: middle; background-color: #f8fafc;">
            Soporte Crítico<br>y Vital
          </td>
          <td width="76%">
            <table width="100%" style="border-collapse: collapse; font-size: 7.5pt;">
              <tr>
                <td width="25%" style="border: none; padding: 2px;">
                  <strong>Planta Eléctrica:</strong><br>
                  ${box(centro.soporteVital?.plantaElectrica === 'Operativa')} Operativa<br>
                  ${box(centro.soporteVital?.plantaElectrica === 'Inoperativa')} Inoperativa<br>
                  ${box(centro.soporteVital?.plantaElectrica === 'No tiene')} No tiene
                </td>
                <td width="25%" style="border: none; padding: 2px;">
                  <strong>Suministro Agua:</strong><br>
                  ${box(centro.soporteVital?.suministroAgua === 'Continuo')} Continuo<br>
                  ${box(centro.soporteVital?.suministroAgua === 'Cisterna')} Cisterna<br>
                  ${box(centro.soporteVital?.suministroAgua === 'Inexistente')} Inexistente
                </td>
                <td width="25%" style="border: none; padding: 2px;">
                  <strong>Gases Medicinales:</strong><br>
                  ${box(centro.soporteVital?.gasesMedicinales === 'Red Central')} Red Central<br>
                  ${box(centro.soporteVital?.gasesMedicinales === 'Bombonas')} Bombonas<br>
                  ${box(centro.soporteVital?.gasesMedicinales === 'Inexistente')} Inexistente
                </td>
                <td width="25%" style="border: none; padding: 2px;">
                  <strong>Climatización:</strong><br>
                  ${box(centro.soporteVital?.climatizacion === '100% Operativa')} 100% Oper.<br>
                  ${box(centro.soporteVital?.climatizacion === 'Parcial')} Parcial<br>
                  ${box(centro.soporteVital?.climatizacion === 'Cero Clima')} Cero Clima
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- RED DE REMISIÓN -->
      <table class="ficha-table">
        <tr>
          <td width="24%" class="ficha-label" style="background-color: #f8fafc;">
            Red de Remisión<br>Inmediata
          </td>
          <td width="76%">
            <span class="ficha-label">Centro Hospitalario / Receptor de Referencia:</span><br>
            <span class="ficha-value text-xs">${centro.redRemision || 'Hospital Universitario Dr. Manuel Núñez Tovar (HUMNT)'}</span>
          </td>
        </tr>
      </table>

      <!-- OBSERVACIONES Y NECESIDADES URGENTES -->
      <table class="ficha-table">
        <tr>
          <td width="24%" class="ficha-label" style="background-color: #f8fafc;">
            Observaciones<br>y Necesidades<br>Urgentes
          </td>
          <td width="76%" style="min-height: 48px;">
            <div style="font-size: 7.8pt; line-height: 1.35; color: #1e293b;">
              ${centro.observaciones || 'Sin observaciones adicionales reportadas al momento de la inspección.'}
            </div>
          </td>
        </tr>
      </table>

      <!-- ELABORADO POR -->
      <table class="ficha-table">
        <tr>
          <td width="24%" class="ficha-label" style="vertical-align: middle; background-color: #f8fafc;">
            Elaborado por:
          </td>
          <td width="76%">
            <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-[7.5pt]">
              <div><strong>Nombre:</strong> <u>${centro.elaboradoPor?.nombre || 'Dr. Carlos Mendoza'}</u></div>
              <div><strong>C.I.:</strong> <u>${centro.elaboradoPor?.ci || 'V-14.892.410'}</u></div>
              <div><strong>Cargo / Enlace:</strong> <u>${centro.elaboradoPor?.cargo || 'Director Médico'}</u></div>
              <div><strong>Teléfono:</strong> <u>${centro.elaboradoPor?.telefono || '0414-7654321'}</u></div>
              <div><strong>Fecha:</strong> <u>${centro.elaboradoPor?.fecha || '2026-09-12'}</u></div>
              <div><strong>Firma / Sello:</strong> <u>_________________________</u></div>
            </div>
          </td>
        </tr>
      </table>

    </div>
  `;

  bodyFicha.innerHTML = html;
  modal.classList.remove('hidden');

  setTimeout(() => {
    initMiniMapaFicha(centro);
  }, 100);
}

function initMiniMapaFicha(centro) {
  const container = document.getElementById('mapa-ficha-print');
  if (!container || typeof L === 'undefined') return;

  if (state.mapaFichaImpresion) {
    state.mapaFichaImpresion.remove();
    state.mapaFichaImpresion = null;
  }
  if (container._leaflet_id) {
    container._leaflet_id = null;
  }

  try {
    const lat = centro.lat || 9.7483;
    const lng = centro.lng || -63.1785;

    const map = L.map('mapa-ficha-print', {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false
    }).setView([lat, lng], 15);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19
    }).addTo(map);

    const pin = L.divIcon({
      className: 'custom-print-pin',
      html: '<div style="background:#ef4444; border:2px solid white; border-radius:50%; width:16px; height:16px; box-shadow:0 2px 4px rgba(0,0,0,0.8);"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    L.marker([lat, lng], { icon: pin }).addTo(map);
    state.mapaFichaImpresion = map;
  } catch (err) {
    console.error('Error inicializando mini-mapa en ficha:', err);
  }
}

function cerrarModalFicha() {
  const modal = document.getElementById('printable-sheet-modal');
  if (modal) modal.classList.add('hidden');
}

// ==============================================================
// 7. TABLA DE DIRECTORIO Y FILTROS
// ==============================================================

function obtenerCentrosFiltrados() {
  return state.centros.filter(c => {
    if (state.filtroMunicipio !== 'todos' && c.municipioId !== state.filtroMunicipio) {
      return false;
    }
    if (state.filtroTipoRed !== 'todos' && c.tipoRed !== state.filtroTipoRed) {
      return false;
    }
    if (state.filtroRiesgo !== 'todos' && c.nivelRiesgo !== state.filtroRiesgo) {
      return false;
    }
    if (state.busqueda) {
      const q = state.busqueda.toLowerCase();
      const matchNom = (c.nombre || '').toLowerCase().includes(q);
      const matchParr = (c.parroquia || '').toLowerCase().includes(q);
      const matchSec = (c.sector || '').toLowerCase().includes(q);
      const matchMun = (c.municipio || '').toLowerCase().includes(q);
      const matchTipo = (c.clasificacionEspecifica || '').toLowerCase().includes(q);
      return matchNom || matchParr || matchSec || matchMun || matchTipo;
    }
    return true;
  });
}

function renderDirectorioTabla() {
  const tbody = document.getElementById('tabla-centros-tbody');
  const emptyState = document.getElementById('tabla-centros-empty');
  if (!tbody) return;

  const filtrados = obtenerCentrosFiltrados();

  if (filtrados.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  let html = '';
  filtrados.forEach((c, idx) => {
    const color = c.nivelRiesgo || 'verde';
    const badgeRisk = `
      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
        color === 'rojo' ? 'bg-red-950/80 text-red-300 border border-red-700/60 animate-pulse' :
        color === 'amarillo' ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60' :
        'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
      }">
        <span class="w-1.5 h-1.5 rounded-full ${color === 'rojo' ? 'bg-red-400' : color === 'amarillo' ? 'bg-amber-400' : 'bg-emerald-400'}"></span>
        ${color === 'rojo' ? 'Crítico' : color === 'amarillo' ? 'Alerta' : 'Estable'}
      </span>
    `;

    html += `
      <tr class="border-b border-[#2d1f85]/50 hover:bg-[#1c1459]/50 transition text-xs">
        <td class="py-3 px-3 font-mono text-slate-400">#${idx + 1}</td>
        <td class="py-3 px-3">
          <strong class="text-white block font-bold text-sm leading-snug">${c.nombre}</strong>
          <span class="text-[11px] text-sky-400 font-mono">${c.clasificacionEspecificaLabel || c.clasificacionEspecifica}</span>
        </td>
        <td class="py-3 px-3 text-slate-300">
          <div class="font-medium">${(c.municipio || '').replace('Municipio ', '')}</div>
          <div class="text-[11px] text-slate-400">${c.parroquia} • ${c.sector || 'N/A'}</div>
          <div class="mt-1">
            ${(c.precision === 'exacta' || c.precision === 'calibrada_usuario')
              ? `<span class="inline-flex items-center gap-1 text-[9px] text-emerald-300 font-bold bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-800/60"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Exacta (${c.lat.toFixed(4)}, ${c.lng.toFixed(4)})</span>`
              : `<span class="inline-flex items-center gap-1 text-[9px] text-amber-300 font-bold bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-800/60"><span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span> Sectorial</span>`
            }
          </div>
        </td>
        <td class="py-3 px-3">
          <div class="grid grid-cols-2 gap-1 text-[10px] font-mono">
            <span title="Planta Eléctrica" class="px-1.5 py-0.5 rounded ${c.soporteVital?.plantaElectrica === 'Operativa' ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'}">
              ⚡ ${c.soporteVital?.plantaElectrica || 'N/A'}
            </span>
            <span title="Suministro de Agua" class="px-1.5 py-0.5 rounded ${c.soporteVital?.suministroAgua === 'Continuo' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'}">
              💧 ${c.soporteVital?.suministroAgua || 'N/A'}
            </span>
          </div>
        </td>
        <td class="py-3 px-3 text-center">
          ${badgeRisk}
        </td>
        <td class="py-3 px-3 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button onclick="window.buscarCentroEnGoogleMaps('${c.id}')" class="p-1.5 bg-[#140e40] hover:bg-[#251b68] text-amber-400 hover:text-amber-300 rounded-lg border border-amber-500/40 transition" title="Buscar en Google Maps ↗">
              <i data-lucide="compass" class="w-3.5 h-3.5"></i>
            </button>
            <button onclick="window.verFichaCentro('${c.id}')" class="px-2.5 py-1.5 bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-[#050814] font-bold rounded-lg text-[11px] border border-sky-500/40 transition flex items-center gap-1" title="Ver Ficha Imprimible 1:1">
              <i data-lucide="printer" class="w-3.5 h-3.5"></i>
              <span>Ficha 1:1</span>
            </button>
            <button onclick="window.editarCentro('${c.id}')" class="p-1.5 bg-[#140e40] hover:bg-[#2d1f85] text-slate-300 hover:text-white rounded-lg border border-[#2d1f85] transition" title="Editar y Georreferenciar">
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
            </button>
            <button onclick="window.eliminarCentro('${c.id}')" class="p-1.5 bg-[#140e40] hover:bg-red-950 text-red-400 rounded-lg border border-red-900/50 transition" title="Eliminar">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    lucide.createIcons();
  }
}

function actualizarContadoresKPI() {
  const total = state.centros.length;
  const criticos = state.centros.filter(c => c.nivelRiesgo === 'rojo').length;
  const alertas = state.centros.filter(c => c.nivelRiesgo === 'amarillo').length;
  const estables = state.centros.filter(c => c.nivelRiesgo === 'verde').length;

  const hosp = state.centros.filter(c => c.tipoRed === 'hospitalaria').length;
  const cdi = state.centros.filter(c => c.tipoRed === 'comunal').length;
  const amb = state.centros.filter(c => c.tipoRed === 'ambulatoria').length;

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setTxt('kpi-total-centros', total);
  setTxt('kpi-criticos', criticos);
  setTxt('kpi-alertas', alertas);
  setTxt('kpi-estables', estables);
  setTxt('kpi-hospitales', hosp);
  setTxt('kpi-cdi', cdi);
  setTxt('kpi-ambulatorios', amb);
}

// ==============================================================
// 8. EXPORTACIÓN DE DATOS (JSON Y CSV)
// ==============================================================

function exportarJSON() {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state.centros, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute('href', dataStr);
  dlAnchor.setAttribute('download', `MIGATO_PreDiagnostico_Salud_Monagas_${new Date().toISOString().split('T')[0]}.json`);
  dlAnchor.click();
}

function exportarCSV() {
  if (state.centros.length === 0) {
    alert('No hay registros de centros de salud para exportar.');
    return;
  }

  const headers = [
    'ID', 'Nombre', 'Estado', 'Municipio', 'Parroquia', 'Sector', 'Latitud', 'Longitud',
    'Tipo_Red', 'Clasificacion_MPPS', 'Quirofanos_Total', 'Quirofanos_Op', 'Camas_Hospitalizacion',
    'Planta_Electrica', 'Suministro_Agua', 'Gases_Medicinales', 'Climatizacion',
    'Nivel_Riesgo', 'Red_Remision', 'Evaluador_Nombre', 'Evaluador_CI', 'Fecha'
  ];

  const rows = state.centros.map(c => [
    `"${c.id}"`,
    `"${c.nombre.replace(/"/g, '""')}"`,
    `"${c.estado}"`,
    `"${c.municipio}"`,
    `"${c.parroquia}"`,
    `"${(c.sector || '').replace(/"/g, '""')}"`,
    c.lat,
    c.lng,
    `"${c.tipoRed}"`,
    `"${c.clasificacionEspecifica}"`,
    c.quirofanosTotal || 0,
    c.quirofanosOperativos || 0,
    c.camasHospitalizacion || 0,
    `"${c.soporteVital?.plantaElectrica || ''}"`,
    `"${c.soporteVital?.suministroAgua || ''}"`,
    `"${c.soporteVital?.gasesMedicinales || ''}"`,
    `"${c.soporteVital?.climatizacion || ''}"`,
    `"${c.nivelRiesgo || ''}"`,
    `"${(c.redRemision || '').replace(/"/g, '""')}"`,
    `"${(c.elaboradoPor?.nombre || '').replace(/"/g, '""')}"`,
    `"${(c.elaboradoPor?.ci || '').replace(/"/g, '""')}"`,
    `"${c.elaboradoPor?.fecha || ''}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,﻿' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute('href', encodeURI(csvContent));
  dlAnchor.setAttribute('download', `MIGATO_Salud_Monagas_${new Date().toISOString().split('T')[0]}.csv`);
  dlAnchor.click();
}

// ==============================================================
// 9. GESTIÓN DE PESTAÑAS Y NAVEGACIÓN
// ==============================================================

function cambiarPestana(targetId) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    if (btn.dataset.target === targetId) {
      btn.classList.add('active', 'bg-sky-500', 'text-[#050814]');
      btn.classList.remove('text-slate-300', 'bg-transparent');
    } else {
      btn.classList.remove('active', 'bg-sky-500', 'text-[#050814]');
      btn.classList.add('text-slate-300');
    }
  });

  document.querySelectorAll('.tab-panel').forEach(panel => {
    if (panel.id === targetId) {
      panel.classList.remove('hidden');
    } else {
      panel.classList.add('hidden');
    }
  });

  if (targetId === 'tab-registro') {
    setTimeout(() => {
      if (state.mapaFormulario) state.mapaFormulario.invalidateSize();
    }, 150);
  } else if (targetId === 'tab-mapa') {
    setTimeout(() => {
      if (state.mapaGeneral) state.mapaGeneral.invalidateSize();
    }, 150);
  }
}

// ==============================================================
// 10. EXPOSICIÓN GLOBAL Y CONTROLADORES
// ==============================================================

window.verFichaCentro = (id) => {
  const centro = state.centros.find(c => c.id === id);
  if (centro) renderFichaImprimible(centro);
};

window.editarCentro = editarCentro;
window.eliminarCentro = eliminarCentro;
window.imprimirFichaActual = () => {
  window.print();
};
window.cerrarModalFicha = cerrarModalFicha;
window.cambiarPestana = cambiarPestana;

function configurarEventListeners() {
  const selMun = document.getElementById('form-municipio');
  if (selMun) {
    selMun.addEventListener('change', (e) => alCambiarMunicipio(e.target.value));
  }

  const selParr = document.getElementById('form-parroquia');
  if (selParr) {
    selParr.addEventListener('change', (e) => alCambiarParroquia(e.target.value));
  }

  const selSec = document.getElementById('form-sector');
  const secCustomCont = document.getElementById('custom-sector-container');
  if (selSec && secCustomCont) {
    selSec.addEventListener('change', (e) => {
      if (e.target.value === 'otro') {
        secCustomCont.classList.remove('hidden');
      } else {
        secCustomCont.classList.add('hidden');
      }
    });
  }

  document.querySelectorAll('input[name^="soporte_"]').forEach(radio => {
    radio.addEventListener('change', evaluarSemaforoEnVivo);
  });

  const fechaInput = document.getElementById('form-eval-fecha');
  if (fechaInput && !fechaInput.value) {
    fechaInput.value = new Date().toISOString().split('T')[0];
  }

  const form = document.getElementById('form-pre-diagnostico');
  if (form) {
    form.addEventListener('submit', guardarPreDiagnostico);
  }

  const btnLimpiar = document.getElementById('btn-limpiar-form');
  if (btnLimpiar) {
    btnLimpiar.addEventListener('click', limpiarFormulario);
  }

  const btnPrevisualizar = document.getElementById('btn-previsualizar-ficha');
  if (btnPrevisualizar) {
    btnPrevisualizar.addEventListener('click', () => {
      const centroTemp = recopilarDatosFormulario();
      renderFichaImprimible(centroTemp);
    });
  }

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => cambiarPestana(btn.dataset.target));
  });

  const filtroMun = document.getElementById('filtro-municipio');
  if (filtroMun) {
    filtroMun.addEventListener('change', (e) => {
      state.filtroMunicipio = e.target.value;
      renderDirectorioTabla();
      actualizarMapaGeneral();
    });
  }

  const filtroTipo = document.getElementById('filtro-tipo-red');
  if (filtroTipo) {
    filtroTipo.addEventListener('change', (e) => {
      state.filtroTipoRed = e.target.value;
      renderDirectorioTabla();
      actualizarMapaGeneral();
    });
  }

  const filtroRiesgo = document.getElementById('filtro-riesgo');
  if (filtroRiesgo) {
    filtroRiesgo.addEventListener('change', (e) => {
      state.filtroRiesgo = e.target.value;
      renderDirectorioTabla();
      actualizarMapaGeneral();
    });
  }

  const inputBusqueda = document.getElementById('input-busqueda-centros');
  if (inputBusqueda) {
    inputBusqueda.addEventListener('input', (e) => {
      state.busqueda = e.target.value.trim();
      renderDirectorioTabla();
      actualizarMapaGeneral();
    });
  }

  const btnExpJson = document.getElementById('btn-export-json');
  if (btnExpJson) btnExpJson.addEventListener('click', exportarJSON);

  const btnExpCsv = document.getElementById('btn-export-csv');
  if (btnExpCsv) btnExpCsv.addEventListener('click', exportarCSV);

  const btnGps = document.getElementById('btn-gps-ubicacion');
  if (btnGps) {
    btnGps.addEventListener('click', () => {
      if (!navigator.geolocation) {
        alert('Geolocalización no compatible con este dispositivo.');
        return;
      }
      btnGps.classList.add('animate-spin');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          btnGps.classList.remove('animate-spin');
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          if (state.mapaFormulario && state.marcadorFormulario) {
            state.mapaFormulario.flyTo([lat, lng], 16);
            state.marcadorFormulario.setLatLng([lat, lng]);
            actualizarCoordenadasInputs(lat, lng);
          }
        },
        (err) => {
          btnGps.classList.remove('animate-spin');
          alert('No se pudo obtener la posición GPS: ' + err.message);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  // 10.1 Integración y Parser de Google Maps
  const btnAplicarGmaps = document.getElementById('btn-aplicar-gmaps');
  const inputGmaps = document.getElementById('input-google-maps');
  
  const aplicarCoordenadasDesdeInput = () => {
    if (!inputGmaps) return;
    const valor = inputGmaps.value.trim();
    if (!valor) return;

    const coords = procesarEnlaceOGoogleMaps(valor);
    if (coords) {
      if (state.mapaFormulario && state.marcadorFormulario) {
        state.mapaFormulario.flyTo([coords.lat, coords.lng], 17);
        state.marcadorFormulario.setLatLng([coords.lat, coords.lng]);
        actualizarCoordenadasInputs(coords.lat, coords.lng, true);
        actualizarBadgePrecisionFormulario('calibrada_usuario');
      }
      inputGmaps.value = '';
    } else {
      alert('No se pudieron extraer coordenadas válidas.\\nFormato admitido:\\n- Enlace de Google Maps con @lat,lng\\n- Coordenadas separadas por coma (ej: 9.71751, -63.20721)');
    }
  };

  if (btnAplicarGmaps) {
    btnAplicarGmaps.addEventListener('click', aplicarCoordenadasDesdeInput);
  }
  if (inputGmaps) {
    inputGmaps.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        aplicarCoordenadasDesdeInput();
      }
    });
  }

  const btnBuscarGmaps = document.getElementById('btn-buscar-gmaps');
  if (btnBuscarGmaps) {
    btnBuscarGmaps.addEventListener('click', () => {
      const nombre = document.getElementById('form-nombre-centro')?.value || '';
      const sector = document.getElementById('form-sector')?.value || '';
      const selMun = document.getElementById('form-municipio');
      const munNombre = selMun ? selMun.options[selMun.selectedIndex]?.text || '' : '';
      const query = `${nombre} ${sector} ${munNombre} Monagas Venezuela`.replace(/\\s+/g, ' ').trim();
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, '_blank');
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarModalFicha();
  });
}

// ==============================================================
// 11. INICIO INFALIBLE DE LA APLICACIÓN
// ==============================================================

let intentosCarga = 0;

function iniciarAplicacion() {
  try {
    console.log("🚀 Iniciando Módulo 5 Salud Monagas...");
    
    // Verificar que los datos territoriales estén listos
    if (!window.CATALOGO_TERRITORIAL || window.CATALOGO_TERRITORIAL.length === 0) {
      if (intentosCarga < 10) {
        intentosCarga++;
        console.warn("⏳ Esperando catálogo territorial (intento " + intentosCarga + "/10)...");
        setTimeout(iniciarAplicacion, 150);
        return;
      }
    }

    inicializarDatos();
    poblarMunicipios();
    renderTiposEstablecimiento();
    renderAreasServiciosChecks();
    renderFallasChecks();
    actualizarContadoresKPI();
    renderDirectorioTabla();

    if (typeof L !== 'undefined') {
      initMapaFormulario();
      initMapaGeneral();
    } else {
      console.warn("⚠️ Leaflet aún no está disponible, reintentando en 300ms...");
      setTimeout(() => {
        if (typeof L !== 'undefined') {
          initMapaFormulario();
          initMapaGeneral();
        }
      }, 300);
    }

    configurarEventListeners();

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
    console.log("✅ Módulo 5 Salud Monagas iniciado con éxito.");
  } catch (err) {
    console.error("❌ Error al iniciar Módulo 5 Salud Monagas:", err);
  }
}

// Exponer funciones globales para eventos HTML (onclick, etc.)
window.verFichaCentro = (id) => {
  const centro = state.centros.find(c => c.id === id);
  if (centro) renderFichaImprimible(centro);
};
window.editarCentro = editarCentro;
window.calibrarEnMapa = calibrarEnMapa;
window.buscarCentroEnGoogleMaps = (id) => {
  const c = state.centros.find(item => item.id === id);
  if (!c) return;
  const query = `${c.nombre} ${c.sector || ''} ${c.municipio || ''} Monagas Venezuela`.replace(/\\s+/g, ' ').trim();
  window.open(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, '_blank');
};
window.eliminarCentro = eliminarCentro;
window.imprimirFichaActual = () => {
  window.print();
};
window.cerrarModalFicha = cerrarModalFicha;
window.cambiarPestana = cambiarPestana;
window.iniciarAplicacion = iniciarAplicacion;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciarAplicacion);
} else {
  iniciarAplicacion();
}

})(typeof window !== 'undefined' ? window : this);
