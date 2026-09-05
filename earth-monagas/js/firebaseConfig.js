/**
 * Configuración y Cliente de Firebase Firestore en Tiempo Real
 * Sincronización instantánea entre PC, Tablets y Teléfonos Móviles
 * Google Earth Pro Web • Edición Estado Monagas
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDocs,
  collection, 
  onSnapshot,
  enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

let app = null;
let db = null;
let activeUnsubscribe = null;
let isInitialized = false;

export function getSavedFirebaseConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.projectId) return parsed;
    }
  } catch (e) {
    console.warn("Error leyendo configuración guardada de Firebase:", e);
  }
  return DEFAULT_CONFIG;
}

export function saveFirebaseConfig(cfg) {
  try {
    if (!cfg || !cfg.projectId) return false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    return initFirebase(cfg);
  } catch (e) {
    console.error("Error guardando configuración de Firebase:", e);
    return false;
  }
}

export function isFirebaseConfigured() {
  const cfg = getSavedFirebaseConfig();
  return Boolean(cfg && cfg.projectId && cfg.apiKey);
}

export function initFirebase(customConfig = null) {
  try {
    const config = customConfig || getSavedFirebaseConfig();
    if (!config || !config.projectId || !config.apiKey) {
      console.info("ℹ️ Firebase no configurado aún. Se usará sincronización vía API hasta configurar credenciales.");
      return false;
    }

    if (isInitialized && db) {
      return true;
    }

    app = initializeApp(config, "MIGATO_MONAGAS_APP");
    db = getFirestore(app);

    // Intentar persistencia offline en el navegador
    try {
      enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn("Persistencia offline no activada: múltiples pestañas abiertas");
        } else if (err.code === 'unimplemented') {
          console.warn("Persistencia offline no soportada en este navegador");
        }
      });
    } catch (e) {}

    isInitialized = true;
    console.log("🔥 Firebase Firestore inicializado con éxito. Proyecto:", config.projectId);
    return true;
  } catch (err) {
    console.error("❌ Error inicializando Firebase Firestore:", err);
    return false;
  }
}

// Intentar auto-inicializar al importar el script
initFirebase();

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
      console.warn("Error parseando dataJson de Firestore:", e);
    }
  }
  return result;
}

/**
 * Escucha cambios en tiempo real en la colección de territorios
 * Cada vez que una PC o teléfono guarde un cambio, esta función llamará a callback(datos)
 */
export function subscribeToTerritories(onDataCallback) {
  if (!db) {
    const ok = initFirebase();
    if (!ok || !db) return null;
  }

  try {
    if (activeUnsubscribe) {
      activeUnsubscribe();
      activeUnsubscribe = null;
    }

    const colRef = collection(db, "territorios_monagas");
    activeUnsubscribe = onSnapshot(colRef, (snapshot) => {
      const mergedData = {};
      snapshot.forEach((docSnap) => {
        const raw = docSnap.data();
        if (raw) {
          mergedData[docSnap.id] = unpackDocumentData(raw);
        }
      });
      if (typeof onDataCallback === "function") {
        onDataCallback(mergedData);
      }
    }, (error) => {
      console.warn("⚠️ Error en listener Firestore:", error);
    });

    return activeUnsubscribe;
  } catch (err) {
    console.error("Error suscribiendo a territorios Firestore:", err);
    return null;
  }
}

/**
 * Guarda o actualiza una parroquia en Firestore
 * Utiliza serialización JSON para evitar el error 'Nested arrays are not allowed' en Leaflet
 * Incluye respaldo automático vía API REST directa de Google Firestore
 */
export async function saveParishToFirestore(munId, parishId, parishData) {
  const cfg = getSavedFirebaseConfig();
  const projectId = cfg?.projectId || DEFAULT_CONFIG.projectId;
  const docId = `${munId}_${parishId}`;

  const cleanPayload = {
    munId,
    parishId,
    subparroquias: (parishData.subparroquias || []).map(cleanItem),
    poligonos: (parishData.poligonos || []).map(cleanItem),
    rutas: (parishData.rutas || []).map(cleanItem),
    marcas: (parishData.marcas || []).map(cleanItem),
    updatedAt: Date.now()
  };

  const jsonStr = JSON.stringify(cleanPayload);
  let savedSuccess = false;

  // 1. Intento primario: SDK Web de Firestore
  if (db) {
    try {
      const docRef = doc(db, "territorios_monagas", docId);
      const docData = {
        munId,
        parishId,
        updatedAt: cleanPayload.updatedAt,
        dataJson: jsonStr
      };
      await setDoc(docRef, docData, { merge: true });
      savedSuccess = true;
      console.log(`🔥 [Firestore SDK] Guardado exitoso de ${docId} (${cleanPayload.poligonos.length} sectores)`);
    } catch (err) {
      console.warn(`⚠️ [Firestore SDK] Falló guardado para ${docId}, activando canal REST directo:`, err);
    }
  }

  // 2. Intento secundario / Fallback REST directo (Google Cloud Firestore API)
  if (!savedSuccess && projectId) {
    try {
      const restUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/territorios_monagas/${docId}`;
      const restBody = {
        fields: {
          munId: { stringValue: munId },
          parishId: { stringValue: parishId },
          updatedAt: { integerValue: String(cleanPayload.updatedAt) },
          dataJson: { stringValue: jsonStr }
        }
      };

      const resp = await fetch(restUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(restBody)
      });

      if (resp.ok) {
        savedSuccess = true;
        console.log(`☁️ [Firestore REST] Guardado exitoso directo de ${docId}`);
      } else {
        const errText = await resp.text();
        console.warn(`❌ [Firestore REST] Error HTTP ${resp.status}:`, errText);
      }
    } catch (restErr) {
      console.warn("❌ [Firestore REST] Error de red:", restErr);
    }
  }

  return savedSuccess;
}

/**
 * Obtiene todos los territorios guardados en Firestore
 * Desempaqueta automáticamente la estructura completa
 */
export async function fetchAllTerritoriesFromFirestore() {
  const cfg = getSavedFirebaseConfig();
  const projectId = cfg?.projectId || DEFAULT_CONFIG.projectId;
  const result = {};
  let fetched = false;

  // 1. Intento primario: SDK Web de Firestore
  if (db) {
    try {
      const colRef = collection(db, "territorios_monagas");
      const snapshot = await getDocs(colRef);
      snapshot.forEach((docSnap) => {
        const raw = docSnap.data();
        if (raw) {
          result[docSnap.id] = unpackDocumentData(raw);
          fetched = true;
        }
      });
      if (fetched) {
        console.log(`🔥 [Firestore SDK] ${Object.keys(result).length} territorios cargados`);
      }
    } catch (err) {
      console.warn("⚠️ [Firestore SDK] Fallo getDocs, intentando REST GET:", err);
    }
  }

  // 2. Intento secundario / Fallback REST directo
  if (!fetched && projectId) {
    try {
      const restUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/territorios_monagas`;
      const resp = await fetch(restUrl);
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
          result[docId] = raw;
          fetched = true;
        });
        if (fetched) {
          console.log(`☁️ [Firestore REST] ${Object.keys(result).length} territorios recuperados`);
        }
      }
    } catch (restErr) {
      console.warn("❌ [Firestore REST] Fallo en fetchAllTerritories:", restErr);
    }
  }

  return fetched ? result : null;
}

export { db, app };
