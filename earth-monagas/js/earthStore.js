/**
 * Gestor de Estado y Árbol de Lugares (Places) — Google Earth Pro Web (Monagas)
 */

const STORAGE_KEY = "earth_monagas_places_v1";

export class EarthStore {
  constructor(catalogo) {
    this.catalogo = catalogo;
    this.state = this.loadFromStorage() || this.buildInitialState();
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
      if (parsed && parsed.municipios && Object.keys(parsed.municipios).length === this.catalogo.length) {
        return parsed;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {}
  }

  getParish(munId, parishId) {
    return this.state?.municipios?.[munId]?.parroquias?.[parishId] || null;
  }

  addItemToParish(munId, parishId, type, item) {
    const parish = this.getParish(munId, parishId);
    if (!parish) return;

    if (!parish[type]) parish[type] = [];
    parish[type].push(item);
    this.saveToStorage();
    return item;
  }

  updateItem(munId, parishId, type, itemId, updatedFields) {
    const parish = this.getParish(munId, parishId);
    if (!parish || !parish[type]) return null;

    const idx = parish[type].findIndex(i => i.id === itemId);
    if (idx !== -1) {
      parish[type][idx] = { ...parish[type][idx], ...updatedFields };
      this.saveToStorage();
      return parish[type][idx];
    }
    return null;
  }

  deleteItem(munId, parishId, type, itemId) {
    const parish = this.getParish(munId, parishId);
    if (!parish || !parish[type]) return false;

    parish[type] = parish[type].filter(i => i.id !== itemId);
    this.saveToStorage();
    return true;
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
