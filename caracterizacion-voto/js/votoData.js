/**
 * Módulo de Datos y Persistencia: Caracterización del Voto • MIGATO
 * Técnica Electoral • Alto de Los Godos / Maturín, Monagas
 */

// Sub-Parroquias y Sectores Oficiales de Alto de Los Godos (Único eje oficial digitalizado)
export const SUBPARROQUIAS_GODOS = [
  {
    id: "sub-godos-6",
    nombre: "Sub-Parroquia 6 • La Puente",
    sectores: [
      "Villa de los Ángeles",
      "El Mangozal",
      "Las Vírgenes",
      "Hugo Chávez II",
      "La Lucha",
      "El Caro",
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
  }
];

// Base nominal de electores en producción: Inicia limpio para registro real en calle
export const DEMO_ELECTORES_GODOS = [];

const STORAGE_KEY = "migato_caracterizacion_voto_prod_v1";

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
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Error leyendo localStorage:", e);
    }
    return [];
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

  importarElectores(lista = []) {
    if (!Array.isArray(lista) || lista.length === 0) return { agregados: 0, duplicados: 0 };

    const cedulasExistentes = new Set(
      this.electores.map(e => (e.cedula || "").replace(/\D/g, "")).filter(Boolean)
    );

    let correlativoMax = this.electores.reduce((max, e) => Math.max(max, e.correlativo || 0), 0);
    const validos = [];
    let duplicados = 0;

    for (const item of lista) {
      const digitos = (item.cedula || "").replace(/\D/g, "");
      if (!digitos || cedulasExistentes.has(digitos)) {
        duplicados++;
        continue;
      }
      cedulasExistentes.add(digitos);
      correlativoMax++;

      const tipoDoc = /E/i.test(item.cedula || "") ? "E" : "V";
      const nuevo = {
        id: item.id || `god-${Date.now()}-${Math.floor(Math.random() * 10000)}-${correlativoMax}`,
        correlativo: correlativoMax,
        nombreApellido: (item.nombreApellido || "").trim().toUpperCase(),
        cedula: item.cedula && item.cedula.includes("-") ? item.cedula : `${tipoDoc}-${digitos}`,
        telefono: (item.telefono || "").trim(),
        subParroquia: item.subParroquia || "",
        centroElectoral: item.centroElectoral || "",
        sector: item.sector || "",
        edad: parseInt(item.edad, 10) || null,
        profesion: (item.profesion || "").trim(),
        clasificacionVoto: item.clasificacionVoto || "duro",
        fechaRegistro: item.fechaRegistro || new Date().toISOString()
      };
      validos.push(nuevo);
    }

    if (validos.length > 0) {
      this.electores = [...validos, ...this.electores];
      this.guardarEnStorage(this.electores);
    }

    return { agregados: validos.length, duplicados, total: this.electores.length };
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
