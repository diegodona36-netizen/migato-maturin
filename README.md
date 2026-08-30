# 🚀 Sistema de Monitoreo Comunitario - Maturín (Agua y Vialidad)

Aplicación web y panel de control territorial para recopilar, centralizar y visualizar encuestas sobre la situación del **Agua Potable** y el **Estado de las Carreteras / Vialidad** en todos los sectores y parroquias del Municipio Maturín, Estado Monagas.

---

## 🌟 Características Principales

1. **🚦 Sistema de Semáforo Rápido (3 Estados):**
   - 🟢 **Verde:** Buen estado / Suministro óptimo.
   - 🟡 **Amarillo:** Estado regular / Racionamiento / Baches moderados.
   - 🔴 **Rojo:** Estado crítico / Sin servicio de agua / Vía intransitable.

2. **🚰 Dashboard Dedicado de Agua Potable:**
   - Gráfico de semáforo de distribución porcentual.
   - Fallas más frecuentes (sin suministro continuo, turbidez, fallas de bombas/pozos).
   - Ranking de parroquias y sectores con mayor urgencia de agua.
   - Filtros dinámicos por estado y parroquia.

3. **🛣️ Dashboard Dedicado de Vialidad y Carreteras:**
   - Semáforo de estado de las vías y calles.
   - Diagnóstico de deterioros (huecos profundos, falta total de asfalto, cloacas, alumbrado).
   - Ranking de vías críticas por comunidad.

4. **🗺️ Mapa Interactivo de Maturín:**
   - Desarrollado con **Leaflet y OpenStreetMap** (100% libre, sin costes de licencias).
   - Centrado en el Municipio Maturín con marcadores en cada sector.
   - Marcadores con efecto de pulso en alerta roja y contador de encuestas.
   - Selector para alternar la vista entre **"Semáforo de Agua"** y **"Semáforo de Carreteras"**.
   - Ficha emergente (Popup) con el detalle del sector al hacer clic.

5. **🔗 Sincronización con Google Forms & Google Sheets:**
   - Conecta directamente con la hoja de cálculo generada por el Google Form.
   - Sincronización en vivo o mediante importador rápido de CSV.
   - Persistencia local automática (`localStorage`).

6. **📱 Formulario de Captura Directa en Campo:**
   - Botón `+ Encuesta` con 3 botones gigantes de semáforo (Verde, Amarillo, Rojo) para encuestar rápidamente desde el teléfono en la calle.

7. **📥 Exportación y Reportes:**
   - Exportación directa a archivos **CSV** (Excel) y **JSON**.
   - Modo de impresión optimizado para generar reportes en **PDF** para prensa o asambleas de vecinos.

---

## 📍 Parroquias y Sectores Incluidos de Maturín

La plataforma incluye de forma nativa las 10 parroquias de Maturín con sus coordenadas geográficas:

1. **San Simón:** Centro / Casco Central, Barrio Obrero, Brisas del Orinoco, Alberto Ravell, Campo Ayacucho.
2. **Alto de Los Godos:** Los Godos I y II, Morichal, La Muralla, El Abanico, Los Guaritos.
3. **Boquerón:** Tipuro, Palma Real, Las Avenidas / Doña Menca, El Rincón, San Rafael.
4. **Las Cocuizas:** Las Cocuizas, Sabana Grande, El Silencio, La Floresta.
5. **Santa Cruz:** Santa Cruz, Zona Industrial, Las Garzas, Los Cortijos.
6. **La Pica:** Caserío La Pica, Vuelta Larga.
7. **Jusepín:** Casco Central Jusepín.
8. **El Furrial:** Casco El Furrial.
9. **San Vicente:** Sector San Vicente.
10. **El Corozo:** Sector El Corozo.

---

## 🛠️ Cómo Ejecutar la Aplicación

1. Abre una terminal en la carpeta del proyecto:
   ```bash
   python3 server.py
   ```
2. Abre tu navegador web en:
   ```text
   http://localhost:8000
   ```

---

## 📝 Guía: Cómo Configurar el Formulario en Google Forms

Para que el equipo de campo use Google Forms en sus teléfonos y los datos caigan directo al sistema:

1. Entra en [Google Forms](https://forms.google.com) y crea un nuevo formulario llamado **"Encuesta Territorial Maturín"**.
2. Agrega las siguientes preguntas:
   - **Parroquia:** Menú desplegable con las 10 parroquias de Maturín.
   - **Sector / Comunidad:** Respuesta corta (ej: *Los Godos, Tipuro, Sabana Grande*).
   - **Semáforo de Agua:** Opción múltiple con las opciones: `🟢 Verde (Bueno)`, `🟡 Amarillo (Regular)`, `🔴 Rojo (Crítico / Sin agua)`.
   - **Problema de Agua:** Menú desplegable con las fallas (ej: *Sin suministro continuo, Agua turbia, Bomba dañada, Baja presión*).
   - **Semáforo de Vialidad:** Opción múltiple con las opciones: `🟢 Verde (Bueno)`, `🟡 Amarillo (Regular)`, `🔴 Rojo (Crítico / Intransitable)`.
   - **Problema de Vialidad:** Menú desplegable con los problemas (ej: *Huecos/baches, Sin asfalto, Cloacas colapsadas, Alumbrado*).
   - **Observaciones:** Párrafo (comentarios de los vecinos).
   - **Encuestador:** Respuesta corta (Nombre del voluntario).
3. En la pestaña **Respuestas** de Google Forms, haz clic en el icono verde **"Crear hoja de cálculo de Google Sheets"**.
4. En esa hoja de Google Sheets ve a: **Archivo > Compartir > Publicar en la web**, selecciona formato **Página web o CSV** y dale a *Publicar*.
5. Copia el enlace de esa hoja, entra a la pestaña **⚙️ Google Forms & Conexión** en nuestra aplicación y pégalo. ¡Listo! Los dashboards y el mapa se actualizarán automáticamente.

---

## 📂 Estructura de Archivos

```text
├── index.html              # Interfaz principal de la aplicación SPA
├── css/
│   └── styles.css          # Animaciones, pines de semáforo y diseño de impresión
├── js/
│   ├── app.js              # Controlador principal y gestión de eventos
│   ├── data.js             # Almacén de datos, coordenadas de Maturín y cálculo de estadísticas
│   ├── map.js              # Controlador del Mapa Interactivo de Leaflet
│   ├── charts.js           # Visualizaciones y gráficos con Chart.js
│   └── googleSheets.js     # Conector y sincronizador en vivo con Google Sheets (CSV)
├── server.py               # Servidor local de desarrollo en Python 3
└── README.md               # Documentación completa del proyecto
```
