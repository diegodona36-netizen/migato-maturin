#!/usr/bin/env python3
"""
Generador de Guías de Trabajo de Campo y Entrevistas Rápidas - MIGATO Monagas 2026
Formato: Práctico, directo, sin tecnicismos, sin firmas formales, estilo 'de chill'.
Genera 4 documentos individuales (1 por área) y 1 documento unificado.
"""

import os
import zipfile
import shutil
import subprocess

OUTPUT_DIR = "/home/diego/Documents/antigravity/zealous-mendel"
LOGO_PATH = os.path.join(OUTPUT_DIR, "assets/migato_logo.jpg")

DOCX_CONTENT_TYPES = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="jpg" ContentType="image/jpeg"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>"""

DOCX_RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"""

DOCX_STYLES = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
        <w:sz w:val="22"/>
        <w:color w:val="1E293B"/>
        <w:lang w:val="es-VE"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:line="260" w:lineRule="auto" w:before="0" w:after="120"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
</w:styles>"""

def build_single_page_doc(filename, doc_title, subtitle, target_person, intro_text, questions_data):
    """
    questions_data: lista de tuplas (num, pregunta_titulo, explicacion_sencilla, lista_opciones_o_tips)
    """
    has_image = os.path.exists(LOGO_PATH)
    
    # Document relationships
    doc_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
"""
    if has_image:
        doc_rels += '  <Relationship Id="rIdLogo" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo.jpg"/>\n'
    doc_rels += "</Relationships>"

    # Generar XML de preguntas
    q_xml = []
    for num, q_title, q_desc, opts in questions_data:
        # Título de pregunta
        q_xml.append(f"""
        <w:p>
          <w:pPr>
            <w:spacing w:before="140" w:after="40"/>
            <w:pBdr><w:bottom w:val="single" w:sz="6" w:space="2" w:color="CBD5E1"/></w:pBdr>
          </w:pPr>
          <w:r>
            <w:rPr><w:b/><w:sz w:val="23"/><w:color w:val="0369A1"/></w:rPr>
            <w:t xml:space="preserve">{num}. {q_title}</w:t>
          </w:r>
        </w:p>
        <w:p>
          <w:pPr><w:spacing w:before="0" w:after="60"/></w:pPr>
          <w:r>
            <w:rPr><w:sz w:val="20"/><w:color w:val="475569"/></w:rPr>
            <w:t xml:space="preserve">{q_desc}</w:t>
          </w:r>
        </w:p>
        """)
        
        # Opciones / sugerencias prácticas
        for opt in opts:
            q_xml.append(f"""
            <w:p>
              <w:pPr><w:spacing w:before="0" w:after="40"/><w:ind w:left="360" w:hanging="240"/></w:pPr>
              <w:r><w:rPr><w:sz w:val="20"/><w:color w:val="0284C7"/><w:b/></w:rPr><w:t xml:space="preserve">☐ </w:t></w:r>
              <w:r><w:rPr><w:sz w:val="20"/><w:color w:val="1E293B"/></w:rPr><w:t xml:space="preserve">{opt}</w:t></w:r>
            </w:p>
            """)
            
        # Línea suave de notas para que Diego o el dirigente anote
        q_xml.append("""
        <w:p>
          <w:pPr><w:spacing w:before="40" w:after="80"/><w:ind w:left="360"/></w:pPr>
          <w:r><w:rPr><w:i/><w:sz w:val="18"/><w:color w:val="94A3B8"/></w:rPr><w:t>Respuesta / Notas de la conversación: ____________________________________________________</w:t></w:r>
        </w:p>
        """)

    questions_body = "\n".join(q_xml)

    header_image_xml = ""
    if has_image:
        header_image_xml = """
        <w:r>
          <w:drawing>
            <wp:inline distT="0" distB="0" distL="0" distR="0">
              <wp:extent cx="540000" cy="540000"/>
              <wp:docPr id="1" name="Logo MIGATO"/>
              <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                  <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                    <pic:nvPicPr>
                      <pic:cNvPr id="0" name="logo.jpg"/>
                      <pic:cNvPicPr/>
                    </pic:nvPicPr>
                    <pic:blipFill>
                      <a:blip r:embed="rIdLogo" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
                      <a:stretch><a:fillRect/></a:stretch>
                    </pic:blipFill>
                    <pic:spPr>
                      <a:xfrm><a:off x="0" y="0"/><a:ext cx="540000" cy="540000"/></a:xfrm>
                      <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                    </pic:spPr>
                  </pic:pic>
                </a:graphicData>
              </a:graphic>
            </wp:inline>
          </w:drawing>
        </w:r>
        """

    document_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
  <w:body>
    <!-- CABECERA LIMPIA Y AMIGABLE -->
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="9360" w:type="dxa"/>
        <w:tblBorders>
          <w:top w:val="none"/><w:left w:val="none"/><w:right w:val="none"/><w:bottom w:val="single" w:sz="12" w:space="6" w:color="0284C7"/>
          <w:insideH w:val="none"/><w:insideV w:val="none"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="1200" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="center"/></w:pPr>{header_image_xml}</w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="8160" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>
          <w:p>
            <w:pPr><w:spacing w:before="0" w:after="20"/></w:pPr>
            <w:r><w:rPr><w:b/><w:sz w:val="26"/><w:color w:val="0F172A"/></w:rPr><w:t>MIGATO MONAGAS 2026 • GUÍA PRÁCTICA</w:t></w:r>
          </w:p>
          <w:p>
            <w:pPr><w:spacing w:before="0" w:after="20"/></w:pPr>
            <w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="0284C7"/></w:rPr><w:t xml:space="preserve">{doc_title}</w:t></w:r>
          </w:p>
          <w:p>
            <w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr>
            <w:r><w:rPr><w:sz w:val="18"/><w:color w:val="64748B"/></w:rPr><w:t xml:space="preserve">Reunión con: {target_person}  |  {subtitle}</w:t></w:r>
          </w:p>
        </w:tc>
      </w:tr>
    </w:tbl>

    <!-- INTRODUCCIÓN SUAVE -->
    <w:p>
      <w:pPr><w:spacing w:before="120" w:after="100"/></w:pPr>
      <w:r><w:rPr><w:i/><w:sz w:val="20"/><w:color w:val="334155"/></w:rPr><w:t xml:space="preserve">Propósito: {intro_text}</w:t></w:r>
    </w:p>

    <!-- PREGUNTAS CLAVE -->
    {questions_body}

    <!-- PIE DE PÁGINA SIMPLE -->
    <w:p>
      <w:pPr>
        <w:spacing w:before="140" w:after="0"/>
        <w:pBdr><w:top w:val="single" w:sz="6" w:space="4" w:color="CBD5E1"/></w:pBdr>
        <w:jc w:val="center"/>
      </w:pPr>
      <w:r><w:rPr><w:sz w:val="16"/><w:color w:val="94A3B8"/></w:rPr><w:t>Movimiento Independiente Ganamos Todos (MIGATO) • Uso Interno de Trabajo • Maturín 2026</w:t></w:r>
    </w:p>

    <!-- SECCIÓN DE PÁGINA: MÁRGENES ESTÁNDAR LIMPIOS (1.8 cm) -->
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1000" w:right="1000" w:bottom="1000" w:left="1000" w:header="0" w:footer="0"/>
    </w:sectPr>
  </w:body>
</w:document>"""

    # Empaquetar DOCX
    docx_path = os.path.join(OUTPUT_DIR, filename)
    with zipfile.ZipFile(docx_path, 'w', zipfile.ZIP_DEFLATED) as zout:
        zout.writestr("[Content_Types].xml", DOCX_CONTENT_TYPES)
        zout.writestr("_rels/.rels", DOCX_RELS)
        zout.writestr("word/styles.xml", DOCX_STYLES)
        zout.writestr("word/_rels/document.xml.rels", doc_rels)
        zout.writestr("word/document.xml", document_xml)
        if has_image:
            with open(LOGO_PATH, "rb") as f_img:
                zout.writestr("word/media/logo.jpg", f_img.read())

    print(f"[OK] Generado: {docx_path}")
    return docx_path

# ==========================================
# DATOS DE LOS 4 DOCUMENTOS SEGMENTADOS
# ==========================================

# 1. ALTA DIRECCIÓN (El Gato Briceño / Comando Central)
doc1_questions = [
    (
        1,
        "¿Qué es lo primero que necesita ver usted en la pantalla cada mañana?",
        "Para no llenarlo de botones raros ni tablas complicadas, díganos cómo le gusta ver el estado del estado Monagas:",
        [
            "Un mapa grande con los 13 municipios en colores mostrando dónde estamos más activos.",
            "Un número grande y claro de votantes contactados y organizados hasta hoy.",
            "Alertas de parroquias o municipios donde tengamos problemas o retrasos en la conformación."
        ]
    ),
    (
        2,
        "¿Cuáles palabras o nombres son obligatorios y cuáles NO se deben usar jamás?",
        "Para que la plataforma hable exactamente con su mismo estilo político y doctrina:",
        [
            "Nombre oficial de la estructura de calle: ¿Se llama 'Comando Gatero' en todos lados?",
            "Términos prohibidos o viejos que no quiere ver en el sistema (ej. quitar la palabra 'enlace').",
            "Color oficial de la campaña y símbolos principales que deben resaltar en pantalla."
        ]
    ),
    (
        3,
        "¿Qué información es confidencial y solo usted y su equipo íntimo pueden ver?",
        "Para proteger las listas y que nadie no autorizado pueda copiarlas ni filtrarlas:",
        [
            "Listas completas de votantes y teléfonos: ¿Solo usted y su secretario de confianza?",
            "Los coordinadores de municipio: ¿Pueden ver solo su propio municipio o todo el estado?",
            "Los coordinadores parroquiales y testigos: ¿Solo deben ver una pantalla simple con sus centros?"
        ]
    )
]

# 2. ORGANIZACIÓN Y COMANDOS TERRITORIALES (13 Municipios y 44 Parroquias)
doc2_questions = [
    (
        1,
        "¿Cómo se comunican hoy en día con la estructura en los 13 municipios y 44 parroquias?",
        "Queremos saber cómo bajan las líneas y cómo les reportan las novedades a Maturín:",
        [
            "¿Tienen grupos de WhatsApp por municipio o hablan directo con cada coordinador?",
            "¿Se llaman por teléfono o alguien viaja físicamente a llevar circulares y directrices?",
            "¿Les gustaría un botón en el sistema para mandarle un mensaje directo a un coordinador?"
        ]
    ),
    (
        2,
        "¿Qué datos indispensables le piden a un responsable de municipio o parroquia?",
        "Para registrar al dirigente en el sistema sin burocracia ni estatus innecesarios:",
        [
            "Datos directos: Nombre completo, cédula de identidad, número de teléfono y parroquia asignada.",
            "Logística: ¿Se anota si el coordinador cuenta con vehículo, moto o apoyo de transporte?",
            "Identificación: ¿Se entregará credencial oficial MIGATO como enlace acreditado?"
        ]
    ),
    (
        3,
        "¿Quién es el responsable de certificar que un comando parroquial ya está conformado?",
        "Para tener certeza de la maquinaria oficial en cada una de las 44 parroquias:",
        [
            "El Coordinador Municipal valida y certifica a los responsables de sus parroquias.",
            "El Secretario de Organización Regional revisa y da la aprobación final.",
            "Validación directa con la Sala Situacional Central en Maturín."
        ]
    )
]

# 3. PADRÓN ELECTORAL Y REGISTRO DE SIMPATIZANTES (13 Municipios y 44 Parroquias)
doc3_questions = [
    (
        1,
        "¿Dónde tienen guardadas las listas de electores y simpatizantes actualmente?",
        "Para saber de dónde vamos a consolidar los datos sin ponerlos a escribir todo de cero:",
        [
            "¿Tienen archivos de Excel en computadoras o pendrives? (¡Pásennos una copia para cargarla!).",
            "¿Tienen cuadernos o listados organizados por centro de votación CNE?",
            "¿Tienen el Registro Electoral (REP) de Monagas descargado o usan una lista propia de simpatizantes?"
        ]
    ),
    (
        2,
        "¿Qué datos indispensables se registran de un elector o simpatizante?",
        "Para mantener el registro ágil y directo, sin planillas engorrosas ni censos complejos:",
        [
            "Datos electorales clave: Nombre, cédula, teléfono y Centro de Votación CNE donde vota.",
            "Ubicación territorial: Parroquia y comunidad donde hace vida.",
            "Disposición de participación y movilización para el día de la elección."
        ]
    ),
    (
        3,
        "¿Cómo organizan a los electores según su cercanía y compromiso con El Gato?",
        "Para saber a quiénes contactar primero y cómo enfocar la movilización:",
        [
            "El Voto Seguro / Militante (Gente que va a votar fijo por El Gato Briceño).",
            "El Voto Simpatizante / Blando (Gente amiga que requiere contacto y motivación cercana).",
            "Nuevos Votantes (Jóvenes que sufragarán por primera vez y necesitan orientación)."
        ]
    )
]

# 4. REDES SOCIALES, PROPAGANDA Y EVENTOS DE CALLE
doc4_questions = [
    (
        1,
        "¿Cuáles son las redes sociales donde más se mueve la gente de nosotros en Monagas?",
        "Para concentrar las fuerzas en lo que de verdad le llega al votante y no perder tiempo:",
        [
            "TikTok e Instagram (videos cortos de El Gato y actividades de calle).",
            "Estados de WhatsApp y grupos (lo más efectivo en las comunidades populares y caseríos).",
            "Canal de Telegram o difusión para mandar las líneas del día a todos los coordinadores."
        ]
    ),
    (
        2,
        "¿Quién redacta y quién da el visto bueno antes de publicar un video o mensaje?",
        "Para que no salgan publicaciones con errores ni mensajes contrarios a la línea:",
        [
            "El equipo de comunicaciones arma la propuesta y el Jefe o su designado autoriza.",
            "¿Hay un horario fijo para soltar los mensajes clave en las mañanas?",
            "¿Cómo se comparten los videos para que los coordinadores los pongan de una vez en sus estados?"
        ]
    ),
    (
        3,
        "¿Cómo organizan las caminatas, asambleas y visitas a las comunidades?",
        "Para tener una agenda en pantalla donde todo el comando vea qué toca cada día:",
        [
            "¿Con cuántos días de anticipación se fija una caminata o visita a un municipio?",
            "¿Quién avisa al equipo de avanzada y a la logística del sonido y tarima?",
            "¿Les gustaría que el sistema tenga un calendario que muestre los eventos de la semana?"
        ]
    )
]

def main():
    print("=== GENERANDO GUÍAS DE REUNIÓN 'DE CHILL' MIGATO 2026 ===")
    
    docs = [
        (
            "GUIA_1_REUNION_ALTA_DIRECCION_EL_GATO.docx",
            "1. REUNIÓN CON EL JEFE Y COMANDO CENTRAL",
            "Preguntas directas y rápidas",
            "José Gregorio 'El Gato' Briceño / Directiva Central",
            "Conversación tranquila de 15 minutos para definir qué números y mapas quiere ver el Líder Supremo en su pantalla y qué datos son 100% confidenciales.",
            doc1_questions
        ),
        (
            "GUIA_2_REUNION_ORGANIZACION_MUNICIPIOS.docx",
            "2. REUNIÓN CON ORGANIZACIÓN TERRITORIAL",
            "Estructura de 13 Municipios y 44 Parroquias",
            "Secretario de Organización / Coordinadores",
            "Preguntas prácticas para entender cómo bajan las líneas a las 44 parroquias, cómo se comunican y cómo se valida cada comando parroquial.",
            doc2_questions
        ),
        (
            "GUIA_3_REUNION_LISTAS_PADRON_CENSO.docx",
            "3. REUNIÓN CON EL EQUIPO DE PADRÓN Y ELECTORES",
            "Registro de Votantes por Centro CNE",
            "Encargados de Padrones, Planillas y Datos Electorales",
            "Conversación para saber qué listas o archivos de Excel tienen guardados actualmente y cómo registran a los electores simpatizantes por centro de votación.",
            doc3_questions
        ),
        (
            "GUIA_4_REUNION_REDES_Y_EVENTOS.docx",
            "4. REUNIÓN CON REDES Y EVENTOS DE CALLE",
            "Comunicaciones, Propaganda y Actos",
            "Equipo de Medios, Propaganda y Movilización",
            "Preguntas sencillas para coordinar qué redes usan (WhatsApp, TikTok, etc.), quién aprueba los videos y cómo arman la agenda de caminatas.",
            doc4_questions
        ),
    ]

    generated_files = []
    for fn, title, sub, target, intro, q_data in docs:
        path = build_single_page_doc(fn, title, sub, target, intro, q_data)
        generated_files.append((fn, path))

    # Convertir cada uno a PDF con LibreOffice
    print("\n=== CONVIRTIENDO A PDF CON LIBREOFFICE ===")
    os.makedirs("/tmp/lo_chill", exist_ok=True)
    pdf_files = []
    for fn, docx_p in generated_files:
        pdf_fn = fn.replace(".docx", ".pdf")
        cmd = f"libreoffice -env:UserInstallation=file:///tmp/lo_chill --headless --convert-to pdf {fn}"
        res = subprocess.run(cmd, shell=True, cwd=OUTPUT_DIR, capture_output=True, text=True)
        pdf_path = os.path.join(OUTPUT_DIR, pdf_fn)
        if os.path.exists(pdf_path):
            print(f"[OK PDF] {pdf_path}")
            pdf_files.append(pdf_path)
        else:
            print(f"[ERROR PDF] {pdf_fn}: {res.stderr}")

if __name__ == "__main__":
    main()
