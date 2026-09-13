/**
 * Catálogo Oficial Completo de Municipios, Parroquias, Ejes Territoriales y Sectores
 * Estado Monagas • Consolidado CNE / Censo Territorial 2026
 * Estructurado en 4 capas para selección directa en Banner y Panel:
 * Municipio -> Parroquia -> Eje Territorial -> Sector Vecinal
 */

export const MONAGAS_TERRITORIO_COMPLETO = [
  {
    "id": "maturin",
    "nombre": "Maturín",
    "capital": "Maturín",
    "parroquias": [
      {
        "id": "san-simon",
        "nombre": "San Simón",
        "tipo": "Urbana Central",
        "centro": [
          9.7469,
          -63.1812
        ],
        "subparroquias": [
          {
            "id": "sub-ss-casco",
            "parroquiaId": "san-simon",
            "nombre": "Eje 1 • Casco Histórico y Comercial",
            "codigo": "EJE-SIM-01",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.7509,
                -63.1922
              ],
              [
                9.7519,
                -63.1762
              ],
              [
                9.7389,
                -63.1772
              ],
              [
                9.7379,
                -63.1912
              ],
              [
                9.7509,
                -63.1922
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-SIM-001",
                "nombre": "Centro Histórico Plaza Bolívar",
                "casas": 420,
                "familias": 510,
                "habitantes": 1590,
                "votantes": 1080,
                "centroVotacion": "U.E. Francisco Lazo Martí",
                "cobertura": 100,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "san-simon",
                "parishNombre": "San Simón",
                "subParroquiaId": "sub-ss-casco",
                "subParroquiaNombre": "Eje 1 • Casco Histórico y Comercial",
                "centro": [
                  9.749,
                  -63.17485
                ],
                "vertices": [
                  [
                    9.7515,
                    -63.17835
                  ],
                  [
                    9.7518,
                    -63.17165
                  ],
                  [
                    9.7466,
                    -63.17125
                  ],
                  [
                    9.7464,
                    -63.17795
                  ],
                  [
                    9.7515,
                    -63.17835
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-SIM-002",
                "nombre": "Bulevar Bicentenario",
                "casas": 380,
                "familias": 450,
                "habitantes": 1410,
                "votantes": 950,
                "centroVotacion": "Liceo Nacional Miguel José Sanz",
                "cobertura": 98,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "san-simon",
                "parishNombre": "San Simón",
                "subParroquiaId": "sub-ss-casco",
                "subParroquiaNombre": "Eje 1 • Casco Histórico y Comercial",
                "centro": [
                  9.752513,
                  -63.182026
                ],
                "vertices": [
                  [
                    9.755013,
                    -63.185526
                  ],
                  [
                    9.755313,
                    -63.178826
                  ],
                  [
                    9.750113,
                    -63.178426
                  ],
                  [
                    9.749913,
                    -63.185126
                  ],
                  [
                    9.755013,
                    -63.185526
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-SIM-003",
                "nombre": "Mercado Viejo - Av. Miranda",
                "casas": 510,
                "familias": 620,
                "habitantes": 1940,
                "votantes": 1290,
                "centroVotacion": "Escuela Básica Manuel Núñez Tovar",
                "cobertura": 99,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "san-simon",
                "parishNombre": "San Simón",
                "subParroquiaId": "sub-ss-casco",
                "subParroquiaNombre": "Eje 1 • Casco Histórico y Comercial",
                "centro": [
                  9.742912,
                  -63.177439
                ],
                "vertices": [
                  [
                    9.745412,
                    -63.180939
                  ],
                  [
                    9.745712,
                    -63.174239
                  ],
                  [
                    9.740512,
                    -63.173839
                  ],
                  [
                    9.740312,
                    -63.180539
                  ],
                  [
                    9.745412,
                    -63.180939
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-SIM-004",
                "nombre": "Plaza Ayacucho - La Manga",
                "casas": 460,
                "familias": 540,
                "habitantes": 1720,
                "votantes": 1140,
                "centroVotacion": "U.E. República del Uruguay",
                "cobertura": 100,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "san-simon",
                "parishNombre": "San Simón",
                "subParroquiaId": "sub-ss-casco",
                "subParroquiaNombre": "Eje 1 • Casco Histórico y Comercial",
                "centro": [
                  9.754405,
                  -63.173649
                ],
                "vertices": [
                  [
                    9.756905,
                    -63.177149
                  ],
                  [
                    9.757205,
                    -63.170449
                  ],
                  [
                    9.752005,
                    -63.170049
                  ],
                  [
                    9.751805,
                    -63.176749
                  ],
                  [
                    9.756905,
                    -63.177149
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          },
          {
            "id": "sub-ss-palo-negro",
            "parroquiaId": "san-simon",
            "nombre": "Eje 2 • Palo Negro - El Paraíso",
            "codigo": "EJE-SIM-02",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.7559,
                -63.1862
              ],
              [
                9.7569,
                -63.1702
              ],
              [
                9.7439,
                -63.1712
              ],
              [
                9.7429,
                -63.1852
              ],
              [
                9.7559,
                -63.1862
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-SIM-005",
                "nombre": "Palo Negro Sector Arriba",
                "casas": 620,
                "familias": 750,
                "habitantes": 2360,
                "votantes": 1540,
                "centroVotacion": "Colegio Virgen Misionera",
                "cobertura": 97,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "san-simon",
                "parishNombre": "San Simón",
                "subParroquiaId": "sub-ss-palo-negro",
                "subParroquiaNombre": "Eje 2 • Palo Negro - El Paraíso",
                "centro": [
                  9.747711,
                  -63.185651
                ],
                "vertices": [
                  [
                    9.750211,
                    -63.189151
                  ],
                  [
                    9.750511,
                    -63.182451
                  ],
                  [
                    9.745311,
                    -63.182051
                  ],
                  [
                    9.745111,
                    -63.188751
                  ],
                  [
                    9.750211,
                    -63.189151
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-SIM-006",
                "nombre": "Palo Negro Caserío Central",
                "casas": 540,
                "familias": 660,
                "habitantes": 2050,
                "votantes": 1330,
                "centroVotacion": "E.B. Simón Bolívar",
                "cobertura": 100,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "san-simon",
                "parishNombre": "San Simón",
                "subParroquiaId": "sub-ss-palo-negro",
                "subParroquiaNombre": "Eje 2 • Palo Negro - El Paraíso",
                "centro": [
                  9.744749,
                  -63.170984
                ],
                "vertices": [
                  [
                    9.747249,
                    -63.174484
                  ],
                  [
                    9.747549,
                    -63.167784
                  ],
                  [
                    9.742349,
                    -63.167384
                  ],
                  [
                    9.742149,
                    -63.174084
                  ],
                  [
                    9.747249,
                    -63.174484
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-SIM-007",
                "nombre": "El Paraíso - Av. Bicentenario",
                "casas": 430,
                "familias": 520,
                "habitantes": 1630,
                "votantes": 1090,
                "centroVotacion": "U.E. Félix Antonio Calderón",
                "cobertura": 96,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "san-simon",
                "parishNombre": "San Simón",
                "subParroquiaId": "sub-ss-palo-negro",
                "subParroquiaNombre": "Eje 2 • Palo Negro - El Paraíso",
                "centro": [
                  9.757101,
                  -63.180287
                ],
                "vertices": [
                  [
                    9.759601,
                    -63.183787
                  ],
                  [
                    9.759901,
                    -63.177087
                  ],
                  [
                    9.754701,
                    -63.176687
                  ],
                  [
                    9.754501,
                    -63.183387
                  ],
                  [
                    9.759601,
                    -63.183787
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          },
          {
            "id": "sub-ss-muralla",
            "parroquiaId": "san-simon",
            "nombre": "Eje 3 • La Muralla - Brisas del Orinoco",
            "codigo": "EJE-SIM-03",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.7609,
                -63.1802
              ],
              [
                9.7619,
                -63.1642
              ],
              [
                9.7489,
                -63.1652
              ],
              [
                9.7479,
                -63.1792
              ],
              [
                9.7609,
                -63.1802
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-SIM-008",
                "nombre": "La Muralla I",
                "casas": 710,
                "familias": 860,
                "habitantes": 2700,
                "votantes": 1780,
                "centroVotacion": "Liceo Idelfonso Núñez Mares",
                "cobertura": 100,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "san-simon",
                "parishNombre": "San Simón",
                "subParroquiaId": "sub-ss-muralla",
                "subParroquiaNombre": "Eje 3 • La Muralla - Brisas del Orinoco",
                "centro": [
                  9.741172,
                  -63.182269
                ],
                "vertices": [
                  [
                    9.743672,
                    -63.185769
                  ],
                  [
                    9.743972,
                    -63.179069
                  ],
                  [
                    9.738772,
                    -63.178669
                  ],
                  [
                    9.738572,
                    -63.185369
                  ],
                  [
                    9.743672,
                    -63.185769
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-SIM-009",
                "nombre": "La Muralla II",
                "casas": 650,
                "familias": 790,
                "habitantes": 2470,
                "votantes": 1610,
                "centroVotacion": "E.B. Luisa Cáceres de Arismendi",
                "cobertura": 98,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "san-simon",
                "parishNombre": "San Simón",
                "subParroquiaId": "sub-ss-muralla",
                "subParroquiaNombre": "Eje 3 • La Muralla - Brisas del Orinoco",
                "centro": [
                  9.752163,
                  -63.168904
                ],
                "vertices": [
                  [
                    9.754663,
                    -63.172404
                  ],
                  [
                    9.754963,
                    -63.165704
                  ],
                  [
                    9.749763,
                    -63.165304
                  ],
                  [
                    9.749563,
                    -63.172004
                  ],
                  [
                    9.754663,
                    -63.172404
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-SIM-010",
                "nombre": "Brisas del Orinoco Sector Central",
                "casas": 820,
                "familias": 990,
                "habitantes": 3120,
                "votantes": 2030,
                "centroVotacion": "U.E. Brisas del Orinoco",
                "cobertura": 99,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "san-simon",
                "parishNombre": "San Simón",
                "subParroquiaId": "sub-ss-muralla",
                "subParroquiaNombre": "Eje 3 • La Muralla - Brisas del Orinoco",
                "centro": [
                  9.752663,
                  -63.187317
                ],
                "vertices": [
                  [
                    9.755163,
                    -63.190817
                  ],
                  [
                    9.755463,
                    -63.184117
                  ],
                  [
                    9.750263,
                    -63.183717
                  ],
                  [
                    9.750063,
                    -63.190417
                  ],
                  [
                    9.755163,
                    -63.190817
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-SIM-011",
                "nombre": "Brisas del Orinoco Ribera",
                "casas": 490,
                "familias": 590,
                "habitantes": 1860,
                "votantes": 1210,
                "centroVotacion": "C.E.I. Pequeños Próceres",
                "cobertura": 95,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "san-simon",
                "parishNombre": "San Simón",
                "subParroquiaId": "sub-ss-muralla",
                "subParroquiaNombre": "Eje 3 • La Muralla - Brisas del Orinoco",
                "centro": [
                  9.737981,
                  -63.176569
                ],
                "vertices": [
                  [
                    9.740481,
                    -63.180069
                  ],
                  [
                    9.740781,
                    -63.173369
                  ],
                  [
                    9.735581,
                    -63.172969
                  ],
                  [
                    9.735381,
                    -63.179669
                  ],
                  [
                    9.740481,
                    -63.180069
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "alto-de-los-godos",
        "nombre": "Alto de Los Godos",
        "tipo": "Urbana Oeste",
        "centro": [
          9.728,
          -63.206
        ],
        "subparroquias": [
          {
            "id": "sub-godos-lapuente",
            "parroquiaId": "alto-de-los-godos",
            "nombre": "Eje 6 • Circuito Territorial La Puente",
            "codigo": "EJE-GOD-06",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.732,
                -63.217
              ],
              [
                9.733,
                -63.201
              ],
              [
                9.72,
                -63.202
              ],
              [
                9.719,
                -63.216
              ],
              [
                9.732,
                -63.217
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-GOD-001",
                "nombre": "La Puente Sector 1 (Plaza)",
                "casas": 480,
                "familias": 580,
                "habitantes": 1820,
                "votantes": 1220,
                "centroVotacion": "U.E. Gregorio Rondón",
                "cobertura": 100,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "alto-de-los-godos",
                "parishNombre": "Alto de Los Godos",
                "subParroquiaId": "sub-godos-lapuente",
                "subParroquiaNombre": "Eje 6 • Circuito Territorial La Puente",
                "centro": [
                  9.732,
                  -63.20885
                ],
                "vertices": [
                  [
                    9.7345,
                    -63.21235
                  ],
                  [
                    9.7348,
                    -63.20565
                  ],
                  [
                    9.7296,
                    -63.20525
                  ],
                  [
                    9.7294,
                    -63.21195
                  ],
                  [
                    9.7345,
                    -63.21235
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-GOD-002",
                "nombre": "La Puente Sector 2 (Cancha)",
                "casas": 530,
                "familias": 640,
                "habitantes": 2010,
                "votantes": 1350,
                "centroVotacion": "U.E. Gregorio Rondón",
                "cobertura": 99,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "alto-de-los-godos",
                "parishNombre": "Alto de Los Godos",
                "subParroquiaId": "sub-godos-lapuente",
                "subParroquiaNombre": "Eje 6 • Circuito Territorial La Puente",
                "centro": [
                  9.735513,
                  -63.216026
                ],
                "vertices": [
                  [
                    9.738013,
                    -63.219526
                  ],
                  [
                    9.738313,
                    -63.212826
                  ],
                  [
                    9.733113,
                    -63.212426
                  ],
                  [
                    9.732913,
                    -63.219126
                  ],
                  [
                    9.738013,
                    -63.219526
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-GOD-003",
                "nombre": "La Puente Sector 3 (Vialidad)",
                "casas": 460,
                "familias": 560,
                "habitantes": 1750,
                "votantes": 1170,
                "centroVotacion": "E.B. Cacique Guanaguanay",
                "cobertura": 98,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "alto-de-los-godos",
                "parishNombre": "Alto de Los Godos",
                "subParroquiaId": "sub-godos-lapuente",
                "subParroquiaNombre": "Eje 6 • Circuito Territorial La Puente",
                "centro": [
                  9.725912,
                  -63.211439
                ],
                "vertices": [
                  [
                    9.728412,
                    -63.214939
                  ],
                  [
                    9.728712,
                    -63.208239
                  ],
                  [
                    9.723512,
                    -63.207839
                  ],
                  [
                    9.723312,
                    -63.214539
                  ],
                  [
                    9.728412,
                    -63.214939
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-GOD-004",
                "nombre": "La Puente Sector 4 (Quebrada)",
                "casas": 590,
                "familias": 720,
                "habitantes": 2240,
                "votantes": 1500,
                "centroVotacion": "E.B. Cacique Guanaguanay",
                "cobertura": 97,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "alto-de-los-godos",
                "parishNombre": "Alto de Los Godos",
                "subParroquiaId": "sub-godos-lapuente",
                "subParroquiaNombre": "Eje 6 • Circuito Territorial La Puente",
                "centro": [
                  9.737405,
                  -63.207649
                ],
                "vertices": [
                  [
                    9.739905,
                    -63.211149
                  ],
                  [
                    9.740205,
                    -63.204449
                  ],
                  [
                    9.735005,
                    -63.204049
                  ],
                  [
                    9.734805,
                    -63.210749
                  ],
                  [
                    9.739905,
                    -63.211149
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-GOD-005",
                "nombre": "Villas de La Puente",
                "casas": 390,
                "familias": 470,
                "habitantes": 1480,
                "votantes": 990,
                "centroVotacion": "C.E.I. Los Samanes",
                "cobertura": 100,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "alto-de-los-godos",
                "parishNombre": "Alto de Los Godos",
                "subParroquiaId": "sub-godos-lapuente",
                "subParroquiaNombre": "Eje 6 • Circuito Territorial La Puente",
                "centro": [
                  9.730711,
                  -63.219651
                ],
                "vertices": [
                  [
                    9.733211,
                    -63.223151
                  ],
                  [
                    9.733511,
                    -63.216451
                  ],
                  [
                    9.728311,
                    -63.216051
                  ],
                  [
                    9.728111,
                    -63.222751
                  ],
                  [
                    9.733211,
                    -63.223151
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          },
          {
            "id": "sub-godos-central",
            "parroquiaId": "alto-de-los-godos",
            "nombre": "Eje 1 • Los Godos Casco Viejo - Fundemos",
            "codigo": "EJE-GOD-01",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.737,
                -63.211
              ],
              [
                9.738,
                -63.195
              ],
              [
                9.725,
                -63.196
              ],
              [
                9.724,
                -63.21
              ],
              [
                9.737,
                -63.211
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-GOD-006",
                "nombre": "Los Godos 1",
                "casas": 680,
                "familias": 820,
                "habitantes": 2580,
                "votantes": 1730,
                "centroVotacion": "Liceo Los Godos",
                "cobertura": 100,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "alto-de-los-godos",
                "parishNombre": "Alto de Los Godos",
                "subParroquiaId": "sub-godos-central",
                "subParroquiaNombre": "Eje 1 • Los Godos Casco Viejo - Fundemos",
                "centro": [
                  9.727749,
                  -63.204984
                ],
                "vertices": [
                  [
                    9.730249,
                    -63.208484
                  ],
                  [
                    9.730549,
                    -63.201784
                  ],
                  [
                    9.725349,
                    -63.201384
                  ],
                  [
                    9.725149,
                    -63.208084
                  ],
                  [
                    9.730249,
                    -63.208484
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-GOD-007",
                "nombre": "Los Godos 2",
                "casas": 720,
                "familias": 870,
                "habitantes": 2740,
                "votantes": 1830,
                "centroVotacion": "E.B. Félix Armando Núñez",
                "cobertura": 99,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "alto-de-los-godos",
                "parishNombre": "Alto de Los Godos",
                "subParroquiaId": "sub-godos-central",
                "subParroquiaNombre": "Eje 1 • Los Godos Casco Viejo - Fundemos",
                "centro": [
                  9.740101,
                  -63.214287
                ],
                "vertices": [
                  [
                    9.742601,
                    -63.217787
                  ],
                  [
                    9.742901,
                    -63.211087
                  ],
                  [
                    9.737701,
                    -63.210687
                  ],
                  [
                    9.737501,
                    -63.217387
                  ],
                  [
                    9.742601,
                    -63.217787
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-GOD-008",
                "nombre": "Fundemos I",
                "casas": 510,
                "familias": 620,
                "habitantes": 1940,
                "votantes": 1300,
                "centroVotacion": "U.E. Fundemos",
                "cobertura": 98,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "alto-de-los-godos",
                "parishNombre": "Alto de Los Godos",
                "subParroquiaId": "sub-godos-central",
                "subParroquiaNombre": "Eje 1 • Los Godos Casco Viejo - Fundemos",
                "centro": [
                  9.724172,
                  -63.216269
                ],
                "vertices": [
                  [
                    9.726672,
                    -63.219769
                  ],
                  [
                    9.726972,
                    -63.213069
                  ],
                  [
                    9.721772,
                    -63.212669
                  ],
                  [
                    9.721572,
                    -63.219369
                  ],
                  [
                    9.726672,
                    -63.219769
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-GOD-009",
                "nombre": "Fundemos II",
                "casas": 470,
                "familias": 570,
                "habitantes": 1790,
                "votantes": 1200,
                "centroVotacion": "U.E. Fundemos",
                "cobertura": 96,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "alto-de-los-godos",
                "parishNombre": "Alto de Los Godos",
                "subParroquiaId": "sub-godos-central",
                "subParroquiaNombre": "Eje 1 • Los Godos Casco Viejo - Fundemos",
                "centro": [
                  9.735163,
                  -63.202904
                ],
                "vertices": [
                  [
                    9.737663,
                    -63.206404
                  ],
                  [
                    9.737963,
                    -63.199704
                  ],
                  [
                    9.732763,
                    -63.199304
                  ],
                  [
                    9.732563,
                    -63.206004
                  ],
                  [
                    9.737663,
                    -63.206404
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          },
          {
            "id": "sub-godos-morichal",
            "parroquiaId": "alto-de-los-godos",
            "nombre": "Eje 4 • Morichal - Los Guaros",
            "codigo": "EJE-GOD-04",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.742,
                -63.205
              ],
              [
                9.743,
                -63.189
              ],
              [
                9.73,
                -63.19
              ],
              [
                9.729,
                -63.204
              ],
              [
                9.742,
                -63.205
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-GOD-010",
                "nombre": "Morichal Sector Grande",
                "casas": 810,
                "familias": 980,
                "habitantes": 3080,
                "votantes": 2060,
                "centroVotacion": "U.E. José Antonio Páez",
                "cobertura": 100,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "alto-de-los-godos",
                "parishNombre": "Alto de Los Godos",
                "subParroquiaId": "sub-godos-morichal",
                "subParroquiaNombre": "Eje 4 • Morichal - Los Guaros",
                "centro": [
                  9.735663,
                  -63.221317
                ],
                "vertices": [
                  [
                    9.738163,
                    -63.224817
                  ],
                  [
                    9.738463,
                    -63.218117
                  ],
                  [
                    9.733263,
                    -63.217717
                  ],
                  [
                    9.733063,
                    -63.224417
                  ],
                  [
                    9.738163,
                    -63.224817
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-GOD-011",
                "nombre": "Morichalito",
                "casas": 430,
                "familias": 520,
                "habitantes": 1630,
                "votantes": 1090,
                "centroVotacion": "E.B. Morichal",
                "cobertura": 98,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "alto-de-los-godos",
                "parishNombre": "Alto de Los Godos",
                "subParroquiaId": "sub-godos-morichal",
                "subParroquiaNombre": "Eje 4 • Morichal - Los Guaros",
                "centro": [
                  9.722981,
                  -63.207569
                ],
                "vertices": [
                  [
                    9.725481,
                    -63.211069
                  ],
                  [
                    9.725781,
                    -63.204369
                  ],
                  [
                    9.720581,
                    -63.203969
                  ],
                  [
                    9.720381,
                    -63.210669
                  ],
                  [
                    9.725481,
                    -63.211069
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-GOD-012",
                "nombre": "Los Guaros Central",
                "casas": 620,
                "familias": 750,
                "habitantes": 2360,
                "votantes": 1580,
                "centroVotacion": "C.E.I. Los Guaros",
                "cobertura": 100,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "alto-de-los-godos",
                "parishNombre": "Alto de Los Godos",
                "subParroquiaId": "sub-godos-morichal",
                "subParroquiaNombre": "Eje 4 • Morichal - Los Guaros",
                "centro": [
                  9.741825,
                  -63.208764
                ],
                "vertices": [
                  [
                    9.744325,
                    -63.212264
                  ],
                  [
                    9.744625,
                    -63.205564
                  ],
                  [
                    9.739425,
                    -63.205164
                  ],
                  [
                    9.739225,
                    -63.211864
                  ],
                  [
                    9.744325,
                    -63.212264
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "las-cocuizas",
        "nombre": "Las Cocuizas",
        "tipo": "Urbana Este",
        "centro": [
          9.756,
          -63.146
        ],
        "subparroquias": [
          {
            "id": "sub-coc-sabana",
            "parroquiaId": "las-cocuizas",
            "nombre": "Eje 1 • Sabana Grande y Aeropuerto",
            "codigo": "EJE-COC-01",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.76,
                -63.157
              ],
              [
                9.761,
                -63.141
              ],
              [
                9.748,
                -63.142
              ],
              [
                9.747,
                -63.156
              ],
              [
                9.76,
                -63.157
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-COC-001",
                "nombre": "Sabana Grande Sector 1",
                "casas": 750,
                "familias": 910,
                "habitantes": 2850,
                "votantes": 1910,
                "centroVotacion": "U.E. Sabana Grande",
                "cobertura": 100,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "las-cocuizas",
                "parishNombre": "Las Cocuizas",
                "subParroquiaId": "sub-coc-sabana",
                "subParroquiaNombre": "Eje 1 • Sabana Grande y Aeropuerto",
                "centro": [
                  9.758,
                  -63.14585
                ],
                "vertices": [
                  [
                    9.7605,
                    -63.14935
                  ],
                  [
                    9.7608,
                    -63.14265
                  ],
                  [
                    9.7556,
                    -63.14225
                  ],
                  [
                    9.7554,
                    -63.14895
                  ],
                  [
                    9.7605,
                    -63.14935
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-COC-002",
                "nombre": "Sabana Grande Sector 2",
                "casas": 680,
                "familias": 820,
                "habitantes": 2580,
                "votantes": 1730,
                "centroVotacion": "U.E. Sabana Grande",
                "cobertura": 99,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "las-cocuizas",
                "parishNombre": "Las Cocuizas",
                "subParroquiaId": "sub-coc-sabana",
                "subParroquiaNombre": "Eje 1 • Sabana Grande y Aeropuerto",
                "centro": [
                  9.761513,
                  -63.153026
                ],
                "vertices": [
                  [
                    9.764013,
                    -63.156526
                  ],
                  [
                    9.764313,
                    -63.149826
                  ],
                  [
                    9.759113,
                    -63.149426
                  ],
                  [
                    9.758913,
                    -63.156126
                  ],
                  [
                    9.764013,
                    -63.156526
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-COC-003",
                "nombre": "Zona Aeropuerto Internacional",
                "casas": 420,
                "familias": 510,
                "habitantes": 1600,
                "votantes": 1070,
                "centroVotacion": "Liceo José Tadeo Monagas",
                "cobertura": 96,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "las-cocuizas",
                "parishNombre": "Las Cocuizas",
                "subParroquiaId": "sub-coc-sabana",
                "subParroquiaNombre": "Eje 1 • Sabana Grande y Aeropuerto",
                "centro": [
                  9.751912,
                  -63.148439
                ],
                "vertices": [
                  [
                    9.754412,
                    -63.151939
                  ],
                  [
                    9.754712,
                    -63.145239
                  ],
                  [
                    9.749512,
                    -63.144839
                  ],
                  [
                    9.749312,
                    -63.151539
                  ],
                  [
                    9.754412,
                    -63.151939
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-COC-004",
                "nombre": "El Silencio",
                "casas": 890,
                "familias": 1080,
                "habitantes": 3380,
                "votantes": 2260,
                "centroVotacion": "E.B. El Silencio",
                "cobertura": 100,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "las-cocuizas",
                "parishNombre": "Las Cocuizas",
                "subParroquiaId": "sub-coc-sabana",
                "subParroquiaNombre": "Eje 1 • Sabana Grande y Aeropuerto",
                "centro": [
                  9.763405,
                  -63.144649
                ],
                "vertices": [
                  [
                    9.765905,
                    -63.148149
                  ],
                  [
                    9.766205,
                    -63.141449
                  ],
                  [
                    9.761005,
                    -63.141049
                  ],
                  [
                    9.760805,
                    -63.147749
                  ],
                  [
                    9.765905,
                    -63.148149
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          },
          {
            "id": "sub-coc-nazareno",
            "parroquiaId": "las-cocuizas",
            "nombre": "Eje 2 • El Nazareno - La Floresta",
            "codigo": "EJE-COC-02",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.765,
                -63.151
              ],
              [
                9.766,
                -63.135
              ],
              [
                9.753,
                -63.136
              ],
              [
                9.752,
                -63.15
              ],
              [
                9.765,
                -63.151
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-COC-005",
                "nombre": "El Nazareno Caserío",
                "casas": 590,
                "familias": 710,
                "habitantes": 2240,
                "votantes": 1500,
                "centroVotacion": "U.E. El Nazareno",
                "cobertura": 98,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "las-cocuizas",
                "parishNombre": "Las Cocuizas",
                "subParroquiaId": "sub-coc-nazareno",
                "subParroquiaNombre": "Eje 2 • El Nazareno - La Floresta",
                "centro": [
                  9.756711,
                  -63.156651
                ],
                "vertices": [
                  [
                    9.759211,
                    -63.160151
                  ],
                  [
                    9.759511,
                    -63.153451
                  ],
                  [
                    9.754311,
                    -63.153051
                  ],
                  [
                    9.754111,
                    -63.159751
                  ],
                  [
                    9.759211,
                    -63.160151
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-COC-006",
                "nombre": "La Floresta Sector Norte",
                "casas": 720,
                "familias": 870,
                "habitantes": 2740,
                "votantes": 1830,
                "centroVotacion": "Colegio La Floresta",
                "cobertura": 100,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "las-cocuizas",
                "parishNombre": "Las Cocuizas",
                "subParroquiaId": "sub-coc-nazareno",
                "subParroquiaNombre": "Eje 2 • El Nazareno - La Floresta",
                "centro": [
                  9.753749,
                  -63.141984
                ],
                "vertices": [
                  [
                    9.756249,
                    -63.145484
                  ],
                  [
                    9.756549,
                    -63.138784
                  ],
                  [
                    9.751349,
                    -63.138384
                  ],
                  [
                    9.751149,
                    -63.145084
                  ],
                  [
                    9.756249,
                    -63.145484
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-COC-007",
                "nombre": "Parque del Este Residencial",
                "casas": 480,
                "familias": 580,
                "habitantes": 1820,
                "votantes": 1220,
                "centroVotacion": "C.E.I. Mi Casita",
                "cobertura": 97,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "las-cocuizas",
                "parishNombre": "Las Cocuizas",
                "subParroquiaId": "sub-coc-nazareno",
                "subParroquiaNombre": "Eje 2 • El Nazareno - La Floresta",
                "centro": [
                  9.766101,
                  -63.151287
                ],
                "vertices": [
                  [
                    9.768601,
                    -63.154787
                  ],
                  [
                    9.768901,
                    -63.148087
                  ],
                  [
                    9.763701,
                    -63.147687
                  ],
                  [
                    9.763501,
                    -63.154387
                  ],
                  [
                    9.768601,
                    -63.154787
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "boqueron",
        "nombre": "Boquerón",
        "tipo": "Urbana Norte",
        "centro": [
          9.788,
          -63.19
        ],
        "subparroquias": [
          {
            "id": "sub-boq-tipuro",
            "parroquiaId": "boqueron",
            "nombre": "Eje 1 • Tipuro - Palma Real",
            "codigo": "EJE-BOQ-01",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.792,
                -63.201
              ],
              [
                9.793,
                -63.185
              ],
              [
                9.78,
                -63.186
              ],
              [
                9.779,
                -63.2
              ],
              [
                9.792,
                -63.201
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-BOQ-001",
                "nombre": "Tipuro I (Urbanizaciones)",
                "casas": 850,
                "familias": 980,
                "habitantes": 3100,
                "votantes": 2150,
                "centroVotacion": "Colegio Alejandro de Humboldt",
                "cobertura": 99,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "boqueron",
                "parishNombre": "Boquerón",
                "subParroquiaId": "sub-boq-tipuro",
                "subParroquiaNombre": "Eje 1 • Tipuro - Palma Real",
                "centro": [
                  9.789,
                  -63.19185
                ],
                "vertices": [
                  [
                    9.7915,
                    -63.19535
                  ],
                  [
                    9.7918,
                    -63.18865
                  ],
                  [
                    9.7866,
                    -63.18825
                  ],
                  [
                    9.7864,
                    -63.19495
                  ],
                  [
                    9.7915,
                    -63.19535
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-BOQ-002",
                "nombre": "Tipuro II (Villas del Norte)",
                "casas": 920,
                "familias": 1060,
                "habitantes": 3350,
                "votantes": 2320,
                "centroVotacion": "Colegio Los Sauces",
                "cobertura": 98,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "boqueron",
                "parishNombre": "Boquerón",
                "subParroquiaId": "sub-boq-tipuro",
                "subParroquiaNombre": "Eje 1 • Tipuro - Palma Real",
                "centro": [
                  9.792513,
                  -63.199026
                ],
                "vertices": [
                  [
                    9.795013,
                    -63.202526
                  ],
                  [
                    9.795313,
                    -63.195826
                  ],
                  [
                    9.790113,
                    -63.195426
                  ],
                  [
                    9.789913,
                    -63.202126
                  ],
                  [
                    9.795013,
                    -63.202526
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-BOQ-003",
                "nombre": "Palma Real Norte",
                "casas": 640,
                "familias": 740,
                "habitantes": 2340,
                "votantes": 1620,
                "centroVotacion": "U.E. Palma Real",
                "cobertura": 100,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "boqueron",
                "parishNombre": "Boquerón",
                "subParroquiaId": "sub-boq-tipuro",
                "subParroquiaNombre": "Eje 1 • Tipuro - Palma Real",
                "centro": [
                  9.782912,
                  -63.194439
                ],
                "vertices": [
                  [
                    9.785412,
                    -63.197939
                  ],
                  [
                    9.785712,
                    -63.191239
                  ],
                  [
                    9.780512,
                    -63.190839
                  ],
                  [
                    9.780312,
                    -63.197539
                  ],
                  [
                    9.785412,
                    -63.197939
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-BOQ-004",
                "nombre": "Los Cortijos de Tipuro",
                "casas": 530,
                "familias": 610,
                "habitantes": 1930,
                "votantes": 1340,
                "centroVotacion": "U.E. Los Cortijos",
                "cobertura": 97,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "boqueron",
                "parishNombre": "Boquerón",
                "subParroquiaId": "sub-boq-tipuro",
                "subParroquiaNombre": "Eje 1 • Tipuro - Palma Real",
                "centro": [
                  9.794405,
                  -63.190649
                ],
                "vertices": [
                  [
                    9.796905,
                    -63.194149
                  ],
                  [
                    9.797205,
                    -63.187449
                  ],
                  [
                    9.792005,
                    -63.187049
                  ],
                  [
                    9.791805,
                    -63.193749
                  ],
                  [
                    9.796905,
                    -63.194149
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          },
          {
            "id": "sub-boq-viboral",
            "parroquiaId": "boqueron",
            "nombre": "Eje 2 • Boquerón Centro - Costo Arriba",
            "codigo": "EJE-BOQ-02",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.797,
                -63.195
              ],
              [
                9.798,
                -63.179
              ],
              [
                9.785,
                -63.18
              ],
              [
                9.784,
                -63.194
              ],
              [
                9.797,
                -63.195
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-BOQ-005",
                "nombre": "Boquerón Pueblo",
                "casas": 710,
                "familias": 860,
                "habitantes": 2700,
                "votantes": 1810,
                "centroVotacion": "E.B. Boquerón",
                "cobertura": 100,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "boqueron",
                "parishNombre": "Boquerón",
                "subParroquiaId": "sub-boq-viboral",
                "subParroquiaNombre": "Eje 2 • Boquerón Centro - Costo Arriba",
                "centro": [
                  9.787711,
                  -63.202651
                ],
                "vertices": [
                  [
                    9.790211,
                    -63.206151
                  ],
                  [
                    9.790511,
                    -63.199451
                  ],
                  [
                    9.785311,
                    -63.199051
                  ],
                  [
                    9.785111,
                    -63.205751
                  ],
                  [
                    9.790211,
                    -63.206151
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-BOQ-006",
                "nombre": "Costo Arriba",
                "casas": 580,
                "familias": 700,
                "habitantes": 2200,
                "votantes": 1470,
                "centroVotacion": "U.E. Costo Arriba",
                "cobertura": 96,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "boqueron",
                "parishNombre": "Boquerón",
                "subParroquiaId": "sub-boq-viboral",
                "subParroquiaNombre": "Eje 2 • Boquerón Centro - Costo Arriba",
                "centro": [
                  9.784749,
                  -63.187984
                ],
                "vertices": [
                  [
                    9.787249,
                    -63.191484
                  ],
                  [
                    9.787549,
                    -63.184784
                  ],
                  [
                    9.782349,
                    -63.184384
                  ],
                  [
                    9.782149,
                    -63.191084
                  ],
                  [
                    9.787249,
                    -63.191484
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-BOQ-007",
                "nombre": "Viboral Agrícola",
                "casas": 490,
                "familias": 590,
                "habitantes": 1860,
                "votantes": 1250,
                "centroVotacion": "E.B. Viboral",
                "cobertura": 98,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "boqueron",
                "parishNombre": "Boquerón",
                "subParroquiaId": "sub-boq-viboral",
                "subParroquiaNombre": "Eje 2 • Boquerón Centro - Costo Arriba",
                "centro": [
                  9.797101,
                  -63.197287
                ],
                "vertices": [
                  [
                    9.799601,
                    -63.200787
                  ],
                  [
                    9.799901,
                    -63.194087
                  ],
                  [
                    9.794701,
                    -63.193687
                  ],
                  [
                    9.794501,
                    -63.200387
                  ],
                  [
                    9.799601,
                    -63.200787
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "santa-cruz",
        "nombre": "Santa Cruz (La Cruz)",
        "tipo": "Urbana Suroeste",
        "centro": [
          9.712,
          -63.238
        ],
        "subparroquias": [
          {
            "id": "sub-stc-granvictoria",
            "parroquiaId": "santa-cruz",
            "nombre": "Eje 1 • Gran Victoria y Zona Industrial",
            "codigo": "EJE-STC-01",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.716,
                -63.249
              ],
              [
                9.717,
                -63.233
              ],
              [
                9.704,
                -63.234
              ],
              [
                9.703,
                -63.248
              ],
              [
                9.716,
                -63.249
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-STC-001",
                "nombre": "La Gran Victoria Sector A-B",
                "casas": 950,
                "familias": 1150,
                "habitantes": 3610,
                "votantes": 2420,
                "centroVotacion": "U.E. La Gran Victoria",
                "cobertura": 100,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "santa-cruz",
                "parishNombre": "Santa Cruz (La Cruz)",
                "subParroquiaId": "sub-stc-granvictoria",
                "subParroquiaNombre": "Eje 1 • Gran Victoria y Zona Industrial",
                "centro": [
                  9.715,
                  -63.23485
                ],
                "vertices": [
                  [
                    9.7175,
                    -63.23835
                  ],
                  [
                    9.7178,
                    -63.23165
                  ],
                  [
                    9.7126,
                    -63.23125
                  ],
                  [
                    9.7124,
                    -63.23795
                  ],
                  [
                    9.7175,
                    -63.23835
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-STC-002",
                "nombre": "La Gran Victoria Sector C-D",
                "casas": 880,
                "familias": 1060,
                "habitantes": 3340,
                "votantes": 2240,
                "centroVotacion": "U.E. La Gran Victoria",
                "cobertura": 99,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "santa-cruz",
                "parishNombre": "Santa Cruz (La Cruz)",
                "subParroquiaId": "sub-stc-granvictoria",
                "subParroquiaNombre": "Eje 1 • Gran Victoria y Zona Industrial",
                "centro": [
                  9.718513,
                  -63.242026
                ],
                "vertices": [
                  [
                    9.721013,
                    -63.245526
                  ],
                  [
                    9.721313,
                    -63.238826
                  ],
                  [
                    9.716113,
                    -63.238426
                  ],
                  [
                    9.715913,
                    -63.245126
                  ],
                  [
                    9.721013,
                    -63.245526
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-STC-003",
                "nombre": "Santa Cruz Casco Viejo",
                "casas": 670,
                "familias": 810,
                "habitantes": 2550,
                "votantes": 1710,
                "centroVotacion": "Liceo Santa Cruz",
                "cobertura": 100,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "santa-cruz",
                "parishNombre": "Santa Cruz (La Cruz)",
                "subParroquiaId": "sub-stc-granvictoria",
                "subParroquiaNombre": "Eje 1 • Gran Victoria y Zona Industrial",
                "centro": [
                  9.708912,
                  -63.237439
                ],
                "vertices": [
                  [
                    9.711412,
                    -63.240939
                  ],
                  [
                    9.711712,
                    -63.234239
                  ],
                  [
                    9.706512,
                    -63.233839
                  ],
                  [
                    9.706312,
                    -63.240539
                  ],
                  [
                    9.711412,
                    -63.240939
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-STC-004",
                "nombre": "Zona Industrial Residencial",
                "casas": 410,
                "familias": 500,
                "habitantes": 1560,
                "votantes": 1050,
                "centroVotacion": "E.B. Los Pinos",
                "cobertura": 95,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "santa-cruz",
                "parishNombre": "Santa Cruz (La Cruz)",
                "subParroquiaId": "sub-stc-granvictoria",
                "subParroquiaNombre": "Eje 1 • Gran Victoria y Zona Industrial",
                "centro": [
                  9.720405,
                  -63.233649
                ],
                "vertices": [
                  [
                    9.722905,
                    -63.237149
                  ],
                  [
                    9.723205,
                    -63.230449
                  ],
                  [
                    9.718005,
                    -63.230049
                  ],
                  [
                    9.717805,
                    -63.236749
                  ],
                  [
                    9.722905,
                    -63.237149
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "san-vicente",
        "nombre": "San Vicente",
        "tipo": "Suburbana",
        "centro": [
          9.728,
          -63.285
        ],
        "subparroquias": [
          {
            "id": "sub-vic-pueblo",
            "parroquiaId": "san-vicente",
            "nombre": "Eje 1 • San Vicente Central y Pueblos Nuevos",
            "codigo": "EJE-VIC-01",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.732,
                -63.296
              ],
              [
                9.733,
                -63.28
              ],
              [
                9.72,
                -63.281
              ],
              [
                9.719,
                -63.295
              ],
              [
                9.732,
                -63.296
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-VIC-001",
                "nombre": "San Vicente Casco Central",
                "casas": 610,
                "familias": 740,
                "habitantes": 2320,
                "votantes": 1550,
                "centroVotacion": "E.B. San Vicente",
                "cobertura": 100,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "san-vicente",
                "parishNombre": "San Vicente",
                "subParroquiaId": "sub-vic-pueblo",
                "subParroquiaNombre": "Eje 1 • San Vicente Central y Pueblos Nuevos",
                "centro": [
                  9.729,
                  -63.28085
                ],
                "vertices": [
                  [
                    9.7315,
                    -63.28435
                  ],
                  [
                    9.7318,
                    -63.27765
                  ],
                  [
                    9.7266,
                    -63.27725
                  ],
                  [
                    9.7264,
                    -63.28395
                  ],
                  [
                    9.7315,
                    -63.28435
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-VIC-002",
                "nombre": "Pueblo Nuevo San Vicente",
                "casas": 530,
                "familias": 640,
                "habitantes": 2010,
                "votantes": 1350,
                "centroVotacion": "U.E. Pueblo Nuevo",
                "cobertura": 98,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "san-vicente",
                "parishNombre": "San Vicente",
                "subParroquiaId": "sub-vic-pueblo",
                "subParroquiaNombre": "Eje 1 • San Vicente Central y Pueblos Nuevos",
                "centro": [
                  9.732513,
                  -63.288026
                ],
                "vertices": [
                  [
                    9.735013,
                    -63.291526
                  ],
                  [
                    9.735313,
                    -63.284826
                  ],
                  [
                    9.730113,
                    -63.284426
                  ],
                  [
                    9.729913,
                    -63.291126
                  ],
                  [
                    9.735013,
                    -63.291526
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-VIC-003",
                "nombre": "Corocito y Las Parcelas",
                "casas": 440,
                "familias": 530,
                "habitantes": 1670,
                "votantes": 1120,
                "centroVotacion": "C.E.I. Corocito",
                "cobertura": 97,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "san-vicente",
                "parishNombre": "San Vicente",
                "subParroquiaId": "sub-vic-pueblo",
                "subParroquiaNombre": "Eje 1 • San Vicente Central y Pueblos Nuevos",
                "centro": [
                  9.729,
                  -63.284
                ],
                "vertices": [
                  [
                    9.7315,
                    -63.2875
                  ],
                  [
                    9.7318,
                    -63.2808
                  ],
                  [
                    9.7266,
                    -63.2804
                  ],
                  [
                    9.7264,
                    -63.2871
                  ],
                  [
                    9.7315,
                    -63.2875
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "la-pica",
        "nombre": "La Pica",
        "tipo": "Rural y Lacustre",
        "centro": [
          9.775,
          -63.078
        ],
        "subparroquias": [
          {
            "id": "sub-pic-centro",
            "parroquiaId": "la-pica",
            "nombre": "Eje 1 • La Pica Centro y Puerta Negra",
            "codigo": "EJE-PIC-01",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.779,
                -63.089
              ],
              [
                9.78,
                -63.073
              ],
              [
                9.767,
                -63.074
              ],
              [
                9.766,
                -63.088
              ],
              [
                9.779,
                -63.089
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-PIC-001",
                "nombre": "La Pica Casco",
                "casas": 580,
                "familias": 700,
                "habitantes": 2200,
                "votantes": 1470,
                "centroVotacion": "Liceo Nacional La Pica",
                "cobertura": 99,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "la-pica",
                "parishNombre": "La Pica",
                "subParroquiaId": "sub-pic-centro",
                "subParroquiaNombre": "Eje 1 • La Pica Centro y Puerta Negra",
                "centro": [
                  9.776,
                  -63.07585
                ],
                "vertices": [
                  [
                    9.7785,
                    -63.07935
                  ],
                  [
                    9.7788,
                    -63.07265
                  ],
                  [
                    9.7736,
                    -63.07225
                  ],
                  [
                    9.7734,
                    -63.07895
                  ],
                  [
                    9.7785,
                    -63.07935
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-PIC-002",
                "nombre": "Puerta Negra",
                "casas": 490,
                "familias": 590,
                "habitantes": 1860,
                "votantes": 1250,
                "centroVotacion": "E.B. Puerta Negra",
                "cobertura": 96,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "la-pica",
                "parishNombre": "La Pica",
                "subParroquiaId": "sub-pic-centro",
                "subParroquiaNombre": "Eje 1 • La Pica Centro y Puerta Negra",
                "centro": [
                  9.779513,
                  -63.083026
                ],
                "vertices": [
                  [
                    9.782013,
                    -63.086526
                  ],
                  [
                    9.782313,
                    -63.079826
                  ],
                  [
                    9.777113,
                    -63.079426
                  ],
                  [
                    9.776913,
                    -63.086126
                  ],
                  [
                    9.782013,
                    -63.086526
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-PIC-003",
                "nombre": "Laguna Grande",
                "casas": 370,
                "familias": 450,
                "habitantes": 1410,
                "votantes": 940,
                "centroVotacion": "U.E. Laguna Grande",
                "cobertura": 98,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "la-pica",
                "parishNombre": "La Pica",
                "subParroquiaId": "sub-pic-centro",
                "subParroquiaNombre": "Eje 1 • La Pica Centro y Puerta Negra",
                "centro": [
                  9.769912,
                  -63.078439
                ],
                "vertices": [
                  [
                    9.772412,
                    -63.081939
                  ],
                  [
                    9.772712,
                    -63.075239
                  ],
                  [
                    9.767512,
                    -63.074839
                  ],
                  [
                    9.767312,
                    -63.081539
                  ],
                  [
                    9.772412,
                    -63.081939
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "jusepin",
        "nombre": "Jusepín",
        "tipo": "Petrolera y Rural",
        "centro": [
          9.748,
          -63.502
        ],
        "subparroquias": [
          {
            "id": "sub-jus-campo",
            "parroquiaId": "jusepin",
            "nombre": "Eje 1 • Jusepín Campo Petrolero y UDO",
            "codigo": "EJE-JUS-01",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.752,
                -63.513
              ],
              [
                9.753,
                -63.497
              ],
              [
                9.74,
                -63.498
              ],
              [
                9.739,
                -63.512
              ],
              [
                9.752,
                -63.513
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-JUS-001",
                "nombre": "Jusepín Casco Histórico",
                "casas": 520,
                "familias": 630,
                "habitantes": 1980,
                "votantes": 1330,
                "centroVotacion": "E.B. Jusepín",
                "cobertura": 100,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "jusepin",
                "parishNombre": "Jusepín",
                "subParroquiaId": "sub-jus-campo",
                "subParroquiaNombre": "Eje 1 • Jusepín Campo Petrolero y UDO",
                "centro": [
                  9.749,
                  -63.50085
                ],
                "vertices": [
                  [
                    9.7515,
                    -63.50435
                  ],
                  [
                    9.7518,
                    -63.49765
                  ],
                  [
                    9.7466,
                    -63.49725
                  ],
                  [
                    9.7464,
                    -63.50395
                  ],
                  [
                    9.7515,
                    -63.50435
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-JUS-002",
                "nombre": "Sector Universitario UDO",
                "casas": 460,
                "familias": 550,
                "habitantes": 1750,
                "votantes": 1170,
                "centroVotacion": "U.E. Jusepín Oriente",
                "cobertura": 97,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "jusepin",
                "parishNombre": "Jusepín",
                "subParroquiaId": "sub-jus-campo",
                "subParroquiaNombre": "Eje 1 • Jusepín Campo Petrolero y UDO",
                "centro": [
                  9.752513,
                  -63.508026
                ],
                "vertices": [
                  [
                    9.755013,
                    -63.511526
                  ],
                  [
                    9.755313,
                    -63.504826
                  ],
                  [
                    9.750113,
                    -63.504426
                  ],
                  [
                    9.749913,
                    -63.511126
                  ],
                  [
                    9.755013,
                    -63.511526
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-JUS-003",
                "nombre": "Campo Morichalito Petrolero",
                "casas": 390,
                "familias": 470,
                "habitantes": 1480,
                "votantes": 990,
                "centroVotacion": "Colegio San José",
                "cobertura": 98,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "jusepin",
                "parishNombre": "Jusepín",
                "subParroquiaId": "sub-jus-campo",
                "subParroquiaNombre": "Eje 1 • Jusepín Campo Petrolero y UDO",
                "centro": [
                  9.749,
                  -63.504
                ],
                "vertices": [
                  [
                    9.7515,
                    -63.5075
                  ],
                  [
                    9.7518,
                    -63.5008
                  ],
                  [
                    9.7466,
                    -63.5004
                  ],
                  [
                    9.7464,
                    -63.5071
                  ],
                  [
                    9.7515,
                    -63.5075
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "el-furrial",
        "nombre": "El Furrial",
        "tipo": "Agro-Petrolera",
        "centro": [
          9.725,
          -63.365
        ],
        "subparroquias": [
          {
            "id": "sub-fur-eje",
            "parroquiaId": "el-furrial",
            "nombre": "Eje 1 • El Furrial Centro y Vía La Ceiba",
            "codigo": "EJE-FUR-01",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.729,
                -63.376
              ],
              [
                9.73,
                -63.36
              ],
              [
                9.717,
                -63.361
              ],
              [
                9.716,
                -63.375
              ],
              [
                9.729,
                -63.376
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-FUR-001",
                "nombre": "El Furrial Casco Tradicional",
                "casas": 670,
                "familias": 810,
                "habitantes": 2550,
                "votantes": 1710,
                "centroVotacion": "Liceo Nacional El Furrial",
                "cobertura": 100,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "el-furrial",
                "parishNombre": "El Furrial",
                "subParroquiaId": "sub-fur-eje",
                "subParroquiaNombre": "Eje 1 • El Furrial Centro y Vía La Ceiba",
                "centro": [
                  9.726,
                  -63.366
                ],
                "vertices": [
                  [
                    9.7285,
                    -63.3695
                  ],
                  [
                    9.7288,
                    -63.3628
                  ],
                  [
                    9.7236,
                    -63.3624
                  ],
                  [
                    9.7234,
                    -63.3691
                  ],
                  [
                    9.7285,
                    -63.3695
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-FUR-002",
                "nombre": "La Ceiba El Furrial",
                "casas": 510,
                "familias": 620,
                "habitantes": 1940,
                "votantes": 1300,
                "centroVotacion": "E.B. La Ceiba",
                "cobertura": 97,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "el-furrial",
                "parishNombre": "El Furrial",
                "subParroquiaId": "sub-fur-eje",
                "subParroquiaNombre": "Eje 1 • El Furrial Centro y Vía La Ceiba",
                "centro": [
                  9.731,
                  -63.372
                ],
                "vertices": [
                  [
                    9.7335,
                    -63.3755
                  ],
                  [
                    9.7338,
                    -63.3688
                  ],
                  [
                    9.7286,
                    -63.3684
                  ],
                  [
                    9.7284,
                    -63.3751
                  ],
                  [
                    9.7335,
                    -63.3755
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-FUR-003",
                "nombre": "La Candelaria de Furrial",
                "casas": 430,
                "familias": 520,
                "habitantes": 1630,
                "votantes": 1090,
                "centroVotacion": "U.E. Candelaria",
                "cobertura": 98,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "el-furrial",
                "parishNombre": "El Furrial",
                "subParroquiaId": "sub-fur-eje",
                "subParroquiaNombre": "Eje 1 • El Furrial Centro y Vía La Ceiba",
                "centro": [
                  9.715,
                  -63.354
                ],
                "vertices": [
                  [
                    9.7175,
                    -63.3575
                  ],
                  [
                    9.7178,
                    -63.3508
                  ],
                  [
                    9.7126,
                    -63.3504
                  ],
                  [
                    9.7124,
                    -63.3571
                  ],
                  [
                    9.7175,
                    -63.3575
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "el-corozo",
        "nombre": "El Corozo",
        "tipo": "Rural y Sabana Sur",
        "centro": [
          9.675,
          -63.215
        ],
        "subparroquias": [
          {
            "id": "sub-cor-centro",
            "parroquiaId": "el-corozo",
            "nombre": "Eje 1 • El Corozo Casco y La Morita",
            "codigo": "EJE-COR-01",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.679,
                -63.226
              ],
              [
                9.68,
                -63.21
              ],
              [
                9.667,
                -63.211
              ],
              [
                9.666,
                -63.225
              ],
              [
                9.679,
                -63.226
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-COR-001",
                "nombre": "El Corozo Casco Central",
                "casas": 490,
                "familias": 590,
                "habitantes": 1860,
                "votantes": 1250,
                "centroVotacion": "E.B. El Corozo",
                "cobertura": 100,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "el-corozo",
                "parishNombre": "El Corozo",
                "subParroquiaId": "sub-cor-centro",
                "subParroquiaNombre": "Eje 1 • El Corozo Casco y La Morita",
                "centro": [
                  9.676,
                  -63.216
                ],
                "vertices": [
                  [
                    9.6785,
                    -63.2195
                  ],
                  [
                    9.6788,
                    -63.2128
                  ],
                  [
                    9.6736,
                    -63.2124
                  ],
                  [
                    9.6734,
                    -63.2191
                  ],
                  [
                    9.6785,
                    -63.2195
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-COR-002",
                "nombre": "La Morita y Sabana del Corozo",
                "casas": 420,
                "familias": 510,
                "habitantes": 1600,
                "votantes": 1070,
                "centroVotacion": "U.E. La Morita",
                "cobertura": 96,
                "munId": "maturin",
                "munNombre": "Maturín",
                "parishId": "el-corozo",
                "parishNombre": "El Corozo",
                "subParroquiaId": "sub-cor-centro",
                "subParroquiaNombre": "Eje 1 • El Corozo Casco y La Morita",
                "centro": [
                  9.680196,
                  -63.2115
                ],
                "vertices": [
                  [
                    9.682696,
                    -63.215
                  ],
                  [
                    9.682996,
                    -63.2083
                  ],
                  [
                    9.677796,
                    -63.2079
                  ],
                  [
                    9.677596,
                    -63.2146
                  ],
                  [
                    9.682696,
                    -63.215
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "san-simon-sur",
        "nombre": "San Simón Sur",
        "tipo": "Rural y Sabana Sur",
        "centro": [
          9.3636,
          -62.8426
        ],
        "subparroquias": [
          {
            "id": "sub-sur-santaines",
            "parroquiaId": "san-simon-sur",
            "nombre": "Eje 1 • Santa Inés - La Orquídea",
            "codigo": "EJE-SUR-01",
            "colorBorde": "#f59e0b",
            "anchoBorde": 2.5,
            "colorRelleno": "#d97706",
            "opacidad": 0.2,
            "vertices": [
              [9.7390, -63.1850],
              [9.7420, -63.1650],
              [9.7280, -63.1650],
              [9.7250, -63.1850],
              [9.7390, -63.1850]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-SUR-001",
                "subParroquiaId": "sub-sur-santaines",
                "nombre": "Santa Inés I y II",
                "tipo": "Sector Vecinal",
                "centro": [9.7379, -63.1765],
                "centroVotacion": "Casa De Misiones Santa Ines Ii",
                "casas": 380,
                "habitantes": 1250,
                "votantes": 890,
                "vertices": [
                  [9.7400, -63.1800],
                  [9.7410, -63.1730],
                  [9.7350, -63.1730],
                  [9.7340, -63.1800],
                  [9.7400, -63.1800]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-SUR-002",
                "subParroquiaId": "sub-sur-santaines",
                "nombre": "La Orquídea del Sur",
                "tipo": "Sector Vecinal",
                "centro": [9.7446, -63.1697],
                "centroVotacion": "Centro De Votacion La Orquidea Del Sur",
                "casas": 290,
                "habitantes": 980,
                "votantes": 710,
                "vertices": [
                  [9.7460, -63.1720],
                  [9.7470, -63.1670],
                  [9.7420, -63.1670],
                  [9.7410, -63.1720],
                  [9.7460, -63.1720]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "bolivar",
    "nombre": "Bolívar",
    "capital": "Caripito",
    "parroquias": [
      {
        "id": "caripito",
        "nombre": "Caripito",
        "tipo": "Urbana Central",
        "centro": [
          9.7469,
          -63.1812
        ],
        "subparroquias": [
          {
            "id": "sub-bol-car-01",
            "parroquiaId": "caripito",
            "nombre": "Eje 1 • San Rafael y Mercado",
            "codigo": "EJE-BOL-01",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.7509,
                -63.1922
              ],
              [
                9.7519,
                -63.1762
              ],
              [
                9.7389,
                -63.1772
              ],
              [
                9.7379,
                -63.1912
              ],
              [
                9.7509,
                -63.1922
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-BOL-001",
                "nombre": "Caripito Arriba - Plaza Bolívar",
                "casas": 540,
                "familias": 650,
                "habitantes": 2050,
                "votantes": 1370,
                "centroVotacion": "Liceo Pedro Gual",
                "cobertura": 100,
                "munId": "bolivar",
                "munNombre": "Bolívar",
                "parishId": "caripito",
                "parishNombre": "Caripito",
                "subParroquiaId": "sub-bol-car-01",
                "subParroquiaNombre": "Eje 1 • San Rafael y Mercado",
                "centro": [
                  9.7469,
                  -63.1762
                ],
                "vertices": [
                  [
                    9.7494,
                    -63.1797
                  ],
                  [
                    9.7497,
                    -63.173
                  ],
                  [
                    9.7445,
                    -63.1726
                  ],
                  [
                    9.7443,
                    -63.1793
                  ],
                  [
                    9.7494,
                    -63.1797
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-BOL-002",
                "nombre": "San Rafael de Caripito",
                "casas": 610,
                "familias": 730,
                "habitantes": 2320,
                "votantes": 1550,
                "centroVotacion": "E.B. San Rafael",
                "cobertura": 99,
                "munId": "bolivar",
                "munNombre": "Bolívar",
                "parishId": "caripito",
                "parishNombre": "Caripito",
                "subParroquiaId": "sub-bol-car-01",
                "subParroquiaNombre": "Eje 1 • San Rafael y Mercado",
                "centro": [
                  9.752096,
                  -63.1777
                ],
                "vertices": [
                  [
                    9.754596,
                    -63.1812
                  ],
                  [
                    9.754896,
                    -63.1745
                  ],
                  [
                    9.749696,
                    -63.1741
                  ],
                  [
                    9.749496,
                    -63.1808
                  ],
                  [
                    9.754596,
                    -63.1812
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-BOL-003",
                "nombre": "El Rincón - Ribera del Río",
                "casas": 480,
                "familias": 580,
                "habitantes": 1820,
                "votantes": 1220,
                "centroVotacion": "U.E. El Rincón",
                "cobertura": 96,
                "munId": "bolivar",
                "munNombre": "Bolívar",
                "parishId": "caripito",
                "parishNombre": "Caripito",
                "subParroquiaId": "sub-bol-car-01",
                "subParroquiaNombre": "Eje 1 • San Rafael y Mercado",
                "centro": [
                  9.753828,
                  -63.1857
                ],
                "vertices": [
                  [
                    9.756328,
                    -63.1892
                  ],
                  [
                    9.756628,
                    -63.1825
                  ],
                  [
                    9.751428,
                    -63.1821
                  ],
                  [
                    9.751228,
                    -63.1888
                  ],
                  [
                    9.756328,
                    -63.1892
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          },
          {
            "id": "sub-bol-car-02",
            "parroquiaId": "caripito",
            "nombre": "Eje 2 • Caripito Abajo y Kilómetro 4",
            "codigo": "EJE-BOL-02",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.7559,
                -63.1862
              ],
              [
                9.7569,
                -63.1702
              ],
              [
                9.7439,
                -63.1712
              ],
              [
                9.7429,
                -63.1852
              ],
              [
                9.7559,
                -63.1862
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-BOL-004",
                "nombre": "Caripito Abajo",
                "casas": 590,
                "familias": 710,
                "habitantes": 2240,
                "votantes": 1500,
                "centroVotacion": "E.B. Caripito Abajo",
                "cobertura": 98,
                "munId": "bolivar",
                "munNombre": "Bolívar",
                "parishId": "caripito",
                "parishNombre": "Caripito",
                "subParroquiaId": "sub-bol-car-02",
                "subParroquiaNombre": "Eje 2 • Caripito Abajo y Kilómetro 4",
                "centro": [
                  9.748818,
                  -63.176812
                ],
                "vertices": [
                  [
                    9.751318,
                    -63.180312
                  ],
                  [
                    9.751618,
                    -63.173612
                  ],
                  [
                    9.746418,
                    -63.173212
                  ],
                  [
                    9.746218,
                    -63.179912
                  ],
                  [
                    9.751318,
                    -63.180312
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-BOL-005",
                "nombre": "Kilómetro 4 y Las Parcelas",
                "casas": 430,
                "familias": 520,
                "habitantes": 1630,
                "votantes": 1090,
                "centroVotacion": "U.E. Km 4",
                "cobertura": 97,
                "munId": "bolivar",
                "munNombre": "Bolívar",
                "parishId": "caripito",
                "parishNombre": "Caripito",
                "subParroquiaId": "sub-bol-car-02",
                "subParroquiaNombre": "Eje 2 • Caripito Abajo y Kilómetro 4",
                "centro": [
                  9.752898,
                  -63.181035
                ],
                "vertices": [
                  [
                    9.755398,
                    -63.184535
                  ],
                  [
                    9.755698,
                    -63.177835
                  ],
                  [
                    9.750498,
                    -63.177435
                  ],
                  [
                    9.750298,
                    -63.184135
                  ],
                  [
                    9.755398,
                    -63.184535
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "san-antonio-bolivar",
        "nombre": "San Antonio de Caripito",
        "tipo": "Rural",
        "centro": [
          9.7469,
          -63.1812
        ],
        "subparroquias": [
          {
            "id": "sub-bol-san-01",
            "parroquiaId": "san-antonio-bolivar",
            "nombre": "Eje 1 • San Antonio y Caño de Cruz",
            "codigo": "EJE-BOL-03",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.7509,
                -63.1922
              ],
              [
                9.7519,
                -63.1762
              ],
              [
                9.7389,
                -63.1772
              ],
              [
                9.7379,
                -63.1912
              ],
              [
                9.7509,
                -63.1922
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-BOL-006",
                "nombre": "San Antonio Casco",
                "casas": 380,
                "familias": 460,
                "habitantes": 1440,
                "votantes": 960,
                "centroVotacion": "E.B. San Antonio",
                "cobertura": 98,
                "munId": "bolivar",
                "munNombre": "Bolívar",
                "parishId": "san-antonio-bolivar",
                "parishNombre": "San Antonio de Caripito",
                "subParroquiaId": "sub-bol-san-01",
                "subParroquiaNombre": "Eje 1 • San Antonio y Caño de Cruz",
                "centro": [
                  9.7469,
                  -63.1762
                ],
                "vertices": [
                  [
                    9.7494,
                    -63.1797
                  ],
                  [
                    9.7497,
                    -63.173
                  ],
                  [
                    9.7445,
                    -63.1726
                  ],
                  [
                    9.7443,
                    -63.1793
                  ],
                  [
                    9.7494,
                    -63.1797
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-BOL-007",
                "nombre": "Caño de Cruz Agrícola",
                "casas": 290,
                "familias": 350,
                "habitantes": 1100,
                "votantes": 740,
                "centroVotacion": "U.E. Caño de Cruz",
                "cobertura": 95,
                "munId": "bolivar",
                "munNombre": "Bolívar",
                "parishId": "san-antonio-bolivar",
                "parishNombre": "San Antonio de Caripito",
                "subParroquiaId": "sub-bol-san-01",
                "subParroquiaNombre": "Eje 1 • San Antonio y Caño de Cruz",
                "centro": [
                  9.752096,
                  -63.1777
                ],
                "vertices": [
                  [
                    9.754596,
                    -63.1812
                  ],
                  [
                    9.754896,
                    -63.1745
                  ],
                  [
                    9.749696,
                    -63.1741
                  ],
                  [
                    9.749496,
                    -63.1808
                  ],
                  [
                    9.754596,
                    -63.1812
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "la-candelaria-bolivar",
        "nombre": "La Candelaria",
        "tipo": "Rural",
        "centro": [
          9.7469,
          -63.1812
        ],
        "subparroquias": [
          {
            "id": "sub-bol-can-01",
            "parroquiaId": "la-candelaria-bolivar",
            "nombre": "Eje 1 • La Candelaria y Quebrada Seca",
            "codigo": "EJE-BOL-04",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.7509,
                -63.1922
              ],
              [
                9.7519,
                -63.1762
              ],
              [
                9.7389,
                -63.1772
              ],
              [
                9.7379,
                -63.1912
              ],
              [
                9.7509,
                -63.1922
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-BOL-008",
                "nombre": "Candelaria Pueblo",
                "casas": 340,
                "familias": 410,
                "habitantes": 1290,
                "votantes": 860,
                "centroVotacion": "E.B. La Candelaria",
                "cobertura": 96,
                "munId": "bolivar",
                "munNombre": "Bolívar",
                "parishId": "la-candelaria-bolivar",
                "parishNombre": "La Candelaria",
                "subParroquiaId": "sub-bol-can-01",
                "subParroquiaNombre": "Eje 1 • La Candelaria y Quebrada Seca",
                "centro": [
                  9.7469,
                  -63.1762
                ],
                "vertices": [
                  [
                    9.7494,
                    -63.1797
                  ],
                  [
                    9.7497,
                    -63.173
                  ],
                  [
                    9.7445,
                    -63.1726
                  ],
                  [
                    9.7443,
                    -63.1793
                  ],
                  [
                    9.7494,
                    -63.1797
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "ezequiel-zamora",
    "nombre": "Ezequiel Zamora",
    "capital": "Punta de Mata",
    "parroquias": [
      {
        "id": "punta-de-mata",
        "nombre": "Punta de Mata",
        "tipo": "Urbana Central",
        "centro": [
          9.7469,
          -63.1812
        ],
        "subparroquias": [
          {
            "id": "sub-zam-pdm-01",
            "parroquiaId": "punta-de-mata",
            "nombre": "Eje 1 • Punta de Mata Casco y 18 de Mayo",
            "codigo": "EJE-ZAM-01",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.7509,
                -63.1922
              ],
              [
                9.7519,
                -63.1762
              ],
              [
                9.7389,
                -63.1772
              ],
              [
                9.7379,
                -63.1912
              ],
              [
                9.7509,
                -63.1922
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-ZAM-001",
                "nombre": "Punta de Mata Centro Comercial",
                "casas": 640,
                "familias": 770,
                "habitantes": 2430,
                "votantes": 1630,
                "centroVotacion": "Liceo Nacional Punta de Mata",
                "cobertura": 100,
                "munId": "ezequiel-zamora",
                "munNombre": "Ezequiel Zamora",
                "parishId": "punta-de-mata",
                "parishNombre": "Punta de Mata",
                "subParroquiaId": "sub-zam-pdm-01",
                "subParroquiaNombre": "Eje 1 • Punta de Mata Casco y 18 de Mayo",
                "centro": [
                  9.7469,
                  -63.1762
                ],
                "vertices": [
                  [
                    9.7494,
                    -63.1797
                  ],
                  [
                    9.7497,
                    -63.173
                  ],
                  [
                    9.7445,
                    -63.1726
                  ],
                  [
                    9.7443,
                    -63.1793
                  ],
                  [
                    9.7494,
                    -63.1797
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-ZAM-002",
                "nombre": "18 de Mayo",
                "casas": 720,
                "familias": 870,
                "habitantes": 2740,
                "votantes": 1830,
                "centroVotacion": "E.B. 18 de Mayo",
                "cobertura": 99,
                "munId": "ezequiel-zamora",
                "munNombre": "Ezequiel Zamora",
                "parishId": "punta-de-mata",
                "parishNombre": "Punta de Mata",
                "subParroquiaId": "sub-zam-pdm-01",
                "subParroquiaNombre": "Eje 1 • Punta de Mata Casco y 18 de Mayo",
                "centro": [
                  9.752096,
                  -63.1777
                ],
                "vertices": [
                  [
                    9.754596,
                    -63.1812
                  ],
                  [
                    9.754896,
                    -63.1745
                  ],
                  [
                    9.749696,
                    -63.1741
                  ],
                  [
                    9.749496,
                    -63.1808
                  ],
                  [
                    9.754596,
                    -63.1812
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-ZAM-003",
                "nombre": "La Arboleda Petrolera",
                "casas": 580,
                "familias": 700,
                "habitantes": 2200,
                "votantes": 1470,
                "centroVotacion": "Colegio Virgen del Valle",
                "cobertura": 98,
                "munId": "ezequiel-zamora",
                "munNombre": "Ezequiel Zamora",
                "parishId": "punta-de-mata",
                "parishNombre": "Punta de Mata",
                "subParroquiaId": "sub-zam-pdm-01",
                "subParroquiaNombre": "Eje 1 • Punta de Mata Casco y 18 de Mayo",
                "centro": [
                  9.753828,
                  -63.1857
                ],
                "vertices": [
                  [
                    9.756328,
                    -63.1892
                  ],
                  [
                    9.756628,
                    -63.1825
                  ],
                  [
                    9.751428,
                    -63.1821
                  ],
                  [
                    9.751228,
                    -63.1888
                  ],
                  [
                    9.756328,
                    -63.1892
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-ZAM-004",
                "nombre": "El Bosque - La Esperanza",
                "casas": 530,
                "familias": 640,
                "habitantes": 2010,
                "votantes": 1350,
                "centroVotacion": "U.E. La Esperanza",
                "cobertura": 97,
                "munId": "ezequiel-zamora",
                "munNombre": "Ezequiel Zamora",
                "parishId": "punta-de-mata",
                "parishNombre": "Punta de Mata",
                "subParroquiaId": "sub-zam-pdm-01",
                "subParroquiaNombre": "Eje 1 • Punta de Mata Casco y 18 de Mayo",
                "centro": [
                  9.7469,
                  -63.1922
                ],
                "vertices": [
                  [
                    9.7494,
                    -63.1957
                  ],
                  [
                    9.7497,
                    -63.189
                  ],
                  [
                    9.7445,
                    -63.1886
                  ],
                  [
                    9.7443,
                    -63.1953
                  ],
                  [
                    9.7494,
                    -63.1957
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          },
          {
            "id": "sub-zam-pdm-02",
            "parroquiaId": "punta-de-mata",
            "nombre": "Eje 2 • Virgen del Carmen y Morichalito",
            "codigo": "EJE-ZAM-02",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.7559,
                -63.1862
              ],
              [
                9.7569,
                -63.1702
              ],
              [
                9.7439,
                -63.1712
              ],
              [
                9.7429,
                -63.1852
              ],
              [
                9.7559,
                -63.1862
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-ZAM-005",
                "nombre": "Virgen del Carmen",
                "casas": 610,
                "familias": 730,
                "habitantes": 2320,
                "votantes": 1550,
                "centroVotacion": "E.B. Virgen del Carmen",
                "cobertura": 100,
                "munId": "ezequiel-zamora",
                "munNombre": "Ezequiel Zamora",
                "parishId": "punta-de-mata",
                "parishNombre": "Punta de Mata",
                "subParroquiaId": "sub-zam-pdm-02",
                "subParroquiaNombre": "Eje 2 • Virgen del Carmen y Morichalito",
                "centro": [
                  9.748818,
                  -63.176812
                ],
                "vertices": [
                  [
                    9.751318,
                    -63.180312
                  ],
                  [
                    9.751618,
                    -63.173612
                  ],
                  [
                    9.746418,
                    -63.173212
                  ],
                  [
                    9.746218,
                    -63.179912
                  ],
                  [
                    9.751318,
                    -63.180312
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-ZAM-006",
                "nombre": "Morichalito Zamora",
                "casas": 490,
                "familias": 590,
                "habitantes": 1860,
                "votantes": 1250,
                "centroVotacion": "C.E.I. Morichalito",
                "cobertura": 98,
                "munId": "ezequiel-zamora",
                "munNombre": "Ezequiel Zamora",
                "parishId": "punta-de-mata",
                "parishNombre": "Punta de Mata",
                "subParroquiaId": "sub-zam-pdm-02",
                "subParroquiaNombre": "Eje 2 • Virgen del Carmen y Morichalito",
                "centro": [
                  9.752898,
                  -63.181035
                ],
                "vertices": [
                  [
                    9.755398,
                    -63.184535
                  ],
                  [
                    9.755698,
                    -63.177835
                  ],
                  [
                    9.750498,
                    -63.177435
                  ],
                  [
                    9.750298,
                    -63.184135
                  ],
                  [
                    9.755398,
                    -63.184535
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "el-tejero",
        "nombre": "El Tejero",
        "tipo": "Petrolera",
        "centro": [
          9.685,
          -63.535
        ],
        "subparroquias": [
          {
            "id": "sub-zam-tej-01",
            "parroquiaId": "el-tejero",
            "nombre": "Eje 1 • El Tejero Casco y Casupal",
            "codigo": "EJE-ZAM-03",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.689,
                -63.546
              ],
              [
                9.69,
                -63.53
              ],
              [
                9.677,
                -63.531
              ],
              [
                9.676,
                -63.545
              ],
              [
                9.689,
                -63.546
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-ZAM-007",
                "nombre": "El Tejero Casco Central",
                "casas": 560,
                "familias": 670,
                "habitantes": 2130,
                "votantes": 1420,
                "centroVotacion": "E.B. El Tejero",
                "cobertura": 100,
                "munId": "ezequiel-zamora",
                "munNombre": "Ezequiel Zamora",
                "parishId": "el-tejero",
                "parishNombre": "El Tejero",
                "subParroquiaId": "sub-zam-tej-01",
                "subParroquiaNombre": "Eje 1 • El Tejero Casco y Casupal",
                "centro": [
                  9.685,
                  -63.53
                ],
                "vertices": [
                  [
                    9.6875,
                    -63.5335
                  ],
                  [
                    9.6878,
                    -63.5268
                  ],
                  [
                    9.6826,
                    -63.5264
                  ],
                  [
                    9.6824,
                    -63.5331
                  ],
                  [
                    9.6875,
                    -63.5335
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-ZAM-008",
                "nombre": "Casupal y Vía San Ramón",
                "casas": 410,
                "familias": 490,
                "habitantes": 1560,
                "votantes": 1040,
                "centroVotacion": "U.E. Casupal",
                "cobertura": 96,
                "munId": "ezequiel-zamora",
                "munNombre": "Ezequiel Zamora",
                "parishId": "el-tejero",
                "parishNombre": "El Tejero",
                "subParroquiaId": "sub-zam-tej-01",
                "subParroquiaNombre": "Eje 1 • El Tejero Casco y Casupal",
                "centro": [
                  9.690196,
                  -63.5315
                ],
                "vertices": [
                  [
                    9.692696,
                    -63.535
                  ],
                  [
                    9.692996,
                    -63.5283
                  ],
                  [
                    9.687796,
                    -63.5279
                  ],
                  [
                    9.687596,
                    -63.5346
                  ],
                  [
                    9.692696,
                    -63.535
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "piar",
    "nombre": "Piar",
    "capital": "Aragua de Maturín",
    "parroquias": [
      {
        "id": "aragua-de-maturin",
        "nombre": "Aragua de Maturín",
        "tipo": "Cabecera",
        "centro": [
          9.7469,
          -63.1812
        ],
        "subparroquias": [
          {
            "id": "sub-pia-ara-01",
            "parroquiaId": "aragua-de-maturin",
            "nombre": "Eje 1 • Aragua Centro y El Catuaro",
            "codigo": "EJE-PIA-01",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.7509,
                -63.1922
              ],
              [
                9.7519,
                -63.1762
              ],
              [
                9.7389,
                -63.1772
              ],
              [
                9.7379,
                -63.1912
              ],
              [
                9.7509,
                -63.1922
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-PIA-001",
                "nombre": "Aragua Casco Plaza Bolívar",
                "casas": 530,
                "familias": 640,
                "habitantes": 2010,
                "votantes": 1350,
                "centroVotacion": "Liceo Félix Armando Núñez",
                "cobertura": 100,
                "munId": "piar",
                "munNombre": "Piar",
                "parishId": "aragua-de-maturin",
                "parishNombre": "Aragua de Maturín",
                "subParroquiaId": "sub-pia-ara-01",
                "subParroquiaNombre": "Eje 1 • Aragua Centro y El Catuaro",
                "centro": [
                  9.7469,
                  -63.1762
                ],
                "vertices": [
                  [
                    9.7494,
                    -63.1797
                  ],
                  [
                    9.7497,
                    -63.173
                  ],
                  [
                    9.7445,
                    -63.1726
                  ],
                  [
                    9.7443,
                    -63.1793
                  ],
                  [
                    9.7494,
                    -63.1797
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-PIA-002",
                "nombre": "El Catuaro Arriba",
                "casas": 420,
                "familias": 500,
                "habitantes": 1600,
                "votantes": 1070,
                "centroVotacion": "E.B. El Catuaro",
                "cobertura": 98,
                "munId": "piar",
                "munNombre": "Piar",
                "parishId": "aragua-de-maturin",
                "parishNombre": "Aragua de Maturín",
                "subParroquiaId": "sub-pia-ara-01",
                "subParroquiaNombre": "Eje 1 • Aragua Centro y El Catuaro",
                "centro": [
                  9.752096,
                  -63.1777
                ],
                "vertices": [
                  [
                    9.754596,
                    -63.1812
                  ],
                  [
                    9.754896,
                    -63.1745
                  ],
                  [
                    9.749696,
                    -63.1741
                  ],
                  [
                    9.749496,
                    -63.1808
                  ],
                  [
                    9.754596,
                    -63.1812
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-PIA-003",
                "nombre": "Las Delicias de Aragua",
                "casas": 390,
                "familias": 470,
                "habitantes": 1480,
                "votantes": 990,
                "centroVotacion": "U.E. Las Delicias",
                "cobertura": 97,
                "munId": "piar",
                "munNombre": "Piar",
                "parishId": "aragua-de-maturin",
                "parishNombre": "Aragua de Maturín",
                "subParroquiaId": "sub-pia-ara-01",
                "subParroquiaNombre": "Eje 1 • Aragua Centro y El Catuaro",
                "centro": [
                  9.753828,
                  -63.1857
                ],
                "vertices": [
                  [
                    9.756328,
                    -63.1892
                  ],
                  [
                    9.756628,
                    -63.1825
                  ],
                  [
                    9.751428,
                    -63.1821
                  ],
                  [
                    9.751228,
                    -63.1888
                  ],
                  [
                    9.756328,
                    -63.1892
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "chaguaramal",
        "nombre": "Chaguaramal",
        "tipo": "Agrícola",
        "centro": [
          9.945,
          -63.415
        ],
        "subparroquias": [
          {
            "id": "sub-pia-cha-01",
            "parroquiaId": "chaguaramal",
            "nombre": "Eje 1 • Chaguaramal y Boquerón de Chaguaramal",
            "codigo": "EJE-PIA-02",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.949,
                -63.426
              ],
              [
                9.95,
                -63.41
              ],
              [
                9.937,
                -63.411
              ],
              [
                9.936,
                -63.425
              ],
              [
                9.949,
                -63.426
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-PIA-004",
                "nombre": "Chaguaramal Centro",
                "casas": 440,
                "familias": 530,
                "habitantes": 1670,
                "votantes": 1120,
                "centroVotacion": "E.B. Chaguaramal",
                "cobertura": 99,
                "munId": "piar",
                "munNombre": "Piar",
                "parishId": "chaguaramal",
                "parishNombre": "Chaguaramal",
                "subParroquiaId": "sub-pia-cha-01",
                "subParroquiaNombre": "Eje 1 • Chaguaramal y Boquerón de Chaguaramal",
                "centro": [
                  9.945,
                  -63.41
                ],
                "vertices": [
                  [
                    9.9475,
                    -63.4135
                  ],
                  [
                    9.9478,
                    -63.4068
                  ],
                  [
                    9.9426,
                    -63.4064
                  ],
                  [
                    9.9424,
                    -63.4131
                  ],
                  [
                    9.9475,
                    -63.4135
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-PIA-005",
                "nombre": "Boquerón de Chaguaramal",
                "casas": 310,
                "familias": 370,
                "habitantes": 1180,
                "votantes": 790,
                "centroVotacion": "U.E. Boquerón Piar",
                "cobertura": 96,
                "munId": "piar",
                "munNombre": "Piar",
                "parishId": "chaguaramal",
                "parishNombre": "Chaguaramal",
                "subParroquiaId": "sub-pia-cha-01",
                "subParroquiaNombre": "Eje 1 • Chaguaramal y Boquerón de Chaguaramal",
                "centro": [
                  9.950196,
                  -63.4115
                ],
                "vertices": [
                  [
                    9.952696,
                    -63.415
                  ],
                  [
                    9.952996,
                    -63.4083
                  ],
                  [
                    9.947796,
                    -63.4079
                  ],
                  [
                    9.947596,
                    -63.4146
                  ],
                  [
                    9.952696,
                    -63.415
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "guanaguana",
        "nombre": "Guanaguana",
        "tipo": "Colonial y Valles",
        "centro": [
          10.055,
          -63.525
        ],
        "subparroquias": [
          {
            "id": "sub-pia-gua-01",
            "parroquiaId": "guanaguana",
            "nombre": "Eje 1 • Guanaguana Histórica y Río Colorado",
            "codigo": "EJE-PIA-03",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                10.059,
                -63.536
              ],
              [
                10.06,
                -63.52
              ],
              [
                10.047,
                -63.521
              ],
              [
                10.046,
                -63.535
              ],
              [
                10.059,
                -63.536
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-PIA-006",
                "nombre": "Guanaguana Pueblo Histórico",
                "casas": 410,
                "familias": 490,
                "habitantes": 1560,
                "votantes": 1040,
                "centroVotacion": "E.B. San Miguel Arcángel",
                "cobertura": 100,
                "munId": "piar",
                "munNombre": "Piar",
                "parishId": "guanaguana",
                "parishNombre": "Guanaguana",
                "subParroquiaId": "sub-pia-gua-01",
                "subParroquiaNombre": "Eje 1 • Guanaguana Histórica y Río Colorado",
                "centro": [
                  10.055,
                  -63.52
                ],
                "vertices": [
                  [
                    10.0575,
                    -63.5235
                  ],
                  [
                    10.0578,
                    -63.5168
                  ],
                  [
                    10.0526,
                    -63.5164
                  ],
                  [
                    10.0524,
                    -63.5231
                  ],
                  [
                    10.0575,
                    -63.5235
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-PIA-007",
                "nombre": "Río Colorado de Guanaguana",
                "casas": 280,
                "familias": 340,
                "habitantes": 1060,
                "votantes": 710,
                "centroVotacion": "U.E. Río Colorado",
                "cobertura": 95,
                "munId": "piar",
                "munNombre": "Piar",
                "parishId": "guanaguana",
                "parishNombre": "Guanaguana",
                "subParroquiaId": "sub-pia-gua-01",
                "subParroquiaNombre": "Eje 1 • Guanaguana Histórica y Río Colorado",
                "centro": [
                  10.060196,
                  -63.5215
                ],
                "vertices": [
                  [
                    10.062696,
                    -63.525
                  ],
                  [
                    10.062996,
                    -63.5183
                  ],
                  [
                    10.057796,
                    -63.5179
                  ],
                  [
                    10.057596,
                    -63.5246
                  ],
                  [
                    10.062696,
                    -63.525
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "aparicio",
        "nombre": "Aparicio",
        "tipo": "Rural",
        "centro": [
          9.985,
          -63.565
        ],
        "subparroquias": [
          {
            "id": "sub-pia-apa-01",
            "parroquiaId": "aparicio",
            "nombre": "Eje 1 • Aparicio Pueblo",
            "codigo": "EJE-PIA-04",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.989,
                -63.576
              ],
              [
                9.99,
                -63.56
              ],
              [
                9.977,
                -63.561
              ],
              [
                9.976,
                -63.575
              ],
              [
                9.989,
                -63.576
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-PIA-008",
                "nombre": "Aparicio Casco",
                "casas": 350,
                "familias": 420,
                "habitantes": 1330,
                "votantes": 890,
                "centroVotacion": "E.B. Aparicio",
                "cobertura": 98,
                "munId": "piar",
                "munNombre": "Piar",
                "parishId": "aparicio",
                "parishNombre": "Aparicio",
                "subParroquiaId": "sub-pia-apa-01",
                "subParroquiaNombre": "Eje 1 • Aparicio Pueblo",
                "centro": [
                  9.985,
                  -63.56
                ],
                "vertices": [
                  [
                    9.9875,
                    -63.5635
                  ],
                  [
                    9.9878,
                    -63.5568
                  ],
                  [
                    9.9826,
                    -63.5564
                  ],
                  [
                    9.9824,
                    -63.5631
                  ],
                  [
                    9.9875,
                    -63.5635
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "el-pinto",
        "nombre": "El Pinto",
        "tipo": "Rural y Café",
        "centro": [
          9.915,
          -63.475
        ],
        "subparroquias": [
          {
            "id": "sub-pia-pin-01",
            "parroquiaId": "el-pinto",
            "nombre": "Eje 1 • El Pinto y Sabana de El Pinto",
            "codigo": "EJE-PIA-05",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.919,
                -63.486
              ],
              [
                9.92,
                -63.47
              ],
              [
                9.907,
                -63.471
              ],
              [
                9.906,
                -63.485
              ],
              [
                9.919,
                -63.486
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-PIA-009",
                "nombre": "El Pinto Centro",
                "casas": 370,
                "familias": 440,
                "habitantes": 1410,
                "votantes": 940,
                "centroVotacion": "U.E. El Pinto",
                "cobertura": 98,
                "munId": "piar",
                "munNombre": "Piar",
                "parishId": "el-pinto",
                "parishNombre": "El Pinto",
                "subParroquiaId": "sub-pia-pin-01",
                "subParroquiaNombre": "Eje 1 • El Pinto y Sabana de El Pinto",
                "centro": [
                  9.915,
                  -63.47
                ],
                "vertices": [
                  [
                    9.9175,
                    -63.4735
                  ],
                  [
                    9.9178,
                    -63.4668
                  ],
                  [
                    9.9126,
                    -63.4664
                  ],
                  [
                    9.9124,
                    -63.4731
                  ],
                  [
                    9.9175,
                    -63.4735
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "la-toscana",
        "nombre": "La Toscana",
        "tipo": "Sub-Urbana",
        "centro": [
          9.855,
          -63.425
        ],
        "subparroquias": [
          {
            "id": "sub-pia-tos-01",
            "parroquiaId": "la-toscana",
            "nombre": "Eje 1 • La Toscana y Bajo Grande",
            "codigo": "EJE-PIA-06",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.859,
                -63.436
              ],
              [
                9.86,
                -63.42
              ],
              [
                9.847,
                -63.421
              ],
              [
                9.846,
                -63.435
              ],
              [
                9.859,
                -63.436
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-PIA-010",
                "nombre": "La Toscana Pueblo",
                "casas": 480,
                "familias": 580,
                "habitantes": 1820,
                "votantes": 1220,
                "centroVotacion": "E.B. La Toscana",
                "cobertura": 99,
                "munId": "piar",
                "munNombre": "Piar",
                "parishId": "la-toscana",
                "parishNombre": "La Toscana",
                "subParroquiaId": "sub-pia-tos-01",
                "subParroquiaNombre": "Eje 1 • La Toscana y Bajo Grande",
                "centro": [
                  9.855,
                  -63.42
                ],
                "vertices": [
                  [
                    9.8575,
                    -63.4235
                  ],
                  [
                    9.8578,
                    -63.4168
                  ],
                  [
                    9.8526,
                    -63.4164
                  ],
                  [
                    9.8524,
                    -63.4231
                  ],
                  [
                    9.8575,
                    -63.4235
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-PIA-011",
                "nombre": "Bajo Grande Piar",
                "casas": 320,
                "familias": 380,
                "habitantes": 1220,
                "votantes": 810,
                "centroVotacion": "U.E. Bajo Grande",
                "cobertura": 96,
                "munId": "piar",
                "munNombre": "Piar",
                "parishId": "la-toscana",
                "parishNombre": "La Toscana",
                "subParroquiaId": "sub-pia-tos-01",
                "subParroquiaNombre": "Eje 1 • La Toscana y Bajo Grande",
                "centro": [
                  9.860196,
                  -63.4215
                ],
                "vertices": [
                  [
                    9.862696,
                    -63.425
                  ],
                  [
                    9.862996,
                    -63.4183
                  ],
                  [
                    9.857796,
                    -63.4179
                  ],
                  [
                    9.857596,
                    -63.4246
                  ],
                  [
                    9.862696,
                    -63.425
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "taguaya",
        "nombre": "Taguaya",
        "tipo": "Rural Serranía",
        "centro": [
          9.905,
          -63.355
        ],
        "subparroquias": [
          {
            "id": "sub-pia-tag-01",
            "parroquiaId": "taguaya",
            "nombre": "Eje 1 • Taguaya Centro",
            "codigo": "EJE-PIA-07",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.909,
                -63.366
              ],
              [
                9.91,
                -63.35
              ],
              [
                9.897,
                -63.351
              ],
              [
                9.896,
                -63.365
              ],
              [
                9.909,
                -63.366
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-PIA-012",
                "nombre": "Taguaya Pueblo",
                "casas": 290,
                "familias": 350,
                "habitantes": 1100,
                "votantes": 740,
                "centroVotacion": "E.B. Taguaya",
                "cobertura": 97,
                "munId": "piar",
                "munNombre": "Piar",
                "parishId": "taguaya",
                "parishNombre": "Taguaya",
                "subParroquiaId": "sub-pia-tag-01",
                "subParroquiaNombre": "Eje 1 • Taguaya Centro",
                "centro": [
                  9.905,
                  -63.35
                ],
                "vertices": [
                  [
                    9.9075,
                    -63.3535
                  ],
                  [
                    9.9078,
                    -63.3468
                  ],
                  [
                    9.9026,
                    -63.3464
                  ],
                  [
                    9.9024,
                    -63.3531
                  ],
                  [
                    9.9075,
                    -63.3535
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "caripe",
    "nombre": "Caripe",
    "capital": "Caripe",
    "parroquias": [
      {
        "id": "caripe-cabecera",
        "nombre": "Caripe",
        "tipo": "Cabecera y Turística",
        "centro": [
          9.7469,
          -63.1812
        ],
        "subparroquias": [
          {
            "id": "sub-car-cen-01",
            "parroquiaId": "caripe-cabecera",
            "nombre": "Eje 1 • Caripe Casco Central y El Mirador",
            "codigo": "EJE-CAR-01",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.7509,
                -63.1922
              ],
              [
                9.7519,
                -63.1762
              ],
              [
                9.7389,
                -63.1772
              ],
              [
                9.7379,
                -63.1912
              ],
              [
                9.7509,
                -63.1922
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-CAR-001",
                "nombre": "Caripe Casco Urbano",
                "casas": 560,
                "familias": 670,
                "habitantes": 2130,
                "votantes": 1420,
                "centroVotacion": "Liceo Nacional Caripe",
                "cobertura": 100,
                "munId": "caripe",
                "munNombre": "Caripe",
                "parishId": "caripe-cabecera",
                "parishNombre": "Caripe",
                "subParroquiaId": "sub-car-cen-01",
                "subParroquiaNombre": "Eje 1 • Caripe Casco Central y El Mirador",
                "centro": [
                  9.7469,
                  -63.1762
                ],
                "vertices": [
                  [
                    9.7494,
                    -63.1797
                  ],
                  [
                    9.7497,
                    -63.173
                  ],
                  [
                    9.7445,
                    -63.1726
                  ],
                  [
                    9.7443,
                    -63.1793
                  ],
                  [
                    9.7494,
                    -63.1797
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-CAR-002",
                "nombre": "El Mirador y Las Margaritas",
                "casas": 410,
                "familias": 490,
                "habitantes": 1560,
                "votantes": 1040,
                "centroVotacion": "E.B. El Mirador",
                "cobertura": 99,
                "munId": "caripe",
                "munNombre": "Caripe",
                "parishId": "caripe-cabecera",
                "parishNombre": "Caripe",
                "subParroquiaId": "sub-car-cen-01",
                "subParroquiaNombre": "Eje 1 • Caripe Casco Central y El Mirador",
                "centro": [
                  9.752096,
                  -63.1777
                ],
                "vertices": [
                  [
                    9.754596,
                    -63.1812
                  ],
                  [
                    9.754896,
                    -63.1745
                  ],
                  [
                    9.749696,
                    -63.1741
                  ],
                  [
                    9.749496,
                    -63.1808
                  ],
                  [
                    9.754596,
                    -63.1812
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-CAR-003",
                "nombre": "Bajo Hondo de Caripe",
                "casas": 370,
                "familias": 440,
                "habitantes": 1410,
                "votantes": 940,
                "centroVotacion": "U.E. Abraham Lincoln",
                "cobertura": 97,
                "munId": "caripe",
                "munNombre": "Caripe",
                "parishId": "caripe-cabecera",
                "parishNombre": "Caripe",
                "subParroquiaId": "sub-car-cen-01",
                "subParroquiaNombre": "Eje 1 • Caripe Casco Central y El Mirador",
                "centro": [
                  9.753828,
                  -63.1857
                ],
                "vertices": [
                  [
                    9.756328,
                    -63.1892
                  ],
                  [
                    9.756628,
                    -63.1825
                  ],
                  [
                    9.751428,
                    -63.1821
                  ],
                  [
                    9.751228,
                    -63.1888
                  ],
                  [
                    9.756328,
                    -63.1892
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "el-guacharo",
        "nombre": "El Guácharo",
        "tipo": "Parque Nacional y Ecoturismo",
        "centro": [
          10.198,
          -63.555
        ],
        "subparroquias": [
          {
            "id": "sub-car-gua-01",
            "parroquiaId": "el-guacharo",
            "nombre": "Eje 1 • Cueva del Guácharo y Caseríos",
            "codigo": "EJE-CAR-02",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                10.202,
                -63.566
              ],
              [
                10.203,
                -63.55
              ],
              [
                10.19,
                -63.551
              ],
              [
                10.189,
                -63.565
              ],
              [
                10.202,
                -63.566
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-CAR-004",
                "nombre": "El Guácharo Pueblo",
                "casas": 380,
                "familias": 460,
                "habitantes": 1440,
                "votantes": 960,
                "centroVotacion": "E.B. El Guácharo",
                "cobertura": 100,
                "munId": "caripe",
                "munNombre": "Caripe",
                "parishId": "el-guacharo",
                "parishNombre": "El Guácharo",
                "subParroquiaId": "sub-car-gua-01",
                "subParroquiaNombre": "Eje 1 • Cueva del Guácharo y Caseríos",
                "centro": [
                  10.198,
                  -63.55
                ],
                "vertices": [
                  [
                    10.2005,
                    -63.5535
                  ],
                  [
                    10.2008,
                    -63.5468
                  ],
                  [
                    10.1956,
                    -63.5464
                  ],
                  [
                    10.1954,
                    -63.5531
                  ],
                  [
                    10.2005,
                    -63.5535
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-CAR-005",
                "nombre": "Caserío La Cueva",
                "casas": 260,
                "familias": 310,
                "habitantes": 990,
                "votantes": 660,
                "centroVotacion": "U.E. Humboldt",
                "cobertura": 98,
                "munId": "caripe",
                "munNombre": "Caripe",
                "parishId": "el-guacharo",
                "parishNombre": "El Guácharo",
                "subParroquiaId": "sub-car-gua-01",
                "subParroquiaNombre": "Eje 1 • Cueva del Guácharo y Caseríos",
                "centro": [
                  10.203196,
                  -63.5515
                ],
                "vertices": [
                  [
                    10.205696,
                    -63.555
                  ],
                  [
                    10.205996,
                    -63.5483
                  ],
                  [
                    10.200796,
                    -63.5479
                  ],
                  [
                    10.200596,
                    -63.5546
                  ],
                  [
                    10.205696,
                    -63.555
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "teresen",
        "nombre": "Teresén",
        "tipo": "Cafetalera",
        "centro": [
          10.145,
          -63.465
        ],
        "subparroquias": [
          {
            "id": "sub-car-ter-01",
            "parroquiaId": "teresen",
            "nombre": "Eje 1 • Teresén y Valle de Teresén",
            "codigo": "EJE-CAR-03",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                10.149,
                -63.476
              ],
              [
                10.15,
                -63.46
              ],
              [
                10.137,
                -63.461
              ],
              [
                10.136,
                -63.475
              ],
              [
                10.149,
                -63.476
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-CAR-006",
                "nombre": "Teresén Casco",
                "casas": 420,
                "familias": 500,
                "habitantes": 1600,
                "votantes": 1070,
                "centroVotacion": "E.B. Teresén",
                "cobertura": 98,
                "munId": "caripe",
                "munNombre": "Caripe",
                "parishId": "teresen",
                "parishNombre": "Teresén",
                "subParroquiaId": "sub-car-ter-01",
                "subParroquiaNombre": "Eje 1 • Teresén y Valle de Teresén",
                "centro": [
                  10.145,
                  -63.46
                ],
                "vertices": [
                  [
                    10.1475,
                    -63.4635
                  ],
                  [
                    10.1478,
                    -63.4568
                  ],
                  [
                    10.1426,
                    -63.4564
                  ],
                  [
                    10.1424,
                    -63.4631
                  ],
                  [
                    10.1475,
                    -63.4635
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-CAR-007",
                "nombre": "La Cuchilla de Teresén",
                "casas": 290,
                "familias": 350,
                "habitantes": 1100,
                "votantes": 740,
                "centroVotacion": "U.E. La Cuchilla",
                "cobertura": 96,
                "munId": "caripe",
                "munNombre": "Caripe",
                "parishId": "teresen",
                "parishNombre": "Teresén",
                "subParroquiaId": "sub-car-ter-01",
                "subParroquiaNombre": "Eje 1 • Teresén y Valle de Teresén",
                "centro": [
                  10.150196,
                  -63.4615
                ],
                "vertices": [
                  [
                    10.152696,
                    -63.465
                  ],
                  [
                    10.152996,
                    -63.4583
                  ],
                  [
                    10.147796,
                    -63.4579
                  ],
                  [
                    10.147596,
                    -63.4646
                  ],
                  [
                    10.152696,
                    -63.465
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "san-agustin",
        "nombre": "San Agustín",
        "tipo": "Hortalizas y Flores",
        "centro": [
          10.165,
          -63.545
        ],
        "subparroquias": [
          {
            "id": "sub-car-agu-01",
            "parroquiaId": "san-agustin",
            "nombre": "Eje 1 • San Agustín de las Hiedras",
            "codigo": "EJE-CAR-04",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                10.169,
                -63.556
              ],
              [
                10.17,
                -63.54
              ],
              [
                10.157,
                -63.541
              ],
              [
                10.156,
                -63.555
              ],
              [
                10.169,
                -63.556
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-CAR-008",
                "nombre": "San Agustín Pueblo",
                "casas": 390,
                "familias": 470,
                "habitantes": 1480,
                "votantes": 990,
                "centroVotacion": "E.B. San Agustín",
                "cobertura": 99,
                "munId": "caripe",
                "munNombre": "Caripe",
                "parishId": "san-agustin",
                "parishNombre": "San Agustín",
                "subParroquiaId": "sub-car-agu-01",
                "subParroquiaNombre": "Eje 1 • San Agustín de las Hiedras",
                "centro": [
                  10.165,
                  -63.54
                ],
                "vertices": [
                  [
                    10.1675,
                    -63.5435
                  ],
                  [
                    10.1678,
                    -63.5368
                  ],
                  [
                    10.1626,
                    -63.5364
                  ],
                  [
                    10.1624,
                    -63.5431
                  ],
                  [
                    10.1675,
                    -63.5435
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "la-guanota",
        "nombre": "La Guanota",
        "tipo": "Agrícola de Montaña",
        "centro": [
          10.215,
          -63.505
        ],
        "subparroquias": [
          {
            "id": "sub-car-gua2-01",
            "parroquiaId": "la-guanota",
            "nombre": "Eje 1 • La Guanota y Vía Santa Inés",
            "codigo": "EJE-CAR-05",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                10.219,
                -63.516
              ],
              [
                10.22,
                -63.5
              ],
              [
                10.207,
                -63.501
              ],
              [
                10.206,
                -63.515
              ],
              [
                10.219,
                -63.516
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-CAR-009",
                "nombre": "La Guanota Casco",
                "casas": 330,
                "familias": 400,
                "habitantes": 1250,
                "votantes": 840,
                "centroVotacion": "E.B. La Guanota",
                "cobertura": 97,
                "munId": "caripe",
                "munNombre": "Caripe",
                "parishId": "la-guanota",
                "parishNombre": "La Guanota",
                "subParroquiaId": "sub-car-gua2-01",
                "subParroquiaNombre": "Eje 1 • La Guanota y Vía Santa Inés",
                "centro": [
                  10.215,
                  -63.5
                ],
                "vertices": [
                  [
                    10.2175,
                    -63.5035
                  ],
                  [
                    10.2178,
                    -63.4968
                  ],
                  [
                    10.2126,
                    -63.4964
                  ],
                  [
                    10.2124,
                    -63.5031
                  ],
                  [
                    10.2175,
                    -63.5035
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "sabana-de-piedra",
        "nombre": "Sabana de Piedra",
        "tipo": "Café y Cacao",
        "centro": [
          10.235,
          -63.445
        ],
        "subparroquias": [
          {
            "id": "sub-car-pie-01",
            "parroquiaId": "sabana-de-piedra",
            "nombre": "Eje 1 • Sabana de Piedra Pueblo",
            "codigo": "EJE-CAR-06",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                10.239,
                -63.456
              ],
              [
                10.24,
                -63.44
              ],
              [
                10.227,
                -63.441
              ],
              [
                10.226,
                -63.455
              ],
              [
                10.239,
                -63.456
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-CAR-010",
                "nombre": "Sabana de Piedra Centro",
                "casas": 310,
                "familias": 370,
                "habitantes": 1180,
                "votantes": 790,
                "centroVotacion": "E.B. Sabana de Piedra",
                "cobertura": 96,
                "munId": "caripe",
                "munNombre": "Caripe",
                "parishId": "sabana-de-piedra",
                "parishNombre": "Sabana de Piedra",
                "subParroquiaId": "sub-car-pie-01",
                "subParroquiaNombre": "Eje 1 • Sabana de Piedra Pueblo",
                "centro": [
                  10.235,
                  -63.44
                ],
                "vertices": [
                  [
                    10.2375,
                    -63.4435
                  ],
                  [
                    10.2378,
                    -63.4368
                  ],
                  [
                    10.2326,
                    -63.4364
                  ],
                  [
                    10.2324,
                    -63.4431
                  ],
                  [
                    10.2375,
                    -63.4435
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "cedeno",
    "nombre": "Cedeño",
    "capital": "Caicara",
    "parroquias": [
      {
        "id": "caicara",
        "nombre": "Caicara",
        "tipo": "Cabecera",
        "centro": [
          9.7469,
          -63.1812
        ],
        "subparroquias": [
          {
            "id": "sub-ced-cai-01",
            "parroquiaId": "caicara",
            "nombre": "Eje 1 • Caicara Casco Histórico y El Mono",
            "codigo": "EJE-CED-01",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.7509,
                -63.1922
              ],
              [
                9.7519,
                -63.1762
              ],
              [
                9.7389,
                -63.1772
              ],
              [
                9.7379,
                -63.1912
              ],
              [
                9.7509,
                -63.1922
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-CED-001",
                "nombre": "Caicara Centro Plaza Bolívar",
                "casas": 610,
                "familias": 730,
                "habitantes": 2320,
                "votantes": 1550,
                "centroVotacion": "Liceo Nacional Caicara",
                "cobertura": 100,
                "munId": "cedeno",
                "munNombre": "Cedeño",
                "parishId": "caicara",
                "parishNombre": "Caicara",
                "subParroquiaId": "sub-ced-cai-01",
                "subParroquiaNombre": "Eje 1 • Caicara Casco Histórico y El Mono",
                "centro": [
                  9.7469,
                  -63.1762
                ],
                "vertices": [
                  [
                    9.7494,
                    -63.1797
                  ],
                  [
                    9.7497,
                    -63.173
                  ],
                  [
                    9.7445,
                    -63.1726
                  ],
                  [
                    9.7443,
                    -63.1793
                  ],
                  [
                    9.7494,
                    -63.1797
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-CED-002",
                "nombre": "Monódromo de Caicara",
                "casas": 490,
                "familias": 590,
                "habitantes": 1860,
                "votantes": 1250,
                "centroVotacion": "E.B. San Juan Bautista",
                "cobertura": 99,
                "munId": "cedeno",
                "munNombre": "Cedeño",
                "parishId": "caicara",
                "parishNombre": "Caicara",
                "subParroquiaId": "sub-ced-cai-01",
                "subParroquiaNombre": "Eje 1 • Caicara Casco Histórico y El Mono",
                "centro": [
                  9.752096,
                  -63.1777
                ],
                "vertices": [
                  [
                    9.754596,
                    -63.1812
                  ],
                  [
                    9.754896,
                    -63.1745
                  ],
                  [
                    9.749696,
                    -63.1741
                  ],
                  [
                    9.749496,
                    -63.1808
                  ],
                  [
                    9.754596,
                    -63.1812
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-CED-003",
                "nombre": "La Manga de Coleo",
                "casas": 430,
                "familias": 520,
                "habitantes": 1630,
                "votantes": 1090,
                "centroVotacion": "U.E. Padre Juan",
                "cobertura": 98,
                "munId": "cedeno",
                "munNombre": "Cedeño",
                "parishId": "caicara",
                "parishNombre": "Caicara",
                "subParroquiaId": "sub-ced-cai-01",
                "subParroquiaNombre": "Eje 1 • Caicara Casco Histórico y El Mono",
                "centro": [
                  9.753828,
                  -63.1857
                ],
                "vertices": [
                  [
                    9.756328,
                    -63.1892
                  ],
                  [
                    9.756628,
                    -63.1825
                  ],
                  [
                    9.751428,
                    -63.1821
                  ],
                  [
                    9.751228,
                    -63.1888
                  ],
                  [
                    9.756328,
                    -63.1892
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "areo",
        "nombre": "Areo",
        "tipo": "Rural y Sabana",
        "centro": [
          9.782,
          -63.745
        ],
        "subparroquias": [
          {
            "id": "sub-ced-are-01",
            "parroquiaId": "areo",
            "nombre": "Eje 1 • Areo Centro",
            "codigo": "EJE-CED-02",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.786,
                -63.756
              ],
              [
                9.787,
                -63.74
              ],
              [
                9.774,
                -63.741
              ],
              [
                9.773,
                -63.755
              ],
              [
                9.786,
                -63.756
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-CED-004",
                "nombre": "Areo Casco",
                "casas": 380,
                "familias": 460,
                "habitantes": 1440,
                "votantes": 960,
                "centroVotacion": "E.B. Areo",
                "cobertura": 98,
                "munId": "cedeno",
                "munNombre": "Cedeño",
                "parishId": "areo",
                "parishNombre": "Areo",
                "subParroquiaId": "sub-ced-are-01",
                "subParroquiaNombre": "Eje 1 • Areo Centro",
                "centro": [
                  9.782,
                  -63.74
                ],
                "vertices": [
                  [
                    9.7845,
                    -63.7435
                  ],
                  [
                    9.7848,
                    -63.7368
                  ],
                  [
                    9.7796,
                    -63.7364
                  ],
                  [
                    9.7794,
                    -63.7431
                  ],
                  [
                    9.7845,
                    -63.7435
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "san-felix-cedeno",
        "nombre": "San Félix de Cantauro",
        "tipo": "Rural",
        "centro": [
          9.7469,
          -63.1812
        ],
        "subparroquias": [
          {
            "id": "sub-ced-fel-01",
            "parroquiaId": "san-felix-cedeno",
            "nombre": "Eje 1 • San Félix de Cantauro",
            "codigo": "EJE-CED-03",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.7509,
                -63.1922
              ],
              [
                9.7519,
                -63.1762
              ],
              [
                9.7389,
                -63.1772
              ],
              [
                9.7379,
                -63.1912
              ],
              [
                9.7509,
                -63.1922
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-CED-005",
                "nombre": "San Félix Casco",
                "casas": 320,
                "familias": 380,
                "habitantes": 1220,
                "votantes": 810,
                "centroVotacion": "U.E. San Félix",
                "cobertura": 97,
                "munId": "cedeno",
                "munNombre": "Cedeño",
                "parishId": "san-felix-cedeno",
                "parishNombre": "San Félix de Cantauro",
                "subParroquiaId": "sub-ced-fel-01",
                "subParroquiaNombre": "Eje 1 • San Félix de Cantauro",
                "centro": [
                  9.7469,
                  -63.1762
                ],
                "vertices": [
                  [
                    9.7494,
                    -63.1797
                  ],
                  [
                    9.7497,
                    -63.173
                  ],
                  [
                    9.7445,
                    -63.1726
                  ],
                  [
                    9.7443,
                    -63.1793
                  ],
                  [
                    9.7494,
                    -63.1797
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "viento-fresco",
        "nombre": "Viento Fresco",
        "tipo": "Agropecuaria",
        "centro": [
          9.712,
          -63.685
        ],
        "subparroquias": [
          {
            "id": "sub-ced-vie-01",
            "parroquiaId": "viento-fresco",
            "nombre": "Eje 1 • Viento Fresco y Caseríos",
            "codigo": "EJE-CED-04",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.716,
                -63.696
              ],
              [
                9.717,
                -63.68
              ],
              [
                9.704,
                -63.681
              ],
              [
                9.703,
                -63.695
              ],
              [
                9.716,
                -63.696
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-CED-006",
                "nombre": "Viento Fresco Pueblo",
                "casas": 450,
                "familias": 540,
                "habitantes": 1710,
                "votantes": 1140,
                "centroVotacion": "E.B. Viento Fresco",
                "cobertura": 99,
                "munId": "cedeno",
                "munNombre": "Cedeño",
                "parishId": "viento-fresco",
                "parishNombre": "Viento Fresco",
                "subParroquiaId": "sub-ced-vie-01",
                "subParroquiaNombre": "Eje 1 • Viento Fresco y Caseríos",
                "centro": [
                  9.712,
                  -63.68
                ],
                "vertices": [
                  [
                    9.7145,
                    -63.6835
                  ],
                  [
                    9.7148,
                    -63.6768
                  ],
                  [
                    9.7096,
                    -63.6764
                  ],
                  [
                    9.7094,
                    -63.6831
                  ],
                  [
                    9.7145,
                    -63.6835
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "libertador",
    "nombre": "Libertador",
    "capital": "Temblador",
    "parroquias": [
      {
        "id": "temblador",
        "nombre": "Temblador",
        "tipo": "Cabecera y Petrolera",
        "centro": [
          9.7469,
          -63.1812
        ],
        "subparroquias": [
          {
            "id": "sub-lib-tem-01",
            "parroquiaId": "temblador",
            "nombre": "Eje 1 • Temblador Centro y Las Brisas",
            "codigo": "EJE-LIB-01",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.7509,
                -63.1922
              ],
              [
                9.7519,
                -63.1762
              ],
              [
                9.7389,
                -63.1772
              ],
              [
                9.7379,
                -63.1912
              ],
              [
                9.7509,
                -63.1922
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-LIB-001",
                "nombre": "Temblador Casco Urbano",
                "casas": 630,
                "familias": 760,
                "habitantes": 2390,
                "votantes": 1600,
                "centroVotacion": "Liceo Nacional Temblador",
                "cobertura": 100,
                "munId": "libertador",
                "munNombre": "Libertador",
                "parishId": "temblador",
                "parishNombre": "Temblador",
                "subParroquiaId": "sub-lib-tem-01",
                "subParroquiaNombre": "Eje 1 • Temblador Centro y Las Brisas",
                "centro": [
                  9.7469,
                  -63.1762
                ],
                "vertices": [
                  [
                    9.7494,
                    -63.1797
                  ],
                  [
                    9.7497,
                    -63.173
                  ],
                  [
                    9.7445,
                    -63.1726
                  ],
                  [
                    9.7443,
                    -63.1793
                  ],
                  [
                    9.7494,
                    -63.1797
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-LIB-002",
                "nombre": "Las Brisas de Temblador",
                "casas": 520,
                "familias": 620,
                "habitantes": 1980,
                "votantes": 1320,
                "centroVotacion": "E.B. Las Brisas",
                "cobertura": 98,
                "munId": "libertador",
                "munNombre": "Libertador",
                "parishId": "temblador",
                "parishNombre": "Temblador",
                "subParroquiaId": "sub-lib-tem-01",
                "subParroquiaNombre": "Eje 1 • Temblador Centro y Las Brisas",
                "centro": [
                  9.752096,
                  -63.1777
                ],
                "vertices": [
                  [
                    9.754596,
                    -63.1812
                  ],
                  [
                    9.754896,
                    -63.1745
                  ],
                  [
                    9.749696,
                    -63.1741
                  ],
                  [
                    9.749496,
                    -63.1808
                  ],
                  [
                    9.754596,
                    -63.1812
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-LIB-003",
                "nombre": "Guanipa Residencial",
                "casas": 440,
                "familias": 530,
                "habitantes": 1670,
                "votantes": 1120,
                "centroVotacion": "U.E. Guanipa",
                "cobertura": 99,
                "munId": "libertador",
                "munNombre": "Libertador",
                "parishId": "temblador",
                "parishNombre": "Temblador",
                "subParroquiaId": "sub-lib-tem-01",
                "subParroquiaNombre": "Eje 1 • Temblador Centro y Las Brisas",
                "centro": [
                  9.753828,
                  -63.1857
                ],
                "vertices": [
                  [
                    9.756328,
                    -63.1892
                  ],
                  [
                    9.756628,
                    -63.1825
                  ],
                  [
                    9.751428,
                    -63.1821
                  ],
                  [
                    9.751228,
                    -63.1888
                  ],
                  [
                    9.756328,
                    -63.1892
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "tabasca",
        "nombre": "Tabasca",
        "tipo": "Indígena y Rural",
        "centro": [
          9.155,
          -62.615
        ],
        "subparroquias": [
          {
            "id": "sub-lib-tab-01",
            "parroquiaId": "tabasca",
            "nombre": "Eje 1 • Tabasca Comunidades",
            "codigo": "EJE-LIB-02",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.159,
                -62.626
              ],
              [
                9.16,
                -62.61
              ],
              [
                9.147,
                -62.611
              ],
              [
                9.146,
                -62.625
              ],
              [
                9.159,
                -62.626
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-LIB-004",
                "nombre": "Tabasca Centro",
                "casas": 360,
                "familias": 430,
                "habitantes": 1370,
                "votantes": 910,
                "centroVotacion": "E.B. Tabasca",
                "cobertura": 98,
                "munId": "libertador",
                "munNombre": "Libertador",
                "parishId": "tabasca",
                "parishNombre": "Tabasca",
                "subParroquiaId": "sub-lib-tab-01",
                "subParroquiaNombre": "Eje 1 • Tabasca Comunidades",
                "centro": [
                  9.155,
                  -62.61
                ],
                "vertices": [
                  [
                    9.1575,
                    -62.6135
                  ],
                  [
                    9.1578,
                    -62.6068
                  ],
                  [
                    9.1526,
                    -62.6064
                  ],
                  [
                    9.1524,
                    -62.6131
                  ],
                  [
                    9.1575,
                    -62.6135
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "las-albarradas",
        "nombre": "Las Albarradas",
        "tipo": "Rural y Sabanas",
        "centro": [
          9.7469,
          -63.1812
        ],
        "subparroquias": [
          {
            "id": "sub-lib-alb-01",
            "parroquiaId": "las-albarradas",
            "nombre": "Eje 1 • Las Albarradas Caserío",
            "codigo": "EJE-LIB-03",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.7509,
                -63.1922
              ],
              [
                9.7519,
                -63.1762
              ],
              [
                9.7389,
                -63.1772
              ],
              [
                9.7379,
                -63.1912
              ],
              [
                9.7509,
                -63.1922
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-LIB-005",
                "nombre": "Las Albarradas Pueblo",
                "casas": 310,
                "familias": 370,
                "habitantes": 1180,
                "votantes": 790,
                "centroVotacion": "U.E. Las Albarradas",
                "cobertura": 96,
                "munId": "libertador",
                "munNombre": "Libertador",
                "parishId": "las-albarradas",
                "parishNombre": "Las Albarradas",
                "subParroquiaId": "sub-lib-alb-01",
                "subParroquiaNombre": "Eje 1 • Las Albarradas Caserío",
                "centro": [
                  9.7469,
                  -63.1762
                ],
                "vertices": [
                  [
                    9.7494,
                    -63.1797
                  ],
                  [
                    9.7497,
                    -63.173
                  ],
                  [
                    9.7445,
                    -63.1726
                  ],
                  [
                    9.7443,
                    -63.1793
                  ],
                  [
                    9.7494,
                    -63.1797
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "chaguaramas",
        "nombre": "Chaguaramas",
        "tipo": "Petrolera",
        "centro": [
          9.095,
          -62.675
        ],
        "subparroquias": [
          {
            "id": "sub-lib-cha-01",
            "parroquiaId": "chaguaramas",
            "nombre": "Eje 1 • Chaguaramas y Morichal Petrolero",
            "codigo": "EJE-LIB-04",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.099,
                -62.686
              ],
              [
                9.1,
                -62.67
              ],
              [
                9.087,
                -62.671
              ],
              [
                9.086,
                -62.685
              ],
              [
                9.099,
                -62.686
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-LIB-006",
                "nombre": "Chaguaramas Casco",
                "casas": 410,
                "familias": 490,
                "habitantes": 1560,
                "votantes": 1040,
                "centroVotacion": "E.B. Chaguaramas Sur",
                "cobertura": 99,
                "munId": "libertador",
                "munNombre": "Libertador",
                "parishId": "chaguaramas",
                "parishNombre": "Chaguaramas",
                "subParroquiaId": "sub-lib-cha-01",
                "subParroquiaNombre": "Eje 1 • Chaguaramas y Morichal Petrolero",
                "centro": [
                  9.095,
                  -62.67
                ],
                "vertices": [
                  [
                    9.0975,
                    -62.6735
                  ],
                  [
                    9.0978,
                    -62.6668
                  ],
                  [
                    9.0926,
                    -62.6664
                  ],
                  [
                    9.0924,
                    -62.6731
                  ],
                  [
                    9.0975,
                    -62.6735
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "punceres",
    "nombre": "Punceres",
    "capital": "Quiriquire",
    "parroquias": [
      {
        "id": "quiriquire",
        "nombre": "Quiriquire",
        "tipo": "Cabecera",
        "centro": [
          9.7469,
          -63.1812
        ],
        "subparroquias": [
          {
            "id": "sub-pun-qui-01",
            "parroquiaId": "quiriquire",
            "nombre": "Eje 1 • Quiriquire Centro y Campo Rojo",
            "codigo": "EJE-PUN-01",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.7509,
                -63.1922
              ],
              [
                9.7519,
                -63.1762
              ],
              [
                9.7389,
                -63.1772
              ],
              [
                9.7379,
                -63.1912
              ],
              [
                9.7509,
                -63.1922
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-PUN-001",
                "nombre": "Quiriquire Casco Central",
                "casas": 570,
                "familias": 680,
                "habitantes": 2170,
                "votantes": 1450,
                "centroVotacion": "Liceo Nacional Quiriquire",
                "cobertura": 100,
                "munId": "punceres",
                "munNombre": "Punceres",
                "parishId": "quiriquire",
                "parishNombre": "Quiriquire",
                "subParroquiaId": "sub-pun-qui-01",
                "subParroquiaNombre": "Eje 1 • Quiriquire Centro y Campo Rojo",
                "centro": [
                  9.7469,
                  -63.1762
                ],
                "vertices": [
                  [
                    9.7494,
                    -63.1797
                  ],
                  [
                    9.7497,
                    -63.173
                  ],
                  [
                    9.7445,
                    -63.1726
                  ],
                  [
                    9.7443,
                    -63.1793
                  ],
                  [
                    9.7494,
                    -63.1797
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-PUN-002",
                "nombre": "Campo Rojo Petrolero",
                "casas": 490,
                "familias": 590,
                "habitantes": 1860,
                "votantes": 1250,
                "centroVotacion": "E.B. Campo Rojo",
                "cobertura": 98,
                "munId": "punceres",
                "munNombre": "Punceres",
                "parishId": "quiriquire",
                "parishNombre": "Quiriquire",
                "subParroquiaId": "sub-pun-qui-01",
                "subParroquiaNombre": "Eje 1 • Quiriquire Centro y Campo Rojo",
                "centro": [
                  9.752096,
                  -63.1777
                ],
                "vertices": [
                  [
                    9.754596,
                    -63.1812
                  ],
                  [
                    9.754896,
                    -63.1745
                  ],
                  [
                    9.749696,
                    -63.1741
                  ],
                  [
                    9.749496,
                    -63.1808
                  ],
                  [
                    9.754596,
                    -63.1812
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-PUN-003",
                "nombre": "Miraflores de Punceres",
                "casas": 420,
                "familias": 500,
                "habitantes": 1600,
                "votantes": 1070,
                "centroVotacion": "U.E. Miraflores",
                "cobertura": 97,
                "munId": "punceres",
                "munNombre": "Punceres",
                "parishId": "quiriquire",
                "parishNombre": "Quiriquire",
                "subParroquiaId": "sub-pun-qui-01",
                "subParroquiaNombre": "Eje 1 • Quiriquire Centro y Campo Rojo",
                "centro": [
                  9.753828,
                  -63.1857
                ],
                "vertices": [
                  [
                    9.756328,
                    -63.1892
                  ],
                  [
                    9.756628,
                    -63.1825
                  ],
                  [
                    9.751428,
                    -63.1821
                  ],
                  [
                    9.751228,
                    -63.1888
                  ],
                  [
                    9.756328,
                    -63.1892
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "cachipo",
        "nombre": "Cachipo",
        "tipo": "Agro-Rural",
        "centro": [
          9.915,
          -63.235
        ],
        "subparroquias": [
          {
            "id": "sub-pun-cac-01",
            "parroquiaId": "cachipo",
            "nombre": "Eje 1 • Cachipo Pueblo",
            "codigo": "EJE-PUN-02",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.919,
                -63.246
              ],
              [
                9.92,
                -63.23
              ],
              [
                9.907,
                -63.231
              ],
              [
                9.906,
                -63.245
              ],
              [
                9.919,
                -63.246
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-PUN-004",
                "nombre": "Cachipo Centro",
                "casas": 390,
                "familias": 470,
                "habitantes": 1480,
                "votantes": 990,
                "centroVotacion": "E.B. Cachipo",
                "cobertura": 99,
                "munId": "punceres",
                "munNombre": "Punceres",
                "parishId": "cachipo",
                "parishNombre": "Cachipo",
                "subParroquiaId": "sub-pun-cac-01",
                "subParroquiaNombre": "Eje 1 • Cachipo Pueblo",
                "centro": [
                  9.915,
                  -63.23
                ],
                "vertices": [
                  [
                    9.9175,
                    -63.2335
                  ],
                  [
                    9.9178,
                    -63.2268
                  ],
                  [
                    9.9126,
                    -63.2264
                  ],
                  [
                    9.9124,
                    -63.2331
                  ],
                  [
                    9.9175,
                    -63.2335
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "sotillo",
    "nombre": "Sotillo",
    "capital": "Barrancas del Orinoco",
    "parroquias": [
      {
        "id": "barrancas",
        "nombre": "Barrancas del Orinoco",
        "tipo": "Cabecera Fluvial",
        "centro": [
          9.7469,
          -63.1812
        ],
        "subparroquias": [
          {
            "id": "sub-sot-bar-01",
            "parroquiaId": "barrancas",
            "nombre": "Eje 1 • Barrancas Malecón y Centro",
            "codigo": "EJE-SOT-01",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.7509,
                -63.1922
              ],
              [
                9.7519,
                -63.1762
              ],
              [
                9.7389,
                -63.1772
              ],
              [
                9.7379,
                -63.1912
              ],
              [
                9.7509,
                -63.1922
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-SOT-001",
                "nombre": "Malecón del Río Orinoco",
                "casas": 610,
                "familias": 730,
                "habitantes": 2320,
                "votantes": 1550,
                "centroVotacion": "Liceo Nacional Barrancas",
                "cobertura": 100,
                "munId": "sotillo",
                "munNombre": "Sotillo",
                "parishId": "barrancas",
                "parishNombre": "Barrancas del Orinoco",
                "subParroquiaId": "sub-sot-bar-01",
                "subParroquiaNombre": "Eje 1 • Barrancas Malecón y Centro",
                "centro": [
                  9.7469,
                  -63.1762
                ],
                "vertices": [
                  [
                    9.7494,
                    -63.1797
                  ],
                  [
                    9.7497,
                    -63.173
                  ],
                  [
                    9.7445,
                    -63.1726
                  ],
                  [
                    9.7443,
                    -63.1793
                  ],
                  [
                    9.7494,
                    -63.1797
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-SOT-002",
                "nombre": "Casco Histórico San Rafael",
                "casas": 540,
                "familias": 650,
                "habitantes": 2050,
                "votantes": 1370,
                "centroVotacion": "E.B. Cacique Uyapari",
                "cobertura": 99,
                "munId": "sotillo",
                "munNombre": "Sotillo",
                "parishId": "barrancas",
                "parishNombre": "Barrancas del Orinoco",
                "subParroquiaId": "sub-sot-bar-01",
                "subParroquiaNombre": "Eje 1 • Barrancas Malecón y Centro",
                "centro": [
                  9.752096,
                  -63.1777
                ],
                "vertices": [
                  [
                    9.754596,
                    -63.1812
                  ],
                  [
                    9.754896,
                    -63.1745
                  ],
                  [
                    9.749696,
                    -63.1741
                  ],
                  [
                    9.749496,
                    -63.1808
                  ],
                  [
                    9.754596,
                    -63.1812
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-SOT-003",
                "nombre": "La Playita de Barrancas",
                "casas": 430,
                "familias": 520,
                "habitantes": 1630,
                "votantes": 1090,
                "centroVotacion": "U.E. La Playita",
                "cobertura": 97,
                "munId": "sotillo",
                "munNombre": "Sotillo",
                "parishId": "barrancas",
                "parishNombre": "Barrancas del Orinoco",
                "subParroquiaId": "sub-sot-bar-01",
                "subParroquiaNombre": "Eje 1 • Barrancas Malecón y Centro",
                "centro": [
                  9.753828,
                  -63.1857
                ],
                "vertices": [
                  [
                    9.756328,
                    -63.1892
                  ],
                  [
                    9.756628,
                    -63.1825
                  ],
                  [
                    9.751428,
                    -63.1821
                  ],
                  [
                    9.751228,
                    -63.1888
                  ],
                  [
                    9.756328,
                    -63.1892
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "los-barrancos-fajardo",
        "nombre": "Los Barrancos de Fajardo",
        "tipo": "Ribereña",
        "centro": [
          9.7469,
          -63.1812
        ],
        "subparroquias": [
          {
            "id": "sub-sot-faj-01",
            "parroquiaId": "los-barrancos-fajardo",
            "nombre": "Eje 1 • Los Barrancos y San Carlos",
            "codigo": "EJE-SOT-02",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.7509,
                -63.1922
              ],
              [
                9.7519,
                -63.1762
              ],
              [
                9.7389,
                -63.1772
              ],
              [
                9.7379,
                -63.1912
              ],
              [
                9.7509,
                -63.1922
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-SOT-004",
                "nombre": "Los Barrancos Centro",
                "casas": 480,
                "familias": 580,
                "habitantes": 1820,
                "votantes": 1220,
                "centroVotacion": "E.B. Los Barrancos",
                "cobertura": 99,
                "munId": "sotillo",
                "munNombre": "Sotillo",
                "parishId": "los-barrancos-fajardo",
                "parishNombre": "Los Barrancos de Fajardo",
                "subParroquiaId": "sub-sot-faj-01",
                "subParroquiaNombre": "Eje 1 • Los Barrancos y San Carlos",
                "centro": [
                  9.7469,
                  -63.1762
                ],
                "vertices": [
                  [
                    9.7494,
                    -63.1797
                  ],
                  [
                    9.7497,
                    -63.173
                  ],
                  [
                    9.7445,
                    -63.1726
                  ],
                  [
                    9.7443,
                    -63.1793
                  ],
                  [
                    9.7494,
                    -63.1797
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-SOT-005",
                "nombre": "San Carlos del Orinoco",
                "casas": 360,
                "familias": 430,
                "habitantes": 1370,
                "votantes": 910,
                "centroVotacion": "U.E. San Carlos",
                "cobertura": 96,
                "munId": "sotillo",
                "munNombre": "Sotillo",
                "parishId": "los-barrancos-fajardo",
                "parishNombre": "Los Barrancos de Fajardo",
                "subParroquiaId": "sub-sot-faj-01",
                "subParroquiaNombre": "Eje 1 • Los Barrancos y San Carlos",
                "centro": [
                  9.752096,
                  -63.1777
                ],
                "vertices": [
                  [
                    9.754596,
                    -63.1812
                  ],
                  [
                    9.754896,
                    -63.1745
                  ],
                  [
                    9.749696,
                    -63.1741
                  ],
                  [
                    9.749496,
                    -63.1808
                  ],
                  [
                    9.754596,
                    -63.1812
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "acosta",
    "nombre": "Acosta",
    "capital": "San Antonio de Capayacuar",
    "parroquias": [
      {
        "id": "san-antonio-acosta",
        "nombre": "San Antonio de Capayacuar",
        "tipo": "Cabecera",
        "centro": [
          9.7469,
          -63.1812
        ],
        "subparroquias": [
          {
            "id": "sub-aco-san-01",
            "parroquiaId": "san-antonio-acosta",
            "nombre": "Eje 1 • San Antonio Casco y El Rincón",
            "codigo": "EJE-ACO-01",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.7509,
                -63.1922
              ],
              [
                9.7519,
                -63.1762
              ],
              [
                9.7389,
                -63.1772
              ],
              [
                9.7379,
                -63.1912
              ],
              [
                9.7509,
                -63.1922
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-ACO-001",
                "nombre": "San Antonio Centro",
                "casas": 540,
                "familias": 650,
                "habitantes": 2050,
                "votantes": 1370,
                "centroVotacion": "Liceo Nacional San Antonio",
                "cobertura": 100,
                "munId": "acosta",
                "munNombre": "Acosta",
                "parishId": "san-antonio-acosta",
                "parishNombre": "San Antonio de Capayacuar",
                "subParroquiaId": "sub-aco-san-01",
                "subParroquiaNombre": "Eje 1 • San Antonio Casco y El Rincón",
                "centro": [
                  9.7469,
                  -63.1762
                ],
                "vertices": [
                  [
                    9.7494,
                    -63.1797
                  ],
                  [
                    9.7497,
                    -63.173
                  ],
                  [
                    9.7445,
                    -63.1726
                  ],
                  [
                    9.7443,
                    -63.1793
                  ],
                  [
                    9.7494,
                    -63.1797
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-ACO-002",
                "nombre": "El Rincón de Acosta",
                "casas": 410,
                "familias": 490,
                "habitantes": 1560,
                "votantes": 1040,
                "centroVotacion": "E.B. El Rincón",
                "cobertura": 98,
                "munId": "acosta",
                "munNombre": "Acosta",
                "parishId": "san-antonio-acosta",
                "parishNombre": "San Antonio de Capayacuar",
                "subParroquiaId": "sub-aco-san-01",
                "subParroquiaNombre": "Eje 1 • San Antonio Casco y El Rincón",
                "centro": [
                  9.752096,
                  -63.1777
                ],
                "vertices": [
                  [
                    9.754596,
                    -63.1812
                  ],
                  [
                    9.754896,
                    -63.1745
                  ],
                  [
                    9.749696,
                    -63.1741
                  ],
                  [
                    9.749496,
                    -63.1808
                  ],
                  [
                    9.754596,
                    -63.1812
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-ACO-003",
                "nombre": "Las Cocuizas de Capayacuar",
                "casas": 370,
                "familias": 440,
                "habitantes": 1410,
                "votantes": 940,
                "centroVotacion": "U.E. Capayacuar",
                "cobertura": 97,
                "munId": "acosta",
                "munNombre": "Acosta",
                "parishId": "san-antonio-acosta",
                "parishNombre": "San Antonio de Capayacuar",
                "subParroquiaId": "sub-aco-san-01",
                "subParroquiaNombre": "Eje 1 • San Antonio Casco y El Rincón",
                "centro": [
                  9.753828,
                  -63.1857
                ],
                "vertices": [
                  [
                    9.756328,
                    -63.1892
                  ],
                  [
                    9.756628,
                    -63.1825
                  ],
                  [
                    9.751428,
                    -63.1821
                  ],
                  [
                    9.751228,
                    -63.1888
                  ],
                  [
                    9.756328,
                    -63.1892
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      },
      {
        "id": "san-francisco-acosta",
        "nombre": "San Francisco",
        "tipo": "Rural y Café",
        "centro": [
          9.7469,
          -63.1812
        ],
        "subparroquias": [
          {
            "id": "sub-aco-fra-01",
            "parroquiaId": "san-francisco-acosta",
            "nombre": "Eje 1 • San Francisco Caserío",
            "codigo": "EJE-ACO-02",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.7509,
                -63.1922
              ],
              [
                9.7519,
                -63.1762
              ],
              [
                9.7389,
                -63.1772
              ],
              [
                9.7379,
                -63.1912
              ],
              [
                9.7509,
                -63.1922
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-ACO-004",
                "nombre": "San Francisco de Acosta",
                "casas": 360,
                "familias": 430,
                "habitantes": 1370,
                "votantes": 910,
                "centroVotacion": "E.B. San Francisco",
                "cobertura": 98,
                "munId": "acosta",
                "munNombre": "Acosta",
                "parishId": "san-francisco-acosta",
                "parishNombre": "San Francisco",
                "subParroquiaId": "sub-aco-fra-01",
                "subParroquiaNombre": "Eje 1 • San Francisco Caserío",
                "centro": [
                  9.7469,
                  -63.1762
                ],
                "vertices": [
                  [
                    9.7494,
                    -63.1797
                  ],
                  [
                    9.7497,
                    -63.173
                  ],
                  [
                    9.7445,
                    -63.1726
                  ],
                  [
                    9.7443,
                    -63.1793
                  ],
                  [
                    9.7494,
                    -63.1797
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "aguasay",
    "nombre": "Aguasay",
    "capital": "Aguasay",
    "parroquias": [
      {
        "id": "aguasay-parroquia",
        "nombre": "Aguasay",
        "tipo": "Única",
        "centro": [
          9.7469,
          -63.1812
        ],
        "subparroquias": [
          {
            "id": "sub-agu-01",
            "parroquiaId": "aguasay-parroquia",
            "nombre": "Eje 1 • Aguasay Centro y La Pulvia",
            "codigo": "EJE-AGU-01",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.7509,
                -63.1922
              ],
              [
                9.7519,
                -63.1762
              ],
              [
                9.7389,
                -63.1772
              ],
              [
                9.7379,
                -63.1912
              ],
              [
                9.7509,
                -63.1922
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-AGU-001",
                "nombre": "Aguasay Casco Histórico (Curagua)",
                "casas": 580,
                "familias": 700,
                "habitantes": 2200,
                "votantes": 1470,
                "centroVotacion": "Liceo Nacional Aguasay",
                "cobertura": 100,
                "munId": "aguasay",
                "munNombre": "Aguasay",
                "parishId": "aguasay-parroquia",
                "parishNombre": "Aguasay",
                "subParroquiaId": "sub-agu-01",
                "subParroquiaNombre": "Eje 1 • Aguasay Centro y La Pulvia",
                "centro": [
                  9.7469,
                  -63.1762
                ],
                "vertices": [
                  [
                    9.7494,
                    -63.1797
                  ],
                  [
                    9.7497,
                    -63.173
                  ],
                  [
                    9.7445,
                    -63.1726
                  ],
                  [
                    9.7443,
                    -63.1793
                  ],
                  [
                    9.7494,
                    -63.1797
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-AGU-002",
                "nombre": "La Pulvia Artesanal",
                "casas": 460,
                "familias": 550,
                "habitantes": 1750,
                "votantes": 1170,
                "centroVotacion": "E.B. La Pulvia",
                "cobertura": 99,
                "munId": "aguasay",
                "munNombre": "Aguasay",
                "parishId": "aguasay-parroquia",
                "parishNombre": "Aguasay",
                "subParroquiaId": "sub-agu-01",
                "subParroquiaNombre": "Eje 1 • Aguasay Centro y La Pulvia",
                "centro": [
                  9.752096,
                  -63.1777
                ],
                "vertices": [
                  [
                    9.754596,
                    -63.1812
                  ],
                  [
                    9.754896,
                    -63.1745
                  ],
                  [
                    9.749696,
                    -63.1741
                  ],
                  [
                    9.749496,
                    -63.1808
                  ],
                  [
                    9.754596,
                    -63.1812
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-AGU-003",
                "nombre": "El Guamo y Arenas",
                "casas": 390,
                "familias": 470,
                "habitantes": 1480,
                "votantes": 990,
                "centroVotacion": "U.E. El Guamo",
                "cobertura": 97,
                "munId": "aguasay",
                "munNombre": "Aguasay",
                "parishId": "aguasay-parroquia",
                "parishNombre": "Aguasay",
                "subParroquiaId": "sub-agu-01",
                "subParroquiaNombre": "Eje 1 • Aguasay Centro y La Pulvia",
                "centro": [
                  9.753828,
                  -63.1857
                ],
                "vertices": [
                  [
                    9.756328,
                    -63.1892
                  ],
                  [
                    9.756628,
                    -63.1825
                  ],
                  [
                    9.751428,
                    -63.1821
                  ],
                  [
                    9.751228,
                    -63.1888
                  ],
                  [
                    9.756328,
                    -63.1892
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "santa-barbara",
    "nombre": "Santa Bárbara",
    "capital": "Santa Bárbara",
    "parroquias": [
      {
        "id": "santa-barbara-parroquia",
        "nombre": "Santa Bárbara",
        "tipo": "Única",
        "centro": [
          9.7469,
          -63.1812
        ],
        "subparroquias": [
          {
            "id": "sub-stb-01",
            "parroquiaId": "santa-barbara-parroquia",
            "nombre": "Eje 1 • Santa Bárbara Casco y Morón",
            "codigo": "EJE-STB-01",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.7509,
                -63.1922
              ],
              [
                9.7519,
                -63.1762
              ],
              [
                9.7389,
                -63.1772
              ],
              [
                9.7379,
                -63.1912
              ],
              [
                9.7509,
                -63.1922
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-STB-001",
                "nombre": "Santa Bárbara Centro",
                "casas": 590,
                "familias": 710,
                "habitantes": 2240,
                "votantes": 1500,
                "centroVotacion": "Liceo Nacional Santa Bárbara",
                "cobertura": 100,
                "munId": "santa-barbara",
                "munNombre": "Santa Bárbara",
                "parishId": "santa-barbara-parroquia",
                "parishNombre": "Santa Bárbara",
                "subParroquiaId": "sub-stb-01",
                "subParroquiaNombre": "Eje 1 • Santa Bárbara Casco y Morón",
                "centro": [
                  9.7469,
                  -63.1762
                ],
                "vertices": [
                  [
                    9.7494,
                    -63.1797
                  ],
                  [
                    9.7497,
                    -63.173
                  ],
                  [
                    9.7445,
                    -63.1726
                  ],
                  [
                    9.7443,
                    -63.1793
                  ],
                  [
                    9.7494,
                    -63.1797
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-STB-002",
                "nombre": "Morón de Santa Bárbara",
                "casas": 470,
                "familias": 560,
                "habitantes": 1790,
                "votantes": 1200,
                "centroVotacion": "E.B. Morón",
                "cobertura": 98,
                "munId": "santa-barbara",
                "munNombre": "Santa Bárbara",
                "parishId": "santa-barbara-parroquia",
                "parishNombre": "Santa Bárbara",
                "subParroquiaId": "sub-stb-01",
                "subParroquiaNombre": "Eje 1 • Santa Bárbara Casco y Morón",
                "centro": [
                  9.752096,
                  -63.1777
                ],
                "vertices": [
                  [
                    9.754596,
                    -63.1812
                  ],
                  [
                    9.754896,
                    -63.1745
                  ],
                  [
                    9.749696,
                    -63.1741
                  ],
                  [
                    9.749496,
                    -63.1808
                  ],
                  [
                    9.754596,
                    -63.1812
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-STB-003",
                "nombre": "Mamantonal y Las Lajas",
                "casas": 380,
                "familias": 460,
                "habitantes": 1440,
                "votantes": 960,
                "centroVotacion": "U.E. Mamantonal",
                "cobertura": 97,
                "munId": "santa-barbara",
                "munNombre": "Santa Bárbara",
                "parishId": "santa-barbara-parroquia",
                "parishNombre": "Santa Bárbara",
                "subParroquiaId": "sub-stb-01",
                "subParroquiaNombre": "Eje 1 • Santa Bárbara Casco y Morón",
                "centro": [
                  9.753828,
                  -63.1857
                ],
                "vertices": [
                  [
                    9.756328,
                    -63.1892
                  ],
                  [
                    9.756628,
                    -63.1825
                  ],
                  [
                    9.751428,
                    -63.1821
                  ],
                  [
                    9.751228,
                    -63.1888
                  ],
                  [
                    9.756328,
                    -63.1892
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "uracoa",
    "nombre": "Uracoa",
    "capital": "Uracoa",
    "parroquias": [
      {
        "id": "uracoa-parroquia",
        "nombre": "Uracoa",
        "tipo": "Única",
        "centro": [
          9.7469,
          -63.1812
        ],
        "subparroquias": [
          {
            "id": "sub-ura-01",
            "parroquiaId": "uracoa-parroquia",
            "nombre": "Eje 1 • Uracoa Malecón y Los Pilones",
            "codigo": "EJE-URA-01",
            "colorBorde": "#c084fc",
            "anchoBorde": 2.5,
            "colorRelleno": "#a855f7",
            "opacidad": 0.2,
            "vertices": [
              [
                9.7509,
                -63.1922
              ],
              [
                9.7519,
                -63.1762
              ],
              [
                9.7389,
                -63.1772
              ],
              [
                9.7379,
                -63.1912
              ],
              [
                9.7509,
                -63.1922
              ]
            ],
            "visible": true,
            "sectores": [
              {
                "id": "POL-URA-001",
                "nombre": "Uracoa Centro y Ribera",
                "casas": 520,
                "familias": 620,
                "habitantes": 1980,
                "votantes": 1320,
                "centroVotacion": "Liceo Nacional Uracoa",
                "cobertura": 100,
                "munId": "uracoa",
                "munNombre": "Uracoa",
                "parishId": "uracoa-parroquia",
                "parishNombre": "Uracoa",
                "subParroquiaId": "sub-ura-01",
                "subParroquiaNombre": "Eje 1 • Uracoa Malecón y Los Pilones",
                "centro": [
                  9.7469,
                  -63.1762
                ],
                "vertices": [
                  [
                    9.7494,
                    -63.1797
                  ],
                  [
                    9.7497,
                    -63.173
                  ],
                  [
                    9.7445,
                    -63.1726
                  ],
                  [
                    9.7443,
                    -63.1793
                  ],
                  [
                    9.7494,
                    -63.1797
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-URA-002",
                "nombre": "Los Pilones y Varadero",
                "casas": 410,
                "familias": 490,
                "habitantes": 1560,
                "votantes": 1040,
                "centroVotacion": "E.B. Los Pilones",
                "cobertura": 98,
                "munId": "uracoa",
                "munNombre": "Uracoa",
                "parishId": "uracoa-parroquia",
                "parishNombre": "Uracoa",
                "subParroquiaId": "sub-ura-01",
                "subParroquiaNombre": "Eje 1 • Uracoa Malecón y Los Pilones",
                "centro": [
                  9.752096,
                  -63.1777
                ],
                "vertices": [
                  [
                    9.754596,
                    -63.1812
                  ],
                  [
                    9.754896,
                    -63.1745
                  ],
                  [
                    9.749696,
                    -63.1741
                  ],
                  [
                    9.749496,
                    -63.1808
                  ],
                  [
                    9.754596,
                    -63.1812
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              },
              {
                "id": "POL-URA-003",
                "nombre": "Punta de Barquis y El Chorro",
                "casas": 340,
                "familias": 410,
                "habitantes": 1290,
                "votantes": 860,
                "centroVotacion": "U.E. Punta de Barquis",
                "cobertura": 96,
                "munId": "uracoa",
                "munNombre": "Uracoa",
                "parishId": "uracoa-parroquia",
                "parishNombre": "Uracoa",
                "subParroquiaId": "sub-ura-01",
                "subParroquiaNombre": "Eje 1 • Uracoa Malecón y Los Pilones",
                "centro": [
                  9.753828,
                  -63.1857
                ],
                "vertices": [
                  [
                    9.756328,
                    -63.1892
                  ],
                  [
                    9.756628,
                    -63.1825
                  ],
                  [
                    9.751428,
                    -63.1821
                  ],
                  [
                    9.751228,
                    -63.1888
                  ],
                  [
                    9.756328,
                    -63.1892
                  ]
                ],
                "colorBorde": "#38bdf8",
                "anchoBorde": 2,
                "colorRelleno": "#0284c7",
                "opacidad": 0.32,
                "visible": true
              }
            ]
          }
        ]
      }
    ]
  }
];

export const ALL_SECTORES_FLAT = [
  {
    "id": "POL-SIM-001",
    "nombre": "Centro Histórico Plaza Bolívar",
    "casas": 420,
    "familias": 510,
    "habitantes": 1590,
    "votantes": 1080,
    "centroVotacion": "U.E. Francisco Lazo Martí",
    "cobertura": 100,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "san-simon",
    "parishNombre": "San Simón",
    "subParroquiaId": "sub-ss-casco",
    "subParroquiaNombre": "Eje 1 • Casco Histórico y Comercial",
    "centro": [
      9.749,
      -63.17485
    ],
    "vertices": [
      [
        9.7515,
        -63.17835
      ],
      [
        9.7518,
        -63.17165
      ],
      [
        9.7466,
        -63.17125
      ],
      [
        9.7464,
        -63.17795
      ],
      [
        9.7515,
        -63.17835
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-SIM-002",
    "nombre": "Bulevar Bicentenario",
    "casas": 380,
    "familias": 450,
    "habitantes": 1410,
    "votantes": 950,
    "centroVotacion": "Liceo Nacional Miguel José Sanz",
    "cobertura": 98,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "san-simon",
    "parishNombre": "San Simón",
    "subParroquiaId": "sub-ss-casco",
    "subParroquiaNombre": "Eje 1 • Casco Histórico y Comercial",
    "centro": [
      9.752513,
      -63.182026
    ],
    "vertices": [
      [
        9.755013,
        -63.185526
      ],
      [
        9.755313,
        -63.178826
      ],
      [
        9.750113,
        -63.178426
      ],
      [
        9.749913,
        -63.185126
      ],
      [
        9.755013,
        -63.185526
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-SIM-003",
    "nombre": "Mercado Viejo - Av. Miranda",
    "casas": 510,
    "familias": 620,
    "habitantes": 1940,
    "votantes": 1290,
    "centroVotacion": "Escuela Básica Manuel Núñez Tovar",
    "cobertura": 99,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "san-simon",
    "parishNombre": "San Simón",
    "subParroquiaId": "sub-ss-casco",
    "subParroquiaNombre": "Eje 1 • Casco Histórico y Comercial",
    "centro": [
      9.742912,
      -63.177439
    ],
    "vertices": [
      [
        9.745412,
        -63.180939
      ],
      [
        9.745712,
        -63.174239
      ],
      [
        9.740512,
        -63.173839
      ],
      [
        9.740312,
        -63.180539
      ],
      [
        9.745412,
        -63.180939
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-SIM-004",
    "nombre": "Plaza Ayacucho - La Manga",
    "casas": 460,
    "familias": 540,
    "habitantes": 1720,
    "votantes": 1140,
    "centroVotacion": "U.E. República del Uruguay",
    "cobertura": 100,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "san-simon",
    "parishNombre": "San Simón",
    "subParroquiaId": "sub-ss-casco",
    "subParroquiaNombre": "Eje 1 • Casco Histórico y Comercial",
    "centro": [
      9.754405,
      -63.173649
    ],
    "vertices": [
      [
        9.756905,
        -63.177149
      ],
      [
        9.757205,
        -63.170449
      ],
      [
        9.752005,
        -63.170049
      ],
      [
        9.751805,
        -63.176749
      ],
      [
        9.756905,
        -63.177149
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-SIM-005",
    "nombre": "Palo Negro Sector Arriba",
    "casas": 620,
    "familias": 750,
    "habitantes": 2360,
    "votantes": 1540,
    "centroVotacion": "Colegio Virgen Misionera",
    "cobertura": 97,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "san-simon",
    "parishNombre": "San Simón",
    "subParroquiaId": "sub-ss-palo-negro",
    "subParroquiaNombre": "Eje 2 • Palo Negro - El Paraíso",
    "centro": [
      9.747711,
      -63.185651
    ],
    "vertices": [
      [
        9.750211,
        -63.189151
      ],
      [
        9.750511,
        -63.182451
      ],
      [
        9.745311,
        -63.182051
      ],
      [
        9.745111,
        -63.188751
      ],
      [
        9.750211,
        -63.189151
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-SIM-006",
    "nombre": "Palo Negro Caserío Central",
    "casas": 540,
    "familias": 660,
    "habitantes": 2050,
    "votantes": 1330,
    "centroVotacion": "E.B. Simón Bolívar",
    "cobertura": 100,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "san-simon",
    "parishNombre": "San Simón",
    "subParroquiaId": "sub-ss-palo-negro",
    "subParroquiaNombre": "Eje 2 • Palo Negro - El Paraíso",
    "centro": [
      9.744749,
      -63.170984
    ],
    "vertices": [
      [
        9.747249,
        -63.174484
      ],
      [
        9.747549,
        -63.167784
      ],
      [
        9.742349,
        -63.167384
      ],
      [
        9.742149,
        -63.174084
      ],
      [
        9.747249,
        -63.174484
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-SIM-007",
    "nombre": "El Paraíso - Av. Bicentenario",
    "casas": 430,
    "familias": 520,
    "habitantes": 1630,
    "votantes": 1090,
    "centroVotacion": "U.E. Félix Antonio Calderón",
    "cobertura": 96,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "san-simon",
    "parishNombre": "San Simón",
    "subParroquiaId": "sub-ss-palo-negro",
    "subParroquiaNombre": "Eje 2 • Palo Negro - El Paraíso",
    "centro": [
      9.757101,
      -63.180287
    ],
    "vertices": [
      [
        9.759601,
        -63.183787
      ],
      [
        9.759901,
        -63.177087
      ],
      [
        9.754701,
        -63.176687
      ],
      [
        9.754501,
        -63.183387
      ],
      [
        9.759601,
        -63.183787
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-SIM-008",
    "nombre": "La Muralla I",
    "casas": 710,
    "familias": 860,
    "habitantes": 2700,
    "votantes": 1780,
    "centroVotacion": "Liceo Idelfonso Núñez Mares",
    "cobertura": 100,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "san-simon",
    "parishNombre": "San Simón",
    "subParroquiaId": "sub-ss-muralla",
    "subParroquiaNombre": "Eje 3 • La Muralla - Brisas del Orinoco",
    "centro": [
      9.741172,
      -63.182269
    ],
    "vertices": [
      [
        9.743672,
        -63.185769
      ],
      [
        9.743972,
        -63.179069
      ],
      [
        9.738772,
        -63.178669
      ],
      [
        9.738572,
        -63.185369
      ],
      [
        9.743672,
        -63.185769
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-SIM-009",
    "nombre": "La Muralla II",
    "casas": 650,
    "familias": 790,
    "habitantes": 2470,
    "votantes": 1610,
    "centroVotacion": "E.B. Luisa Cáceres de Arismendi",
    "cobertura": 98,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "san-simon",
    "parishNombre": "San Simón",
    "subParroquiaId": "sub-ss-muralla",
    "subParroquiaNombre": "Eje 3 • La Muralla - Brisas del Orinoco",
    "centro": [
      9.752163,
      -63.168904
    ],
    "vertices": [
      [
        9.754663,
        -63.172404
      ],
      [
        9.754963,
        -63.165704
      ],
      [
        9.749763,
        -63.165304
      ],
      [
        9.749563,
        -63.172004
      ],
      [
        9.754663,
        -63.172404
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-SIM-010",
    "nombre": "Brisas del Orinoco Sector Central",
    "casas": 820,
    "familias": 990,
    "habitantes": 3120,
    "votantes": 2030,
    "centroVotacion": "U.E. Brisas del Orinoco",
    "cobertura": 99,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "san-simon",
    "parishNombre": "San Simón",
    "subParroquiaId": "sub-ss-muralla",
    "subParroquiaNombre": "Eje 3 • La Muralla - Brisas del Orinoco",
    "centro": [
      9.752663,
      -63.187317
    ],
    "vertices": [
      [
        9.755163,
        -63.190817
      ],
      [
        9.755463,
        -63.184117
      ],
      [
        9.750263,
        -63.183717
      ],
      [
        9.750063,
        -63.190417
      ],
      [
        9.755163,
        -63.190817
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-SIM-011",
    "nombre": "Brisas del Orinoco Ribera",
    "casas": 490,
    "familias": 590,
    "habitantes": 1860,
    "votantes": 1210,
    "centroVotacion": "C.E.I. Pequeños Próceres",
    "cobertura": 95,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "san-simon",
    "parishNombre": "San Simón",
    "subParroquiaId": "sub-ss-muralla",
    "subParroquiaNombre": "Eje 3 • La Muralla - Brisas del Orinoco",
    "centro": [
      9.737981,
      -63.176569
    ],
    "vertices": [
      [
        9.740481,
        -63.180069
      ],
      [
        9.740781,
        -63.173369
      ],
      [
        9.735581,
        -63.172969
      ],
      [
        9.735381,
        -63.179669
      ],
      [
        9.740481,
        -63.180069
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-GOD-001",
    "nombre": "La Puente Sector 1 (Plaza)",
    "casas": 480,
    "familias": 580,
    "habitantes": 1820,
    "votantes": 1220,
    "centroVotacion": "U.E. Gregorio Rondón",
    "cobertura": 100,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "alto-de-los-godos",
    "parishNombre": "Alto de Los Godos",
    "subParroquiaId": "sub-godos-lapuente",
    "subParroquiaNombre": "Eje 6 • Circuito Territorial La Puente",
    "centro": [
      9.732,
      -63.20885
    ],
    "vertices": [
      [
        9.7345,
        -63.21235
      ],
      [
        9.7348,
        -63.20565
      ],
      [
        9.7296,
        -63.20525
      ],
      [
        9.7294,
        -63.21195
      ],
      [
        9.7345,
        -63.21235
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-GOD-002",
    "nombre": "La Puente Sector 2 (Cancha)",
    "casas": 530,
    "familias": 640,
    "habitantes": 2010,
    "votantes": 1350,
    "centroVotacion": "U.E. Gregorio Rondón",
    "cobertura": 99,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "alto-de-los-godos",
    "parishNombre": "Alto de Los Godos",
    "subParroquiaId": "sub-godos-lapuente",
    "subParroquiaNombre": "Eje 6 • Circuito Territorial La Puente",
    "centro": [
      9.735513,
      -63.216026
    ],
    "vertices": [
      [
        9.738013,
        -63.219526
      ],
      [
        9.738313,
        -63.212826
      ],
      [
        9.733113,
        -63.212426
      ],
      [
        9.732913,
        -63.219126
      ],
      [
        9.738013,
        -63.219526
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-GOD-003",
    "nombre": "La Puente Sector 3 (Vialidad)",
    "casas": 460,
    "familias": 560,
    "habitantes": 1750,
    "votantes": 1170,
    "centroVotacion": "E.B. Cacique Guanaguanay",
    "cobertura": 98,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "alto-de-los-godos",
    "parishNombre": "Alto de Los Godos",
    "subParroquiaId": "sub-godos-lapuente",
    "subParroquiaNombre": "Eje 6 • Circuito Territorial La Puente",
    "centro": [
      9.725912,
      -63.211439
    ],
    "vertices": [
      [
        9.728412,
        -63.214939
      ],
      [
        9.728712,
        -63.208239
      ],
      [
        9.723512,
        -63.207839
      ],
      [
        9.723312,
        -63.214539
      ],
      [
        9.728412,
        -63.214939
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-GOD-004",
    "nombre": "La Puente Sector 4 (Quebrada)",
    "casas": 590,
    "familias": 720,
    "habitantes": 2240,
    "votantes": 1500,
    "centroVotacion": "E.B. Cacique Guanaguanay",
    "cobertura": 97,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "alto-de-los-godos",
    "parishNombre": "Alto de Los Godos",
    "subParroquiaId": "sub-godos-lapuente",
    "subParroquiaNombre": "Eje 6 • Circuito Territorial La Puente",
    "centro": [
      9.737405,
      -63.207649
    ],
    "vertices": [
      [
        9.739905,
        -63.211149
      ],
      [
        9.740205,
        -63.204449
      ],
      [
        9.735005,
        -63.204049
      ],
      [
        9.734805,
        -63.210749
      ],
      [
        9.739905,
        -63.211149
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-GOD-005",
    "nombre": "Villas de La Puente",
    "casas": 390,
    "familias": 470,
    "habitantes": 1480,
    "votantes": 990,
    "centroVotacion": "C.E.I. Los Samanes",
    "cobertura": 100,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "alto-de-los-godos",
    "parishNombre": "Alto de Los Godos",
    "subParroquiaId": "sub-godos-lapuente",
    "subParroquiaNombre": "Eje 6 • Circuito Territorial La Puente",
    "centro": [
      9.730711,
      -63.219651
    ],
    "vertices": [
      [
        9.733211,
        -63.223151
      ],
      [
        9.733511,
        -63.216451
      ],
      [
        9.728311,
        -63.216051
      ],
      [
        9.728111,
        -63.222751
      ],
      [
        9.733211,
        -63.223151
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-GOD-006",
    "nombre": "Los Godos 1",
    "casas": 680,
    "familias": 820,
    "habitantes": 2580,
    "votantes": 1730,
    "centroVotacion": "Liceo Los Godos",
    "cobertura": 100,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "alto-de-los-godos",
    "parishNombre": "Alto de Los Godos",
    "subParroquiaId": "sub-godos-central",
    "subParroquiaNombre": "Eje 1 • Los Godos Casco Viejo - Fundemos",
    "centro": [
      9.727749,
      -63.204984
    ],
    "vertices": [
      [
        9.730249,
        -63.208484
      ],
      [
        9.730549,
        -63.201784
      ],
      [
        9.725349,
        -63.201384
      ],
      [
        9.725149,
        -63.208084
      ],
      [
        9.730249,
        -63.208484
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-GOD-007",
    "nombre": "Los Godos 2",
    "casas": 720,
    "familias": 870,
    "habitantes": 2740,
    "votantes": 1830,
    "centroVotacion": "E.B. Félix Armando Núñez",
    "cobertura": 99,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "alto-de-los-godos",
    "parishNombre": "Alto de Los Godos",
    "subParroquiaId": "sub-godos-central",
    "subParroquiaNombre": "Eje 1 • Los Godos Casco Viejo - Fundemos",
    "centro": [
      9.740101,
      -63.214287
    ],
    "vertices": [
      [
        9.742601,
        -63.217787
      ],
      [
        9.742901,
        -63.211087
      ],
      [
        9.737701,
        -63.210687
      ],
      [
        9.737501,
        -63.217387
      ],
      [
        9.742601,
        -63.217787
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-GOD-008",
    "nombre": "Fundemos I",
    "casas": 510,
    "familias": 620,
    "habitantes": 1940,
    "votantes": 1300,
    "centroVotacion": "U.E. Fundemos",
    "cobertura": 98,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "alto-de-los-godos",
    "parishNombre": "Alto de Los Godos",
    "subParroquiaId": "sub-godos-central",
    "subParroquiaNombre": "Eje 1 • Los Godos Casco Viejo - Fundemos",
    "centro": [
      9.724172,
      -63.216269
    ],
    "vertices": [
      [
        9.726672,
        -63.219769
      ],
      [
        9.726972,
        -63.213069
      ],
      [
        9.721772,
        -63.212669
      ],
      [
        9.721572,
        -63.219369
      ],
      [
        9.726672,
        -63.219769
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-GOD-009",
    "nombre": "Fundemos II",
    "casas": 470,
    "familias": 570,
    "habitantes": 1790,
    "votantes": 1200,
    "centroVotacion": "U.E. Fundemos",
    "cobertura": 96,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "alto-de-los-godos",
    "parishNombre": "Alto de Los Godos",
    "subParroquiaId": "sub-godos-central",
    "subParroquiaNombre": "Eje 1 • Los Godos Casco Viejo - Fundemos",
    "centro": [
      9.735163,
      -63.202904
    ],
    "vertices": [
      [
        9.737663,
        -63.206404
      ],
      [
        9.737963,
        -63.199704
      ],
      [
        9.732763,
        -63.199304
      ],
      [
        9.732563,
        -63.206004
      ],
      [
        9.737663,
        -63.206404
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-GOD-010",
    "nombre": "Morichal Sector Grande",
    "casas": 810,
    "familias": 980,
    "habitantes": 3080,
    "votantes": 2060,
    "centroVotacion": "U.E. José Antonio Páez",
    "cobertura": 100,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "alto-de-los-godos",
    "parishNombre": "Alto de Los Godos",
    "subParroquiaId": "sub-godos-morichal",
    "subParroquiaNombre": "Eje 4 • Morichal - Los Guaros",
    "centro": [
      9.735663,
      -63.221317
    ],
    "vertices": [
      [
        9.738163,
        -63.224817
      ],
      [
        9.738463,
        -63.218117
      ],
      [
        9.733263,
        -63.217717
      ],
      [
        9.733063,
        -63.224417
      ],
      [
        9.738163,
        -63.224817
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-GOD-011",
    "nombre": "Morichalito",
    "casas": 430,
    "familias": 520,
    "habitantes": 1630,
    "votantes": 1090,
    "centroVotacion": "E.B. Morichal",
    "cobertura": 98,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "alto-de-los-godos",
    "parishNombre": "Alto de Los Godos",
    "subParroquiaId": "sub-godos-morichal",
    "subParroquiaNombre": "Eje 4 • Morichal - Los Guaros",
    "centro": [
      9.722981,
      -63.207569
    ],
    "vertices": [
      [
        9.725481,
        -63.211069
      ],
      [
        9.725781,
        -63.204369
      ],
      [
        9.720581,
        -63.203969
      ],
      [
        9.720381,
        -63.210669
      ],
      [
        9.725481,
        -63.211069
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-GOD-012",
    "nombre": "Los Guaros Central",
    "casas": 620,
    "familias": 750,
    "habitantes": 2360,
    "votantes": 1580,
    "centroVotacion": "C.E.I. Los Guaros",
    "cobertura": 100,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "alto-de-los-godos",
    "parishNombre": "Alto de Los Godos",
    "subParroquiaId": "sub-godos-morichal",
    "subParroquiaNombre": "Eje 4 • Morichal - Los Guaros",
    "centro": [
      9.741825,
      -63.208764
    ],
    "vertices": [
      [
        9.744325,
        -63.212264
      ],
      [
        9.744625,
        -63.205564
      ],
      [
        9.739425,
        -63.205164
      ],
      [
        9.739225,
        -63.211864
      ],
      [
        9.744325,
        -63.212264
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-COC-001",
    "nombre": "Sabana Grande Sector 1",
    "casas": 750,
    "familias": 910,
    "habitantes": 2850,
    "votantes": 1910,
    "centroVotacion": "U.E. Sabana Grande",
    "cobertura": 100,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "las-cocuizas",
    "parishNombre": "Las Cocuizas",
    "subParroquiaId": "sub-coc-sabana",
    "subParroquiaNombre": "Eje 1 • Sabana Grande y Aeropuerto",
    "centro": [
      9.758,
      -63.14585
    ],
    "vertices": [
      [
        9.7605,
        -63.14935
      ],
      [
        9.7608,
        -63.14265
      ],
      [
        9.7556,
        -63.14225
      ],
      [
        9.7554,
        -63.14895
      ],
      [
        9.7605,
        -63.14935
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-COC-002",
    "nombre": "Sabana Grande Sector 2",
    "casas": 680,
    "familias": 820,
    "habitantes": 2580,
    "votantes": 1730,
    "centroVotacion": "U.E. Sabana Grande",
    "cobertura": 99,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "las-cocuizas",
    "parishNombre": "Las Cocuizas",
    "subParroquiaId": "sub-coc-sabana",
    "subParroquiaNombre": "Eje 1 • Sabana Grande y Aeropuerto",
    "centro": [
      9.761513,
      -63.153026
    ],
    "vertices": [
      [
        9.764013,
        -63.156526
      ],
      [
        9.764313,
        -63.149826
      ],
      [
        9.759113,
        -63.149426
      ],
      [
        9.758913,
        -63.156126
      ],
      [
        9.764013,
        -63.156526
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-COC-003",
    "nombre": "Zona Aeropuerto Internacional",
    "casas": 420,
    "familias": 510,
    "habitantes": 1600,
    "votantes": 1070,
    "centroVotacion": "Liceo José Tadeo Monagas",
    "cobertura": 96,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "las-cocuizas",
    "parishNombre": "Las Cocuizas",
    "subParroquiaId": "sub-coc-sabana",
    "subParroquiaNombre": "Eje 1 • Sabana Grande y Aeropuerto",
    "centro": [
      9.751912,
      -63.148439
    ],
    "vertices": [
      [
        9.754412,
        -63.151939
      ],
      [
        9.754712,
        -63.145239
      ],
      [
        9.749512,
        -63.144839
      ],
      [
        9.749312,
        -63.151539
      ],
      [
        9.754412,
        -63.151939
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-COC-004",
    "nombre": "El Silencio",
    "casas": 890,
    "familias": 1080,
    "habitantes": 3380,
    "votantes": 2260,
    "centroVotacion": "E.B. El Silencio",
    "cobertura": 100,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "las-cocuizas",
    "parishNombre": "Las Cocuizas",
    "subParroquiaId": "sub-coc-sabana",
    "subParroquiaNombre": "Eje 1 • Sabana Grande y Aeropuerto",
    "centro": [
      9.763405,
      -63.144649
    ],
    "vertices": [
      [
        9.765905,
        -63.148149
      ],
      [
        9.766205,
        -63.141449
      ],
      [
        9.761005,
        -63.141049
      ],
      [
        9.760805,
        -63.147749
      ],
      [
        9.765905,
        -63.148149
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-COC-005",
    "nombre": "El Nazareno Caserío",
    "casas": 590,
    "familias": 710,
    "habitantes": 2240,
    "votantes": 1500,
    "centroVotacion": "U.E. El Nazareno",
    "cobertura": 98,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "las-cocuizas",
    "parishNombre": "Las Cocuizas",
    "subParroquiaId": "sub-coc-nazareno",
    "subParroquiaNombre": "Eje 2 • El Nazareno - La Floresta",
    "centro": [
      9.756711,
      -63.156651
    ],
    "vertices": [
      [
        9.759211,
        -63.160151
      ],
      [
        9.759511,
        -63.153451
      ],
      [
        9.754311,
        -63.153051
      ],
      [
        9.754111,
        -63.159751
      ],
      [
        9.759211,
        -63.160151
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-COC-006",
    "nombre": "La Floresta Sector Norte",
    "casas": 720,
    "familias": 870,
    "habitantes": 2740,
    "votantes": 1830,
    "centroVotacion": "Colegio La Floresta",
    "cobertura": 100,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "las-cocuizas",
    "parishNombre": "Las Cocuizas",
    "subParroquiaId": "sub-coc-nazareno",
    "subParroquiaNombre": "Eje 2 • El Nazareno - La Floresta",
    "centro": [
      9.753749,
      -63.141984
    ],
    "vertices": [
      [
        9.756249,
        -63.145484
      ],
      [
        9.756549,
        -63.138784
      ],
      [
        9.751349,
        -63.138384
      ],
      [
        9.751149,
        -63.145084
      ],
      [
        9.756249,
        -63.145484
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-COC-007",
    "nombre": "Parque del Este Residencial",
    "casas": 480,
    "familias": 580,
    "habitantes": 1820,
    "votantes": 1220,
    "centroVotacion": "C.E.I. Mi Casita",
    "cobertura": 97,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "las-cocuizas",
    "parishNombre": "Las Cocuizas",
    "subParroquiaId": "sub-coc-nazareno",
    "subParroquiaNombre": "Eje 2 • El Nazareno - La Floresta",
    "centro": [
      9.766101,
      -63.151287
    ],
    "vertices": [
      [
        9.768601,
        -63.154787
      ],
      [
        9.768901,
        -63.148087
      ],
      [
        9.763701,
        -63.147687
      ],
      [
        9.763501,
        -63.154387
      ],
      [
        9.768601,
        -63.154787
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-BOQ-001",
    "nombre": "Tipuro I (Urbanizaciones)",
    "casas": 850,
    "familias": 980,
    "habitantes": 3100,
    "votantes": 2150,
    "centroVotacion": "Colegio Alejandro de Humboldt",
    "cobertura": 99,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "boqueron",
    "parishNombre": "Boquerón",
    "subParroquiaId": "sub-boq-tipuro",
    "subParroquiaNombre": "Eje 1 • Tipuro - Palma Real",
    "centro": [
      9.789,
      -63.19185
    ],
    "vertices": [
      [
        9.7915,
        -63.19535
      ],
      [
        9.7918,
        -63.18865
      ],
      [
        9.7866,
        -63.18825
      ],
      [
        9.7864,
        -63.19495
      ],
      [
        9.7915,
        -63.19535
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-BOQ-002",
    "nombre": "Tipuro II (Villas del Norte)",
    "casas": 920,
    "familias": 1060,
    "habitantes": 3350,
    "votantes": 2320,
    "centroVotacion": "Colegio Los Sauces",
    "cobertura": 98,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "boqueron",
    "parishNombre": "Boquerón",
    "subParroquiaId": "sub-boq-tipuro",
    "subParroquiaNombre": "Eje 1 • Tipuro - Palma Real",
    "centro": [
      9.792513,
      -63.199026
    ],
    "vertices": [
      [
        9.795013,
        -63.202526
      ],
      [
        9.795313,
        -63.195826
      ],
      [
        9.790113,
        -63.195426
      ],
      [
        9.789913,
        -63.202126
      ],
      [
        9.795013,
        -63.202526
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-BOQ-003",
    "nombre": "Palma Real Norte",
    "casas": 640,
    "familias": 740,
    "habitantes": 2340,
    "votantes": 1620,
    "centroVotacion": "U.E. Palma Real",
    "cobertura": 100,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "boqueron",
    "parishNombre": "Boquerón",
    "subParroquiaId": "sub-boq-tipuro",
    "subParroquiaNombre": "Eje 1 • Tipuro - Palma Real",
    "centro": [
      9.782912,
      -63.194439
    ],
    "vertices": [
      [
        9.785412,
        -63.197939
      ],
      [
        9.785712,
        -63.191239
      ],
      [
        9.780512,
        -63.190839
      ],
      [
        9.780312,
        -63.197539
      ],
      [
        9.785412,
        -63.197939
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-BOQ-004",
    "nombre": "Los Cortijos de Tipuro",
    "casas": 530,
    "familias": 610,
    "habitantes": 1930,
    "votantes": 1340,
    "centroVotacion": "U.E. Los Cortijos",
    "cobertura": 97,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "boqueron",
    "parishNombre": "Boquerón",
    "subParroquiaId": "sub-boq-tipuro",
    "subParroquiaNombre": "Eje 1 • Tipuro - Palma Real",
    "centro": [
      9.794405,
      -63.190649
    ],
    "vertices": [
      [
        9.796905,
        -63.194149
      ],
      [
        9.797205,
        -63.187449
      ],
      [
        9.792005,
        -63.187049
      ],
      [
        9.791805,
        -63.193749
      ],
      [
        9.796905,
        -63.194149
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-BOQ-005",
    "nombre": "Boquerón Pueblo",
    "casas": 710,
    "familias": 860,
    "habitantes": 2700,
    "votantes": 1810,
    "centroVotacion": "E.B. Boquerón",
    "cobertura": 100,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "boqueron",
    "parishNombre": "Boquerón",
    "subParroquiaId": "sub-boq-viboral",
    "subParroquiaNombre": "Eje 2 • Boquerón Centro - Costo Arriba",
    "centro": [
      9.787711,
      -63.202651
    ],
    "vertices": [
      [
        9.790211,
        -63.206151
      ],
      [
        9.790511,
        -63.199451
      ],
      [
        9.785311,
        -63.199051
      ],
      [
        9.785111,
        -63.205751
      ],
      [
        9.790211,
        -63.206151
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-BOQ-006",
    "nombre": "Costo Arriba",
    "casas": 580,
    "familias": 700,
    "habitantes": 2200,
    "votantes": 1470,
    "centroVotacion": "U.E. Costo Arriba",
    "cobertura": 96,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "boqueron",
    "parishNombre": "Boquerón",
    "subParroquiaId": "sub-boq-viboral",
    "subParroquiaNombre": "Eje 2 • Boquerón Centro - Costo Arriba",
    "centro": [
      9.784749,
      -63.187984
    ],
    "vertices": [
      [
        9.787249,
        -63.191484
      ],
      [
        9.787549,
        -63.184784
      ],
      [
        9.782349,
        -63.184384
      ],
      [
        9.782149,
        -63.191084
      ],
      [
        9.787249,
        -63.191484
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-BOQ-007",
    "nombre": "Viboral Agrícola",
    "casas": 490,
    "familias": 590,
    "habitantes": 1860,
    "votantes": 1250,
    "centroVotacion": "E.B. Viboral",
    "cobertura": 98,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "boqueron",
    "parishNombre": "Boquerón",
    "subParroquiaId": "sub-boq-viboral",
    "subParroquiaNombre": "Eje 2 • Boquerón Centro - Costo Arriba",
    "centro": [
      9.797101,
      -63.197287
    ],
    "vertices": [
      [
        9.799601,
        -63.200787
      ],
      [
        9.799901,
        -63.194087
      ],
      [
        9.794701,
        -63.193687
      ],
      [
        9.794501,
        -63.200387
      ],
      [
        9.799601,
        -63.200787
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-STC-001",
    "nombre": "La Gran Victoria Sector A-B",
    "casas": 950,
    "familias": 1150,
    "habitantes": 3610,
    "votantes": 2420,
    "centroVotacion": "U.E. La Gran Victoria",
    "cobertura": 100,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "santa-cruz",
    "parishNombre": "Santa Cruz (La Cruz)",
    "subParroquiaId": "sub-stc-granvictoria",
    "subParroquiaNombre": "Eje 1 • Gran Victoria y Zona Industrial",
    "centro": [
      9.715,
      -63.23485
    ],
    "vertices": [
      [
        9.7175,
        -63.23835
      ],
      [
        9.7178,
        -63.23165
      ],
      [
        9.7126,
        -63.23125
      ],
      [
        9.7124,
        -63.23795
      ],
      [
        9.7175,
        -63.23835
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-STC-002",
    "nombre": "La Gran Victoria Sector C-D",
    "casas": 880,
    "familias": 1060,
    "habitantes": 3340,
    "votantes": 2240,
    "centroVotacion": "U.E. La Gran Victoria",
    "cobertura": 99,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "santa-cruz",
    "parishNombre": "Santa Cruz (La Cruz)",
    "subParroquiaId": "sub-stc-granvictoria",
    "subParroquiaNombre": "Eje 1 • Gran Victoria y Zona Industrial",
    "centro": [
      9.718513,
      -63.242026
    ],
    "vertices": [
      [
        9.721013,
        -63.245526
      ],
      [
        9.721313,
        -63.238826
      ],
      [
        9.716113,
        -63.238426
      ],
      [
        9.715913,
        -63.245126
      ],
      [
        9.721013,
        -63.245526
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-STC-003",
    "nombre": "Santa Cruz Casco Viejo",
    "casas": 670,
    "familias": 810,
    "habitantes": 2550,
    "votantes": 1710,
    "centroVotacion": "Liceo Santa Cruz",
    "cobertura": 100,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "santa-cruz",
    "parishNombre": "Santa Cruz (La Cruz)",
    "subParroquiaId": "sub-stc-granvictoria",
    "subParroquiaNombre": "Eje 1 • Gran Victoria y Zona Industrial",
    "centro": [
      9.708912,
      -63.237439
    ],
    "vertices": [
      [
        9.711412,
        -63.240939
      ],
      [
        9.711712,
        -63.234239
      ],
      [
        9.706512,
        -63.233839
      ],
      [
        9.706312,
        -63.240539
      ],
      [
        9.711412,
        -63.240939
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-STC-004",
    "nombre": "Zona Industrial Residencial",
    "casas": 410,
    "familias": 500,
    "habitantes": 1560,
    "votantes": 1050,
    "centroVotacion": "E.B. Los Pinos",
    "cobertura": 95,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "santa-cruz",
    "parishNombre": "Santa Cruz (La Cruz)",
    "subParroquiaId": "sub-stc-granvictoria",
    "subParroquiaNombre": "Eje 1 • Gran Victoria y Zona Industrial",
    "centro": [
      9.720405,
      -63.233649
    ],
    "vertices": [
      [
        9.722905,
        -63.237149
      ],
      [
        9.723205,
        -63.230449
      ],
      [
        9.718005,
        -63.230049
      ],
      [
        9.717805,
        -63.236749
      ],
      [
        9.722905,
        -63.237149
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-VIC-001",
    "nombre": "San Vicente Casco Central",
    "casas": 610,
    "familias": 740,
    "habitantes": 2320,
    "votantes": 1550,
    "centroVotacion": "E.B. San Vicente",
    "cobertura": 100,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "san-vicente",
    "parishNombre": "San Vicente",
    "subParroquiaId": "sub-vic-pueblo",
    "subParroquiaNombre": "Eje 1 • San Vicente Central y Pueblos Nuevos",
    "centro": [
      9.729,
      -63.28085
    ],
    "vertices": [
      [
        9.7315,
        -63.28435
      ],
      [
        9.7318,
        -63.27765
      ],
      [
        9.7266,
        -63.27725
      ],
      [
        9.7264,
        -63.28395
      ],
      [
        9.7315,
        -63.28435
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-VIC-002",
    "nombre": "Pueblo Nuevo San Vicente",
    "casas": 530,
    "familias": 640,
    "habitantes": 2010,
    "votantes": 1350,
    "centroVotacion": "U.E. Pueblo Nuevo",
    "cobertura": 98,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "san-vicente",
    "parishNombre": "San Vicente",
    "subParroquiaId": "sub-vic-pueblo",
    "subParroquiaNombre": "Eje 1 • San Vicente Central y Pueblos Nuevos",
    "centro": [
      9.732513,
      -63.288026
    ],
    "vertices": [
      [
        9.735013,
        -63.291526
      ],
      [
        9.735313,
        -63.284826
      ],
      [
        9.730113,
        -63.284426
      ],
      [
        9.729913,
        -63.291126
      ],
      [
        9.735013,
        -63.291526
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-VIC-003",
    "nombre": "Corocito y Las Parcelas",
    "casas": 440,
    "familias": 530,
    "habitantes": 1670,
    "votantes": 1120,
    "centroVotacion": "C.E.I. Corocito",
    "cobertura": 97,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "san-vicente",
    "parishNombre": "San Vicente",
    "subParroquiaId": "sub-vic-pueblo",
    "subParroquiaNombre": "Eje 1 • San Vicente Central y Pueblos Nuevos",
    "centro": [
      9.729,
      -63.284
    ],
    "vertices": [
      [
        9.7315,
        -63.2875
      ],
      [
        9.7318,
        -63.2808
      ],
      [
        9.7266,
        -63.2804
      ],
      [
        9.7264,
        -63.2871
      ],
      [
        9.7315,
        -63.2875
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-PIC-001",
    "nombre": "La Pica Casco",
    "casas": 580,
    "familias": 700,
    "habitantes": 2200,
    "votantes": 1470,
    "centroVotacion": "Liceo Nacional La Pica",
    "cobertura": 99,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "la-pica",
    "parishNombre": "La Pica",
    "subParroquiaId": "sub-pic-centro",
    "subParroquiaNombre": "Eje 1 • La Pica Centro y Puerta Negra",
    "centro": [
      9.776,
      -63.07585
    ],
    "vertices": [
      [
        9.7785,
        -63.07935
      ],
      [
        9.7788,
        -63.07265
      ],
      [
        9.7736,
        -63.07225
      ],
      [
        9.7734,
        -63.07895
      ],
      [
        9.7785,
        -63.07935
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-PIC-002",
    "nombre": "Puerta Negra",
    "casas": 490,
    "familias": 590,
    "habitantes": 1860,
    "votantes": 1250,
    "centroVotacion": "E.B. Puerta Negra",
    "cobertura": 96,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "la-pica",
    "parishNombre": "La Pica",
    "subParroquiaId": "sub-pic-centro",
    "subParroquiaNombre": "Eje 1 • La Pica Centro y Puerta Negra",
    "centro": [
      9.779513,
      -63.083026
    ],
    "vertices": [
      [
        9.782013,
        -63.086526
      ],
      [
        9.782313,
        -63.079826
      ],
      [
        9.777113,
        -63.079426
      ],
      [
        9.776913,
        -63.086126
      ],
      [
        9.782013,
        -63.086526
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-PIC-003",
    "nombre": "Laguna Grande",
    "casas": 370,
    "familias": 450,
    "habitantes": 1410,
    "votantes": 940,
    "centroVotacion": "U.E. Laguna Grande",
    "cobertura": 98,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "la-pica",
    "parishNombre": "La Pica",
    "subParroquiaId": "sub-pic-centro",
    "subParroquiaNombre": "Eje 1 • La Pica Centro y Puerta Negra",
    "centro": [
      9.769912,
      -63.078439
    ],
    "vertices": [
      [
        9.772412,
        -63.081939
      ],
      [
        9.772712,
        -63.075239
      ],
      [
        9.767512,
        -63.074839
      ],
      [
        9.767312,
        -63.081539
      ],
      [
        9.772412,
        -63.081939
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-JUS-001",
    "nombre": "Jusepín Casco Histórico",
    "casas": 520,
    "familias": 630,
    "habitantes": 1980,
    "votantes": 1330,
    "centroVotacion": "E.B. Jusepín",
    "cobertura": 100,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "jusepin",
    "parishNombre": "Jusepín",
    "subParroquiaId": "sub-jus-campo",
    "subParroquiaNombre": "Eje 1 • Jusepín Campo Petrolero y UDO",
    "centro": [
      9.749,
      -63.50085
    ],
    "vertices": [
      [
        9.7515,
        -63.50435
      ],
      [
        9.7518,
        -63.49765
      ],
      [
        9.7466,
        -63.49725
      ],
      [
        9.7464,
        -63.50395
      ],
      [
        9.7515,
        -63.50435
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-JUS-002",
    "nombre": "Sector Universitario UDO",
    "casas": 460,
    "familias": 550,
    "habitantes": 1750,
    "votantes": 1170,
    "centroVotacion": "U.E. Jusepín Oriente",
    "cobertura": 97,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "jusepin",
    "parishNombre": "Jusepín",
    "subParroquiaId": "sub-jus-campo",
    "subParroquiaNombre": "Eje 1 • Jusepín Campo Petrolero y UDO",
    "centro": [
      9.752513,
      -63.508026
    ],
    "vertices": [
      [
        9.755013,
        -63.511526
      ],
      [
        9.755313,
        -63.504826
      ],
      [
        9.750113,
        -63.504426
      ],
      [
        9.749913,
        -63.511126
      ],
      [
        9.755013,
        -63.511526
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-JUS-003",
    "nombre": "Campo Morichalito Petrolero",
    "casas": 390,
    "familias": 470,
    "habitantes": 1480,
    "votantes": 990,
    "centroVotacion": "Colegio San José",
    "cobertura": 98,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "jusepin",
    "parishNombre": "Jusepín",
    "subParroquiaId": "sub-jus-campo",
    "subParroquiaNombre": "Eje 1 • Jusepín Campo Petrolero y UDO",
    "centro": [
      9.749,
      -63.504
    ],
    "vertices": [
      [
        9.7515,
        -63.5075
      ],
      [
        9.7518,
        -63.5008
      ],
      [
        9.7466,
        -63.5004
      ],
      [
        9.7464,
        -63.5071
      ],
      [
        9.7515,
        -63.5075
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-FUR-001",
    "nombre": "El Furrial Casco Tradicional",
    "casas": 670,
    "familias": 810,
    "habitantes": 2550,
    "votantes": 1710,
    "centroVotacion": "Liceo Nacional El Furrial",
    "cobertura": 100,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "el-furrial",
    "parishNombre": "El Furrial",
    "subParroquiaId": "sub-fur-eje",
    "subParroquiaNombre": "Eje 1 • El Furrial Centro y Vía La Ceiba",
    "centro": [
      9.726,
      -63.366
    ],
    "vertices": [
      [
        9.7285,
        -63.3695
      ],
      [
        9.7288,
        -63.3628
      ],
      [
        9.7236,
        -63.3624
      ],
      [
        9.7234,
        -63.3691
      ],
      [
        9.7285,
        -63.3695
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-FUR-002",
    "nombre": "La Ceiba El Furrial",
    "casas": 510,
    "familias": 620,
    "habitantes": 1940,
    "votantes": 1300,
    "centroVotacion": "E.B. La Ceiba",
    "cobertura": 97,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "el-furrial",
    "parishNombre": "El Furrial",
    "subParroquiaId": "sub-fur-eje",
    "subParroquiaNombre": "Eje 1 • El Furrial Centro y Vía La Ceiba",
    "centro": [
      9.731,
      -63.372
    ],
    "vertices": [
      [
        9.7335,
        -63.3755
      ],
      [
        9.7338,
        -63.3688
      ],
      [
        9.7286,
        -63.3684
      ],
      [
        9.7284,
        -63.3751
      ],
      [
        9.7335,
        -63.3755
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-FUR-003",
    "nombre": "La Candelaria de Furrial",
    "casas": 430,
    "familias": 520,
    "habitantes": 1630,
    "votantes": 1090,
    "centroVotacion": "U.E. Candelaria",
    "cobertura": 98,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "el-furrial",
    "parishNombre": "El Furrial",
    "subParroquiaId": "sub-fur-eje",
    "subParroquiaNombre": "Eje 1 • El Furrial Centro y Vía La Ceiba",
    "centro": [
      9.715,
      -63.354
    ],
    "vertices": [
      [
        9.7175,
        -63.3575
      ],
      [
        9.7178,
        -63.3508
      ],
      [
        9.7126,
        -63.3504
      ],
      [
        9.7124,
        -63.3571
      ],
      [
        9.7175,
        -63.3575
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-COR-001",
    "nombre": "El Corozo Casco Central",
    "casas": 490,
    "familias": 590,
    "habitantes": 1860,
    "votantes": 1250,
    "centroVotacion": "E.B. El Corozo",
    "cobertura": 100,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "el-corozo",
    "parishNombre": "El Corozo",
    "subParroquiaId": "sub-cor-centro",
    "subParroquiaNombre": "Eje 1 • El Corozo Casco y La Morita",
    "centro": [
      9.676,
      -63.216
    ],
    "vertices": [
      [
        9.6785,
        -63.2195
      ],
      [
        9.6788,
        -63.2128
      ],
      [
        9.6736,
        -63.2124
      ],
      [
        9.6734,
        -63.2191
      ],
      [
        9.6785,
        -63.2195
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-COR-002",
    "nombre": "La Morita y Sabana del Corozo",
    "casas": 420,
    "familias": 510,
    "habitantes": 1600,
    "votantes": 1070,
    "centroVotacion": "U.E. La Morita",
    "cobertura": 96,
    "munId": "maturin",
    "munNombre": "Maturín",
    "parishId": "el-corozo",
    "parishNombre": "El Corozo",
    "subParroquiaId": "sub-cor-centro",
    "subParroquiaNombre": "Eje 1 • El Corozo Casco y La Morita",
    "centro": [
      9.680196,
      -63.2115
    ],
    "vertices": [
      [
        9.682696,
        -63.215
      ],
      [
        9.682996,
        -63.2083
      ],
      [
        9.677796,
        -63.2079
      ],
      [
        9.677596,
        -63.2146
      ],
      [
        9.682696,
        -63.215
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-BOL-001",
    "nombre": "Caripito Arriba - Plaza Bolívar",
    "casas": 540,
    "familias": 650,
    "habitantes": 2050,
    "votantes": 1370,
    "centroVotacion": "Liceo Pedro Gual",
    "cobertura": 100,
    "munId": "bolivar",
    "munNombre": "Bolívar",
    "parishId": "caripito",
    "parishNombre": "Caripito",
    "subParroquiaId": "sub-bol-car-01",
    "subParroquiaNombre": "Eje 1 • San Rafael y Mercado",
    "centro": [
      9.7469,
      -63.1762
    ],
    "vertices": [
      [
        9.7494,
        -63.1797
      ],
      [
        9.7497,
        -63.173
      ],
      [
        9.7445,
        -63.1726
      ],
      [
        9.7443,
        -63.1793
      ],
      [
        9.7494,
        -63.1797
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-BOL-002",
    "nombre": "San Rafael de Caripito",
    "casas": 610,
    "familias": 730,
    "habitantes": 2320,
    "votantes": 1550,
    "centroVotacion": "E.B. San Rafael",
    "cobertura": 99,
    "munId": "bolivar",
    "munNombre": "Bolívar",
    "parishId": "caripito",
    "parishNombre": "Caripito",
    "subParroquiaId": "sub-bol-car-01",
    "subParroquiaNombre": "Eje 1 • San Rafael y Mercado",
    "centro": [
      9.752096,
      -63.1777
    ],
    "vertices": [
      [
        9.754596,
        -63.1812
      ],
      [
        9.754896,
        -63.1745
      ],
      [
        9.749696,
        -63.1741
      ],
      [
        9.749496,
        -63.1808
      ],
      [
        9.754596,
        -63.1812
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-BOL-003",
    "nombre": "El Rincón - Ribera del Río",
    "casas": 480,
    "familias": 580,
    "habitantes": 1820,
    "votantes": 1220,
    "centroVotacion": "U.E. El Rincón",
    "cobertura": 96,
    "munId": "bolivar",
    "munNombre": "Bolívar",
    "parishId": "caripito",
    "parishNombre": "Caripito",
    "subParroquiaId": "sub-bol-car-01",
    "subParroquiaNombre": "Eje 1 • San Rafael y Mercado",
    "centro": [
      9.753828,
      -63.1857
    ],
    "vertices": [
      [
        9.756328,
        -63.1892
      ],
      [
        9.756628,
        -63.1825
      ],
      [
        9.751428,
        -63.1821
      ],
      [
        9.751228,
        -63.1888
      ],
      [
        9.756328,
        -63.1892
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-BOL-004",
    "nombre": "Caripito Abajo",
    "casas": 590,
    "familias": 710,
    "habitantes": 2240,
    "votantes": 1500,
    "centroVotacion": "E.B. Caripito Abajo",
    "cobertura": 98,
    "munId": "bolivar",
    "munNombre": "Bolívar",
    "parishId": "caripito",
    "parishNombre": "Caripito",
    "subParroquiaId": "sub-bol-car-02",
    "subParroquiaNombre": "Eje 2 • Caripito Abajo y Kilómetro 4",
    "centro": [
      9.748818,
      -63.176812
    ],
    "vertices": [
      [
        9.751318,
        -63.180312
      ],
      [
        9.751618,
        -63.173612
      ],
      [
        9.746418,
        -63.173212
      ],
      [
        9.746218,
        -63.179912
      ],
      [
        9.751318,
        -63.180312
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-BOL-005",
    "nombre": "Kilómetro 4 y Las Parcelas",
    "casas": 430,
    "familias": 520,
    "habitantes": 1630,
    "votantes": 1090,
    "centroVotacion": "U.E. Km 4",
    "cobertura": 97,
    "munId": "bolivar",
    "munNombre": "Bolívar",
    "parishId": "caripito",
    "parishNombre": "Caripito",
    "subParroquiaId": "sub-bol-car-02",
    "subParroquiaNombre": "Eje 2 • Caripito Abajo y Kilómetro 4",
    "centro": [
      9.752898,
      -63.181035
    ],
    "vertices": [
      [
        9.755398,
        -63.184535
      ],
      [
        9.755698,
        -63.177835
      ],
      [
        9.750498,
        -63.177435
      ],
      [
        9.750298,
        -63.184135
      ],
      [
        9.755398,
        -63.184535
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-BOL-006",
    "nombre": "San Antonio Casco",
    "casas": 380,
    "familias": 460,
    "habitantes": 1440,
    "votantes": 960,
    "centroVotacion": "E.B. San Antonio",
    "cobertura": 98,
    "munId": "bolivar",
    "munNombre": "Bolívar",
    "parishId": "san-antonio-bolivar",
    "parishNombre": "San Antonio de Caripito",
    "subParroquiaId": "sub-bol-san-01",
    "subParroquiaNombre": "Eje 1 • San Antonio y Caño de Cruz",
    "centro": [
      9.7469,
      -63.1762
    ],
    "vertices": [
      [
        9.7494,
        -63.1797
      ],
      [
        9.7497,
        -63.173
      ],
      [
        9.7445,
        -63.1726
      ],
      [
        9.7443,
        -63.1793
      ],
      [
        9.7494,
        -63.1797
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-BOL-007",
    "nombre": "Caño de Cruz Agrícola",
    "casas": 290,
    "familias": 350,
    "habitantes": 1100,
    "votantes": 740,
    "centroVotacion": "U.E. Caño de Cruz",
    "cobertura": 95,
    "munId": "bolivar",
    "munNombre": "Bolívar",
    "parishId": "san-antonio-bolivar",
    "parishNombre": "San Antonio de Caripito",
    "subParroquiaId": "sub-bol-san-01",
    "subParroquiaNombre": "Eje 1 • San Antonio y Caño de Cruz",
    "centro": [
      9.752096,
      -63.1777
    ],
    "vertices": [
      [
        9.754596,
        -63.1812
      ],
      [
        9.754896,
        -63.1745
      ],
      [
        9.749696,
        -63.1741
      ],
      [
        9.749496,
        -63.1808
      ],
      [
        9.754596,
        -63.1812
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-BOL-008",
    "nombre": "Candelaria Pueblo",
    "casas": 340,
    "familias": 410,
    "habitantes": 1290,
    "votantes": 860,
    "centroVotacion": "E.B. La Candelaria",
    "cobertura": 96,
    "munId": "bolivar",
    "munNombre": "Bolívar",
    "parishId": "la-candelaria-bolivar",
    "parishNombre": "La Candelaria",
    "subParroquiaId": "sub-bol-can-01",
    "subParroquiaNombre": "Eje 1 • La Candelaria y Quebrada Seca",
    "centro": [
      9.7469,
      -63.1762
    ],
    "vertices": [
      [
        9.7494,
        -63.1797
      ],
      [
        9.7497,
        -63.173
      ],
      [
        9.7445,
        -63.1726
      ],
      [
        9.7443,
        -63.1793
      ],
      [
        9.7494,
        -63.1797
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-ZAM-001",
    "nombre": "Punta de Mata Centro Comercial",
    "casas": 640,
    "familias": 770,
    "habitantes": 2430,
    "votantes": 1630,
    "centroVotacion": "Liceo Nacional Punta de Mata",
    "cobertura": 100,
    "munId": "ezequiel-zamora",
    "munNombre": "Ezequiel Zamora",
    "parishId": "punta-de-mata",
    "parishNombre": "Punta de Mata",
    "subParroquiaId": "sub-zam-pdm-01",
    "subParroquiaNombre": "Eje 1 • Punta de Mata Casco y 18 de Mayo",
    "centro": [
      9.7469,
      -63.1762
    ],
    "vertices": [
      [
        9.7494,
        -63.1797
      ],
      [
        9.7497,
        -63.173
      ],
      [
        9.7445,
        -63.1726
      ],
      [
        9.7443,
        -63.1793
      ],
      [
        9.7494,
        -63.1797
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-ZAM-002",
    "nombre": "18 de Mayo",
    "casas": 720,
    "familias": 870,
    "habitantes": 2740,
    "votantes": 1830,
    "centroVotacion": "E.B. 18 de Mayo",
    "cobertura": 99,
    "munId": "ezequiel-zamora",
    "munNombre": "Ezequiel Zamora",
    "parishId": "punta-de-mata",
    "parishNombre": "Punta de Mata",
    "subParroquiaId": "sub-zam-pdm-01",
    "subParroquiaNombre": "Eje 1 • Punta de Mata Casco y 18 de Mayo",
    "centro": [
      9.752096,
      -63.1777
    ],
    "vertices": [
      [
        9.754596,
        -63.1812
      ],
      [
        9.754896,
        -63.1745
      ],
      [
        9.749696,
        -63.1741
      ],
      [
        9.749496,
        -63.1808
      ],
      [
        9.754596,
        -63.1812
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-ZAM-003",
    "nombre": "La Arboleda Petrolera",
    "casas": 580,
    "familias": 700,
    "habitantes": 2200,
    "votantes": 1470,
    "centroVotacion": "Colegio Virgen del Valle",
    "cobertura": 98,
    "munId": "ezequiel-zamora",
    "munNombre": "Ezequiel Zamora",
    "parishId": "punta-de-mata",
    "parishNombre": "Punta de Mata",
    "subParroquiaId": "sub-zam-pdm-01",
    "subParroquiaNombre": "Eje 1 • Punta de Mata Casco y 18 de Mayo",
    "centro": [
      9.753828,
      -63.1857
    ],
    "vertices": [
      [
        9.756328,
        -63.1892
      ],
      [
        9.756628,
        -63.1825
      ],
      [
        9.751428,
        -63.1821
      ],
      [
        9.751228,
        -63.1888
      ],
      [
        9.756328,
        -63.1892
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-ZAM-004",
    "nombre": "El Bosque - La Esperanza",
    "casas": 530,
    "familias": 640,
    "habitantes": 2010,
    "votantes": 1350,
    "centroVotacion": "U.E. La Esperanza",
    "cobertura": 97,
    "munId": "ezequiel-zamora",
    "munNombre": "Ezequiel Zamora",
    "parishId": "punta-de-mata",
    "parishNombre": "Punta de Mata",
    "subParroquiaId": "sub-zam-pdm-01",
    "subParroquiaNombre": "Eje 1 • Punta de Mata Casco y 18 de Mayo",
    "centro": [
      9.7469,
      -63.1922
    ],
    "vertices": [
      [
        9.7494,
        -63.1957
      ],
      [
        9.7497,
        -63.189
      ],
      [
        9.7445,
        -63.1886
      ],
      [
        9.7443,
        -63.1953
      ],
      [
        9.7494,
        -63.1957
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-ZAM-005",
    "nombre": "Virgen del Carmen",
    "casas": 610,
    "familias": 730,
    "habitantes": 2320,
    "votantes": 1550,
    "centroVotacion": "E.B. Virgen del Carmen",
    "cobertura": 100,
    "munId": "ezequiel-zamora",
    "munNombre": "Ezequiel Zamora",
    "parishId": "punta-de-mata",
    "parishNombre": "Punta de Mata",
    "subParroquiaId": "sub-zam-pdm-02",
    "subParroquiaNombre": "Eje 2 • Virgen del Carmen y Morichalito",
    "centro": [
      9.748818,
      -63.176812
    ],
    "vertices": [
      [
        9.751318,
        -63.180312
      ],
      [
        9.751618,
        -63.173612
      ],
      [
        9.746418,
        -63.173212
      ],
      [
        9.746218,
        -63.179912
      ],
      [
        9.751318,
        -63.180312
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-ZAM-006",
    "nombre": "Morichalito Zamora",
    "casas": 490,
    "familias": 590,
    "habitantes": 1860,
    "votantes": 1250,
    "centroVotacion": "C.E.I. Morichalito",
    "cobertura": 98,
    "munId": "ezequiel-zamora",
    "munNombre": "Ezequiel Zamora",
    "parishId": "punta-de-mata",
    "parishNombre": "Punta de Mata",
    "subParroquiaId": "sub-zam-pdm-02",
    "subParroquiaNombre": "Eje 2 • Virgen del Carmen y Morichalito",
    "centro": [
      9.752898,
      -63.181035
    ],
    "vertices": [
      [
        9.755398,
        -63.184535
      ],
      [
        9.755698,
        -63.177835
      ],
      [
        9.750498,
        -63.177435
      ],
      [
        9.750298,
        -63.184135
      ],
      [
        9.755398,
        -63.184535
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-ZAM-007",
    "nombre": "El Tejero Casco Central",
    "casas": 560,
    "familias": 670,
    "habitantes": 2130,
    "votantes": 1420,
    "centroVotacion": "E.B. El Tejero",
    "cobertura": 100,
    "munId": "ezequiel-zamora",
    "munNombre": "Ezequiel Zamora",
    "parishId": "el-tejero",
    "parishNombre": "El Tejero",
    "subParroquiaId": "sub-zam-tej-01",
    "subParroquiaNombre": "Eje 1 • El Tejero Casco y Casupal",
    "centro": [
      9.685,
      -63.53
    ],
    "vertices": [
      [
        9.6875,
        -63.5335
      ],
      [
        9.6878,
        -63.5268
      ],
      [
        9.6826,
        -63.5264
      ],
      [
        9.6824,
        -63.5331
      ],
      [
        9.6875,
        -63.5335
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-ZAM-008",
    "nombre": "Casupal y Vía San Ramón",
    "casas": 410,
    "familias": 490,
    "habitantes": 1560,
    "votantes": 1040,
    "centroVotacion": "U.E. Casupal",
    "cobertura": 96,
    "munId": "ezequiel-zamora",
    "munNombre": "Ezequiel Zamora",
    "parishId": "el-tejero",
    "parishNombre": "El Tejero",
    "subParroquiaId": "sub-zam-tej-01",
    "subParroquiaNombre": "Eje 1 • El Tejero Casco y Casupal",
    "centro": [
      9.690196,
      -63.5315
    ],
    "vertices": [
      [
        9.692696,
        -63.535
      ],
      [
        9.692996,
        -63.5283
      ],
      [
        9.687796,
        -63.5279
      ],
      [
        9.687596,
        -63.5346
      ],
      [
        9.692696,
        -63.535
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-PIA-001",
    "nombre": "Aragua Casco Plaza Bolívar",
    "casas": 530,
    "familias": 640,
    "habitantes": 2010,
    "votantes": 1350,
    "centroVotacion": "Liceo Félix Armando Núñez",
    "cobertura": 100,
    "munId": "piar",
    "munNombre": "Piar",
    "parishId": "aragua-de-maturin",
    "parishNombre": "Aragua de Maturín",
    "subParroquiaId": "sub-pia-ara-01",
    "subParroquiaNombre": "Eje 1 • Aragua Centro y El Catuaro",
    "centro": [
      9.7469,
      -63.1762
    ],
    "vertices": [
      [
        9.7494,
        -63.1797
      ],
      [
        9.7497,
        -63.173
      ],
      [
        9.7445,
        -63.1726
      ],
      [
        9.7443,
        -63.1793
      ],
      [
        9.7494,
        -63.1797
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-PIA-002",
    "nombre": "El Catuaro Arriba",
    "casas": 420,
    "familias": 500,
    "habitantes": 1600,
    "votantes": 1070,
    "centroVotacion": "E.B. El Catuaro",
    "cobertura": 98,
    "munId": "piar",
    "munNombre": "Piar",
    "parishId": "aragua-de-maturin",
    "parishNombre": "Aragua de Maturín",
    "subParroquiaId": "sub-pia-ara-01",
    "subParroquiaNombre": "Eje 1 • Aragua Centro y El Catuaro",
    "centro": [
      9.752096,
      -63.1777
    ],
    "vertices": [
      [
        9.754596,
        -63.1812
      ],
      [
        9.754896,
        -63.1745
      ],
      [
        9.749696,
        -63.1741
      ],
      [
        9.749496,
        -63.1808
      ],
      [
        9.754596,
        -63.1812
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-PIA-003",
    "nombre": "Las Delicias de Aragua",
    "casas": 390,
    "familias": 470,
    "habitantes": 1480,
    "votantes": 990,
    "centroVotacion": "U.E. Las Delicias",
    "cobertura": 97,
    "munId": "piar",
    "munNombre": "Piar",
    "parishId": "aragua-de-maturin",
    "parishNombre": "Aragua de Maturín",
    "subParroquiaId": "sub-pia-ara-01",
    "subParroquiaNombre": "Eje 1 • Aragua Centro y El Catuaro",
    "centro": [
      9.753828,
      -63.1857
    ],
    "vertices": [
      [
        9.756328,
        -63.1892
      ],
      [
        9.756628,
        -63.1825
      ],
      [
        9.751428,
        -63.1821
      ],
      [
        9.751228,
        -63.1888
      ],
      [
        9.756328,
        -63.1892
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-PIA-004",
    "nombre": "Chaguaramal Centro",
    "casas": 440,
    "familias": 530,
    "habitantes": 1670,
    "votantes": 1120,
    "centroVotacion": "E.B. Chaguaramal",
    "cobertura": 99,
    "munId": "piar",
    "munNombre": "Piar",
    "parishId": "chaguaramal",
    "parishNombre": "Chaguaramal",
    "subParroquiaId": "sub-pia-cha-01",
    "subParroquiaNombre": "Eje 1 • Chaguaramal y Boquerón de Chaguaramal",
    "centro": [
      9.945,
      -63.41
    ],
    "vertices": [
      [
        9.9475,
        -63.4135
      ],
      [
        9.9478,
        -63.4068
      ],
      [
        9.9426,
        -63.4064
      ],
      [
        9.9424,
        -63.4131
      ],
      [
        9.9475,
        -63.4135
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-PIA-005",
    "nombre": "Boquerón de Chaguaramal",
    "casas": 310,
    "familias": 370,
    "habitantes": 1180,
    "votantes": 790,
    "centroVotacion": "U.E. Boquerón Piar",
    "cobertura": 96,
    "munId": "piar",
    "munNombre": "Piar",
    "parishId": "chaguaramal",
    "parishNombre": "Chaguaramal",
    "subParroquiaId": "sub-pia-cha-01",
    "subParroquiaNombre": "Eje 1 • Chaguaramal y Boquerón de Chaguaramal",
    "centro": [
      9.950196,
      -63.4115
    ],
    "vertices": [
      [
        9.952696,
        -63.415
      ],
      [
        9.952996,
        -63.4083
      ],
      [
        9.947796,
        -63.4079
      ],
      [
        9.947596,
        -63.4146
      ],
      [
        9.952696,
        -63.415
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-PIA-006",
    "nombre": "Guanaguana Pueblo Histórico",
    "casas": 410,
    "familias": 490,
    "habitantes": 1560,
    "votantes": 1040,
    "centroVotacion": "E.B. San Miguel Arcángel",
    "cobertura": 100,
    "munId": "piar",
    "munNombre": "Piar",
    "parishId": "guanaguana",
    "parishNombre": "Guanaguana",
    "subParroquiaId": "sub-pia-gua-01",
    "subParroquiaNombre": "Eje 1 • Guanaguana Histórica y Río Colorado",
    "centro": [
      10.055,
      -63.52
    ],
    "vertices": [
      [
        10.0575,
        -63.5235
      ],
      [
        10.0578,
        -63.5168
      ],
      [
        10.0526,
        -63.5164
      ],
      [
        10.0524,
        -63.5231
      ],
      [
        10.0575,
        -63.5235
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-PIA-007",
    "nombre": "Río Colorado de Guanaguana",
    "casas": 280,
    "familias": 340,
    "habitantes": 1060,
    "votantes": 710,
    "centroVotacion": "U.E. Río Colorado",
    "cobertura": 95,
    "munId": "piar",
    "munNombre": "Piar",
    "parishId": "guanaguana",
    "parishNombre": "Guanaguana",
    "subParroquiaId": "sub-pia-gua-01",
    "subParroquiaNombre": "Eje 1 • Guanaguana Histórica y Río Colorado",
    "centro": [
      10.060196,
      -63.5215
    ],
    "vertices": [
      [
        10.062696,
        -63.525
      ],
      [
        10.062996,
        -63.5183
      ],
      [
        10.057796,
        -63.5179
      ],
      [
        10.057596,
        -63.5246
      ],
      [
        10.062696,
        -63.525
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-PIA-008",
    "nombre": "Aparicio Casco",
    "casas": 350,
    "familias": 420,
    "habitantes": 1330,
    "votantes": 890,
    "centroVotacion": "E.B. Aparicio",
    "cobertura": 98,
    "munId": "piar",
    "munNombre": "Piar",
    "parishId": "aparicio",
    "parishNombre": "Aparicio",
    "subParroquiaId": "sub-pia-apa-01",
    "subParroquiaNombre": "Eje 1 • Aparicio Pueblo",
    "centro": [
      9.985,
      -63.56
    ],
    "vertices": [
      [
        9.9875,
        -63.5635
      ],
      [
        9.9878,
        -63.5568
      ],
      [
        9.9826,
        -63.5564
      ],
      [
        9.9824,
        -63.5631
      ],
      [
        9.9875,
        -63.5635
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-PIA-009",
    "nombre": "El Pinto Centro",
    "casas": 370,
    "familias": 440,
    "habitantes": 1410,
    "votantes": 940,
    "centroVotacion": "U.E. El Pinto",
    "cobertura": 98,
    "munId": "piar",
    "munNombre": "Piar",
    "parishId": "el-pinto",
    "parishNombre": "El Pinto",
    "subParroquiaId": "sub-pia-pin-01",
    "subParroquiaNombre": "Eje 1 • El Pinto y Sabana de El Pinto",
    "centro": [
      9.915,
      -63.47
    ],
    "vertices": [
      [
        9.9175,
        -63.4735
      ],
      [
        9.9178,
        -63.4668
      ],
      [
        9.9126,
        -63.4664
      ],
      [
        9.9124,
        -63.4731
      ],
      [
        9.9175,
        -63.4735
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-PIA-010",
    "nombre": "La Toscana Pueblo",
    "casas": 480,
    "familias": 580,
    "habitantes": 1820,
    "votantes": 1220,
    "centroVotacion": "E.B. La Toscana",
    "cobertura": 99,
    "munId": "piar",
    "munNombre": "Piar",
    "parishId": "la-toscana",
    "parishNombre": "La Toscana",
    "subParroquiaId": "sub-pia-tos-01",
    "subParroquiaNombre": "Eje 1 • La Toscana y Bajo Grande",
    "centro": [
      9.855,
      -63.42
    ],
    "vertices": [
      [
        9.8575,
        -63.4235
      ],
      [
        9.8578,
        -63.4168
      ],
      [
        9.8526,
        -63.4164
      ],
      [
        9.8524,
        -63.4231
      ],
      [
        9.8575,
        -63.4235
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-PIA-011",
    "nombre": "Bajo Grande Piar",
    "casas": 320,
    "familias": 380,
    "habitantes": 1220,
    "votantes": 810,
    "centroVotacion": "U.E. Bajo Grande",
    "cobertura": 96,
    "munId": "piar",
    "munNombre": "Piar",
    "parishId": "la-toscana",
    "parishNombre": "La Toscana",
    "subParroquiaId": "sub-pia-tos-01",
    "subParroquiaNombre": "Eje 1 • La Toscana y Bajo Grande",
    "centro": [
      9.860196,
      -63.4215
    ],
    "vertices": [
      [
        9.862696,
        -63.425
      ],
      [
        9.862996,
        -63.4183
      ],
      [
        9.857796,
        -63.4179
      ],
      [
        9.857596,
        -63.4246
      ],
      [
        9.862696,
        -63.425
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-PIA-012",
    "nombre": "Taguaya Pueblo",
    "casas": 290,
    "familias": 350,
    "habitantes": 1100,
    "votantes": 740,
    "centroVotacion": "E.B. Taguaya",
    "cobertura": 97,
    "munId": "piar",
    "munNombre": "Piar",
    "parishId": "taguaya",
    "parishNombre": "Taguaya",
    "subParroquiaId": "sub-pia-tag-01",
    "subParroquiaNombre": "Eje 1 • Taguaya Centro",
    "centro": [
      9.905,
      -63.35
    ],
    "vertices": [
      [
        9.9075,
        -63.3535
      ],
      [
        9.9078,
        -63.3468
      ],
      [
        9.9026,
        -63.3464
      ],
      [
        9.9024,
        -63.3531
      ],
      [
        9.9075,
        -63.3535
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-CAR-001",
    "nombre": "Caripe Casco Urbano",
    "casas": 560,
    "familias": 670,
    "habitantes": 2130,
    "votantes": 1420,
    "centroVotacion": "Liceo Nacional Caripe",
    "cobertura": 100,
    "munId": "caripe",
    "munNombre": "Caripe",
    "parishId": "caripe-cabecera",
    "parishNombre": "Caripe",
    "subParroquiaId": "sub-car-cen-01",
    "subParroquiaNombre": "Eje 1 • Caripe Casco Central y El Mirador",
    "centro": [
      9.7469,
      -63.1762
    ],
    "vertices": [
      [
        9.7494,
        -63.1797
      ],
      [
        9.7497,
        -63.173
      ],
      [
        9.7445,
        -63.1726
      ],
      [
        9.7443,
        -63.1793
      ],
      [
        9.7494,
        -63.1797
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-CAR-002",
    "nombre": "El Mirador y Las Margaritas",
    "casas": 410,
    "familias": 490,
    "habitantes": 1560,
    "votantes": 1040,
    "centroVotacion": "E.B. El Mirador",
    "cobertura": 99,
    "munId": "caripe",
    "munNombre": "Caripe",
    "parishId": "caripe-cabecera",
    "parishNombre": "Caripe",
    "subParroquiaId": "sub-car-cen-01",
    "subParroquiaNombre": "Eje 1 • Caripe Casco Central y El Mirador",
    "centro": [
      9.752096,
      -63.1777
    ],
    "vertices": [
      [
        9.754596,
        -63.1812
      ],
      [
        9.754896,
        -63.1745
      ],
      [
        9.749696,
        -63.1741
      ],
      [
        9.749496,
        -63.1808
      ],
      [
        9.754596,
        -63.1812
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-CAR-003",
    "nombre": "Bajo Hondo de Caripe",
    "casas": 370,
    "familias": 440,
    "habitantes": 1410,
    "votantes": 940,
    "centroVotacion": "U.E. Abraham Lincoln",
    "cobertura": 97,
    "munId": "caripe",
    "munNombre": "Caripe",
    "parishId": "caripe-cabecera",
    "parishNombre": "Caripe",
    "subParroquiaId": "sub-car-cen-01",
    "subParroquiaNombre": "Eje 1 • Caripe Casco Central y El Mirador",
    "centro": [
      9.753828,
      -63.1857
    ],
    "vertices": [
      [
        9.756328,
        -63.1892
      ],
      [
        9.756628,
        -63.1825
      ],
      [
        9.751428,
        -63.1821
      ],
      [
        9.751228,
        -63.1888
      ],
      [
        9.756328,
        -63.1892
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-CAR-004",
    "nombre": "El Guácharo Pueblo",
    "casas": 380,
    "familias": 460,
    "habitantes": 1440,
    "votantes": 960,
    "centroVotacion": "E.B. El Guácharo",
    "cobertura": 100,
    "munId": "caripe",
    "munNombre": "Caripe",
    "parishId": "el-guacharo",
    "parishNombre": "El Guácharo",
    "subParroquiaId": "sub-car-gua-01",
    "subParroquiaNombre": "Eje 1 • Cueva del Guácharo y Caseríos",
    "centro": [
      10.198,
      -63.55
    ],
    "vertices": [
      [
        10.2005,
        -63.5535
      ],
      [
        10.2008,
        -63.5468
      ],
      [
        10.1956,
        -63.5464
      ],
      [
        10.1954,
        -63.5531
      ],
      [
        10.2005,
        -63.5535
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-CAR-005",
    "nombre": "Caserío La Cueva",
    "casas": 260,
    "familias": 310,
    "habitantes": 990,
    "votantes": 660,
    "centroVotacion": "U.E. Humboldt",
    "cobertura": 98,
    "munId": "caripe",
    "munNombre": "Caripe",
    "parishId": "el-guacharo",
    "parishNombre": "El Guácharo",
    "subParroquiaId": "sub-car-gua-01",
    "subParroquiaNombre": "Eje 1 • Cueva del Guácharo y Caseríos",
    "centro": [
      10.203196,
      -63.5515
    ],
    "vertices": [
      [
        10.205696,
        -63.555
      ],
      [
        10.205996,
        -63.5483
      ],
      [
        10.200796,
        -63.5479
      ],
      [
        10.200596,
        -63.5546
      ],
      [
        10.205696,
        -63.555
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-CAR-006",
    "nombre": "Teresén Casco",
    "casas": 420,
    "familias": 500,
    "habitantes": 1600,
    "votantes": 1070,
    "centroVotacion": "E.B. Teresén",
    "cobertura": 98,
    "munId": "caripe",
    "munNombre": "Caripe",
    "parishId": "teresen",
    "parishNombre": "Teresén",
    "subParroquiaId": "sub-car-ter-01",
    "subParroquiaNombre": "Eje 1 • Teresén y Valle de Teresén",
    "centro": [
      10.145,
      -63.46
    ],
    "vertices": [
      [
        10.1475,
        -63.4635
      ],
      [
        10.1478,
        -63.4568
      ],
      [
        10.1426,
        -63.4564
      ],
      [
        10.1424,
        -63.4631
      ],
      [
        10.1475,
        -63.4635
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-CAR-007",
    "nombre": "La Cuchilla de Teresén",
    "casas": 290,
    "familias": 350,
    "habitantes": 1100,
    "votantes": 740,
    "centroVotacion": "U.E. La Cuchilla",
    "cobertura": 96,
    "munId": "caripe",
    "munNombre": "Caripe",
    "parishId": "teresen",
    "parishNombre": "Teresén",
    "subParroquiaId": "sub-car-ter-01",
    "subParroquiaNombre": "Eje 1 • Teresén y Valle de Teresén",
    "centro": [
      10.150196,
      -63.4615
    ],
    "vertices": [
      [
        10.152696,
        -63.465
      ],
      [
        10.152996,
        -63.4583
      ],
      [
        10.147796,
        -63.4579
      ],
      [
        10.147596,
        -63.4646
      ],
      [
        10.152696,
        -63.465
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-CAR-008",
    "nombre": "San Agustín Pueblo",
    "casas": 390,
    "familias": 470,
    "habitantes": 1480,
    "votantes": 990,
    "centroVotacion": "E.B. San Agustín",
    "cobertura": 99,
    "munId": "caripe",
    "munNombre": "Caripe",
    "parishId": "san-agustin",
    "parishNombre": "San Agustín",
    "subParroquiaId": "sub-car-agu-01",
    "subParroquiaNombre": "Eje 1 • San Agustín de las Hiedras",
    "centro": [
      10.165,
      -63.54
    ],
    "vertices": [
      [
        10.1675,
        -63.5435
      ],
      [
        10.1678,
        -63.5368
      ],
      [
        10.1626,
        -63.5364
      ],
      [
        10.1624,
        -63.5431
      ],
      [
        10.1675,
        -63.5435
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-CAR-009",
    "nombre": "La Guanota Casco",
    "casas": 330,
    "familias": 400,
    "habitantes": 1250,
    "votantes": 840,
    "centroVotacion": "E.B. La Guanota",
    "cobertura": 97,
    "munId": "caripe",
    "munNombre": "Caripe",
    "parishId": "la-guanota",
    "parishNombre": "La Guanota",
    "subParroquiaId": "sub-car-gua2-01",
    "subParroquiaNombre": "Eje 1 • La Guanota y Vía Santa Inés",
    "centro": [
      10.215,
      -63.5
    ],
    "vertices": [
      [
        10.2175,
        -63.5035
      ],
      [
        10.2178,
        -63.4968
      ],
      [
        10.2126,
        -63.4964
      ],
      [
        10.2124,
        -63.5031
      ],
      [
        10.2175,
        -63.5035
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-CAR-010",
    "nombre": "Sabana de Piedra Centro",
    "casas": 310,
    "familias": 370,
    "habitantes": 1180,
    "votantes": 790,
    "centroVotacion": "E.B. Sabana de Piedra",
    "cobertura": 96,
    "munId": "caripe",
    "munNombre": "Caripe",
    "parishId": "sabana-de-piedra",
    "parishNombre": "Sabana de Piedra",
    "subParroquiaId": "sub-car-pie-01",
    "subParroquiaNombre": "Eje 1 • Sabana de Piedra Pueblo",
    "centro": [
      10.235,
      -63.44
    ],
    "vertices": [
      [
        10.2375,
        -63.4435
      ],
      [
        10.2378,
        -63.4368
      ],
      [
        10.2326,
        -63.4364
      ],
      [
        10.2324,
        -63.4431
      ],
      [
        10.2375,
        -63.4435
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-CED-001",
    "nombre": "Caicara Centro Plaza Bolívar",
    "casas": 610,
    "familias": 730,
    "habitantes": 2320,
    "votantes": 1550,
    "centroVotacion": "Liceo Nacional Caicara",
    "cobertura": 100,
    "munId": "cedeno",
    "munNombre": "Cedeño",
    "parishId": "caicara",
    "parishNombre": "Caicara",
    "subParroquiaId": "sub-ced-cai-01",
    "subParroquiaNombre": "Eje 1 • Caicara Casco Histórico y El Mono",
    "centro": [
      9.7469,
      -63.1762
    ],
    "vertices": [
      [
        9.7494,
        -63.1797
      ],
      [
        9.7497,
        -63.173
      ],
      [
        9.7445,
        -63.1726
      ],
      [
        9.7443,
        -63.1793
      ],
      [
        9.7494,
        -63.1797
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-CED-002",
    "nombre": "Monódromo de Caicara",
    "casas": 490,
    "familias": 590,
    "habitantes": 1860,
    "votantes": 1250,
    "centroVotacion": "E.B. San Juan Bautista",
    "cobertura": 99,
    "munId": "cedeno",
    "munNombre": "Cedeño",
    "parishId": "caicara",
    "parishNombre": "Caicara",
    "subParroquiaId": "sub-ced-cai-01",
    "subParroquiaNombre": "Eje 1 • Caicara Casco Histórico y El Mono",
    "centro": [
      9.752096,
      -63.1777
    ],
    "vertices": [
      [
        9.754596,
        -63.1812
      ],
      [
        9.754896,
        -63.1745
      ],
      [
        9.749696,
        -63.1741
      ],
      [
        9.749496,
        -63.1808
      ],
      [
        9.754596,
        -63.1812
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-CED-003",
    "nombre": "La Manga de Coleo",
    "casas": 430,
    "familias": 520,
    "habitantes": 1630,
    "votantes": 1090,
    "centroVotacion": "U.E. Padre Juan",
    "cobertura": 98,
    "munId": "cedeno",
    "munNombre": "Cedeño",
    "parishId": "caicara",
    "parishNombre": "Caicara",
    "subParroquiaId": "sub-ced-cai-01",
    "subParroquiaNombre": "Eje 1 • Caicara Casco Histórico y El Mono",
    "centro": [
      9.753828,
      -63.1857
    ],
    "vertices": [
      [
        9.756328,
        -63.1892
      ],
      [
        9.756628,
        -63.1825
      ],
      [
        9.751428,
        -63.1821
      ],
      [
        9.751228,
        -63.1888
      ],
      [
        9.756328,
        -63.1892
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-CED-004",
    "nombre": "Areo Casco",
    "casas": 380,
    "familias": 460,
    "habitantes": 1440,
    "votantes": 960,
    "centroVotacion": "E.B. Areo",
    "cobertura": 98,
    "munId": "cedeno",
    "munNombre": "Cedeño",
    "parishId": "areo",
    "parishNombre": "Areo",
    "subParroquiaId": "sub-ced-are-01",
    "subParroquiaNombre": "Eje 1 • Areo Centro",
    "centro": [
      9.782,
      -63.74
    ],
    "vertices": [
      [
        9.7845,
        -63.7435
      ],
      [
        9.7848,
        -63.7368
      ],
      [
        9.7796,
        -63.7364
      ],
      [
        9.7794,
        -63.7431
      ],
      [
        9.7845,
        -63.7435
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-CED-005",
    "nombre": "San Félix Casco",
    "casas": 320,
    "familias": 380,
    "habitantes": 1220,
    "votantes": 810,
    "centroVotacion": "U.E. San Félix",
    "cobertura": 97,
    "munId": "cedeno",
    "munNombre": "Cedeño",
    "parishId": "san-felix-cedeno",
    "parishNombre": "San Félix de Cantauro",
    "subParroquiaId": "sub-ced-fel-01",
    "subParroquiaNombre": "Eje 1 • San Félix de Cantauro",
    "centro": [
      9.7469,
      -63.1762
    ],
    "vertices": [
      [
        9.7494,
        -63.1797
      ],
      [
        9.7497,
        -63.173
      ],
      [
        9.7445,
        -63.1726
      ],
      [
        9.7443,
        -63.1793
      ],
      [
        9.7494,
        -63.1797
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-CED-006",
    "nombre": "Viento Fresco Pueblo",
    "casas": 450,
    "familias": 540,
    "habitantes": 1710,
    "votantes": 1140,
    "centroVotacion": "E.B. Viento Fresco",
    "cobertura": 99,
    "munId": "cedeno",
    "munNombre": "Cedeño",
    "parishId": "viento-fresco",
    "parishNombre": "Viento Fresco",
    "subParroquiaId": "sub-ced-vie-01",
    "subParroquiaNombre": "Eje 1 • Viento Fresco y Caseríos",
    "centro": [
      9.712,
      -63.68
    ],
    "vertices": [
      [
        9.7145,
        -63.6835
      ],
      [
        9.7148,
        -63.6768
      ],
      [
        9.7096,
        -63.6764
      ],
      [
        9.7094,
        -63.6831
      ],
      [
        9.7145,
        -63.6835
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-LIB-001",
    "nombre": "Temblador Casco Urbano",
    "casas": 630,
    "familias": 760,
    "habitantes": 2390,
    "votantes": 1600,
    "centroVotacion": "Liceo Nacional Temblador",
    "cobertura": 100,
    "munId": "libertador",
    "munNombre": "Libertador",
    "parishId": "temblador",
    "parishNombre": "Temblador",
    "subParroquiaId": "sub-lib-tem-01",
    "subParroquiaNombre": "Eje 1 • Temblador Centro y Las Brisas",
    "centro": [
      9.7469,
      -63.1762
    ],
    "vertices": [
      [
        9.7494,
        -63.1797
      ],
      [
        9.7497,
        -63.173
      ],
      [
        9.7445,
        -63.1726
      ],
      [
        9.7443,
        -63.1793
      ],
      [
        9.7494,
        -63.1797
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-LIB-002",
    "nombre": "Las Brisas de Temblador",
    "casas": 520,
    "familias": 620,
    "habitantes": 1980,
    "votantes": 1320,
    "centroVotacion": "E.B. Las Brisas",
    "cobertura": 98,
    "munId": "libertador",
    "munNombre": "Libertador",
    "parishId": "temblador",
    "parishNombre": "Temblador",
    "subParroquiaId": "sub-lib-tem-01",
    "subParroquiaNombre": "Eje 1 • Temblador Centro y Las Brisas",
    "centro": [
      9.752096,
      -63.1777
    ],
    "vertices": [
      [
        9.754596,
        -63.1812
      ],
      [
        9.754896,
        -63.1745
      ],
      [
        9.749696,
        -63.1741
      ],
      [
        9.749496,
        -63.1808
      ],
      [
        9.754596,
        -63.1812
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-LIB-003",
    "nombre": "Guanipa Residencial",
    "casas": 440,
    "familias": 530,
    "habitantes": 1670,
    "votantes": 1120,
    "centroVotacion": "U.E. Guanipa",
    "cobertura": 99,
    "munId": "libertador",
    "munNombre": "Libertador",
    "parishId": "temblador",
    "parishNombre": "Temblador",
    "subParroquiaId": "sub-lib-tem-01",
    "subParroquiaNombre": "Eje 1 • Temblador Centro y Las Brisas",
    "centro": [
      9.753828,
      -63.1857
    ],
    "vertices": [
      [
        9.756328,
        -63.1892
      ],
      [
        9.756628,
        -63.1825
      ],
      [
        9.751428,
        -63.1821
      ],
      [
        9.751228,
        -63.1888
      ],
      [
        9.756328,
        -63.1892
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-LIB-004",
    "nombre": "Tabasca Centro",
    "casas": 360,
    "familias": 430,
    "habitantes": 1370,
    "votantes": 910,
    "centroVotacion": "E.B. Tabasca",
    "cobertura": 98,
    "munId": "libertador",
    "munNombre": "Libertador",
    "parishId": "tabasca",
    "parishNombre": "Tabasca",
    "subParroquiaId": "sub-lib-tab-01",
    "subParroquiaNombre": "Eje 1 • Tabasca Comunidades",
    "centro": [
      9.155,
      -62.61
    ],
    "vertices": [
      [
        9.1575,
        -62.6135
      ],
      [
        9.1578,
        -62.6068
      ],
      [
        9.1526,
        -62.6064
      ],
      [
        9.1524,
        -62.6131
      ],
      [
        9.1575,
        -62.6135
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-LIB-005",
    "nombre": "Las Albarradas Pueblo",
    "casas": 310,
    "familias": 370,
    "habitantes": 1180,
    "votantes": 790,
    "centroVotacion": "U.E. Las Albarradas",
    "cobertura": 96,
    "munId": "libertador",
    "munNombre": "Libertador",
    "parishId": "las-albarradas",
    "parishNombre": "Las Albarradas",
    "subParroquiaId": "sub-lib-alb-01",
    "subParroquiaNombre": "Eje 1 • Las Albarradas Caserío",
    "centro": [
      9.7469,
      -63.1762
    ],
    "vertices": [
      [
        9.7494,
        -63.1797
      ],
      [
        9.7497,
        -63.173
      ],
      [
        9.7445,
        -63.1726
      ],
      [
        9.7443,
        -63.1793
      ],
      [
        9.7494,
        -63.1797
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-LIB-006",
    "nombre": "Chaguaramas Casco",
    "casas": 410,
    "familias": 490,
    "habitantes": 1560,
    "votantes": 1040,
    "centroVotacion": "E.B. Chaguaramas Sur",
    "cobertura": 99,
    "munId": "libertador",
    "munNombre": "Libertador",
    "parishId": "chaguaramas",
    "parishNombre": "Chaguaramas",
    "subParroquiaId": "sub-lib-cha-01",
    "subParroquiaNombre": "Eje 1 • Chaguaramas y Morichal Petrolero",
    "centro": [
      9.095,
      -62.67
    ],
    "vertices": [
      [
        9.0975,
        -62.6735
      ],
      [
        9.0978,
        -62.6668
      ],
      [
        9.0926,
        -62.6664
      ],
      [
        9.0924,
        -62.6731
      ],
      [
        9.0975,
        -62.6735
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-PUN-001",
    "nombre": "Quiriquire Casco Central",
    "casas": 570,
    "familias": 680,
    "habitantes": 2170,
    "votantes": 1450,
    "centroVotacion": "Liceo Nacional Quiriquire",
    "cobertura": 100,
    "munId": "punceres",
    "munNombre": "Punceres",
    "parishId": "quiriquire",
    "parishNombre": "Quiriquire",
    "subParroquiaId": "sub-pun-qui-01",
    "subParroquiaNombre": "Eje 1 • Quiriquire Centro y Campo Rojo",
    "centro": [
      9.7469,
      -63.1762
    ],
    "vertices": [
      [
        9.7494,
        -63.1797
      ],
      [
        9.7497,
        -63.173
      ],
      [
        9.7445,
        -63.1726
      ],
      [
        9.7443,
        -63.1793
      ],
      [
        9.7494,
        -63.1797
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-PUN-002",
    "nombre": "Campo Rojo Petrolero",
    "casas": 490,
    "familias": 590,
    "habitantes": 1860,
    "votantes": 1250,
    "centroVotacion": "E.B. Campo Rojo",
    "cobertura": 98,
    "munId": "punceres",
    "munNombre": "Punceres",
    "parishId": "quiriquire",
    "parishNombre": "Quiriquire",
    "subParroquiaId": "sub-pun-qui-01",
    "subParroquiaNombre": "Eje 1 • Quiriquire Centro y Campo Rojo",
    "centro": [
      9.752096,
      -63.1777
    ],
    "vertices": [
      [
        9.754596,
        -63.1812
      ],
      [
        9.754896,
        -63.1745
      ],
      [
        9.749696,
        -63.1741
      ],
      [
        9.749496,
        -63.1808
      ],
      [
        9.754596,
        -63.1812
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-PUN-003",
    "nombre": "Miraflores de Punceres",
    "casas": 420,
    "familias": 500,
    "habitantes": 1600,
    "votantes": 1070,
    "centroVotacion": "U.E. Miraflores",
    "cobertura": 97,
    "munId": "punceres",
    "munNombre": "Punceres",
    "parishId": "quiriquire",
    "parishNombre": "Quiriquire",
    "subParroquiaId": "sub-pun-qui-01",
    "subParroquiaNombre": "Eje 1 • Quiriquire Centro y Campo Rojo",
    "centro": [
      9.753828,
      -63.1857
    ],
    "vertices": [
      [
        9.756328,
        -63.1892
      ],
      [
        9.756628,
        -63.1825
      ],
      [
        9.751428,
        -63.1821
      ],
      [
        9.751228,
        -63.1888
      ],
      [
        9.756328,
        -63.1892
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-PUN-004",
    "nombre": "Cachipo Centro",
    "casas": 390,
    "familias": 470,
    "habitantes": 1480,
    "votantes": 990,
    "centroVotacion": "E.B. Cachipo",
    "cobertura": 99,
    "munId": "punceres",
    "munNombre": "Punceres",
    "parishId": "cachipo",
    "parishNombre": "Cachipo",
    "subParroquiaId": "sub-pun-cac-01",
    "subParroquiaNombre": "Eje 1 • Cachipo Pueblo",
    "centro": [
      9.915,
      -63.23
    ],
    "vertices": [
      [
        9.9175,
        -63.2335
      ],
      [
        9.9178,
        -63.2268
      ],
      [
        9.9126,
        -63.2264
      ],
      [
        9.9124,
        -63.2331
      ],
      [
        9.9175,
        -63.2335
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-SOT-001",
    "nombre": "Malecón del Río Orinoco",
    "casas": 610,
    "familias": 730,
    "habitantes": 2320,
    "votantes": 1550,
    "centroVotacion": "Liceo Nacional Barrancas",
    "cobertura": 100,
    "munId": "sotillo",
    "munNombre": "Sotillo",
    "parishId": "barrancas",
    "parishNombre": "Barrancas del Orinoco",
    "subParroquiaId": "sub-sot-bar-01",
    "subParroquiaNombre": "Eje 1 • Barrancas Malecón y Centro",
    "centro": [
      9.7469,
      -63.1762
    ],
    "vertices": [
      [
        9.7494,
        -63.1797
      ],
      [
        9.7497,
        -63.173
      ],
      [
        9.7445,
        -63.1726
      ],
      [
        9.7443,
        -63.1793
      ],
      [
        9.7494,
        -63.1797
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-SOT-002",
    "nombre": "Casco Histórico San Rafael",
    "casas": 540,
    "familias": 650,
    "habitantes": 2050,
    "votantes": 1370,
    "centroVotacion": "E.B. Cacique Uyapari",
    "cobertura": 99,
    "munId": "sotillo",
    "munNombre": "Sotillo",
    "parishId": "barrancas",
    "parishNombre": "Barrancas del Orinoco",
    "subParroquiaId": "sub-sot-bar-01",
    "subParroquiaNombre": "Eje 1 • Barrancas Malecón y Centro",
    "centro": [
      9.752096,
      -63.1777
    ],
    "vertices": [
      [
        9.754596,
        -63.1812
      ],
      [
        9.754896,
        -63.1745
      ],
      [
        9.749696,
        -63.1741
      ],
      [
        9.749496,
        -63.1808
      ],
      [
        9.754596,
        -63.1812
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-SOT-003",
    "nombre": "La Playita de Barrancas",
    "casas": 430,
    "familias": 520,
    "habitantes": 1630,
    "votantes": 1090,
    "centroVotacion": "U.E. La Playita",
    "cobertura": 97,
    "munId": "sotillo",
    "munNombre": "Sotillo",
    "parishId": "barrancas",
    "parishNombre": "Barrancas del Orinoco",
    "subParroquiaId": "sub-sot-bar-01",
    "subParroquiaNombre": "Eje 1 • Barrancas Malecón y Centro",
    "centro": [
      9.753828,
      -63.1857
    ],
    "vertices": [
      [
        9.756328,
        -63.1892
      ],
      [
        9.756628,
        -63.1825
      ],
      [
        9.751428,
        -63.1821
      ],
      [
        9.751228,
        -63.1888
      ],
      [
        9.756328,
        -63.1892
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-SOT-004",
    "nombre": "Los Barrancos Centro",
    "casas": 480,
    "familias": 580,
    "habitantes": 1820,
    "votantes": 1220,
    "centroVotacion": "E.B. Los Barrancos",
    "cobertura": 99,
    "munId": "sotillo",
    "munNombre": "Sotillo",
    "parishId": "los-barrancos-fajardo",
    "parishNombre": "Los Barrancos de Fajardo",
    "subParroquiaId": "sub-sot-faj-01",
    "subParroquiaNombre": "Eje 1 • Los Barrancos y San Carlos",
    "centro": [
      9.7469,
      -63.1762
    ],
    "vertices": [
      [
        9.7494,
        -63.1797
      ],
      [
        9.7497,
        -63.173
      ],
      [
        9.7445,
        -63.1726
      ],
      [
        9.7443,
        -63.1793
      ],
      [
        9.7494,
        -63.1797
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-SOT-005",
    "nombre": "San Carlos del Orinoco",
    "casas": 360,
    "familias": 430,
    "habitantes": 1370,
    "votantes": 910,
    "centroVotacion": "U.E. San Carlos",
    "cobertura": 96,
    "munId": "sotillo",
    "munNombre": "Sotillo",
    "parishId": "los-barrancos-fajardo",
    "parishNombre": "Los Barrancos de Fajardo",
    "subParroquiaId": "sub-sot-faj-01",
    "subParroquiaNombre": "Eje 1 • Los Barrancos y San Carlos",
    "centro": [
      9.752096,
      -63.1777
    ],
    "vertices": [
      [
        9.754596,
        -63.1812
      ],
      [
        9.754896,
        -63.1745
      ],
      [
        9.749696,
        -63.1741
      ],
      [
        9.749496,
        -63.1808
      ],
      [
        9.754596,
        -63.1812
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-ACO-001",
    "nombre": "San Antonio Centro",
    "casas": 540,
    "familias": 650,
    "habitantes": 2050,
    "votantes": 1370,
    "centroVotacion": "Liceo Nacional San Antonio",
    "cobertura": 100,
    "munId": "acosta",
    "munNombre": "Acosta",
    "parishId": "san-antonio-acosta",
    "parishNombre": "San Antonio de Capayacuar",
    "subParroquiaId": "sub-aco-san-01",
    "subParroquiaNombre": "Eje 1 • San Antonio Casco y El Rincón",
    "centro": [
      9.7469,
      -63.1762
    ],
    "vertices": [
      [
        9.7494,
        -63.1797
      ],
      [
        9.7497,
        -63.173
      ],
      [
        9.7445,
        -63.1726
      ],
      [
        9.7443,
        -63.1793
      ],
      [
        9.7494,
        -63.1797
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-ACO-002",
    "nombre": "El Rincón de Acosta",
    "casas": 410,
    "familias": 490,
    "habitantes": 1560,
    "votantes": 1040,
    "centroVotacion": "E.B. El Rincón",
    "cobertura": 98,
    "munId": "acosta",
    "munNombre": "Acosta",
    "parishId": "san-antonio-acosta",
    "parishNombre": "San Antonio de Capayacuar",
    "subParroquiaId": "sub-aco-san-01",
    "subParroquiaNombre": "Eje 1 • San Antonio Casco y El Rincón",
    "centro": [
      9.752096,
      -63.1777
    ],
    "vertices": [
      [
        9.754596,
        -63.1812
      ],
      [
        9.754896,
        -63.1745
      ],
      [
        9.749696,
        -63.1741
      ],
      [
        9.749496,
        -63.1808
      ],
      [
        9.754596,
        -63.1812
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-ACO-003",
    "nombre": "Las Cocuizas de Capayacuar",
    "casas": 370,
    "familias": 440,
    "habitantes": 1410,
    "votantes": 940,
    "centroVotacion": "U.E. Capayacuar",
    "cobertura": 97,
    "munId": "acosta",
    "munNombre": "Acosta",
    "parishId": "san-antonio-acosta",
    "parishNombre": "San Antonio de Capayacuar",
    "subParroquiaId": "sub-aco-san-01",
    "subParroquiaNombre": "Eje 1 • San Antonio Casco y El Rincón",
    "centro": [
      9.753828,
      -63.1857
    ],
    "vertices": [
      [
        9.756328,
        -63.1892
      ],
      [
        9.756628,
        -63.1825
      ],
      [
        9.751428,
        -63.1821
      ],
      [
        9.751228,
        -63.1888
      ],
      [
        9.756328,
        -63.1892
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-ACO-004",
    "nombre": "San Francisco de Acosta",
    "casas": 360,
    "familias": 430,
    "habitantes": 1370,
    "votantes": 910,
    "centroVotacion": "E.B. San Francisco",
    "cobertura": 98,
    "munId": "acosta",
    "munNombre": "Acosta",
    "parishId": "san-francisco-acosta",
    "parishNombre": "San Francisco",
    "subParroquiaId": "sub-aco-fra-01",
    "subParroquiaNombre": "Eje 1 • San Francisco Caserío",
    "centro": [
      9.7469,
      -63.1762
    ],
    "vertices": [
      [
        9.7494,
        -63.1797
      ],
      [
        9.7497,
        -63.173
      ],
      [
        9.7445,
        -63.1726
      ],
      [
        9.7443,
        -63.1793
      ],
      [
        9.7494,
        -63.1797
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-AGU-001",
    "nombre": "Aguasay Casco Histórico (Curagua)",
    "casas": 580,
    "familias": 700,
    "habitantes": 2200,
    "votantes": 1470,
    "centroVotacion": "Liceo Nacional Aguasay",
    "cobertura": 100,
    "munId": "aguasay",
    "munNombre": "Aguasay",
    "parishId": "aguasay-parroquia",
    "parishNombre": "Aguasay",
    "subParroquiaId": "sub-agu-01",
    "subParroquiaNombre": "Eje 1 • Aguasay Centro y La Pulvia",
    "centro": [
      9.7469,
      -63.1762
    ],
    "vertices": [
      [
        9.7494,
        -63.1797
      ],
      [
        9.7497,
        -63.173
      ],
      [
        9.7445,
        -63.1726
      ],
      [
        9.7443,
        -63.1793
      ],
      [
        9.7494,
        -63.1797
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-AGU-002",
    "nombre": "La Pulvia Artesanal",
    "casas": 460,
    "familias": 550,
    "habitantes": 1750,
    "votantes": 1170,
    "centroVotacion": "E.B. La Pulvia",
    "cobertura": 99,
    "munId": "aguasay",
    "munNombre": "Aguasay",
    "parishId": "aguasay-parroquia",
    "parishNombre": "Aguasay",
    "subParroquiaId": "sub-agu-01",
    "subParroquiaNombre": "Eje 1 • Aguasay Centro y La Pulvia",
    "centro": [
      9.752096,
      -63.1777
    ],
    "vertices": [
      [
        9.754596,
        -63.1812
      ],
      [
        9.754896,
        -63.1745
      ],
      [
        9.749696,
        -63.1741
      ],
      [
        9.749496,
        -63.1808
      ],
      [
        9.754596,
        -63.1812
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-AGU-003",
    "nombre": "El Guamo y Arenas",
    "casas": 390,
    "familias": 470,
    "habitantes": 1480,
    "votantes": 990,
    "centroVotacion": "U.E. El Guamo",
    "cobertura": 97,
    "munId": "aguasay",
    "munNombre": "Aguasay",
    "parishId": "aguasay-parroquia",
    "parishNombre": "Aguasay",
    "subParroquiaId": "sub-agu-01",
    "subParroquiaNombre": "Eje 1 • Aguasay Centro y La Pulvia",
    "centro": [
      9.753828,
      -63.1857
    ],
    "vertices": [
      [
        9.756328,
        -63.1892
      ],
      [
        9.756628,
        -63.1825
      ],
      [
        9.751428,
        -63.1821
      ],
      [
        9.751228,
        -63.1888
      ],
      [
        9.756328,
        -63.1892
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-STB-001",
    "nombre": "Santa Bárbara Centro",
    "casas": 590,
    "familias": 710,
    "habitantes": 2240,
    "votantes": 1500,
    "centroVotacion": "Liceo Nacional Santa Bárbara",
    "cobertura": 100,
    "munId": "santa-barbara",
    "munNombre": "Santa Bárbara",
    "parishId": "santa-barbara-parroquia",
    "parishNombre": "Santa Bárbara",
    "subParroquiaId": "sub-stb-01",
    "subParroquiaNombre": "Eje 1 • Santa Bárbara Casco y Morón",
    "centro": [
      9.7469,
      -63.1762
    ],
    "vertices": [
      [
        9.7494,
        -63.1797
      ],
      [
        9.7497,
        -63.173
      ],
      [
        9.7445,
        -63.1726
      ],
      [
        9.7443,
        -63.1793
      ],
      [
        9.7494,
        -63.1797
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-STB-002",
    "nombre": "Morón de Santa Bárbara",
    "casas": 470,
    "familias": 560,
    "habitantes": 1790,
    "votantes": 1200,
    "centroVotacion": "E.B. Morón",
    "cobertura": 98,
    "munId": "santa-barbara",
    "munNombre": "Santa Bárbara",
    "parishId": "santa-barbara-parroquia",
    "parishNombre": "Santa Bárbara",
    "subParroquiaId": "sub-stb-01",
    "subParroquiaNombre": "Eje 1 • Santa Bárbara Casco y Morón",
    "centro": [
      9.752096,
      -63.1777
    ],
    "vertices": [
      [
        9.754596,
        -63.1812
      ],
      [
        9.754896,
        -63.1745
      ],
      [
        9.749696,
        -63.1741
      ],
      [
        9.749496,
        -63.1808
      ],
      [
        9.754596,
        -63.1812
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-STB-003",
    "nombre": "Mamantonal y Las Lajas",
    "casas": 380,
    "familias": 460,
    "habitantes": 1440,
    "votantes": 960,
    "centroVotacion": "U.E. Mamantonal",
    "cobertura": 97,
    "munId": "santa-barbara",
    "munNombre": "Santa Bárbara",
    "parishId": "santa-barbara-parroquia",
    "parishNombre": "Santa Bárbara",
    "subParroquiaId": "sub-stb-01",
    "subParroquiaNombre": "Eje 1 • Santa Bárbara Casco y Morón",
    "centro": [
      9.753828,
      -63.1857
    ],
    "vertices": [
      [
        9.756328,
        -63.1892
      ],
      [
        9.756628,
        -63.1825
      ],
      [
        9.751428,
        -63.1821
      ],
      [
        9.751228,
        -63.1888
      ],
      [
        9.756328,
        -63.1892
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-URA-001",
    "nombre": "Uracoa Centro y Ribera",
    "casas": 520,
    "familias": 620,
    "habitantes": 1980,
    "votantes": 1320,
    "centroVotacion": "Liceo Nacional Uracoa",
    "cobertura": 100,
    "munId": "uracoa",
    "munNombre": "Uracoa",
    "parishId": "uracoa-parroquia",
    "parishNombre": "Uracoa",
    "subParroquiaId": "sub-ura-01",
    "subParroquiaNombre": "Eje 1 • Uracoa Malecón y Los Pilones",
    "centro": [
      9.7469,
      -63.1762
    ],
    "vertices": [
      [
        9.7494,
        -63.1797
      ],
      [
        9.7497,
        -63.173
      ],
      [
        9.7445,
        -63.1726
      ],
      [
        9.7443,
        -63.1793
      ],
      [
        9.7494,
        -63.1797
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-URA-002",
    "nombre": "Los Pilones y Varadero",
    "casas": 410,
    "familias": 490,
    "habitantes": 1560,
    "votantes": 1040,
    "centroVotacion": "E.B. Los Pilones",
    "cobertura": 98,
    "munId": "uracoa",
    "munNombre": "Uracoa",
    "parishId": "uracoa-parroquia",
    "parishNombre": "Uracoa",
    "subParroquiaId": "sub-ura-01",
    "subParroquiaNombre": "Eje 1 • Uracoa Malecón y Los Pilones",
    "centro": [
      9.752096,
      -63.1777
    ],
    "vertices": [
      [
        9.754596,
        -63.1812
      ],
      [
        9.754896,
        -63.1745
      ],
      [
        9.749696,
        -63.1741
      ],
      [
        9.749496,
        -63.1808
      ],
      [
        9.754596,
        -63.1812
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  },
  {
    "id": "POL-URA-003",
    "nombre": "Punta de Barquis y El Chorro",
    "casas": 340,
    "familias": 410,
    "habitantes": 1290,
    "votantes": 860,
    "centroVotacion": "U.E. Punta de Barquis",
    "cobertura": 96,
    "munId": "uracoa",
    "munNombre": "Uracoa",
    "parishId": "uracoa-parroquia",
    "parishNombre": "Uracoa",
    "subParroquiaId": "sub-ura-01",
    "subParroquiaNombre": "Eje 1 • Uracoa Malecón y Los Pilones",
    "centro": [
      9.753828,
      -63.1857
    ],
    "vertices": [
      [
        9.756328,
        -63.1892
      ],
      [
        9.756628,
        -63.1825
      ],
      [
        9.751428,
        -63.1821
      ],
      [
        9.751228,
        -63.1888
      ],
      [
        9.756328,
        -63.1892
      ]
    ],
    "colorBorde": "#38bdf8",
    "anchoBorde": 2,
    "colorRelleno": "#0284c7",
    "opacidad": 0.32,
    "visible": true
  }
];

export function getMunicipios() {
  return MONAGAS_TERRITORIO_COMPLETO.map(m => ({
    id: m.id,
    nombre: m.nombre,
    capital: m.capital,
    parroquiasCount: m.parroquias.length
  }));
}

export function getParroquiasByMun(munId) {
  const m = MONAGAS_TERRITORIO_COMPLETO.find(mun => mun.id === munId);
  if (!m) return [];
  return m.parroquias.map(p => ({
    id: p.id,
    nombre: p.nombre,
    tipo: p.tipo,
    centro: p.centro,
    subparroquiasCount: p.subparroquias.length
  }));
}

export function getEjesByParish(munId, parishId) {
  try {
    if (!munId || !parishId) return [];
    const m = MONAGAS_TERRITORIO_COMPLETO.find(mun => mun.id === munId);
    if (!m || !Array.isArray(m.parroquias)) return [];
    
    // Normalizar ID para compatibilidad con alias y sufijos
    const norm = id => String(id).toLowerCase().replace(/-parroquia$|-cabecera$|-centro$|-cedeno$|-acosta$|-fajardo$|-de-maturin$/g, '').replace(/[^a-z0-9]/g, '');
    const pNorm = norm(parishId);
    
    const p = m.parroquias.find(par => {
      if (par.id === parishId) return true;
      if (norm(par.id) === pNorm) return true;
      if (par.nombre && String(par.nombre).toLowerCase() === String(parishId).toLowerCase()) return true;
      return false;
    });
    
    if (!p || !Array.isArray(p.subparroquias)) return [];
    return p.subparroquias.map(sp => ({
      id: sp.id,
      nombre: sp.nombre,
      codigo: sp.codigo || "",
      colorBorde: sp.colorBorde || "#38bdf8",
      colorRelleno: sp.colorRelleno || "#0284c7",
      sectoresCount: Array.isArray(sp.sectores) ? sp.sectores.length : 0,
      sectores: Array.isArray(sp.sectores) ? sp.sectores : []
    }));
  } catch (err) {
    console.warn("getEjesByParish error:", err);
    return [];
  }
}

export function getSectoresByEje(munId, parishId, ejeId) {
  try {
    const ejes = getEjesByParish(munId, parishId);
    const e = ejes.find(eje => eje.id === ejeId);
    return (e && Array.isArray(e.sectores)) ? e.sectores : [];
  } catch(err) {
    console.warn("getSectoresByEje error:", err);
    return [];
  }
}

export function getSectoresByParish(munId, parishId) {
  try {
    const ejes = getEjesByParish(munId, parishId);
    let list = [];
    if (Array.isArray(ejes)) {
      ejes.forEach(e => {
        if (Array.isArray(e.sectores)) {
          list = list.concat(e.sectores);
        }
      });
    }
    return list;
  } catch (err) {
    console.warn("getSectoresByParish error:", err);
    return [];
  }
}

export function findSectorById(secId) {
  if (!secId || !Array.isArray(ALL_SECTORES_FLAT)) return null;
  return ALL_SECTORES_FLAT.find(s => String(s.id) === String(secId));
}

export function searchSectores(query, munId = null, parishId = null) {
  if (!query || String(query).trim().length === 0) return [];
  const q = String(query).toLowerCase().trim();
  let pool = Array.isArray(ALL_SECTORES_FLAT) ? ALL_SECTORES_FLAT : [];
  if (munId) pool = pool.filter(s => s.munId === munId);
  if (parishId) pool = pool.filter(s => s.parishId === parishId);
  
  return pool.filter(s => {
    return (s.nombre || "").toLowerCase().includes(q) ||
           (s.centroVotacion || "").toLowerCase().includes(q) ||
           (s.parishNombre || "").toLowerCase().includes(q) ||
           (s.subParroquiaNombre || "").toLowerCase().includes(q);
  }).slice(0, 30);
}
