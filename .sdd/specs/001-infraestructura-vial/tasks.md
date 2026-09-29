# Tareas 001 — Sistema de Diagnóstico e Infraestructura Vial
**Spec:** `spec.md` | **Plan:** `plan.md`  
**Progreso:** 9 / 9 Tareas Completadas (100%) — Producción  

---

## Fase 1 — Erradicación de PK y Nomenclatura Humana
- [x] **T01:** Refactorizar `RoadMapViewer.formatPK` para retornar distancias legibles en metros o kilómetros sin prefijo "PK".
  - *Verificación:* `RoadMapViewer.formatPK(329)` retorna `"329 m"`; `RoadMapViewer.formatPK(1850)` retorna `"1,85 km"`.
- [x] **T02:** Eliminar referencias a "PK" en `index.html` (encabezado del Wizard, campo de detalle, etiquetas de recorrido).
  - *Verificación:* Búsqueda textual confirma 0 ocurrencias de PK en texto visible de usuario.
- [x] **T03:** Saneamiento de cadenas heredadas en `localStorage` (eliminación de sufijos `(Sub-Tramo Único)` y `(Parte A)`).
  - *Verificación:* Los tramos cargados muestran nombres limpios tipo `Tramo 1`.

## Fase 2 — Identidad Institucional MIGATO y Liderazgo de El Gato Briceño
- [x] **T04:** Incorporar el logo oficial MIGATO (`assets/logo-migato.png`) en el navbar superior.
  - *Verificación:* Logo visible en 48x48px con enlace de retorno al portal central.
- [x] **T05:** Actualizar cintillo y títulos: "MIGATO • INFRAESTRUCTURA VIAL" y "Conducción José Gregorio 'El Gato' Briceño".
  - *Verificación:* Pestaña y header actualizados sin referencias a "Monagas 2026".

## Fase 3 — Ergonomía Visual y Tipografía 16px / 14px
- [x] **T06:** Aumentar tamaño de letra en inputs, selectores y títulos a 16px (`text-base py-3`) para evitar zoom no deseado en móviles.
  - *Verificación:* Clases Tailwind `text-base` presentes en todos los inputs del Wizard.
- [x] **T07:** Corregir el fallo de doble círculo en la leyenda de estados físicos.
  - *Verificación:* Se muestra exactamente un círculo coloreado por cada estado (Bueno, Regular, Malo, Crítico).

## Fase 4 — Acciones Directas y Despliegue
- [x] **T08:** Incorporar botón visible de eliminación directa `[🗑️ Eliminar Vía]` y botón `[+ Continuar Trazo]` en cada tarjeta.
  - *Verificación:* Al hacer clic en eliminar vía, se solicita confirmación y se borra de la lista y del mapa.
- [x] **T09:** Consolidar en Git (`commit d49d0f2`) y desplegar en producción Vercel.
  - *Verificación:* Desplegado con éxito en `https://migato-maturin.vercel.app/vialidad-lapuente/`.
