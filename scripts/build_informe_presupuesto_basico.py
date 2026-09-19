#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador del Informe Básico de Presupuesto:
Infraestructura de Servidor Físico y Nube • Sala Situacional MIGATO 2026
Movimiento Independiente Ganamos Todos (MIGATO) • Estado Monagas
"""

import os
import sys
import zipfile
import html
import subprocess
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
LOGO_PATH = PROJECT_ROOT / "assets" / "logo-migato.png"

def escape(text):
    return html.escape(str(text))

def build_docx(output_path):
    has_logo = LOGO_PATH.exists()
    logo_bytes = LOGO_PATH.read_bytes() if has_logo else b""

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

    rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"""

    doc_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rIdHeader1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>
  <Relationship Id="rIdFooter1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
"""
    if has_logo:
        doc_rels += '  <Relationship Id="rIdLogo" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo.png"/>\n'
    doc_rels += "</Relationships>"

    styles = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>
        <w:sz w:val="20"/>
        <w:szCs w:val="20"/>
        <w:color w:val="1E293B"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:line="240" w:lineRule="auto" w:before="0" w:after="70"/>
        <w:jc w:val="both"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>

  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:pPr>
      <w:spacing w:before="160" w:after="70"/>
      <w:jc w:val="left"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
      <w:b/>
      <w:color w:val="0F172A"/>
      <w:sz w:val="24"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:pPr>
      <w:spacing w:before="120" w:after="40"/>
      <w:jc w:val="left"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
      <w:b/>
      <w:color w:val="0284C7"/>
      <w:sz w:val="21"/>
    </w:rPr>
  </w:style>
</w:styles>"""

    header1_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr>
      <w:pBdr><w:bottom w:val="single" w:sz="6" w:space="4" w:color="0284C7"/></w:pBdr>
      <w:spacing w:after="40"/>
    </w:pPr>
    <w:r><w:rPr><w:b/><w:sz w:val="16"/><w:color w:val="0284C7"/></w:rPr><w:t>MIGATO • COMANDO ESTRATÉGICO DE CAMPAÑA</w:t></w:r>
    <w:r><w:rPr><w:sz w:val="16"/><w:color w:val="64748B"/></w:rPr><w:t>  |  INFORME BÁSICO DE PRESUPUESTO 2026</w:t></w:r>
  </w:p>
</w:hdr>"""

    footer1_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr>
      <w:pBdr><w:top w:val="single" w:sz="4" w:space="4" w:color="CBD5E1"/></w:pBdr>
      <w:spacing w:before="40"/>
      <w:jc w:val="right"/>
    </w:pPr>
    <w:r><w:rPr><w:sz w:val="16"/><w:color w:val="64748B"/></w:rPr><w:t>Sala Situacional El Gato Briceño • Maturín, Estado Monagas</w:t></w:r>
  </w:p>
</w:ftr>"""

    def add_p(text, bold_prefix="", italic=False):
        t = ['<w:p><w:pPr><w:spacing w:after="70"/><w:jc w:val="both"/></w:pPr>']
        if bold_prefix:
            t.append(f'<w:r><w:rPr><w:b/><w:sz w:val="20"/><w:color w:val="0F172A"/></w:rPr><w:t>{escape(bold_prefix)} </w:t></w:r>')
        it = '<w:i/>' if italic else ''
        t.append(f'<w:r><w:rPr>{it}<w:sz w:val="20"/><w:color w:val="1E293B"/></w:rPr><w:t>{escape(text)}</w:t></w:r></w:p>')
        return ''.join(t)

    def add_h1(text):
        return f'<w:p><w:pPr><w:pStyle w:val="Heading1"/><w:spacing w:before="160" w:after="60"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="0F172A"/></w:rPr><w:t>{escape(text)}</w:t></w:r></w:p>'

    def add_callout(text):
        return f"""
        <w:p>
          <w:pPr>
            <w:pBdr>
              <w:left w:val="single" w:sz="24" w:space="12" w:color="0284C7"/>
            </w:pBdr>
            <w:shd w:val="clear" w:color="auto" w:fill="F0F9FF"/>
            <w:spacing w:before="100" w:after="100"/>
            <w:ind w:left="160" w:right="120"/>
          </w:pPr>
          <w:r>
            <w:rPr><w:sz w:val="19"/><w:color w:val="0369A1"/></w:rPr>
            <w:t>{escape(text)}</w:t>
          </w:r>
        </w:p>
        """

    def add_table(headers, rows):
        t = ['<w:tbl>']
        t.append('<w:tblPr>')
        t.append('<w:tblW w:w="5000" w:type="pct"/>')
        t.append('<w:tblBorders>')
        t.append('<w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>')
        t.append('<w:bottom w:val="single" w:sz="12" w:space="0" w:color="0F172A"/>')
        t.append('<w:left w:val="none"/><w:right w:val="none"/>')
        t.append('<w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>')
        t.append('<w:insideV w:val="none"/>')
        t.append('</w:tblBorders>')
        t.append('<w:tblCellMar><w:top w:w="110" w:type="dxa"/><w:left w:w="140" w:type="dxa"/><w:bottom w:w="110" w:type="dxa"/><w:right w:w="140" w:type="dxa"/></w:tblCellMar>')
        t.append('</w:tblPr>')

        # Header
        t.append('<w:tr><w:trPr><w:tblHeader/></w:trPr>')
        for h in headers:
            t.append(f'<w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="0F172A"/></w:tcPr><w:p><w:pPr><w:spacing w:after="0"/><w:jc w:val="left"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="19"/><w:color w:val="FFFFFF"/></w:rPr><w:t>{escape(h)}</w:t></w:r></w:p></w:tc>')
        t.append('</w:tr>')

        # Rows
        for idx, row in enumerate(rows):
            bg = "F8FAFC" if idx % 2 == 1 else "FFFFFF"
            is_total = "TOTAL" in str(row[0]).upper()
            if is_total:
                bg = "FEF3C7"
            t.append('<w:tr>')
            for c_idx, cell in enumerate(row):
                bold = '<w:b/>' if (is_total or c_idx == 0) else ''
                c_color = '0F172A' if (is_total or c_idx == 0) else '334155'
                align = "right" if ("$" in str(cell) or "%" in str(cell)) and c_idx > 0 else "left"
                t.append(f'<w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="{bg}"/></w:tcPr><w:p><w:pPr><w:spacing w:after="0"/><w:jc w:val="{align}"/></w:pPr><w:r><w:rPr>{bold}<w:sz w:val="18"/><w:color w:val="{c_color}"/></w:rPr><w:t>{escape(str(cell))}</w:t></w:r></w:p></w:tc>')
            t.append('</w:tr>')
        t.append('</w:tbl><w:p><w:pPr><w:spacing w:after="90"/></w:pPr></w:p>')
        return ''.join(t)

    body = []

    # Portada Ejecutiva Limpia
    body.append("""
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:before="100" w:after="30"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="0F172A"/></w:rPr><w:t>REPÚBLICA BOLIVARIANA DE VENEZUELA • ESTADO MONAGAS</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="30"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="0284C7"/></w:rPr><w:t>MOVIMIENTO INDEPENDIENTE GANAMOS TODOS (MIGATO)</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="140"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="19"/><w:color w:val="F59E0B"/></w:rPr><w:t>COMANDO ESTRATÉGICO DE CAMPAÑA • SALA SITUACIONAL EL GATO BRICEÑO</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:before="80" w:after="160"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="0F172A"/></w:rPr><w:t>INFORME DE PRESUPUESTO: INFRAESTRUCTURA DE SERVIDOR LOCAL Y NUBE</w:t></w:r>
    </w:p>
    """)

    # Ficha del Documento
    meta_headers = ["Concepto", "Información"]
    meta_rows = [
        ["Proyecto", "Plataforma Territorial y Sala Situacional MIGATO 2026"],
        ["Destino", "Sede Central de Campaña • Sala Situacional El Gato Briceño (Maturín)"],
        ["Responsable Técnico", "Ing. Diego Donado (Ciencia, Tecnología y Ciberdefensa)"],
        ["Referencia de Costos", "Precios Reales Disponibles en Mercado Libre Venezuela (USD / BCV)"],
        ["Fecha de Emisión", "Septiembre 2026"]
    ]
    body.append(add_table(meta_headers, meta_rows))

    # 1. RESUMEN EJECUTIVO
    body.append(add_h1("1. RESUMEN EJECUTIVO DE INVERSIÓN"))
    body.append(add_p("Este presupuesto define la inversión exacta y optimizada para dotar de tecnología y autonomía total a la Sala Situacional de Maturín y a los 13 municipios del Estado Monagas. Se descartan servidores industriales costosos e ineficientes de $2,500 USD, adoptando una arquitectura moderna, rápida, silenciosa y protegida contra los apagones de Corpoelec."))

    headers_resumen = ["Componente del Sistema", "Modalidad", "Autonomía / Cobertura", "Inversión (USD)"]
    rows_resumen = [
        ["A. Equipamiento Físico de Sala", "Pago Único (Hardware)", "45 a 60 min de respaldo en apagones", "$900.00 USD"],
        ["B. Servidor Cloud VPS (Nube)", "Suscripción Mensual", "24/7 en línea para los 13 municipios", "$24.50 USD / mes"],
        ["TOTAL INVERSIÓN INICIAL INTEGRAL", "Equipos físicos + 1 año de Servidor en la Nube", "Sala Situacional + Cobertura Total", "$1,194.00 USD"]
    ]
    body.append(add_table(headers_resumen, rows_resumen))

    # 2. DESGLOSE DEL EQUIPAMIENTO FÍSICO
    body.append(add_h1("2. DETALLE DE EQUIPOS FÍSICOS (SALA SITUACIONAL)"))
    body.append(add_p("A continuación se detallan los equipos investigados en Mercado Libre Venezuela para la instalación física:"))

    headers_piezas = ["N°", "Equipo / Dispositivo", "Especificación y Función", "Cant.", "Precio Unit.", "Total (USD)"]
    rows_piezas = [
        ["1", "Computador Servidor Dell OptiPlex", "Core i7 8va Gen (6 núcleos / 12 hilos), 32 GB RAM DDR4. Rápido, silencioso y bajo consumo (65W).", "1", "$230.00", "$230.00"],
        ["2", "Discos Sólidos SSD 1TB (Espejo)", "2x SSD 1TB SATA Kingston / Crucial. Graba todo por duplicado: si uno falla, el otro sigue.", "2", "$120.00", "$240.00"],
        ["3", "Router Gateway MikroTik hEX", "MikroTik RB750Gr3 (5 puertos Gigabit). Firewall perimetral y cambio automático de internet.", "1", "$105.00", "$105.00"],
        ["4", "Switch Gigabit 16 Puertos", "Switch Hikvision / TP-Link metálico. Conecta el servidor con operadores, pantallas y cámaras.", "1", "$65.00", "$65.00"],
        ["5", "Bobina Cable UTP Cat6 (305m)", "Bobina 305 metros Cat6 de alta velocidad + caja de 100 conectores RJ45 para la sala.", "1", "$95.00", "$95.00"],
        ["6", "UPS de Respaldo 1.200-1.500 VA", "Protección contra fluctuaciones y apagones (45 a 60 min de luz continua para el servidor).", "1", "$165.00", "$165.00"],
        ["—", "TOTAL EQUIPAMIENTO FÍSICO", "Hardware completo, cableado, red y respaldo eléctrico de la Sala", "—", "—", "$900.00 USD"]
    ]
    body.append(add_table(headers_piezas, rows_piezas))

    body.append(add_callout("NOTA IMPORTANTE: Se eliminaron las bandejas costosas (caddys de $25 c/u) y los discos mecánicos lentos. Los dos SSD se conectan directamente en los puertos SATA internos del Dell OptiPlex, ahorrando $470 USD de inmediato."))

    # 3. FUNCIONAMIENTO SIMPLE EN 4 PASOS
    body.append(add_h1("3. FUNCIONAMIENTO PRÁCTICO EN 4 PASOS"))
    body.append(add_p("El sistema está diseñado para que no haya pérdida de datos ni colisiones, funcionando de la siguiente manera:", bold_prefix="•"))

    body.append(add_p("Los testigos de mesa y dirigentes en los 13 municipios cargan los votos y fotos de actas desde sus teléfonos celulares directamente al servidor en la nube (VPS). La nube nunca se apaga.", bold_prefix="1. En la Calle:"))
    body.append(add_p("El servidor en la nube le envía de inmediato la información a la computadora Dell de la Sala Situacional a través del MikroTik en tiempo real.", bold_prefix="2. Enlace con la Sala:"))
    body.append(add_p("La computadora Dell en la sala graba cada dato en sus dos discos SSD al mismo tiempo. Si un disco sufre una avería, el segundo disco mantiene el sistema funcionando sin perder un solo archivo.", bold_prefix="3. Seguridad de Datos:"))
    body.append(add_p("Si se va la luz en Maturín, el UPS mantiene la sala operando durante 1 hora. Si el corte eléctrico se prolonga, los testigos afuera siguen enviando datos a la nube sin enterarse de que la oficina no tiene luz.", bold_prefix="4. Respaldo en Apagones:"))

    # 4. RECOMENDACIÓN FINAL
    body.append(add_h1("4. RECOMENDACIÓN FINAL Y DECISIÓN"))
    body.append(add_p("Se recomienda formalmente la aprobación del presupuesto físico de $900.00 USD y la contratación del VPS Cloud ($24.50 USD/mes). Esto le da a la Dirección General de MIGATO una plataforma completa, ultra rápida, blindada contra fallas y lista para operar de inmediato."))
    body.append(add_p("Nota de Seguridad: El sistema de cámaras de vigilancia (CCTV) se cotizará por separado más adelante según lo acordado; sin embargo, el switch de 16 puertos y la bobina de 305m Cat6 presupuestados aquí ya dejan instalados los puntos de red para conectarlas sin costo extra de cableado."))

    # FIRMAS
    body.append(add_h1("5. CONFORMIDAD Y FIRMAS"))
    body.append("""
    <w:p><w:pPr><w:spacing w:before="240"/></w:pPr></w:p>
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
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="200" w:after="20"/></w:pPr><w:r><w:t>__________________________________</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/><w:color w:val="0F172A"/></w:rPr><w:t>COMANDO ESTRATÉGICO MIGATO</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr><w:r><w:rPr><w:color w:val="64748B"/><w:sz w:val="17"/></w:rPr><w:t>Dirección de Operaciones • El Gato Briceño</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="200" w:after="20"/></w:pPr><w:r><w:t>__________________________________</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/><w:color w:val="0F172A"/></w:rPr><w:t>ING. DIEGO DONADO</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr><w:r><w:rPr><w:color w:val="64748B"/><w:sz w:val="17"/></w:rPr><w:t>Responsable de Ciencia y Tecnología MIGATO</w:t></w:r></w:p>
        </w:tc>
      </w:tr>
    </w:tbl>
    """)

    document_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    {''.join(body)}
    <w:sectPr>
      <w:headerReference w:type="default" r:id="rIdHeader1"/>
      <w:footerReference w:type="default" r:id="rIdFooter1"/>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>"""

    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as docx:
        docx.writestr('[Content_Types].xml', content_types)
        docx.writestr('_rels/.rels', rels)
        docx.writestr('word/_rels/document.xml.rels', doc_rels)
        docx.writestr('word/document.xml', document_xml)
        docx.writestr('word/styles.xml', styles)
        docx.writestr('word/header1.xml', header1_xml)
        docx.writestr('word/footer1.xml', footer1_xml)
        if has_logo:
            docx.writestr('word/media/logo.png', logo_bytes)

    print(f"[OK] Archivo DOCX generado en: {output_path}")

def build_html(output_path):
    html_content = """<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Informe de Presupuesto • Sala Situacional MIGATO 2026</title>
  <style>
    @page {
      size: letter portrait;
      margin: 18mm 18mm 20mm 18mm;
    }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #0f172a;
      line-height: 1.5;
      font-size: 10pt;
      margin: 0;
      padding: 0;
      background: #ffffff;
    }
    .header-box {
      text-align: center;
      border-bottom: 2.5px solid #0284c7;
      padding-bottom: 10px;
      margin-bottom: 16px;
    }
    .inst-title {
      font-size: 10.5pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin: 0 0 3px 0;
    }
    .inst-sub {
      font-size: 12pt;
      font-weight: 900;
      color: #0284c7;
      margin: 0 0 3px 0;
    }
    .doc-title {
      font-size: 13pt;
      font-weight: 900;
      color: #0f172a;
      margin: 10px 0 0 0;
      line-height: 1.3;
    }
    h1 {
      font-size: 11pt;
      font-weight: 900;
      color: #0f172a;
      border-left: 4px solid #0284c7;
      padding-left: 8px;
      margin: 18px 0 8px 0;
      text-transform: uppercase;
    }
    p {
      margin: 0 0 7px 0;
      text-align: justify;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 9pt;
    }
    th {
      background: #0f172a;
      color: #ffffff;
      font-weight: 800;
      text-align: left;
      padding: 6px 8px;
    }
    td {
      padding: 6px 8px;
      border-bottom: 1px solid #e2e8f0;
    }
    tr:nth-child(even) td {
      background: #f8fafc;
    }
    .total-row td {
      background: #fef3c7 !important;
      font-weight: 900;
      color: #0f172a;
      border-top: 1.5px solid #d97706;
      border-bottom: 2px solid #0f172a;
    }
    .callout {
      background: #f0f9ff;
      border-left: 4px solid #0284c7;
      padding: 10px 14px;
      margin: 12px 0;
      font-size: 9.5pt;
      color: #0369a1;
      border-radius: 0 4px 4px 0;
    }
    .signatures-table {
      width: 100%;
      margin-top: 24px;
      border: none;
    }
    .signatures-table td {
      width: 50%;
      text-align: center;
      border: none;
      background: transparent !important;
      padding-top: 20px;
    }
    .sign-line {
      display: block;
      width: 200px;
      margin: 0 auto 6px auto;
      border-top: 1px solid #0f172a;
    }
  </style>
</head>
<body>

  <div class="header-box">
    <div class="inst-title">República Bolivariana de Venezuela • Estado Monagas</div>
    <div class="inst-sub">MOVIMIENTO INDEPENDIENTE GANAMOS TODOS (MIGATO)</div>
    <div style="font-size: 9.5pt; font-weight: 800; color: #f59e0b;">COMANDO ESTRATÉGICO DE CAMPAÑA • SALA SITUACIONAL EL GATO BRICEÑO</div>
    <div class="doc-title">INFORME DE PRESUPUESTO: INFRAESTRUCTURA DE SERVIDOR LOCAL Y NUBE</div>
  </div>

  <table style="margin-bottom: 14px;">
    <tr><th>Concepto</th><th>Información Oficial</th></tr>
    <tr><td><b>Proyecto</b></td><td>Plataforma Territorial y Sala Situacional MIGATO 2026</td></tr>
    <tr><td><b>Destino</b></td><td>Sede Central de Campaña • Sala Situacional El Gato Briceño (Maturín)</td></tr>
    <tr><td><b>Responsable Técnico</b></td><td>Ing. Diego Donado (Ciencia, Tecnología y Ciberdefensa)</td></tr>
    <tr><td><b>Referencia de Costos</b></td><td>Precios Reales Disponibles en Mercado Libre Venezuela (USD / BCV)</td></tr>
    <tr><td><b>Fecha de Emisión</b></td><td>Septiembre 2026</td></tr>
  </table>

  <h1>1. Resumen Ejecutivo de Inversión</h1>
  <p>Este presupuesto define la inversión exacta y optimizada para dotar de tecnología y autonomía total a la Sala Situacional de Maturín y a los 13 municipios del Estado Monagas. Se descartan servidores industriales costosos e ineficientes de $2,500 USD, adoptando una arquitectura moderna, rápida, silenciosa y protegida contra los apagones de Corpoelec.</p>

  <table>
    <tr><th>Componente del Sistema</th><th>Modalidad</th><th>Autonomía / Cobertura</th><th style="text-align:right;">Inversión (USD)</th></tr>
    <tr>
      <td><b>A. Equipamiento Físico de Sala</b></td>
      <td>Pago Único (Hardware)</td>
      <td>45 a 60 min de respaldo en apagones</td>
      <td style="text-align:right;"><b>$900.00 USD</b></td>
    </tr>
    <tr>
      <td><b>B. Servidor Cloud VPS (Nube)</b></td>
      <td>Suscripción Mensual</td>
      <td>24/7 en línea para los 13 municipios</td>
      <td style="text-align:right;"><b>$24.50 USD / mes</b></td>
    </tr>
    <tr class="total-row">
      <td colspan="3"><b>TOTAL INVERSIÓN INICIAL INTEGRAL (EQUIPOS + 1 AÑO DE SERVIDOR EN NUBE)</b></td>
      <td style="text-align:right;"><b>$1,194.00 USD</b></td>
    </tr>
  </table>

  <h1>2. Detalle de Equipos Físicos (Sala Situacional)</h1>
  <p>A continuación se detallan los equipos investigados en Mercado Libre Venezuela para la instalación física:</p>

  <table>
    <tr>
      <th style="text-align:center;">N°</th>
      <th>Equipo / Dispositivo</th>
      <th>Especificación y Función</th>
      <th style="text-align:center;">Cant.</th>
      <th style="text-align:right;">Precio Unit.</th>
      <th style="text-align:right;">Total (USD)</th>
    </tr>
    <tr>
      <td style="text-align:center;">1</td>
      <td><b>Computador Servidor Dell OptiPlex</b></td>
      <td>Core i7 8va Gen (6 núcleos / 12 hilos), 32 GB RAM DDR4. Rápido, silencioso y bajo consumo (65W).</td>
      <td style="text-align:center;">1</td>
      <td style="text-align:right;">$230.00</td>
      <td style="text-align:right;">$230.00</td>
    </tr>
    <tr>
      <td style="text-align:center;">2</td>
      <td><b>Discos Sólidos SSD 1TB (Espejo)</b></td>
      <td>2x SSD 1TB SATA Kingston / Crucial. Graba todo por duplicado: si uno falla, el otro sigue.</td>
      <td style="text-align:center;">2</td>
      <td style="text-align:right;">$120.00</td>
      <td style="text-align:right;">$240.00</td>
    </tr>
    <tr>
      <td style="text-align:center;">3</td>
      <td><b>Router Gateway MikroTik hEX</b></td>
      <td>MikroTik RB750Gr3 (5 puertos Gigabit). Firewall perimetral y cambio automático de internet.</td>
      <td style="text-align:center;">1</td>
      <td style="text-align:right;">$105.00</td>
      <td style="text-align:right;">$105.00</td>
    </tr>
    <tr>
      <td style="text-align:center;">4</td>
      <td><b>Switch Gigabit 16 Puertos</b></td>
      <td>Switch Hikvision / TP-Link metálico. Conecta el servidor con operadores, pantallas y cámaras.</td>
      <td style="text-align:center;">1</td>
      <td style="text-align:right;">$65.00</td>
      <td style="text-align:right;">$65.00</td>
    </tr>
    <tr>
      <td style="text-align:center;">5</td>
      <td><b>Bobina Cable UTP Cat6 (305m)</b></td>
      <td>Bobina 305 metros Cat6 de alta velocidad + caja de 100 conectores RJ45 para la sala.</td>
      <td style="text-align:center;">1</td>
      <td style="text-align:right;">$95.00</td>
      <td style="text-align:right;">$95.00</td>
    </tr>
    <tr>
      <td style="text-align:center;">6</td>
      <td><b>UPS de Respaldo 1.200-1.500 VA</b></td>
      <td>Protección contra fluctuaciones y apagones (45 a 60 min de luz continua para el servidor).</td>
      <td style="text-align:center;">1</td>
      <td style="text-align:right;">$165.00</td>
      <td style="text-align:right;">$165.00</td>
    </tr>
    <tr class="total-row">
      <td colspan="5"><b>TOTAL EQUIPAMIENTO FÍSICO</b></td>
      <td style="text-align:right;"><b>$900.00 USD</b></td>
    </tr>
  </table>

  <div class="callout">
    <b>Nota de Ahorro:</b> Se eliminaron las bandejas costosas (caddys) y los discos mecánicos lentos. Los dos SSD van conectados internamente en los puertos SATA de fábrica del Dell OptiPlex, ahorrando $470 USD de forma inmediata.
  </div>

  <h1>3. Funcionamiento Práctico en 4 Pasos</h1>
  <p><b>1. En la Calle (13 Municipios):</b> Los testigos de mesa y dirigentes cargan los votos y fotos de actas desde sus teléfonos celulares directamente al servidor en la nube (VPS). La nube nunca se apaga.</p>
  <p><b>2. Enlace con la Sala:</b> El servidor en la nube le envía de inmediato la información a la computadora Dell de la Sala Situacional a través del MikroTik en tiempo real.</p>
  <p><b>3. Seguridad de Datos:</b> La computadora Dell en la sala graba cada dato en sus dos discos SSD al mismo tiempo. Si un disco sufre una avería, el segundo disco mantiene el sistema funcionando sin perder un solo archivo.</p>
  <p><b>4. Respaldo en Apagones:</b> Si se va la luz en Maturín, el UPS mantiene la sala operando durante 1 hora. Si el corte eléctrico se prolonga, los testigos afuera siguen enviando datos a la nube sin enterarse de que la oficina no tiene luz.</p>

  <h1>4. Recomendación Final y Decisión</h1>
  <p>Se recomienda formalmente la aprobación del presupuesto físico de <b>$900.00 USD</b> y la activación del VPS Cloud (<b>$24.50 USD/mes</b>). Esto le da a la Dirección General de MIGATO una plataforma completa, ultra rápida, blindada contra fallas y lista para operar de inmediato.</p>
  <p><i>Nota de Seguridad:</i> El sistema de cámaras de vigilancia (CCTV) se cotizará por separado más adelante según lo acordado; sin embargo, el switch de 16 puertos y la bobina de 305m Cat6 presupuestados aquí ya dejan instalados los puntos de red para conectarlas sin costo extra de cableado.</p>

  <h1>5. Conformidad y Firmas</h1>
  <table class="signatures-table">
    <tr>
      <td>
        <span class="sign-line"></span>
        <b>COMANDO ESTRATÉGICO MIGATO</b><br>
        <span style="font-size: 8.5pt; color: #64748b;">Dirección de Operaciones • El Gato Briceño</span>
      </td>
      <td>
        <span class="sign-line"></span>
        <b>ING. DIEGO DONADO</b><br>
        <span style="font-size: 8.5pt; color: #64748b;">Responsable de Ciencia y Tecnología MIGATO</span>
      </td>
    </tr>
  </table>

</body>
</html>
"""
    output_path.write_text(html_content, encoding="utf-8")
    print(f"[OK] Archivo HTML generado en: {output_path}")

def main():
    docx_path = PROJECT_ROOT / "INFORME_PRESUPUESTO_MIGATO_2026.docx"
    html_path = PROJECT_ROOT / "INFORME_PRESUPUESTO_MIGATO_2026.html"
    pdf_path = PROJECT_ROOT / "INFORME_PRESUPUESTO_MIGATO_2026.pdf"

    build_docx(docx_path)
    build_html(html_path)

    # Convertir a PDF con LibreOffice
    print("[...] Compilando PDF con LibreOffice...")
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
