/**
 * MIGATO - Motor de Auditoría Territorial y Control de Ingesta del Bot de WhatsApp
 * Gestiona el ciclo de vida de las planillas (Pendiente -> Certificado / Rechazado),
 * persistencia local, verificación territorial, validación de centros CNE y cotejo de padrón.
 */

const MIGATO_AUDIT = (function() {
  const STORAGE_REPORTS_KEY = "migato_audit_reports_v5";
  const STORAGE_WHITELIST_KEY = "migato_audit_whitelist_v1";

  // Catálogo Territorial Canónico de Parroquias y Ejes de Monagas
  const PARROQUIAS_CATALOG = {
    "alto-de-los-godos": {
      nombre: "Alto de Los Godos",
      mun: "Maturín",
      subparroquias: [
        "Sub-Parroquia 1 • Casco Los Godos",
        "Sub-Parroquia 2 • Morichal",
        "Sub-Parroquia 3 • Fundemos",
        "Sub-Parroquia 4 • Los Guaros",
        "Sub-Parroquia 5 • El Silencio",
        "Sub-Parroquia 6 • La Puente (Eje Central)",
        "Sub-Parroquia 7 • Rómulo Betancourt",
        "Sub-Parroquia 8 • Las Brisas / Alberto Ravell",
        "Sub-Parroquia 9 • San Rafael",
        "Sub-Parroquia 10 • Paramaconi"
      ]
    },
    "boqueron": {
      nombre: "Boquerón",
      mun: "Maturín",
      subparroquias: [
        "Eje 1 • Boquerón Centro",
        "Eje 2 • Costo Arriba",
        "Eje 3 • Tipuro / Palma Real",
        "Eje 4 • Doña Menca",
        "Eje 5 • El Rincón"
      ]
    },
    "san-simon": {
      nombre: "San Simón",
      mun: "Maturín",
      subparroquias: [
        "Eje 1 • Casco Histórico y Comercial",
        "Eje 2 • Barrio Obrero / Junín",
        "Eje 3 • El Paraíso / Brisas del Orinoco",
        "Eje 4 • Los Bloques"
      ]
    },
    "las-cocuizas": {
      nombre: "Las Cocuizas",
      mun: "Maturín",
      subparroquias: ["Eje 1 • Las Cocuizas Centro", "Eje 2 • Sabana Grande", "Eje 3 • La Pica"]
    },
    "santa-cruz": {
      nombre: "Santa Cruz (La Cruz)",
      mun: "Maturín",
      subparroquias: ["Eje 1 • La Cruz Casco", "Eje 2 • Zona Industrial"]
    },
    "caripe": {
      nombre: "Caripe",
      mun: "Caripe",
      subparroquias: ["Eje Casco Caripe", "Eje El Mirador", "Eje La Guanota"]
    },
    "punta-de-mata": {
      nombre: "Punta de Mata",
      mun: "Ezequiel Zamora",
      subparroquias: ["Eje Casco Punta de Mata", "Eje Morichalito", "Eje Tejero"]
    }
  };

  // Reportes semilla con el formato físico oficial de campo (Caracterización del Voto)
  const SEED_REPORTS = [
    {
      id: "REP-2026-001",
      parroquiaId: "alto-de-los-godos",
      parroquiaNombre: "Alto de Los Godos",
      munId: "maturin",
      munNombre: "Maturín",
      subparroquia: "Sub-Parroquia 2 • Morichal",
      sector: "Morichal Sector 1",
      centroElectoral: "Centro De Votación Brisas De Venezuela",
      codigoCentroCne: "140706062",
      fechaPlanilla: "12/09/2026",
      remitenteNombre: "Carlos Gómez (Coord. Eje)",
      remitenteTlf: "+58 414-7891234",
      tipoArchivo: "foto",
      archivoNombre: "planilla_los_godos_morichal_25electores.jpg",
      archivoUrl: "../assets/logo-migato.png",
      fechaEnvio: "Hoy, 18:42",
      timestamp: Date.now() - 1000 * 60 * 35,
      estado: "pendiente",
      motivoRechazo: "",
      auditadoPor: "",
      auditadoEn: "",
      electores: [
        { nombre: "Pedro José Salazar Hernández", cedula: "V-14.234.567", telefono: "0414-1234567", subparroquia: "Sub-Parroquia 2 • Morichal", sector: "Morichal Sector 1", centroElectoral: "Centro De Votación Brisas De Venezuela", edad: 44, profesion: "Comerciante", clasificacionVoto: "duro" },
        { nombre: "María Elena Rivas Guilarte", cedula: "V-16.890.123", telefono: "0424-9876543", subparroquia: "Sub-Parroquia 2 • Morichal", sector: "Morichal Sector 1", centroElectoral: "Centro De Votación Brisas De Venezuela", edad: 38, profesion: "Docente", clasificacionVoto: "duro" },
        { nombre: "José Gregorio Rondón Cedeño", cedula: "V-12.456.789", telefono: "0412-5554321", subparroquia: "Sub-Parroquia 2 • Morichal", sector: "Morichal Sector 1", centroElectoral: "Centro De Votación Brisas De Venezuela", edad: 52, profesion: "Mecánico", clasificacionVoto: "blando" },
        { nombre: "Carmen Luisa Morales Padrón", cedula: "V-19.112.334", telefono: "0416-8889900", subparroquia: "Sub-Parroquia 2 • Morichal", sector: "Morichal Sector 1", centroElectoral: "Centro De Votación Brisas De Venezuela", edad: 33, profesion: "Enfermera", clasificacionVoto: "duro" },
        { nombre: "Andrés Eloy Blanco Fuentes", cedula: "V-27.678.901", telefono: "0414-3332211", subparroquia: "Sub-Parroquia 2 • Morichal", sector: "Morichal Sector 1", centroElectoral: "Centro De Votación Brisas De Venezuela", edad: 21, profesion: "Estudiante UDO", clasificacionVoto: "nuevo" },
        { nombre: "Francisco Javier Cova Ramos", cedula: "V-13.456.123", telefono: "0414-7654321", subparroquia: "Sub-Parroquia 2 • Morichal", sector: "Morichal Sector 1", centroElectoral: "Centro De Votación Brisas De Venezuela", edad: 49, profesion: "Albañil", clasificacionVoto: "duro" },
        { nombre: "Rosa Margarita Febres Luces", cedula: "V-18.901.234", telefono: "0424-1122334", subparroquia: "Sub-Parroquia 2 • Morichal", sector: "Morichal Sector 1", centroElectoral: "Centro De Votación Brisas De Venezuela", edad: 36, profesion: "Costurera", clasificacionVoto: "blando" },
        { nombre: "Luis Manuel Carrión Soto", cedula: "V-17.234.567", telefono: "0416-9988776", subparroquia: "Sub-Parroquia 2 • Morichal", sector: "Morichal Sector 1", centroElectoral: "Centro De Votación Brisas De Venezuela", edad: 40, profesion: "Electricista", clasificacionVoto: "duro" },
        { nombre: "Ana Teresa Villarroel Gómez", cedula: "V-29.123.456", telefono: "0412-3344556", subparroquia: "Sub-Parroquia 2 • Morichal", sector: "Morichal Sector 1", centroElectoral: "Centro De Votación Brisas De Venezuela", edad: 19, profesion: "Estudiante", clasificacionVoto: "nuevo" },
        { nombre: "Carlos Eduardo Malavé Rondón", cedula: "V-11.890.456", telefono: "0424-5566778", subparroquia: "Sub-Parroquia 2 • Morichal", sector: "Morichal Sector 1", centroElectoral: "Centro De Votación Brisas De Venezuela", edad: 57, profesion: "Transportista", clasificacionVoto: "duro" },
        { nombre: "Yelitza Coromoto Díaz Gil", cedula: "V-16.345.678", telefono: "0414-8899001", subparroquia: "Sub-Parroquia 2 • Morichal", sector: "Morichal Sector 1", centroElectoral: "Centro De Votación Brisas De Venezuela", edad: 42, profesion: "Administradora", clasificacionVoto: "duro" },
        { nombre: "Ramón Antonio Marcano Siso", cedula: "V-10.789.012", telefono: "0416-2233445", subparroquia: "Sub-Parroquia 2 • Morichal", sector: "Morichal Sector 1", centroElectoral: "Centro De Votación Brisas De Venezuela", edad: 65, profesion: "Jubilado", clasificacionVoto: "duro" },
        { nombre: "Gladys Josefina Aguilera Ruiz", cedula: "V-14.567.890", telefono: "0412-6677889", subparroquia: "Sub-Parroquia 2 • Morichal", sector: "Morichal Sector 1", centroElectoral: "Centro De Votación Brisas De Venezuela", edad: 46, profesion: "Secretaria", clasificacionVoto: "blando" },
        { nombre: "Domingo Alberto Sifontes Paz", cedula: "V-13.901.234", telefono: "0424-4455667", subparroquia: "Sub-Parroquia 2 • Morichal", sector: "Morichal Sector 1", centroElectoral: "Centro De Votación Brisas De Venezuela", edad: 48, profesion: "Herrero", clasificacionVoto: "duro" },
        { nombre: "Beatriz Elena Peñalver Ríos", cedula: "V-19.456.789", telefono: "0414-1100223", subparroquia: "Sub-Parroquia 2 • Morichal", sector: "Morichal Sector 1", centroElectoral: "Centro De Votación Brisas De Venezuela", edad: 34, profesion: "Peluquera", clasificacionVoto: "duro" },
        { nombre: "Héctor Rafael Llovera Silva", cedula: "V-12.890.123", telefono: "0416-7788990", subparroquia: "Sub-Parroquia 2 • Morichal", sector: "Morichal Sector 1", centroElectoral: "Centro De Votación Brisas De Venezuela", edad: 54, profesion: "Carpintero", clasificacionVoto: "duro" },
        { nombre: "Zuleima del Valle Gil Rojas", cedula: "V-17.678.901", telefono: "0412-9900112", subparroquia: "Sub-Parroquia 2 • Morichal", sector: "Morichal Sector 1", centroElectoral: "Centro De Votación Brisas De Venezuela", edad: 39, profesion: "Vendedora", clasificacionVoto: "blando" },
        { nombre: "Marcos Tulio Centeno Mata", cedula: "V-15.123.456", telefono: "0424-3322114", subparroquia: "Sub-Parroquia 2 • Morichal", sector: "Morichal Sector 1", centroElectoral: "Centro De Votación Brisas De Venezuela", edad: 45, profesion: "Contador", clasificacionVoto: "duro" },
        { nombre: "Coromoto Josefina Brito Leon", cedula: "V-18.234.567", telefono: "0414-5544332", subparroquia: "Sub-Parroquia 2 • Morichal", sector: "Morichal Sector 1", centroElectoral: "Centro De Votación Brisas De Venezuela", edad: 37, profesion: "Ama de Casa", clasificacionVoto: "duro" },
        { nombre: "Jesús Enrique Bastardo Mora", cedula: "V-11.456.789", telefono: "0416-1122446", subparroquia: "Sub-Parroquia 2 • Morichal", sector: "Morichal Sector 1", centroElectoral: "Centro De Votación Brisas De Venezuela", edad: 60, profesion: "Agricultor", clasificacionVoto: "duro" },
        { nombre: "Luisa Amanda Velásquez Bello", cedula: "V-16.789.012", telefono: "0412-8877665", subparroquia: "Sub-Parroquia 2 • Morichal", sector: "Morichal Sector 1", centroElectoral: "Centro De Votación Brisas De Venezuela", edad: 41, profesion: "Enfermera", clasificacionVoto: "duro" },
        { nombre: "Oscar Daniel Subero Guerra", cedula: "V-28.901.234", telefono: "0424-6655443", subparroquia: "Sub-Parroquia 2 • Morichal", sector: "Morichal Sector 1", centroElectoral: "Centro De Votación Brisas De Venezuela", edad: 22, profesion: "Programador / Freelance", clasificacionVoto: "nuevo" },
        { nombre: "Miriam Carolina Zerpa Nuñez", cedula: "V-19.789.012", telefono: "0414-2211335", subparroquia: "Sub-Parroquia 2 • Morichal", sector: "Morichal Sector 1", centroElectoral: "Centro De Votación Brisas De Venezuela", edad: 33, profesion: "Comerciante", clasificacionVoto: "duro" },
        { nombre: "Nelson José Meneses Bravo", cedula: "V-13.234.567", telefono: "0416-4433221", subparroquia: "Sub-Parroquia 2 • Morichal", sector: "Morichal Sector 1", centroElectoral: "Centro De Votación Brisas De Venezuela", edad: 51, profesion: "Vigilante", clasificacionVoto: "blando" },
        { nombre: "Patricia del Carmen Ordaz Sol", cedula: "V-21.345.678", telefono: "0412-7766554", subparroquia: "Sub-Parroquia 2 • Morichal", sector: "Morichal Sector 1", centroElectoral: "Centro De Votación Brisas De Venezuela", edad: 30, profesion: "Bioanalista", clasificacionVoto: "duro" }
      ]
    },
    {
      id: "REP-2026-002",
      parroquiaId: "boqueron",
      parroquiaNombre: "Boquerón",
      munId: "maturin",
      munNombre: "Maturín",
      subparroquia: "Eje 2 • Costo Arriba",
      sector: "Sector Costo Arriba",
      centroElectoral: "Escuela Basica Boqueron",
      codigoCentroCne: "140702001",
      fechaPlanilla: "11/09/2026",
      remitenteNombre: "María Eugenia Rivas",
      remitenteTlf: "+58 412-3456789",
      tipoArchivo: "foto",
      archivoNombre: "asamblea_costo_arriba.jpg",
      archivoUrl: "../assets/logo-migato.png",
      fechaEnvio: "Hoy, 17:15",
      timestamp: Date.now() - 1000 * 60 * 95,
      estado: "certificado",
      motivoRechazo: "",
      auditadoPor: "Comando Regional",
      auditadoEn: "Hoy, 17:30",
      electores: [
        { nombre: "Rafael Antonio Lugo", cedula: "V-11.234.890", telefono: "0414-7776655", subparroquia: "Eje 2 • Costo Arriba", sector: "Sector Centro", centroElectoral: "Escuela Basica Boqueron", edad: 59, profesion: "Comerciante", clasificacionVoto: "duro" },
        { nombre: "Yolanda Mercedes Gil", cedula: "V-18.456.123", telefono: "0424-1112233", subparroquia: "Eje 2 • Costo Arriba", sector: "Calle La Esperanza", centroElectoral: "Escuela Basica Boqueron", edad: 37, profesion: "Docente", clasificacionVoto: "duro" },
        { nombre: "Héctor Ramón Cedeño", cedula: "V-13.908.456", telefono: "0412-9990011", subparroquia: "Eje 2 • Costo Arriba", sector: "Carrera 2 Casa 5", centroElectoral: "Escuela Basica Boqueron", edad: 48, profesion: "Mecánico", clasificacionVoto: "blando" }
      ]
    },
    {
      id: "REP-2026-003",
      parroquiaId: "san-simon",
      parroquiaNombre: "San Simón",
      munId: "maturin",
      munNombre: "Maturín",
      subparroquia: "Eje 1 • Casco Histórico y Comercial",
      sector: "Centro Histórico Plaza Bolívar",
      centroElectoral: "Liceo Francisco Isnardi",
      codigoCentroCne: "140701002",
      fechaPlanilla: "12/09/2026",
      remitenteNombre: "Héctor Luis Cedeño",
      remitenteTlf: "+58 424-9123456",
      tipoArchivo: "excel",
      archivoNombre: "censo_comercial_san_simon.xlsx",
      archivoUrl: "",
      fechaEnvio: "Hoy, 16:20",
      timestamp: Date.now() - 1000 * 60 * 160,
      estado: "pendiente",
      motivoRechazo: "",
      auditadoPor: "",
      auditadoEn: "",
      electores: [
        { nombre: "Domingo Savio Martínez", cedula: "V-10.456.111", telefono: "0414-2223344", subparroquia: "Eje 1 • Casco Histórico", sector: "Calle Junín", centroElectoral: "Liceo Francisco Isnardi", edad: 64, profesion: "Abogado", clasificacionVoto: "duro" },
        { nombre: "Patricia Carolina Fuentes", cedula: "V-17.890.345", telefono: "0412-4445566", subparroquia: "Eje 1 • Casco Histórico", sector: "Calle Monagas", centroElectoral: "Liceo Francisco Isnardi", edad: 41, profesion: "Comerciante", clasificacionVoto: "duro" },
        { nombre: "Luis Fernando Rojas", cedula: "V-28.123.678", telefono: "0424-6667788", subparroquia: "Eje 1 • Casco Histórico", sector: "Av. Bicentenario", centroElectoral: "Liceo Francisco Isnardi", edad: 23, profesion: "Diseñador Gráfico", clasificacionVoto: "nuevo" },
        { nombre: "Gladys Josefina Padrón", cedula: "V-15.998.776", telefono: "0416-0001122", subparroquia: "Eje 1 • Casco Histórico", sector: "Calle Miranda", centroElectoral: "Liceo Francisco Isnardi", edad: 46, profesion: "Costurera", clasificacionVoto: "blando" }
      ]
    },
    {
      id: "REP-2026-004",
      parroquiaId: "caripe",
      parroquiaNombre: "Caripe",
      munId: "caripe",
      munNombre: "Caripe",
      subparroquia: "Eje El Mirador",
      sector: "El Mirador - Sector Agrícola",
      centroElectoral: "Unidad Educativa Abraham Lincoln",
      codigoCentroCne: "140301001",
      fechaPlanilla: "11/09/2026",
      remitenteNombre: "José Manuel Font (Enlace Mun)",
      remitenteTlf: "+58 416-5551234",
      tipoArchivo: "texto",
      archivoNombre: "reporte_rapido_whatsapp.txt",
      archivoUrl: "",
      fechaEnvio: "Hoy, 15:05",
      timestamp: Date.now() - 1000 * 60 * 220,
      estado: "pendiente",
      motivoRechazo: "",
      auditadoPor: "",
      auditadoEn: "",
      electores: [
        { nombre: "Marcos Aurelio Subero", cedula: "V-13.789.012", telefono: "0414-9988776", subparroquia: "Eje El Mirador", sector: "Fila Los Manantiales", centroElectoral: "Unidad Educativa Abraham Lincoln", edad: 51, profesion: "Caficultor", clasificacionVoto: "duro" },
        { nombre: "Elena del Valle Guzmán", cedula: "V-16.443.221", telefono: "0424-5544332", subparroquia: "Eje El Mirador", sector: "Camino Las Delicias", centroElectoral: "Unidad Educativa Abraham Lincoln", edad: 43, profesion: "Docente", clasificacionVoto: "duro" }
      ]
    },
    {
      id: "REP-2026-005",
      parroquiaId: "punta-de-mata",
      parroquiaNombre: "Punta de Mata",
      munId: "ezequiel-zamora",
      munNombre: "Ezequiel Zamora",
      subparroquia: "Eje Morichalito",
      sector: "Sector Morichalito",
      centroElectoral: "Escuela Basica Alberto Ravell",
      codigoCentroCne: "141301004",
      fechaPlanilla: "10/09/2026",
      remitenteNombre: "Rosaura Marcano",
      remitenteTlf: "+58 414-1122334",
      tipoArchivo: "foto",
      archivoNombre: "planilla_morichalito.jpg",
      archivoUrl: "../assets/logo-migato.png",
      fechaEnvio: "Ayer, 20:10",
      timestamp: Date.now() - 1000 * 60 * 60 * 24,
      estado: "certificado",
      motivoRechazo: "",
      auditadoPor: "Comando Regional",
      auditadoEn: "Ayer, 21:00",
      electores: [
        { nombre: "Francisco Javier Maita", cedula: "V-12.876.543", telefono: "0414-8877665", subparroquia: "Eje Morichalito", sector: "Calle 1 No. 44", centroElectoral: "Escuela Basica Alberto Ravell", edad: 53, profesion: "Petrolero", clasificacionVoto: "duro" },
        { nombre: "Ana Teresa Guevara", cedula: "V-19.543.210", telefono: "0424-3322114", subparroquia: "Eje Morichalito", sector: "Calle Bolívar", centroElectoral: "Escuela Basica Alberto Ravell", edad: 35, profesion: "Enfermera", clasificacionVoto: "duro" }
      ]
    }
  ];

  // Directorio de Enlaces Autorizados para el Bot de WhatsApp
  const SEED_WHITELIST = [
    { parroquiaId: "alto-de-los-godos", parroquia: "Alto de Los Godos", mun: "Maturín", responsable: "Carlos Gómez", telefono: "+58 414-7891234", estado: "activo" },
    { parroquiaId: "boqueron", parroquia: "Boquerón", mun: "Maturín", responsable: "María Eugenia Rivas", telefono: "+58 412-3456789", estado: "activo" },
    { parroquiaId: "san-simon", parroquia: "San Simón", mun: "Maturín", responsable: "Héctor Luis Cedeño", telefono: "+58 424-9123456", estado: "activo" },
    { parroquiaId: "las-cocuizas", parroquia: "Las Cocuizas", mun: "Maturín", responsable: "Juan Carlos Padrino", telefono: "+58 414-5544332", estado: "activo" },
    { parroquiaId: "santa-cruz", parroquia: "Santa Cruz (La Cruz)", mun: "Maturín", responsable: "Diana Carolina Vallenilla", telefono: "+58 424-6677889", estado: "activo" },
    { parroquiaId: "la-pica", parroquia: "La Pica", mun: "Maturín", responsable: "Nelson Rafael Brito", telefono: "+58 416-2233445", estado: "activo" },
    { parroquiaId: "san-vicente", parroquia: "San Vicente", mun: "Maturín", responsable: "Wilmer José Figueroa", telefono: "+58 412-8899001", estado: "activo" },
    { parroquiaId: "el-corozo", parroquia: "El Corozo", mun: "Maturín", responsable: "Beatriz Elena Cordero", telefono: "+58 414-4455667", estado: "activo" },
    { parroquiaId: "el-furrial", parroquia: "El Furrial", mun: "Maturín", responsable: "Gabriel José Rondón", telefono: "+58 424-7788990", estado: "activo" },
    { parroquiaId: "jusepin", parroquia: "Jusepín", mun: "Maturín", responsable: "Ramón Antonio Malavé", telefono: "+58 416-1122334", estado: "activo" },
    { parroquiaId: "caripe", parroquia: "Caripe", mun: "Caripe", responsable: "José Manuel Font", telefono: "+58 416-5551234", estado: "activo" },
    { parroquiaId: "punta-de-mata", parroquia: "Punta de Mata", mun: "Ezequiel Zamora", responsable: "Rosaura Marcano", telefono: "+58 414-1122334", estado: "activo" },
    { parroquiaId: "caicara", parroquia: "Caicara de Maturín", mun: "Cedeño", responsable: "Oswaldo José Cedeño", telefono: "+58 412-9988776", estado: "activo" },
    { parroquiaId: "temblador", parroquia: "Temblador", mun: "Libertador", responsable: "Argenis Rafael Márquez", telefono: "+58 424-3344556", estado: "activo" },
    { parroquiaId: "aragua-de-maturin", parroquia: "Aragua de Maturín", mun: "Piar", responsable: "Luis Alfredo Salazar", telefono: "+58 414-6677881", estado: "activo" }
  ];

  let cachedReports = null;
  let cachedCertifiedCedulasMap = null;

  function invalidateCaches() {
    cachedReports = null;
    cachedCertifiedCedulasMap = null;
  }

  function getReports(forceReload = false) {
    if (cachedReports && !forceReload) return cachedReports;
    try {
      const raw = localStorage.getItem(STORAGE_REPORTS_KEY);
      if (raw) {
        cachedReports = JSON.parse(raw);
        return cachedReports;
      }
    } catch (e) {
      console.warn("Error leyendo reportes de auditoría:", e);
    }
    cachedReports = SEED_REPORTS.slice();
    try {
      localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(cachedReports));
    } catch (e) {}
    return cachedReports;
  }

  function saveReports(reports) {
    cachedReports = reports;
    cachedCertifiedCedulasMap = null; // Invalida el mapa de duplicados
    try {
      localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(reports));
    } catch (e) {
      console.warn("[MIGATO AUDIT] LocalStorage saturado (>5MB). Los datos se mantienen en memoria ultrarrápida:", e);
    }
  }

  function getCertifiedCedulasMap() {
    if (cachedCertifiedCedulasMap) return cachedCertifiedCedulasMap;
    const map = new Map();
    const reports = getReports();
    for (let i = 0; i < reports.length; i++) {
      const r = reports[i];
      if (r.estado === "certificado" && Array.isArray(r.electores)) {
        for (let j = 0; j < r.electores.length; j++) {
          const e = r.electores[j];
          if (e.cedula) {
            const clean = e.cedula.replace(/[^0-9]/g, "");
            if (clean) map.set(clean, r.id);
          }
        }
      }
    }
    cachedCertifiedCedulasMap = map;
    return cachedCertifiedCedulasMap;
  }

  function ensureSearchIndex(report) {
    if (report._searchIndex) return report._searchIndex;
    const electoresTokens = [];
    if (Array.isArray(report.electores)) {
      for (let i = 0; i < report.electores.length; i++) {
        const el = report.electores[i];
        if (el.cedula) electoresTokens.push(el.cedula.replace(/[^0-9]/g, ""));
        if (el.nombre) electoresTokens.push(el.nombre);
      }
    }
    report._searchIndex = [
      report.id,
      report.parroquiaNombre,
      report.munNombre,
      report.subparroquia || "",
      report.sector || "",
      report.centroElectoral || "",
      report.remitenteNombre,
      report.remitenteTlf,
      electoresTokens.join(" ")
    ].join(" ").toLowerCase();
    return report._searchIndex;
  }

  function generateStressTestData(count = 500) {
    const nombres = ["Carlos", "María", "José", "Ana", "Pedro", "Carmen", "Luis", "Elena", "Francisco", "Rosa", "Jesús", "Gladys", "Andrés", "Zuleima", "Marcos"];
    const apellidos = ["González", "Rodríguez", "Pérez", "Hernández", "García", "Martínez", "López", "Rondón", "Cedeño", "Morales", "Blanco", "Gómez"];
    const profesiones = ["Docente", "Comerciante", "Mecánico", "Enfermera", "Agricultor", "Albañil", "Costurera", "Estudiante", "Contador", "Chofer"];
    const parroquiasKeys = Object.keys(PARROQUIAS_CATALOG);
    
    const newReports = [];
    let cedulaBase = 15000000;

    for (let i = 1; i <= count; i++) {
      const pKey = parroquiasKeys[i % parroquiasKeys.length];
      const pData = PARROQUIAS_CATALOG[pKey];
      const subP = pData.subparroquias[i % pData.subparroquias.length];
      const electores = [];
      const numElectores = 25; // 25 electores por hoja física de campo
      
      for (let j = 0; j < numElectores; j++) {
        cedulaBase += Math.floor(Math.random() * 5) + 1;
        const nom = nombres[(i + j) % nombres.length] + " " + apellidos[(i * 2 + j) % apellidos.length];
        const voto = j % 4 === 0 ? "blando" : j % 7 === 0 ? "nuevo" : "duro";
        electores.push({
          nombre: nom,
          cedula: "V-" + cedulaBase.toLocaleString("de-DE"),
          telefono: "0414-" + (1000000 + ((i * 30 + j) % 8999999)),
          subparroquia: subP,
          sector: "Sector " + ((i % 15) + 1),
          centroElectoral: "Centro Electoral #" + ((i % 20) + 1),
          edad: 18 + ((i + j) % 65),
          profesion: profesiones[(i + j) % profesiones.length],
          clasificacionVoto: voto
        });
      }

      newReports.push({
        id: `REP-MASIVO-${String(i).padStart(4, '0')}`,
        parroquiaId: pKey,
        parroquiaNombre: pData.nombre,
        munId: pData.mun.toLowerCase().replace(/\s+/g, '-'),
        munNombre: pData.mun,
        subparroquia: subP,
        sector: "Sector " + ((i % 15) + 1),
        centroElectoral: "Centro Electoral #" + ((i % 20) + 1),
        codigoCentroCne: "14070" + String(1000 + (i % 500)),
        fechaPlanilla: "12/09/2026",
        remitenteNombre: "Coordinador Eje " + ((i % 10) + 1),
        remitenteTlf: "+58 414-" + (7000000 + i),
        tipoArchivo: "foto",
        archivoNombre: `planilla_campo_${i}.jpg`,
        archivoUrl: "../assets/logo-migato.png",
        fechaEnvio: "Hoy, 10:00",
        timestamp: Date.now() - (i * 60000),
        estado: i % 3 === 0 ? "certificado" : "pendiente",
        motivoRechazo: "",
        auditadoPor: i % 3 === 0 ? "Comando Regional" : "",
        auditadoEn: i % 3 === 0 ? "Hoy, 10:15" : "",
        electores
      });
    }

    cachedReports = newReports;
    cachedCertifiedCedulasMap = null;
    try {
      localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(newReports));
    } catch (e) {
      console.warn("[MIGATO AUDIT] Set masivo excede límite de LocalStorage. Procesando en memoria ultrarrápida:", e);
    }
    return newReports;
  }

  function resetToSeedData() {
    cachedReports = SEED_REPORTS.slice();
    cachedCertifiedCedulasMap = null;
    try {
      localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(cachedReports));
    } catch (e) {}
    return cachedReports;
  }

  function getWhitelist() {
    try {
      const raw = localStorage.getItem(STORAGE_WHITELIST_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    localStorage.setItem(STORAGE_WHITELIST_KEY, JSON.stringify(SEED_WHITELIST));
    return SEED_WHITELIST;
  }

  function getParroquiasCatalog() {
    return PARROQUIAS_CATALOG;
  }

  /**
   * MOTOR DE AUDITORÍA Y COTEJO DE CORRESPONDENCIA
   * Valida si el reporte realmente corresponde en:
   * 1. Territorio (Parroquia -> Sub-Parroquia / Eje -> Sector)
   * 2. Centro Electoral Oficial CNE (según catálogo oficial)
   * 3. Padrón (formato cédula, duplicados en la hoja y duplicados contra otras planillas certificadas)
   */
  function validarCorrespondencia(report) {
    if (!report) return null;

    // 1. Territorio
    const cat = PARROQUIAS_CATALOG[report.parroquiaId];
    const parroquiaOk = Boolean(cat || report.parroquiaNombre);
    const subParroquiasDisponibles = cat ? cat.subparroquias : [];
    const tieneSubparroquia = Boolean(report.subparroquia && report.subparroquia.trim().length > 0);
    const tieneSector = Boolean(report.sector && report.sector.trim().length > 0);

    // 2. Centro CNE
    let centroCneInfo = null;
    let centroValido = false;
    let centroWarning = "";

    const centrosList = (typeof window !== "undefined" && window.CENTROS_MATURIN) ? window.CENTROS_MATURIN : [];
    if (centrosList.length > 0 && report.centroElectoral) {
      const targetCentro = report.centroElectoral.toLowerCase().trim();
      const targetId = report.codigoCentroCne ? String(report.codigoCentroCne).trim() : "";

      const found = centrosList.find(c => {
        const cNombre = (c.nombre || "").toLowerCase();
        const cId = String(c.id || c.codigo || "");
        return (targetId && cId === targetId) || cNombre.includes(targetCentro) || targetCentro.includes(cNombre);
      });

      if (found) {
        centroCneInfo = found;
        const p1 = (found.parroquia || "").toLowerCase();
        const p2 = (found.parroquiaNombre || "").toLowerCase();
        const repP = (report.parroquiaId || "").toLowerCase();
        const repNom = (report.parroquiaNombre || "").toLowerCase();

        const matchPquia = p1.includes(repP) || repP.includes(p1) || p2.includes(repNom) || repNom.includes(p2);
        if (matchPquia) {
          centroValido = true;
        } else {
          centroWarning = "El centro " + found.nombre + " pertenece según CNE a " + (found.parroquiaNombre || found.parroquia) + ", no a " + report.parroquiaNombre + ".";
        }
      } else {
        centroWarning = "El centro " + report.centroElectoral + " no figura en el catálogo oficial CNE de Maturín.";
      }
    } else if (report.centroElectoral) {
      centroValido = true;
    }

    // 3. Auditoría de Electores
    const electores = Array.isArray(report.electores) ? report.electores : [];
    let totalDuro = 0;
    let totalBlando = 0;
    let totalNuevo = 0;
    let sumaEdades = 0;
    let conEdad = 0;

    const allCertifiedMap = getCertifiedCedulasMap();
    const cedulasVistasEnHoja = new Map();

    const electoresAuditados = electores.map((e, idx) => {
      const rawCi = (e.cedula || "").trim();
      const cleanCi = rawCi.replace(/[^0-9]/g, "");
      let alertMsg = null;
      let valido = true;

      if (!cleanCi || cleanCi.length < 5) {
        valido = false;
        alertMsg = "Cédula incompleta";
      } else if (allCertifiedMap.has(cleanCi) && allCertifiedMap.get(cleanCi) !== report.id) {
        valido = false;
        alertMsg = "YA CERTIFICADA en " + allCertifiedMap.get(cleanCi);
      } else if (cedulasVistasEnHoja.has(cleanCi)) {
        valido = false;
        alertMsg = "REPETIDA (renglón #" + (cedulasVistasEnHoja.get(cleanCi) + 1) + ")";
      } else {
        cedulasVistasEnHoja.set(cleanCi, idx);
      }

      const voto = (e.clasificacionVoto || "duro").toLowerCase();
      if (voto === "duro") totalDuro++;
      else if (voto === "blando") totalBlando++;
      else if (voto === "nuevo") totalNuevo++;

      const edadNum = parseInt(e.edad, 10);
      if (!isNaN(edadNum) && edadNum >= 16 && edadNum <= 110) {
        sumaEdades += edadNum;
        conEdad++;
      }

      return {
        ...e,
        valido,
        alerta: alertMsg
      };
    });

    const totalInvalidos = electoresAuditados.filter(e => !e.valido).length;
    const edadPromedio = conEdad > 0 ? (sumaEdades / conEdad).toFixed(1) : "--";

    return {
      territorioValido: parroquiaOk && tieneSubparroquia && tieneSector,
      subParroquiasDisponibles,
      centroCneValido: centroValido,
      centroCneInfo,
      centroWarning,
      totalElectores: electores.length,
      totalValidos: electores.length - totalInvalidos,
      totalInvalidos,
      totalDuro,
      totalBlando,
      totalNuevo,
      edadPromedio,
      electoresAuditados
    };
  }

  function certifyReport(reportId, updatedReportData, auditorName) {
    const reports = getReports();
    const idx = reports.findIndex(r => r.id === reportId);
    if (idx !== -1) {
      reports[idx].estado = "certificado";
      reports[idx].auditadoPor = auditorName || "Comando Regional";
      reports[idx].auditadoEn = "Hoy, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      if (updatedReportData && typeof updatedReportData === "object") {
        if (Array.isArray(updatedReportData.electores)) {
          reports[idx].electores = updatedReportData.electores;
        } else if (Array.isArray(updatedReportData)) {
          reports[idx].electores = updatedReportData;
        }

        if (updatedReportData.subparroquia) reports[idx].subparroquia = updatedReportData.subparroquia;
        if (updatedReportData.sector) reports[idx].sector = updatedReportData.sector;
        if (updatedReportData.centroElectoral) reports[idx].centroElectoral = updatedReportData.centroElectoral;
        if (updatedReportData.codigoCentroCne) reports[idx].codigoCentroCne = updatedReportData.codigoCentroCne;
        if (updatedReportData.fechaPlanilla) reports[idx].fechaPlanilla = updatedReportData.fechaPlanilla;
      }

      saveReports(reports);
      return reports[idx];
    }
    return null;
  }

  function rejectReport(reportId, motivo, auditorName) {
    const reports = getReports();
    const idx = reports.findIndex(r => r.id === reportId);
    if (idx !== -1) {
      reports[idx].estado = "rechazado";
      reports[idx].motivoRechazo = motivo || "Planilla ilegible o datos inconsistentes con territorio";
      reports[idx].auditadoPor = auditorName || "Comando Regional";
      reports[idx].auditadoEn = "Hoy, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      saveReports(reports);
      return reports[idx];
    }
    return null;
  }

  function getStats() {
    const reports = getReports();
    let totalElectoresCertificados = 0;
    let totalElectoresPendientes = 0;
    let pendientesCount = 0;
    let certificadosCount = 0;
    let rechazadosCount = 0;
    let totalVotoDuro = 0;
    let totalVotoBlando = 0;
    let totalVotoNuevo = 0;
    const parroquiasSet = new Set();

    reports.forEach(r => {
      const count = Array.isArray(r.electores) ? r.electores.length : 0;
      parroquiasSet.add(r.parroquiaId);
      if (r.estado === "certificado") {
        totalElectoresCertificados += count;
        certificadosCount++;
        (r.electores || []).forEach(e => {
          const v = (e.clasificacionVoto || "duro").toLowerCase();
          if (v === "duro") totalVotoDuro++;
          else if (v === "blando") totalVotoBlando++;
          else if (v === "nuevo") totalVotoNuevo++;
        });
      } else if (r.estado === "pendiente") {
        totalElectoresPendientes += count;
        pendientesCount++;
      } else if (r.estado === "rechazado") {
        rechazadosCount++;
      }
    });

    return {
      totalElectoresCertificados,
      totalElectoresPendientes,
      totalPlanillas: reports.length,
      pendientesCount,
      certificadosCount,
      rechazadosCount,
      totalVotoDuro,
      totalVotoBlando,
      totalVotoNuevo,
      parroquiasActivas: parroquiasSet.size,
      totalParroquiasMonagas: 44
    };
  }

  return {
    getReports,
    saveReports,
    getWhitelist,
    getParroquiasCatalog,
    validarCorrespondencia,
    certifyReport,
    rejectReport,
    getStats,
    ensureSearchIndex,
    generateStressTestData,
    resetToSeedData,
    invalidateCaches
  };
})();

window.MIGATO_AUDIT = MIGATO_AUDIT;
