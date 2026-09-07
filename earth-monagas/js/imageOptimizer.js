/**
 * Módulo de Optimización, Compresión y Gestión de Imágenes
 * Google Earth Pro Web • Edición Estado Monagas
 * 
 * ARQUITECTURA CRÍTICA DE RENDIMIENTO:
 * 1. NUNCA almacenar imágenes pesadas o fotos sin procesar en LocalStorage ni en Firestore.
 *    - LocalStorage tiene límite estricto de 5 MB por dominio (una sola foto moderna en Base64 lo satura).
 *    - Firestore tiene límite duro de 1 MB por documento (fotos en Base64 causan error 400 y quiebran el guardado).
 * 2. Compresión en el cliente: Este módulo reduce fotos de celulares (4-12 MB) a imágenes WebP optimizadas (<150 KB)
 *    mediante Canvas antes de ser procesadas, manteniendo nitidez perfecta para planos y satélite.
 * 3. Almacenamiento desacoplado (VPS / Object Storage): Las imágenes se suben al VPS o Storage Bucket,
 *    y en la Base de Datos ÚNICAMENTE se guarda la URL pública (~80 bytes).
 */

export class ImageOptimizer {
  /**
   * Comprime una imagen en el navegador del usuario antes de usarla o subirla.
   * @param {File|Blob} file - Archivo de imagen original
   * @param {Object} options - Configuración de compresión
   * @returns {Promise<{blob: Blob, dataUrl: string, originalSize: number, compressedSize: number, reduction: string, width: number, height: number}>}
   */
  static async compressImage(file, options = {}) {
    const {
      maxDimension = 1280, // Máximo ancho o alto en píxeles (ideal para pantallas retina y planos)
      quality = 0.78,       // Calidad WebP/JPEG (balance óptimo nitidez/peso)
      format = "image/webp" // Formato preferido moderno
    } = options;

    if (!file || !(file instanceof Blob)) {
      throw new Error("[ImageOptimizer] Archivo inválido suministrado para compresión.");
    }

    const originalSize = file.size;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Error leyendo el archivo de imagen."));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error("No se pudo procesar la imagen cargada."));
        img.onload = () => {
          let { width, height } = img;

          // Calcular redimensionamiento manteniendo relación de aspecto
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          // Renderizar en Canvas offscreen
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");

          // Mejorar calidad de escalado
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          // Verificar soporte de WebP con fallback a JPEG
          let outputFormat = format;
          try {
            const testCanvas = document.createElement("canvas");
            testCanvas.width = 1;
            testCanvas.height = 1;
            const testUrl = testCanvas.toDataURL("image/webp");
            if (!testUrl.startsWith("data:image/webp")) {
              outputFormat = "image/jpeg";
            }
          } catch (err) {
            outputFormat = "image/jpeg";
          }

          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error("Error generando el Blob comprimido de la imagen."));
              return;
            }

            const compressedSize = blob.size;
            const reduction = originalSize > 0 
              ? `${Math.round((1 - (compressedSize / originalSize)) * 100)}%` 
              : "0%";

            const dataUrl = canvas.toDataURL(outputFormat, quality);

            console.log(`🖼️ [ImageOptimizer] Imagen optimizada: ${(originalSize / 1024).toFixed(1)} KB ➔ ${(compressedSize / 1024).toFixed(1)} KB (Ahorro: ${reduction}) [${width}x${height}]`);

            resolve({
              blob,
              dataUrl,
              originalSize,
              compressedSize,
              reduction,
              width,
              height,
              format: outputFormat
            });
          }, outputFormat, quality);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Valida si una cadena Base64 o tamaño de imagen es seguro para el navegador.
   * Alerta si se intenta meter una imagen pesada que tumbe el sistema.
   * @param {string|number} sizeOrDataUrl 
   * @param {number} maxSafeKb - Límite de seguridad en KB (default 180 KB)
   */
  static isSafeForDatabase(sizeOrDataUrl, maxSafeKb = 180) {
    let sizeBytes = 0;
    if (typeof sizeOrDataUrl === "number") {
      sizeBytes = sizeOrDataUrl;
    } else if (typeof sizeOrDataUrl === "string") {
      // Cálculo aproximado de bytes en string Base64
      sizeBytes = Math.round((sizeOrDataUrl.length * 3) / 4);
    }

    const sizeKb = sizeBytes / 1024;
    return {
      safe: sizeKb <= maxSafeKb,
      sizeKb: Math.round(sizeKb),
      maxSafeKb,
      warning: sizeKb > maxSafeKb 
        ? `⚠️ PELIGRO: La imagen pesa ${Math.round(sizeKb)} KB. Almacenar más de ${maxSafeKb} KB directamente en la Base de Datos colapsará la página móvil y superará la cuota de Firestore. Debe subirse a un VPS/Storage.` 
        : null
    };
  }

  /**
   * Helper para subir imagen a un VPS o Storage Bucket y obtener URL pública liviana.
   * @param {Blob} blob - Archivo comprimido
   * @param {string} filename - Nombre del archivo destino
   * @param {Object} config - Parámetros del servidor VPS
   */
  static async uploadToVPS(blob, filename, config = {}) {
    const vpsEndpoint = config.endpoint || "/api/upload";
    const formData = new FormData();
    formData.append("file", blob, filename || `monagas_img_${Date.now()}.webp`);
    if (config.folder) formData.append("folder", config.folder);

    try {
      const resp = await fetch(vpsEndpoint, {
        method: "POST",
        headers: config.headers || {},
        body: formData
      });

      if (!resp.ok) {
        throw new Error(`Servidor VPS respondió con HTTP ${resp.status}`);
      }

      const result = await resp.json();
      return {
        success: true,
        url: result.url || result.fileUrl || result.path,
        size: blob.size
      };
    } catch (err) {
      console.warn("Aviso en subida a VPS:", err);
      return {
        success: false,
        error: err.message
      };
    }
  }
}
