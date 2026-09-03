/**
 * Motor de Generación de Malla Hexagonal Geodésica H3
 */

export class H3GridEngine {
  /**
   * Determina si un punto [lat, lng] está dentro de un polígono
   */
  static isPointInPolygon(point, polygon) {
    const x = point[1]; // lng
    const y = point[0]; // lat
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][1], yi = polygon[i][0];
      const xj = polygon[j][1], yj = polygon[j][0];

      const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  }

  static getPolygonBounds(polygon) {
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    polygon.forEach(([lat, lng]) => {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    });
    return { minLat, minLng, maxLat, maxLng };
  }

  /**
   * Genera los 6 vértices de un hexágono regular centrado en [centerLat, centerLng]
   */
  static getHexagonVertices(centerLat, centerLng, radiusM) {
    const latMeters = 111320;
    const lngMeters = 111320 * Math.cos((centerLat * Math.PI) / 180);

    const vertices = [];
    for (let i = 0; i < 6; i++) {
      const angleDeg = 60 * i + 30; // Orientación plana superior
      const angleRad = (angleDeg * Math.PI) / 180;
      const dLat = (radiusM * Math.sin(angleRad)) / latMeters;
      const dLng = (radiusM * Math.cos(angleRad)) / lngMeters;
      vertices.push([centerLat + dLat, centerLng + dLng]);
    }
    vertices.push(vertices[0]); // Cerrar anillo
    return vertices;
  }

  /**
   * Genera la cuadrícula de hexágonos para una parroquia
   * @param {Array} polygon Coordenadas perimetrales
   * @param {number} radiusM Radio en metros (ej. 450m para urbano, 1000m para rural)
   * @param {string} codigoPrefijo Prefijo identificador
   */
  static generateHexagons(polygon, radiusM = 450, codigoPrefijo = "HEX") {
    const bounds = this.getPolygonBounds(polygon);
    const centerLat = (bounds.minLat + bounds.maxLat) / 2;

    const latMeters = 111320;
    const lngMeters = 111320 * Math.cos((centerLat * Math.PI) / 180);

    const dxMeters = Math.sqrt(3) * radiusM;
    const dyMeters = 1.5 * radiusM;

    const dLat = dyMeters / latMeters;
    const dLng = dxMeters / lngMeters;

    const marginBuffer = 0.003;
    const startLat = bounds.minLat - marginBuffer;
    const endLat = bounds.maxLat + marginBuffer;
    const startLng = bounds.minLng - marginBuffer;
    const endLng = bounds.maxLng + marginBuffer;

    const hexagons = [];
    let row = 0;
    let hexCounter = 1;

    for (let lat = startLat; lat <= endLat; lat += dLat) {
      const offsetLng = (row % 2 === 1) ? (dLng / 2) : 0;
      for (let lng = startLng + offsetLng; lng <= endLng + offsetLng; lng += dLng) {
        const center = [lat, lng];
        const vertices = this.getHexagonVertices(center[0], center[1], radiusM);

        let insideOrOverlaps = this.isPointInPolygon(center, polygon);
        if (!insideOrOverlaps) {
          for (let v of vertices) {
            if (this.isPointInPolygon(v, polygon)) {
              insideOrOverlaps = true;
              break;
            }
          }
        }

        if (insideOrOverlaps) {
          const hexId = `${codigoPrefijo}-H${String(hexCounter).padStart(2, "0")}`;
          const areaHa = Math.round((Math.PI * Math.pow(radiusM, 2) * 0.82699) / 10000 * 10) / 10;
          
          hexagons.push({
            id: hexId,
            center: center,
            vertices: vertices,
            radiusM: radiusM,
            areaHa: areaHa,
            estado: "sin_asignar", // sin_asignar, en_despliegue, cubierto
            responsable: "",
            telefono: "",
            sectorReferencia: "",
            metaCasas: Math.round(areaHa * 25) // Estimación promedio de casas
          });
          hexCounter++;
        }
      }
      row++;
    }

    return hexagons;
  }
}
