/**
 * Módulo de Integración con Google Sheets y Formularios de Google
 * Incluye lectura de CSV, extracción inteligente de enlaces de Google Maps y webhook.
 */

export class GoogleSheetsService {
  /**
   * Extrae el ID de la hoja y genera la URL de descarga CSV con soporte CORS
   */
  static getCsvUrl(url) {
    if (!url || typeof url !== 'string') return null;
    const cleanUrl = url.trim();

    if (cleanUrl.includes('output=csv') || cleanUrl.endsWith('.csv')) {
      return cleanUrl;
    }

    const matches = cleanUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (matches && matches[1]) {
      const sheetId = matches[1];
      const gidMatch = cleanUrl.match(/[#&?]gid=([0-9]+)/);
      const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';
      return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv${gidParam}`;
    }

    return cleanUrl;
  }

  /**
   * Descarga y parsea el CSV de Google Sheets con backend serverless y fallbacks
   */
  static async fetchSheetData(url) {
    if (!url || typeof url !== 'string') {
      throw new Error('La URL de Google Sheets no es válida.');
    }

    const cleanUrl = url.trim();
    let csvText = '';

    // 1. Intentar a través de nuestro endpoint nativo de Vercel (Cero bloqueos CORS)
    try {
      const apiEndpoint = `/api/sheet?url=${encodeURIComponent(cleanUrl)}`;
      const res = await fetch(apiEndpoint);
      if (res.ok) {
        csvText = await res.text();
      }
    } catch (apiErr) {
      console.warn('Endpoint /api/sheet no disponible, usando fallback directo...', apiErr);
    }

    // 2. Fallback directo a Google GVIZ
    if (!csvText || csvText.includes('<!DOCTYPE html>')) {
      const directUrl = this.getCsvUrl(cleanUrl);
      try {
        const res = await fetch(directUrl);
        if (res.ok) {
          csvText = await res.text();
        }
      } catch (e) {
        console.warn('Fetch directo falló', e);
      }
    }

    // 3. Fallback a proxy externo
    if (!csvText || csvText.includes('<!DOCTYPE html>')) {
      try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(this.getCsvUrl(cleanUrl))}`;
        const pResponse = await fetch(proxyUrl);
        if (pResponse.ok) {
          csvText = await pResponse.text();
        }
      } catch (pErr) {
        console.warn('Proxy falló', pErr);
      }
    }

    if (!csvText || csvText.includes('<!DOCTYPE html>') || csvText.includes('accounts.google.com')) {
      throw new Error('No se pudo leer la hoja. Asegúrate de ir en tu Google Sheets a: Archivo ➔ Compartir ➔ Publicar en la web ➔ Publicar.');
    }

    return this.parseCsv(csvText);
  }

  /**
   * Envía encuestas pendientes directamente al Webhook de Google Sheets
   */
  static async sendSurveysToWebhook(webhookUrl, surveys) {
    if (!webhookUrl || typeof webhookUrl !== 'string') {
      throw new Error('No se ha configurado la URL del Webhook de Google Apps Script.');
    }

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'bulk_insert',
          surveys: surveys
        })
      });
      return true;
    } catch (err) {
      console.error('Error enviando encuestas al Webhook:', err);
      throw err;
    }
  }

  /**
   * Parser robusto de CSV respetando comillas y saltos de línea
   */
  static parseCsv(csvText) {
    const lines = [];
    let currentRow = [];
    let currentCell = '';
    let insideQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const nextChar = csvText[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentCell += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if ((char === '\r' || char === '\n') && !insideQuotes) {
        if (char === '\r' && nextChar === '\n') i++;
        currentRow.push(currentCell.trim());
        if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
          lines.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }

    if (currentCell || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      lines.push(currentRow);
    }

    if (lines.length < 2) {
      return [];
    }

    const headers = lines[0].map(h => h.toLowerCase());
    const dataRows = lines.slice(1).filter(r => r.some(cell => cell && cell.trim() !== ''));

    if (dataRows.length === 0) {
      return [];
    }

    // Identificar todos los índices de columnas relevantes (soporta formularios con ramificación)
    const colIndex = {
      fecha: headers.findIndex(h => h.includes('marca') || h.includes('fecha') || h.includes('timestamp')),
      encuestador: headers.findIndex(h => h.includes('encuestador') || h.includes('nombre') || h.includes('voluntario')),
      cedula: headers.findIndex(h => h.includes('cedula') || h.includes('cédula') || h.includes('ci') || h.includes('identidad')),
      parroquia: headers.findIndex(h => h.includes('parroquia') && !h.includes('sector')),
      // Encontrar todas las columnas de sector posibles (por cada parroquia en formularios ramificados)
      sectorCols: headers.map((h, i) => (h.includes('sector') || h.includes('comunidad') || h.includes('zona')) ? i : -1).filter(i => i !== -1),
      aguaEstado: headers.findIndex(h => h.includes('agua') && (h.includes('estado') || h.includes('semáforo') || h.includes('semaforo') || h.includes('nivel') || h.includes('condición'))),
      aguaProblema: headers.findIndex(h => h.includes('agua') && (h.includes('problema') || h.includes('falla') || h.includes('tipo') || h.includes('motivo'))),
      aguaObs: headers.findIndex(h => h.includes('agua') && (h.includes('obs') || h.includes('detalle') || h.includes('comentario') || h.includes('nota'))),
      vialidadEstado: headers.findIndex(h => (h.includes('carretera') || h.includes('calle') || h.includes('vialidad')) && (h.includes('estado') || h.includes('semáforo') || h.includes('semaforo') || h.includes('nivel'))),
      vialidadProblema: headers.findIndex(h => (h.includes('carretera') || h.includes('calle') || h.includes('vialidad')) && (h.includes('problema') || h.includes('falla') || h.includes('tipo'))),
      vialidadObs: headers.findIndex(h => (h.includes('carretera') || h.includes('calle') || h.includes('vialidad')) && (h.includes('obs') || h.includes('detalle') || h.includes('comentario'))),
      generalObs: headers.findIndex(h => h.includes('observaci') || h.includes('testimonio') || h.includes('comentario')),
      mapsLink: headers.findIndex(h => h.includes('google') || h.includes('maps') || h.includes('ubicación') || h.includes('ubicacion') || h.includes('link') || h.includes('gps') || h.includes('coordenada')),
      lat: headers.findIndex(h => h.includes('lat') || h.includes('latitud')),
      lng: headers.findIndex(h => h.includes('lng') || h.includes('long') || h.includes('longitud'))
    };

    return dataRows.map((row, index) => {
      const getVal = (idx) => (idx !== -1 && row[idx] !== undefined) ? row[idx].trim() : '';
      
      // Buscar el sector en cualquiera de las columnas de sectores
      let foundSector = '';
      let inferredParroquia = '';
      for (const sIdx of colIndex.sectorCols) {
        const val = getVal(sIdx);
        if (val) {
          foundSector = val;
          const headerName = headers[sIdx] || '';
          // Si el encabezado dice "Sector de La Pica", inferir parroquia
          if (headerName.includes('la pica')) inferredParroquia = 'La Pica';
          else if (headerName.includes('godos')) inferredParroquia = 'Alto de Los Godos';
          else if (headerName.includes('boquer')) inferredParroquia = 'Boquerón';
          else if (headerName.includes('cocuizas')) inferredParroquia = 'Las Cocuizas';
          else if (headerName.includes('santa cruz')) inferredParroquia = 'Santa Cruz';
          else if (headerName.includes('san sim')) inferredParroquia = 'San Simón';
          else if (headerName.includes('jusep')) inferredParroquia = 'Jusepín';
          else if (headerName.includes('furrial')) inferredParroquia = 'El Furrial';
          else if (headerName.includes('san vicente')) inferredParroquia = 'San Vicente';
          else if (headerName.includes('corozo')) inferredParroquia = 'El Corozo';
          break;
        }
      }

      const rawParroquia = getVal(colIndex.parroquia) || inferredParroquia || 'San Simón';
      const rawEncuestadorFull = getVal(colIndex.encuestador) || '';
      const rawCedulaDirect = getVal(colIndex.cedula);

      // Separar Nombre y Cédula de manera 100% flexible (con o sin V/E)
      let parsedNombre = rawEncuestadorFull;
      let parsedCedula = rawCedulaDirect;

      if (!parsedCedula && rawEncuestadorFull) {
        const trimmed = rawEncuestadorFull.trim();
        if (/^[0-9]{6,9}$/.test(trimmed)) {
          parsedCedula = trimmed;
          parsedNombre = `Encuestador (${trimmed})`;
        } else {
          const ciMatch = trimmed.match(/(V|E|v|e)?-?\s*([0-9]{6,9})/);
          if (ciMatch) {
            const prefix = ciMatch[1] ? ciMatch[1].toUpperCase() + '-' : '';
            parsedCedula = `${prefix}${ciMatch[2]}`;
            parsedNombre = trimmed.replace(ciMatch[0], '').replace(/[-–:,]/g, '').trim();
          }
        }
      }

      if (!parsedCedula) parsedCedula = `ENC-${String(index + 1).padStart(3, '0')}`;
      if (!parsedNombre) parsedNombre = `Encuestador (${parsedCedula})`;

      const rawAguaEstado = getVal(colIndex.aguaEstado);
      const rawVialidadEstado = getVal(colIndex.vialidadEstado);
      const rawMapsLink = getVal(colIndex.mapsLink);
      const rawLat = getVal(colIndex.lat);
      const rawLng = getVal(colIndex.lng);
      const rawObsGeneral = getVal(colIndex.generalObs);

      // Extraer coordenadas si pegaron un enlace de Google Maps o coordenadas directas
      const parsedCoords = this.extractCoords(rawMapsLink || `${rawLat},${rawLng}`);

      return {
        id: `G-ENC-${parsedCedula.replace(/[^a-zA-Z0-9]/g, '')}-${String(index + 1).padStart(3, '0')}`,
        fecha: getVal(colIndex.fecha) || new Date().toISOString().replace('T', ' ').substring(0, 16),
        encuestador: parsedNombre,
        cedula: parsedCedula,
        parroquia: rawParroquia,
        sector: foundSector || 'Sector de ' + rawParroquia,
        aguaEstado: this.normalizeColor(rawAguaEstado),
        aguaProblema: getVal(colIndex.aguaProblema) || 'Reporte de agua',
        aguaObs: getVal(colIndex.aguaObs) || rawObsGeneral,
        vialidadEstado: this.normalizeColor(rawVialidadEstado),
        vialidadProblema: getVal(colIndex.vialidadProblema) || 'Reporte de vialidad',
        vialidadObs: getVal(colIndex.vialidadObs) || rawObsGeneral,
        mapsLink: rawMapsLink || null,
        lat: parsedCoords ? parsedCoords.lat : (parseFloat(rawLat) || null),
        lng: parsedCoords ? parsedCoords.lng : (parseFloat(rawLng) || null),
        syncStatus: 'synced'
      };
    });
  }

  /**
   * Extrae coordenadas a partir de texto o enlaces de Google Maps
   * Ejemplos soportados:
   * - "9.7457, -63.1764"
   * - "https://maps.google.com/?q=9.7457,-63.1764"
   * - "https://www.google.com/maps/@9.7457,-63.1764,17z"
   */
  static extractCoords(text) {
    if (!text || typeof text !== 'string') return null;

    // 1. Coordenadas directas: 9.7457, -63.1764 o similar
    const directMatch = text.match(/(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/);
    if (directMatch) {
      const lat = parseFloat(directMatch[1]);
      const lng = parseFloat(directMatch[2]);
      if (lat >= 8.0 && lat <= 11.5 && lng >= -65.0 && lng <= -61.0) {
        return { lat, lng };
      }
    }

    // 2. Coordenadas en URL (@lat,lng o q=lat,lng)
    const urlMatch = text.match(/[@?&q=](-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/);
    if (urlMatch) {
      return {
        lat: parseFloat(urlMatch[1]),
        lng: parseFloat(urlMatch[2])
      };
    }

    return null;
  }

  static normalizeColor(value) {
    if (!value) return 'amarillo';
    const v = value.toLowerCase().trim();
    if (v.includes('rojo') || v.includes('crítico') || v.includes('critico') || v.includes('malo') || v.includes('grave') || v.includes('🔴')) {
      return 'rojo';
    }
    if (v.includes('verde') || v.includes('bueno') || v.includes('óptimo') || v.includes('optimo') || v.includes('excelente') || v.includes('🟢')) {
      return 'verde';
    }
    if (v.includes('amarillo') || v.includes('regular') || v.includes('intermitente') || v.includes('falla') || v.includes('🟡')) {
      return 'amarillo';
    }
    return 'amarillo';
  }
}
