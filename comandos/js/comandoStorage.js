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
    cargo: "Coordinadora de Eje Comunal",
    profesion: "Docente / Organización",
    notas: "Coordinadora Eje Los Godos Casco Viejo",
    fechaRegistro: "2026-03-02T11:30:00.000Z"
  },
  {
    id: "dir-03",
    nombre: "Carlos Eduardo Mendoza",
    cedula: "V-16.321.908",
    telefono: "+58 424-9182736",
    cargo: "Testigo Principal CNE",
    profesion: "Abogado / Auditor Electoral",
    notas: "Auditoría de testigos parroquiales",
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
 * Guarda o actualiza una asignación territorial y auto-guarda el dirigente en el pool
 */
export function saveAssignment(targetId, payload) {
  try {
    const map = getAllAssignments();
    const cleanId = String(targetId).trim();

    const record = {
      id: cleanId,
      nombre: payload.nombre || "Responsable Asignado",
      telefono: payload.telefono || "",
      cargo: payload.cargo || "Jefe de Comando Sectorial",
      cedula: payload.cedula || "",
      profesion: payload.profesion || "",
      municipioId: payload.municipioId || "maturin",
      parroquiaId: payload.parroquiaId || "",
      subParroquiaId: payload.subParroquiaId || "",
      targetName: payload.targetName || cleanId,
      targetType: payload.targetType || "sector",
      fechaAsignacion: new Date().toISOString()
    };

    map[cleanId] = record;
    localStorage.setItem(STORAGE_KEY_ASIGNADOS, JSON.stringify(map));

    // Autoguardar dirigente en el pool central
    upsertDirigente({
      nombre: record.nombre,
      cedula: record.cedula,
      telefono: record.telefono,
      cargo: record.cargo,
      profesion: record.profesion
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
 */
export function bulkAssign(targetList, leaderPayload) {
  try {
    const map = getAllAssignments();
    const assignedIds = [];

    // Primero registrar o actualizar dirigente en el pool
    upsertDirigente({
      nombre: leaderPayload.nombre,
      cedula: leaderPayload.cedula,
      telefono: leaderPayload.telefono,
      cargo: leaderPayload.cargo,
      profesion: leaderPayload.profesion
    });

    targetList.forEach(target => {
      const cleanId = String(target.id || target).trim();
      const record = {
        id: cleanId,
        nombre: leaderPayload.nombre || "Responsable Asignado",
        telefono: leaderPayload.telefono || "",
        cargo: leaderPayload.cargo || "Jefe de Comando Sectorial",
        cedula: leaderPayload.cedula || "",
        profesion: leaderPayload.profesion || "",
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
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : DEFAULT_DIRIGENTES;
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
