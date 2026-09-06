/**
 * Módulo de Datos y Persistencia: Caracterización del Voto • MIGATO
 * Técnica Electoral • Alto de Los Godos / Maturín, Monagas
 */

// Sub-Parroquias y Sectores Oficiales de Alto de Los Godos
export const SUBPARROQUIAS_GODOS = [
  {
    id: "sub-godos-6",
    nombre: "Sub-Parroquia 6 • La Puente (Eje Central)",
    sectores: [
      "Monagzal",
      "Las Vírgenes",
      "Villa de los Ángeles",
      "La Puente Sector 1 (Plaza)",
      "La Puente Sector 2 (Cancha)",
      "La Puente Sector 3 (Vialidad)",
      "La Puente Sector 4 (Quebrada)",
      "Villas de La Puente",
      "Cacique Guanaguanay",
      "Libertador",
      "Simoncito"
    ],
    centroPrincipal: "Cruz Hernández Quijada"
  },
  {
    id: "sub-godos-1",
    nombre: "Sub-Parroquia 1 • Casco Los Godos",
    sectores: [
      "Los Godos 1 (Plaza)",
      "Los Godos 2",
      "Calle El Sol",
      "Av. Principal Los Godos",
      "Bloques de Los Godos"
    ],
    centroPrincipal: "Centro De Educación Inicial Alto De Los Godos I"
  },
  {
    id: "sub-godos-2",
    nombre: "Sub-Parroquia 2 • Morichal",
    sectores: [
      "Morichal Sector 1",
      "Morichal Sector 2",
      "Valles del Morichal",
      "Calle Los Claveles",
      "Brisas del Morichal"
    ],
    centroPrincipal: "Centro De Votación Brisas De Venezuela"
  },
  {
    id: "sub-godos-3",
    nombre: "Sub-Parroquia 3 • Fundemos",
    sectores: [
      "Fundemos I",
      "Fundemos II",
      "Fundemos III",
      "El Tejar",
      "Urbanización Fundemos"
    ],
    centroPrincipal: "Centro De Formación Integral Para El Trabajo"
  },
  {
    id: "sub-godos-4",
    nombre: "Sub-Parroquia 4 • Los Guaros",
    sectores: [
      "Los Guaros 1",
      "Los Guaros 2",
      "Calle Sucre",
      "La Pica de Los Guaros"
    ],
    centroPrincipal: "Centro De Votacion San Rafael"
  },
  {
    id: "sub-godos-5",
    nombre: "Sub-Parroquia 5 • El Silencio",
    sectores: [
      "El Silencio Campo Alegre",
      "Sector La Manga Godos",
      "Calle Bolívar El Silencio"
    ],
    centroPrincipal: "Centro Del Niño Y La Familia Simoncito Moscu"
  },
  {
    id: "sub-godos-7",
    nombre: "Sub-Parroquia 7 • Rómulo Betancourt",
    sectores: [
      "Rómulo Gallegos",
      "El Paraíso de Godos",
      "Sector La Lagunita"
    ],
    centroPrincipal: "Centro De Votación La Pastora"
  },
  {
    id: "sub-godos-8",
    nombre: "Sub-Parroquia 8 • Las Brisas / Alberto Ravell",
    sectores: [
      "Alberto Ravell I",
      "Alberto Ravell II",
      "Las Brisas del Aeropuerto"
    ],
    centroPrincipal: "Centro Del Niño Y La Familia Bolivariano Prado Del Sur"
  },
  {
    id: "sub-godos-9",
    nombre: "Sub-Parroquia 9 • San Rafael",
    sectores: [
      "San Rafael Sector Arriba",
      "San Rafael Casco",
      "Calle Páez"
    ],
    centroPrincipal: "Centro De Votacion San Rafael"
  },
  {
    id: "sub-godos-10",
    nombre: "Sub-Parroquia 10 • Paramaconi",
    sectores: [
      "Paramaconi I",
      "Paramaconi II",
      "Corapal",
      "Brisas de Paramaconi"
    ],
    centroPrincipal: "Centro Del Niño Y La Familia Bolivariano Nuevo Horizonte"
  }
];

// Semilla inicial realista de 16 electores caracterizados para Alto de Los Godos
export const DEMO_ELECTORES_GODOS = [
  {
    id: "god-001",
    correlativo: 1,
    nombreApellido: "José Gregorio Rivas Flores",
    cedula: "V-14.892.410",
    telefono: "0414-7629182",
    subParroquia: "Sub-Parroquia 6 • La Puente (Eje Central)",
    centroElectoral: "Cruz Hernández Quijada",
    sector: "Monagzal",
    edad: 48,
    profesion: "Comerciante / Bodeguero",
    clasificacionVoto: "duro",
    fechaRegistro: "2026-03-05T09:15:00Z"
  },
  {
    id: "god-002",
    correlativo: 2,
    nombreApellido: "Carmen Beatriz Velásquez",
    cedula: "V-18.450.312",
    telefono: "0424-9123841",
    subParroquia: "Sub-Parroquia 6 • La Puente (Eje Central)",
    centroElectoral: "Cruz Hernández Quijada",
    sector: "Las Vírgenes",
    edad: 39,
    profesion: "Docente de Primaria",
    clasificacionVoto: "duro",
    fechaRegistro: "2026-03-05T09:22:00Z"
  },
  {
    id: "god-003",
    correlativo: 3,
    nombreApellido: "Yordano Jesús Marcano Gil",
    cedula: "V-28.715.604",
    telefono: "0412-8834190",
    subParroquia: "Sub-Parroquia 6 • La Puente (Eje Central)",
    centroElectoral: "Cruz Hernández Quijada",
    sector: "Villa de los Ángeles",
    edad: 22,
    profesion: "Estudiante UDO / Emprendedor",
    clasificacionVoto: "nuevo",
    fechaRegistro: "2026-03-05T09:35:00Z"
  },
  {
    id: "god-004",
    correlativo: 4,
    nombreApellido: "Francisco Antonio Salazar",
    cedula: "V-12.304.819",
    telefono: "0416-5912044",
    subParroquia: "Sub-Parroquia 6 • La Puente (Eje Central)",
    centroElectoral: "Cruz Hernández Quijada",
    sector: "La Puente Sector 2 (Cancha)",
    edad: 55,
    profesion: "Mecánico Automotriz",
    clasificacionVoto: "blando",
    fechaRegistro: "2026-03-05T10:05:00Z"
  },
  {
    id: "god-005",
    correlativo: 5,
    nombreApellido: "Génesis Coromoto Padrino",
    cedula: "V-29.412.003",
    telefono: "0424-9843210",
    subParroquia: "Sub-Parroquia 6 • La Puente (Eje Central)",
    centroElectoral: "Cruz Hernández Quijada",
    sector: "Monagzal",
    edad: 20,
    profesion: "Estudiante de Enfermería",
    clasificacionVoto: "nuevo",
    fechaRegistro: "2026-03-05T10:18:00Z"
  },
  {
    id: "god-006",
    correlativo: 6,
    nombreApellido: "Manuel Salvador Rondón",
    cedula: "V-11.890.231",
    telefono: "0414-8761234",
    subParroquia: "Sub-Parroquia 1 • Casco Los Godos",
    centroElectoral: "Centro De Educación Inicial Alto De Los Godos I",
    sector: "Los Godos 1 (Plaza)",
    edad: 61,
    profesion: "Jubilado / Albañil",
    clasificacionVoto: "duro",
    fechaRegistro: "2026-03-05T10:45:00Z"
  },
  {
    id: "god-007",
    correlativo: 7,
    nombreApellido: "Rosiris del Valle Martínez",
    cedula: "V-16.741.590",
    telefono: "0412-3456789",
    subParroquia: "Sub-Parroquia 1 • Casco Los Godos",
    centroElectoral: "Centro De Educación Inicial Alto De Los Godos I",
    sector: "Los Godos 2",
    edad: 44,
    profesion: "Costurera",
    clasificacionVoto: "blando",
    fechaRegistro: "2026-03-05T11:00:00Z"
  },
  {
    id: "god-008",
    correlativo: 8,
    nombreApellido: "Andrés Eloy Brito Peña",
    cedula: "V-27.654.321",
    telefono: "0414-9988776",
    subParroquia: "Sub-Parroquia 2 • Morichal",
    centroElectoral: "Centro De Votación Brisas De Venezuela",
    sector: "Morichal Sector 1",
    edad: 24,
    profesion: "Técnico en Refrigeración",
    clasificacionVoto: "nuevo",
    fechaRegistro: "2026-03-05T11:20:00Z"
  },
  {
    id: "god-009",
    correlativo: 9,
    nombreApellido: "Luisa Elena Cedeño",
    cedula: "V-13.567.890",
    telefono: "0416-1122334",
    subParroquia: "Sub-Parroquia 2 • Morichal",
    centroElectoral: "Centro De Votación Brisas De Venezuela",
    sector: "Morichal Sector 2",
    edad: 52,
    profesion: "Secretaria",
    clasificacionVoto: "duro",
    fechaRegistro: "2026-03-05T11:40:00Z"
  },
  {
    id: "god-010",
    correlativo: 10,
    nombreApellido: "Héctor Ramón Guache",
    cedula: "V-17.890.123",
    telefono: "0424-4455667",
    subParroquia: "Sub-Parroquia 3 • Fundemos",
    centroElectoral: "Centro De Formación Integral Para El Trabajo",
    sector: "Fundemos I",
    edad: 41,
    profesion: "Chofer Transporte Público",
    clasificacionVoto: "blando",
    fechaRegistro: "2026-03-05T12:05:00Z"
  },
  {
    id: "god-011",
    correlativo: 11,
    nombreApellido: "Patricia Carolina Figueroa",
    cedula: "V-20.123.456",
    telefono: "0414-2233445",
    subParroquia: "Sub-Parroquia 3 • Fundemos",
    centroElectoral: "Centro De Formación Integral Para El Trabajo",
    sector: "Fundemos II",
    edad: 35,
    profesion: "Administradora",
    clasificacionVoto: "duro",
    fechaRegistro: "2026-03-05T12:30:00Z"
  },
  {
    id: "god-012",
    correlativo: 12,
    nombreApellido: "Anthony José Malavé",
    cedula: "V-30.145.892",
    telefono: "0412-9988112",
    subParroquia: "Sub-Parroquia 4 • Los Guaros",
    centroElectoral: "Centro De Votacion San Rafael",
    sector: "Los Guaros 1",
    edad: 19,
    profesion: "Estudiante de Informática",
    clasificacionVoto: "nuevo",
    fechaRegistro: "2026-03-05T13:00:00Z"
  },
  {
    id: "god-013",
    correlativo: 13,
    nombreApellido: "Doris Josefina Hurtado",
    cedula: "V-15.340.912",
    telefono: "0416-7788990",
    subParroquia: "Sub-Parroquia 4 • Los Guaros",
    centroElectoral: "Centro De Votacion San Rafael",
    sector: "Los Guaros 2",
    edad: 46,
    profesion: "Enfermera General",
    clasificacionVoto: "duro",
    fechaRegistro: "2026-03-05T13:15:00Z"
  },
  {
    id: "god-014",
    correlativo: 14,
    nombreApellido: "Julián David Cova",
    cedula: "V-19.876.543",
    telefono: "0424-8899001",
    subParroquia: "Sub-Parroquia 5 • El Silencio",
    centroElectoral: "Centro Del Niño Y La Familia Simoncito Moscu",
    sector: "El Silencio Campo Alegre",
    edad: 37,
    profesion: "Electricista Residencial",
    clasificacionVoto: "blando",
    fechaRegistro: "2026-03-05T13:45:00Z"
  },
  {
    id: "god-015",
    correlativo: 15,
    nombreApellido: "Mariángel Victoria León",
    cedula: "V-28.901.234",
    telefono: "0414-3322114",
    subParroquia: "Sub-Parroquia 10 • Paramaconi",
    centroElectoral: "Centro Del Niño Y La Familia Bolivariano Nuevo Horizonte",
    sector: "Paramaconi I",
    edad: 21,
    profesion: "Barbera / Estilista",
    clasificacionVoto: "nuevo",
    fechaRegistro: "2026-03-05T14:10:00Z"
  },
  {
    id: "god-016",
    correlativo: 16,
    nombreApellido: "Pedro Pablo Zambrano",
    cedula: "V-9.876.543",
    telefono: "0416-5544332",
    subParroquia: "Sub-Parroquia 10 • Paramaconi",
    centroElectoral: "Centro Del Niño Y La Familia Bolivariano Nuevo Horizonte",
    sector: "Corapal",
    edad: 64,
    profesion: "Agricultor Urbano",
    clasificacionVoto: "duro",
    fechaRegistro: "2026-03-05T14:30:00Z"
  }
];

const STORAGE_KEY = "migato_caracterizacion_voto_v1";

/**
 * Gestor Central de Persistencia y Métricas Electorales
 */
export class VotoStore {
  constructor() {
    this.electores = this.cargarDesdeStorage();
  }

  cargarDesdeStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Error leyendo localStorage, cargando semilla demo:", e);
    }
    // Si no hay datos, inicializamos con la semilla de demo oficial
    this.guardarEnStorage(DEMO_ELECTORES_GODOS);
    return [...DEMO_ELECTORES_GODOS];
  }

  guardarEnStorage(lista) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    } catch (e) {
      console.error("Error guardando en localStorage:", e);
    }
  }

  listarVotantes(filtros = {}) {
    let result = [...this.electores];

    if (filtros.clasificacion && filtros.clasificacion !== "todos") {
      result = result.filter(e => e.clasificacionVoto === filtros.clasificacion);
    }

    if (filtros.subParroquia && filtros.subParroquia !== "todos") {
      result = result.filter(e => e.subParroquia === filtros.subParroquia);
    }

    if (filtros.centroElectoral && filtros.centroElectoral !== "todos") {
      result = result.filter(e => e.centroElectoral === filtros.centroElectoral);
    }

    if (filtros.busqueda && filtros.busqueda.trim() !== "") {
      const q = filtros.busqueda.toLowerCase().trim();
      result = result.filter(e => 
        (e.nombreApellido && e.nombreApellido.toLowerCase().includes(q)) ||
        (e.cedula && e.cedula.toLowerCase().includes(q)) ||
        (e.telefono && e.telefono.includes(q)) ||
        (e.sector && e.sector.toLowerCase().includes(q)) ||
        (e.profesion && e.profesion.toLowerCase().includes(q))
      );
    }

    return result;
  }

  agregarVotante(data) {
    const correlativoMax = this.electores.reduce((max, e) => Math.max(max, e.correlativo || 0), 0);
    const nuevoVotante = {
      id: "god-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      correlativo: correlativoMax + 1,
      nombreApellido: (data.nombreApellido || "").trim(),
      cedula: (data.cedula || "").trim(),
      telefono: (data.telefono || "").trim(),
      subParroquia: data.subParroquia || "",
      centroElectoral: data.centroElectoral || "",
      sector: data.sector || "",
      edad: parseInt(data.edad, 10) || null,
      profesion: (data.profesion || "").trim(),
      clasificacionVoto: data.clasificacionVoto || "duro", // 'duro' | 'blando' | 'nuevo'
      fechaRegistro: new Date().toISOString()
    };

    this.electores.unshift(nuevoVotante);
    this.guardarEnStorage(this.electores);
    return nuevoVotante;
  }

  eliminarVotante(id) {
    const idx = this.electores.findIndex(e => e.id === id);
    if (idx !== -1) {
      const borrado = this.electores.splice(idx, 1)[0];
      this.guardarEnStorage(this.electores);
      return borrado;
    }
    return null;
  }

  restaurarDemo() {
    this.electores = [...DEMO_ELECTORES_GODOS];
    this.guardarEnStorage(this.electores);
    return this.electores;
  }

  limpiarTodos() {
    this.electores = [];
    this.guardarEnStorage(this.electores);
  }

  calcularEstadisticas(lista = null) {
    const items = lista || this.electores;
    const total = items.length;

    let duros = 0;
    let blandos = 0;
    let nuevos = 0;
    let sumaEdades = 0;
    let edadesContadas = 0;

    const profesionesMap = {};
    const subParroquiasMap = {};
    const centrosMap = {};

    for (const e of items) {
      if (e.clasificacionVoto === "duro") duros++;
      else if (e.clasificacionVoto === "blando") blandos++;
      else if (e.clasificacionVoto === "nuevo") nuevos++;

      if (e.edad && !isNaN(e.edad)) {
        sumaEdades += Number(e.edad);
        edadesContadas++;
      }

      if (e.profesion) {
        profesionesMap[e.profesion] = (profesionesMap[e.profesion] || 0) + 1;
      }
      if (e.subParroquia) {
        subParroquiasMap[e.subParroquia] = (subParroquiasMap[e.subParroquia] || 0) + 1;
      }
      if (e.centroElectoral) {
        centrosMap[e.centroElectoral] = (centrosMap[e.centroElectoral] || 0) + 1;
      }
    }

    return {
      total,
      duros,
      durosPct: total > 0 ? Math.round((duros / total) * 100) : 0,
      blandos,
      blandosPct: total > 0 ? Math.round((blandos / total) * 100) : 0,
      nuevos,
      nuevosPct: total > 0 ? Math.round((nuevos / total) * 100) : 0,
      edadPromedio: edadesContadas > 0 ? Math.round(sumaEdades / edadesContadas) : 0,
      profesionesMap,
      subParroquiasMap,
      centrosMap
    };
  }

  exportarCSV(lista = null) {
    const items = lista || this.electores;
    if (items.length === 0) {
      alert("No hay electores para exportar.");
      return;
    }

    // Cabecera idéntica a las 10 columnas del papelógrafo
    const headers = [
      "N°",
      "Nombre y Apellido",
      "Cédula",
      "Teléfono",
      "Sub-Parroquia",
      "Centro Electoral",
      "Sector",
      "Edad",
      "Profesión",
      "Clasificación Voto",
      "Voto Duro (X)",
      "Voto Blando (X)",
      "Voto Nuevo (X)",
      "Fecha Registro"
    ];

    const rows = items.map((e, index) => [
      index + 1,
      `"${(e.nombreApellido || "").replace(/"/g, '""')}"`,
      `"${e.cedula || ""}"`,
      `"${e.telefono || ""}"`,
      `"${(e.subParroquia || "").replace(/"/g, '""')}"`,
      `"${(e.centroElectoral || "").replace(/"/g, '""')}"`,
      `"${(e.sector || "").replace(/"/g, '""')}"`,
      e.edad || "",
      `"${(e.profesion || "").replace(/"/g, '""')}"`,
      `"${(e.clasificacionVoto || "").toUpperCase()}"`,
      e.clasificacionVoto === "duro" ? "X" : "",
      e.clasificacionVoto === "blando" ? "X" : "",
      e.clasificacionVoto === "nuevo" ? "X" : "",
      `"${e.fechaRegistro ? new Date(e.fechaRegistro).toLocaleString("es-VE") : ""}"`
    ]);

    // UTF-8 BOM para que Excel abra sin problemas de acentos ni ñ
    const BOM = "\uFEFF";
    const csvContent = BOM + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Caracterizacion_Voto_MIGATO_AltoDeLosGodos_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
