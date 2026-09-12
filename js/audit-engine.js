/**
 * MIGATO - Motor de Auditoría Territorial y Control de Ingesta del Bot de WhatsApp
 * Gestiona el ciclo de vida de las planillas (Pendiente -> Certificado / Rechazado),
 * persistencia local y sincronización con el Comando Central.
 */

const MIGATO_AUDIT = (function() {
  const STORAGE_REPORTS_KEY = "migato_audit_reports_v4";
  const STORAGE_WHITELIST_KEY = "migato_audit_whitelist_v1";

  // Reportes semilla realistas de Monagas para la demostración y puesta en marcha
  const SEED_REPORTS = [
    {
      id: "REP-2026-001",
      parroquiaId: "alto-de-los-godos",
      parroquiaNombre: "Alto de Los Godos",
      munId: "maturin",
      munNombre: "Maturín",
      sector: "Sector Morichal - Eje 3",
      remitenteNombre: "Carlos Gómez (Coord. Eje)",
      remitenteTlf: "+58 414-7891234",
      tipoArchivo: "foto",
      archivoNombre: "planilla_los_godos_eje3.jpg",
      archivoUrl: "../assets/logo-migato.png",
      fechaEnvio: "Hoy, 18:42",
      timestamp: Date.now() - 1000 * 60 * 35,
      estado: "pendiente", // pendiente, certificado, rechazado
      motivoRechazo: "",
      auditadoPor: "",
      auditadoEn: "",
      electores: [
        { nombre: "Pedro José Salazar Hernández", cedula: "V-14.234.567", telefono: "0414-1234567", sector: "Calle 4, Casa 12", intencion: "Voto Favorable" },
        { nombre: "María Elena Rivas Guilarte", cedula: "V-16.890.123", telefono: "0424-9876543", sector: "Vereda 2, Casa 8", intencion: "Voto Favorable" },
        { nombre: "José Gregorio Rondón Cedeño", cedula: "V-12.456.789", telefono: "0412-5554321", sector: "Av. Principal 45", intencion: "Voto Favorable" },
        { nombre: "Carmen Luisa Morales Padrón", cedula: "V-19.112.334", telefono: "0416-8889900", sector: "Calle Bolívar 3", intencion: "Voto Favorable" },
        { nombre: "Andrés Eloy Blanco Fuentes", cedula: "V-15.678.901", telefono: "0414-3332211", sector: "Calle Sucre 14", intencion: "Voto Favorable" },
        { nombre: "Francisco Javier Cova Ramos", cedula: "V-13.456.123", telefono: "0414-7654321", sector: "Calle 2, Casa 19", intencion: "Voto Favorable" },
        { nombre: "Rosa Margarita Febres Luces", cedula: "V-18.901.234", telefono: "0424-1122334", sector: "Vereda 5, Casa 3", intencion: "Voto Favorable" },
        { nombre: "Luis Manuel Carrión Soto", cedula: "V-17.234.567", telefono: "0416-9988776", sector: "Calle Mariño 11", intencion: "Voto Favorable" },
        { nombre: "Ana Teresa Villarroel Gómez", cedula: "V-20.123.456", telefono: "0412-3344556", sector: "Av. Universidad 4", intencion: "Voto Favorable" },
        { nombre: "Carlos Eduardo Malavé Rondón", cedula: "V-11.890.456", telefono: "0424-5566778", sector: "Calle 1, Casa 8", intencion: "Voto Favorable" },
        { nombre: "Yelitza Coromoto Díaz Gil", cedula: "V-16.345.678", telefono: "0414-8899001", sector: "Calle Boyacá 15", intencion: "Voto Favorable" },
        { nombre: "Ramón Antonio Marcano Siso", cedula: "V-10.789.012", telefono: "0416-2233445", sector: "Vereda 1 Casa 2", intencion: "Voto Favorable" },
        { nombre: "Gladys Josefina Aguilera Ruiz", cedula: "V-14.567.890", telefono: "0412-6677889", sector: "Calle 6, Casa 22", intencion: "Voto Favorable" },
        { nombre: "Domingo Alberto Sifontes Paz", cedula: "V-13.901.234", telefono: "0424-4455667", sector: "Calle Miranda 8", intencion: "Voto Favorable" },
        { nombre: "Beatriz Elena Peñalver Ríos", cedula: "V-19.456.789", telefono: "0414-1100223", sector: "Calle Sucre 30", intencion: "Voto Favorable" },
        { nombre: "Héctor Rafael Llovera Silva", cedula: "V-12.890.123", telefono: "0416-7788990", sector: "Av. 3, Casa 14", intencion: "Voto Favorable" },
        { nombre: "Zuleima del Valle Gil Rojas", cedula: "V-17.678.901", telefono: "0412-9900112", sector: "Calle Bolívar 50", intencion: "Voto Favorable" },
        { nombre: "Marcos Tulio Centeno Mata", cedula: "V-15.123.456", telefono: "0424-3322114", sector: "Vereda 3, Casa 7", intencion: "Voto Favorable" },
        { nombre: "Coromoto Josefina Brito Leon", cedula: "V-18.234.567", telefono: "0414-5544332", sector: "Calle 4, Casa 18", intencion: "Voto Favorable" },
        { nombre: "Jesús Enrique Bastardo Mora", cedula: "V-11.456.789", telefono: "0416-1122446", sector: "Calle Principal 2", intencion: "Voto Favorable" },
        { nombre: "Luisa Amanda Velásquez Bello", cedula: "V-16.789.012", telefono: "0412-8877665", sector: "Calle 7, Casa 9", intencion: "Voto Favorable" },
        { nombre: "Oscar Daniel Subero Guerra", cedula: "V-14.901.234", telefono: "0424-6655443", sector: "Vereda 4, Casa 1", intencion: "Voto Favorable" },
        { nombre: "Miriam Carolina Zerpa Nuñez", cedula: "V-19.789.012", telefono: "0414-2211335", sector: "Calle 5, Casa 11", intencion: "Voto Favorable" },
        { nombre: "Nelson José Meneses Bravo", cedula: "V-13.234.567", telefono: "0416-4433221", sector: "Calle Piar 16", intencion: "Voto Favorable" },
        { nombre: "Patricia del Carmen Ordaz Sol", cedula: "V-21.345.678", telefono: "0412-7766554", sector: "Calle 8, Casa 25", intencion: "Voto Favorable" }
      ]
    },
    {
      id: "REP-2026-002",
      parroquiaId: "boqueron",
      parroquiaNombre: "Boquerón",
      munId: "maturin",
      munNombre: "Maturín",
      sector: "Sector Costo Arriba",
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
        { nombre: "Rafael Antonio Lugo", cedula: "V-11.234.890", telefono: "0414-7776655", sector: "Sector Centro", intencion: "Voto Favorable" },
        { nombre: "Yolanda Mercedes Gil", cedula: "V-18.456.123", telefono: "0424-1112233", sector: "Calle La Esperanza", intencion: "Voto Favorable" },
        { nombre: "Héctor Ramón Cedeño", cedula: "V-13.908.456", telefono: "0412-9990011", sector: "Carrera 2 Casa 5", intencion: "Voto Favorable" }
      ]
    },
    {
      id: "REP-2026-003",
      parroquiaId: "san-simon",
      parroquiaNombre: "San Simón",
      munId: "maturin",
      munNombre: "Maturín",
      sector: "Eje Centro Histórico",
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
        { nombre: "Domingo Savio Martínez", cedula: "V-10.456.111", telefono: "0414-2223344", sector: "Calle Junín", intencion: "Voto Favorable" },
        { nombre: "Patricia Carolina Fuentes", cedula: "V-17.890.345", telefono: "0412-4445566", sector: "Calle Monagas", intencion: "Voto Favorable" },
        { nombre: "Luis Fernando Rojas", cedula: "V-20.123.678", telefono: "0424-6667788", sector: "Av. Bicentenario", intencion: "Voto Favorable" },
        { nombre: "Gladys Josefina Padrón", cedula: "V-15.998.776", telefono: "0416-0001122", sector: "Calle Miranda", intencion: "Voto Favorable" }
      ]
    },
    {
      id: "REP-2026-004",
      parroquiaId: "caripe",
      parroquiaNombre: "Caripe",
      munId: "caripe",
      munNombre: "Caripe",
      sector: "El Mirador - Sector Agrícola",
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
        { nombre: "Marcos Aurelio Subero", cedula: "V-13.789.012", telefono: "0414-9988776", sector: "Fila Los Manantiales", intencion: "Voto Favorable" },
        { nombre: "Elena del Valle Guzmán", cedula: "V-16.443.221", telefono: "0424-5544332", sector: "Camino Las Delicias", intencion: "Voto Favorable" }
      ]
    },
    {
      id: "REP-2026-005",
      parroquiaId: "punta-de-mata",
      parroquiaNombre: "Punta de Mata",
      munId: "ezequiel-zamora",
      munNombre: "Ezequiel Zamora",
      sector: "Sector Morichalito",
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
        { nombre: "Francisco Javier Maita", cedula: "V-12.876.543", telefono: "0414-8877665", sector: "Calle 1 No. 44", intencion: "Voto Favorable" },
        { nombre: "Ana Teresa Guevara", cedula: "V-19.543.210", telefono: "0424-3322114", sector: "Calle Bolívar", intencion: "Voto Favorable" }
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

  function getReports() {
    try {
      const raw = localStorage.getItem(STORAGE_REPORTS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn("Error leyendo reportes de auditoría:", e);
    }
    localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(SEED_REPORTS));
    return SEED_REPORTS;
  }

  function saveReports(reports) {
    localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(reports));
  }

  function getWhitelist() {
    try {
      const raw = localStorage.getItem(STORAGE_WHITELIST_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    localStorage.setItem(STORAGE_WHITELIST_KEY, JSON.stringify(SEED_WHITELIST));
    return SEED_WHITELIST;
  }

  function certifyReport(reportId, updatedElectores, auditorName) {
    const reports = getReports();
    const idx = reports.findIndex(r => r.id === reportId);
    if (idx !== -1) {
      reports[idx].estado = "certificado";
      reports[idx].auditadoPor = auditorName || "Comando Regional";
      reports[idx].auditadoEn = "Hoy, " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (Array.isArray(updatedElectores)) {
        reports[idx].electores = updatedElectores;
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
      reports[idx].motivoRechazo = motivo || "Planilla ilegible o datos incompletos";
      reports[idx].auditadoPor = auditorName || "Comando Regional";
      reports[idx].auditadoEn = "Hoy, " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
    const parroquiasSet = new Set();

    reports.forEach(r => {
      const count = Array.isArray(r.electores) ? r.electores.length : 0;
      parroquiasSet.add(r.parroquiaId);
      if (r.estado === "certificado") {
        totalElectoresCertificados += count;
        certificadosCount++;
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
      parroquiasActivas: parroquiasSet.size,
      totalParroquiasMonagas: 44
    };
  }

  return {
    getReports,
    getWhitelist,
    certifyReport,
    rejectReport,
    getStats
  };
})();

window.MIGATO_AUDIT = MIGATO_AUDIT;
