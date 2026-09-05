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
        const data = docSnap.data();
        if (data) {
          mergedData[docSnap.id] = data;
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
 */
export async function saveParishToFirestore(munId, parishId, parishData) {
  if (!db) {
    const ok = initFirebase();
    if (!ok || !db) return false;
  }

  try {
    const docId = `${munId}_${parishId}`;
    const docRef = doc(db, "territorios_monagas", docId);

    const payload = {
      munId,
      parishId,
      subparroquias: parishData.subparroquias || [],
      poligonos: parishData.poligonos || [],
      rutas: parishData.rutas || [],
      marcas: parishData.marcas || [],
      updatedAt: Date.now()
    };

    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (err) {
    console.error("Error guardando parroquia en Firestore:", err);
    return false;
  }
}

/**
 * Obtiene todos los territorios guardados en Firestore
 */
export async function fetchAllTerritoriesFromFirestore() {
  if (!db) {
    const ok = initFirebase();
    if (!ok || !db) return null;
  }

  try {
    const colRef = collection(db, "territorios_monagas");
    const snapshot = await getDocs(colRef);
    const data = {};
    snapshot.forEach((docSnap) => {
      data[docSnap.id] = docSnap.data();
    });
    return data;
  } catch (err) {
    console.error("Error obteniendo territorios de Firestore:", err);
    return null;
  }
}

export { db, app };
