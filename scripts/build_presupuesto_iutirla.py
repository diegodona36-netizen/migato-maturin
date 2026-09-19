#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador del Presupuesto Oficial MIGATO en Formato Académico / Institucional IUTIRLA
Movimiento Independiente Ganamos Todos (MIGATO) • Estado Monagas
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
  <Relationship Id="rIdHeaderLogo" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo.png"/>
</Relationships>"""

    # 5. Styles
    styles = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
        <w:sz w:val="23"/>
        <w:szCs w:val="23"/>
        <w:color w:val="000000"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:line="280" w:lineRule="auto" w:before="0" w:after="0"/>
        <w:jc w:val="both"/>
      </w:pPr>
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

    # Running header institucional idéntico a las fotos
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
              <w:color w:val="000000"/>
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
              <w:color w:val="444444"/>
            </w:rPr>
            <w:t>EQUIPO TÉCNICO REGIONAL DE INFORMÁTICA Y SISTEMAS • ESTADO MONAGAS</w:t>
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
              <w:color w:val="444444"/>
            </w:rPr>
            <w:t>Página </w:t>
          </w:r>
          <w:fldSimple w:instr="PAGE"/>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
              <w:sz w:val="15"/>
              <w:szCs w:val="15"/>
              <w:color w:val="444444"/>
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
        <w:color w:val="777777"/>
      </w:rPr>
      <w:t>Sala Situacional El Gato Briceño • Maturín, Estado Monagas</w:t>
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
            <w:spacing w:before="100" w:after="100" w:line="240" w:lineRule="auto"/>
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
            <w:t>Equipo Técnico Regional de Sistemas e Informática</w:t>
          </w:r>
        </w:p>
        <w:p>
          <w:pPr>
            <w:spacing w:before="0" w:after="50" w:line="240" w:lineRule="auto"/>
            <w:ind w:left="3800"/>
            <w:jc w:val="left"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
              <w:sz w:val="21"/>
            </w:rPr>
            <w:t>Ing. Diego Donado • Ciencia y Tecnología MIGATO</w:t>
          </w:r>
        </w:p>"""

    def p_date(text):
        return f"""<w:p>
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
            <w:t>{escape(text)}</w:t>
          </w:r>
        </w:p>"""

    def p_page_break():
        return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>'

    def p_section_title(text, space_before=40, space_after=20):
        return f"""<w:p>
          <w:pPr>
            <w:spacing w:before="{space_before}" w:after="{space_after}" w:line="240" w:lineRule="auto"/>
            <w:jc w:val="center"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
              <w:b/>
              <w:sz w:val="22"/>
              <w:szCs w:val="22"/>
            </w:rPr>
            <w:t>{escape(text)}</w:t>
          </w:r>
        </w:p>"""

    def p_body(text, indent=True, space_after=30):
        ind_tag = '<w:ind w:firstLine="567"/>' if indent else ''
        return f"""<w:p>
          <w:pPr>
            <w:spacing w:before="0" w:after="{space_after}" w:line="260" w:lineRule="auto"/>
            {ind_tag}
            <w:jc w:val="both"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
              <w:sz w:val="21"/>
              <w:szCs w:val="21"/>
            </w:rPr>
            <w:t xml:space="preserve">{escape(text)}</w:t>
          </w:r>
        </w:p>"""

    def p_bullet_bold(title, text, space_after=20):
        return f"""<w:p>
          <w:pPr>
            <w:spacing w:before="0" w:after="{space_after}" w:line="250" w:lineRule="auto"/>
            <w:ind w:left="360" w:hanging="360"/>
            <w:jc w:val="both"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
              <w:b/>
              <w:sz w:val="20"/>
            </w:rPr>
            <w:t xml:space="preserve">• {escape(title)}: </w:t>
          </w:r>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
              <w:sz w:val="20"/>
            </w:rPr>
            <w:t xml:space="preserve">{escape(text)}</w:t>
          </w:r>
        </w:p>"""

    def p_table_note(text):
        return f"""<w:p>
          <w:pPr>
            <w:spacing w:before="6" w:after="20" w:line="200" w:lineRule="auto"/>
            <w:jc w:val="both"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
              <w:i/>
              <w:sz w:val="16"/>
              <w:szCs w:val="16"/>
              <w:color w:val="444444"/>
            </w:rPr>
            <w:t>{escape(text)}</w:t>
          </w:r>
        </w:p>"""

    def build_iutirla_table(headers, rows, col_widths):
        t_xml = f"""<w:tbl>
          <w:tblPr>
            <w:tblW w:w="0" w:type="auto"/>
            <w:jc w:val="center"/>
            <w:tblBorders>
              <w:top w:val="single" w:sz="6" w:space="0" w:color="000000"/>
              <w:left w:val="none"/>
              <w:bottom w:val="single" w:sz="6" w:space="0" w:color="000000"/>
              <w:right w:val="none"/>
              <w:insideH w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
              <w:insideV w:val="none"/>
            </w:tblBorders>
            <w:tblCellMar>
              <w:top w:w="40" w:type="dxa"/>
              <w:left w:w="80" w:type="dxa"/>
              <w:bottom w:w="40" w:type="dxa"/>
              <w:right w:w="80" w:type="dxa"/>
            </w:tblCellMar>
          </w:tblPr>
          <w:tblGrid>"""
        for w in col_widths:
            t_xml += f'<w:gridCol w:w="{w}"/>'
        t_xml += "</w:tblGrid>"

        # Header Row
        t_xml += """<w:tr><w:trPr><w:tblHeader/></w:trPr>"""
        for idx, h in enumerate(headers):
            align = "center" if ("cant" in h.lower() or "n°" in h.lower()) else ("right" if "$" in h or "costo" in h.lower() or "total" in h.lower() or "inversión" in h.lower() else "left")
            t_xml += f"""<w:tc><w:tcPr><w:tcW w:w="{col_widths[idx]}" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="EAEAEA"/></w:tcPr>
              <w:p><w:pPr><w:spacing w:before="10" w:after="10" w:line="220" w:lineRule="auto"/><w:jc w:val="{align}"/></w:pPr>
                <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="17"/></w:rPr><w:t>{escape(h)}</w:t></w:r>
              </w:p>
            </w:tc>"""
        t_xml += "</w:tr>"

        # Data Rows
        for row in rows:
            is_total = "TOTAL" in str(row[0]).upper() or "TOTAL" in str(row[1]).upper()
            b_tag = "<w:b/>" if is_total else ""
            fill_color = ' w:fill="F5F5F5"' if is_total else ''
            t_xml += "<w:tr>"
            for c_idx, val in enumerate(row):
                align = "center" if (c_idx == 0 and len(str(val)) <= 3) or headers[c_idx].lower() in ["cant.", "n°"] else ("right" if "$" in str(val) and c_idx > 0 else "left")
                t_xml += f"""<w:tc><w:tcPr><w:tcW w:w="{col_widths[c_idx]}" w:type="dxa"/><w:shd w:val="clear" w:color="auto"{fill_color}/></w:tcPr>
                  <w:p><w:pPr><w:spacing w:before="6" w:after="6" w:line="220" w:lineRule="auto"/><w:jc w:val="{align}"/></w:pPr>
                    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>{b_tag}<w:sz w:val="17"/></w:rPr><w:t>{escape(str(val))}</w:t></w:r>
                  </w:p>
                </w:tc>"""
            t_xml += "</w:tr>"

        t_xml += "</w:tbl>"
        return t_xml

    doc_body = []

    # ==========================================
    # PÁGINA 1: PORTADA INSTITUCIONAL IUTIRLA / MIGATO
    # ==========================================
    doc_body.append(p_cintillo("REPÚBLICA BOLIVARIANA DE VENEZUELA"))
    doc_body.append(p_cintillo("MOVIMIENTO INDEPENDIENTE GANAMOS TODOS (MIGATO)"))
    doc_body.append(p_cintillo("EQUIPO TÉCNICO REGIONAL DE INFORMÁTICA Y SISTEMAS"))
    doc_body.append(p_cintillo("MATURÍN, ESTADO MONAGAS"))
    doc_body.append(p_blank(60))

    doc_body.append(p_logo())
    doc_body.append(p_blank(60))

    doc_body.append(p_title("PROPUESTA TÉCNICA Y PRESUPUESTO ESTIMADO DE EQUIPAMIENTO FÍSICO: SALA SITUACIONAL MATURÍN"))
    doc_body.append(p_subtitle("Informe Técnico-Económico de Dotación de Cómputo, Almacenamiento Local RAID 1, Electrónica de Red y Respaldo Eléctrico para la Plataforma Electoral MIGATO 2026"))
    doc_body.append(p_blank(100))

    doc_body.append(p_author_block())
    doc_body.append(p_blank(80))

    doc_body.append(p_date("Maturín, septiembre de 2026"))
    doc_body.append(p_page_break())

    # ==========================================
    # PÁGINA 2: INTRODUCCIÓN, PREMISAS Y DETALLE FÍSICO
    # ==========================================
    doc_body.append(p_section_title("INTRODUCCIÓN Y PREMISAS DE INSTALACIÓN", space_before=10, space_after=8))
    doc_body.append(p_body(
        "El presente informe técnico-económico tiene como propósito someter a consideración de la directiva regional del Movimiento Independiente Ganamos Todos (MIGATO) y el comando de campaña de José Gregorio \"El Gato\" Briceño el presupuesto estimado de dotación física, instalación y puesta en marcha de la Sala Situacional de Maturín. "
        "Premisa Operativa de Alcance: La propuesta se circunscribe de manera estricta a la dotación de hardware de cómputo, almacenamiento masivo redundante en espejo (RAID 1), conmutación de red estructurada y respaldo eléctrico. Se asume como premisa que la sede central ya dispone del área de centro de cómputo, rack de comunicaciones y acometida eléctrica operativa. "
        "En caso de que la dirección requiera adecuaciones civiles complementarias (suministro de racks de piso adicionales, marquesinas de tendido perimetral o cableado de potencia), estas se canalizarán en un anexo independiente, al igual que los servicios en la nube (Cloud VPS, dominios y telefonía IP) que cuentan con su respectivo presupuesto especializado."
    , indent=True, space_after=12))

    doc_body.append(p_section_title("1. DESGLOSE PRESUPUESTARIO DE EQUIPAMIENTO FÍSICO", space_before=8, space_after=6))
    doc_body.append(p_body(
        "Se descarta el uso de servidores industriales antiguos de rack (Dell PowerEdge) por su alto consumo eléctrico (300W a 500W), ruido y rápida descarga de baterías. En su lugar, se implementa una estación de trabajo Dell OptiPlex Core i7 de alta eficiencia energética (65W) con almacenamiento simétrico en estado sólido. A continuación se detalla el presupuesto estimado con base en valores referenciales del mercado tecnológico nacional:",
        indent=True, space_after=8
    ))

    piezas_headers = ["N°", "Equipo / Dispositivo", "Especificación Técnica Real", "Cant.", "Ref. Unit.", "Total Estimado"]
    piezas_rows = [
        ["1", "Computador Servidor Dell OptiPlex", "Core i7-6700 (3.40 GHz), 8 GB RAM DDR4 (expandible), chasis SFF silencioso (65W)", "1", "$215,00", "$215,00 USD"],
        ["2", "Discos Sólidos SSD 480GB (RAID 1)", "2x SSD SATA 2.5\" 480GB WD Green en Espejo simétrico (Sistema y Base de Datos)", "2", "$109,99", "$219,98 USD"],
        ["3", "Router Gateway MikroTik hEX", "MikroTik RB750Gr3 (Dual Core 880MHz, 5 Puertos Gigabit). Firewall y gestión de tráfico", "1", "$105,00", "$105,00 USD"],
        ["4", "Switch Gigabit de Sala (16 Puertos)", "TP-Link TL-SG1016D 16 Puertos 10/100/1000 Mbps chasis metálico para distribución", "1", "$99,96", "$99,96 USD"],
        ["5", "Bobina Cable UTP Cat6 (305 metros)", "Bobina 305m Cat6 STC interior 100% cobre para cableado estructurado de puestos", "1", "$72,99", "$72,99 USD"],
        ["6", "Conectores RJ45 Cat6 (Caja 100 un.)", "Conectores RJ45 Cat6 con contactos dorados de alta conductividad para patch cords", "1", "$6,62", "$6,62 USD"],
        ["7", "Kit de Herramientas de Red UTP", "Kit completo: ponchadora/crimpeadora RJ45-RJ11 + tester UTP probador de cable", "1", "$12,50", "$12,50 USD"],
        ["8", "UPS de Respaldo Eléctrico 1.200 VA", "UPS Epcom EPU1200LCD 1.200 VA con pantalla digital interactiva y regulador AVR", "1", "$130,41", "$130,41 USD"],
        ["—", "TOTAL EQUIPAMIENTO FÍSICO", "Dotación completa de cómputo, almacenamiento RAID 1, red y respaldo eléctrico", "—", "—", "$862,46 USD"]
    ]
    doc_body.append(build_iutirla_table(piezas_headers, piezas_rows, [400, 2400, 3800, 600, 1100, 1300]))
    doc_body.append(p_table_note(
        "* Nota de Presupuesto: Los valores reflejados corresponden a un presupuesto estimativo con precios referenciales de mercado y no constituyen una cotización formal ni oferta comercial vinculante de un proveedor en específico. Placa OptiPlex 5040 posee 1 slot M.2 y 2 puertos SATA III; para RAID 1 simétrico estable sin recalentamiento en SFF, se emplean dos discos SSD SATA nativos."
    ))

    # Salto a Página 3
    doc_body.append(p_page_break())

    # ==========================================
    # PÁGINA 3: ARQUITECTURA LOCAL, RECOMENDACIÓN Y FIRMAS
    # ==========================================
    doc_body.append(p_section_title("3. ARQUITECTURA DE LA BÓVEDA LOCAL DE DATOS (DATA VAULT)", space_before=10, space_after=15))
    doc_body.append(p_body(
        "Para garantizar que el comando de campaña disponga de una infraestructura resiliente, inconfiscable e inmune a contingencias externas, el despliegue físico se fundamenta en cuatro pilares de ingeniería:",
        indent=True, space_after=12
    ))

    doc_body.append(p_bullet_bold(
        "1. Procesamiento Local Autónomo de Alta Velocidad",
        "La estación Dell OptiPlex Core i7 con 8 GB de memoria RAM DDR4 procesa localmente la cartografía electoral, el padrón de electores de Monagas y los tableros analíticos en pantallas de sala con tiempos de respuesta inmediatos y sin saturar el enlace de datos.",
        space_after=10
    ))
    doc_body.append(p_bullet_bold(
        "2. Bóveda Física en Espejo (Arreglo RAID 1)",
        "Toda información de mesas, electores y actas se graba de forma redundante y simultánea en dos discos de estado sólido independientes. Si cualquiera de las unidades sufriera un daño mecánico o lógico, el sistema continúa operando sin interrupción ni pérdida de un solo registro.",
        space_after=10
    ))
    doc_body.append(p_bullet_bold(
        "3. Electrónica de Red Segura y Segmentada",
        "El router profesional MikroTik hEX administra la seguridad perimetral de la sala y prioriza el ancho de banda para las computadoras de digitación de actas, mientras que el switch Gigabit de 16 puertos interconecta de forma cableada y estable los puestos de trabajo.",
        space_after=10
    ))
    doc_body.append(p_bullet_bold(
        "4. Respaldo Energético Crítico ante Apagones",
        "El UPS de 1.200 VA con regulador automático de voltaje (AVR) garantiza una ventana de autonomía de 45 a 60 minutos para el servidor y la electrónica de red durante cortes de energía, permitiendo mantener la sala operativa y protegiendo el equipamiento contra fluctuaciones de corriente.",
        space_after=18
    ))

    doc_body.append(p_section_title("4. RECOMENDACIÓN FINAL Y DECISIÓN", space_before=15, space_after=10))
    doc_body.append(p_body(
        "Se recomienda formalmente a la dirección política del partido la aprobación del presupuesto estimado de $862,46 USD para la dotación e instalación del equipamiento físico de la Sala Situacional de Maturín. Esta inversión dotará a MIGATO de un centro de cómputo robusto, eficiente y bajo control 100% propio. "
        "Nota de Seguridad: El sistema de cámaras de videovigilancia (CCTV) se presupuestará por separado según lo acordado; no obstante, el switch de 16 puertos, la bobina Cat6 y el kit de herramientas presupuestados en este informe dejan instalados los puntos de red requeridos.",
        indent=True, space_after=25
    ))

    doc_body.append(p_section_title("5. CONFORMIDAD Y FIRMAS AUTORIZADAS", space_before=15, space_after=20))
    doc_body.append("""<w:tbl>
      <w:tblPr>
        <w:tblW w:w="8260" w:type="dxa"/>
        <w:jc w:val="center"/>
        <w:tblBorders>
          <w:top w:val="none"/><w:left w:val="none"/><w:bottom w:val="none"/><w:right w:val="none"/>
          <w:insideH w:val="none"/><w:insideV w:val="none"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tblGrid>
        <w:gridCol w:w="4130"/>
        <w:gridCol w:w="4130"/>
      </w:tblGrid>
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="4130" w:type="dxa"/></w:tcPr>
          <w:p>
            <w:pPr><w:spacing w:before="120" w:after="15" w:line="240" w:lineRule="auto"/><w:jc w:val="center"/></w:pPr>
            <w:r><w:t>_______________________________________</w:t></w:r>
          </w:p>
          <w:p>
            <w:pPr><w:spacing w:before="0" w:after="10" w:line="240" w:lineRule="auto"/><w:jc w:val="center"/></w:pPr>
            <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="19"/><w:color w:val="000000"/></w:rPr><w:t>COMANDO ESTRATÉGICO MIGATO</w:t></w:r>
          </w:p>
          <w:p>
            <w:pPr><w:spacing w:before="0" w:after="0" w:line="200" w:lineRule="auto"/><w:jc w:val="center"/></w:pPr>
            <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="15"/><w:color w:val="555555"/></w:rPr><w:t>Dirección de Operaciones • El Gato Briceño</w:t></w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="4130" w:type="dxa"/></w:tcPr>
          <w:p>
            <w:pPr><w:spacing w:before="120" w:after="15" w:line="240" w:lineRule="auto"/><w:jc w:val="center"/></w:pPr>
            <w:r><w:t>_______________________________________</w:t></w:r>
          </w:p>
          <w:p>
            <w:pPr><w:spacing w:before="0" w:after="10" w:line="240" w:lineRule="auto"/><w:jc w:val="center"/></w:pPr>
            <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="19"/><w:color w:val="000000"/></w:rPr><w:t>ING. DIEGO DONADO</w:t></w:r>
          </w:p>
          <w:p>
            <w:pPr><w:spacing w:before="0" w:after="0" w:line="200" w:lineRule="auto"/><w:jc w:val="center"/></w:pPr>
            <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="15"/><w:color w:val="555555"/></w:rPr><w:t>Responsable de Ciencia y Tecnología MIGATO</w:t></w:r>
          </w:p>
        </w:tc>
      </w:tr>
    </w:tbl>""")

    doc_body.append(sectPr)

    document_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
            xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
  <w:body>
    {''.join(doc_body)}
  </w:body>
</w:document>"""

    out_file = Path(output_path)
    with zipfile.ZipFile(out_file, 'w', compression=zipfile.ZIP_DEFLATED) as z:
        z.writestr('[Content_Types].xml', content_types)
        z.writestr('_rels/.rels', rels)
        z.writestr('word/_rels/document.xml.rels', doc_rels)
        z.writestr('word/_rels/header1.xml.rels', header_rels)
        z.writestr('word/document.xml', document_xml)
        z.writestr('word/styles.xml', styles)
        z.writestr('word/header1.xml', header1)
        z.writestr('word/footer1.xml', footer1)
        z.writestr('word/header_first.xml', header_first)
        z.writestr('word/footer_first.xml', footer_first)
        if has_logo:
            z.writestr('word/media/logo.png', logo_bytes)

    print(f"[OK] Documento DOCX IUTIRLA generado: {out_file}")

def main():
    docx_path = PROJECT_ROOT / "PROPUESTA_TECNICA_PRESUPUESTO_MIGATO_IUTIRLA.docx"
    pdf_path = PROJECT_ROOT / "PROPUESTA_TECNICA_PRESUPUESTO_MIGATO_IUTIRLA.pdf"

    build_docx(docx_path)

    # Convertir a PDF con LibreOffice
    print("[...] Compilando PDF formal...")
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
