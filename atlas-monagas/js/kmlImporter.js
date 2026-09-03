/**
 * Lector e Importador Universal de Mapas KML y KMZ para Atlas Monagas
 */

export class KmlImporter {
  static async parseFile(file) {
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".kmz")) {
      return await this.parseKmz(file);
    } else if (fileName.endsWith(".kml")) {
      const text = await file.text();
      return this.parseKmlText(text, file.name);
    } else {
      throw new Error("Formato no soportado. Debe ser un archivo .kml o .kmz");
    }
  }

  static async parseKmz(file) {
    if (!window.JSZip) {
      throw new Error("Biblioteca de descompresión JSZip no disponible.");
    }
    const zip = await window.JSZip.loadAsync(file);
    let kmlFile = null;

    zip.forEach((relativePath, zipEntry) => {
      if (relativePath.toLowerCase().endsWith(".kml") && !kmlFile) {
        kmlFile = zipEntry;
      }
    });

    if (!kmlFile) {
      throw new Error("El archivo .kmz no contiene ningún archivo .kml en su interior.");
    }

    const kmlText = await kmlFile.async("text");
    return this.parseKmlText(kmlText, file.name);
  }

  static parseKmlText(kmlString, fileName = "Plano Importado") {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlString, "text/xml");

    const parseErrors = xmlDoc.getElementsByTagName("parsererror");
    if (parseErrors.length > 0) {
      throw new Error("El archivo KML contiene errores de sintaxis XML.");
    }

    const tramosExtraidos = [];
    const placemarks = xmlDoc.getElementsByTagName("Placemark");

    for (let i = 0; i < placemarks.length; i++) {
      const pm = placemarks[i];
      const nameEl = pm.getElementsByTagName("name")[0];
      const name = nameEl ? nameEl.textContent.trim() : `Tramo Importado ${i + 1}`;

      // Extraer coordenadas de LineString o Polygon
      let coordString = "";
      const lineString = pm.getElementsByTagName("LineString")[0];
      const polygon = pm.getElementsByTagName("Polygon")[0];

      if (lineString) {
        const coordEl = lineString.getElementsByTagName("coordinates")[0];
        if (coordEl) coordString = coordEl.textContent;
      } else if (polygon) {
        const coordEl = polygon.getElementsByTagName("coordinates")[0];
        if (coordEl) coordString = coordEl.textContent;
      }

      if (coordString) {
        const puntos = this.cleanCoordinates(coordString);
        if (puntos.length >= 2) {
          const longitudM = this.calculateLengthMeters(puntos);
          tramosExtraidos.push({
            id: `IMP-${Date.now()}-${i}`,
            nombre: name,
            color: "amarillo", // Por defecto regular para revisar
            longitudM: longitudM,
            puntos: puntos,
            origen: fileName,
            fecha: new Date().toISOString()
          });
        }
      }
    }

    return tramosExtraidos;
  }

  static cleanCoordinates(coordString) {
    const raw = coordString.trim().split(/\s+/);
    const puntos = [];

    for (const item of raw) {
      const parts = item.split(",");
      if (parts.length >= 2) {
        const lng = parseFloat(parts[0]);
        const lat = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          puntos.push([lat, lng]);
        }
      }
    }
    return puntos;
  }

  static calculateLengthMeters(points) {
    let total = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = L.latLng(points[i][0], points[i][1]);
      const p2 = L.latLng(points[i + 1][0], points[i + 1][1]);
      total += p1.distanceTo(p2);
    }
    return Math.round(total);
  }
}
