/**
 * Generador de Archivos KML para Google Earth y GeoJSON
 */

export class KmlExportService {
  static exportToKml(hexagons, parishData) {
    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Cuadrantes H3 — Parroquia ${parishData.nombre} (${parishData.municipio})</name>
    <description>Malla de despliegue territorial y patrullaje generada por MIGATO</description>

    <!-- Estilo: Sin Asignar -->
    <Style id="styleSinAsignar">
      <LineStyle><color>ff94a3b8</color><width>1.5</width></LineStyle>
      <PolyStyle><color>330284c7</color><fill>1</fill><outline>1</outline></PolyStyle>
    </Style>

    <!-- Estilo: En Despliegue -->
    <Style id="styleEnDespliegue">
      <LineStyle><color>ff0284c7</color><width>2.5</width></LineStyle>
      <PolyStyle><color>66f59e0b</color><fill>1</fill><outline>1</outline></PolyStyle>
    </Style>

    <!-- Estilo: Cubierto -->
    <Style id="styleCubierto">
      <LineStyle><color>ff047857</color><width>3</width></LineStyle>
      <PolyStyle><color>8010b981</color><fill>1</fill><outline>1</outline></PolyStyle>
    </Style>

    <!-- Borde Oficial de la Parroquia -->
    <Placemark>
      <name>LÍMITE OFICIAL: ${parishData.nombre}</name>
      <description>Perímetro oficial de la parroquia</description>
      <Style>
        <LineStyle><color>ffffffff</color><width>4</width></LineStyle>
        <PolyStyle><color>00ffffff</color><fill>0</fill><outline>1</outline></PolyStyle>
      </Style>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>${parishData.poligono.map(([lat, lng]) => `${lng},${lat},0`).join(" ")}</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>

    <!-- Carpeta de Cuadrantes Hexagonales -->
    <Folder>
      <name>Cuadrantes de Brigadas</name>
`;

    hexagons.forEach(hex => {
      let style = "#styleSinAsignar";
      let estadoTxt = "Disponible / Sin Asignar";

      if (hex.estado === "cubierto") {
        style = "#styleCubierto";
        estadoTxt = "100% CUBIERTO";
      } else if (hex.estado === "en_despliegue") {
        style = "#styleEnDespliegue";
        estadoTxt = "EN DESPLIEGUE";
      }

      const coordString = hex.vertices.map(([lat, lng]) => `${lng},${lat},0`).join(" ");

      kml += `
      <Placemark>
        <name>${hex.id}</name>
        <description><![CDATA[
          <h3>Cuadrante: ${hex.id}</h3>
          <p><strong>Parroquia:</strong> ${parishData.nombre}</p>
          <p><strong>Estado:</strong> ${estadoTxt}</p>
          <p><strong>Superficie:</strong> ${hex.areaHa} Hectáreas</p>
          <p><strong>Responsable:</strong> ${hex.responsable || "Pendiente por asignar"}</p>
          <p><strong>Contacto:</strong> ${hex.telefono || "N/A"}</p>
          <p><strong>Meta de Casas:</strong> ${hex.metaCasas} viviendas</p>
        ]]></description>
        <styleUrl>${style}</styleUrl>
        <Polygon>
          <outerBoundaryIs>
            <LinearRing>
              <coordinates>${coordString}</coordinates>
            </LinearRing>
          </outerBoundaryIs>
        </Polygon>
      </Placemark>`;
    });

    kml += `
    </Folder>
  </Document>
</kml>`;

    return kml;
  }

  static downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
