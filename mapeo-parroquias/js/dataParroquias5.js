/**
 * Polígonos Geográficos y Datos Base de las 5 Parroquias de Muestra
 * Estado Monagas — Mapeo Territorial y Cuadrículas Hexagonales
 */

export const PARROQUIAS_MUESTRA = [
  {
    id: "san-simon",
    nombre: "San Simón (Centro)",
    municipio: "Maturín",
    tipo: "Urbana Central",
    centro: [9.7469, -63.1812],
    zoom: 14,
    codigoPrefijo: "SIM",
    color: "#f59e0b",
    sectoresReferencia: [
      "Casco Central", "Palo Negro", "Brisas del Orinoco", "El Paraíso", 
      "La Muralla", "Guanaguanay", "Alberto Ravell"
    ],
    // Polígono perimetral representativo de San Simón
    limitePoligono: [
      [9.7620, -63.1950],
      [9.7650, -63.1720],
      [9.7540, -63.1610],
      [9.7380, -63.1620],
      [9.7300, -63.1780],
      [9.7340, -63.1980],
      [9.7490, -63.2010],
      [9.7620, -63.1950]
    ]
  },
  {
    id: "alto-de-los-godos",
    nombre: "Alto de Los Godos",
    municipio: "Maturín",
    tipo: "Urbana Densamente Poblada",
    centro: [9.7280, -63.2050],
    zoom: 14,
    codigoPrefijo: "GOD",
    color: "#0284c7",
    sectoresReferencia: [
      "Los Godos 1 y 2", "Morichal", "Fundemos 1, 2 y 3", "La Puente", 
      "Los Guaros", "El Silencio de Campo Alegre", "La Lucha"
    ],
    limitePoligono: [
      [9.7420, -63.2250],
      [9.7460, -63.1980],
      [9.7320, -63.1900],
      [9.7150, -63.1920],
      [9.7100, -63.2180],
      [9.7250, -63.2320],
      [9.7420, -63.2250]
    ]
  },
  {
    id: "boqueron",
    nombre: "Boquerón (Tipuro)",
    municipio: "Maturín",
    tipo: "Urbana / Expansión Norte",
    centro: [9.7850, -63.1920],
    zoom: 13,
    codigoPrefijo: "BOQ",
    color: "#10b981",
    sectoresReferencia: [
      "Tipuro 1 y 2", "Palma Real", "Los Cortijos (UDO)", "Costo Arriba", 
      "Viboral", "Boquerón Centro", "San Jaime"
    ],
    limitePoligono: [
      [9.8150, -63.2100],
      [9.8200, -63.1750],
      [9.7950, -63.1650],
      [9.7680, -63.1780],
      [9.7650, -63.2050],
      [9.7850, -63.2250],
      [9.8150, -63.2100]
    ]
  },
  {
    id: "las-cocuizas",
    nombre: "Las Cocuizas",
    municipio: "Maturín",
    tipo: "Urbana Tradicional Este",
    centro: [9.7550, -63.1480],
    zoom: 14,
    codigoPrefijo: "COC",
    color: "#8b5cf6",
    sectoresReferencia: [
      "Sabana Grande", "Las Cocuizas Centro", "El Nazareno", "El Silencio", 
      "Brisas del Aeropuerto", "La Floresta", "Zona Industrial Este"
    ],
    limitePoligono: [
      [9.7750, -63.1620],
      [9.7780, -63.1320],
      [9.7580, -63.1200],
      [9.7350, -63.1350],
      [9.7380, -63.1580],
      [9.7550, -63.1650],
      [9.7750, -63.1620]
    ]
  },
  {
    id: "caicara",
    nombre: "Caicara de Cedeño",
    municipio: "Cedeño",
    tipo: "Foránea / Suburbana",
    centro: [9.8220, -63.6150],
    zoom: 14,
    codigoPrefijo: "CAI",
    color: "#ec4899",
    sectoresReferencia: [
      "Casco de Caicara", "La Manga", "Bella Vista", "El Rincón", 
      "San Félix de Cedeño", "Pueblo Nuevo"
    ],
    limitePoligono: [
      [9.8400, -63.6350],
      [9.8420, -63.5950],
      [9.8250, -63.5850],
      [9.8050, -63.6000],
      [9.8020, -63.6280],
      [9.8200, -63.6400],
      [9.8400, -63.6350]
    ]
  }
];
