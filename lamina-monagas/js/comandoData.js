/**
 * Directorio y Estructura de Comandos Territoriales MIGATO • Monagas 2026
 * 
 * Jerarquía Operativa Multinivel:
 * 1. Comando Regional (Estado Monagas)
 * 2. Comandos Municipales (13 Municipios)
 * 3. Comandos Parroquiales (11 Parroquias de Maturín / 44 del Estado)
 * 4. Comandos Sectoriales / Ejes Territoriales (Polígonos de Subparroquias y Sectores)
 */

export const COMANDO_ESTADAL = {
  entidad: "Estado Monagas",
  nivel: "Dirección General Regional",
  responsableGeneral: "Ing. Diego Donado",
  cargo: "Coordinador General de Sala Situacional",
  division: "División de Ciencia y Tecnología",
  telefono: "+58 412-0000000",
  rolesClave: [
    { cargo: "Coordinador Regional", responsable: "Comando Regional MIGATO", estado: "Activo", icono: "shield" },
    { cargo: "Ciencia y Tecnología", responsable: "Ing. Diego Donado", estado: "En Operación", icono: "cpu" },
    { cargo: "Comisión Electoral CNE", responsable: "Auditoría Electoral Regional", estado: "Acreditado", icono: "check-circle" },
    { cargo: "Operaciones y Logística", responsable: "Despacho Central de Mando", estado: "En Guardia", icono: "radio" }
  ]
};

export const COMANDOS_MUNICIPALES = {
  "maturin": {
    id: "maturin",
    nombre: "Municipio Maturín",
    responsableGeneral: "Coordinación Municipal Maturín",
    telefono: "+58 414-7654321",
    rolesClave: [
      { cargo: "Coordinador Municipal", responsable: "Comando Municipal Maturín", estado: "Activo", icono: "user-check" },
      { cargo: "Coordinador Electoral CNE", responsable: "Auditoría Electoral Maturín", estado: "Acreditado", icono: "vote" },
      { cargo: "Enlace de Logística", responsable: "Operaciones y Movilización", estado: "Listo", icono: "truck" },
      { cargo: "Enlace Parroquial", responsable: "Supervisión 11 Parroquias", estado: "En Línea", icono: "network" }
    ],
    parroquiasCount: 11,
    centrosCount: 175,
    electores: 346988
  },
  "caripe": {
    id: "caripe",
    nombre: "Municipio Caripe",
    responsableGeneral: "Coordinador Municipal Caripe",
    telefono: "+58 412-3456789",
    rolesClave: [
      { cargo: "Coordinador Municipal", responsable: "Comando Caripe", estado: "Activo", icono: "user-check" },
      { cargo: "Enlace Electoral CNE", responsable: "Coordinación Electoral Caripe", estado: "Acreditado", icono: "vote" }
    ],
    parroquiasCount: 6,
    centrosCount: 38,
    electores: 27000
  },
  "ezequiel-zamora": {
    id: "ezequiel-zamora",
    nombre: "Municipio Ezequiel Zamora",
    responsableGeneral: "Coordinador Municipal Punta de Mata",
    telefono: "+58 414-9876543",
    rolesClave: [
      { cargo: "Coordinador Municipal", responsable: "Comando Punta de Mata", estado: "Activo", icono: "user-check" },
      { cargo: "Enlace Electoral CNE", responsable: "Coordinación Electoral Zamora", estado: "Acreditado", icono: "vote" }
    ],
    parroquiasCount: 2,
    centrosCount: 42,
    electores: 48000
  },
  "bolivar": {
    id: "bolivar",
    nombre: "Municipio Bolívar",
    responsableGeneral: "Coordinador Municipal Caripito",
    telefono: "+58 416-1234567",
    rolesClave: [
      { cargo: "Coordinador Municipal", responsable: "Comando Caripito", estado: "Activo", icono: "user-check" },
      { cargo: "Enlace Electoral CNE", responsable: "Coordinación Electoral Caripito", estado: "Acreditado", icono: "vote" }
    ],
    parroquiasCount: 1,
    centrosCount: 35,
    electores: 34000
  },
  "piar": {
    id: "piar",
    nombre: "Municipio Piar",
    responsableGeneral: "Coordinador Municipal Aragua de Maturín",
    telefono: "+58 424-5551212",
    rolesClave: [
      { cargo: "Coordinador Municipal", responsable: "Comando Piar", estado: "Activo", icono: "user-check" },
      { cargo: "Enlace Electoral CNE", responsable: "Coordinación Electoral Piar", estado: "Acreditado", icono: "vote" }
    ],
    parroquiasCount: 7,
    centrosCount: 44,
    electores: 39000
  },
  "cedeno": {
    id: "cedeno",
    nombre: "Municipio Cedeño",
    responsableGeneral: "Coordinador Municipal Caicara",
    telefono: "+58 412-8889900",
    rolesClave: [
      { cargo: "Coordinador Municipal", responsable: "Comando Caicara", estado: "Activo", icono: "user-check" },
      { cargo: "Enlace Electoral CNE", responsable: "Coordinación Electoral Cedeño", estado: "Acreditado", icono: "vote" }
    ],
    parroquiasCount: 4,
    centrosCount: 32,
    electores: 29000
  },
  "punceres": {
    id: "punceres",
    nombre: "Municipio Punceres",
    responsableGeneral: "Coordinador Municipal Quiriquire",
    telefono: "+58 414-3334455",
    rolesClave: [
      { cargo: "Coordinador Municipal", responsable: "Comando Quiriquire", estado: "Activo", icono: "user-check" },
      { cargo: "Enlace Electoral CNE", responsable: "Coordinación Electoral Punceres", estado: "Acreditado", icono: "vote" }
    ],
    parroquiasCount: 2,
    centrosCount: 22,
    electores: 23000
  },
  "acosta": {
    id: "acosta",
    nombre: "Municipio Acosta",
    responsableGeneral: "Coordinador Municipal San Antonio",
    telefono: "+58 416-7778899",
    rolesClave: [
      { cargo: "Coordinador Municipal", responsable: "Comando San Antonio de Capayacuar", estado: "Activo", icono: "user-check" },
      { cargo: "Enlace Electoral CNE", responsable: "Coordinación Electoral Acosta", estado: "Acreditado", icono: "vote" }
    ],
    parroquiasCount: 2,
    centrosCount: 25,
    electores: 18500
  },
  "aguasay": {
    id: "aguasay",
    nombre: "Municipio Aguasay",
    responsableGeneral: "Coordinador Municipal Aguasay",
    telefono: "+58 424-6667788",
    rolesClave: [
      { cargo: "Coordinador Municipal", responsable: "Comando Aguasay", estado: "Activo", icono: "user-check" },
      { cargo: "Enlace Electoral CNE", responsable: "Coordinación Electoral Aguasay", estado: "Acreditado", icono: "vote" }
    ],
    parroquiasCount: 1,
    centrosCount: 14,
    electores: 12500
  },
  "santa-barbara": {
    id: "santa-barbara",
    nombre: "Municipio Santa Bárbara",
    responsableGeneral: "Coordinador Municipal Santa Bárbara",
    telefono: "+58 412-2223344",
    rolesClave: [
      { cargo: "Coordinador Municipal", responsable: "Comando Santa Bárbara", estado: "Activo", icono: "user-check" },
      { cargo: "Enlace Electoral CNE", responsable: "Coordinación Electoral Santa Bárbara", estado: "Acreditado", icono: "vote" }
    ],
    parroquiasCount: 1,
    centrosCount: 12,
    electores: 9800
  },
  "uracoa": {
    id: "uracoa",
    nombre: "Municipio Uracoa",
    responsableGeneral: "Coordinador Municipal Uracoa",
    telefono: "+58 414-1119988",
    rolesClave: [
      { cargo: "Coordinador Municipal", responsable: "Comando Uracoa", estado: "Activo", icono: "user-check" },
      { cargo: "Enlace Electoral CNE", responsable: "Coordinación Electoral Uracoa", estado: "Acreditado", icono: "vote" }
    ],
    parroquiasCount: 1,
    centrosCount: 11,
    electores: 8700
  },
  "libertador": {
    id: "libertador",
    nombre: "Municipio Libertador",
    responsableGeneral: "Coordinador Municipal Temblador",
    telefono: "+58 416-4445566",
    rolesClave: [
      { cargo: "Coordinador Municipal", responsable: "Comando Temblador", estado: "Activo", icono: "user-check" },
      { cargo: "Enlace Electoral CNE", responsable: "Coordinación Electoral Temblador", estado: "Acreditado", icono: "vote" }
    ],
    parroquiasCount: 4,
    centrosCount: 30,
    electores: 36000
  },
  "sotillo": {
    id: "sotillo",
    nombre: "Municipio Sotillo",
    responsableGeneral: "Coordinador Municipal Barrancas",
    telefono: "+58 424-9990011",
    rolesClave: [
      { cargo: "Coordinador Municipal", responsable: "Comando Barrancas del Orinoco", estado: "Activo", icono: "user-check" },
      { cargo: "Enlace Electoral CNE", responsable: "Coordinación Electoral Sotillo", estado: "Acreditado", icono: "vote" }
    ],
    parroquiasCount: 2,
    centrosCount: 26,
    electores: 25500
  }
};

export const COMANDOS_PARROQUIALES = {
  "alto-de-los-godos": {
    parroquiaId: "alto-de-los-godos",
    municipioId: "maturin",
    nombre: "Alto de Los Godos",
    responsablePrincipal: "Responsable Parroquia Los Godos",
    telefono: "+58 412-1234567",
    rolesClave: [
      { cargo: "Responsable Parroquial", responsable: "Responsable Parroquia Los Godos", estado: "Activo", icono: "user-check" },
      { cargo: "Responsable de Organización", responsable: "Organización Parroquial Godos", estado: "Acreditado", icono: "users" },
      { cargo: "Enlace Territorial de Ejes", responsable: "Coordinación de 3 Ejes Territoriales", estado: "En Campo", icono: "map-pin" },
      { cargo: "Control de Centros Electorales", responsable: "Mesa Técnica Electoral", estado: "Verificado", icono: "check-circle-2" }
    ],
    centrosCount: 40,
    electores: 80630
  },
  "san-simon": {
    parroquiaId: "san-simon",
    municipioId: "maturin",
    nombre: "San Simón (Casco Central)",
    responsablePrincipal: "Coordinador Parroquial San Simón",
    telefono: "+58 414-7654321",
    rolesClave: [
      { cargo: "Responsable Parroquial", responsable: "Comando San Simón Centro", estado: "Activo", icono: "user-check" },
      { cargo: "Responsable de Organización", responsable: "Organización Electoral", estado: "Acreditado", icono: "users" },
      { cargo: "Enlace Territorial", responsable: "Supervisión Sectores Centrales", estado: "En Campo", icono: "map-pin" }
    ],
    centrosCount: 45,
    electores: 92400
  },
  "boqueron": {
    parroquiaId: "boqueron",
    municipioId: "maturin",
    nombre: "Boquerón",
    responsablePrincipal: "Coordinador Parroquial Boquerón",
    telefono: "+58 424-9876543",
    rolesClave: [
      { cargo: "Responsable Parroquial", responsable: "Comando Boquerón / Tipuro", estado: "Activo", icono: "user-check" },
      { cargo: "Responsable de Organización", responsable: "Organización Eje Norte", estado: "Acreditado", icono: "users" }
    ],
    centrosCount: 28,
    electores: 61200
  },
  "las-cocuizas": {
    parroquiaId: "las-cocuizas",
    municipioId: "maturin",
    nombre: "Las Cocuizas",
    responsablePrincipal: "Coordinador Parroquial Las Cocuizas",
    telefono: "+58 416-5551234",
    rolesClave: [
      { cargo: "Responsable Parroquial", responsable: "Comando Las Cocuizas", estado: "Activo", icono: "user-check" },
      { cargo: "Responsable de Organización", responsable: "Organización Las Cocuizas", estado: "Acreditado", icono: "users" }
    ],
    centrosCount: 32,
    electores: 68500
  },
  "santa-cruz": {
    parroquiaId: "santa-cruz",
    municipioId: "maturin",
    nombre: "Santa Cruz",
    responsablePrincipal: "Coordinador Parroquial Santa Cruz",
    telefono: "+58 414-3332211",
    rolesClave: [
      { cargo: "Responsable Parroquial", responsable: "Comando Santa Cruz", estado: "Activo", icono: "user-check" },
      { cargo: "Responsable de Organización", responsable: "Organización Zona Industrial", estado: "Acreditado", icono: "users" }
    ],
    centrosCount: 16,
    electores: 34100
  },
  "la-pica": {
    parroquiaId: "la-pica",
    municipioId: "maturin",
    nombre: "La Pica",
    responsablePrincipal: "Coordinador Parroquial La Pica",
    telefono: "+58 412-4443322",
    rolesClave: [
      { cargo: "Responsable Parroquial", responsable: "Comando La Pica", estado: "Activo", icono: "user-check" },
      { cargo: "Responsable de Organización", responsable: "Organización Rural La Pica", estado: "Acreditado", icono: "users" }
    ],
    centrosCount: 14,
    electores: 21800
  },
  "el-corozo": {
    parroquiaId: "el-corozo",
    municipioId: "maturin",
    nombre: "El Corozo",
    responsablePrincipal: "Coordinador Parroquial El Corozo",
    telefono: "+58 414-5556677",
    rolesClave: [
      { cargo: "Responsable Parroquial", responsable: "Comando El Corozo", estado: "Activo", icono: "user-check" },
      { cargo: "Responsable de Organización", responsable: "Organización El Corozo", estado: "Acreditado", icono: "users" }
    ],
    centrosCount: 8,
    electores: 11400
  },
  "el-furrial": {
    parroquiaId: "el-furrial",
    municipioId: "maturin",
    nombre: "El Furrial",
    responsablePrincipal: "Coordinador Parroquial El Furrial",
    telefono: "+58 424-7778899",
    rolesClave: [
      { cargo: "Responsable Parroquial", responsable: "Comando El Furrial", estado: "Activo", icono: "user-check" },
      { cargo: "Responsable de Organización", responsable: "Organización Furrial", estado: "Acreditado", icono: "users" }
    ],
    centrosCount: 10,
    electores: 15300
  },
  "jusepin": {
    parroquiaId: "jusepin",
    municipioId: "maturin",
    nombre: "Jusepín",
    responsablePrincipal: "Coordinador Parroquial Jusepín",
    telefono: "+58 416-8881122",
    rolesClave: [
      { cargo: "Responsable Parroquial", responsable: "Comando Jusepín", estado: "Activo", icono: "user-check" },
      { cargo: "Responsable de Organización", responsable: "Organización Jusepín", estado: "Acreditado", icono: "users" }
    ],
    centrosCount: 7,
    electores: 10200
  },
  "san-vicente": {
    parroquiaId: "san-vicente",
    municipioId: "maturin",
    nombre: "San Vicente",
    responsablePrincipal: "Coordinador Parroquial San Vicente",
    telefono: "+58 412-9993344",
    rolesClave: [
      { cargo: "Responsable Parroquial", responsable: "Comando San Vicente", estado: "Activo", icono: "user-check" },
      { cargo: "Responsable de Organización", responsable: "Organización San Vicente", estado: "Acreditado", icono: "users" }
    ],
    centrosCount: 9,
    electores: 12800
  }
};

export const COMANDOS_SECTORIALES = {
  // Eje 6 La Puente
  "SUBPAR-1788965549962": {
    ejeId: "SUBPAR-1788965549962",
    parroquiaId: "alto-de-los-godos",
    nombre: "Eje 6 • Circuito Territorial La Puente",
    responsableSectorial: "Responsable Sectorial La Puente",
    cargo: "Jefe de Comando de Eje",
    telefono: "+58 412-8887711",
    centrosAsignados: ["E.B. Paula Bastardo", "C.E.I. La Puente"],
    mesasSupervisadas: 7,
    electoresAprox: 6850,
    sectores: ["La Puente Casco Central", "Rómulo Betancourt", "Viento Colao", "Urb. Las Vírgenes", "El Mangozal"]
  },
  // Eje 1 Los Godos Casco Viejo / Fundemos
  "SUBPAR-1788965549963": {
    ejeId: "SUBPAR-1788965549963",
    parroquiaId: "alto-de-los-godos",
    nombre: "Eje 1 • Los Godos Casco Viejo / Fundemos",
    responsableSectorial: "Responsable Sectorial Los Godos",
    cargo: "Jefe de Comando de Eje",
    telefono: "+58 414-2223311",
    centrosAsignados: ["Liceo Los Godos", "E.B. Fundemos"],
    mesasSupervisadas: 9,
    electoresAprox: 9400,
    sectores: ["Los Godos 1 y 2", "Fundemos", "La Murallita", "Complejo Aramaconi"]
  },
  // Eje 4 Morichal / Los Guaros
  "SUBPAR-1788965549964": {
    ejeId: "SUBPAR-1788965549964",
    parroquiaId: "alto-de-los-godos",
    nombre: "Eje 4 • Morichal / Los Guaros",
    responsableSectorial: "Responsable Sectorial Morichal",
    cargo: "Jefe de Comando de Eje",
    telefono: "+58 424-6665544",
    centrosAsignados: ["E.B. Morichal", "Colegio Los Guaros"],
    mesasSupervisadas: 6,
    electoresAprox: 5900,
    sectores: ["Morichal", "Los Guaros", "El Silencio", "Ambulatorio José María Vargas"]
  }
};

export const STORAGE_KEY_ASIGNADOS = "migato_comandos_asignados";
export const STORAGE_KEY_POOL = "migato_pool_dirigentes_v1";

export function getAssignedComandos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ASIGNADOS);
    return raw ? JSON.parse(raw) : {};
  } catch(e) {
    console.warn("Error leyendo comandos asignados:", e);
    return {};
  }
}

export function getAssignedLeader(ejeOrSectorId) {
  const map = getAssignedComandos();
  return map[ejeOrSectorId] || null;
}

export function getLeaderPool() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_POOL);
    return raw ? JSON.parse(raw) : [];
  } catch(e) {
    console.warn("Error leyendo pool de dirigentes:", e);
    return [];
  }
}

export function upsertDirigenteInPool(dirigente) {
  if (!dirigente || !dirigente.nombre || !dirigente.nombre.trim()) return;
  try {
    const pool = getLeaderPool();
    const cleanNombre = dirigente.nombre.trim();
    const cleanCedula = (dirigente.cedula || "").trim().toUpperCase();

    let index = -1;
    if (cleanCedula) {
      index = pool.findIndex(d => (d.cedula || "").trim().toUpperCase() === cleanCedula);
    }
    if (index === -1) {
      index = pool.findIndex(d => d.nombre.trim().toLowerCase() === cleanNombre.toLowerCase());
    }

    if (index >= 0) {
      pool[index] = {
        ...pool[index],
        nombre: cleanNombre,
        cedula: cleanCedula || pool[index].cedula || "",
        telefono: dirigente.telefono || pool[index].telefono || "",
        cargo: dirigente.cargo || pool[index].cargo || "Jefe de Comando Sectorial",
        profesion: dirigente.profesion || pool[index].profesion || "",
        ultimaActualizacion: new Date().toISOString()
      };
    } else {
      pool.push({
        id: `dir-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        nombre: cleanNombre,
        cedula: cleanCedula,
        telefono: dirigente.telefono || "",
        cargo: dirigente.cargo || "Jefe de Comando Sectorial",
        profesion: dirigente.profesion || "",
        fechaRegistro: new Date().toISOString()
      });
    }
    localStorage.setItem(STORAGE_KEY_POOL, JSON.stringify(pool));
  } catch(e) {
    console.warn("Error actualizando pool de dirigentes:", e);
  }
}

export function saveAssignedComando(id, payload) {
  try {
    const map = getAssignedComandos();
    map[id] = {
      id,
      nombre: payload.nombre || "Responsable Asignado",
      telefono: payload.telefono || "",
      cargo: payload.cargo || "Jefe de Comando Sectorial",
      cedula: payload.cedula || "",
      profesion: payload.profesion || "",
      parroquiaId: payload.parroquiaId || "",
      fechaAsignacion: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY_ASIGNADOS, JSON.stringify(map));

    // Autoguardar en pool de dirigentes
    upsertDirigenteInPool({
      nombre: map[id].nombre,
      telefono: map[id].telefono,
      cargo: map[id].cargo,
      cedula: map[id].cedula,
      profesion: map[id].profesion
    });

    return map[id];
  } catch(e) {
    console.warn("Error guardando comando asignado:", e);
    return null;
  }
}

/**
 * Obtiene la información de comando correspondiente al nivel y entidad activa
 */
export function getComandoInfo(level, entityId, parishId = null, munId = null) {
  if (level === "estado") {
    return {
      nivel: "Comando Regional",
      entidad: "Estado Monagas",
      general: COMANDO_ESTADAL.responsableGeneral,
      division: COMANDO_ESTADAL.division,
      telefono: COMANDO_ESTADAL.telefono,
      roles: COMANDO_ESTADAL.rolesClave,
      subdirectorios: Object.values(COMANDOS_MUNICIPALES).map(m => ({
        id: m.id,
        nombre: m.nombre,
        responsable: m.responsableGeneral,
        tipo: "Municipio",
        parroquias: m.parroquiasCount,
        onClick: `laminaApp.selectMunicipio('${m.id}')`
      }))
    };
  }

  if (level === "municipio") {
    const cleanMunId = String(entityId || munId || "maturin").toLowerCase().replace(/_/g, "-").trim();
    const munComando = COMANDOS_MUNICIPALES[cleanMunId] || {
      id: cleanMunId,
      nombre: `Municipio ${cleanMunId}`,
      responsableGeneral: `Coordinador Municipal ${cleanMunId}`,
      telefono: "+58 412-0000000",
      rolesClave: [
        { cargo: "Coordinador Municipal", responsable: `Comando Municipal ${cleanMunId}`, estado: "Activo", icono: "user-check" },
        { cargo: "Enlace Electoral CNE", responsable: "Auditoría Municipal", estado: "Acreditado", icono: "vote" }
      ],
      parroquiasCount: 1,
      centrosCount: 15
    };

    // Subdirectorio de parroquias para este municipio
    const parroquiasList = Object.values(COMANDOS_PARROQUIALES).filter(p => p.municipioId === cleanMunId || cleanMunId === "maturin");

    return {
      nivel: "Comando Municipal",
      entidad: munComando.nombre,
      general: munComando.responsableGeneral,
      division: "Coordinación Política y Electoral Municipal",
      telefono: munComando.telefono,
      roles: munComando.rolesClave,
      subdirectorios: parroquiasList.map(p => ({
        id: p.parroquiaId,
        nombre: p.nombre,
        responsable: p.responsablePrincipal,
        tipo: "Parroquia",
        centros: p.centrosCount,
        onClick: `laminaApp.selectParroquia('${p.parroquiaId}', '${cleanMunId}')`
      }))
    };
  }

  if (level === "parroquia") {
    const cleanPId = String(entityId || parishId || "alto-de-los-godos").toLowerCase().replace(/_/g, "-").trim();
    const cleanMunId = String(munId || "maturin").toLowerCase().replace(/_/g, "-").trim();
    const parishComando = COMANDOS_PARROQUIALES[cleanPId] || {
      parroquiaId: cleanPId,
      municipioId: cleanMunId,
      nombre: `Parroquia ${cleanPId}`,
      responsablePrincipal: `Responsable Parroquial ${cleanPId}`,
      telefono: "+58 412-0000000",
      rolesClave: [
        { cargo: "Responsable Parroquial", responsable: `Comando ${cleanPId}`, estado: "Activo", icono: "user-check" },
        { cargo: "Responsable de Organización", responsable: "Auditoría CNE", estado: "Acreditado", icono: "vote" }
      ],
      centrosCount: 10
    };

    // Subdirectorio de Comandos Sectoriales / Ejes de esta parroquia
    const ejesList = Object.values(COMANDOS_SECTORIALES).filter(e => e.parroquiaId === cleanPId);

    return {
      nivel: "Comando Parroquial",
      entidad: parishComando.nombre,
      general: parishComando.responsablePrincipal,
      division: "Comando Operativo Parroquial",
      telefono: parishComando.telefono,
      roles: parishComando.rolesClave,
      centros: parishComando.centrosCount,
      subdirectorios: ejesList.map(e => {
        const assigned = getAssignedLeader(e.ejeId);
        return {
          id: e.ejeId,
          nombre: e.nombre,
          responsable: assigned ? assigned.nombre : e.responsableSectorial,
          telefono: assigned ? assigned.telefono : e.telefono,
          cargo: assigned ? assigned.cargo : e.cargo,
          tipo: "Comando Sectorial",
          centros: (e.centrosAsignados || []).length,
          isAssigned: !!assigned,
          onClick: `laminaApp.selectSubParroquia('${e.ejeId}', '${cleanPId}', '${cleanMunId}')`
        };
      })
    };
  }

  if (level === "subparroquia" || level === "sector") {
    const cleanEjeId = String(entityId).trim();
    const cleanPId = String(parishId || "alto-de-los-godos").toLowerCase().replace(/_/g, "-").trim();
    const cleanMunId = String(munId || "maturin").toLowerCase().replace(/_/g, "-").trim();

    const ejeComando = COMANDOS_SECTORIALES[cleanEjeId] || Object.values(COMANDOS_SECTORIALES).find(e => e.nombre.toLowerCase().includes(cleanEjeId.toLowerCase())) || {
      ejeId: cleanEjeId,
      nombre: `Comando Sectorial • ${cleanEjeId}`,
      responsableSectorial: `Responsable de Eje / Sector`,
      cargo: "Jefe de Comando Sectorial",
      telefono: "+58 412-0000000",
      centrosAsignados: ["Centro Principal del Polígono"],
      sectores: ["Sectores Asociados al Circuito"]
    };

    const assigned = getAssignedLeader(cleanEjeId);
    const respNombre = assigned ? assigned.nombre : ejeComando.responsableSectorial;
    const respTel = assigned ? assigned.telefono : ejeComando.telefono;
    const respCargo = assigned ? assigned.cargo : (ejeComando.cargo || "Jefe de Comando Sectorial");
    const respDetalle = assigned ? (assigned.profesion || assigned.cedula || "Acreditado") : (ejeComando.cargo || "Responsable de Polígono");

    return {
      nivel: "Comando Sectorial / Eje Territorial",
      ejeId: cleanEjeId,
      parroquiaId: cleanPId,
      entidad: ejeComando.nombre,
      general: respNombre,
      division: respCargo,
      telefono: respTel,
      detalle: respDetalle,
      isAssigned: !!assigned,
      centrosAsignados: ejeComando.centrosAsignados || [],
      mesas: ejeComando.mesasSupervisadas || 4,
      electores: ejeComando.electoresAprox || 5000,
      sectores: ejeComando.sectores || [],
      roles: [
        { cargo: "Responsable del Eje", responsable: respNombre, estado: "En Campo", icono: "shield" },
        { cargo: "Responsable de Organización", responsable: "Estructura y Organización", estado: "Acreditado", icono: "users" },
        { cargo: "Movilización y Logística", responsable: "Brigada Sectorial", estado: "Activo", icono: "users" }
      ],
      subdirectorios: []
    };
  }

  return null;
}
