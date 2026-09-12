/**
 * Manejo de Almacenamiento, Respaldo y Compresión de Imágenes
 * Secretaría Regional Juvenil MIGATO
 */

export const STORAGE_KEY = "juventud_migato_reportes_prod_v1";

export const REPORTES_INICIALES = [];

export class StorageService {
  static getReportes() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn("Error leyendo reportes de localStorage:", e);
    }
    return [];
  }

  static saveReportes(reportes) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reportes));
    } catch (e) {
      console.warn("Error guardando reportes:", e);
    }
  }

  static addReporte(nuevoReporte) {
    const reportes = this.getReportes();
    reportes.unshift(nuevoReporte);
    this.saveReportes(reportes);
    return reportes;
  }

  /**
   * Compresión automática de imágenes en el cliente (HTML5 Canvas)
   * Reduce fotos de 4MB a ~120KB sin pérdida apreciable de calidad.
   */
  static compressImage(file, maxWidth = 1000, quality = 0.75) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedDataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  }
}
