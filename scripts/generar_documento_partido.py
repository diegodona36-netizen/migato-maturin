#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de Documento Oficial Word (.docx)
Propuesta Técnico-Política y Presupuesto Mínimo Operativo: Plataforma MIGATO Monagas
Destinado a la Dirección Política del Partido y Gobernación del Estado Monagas
"""

import zipfile
import html
import os

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
      <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
      <w:sz w:val="22"/>
      <w:color w:val="1E293B"/>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:line="260" w:lineRule="auto" w:after="90"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:pPr>
      <w:spacing w:before="200" w:after="90"/>
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
                    <w:t>REPÚBLICA BOLIVARIANA DE VENEZUELA • PARTIDO SOCIALISTA UNIDO DE VENEZUELA (PSUV) • ESTADO MONAGAS</w:t>
                  </w:r>
                </w:p>
                <w:p>
                  <w:pPr>
                    <w:jc w:val="center"/>
                    <w:spacing w:before="40" w:after="100"/>
                  </w:pPr>
                  <w:r>
                    <w:rPr><w:b/><w:color w:val="0F172A"/><w:sz w:val="30"/></w:rPr>
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
                  <w:pPr><w:jc w:val="both"/><w:spacing w:after="80"/></w:pPr>
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
                    <w:rPr><w:i/><w:color w:val="1E293B"/><w:sz w:val="20"/></w:rPr>
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
                tbl_xml = ['<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders><w:top w:val="single" w:sz="8" w:color="CBD5E1"/><w:bottom w:val="single" w:sz="8" w:color="CBD5E1"/><w:insideH w:val="single" w:sz="4" w:color="E2E8F0"/></w:tblBorders></w:tblPr>']
                tbl_xml.append('<w:tr><w:trPr><w:tblHeader/></w:trPr>')
                for h in headers:
                    tbl_xml.append(f'<w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="0F172A"/></w:tcPr><w:p><w:pPr><w:spacing w:before="70" w:after="70"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="20"/></w:rPr><w:t>{escape(h)}</w:t></w:r></w:p></w:tc>')
                tbl_xml.append('</w:tr>')
                for idx, r in enumerate(rows):
                    bg = 'F8FAFC' if idx % 2 == 1 else 'FFFFFF'
                    tbl_xml.append('<w:tr>')
                    for c in r:
                        tbl_xml.append(f'<w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="{bg}"/></w:tcPr><w:p><w:pPr><w:spacing w:before="50" w:after="50"/></w:pPr><w:r><w:rPr><w:sz w:val="19"/></w:rPr><w:t>{escape(c)}</w:t></w:r></w:p></w:tc>')
                    tbl_xml.append('</w:tr>')
                tbl_xml.append('</w:tbl>')
                body_xml.append("".join(tbl_xml))
            elif stype == "signatures":
                body_xml.append("""
                <w:tbl>
                  <w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders><w:top w:val="none"/><w:bottom w:val="none"/><w:left w:val="none"/><w:right w:val="none"/><w:insideH w:val="none"/><w:insideV w:val="none"/></w:tblBorders></w:tblPr>
                  <w:tr>
                    <w:tc>
                      <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="350" w:after="30"/></w:pPr><w:r><w:t>__________________________________</w:t></w:r></w:p>
                      <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="19"/></w:rPr><w:t>DIRECCIÓN POLÍTICA / ESTADO MAYOR</w:t></w:r></w:p>
                      <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr><w:r><w:rPr><w:color w:val="64748B"/><w:sz w:val="17"/></w:rPr><w:t>Partido Socialista Unido de Venezuela • Monagas</w:t></w:r></w:p>
                    </w:tc>
                    <w:tc>
                      <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="350" w:after="30"/></w:pPr><w:r><w:t>__________________________________</w:t></w:r></w:p>
                      <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="19"/></w:rPr><w:t>RESPONSABLE TÉCNICO Y DESARROLLO</w:t></w:r></w:p>
                      <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr><w:r><w:rPr><w:color w:val="64748B"/><w:sz w:val="17"/></w:rPr><w:t>Equipo Desarrollador Plataforma MIGATO</w:t></w:r></w:p>
                    </w:tc>
                  </w:tr>
                </w:tbl>
                """)

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
    print(f"Documento Word generado exitosamente: {filename}")

# ==============================================================
# CONTENIDO DE LA PROPUESTA PARA EL PARTIDO (LENGUAJE SENCILLO)
# ==============================================================

page1 = [
    {"type": "header_block", "title": "PROPUESTA TÉCNICO-POLÍTICA Y PRESUPUESTO MÍNIMO OPERATIVO:\nPLATAFORMA MIGATO MONAGAS 2026"},
    {"type": "callout", "text": "Documento para Evaluación y Financiamiento Inmediato | Destinatario: Dirección del Partido y Despacho del Gobernador | Solicitud: Servidor VPS y Dominio Institucional (Fase 1 de Pruebas)"},
    {"type": "h1", "text": "1. ¿Qué es MIGATO y por qué lo necesita el Partido con urgencia?"},
    {"type": "p", "text": "MIGATO (Módulo Integral de Gestión, Auditoría y Territorio Organizado) es la herramienta tecnológica que le devuelve al Partido y a la Gobernación el control total de la información de calle en tiempo real. Hoy en día, la recolección de censos, reportes de servicios y control de centros de votación se hace de forma desordenada en cuadernos de papel o en grupos de WhatsApp vulnerables a filtraciones, pérdida de actas y borrado accidental."},
    {"type": "p", "text": "Con MIGATO, todo el estado Monagas queda interconectado en un sistema centralizado, 100% soberano (sin pagar licencias a empresas extranjeras) y blindado contra hackeos y decomisos en la calle."},
    {"type": "h1", "text": "2. Los 5 Módulos de MIGATO explicados en sencillo"},
    {"type": "bullet", "bold": "Módulo 1 • Despacho Celular Seguro (/despacho/):", "text": "Permite enviar órdenes oficiales y formularios de carga a los 44 enlaces parroquiales de Monagas con un solo clic a su WhatsApp. No se comparten contraseñas maestras; cada enlace tiene su acceso propio blindado."},
    {"type": "bullet", "bold": "Módulo 2 • Censo Territorial y Protocolo de Buzón Ciego (/carga/):", "text": "Los cuadros de UBCh y comunidad registran familias, necesidades de salud, CLAP y 1x10 desde su teléfono. Al pulsar 'Enviar', la memoria del teléfono queda en CERO BYTES (0 residuos). Si a un compañero le retienen el teléfono, nadie puede extraer la data del partido."},
    {"type": "bullet", "bold": "Módulo 3 • Padrón Electoral y Auditoría CNE con Actas QR (/centros-maturin/):", "text": "Mapa geoestratégico de las 175 escuelas electorales de Maturín y sus 419.000 electores clasificados por intención de voto (duro, blando, indeciso). Incluye lector de códigos QR para auditar las actas de votación en solo 2 segundos."},
    {"type": "bullet", "bold": "Módulo 4 • Cartografía Satelital 3D y Efecto Velo Blanco (/earth-monagas/):", "text": "Permite al Gobernador y a la Sala de Mando ver el mapa satelital del estado sin enredos. Al seleccionar una parroquia, las demás se atenúan con niebla blanca para que el equipo se concentre exclusivamente en el área de combate."},
    {"type": "bullet", "bold": "Módulo 5 • Red Hospitalaria y Pre-Diagnóstico de Salud (/salud-monagas/):", "text": "Diagnóstico de los 84 centros de salud de Monagas (hospitales, ambulatorios, CDIs) con semáforo de riesgo en tiempo real (estado de planta eléctrica, agua, gases medicinales, quirófanos y camas) para solucionar problemas antes de que estallen denuncias públicas."}
]

page2 = [
    {"type": "h1", "text": "3. ¿Por qué solicitamos HOY solo un Presupuesto Mínimo (VPS y Dominio)?"},
    {"type": "p", "text": "Para arrancar de forma seria y responsable, no estamos pidiendo un presupuesto millonario de entrada. Para poner a rodar la plataforma solo se requiere la infraestructura técnica básica e indispensable:"},
    {"type": "bullet", "bold": "1. Un Servidor Virtual Privado (VPS):", "text": "Es la 'computadora central en la nube' privada y soberana donde vivirá el sistema y la base de datos encriptada. Este servidor nos permitirá realizar pruebas de estrés con cientos de usuarios simultáneos y ejecutar TEST DE HACKING / PENTESTING DE SEGURIDAD para verificar que el sistema no pueda ser tumbado ni vulnerado por adversarios antes de que lo use toda la militancia."},
    {"type": "bullet", "bold": "2. Un Dominio Institucional Seguro (.com, .org o .gob.ve con certificado SSL/HTTPS):", "text": "Para que los enlaces parroquiales y directores entren a una dirección web seria, oficial y encriptada (con el candado verde de seguridad), eliminando enlaces genéricos o gratuitos que generan desconfianza."},
    {"type": "h1", "text": "4. Tabla de Presupuesto Mínimo Requerido (Fase de Arranque)"},
    {"type": "p", "text": "A continuación se desglosa el costo real y transparente para activar la infraestructura durante un período de 6 a 12 meses:"},
    {"type": "table", "headers": ["Concepto Técnico", "Especificación Mínima", "Costo Mensual", "Costo Anual Total"], "rows": [
        ["Servidor Cloud VPS Dedicado", "4 vCPU / 8 GB RAM / 100 GB SSD NVMe (Protección Anti-DDoS)", "$20.00 USD", "$240.00 USD"],
        ["Dominio Institucional Oficial", "Registro anual + Certificado SSL wildcard (Cifrado 256-bit)", "$1.50 USD", "$18.00 USD"],
        ["IP Pública Fija y Enrutamiento", "IP dedicada exclusiva para sala de mando y base de datos", "$3.00 USD", "$36.00 USD"],
        ["Herramientas de Auditoría y Hacking Ético", "Software de pruebas de penetración, firewall y escaneo de vulnerabilidades", "$0.00 (FOSS)", "$0.00 (Incluido)"],
        ["TOTAL MÍNIMO DE ARRANQUE", "Infraestructura lista para pruebas de campo y seguridad", "~$24.50 USD / mes", "$294.00 USD / AÑO"]
    ]},
    {"type": "callout", "text": "NOTA COMPARATIVA DE MERCADO: El desarrollo de una plataforma a medida como MIGATO cuesta entre $15.000 y $30.000 USD en el sector privado. Aquí el desarrollo ya está listo y es 100% propio del equipo; únicamente se solicita el costo de hospedaje técnico de menos de $25 dólares al mes."}
]

page3 = [
    {"type": "h1", "text": "5. Estrategia por Fases: Arranque Mínimo vs. Consolidación de Sala"},
    {"type": "p", "text": "La implementación se estructurará en dos etapas claramente diferenciadas para garantizar la máxima rentabilidad de los recursos del Partido:"},
    {"type": "bullet", "bold": "FASE 1 (INMEDIATA - Financiada con este Presupuesto Mínimo):", "text": "Despliegue en el VPS contratado, configuración de cortafuegos y bases de datos, pruebas de estrés con 3 parroquias piloto (Las Cocuizas, San Simón, Los Godos) y ejecución de pruebas de hacking ético para garantizar cero vulnerabilidades."},
    {"type": "bullet", "bold": "FASE 2 (CONSOLIDACIÓN FÍSICA - A mediano plazo cuando el partido lo disponga):", "text": "Equipamiento de la Sala Situacional física: asignación de computadoras dedicadas, pantallas de 55 pulgadas para videowall, sistema de respaldo eléctrico (inversor de corriente / baterías UPS para que la sala nunca se apague por cortes de luz) y conectividad de alta velocidad."},
    {"type": "h1", "text": "6. Conclusión y Solicitud de Aprobación"},
    {"type": "p", "text": "Contar con la plataforma MIGATO en un servidor propio por apenas $294 USD al año representa para el Partido una ventaja política y electoral determinante: control exacto de la maquinaria, auditoría de centros de salud y escuelas, y soberanía de datos que no depende de terceros ni de empresas privadas."},
    {"type": "p", "text": "Se solicita formalmente la aprobación del monto mínimo de $294.00 USD para la contratación inmediata del VPS y dominio institucional."},
    {"type": "signatures"}
]

if __name__ == "__main__":
    out_path = os.path.join(os.path.dirname(__file__), "MIGATO_Propuesta_Presupuesto_Minimo_Partido.docx")
    build_docx(out_path, 
               "PROPUESTA TÉCNICO-POLÍTICA Y PRESUPUESTO MÍNIMO OPERATIVO: PLATAFORMA MIGATO MONAGAS", 
               [page1, page2, page3])
