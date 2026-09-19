#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de Documento Oficial Word (.docx) y PDF:
Presupuesto Técnico de Infraestructura Física, Almacenamiento RAID y Gateway MikroTik
Movimiento Independiente Ganamos Todos (MIGATO) • Comando de El Gato Briceño
Maturín, Estado Monagas, Septiembre 2026
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

    # 2. Package Relationships
    rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"""

    # 3. Document Relationships
    doc_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rIdHeader1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>
  <Relationship Id="rIdFooter1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
  <Relationship Id="rIdHeaderFirst" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header_first.xml"/>
  <Relationship Id="rIdFooterFirst" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer_first.xml"/>
"""
    if has_logo:
        doc_rels += '  <Relationship Id="rIdLogoDoc" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo.png"/>\n'
    doc_rels += "</Relationships>"

    # 4. Header Relationships
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
      <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>
      <w:sz w:val="22"/>
      <w:szCs w:val="22"/>
      <w:color w:val="1E293B"/>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:spacing w:line="300" w:lineRule="auto" w:after="120"/>
      <w:jc w:val="both"/>
    </w:pPrDefault>
  </w:docDefaults>
</w:styles>"""

    # 6. Headers and Footers
    header_first_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p/></w:hdr>"""

    footer_first_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p/></w:ftr>"""

    header1_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
       xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:tbl>
    <w:tblPr>
      <w:tblW w:w="5000" w:type="pct"/>
      <w:tblBorders>
        <w:bottom w:val="single" w:sz="12" w:space="0" w:color="0284C7"/>
        <w:top w:val="none"/><w:left w:val="none"/><w:right w:val="none"/>
        <w:insideH w:val="none"/><w:insideV w:val="none"/>
      </w:tblBorders>
    </w:tblPr>
    <w:tr>
      <w:tc>
        <w:p>
          <w:pPr><w:jc w:val="left"/><w:spacing w:after="60"/></w:pPr>
          <w:r><w:rPr><w:b/><w:sz w:val="16"/><w:color w:val="0284C7"/></w:rPr><w:t>COMANDO ESTRATÉGICO MIGATO 2026 • SALA SITUACIONAL</w:t></w:r>
          <w:r><w:rPr><w:sz w:val="15"/><w:color w:val="64748B"/></w:rPr><w:t> | Dictamen de Hardware y Red</w:t></w:r>
        </w:p>
      </w:tc>
      <w:tc>
        <w:tcPr><w:tcW w:w="1200" w:type="dxa"/></w:tcPr>
        <w:p>
          <w:pPr><w:jc w:val="right"/><w:spacing w:after="60"/></w:pPr>
          <w:r><w:rPr><w:b/><w:sz w:val="15"/><w:color w:val="F59E0B"/></w:rPr><w:t>MONAGAS 2026</w:t></w:r>
        </w:p>
      </w:tc>
    </w:tr>
  </w:tbl>
</w:hdr>"""

    footer1_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:tbl>
    <w:tblPr>
      <w:tblW w:w="5000" w:type="pct"/>
      <w:tblBorders>
        <w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
        <w:bottom w:val="none"/><w:left w:val="none"/><w:right w:val="none"/>
        <w:insideH w:val="none"/><w:insideV w:val="none"/>
      </w:tblBorders>
    </w:tblPr>
    <w:tr>
      <w:tc>
        <w:p>
          <w:pPr><w:jc w:val="left"/><w:spacing w:before="60"/></w:pPr>
          <w:r><w:rPr><w:sz w:val="15"/><w:color w:val="94A3B8"/></w:rPr><w:t>MIGATO • Documento Técnico de Arquitectura Física y Presupuesto</w:t></w:r>
        </w:p>
      </w:tc>
      <w:tc>
        <w:tcPr><w:tcW w:w="1200" w:type="dxa"/></w:tcPr>
        <w:p>
          <w:pPr><w:jc w:val="right"/><w:spacing w:before="60"/></w:pPr>
          <w:r><w:rPr><w:b/><w:sz w:val="15"/><w:color w:val="64748B"/></w:rPr><w:t>Página </w:t></w:r>
          <w:fldSimple w:instr="PAGE"/>
        </w:p>
      </w:tc>
    </w:tr>
  </w:tbl>
</w:ftr>"""

    # Helper functions for WordML
    def add_p(text, bold_prefix="", color="1E293B", sz="22", after="120", jc="both"):
        bp = f'<w:r><w:rPr><w:b/><w:sz w:val="{sz}"/><w:color w:val="{color}"/></w:rPr><w:t>{escape(bold_prefix)} </w:t></w:r>' if bold_prefix else ''
        return f'<w:p><w:pPr><w:jc w:val="{jc}"/><w:spacing w:after="{after}" w:line="300" w:lineRule="auto"/></w:pPr>{bp}<w:r><w:rPr><w:sz w:val="{sz}"/><w:color w:val="{color}"/></w:rPr><w:t>{escape(text)}</w:t></w:r></w:p>'

    def add_h1(text):
        return f'<w:p><w:pPr><w:spacing w:before="260" w:after="100"/><w:jc w:val="left"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="0F172A"/></w:rPr><w:t>{escape(text)}</w:t></w:r></w:p>'

    def add_h2(text):
        return f'<w:p><w:pPr><w:spacing w:before="180" w:after="80"/><w:jc w:val="left"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="0284C7"/></w:rPr><w:t>{escape(text)}</w:t></w:r></w:p>'

    def add_callout(text, title="NOTA TÉCNICA ESTRATÉGICA"):
        return f"""
        <w:tbl>
          <w:tblPr>
            <w:tblW w:w="5000" w:type="pct"/>
            <w:tblBorders>
              <w:left w:val="single" w:sz="36" w:space="0" w:color="0284C7"/>
              <w:top w:val="none"/><w:right w:val="none"/><w:bottom w:val="none"/>
              <w:insideH w:val="none"/><w:insideV w:val="none"/>
            </w:tblBorders>
            <w:tblCellMar><w:top w:w="120" w:type="dxa"/><w:left w:w="160" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:right w:w="160" w:type="dxa"/></w:tblCellMar>
          </w:tblPr>
          <w:tr>
            <w:tc>
              <w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="F0F9FF"/></w:tcPr>
              <w:p><w:pPr><w:spacing w:after="40"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="18"/><w:color w:val="0369A1"/></w:rPr><w:t>{escape(title)}</w:t></w:r></w:p>
              <w:p><w:pPr><w:spacing w:after="40"/></w:pPr><w:r><w:rPr><w:sz w:val="19"/><w:color w:val="0F172A"/></w:rPr><w:t>{escape(text)}</w:t></w:r></w:p>
            </w:tc>
          </w:tr>
        </w:tbl>
        <w:p><w:pPr><w:spacing w:after="80"/></w:pPr></w:p>
        """

    def add_table(headers, rows):
        t = ['<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/>']
        t.append('<w:tblBorders>')
        t.append('<w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>')
        t.append('<w:bottom w:val="single" w:sz="12" w:space="0" w:color="0F172A"/>')
        t.append('<w:left w:val="none"/><w:right w:val="none"/>')
        t.append('<w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>')
        t.append('<w:insideV w:val="none"/>')
        t.append('</w:tblBorders>')
        t.append('<w:tblCellMar><w:top w:w="100" w:type="dxa"/><w:left w:w="140" w:type="dxa"/><w:bottom w:w="100" w:type="dxa"/><w:right w:w="140" w:type="dxa"/></w:tblCellMar>')
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
        t.append('</w:tbl><w:p><w:pPr><w:spacing w:after="100"/></w:pPr></w:p>')
        return ''.join(t)

    # Document Body
    body = []

    # Portada / Cabecera Oficial
    body.append("""
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:before="120" w:after="40"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="0F172A"/></w:rPr><w:t>REPÚBLICA BOLIVARIANA DE VENEZUELA • ESTADO MONAGAS</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="40"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="0284C7"/></w:rPr><w:t>MOVIMIENTO INDEPENDIENTE GANAMOS TODOS (MIGATO)</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="160"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="20"/><w:color w:val="F59E0B"/></w:rPr><w:t>COMANDO ESTRATÉGICO DE CAMPAÑA • SALA SITUACIONAL EL GATO BRICEÑO</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:before="100" w:after="200"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="30"/><w:color w:val="0F172A"/></w:rPr><w:t>DICTAMEN TÉCNICO Y PRESUPUESTO FORMAL: INFRAESTRUCTURA DE SERVIDOR FÍSICO, ALMACENAMIENTO RAID Y GATEWAY MIKROTIK</w:t></w:r>
    </w:p>
    """)

    # Datos Generales
    meta_headers = ["Campo Institucional", "Detalle Oficial"]
    meta_rows = [
        ["Proyecto Tecnológico", "Plataforma Territorial y Sala Situacional de Mando MIGATO 2026"],
        ["Ámbito de Aplicación", "Estado Monagas (Maturín y 13 Municipios)"],
        ["Responsable Técnico", "Ing. Diego Donado • División de Ciencia, Tecnología y Ciberdefensa"],
        ["Destino del Equipamiento", "Sede Central de Campaña y Sala Situacional de El Gato Briceño"],
        ["Fuente de Cotizaciones", "Precios Referenciales del Mercado Nacional • Mercado Libre Venezuela"],
        ["Fecha de Emisión", "Septiembre 2026"]
    ]
    body.append(add_table(meta_headers, meta_rows))

    # CAPÍTULO I
    body.append(add_h1("CAPÍTULO I: JUSTIFICACIÓN DE LA ARQUITECTURA DE HARDWARE"))
    body.append(add_p("Para dar soporte físico autónomo a los cinco (5) módulos del sistema (Lámina 120\", Comandos, Estimación del Voto, Earth Monagas 3D GIS y Dashboard de Campaña), se selecciona una arquitectura de alta eficiencia energética y excelente relación costo-rendimiento basada en una estación de trabajo corporativa Dell OptiPlex con procesador Intel Core i7 de 8va Generación y 32 GB de memoria RAM DDR4."))

    body.append(add_h2("1.1. Ventajas de la Plataforma Dell OptiPlex Core i7 (8va Generación)"))
    body.append(add_p("• Alto Desempeño por Núcleo (IPC): El procesador Intel Core i7-8700 (6 núcleos / 12 hilos a 4.6 GHz) supera ampliamente a procesadores Xeon de generaciones anteriores en el procesamiento de consultas web y motor geoespacial PostgreSQL/PostGIS."))
    body.append(add_p("• Eficiencia Energética (Bajo Consumo de 65W): Consume una fracción de la energía de un servidor de rack antiguo (que consumen entre 300W y 500W). Esto permite que el sistema de respaldo eléctrico (UPS) rinda más del doble de tiempo de autonomía ante los apagones de Corpoelec."))
    body.append(add_p("• Operación Silenciosa y Compacta: No requiere salas de servidores con aire acondicionado industrial ni muebles pesados de rack."))

    body.append(add_h2("1.2. Arquitectura de Discos 100% Estado Sólido en RAID 1 (Espejo)"))
    body.append(add_p("Se descarta el uso de discos duros mecánicos (HDD) tradicionales debido a su lentitud, fragilidad y peso. Toda la base de datos de Monagas, polígonos cartográficos y fotos de actas electorales ocupan menos de 30 GB, por lo que un sistema con discos mecánicos representaría un gasto innecesario."))
    body.append(add_p("• Banco de Estado Sólido Dual (2x SSD 1TB SATA en RAID 1): Ambos discos operan de forma sincronizada y simultánea."))
    body.append(add_p("• Escritura Simultánea en Espejo: Cada vez que se registra un voto, un dirigente o un acta, la información se escribe al mismo microsegundo en ambos discos."))
    body.append(add_p("• Lectura Acelerada: El sistema lee de ambas unidades en paralelo, duplicando la velocidad de respuesta."))
    body.append(add_p("• Tolerancia a Fallas Absoluta: Si uno de los discos SSD llegase a fallar o quemarse, el segundo disco mantiene el servidor 100% operativo sin pérdida de datos ni caída del servicio. Al colocar un disco nuevo, el sistema se reconstruye automáticamente en segundo plano."))

    # CAPÍTULO II
    body.append(add_h1("CAPÍTULO II: TOPOLOGÍA DE RED, MIKROTIK Y SWITCH GIGABIT"))
    body.append(add_p("La infraestructura de red de la Sala Situacional se estructura en dos niveles fundamentales:"))
    body.append(add_p("Internet Proveedor 1 / Proveedor 2 ──► MikroTik hEX RB750Gr3 (Gateway/Firewall) ──► Switch Gigabit (Distribuidor) ──► Servidor Dell + PCs de Sala + Pantallas + Videovigilancia.", bold_prefix="• FLUJO DE RED:"))

    body.append(add_p("Actúa como la puerta de enlace física y cortafuegos perimetral. Realiza conmutación automática de internet (Failover) entre dos proveedores para que la sala nunca se quede sin conexión, y provee túnel VPN seguro (WireGuard) para acceso remoto.", bold_prefix="• 1. Router Gateway MikroTik hEX:"))
    body.append(add_p("El MikroTik posee 5 puertos, por lo que se requiere un switch Gigabit (marca Hikvision o TP-Link) de 16 puertos conectado directamente a él para multiplicar las bocas de red y enlazar el servidor, las computadoras de los operadores, las pantallas de sala y futuras cámaras de seguridad.", bold_prefix="• 2. Switch Gigabit de Sala (Hikvision / TP-Link):"))
    body.append(add_p("Se incorpora una bobina completa de 305 metros de cable UTP Cat6 para realizar el cableado estructurado formal de la sala, oficinas del comando y las conexiones a los equipos de cómputo y cámaras.", bold_prefix="• 3. Bobina de Cableado Cat6 (305 metros):"))

    # CAPÍTULO III
    body.append(add_h1("CAPÍTULO III: DESGLOSE DE COSTOS EN MERCADO LIBRE VENEZUELA"))
    body.append(add_p("A continuación se detallan los costos individuales de cada componente físico investigados en el mercado venezolano (expresados en dólares estadounidenses USD, pagaderos a la tasa oficial BCV):"))

    headers_piezas = ["Componente / Dispositivo", "Especificación Técnica Real", "Cant.", "Costo Unit. (USD)", "Total (USD)"]
    rows_piezas = [
        ["Computador Servidor Dell OptiPlex", "Core i7 8va Gen (i7-8700 6C/12T), 32GB RAM DDR4, Chasis Torre/SFF silencioso", "1", "$230.00", "$230.00"],
        ["Discos Sólidos SSD 1TB (RAID 1)", "2x SSD 1TB SATA 2.5\" Kingston KC600 / Crucial MX500 en Espejo (Sistema & Datos)", "2", "$120.00", "$240.00"],
        ["Gateway MikroTik RouterBOARD", "MikroTik hEX RB750Gr3 (Dual Core 880MHz, 256MB RAM, 5 Puertos Gigabit, RouterOS)", "1", "$105.00", "$105.00"],
        ["Switch de Distribución de Red", "Switch Hikvision / TP-Link 16 Puertos Gigabit 10/100/1000 Mbps metálico", "1", "$65.00", "$65.00"],
        ["Bobina Cable UTP Cat6 (305m)", "Bobina 305 metros Cat6 interior de alta velocidad + caja de 100 conectores RJ45", "1", "$95.00", "$95.00"],
        ["UPS de Respaldo Eléctrico", "UPS 1.200 VA a 1.500 VA con supresor de picos (45 a 60 min autonomía con bajo consumo)", "1", "$165.00", "$165.00"],
        ["TOTAL GENERAL DE INVERSIÓN FÍSICA", "Equipamiento completo optimizado de servidor, almacenamiento RAID, red y protección", "—", "—", "$900.00 USD"]
    ]
    body.append(add_table(headers_piezas, rows_piezas))

    # CAPÍTULO IV
    body.append(add_h1("CAPÍTULO IV: RESUMEN DE OPCIONES PARA DECISIÓN DEL COMANDO"))
    body.append(add_p("Para otorgar claridad técnico-económica a la Dirección General de MIGATO, se contrastan las alternativas evaluadas:"))

    headers_opciones = ["Opción Presupuestaria", "Alcance y Componentes", "Autonomía Eléctrica", "Inversión Total (USD)"]
    rows_opciones = [
        ["Opción 1: Recomendada ★", "Dell OptiPlex Core i7 (8va Gen 6C/12T), 32GB RAM + 2x SSD 1TB RAID 1 + MikroTik hEX + Switch 16p + Cat6 305m + UPS 1.500VA", "45 a 60 minutos (Bajo consumo 65W)", "$900.00 USD"],
        ["Opción 2: Entrada Básica", "Dell OptiPlex Core i5/i7 + 16GB RAM + 1x SSD 1TB (sin espejo) + Router estándar + Switch 8p + UPS 800VA", "30 a 40 minutos", "$520.00 USD"],
        ["Opción 3: Servidor Tradicional (Descartada)", "Servidor Dell PowerEdge antiguo (Doble Xeon 350W) + Discos Mecánicos SAS + Caddys + UPS 2.000VA", "20 a 30 minutos (Agotamiento rápido UPS)", "$2,480.00 USD"]
    ]
    body.append(add_table(headers_opciones, rows_opciones))

    body.append(add_callout("DICTAMEN TÉCNICO: Se recomienda formalmente la APROBACIÓN DE LA OPCIÓN 1: ARQUITECTURA OPTIMIZADA ($900.00 USD). Proporciona la solución más rápida (100% SSD), tolerante a fallas (RAID 1), con conmutación de internet MikroTik, cableado estructurado completo de sala y máxima eficiencia energética (45 a 60 min de autonomía eléctrica ante apagones)."))

    # CAPÍTULO V: FIRMAS
    body.append(add_h1("CAPÍTULO V: CONFORMIDAD Y FIRMAS AUTORIZADAS"))
    body.append(add_p("El presente dictamen técnico se emite en la ciudad de Maturín, Estado Monagas, a los efectos de su evaluación y aprobación formal por parte del Comando Estratégico:"))

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
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="260" w:after="20"/></w:pPr><w:r><w:t>__________________________________</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/><w:color w:val="0F172A"/></w:rPr><w:t>COMANDO ESTRATÉGICO MIGATO</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr><w:r><w:rPr><w:color w:val="64748B"/><w:sz w:val="17"/></w:rPr><w:t>Dirección de Operaciones • El Gato Briceño</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="260" w:after="20"/></w:pPr><w:r><w:t>__________________________________</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/><w:color w:val="0F172A"/></w:rPr><w:t>ING. DIEGO DONADO</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr><w:r><w:rPr><w:color w:val="64748B"/><w:sz w:val="17"/></w:rPr><w:t>Responsable de Ciencia y Tecnología MIGATO</w:t></w:r></w:p>
        </w:tc>
      </w:tr>
    </w:tbl>
    """)

    # Ensamblar Documento
    document_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    {''.join(body)}
    <w:sectPr>
      <w:headerReference w:type="first" r:id="rIdHeaderFirst"/>
      <w:headerReference w:type="default" r:id="rIdHeader1"/>
      <w:footerReference w:type="first" r:id="rIdFooterFirst"/>
      <w:footerReference w:type="default" r:id="rIdFooter1"/>
      <w:titlePg/>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>"""

    # Escribir el archivo .docx (ZIP contenedor)
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as docx:
        docx.writestr('[Content_Types].xml', content_types)
        docx.writestr('_rels/.rels', rels)
        docx.writestr('word/_rels/document.xml.rels', doc_rels)
        docx.writestr('word/document.xml', document_xml)
        docx.writestr('word/styles.xml', styles)
        docx.writestr('word/header1.xml', header1_xml)
        docx.writestr('word/header_first.xml', header_first_xml)
        docx.writestr('word/footer1.xml', footer1_xml)
        docx.writestr('word/footer_first.xml', footer_first_xml)
        if has_logo:
            docx.writestr('word/media/logo.png', logo_bytes)
            docx.writestr('word/_rels/header1.xml.rels', header_rels)

    print(f"[OK] Archivo DOCX generado exitosamente en: {output_path}")

def build_html(output_path):
    html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Dictamen Técnico y Presupuesto de Servidor Físico • MIGATO 2026</title>
  <style>
    @page {{
      size: letter portrait;
      margin: 18mm 18mm 20mm 18mm;
    }}
    body {{
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #0f172a;
      line-height: 1.5;
      font-size: 10.5pt;
      margin: 0;
      padding: 0;
      background: #ffffff;
    }}
    .header-box {{
      text-align: center;
      border-bottom: 2.5px solid #0284c7;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }}
    .inst-title {{
      font-size: 11pt;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin: 0 0 4px 0;
    }}
    .inst-sub {{
      font-size: 13pt;
      font-weight: 900;
      color: #0284c7;
      margin: 0 0 4px 0;
    }}
    .doc-title {{
      font-size: 14pt;
      font-weight: 900;
      color: #0f172a;
      margin: 14px 0 0 0;
      line-height: 1.3;
    }}
    h1 {{
      font-size: 12pt;
      font-weight: 900;
      color: #0f172a;
      border-left: 4px solid #0284c7;
      padding-left: 8px;
      margin: 22px 0 10px 0;
      text-transform: uppercase;
    }}
    h2 {{
      font-size: 11pt;
      font-weight: 800;
      color: #0284c7;
      margin: 14px 0 6px 0;
    }}
    p {{
      margin: 0 0 8px 0;
      text-align: justify;
    }}
    table {{
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 9.5pt;
    }}
    th {{
      background: #0f172a;
      color: #ffffff;
      font-weight: 800;
      text-align: left;
      padding: 6px 8px;
      border: 1px solid #0f172a;
    }}
    td {{
      padding: 5px 8px;
      border-bottom: 1px solid #e2e8f0;
      color: #1e293b;
    }}
    tr:nth-child(even) td {{
      background: #f8fafc;
    }}
    .total-row td {{
      background: #fef3c7 !important;
      font-weight: 900;
      color: #0f172a;
      border-top: 1.5px solid #d97706;
      border-bottom: 1.5px solid #d97706;
    }}
    .callout {{
      background: #f0f9ff;
      border-left: 4px solid #0284c7;
      padding: 10px 12px;
      border-radius: 4px;
      margin: 14px 0;
      font-size: 9.5pt;
    }}
    .callout-title {{
      font-weight: 900;
      color: #0369a1;
      text-transform: uppercase;
      margin-bottom: 4px;
      display: block;
    }}
    .signatures-table {{
      margin-top: 40px;
      width: 100%;
      border: none;
    }}
    .signatures-table td {{
      border: none;
      text-align: center;
      background: transparent !important;
      padding: 0 20px;
    }}
    .sign-line {{
      border-top: 1.5px solid #475569;
      display: block;
      width: 80%;
      margin: 0 auto 8px auto;
    }}
  </style>
</head>
<body>

  <div class="header-box">
    <div class="inst-title">República Bolivariana de Venezuela • Estado Monagas</div>
    <div class="inst-sub">MOVIMIENTO INDEPENDIENTE GANAMOS TODOS (MIGATO)</div>
    <div style="font-size: 10pt; font-weight: 800; color: #f59e0b;">COMANDO ESTRATÉGICO DE CAMPAÑA • SALA SITUACIONAL EL GATO BRICEÑO</div>
    <div class="doc-title">DICTAMEN TÉCNICO Y PRESUPUESTO FORMAL: INFRAESTRUCTURA DE SERVIDOR FÍSICO, ALMACENAMIENTO RAID 1 Y GATEWAY MIKROTIK</div>
  </div>

  <table style="margin-bottom: 16px;">
    <tr><th>Campo Institucional</th><th>Detalle Oficial</th></tr>
    <tr><td><b>Proyecto Tecnológico</b></td><td>Plataforma Territorial y Sala Situacional de Mando MIGATO 2026</td></tr>
    <tr><td><b>Ámbito de Aplicación</b></td><td>Estado Monagas (Maturín y 13 Municipios)</td></tr>
    <tr><td><b>Responsable Técnico</b></td><td>Ing. Diego Donado • División de Ciencia, Tecnología y Ciberdefensa</td></tr>
    <tr><td><b>Destino del Equipamiento</b></td><td>Sede Central de Campaña y Sala Situacional de El Gato Briceño</td></tr>
    <tr><td><b>Fuente de Cotizaciones</b></td><td>Precios Referenciales del Mercado Nacional • Mercado Libre Venezuela</td></tr>
    <tr><td><b>Fecha de Emisión</b></td><td>Septiembre 2026</td></tr>
  </table>

  <h1>Capítulo I: Justificación de la Arquitectura de Hardware y Almacenamiento</h1>
  <p>Para operar de forma autónoma, rápida y segura los módulos cartográficos y electorales de la plataforma MIGATO (Lámina 120", Comandos, Estimación del Voto, Earth Monagas 3D GIS y Dashboard), se ha diseñado una arquitectura adaptada a las condiciones eléctricas y operativas de Maturín, sustituyendo los servidores antiguos de alto consumo por una estación compacta de alto desempeño.</p>

  <h2>1.1. Ventajas de la Plataforma Dell OptiPlex Core i7 (8va Generación)</h2>
  <p>• <b>Alto Desempeño por Núcleo (IPC):</b> El procesador Intel Core i7-8700 (6 núcleos / 12 hilos hasta 4.6 GHz) supera a procesadores Xeon de generaciones previas en el procesamiento de transacciones web y operaciones geoespaciales PostgreSQL/PostGIS.</p>
  <p>• <b>Eficiencia Energética (Consumo de sólo 65W):</b> Consume una fracción de la energía de un servidor de rack convencional (300W a 500W). Esto permite que el sistema de respaldo eléctrico (UPS) rinda más del doble de autonomía (45 a 60 minutos continuos) frente a los cortes de Corpoelec.</p>
  <p>• <b>Operación Silenciosa y Compacta:</b> No genera el ruido ensordecedor de un servidor industrial ni requiere climatización forzada de centro de datos.</p>

  <h2>1.2. Arquitectura de Discos 100% Estado Sólido en RAID 1 (Espejo)</h2>
  <p>Se descarta el uso de discos mecánicos (HDD) tradicionales debido a su lentitud, fragilidad y peso. Toda la base de datos de Monagas, polígonos cartográficos y fotos de actas electorales ocupan menos de 30 GB, por lo que 1 TB SSD ofrece más de 950 GB de espacio libre excedente.</p>
  <p>• <b>Banco de Estado Sólido Dual (2x SSD 1TB SATA en RAID 1):</b> Ambos discos operan de forma sincronizada y simultánea a nivel de bloque.</p>
  <p>• <b>Escritura Simultánea en Espejo:</b> Cada vez que se registra un voto, un dirigente o un acta escaneada, la información se escribe al mismo microsegundo en ambos discos.</p>
  <p>• <b>Lectura Acelerada:</b> El sistema lee de ambas unidades en paralelo, duplicando la velocidad de respuesta.</p>
  <p>• <b>Tolerancia a Fallas Absoluta:</b> Si uno de los discos SSD llegase a fallar o quemarse, el segundo disco mantiene el servidor 100% operativo sin caída de servicio ni pérdida de información. No se requieren caddys hot-plug propietarios costosos, ya que se montan en bahías estándar internas.</p>

  <h1>Capítulo II: Topología de Red, MikroTik y Switch Gigabit</h1>
  <p>La infraestructura de red de la Sala Situacional se estructura en dos niveles fundamentales:</p>
  <p>• <b>FLUJO DE RED:</b> Internet Proveedor 1 / Proveedor 2 ──► MikroTik hEX RB750Gr3 (Gateway/Firewall) ──► Switch Gigabit (Distribuidor) ──► Servidor Dell + PCs de Sala + Pantallas + Videovigilancia.</p>
  <p>• <b>1. Router Gateway MikroTik hEX:</b> Actúa como la puerta de enlace física y cortafuegos perimetral blindado. Realiza conmutación automática de internet (Failover) entre dos proveedores para que la sala nunca se quede sin conexión, y provee túnel VPN seguro (WireGuard) para acceso remoto.</p>
  <p>• <b>2. Switch Gigabit de Sala (Hikvision / TP-Link):</b> Conectado directamente a la salida LAN del MikroTik para multiplicar las bocas de red a 16 puertos Gigabit metálicos, enlazando el servidor, las computadoras de los operadores, las pantallas de sala y futuras cámaras de seguridad.</p>
  <p>• <b>3. Bobina de Cableado Cat6 (305 metros):</b> Se incorpora una bobina completa de 305 metros de cable UTP Cat6 junto con conectores RJ45 para realizar el cableado estructurado formal de la sala, oficinas del comando y las conexiones a los equipos de cómputo y cámaras.</p>

  <h1>Capítulo III: Desglose de Costos en Mercado Libre Venezuela</h1>
  <p>A continuación se detallan los costos individuales de cada componente físico investigados en el mercado venezolano (expresados en dólares estadounidenses USD, pagaderos a la tasa oficial BCV):</p>

  <table>
    <tr>
      <th>Componente / Dispositivo</th>
      <th>Especificación Técnica Real</th>
      <th style="text-align:center;">Cant.</th>
      <th style="text-align:right;">Costo Unit.</th>
      <th style="text-align:right;">Total (USD)</th>
    </tr>
    <tr>
      <td><b>Computador Servidor Dell OptiPlex</b></td>
      <td>Core i7 8va Gen (i7-8700 6C/12T), 32GB RAM DDR4, Chasis Torre/SFF silencioso</td>
      <td style="text-align:center;">1</td>
      <td style="text-align:right;">$230.00</td>
      <td style="text-align:right;">$230.00</td>
    </tr>
    <tr>
      <td><b>Discos Sólidos SSD 1TB (RAID 1)</b></td>
      <td>2x SSD 1TB SATA 2.5" Kingston KC600 / Crucial MX500 en Espejo (Sistema & Datos)</td>
      <td style="text-align:center;">2</td>
      <td style="text-align:right;">$120.00</td>
      <td style="text-align:right;">$240.00</td>
    </tr>
    <tr>
      <td><b>Gateway MikroTik RouterBOARD</b></td>
      <td>MikroTik hEX RB750Gr3 (Dual Core 880MHz, 256MB RAM, 5 Puertos Gigabit, RouterOS)</td>
      <td style="text-align:center;">1</td>
      <td style="text-align:right;">$105.00</td>
      <td style="text-align:right;">$105.00</td>
    </tr>
    <tr>
      <td><b>Switch de Distribución de Red</b></td>
      <td>Switch Hikvision / TP-Link 16 Puertos Gigabit 10/100/1000 Mbps metálico</td>
      <td style="text-align:center;">1</td>
      <td style="text-align:right;">$65.00</td>
      <td style="text-align:right;">$65.00</td>
    </tr>
    <tr>
      <td><b>Bobina Cable UTP Cat6 (305m)</b></td>
      <td>Bobina 305 metros Cat6 interior de alta velocidad + caja de 100 conectores RJ45</td>
      <td style="text-align:center;">1</td>
      <td style="text-align:right;">$95.00</td>
      <td style="text-align:right;">$95.00</td>
    </tr>
    <tr>
      <td><b>UPS de Respaldo Eléctrico</b></td>
      <td>UPS 1.200 VA a 1.500 VA con supresor de picos (45 a 60 min autonomía con bajo consumo)</td>
      <td style="text-align:center;">1</td>
      <td style="text-align:right;">$165.00</td>
      <td style="text-align:right;">$165.00</td>
    </tr>
    <tr class="total-row">
      <td colspan="4"><b>TOTAL GENERAL DE INVERSIÓN FÍSICA (EQUIPAMIENTO COMPLETO)</b></td>
      <td style="text-align:right;"><b>$900.00 USD</b></td>
    </tr>
  </table>

  <h1>Capítulo IV: Resumen de Opciones para Decisión del Comando</h1>
  <table>
    <tr><th>Opción Presupuestaria</th><th>Alcance y Componentes</th><th>Autonomía Eléctrica</th><th style="text-align:right;">Inversión Total</th></tr>
    <tr style="background:#fef3c7;">
      <td><b>Opción 1: Recomendada ★</b></td>
      <td>Dell OptiPlex Core i7 (8va Gen 6C/12T), 32GB RAM + 2x SSD 1TB RAID 1 + MikroTik hEX + Switch 16p + Cat6 305m + UPS 1.500VA</td>
      <td>45 a 60 minutos (Bajo consumo 65W)</td>
      <td style="text-align:right; color:#b45309;"><b>$900.00 USD</b></td>
    </tr>
    <tr>
      <td><b>Opción 2: Entrada Básica</b></td>
      <td>Dell OptiPlex Core i5/i7 + 16GB RAM + 1x SSD 1TB (sin espejo) + Router estándar + Switch 8p + UPS 800VA</td>
      <td>30 a 40 minutos</td>
      <td style="text-align:right;"><b>$520.00 USD</b></td>
    </tr>
    <tr>
      <td><b>Opción 3: Servidor Tradicional (Descartada)</b></td>
      <td>Servidor Dell PowerEdge antiguo (Doble Xeon 350W) + Discos Mecánicos SAS + Caddys + UPS 2.000VA</td>
      <td>20 a 30 minutos (Agotamiento rápido UPS)</td>
      <td style="text-align:right;"><b>$2,480.00 USD</b></td>
    </tr>
  </table>

  <div class="callout">
    <span class="callout-title">Dictamen Técnico y Recomendación:</span>
    Se recomienda formalmente la <b>APROBACIÓN DE LA OPCIÓN 1: ARQUITECTURA OPTIMIZADA ($900.00 USD)</b>. Proporciona la solución más rápida (100% SSD), tolerante a fallas (RAID 1), con conmutación de internet MikroTik, cableado estructurado completo de sala y máxima eficiencia energética (45 a 60 min de autonomía eléctrica ante apagones).
  </div>

  <h1>Capítulo V: Conformidad y Firmas Autorizadas</h1>
  <p>El presente dictamen técnico se emite en la ciudad de Maturín, Estado Monagas, a los efectos de su evaluación y aprobación formal por parte del Comando Estratégico:</p>

  <table class="signatures-table">
    <tr>
      <td>
        <div style="height: 50px;"></div>
        <span class="sign-line"></span>
        <b>COMANDO ESTRATÉGICO MIGATO</b><br>
        <span style="font-size: 9pt; color: #64748b;">Dirección de Operaciones • El Gato Briceño</span>
      </td>
      <td>
        <div style="height: 50px;"></div>
        <span class="sign-line"></span>
        <b>ING. DIEGO DONADO</b><br>
        <span style="font-size: 9pt; color: #64748b;">Responsable de Ciencia y Tecnología MIGATO</span>
      </td>
    </tr>
  </table>

</body>
</html>
"""
    output_path.write_text(html_content, encoding="utf-8")
    print(f"[OK] Archivo HTML generado exitosamente en: {output_path}")

def main():
    docx_path = PROJECT_ROOT / "PRESUPUESTO_SERVIDOR_FISICO_MIGATO_2026.docx"
    html_path = PROJECT_ROOT / "PRESUPUESTO_SERVIDOR_FISICO_MIGATO_2026.html"
    pdf_path = PROJECT_ROOT / "PRESUPUESTO_SERVIDOR_FISICO_MIGATO_2026.pdf"

    build_docx(docx_path)
    build_html(html_path)

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
