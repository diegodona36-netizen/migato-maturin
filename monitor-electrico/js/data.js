/**
 * Monitor de Conectividad y Cortes Eléctricos — Venezuela (Georgia Tech IODA)
 * Diccionario geográfico, circuitos de Monagas y los 24 estados de Venezuela
 */

export const MONAGAS_CIRCUITOS = [
  { id: "mat-godos", nombre: "Circuito Los Godos / Alto Los Godos", subestacion: "S/E El Indio 115kV", estado: "DEGRADADO", voltaje: 108, disponibilidadPct: 65, fallas24h: 1 },
  { id: "mat-centro", nombre: "Maturín Centro / Av. Bolívar y Bicentenario", subestacion: "S/E Maturín Centro", estado: "NORMAL", voltaje: 118, disponibilidadPct: 88, fallas24h: 0 },
  { id: "mat-tipuro", nombre: "Tipuro / Palma Real / Boquerón", subestacion: "S/E Tipuro 115kV", estado: "DEGRADADO", voltaje: 110, disponibilidadPct: 70, fallas24h: 1 },
  { id: "mat-cocuizas", nombre: "Las Cocuizas / Sabana Grande", subestacion: "S/E Boulevard", estado: "NORMAL", voltaje: 115, disponibilidadPct: 82, fallas24h: 0 },
  { id: "mat-pica", nombre: "La Pica / Aeropuerto", subestacion: "S/E La Pica", estado: "CRÍTICO", voltaje: 98, disponibilidadPct: 45, fallas24h: 2 },
  { id: "mat-jusepin", nombre: "Jusepín / El Furrial / Tejero", subestacion: "S/E Jusepín 115kV", estado: "DEGRADADO", voltaje: 105, disponibilidadPct: 60, fallas24h: 1 },
  { id: "mon-punta", nombre: "Ezequiel Zamora (Punta de Mata)", subestacion: "S/E Tejero", estado: "NORMAL", voltaje: 116, disponibilidadPct: 80, fallas24h: 0 },
  { id: "mon-caripito", nombre: "Bolívar (Caripito) / San Antonio", subestacion: "S/E Caripito", estado: "DEGRADADO", voltaje: 106, disponibilidadPct: 62, fallas24h: 1 }
];

export const ESTADOS_VENEZUELA = [
  {
    id: "VE-S",
    nombre: "Táchira",
    tier: "T1",
    capital: "San Cristóbal",
    lat: 7.7669,
    lng: -72.2250,
    poblacionPonderada: 1200000,
    baseProbes: 225,
    baseLatency: 85
  },
  {
    id: "VE-N",
    nombre: "Monagas",
    tier: "T3",
    capital: "Maturín",
    lat: 9.7469,
    lng: -63.1812,
    poblacionPonderada: 1020000,
    baseProbes: 210,
    baseLatency: 82,
    destacado: true
  },
  {
    id: "VE-L",
    nombre: "Mérida",
    tier: "T1",
    capital: "Mérida",
    lat: 8.5983,
    lng: -71.1449,
    poblacionPonderada: 1050000,
    baseProbes: 210,
    baseLatency: 92
  },
  {
    id: "VE-R",
    nombre: "Sucre",
    tier: "T1",
    capital: "Cumaná",
    lat: 10.4539,
    lng: -64.1826,
    poblacionPonderada: 1100000,
    baseProbes: 180,
    baseLatency: 88
  },
  {
    id: "VE-B",
    nombre: "Aragua",
    tier: "T2",
    capital: "Maracay",
    lat: 10.2469,
    lng: -67.5958,
    poblacionPonderada: 1850000,
    baseProbes: 280,
    baseLatency: 65
  },
  {
    id: "VE-O",
    nombre: "Nueva Esparta",
    tier: "T2",
    capital: "La Asunción",
    lat: 11.0000,
    lng: -63.9000,
    poblacionPonderada: 620000,
    baseProbes: 195,
    baseLatency: 78
  },
  {
    id: "VE-I",
    nombre: "Falcón",
    tier: "T2",
    capital: "Coro",
    lat: 11.4045,
    lng: -69.6734,
    poblacionPonderada: 1050000,
    baseProbes: 215,
    baseLatency: 75
  },
  {
    id: "VE-C",
    nombre: "Apure",
    tier: "T3",
    capital: "San Fernando de Apure",
    lat: 7.8939,
    lng: -67.4724,
    poblacionPonderada: 600000,
    baseProbes: 140,
    baseLatency: 95
  },
  {
    id: "VE-K",
    nombre: "Lara",
    tier: "T2",
    capital: "Barquisimeto",
    lat: 10.0678,
    lng: -69.3474,
    poblacionPonderada: 2050000,
    baseProbes: 290,
    baseLatency: 70
  },
  {
    id: "VE-A",
    nombre: "Anzoátegui",
    tier: "T3",
    capital: "Barcelona",
    lat: 10.1363,
    lng: -64.6862,
    poblacionPonderada: 1750000,
    baseProbes: 260,
    baseLatency: 72
  },
  {
    id: "VE-X",
    nombre: "Vargas",
    tier: "T3",
    capital: "La Guaira",
    lat: 10.5990,
    lng: -66.9340,
    poblacionPonderada: 380000,
    baseProbes: 190,
    baseLatency: 55
  },
  {
    id: "VE-J",
    nombre: "Guárico",
    tier: "T2",
    capital: "San Juan de los Morros",
    lat: 9.9115,
    lng: -67.3538,
    poblacionPonderada: 950000,
    baseProbes: 175,
    baseLatency: 80
  },
  {
    id: "VE-T",
    nombre: "Trujillo",
    tier: "T1",
    capital: "Trujillo",
    lat: 9.3667,
    lng: -70.4333,
    poblacionPonderada: 870000,
    baseProbes: 165,
    baseLatency: 90
  },
  {
    id: "VE-H",
    nombre: "Cojedes",
    tier: "T2",
    capital: "San Carlos",
    lat: 9.6612,
    lng: -68.5828,
    poblacionPonderada: 370000,
    baseProbes: 130,
    baseLatency: 76
  },
  {
    id: "VE-V",
    nombre: "Zulia",
    tier: "T1",
    capital: "Maracaibo",
    lat: 10.6427,
    lng: -71.6125,
    poblacionPonderada: 4300000,
    baseProbes: 320,
    baseLatency: 82
  },
  {
    id: "VE-E",
    nombre: "Barinas",
    tier: "T1",
    capital: "Barinas",
    lat: 8.6226,
    lng: -70.2075,
    poblacionPonderada: 970000,
    baseProbes: 190,
    baseLatency: 88
  },
  {
    id: "VE-P",
    nombre: "Portuguesa",
    tier: "T2",
    capital: "Guanare",
    lat: 9.0418,
    lng: -69.7421,
    poblacionPonderada: 1030000,
    baseProbes: 185,
    baseLatency: 84
  },
  {
    id: "VE-U",
    nombre: "Yaracuy",
    tier: "T2",
    capital: "San Felipe",
    lat: 10.3399,
    lng: -68.7425,
    poblacionPonderada: 750000,
    baseProbes: 160,
    baseLatency: 72
  },
  {
    id: "VE-G",
    nombre: "Carabobo",
    tier: "T2",
    capital: "Valencia",
    lat: 10.1620,
    lng: -68.0077,
    poblacionPonderada: 2600000,
    baseProbes: 310,
    baseLatency: 60
  },
  {
    id: "VE-Y",
    nombre: "Delta Amacuro",
    tier: "T3",
    capital: "Tucupita",
    lat: 9.0611,
    lng: -62.0528,
    poblacionPonderada: 210000,
    baseProbes: 110,
    baseLatency: 110
  },
  {
    id: "VE-F",
    nombre: "Bolívar",
    tier: "T3",
    capital: "Ciudad Bolívar",
    lat: 8.1292,
    lng: -63.5408,
    poblacionPonderada: 1900000,
    baseProbes: 230,
    baseLatency: 92
  },
  {
    id: "VE-M",
    nombre: "Miranda",
    tier: "T3",
    capital: "Los Teques",
    lat: 10.3445,
    lng: -67.0433,
    poblacionPonderada: 3300000,
    baseProbes: 340,
    baseLatency: 52
  },
  {
    id: "VE-A_DC",
    nombre: "Distrito Capital",
    tier: "T3",
    capital: "Caracas",
    lat: 10.4806,
    lng: -66.9036,
    poblacionPonderada: 2100000,
    baseProbes: 350,
    baseLatency: 48
  },
  {
    id: "VE-Z",
    nombre: "Amazonas",
    tier: "T3",
    capital: "Puerto Ayacucho",
    lat: 5.6639,
    lng: -67.6236,
    poblacionPonderada: 190000,
    baseProbes: 95,
    baseLatency: 125
  }
];

export const TOTAL_PUNTOS_SONDEO_IODA = 294;
