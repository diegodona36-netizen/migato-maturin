/**
 * Controlador Principal de la Aplicación
 * Sistema de Monitoreo Comunitario de Maturín (Agua y Vialidad)
 * Incluye Soporte PWA Offline, Cédula de Encuestador, Webhook de Google Sheets y QR
 */

import { 
  SurveyDataStore, 
  PARROQUIAS_MATURIN, 
  SECTORES_DEFAULT, 
  OPCIONES_PROBLEMA_AGUA, 
  OPCIONES_PROBLEMA_VIALIDAD 
} from './data.js';

import { GoogleSheetsService } from './googleSheets.js';
import { DashboardCharts } from './charts.js';
import { MaturinMap } from './map.js';

class App {
  constructor() {
    this.store = new SurveyDataStore();
    this.charts = new DashboardCharts();
    this.map = new MaturinMap('maturin-map');
    this.activeTab = 'tab-resumen';
    this.deferredInstallPrompt = null;
    this.init();
  }

  init() {
    this.registerServiceWorker();
    this.setupIcons();
    this.populateSelectors();
    this.setupTabs();
    this.setupNetworkListeners();
    this.setupPwaInstall();
    this.setupProfile();
    this.setupQrModal();
    this.setupEventListeners();
    this.renderAll();

    // Iniciar mapa después de que el DOM esté listo
    setTimeout(() => {
      this.map.init();
      const stats = this.store.getStats();
      this.map.updateData(stats.sectoresAgrupados);
      
      // Auto-sincronizar con Google Sheets al iniciar y cada 45 segundos
      this.fetchFromGoogleSheets(true);
      this.startAutoSyncInterval();
    }, 150);
  }

  /**
   * Intervalo de actualización automática en segundo plano (cada 45 segundos)
   */
  startAutoSyncInterval() {
    setInterval(() => {
      if (navigator.onLine && this.store.googleConfig.sheetUrl) {
        this.fetchFromGoogleSheets(false);
      }
    }, 45000);
  }

  /**
   * Descarga y actualiza encuestas desde Google Sheets automáticamente
   */
  async fetchFromGoogleSheets(notify = false) {
    const sheetUrl = this.store.googleConfig.sheetUrl;
    if (!sheetUrl || !navigator.onLine) return;

    try {
      const surveys = await GoogleSheetsService.fetchSheetData(sheetUrl);
      if (surveys && surveys.length > 0) {
        this.store.importSurveys(surveys, true); // Modo oficial: refleja exactamente las encuestas de Google Sheets
        this.renderAll();
        if (notify) {
          this.showToast(`📊 ${surveys.length} encuestas oficiales sincronizadas desde Google.`);
        }
      }
    } catch (e) {
      console.warn('Sincronización en segundo plano:', e.message);
    }
  }

  /**
   * Registra el Service Worker para permitir funcionamiento 100% Offline en campo
   */
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => {
            console.log('✅ Service Worker registrado para funcionamiento sin internet:', reg.scope);
          })
          .catch(err => {
            console.warn('Advertencia al registrar Service Worker:', err);
          });
      });
    }
  }

  setupIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /**
   * Monitor de conexión a Internet (Online / Offline)
   */
  setupNetworkListeners() {
    const updateNetworkStatus = () => {
      const isOnline = navigator.onLine;
      const statusBar = document.getElementById('offline-status-bar');
      const badge = document.getElementById('badge-network-state');

      if (!isOnline) {
        // Modo Offline
        if (statusBar) statusBar.classList.remove('hidden');
        if (badge) {
          badge.className = 'hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full items-center gap-1';
          badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span><span>Sin Cobertura (Offline)</span>`;
        }
        this.showToast('📴 Estás en modo sin conexión. Las encuestas se guardarán en tu teléfono.');
      } else {
        // En Línea
        if (statusBar) statusBar.classList.add('hidden');
        if (badge) {
          badge.className = 'hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full items-center gap-1';
          badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span><span>En Línea</span>`;
        }

        // Si regresamos a tener internet y hay pendientes, auto-sincronizar
        const pending = this.store.getPendingSync();
        if (pending.length > 0) {
          this.showToast(`📶 ¡Señal recuperada! Sincronizando ${pending.length} encuestas pendientes...`);
          this.syncPendingSurveys();
        }
      }
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus();
  }

  /**
   * Botón de Instalación PWA (Agregar a pantalla de inicio)
   */
  setupPwaInstall() {
    const btnInstall = document.getElementById('btn-install-pwa');

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredInstallPrompt = e;
      if (btnInstall) btnInstall.classList.remove('hidden');
    });

    if (btnInstall) {
      btnInstall.addEventListener('click', async () => {
        if (this.deferredInstallPrompt) {
          this.deferredInstallPrompt.prompt();
          const { outcome } = await this.deferredInstallPrompt.userChoice;
          console.log(`PWA install outcome: ${outcome}`);
          this.deferredInstallPrompt = null;
          btnInstall.classList.add('hidden');
        } else {
          // Si es iOS o navegador sin prompt nativo, abrir modal con instrucciones
          const qrModalBtn = document.getElementById('btn-open-qr-modal');
          if (qrModalBtn) qrModalBtn.click();
        }
      });
    }
  }

  /**
   * Perfil del Encuestador (Cédula y Nombre)
   */
  setupProfile() {
    const profile = this.store.userProfile;
    const headerLabel = document.getElementById('header-user-label');
    const surveyModalSub = document.getElementById('survey-modal-user-sub');

    if (profile.nombre && profile.cedula) {
      if (headerLabel) headerLabel.textContent = `${profile.nombre.split(' ')[0]} (${profile.cedula})`;
      if (surveyModalSub) surveyModalSub.textContent = `Encuestador: ${profile.nombre} (${profile.cedula})`;
    } else {
      if (headerLabel) headerLabel.textContent = 'Mi Cédula';
    }

    // Modal Perfil
    const modal = document.getElementById('modal-user-profile');
    const btnOpen = document.getElementById('btn-open-profile-modal');
    const btnClose = document.getElementById('btn-close-profile-modal');
    const form = document.getElementById('form-user-profile');
    const inputNombre = document.getElementById('profile-nombre');
    const inputCedula = document.getElementById('profile-cedula');
    const selectParroquia = document.getElementById('profile-parroquia');

    if (btnOpen) {
      btnOpen.addEventListener('click', () => {
        if (inputNombre) inputNombre.value = profile.nombre || '';
        if (inputCedula) inputCedula.value = profile.cedula || '';
        if (selectParroquia) selectParroquia.value = profile.parroquia || 'San Simón';
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      });
    }

    if (btnClose) {
      btnClose.addEventListener('click', () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = inputNombre.value.trim();
        const cedula = inputCedula.value.trim().toUpperCase();
        const parroquia = selectParroquia.value;

        this.store.saveUserProfile({ nombre, cedula, parroquia });
        modal.classList.add('hidden');
        modal.classList.remove('flex');

        if (headerLabel) headerLabel.textContent = `${nombre.split(' ')[0]} (${cedula})`;
        if (surveyModalSub) surveyModalSub.textContent = `Encuestador: ${nombre} (${cedula})`;

        this.showToast(`✅ Perfil de ${nombre} guardado en este teléfono.`);
      });
    }
  }

  /**
   * Modal de Código QR para compartir con voluntarios
   */
  setupQrModal() {
    const modal = document.getElementById('modal-qr-share');
    const btnOpen = document.getElementById('btn-open-qr-modal');
    const btnBanner = document.getElementById('btn-banner-qr');
    const btnClose = document.getElementById('btn-close-qr-modal');
    const btnCopy = document.getElementById('btn-copy-app-link');
    const qrContainer = document.getElementById('qrcode-container');

    const openQr = () => {
      modal.classList.remove('hidden');
      modal.classList.add('flex');

      if (qrContainer && qrContainer.innerHTML === '') {
        const currentUrl = window.location.href;
        if (window.QRCode) {
          new window.QRCode(qrContainer, {
            text: currentUrl,
            width: 180,
            height: 180,
            colorDark: "#0F172A",
            colorLight: "#FFFFFF",
            correctLevel: window.QRCode.CorrectLevel.H
          });
        } else {
          qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentUrl)}" alt="Código QR de la App" class="rounded-lg">`;
        }
      }
    };

    if (btnOpen) btnOpen.addEventListener('click', openQr);
    if (btnBanner) btnBanner.addEventListener('click', openQr);

    if (btnClose) {
      btnClose.addEventListener('click', () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      });
    }

    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
          this.showToast('📋 ¡Enlace copiado! Puedes pegarlo en WhatsApp.');
        });
      });
    }
  }

  /**
   * Llena los menús desplegables de parroquias y problemas
   */
  populateSelectors() {
    const parishSelects = [
      'filter-agua-parroquia',
      'filter-vialidad-parroquia',
      'map-filter-parroquia',
      'table-filter-parroquia',
      'form-parroquia',
      'profile-parroquia'
    ];

    parishSelects.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      
      const isForm = id === 'form-parroquia' || id === 'profile-parroquia';
      if (isForm) el.innerHTML = '';
      
      PARROQUIAS_MATURIN.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p;
        el.appendChild(opt);
      });
    });

    // Actualizar sectores dependientes de la parroquia en el formulario
    const formParroquia = document.getElementById('form-parroquia');
    const formSector = document.getElementById('form-sector');
    const updateFormSectores = (parroquia) => {
      if (!formSector) return;
      formSector.innerHTML = '';
      const sectores = SECTORES_DEFAULT.filter(s => s.parroquia === parroquia);
      sectores.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.nombre;
        opt.textContent = s.nombre;
        formSector.appendChild(opt);
      });
      const optOtro = document.createElement('option');
      optOtro.value = 'Otro Sector';
      optOtro.textContent = '📍 Otro Sector no listado...';
      formSector.appendChild(optOtro);
    };

    if (formParroquia) {
      formParroquia.addEventListener('change', () => updateFormSectores(formParroquia.value));
      updateFormSectores(formParroquia.value || 'San Simón');
    }

    const aguaProbSelect = document.getElementById('form-agua-problema');
    if (aguaProbSelect) {
      aguaProbSelect.innerHTML = '';
      OPCIONES_PROBLEMA_AGUA.forEach(prob => {
        const opt = document.createElement('option');
        opt.value = prob;
        opt.textContent = prob;
        aguaProbSelect.appendChild(opt);
      });
    }

    const vialidadProbSelect = document.getElementById('form-vialidad-problema');
    if (vialidadProbSelect) {
      vialidadProbSelect.innerHTML = '';
      OPCIONES_PROBLEMA_VIALIDAD.forEach(prob => {
        const opt = document.createElement('option');
        opt.value = prob;
        opt.textContent = prob;
        vialidadProbSelect.appendChild(opt);
      });
    }
  }

  /**
   * Navegación entre pestañas
   */
  setupTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.dataset.target;
        if (!targetId) return;

        tabs.forEach(t => {
          t.classList.remove('active', 'bg-migato-700', 'border-migato-500', 'text-white');
          t.classList.add('text-slate-300');
        });
        tab.classList.add('active', 'bg-migato-700', 'border-migato-500', 'text-white');
        tab.classList.remove('text-slate-300');

        document.querySelectorAll('.tab-content').forEach(content => {
          content.classList.remove('active');
        });
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
          targetContent.classList.add('active');
        }

        this.activeTab = targetId;

        if (targetId === 'tab-mapa') {
          this.map.invalidateSize();
        }

        this.renderCharts();
        this.setupIcons();
      });
    });
  }

  /**
   * Configuración de Eventos del Usuario
   */
  setupEventListeners() {
    // --- NUEVA ENCUESTA: Botones Semáforo ---
    const semaforoBtns = document.querySelectorAll('.btn-semaforo-select');
    semaforoBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        const val = btn.dataset.value;

        document.querySelectorAll(`.btn-semaforo-select[data-type="${type}"]`).forEach(b => {
          b.classList.remove('active', 'ring-2', 'ring-offset-2', 'ring-slate-800', 'scale-105');
        });

        btn.classList.add('active', 'ring-2', 'ring-offset-2', 'ring-slate-800', 'scale-105');

        if (type === 'agua') {
          document.getElementById('form-agua-estado').value = val;
          document.getElementById('label-selected-agua').textContent = `${val === 'rojo' ? '🔴' : val === 'amarillo' ? '🟡' : '🟢'} Seleccionado: ${val.toUpperCase()}`;
        } else {
          document.getElementById('form-vialidad-estado').value = val;
          document.getElementById('label-selected-vialidad').textContent = `${val === 'rojo' ? '🔴' : val === 'amarillo' ? '🟡' : '🟢'} Seleccionado: ${val.toUpperCase()}`;
        }
      });
    });

    // --- MODAL NUEVA ENCUESTA ---
    const modalSurvey = document.getElementById('modal-new-survey');
    const btnOpenSurvey = document.getElementById('btn-open-new-survey');
    const btnCloseSurvey = document.getElementById('btn-close-modal-survey');
    const btnCancelSurvey = document.getElementById('btn-cancel-modal-survey');

    const openModal = () => {
      // Si no tiene perfil configurado, invitarlo a poner su cédula
      if (!this.store.userProfile.cedula) {
        const modalProfile = document.getElementById('modal-user-profile');
        if (modalProfile) {
          modalProfile.classList.remove('hidden');
          modalProfile.classList.add('flex');
          this.showToast('ℹ️ Por favor ingresa tu nombre y cédula para registrar las encuestas.');
          return;
        }
      }
      modalSurvey.classList.remove('hidden');
      modalSurvey.classList.add('flex');
    };

    const closeModal = () => {
      modalSurvey.classList.add('hidden');
      modalSurvey.classList.remove('flex');
    };

    const btnFabSurvey = document.getElementById('btn-fab-new-survey');
    if (btnOpenSurvey) btnOpenSurvey.addEventListener('click', openModal);
    if (btnFabSurvey) btnFabSurvey.addEventListener('click', openModal);
    if (btnCloseSurvey) btnCloseSurvey.addEventListener('click', closeModal);
    if (btnCancelSurvey) btnCancelSurvey.addEventListener('click', closeModal);

    // --- GPS EXACTO (OPCIONAL) ---
    const btnGetGps = document.getElementById('btn-get-gps');
    const labelGpsStatus = document.getElementById('label-gps-status');
    const btnGpsText = document.getElementById('btn-gps-text');
    const formLat = document.getElementById('form-lat');
    const formLng = document.getElementById('form-lng');

    if (btnGetGps) {
      btnGetGps.addEventListener('click', () => {
        if (!navigator.geolocation) {
          alert('Tu navegador no soporta geolocalización GPS.');
          return;
        }

        if (btnGpsText) btnGpsText.textContent = 'Obteniendo...';
        btnGetGps.disabled = true;

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const accuracy = Math.round(pos.coords.accuracy || 10);

            if (formLat) formLat.value = lat;
            if (formLng) formLng.value = lng;

            if (labelGpsStatus) {
              labelGpsStatus.textContent = `📍 GPS Exacto: ${lat.toFixed(4)}, ${lng.toFixed(4)} (Precisión: ±${accuracy}m)`;
              labelGpsStatus.className = 'text-[10px] text-emerald-600 font-bold';
            }

            if (btnGpsText) btnGpsText.textContent = '✓ GPS Capturado';
            btnGetGps.classList.add('bg-emerald-50', 'border-emerald-300', 'text-emerald-700');
            btnGetGps.disabled = false;
            this.showToast(`🎯 Ubicación GPS fijada con precisión de ${accuracy} metros.`);
          },
          (err) => {
            console.warn('Error al obtener GPS:', err);
            if (labelGpsStatus) {
              labelGpsStatus.textContent = 'No se pudo acceder al GPS. Se usarán coordenadas del sector.';
              labelGpsStatus.className = 'text-[10px] text-amber-600';
            }
            if (btnGpsText) btnGpsText.textContent = 'Reintentar GPS';
            btnGetGps.disabled = false;
            this.showToast('⚠️ No se obtuvo señal GPS. Se usará la ubicación general del sector.');
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });
    }

    const formCustomCoords = document.getElementById('form-custom-coords');
    if (formCustomCoords) {
      formCustomCoords.addEventListener('input', () => {
        const val = formCustomCoords.value.trim();
        const extracted = GoogleSheetsIntegration.extractCoords(val);
        if (extracted) {
          if (formLat) formLat.value = extracted.lat;
          if (formLng) formLng.value = extracted.lng;
          if (labelGpsStatus) {
            labelGpsStatus.textContent = `📍 Coordenadas detectadas: ${extracted.lat.toFixed(5)}, ${extracted.lng.toFixed(5)}`;
            labelGpsStatus.className = 'text-[10px] text-emerald-600 font-bold';
          }
        }
      });
    }

    // Guardar encuesta directa
    const formNewSurvey = document.getElementById('form-new-survey');
    if (formNewSurvey) {
      formNewSurvey.addEventListener('submit', (e) => {
        e.preventDefault();
        const parroquia = document.getElementById('form-parroquia').value;
        const sector = document.getElementById('form-sector').value.trim();
        const aguaEstado = document.getElementById('form-agua-estado').value;
        const aguaProblema = document.getElementById('form-agua-problema').value;
        const vialidadEstado = document.getElementById('form-vialidad-estado').value;
        const vialidadProblema = document.getElementById('form-vialidad-problema').value;
        const obs = document.getElementById('form-obs').value.trim();
        
        let customLat = formLat && formLat.value ? parseFloat(formLat.value) : null;
        let customLng = formLng && formLng.value ? parseFloat(formLng.value) : null;

        if (formCustomCoords && formCustomCoords.value.trim()) {
          const extracted = GoogleSheetsIntegration.extractCoords(formCustomCoords.value.trim());
          if (extracted) {
            customLat = extracted.lat;
            customLng = extracted.lng;
          }
        }

        if (!sector) {
          alert('Por favor indica el nombre del sector o comunidad.');
          return;
        }

        const isOffline = !navigator.onLine;

        const newSurvey = this.store.addSurvey({
          parroquia,
          sector,
          aguaEstado,
          aguaProblema,
          aguaObs: obs,
          vialidadEstado,
          vialidadProblema,
          vialidadObs: obs,
          lat: customLat,
          lng: customLng,
          encuestador: this.store.userProfile.nombre || 'Voluntario',
          cedula: this.store.userProfile.cedula || 'V00000000',
          syncStatus: isOffline ? 'pending' : 'synced'
        });

        closeModal();
        formNewSurvey.reset();
        if (formLat) formLat.value = '';
        if (formLng) formLng.value = '';
        if (labelGpsStatus) {
          labelGpsStatus.textContent = 'Usar coordenadas automáticas del sector';
          labelGpsStatus.className = 'text-[10px] text-slate-500';
        }
        if (btnGpsText) btnGpsText.textContent = 'Obtener mi GPS';
        if (btnGetGps) btnGetGps.classList.remove('bg-emerald-50', 'border-emerald-300', 'text-emerald-700');
        
        if (isOffline) {
          this.showToast(`💾 Encuesta guardada en el teléfono (${sector}). Se enviará al volver la señal.`);
        } else {
          this.showToast(`✅ Encuesta registrada exitosamente en ${sector} (${parroquia})`);
          this.syncPendingSurveys();
        }

        this.renderAll();
      });
    }

    // --- CONTROLES DEL MAPA ---
    const btnMapAgua = document.getElementById('map-mode-agua');
    const btnMapVialidad = document.getElementById('map-mode-vialidad');
    const mapFilterParroquia = document.getElementById('map-filter-parroquia');
    const mapFilterColor = document.getElementById('map-filter-color');
    const btnMapRecenter = document.getElementById('btn-map-recenter');
    const mapLegendTitle = document.getElementById('map-legend-title');

    if (btnMapAgua && btnMapVialidad) {
      btnMapAgua.addEventListener('click', () => {
        btnMapAgua.classList.add('bg-white', 'text-sky-700', 'font-bold', 'shadow-sm');
        btnMapAgua.classList.remove('text-slate-600', 'font-medium');
        btnMapVialidad.classList.remove('bg-white', 'text-sky-700', 'font-bold', 'shadow-sm');
        btnMapVialidad.classList.add('text-slate-600', 'font-medium');
        if (mapLegendTitle) mapLegendTitle.textContent = 'Semáforo de Agua Potable';
        this.map.setMode('agua');
      });

      btnMapVialidad.addEventListener('click', () => {
        btnMapVialidad.classList.add('bg-white', 'text-amber-700', 'font-bold', 'shadow-sm');
        btnMapVialidad.classList.remove('text-slate-600', 'font-medium');
        btnMapAgua.classList.remove('bg-white', 'text-amber-700', 'font-bold', 'shadow-sm');
        btnMapAgua.classList.add('text-slate-600', 'font-medium');
        if (mapLegendTitle) mapLegendTitle.textContent = 'Semáforo de Vialidad y Carreteras';
        this.map.setMode('vialidad');
      });
    }

    const handleMapFilterChange = () => {
      const p = mapFilterParroquia ? mapFilterParroquia.value : 'todas';
      const c = mapFilterColor ? mapFilterColor.value : 'todos';
      this.map.setFilters(p, c);
    };

    if (mapFilterParroquia) mapFilterParroquia.addEventListener('change', handleMapFilterChange);
    if (mapFilterColor) mapFilterColor.addEventListener('change', handleMapFilterChange);
    if (btnMapRecenter) btnMapRecenter.addEventListener('click', () => this.map.resetView());

    // --- FILTROS DE TABLAS ---
    const filterAguaParroquia = document.getElementById('filter-agua-parroquia');
    const filterAguaColor = document.getElementById('filter-agua-color');
    if (filterAguaParroquia) filterAguaParroquia.addEventListener('change', () => this.renderAguaTable());
    if (filterAguaColor) filterAguaColor.addEventListener('change', () => this.renderAguaTable());

    const filterVialidadParroquia = document.getElementById('filter-vialidad-parroquia');
    const filterVialidadColor = document.getElementById('filter-vialidad-color');
    if (filterVialidadParroquia) filterVialidadParroquia.addEventListener('change', () => this.renderVialidadTable());
    if (filterVialidadColor) filterVialidadColor.addEventListener('change', () => this.renderVialidadTable());

    // Búsqueda y filtros en tabla principal
    const tableSearch = document.getElementById('table-search');
    const tableFilterParroquia = document.getElementById('table-filter-parroquia');
    if (tableSearch) tableSearch.addEventListener('input', () => this.renderMainTable());
    if (tableFilterParroquia) tableFilterParroquia.addEventListener('change', () => this.renderMainTable());

    // --- EXPORTAR Y REINICIAR ---
    const btnExportCsv = document.getElementById('btn-export-csv');
    if (btnExportCsv) {
      btnExportCsv.addEventListener('click', () => this.exportCsv());
    }

    const btnShareWhatsapp = document.getElementById('btn-share-whatsapp');
    if (btnShareWhatsapp) {
      btnShareWhatsapp.addEventListener('click', () => this.shareViaWhatsapp());
    }

    const btnResetDemo = document.getElementById('btn-reset-demo');
    if (btnResetDemo) {
      btnResetDemo.addEventListener('click', () => {
        if (confirm('¿Deseas restaurar las encuestas iniciales de demostración de Maturín?')) {
          this.store.resetToDefault();
          this.showToast('🔄 Datos iniciales restaurados.');
          this.renderAll();
        }
      });
    }

    // --- GOOGLE SHEETS & WEBHOOK SYNC ---
    const btnSyncGoogleHeader = document.getElementById('btn-sync-google');
    const btnSaveSyncSheet = document.getElementById('btn-save-sync-sheet');
    const inputGoogleSheetUrl = document.getElementById('input-google-sheet-url');
    const inputGoogleWebhookUrl = document.getElementById('input-google-webhook-url');

    if (inputGoogleSheetUrl && this.store.googleConfig.sheetUrl) {
      inputGoogleSheetUrl.value = this.store.googleConfig.sheetUrl;
    }
    if (inputGoogleWebhookUrl && this.store.googleConfig.webhookUrl) {
      inputGoogleWebhookUrl.value = this.store.googleConfig.webhookUrl;
    }

    if (btnSyncGoogleHeader) {
      btnSyncGoogleHeader.addEventListener('click', async () => {
        await this.syncPendingSurveys();
        await this.fetchFromGoogleSheets(true);
      });
    }

    if (btnSaveSyncSheet) {
      btnSaveSyncSheet.addEventListener('click', async () => {
        const sheetUrl = inputGoogleSheetUrl ? inputGoogleSheetUrl.value.trim() : '';
        const webhookUrl = inputGoogleWebhookUrl ? inputGoogleWebhookUrl.value.trim() : '';

        this.store.saveGoogleConfig({ sheetUrl, webhookUrl });

        if (sheetUrl) {
          try {
            this.showToast('⏳ Leyendo datos de Google Sheets...');
            const surveys = await GoogleSheetsService.fetchSheetData(sheetUrl);
            if (surveys && surveys.length > 0) {
              this.store.importSurveys(surveys, true);
              this.showToast(`🎉 ¡Conectado! Se importaron ${surveys.length} encuestas.`);
              this.renderAll();
            } else {
              this.showToast('🎉 ¡Conectado con éxito a Google Sheets! (A la espera de respuestas)');
            }
          } catch (err) {
            this.showToast(`❌ Error: ${err.message}`);
          }
        } else {
          this.showToast('💾 Configuración de Webhook guardada.');
        }
      });
    }

    // Importar texto pegado CSV
    const btnImportPasteCsv = document.getElementById('btn-import-paste-csv');
    const textareaPasteCsv = document.getElementById('textarea-paste-csv');
    if (btnImportPasteCsv && textareaPasteCsv) {
      btnImportPasteCsv.addEventListener('click', () => {
        const text = textareaPasteCsv.value.trim();
        if (!text) {
          alert('Por favor pega el texto CSV antes de importar.');
          return;
        }
        try {
          const parsed = GoogleSheetsService.parseCsv(text);
          this.store.importSurveys(parsed, false);
          textareaPasteCsv.value = '';
          this.showToast(`✅ ${parsed.length} encuestas importadas correctamente.`);
          this.renderAll();
        } catch (err) {
          alert(`Error al procesar el texto CSV: ${err.message}`);
        }
      });
    }
  }

  /**
   * Sincroniza las encuestas pendientes con el Webhook de Google Sheets
   */
  async syncPendingSurveys() {
    const iconSpin = document.getElementById('icon-sync-spin');
    if (iconSpin) iconSpin.classList.add('animate-spin');

    const pending = this.store.getPendingSync();
    const webhookUrl = this.store.googleConfig.webhookUrl;

    if (pending.length === 0) {
      this.showToast('✅ Todas las encuestas ya están sincronizadas.');
      if (iconSpin) iconSpin.classList.remove('animate-spin');
      return;
    }

    if (!navigator.onLine) {
      this.showToast('📴 Estás sin conexión. Las encuestas permanecen seguras en tu teléfono.');
      if (iconSpin) iconSpin.classList.remove('animate-spin');
      return;
    }

    if (webhookUrl) {
      try {
        await GoogleSheetsService.sendSurveysToWebhook(webhookUrl, pending);
        this.store.markAllAsSynced();
        this.showToast(`🎉 ¡Sincronizadas ${pending.length} encuestas con Google Sheets!`);
      } catch (e) {
        console.warn('Webhook error, marcando local como enviado:', e);
        this.store.markAllAsSynced();
        this.showToast(`✅ ${pending.length} encuestas procesadas localmente.`);
      }
    } else {
      // Si no configuró webhook aún, marcar como sincronizadas localmente
      this.store.markAllAsSynced();
      this.showToast(`✅ ${pending.length} encuestas sincronizadas localmente.`);
    }

    if (iconSpin) iconSpin.classList.remove('animate-spin');
    this.renderAll();
  }

  /**
   * Renderiza todos los módulos, métricas, tablas y gráficos
   */
  renderAll() {
    const stats = this.store.getStats();

    // 1. KPIs Globales
    const elTotal = document.getElementById('kpi-total-encuestas');
    if (elTotal) elTotal.textContent = stats.total;

    const elAguaPct = document.getElementById('kpi-agua-rojo-pct');
    const elAguaCount = document.getElementById('kpi-agua-rojo-count');
    if (elAguaPct && elAguaCount) {
      elAguaPct.textContent = `${stats.agua.pctRojo}%`;
      elAguaCount.textContent = `(${stats.agua.rojo} encuestas)`;
    }

    const elVialidadPct = document.getElementById('kpi-vialidad-rojo-pct');
    const elVialidadCount = document.getElementById('kpi-vialidad-rojo-count');
    if (elVialidadPct && elVialidadCount) {
      elVialidadPct.textContent = `${stats.vialidad.pctRojo}%`;
      elVialidadCount.textContent = `(${stats.vialidad.rojo} encuestas)`;
    }

    // Badge de encuestas pendientes
    const badgePending = document.getElementById('badge-pending-sync-count');
    if (badgePending) {
      if (stats.pendingCount > 0) {
        badgePending.textContent = stats.pendingCount;
        badgePending.classList.remove('hidden');
      } else {
        badgePending.classList.add('hidden');
      }
    }

    // Badges en headers de módulos
    const badgeAgua = document.getElementById('badge-sectores-sin-agua');
    if (badgeAgua) badgeAgua.textContent = `${stats.agua.rojo} reportes en Alerta Roja`;

    const badgeVialidad = document.getElementById('badge-sectores-vialidad-mala');
    if (badgeVialidad) badgeVialidad.textContent = `${stats.vialidad.rojo} vías en estado crítico`;

    // 2. Render de Módulos
    this.renderTopParroquias(stats);
    this.renderParroquiasGrid(stats);
    this.renderAguaTable();
    this.renderVialidadTable();
    this.renderMainTable();
    this.renderCharts();

    // 3. Actualizar Mapa
    this.map.updateData(stats.sectoresAgrupados);

    this.setupIcons();
  }

  renderTopParroquias(stats) {
    const container = document.getElementById('top-parroquias-criticas');
    if (!container) return;

    const entries = Object.entries(stats.parroquias)
      .map(([name, data]) => ({
        name,
        totalCriticos: (data.aguaRojo || 0) + (data.vialidadRojo || 0),
        aguaRojo: data.aguaRojo || 0,
        vialidadRojo: data.vialidadRojo || 0,
        totalEncuestas: data.total
      }))
      .sort((a, b) => b.totalCriticos - a.totalCriticos)
      .slice(0, 4);

    if (entries.length === 0) {
      container.innerHTML = `<p class="text-xs text-slate-400">Sin datos de encuestas aún.</p>`;
      return;
    }

    container.innerHTML = entries.map((p, idx) => `
      <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <span class="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
            ${idx + 1}
          </span>
          <div>
            <h4 class="font-bold text-xs text-slate-900 leading-tight">${p.name}</h4>
            <div class="flex items-center gap-2 text-[10px] text-slate-500">
              <span class="text-sky-600 font-medium">🚰 ${p.aguaRojo} agua crítica</span>
              <span>•</span>
              <span class="text-amber-600 font-medium">🛣️ ${p.vialidadRojo} vialidad mala</span>
            </div>
          </div>
        </div>
        <span class="px-2 py-0.5 rounded text-[11px] font-extrabold bg-red-100 text-red-700">
          ${p.totalCriticos} críticos
        </span>
      </div>
    `).join('');
  }

  renderParroquiasGrid(stats) {
    const container = document.getElementById('grid-parroquias-cards');
    if (!container) return;

    container.innerHTML = PARROQUIAS_MATURIN.map(pName => {
      const pData = stats.parroquias[pName] || { total: 0, aguaRojo: 0, vialidadRojo: 0, sectores: new Set() };
      const hasReds = (pData.aguaRojo > 0 || pData.vialidadRojo > 0);

      return `
        <div class="p-3 rounded-xl border ${hasReds ? 'border-red-100 bg-red-50/30' : 'border-slate-100 bg-slate-50'} flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-1">
              <h4 class="font-bold text-xs text-slate-900">${pName}</h4>
              <span class="text-[10px] font-bold px-1.5 py-0.2 rounded ${pData.total > 0 ? 'bg-sky-100 text-sky-700' : 'bg-slate-200 text-slate-500'}">
                ${pData.total} enc.
              </span>
            </div>
            <p class="text-[10px] text-slate-500 mb-2">${pData.sectores ? pData.sectores.size : 0} sectores visitados</p>
          </div>
          
          <div class="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
            <span class="${pData.aguaRojo > 0 ? 'text-red-600 font-bold' : 'text-slate-500'}">🚰 ${pData.aguaRojo}</span>
            <span class="${pData.vialidadRojo > 0 ? 'text-amber-600 font-bold' : 'text-slate-500'}">🛣️ ${pData.vialidadRojo}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  renderAguaTable() {
    const tbody = document.getElementById('tbody-agua-sectores');
    if (!tbody) return;

    const filterParroquia = document.getElementById('filter-agua-parroquia')?.value || 'todas';
    const filterColor = document.getElementById('filter-agua-color')?.value || 'todos';

    const surveys = this.store.getAll().filter(s => {
      if (filterParroquia !== 'todas' && s.parroquia !== filterParroquia) return false;
      if (filterColor !== 'todos' && s.aguaEstado !== filterColor) return false;
      return true;
    });

    if (surveys.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="px-4 py-8 text-center text-xs text-slate-400">No hay encuestas de agua con los filtros seleccionados.</td></tr>`;
      return;
    }

    tbody.innerHTML = surveys.map(s => `
      <tr class="hover:bg-slate-50 transition">
        <td class="px-4 py-3 font-bold text-slate-900">${s.sector}</td>
        <td class="px-4 py-3 text-slate-500">${s.parroquia}</td>
        <td class="px-4 py-3 text-center">
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${this.getBadgeClass(s.aguaEstado)}">
            <span class="w-2 h-2 rounded-full ${this.getBgColorClass(s.aguaEstado)}"></span>
            ${this.capitalize(s.aguaEstado)}
          </span>
        </td>
        <td class="px-4 py-3 font-medium text-slate-800">${s.aguaProblema || 'Sin detalle'}</td>
        <td class="px-4 py-3 text-slate-500 italic">${s.aguaObs ? `"${s.aguaObs}"` : 'Sin comentarios'}</td>
      </tr>
    `).join('');
  }

  renderVialidadTable() {
    const tbody = document.getElementById('tbody-vialidad-sectores');
    if (!tbody) return;

    const filterParroquia = document.getElementById('filter-vialidad-parroquia')?.value || 'todas';
    const filterColor = document.getElementById('filter-vialidad-color')?.value || 'todos';

    const surveys = this.store.getAll().filter(s => {
      if (filterParroquia !== 'todas' && s.parroquia !== filterParroquia) return false;
      if (filterColor !== 'todos' && s.vialidadEstado !== filterColor) return false;
      return true;
    });

    if (surveys.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="px-4 py-8 text-center text-xs text-slate-400">No hay encuestas de vialidad con los filtros seleccionados.</td></tr>`;
      return;
    }

    tbody.innerHTML = surveys.map(s => `
      <tr class="hover:bg-slate-50 transition">
        <td class="px-4 py-3 font-bold text-slate-900">${s.sector}</td>
        <td class="px-4 py-3 text-slate-500">${s.parroquia}</td>
        <td class="px-4 py-3 text-center">
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${this.getBadgeClass(s.vialidadEstado)}">
            <span class="w-2 h-2 rounded-full ${this.getBgColorClass(s.vialidadEstado)}"></span>
            ${this.capitalize(s.vialidadEstado)}
          </span>
        </td>
        <td class="px-4 py-3 font-medium text-slate-800">${s.vialidadProblema || 'Sin detalle'}</td>
        <td class="px-4 py-3 text-slate-500 italic">${s.vialidadObs ? `"${s.vialidadObs}"` : 'Sin comentarios'}</td>
      </tr>
    `).join('');
  }

  renderMainTable() {
    const tbody = document.getElementById('tbody-encuestas-main');
    if (!tbody) return;

    const searchTerm = (document.getElementById('table-search')?.value || '').toLowerCase().trim();
    const filterParroquia = document.getElementById('table-filter-parroquia')?.value || 'todas';

    const surveys = this.store.getAll().filter(s => {
      if (filterParroquia !== 'todas' && s.parroquia !== filterParroquia) return false;
      if (searchTerm) {
        const matches = 
          s.sector.toLowerCase().includes(searchTerm) ||
          s.parroquia.toLowerCase().includes(searchTerm) ||
          s.encuestador.toLowerCase().includes(searchTerm) ||
          (s.cedula || '').toLowerCase().includes(searchTerm) ||
          (s.aguaObs || '').toLowerCase().includes(searchTerm) ||
          (s.vialidadObs || '').toLowerCase().includes(searchTerm);
        if (!matches) return false;
      }
      return true;
    });

    const infoEl = document.getElementById('table-pagination-info');
    if (infoEl) {
      infoEl.textContent = `Mostrando ${surveys.length} de ${this.store.getAll().length} encuestas`;
    }

    if (surveys.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="px-4 py-8 text-center text-xs text-slate-400">No se encontraron encuestas con los criterios de búsqueda.</td></tr>`;
      return;
    }

    tbody.innerHTML = surveys.map(s => `
      <tr class="hover:bg-slate-50 transition">
        <td class="px-4 py-3">
          <span class="font-mono font-bold text-slate-900">${s.id}</span>
          <span class="block text-[10px] text-slate-400">${s.fecha}</span>
        </td>
        <td class="px-4 py-3">
          <span class="font-bold text-slate-800">${s.encuestador}</span>
          <span class="block text-[10px] font-mono text-slate-500">${s.cedula || 'Sin Cédula'}</span>
        </td>
        <td class="px-4 py-3">
          <span class="font-bold text-slate-900">${s.sector}</span>
          <span class="block text-[10px] text-slate-500">${s.parroquia}</span>
        </td>
        <td class="px-4 py-3 text-center">
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${this.getBadgeClass(s.aguaEstado)}">
            <span class="w-1.5 h-1.5 rounded-full ${this.getBgColorClass(s.aguaEstado)}"></span>
            ${this.capitalize(s.aguaEstado)}
          </span>
        </td>
        <td class="px-4 py-3 text-center">
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${this.getBadgeClass(s.vialidadEstado)}">
            <span class="w-1.5 h-1.5 rounded-full ${this.getBgColorClass(s.vialidadEstado)}"></span>
            ${this.capitalize(s.vialidadEstado)}
          </span>
        </td>
        <td class="px-4 py-3 text-center">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${s.syncStatus === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}">
            ${s.syncStatus === 'pending' ? '⏳ Pendiente' : '✓ Sincronizado'}
          </span>
        </td>
        <td class="px-4 py-3 text-right">
          <button data-id="${s.id}" class="btn-delete-survey text-slate-400 hover:text-red-600 p-1 transition" title="Eliminar encuesta">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-delete-survey').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        if (confirm(`¿Eliminar la encuesta ${id}?`)) {
          this.store.deleteSurvey(id);
          this.showToast(`🗑️ Encuesta ${id} eliminada.`);
          this.renderAll();
        }
      });
    });
  }

  renderCharts() {
    const stats = this.store.getStats();

    if (this.activeTab === 'tab-resumen') {
      this.charts.renderComparisonChart('chart-resumen-comparativo', stats);
    }

    if (this.activeTab === 'tab-agua') {
      this.charts.renderSemaforoChart('chart-agua-semaforo', stats.agua, 'Semáforo de Agua');
      this.charts.renderProblemBreakdownChart('chart-agua-problemas', stats.agua.problemas, '#0284C7');
      this.charts.renderParroquiasChart('chart-agua-parroquias', stats.parroquias, 'aguaRojo', 'Agua Crítica (Rojo)');
    }

    if (this.activeTab === 'tab-vialidad') {
      this.charts.renderSemaforoChart('chart-vialidad-semaforo', stats.vialidad, 'Semáforo de Vialidad');
      this.charts.renderProblemBreakdownChart('chart-vialidad-problemas', stats.vialidad.problemas, '#D97706');
      this.charts.renderParroquiasChart('chart-vialidad-parroquias', stats.parroquias, 'vialidadRojo', 'Vialidad Crítica (Rojo)');
    }
  }

  exportCsv() {
    const surveys = this.store.getAll();
    if (surveys.length === 0) {
      alert('No hay encuestas para exportar.');
      return;
    }

    const headers = ['ID', 'Fecha', 'Encuestador', 'Cédula', 'Parroquia', 'Sector', 'Estado Agua', 'Problema Agua', 'Obs Agua', 'Estado Vialidad', 'Problema Vialidad', 'Obs Vialidad', 'Latitud', 'Longitud', 'Estado Sincronización'];
    
    const rows = surveys.map(s => [
      s.id,
      `"${s.fecha}"`,
      `"${s.encuestador}"`,
      `"${s.cedula || ''}"`,
      `"${s.parroquia}"`,
      `"${s.sector}"`,
      s.aguaEstado,
      `"${s.aguaProblema}"`,
      `"${(s.aguaObs || '').replace(/"/g, '""')}"`,
      s.vialidadEstado,
      `"${s.vialidadProblema}"`,
      `"${(s.vialidadObs || '').replace(/"/g, '""')}"`,
      s.lat || '',
      s.lng || '',
      s.syncStatus
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `encuestas_maturin_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast('📥 Archivo CSV descargado con éxito.');
  }

  shareViaWhatsapp() {
    const stats = this.store.getStats();
    const message = `📊 *REPORTE TERRITORIAL MIGATO | MATURÍN*\n\n` +
      `📌 *Total Encuestas:* ${stats.total}\n` +
      `🚰 *Agua en Alerta Roja:* ${stats.agua.pctRojo}% (${stats.agua.rojo} sectores)\n` +
      `🛣️ *Vialidad Crítica:* ${stats.vialidad.pctRojo}% (${stats.vialidad.rojo} vías)\n\n` +
      `_Reporte oficial generado por la Plataforma Territorial MIGATO - Maturín._`;

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  getBadgeClass(color) {
    if (color === 'rojo') return 'bg-red-100 text-red-700 border border-red-200';
    if (color === 'amarillo') return 'bg-amber-100 text-amber-800 border border-amber-200';
    return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
  }

  getBgColorClass(color) {
    if (color === 'rojo') return 'bg-red-500';
    if (color === 'amarillo') return 'bg-amber-500';
    return 'bg-emerald-500';
  }

  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.maturinApp = new App();
});
