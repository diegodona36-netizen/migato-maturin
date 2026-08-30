/**
 * Base de Datos y Gestión de Sectores de Maturín con Soporte Offline y Cédula
 * Contiene coordenadas reales, parroquias, datos iniciales, cola de sincronización y persistencia.
 */

export const MATURIN_COORDINATES = {
  lat: 9.7457,
  lng: -63.1764,
  zoom: 12
};

export const PARROQUIAS_MATURIN = [
  'San Simón',
  'Alto de Los Godos',
  'Boquerón',
  'Las Cocuizas',
  'Santa Cruz',
  'La Pica',
  'Jusepín',
  'El Furrial',
  'San Vicente',
  'El Corozo'
];

export const SECTORES_DEFAULT = [
  // San Simón
  { nombre: 'Centro / Casco Central', parroquia: 'San Simón', lat: 9.7469, lng: -63.1812 },
  { nombre: 'Barrio Obrero', parroquia: 'San Simón', lat: 9.7420, lng: -63.1750 },
  { nombre: 'Brisas del Orinoco', parroquia: 'San Simón', lat: 9.7380, lng: -63.1880 },
  { nombre: 'Alberto Ravell', parroquia: 'San Simón', lat: 9.7410, lng: -63.1950 },
  { nombre: 'Campo Ayacucho', parroquia: 'San Simón', lat: 9.7520, lng: -63.1720 },
  
  // Alto de Los Godos
  { nombre: 'Los Godos I y II', parroquia: 'Alto de Los Godos', lat: 9.7280, lng: -63.1980 },
  { nombre: 'Morichal', parroquia: 'Alto de Los Godos', lat: 9.7210, lng: -63.2050 },
  { nombre: 'La Muralla', parroquia: 'Alto de Los Godos', lat: 9.7340, lng: -63.2090 },
  { nombre: 'El Abanico', parroquia: 'Alto de Los Godos', lat: 9.7300, lng: -63.1910 },
  { nombre: 'Los Guaritos', parroquia: 'Alto de Los Godos', lat: 9.7190, lng: -63.1950 },

  // Boquerón
  { nombre: 'Tipuro', parroquia: 'Boquerón', lat: 9.7920, lng: -63.1850 },
  { nombre: 'Palma Real', parroquia: 'Boquerón', lat: 9.8010, lng: -63.1790 },
  { nombre: 'Las Avenidas / Doña Menca', parroquia: 'Boquerón', lat: 9.7750, lng: -63.1820 },
  { nombre: 'El Rincón', parroquia: 'Boquerón', lat: 9.8150, lng: -63.1700 },
  { nombre: 'San Rafael', parroquia: 'Boquerón', lat: 9.7820, lng: -63.1900 },

  // Las Cocuizas
  { nombre: 'Las Cocuizas', parroquia: 'Las Cocuizas', lat: 9.7610, lng: -63.1530 },
  { nombre: 'Sabana Grande', parroquia: 'Las Cocuizas', lat: 9.7690, lng: -63.1380 },
  { nombre: 'El Silencio', parroquia: 'Las Cocuizas', lat: 9.7540, lng: -63.1610 },
  { nombre: 'La Floresta', parroquia: 'Las Cocuizas', lat: 9.7480, lng: -63.1550 },

  // Santa Cruz
  { nombre: 'Santa Cruz', parroquia: 'Santa Cruz', lat: 9.7250, lng: -63.2200 },
  { nombre: 'Zona Industrial', parroquia: 'Santa Cruz', lat: 9.7150, lng: -63.2350 },
  { nombre: 'Las Garzas', parroquia: 'Santa Cruz', lat: 9.7320, lng: -63.2250 },
  { nombre: 'Los Cortijos', parroquia: 'Santa Cruz', lat: 9.7180, lng: -63.2120 },

  // Otras Parroquias (Áreas rurales y periféricas de Maturín)
  { nombre: 'La Pica (Pueblo)', parroquia: 'La Pica', lat: 9.7890, lng: -63.0950 },
  { nombre: 'Vuelta Larga', parroquia: 'La Pica', lat: 9.7720, lng: -63.1150 },
  { nombre: 'Jusepín', parroquia: 'Jusepín', lat: 9.7450, lng: -63.5020 },
  { nombre: 'El Furrial', parroquia: 'El Furrial', lat: 9.6980, lng: -63.3420 },
  { nombre: 'San Vicente', parroquia: 'San Vicente', lat: 9.7100, lng: -63.2750 },
  { nombre: 'El Corozo', parroquia: 'El Corozo', lat: 9.6520, lng: -63.2450 }
];

export const OPCIONES_PROBLEMA_AGUA = [
  'Sin suministro continuo (> 5 días sin agua)',
  'Llega con baja presión (solo de noche)',
  'Agua turbia / no apta para consumo',
  'Bomba o pozo subterráneo dañado',
  'Bote de agua potable en vía pública',
  'Suministro regular y de calidad aceptable'
];

export const OPCIONES_PROBLEMA_VIALIDAD = [
  'Vía intransitable por baches / huecos profundos',
  'Falta total de capa asfáltica (tierra o ripio)',
  'Alcantarillado / drenaje colapsado o sin rejillas',
  'Falta de alumbrado público y señalización',
  'Cierre de vía por bote de aguas servidas',
  'Vía en buen estado y transitable'
];

const INITIAL_SURVEYS = [
  {
    id: 'ENC-V14205891-001',
    fecha: '2026-08-28 09:30',
    encuestador: 'Carlos Mendoza',
    cedula: 'V-14205891',
    parroquia: 'Alto de Los Godos',
    sector: 'Los Godos I y II',
    aguaEstado: 'rojo',
    aguaProblema: 'Sin suministro continuo (> 5 días sin agua)',
    aguaObs: 'Los vecinos tienen 12 días comprando cisternas a altos costos.',
    vialidadEstado: 'amarillo',
    vialidadProblema: 'Vía intransitable por baches / huecos profundos',
    vialidadObs: 'Huecos en la calle principal cerca del ambulatorio.',
    lat: 9.7280,
    lng: -63.1980,
    syncStatus: 'synced'
  },
  {
    id: 'ENC-V18945120-002',
    fecha: '2026-08-28 10:15',
    encuestador: 'María Rondón',
    cedula: 'V-18945120',
    parroquia: 'Alto de Los Godos',
    sector: 'La Muralla',
    aguaEstado: 'rojo',
    aguaProblema: 'Bomba o pozo subterráneo dañado',
    aguaObs: 'La bomba del sector 3 se quemó hace 3 semanas.',
    vialidadEstado: 'rojo',
    vialidadProblema: 'Cierre de vía por bote de aguas servidas',
    vialidadObs: 'Colapso de cloacas en la entrada del sector.',
    lat: 9.7340,
    lng: -63.2090,
    syncStatus: 'synced'
  },
  {
    id: 'ENC-V22104567-003',
    fecha: '2026-08-28 11:00',
    encuestador: 'Luis Gómez',
    cedula: 'V-22104567',
    parroquia: 'Boquerón',
    sector: 'Tipuro',
    aguaEstado: 'amarillo',
    aguaProblema: 'Llega con baja presión (solo de noche)',
    aguaObs: 'Llega agua cada dos días pero solo después de las 11:00 PM.',
    vialidadEstado: 'verde',
    vialidadProblema: 'Vía en buen estado y transitable',
    vialidadObs: 'Avenida principal recién bacheada.',
    lat: 9.7920,
    lng: -63.1850,
    syncStatus: 'synced'
  },
  {
    id: 'ENC-V22104567-004',
    fecha: '2026-08-28 11:45',
    encuestador: 'Luis Gómez',
    cedula: 'V-22104567',
    parroquia: 'Boquerón',
    sector: 'Palma Real',
    aguaEstado: 'verde',
    aguaProblema: 'Suministro regular y de calidad aceptable',
    aguaObs: 'Tienen pozo privado en el conjunto.',
    vialidadEstado: 'amarillo',
    vialidadProblema: 'Falta de alumbrado público y señalización',
    vialidadObs: 'Muchos tramos a oscuras en la noche.',
    lat: 9.8010,
    lng: -63.1790,
    syncStatus: 'synced'
  },
  {
    id: 'ENC-V20349811-005',
    fecha: '2026-08-28 14:20',
    encuestador: 'Elena Salazar',
    cedula: 'V-20349811',
    parroquia: 'Las Cocuizas',
    sector: 'Sabana Grande',
    aguaEstado: 'rojo',
    aguaProblema: 'Agua turbia / no apta para consumo',
    aguaObs: 'Sale agua con sedimentos y olor fétido.',
    vialidadEstado: 'rojo',
    vialidadProblema: 'Falta total de capa asfáltica (tierra o ripio)',
    vialidadObs: 'Calles de tierra convertidas en lagunas por las lluvias.',
    lat: 9.7690,
    lng: -63.1380,
    syncStatus: 'synced'
  },
  {
    id: 'ENC-V20349811-006',
    fecha: '2026-08-28 15:00',
    encuestador: 'Elena Salazar',
    cedula: 'V-20349811',
    parroquia: 'Las Cocuizas',
    sector: 'Las Cocuizas',
    aguaEstado: 'amarillo',
    aguaProblema: 'Bote de agua potable en vía pública',
    aguaObs: 'Tubería matriz rota frente a la plaza.',
    vialidadEstado: 'amarillo',
    vialidadProblema: 'Vía intransitable por baches / huecos profundos',
    vialidadObs: 'Baches causados por el mismo bote de agua.',
    lat: 9.7610,
    lng: -63.1530,
    syncStatus: 'synced'
  },
  {
    id: 'ENC-V14205891-007',
    fecha: '2026-08-29 08:45',
    encuestador: 'Carlos Mendoza',
    cedula: 'V-14205891',
    parroquia: 'San Simón',
    sector: 'Centro / Casco Central',
    aguaEstado: 'verde',
    aguaProblema: 'Suministro regular y de calidad aceptable',
    aguaObs: 'Servicio continuo por red de planta potabilizadora.',
    vialidadEstado: 'amarillo',
    vialidadProblema: 'Alcantarillado / drenaje colapsado o sin rejillas',
    vialidadObs: 'Falta de tapas de bocas de visita en calle Junín y Chimborazo.',
    lat: 9.7469,
    lng: -63.1812,
    syncStatus: 'synced'
  },
  {
    id: 'ENC-V14205891-008',
    fecha: '2026-08-29 09:20',
    encuestador: 'Carlos Mendoza',
    cedula: 'V-14205891',
    parroquia: 'San Simón',
    sector: 'Barrio Obrero',
    aguaEstado: 'amarillo',
    aguaProblema: 'Llega con baja presión (solo de noche)',
    aguaObs: 'Requieren bombas hidroneumáticas para llenar tanques.',
    vialidadEstado: 'amarillo',
    vialidadProblema: 'Vía intransitable por baches / huecos profundos',
    vialidadObs: 'Calles internas deterioradas.',
    lat: 9.7420,
    lng: -63.1750,
    syncStatus: 'synced'
  },
  {
    id: 'ENC-V18945120-009',
    fecha: '2026-08-29 10:00',
    encuestador: 'María Rondón',
    cedula: 'V-18945120',
    parroquia: 'Santa Cruz',
    sector: 'Santa Cruz',
    aguaEstado: 'rojo',
    aguaProblema: 'Sin suministro continuo (> 5 días sin agua)',
    aguaObs: 'Sin agua desde el viernes pasado.',
    vialidadEstado: 'rojo',
    vialidadProblema: 'Vía intransitable por baches / huecos profundos',
    vialidadObs: 'Deterioro grave en la avenida principal.',
    lat: 9.7250,
    lng: -63.2200,
    syncStatus: 'synced'
  },
  {
    id: 'ENC-V18945120-010',
    fecha: '2026-08-29 10:45',
    encuestador: 'María Rondón',
    cedula: 'V-18945120',
    parroquia: 'Santa Cruz',
    sector: 'Zona Industrial',
    aguaEstado: 'amarillo',
    aguaProblema: 'Bomba o pozo subterráneo dañado',
    aguaObs: 'Presión baja en galpones y talleres.',
    vialidadEstado: 'rojo',
    vialidadProblema: 'Vía intransitable por baches / huecos profundos',
    vialidadObs: 'Paso de camiones pesados ha destruido el pavimento.',
    lat: 9.7150,
    lng: -63.2350,
    syncStatus: 'synced'
  },
  {
    id: 'ENC-V25612384-011',
    fecha: '2026-08-29 11:30',
    encuestador: 'Roberto Silva',
    cedula: 'V-25612384',
    parroquia: 'La Pica',
    sector: 'La Pica (Pueblo)',
    aguaEstado: 'rojo',
    aguaProblema: 'Sin suministro continuo (> 5 días sin agua)',
    aguaObs: 'Pozo de agua paralizado por falta de mantenimiento.',
    vialidadEstado: 'rojo',
    vialidadProblema: 'Falta total de capa asfáltica (tierra o ripio)',
    vialidadObs: 'Carretera principal hacia el penal y caseríos en pésimo estado.',
    lat: 9.7890,
    lng: -63.0950,
    syncStatus: 'synced'
  },
  {
    id: 'ENC-V25612384-012',
    fecha: '2026-08-29 12:15',
    encuestador: 'Roberto Silva',
    cedula: 'V-25612384',
    parroquia: 'Jusepín',
    sector: 'Jusepín',
    aguaEstado: 'amarillo',
    aguaProblema: 'Agua turbia / no apta para consumo',
    aguaObs: 'Agua chocolatosa que requiere decantación.',
    vialidadEstado: 'amarillo',
    vialidadProblema: 'Falta de alumbrado público y señalización',
    vialidadObs: 'Vía nacional con baja visibilidad nocturna.',
    lat: 9.7450,
    lng: -63.5020,
    syncStatus: 'synced'
  },
  {
    id: 'ENC-V20349811-013',
    fecha: '2026-08-29 13:00',
    encuestador: 'Elena Salazar',
    cedula: 'V-20349811',
    parroquia: 'El Furrial',
    sector: 'El Furrial',
    aguaEstado: 'rojo',
    aguaProblema: 'Sin suministro continuo (> 5 días sin agua)',
    aguaObs: 'Toda la comunidad depende de camiones cisternas.',
    vialidadEstado: 'amarillo',
    vialidadProblema: 'Vía intransitable por baches / huecos profundos',
    vialidadObs: 'Vía principal transitable con precaución, calles transversales malas.',
    lat: 9.6980,
    lng: -63.3420,
    syncStatus: 'synced'
  }
];

const STORAGE_KEY = 'maturin_encuestas_data_v2';
const GOOGLE_CONFIG_KEY = 'maturin_google_sheet_config_v2';
const USER_PROFILE_KEY = 'maturin_encuestador_profile_v1';

export class SurveyDataStore {
  constructor() {
    this.surveys = this.loadSurveys();
    this.googleConfig = this.loadGoogleConfig();
    this.userProfile = this.loadUserProfile();
  }

  loadUserProfile() {
    try {
      const saved = localStorage.getItem(USER_PROFILE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error al cargar perfil de encuestador', e);
    }
    return {
      nombre: '',
      cedula: '',
      parroquia: 'San Simón'
    };
  }

  saveUserProfile(profile) {
    this.userProfile = { ...this.userProfile, ...profile };
    try {
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(this.userProfile));
    } catch (e) {
      console.error('Error guardando perfil del encuestador', e);
    }
  }

  loadSurveys() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error al cargar encuestas del localStorage, usando datos iniciales', e);
    }
    this.saveSurveys(INITIAL_SURVEYS);
    return [...INITIAL_SURVEYS];
  }

  saveSurveys(surveys) {
    this.surveys = surveys;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(surveys));
    } catch (e) {
      console.error('Error al guardar en localStorage', e);
    }
  }

  loadGoogleConfig() {
    try {
      const saved = localStorage.getItem(GOOGLE_CONFIG_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error al cargar config de Google', e);
    }
    return {
      sheetUrl: 'https://docs.google.com/spreadsheets/d/1Zyyp6Ox0wmRRtNmwcg8ge5IkZTfqGZ17gXrMWs5MY0E/edit?usp=sharing',
      webhookUrl: '',
      autoSync: true,
      lastSync: null
    };
  }

  saveGoogleConfig(config) {
    this.googleConfig = { ...this.googleConfig, ...config };
    try {
      localStorage.setItem(GOOGLE_CONFIG_KEY, JSON.stringify(this.googleConfig));
    } catch (e) {
      console.error('Error guardando configuración de Google', e);
    }
  }

  getAll() {
    return [...this.surveys];
  }

  getPendingSync() {
    return this.surveys.filter(s => s.syncStatus === 'pending');
  }

  markAllAsSynced() {
    this.surveys = this.surveys.map(s => ({ ...s, syncStatus: 'synced' }));
    this.saveSurveys(this.surveys);
  }

  addSurvey(survey) {
    const cleanCedula = (survey.cedula || this.userProfile.cedula || 'V00000000').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    const id = `ENC-${cleanCedula}-${timestamp}`;

    const newSurvey = {
      id: id,
      fecha: survey.fecha || new Date().toISOString().replace('T', ' ').substring(0, 16),
      encuestador: survey.encuestador || this.userProfile.nombre || 'Voluntario',
      cedula: survey.cedula || this.userProfile.cedula || 'Sin Cédula',
      parroquia: survey.parroquia,
      sector: survey.sector,
      aguaEstado: survey.aguaEstado,
      aguaProblema: survey.aguaProblema,
      aguaObs: survey.aguaObs || '',
      vialidadEstado: survey.vialidadEstado,
      vialidadProblema: survey.vialidadProblema,
      vialidadObs: survey.vialidadObs || '',
      lat: survey.lat || this.getSectorCoords(survey.sector, survey.parroquia).lat,
      lng: survey.lng || this.getSectorCoords(survey.sector, survey.parroquia).lng,
      syncStatus: survey.syncStatus || 'pending' // En campo offline entra como 'pending'
    };

    this.surveys.unshift(newSurvey);
    this.saveSurveys(this.surveys);
    return newSurvey;
  }

  importSurveys(newSurveys, overwrite = false) {
    if (overwrite) {
      this.surveys = newSurveys;
    } else {
      const existingIds = new Set(this.surveys.map(s => s.id));
      const filtered = newSurveys.filter(s => !existingIds.has(s.id));
      this.surveys = [...filtered, ...this.surveys];
    }
    this.saveSurveys(this.surveys);
    return this.surveys;
  }

  deleteSurvey(id) {
    this.surveys = this.surveys.filter(s => s.id !== id);
    this.saveSurveys(this.surveys);
  }

  resetToDefault() {
    this.saveSurveys([...INITIAL_SURVEYS]);
    return this.surveys;
  }

  getSectorCoords(sectorName, parroquiaName) {
    const match = SECTORES_DEFAULT.find(
      s => s.nombre.toLowerCase() === (sectorName || '').toLowerCase()
    );
    if (match) return { lat: match.lat, lng: match.lng };

    const matchParroquia = SECTORES_DEFAULT.find(
      s => s.parroquia.toLowerCase() === (parroquiaName || '').toLowerCase()
    );
    if (matchParroquia) {
      return {
        lat: matchParroquia.lat + (Math.random() - 0.5) * 0.006,
        lng: matchParroquia.lng + (Math.random() - 0.5) * 0.006
      };
    }

    return {
      lat: MATURIN_COORDINATES.lat + (Math.random() - 0.5) * 0.015,
      lng: MATURIN_COORDINATES.lng + (Math.random() - 0.5) * 0.015
    };
  }

  getStats() {
    const total = this.surveys.length;
    const pendingCount = this.getPendingSync().length;

    if (total === 0) {
      return {
        total: 0,
        pendingCount: 0,
        agua: { verde: 0, amarillo: 0, rojo: 0, pctRojo: 0, pctAmarillo: 0, pctVerde: 0, problemas: {} },
        vialidad: { verde: 0, amarillo: 0, rojo: 0, pctRojo: 0, pctAmarillo: 0, pctVerde: 0, problemas: {} },
        parroquias: {},
        sectoresAgrupados: []
      };
    }

    const agua = { verde: 0, amarillo: 0, rojo: 0, problemas: {} };
    const vialidad = { verde: 0, amarillo: 0, rojo: 0, problemas: {} };
    const parroquias = {};
    const sectoresMap = {};

    this.surveys.forEach(s => {
      if (agua[s.aguaEstado] !== undefined) agua[s.aguaEstado]++;
      if (s.aguaProblema) {
        agua.problemas[s.aguaProblema] = (agua.problemas[s.aguaProblema] || 0) + 1;
      }

      if (vialidad[s.vialidadEstado] !== undefined) vialidad[s.vialidadEstado]++;
      if (s.vialidadProblema) {
        vialidad.problemas[s.vialidadProblema] = (vialidad.problemas[s.vialidadProblema] || 0) + 1;
      }

      const p = s.parroquia || 'Sin Parroquia';
      if (!parroquias[p]) {
        parroquias[p] = { total: 0, aguaRojo: 0, vialidadRojo: 0, sectores: new Set() };
      }
      parroquias[p].total++;
      if (s.aguaEstado === 'rojo') parroquias[p].aguaRojo++;
      if (s.vialidadEstado === 'rojo') parroquias[p].vialidadRojo++;
      parroquias[p].sectores.add(s.sector);

      const sectorKey = `${s.parroquia}__${s.sector}`;
      if (!sectoresMap[sectorKey]) {
        sectoresMap[sectorKey] = {
          nombre: s.sector,
          parroquia: s.parroquia,
          lat: s.lat,
          lng: s.lng,
          encuestas: [],
          aguaCounts: { verde: 0, amarillo: 0, rojo: 0 },
          vialidadCounts: { verde: 0, amarillo: 0, rojo: 0 }
        };
      }
      sectoresMap[sectorKey].encuestas.push(s);
      if (sectoresMap[sectorKey].aguaCounts[s.aguaEstado] !== undefined) {
        sectoresMap[sectorKey].aguaCounts[s.aguaEstado]++;
      }
      if (sectoresMap[sectorKey].vialidadCounts[s.vialidadEstado] !== undefined) {
        sectoresMap[sectorKey].vialidadCounts[s.vialidadEstado]++;
      }
    });

    const sectoresAgrupados = Object.values(sectoresMap).map(sec => {
      const getDominant = (counts) => {
        if (counts.rojo > 0 && counts.rojo >= counts.amarillo && counts.rojo >= counts.verde) return 'rojo';
        if (counts.amarillo > 0 && counts.amarillo >= counts.verde) return 'amarillo';
        if (counts.verde > 0) return 'verde';
        return 'amarillo';
      };

      return {
        ...sec,
        totalEncuestas: sec.encuestas.length,
        aguaEstadoDominante: getDominant(sec.aguaCounts),
        vialidadEstadoDominante: getDominant(sec.vialidadCounts),
        ultimaEncuesta: sec.encuestas[0]
      };
    });

    return {
      total,
      pendingCount,
      agua: {
        ...agua,
        pctRojo: Math.round((agua.rojo / total) * 100),
        pctAmarillo: Math.round((agua.amarillo / total) * 100),
        pctVerde: Math.round((agua.verde / total) * 100)
      },
      vialidad: {
        ...vialidad,
        pctRojo: Math.round((vialidad.rojo / total) * 100),
        pctAmarillo: Math.round((vialidad.amarillo / total) * 100),
        pctVerde: Math.round((vialidad.verde / total) * 100)
      },
      parroquias,
      sectoresAgrupados
    };
  }
}
