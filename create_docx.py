import zipfile
import html

def escape(text):
    return html.escape(str(text))

def build_docx(filename, title, pages):
    content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>"""

    rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"""

    doc_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>"""

    styles = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
        <w:sz w:val="21"/>
        <w:color w:val="1E293B"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:line="240" w:lineRule="auto" w:after="80"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:pPr>
      <w:spacing w:before="180" w:after="80"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:color w:val="0F172A"/>
      <w:sz w:val="28"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:pPr>
      <w:spacing w:before="140" w:after="60"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:color w:val="1E3A8A"/>
      <w:sz w:val="24"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/>
    <w:pPr>
      <w:spacing w:before="100" w:after="40"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:color w:val="047857"/>
      <w:sz w:val="22"/>
    </w:rPr>
  </w:style>
</w:styles>"""

    body_xml = []

    for p_idx, p_content in enumerate(pages):
        for sec in p_content:
            stype = sec.get("type")
            if stype == "header_block":
                body_xml.append(f"""
                <w:p>
                  <w:pPr>
                    <w:jc w:val="center"/>
                    <w:spacing w:before="40" w:after="40"/>
                  </w:pPr>
                  <w:r>
                    <w:rPr><w:b/><w:color w:val="64748B"/><w:sz w:val="18"/></w:rPr>
                    <w:t>REPÚBLICA BOLIVARIANA DE VENEZUELA • GOBERNACIÓN DEL ESTADO MONAGAS</w:t>
                  </w:r>
                </w:p>
                <w:p>
                  <w:pPr>
                    <w:jc w:val="center"/>
                    <w:spacing w:before="40" w:after="120"/>
                  </w:pPr>
                  <w:r>
                    <w:rPr><w:b/><w:color w:val="0F172A"/><w:sz w:val="32"/></w:rPr>
                    <w:t>{escape(sec['title'])}</w:t>
                  </w:r>
                </w:p>""")
            elif stype == "h1":
                body_xml.append(f"""
                <w:p>
                  <w:pPr><w:pStyle w:val="Heading1"/></w:pPr>
                  <w:r><w:t>{escape(sec['text'])}</w:t></w:r>
                </w:p>""")
            elif stype == "h2":
                body_xml.append(f"""
                <w:p>
                  <w:pPr><w:pStyle w:val="Heading2"/></w:pPr>
                  <w:r><w:t>{escape(sec['text'])}</w:t></w:r>
                </w:p>""")
            elif stype == "p":
                body_xml.append(f"""
                <w:p>
                  <w:pPr><w:jc w:val="both"/><w:spacing w:after="70"/></w:pPr>
                  <w:r><w:t>{escape(sec['text'])}</w:t></w:r>
                </w:p>""")
            elif stype == "callout":
                body_xml.append(f"""
                <w:p>
                  <w:pPr>
                    <w:pBdr>
                      <w:left w:val="single" w:sz="24" w:space="12" w:color="1E3A8A"/>
                    </w:pBdr>
                    <w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/>
                    <w:spacing w:before="80" w:after="80"/>
                  </w:pPr>
                  <w:r>
                    <w:rPr><w:i/><w:color w:val="1E293B"/><w:sz w:val="19"/></w:rPr>
                    <w:t>{escape(sec['text'])}</w:t>
                  </w:r>
                </w:p>""")
            elif stype == "bullet":
                body_xml.append(f"""
                <w:p>
                  <w:pPr>
                    <w:ind w:left="300"/>
                    <w:spacing w:after="50"/>
                  </w:pPr>
                  <w:r>
                    <w:rPr><w:b/><w:color w:val="1E3A8A"/></w:rPr>
                    <w:t xml:space="preserve">▪ {escape(sec.get('bold', ''))} </w:t>
                  </w:r>
                  <w:r>
                    <w:t>{escape(sec['text'])}</w:t>
                  </w:r>
                </w:p>""")
            elif stype == "table":
                headers = sec.get("headers", [])
                rows = sec.get("rows", [])
                tbl_xml = ['<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders><w:top w:val="single" w:sz="6" w:color="CBD5E1"/><w:bottom w:val="single" w:sz="6" w:color="CBD5E1"/><w:insideH w:val="single" w:sz="4" w:color="E2E8F0"/></w:tblBorders></w:tblPr>']
                tbl_xml.append('<w:tr><w:trPr><w:tblHeader/></w:trPr>')
                for h in headers:
                    tbl_xml.append(f'<w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="0F172A"/></w:tcPr><w:p><w:pPr><w:spacing w:before="60" w:after="60"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="19"/></w:rPr><w:t>{escape(h)}</w:t></w:r></w:p></w:tc>')
                tbl_xml.append('</w:tr>')
                for idx, r in enumerate(rows):
                    bg = 'F8FAFC' if idx % 2 == 1 else 'FFFFFF'
                    tbl_xml.append('<w:tr>')
                    for c in r:
                        tbl_xml.append(f'<w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="{bg}"/></w:tcPr><w:p><w:pPr><w:spacing w:before="40" w:after="40"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:t>{escape(c)}</w:t></w:r></w:p></w:tc>')
                    tbl_xml.append('</w:tr>')
                tbl_xml.append('</w:tbl>')
                body_xml.append("".join(tbl_xml))
            elif stype == "signatures":
                body_xml.append("""
                <w:tbl>
                  <w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders><w:top w:val="none"/><w:bottom w:val="none"/><w:left w:val="none"/><w:right w:val="none"/><w:insideH w:val="none"/><w:insideV w:val="none"/></w:tblBorders></w:tblPr>
                  <w:tr>
                    <w:tc>
                      <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="400" w:after="40"/></w:pPr><w:r><w:t>__________________________________</w:t></w:r></w:p>
                      <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="18"/></w:rPr><w:t>DESPACHO DEL GOBERNADOR</w:t></w:r></w:p>
                      <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr><w:r><w:rPr><w:color w:val="64748B"/><w:sz w:val="16"/></w:rPr><w:t>Gobernación del Estado Monagas</w:t></w:r></w:p>
                    </w:tc>
                    <w:tc>
                      <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="400" w:after="40"/></w:pPr><w:r><w:t>__________________________________</w:t></w:r></w:p>
                      <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="18"/></w:rPr><w:t>DIRECCIÓN TÉCNICA Y PROYECTOS</w:t></w:r></w:p>
                      <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr><w:r><w:rPr><w:color w:val="64748B"/><w:sz w:val="16"/></w:rPr><w:t>Equipo Desarrollador MIGATO</w:t></w:r></w:p>
                    </w:tc>
                  </w:tr>
                </w:tbl>
                """)

        # Add page break if not last page
        if p_idx < len(pages) - 1:
            body_xml.append('<w:p><w:r><w:br w:type="page"/></w:r></w:p>')

    doc_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    {"".join(body_xml)}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1100" w:right="1100" w:bottom="1100" w:left="1100"/>
    </w:sectPr>
  </w:body>
</w:document>"""

    with zipfile.ZipFile(filename, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr('[Content_Types].xml', content_types)
        z.writestr('_rels/.rels', rels)
        z.writestr('word/_rels/document.xml.rels', doc_rels)
        z.writestr('word/styles.xml', styles)
        z.writestr('word/document.xml', doc_xml)
    print(f"File created: {filename}")

# Define exactly 3 pages
page1 = [
    {"type": "header_block", "title": "PROYECTO MIGATO: SISTEMA INTEGRAL DE GOBIERNO DIGITAL"},
    {"type": "callout", "text": "Documento Oficial: DOC-GOB-MIGATO-2026-REV2 | Clasificación: Uso Ejecutivo y Toma de Decisiones | Estado Monagas"},
    {"type": "h1", "text": "1. Resumen Ejecutivo de Alto Nivel"},
    {"type": "p", "text": "El Proyecto MIGATO (Módulo Integral de Gestión, Auditoría y Territorio Organizado) representa el salto estratégico hacia la modernización del Estado Monagas. Unifica en una sola plataforma de soberanía tecnológica cuatro ejes vitales de la gestión pública, sustituyendo la burocracia en papel por un sistema en tiempo real que permite a la Dirección Regional y a su equipo de mando tomar decisiones informadas con rigor científico y sensibilidad social."},
    {"type": "bullet", "bold": "Soberanía y Seguridad:", "text": "Desarrollado sobre estándares abiertos y seguros, sin pago de licencias en divisas ni dependencia extranjera."},
    {"type": "bullet", "bold": "Decisiones en Tiempo Real:", "text": "Sustituye informes estáticos y retrasados por un panel dinámico con indicadores y alertas tempranas inmediatas."},
    {"type": "bullet", "bold": "Estructura Ciudadana Conectada:", "text": "Censo territorial con capacidad de operar sin conexión a internet y sincronización automática al servidor central."},
    {"type": "bullet", "bold": "Visión de Estado Unificada:", "text": "Información centralizada que elimina la duplicidad de esfuerzos entre dependencias y optimiza el presupuesto regional."},
    {"type": "h1", "text": "2. Los 4 Módulos Operativos del Ecosistema"},
    {"type": "h2", "text": "Módulo 1: Despacho Celular y Notificaciones Oficiales"},
    {"type": "p", "text": "Canal seguro y cifrado punto a punto entre la Dirección General y los 13 alcaldes y 44 coordinadores parroquiales."},
    {"type": "h2", "text": "Módulo 2: Censo Sectorial y Registro Ciudadano"},
    {"type": "p", "text": "Herramienta de empadronamiento social para conectar a las comunidades y sectores directamente con la sala de coordinación."}
]

page2 = [
    {"type": "h2", "text": "Módulo 1: Despacho Ejecutivo y Sala Situacional"},
    {"type": "p", "text": "Centro de mando estratégico para supervisar el estado general de Monagas en una sola pantalla unificada."},
    {"type": "bullet", "bold": "¿Qué hace?:", "text": "Monitorea en vivo servicios básicos (agua, electricidad, gas), red hospitalaria, seguridad y ejecución de obras."},
    {"type": "bullet", "bold": "Beneficio Estratégico:", "text": "Detección inmediata de fallas y emisión directa de órdenes de trabajo con seguimiento digital de cumplimiento."},
    
    {"type": "h2", "text": "Módulo 2: Censo Sectorial y Registro Ciudadano"},
    {"type": "p", "text": "Herramienta de empadronamiento territorial para organizar y atender a las comunidades directamente desde la dirección operativa."},
    {"type": "bullet", "bold": "¿Qué hace?:", "text": "Levantamiento casa por casa de datos socioeconómicos, personas vulnerables y requerimientos de medicamentos."},
    {"type": "bullet", "bold": "Capacidad Offline:", "text": "Opera en sectores sin cobertura celular; al detectar señal, los datos se sincronizan solos al servidor central."},
    {"type": "bullet", "bold": "Beneficio Social:", "text": "Elimina intermediarios y duplicidades, asegurando que las ayudas lleguen a quienes verdaderamente las necesitan."},

    {"type": "h2", "text": "Módulo 3: Auditoría y Monitoreo Electoral CNE"},
    {"type": "p", "text": "Sistema de acompañamiento cívico para salvaguardar la transparencia en los procesos electorales."},
    {"type": "bullet", "bold": "¿Qué hace?:", "text": "Monitoreo del 100% de centros de votación y mesas electorales de Monagas, verificando actas e incidencias."},
    {"type": "bullet", "bold": "Garantía Democrática:", "text": "Proporciona respaldo técnico y estadístico blindado para garantizar la tranquilidad y paz institucional."},

    {"type": "h2", "text": "Módulo 4: Cartografía Digital 3D y Gemelo Digital"},
    {"type": "p", "text": "Modelo tridimensional georreferenciado de Maturín para la planificación urbana y prevención de desastres."},
    {"type": "bullet", "bold": "¿Qué hace?:", "text": "Muestra la topografía, drenajes, tendido eléctrico, vialidad y simula riesgos de inundación en temporada de lluvias."},
    {"type": "bullet", "bold": "Impacto Urbano:", "text": "Planificación científica de rutas de aseo urbano, mantenimiento de quebradas y obras públicas prioritarias."}
]

page3 = [
    {"type": "h1", "text": "4. Matriz de Impacto Estratégico"},
    {
        "type": "table",
        "headers": ["Módulo", "Objetivo Clave", "Beneficio Poblacional", "Ventaja Estratégica"],
        "rows": [
            ["1. Despacho", "Control de gestión y KPIs en vivo", "Respuestas más rápidas a problemas comunitarios", "Toma de decisiones en minutos con datos reales"],
            ["2. Censo Sectorial", "Empadronamiento social offline", "Priorización de familias vulnerables y medicinas", "Eliminación de intermediarios y asignación justa"],
            ["3. Auditoría CNE", "Monitoreo electoral transparente", "Confianza cívica y preservación de la paz", "Soporte técnico blindado ante cualquier auditoría"],
            ["4. Cartografía 3D", "Gemelo digital urbano", "Seguridad preventiva ante inundaciones y fallas", "Planificación de obras con precisión milimétrica"]
        ]
    },
    {"type": "h1", "text": "5. Viabilidad Técnica y Continuidad Operativa"},
    {"type": "bullet", "bold": "Arquitectura Soberana:", "text": "Instalable en servidores locales y seguros del Comando Regional sin costos recurrentes."},
    {"type": "bullet", "bold": "Fácil Adopción:", "text": "Diseñado con interfaces amigables para funcionarios y promotores sociales sin formación técnica previa."},
    {"type": "callout", "text": "Conclusión: MIGATO posiciona a Monagas como el estado pionero en soberanía de datos y gestión territorial digital en Venezuela, combinando rigor técnico con profundo impacto humano."},
    {"type": "signatures"}
]

build_docx(
    "/home/diego/Documents/antigravity/zealous-mendel/MIGATO_Informe_Oficial_Gobernacion.docx",
    "PROYECTO MIGATO: SISTEMA INTEGRAL DE GOBIERNO DIGITAL",
    [page1, page2, page3]
)
