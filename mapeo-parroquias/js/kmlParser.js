/**
 * Lector y Conversor Bidireccional KML / KMZ <-> Polígonos
 * Compatible 100% con Google Earth y QGIS
 */

export class KmlParserService {
  /**
   * Parsea un archivo File (KML o KMZ) y retorna un array de geometrías
   * @param {File} file 
   * @returns {Promise<Array<{nombre: string, coordenadas: Array<[lat, lng]>}>>}
   */
  static async parseFile(file) {
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".kmz")) {
      return await this.parseKmz(file);
    } else if (fileName.endsWith(".kml") || fileName.endsWith(".xml")) {
      const text = await file.text();
      return this.parseKmlText(text);
    } else {
      throw new Error("Formato no soportado. Debe ser un archivo .kml o .kmz");
    }
  }

  /**
   * Descomprime el KMZ en el navegador y extrae el archivo KML principal
   */
  static async parseKmz(file) {
    if (!window.JSZip) {
      throw new Error("La librería JSZip no está cargada.");
    }
    const zip = new window.JSZip();
    const contents = await zip.loadAsync(file);

    // Buscar el archivo KML dentro del zip
    let kmlFileName = Object.keys(contents.files).find(name => name.toLowerCase().endsWith(".kml"));
    if (!kmlFileName) {
      throw new Error("El archivo KMZ no contiene ningún archivo KML adentro.");
    }

    const kmlText = await contents.files[kmlFileName].async("text");
    return this.parseKmlText(kmlText);
  }

  /**
   * Parsea el XML de un KML y extrae los Placemarks y polígonos
   */
  static parseKmlText(kmlText) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlText, "text/xml");

    const parserError = xmlDoc.querySelector("parsererror");
    if (parserError) {
      throw new Error("El archivo KML tiene un formato XML inválido.");
    }

    const placemarks = xmlDoc.querySelectorAll("Placemark");
    const features = [];

    placemarks.forEach((pm, index) => {
      const nameEl = pm.querySelector("name");
      const name = nameEl ? nameEl.textContent.trim() : `Zona KML ${index + 1}`;

      // Buscar Polígonos
      const coordinatesEls = pm.querySelectorAll("Polygon coordinates, LineString coordinates, coordinates");
      
      coordinatesEls.forEach(coordEl => {
        const text = coordEl.textContent.trim();
        const points = [];
        
        // El formato de coordenadas en KML es: lng,lat,alt lng,lat,alt ...
        const rawCoords = text.split(/\s+/);
        rawCoords.forEach(pair => {
          const parts = pair.split(",");
          if (parts.length >= 2) {
            const lng = parseFloat(parts[0]);
            const lat = parseFloat(parts[1]);
            if (!isNaN(lat) && !isNaN(lng)) {
              points.push([lat, lng]);
            }
          }
        });

        if (points.length >= 3) {
          features.push({
            nombre: name,
            tipo: "Polígono",
            coordenadas: points
          });
        }
      });
    });

    if (features.length === 0) {
      throw new Error("No se encontraron polígonos o zonas válidas en el archivo KML.");
    }

    return features;
  }

  /**
   * Convierte la cuadrícula de hexágonos a formato KML descargable para Google Earth
   */
  static generateKmlFromHexagons(hexagons, parishName = "Parroquia") {
    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Cuadrícula Hexagonal — ${parishName}</name>
    <description>Malla de asignación territorial generada por la plataforma MIGATO</description>
    
    <Style id="hexStyleNormal">
      <LineStyle>
        <color>ff0284c7</color>
        <width>2</width>
      </LineStyle>
      <PolyStyle>
        <color>40f59e0b</color>
        <fill>1</fill>
        <outline>1</outline>
      </PolyStyle>
    </Style>

    <Style id="hexStyleActive">
      <LineStyle>
        <color>ff0f172a</color>
        <width>3</width>
      </LineStyle>
      <PolyStyle>
        <color>8010b981</color>
        <fill>1</fill>
        <outline>1</outline>
      </PolyStyle>
    </Style>
`;

    hexagons.forEach(hex => {
      const coordString = hex.vertices.map(([lat, lng]) => `${lng},${lat},0`).join(" ");
      const styleId = hex.activo ? "#hexStyleActive" : "#hexStyleNormal";

      kml += `
    <Placemark>
      <name>${hex.id}</name>
      <description>Área aprox: ${hex.areaHa} hectáreas | Estado: ${hex.activo ? "ASIGNADO / ACTIVO" : "DISPONIBLE"}</description>
      <styleUrl>${styleId}</styleUrl>
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
  </Document>
</kml>`;

    return kml;
  }

  /**
   * Exporta a GeoJSON estándar
   */
  static generateGeoJson(hexagons, parishName = "Parroquia") {
    const features = hexagons.map(hex => ({
      type: "Feature",
      properties: {
        id: hex.id,
        parroquia: parishName,
        areaHa: hex.areaHa,
        activo: hex.activo
      },
      geometry: {
        type: "Polygon",
        coordinates: [hex.vertices.map(([lat, lng]) => [lng, lat])]
      }
    }));

    return JSON.stringify({
      type: "FeatureCollection",
      features: features
    }, null, 2);
  }
}
