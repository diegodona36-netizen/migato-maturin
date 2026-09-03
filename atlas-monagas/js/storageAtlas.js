/**
 * Base de Datos y Motor de Persistencia Local / Nube para Atlas Monagas
 */

const STORAGE_KEY = "atlas_monagas_poligonos_v1";

export class AtlasStorage {
  static getStore() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  static saveStore(store) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) {}
  }

  static getParishData(munId, parishId) {
    const store = this.getStore();
    const key = `${munId}__${parishId}`;
    return store[key] || {
      poligonos: [],
      metaVotantes: 0,
      responsableGeneral: "",
      telefonoGeneral: ""
    };
  }

  static saveParishData(munId, parishId, data) {
    const store = this.getStore();
    const key = `${munId}__${parishId}`;
    store[key] = {
      ...this.getParishData(munId, parishId),
      ...data,
      ultimaActualizacion: new Date().toISOString()
    };
    this.saveStore(store);
    return store[key];
  }

  static getGlobalStats(catalogo) {
    const store = this.getStore();
    let totalParroquias = 0;
    let parroquiasConDatos = 0;
    let totalCuadrantes = 0;
    let cuadrantesCubiertos = 0;

    catalogo.forEach(mun => {
      mun.parroquias.forEach(p => {
        totalParroquias++;
        const key = `${mun.id}__${p.id}`;
        const pData = store[key];
        if (pData && pData.poligonos && pData.poligonos.length > 0) {
          parroquiasConDatos++;
          totalCuadrantes += pData.poligonos.length;
          cuadrantesCubiertos += pData.poligonos.filter(c => c.estado === "cubierto").length;
        }
      });
    });

    const pctGlobal = totalCuadrantes > 0 ? Math.round((cuadrantesCubiertos / totalCuadrantes) * 100) : 0;

    return {
      totalMunicipios: catalogo.length,
      totalParroquias,
      parroquiasConDatos,
      totalCuadrantes,
      cuadrantesCubiertos,
      pctGlobal
    };
  }

  static exportParishKml(munNombre, parish, poligonos) {
    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${parish.nombre} (${munNombre}) — Mapeo Territorial</name>
    <description>Plano oficial y cuadrantes generados en MIGATO Atlas Monagas</description>

    <Style id="st_verde"><LineStyle><color>ff047857</color><width>2</width></LineStyle><PolyStyle><color>8010b981</color><fill>1</fill></PolyStyle></Style>
    <Style id="st_amarillo"><LineStyle><color>ffb45309</color><width>2</width></LineStyle><PolyStyle><color>80f59e0b</color><fill>1</fill></PolyStyle></Style>
    <Style id="st_rojo"><LineStyle><color>ffb91c1c</color><width>2</width></LineStyle><PolyStyle><color>80ef4444</color><fill>1</fill></PolyStyle></Style>
    <Style id="st_disponible"><LineStyle><color>ff0284c7</color><width>1.5</width></LineStyle><PolyStyle><color>4038bdf8</color><fill>1</fill></PolyStyle></Style>

    <!-- Límite Oficial Parroquial -->
    <Placemark>
      <name>LÍMITE OFICIAL: ${parish.nombre}</name>
      <Style><LineStyle><color>ffffffff</color><width>3.5</width></LineStyle><PolyStyle><color>00ffffff</color><fill>0</fill></PolyStyle></Style>
      <Polygon><outerBoundaryIs><LinearRing><coordinates>${parish.limite.map(([lat, lng]) => `${lng},${lat},0`).join(" ")}</coordinates></LinearRing></outerBoundaryIs></Polygon>
    </Placemark>

    <Folder>
      <name>Cuadrantes y Polígonos de Trabajo</name>
`;

    poligonos.forEach(poly => {
      let st = "#st_disponible";
      if (poly.estado === "cubierto") st = "#st_verde";
      else if (poly.estado === "en_despliegue") st = "#st_amarillo";
      else if (poly.estado === "alerta") st = "#st_rojo";

      const coordsStr = poly.vertices.map(([lat, lng]) => `${lng},${lat},0`).join(" ");

      kml += `
      <Placemark>
        <name>${poly.id} — ${poly.sector || parish.nombre}</name>
        <description><![CDATA[
          <h3>${poly.id}</h3>
          <p><strong>Parroquia:</strong> ${parish.nombre}</p>
          <p><strong>Estado:</strong> ${(poly.estado || 'Disponible').toUpperCase()}</p>
          <p><strong>Responsable:</strong> ${poly.responsable || 'Pendiente'}</p>
          <p><strong>Contacto:</strong> ${poly.telefono || 'N/A'}</p>
          <p><strong>Superficie:</strong> ${poly.areaHa || 0} Ha</p>
        ]]></description>
        <styleUrl>${st}</styleUrl>
        <Polygon><outerBoundaryIs><LinearRing><coordinates>${coordsStr}</coordinates></LinearRing></outerBoundaryIs></Polygon>
      </Placemark>`;
    });

    kml += `
    </Folder>
  </Document>
</kml>`;

    return kml;
  }

  static downloadText(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
