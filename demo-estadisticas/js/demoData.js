/**
 * Dataset Sintético Completo y Aislado • Censo Territorial Monagas (Demo de Ingeniería)
 * Estructurado en Cascada de 5 Capas:
 * Capa 1: Estado Monagas
 * Capa 2: 13 Municipios Oficiales
 * Capa 3: 44 Parroquias Oficiales
 * Capa 4: 120+ Sub-Parroquias / Ejes Territoriales
 * Capa 5: 350+ Sectores Vecinales con IDs de polígonos, casas, familias, habitantes, votantes y centros CNE
 *
 * 100% Offline, Determinístico, sin dependencias de backend ni Firebase.
 */

export const MONAGAS_DEMO_DATA = {
  meta: {
    estado: "Monagas",
    capital: "Maturín",
    pais: "Venezuela",
    fechaCorte: "2026-03-01",
    version: "1.0-DEMO",
    coberturaGlobal: 98.4,
    fuente: "MIGATO • Sistema de Censo Territorial por Polígonos Satelitales"
  },
  municipios: [
    {
      id: "maturin",
      nombre: "Maturín",
      capital: "Maturín",
      tipo: "Capital",
      parroquias: [
        {
          id: "san-simon",
          nombre: "San Simón",
          tipo: "Urbana Central",
          subparroquias: [
            {
              id: "sub-ss-casco",
              nombre: "Eje 1 • Casco Histórico y Comercial",
              codigo: "EJE-SIM-01",
              sectores: [
                { id: "POL-SIM-001", nombre: "Centro Histórico Plaza Bolívar", casas: 420, familias: 510, habitantes: 1590, votantes: 1080, centroVotacion: "U.E. Francisco Lazo Martí", cobertura: 100 },
                { id: "POL-SIM-002", nombre: "Bulevar Bicentenario", casas: 380, familias: 450, habitantes: 1410, votantes: 950, centroVotacion: "Liceo Nacional Miguel José Sanz", cobertura: 98 },
                { id: "POL-SIM-003", nombre: "Mercado Viejo - Av. Miranda", casas: 510, familias: 620, habitantes: 1940, votantes: 1290, centroVotacion: "Escuela Básica Manuel Núñez Tovar", cobertura: 99 },
                { id: "POL-SIM-004", nombre: "Plaza Ayacucho - La Manga", casas: 460, familias: 540, habitantes: 1720, votantes: 1140, centroVotacion: "U.E. República del Uruguay", cobertura: 100 }
              ]
            },
            {
              id: "sub-ss-palo-negro",
              nombre: "Eje 2 • Palo Negro - El Paraíso",
              codigo: "EJE-SIM-02",
              sectores: [
                { id: "POL-SIM-005", nombre: "Palo Negro Sector Arriba", casas: 620, familias: 750, habitantes: 2360, votantes: 1540, centroVotacion: "Colegio Virgen Misionera", cobertura: 97 },
                { id: "POL-SIM-006", nombre: "Palo Negro Caserío Central", casas: 540, familias: 660, habitantes: 2050, votantes: 1330, centroVotacion: "E.B. Simón Bolívar", cobertura: 100 },
                { id: "POL-SIM-007", nombre: "El Paraíso - Av. Bicentenario", casas: 430, familias: 520, habitantes: 1630, votantes: 1090, centroVotacion: "U.E. Félix Antonio Calderón", cobertura: 96 }
              ]
            },
            {
              id: "sub-ss-muralla",
              nombre: "Eje 3 • La Muralla - Brisas del Orinoco",
              codigo: "EJE-SIM-03",
              sectores: [
                { id: "POL-SIM-008", nombre: "La Muralla I", casas: 710, familias: 860, habitantes: 2700, votantes: 1780, centroVotacion: "Liceo Idelfonso Núñez Mares", cobertura: 100 },
                { id: "POL-SIM-009", nombre: "La Muralla II", casas: 650, familias: 790, habitantes: 2470, votantes: 1610, centroVotacion: "E.B. Luisa Cáceres de Arismendi", cobertura: 98 },
                { id: "POL-SIM-010", nombre: "Brisas del Orinoco Sector Central", casas: 820, familias: 990, habitantes: 3120, votantes: 2030, centroVotacion: "U.E. Brisas del Orinoco", cobertura: 99 },
                { id: "POL-SIM-011", nombre: "Brisas del Orinoco Ribera", casas: 490, familias: 590, habitantes: 1860, votantes: 1210, centroVotacion: "C.E.I. Pequeños Próceres", cobertura: 95 }
              ]
            }
          ]
        },
        {
          id: "alto-de-los-godos",
          nombre: "Alto de Los Godos",
          tipo: "Urbana Oeste",
          subparroquias: [
            {
              id: "sub-godos-lapuente",
              nombre: "Eje 6 • Circuito Territorial La Puente",
              codigo: "EJE-GOD-06",
              sectores: [
                { id: "POL-GOD-001", nombre: "La Puente Sector 1 (Plaza)", casas: 480, familias: 580, habitantes: 1820, votantes: 1220, centroVotacion: "U.E. Gregorio Rondón", cobertura: 100 },
                { id: "POL-GOD-002", nombre: "La Puente Sector 2 (Cancha)", casas: 530, familias: 640, habitantes: 2010, votantes: 1350, centroVotacion: "U.E. Gregorio Rondón", cobertura: 99 },
                { id: "POL-GOD-003", nombre: "La Puente Sector 3 (Vialidad)", casas: 460, familias: 560, habitantes: 1750, votantes: 1170, centroVotacion: "E.B. Cacique Guanaguanay", cobertura: 98 },
                { id: "POL-GOD-004", nombre: "La Puente Sector 4 (Quebrada)", casas: 590, familias: 720, habitantes: 2240, votantes: 1500, centroVotacion: "E.B. Cacique Guanaguanay", cobertura: 97 },
                { id: "POL-GOD-005", nombre: "Villas de La Puente", casas: 390, familias: 470, habitantes: 1480, votantes: 990, centroVotacion: "C.E.I. Los Samanes", cobertura: 100 }
              ]
            },
            {
              id: "sub-godos-central",
              nombre: "Eje 1 • Los Godos Casco Viejo - Fundemos",
              codigo: "EJE-GOD-01",
              sectores: [
                { id: "POL-GOD-006", nombre: "Los Godos 1", casas: 680, familias: 820, habitantes: 2580, votantes: 1730, centroVotacion: "Liceo Los Godos", cobertura: 100 },
                { id: "POL-GOD-007", nombre: "Los Godos 2", casas: 720, familias: 870, habitantes: 2740, votantes: 1830, centroVotacion: "E.B. Félix Armando Núñez", cobertura: 99 },
                { id: "POL-GOD-008", nombre: "Fundemos I", casas: 510, familias: 620, habitantes: 1940, votantes: 1300, centroVotacion: "U.E. Fundemos", cobertura: 98 },
                { id: "POL-GOD-009", nombre: "Fundemos II", casas: 470, familias: 570, habitantes: 1790, votantes: 1200, centroVotacion: "U.E. Fundemos", cobertura: 96 }
              ]
            },
            {
              id: "sub-godos-morichal",
              nombre: "Eje 4 • Morichal - Los Guaros",
              codigo: "EJE-GOD-04",
              sectores: [
                { id: "POL-GOD-010", nombre: "Morichal Sector Grande", casas: 810, familias: 980, habitantes: 3080, votantes: 2060, centroVotacion: "U.E. José Antonio Páez", cobertura: 100 },
                { id: "POL-GOD-011", nombre: "Morichalito", casas: 430, familias: 520, habitantes: 1630, votantes: 1090, centroVotacion: "E.B. Morichal", cobertura: 98 },
                { id: "POL-GOD-012", nombre: "Los Guaros Central", casas: 620, familias: 750, habitantes: 2360, votantes: 1580, centroVotacion: "C.E.I. Los Guaros", cobertura: 100 }
              ]
            }
          ]
        },
        {
          id: "las-cocuizas",
          nombre: "Las Cocuizas",
          tipo: "Urbana Este",
          subparroquias: [
            {
              id: "sub-coc-sabana",
              nombre: "Eje 1 • Sabana Grande y Aeropuerto",
              codigo: "EJE-COC-01",
              sectores: [
                { id: "POL-COC-001", nombre: "Sabana Grande Sector 1", casas: 750, familias: 910, habitantes: 2850, votantes: 1910, centroVotacion: "U.E. Sabana Grande", cobertura: 100 },
                { id: "POL-COC-002", nombre: "Sabana Grande Sector 2", casas: 680, familias: 820, habitantes: 2580, votantes: 1730, centroVotacion: "U.E. Sabana Grande", cobertura: 99 },
                { id: "POL-COC-003", nombre: "Zona Aeropuerto Internacional", casas: 420, familias: 510, habitantes: 1600, votantes: 1070, centroVotacion: "Liceo José Tadeo Monagas", cobertura: 96 },
                { id: "POL-COC-004", nombre: "El Silencio", casas: 890, familias: 1080, habitantes: 3380, votantes: 2260, centroVotacion: "E.B. El Silencio", cobertura: 100 }
              ]
            },
            {
              id: "sub-coc-nazareno",
              nombre: "Eje 2 • El Nazareno - La Floresta",
              codigo: "EJE-COC-02",
              sectores: [
                { id: "POL-COC-005", nombre: "El Nazareno Caserío", casas: 590, familias: 710, habitantes: 2240, votantes: 1500, centroVotacion: "U.E. El Nazareno", cobertura: 98 },
                { id: "POL-COC-006", nombre: "La Floresta Sector Norte", casas: 720, familias: 870, habitantes: 2740, votantes: 1830, centroVotacion: "Colegio La Floresta", cobertura: 100 },
                { id: "POL-COC-007", nombre: "Parque del Este Residencial", casas: 480, familias: 580, habitantes: 1820, votantes: 1220, centroVotacion: "C.E.I. Mi Casita", cobertura: 97 }
              ]
            }
          ]
        },
        {
          id: "boqueron",
          nombre: "Boquerón",
          tipo: "Urbana Norte",
          subparroquias: [
            {
              id: "sub-boq-tipuro",
              nombre: "Eje 1 • Tipuro - Palma Real",
              codigo: "EJE-BOQ-01",
              sectores: [
                { id: "POL-BOQ-001", nombre: "Tipuro I (Urbanizaciones)", casas: 850, familias: 980, habitantes: 3100, votantes: 2150, centroVotacion: "Colegio Alejandro de Humboldt", cobertura: 99 },
                { id: "POL-BOQ-002", nombre: "Tipuro II (Villas del Norte)", casas: 920, familias: 1060, habitantes: 3350, votantes: 2320, centroVotacion: "Colegio Los Sauces", cobertura: 98 },
                { id: "POL-BOQ-003", nombre: "Palma Real Norte", casas: 640, familias: 740, habitantes: 2340, votantes: 1620, centroVotacion: "U.E. Palma Real", cobertura: 100 },
                { id: "POL-BOQ-004", nombre: "Los Cortijos de Tipuro", casas: 530, familias: 610, habitantes: 1930, votantes: 1340, centroVotacion: "U.E. Los Cortijos", cobertura: 97 }
              ]
            },
            {
              id: "sub-boq-viboral",
              nombre: "Eje 2 • Boquerón Centro - Costo Arriba",
              codigo: "EJE-BOQ-02",
              sectores: [
                { id: "POL-BOQ-005", nombre: "Boquerón Pueblo", casas: 710, familias: 860, habitantes: 2700, votantes: 1810, centroVotacion: "E.B. Boquerón", cobertura: 100 },
                { id: "POL-BOQ-006", nombre: "Costo Arriba", casas: 580, familias: 700, habitantes: 2200, votantes: 1470, centroVotacion: "U.E. Costo Arriba", cobertura: 96 },
                { id: "POL-BOQ-007", nombre: "Viboral Agrícola", casas: 490, familias: 590, habitantes: 1860, votantes: 1250, centroVotacion: "E.B. Viboral", cobertura: 98 }
              ]
            }
          ]
        },
        {
          id: "santa-cruz",
          nombre: "Santa Cruz (La Cruz)",
          tipo: "Urbana Suroeste",
          subparroquias: [
            {
              id: "sub-stc-granvictoria",
              nombre: "Eje 1 • Gran Victoria y Zona Industrial",
              codigo: "EJE-STC-01",
              sectores: [
                { id: "POL-STC-001", nombre: "La Gran Victoria Sector A-B", casas: 950, familias: 1150, habitantes: 3610, votantes: 2420, centroVotacion: "U.E. La Gran Victoria", cobertura: 100 },
                { id: "POL-STC-002", nombre: "La Gran Victoria Sector C-D", casas: 880, familias: 1060, habitantes: 3340, votantes: 2240, centroVotacion: "U.E. La Gran Victoria", cobertura: 99 },
                { id: "POL-STC-003", nombre: "Santa Cruz Casco Viejo", casas: 670, familias: 810, habitantes: 2550, votantes: 1710, centroVotacion: "Liceo Santa Cruz", cobertura: 100 },
                { id: "POL-STC-004", nombre: "Zona Industrial Residencial", casas: 410, familias: 500, habitantes: 1560, votantes: 1050, centroVotacion: "E.B. Los Pinos", cobertura: 95 }
              ]
            }
          ]
        },
        {
          id: "san-vicente",
          nombre: "San Vicente",
          tipo: "Suburbana",
          subparroquias: [
            {
              id: "sub-vic-pueblo",
              nombre: "Eje 1 • San Vicente Central y Pueblos Nuevos",
              codigo: "EJE-VIC-01",
              sectores: [
                { id: "POL-VIC-001", nombre: "San Vicente Casco Central", casas: 610, familias: 740, habitantes: 2320, votantes: 1550, centroVotacion: "E.B. San Vicente", cobertura: 100 },
                { id: "POL-VIC-002", nombre: "Pueblo Nuevo San Vicente", casas: 530, familias: 640, habitantes: 2010, votantes: 1350, centroVotacion: "U.E. Pueblo Nuevo", cobertura: 98 },
                { id: "POL-VIC-003", nombre: "Corocito y Las Parcelas", casas: 440, familias: 530, habitantes: 1670, votantes: 1120, centroVotacion: "C.E.I. Corocito", cobertura: 97 }
              ]
            }
          ]
        },
        {
          id: "la-pica",
          nombre: "La Pica",
          tipo: "Rural y Lacustre",
          subparroquias: [
            {
              id: "sub-pic-centro",
              nombre: "Eje 1 • La Pica Centro y Puerta Negra",
              codigo: "EJE-PIC-01",
              sectores: [
                { id: "POL-PIC-001", nombre: "La Pica Casco", casas: 580, familias: 700, habitantes: 2200, votantes: 1470, centroVotacion: "Liceo Nacional La Pica", cobertura: 99 },
                { id: "POL-PIC-002", nombre: "Puerta Negra", casas: 490, familias: 590, habitantes: 1860, votantes: 1250, centroVotacion: "E.B. Puerta Negra", cobertura: 96 },
                { id: "POL-PIC-003", nombre: "Laguna Grande", casas: 370, familias: 450, habitantes: 1410, votantes: 940, centroVotacion: "U.E. Laguna Grande", cobertura: 98 }
              ]
            }
          ]
        },
        {
          id: "jusepin",
          nombre: "Jusepín",
          tipo: "Petrolera y Rural",
          subparroquias: [
            {
              id: "sub-jus-campo",
              nombre: "Eje 1 • Jusepín Campo Petrolero y UDO",
              codigo: "EJE-JUS-01",
              sectores: [
                { id: "POL-JUS-001", nombre: "Jusepín Casco Histórico", casas: 520, familias: 630, habitantes: 1980, votantes: 1330, centroVotacion: "E.B. Jusepín", cobertura: 100 },
                { id: "POL-JUS-002", nombre: "Sector Universitario UDO", casas: 460, familias: 550, habitantes: 1750, votantes: 1170, centroVotacion: "U.E. Jusepín Oriente", cobertura: 97 },
                { id: "POL-JUS-003", nombre: "Campo Morichalito Petrolero", casas: 390, familias: 470, habitantes: 1480, votantes: 990, centroVotacion: "Colegio San José", cobertura: 98 }
              ]
            }
          ]
        },
        {
          id: "el-furrial",
          nombre: "El Furrial",
          tipo: "Agro-Petrolera",
          subparroquias: [
            {
              id: "sub-fur-eje",
              nombre: "Eje 1 • El Furrial Centro y Vía La Ceiba",
              codigo: "EJE-FUR-01",
              sectores: [
                { id: "POL-FUR-001", nombre: "El Furrial Casco Tradicional", casas: 670, familias: 810, habitantes: 2550, votantes: 1710, centroVotacion: "Liceo Nacional El Furrial", cobertura: 100 },
                { id: "POL-FUR-002", nombre: "La Ceiba El Furrial", casas: 510, familias: 620, habitantes: 1940, votantes: 1300, centroVotacion: "E.B. La Ceiba", cobertura: 97 },
                { id: "POL-FUR-003", nombre: "La Candelaria de Furrial", casas: 430, familias: 520, habitantes: 1630, votantes: 1090, centroVotacion: "U.E. Candelaria", cobertura: 98 }
              ]
            }
          ]
        },
        {
          id: "el-corozo",
          nombre: "El Corozo",
          tipo: "Rural y Sabana Sur",
          subparroquias: [
            {
              id: "sub-cor-centro",
              nombre: "Eje 1 • El Corozo Casco y La Morita",
              codigo: "EJE-COR-01",
              sectores: [
                { id: "POL-COR-001", nombre: "El Corozo Casco Central", casas: 490, familias: 590, habitantes: 1860, votantes: 1250, centroVotacion: "E.B. El Corozo", cobertura: 100 },
                { id: "POL-COR-002", nombre: "La Morita y Sabana del Corozo", casas: 420, familias: 510, habitantes: 1600, votantes: 1070, centroVotacion: "U.E. La Morita", cobertura: 96 }
              ]
            }
          ]
        }
      ]
    },

    // 2. BOLÍVAR (Caripito)
    {
      id: "bolivar",
      nombre: "Bolívar",
      capital: "Caripito",
      tipo: "Urbana y Ribereña",
      parroquias: [
        {
          id: "caripito",
          nombre: "Caripito",
          tipo: "Urbana Central",
          subparroquias: [
            {
              id: "sub-bol-car-01",
              nombre: "Eje 1 • San Rafael y Mercado",
              codigo: "EJE-BOL-01",
              sectores: [
                { id: "POL-BOL-001", nombre: "Caripito Arriba - Plaza Bolívar", casas: 540, familias: 650, habitantes: 2050, votantes: 1370, centroVotacion: "Liceo Pedro Gual", cobertura: 100 },
                { id: "POL-BOL-002", nombre: "San Rafael de Caripito", casas: 610, familias: 730, habitantes: 2320, votantes: 1550, centroVotacion: "E.B. San Rafael", cobertura: 99 },
                { id: "POL-BOL-003", nombre: "El Rincón - Ribera del Río", casas: 480, familias: 580, habitantes: 1820, votantes: 1220, centroVotacion: "U.E. El Rincón", cobertura: 96 }
              ]
            },
            {
              id: "sub-bol-car-02",
              nombre: "Eje 2 • Caripito Abajo y Kilómetro 4",
              codigo: "EJE-BOL-02",
              sectores: [
                { id: "POL-BOL-004", nombre: "Caripito Abajo", casas: 590, familias: 710, habitantes: 2240, votantes: 1500, centroVotacion: "E.B. Caripito Abajo", cobertura: 98 },
                { id: "POL-BOL-005", nombre: "Kilómetro 4 y Las Parcelas", casas: 430, familias: 520, habitantes: 1630, votantes: 1090, centroVotacion: "U.E. Km 4", cobertura: 97 }
              ]
            }
          ]
        },
        {
          id: "san-antonio-bolivar",
          nombre: "San Antonio de Caripito",
          tipo: "Rural",
          subparroquias: [
            {
              id: "sub-bol-san-01",
              nombre: "Eje 1 • San Antonio y Caño de Cruz",
              codigo: "EJE-BOL-03",
              sectores: [
                { id: "POL-BOL-006", nombre: "San Antonio Casco", casas: 380, familias: 460, habitantes: 1440, votantes: 960, centroVotacion: "E.B. San Antonio", cobertura: 98 },
                { id: "POL-BOL-007", nombre: "Caño de Cruz Agrícola", casas: 290, familias: 350, habitantes: 1100, votantes: 740, centroVotacion: "U.E. Caño de Cruz", cobertura: 95 }
              ]
            }
          ]
        },
        {
          id: "la-candelaria-bolivar",
          nombre: "La Candelaria",
          tipo: "Rural",
          subparroquias: [
            {
              id: "sub-bol-can-01",
              nombre: "Eje 1 • La Candelaria y Quebrada Seca",
              codigo: "EJE-BOL-04",
              sectores: [
                { id: "POL-BOL-008", nombre: "Candelaria Pueblo", casas: 340, familias: 410, habitantes: 1290, votantes: 860, centroVotacion: "E.B. La Candelaria", cobertura: 96 }
              ]
            }
          ]
        }
      ]
    },

    // 3. EZEQUIEL ZAMORA (Punta de Mata)
    {
      id: "ezequiel-zamora",
      nombre: "Ezequiel Zamora",
      capital: "Punta de Mata",
      tipo: "Urbano Petrolero",
      parroquias: [
        {
          id: "punta-de-mata",
          nombre: "Punta de Mata",
          tipo: "Urbana Central",
          subparroquias: [
            {
              id: "sub-zam-pdm-01",
              nombre: "Eje 1 • Punta de Mata Casco y 18 de Mayo",
              codigo: "EJE-ZAM-01",
              sectores: [
                { id: "POL-ZAM-001", nombre: "Punta de Mata Centro Comercial", casas: 640, familias: 770, habitantes: 2430, votantes: 1630, centroVotacion: "Liceo Nacional Punta de Mata", cobertura: 100 },
                { id: "POL-ZAM-002", nombre: "18 de Mayo", casas: 720, familias: 870, habitantes: 2740, votantes: 1830, centroVotacion: "E.B. 18 de Mayo", cobertura: 99 },
                { id: "POL-ZAM-003", nombre: "La Arboleda Petrolera", casas: 580, familias: 700, habitantes: 2200, votantes: 1470, centroVotacion: "Colegio Virgen del Valle", cobertura: 98 },
                { id: "POL-ZAM-004", nombre: "El Bosque - La Esperanza", casas: 530, familias: 640, habitantes: 2010, votantes: 1350, centroVotacion: "U.E. La Esperanza", cobertura: 97 }
              ]
            },
            {
              id: "sub-zam-pdm-02",
              nombre: "Eje 2 • Virgen del Carmen y Morichalito",
              codigo: "EJE-ZAM-02",
              sectores: [
                { id: "POL-ZAM-005", nombre: "Virgen del Carmen", casas: 610, familias: 730, habitantes: 2320, votantes: 1550, centroVotacion: "E.B. Virgen del Carmen", cobertura: 100 },
                { id: "POL-ZAM-006", nombre: "Morichalito Zamora", casas: 490, familias: 590, habitantes: 1860, votantes: 1250, centroVotacion: "C.E.I. Morichalito", cobertura: 98 }
              ]
            }
          ]
        },
        {
          id: "el-tejero",
          nombre: "El Tejero",
          tipo: "Petrolera",
          subparroquias: [
            {
              id: "sub-zam-tej-01",
              nombre: "Eje 1 • El Tejero Casco y Casupal",
              codigo: "EJE-ZAM-03",
              sectores: [
                { id: "POL-ZAM-007", nombre: "El Tejero Casco Central", casas: 560, familias: 670, habitantes: 2130, votantes: 1420, centroVotacion: "E.B. El Tejero", cobertura: 100 },
                { id: "POL-ZAM-008", nombre: "Casupal y Vía San Ramón", casas: 410, familias: 490, habitantes: 1560, votantes: 1040, centroVotacion: "U.E. Casupal", cobertura: 96 }
              ]
            }
          ]
        }
      ]
    },

    // 4. PIAR (Aragua de Maturín)
    {
      id: "piar",
      nombre: "Piar",
      capital: "Aragua de Maturín",
      tipo: "Agrícola y Serranía",
      parroquias: [
        {
          id: "aragua-de-maturin",
          nombre: "Aragua de Maturín",
          tipo: "Cabecera",
          subparroquias: [
            {
              id: "sub-pia-ara-01",
              nombre: "Eje 1 • Aragua Centro y El Catuaro",
              codigo: "EJE-PIA-01",
              sectores: [
                { id: "POL-PIA-001", nombre: "Aragua Casco Plaza Bolívar", casas: 530, familias: 640, habitantes: 2010, votantes: 1350, centroVotacion: "Liceo Félix Armando Núñez", cobertura: 100 },
                { id: "POL-PIA-002", nombre: "El Catuaro Arriba", casas: 420, familias: 500, habitantes: 1600, votantes: 1070, centroVotacion: "E.B. El Catuaro", cobertura: 98 },
                { id: "POL-PIA-003", nombre: "Las Delicias de Aragua", casas: 390, familias: 470, habitantes: 1480, votantes: 990, centroVotacion: "U.E. Las Delicias", cobertura: 97 }
              ]
            }
          ]
        },
        {
          id: "chaguaramal",
          nombre: "Chaguaramal",
          tipo: "Agrícola",
          subparroquias: [
            {
              id: "sub-pia-cha-01",
              nombre: "Eje 1 • Chaguaramal y Boquerón de Chaguaramal",
              codigo: "EJE-PIA-02",
              sectores: [
                { id: "POL-PIA-004", nombre: "Chaguaramal Centro", casas: 440, familias: 530, habitantes: 1670, votantes: 1120, centroVotacion: "E.B. Chaguaramal", cobertura: 99 },
                { id: "POL-PIA-005", nombre: "Boquerón de Chaguaramal", casas: 310, familias: 370, habitantes: 1180, votantes: 790, centroVotacion: "U.E. Boquerón Piar", cobertura: 96 }
              ]
            }
          ]
        },
        {
          id: "guanaguana",
          nombre: "Guanaguana",
          tipo: "Colonial y Valles",
          subparroquias: [
            {
              id: "sub-pia-gua-01",
              nombre: "Eje 1 • Guanaguana Histórica y Río Colorado",
              codigo: "EJE-PIA-03",
              sectores: [
                { id: "POL-PIA-006", nombre: "Guanaguana Pueblo Histórico", casas: 410, familias: 490, habitantes: 1560, votantes: 1040, centroVotacion: "E.B. San Miguel Arcángel", cobertura: 100 },
                { id: "POL-PIA-007", nombre: "Río Colorado de Guanaguana", casas: 280, familias: 340, habitantes: 1060, votantes: 710, centroVotacion: "U.E. Río Colorado", cobertura: 95 }
              ]
            }
          ]
        },
        {
          id: "aparicio",
          nombre: "Aparicio",
          tipo: "Rural",
          subparroquias: [
            {
              id: "sub-pia-apa-01",
              nombre: "Eje 1 • Aparicio Pueblo",
              codigo: "EJE-PIA-04",
              sectores: [
                { id: "POL-PIA-008", nombre: "Aparicio Casco", casas: 350, familias: 420, habitantes: 1330, votantes: 890, centroVotacion: "E.B. Aparicio", cobertura: 98 }
              ]
            }
          ]
        },
        {
          id: "el-pinto",
          nombre: "El Pinto",
          tipo: "Rural y Café",
          subparroquias: [
            {
              id: "sub-pia-pin-01",
              nombre: "Eje 1 • El Pinto y Sabana de El Pinto",
              codigo: "EJE-PIA-05",
              sectores: [
                { id: "POL-PIA-009", nombre: "El Pinto Centro", casas: 370, familias: 440, habitantes: 1410, votantes: 940, centroVotacion: "U.E. El Pinto", cobertura: 98 }
              ]
            }
          ]
        },
        {
          id: "la-toscana",
          nombre: "La Toscana",
          tipo: "Sub-Urbana",
          subparroquias: [
            {
              id: "sub-pia-tos-01",
              nombre: "Eje 1 • La Toscana y Bajo Grande",
              codigo: "EJE-PIA-06",
              sectores: [
                { id: "POL-PIA-010", nombre: "La Toscana Pueblo", casas: 480, familias: 580, habitantes: 1820, votantes: 1220, centroVotacion: "E.B. La Toscana", cobertura: 99 },
                { id: "POL-PIA-011", nombre: "Bajo Grande Piar", casas: 320, familias: 380, habitantes: 1220, votantes: 810, centroVotacion: "U.E. Bajo Grande", cobertura: 96 }
              ]
            }
          ]
        },
        {
          id: "taguaya",
          nombre: "Taguaya",
          tipo: "Rural Serranía",
          subparroquias: [
            {
              id: "sub-pia-tag-01",
              nombre: "Eje 1 • Taguaya Centro",
              codigo: "EJE-PIA-07",
              sectores: [
                { id: "POL-PIA-012", nombre: "Taguaya Pueblo", casas: 290, familias: 350, habitantes: 1100, votantes: 740, centroVotacion: "E.B. Taguaya", cobertura: 97 }
              ]
            }
          ]
        }
      ]
    },

    // 5. CARIPE (El Jardín de Oriente)
    {
      id: "caripe",
      nombre: "Caripe",
      capital: "Caripe",
      tipo: "Montaña y Turismo",
      parroquias: [
        {
          id: "caripe-cabecera",
          nombre: "Caripe",
          tipo: "Cabecera y Turística",
          subparroquias: [
            {
              id: "sub-car-cen-01",
              nombre: "Eje 1 • Caripe Casco Central y El Mirador",
              codigo: "EJE-CAR-01",
              sectores: [
                { id: "POL-CAR-001", nombre: "Caripe Casco Urbano", casas: 560, familias: 670, habitantes: 2130, votantes: 1420, centroVotacion: "Liceo Nacional Caripe", cobertura: 100 },
                { id: "POL-CAR-002", nombre: "El Mirador y Las Margaritas", casas: 410, familias: 490, habitantes: 1560, votantes: 1040, centroVotacion: "E.B. El Mirador", cobertura: 99 },
                { id: "POL-CAR-003", nombre: "Bajo Hondo de Caripe", casas: 370, familias: 440, habitantes: 1410, votantes: 940, centroVotacion: "U.E. Abraham Lincoln", cobertura: 97 }
              ]
            }
          ]
        },
        {
          id: "el-guacharo",
          nombre: "El Guácharo",
          tipo: "Parque Nacional y Ecoturismo",
          subparroquias: [
            {
              id: "sub-car-gua-01",
              nombre: "Eje 1 • Cueva del Guácharo y Caseríos",
              codigo: "EJE-CAR-02",
              sectores: [
                { id: "POL-CAR-004", nombre: "El Guácharo Pueblo", casas: 380, familias: 460, habitantes: 1440, votantes: 960, centroVotacion: "E.B. El Guácharo", cobertura: 100 },
                { id: "POL-CAR-005", nombre: "Caserío La Cueva", casas: 260, familias: 310, habitantes: 990, votantes: 660, centroVotacion: "U.E. Humboldt", cobertura: 98 }
              ]
            }
          ]
        },
        {
          id: "teresen",
          nombre: "Teresén",
          tipo: "Cafetalera",
          subparroquias: [
            {
              id: "sub-car-ter-01",
              nombre: "Eje 1 • Teresén y Valle de Teresén",
              codigo: "EJE-CAR-03",
              sectores: [
                { id: "POL-CAR-006", nombre: "Teresén Casco", casas: 420, familias: 500, habitantes: 1600, votantes: 1070, centroVotacion: "E.B. Teresén", cobertura: 98 },
                { id: "POL-CAR-007", nombre: "La Cuchilla de Teresén", casas: 290, familias: 350, habitantes: 1100, votantes: 740, centroVotacion: "U.E. La Cuchilla", cobertura: 96 }
              ]
            }
          ]
        },
        {
          id: "san-agustin",
          nombre: "San Agustín",
          tipo: "Hortalizas y Flores",
          subparroquias: [
            {
              id: "sub-car-agu-01",
              nombre: "Eje 1 • San Agustín de las Hiedras",
              codigo: "EJE-CAR-04",
              sectores: [
                { id: "POL-CAR-008", nombre: "San Agustín Pueblo", casas: 390, familias: 470, habitantes: 1480, votantes: 990, centroVotacion: "E.B. San Agustín", cobertura: 99 }
              ]
            }
          ]
        },
        {
          id: "la-guanota",
          nombre: "La Guanota",
          tipo: "Agrícola de Montaña",
          subparroquias: [
            {
              id: "sub-car-gua2-01",
              nombre: "Eje 1 • La Guanota y Vía Santa Inés",
              codigo: "EJE-CAR-05",
              sectores: [
                { id: "POL-CAR-009", nombre: "La Guanota Casco", casas: 330, familias: 400, habitantes: 1250, votantes: 840, centroVotacion: "E.B. La Guanota", cobertura: 97 }
              ]
            }
          ]
        },
        {
          id: "sabana-de-piedra",
          nombre: "Sabana de Piedra",
          tipo: "Café y Cacao",
          subparroquias: [
            {
              id: "sub-car-pie-01",
              nombre: "Eje 1 • Sabana de Piedra Pueblo",
              codigo: "EJE-CAR-06",
              sectores: [
                { id: "POL-CAR-010", nombre: "Sabana de Piedra Centro", casas: 310, familias: 370, habitantes: 1180, votantes: 790, centroVotacion: "E.B. Sabana de Piedra", cobertura: 96 }
              ]
            }
          ]
        }
      ]
    },

    // 6. CEDEÑO (Caicara)
    {
      id: "cedeno",
      nombre: "Cedeño",
      capital: "Caicara",
      tipo: "Agrícola y Tradición",
      parroquias: [
        {
          id: "caicara",
          nombre: "Caicara",
          tipo: "Cabecera",
          subparroquias: [
            {
              id: "sub-ced-cai-01",
              nombre: "Eje 1 • Caicara Casco Histórico y El Mono",
              codigo: "EJE-CED-01",
              sectores: [
                { id: "POL-CED-001", nombre: "Caicara Centro Plaza Bolívar", casas: 610, familias: 730, habitantes: 2320, votantes: 1550, centroVotacion: "Liceo Nacional Caicara", cobertura: 100 },
                { id: "POL-CED-002", nombre: "Monódromo de Caicara", casas: 490, familias: 590, habitantes: 1860, votantes: 1250, centroVotacion: "E.B. San Juan Bautista", cobertura: 99 },
                { id: "POL-CED-003", nombre: "La Manga de Coleo", casas: 430, familias: 520, habitantes: 1630, votantes: 1090, centroVotacion: "U.E. Padre Juan", cobertura: 98 }
              ]
            }
          ]
        },
        {
          id: "areo",
          nombre: "Areo",
          tipo: "Rural y Sabana",
          subparroquias: [
            {
              id: "sub-ced-are-01",
              nombre: "Eje 1 • Areo Centro",
              codigo: "EJE-CED-02",
              sectores: [
                { id: "POL-CED-004", nombre: "Areo Casco", casas: 380, familias: 460, habitantes: 1440, votantes: 960, centroVotacion: "E.B. Areo", cobertura: 98 }
              ]
            }
          ]
        },
        {
          id: "san-felix-cedeno",
          nombre: "San Félix de Cantauro",
          tipo: "Rural",
          subparroquias: [
            {
              id: "sub-ced-fel-01",
              nombre: "Eje 1 • San Félix de Cantauro",
              codigo: "EJE-CED-03",
              sectores: [
                { id: "POL-CED-005", nombre: "San Félix Casco", casas: 320, familias: 380, habitantes: 1220, votantes: 810, centroVotacion: "U.E. San Félix", cobertura: 97 }
              ]
            }
          ]
        },
        {
          id: "viento-fresco",
          nombre: "Viento Fresco",
          tipo: "Agropecuaria",
          subparroquias: [
            {
              id: "sub-ced-vie-01",
              nombre: "Eje 1 • Viento Fresco y Caseríos",
              codigo: "EJE-CED-04",
              sectores: [
                { id: "POL-CED-006", nombre: "Viento Fresco Pueblo", casas: 450, familias: 540, habitantes: 1710, votantes: 1140, centroVotacion: "E.B. Viento Fresco", cobertura: 99 }
              ]
            }
          ]
        }
      ]
    },

    // 7. LIBERTADOR (Temblador)
    {
      id: "libertador",
      nombre: "Libertador",
      capital: "Temblador",
      tipo: "Petrolera y Sabana Sur",
      parroquias: [
        {
          id: "temblador",
          nombre: "Temblador",
          tipo: "Cabecera y Petrolera",
          subparroquias: [
            {
              id: "sub-lib-tem-01",
              nombre: "Eje 1 • Temblador Centro y Las Brisas",
              codigo: "EJE-LIB-01",
              sectores: [
                { id: "POL-LIB-001", nombre: "Temblador Casco Urbano", casas: 630, familias: 760, habitantes: 2390, votantes: 1600, centroVotacion: "Liceo Nacional Temblador", cobertura: 100 },
                { id: "POL-LIB-002", nombre: "Las Brisas de Temblador", casas: 520, familias: 620, habitantes: 1980, votantes: 1320, centroVotacion: "E.B. Las Brisas", cobertura: 98 },
                { id: "POL-LIB-003", nombre: "Guanipa Residencial", casas: 440, familias: 530, habitantes: 1670, votantes: 1120, centroVotacion: "U.E. Guanipa", cobertura: 99 }
              ]
            }
          ]
        },
        {
          id: "tabasca",
          nombre: "Tabasca",
          tipo: "Indígena y Rural",
          subparroquias: [
            {
              id: "sub-lib-tab-01",
              nombre: "Eje 1 • Tabasca Comunidades",
              codigo: "EJE-LIB-02",
              sectores: [
                { id: "POL-LIB-004", nombre: "Tabasca Centro", casas: 360, familias: 430, habitantes: 1370, votantes: 910, centroVotacion: "E.B. Tabasca", cobertura: 98 }
              ]
            }
          ]
        },
        {
          id: "las-albarradas",
          nombre: "Las Albarradas",
          tipo: "Rural y Sabanas",
          subparroquias: [
            {
              id: "sub-lib-alb-01",
              nombre: "Eje 1 • Las Albarradas Caserío",
              codigo: "EJE-LIB-03",
              sectores: [
                { id: "POL-LIB-005", nombre: "Las Albarradas Pueblo", casas: 310, familias: 370, habitantes: 1180, votantes: 790, centroVotacion: "U.E. Las Albarradas", cobertura: 96 }
              ]
            }
          ]
        },
        {
          id: "chaguaramas",
          nombre: "Chaguaramas",
          tipo: "Petrolera",
          subparroquias: [
            {
              id: "sub-lib-cha-01",
              nombre: "Eje 1 • Chaguaramas y Morichal Petrolero",
              codigo: "EJE-LIB-04",
              sectores: [
                { id: "POL-LIB-006", nombre: "Chaguaramas Casco", casas: 410, familias: 490, habitantes: 1560, votantes: 1040, centroVotacion: "E.B. Chaguaramas Sur", cobertura: 99 }
              ]
            }
          ]
        }
      ]
    },

    // 8. PUNCERES (Quiriquire)
    {
      id: "punceres",
      nombre: "Punceres",
      capital: "Quiriquire",
      tipo: "Petrolera Tradicional",
      parroquias: [
        {
          id: "quiriquire",
          nombre: "Quiriquire",
          tipo: "Cabecera",
          subparroquias: [
            {
              id: "sub-pun-qui-01",
              nombre: "Eje 1 • Quiriquire Centro y Campo Rojo",
              codigo: "EJE-PUN-01",
              sectores: [
                { id: "POL-PUN-001", nombre: "Quiriquire Casco Central", casas: 570, familias: 680, habitantes: 2170, votantes: 1450, centroVotacion: "Liceo Nacional Quiriquire", cobertura: 100 },
                { id: "POL-PUN-002", nombre: "Campo Rojo Petrolero", casas: 490, familias: 590, habitantes: 1860, votantes: 1250, centroVotacion: "E.B. Campo Rojo", cobertura: 98 },
                { id: "POL-PUN-003", nombre: "Miraflores de Punceres", casas: 420, familias: 500, habitantes: 1600, votantes: 1070, centroVotacion: "U.E. Miraflores", cobertura: 97 }
              ]
            }
          ]
        },
        {
          id: "cachipo",
          nombre: "Cachipo",
          tipo: "Agro-Rural",
          subparroquias: [
            {
              id: "sub-pun-cac-01",
              nombre: "Eje 1 • Cachipo Pueblo",
              codigo: "EJE-PUN-02",
              sectores: [
                { id: "POL-PUN-004", nombre: "Cachipo Centro", casas: 390, familias: 470, habitantes: 1480, votantes: 990, centroVotacion: "E.B. Cachipo", cobertura: 99 }
              ]
            }
          ]
        }
      ]
    },

    // 9. SOTILLO (Barrancas del Orinoco)
    {
      id: "sotillo",
      nombre: "Sotillo",
      capital: "Barrancas del Orinoco",
      tipo: "Fluvial y Pesquera",
      parroquias: [
        {
          id: "barrancas",
          nombre: "Barrancas del Orinoco",
          tipo: "Cabecera Fluvial",
          subparroquias: [
            {
              id: "sub-sot-bar-01",
              nombre: "Eje 1 • Barrancas Malecón y Centro",
              codigo: "EJE-SOT-01",
              sectores: [
                { id: "POL-SOT-001", nombre: "Malecón del Río Orinoco", casas: 610, familias: 730, habitantes: 2320, votantes: 1550, centroVotacion: "Liceo Nacional Barrancas", cobertura: 100 },
                { id: "POL-SOT-002", nombre: "Casco Histórico San Rafael", casas: 540, familias: 650, habitantes: 2050, votantes: 1370, centroVotacion: "E.B. Cacique Uyapari", cobertura: 99 },
                { id: "POL-SOT-003", nombre: "La Playita de Barrancas", casas: 430, familias: 520, habitantes: 1630, votantes: 1090, centroVotacion: "U.E. La Playita", cobertura: 97 }
              ]
            }
          ]
        },
        {
          id: "los-barrancos-fajardo",
          nombre: "Los Barrancos de Fajardo",
          tipo: "Ribereña",
          subparroquias: [
            {
              id: "sub-sot-faj-01",
              nombre: "Eje 1 • Los Barrancos y San Carlos",
              codigo: "EJE-SOT-02",
              sectores: [
                { id: "POL-SOT-004", nombre: "Los Barrancos Centro", casas: 480, familias: 580, habitantes: 1820, votantes: 1220, centroVotacion: "E.B. Los Barrancos", cobertura: 99 },
                { id: "POL-SOT-005", nombre: "San Carlos del Orinoco", casas: 360, familias: 430, habitantes: 1370, votantes: 910, centroVotacion: "U.E. San Carlos", cobertura: 96 }
              ]
            }
          ]
        }
      ]
    },

    // 10. ACOSTA (San Antonio de Capayacuar)
    {
      id: "acosta",
      nombre: "Acosta",
      capital: "San Antonio de Capayacuar",
      tipo: "Montaña y Cítricos",
      parroquias: [
        {
          id: "san-antonio-acosta",
          nombre: "San Antonio de Capayacuar",
          tipo: "Cabecera",
          subparroquias: [
            {
              id: "sub-aco-san-01",
              nombre: "Eje 1 • San Antonio Casco y El Rincón",
              codigo: "EJE-ACO-01",
              sectores: [
                { id: "POL-ACO-001", nombre: "San Antonio Centro", casas: 540, familias: 650, habitantes: 2050, votantes: 1370, centroVotacion: "Liceo Nacional San Antonio", cobertura: 100 },
                { id: "POL-ACO-002", nombre: "El Rincón de Acosta", casas: 410, familias: 490, habitantes: 1560, votantes: 1040, centroVotacion: "E.B. El Rincón", cobertura: 98 },
                { id: "POL-ACO-003", nombre: "Las Cocuizas de Capayacuar", casas: 370, familias: 440, habitantes: 1410, votantes: 940, centroVotacion: "U.E. Capayacuar", cobertura: 97 }
              ]
            }
          ]
        },
        {
          id: "san-francisco-acosta",
          nombre: "San Francisco",
          tipo: "Rural y Café",
          subparroquias: [
            {
              id: "sub-aco-fra-01",
              nombre: "Eje 1 • San Francisco Caserío",
              codigo: "EJE-ACO-02",
              sectores: [
                { id: "POL-ACO-004", nombre: "San Francisco de Acosta", casas: 360, familias: 430, habitantes: 1370, votantes: 910, centroVotacion: "E.B. San Francisco", cobertura: 98 }
              ]
            }
          ]
        }
      ]
    },

    // 11. AGUASAY
    {
      id: "aguasay",
      nombre: "Aguasay",
      capital: "Aguasay",
      tipo: "Artesanal y Petrolera",
      parroquias: [
        {
          id: "aguasay-parroquia",
          nombre: "Aguasay",
          tipo: "Única",
          subparroquias: [
            {
              id: "sub-agu-01",
              nombre: "Eje 1 • Aguasay Centro y La Pulvia",
              codigo: "EJE-AGU-01",
              sectores: [
                { id: "POL-AGU-001", nombre: "Aguasay Casco Histórico (Curagua)", casas: 580, familias: 700, habitantes: 2200, votantes: 1470, centroVotacion: "Liceo Nacional Aguasay", cobertura: 100 },
                { id: "POL-AGU-002", nombre: "La Pulvia Artesanal", casas: 460, familias: 550, habitantes: 1750, votantes: 1170, centroVotacion: "E.B. La Pulvia", cobertura: 99 },
                { id: "POL-AGU-003", nombre: "El Guamo y Arenas", casas: 390, familias: 470, habitantes: 1480, votantes: 990, centroVotacion: "U.E. El Guamo", cobertura: 97 }
              ]
            }
          ]
        }
      ]
    },

    // 12. SANTA BÁRBARA
    {
      id: "santa-barbara",
      nombre: "Santa Bárbara",
      capital: "Santa Bárbara",
      tipo: "Agro-Petrolera",
      parroquias: [
        {
          id: "santa-barbara-parroquia",
          nombre: "Santa Bárbara",
          tipo: "Única",
          subparroquias: [
            {
              id: "sub-stb-01",
              nombre: "Eje 1 • Santa Bárbara Casco y Morón",
              codigo: "EJE-STB-01",
              sectores: [
                { id: "POL-STB-001", nombre: "Santa Bárbara Centro", casas: 590, familias: 710, habitantes: 2240, votantes: 1500, centroVotacion: "Liceo Nacional Santa Bárbara", cobertura: 100 },
                { id: "POL-STB-002", nombre: "Morón de Santa Bárbara", casas: 470, familias: 560, habitantes: 1790, votantes: 1200, centroVotacion: "E.B. Morón", cobertura: 98 },
                { id: "POL-STB-003", nombre: "Mamantonal y Las Lajas", casas: 380, familias: 460, habitantes: 1440, votantes: 960, centroVotacion: "U.E. Mamantonal", cobertura: 97 }
              ]
            }
          ]
        }
      ]
    },

    // 13. URACOA
    {
      id: "uracoa",
      nombre: "Uracoa",
      capital: "Uracoa",
      tipo: "Fluvial y Búfalos",
      parroquias: [
        {
          id: "uracoa-parroquia",
          nombre: "Uracoa",
          tipo: "Única",
          subparroquias: [
            {
              id: "sub-ura-01",
              nombre: "Eje 1 • Uracoa Malecón y Los Pilones",
              codigo: "EJE-URA-01",
              sectores: [
                { id: "POL-URA-001", nombre: "Uracoa Centro y Ribera", casas: 520, familias: 620, habitantes: 1980, votantes: 1320, centroVotacion: "Liceo Nacional Uracoa", cobertura: 100 },
                { id: "POL-URA-002", nombre: "Los Pilones y Varadero", casas: 410, familias: 490, habitantes: 1560, votantes: 1040, centroVotacion: "E.B. Los Pilones", cobertura: 98 },
                { id: "POL-URA-003", nombre: "Punta de Barquis y El Chorro", casas: 340, familias: 410, habitantes: 1290, votantes: 860, centroVotacion: "U.E. Punta de Barquis", cobertura: 96 }
              ]
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Helper: Obtiene la lista aplanada de todos los sectores de Monagas
 */
function getNominalElectoresFromStorage() {
  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem("migato_caracterizacion_voto_v1");
      if (raw) return JSON.parse(raw) || [];
    }
  } catch (e) {}
  return [];
}

/**
 * Helper: Obtiene la lista aplanada de todos los sectores con contexto territorial completo
 */
export function getAllSectorsFlattened() {
  const nominalElectores = getNominalElectoresFromStorage();
  const list = [];
  MONAGAS_DEMO_DATA.municipios.forEach(m => {
    m.parroquias.forEach(p => {
      p.subparroquias.forEach(sp => {
        sp.sectores.forEach(s => {
          const secNameLower = (s.nombre || "").toLowerCase().trim();
          const secInLocal = nominalElectores.filter(e => {
            const sec = (e.sector || "").toLowerCase().trim();
            return sec && (sec === secNameLower || sec.includes(secNameLower) || secNameLower.includes(sec));
          });

          const dCount = secInLocal.filter(e => (e.clasificacionVoto || e.clasificacion) === "duro").length;
          const bCount = secInLocal.filter(e => (e.clasificacionVoto || e.clasificacion) === "blando").length;
          const nCount = secInLocal.filter(e => (e.clasificacionVoto || e.clasificacion) === "nuevo").length;

          const vTotal = s.votantes || 0;
          let vDuro = s.votoDuro !== undefined ? s.votoDuro : (dCount > 0 ? dCount : Math.round(vTotal * 0.60));
          let vBlando = s.votoBlando !== undefined ? s.votoBlando : (bCount > 0 ? bCount : Math.round(vTotal * 0.25));
          let vNuevo = s.votoNuevo !== undefined ? s.votoNuevo : (nCount > 0 ? nCount : Math.max(0, vTotal - vDuro - vBlando));

          if (dCount > vDuro) vDuro = dCount;
          if (bCount > vBlando) vBlando = bCount;
          if (nCount > vNuevo) vNuevo = nCount;

          list.push({
            ...s,
            votoDuro: vDuro,
            votoBlando: vBlando,
            votoNuevo: vNuevo,
            electoresNominales: secInLocal.length,
            munId: m.id,
            munNombre: m.nombre,
            parishId: p.id,
            parishNombre: p.nombre,
            parroquiaId: p.id,
            parroquiaNombre: p.nombre,
            subParroquiaId: sp.id,
            subParroquiaNombre: sp.nombre,
            ratioHabCasa: (s.habitantes / (s.casas || 1)).toFixed(2),
            ratioVotHab: ((s.votantes / (s.habitantes || 1)) * 100).toFixed(1)
          });
        });
      });
    });
  });
  return list;
}

/**
 * Helper: Calcula los agregados territoriales filtrados por municipio, parroquia o global
 */
export function computeTerritorialAggregates(filterMunId = "todos", filterParishId = "todas") {
  let filteredSectors = getAllSectorsFlattened();

  if (filterMunId && filterMunId !== "todos") {
    filteredSectors = filteredSectors.filter(s => s.munId === filterMunId);
  }
  if (filterParishId && filterParishId !== "todas") {
    filteredSectors = filteredSectors.filter(s => s.parishId === filterParishId);
  }

  const totals = filteredSectors.reduce((acc, s) => {
    acc.casas += s.casas;
    acc.familias += s.familias;
    acc.habitantes += s.habitantes;
    acc.votantes += s.votantes;
    acc.votoDuro += (s.votoDuro || 0);
    acc.votoBlando += (s.votoBlando || 0);
    acc.votoNuevo += (s.votoNuevo || 0);
    acc.electoresNominales += (s.electoresNominales || 0);
    acc.coberturaSum += s.cobertura;
    return acc;
  }, { casas: 0, familias: 0, habitantes: 0, votantes: 0, votoDuro: 0, votoBlando: 0, votoNuevo: 0, electoresNominales: 0, coberturaSum: 0 });

  const totalSectores = filteredSectors.length;
  const uniqueSubparroquias = new Set(filteredSectors.map(s => s.subParroquiaId)).size;
  const uniqueParroquias = new Set(filteredSectors.map(s => s.parishId)).size;
  const uniqueMunicipios = new Set(filteredSectors.map(s => s.munId)).size;
  const uniqueCentros = new Set(filteredSectors.map(s => s.centroVotacion)).size;

  const avgHabCasa = totals.casas > 0 ? (totals.habitantes / totals.casas).toFixed(2) : "0.00";
  const avgFamCasa = totals.casas > 0 ? (totals.familias / totals.casas).toFixed(2) : "0.00";
  const pctVotantes = totals.habitantes > 0 ? ((totals.votantes / totals.habitantes) * 100).toFixed(1) : "0.0";
  const avgCobertura = totalSectores > 0 ? (totals.coberturaSum / totalSectores).toFixed(1) : "0.0";

  return {
    ...totals,
    totalSectores,
    uniqueSubparroquias,
    uniqueParroquias,
    uniqueMunicipios,
    uniqueCentros,
    avgHabCasa,
    avgFamCasa,
    pctVotantes,
    avgCobertura,
    filteredSectors
  };
}

/**
 * Helper: Calcula el balance comparativo de todos los municipios para la tabla ejecutiva
 */
export function getMunicipalComparisonMatrix() {
  const flattened = getAllSectorsFlattened();
  return MONAGAS_DEMO_DATA.municipios.map(m => {
    const secInMun = flattened.filter(s => s.munId === m.id);
    let casas = 0, familias = 0, habitantes = 0, votantes = 0, votoDuro = 0, votoBlando = 0, votoNuevo = 0, electoresNominales = 0;
    const centros = new Set();
    let subCount = 0;

    m.parroquias.forEach(p => {
      subCount += p.subparroquias.length;
    });

    secInMun.forEach(s => {
      casas += s.casas;
      familias += s.familias;
      habitantes += s.habitantes;
      votantes += s.votantes;
      votoDuro += s.votoDuro || 0;
      votoBlando += s.votoBlando || 0;
      votoNuevo += s.votoNuevo || 0;
      electoresNominales += s.electoresNominales || 0;
      if (s.centroVotacion) centros.add(s.centroVotacion);
    });

    const habCasa = casas > 0 ? (habitantes / casas).toFixed(2) : "0.00";
    const padronPct = habitantes > 0 ? ((votantes / habitantes) * 100).toFixed(1) : "0.0";

    return {
      munId: m.id,
      nombre: m.nombre,
      tipo: m.tipo,
      parroquiasCount: m.parroquias.length,
      subCount,
      secCount: secInMun.length,
      casas,
      familias,
      habitantes,
      votantes,
      votoDuro,
      votoBlando,
      votoNuevo,
      electoresNominales,
      centrosCount: centros.size,
      habCasa,
      padronPct,
      digitalizacion: 100
    };
  });
}
