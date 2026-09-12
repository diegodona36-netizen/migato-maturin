/**
 * MIGATO - Configuración Central del Sistema
 * Soporta modo local de desarrollo y entornos de producción (Firebase / VPS con PostgreSQL).
 */
const MIGATO_CONFIG = {
  version: "2.5.0-PROD-READY",
  environment: "development", // 'development' | 'production'
  
  // Modos de Almacenamiento: 'local' (offline-first) | 'firebase' | 'vps_postgres'
  storageMode: "firebase",

  // Configuración Oficial de Firebase (Cloud Firestore & Auth)
  firebase: {
    apiKey: "TU_API_KEY_AQUI",
    authDomain: "migato-monagas.firebaseapp.com",
    projectId: "migato-monagas",
    storageBucket: "migato-monagas.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456"
  },

  // Rutas base de APIs Locales / Backend VPS
  api: {
    baseUrl: window.location.origin + "/api",
    timeoutMs: 8000,
    syncIntervalMs: 30000 // 30 segundos entre intentos de sincronización automática
  },

  // Perfil institucional
  institution: {
    state: "Monagas",
    municipality: "Maturín",
    systemName: "MIGATO",
    fullName: "Módulo Integral de Gestión, Auditoría y Territorio Organizado",
    code: "DOC-MIGATO-MONAGAS-2026"
  },

  // Parámetros de seguridad
  security: {
    sessionTimeoutMinutes: 120,
    requireAuth: false // Activado en producción para forzar paso por login.html
  }
};

// Exportar globalmente para todos los módulos
window.MIGATO_CONFIG = MIGATO_CONFIG;
