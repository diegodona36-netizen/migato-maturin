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
  // 1. San Simón (Casco Central y alrededores)
  { nombre: 'Centro / Casco Central', parroquia: 'San Simón', lat: 9.7469, lng: -63.1812 },
  { nombre: 'Barrio Obrero', parroquia: 'San Simón', lat: 9.7420, lng: -63.1750 },
  { nombre: 'Brisas del Orinoco', parroquia: 'San Simón', lat: 9.7380, lng: -63.1880 },
  { nombre: 'Alberto Ravell', parroquia: 'San Simón', lat: 9.7410, lng: -63.1950 },
  { nombre: 'Campo Ayacucho', parroquia: 'San Simón', lat: 9.7520, lng: -63.1720 },
  { nombre: '23 de Enero', parroquia: 'San Simón', lat: 9.7450, lng: -63.1860 },
  { nombre: 'Palo Negro', parroquia: 'San Simón', lat: 9.7360, lng: -63.1790 },
  { nombre: 'Las Avenidas', parroquia: 'San Simón', lat: 9.7510, lng: -63.1850 },
  { nombre: 'Negro Primero', parroquia: 'San Simón', lat: 9.7390, lng: -63.1710 },
  
  // 2. Alto de Los Godos
  { nombre: 'Los Godos I', parroquia: 'Alto de Los Godos', lat: 9.7280, lng: -63.1980 },
  { nombre: 'Los Godos II', parroquia: 'Alto de Los Godos', lat: 9.7270, lng: -63.1960 },
  { nombre: 'Los Godos I y II', parroquia: 'Alto de Los Godos', lat: 9.7280, lng: -63.1980 },
  { nombre: 'Morichal', parroquia: 'Alto de Los Godos', lat: 9.7210, lng: -63.2050 },
  { nombre: 'La Muralla', parroquia: 'Alto de Los Godos', lat: 9.7340, lng: -63.2090 },
  { nombre: 'El Abanico', parroquia: 'Alto de Los Godos', lat: 9.7300, lng: -63.1910 },
  { nombre: 'Los Guaritos I', parroquia: 'Alto de Los Godos', lat: 9.7210, lng: -63.1930 },
  { nombre: 'Los Guaritos II', parroquia: 'Alto de Los Godos', lat: 9.7190, lng: -63.1950 },
  { nombre: 'Los Guaritos III', parroquia: 'Alto de Los Godos', lat: 9.7170, lng: -63.1970 },
  { nombre: 'Los Guaritos IV', parroquia: 'Alto de Los Godos', lat: 9.7150, lng: -63.1990 },
  { nombre: 'Los Guaritos', parroquia: 'Alto de Los Godos', lat: 9.7190, lng: -63.1950 },
  { nombre: 'Fundemos', parroquia: 'Alto de Los Godos', lat: 9.7320, lng: -63.1860 },
  { nombre: 'Coropal', parroquia: 'Alto de Los Godos', lat: 9.7260, lng: -63.2010 },

  // 3. Boquerón (Zona Norte)
  { nombre: 'Tipuro I', parroquia: 'Boquerón', lat: 9.7920, lng: -63.1850 },
  { nombre: 'Tipuro II', parroquia: 'Boquerón', lat: 9.7940, lng: -63.1830 },
  { nombre: 'Tipuro', parroquia: 'Boquerón', lat: 9.7920, lng: -63.1850 },
  { nombre: 'Palma Real', parroquia: 'Boquerón', lat: 9.8010, lng: -63.1790 },
  { nombre: 'Las Avenidas / Doña Menca', parroquia: 'Boquerón', lat: 9.7750, lng: -63.1820 },
  { nombre: 'El Rincón', parroquia: 'Boquerón', lat: 9.8150, lng: -63.1700 },
  { nombre: 'San Rafael', parroquia: 'Boquerón', lat: 9.7820, lng: -63.1900 },
  { nombre: 'Boquerón Centro', parroquia: 'Boquerón', lat: 9.7850, lng: -63.1820 },
  { nombre: 'Costo Arriba', parroquia: 'Boquerón', lat: 9.8250, lng: -63.1650 },
  { nombre: 'Costo Abajo', parroquia: 'Boquerón', lat: 9.8180, lng: -63.1690 },
  { nombre: 'Viboral', parroquia: 'Boquerón', lat: 9.7960, lng: -63.1620 },

  // 4. Las Cocuizas (Zona Este)
  { nombre: 'Las Cocuizas Centro', parroquia: 'Las Cocuizas', lat: 9.7610, lng: -63.1530 },
  { nombre: 'Las Cocuizas', parroquia: 'Las Cocuizas', lat: 9.7610, lng: -63.1530 },
  { nombre: 'Sabana Grande', parroquia: 'Las Cocuizas', lat: 9.7690, lng: -63.1380 },
  { nombre: 'El Silencio', parroquia: 'Las Cocuizas', lat: 9.7540, lng: -63.1610 },
  { nombre: 'La Floresta', parroquia: 'Las Cocuizas', lat: 9.7480, lng: -63.1550 },
  { nombre: 'Los Cortijos de Cocuizas', parroquia: 'Las Cocuizas', lat: 9.7650, lng: -63.1480 },
  { nombre: 'Brisas del Aeropuerto', parroquia: 'Las Cocuizas', lat: 9.7530, lng: -63.1450 },
  { nombre: 'La Gran Victoria', parroquia: 'Las Cocuizas', lat: 9.7290, lng: -63.2380 },

  // 5. Santa Cruz (Zona Oeste)
  { nombre: 'Santa Cruz Centro', parroquia: 'Santa Cruz', lat: 9.7250, lng: -63.2200 },
  { nombre: 'Santa Cruz', parroquia: 'Santa Cruz', lat: 9.7250, lng: -63.2200 },
  { nombre: 'Zona Industrial', parroquia: 'Santa Cruz', lat: 9.7150, lng: -63.2350 },
  { nombre: 'Las Garzas', parroquia: 'Santa Cruz', lat: 9.7320, lng: -63.2250 },
  { nombre: 'Los Cortijos', parroquia: 'Santa Cruz', lat: 9.7180, lng: -63.2120 },
  { nombre: 'San Jaime', parroquia: 'Santa Cruz', lat: 9.6950, lng: -63.2100 },
  { nombre: 'La Cruz', parroquia: 'Santa Cruz', lat: 9.7350, lng: -63.2420 },

  // 6. La Pica
  { nombre: 'Caserío La Pica Centro', parroquia: 'La Pica', lat: 9.7890, lng: -63.0950 },
  { nombre: 'La Pica (Pueblo)', parroquia: 'La Pica', lat: 9.7890, lng: -63.0950 },
  { nombre: 'Vuelta Larga', parroquia: 'La Pica', lat: 9.7720, lng: -63.1150 },
  { nombre: 'La Hormiga', parroquia: 'La Pica', lat: 9.7800, lng: -63.0800 },
  { nombre: 'San Agustín', parroquia: 'La Pica', lat: 9.7650, lng: -63.0700 },
  { nombre: 'Morichal Largo', parroquia: 'La Pica', lat: 9.7550, lng: -63.0600 },

  // 7. Jusepín
  { nombre: 'Casco Central Jusepín', parroquia: 'Jusepín', lat: 9.7450, lng: -63.5020 },
  { nombre: 'Jusepín', parroquia: 'Jusepín', lat: 9.7450, lng: -63.5020 },
  { nombre: 'Campo Rojo', parroquia: 'Jusepín', lat: 9.7480, lng: -63.4980 },
  { nombre: 'Quiriquire Viejo', parroquia: 'Jusepín', lat: 9.7520, lng: -63.4920 },
  { nombre: 'La Floresta de Jusepín', parroquia: 'Jusepín', lat: 9.7420, lng: -63.5050 },

  // 8. El Furrial
  { nombre: 'Casco Central El Furrial', parroquia: 'El Furrial', lat: 9.6980, lng: -63.3420 },
  { nombre: 'El Furrial', parroquia: 'El Furrial', lat: 9.6980, lng: -63.3420 },
  { nombre: 'Corocito', parroquia: 'El Furrial', lat: 9.6920, lng: -63.3500 },
  { nombre: 'San Antonio', parroquia: 'El Furrial', lat: 9.7020, lng: -63.3350 },
  { nombre: 'Bajo El Furrial', parroquia: 'El Furrial', lat: 9.6890, lng: -63.3450 },

  // 9. San Vicente
  { nombre: 'Pueblo San Vicente', parroquia: 'San Vicente', lat: 9.7100, lng: -63.2750 },
  { nombre: 'San Vicente', parroquia: 'San Vicente', lat: 9.7100, lng: -63.2750 },
  { nombre: 'Pueblo Nuevo', parroquia: 'San Vicente', lat: 9.7150, lng: -63.2800 },
  { nombre: 'San José de Buja', parroquia: 'San Vicente', lat: 9.6500, lng: -62.8500 },

  // 10. El Corozo
  { nombre: 'Casco El Corozo', parroquia: 'El Corozo', lat: 9.6520, lng: -63.2450 },
  { nombre: 'El Corozo', parroquia: 'El Corozo', lat: 9.6520, lng: -63.2450 },
  { nombre: 'El Guamo', parroquia: 'El Corozo', lat: 9.6450, lng: -63.2500 },
  { nombre: 'Caripito Viejo', parroquia: 'El Corozo', lat: 9.6580, lng: -63.2380 }
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
    id: 'G-ENC-29879237-001',
    fecha: '2026-08-29 22:11',
    encuestador: 'Encuestador (29879237)',
    cedula: '29879237',
    parroquia: 'Santa Cruz',
    sector: 'Santa Cruz Centro',
    aguaEstado: 'verde',
    aguaProblema: 'Sin suministro continuo (> 5 días sin agua)',
    aguaObs: '',
    vialidadEstado: 'verde',
    vialidadProblema: 'Alcantarillado / drenaje colapsado o sin rejillas',
    vialidadObs: '',
    lat: 9.7250,
    lng: -63.2200,
    syncStatus: 'synced'
  },
  {
    id: 'G-ENC-V14205891-002',
    fecha: '2026-08-29 22:10',
    encuestador: 'Encuestador (V-14205891)',
    cedula: 'V-14205891',
    parroquia: 'Jusepín',
    sector: 'Campo Rojo',
    aguaEstado: 'verde',
    aguaProblema: 'Llega con baja presión (solo de noche)',
    aguaObs: 'si',
    vialidadEstado: 'amarillo',
    vialidadProblema: 'Falta total de capa asfáltica (tierra o ripio)',
    vialidadObs: '',
    lat: 9.7450,
    lng: -63.5020,
    syncStatus: 'synced'
  },
  {
    id: 'G-ENC-V14205891-003',
    fecha: '2026-08-30 00:00',
    encuestador: 'Encuestador (V-14205891)',
    cedula: 'V-14205891',
    parroquia: 'Santa Cruz',
    sector: 'Las Garzas',
    aguaEstado: 'verde',
    aguaProblema: 'Bomba o pozo subterráneo dañado',
    aguaObs: '',
    vialidadEstado: 'amarillo',
    vialidadProblema: 'Falta total de capa asfáltica (tierra o ripio)',
    vialidadObs: '',
    lat: 9.7320,
    lng: -63.2250,
    syncStatus: 'synced'
  }
];

const STORAGE_KEY = 'maturin_encuestas_data_v3';
const GOOGLE_CONFIG_KEY = 'maturin_google_sheet_config_v3';
const USER_PROFILE_KEY = 'maturin_encuestador_profile_v1';
export const OFFICIAL_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1Zyyp6Ox0wmRRtNmwcg8ge5IkZTfqGZ17gXrMWs5MY0E/edit?usp=sharing';

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
      console.warn('Error al cargar encuestas del localStorage', e);
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
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.sheetUrl || parsed.sheetUrl.includes('1cUvRb9qpUTQNUGqcFz2aJ8')) {
          parsed.sheetUrl = OFFICIAL_SHEET_URL;
          this.saveGoogleConfig(parsed);
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Error al cargar config de Google', e);
    }
    return {
      sheetUrl: OFFICIAL_SHEET_URL,
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
    const sName = (sectorName || '').toLowerCase().trim();
    const pName = (parroquiaName || '').toLowerCase().trim();

    // 1. Coincidencia exacta de nombre de sector
    const match = SECTORES_DEFAULT.find(
      s => s.nombre.toLowerCase() === sName && (!pName || s.parroquia.toLowerCase() === pName)
    ) || SECTORES_DEFAULT.find(
      s => s.nombre.toLowerCase() === sName
    ) || SECTORES_DEFAULT.find(
      s => s.nombre.toLowerCase().includes(sName) || sName.includes(s.nombre.toLowerCase())
    );

    if (match) return { lat: match.lat, lng: match.lng };

    // 2. Coordenada fija del centro de cada Parroquia (NUNCA aleatorio)
    const PARROQUIA_CENTRO = {
      'san simón': { lat: 9.7469, lng: -63.1812 },
      'san simon': { lat: 9.7469, lng: -63.1812 },
      'alto de los godos': { lat: 9.7280, lng: -63.1980 },
      'los godos': { lat: 9.7280, lng: -63.1980 },
      'boquerón': { lat: 9.7920, lng: -63.1850 },
      'boqueron': { lat: 9.7920, lng: -63.1850 },
      'las cocuizas': { lat: 9.7610, lng: -63.1530 },
      'cocuizas': { lat: 9.7610, lng: -63.1530 },
      'santa cruz': { lat: 9.7250, lng: -63.2200 },
      'la pica': { lat: 9.7890, lng: -63.0950 },
      'jusepín': { lat: 9.7450, lng: -63.5020 },
      'jusepin': { lat: 9.7450, lng: -63.5020 },
      'el furrial': { lat: 9.6980, lng: -63.3420 },
      'san vicente': { lat: 9.7100, lng: -63.2750 },
      'el corozo': { lat: 9.6520, lng: -63.2450 }
    };

    if (PARROQUIA_CENTRO[pName]) {
      return PARROQUIA_CENTRO[pName];
    }

    return { lat: MATURIN_COORDINATES.lat, lng: MATURIN_COORDINATES.lng };
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
