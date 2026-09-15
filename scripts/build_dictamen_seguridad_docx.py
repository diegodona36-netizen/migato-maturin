#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de Dictamen de Seguridad y Contrainteligencia V3 en Formato DOCX / Google Docs
Movimiento Independiente Ganamos Todos (MIGATO) • Estado Monagas
"""

import os
import sys
import html
import zipfile
from pathlib import Path

PROJECT_ROOT = Path("/home/diego/Documents/antigravity/zealous-mendel")
ASSETS_DIR = PROJECT_ROOT / "assets"
LOGO_PATH = ASSETS_DIR / "logo-migato.png"
DIAG1_PATH = ASSETS_DIR / "diagrama_vulnerabilidad_oraculo.png"
DIAG2_PATH = ASSETS_DIR / "diagrama_blindaje_migato_v3.png"

def escape(text):
    return html.escape(str(text))

def build_docx(filename):
    has_logo = LOGO_PATH.exists()
    logo_bytes = LOGO_PATH.read_bytes() if has_logo else b""
    diag1_bytes = DIAG1_PATH.read_bytes() if DIAG1_PATH.exists() else b""
    diag2_bytes = DIAG2_PATH.read_bytes() if DIAG2_PATH.exists() else b""

    content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>
  <Override PartName="/word/header_first.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>
  <Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
  <Override PartName="/word/footer_first.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
</Types>"""

    rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"""

    doc_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rIdHeader1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>
  <Relationship Id="rIdHeaderFirst" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header_first.xml"/>
  <Relationship Id="rIdFooter1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
  <Relationship Id="rIdFooterFirst" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer_first.xml"/>
"""
    if has_logo:
        doc_rels += '  <Relationship Id="rIdLogo" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo.png"/>\n'
    if diag1_bytes:
        doc_rels += '  <Relationship Id="rIdDiag1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/diag1.png"/>\n'
    if diag2_bytes:
        doc_rels += '  <Relationship Id="rIdDiag2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/diag2.png"/>\n'
    doc_rels += "</Relationships>"

    styles = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>
        <w:sz w:val="23"/>
        <w:szCs w:val="23"/>
        <w:color w:val="0F172A"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:line="360" w:lineRule="auto" w:after="140"/>
        <w:jc w:val="both"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>

  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:pPr>
      <w:spacing w:before="360" w:after="140"/>
      <w:jc w:val="left"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
      <w:b/>
      <w:color w:val="0F172A"/>
      <w:sz w:val="30"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:pPr>
      <w:spacing w:before="240" w:after="100"/>
      <w:jc w:val="left"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
      <w:b/>
      <w:color w:val="0284C7"/>
      <w:sz w:val="26"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/>
    <w:pPr>
      <w:spacing w:before="180" w:after="80"/>
      <w:jc w:val="left"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
      <w:b/>
      <w:color w:val="334155"/>
      <w:sz w:val="23"/>
    </w:rPr>
  </w:style>
</w:styles>"""

    header1 = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr>
      <w:jc w:val="right"/>
      <w:pBdr><w:bottom w:val="single" w:sz="6" w:space="4" w:color="0284C7"/></w:pBdr>
    </w:pPr>
    <w:r><w:rPr><w:sz w:val="16"/><w:color w:val="0284C7"/><w:b/></w:rPr><w:t>MIGATO 2026 • DICTAMEN DE CONTRAINTELIGENCIA Y SEGURIDAD OPERATIVA</w:t></w:r>
  </w:p>
</w:hdr>"""

    header_first = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p/></w:hdr>"""

    footer1 = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr>
      <w:jc w:val="both"/>
      <w:pBdr><w:top w:val="single" w:sz="4" w:space="4" w:color="CBD5E1"/></w:pBdr>
    </w:pPr>
    <w:r><w:rPr><w:sz w:val="16"/><w:color w:val="64748B"/><w:i/></w:rPr><w:t>Confidencial • Uso Exclusivo Dirección General MIGATO • Blindaje contra Ataque de Oráculo</w:t></w:r>
    <w:r><w:rPr><w:sz w:val="16"/><w:color w:val="0F172A"/><w:b/></w:rPr><w:tab/><w:fldSimple w:instr="PAGE"/></w:r>
  </w:p>
</w:ftr>"""

    footer_first = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p/></w:ftr>"""

    def add_p(text, bold_prefix=None, italic=False, align="both", space_after=140):
        bp = f'<w:r><w:rPr><w:b/><w:color w:val="0F172A"/></w:rPr><w:t xml:space="preserve">{escape(bold_prefix)} </w:t></w:r>' if bold_prefix else ""
        it = "<w:i/>" if italic else ""
        return f"""
        <w:p>
          <w:pPr><w:jc w:val="{align}"/><w:spacing w:after="{space_after}"/></w:pPr>
          {bp}
          <w:r><w:rPr>{it}</w:rPr><w:t xml:space="preserve">{escape(text)}</w:t></w:r>
        </w:p>
        """

    def add_h1(text):
        return f"""
        <w:p>
          <w:pPr><w:pStyle w:val="Heading1"/></w:pPr>
          <w:r><w:t>{escape(text)}</w:t></w:r>
        </w:p>
        """

    def add_h2(text):
        return f"""
        <w:p>
          <w:pPr><w:pStyle w:val="Heading2"/></w:pPr>
          <w:r><w:t>{escape(text)}</w:t></w:r>
        </w:p>
        """

    def add_h3(text):
        return f"""
        <w:p>
          <w:pPr><w:pStyle w:val="Heading3"/></w:pPr>
          <w:r><w:t>{escape(text)}</w:t></w:r>
        </w:p>
        """

    def add_callout(text, title="NOTA DE SEGURIDAD OPERATIVA", alert_type="info"):
        if alert_type == "danger":
            border_col = "DC2626"
            bg_col = "FEF2F2"
            title_col = "991B1B"
        elif alert_type == "success":
            border_col = "16A34A"
            bg_col = "F0FDF4"
            title_col = "166534"
        else:
            border_col = "0284C7"
            bg_col = "F0F9FF"
            title_col = "0369A1"

        return f"""
        <w:p>
          <w:pPr>
            <w:spacing w:before="180" w:after="180"/>
            <w:pBdr>
              <w:left w:val="single" w:sz="24" w:space="12" w:color="{border_col}"/>
              <w:top w:val="single" w:sz="4" w:space="8" w:color="{border_col}"/>
              <w:right w:val="single" w:sz="4" w:space="8" w:color="{border_col}"/>
              <w:bottom w:val="single" w:sz="4" w:space="8" w:color="{border_col}"/>
            </w:pBdr>
            <w:shd w:val="clear" w:color="auto" w:fill="{bg_col}"/>
          </w:pPr>
          <w:r><w:rPr><w:b/><w:color w:val="{title_col}"/><w:sz w:val="21"/></w:rPr><w:t>{escape(title)}: </w:t></w:r>
          <w:r><w:rPr><w:sz w:val="21"/><w:color w:val="0F172A"/></w:rPr><w:t>{escape(text)}</w:t></w:r>
        </w:p>
        """

    def add_image_block(rel_id, title_caption, width_emu=5486400, height_emu=3450000):
        # 6.0 in ancho x 3.77 in alto
        return f"""
        <w:p>
          <w:pPr><w:jc w:val="center"/><w:spacing w:before="180" w:after="80"/></w:pPr>
          <w:r>
            <w:drawing>
              <wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
                <wp:extent cx="{width_emu}" cy="{height_emu}"/>
                <wp:docPr id="{rel_id}" name="{escape(title_caption)}"/>
                <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                  <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                    <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                      <pic:nvPicPr><pic:cNvPr id="0" name="Diagram"/><pic:cNvPicPr/></pic:nvPicPr>
                      <pic:blipFill><a:blip r:embed="{rel_id}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>
                      <pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{width_emu}" cy="{height_emu}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>
                    </pic:pic>
                  </a:graphicData>
                </a:graphic>
              </wp:inline>
            </w:drawing>
          </w:r>
        </w:p>
        <w:p>
          <w:pPr><w:jc w:val="center"/><w:spacing w:after="180"/></w:pPr>
          <w:r><w:rPr><w:i/><w:sz w:val="18"/><w:color w:val="64748B"/></w:rPr><w:t>Figura Técnica: {escape(title_caption)}</w:t></w:r>
        </w:p>
        """

    def add_table(headers, rows):
        header_xml = '<w:tr><w:trPr><w:tblHeader/></w:trPr>'
        for h in headers:
            header_xml += f"""
            <w:tc>
              <w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="0F172A"/><w:tcMar><w:top w:w="120"/><w:bottom w:w="120"/><w:left w:w="140"/><w:right w:w="140"/></w:tcMar></w:tcPr>
              <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="0"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="20"/></w:rPr><w:t>{escape(h)}</w:t></w:r></w:p>
            </w:tc>
            """
        header_xml += '</w:tr>'

        rows_xml = ""
        for i, row in enumerate(rows):
            bg = "F8FAFC" if i % 2 == 0 else "FFFFFF"
            rows_xml += '<w:tr>'
            for j, cell in enumerate(row):
                align = "left" if j == 1 else "center"
                bold = (j == 0)
                b_tag = "<w:b/>" if bold else ""
                col_tag = 'w:color w:val="0284C7"' if j == 0 else 'w:color w:val="0F172A"'
                rows_xml += f"""
                <w:tc>
                  <w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="{bg}"/><w:tcMar><w:top w:w="100"/><w:bottom w:w="100"/><w:left w:w="140"/><w:right w:w="140"/></w:tcMar></w:tcPr>
                  <w:p><w:pPr><w:jc w:val="{align}"/><w:spacing w:after="0"/></w:pPr><w:r><w:rPr>{b_tag}<{col_tag}/><w:sz w:val="20"/></w:rPr><w:t>{escape(cell)}</w:t></w:r></w:p>
                </w:tc>
                """
            rows_xml += '</w:tr>'

        return f"""
        <w:tbl>
          <w:tblPr>
            <w:tblW w:w="5000" w:type="pct"/>
            <w:jc w:val="center"/>
            <w:tblBorders>
              <w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
              <w:left w:val="none"/>
              <w:bottom w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
              <w:right w:val="none"/>
              <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
              <w:insideV w:val="none"/>
            </w:tblBorders>
          </w:tblPr>
          {header_xml}
          {rows_xml}
        </w:tbl>
        <w:p><w:pPr><w:spacing w:after="180"/></w:pPr></w:p>
        """

    # CONSTRUCCIÓN DEL CUERPO DEL DICTAMEN
    body = []

    # =========================================================================
    # PORTADA INSTITUCIONAL
    # =========================================================================
    body.append("""
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:before="100" w:after="40"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="0F172A"/></w:rPr><w:t>REPÚBLICA BOLIVARIANA DE VENEZUELA • ESTADO MONAGAS</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="40"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="0284C7"/></w:rPr><w:t>MOVIMIENTO INDEPENDIENTE GANAMOS TODOS (MIGATO)</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="180"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="20"/><w:color w:val="475569"/></w:rPr><w:t>SALA DE CONTRAINTELIGENCIA Y ARQUITECTURA DE SEGURIDAD OPERATIVA</w:t></w:r>
    </w:p>
    """)

    if has_logo:
        body.append("""
        <w:p>
          <w:pPr><w:jc w:val="center"/><w:spacing w:before="120" w:after="160"/></w:pPr>
          <w:r>
            <w:drawing>
              <wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
                <wp:extent cx="1300000" cy="1300000"/>
                <wp:docPr id="1" name="Logo MIGATO"/>
                <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                  <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                    <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                      <pic:nvPicPr><pic:cNvPr id="0" name="Logo"/><pic:cNvPicPr/></pic:nvPicPr>
                      <pic:blipFill><a:blip r:embed="rIdLogo" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>
                      <pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="1300000" cy="1300000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>
                    </pic:pic>
                  </a:graphicData>
                </a:graphic>
              </wp:inline>
            </w:drawing>
          </w:r>
        </w:p>
        """)

    body.append("""
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:before="160" w:after="80"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="30"/><w:color w:val="0F172A"/></w:rPr><w:t>DICTAMEN DE CONTRAINTELIGENCIA Y SEGURIDAD OPERATIVA V3</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="240"/></w:pPr>
      <w:r><w:rPr><w:i/><w:sz w:val="23"/><w:color w:val="0284C7"/></w:rPr><w:t>Blindaje Estructural de la Militancia Territorial Frente al Riesgo de Infiltración, Inferencia Inversa y Ataques de Oráculo Político (Lista Tascón 2.0)</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:before="240" w:after="60"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="21"/><w:color w:val="0F172A"/></w:rPr><w:t>Dirigido a: Dirección General del Movimiento Independiente Ganamos Todos (MIGATO)</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="60"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="21"/><w:color w:val="0F172A"/></w:rPr><w:t>Atención: Dr. Nelson "El Gato" Briceño y Directiva Regional</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="240"/></w:pPr>
      <w:r><w:rPr><w:sz w:val="20"/><w:color w:val="475569"/></w:rPr><w:t>Elaborado por: Equipo Técnico de Sistemas, Ciberseguridad y Arquitectura de Datos</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:before="120" w:after="100"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="20"/><w:color w:val="0F172A"/></w:rPr><w:t>Maturín, Estado Monagas • Septiembre 2026</w:t></w:r>
    </w:p>
    <w:p><w:r><w:br w:type="page"/></w:r></w:p>
    """)

    # =========================================================================
    # CAPÍTULO I: FORMULACIÓN DEL RIESGO Y MODELADO DE AMENAZAS
    # =========================================================================
    body.append(add_h1("CAPÍTULO I: FORMULACIÓN DEL PROBLEMA Y MODELO DE AMENAZAS"))
    body.append(add_p("El despliegue de una plataforma digital para la organización electoral, censo comunitario y movilización ciudadana en un contexto de persecución política plantea un dilema de supervivencia. La pregunta táctica fundamental que la Dirección General y el equipo técnico deben responder no es simplemente '¿cómo registramos a nuestros votantes?', sino '¿cómo evitamos que el adversario use nuestra propia herramienta para cazar a nuestra gente?'."))
    body.append(add_p("En los esquemas convencionales de desarrollo de software (aquellos programados con librerías estándar o asistentes de inteligencia artificial sin doctrina de contrainteligencia), el flujo de información es bidireccional y simétrico: un usuario ingresa datos, el servidor los guarda y valida, y la aplicación vuelve a responder al usuario con el estado del registro para confirmarle si la persona existe o no en la base de datos.", bold_prefix="El Error Clásico de la Programación Convencional:"))
    body.append(add_p("Este flujo tradicional, inofensivo en un entorno corporativo comercial, resulta letal en la Venezuela contemporánea, pues da origen al llamado 'Ataque de Oráculo Político' (Oracle Attack o Inferencia Inversa de Identidad).", bold_prefix="Vulnerabilidad Crítica:"))

    body.append(add_callout(
        "Un 'Ataque de Oráculo' se produce cuando un sistema informático, ante una consulta arbitraria formulada por un atacante, responde con suficiente información como para confirmar o desmentir una hipótesis secreta. En nuestro caso: confirmar si una cédula de identidad pertenece a un opositor organizado.",
        title="DEFINICIÓN DE INTELIGENCIA MILITAR / CIBERSEGURIDAD",
        alert_type="danger"
    ))

    body.append(add_h2("1.1. El Vector de Ataque en Terreno: La Caza de Militantes"))
    body.append(add_p("Considérese el siguiente escenario operativo real en cualquier parroquia de Maturín (Las Cocuizas, San Simón, Boquerón o Los Godos):"))
    body.append(add_p("Un jefe de calle del oficialismo, un operador del CLAP o un funcionario de un cuerpo de seguridad del Estado logra infiltrarse en una estructura de base o decomisa el teléfono celular de un enlace comunitario en una alcabala.", bold_prefix="1. Obtención del Dispositivo:"))
    body.append(add_p("El atacante no necesita piratear el servidor central. Simplemente abre la aplicación comunitaria y comienza a ingresar las cédulas de identidad de personas de interés: maestros de escuela, empleados de la gobernación, enfermeras del Hospital Dr. Manuel Núñez Tovar, o vecinos sospechosos de simpatizar con el Dr. Nelson Briceño.", bold_prefix="2. Envío Nominal de Prueba:"))
    body.append(add_p("Si el servidor central, con el fin de 'ayudar al enlace', respondiera: 'Esta persona ya fue validada por la Central como Voto Fijo de MIGATO', el infiltrado acaba de obtener una prueba irrefutable de militancia opositora.", bold_prefix="3. Inferencia Exitosa:"))
    body.append(add_p("Con esa información, el régimen confecciona listas de despidos inmediatos, suspensiones de bolsas de comida, revocación de jubilaciones y hostigamiento directo a hogares vulnerables.", bold_prefix="4. Consecuencia Fatal:"))

    # DIAGRAMA 1
    if diag1_bytes:
        body.append(add_image_block("rIdDiag1", "Ataque de Oráculo e Inferencia Inversa en Plataformas Convencionales (Lista Tascón 2.0)"))

    body.append(add_callout(
        "Bajo este escenario vulnerable, no es el gobierno el que persigue: es NUESTRA PROPIA PLATAFORMA la que actúa como un delator automatizado al servicio del adversario.",
        title="DICTAMEN DE RIESGO DE CONTRAINTELIGENCIA",
        alert_type="danger"
    ))

    # =========================================================================
    # CAPÍTULO II: LA DOCTRINA DE SEGURIDAD DE MIGATO - EL BUZÓN CIEGO
    # =========================================================================
    body.append(add_h1("CAPÍTULO II: LA DOCTRINA DE SEGURIDAD DE MIGATO V3"))
    body.append(add_p("Para erradicar esta vulnerabilidad de manera definitiva, la Plataforma Territorial MIGATO fue concebida y construida bajo la Doctrina de Flujo Unidireccional Estricto y la Arquitectura de Buzón Ciego (Blind Drop Box Architecture)."))
    body.append(add_p("En el mundo físico, un buzón de correos seguro posee una ranura metálica que permite introducir una carta con un mensaje adentro, pero impide físicamente que cualquier persona en la calle introduzca la mano para ver qué cartas han metido los vecinos o verificar quién escribió. La plataforma MIGATO replica matemáticamente este principio:", bold_prefix="Analogía Doctrinaria del Buzón Ciego:"))

    body.append(add_p("Los enlaces parroquiales y sectoriales disponen de un formulario web que opera mediante un token efímero de acceso. Pueden ingresar los datos de un censo o una encuesta familiar, pero el envío viaja exclusivamente hacia arriba (hacia el servidor central cifrado).", bold_prefix="1. Flujo Estrictamente Ascendente (One-Way Push):"))
    body.append(add_p("Inmediatamente después de pulsar el botón 'Guardar y Transmitir', el código fuente del cliente borra de inmediato todos los campos del formulario, resetea las variables en memoria y purga el almacenamiento local. Si un oficial de policía toma el teléfono 2 segundos después del envío, la pantalla está completamente en blanco y el almacenamiento interno registra exactamente 0 bytes.", bold_prefix="2. Protocolo Zero-Byte Storage en Clientes Móviles:"))
    body.append(add_p("El servidor central jamás devuelve a la calle confirmaciones nominales ni listas de personas. Hacia los módulos de campo únicamente retornan indicadores numéricos agregados y anónimos (Ejemplo: 'Sector Los Godos: 142 familias censadas • 68% de la meta').", bold_prefix="3. Cero Retorno Nominal (Zero Identity Leakage):"))
    body.append(add_p("En las interfaces sectoriales de campo está terminantemente prohibido y técnicamente deshabilitado cualquier buscador de cédulas, filtro por nombres o visualizador de fichas individuales. No existe endpoint en la API que permita a un teléfono en la calle consultar si 'Juan Pérez' está registrado o no.", bold_prefix="4. Anulación de Consultas Inversas:"))

    # DIAGRAMA 2
    if diag2_bytes:
        body.append(add_image_block("rIdDiag2", "Arquitectura Blindada MIGATO: Flujo Unidireccional, Bóveda Central Cifrada y Cero Retorno Nominal"))

    body.append(add_callout(
        "Al aplicar el principio de Cero Retorno Nominal, si un agente hostil ingresa una cédula en el formulario de campo, el sistema se limita a procesar el paquete en la nube de forma silenciosa sin devolver ningún indicio sobre si la persona ya existía, si es militante o si fue validada. El ataque de oráculo queda completamente neutralizado.",
        title="RESULTADO TÁCTICO CERTIFICADO",
        alert_type="success"
    ))

    # =========================================================================
    # CAPÍTULO III: MATRIZ COMPARATIVA DE SEGURIDAD OPERATIVA
    # =========================================================================
    body.append(add_h1("CAPÍTULO III: MATRIZ COMPARATIVA DE SEGURIDAD OPERATIVA"))
    body.append(add_p("A continuación se presenta el contraste técnico riguroso entre un sistema convencional (o aquel generado por desarrolladores sin experiencia en entornos hostiles) y la arquitectura blindada de MIGATO V3:"))

    headers_comp = ["Parámetro Crítico", "Sistema Convencional (Vulnerable)", "Plataforma MIGATO V3 (Blindada)"]
    rows_comp = [
        [
            "Dirección del Flujo de Datos",
            "Bidireccional: Los datos suben a la base y bajan de regreso con nombres completos al celular.",
            "Estrictamente Unidireccional: Subida cifrada hacia la bóveda central; retorno exclusivo de métricas numéricas."
        ],
        [
            "Respuesta del Servidor a la Calle",
            "'Persona Encontrada: Validada como Voto Duro de la Oposición' (Fuga inmediata de identidad).",
            "Métrica Consolidada Anónima: '142 familias censadas en el sector • 68% de avance' (Cero filtración)."
        ],
        [
            "Almacenamiento en Dispositivo Móvil",
            "Bases de datos SQLite locales, caché del navegador y cookies con nombres y teléfonos.",
            "Protocolo Zero-Byte: Cero bytes persistidos; purga de memoria instantánea tras cada transmisión."
        ],
        [
            "Búsqueda Inversa por Cédula en Calle",
            "Habilitada por comodidad del enlace (Fácilmente explotable por infiltrados para cazar militantes).",
            "Terminantemente Bloqueada: La calle no tiene permiso de consultar la base de datos central."
        ],
        [
            "Resultado ante Requisa en Alcabala",
            "El militar o policía revisa el historial y obtiene la lista negra completa del sector.",
            "El dispositivo solo muestra una interfaz neutral en blanco sin datos residentes ni fichas."
        ],
        [
            "Aislamiento Territorial de Datos",
            "Centralizada en un archivo accesible por cualquier usuario con enlace compartido.",
            "Aislamiento Parroquial Estricto: Ningún coordinador puede ver ni cruzar datos de otras parroquias."
        ]
    ]
    body.append(add_table(headers_comp, rows_comp))

    # =========================================================================
    # CAPÍTULO IV: LOS CUATRO (4) CANDADOS TÉCNICOS INQUEBRANTABLES
    # =========================================================================
    body.append(add_h1("CAPÍTULO IV: LOS CUATRO CANDADOS TÉCNICOS INQUEBRANTABLES"))
    body.append(add_p("La arquitectura de MIGATO descansa sobre cuatro barreras de contrainteligencia de nivel gubernamental:"))

    body.append(add_h2("Candado 1: Buzón Ciego Criptográfico (Blind Drop)"))
    body.append(add_p("El canal de transmisión opera con encriptación TLS 1.3 de 256 bits. Cada paquete de datos de campo es firmado criptográficamente con el token efímero de la parroquia emisora y depositado en una cola de mensajes en el servidor VPS. El cliente emisor no recibe ningún token de sesión permanente ni cookies que permitan reingresar a consultar la información transmitida."))

    body.append(add_h2("Candado 2: Cero Retorno Nominal y Anonimización Agregada"))
    body.append(add_p("El motor de analítica de la plataforma ejecuta una función matemática unidireccional (de agregación estadística). Cuando la Dirección General o el enlace parroquial visualizan el mapa 3D o el tablero de control, el sistema no consulta registros nominales: consulta tablas de cómputo precalculadas donde las personas ya no existen como individuos, sino como totales estadísticos territoriales."))

    body.append(add_h2("Candado 3: Control de Acceso Basado en Roles (RBAC) de Bóveda Central"))
    body.append(add_p("La visualización nominal individual (nombres, teléfonos, asignación de testigos en las 361 mesas y verificación de actas electorales) está restringida exclusivamente a la Dirección General de MIGATO y a los operadores autorizados en la Sala de Mando Regional, requiriendo IP fija validada, certificados SSH y autenticación de factor múltiple."))

    body.append(add_h2("Candado 4: Compartimentación Parroquial Tabicada"))
    body.append(add_p("Bajo el principio de contrainteligencia militar de 'compartimentación estricta', las 10 parroquias del Municipio Maturín operan como silos estancos. Si un coordinador o testigo en la Parroquia San Simón fuera coaccionado o infiltrado, bajo ninguna circunstancia podría obtener o consultar información de las parroquias vecinas (Las Cocuizas, Santa Cruz, Jusepín o La Pica). El daño potencial queda confinado al 100%."))

    # =========================================================================
    # CAPÍTULO V: RESPUESTA ESTRATÉGICA ANTE OBJECIONES Y EL MITO DE LA IA
    # =========================================================================
    body.append(add_h1("CAPÍTULO V: ANÁLISIS ESTRATÉGICO Y DESMITIFICACIÓN TECNOLÓGICA"))
    body.append(add_p("En reuniones de alto nivel político es frecuente encontrar posturas que desestiman la complejidad de un desarrollo tecnológico, argumentando que 'hoy en día con la inteligencia artificial cualquiera hace una aplicación en una tarde'. Resulta imperativo dotar a la dirigencia de argumentos técnicos sólidos para responder a esta objeción con autoridad:"))

    body.append(add_p("Una inteligencia artificial genérica (ChatGPT, Claude, etc.) genera código funcional básico para tiendas virtuales, formularios de contacto o blogs. Sin embargo, carece por completo de doctrina de seguridad de contrainteligencia. Si un programador aficionado le pide a una IA 'hazme un sistema para registrar votantes', la IA invariablemente generará un sistema con buscador de nombres, validación pública de cédulas y almacenamiento local en SQLite. Es decir: la IA creará, por defecto, una trampa mortal de oráculo político.", bold_prefix="1. La Falacia del Código Asistido sin Doctrina:"))

    body.append(add_p("El software no es solo código; es la suma de tres factores indivisibles: (a) Infraestructura de servidores propia y blindada sin intermediarios gratuitos tipo Google Forms o Airtable (que entregan los datos a terceros); (b) Doctrina de contrainteligencia adaptada a las amenazas reales del régimen venezolano; y (c) Integración territorial precisa con los 84 centros de salud, 175 centros electorales y 361 mesas de votación reales de Monagas.", bold_prefix="2. La Soberanía Tecnológica no es Subcontratable:"))

    body.append(add_p("MIGATO no está comprando un software enlatado ni improvisando con herramientas vulnerables de WhatsApp. Cuenta con un sistema a medida, auditado contra ataques de inferencia y diseñado para operar bajo fuego electoral y censura digital.", bold_prefix="3. La Ventaja Competitiva de MIGATO:"))

    # =========================================================================
    # CAPÍTULO VI: CONCLUSIONES Y DICTAMEN TÉCNICO
    # =========================================================================
    body.append(add_h1("CAPÍTULO VI: CONCLUSIONES Y DICTAMEN TÉCNICO"))
    body.append(add_p("El riesgo de 'Ataque de Oráculo Político' e inferencia inversa de identidad representa una de las amenazas más destructivas para la seguridad de la militancia en procesos electorales bajo regímenes de vigilancia.", bold_prefix="• Gravedad Comprobada:"))
    body.append(add_p("La Plataforma Territorial MIGATO V3 neutraliza este vector de forma absoluta mediante la adopción innegociable de la Arquitectura de Buzón Ciego, el Protocolo Zero-Byte Storage y la política de Cero Retorno Nominal.", bold_prefix="• Blindaje Técnico Total:"))
    body.append(add_p("El sistema garantiza que ningún enlace parroquial, operador de campo, alcabala policial ni infiltrado oficialista pueda utilizar la herramienta para confirmar o deducir la afiliación política de ningún ciudadano venezolano.", bold_prefix="• Protección Humana Certificada:"))

    body.append(add_callout(
        "DICTAMEN FAVORABLE: El Equipo Técnico de Sistemas y Arquitectura Digital de MIGATO certifica que la plataforma cumple con los más altos estándares de contrainteligencia y compartimentación de datos, encontrándose apta para su despliegue operativo seguro en las comunidades del Estado Monagas.",
        title="DICTAMEN TÉCNICO CONCLUSIVO",
        alert_type="success"
    ))

    # Firmas y Cierre
    body.append("""
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:before="360" w:after="40"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="21"/><w:color w:val="0F172A"/></w:rPr><w:t>Dictamen Técnico de Seguridad Operativa emitido y certificado por el</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="40"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="0284C7"/></w:rPr><w:t>Equipo Técnico de Sistemas y Ciberseguridad MIGATO 2026</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="140"/></w:pPr>
      <w:r><w:rPr><w:sz w:val="19"/><w:color w:val="64748B"/></w:rPr><w:t>Maturín, Estado Monagas, República Bolivariana de Venezuela.</w:t></w:r>
    </w:p>
    """)

    # SECTION PROPERTIES
    sectPr = """
    <w:sectPr>
      <w:headerReference w:type="default" r:id="rIdHeader1"/>
      <w:headerReference w:type="first" r:id="rIdHeaderFirst"/>
      <w:footerReference w:type="default" r:id="rIdFooter1"/>
      <w:footerReference w:type="first" r:id="rIdFooterFirst"/>
      <w:titlePg/>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1700" w:header="720" w:footer="720" w:gutter="0"/>
      <w:cols w:space="720"/>
      <w:docGrid w:linePitch="360"/>
    </w:sectPr>
    """

    doc_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
            xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
  <w:body>
    {"".join(body)}
    {sectPr}
  </w:body>
</w:document>"""

    docx_path = Path(filename).resolve()
    with zipfile.ZipFile(docx_path, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", content_types)
        z.writestr("_rels/.rels", rels)
        z.writestr("word/_rels/document.xml.rels", doc_rels)
        z.writestr("word/styles.xml", styles)
        z.writestr("word/header1.xml", header1)
        z.writestr("word/header_first.xml", header_first)
        z.writestr("word/footer1.xml", footer1)
        z.writestr("word/footer_first.xml", footer_first)
        z.writestr("word/document.xml", doc_xml)
        if has_logo:
            z.writestr("word/media/logo.png", logo_bytes)
        if diag1_bytes:
            z.writestr("word/media/diag1.png", diag1_bytes)
        if diag2_bytes:
            z.writestr("word/media/diag2.png", diag2_bytes)

    print(f"[✓] DOCX Dictamen de Contrainteligencia V3 generado con éxito: {docx_path} ({os.path.getsize(docx_path)} bytes)")
    return docx_path

if __name__ == "__main__":
    out_docx = PROJECT_ROOT / "DICTAMEN_CONTRAINTELIGENCIA_ORACULO_MIGATO_V3.docx"
    build_docx(out_docx)
