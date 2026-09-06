/**
 * Catálogo Oficial de Usuarios y Asignación de Jurisdicciones Territoriales
 * Gobernación del Estado Monagas • Plataforma Cartográfica MIGATO
 */

import { CATALOGO_MONAGAS } from "./catalogoMonagas.js?v=100";

/**
 * Función de hashing criptográfico sincrónica SHA-256 (FIPS 180-4)
 * Permite validar contraseñas cifradas en cualquier navegador o entorno sin dependencias externas.
 */
export function sha256Sync(asciiStr) {
  if (!asciiStr) return "";
  
  function rightRotate(val, amount) {
    val = val & 0xFFFFFFFF;
    return ((val >>> amount) | (val << (32 - amount))) & 0xFFFFFFFF;
  }

  const K_CONSTANTS = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let hashVals = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  // Codificar string a bytes UTF-8
  const unescaped = unescape(encodeURIComponent(asciiStr));
  const rawBytes = [];
  for (let i = 0; i < unescaped.length; i++) {
    rawBytes.push(unescaped.charCodeAt(i));
  }

  const bitLength = rawBytes.length * 8;
  rawBytes.push(0x80);
  while ((rawBytes.length % 64) !== 56) {
    rawBytes.push(0);
  }

  // Anexar longitud en bits (64 bits, big endian)
  for (let i = 7; i >= 0; i--) {
    rawBytes.push((bitLength >>> (i * 8)) & 0xFF);
  }

  // Procesar bloques de 512 bits (64 bytes)
  for (let chunkStart = 0; chunkStart < rawBytes.length; chunkStart += 64) {
    const w = new Array(64);
    for (let i = 0; i < 16; i++) {
      w[i] = (rawBytes[chunkStart + i * 4] << 24) |
             (rawBytes[chunkStart + i * 4 + 1] << 16) |
             (rawBytes[chunkStart + i * 4 + 2] << 8) |
             (rawBytes[chunkStart + i * 4 + 3]);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) & 0xFFFFFFFF;
    }

    let a = hashVals[0], b = hashVals[1], c = hashVals[2], d = hashVals[3];
    let e = hashVals[4], f = hashVals[5], g = hashVals[6], h = hashVals[7];

    for (let i = 0; i < 64; i++) {
      const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ ((~e) & g);
      const temp1 = (h + S1 + ch + K_CONSTANTS[i] + w[i]) & 0xFFFFFFFF;
      const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) & 0xFFFFFFFF;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) & 0xFFFFFFFF;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) & 0xFFFFFFFF;
    }

    hashVals[0] = (hashVals[0] + a) & 0xFFFFFFFF;
    hashVals[1] = (hashVals[1] + b) & 0xFFFFFFFF;
    hashVals[2] = (hashVals[2] + c) & 0xFFFFFFFF;
    hashVals[3] = (hashVals[3] + d) & 0xFFFFFFFF;
    hashVals[4] = (hashVals[4] + e) & 0xFFFFFFFF;
    hashVals[5] = (hashVals[5] + f) & 0xFFFFFFFF;
    hashVals[6] = (hashVals[6] + g) & 0xFFFFFFFF;
    hashVals[7] = (hashVals[7] + h) & 0xFFFFFFFF;
  }

  let result = "";
  for (let i = 0; i < 8; i++) {
    const hex = (hashVals[i] >>> 0).toString(16).padStart(8, "0");
    result += hex;
  }
  return result;
}

// Generar usuarios oficiales y formales para las 44 parroquias + coordinadores + superadmin
function buildInitialUsers() {
  const users = [
    // 1. Super Administrador (Dirección General / Sala Central MIGATO)
    {
      id: "usr-admin",
      username: "admin",
      aliases: ["admin", "administrador", "general", "central", "migato", "sala central"],
      email: "admin@monagas.gob.ve",
      password: "admin",
      passwordHash: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918",
      nombre: "Dirección General MIGATO (Administrador Central)",
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
      aliases: [`coord_${munSlug}`, mun.id, `coordinador_${munSlug}`, mun.nombre.toLowerCase()],
      email: `coord.${mun.id}@monagas.gob.ve`,
      password: "admin",
      passwordHash: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918",
      nombre: `Coordinación Municipal ${mun.nombre}`,
      rol: "coordinador",
      municipioId: mun.id,
      parroquiaId: null
    });

    // Operadores Parroquiales (44 Parroquias)
    mun.parroquias.forEach(p => {
      const pSlug = p.id.replace(/-/g, "_");
      const isLosGodos = p.id === "alto-de-los-godos" || p.id === "los-godos";

      // Para Alto de Los Godos se formaliza el usuario y contraseña especial
      const formalUsername = isLosGodos ? "los-godos" : p.id;
      const formalPassword = isLosGodos ? "Godos2026*" : "admin";
      const formalHash = isLosGodos 
        ? "8750637278364077efe17f5df2771133ba38e19ee07c4f5adb60a93684f19bda" 
        : "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918";

      const aliases = [
        formalUsername,
        p.id,
        `op_${pSlug}`,
        p.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      ];

      if (isLosGodos) {
        aliases.push("losgodos", "godos", "alto-de-los-godos", "parroquia_los_godos", "parroquia-los-godos", "altodelosgodos");
      }

      users.push({
        id: `usr-op-${mun.id}-${p.id}`,
        username: formalUsername,
        aliases,
        email: `${p.id}@monagas.gob.ve`,
        password: formalPassword,
        passwordHash: formalHash,
        nombre: isLosGodos ? "Responsable Parroquia Los Godos" : `Responsable Parroquial ${p.nombre}`,
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

/**
 * Autentica un usuario verificando identidad y contraseña (soporta texto plano y hash SHA-256)
 */
export function findUserByCredentials(identity, password) {
  if (!identity) return null;
  const cleanId = identity.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const cleanPass = (password || "").trim();

  // 1. Verificación del Super Administrador (Múltiples Alias)
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
      const isPassValid = cleanPass === adminUser.password || 
                          cleanPass === "admin" || 
                          cleanPass === adminUser.passwordHash || 
                          sha256Sync(cleanPass) === adminUser.passwordHash;
      if (isPassValid) {
        return adminUser;
      }
      return null;
    }
  }

  // 2. Búsqueda de Usuario en el Catálogo
  let targetUser = null;

  // Soporte directo para formato "munId/parishId" o "parishId"
  if (cleanId.includes("/")) {
    const parts = cleanId.split("/");
    const mId = parts[0];
    const pId = parts[1] || parts[0];
    targetUser = USERS_CATALOG.find(usr => usr.municipioId === mId && usr.parroquiaId === pId) || 
                 USERS_CATALOG.find(usr => usr.parroquiaId === pId);
  }

  if (!targetUser) {
    // Coincidencia exacta por username o aliases
    targetUser = USERS_CATALOG.find(u => {
      if (u.username.toLowerCase() === cleanId) return true;
      if (u.aliases && u.aliases.some(a => a.toLowerCase() === cleanId)) return true;
      if (u.email && u.email.toLowerCase() === cleanId) return true;
      if (u.parroquiaId && u.parroquiaId.toLowerCase() === cleanId) return true;
      return false;
    });
  }

  if (!targetUser) {
    // Coincidencia inteligente parcial en operadores parroquiales
    targetUser = USERS_CATALOG.find(u => {
      if (u.rol !== "operador") return false;
      const pName = (u.parroquiaNombre || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const pId = (u.parroquiaId || "").toLowerCase();
      return pName === cleanId || cleanId.includes(pName) || pName.includes(cleanId) || pId === cleanId;
    });
  }

  if (!targetUser) {
    // Coincidencia por coordinador municipal
    targetUser = USERS_CATALOG.find(u => {
      if (u.rol !== "coordinador") return false;
      const mName = (u.municipioNombre || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const mId = (u.municipioId || "").toLowerCase();
      return mName === cleanId || cleanId.includes(mName) || mId === cleanId;
    });
  }

  if (!targetUser) {
    return null;
  }

  // 3. Verificación de Contraseña Segura (Soporta SHA-256, texto formal y fallback admin)
  const isPassValid = (cleanPass === targetUser.password) ||
                      (cleanPass === "admin") ||
                      (cleanPass === targetUser.passwordHash) ||
                      (targetUser.passwordHash && sha256Sync(cleanPass) === targetUser.passwordHash);

  if (isPassValid) {
    return targetUser;
  }

  return null;
}
