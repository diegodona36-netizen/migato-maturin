/**
 * MIGATO • Portal Público de Noticias, Reels y Comunicados
 * Monagas 2026 - Conducción: José Gregorio "El Gato" Briceño
 * Arquitectura Ultraligera con Carga Bajo Demanda (On-Demand Embed)
 */

(function () {
  'use strict';

  const STORAGE_KEY_PUBLICADOS = 'migato_muro_contenidos';
  const STORAGE_KEY_PENDIENTES = 'migato_muro_pendientes';

  let state = {
    contenidos: [],
    filtroTipo: 'todos',
    filtroMunicipio: 'todos',
    busqueda: ''
  };

  // ==============================================================
  // 1. INICIALIZACIÓN Y CARGA DE DATOS
  // ==============================================================
  async function initMuro() {
    try {
      const guardados = localStorage.getItem(STORAGE_KEY_PUBLICADOS);
      if (guardados) {
        state.contenidos = JSON.parse(guardados);
      } else {
        const resp = await fetch('data/muro_contenidos.json?v=' + Date.now());
        if (resp.ok) {
          state.contenidos = await resp.json();
          localStorage.setItem(STORAGE_KEY_PUBLICADOS, JSON.stringify(state.contenidos));
        }
      }
    } catch (err) {
      console.warn('Cargando respaldo local de muro_contenidos:', err);
    }

    renderFeed();
    setupListeners();
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // ==============================================================
  // 2. PARSEO DE URLS Y REPRODUCTOR BAJO DEMANDA
  // ==============================================================
  function resolverEmbedUrl(url, plataforma) {
    if (!url) return '';
    try {
      if (plataforma === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        if (url.includes('shorts/')) {
          videoId = url.split('shorts/')[1].split('?')[0].split('/')[0];
        } else if (url.includes('v=')) {
          videoId = url.split('v=')[1].split('&')[0];
        } else if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1].split('?')[0];
        }
        return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0` : url;
      }
      if (plataforma === 'instagram' || url.includes('instagram.com')) {
        const clean = url.split('?')[0].replace(/\/+$/, '');
        return `${clean}/embed/`;
      }
      if (plataforma === 'tiktok' || url.includes('tiktok.com')) {
        const match = url.match(/video\/(\d+)/);
        if (match && match[1]) {
          return `https://www.tiktok.com/embed/v2/${match[1]}`;
        }
      }
    } catch (e) {
      console.error('Error parseando URL de embed:', e);
    }
    return url;
  }

  window.reproducirVideo = function (id) {
    const item = state.contenidos.find(c => c.id === id);
    if (!item) return;

    const container = document.getElementById(`video-box-${id}`);
    if (!container) return;

    const embedUrl = resolverEmbedUrl(item.embedUrl || item.url, item.plataforma);

    if (item.plataforma === 'youtube') {
      container.innerHTML = `
        <iframe src="${embedUrl}" 
                class="w-full h-full min-h-[360px] sm:min-h-[420px] rounded-2xl border-0 shadow-inner" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen></iframe>`;
    } else if (item.plataforma === 'instagram') {
      container.innerHTML = `
        <div class="w-full h-full min-h-[480px] bg-slate-950 flex flex-col items-center justify-center p-2 rounded-2xl">
          <iframe src="${embedUrl}" 
                  class="w-full h-[480px] rounded-xl border-0" 
                  frameborder="0" scrolling="no" allowtransparency="true"></iframe>
          <a href="${item.url}" target="_blank" class="mt-2 text-xs text-rose-400 hover:underline flex items-center gap-1 font-bold">
            <span>Abrir directamente en la App de Instagram ↗</span>
          </a>
        </div>`;
    } else if (item.plataforma === 'tiktok') {
      container.innerHTML = `
        <div class="w-full h-full min-h-[500px] bg-slate-950 flex flex-col items-center justify-center p-2 rounded-2xl">
          <iframe src="${embedUrl}" 
                  class="w-full h-[500px] rounded-xl border-0" 
                  frameborder="0" allowfullscreen></iframe>
          <a href="${item.url}" target="_blank" class="mt-2 text-xs text-cyan-400 hover:underline flex items-center gap-1 font-bold">
            <span>Abrir directamente en TikTok ↗</span>
          </a>
        </div>`;
    } else {
      // Fallback
      window.open(item.url, '_blank');
    }
  };

  // ==============================================================
  // 3. RENDERIZADO DEL FEED DE NOTICIAS Y REELS
  // ==============================================================
  function renderFeed() {
    const contenedor = document.getElementById('feed-muro');
    const badgeContador = document.getElementById('contador-visibles');
    if (!contenedor) return;

    let items = state.contenidos.filter(c => c.estado === 'publicado');

    // Filtro por Tipo
    if (state.filtroTipo !== 'todos') {
      items = items.filter(c => c.tipo === state.filtroTipo);
    }

    // Filtro por Municipio
    if (state.filtroMunicipio !== 'todos') {
      items = items.filter(c => c.municipio.toLowerCase() === state.filtroMunicipio.toLowerCase());
    }

    // Filtro por Búsqueda
    if (state.busqueda.trim() !== '') {
      const q = state.busqueda.toLowerCase();
      items = items.filter(c =>
        (c.titulo && c.titulo.toLowerCase().includes(q)) ||
        (c.descripcion && c.descripcion.toLowerCase().includes(q)) ||
        (c.autor && c.autor.toLowerCase().includes(q)) ||
        (c.parroquia && c.parroquia.toLowerCase().includes(q))
      );
    }

    if (badgeContador) {
      badgeContador.textContent = `${items.length} ${items.length === 1 ? 'publicación' : 'publicaciones'}`;
    }

    if (items.length === 0) {
      contenedor.innerHTML = `
        <div class="bg-[#111633] border border-[#202854] rounded-3xl p-8 text-center space-y-4 col-span-full">
          <div class="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
            <i data-lucide="inbox" class="w-8 h-8"></i>
          </div>
          <h3 class="text-lg font-bold text-white">No hay publicaciones con estos filtros</h3>
          <p class="text-sm text-slate-400 max-w-md mx-auto">
            Sé el primero en aportar un video o comunicado de tu parroquia a través del botón superior.
          </p>
          <button onclick="window.abrirModalAporte()" class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition inline-flex items-center gap-2">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>Aportar Nuevo Video</span>
          </button>
        </div>`;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    contenedor.innerHTML = items.map(item => renderCard(item)).join('');
    if (window.lucide) window.lucide.createIcons();
  }

  function renderCard(item) {
    const isReel = item.tipo === 'reel';
    const isComunicado = item.tipo === 'comunicado';

    const platformBadge = {
      instagram: '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-500/40 flex items-center gap-1"><i data-lucide="camera" class="w-3 h-3"></i> Instagram</span>',
      tiktok: '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-950/80 text-pink-300 border border-pink-500/40 flex items-center gap-1"><i data-lucide="video" class="w-3 h-3"></i> TikTok</span>',
      youtube: '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950/80 text-red-300 border border-red-500/40 flex items-center gap-1"><i data-lucide="play-circle" class="w-3 h-3"></i> YouTube</span>',
      twitter: '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-950/80 text-sky-300 border border-sky-500/40 flex items-center gap-1"><i data-lucide="twitter" class="w-3 h-3"></i> X</span>',
      oficial: '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 flex items-center gap-1"><i data-lucide="shield-check" class="w-3 h-3 text-amber-400"></i> Comunicado Oficial</span>'
    }[item.plataforma] || '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">MIGATO</span>';

    const shareText = encodeURIComponent(
      `🐱 *MIGATO Monagas 2026*\n\n📢 *${item.titulo}*\n👤 Autor: ${item.autor} (${item.municipio} • ${item.parroquia || 'Monagas'})\n\n👉 Míralo aquí: ${window.location.origin}/noticias-migato/#${item.id}`
    );

    return `
      <article id="${item.id}" class="bg-[#111633] border ${item.destacado ? 'border-amber-500/40 shadow-lg shadow-amber-500/5' : 'border-[#202854]'} rounded-3xl overflow-hidden flex flex-col justify-between transition hover:border-slate-500">
        
        <div>
          <!-- Cabecera de Tarjeta -->
          <div class="p-4 border-b border-[#202854]/60 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-[#18204a] border border-white/10 flex items-center justify-center font-bold text-amber-400 text-sm shrink-0">
                ${item.autor ? item.autor.charAt(0).toUpperCase() : 'M'}
              </div>
              <div class="min-w-0">
                <span class="text-xs font-bold text-white block truncate leading-tight">${item.autor}</span>
                <span class="text-[11px] text-slate-400 font-mono block truncate">${item.municipio}${item.parroquia ? ' • ' + item.parroquia : ''}</span>
              </div>
            </div>
            ${platformBadge}
          </div>

          <!-- Portada / Fachada de Video o Banner -->
          <div id="video-box-${item.id}" class="relative bg-slate-950 overflow-hidden ${isReel ? 'aspect-[16/10] sm:aspect-[16/9]' : 'h-36 sm:h-44'} flex items-center justify-center group">
            <img src="${item.portada || '../assets/logo-migato.png'}" 
                 alt="${item.titulo}" 
                 class="w-full h-full object-cover transition duration-300 group-hover:scale-105 opacity-80"
                 loading="lazy">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>

            ${isReel ? `
              <!-- Botón Reproducir Bajo Demanda -->
              <button onclick="window.reproducirVideo('${item.id}')" 
                      class="absolute z-10 w-14 h-14 rounded-2xl bg-amber-500/90 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/30 transition transform hover:scale-110 active:scale-95 group-hover:bg-amber-400">
                <i data-lucide="play" class="w-7 h-7 fill-slate-950 ml-1"></i>
              </button>
              <span class="absolute bottom-2.5 left-3 z-10 text-[10px] font-mono font-bold bg-black/70 text-amber-300 px-2 py-0.5 rounded-md border border-white/10 backdrop-blur-xs">
                Toque para Reproducir
              </span>
            ` : `
              <div class="absolute bottom-2.5 left-3 z-10 flex items-center gap-1.5 text-xs text-amber-300 font-bold">
                <i data-lucide="file-text" class="w-4 h-4"></i>
                <span>Documento Institucional</span>
              </div>
            `}
          </div>

          <!-- Cuerpo de Contenido -->
          <div class="p-4 sm:p-5 space-y-2.5">
            <div class="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <i data-lucide="clock" class="w-3.5 h-3.5 text-slate-500"></i>
              <span>${item.fecha || 'Reciente'} ${item.hora ? '• ' + item.hora : ''}</span>
            </div>

            <h3 class="font-display font-bold text-base sm:text-lg text-white leading-snug">
              ${item.titulo}
            </h3>

            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
              ${item.descripcion}
            </p>

            ${item.etiquetas && item.etiquetas.length > 0 ? `
              <div class="flex flex-wrap gap-1.5 pt-1">
                ${item.etiquetas.map(t => `<span class="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#141b44] text-slate-400 border border-[#202854]">#${t}</span>`).join('')}
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Botones de Acción de Tarjeta -->
        <div class="p-4 bg-[#0d122e] border-t border-[#202854]/60 flex items-center justify-between gap-2">
          ${item.url ? `
            <a href="${item.url}" target="_blank" rel="noopener noreferrer" 
               class="px-3 py-1.5 bg-[#18204a] hover:bg-[#202854] text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-[#202854]">
              <span>Abrir en ${item.plataforma.toUpperCase()}</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5 text-slate-400"></i>
            </a>
          ` : '<div></div>'}

          <a href="https://api.whatsapp.com/send?text=${shareText}" target="_blank" rel="noopener noreferrer"
             class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95" 
             title="Compartir este video en tus grupos de WhatsApp">
            <i data-lucide="share-2" class="w-3.5 h-3.5"></i>
            <span>Compartir</span>
          </a>
        </div>

      </article>
    `;
  }

  // ==============================================================
  // 4. ENVÍO DE REPORTE COMUNITARIO (PARTICIPATIVO)
  // ==============================================================
  window.abrirModalAporte = function () {
    const m = document.getElementById('modalAporte');
    if (m) m.classList.remove('hidden');
  };

  window.cerrarModalAporte = function () {
    const m = document.getElementById('modalAporte');
    if (m) m.classList.add('hidden');
  };

  window.guardarAporteComunitario = function (e) {
    e.preventDefault();

    const url = document.getElementById('input-aporte-url').value.trim();
    const titulo = document.getElementById('input-aporte-titulo').value.trim();
    const autor = document.getElementById('input-aporte-autor').value.trim();
    const municipio = document.getElementById('input-aporte-municipio').value;
    const parroquia = document.getElementById('input-aporte-parroquia').value.trim();
    const plataforma = document.getElementById('input-aporte-plataforma').value;
    const descripcion = document.getElementById('input-aporte-descripcion').value.trim();

    const nuevoAporte = {
      id: 'aporte-' + Date.now(),
      tipo: plataforma === 'oficial' ? 'comunicado' : 'reel',
      plataforma: plataforma,
      titulo: titulo,
      autor: autor || 'Activista MIGATO',
      municipio: municipio || 'Maturín',
      parroquia: parroquia || 'Monagas',
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
      url: url,
      embedUrl: url,
      portada: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=600&q=80',
      descripcion: descripcion,
      estado: 'pendiente', // Requiere aprobación en Módulo 7
      destacado: false,
      etiquetas: ['Comunidad', municipio]
    };

    // Guardar en cola de pendientes
    let pendientes = [];
    try {
      pendientes = JSON.parse(localStorage.getItem(STORAGE_KEY_PENDIENTES) || '[]');
    } catch (err) {
      pendientes = [];
    }
    pendientes.unshift(nuevoAporte);
    localStorage.setItem(STORAGE_KEY_PENDIENTES, JSON.stringify(pendientes));

    // Notificación al usuario
    alert('✅ ¡Reporte recibido con éxito!\n\nTu video ha sido enviado a la Sala de Comunicaciones MIGATO para su verificación. Aparecerá en el muro público una vez aprobado.');

    document.getElementById('form-aporte-comunitario').reset();
    window.cerrarModalAporte();
  };

  // ==============================================================
  // 5. COPIAR ENLACE LISTO PARA WHATSAPP
  // ==============================================================
  window.copiarEnlaceWhatsApp = function () {
    const texto = `🐱 *SALA OFICIAL DE NOTICIAS & REELS • MIGATO MONAGAS 2026*\n\nConducción: José Gregorio "El Gato" Briceño.\nRevisa los últimos comunicados, videos de caminatas y denuncias en tu parroquia:\n\n👉 ${window.location.origin}/noticias-migato/`;
    navigator.clipboard.writeText(texto).then(() => {
      alert('📋 ¡Enlace copiado al portapapeles!\n\nPega este mensaje en los grupos de WhatsApp del partido.');
    }).catch(() => {
      prompt('Copia este enlace para fijar en WhatsApp:', `${window.location.origin}/noticias-migato/`);
    });
  };

  // ==============================================================
  // 6. EVENT LISTENERS Y FILTROS
  // ==============================================================
  function setupListeners() {
    // Filtros de Tipo
    document.querySelectorAll('.filter-tipo-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-tipo-btn').forEach(b => {
          b.classList.remove('bg-amber-500', 'text-slate-950', 'active', 'font-black');
          b.classList.add('bg-[#141b44]', 'text-slate-300', 'hover:text-white');
        });
        btn.classList.add('bg-amber-500', 'text-slate-950', 'active', 'font-black');
        btn.classList.remove('bg-[#141b44]', 'text-slate-300', 'hover:text-white');

        state.filtroTipo = btn.dataset.tipo;
        renderFeed();
      });
    });

    // Filtro Municipio
    const selectMun = document.getElementById('select-filtro-municipio');
    if (selectMun) {
      selectMun.addEventListener('change', (e) => {
        state.filtroMunicipio = e.target.value;
        renderFeed();
      });
    }

    // Buscador en Vivo
    const inputSearch = document.getElementById('input-busqueda-muro');
    if (inputSearch) {
      inputSearch.addEventListener('input', (e) => {
        state.busqueda = e.target.value;
        renderFeed();
      });
    }
  }

  // Exposición Global
  window.initMuro = initMuro;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMuro);
  } else {
    initMuro();
  }
})();
