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

    doc_body.append(p_title("PROPUESTA TÉCNICA Y PRESUPUESTO DE INFRAESTRUCTURA: SERVIDOR LOCAL Y NUBE"))
    doc_body.append(p_subtitle("Informe Técnico-Económico para la Puesta en Marcha de la Sala Situacional de Campaña, Servidor Físico RAID 1, Gateway MikroTik y Servidor Cloud VPS MIGATO 2026"))
    doc_body.append(p_blank(100))

    doc_body.append(p_author_block())
    doc_body.append(p_blank(80))

    doc_body.append(p_date("Maturín, septiembre de 2026"))
    doc_body.append(p_page_break())

    # ==========================================
    # PÁGINA 2: INTRODUCCIÓN Y EQUIPAMIENTO FÍSICO
    # ==========================================
    doc_body.append(p_section_title("INTRODUCCIÓN Y PREMISA OPERATIVA", space_before=10, space_after=12))
    doc_body.append(p_body(
        "El presente informe tiene como propósito exponer ante la directiva del partido y el comando de campaña "
        "la propuesta técnica y el presupuesto de dotación tecnológica, instalación y puesta en marcha para la "
        "Sala Situacional de Maturín y la plataforma electoral del Movimiento Independiente Ganamos Todos (MIGATO) en el Estado Monagas. "
        "Premisa de Alcance: El presente proyecto se enfoca estrictamente en el equipamiento de cómputo, almacenamiento RAID 1, electrónica de red y conectividad lógica, "
        "bajo la premisa de que la sede ya cuenta con el centro de cómputo acondicionado (rack de comunicaciones existente y acometida eléctrica base). "
        "De requerirse obras civiles adicionales (suministro de rack de piso, marquesinas o cableado de potencia), se presupuestarán en una fase anexa independiente."
    , indent=True, space_after=14))

    doc_body.append(p_section_title("1. RESUMEN EJECUTIVO DE INVERSIÓN", space_before=10, space_after=6))
    doc_body.append(p_body(
        "Para lograr un despliegue equilibrado, la inversión se divide en dos componentes: 1) Equipamiento físico de sala para procesamiento local de alta velocidad sin saturar el ancho de banda; y 2) Servidor en la nube (Cloud VPS) con disponibilidad 24/7 para el reporte móvil de los testigos en centros electorales.",
        indent=True, space_after=8
    ))

    resumen_headers = ["Componente / Ámbito", "Modalidad de Inversión", "Cobertura Operativa", "Inversión (USD)"]
    resumen_rows = [
        ["A. Equipamiento Físico de Sala", "Pago Único (Hardware)", "45 a 60 min de respaldo en apagones", "$862,46 USD"],
        ["B. Servidor Cloud VPS (Nube)", "Suscripción Mensual", "24/7 en línea para los 13 municipios", "$24,50 USD / mes"],
        ["TOTAL INVERSIÓN INTEGRAL", "Equipos físicos + 1 año de Servidor Cloud", "Sala Situacional + Cobertura Total", "$1.156,46 USD"]
    ]
    doc_body.append(build_iutirla_table(resumen_headers, resumen_rows, [3000, 2400, 2400, 1800]))
    doc_body.append(p_blank(12))

    doc_body.append(p_section_title("2. DETALLE DE EQUIPAMIENTO E INSTALACIÓN (SALA SITUACIONAL)", space_before=10, space_after=6))
    doc_body.append(p_body(
        "Se descartan servidores industriales pesados de rack (Dell PowerEdge antiguos) debido a su excesivo consumo eléctrico (300W a 500W), ruido ensordecedor y escasa autonomía en UPS. "
        "En su lugar, se implementa una estación de trabajo Dell OptiPlex Core i7 con almacenamiento dual 100% en estado sólido en arreglo espejo (RAID 1) y consumo eficiente (65W). "
        "A continuación se detallan los costos cotizados en tiempo real en Mercado Libre Venezuela:",
        indent=True, space_after=8
    ))

    piezas_headers = ["N°", "Equipo / Dispositivo", "Especificación Técnica Real", "Cant.", "Costo Unit.", "Total (USD)"]
    piezas_rows = [
        ["1", "Computador Servidor Dell OptiPlex", "Core i7-6700 (3.40 GHz), 8 GB RAM DDR4 (expandible), chasis SFF silencioso (65W)", "1", "$215,00", "$215,00 USD"],
        ["2", "Discos Sólidos SSD 480GB (RAID 1)", "2x SSD SATA 2.5\" 480GB WD Green en Espejo simétrico (Sistema y Base de Datos)", "2", "$109,99", "$219,98 USD"],
        ["3", "Router Gateway MikroTik hEX", "MikroTik RB750Gr3 (Dual Core 880MHz, 5 Puertos Gigabit). Firewall y túnel WireGuard", "1", "$105,00", "$105,00 USD"],
        ["4", "Switch Gigabit de Sala (16 Puertos)", "TP-Link TL-SG1016D 16 Puertos 10/100/1000 Mbps chasis metálico para distribución", "1", "$99,96", "$99,96 USD"],
        ["5", "Bobina Cable UTP Cat6 (305 metros)", "Bobina 305m Cat6 STC interior 100% cobre para cableado estructurado de puestos", "1", "$72,99", "$72,99 USD"],
        ["6", "Conectores RJ45 Cat6 (Caja 100 un.)", "Conectores RJ45 Cat6 con contactos dorados de alta conductividad para patch cords", "1", "$6,62", "$6,62 USD"],
        ["7", "Kit de Herramientas de Red UTP", "Kit completo: ponchadora/crimpeadora RJ45-RJ11 + tester UTP probador de cable", "1", "$12,50", "$12,50 USD"],
        ["8", "UPS de Respaldo Eléctrico 1.200 VA", "UPS Epcom EPU1200LCD 1.200 VA con pantalla digital interactiva y regulador AVR", "1", "$130,41", "$130,41 USD"],
        ["—", "TOTAL EQUIPAMIENTO FÍSICO", "Dotación completa de cómputo, almacenamiento RAID 1, red y respaldo eléctrico", "—", "—", "$862,46 USD"]
    ]
    doc_body.append(build_iutirla_table(piezas_headers, piezas_rows, [400, 2400, 3800, 600, 1100, 1300]))
    doc_body.append(p_table_note(
        "* Nota Técnica sobre Almacenamiento (SATA vs. M.2 NVMe): La placa base del Dell OptiPlex 5040 posee una sola ranura M.2 de almacenamiento y dos puertos SATA III. Para asegurar redundancia simétrica RAID 1 (espejo en tiempo real) sin adaptadores PCIe adicionales ni sobrecalentamiento en chasis SFF, se emplean dos discos SSD SATA 2.5\" nativos."
    ))

    # Salto a Página 3
    doc_body.append(p_page_break())

    # ==========================================
    # PÁGINA 3: SINCRONIZACIÓN, NUBE Y FIRMAS
    # ==========================================
    doc_body.append(p_section_title("3. ARQUITECTURA: VANGUARDIA EN LA NUBE Y BÓVEDA FÍSICA", space_before=10, space_after=15))
    doc_body.append(p_body(
        "Para blindar la plataforma política contra sabotajes, bloqueos o apagones, la infraestructura opera bajo un modelo de dos capas: Vanguardia en la Nube (Front-line) y Bóveda Blindada en Físico (Data Vault):",
        indent=True, space_after=12
    ))

    doc_body.append(p_bullet_bold(
        "1. Vanguardia en la Nube (Cloud VPS Front-line)",
        "Constituye la primera línea de recepción. Recibe el tráfico masivo de teléfonos de testigos en los 13 municipios, valida reportes y absorbe cualquier ataque cibernético (DDoS) sin exponer la dirección IP ni la ubicación física de la sede en Maturín.",
        space_after=10
    ))
    doc_body.append(p_bullet_bold(
        "2. Enlace Cifrado y Replicación Continua",
        "El Servidor Cloud VPS retransmite las transacciones en tiempo real al computador Dell de la oficina en Maturín a través de un túnel seguro VPN WireGuard gestionado por el router MikroTik.",
        space_after=10
    ))
    doc_body.append(p_bullet_bold(
        "3. Bóveda Física en Espejo (RAID 1)",
        "El computador Dell en sala graba cada voto y acta simultáneamente en sus dos unidades SSD. Si Conatel bloquea la nube o se corta el internet internacional, MIGATO conserva el 100% de la información físicamente en sus manos, inconfiscable e imborrable.",
        space_after=10
    ))
    doc_body.append(p_bullet_bold(
        "4. Respaldo Eléctrico y Autonomía Local",
        "En caso de corte eléctrico en Maturín, el UPS mantiene la estación Dell, el switch y el MikroTik operando durante 45 a 60 minutos. Si el corte persiste, la sala continúa procesando actas en red local por llamadas directas sin depender de la nube.",
        space_after=18
    ))

    doc_body.append(p_section_title("4. RECOMENDACIÓN FINAL Y DECISIÓN", space_before=15, space_after=10))
    doc_body.append(p_body(
        "Se recomienda formalmente la aprobación del presupuesto físico de $862,46 USD para la dotación de la Sala Situacional y la suscripción del Servidor Cloud VPS ($24,50 USD/mes), otorgando a MIGATO una plataforma territorial moderna, de máxima velocidad y blindada contra fallas. "
        "Nota de Seguridad: El sistema de cámaras de videovigilancia (CCTV) se cotizará por separado más adelante según lo instruido; no obstante, el switch de 16 puertos, el kit de herramientas y la bobina Cat6 presupuestados en este documento ya dejan instalados los puntos de red requeridos.",
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
