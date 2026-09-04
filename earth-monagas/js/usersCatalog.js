/**
 * Catálogo Oficial de Usuarios y Asignación de Jurisdicciones Territoriales
 * Gobernación del Estado Monagas • Plataforma Cartográfica MIGATO
 */

import { CATALOGO_MONAGAS } from "./catalogoMonagas.js?v=43";

// Generar usuarios predeterminados para las 44 parroquias + coordinadores + superadmin
function buildInitialUsers() {
  const users = [
    // 1. Super Administrador (MIGATO Central)
    {
      id: "usr-admin",
      username: "admin",
      email: "admin@monagas.gob.ve",
      password: "admin",
      nombre: "Sala Central MIGATO",
      rol: "admin", // Acceso total a los 13 municipios y 44 parroquias
      municipioId: null,
      parroquiaId: null
    }
  ];

  // 2. Coordinadores Municipales (13 Municipios) y Operadores Parroquiales (44 Parroquias)
  CATALOGO_MONAGAS.forEach(mun => {
    // Coordinador del Municipio
    const munSlug = mun.id.replace(/-/g, "_");
    users.push({
      id: `usr-coord-${mun.id}`,
      username: `coord_${munSlug}`,
      email: `coord.${mun.id}@monagas.gob.ve`,
      password: "admin",
      nombre: `Coordinación Municipal ${mun.nombre}`,
      rol: "coordinador",
      municipioId: mun.id,
      parroquiaId: null
    });

    // Operadores Parroquiales (44 Parroquias)
    mun.parroquias.forEach(p => {
      const pSlug = p.id.replace(/-/g, "_");
      users.push({
        id: `usr-op-${mun.id}-${p.id}`,
        username: `op_${pSlug}`,
        email: `${p.id}@monagas.gob.ve`,
        password: "admin",
        nombre: `Responsable Parroquial ${p.nombre}`,
        rol: "operador",
        municipioId: mun.id,
        parroquiaId: p.id,
        parroquiaNombre: p.nombre,
        municipioNombre: mun.nombre
      });
    });
  });

  return users;
}

export const USERS_CATALOG = buildInitialUsers();

export function getAllParishesForSelector() {
  const result = [];
  CATALOGO_MONAGAS.forEach(mun => {
    mun.parroquias.forEach(p => {
      result.push({
        munId: mun.id,
        munNombre: mun.nombre,
        parishId: p.id,
        parishNombre: p.nombre,
        label: `${p.nombre} (${mun.nombre})`
      });
    });
  });
  return result;
}

export function findUserByCredentials(identity, password) {
  if (!identity) return null;
  const cleanId = identity.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const cleanPass = (password || "").trim();

  // Alias conocidos para el Super Administrador / Usuario General
  const adminAliases = [
    "admin",
    "general",
    "usuario general",
    "usuario_general",
    "usuariogeneral",
    "central",
    "sala central",
    "salacentral",
    "migato",
    "superadmin",
    "administrador",
    "admin@monagas.gob.ve",
    "general@monagas.gob.ve"
  ];

  if (adminAliases.includes(cleanId)) {
    const adminUser = USERS_CATALOG.find(u => u.rol === "admin");
    if (adminUser) {
      return adminUser;
    }
  }

  // 1. Coincidencia exacta o directa con parroquia o municipio
  for (const u of USERS_CATALOG) {
    const uName = u.username.toLowerCase();
    const uEmail = u.email.toLowerCase();
    const pName = (u.parroquiaNombre || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const pId = (u.parroquiaId || "").toLowerCase();
    const pIdSlug = pId.replace(/-/g, "_");
    const munName = (u.municipioNombre || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const munId = (u.municipioId || "").toLowerCase();

    const matchesExact = (
      uName === cleanId ||
      uEmail === cleanId ||
      cleanId === pName ||
      cleanId === pId ||
      cleanId === pIdSlug ||
      cleanId === `op_${pId}` ||
      cleanId === `op_${pIdSlug}` ||
      cleanId === munName ||
      cleanId === munId ||
      cleanId === `coord_${munId}`
    );

    if (matchesExact) {
      return u;
    }
  }

  // 2. Coincidencia parcial inteligente (Ej: "jusepin", "corozo", "godos", "simon")
  for (const u of USERS_CATALOG) {
    if (u.rol !== "operador") continue;
    const pName = (u.parroquiaNombre || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const pId = (u.parroquiaId || "").toLowerCase();
    if (pName.includes(cleanId) || cleanId.includes(pName) || pId.includes(cleanId)) {
      return u;
    }
  }

  // 3. Coincidencia parcial por municipio (coordinador)
  for (const u of USERS_CATALOG) {
    if (u.rol !== "coordinador") continue;
    const munName = (u.municipioNombre || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const munId = (u.municipioId || "").toLowerCase();
    if (munName.includes(cleanId) || cleanId.includes(munName) || munId.includes(cleanId)) {
      return u;
    }
  }

  return null;
}
