/**
 * MIGATO - Motor de Base de Datos Local Offline (IndexedDB)
 * Permite el empadronamiento familiar en campo sin internet
 * y la sincronización automática en segundo plano al detectar conexión
 * tanto con el Backend Oficial como con Firebase Firestore.
 */

const MIGATO_OFFLINE = (function() {
  const DB_NAME = "MIGATO_LOCAL_DB";
  const DB_VERSION = 1;
  const STORE_CENSO = "censo_familias";
  const STORE_QUEUE = "sync_queue";

  let dbPromise = null;

  function openDB() {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = function(event) {
        const db = event.target.result;
        
        // Almacén principal de censos
        if (!db.objectStoreNames.contains(STORE_CENSO)) {
          const censoStore = db.createObjectStore(STORE_CENSO, { keyPath: "id" });
          censoStore.createIndex("parroquia", "parroquia", { unique: false });
          censoStore.createIndex("sector", "sector", { unique: false });
          censoStore.createIndex("fecha", "fecha", { unique: false });
        }

        // Cola de sincronización pendiente
        if (!db.objectStoreNames.contains(STORE_QUEUE)) {
          const queueStore = db.createObjectStore(STORE_QUEUE, { keyPath: "syncId", autoIncrement: true });
          queueStore.createIndex("status", "status", { unique: false });
        }
      };

      request.onsuccess = function(event) {
        resolve(event.target.result);
      };

      request.onerror = function(event) {
        console.error("[MIGATO Offline] Error al abrir IndexedDB:", event.target.error);
        reject(event.target.error);
      };
    });

    return dbPromise;
  }

  // Guardar una familia en local
  async function saveFamilyRecord(familyData) {
    const db = await openDB();
    const record = {
      id: familyData.id || "FAM-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      jefeFamilia: familyData.jefeFamilia || "Sin nombre",
      cedula: familyData.cedula || "V-00000000",
      parroquia: familyData.parroquia || "Alto de Los Godos",
      sector: familyData.sector || "La Puente",
      cargasFamiliares: familyData.cargasFamiliares || 1,
      vulnerabilidad: familyData.vulnerabilidad || "Media",
      medicamentosRequeridos: familyData.medicamentosRequeridos || "Ninguno",
      coordenadas: familyData.coordenadas || { lat: 9.7489, lng: -63.1789 },
      fecha: new Date().toISOString(),
      estadoSync: "pendiente_offline"
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_CENSO, STORE_QUEUE], "readwrite");
      const censoStore = tx.objectStore(STORE_CENSO);
      const queueStore = tx.objectStore(STORE_QUEUE);

      censoStore.put(record);

      queueStore.add({
        recordId: record.id,
        payload: record,
        timestamp: Date.now(),
        status: "pending"
      });

      tx.oncomplete = function() {
        console.log("[MIGATO Offline] Registro guardado en memoria local:", record.id);
        window.dispatchEvent(new CustomEvent("migato:census-saved", { detail: record }));
        
        // Si hay internet, intentar sincronizar de inmediato
        if (navigator.onLine) {
          syncPendingQueue();
        }
        resolve(record);
      };

      tx.onerror = function(e) {
        reject(e.target.error);
      };
    });
  }

  // Obtener todas las familias guardadas en el dispositivo
  async function getAllFamilyRecords() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CENSO, "readonly");
      const store = tx.objectStore(STORE_CENSO);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  // Sincronizar registros pendientes al servidor / Firebase de forma REAL
  async function syncPendingQueue() {
    if (!navigator.onLine) {
      console.log("[MIGATO Offline] Dispositivo sin señal. Datos en cola segura.");
      return { syncedCount: 0, status: "offline" };
    }

    const db = await openDB();
    const pendingItems = await new Promise((resolve) => {
      const tx = db.transaction(STORE_QUEUE, "readonly");
      const store = tx.objectStore(STORE_QUEUE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
    });

    if (pendingItems.length === 0) {
      return { syncedCount: 0, status: "up_to_date" };
    }

    console.log(`[MIGATO Offline] 🔄 Sincronizando ${pendingItems.length} registros con el servidor central...`);

    let syncSuccess = false;

    // 1. Intento de sincronización con Firebase si está activo
    if (window.MIGATO_FIREBASE && window.MIGATO_FIREBASE.isReady()) {
      try {
        for (const item of pendingItems) {
          await window.MIGATO_FIREBASE.saveCensusRecord(item.payload);
        }
        syncSuccess = true;
        console.log("[MIGATO Offline] ✅ Sincronizado exitosamente con Firebase Cloud Firestore.");
      } catch (fbErr) {
        console.warn("[MIGATO Offline] Firebase no respondió, recurriendo al Backend local:", fbErr);
      }
    }

    // 2. Sincronización con el Backend Oficial (API REST /api/censo/sincronizar)
    if (!syncSuccess) {
      try {
        const apiUrl = (window.MIGATO_CONFIG?.api?.baseUrl || "/api") + "/censo/sincronizar";
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pendingItems)
        });

        if (response.ok) {
          syncSuccess = true;
          const resData = await response.json();
          console.log("[MIGATO Offline] ✅ Sincronizado exitosamente con el Servidor Central:", resData);
        } else {
          console.warn("[MIGATO Offline] Servidor respondió con estado:", response.status);
        }
      } catch (netErr) {
        console.warn("[MIGATO Offline] Servidor local no alcanzable en este momento. Reintentará más tarde.");
      }
    }

    // Si la sincronización fue exitosa, vaciar la cola y actualizar estado
    if (syncSuccess) {
      const tx = db.transaction([STORE_QUEUE, STORE_CENSO], "readwrite");
      const queueStore = tx.objectStore(STORE_QUEUE);
      const censoStore = tx.objectStore(STORE_CENSO);

      pendingItems.forEach(item => {
        queueStore.delete(item.syncId);
        item.payload.estadoSync = "sincronizado";
        item.payload.sincronizadoEn = new Date().toISOString();
        censoStore.put(item.payload);
      });

      return new Promise((resolve) => {
        tx.oncomplete = () => {
          window.dispatchEvent(new CustomEvent("migato:sync-completed", { 
            detail: { syncedCount: pendingItems.length } 
          }));
          resolve({ syncedCount: pendingItems.length, status: "success" });
        };
      });
    }

    return { syncedCount: 0, status: "retry_later" };
  }

  // Detectores automáticos de red
  if (typeof window !== "undefined") {
    window.addEventListener("online", () => {
      console.log("[MIGATO Offline] 🟢 Señal detectada. Iniciando sincronización de campo...");
      syncPendingQueue();
    });

    window.addEventListener("offline", () => {
      console.warn("[MIGATO Offline] 🔴 Sin cobertura. Operando en modo memoria local segura.");
    });
  }

  return {
    openDB,
    saveFamilyRecord,
    getAllFamilyRecords,
    syncPendingQueue
  };
})();

window.MIGATO_OFFLINE = MIGATO_OFFLINE;
