/**
 * Límites Oficiales y Catálogo Territorial del Estado Monagas
 * División Político Territorial Oficial (Nivel ADM2 y ADM3)
 */

export const TERRITORIO_MONAGAS = {
  municipios: [
    {
      id: "maturin",
      nombre: "Municipio Maturín",
      parroquias: [
        {
          id: "san-simon",
          nombre: "San Simón",
          codigo: "MAT-SIM",
          tipo: "Urbana Central",
          centro: [9.7469, -63.1812],
          zoom: 14,
          color: "#f59e0b",
          sectores: ["Casco Central", "Palo Negro", "Brisas del Orinoco", "El Paraíso", "La Muralla"],
          poligono: [
            [9.7640, -63.1960],
            [9.7670, -63.1700],
            [9.7550, -63.1580],
            [9.7360, -63.1600],
            [9.7280, -63.1780],
            [9.7320, -63.2000],
            [9.7500, -63.2030],
            [9.7640, -63.1960]
          ]
        },
        {
          id: "alto-de-los-godos",
          nombre: "Alto de Los Godos",
          codigo: "MAT-GOD",
          tipo: "Urbana Densamente Poblada",
          centro: [9.7280, -63.2060],
          zoom: 14,
          color: "#0284c7",
          sectores: ["Los Godos 1 y 2", "Morichal", "Fundemos", "La Puente", "Los Guaros"],
          poligono: [
            [9.7440, -63.2260],
            [9.7480, -63.1970],
            [9.7320, -63.1880],
            [9.7130, -63.1900],
            [9.7080, -63.2200],
            [9.7240, -63.2340],
            [9.7440, -63.2260]
          ]
        },
        {
          id: "boqueron",
          nombre: "Boquerón",
          codigo: "MAT-BOQ",
          tipo: "Urbana Norte / Expansión",
          centro: [9.7880, -63.1900],
          zoom: 13,
          color: "#10b981",
          sectores: ["Tipuro 1 y 2", "Palma Real", "Los Cortijos", "Costo Arriba", "Viboral"],
          poligono: [
            [9.8180, -63.2120],
            [9.8220, -63.1730],
            [9.7960, -63.1630],
            [9.7660, -63.1760],
            [9.7630, -63.2060],
            [9.7830, -63.2270],
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
          color: "#8b5cf6",
          sectores: ["Sabana Grande", "Las Cocuizas", "El Nazareno", "El Silencio", "Aeropuerto"],
          poligono: [
            [9.7760, -63.1640],
            [9.7800, -63.1300],
            [9.7600, -63.1180],
            [9.7330, -63.1330],
            [9.7360, -63.1600],
            [9.7540, -63.1670],
            [9.7760, -63.1640]
          ]
        },
        {
          id: "santa-cruz",
          nombre: "Santa Cruz",
          codigo: "MAT-STC",
          tipo: "Urbana Suroeste",
          centro: [9.7120, -63.2380],
          zoom: 13,
          color: "#ec4899",
          sectores: ["La Gran Victoria", "Santa Cruz Centro", "Zona Industrial", "Las Garzas"],
          poligono: [
            [9.7350, -63.2600],
            [9.7420, -63.2280],
            [9.7220, -63.2180],
            [9.6950, -63.2250],
            [9.6900, -63.2550],
            [9.7120, -63.2680],
            [9.7350, -63.2600]
          ]
        },
        {
          id: "san-vicente",
          nombre: "San Vicente",
          codigo: "MAT-VIC",
          tipo: "Suburbana Oeste",
          centro: [9.7280, -63.2850],
          zoom: 13,
          color: "#14b8a6",
          sectores: ["Pueblo Nuevo", "San Vicente Centro", "Corocito"],
          poligono: [
            [9.7520, -63.3080],
            [9.7550, -63.2720],
            [9.7280, -63.2650],
            [9.7050, -63.2780],
            [9.7080, -63.3150],
            [9.7520, -63.3080]
          ]
        },
        {
          id: "la-pica",
          nombre: "La Pica",
          codigo: "MAT-PIC",
          tipo: "Rural Este",
          centro: [9.7750, -63.0780],
          zoom: 12,
          color: "#f97316",
          sectores: ["La Pica Centro", "Vuelta Larga", "El Rincón"],
          poligono: [
            [9.8150, -63.1150],
            [9.8250, -63.0450],
            [9.7650, -63.0280],
            [9.7400, -63.0750],
            [9.7550, -63.1200],
            [9.8150, -63.1150]
          ]
        },
        {
          id: "jusepin",
          nombre: "Jusepín",
          codigo: "MAT-JUS",
          tipo: "Petrolera / Universitaria",
          centro: [9.7480, -63.5020],
          zoom: 13,
          color: "#eab308",
          sectores: ["Campo Rojo", "Jusepín Centro", "La Horqueta"],
          poligono: [
            [9.7750, -63.5350],
            [9.7800, -63.4750],
            [9.7350, -63.4650],
            [9.7150, -63.5150],
            [9.7400, -63.5450],
            [9.7750, -63.5350]
          ]
        },
        {
          id: "el-furrial",
          nombre: "El Furrial",
          codigo: "MAT-FUR",
          tipo: "Eje Petrolero",
          centro: [9.7250, -63.3650],
          zoom: 13,
          color: "#6366f1",
          sectores: ["El Furrial Centro", "Corocito", "Barrio Obrero"],
          poligono: [
            [9.7550, -63.3950],
            [9.7600, -63.3450],
            [9.7100, -63.3350],
            [9.6950, -63.3850],
            [9.7550, -63.3950]
          ]
        },
        {
          id: "el-corozo",
          nombre: "El Corozo",
          codigo: "MAT-COR",
          tipo: "Suburbana Sur",
          centro: [9.6750, -63.2150],
          zoom: 13,
          color: "#84cc16",
          sectores: ["El Corozo Centro", "Amana", "Morichal Largo"],
          poligono: [
            [9.7000, -63.2450],
            [9.7050, -63.1950],
            [9.6550, -63.1850],
            [9.6450, -63.2350],
            [9.7000, -63.2450]
          ]
        }
      ]
    },
    {
      id: "cedeno",
      nombre: "Municipio Cedeño",
      parroquias: [
        {
          id: "caicara",
          nombre: "Caicara",
          codigo: "CED-CAI",
          tipo: "Capital Municipal",
          centro: [9.8220, -63.6150],
          zoom: 13,
          color: "#f43f5e",
          sectores: ["La Manga", "Bella Vista", "El Rincón", "Pueblo Nuevo"],
          poligono: [
            [9.8450, -63.6420],
            [9.8480, -63.5900],
            [9.8220, -63.5800],
            [9.8000, -63.6020],
            [9.7980, -63.6350],
            [9.8250, -63.6500],
            [9.8450, -63.6420]
          ]
        }
      ]
    },
    {
      id: "acosta",
      nombre: "Municipio Acosta",
      parroquias: [
        {
          id: "san-antonio",
          nombre: "San Antonio de Capayacuar",
          codigo: "ACO-ANT",
          tipo: "Capital Municipal",
          centro: [10.0050, -63.7120],
          zoom: 13,
          color: "#06b6d4",
          sectores: ["Centro", "Miraflores", "El Guayabal"],
          poligono: [
            [10.0300, -63.7400],
            [10.0350, -63.6900],
            [9.9850, -63.6800],
            [9.9750, -63.7300],
            [10.0300, -63.7400]
          ]
        }
      ]
    },
    {
      id: "piar",
      nombre: "Municipio Piar",
      parroquias: [
        {
          id: "aragua",
          nombre: "Aragua de Maturín",
          codigo: "PIA-ARA",
          tipo: "Capital Municipal",
          centro: [9.9720, -63.4850],
          zoom: 13,
          color: "#a855f7",
          sectores: ["Aragua Centro", "El Caro", "Chaguaramal"],
          poligono: [
            [9.9980, -63.5150],
            [10.0050, -63.4600],
            [9.9550, -63.4500],
            [9.9450, -63.5050],
            [9.9980, -63.5150]
          ]
        }
      ]
    },
    {
      id: "caripe",
      nombre: "Municipio Caripe",
      parroquias: [
        {
          id: "caripe-centro",
          nombre: "Caripe",
          codigo: "CAR-CEN",
          tipo: "Capital Turística",
          centro: [10.1780, -63.4980],
          zoom: 13,
          color: "#10b981",
          sectores: ["Caripe Centro", "El Guácharo", "Teresén"],
          poligono: [
            [10.2050, -63.5250],
            [10.2100, -63.4750],
            [10.1550, -63.4650],
            [10.1450, -63.5150],
            [10.2050, -63.5250]
          ]
        }
      ]
    },
    {
      id: "ezequiel-zamora",
      nombre: "Municipio Ezequiel Zamora",
      parroquias: [
        {
          id: "punta-de-mata",
          nombre: "Punta de Mata",
          codigo: "ZAM-PUN",
          tipo: "Capital Petrolera Oeste",
          centro: [9.7150, -63.6280],
          zoom: 13,
          color: "#e11d48",
          sectores: ["Punta de Mata Centro", "El Tejero", "19 de Abril"],
          poligono: [
            [9.7450, -63.6600],
            [9.7500, -63.6050],
            [9.6950, -63.5950],
            [9.6850, -63.6500],
            [9.7450, -63.6600]
          ]
        }
      ]
    }
  ]
};
