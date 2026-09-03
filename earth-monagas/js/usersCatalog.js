/**
 * Catálogo Oficial de Usuarios y Asignación de Jurisdicciones Territoriales
 * Gobernación del Estado Monagas • Plataforma Cartográfica MIGATO
 */

import { CATALOGO_MONAGAS } from "./catalogoMonagas.js";

// Generar usuarios predeterminados para las 44 parroquias + coordinadores + superadmin
function buildInitialUsers() {
  const users = [
    // 1. Super Administrador (MIGATO Central)
    {
      id: "usr-admin",
      username: "admin",
      email: "admin@monagas.gob.ve",
      password: "admin2026*",
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
      password: "monagas2026*",
      nombre: `Coordinación Municipal ${mun.nombre}`,
      rol: "coordinador",
      municipioId: mun.id,
      parroquiaId: null
    });

    // Operadores Parroquiales
    mun.parroquias.forEach(p => {
      const pSlug = p.id.replace(/-/g, "_");
      users.push({
        id: `usr-op-${mun.id}-${p.id}`,
        username: `op_${pSlug}`,
        email: `${p.id}@monagas.gob.ve`,
        password: "parroquia2026*",
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

export function findUserByCredentials(identity, password) {
  if (!identity || !password) return null;
  const cleanId = identity.trim().toLowerCase();
  const cleanPass = password.trim();

  return USERS_CATALOG.find(u => 
    (u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId) &&
    u.password === cleanPass
  ) || null;
}
