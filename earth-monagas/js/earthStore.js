/**
 * Gestor de Estado y Árbol de Lugares (Places) — Google Earth Pro Web (Monagas)
 */
import { SECTORES_LAPUENTE, SUBPARROQUIAS_GODOS } from "./geoMonagas.js?v=60";
import { 
  saveParishToFirestore, 
  subscribeToTerritories, 
  isFirebaseConfigured, 
  fetchAllTerritoriesFromFirestore 
} from "./firebaseConfig.js?v=60";

const STORAGE_KEY = "earth_monagas_places_v3";

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

export const DEFAULT_SAN_SIMON_POLIGONOS = [
  {
    id: "sec-ss-1",
    subParroquiaId: "sub-ss-casco",
    nombre: "Sector Casco Central Comercial",
    colorBorde: "#38bdf8",
    anchoBorde: 2,
    colorRelleno: "#38bdf8",
    opacidad: 0.35,
    militantes: 840,
    casas: 520,
    familias: 610,
    habitantes: 2100,
    lider: "Carmen Rondón",
    telefono: "0414-7654321",
    areaHa: 54.2,
    perimetroM: 2980,
    visible: true,
    vertices: [
      [9.7530, -63.1860],
      [9.7540, -63.1780],
      [9.7460, -63.1770],
      [9.7450, -63.1850],
      [9.7530, -63.1860]
    ]
  },
  {
    id: "sec-ss-2",
    subParroquiaId: "sub-ss-casco",
    nombre: "Sector Plaza Bolívar - Ayacucho",
    colorBorde: "#38bdf8",
    anchoBorde: 2,
    colorRelleno: "#38bdf8",
    opacidad: 0.35,
    militantes: 620,
    casas: 390,
    familias: 450,
    habitantes: 1650,
    lider: "José Gregorio Salazar",
    telefono: "0424-9123456",
    areaHa: 42.1,
    perimetroM: 2650,
    visible: true,
    vertices: [
      [9.7550, -63.1830],
      [9.7560, -63.1750],
      [9.7500, -63.1740],
      [9.7490, -63.1820],
      [9.7550, -63.1830]
    ]
  },
  {
    id: "sec-ss-3",
    subParroquiaId: "sub-ss-palonegro",
    nombre: "Sector Brisas del Orinoco",
    colorBorde: "#38bdf8",
    anchoBorde: 2,
    colorRelleno: "#38bdf8",
    opacidad: 0.35,
    militantes: 1250,
    casas: 890,
    familias: 1020,
    habitantes: 3600,
    lider: "Maritza Figuera",
    telefono: "0416-8349201",
    areaHa: 78.6,
    perimetroM: 3560,
    visible: true,
    vertices: [
      [9.7490, -63.1720],
      [9.7480, -63.1620],
      [9.7400, -63.1630],
      [9.7410, -63.1730],
      [9.7490, -63.1720]
    ]
  },
  {
    id: "sec-ss-4",
    subParroquiaId: "sub-ss-palonegro",
    nombre: "Sector Palo Negro",
    colorBorde: "#38bdf8",
    anchoBorde: 2,
    colorRelleno: "#38bdf8",
    opacidad: 0.35,
    militantes: 980,
    casas: 680,
    familias: 790,
    habitantes: 2800,
    lider: "Héctor Maestre",
    telefono: "0412-5551234",
    areaHa: 61.4,
    perimetroM: 3120,
    visible: true,
    vertices: [
      [9.7530, -63.1730],
      [9.7520, -63.1620],
      [9.7470, -63.1630],
      [9.7480, -63.1740],
      [9.7530, -63.1730]
    ]
  },
  {
    id: "sec-ss-5",
    subParroquiaId: "sub-ss-muralla",
    nombre: "Sector La Muralla",
    colorBorde: "#38bdf8",
    anchoBorde: 2,
    colorRelleno: "#38bdf8",
    opacidad: 0.35,
    militantes: 1120,
    casas: 750,
    familias: 860,
    habitantes: 3100,
    lider: "Yulimar Velásquez",
    telefono: "0414-9988776",
    areaHa: 72.0,
    perimetroM: 3410,
    visible: true,
    vertices: [
      [9.7410, -63.1970],
      [9.7420, -63.1880],
      [9.7340, -63.1870],
      [9.7330, -63.1960],
      [9.7410, -63.1970]
    ]
  }
];

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

export const DEFAULT_COROZO_POLIGONOS = [
  {
    id: "poly-corozo-centro",
    subParroquiaId: "sub-corozo-1",
    nombre: "Sector El Corozo Centro",
    descripcion: "Comunidad Central de El Corozo",
    militantes: 620,
    casas: 310,
    habitantes: 620,
    familias: 310,
    colorBorde: "#38bdf8",
    anchoBorde: 2,
    colorRelleno: "#38bdf8",
    opacidad: 0.35,
    areaHa: 45.2,
    perimetroM: 2700,
    visible: true,
    vertices: [
      [9.6860, -63.2320],
      [9.6870, -63.2180],
      [9.6730, -63.2160],
      [9.6720, -63.2300],
      [9.6860, -63.2320]
    ]
  },
  {
    id: "poly-amana-centro",
    subParroquiaId: "sub-corozo-2",
    nombre: "Sector Amana del Tamarindo",
    descripcion: "Comunidad Amana",
    militantes: 480,
    casas: 240,
    habitantes: 480,
    familias: 240,
    colorBorde: "#38bdf8",
    anchoBorde: 2,
    colorRelleno: "#38bdf8",
    opacidad: 0.35,
    areaHa: 38.6,
    perimetroM: 2500,
    visible: true,
    vertices: [
      [9.6880, -63.2100],
      [9.6900, -63.1980],
      [9.6770, -63.1960],
      [9.6750, -63.2080],
      [9.6880, -63.2100]
    ]
  }
];

export class EarthStore {
  constructor(catalogo) {
    this.catalogo = catalogo;
    const loaded = this.loadFromStorage();
    this.state = loaded || this.buildInitialState();
    this.ensureAllParishes(this.state);
    this.purgeDummySectors(this.state);
    this.cloudDebounceTimer = null;
    this.cloudSyncState = "idle";

    // Suscripción en tiempo real a Firebase Firestore (si está configurado)
    try {
      this.unsubscribeFirestore = subscribeToTerritories((remoteData) => {
        this.handleFirestoreSnapshot(remoteData);
      });
    } catch (e) {
      console.warn("No se pudo iniciar listener Firestore:", e);
    }
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

          // Precarga oficial de Sub-Parroquias (Ejes) para San Simón si está vacía
          if (mun.id === "maturin" && p.id === "san-simon") {
            if (storedP.subparroquias.length === 0) {
              storedP.subparroquias = JSON.parse(JSON.stringify(DEFAULT_SAN_SIMON_SUBPARROQUIAS));
            }
          }

          // Precarga oficial para Alto de Los Godos si está vacía
          if (mun.id === "maturin" && p.id === "alto-de-los-godos") {
            if (storedP.subparroquias.length === 0 && Array.isArray(SUBPARROQUIAS_GODOS)) {
              storedP.subparroquias = SUBPARROQUIAS_GODOS.map(sp => ({
                id: sp.id,
                parroquiaId: "alto-de-los-godos",
                nombre: sp.nombre,
                alias: sp.alias || sp.nombre,
                colorBorde: sp.color || "#c084fc",
                anchoBorde: 2.5,
                colorRelleno: sp.color || "#a855f7",
                opacidad: 0.18,
                visible: true,
                vertices: sp.poligono ? [...sp.poligono] : []
              })).filter(s => s.vertices && s.vertices.length >= 3);
            }
          }

          // Precarga oficial para El Corozo si está vacía
          if (mun.id === "maturin" && p.id === "el-corozo") {
            if (storedP.subparroquias.length === 0) {
              storedP.subparroquias = JSON.parse(JSON.stringify(DEFAULT_COROZO_SUBPARROQUIAS));
            }
          }
        });
      });
    } catch (e) {
      console.warn("Error asegurando integridad de parroquias:", e);
    }
  }

  purgeDummySectors(state) {
    // Purgar polígonos ficticios o de referencia en el centro de Maturín
    try {
      if (!state || !state.municipios) return;
      const dummyIds = new Set([
        "sec-ss-1", "sec-ss-2", "sec-ss-3", "sec-ss-4", "sec-ss-5",
        "sec-cor-1", "sec-cor-2"
      ]);
      Object.values(state.municipios).forEach(mun => {
        if (mun.parroquias) {
          Object.values(mun.parroquias).forEach(p => {
            if (p.poligonos && Array.isArray(p.poligonos)) {
              p.poligonos = p.poligonos.filter(sec => {
                if (!sec || !sec.id) return false;
                if (dummyIds.has(String(sec.id))) return false;
                if (String(sec.id).startsWith("sec-ss-") || String(sec.id).startsWith("sec-cor-")) return false;
                return true;
              });
            }
          });
        }
      });
    } catch (e) {
      console.warn("Error purgando poligonos dummy:", e);
    }
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {}
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
    if (this.cloudDebounceTimer) clearTimeout(this.cloudDebounceTimer);
    this.updateCloudStatus("syncing");
    this.cloudDebounceTimer = setTimeout(() => {
      this.syncToCloud(munId, parishId);
    }, 400);
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

      // 1. Guardar en Firebase Firestore (Sincronización instantánea multi-dispositivo)
      if (isFirebaseConfigured()) {
        try {
          const fbOk = await saveParishToFirestore(munId, parishId, parish);
          if (fbOk) anySuccess = true;
        } catch (eFb) {
          console.warn("Fallo guardando en Firebase Firestore:", eFb);
        }
      }

      // 2. Respaldo simultáneo en API Serverless / Vercel
      try {
        const res = await fetch("/api/places", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const json = await res.json();
          if (json.ok) anySuccess = true;
        }
      } catch (e) {
        console.warn("Error en /api/places:", e);
      }

      this.updateCloudStatus(anySuccess ? "online" : "error");
      return anySuccess;
    } catch (err) {
      console.error("Error en syncToCloud:", err);
      this.updateCloudStatus("error");
      return false;
    }
  }

  handleFirestoreSnapshot(remoteData) {
    if (!remoteData || typeof remoteData !== "object") return;
    let changesApplied = false;

    Object.keys(remoteData).forEach(key => {
      const remoteP = remoteData[key];
      if (!remoteP || typeof remoteP !== "object") return;

      const parishId = remoteP.parishId || (key.includes("_") ? key.split("_")[1] : key);
      const munId = remoteP.munId || (key.includes("_") ? key.split("_")[0] : null);

      let localP = munId ? this.getParish(munId, parishId) : null;
      if (!localP) {
        const anyParish = this.findParishById(parishId);
        if (anyParish) localP = anyParish.parish;
      }

      if (localP) {
        ["subparroquias", "poligonos", "rutas", "marcas"].forEach(type => {
          if (Array.isArray(remoteP[type])) {
            if (!Array.isArray(localP[type])) localP[type] = [];
            remoteP[type].forEach(remoteItem => {
              if (!remoteItem || !remoteItem.id) return;
              const localIdx = localP[type].findIndex(li => String(li.id) === String(remoteItem.id));
              if (localIdx === -1) {
                localP[type].push(remoteItem);
                changesApplied = true;
              } else {
                const localItem = localP[type][localIdx];
                if (JSON.stringify(localItem) !== JSON.stringify(remoteItem)) {
                  localP[type][localIdx] = Object.assign({}, localItem, remoteItem);
                  changesApplied = true;
                }
              }
            });
          }
        });
      }
    });

    if (changesApplied) {
      this.saveToStorage();
      if (window.earthApp && typeof window.earthApp.onCloudDataMerged === "function") {
        window.earthApp.onCloudDataMerged();
      }
    }
    this.updateCloudStatus("online");
  }

  async syncAllLocalToCloud() {
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
      console.error("Error en syncAllLocalToCloud:", e);
      this.updateCloudStatus("error");
    }
  }

  async syncFromCloud() {
    try {
      this.updateCloudStatus("syncing");
      let cloudData = null;

      // 0. Intentar Firebase Firestore en tiempo real (si está configurado)
      if (isFirebaseConfigured()) {
        try {
          const fbData = await fetchAllTerritoriesFromFirestore();
          if (fbData && Object.keys(fbData).length > 0) {
            cloudData = fbData;
          }
        } catch (eFb) {}
      }

      // 1. Intentar API Serverless (/api/places)
      if (!cloudData) {
        try {
          const res = await fetch("/api/places");
          if (res.ok) {
            const json = await res.json();
            if (json.ok && json.data) cloudData = json.data;
          }
        } catch (e) {}
      }

      // 2. Fallback directo a GitHub Raw
      if (!cloudData) {
        try {
          const rawUrl = "https://raw.githubusercontent.com/diegodona36-netizen/migato-maturin/main/data/places.json?v=" + Date.now();
          const res = await fetch(rawUrl);
          if (res.ok) {
            cloudData = await res.json();
          }
        } catch (e) {}
      }

      if (!cloudData || typeof cloudData !== "object") {
        this.updateCloudStatus("online");
        return false;
      }

      let changesApplied = false;

      Object.keys(cloudData).forEach(key => {
        const remoteP = cloudData[key];
        if (!remoteP || typeof remoteP !== "object") return;

        const parishId = remoteP.parishId || (key.includes("_") ? key.split("_")[1] : key);
        const munId = remoteP.munId || (key.includes("_") ? key.split("_")[0] : null);

        let localP = munId ? this.getParish(munId, parishId) : null;
        if (!localP) {
          const anyParish = this.findParishById(parishId);
          if (anyParish) localP = anyParish.parish;
        }

        if (localP) {
          ["subparroquias", "poligonos", "rutas", "marcas"].forEach(type => {
            if (Array.isArray(remoteP[type]) && remoteP[type].length > 0) {
              if (!Array.isArray(localP[type])) localP[type] = [];
              remoteP[type].forEach(remoteItem => {
                if (!remoteItem || !remoteItem.id) return;
                const localIdx = localP[type].findIndex(li => String(li.id) === String(remoteItem.id));
                if (localIdx === -1) {
                  localP[type].push(remoteItem);
                  changesApplied = true;
                } else {
                  const localItem = localP[type][localIdx];
                  if (JSON.stringify(localItem) !== JSON.stringify(remoteItem)) {
                    localP[type][localIdx] = Object.assign({}, localItem, remoteItem);
                    changesApplied = true;
                  }
                }
              });
            }
          });
        }
      });

      if (changesApplied) {
        this.saveToStorage();
        if (window.earthApp && typeof window.earthApp.onCloudDataMerged === "function") {
          window.earthApp.onCloudDataMerged();
        }
      }

      this.updateCloudStatus("online");
      return changesApplied;
    } catch (e) {
      console.error("Error en syncFromCloud:", e);
      this.updateCloudStatus("error");
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

  addItemToParish(munId, parishId, type, item) {
    const parish = this.getParish(munId, parishId);
    if (!parish) {
      console.warn(`[EarthStore] No se encontró la parroquia destino ${munId}/${parishId}`);
      return null;
    }

    if (!parish[type]) parish[type] = [];
    parish[type].push(item);
    this.saveToStorage();
    this.scheduleCloudSync(munId, parishId);
    return item;
  }

  updateItem(munId, parishId, type, itemId, updatedFields) {
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
      this.saveToStorage();
      this.scheduleCloudSync(munId, parishId);
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
    this.saveToStorage();
    this.scheduleCloudSync(fromMunId, fromParishId);
    this.scheduleCloudSync(toMunId, toParishId);
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

  deleteItem(munId, parishId, type, itemId) {
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
      this.saveToStorage();
      this.scheduleCloudSync(munId, parishId);
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

        // Polígonos de Sectores
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
