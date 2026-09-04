/**
 * Catálogo Oficial Completo del Estado Monagas
 * 13 Municipios y sus 44 Parroquias Oficiales (Gaceta Oficial / INE 2021)
 */
import { GEO_PARROQUIAS_OFICIAL } from "./geoOficialMonagas.js?v=57";

export const CATALOGO_MONAGAS = [
  // 1. MATURÍN (10 Parroquias)
  {
    id: "maturin",
    nombre: "Municipio Maturín",
    capital: "Maturín",
    color: "#f59e0b",
    icon: "building-2",
    parroquias: [
      {
        id: "san-simon",
        nombre: "San Simón",
        codigo: "MAT-SIM",
        tipo: "Urbana Central",
        centro: [9.7469, -63.1812],
        zoom: 14,
        sectores: ["Casco Central", "Palo Negro", "Brisas del Orinoco", "La Muralla"],
        limite: [
          [9.7640, -63.1960], [9.7670, -63.1700], [9.7550, -63.1580],
          [9.7360, -63.1600], [9.7280, -63.1780], [9.7320, -63.2000],
          [9.7500, -63.2030], [9.7640, -63.1960]
        ]
      },
      {
        id: "alto-de-los-godos",
        nombre: "Alto de Los Godos",
        codigo: "MAT-GOD",
        tipo: "Urbana Oeste",
        centro: [9.7280, -63.2060],
        zoom: 14,
        sectores: ["La Puente", "Los Godos 1 y 2", "Morichal", "Fundemos", "Los Guaros"],
        limite: [
          [9.7440, -63.2260], [9.7480, -63.1970], [9.7320, -63.1880],
          [9.7130, -63.1900], [9.7080, -63.2200], [9.7240, -63.2340],
          [9.7440, -63.2260]
        ]
      },
      {
        id: "boqueron",
        nombre: "Boquerón",
        codigo: "MAT-BOQ",
        tipo: "Urbana Norte",
        centro: [9.7880, -63.1900],
        zoom: 13,
        sectores: ["Tipuro 1 y 2", "Palma Real", "Los Cortijos", "Costo Arriba", "Viboral"],
        limite: [
          [9.8180, -63.2120], [9.8220, -63.1730], [9.7960, -63.1630],
          [9.7660, -63.1760], [9.7630, -63.2060], [9.7830, -63.2270],
          [9.8180, -63.2120]
        ]
      },
      {
        id: "las-cocuizas",
        nombre: "Las Cocuizas",
        codigo: "MAT-COC",
        tipo: "Urbana Este",
        centro: [9.7560, -63.1460],
        zoom: 14,
        sectores: ["Sabana Grande", "El Silencio", "El Nazareno", "Aeropuerto"],
        limite: [
          [9.7760, -63.1640], [9.7800, -63.1300], [9.7600, -63.1180],
          [9.7330, -63.1330], [9.7360, -63.1600], [9.7540, -63.1670],
          [9.7760, -63.1640]
        ]
      },
      {
        id: "santa-cruz",
        nombre: "Santa Cruz (La Cruz)",
        codigo: "MAT-STC",
        tipo: "Urbana Suroeste",
        centro: [9.7120, -63.2380],
        zoom: 13,
        sectores: ["La Gran Victoria", "Santa Cruz Centro", "Zona Industrial"],
        limite: [
          [9.7350, -63.2600], [9.7420, -63.2280], [9.7220, -63.2180],
          [9.6950, -63.2250], [9.6900, -63.2550], [9.7120, -63.2680],
          [9.7350, -63.2600]
        ]
      },
      {
        id: "san-vicente",
        nombre: "San Vicente",
        codigo: "MAT-VIC",
        tipo: "Suburbana",
        centro: [9.7280, -63.2850],
        zoom: 13,
        sectores: ["Pueblo Nuevo", "San Vicente Centro", "Corocito"],
        limite: [
          [9.7520, -63.3080], [9.7550, -63.2720], [9.7280, -63.2650],
          [9.7050, -63.2780], [9.7080, -63.3150], [9.7520, -63.3080]
        ]
      },
      {
        id: "la-pica",
        nombre: "La Pica",
        codigo: "MAT-PIC",
        tipo: "Rural Este",
        centro: [9.7750, -63.0780],
        zoom: 12,
        sectores: ["La Pica Centro", "Vuelta Larga", "El Rincón"],
        limite: [
          [9.8150, -63.1150], [9.8250, -63.0450], [9.7650, -63.0280],
          [9.7400, -63.0750], [9.7550, -63.1200], [9.8150, -63.1150]
        ]
      },
      {
        id: "jusepin",
        nombre: "Jusepín",
        codigo: "MAT-JUS",
        tipo: "Petrolera",
        centro: [9.7480, -63.5020],
        zoom: 13,
        sectores: ["Campo Rojo", "Jusepín Centro", "La Horqueta"],
        limite: [
          [9.7750, -63.5350], [9.7800, -63.4750], [9.7350, -63.4650],
          [9.7150, -63.5150], [9.7400, -63.5450], [9.7750, -63.5350]
        ]
      },
      {
        id: "el-furrial",
        nombre: "El Furrial",
        codigo: "MAT-FUR",
        tipo: "Petrolera Oeste",
        centro: [9.7250, -63.3650],
        zoom: 13,
        sectores: ["El Furrial Centro", "Corocito", "Barrio Obrero"],
        limite: [
          [9.7550, -63.3950], [9.7600, -63.3450], [9.7100, -63.3350],
          [9.6950, -63.3850], [9.7550, -63.3950]
        ]
      },
      {
        id: "el-corozo",
        nombre: "El Corozo",
        codigo: "MAT-COR",
        tipo: "Suburbana Sur",
        centro: [9.6750, -63.2150],
        zoom: 13,
        sectores: ["El Corozo Centro", "Amana", "Morichal"],
        limite: [
          [9.7000, -63.2450], [9.7050, -63.1950], [9.6550, -63.1850],
          [9.6450, -63.2350], [9.7000, -63.2450]
        ]
      }
    ]
  },

  // 2. PIAR (7 Parroquias)
  {
    id: "piar",
    nombre: "Municipio Piar",
    capital: "Aragua de Maturín",
    color: "#a855f7",
    icon: "trees",
    parroquias: [
      {
        id: "aragua",
        nombre: "Aragua de Maturín",
        codigo: "PIA-ARA",
        tipo: "Capital",
        centro: [9.9720, -63.4850],
        zoom: 13,
        sectores: ["Aragua Centro", "El Caro", "Chaguaramal"],
        limite: [[9.9980, -63.5150], [10.0050, -63.4600], [9.9550, -63.4500], [9.9450, -63.5050], [9.9980, -63.5150]]
      },
      {
        id: "aparicio",
        nombre: "Aparicio",
        codigo: "PIA-APA",
        tipo: "Rural",
        centro: [9.9850, -63.5650],
        zoom: 13,
        sectores: ["Aparicio Centro", "La Loma"],
        limite: [[10.0100, -63.5950], [10.0150, -63.5350], [9.9550, -63.5350], [9.9500, -63.5950], [10.0100, -63.5950]]
      },
      {
        id: "chaguaramal",
        nombre: "Chaguaramal",
        codigo: "PIA-CHG",
        tipo: "Agrícola",
        centro: [9.9450, -63.4150],
        zoom: 12,
        sectores: ["Chaguaramal Centro"],
        limite: [[9.9700, -63.4450], [9.9750, -63.3850], [9.9150, -63.3850], [9.9100, -63.4450], [9.9700, -63.4450]]
      },
      {
        id: "el-pinto",
        nombre: "El Pinto",
        codigo: "PIA-PIN",
        tipo: "Agrícola",
        centro: [9.9150, -63.4750],
        zoom: 13,
        sectores: ["El Pinto Centro"],
        limite: [[9.9400, -63.5050], [9.9450, -63.4450], [9.8850, -63.4450], [9.8800, -63.5050], [9.9400, -63.5050]]
      },
      {
        id: "guanaguana",
        nombre: "Guanaguana",
        codigo: "PIA-GUA",
        tipo: "Histórica",
        centro: [10.0550, -63.5250],
        zoom: 13,
        sectores: ["Guanaguana Centro", "Ruinas"],
        limite: [[10.0800, -63.5550], [10.0850, -63.4950], [10.0250, -63.4950], [10.0200, -63.5550], [10.0800, -63.5550]]
      },
      {
        id: "la-toscana",
        nombre: "La Toscana",
        codigo: "PIA-TOS",
        tipo: "Agrícola",
        centro: [9.8550, -63.4250],
        zoom: 13,
        sectores: ["La Toscana Centro", "Chupulún"],
        limite: [[9.8800, -63.4550], [9.8850, -63.3950], [9.8250, -63.3950], [9.8200, -63.4550], [9.8800, -63.4550]]
      },
      {
        id: "taguaya",
        nombre: "Taguaya",
        codigo: "PIA-TAG",
        tipo: "Rural",
        centro: [9.9050, -63.3550],
        zoom: 12,
        sectores: ["Taguaya Centro"],
        limite: [[9.9300, -63.3850], [9.9350, -63.3250], [9.8750, -63.3250], [9.8700, -63.3850], [9.9300, -63.3850]]
      }
    ]
  },

  // 3. CARIPE (6 Parroquias)
  {
    id: "caripe",
    nombre: "Municipio Caripe",
    capital: "Caripe",
    color: "#10b981",
    icon: "compass",
    parroquias: [
      {
        id: "caripe-centro",
        nombre: "Caripe",
        codigo: "CAR-CEN",
        tipo: "Capital Turística",
        centro: [10.1780, -63.4980],
        zoom: 13,
        sectores: ["Caripe Centro", "El Guácharo", "Teresén"],
        limite: [[10.2050, -63.5250], [10.2100, -63.4750], [10.1550, -63.4650], [10.1450, -63.5150], [10.2050, -63.5250]]
      },
      {
        id: "el-guacharo",
        nombre: "El Guácharo",
        codigo: "CAR-GUA",
        tipo: "Monumento Natural",
        centro: [10.1980, -63.5550],
        zoom: 13,
        sectores: ["Cueva del Guácharo"],
        limite: [[10.2250, -63.5850], [10.2300, -63.5250], [10.1700, -63.5250], [10.1650, -63.5850], [10.2250, -63.5850]]
      },
      {
        id: "la-guanota",
        nombre: "La Guanota",
        codigo: "CAR-GNT",
        tipo: "Agrícola",
        centro: [10.2150, -63.5050],
        zoom: 13,
        sectores: ["La Guanota Centro"],
        limite: [[10.2400, -63.5350], [10.2450, -63.4750], [10.1850, -63.4750], [10.1800, -63.5350], [10.2400, -63.5350]]
      },
      {
        id: "sabana-de-piedra",
        nombre: "Sabana de Piedra",
        codigo: "CAR-SAB",
        tipo: "Cafetalera",
        centro: [10.2350, -63.4450],
        zoom: 13,
        sectores: ["Sabana de Piedra"],
        limite: [[10.2600, -63.4750], [10.2650, -63.4150], [10.2050, -63.4150], [10.2000, -63.4750], [10.2600, -63.4750]]
      },
      {
        id: "san-agustin",
        nombre: "San Agustín",
        codigo: "CAR-SAG",
        tipo: "Turística",
        centro: [10.1650, -63.5450],
        zoom: 13,
        sectores: ["San Agustín Centro", "Cascadas"],
        limite: [[10.1900, -63.5750], [10.1950, -63.5150], [10.1350, -63.5150], [10.1300, -63.5750], [10.1900, -63.5750]]
      },
      {
        id: "teresen",
        nombre: "Teresén",
        codigo: "CAR-TER",
        tipo: "Agrícola",
        centro: [10.1450, -63.4650],
        zoom: 13,
        sectores: ["Teresén Centro"],
        limite: [[10.1700, -63.4950], [10.1750, -63.4350], [10.1150, -63.4350], [10.1100, -63.4950], [10.1700, -63.4950]]
      }
    ]
  },

  // 4. CEDEÑO (4 Parroquias)
  {
    id: "cedeno",
    nombre: "Municipio Cedeño",
    capital: "Caicara",
    color: "#0284c7",
    icon: "mountain",
    parroquias: [
      {
        id: "caicara",
        nombre: "Caicara (Capital Cedeño)",
        codigo: "CED-CAI",
        tipo: "Capital",
        centro: [9.8220, -63.6150],
        zoom: 13,
        sectores: ["La Manga", "Bella Vista", "El Rincón", "Pueblo Nuevo"],
        limite: [[9.8450, -63.6420], [9.8480, -63.5900], [9.8220, -63.5800], [9.8000, -63.6020], [9.7980, -63.6350], [9.8250, -63.6500], [9.8450, -63.6420]]
      },
      {
        id: "areo",
        nombre: "Areo",
        codigo: "CED-ARE",
        tipo: "Rural",
        centro: [9.7820, -63.7450],
        zoom: 12,
        sectores: ["Areo Centro"],
        limite: [[9.8100, -63.7800], [9.8150, -63.7100], [9.7500, -63.7100], [9.7450, -63.7800], [9.8100, -63.7800]]
      },
      {
        id: "san-felix",
        nombre: "San Félix de Cantalicio",
        codigo: "CED-SFX",
        tipo: "Rural",
        centro: [9.8920, -63.5650],
        zoom: 12,
        sectores: ["San Félix Centro"],
        limite: [[9.9200, -63.6000], [9.9250, -63.5300], [9.8600, -63.5300], [9.8550, -63.6000], [9.9200, -63.6000]]
      },
      {
        id: "viento-fresco",
        nombre: "Viento Fresco",
        codigo: "CED-VFR",
        tipo: "Rural",
        centro: [9.7120, -63.6850],
        zoom: 12,
        sectores: ["Viento Fresco Centro"],
        limite: [[9.7400, -63.7200], [9.7450, -63.6500], [9.6800, -63.6500], [9.6750, -63.7200], [9.7400, -63.7200]]
      }
    ]
  },

  // 5. LIBERTADOR (4 Parroquias)
  {
    id: "libertador",
    nombre: "Municipio Libertador",
    capital: "Temblador",
    color: "#6366f1",
    icon: "sun",
    parroquias: [
      {
        id: "temblador",
        nombre: "Temblador",
        codigo: "LIB-TEM",
        tipo: "Capital Sur",
        centro: [9.0250, -62.7150],
        zoom: 13,
        sectores: ["Temblador Centro", "Las Brisas"],
        limite: [[9.0550, -62.7450], [9.0600, -62.6850], [8.9950, -62.6850], [8.9900, -62.7450], [9.0550, -62.7450]]
      },
      {
        id: "chaguaramas",
        nombre: "Chaguaramas",
        codigo: "LIB-CHG",
        tipo: "Sur Petrolero",
        centro: [9.0950, -62.6750],
        zoom: 13,
        sectores: ["Chaguaramas Centro"],
        limite: [[9.1250, -62.7050], [9.1300, -62.6450], [9.0650, -62.6450], [9.0600, -62.7050], [9.1250, -62.7050]]
      },
      {
        id: "las-alhuacas",
        nombre: "Las Alhuacas",
        codigo: "LIB-ALH",
        tipo: "Rural Sur",
        centro: [8.9550, -62.7850],
        zoom: 12,
        sectores: ["Las Alhuacas Centro"],
        limite: [[8.9850, -62.8150], [8.9900, -62.7550], [8.9250, -62.7550], [8.9200, -62.8150], [8.9850, -62.8150]]
      },
      {
        id: "tabasca",
        nombre: "Tabasca",
        codigo: "LIB-TAB",
        tipo: "Rural",
        centro: [9.1550, -62.6150],
        zoom: 12,
        sectores: ["Tabasca Centro"],
        limite: [[9.1850, -62.6450], [9.1900, -62.5850], [9.1250, -62.5850], [9.1200, -62.6450], [9.1850, -62.6450]]
      }
    ]
  },

  // 6. EZEQUIEL ZAMORA (2 Parroquias)
  {
    id: "ezequiel-zamora",
    nombre: "Municipio Ezequiel Zamora",
    capital: "Punta de Mata",
    color: "#e11d48",
    icon: "flame",
    parroquias: [
      {
        id: "punta-de-mata",
        nombre: "Punta de Mata",
        codigo: "ZAM-PUN",
        tipo: "Capital Petrolera",
        centro: [9.7150, -63.6280],
        zoom: 13,
        sectores: ["Punta de Mata Centro", "19 de Abril"],
        limite: [[9.7450, -63.6600], [9.7500, -63.6050], [9.6950, -63.5950], [9.6850, -63.6500], [9.7450, -63.6600]]
      },
      {
        id: "el-tejero",
        nombre: "El Tejero",
        codigo: "ZAM-TEJ",
        tipo: "Petrolera",
        centro: [9.6850, -63.5350],
        zoom: 13,
        sectores: ["El Tejero Centro", "Casupal"],
        limite: [[9.7150, -63.5700], [9.7200, -63.5000], [9.6550, -63.5000], [9.6500, -63.5700], [9.7150, -63.5700]]
      }
    ]
  },

  // 7. ACOSTA (2 Parroquias)
  {
    id: "acosta",
    nombre: "Municipio Acosta",
    capital: "San Antonio",
    color: "#06b6d4",
    icon: "map",
    parroquias: [
      {
        id: "san-antonio",
        nombre: "San Antonio de Maturín (Capayacuar)",
        codigo: "ACO-ANT",
        tipo: "Capital",
        centro: [10.0050, -63.7120],
        zoom: 13,
        sectores: ["Centro", "Miraflores"],
        limite: [[10.0300, -63.7400], [10.0350, -63.6900], [9.9850, -63.6800], [9.9750, -63.7300], [10.0300, -63.7400]]
      },
      {
        id: "san-francisco",
        nombre: "San Francisco de Maturín",
        codigo: "ACO-SFC",
        tipo: "Rural",
        centro: [10.0650, -63.6750],
        zoom: 12,
        sectores: ["San Francisco Centro"],
        limite: [[10.0900, -63.7050], [10.0950, -63.6450], [10.0350, -63.6450], [10.0300, -63.7050], [10.0900, -63.7050]]
      }
    ]
  },

  // 8. PUNCERES (2 Parroquias)
  {
    id: "punceres",
    nombre: "Municipio Punceres",
    capital: "Quiriquire",
    color: "#84cc16",
    icon: "fuel",
    parroquias: [
      {
        id: "quiriquire",
        nombre: "Quiriquire",
        codigo: "PUN-QUI",
        tipo: "Capital",
        centro: [9.9750, -63.2150],
        zoom: 13,
        sectores: ["Quiriquire Centro", "Miraflores"],
        limite: [[10.0050, -63.2450], [10.0100, -63.1850], [9.9450, -63.1850], [9.9400, -63.2450], [10.0050, -63.2450]]
      },
      {
        id: "cachipo",
        nombre: "Cachipo",
        codigo: "PUN-CAC",
        tipo: "Rural",
        centro: [9.9150, -63.2350],
        zoom: 13,
        sectores: ["Cachipo Centro"],
        limite: [[9.9400, -63.2650], [9.9450, -63.2050], [9.8850, -63.2050], [9.8800, -63.2650], [9.9400, -63.2650]]
      }
    ]
  },

  // 9. SANTA BÁRBARA (2 Parroquias)
  {
    id: "santa-barbara",
    nombre: "Municipio Santa Bárbara",
    capital: "Santa Bárbara",
    color: "#ec4899",
    icon: "crosshair",
    parroquias: [
      {
        id: "santa-barbara-centro",
        nombre: "Santa Bárbara",
        codigo: "SBA-CEN",
        tipo: "Capital",
        centro: [9.5850, -63.6150],
        zoom: 13,
        sectores: ["Santa Bárbara Centro", "Tapirito"],
        limite: [[9.6150, -63.6450], [9.6200, -63.5850], [9.5550, -63.5850], [9.5500, -63.6450], [9.6150, -63.6450]]
      },
      {
        id: "moron",
        nombre: "Morón",
        codigo: "SBA-MOR",
        tipo: "Rural",
        centro: [9.5250, -63.5850],
        zoom: 13,
        sectores: ["Morón Centro"],
        limite: [[9.5550, -63.6150], [9.5600, -63.5550], [9.4950, -63.5550], [9.4900, -63.6150], [9.5550, -63.6150]]
      }
    ]
  },

  // 10. SOTILLO (2 Parroquias)
  {
    id: "sotillo",
    nombre: "Municipio Sotillo",
    capital: "Barrancas",
    color: "#8b5cf6",
    icon: "waves",
    parroquias: [
      {
        id: "barrancas",
        nombre: "Barrancas del Orinoco",
        codigo: "SOT-BAR",
        tipo: "Capital Río Orinoco",
        centro: [8.7050, -62.1850],
        zoom: 13,
        sectores: ["Barrancas Centro", "Malecón"],
        limite: [[8.7350, -62.2150], [8.7400, -62.1550], [8.6750, -62.1550], [8.6700, -62.2150], [8.7350, -62.2150]]
      },
      {
        id: "los-barrancos",
        nombre: "Los Barrancos de Fajardo",
        codigo: "SOT-FAJ",
        tipo: "Frontera San Félix / Bolívar",
        centro: [8.3950, -62.6650],
        zoom: 13,
        sectores: ["Los Barrancos Centro", "Paso de Chalanas"],
        limite: [[8.4250, -62.6950], [8.4300, -62.6350], [8.3650, -62.6350], [8.3600, -62.6950], [8.4250, -62.6950]]
      }
    ]
  },

  // 11. BOLÍVAR (1 Parroquia)
  {
    id: "bolivar",
    nombre: "Municipio Bolívar",
    capital: "Caripito",
    color: "#d97706",
    icon: "ship",
    parroquias: [
      {
        id: "caripito",
        nombre: "Caripito",
        codigo: "BOL-CAR",
        tipo: "Puerto Fluvial",
        centro: [10.1250, -63.1050],
        zoom: 13,
        sectores: ["Casco Central", "Río San Juan", "El Rincón"],
        limite: [[10.1550, -63.1350], [10.1600, -63.0750], [10.0950, -63.0750], [10.0900, -63.1350], [10.1550, -63.1350]]
      }
    ]
  },

  // 12. AGUASAY (1 Parroquia)
  {
    id: "aguasay",
    nombre: "Municipio Aguasay",
    capital: "Aguasay",
    color: "#14b8a6",
    icon: "droplet",
    parroquias: [
      {
        id: "aguasay-centro",
        nombre: "Aguasay",
        codigo: "AGU-CEN",
        tipo: "Capital Indígena / Petrolera",
        centro: [9.4250, -63.8150],
        zoom: 13,
        sectores: ["Aguasay Centro", "Comunidades Kari'ña"],
        limite: [[9.4550, -63.8450], [9.4600, -63.7850], [9.3950, -63.7850], [9.3900, -63.8450], [9.4550, -63.8450]]
      }
    ]
  },

  // 13. URACOA (1 Parroquia)
  {
    id: "uracoa",
    nombre: "Municipio Uracoa",
    capital: "Uracoa",
    color: "#3b82f6",
    icon: "anchor",
    parroquias: [
      {
        id: "uracoa-centro",
        nombre: "Uracoa",
        codigo: "URA-CEN",
        tipo: "Capital Sur",
        centro: [8.7450, -62.3450],
        zoom: 13,
        sectores: ["Uracoa Centro", "El Bajo"],
        limite: [[8.7750, -62.3750], [8.7800, -62.3150], [8.7150, -62.3150], [8.7100, -62.3750], [8.7750, -62.3750]]
      }
    ]
  }
];

// Alias de IDs de catálogo a IDs oficiales de INE
const OFICIAL_ALIASES = {
  "aragua": "capital-piar",
  "caripe-centro": "capital-caripe",
  "caicara": "capital-cedeno",
  "temblador": "capital-libertador",
  "punta-de-mata": "capital-ezequiel-zamora",
  "san-antonio": "capital-acosta",
  "quiriquire": "capital-punceres",
  "santa-barbara-centro": "santa-barbara",
  "barrancas": "capital-sotillo",
  "los-barrancos": "los-barrancos-de-fajardo",
  "caripito": "bolivar",
  "aguasay-centro": "aguasay",
  "uracoa-centro": "uracoa"
};

// Indexar polígonos oficiales del INE
const oficialFeatureMap = new Map();
if (GEO_PARROQUIAS_OFICIAL && GEO_PARROQUIAS_OFICIAL.features) {
  GEO_PARROQUIAS_OFICIAL.features.forEach(f => {
    if (f.properties && f.properties.id) {
      oficialFeatureMap.set(f.properties.id, f);
    }
  });
}

// Aplicar geometrías oficiales del INE 2021 a las parroquias
CATALOGO_MONAGAS.forEach(mun => {
  mun.parroquias.forEach(parroquia => {
    const targetId = OFICIAL_ALIASES[parroquia.id] || parroquia.id;
    const feat = oficialFeatureMap.get(targetId);
    if (feat && feat.geometry && feat.geometry.coordinates) {
      if (feat.geometry.type === "Polygon") {
        parroquia.limite = feat.geometry.coordinates[0].map(pt => [pt[1], pt[0]]);
        parroquia.esOficialINE = true;
      } else if (feat.geometry.type === "MultiPolygon") {
        const largest = feat.geometry.coordinates.reduce((max, poly) => 
          poly[0].length > max.length ? poly[0] : max, feat.geometry.coordinates[0][0]
        );
        parroquia.limite = largest.map(pt => [pt[1], pt[0]]);
        parroquia.esOficialINE = true;
      }
    }
  });
});

export { OFICIAL_ALIASES };

/**
 * Busca una parroquia y su municipio dentro de CATALOGO_MONAGAS.
 * Admite IDs de catálogo, IDs oficiales del INE (con OFICIAL_ALIASES) y nombres.
 */
export function findParishInCatalog(queryIdOrName) {
  if (!queryIdOrName) return null;
  const q = String(queryIdOrName).toLowerCase().trim();

  for (const mun of CATALOGO_MONAGAS) {
    for (const p of mun.parroquias) {
      const oficialId = OFICIAL_ALIASES[p.id] || p.id;
      if (
        p.id.toLowerCase() === q ||
        oficialId.toLowerCase() === q ||
        p.nombre.toLowerCase() === q ||
        p.nombre.toLowerCase().replace(/\s+/g, '-').includes(q)
      ) {
        return { mun, parish: p };
      }
    }
  }

  return null;
}
