/**
 * Base Geográfica Jerárquica del Estado Monagas
 * 5 Niveles de Detalle (LOD):
 * 1. Estado Monagas (Macro-Polígono)
 * 2. 13 Municipios (Polígonos Cantonales)
 * 3. 44 Parroquias (Polígonos Parroquiales)
 * 4. Sub-Parroquias / Ejes (Sub-divisiones de Parroquia)
 * 5. Sectores / Punto y Círculo (Polígonos de Comunidades)
 */

// 1. NIVEL 1: ESTADO MONAGAS (MACRO-POLÍGONO)
export const ESTADO_MONAGAS = {
  id: "estado-monagas",
  nombre: "Estado Monagas",
  capital: "Maturín",
  centro: [9.5500, -63.1500],
  zoomDefault: 8,
  zoomMin: 6,
  zoomMax: 9,
  superficieKm2: 28900,
  poblacionEstimada: 1020000,
  electoresAprox: 540000,
  centrosVotacionTotal: 536,
  municipiosCount: 13,
  parroquiasCount: 44,
  // Perímetro envolvente del Estado Monagas
  poligono: [
    [10.2600, -63.5500],
    [10.2800, -63.3000],
    [10.1500, -63.0000],
    [10.0800, -62.8000],
    [9.8500, -62.4500],
    [9.5500, -62.2000],
    [9.0000, -62.1000],
    [8.6000, -62.3000],
    [8.4000, -62.5500],
    [8.5000, -62.9000],
    [8.8000, -63.5000],
    [9.1000, -63.9500],
    [9.5000, -64.0500],
    [9.9000, -63.8500],
    [10.2600, -63.5500]
  ]
};

// 2. NIVEL 2: 13 MUNICIPIOS
export const MUNICIPIOS_MONAGAS = [
  {
    id: "maturin",
    nombre: "Maturín",
    capital: "Maturín",
    centro: [9.7469, -63.1812],
    zoomDefault: 11,
    color: "#f59e0b",
    parroquiasCount: 11,
    poblacion: 540000,
    electores: 320000,
    centrosVotacion: 268,
    poligono: [
      [9.9800, -63.3500],
      [9.9500, -62.9000],
      [9.8200, -62.5500],
      [9.5000, -62.6000],
      [9.4000, -63.0500],
      [9.5500, -63.4000],
      [9.8500, -63.4500],
      [9.9800, -63.3500]
    ]
  },
  {
    id: "piar",
    nombre: "Piar",
    capital: "Aragua de Maturín",
    centro: [9.9700, -63.4800],
    zoomDefault: 11,
    color: "#a855f7",
    parroquiasCount: 7,
    poblacion: 52000,
    electores: 31000,
    centrosVotacion: 32,
    poligono: [
      [10.1500, -63.5500],
      [10.1200, -63.3500],
      [9.9200, -63.3800],
      [9.8200, -63.5800],
      [9.9800, -63.6800],
      [10.1500, -63.5500]
    ]
  },
  {
    id: "caripe",
    nombre: "Caripe",
    capital: "Caripe",
    centro: [10.1700, -63.4900],
    zoomDefault: 11,
    color: "#10b981",
    parroquiasCount: 6,
    poblacion: 38000,
    electores: 26000,
    centrosVotacion: 28,
    poligono: [
      [10.2800, -63.5500],
      [10.2600, -63.3500],
      [10.1200, -63.3500],
      [10.1000, -63.6000],
      [10.2800, -63.5500]
    ]
  },
  {
    id: "cedeno",
    nombre: "Cedeño",
    capital: "Caicara",
    centro: [9.8100, -63.6200],
    zoomDefault: 11,
    color: "#0284c7",
    parroquiasCount: 4,
    poblacion: 41000,
    electores: 27000,
    centrosVotacion: 30,
    poligono: [
      [10.0500, -63.8500],
      [9.9800, -63.5800],
      [9.7500, -63.5000],
      [9.6000, -63.8500],
      [9.7800, -64.0000],
      [10.0500, -63.8500]
    ]
  },
  {
    id: "ezequiel-zamora",
    nombre: "Ezequiel Zamora",
    capital: "Punta de Mata",
    centro: [9.7100, -63.6300],
    zoomDefault: 11,
    color: "#e11d48",
    parroquiasCount: 2,
    poblacion: 68000,
    electores: 46000,
    centrosVotacion: 36,
    poligono: [
      [9.8200, -63.7500],
      [9.8000, -63.5000],
      [9.6200, -63.5200],
      [9.6000, -63.7800],
      [9.8200, -63.7500]
    ]
  },
  {
    id: "libertador",
    nombre: "Libertador",
    capital: "Temblador",
    centro: [9.0100, -62.6100],
    zoomDefault: 10,
    color: "#6366f1",
    parroquiasCount: 4,
    poblacion: 55000,
    electores: 34000,
    centrosVotacion: 34,
    poligono: [
      [9.4000, -62.8000],
      [9.3500, -62.4000],
      [8.8500, -62.3000],
      [8.7000, -62.7500],
      [9.1000, -63.0000],
      [9.4000, -62.8000]
    ]
  },
  {
    id: "acosta",
    nombre: "Acosta",
    capital: "San Antonio de Capayacuar",
    centro: [10.1500, -63.7200],
    zoomDefault: 11,
    color: "#06b6d4",
    parroquiasCount: 2,
    poblacion: 21000,
    electores: 15000,
    centrosVotacion: 18,
    poligono: [
      [10.2800, -63.8500],
      [10.2200, -63.6000],
      [10.0500, -63.6800],
      [10.0800, -63.9000],
      [10.2800, -63.8500]
    ]
  },
  {
    id: "punceres",
    nombre: "Punceres",
    capital: "Quiriquire",
    centro: [9.9800, -63.2200],
    zoomDefault: 11,
    color: "#84cc16",
    parroquiasCount: 2,
    poblacion: 31000,
    electores: 21000,
    centrosVotacion: 22,
    poligono: [
      [10.1200, -63.3000],
      [10.0800, -63.1200],
      [9.9000, -63.1500],
      [9.9000, -63.3200],
      [10.1200, -63.3000]
    ]
  },
  {
    id: "bolivar",
    nombre: "Bolívar",
    capital: "Caripito",
    centro: [10.1100, -63.1000],
    zoomDefault: 11,
    color: "#d97706",
    parroquiasCount: 1,
    poblacion: 42000,
    electores: 29000,
    centrosVotacion: 26,
    poligono: [
      [10.2000, -63.1500],
      [10.1800, -62.9800],
      [10.0200, -63.0200],
      [10.0500, -63.1800],
      [10.2000, -63.1500]
    ]
  },
  {
    id: "aguasay",
    nombre: "Aguasay",
    capital: "Aguasay",
    centro: [9.4200, -63.7800],
    zoomDefault: 11,
    color: "#14b8a6",
    parroquiasCount: 1,
    poblacion: 16000,
    electores: 11000,
    centrosVotacion: 14,
    poligono: [
      [9.6000, -63.9500],
      [9.5500, -63.6000],
      [9.3000, -63.6500],
      [9.2500, -64.0000],
      [9.6000, -63.9500]
    ]
  },
  {
    id: "santa-barbara",
    nombre: "Santa Bárbara",
    capital: "Santa Bárbara",
    centro: [9.5800, -63.6200],
    zoomDefault: 11,
    color: "#ec4899",
    parroquiasCount: 1,
    poblacion: 12000,
    electores: 8500,
    centrosVotacion: 10,
    poligono: [
      [9.6800, -63.7000],
      [9.6500, -63.5000],
      [9.5000, -63.5200],
      [9.5000, -63.7200],
      [9.6800, -63.7000]
    ]
  },
  {
    id: "uracoa",
    nombre: "Uracoa",
    capital: "Uracoa",
    centro: [8.7400, -62.3300],
    zoomDefault: 10,
    color: "#3b82f6",
    parroquiasCount: 1,
    poblacion: 11000,
    electores: 7800,
    centrosVotacion: 12,
    poligono: [
      [8.9500, -62.4500],
      [8.9000, -62.2000],
      [8.6000, -62.2500],
      [8.6500, -62.5000],
      [8.9500, -62.4500]
    ]
  },
  {
    id: "sotillo",
    nombre: "Sotillo",
    capital: "Barrancas del Orinoco",
    centro: [8.5900, -62.4600],
    zoomDefault: 10,
    color: "#8b5cf6",
    parroquiasCount: 2,
    poblacion: 28000,
    electores: 18000,
    centrosVotacion: 18,
    poligono: [
      [8.8500, -62.6000],
      [8.7800, -62.3500],
      [8.4000, -62.5000],
      [8.4500, -62.7500],
      [8.8500, -62.6000]
    ]
  }
];

// 3. NIVEL 3: 44 PARROQUIAS
export const PARROQUIAS_MONAGAS = [
  // --- MATURÍN ---
  {
    id: "san-simon",
    municipioId: "maturin",
    nombre: "San Simón (Centro)",
    centro: [9.7469, -63.1812],
    zoomDefault: 13,
    color: "#f59e0b",
    poblacion: 145000,
    electores: 89000,
    centrosVotacion: 42,
    poligono: [
      [9.7640, -63.1960], [9.7670, -63.1700], [9.7550, -63.1580],
      [9.7360, -63.1600], [9.7280, -63.1780], [9.7320, -63.2000],
      [9.7500, -63.2030], [9.7640, -63.1960]
    ]
  },
  {
    id: "alto-de-los-godos",
    municipioId: "maturin",
    nombre: "Alto de Los Godos",
    centro: [9.7280, -63.2060],
    zoomDefault: 13,
    color: "#38bdf8",
    poblacion: 125000,
    electores: 74000,
    centrosVotacion: 38,
    subParroquiasCount: 10,
    poligono: [
      [9.7440, -63.2260], [9.7480, -63.1970], [9.7320, -63.1880],
      [9.7130, -63.1900], [9.7080, -63.2200], [9.7240, -63.2340],
      [9.7440, -63.2260]
    ]
  },
  {
    id: "boqueron",
    municipioId: "maturin",
    nombre: "Boquerón (Tipuro)",
    centro: [9.7880, -63.1900],
    zoomDefault: 13,
    color: "#10b981",
    poblacion: 85000,
    electores: 52000,
    centrosVotacion: 26,
    poligono: [
      [9.8180, -63.2120], [9.8220, -63.1730], [9.7960, -63.1630],
      [9.7660, -63.1760], [9.7630, -63.2060], [9.7830, -63.2270],
      [9.8180, -63.2120]
    ]
  },
  {
    id: "las-cocuizas",
    municipioId: "maturin",
    nombre: "Las Cocuizas",
    centro: [9.7650, -63.1480],
    zoomDefault: 13,
    color: "#a855f7",
    poblacion: 72000,
    electores: 44000,
    centrosVotacion: 24,
    poligono: [
      [9.7850, -63.1600], [9.7820, -63.1250], [9.7500, -63.1200],
      [9.7420, -63.1550], [9.7600, -63.1650], [9.7850, -63.1600]
    ]
  },
  {
    id: "santa-cruz",
    municipioId: "maturin",
    nombre: "Santa Cruz",
    centro: [9.7120, -63.2380],
    zoomDefault: 13,
    color: "#ef4444",
    poblacion: 48000,
    electores: 29000,
    centrosVotacion: 18,
    poligono: [
      [9.7350, -63.2450], [9.7320, -63.2220], [9.7050, -63.2200],
      [9.6950, -63.2500], [9.7150, -63.2600], [9.7350, -63.2450]
    ]
  },
  {
    id: "san-vicente",
    municipioId: "maturin",
    nombre: "San Vicente",
    centro: [9.7380, -63.2720],
    zoomDefault: 13,
    color: "#f97316",
    poblacion: 32000,
    electores: 18000,
    centrosVotacion: 12,
    poligono: [
      [9.7600, -63.2900], [9.7550, -63.2550], [9.7250, -63.2500],
      [9.7180, -63.2850], [9.7450, -63.3000], [9.7600, -63.2900]
    ]
  },
  {
    id: "la-pica",
    municipioId: "maturin",
    nombre: "La Pica",
    centro: [9.7750, -63.0950],
    zoomDefault: 12,
    color: "#14b8a6",
    poblacion: 24000,
    electores: 14000,
    centrosVotacion: 10,
    poligono: [
      [9.8300, -63.1200], [9.8200, -63.0500], [9.7300, -63.0600],
      [9.7400, -63.1300], [9.8300, -63.1200]
    ]
  },
  {
    id: "jusepin",
    municipioId: "maturin",
    nombre: "Jusepín",
    centro: [9.7400, -63.4800],
    zoomDefault: 12,
    color: "#6366f1",
    poblacion: 16000,
    electores: 9500,
    centrosVotacion: 8,
    poligono: [
      [9.8200, -63.5500], [9.8000, -63.4000], [9.6800, -63.4200],
      [9.7000, -63.5800], [9.8200, -63.5500]
    ]
  },
  {
    id: "el-furrial",
    municipioId: "maturin",
    nombre: "El Furrial",
    centro: [9.7050, -63.3850],
    zoomDefault: 12,
    color: "#ec4899",
    poblacion: 19000,
    electores: 11000,
    centrosVotacion: 10,
    poligono: [
      [9.7600, -63.4200], [9.7500, -63.3200], [9.6500, -63.3500],
      [9.6600, -63.4500], [9.7600, -63.4200]
    ]
  },
  {
    id: "el-corozo",
    municipioId: "maturin",
    nombre: "El Corozo",
    centro: [9.6450, -63.2600],
    zoomDefault: 12,
    color: "#84cc16",
    poblacion: 14000,
    electores: 8500,
    centrosVotacion: 8,
    poligono: [
      [9.7000, -63.2800], [9.6900, -63.1800], [9.5800, -63.2000],
      [9.6000, -63.3200], [9.7000, -63.2800]
    ]
  }
];

// 4. NIVEL 4: SUB-PARROQUIAS (EJES TERRITORIALES DE ALTO DE LOS GODOS)
export const SUBPARROQUIAS_MONAGAS = [
  {
    id: "sub-godos-1",
    parroquiaId: "alto-de-los-godos",
    nombre: "Sub-Parroquia 1 • Casco Los Godos",
    alias: "Los Godos I y II",
    centro: [9.7390, -63.2040],
    zoomDefault: 15,
    poblacion: 4050,
    electores: 4770,
    centrosVotacion: 2,
    poligono: [
      [9.7440, -63.2100], [9.7460, -63.2000], [9.7360, -63.1970],
      [9.7320, -63.2070], [9.7440, -63.2100]
    ]
  },
  {
    id: "sub-godos-2",
    parroquiaId: "alto-de-los-godos",
    nombre: "Sub-Parroquia 2 • Morichal",
    alias: "Morichal",
    centro: [9.7340, -63.2120],
    zoomDefault: 15,
    poblacion: 2780,
    electores: 2450,
    centrosVotacion: 1,
    poligono: [
      [9.7380, -63.2180], [9.7400, -63.2080], [9.7280, -63.2050],
      [9.7250, -63.2160], [9.7380, -63.2180]
    ]
  },
  {
    id: "sub-godos-3",
    parroquiaId: "alto-de-los-godos",
    nombre: "Sub-Parroquia 3 • Fundemos",
    alias: "Fundemos I, II y III",
    centro: [9.7420, -63.1960],
    zoomDefault: 15,
    poblacion: 4650,
    electores: 3890,
    centrosVotacion: 1,
    poligono: [
      [9.7470, -63.2010], [9.7480, -63.1920], [9.7360, -63.1900],
      [9.7350, -63.1980], [9.7470, -63.2010]
    ]
  },
  {
    id: "sub-godos-4",
    parroquiaId: "alto-de-los-godos",
    nombre: "Sub-Parroquia 4 • Los Guaros",
    alias: "Los Guaros",
    centro: [9.7280, -63.1960],
    zoomDefault: 15,
    poblacion: 2630,
    electores: 2100,
    centrosVotacion: 1,
    poligono: [
      [9.7340, -63.2010], [9.7330, -63.1910], [9.7220, -63.1930],
      [9.7230, -63.2020], [9.7340, -63.2010]
    ]
  },
  {
    id: "sub-godos-5",
    parroquiaId: "alto-de-los-godos",
    nombre: "Sub-Parroquia 5 • El Silencio",
    alias: "El Silencio de Campo Alegre",
    centro: [9.7180, -63.2040],
    zoomDefault: 15,
    poblacion: 3130,
    electores: 2600,
    centrosVotacion: 1,
    poligono: [
      [9.7240, -63.2120], [9.7230, -63.1970], [9.7120, -63.1980],
      [9.7110, -63.2140], [9.7240, -63.2120]
    ]
  },
  {
    // === SUB-PARROQUIA 6 (LA PUENTE - FICHA OFICIAL) ===
    id: "sub-godos-6",
    parroquiaId: "alto-de-los-godos",
    nombre: 'Sub-Parroquia 6 • Alto De Los Godos "La Puente"',
    alias: "La Puente",
    esPrincipalModelo: true,
    centro: [9.7260, -63.2210],
    zoomDefault: 15,
    poblacion: 16162,
    casas: 5309,
    familias: 6090,
    electores: 10728,
    centrosVotacion: 5,
    sectoresCount: 11,
    // Perímetro envolvente de La Puente
    poligono: [
      [9.7390, -63.2280],
      [9.7420, -63.2140],
      [9.7300, -63.2100],
      [9.7180, -63.2120],
      [9.7120, -63.2260],
      [9.7250, -63.2320],
      [9.7390, -63.2280]
    ]
  },
  {
    id: "sub-godos-7",
    parroquiaId: "alto-de-los-godos",
    nombre: "Sub-Parroquia 7 • 19 de Abril",
    alias: "19 de Abril",
    centro: [9.7150, -63.2240],
    zoomDefault: 15,
    poblacion: 1260,
    electores: 1750,
    centrosVotacion: 1,
    poligono: [
      [9.7200, -63.2300], [9.7190, -63.2180], [9.7090, -63.2190],
      [9.7100, -63.2310], [9.7200, -63.2300]
    ]
  },
  {
    id: "sub-godos-8",
    parroquiaId: "alto-de-los-godos",
    nombre: "Sub-Parroquia 8 • Las Brisas",
    alias: "Alberto Ravell",
    centro: [9.7380, -63.1920],
    zoomDefault: 15,
    poblacion: 1380,
    electores: 2200,
    centrosVotacion: 1,
    poligono: [
      [9.7440, -63.1950], [9.7430, -63.1870], [9.7320, -63.1890],
      [9.7330, -63.1960], [9.7440, -63.1950]
    ]
  },
  {
    id: "sub-godos-9",
    parroquiaId: "alto-de-los-godos",
    nombre: "Sub-Parroquia 9 • San Rafael",
    alias: "San Rafael",
    centro: [9.7220, -63.1910],
    zoomDefault: 15,
    poblacion: 1280,
    electores: 1840,
    centrosVotacion: 1,
    poligono: [
      [9.7280, -63.1950], [9.7270, -63.1880], [9.7160, -63.1890],
      [9.7170, -63.1960], [9.7280, -63.1950]
    ]
  },
  {
    id: "sub-godos-10",
    parroquiaId: "alto-de-los-godos",
    nombre: "Sub-Parroquia 10 • Paramaconi",
    alias: "Paramaconi / Corapal",
    centro: [9.7320, -63.2320],
    zoomDefault: 15,
    poblacion: 2790,
    electores: 2420,
    centrosVotacion: 1,
    poligono: [
      [9.7420, -63.2360], [9.7390, -63.2270], [9.7240, -63.2300],
      [9.7260, -63.2390], [9.7420, -63.2360]
    ]
  }
];

export const SUBPARROQUIAS_GODOS = [
  {
    "id": "SUBPAR-1788965549962",
    "nombre": "sub-parroquia 6",
    "descripcion": "Eje o Circuito Comunal",
    "militantes": 0,
    "casas": 0,
    "habitantes": 0,
    "familias": 0,
    "colorBorde": "#a855f7",
    "anchoBorde": 2,
    "colorRelleno": "#a855f7",
    "opacidad": 0.45,
    "vertices": [
      [
        9.717109926257494,
        -63.208653255045384
      ],
      [
        9.717236825160974,
        -63.20803634697196
      ],
      [
        9.717665108604923,
        -63.20773593956228
      ],
      [
        9.718172703087838,
        -63.20738725239035
      ],
      [
        9.71664988364502,
        -63.20600852119918
      ],
      [
        9.716025962478378,
        -63.20675953972335
      ],
      [
        9.715275140549117,
        -63.20635184395309
      ],
      [
        9.714238859388619,
        -63.206148147583015
      ],
      [
        9.713297682944543,
        -63.20597648620606
      ],
      [
        9.712377653975071,
        -63.20575118064881
      ],
      [
        9.711700849440762,
        -63.20569753646851
      ],
      [
        9.710770240972014,
        -63.20534348487855
      ],
      [
        9.709850205056823,
        -63.20480704307557
      ],
      [
        9.708179328769734,
        -63.204388618469245
      ],
      [
        9.704922153563775,
        -63.20922732353211
      ],
      [
        9.70485870178423,
        -63.21143746376038
      ],
      [
        9.704805825292109,
        -63.21607232093812
      ],
      [
        9.705926805138326,
        -63.217145204544074
      ],
      [
        9.705567245973626,
        -63.22032094001771
      ],
      [
        9.705747025604213,
        -63.22276711463929
      ],
      [
        9.706222912395942,
        -63.22700500488282
      ],
      [
        9.709400761305597,
        -63.22803497314454
      ],
      [
        9.709739166068507,
        -63.22704792022706
      ],
      [
        9.710225622316036,
        -63.2262808084488
      ],
      [
        9.710833691631594,
        -63.22571754455567
      ],
      [
        9.711362446660507,
        -63.22521328926087
      ],
      [
        9.711944076227779,
        -63.22447836399079
      ],
      [
        9.712895831521777,
        -63.22295486927033
      ],
      [
        9.713958621735346,
        -63.22096467018128
      ],
      [
        9.714883933849773,
        -63.21904420852662
      ],
      [
        9.715449694853708,
        -63.21793913841248
      ],
      [
        9.71778146609236,
        -63.21830928325654
      ],
      [
        9.717998251254917,
        -63.21800351142884
      ],
      [
        9.717977101489144,
        -63.21722567081452
      ],
      [
        9.717474794159077,
        -63.21656584739686
      ],
      [
        9.717326745538957,
        -63.21605622768403
      ],
      [
        9.717548818444572,
        -63.2153481245041
      ],
      [
        9.717633417607935,
        -63.214902877807624
      ],
      [
        9.717004210818313,
        -63.21474194526673
      ],
      [
        9.717072947752058,
        -63.21420013904572
      ],
      [
        9.716967198617356,
        -63.21278929710389
      ],
      [
        9.716924898954119,
        -63.21205437183381
      ],
      [
        9.716856161989954,
        -63.21107804775239
      ],
      [
        9.716766275169357,
        -63.210638165473945
      ],
      [
        9.71695133624427,
        -63.20950627326966
      ]
    ],
    "areaHa": 259,
    "perimetroM": 7097,
    "visible": true,
    "fecha": "2026-09-09T14:52:29.962Z",
    "munId": "maturin",
    "parishId": "alto-de-los-godos",
    "color": "#a855f7",
    "ancho": 2,
    "centroVotacion": "",
    "votoDuro": 0,
    "votoBlando": 0,
    "votoNuevo": 0,
    "subParroquiaId": null,
    "isNew": false
  }
];

export const SECTORES_LAPUENTE = [
  {
    "id": "POLY-1788966016501",
    "nombre": "villa de los angeles",
    "descripcion": "Comunidad / Consejo Comunal",
    "militantes": 0,
    "casas": 0,
    "habitantes": 0,
    "familias": 0,
    "colorBorde": "#f97316",
    "anchoBorde": 2,
    "colorRelleno": "#f97316",
    "opacidad": 0.35,
    "vertices": [
      [
        9.711339974588768,
        -63.225268274545684
      ],
      [
        9.70970744063652,
        -63.2250201702118
      ],
      [
        9.709678358987876,
        -63.22496786713601
      ],
      [
        9.70964134597687,
        -63.22489812970163
      ],
      [
        9.709612264322502,
        -63.224747925996795
      ],
      [
        9.709589792133285,
        -63.22458565235139
      ],
      [
        9.709567319942579,
        -63.224371075630195
      ],
      [
        9.709490650104092,
        -63.22424232959748
      ],
      [
        9.709437774343193,
        -63.22416052222253
      ],
      [
        9.709361104475063,
        -63.22403982281686
      ],
      [
        9.708920913340663,
        -63.22335049510003
      ],
      [
        9.708852174732915,
        -63.22320297360422
      ],
      [
        9.708813839733999,
        -63.22310641407967
      ],
      [
        9.70876889524693,
        -63.223000466823585
      ],
      [
        9.708726594547697,
        -63.222899883985534
      ],
      [
        9.708680328151798,
        -63.22279661893845
      ],
      [
        9.708607623802477,
        -63.22261825203896
      ],
      [
        9.708374969778566,
        -63.22248011827469
      ],
      [
        9.708464858852434,
        -63.2209861278534
      ],
      [
        9.708920913340663,
        -63.22102904319764
      ],
      [
        9.709441740025559,
        -63.22107866406442
      ],
      [
        9.70996653157651,
        -63.22113230824471
      ],
      [
        9.710486034745074,
        -63.22119668126107
      ],
      [
        9.71093812081599,
        -63.22125971317292
      ],
      [
        9.711441759842826,
        -63.22129592299462
      ],
      [
        9.71191102912035,
        -63.22134822607041
      ],
      [
        9.713567346128801,
        -63.22150111198426
      ],
      [
        9.712541567367397,
        -63.223443031311035
      ]
    ],
    "areaHa": 17.4,
    "perimetroM": 1483,
    "visible": true,
    "fecha": "2026-09-09T15:00:16.501Z",
    "munId": "maturin",
    "parishId": "alto-de-los-godos",
    "subParroquiaId": "SUBPAR-1788965549962",
    "color": "#f97316",
    "ancho": 2,
    "centroVotacion": "",
    "votoDuro": 0,
    "votoBlando": 0,
    "votoNuevo": 0,
    "isNew": false
  },
  {
    "id": "POLY-1788967024859",
    "nombre": "el mangozal",
    "descripcion": "Comunidad / Consejo Comunal",
    "militantes": 0,
    "casas": 0,
    "habitantes": 0,
    "familias": 0,
    "colorBorde": "#a855f7",
    "anchoBorde": 2,
    "colorRelleno": "#a855f7",
    "opacidad": 0.45,
    "vertices": [
      [
        9.708459571260516,
        -63.22099685668945
      ],
      [
        9.706460855538273,
        -63.22079300880433
      ],
      [
        9.706444992667391,
        -63.22083055973054
      ],
      [
        9.706164748490993,
        -63.22075545787812
      ],
      [
        9.705963818559841,
        -63.22092175483704
      ],
      [
        9.705762888508158,
        -63.2211846113205
      ],
      [
        9.705662423437134,
        -63.22168350219727
      ],
      [
        9.705752313238941,
        -63.22200536727906
      ],
      [
        9.705815764849241,
        -63.222160935401924
      ],
      [
        9.705900366977593,
        -63.22229504585267
      ],
      [
        9.706016694869207,
        -63.22242379188538
      ],
      [
        9.70619118663086,
        -63.222595453262336
      ],
      [
        9.70641326692334,
        -63.22279930114747
      ],
      [
        9.70670937375092,
        -63.22302997112275
      ],
      [
        9.70693674131589,
        -63.223384022712715
      ],
      [
        9.70688915276855,
        -63.22421550750733
      ],
      [
        9.706989617471661,
        -63.22478950023652
      ],
      [
        9.707005480316766,
        -63.226152062416084
      ],
      [
        9.70700019270182,
        -63.22669386863709
      ],
      [
        9.706973754625793,
        -63.22701573371888
      ],
      [
        9.706957891779199,
        -63.22724103927613
      ],
      [
        9.709400761305597,
        -63.22803497314454
      ],
      [
        9.709733878496715,
        -63.22706401348115
      ],
      [
        9.710130446149305,
        -63.22644174098969
      ],
      [
        9.71021504718773,
        -63.22630226612092
      ],
      [
        9.711309571195196,
        -63.2252722978592
      ],
      [
        9.709696865491853,
        -63.22503089904786
      ],
      [
        9.709617551896203,
        -63.224880695343025
      ],
      [
        9.709564676155342,
        -63.224381804466255
      ],
      [
        9.708930166613714,
        -63.223351836204536
      ],
      [
        9.708607623802477,
        -63.222622275352485
      ],
      [
        9.708369682185248,
        -63.22246670722962
      ],
      [
        9.708380257371822,
        -63.22206974029542
      ]
    ],
    "areaHa": 22.8,
    "perimetroM": 2259,
    "visible": true,
    "fecha": "2026-09-09T15:17:04.859Z",
    "munId": "maturin",
    "parishId": "alto-de-los-godos",
    "subParroquiaId": "SUBPAR-1788965549962",
    "color": "#a855f7",
    "ancho": 2,
    "centroVotacion": "",
    "votoDuro": 0,
    "votoBlando": 0,
    "votoNuevo": 0,
    "isNew": false
  },
  {
    "id": "POLY-1788967978671",
    "nombre": "las vigenes",
    "descripcion": "Comunidad / Consejo Comunal",
    "militantes": 0,
    "casas": 0,
    "habitantes": 0,
    "familias": 0,
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#38bdf8",
    "opacidad": 0.35,
    "vertices": [
      [
        9.715581881866317,
        -63.217349052429206
      ],
      [
        9.713731258938564,
        -63.22144746780396
      ],
      [
        9.706450280291104,
        -63.22079837322236
      ],
      [
        9.706994905086772,
        -63.21725249290467
      ]
    ],
    "areaHa": 15.6,
    "perimetroM": 1192,
    "visible": true,
    "fecha": "2026-09-09T15:32:58.671Z",
    "munId": "maturin",
    "parishId": "alto-de-los-godos",
    "subParroquiaId": "SUBPAR-1788965549962"
  },
  {
    "id": "POLY-1788968547771",
    "nombre": "hugo chavez ll",
    "descripcion": "Comunidad / Consejo Comunal",
    "militantes": 0,
    "casas": 0,
    "habitantes": 0,
    "familias": 0,
    "colorBorde": "#10b981",
    "anchoBorde": 2,
    "colorRelleno": "#10b981",
    "opacidad": 0.6,
    "vertices": [
      [
        9.715439119890435,
        -63.21794450283051
      ],
      [
        9.71778146609236,
        -63.21830928325654
      ],
      [
        9.718008826137302,
        -63.2180142402649
      ],
      [
        9.717971814047486,
        -63.21723103523255
      ],
      [
        9.71746421925981,
        -63.21654975414277
      ],
      [
        9.717326745538957,
        -63.21604549884797
      ],
      [
        9.717538243547645,
        -63.215396404266365
      ],
      [
        9.717622842713693,
        -63.214897513389595
      ],
      [
        9.717004210818313,
        -63.21474194526673
      ],
      [
        9.716956623702059,
        -63.21502089500428
      ],
      [
        9.71682443723251,
        -63.21545541286469
      ],
      [
        9.716589145187504,
        -63.216010630130775
      ],
      [
        9.716438452442572,
        -63.21635931730271
      ],
      [
        9.716332703107355,
        -63.21656048297883
      ],
      [
        9.716166147836608,
        -63.21680992841721
      ]
    ],
    "areaHa": 5.5,
    "perimetroM": 990,
    "visible": true,
    "fecha": "2026-09-09T15:42:27.771Z",
    "munId": "maturin",
    "parishId": "alto-de-los-godos",
    "subParroquiaId": "SUBPAR-1788965549962",
    "color": "#10b981",
    "ancho": 2,
    "centroVotacion": "",
    "votoDuro": 0,
    "votoBlando": 0,
    "votoNuevo": 0,
    "isNew": false
  },
  {
    "id": "POLY-1788968986348",
    "nombre": "la lucha",
    "descripcion": "Comunidad / Consejo Comunal",
    "militantes": 0,
    "casas": 0,
    "habitantes": 0,
    "familias": 0,
    "colorBorde": "#ef4444",
    "anchoBorde": 2,
    "colorRelleno": "#ef4444",
    "opacidad": 0.5,
    "vertices": [
      [
        9.708327381435597,
        -63.21480631828309
      ],
      [
        9.707142958276206,
        -63.214398622512824
      ],
      [
        9.706656497550915,
        -63.21422696113587
      ],
      [
        9.706275788664406,
        -63.21407675743104
      ],
      [
        9.705937380402034,
        -63.21393728256226
      ],
      [
        9.705355740402354,
        -63.21373343467713
      ],
      [
        9.705577821248681,
        -63.21317553520203
      ],
      [
        9.705884504080162,
        -63.212617635726936
      ],
      [
        9.705895079345192,
        -63.21175932884217
      ],
      [
        9.705503794316266,
        -63.21172714233399
      ],
      [
        9.704863989432992,
        -63.211668133735664
      ],
      [
        9.704863989432992,
        -63.21139186620713
      ],
      [
        9.70513365940879,
        -63.21144551038743
      ],
      [
        9.705331946017218,
        -63.211499154567726
      ],
      [
        9.705543451603528,
        -63.21144819259644
      ],
      [
        9.706003475792638,
        -63.21097075939179
      ],
      [
        9.706320733486033,
        -63.21072131395341
      ],
      [
        9.706894440385252,
        -63.21056842803956
      ],
      [
        9.707661143923835,
        -63.210479915142066
      ],
      [
        9.708578542058328,
        -63.21007758378983
      ],
      [
        9.709078218947628,
        -63.20980936288834
      ],
      [
        9.709086150320806,
        -63.21070790290833
      ],
      [
        9.709070287574248,
        -63.2113328576088
      ],
      [
        9.709072931365391,
        -63.211861252784736
      ],
      [
        9.708985686246594,
        -63.212413787841804
      ]
    ],
    "areaHa": 15.2,
    "perimetroM": 1534,
    "visible": true,
    "fecha": "2026-09-09T15:49:46.348Z",
    "munId": "maturin",
    "parishId": "alto-de-los-godos",
    "subParroquiaId": "SUBPAR-1788965549962",
    "color": "#ef4444",
    "ancho": 2,
    "centroVotacion": "",
    "votoDuro": 0,
    "votoBlando": 0,
    "votoNuevo": 0,
    "isNew": false
  },
  {
    "id": "POLY-1788969435080",
    "nombre": "sector ll",
    "descripcion": "Comunidad / Consejo Comunal",
    "militantes": 0,
    "casas": 0,
    "habitantes": 0,
    "familias": 0,
    "colorBorde": "#f97316",
    "anchoBorde": 2,
    "colorRelleno": "#f97316",
    "opacidad": 0.35,
    "vertices": [
      [
        9.708827058699642,
        -63.212995827198036
      ],
      [
        9.710096076971336,
        -63.21325063705445
      ],
      [
        9.710363098953561,
        -63.213395476341255
      ],
      [
        9.71113772587526,
        -63.21409821510316
      ],
      [
        9.711647974028885,
        -63.214634656906135
      ],
      [
        9.712131783736087,
        -63.21514159440995
      ],
      [
        9.71287996895572,
        -63.21526229381562
      ],
      [
        9.712689618104381,
        -63.216147422790534
      ],
      [
        9.71240937915404,
        -63.21709960699082
      ],
      [
        9.711227614207447,
        -63.21701109409333
      ],
      [
        9.71041068700724,
        -63.21693867444993
      ],
      [
        9.709197189525666,
        -63.216850161552436
      ],
      [
        9.708686937637317,
        -63.216914534568794
      ],
      [
        9.708464858852434,
        -63.217265903949745
      ],
      [
        9.70748929673158,
        -63.217233717441566
      ],
      [
        9.7069763984335,
        -63.21725249290467
      ],
      [
        9.70673845565738,
        -63.218851089477546
      ],
      [
        9.706492581277821,
        -63.220522105693824
      ],
      [
        9.706688223271925,
        -63.218816220760345
      ],
      [
        9.706823057552699,
        -63.21760386228562
      ],
      [
        9.707053068847566,
        -63.21681261062622
      ],
      [
        9.705662423437134,
        -63.2162868976593
      ],
      [
        9.705419192087753,
        -63.2159972190857
      ],
      [
        9.70523941228123,
        -63.215600252151496
      ],
      [
        9.705197111136261,
        -63.21517109870911
      ],
      [
        9.705228836995488,
        -63.21467757225037
      ],
      [
        9.705366315684088,
        -63.21372270584107
      ],
      [
        9.708353819404746,
        -63.21482241153718
      ]
    ],
    "areaHa": 25.6,
    "perimetroM": 2961,
    "visible": true,
    "fecha": "2026-09-09T15:57:15.080Z",
    "munId": "maturin",
    "parishId": "alto-de-los-godos",
    "subParroquiaId": "SUBPAR-1788965549962",
    "color": "#f97316",
    "ancho": 2,
    "centroVotacion": "",
    "votoDuro": 0,
    "votoBlando": 0,
    "votoNuevo": 0,
    "isNew": false
  },
  {
    "id": "POLY-1788969661840",
    "nombre": "la canada",
    "descripcion": "Comunidad / Consejo Comunal",
    "militantes": 0,
    "casas": 0,
    "habitantes": 0,
    "familias": 0,
    "colorBorde": "#a855f7",
    "anchoBorde": 2,
    "colorRelleno": "#a855f7",
    "opacidad": 0.45,
    "vertices": [
      [
        9.71345102086028,
        -63.21250498294831
      ],
      [
        9.713300326702317,
        -63.21329355239869
      ],
      [
        9.713160207512106,
        -63.2139265537262
      ],
      [
        9.712996294422696,
        -63.21467757225037
      ],
      [
        9.712890543999842,
        -63.215270340442665
      ],
      [
        9.712694905629483,
        -63.216142058372505
      ],
      [
        9.712412022918812,
        -63.21710497140885
      ],
      [
        9.715589813085403,
        -63.21734637022019
      ],
      [
        9.714878646359239,
        -63.21892619132996
      ],
      [
        9.715552800728013,
        -63.217743337154396
      ],
      [
        9.715788093501724,
        -63.217408061027534
      ],
      [
        9.716369715378475,
        -63.216493427753456
      ],
      [
        9.716819149772636,
        -63.21545541286469
      ],
      [
        9.716959267430914,
        -63.21502625942231
      ],
      [
        9.717070304024093,
        -63.21420818567277
      ],
      [
        9.7170015670898,
        -63.2132774591446
      ]
    ],
    "areaHa": 20.5,
    "perimetroM": 1743,
    "visible": true,
    "fecha": "2026-09-09T16:01:01.840Z",
    "munId": "maturin",
    "parishId": "alto-de-los-godos",
    "subParroquiaId": "SUBPAR-1788965549962",
    "color": "#a855f7",
    "ancho": 2,
    "centroVotacion": "",
    "votoDuro": 0,
    "votoBlando": 0,
    "votoNuevo": 0,
    "isNew": false
  },
  {
    "id": "POLY-1788969880668",
    "nombre": "la laguna",
    "descripcion": "Comunidad / Consejo Comunal",
    "militantes": 0,
    "casas": 0,
    "habitantes": 0,
    "familias": 0,
    "colorBorde": "#ef4444",
    "anchoBorde": 2,
    "colorRelleno": "#ef4444",
    "opacidad": 0.35,
    "vertices": [
      [
        9.713456308373372,
        -63.20900201797486
      ],
      [
        9.713456308373372,
        -63.21249961853028
      ],
      [
        9.715708781349306,
        -63.21300387382508
      ],
      [
        9.717009498275237,
        -63.21327209472657
      ],
      [
        9.71687202436757,
        -63.21121215820313
      ],
      [
        9.716776850090685,
        -63.210643529891975
      ],
      [
        9.71722099648448,
        -63.208132982254035
      ],
      [
        9.715359807655311,
        -63.208615779876716
      ],
      [
        9.714587834251493,
        -63.20883035659791
      ]
    ],
    "areaHa": 18,
    "perimetroM": 1659,
    "visible": true,
    "fecha": "2026-09-09T16:04:40.668Z",
    "munId": "maturin",
    "parishId": "alto-de-los-godos",
    "subParroquiaId": "SUBPAR-1788965549962",
    "color": "#ef4444",
    "ancho": 2,
    "centroVotacion": "",
    "votoDuro": 0,
    "votoBlando": 0,
    "votoNuevo": 0,
    "isNew": false
  },
  {
    "id": "POLY-1788970000212",
    "nombre": "las flores",
    "descripcion": "Comunidad / Consejo Comunal",
    "militantes": 0,
    "casas": 0,
    "habitantes": 0,
    "familias": 0,
    "colorBorde": "#10b981",
    "anchoBorde": 2,
    "colorRelleno": "#10b981",
    "opacidad": 0.65,
    "vertices": [
      [
        9.712441104330008,
        -63.20906639099122
      ],
      [
        9.713466883399276,
        -63.20900201797486
      ],
      [
        9.71464070919897,
        -63.20884108543397
      ],
      [
        9.71719984666957,
        -63.208143711090095
      ],
      [
        9.718151587016782,
        -63.207360506057746
      ],
      [
        9.71666052593775,
        -63.20604085922242
      ],
      [
        9.71603660479094,
        -63.20675969123841
      ],
      [
        9.715285782885559,
        -63.206373453140266
      ],
      [
        9.71368895886632,
        -63.20606231689454
      ],
      [
        9.713329408036326,
        -63.206652402877815
      ],
      [
        9.712874681433531,
        -63.20730686187745
      ],
      [
        9.712694905629483,
        -63.20805788040162
      ]
    ],
    "areaHa": 13.3,
    "perimetroM": 1525,
    "visible": true,
    "fecha": "2026-09-09T16:06:40.212Z",
    "munId": "maturin",
    "parishId": "alto-de-los-godos",
    "subParroquiaId": "SUBPAR-1788965549962",
    "color": "#10b981",
    "ancho": 2,
    "centroVotacion": "",
    "votoDuro": 0,
    "votoBlando": 0,
    "votoNuevo": 0,
    "isNew": false
  },
  {
    "id": "POLY-1788970154079",
    "nombre": "Sector 1 A",
    "descripcion": "Comunidad / Consejo Comunal",
    "militantes": 0,
    "casas": 0,
    "habitantes": 0,
    "familias": 0,
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#38bdf8",
    "opacidad": 0.55,
    "vertices": [
      [
        9.713456308373372,
        -63.211362361907966
      ],
      [
        9.713445733347124,
        -63.210922479629524
      ],
      [
        9.713466883399276,
        -63.20903420448304
      ],
      [
        9.712462254445644,
        -63.20907711982728
      ],
      [
        9.71084426674036,
        -63.209109306335456
      ],
      [
        9.709818479635343,
        -63.209398984909065
      ],
      [
        9.7090993692757,
        -63.20978522300721
      ],
      [
        9.709088794111823,
        -63.211877346038825
      ],
      [
        9.709025343121604,
        -63.212360143661506
      ],
      [
        9.709681002774225,
        -63.21245670318604
      ],
      [
        9.709792041781814,
        -63.21180760860444
      ],
      [
        9.710897142279153,
        -63.21200609207154
      ],
      [
        9.71105576884545,
        -63.21127116680146
      ]
    ],
    "areaHa": 12.9,
    "perimetroM": 1392,
    "visible": true,
    "fecha": "2026-09-09T16:09:14.079Z",
    "munId": "maturin",
    "parishId": "alto-de-los-godos",
    "subParroquiaId": "SUBPAR-1788965549962",
    "color": "#38bdf8",
    "ancho": 2,
    "centroVotacion": "",
    "votoDuro": 0,
    "votoBlando": 0,
    "votoNuevo": 0,
    "isNew": false
  },
  {
    "id": "POLY-1788970445669",
    "nombre": "el caro",
    "descripcion": "Comunidad / Consejo Comunal",
    "militantes": 0,
    "casas": 0,
    "habitantes": 0,
    "familias": 0,
    "colorBorde": "#a855f7",
    "anchoBorde": 2,
    "colorRelleno": "#a855f7",
    "opacidad": 0.65,
    "vertices": [
      [
        9.712441104330008,
        -63.20908248424531
      ],
      [
        9.712864106388913,
        -63.20731759071351
      ],
      [
        9.71333998306625,
        -63.206641674041755
      ],
      [
        9.71368895886632,
        -63.20606231689454
      ],
      [
        9.713017444503256,
        -63.205917477607734
      ],
      [
        9.712372366444946,
        -63.20575118064881
      ],
      [
        9.711700849440762,
        -63.20570290088654
      ],
      [
        9.71080725385824,
        -63.205370306968696
      ],
      [
        9.709823767205812,
        -63.2048124074936
      ],
      [
        9.70974445364021,
        -63.204876780509956
      ],
      [
        9.709390186151236,
        -63.2047587633133
      ],
      [
        9.709025343121604,
        -63.204903602600105
      ],
      [
        9.708639349338661,
        -63.20526838302613
      ],
      [
        9.708385544964987,
        -63.2057672739029
      ],
      [
        9.707840922430591,
        -63.206689953804016
      ],
      [
        9.707026630775736,
        -63.20781648159028
      ],
      [
        9.706899728001865,
        -63.20825636386872
      ],
      [
        9.70666178517128,
        -63.208674788475044
      ],
      [
        9.706513731769181,
        -63.20977449417115
      ],
      [
        9.706444992667391,
        -63.21003198623658
      ],
      [
        9.706037845390606,
        -63.210160732269294
      ],
      [
        9.705662423437134,
        -63.21044504642487
      ],
      [
        9.705202398779681,
        -63.210858106613166
      ],
      [
        9.704874564730249,
        -63.21087956428528
      ],
      [
        9.704879852378756,
        -63.211389183998115
      ],
      [
        9.705345165120287,
        -63.21149110794068
      ],
      [
        9.705546095422509,
        -63.21143746376038
      ],
      [
        9.705932092770231,
        -63.21104586124421
      ],
      [
        9.70631280204736,
        -63.21072936058045
      ],
      [
        9.706963179394819,
        -63.2105576992035
      ],
      [
        9.707650568714552,
        -63.21049332618714
      ],
      [
        9.70829036827527,
        -63.21019291877747
      ],
      [
        9.709072931365391,
        -63.20980668067933
      ],
      [
        9.709665140055845,
        -63.20948481559754
      ],
      [
        9.709829054776167,
        -63.209393620491035
      ],
      [
        9.710437124811929,
        -63.20922195911408
      ],
      [
        9.710696215187308,
        -63.209157586097724
      ],
      [
        9.710923580045433,
        -63.209109306335456
      ],
      [
        9.711425897207853,
        -63.20910394191743
      ]
    ],
    "areaHa": 30.7,
    "perimetroM": 2618,
    "visible": true,
    "fecha": "2026-09-09T16:14:05.669Z",
    "munId": "maturin",
    "parishId": "alto-de-los-godos",
    "subParroquiaId": "SUBPAR-1788965549962",
    "color": "#a855f7",
    "ancho": 2,
    "centroVotacion": "",
    "votoDuro": 0,
    "votoBlando": 0,
    "votoNuevo": 0,
    "isNew": false
  },
  {
    "id": "POLY-1789054804245",
    "nombre": "Sector l",
    "descripcion": "Comunidad / Consejo Comunal",
    "militantes": 0,
    "casas": 0,
    "habitantes": 0,
    "familias": 0,
    "colorBorde": "#eab308",
    "anchoBorde": 2,
    "colorRelleno": "#eab308",
    "opacidad": 0.55,
    "vertices": [
      [
        9.712134427503047,
        -63.215144276618965
      ],
      [
        9.71288790023885,
        -63.21526229381562
      ],
      [
        9.713072963458373,
        -63.21432352066041
      ],
      [
        9.713342626823682,
        -63.213060200214386
      ],
      [
        9.71345102086028,
        -63.21249961853028
      ],
      [
        9.71345102086028,
        -63.21136504411698
      ],
      [
        9.71105576884545,
        -63.211273849010475
      ],
      [
        9.710899786055883,
        -63.21200609207154
      ],
      [
        9.709794685567271,
        -63.21181029081345
      ],
      [
        9.709683646560547,
        -63.21245670318604
      ],
      [
        9.709004192788852,
        -63.212354779243476
      ],
      [
        9.708834990078774,
        -63.212995827198036
      ],
      [
        9.710101364537403,
        -63.213247954845436
      ],
      [
        9.710355167610624,
        -63.21339279413224
      ],
      [
        9.710920936268895,
        -63.21390241384507
      ],
      [
        9.71118795759328,
        -63.214146494865425
      ]
    ],
    "areaHa": 12.8,
    "perimetroM": 1513,
    "visible": true,
    "fecha": "2026-09-10T15:40:04.245Z",
    "munId": "maturin",
    "parishId": "alto-de-los-godos",
    "subParroquiaId": "SUBPAR-1788965549962",
    "color": "#eab308",
    "ancho": 2,
    "centroVotacion": "",
    "votoDuro": 0,
    "votoBlando": 0,
    "votoNuevo": 0,
    "isNew": false
  }
];

// 6. CENTROS ELECTORALES DE LA PUENTE
export const CENTROS_ELECTORALES_LAPUENTE = [
  { id: "c1", nombre: "Cruz Hernández Quijada", electores: 1056, mesas: 2, latlng: [9.7340, -63.2210] },
  { id: "c2", nombre: "Francisco Verde", electores: 3230, mesas: 5, latlng: [9.7370, -63.2260] },
  { id: "c3", nombre: "Apolinar Cantor", electores: 2481, mesas: 4, latlng: [9.7310, -63.2170] },
  { id: "c4", nombre: "Cruz Figuera Rondón", electores: 2961, mesas: 4, latlng: [9.7250, -63.2160] },
  { id: "c5", nombre: "República de Venezuela", electores: 500, mesas: 1, latlng: [9.7170, -63.2270] }
];

/**
 * 7. UTILIDADES ESPACIALES: ANÁLISIS GEOGRÁFICO Y AUTO-DETECCIÓN (PIP)
 */

/**
 * Determina si un punto [lat, lng] está dentro de un polígono [[lat, lng], ...]
 * Algoritmo de Ray-Casting (trazado de rayos) estándar y ultra-rápido.
 */
export function isPointInPolygon(point, vs) {
  if (!point || !vs || vs.length < 3) return false;
  const x = point[0], y = point[1]; // x = lat, y = lng
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Evalúa si [lat, lng] está dentro de una Feature GeoJSON (Polygon o MultiPolygon)
 * Nota: En GeoJSON las coordenadas se almacenan como [lng, lat].
 */
export function isPointInGeoJsonFeature(lat, lng, feature) {
  if (!feature || !feature.geometry) return false;
  const geom = feature.geometry;
  if (geom.type === "Polygon") {
    const ring = geom.coordinates[0];
    const vs = ring.map(pt => [pt[1], pt[0]]);
    return isPointInPolygon([lat, lng], vs);
  } else if (geom.type === "MultiPolygon") {
    for (const poly of geom.coordinates) {
      const ring = poly[0];
      const vs = ring.map(pt => [pt[1], pt[0]]);
      if (isPointInPolygon([lat, lng], vs)) return true;
    }
  }
  return false;
}

/**
 * Calcula el centroide de una lista de vértices [[lat, lng], ...]
 */
export function calculateCentroid(vertices) {
  if (!vertices || vertices.length === 0) return null;
  let latSum = 0, lngSum = 0;
  vertices.forEach(v => {
    latSum += v[0];
    lngSum += v[1];
  });
  return [latSum / vertices.length, lngSum / vertices.length];
}

/**
 * Auto-detecta la Parroquia y Municipio oficial a partir de una geometría
 * (vértices de polígono, puntos de ruta o lat/lng de una marca).
 * Compara espacialmente contra las 44 parroquias de GEO_PARROQUIAS_OFICIAL.
 */
export function detectParishFromGeometry(geometry, geoParroquiasOficial) {
  if (!geometry || !geoParroquiasOficial || !geoParroquiasOficial.features) return null;

  let testPoint = null;
  if (Array.isArray(geometry)) {
    if (geometry.length === 2 && typeof geometry[0] === "number") {
      testPoint = geometry; // [lat, lng]
    } else if (geometry.length > 0 && Array.isArray(geometry[0])) {
      testPoint = calculateCentroid(geometry);
    }
  } else if (geometry.lat !== undefined && geometry.lng !== undefined) {
    testPoint = [geometry.lat, geometry.lng];
  }

  if (!testPoint) return null;

  const lat = testPoint[0];
  const lng = testPoint[1];

  for (const feature of geoParroquiasOficial.features) {
    if (isPointInGeoJsonFeature(lat, lng, feature)) {
      const p = feature.properties;
      return {
        parishId: p.id,
        parishNombre: p.nombre || p.ADM3_ES,
        munId: p.municipioId,
        munNombre: p.municipioNombre || p.ADM2_ES,
        codigo: p.ADM3_PCODE || "",
        color: p.color || "#10b981"
      };
    }
  }

  return null;
}

