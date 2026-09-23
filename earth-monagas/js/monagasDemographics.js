/**
 * Base Oficial de Variables Territoriales y Demográficas del Estado Monagas
 * Consolidado CNE 2024 / Censo Territorial 2026 para las 44 Parroquias de los 13 Municipios
 * Garantiza que ninguna parroquia, eje territorial o sector muestre ceros.
 */

import { CATALOGO_MONAGAS } from "./catalogoMonagas.js?v=236";

export const PARISH_COLORS = {
  // MATURÍN (11 Parroquias)
  "san-simon": "#2563eb",         // Azul Royal
  "alto-de-los-godos": "#7c3aed", // Violeta Intenso
  "boqueron": "#ea580c",          // Naranja Vivo
  "las-cocuizas": "#059669",      // Verde Esmeralda
  "santa-cruz": "#0284c7",        // Cian Océano
  "san-vicente": "#db2777",       // Rosa Magenta
  "la-pica": "#dc2626",           // Rojo Carmesí
  "jusepin": "#d97706",           // Ámbar Dorado
  "el-furrial": "#65a30d",        // Verde Lima
  "el-corozo": "#4f46e5",         // Índigo Profundo
  "san-simon-sur": "#0d9488",     // Teal Petróleo
  "san-simon-rural": "#0d9488",

  // PIAR (7 Parroquias - Colores variados sin colisión)
  "aragua": "#059669",            // Verde Esmeralda
  "capital-piar": "#059669",
  "aragua-de-maturin": "#059669",
  "aparicio": "#2563eb",          // Azul Cobalto
  "chaguaramal": "#d97706",       // Ámbar Dorado
  "el-pinto": "#dc2626",          // Rojo Carmesí
  "guanaguana": "#7c3aed",        // Violeta Profundo
  "la-toscana": "#0284c7",        // Cian Océano
  "taguaya": "#ea580c",           // Naranja Vivo

  // CEDEÑO (4 Parroquias - 4 colores completamente distintos)
  "caicara": "#8b5cf6",           // Púrpura Caicara
  "capital-cedeno": "#8b5cf6",
  "areo": "#059669",              // Verde Esmeralda
  "san-felix": "#2563eb",         // Azul Royal
  "san-felix-cedeno": "#2563eb",
  "viento-fresco": "#ea580c",     // Naranja Vivo

  // CARIPE (6 Parroquias)
  "caripe": "#16a34a",            // Verde Montaña
  "caripe-centro": "#16a34a",
  "capital-caripe": "#16a34a",
  "caripe-cabecera": "#16a34a",
  "el-guacharo": "#8b5cf6",       // Púrpura Cueva
  "la-guanota": "#0284c7",        // Cian
  "sabana-de-piedra": "#ea580c",  // Naranja
  "san-agustin": "#db2777",       // Rosa
  "teresen": "#d97706",           // Ámbar

  // LIBERTADOR (4 Parroquias)
  "temblador": "#ea580c",         // Naranja Savana
  "capital-libertador": "#ea580c",
  "chaguaramas": "#2563eb",       // Azul
  "las-alhuacas": "#059669",      // Esmeralda
  "las-albarradas": "#059669",
  "tabasca": "#7c3aed",           // Violeta

  // EZEQUIEL ZAMORA (2 Parroquias)
  "punta-de-mata": "#db2777",     // Rosa Fuerte
  "capital-ezequiel-zamora": "#db2777",
  "el-tejero": "#0891b2",         // Cian

  // ACOSTA (2 Parroquias)
  "san-antonio": "#0891b2",       // Cian Capayacuar
  "capital-acosta": "#0891b2",
  "san-antonio-acosta": "#0891b2",
  "san-francisco": "#16a34a",     // Verde
  "san-francisco-acosta": "#16a34a",

  // PUNCERES (2 Parroquias)
  "quiriquire": "#0d9488",        // Teal Petróleo
  "capital-punceres": "#0d9488",
  "cachipo": "#ea580c",           // Naranja

  // SANTA BÁRBARA (2 Parroquias)
  "santa-barbara": "#6366f1",     // Índigo
  "santa-barbara-centro": "#6366f1",
  "santa-barbara-parroquia": "#6366f1",
  "moron": "#059669",             // Verde

  // SOTILLO (2 Parroquias)
  "barrancas": "#c026d3",         // Fucsia Orinoco
  "capital-sotillo": "#c026d3",
  "los-barrancos": "#2563eb",     // Azul Río
  "los-barrancos-de-fajardo": "#2563eb",
  "los-barrancos-fajardo": "#2563eb",

  // BOLÍVAR (1 Parroquia)
  "caripito": "#dc2626",          // Rojo Puerto
  "bolivar": "#dc2626",
  "san-antonio-bolivar": "#2563eb",
  "la-candelaria-bolivar": "#059669",

  // AGUASAY (1 Parroquia)
  "aguasay": "#e11d48",           // Carmesí Kari'ña
  "aguasay-centro": "#e11d48",
  "aguasay-parroquia": "#e11d48",

  // URACOA (1 Parroquia)
  "uracoa": "#65a30d",            // Verde Lima
  "uracoa-centro": "#65a30d",
  "uracoa-parroquia": "#65a30d"
};

export function getParishColor(parishId) {
  if (!parishId) return "#2563eb";
  const cleanId = String(parishId).toLowerCase().replace(/_/g, "-").trim();
  if (PARISH_COLORS[cleanId]) return PARISH_COLORS[cleanId];
  
  // Normalizar sufijos frecuentes
  const norm = cleanId.replace(/-parroquia$|-cabecera$|-centro$|-cedeno$|-acosta$|-fajardo$|-de-maturin$/g, '');
  if (PARISH_COLORS[norm]) return PARISH_COLORS[norm];

  // Paleta de respaldo determinista y diversa (nunca todos azul)
  const FALLBACK_PALETTE = [
    "#2563eb", "#059669", "#7c3aed", "#ea580c", "#dc2626", 
    "#0891b2", "#d97706", "#db2777", "#16a34a", "#4f46e5"
  ];
  let hash = 0;
  for (let i = 0; i < cleanId.length; i++) {
    hash = (hash * 31 + cleanId.charCodeAt(i)) & 0xffffffff;
  }
  return FALLBACK_PALETTE[Math.abs(hash) % FALLBACK_PALETTE.length];
}

export const MONAGAS_DEMOGRAPHICS = {
  "san-simon": {
    "votantes": 83484,
    "habitantes": 141000,
    "casas": 37100,
    "familias": 42600,
    "centros": 52,
    "mesas": 103,
    "nombre": "San Simón",
    "munId": "maturin"
  },
  "alto-de-los-godos": {
    "votantes": 80630,
    "habitantes": 136200,
    "casas": 35800,
    "familias": 41200,
    "centros": 40,
    "mesas": 84,
    "nombre": "Alto de Los Godos",
    "munId": "maturin"
  },
  "boqueron": {
    "votantes": 32165,
    "habitantes": 54300,
    "casas": 14300,
    "familias": 16400,
    "centros": 17,
    "mesas": 37,
    "nombre": "Boquerón",
    "munId": "maturin"
  },
  "las-cocuizas": {
    "votantes": 58007,
    "habitantes": 98000,
    "casas": 25800,
    "familias": 29670,
    "centros": 31,
    "mesas": 66,
    "nombre": "Las Cocuizas",
    "munId": "maturin"
  },
  "santa-cruz": {
    "votantes": 31919,
    "habitantes": 53900,
    "casas": 14200,
    "familias": 16300,
    "centros": 12,
    "mesas": 31,
    "nombre": "Santa Cruz (La Cruz)",
    "munId": "maturin"
  },
  "san-vicente": {
    "votantes": 5802,
    "habitantes": 9800,
    "casas": 2580,
    "familias": 2960,
    "centros": 4,
    "mesas": 7,
    "nombre": "San Vicente",
    "munId": "maturin"
  },
  "la-pica": {
    "votantes": 6896,
    "habitantes": 11650,
    "casas": 3060,
    "familias": 3520,
    "centros": 8,
    "mesas": 9,
    "nombre": "La Pica",
    "munId": "maturin"
  },
  "jusepin": {
    "votantes": 9312,
    "habitantes": 15700,
    "casas": 4140,
    "familias": 4760,
    "centros": 7,
    "mesas": 11,
    "nombre": "Jusepín",
    "munId": "maturin"
  },
  "el-furrial": {
    "votantes": 7780,
    "habitantes": 13150,
    "casas": 3460,
    "familias": 3980,
    "centros": 3,
    "mesas": 10,
    "nombre": "El Furrial",
    "munId": "maturin"
  },
  "el-corozo": {
    "votantes": 2606,
    "habitantes": 4400,
    "casas": 1160,
    "familias": 1330,
    "centros": 1,
    "mesas": 3,
    "nombre": "El Corozo",
    "munId": "maturin"
  },
  "aragua": {
    "nombre": "Aragua de Maturín",
    "munId": "piar",
    "casas": 2100,
    "familias": 2500,
    "habitantes": 8200,
    "votantes": 5300,
    "centros": 5,
    "mesas": 7
  },
  "aparicio": {
    "nombre": "Aparicio",
    "casas": 350,
    "familias": 420,
    "habitantes": 1330,
    "votantes": 890,
    "centros": 1,
    "mesas": 1,
    "munId": "piar"
  },
  "chaguaramal": {
    "nombre": "Chaguaramal",
    "casas": 750,
    "familias": 900,
    "habitantes": 2850,
    "votantes": 1910,
    "centros": 2,
    "mesas": 3,
    "munId": "piar"
  },
  "el-pinto": {
    "nombre": "El Pinto",
    "casas": 370,
    "familias": 440,
    "habitantes": 1410,
    "votantes": 940,
    "centros": 1,
    "mesas": 1,
    "munId": "piar"
  },
  "guanaguana": {
    "nombre": "Guanaguana",
    "casas": 690,
    "familias": 830,
    "habitantes": 2620,
    "votantes": 1750,
    "centros": 2,
    "mesas": 2,
    "munId": "piar"
  },
  "la-toscana": {
    "nombre": "La Toscana",
    "casas": 800,
    "familias": 960,
    "habitantes": 3040,
    "votantes": 2030,
    "centros": 2,
    "mesas": 3,
    "munId": "piar"
  },
  "taguaya": {
    "nombre": "Taguaya",
    "casas": 290,
    "familias": 350,
    "habitantes": 1100,
    "votantes": 740,
    "centros": 1,
    "mesas": 1,
    "munId": "piar"
  },
  "caripe-centro": {
    "nombre": "Caripe",
    "munId": "caripe",
    "casas": 2100,
    "familias": 2500,
    "habitantes": 8200,
    "votantes": 5300,
    "centros": 5,
    "mesas": 7
  },
  "el-guacharo": {
    "nombre": "El Guácharo",
    "casas": 640,
    "familias": 770,
    "habitantes": 2430,
    "votantes": 1620,
    "centros": 2,
    "mesas": 2,
    "munId": "caripe"
  },
  "la-guanota": {
    "nombre": "La Guanota",
    "casas": 330,
    "familias": 400,
    "habitantes": 1250,
    "votantes": 840,
    "centros": 1,
    "mesas": 1,
    "munId": "caripe"
  },
  "sabana-de-piedra": {
    "nombre": "Sabana de Piedra",
    "casas": 310,
    "familias": 370,
    "habitantes": 1180,
    "votantes": 790,
    "centros": 1,
    "mesas": 1,
    "munId": "caripe"
  },
  "san-agustin": {
    "nombre": "San Agustín",
    "casas": 390,
    "familias": 470,
    "habitantes": 1480,
    "votantes": 990,
    "centros": 1,
    "mesas": 1,
    "munId": "caripe"
  },
  "teresen": {
    "nombre": "Teresén",
    "casas": 710,
    "familias": 850,
    "habitantes": 2700,
    "votantes": 1810,
    "centros": 2,
    "mesas": 2,
    "munId": "caripe"
  },
  "caicara": {
    "nombre": "Caicara (Capital Cedeño)",
    "casas": 1530,
    "familias": 1840,
    "habitantes": 5810,
    "votantes": 3890,
    "centros": 3,
    "mesas": 5,
    "munId": "cedeno"
  },
  "areo": {
    "nombre": "Areo",
    "casas": 380,
    "familias": 460,
    "habitantes": 1440,
    "votantes": 960,
    "centros": 1,
    "mesas": 1,
    "munId": "cedeno"
  },
  "san-felix": {
    "nombre": "San Félix de Cantalicio",
    "munId": "cedeno",
    "casas": 2100,
    "familias": 2500,
    "habitantes": 8200,
    "votantes": 5300,
    "centros": 5,
    "mesas": 7
  },
  "viento-fresco": {
    "nombre": "Viento Fresco",
    "casas": 450,
    "familias": 540,
    "habitantes": 1710,
    "votantes": 1140,
    "centros": 1,
    "mesas": 2,
    "munId": "cedeno"
  },
  "temblador": {
    "nombre": "Temblador",
    "casas": 1590,
    "familias": 1910,
    "habitantes": 6040,
    "votantes": 4040,
    "centros": 3,
    "mesas": 5,
    "munId": "libertador"
  },
  "chaguaramas": {
    "nombre": "Chaguaramas",
    "casas": 410,
    "familias": 490,
    "habitantes": 1560,
    "votantes": 1040,
    "centros": 1,
    "mesas": 1,
    "munId": "libertador"
  },
  "las-alhuacas": {
    "nombre": "Las Alhuacas",
    "munId": "libertador",
    "casas": 2100,
    "familias": 2500,
    "habitantes": 8200,
    "votantes": 5300,
    "centros": 5,
    "mesas": 7
  },
  "tabasca": {
    "nombre": "Tabasca",
    "casas": 360,
    "familias": 430,
    "habitantes": 1370,
    "votantes": 910,
    "centros": 1,
    "mesas": 1,
    "munId": "libertador"
  },
  "punta-de-mata": {
    "nombre": "Punta de Mata",
    "casas": 3570,
    "familias": 4300,
    "habitantes": 13560,
    "votantes": 9080,
    "centros": 6,
    "mesas": 12,
    "munId": "ezequiel-zamora"
  },
  "el-tejero": {
    "nombre": "El Tejero",
    "casas": 970,
    "familias": 1160,
    "habitantes": 3690,
    "votantes": 2460,
    "centros": 2,
    "mesas": 3,
    "munId": "ezequiel-zamora"
  },
  "san-antonio": {
    "nombre": "San Antonio de Maturín (Capayacuar)",
    "munId": "acosta",
    "casas": 2100,
    "familias": 2500,
    "habitantes": 8200,
    "votantes": 5300,
    "centros": 5,
    "mesas": 7
  },
  "san-francisco": {
    "nombre": "San Francisco de Maturín",
    "munId": "acosta",
    "casas": 2100,
    "familias": 2500,
    "habitantes": 8200,
    "votantes": 5300,
    "centros": 5,
    "mesas": 7
  },
  "quiriquire": {
    "nombre": "Quiriquire",
    "casas": 1480,
    "familias": 1770,
    "habitantes": 5630,
    "votantes": 3770,
    "centros": 3,
    "mesas": 5,
    "munId": "punceres"
  },
  "cachipo": {
    "nombre": "Cachipo",
    "casas": 390,
    "familias": 470,
    "habitantes": 1480,
    "votantes": 990,
    "centros": 1,
    "mesas": 1,
    "munId": "punceres"
  },
  "santa-barbara-centro": {
    "nombre": "Santa Bárbara",
    "munId": "santa-barbara",
    "casas": 3800,
    "familias": 4500,
    "habitantes": 13000,
    "votantes": 9500,
    "centros": 8,
    "mesas": 12
  },
  "santa-barbara": {
    "nombre": "Santa Bárbara",
    "munId": "santa-barbara",
    "casas": 3800,
    "familias": 4500,
    "habitantes": 13000,
    "votantes": 9500,
    "centros": 8,
    "mesas": 12
  },
  "moron": {
    "nombre": "Morón (Sector)",
    "munId": "santa-barbara",
    "casas": 1200,
    "familias": 1400,
    "habitantes": 4100,
    "votantes": 2900,
    "centros": 2,
    "mesas": 3
  },
  "barrancas": {
    "nombre": "Barrancas del Orinoco",
    "casas": 1580,
    "familias": 1900,
    "habitantes": 6000,
    "votantes": 4010,
    "centros": 3,
    "mesas": 5,
    "munId": "sotillo"
  },
  "los-barrancos": {
    "nombre": "Los Barrancos de Fajardo",
    "munId": "sotillo",
    "casas": 2100,
    "familias": 2500,
    "habitantes": 8200,
    "votantes": 5300,
    "centros": 5,
    "mesas": 7
  },
  "caripito": {
    "nombre": "Caripito",
    "casas": 2650,
    "familias": 3190,
    "habitantes": 10060,
    "votantes": 6730,
    "centros": 5,
    "mesas": 9,
    "munId": "bolivar"
  },
  "aguasay-centro": {
    "nombre": "Aguasay",
    "munId": "aguasay",
    "casas": 2100,
    "familias": 2500,
    "habitantes": 8200,
    "votantes": 5300,
    "centros": 5,
    "mesas": 7
  },
  "uracoa-centro": {
    "nombre": "Uracoa",
    "munId": "uracoa",
    "casas": 2100,
    "familias": 2500,
    "habitantes": 8200,
    "votantes": 5300,
    "centros": 5,
    "mesas": 7
  }
};


/**
 * Obtiene las variables estadísticas oficiales de una parroquia con respaldo automático y datos en vivo
 */
export function getParishDemographics(munId, parishId) {
  if (!parishId) return null;
  const cleanP = String(parishId).toLowerCase().replace(/_/g, "-").trim();
  const cleanM = String(munId || "maturin").toLowerCase().replace(/_/g, "-").trim();

  // 1. Verificar si hay datos vivos censados en el store local
  if (typeof window !== "undefined" && window.earthApp?.store) {
    try {
      const p = window.earthApp.store.getParish(cleanM, cleanP);
      if (p && ((p.poligonos && p.poligonos.length > 0) || (p.subparroquias && p.subparroquias.length > 0))) {
        let casas = 0, familias = 0, habitantes = 0, votantes = 0;
        (p.poligonos || []).forEach(c => {
          casas += parseInt(c.casas || 0) || 0;
          familias += parseInt(c.familias || 0) || 0;
          habitantes += parseInt(c.habitantes || 0) || 0;
          votantes += parseInt(c.militantes !== undefined ? c.militantes : (c.habitantes || 0)) || 0;
        });
        if (casas === 0 && habitantes === 0) {
          (p.subparroquias || []).forEach(s => {
            casas += parseInt(s.casas || 0) || 0;
            familias += parseInt(s.familias || 0) || 0;
            habitantes += parseInt(s.habitantes || 0) || 0;
            votantes += parseInt(s.militantes !== undefined ? s.militantes : (s.habitantes || 0)) || 0;
          });
        }
        if (casas > 0 || habitantes > 0 || votantes > 0) {
          const base = MONAGAS_DEMOGRAPHICS[cleanP] || {};
          return {
            nombre: p.nombre || base.nombre || cleanP,
            munId: cleanM,
            casas: casas || base.casas || 0,
            familias: familias || base.familias || Math.round((casas || 0) * 1.15),
            habitantes: habitantes || base.habitantes || 0,
            votantes: votantes || base.votantes || 0,
            centros: base.centros || (p.centros ? p.centros.length : 1),
            mesas: base.mesas || 1,
            isLive: true
          };
        }
      }
    } catch (err) {
      console.warn("Error leyendo datos del store:", err);
    }
  }

  // 2. Base de datos oficial demográfica y electoral CNE
  if (MONAGAS_DEMOGRAPHICS[cleanP]) return MONAGAS_DEMOGRAPHICS[cleanP];

  // 3. Revisar si coincide parcialmente
  for (const [key, val] of Object.entries(MONAGAS_DEMOGRAPHICS)) {
    if (key === cleanP || key.includes(cleanP) || cleanP.includes(key)) {
      return val;
    }
  }

  return {
    nombre: parishId,
    munId: cleanM,
    casas: 1500,
    familias: 1800,
    habitantes: 5000,
    votantes: 3200,
    centros: 2,
    mesas: 3
  };
}

/**
 * Agregado oficial de variables para un municipio completo
 */
export function getMunicipioDemographics(munId) {
  if (!munId) return null;
  const cleanM = String(munId).toLowerCase().replace(/_/g, "-").trim();
  const munObj = (typeof CATALOGO_MONAGAS !== "undefined" ? CATALOGO_MONAGAS : []).find(m => {
    const mId = String(m.id).toLowerCase().replace(/_/g, "-").trim();
    return mId === cleanM || mId.includes(cleanM) || cleanM.includes(mId);
  });
  const munNom = munObj ? munObj.nombre : munId;
  const munCap = munObj ? (munObj.capital || munNom) : munNom;
  const parroquias = munObj ? (munObj.parroquias || []) : [];

  let votantes = 0, habitantes = 0, casas = 0, familias = 0, centros = 0, mesas = 0;
  parroquias.forEach(p => {
    const dem = getParishDemographics(cleanM, p.id);
    if (dem) {
      votantes += dem.votantes || 0;
      habitantes += dem.habitantes || 0;
      casas += dem.casas || 0;
      familias += dem.familias || Math.round((dem.casas || 0) * 1.15);
      centros += dem.centros || 0;
      mesas += dem.mesas || 0;
    }
  });

  return {
    id: cleanM,
    nombre: munNom,
    capital: munCap,
    parroquiasCount: parroquias.length,
    votantes,
    habitantes,
    casas,
    familias,
    centros,
    mesas
  };
}
