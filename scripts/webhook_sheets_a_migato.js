/**
 * ============================================================================
 * PUENTE DE SINCRONIZACIÓN GOOGLE SHEETS -> SALA SITUACIONAL MIGATO 2026
 * ============================================================================
 * Este script se vincula a la Hoja de Respuestas de Google Forms.
 * Se dispara con el evento "Al enviar formulario" (onFormSubmit).
 *
 * Funciones Principales:
 * 1. Lee la respuesta entrante de cualquier sector (Salud, Educación, Bomberos, etc.).
 * 2. Aplica el Algoritmo de la Falla Limitante (Punto Crítico) para calcular el semáforo.
 * 3. Cruza la ubicación y prepara el objeto JSON normalizado.
 * 4. Envía el reporte a la API de la Sala Situacional o actualiza una pestaña de "Consolidado".
 * ============================================================================
 */

function onFormSubmit(e) {
  try {
    const respuestas = e.namedValues;
    const timestamp = e.values[0];

    // Detectar sector evaluado
    let sector = "Desconocido";
    for (const key in respuestas) {
      if (key.indexOf("sector que desea evaluar") !== -1) {
        sector = respuestas[key][0];
        break;
      }
    }

    // Calcular Semáforo según Falla Limitante
    let semaforoCalculado = "VERDE";
    let fallasCriticas = [];
    let alertasModeradas = [];

    for (const pregunta in respuestas) {
      const valor = respuestas[pregunta][0] || "";

      // Si la opción seleccionada tiene el emoji o indicativo ROJO
      if (valor.indexOf("🔴") !== -1) {
        semaforoCalculado = "ROJO";
        fallasCriticas.push(pregunta.substring(0, 45) + ": " + valor);
      } else if (valor.indexOf("🟡") !== -1) {
        if (semaforoCalculado !== "ROJO") {
          semaforoCalculado = "AMBAR";
        }
        alertasModeradas.push(pregunta.substring(0, 45) + ": " + valor);
      }
    }

    // Estructurar el objeto normalizado
    const payload = {
      timestamp: timestamp,
      sector: sector,
      semaforo: semaforoCalculado,
      total_fallas_criticas: fallasCriticas.length,
      fallas_criticas: fallasCriticas,
      alertas_moderadas: alertasModeradas,
      datos_completos: respuestas
    };

    Logger.log("Reporte Procesado: " + sector + " -> Semáforo: " + semaforoCalculado);

    // Opcional: Reenviar a Endpoint VPS / Servidor Local de la Sala Situacional
    const ENDPOINT_SALA_SITUACIONAL = "https://tu-servidor-migato.org/api/reportes-campo";
    // Descomentar para enviar en vivo:
    /*
    const opciones = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    UrlFetchApp.fetch(ENDPOINT_SALA_SITUACIONAL, opciones);
    */

    // Registrar en Hoja Consolidada Interna
    registrarEnHojaConsolidada(payload);

  } catch (error) {
    Logger.log("Error al procesar formulario: " + error.toString());
  }
}

/**
 * Registra el reporte ya calificado en una pestaña 'Consolidado_Semaforos'
 */
function registrarEnHojaConsolidada(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = ss.getSheetByName("Consolidado_Semaforos");

  if (!hoja) {
    hoja = ss.insertSheet("Consolidado_Semaforos");
    hoja.appendRow([
      "Timestamp", "Sector", "Semáforo", "Fallas Críticas", "Alertas Moderadas", "Detalle JSON"
    ]);
    hoja.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#EAEAEA");
  }

  const fila = [
    payload.timestamp,
    payload.sector,
    payload.semaforo,
    payload.fallas_criticas.join(" | "),
    payload.alertas_moderadas.join(" | "),
    JSON.stringify(payload.datos_completos)
  ];

  hoja.appendRow(fila);
}
