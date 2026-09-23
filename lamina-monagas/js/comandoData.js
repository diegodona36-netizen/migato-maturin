/**
 * Directorio y Estructura de Comandos Gateros MIGATO • Monagas
 * 
 * Jerarquía Operativa Multinivel Oficial:
 * 1. Comando Gatero Regional (Estado Monagas • Sala Central de Mando)
 * 2. Comandos Gateros Municipales (13 Municipios)
 * 3. Comandos Gateros Parroquiales (44 Parroquias Oficiales)
 * 
 * Sincronización bidireccional directa con /comandos/ (STORAGE_KEY_GATEROS: migato_comandos_gateros_v2)
 */

import { CATALOGO_MONAGAS } from "../../earth-monagas/js/catalogoMonagas.js?v=230";

export const STORAGE_KEY_GATEROS = "migato_comandos_gateros_v2";
export const STORAGE_KEY_ASIGNADOS = "migato_comandos_asignados";
export const STORAGE_KEY_POOL = "migato_pool_dirigentes_v1";

export const COMANDO_ESTADAL = {
  entidad: "Estado Monagas",
  nivel: "Comando Gatero Regional",
  responsableGeneral: "Sala Situacional Central de Mando",
  cargo: "Jefe Gatero Estatal",
  division: "Red Central de Transmisión Gatera",
  telefono: "+58 412-0000000",
  rolesClave: []
};

export const COMANDOS_MUNICIPALES = {
  "maturin": {
    id: "maturin",
    nombre: "Municipio Maturín",
    cargo: "Jefe Gatero Municipal",
    responsableGeneral: "⚪ Vacante / Sin Asignar",
    telefono: "",
    parroquiasCount: 11,
    centrosCount: 175,
    electores: 346988,
    rolesClave: []
  },
  "caripe": {
    id: "caripe",
    nombre: "Municipio Caripe",
    cargo: "Jefe Gatero Municipal",
    responsableGeneral: "⚪ Vacante / Sin Asignar",
    telefono: "",
    parroquiasCount: 6,
    centrosCount: 38,
    electores: 27000,
    rolesClave: []
  },
  "ezequiel-zamora": {
    id: "ezequiel-zamora",
    nombre: "Municipio Ezequiel Zamora",
    cargo: "Jefe Gatero Municipal",
    responsableGeneral: "⚪ Vacante / Sin Asignar",
    telefono: "",
    parroquiasCount: 2,
    centrosCount: 42,
    electores: 48000,
    rolesClave: []
  },
  "bolivar": {
    id: "bolivar",
    nombre: "Municipio Bolívar",
    cargo: "Jefe Gatero Municipal",
    responsableGeneral: "⚪ Vacante / Sin Asignar",
    telefono: "",
    parroquiasCount: 1,
    centrosCount: 35,
    electores: 34000,
    rolesClave: []
  },
  "piar": {
    id: "piar",
    nombre: "Municipio Piar",
    cargo: "Jefe Gatero Municipal",
    responsableGeneral: "⚪ Vacante / Sin Asignar",
    telefono: "",
    parroquiasCount: 7,
    centrosCount: 44,
    electores: 39000,
    rolesClave: []
  },
  "cedeno": {
    id: "cedeno",
    nombre: "Municipio Cedeño",
    cargo: "Jefe Gatero Municipal",
    responsableGeneral: "⚪ Vacante / Sin Asignar",
    telefono: "",
    parroquiasCount: 4,
    centrosCount: 32,
    electores: 29000,
    rolesClave: []
  },
  "punceres": {
    id: "punceres",
    nombre: "Municipio Punceres",
    cargo: "Jefe Gatero Municipal",
    responsableGeneral: "⚪ Vacante / Sin Asignar",
    telefono: "",
    parroquiasCount: 2,
    centrosCount: 22,
    electores: 23000,
    rolesClave: []
  },
  "acosta": {
    id: "acosta",
    nombre: "Municipio Acosta",
    cargo: "Jefe Gatero Municipal",
    responsableGeneral: "⚪ Vacante / Sin Asignar",
    telefono: "",
    parroquiasCount: 2,
    centrosCount: 25,
    electores: 18500,
    rolesClave: []
  },
  "aguasay": {
    id: "aguasay",
    nombre: "Municipio Aguasay",
    cargo: "Jefe Gatero Municipal",
    responsableGeneral: "⚪ Vacante / Sin Asignar",
    telefono: "",
    parroquiasCount: 1,
    centrosCount: 14,
    electores: 12500,
    rolesClave: []
  },
  "santa-barbara": {
    id: "santa-barbara",
    nombre: "Municipio Santa Bárbara",
    cargo: "Jefe Gatero Municipal",
    responsableGeneral: "⚪ Vacante / Sin Asignar",
    telefono: "",
    parroquiasCount: 1,
    centrosCount: 12,
    electores: 9800,
    rolesClave: []
  },
  "uracoa": {
    id: "uracoa",
    nombre: "Municipio Uracoa",
    cargo: "Jefe Gatero Municipal",
    responsableGeneral: "⚪ Vacante / Sin Asignar",
    telefono: "",
    parroquiasCount: 1,
    centrosCount: 11,
    electores: 8700,
    rolesClave: []
  },
  "libertador": {
    id: "libertador",
    nombre: "Municipio Libertador",
    cargo: "Jefe Gatero Municipal",
    responsableGeneral: "⚪ Vacante / Sin Asignar",
    telefono: "",
    parroquiasCount: 4,
    centrosCount: 30,
    electores: 36000,
    rolesClave: []
  },
  "sotillo": {
    id: "sotillo",
    nombre: "Municipio Sotillo",
    cargo: "Jefe Gatero Municipal",
    responsableGeneral: "⚪ Vacante / Sin Asignar",
    telefono: "",
    parroquiasCount: 2,
    centrosCount: 26,
    electores: 25500,
    rolesClave: []
  }
};

export const COMANDOS_PARROQUIALES = {
  "alto-de-los-godos": {
    parroquiaId: "alto-de-los-godos",
    municipioId: "maturin",
    nombre: "Alto de Los Godos",
    cargo: "Gatero Parroquial",
    responsablePrincipal: "⚪ Vacante / Sin Asignar",
    telefono: "",
    centrosCount: 40,
    electores: 80630,
    rolesClave: []
  },
  "san-simon": {
    parroquiaId: "san-simon",
    municipioId: "maturin",
    nombre: "San Simón (Casco Central)",
    cargo: "Gatero Parroquial",
    responsablePrincipal: "⚪ Vacante / Sin Asignar",
    telefono: "",
    centrosCount: 45,
    electores: 92400,
    rolesClave: []
  },
  "boqueron": {
    parroquiaId: "boqueron",
    municipioId: "maturin",
    nombre: "Boquerón",
    cargo: "Gatero Parroquial",
    responsablePrincipal: "⚪ Vacante / Sin Asignar",
    telefono: "",
    centrosCount: 28,
    electores: 61200,
    rolesClave: []
  },
  "las-cocuizas": {
    parroquiaId: "las-cocuizas",
    municipioId: "maturin",
    nombre: "Las Cocuizas",
    cargo: "Gatero Parroquial",
    responsablePrincipal: "⚪ Vacante / Sin Asignar",
    telefono: "",
    centrosCount: 32,
    electores: 68500,
    rolesClave: []
  },
  "santa-cruz": {
    parroquiaId: "santa-cruz",
    municipioId: "maturin",
    nombre: "Santa Cruz",
    cargo: "Gatero Parroquial",
    responsablePrincipal: "⚪ Vacante / Sin Asignar",
    telefono: "",
    centrosCount: 16,
    electores: 34100,
    rolesClave: []
  },
  "la-pica": {
    parroquiaId: "la-pica",
    municipioId: "maturin",
    nombre: "La Pica",
    cargo: "Gatero Parroquial",
    responsablePrincipal: "⚪ Vacante / Sin Asignar",
    telefono: "",
    centrosCount: 14,
    electores: 21800,
    rolesClave: []
  },
  "el-corozo": {
    parroquiaId: "el-corozo",
    municipioId: "maturin",
    nombre: "El Corozo",
    cargo: "Gatero Parroquial",
    responsablePrincipal: "⚪ Vacante / Sin Asignar",
    telefono: "",
    centrosCount: 8,
    electores: 11400,
    rolesClave: []
  },
  "el-furrial": {
    parroquiaId: "el-furrial",
    municipioId: "maturin",
    nombre: "El Furrial",
    cargo: "Gatero Parroquial",
    responsablePrincipal: "⚪ Vacante / Sin Asignar",
    telefono: "",
    centrosCount: 10,
    electores: 15300,
    rolesClave: []
  },
  "jusepin": {
    parroquiaId: "jusepin",
    municipioId: "maturin",
    nombre: "Jusepín",
    cargo: "Gatero Parroquial",
    responsablePrincipal: "⚪ Vacante / Sin Asignar",
    telefono: "",
    centrosCount: 7,
    electores: 10200,
    rolesClave: []
  },
  "san-simon-sur": {
    parroquiaId: "san-simon-sur",
    municipioId: "maturin",
    nombre: "San Simón Sur",
    cargo: "Gatero Parroquial",
    responsablePrincipal: "⚪ Vacante / Sin Asignar",
    telefono: "",
    centrosCount: 8,
    electores: 9800,
    rolesClave: []
  },
  "san-vicente": {
    parroquiaId: "san-vicente",
    municipioId: "maturin",
    nombre: "San Vicente",
    cargo: "Gatero Parroquial",
    responsablePrincipal: "⚪ Vacante / Sin Asignar",
    telefono: "",
    centrosCount: 9,
    electores: 12800,
    rolesClave: []
  }
};

export const COMANDOS_SECTORIALES = {
  "SUBPAR-1788965549962": {
    ejeId: "SUBPAR-1788965549962",
    parroquiaId: "alto-de-los-godos",
    nombre: "Eje 6 • Circuito Territorial La Puente",
    responsableSectorial: "⚪ Vacante / Sin Asignar",
    cargo: "Gatero Sectorial",
    telefono: "",
    centrosAsignados: ["E.B. Paula Bastardo", "C.E.I. La Puente"],
    mesasSupervisadas: 7,
    electoresAprox: 6850,
    sectores: ["La Puente Casco Central", "Rómulo Betancourt", "Viento Colao", "Urb. Las Vírgenes", "El Mangozal"]
  },
  "SUBPAR-1788965549963": {
    ejeId: "SUBPAR-1788965549963",
    parroquiaId: "alto-de-los-godos",
    nombre: "Eje 1 • Los Godos Casco Viejo / Fundemos",
    responsableSectorial: "⚪ Vacante / Sin Asignar",
    cargo: "Gatero Sectorial",
    telefono: "",
    centrosAsignados: ["Liceo Los Godos", "E.B. Fundemos"],
    mesasSupervisadas: 9,
    electoresAprox: 9400,
    sectores: ["Los Godos 1 y 2", "Fundemos", "La Murallita", "Complejo Aramaconi"]
  },
  "SUBPAR-1788965549964": {
    ejeId: "SUBPAR-1788965549964",
    parroquiaId: "alto-de-los-godos",
    nombre: "Eje 4 • Morichal / Los Guaros",
    responsableSectorial: "⚪ Vacante / Sin Asignar",
    cargo: "Gatero Sectorial",
    telefono: "",
    centrosAsignados: ["E.B. Morichal", "Colegio Los Guaros"],
    mesasSupervisadas: 6,
    electoresAprox: 5900,
    sectores: ["Morichal", "Los Guaros", "El Silencio", "Ambulatorio José María Vargas"]
  }
};

/**
 * Obtiene el dirigente asignado a un territorio consultando ambas claves de almacenamiento
 */
export function getAssignedLeader(id) {
  if (!id) return null;
  const cleanId = String(id).toLowerCase().replace(/_/g, "-").trim();

  // 1. Probar en migato_comandos_gateros_v2 (formato oficial de /comandos/)
  try {
    const rawG = localStorage.getItem(STORAGE_KEY_GATEROS);
    if (rawG) {
      const mapG = JSON.parse(rawG);
      if (cleanId === "estado" || cleanId === "regional" || cleanId === "central") {
        if (mapG["central"] && mapG["central"].nombre) return mapG["central"];
      }
      if (mapG[cleanId] && mapG[cleanId].nombre) return mapG[cleanId];
      if (mapG[`mun-${cleanId}`] && mapG[`mun-${cleanId}`].nombre) return mapG[`mun-${cleanId}`];
      if (mapG[`parr-${cleanId}`] && mapG[`parr-${cleanId}`].nombre) return mapG[`parr-${cleanId}`];
      if (mapG[`par-${cleanId}`] && mapG[`par-${cleanId}`].nombre) return mapG[`par-${cleanId}`];
    }
  } catch (e) {}

  // 2. Probar en migato_comandos_asignados
  try {
    const rawA = localStorage.getItem(STORAGE_KEY_ASIGNADOS);
    if (rawA) {
      const mapA = JSON.parse(rawA);
      if (cleanId === "estado" || cleanId === "regional" || cleanId === "central") {
        if (mapA["central"] && mapA["central"].nombre) return mapA["central"];
      }
      if (mapA[cleanId] && mapA[cleanId].nombre) return mapA[cleanId];
      if (mapA[`mun-${cleanId}`] && mapA[`mun-${cleanId}`].nombre) return mapA[`mun-${cleanId}`];
      if (mapA[`parr-${cleanId}`] && mapA[`parr-${cleanId}`].nombre) return mapA[`parr-${cleanId}`];
    }
  } catch (e) {}

  return null;
}

export function getAssignedComandos() {
  try {
    const rawA = localStorage.getItem(STORAGE_KEY_ASIGNADOS);
    const mapA = rawA ? JSON.parse(rawA) : {};
    const rawG = localStorage.getItem(STORAGE_KEY_GATEROS);
    const mapG = rawG ? JSON.parse(rawG) : {};
    return Object.assign({}, mapA, mapG);
  } catch(e) {
    return {};
  }
}

export function getLeaderPool() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_POOL);
    return raw ? JSON.parse(raw) : [];
  } catch(e) {
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
        cargo: dirigente.cargo || pool[index].cargo || "Comando Gatero",
        profesion: dirigente.profesion || pool[index].profesion || "",
        ultimaActualizacion: new Date().toISOString()
      };
    } else {
      pool.push({
        id: `dir-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        nombre: cleanNombre,
        cedula: cleanCedula,
        telefono: dirigente.telefono || "",
        cargo: dirigente.cargo || "Comando Gatero",
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
  if (!id || !payload) return null;
  const cleanId = String(id).toLowerCase().replace(/_/g, "-").trim();

  const record = {
    id: cleanId,
    nombre: (payload.nombre || "").trim(),
    cedula: (payload.cedula || "").trim().toUpperCase(),
    telefono: (payload.telefono || "").trim(),
    cargo: payload.cargo || payload.rol || "Comando Gatero",
    rol: payload.cargo || payload.rol || "Comando Gatero",
    profesion: (payload.profesion || "").trim(),
    dispositivo: (payload.dispositivo || "").trim(),
    notas: (payload.notas || "").trim(),
    parroquiaId: payload.parroquiaId || "",
    municipioId: payload.municipioId || "",
    fechaAsignacion: new Date().toISOString()
  };

  // 1. Guardar en STORAGE_KEY_GATEROS ("migato_comandos_gateros_v2")
  try {
    const rawG = localStorage.getItem(STORAGE_KEY_GATEROS);
    const mapG = rawG ? JSON.parse(rawG) : {};
    mapG[cleanId] = record;
    if (cleanId === "central" || cleanId === "estado") mapG["central"] = record;
    if (!cleanId.startsWith("mun-") && (payload.cargo?.includes("Municipal") || payload.nivel === "municipal")) {
      mapG[`mun-${cleanId}`] = record;
    }
    if (!cleanId.startsWith("parr-") && (payload.cargo?.includes("Parroquial") || payload.nivel === "sectorial")) {
      mapG[`parr-${cleanId}`] = record;
    }
    localStorage.setItem(STORAGE_KEY_GATEROS, JSON.stringify(mapG));
  } catch (e) {}

  // 2. Guardar en STORAGE_KEY_ASIGNADOS
  try {
    const rawA = localStorage.getItem(STORAGE_KEY_ASIGNADOS);
    const mapA = rawA ? JSON.parse(rawA) : {};
    mapA[cleanId] = record;
    if (cleanId === "central" || cleanId === "estado") mapA["central"] = record;
    localStorage.setItem(STORAGE_KEY_ASIGNADOS, JSON.stringify(mapA));
  } catch (e) {}

  // 3. Autoguardar en pool de dirigentes
  if (record.nombre) {
    upsertDirigenteInPool(record);
  }

  return record;
}

/**
 * Obtiene la información oficial de Comandos Gateros correspondiente al nivel y entidad activa
 */
export function getComandoInfo(level, entityId, parishId = null, munId = null) {
  // NIVEL 1: ESTADO MONAGAS (SALA CENTRAL DE MANDO GATERO)
  if (level === "estado") {
    const centralLeader = getAssignedLeader("central") || getAssignedLeader("estado");
    const generalNombre = centralLeader?.nombre || COMANDO_ESTADAL.responsableGeneral;
    const generalTelf = centralLeader?.telefono || COMANDO_ESTADAL.telefono;

    const subdirectorios = Object.values(COMANDOS_MUNICIPALES).map(m => {
      const assigned = getAssignedLeader(m.id);
      return {
        id: m.id,
        nombre: m.nombre,
        cargo: "Jefe Gatero Municipal",
        responsable: assigned?.nombre || "⚪ Vacante / Sin Asignar",
        telefono: assigned?.telefono || "",
        isAssigned: Boolean(assigned?.nombre && !assigned.nombre.includes("Vacante")),
        tipo: "Comando Gatero Municipal",
        parroquias: m.parroquiasCount,
        centros: m.centrosCount,
        onClick: `laminaApp.selectMunicipio('${m.id}')`
      };
    });

    return {
      nivel: "Comando Gatero Regional",
      entidad: "Estado Monagas",
      cargo: "Jefe Gatero Estatal",
      general: generalNombre,
      division: "Red Central de Transmisión Gatera",
      telefono: generalTelf,
      roles: [], // Cero roles burocráticos ficticios
      subdirectorios
    };
  }

  // NIVEL 2: COMANDO MUNICIPAL GATERO
  if (level === "municipio") {
    const cleanMunId = String(entityId || munId || "maturin").toLowerCase().replace(/_/g, "-").trim();
    const munObj = (CATALOGO_MONAGAS || []).find(m => m.id === cleanMunId);
    const munComando = COMANDOS_MUNICIPALES[cleanMunId] || {
      id: cleanMunId,
      nombre: munObj?.nombre || `Municipio ${cleanMunId}`,
      cargo: "Jefe Gatero Municipal",
      parroquiasCount: (munObj?.parroquias || []).length || 1,
      centrosCount: 15
    };

    const munLeader = getAssignedLeader(cleanMunId);
    const generalNombre = munLeader?.nombre || "⚪ Vacante / Sin Asignar";
    const generalTelf = munLeader?.telefono || "";

    // Parroquias bajo este municipio desde CATALOGO_MONAGAS
    const parroquiasRaw = munObj?.parroquias || [];
    const subdirectorios = parroquiasRaw.map(p => {
      const cleanPId = p.id.toLowerCase().replace(/_/g, "-").trim();
      const pLeader = getAssignedLeader(cleanPId);
      return {
        id: cleanPId,
        nombre: p.nombre,
        cargo: "Gatero Parroquial",
        responsable: pLeader?.nombre || "⚪ Vacante / Sin Asignar",
        telefono: pLeader?.telefono || "",
        isAssigned: Boolean(pLeader?.nombre && !pLeader.nombre.includes("Vacante")),
        tipo: "Comando Gatero Parroquial",
        centros: (p.sectores || []).length || 5,
        onClick: `laminaApp.selectParroquia('${cleanPId}', '${cleanMunId}')`
      };
    });

    return {
      nivel: "Comando Gatero Municipal",
      entidad: munComando.nombre,
      cargo: "Jefe Gatero Municipal",
      general: generalNombre,
      division: `Comando Gatero Municipal • ${munComando.nombre}`,
      telefono: generalTelf || "Sin teléfono registrado",
      roles: [],
      subdirectorios
    };
  }

  // NIVEL 3: COMANDO PARROQUIAL GATERO
  if (level === "parroquia") {
    const cleanPId = String(entityId || parishId || "alto-de-los-godos").toLowerCase().replace(/_/g, "-").trim();
    const cleanMunId = String(munId || "maturin").toLowerCase().replace(/_/g, "-").trim();
    
    let parishName = `Parroquia ${cleanPId}`;
    let munName = `Municipio ${cleanMunId}`;
    const munObj = (CATALOGO_MONAGAS || []).find(m => m.id === cleanMunId);
    if (munObj) {
      munName = munObj.nombre;
      const pObj = (munObj.parroquias || []).find(p => p.id === cleanPId);
      if (pObj) parishName = pObj.nombre;
    }

    const parishLeader = getAssignedLeader(cleanPId);
    const generalNombre = parishLeader?.nombre || "⚪ Vacante / Sin Asignar";
    const generalTelf = parishLeader?.telefono || "";

    const ejesList = Object.values(COMANDOS_SECTORIALES).filter(e => e.parroquiaId === cleanPId);

    return {
      nivel: "Comando Gatero Parroquial",
      entidad: parishName,
      cargo: "Gatero Parroquial",
      general: generalNombre,
      division: `Comando Gatero Parroquial • ${munName}`,
      telefono: generalTelf || "Sin teléfono registrado",
      roles: [],
      centros: (COMANDOS_PARROQUIALES[cleanPId]?.centrosCount) || 12,
      subdirectorios: ejesList.map(e => ({
        id: e.ejeId,
        nombre: e.nombre,
        cargo: "Gatero Sectorial",
        responsable: getAssignedLeader(e.ejeId)?.nombre || "⚪ Vacante / Sin Asignar",
        telefono: getAssignedLeader(e.ejeId)?.telefono || "",
        tipo: "Circuito Electoral CNE",
        centros: (e.centrosAsignados || []).length,
        isAssigned: Boolean(getAssignedLeader(e.ejeId)?.nombre),
        onClick: `laminaApp.selectSubParroquia('${e.ejeId}', '${cleanPId}', '${cleanMunId}')`
      }))
    };
  }

  // NIVEL 4: SUBPARROQUIA / CIRCUITO O SECTOR
  if (level === "subparroquia" || level === "sector") {
    const cleanEjeId = String(entityId).trim();
    const cleanPId = String(parishId || "alto-de-los-godos").toLowerCase().replace(/_/g, "-").trim();
    const cleanMunId = String(munId || "maturin").toLowerCase().replace(/_/g, "-").trim();

    const ejeComando = COMANDOS_SECTORIALES[cleanEjeId] || {
      ejeId: cleanEjeId,
      nombre: `Circuito Electoral • ${cleanEjeId}`,
      centrosAsignados: ["Centro Principal CNE"],
      sectores: ["Sectores Asociados"]
    };

    const sectorLeader = getAssignedLeader(cleanEjeId) || getAssignedLeader(cleanPId);

    return {
      nivel: "Circuito Electoral • Jurisdicción Parroquial",
      ejeId: cleanEjeId,
      parroquiaId: cleanPId,
      entidad: ejeComando.nombre,
      cargo: "Gatero Sectorial",
      general: sectorLeader?.nombre || "⚪ Vacante / Sin Asignar",
      division: `Supervisión Gatera Parroquial • ${cleanPId}`,
      telefono: sectorLeader?.telefono || "Sin teléfono registrado",
      detalle: "Red de Comandos Gateros MIGATO",
      isAssigned: Boolean(sectorLeader?.nombre),
      centrosAsignados: ejeComando.centrosAsignados || [],
      mesas: ejeComando.mesasSupervisadas || 4,
      electores: ejeComando.electoresAprox || 5000,
      sectores: ejeComando.sectores || [],
      roles: [],
      subdirectorios: []
    };
  }

  return null;
}
