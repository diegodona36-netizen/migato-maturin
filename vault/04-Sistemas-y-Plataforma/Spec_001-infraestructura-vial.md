---
aliases: [001-infraestructura-vial, Spec-001]
tags: [sdd, especificaciones, ingenieria, migato]
fecha: 2026-09-28
---

# [[MIGATO]] • Especificación 001-infraestructura-vial
*Enlace a la arquitectura central: [[Arquitectura_Sistemas_MIGATO]] | Conducción: [[José_Gregorio_El_Gato_Briceño]]*

# Spec 001 — Sistema de Diagnóstico e Infraestructura Vial
**Estado:** Completada y en Producción  
**Autor:** Ing. Diego Donado (Responsable de Ciberdefensa y Sistemas MIGATO)  
**Fecha:** 2026-09-28  
**Ruta del Módulo:** `vialidad-lapuente/`  

---

## 1. Contexto y Objetivo
El Estado Monagas sufre un deterioro crítico de su red vial urbana, troncal y agrícola por falta de mantenimiento y desidia gubernamental. El comando de campaña de **José Gregorio "El Gato" Briceño** requiere una plataforma web georreferenciada para realizar el inventario visual de fallas de pavimento, calzadas deterioradas, brocales sepultados y puentes en riesgo, generando datos auditables de ingeniería civil y archivos KML para Google Earth.

## 2. Usuarios y Actores Operativos
- **Inspector Técnico de Vialidad (Campo):** Registra el trazado de vías desde tablet o smartphone sobre capas satelitales híbridas.
- **Equipo de Arquitectura e Ingeniería Civil:** Analiza los estados físicos y patologías sin lidiar con siglas oscuras de topografía.
- **Sala Situacional MIGATO:** Monitorea los kilómetros evaluados y el porcentaje de calzada crítica/mala para presupuestos de gobierno.

## 3. Historias de Usuario
- **H1:** Como inspector técnico quiero trazar una calle punto a punto sobre el satélite para calcular su longitud métrica automáticamente sin encogimiento o deformación de líneas al hacer zoom.
- **H2:** Como evaluador quiero llenar un formulario guiado paso a paso tipo asistente para registrar el estado de la vía sin saturación visual.
- **H3:** Como analista de infraestructura quiero ver las distancias en metros y kilómetros claros (ej: "De 0 m a 329 m") para entender inmediatamente el recorrido sin siglas confusas.
- **H4:** Como usuario operativo quiero contar con un botón evidente `[🗑️ Eliminar Vía]` en cada tarjeta para descartar trazos erróneos rápidamente.

## 4. Requisitos Funcionales (Sintaxis EARS)
- **RF-01 (Ubicuo):** EL SISTEMA renderizará la cartografía vial mediante un lienzo Canvas acelerado por GPU (Leaflet Canvas) para asegurar rigidez geométrica absoluta en cualquier nivel de zoom.
- **RF-02 (Conducido por Evento):** CUANDO el usuario pulse "+ Trazar Vía / Calle" y haga clics sobre el mapa, EL SISTEMA dibujará una polilínea segmentada continua y actualizará el metraje en tiempo real en un banner flotante.
- **RF-03 (Conducido por Evento):** CUANDO el usuario finalice el trazo, EL SISTEMA desplegará el modal asistente progresivo (Wizard) iniciando obligatoriamente en el Paso 1.
- **RF-04 (De Estado):** MIENTRAS el asistente esté abierto, EL SISTEMA guiará la captura en 5 etapas secuenciales: (1) Nombre y recorrido en metros, (2) Jerarquía técnica y canales, (3) Condición general de pavimento (🟢, 🟡, 🟠, 🔴), (4) Patologías específicas según jerarquía, (5) Obras de arte/puentes, drenajes y foto.
- **RF-05 (Conducido por Evento):** CUANDO el usuario seleccione el estado físico en el Paso 3, EL SISTEMA avanzará automáticamente al Paso 4 con transición ergonómica suave.
- **RF-06 (Conducido por Evento):** CUANDO el usuario presione el botón `[🗑️ Eliminar Vía]`, EL SISTEMA solicitará confirmación directa y purgará la vía y sus tramos de la base de datos local y del mapa sin menús ocultos.
- **RF-07 (Ubicuo):** EL SISTEMA presentará todas las progresivas y distancias exclusivamente en formato humano ("De X m a Y m" o "X,XX km"), quedando prohibida la sigla "PK".
- **RF-08 (Excepción):** SI no hay conexión a internet disponible, EL SISTEMA persistirá todos los datos en `localStorage` sin interrupción de servicio.

## 5. Requisitos de Ergonomía e Interfaz (Constitución MIGATO)
- **RI-01:** Tipografía base de 16px (`text-base`) para títulos de tarjetas, etiquetas principales e inputs de formulario; 14px (`text-sm`) para especificaciones y métricas secundarias.
- **RI-02:** Identidad institucional alineada al portal: Logo oficial de MIGATO (`assets/logo-migato.png`) y mención de conducción política de José Gregorio "El Gato" Briceño.
- **RI-03:** Cero jerga chavista en descripciones, patologías o nombres de estructura.
- **RI-04:** Eliminación de duplicados visuales en la leyenda de estados físicos (un solo círculo estilizado por color).

## 6. Fuera de Alcance (Out of Scope)
- No se incluye en esta versión cálculo de presupuestos de asfalto en caliente por toneladas métricas (se derivará en la fase de exportación presupuestaria IUTIRLA).
- No se incluye edición de vértices geodésicos individuales una vez guardado el tramo (se editan los atributos técnicos y patologías).

## 7. Criterios de Finalización (Definition of Done)
- [x] Motor Leaflet Canvas implementado y operativo.
- [x] Asistente de 5 pasos tipo Google Forms / Odoo Wizard funcionando.
- [x] Sigla "PK" erradicada al 100% de la interfaz visual.
- [x] Botón directo de borrado `[🗑️ Eliminar Vía]` implementado en tarjetas laterales.
- [x] Tipografía de 16px/14px aplicada en todos los campos y componentes.
- [x] Exportador KML para Google Earth compatible con la nomenclatura MIGATO.
- [x] Desplegado y verificado en Vercel.
