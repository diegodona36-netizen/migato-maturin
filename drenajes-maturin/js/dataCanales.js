/**
 * Base de Datos Geoespacial e Hidráulica de los Caños de Maturín
 * Sistema de Diagnóstico HEC-RAS & GIS Open Source
 */

export const CANALES_MATURIN = [
  {
    id: "cano-orinoco",
    nombre: "Caño Orinoco",
    parroquia: "San Simón / San Vicente",
    longitudKm: 6.4,
    anchoPromedioM: 4.5,
    profundidadM: 2.2,
    pendienteS: 0.0018, // 0.18%
    rugosidadManning: 0.045, // Tierra con maleza
    capacidadDisenoM3s: 18.5,
    caudalActualM3s: 7.2,
    estadoSedimentacionPct: 75,
    viviendasRiesgo: 420,
    nivelRiesgo: "CRÍTICO",
    descripcion: "Atraviesa el corazón de Maturín, afectando Brisas del Orinoco, Centro y La Muralla. Alto nivel de sedimentación y basura en pasos de puentes.",
    coordenadas: [
      [9.7580, -63.1950],
      [9.7520, -63.1880],
      [9.7460, -63.1810],
      [9.7410, -63.1740],
      [9.7360, -63.1670],
      [9.7310, -63.1590]
    ]
  },
  {
    id: "cano-godos",
    nombre: "Caño Los Godos",
    parroquia: "Alto de Los Godos",
    longitudKm: 5.2,
    anchoPromedioM: 3.8,
    profundidadM: 1.9,
    pendienteS: 0.0022,
    rugosidadManning: 0.040,
    capacidadDisenoM3s: 14.0,
    caudalActualM3s: 5.8,
    estadoSedimentacionPct: 65,
    viviendasRiesgo: 310,
    nivelRiesgo: "ALTO",
    descripcion: "Eje colector principal del oeste de Maturín. Discurre entre Los Godos, Morichal y Fundemos. Estrangulamiento en cajón de paso Av. El Ejército.",
    coordenadas: [
      [9.7380, -63.2180],
      [9.7340, -63.2100],
      [9.7300, -63.2020],
      [9.7270, -63.1940],
      [9.7240, -63.1850]
    ]
  },
  {
    id: "cano-avenidas",
    nombre: "Caño Las Avenidas",
    parroquia: "San Simón",
    longitudKm: 4.1,
    anchoPromedioM: 3.2,
    profundidadM: 1.8,
    pendienteS: 0.0025,
    rugosidadManning: 0.035, // Parcialmente embaulado
    capacidadDisenoM3s: 11.5,
    caudalActualM3s: 3.9,
    estadoSedimentacionPct: 45,
    viviendasRiesgo: 180,
    nivelRiesgo: "MEDIO",
    descripcion: "Drena el sector comercial y residencial de Las Avenidas, Av. Luis del Valle García y Juanico. Colapso recurrente de sumideros de rejilla.",
    coordenadas: [
      [9.7490, -63.1780],
      [9.7440, -63.1720],
      [9.7390, -63.1670],
      [9.7340, -63.1620]
    ]
  },
  {
    id: "cano-universidad",
    nombre: "Caño Universidad / Los Cortijos",
    parroquia: "Boquerón",
    longitudKm: 7.0,
    anchoPromedioM: 5.0,
    profundidadM: 2.5,
    pendienteS: 0.0015,
    rugosidadManning: 0.050,
    capacidadDisenoM3s: 22.0,
    caudalActualM3s: 6.5,
    estadoSedimentacionPct: 70,
    viviendasRiesgo: 260,
    nivelRiesgo: "ALTO",
    descripcion: "Cruza la zona norte, campus de la UDO y urbanismos de Los Cortijos. Alta acumulación de sedimentos vegetales y socavación de bordes.",
    coordenadas: [
      [9.7750, -63.1980],
      [9.7680, -63.1900],
      [9.7620, -63.1820],
      [9.7560, -63.1740],
      [9.7500, -63.1660]
    ]
  },
  {
    id: "cano-poncha",
    nombre: "Caño Poncha / Palo Negro",
    parroquia: "San Simón",
    longitudKm: 3.5,
    anchoPromedioM: 2.8,
    profundidadM: 1.6,
    pendienteS: 0.0030,
    rugosidadManning: 0.048,
    capacidadDisenoM3s: 8.5,
    caudalActualM3s: 4.2,
    estadoSedimentacionPct: 80,
    viviendasRiesgo: 350,
    nivelRiesgo: "CRÍTICO",
    descripcion: "Zona de alta densidad comunitaria en Palo Negro y Alberto Ravell. Canal angosto y colapsado por descargas clandestinas y escombros.",
    coordenadas: [
      [9.7420, -63.1890],
      [9.7380, -63.1830],
      [9.7350, -63.1770],
      [9.7320, -63.1700]
    ]
  },
  {
    id: "cano-boqueron",
    nombre: "Caño La Chivera / Tipuro",
    parroquia: "Boquerón",
    longitudKm: 6.0,
    anchoPromedioM: 4.0,
    profundidadM: 2.0,
    pendienteS: 0.0020,
    rugosidadManning: 0.042,
    capacidadDisenoM3s: 16.0,
    caudalActualM3s: 4.8,
    estadoSedimentacionPct: 50,
    viviendasRiesgo: 195,
    nivelRiesgo: "MEDIO",
    descripcion: "Drenaje principal de urbanismos de Tipuro, Palma Real y Boquerón Centro. Riesgo en cajón de paso hacia Costo Arriba.",
    coordenadas: [
      [9.7880, -63.1920],
      [9.7820, -63.1860],
      [9.7760, -63.1800],
      [9.7700, -63.1740],
      [9.7640, -63.1680]
    ]
  },
  {
    id: "rio-guarapiche",
    nombre: "Riberas del Río Guarapiche",
    parroquia: "San Simón / Las Cocuizas",
    longitudKm: 12.5,
    anchoPromedioM: 28.0,
    profundidadM: 4.5,
    pendienteS: 0.0008,
    rugosidadManning: 0.035,
    capacidadDisenoM3s: 180.0,
    caudalActualM3s: 45.0,
    estadoSedimentacionPct: 35,
    viviendasRiesgo: 580,
    nivelRiesgo: "MEDIO",
    descripcion: "Cuerpo receptor final de todos los drenajes de Maturín. Monitoreo de cota de desbordamiento frente a la Planta Potabilizadora y Parque La Guaricha.",
    coordenadas: [
      [9.7650, -63.2200],
      [9.7580, -63.2050],
      [9.7520, -63.1900],
      [9.7480, -63.1750],
      [9.7450, -63.1600],
      [9.7420, -63.1450]
    ]
  }
];

export const PUNTOS_CRITICOS_INSPECCION = [
  {
    id: "PC-001",
    fecha: "2026-08-30",
    canoId: "cano-orinoco",
    nombrePunto: "Puente Calle 10 — Brisas del Orinoco",
    parroquia: "San Simón",
    inspector: "Ing. Carlos Mendoza (Brigada Técnica San Simón)",
    tipoEstructura: "Cajón Doble Concreto (2x2m)",
    colapsoSedimentacionPct: 80,
    estadoTalud: "Erosión severa en estribo derecho",
    nivelRiesgo: "CRÍTICO",
    familiasRiesgo: 140,
    obraRequerida: "Dragado con Jumbo (280 m³) y reconstrucción de aletas de concreto",
    prioridad: "URGENTE",
    lat: 9.7465,
    lng: -63.1815
  },
  {
    id: "PC-002",
    fecha: "2026-08-30",
    canoId: "cano-godos",
    nombrePunto: "Paso Colector Av. El Ejército — Los Godos",
    parroquia: "Alto de Los Godos",
    inspector: "Téc. Roberto Valera (Equipo Político Parroquial)",
    tipoEstructura: "Alcantarilla Tubular 48 pulgadas",
    colapsoSedimentacionPct: 70,
    estadoTalud: "Basura compactada y sedimentos de arcilla",
    nivelRiesgo: "ALTO",
    familiasRiesgo: 95,
    obraRequerida: "Sustitución de tubo por cajón 2.5x2.5m y desmalezamiento manual",
    prioridad: "ALTA",
    lat: 9.7342,
    lng: -63.2104
  },
  {
    id: "PC-003",
    fecha: "2026-08-29",
    canoId: "cano-poncha",
    nombrePunto: "Cruce Calle Bolívar — Palo Negro",
    parroquia: "San Simón",
    inspector: "Brigada Comunitaria Palo Negro",
    tipoEstructura: "Canal Abierto de Tierra",
    colapsoSedimentacionPct: 85,
    estadoTalud: "Socavación crítica cerca de viviendas",
    nivelRiesgo: "CRÍTICO",
    familiasRiesgo: 120,
    obraRequerida: "Embaulamiento urgente de 150m lineales y muro de gaviones",
    prioridad: "URGENTE",
    lat: 9.7385,
    lng: -63.1832
  },
  {
    id: "PC-004",
    fecha: "2026-08-28",
    canoId: "cano-universidad",
    nombrePunto: "Alcantarilla Entrada UDO — Los Cortijos",
    parroquia: "Boquerón",
    inspector: "Ing. Manuel Rivas (Comisión de Infraestructura)",
    tipoEstructura: "Cajón Simple 2x1.5m",
    colapsoSedimentacionPct: 60,
    estadoTalud: "Vegetación tipo enea obstruyendo la boca de entrada",
    nivelRiesgo: "MEDIO",
    familiasRiesgo: 65,
    obraRequerida: "Limpieza mecánica con retroexcavadora y retiro de enea",
    prioridad: "MEDIA",
    lat: 9.7623,
    lng: -63.1824
  }
];

export const STORAGE_INSPECCIONES_KEY = "maturin_drenajes_inspecciones_v1";
export const BRIGADA_PIN_DEFAULT = "2026"; // PIN de acceso interno
