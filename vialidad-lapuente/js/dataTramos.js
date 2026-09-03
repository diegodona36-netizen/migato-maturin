/**
 * Geometría y Catálogo de Tramos de la Carretera Principal de La Puente
 * Parroquia Alto de Los Godos — Maturín, Monagas
 */

export const TRAMOS_LA_PUENTE = [
  // ==========================================
  // EJE PRINCIPAL: CORREDOR LA PUENTE (OESTE)
  // ==========================================
  {
    id: "TR-01",
    numero: 1,
    nombre: "Tramo 01: Entrada Av. El Ejército ➔ Entrada Fundemos / Los Guaros",
    tipo: "principal",
    longitudM: 220,
    anchoM: 9.0,
    puntosReferencia: ["Intersección Av. El Ejército", "Entrada Los Guaros", "Parada Fundemos"],
    coordenadas: [
      [9.7348, -63.2082],
      [9.7342, -63.2102]
    ]
  },
  {
    id: "TR-02",
    numero: 2,
    nombre: "Tramo 02: Fundemos ➔ Acceso Sector Morichal",
    tipo: "principal",
    longitudM: 210,
    anchoM: 9.0,
    puntosReferencia: ["Entrada Fundemos 2", "Comercio El Oasis", "Callejón Morichal"],
    coordenadas: [
      [9.7342, -63.2102],
      [9.7335, -63.2121]
    ]
  },
  {
    id: "TR-03",
    numero: 3,
    nombre: "Tramo 03: Sector Morichal ➔ Cruce Calle 1 La Puente",
    tipo: "principal",
    longitudM: 240,
    anchoM: 9.0,
    puntosReferencia: ["Parada Morichal", "Abasto La Mano de Dios", "Cruce Calle 1"],
    coordenadas: [
      [9.7335, -63.2121],
      [9.7328, -63.2143]
    ]
  },
  {
    id: "TR-04",
    numero: 4,
    nombre: "Tramo 04: Calle 1 ➔ Sector El Cementerio Viejo",
    tipo: "principal",
    longitudM: 220,
    anchoM: 8.5,
    puntosReferencia: ["Calle 2", "Acceso Peatonal", "Zona Comercial Bodegas"],
    coordenadas: [
      [9.7328, -63.2143],
      [9.7320, -63.2163]
    ]
  },
  {
    id: "TR-05",
    numero: 5,
    nombre: "Tramo 05: Sector El Cementerio Viejo ➔ Entrada Barrio La Lucha",
    tipo: "principal",
    longitudM: 230,
    anchoM: 8.5,
    puntosReferencia: ["Entrada La Lucha", "Taller Mecánico", "Farmacia Popular"],
    coordenadas: [
      [9.7320, -63.2163],
      [9.7312, -63.2184]
    ]
  },
  {
    id: "TR-06",
    numero: 6,
    nombre: "Tramo 06: Barrio La Lucha ➔ Aproximación al Puente (Caño Los Godos)",
    tipo: "principal",
    longitudM: 200,
    anchoM: 8.5,
    puntosReferencia: ["Bajada del Caño", "Curva de Los Chinos", "Drenaje Pluvial"],
    coordenadas: [
      [9.7312, -63.2184],
      [9.7303, -63.2202]
    ]
  },
  {
    id: "TR-07",
    numero: 7,
    nombre: "Tramo 07: Paso del Puente sobre el Caño Los Godos",
    tipo: "principal",
    longitudM: 160,
    anchoM: 8.0,
    puntosReferencia: ["Puente La Puente", "Paredón del Caño", "Alcantarillado Principal"],
    coordenadas: [
      [9.7303, -63.2202],
      [9.7295, -63.2216]
    ]
  },
  {
    id: "TR-08",
    numero: 8,
    nombre: "Tramo 08: Salida del Puente ➔ Plaza Bolívar / Módulo Policial",
    tipo: "principal",
    longitudM: 220,
    anchoM: 8.5,
    puntosReferencia: ["Plaza de La Puente", "Módulo Policial", "Ambulatorio Urbano"],
    coordenadas: [
      [9.7295, -63.2216],
      [9.7285, -63.2236]
    ]
  },
  {
    id: "TR-09",
    numero: 9,
    nombre: "Tramo 09: Plaza Bolívar ➔ Cancha Techada / Escuela Básica",
    tipo: "principal",
    longitudM: 210,
    anchoM: 9.0,
    puntosReferencia: ["Cancha de Usos Múltiples", "U.E. La Puente", "Iglesia Católica"],
    coordenadas: [
      [9.7285, -63.2236],
      [9.7276, -63.2255]
    ]
  },
  {
    id: "TR-10",
    numero: 10,
    nombre: "Tramo 10: Cancha Techada ➔ Entrada Sector Las Casitas",
    tipo: "principal",
    longitudM: 250,
    anchoM: 8.5,
    puntosReferencia: ["Cruce Las Casitas", "Panadería Central", "Sector La Ceiba"],
    coordenadas: [
      [9.7276, -63.2255],
      [9.7265, -63.2277]
    ]
  },
  {
    id: "TR-11",
    numero: 11,
    nombre: "Tramo 11: Sector Las Casitas ➔ Entrada Brisas de La Puente",
    tipo: "principal",
    longitudM: 230,
    anchoM: 8.5,
    puntosReferencia: ["Entrada Brisas de La Puente", "Llenadero Comunitario", "Sector El Tubo"],
    coordenadas: [
      [9.7265, -63.2277],
      [9.7254, -63.2298]
    ]
  },
  {
    id: "TR-12",
    numero: 12,
    nombre: "Tramo 12: Brisas de La Puente ➔ Sector El Silencio de La Puente",
    tipo: "principal",
    longitudM: 260,
    anchoM: 8.5,
    puntosReferencia: ["Acceso El Silencio", "Curva Los Mangos", "Base de Misiones"],
    coordenadas: [
      [9.7254, -63.2298],
      [9.7242, -63.2321]
    ]
  },
  {
    id: "TR-13",
    numero: 13,
    nombre: "Tramo 13: El Silencio ➔ Sector 4 de Febrero",
    tipo: "principal",
    longitudM: 250,
    anchoM: 8.5,
    puntosReferencia: ["Cruce 4 de Febrero", "Campo Deportivo", "Comunidad Indígena"],
    coordenadas: [
      [9.7242, -63.2321],
      [9.7230, -63.2344]
    ]
  },
  {
    id: "TR-14",
    numero: 14,
    nombre: "Tramo 14: 4 de Febrero ➔ Salida hacia Vía El Furrial / Zona Industrial",
    tipo: "principal",
    longitudM: 280,
    anchoM: 9.0,
    puntosReferencia: ["Redoma Oeste", "Salida Vía Furrial", "Empalme Zona Industrial"],
    coordenadas: [
      [9.7230, -63.2344],
      [9.7216, -63.2369]
    ]
  },

  // ==========================================
  // CALLES TRANSVERSALES CLAVE DE LA PUENTE
  // ==========================================
  {
    id: "TR-T01",
    numero: 101,
    nombre: "Transversal 01: Entrada Calle Los Guaros (Hacia Fundemos 1)",
    tipo: "transversal",
    longitudM: 180,
    anchoM: 7.0,
    puntosReferencia: ["Calle Los Guaros", "Escuela Fundemos"],
    coordenadas: [
      [9.7348, -63.2082],
      [9.7364, -63.2078]
    ]
  },
  {
    id: "TR-T02",
    numero: 102,
    nombre: "Transversal 02: Calle Principal Sector Morichal",
    tipo: "transversal",
    longitudM: 190,
    anchoM: 7.5,
    puntosReferencia: ["Calle Morichal", "Pasarela Peatonal"],
    coordenadas: [
      [9.7335, -63.2121],
      [9.7352, -63.2128]
    ]
  },
  {
    id: "TR-T03",
    numero: 103,
    nombre: "Transversal 03: Calle Transversal Plaza Bolívar ➔ Ambulatorio",
    tipo: "transversal",
    longitudM: 160,
    anchoM: 7.5,
    puntosReferencia: ["Costado Plaza", "Entrada Ambulatorio"],
    coordenadas: [
      [9.7285, -63.2236],
      [9.7299, -63.2245]
    ]
  },
  {
    id: "TR-T04",
    numero: 104,
    nombre: "Transversal 04: Calle de Acceso al Sector Las Casitas",
    tipo: "transversal",
    longitudM: 200,
    anchoM: 7.0,
    puntosReferencia: ["Calle 1 Las Casitas", "Viviendas Nuevas"],
    coordenadas: [
      [9.7265, -63.2277],
      [9.7252, -63.2268]
    ]
  }
];

export const ESTADOS_VIALES = {
  sin_inspeccionar: {
    id: "sin_inspeccionar",
    nombre: "Sin Inspeccionar",
    color: "#64748b",
    colorTexto: "text-slate-400",
    bgBadge: "bg-slate-800 text-slate-300",
    descripcion: "Tramo pendiente por evaluar en el recorrido"
  },
  verde: {
    id: "verde",
    nombre: "Óptimo / Bueno",
    color: "#10b981",
    colorTexto: "text-emerald-400",
    bgBadge: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40",
    descripcion: "Capa asfáltica transitable, sin baches ni fisuras críticas"
  },
  amarillo: {
    id: "amarillo",
    nombre: "Regular / Baches Leves",
    color: "#f59e0b",
    colorTexto: "text-amber-400",
    bgBadge: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
    descripcion: "Desgaste superficial, ondulaciones, baches menores que requieren bacheo"
  },
  naranja: {
    id: "naranja",
    nombre: "Malo / Huecos Pronunciados",
    color: "#f97316",
    colorTexto: "text-orange-400",
    bgBadge: "bg-orange-500/20 text-orange-300 border border-orange-500/40",
    descripcion: "Huecos profundos, fallas de borde, riesgo para vehículos y motos"
  },
  rojo: {
    id: "rojo",
    nombre: "Crítico / Intransitable",
    color: "#ef4444",
    colorTexto: "text-red-400",
    bgBadge: "bg-red-500/20 text-red-300 border border-red-500/40",
    descripcion: "Cráteres severos, vía socavada, pérdida total de asfalto o bote de aguas permanente"
  }
};

export const TIPOLOGIAS_FALLA = [
  "Huecos y Cráteres Profundos",
  "Pérdida Total de Asfalto (Tierra / Ripio)",
  "Hundimiento / Falla de Borde",
  "Bote de Agua Potable rompiendo la Vía",
  "Desborde de Aguas Servidas / Cloacas",
  "Alcantarilla Hundida o Sin Rejilla",
  "Ondulaciones y Piel de Cocodrilo Severa"
];
