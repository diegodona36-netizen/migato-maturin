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

// 4. NIVEL 4: SUB-PARROQUIAS (EJES COMUNALES DE ALTO DE LOS GODOS)
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

export const SUBPARROQUIAS_GODOS = SUBPARROQUIAS_MONAGAS;

// 5. NIVEL 5: SECTORES DE LA PUENTE (11 SECTORES CON SUS COORDENADAS Y DATOS DE LA LÁMINA OFICIAL)
export const SECTORES_LAPUENTE = [
  {
    id: "sec-lp-1",
    subParroquiaId: "sub-godos-6",
    numero: 1,
    nombre: "Monagzal",
    casas: 450,
    familias: 455,
    habitantes: 1550,
    consolidadas: 1,
    comitesVotacion: 3,
    centroVotacion: "Cruz Hernández Quijada",
    color: "#38bdf8",
    colorBorde: "#38bdf8",
    colorRelleno: "#38bdf8",
    opacidad: 0.38,
    visible: true,
    poligono: [
      [9.7360, -63.2320], [9.7420, -63.2300], [9.7400, -63.2230],
      [9.7340, -63.2240], [9.7360, -63.2320]
    ]
  },
  {
    id: "sec-lp-2",
    subParroquiaId: "sub-godos-6",
    numero: 2,
    nombre: "Las Vírgenes",
    casas: 1040,
    familias: 1087,
    habitantes: 3053,
    consolidadas: 2,
    comitesVotacion: 1,
    centroVotacion: "Cruz Hernández Quijada",
    color: "#10b981",
    colorBorde: "#10b981",
    colorRelleno: "#10b981",
    opacidad: 0.38,
    visible: true,
    poligono: [
      [9.7350, -63.2230], [9.7410, -63.2220], [9.7390, -63.2150],
      [9.7330, -63.2160], [9.7350, -63.2230]
    ]
  },
  {
    id: "sec-lp-3",
    subParroquiaId: "sub-godos-6",
    numero: 3,
    nombre: "Villa de los Ángeles",
    casas: 446,
    familias: 443,
    habitantes: 1254,
    consolidadas: 1,
    comitesVotacion: 1,
    centroVotacion: "Francisco Verde",
    color: "#f59e0b",
    colorBorde: "#f59e0b",
    colorRelleno: "#f59e0b",
    opacidad: 0.38,
    visible: true,
    poligono: [
      [9.7280, -63.2310], [9.7350, -63.2300], [9.7330, -63.2230],
      [9.7270, -63.2240], [9.7280, -63.2310]
    ]
  },
  {
    id: "sec-lp-4",
    subParroquiaId: "sub-godos-6",
    numero: 4,
    nombre: "Canadá",
    casas: 546,
    familias: 580,
    habitantes: 1513,
    consolidadas: 1,
    comitesVotacion: 1,
    centroVotacion: "Francisco Verde",
    color: "#ef4444",
    colorBorde: "#ef4444",
    colorRelleno: "#ef4444",
    opacidad: 0.38,
    visible: true,
    poligono: [
      [9.7270, -63.2230], [9.7330, -63.2220], [9.7320, -63.2160],
      [9.7260, -63.2170], [9.7270, -63.2230]
    ]
  },
  {
    id: "sec-lp-5",
    subParroquiaId: "sub-godos-6",
    numero: 5,
    nombre: "Sector II",
    casas: 551,
    familias: 701,
    habitantes: 1939,
    consolidadas: 1,
    comitesVotacion: 2,
    centroVotacion: "Apolinar Cantor",
    color: "#a855f7",
    colorBorde: "#a855f7",
    colorRelleno: "#a855f7",
    opacidad: 0.38,
    visible: true,
    poligono: [
      [9.7260, -63.2160], [9.7320, -63.2150], [9.7300, -63.2100],
      [9.7240, -63.2110], [9.7260, -63.2160]
    ]
  },
  {
    id: "sec-lp-6",
    subParroquiaId: "sub-godos-6",
    numero: 6,
    nombre: "Sector I",
    casas: 312,
    familias: 370,
    habitantes: 850,
    consolidadas: 1,
    comitesVotacion: 1,
    centroVotacion: "Apolinar Cantor",
    color: "#06b6d4",
    colorBorde: "#06b6d4",
    colorRelleno: "#06b6d4",
    opacidad: 0.38,
    visible: true,
    poligono: [
      [9.7200, -63.2300], [9.7270, -63.2290], [9.7250, -63.2230],
      [9.7180, -63.2240], [9.7200, -63.2300]
    ]
  },
  {
    id: "sec-lp-7",
    subParroquiaId: "sub-godos-6",
    numero: 7,
    nombre: "Sector IA",
    casas: 332,
    familias: 357,
    habitantes: 996,
    consolidadas: 1,
    comitesVotacion: 1,
    centroVotacion: "Cruz Figuera Rondón",
    color: "#84cc16",
    colorBorde: "#84cc16",
    colorRelleno: "#84cc16",
    opacidad: 0.38,
    visible: true,
    poligono: [
      [9.7240, -63.2100], [9.7300, -63.2090], [9.7280, -63.2050],
      [9.7220, -63.2060], [9.7240, -63.2100]
    ]
  },
  {
    id: "sec-lp-8",
    subParroquiaId: "sub-godos-6",
    numero: 8,
    nombre: "El Caro",
    casas: 692,
    familias: 1032,
    habitantes: 1832,
    consolidadas: 1,
    comitesVotacion: 1,
    centroVotacion: "Cruz Figuera Rondón",
    color: "#f97316",
    colorBorde: "#f97316",
    colorRelleno: "#f97316",
    opacidad: 0.38,
    visible: true,
    poligono: [
      [9.7180, -63.2160], [9.7240, -63.2150], [9.7220, -63.2080],
      [9.7150, -63.2090], [9.7180, -63.2160]
    ]
  },
  {
    id: "sec-lp-9",
    subParroquiaId: "sub-godos-6",
    numero: 9,
    nombre: "La Lucha",
    casas: 306,
    familias: 470,
    habitantes: 1237,
    consolidadas: 1,
    comitesVotacion: 1,
    centroVotacion: "República de Venezuela",
    color: "#ec4899",
    colorBorde: "#ec4899",
    colorRelleno: "#ec4899",
    opacidad: 0.38,
    visible: true,
    poligono: [
      [9.7190, -63.2230], [9.7260, -63.2220], [9.7240, -63.2160],
      [9.7170, -63.2170], [9.7190, -63.2230]
    ]
  },
  {
    id: "sec-lp-10",
    subParroquiaId: "sub-godos-6",
    numero: 10,
    nombre: "Las Flores",
    casas: 337,
    familias: 368,
    habitantes: 885,
    consolidadas: 1,
    comitesVotacion: 1,
    centroVotacion: "República de Venezuela",
    color: "#14b8a6",
    colorBorde: "#14b8a6",
    colorRelleno: "#14b8a6",
    opacidad: 0.38,
    visible: true,
    poligono: [
      [9.7330, -63.2150], [9.7400, -63.2140], [9.7380, -63.2080],
      [9.7320, -63.2090], [9.7330, -63.2150]
    ]
  },
  {
    id: "sec-lp-11",
    subParroquiaId: "sub-godos-6",
    numero: 11,
    nombre: "La Laguna",
    casas: 283,
    familias: 347,
    habitantes: 1050,
    consolidadas: 1,
    comitesVotacion: 1,
    centroVotacion: "República de Venezuela",
    color: "#3b82f6",
    colorBorde: "#3b82f6",
    colorRelleno: "#3b82f6",
    opacidad: 0.38,
    visible: true,
    poligono: [
      [9.7120, -63.2230], [9.7180, -63.2220], [9.7160, -63.2140],
      [9.7100, -63.2150], [9.7120, -63.2230]
    ]
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

