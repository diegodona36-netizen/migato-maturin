/**
 * MIGATO - Adaptador de Integración con Firebase (Cloud Firestore & Auth)
 * Permite sincronización en tiempo real y persistencia en la nube de Google.
 * Si Firebase no está configurado o el equipo está sin conexión,
 * delega automáticamente a IndexedDB y al backend local.
 */

const MIGATO_FIREBASE = (function() {
  let isInitialized = false;
  let db = null;

  async function init() {
    const config = window.MIGATO_CONFIG?.firebase;
    if (!config || !config.apiKey || config.apiKey === "TU_API_KEY_AQUI") {
      console.log("[MIGATO Firebase] Modo local activo. Para activar Firebase en la nube, ingresa tus credenciales en config.js");
      return false;
    }

    try {
      // Si Firebase SDK ya está cargado en ventana
      if (window.firebase && !isInitialized) {
        if (!firebase.apps.length) {
          firebase.initializeApp(config);
        }
        db = firebase.firestore();
        // Habilitar persistencia offline nativa de Firebase
        try {
          await db.enablePersistence({ synchronizeTabs: true });
          console.log("[MIGATO Firebase] Persistencia offline de Firestore activada.");
        } catch (err) {
          console.warn("[MIGATO Firebase] Persistencia ya activada o no soportada en esta pestaña.");
        }
        isInitialized = true;
        console.log("[MIGATO Firebase] ✅ Conectado exitosamente a Firebase Cloud Firestore.");
        return true;
      }
    } catch (e) {
      console.error("[MIGATO Firebase] Error al inicializar Firebase:", e);
      return false;
    }
    return false;
  }

  // Guardar un registro de censo en Firestore
  async function saveCensusRecord(record) {
    if (isInitialized && db) {
      try {
        await db.collection("censo_familias").doc(record.id).set({
          ...record,
          firebaseSyncTimestamp: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log("[MIGATO Firebase] Registro sincronizado en Firestore:", record.id);
        return { success: true, source: "firestore" };
      } catch (e) {
        console.warn("[MIGATO Firebase] Error al escribir en Firestore, guardando en local:", e);
      }
    }
    return { success: false, source: "offline_fallback" };
  }

  // Escuchar alertas en tiempo real para el Despacho del Gobernador
  function onAlertsChanged(callback) {
    if (isInitialized && db) {
      return db.collection("alertas_despacho")
        .orderBy("fecha", "desc")
        .limit(20)
        .onSnapshot(snapshot => {
          const alerts = [];
          snapshot.forEach(doc => alerts.push({ id: doc.id, ...doc.data() }));
          callback(alerts);
        }, err => {
          console.warn("[MIGATO Firebase] Error escuchando alertas:", err);
        });
    }
    return null;
  }

  return {
    init,
    saveCensusRecord,
    onAlertsChanged,
    isReady: () => isInitialized
  };
})();

window.MIGATO_FIREBASE = MIGATO_FIREBASE;

// Auto-inicializar si las credenciales están presentes
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    MIGATO_FIREBASE.init();
  });
}
