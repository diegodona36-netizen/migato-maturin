# Catálogo Maestro de Prompts SDD (Flujo de 8 Fases)
*Basado en la metodología de Brais Moure (@mouredev) adaptada para el Comando Estratégico MIGATO.*

Este catálogo define los prompts exactos que el Ing. Diego Donado o los agentes de IA deben utilizar en cada fase para evitar el "vibe coding" y asegurar una ejecución quirúrgica.

---

| Fase | Objetivo | Prompt Maestro Recomendado |
|---|---|---|
| **1. Constitución** | Establecer reglas inmutables del proyecto | *"Proponme la constitución de este proyecto: principios cortos y verificables sobre stack, calidad, ergonomía de interfaces (16px/14px), doctrina política de oposición y límites infranqueables. Máximo 25 líneas. Espera mi aprobación."* |
| **2. Spec (Entrevista)** | Capturar el QUÉ y el POR QUÉ sin escribir código | *"NO escribas código aún. Hazme preguntas de una en una (máximo 5 preguntas) sobre casos límite, errores y alcance. Con mis respuestas, genera la especificación formal `spec.md` con requisitos funcionales numerados bajo sintaxis EARS, fuera de alcance y criterios de finalización."* |
| **3. Clarificación QA** | Detectar agujeros lógicos antes de diseñar | *"Actúa como un QA profesional de alto nivel. Revisa la especificación `spec.md`: identifica ambigüedades, contradicciones, casos de borde no contemplados o posibles conflictos con la Constitución. Solo detecta y lista las dudas, no intentes resolverlas por tu cuenta."* |
| **4. Plan Técnico** | Diseñar la arquitectura técnica | *"Lee la constitución y la spec aprobada. Sin escribir código de implementación, genera el `plan.md` con módulos, modelo de datos, flujo de componentes y decisiones técnicas justificadas, indicando obligatoriamente qué alternativas fueron descartadas y por qué."* |
| **5. Tareas** | Desglosar en pasos atómicos verificables | *"Toma la spec y el plan técnico. Genera `tasks.md` con tareas atómicas, secuenciales y ordenadas por fases. Cada tarea debe tener un criterio de verificación objetivo e inequívoco para marcarse como completada."* |
| **6. Implementación** | Construir con rigor paso a paso | *"Ejecuta ÚNICAMENTE la tarea [T0X]. No avances a la siguiente hasta que esté completamente implementada, verificada y hayamos comprobado su funcionamiento."* |
| **7. Validación Final** | Demostrar cumplimiento de la spec | *"Verifica cada uno de los requisitos funcionales RF-x de la especificación frente al código y la interfaz resultante. Genera un walkthrough detallado evidenciando que no existen regresiones, que la tipografía cumple la norma y que la UI no está saturada."* |
| **8. Gestión de Cambio** | Modificar requerimientos sin perder el control | *"Hay un cambio de requerimientos: [describir cambio]. NO toques el código todavía. Actualiza primero `spec.md` reflejando el cambio y muéstrame el diff para mi aprobación. Solo tras aprobar la nueva spec procederemos a planificar y ejecutar la modificación."* |
