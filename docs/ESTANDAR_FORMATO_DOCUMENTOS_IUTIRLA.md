# ESTÁNDAR OFICIAL DE FORMATO DE DOCUMENTOS • MIGATO / IUTIRLA

**Ámbito de Aplicación:** Todos los informes, propuestas técnicas, presupuestos y dictámenes generados para el Movimiento Independiente Ganamos Todos (MIGATO) y el Comando Estratégico de Campaña.  
**Referencia Metodológica:** Normas Institucionales IUTIRLA (División de Informática) / Estilo APA Adaptado.  
**Estado:** Activo y Obligatorio.

---

## 1. Estructura Obligatoria de Portada (Página 1)

La primera página **nunca lleva encabezado ni pie de página visible** (`w:titlePg`). Contiene los siguientes bloques en orden estricto:

1. **Cintillo Institucional (Centrado, Mayúsculas, Negrita, 10.5pt):**
   ```
   REPÚBLICA BOLIVARIANA DE VENEZUELA
   MOVIMIENTO INDEPENDIENTE GANAMOS TODOS (MIGATO)
   EQUIPO TÉCNICO REGIONAL DE INFORMÁTICA Y SISTEMAS
   MATURÍN, ESTADO MONAGAS
   ```
2. **Espacio en blanco y Logo Central Oficial:**
   - Imagen: `assets/logo-migato.png`
   - Tamaño: Centrado, 1450000 x 1415000 EMU (~3.8 cm x 3.7 cm).
3. **Título Principal del Documento (Centrado, Mayúsculas, Negrita, 12.5pt a 13pt):**
   - Espaciado: 8 a 10 líneas después del logo.
   - Ejemplo: `PROPUESTA TÉCNICA Y PRESUPUESTO DE INFRAESTRUCTURA: SERVIDOR LOCAL Y NUBE`
4. **Subtítulo Descriptivo (Centrado, Tipo Oración, 10.5pt):**
   - Breve resumen del contenido y alcance.
5. **Bloque de Autoría (Alineado con sangría izquierda de 3800 dxa / ~6.7 cm):**
   ```
   Elaborado por:
   Equipo Técnico Regional de Sistemas e Informática
   Ing. Diego Donado
   ```
6. **Fecha y Ubicación al Pie (Centrado, 11pt, Negrita):**
   ```
   Maturín, septiembre de 2026
   ```

---

## 2. Encabezado de Páginas Siguientes (Páginas 2 en adelante)

A partir de la página 2, el documento muestra un encabezado formal estructurado en una **tabla invisible de 3 columnas (ancho 8260 dxa)** con borde inferior sutil color `#D1D5DB`:

| Columna 1 (Izquierda - 700 dxa) | Columna 2 (Centro - 5860 dxa) | Columna 3 (Derecha - 1700 dxa) |
| :--- | :--- | :--- |
| **Logo Pequeño MIGATO** (380000 x 370000 EMU) | **MOVIMIENTO INDEPENDIENTE GANAMOS TODOS (MIGATO)**<br><span style="font-size:8pt;color:#555;">EQUIPO TÉCNICO REGIONAL DE INFORMÁTICA Y SISTEMAS • ESTADO MONAGAS</span> | **Página X de Y**<br>(Campos dinámicos `PAGE` / `NUMPAGES`) |

---

## 3. Tipografía, Márgenes y Párrafos

* **Fuente:** Arial o Times New Roman estándar.
* **Márgenes de Página:** Superior 2.54 cm, Inferior 2.54 cm, Izquierdo 3.0 cm, Derecho 2.54 cm (Margen IUTIRLA para encuadernación).
* **Títulos de Sección:** Centrados, en Mayúsculas sostenidas, Negrita, 11pt (`sz="22"`), espaciado anterior 40pt y posterior 20pt.
* **Párrafos de Cuerpo:**
  * Justificación completa (`both`).
  * Sangría de primera línea obligatoria: `567 dxa` (aprox. 1 cm).
  * Tamaño de fuente: 10.5pt a 11pt (`sz="21"`).
  * Interlineado: 1.15 a 1.25 líneas (`line="260"`).
* **Viñetas:** Sangría francesa (`ind left="360" hanging="360"`), viñeta `•` y título en negrita.

---

## 4. Estilo Oficial de Tablas de Costos

Las tablas no deben usar estilos extravagantes ni bordes pesados:
* **Bordes:** Borde superior e inferior sencillo negro/gris (`#000000` o `#0F172A`), bordes horizontales internos suaves (`#E2E8F0` o `#CCCCCC`), sin bordes verticales (`insideV="none"`).
* **Fila de Cabecera:** Fondo sombreado en gris claro institucional (`#EAEAEA` o `#F1F5F9`), texto en negrita 8.5pt - 9pt.
* **Alineación:**
  * Descripciones y conceptos: Alineados a la izquierda.
  * Cantidades y unidades: Centrados.
  * Montos en moneda (`$ USD`): Estrictamente alineados a la derecha.
* **Fila de Total:** Fondo `#F5F5F5` o `#FEF3C7` tenue, texto en negrita y borde doble o reforzado.
* **Nota Aclaratoria al Pie de Tabla:** Texto en cursiva, tamaño 8pt (`sz="16"`), color gris `#444444`.

---

## 5. Bloque Oficial de Firmas

En la última página se incluye la tabla de firmas autorizadas de 2 columnas:
* **Columna Izquierda:** Línea de firma + `COMANDO ESTRATÉGICO MIGATO` + `Dirección de Operaciones • El Gato Briceño`.
* **Columna Derecha:** Línea de firma + `ING. DIEGO DONADO` + `Responsable de Ciencia y Tecnología MIGATO`.

---

## 6. Regla de Conversión MCP / Google Docs

Cuando se ejecute el MCP de Google Drive (`gdrive_upload_file`) con `convert_to_doc=True`:
1. El archivo fuente `.docx` debe ser construido con esta plantilla exacta.
2. Google Docs preserva automáticamente la portada limpia, el logo central, la cabecera repetitiva de 3 columnas con logo en miniatura, la paginación y las tablas con sangría IUTIRLA.
3. **Queda terminantemente prohibido alterar esta estructura.**
