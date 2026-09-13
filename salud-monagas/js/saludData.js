/**
 * MIGATO • Módulo 5: Pre-Diagnóstico de Infraestructura Sanitaria y Hospitalaria
 * Catálogo Territorial de Monagas (13 Municipios, 45 Parroquias), Normativa MPPS y Registros Base
 */

(function(window) {
  'use strict';

const CATALOGO_TERRITORIAL = [
  {
    "id": "maturin",
    "nombre": "Municipio Maturín",
    "capital": "Maturín",
    "parroquias": [
      {
        "id": "san-simon",
        "nombre": "San Simón (Casco Central)",
        "codigo": "MAT-SIM",
        "centro": [
          9.7469,
          -63.1812
        ],
        "sectores": [
          "Casco Central",
          "Palo Negro",
          "Brisas del Orinoco",
          "La Muralla"
        ]
      },
      {
        "id": "alto-de-los-godos",
        "nombre": "Alto de Los Godos",
        "codigo": "MAT-GOD",
        "centro": [
          9.728,
          -63.206
        ],
        "sectores": [
          "La Puente",
          "Los Godos 1 y 2",
          "Morichal",
          "Fundemos",
          "Los Guaros"
        ]
      },
      {
        "id": "boqueron",
        "nombre": "Boquerón",
        "codigo": "MAT-BOQ",
        "centro": [
          9.788,
          -63.19
        ],
        "sectores": [
          "Tipuro 1 y 2",
          "Palma Real",
          "Los Cortijos",
          "Costo Arriba",
          "Viboral"
        ]
      },
      {
        "id": "las-cocuizas",
        "nombre": "Las Cocuizas",
        "codigo": "MAT-COC",
        "centro": [
          9.756,
          -63.146
        ],
        "sectores": [
          "Sabana Grande",
          "El Silencio",
          "El Nazareno",
          "Aeropuerto"
        ]
      },
      {
        "id": "santa-cruz",
        "nombre": "Santa Cruz (La Cruz)",
        "codigo": "MAT-STC",
        "centro": [
          9.712,
          -63.238
        ],
        "sectores": [
          "La Gran Victoria",
          "Santa Cruz Centro",
          "Zona Industrial"
        ]
      },
      {
        "id": "san-vicente",
        "nombre": "San Vicente",
        "codigo": "MAT-VIC",
        "centro": [
          9.728,
          -63.285
        ],
        "sectores": [
          "Pueblo Nuevo",
          "San Vicente Centro",
          "Corocito"
        ]
      },
      {
        "id": "la-pica",
        "nombre": "La Pica",
        "codigo": "MAT-PIC",
        "centro": [
          9.775,
          -63.078
        ],
        "sectores": [
          "La Pica Centro",
          "Vuelta Larga",
          "El Rincón"
        ]
      },
      {
        "id": "jusepin",
        "nombre": "Jusepín",
        "codigo": "MAT-JUS",
        "centro": [
          9.748,
          -63.502
        ],
        "sectores": [
          "Campo Rojo",
          "Jusepín Centro",
          "La Horqueta"
        ]
      },
      {
        "id": "el-furrial",
        "nombre": "El Furrial",
        "codigo": "MAT-FUR",
        "centro": [
          9.725,
          -63.365
        ],
        "sectores": [
          "El Furrial Centro",
          "Corocito",
          "Barrio Obrero"
        ]
      },
      {
        "id": "el-corozo",
        "nombre": "El Corozo",
        "codigo": "MAT-COR",
        "centro": [
          9.675,
          -63.215
        ],
        "sectores": [
          "El Corozo Centro",
          "Amana",
          "Morichal"
        ]
      },
      {
        "id": "san-simon-sur",
        "nombre": "San Simón Sur",
        "codigo": "MAT-SUR",
        "centro": [
          9.3636,
          -62.8426
        ],
        "sectores": [
          "Santa Inés",
          "La Orquídea del Sur",
          "Amana del Tamarindo",
          "Morichal",
          "El Rincón"
        ]
      }
    ]
  },
  {
    "id": "piar",
    "nombre": "Municipio Piar",
    "capital": "Aragua de Maturín",
    "parroquias": [
      {
        "id": "aragua",
        "nombre": "Aragua de Maturín",
        "codigo": "PIA-ARA",
        "centro": [
          9.972,
          -63.485
        ],
        "sectores": [
          "Aragua Centro",
          "El Caro",
          "Chaguaramal"
        ]
      },
      {
        "id": "aparicio",
        "nombre": "Aparicio",
        "codigo": "PIA-APA",
        "centro": [
          9.985,
          -63.565
        ],
        "sectores": [
          "Aparicio Centro",
          "La Loma"
        ]
      },
      {
        "id": "chaguaramal",
        "nombre": "Chaguaramal",
        "codigo": "PIA-CHG",
        "centro": [
          9.945,
          -63.415
        ],
        "sectores": [
          "Chaguaramal Centro"
        ]
      },
      {
        "id": "el-pinto",
        "nombre": "El Pinto",
        "codigo": "PIA-PIN",
        "centro": [
          9.915,
          -63.475
        ],
        "sectores": [
          "El Pinto Centro"
        ]
      },
      {
        "id": "guanaguana",
        "nombre": "Guanaguana",
        "codigo": "PIA-GUA",
        "centro": [
          10.055,
          -63.525
        ],
        "sectores": [
          "Guanaguana Centro",
          "Ruinas"
        ]
      },
      {
        "id": "la-toscana",
        "nombre": "La Toscana",
        "codigo": "PIA-TOS",
        "centro": [
          9.855,
          -63.425
        ],
        "sectores": [
          "La Toscana Centro",
          "Chupulún"
        ]
      },
      {
        "id": "taguaya",
        "nombre": "Taguaya",
        "codigo": "PIA-TAG",
        "centro": [
          9.905,
          -63.355
        ],
        "sectores": [
          "Taguaya Centro"
        ]
      }
    ]
  },
  {
    "id": "caripe",
    "nombre": "Municipio Caripe",
    "capital": "Caripe",
    "parroquias": [
      {
        "id": "caripe-centro",
        "nombre": "Caripe",
        "codigo": "CAR-CEN",
        "centro": [
          10.178,
          -63.498
        ],
        "sectores": [
          "Caripe Centro",
          "El Guácharo",
          "Teresén"
        ]
      },
      {
        "id": "el-guacharo",
        "nombre": "El Guácharo",
        "codigo": "CAR-GUA",
        "centro": [
          10.198,
          -63.555
        ],
        "sectores": [
          "Cueva del Guácharo"
        ]
      },
      {
        "id": "la-guanota",
        "nombre": "La Guanota",
        "codigo": "CAR-GNT",
        "centro": [
          10.215,
          -63.505
        ],
        "sectores": [
          "La Guanota Centro"
        ]
      },
      {
        "id": "sabana-de-piedra",
        "nombre": "Sabana de Piedra",
        "codigo": "CAR-SAB",
        "centro": [
          10.235,
          -63.445
        ],
        "sectores": [
          "Sabana de Piedra"
        ]
      },
      {
        "id": "san-agustin",
        "nombre": "San Agustín",
        "codigo": "CAR-SAG",
        "centro": [
          10.165,
          -63.545
        ],
        "sectores": [
          "San Agustín Centro",
          "Cascadas"
        ]
      },
      {
        "id": "teresen",
        "nombre": "Teresén",
        "codigo": "CAR-TER",
        "centro": [
          10.145,
          -63.465
        ],
        "sectores": [
          "Teresén Centro"
        ]
      }
    ]
  },
  {
    "id": "cedeno",
    "nombre": "Municipio Cedeño",
    "capital": "Caicara",
    "parroquias": [
      {
        "id": "caicara",
        "nombre": "Caicara (Capital Cedeño)",
        "codigo": "CED-CAI",
        "centro": [
          9.822,
          -63.615
        ],
        "sectores": [
          "La Manga",
          "Bella Vista",
          "El Rincón",
          "Pueblo Nuevo"
        ]
      },
      {
        "id": "areo",
        "nombre": "Areo",
        "codigo": "CED-ARE",
        "centro": [
          9.782,
          -63.745
        ],
        "sectores": [
          "Areo Centro"
        ]
      },
      {
        "id": "san-felix",
        "nombre": "San Félix de Cantalicio",
        "codigo": "CED-SFX",
        "centro": [
          9.892,
          -63.565
        ],
        "sectores": [
          "San Félix Centro"
        ]
      },
      {
        "id": "viento-fresco",
        "nombre": "Viento Fresco",
        "codigo": "CED-VFR",
        "centro": [
          9.712,
          -63.685
        ],
        "sectores": [
          "Viento Fresco Centro"
        ]
      }
    ]
  },
  {
    "id": "libertador",
    "nombre": "Municipio Libertador",
    "capital": "Temblador",
    "parroquias": [
      {
        "id": "temblador",
        "nombre": "Temblador",
        "codigo": "LIB-TEM",
        "centro": [
          9.025,
          -62.715
        ],
        "sectores": [
          "Temblador Centro",
          "Las Brisas"
        ]
      },
      {
        "id": "chaguaramas",
        "nombre": "Chaguaramas",
        "codigo": "LIB-CHG",
        "centro": [
          9.095,
          -62.675
        ],
        "sectores": [
          "Chaguaramas Centro"
        ]
      },
      {
        "id": "las-alhuacas",
        "nombre": "Las Alhuacas",
        "codigo": "LIB-ALH",
        "centro": [
          8.955,
          -62.785
        ],
        "sectores": [
          "Las Alhuacas Centro"
        ]
      },
      {
        "id": "tabasca",
        "nombre": "Tabasca",
        "codigo": "LIB-TAB",
        "centro": [
          9.155,
          -62.615
        ],
        "sectores": [
          "Tabasca Centro"
        ]
      }
    ]
  },
  {
    "id": "ezequiel-zamora",
    "nombre": "Municipio Ezequiel Zamora",
    "capital": "Punta de Mata",
    "parroquias": [
      {
        "id": "punta-de-mata",
        "nombre": "Punta de Mata",
        "codigo": "ZAM-PUN",
        "centro": [
          9.715,
          -63.628
        ],
        "sectores": [
          "Punta de Mata Centro",
          "19 de Abril"
        ]
      },
      {
        "id": "el-tejero",
        "nombre": "El Tejero",
        "codigo": "ZAM-TEJ",
        "centro": [
          9.685,
          -63.535
        ],
        "sectores": [
          "El Tejero Centro",
          "Casupal"
        ]
      }
    ]
  },
  {
    "id": "acosta",
    "nombre": "Municipio Acosta",
    "capital": "San Antonio",
    "parroquias": [
      {
        "id": "san-antonio",
        "nombre": "San Antonio de Maturín (Capayacuar)",
        "codigo": "ACO-ANT",
        "centro": [
          10.005,
          -63.712
        ],
        "sectores": [
          "Centro",
          "Miraflores"
        ]
      },
      {
        "id": "san-francisco",
        "nombre": "San Francisco de Maturín",
        "codigo": "ACO-SFC",
        "centro": [
          10.065,
          -63.675
        ],
        "sectores": [
          "San Francisco Centro"
        ]
      }
    ]
  },
  {
    "id": "punceres",
    "nombre": "Municipio Punceres",
    "capital": "Quiriquire",
    "parroquias": [
      {
        "id": "quiriquire",
        "nombre": "Quiriquire",
        "codigo": "PUN-QUI",
        "centro": [
          9.975,
          -63.215
        ],
        "sectores": [
          "Quiriquire Centro",
          "Miraflores"
        ]
      },
      {
        "id": "cachipo",
        "nombre": "Cachipo",
        "codigo": "PUN-CAC",
        "centro": [
          9.915,
          -63.235
        ],
        "sectores": [
          "Cachipo Centro"
        ]
      }
    ]
  },
  {
    "id": "santa-barbara",
    "nombre": "Municipio Santa Bárbara",
    "capital": "Santa Bárbara",
    "parroquias": [
      {
        "id": "santa-barbara-centro",
        "nombre": "Santa Bárbara",
        "codigo": "SBA-CEN",
        "centro": [
          9.585,
          -63.615
        ],
        "sectores": [
          "Santa Bárbara Centro",
          "Tapirito"
        ]
      },
      {
        "id": "moron",
        "nombre": "Morón",
        "codigo": "SBA-MOR",
        "centro": [
          9.525,
          -63.585
        ],
        "sectores": [
          "Morón Centro"
        ]
      }
    ]
  },
  {
    "id": "sotillo",
    "nombre": "Municipio Sotillo",
    "capital": "Barrancas",
    "parroquias": [
      {
        "id": "barrancas",
        "nombre": "Barrancas del Orinoco",
        "codigo": "SOT-BAR",
        "centro": [
          8.705,
          -62.185
        ],
        "sectores": [
          "Barrancas Centro",
          "Malecón"
        ]
      },
      {
        "id": "los-barrancos",
        "nombre": "Los Barrancos de Fajardo",
        "codigo": "SOT-FAJ",
        "centro": [
          8.395,
          -62.665
        ],
        "sectores": [
          "Los Barrancos Centro",
          "Paso de Chalanas"
        ]
      }
    ]
  },
  {
    "id": "bolivar",
    "nombre": "Municipio Bolívar",
    "capital": "Caripito",
    "parroquias": [
      {
        "id": "caripito",
        "nombre": "Caripito",
        "codigo": "BOL-CAR",
        "centro": [
          10.125,
          -63.105
        ],
        "sectores": [
          "Casco Central",
          "Río San Juan",
          "El Rincón"
        ]
      }
    ]
  },
  {
    "id": "aguasay",
    "nombre": "Municipio Aguasay",
    "capital": "Aguasay",
    "parroquias": [
      {
        "id": "aguasay-centro",
        "nombre": "Aguasay",
        "codigo": "AGU-CEN",
        "centro": [
          9.425,
          -63.815
        ],
        "sectores": [
          "Aguasay Centro",
          "Comunidades Kari'ña"
        ]
      }
    ]
  },
  {
    "id": "uracoa",
    "nombre": "Municipio Uracoa",
    "capital": "Uracoa",
    "parroquias": [
      {
        "id": "uracoa-centro",
        "nombre": "Uracoa",
        "codigo": "URA-CEN",
        "centro": [
          8.745,
          -62.345
        ],
        "sectores": [
          "Uracoa Centro",
          "El Bajo"
        ]
      }
    ]
  }
];

const CATALOGO_TIPOS_ESTABLECIMIENTO = [
  {
    id: 'comunal',
    nombre: 'Red Comunal / Barrio Adentro',
    subtipos: [
      { id: 'cpt1', codigo: 'CPT I', nombre: 'Consultorio Popular Tipo I' },
      { id: 'cpt2', codigo: 'CPT II', nombre: 'Consultorio Popular Tipo II' },
      { id: 'cpt3', codigo: 'CPT III', nombre: 'Consultorio Popular Tipo III' },
      { id: 'cdi', codigo: 'CDI', nombre: 'Centro de Diagnóstico Integral' },
      { id: 'sri', codigo: 'SRI', nombre: 'Sala de Rehabilitación Integral' }
    ]
  },
  {
    id: 'ambulatoria',
    nombre: 'Red Ambulatoria Tradicional',
    subtipos: [
      { id: 'amb_r1', codigo: 'Amb. Rural I', nombre: 'Ambulatorio Rural Tipo I' },
      { id: 'amb_r2', codigo: 'Amb. Rural II', nombre: 'Ambulatorio Rural Tipo II' },
      { id: 'amb_u1', codigo: 'Amb. Urbano I', nombre: 'Ambulatorio Urbano Tipo I' },
      { id: 'amb_u2', codigo: 'Amb. Urbano II', nombre: 'Ambulatorio Urbano Tipo II' },
      { id: 'amb_u3', codigo: 'Amb. Urbano III', nombre: 'Ambulatorio Urbano Tipo III' }
    ]
  },
  {
    id: 'hospitalaria',
    nombre: 'Red Hospitalaria Especializada',
    subtipos: [
      { id: 'hosp_t1', codigo: 'Hospital Tipo I', nombre: 'Hospital Tipo I (Distrital / 20-50 Camas)' },
      { id: 'hosp_t2', codigo: 'Hospital Tipo II', nombre: 'Hospital Tipo II (50-150 Camas / Especialidades)' },
      { id: 'hosp_t3', codigo: 'Hospital Tipo III', nombre: 'Hospital Tipo III (150-300 Camas)' },
      { id: 'hosp_t4', codigo: 'Hospital Tipo IV', nombre: 'Hospital Tipo IV (Central / Universitario / 300+ Camas)' }
    ]
  },
  {
    id: 'otro',
    nombre: 'Otro / Centro Especializado',
    subtipos: [
      { id: 'otro_esp', codigo: 'Otro', nombre: 'Centro Especializado / Clínica Popular' }
    ]
  }
];

const CATALOGO_AREAS_SERVICIOS = [
  { id: 'triaje', label: 'Triaje / Sala de Espera', icon: 'clock' },
  { id: 'consulta_externa', label: 'Consulta Externa', icon: 'users' },
  { id: 'emergencia_adultos', label: 'Emergencia Adultos', icon: 'activity' },
  { id: 'emergencia_pediatrica', label: 'Emergencia Pediátrica', icon: 'baby' },
  { id: 'sala_partos', label: 'Sala de Partos', icon: 'heart-pulse' },
  { id: 'sala_curas', label: 'Sala de Cura / Yeso', icon: 'bandage' },
  { id: 'quirofanos', label: 'Quirófanos', hasExtra: true, icon: 'scissors' },
  { id: 'hospitalizacion', label: 'Hospitalización', hasExtra: true, icon: 'bed' },
  { id: 'aislamiento', label: 'Área de Aislamiento', icon: 'shield-alert' },
  { id: 'inmunizacion', label: 'Sala de Inmunización (PAI)', icon: 'syringe' },
  { id: 'laboratorio', label: 'Laboratorio Clínico', icon: 'flask-conical' },
  { id: 'imagenologia', label: 'Imagenología (Rayos X / Eco)', icon: 'camera' },
  { id: 'banco_sangre', label: 'Banco de Sangre', icon: 'droplets' },
  { id: 'farmacia', label: 'Farmacia Comunitaria', icon: 'pill' },
  { id: 'desechos', label: 'Depósito de Desechos Bioinfecciosos', icon: 'trash-2' },
  { id: 'lavanderia', label: 'Área de Lavandería', icon: 'waves' },
  { id: 'morgue', label: 'Área de Morgue', icon: 'archive' },
  { id: 'ambulancia', label: 'Puesto de Ambulancia', icon: 'truck' }
];

const CATALOGO_FALLAS = {
  electricas: [
    { id: 'sin_planta', label: 'Sin planta eléctrica de emergencia' },
    { id: 'planta_inoperativa', label: 'Planta eléctrica inoperativa / dañada' },
    { id: 'sin_ats', label: 'Sin transferencia automática (ATS)' },
    { id: 'fluctuaciones', label: 'Fluctuaciones graves de voltaje / Daño de equipos' },
    { id: 'iluminacion_deficiente', label: 'Iluminación deficiente / Sin lámparas de emergencia' }
  ],
  hidrosanitarias: [
    { id: 'sin_agua_tuberia', label: 'Sin suministro de agua por tubería' },
    { id: 'tanques_danados', label: 'Capacidad de almacenamiento insuficiente (Tanques dañados)' },
    { id: 'fuga_tuberias', label: 'Fuga en tuberías / Filtraciones activas' },
    { id: 'colapso_cloacas', label: 'Colapso de cloacas / Aguas servidas' },
    { id: 'banos_inoperativos', label: 'Salas sanitarias inoperativas (Públicas / Personal)' }
  ],
  estructurales: [
    { id: 'filtraciones_techo', label: 'Filtraciones severas en techos / impermeabilización' },
    { id: 'cielo_raso_caido', label: 'Cielo raso caído / deteriorado en áreas asistenciales' },
    { id: 'grietas_paredes', label: 'Grietas estructurales en paredes / losas' },
    { id: 'cerrajeria_danada', label: 'Puertas / Cerrajería dañada (Compromiso de asepsia)' },
    { id: 'pintura_deteriorada', label: 'Pintura interior/exterior deteriorada' },
    { id: 'pisos_agrietados', label: 'Pisos agrietados / no aptos para ambiente clínico' }
  ],
  climatizacion: [
    { id: 'quirofanos_sin_clima', label: 'Quirófanos sin climatización adecuada (Riesgo séptico)' },
    { id: 'emergencia_sin_clima', label: 'Emergencia / Hospitalización sin aire acondicionado' },
    { id: 'cavas_vacunas_falla', label: 'Falla en cavas / refrigeradores de vacunas (PAI)' },
    { id: 'lab_imagen_sin_clima', label: 'Laboratorio / Imagenología sin climatización' }
  ],
  bioseguridad: [
    { id: 'sin_cuarto_biologicos', label: 'Sin cuarto de disposición final de desechos biológicos' },
    { id: 'sin_ruta_diferenciada', label: 'Ausencia de ruta limpia / ruta sucia diferenciada' },
    { id: 'falta_ambulancia', label: 'Falta de ambulancia operativa asignada' },
    { id: 'sin_rampas_ascensor', label: 'Accesos inaccesibles (Sin rampas de camillas / Ascensores)' }
  ]
};

const OPCIONES_SOPORTE_VITAL = {
  plantaElectrica: ['Operativa', 'Inoperativa', 'No tiene'],
  suministroAgua: ['Continuo', 'Cisterna', 'Inexistente'],
  gasesMedicinales: ['Red Central', 'Bombonas', 'Inexistente'],
  climatizacion: ['100% Operativa', 'Parcial', 'Cero Clima']
};

const CENTROS_SALUD_INICIALES = [
  {
    "id": "humnt-maturin",
    "nombre": "Hospital Universitario Dr. Manuel Núñez Tovar (HUMNT)",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "san-simon",
    "parroquia": "San Simón (Casco Central)",
    "sector": "Av. Bicentenario / Casco Urbano",
    "lat": 9.74127,
    "lng": -63.20032,
    "tipoRed": "hospitalaria",
    "tipoRedLabel": "Red Hospitalaria Especializada (Tipo I, II, III, IV)",
    "clasificacionEspecifica": "Hospital Tipo IV",
    "clasificacionEspecificaLabel": "Hospital Tipo IV (Nodal Regional)",
    "quirofanosTotal": 9,
    "quirofanosOperativos": 5,
    "camasHospitalizacion": 480,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "emergencia_pediatrica",
      "trauma_shock",
      "sala_partos",
      "quirofanos",
      "uci_adultos",
      "uci_pediatrica",
      "hospitalizacion",
      "laboratorio",
      "imagenologia",
      "banco_sangre",
      "farmacia"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Pozo Propio",
      "gasesMedicinales": "Tanque Criogénico",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "fluctuaciones"
      ],
      "hidrosanitarias": [
        "fuga_tuberias"
      ],
      "estructurales": [
        "filtraciones_techo"
      ],
      "climatizacion": [
        "aire_danado_emergencia"
      ],
      "bioseguridad": []
    },
    "redRemision": "Centro de Referencia Terciaria Estadal",
    "observaciones": "Principal hospital del oriente. Demanda alta de insumos en trauma shock y pabellones.",
    "elaboradoPor": {
      "nombre": "Dr. Carlos Mendoza",
      "ci": "V-14.892.410",
      "cargo": "Director Médico HUMNT",
      "telefono": "0414-7654321",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "amarillo",
    "precision": "exacta"
  },
  {
    "id": "hosp-simon-bolivar",
    "nombre": "Hospital Dr. Simón Bolívar",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "santa-cruz",
    "parroquia": "Santa Cruz (La Cruz)",
    "sector": "La Cruz / Entrada Principal",
    "lat": 9.72687,
    "lng": -63.25384,
    "tipoRed": "hospitalaria",
    "tipoRedLabel": "Red Hospitalaria Especializada (Tipo I, II, III, IV)",
    "clasificacionEspecifica": "Hospital Tipo II",
    "clasificacionEspecificaLabel": "Hospital Tipo II",
    "quirofanosTotal": 3,
    "quirofanosOperativos": 1,
    "camasHospitalizacion": 85,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "emergencia_pediatrica",
      "sala_partos",
      "quirofanos",
      "hospitalizacion",
      "laboratorio",
      "farmacia"
    ],
    "soporteVital": {
      "plantaElectrica": "Inoperativa",
      "suministroAgua": "Cisterna",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "planta_inoperativa"
      ],
      "hidrosanitarias": [
        "sin_agua_tuberia"
      ],
      "estructurales": [
        "filtraciones_techo"
      ],
      "climatizacion": [
        "aire_danado_quirofano"
      ],
      "bioseguridad": [
        "falta_ambulancia"
      ]
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Planta eléctrica dañada. Urgente sustitución de bomba de agua y transfer switch.",
    "elaboradoPor": {
      "nombre": "Dra. María Elena Rivas",
      "ci": "V-16.320.104",
      "cargo": "Directora Médica",
      "telefono": "0412-8877665",
      "fecha": "2026-09-11"
    },
    "nivelRiesgo": "rojo",
    "precision": "exacta"
  },
  {
    "id": "hosp-felicia-rondon",
    "nombre": "Hospital Dra. Felicia Rondón de Cabello (IVSS)",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "el-furrial",
    "parroquia": "El Furrial",
    "sector": "El Furrial / Carretera Nacional",
    "lat": 9.70295,
    "lng": -63.48398,
    "tipoRed": "hospitalaria",
    "tipoRedLabel": "Red Hospitalaria Especializada (Tipo I, II, III, IV)",
    "clasificacionEspecifica": "Hospital Tipo II",
    "clasificacionEspecificaLabel": "Hospital Tipo II",
    "quirofanosTotal": 2,
    "quirofanosOperativos": 2,
    "camasHospitalizacion": 50,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "emergencia_pediatrica",
      "sala_partos",
      "quirofanos",
      "hospitalizacion",
      "laboratorio",
      "farmacia"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Operatividad óptima en quirófanos y climatización. Buena dotación de IVSS.",
    "elaboradoPor": {
      "nombre": "Dr. José Antonio Bastardo",
      "ci": "V-12.980.543",
      "cargo": "Coordinador General",
      "telefono": "0414-9988776",
      "fecha": "2026-09-09"
    },
    "nivelRiesgo": "verde",
    "precision": "exacta"
  },
  {
    "id": "hosp-serres-las-cocuizas",
    "nombre": "Hospital Tipo I Dr. José Antonio Serres",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "las-cocuizas",
    "parroquia": "Las Cocuizas",
    "sector": "Las Cocuizas / Av. Principal",
    "lat": 9.76416,
    "lng": -63.15007,
    "tipoRed": "hospitalaria",
    "tipoRedLabel": "Red Hospitalaria Especializada (Tipo I, II, III, IV)",
    "clasificacionEspecifica": "Hospital Tipo I",
    "clasificacionEspecificaLabel": "Hospital Tipo I",
    "quirofanosTotal": 2,
    "quirofanosOperativos": 1,
    "camasHospitalizacion": 40,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "emergencia_pediatrica",
      "sala_partos",
      "quirofanos",
      "hospitalizacion",
      "laboratorio",
      "farmacia"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "fluctuaciones"
      ],
      "hidrosanitarias": [
        "fuga_tuberias"
      ],
      "estructurales": [],
      "climatizacion": [
        "aire_danado_emergencia"
      ],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Sala de partos activa. Mantenimiento requerido para segundo quirófano.",
    "elaboradoPor": {
      "nombre": "Dr. Marcos Bermúdez",
      "ci": "V-15.654.321",
      "cargo": "Médico Jefe Serres",
      "telefono": "0416-3322110",
      "fecha": "2026-09-08"
    },
    "nivelRiesgo": "amarillo",
    "precision": "exacta"
  },
  {
    "id": "hosp-psiquiatrico-maturin",
    "nombre": "Hospital Psiquiátrico de Maturín",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "boqueron",
    "parroquia": "Boquerón",
    "sector": "Las Piñas / Vía Boquerón",
    "lat": 9.7845,
    "lng": -63.1992,
    "tipoRed": "hospitalaria",
    "tipoRedLabel": "Red Hospitalaria Especializada (Tipo I, II, III, IV)",
    "clasificacionEspecifica": "Hospital Tipo I",
    "clasificacionEspecificaLabel": "Hospital Especializado",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 60,
    "areasServicios": [
      "consulta_externa",
      "emergencia_adultos",
      "hospitalizacion",
      "farmacia"
    ],
    "soporteVital": {
      "plantaElectrica": "No tiene",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "sin_planta"
      ],
      "hidrosanitarias": [
        "banos_inoperativos"
      ],
      "estructurales": [
        "grietas_paredes"
      ],
      "climatizacion": [
        "sin_aire_pabellon"
      ],
      "bioseguridad": [
        "falta_vigilancia"
      ]
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Único centro psiquiátrico de la entidad. Se requiere impermeabilización y dotación de sedantes.",
    "elaboradoPor": {
      "nombre": "Dra. Luisa Gómez",
      "ci": "V-11.234.567",
      "cargo": "Jefe de Psiquiatría",
      "telefono": "0414-7788990",
      "fecha": "2026-09-07"
    },
    "nivelRiesgo": "amarillo",
    "precision": "exacta"
  },
  {
    "id": "hosp-punta-de-mata",
    "nombre": "Hospital Tipo I Dr. Luis González Espinoza",
    "municipioId": "ezequiel-zamora",
    "municipio": "Municipio Ezequiel Zamora",
    "parroquiaId": "punta-de-mata",
    "parroquia": "Punta de Mata",
    "sector": "Punta de Mata / Casco Central",
    "lat": 9.69359,
    "lng": -63.62065,
    "tipoRed": "hospitalaria",
    "tipoRedLabel": "Red Hospitalaria Especializada (Tipo I, II, III, IV)",
    "clasificacionEspecifica": "Hospital Tipo I",
    "clasificacionEspecificaLabel": "Hospital Tipo I",
    "quirofanosTotal": 2,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 45,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "emergencia_pediatrica",
      "sala_partos",
      "quirofanos",
      "hospitalizacion",
      "laboratorio",
      "farmacia"
    ],
    "soporteVital": {
      "plantaElectrica": "Inoperativa",
      "suministroAgua": "Cisterna",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "Cero Clima"
    },
    "fallas": {
      "electricas": [
        "planta_inoperativa"
      ],
      "hidrosanitarias": [
        "sin_agua_tuberia"
      ],
      "estructurales": [
        "filtraciones_techo"
      ],
      "climatizacion": [
        "sin_aire_emergencia",
        "sin_aire_quirofano"
      ],
      "bioseguridad": [
        "falta_ambulancia"
      ]
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Riesgo crítico por inoperatividad total de quirófanos y colapso de climatización en el eje petrolero oeste.",
    "elaboradoPor": {
      "nombre": "Dr. Fernando Salazar",
      "ci": "V-13.789.012",
      "cargo": "Coordinador de Emergencia",
      "telefono": "0424-9123847",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "rojo",
    "precision": "exacta"
  },
  {
    "id": "hosp-caripito",
    "nombre": "Hospital Tipo I Dr. Darío Márquez",
    "municipioId": "bolivar",
    "municipio": "Municipio Bolívar",
    "parroquiaId": "caripito",
    "parroquia": "Caripito",
    "sector": "Sector Madariaga / Caripe Viejo",
    "lat": 10.10915,
    "lng": -63.09154,
    "tipoRed": "hospitalaria",
    "tipoRedLabel": "Red Hospitalaria Especializada (Tipo I, II, III, IV)",
    "clasificacionEspecifica": "Hospital Tipo I",
    "clasificacionEspecificaLabel": "Hospital Tipo I",
    "quirofanosTotal": 2,
    "quirofanosOperativos": 1,
    "camasHospitalizacion": 50,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "emergencia_pediatrica",
      "sala_partos",
      "quirofanos",
      "hospitalizacion",
      "laboratorio",
      "farmacia"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "fluctuaciones"
      ],
      "hidrosanitarias": [],
      "estructurales": [
        "pintura_deteriorada"
      ],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Operatividad estable en sala de partos y laboratorio. Necesita mantenimiento en segundo pabellón quirúrgico.",
    "elaboradoPor": {
      "nombre": "Dr. Ramón Gómez",
      "ci": "V-10.456.890",
      "cargo": "Director Caripito",
      "telefono": "0416-5544332",
      "fecha": "2026-09-09"
    },
    "nivelRiesgo": "verde",
    "precision": "exacta"
  },
  {
    "id": "hosp-caripe",
    "nombre": "Hospital Tipo I Dr. José Antonio Urrestarazu",
    "municipioId": "caripe",
    "municipio": "Municipio Caripe",
    "parroquiaId": "caripe-centro",
    "parroquia": "Caripe",
    "sector": "Caripe Centro / El Mirador",
    "lat": 10.17321,
    "lng": -63.50057,
    "tipoRed": "hospitalaria",
    "tipoRedLabel": "Red Hospitalaria Especializada (Tipo I, II, III, IV)",
    "clasificacionEspecifica": "Hospital Tipo I",
    "clasificacionEspecificaLabel": "Hospital Tipo I",
    "quirofanosTotal": 1,
    "quirofanosOperativos": 1,
    "camasHospitalizacion": 35,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "emergencia_pediatrica",
      "sala_partos",
      "quirofanos",
      "hospitalizacion",
      "laboratorio",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [
        "fluctuaciones"
      ],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": [
        "falta_ambulancia"
      ]
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Clima de montaña favorece climatización. Se requiere unidad móvil de tracción 4x4 para traslados desde caseríos.",
    "elaboradoPor": {
      "nombre": "Dra. Patricia Rondón",
      "ci": "V-18.445.671",
      "cargo": "Médico Jefe Caripe",
      "telefono": "0424-7766554",
      "fecha": "2026-09-08"
    },
    "nivelRiesgo": "verde",
    "precision": "exacta"
  },
  {
    "id": "hosp-caicara",
    "nombre": "Hospital Tipo I Dr. Ernesto Guzmán Saavedra",
    "municipioId": "cedeno",
    "municipio": "Municipio Cedeño",
    "parroquiaId": "caicara",
    "parroquia": "Caicara (Capital Cedeño)",
    "sector": "Caicara de Maturín Centro",
    "lat": 9.81567,
    "lng": -63.60854,
    "tipoRed": "hospitalaria",
    "tipoRedLabel": "Red Hospitalaria Especializada (Tipo I, II, III, IV)",
    "clasificacionEspecifica": "Hospital Tipo I",
    "clasificacionEspecificaLabel": "Hospital Tipo I",
    "quirofanosTotal": 2,
    "quirofanosOperativos": 1,
    "camasHospitalizacion": 40,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "emergencia_pediatrica",
      "sala_partos",
      "quirofanos",
      "hospitalizacion",
      "laboratorio",
      "farmacia"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "fluctuaciones"
      ],
      "hidrosanitarias": [],
      "estructurales": [
        "filtraciones_techo"
      ],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Punto central de atención del eje oeste. Sala de parto operativa con respaldo eléctrico.",
    "elaboradoPor": {
      "nombre": "Dr. Raúl Cedeño",
      "ci": "V-15.112.233",
      "cargo": "Director Hospital Caicara",
      "telefono": "0414-8877112",
      "fecha": "2026-09-09"
    },
    "nivelRiesgo": "verde",
    "precision": "exacta"
  },
  {
    "id": "hosp-san-antonio",
    "nombre": "Hospital Tipo I Dr. Pablo Villarroel",
    "municipioId": "acosta",
    "municipio": "Municipio Acosta",
    "parroquiaId": "san-antonio",
    "parroquia": "San Antonio de Maturín (Capayacuar)",
    "sector": "San Antonio de Capayacuar",
    "lat": 10.11514,
    "lng": -63.72735,
    "tipoRed": "hospitalaria",
    "tipoRedLabel": "Red Hospitalaria Especializada (Tipo I, II, III, IV)",
    "clasificacionEspecifica": "Hospital Tipo I",
    "clasificacionEspecificaLabel": "Hospital Tipo I",
    "quirofanosTotal": 1,
    "quirofanosOperativos": 1,
    "camasHospitalizacion": 30,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "emergencia_pediatrica",
      "sala_partos",
      "quirofanos",
      "hospitalizacion",
      "laboratorio",
      "farmacia"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "fluctuaciones"
      ],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Atiende cabecera del Valle de Capayacuar. Se solicita ambulancia de soporte vital avanzado.",
    "elaboradoPor": {
      "nombre": "Dra. Carmen Villarroel",
      "ci": "V-17.889.900",
      "cargo": "Médico Jefe Acosta",
      "telefono": "0426-3344556",
      "fecha": "2026-09-08"
    },
    "nivelRiesgo": "verde",
    "precision": "exacta"
  },
  {
    "id": "hosp-quiriquire",
    "nombre": "Hospital Tipo I Dr. Nicolás Giannini",
    "municipioId": "punceres",
    "municipio": "Municipio Punceres",
    "parroquiaId": "quiriquire",
    "parroquia": "Quiriquire",
    "sector": "Quiriquire Centro",
    "lat": 9.97817,
    "lng": -63.21986,
    "tipoRed": "hospitalaria",
    "tipoRedLabel": "Red Hospitalaria Especializada (Tipo I, II, III, IV)",
    "clasificacionEspecifica": "Hospital Tipo I",
    "clasificacionEspecificaLabel": "Hospital Tipo I",
    "quirofanosTotal": 1,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 30,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "emergencia_pediatrica",
      "sala_partos",
      "hospitalizacion",
      "laboratorio",
      "farmacia"
    ],
    "soporteVital": {
      "plantaElectrica": "Inoperativa",
      "suministroAgua": "Cisterna",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "Cero Clima"
    },
    "fallas": {
      "electricas": [
        "planta_inoperativa"
      ],
      "hidrosanitarias": [
        "sin_agua_tuberia"
      ],
      "estructurales": [
        "filtraciones_techo"
      ],
      "climatizacion": [
        "sin_aire_emergencia"
      ],
      "bioseguridad": [
        "falta_ambulancia"
      ]
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Pabellón fuera de servicio. Requiere intervención inmediata de infraestructura eléctrica y agua.",
    "elaboradoPor": {
      "nombre": "Dr. Jorge Giannini",
      "ci": "V-14.556.778",
      "cargo": "Director Punceres",
      "telefono": "0412-6677889",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "rojo",
    "precision": "exacta"
  },
  {
    "id": "hosp-temblador",
    "nombre": "Hospital Tipo I Dr. Tulio López Ramírez",
    "municipioId": "libertador",
    "municipio": "Municipio Libertador",
    "parroquiaId": "temblador",
    "parroquia": "Temblador",
    "sector": "Temblador Centro",
    "lat": 9.00762,
    "lng": -62.64,
    "tipoRed": "hospitalaria",
    "tipoRedLabel": "Red Hospitalaria Especializada (Tipo I, II, III, IV)",
    "clasificacionEspecifica": "Hospital Tipo I",
    "clasificacionEspecificaLabel": "Hospital Tipo I",
    "quirofanosTotal": 2,
    "quirofanosOperativos": 1,
    "camasHospitalizacion": 45,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "emergencia_pediatrica",
      "sala_partos",
      "quirofanos",
      "hospitalizacion",
      "laboratorio",
      "farmacia"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "fluctuaciones"
      ],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [
        "aire_danado_hospitalizacion"
      ],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Nodo de salud para el sur de Monagas. Distancia a Maturín de 120 km amerita ambulancia activa.",
    "elaboradoPor": {
      "nombre": "Dr. Eduardo Mata",
      "ci": "V-13.223.344",
      "cargo": "Director Libertador",
      "telefono": "0414-9900112",
      "fecha": "2026-09-09"
    },
    "nivelRiesgo": "amarillo",
    "precision": "exacta"
  },
  {
    "id": "hosp-barrancas",
    "nombre": "Hospital Tipo I Dr. Tulio López Ramírez (Barrancas)",
    "municipioId": "sotillo",
    "municipio": "Municipio Sotillo",
    "parroquiaId": "barrancas",
    "parroquia": "Barrancas del Orinoco",
    "sector": "Barrancas del Orinoco / Ribera",
    "lat": 8.70174,
    "lng": -62.19669,
    "tipoRed": "hospitalaria",
    "tipoRedLabel": "Red Hospitalaria Especializada (Tipo I, II, III, IV)",
    "clasificacionEspecifica": "Hospital Tipo I",
    "clasificacionEspecificaLabel": "Hospital Tipo I",
    "quirofanosTotal": 1,
    "quirofanosOperativos": 1,
    "camasHospitalizacion": 35,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "emergencia_pediatrica",
      "sala_partos",
      "quirofanos",
      "hospitalizacion",
      "laboratorio",
      "farmacia"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "fluctuaciones"
      ],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": [
        "falta_lancha_ambulancia"
      ]
    },
    "redRemision": "HUMNT Maturín / Hospital Uyapar Bolívar",
    "observaciones": "Punto fluvial clave sobre el Río Orinoco. Requiere lancha ambulancia para comunidades indígenas warao.",
    "elaboradoPor": {
      "nombre": "Dr. Víctor Sotillo",
      "ci": "V-16.778.899",
      "cargo": "Director Sotillo",
      "telefono": "0424-8899770",
      "fecha": "2026-09-08"
    },
    "nivelRiesgo": "amarillo",
    "precision": "exacta"
  },
  {
    "id": "hosp-aguasay",
    "nombre": "Hospital Tipo I / Clínica Popular Aguasay",
    "municipioId": "aguasay",
    "municipio": "Municipio Aguasay",
    "parroquiaId": "aguasay-centro",
    "parroquia": "Aguasay",
    "sector": "Aguasay Centro",
    "lat": 9.42462,
    "lng": -63.74397,
    "tipoRed": "hospitalaria",
    "tipoRedLabel": "Red Hospitalaria Especializada (Tipo I, II, III, IV)",
    "clasificacionEspecifica": "Hospital Tipo I",
    "clasificacionEspecificaLabel": "Hospital Tipo I / Clínica Popular",
    "quirofanosTotal": 1,
    "quirofanosOperativos": 1,
    "camasHospitalizacion": 25,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "emergencia_pediatrica",
      "sala_partos",
      "quirofanos",
      "hospitalizacion",
      "laboratorio",
      "farmacia"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Atención materno-infantil y emergencias menores para la población agropecuaria e indígena Kariña.",
    "elaboradoPor": {
      "nombre": "Dra. Yelitza Aguasay",
      "ci": "V-18.990.123",
      "cargo": "Médico Jefe Aguasay",
      "telefono": "0416-4455667",
      "fecha": "2026-09-09"
    },
    "nivelRiesgo": "verde",
    "precision": "exacta"
  },
  {
    "id": "hosp-santa-barbara",
    "nombre": "Hospital Tipo I / Clínica Popular Santa Bárbara",
    "municipioId": "santa-barbara",
    "municipio": "Municipio Santa Bárbara",
    "parroquiaId": "santa-barbara-centro",
    "parroquia": "Santa Bárbara",
    "sector": "Santa Bárbara Centro",
    "lat": 9.60753,
    "lng": -63.61041,
    "tipoRed": "hospitalaria",
    "tipoRedLabel": "Red Hospitalaria Especializada (Tipo I, II, III, IV)",
    "clasificacionEspecifica": "Hospital Tipo I",
    "clasificacionEspecificaLabel": "Hospital Tipo I / Clínica Popular",
    "quirofanosTotal": 1,
    "quirofanosOperativos": 1,
    "camasHospitalizacion": 25,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "emergencia_pediatrica",
      "sala_partos",
      "quirofanos",
      "hospitalizacion",
      "laboratorio",
      "farmacia"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Buenas condiciones generales de infraestructura y dotación básica.",
    "elaboradoPor": {
      "nombre": "Dr. Santos Bárcenas",
      "ci": "V-15.432.109",
      "cargo": "Director Santa Bárbara",
      "telefono": "0414-3322445",
      "fecha": "2026-09-08"
    },
    "nivelRiesgo": "verde",
    "precision": "exacta"
  },
  {
    "id": "hosp-uracoa",
    "nombre": "Hospital Tipo I / Clínica Popular Uracoa",
    "municipioId": "uracoa",
    "municipio": "Municipio Uracoa",
    "parroquiaId": "uracoa-centro",
    "parroquia": "Uracoa",
    "sector": "Uracoa Centro / Calle Comercio",
    "lat": 8.7468,
    "lng": -62.3385,
    "tipoRed": "hospitalaria",
    "tipoRedLabel": "Red Hospitalaria Especializada (Tipo I, II, III, IV)",
    "clasificacionEspecifica": "Hospital Tipo I",
    "clasificacionEspecificaLabel": "Hospital Tipo I / Clínica Popular",
    "quirofanosTotal": 1,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 20,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "emergencia_pediatrica",
      "sala_partos",
      "hospitalizacion",
      "laboratorio",
      "farmacia"
    ],
    "soporteVital": {
      "plantaElectrica": "Inoperativa",
      "suministroAgua": "Cisterna",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "planta_inoperativa"
      ],
      "hidrosanitarias": [
        "sin_agua_tuberia"
      ],
      "estructurales": [],
      "climatizacion": [
        "aire_danado_emergencia"
      ],
      "bioseguridad": [
        "falta_ambulancia"
      ]
    },
    "redRemision": "Hospital de Temblador / HUMNT Maturín",
    "observaciones": "Pabellón quirúrgico no operativo. Planta eléctrica averiada por tarjeta de control.",
    "elaboradoPor": {
      "nombre": "Dra. Rosa Uracoa",
      "ci": "V-17.654.321",
      "cargo": "Médico Jefe Uracoa",
      "telefono": "0424-5566778",
      "fecha": "2026-09-09"
    },
    "nivelRiesgo": "rojo",
    "precision": "exacta"
  },
  {
    "id": "hosp-aragua-maturin",
    "nombre": "Hospital Tipo I Dr. Manuel Núñez Tovar (Piar)",
    "municipioId": "piar",
    "municipio": "Municipio Piar",
    "parroquiaId": "aragua",
    "parroquia": "Aragua de Maturín",
    "sector": "Aragua de Maturín / Calle Bolívar",
    "lat": 9.9722,
    "lng": -63.4851,
    "tipoRed": "hospitalaria",
    "tipoRedLabel": "Red Hospitalaria Especializada (Tipo I, II, III, IV)",
    "clasificacionEspecifica": "Hospital Tipo I",
    "clasificacionEspecificaLabel": "Hospital Tipo I",
    "quirofanosTotal": 1,
    "quirofanosOperativos": 1,
    "camasHospitalizacion": 30,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "emergencia_pediatrica",
      "sala_partos",
      "quirofanos",
      "hospitalizacion",
      "laboratorio",
      "farmacia"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "fluctuaciones"
      ],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Cabecera del municipio Piar. Sala de partos con atención continua a caseríos del norte.",
    "elaboradoPor": {
      "nombre": "Dr. Gilberto Piar",
      "ci": "V-12.334.455",
      "cargo": "Director Piar",
      "telefono": "0416-9900881",
      "fecha": "2026-09-08"
    },
    "nivelRiesgo": "verde",
    "precision": "exacta"
  },
  {
    "id": "cdi-los-godos",
    "nombre": "CDI Dr. Rosendo Gómez Lorenzo",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "alto-de-los-godos",
    "parroquia": "Alto de Los Godos",
    "sector": "Los Godos / Calle Principal",
    "lat": 9.7285,
    "lng": -63.2065,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Centro de Diagnóstico Integral (CDI)",
    "clasificacionEspecificaLabel": "Centro de Diagnóstico Integral (CDI)",
    "quirofanosTotal": 1,
    "quirofanosOperativos": 1,
    "camasHospitalizacion": 8,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "sala_partos",
      "laboratorio",
      "imagenologia",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Centro de Diagnóstico Integral con atención médica continuada 24/7.",
    "elaboradoPor": {
      "nombre": "Dr. Enlace Comunal",
      "ci": "V-19.123.456",
      "cargo": "Coordinador ASIC",
      "telefono": "0414-0011223",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "sectorial"
  },
  {
    "id": "cdi-carmelo-regardiz",
    "nombre": "CDI Dr. Carmelo Regardiz",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "las-cocuizas",
    "parroquia": "Las Cocuizas",
    "sector": "Brisas del Aeropuerto / Av. José Tadeo Monagas",
    "lat": 9.74561,
    "lng": -63.14517,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Centro de Diagnóstico Integral (CDI)",
    "clasificacionEspecificaLabel": "Centro de Diagnóstico Integral (CDI)",
    "quirofanosTotal": 1,
    "quirofanosOperativos": 1,
    "camasHospitalizacion": 8,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "sala_partos",
      "laboratorio",
      "imagenologia",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Centro de Diagnóstico Integral con atención médica continuada 24/7.",
    "elaboradoPor": {
      "nombre": "Dr. Enlace Comunal",
      "ci": "V-19.123.456",
      "cargo": "Coordinador ASIC",
      "telefono": "0414-0011223",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "exacta"
  },
  {
    "id": "cdi-23-de-enero",
    "nombre": "CDI 23 de Enero",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "san-simon",
    "parroquia": "San Simón (Casco Central)",
    "sector": "Sector 23 de Enero / Calle Bolívar",
    "lat": 9.73991,
    "lng": -63.18135,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Centro de Diagnóstico Integral (CDI)",
    "clasificacionEspecificaLabel": "Centro de Diagnóstico Integral (CDI)",
    "quirofanosTotal": 1,
    "quirofanosOperativos": 1,
    "camasHospitalizacion": 8,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "sala_partos",
      "laboratorio",
      "imagenologia",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Centro de Diagnóstico Integral con atención médica continuada 24/7.",
    "elaboradoPor": {
      "nombre": "Dr. Enlace Comunal",
      "ci": "V-19.123.456",
      "cargo": "Coordinador ASIC",
      "telefono": "0414-0011223",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "exacta"
  },
  {
    "id": "cdi-boqueron",
    "nombre": "CDI Boquerón",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "boqueron",
    "parroquia": "Boquerón",
    "sector": "Boquerón Centro / Av. Alirio Ugarte Pelayo",
    "lat": 9.7891,
    "lng": -63.1895,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Centro de Diagnóstico Integral (CDI)",
    "clasificacionEspecificaLabel": "Centro de Diagnóstico Integral (CDI)",
    "quirofanosTotal": 1,
    "quirofanosOperativos": 1,
    "camasHospitalizacion": 8,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "sala_partos",
      "laboratorio",
      "imagenologia",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Centro de Diagnóstico Integral con atención médica continuada 24/7.",
    "elaboradoPor": {
      "nombre": "Dr. Enlace Comunal",
      "ci": "V-19.123.456",
      "cargo": "Coordinador ASIC",
      "telefono": "0414-0011223",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "exacta"
  },
  {
    "id": "cdi-los-cortijos",
    "nombre": "CDI Los Cortijos",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "boqueron",
    "parroquia": "Boquerón",
    "sector": "Las Piñas / Los Cortijos",
    "lat": 9.805,
    "lng": -63.165,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Centro de Diagnóstico Integral (CDI)",
    "clasificacionEspecificaLabel": "Centro de Diagnóstico Integral (CDI)",
    "quirofanosTotal": 1,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 8,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "sala_partos",
      "laboratorio",
      "imagenologia",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Centro de Diagnóstico Integral con atención médica continuada 24/7.",
    "elaboradoPor": {
      "nombre": "Dr. Enlace Comunal",
      "ci": "V-19.123.456",
      "cargo": "Coordinador ASIC",
      "telefono": "0414-0011223",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "amarillo",
    "precision": "sectorial"
  },
  {
    "id": "cdi-viento-colao",
    "nombre": "CDI Viento Colao",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "san-simon",
    "parroquia": "San Simón (Casco Central)",
    "sector": "Sector Viento Colao Sur",
    "lat": 9.732,
    "lng": -63.181,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Centro de Diagnóstico Integral (CDI)",
    "clasificacionEspecificaLabel": "Centro de Diagnóstico Integral (CDI)",
    "quirofanosTotal": 1,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 8,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "sala_partos",
      "laboratorio",
      "imagenologia",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "Inoperativa",
      "suministroAgua": "Cisterna",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "planta_inoperativa"
      ],
      "hidrosanitarias": [
        "sin_agua_tuberia"
      ],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Centro de Diagnóstico Integral con atención médica continuada 24/7.",
    "elaboradoPor": {
      "nombre": "Dr. Enlace Comunal",
      "ci": "V-19.123.456",
      "cargo": "Coordinador ASIC",
      "telefono": "0414-0011223",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "rojo",
    "precision": "sectorial"
  },
  {
    "id": "cdi-la-pica",
    "nombre": "CDI La Pica",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "la-pica",
    "parroquia": "La Pica",
    "sector": "La Pica Centro / Calle Principal",
    "lat": 9.7752,
    "lng": -63.0784,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Centro de Diagnóstico Integral (CDI)",
    "clasificacionEspecificaLabel": "Centro de Diagnóstico Integral (CDI)",
    "quirofanosTotal": 1,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 8,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "sala_partos",
      "laboratorio",
      "imagenologia",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Centro de Diagnóstico Integral con atención médica continuada 24/7.",
    "elaboradoPor": {
      "nombre": "Dr. Enlace Comunal",
      "ci": "V-19.123.456",
      "cargo": "Coordinador ASIC",
      "telefono": "0414-0011223",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "amarillo",
    "precision": "exacta"
  },
  {
    "id": "cdi-el-furrial",
    "nombre": "CDI El Furrial",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "el-furrial",
    "parroquia": "El Furrial",
    "sector": "El Furrial / Sector La Florida",
    "lat": 9.7032,
    "lng": -63.4835,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Centro de Diagnóstico Integral (CDI)",
    "clasificacionEspecificaLabel": "Centro de Diagnóstico Integral (CDI)",
    "quirofanosTotal": 1,
    "quirofanosOperativos": 1,
    "camasHospitalizacion": 8,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "sala_partos",
      "laboratorio",
      "imagenologia",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Centro de Diagnóstico Integral con atención médica continuada 24/7.",
    "elaboradoPor": {
      "nombre": "Dr. Enlace Comunal",
      "ci": "V-19.123.456",
      "cargo": "Coordinador ASIC",
      "telefono": "0414-0011223",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "exacta"
  },
  {
    "id": "cdi-jusepin",
    "nombre": "CDI Jusepín",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "jusepin",
    "parroquia": "Jusepín",
    "sector": "Jusepín / Campo Médico",
    "lat": 9.75499,
    "lng": -63.46464,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Centro de Diagnóstico Integral (CDI)",
    "clasificacionEspecificaLabel": "Centro de Diagnóstico Integral (CDI)",
    "quirofanosTotal": 1,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 8,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "sala_partos",
      "laboratorio",
      "imagenologia",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Centro de Diagnóstico Integral con atención médica continuada 24/7.",
    "elaboradoPor": {
      "nombre": "Dr. Enlace Comunal",
      "ci": "V-19.123.456",
      "cargo": "Coordinador ASIC",
      "telefono": "0414-0011223",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "amarillo",
    "precision": "exacta"
  },
  {
    "id": "cdi-san-vicente",
    "nombre": "CDI San Vicente",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "san-vicente",
    "parroquia": "San Vicente",
    "sector": "San Vicente Centro / Calle Bolívar",
    "lat": 9.7285,
    "lng": -63.2854,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Centro de Diagnóstico Integral (CDI)",
    "clasificacionEspecificaLabel": "Centro de Diagnóstico Integral (CDI)",
    "quirofanosTotal": 1,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 8,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "sala_partos",
      "laboratorio",
      "imagenologia",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Centro de Diagnóstico Integral con atención médica continuada 24/7.",
    "elaboradoPor": {
      "nombre": "Dr. Enlace Comunal",
      "ci": "V-19.123.456",
      "cargo": "Coordinador ASIC",
      "telefono": "0414-0011223",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "amarillo",
    "precision": "exacta"
  },
  {
    "id": "cdi-el-corozo",
    "nombre": "CDI El Corozo",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "el-corozo",
    "parroquia": "El Corozo",
    "sector": "El Corozo / Carretera Troncal 10",
    "lat": 9.6852,
    "lng": -63.2155,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Centro de Diagnóstico Integral (CDI)",
    "clasificacionEspecificaLabel": "Centro de Diagnóstico Integral (CDI)",
    "quirofanosTotal": 1,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 8,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "sala_partos",
      "laboratorio",
      "imagenologia",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "Inoperativa",
      "suministroAgua": "Cisterna",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "planta_inoperativa"
      ],
      "hidrosanitarias": [
        "sin_agua_tuberia"
      ],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Centro de Diagnóstico Integral con atención médica continuada 24/7.",
    "elaboradoPor": {
      "nombre": "Dr. Enlace Comunal",
      "ci": "V-19.123.456",
      "cargo": "Coordinador ASIC",
      "telefono": "0414-0011223",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "rojo",
    "precision": "exacta"
  },
  {
    "id": "cdi-punta-de-mata",
    "nombre": "CDI Punta de Mata",
    "municipioId": "ezequiel-zamora",
    "municipio": "Municipio Ezequiel Zamora",
    "parroquiaId": "punta-de-mata",
    "parroquia": "Punta de Mata",
    "sector": "Punta de Mata / Medicatura",
    "lat": 9.69646,
    "lng": -63.61156,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Centro de Diagnóstico Integral (CDI)",
    "clasificacionEspecificaLabel": "Centro de Diagnóstico Integral (CDI)",
    "quirofanosTotal": 1,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 8,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "sala_partos",
      "laboratorio",
      "imagenologia",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Centro de Diagnóstico Integral con atención médica continuada 24/7.",
    "elaboradoPor": {
      "nombre": "Dr. Enlace Comunal",
      "ci": "V-19.123.456",
      "cargo": "Coordinador ASIC",
      "telefono": "0414-0011223",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "amarillo",
    "precision": "exacta"
  },
  {
    "id": "cdi-el-tejero",
    "nombre": "CDI El Tejero",
    "municipioId": "ezequiel-zamora",
    "municipio": "Municipio Ezequiel Zamora",
    "parroquiaId": "el-tejero",
    "parroquia": "El Tejero",
    "sector": "El Tejero / Medicatura Rural",
    "lat": 9.77129,
    "lng": -63.67517,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Centro de Diagnóstico Integral (CDI)",
    "clasificacionEspecificaLabel": "Centro de Diagnóstico Integral (CDI)",
    "quirofanosTotal": 1,
    "quirofanosOperativos": 1,
    "camasHospitalizacion": 8,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "sala_partos",
      "laboratorio",
      "imagenologia",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Centro de Diagnóstico Integral con atención médica continuada 24/7.",
    "elaboradoPor": {
      "nombre": "Dr. Enlace Comunal",
      "ci": "V-19.123.456",
      "cargo": "Coordinador ASIC",
      "telefono": "0414-0011223",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "exacta"
  },
  {
    "id": "cdi-caripito",
    "nombre": "CDI Caripito",
    "municipioId": "bolivar",
    "municipio": "Municipio Bolívar",
    "parroquiaId": "caripito",
    "parroquia": "Caripito",
    "sector": "Sector Bajo Guarapiche",
    "lat": 10.125,
    "lng": -63.105,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Centro de Diagnóstico Integral (CDI)",
    "clasificacionEspecificaLabel": "Centro de Diagnóstico Integral (CDI)",
    "quirofanosTotal": 1,
    "quirofanosOperativos": 1,
    "camasHospitalizacion": 8,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "sala_partos",
      "laboratorio",
      "imagenologia",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Centro de Diagnóstico Integral con atención médica continuada 24/7.",
    "elaboradoPor": {
      "nombre": "Dr. Enlace Comunal",
      "ci": "V-19.123.456",
      "cargo": "Coordinador ASIC",
      "telefono": "0414-0011223",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "sectorial"
  },
  {
    "id": "cdi-caripe",
    "nombre": "CDI Caripe",
    "municipioId": "caripe",
    "municipio": "Municipio Caripe",
    "parroquiaId": "caripe-centro",
    "parroquia": "Caripe",
    "sector": "Sector La Troja",
    "lat": 10.178,
    "lng": -63.498,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Centro de Diagnóstico Integral (CDI)",
    "clasificacionEspecificaLabel": "Centro de Diagnóstico Integral (CDI)",
    "quirofanosTotal": 1,
    "quirofanosOperativos": 1,
    "camasHospitalizacion": 8,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "sala_partos",
      "laboratorio",
      "imagenologia",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Centro de Diagnóstico Integral con atención médica continuada 24/7.",
    "elaboradoPor": {
      "nombre": "Dr. Enlace Comunal",
      "ci": "V-19.123.456",
      "cargo": "Coordinador ASIC",
      "telefono": "0414-0011223",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "sectorial"
  },
  {
    "id": "cdi-caicara",
    "nombre": "CDI Caicara de Maturín",
    "municipioId": "cedeno",
    "municipio": "Municipio Cedeño",
    "parroquiaId": "caicara",
    "parroquia": "Caicara",
    "sector": "Caicara / Av. Miranda",
    "lat": 9.8197,
    "lng": -63.61434,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Centro de Diagnóstico Integral (CDI)",
    "clasificacionEspecificaLabel": "Centro de Diagnóstico Integral (CDI)",
    "quirofanosTotal": 1,
    "quirofanosOperativos": 1,
    "camasHospitalizacion": 8,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "sala_partos",
      "laboratorio",
      "imagenologia",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Centro de Diagnóstico Integral con atención médica continuada 24/7.",
    "elaboradoPor": {
      "nombre": "Dr. Enlace Comunal",
      "ci": "V-19.123.456",
      "cargo": "Coordinador ASIC",
      "telefono": "0414-0011223",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "exacta"
  },
  {
    "id": "cdi-aragua",
    "nombre": "CDI Aragua de Maturín",
    "municipioId": "piar",
    "municipio": "Municipio Piar",
    "parroquiaId": "aragua",
    "parroquia": "Aragua de Maturín",
    "sector": "Aragua de Maturín / Sector Banco Obrero",
    "lat": 9.9735,
    "lng": -63.4842,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Centro de Diagnóstico Integral (CDI)",
    "clasificacionEspecificaLabel": "Centro de Diagnóstico Integral (CDI)",
    "quirofanosTotal": 1,
    "quirofanosOperativos": 1,
    "camasHospitalizacion": 8,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "sala_partos",
      "laboratorio",
      "imagenologia",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Centro de Diagnóstico Integral con atención médica continuada 24/7.",
    "elaboradoPor": {
      "nombre": "Dr. Enlace Comunal",
      "ci": "V-19.123.456",
      "cargo": "Coordinador ASIC",
      "telefono": "0414-0011223",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "exacta"
  },
  {
    "id": "cdi-san-antonio",
    "nombre": "CDI San Antonio de Capayacuar",
    "municipioId": "acosta",
    "municipio": "Municipio Acosta",
    "parroquiaId": "san-antonio",
    "parroquia": "San Antonio",
    "sector": "San Antonio Centro",
    "lat": 10.005,
    "lng": -63.712,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Centro de Diagnóstico Integral (CDI)",
    "clasificacionEspecificaLabel": "Centro de Diagnóstico Integral (CDI)",
    "quirofanosTotal": 1,
    "quirofanosOperativos": 1,
    "camasHospitalizacion": 8,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "sala_partos",
      "laboratorio",
      "imagenologia",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Centro de Diagnóstico Integral con atención médica continuada 24/7.",
    "elaboradoPor": {
      "nombre": "Dr. Enlace Comunal",
      "ci": "V-19.123.456",
      "cargo": "Coordinador ASIC",
      "telefono": "0414-0011223",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "sectorial"
  },
  {
    "id": "cdi-quiriquire",
    "nombre": "CDI Quiriquire",
    "municipioId": "punceres",
    "municipio": "Municipio Punceres",
    "parroquiaId": "quiriquire",
    "parroquia": "Quiriquire",
    "sector": "Sector Miraflores",
    "lat": 9.975,
    "lng": -63.215,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Centro de Diagnóstico Integral (CDI)",
    "clasificacionEspecificaLabel": "Centro de Diagnóstico Integral (CDI)",
    "quirofanosTotal": 1,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 8,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "sala_partos",
      "laboratorio",
      "imagenologia",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Centro de Diagnóstico Integral con atención médica continuada 24/7.",
    "elaboradoPor": {
      "nombre": "Dr. Enlace Comunal",
      "ci": "V-19.123.456",
      "cargo": "Coordinador ASIC",
      "telefono": "0414-0011223",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "amarillo",
    "precision": "sectorial"
  },
  {
    "id": "cdi-temblador",
    "nombre": "CDI Temblador",
    "municipioId": "libertador",
    "municipio": "Municipio Libertador",
    "parroquiaId": "temblador",
    "parroquia": "Temblador",
    "sector": "Temblador Sur",
    "lat": 9.025,
    "lng": -62.715,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Centro de Diagnóstico Integral (CDI)",
    "clasificacionEspecificaLabel": "Centro de Diagnóstico Integral (CDI)",
    "quirofanosTotal": 1,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 8,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "sala_partos",
      "laboratorio",
      "imagenologia",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Centro de Diagnóstico Integral con atención médica continuada 24/7.",
    "elaboradoPor": {
      "nombre": "Dr. Enlace Comunal",
      "ci": "V-19.123.456",
      "cargo": "Coordinador ASIC",
      "telefono": "0414-0011223",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "amarillo",
    "precision": "sectorial"
  },
  {
    "id": "cdi-barrancas",
    "nombre": "CDI Barrancas del Orinoco",
    "municipioId": "sotillo",
    "municipio": "Municipio Sotillo",
    "parroquiaId": "barrancas",
    "parroquia": "Barrancas",
    "sector": "Barrancas del Orinoco",
    "lat": 8.69745,
    "lng": -62.1891,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Centro de Diagnóstico Integral (CDI)",
    "clasificacionEspecificaLabel": "Centro de Diagnóstico Integral (CDI)",
    "quirofanosTotal": 1,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 8,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "sala_partos",
      "laboratorio",
      "imagenologia",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Centro de Diagnóstico Integral con atención médica continuada 24/7.",
    "elaboradoPor": {
      "nombre": "Dr. Enlace Comunal",
      "ci": "V-19.123.456",
      "cargo": "Coordinador ASIC",
      "telefono": "0414-0011223",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "amarillo",
    "precision": "exacta"
  },
  {
    "id": "cdi-aguasay",
    "nombre": "CDI Aguasay",
    "municipioId": "aguasay",
    "municipio": "Municipio Aguasay",
    "parroquiaId": "aguasay-centro",
    "parroquia": "Aguasay",
    "sector": "Aguasay",
    "lat": 9.42132,
    "lng": -63.73059,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Centro de Diagnóstico Integral (CDI)",
    "clasificacionEspecificaLabel": "Centro de Diagnóstico Integral (CDI)",
    "quirofanosTotal": 1,
    "quirofanosOperativos": 1,
    "camasHospitalizacion": 8,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "sala_partos",
      "laboratorio",
      "imagenologia",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Centro de Diagnóstico Integral con atención médica continuada 24/7.",
    "elaboradoPor": {
      "nombre": "Dr. Enlace Comunal",
      "ci": "V-19.123.456",
      "cargo": "Coordinador ASIC",
      "telefono": "0414-0011223",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "exacta"
  },
  {
    "id": "cdi-santa-barbara",
    "nombre": "CDI Santa Bárbara",
    "municipioId": "santa-barbara",
    "municipio": "Municipio Santa Bárbara",
    "parroquiaId": "santa-barbara-centro",
    "parroquia": "Santa Bárbara",
    "sector": "Santa Bárbara Norte",
    "lat": 9.585,
    "lng": -63.615,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Centro de Diagnóstico Integral (CDI)",
    "clasificacionEspecificaLabel": "Centro de Diagnóstico Integral (CDI)",
    "quirofanosTotal": 1,
    "quirofanosOperativos": 1,
    "camasHospitalizacion": 8,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "sala_partos",
      "laboratorio",
      "imagenologia",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Centro de Diagnóstico Integral con atención médica continuada 24/7.",
    "elaboradoPor": {
      "nombre": "Dr. Enlace Comunal",
      "ci": "V-19.123.456",
      "cargo": "Coordinador ASIC",
      "telefono": "0414-0011223",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "sectorial"
  },
  {
    "id": "sri-los-godos",
    "nombre": "SRI Los Godos",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "alto-de-los-godos",
    "parroquia": "Alto de Los Godos",
    "sector": "Los Godos Centro",
    "lat": 9.729,
    "lng": -63.205,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Sala de Rehabilitación Integral (SRI)",
    "clasificacionEspecificaLabel": "Sala de Rehabilitación Integral (SRI)",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 0,
    "areasServicios": [
      "consulta_externa",
      "fisiatria",
      "gimnasio_terapeutico",
      "electroterapia",
      "hidroterapia",
      "terapia_ocupacional",
      "farmacia"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI / HUMNT Maturín",
    "observaciones": "Servicio de rehabilitación física, logopedia, podología y terapia ocupacional.",
    "elaboradoPor": {
      "nombre": "Lic. Fisioterapia",
      "ci": "V-20.345.678",
      "cargo": "Jefe de Sala SRI",
      "telefono": "0424-1122334",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "sectorial"
  },
  {
    "id": "sri-carmelo-regardiz",
    "nombre": "SRI Carmelo Regardiz",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "las-cocuizas",
    "parroquia": "Las Cocuizas",
    "sector": "Brisas del Aeropuerto / Av. José Tadeo Monagas",
    "lat": 9.74561,
    "lng": -63.14517,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Sala de Rehabilitación Integral (SRI)",
    "clasificacionEspecificaLabel": "Sala de Rehabilitación Integral (SRI)",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 0,
    "areasServicios": [
      "consulta_externa",
      "fisiatria",
      "gimnasio_terapeutico",
      "electroterapia",
      "hidroterapia",
      "terapia_ocupacional",
      "farmacia"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI / HUMNT Maturín",
    "observaciones": "Servicio de rehabilitación física, logopedia, podología y terapia ocupacional.",
    "elaboradoPor": {
      "nombre": "Lic. Fisioterapia",
      "ci": "V-20.345.678",
      "cargo": "Jefe de Sala SRI",
      "telefono": "0424-1122334",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "exacta"
  },
  {
    "id": "sri-23-de-enero",
    "nombre": "SRI 23 de Enero",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "san-simon",
    "parroquia": "San Simón (Casco Central)",
    "sector": "23 de Enero",
    "lat": 9.7535,
    "lng": -63.1875,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Sala de Rehabilitación Integral (SRI)",
    "clasificacionEspecificaLabel": "Sala de Rehabilitación Integral (SRI)",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 0,
    "areasServicios": [
      "consulta_externa",
      "fisiatria",
      "gimnasio_terapeutico",
      "electroterapia",
      "hidroterapia",
      "terapia_ocupacional",
      "farmacia"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI / HUMNT Maturín",
    "observaciones": "Servicio de rehabilitación física, logopedia, podología y terapia ocupacional.",
    "elaboradoPor": {
      "nombre": "Lic. Fisioterapia",
      "ci": "V-20.345.678",
      "cargo": "Jefe de Sala SRI",
      "telefono": "0424-1122334",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "sectorial"
  },
  {
    "id": "sri-boqueron",
    "nombre": "SRI Boquerón",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "boqueron",
    "parroquia": "Boquerón",
    "sector": "Boquerón Centro / Av. Alirio Ugarte Pelayo",
    "lat": 9.7891,
    "lng": -63.1895,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Sala de Rehabilitación Integral (SRI)",
    "clasificacionEspecificaLabel": "Sala de Rehabilitación Integral (SRI)",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 0,
    "areasServicios": [
      "consulta_externa",
      "fisiatria",
      "gimnasio_terapeutico",
      "electroterapia",
      "hidroterapia",
      "terapia_ocupacional",
      "farmacia"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI / HUMNT Maturín",
    "observaciones": "Servicio de rehabilitación física, logopedia, podología y terapia ocupacional.",
    "elaboradoPor": {
      "nombre": "Lic. Fisioterapia",
      "ci": "V-20.345.678",
      "cargo": "Jefe de Sala SRI",
      "telefono": "0424-1122334",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "exacta"
  },
  {
    "id": "sri-la-pica",
    "nombre": "SRI La Pica",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "la-pica",
    "parroquia": "La Pica",
    "sector": "La Pica Centro / Calle Principal",
    "lat": 9.7752,
    "lng": -63.0784,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Sala de Rehabilitación Integral (SRI)",
    "clasificacionEspecificaLabel": "Sala de Rehabilitación Integral (SRI)",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 0,
    "areasServicios": [
      "consulta_externa",
      "fisiatria",
      "gimnasio_terapeutico",
      "electroterapia",
      "hidroterapia",
      "terapia_ocupacional",
      "farmacia"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI / HUMNT Maturín",
    "observaciones": "Servicio de rehabilitación física, logopedia, podología y terapia ocupacional.",
    "elaboradoPor": {
      "nombre": "Lic. Fisioterapia",
      "ci": "V-20.345.678",
      "cargo": "Jefe de Sala SRI",
      "telefono": "0424-1122334",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "amarillo",
    "precision": "exacta"
  },
  {
    "id": "sri-el-furrial",
    "nombre": "SRI El Furrial",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "el-furrial",
    "parroquia": "El Furrial",
    "sector": "El Furrial / Sector La Florida",
    "lat": 9.7032,
    "lng": -63.4835,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Sala de Rehabilitación Integral (SRI)",
    "clasificacionEspecificaLabel": "Sala de Rehabilitación Integral (SRI)",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 0,
    "areasServicios": [
      "consulta_externa",
      "fisiatria",
      "gimnasio_terapeutico",
      "electroterapia",
      "hidroterapia",
      "terapia_ocupacional",
      "farmacia"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI / HUMNT Maturín",
    "observaciones": "Servicio de rehabilitación física, logopedia, podología y terapia ocupacional.",
    "elaboradoPor": {
      "nombre": "Lic. Fisioterapia",
      "ci": "V-20.345.678",
      "cargo": "Jefe de Sala SRI",
      "telefono": "0424-1122334",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "exacta"
  },
  {
    "id": "sri-punta-de-mata",
    "nombre": "SRI Punta de Mata",
    "municipioId": "ezequiel-zamora",
    "municipio": "Municipio Ezequiel Zamora",
    "parroquiaId": "punta-de-mata",
    "parroquia": "Punta de Mata",
    "sector": "Punta de Mata",
    "lat": 9.7145,
    "lng": -63.6275,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Sala de Rehabilitación Integral (SRI)",
    "clasificacionEspecificaLabel": "Sala de Rehabilitación Integral (SRI)",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 0,
    "areasServicios": [
      "consulta_externa",
      "fisiatria",
      "gimnasio_terapeutico",
      "electroterapia",
      "hidroterapia",
      "terapia_ocupacional",
      "farmacia"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI / HUMNT Maturín",
    "observaciones": "Servicio de rehabilitación física, logopedia, podología y terapia ocupacional.",
    "elaboradoPor": {
      "nombre": "Lic. Fisioterapia",
      "ci": "V-20.345.678",
      "cargo": "Jefe de Sala SRI",
      "telefono": "0424-1122334",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "amarillo",
    "precision": "sectorial"
  },
  {
    "id": "sri-caripito",
    "nombre": "SRI Caripito",
    "municipioId": "bolivar",
    "municipio": "Municipio Bolívar",
    "parroquiaId": "caripito",
    "parroquia": "Caripito",
    "sector": "Caripito",
    "lat": 10.1245,
    "lng": -63.1045,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Sala de Rehabilitación Integral (SRI)",
    "clasificacionEspecificaLabel": "Sala de Rehabilitación Integral (SRI)",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 0,
    "areasServicios": [
      "consulta_externa",
      "fisiatria",
      "gimnasio_terapeutico",
      "electroterapia",
      "hidroterapia",
      "terapia_ocupacional",
      "farmacia"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI / HUMNT Maturín",
    "observaciones": "Servicio de rehabilitación física, logopedia, podología y terapia ocupacional.",
    "elaboradoPor": {
      "nombre": "Lic. Fisioterapia",
      "ci": "V-20.345.678",
      "cargo": "Jefe de Sala SRI",
      "telefono": "0424-1122334",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "sectorial"
  },
  {
    "id": "sri-caripe",
    "nombre": "SRI Caripe",
    "municipioId": "caripe",
    "municipio": "Municipio Caripe",
    "parroquiaId": "caripe-centro",
    "parroquia": "Caripe",
    "sector": "Caripe",
    "lat": 10.1775,
    "lng": -63.4975,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Sala de Rehabilitación Integral (SRI)",
    "clasificacionEspecificaLabel": "Sala de Rehabilitación Integral (SRI)",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 0,
    "areasServicios": [
      "consulta_externa",
      "fisiatria",
      "gimnasio_terapeutico",
      "electroterapia",
      "hidroterapia",
      "terapia_ocupacional",
      "farmacia"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI / HUMNT Maturín",
    "observaciones": "Servicio de rehabilitación física, logopedia, podología y terapia ocupacional.",
    "elaboradoPor": {
      "nombre": "Lic. Fisioterapia",
      "ci": "V-20.345.678",
      "cargo": "Jefe de Sala SRI",
      "telefono": "0424-1122334",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "sectorial"
  },
  {
    "id": "sri-caicara",
    "nombre": "SRI Caicara de Maturín",
    "municipioId": "cedeno",
    "municipio": "Municipio Cedeño",
    "parroquiaId": "caicara",
    "parroquia": "Caicara",
    "sector": "Caicara",
    "lat": 9.8215,
    "lng": -63.6145,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Sala de Rehabilitación Integral (SRI)",
    "clasificacionEspecificaLabel": "Sala de Rehabilitación Integral (SRI)",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 0,
    "areasServicios": [
      "consulta_externa",
      "fisiatria",
      "gimnasio_terapeutico",
      "electroterapia",
      "hidroterapia",
      "terapia_ocupacional",
      "farmacia"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI / HUMNT Maturín",
    "observaciones": "Servicio de rehabilitación física, logopedia, podología y terapia ocupacional.",
    "elaboradoPor": {
      "nombre": "Lic. Fisioterapia",
      "ci": "V-20.345.678",
      "cargo": "Jefe de Sala SRI",
      "telefono": "0424-1122334",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "sectorial"
  },
  {
    "id": "sri-aragua",
    "nombre": "SRI Aragua de Maturín",
    "municipioId": "piar",
    "municipio": "Municipio Piar",
    "parroquiaId": "aragua",
    "parroquia": "Aragua de Maturín",
    "sector": "Aragua de Maturín / Sector Banco Obrero",
    "lat": 9.9735,
    "lng": -63.4842,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Sala de Rehabilitación Integral (SRI)",
    "clasificacionEspecificaLabel": "Sala de Rehabilitación Integral (SRI)",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 0,
    "areasServicios": [
      "consulta_externa",
      "fisiatria",
      "gimnasio_terapeutico",
      "electroterapia",
      "hidroterapia",
      "terapia_ocupacional",
      "farmacia"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI / HUMNT Maturín",
    "observaciones": "Servicio de rehabilitación física, logopedia, podología y terapia ocupacional.",
    "elaboradoPor": {
      "nombre": "Lic. Fisioterapia",
      "ci": "V-20.345.678",
      "cargo": "Jefe de Sala SRI",
      "telefono": "0424-1122334",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "exacta"
  },
  {
    "id": "sri-quiriquire",
    "nombre": "SRI Quiriquire",
    "municipioId": "punceres",
    "municipio": "Municipio Punceres",
    "parroquiaId": "quiriquire",
    "parroquia": "Quiriquire",
    "sector": "Quiriquire",
    "lat": 9.9745,
    "lng": -63.2145,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Sala de Rehabilitación Integral (SRI)",
    "clasificacionEspecificaLabel": "Sala de Rehabilitación Integral (SRI)",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 0,
    "areasServicios": [
      "consulta_externa",
      "fisiatria",
      "gimnasio_terapeutico",
      "electroterapia",
      "hidroterapia",
      "terapia_ocupacional",
      "farmacia"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI / HUMNT Maturín",
    "observaciones": "Servicio de rehabilitación física, logopedia, podología y terapia ocupacional.",
    "elaboradoPor": {
      "nombre": "Lic. Fisioterapia",
      "ci": "V-20.345.678",
      "cargo": "Jefe de Sala SRI",
      "telefono": "0424-1122334",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "amarillo",
    "precision": "sectorial"
  },
  {
    "id": "sri-temblador",
    "nombre": "SRI Temblador",
    "municipioId": "libertador",
    "municipio": "Municipio Libertador",
    "parroquiaId": "temblador",
    "parroquia": "Temblador",
    "sector": "Temblador",
    "lat": 9.0245,
    "lng": -62.7145,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Sala de Rehabilitación Integral (SRI)",
    "clasificacionEspecificaLabel": "Sala de Rehabilitación Integral (SRI)",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 0,
    "areasServicios": [
      "consulta_externa",
      "fisiatria",
      "gimnasio_terapeutico",
      "electroterapia",
      "hidroterapia",
      "terapia_ocupacional",
      "farmacia"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI / HUMNT Maturín",
    "observaciones": "Servicio de rehabilitación física, logopedia, podología y terapia ocupacional.",
    "elaboradoPor": {
      "nombre": "Lic. Fisioterapia",
      "ci": "V-20.345.678",
      "cargo": "Jefe de Sala SRI",
      "telefono": "0424-1122334",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "amarillo",
    "precision": "sectorial"
  },
  {
    "id": "sri-barrancas",
    "nombre": "SRI Barrancas",
    "municipioId": "sotillo",
    "municipio": "Municipio Sotillo",
    "parroquiaId": "barrancas",
    "parroquia": "Barrancas",
    "sector": "Barrancas",
    "lat": 8.7045,
    "lng": -62.1845,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Sala de Rehabilitación Integral (SRI)",
    "clasificacionEspecificaLabel": "Sala de Rehabilitación Integral (SRI)",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 0,
    "areasServicios": [
      "consulta_externa",
      "fisiatria",
      "gimnasio_terapeutico",
      "electroterapia",
      "hidroterapia",
      "terapia_ocupacional",
      "farmacia"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI / HUMNT Maturín",
    "observaciones": "Servicio de rehabilitación física, logopedia, podología y terapia ocupacional.",
    "elaboradoPor": {
      "nombre": "Lic. Fisioterapia",
      "ci": "V-20.345.678",
      "cargo": "Jefe de Sala SRI",
      "telefono": "0424-1122334",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "amarillo",
    "precision": "sectorial"
  },
  {
    "id": "sri-aguasay",
    "nombre": "SRI Aguasay",
    "municipioId": "aguasay",
    "municipio": "Municipio Aguasay",
    "parroquiaId": "aguasay-centro",
    "parroquia": "Aguasay",
    "sector": "Aguasay",
    "lat": 9.4245,
    "lng": -63.8145,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Sala de Rehabilitación Integral (SRI)",
    "clasificacionEspecificaLabel": "Sala de Rehabilitación Integral (SRI)",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 0,
    "areasServicios": [
      "consulta_externa",
      "fisiatria",
      "gimnasio_terapeutico",
      "electroterapia",
      "hidroterapia",
      "terapia_ocupacional",
      "farmacia"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI / HUMNT Maturín",
    "observaciones": "Servicio de rehabilitación física, logopedia, podología y terapia ocupacional.",
    "elaboradoPor": {
      "nombre": "Lic. Fisioterapia",
      "ci": "V-20.345.678",
      "cargo": "Jefe de Sala SRI",
      "telefono": "0424-1122334",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "sectorial"
  },
  {
    "id": "sri-santa-barbara",
    "nombre": "SRI Santa Bárbara",
    "municipioId": "santa-barbara",
    "municipio": "Municipio Santa Bárbara",
    "parroquiaId": "santa-barbara-centro",
    "parroquia": "Santa Bárbara",
    "sector": "Santa Bárbara",
    "lat": 9.5845,
    "lng": -63.6145,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI, CAT)",
    "clasificacionEspecifica": "Sala de Rehabilitación Integral (SRI)",
    "clasificacionEspecificaLabel": "Sala de Rehabilitación Integral (SRI)",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 0,
    "areasServicios": [
      "consulta_externa",
      "fisiatria",
      "gimnasio_terapeutico",
      "electroterapia",
      "hidroterapia",
      "terapia_ocupacional",
      "farmacia"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "100% Operativa"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI / HUMNT Maturín",
    "observaciones": "Servicio de rehabilitación física, logopedia, podología y terapia ocupacional.",
    "elaboradoPor": {
      "nombre": "Lic. Fisioterapia",
      "ci": "V-20.345.678",
      "cargo": "Jefe de Sala SRI",
      "telefono": "0424-1122334",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "sectorial"
  },
  {
    "id": "amb-vargas",
    "nombre": "Ambulatorio Urbano Dr. José María Vargas",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "alto-de-los-godos",
    "parroquia": "Alto de Los Godos",
    "sector": "Av. José María Vargas / Los Godos",
    "lat": 9.71751,
    "lng": -63.20721,
    "tipoRed": "ambulatoria",
    "tipoRedLabel": "Red Ambulatoria Especializada (Urbana / Rural)",
    "clasificacionEspecifica": "Amb. Urbano III",
    "clasificacionEspecificaLabel": "Amb. Urbano III",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 2,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI de la Parroquia / Hospital Base",
    "observaciones": "Atención primaria comunitaria, control prenatal, inmunización y triaje ambulatorio.",
    "elaboradoPor": {
      "nombre": "Dr. Médico Rural",
      "ci": "V-22.334.455",
      "cargo": "Médico Rural",
      "telefono": "0424-9988112",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "exacta"
  },
  {
    "id": "amb-serres-padilla",
    "nombre": "Ambulatorio Dr. Marcos Serres Padilla",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "las-cocuizas",
    "parroquia": "Las Cocuizas",
    "sector": "Las Cocuizas / Calle 3",
    "lat": 9.76341,
    "lng": -63.14465,
    "tipoRed": "ambulatoria",
    "tipoRedLabel": "Red Ambulatoria Especializada (Urbana / Rural)",
    "clasificacionEspecifica": "Amb. Urbano II",
    "clasificacionEspecificaLabel": "Amb. Urbano II",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 2,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI de la Parroquia / Hospital Base",
    "observaciones": "Atención primaria comunitaria, control prenatal, inmunización y triaje ambulatorio.",
    "elaboradoPor": {
      "nombre": "Dr. Médico Rural",
      "ci": "V-22.334.455",
      "cargo": "Médico Rural",
      "telefono": "0424-9988112",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "exacta"
  },
  {
    "id": "amb-sabana-grande",
    "nombre": "Ambulatorio Sabana Grande",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "las-cocuizas",
    "parroquia": "Las Cocuizas",
    "sector": "Sabana Grande / Sector 1",
    "lat": 9.75447,
    "lng": -63.1319,
    "tipoRed": "ambulatoria",
    "tipoRedLabel": "Red Ambulatoria Especializada (Urbana / Rural)",
    "clasificacionEspecifica": "Amb. Urbano I",
    "clasificacionEspecificaLabel": "Amb. Urbano I",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 2,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "No tiene",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "sin_planta"
      ],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI de la Parroquia / Hospital Base",
    "observaciones": "Atención primaria comunitaria, control prenatal, inmunización y triaje ambulatorio.",
    "elaboradoPor": {
      "nombre": "Dr. Médico Rural",
      "ci": "V-22.334.455",
      "cargo": "Médico Rural",
      "telefono": "0424-9988112",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "amarillo",
    "precision": "exacta"
  },
  {
    "id": "amb-19-de-abril",
    "nombre": "Consultorio Popular Tipo 3 (CPT3) 19 de Abril",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "san-simon",
    "parroquia": "San Simón (Casco Central)",
    "sector": "Sector 19 de Abril",
    "lat": 9.741,
    "lng": -63.169,
    "tipoRed": "ambulatoria",
    "tipoRedLabel": "Red Ambulatoria Especializada (Urbana / Rural)",
    "clasificacionEspecifica": "Consultorio Popular (CPT)",
    "clasificacionEspecificaLabel": "Consultorio Popular (CPT)",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 2,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "No tiene",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "sin_planta"
      ],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI de la Parroquia / Hospital Base",
    "observaciones": "Atención primaria comunitaria, control prenatal, inmunización y triaje ambulatorio.",
    "elaboradoPor": {
      "nombre": "Dr. Médico Rural",
      "ci": "V-22.334.455",
      "cargo": "Médico Rural",
      "telefono": "0424-9988112",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "sectorial"
  },
  {
    "id": "amb-la-puente",
    "nombre": "Ambulatorio La Puente",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "alto-de-los-godos",
    "parroquia": "Alto de Los Godos",
    "sector": "La Puente / Vía Principal",
    "lat": 9.73312,
    "lng": -63.23203,
    "tipoRed": "ambulatoria",
    "tipoRedLabel": "Red Ambulatoria Especializada (Urbana / Rural)",
    "clasificacionEspecifica": "Amb. Urbano I",
    "clasificacionEspecificaLabel": "Amb. Urbano I",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 2,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "No tiene",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "sin_planta"
      ],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI de la Parroquia / Hospital Base",
    "observaciones": "Atención primaria comunitaria, control prenatal, inmunización y triaje ambulatorio.",
    "elaboradoPor": {
      "nombre": "Dr. Médico Rural",
      "ci": "V-22.334.455",
      "cargo": "Médico Rural",
      "telefono": "0424-9988112",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "amarillo",
    "precision": "exacta"
  },
  {
    "id": "amb-fundemos",
    "nombre": "Ambulatorio Fundemos",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "alto-de-los-godos",
    "parroquia": "Alto de Los Godos",
    "sector": "Los Godos / Fundemos",
    "lat": 9.72292,
    "lng": -63.20686,
    "tipoRed": "ambulatoria",
    "tipoRedLabel": "Red Ambulatoria Especializada (Urbana / Rural)",
    "clasificacionEspecifica": "Amb. Urbano I",
    "clasificacionEspecificaLabel": "Amb. Urbano I",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 2,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "No tiene",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "sin_planta"
      ],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI de la Parroquia / Hospital Base",
    "observaciones": "Atención primaria comunitaria, control prenatal, inmunización y triaje ambulatorio.",
    "elaboradoPor": {
      "nombre": "Dr. Médico Rural",
      "ci": "V-22.334.455",
      "cargo": "Médico Rural",
      "telefono": "0424-9988112",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "exacta"
  },
  {
    "id": "amb-morichal",
    "nombre": "Ambulatorio Morichal",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "alto-de-los-godos",
    "parroquia": "Alto de Los Godos",
    "sector": "Morichal / Sector B",
    "lat": 9.729,
    "lng": -63.198,
    "tipoRed": "ambulatoria",
    "tipoRedLabel": "Red Ambulatoria Especializada (Urbana / Rural)",
    "clasificacionEspecifica": "Amb. Urbano I",
    "clasificacionEspecificaLabel": "Amb. Urbano I",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 2,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "No tiene",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "sin_planta"
      ],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI de la Parroquia / Hospital Base",
    "observaciones": "Atención primaria comunitaria, control prenatal, inmunización y triaje ambulatorio.",
    "elaboradoPor": {
      "nombre": "Dr. Médico Rural",
      "ci": "V-22.334.455",
      "cargo": "Médico Rural",
      "telefono": "0424-9988112",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "sectorial"
  },
  {
    "id": "amb-tipuro",
    "nombre": "Ambulatorio Tipuro",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "boqueron",
    "parroquia": "Boquerón",
    "sector": "Tipuro 2",
    "lat": 9.795,
    "lng": -63.188,
    "tipoRed": "ambulatoria",
    "tipoRedLabel": "Red Ambulatoria Especializada (Urbana / Rural)",
    "clasificacionEspecifica": "Amb. Urbano I",
    "clasificacionEspecificaLabel": "Amb. Urbano I",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 2,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "No tiene",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "sin_planta"
      ],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI de la Parroquia / Hospital Base",
    "observaciones": "Atención primaria comunitaria, control prenatal, inmunización y triaje ambulatorio.",
    "elaboradoPor": {
      "nombre": "Dr. Médico Rural",
      "ci": "V-22.334.455",
      "cargo": "Médico Rural",
      "telefono": "0424-9988112",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "sectorial"
  },
  {
    "id": "amb-palma-real",
    "nombre": "Ambulatorio Palma Real",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "boqueron",
    "parroquia": "Boquerón",
    "sector": "Palma Real Centro",
    "lat": 9.802,
    "lng": -63.195,
    "tipoRed": "ambulatoria",
    "tipoRedLabel": "Red Ambulatoria Especializada (Urbana / Rural)",
    "clasificacionEspecifica": "Amb. Urbano I",
    "clasificacionEspecificaLabel": "Amb. Urbano I",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 2,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "No tiene",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "sin_planta"
      ],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI de la Parroquia / Hospital Base",
    "observaciones": "Atención primaria comunitaria, control prenatal, inmunización y triaje ambulatorio.",
    "elaboradoPor": {
      "nombre": "Dr. Médico Rural",
      "ci": "V-22.334.455",
      "cargo": "Médico Rural",
      "telefono": "0424-9988112",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "sectorial"
  },
  {
    "id": "amb-costo-arriba",
    "nombre": "Ambulatorio Costo Arriba",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "boqueron",
    "parroquia": "Boquerón",
    "sector": "Costo Arriba",
    "lat": 9.825,
    "lng": -63.178,
    "tipoRed": "ambulatoria",
    "tipoRedLabel": "Red Ambulatoria Especializada (Urbana / Rural)",
    "clasificacionEspecifica": "Amb. Rural II",
    "clasificacionEspecificaLabel": "Amb. Rural II",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 2,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "No tiene",
      "suministroAgua": "Cisterna",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "sin_planta"
      ],
      "hidrosanitarias": [
        "sin_agua_tuberia"
      ],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI de la Parroquia / Hospital Base",
    "observaciones": "Atención primaria comunitaria, control prenatal, inmunización y triaje ambulatorio.",
    "elaboradoPor": {
      "nombre": "Dr. Médico Rural",
      "ci": "V-22.334.455",
      "cargo": "Médico Rural",
      "telefono": "0424-9988112",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "amarillo",
    "precision": "sectorial"
  },
  {
    "id": "amb-viboral",
    "nombre": "Ambulatorio Viboral",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "boqueron",
    "parroquia": "Boquerón",
    "sector": "Viboral Centro / Cerca Escuela Santa Elena",
    "lat": 9.78368,
    "lng": -63.20465,
    "tipoRed": "ambulatoria",
    "tipoRedLabel": "Red Ambulatoria Especializada (Urbana / Rural)",
    "clasificacionEspecifica": "Amb. Rural I",
    "clasificacionEspecificaLabel": "Amb. Rural I",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 2,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "No tiene",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "sin_planta"
      ],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI de la Parroquia / Hospital Base",
    "observaciones": "Atención primaria comunitaria, control prenatal, inmunización y triaje ambulatorio.",
    "elaboradoPor": {
      "nombre": "Dr. Médico Rural",
      "ci": "V-22.334.455",
      "cargo": "Médico Rural",
      "telefono": "0424-9988112",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "exacta"
  },
  {
    "id": "amb-el-corozo",
    "nombre": "Ambulatorio El Corozo",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "el-corozo",
    "parroquia": "El Corozo",
    "sector": "El Corozo Casco",
    "lat": 9.685,
    "lng": -63.285,
    "tipoRed": "ambulatoria",
    "tipoRedLabel": "Red Ambulatoria Especializada (Urbana / Rural)",
    "clasificacionEspecifica": "Amb. Rural II",
    "clasificacionEspecificaLabel": "Amb. Rural II",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 2,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "No tiene",
      "suministroAgua": "Cisterna",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "sin_planta"
      ],
      "hidrosanitarias": [
        "sin_agua_tuberia"
      ],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI de la Parroquia / Hospital Base",
    "observaciones": "Atención primaria comunitaria, control prenatal, inmunización y triaje ambulatorio.",
    "elaboradoPor": {
      "nombre": "Dr. Médico Rural",
      "ci": "V-22.334.455",
      "cargo": "Médico Rural",
      "telefono": "0424-9988112",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "rojo",
    "precision": "sectorial"
  },
  {
    "id": "amb-san-vicente",
    "nombre": "Ambulatorio San Vicente",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "san-vicente",
    "parroquia": "San Vicente",
    "sector": "San Vicente",
    "lat": 9.725,
    "lng": -63.268,
    "tipoRed": "ambulatoria",
    "tipoRedLabel": "Red Ambulatoria Especializada (Urbana / Rural)",
    "clasificacionEspecifica": "Amb. Urbano I",
    "clasificacionEspecificaLabel": "Amb. Urbano I",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 2,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "No tiene",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "sin_planta"
      ],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI de la Parroquia / Hospital Base",
    "observaciones": "Atención primaria comunitaria, control prenatal, inmunización y triaje ambulatorio.",
    "elaboradoPor": {
      "nombre": "Dr. Médico Rural",
      "ci": "V-22.334.455",
      "cargo": "Médico Rural",
      "telefono": "0424-9988112",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "amarillo",
    "precision": "sectorial"
  },
  {
    "id": "amb-la-cruz",
    "nombre": "Ambulatorio La Cruz",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "santa-cruz",
    "parroquia": "Santa Cruz (La Cruz)",
    "sector": "Casco La Cruz",
    "lat": 9.764,
    "lng": -63.225,
    "tipoRed": "ambulatoria",
    "tipoRedLabel": "Red Ambulatoria Especializada (Urbana / Rural)",
    "clasificacionEspecifica": "Amb. Urbano II",
    "clasificacionEspecificaLabel": "Amb. Urbano II",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 2,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI de la Parroquia / Hospital Base",
    "observaciones": "Atención primaria comunitaria, control prenatal, inmunización y triaje ambulatorio.",
    "elaboradoPor": {
      "nombre": "Dr. Médico Rural",
      "ci": "V-22.334.455",
      "cargo": "Médico Rural",
      "telefono": "0424-9988112",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "sectorial"
  },
  {
    "id": "amb-san-simon-sur",
    "nombre": "Ambulatorio El Furrialito",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "san-simon-sur",
    "parroquia": "San Simón Sur",
    "sector": "San Simón Sur",
    "lat": 9.3636,
    "lng": -62.8426,
    "tipoRed": "ambulatoria",
    "tipoRedLabel": "Red Ambulatoria Especializada (Urbana / Rural)",
    "clasificacionEspecifica": "Amb. Rural I",
    "clasificacionEspecificaLabel": "Amb. Rural I",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 2,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "No tiene",
      "suministroAgua": "Cisterna",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "sin_planta"
      ],
      "hidrosanitarias": [
        "sin_agua_tuberia"
      ],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI de la Parroquia / Hospital Base",
    "observaciones": "Atención primaria comunitaria, control prenatal, inmunización y triaje ambulatorio.",
    "elaboradoPor": {
      "nombre": "Dr. Médico Rural",
      "ci": "V-22.334.455",
      "cargo": "Médico Rural",
      "telefono": "0424-9988112",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "rojo",
    "precision": "sectorial"
  },
  {
    "id": "amb-taguaya",
    "nombre": "Ambulatorio Rural Taguaya",
    "municipioId": "piar",
    "municipio": "Municipio Piar",
    "parroquiaId": "taguaya",
    "parroquia": "Taguaya",
    "sector": "Taguaya Centro",
    "lat": 9.905,
    "lng": -63.355,
    "tipoRed": "ambulatoria",
    "tipoRedLabel": "Red Ambulatoria Especializada (Urbana / Rural)",
    "clasificacionEspecifica": "Amb. Rural II",
    "clasificacionEspecificaLabel": "Amb. Rural II",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 2,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "No tiene",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "sin_planta"
      ],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI de la Parroquia / Hospital Base",
    "observaciones": "Atención primaria comunitaria, control prenatal, inmunización y triaje ambulatorio.",
    "elaboradoPor": {
      "nombre": "Dr. Médico Rural",
      "ci": "V-22.334.455",
      "cargo": "Médico Rural",
      "telefono": "0424-9988112",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "sectorial"
  },
  {
    "id": "amb-aparicio",
    "nombre": "Ambulatorio Rural Aparicio",
    "municipioId": "piar",
    "municipio": "Municipio Piar",
    "parroquiaId": "aparicio",
    "parroquia": "Aparicio",
    "sector": "Aparicio Centro",
    "lat": 9.985,
    "lng": -63.565,
    "tipoRed": "ambulatoria",
    "tipoRedLabel": "Red Ambulatoria Especializada (Urbana / Rural)",
    "clasificacionEspecifica": "Amb. Rural II",
    "clasificacionEspecificaLabel": "Amb. Rural II",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 2,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "No tiene",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "sin_planta"
      ],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI de la Parroquia / Hospital Base",
    "observaciones": "Atención primaria comunitaria, control prenatal, inmunización y triaje ambulatorio.",
    "elaboradoPor": {
      "nombre": "Dr. Médico Rural",
      "ci": "V-22.334.455",
      "cargo": "Médico Rural",
      "telefono": "0424-9988112",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "sectorial"
  },
  {
    "id": "amb-chaguaramal",
    "nombre": "Ambulatorio Rural Chaguaramal",
    "municipioId": "piar",
    "municipio": "Municipio Piar",
    "parroquiaId": "chaguaramal",
    "parroquia": "Chaguaramal",
    "sector": "Chaguaramal",
    "lat": 9.945,
    "lng": -63.415,
    "tipoRed": "ambulatoria",
    "tipoRedLabel": "Red Ambulatoria Especializada (Urbana / Rural)",
    "clasificacionEspecifica": "Amb. Rural II",
    "clasificacionEspecificaLabel": "Amb. Rural II",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 2,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "No tiene",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "sin_planta"
      ],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI de la Parroquia / Hospital Base",
    "observaciones": "Atención primaria comunitaria, control prenatal, inmunización y triaje ambulatorio.",
    "elaboradoPor": {
      "nombre": "Dr. Médico Rural",
      "ci": "V-22.334.455",
      "cargo": "Médico Rural",
      "telefono": "0424-9988112",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "sectorial"
  },
  {
    "id": "amb-guanaguana",
    "nombre": "Ambulatorio Rural Guanaguana",
    "municipioId": "piar",
    "municipio": "Municipio Piar",
    "parroquiaId": "guanaguana",
    "parroquia": "Guanaguana",
    "sector": "Guanaguana Centro",
    "lat": 10.055,
    "lng": -63.525,
    "tipoRed": "ambulatoria",
    "tipoRedLabel": "Red Ambulatoria Especializada (Urbana / Rural)",
    "clasificacionEspecifica": "Amb. Rural II",
    "clasificacionEspecificaLabel": "Amb. Rural II",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 2,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "No tiene",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "sin_planta"
      ],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI de la Parroquia / Hospital Base",
    "observaciones": "Atención primaria comunitaria, control prenatal, inmunización y triaje ambulatorio.",
    "elaboradoPor": {
      "nombre": "Dr. Médico Rural",
      "ci": "V-22.334.455",
      "cargo": "Médico Rural",
      "telefono": "0424-9988112",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "sectorial"
  },
  {
    "id": "amb-la-toscana",
    "nombre": "Ambulatorio Rural La Toscana",
    "municipioId": "piar",
    "municipio": "Municipio Piar",
    "parroquiaId": "la-toscana",
    "parroquia": "La Toscana",
    "sector": "La Toscana",
    "lat": 9.855,
    "lng": -63.425,
    "tipoRed": "ambulatoria",
    "tipoRedLabel": "Red Ambulatoria Especializada (Urbana / Rural)",
    "clasificacionEspecifica": "Amb. Rural II",
    "clasificacionEspecificaLabel": "Amb. Rural II",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 2,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI de la Parroquia / Hospital Base",
    "observaciones": "Atención primaria comunitaria, control prenatal, inmunización y triaje ambulatorio.",
    "elaboradoPor": {
      "nombre": "Dr. Médico Rural",
      "ci": "V-22.334.455",
      "cargo": "Médico Rural",
      "telefono": "0424-9988112",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "sectorial"
  },
  {
    "id": "amb-el-pinto",
    "nombre": "Ambulatorio Rural El Pinto",
    "municipioId": "punceres",
    "municipio": "Municipio Punceres",
    "parroquiaId": "cachipo",
    "parroquia": "Cachipo",
    "sector": "El Pinto Centro",
    "lat": 9.915,
    "lng": -63.235,
    "tipoRed": "ambulatoria",
    "tipoRedLabel": "Red Ambulatoria Especializada (Urbana / Rural)",
    "clasificacionEspecifica": "Amb. Rural II",
    "clasificacionEspecificaLabel": "Amb. Rural II",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 2,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "No tiene",
      "suministroAgua": "Cisterna",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "sin_planta"
      ],
      "hidrosanitarias": [
        "sin_agua_tuberia"
      ],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI de la Parroquia / Hospital Base",
    "observaciones": "Atención primaria comunitaria, control prenatal, inmunización y triaje ambulatorio.",
    "elaboradoPor": {
      "nombre": "Dr. Médico Rural",
      "ci": "V-22.334.455",
      "cargo": "Médico Rural",
      "telefono": "0424-9988112",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "amarillo",
    "precision": "sectorial"
  },
  {
    "id": "amb-areo",
    "nombre": "Ambulatorio Rural Areo",
    "municipioId": "cedeno",
    "municipio": "Municipio Cedeño",
    "parroquiaId": "areo",
    "parroquia": "Areo",
    "sector": "Areo Centro",
    "lat": 9.782,
    "lng": -63.745,
    "tipoRed": "ambulatoria",
    "tipoRedLabel": "Red Ambulatoria Especializada (Urbana / Rural)",
    "clasificacionEspecifica": "Amb. Rural II",
    "clasificacionEspecificaLabel": "Amb. Rural II",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 2,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "No tiene",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "sin_planta"
      ],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI de la Parroquia / Hospital Base",
    "observaciones": "Atención primaria comunitaria, control prenatal, inmunización y triaje ambulatorio.",
    "elaboradoPor": {
      "nombre": "Dr. Médico Rural",
      "ci": "V-22.334.455",
      "cargo": "Médico Rural",
      "telefono": "0424-9988112",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "sectorial"
  },
  {
    "id": "amb-viento-fresco",
    "nombre": "Ambulatorio Rural Viento Fresco",
    "municipioId": "cedeno",
    "municipio": "Municipio Cedeño",
    "parroquiaId": "viento-fresco",
    "parroquia": "Viento Fresco",
    "sector": "Viento Fresco",
    "lat": 9.712,
    "lng": -63.685,
    "tipoRed": "ambulatoria",
    "tipoRedLabel": "Red Ambulatoria Especializada (Urbana / Rural)",
    "clasificacionEspecifica": "Amb. Rural II",
    "clasificacionEspecificaLabel": "Amb. Rural II",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 2,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "No tiene",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "sin_planta"
      ],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI de la Parroquia / Hospital Base",
    "observaciones": "Atención primaria comunitaria, control prenatal, inmunización y triaje ambulatorio.",
    "elaboradoPor": {
      "nombre": "Dr. Médico Rural",
      "ci": "V-22.334.455",
      "cargo": "Médico Rural",
      "telefono": "0424-9988112",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "sectorial"
  },
  {
    "id": "amb-teresen",
    "nombre": "Ambulatorio Rural Teresén",
    "municipioId": "caripe",
    "municipio": "Municipio Caripe",
    "parroquiaId": "teresen",
    "parroquia": "Teresén",
    "sector": "Teresén",
    "lat": 10.145,
    "lng": -63.465,
    "tipoRed": "ambulatoria",
    "tipoRedLabel": "Red Ambulatoria Especializada (Urbana / Rural)",
    "clasificacionEspecifica": "Amb. Rural II",
    "clasificacionEspecificaLabel": "Amb. Rural II",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 2,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "No tiene",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "sin_planta"
      ],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI de la Parroquia / Hospital Base",
    "observaciones": "Atención primaria comunitaria, control prenatal, inmunización y triaje ambulatorio.",
    "elaboradoPor": {
      "nombre": "Dr. Médico Rural",
      "ci": "V-22.334.455",
      "cargo": "Médico Rural",
      "telefono": "0424-9988112",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "sectorial"
  },
  {
    "id": "amb-la-guanota",
    "nombre": "Ambulatorio Rural La Guanota",
    "municipioId": "caripe",
    "municipio": "Municipio Caripe",
    "parroquiaId": "la-guanota",
    "parroquia": "La Guanota",
    "sector": "La Guanota",
    "lat": 10.215,
    "lng": -63.505,
    "tipoRed": "ambulatoria",
    "tipoRedLabel": "Red Ambulatoria Especializada (Urbana / Rural)",
    "clasificacionEspecifica": "Amb. Rural I",
    "clasificacionEspecificaLabel": "Amb. Rural I",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 2,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "No tiene",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "sin_planta"
      ],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI de la Parroquia / Hospital Base",
    "observaciones": "Atención primaria comunitaria, control prenatal, inmunización y triaje ambulatorio.",
    "elaboradoPor": {
      "nombre": "Dr. Médico Rural",
      "ci": "V-22.334.455",
      "cargo": "Médico Rural",
      "telefono": "0424-9988112",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "sectorial"
  },
  {
    "id": "amb-san-francisco",
    "nombre": "Ambulatorio Rural San Francisco",
    "municipioId": "acosta",
    "municipio": "Municipio Acosta",
    "parroquiaId": "san-francisco",
    "parroquia": "San Francisco",
    "sector": "San Francisco",
    "lat": 10.065,
    "lng": -63.675,
    "tipoRed": "ambulatoria",
    "tipoRedLabel": "Red Ambulatoria Especializada (Urbana / Rural)",
    "clasificacionEspecifica": "Amb. Rural II",
    "clasificacionEspecificaLabel": "Amb. Rural II",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 2,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "No tiene",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "sin_planta"
      ],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI de la Parroquia / Hospital Base",
    "observaciones": "Atención primaria comunitaria, control prenatal, inmunización y triaje ambulatorio.",
    "elaboradoPor": {
      "nombre": "Dr. Médico Rural",
      "ci": "V-22.334.455",
      "cargo": "Médico Rural",
      "telefono": "0424-9988112",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde",
    "precision": "sectorial"
  },
  {
    "id": "amb-chaguaramas",
    "nombre": "Ambulatorio Rural Chaguaramas",
    "municipioId": "libertador",
    "municipio": "Municipio Libertador",
    "parroquiaId": "chaguaramas",
    "parroquia": "Chaguaramas",
    "sector": "Chaguaramas",
    "lat": 9.095,
    "lng": -62.675,
    "tipoRed": "ambulatoria",
    "tipoRedLabel": "Red Ambulatoria Especializada (Urbana / Rural)",
    "clasificacionEspecifica": "Amb. Rural II",
    "clasificacionEspecificaLabel": "Amb. Rural II",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 2,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "No tiene",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "sin_planta"
      ],
      "hidrosanitarias": [],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI de la Parroquia / Hospital Base",
    "observaciones": "Atención primaria comunitaria, control prenatal, inmunización y triaje ambulatorio.",
    "elaboradoPor": {
      "nombre": "Dr. Médico Rural",
      "ci": "V-22.334.455",
      "cargo": "Médico Rural",
      "telefono": "0424-9988112",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "amarillo",
    "precision": "sectorial"
  },
  {
    "id": "amb-tabasca",
    "nombre": "Ambulatorio Rural Tabasca",
    "municipioId": "libertador",
    "municipio": "Municipio Libertador",
    "parroquiaId": "tabasca",
    "parroquia": "Tabasca",
    "sector": "Tabasca",
    "lat": 9.155,
    "lng": -62.615,
    "tipoRed": "ambulatoria",
    "tipoRedLabel": "Red Ambulatoria Especializada (Urbana / Rural)",
    "clasificacionEspecifica": "Amb. Rural I",
    "clasificacionEspecificaLabel": "Amb. Rural I",
    "quirofanosTotal": 0,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 2,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "No tiene",
      "suministroAgua": "Cisterna",
      "gasesMedicinales": "Inexistente",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "sin_planta"
      ],
      "hidrosanitarias": [
        "sin_agua_tuberia"
      ],
      "estructurales": [],
      "climatizacion": [],
      "bioseguridad": []
    },
    "redRemision": "CDI de la Parroquia / Hospital Base",
    "observaciones": "Atención primaria comunitaria, control prenatal, inmunización y triaje ambulatorio.",
    "elaboradoPor": {
      "nombre": "Dr. Médico Rural",
      "ci": "V-22.334.455",
      "cargo": "Médico Rural",
      "telefono": "0424-9988112",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "rojo",
    "precision": "sectorial"
  }
];




  // Exportar al objeto global window
  window.CATALOGO_TERRITORIAL = CATALOGO_TERRITORIAL;
  window.CATALOGO_TIPOS_ESTABLECIMIENTO = CATALOGO_TIPOS_ESTABLECIMIENTO;
  window.CATALOGO_AREAS_SERVICIOS = CATALOGO_AREAS_SERVICIOS;
  window.CATALOGO_FALLAS = CATALOGO_FALLAS;
  window.OPCIONES_SOPORTE_VITAL = OPCIONES_SOPORTE_VITAL;
  window.CENTROS_SALUD_INICIALES = CENTROS_SALUD_INICIALES;
})(typeof window !== 'undefined' ? window : this);
