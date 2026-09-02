/**
 * Módulo de Integración Ultra-Robusto con Google Sheets (Soporte JSONP Nativo sin CORS)
 */

export class GoogleSheetsService {
  static getSheetId(url) {
    if (!url || typeof url !== 'string') return null;
    const matches = url.trim().match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return matches ? matches[1] : null;
  }

  static async fetchSheetData(url) {
    const sheetId = this.getSheetId(url);
    if (!sheetId) {
      throw new Error('URL de Google Sheets no válida.');
    }

    const gidMatch = url.match(/[#&?]gid=([0-9]+)/);
    const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';

    // 1. Intentar primero vía JSONP (inyección dinámica que nunca falla por CORS)
    try {
      const gvizData = await this.fetchViaJsonp(sheetId, gidParam);
      if (gvizData && gvizData.table) {
        return this.parseGvizJson(gvizData.table);
      }
    } catch (jsonpErr) {
      console.warn('JSONP falló, intentando fetch directo...', jsonpErr);
    }

    // 2. Fallback vía fetch directo a GViz
    try {
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json${gidParam}`;
      const res = await fetch(gvizUrl);
      if (res.ok) {
        const text = await res.text();
        const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\((.*)\);?/s) || text.match(/googleData\((.*)\);?/s);
        if (jsonMatch && jsonMatch[1]) {
          const parsed = JSON.parse(jsonMatch[1]);
          if (parsed && parsed.table) {
            return this.parseGvizJson(parsed.table);
          }
        }
      }
    } catch (e) {
      console.warn('Fetch GViz falló:', e);
    }

    throw new Error('No se pudo conectar con la hoja de Google Sheets.');
  }

  static fetchViaJsonp(sheetId, gidParam = '', timeoutMs = 8000) {
    return new Promise((resolve, reject) => {
      const callbackName = `migato_gviz_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const script = document.createElement('script');
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=responseHandler:${callbackName}${gidParam}`;

      let timer = setTimeout(() => {
        cleanup();
        reject(new Error('Timeout al consultar Google Sheets via JSONP'));
      }, timeoutMs);

      const cleanup = () => {
        if (timer) clearTimeout(timer);
        if (script.parentNode) script.parentNode.removeChild(script);
        delete window[callbackName];
      };

      window[callbackName] = (data) => {
        cleanup();
        resolve(data);
      };

      script.src = url;
      script.onerror = (err) => {
        cleanup();
        reject(err);
      };

      document.body.appendChild(script);
    });
  }

  static parseGvizJson(table) {
    const cols = (table.cols || []).map(c => (c.label || '').toLowerCase().trim());
    const rawRows = table.rows || [];

    if (rawRows.length === 0) return [];

    const colIndex = {
      fecha: cols.findIndex(h => h.includes('marca') || h.includes('fecha') || h.includes('timestamp')),
      encuestador: cols.findIndex(h => h.includes('encuestador') || h.includes('nombre') || h.includes('voluntario')),
      cedula: cols.findIndex(h => h.includes('cedula') || h.includes('cédula') || h.includes('ci') || h.includes('identidad')),
      parroquia: cols.findIndex(h => h.includes('parroquia') && !h.includes('sector')),
      sectorCols: cols.map((h, i) => (h.includes('sector') || h.includes('comunidad') || h.includes('zona')) ? i : -1).filter(i => i !== -1),
      aguaEstado: cols.findIndex(h => h.includes('agua') && (h.includes('estado') || h.includes('semáforo') || h.includes('semaforo') || h.includes('nivel') || h.includes('condición'))),
      aguaProblema: cols.findIndex(h => h.includes('agua') && (h.includes('problema') || h.includes('falla') || h.includes('tipo') || h.includes('motivo'))),
      aguaObs: cols.findIndex(h => h.includes('agua') && (h.includes('obs') || h.includes('detalle') || h.includes('comentario') || h.includes('nota'))),
      vialidadEstado: cols.findIndex(h => (h.includes('carretera') || h.includes('calle') || h.includes('vialidad')) && (h.includes('estado') || h.includes('semáforo') || h.includes('semaforo') || h.includes('nivel'))),
      vialidadProblema: cols.findIndex(h => (h.includes('carretera') || h.includes('calle') || h.includes('vialidad')) && (h.includes('problema') || h.includes('falla') || h.includes('tipo'))),
      vialidadObs: cols.findIndex(h => (h.includes('carretera') || h.includes('calle') || h.includes('vialidad')) && (h.includes('obs') || h.includes('detalle') || h.includes('comentario'))),
      generalObs: cols.findIndex(h => h.includes('observaci') || h.includes('testimonio') || h.includes('comentario')),
      mapsLink: cols.findIndex(h => h.includes('google') || h.includes('maps') || h.includes('ubicación') || h.includes('ubicacion') || h.includes('link') || h.includes('gps') || h.includes('coordenada')),
      lat: cols.findIndex(h => h.includes('lat') || h.includes('latitud')),
      lng: cols.findIndex(h => h.includes('lng') || h.includes('long') || h.includes('longitud'))
    };

    const surveys = [];

    rawRows.forEach((rowObj, index) => {
      const cells = (rowObj.c || []).map(cell => {
        if (!cell) return '';
        if (cell.f) return cell.f.toString().trim();
        if (cell.v !== undefined && cell.v !== null) return cell.v.toString().trim();
        return '';
      });

      let parroquia = colIndex.parroquia !== -1 ? cells[colIndex.parroquia] : '';
      if (!parroquia) {
        parroquia = 'San Simón';
      }

      let sector = '';
      for (const sIdx of colIndex.sectorCols) {
        if (cells[sIdx] && cells[sIdx].trim() !== '') {
          sector = cells[sIdx].trim();
          break;
        }
      }
      if (!sector) sector = 'Centro / Casco Central';

      const parseSemaforo = (val) => {
        if (!val) return 'verde';
        const str = val.toLowerCase();
        if (str.includes('rojo') || str.includes('critico') || str.includes('crítico') || str.includes('colapso')) return 'rojo';
        if (str.includes('amarillo') || str.includes('medio') || str.includes('regular') || str.includes('intermitente')) return 'amarillo';
        return 'verde';
      };

      const aguaEstado = parseSemaforo(colIndex.aguaEstado !== -1 ? cells[colIndex.aguaEstado] : '');
      const vialidadEstado = parseSemaforo(colIndex.vialidadEstado !== -1 ? cells[colIndex.vialidadEstado] : '');

      const aguaProblema = colIndex.aguaProblema !== -1 ? cells[colIndex.aguaProblema] : 'Sin especificar';
      const vialidadProblema = colIndex.vialidadProblema !== -1 ? cells[colIndex.vialidadProblema] : 'Sin especificar';

      const observacion = (colIndex.generalObs !== -1 ? cells[colIndex.generalObs] : '') || 
                          (colIndex.aguaObs !== -1 ? cells[colIndex.aguaObs] : '') || 
                          (colIndex.vialidadObs !== -1 ? cells[colIndex.vialidadObs] : '');

      let fecha = new Date().toISOString().replace('T', ' ').substring(0, 16);
      if (colIndex.fecha !== -1 && cells[colIndex.fecha]) {
        const rawFecha = cells[colIndex.fecha];
        if (rawFecha.includes('/')) {
          const parts = rawFecha.split(' ')[0].split('/');
          if (parts.length === 3) {
            const y = parts[2].length === 4 ? parts[2] : `20${parts[2]}`;
            const m = parts[0].padStart(2, '0');
            const d = parts[1].padStart(2, '0');
            fecha = `${y}-${m}-${d}`;
          }
        }
      }

      surveys.push({
        id: `GS-${index + 1}-${Date.now()}`,
        fecha: fecha,
        parroquia: parroquia,
        sector: sector,
        aguaEstado: aguaEstado,
        aguaProblema: aguaProblema,
        aguaObs: observacion,
        vialidadEstado: vialidadEstado,
        vialidadProblema: vialidadProblema,
        vialidadObs: observacion,
        syncStatus: 'synced',
        fuente: 'Google Sheets (Oficial)',
        encuestador: (colIndex.encuestador !== -1 ? cells[colIndex.encuestador] : '') || 'Encuestador MIGATO',
        cedula: (colIndex.cedula !== -1 ? cells[colIndex.cedula] : '') || 'N/A'
      });
    });

    return surveys;
  }
}
