/**
 * Gestor de Almacenamiento Centralizado • Comandos Dateros MIGATO 2026
 * 
 * Estructura Oficial de la Red Datera de Transmisión:
 * - 1 Central Estatal (Sala Situacional Central Monagas)
 * - 13 Comandos Municipales (13 Municipios)
 * - 44 Dateros Sectoriales / Parroquiales (44 Parroquias Oficiales)
 * 
 * Total: 58 Comandos Dateros
 */

export const STORAGE_KEY_DATEROS = "migato_comandos_dateros_v2";
export const STORAGE_KEY_ASIGNADOS = "migato_comandos_asignados";

/**
 * Catálogo Oficial de las 58 Posiciones de la Red Datera
 */
export const CATALOGO_POSICIONES_DATEROS = [
  // 1. CENTRAL ESTATAL (1)
  {
    id: "central",
    nivel: "central",
    territorio: "Estado Monagas • Sala Central de Mando",
    municipioId: null,
    municipioNombre: "Estado Monagas",
    parroquiaId: null,
    parroquiaNombre: "Comando Central Regional",
    rol: "Jefe Datero Estatal",
    codigo: "MON-CEN",
    color: "#f59e0b"
  },

  // 2. COMANDOS MUNICIPALES (13)
  {
    id: "mun-maturin",
    nivel: "municipal",
    territorio: "Municipio Maturín",
    municipioId: "maturin",
    municipioNombre: "Municipio Maturín",
    parroquiaId: null,
    parroquiaNombre: "Coordinación Municipal",
    rol: "Jefe Datero Municipal",
    codigo: "MUN-MAT",
    color: "#2563eb"
  },
  {
    id: "mun-caripe",
    nivel: "municipal",
    territorio: "Municipio Caripe",
    municipioId: "caripe",
    municipioNombre: "Municipio Caripe",
    parroquiaId: null,
    parroquiaNombre: "Coordinación Municipal",
    rol: "Jefe Datero Municipal",
    codigo: "MUN-CAR",
    color: "#10b981"
  },
  {
    id: "mun-ezequiel-zamora",
    nivel: "municipal",
    territorio: "Municipio Ezequiel Zamora",
    municipioId: "ezequiel-zamora",
    municipioNombre: "Municipio Ezequiel Zamora",
    parroquiaId: null,
    parroquiaNombre: "Coordinación Municipal",
    rol: "Jefe Datero Municipal",
    codigo: "MUN-ZAM",
    color: "#f97316"
  },
  {
    id: "mun-bolivar",
    nivel: "municipal",
    territorio: "Municipio Bolívar (Caripito)",
    municipioId: "bolivar",
    municipioNombre: "Municipio Bolívar",
    parroquiaId: null,
    parroquiaNombre: "Coordinación Municipal",
    rol: "Jefe Datero Municipal",
    codigo: "MUN-BOL",
    color: "#ec4899"
  },
  {
    id: "mun-piar",
    nivel: "municipal",
    territorio: "Municipio Piar",
    municipioId: "piar",
    municipioNombre: "Municipio Piar",
    parroquiaId: null,
    parroquiaNombre: "Coordinación Municipal",
    rol: "Jefe Datero Municipal",
    codigo: "MUN-PIA",
    color: "#8b5cf6"
  },
  {
    id: "mun-cedeno",
    nivel: "municipal",
    territorio: "Municipio Cedeño",
    municipioId: "cedeno",
    municipioNombre: "Municipio Cedeño",
    parroquiaId: null,
    parroquiaNombre: "Coordinación Municipal",
    rol: "Jefe Datero Municipal",
    codigo: "MUN-CED",
    color: "#06b6d4"
  },
  {
    id: "mun-punceres",
    nivel: "municipal",
    territorio: "Municipio Punceres",
    municipioId: "punceres",
    municipioNombre: "Municipio Punceres",
    parroquiaId: null,
    parroquiaNombre: "Coordinación Municipal",
    rol: "Jefe Datero Municipal",
    codigo: "MUN-PUN",
    color: "#14b8a6"
  },
  {
    id: "mun-acosta",
    nivel: "municipal",
    territorio: "Municipio Acosta",
    municipioId: "acosta",
    municipioNombre: "Municipio Acosta",
    parroquiaId: null,
    parroquiaNombre: "Coordinación Municipal",
    rol: "Jefe Datero Municipal",
    codigo: "MUN-ACO",
    color: "#84cc16"
  },
  {
    id: "mun-aguasay",
    nivel: "municipal",
    territorio: "Municipio Aguasay",
    municipioId: "aguasay",
    municipioNombre: "Municipio Aguasay",
    parroquiaId: null,
    parroquiaNombre: "Coordinación Municipal",
    rol: "Jefe Datero Municipal",
    codigo: "MUN-AGU",
    color: "#eab308"
  },
  {
    id: "mun-santa-barbara",
    nivel: "municipal",
    territorio: "Municipio Santa Bárbara",
    municipioId: "santa-barbara",
    municipioNombre: "Municipio Santa Bárbara",
    parroquiaId: null,
    parroquiaNombre: "Coordinación Municipal",
    rol: "Jefe Datero Municipal",
    codigo: "MUN-SBA",
    color: "#6366f1"
  },
  {
    id: "mun-uracoa",
    nivel: "municipal",
    territorio: "Municipio Uracoa",
    municipioId: "uracoa",
    municipioNombre: "Municipio Uracoa",
    parroquiaId: null,
    parroquiaNombre: "Coordinación Municipal",
    rol: "Jefe Datero Municipal",
    codigo: "MUN-URA",
    color: "#a855f7"
  },
  {
    id: "mun-libertador",
    nivel: "municipal",
    territorio: "Municipio Libertador (Temblador)",
    municipioId: "libertador",
    municipioNombre: "Municipio Libertador",
    parroquiaId: null,
    parroquiaNombre: "Coordinación Municipal",
    rol: "Jefe Datero Municipal",
    codigo: "MUN-LIB",
    color: "#d946ef"
  },
  {
    id: "mun-sotillo",
    nivel: "municipal",
    territorio: "Municipio Sotillo (Barrancas)",
    municipioId: "sotillo",
    municipioNombre: "Municipio Sotillo",
    parroquiaId: null,
    parroquiaNombre: "Coordinación Municipal",
    rol: "Jefe Datero Municipal",
    codigo: "MUN-SOT",
    color: "#f43f5e"
  },

  // 3. DATEROS SECTORIALES / PARROQUIALES (44)
  // --- Maturín (11) ---
  {
    id: "parr-san-simon",
    nivel: "sectorial",
    territorio: "Parroquia San Simón (Casco Central)",
    municipioId: "maturin",
    municipioNombre: "Maturín",
    parroquiaId: "san-simon",
    parroquiaNombre: "San Simón (Casco Central)",
    rol: "Datero Sectorial",
    codigo: "MAT-SIM"
  },
  {
    id: "parr-alto-de-los-godos",
    nivel: "sectorial",
    territorio: "Parroquia Alto de Los Godos",
    municipioId: "maturin",
    municipioNombre: "Maturín",
    parroquiaId: "alto-de-los-godos",
    parroquiaNombre: "Alto de Los Godos",
    rol: "Datero Sectorial",
    codigo: "MAT-GOD"
  },
  {
    id: "parr-boqueron",
    nivel: "sectorial",
    territorio: "Parroquia Boquerón",
    municipioId: "maturin",
    municipioNombre: "Maturín",
    parroquiaId: "boqueron",
    parroquiaNombre: "Boquerón",
    rol: "Datero Sectorial",
    codigo: "MAT-BOQ"
  },
  {
    id: "parr-las-cocuizas",
    nivel: "sectorial",
    territorio: "Parroquia Las Cocuizas",
    municipioId: "maturin",
    municipioNombre: "Maturín",
    parroquiaId: "las-cocuizas",
    parroquiaNombre: "Las Cocuizas",
    rol: "Datero Sectorial",
    codigo: "MAT-COC"
  },
  {
    id: "parr-santa-cruz",
    nivel: "sectorial",
    territorio: "Parroquia Santa Cruz (La Cruz)",
    municipioId: "maturin",
    municipioNombre: "Maturín",
    parroquiaId: "santa-cruz",
    parroquiaNombre: "Santa Cruz (La Cruz)",
    rol: "Datero Sectorial",
    codigo: "MAT-STC"
  },
  {
    id: "parr-san-vicente",
    nivel: "sectorial",
    territorio: "Parroquia San Vicente",
    municipioId: "maturin",
    municipioNombre: "Maturín",
    parroquiaId: "san-vicente",
    parroquiaNombre: "San Vicente",
    rol: "Datero Sectorial",
    codigo: "MAT-VIC"
  },
  {
    id: "parr-la-pica",
    nivel: "sectorial",
    territorio: "Parroquia La Pica",
    municipioId: "maturin",
    municipioNombre: "Maturín",
    parroquiaId: "la-pica",
    parroquiaNombre: "La Pica",
    rol: "Datero Sectorial",
    codigo: "MAT-PIC"
  },
  {
    id: "parr-jusepin",
    nivel: "sectorial",
    territorio: "Parroquia Jusepín",
    municipioId: "maturin",
    municipioNombre: "Maturín",
    parroquiaId: "jusepin",
    parroquiaNombre: "Jusepín",
    rol: "Datero Sectorial",
    codigo: "MAT-JUS"
  },
  {
    id: "parr-el-furrial",
    nivel: "sectorial",
    territorio: "Parroquia El Furrial",
    municipioId: "maturin",
    municipioNombre: "Maturín",
    parroquiaId: "el-furrial",
    parroquiaNombre: "El Furrial",
    rol: "Datero Sectorial",
    codigo: "MAT-FUR"
  },
  {
    id: "parr-el-corozo",
    nivel: "sectorial",
    territorio: "Parroquia El Corozo",
    municipioId: "maturin",
    municipioNombre: "Maturín",
    parroquiaId: "el-corozo",
    parroquiaNombre: "El Corozo",
    rol: "Datero Sectorial",
    codigo: "MAT-COR"
  },
  {
    id: "parr-san-simon-sur",
    nivel: "sectorial",
    territorio: "Parroquia San Simón Sur / Rural",
    municipioId: "maturin",
    municipioNombre: "Maturín",
    parroquiaId: "san-simon-sur",
    parroquiaNombre: "San Simón Sur / Rural",
    rol: "Datero Sectorial",
    codigo: "MAT-SUR"
  },

  // --- Piar (7) ---
  {
    id: "parr-aragua",
    nivel: "sectorial",
    territorio: "Parroquia Aragua de Maturín",
    municipioId: "piar",
    municipioNombre: "Piar",
    parroquiaId: "aragua",
    parroquiaNombre: "Aragua de Maturín",
    rol: "Datero Sectorial",
    codigo: "PIA-ARA"
  },
  {
    id: "parr-aparicio",
    nivel: "sectorial",
    territorio: "Parroquia Aparicio",
    municipioId: "piar",
    municipioNombre: "Piar",
    parroquiaId: "aparicio",
    parroquiaNombre: "Aparicio",
    rol: "Datero Sectorial",
    codigo: "PIA-APA"
  },
  {
    id: "parr-chaguaramal",
    nivel: "sectorial",
    territorio: "Parroquia Chaguaramal",
    municipioId: "piar",
    municipioNombre: "Piar",
    parroquiaId: "chaguaramal",
    parroquiaNombre: "Chaguaramal",
    rol: "Datero Sectorial",
    codigo: "PIA-CHG"
  },
  {
    id: "parr-el-pinto",
    nivel: "sectorial",
    territorio: "Parroquia El Pinto",
    municipioId: "piar",
    municipioNombre: "Piar",
    parroquiaId: "el-pinto",
    parroquiaNombre: "El Pinto",
    rol: "Datero Sectorial",
    codigo: "PIA-PIN"
  },
  {
    id: "parr-guanaguana",
    nivel: "sectorial",
    territorio: "Parroquia Guanaguana",
    municipioId: "piar",
    municipioNombre: "Piar",
    parroquiaId: "guanaguana",
    parroquiaNombre: "Guanaguana",
    rol: "Datero Sectorial",
    codigo: "PIA-GUA"
  },
  {
    id: "parr-la-toscana",
    nivel: "sectorial",
    territorio: "Parroquia La Toscana",
    municipioId: "piar",
    municipioNombre: "Piar",
    parroquiaId: "la-toscana",
    parroquiaNombre: "La Toscana",
    rol: "Datero Sectorial",
    codigo: "PIA-TOS"
  },
  {
    id: "parr-taguaya",
    nivel: "sectorial",
    territorio: "Parroquia Taguaya",
    municipioId: "piar",
    municipioNombre: "Piar",
    parroquiaId: "taguaya",
    parroquiaNombre: "Taguaya",
    rol: "Datero Sectorial",
    codigo: "PIA-TAG"
  },

  // --- Caripe (6) ---
  {
    id: "parr-caripe-centro",
    nivel: "sectorial",
    territorio: "Parroquia Caripe Centro",
    municipioId: "caripe",
    municipioNombre: "Caripe",
    parroquiaId: "caripe-centro",
    parroquiaNombre: "Caripe Centro",
    rol: "Datero Sectorial",
    codigo: "CAR-CEN"
  },
  {
    id: "parr-el-guacharo",
    nivel: "sectorial",
    territorio: "Parroquia El Guácharo",
    municipioId: "caripe",
    municipioNombre: "Caripe",
    parroquiaId: "el-guacharo",
    parroquiaNombre: "El Guácharo",
    rol: "Datero Sectorial",
    codigo: "CAR-GUA"
  },
  {
    id: "parr-la-guanota",
    nivel: "sectorial",
    territorio: "Parroquia La Guanota",
    municipioId: "caripe",
    municipioNombre: "Caripe",
    parroquiaId: "la-guanota",
    parroquiaNombre: "La Guanota",
    rol: "Datero Sectorial",
    codigo: "CAR-GNT"
  },
  {
    id: "parr-sabana-de-piedra",
    nivel: "sectorial",
    territorio: "Parroquia Sabana de Piedra",
    municipioId: "caripe",
    municipioNombre: "Caripe",
    parroquiaId: "sabana-de-piedra",
    parroquiaNombre: "Sabana de Piedra",
    rol: "Datero Sectorial",
    codigo: "CAR-SAB"
  },
  {
    id: "parr-san-agustin",
    nivel: "sectorial",
    territorio: "Parroquia San Agustín",
    municipioId: "caripe",
    municipioNombre: "Caripe",
    parroquiaId: "san-agustin",
    parroquiaNombre: "San Agustín",
    rol: "Datero Sectorial",
    codigo: "CAR-SAG"
  },
  {
    id: "parr-teresen",
    nivel: "sectorial",
    territorio: "Parroquia Teresén",
    municipioId: "caripe",
    municipioNombre: "Caripe",
    parroquiaId: "teresen",
    parroquiaNombre: "Teresén",
    rol: "Datero Sectorial",
    codigo: "CAR-TER"
  },

  // --- Cedeño (4) ---
  {
    id: "parr-caicara",
    nivel: "sectorial",
    territorio: "Parroquia Caicara de Maturín",
    municipioId: "cedeno",
    municipioNombre: "Cedeño",
    parroquiaId: "caicara",
    parroquiaNombre: "Caicara",
    rol: "Datero Sectorial",
    codigo: "CED-CAI"
  },
  {
    id: "parr-areo",
    nivel: "sectorial",
    territorio: "Parroquia Areo",
    municipioId: "cedeno",
    municipioNombre: "Cedeño",
    parroquiaId: "areo",
    parroquiaNombre: "Areo",
    rol: "Datero Sectorial",
    codigo: "CED-ARE"
  },
  {
    id: "parr-san-felix",
    nivel: "sectorial",
    territorio: "Parroquia San Félix de Cantalicio",
    municipioId: "cedeno",
    municipioNombre: "Cedeño",
    parroquiaId: "san-felix",
    parroquiaNombre: "San Félix de Cantalicio",
    rol: "Datero Sectorial",
    codigo: "CED-SFX"
  },
  {
    id: "parr-viento-fresco",
    nivel: "sectorial",
    territorio: "Parroquia Viento Fresco",
    municipioId: "cedeno",
    municipioNombre: "Cedeño",
    parroquiaId: "viento-fresco",
    parroquiaNombre: "Viento Fresco",
    rol: "Datero Sectorial",
    codigo: "CED-VFR"
  },

  // --- Libertador (4) ---
  {
    id: "parr-temblador",
    nivel: "sectorial",
    territorio: "Parroquia Temblador",
    municipioId: "libertador",
    municipioNombre: "Libertador",
    parroquiaId: "temblador",
    parroquiaNombre: "Temblador",
    rol: "Datero Sectorial",
    codigo: "LIB-TEM"
  },
  {
    id: "parr-chaguaramas",
    nivel: "sectorial",
    territorio: "Parroquia Chaguaramas",
    municipioId: "libertador",
    municipioNombre: "Libertador",
    parroquiaId: "chaguaramas",
    parroquiaNombre: "Chaguaramas",
    rol: "Datero Sectorial",
    codigo: "LIB-CHG"
  },
  {
    id: "parr-las-alhuacas",
    nivel: "sectorial",
    territorio: "Parroquia Las Alhuacas",
    municipioId: "libertador",
    municipioNombre: "Libertador",
    parroquiaId: "las-alhuacas",
    parroquiaNombre: "Las Alhuacas",
    rol: "Datero Sectorial",
    codigo: "LIB-ALH"
  },
  {
    id: "parr-tabasca",
    nivel: "sectorial",
    territorio: "Parroquia Tabasca",
    municipioId: "libertador",
    municipioNombre: "Libertador",
    parroquiaId: "tabasca",
    parroquiaNombre: "Tabasca",
    rol: "Datero Sectorial",
    codigo: "LIB-TAB"
  },

  // --- Ezequiel Zamora (2) ---
  {
    id: "parr-punta-de-mata",
    nivel: "sectorial",
    territorio: "Parroquia Punta de Mata",
    municipioId: "ezequiel-zamora",
    municipioNombre: "Ezequiel Zamora",
    parroquiaId: "punta-de-mata",
    parroquiaNombre: "Punta de Mata",
    rol: "Datero Sectorial",
    codigo: "ZAM-PUN"
  },
  {
    id: "parr-el-tejero",
    nivel: "sectorial",
    territorio: "Parroquia El Tejero",
    municipioId: "ezequiel-zamora",
    municipioNombre: "Ezequiel Zamora",
    parroquiaId: "el-tejero",
    parroquiaNombre: "El Tejero",
    rol: "Datero Sectorial",
    codigo: "ZAM-TEJ"
  },

  // --- Acosta (2) ---
  {
    id: "parr-san-antonio",
    nivel: "sectorial",
    territorio: "Parroquia San Antonio de Capayacuar",
    municipioId: "acosta",
    municipioNombre: "Acosta",
    parroquiaId: "san-antonio",
    parroquiaNombre: "San Antonio",
    rol: "Datero Sectorial",
    codigo: "ACO-ANT"
  },
  {
    id: "parr-san-francisco",
    nivel: "sectorial",
    territorio: "Parroquia San Francisco de Maturín",
    municipioId: "acosta",
    municipioNombre: "Acosta",
    parroquiaId: "san-francisco",
    parroquiaNombre: "San Francisco",
    rol: "Datero Sectorial",
    codigo: "ACO-SFC"
  },

  // --- Punceres (2) ---
  {
    id: "parr-quiriquire",
    nivel: "sectorial",
    territorio: "Parroquia Quiriquire",
    municipioId: "punceres",
    municipioNombre: "Punceres",
    parroquiaId: "quiriquire",
    parroquiaNombre: "Quiriquire",
    rol: "Datero Sectorial",
    codigo: "PUN-QUI"
  },
  {
    id: "parr-cachipo",
    nivel: "sectorial",
    territorio: "Parroquia Cachipo",
    municipioId: "punceres",
    municipioNombre: "Punceres",
    parroquiaId: "cachipo",
    parroquiaNombre: "Cachipo",
    rol: "Datero Sectorial",
    codigo: "PUN-CAC"
  },

  // --- Santa Bárbara (1) ---
  {
    id: "parr-santa-barbara-centro",
    nivel: "sectorial",
    territorio: "Parroquia Santa Bárbara",
    municipioId: "santa-barbara",
    municipioNombre: "Santa Bárbara",
    parroquiaId: "santa-barbara-centro",
    parroquiaNombre: "Santa Bárbara",
    rol: "Datero Sectorial",
    codigo: "SBA-CEN"
  },

  // --- Sotillo (2) ---
  {
    id: "parr-barrancas",
    nivel: "sectorial",
    territorio: "Parroquia Barrancas del Orinoco",
    municipioId: "sotillo",
    municipioNombre: "Sotillo",
    parroquiaId: "barrancas",
    parroquiaNombre: "Barrancas del Orinoco",
    rol: "Datero Sectorial",
    codigo: "SOT-BAR"
  },
  {
    id: "parr-los-barrancos",
    nivel: "sectorial",
    territorio: "Parroquia Los Barrancos de Fajardo",
    municipioId: "sotillo",
    municipioNombre: "Sotillo",
    parroquiaId: "los-barrancos",
    parroquiaNombre: "Los Barrancos de Fajardo",
    rol: "Datero Sectorial",
    codigo: "SOT-FAJ"
  },

  // --- Bolívar (1) ---
  {
    id: "parr-caripito",
    nivel: "sectorial",
    territorio: "Parroquia Caripito",
    municipioId: "bolivar",
    municipioNombre: "Bolívar",
    parroquiaId: "caripito",
    parroquiaNombre: "Caripito",
    rol: "Datero Sectorial",
    codigo: "BOL-CAR"
  },

  // --- Aguasay (1) ---
  {
    id: "parr-aguasay-centro",
    nivel: "sectorial",
    territorio: "Parroquia Aguasay",
    municipioId: "aguasay",
    municipioNombre: "Aguasay",
    parroquiaId: "aguasay-centro",
    parroquiaNombre: "Aguasay",
    rol: "Datero Sectorial",
    codigo: "AGU-CEN"
  },

  // --- Uracoa (1) ---
  {
    id: "parr-uracoa-centro",
    nivel: "sectorial",
    territorio: "Parroquia Uracoa",
    municipioId: "uracoa",
    municipioNombre: "Uracoa",
    parroquiaId: "uracoa-centro",
    parroquiaNombre: "Uracoa",
    rol: "Datero Sectorial",
    codigo: "URA-CEN"
  }
];

/**
 * Obtiene el mapa completo de asignaciones guardadas en localStorage
 * @returns {Record<string, Object>}
 */
export function getStoredDaterosMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DATEROS);
    if (raw) return JSON.parse(raw);

    // Migración o precarga inicial si existe STORAGE_KEY_ASIGNADOS
    const oldRaw = localStorage.getItem(STORAGE_KEY_ASIGNADOS);
    const oldMap = oldRaw ? JSON.parse(oldRaw) : {};
    
    // Semilla inicial predeterminada
    const seed = {
      "central": {
        nombre: "Ing. Diego Donado",
        cedula: "V-19.882.314",
        telefono: "+58 412-0000000",
        rol: "Jefe Datero Estatal",
        dispositivo: "Servidor / Terminal Sala Situacional",
        notas: "Coordinador General de Sala de Datos y Transmisión",
        fechaAsignacion: new Date().toISOString()
      },
      "mun-maturin": {
        nombre: "Coordinación Datera Maturín",
        cedula: "V-18.452.120",
        telefono: "+58 414-7654321",
        rol: "Jefe Datero Municipal",
        dispositivo: "Digitel 4G / Android",
        notas: "Centro de Cómputo Municipal",
        fechaAsignacion: new Date().toISOString()
      },
      "parr-alto-de-los-godos": {
        nombre: "José Manuel Pérez",
        cedula: "V-19.882.314",
        telefono: "+58 414-7654321",
        rol: "Datero Sectorial",
        dispositivo: "Movistar LTE / Smartphone",
        notas: "Transmisión Parroquia Los Godos",
        fechaAsignacion: new Date().toISOString()
      },
      "parr-san-simon": {
        nombre: "Carlos Eduardo Mendoza",
        cedula: "V-16.321.908",
        telefono: "+58 424-9182736",
        rol: "Datero Sectorial",
        dispositivo: "Digitel LTE / Smartphone",
        notas: "Transmisión Casco Central San Simón",
        fechaAsignacion: new Date().toISOString()
      }
    };

    localStorage.setItem(STORAGE_KEY_DATEROS, JSON.stringify(seed));
    return seed;
  } catch (e) {
    console.warn("[ComandoStorage] Error leyendo dateros:", e);
    return {};
  }
}

/**
 * Obtiene la lista completa combinada de las 58 posiciones con su asignación
 * @returns {Array<Object>}
 */
export function getAllComandosDateros() {
  const map = getStoredDaterosMap();
  return CATALOGO_POSICIONES_DATEROS.map(pos => {
    const assigned = map[pos.id];
    if (assigned && assigned.nombre) {
      return {
        ...pos,
        asignado: true,
        nombre: assigned.nombre,
        cedula: assigned.cedula || "",
        telefono: assigned.telefono || "",
        rolAsignado: assigned.rol || pos.rol,
        dispositivo: assigned.dispositivo || "",
        notas: assigned.notas || "",
        fechaAsignacion: assigned.fechaAsignacion || ""
      };
    } else {
      return {
        ...pos,
        asignado: false,
        nombre: "",
        cedula: "",
        telefono: "",
        rolAsignado: pos.rol,
        dispositivo: "",
        notas: "",
        fechaAsignacion: ""
      };
    }
  });
}

/**
 * Guarda o actualiza un Comando Datero
 */
export function saveComandoDatero(positionId, data) {
  try {
    const map = getStoredDaterosMap();
    const pos = CATALOGO_POSICIONES_DATEROS.find(p => p.id === positionId);
    if (!pos) {
      console.error(`Posición desconocida: ${positionId}`);
      return false;
    }

    const payload = {
      id: positionId,
      nombre: (data.nombre || "").trim(),
      cedula: (data.cedula || "").trim().toUpperCase(),
      telefono: (data.telefono || "").trim(),
      rol: data.rol || pos.rol,
      dispositivo: (data.dispositivo || "").trim(),
      notas: (data.notas || "").trim(),
      fechaAsignacion: new Date().toISOString(),
      territorio: pos.territorio,
      nivel: pos.nivel
    };

    map[positionId] = payload;
    localStorage.setItem(STORAGE_KEY_DATEROS, JSON.stringify(map));

    // Sincronizar en espejo con STORAGE_KEY_ASIGNADOS para que Lámina 120" y Satélite 3D lo lean directamente
    try {
      const oldRaw = localStorage.getItem(STORAGE_KEY_ASIGNADOS);
      const oldMap = oldRaw ? JSON.parse(oldRaw) : {};
      
      // Guardar con claves canónicas
      oldMap[positionId] = payload;
      if (pos.municipioId && pos.nivel === "municipal") {
        oldMap[pos.municipioId] = payload;
      }
      if (pos.parroquiaId && pos.nivel === "sectorial") {
        oldMap[pos.parroquiaId] = payload;
      }

      localStorage.setItem(STORAGE_KEY_ASIGNADOS, JSON.stringify(oldMap));
    } catch (eSync) {}

    return true;
  } catch (e) {
    console.error("[ComandoStorage] Error guardando datero:", e);
    return false;
  }
}

/**
 * Elimina una asignación dejando la posición vacante
 */
export function removeComandoDatero(positionId) {
  try {
    const map = getStoredDaterosMap();
    if (map[positionId]) {
      delete map[positionId];
      localStorage.setItem(STORAGE_KEY_DATEROS, JSON.stringify(map));
    }

    // Limpiar también en STORAGE_KEY_ASIGNADOS
    try {
      const pos = CATALOGO_POSICIONES_DATEROS.find(p => p.id === positionId);
      const oldRaw = localStorage.getItem(STORAGE_KEY_ASIGNADOS);
      const oldMap = oldRaw ? JSON.parse(oldRaw) : {};
      delete oldMap[positionId];
      if (pos?.municipioId && pos?.nivel === "municipal") delete oldMap[pos.municipioId];
      if (pos?.parroquiaId && pos?.nivel === "sectorial") delete oldMap[pos.parroquiaId];
      localStorage.setItem(STORAGE_KEY_ASIGNADOS, JSON.stringify(oldMap));
    } catch (eSync) {}

    return true;
  } catch (e) {
    console.error("[ComandoStorage] Error eliminando datero:", e);
    return false;
  }
}

/**
 * Estadísticas de cobertura de la red datera
 */
export function getComandosDaterosStats() {
  const dateros = getAllComandosDateros();
  const central = dateros.filter(d => d.nivel === "central");
  const municipales = dateros.filter(d => d.nivel === "municipal");
  const sectoriales = dateros.filter(d => d.nivel === "sectorial");

  const centralAsignados = central.filter(d => d.asignado).length;
  const munAsignados = municipales.filter(d => d.asignado).length;
  const secAsignados = sectoriales.filter(d => d.asignado).length;
  const totalAsignados = centralAsignados + munAsignados + secAsignados;

  return {
    total: dateros.length, // 58
    totalAsignados,
    porcentaje: Math.round((totalAsignados / dateros.length) * 100),
    central: {
      total: central.length, // 1
      asignados: centralAsignados,
      vacantes: central.length - centralAsignados
    },
    municipales: {
      total: municipales.length, // 13
      asignados: munAsignados,
      vacantes: municipales.length - munAsignados
    },
    sectoriales: {
      total: sectoriales.length, // 44
      asignados: secAsignados,
      vacantes: sectoriales.length - secAsignados
    }
  };
}

/**
 * Exportar a CSV para Excel
 */
export function exportDaterosCSV() {
  const dateros = getAllComandosDateros();
  const headers = ["Nivel", "Territorio / Jurisdiccion", "Municipio", "Parroquia", "Rol Datero", "Estado", "Datero Asignado", "Cedula", "Telefono", "Dispositivo", "Notas", "Fecha Asignacion"];
  
  const rows = dateros.map(d => [
    `"${d.nivel.toUpperCase()}"`,
    `"${d.territorio.replace(/"/g, '""')}"`,
    `"${d.municipioNombre || ''}"`,
    `"${d.parroquiaNombre || ''}"`,
    `"${d.rolAsignado || d.rol}"`,
    `"${d.asignado ? 'Asignado' : 'Vacante'}"`,
    `"${(d.nombre || '').replace(/"/g, '""')}"`,
    `"${d.cedula || ''}"`,
    `"${d.telefono || ''}"`,
    `"${(d.dispositivo || '').replace(/"/g, '""')}"`,
    `"${(d.notas || '').replace(/"/g, '""')}"`,
    `"${d.fechaAsignacion || ''}"`
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `MIGATO_Comandos_Dateros_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Exportar Respaldo JSON Completo
 */
export function exportDaterosJSON() {
  const map = getStoredDaterosMap();
  const blob = new Blob([JSON.stringify(map, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `MIGATO_Backup_Comandos_Dateros_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Importar Respaldo JSON
 */
export function importDaterosJSON(jsonText) {
  try {
    const data = JSON.parse(jsonText);
    if (typeof data !== "object" || data === null) {
      throw new Error("Formato inválido");
    }
    localStorage.setItem(STORAGE_KEY_DATEROS, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("Error importando JSON:", e);
    return false;
  }
}
