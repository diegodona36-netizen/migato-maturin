#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador Oficial de Actas de Reunión MIGATO Monagas 2026
Estándar Institucional IUTIRLA / MIGATO • Compilación Nativa OpenXML (.docx)
Movimiento Independiente Ganamos Todos (MIGATO) • Estado Monagas
"""

import os
import sys
import html
import zipfile
import json
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ASSETS_DIR = PROJECT_ROOT / "assets"
LOGO_PATH = ASSETS_DIR / "logo-migato.png"

def escape(text):
    return html.escape(str(text))

def build_acta_docx(data, output_path):
    """
    data dict format:
    {
      "titulo": "Reunión Estratégica de Comando...",
      "fecha": "2026-09-25",
      "duracion": "02:45:10",
      "lugar": "Sede Central MIGATO, Maturín",
      "participantes": ["José Gregorio El Gato Briceño", "Ing. Diego Donado", ...],
      "resumen_ejecutivo": "...",
      "lluvia_ideas": ["Idea 1", "Idea 2", ...],
      "debates": [
        {"tema": "...", "opinion": "...", "contraopinion": "...", "resolucion": "..."}
      ],
      "acuerdos": [
        {"tarea": "...", "responsable": "...", "plazo": "...", "estado": "..."}
      ],
      "pendientes": ["Punto 1", "Punto 2"]
    }
    """
    has_logo = LOGO_PATH.exists()
    logo_bytes = LOGO_PATH.read_bytes() if has_logo else b""

    # Content Types
    content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>
  <Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
</Types>"""

    # Package Relationships
    rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"""

    # Document Relationships
    doc_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rIdHeader1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>
  <Relationship Id="rIdFooter1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
"""
    if has_logo:
        doc_rels += '  <Relationship Id="rIdLogoDoc" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo.png"/>\n'
    doc_rels += "</Relationships>"

    # Styles
    styles_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
        <w:sz w:val="23"/>
        <w:szCs w:val="23"/>
        <w:color w:val="000000"/>
        <w:lang w:val="es-VE"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:line="280" w:lineRule="auto" w:before="0" w:after="140"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
</w:styles>"""

    # Header
    header_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr>
      <w:pStyle w:val="Header"/>
      <w:jc w:val="right"/>
      <w:spacing w:after="100"/>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
        <w:sz w:val="17"/>
        <w:color w:val="555555"/>
        <w:i/>
      </w:rPr>
      <w:t>COMANDO REGIONAL MIGATO • ACTA OFICIAL DE SALA SITUACIONAL</w:t>
    </w:r>
  </w:p>
</w:hdr>"""

    # Footer
    footer_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr>
      <w:pStyle w:val="Footer"/>
      <w:jc w:val="center"/>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
        <w:sz w:val="18"/>
        <w:color w:val="666666"/>
      </w:rPr>
      <w:t xml:space="preserve">Página </w:t>
    </w:r>
    <w:fldSimple w:instr="PAGE"/>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
        <w:sz w:val="18"/>
        <w:color w:val="666666"/>
      </w:rPr>
      <w:t xml:space="preserve"> de </w:t>
    </w:r>
    <w:fldSimple w:instr="NUMPAGES"/>
  </w:p>
</w:ftr>"""

    # Build Document Body
    titulo = data.get("titulo", "Acta Oficial de Reunión de Mando")
    fecha = data.get("fecha", datetime.now().strftime("%Y-%m-%d"))
    duracion = data.get("duracion", "02:00:00")
    lugar = data.get("lugar", "Comando Regional MIGATO, Maturín")
    participantes = data.get("participantes", ["José Gregorio El Gato Briceño", "Ing. Diego Donado"])
    resumen = data.get("resumen_ejecutivo", "Sin resumen disponible.")
    ideas = data.get("lluvia_ideas", [])
    debates = data.get("debates", [])
    acuerdos = data.get("acuerdos", [])
    pendientes = data.get("pendientes", [])

    body_xml = []

    # Cintillo Institucional
    cintillo = [
        "REPÚBLICA DE VENEZUELA",
        "ESTADO MONAGAS • SALA SITUACIONAL Y CENTRAL DE MANDO",
        "MOVIMIENTO INDEPENDIENTE GANAMOS TODOS (MIGATO)"
    ]
    for c in cintillo:
        body_xml.append(f"""
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="40" w:line="240" w:lineRule="auto"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="21"/></w:rPr><w:t>{escape(c)}</w:t></w:r>
    </w:p>""")

    # Título Principal
    body_xml.append(f"""
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:before="240" w:after="160"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="1e1554"/></w:rPr><w:t>{escape(titulo.upper())}</w:t></w:r>
    </w:p>""")

    # Ficha Técnica
    body_xml.append(f"""
    <w:p>
      <w:pPr><w:jc w:val="both"/><w:spacing w:before="120" w:after="80"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="1e1554"/></w:rPr><w:t>1. FICHA TÉCNICA Y CONTEXTO OPERATIVO</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="both"/><w:ind w:firstLine="567"/></w:pPr>
      <w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">Fecha: </w:t></w:r><w:r><w:t xml:space="preserve">{escape(fecha)}   |   </w:t></w:r>
      <w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">Duración de Grabación: </w:t></w:r><w:r><w:t xml:space="preserve">{escape(duracion)}   |   </w:t></w:r>
      <w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">Sede / Jurisdicción: </w:t></w:r><w:r><w:t>{escape(lugar)}</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="both"/><w:ind w:firstLine="567"/></w:pPr>
      <w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">Asistentes / Vocería: </w:t></w:r><w:r><w:t>{escape(", ".join(participantes))}</w:t></w:r>
    </w:p>""")

    # Resumen Ejecutivo
    body_xml.append(f"""
    <w:p>
      <w:pPr><w:jc w:val="both"/><w:spacing w:before="180" w:after="80"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="1e1554"/></w:rPr><w:t>2. RESUMEN EJECUTIVO (BLUF)</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="both"/><w:ind w:firstLine="567"/></w:pPr>
      <w:r><w:t>{escape(resumen)}</w:t></w:r>
    </w:p>""")

    # Lluvia de Ideas
    if ideas:
        body_xml.append("""
    <w:p>
      <w:pPr><w:jc w:val="both"/><w:spacing w:before="180" w:after="80"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="1e1554"/></w:rPr><w:t>3. MATRIZ DE LLUVIA DE IDEAS Y PROPUESTAS</w:t></w:r>
    </w:p>""")
        for idx, idea in enumerate(ideas, 1):
            body_xml.append(f"""
    <w:p>
      <w:pPr><w:jc w:val="both"/><w:ind w:left="400" w:hanging="400"/><w:spacing w:after="60"/></w:pPr>
      <w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">• [{idx}] </w:t></w:r><w:r><w:t>{escape(idea)}</w:t></w:r>
    </w:p>""")

    # Matriz Dialéctica: Opiniones vs Contraopiniones
    if debates:
        body_xml.append("""
    <w:p>
      <w:pPr><w:jc w:val="both"/><w:spacing w:before="180" w:after="80"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="1e1554"/></w:rPr><w:t>4. DEBATE DIALÉCTICO: OPINIONES VS. CONTRAOPINIONES</w:t></w:r>
    </w:p>""")
        for d in debates:
            tema = d.get("tema", "Tema en discusión")
            op = d.get("opinion", "")
            contra = d.get("contraopinion", "")
            resol = d.get("resolucion", "")
            body_xml.append(f"""
    <w:p>
      <w:pPr><w:jc w:val="both"/><w:spacing w:before="100" w:after="40"/></w:pPr>
      <w:r><w:rPr><w:b/><w:u w:val="single"/></w:rPr><w:t>Eje: {escape(tema)}</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="both"/><w:ind w:left="400"/><w:spacing w:after="40"/></w:pPr>
      <w:r><w:rPr><w:b/><w:color w:val="059669"/></w:rPr><w:t xml:space="preserve">Propuesta / Argumento A Favor: </w:t></w:r>
      <w:r><w:t>{escape(op)}</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="both"/><w:ind w:left="400"/><w:spacing w:after="40"/></w:pPr>
      <w:r><w:rPr><w:b/><w:color w:val="dc2626"/></w:rPr><w:t xml:space="preserve">Objeción / Contraopinión: </w:t></w:r>
      <w:r><w:t>{escape(contra)}</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="both"/><w:ind w:left="400"/><w:spacing w:after="80"/></w:pPr>
      <w:r><w:rPr><w:b/><w:color w:val="1e1554"/></w:rPr><w:t xml:space="preserve">Resolución de Mando: </w:t></w:r>
      <w:r><w:i/><w:t>{escape(resol)}</w:t></w:r>
    </w:p>""")

    # Acuerdos y Compromisos (Tabla Formal IUTIRLA encabezado gris #EAEAEA)
    if acuerdos:
        body_xml.append("""
    <w:p>
      <w:pPr><w:jc w:val="both"/><w:spacing w:before="180" w:after="80"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="1e1554"/></w:rPr><w:t>5. MATRIZ DE ACUERDOS Y COMPROMISOS ADQUIRIDOS</w:t></w:r>
    </w:p>
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="9360" w:type="dxa"/>
        <w:jc w:val="center"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="6" w:space="0" w:color="000000"/>
          <w:left w:val="none"/>
          <w:bottom w:val="single" w:sz="6" w:space="0" w:color="000000"/>
          <w:right w:val="none"/>
          <w:insideH w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
          <w:insideV w:val="none"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tr>
        <w:trPr><w:tblHeader/></w:trPr>
        <w:tc><w:tcPr><w:tcW w:w="4200" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="EAEAEA"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="left"/><w:spacing w:after="40"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="18"/></w:rPr><w:t>TAREA / COMPROMISO</w:t></w:r></w:p>
        </w:tc>
        <w:tc><w:tcPr><w:tcW w:w="2600" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="EAEAEA"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="left"/><w:spacing w:after="40"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="18"/></w:rPr><w:t>RESPONSABLE</w:t></w:r></w:p>
        </w:tc>
        <w:tc><w:tcPr><w:tcW w:w="1400" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="EAEAEA"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="40"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="18"/></w:rPr><w:t>PLAZO</w:t></w:r></w:p>
        </w:tc>
        <w:tc><w:tcPr><w:tcW w:w="1160" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="EAEAEA"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="40"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="18"/></w:rPr><w:t>ESTADO</w:t></w:r></w:p>
        </w:tc>
      </w:tr>""")
        for a in acuerdos:
            t = a.get("tarea", "")
            r = a.get("responsable", "")
            p = a.get("plazo", "")
            e = a.get("estado", "Aprobado")
            body_xml.append(f"""
      <w:tr>
        <w:tc><w:tcPr><w:tcW w:w="4200" w:type="dxa"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="left"/><w:spacing w:after="30"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:t>{escape(t)}</w:t></w:r></w:p>
        </w:tc>
        <w:tc><w:tcPr><w:tcW w:w="2600" w:type="dxa"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="left"/><w:spacing w:after="30"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="18"/></w:rPr><w:t>{escape(r)}</w:t></w:r></w:p>
        </w:tc>
        <w:tc><w:tcPr><w:tcW w:w="1400" w:type="dxa"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="30"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:t>{escape(p)}</w:t></w:r></w:p>
        </w:tc>
        <w:tc><w:tcPr><w:tcW w:w="1160" w:type="dxa"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="30"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="18"/></w:rPr><w:t>{escape(e)}</w:t></w:r></w:p>
        </w:tc>
      </w:tr>""")
        body_xml.append("</w:tbl>")

    # Puntos Pendientes
    if pendientes:
        body_xml.append("""
    <w:p>
      <w:pPr><w:jc w:val="both"/><w:spacing w:before="180" w:after="80"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="1e1554"/></w:rPr><w:t>6. PUNTOS PENDIENTES PARA LA PRÓXIMA SESIÓN</w:t></w:r>
    </w:p>""")
        for p in pendientes:
            body_xml.append(f"""
    <w:p>
      <w:pPr><w:jc w:val="both"/><w:ind w:left="400" w:hanging="400"/><w:spacing w:after="40"/></w:pPr>
      <w:r><w:rPr><w:b/></w:rPr><w:t>▪ </w:t></w:r><w:r><w:t>{escape(p)}</w:t></w:r>
    </w:p>""")

    # Bloque de Firmas Formal MIGATO
    body_xml.append("""
    <w:p><w:pPr><w:spacing w:before="360" w:after="100"/></w:pPr></w:p>
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="9360" w:type="dxa"/>
        <w:jc w:val="center"/>
        <w:tblBorders>
          <w:top w:val="none"/><w:left w:val="none"/><w:bottom w:val="none"/><w:right w:val="none"/>
          <w:insideH w:val="none"/><w:insideV w:val="none"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tr>
        <w:tc><w:tcPr><w:tcW w:w="4680" w:type="dxa"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr>
            <w:r><w:t>_____________________________________</w:t></w:r>
          </w:p>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr>
            <w:r><w:rPr><w:b/><w:sz w:val="19"/></w:rPr><w:t>JOSÉ GREGORIO BRICEÑO</w:t></w:r>
          </w:p>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr>
            <w:r><w:rPr><w:sz w:val="17"/><w:color w:val="555555"/></w:rPr><w:t>Líder Regional MIGATO • Gobernación 2026</w:t></w:r>
          </w:p>
        </w:tc>
        <w:tc><w:tcPr><w:tcW w:w="4680" w:type="dxa"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr>
            <w:r><w:t>_____________________________________</w:t></w:r>
          </w:p>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr>
            <w:r><w:rPr><w:b/><w:sz w:val="19"/></w:rPr><w:t>ING. DIEGO DONADO</w:t></w:r>
          </w:p>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr>
            <w:r><w:rPr><w:sz w:val="17"/><w:color w:val="555555"/></w:rPr><w:t>Resp. Ciencia, Tecnología y Ciberdefensa</w:t></w:r>
          </w:p>
        </w:tc>
      </w:tr>
    </w:tbl>""")

    # Main Document XML
    doc_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    {''.join(body_xml)}
    <w:sectPr>
      <w:headerReference w:type="default" r:id="rIdHeader1"/>
      <w:footerReference w:type="default" r:id="rIdFooter1"/>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720"/>
    </w:sectPr>
  </w:body>
</w:document>"""

    # Zip everything into .docx
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", content_types)
        zf.writestr("_rels/.rels", rels)
        zf.writestr("word/_rels/document.xml.rels", doc_rels)
        zf.writestr("word/document.xml", doc_xml)
        zf.writestr("word/styles.xml", styles_xml)
        zf.writestr("word/header1.xml", header_xml)
        zf.writestr("word/footer1.xml", footer_xml)
        if has_logo:
            zf.writestr("word/media/logo.png", logo_bytes)

    print(f"✅ Acta oficial DOCX generada con éxito: {output_path}")
    return output_path

if __name__ == "__main__":
    test_data = {
        "titulo": "Reunión de Coordinación Territorial • Alto de Los Godos y Parroquias de Maturín",
        "fecha": datetime.now().strftime("%Y-%m-%d"),
        "duracion": "02:45:10",
        "lugar": "Sede Central de Campaña MIGATO, Maturín",
        "participantes": [
            "José Gregorio El Gato Briceño (Líder Regional)",
            "Ing. Diego Donado (Director de Tecnología y Ciberdefensa)",
            "Coordinador Municipal Maturín",
            "Enlace Parroquial Alto de Los Godos"
        ],
        "resumen_ejecutivo": "Se evaluó la estructura de los 175 centros de votación y el despliegue de los Comandos Gateros en la Parroquia Alto de Los Godos. Se acordó la calibración milimétrica de los sectores La Puente, Los Guaritos y Paramaconi para garantizar cobertura del 100% de los testigos electorales.",
        "lluvia_ideas": [
            "Implementar buzón de carga territorial offline para que los encuestadores no dependan de cobertura celular.",
            "Segmentar la Parroquia Alto de Los Godos en 9 sub-sectores operativos con enlaces directos.",
            "Distribuir actas de escrutinio QR a los testigos de mesa con canal seguro de transmisión."
        ],
        "debates": [
            {
                "tema": "Método de Transmisión de Actas de Escrutinio en Zonas con Interferencia",
                "opinion": "Utilizar exclusivamente enlaces satelitales en centros pilotos de alta votación.",
                "contraopinion": "El costo y peso logístico puede dejar desprotegidos a centros comunitarios periféricos.",
                "resolucion": "Se adoptará un esquema dual: enlace satelital en centros clave y mensajería encriptada local punto a punto en centros menores."
            }
        ],
        "acuerdos": [
            {
                "tarea": "Completar la calibración cartográfica de sectores de Los Godos",
                "responsable": "Ing. Diego Donado",
                "plazo": "48 Horas",
                "estado": "En Curso"
            },
            {
                "tarea": "Designación de testigos para los 38 centros electorales de Los Godos",
                "responsable": "Enlace Parroquial",
                "plazo": "5 Días",
                "estado": "Aprobado"
            }
        ],
        "pendientes": [
            "Definir protocolo de respaldo de energía para los centros de transmisión en caso de caída del SEN.",
            "Reunión de balance con coordinadores de los 12 municipios foráneos el próximo martes."
        ]
    }
    out = PROJECT_ROOT / "vault" / "06-Actas-y-Reuniones" / f"Acta_{datetime.now().strftime('%Y-%m-%d')}_Prueba.docx"
    build_acta_docx(test_data, str(out))
