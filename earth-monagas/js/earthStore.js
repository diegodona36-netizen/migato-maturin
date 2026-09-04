/**
 * Gestor de Estado y Árbol de Lugares (Places) — Google Earth Pro Web (Monagas)
 */
import { SECTORES_LAPUENTE, SUBPARROQUIAS_GODOS } from "./geoMonagas.js";

const STORAGE_KEY = "earth_monagas_places_v2";

export class EarthStore {
  constructor(catalogo) {
    this.catalogo = catalogo;
    const loaded = this.loadFromStorage();
    this.state = loaded || this.buildInitialState();
    this.ensureAllParishes(this.state);
    this.purgeDummySectors(this.state);
  }

  ensureAllParishes(state) {
    try {
      if (!state.municipios) state.municipios = {};
      this.catalogo.forEach(mun => {
        if (!state.municipios[mun.id]) {
          state.municipios[mun.id] = {
            id: mun.id,
            nombre: mun.nombre,
            capital: mun.capital,
            color: mun.color,
            visible: true,
            parroquias: {}
          };
        }
        if (!state.municipios[mun.id].parroquias) state.municipios[mun.id].parroquias = {};
        mun.parroquias.forEach(p => {
          if (!state.municipios[mun.id].parroquias[p.id]) {
            state.municipios[mun.id].parroquias[p.id] = {
              id: p.id,
              nombre: p.nombre,
              codigo: p.codigo,
              tipo: p.tipo,
              centro: p.centro,
              zoom: p.zoom,
              limite: p.limite,
              visible: true,
              subparroquias: [],
              poligonos: [],
              rutas: [],
              marcas: [],
              superposiciones: []
            };
          } else {
            const storedP = state.municipios[mun.id].parroquias[p.id];
            if (!storedP.subparroquias) storedP.subparroquias = [];
            if (!storedP.poligonos) storedP.poligonos = [];
            if (!storedP.rutas) storedP.rutas = [];
            if (!storedP.marcas) storedP.marcas = [];
            if (!storedP.limite && p.limite) storedP.limite = p.limite;
            if (!storedP.centro && p.centro) storedP.centro = p.centro;
          }
        });
      });
    } catch (e) {
      console.warn("Error asegurando integridad de parroquias:", e);
    }
  }

  purgeDummySectors(state) {
    try {
      if (!state?.municipios) return;
      let changed = false;

      // Purgar de todas las parroquias cualquier sector o marca sintética precargada
      for (const mun of Object.values(state.municipios)) {
        for (const p of Object.values(mun.parroquias || {})) {
          if (p.poligonos && p.poligonos.length > 0) {
            const initialLen = p.poligonos.length;
            p.poligonos = p.poligonos.filter(poly => {
              const isDummy = poly.esOficial === true ||
                              (typeof poly.id === "string" && poly.id.startsWith("sec-lp-")) ||
                              SECTORES_LAPUENTE.some(s => s.id === poly.id);
              return !isDummy;
            });
            if (p.poligonos.length !== initialLen) changed = true;
          }

          if (p.marcas && p.marcas.length > 0) {
            const initialMarksLen = p.marcas.length;
            p.marcas = p.marcas.filter(m => {
              const isDummyMark = (typeof m.id === "string" && (m.id.startsWith("ref-sub-godos") || m.id.startsWith("c-lp-"))) ||
                                  m.tipo === "subparroquia_referencia";
              return !isDummyMark;
            });
            if (p.marcas.length !== initialMarksLen) changed = true;
          }
        }
      }

      if (changed) {
        this.saveToStorage();
      }
    } catch (e) {
      console.warn("Error purgando sectores sintéticos:", e);
    }
  }

  buildInitialState() {
    const root = {
      id: "root-monagas",
      nombre: "Mis Lugares (Estado Monagas)",
      visible: true,
      municipios: {}
    };

    this.catalogo.forEach(mun => {
      root.municipios[mun.id] = {
        id: mun.id,
        nombre: mun.nombre,
        capital: mun.capital,
        color: mun.color,
        visible: true,
        parroquias: {}
      };

      mun.parroquias.forEach(p => {
        root.municipios[mun.id].parroquias[p.id] = {
          id: p.id,
          nombre: p.nombre,
          codigo: p.codigo,
          tipo: p.tipo,
          centro: p.centro,
          zoom: p.zoom,
          limite: p.limite,
          visible: true,
          subparroquias: [],
          poligonos: [],
          rutas: [],
          marcas: [],
          superposiciones: []
        };
      });
    });

    return root;
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      const parsed = JSON.parse(data);
      // Validar estructura básica
      if (parsed && parsed.municipios && typeof parsed.municipios === "object") {
        return parsed;
      }
      return null;
    } catch (e) {
      console.warn("Error cargando lugares desde storage:", e);
      return null;
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {}
  }

  getParish(munId, parishId) {
    if (!this.state?.municipios?.[munId]?.parroquias?.[parishId]) {
      this.ensureAllParishes(this.state);
    }
    return this.state?.municipios?.[munId]?.parroquias?.[parishId] || null;
  }

  addItemToParish(munId, parishId, type, item) {
    const parish = this.getParish(munId, parishId);
    if (!parish) {
      console.warn(`[EarthStore] No se encontró la parroquia destino ${munId}/${parishId}`);
      return null;
    }

    if (!parish[type]) parish[type] = [];
    parish[type].push(item);
    this.saveToStorage();
    return item;
  }

  updateItem(munId, parishId, type, itemId, updatedFields) {
    let parish = this.getParish(munId, parishId);
    let idx = parish && parish[type] ? parish[type].findIndex(i => String(i.id) === String(itemId)) : -1;

    if (idx === -1) {
      const anywhere = this.findItemAnywhere(type, itemId);
      if (anywhere && anywhere.item) {
        parish = this.getParish(anywhere.munId, anywhere.parishId);
        idx = parish && parish[type] ? parish[type].findIndex(i => String(i.id) === String(itemId)) : -1;
      }
    }

    if (parish && idx !== -1) {
      parish[type][idx] = { ...parish[type][idx], ...updatedFields };
      this.saveToStorage();
      return parish[type][idx];
    }
    return null;
  }

  moveItem(fromMunId, fromParishId, toMunId, toParishId, type, itemId, updatedFields = {}) {
    // Si la parroquia de origen y destino es la misma, ejecutar actualización local
    if (fromMunId === toMunId && fromParishId === toParishId) {
      return this.updateItem(fromMunId, fromParishId, type, itemId, updatedFields);
    }

    const srcParish = this.getParish(fromMunId, fromParishId);
    const destParish = this.getParish(toMunId, toParishId);
    if (!destParish) return null;

    if (!destParish[type]) destParish[type] = [];

    let itemToMove = null;
    if (srcParish && srcParish[type]) {
      const idx = srcParish[type].findIndex(i => String(i.id) === String(itemId));
      if (idx !== -1) {
        [itemToMove] = srcParish[type].splice(idx, 1);
      }
    }

    // Si no estaba en la parroquia de origen supuesta, buscar en todo el catálogo
    if (!itemToMove) {
      const anywhere = this.findItemAnywhere(type, itemId);
      if (anywhere && anywhere.item) {
        const anyParish = this.getParish(anywhere.munId, anywhere.parishId);
        if (anyParish && anyParish[type]) {
          const idx = anyParish[type].findIndex(i => String(i.id) === String(itemId));
          if (idx !== -1) {
            [itemToMove] = anyParish[type].splice(idx, 1);
          }
        }
      }
    }

    if (!itemToMove) return null;

    const merged = { ...itemToMove, ...updatedFields, munId: toMunId, parishId: toParishId };
    destParish[type].push(merged);
    this.saveToStorage();
    return merged;
  }

  findItemAnywhere(type, itemId) {
    if (!this.state || !this.state.municipios) return null;
    for (const [munId, mun] of Object.entries(this.state.municipios)) {
      for (const [parishId, parish] of Object.entries(mun.parroquias || {})) {
        const item = (parish[type] || []).find(i => String(i.id) === String(itemId));
        if (item) {
          return { munId, parishId, item };
        }
      }
    }
    return null;
  }

  deleteItem(munId, parishId, type, itemId) {
    let parish = this.getParish(munId, parishId);
    let idx = parish && parish[type] ? parish[type].findIndex(i => String(i.id) === String(itemId)) : -1;

    if (idx === -1) {
      const anywhere = this.findItemAnywhere(type, itemId);
      if (anywhere && anywhere.item) {
        parish = this.getParish(anywhere.munId, anywhere.parishId);
        idx = parish && parish[type] ? parish[type].findIndex(i => String(i.id) === String(itemId)) : -1;
      }
    }

    if (parish && parish[type] && idx !== -1) {
      parish[type].splice(idx, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  toggleItemVisibility(munId, parishId, type, itemId) {
    const parish = this.getParish(munId, parishId);
    if (!parish || !parish[type]) return;

    const item = parish[type].find(i => i.id === itemId);
    if (item) {
      item.visible = item.visible !== false ? false : true;
      this.saveToStorage();
      return item.visible;
    }
    return true;
  }

  toggleParishVisibility(munId, parishId) {
    const parish = this.getParish(munId, parishId);
    if (!parish) return;
    parish.visible = parish.visible !== false ? false : true;
    this.saveToStorage();
    return parish.visible;
  }

  toggleMunicipalityVisibility(munId) {
    const mun = this.state?.municipios?.[munId];
    if (!mun) return;
    mun.visible = mun.visible !== false ? false : true;
    this.saveToStorage();
    return mun.visible;
  }

  exportToKml(scopeMunId = null, scopeParishId = null) {
    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2">
  <Document>
    <name>${scopeParishId ? "Parroquia " + scopeParishId : (scopeMunId ? "Municipio " + scopeMunId : "Proyecto Monagas — Google Earth Pro")}</name>
    <description>Generado con Google Earth Pro Web (Edición Monagas)</description>
`;

    const processParish = (p, munNombre) => {
      let content = `
      <Folder>
        <name>${p.nombre} (${munNombre})</name>
        <visibility>${p.visible !== false ? 1 : 0}</visibility>
`;
        // Límite Parroquial
        if (p.limite && p.limite.length > 0) {
          const bCoords = p.limite.map(([lat, lng]) => `${lng},${lat},0`).join(" ");
          content += `
        <Placemark>
          <name>Límite Oficial: ${p.nombre}</name>
          <Style><LineStyle><color>ffffffff</color><width>2.5</width></LineStyle><PolyStyle><fill>0</fill></PolyStyle></Style>
          <Polygon><outerBoundaryIs><LinearRing><coordinates>${bCoords}</coordinates></LinearRing></outerBoundaryIs></Polygon>
        </Placemark>
`;
        }

        // Polígonos de Sectores
        (p.poligonos || []).forEach(poly => {
          const coords = poly.vertices.map(([lat, lng]) => `${lng},${lat},0`).join(" ");
          const hexColor = (poly.colorRelleno || "#38bdf8").replace("#", "");
          const opacityHex = Math.round((poly.opacidad !== undefined ? poly.opacidad : 0.4) * 255).toString(16).padStart(2, "0");
          const bColorHex = (poly.colorBorde || "#ffffff").replace("#", "");
          content += `
        <Placemark>
          <name>${poly.nombre || "Sector Sin Nombre"}</name>
          <description><![CDATA[
            <h3>${poly.nombre}</h3>
            <p>${poly.descripcion || "Sin descripción"}</p>
            <p><strong>Área:</strong> ${poly.areaHa || 0} Ha</p>
            <p><strong>Perímetro:</strong> ${poly.perimetroM || 0} m</p>
          ]]></description>
          <visibility>${poly.visible !== false ? 1 : 0}</visibility>
          <Style>
            <LineStyle><color>ff${bColorHex.slice(4,6)}${bColorHex.slice(2,4)}${bColorHex.slice(0,2)}</color><width>${poly.anchoBorde || 2}</width></LineStyle>
            <PolyStyle><color>${opacityHex}${hexColor.slice(4,6)}${hexColor.slice(2,4)}${hexColor.slice(0,2)}</color><fill>1</fill></PolyStyle>
          </Style>
          <Polygon><outerBoundaryIs><LinearRing><coordinates>${coords}</coordinates></LinearRing></outerBoundaryIs></Polygon>
        </Placemark>
`;
        });

        // Rutas / Calles
        (p.rutas || []).forEach(r => {
          const coords = r.puntos.map(([lat, lng]) => `${lng},${lat},0`).join(" ");
          const strokeHex = (r.color || "#10b981").replace("#", "");
          content += `
        <Placemark>
          <name>${r.nombre || "Calle Sin Nombre"}</name>
          <description><![CDATA[
            <h3>${r.nombre}</h3>
            <p>${r.descripcion || "Sin notas"}</p>
            <p><strong>Longitud:</strong> ${r.longitudM || 0} m</p>
          ]]></description>
          <visibility>${r.visible !== false ? 1 : 0}</visibility>
          <Style>
            <LineStyle><color>ff${strokeHex.slice(4,6)}${strokeHex.slice(2,4)}${strokeHex.slice(0,2)}</color><width>${r.ancho || 4}</width></LineStyle>
          </Style>
          <LineString><coordinates>${coords}</coordinates></LineString>
        </Placemark>
`;
        });

        // Marcas / Placemarks
        (p.marcas || []).forEach(m => {
          content += `
        <Placemark>
          <name>${m.nombre || "Punto de Interés"}</name>
          <description><![CDATA[${m.descripcion || ""}]]></description>
          <visibility>${m.visible !== false ? 1 : 0}</visibility>
          <Point><coordinates>${m.lng},${m.lat},0</coordinates></Point>
        </Placemark>
`;
        });

        content += `      </Folder>\n`;
        return content;
    };

    if (scopeMunId && scopeParishId) {
      const mun = this.state.municipios[scopeMunId];
      const parish = mun?.parroquias[scopeParishId];
      if (parish) kml += processParish(parish, mun.nombre);
    } else if (scopeMunId) {
      const mun = this.state.municipios[scopeMunId];
      if (mun) {
        kml += `  <Folder><name>${mun.nombre}</name>\n`;
        Object.values(mun.parroquias).forEach(p => {
          kml += processParish(p, mun.nombre);
        });
        kml += `  </Folder>\n`;
      }
    } else {
      Object.values(this.state.municipios).forEach(mun => {
        kml += `  <Folder><name>${mun.nombre}</name>\n`;
        Object.values(mun.parroquias).forEach(p => {
          kml += processParish(p, mun.nombre);
        });
        kml += `  </Folder>\n`;
      });
    }

    kml += `  </Document>\n</kml>`;
    return kml;
  }
}
