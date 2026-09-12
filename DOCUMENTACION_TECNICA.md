# MANUAL TÉCNICO Y DE ARQUITECTURA: PLATAFORMA DE INTELIGENCIA TERRITORIAL MONAGAS 2026

> **DOCUMENTO MAESTRO DE INGENIERÍA Y OPERACIONES**  
> *Plataforma Cartográfica 3D, Buzón Ciego de Carga Móvil, Despacho Celular y Auditoría CNE*  
> **Estado:** Producción Activa • **Hosting:** GitHub Pages • **Base de Datos:** Cloud Firestore  
> **Repositorio Oficial:** `diegodona36-netizen/migato-maturin`

---

## 1. INTRODUCCIÓN Y PRINCIPIOS DE DISEÑO

La **Plataforma de Inteligencia Territorial Monagas** es un ecosistema digital concebido para la dirección estratégica, visualización cartográfica en 3D y recolección de métricas territoriales y sectoriales en los 13 municipios y 44 parroquias del Estado Monagas.

### Principios Fundamentales
1. **Compartimentación Celular y Seguridad Operacional:**  
   Los operadores en calle solo tienen acceso a su ámbito territorial específico mediante enlaces directos con credenciales precargadas. No existe navegación cruzada ni listados globales visibles para operadores de base.
2. **Buzón Ciego en Terreno (`/carga/`):**  
   Para proteger al operador en caso de inspección, pérdida o extravío del teléfono móvil, el formulario de carga funciona como un buzón ciego: permite ingresar datos pero **no almacena ni expone historiales ni acumulados en el dispositivo**. Al confirmar el envío, la pantalla se limpia por completo.
3. **Protección Estricta de Identidad:**  
   Se prohíbe el levantamiento de nombres, cédulas de identidad o números de teléfono. Todas las métricas son estrictamente cuantitativas sectoriales: 🏠 **Casas**, 👥 **Habitantes**, 🗳️ **Votantes** y ✊ **Militantes**.
4. **Resiliencia Offline y Cero Dependencias Pesadas:**  
   El frontend está construido sobre arquitectura Vanilla (HTML5, ES Modules nativos, CSS/Tailwind) sin frameworks con transpilación pesada, garantizando compatibilidad con navegadores móviles de gama baja y carga ultrarrápida.

---

## 2. ARQUITECTURA DEL SISTEMA Y STACK TECNOLÓGICO

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CLIENTES FRONTEND                               │
├──────────────────────┬────────────────────────────┬─────────────────────────┤
│    /despacho/        │          /carga/           │     /earth-monagas/     │
│ Enlaces y Credenciales│ Buzón Ciego Móvil (Calle)  │  Cartografía 3D Master  │
│  (Dirección General) │  (Sub-Parroquia ➔ Sector)   │    (Sala Situacional)   │
└──────────┬───────────┴─────────────┬──────────────┴────────────┬────────────┘
           │                         │                           │
           │                         ▼ HTTPS                     │
           │           ┌────────────────────────────┐            │
           │           │ Google Cloud Firestore     │            │
           └──────────►│ (Colección:                │◄───────────┘
                       │  territorios_monagas)      │
                       └────────────────────────────┘
                                     │
                                     ▼
                       ┌────────────────────────────┐
                       │ Servidor MCP Monagas       │
                       │ (Model Context Protocol)   │
                       │ stdio / JSON-RPC 2.0       │
                       └────────────────────────────┘
```

### Componentes Tecnológicos
- **Lenguajes:** JavaScript (ES6+ Modules), Python 3.12 (Servidor MCP y utilidades de backend).
- **Cartografía 3D:** CesiumJS Engine con elevación satelital y polígonos vectoriales georreferenciados (LOD 1 a LOD 5).
- **Estilos:** TailwindCSS (vía CDN optimizado) + Estilos tácticos *War Room* de alto contraste para visibilidad solar en calle (*Sunlight-Ready*).
- **Persistencia en la Nube:** Firebase / Google Cloud Firestore (SDK Modular v10.7.1).
- **Despliegue y CDN:** GitHub Pages (`https://diegodona36-netizen.github.io/migato-maturin/`).
- **Control de Versiones:** Git con sincronización obligatoria en ramas `main` y `master`.

---

## 3. MÓDULOS DE LA PLATAFORMA

### 3.1 Módulo Central (`/` - `index.html`)
- **Propósito:** Portal de mando de la Dirección General con métricas macro del estado:
  - 13 Municipios, 44 Parroquias.
  - Cifras CNE Maturín: 318.601 electores, 175 centros electorales, 361 mesas.
- **Acceso:** Libre institucional con accesos restringidos a los submódulos.

### 3.2 Panel de Despacho (`/despacho/` - `despacho/index.html`)
- **Propósito:** Matriz de distribución táctica exclusiva de la Dirección General.
- **Características:**
  - Lista las 44 parroquias del estado organizadas por municipio.
  - Muestra la credencial de acceso oficial de cada parroquia (`admin`).
  - Genera enlaces directos con parámetro URL: `/carga/?p=[id_parroquia]`.
  - Botón de envío directo a **WhatsApp** con texto formal de acreditación pre-redactado.
  - Botón de copia al portapapeles y botón para probar la vista parroquial en vivo.

### 3.3 Buzón Privado de Carga (`/carga/` - `carga/index.html`)
- **Propósito:** Registro numérico territorial semanal realizado por el enlace parroquial en campo.
- **Seguridad en Calle (Buzón Ciego):**
  - Autenticación mediante clave parroquial (`admin`).
  - **Selector en Cascada**: El operador selecciona primero la **Sub-Parroquia** (ej. *Sub-Parroquia 6 La Puente*), lo cual filtra dinámicamente el selector de **Sector** para evitar menús saturados de 50+ opciones.
  - **4 Campos Numéricos Oficiales:**
    1. 🏠 **Casas:** Total de viviendas censadas en el sector.
    2. 👥 **Habitantes:** Población sectorial residente.
    3. 🗳️ **Votantes:** Intención de voto / Voto seguro estimado.
    4. ✊ **Militantes:** Fuerza militante activa y movilizada.
  - **Limpieza Instantánea:** Al pulsar «Enviar Reporte», se transmite a Firestore y todos los campos del formulario se vacían de inmediato, evitando que terceros vean datos acumulados en caso de revisión del móvil.

### 3.4 Visor Cartográfico Master (`/earth-monagas/` - `earth-monagas/index.html`)
- **Propósito:** Sala situacional 3D para el Gobernador y el Alto Mando.
- **Características:**
  - Carga los polígonos geográficos oficiales de los 13 municipios y 44 parroquias (`catalogoMonagas.js` y `geoMonagas.js`).
  - Capa detallada de la Sub-Parroquia 6 La Puente con sus 11 sectores vectorizados.
  - Cruce de centros electorales con electores y mesas asignadas.

---

## 4. ESQUEMA DE DATOS (CLOUD FIRESTORE)

Toda la recolección sectorial se almacena en la colección central `territorios_monagas`:

```json
{
  "parroquia_id": "alto-de-los-godos",
  "municipio_id": "maturin",
  "subparroquia": "sub-godos-6",
  "subparroquia_nombre": "Sub-Parroquia 6 (La Puente)",
  "sector": "Monagzal",
  "casas": 450,
  "familias": 450,
  "habitantes": 1550,
  "votantes": 410,
  "militantes": 85,
  "semana": "2026-W36",
  "timestamp": "2026-09-06T05:00:00.000Z",
  "creado_por": "enlace-parroquial",
  "origen": "buzon_carga_movil"
}
```

### Reglas de Seguridad de Firestore
- Las reglas de Firestore están configuradas para admitir escritura autenticada o tokenizada desde los dominios autorizados de la plataforma.
- El campo `militantes` es numérico entero y sustituye formalmente a cualquier denominación previa.

---

## 5. CATÁLOGO TERRITORIAL OFICIAL DE MONAGAS

El Estado Monagas está estructurado en **13 Municipios** y **44 Parroquias Oficiales**:

| Municipio | Capital | Parroquias Principales | Código ID |
| :--- | :--- | :--- | :--- |
| **Maturín** (10) | Maturín | San Simón, Alto de Los Godos, Boquerón, Las Cocuizas, Santa Cruz, San Vicente, El Corozo, El Furrial, Jusepín, La Pica | `maturin` |
| **Acosta** (2) | San Antonio | San Antonio, San Francisco | `acosta` |
| **Aguasay** (1) | Aguasay | Aguasay | `aguasay` |
| **Bolívar** (1) | Caripito | Caripito | `bolivar` |
| **Caripe** (6) | Caripe | Caripe, El Guácharo, La Guanota, Sabana de Piedra, San Agustín, Teresén | `caripe` |
| **Cedeño** (4) | Caicara | Caicara, Areo, San Félix, Viento Fresco | `cedeno` |
| **Ezequiel Zamora** (2) | Punta de Mata | Punta de Mata, El Tejero | `ezequiel-zamora` |
| **Libertador** (4) | Temblador | Temblador, Chaguaramas, Las Albinas, Tabasca | `libertador` |
| **Piar** (3) | Aragua | Aragua, Aparicio, Chaguaramal | `piar` |
| **Punceres** (2) | Quiriquire | Quiriquire, Cachipo | `punceres` |
| **Santa Bárbara** (1) | Santa Bárbara | Santa Bárbara | `santa-barbara` |
| **Sotillo** (2) | Barrancas | Barrancas, Los Barrancos de Fajardo | `sotillo` |
| **Uracoa** (1) | Uracoa | Uracoa | `uracoa` |

### Caso Especial: Sub-Parroquia 6 La Puente (Alto de Los Godos)
Los 11 sectores oficiales y sus centros electorales asignados según la lámina oficial:
1. **Monagzal** (450 casas, 1.550 hab) ➔ C.E. Cruz Hernández Quijada
2. **Las Vírgenes** (1.040 casas, 3.053 hab) ➔ C.E. Cruz Hernández Quijada
3. **Villa de los Ángeles** (446 casas, 1.254 hab) ➔ C.E. Francisco Verde
4. **Canadá** (546 casas, 1.848 hab) ➔ C.E. Francisco Verde
5. **Sector II** (645 casas, 2.348 hab) ➔ C.E. Francisco Verde
6. **Sector IA** (735 casas, 2.215 hab) ➔ C.E. Apolinar Cantor
7. **Sector IB** (537 casas, 1.637 hab) ➔ C.E. Apolinar Cantor
8. **Valle Real** (455 casas, 1.621 hab) ➔ C.E. Apolinar Cantor
9. **El Samán** (400 casas, 1.485 hab) ➔ C.E. Apolinar Cantor
10. **La Lucha** (721 casas, 2.228 hab) ➔ C.E. Cruz Figuera Rondón
11. **Las Flores** (550 casas, 1.688 hab) ➔ C.E. Cruz Figuera Rondón

---

## 6. GUÍA DE DESPLIEGUE Y OPERACIÓN GIT

### Ramas y GitHub Pages
- Repositorio: `diegodona36-netizen/migato-maturin`
- Ramas requeridas: `main` y `master`. Para evitar inconsistencias de GitHub Pages, cualquier actualización debe enviarse a ambas ramas:
  ```bash
  git add .
  git commit -m "Actualización del sistema"
  git push origin main && git push origin main:master
  ```
- URL de Producción:
  - Principal: `https://diegodona36-netizen.github.io/migato-maturin/`
  - Despacho: `https://diegodona36-netizen.github.io/migato-maturin/despacho/`
  - Carga Los Godos: `https://diegodona36-netizen.github.io/migato-maturin/carga/?p=alto-de-los-godos`

---

## 7. ESPECIFICACIÓN DEL SERVIDOR MCP (MODEL CONTEXT PROTOCOL)

El servidor MCP permite que herramientas de Inteligencia Artificial (Antigravity, Claude Desktop, Agentes autónomos) consulten de forma programática la base de conocimiento de Monagas mediante **JSON-RPC 2.0 sobre `stdio`**.

### Herramientas Expuestas:
1. `consultar_territorio`: Búsqueda de cualquier municipio o parroquia.
2. `obtener_sectores_lapuente`: Desglose con centros de votación y métricas de los 11 sectores de La Puente.
3. `consultar_documentacion_tecnica`: Motor de citas exactas sobre este manual técnico.
4. `obtener_enlace_despacho`: Generación de enlaces directos y credenciales para las 44 parroquias.
5. `generar_resumen_sala_situacional`: Balance macro para el Gobernador y Sala de Mando.

*Fin del documento técnico.*
