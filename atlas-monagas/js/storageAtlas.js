/**
 * Persistencia y Almacenamiento de Líneas Viales — Atlas Monagas
 */

const STORAGE_KEY = "atlas_monagas_lineas_v2";

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

  static getParishLines(munId, parishId) {
    const store = this.getStore();
    const key = `${munId}__${parishId}`;
    return store[key] || [];
  }

  static saveParishLines(munId, parishId, lines) {
    const store = this.getStore();
    const key = `${munId}__${parishId}`;
    store[key] = lines;
    this.saveStore(store);
    return lines;
  }

  static getGlobalStats(catalogo) {
    const store = this.getStore();
    let totalParroquias = 0;
    let parroquiasConLineas = 0;
    let totalLineas = 0;
    let totalMetros = 0;
    let buenoM = 0;
    let regularM = 0;
    let maloM = 0;
    let criticoM = 0;

    catalogo.forEach(mun => {
      mun.parroquias.forEach(p => {
        totalParroquias++;
        const key = `${mun.id}__${p.id}`;
        const lines = store[key] || [];
        if (lines.length > 0) {
          parroquiasConLineas++;
          totalLineas += lines.length;
          lines.forEach(l => {
            const m = l.longitudM || 0;
            totalMetros += m;
            if (l.color === "verde") buenoM += m;
            else if (l.color === "amarillo") regularM += m;
            else if (l.color === "naranja") maloM += m;
            else if (l.color === "rojo") criticoM += m;
          });
        }
      });
    });

    return {
      totalMunicipios: catalogo.length,
      totalParroquias,
      parroquiasConLineas,
      totalLineas,
      totalMetros,
      buenoM,
      regularM,
      maloM,
      criticoM
    };
  }

  static exportParishKml(munNombre, parish, lines) {
    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${parish.nombre} (${munNombre}) — Trazado Vial</name>
    <description>Líneas de calles y tramos viales georreferenciados</description>

    <Style id="color_verde"><LineStyle><color>ff10b981</color><width>6</width></LineStyle></Style>
    <Style id="color_amarillo"><LineStyle><color>fff59e0b</color><width>6</width></LineStyle></Style>
    <Style id="color_naranja"><LineStyle><color>fff97316</color><width>6</width></LineStyle></Style>
    <Style id="color_rojo"><LineStyle><color>ffef4444</color><width>7</width></LineStyle></Style>

    <!-- Borde Oficial de la Parroquia -->
    <Placemark>
      <name>LÍMITE OFICIAL: ${parish.nombre}</name>
      <Style><LineStyle><color>ffffffff</color><width>3</width></LineStyle><PolyStyle><color>00ffffff</color><fill>0</fill></PolyStyle></Style>
      <Polygon><outerBoundaryIs><LinearRing><coordinates>${parish.limite.map(([lat, lng]) => `${lng},${lat},0`).join(" ")}</coordinates></LinearRing></outerBoundaryIs></Polygon>
    </Placemark>

    <Folder>
      <name>Calles y Tramos Mapeados</name>
`;

    lines.forEach(l => {
      const styleId = `#color_${l.color || "amarillo"}`;
      const coordsStr = l.puntos.map(([lat, lng]) => `${lng},${lat},0`).join(" ");

      kml += `
      <Placemark>
        <name>${l.nombre}</name>
        <description><![CDATA[
          <h3>${l.nombre}</h3>
          <p><strong>Longitud:</strong> ${l.longitudM} metros</p>
          <p><strong>Estado:</strong> ${l.color.toUpperCase()}</p>
          <p><strong>Detalle:</strong> ${l.detalle || "Sin observaciones"}</p>
        ]]></description>
        <styleUrl>${styleId}</styleUrl>
        <LineString><coordinates>${coordsStr}</coordinates></LineString>
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
