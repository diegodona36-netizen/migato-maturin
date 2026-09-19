/**
 * Gestor de Almacenamiento Centralizado • Comandos y Dirigentes Territoriales MIGATO
 * Claves compartidas entre:
 * - /comandos/ (Submódulo de Gestión y Asignación)
 * - /lamina-monagas/ (Lámina Ejecutiva 120" Sala Situacional)
 * - /earth-monagas/ (Mapa Satelital 3D GIS)
 */

export const STORAGE_KEY_ASIGNADOS = "migato_comandos_asignados";
export const STORAGE_KEY_POOL = "migato_pool_dirigentes_v1";

// Dirigentes iniciales precargados de referencia
export const DEFAULT_DIRIGENTES = [
  {
    id: "dir-01",
    nombre: "José Manuel Pérez",
    cedula: "V-19.882.314",
    telefono: "+58 414-7654321",
    cargo: "Jefe de Comando Sectorial",
    profesion: "Ingeniero / Enlace Parroquial",
    notas: "Responsable en Eje La Puente",
    fechaRegistro: "2026-03-01T10:00:00.000Z"
  },
  {
    id: "dir-02",
    nombre: "María Elena Rodríguez",
    cedula: "V-18.452.120",
    telefono: "+58 412-3344556",
    cargo: "Coordinador de Eje",
    profesion: "Docente / Organización",
    notas: "Coordinador Eje Los Godos Casco Viejo",
    fechaRegistro: "2026-03-02T11:30:00.000Z"
  },
  {
    id: "dir-03",
    nombre: "Carlos Eduardo Mendoza",
    cedula: "V-16.321.908",
    telefono: "+58 424-9182736",
    cargo: "Responsable de Organización",
    profesion: "Abogado",
    notas: "Organización y movilización sectorial",
    fechaRegistro: "2026-03-05T09:15:00.000Z"
  }
];

/**
 * Obtiene todas las asignaciones territoriales
 * @returns {Record<string, Object>}
 */
export function getAllAssignments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ASIGNADOS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn("[ComandoStorage] Error leyendo asignaciones:", e);
    return {};
  }
}

/**
 * Obtiene la asignación de un sector o subparroquia específico
 */
export function getAssignment(targetId) {
  const map = getAllAssignments();
  return map[targetId] || null;
}

/**
 * Guarda o actualiza una asignación territorial preservando el cargo institucional del dirigente
 */
export function saveAssignment(targetId, payload) {
  try {
    const map = getAllAssignments();
    const cleanId = String(targetId).trim();

    // Consultar el pool para obtener los datos oficiales del dirigente
    const pool = getLeaderPool();
    const dir = pool.find(d => 
      (payload.id && String(d.id) === String(payload.id)) ||
      (payload.cedula && (d.cedula || "").trim().toUpperCase() === (payload.cedula || "").trim().toUpperCase()) ||
      d.nombre.trim().toLowerCase() === (payload.nombre || "").trim().toLowerCase()
    );

    const cargoOficial = dir?.cargo || payload.cargo || "Jefe de Comando Sectorial";
    const nombreOficial = dir?.nombre || payload.nombre || "Responsable Asignado";
    const cedulaOficial = dir?.cedula || payload.cedula || "";
    const telefonoOficial = dir?.telefono || payload.telefono || "";
    const profesionOficial = dir?.profesion || payload.profesion || "";

    const record = {
      id: cleanId,
      nombre: nombreOficial,
      telefono: telefonoOficial,
      cargo: cargoOficial,
      cedula: cedulaOficial,
      profesion: profesionOficial,
      municipioId: payload.municipioId || "maturin",
      parroquiaId: payload.parroquiaId || "",
      subParroquiaId: payload.subParroquiaId || "",
      targetName: payload.targetName || cleanId,
      targetType: payload.targetType || "sector",
      fechaAsignacion: new Date().toISOString()
    };

    map[cleanId] = record;
    localStorage.setItem(STORAGE_KEY_ASIGNADOS, JSON.stringify(map));

    // Asegurar registro en el pool sin alterar el cargo existente
    upsertDirigente({
      id: dir?.id,
      nombre: nombreOficial,
      cedula: cedulaOficial,
      telefono: telefonoOficial,
      cargo: cargoOficial,
      profesion: profesionOficial
    });

    notifyStorageChange();
    return record;
  } catch (e) {
    console.error("[ComandoStorage] Error guardando asignación:", e);
    return null;
  }
}

/**
 * Asigna en 1 clic un mismo responsable a múltiples sectores simultáneos
 * respetando estrictamente su cargo institucional fijado en el pool.
 */
export function bulkAssign(targetList, leaderPayload) {
  try {
    const map = getAllAssignments();
    const assignedIds = [];

    // Buscar dirigente en el pool para garantizar su rol oficial único
    const pool = getLeaderPool();
    const dir = pool.find(d => 
      (leaderPayload.id && String(d.id) === String(leaderPayload.id)) ||
      (leaderPayload.cedula && (d.cedula || "").trim().toUpperCase() === (leaderPayload.cedula || "").trim().toUpperCase()) ||
      d.nombre.trim().toLowerCase() === (leaderPayload.nombre || "").trim().toLowerCase()
    );

    const cargoOficial = dir?.cargo || leaderPayload.cargo || "Jefe de Comando Sectorial";
    const nombreOficial = dir?.nombre || leaderPayload.nombre || "Responsable Asignado";
    const cedulaOficial = dir?.cedula || leaderPayload.cedula || "";
    const telefonoOficial = dir?.telefono || leaderPayload.telefono || "";
    const profesionOficial = dir?.profesion || leaderPayload.profesion || "";

    // Asegurar sincronización en el pool
    upsertDirigente({
      id: dir?.id,
      nombre: nombreOficial,
      cedula: cedulaOficial,
      telefono: telefonoOficial,
      cargo: cargoOficial,
      profesion: profesionOficial
    });

    targetList.forEach(target => {
      const cleanId = String(target.id || target).trim();
      const record = {
        id: cleanId,
        nombre: nombreOficial,
        telefono: telefonoOficial,
        cargo: cargoOficial,
        cedula: cedulaOficial,
        profesion: profesionOficial,
        municipioId: target.municipioId || leaderPayload.municipioId || "maturin",
        parroquiaId: target.parroquiaId || leaderPayload.parroquiaId || "",
        subParroquiaId: target.subParroquiaId || leaderPayload.subParroquiaId || "",
        targetName: target.nombre || target.targetName || cleanId,
        targetType: target.targetType || "sector",
        fechaAsignacion: new Date().toISOString()
      };
      map[cleanId] = record;
      assignedIds.push(cleanId);
    });

    localStorage.setItem(STORAGE_KEY_ASIGNADOS, JSON.stringify(map));
    notifyStorageChange();
    return assignedIds;
  } catch (e) {
    console.error("[ComandoStorage] Error en asignación masiva:", e);
    return [];
  }
}

/**
 * Elimina una asignación territorial
 */
export function removeAssignment(targetId) {
  try {
    const map = getAllAssignments();
    if (map[targetId]) {
      delete map[targetId];
      localStorage.setItem(STORAGE_KEY_ASIGNADOS, JSON.stringify(map));
      notifyStorageChange();
      return true;
    }
    return false;
  } catch (e) {
    console.error("[ComandoStorage] Error eliminando asignación:", e);
    return false;
  }
}

/**
 * Obtiene la lista completa de dirigentes del pool central
 */
export function getLeaderPool() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_POOL);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_POOL, JSON.stringify(DEFAULT_DIRIGENTES));
      return DEFAULT_DIRIGENTES;
    }
    let list = JSON.parse(raw);
    if (!Array.isArray(list)) return DEFAULT_DIRIGENTES;

    // Sanitizar automáticamente cargos no deseados (comunal, testigo CNE)
    let dirty = false;
    list.forEach(d => {
      if (d.cargo && d.cargo.includes("Comunal")) {
        d.cargo = d.cargo.replace(/Comunal/gi, "").trim();
        dirty = true;
      }
      if (d.cargo && d.cargo.includes("Testigo")) {
        d.cargo = "Responsable de Organización";
        dirty = true;
      }
    });

    if (dirty) {
      localStorage.setItem(STORAGE_KEY_POOL, JSON.stringify(list));
    }

    return list;
  } catch (e) {
    console.warn("[ComandoStorage] Error leyendo pool de dirigentes:", e);
    return DEFAULT_DIRIGENTES;
  }
}

/**
 * Guarda o actualiza un dirigente en el pool central (por nombre o cédula)
 */
export function upsertDirigente(dirigente) {
  if (!dirigente || !dirigente.nombre || !dirigente.nombre.trim()) return null;
  try {
    const pool = getLeaderPool();
    const cleanNombre = dirigente.nombre.trim();
    const cleanCedula = (dirigente.cedula || "").trim().toUpperCase();

    // Buscar si ya existe por cédula o por nombre exacto (case insensitive)
    let index = -1;
    if (cleanCedula) {
      index = pool.findIndex(d => (d.cedula || "").trim().toUpperCase() === cleanCedula);
    }
    if (index === -1) {
      index = pool.findIndex(d => d.nombre.trim().toLowerCase() === cleanNombre.toLowerCase());
    }

    if (index >= 0) {
      // Actualizar datos conservando campos previos si no vienen vacíos
      pool[index] = {
        ...pool[index],
        nombre: cleanNombre,
        cedula: cleanCedula || pool[index].cedula || "",
        telefono: dirigente.telefono || pool[index].telefono || "",
        cargo: dirigente.cargo || pool[index].cargo || "Jefe de Comando Sectorial",
        profesion: dirigente.profesion || pool[index].profesion || "",
        notas: dirigente.notas || pool[index].notas || "",
        ultimaActualizacion: new Date().toISOString()
      };
    } else {
      // Nuevo dirigente
      const newDir = {
        id: `dir-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        nombre: cleanNombre,
        cedula: cleanCedula,
        telefono: dirigente.telefono || "",
        cargo: dirigente.cargo || "Jefe de Comando Sectorial",
        profesion: dirigente.profesion || "",
        notas: dirigente.notas || "",
        fechaRegistro: new Date().toISOString()
      };
      pool.push(newDir);
    }

    localStorage.setItem(STORAGE_KEY_POOL, JSON.stringify(pool));
    return pool[index >= 0 ? index : pool.length - 1];
  } catch (e) {
    console.error("[ComandoStorage] Error guardando dirigente en pool:", e);
    return null;
  }
}

/**
 * Elimina un dirigente del pool central
 */
export function deleteDirigente(dirigenteId) {
  try {
    let pool = getLeaderPool();
    pool = pool.filter(d => String(d.id) !== String(dirigenteId));
    localStorage.setItem(STORAGE_KEY_POOL, JSON.stringify(pool));
    return true;
  } catch (e) {
    console.error("[ComandoStorage] Error eliminando dirigente:", e);
    return false;
  }
}

/**
 * Exporta los datos de comandos y pool a objeto JSON para backup
 */
export function exportAllData() {
  return {
    version: "2026.1",
    fechaExportacion: new Date().toISOString(),
    asignaciones: getAllAssignments(),
    poolDirigentes: getLeaderPool()
  };
}

/**
 * Importa datos desde un objeto JSON
 */
export function importAllData(data) {
  try {
    if (!data || typeof data !== "object") throw new Error("Formato inválido");
    if (data.asignaciones && typeof data.asignaciones === "object") {
      localStorage.setItem(STORAGE_KEY_ASIGNADOS, JSON.stringify(data.asignaciones));
    }
    if (data.poolDirigentes && Array.isArray(data.poolDirigentes)) {
      localStorage.setItem(STORAGE_KEY_POOL, JSON.stringify(data.poolDirigentes));
    }
    notifyStorageChange();
    return true;
  } catch (e) {
    console.error("[ComandoStorage] Error importando datos:", e);
    return false;
  }
}

/**
 * Emite evento de notificación para sincronizar pestañas activas
 */
function notifyStorageChange() {
  try {
    window.dispatchEvent(new CustomEvent("migato:comandos-updated"));
  } catch (e) {}
}
