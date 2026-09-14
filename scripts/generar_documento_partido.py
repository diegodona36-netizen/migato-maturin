#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de Documento Oficial Word (.docx)
Propuesta Técnico-Estratégica y Presupuesto Mínimo Operativo: Plataforma MIGATO Monagas
Destinado al Comando Político y Estratégico de El Gato Briceño • Movimiento Independiente MIGATO
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
                    <w:rPr><w:b/><w:color w:val="0369A1"/><w:sz w:val="18"/></w:rPr>
                    <w:t>ESTADO MONAGAS • MOVIMIENTO INDEPENDIENTE GANAMOS TODOS (MIGATO) • COMANDO EL GATO BRICEÑO</w:t>
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
                      <w:left w:val="single" w:sz="24" w:space="12" w:color="0284C7"/>
                    </w:pBdr>
                    <w:shd w:val="clear" w:color="auto" w:fill="F0F9FF"/>
                    <w:spacing w:before="80" w:after="80"/>
                  </w:pPr>
                  <w:r>
                    <w:rPr><w:i/><w:color w:val="0369A1"/><w:sz w:val="20"/></w:rPr>
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
                    <w:rPr><w:b/><w:color w:val="0284C7"/></w:rPr>
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
                      <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="19"/></w:rPr><w:t>COMANDO ESTRATÉGICO MIGATO</w:t></w:r></w:p>
                      <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr><w:r><w:rPr><w:color w:val="64748B"/><w:sz w:val="17"/></w:rPr><w:t>Equipo Político de El Gato Briceño • Monagas</w:t></w:r></w:p>
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
# CONTENIDO DE LA PROPUESTA PARA MIGATO / EL GATO BRICEÑO
# ==============================================================

page1 = [
    {"type": "header_block", "title": "PROPUESTA TÉCNICO-ESTRATÉGICA Y PRESUPUESTO MÍNIMO OPERATIVO:\nPLATAFORMA TERRITORIAL MIGATO MONAGAS 2026"},
    {"type": "callout", "text": "Documento Ejecutivo para Evaluación y Financiamiento Inmediato | Destinatario: Comando Estratégico MIGATO / Despacho de El Gato Briceño | Solicitud: Servidor VPS Dedicado y Dominio Institucional (Fase 1)"},
    {"type": "h1", "text": "1. ¿Qué es MIGATO y por qué lo necesita nuestro movimiento con urgencia?"},
    {"type": "p", "text": "MIGATO (Módulo Integral de Gestión, Auditoría y Territorio Organizado) es el arma tecnológica, gerencial y de inteligencia electoral desarrollada a la medida para devolverle al equipo de El Gato Briceño el control territorial de Monagas en tiempo real. Frente a los abusos y manipulaciones del régimen oficialista, nuestra estructura no puede seguir dependiendo de grupos informales de WhatsApp vulnerables a espionaje, infiltraciones y pérdida de información confidencial."},
    {"type": "p", "text": "Con MIGATO, todo el estado Monagas queda interconectado en un sistema privado, 100% independiente y blindado contra hackeos y confiscaciones en la calle, con estándares de alta gerencia capitalista."},
    {"type": "h1", "text": "2. Los 5 Módulos de MIGATO explicados en sencillo"},
    {"type": "bullet", "bold": "Módulo 1 • Despacho Celular Seguro (/despacho/):", "text": "Permite a la Sala de Mando de El Gato Briceño enviar directrices y enlaces de reporte exclusivos a los 44 enlaces parroquiales de Monagas con un toque a su WhatsApp. No se comparten claves de acceso; cada responsable tiene su token privado intransferible."},
    {"type": "bullet", "bold": "Módulo 2 • Censo Territorial y Protocolo de Buzón Ciego (/carga/):", "text": "Nuestros activistas y jefes de sector registran familias, necesidades reales y electores seguros desde su teléfono móvil. Al pulsar 'Enviar', la memoria del teléfono queda en CERO BYTES (0 residuos). Si a un militante o voluntario le retienen el teléfono, nadie puede extraer la base de datos de nuestro movimiento."},
    {"type": "bullet", "bold": "Módulo 3 • Padrón Electoral y Auditoría CNE con Actas QR (/centros-maturin/):", "text": "Mapa geoestratégico de las 175 escuelas electorales de Maturín y sus 419.000 electores clasificados por fidelidad de voto independiente. Incluye lector de códigos QR para auditar las actas de votación en solo 2 segundos y blindar la victoria frente a cualquier intento de trampa oficialista."},
    {"type": "bullet", "bold": "Módulo 4 • Cartografía Satelital 3D y Efecto Velo Blanco (/earth-monagas/):", "text": "Consola satelital de alta definición para El Gato Briceño y el Estado Mayor. Al seleccionar una parroquia en disputa (ej. Alto de Los Godos o Las Cocuizas), el resto del mapa se atenúa con niebla blanca para concentrar el análisis exclusivamente en el área de combate."},
    {"type": "bullet", "bold": "Módulo 5 • Red Hospitalaria y Auditoría de Servicios (/salud-monagas/):", "text": "Auditoría en tiempo real de los 84 centros asistenciales de Monagas con semáforo de riesgo (plantas eléctricas, agua, quirófanos y camas). Evidencia el colapso actual de la red de salud para contrastarlo con el modelo gerencial y eficiente de la gestión de El Gato."}
]

page2 = [
    {"type": "h1", "text": "3. ¿Por qué solicitamos HOY solo un Presupuesto Mínimo (VPS y Dominio)?"},
    {"type": "p", "text": "Con visión gerencial y máxima eficiencia de recursos, no estamos pidiendo un presupuesto abultado. El software ya fue completamente programado. Para poner a rodar los motores en la calle solo requerimos la infraestructura técnica indispensable:"},
    {"type": "bullet", "bold": "1. Un Servidor Virtual Privado (VPS Dedicado Soberano):", "text": "Es la 'computadora central en la nube' privada y exclusiva donde residirá el sistema y la base de datos encriptada. Este servidor nos permitirá realizar pruebas de estrés con tráfico real y ejecutar TEST DE HACKING ÉTICO / PENTESTING para asegurar que los hackers u operadores cibernéticos del oficialismo no puedan vulnerar la plataforma ni tumbarla el día electoral."},
    {"type": "bullet", "bold": "2. Un Dominio Institucional Oficial con Candado SSL (HTTPS 256 bits):", "text": "Para que los coordinadores parroquiales entren a una dirección web seria, oficial y cifrada de extremo a extremo, eliminando enlaces sospechosos o gratuitos que generan desconfianza en la militancia."},
    {"type": "h1", "text": "4. Tabla de Presupuesto Mínimo Requerido (Fase de Arranque)"},
    {"type": "p", "text": "A continuación se desglosa el costo real y transparente para activar la infraestructura técnica durante un año completo:"},
    {"type": "table", "headers": ["Concepto Técnico", "Especificación Mínima", "Costo Mensual", "Costo Anual Total"], "rows": [
        ["Servidor Cloud VPS Dedicado", "4 vCPU / 8 GB RAM / 100 GB SSD NVMe (Protección Anti-DDoS)", "$20.00 USD", "$240.00 USD"],
        ["Dominio Institucional Oficial", "Registro anual + Certificado SSL wildcard (Cifrado militar 256-bit)", "$1.50 USD", "$18.00 USD"],
        ["IP Pública Fija Dedicada", "IP exclusiva para sala de mando y base de datos (seguridad estricta)", "$3.00 USD", "$36.00 USD"],
        ["Herramientas de Pentesting y Hacking Ético", "Software libre (FOSS) de pruebas de penetración, firewall y blindaje", "$0.00", "$0.00 (Incluido)"],
        ["TOTAL MÍNIMO DE ARRANQUE", "Infraestructura lista para pruebas de campo y seguridad", "~$24.50 USD / mes", "$294.00 USD / AÑO"]
    ]},
    {"type": "callout", "text": "COMPARATIVA DE MERCADO: Una plataforma a medida de 5 módulos cuesta entre $20.000 y $35.000 USD en empresas de software privadas. Aquí el desarrollo ya está completado y entregado al equipo de El Gato Briceño; únicamente se solicita el costo técnico de hospedaje de menos de $25 dólares al mes."}
]

page3 = [
    {"type": "h1", "text": "5. Estrategia por Fases: Arranque Mínimo vs. Consolidación de Sala"},
    {"type": "p", "text": "Para garantizar la máxima rentabilidad de la inversión, el despliegue se organiza en dos fases ordenadas:"},
    {"type": "bullet", "bold": "FASE 1 (INMEDIATA - Financiada con este Presupuesto Mínimo):", "text": "Despliegue en el VPS contratado, configuración de cortafuegos y bases de datos, pruebas de estrés con 3 parroquias piloto (Las Cocuizas, San Simón, Los Godos) y ejecución de pruebas de hacking ético para certificar blindaje total."},
    {"type": "bullet", "bold": "FASE 2 (CONSOLIDACIÓN FÍSICA - A mediano plazo cuando el Comando lo disponga):", "text": "Equipamiento de la Sala Situacional física de El Gato Briceño: computadoras fijas para operadores, pantallas de 55 pulgadas para videowall, sistema de respaldo eléctrico (inversor de corriente y baterías UPS para que la sala nunca se apague ante los cortes de luz de Corpoelec) y enlace de internet de respaldo."},
    {"type": "h1", "text": "6. Conclusión y Solicitud de Aprobación"},
    {"type": "p", "text": "Contar con la plataforma MIGATO en un servidor propio por apenas $294 USD al año representa para nuestro movimiento una ventaja estratégica incalculable: control exacto de la maquinaria, auditoría en tiempo real de centros de salud y escuelas, y soberanía de datos que no depende de terceros ni de plataformas del régimen."},
    {"type": "p", "text": "Se solicita formalmente la aprobación del monto mínimo de $294.00 USD para la contratación inmediata del VPS y dominio oficial de MIGATO."},
    {"type": "signatures"}
]

if __name__ == "__main__":
    out_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "MIGATO_Propuesta_Presupuesto_Minimo_Partido.docx")
    build_docx(out_path, 
               "PROPUESTA TÉCNICO-ESTRATÉGICA Y PRESUPUESTO MÍNIMO OPERATIVO: PLATAFORMA TERRITORIAL MIGATO MONAGAS", 
               [page1, page2, page3])
