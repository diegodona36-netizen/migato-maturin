#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de Documento Oficial Word (.docx) y PDF:
DICTAMEN TÉCNICO Y PROPUESTAS ACTUALIZADAS: BLINDAJE Y PROTECCIÓN FÍSICA DEL SERVIDOR LOCAL
Bajo Normas APA (7ma edición adaptada a IUTIRLA / MIGATO)
Comando Estratégico El Gato Briceño • Maturín, Estado Monagas • Septiembre 2026
"""

import os
import sys
import html
import zipfile
import subprocess
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ASSETS_DIR = PROJECT_ROOT / "assets"
LOGO_PATH = ASSETS_DIR / "logo-migato.png"

def escape(text):
    return html.escape(str(text))

def build_docx(output_path):
    has_logo = LOGO_PATH.exists()
    logo_bytes = LOGO_PATH.read_bytes() if has_logo else b""

    # 1. Content Types
    content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>
  <Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
  <Override PartName="/word/header_first.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>
  <Override PartName="/word/footer_first.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
</Types>"""

    # 2. Package relationships
    rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"""

    # 3. Document relationships
    doc_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rIdHeader1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>
  <Relationship Id="rIdFooter1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
  <Relationship Id="rIdHeaderFirst" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header_first.xml"/>
  <Relationship Id="rIdFooterFirst" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer_first.xml"/>
"""
    if has_logo:
        doc_rels += '  <Relationship Id="rIdLogo" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo.png"/>\n'
    doc_rels += "</Relationships>"

    # 4. Header relationships
    header_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
"""
    if has_logo:
        header_rels += '  <Relationship Id="rIdHeaderLogo" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo.png"/>\n'
    header_rels += "</Relationships>"

    # 5. Styles
    styles = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
      <w:sz w:val="23"/>
      <w:szCs w:val="23"/>
      <w:color w:val="0F172A"/>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:spacing w:line="280" w:lineRule="auto" w:before="0" w:after="0"/>
      <w:jc w:val="both"/>
    </w:pPrDefault>
  </w:docDefaults>
</w:styles>"""

    # 6. Headers & Footers
    header_first = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p><w:pPr><w:jc w:val="center"/></w:pPr></w:p>
</w:hdr>"""

    footer_first = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p><w:pPr><w:jc w:val="center"/></w:pPr></w:p>
</w:ftr>"""

    header1 = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
       xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
       xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
       xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
       xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
  <w:tbl>
    <w:tblPr>
      <w:tblW w:w="8260" w:type="dxa"/>
      <w:jc w:val="center"/>
      <w:tblBorders>
        <w:top w:val="none"/>
        <w:left w:val="none"/>
        <w:bottom w:val="single" w:sz="6" w:space="0" w:color="D1D5DB"/>
        <w:right w:val="none"/>
        <w:insideH w:val="none"/>
        <w:insideV w:val="none"/>
      </w:tblBorders>
      <w:tblCellMar>
        <w:top w:w="0" w:type="dxa"/>
        <w:left w:w="0" w:type="dxa"/>
        <w:bottom w:w="60" w:type="dxa"/>
        <w:right w:w="0" w:type="dxa"/>
      </w:tblCellMar>
    </w:tblPr>
    <w:tblGrid>
      <w:gridCol w:w="700"/>
      <w:gridCol w:w="5860"/>
      <w:gridCol w:w="1700"/>
    </w:tblGrid>
    <w:tr>
      <w:tc>
        <w:tcPr>
          <w:tcW w:w="700" w:type="dxa"/>
          <w:vAlign w:val="center"/>
        </w:tcPr>
        <w:p>
          <w:pPr>
            <w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/>
            <w:jc w:val="left"/>
          </w:pPr>
          <w:r>
            <w:drawing>
              <wp:inline distT="0" distB="0" distL="0" distR="0">
                <wp:extent cx="380000" cy="370000"/>
                <wp:docPr id="101" name="Logo Header"/>
                <a:graphic>
                  <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                    <pic:pic>
                      <pic:nvPicPr>
                        <pic:cNvPr id="101" name="logo.png"/>
                        <pic:cNvPicPr/>
                      </pic:nvPicPr>
                      <pic:blipFill>
                        <a:blip r:embed="rIdHeaderLogo"/>
                        <a:stretch><a:fillRect/></a:stretch>
                      </pic:blipFill>
                      <pic:spPr>
                        <a:xfrm><a:off x="0" y="0"/><a:ext cx="380000" cy="370000"/></a:xfrm>
                        <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                      </pic:spPr>
                    </pic:pic>
                  </a:graphicData>
                </a:graphic>
              </wp:inline>
            </w:drawing>
          </w:r>
        </w:p>
      </w:tc>
      <w:tc>
        <w:tcPr>
          <w:tcW w:w="5860" w:type="dxa"/>
          <w:vAlign w:val="center"/>
        </w:tcPr>
        <w:p>
          <w:pPr>
            <w:spacing w:before="0" w:after="0" w:line="200" w:lineRule="auto"/>
            <w:jc w:val="center"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
              <w:b/>
              <w:sz w:val="15"/>
              <w:szCs w:val="15"/>
              <w:color w:val="0F172A"/>
            </w:rPr>
            <w:t>MOVIMIENTO INDEPENDIENTE GANAMOS TODOS (MIGATO)</w:t>
          </w:r>
        </w:p>
        <w:p>
          <w:pPr>
            <w:spacing w:before="0" w:after="0" w:line="200" w:lineRule="auto"/>
            <w:jc w:val="center"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
              <w:sz w:val="13"/>
              <w:szCs w:val="13"/>
              <w:color w:val="475569"/>
            </w:rPr>
            <w:t>SEGURIDAD OPERATIVA Y CIBERDEFENSA • SALA SITUACIONAL MONAGAS 2026</w:t>
          </w:r>
        </w:p>
      </w:tc>
      <w:tc>
        <w:tcPr>
          <w:tcW w:w="1700" w:type="dxa"/>
          <w:vAlign w:val="center"/>
        </w:tcPr>
        <w:p>
          <w:pPr>
            <w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/>
            <w:jc w:val="right"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
              <w:sz w:val="15"/>
              <w:szCs w:val="15"/>
              <w:color w:val="475569"/>
            </w:rPr>
            <w:t>Página </w:t>
          </w:r>
          <w:fldSimple w:instr="PAGE"/>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
              <w:sz w:val="15"/>
              <w:szCs w:val="15"/>
              <w:color w:val="475569"/>
            </w:rPr>
            <w:t> de </w:t>
          </w:r>
          <w:fldSimple w:instr="NUMPAGES"/>
        </w:p>
      </w:tc>
    </w:tr>
  </w:tbl>
</w:hdr>"""

    footer1 = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr>
      <w:jc w:val="center"/>
      <w:spacing w:before="60" w:after="0" w:line="240" w:lineRule="auto"/>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
        <w:sz w:val="14"/>
        <w:color w:val="64748B"/>
      </w:rPr>
      <w:t>Dictamen Técnico de Ciberseguridad • Comando Estratégico El Gato Briceño • Monagas</w:t>
    </w:r>
  </w:p>
</w:ftr>"""

    sectPr = """<w:sectPr>
      <w:headerReference w:type="first" r:id="rIdHeaderFirst"/>
      <w:headerReference w:type="default" r:id="rIdHeader1"/>
      <w:footerReference w:type="first" r:id="rIdFooterFirst"/>
      <w:footerReference w:type="default" r:id="rIdFooter1"/>
      <w:titlePg/>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1700" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>"""

    # Helper Functions
    def p_cintillo(text):
        return f"""<w:p>
          <w:pPr>
            <w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/>
            <w:jc w:val="center"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
              <w:b/>
              <w:sz w:val="21"/>
              <w:szCs w:val="21"/>
            </w:rPr>
            <w:t>{escape(text)}</w:t>
          </w:r>
        </w:p>"""

    def p_blank(size=80):
        return f"""<w:p><w:pPr><w:spacing w:before="0" w:after="{size}" w:line="240" w:lineRule="auto"/></w:pPr></w:p>"""

    def p_logo():
        return """<w:p>
          <w:pPr>
            <w:spacing w:before="120" w:after="120" w:line="240" w:lineRule="auto"/>
            <w:jc w:val="center"/>
          </w:pPr>
          <w:r>
            <w:drawing>
              <wp:inline distT="0" distB="0" distL="0" distR="0">
                <wp:extent cx="1450000" cy="1415000"/>
                <wp:docPr id="1" name="Logo MIGATO"/>
                <a:graphic>
                  <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                    <pic:pic>
                      <pic:nvPicPr>
                        <pic:cNvPr id="0" name="logo.png"/>
                        <pic:cNvPicPr/>
                      </pic:nvPicPr>
                      <pic:blipFill>
                        <a:blip r:embed="rIdLogo"/>
                        <a:stretch><a:fillRect/></a:stretch>
                      </pic:blipFill>
                      <pic:spPr>
                        <a:xfrm><a:off x="0" y="0"/><a:ext cx="1450000" cy="1415000"/></a:xfrm>
                        <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                      </pic:spPr>
                    </pic:pic>
                  </a:graphicData>
                </a:graphic>
              </wp:inline>
            </w:drawing>
          </w:r>
        </w:p>"""

    def p_title(text):
        return f"""<w:p>
          <w:pPr>
            <w:spacing w:before="140" w:after="80" w:line="280" w:lineRule="auto"/>
            <w:jc w:val="center"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
              <w:b/>
              <w:sz w:val="25"/>
              <w:szCs w:val="25"/>
            </w:rPr>
            <w:t>{escape(text)}</w:t>
          </w:r>
        </w:p>"""

    def p_subtitle(text):
        return f"""<w:p>
          <w:pPr>
            <w:spacing w:before="30" w:after="140" w:line="250" w:lineRule="auto"/>
            <w:jc w:val="center"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
              <w:sz w:val="21"/>
              <w:szCs w:val="21"/>
              <w:color w:val="0284C7"/>
            </w:rPr>
            <w:t>{escape(text)}</w:t>
          </w:r>
        </w:p>"""

    def p_author_block():
        return """<w:p>
          <w:pPr>
            <w:spacing w:before="80" w:after="20" w:line="240" w:lineRule="auto"/>
            <w:ind w:left="3800"/>
            <w:jc w:val="left"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
              <w:b/>
              <w:sz w:val="21"/>
            </w:rPr>
            <w:t>Elaborado por:</w:t>
          </w:r>
        </w:p>
        <w:p>
          <w:pPr>
            <w:spacing w:before="0" w:after="15" w:line="240" w:lineRule="auto"/>
            <w:ind w:left="3800"/>
            <w:jc w:val="left"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
              <w:sz w:val="21"/>
            </w:rPr>
            <w:t>División de Ciencia, Tecnología y Ciberdefensa</w:t>
          </w:r>
        </w:p>
        <w:p>
          <w:pPr>
            <w:spacing w:before="0" w:after="15" w:line="240" w:lineRule="auto"/>
            <w:ind w:left="3800"/>
            <w:jc w:val="left"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
              <w:b/>
              <w:sz w:val="21"/>
            </w:rPr>
            <w:t>Ing. Diego Donado</w:t>
          </w:r>
        </w:p>
        <w:p>
          <w:pPr>
            <w:spacing w:before="0" w:after="100" w:line="240" w:lineRule="auto"/>
            <w:ind w:left="3800"/>
            <w:jc w:val="left"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
              <w:sz w:val="20"/>
              <w:color w:val="475569"/>
            </w:rPr>
            <w:t>Para: Comando de Campaña El Gato Briceño</w:t>
          </w:r>
        </w:p>"""

    def p_date():
        return """<w:p>
          <w:pPr>
            <w:spacing w:before="120" w:after="0" w:line="240" w:lineRule="auto"/>
            <w:jc w:val="center"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
              <w:b/>
              <w:sz w:val="22"/>
            </w:rPr>
            <w:t>Maturín, septiembre de 2026</w:t>
          </w:r>
        </w:p>"""

    # APA Headings
    def h1_apa(text):
        return f"""<w:p>
          <w:pPr>
            <w:spacing w:before="240" w:after="100" w:line="280" w:lineRule="auto"/>
            <w:jc w:val="center"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
              <w:b/>
              <w:sz w:val="22"/>
              <w:szCs w:val="22"/>
              <w:color w:val="0F172A"/>
            </w:rPr>
            <w:t>{escape(text)}</w:t>
          </w:r>
        </w:p>"""

    def h2_apa(text):
        return f"""<w:p>
          <w:pPr>
            <w:spacing w:before="180" w:after="60" w:line="280" w:lineRule="auto"/>
            <w:jc w:val="left"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
              <w:b/>
              <w:sz w:val="22"/>
              <w:szCs w:val="22"/>
              <w:color w:val="0284C7"/>
            </w:rPr>
            <w:t>{escape(text)}</w:t>
          </w:r>
        </w:p>"""

    def p_apa(text, bold_prefix="", italic=False):
        bp = f'<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="23"/><w:color w:val="0F172A"/></w:rPr><w:t xml:space="preserve">{escape(bold_prefix)} </w:t></w:r>' if bold_prefix else ''
        it = '<w:i/>' if italic else ''
        return f"""<w:p>
          <w:pPr>
            <w:ind w:firstLine="567"/>
            <w:spacing w:before="0" w:after="80" w:line="280" w:lineRule="auto"/>
            <w:jc w:val="both"/>
          </w:pPr>
          {bp}
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
              {it}
              <w:sz w:val="23"/>
              <w:szCs w:val="23"/>
              <w:color w:val="0F172A"/>
            </w:rPr>
            <w:t xml:space="preserve">{escape(text)}</w:t>
          </w:r>
        </w:p>"""

    def p_bullet(bold_label, text):
        return f"""<w:p>
          <w:pPr>
            <w:ind w:left="567" w:hanging="283"/>
            <w:spacing w:before="0" w:after="60" w:line="280" w:lineRule="auto"/>
            <w:jc w:val="both"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
              <w:b/>
              <w:sz w:val="22"/>
              <w:color w:val="0284C7"/>
            </w:rPr>
            <w:t xml:space="preserve">• </w:t>
          </w:r>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
              <w:b/>
              <w:sz w:val="22"/>
              <w:color w:val="0F172A"/>
            </w:rPr>
            <w:t xml:space="preserve">{escape(bold_label)}: </w:t>
          </w:r>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
              <w:sz w:val="22"/>
              <w:color w:val="1E293B"/>
            </w:rPr>
            <w:t>{escape(text)}</w:t>
          </w:r>
        </w:p>"""

    # FICHA ARQUITECTÓNICA VECTORIAL (EN SUSTITUCIÓN DE IMÁGENES TIPO DIAPOSITIVA)
    def card_openxml(title, category, items, highlight_text=""):
        items_xml = ""
        for b_title, desc in items:
            items_xml += f"""
            <w:p>
              <w:pPr>
                <w:ind w:left="240" w:hanging="180"/>
                <w:spacing w:before="0" w:after="40" w:line="240" w:lineRule="auto"/>
                <w:jc w:val="both"/>
              </w:pPr>
              <w:r>
                <w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="19"/><w:color w:val="0284C7"/></w:rPr>
                <w:t xml:space="preserve">▶ </w:t>
              </w:r>
              <w:r>
                <w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="19"/><w:color w:val="0F172A"/></w:rPr>
                <w:t xml:space="preserve">{escape(b_title)}: </w:t>
              </w:r>
              <w:r>
                <w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="19"/><w:color w:val="334155"/></w:rPr>
                <w:t>{escape(desc)}</w:t>
              </w:r>
            </w:p>
            """
        
        hl_xml = ""
        if highlight_text:
            hl_xml = f"""
            <w:p>
              <w:pPr>
                <w:spacing w:before="60" w:after="20" w:line="240" w:lineRule="auto"/>
                <w:jc w:val="both"/>
              </w:pPr>
              <w:r>
                <w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="18"/><w:color w:val="047857"/></w:rPr>
                <w:t xml:space="preserve">✔ IMPACTO EN SEGURIDAD: </w:t>
              </w:r>
              <w:r>
                <w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:i/><w:sz w:val="18"/><w:color w:val="0F172A"/></w:rPr>
                <w:t>{escape(highlight_text)}</w:t>
              </w:r>
            </w:p>
            """

        return f"""
        <w:tbl>
          <w:tblPr>
            <w:tblW w:w="5000" w:type="pct"/>
            <w:jc w:val="center"/>
            <w:tblBorders>
              <w:left w:val="single" w:sz="36" w:space="0" w:color="0284C7"/>
              <w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
              <w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
              <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
              <w:insideH w:val="none"/><w:insideV w:val="none"/>
            </w:tblBorders>
            <w:tblCellMar>
              <w:top w:w="120" w:type="dxa"/>
              <w:left w:w="160" w:type="dxa"/>
              <w:bottom w:w="120" w:type="dxa"/>
              <w:right w:w="160" w:type="dxa"/>
            </w:tblCellMar>
          </w:tblPr>
          <w:tr>
            <w:tc>
              <w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="F8FAFC"/></w:tcPr>
              <w:p>
                <w:pPr><w:spacing w:before="0" w:after="30" w:line="220" w:lineRule="auto"/><w:jc w:val="left"/></w:pPr>
                <w:r>
                  <w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="15"/><w:color w:val="64748B"/></w:rPr>
                  <w:t>{escape(category.upper())}</w:t>
                </w:r>
              </w:p>
              <w:p>
                <w:pPr><w:spacing w:before="0" w:after="80" w:line="260" w:lineRule="auto"/><w:jc w:val="left"/></w:pPr>
                <w:r>
                  <w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="21"/><w:color w:val="0F172A"/></w:rPr>
                  <w:t>{escape(title)}</w:t>
                </w:r>
              </w:p>
              {items_xml}
              {hl_xml}
            </w:tc>
          </w:tr>
        </w:tbl>
        <w:p><w:pPr><w:spacing w:after="100"/></w:pPr></w:p>
        """

    # TABLA APA FORMATO 7MA EDICIÓN
    def table_apa(headers, rows, note=""):
        header_xml = '<w:tr><w:trPr><w:tblHeader/></w:trPr>'
        for idx, h in enumerate(headers):
            align = "left" if idx == 0 else ("right" if any(c in str(h) for c in ["$", "%", "Costo"]) else "center")
            header_xml += f"""
            <w:tc>
              <w:tcPr>
                <w:tcBorders>
                  <w:top w:val="single" w:sz="12" w:space="0" w:color="0F172A"/>
                  <w:bottom w:val="single" w:sz="12" w:space="0" w:color="0F172A"/>
                  <w:left w:val="none"/><w:right w:val="none"/>
                </w:tcBorders>
                <w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/>
                <w:tcMar><w:top w:w="120"/><w:bottom w:w="120"/><w:left w:w="140"/><w:right w:w="140"/></w:tcMar>
              </w:tcPr>
              <w:p>
                <w:pPr><w:jc w:val="{align}"/><w:spacing w:after="0" w:line="220" w:lineRule="auto"/></w:pPr>
                <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:color w:val="0F172A"/><w:sz w:val="18"/></w:rPr><w:t>{escape(h)}</w:t></w:r>
              </w:p>
            </w:tc>
            """
        header_xml += '</w:tr>'

        rows_xml = ""
        total_rows = len(rows)
        for r_idx, row in enumerate(rows):
            is_last = (r_idx == total_rows - 1)
            bdr_bottom = 'w:val="single" w:sz="12" w:space="0" w:color="0F172A"' if is_last else 'w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"'
            rows_xml += '<w:tr>'
            for c_idx, cell in enumerate(row):
                align = "left" if c_idx <= 1 else ("right" if any(c in str(cell) for c in ["$", "%"]) else "center")
                bold_tag = '<w:b/>' if (c_idx == 0 or is_last) else ''
                rows_xml += f"""
                <w:tc>
                  <w:tcPr>
                    <w:tcBorders>
                      <w:top w:val="none"/>
                      <w:bottom {bdr_bottom}/>
                      <w:left w:val="none"/><w:right w:val="none"/>
                    </w:tcBorders>
                    <w:tcMar><w:top w:w="90"/><w:bottom w:w="90"/><w:left w:w="140"/><w:right w:w="140"/></w:tcMar>
                  </w:tcPr>
                  <w:p>
                    <w:pPr><w:jc w:val="{align}"/><w:spacing w:after="0" w:line="220" w:lineRule="auto"/></w:pPr>
                    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>{bold_tag}<w:color w:val="0F172A"/><w:sz w:val="18"/></w:rPr><w:t>{escape(str(cell))}</w:t></w:r>
                  </w:p>
                </w:tc>
                """
            rows_xml += '</w:tr>'

        note_xml = ""
        if note:
            note_xml = f"""
            <w:p>
              <w:pPr><w:spacing w:before="40" w:after="120" w:line="220" w:lineRule="auto"/><w:jc w:val="left"/></w:pPr>
              <w:r>
                <w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:i/><w:sz w:val="16"/><w:color w:val="64748B"/></w:rPr>
                <w:t>{escape(note)}</w:t>
              </w:r>
            </w:p>
            """

        return f"""
        <w:tbl>
          <w:tblPr>
            <w:tblW w:w="5000" w:type="pct"/>
            <w:jc w:val="center"/>
            <w:tblBorders>
              <w:top w:val="none"/><w:left w:val="none"/><w:right w:val="none"/><w:bottom w:val="none"/>
              <w:insideH w:val="none"/><w:insideV w:val="none"/>
            </w:tblBorders>
          </w:tblPr>
          {header_xml}
          {rows_xml}
        </w:tbl>
        {note_xml}
        """

    # BUILD DOCUMENT CONTENT
    body = []

    # =========================================================
    # PÁGINA 1: PORTADA INSTITUCIONAL APA / IUTIRLA
    # =========================================================
    body.append(p_cintillo("REPÚBLICA BOLIVARIANA DE VENEZUELA"))
    body.append(p_cintillo("MOVIMIENTO INDEPENDIENTE GANAMOS TODOS (MIGATO)"))
    body.append(p_cintillo("EQUIPO TÉCNICO REGIONAL DE INFORMÁTICA Y SISTEMAS"))
    body.append(p_cintillo("MATURÍN, ESTADO MONAGAS"))

    body.append(p_blank(60))
    if has_logo:
        body.append(p_logo())
    body.append(p_blank(60))

    body.append(p_title("DICTAMEN TÉCNICO Y ACTUALIZACIÓN DE PROPUESTAS: SISTEMA DE PROTECCIÓN Y BLINDAJE PARA EL SERVIDOR FÍSICO DE SALA SITUACIONAL"))
    body.append(p_subtitle("Arquitectura Criptográfica Anti-Allanamiento, Enclaves Epímeros en Memoria RAM, Secreto Compartido de Shamir 2-de-3, Clave de Coacción con Purga Instantánea y Encapsulamiento Anti-DPI"))

    body.append(p_blank(100))
    body.append(p_author_block())
    body.append(p_blank(80))
    body.append(p_date())

    # SALTO DE PÁGINA 1 -> 2
    body.append("""<w:p><w:r><w:br w:type="page"/></w:r></w:p>""")

    # =========================================================
    # PÁGINA 2: CAPÍTULO I - DIAGNÓSTICO Y JUSTIFICACIÓN
    # =========================================================
    body.append(h1_apa("CAPÍTULO I: DIAGNÓSTICO TÉCNICO Y MOTIVOS DE ACTUALIZACIÓN"))
    
    body.append(p_apa(
        "En la planificación inicial de seguridad física para la plataforma de campaña y sala situacional MIGATO Monagas 2026, se formularon propuestas fundamentadas en el cifrado simétrico de discos mediante LUKS2 y el desbloqueo remoto condicionado a un servidor Tang alojado en un Cloud VPS. Si bien dicha aproximación neutralizaba el robo casual de unidades de estado sólido (SSD), las realidades operativas contemporáneas en Venezuela y la evolución de los métodos de allanamiento e inteligencia estatal obligan a una actualización integral y de vanguardia.",
        bold_prefix="1.1. Contexto Operativo y Evolución de Amenazas."
    ))

    body.append(p_apa(
        "El análisis forense y de contrainteligencia evidencia cuatro factores críticos que tornaron obsoleto el modelo preliminar:",
        bold_prefix="1.2. Factores de Obsolescencia Identificados:"
    ))

    body.append(p_bullet(
        "Vulnerabilidad de Punto Único de Falla (Single Point of Failure)",
        "El protocolo Tang/Clevis convencional depende exclusivamente de que el servidor físico contacte la IP del Cloud VPS. Si los organismos del Estado ordenan a Cantv el bloqueo por BGP/IP del VPS o si el data center extranjero sufre una suspensión administrativa, el servidor local en Maturín queda inhabilitado para arrancar, dejando a la dirigencia a ciegas durante la jornada electoral."
    ))

    body.append(p_bullet(
        "Indefensión ante la Coacción Física Violenta (Rubber-Hose Cryptanalysis)",
        "En los allanamientos reales ejecutados por cuerpos de seguridad (DGCIM / SEBIN), los funcionarios no se limitan a sustraer los equipos; someten a los técnicos presentes mediante intimidación armada para exigir las credenciales de acceso root y la frase de desbloqueo. Un cifrado estático tradicional coloca al operador entre la disyuntiva de arriesgar su integridad o entregar el padrón electoral completo."
    ))

    body.append(p_bullet(
        "Inspección Profunda de Paquetes (DPI) y Detección de WireGuard",
        "Los proveedores nacionales de telecomunicaciones emplean hardware de inspección DPI (Deep Packet Inspection) que identifica las firmas de paquetes UDP de WireGuard estándar en puertos conocidos (51820), permitiendo a los servicios de vigilancia triangular la ubicación física del nodo emisor en Maturín."
    ))

    body.append(p_bullet(
        "Persistencia de Datos en Caliente y Remanencia Magnética en SSD",
        "Mantener bases de datos transaccionales activas directamente sobre el almacenamiento persistente deja fragmentos no sobreescritos en los bloques de nivelación de desgaste (wear leveling) de los discos sólidos, permitiendo a laboratorios forenses (vía Cellebrite o distribuciones especializadas como Kali Linux) reconstruir registros históricos aun tras cortes eléctricos forzosos."
    ))

    # =========================================================
    # CAPÍTULO II: LAS CUATRO (4) PROPUESTAS ACTUALIZADAS
    # =========================================================
    body.append(h1_apa("CAPÍTULO II: PROPUESTAS TÉCNICAS ACTUALIZADAS DE PROTECCIÓN"))
    
    body.append(p_apa(
        "A continuación se detallan las cuatro soluciones de blindaje rediseñadas para garantizar soberanía absoluta, resiliencia ante contingencias de red e inviolabilidad matemática bajo cualquier escenario de agresión física:",
        bold_prefix="2.1. Arquitectura Defensiva Integral 2026."
    ))

    # PROPUESTA 1: FICHA VECTORIAL NATIVA (SIN IMAGEN DE DIAPOSITIVA)
    p1_items = [
        ("Mecanismo Algorítmico", "La llave maestra del volumen LUKS2 de los SSDs en RAID 1 no reside íntegra en ningún dispositivo. Se fragmenta mediante el algoritmo de Secreto Compartido de Shamir (SSS) en 3 porciones matemáticas independientes."),
        ("Distribución de Fragmentos", "Fragmento 1: Custodiado en el Cloud VPS exterior con validación de IP limpia. Fragmento 2: Llave física hardware FIDO2 (YubiKey) o aplicación segura TOTP en custodia exclusiva del Ing. Diego Donado. Fragmento 3: Módulo de plataforma segura TPM 2.0 integrado en la placa madre del Dell OptiPlex."),
        ("Regla Operativa de Desbloqueo", "Para descifrar los discos al encender la máquina se requiere cualquier combinación de 2 de los 3 fragmentos (quórum 2-de-3)."),
        ("Comportamiento ante Robo", "Si asaltantes o funcionarios sustraen el servidor físico o extraen los discos SSD, únicamente poseen el Fragmento 3 (TPM). Sin el Fragmento 1 o 2, los datos son indistinguibles de ruido blanco aleatorio.")
    ]
    body.append(card_openxml(
        "Propuesta Actualizada 1: Cifrado Tripartito Shamir (2-de-3 Secret Sharing)",
        "Arquitectura de Cifrado Pre-Boot",
        p1_items,
        "Neutraliza el punto único de falla: Si bloquean internet o el Cloud VPS, el Ingeniero combina su llave personal (Fragmento 2) con el TPM local (Fragmento 3) y el servidor arranca de forma autónoma sin depender de la nube."
    ))

    # PROPUESTA 2: FICHA VECTORIAL NATIVA
    p2_items = [
        ("Principio de Negabilidad Plausible", "El gestor de arranque (GRUB) y el pre-arranque LUKS2 se configuran con dos contraseñas distintas que conducen a comportamientos diametralmente opuestos."),
        ("Contraseña Real de Producción", "Arranca el sistema operativo Ubuntu Server de MIGATO, monta el RAID 1 y levanta los servicios de la Sala Situacional."),
        ("Contraseña de Coacción (Duress Key)", "Destinada a ser entregada bajo amenaza armada. Al teclearse, un binario ligero en memoria ejecuta inmediatamente 'cryptsetup luksErase', sobreescribiendo las 32 ranuras de cabecera en menos de 80 milisegundos."),
        ("Despliegue de Sistema Señuelo (Honeypot OS)", "Acto seguido, la máquina arranca un entorno gráfico civil inocuo (escritorio contable comercial genérico con facturas de repuestos o inventarios ordinarios), dejando a los captores con un sistema funcional pero sin el menor rastro de datos políticos.")
    ]
    body.append(card_openxml(
        "Propuesta Actualizada 2: Clave de Coacción y Purga Criptográfica Instantánea",
        "Protección contra Coacción y Allanamiento Armado",
        p2_items,
        "Protección de la vida humana y destrucción irreversible de la información: El borrado de cabecera hace matemáticamente imposible recuperar los datos incluso para agencias de inteligencia con supercomputadores, mientras que el señuelo protege al técnico de represalias físicas inmediatas."
    ))

    # PROPUESTA 3: FICHA VECTORIAL NATIVA
    p3_items = [
        ("Operación Transaccional en tmpfs", "El motor de base de datos y la recepción de actas operan en una partición montada en memoria RAM volátil (RAM-Disk tmpfs). Ningún registro nominal o territorial en caliente se escribe en los discos sólidos."),
        ("Extinción de Datos por Interrupción Eléctrica", "Ante la inminencia de un allanamiento, un operador solo debe accionar el pulsador de corte de emergencia de la UPS Epcom o desconectar el cable de alimentación. Al perder energía la memoria dinámica (DRAM), el contenido se evapora en nanosegundos a nivel cuántico."),
        ("Respaldos Asimétricos Sellados (GPG 4.096 bits)", "Los respaldos periódicos se generan como paquetes sellados con la Llave Pública del partido. La Llave Privada requerida para abrir dichos paquetes reside exclusivamente fuera del país en custodia del Dr. José Gregorio 'El Gato' Briceño.")
    ]
    body.append(card_openxml(
        "Propuesta Actualizada 3: Motor de Datos en Memoria Volátil RAM con Sello Asimétrico",
        "Blindaje Transaccional y Anti-Forense",
        p3_items,
        "Cero remanencia magnética en hardware local: Si incautan el equipo apagado o desconectado, los discos solo contienen bloques vacíos o respaldos históricos sellados que nadie en Venezuela puede descifrar."
    ))

    # PROPUESTA 4: FICHA VECTORIAL NATIVA
    p4_items = [
        ("Encapsulamiento de Túnel en WebSocket TLS 1.3", "El Gateway MikroTik hEX RB750Gr3 encapsula el túnel privado dentro de conexiones estándar HTTPS sobre el puerto 443, utilizando extensiones ECH (Encrypted Client Hello) y simulación de tráfico web de alta reputación."),
        ("Inmunidad ante Filtros de Cantv / Conatel", "Para los sistemas de inspección profunda de paquetes (DPI) de las empresas estatales, el tráfico emitido desde la sede de Maturín es completamente idéntico a una navegación de usuario consumiendo video institucional o navegando en la banca electrónica."),
        ("Aislamiento Total de Dirección IP", "El servidor físico no posee ninguna dirección IP pública asignada ni abre puertos hacia el exterior. Todas las solicitudes de los testigos en los 13 municipios son recibidas por el Cloud VPS y canalizadas silenciosamente a través del túnel camuflado.")
    ]
    body.append(card_openxml(
        "Propuesta Actualizada 4: Enrutamiento Sigiloso Camuflado Anti-DPI (MikroTik + WSS)",
        "Seguridad de Red e Invisibilidad Perimetral",
        p4_items,
        "Imposibilidad de geolocalización o bloqueo selectivo: La Sala Situacional opera en modo espectro, inmune a las listas de bloqueo de protocolos VPN de los organismos de censura digital."
    ))

    # =========================================================
    # CAPÍTULO III: MATRIZ COMPARATIVA DE RESILIENCIA (TABLA APA)
    # =========================================================
    body.append(h1_apa("CAPÍTULO III: EVALUACIÓN COMPARATIVA DE RESILIENCIA"))
    
    body.append(p_apa(
        "A continuación se evalúa el nivel de respuesta y protección de la infraestructura ante los vectores de amenaza más severos, contrastando el modelo preliminar con la arquitectura de vanguardia actualizada:",
        bold_prefix="3.1. Matriz de Resiliencia Comparada."
    ))

    headers_comp = ["Vector de Amenaza / Incidente", "Modelo Preliminar (Desactualizado)", "Arquitectura Actualizada (2026)", "Nivel de Protección"]
    rows_comp = [
        [
            "Sustracción física de discos SSD",
            "Cifrado LUKS dependiente de Tang (Vulnerable si cae VPS)",
            "Cifrado Shamir 2-de-3 (TPM + Llave Móvil + VPS)",
            "Absoluto (100% ruido matemático)"
        ],
        [
            "Allanamiento violento con coacción armada",
            "Sin mecanismo de respuesta (Riesgo de tortura o delación)",
            "Clave de Coacción + Purga en 80ms + SO Señuelo",
            "Crítico (Salva vidas y sella la data)"
        ],
        [
            "Bloqueo de IP del VPS por Cantv/Conatel",
            "Servidor físico no arranca (Parálisis operativa)",
            "Arranque autónomo con Llave Local + TPM",
            "Operatividad Continua Garantizada"
        ],
        [
            "Inspección de Tráfico DPI estatal",
            "Túnel WireGuard UDP detectable y bloqueable",
            "Túnel camuflado en WebSocket HTTPS (Puerto 443)",
            "Invisibilidad Total ante Operadoras"
        ],
        [
            "Análisis Forense con Kali / Cellebrite",
            "Datos remanentes recuperables en sectores de disco",
            "Base de datos en RAM (tmpfs) volátil al desconectar",
            "Cero Remanencia Forense"
        ]
    ]
    body.append(table_apa(
        headers_comp, 
        rows_comp, 
        note="Nota. Evaluación de ciberdefensa elaborada bajo estándares NIST SP 800-88 (Sanitización de Medios) e ISO/IEC 27001 para la infraestructura física de MIGATO 2026."
    ))

    # =========================================================
    # CAPÍTULO IV: IMPACTO ECONÓMICO Y PRESUPUESTO
    # =========================================================
    body.append(h1_apa("CAPÍTULO IV: ANÁLISIS DE COSTOS E IMPLEMENTACIÓN"))
    
    body.append(p_apa(
        "Uno de los atributos estratégicos más relevantes de la presente actualización radica en que su implementación es estrictamente arquitectónica y algorítmica. No requiere la adquisición de tarjetas propietarias, racks industriales ni componentes importados con sobreprecio.",
        bold_prefix="4.1. Eficiencia Presupuestaria Soberana."
    ))

    headers_costo = ["Componente Arquitectónico", "Herramienta Tecnológica Utilizada", "Licenciamiento", "Costo Adicional (USD)"]
    rows_costo = [
        ["Algoritmo Secreto Compartido", "Shamir Secret Sharing (libgfshare / Clevis SSS)", "Open Source (GPLv3)", "$0.00 USD"],
        ["Clave de Coacción y Honeypot", "cryptsetup luksErase + Script pre-boot initramfs", "Nativo Linux", "$0.00 USD"],
        ["Base de Datos en RAM", "PostgreSQL montado en volumen tmpfs / zram", "Open Source (PostgreSQL)", "$0.00 USD"],
        ["Túnel Sigiloso Anti-DPI", "RouterOS v7 (MikroTik) + WebSocket WSS / Cloudflare", "Incluido en MikroTik hEX", "$0.00 USD"],
        ["TOTAL INVERSIÓN ADICIONAL", "Blindaje Criptográfico Completo de Servidor Físico", "Soberanía Técnica", "$0.00 USD"]
    ]
    body.append(table_apa(
        headers_costo, 
        rows_costo, 
        note="Nota. Las cuatro propuestas actualizadas se configuran sobre el hardware Dell OptiPlex Core i7, los 2 discos SSD en RAID 1 y el MikroTik hEX RB750Gr3 ya contemplados en el presupuesto formal de hardware ($862.46 USD)."
    ))

    # =========================================================
    # CAPÍTULO V: DICTAMEN CONCLUSIVO Y FIRMAS
    # =========================================================
    body.append(h1_apa("CAPÍTULO V: DICTAMEN TÉCNICO CONCLUSIVO"))
    
    body.append(p_apa(
        "Se recomienda formalmente a la Dirección General del Movimiento Independiente Ganamos Todos (MIGATO) y al Comando Estratégico de El Gato Briceño la APROBACIÓN E IMPLEMENTACIÓN INMEDIATA de las cuatro propuestas actualizadas de protección física. Esta arquitectura sitúa a la Sala Situacional de Maturín en el estándar más avanzado de ciberdefensa y seguridad de personas en entornos de persecución política, garantizando la preservación de las actas y la inmunidad de la militancia sin incrementar en un solo dólar el presupuesto aprobado.",
        bold_prefix="5.1. Dictamen de Aprobación:"
    ))

    # Bloque de Firmas Formal
    body.append("""
    <w:p><w:pPr><w:spacing w:before="300"/></w:pPr></w:p>
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="5000" w:type="pct"/>
        <w:tblBorders>
          <w:top w:val="none"/><w:bottom w:val="none"/><w:left w:val="none"/><w:right w:val="none"/>
          <w:insideH w:val="none"/><w:insideV w:val="none"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tr>
        <w:tc>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="240" w:after="20"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:color w:val="0F172A"/></w:rPr><w:t>__________________________________</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="20"/><w:color w:val="0F172A"/></w:rPr><w:t>COMANDO ESTRATÉGICO MIGATO</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:color w:val="475569"/><w:sz w:val="17"/></w:rPr><w:t>Dirección de Operaciones • El Gato Briceño</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="240" w:after="20"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:color w:val="0F172A"/></w:rPr><w:t>__________________________________</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="20"/><w:color w:val="0F172A"/></w:rPr><w:t>ING. DIEGO DONADO</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:color w:val="475569"/><w:sz w:val="17"/></w:rPr><w:t>Responsable de Ciencia y Tecnología MIGATO</w:t></w:r></w:p>
        </w:tc>
      </w:tr>
    </w:tbl>
    """)

    # Ensamblar Documento
    document_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
            xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
  <w:body>
    {''.join(body)}
    {sectPr}
  </w:body>
</w:document>"""

    # Escribir el archivo .docx (ZIP contenedor)
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as docx:
        docx.writestr('[Content_Types].xml', content_types)
        docx.writestr('_rels/.rels', rels)
        docx.writestr('word/_rels/document.xml.rels', doc_rels)
        docx.writestr('word/document.xml', document_xml)
        docx.writestr('word/styles.xml', styles)
        docx.writestr('word/header1.xml', header1)
        docx.writestr('word/header_first.xml', header_first)
        docx.writestr('word/footer1.xml', footer1)
        docx.writestr('word/footer_first.xml', footer_first)
        if has_logo:
            docx.writestr('word/media/logo.png', logo_bytes)
            docx.writestr('word/_rels/header1.xml.rels', header_rels)

    print(f"[OK] Archivo DOCX oficial generado exitosamente en: {output_path}")

def main():
    docx_path = PROJECT_ROOT / "PROPUESTAS_ACTUALIZADAS_SERVIDOR_FISICO_MIGATO_2026.docx"
    pdf_path = PROJECT_ROOT / "PROPUESTAS_ACTUALIZADAS_SERVIDOR_FISICO_MIGATO_2026.pdf"

    build_docx(docx_path)

    # Convertir a PDF con LibreOffice
    print("[...] Compilando PDF formal con LibreOffice...")
    try:
        tmp_user_dir = PROJECT_ROOT / ".libreoffice_tmp"
        tmp_user_dir.mkdir(exist_ok=True)
        cmd = [
            "libreoffice",
            f"-env:UserInstallation=file://{tmp_user_dir.resolve()}",
            "--headless",
            "--convert-to", "pdf",
            "--outdir", str(PROJECT_ROOT),
            str(docx_path)
        ]
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        if res.returncode == 0:
            print(f"[OK] Documento PDF compilado con éxito en: {pdf_path}")
        else:
            print(f"[WARN] Error convirtiendo con LibreOffice: {res.stderr}")
    except Exception as e:
        print(f"[WARN] Excepción al invocar LibreOffice: {e}")

if __name__ == "__main__":
    main()
