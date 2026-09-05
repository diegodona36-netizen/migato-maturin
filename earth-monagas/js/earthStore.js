/**
 * Gestor de Estado y Árbol de Lugares (Places) — Google Earth Pro Web (Monagas)
 */
import { SECTORES_LAPUENTE, SUBPARROQUIAS_GODOS } from "./geoMonagas.js?v=82";
import { 
  saveParishToFirestore, 
  subscribeToTerritories, 
  isFirebaseConfigured, 
  fetchAllTerritoriesFromFirestore,
  mergeItemCollections,
  cleanItem
} from "./firebaseConfig.js?v=82";

const STORAGE_KEY = "earth_monagas_places_v8";

export const DEFAULT_SAN_SIMON_SUBPARROQUIAS = [
  {
    id: "sub-ss-casco",
    parroquiaId: "san-simon",
    nombre: "Sub-Parroquia 1 • Casco Central",
    alias: "Centro Histórico",
    colorBorde: "#c084fc",
    anchoBorde: 2.5,
    colorRelleno: "#a855f7",
    opacidad: 0.18,
    areaHa: 195.4,
    perimetroM: 5800,
    militantes: 3420,
    casas: 2150,
    visible: true,
    vertices: [
      [9.7560, -63.1890],
      [9.7570, -63.1740],
      [9.7440, -63.1730],
      [9.7430, -63.1880],
      [9.7560, -63.1890]
    ]
  },
  {
    id: "sub-ss-palonegro",
    parroquiaId: "san-simon",
    nombre: "Sub-Parroquia 2 • Palo Negro / Brisas",
    alias: "Palo Negro - Brisas del Orinoco",
    colorBorde: "#c084fc",
    anchoBorde: 2.5,
    colorRelleno: "#a855f7",
    opacidad: 0.18,
    areaHa: 230.8,
    perimetroM: 6100,
    militantes: 4180,
    casas: 2840,
    visible: true,
    vertices: [
      [9.7540, -63.1740],
      [9.7530, -63.1600],
      [9.7360, -63.1610],
      [9.7380, -63.1750],
      [9.7540, -63.1740]
    ]
  },
  {
    id: "sub-ss-muralla",
    parroquiaId: "san-simon",
    nombre: "Sub-Parroquia 3 • La Muralla",
    alias: "La Muralla / El Guafal",
    colorBorde: "#c084fc",
    anchoBorde: 2.5,
    colorRelleno: "#a855f7",
    opacidad: 0.18,
    areaHa: 182.2,
    perimetroM: 5200,
    militantes: 2950,
    casas: 1980,
    visible: true,
    vertices: [
      [9.7430, -63.1990],
      [9.7440, -63.1860],
      [9.7310, -63.1850],
      [9.7300, -63.1980],
      [9.7430, -63.1990]
    ]
  }
];

// Polígonos de sectores inician limpios para ser trazados por los operadores
export const DEFAULT_SAN_SIMON_POLIGONOS = [];

export const DEFAULT_COROZO_SUBPARROQUIAS = [
  {
    id: "sub-corozo-1",
    parroquiaId: "el-corozo",
    nombre: "Sub-Parroquia 1 • Casco El Corozo",
    alias: "El Corozo Centro",
    colorBorde: "#c084fc",
    anchoBorde: 2.5,
    colorRelleno: "#a855f7",
    opacidad: 0.2,
    areaHa: 310.5,
    perimetroM: 7200,
    militantes: 1850,
    casas: 980,
    visible: true,
    vertices: [
      [9.7000, -63.2450],
      [9.7030, -63.2150],
      [9.6650, -63.2100],
      [9.6550, -63.2400],
      [9.7000, -63.2450]
    ]
  },
  {
    id: "sub-corozo-2",
    parroquiaId: "el-corozo",
    nombre: "Sub-Parroquia 2 • Amana del Tamarindo",
    alias: "Amana",
    colorBorde: "#a855f7",
    anchoBorde: 2.5,
    colorRelleno: "#9333ea",
    opacidad: 0.2,
    areaHa: 280.2,
    perimetroM: 6800,
    militantes: 1420,
    casas: 740,
    visible: true,
    vertices: [
      [9.7030, -63.2150],
      [9.7050, -63.1950],
      [9.6550, -63.1850],
      [9.6650, -63.2100],
      [9.7030, -63.2150]
    ]
  }
];

export const DEFAULT_COROZO_POLIGONOS = [];

export class EarthStore {
  constructor(catalogo) {
    this.catalogo = catalogo;
    const loaded = this.loadFromStorage();
    this.state = loaded || this.buildInitialState();
    this.ensureAllParishes(this.state);
    this.purgeDummySectors(this.state);
    this.cloudDebounceTimer = null;
    this.cloudSyncState = "idle";
    this.unsubscribeFirestore = null;
  }

  startRealtimeSync() {
    if (this.unsubscribeFirestore) return;
    try {
      this.unsubscribeFirestore = subscribeToTerritories((remoteData) => {
        this.handleFirestoreSnapshot(remoteData);
      });
      console.log("🔥 [EarthStore] Listener en tiempo real de Firestore activado.");
    } catch (e) {
      console.warn("No se pudo iniciar listener Firestore:", e);
    }
  }

  getMostRecentlyUpdatedParish() {
    let latestParish = null;
    let maxScore = -1;
    if (!this.state || !this.state.municipios) return null;

    Object.entries(this.state.municipios).forEach(([munId, mun]) => {
      Object.entries(mun.parroquias || {}).forEach(([parishId, p]) => {
        const polyCount = (p.poligonos || []).length;
        const subCount = (p.subparroquias || []).length;
        if (polyCount === 0 && subCount === 0) return;

        // Priorizar fuertemente las parroquias que tienen sectores/polígonos trazados
        // 1 sector = 1.000.000 puntos
        const score = (polyCount * 1000000) + (subCount * 1000) + (p.updatedAt ? (p.updatedAt % 1000000) : 0);
        if (score > maxScore) {
          maxScore = score;
          latestParish = { munId, parishId, parish: p, score, updatedAt: p.updatedAt || 0 };
        }
      });
    });

    return latestParish;
  }

  ensureAllParishes(state) {
    try {
      if (!state.municipios) state.municipios = {};
      this.catalogo.forEach(mun => {
        if (!state.municipios[mun.id]) {
          state.municipios[mun.id] = {
            id: mun.id,
            nombre: mun.nombre,
            capital: mun.capital,
            color: mun.color,
            visible: true,
            parroquias: {}
          };
        }
        if (!state.municipios[mun.id].parroquias) state.municipios[mun.id].parroquias = {};
        mun.parroquias.forEach(p => {
          if (!state.municipios[mun.id].parroquias[p.id]) {
            state.municipios[mun.id].parroquias[p.id] = {
              id: p.id,
              nombre: p.nombre,
              codigo: p.codigo,
              tipo: p.tipo,
              centro: p.centro,
              zoom: p.zoom,
              limite: p.limite,
              visible: true,
              subparroquias: [],
              poligonos: [],
              rutas: [],
              marcas: [],
              superposiciones: []
            };
          }

          const storedP = state.municipios[mun.id].parroquias[p.id];
          if (!storedP.subparroquias) storedP.subparroquias = [];
          if (!storedP.poligonos) storedP.poligonos = [];
          if (!storedP.rutas) storedP.rutas = [];
          if (!storedP.marcas) storedP.marcas = [];
          if (!storedP.limite && p.limite) storedP.limite = p.limite;
          if (!storedP.centro && p.centro) storedP.centro = p.centro;

          // Estructura limpia e inicial sin polígonos ficticios precargados
        });
      });
    } catch (e) {
      console.warn("Error asegurando integridad de parroquias:", e);
    }
  }

  purgeDummySectors(state) {
    // Purgar polígonos ficticios o de referencia en el centro de Maturín
    let anyPurged = false;
    try {
      if (!state || !state.municipios) return false;
      const dummyIds = new Set([
        "sec-ss-1", "sec-ss-2", "sec-ss-3", "sec-ss-4", "sec-ss-5",
        "sec-cor-1", "sec-cor-2", "poly-corozo-centro", "poly-amana-centro"
      ]);
      Object.entries(state.municipios).forEach(([munId, mun]) => {
        if (mun.parroquias) {
          Object.entries(mun.parroquias).forEach(([parishId, p]) => {
            if (p.poligonos && Array.isArray(p.poligonos)) {
              const beforeCount = p.poligonos.length;
              p.poligonos = p.poligonos.filter(sec => {
                if (!sec || !sec.id) return false;
                if (dummyIds.has(String(sec.id))) return false;
                if (String(sec.id).startsWith("sec-ss-") || String(sec.id).startsWith("sec-cor-")) return false;
                return true;
              });
              if (p.poligonos.length !== beforeCount) {
                anyPurged = true;
                this.syncToCloud(munId, parishId);
              }
            }
          });
        }
      });
    } catch (e) {
      console.warn("Error purgando poligonos dummy:", e);
    }
    return anyPurged;
  }

  buildInitialState() {
    const root = {
      id: "root-monagas",
      nombre: "Mis Lugares (Estado Monagas)",
      visible: true,
      municipios: {}
    };

    this.catalogo.forEach(mun => {
      root.municipios[mun.id] = {
        id: mun.id,
        nombre: mun.nombre,
        capital: mun.capital,
        color: mun.color,
        visible: true,
        parroquias: {}
      };

      mun.parroquias.forEach(p => {
        root.municipios[mun.id].parroquias[p.id] = {
          id: p.id,
          nombre: p.nombre,
          codigo: p.codigo,
          tipo: p.tipo,
          centro: p.centro,
          zoom: p.zoom,
          limite: p.limite,
          visible: true,
          subparroquias: [],
          poligonos: [],
          rutas: [],
          marcas: [],
          superposiciones: []
        };
      });
    });

    return root;
  }

  loadFromStorage() {
    try {
      if (typeof localStorage === "undefined") return null;
      let data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        data = localStorage.getItem("earth_monagas_places_v2") ||
               localStorage.getItem("earth_monagas_places") ||
               localStorage.getItem("earth_monagas_places_v1") ||
               localStorage.getItem("earth_places_monagas");
      }
      if (!data) return null;
      const parsed = JSON.parse(data);
      // Validar estructura básica
      if (parsed && parsed.municipios && typeof parsed.municipios === "object") {
        return parsed;
      }
      return null;
    } catch (e) {
      console.warn("Error cargando lugares desde storage:", e);
      return null;
    }
  }

  saveToStorage() {
    try {
      if (typeof localStorage !== "undefined") {
        const cleanState = cleanItem(this.state);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanState));
      }
    } catch (e) {
      console.warn("[EarthStore] Error guardando en localStorage:", e);
    }
  }

  // ==========================================
  // SINCRONIZACIÓN Y BASE DE DATOS EN LA RED
  // ==========================================

  updateCloudStatus(status) {
    this.cloudSyncState = status;
    if (typeof window !== "undefined" && typeof window.updateEarthCloudBadge === "function") {
      window.updateEarthCloudBadge(status);
    }
  }

  scheduleCloudSync(munId, parishId) {
    if (!this.pendingSyncParishes) this.pendingSyncParishes = new Map();
    this.pendingSyncParishes.set(`${munId}|${parishId}`, { munId, parishId });

    if (this.cloudDebounceTimer) clearTimeout(this.cloudDebounceTimer);
    this.updateCloudStatus("syncing");
    this.cloudDebounceTimer = setTimeout(async () => {
      const queue = Array.from(this.pendingSyncParishes.values());
      this.pendingSyncParishes.clear();
      for (const item of queue) {
        await this.syncToCloud(item.munId, item.parishId);
      }
    }, 300);
  }

  async syncToCloud(munId, parishId) {
    try {
      this.updateCloudStatus("syncing");
      const parish = this.getParish(munId, parishId);
      if (!parish) return false;

      const pKey = `${munId}_${parishId}`;
      const payload = {
        munId,
        parishId,
        pKey,
        subparroquias: parish.subparroquias || [],
        poligonos: parish.poligonos || [],
        rutas: parish.rutas || [],
        marcas: parish.marcas || [],
        updatedAt: Date.now()
      };

      let anySuccess = false;

      // Guardar en Firebase Firestore (Sincronización instantánea multi-dispositivo < 50ms)
      if (isFirebaseConfigured()) {
        try {
          const fbOk = await saveParishToFirestore(munId, parishId, parish);
          if (fbOk) anySuccess = true;
        } catch (eFb) {
          console.warn("Fallo guardando en Firebase Firestore:", eFb);
        }
      }

      this.updateCloudStatus("online");
      return anySuccess;
    } catch (err) {
      console.warn("Aviso en syncToCloud:", err);
      this.updateCloudStatus("online");
      return false;
    }
  }

  handleFirestoreSnapshot(remoteData) {
    if (!remoteData || typeof remoteData !== "object") return;
    let changesApplied = false;

    Object.keys(remoteData).forEach(key => {
      let remoteP = remoteData[key];
      if (!remoteP || typeof remoteP !== "object") return;

      // Desempaquetar si viene serializado en dataJson
      if (remoteP.dataJson && typeof remoteP.dataJson === "string") {
        try {
          const parsed = JSON.parse(remoteP.dataJson);
          remoteP = { ...remoteP, ...parsed };
        } catch (e) {
          console.warn("[EarthStore] Error parseando dataJson:", e);
        }
      }

      const parishId = remoteP.parishId || (key.includes("_") ? key.split("_")[1] : key);
      const munId = remoteP.munId || (key.includes("_") ? key.split("_")[0] : null);

      let localP = munId ? this.getParish(munId, parishId) : null;
      if (!localP) {
        const anyParish = this.findParishById(parishId);
        if (anyParish) localP = anyParish.parish;
      }

      if (localP) {
        if (remoteP.updatedAt) {
          localP.updatedAt = Number(remoteP.updatedAt);
        }
        ["subparroquias", "poligonos", "rutas", "marcas"].forEach(type => {
          if (Array.isArray(remoteP[type])) {
            const merged = mergeItemCollections(localP[type] || [], remoteP[type], localP.deletedIds || []);
            const localCount = (localP[type] || []).length;
            const mergedCount = merged.length;
            let changed = localCount !== mergedCount;
            if (!changed) {
              const localIds = (localP[type] || []).map(i => `${i.id}_${i.updatedAt || 0}`).sort().join("|");
              const mergedIds = merged.map(i => `${i.id}_${i.updatedAt || 0}`).sort().join("|");
              if (localIds !== mergedIds) changed = true;
            }
            if (changed) {
              localP[type] = merged;
              changesApplied = true;
            }
          }
        });
      }
    });

    this.purgeDummySectors(this.state);

    if (changesApplied) {
      this.saveToStorage();
      if (typeof window !== "undefined" && window.earthApp && window.earthApp.mapEngine && typeof window.earthApp.onCloudDataMerged === "function") {
        window.earthApp.onCloudDataMerged();
      }
    }
    this.updateCloudStatus("online");
  }

  async syncAllLocalToCloud() {
    // Sincronización explícita bajo demanda
    try {
      if (!this.state || !this.state.municipios) return;
      this.updateCloudStatus("syncing");

      const parishesToSync = [];
      Object.keys(this.state.municipios).forEach(mId => {
        const mun = this.state.municipios[mId];
        if (mun && mun.parroquias) {
          Object.keys(mun.parroquias).forEach(pId => {
            const p = mun.parroquias[pId];
            const hasData = (p.subparroquias && p.subparroquias.length > 0) ||
                            (p.poligonos && p.poligonos.length > 0) ||
                            (p.rutas && p.rutas.length > 0) ||
                            (p.marcas && p.marcas.length > 0);
            if (hasData) {
              parishesToSync.push({ mId, pId });
            }
          });
        }
      });

      for (const p of parishesToSync) {
        await this.syncToCloud(p.mId, p.pId);
      }
      this.updateCloudStatus("online");
    } catch (e) {
      console.warn("Aviso en syncAllLocalToCloud:", e);
      this.updateCloudStatus("online");
    }
  }

  async syncFromCloud() {
    try {
      this.updateCloudStatus("syncing");
      let cloudData = null;

      // Descarga directa y autoritativa desde Google Cloud Firestore
      if (isFirebaseConfigured()) {
        try {
          const fbData = await fetchAllTerritoriesFromFirestore();
          if (fbData && Object.keys(fbData).length > 0) {
            cloudData = fbData;
          }
        } catch (eFb) {
          console.warn("Aviso leyendo Firestore:", eFb);
        }
      }

      if (!cloudData || typeof cloudData !== "object") {
        this.updateCloudStatus("online");
        return false;
      }

      let changesApplied = false;

      Object.keys(cloudData).forEach(key => {
        let remoteP = cloudData[key];
        if (!remoteP || typeof remoteP !== "object") return;

        // Desempaquetar si viene serializado en dataJson
        if (remoteP.dataJson && typeof remoteP.dataJson === "string") {
          try {
            const parsed = JSON.parse(remoteP.dataJson);
            remoteP = { ...remoteP, ...parsed };
          } catch (e) {
            console.warn("[EarthStore] Error parseando dataJson en syncFromCloud:", e);
          }
        }

        const parishId = remoteP.parishId || (key.includes("_") ? key.split("_")[1] : key);
        const munId = remoteP.munId || (key.includes("_") ? key.split("_")[0] : null);

        let localP = munId ? this.getParish(munId, parishId) : null;
        if (!localP) {
          const anyParish = this.findParishById(parishId);
          if (anyParish) localP = anyParish.parish;
        }

        if (localP) {
          if (remoteP.updatedAt) {
            localP.updatedAt = Number(remoteP.updatedAt);
          }
          ["subparroquias", "poligonos", "rutas", "marcas"].forEach(type => {
            if (Array.isArray(remoteP[type])) {
              const merged = mergeItemCollections(localP[type] || [], remoteP[type], localP.deletedIds || []);
              const localCount = (localP[type] || []).length;
              const mergedCount = merged.length;
              let changed = localCount !== mergedCount;
              if (!changed) {
                const localIds = (localP[type] || []).map(i => `${i.id}_${i.updatedAt || 0}`).sort().join("|");
                const mergedIds = merged.map(i => `${i.id}_${i.updatedAt || 0}`).sort().join("|");
                if (localIds !== mergedIds) changed = true;
              }
              if (changed) {
                localP[type] = merged;
                changesApplied = true;
              }
            }
          });
        }
      });

      this.purgeDummySectors(this.state);

      if (changesApplied) {
        this.saveToStorage();
        if (typeof window !== "undefined" && window.earthApp && window.earthApp.mapEngine && typeof window.earthApp.onCloudDataMerged === "function") {
          window.earthApp.onCloudDataMerged();
        }
      }

      this.updateCloudStatus("online");
      return changesApplied;
    } catch (e) {
      console.warn("Aviso en syncFromCloud:", e);
      this.updateCloudStatus("online");
      return false;
    }
  }

  findParishById(parishId) {
    if (!this.state || !this.state.municipios) return null;
    for (const [munId, mun] of Object.entries(this.state.municipios)) {
      if (mun.parroquias && mun.parroquias[parishId]) {
        return { munId, parishId, parish: mun.parroquias[parishId] };
      }
    }
    return null;
  }

  getParish(munId, parishId) {
    if (!this.state?.municipios?.[munId]?.parroquias?.[parishId]) {
      this.ensureAllParishes(this.state);
    }
    return this.state?.municipios?.[munId]?.parroquias?.[parishId] || null;
  }

  getAllParishesWithData() {
    const list = [];
    if (!this.state || !this.state.municipios) return list;
    Object.keys(this.state.municipios).forEach(munId => {
      const mun = this.state.municipios[munId];
      if (mun && mun.parroquias) {
        Object.keys(mun.parroquias).forEach(pId => {
          const p = mun.parroquias[pId];
          const hasData = (p.poligonos && p.poligonos.length > 0) ||
                          (p.subparroquias && p.subparroquias.length > 0) ||
                          (p.rutas && p.rutas.length > 0) ||
                          (p.marcas && p.marcas.length > 0);
          if (hasData) {
            list.push({ munId, parishId: pId, parish: p });
          }
        });
      }
    });
    return list;
  }

  getAllSubParishesInMun(munId) {
    if (!this.state || !this.state.municipios) return [];
    const mun = this.state.municipios[munId];
    if (!mun || !mun.parroquias) return [];
    const list = [];
    Object.keys(mun.parroquias).forEach(pId => {
      const p = mun.parroquias[pId];
      (p.subparroquias || []).forEach(sp => {
        list.push(Object.assign({}, sp, { munId, parishId: pId }));
      });
    });
    return list;
  }

  async addItemToParish(munId, parishId, type, item) {
    const parish = this.getParish(munId, parishId);
    if (!parish) {
      console.warn(`[EarthStore] No se encontró la parroquia destino ${munId}/${parishId}`);
      return null;
    }

    if (!parish[type]) parish[type] = [];
    const existingIdx = parish[type].findIndex(i => String(i.id) === String(item.id));
    if (existingIdx >= 0) {
      parish[type][existingIdx] = item;
    } else {
      parish[type].push(item);
    }
    parish.updatedAt = Date.now();
    this.saveToStorage();
    await this.syncToCloud(munId, parishId);
    return item;
  }

  async addBatchItemsToParish(munId, parishId, type, items) {
    const parish = this.getParish(munId, parishId);
    if (!parish) {
      console.warn(`[EarthStore] No se encontró la parroquia destino ${munId}/${parishId}`);
      return 0;
    }
    if (!Array.isArray(items) || items.length === 0) return 0;

    if (!parish[type]) parish[type] = [];
    let count = 0;
    items.forEach(item => {
      const existingIdx = parish[type].findIndex(i => String(i.id) === String(item.id));
      if (existingIdx >= 0) {
        parish[type][existingIdx] = item;
      } else {
        parish[type].push(item);
      }
      count++;
    });

    parish.updatedAt = Date.now();
    this.saveToStorage();
    await this.syncToCloud(munId, parishId);
    return count;
  }

  async updateItem(munId, parishId, type, itemId, updatedFields) {
    let parish = this.getParish(munId, parishId);
    let idx = parish && parish[type] ? parish[type].findIndex(i => String(i.id) === String(itemId)) : -1;

    if (idx === -1) {
      const anywhere = this.findItemAnywhere(type, itemId);
      if (anywhere && anywhere.item) {
        parish = this.getParish(anywhere.munId, anywhere.parishId);
        idx = parish && parish[type] ? parish[type].findIndex(i => String(i.id) === String(itemId)) : -1;
      }
    }

    if (parish && idx !== -1) {
      parish[type][idx] = { ...parish[type][idx], ...updatedFields };
      parish.updatedAt = Date.now();
      this.saveToStorage();
      await this.syncToCloud(munId, parishId);
      return parish[type][idx];
    }
    return null;
  }

  moveItem(fromMunId, fromParishId, toMunId, toParishId, type, itemId, updatedFields = {}) {
    // Si la parroquia de origen y destino es la misma, ejecutar actualización local
    if (fromMunId === toMunId && fromParishId === toParishId) {
      return this.updateItem(fromMunId, fromParishId, type, itemId, updatedFields);
    }

    const srcParish = this.getParish(fromMunId, fromParishId);
    const destParish = this.getParish(toMunId, toParishId);
    if (!destParish) return null;

    if (!destParish[type]) destParish[type] = [];

    let itemToMove = null;
    if (srcParish && srcParish[type]) {
      const idx = srcParish[type].findIndex(i => String(i.id) === String(itemId));
      if (idx !== -1) {
        [itemToMove] = srcParish[type].splice(idx, 1);
      }
    }

    // Si no estaba en la parroquia de origen supuesta, buscar en todo el catálogo
    if (!itemToMove) {
      const anywhere = this.findItemAnywhere(type, itemId);
      if (anywhere && anywhere.item) {
        const anyParish = this.getParish(anywhere.munId, anywhere.parishId);
        if (anyParish && anyParish[type]) {
          const idx = anyParish[type].findIndex(i => String(i.id) === String(itemId));
          if (idx !== -1) {
            [itemToMove] = anyParish[type].splice(idx, 1);
          }
        }
      }
    }

    if (!itemToMove) return null;

    const merged = { ...itemToMove, ...updatedFields, munId: toMunId, parishId: toParishId };
    destParish[type].push(merged);
    const now = Date.now();
    if (srcParish) srcParish.updatedAt = now;
    destParish.updatedAt = now;
    this.saveToStorage();
    this.syncToCloud(fromMunId, fromParishId);
    this.syncToCloud(toMunId, toParishId);
    return merged;
  }

  findItemAnywhere(type, itemId) {
    if (!this.state || !this.state.municipios) return null;
    for (const [munId, mun] of Object.entries(this.state.municipios)) {
      for (const [parishId, parish] of Object.entries(mun.parroquias || {})) {
        const item = (parish[type] || []).find(i => String(i.id) === String(itemId));
        if (item) {
          return { munId, parishId, item };
        }
      }
    }
    return null;
  }

  async deleteItem(munId, parishId, type, itemId) {
    let parish = this.getParish(munId, parishId);
    let idx = parish && parish[type] ? parish[type].findIndex(i => String(i.id) === String(itemId)) : -1;

    if (idx === -1) {
      const anywhere = this.findItemAnywhere(type, itemId);
      if (anywhere && anywhere.item) {
        parish = this.getParish(anywhere.munId, anywhere.parishId);
        idx = parish && parish[type] ? parish[type].findIndex(i => String(i.id) === String(itemId)) : -1;
      }
    }

    if (parish && parish[type] && idx !== -1) {
      parish[type].splice(idx, 1);
      if (!parish.deletedIds) parish.deletedIds = [];
      parish.deletedIds.push(String(itemId));
      parish.updatedAt = Date.now();
      this.saveToStorage();
      await this.syncToCloud(munId, parishId);
      return true;
    }
    return false;
  }

  toggleItemVisibility(munId, parishId, type, itemId) {
    const parish = this.getParish(munId, parishId);
    if (!parish || !parish[type]) return;

    const item = parish[type].find(i => i.id === itemId);
    if (item) {
      item.visible = item.visible !== false ? false : true;
      this.saveToStorage();
      return item.visible;
    }
    return true;
  }

  toggleParishVisibility(munId, parishId) {
    const parish = this.getParish(munId, parishId);
    if (!parish) return;
    parish.visible = parish.visible !== false ? false : true;
    this.saveToStorage();
    return parish.visible;
  }

  toggleMunicipalityVisibility(munId) {
    const mun = this.state?.municipios?.[munId];
    if (!mun) return;
    mun.visible = mun.visible !== false ? false : true;
    this.saveToStorage();
    return mun.visible;
  }

  exportToKml(scopeMunId = null, scopeParishId = null) {
    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2">
  <Document>
    <name>${scopeParishId ? "Parroquia " + scopeParishId : (scopeMunId ? "Municipio " + scopeMunId : "Proyecto Monagas — Google Earth Pro")}</name>
    <description>Generado con Google Earth Pro Web (Edición Monagas)</description>
`;

    const processParish = (p, munNombre) => {
      let content = `
      <Folder>
        <name>${p.nombre} (${munNombre})</name>
        <visibility>${p.visible !== false ? 1 : 0}</visibility>
`;
        // Límite Parroquial
        if (p.limite && p.limite.length > 0) {
          const bCoords = p.limite.map(([lat, lng]) => `${lng},${lat},0`).join(" ");
          content += `
        <Placemark>
          <name>Límite Oficial: ${p.nombre}</name>
          <Style><LineStyle><color>ffffffff</color><width>2.5</width></LineStyle><PolyStyle><fill>0</fill></PolyStyle></Style>
          <Polygon><outerBoundaryIs><LinearRing><coordinates>${bCoords}</coordinates></LinearRing></outerBoundaryIs></Polygon>
        </Placemark>
`;
        }

        // Sub-Parroquias / Ejes Comunales (Capa 1)
        (p.subparroquias || []).forEach(sp => {
          if (!sp.vertices || sp.vertices.length < 3) return;
          const coords = sp.vertices.map(([lat, lng]) => `${lng},${lat},0`).join(" ");
          const hexColor = (sp.colorRelleno || "#a855f7").replace("#", "");
          const opacityHex = Math.round((sp.opacidad !== undefined ? sp.opacidad : 0.15) * 255).toString(16).padStart(2, "0");
          const bColorHex = (sp.colorBorde || "#c084fc").replace("#", "");
          content += `
        <Placemark>
          <name>${sp.nombre || "Eje Comunal Sin Nombre"}</name>
          <description><![CDATA[
            <h3>${sp.nombre}</h3>
            <p><strong>Capa 1:</strong> Eje Comunal / Sub-Parroquia</p>
            <p><strong>Área:</strong> ${sp.areaHa || 0} Ha</p>
            <p><strong>Perímetro:</strong> ${sp.perimetroM || 0} m</p>
          ]]></description>
          <ExtendedData>
            <Data name="capa"><value>capa_1_eje</value></Data>
            <Data name="tipo"><value>subparroquia</value></Data>
          </ExtendedData>
          <visibility>${sp.visible !== false ? 1 : 0}</visibility>
          <Style>
            <LineStyle><color>ff${bColorHex.slice(4,6)}${bColorHex.slice(2,4)}${bColorHex.slice(0,2)}</color><width>${sp.anchoBorde || 2.5}</width></LineStyle>
            <PolyStyle><color>${opacityHex}${hexColor.slice(4,6)}${hexColor.slice(2,4)}${hexColor.slice(0,2)}</color><fill>1</fill></PolyStyle>
          </Style>
          <Polygon><outerBoundaryIs><LinearRing><coordinates>${coords}</coordinates></LinearRing></outerBoundaryIs></Polygon>
        </Placemark>
`;
        });

        // Polígonos de Sectores (Capa 2)
        (p.poligonos || []).forEach(poly => {
          const coords = poly.vertices.map(([lat, lng]) => `${lng},${lat},0`).join(" ");
          const hexColor = (poly.colorRelleno || "#38bdf8").replace("#", "");
          const opacityHex = Math.round((poly.opacidad !== undefined ? poly.opacidad : 0.4) * 255).toString(16).padStart(2, "0");
          const bColorHex = (poly.colorBorde || "#ffffff").replace("#", "");
          content += `
        <Placemark>
          <name>${poly.nombre || "Sector Sin Nombre"}</name>
          <description><![CDATA[
            <h3>${poly.nombre}</h3>
            <p>${poly.descripcion || "Sin descripción"}</p>
            <p><strong>Área:</strong> ${poly.areaHa || 0} Ha</p>
            <p><strong>Perímetro:</strong> ${poly.perimetroM || 0} m</p>
          ]]></description>
          <visibility>${poly.visible !== false ? 1 : 0}</visibility>
          <Style>
            <LineStyle><color>ff${bColorHex.slice(4,6)}${bColorHex.slice(2,4)}${bColorHex.slice(0,2)}</color><width>${poly.anchoBorde || 2}</width></LineStyle>
            <PolyStyle><color>${opacityHex}${hexColor.slice(4,6)}${hexColor.slice(2,4)}${hexColor.slice(0,2)}</color><fill>1</fill></PolyStyle>
          </Style>
          <Polygon><outerBoundaryIs><LinearRing><coordinates>${coords}</coordinates></LinearRing></outerBoundaryIs></Polygon>
        </Placemark>
`;
        });

        // Rutas / Calles
        (p.rutas || []).forEach(r => {
          const coords = r.puntos.map(([lat, lng]) => `${lng},${lat},0`).join(" ");
          const strokeHex = (r.color || "#10b981").replace("#", "");
          content += `
        <Placemark>
          <name>${r.nombre || "Calle Sin Nombre"}</name>
          <description><![CDATA[
            <h3>${r.nombre}</h3>
            <p>${r.descripcion || "Sin notas"}</p>
            <p><strong>Longitud:</strong> ${r.longitudM || 0} m</p>
          ]]></description>
          <visibility>${r.visible !== false ? 1 : 0}</visibility>
          <Style>
            <LineStyle><color>ff${strokeHex.slice(4,6)}${strokeHex.slice(2,4)}${strokeHex.slice(0,2)}</color><width>${r.ancho || 4}</width></LineStyle>
          </Style>
          <LineString><coordinates>${coords}</coordinates></LineString>
        </Placemark>
`;
        });

        // Marcas / Placemarks
        (p.marcas || []).forEach(m => {
          content += `
        <Placemark>
          <name>${m.nombre || "Punto de Interés"}</name>
          <description><![CDATA[${m.descripcion || ""}]]></description>
          <visibility>${m.visible !== false ? 1 : 0}</visibility>
          <Point><coordinates>${m.lng},${m.lat},0</coordinates></Point>
        </Placemark>
`;
        });

        content += `      </Folder>\n`;
        return content;
    };

    if (scopeMunId && scopeParishId) {
      const mun = this.state.municipios[scopeMunId];
      const parish = mun?.parroquias[scopeParishId];
      if (parish) kml += processParish(parish, mun.nombre);
    } else if (scopeMunId) {
      const mun = this.state.municipios[scopeMunId];
      if (mun) {
        kml += `  <Folder><name>${mun.nombre}</name>\n`;
        Object.values(mun.parroquias).forEach(p => {
          kml += processParish(p, mun.nombre);
        });
        kml += `  </Folder>\n`;
      }
    } else {
      Object.values(this.state.municipios).forEach(mun => {
        kml += `  <Folder><name>${mun.nombre}</name>\n`;
        Object.values(mun.parroquias).forEach(p => {
          kml += processParish(p, mun.nombre);
        });
        kml += `  </Folder>\n`;
      });
    }

    kml += `  </Document>\n</kml>`;
    return kml;
  }
}
