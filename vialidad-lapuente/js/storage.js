/**
 * Almacenamiento Local y Compresión de Fotos para Inspección Vial
 */

export const STORAGE_KEY = "vialidad_lapuente_inspecciones_v1";

export class RoadStorageService {
  static getInspections() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.warn("Error leyendo inspecciones locales:", e);
      return {};
    }
  }

  static saveInspections(allInspections) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allInspections));
    } catch (e) {
      console.error("Error guardando inspecciones:", e);
    }
  }

  static updateTramo(tramoId, data) {
    const current = this.getInspections();
    current[tramoId] = {
      ...current[tramoId],
      ...data,
      fechaActualizacion: new Date().toISOString()
    };
    this.saveInspections(current);
    return current[tramoId];
  }

  static resetAll() {
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Compresión automática de fotos de baches en el cliente (Canvas)
   * Reduce fotos de 5MB a ~120KB para no saturar memoria ni datos móviles.
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
