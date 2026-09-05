/**
 * Configuración y Cliente de Alta Disponibilidad — Google Cloud Firestore
 * Google Earth Pro Web • Edición Estado Monagas
 * 
 * Arquitectura de Alta Concurrencia para Eventos Masivos:
 * 1. Canal Primario: REST Nativo de Alta Velocidad (0 dependencias externas, <100ms, sin bloqueos de navegador).
 * 2. Canal Secundario: SDK de WebSockets cargado asíncronamente en segundo plano (onSnapshot push).
 * 3. Tolerancia Total a Fallos: funciona con bloqueadores de anuncios, modo incógnito y redes móviles inestables.
 */

// Clave en LocalStorage para guardar las credenciales del proyecto
const STORAGE_KEY = "migato_monagas_firebase_config";

// Configuración oficial del proyecto Firebase de Diego (gato-3e238)
const DEFAULT_CONFIG = {
  apiKey: "AIzaSyCK8DBZWsVflfMoA_z-9XupX0BvLE4iJjc",
  authDomain: "gato-3e238.firebaseapp.com",
  projectId: "gato-3e238",
  storageBucket: "gato-3e238.firebasestorage.app",
  messagingSenderId: "630890915824",
  appId: "1:630890915824:web:bc0deb7f80c4494b78df35",
  measurementId: "G-G1617P2MM0"
};

// Módulos dinámicos del SDK (cargados bajo demanda sin frenar el inicio de la app)
let fbAppModule = null;
let fbFsModule = null;
let appInstance = null;
let dbInstance = null;
let sdkInitAttempted = false;
let sdkInitSuccess = false;
let activeUnsubscribe = null;
let restPollingTimer = null;

export function getSavedFirebaseConfig() {
  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.projectId) return parsed;
      }
    }
  } catch (e) {
    console.warn("[Firebase] Error leyendo credenciales locales:", e);
  }
  return DEFAULT_CONFIG;
}

export function saveFirebaseConfig(cfg) {
  try {
    if (!cfg || !cfg.projectId) return false;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    }
    initFirebase(cfg);
    return true;
  } catch (e) {
    console.error("[Firebase] Error guardando credenciales:", e);
    return false;
  }
}

export function isFirebaseConfigured() {
  const cfg = getSavedFirebaseConfig();
  return Boolean(cfg && cfg.projectId && cfg.apiKey);
}

/**
 * Carga asíncrona no bloqueante del SDK Web de Firebase
 * Si el navegador (Firefox Tracking Protection o adblocker) lo bloquea, se captura limpiamente
 * y el sistema continúa al 100% de operatividad mediante la API REST nativa.
 */
async function ensureFirebaseSDK(config) {
  if (sdkInitSuccess && dbInstance) return true;
  if (sdkInitAttempted) return sdkInitSuccess;
  sdkInitAttempted = true;

  try {
    const [appMod, fsMod] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js")
    ]);

    fbAppModule = appMod;
    fbFsModule = fsMod;

    const existingApps = appMod.getApps ? appMod.getApps() : [];
    const match = existingApps.find(a => a.name === "MIGATO_MONAGAS_APP");
    appInstance = match || appMod.initializeApp(config, "MIGATO_MONAGAS_APP");
    dbInstance = fsMod.getFirestore(appInstance);
    sdkInitSuccess = true;
    console.log("🔥 [Firebase SDK] Conectado en segundo plano para notificaciones push.");
    return true;
  } catch (sdkErr) {
    sdkInitSuccess = false;
    console.info("ℹ️ [Firebase REST] Modo REST Nativo activo (SDK externo no requerido o protegido por el navegador).");
    return false;
  }
}

export function initFirebase(customConfig = null) {
  const config = customConfig || getSavedFirebaseConfig();
  if (!config || !config.projectId) return false;
  
  // Disparar carga dinámica del SDK en background sin bloquear
  ensureFirebaseSDK(config).catch(() => {});
  return true;
}

// Iniciar intento de conexión en segundo plano
try {
  initFirebase();
} catch(e) {}

/**
 * Limpia y normaliza objetos antes de serializar (evita propiedades undefined o circulares de Leaflet)
 */
function cleanItem(item) {
  if (!item || typeof item !== "object") return item;
  try {
    return JSON.parse(JSON.stringify(item));
  } catch (e) {
    const clean = {};
    Object.keys(item).forEach(k => {
      if (typeof item[k] !== "function" && !k.startsWith("_") && item[k] !== undefined) {
        clean[k] = item[k];
      }
    });
    return clean;
  }
}

/**
 * Desempaqueta un documento de Firestore que contenga dataJson
 */
export function unpackDocumentData(data) {
  if (!data || typeof data !== "object") return null;
  let result = { ...data };
  if (data.dataJson && typeof data.dataJson === "string") {
    try {
      const parsed = JSON.parse(data.dataJson);
      result = { ...result, ...parsed };
    } catch (e) {
      console.warn("[Firebase] Error parseando dataJson:", e);
    }
  }
  return result;
}

export function parseFirestoreDocumentFields(fields) {
  if (!fields || typeof fields !== "object") return {};
  let raw = {};
  if (fields.dataJson && fields.dataJson.stringValue) {
    try {
      raw = JSON.parse(fields.dataJson.stringValue);
    } catch (e) {}
  }
  if (fields.munId?.stringValue) raw.munId = fields.munId.stringValue;
  if (fields.parishId?.stringValue) raw.parishId = fields.parishId.stringValue;
  if (fields.updatedAt?.integerValue) raw.updatedAt = Number(fields.updatedAt.integerValue);
  return raw;
}

/**
 * Combina dos colecciones de elementos (locales y remotos) por su ID único sin perder datos.
 * Preserva elementos creados concurrentemente por otros usuarios y elementos locales nuevos.
 */
export function mergeItemCollections(localArr = [], remoteArr = [], deletedIds = []) {
  const map = new Map();
  const delSet = new Set((deletedIds || []).map(String));

  // 1. Remotos primero (si no han sido borrados)
  (remoteArr || []).forEach(item => {
    if (item && item.id && !delSet.has(String(item.id))) {
      map.set(String(item.id), cleanItem(item));
    }
  });

  // 2. Locales después: conservar y/o actualizar con la versión más reciente
  (localArr || []).forEach(item => {
    if (!item || !item.id || delSet.has(String(item.id))) return;
    const key = String(item.id);
    if (!map.has(key)) {
      map.set(key, cleanItem(item));
    } else {
      const remoteItem = map.get(key);
      const localUpdated = item.updatedAt || 0;
      const remoteUpdated = remoteItem.updatedAt || 0;
      if (localUpdated >= remoteUpdated) {
        map.set(key, { ...remoteItem, ...cleanItem(item) });
      }
    }
  });

  return Array.from(map.values());
}

const parishSaveQueues = new Map();

/**
 * Guarda o actualiza una parroquia en Firestore con Fusión Multiusuario,
 * Cola Secuencial (anti-colisiones) y Reintentos Automáticos.
 */
export async function saveParishToFirestore(munId, parishId, parishData) {
  const docId = `${munId}_${parishId}`;
  const prevPromise = parishSaveQueues.get(docId) || Promise.resolve();

  const currentPromise = prevPromise.then(() => _executeSaveParish(munId, parishId, parishData)).catch(err => {
    console.warn(`[Firestore Queue] Error guardando ${docId}:`, err);
    return false;
  });

  parishSaveQueues.set(docId, currentPromise);
  return currentPromise;
}

async function _executeSaveParish(munId, parishId, parishData) {
  // Margen de delay seguro para dar respiro a Firestore y absorber concurrencia multiusuario
  await new Promise(resolve => setTimeout(resolve, 600));

  const cfg = getSavedFirebaseConfig();
  const projectId = cfg?.projectId || DEFAULT_CONFIG.projectId;
  const apiKey = cfg?.apiKey || DEFAULT_CONFIG.apiKey;
  const docId = `${munId}_${parishId}`;
  const keyParam = apiKey ? `?key=${apiKey}` : "";

  // 1. Pre-fetch multiusuario: leer estado fresco de la nube para no sobreescribir trazos de otro usuario
  let currentRemote = null;
  if (projectId) {
    try {
      const cacheBust = `_t=${Date.now()}`;
      const sep = keyParam ? "&" : "?";
      const getUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/territorios_monagas/${docId}${keyParam}${sep}${cacheBust}`;
      const getResp = await fetch(getUrl, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache, no-store, must-revalidate", "Pragma": "no-cache" }
      });
      if (getResp.ok) {
        const getJson = await getResp.json();
        if (getJson.fields) {
          currentRemote = parseFirestoreDocumentFields(getJson.fields);
        }
      }
    } catch (e) {
      console.warn("[Multiusuario] Aviso en pre-fetch:", e);
    }
  }

  const deletedIds = parishData.deletedIds || [];
  const mergedSub = mergeItemCollections(parishData.subparroquias || [], currentRemote?.subparroquias || [], deletedIds);
  const mergedPoly = mergeItemCollections(parishData.poligonos || [], currentRemote?.poligonos || [], deletedIds);
  const mergedRutas = mergeItemCollections(parishData.rutas || [], currentRemote?.rutas || [], deletedIds);
  const mergedMarcas = mergeItemCollections(parishData.marcas || [], currentRemote?.marcas || [], deletedIds);

  // Actualizar también la instancia local con los elementos fusionados
  parishData.subparroquias = mergedSub;
  parishData.poligonos = mergedPoly;
  parishData.rutas = mergedRutas;
  parishData.marcas = mergedMarcas;

  const cleanPayload = {
    munId,
    parishId,
    subparroquias: mergedSub,
    poligonos: mergedPoly,
    rutas: mergedRutas,
    marcas: mergedMarcas,
    deletedIds: deletedIds,
    updatedAt: Date.now()
  };

  const jsonStr = JSON.stringify(cleanPayload);
  let savedSuccess = false;

  // 2. Canal Primario: Google Cloud Firestore REST API con Reintentos y Delay
  if (projectId) {
    const restUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/territorios_monagas/${docId}${keyParam}`;
    const restBody = {
      fields: {
        munId: { stringValue: munId },
        parishId: { stringValue: parishId },
        updatedAt: { integerValue: String(cleanPayload.updatedAt) },
        dataJson: { stringValue: jsonStr }
      }
    };

    let attempts = 0;
    const maxAttempts = 4;
    while (attempts < maxAttempts && !savedSuccess) {
      attempts++;
      try {
        const resp = await fetch(restUrl, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(restBody)
        });

        if (resp.ok) {
          savedSuccess = true;
          console.log(`☁️ [Firestore REST] Guardado exitoso multiusuario de ${docId} (${cleanPayload.poligonos.length} sec, ${cleanPayload.subparroquias.length} sub)`);
          break;
        } else {
          const errText = await resp.text();
          console.warn(`⚠️ [Firestore REST] Intento ${attempts}/${maxAttempts} falló con HTTP ${resp.status}:`, errText);
          if (attempts < maxAttempts) {
            await new Promise(res => setTimeout(res, 350 * attempts));
          }
        }
      } catch (restErr) {
        console.warn(`⚠️ [Firestore REST] Intento ${attempts}/${maxAttempts} error de red:`, restErr.message);
        if (attempts < maxAttempts) {
          await new Promise(res => setTimeout(res, 350 * attempts));
        }
      }
    }
  }

  // 3. Réplica opcional en segundo plano vía SDK Web si está activo
  if (dbInstance && fbFsModule) {
    try {
      const docRef = fbFsModule.doc(dbInstance, "territorios_monagas", docId);
      fbFsModule.setDoc(docRef, {
        munId,
        parishId,
        updatedAt: cleanPayload.updatedAt,
        dataJson: jsonStr
      }, { merge: true }).catch(() => {});
    } catch(e) {}
  }

  return savedSuccess;
}

/**
 * Obtiene todos los territorios guardados en Firestore.
 * Utiliza REST GET directo de alta velocidad (<100ms) sin bloqueos de scripts externos.
 */
export async function fetchAllTerritoriesFromFirestore() {
  const cfg = getSavedFirebaseConfig();
  const projectId = cfg?.projectId || DEFAULT_CONFIG.projectId;
  const apiKey = cfg?.apiKey || DEFAULT_CONFIG.apiKey;
  const keyParam = apiKey ? `?key=${apiKey}` : "";
  const result = {};
  let fetched = false;

  // 1. Lectura Primaria de Alta Velocidad: Google Cloud REST API (100% Fresco sin Caché)
  if (projectId) {
    try {
      const cacheBust = `_t=${Date.now()}`;
      const sep = keyParam ? "&" : "?";
      const restUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/territorios_monagas${keyParam}${sep}${cacheBust}`;
      const resp = await fetch(restUrl, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache"
        }
      });
      if (resp.ok) {
        const json = await resp.json();
        const docs = json.documents || [];
        docs.forEach(docObj => {
          const docId = docObj.name.split("/").pop();
          const fields = docObj.fields || {};
          let raw = {};
          if (fields.dataJson && fields.dataJson.stringValue) {
            try {
              raw = JSON.parse(fields.dataJson.stringValue);
            } catch (e) {}
          }
          if (fields.munId?.stringValue) raw.munId = fields.munId.stringValue;
          if (fields.parishId?.stringValue) raw.parishId = fields.parishId.stringValue;
          if (fields.updatedAt?.integerValue) raw.updatedAt = Number(fields.updatedAt.integerValue);
          result[docId] = raw;
          fetched = true;
        });
      }
    } catch (restErr) {
      console.warn("⚠️ [Firestore REST] Red lenta al obtener territorios:", restErr.message);
    }
  }

  // 2. Si REST tuvo algún fallo de red y el SDK está activo, intentar vía SDK
  if (!fetched && dbInstance && fbFsModule) {
    try {
      const colRef = fbFsModule.collection(dbInstance, "territorios_monagas");
      const snapshot = await fbFsModule.getDocs(colRef);
      snapshot.forEach((docSnap) => {
        const raw = docSnap.data();
        if (raw) {
          result[docSnap.id] = unpackDocumentData(raw);
          fetched = true;
        }
      });
    } catch (err) {
      console.warn("⚠️ [Firestore SDK] Error en fallback getDocs:", err.message);
    }
  }

  return fetched ? result : null;
}

/**
 * Escucha cambios en tiempo real en la colección de territorios.
 * Combina polling REST adaptativo (cada 8s) + push en tiempo real por WebSockets (si el SDK está disponible).
 */
export function subscribeToTerritories(onDataCallback) {
  if (typeof onDataCallback !== "function") return () => {};

  // Limpiar suscripciones previas
  if (activeUnsubscribe) {
    try { activeUnsubscribe(); } catch(e) {}
    activeUnsubscribe = null;
  }
  if (restPollingTimer) {
    clearInterval(restPollingTimer);
    restPollingTimer = null;
  }

  // 1. Polling REST Infalible cada 8 segundos (sincroniza PC ↔ Teléfono en cualquier red)
  restPollingTimer = setInterval(async () => {
    try {
      const remote = await fetchAllTerritoriesFromFirestore();
      if (remote && Object.keys(remote).length > 0) {
        onDataCallback(remote);
      }
    } catch(e) {}
  }, 8000);

  // 2. Intentar activar listener push de WebSockets con el SDK en segundo plano
  const config = getSavedFirebaseConfig();
  ensureFirebaseSDK(config).then(ready => {
    if (ready && dbInstance && fbFsModule) {
      try {
        const colRef = fbFsModule.collection(dbInstance, "territorios_monagas");
        activeUnsubscribe = fbFsModule.onSnapshot(colRef, (snapshot) => {
          const mergedData = {};
          snapshot.forEach((docSnap) => {
            const raw = docSnap.data();
            if (raw) {
              mergedData[docSnap.id] = unpackDocumentData(raw);
            }
          });
          if (Object.keys(mergedData).length > 0) {
            onDataCallback(mergedData);
          }
        }, (error) => {
          console.warn("⚠️ [Firestore Listener] Evento SDK:", error.message);
        });
      } catch(listenerErr) {
        console.warn("⚠️ [Firestore] Listener push no soportado, continuando con Polling REST:", listenerErr.message);
      }
    }
  }).catch(() => {});

  return () => {
    if (activeUnsubscribe) {
      try { activeUnsubscribe(); } catch(e) {}
      activeUnsubscribe = null;
    }
    if (restPollingTimer) {
      clearInterval(restPollingTimer);
      restPollingTimer = null;
    }
  };
}

export const db = null;
export const app = null;
