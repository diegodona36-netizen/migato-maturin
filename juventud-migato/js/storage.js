/**
 * Manejo de Almacenamiento, Respaldo y Compresión de Imágenes
 * Secretaría Regional Juvenil MIGATO
 */

export const STORAGE_KEY = "juventud_migato_reportes_v1";

export const REPORTES_INICIALES = [
  {
    id: "REP-2026-W35-CEDENO",
    fechaEntrega: "2026-08-31",
    semana: "Semana 35 (Despliegue Cedeño-Acosta-Piar)",
    municipioId: "cedeno",
    municipio: "Cedeño",
    parroquia: "Caicara",
    responsable: "José Gregorio Rodríguez",
    telefono: "0414-7891234",
    cargo: "Secretario Juvenil Municipal",
    estadoEntrega: "ENTREGADO_A_TIEMPO", // ENTREGADO_A_TIEMPO, ENTREGADO_TARDE, PENDIENTE
    
    // Eje 1: Captación 🟡
    captacion: {
      totalJovenes: 38,
      sectoresPrincipales: "La Manga, Bella Vista, El Rincón",
      rangoEdadPredominante: "16 a 24 años",
      perfil: "Estudiantes de bachillerato y jóvenes deportistas",
      observaciones: "Gran disposición de los jóvenes a sumarse a las brigadas juveniles."
    },

    // Eje 2: Conversatorios 🟡
    conversatorios: {
      totalRealizados: 2,
      totalAsistentes: 45,
      lugares: "Cancha Techada La Manga y Casa Comunal Bella Vista",
      temasTratados: "Oportunidades de estudio universitario y conformación de equipos deportivos parroquiales.",
      propuestasJuveniles: "Solicitan reactivación de torneos de fútbol sala y talleres de formación técnica."
    },

    // Eje 3: Caminatas & Despliegue 🟡
    caminatas: {
      totalRealizadas: 1,
      callesRecorridas: 8,
      casasVisitadas: 115,
      sectores: "Sector La Manga de Caicara",
      receptividad: "ALTA"
    },

    // Evaluación Cualitativa y Compromisos
    cualitativo: {
      logroPrincipal: "Consolidación del equipo parroquial de Caicara con 12 nuevos activistas fijos.",
      nudoCritico: "Dificultad de transporte para llegar a las parroquias Viento Fresco y Areo.",
      metaSiguienteSemana: "Visitar la parroquia San Félix y sumar 30 jóvenes más."
    },

    // Fotos de Evidencias (Optimadas)
    fotos: [
      {
        titulo: "Conversatorio Juvenil La Manga",
        eje: "Conversatorios",
        url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=80"
      },
      {
        titulo: "Caminata Casa por Casa Caicara",
        eje: "Caminatas",
        url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&auto=format&fit=crop&q=80"
      }
    ]
  },
  {
    id: "REP-2026-W35-ACOSTA",
    fechaEntrega: "2026-08-31",
    semana: "Semana 35 (Despliegue Cedeño-Acosta-Piar)",
    municipioId: "acosta",
    municipio: "Acosta",
    parroquia: "San Antonio",
    responsable: "Mariángel Rondón",
    telefono: "0424-9123456",
    cargo: "Secretaria Juvenil Municipal",
    estadoEntrega: "ENTREGADO_A_TIEMPO",

    captacion: {
      totalJovenes: 29,
      sectoresPrincipales: "Centro de San Antonio, San Francisco",
      rangoEdadPredominante: "18 a 26 años",
      perfil: "Jóvenes productores agrícolas y líderes de barrio",
      observaciones: "Interés en proyectos de emprendimiento juvenil."
    },

    conversatorios: {
      totalRealizados: 2,
      totalAsistentes: 34,
      lugares: "Plaza Bolívar San Antonio y Sector Miraflores",
      temasTratados: "Liderazgo comunitario, turismo y preservación ambiental.",
      propuestasJuveniles: "Crear una ruta de voluntariado juvenil ecológico."
    },

    caminatas: {
      totalRealizadas: 1,
      callesRecorridas: 6,
      casasVisitadas: 92,
      sectores: "Sector Miraflores y Calle Miranda",
      receptividad: "ALTA"
    },

    cualitativo: {
      logroPrincipal: "Conformación del núcleo juvenil en la Parroquia San Francisco.",
      nudoCritico: "Fallas recurrentes de señal telefónica para coordinar convocatorias.",
      metaSiguienteSemana: "Organizar jornada deportiva en San Francisco."
    },

    fotos: [
      {
        titulo: "Encuentro de Jóvenes en San Antonio",
        eje: "Conversatorios",
        url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80"
      }
    ]
  },
  {
    id: "REP-2026-W35-PIAR",
    fechaEntrega: "2026-08-31",
    semana: "Semana 35 (Despliegue Cedeño-Acosta-Piar)",
    municipioId: "piar",
    municipio: "Piar",
    parroquia: "Aragua",
    responsable: "Carlos Eduardo Febres",
    telefono: "0416-8345678",
    cargo: "Secretario Juvenil Municipal",
    estadoEntrega: "ENTREGADO_A_TIEMPO",

    captacion: {
      totalJovenes: 42,
      sectoresPrincipales: "Aragua Centro, Chaguaramal, Guanaguana",
      rangoEdadPredominante: "15 a 25 años",
      perfil: "Estudiantes y jóvenes deportistas",
      observaciones: "Excelente articulación con los capitanes de equipos de fútbol y kickingball."
    },

    conversatorios: {
      totalRealizados: 3,
      totalAsistentes: 56,
      lugares: "Cancha Aragua Centro, Plaza Chaguaramal",
      temasTratados: "El rol protagónico de la juventud en la reconstrucción comunitaria.",
      propuestasJuveniles: "Dotación de balones y luminarias para canchas."
    },

    caminatas: {
      totalRealizadas: 2,
      callesRecorridas: 12,
      casasVisitadas: 160,
      sectores: "Sector El Caro y Chaguaramal",
      receptividad: "MUY_ALTA"
    },

    cualitativo: {
      logroPrincipal: "Superada la meta semanal con 42 jóvenes captados y 2 caminatas intensas.",
      nudoCritico: "Necesidad de megáfonos o sonido portátil para las asambleas de calle.",
      metaSiguienteSemana: "Despliegue en las parroquias Taguaya y La Toscana."
    },

    fotos: [
      {
        titulo: "Caminata y Contacto Directo en Chaguaramal",
        eje: "Caminatas",
        url: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=600&auto=format&fit=crop&q=80"
      },
      {
        titulo: "Asamblea Juvenil en Aragua de Maturín",
        eje: "Conversatorios",
        url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&auto=format&fit=crop&q=80"
      }
    ]
  },
  {
    id: "REP-2026-W35-MATURIN",
    fechaEntrega: "2026-08-31",
    semana: "Semana 35 (Despliegue Cedeño-Acosta-Piar)",
    municipioId: "maturin",
    municipio: "Maturín",
    parroquia: "San Simón",
    responsable: "Valentina Gómez",
    telefono: "0424-8765432",
    cargo: "Secretaria Juvenil Municipal",
    estadoEntrega: "ENTREGADO_A_TIEMPO",

    captacion: {
      totalJovenes: 115,
      sectoresPrincipales: "Los Godos, Boquerón, Las Cocuizas, Centro",
      rangoEdadPredominante: "16 a 28 años",
      perfil: "Universitarios (UDO, UBV, Politécnico) y emprendedores",
      observaciones: "Gran incorporación de líderes universitarios y brigadas deportivas."
    },

    conversatorios: {
      totalRealizados: 4,
      totalAsistentes: 120,
      lugares: "Campus UDO Los Cortijos, Cancha Los Godos, Centro Cultural Las Cocuizas",
      temasTratados: "Primer Empleo, Formación Política y Digital, Plan Municipal de Juventud.",
      propuestasJuveniles: "Creación de un espacio de coworking y becas de estudio."
    },

    caminatas: {
      totalRealizadas: 3,
      callesRecorridas: 24,
      casasVisitadas: 340,
      sectores: "Sector Alto Los Godos, Sabana Grande y Brisas del Orinoco",
      receptividad: "ALTA"
    },

    cualitativo: {
      logroPrincipal: "Estructuras juveniles activadas en 5 parroquias urbanas simultáneamente.",
      nudoCritico: "Exigencia de mayor material informativo (volantes y franelas identificadas).",
      metaSiguienteSemana: "Abordar las parroquias foráneas (Jusepín, El Furrial y La Pica)."
    },

    fotos: [
      {
        titulo: "Encuentro Universitario en Boquerón",
        eje: "Conversatorios",
        url: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=600&auto=format&fit=crop&q=80"
      },
      {
        titulo: "Despliegue Juvenil en Los Godos",
        eje: "Caminatas",
        url: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=600&auto=format&fit=crop&q=80"
      }
    ]
  }
];

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
    return [...REPORTES_INICIALES];
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
