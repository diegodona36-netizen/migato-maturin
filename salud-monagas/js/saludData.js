/**
 * MIGATO • Módulo 5: Pre-Diagnóstico de Infraestructura Sanitaria y Hospitalaria
 * Catálogo Territorial de Monagas (13 Municipios, 45 Parroquias), Normativa MPPS y Registros Base
 */

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
    "estado": "Monagas",
    "area": "Salud",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "san-simon",
    "parroquia": "San Simón (Casco Central)",
    "sector": "Av. Bicentenario / Casco Central",
    "lat": 9.7483,
    "lng": -63.1785,
    "tipoRed": "hospitalaria",
    "tipoRedLabel": "Red Hospitalaria Especializada (Tipo I, II, III, IV)",
    "clasificacionEspecifica": "Hospital Tipo IV",
    "clasificacionEspecificaLabel": "Hospital Tipo IV (Central / Universitario)",
    "quirofanosTotal": 8,
    "quirofanosOperativos": 4,
    "camasHospitalizacion": 420,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "emergencia_pediatrica",
      "sala_partos",
      "quirofanos",
      "hospitalizacion",
      "aislamiento",
      "inmunizacion",
      "laboratorio",
      "imagenologia",
      "banco_sangre",
      "farmacia",
      "desechos",
      "lavanderia",
      "morgue",
      "ambulancia"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Red Central",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "sin_ats",
        "fluctuaciones"
      ],
      "hidrosanitarias": [
        "fuga_tuberias",
        "banos_inoperativos"
      ],
      "estructurales": [
        "filtraciones_techo",
        "cielo_raso_caido",
        "pisos_agrietados"
      ],
      "climatizacion": [
        "quirofanos_sin_clima",
        "emergencia_sin_clima"
      ],
      "bioseguridad": [
        "sin_ruta_diferenciada",
        "falta_ambulancia"
      ]
    },
    "redRemision": "Centro de Máxima Resolución del Estado Monagas y Oriente Sur",
    "observaciones": "Requiere rehabilitación integral de climatización en quirófanos de trauma shock y sustitución de luminarias cialíticas. Los tanques de reserva subterránea tienen bomba operativa.",
    "elaboradoPor": {
      "nombre": "Dr. Carlos Mendoza",
      "ci": "V-14.892.410",
      "cargo": "Director Médico Regional / Enlace Sala de Mando",
      "telefono": "0414-7654321",
      "fecha": "2026-09-12"
    },
    "nivelRiesgo": "amarillo"
  },
  {
    "id": "hosp-simon-bolivar",
    "nombre": "Hospital Dr. Simón Bolívar",
    "estado": "Monagas",
    "area": "Salud",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "santa-cruz",
    "parroquia": "Santa Cruz (La Cruz)",
    "sector": "Zona Industrial / La Cruz",
    "lat": 9.731,
    "lng": -63.242,
    "tipoRed": "hospitalaria",
    "tipoRedLabel": "Red Hospitalaria Especializada (Tipo I, II, III, IV)",
    "clasificacionEspecifica": "Hospital Tipo II",
    "clasificacionEspecificaLabel": "Hospital Tipo II",
    "quirofanosTotal": 3,
    "quirofanosOperativos": 2,
    "camasHospitalizacion": 90,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "emergencia_pediatrica",
      "sala_partos",
      "quirofanos",
      "hospitalizacion",
      "laboratorio",
      "imagenologia",
      "farmacia",
      "lavanderia",
      "desechos"
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
        "banos_inoperativos"
      ],
      "estructurales": [
        "pintura_deteriorada"
      ],
      "climatizacion": [
        "emergencia_sin_clima"
      ],
      "bioseguridad": [
        "falta_ambulancia"
      ]
    },
    "redRemision": "Hospital Universitario Dr. Manuel Núñez Tovar (HUMNT)",
    "observaciones": "Operatividad estable en consulta y emergencia diurna. Necesidad de dotación continua de bombonas de oxígeno medicinal y reparación del compresor del área de emergencia.",
    "elaboradoPor": {
      "nombre": "Dra. María Elena Rivas",
      "ci": "V-16.230.119",
      "cargo": "Coordinadora de Epidemiología y Servicios",
      "telefono": "0416-8901234",
      "fecha": "2026-09-10"
    },
    "nivelRiesgo": "verde"
  },
  {
    "id": "hosp-felicia-rondon",
    "nombre": "Hospital Dra. Felicia Rondón de Cabello",
    "estado": "Monagas",
    "area": "Salud",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "el-furrial",
    "parroquia": "El Furrial",
    "sector": "El Furrial Centro",
    "lat": 9.7022,
    "lng": -63.468,
    "tipoRed": "hospitalaria",
    "tipoRedLabel": "Red Hospitalaria Especializada (Tipo I, II, III, IV)",
    "clasificacionEspecifica": "Hospital Tipo II",
    "clasificacionEspecificaLabel": "Hospital Tipo II",
    "quirofanosTotal": 2,
    "quirofanosOperativos": 1,
    "camasHospitalizacion": 65,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "emergencia_pediatrica",
      "sala_partos",
      "quirofanos",
      "hospitalizacion",
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
      "electricas": [
        "fluctuaciones"
      ],
      "hidrosanitarias": [],
      "estructurales": [
        "cerrajeria_danada"
      ],
      "climatizacion": [],
      "bioseguridad": [
        "falta_ambulancia"
      ]
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Instalaciones con buen mantenimiento general. Se requiere ambulancia propia para traslados hacia el HUMNT sobre el corredor oeste.",
    "elaboradoPor": {
      "nombre": "Dr. José Antonio Bastardo",
      "ci": "V-13.441.802",
      "cargo": "Médico Jefe de Guardia / Enlace Territorial",
      "telefono": "0424-9123456",
      "fecha": "2026-09-11"
    },
    "nivelRiesgo": "verde"
  },
  {
    "id": "hosp-serres-cocuizas",
    "nombre": "Hospital Tipo I Dr. José Antonio Serres",
    "estado": "Monagas",
    "area": "Salud",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "las-cocuizas",
    "parroquia": "Las Cocuizas",
    "sector": "Las Cocuizas / Av. Aeropuerto",
    "lat": 9.761,
    "lng": -63.149,
    "tipoRed": "hospitalaria",
    "tipoRedLabel": "Red Hospitalaria Especializada (Tipo I, II, III, IV)",
    "clasificacionEspecifica": "Hospital Tipo I",
    "clasificacionEspecificaLabel": "Hospital Tipo I",
    "quirofanosTotal": 2,
    "quirofanosOperativos": 0,
    "camasHospitalizacion": 40,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "emergencia_pediatrica",
      "sala_partos",
      "laboratorio",
      "farmacia",
      "inmunizacion"
    ],
    "soporteVital": {
      "plantaElectrica": "Inoperativa",
      "suministroAgua": "Cisterna",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "Cero Clima"
    },
    "fallas": {
      "electricas": [
        "planta_inoperativa",
        "sin_ats",
        "iluminacion_deficiente"
      ],
      "hidrosanitarias": [
        "sin_agua_tuberia",
        "banos_inoperativos"
      ],
      "estructurales": [
        "filtraciones_techo",
        "cielo_raso_caido",
        "pisos_agrietados"
      ],
      "climatizacion": [
        "emergencia_sin_clima",
        "cavas_vacunas_falla"
      ],
      "bioseguridad": [
        "sin_cuarto_biologicos",
        "falta_ambulancia"
      ]
    },
    "redRemision": "HUMNT (Hospital Universitario Dr. Manuel Núñez Tovar)",
    "observaciones": "URGENCIA CRÍTICA: La planta eléctrica tiene avería mayor de inyectores. No llega agua por tubería (abastecimiento dependiente de cisterna). Quirófanos paralizados por falta de aire acondicionado estéril.",
    "elaboradoPor": {
      "nombre": "Dr. Marcos Bermúdez",
      "ci": "V-17.902.115",
      "cargo": "Enlace Parroquial Las Cocuizas",
      "telefono": "0414-9988776",
      "fecha": "2026-09-12"
    },
    "nivelRiesgo": "rojo"
  },
  {
    "id": "cdi-godos-rosendo",
    "nombre": "CDI Los Godos • Dr. Rosendo Gómez Lorenzo",
    "estado": "Monagas",
    "area": "Salud",
    "municipioId": "maturin",
    "municipio": "Municipio Maturín",
    "parroquiaId": "alto-de-los-godos",
    "parroquia": "Alto de Los Godos",
    "sector": "Los Godos 1 / La Puente",
    "lat": 9.7285,
    "lng": -63.205,
    "tipoRed": "comunal",
    "tipoRedLabel": "Red Comunal / Barrio Adentro (CPT, CDI, SRI)",
    "clasificacionEspecifica": "CDI",
    "clasificacionEspecificaLabel": "CDI (Centro de Diagnóstico Integral)",
    "quirofanosTotal": 1,
    "quirofanosOperativos": 1,
    "camasHospitalizacion": 12,
    "areasServicios": [
      "triaje",
      "consulta_externa",
      "emergencia_adultos",
      "quirofanos",
      "hospitalizacion",
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
      "electricas": [
        "fluctuaciones"
      ],
      "hidrosanitarias": [
        "fuga_tuberias"
      ],
      "estructurales": [
        "cerrajeria_danada"
      ],
      "climatizacion": [
        "lab_imagen_sin_clima"
      ],
      "bioseguridad": [
        "sin_rampas_ascensor"
      ]
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Punto neurálgico de la parroquia Alto de Los Godos. Rayos X operativo. Climatización del laboratorio requiere reemplazo de motor soplador.",
    "elaboradoPor": {
      "nombre": "Dr. Luisana Velásquez",
      "ci": "V-19.340.582",
      "cargo": "Médico Integral Comunitario / Jefa de ASIC",
      "telefono": "0412-3344556",
      "fecha": "2026-09-12"
    },
    "nivelRiesgo": "amarillo"
  },
  {
    "id": "hosp-punta-de-mata",
    "nombre": "Hospital Tipo I Dr. Luis González Espinoza",
    "estado": "Monagas",
    "area": "Salud",
    "municipioId": "ezequiel-zamora",
    "municipio": "Municipio Ezequiel Zamora",
    "parroquiaId": "punta-de-mata",
    "parroquia": "Punta de Mata",
    "sector": "Punta de Mata Centro",
    "lat": 9.689,
    "lng": -63.628,
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
      "farmacia",
      "desechos",
      "ambulancia"
    ],
    "soporteVital": {
      "plantaElectrica": "Operativa",
      "suministroAgua": "Continuo",
      "gasesMedicinales": "Bombonas",
      "climatizacion": "Parcial"
    },
    "fallas": {
      "electricas": [
        "sin_ats"
      ],
      "hidrosanitarias": [
        "fuga_tuberias"
      ],
      "estructurales": [
        "filtraciones_techo"
      ],
      "climatizacion": [
        "emergencia_sin_clima"
      ],
      "bioseguridad": []
    },
    "redRemision": "HUMNT Maturín (a 45 minutos por carretera nacional)",
    "observaciones": "Atiende eje petrolero Zamora-Cedeño. Sala de parto operativa. Fuga en bajante hidroneumático requiere fontanería menor.",
    "elaboradoPor": {
      "nombre": "Dr. Fernando Salazar",
      "ci": "V-15.823.901",
      "cargo": "Director Municipal de Salud Zamora",
      "telefono": "0414-8765432",
      "fecha": "2026-09-09"
    },
    "nivelRiesgo": "amarillo"
  },
  {
    "id": "hosp-caripito-dario-marquez",
    "nombre": "Hospital Tipo I Dr. Darío Márquez",
    "estado": "Monagas",
    "area": "Salud",
    "municipioId": "bolivar",
    "municipio": "Municipio Bolívar",
    "parroquiaId": "caripito",
    "parroquia": "Caripito",
    "sector": "Caripito Arriba / Centro",
    "lat": 10.116,
    "lng": -63.099,
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
        "planta_inoperativa",
        "fluctuaciones"
      ],
      "hidrosanitarias": [
        "sin_agua_tuberia"
      ],
      "estructurales": [
        "filtraciones_techo",
        "cielo_raso_caido"
      ],
      "climatizacion": [
        "quirofanos_sin_clima"
      ],
      "bioseguridad": [
        "falta_ambulancia"
      ]
    },
    "redRemision": "HUMNT Maturín / Hospital de Carúpano (Sucre)",
    "observaciones": "ALERTA: Falla de energía recurrente por estar al final del circuito Caripito. Planta eléctrica requiere mantenimiento de bomba diésel. Quirófano funcionando con aire acondicionado provisional.",
    "elaboradoPor": {
      "nombre": "Dr. Ramón Gómez",
      "ci": "V-12.784.093",
      "cargo": "Enlace Médico Municipio Bolívar",
      "telefono": "0416-5544332",
      "fecha": "2026-09-11"
    },
    "nivelRiesgo": "rojo"
  },
  {
    "id": "hosp-caripe-urrestarazu",
    "nombre": "Hospital Tipo I Dr. José Antonio Urrestarazu",
    "estado": "Monagas",
    "area": "Salud",
    "municipioId": "caripe",
    "municipio": "Municipio Caripe",
    "parroquiaId": "caripe",
    "parroquia": "Caripe",
    "sector": "Caripe Centro / El Mirador",
    "lat": 10.174,
    "lng": -63.498,
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
      "estructurales": [
        "pintura_deteriorada"
      ],
      "climatizacion": [],
      "bioseguridad": [
        "falta_ambulancia"
      ]
    },
    "redRemision": "HUMNT Maturín",
    "observaciones": "Clima de montaña favorece la conservación térmica. Sala de inmunización dotada. Se requiere vehículo de doble tracción para traslados desde caseríos lejanos de la montaña.",
    "elaboradoPor": {
      "nombre": "Dra. Patricia Rondón",
      "ci": "V-18.445.671",
      "cargo": "Médico Jefe Caripe",
      "telefono": "0424-7766554",
      "fecha": "2026-09-08"
    },
    "nivelRiesgo": "verde"
  }
];

if (typeof window !== 'undefined') {
  window.CATALOGO_TERRITORIAL = CATALOGO_TERRITORIAL;
  window.CATALOGO_TIPOS_ESTABLECIMIENTO = CATALOGO_TIPOS_ESTABLECIMIENTO;
  window.CATALOGO_AREAS_SERVICIOS = CATALOGO_AREAS_SERVICIOS;
  window.CATALOGO_FALLAS = CATALOGO_FALLAS;
  window.OPCIONES_SOPORTE_VITAL = OPCIONES_SOPORTE_VITAL;
  window.CENTROS_SALUD_INICIALES = CENTROS_SALUD_INICIALES;
}
