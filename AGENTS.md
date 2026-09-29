# AGENTS.md — MIGATO Monagas 2026

## 1. Proyecto
Ecosistema tecnológico territorial, electoral y de infraestructura del partido **MIGATO** en el Estado Monagas, Venezuela. El proyecto está al servicio de la conducción política de **José Gregorio "El Gato" Briceño** y la dirección técnica del **Ing. Diego Donado** (Responsable de Ciencia, Tecnología y Ciberdefensa).

## 2. Comandos Esenciales
- **Servidor Web Local:** `python3 -m http.server 8000`
- **Gestor SDD (Specs & Tareas):** `python3 scripts/sdd.py status`
- **Auditoría de Requisitos EARS:** `python3 scripts/sdd.py check <numero_spec>`
- **Exportación KML / Cartografía:** `python3 scripts/export_capa3_kml_geojson.py`
- **Generación de Informes IUTIRLA:** `python3 scripts/build_informe_academico_iutirla.py`

## 3. Estilo y Convenciones
- **Tecnologías:** JavaScript Vanilla ES Modules, HTML5 Canvas / Leaflet, Tailwind CSS, Python 3.10+.
- **Idioma del Código:** Español para nomenclatura civil/política de Monagas y variables de dominio (`corredores`, `subtramos`, `patologias`, `centros_votacion`).
- **Tipografía en UI:** Tamaño estándar mínimo de 16px (`text-base`) para textos e inputs de formularios, y 14px (`text-sm`) para datos secundarios. Prohibidas fuentes <12px.
- **Términos Humanizados:** Cero siglas crípticas de ingeniería (prohibido usar "PK"; utilizar distancias directas "De 0 m a 300 m").

## 4. Reglas Inviolables (Constitución del Proyecto)
1. **Lectura Previa:** Antes de tocar código, lee obligatoriamente `docs/constitution.md` y la especificación activa en `.sdd/specs/`.
2. **Prohibición del "Vibe Coding":** No asumas requerimientos ni improvises funcionalidades sin una spec aprobada.
3. **Doctrina 100% Oposición Democrática:** Jamás emplear léxico del régimen chavista ("camarada", "revolución", "patria", "bolivariano", "comuna", "1x10").
4. **Verificación Obligatoria:** Antes de dar una tarea por finalizada, ejecuta los comandos de verificación y documenta los resultados en el walkthrough correspondiente.
