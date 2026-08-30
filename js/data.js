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
    aguaProblema: 'Suministro regular y de calidad aceptable',
    aguaObs: '',
    vialidadEstado: 'verde',
    vialidadProblema: 'Vía en buen estado y transitable',
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
    aguaObs: 'Reporte de vecinos por presión nocturna',
    vialidadEstado: 'amarillo',
    vialidadProblema: 'Falta total de capa asfáltica (tierra o ripio)',
    vialidadObs: '',
    lat: 9.7480,
    lng: -63.4980,
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
  },
  {
    id: 'G-ENC-V18942104-004',
    fecha: '2026-08-30 08:15',
    encuestador: 'Carlos Mendoza (V-18942104)',
    cedula: 'V-18942104',
    parroquia: 'San Simón',
    sector: 'Centro / Casco Central',
    aguaEstado: 'amarillo',
    aguaProblema: 'Llega con baja presión (solo de noche)',
    aguaObs: 'Falta mantenimiento en la red principal',
    vialidadEstado: 'rojo',
    vialidadProblema: 'Vía intransitable por baches / huecos profundos',
    vialidadObs: 'Baches profundos en Calle Monagas y Calle Junín',
    lat: 9.7469,
    lng: -63.1812,
    syncStatus: 'synced'
  },
  {
    id: 'G-ENC-V22451098-005',
    fecha: '2026-08-30 08:30',
    encuestador: 'Mariana López (V-22451098)',
    cedula: 'V-22451098',
    parroquia: 'San Simón',
    sector: 'Barrio Obrero',
    aguaEstado: 'rojo',
    aguaProblema: 'Sin suministro continuo (> 5 días sin agua)',
    aguaObs: 'Llevan 8 días sin agua por falla de bombeo',
    vialidadEstado: 'amarillo',
    vialidadProblema: 'Falta de alumbrado público y señalización',
    vialidadObs: '',
    lat: 9.7420,
    lng: -63.1750,
    syncStatus: 'synced'
  },
  {
    id: 'G-ENC-V19873412-006',
    fecha: '2026-08-30 08:45',
    encuestador: 'José Gregorio Rivas (V-19873412)',
    cedula: 'V-19873412',
    parroquia: 'San Simón',
    sector: '23 de Enero',
    aguaEstado: 'rojo',
    aguaProblema: 'Bomba o pozo subterráneo dañado',
    aguaObs: 'Pozo número 2 fuera de servicio',
    vialidadEstado: 'rojo',
    vialidadProblema: 'Alcantarillado / drenaje colapsado o sin rejillas',
    vialidadObs: 'Colapso de cloacas en la calle principal',
    lat: 9.7450,
    lng: -63.1860,
    syncStatus: 'synced'
  },
  {
    id: 'G-ENC-V16543981-007',
    fecha: '2026-08-30 09:00',
    encuestador: 'Ana Silva (V-16543981)',
    cedula: 'V-16543981',
    parroquia: 'San Simón',
    sector: 'Brisas del Orinoco',
    aguaEstado: 'amarillo',
    aguaProblema: 'Agua turbia / no apta para consumo',
    aguaObs: 'El agua sale con sedimentos',
    vialidadEstado: 'amarillo',
    vialidadProblema: 'Vía intransitable por baches / huecos profundos',
    vialidadObs: '',
    lat: 9.7380,
    lng: -63.1880,
    syncStatus: 'synced'
  },
  {
    id: 'G-ENC-V20341908-008',
    fecha: '2026-08-30 09:15',
    encuestador: 'Pedro Gómez (V-20341908)',
    cedula: 'V-20341908',
    parroquia: 'San Simón',
    sector: 'Las Avenidas',
    aguaEstado: 'verde',
    aguaProblema: 'Suministro regular y de calidad aceptable',
    aguaObs: '',
    vialidadEstado: 'verde',
    vialidadProblema: 'Vía en buen estado y transitable',
    vialidadObs: 'Avenida en buen estado general',
    lat: 9.7510,
    lng: -63.1850,
    syncStatus: 'synced'
  },
  {
    id: 'G-ENC-V17892341-009',
    fecha: '2026-08-30 09:30',
    encuestador: 'Luis Hernández (V-17892341)',
    cedula: 'V-17892341',
    parroquia: 'Alto de Los Godos',
    sector: 'Los Guaritos I',
    aguaEstado: 'rojo',
    aguaProblema: 'Sin suministro continuo (> 5 días sin agua)',
    aguaObs: 'Vecinos cargando agua desde tomas públicas',
    vialidadEstado: 'amarillo',
    vialidadProblema: 'Vía intransitable por baches / huecos profundos',
    vialidadObs: '',
    lat: 9.7210,
    lng: -63.1930,
    syncStatus: 'synced'
  },
  {
    id: 'G-ENC-V24561092-010',
    fecha: '2026-08-30 09:45',
    encuestador: 'Daniela Salazar (V-24561092)',
    cedula: 'V-24561092',
    parroquia: 'Alto de Los Godos',
    sector: 'Los Guaritos II',
    aguaEstado: 'rojo',
    aguaProblema: 'Llega con baja presión (solo de noche)',
    aguaObs: 'Solo llega 1 hora de madrugada',
    vialidadEstado: 'rojo',
    vialidadProblema: 'Cierre de vía por bote de aguas servidas',
    vialidadObs: 'Calle cerrada por colapso de aguas negras',
    lat: 9.7190,
    lng: -63.1950,
    syncStatus: 'synced'
  },
  {
    id: 'G-ENC-V15982134-011',
    fecha: '2026-08-30 10:00',
    encuestador: 'Rafael Martínez (V-15982134)',
    cedula: 'V-15982134',
    parroquia: 'Alto de Los Godos',
    sector: 'Morichal',
    aguaEstado: 'amarillo',
    aguaProblema: 'Bote de agua potable en vía pública',
    aguaObs: 'Tubería rota derramando agua en la calle',
    vialidadEstado: 'amarillo',
    vialidadProblema: 'Falta de alumbrado público y señalización',
    vialidadObs: '',
    lat: 9.7210,
    lng: -63.2050,
    syncStatus: 'synced'
  },
  {
    id: 'G-ENC-V18451203-012',
    fecha: '2026-08-30 10:15',
    encuestador: 'Carmen Cedeño (V-18451203)',
    cedula: 'V-18451203',
    parroquia: 'Alto de Los Godos',
    sector: 'La Muralla',
    aguaEstado: 'rojo',
    aguaProblema: 'Bomba o pozo subterráneo dañado',
    aguaObs: 'Pozo local fuera de servicio desde el martes',
    vialidadEstado: 'verde',
    vialidadProblema: 'Vía en buen estado y transitable',
    vialidadObs: '',
    lat: 9.7340,
    lng: -63.2090,
    syncStatus: 'synced'
  },
  {
    id: 'G-ENC-V21098451-013',
    fecha: '2026-08-30 10:30',
    encuestador: 'Andrés Torres (V-21098451)',
    cedula: 'V-21098451',
    parroquia: 'Alto de Los Godos',
    sector: 'Fundemos',
    aguaEstado: 'verde',
    aguaProblema: 'Suministro regular y de calidad aceptable',
    aguaObs: '',
    vialidadEstado: 'amarillo',
    vialidadProblema: 'Vía intransitable por baches / huecos profundos',
    vialidadObs: '',
    lat: 9.7320,
    lng: -63.1860,
    syncStatus: 'synced'
  },
  {
    id: 'G-ENC-V13894512-014',
    fecha: '2026-08-30 10:45',
    encuestador: 'Elena Morales (V-13894512)',
    cedula: 'V-13894512',
    parroquia: 'Boquerón',
    sector: 'Tipuro I',
    aguaEstado: 'verde',
    aguaProblema: 'Suministro regular y de calidad aceptable',
    aguaObs: 'Servicio continuo sin novedades',
    vialidadEstado: 'verde',
    vialidadProblema: 'Vía en buen estado y transitable',
    vialidadObs: '',
    lat: 9.7920,
    lng: -63.1850,
    syncStatus: 'synced'
  },
  {
    id: 'G-ENC-V25410982-015',
    fecha: '2026-08-30 11:00',
    encuestador: 'Gabriel Rondón (V-25410982)',
    cedula: 'V-25410982',
    parroquia: 'Boquerón',
    sector: 'Palma Real',
    aguaEstado: 'verde',
    aguaProblema: 'Suministro regular y de calidad aceptable',
    aguaObs: '',
    vialidadEstado: 'amarillo',
    vialidadProblema: 'Falta de alumbrado público y señalización',
    vialidadObs: 'Postes sin bombillos en redoma interior',
    lat: 9.8010,
    lng: -63.1790,
    syncStatus: 'synced'
  },
  {
    id: 'G-ENC-V19451023-016',
    fecha: '2026-08-30 11:15',
    encuestador: 'Sonia Bello (V-19451023)',
    cedula: 'V-19451023',
    parroquia: 'Boquerón',
    sector: 'El Rincón',
    aguaEstado: 'amarillo',
    aguaProblema: 'Llega con baja presión (solo de noche)',
    aguaObs: 'Presión insuficiente durante el día',
    vialidadEstado: 'rojo',
    vialidadProblema: 'Falta total de capa asfáltica (tierra o ripio)',
    vialidadObs: 'Entrada sin pavimentar llena de barro',
    lat: 9.8150,
    lng: -63.1700,
    syncStatus: 'synced'
  },
  {
    id: 'G-ENC-V17890123-017',
    fecha: '2026-08-30 11:30',
    encuestador: 'Víctor Padrón (V-17890123)',
    cedula: 'V-17890123',
    parroquia: 'Boquerón',
    sector: 'Boquerón Centro',
    aguaEstado: 'rojo',
    aguaProblema: 'Bote de agua potable en vía pública',
    aguaObs: 'Bote de agua matriz socavó el asfalto',
    vialidadEstado: 'rojo',
    vialidadProblema: 'Vía intransitable por baches / huecos profundos',
    vialidadObs: 'Cráteres enormes en vía principal',
    lat: 9.7850,
    lng: -63.1820,
    syncStatus: 'synced'
  },
  {
    id: 'G-ENC-V23984120-018',
    fecha: '2026-08-30 11:45',
    encuestador: 'Rosa Fuentes (V-23984120)',
    cedula: 'V-23984120',
    parroquia: 'Boquerón',
    sector: 'Costo Arriba',
    aguaEstado: 'rojo',
    aguaProblema: 'Sin suministro continuo (> 5 días sin agua)',
    aguaObs: 'Comunidad rural sin agua por tubería',
    vialidadEstado: 'rojo',
    vialidadProblema: 'Falta total de capa asfáltica (tierra o ripio)',
    vialidadObs: 'Carretera intransitable en época de lluvia',
    lat: 9.8250,
    lng: -63.1650,
    syncStatus: 'synced'
  },
  {
    id: 'G-ENC-V16781290-019',
    fecha: '2026-08-30 12:00',
    encuestador: 'Manuel Rojas (V-16781290)',
    cedula: 'V-16781290',
    parroquia: 'Las Cocuizas',
    sector: 'Las Cocuizas Centro',
    aguaEstado: 'amarillo',
    aguaProblema: 'Llega con baja presión (solo de noche)',
    aguaObs: '',
    vialidadEstado: 'rojo',
    vialidadProblema: 'Vía intransitable por baches / huecos profundos',
    vialidadObs: 'Huecos peligrosos frente al ambulatorio',
    lat: 9.7610,
    lng: -63.1530,
    syncStatus: 'synced'
  },
  {
    id: 'G-ENC-V22109458-020',
    fecha: '2026-08-30 12:15',
    encuestador: 'Patricia Vivas (V-22109458)',
    cedula: 'V-22109458',
    parroquia: 'Las Cocuizas',
    sector: 'Sabana Grande',
    aguaEstado: 'rojo',
    aguaProblema: 'Sin suministro continuo (> 5 días sin agua)',
    aguaObs: 'Más de 10 días comprando camiones cisterna',
    vialidadEstado: 'rojo',
    vialidadProblema: 'Alcantarillado / drenaje colapsado o sin rejillas',
    vialidadObs: 'Rejillas de drenaje robadas',
    lat: 9.7690,
    lng: -63.1380,
    syncStatus: 'synced'
  },
  {
    id: 'G-ENC-V18234901-021',
    fecha: '2026-08-30 12:30',
    encuestador: 'Héctor Campos (V-18234901)',
    cedula: 'V-18234901',
    parroquia: 'Las Cocuizas',
    sector: 'El Silencio',
    aguaEstado: 'amarillo',
    aguaProblema: 'Agua turbia / no apta para consumo',
    aguaObs: 'Agua con color amarillento',
    vialidadEstado: 'amarillo',
    vialidadProblema: 'Falta de alumbrado público y señalización',
    vialidadObs: '',
    lat: 9.7540,
    lng: -63.1610,
    syncStatus: 'synced'
  },
  {
    id: 'G-ENC-V20984512-022',
    fecha: '2026-08-30 12:45',
    encuestador: 'Lucía Navarro (V-20984512)',
    cedula: 'V-20984512',
    parroquia: 'Las Cocuizas',
    sector: 'La Floresta',
    aguaEstado: 'verde',
    aguaProblema: 'Suministro regular y de calidad aceptable',
    aguaObs: '',
    vialidadEstado: 'verde',
    vialidadProblema: 'Vía en buen estado y transitable',
    vialidadObs: '',
    lat: 9.7480,
    lng: -63.1550,
    syncStatus: 'synced'
  },
  {
    id: 'G-ENC-V14561289-023',
    fecha: '2026-08-30 13:00',
    encuestador: 'Tomás Aguilar (V-14561289)',
    cedula: 'V-14561289',
    parroquia: 'Santa Cruz',
    sector: 'Zona Industrial',
    aguaEstado: 'amarillo',
    aguaProblema: 'Llega con baja presión (solo de noche)',
    aguaObs: '',
    vialidadEstado: 'rojo',
    vialidadProblema: 'Vía intransitable por baches / huecos profundos',
    vialidadObs: 'Tráfico pesado destruyó la carpeta asfáltica',
    lat: 9.7150,
    lng: -63.2350,
    syncStatus: 'synced'
  },
  {
    id: 'G-ENC-V26109451-024',
    fecha: '2026-08-30 13:15',
    encuestador: 'Diana Pacheco (V-26109451)',
    cedula: 'V-26109451',
    parroquia: 'Santa Cruz',
    sector: 'Los Cortijos',
    aguaEstado: 'rojo',
    aguaProblema: 'Bomba o pozo subterráneo dañado',
    aguaObs: 'Bomba sumergible dañada',
    vialidadEstado: 'amarillo',
    vialidadProblema: 'Falta de alumbrado público y señalización',
    vialidadObs: '',
    lat: 9.7180,
    lng: -63.2120,
    syncStatus: 'synced'
  },
  {
    id: 'G-ENC-V15890124-025',
    fecha: '2026-08-30 13:30',
    encuestador: 'Fernando Gil (V-15890124)',
    cedula: 'V-15890124',
    parroquia: 'Jusepín',
    sector: 'Casco Central Jusepín',
    aguaEstado: 'amarillo',
    aguaProblema: 'Llega con baja presión (solo de noche)',
    aguaObs: 'Racionamiento frecuente de agua',
    vialidadEstado: 'rojo',
    vialidadProblema: 'Vía intransitable por baches / huecos profundos',
    vialidadObs: 'Tramos viales deteriorados en entrada al pueblo',
    lat: 9.7450,
    lng: -63.5020,
    syncStatus: 'synced'
  },
  {
    id: 'G-ENC-V19012845-026',
    fecha: '2026-08-30 13:45',
    encuestador: 'Yusmary Bravo (V-19012845)',
    cedula: 'V-19012845',
    parroquia: 'El Furrial',
    sector: 'Casco Central El Furrial',
    aguaEstado: 'rojo',
    aguaProblema: 'Sin suministro continuo (> 5 días sin agua)',
    aguaObs: 'Falla general de suministro en el casco central',
    vialidadEstado: 'amarillo',
    vialidadProblema: 'Falta de alumbrado público y señalización',
    vialidadObs: '',
    lat: 9.6980,
    lng: -63.3420,
    syncStatus: 'synced'
  },
  {
    id: 'G-ENC-V23451098-027',
    fecha: '2026-08-30 14:00',
    encuestador: 'Javier Colmenares (V-23451098)',
    cedula: 'V-23451098',
    parroquia: 'El Furrial',
    sector: 'Corocito',
    aguaEstado: 'rojo',
    aguaProblema: 'Bomba o pozo subterráneo dañado',
    aguaObs: 'Pozo comunal inoperativo',
    vialidadEstado: 'rojo',
    vialidadProblema: 'Falta total de capa asfáltica (tierra o ripio)',
    vialidadObs: 'Carretera de tierra en muy malas condiciones',
    lat: 9.6920,
    lng: -63.3500,
    syncStatus: 'synced'
  },
  {
    id: 'G-ENC-V17451092-028',
    fecha: '2026-08-30 14:15',
    encuestador: 'Adriana Cordero (V-17451092)',
    cedula: 'V-17451092',
    parroquia: 'La Pica',
    sector: 'Caserío La Pica Centro',
    aguaEstado: 'amarillo',
    aguaProblema: 'Llega con baja presión (solo de noche)',
    aguaObs: '',
    vialidadEstado: 'rojo',
    vialidadProblema: 'Alcantarillado / drenaje colapsado o sin rejillas',
    vialidadObs: 'Alcantarilla rota en la vía principal',
    lat: 9.7890,
    lng: -63.0950,
    syncStatus: 'synced'
  },
  {
    id: 'G-ENC-V21456789-029',
    fecha: '2026-08-30 14:30',
    encuestador: 'Germán Valera (V-21456789)',
    cedula: 'V-21456789',
    parroquia: 'San Vicente',
    sector: 'Pueblo San Vicente',
    aguaEstado: 'rojo',
    aguaProblema: 'Sin suministro continuo (> 5 días sin agua)',
    aguaObs: 'Comunidad abasteciéndose con tomas artesanales',
    vialidadEstado: 'rojo',
    vialidadProblema: 'Vía intransitable por baches / huecos profundos',
    vialidadObs: 'Capa asfáltica casi inexistente',
    lat: 9.7100,
    lng: -63.2750,
    syncStatus: 'synced'
  },
  {
    id: 'G-ENC-V18902341-030',
    fecha: '2026-08-30 14:45',
    encuestador: 'Beatriz Quintana (V-18902341)',
    cedula: 'V-18902341',
    parroquia: 'El Corozo',
    sector: 'Casco El Corozo',
    aguaEstado: 'amarillo',
    aguaProblema: 'Agua turbia / no apta para consumo',
    aguaObs: 'Agua no apta para consumo directo',
    vialidadEstado: 'rojo',
    vialidadProblema: 'Falta total de capa asfáltica (tierra o ripio)',
    vialidadObs: 'Requiere plan de asfaltado urgente',
    lat: 9.6520,
    lng: -63.2450,
    syncStatus: 'synced'
  }
];

const STORAGE_KEY = 'maturin_encuestas_data_v5';
const GOOGLE_CONFIG_KEY = 'maturin_google_sheet_config_v5';
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
        if (Array.isArray(parsed) && parsed.length >= 30) {
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
    const formatted = newSurveys.map(s => {
      const coords = (s.lat && s.lng) 
        ? { lat: Number(s.lat), lng: Number(s.lng) } 
        : this.getSectorCoords(s.sector, s.parroquia);
      return {
        ...s,
        lat: coords.lat,
        lng: coords.lng
      };
    });

    if (overwrite) {
      this.surveys = formatted;
    } else {
      const existingIds = new Set(this.surveys.map(s => s.id));
      const filtered = formatted.filter(s => !existingIds.has(s.id));
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
