---
title: "Modulo Lamina Cartografica 120"
created: "2026-09-20 15:45:00"
updated: "2026-09-20 15:45:00"
tags: [modulos, lamina-120, cartografia, pizarra-tactica, migato-2026, exportacion-hd]
---
# Módulo Lámina Cartográfica Ejecutiva 120 Pulgadas

**Organización:** [[Identidad Institucional MIGATO y Liderazgo El Gato Briceno|MIGATO • Monagas 2026]]  
**Líder Regional:** José Gregorio "El Gato" Briceño  
**Responsable Técnico:** Ing. Diego Donado (Ciencia, Tecnología y Ciberdefensa)  
**Ubicación en Código:** `lamina-monagas/`  
**Producción Cloud:** [https://migato-maturin.vercel.app/lamina-monagas/](https://migato-maturin.vercel.app/lamina-monagas/)  
**Último Commit en Main:** `e999193`

---

## 1. Propósito y Arquitectura Técnica
Lienzo cartográfico satelital de alta resolución diseñado específicamente para pantallas táctiles de gran formato (120") y televisores de la **Sala Situacional Central MIGATO**:
- **Proporción Estricta:** Panorámica 16:9 horizontal (`100vw` × `100vh`).
- **Capas Base:** Google Satellite Híbrido HD con soporte activo CORS (`mt1.google.com/vt/lyrs=y`).
- **Velo Blanco Matemático (Spotlight Mask):** Polígono invertido `WORLD_BOX` con recorte dinámico (*hole*) centrado exactamente en el territorio seleccionado (Municipio, Parroquia, Sub-parroquia o Sector).
- **Jerarquía Territorial:** Integrado con el catálogo oficial de Monagas (13 Municipios, 44 Parroquias, centros CNE oficiales y sectores comunitarios).

---

## 2. Pizarra Táctica Digital (`whiteboard.js`)
Sistema de anotaciones a mano alzada para televisores táctiles y stylus sin interferir con la cartografía base:
- **Botón Discreto en Cabecera:** Cuadradito sobrio de 32×32px (`#btn-toggle-whiteboard`) situado al lado de *Descargar PNG*.
- **Paleta Táctica:** Amarillo neón (`#facc15`), Rojo táctico (`#ef4444`), Azul neón (`#38bdf8`) y Blanco puro (`#ffffff`).
- **Grosores Táctiles:** Trazo fino (3px), medio (6px) y grueso (12px).
- **Atajo de Teclado:** Soporte nativo para `Ctrl + Z` / `Cmd + Z` para deshacer trazos paso a paso.
- **Libertad de Zoom:** Zoom habilitado en todo momento mediante la rueda del ratón (`wheel`), botones de zoom `+` / `-` en la barra flotante y herramienta de desplazamiento *Mover Mapa* (`hand`).
- **Persistencia Visual:** Trazos fijados sobre el lienzo de visualización sin deformación al reencuadrar.

---

## 3. Motor de Captura y Exportación Silenciosa HD (`laminaApp.js`)
Generación de reportes gráficos panorámicos en 1 clic:
- **Formatos Disponibles:** Exportación Dual PNG Ultra HD y JPG optimizado para mensajería instantánea.
- **Normalización de Lienzos Leaflet:** Desvinculación de transformaciones 3D compuestas de Leaflet en `onclone` mediante `getBoundingClientRect()`, garantizando cobertura 100% del velo blanco sin recortes.
- **Previsión de Recorte Interno:** Forzado de `overflow: visible !important`, eliminación de clases `truncate` y padding vertical holgado en todas las tarjetas de métricas (`.metric-card`, `.metric-value`, `#lamina-side-panel`).
- **Pre-renderizado Tipográfico:** Sincronización con `document.fonts.ready` y preconnect de fuentes Google (*Public Sans*, *Outfit*, *JetBrains Mono*).

---

## 4. Conexiones Relacionadas en el Grafo
- [[Catalogo de Modulos Electorales]]
- [[Proyecto Sala Situacional]]
- [[Arquitectura Hibrida Nube y Boveda]]
- [[Identidad Institucional MIGATO y Liderazgo El Gato Briceno]]
- [[Estandar Oficial de Informes y Documentos DOCX]]
