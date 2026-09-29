# Spec NNN — <Nombre de la Funcionalidad / Módulo>
**Estado:** [Borrador | Aprobada | En Desarrollo | Completada]  
**Autor:** <Ing. Diego Donado / Equipo Técnico>  
**Fecha:** YYYY-MM-DD  

---

## 1. Contexto y Objetivo
<Qué problema del comando o de la gestión territorial de Monagas resuelve y por qué es relevante. Máximo 2 párrafos.>

## 2. Usuarios y Actores Operativos
- **Actor Principal:** <Ej: Inspector de Campo, Coordinador de Parroquia, Sala Situacional>
- **Rol:** <Qué responsabilidades tiene y en qué contexto usa la herramienta>

## 3. Historias de Usuario
- **H1:** Como <rol> quiero <acción> para <beneficio concreto>.
- **H2:** Como <rol> quiero <acción> para <beneficio concreto>.

## 4. Requisitos Funcionales (Sintaxis EARS Obligatoria)
*Nota de rigor: Cada criterio de aceptación debe seguir uno de los 4 patrones EARS:*
- **RF-01 (Ubicuo):** EL SISTEMA <comportamiento permanente en todo momento>.
- **RF-02 (Conducido por Evento):** CUANDO <el usuario hace clic o se activa un evento>, EL SISTEMA <respuesta y cambio de estado visible>.
- **RF-03 (De Estado):** MIENTRAS <el sistema está en modo X (ej: trazando en mapa)>, EL SISTEMA <comportamiento específico>.
- **RF-04 (Excepción / Error):** SI <ocurre un error o condición no deseada>, ENTONCES EL SISTEMA <mensaje claro y acción de recuperación>.

## 5. Requisitos de Ergonomía e Interfaz (Constitución MIGATO)
- **RI-01 (Tipografía):** La interfaz utilizará tamaños de fuente de 16px (`text-base`) para textos e inputs de datos y 14px (`text-sm`) para etiquetas secundarias.
- **RI-02 (Léxico):** Queda prohibida la jerga del régimen chavista y siglas oscuras (ej: cero "PK"; distancias en metros "De X m a Y m").
- **RI-03 (Acciones):** Todo registro contará con botón de acción directa y evidente (ej: `[🗑️ Eliminar]`).

## 6. Casos Límite y Restricciones
- ¿Qué ocurre si no hay conexión a internet? <Comportamiento local offline>
- ¿Qué ocurre con datos corruptos o valores extremos? <Manejo defensivo>

## 7. Fuera de Alcance (Out of Scope)
- <Declarar explícitamente qué NO se va a construir en esta versión para evitar que la IA asuma cosas de más>

## 8. Criterios de Finalización (Definition of Done)
- [ ] Todos los RF-x están implementados y verificados.
- [ ] La tipografía cumple con el estándar de 16px / 14px.
- [ ] Probado y validado en navegadores móviles y desktop.
- [ ] Documentado en walkthrough y registrado en la Bóveda de Obsidian.
