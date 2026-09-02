/**
 * Motor Matemático para la Generación de Mallas Hexagonales Geodésicas
 */

export class HexagonEngine {
  /**
   * Determina si un punto [lat, lng] está dentro de un polígono [ [lat, lng], ... ]
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

  /**
   * Calcula el Bounding Box [minLat, minLng, maxLat, maxLng] de un polígono
   */
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
   * @param {number} centerLat 
   * @param {number} centerLng 
   * @param {number} radiusM Radio en metros
   */
  static getHexagonVertices(centerLat, centerLng, radiusM) {
    const latMeters = 111320;
    const lngMeters = 111320 * Math.cos((centerLat * Math.PI) / 180);

    const vertices = [];
    // Hexágono con orientación horizontal (flat-topped) para una cuadrícula uniforme
    for (let i = 0; i < 6; i++) {
      const angleDeg = 60 * i + 30;
      const angleRad = (angleDeg * Math.PI) / 180;
      const dLat = (radiusM * Math.sin(angleRad)) / latMeters;
      const dLng = (radiusM * Math.cos(angleRad)) / lngMeters;
      vertices.push([centerLat + dLat, centerLng + dLng]);
    }
    // Cerrar el polígono
    vertices.push(vertices[0]);
    return vertices;
  }

  /**
   * Genera la malla hexagonal para cubrir el polígono de una parroquia
   * @param {Array} polygon Array de coordenadas [[lat, lng], ...]
   * @param {number} radiusM Radio en metros (ej: 300, 600, 1200)
   * @param {string} prefix Prefijo de código (ej: "SIM")
   */
  static generateGrid(polygon, radiusM = 600, prefix = "HEX") {
    const bounds = this.getPolygonBounds(polygon);
    const centerLat = (bounds.minLat + bounds.maxLat) / 2;

    const latMeters = 111320;
    const lngMeters = 111320 * Math.cos((centerLat * Math.PI) / 180);

    // Dimensiones del hexágono geodésico
    const dxMeters = Math.sqrt(3) * radiusM;
    const dyMeters = 1.5 * radiusM;

    const dLat = dyMeters / latMeters;
    const dLng = dxMeters / lngMeters;

    const marginBuffer = 0.005; // Buffer para asegurar cobertura de bordes
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
        
        // Incluir si el centro o puntos adyacentes caen dentro del polígono
        const isIn = this.isPointInPolygon(center, polygon);
        
        // Si no está el centro, verificar si algún vértice entra para no cortar bordes
        let overlaps = isIn;
        const vertices = this.getHexagonVertices(center[0], center[1], radiusM);
        
        if (!overlaps) {
          for (let v of vertices) {
            if (this.isPointInPolygon(v, polygon)) {
              overlaps = true;
              break;
            }
          }
        }

        if (overlaps) {
          const hexId = `${prefix}-${String(hexCounter).padStart(3, "0")}`;
          hexagons.push({
            id: hexId,
            center: center,
            radiusM: radiusM,
            vertices: vertices,
            areaHa: Math.round((Math.PI * Math.pow(radiusM, 2) * 0.82699) / 10000 * 10) / 10,
            activo: false,
            color: null,
            responsable: null
          });
          hexCounter++;
        }
      }
      row++;
    }

    return hexagons;
  }
}
