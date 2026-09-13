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
const STORAGE_KEY = 'migato_salud_centros_v10';

// Delimitación amplia de navegación (permite recorrer cómodamente todo Monagas y sus extremos limítrofes)
const BOUNDS_MONAGAS_COORDS = [
  [7.50, -64.80], // Suroeste (Frontera Orinoco / Bolívar / Anzoátegui con amplio margen)
  [11.10, -61.00] // Noreste (Frontera Sucre / Golfo de Paria / Delta Amacuro con amplio margen)
];

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
  mapaFichaImpresion: null,
  // Herramientas de Calibración Rápida y Navegación del Mapa Táctico
  centroCalibrando: null,
  coordsTempCalibracion: null,
  modoArrastreActivo: false,
  marcadorCalibracion: null,
  filtroEstadoMapa: 'todos', // 'todos' | 'calibrar' | 'exactos'
  busquedaMapa: '',
  centrosListaMapa: [],
  // Capas Oficiales de Google Maps
  googleRoadmapLayer: null,
  googleHybridLayer: null,
  googleTerrainLayer: null,
  capaActualMapa: 'calles',
  // Delimitación Cartográfica Oficial Monagas (Velo exterior + Límites INE)
  mascaraExteriorMonagas: null,
  limiteOficialMonagas: null,
  layerMunicipiosMonagas: null,
  mascaraActiva: true,
  // Inspector Interactivo Google Maps (Punto seleccionado en tiempo real)
  marcadorInspectorGmaps: null,
  coordsInspectorGmaps: { lat: 9.7483, lng: -63.1785 },
  // Estilo de mapa de la Ficha Imprimible ('plano' | 'relieve' | 'satelite')
  estiloMapaFicha: 'plano'
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
          if (base && base.precision === 'exacta') {
            // Auto-sanar Hospital Serres si fue desplazado al centroide parroquial (9.756, -63.146)
            if (p.id === 'hosp-serres-las-cocuizas' && Math.abs(p.lat - 9.756) < 0.002 && Math.abs(p.lng - (-63.146)) < 0.002) {
              return {
                ...p,
                lat: base.lat,
                lng: base.lng,
                precision: 'exacta',
                sector: base.sector || p.sector
              };
            }
            if (p.precision !== 'calibrada_usuario') {
              return {
                ...p,
                lat: base.lat,
                lng: base.lng,
                precision: 'exacta',
                sector: base.sector || p.sector
              };
            }
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
  poblarSelectorMapaCentros();
}
const guardarCentrosEnStorage = guardarEnStorage;

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
  const boundsMonagas = L.latLngBounds(BOUNDS_MONAGAS_COORDS);

  try {
    state.mapaFormulario = L.map('mapa-formulario', {
      zoomControl: true,
      attributionControl: false,
      maxBounds: boundsMonagas,
      maxBoundsViscosity: 0.1,
      minZoom: 7.5,
      maxZoom: 20
    }).setView(coordsIniciales, 13);

    // Google Maps Calles (con POIs locales de Monagas en español)
    const googleRoadmap = L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&hl=es&gl=VE&x={x}&y={y}&z={z}', {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 20,
      attribution: 'Google Maps'
    }).addTo(state.mapaFormulario);

    // Google Maps Satélite Híbrido (Imágenes satelitales + etiquetas viales)
    const googleHybrid = L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&hl=es&gl=VE&x={x}&y={y}&z={z}', {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 20,
      attribution: 'Google Maps'
    });

    L.control.layers({
      '🗺️ Google Calles': googleRoadmap,
      '🛰️ Google Satélite': googleHybrid
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
      <div class="flex items-center gap-1.5 text-emerald-800 font-bold text-[10px]">
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span>📍 Coordenada Exacta Verificada (${tipo === 'calibrada_usuario' ? 'Calibrada por Usuario' : 'Cartografía Satelital'})</span>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="flex items-center gap-1.5 text-amber-800 font-bold text-[10px]">
        <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
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

  const boundsMonagas = L.latLngBounds(BOUNDS_MONAGAS_COORDS);

  try {
    state.mapaGeneral = L.map('mapa-general', {
      zoomControl: true,
      attributionControl: false,
      maxBounds: boundsMonagas,
      maxBoundsViscosity: 0.1,
      minZoom: 7.5,
      maxZoom: 20
    }).setView([9.45, -63.05], 8.5);

    // 1. Google Maps Calles (Roadmap con POIs, hospitales, vías y comercios de Monagas en español)
    state.googleRoadmapLayer = L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&hl=es&gl=VE&x={x}&y={y}&z={z}', {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 20,
      attribution: 'Google Maps'
    });

    // 2. Google Maps Satélite Híbrido (Ortofoto satelital de alta resolución + calles y sitios)
    state.googleHybridLayer = L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&hl=es&gl=VE&x={x}&y={y}&z={z}', {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 20,
      attribution: 'Google Maps'
    });

    // 3. Google Maps Terreno (Relieve topográfico y elevación de Monagas)
    state.googleTerrainLayer = L.tileLayer('https://mt{s}.google.com/vt/lyrs=p&hl=es&gl=VE&x={x}&y={y}&z={z}', {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 20,
      attribution: 'Google Maps'
    });

    // Activar Google Calles por defecto
    state.googleRoadmapLayer.addTo(state.mapaGeneral);
    state.capaActualMapa = 'calles';

    // Aplicar Delimitación Territorial Oficial de Monagas (Velo exterior + Límites INE)
    aplicarDelimitacionMonagas();

    state.marcadoresGeneralLayer = L.layerGroup().addTo(state.mapaGeneral);
    actualizarMapaGeneral();
    poblarSelectorMapaCentros();

    // Inicializar Inspector de Clic Interactivo Google Maps
    initClickInteractivoGoogleMaps();
    initBusquedaFlotanteGoogleMaps();
  } catch (err) {
    console.error('Error inicializando mapa general:', err);
  }
}

// Delimitación Oficial del Estado Monagas (Velo Exterior e Invertido)
function aplicarDelimitacionMonagas() {
  if (!state.mapaGeneral || typeof L === 'undefined') return;

  const ring = window.GEO_ESTADO_MONAGAS_RING;
  if (!ring || ring.length === 0) {
    console.warn('Delimitación oficial de Monagas no encontrada en window.GEO_ESTADO_MONAGAS_RING');
    return;
  }

  // Convertir [lng, lat] GeoJSON a [lat, lng] Leaflet
  const ringLatLng = ring.map(pt => [pt[1], pt[0]]);

  // Caja envolvente mundial que cubre el resto del planeta
  const worldBox = [
    [-90, -180],
    [-90, 180],
    [90, 180],
    [90, -180]
  ];

  try {
    // 1. Máscara exterior invertida (Cubre todo fuera de Monagas con tono noche oscuro)
    if (state.mascaraExteriorMonagas) {
      state.mapaGeneral.removeLayer(state.mascaraExteriorMonagas);
    }

    state.mascaraExteriorMonagas = L.polygon([worldBox, ringLatLng], {
      fillColor: '#0a0620',
      fillOpacity: state.mascaraActiva ? 0.88 : 0.0,
      color: '#38bdf8',
      weight: 1.5,
      opacity: state.mascaraActiva ? 0.8 : 0.0,
      fillRule: 'evenodd',
      interactive: false
    }).addTo(state.mapaGeneral);

    // 2. Trazo del Límite Territorial Oficial de Monagas
    if (state.limiteOficialMonagas) {
      state.mapaGeneral.removeLayer(state.limiteOficialMonagas);
    }

    state.limiteOficialMonagas = L.polyline(ringLatLng, {
      color: '#38bdf8',
      weight: 3.5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
      interactive: false
    }).addTo(state.mapaGeneral);

    // 3. Límites Municipales Oficiales (13 Municipios)
    if (window.GEO_MUNICIPIOS_MONAGAS && !state.layerMunicipiosMonagas) {
      state.layerMunicipiosMonagas = L.geoJSON(window.GEO_MUNICIPIOS_MONAGAS, {
        style: {
          color: '#818cf8',
          weight: 1.2,
          opacity: 0.6,
          dashArray: '4, 4',
          fill: false
        },
        interactive: false
      }).addTo(state.mapaGeneral);
    }
  } catch (err) {
    console.error('Error al aplicar delimitación cartográfica de Monagas:', err);
  }
}

function toggleMascaraMonagas() {
  state.mascaraActiva = !state.mascaraActiva;
  const btn = document.getElementById('btn-toggle-mascara');
  if (state.mascaraExteriorMonagas) {
    state.mascaraExteriorMonagas.setStyle({
      fillOpacity: state.mascaraActiva ? 0.88 : 0.0,
      opacity: state.mascaraActiva ? 0.8 : 0.0
    });
  }
  if (btn) {
    if (state.mascaraActiva) {
      btn.className = 'px-2.5 py-1 rounded-lg bg-sky-950 text-sky-300 border border-sky-600/50 font-bold text-[11px] transition flex items-center gap-1 shadow';
      btn.innerHTML = '<span>🛡️ Velo Monagas</span>';
    } else {
      btn.className = 'px-2.5 py-1 rounded-lg bg-[#120c36] text-slate-400 border border-slate-700 font-bold text-[11px] transition flex items-center gap-1';
      btn.innerHTML = '<span>👁️ Sin Velo</span>';
    }
  }
}

// Inspector Interactivo Google Maps (Clic libre en cualquier parte del mapa)
function initClickInteractivoGoogleMaps() {
  if (!state.mapaGeneral) return;

  state.mapaGeneral.on('click', function(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    // Si estamos en modo calibrador clásico de un centro específico
    if (state.modoArrastreActivo && state.marcadorCalibracion) {
      state.coordsTempCalibracion = { lat, lng };
      state.marcadorCalibracion.setLatLng(e.latlng);
      actualizarDisplayCoordsCalibrador(lat, lng);
    }

    // SIEMPRE actualizar el Inspector Interactivo Google Maps en cualquier clic
    actualizarPuntoInspectorGmaps(lat, lng, false);
  });
}

function actualizarPuntoInspectorGmaps(lat, lng, recentrar = false) {
  state.coordsInspectorGmaps = { lat, lng };

  const inLat = document.getElementById('gmaps-input-lat');
  const inLng = document.getElementById('gmaps-input-lng');
  const dispEstado = document.getElementById('gmaps-estado-click');

  if (inLat) inLat.value = lat.toFixed(6);
  if (inLng) inLng.value = lng.toFixed(6);

  if (dispEstado) {
    dispEstado.innerHTML = `<span class="text-emerald-400 font-bold">📍 Coordenada Capturada:</span> <span class="font-mono text-white font-bold">${lat.toFixed(6)}, ${lng.toFixed(6)}</span>`;
  }

  // Crear o mover el marcador interactivo estilo cruz/pin Google Maps
  if (!state.marcadorInspectorGmaps) {
    const pinHtml = `
      <div style="position:relative; width:34px; height:34px; display:flex; align-items:center; justify-content:center; cursor:grab;">
        <div style="position:absolute; width:32px; height:32px; border:2px dashed #38bdf8; border-radius:50%; animation:spin 6s linear infinite;"></div>
        <div style="width:12px; height:12px; background:#ef4444; border:2px solid white; border-radius:50%; box-shadow:0 0 10px rgba(239,68,68,1);"></div>
      </div>
    `;

    const iconCruz = L.divIcon({
      className: 'gmaps-target-pin',
      html: pinHtml,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    state.marcadorInspectorGmaps = L.marker([lat, lng], {
      draggable: true,
      icon: iconCruz,
      zIndexOffset: 1200
    }).addTo(state.mapaGeneral);

    state.marcadorInspectorGmaps.on('drag', function(evt) {
      const pos = evt.target.getLatLng();
      if (inLat) inLat.value = pos.lat.toFixed(6);
      if (inLng) inLng.value = pos.lng.toFixed(6);
      if (dispEstado) {
        dispEstado.innerHTML = `<span class="text-sky-400 font-bold">🎯 Arrastrando sobre el techo:</span> <span class="font-mono text-white">${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}</span>`;
      }
    });

    state.marcadorInspectorGmaps.on('dragend', function(evt) {
      const pos = evt.target.getLatLng();
      actualizarPuntoInspectorGmaps(pos.lat, pos.lng, false);
    });
  } else {
    state.marcadorInspectorGmaps.setLatLng([lat, lng]);
  }

  // Mostrar y actualizar la tarjeta flotante directamente dentro del mapa
  const card = document.getElementById('gmaps-floating-pin-card');
  const cardCoords = document.getElementById('card-pin-coords');
  if (card) card.classList.remove('hidden');
  if (cardCoords) cardCoords.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

  if (recentrar && state.mapaGeneral) {
    state.mapaGeneral.panTo([lat, lng]);
  }
}

function actualizarPuntoDesdeInputs() {
  const inLat = document.getElementById('gmaps-input-lat');
  const inLng = document.getElementById('gmaps-input-lng');
  if (!inLat || !inLng) return;

  const lat = parseFloat(inLat.value);
  const lng = parseFloat(inLng.value);

  if (!isNaN(lat) && !isNaN(lng)) {
    actualizarPuntoInspectorGmaps(lat, lng, true);
  }
}

function copiarCoordenadasInspector() {
  const inLat = document.getElementById('gmaps-input-lat');
  const inLng = document.getElementById('gmaps-input-lng');
  const btnTxt = document.getElementById('btn-copiar-texto');
  if (!inLat || !inLng) return;

  const texto = `${inLat.value}, ${inLng.value}`;
  navigator.clipboard.writeText(texto).then(() => {
    if (btnTxt) {
      const orig = btnTxt.textContent;
      btnTxt.textContent = '¡Copiado! ✓';
      setTimeout(() => { btnTxt.textContent = orig; }, 1800);
    }
  }).catch(() => {
    alert(`Coordenadas: ${texto}`);
  });
}

function abrirPuntoEnGoogleMapsOficial() {
  const inLat = document.getElementById('gmaps-input-lat');
  const inLng = document.getElementById('gmaps-input-lng');
  const lat = inLat ? inLat.value : state.coordsInspectorGmaps.lat;
  const lng = inLng ? inLng.value : state.coordsInspectorGmaps.lng;
  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  window.open(url, '_blank');
}

function crearCentroDesdePunto() {
  const inLat = document.getElementById('gmaps-input-lat');
  const inLng = document.getElementById('gmaps-input-lng');
  const lat = inLat ? parseFloat(inLat.value) : state.coordsInspectorGmaps.lat;
  const lng = inLng ? parseFloat(inLng.value) : state.coordsInspectorGmaps.lng;

  // Cambiar a pestaña de Formulario (tab-registro)
  cambiarPestana('tab-registro');
  initMapaFormulario();

  actualizarCoordenadasInputs(lat, lng, true);
  if (state.mapaFormulario) {
    state.mapaFormulario.setView([lat, lng], 16);
    if (state.marcadorFormulario) {
      state.marcadorFormulario.setLatLng([lat, lng]);
    }
  }

  // Desplazar suavemente a la cabecera
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function aplicarCoordenadaACentroSeleccionado() {
  const sel = document.getElementById('select-asignar-centro');
  const inLat = document.getElementById('gmaps-input-lat');
  const inLng = document.getElementById('gmaps-input-lng');
  if (!sel || !sel.value) {
    alert('Por favor selecciona en el menú desplegable a cuál de los centros de salud deseas asignar esta coordenada.');
    return;
  }

  const centroId = sel.value;
  const lat = parseFloat(inLat.value);
  const lng = parseFloat(inLng.value);

  if (isNaN(lat) || isNaN(lng)) {
    alert('Coordenadas inválidas en las casillas.');
    return;
  }

  const idx = state.centros.findIndex(c => c.id === centroId);
  if (idx === -1) return;

  state.centros[idx].lat = lat;
  state.centros[idx].lng = lng;
  state.centros[idx].precision = 'calibrada_usuario';

  guardarCentrosEnStorage();
  actualizarMapaGeneral();
  actualizarContadoresKPI();
  poblarSelectorMapaCentros();

  alert(`✅ ¡Ubicación guardada con éxito!\n\nCentro: ${state.centros[idx].nombre}\nCoordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}\nEstado: Calibrada por Usuario.`);
}

// Búsqueda Flotante Estilo Google Maps con Autocomplete en Vivo
function initBusquedaFlotanteGoogleMaps() {
  const inputSearch = document.getElementById('input-search-gmaps-overlay');
  const resultsBox = document.getElementById('gmaps-search-results');
  const btnClear = document.getElementById('btn-clear-search-gmaps');
  if (!inputSearch || !resultsBox) return;

  inputSearch.addEventListener('input', function(e) {
    const q = (e.target.value || '').trim().toLowerCase();
    if (btnClear) {
      if (q.length > 0) btnClear.classList.remove('hidden');
      else btnClear.classList.add('hidden');
    }

    if (q.length === 0) {
      resultsBox.classList.add('hidden');
      resultsBox.innerHTML = '';
      return;
    }

    // Buscar en los 84 centros de salud
    const matches = state.centros.filter(c => {
      const nom = (c.nombre || '').toLowerCase();
      const mun = (c.municipio || '').toLowerCase();
      const parr = (c.parroquia || '').toLowerCase();
      const sec = (c.sector || '').toLowerCase();
      return nom.includes(q) || mun.includes(q) || parr.includes(q) || sec.includes(q);
    });

    if (matches.length === 0) {
      resultsBox.innerHTML = `
        <div class="p-3 text-xs text-slate-400 text-center">
          No se encontró "${e.target.value}" en la base local.<br>
          <button type="button" onclick="window.buscarExternoGmapsQuery()" class="mt-2 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-[11px] transition">
            🔍 Buscar en Google Maps Oficial ↗
          </button>
        </div>
      `;
      resultsBox.classList.remove('hidden');
      return;
    }

    let html = '';
    matches.slice(0, 8).forEach(c => {
      const icono = (c.precision === 'exacta' || c.precision === 'calibrada_usuario') ? '🟢' : '⚠️';
      html += `
        <div onclick="window.seleccionarCentroDesdeBusquedaFlotante('${c.id}')" 
             class="p-2.5 hover:bg-blue-50 cursor-pointer flex items-center justify-between gap-2 text-xs text-slate-800 transition border-b border-slate-100 last:border-0">
           <div class="min-w-0">
             <div class="font-bold text-slate-900 truncate flex items-center gap-1.5">
               <span>${icono}</span>
               <span class="truncate">${c.nombre}</span>
             </div>
             <div class="text-[10px] text-blue-700 font-medium truncate">
               ${c.municipio} • ${c.parroquia} ${c.sector ? '• ' + c.sector : ''}
             </div>
           </div>
           <span class="text-[10px] text-slate-500 font-mono shrink-0">${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}</span>
         </div>
       `;
     });

    resultsBox.innerHTML = html;
    resultsBox.classList.remove('hidden');
  });

  inputSearch.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      const q = (inputSearch.value || '').trim().toLowerCase();
      const firstMatch = state.centros.find(c => {
        const nom = (c.nombre || '').toLowerCase();
        return nom.includes(q);
      });
      if (firstMatch) {
        seleccionarCentroDesdeBusquedaFlotante(firstMatch.id);
      } else {
        buscarExternoGmapsQuery();
      }
    }
  });

  // Cerrar al hacer clic fuera
  document.addEventListener('click', function(e) {
    if (!e.target.closest('#gmaps-floating-search')) {
      resultsBox.classList.add('hidden');
    }
  });
}

function seleccionarCentroDesdeBusquedaFlotante(id) {
  const c = state.centros.find(item => item.id === id);
  if (!c) return;

  const inputSearch = document.getElementById('input-search-gmaps-overlay');
  const resultsBox = document.getElementById('gmaps-search-results');
  if (inputSearch) inputSearch.value = c.nombre;
  if (resultsBox) resultsBox.classList.add('hidden');

  enfocarEnMapa(c.id);
}

function limpiarBusquedaFlotante() {
  const inputSearch = document.getElementById('input-search-gmaps-overlay');
  const resultsBox = document.getElementById('gmaps-search-results');
  const btnClear = document.getElementById('btn-clear-search-gmaps');
  if (inputSearch) inputSearch.value = '';
  if (resultsBox) resultsBox.classList.add('hidden');
  if (btnClear) btnClear.classList.add('hidden');
}

function buscarExternoGmapsQuery() {
  const inputSearch = document.getElementById('input-search-gmaps-overlay');
  const q = inputSearch ? inputSearch.value.trim() : '';
  const query = (q ? q : 'Hospitales') + ' Estado Monagas Venezuela';
  window.open(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, '_blank');
}

function cerrarTarjetaPinFlotante() {
  const card = document.getElementById('gmaps-floating-pin-card');
  if (card) card.classList.add('hidden');
}

function guardarPuntoDesdeTarjetaFlotante() {
  const sel = document.getElementById('select-card-asignar-centro');
  if (!sel || !sel.value) {
    alert('Por favor selecciona el centro de salud en el desplegable de la tarjeta.');
    return;
  }
  const centroId = sel.value;
  const lat = state.coordsInspectorGmaps.lat;
  const lng = state.coordsInspectorGmaps.lng;

  const idx = state.centros.findIndex(c => c.id === centroId);
  if (idx === -1) return;

  state.centros[idx].lat = parseFloat(lat.toFixed(6));
  state.centros[idx].lng = parseFloat(lng.toFixed(6));
  state.centros[idx].precision = 'calibrada_usuario';

  guardarCentrosEnStorage();
  actualizarMapaGeneral();
  actualizarContadoresKPI();
  poblarSelectorMapaCentros();

  alert(`✅ ¡Ubicación guardada con éxito!\n\n${state.centros[idx].nombre}\nCoordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}\nSemáforo actualizado a Calibrado.`);
  cerrarTarjetaPinFlotante();
}

function copiarCoordsDesdeTarjetaFlotante() {
  const lat = state.coordsInspectorGmaps.lat.toFixed(6);
  const lng = state.coordsInspectorGmaps.lng.toFixed(6);
  const txt = `${lat}, ${lng}`;
  navigator.clipboard.writeText(txt).then(() => {
    alert(`Copiado al portapapeles: ${txt}`);
  }).catch(() => {
    alert(`Coordenadas: ${txt}`);
  });
}

function recentrarMapaMonagas() {
  if (!state.mapaGeneral) return;
  const boundsMonagasOficial = L.latLngBounds([[8.35, -64.10], [10.35, -61.95]]);
  state.mapaGeneral.fitBounds(boundsMonagasOficial, {
    padding: [20, 20],
    animate: true,
    duration: 0.8
  });
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
      <div class="p-3.5 min-w-[260px] text-xs font-sans text-slate-800 bg-white">
        <div class="flex items-center justify-between gap-2 border-b border-slate-200 pb-1.5 mb-2">
          <span class="font-mono text-[9px] uppercase px-2 py-0.5 rounded font-bold ${
            color === 'rojo' ? 'bg-red-50 text-red-700 border border-red-200' :
            color === 'amarillo' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
            'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }">
            ${color === 'rojo' ? '⚠️ RIESGO CRÍTICO' : color === 'amarillo' ? '🟡 ALERTA' : '🟢 OPERATIVO'}
          </span>
          <span class="text-[10px] text-slate-500 font-mono font-bold">${(c.municipio || '').replace('Municipio ', '')}</span>
        </div>
        <h4 class="font-bold text-sm text-slate-900 mb-1 leading-snug">${c.nombre}</h4>
        <p class="text-blue-700 font-semibold text-[11px] mb-2">${c.clasificacionEspecificaLabel || c.clasificacionEspecifica} • ${c.parroquia}</p>
        
        <div class="mb-2">
          ${(c.precision === 'exacta' || c.precision === 'calibrada_usuario')
            ? `<div class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-800 font-bold">
                 <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                 <span>📍 Coordenada Exacta (${c.precision === 'calibrada_usuario' ? 'Ajustada en Campo' : 'Cartografía OSM / Satélite'})</span>
               </div>`
            : `<div class="p-1.5 rounded bg-amber-50 border border-amber-200 text-[10px] text-amber-900">
                 <div class="flex items-center gap-1 font-bold">
                   <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                   <span>📍 Ubicación Sectorial (Aproximada)</span>
                 </div>
                 <p class="text-[9px] text-amber-800 mt-0.5 leading-tight">Sin cartografía pública de edificio. Pulsa "Mover" o usa GPS para fijar el techo exacto.</p>
               </div>`
          }
        </div>

        <div class="grid grid-cols-2 gap-1.5 text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-200 mb-3 text-slate-700">
          <div>⚡ Planta: <strong class="text-slate-900">${c.soporteVital?.plantaElectrica || 'N/A'}</strong></div>
          <div>💧 Agua: <strong class="text-slate-900">${c.soporteVital?.suministroAgua || 'N/A'}</strong></div>
          <div>💨 Gases: <strong class="text-slate-900">${c.soporteVital?.gasesMedicinales || 'N/A'}</strong></div>
          <div>❄️ Clima: <strong class="text-slate-900">${c.soporteVital?.climatizacion || 'N/A'}</strong></div>
        </div>

        <div class="flex gap-1.5 flex-wrap">
          <button onclick="window.editarCentro('${c.id}')" class="flex-1 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-[11px] transition text-center shadow-sm flex items-center justify-center gap-1">
            <span>📝 Diagnóstico</span>
          </button>
          <button onclick="window.enfocarEnMapa('${c.id}')" class="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg font-bold text-[11px] transition flex items-center justify-center gap-1 shadow-sm" title="Calibrar y Mover Pin al Techo Exacto">
            🎯 Mover
          </button>
          <button onclick="window.eliminarCentro('${c.id}')" class="px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-bold text-[11px] transition flex items-center justify-center gap-1 shadow-sm" title="Eliminar este centro si no existe">
            🗑️ Eliminar
          </button>
          <button onclick="window.verFichaCentro('${c.id}')" class="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-lg border border-slate-300 text-[10px] font-bold transition" title="Ver Ficha Imprimible">
            Ficha 1:1
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

function alCambiarMunicipio(municipioId, moverMapa = true) {
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

  if (moverMapa && mun.parroquias.length > 0 && state.mapaFormulario && state.marcadorFormulario) {
    const coords = mun.parroquias[0].centro;
    state.mapaFormulario.flyTo(coords, 12.5, { duration: 1 });
    state.marcadorFormulario.setLatLng(coords);
    actualizarCoordenadasInputs(coords[0], coords[1]);
  }
}

function alCambiarParroquia(parroquiaId, moverMapa = true) {
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

  if (moverMapa && parr.centro && state.mapaFormulario && state.marcadorFormulario) {
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
        <label class="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer text-xs transition shadow-xs">
          <input type="radio" name="clasificacionEspecifica" value="${st.codigo}" data-label="${st.nombre}" class="accent-blue-600 w-4 h-4">
          <div>
            <span class="font-black text-blue-900 block text-xs">${st.codigo}</span>
            <span class="text-[11px] text-slate-600 block">${st.nombre}</span>
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
      <div class="p-3 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-2 hover:border-blue-300 hover:shadow-sm transition">
        <label class="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
          <input type="checkbox" name="areaServicio" value="${a.id}" class="accent-blue-600 w-4 h-4 rounded border-slate-300">
          <span>${a.label}</span>
        </label>
        ${a.id === 'quirofanos' ? `
          <div class="flex items-center gap-2 pt-1.5 border-t border-slate-200 text-[11px]">
            <span class="text-slate-500 font-semibold">Total:</span>
            <input type="number" id="num-quirofanos-total" min="0" max="50" value="0" class="w-12 px-1.5 py-0.5 bg-slate-50 border border-slate-300 rounded text-center text-slate-900 font-bold focus:border-blue-600">
            <span class="text-emerald-700 font-bold ml-1">Op:</span>
            <input type="number" id="num-quirofanos-op" min="0" max="50" value="0" class="w-12 px-1.5 py-0.5 bg-slate-50 border border-slate-300 rounded text-center text-slate-900 font-bold focus:border-blue-600">
          </div>
        ` : ''}
        ${a.id === 'hospitalizacion' ? `
          <div class="flex items-center gap-2 pt-1.5 border-t border-slate-200 text-[11px]">
            <span class="text-slate-500 font-semibold">Camas Totales:</span>
            <input type="number" id="num-camas-hosp" min="0" max="1000" value="0" class="w-16 px-1.5 py-0.5 bg-slate-50 border border-slate-300 rounded text-center text-slate-900 font-bold focus:border-blue-600">
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
      <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
        <h4 class="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 pb-1.5 border-b border-slate-200 flex items-center justify-between">
          <span>${g.titulo}</span>
          <span class="text-[10px] text-amber-700 font-mono font-bold">[Inspección]</span>
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          ${g.items.map(item => `
            <label class="flex items-start gap-2.5 text-xs text-slate-700 hover:text-slate-900 cursor-pointer p-1.5 rounded-lg hover:bg-white transition">
              <input type="checkbox" name="falla_${g.key}" value="${item.id}" class="accent-amber-600 w-3.5 h-3.5 mt-0.5 rounded border-slate-300">
              <span class="leading-tight font-medium">${item.label}</span>
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
    badge.className = 'px-3 py-1 text-xs font-black uppercase tracking-wider bg-red-50 text-red-700 border border-red-300 rounded-full flex items-center gap-1.5 animate-pulse';
    badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-red-500"></span> ⚠️ RIESGO CRÍTICO DETECTADO';
  } else if (nivel === 'amarillo') {
    badge.className = 'px-3 py-1 text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300 rounded-full flex items-center gap-1.5';
    badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-500"></span> 🟡 ALERTA / COMPROMISO PARCIAL';
  } else {
    badge.className = 'px-3 py-1 text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full flex items-center gap-1.5';
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

// ==============================================================
// 5.1 CALIBRADOR RÁPIDO Y BUSCADOR TÁCTICO DEL MAPA GENERAL
// ==============================================================

function poblarSelectorMapaCentros() {
  const sel = document.getElementById('mapa-select-centro');
  if (!sel) return;

  let filtrados = [...state.centros];

  if (state.filtroEstadoMapa === 'calibrar') {
    filtrados = filtrados.filter(c => c.precision !== 'exacta' && c.precision !== 'calibrada_usuario');
  } else if (state.filtroEstadoMapa === 'exactos') {
    filtrados = filtrados.filter(c => c.precision === 'exacta' || c.precision === 'calibrada_usuario');
  }

  if (state.busquedaMapa) {
    const q = state.busquedaMapa.toLowerCase();
    filtrados = filtrados.filter(c => {
      const matchNom = (c.nombre || '').toLowerCase().includes(q);
      const matchParr = (c.parroquia || '').toLowerCase().includes(q);
      const matchSec = (c.sector || '').toLowerCase().includes(q);
      const matchMun = (c.municipio || '').toLowerCase().includes(q);
      return matchNom || matchParr || matchSec || matchMun;
    });
  }

  state.centrosListaMapa = filtrados;

  const grupos = {};
  filtrados.forEach(c => {
    const mun = (c.municipio || 'Otros').replace('Municipio ', '');
    if (!grupos[mun]) grupos[mun] = [];
    grupos[mun].push(c);
  });

  const estadoLabel = state.filtroEstadoMapa === 'calibrar' ? 'Por Calibrar' : (state.filtroEstadoMapa === 'exactos' ? 'Exactos' : 'Todos');
  let html = `<option value="">-- ${filtrados.length} centros (${estadoLabel}) --</option>`;
  for (const [mun, centros] of Object.entries(grupos)) {
    html += `<optgroup label="Municipio ${mun}">`;
    centros.forEach(c => {
      const icono = (c.precision === 'exacta' || c.precision === 'calibrada_usuario') ? '🟢' : '⚠️';
      const sec = c.sector ? ` [${c.sector}]` : '';
      html += `<option value="${c.id}">${icono} ${c.nombre}${sec}</option>`;
    });
    html += `</optgroup>`;
  }

  sel.innerHTML = html;
  if (state.centroCalibrando) {
    sel.value = state.centroCalibrando.id;
  }
  actualizarContadorNavMapa();

  // Poblar también los selectores del Inspector y la Tarjeta Flotante Google Maps
  let optgroupsCentros = '';
  for (const [mun, centros] of Object.entries(grupos)) {
    optgroupsCentros += `<optgroup label="Municipio ${mun}">`;
    centros.forEach(c => {
      const icono = (c.precision === 'exacta' || c.precision === 'calibrada_usuario') ? '🟢' : '⚠️';
      optgroupsCentros += `<option value="${c.id}">${icono} ${c.nombre} (${c.parroquia})</option>`;
    });
    optgroupsCentros += `</optgroup>`;
  }

  const selAsignar = document.getElementById('select-asignar-centro');
  if (selAsignar) {
    selAsignar.innerHTML = '<option value="">-- Seleccionar centro a calibrar (84) --</option>' + optgroupsCentros;
    if (state.centroCalibrando) {
      selAsignar.value = state.centroCalibrando.id;
    }
  }

  const selCardAsignar = document.getElementById('select-card-asignar-centro');
  if (selCardAsignar) {
    selCardAsignar.innerHTML = '<option value="">-- Mover este punto a... --</option>' + optgroupsCentros;
    if (state.centroCalibrando) {
      selCardAsignar.value = state.centroCalibrando.id;
    }
  }
}

function actualizarContadorNavMapa() {
  const counter = document.getElementById('mapa-nav-counter');
  if (!counter) return;

  if (!state.centrosListaMapa || state.centrosListaMapa.length === 0) {
    counter.textContent = '0/0';
    return;
  }

  if (!state.centroCalibrando) {
    counter.textContent = `1/${state.centrosListaMapa.length}`;
    return;
  }

  const idx = state.centrosListaMapa.findIndex(c => c.id === state.centroCalibrando.id);
  if (idx !== -1) {
    counter.textContent = `${idx + 1}/${state.centrosListaMapa.length}`;
  } else {
    counter.textContent = `-/${state.centrosListaMapa.length}`;
  }
}

function navegarCentroMapa(delta) {
  if (!state.centrosListaMapa || state.centrosListaMapa.length === 0) return;

  let nextIdx = 0;
  if (state.centroCalibrando) {
    const curIdx = state.centrosListaMapa.findIndex(c => c.id === state.centroCalibrando.id);
    if (curIdx !== -1) {
      nextIdx = (curIdx + delta + state.centrosListaMapa.length) % state.centrosListaMapa.length;
    }
  }

  const nextCentro = state.centrosListaMapa[nextIdx];
  if (nextCentro) {
    enfocarEnMapa(nextCentro.id);
  }
}

function filtrarCentrosMapa(criterio) {
  state.filtroEstadoMapa = criterio;

  document.querySelectorAll('.chip-filter').forEach(chip => {
    chip.classList.remove('active', 'bg-blue-700', 'text-white', 'shadow-sm');
    chip.classList.add('bg-white', 'text-slate-700', 'border', 'border-slate-300');
  });

  const activeChip = document.getElementById(`chip-filtro-${criterio}`);
  if (activeChip) {
    activeChip.classList.add('active', 'bg-blue-700', 'text-white', 'shadow-sm');
    activeChip.classList.remove('bg-white', 'text-slate-700');
  }

  poblarSelectorMapaCentros();

  if (state.centrosListaMapa.length > 0) {
    enfocarEnMapa(state.centrosListaMapa[0].id);
  }
}

function conmutarCapaMapa(tipo) {
  if (!state.mapaGeneral || !state.googleRoadmapLayer || !state.googleHybridLayer || !state.googleTerrainLayer) return;

  const btnCalles = document.getElementById('btn-toggle-calles');
  const btnSat = document.getElementById('btn-toggle-satelite');
  const btnTerreno = document.getElementById('btn-toggle-terreno');

  // Remover capas activas
  if (state.mapaGeneral.hasLayer(state.googleRoadmapLayer)) {
    state.mapaGeneral.removeLayer(state.googleRoadmapLayer);
  }
  if (state.mapaGeneral.hasLayer(state.googleHybridLayer)) {
    state.mapaGeneral.removeLayer(state.googleHybridLayer);
  }
  if (state.mapaGeneral.hasLayer(state.googleTerrainLayer)) {
    state.mapaGeneral.removeLayer(state.googleTerrainLayer);
  }

  const activeClass = 'px-2.5 py-1 rounded-lg bg-blue-700 text-white font-bold text-[11px] transition flex items-center gap-1 shadow-sm';
  const inactiveClass = 'px-2.5 py-1 rounded-lg text-slate-700 hover:text-blue-900 font-medium text-[11px] transition flex items-center gap-1';

  if (btnCalles) btnCalles.className = inactiveClass;
  if (btnSat) btnSat.className = inactiveClass;
  if (btnTerreno) btnTerreno.className = inactiveClass;

  if (tipo === 'satelite') {
    state.googleHybridLayer.addTo(state.mapaGeneral);
    state.capaActualMapa = 'satelite';
    if (btnSat) btnSat.className = activeClass;
  } else if (tipo === 'terreno') {
    state.googleTerrainLayer.addTo(state.mapaGeneral);
    state.capaActualMapa = 'terreno';
    if (btnTerreno) btnTerreno.className = activeClass;
  } else {
    // Calles por defecto
    state.googleRoadmapLayer.addTo(state.mapaGeneral);
    state.capaActualMapa = 'calles';
    if (btnCalles) btnCalles.className = activeClass;
  }
}

function enfocarEnMapa(id) {
  cambiarPestana('tab-mapa');
  initMapaGeneral();

  const centro = state.centros.find(c => c.id === id);
  if (!centro) return;

  state.centroCalibrando = { ...centro };
  state.coordsTempCalibracion = { lat: centro.lat, lng: centro.lng };

  if (state.mapaGeneral) {
    state.mapaGeneral.flyTo([centro.lat, centro.lng], 18, {
      animate: true,
      duration: 1.2
    });
  }

  actualizarUICalibrador(centro);

  // Sincronizar también con el Inspector Interactivo Google Maps
  actualizarPuntoInspectorGmaps(centro.lat, centro.lng, false);
  const selAsignar = document.getElementById('select-asignar-centro');
  if (selAsignar) selAsignar.value = centro.id;

  const sel = document.getElementById('mapa-select-centro');
  if (sel) sel.value = centro.id;
  actualizarContadorNavMapa();
}

function calibrarEnMapa(id) {
  enfocarEnMapa(id);
}

function actualizarUICalibrador(centro) {
  const panel = document.getElementById('mapa-quick-calibrator');
  if (!panel) return;

  panel.classList.remove('hidden');

  const elNombre = document.getElementById('calibrator-nombre');
  if (elNombre) elNombre.textContent = centro.nombre;

  const elUbic = document.getElementById('calibrator-ubicacion');
  if (elUbic) {
    const mun = (centro.municipio || '').replace('Municipio ', '');
    elUbic.textContent = `${mun} • ${centro.parroquia || ''} • ${centro.sector || 'Casco Central'}`;
  }

  const badgePrec = document.getElementById('calibrator-badge-precision');
  if (badgePrec) {
    const esExacto = (centro.precision === 'exacta' || centro.precision === 'calibrada_usuario');
    badgePrec.className = `px-2 py-0.5 rounded-full text-[10px] font-bold ${
      esExacto ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60' : 'bg-amber-950 text-amber-300 border border-amber-700/60 animate-pulse'
    }`;
    badgePrec.innerHTML = esExacto 
      ? '<span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1"></span> Coordenada Exacta'
      : '<span class="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 mr-1"></span> Requiere Calibración';
  }

  actualizarDisplayCoordsCalibrador(centro.lat, centro.lng);
  desactivarModoArrastre();

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    lucide.createIcons();
  }
}

function actualizarDisplayCoordsCalibrador(lat, lng) {
  const elCoords = document.getElementById('calibrator-coords-display');
  if (elCoords) {
    elCoords.textContent = `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
  }
}

function toggleModoArrastrePin() {
  if (!state.centroCalibrando || !state.mapaGeneral) return;

  state.modoArrastreActivo = !state.modoArrastreActivo;
  const btn = document.getElementById('btn-toggle-arrastre');
  const label = document.getElementById('label-modo-arrastre');
  const msg = document.getElementById('msg-modo-arrastre');

  if (state.modoArrastreActivo) {
    if (btn) {
      btn.classList.add('bg-red-500/20', 'text-red-300', 'border-red-500');
      btn.classList.remove('bg-amber-500/20', 'text-amber-300', 'border-amber-500/50');
    }
    if (label) label.textContent = '🛑 Desactivar Modo Arrastre';
    if (msg) msg.classList.remove('hidden');

    if (state.marcadorCalibracion) {
      state.marcadorCalibracion.remove();
    }

    const iconPin = L.divIcon({
      className: 'calibration-drag-pin',
      html: `
        <div style="width:38px; height:38px; border-radius:50% 50% 50% 0; background:linear-gradient(135deg, #ef4444, #991b1b); border:3px solid #ffffff; transform:rotate(-45deg); box-shadow:0 0 25px #ef4444; display:flex; align-items:center; justify-content:center; cursor:grab;">
          <span style="transform:rotate(45deg); font-size:18px;">🎯</span>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 38]
    });

    state.marcadorCalibracion = L.marker(
      [state.coordsTempCalibracion.lat, state.coordsTempCalibracion.lng],
      { icon: iconPin, draggable: true, zIndexOffset: 2500 }
    ).addTo(state.mapaGeneral);

    state.marcadorCalibracion.on('dragend', function(e) {
      const pos = e.target.getLatLng();
      state.coordsTempCalibracion = { lat: pos.lat, lng: pos.lng };
      actualizarDisplayCoordsCalibrador(pos.lat, pos.lng);
    });

    mostrarNotificacion('🎯 Modo Arrastre ACTIVO: Haz clic en el mapa o arrastra el pin al techo del hospital.', 'exito');

  } else {
    desactivarModoArrastre();
  }
}

function desactivarModoArrastre() {
  state.modoArrastreActivo = false;
  const btn = document.getElementById('btn-toggle-arrastre');
  const label = document.getElementById('label-modo-arrastre');
  const msg = document.getElementById('msg-modo-arrastre');

  if (btn) {
    btn.classList.remove('bg-red-500/20', 'text-red-300', 'border-red-500');
    btn.classList.add('bg-amber-500/20', 'text-amber-300', 'border-amber-500/50');
  }
  if (label) label.textContent = '🎯 Activar Arrastre / Clic en el Mapa';
  if (msg) msg.classList.add('hidden');

  if (state.marcadorCalibracion) {
    state.marcadorCalibracion.remove();
    state.marcadorCalibracion = null;
  }
}

function guardarCalibracionActual() {
  if (!state.centroCalibrando || !state.coordsTempCalibracion) return;

  const id = state.centroCalibrando.id;
  const idx = state.centros.findIndex(c => c.id === id);
  if (idx === -1) return;

  const lat = parseFloat(state.coordsTempCalibracion.lat.toFixed(5));
  const lng = parseFloat(state.coordsTempCalibracion.lng.toFixed(5));

  state.centros[idx].lat = lat;
  state.centros[idx].lng = lng;
  state.centros[idx].precision = 'exacta';

  guardarEnStorage();

  actualizarMapaGeneral();
  renderDirectorioTabla();
  actualizarContadoresKPI();
  poblarSelectorMapaCentros();

  desactivarModoArrastre();
  actualizarUICalibrador(state.centros[idx]);

  mostrarNotificacion(`✅ Ubicación de "${state.centros[idx].nombre}" guardada con precisión exacta (${lat}, ${lng}).`, 'exito');
}

function abrirGmapsCalibradorActual() {
  if (!state.centroCalibrando) return;
  const c = state.centroCalibrando;
  const query = `${c.nombre} ${c.sector || ''} ${c.municipio || ''} Monagas Venezuela`.replace(/\s+/g, ' ').trim();
  window.open(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, '_blank');
}

function aplicarGmapsEnCalibrador() {
  const input = document.getElementById('calibrator-gmaps-input');
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;

  const coords = procesarEnlaceOGoogleMaps(val);
  if (coords) {
    state.coordsTempCalibracion = { lat: coords.lat, lng: coords.lng };
    if (state.mapaGeneral) {
      state.mapaGeneral.flyTo([coords.lat, coords.lng], 18, { animate: true, duration: 1 });
    }
    
    if (!state.modoArrastreActivo) {
      toggleModoArrastrePin();
    } else if (state.marcadorCalibracion) {
      state.marcadorCalibracion.setLatLng([coords.lat, coords.lng]);
    }
    
    actualizarDisplayCoordsCalibrador(coords.lat, coords.lng);
    input.value = '';
    mostrarNotificacion(`Coordenadas ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)} aplicadas. Pulsa "Guardar Ubicación" para confirmar.`, 'exito');
  } else {
    mostrarNotificacion('No se encontraron coordenadas válidas en el texto pegado.', 'error');
  }
}

function verFichaCalibradorActual() {
  if (!state.centroCalibrando) return;
  const centroActual = state.centros.find(c => c.id === state.centroCalibrando.id) || state.centroCalibrando;
  renderFichaImprimible(centroActual);
}

function cerrarCalibradorRapido() {
  desactivarModoArrastre();
  const panel = document.getElementById('mapa-quick-calibrator');
  if (panel) panel.classList.add('hidden');
}

function copiarCoordenadasCalibrador() {
  if (!state.coordsTempCalibracion) return;
  const txt = `${state.coordsTempCalibracion.lat.toFixed(5)}, ${state.coordsTempCalibracion.lng.toFixed(5)}`;
  navigator.clipboard.writeText(txt).then(() => {
    mostrarNotificacion(`Coordenadas copiadas: ${txt}`, 'exito');
  }).catch(() => {
    prompt('Copia las coordenadas manualmente:', txt);
  });
}

function mostrarNotificacion(mensaje, tipo = 'exito') {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-5 right-5 z-[999999] px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-2 text-xs font-bold transition-all transform duration-300 translate-y-8 opacity-0 ${
    tipo === 'exito' ? 'bg-[#0f241a] border-emerald-500 text-emerald-200' : 'bg-[#290e14] border-red-500 text-red-200'
  }`;
  toast.innerHTML = `<span>${tipo === 'exito' ? '✅' : '⚠️'}</span> <span>${mensaje}</span>`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-8', 'opacity-0');
  });
  setTimeout(() => {
    toast.classList.add('translate-y-8', 'opacity-0');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
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
    alCambiarMunicipio(centro.municipioId, false);
  }

  const selParr = document.getElementById('form-parroquia');
  if (selParr) {
    selParr.value = centro.parroquiaId;
    alCambiarParroquia(centro.parroquiaId, false);
  }

  const selSec = document.getElementById('form-sector');
  if (selSec) {
    selSec.value = centro.sector || '';
  }

  // Establecer posición EXACTA del centro en el mapa del formulario (sin sobreescrituras)
  if (centro.lat && centro.lng) {
    const latNum = parseFloat(centro.lat);
    const lngNum = parseFloat(centro.lng);
    actualizarCoordenadasInputs(latNum, lngNum, false);

    setTimeout(() => {
      if (!state.mapaFormulario && typeof initMapaFormulario === 'function') {
        initMapaFormulario();
      }
      if (state.mapaFormulario) {
        state.mapaFormulario.invalidateSize();
        state.mapaFormulario.setView([latNum, lngNum], 16);
        if (state.marcadorFormulario) {
          state.marcadorFormulario.setLatLng([latNum, lngNum]);
        }
      }
    }, 120);
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

  const confirmar = confirm(`¿Confirma eliminar el centro de salud "${centro.nombre}" (${centro.municipio || ''})?\n\nSi no existe o está duplicado, se removerá permanentemente del mapa y del sistema.`);
  if (!confirmar) return;

  state.centros = state.centros.filter(c => c.id !== id);
  guardarEnStorage();

  // Si el calibrador rápido estaba abierto con este centro, cerrarlo
  if (state.centroCalibrando && state.centroCalibrando.id === id) {
    cerrarCalibradorRapido();
  }

  // Si la tarjeta flotante estaba apuntando a este centro, resetear selección
  const selCard = document.getElementById('select-card-asignar-centro');
  if (selCard && selCard.value === id) selCard.value = '';

  const selAsignar = document.getElementById('select-asignar-centro');
  if (selAsignar && selAsignar.value === id) selAsignar.value = '';
}

function eliminarCentroCalibradorActual() {
  if (!state.centroCalibrando) {
    alert('No hay ningún centro seleccionado actualmente.');
    return;
  }
  eliminarCentro(state.centroCalibrando.id);
}

function eliminarCentroSeleccionadoDesdeTarjeta() {
  const sel = document.getElementById('select-card-asignar-centro');
  if (!sel || !sel.value) {
    alert('Por favor selecciona primero en el menú desplegable cuál centro deseas eliminar.');
    return;
  }
  eliminarCentro(sel.value);
}

function abrirModalCrearCentroRapido() {
  const modal = document.getElementById('modal-nuevo-centro-rapido');
  if (!modal) return;

  const lat = (state.coordsInspectorGmaps && state.coordsInspectorGmaps.lat) ? state.coordsInspectorGmaps.lat : 9.7489;
  const lng = (state.coordsInspectorGmaps && state.coordsInspectorGmaps.lng) ? state.coordsInspectorGmaps.lng : -63.1794;

  const subCoords = document.getElementById('modal-rapido-coords-sub');
  if (subCoords) {
    subCoords.textContent = `Coords: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }

  // Poblar select de municipios si está vacío o solo con la opción por defecto
  const selMun = document.getElementById('modal-rapido-municipio');
  if (selMun && selMun.options.length <= 1 && window.CATALOGO_TERRITORIAL) {
    selMun.innerHTML = '<option value="">Seleccione Municipio...</option>';
    window.CATALOGO_TERRITORIAL.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.nombre;
      opt.textContent = m.nombre;
      selMun.appendChild(opt);
    });
  }

  // Resetear inputs
  const inNom = document.getElementById('modal-rapido-nombre');
  if (inNom) inNom.value = '';
  const inSec = document.getElementById('modal-rapido-sector');
  if (inSec) inSec.value = '';

  modal.classList.remove('hidden');
  if (inNom) inNom.focus();
}

function cerrarModalCrearCentroRapido() {
  const modal = document.getElementById('modal-nuevo-centro-rapido');
  if (modal) modal.classList.add('hidden');
}

function guardarNuevoCentroRapido() {
  const inNom = document.getElementById('modal-rapido-nombre');
  const selMun = document.getElementById('modal-rapido-municipio');
  const selRed = document.getElementById('modal-rapido-tipo-red');
  const inSec = document.getElementById('modal-rapido-sector');
  const selClas = document.getElementById('modal-rapido-clasificacion');

  if (!inNom || !inNom.value.trim()) {
    alert('Por favor indica el nombre del nuevo centro de salud.');
    return;
  }
  if (!selMun || !selMun.value) {
    alert('Por favor selecciona el municipio.');
    return;
  }

  const lat = (state.coordsInspectorGmaps && state.coordsInspectorGmaps.lat) ? parseFloat(state.coordsInspectorGmaps.lat.toFixed(6)) : 9.7489;
  const lng = (state.coordsInspectorGmaps && state.coordsInspectorGmaps.lng) ? parseFloat(state.coordsInspectorGmaps.lng.toFixed(6)) : -63.1794;

  const nuevoId = 'cs-user-' + Date.now();
  const nuevoCentro = {
    id: nuevoId,
    nombre: inNom.value.trim(),
    municipio: selMun.value,
    tipoRed: selRed ? selRed.value : 'comunal',
    sector: inSec ? inSec.value.trim() : '',
    parroquia: inSec ? inSec.value.trim() : '',
    clasificacion: selClas ? selClas.value : 'Ambulatorio Rural Tipo II',
    lat: lat,
    lng: lng,
    precision: 'calibrada_usuario',
    operatividad: 'Operativo',
    semaforo: 'verde',
    scoreOperatividad: 100,
    serviciosBasicos: { agua: 'Continuo', luz: 'Estable', plantaElectrica: 'Operativa' },
    soporteVital: { oxigeno: 'Disponible', climatizacion: 'Operativo' },
    fallas: {},
    areasServicios: [],
    observacionesGenerales: 'Centro creado por el usuario con puntero propio directo en el mapa.'
  };

  state.centros.unshift(nuevoCentro);
  guardarEnStorage();
  cerrarModalCrearCentroRapido();
  cerrarTarjetaPinFlotante();

  alert(`✅ ¡Centro creado exitosamente!\n\n${nuevoCentro.nombre}\nCoordenadas: ${lat}, ${lng}\nMunicipio: ${nuevoCentro.municipio}`);

  enfocarEnMapa(nuevoId);
}

function restaurarCentrosOriginales() {
  const centrosBase = (window.CENTROS_SALUD_INICIALES && window.CENTROS_SALUD_INICIALES.length > 0)
    ? window.CENTROS_SALUD_INICIALES
    : (CENTROS_SALUD_INICIALES || []);

  if (confirm(`¿Deseas restaurar la lista oficial de centros de salud originales (${centrosBase.length} centros)?\n\nEsto recuperará cualquier centro que hayas eliminado.`)) {
    localStorage.removeItem(STORAGE_KEY);
    state.centros = JSON.parse(JSON.stringify(centrosBase));
    guardarEnStorage();
    if (state.centroCalibrando) {
      cerrarCalibradorRapido();
    }
    alert(`✅ Catálogo restaurado exitosamente con ${state.centros.length} centros de salud.`);
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
      
      <!-- CABECERA INSTITUCIONAL CON LOGO OFICIAL DEL PARTIDO MIGATO -->
      <table class="ficha-table">
        <tr>
          <td width="14%" style="text-align: center; vertical-align: middle; padding: 4px 6px; background-color: #ffffff;">
            <img src="assets/logo-migato.png" alt="Logo MIGATO" style="height: 48px; max-width: 58px; object-fit: contain; margin: 0 auto; display: block;">
          </td>
          <td width="72%" class="ficha-header-title" style="vertical-align: middle; padding: 4px 8px; border-left: 1.5px solid #000; border-right: 1.5px solid #000; background-color: #f8fafc;">
            <div style="font-size: 7.5pt; font-weight: 800; letter-spacing: 1px; color: #334155; text-transform: uppercase;">MOVIMIENTO INDEPENDIENTE GANAMOS TODOS • ESTADO MONAGAS</div>
            <div style="font-size: 11pt; font-weight: 900; letter-spacing: 0.5px; color: #000000; margin: 1px 0;">PRE DIAGNÓSTICO DE INFRAESTRUCTURA SANITARIA</div>
            <div style="font-size: 7pt; font-weight: 700; color: #475569; letter-spacing: 0.5px;">PLAN INTEGRAL DE SALUD • SISTEMA ASISTENCIAL DE MONAGAS</div>
          </td>
          <td width="14%" style="text-align: center; vertical-align: middle; padding: 4px 6px; background-color: #ffffff; font-size: 7pt;">
            <span style="display: block; font-size: 6pt; color: #64748b; font-weight: 800; text-transform: uppercase;">N° FICHA</span>
            <span style="font-family: monospace; font-size: 8pt; font-weight: 900; color: #0f172a;">${(centro.id || 'CS-000').toUpperCase()}</span>
          </td>
        </tr>
      </table>

      <!-- DATOS DE LOCALIZACIÓN POLÍTICO-TERRITORIAL -->
      <table class="ficha-table">
        <tr>
          <td width="20%">
            <span class="ficha-label">Estado:</span><br>
            <strong class="ficha-value text-xs">MONAGAS</strong>
          </td>
          <td width="20%">
            <span class="ficha-label">Municipio:</span><br>
            <span class="ficha-value text-xs">${(centro.municipio || '').replace('Municipio ', '')}</span>
          </td>
          <td width="20%">
            <span class="ficha-label">Parroquia:</span><br>
            <span class="ficha-value text-xs">${centro.parroquia || ''}</span>
          </td>
          <td width="20%">
            <span class="ficha-label">Sector:</span><br>
            <span class="ficha-value text-xs">${centro.sector || 'Casco Central'}</span>
          </td>
          <td width="20%">
            <span class="ficha-label">Área / Módulo:</span><br>
            <strong class="ficha-value text-xs">SALUD (MOD. 5)</strong>
          </td>
        </tr>
        <tr>
          <td colspan="5" style="background-color: #f8fafc; padding: 4px 8px;">
            <span class="ficha-label" style="font-size: 8pt;">Nombre del Centro de Salud:</span>
            <strong style="font-size: 10pt; color: #000; margin-left: 6px;">${centro.nombre}</strong>
          </td>
        </tr>
      </table>

      <!-- MAPA DE UBICACIÓN (FORMATO PLANO / EDITABLE) -->
      <table class="ficha-table">
        <tr>
          <td style="background-color: #f1f5f9; text-align: center; font-weight: 800; font-size: 7.5pt; padding: 3px 6px; border-top: none;">
            <span>PLANO DE UBICACIÓN Y ACCESO VIAL</span> 
            <span style="font-family: monospace; color: #1e293b; margin-left: 8px;">(Coordenadas: ${(centro.lat || 9.7483).toFixed(5)}, ${(centro.lng || -63.1785).toFixed(5)})</span>
            <span id="ficha-mapa-tipo-label" style="margin-left: 8px; font-size: 6.5pt; padding: 1px 6px; border-radius: 4px; background: #e2e8f0; border: 1px solid #cbd5e1; font-weight: 900;">PLANO CADASTRAL / CALLES</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 0;">
            <div id="mapa-ficha-print" class="ficha-map-container" style="height: 125px; width: 100%;"></div>
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

function initMiniMapaFicha(centro, estilo) {
  const container = document.getElementById('mapa-ficha-print');
  if (!container || typeof L === 'undefined') return;

  if (estilo) {
    state.estiloMapaFicha = estilo;
  } else {
    estilo = state.estiloMapaFicha || 'plano';
  }

  actualizarBotonesEstiloFicha(estilo);

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
      dragging: true,
      scrollWheelZoom: false,
      doubleClickZoom: false
    }).setView([lat, lng], 16);

    let tileUrl = 'https://mt{s}.google.com/vt/lyrs=m&hl=es&gl=VE&x={x}&y={y}&z={z}'; // Plano limpio por defecto (Calles sin relieve)
    if (estilo === 'relieve') {
      tileUrl = 'https://mt{s}.google.com/vt/lyrs=p&hl=es&gl=VE&x={x}&y={y}&z={z}';
    } else if (estilo === 'satelite') {
      tileUrl = 'https://mt{s}.google.com/vt/lyrs=y&hl=es&gl=VE&x={x}&y={y}&z={z}';
    }

    L.tileLayer(tileUrl, {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 20
    }).addTo(map);

    // Marcador de mira técnica estilo plano arquitectónico / catastral
    const pin = L.divIcon({
      className: 'custom-print-pin',
      html: `
        <div style="position:relative; width:28px; height:28px; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; width:24px; height:24px; border:2px solid #b91c1c; border-radius:50%; background:rgba(239,68,68,0.25);"></div>
          <div style="position:absolute; width:1.5px; height:28px; background:#b91c1c;"></div>
          <div style="position:absolute; width:28px; height:1.5px; background:#b91c1c;"></div>
          <div style="width:8px; height:8px; background:#dc2626; border:2px solid #ffffff; border-radius:50%; box-shadow:0 1px 3px rgba(0,0,0,0.7);"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    L.marker([lat, lng], { icon: pin }).addTo(map);
    state.mapaFichaImpresion = map;

    const lblEstilo = document.getElementById('ficha-mapa-tipo-label');
    if (lblEstilo) {
      lblEstilo.textContent = estilo === 'plano' 
        ? 'PLANO CADASTRAL / CALLES (SIN RELIEVE)' 
        : (estilo === 'relieve' ? 'RELIEVE TOPOGRÁFICO' : 'VISTA SATELITAL');
    }
  } catch (err) {
    console.error('Error inicializando mini-mapa en ficha:', err);
  }
}

function cambiarEstiloMapaFicha(tipo) {
  if (!state.centroSeleccionado) return;
  state.estiloMapaFicha = tipo;
  initMiniMapaFicha(state.centroSeleccionado, tipo);
}

function actualizarBotonesEstiloFicha(estiloActivo) {
  const btnPlano = document.getElementById('btn-ficha-mapa-plano');
  const btnRelieve = document.getElementById('btn-ficha-mapa-relieve');
  const btnSat = document.getElementById('btn-ficha-mapa-satelite');

  const btnActive = 'px-2.5 py-1 rounded-lg bg-sky-500 text-slate-950 font-black text-xs transition shadow flex items-center gap-1 active:scale-95';
  const btnInactive = 'px-2.5 py-1 rounded-lg text-slate-300 hover:text-white font-bold text-xs transition flex items-center gap-1 active:scale-95';

  if (btnPlano) btnPlano.className = (estiloActivo === 'plano') ? btnActive : btnInactive;
  if (btnRelieve) btnRelieve.className = (estiloActivo === 'relieve') ? btnActive : btnInactive;
  if (btnSat) btnSat.className = (estiloActivo === 'satelite') ? btnActive : btnInactive;
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
        color === 'rojo' ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse' :
        color === 'amarillo' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
        'bg-emerald-50 text-emerald-800 border border-emerald-200'
      }">
        <span class="w-1.5 h-1.5 rounded-full ${color === 'rojo' ? 'bg-red-500' : color === 'amarillo' ? 'bg-amber-500' : 'bg-emerald-500'}"></span>
        ${color === 'rojo' ? 'Crítico' : color === 'amarillo' ? 'Alerta' : 'Estable'}
      </span>
    `;

    html += `
      <tr class="border-b border-slate-200 hover:bg-blue-50/50 transition text-xs">
        <td class="py-3 px-3 font-mono text-slate-500">#${idx + 1}</td>
        <td class="py-3 px-3">
          <strong class="text-slate-900 block font-bold text-sm leading-snug">${c.nombre}</strong>
          <span class="text-[11px] text-blue-700 font-bold font-mono">${c.clasificacionEspecificaLabel || c.clasificacionEspecifica}</span>
        </td>
        <td class="py-3 px-3 text-slate-700">
          <div class="font-semibold text-slate-900">${(c.municipio || '').replace('Municipio ', '')}</div>
          <div class="text-[11px] text-slate-500">${c.parroquia} • ${c.sector || 'N/A'}</div>
          <div class="mt-1">
            ${(c.precision === 'exacta' || c.precision === 'calibrada_usuario')
              ? `<span class="inline-flex items-center gap-1 text-[9px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Exacta (${c.lat.toFixed(4)}, ${c.lng.toFixed(4)})</span>`
              : `<span class="inline-flex items-center gap-1 text-[9px] text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200"><span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Sectorial</span>`
            }
          </div>
        </td>
        <td class="py-3 px-3">
          <div class="grid grid-cols-2 gap-1 text-[10px] font-mono">
            <span title="Planta Eléctrica" class="px-1.5 py-0.5 rounded ${c.soporteVital?.plantaElectrica === 'Operativa' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold' : 'bg-red-50 text-red-800 border border-red-200 font-bold'}">
              ⚡ ${c.soporteVital?.plantaElectrica || 'N/A'}
            </span>
            <span title="Suministro de Agua" class="px-1.5 py-0.5 rounded ${c.soporteVital?.suministroAgua === 'Continuo' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold' : 'bg-amber-50 text-amber-800 border border-amber-200 font-bold'}">
              💧 ${c.soporteVital?.suministroAgua || 'N/A'}
            </span>
          </div>
        </td>
        <td class="py-3 px-3 text-center">
          ${badgeRisk}
        </td>
        <td class="py-3 px-3 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button onclick="window.enfocarEnMapa('${c.id}')" class="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white font-bold rounded-lg text-[11px] border border-emerald-300 transition flex items-center gap-1 shadow-xs" title="Enfocar y Calibrar en el Mapa">
              <i data-lucide="crosshair" class="w-3.5 h-3.5"></i>
              <span>Calibrar</span>
            </button>
            <button onclick="window.buscarCentroEnGoogleMaps('${c.id}')" class="p-1.5 bg-white hover:bg-amber-50 text-amber-600 hover:text-amber-700 rounded-lg border border-amber-200 transition shadow-xs" title="Buscar en Google Maps ↗">
              <i data-lucide="compass" class="w-3.5 h-3.5"></i>
            </button>
            <button onclick="window.verFichaCentro('${c.id}')" class="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-800 hover:text-white font-bold rounded-lg text-[11px] border border-blue-300 transition flex items-center gap-1 shadow-xs" title="Ver Ficha Imprimible 1:1">
              <i data-lucide="printer" class="w-3.5 h-3.5"></i>
              <span>Ficha 1:1</span>
            </button>
            <button onclick="window.editarCentro('${c.id}')" class="p-1.5 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 rounded-lg border border-slate-300 transition shadow-xs" title="Editar y Georreferenciar">
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
            </button>
            <button onclick="window.eliminarCentro('${c.id}')" class="p-1.5 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 rounded-lg border border-red-200 transition shadow-xs" title="Eliminar">
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
      btn.classList.add('active', 'bg-blue-700', 'text-white', 'shadow-sm', 'border-blue-800');
      btn.classList.remove('text-slate-700', 'bg-white', 'border-slate-300');
    } else {
      btn.classList.remove('active', 'bg-blue-700', 'text-white', 'shadow-sm', 'border-blue-800');
      btn.classList.add('text-slate-700', 'bg-white', 'border-slate-300');
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
      const query = `${nombre} ${sector} ${munNombre} Monagas Venezuela`.replace(/\s+/g, ' ').trim();
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, '_blank');
    });
  }

  // Eventos del Buscador Táctico y Selector de Centros en el Mapa
  const inputBusquedaMapa = document.getElementById('mapa-search-input');
  if (inputBusquedaMapa) {
    inputBusquedaMapa.addEventListener('input', (e) => {
      state.busquedaMapa = e.target.value.trim();
      poblarSelectorMapaCentros();
    });
    inputBusquedaMapa.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (state.centrosListaMapa.length > 0) {
          enfocarEnMapa(state.centrosListaMapa[0].id);
        }
      }
    });
  }

  const selCentroMapa = document.getElementById('mapa-select-centro');
  if (selCentroMapa) {
    selCentroMapa.addEventListener('change', (e) => {
      const id = e.target.value;
      if (id) enfocarEnMapa(id);
    });
  }

  const btnPrev = document.getElementById('btn-mapa-prev');
  if (btnPrev) btnPrev.addEventListener('click', () => navegarCentroMapa(-1));

  const btnNext = document.getElementById('btn-mapa-next');
  if (btnNext) btnNext.addEventListener('click', () => navegarCentroMapa(1));

  const inputCalGmaps = document.getElementById('calibrator-gmaps-input');
  if (inputCalGmaps) {
    inputCalGmaps.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        aplicarGmapsEnCalibrador();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      cerrarModalFicha();
      cerrarCalibradorRapido();
    }
  });
}

// ==============================================================
// 10. GESTIÓN DE ACCESIBILIDAD Y TEMAS VISUALES (GOBERNAMENTAL / AMIGABLE)
// ==============================================================

function initPreferenciasVisuales() {
  try {
    // 1. Modo Oscuro Suave
    const darkPref = localStorage.getItem('salud_modo_oscuro') === 'true';
    aplicarModoOscuroSuave(darkPref);

    // 2. Modo Letra Grande (40-60+ años)
    const fontPref = localStorage.getItem('salud_letra_grande') === 'true';
    aplicarModoLetraGrande(fontPref);
  } catch (e) {
    console.warn("Preferencias visuales no cargadas:", e);
  }
}

function aplicarModoOscuroSuave(activar) {
  const body = document.body;
  const icono = document.getElementById('icono-tema-oscuro');
  const label = document.getElementById('label-tema-oscuro');
  const btn = document.getElementById('btn-toggle-tema-oscuro');

  if (activar) {
    body.classList.add('modo-oscuro-suave');
    document.documentElement.classList.add('modo-oscuro-suave');
    if (icono) icono.textContent = '☀️';
    if (label) label.textContent = 'Modo Claro';
    if (btn) {
      btn.classList.add('bg-sky-500', 'text-slate-950', 'border-sky-300');
      btn.classList.remove('bg-blue-950/90', 'text-sky-200', 'border-sky-400/80');
      btn.title = 'Cambiar a Modo Claro Gubernamental';
    }
    localStorage.setItem('salud_modo_oscuro', 'true');
  } else {
    body.classList.remove('modo-oscuro-suave');
    document.documentElement.classList.remove('modo-oscuro-suave');
    if (icono) icono.textContent = '🌙';
    if (label) label.textContent = 'Modo Noche';
    if (btn) {
      btn.classList.remove('bg-sky-500', 'text-slate-950', 'border-sky-300');
      btn.classList.add('bg-blue-950/90', 'text-sky-200', 'border-sky-400/80');
      btn.title = 'Modo Noche Ejecutivo: Descanso visual sin ser excesivamente oscuro';
    }
    localStorage.setItem('salud_modo_oscuro', 'false');
  }
}

function toggleModoOscuroSuave() {
  const estaActivo = document.body.classList.contains('modo-oscuro-suave');
  aplicarModoOscuroSuave(!estaActivo);
}

function aplicarModoLetraGrande(activar) {
  const body = document.body;
  const label = document.getElementById('label-letra-grande');
  const btn = document.getElementById('btn-toggle-letra-grande');

  if (activar) {
    body.classList.add('modo-letra-grande');
    document.documentElement.classList.add('modo-letra-grande');
    if (label) label.textContent = 'Letra Grande ✓';
    if (btn) {
      btn.classList.add('bg-amber-400', 'text-slate-950', 'border-amber-300', 'ring-2', 'ring-amber-300/60');
      btn.classList.remove('bg-blue-950/90', 'text-amber-300', 'border-amber-400');
      btn.title = 'Modo Lectura Cómoda ACTIVO (Letras y casillas ampliadas para 40-60+ años). Clic para volver a letra estándar';
    }
    localStorage.setItem('salud_letra_grande', 'true');
  } else {
    body.classList.remove('modo-letra-grande');
    document.documentElement.classList.remove('modo-letra-grande');
    if (label) label.textContent = 'Letra Grande';
    if (btn) {
      btn.classList.remove('bg-amber-400', 'text-slate-950', 'border-amber-300', 'ring-2', 'ring-amber-300/60');
      btn.classList.add('bg-blue-950/90', 'text-amber-300', 'border-amber-400');
      btn.title = 'Modo Lectura Cómoda: Aumenta el tamaño de la letra y casillas para personas de 40, 50 o 60+ años';
    }
    localStorage.setItem('salud_letra_grande', 'false');
  }

  // Refrescar dimensiones del mapa si existe
  if (state.mapaGeneral) {
    setTimeout(() => {
      try { state.mapaGeneral.invalidateSize(); } catch (e) {}
    }, 150);
  }
  if (state.mapaFormulario) {
    setTimeout(() => {
      try { state.mapaFormulario.invalidateSize(); } catch (e) {}
    }, 150);
  }
}

function toggleModoLetraGrande() {
  const estaActivo = document.body.classList.contains('modo-letra-grande');
  aplicarModoLetraGrande(!estaActivo);
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

    initPreferenciasVisuales();
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
window.enfocarEnMapa = enfocarEnMapa;
window.filtrarCentrosMapa = filtrarCentrosMapa;
window.conmutarCapaMapa = conmutarCapaMapa;
window.toggleModoArrastrePin = toggleModoArrastrePin;
window.cerrarCalibradorRapido = cerrarCalibradorRapido;
window.guardarCalibracionActual = guardarCalibracionActual;
window.abrirGmapsCalibradorActual = abrirGmapsCalibradorActual;
window.aplicarGmapsEnCalibrador = aplicarGmapsEnCalibrador;
window.verFichaCalibradorActual = verFichaCalibradorActual;
window.copiarCoordenadasCalibrador = copiarCoordenadasCalibrador;
window.buscarCentroEnGoogleMaps = (id) => {
  const c = state.centros.find(item => item.id === id);
  if (!c) return;
  const query = `${c.nombre} ${c.sector || ''} ${c.municipio || ''} Monagas Venezuela`.replace(/\s+/g, ' ').trim();
  window.open(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, '_blank');
};
window.eliminarCentro = eliminarCentro;
window.eliminarCentroCalibradorActual = eliminarCentroCalibradorActual;
window.eliminarCentroSeleccionadoDesdeTarjeta = eliminarCentroSeleccionadoDesdeTarjeta;
window.abrirModalCrearCentroRapido = abrirModalCrearCentroRapido;
window.cerrarModalCrearCentroRapido = cerrarModalCrearCentroRapido;
window.guardarNuevoCentroRapido = guardarNuevoCentroRapido;
window.restaurarCentrosOriginales = restaurarCentrosOriginales;
window.imprimirFichaActual = () => {
  window.print();
};
window.cerrarModalFicha = cerrarModalFicha;
window.cambiarEstiloMapaFicha = cambiarEstiloMapaFicha;
window.recentrarMapaMonagas = recentrarMapaMonagas;
window.toggleMascaraMonagas = toggleMascaraMonagas;
window.actualizarPuntoDesdeInputs = actualizarPuntoDesdeInputs;
window.copiarCoordenadasInspector = copiarCoordenadasInspector;
window.abrirPuntoEnGoogleMapsOficial = abrirPuntoEnGoogleMapsOficial;
window.crearCentroDesdePunto = crearCentroDesdePunto;
window.aplicarCoordenadaACentroSeleccionado = aplicarCoordenadaACentroSeleccionado;
window.seleccionarCentroDesdeBusquedaFlotante = seleccionarCentroDesdeBusquedaFlotante;
window.limpiarBusquedaFlotante = limpiarBusquedaFlotante;
window.buscarExternoGmapsQuery = buscarExternoGmapsQuery;
window.cerrarTarjetaPinFlotante = cerrarTarjetaPinFlotante;
window.guardarPuntoDesdeTarjetaFlotante = guardarPuntoDesdeTarjetaFlotante;
window.copiarCoordsDesdeTarjetaFlotante = copiarCoordsDesdeTarjetaFlotante;
window.cambiarPestana = cambiarPestana;
window.iniciarAplicacion = iniciarAplicacion;
window.toggleModoOscuroSuave = toggleModoOscuroSuave;
window.toggleModoLetraGrande = toggleModoLetraGrande;
window.aplicarModoOscuroSuave = aplicarModoOscuroSuave;
window.aplicarModoLetraGrande = aplicarModoLetraGrande;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciarAplicacion);
} else {
  iniciarAplicacion();
}

})(typeof window !== 'undefined' ? window : this);
