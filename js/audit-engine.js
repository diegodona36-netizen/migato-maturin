/**
 * MIGATO - Motor de Auditoría Territorial y Control de Ingesta del Bot de WhatsApp
 * Gestiona el ciclo de vida de las planillas (Pendiente -> Certificado / Rechazado),
 * persistencia local, verificación territorial, validación de centros CNE y cotejo de padrón.
 */

const MIGATO_AUDIT = (function() {
  const STORAGE_REPORTS_KEY = "migato_audit_reports_prod_v1";
  const STORAGE_WHITELIST_KEY = "migato_audit_whitelist_prod_v1";

  // Base de expedientes en producción: Inicia limpio a la espera de recepción oficial vía WhatsApp o Buzón
  const SEED_REPORTS = [];

  // Directorio Oficial de Enlaces de Parroquias y Municipios para Ingesta WhatsApp
  const SEED_WHITELIST = [
    { parroquiaId: "alto-de-los-godos", parroquia: "Alto de Los Godos", mun: "Maturín", responsable: "Por asignar", telefono: "", estado: "activo" },
    { parroquiaId: "boqueron", parroquia: "Boquerón", mun: "Maturín", responsable: "Por asignar", telefono: "", estado: "activo" },
    { parroquiaId: "san-simon", parroquia: "San Simón", mun: "Maturín", responsable: "Por asignar", telefono: "", estado: "activo" },
    { parroquiaId: "las-cocuizas", parroquia: "Las Cocuizas", mun: "Maturín", responsable: "Por asignar", telefono: "", estado: "activo" },
    { parroquiaId: "santa-cruz", parroquia: "Santa Cruz (La Cruz)", mun: "Maturín", responsable: "Por asignar", telefono: "", estado: "activo" },
    { parroquiaId: "la-pica", parroquia: "La Pica", mun: "Maturín", responsable: "Por asignar", telefono: "", estado: "activo" },
    { parroquiaId: "san-vicente", parroquia: "San Vicente", mun: "Maturín", responsable: "Por asignar", telefono: "", estado: "activo" },
    { parroquiaId: "el-corozo", parroquia: "El Corozo", mun: "Maturín", responsable: "Por asignar", telefono: "", estado: "activo" },
    { parroquiaId: "el-furrial", parroquia: "El Furrial", mun: "Maturín", responsable: "Por asignar", telefono: "", estado: "activo" },
    { parroquiaId: "jusepin", parroquia: "Jusepín", mun: "Maturín", responsable: "Por asignar", telefono: "", estado: "activo" },
    { parroquiaId: "caripe", parroquia: "Caripe", mun: "Caripe", responsable: "Por asignar", telefono: "", estado: "activo" },
    { parroquiaId: "punta-de-mata", parroquia: "Punta de Mata", mun: "Ezequiel Zamora", responsable: "Por asignar", telefono: "", estado: "activo" },
    { parroquiaId: "caicara", parroquia: "Caicara de Maturín", mun: "Cedeño", responsable: "Por asignar", telefono: "", estado: "activo" },
    { parroquiaId: "temblador", parroquia: "Temblador", mun: "Libertador", responsable: "Por asignar", telefono: "", estado: "activo" },
    { parroquiaId: "aragua-de-maturin", parroquia: "Aragua de Maturín", mun: "Piar", responsable: "Por asignar", telefono: "", estado: "activo" }
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
    cachedReports = [];
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
    // Desactivado en producción: Solo ingesta real vía WhatsApp Bot o Buzón Físico
    return [];
  }

  function resetToSeedData() {
    cachedReports = [];
    cachedCertifiedCedulasMap = null;
    try {
      localStorage.removeItem(STORAGE_REPORTS_KEY);
    } catch (e) {}
    return [];
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
