#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de Informe Técnico-Estratégico V3 en Formato Académico / Tesis Universitaria (Estándar Dutila / UPEL)
Movimiento Independiente Ganamos Todos (MIGATO)
Estado Monagas, Septiembre 2026
"""

import os
import sys
import json
import zipfile
import html
from pathlib import Path

PROJECT_ROOT = Path("/home/diego/Documents/antigravity/zealous-mendel")
LOGO_PATH = PROJECT_ROOT / "assets" / "logo-migato.png"

def escape(text):
    return html.escape(str(text))

def build_thesis_docx_v3(filename):
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
    doc_rels += "</Relationships>"

    styles = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>
        <w:sz w:val="24"/>
        <w:szCs w:val="24"/>
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
      <w:spacing w:before="180" w:after="60"/>
      <w:jc w:val="left"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>
      <w:b/>
      <w:color w:val="0369A1"/>
      <w:sz w:val="24"/>
    </w:rPr>
  </w:style>
</w:styles>"""

    # CABECERA PORTADA (VACÍA PARA PORTADA LIMPIA)
    header_first = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p/></w:hdr>"""

    # PIE DE PÁGINA PORTADA (VACÍO PARA PORTADA LIMPIA)
    footer_first = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p/></w:ftr>"""

    # CABECERA INTERIOR FORMAL CON LÍNEA AZUL
    header1 = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:tbl>
    <w:tblPr>
      <w:tblW w:w="5000" w:type="pct"/>
      <w:tblBorders>
        <w:top w:val="none"/>
        <w:left w:val="none"/>
        <w:bottom w:val="single" w:sz="8" w:space="6" w:color="0284C7"/>
        <w:right w:val="none"/>
        <w:insideH w:val="none"/>
        <w:insideV w:val="none"/>
      </w:tblBorders>
    </w:tblPr>
    <w:tr>
      <w:tc>
        <w:tcPr><w:tcW w:w="2800" w:type="pct"/></w:tcPr>
        <w:p>
          <w:pPr><w:jc w:val="left"/><w:spacing w:after="40"/></w:pPr>
          <w:r>
            <w:rPr><w:rFonts w:ascii="Arial"/><w:sz w:val="17"/><w:color w:val="0284C7"/><w:b/></w:rPr>
            <w:t>REPÚBLICA BOLIVARIANA DE VENEZUELA • ESTADO MONAGAS</w:t>
          </w:r>
        </w:p>
      </w:tc>
      <w:tc>
        <w:tcPr><w:tcW w:w="2200" w:type="pct"/></w:tcPr>
        <w:p>
          <w:pPr><w:jc w:val="right"/><w:spacing w:after="40"/></w:pPr>
          <w:r>
            <w:rPr><w:rFonts w:ascii="Arial"/><w:sz w:val="17"/><w:color w:val="0F172A"/><w:b/></w:rPr>
            <w:t>MOVIMIENTO INDEPENDIENTE GANAMOS TODOS (MIGATO)</w:t>
          </w:r>
        </w:p>
      </w:tc>
    </w:tr>
  </w:tbl>
</w:hdr>"""

    # PIE DE PÁGINA INTERIOR ACADÉMICO / TESIS (CON NÚMERO DINÁMICO "Página X de Y")
    footer1 = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:tbl>
    <w:tblPr>
      <w:tblW w:w="5000" w:type="pct"/>
      <w:tblBorders>
        <w:top w:val="single" w:sz="6" w:space="6" w:color="CBD5E1"/>
        <w:left w:val="none"/>
        <w:bottom w:val="none"/>
        <w:right w:val="none"/>
        <w:insideH w:val="none"/>
        <w:insideV w:val="none"/>
      </w:tblBorders>
    </w:tblPr>
    <w:tr>
      <w:tc>
        <w:tcPr><w:tcW w:w="3400" w:type="pct"/></w:tcPr>
        <w:p>
          <w:pPr><w:jc w:val="left"/><w:spacing w:before="60"/></w:pPr>
          <w:r>
            <w:rPr><w:rFonts w:ascii="Arial"/><w:sz w:val="17"/><w:color w:val="64748B"/><w:i/></w:rPr>
            <w:t>Informe Técnico y Propuesta de Factibilidad • Arquitectura MIGATO</w:t>
          </w:r>
        </w:p>
      </w:tc>
      <w:tc>
        <w:tcPr><w:tcW w:w="1600" w:type="pct"/></w:tcPr>
        <w:p>
          <w:pPr><w:jc w:val="right"/><w:spacing w:before="60"/></w:pPr>
          <w:r>
            <w:rPr><w:rFonts w:ascii="Arial"/><w:sz w:val="17"/><w:color w:val="0F172A"/><w:b/></w:rPr>
            <w:t>Página </w:t>
          </w:r>
          <w:fldSimple w:instr="PAGE"/>
          <w:r>
            <w:rPr><w:rFonts w:ascii="Arial"/><w:sz w:val="17"/><w:color w:val="0F172A"/><w:b/></w:rPr>
            <w:t> de </w:t>
          </w:r>
          <w:fldSimple w:instr="NUMPAGES"/>
        </w:p>
      </w:tc>
    </w:tr>
  </w:tbl>
</w:ftr>"""

    body = []

    # =========================================================
    # PORTADA SOLEMNE UNIVERSITARIA / INSTITUCIONAL
    # =========================================================
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
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="200"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="20"/><w:color w:val="475569"/></w:rPr><w:t>EQUIPO TÉCNICO DE SISTEMAS Y ARQUITECTURA DIGITAL</w:t></w:r>
    </w:p>
    """)

    if has_logo:
        body.append("""
        <w:p>
          <w:pPr><w:jc w:val="center"/><w:spacing w:before="140" w:after="200"/></w:pPr>
          <w:r>
            <w:drawing>
              <wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
                <wp:extent cx="1350000" cy="1350000"/>
                <wp:docPr id="1" name="Logo MIGATO"/>
                <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                  <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                    <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                      <pic:nvPicPr><pic:cNvPr id="0" name="Logo"/><pic:cNvPicPr/></pic:nvPicPr>
                      <pic:blipFill><a:blip r:embed="rIdLogo" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>
                      <pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="1350000" cy="1350000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>
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
      <w:pPr><w:jc w:val="center"/><w:spacing w:before="180" w:after="80"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="30"/><w:color w:val="0F172A"/></w:rPr><w:t>INFORME TÉCNICO Y PROPUESTA DE FACTIBILIDAD: ARQUITECTURA DE GESTIÓN TERRITORIAL, SEGURIDAD DE LA INFORMACIÓN Y PRESUPUESTO OPERATIVO</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="260"/></w:pPr>
      <w:r><w:rPr><w:i/><w:sz w:val="23"/><w:color w:val="0284C7"/></w:rPr><w:t>Evaluación Integral de los Cinco Módulos de Control, Servidor VPS Privado y Plan de Despliegue Tecnológico</w:t></w:r>
    </w:p>

    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:before="380" w:after="30"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="334155"/></w:rPr><w:t>Presentado a la Dirección General del Movimiento Independiente Ganamos Todos</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="260"/></w:pPr>
      <w:r><w:rPr><w:sz w:val="20"/><w:color w:val="64748B"/></w:rPr><w:t>Maturín, Estado Monagas • Septiembre de 2026</w:t></w:r>
    </w:p>
    <w:p><w:r><w:br w:type="page"/></w:r></w:p>
    """)

    # FUNCIONES HELPER
    def add_p(text, bold_prefix="", italic=False):
        return f"""
        <w:p>
          <w:pPr><w:jc w:val="both"/><w:spacing w:line="360" w:after="140"/></w:pPr>
          {f'<w:r><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="0284C7"/></w:rPr><w:t xml:space="preserve">{escape(bold_prefix)} </w:t></w:r>' if bold_prefix else ''}
          <w:r>
            <w:rPr>{'<w:i/>' if italic else ''}<w:sz w:val="24"/><w:color w:val="1E293B"/></w:rPr>
            <w:t>{escape(text)}</w:t>
          </w:r>
        </w:p>"""

    def add_h1(text):
        return f'<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>{escape(text)}</w:t></w:r></w:p>'

    def add_h2(text):
        return f'<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr><w:r><w:t>{escape(text)}</w:t></w:r></w:p>'

    def add_callout(text):
        return f"""
        <w:p>
          <w:pPr>
            <w:pBdr><w:left w:val="single" w:sz="24" w:space="14" w:color="0284C7"/></w:pBdr>
            <w:shd w:val="clear" w:color="auto" w:fill="F0F9FF"/>
            <w:spacing w:line="360" w:before="120" w:after="140"/>
            <w:jc w:val="both"/>
          </w:pPr>
          <w:r><w:rPr><w:i/><w:sz w:val="22"/><w:color w:val="0369A1"/></w:rPr><w:t>{escape(text)}</w:t></w:r>
        </w:p>"""

    def add_table(headers, rows):
        t = ['<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders><w:top w:val="single" w:sz="8" w:color="0284C7"/><w:bottom w:val="single" w:sz="8" w:color="0284C7"/><w:insideH w:val="single" w:sz="4" w:color="E2E8F0"/></w:tblBorders></w:tblPr>']
        t.append('<w:tr><w:trPr><w:tblHeader/></w:trPr>')
        for h in headers:
            t.append(f'<w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="0F172A"/></w:tcPr><w:p><w:pPr><w:spacing w:before="80" w:after="80"/><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="20"/></w:rPr><w:t>{escape(h)}</w:t></w:r></w:p></w:tc>')
        t.append('</w:tr>')
        for idx, r in enumerate(rows):
            bg = 'F8FAFC' if idx % 2 == 1 else 'FFFFFF'
            t.append('<w:tr>')
            for c_idx, cell in enumerate(r):
                jc = "center" if c_idx >= 2 else "left"
                is_total = "TOTAL" in str(r[0])
                b_tag = "<w:b/>" if is_total else ""
                color = "0284C7" if (is_total and c_idx >= 2) else "1E293B"
                t.append(f'<w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="{bg}"/></w:tcPr><w:p><w:pPr><w:spacing w:before="60" w:after="60"/><w:jc w:val="{jc}"/></w:pPr><w:r><w:rPr>{b_tag}<w:color w:val="{color}"/><w:sz w:val="20"/></w:rPr><w:t>{escape(cell)}</w:t></w:r></w:p></w:tc>')
            t.append('</w:tr>')
        t.append('</w:tbl>')
        return "".join(t)

    # =========================================================
    # CUERPO DEL INFORME V3 (TEXTO REVISADO Y AVALADO)
    # =========================================================

    # RESUMEN GENERAL INSTITUCIONAL
    body.append(add_h1("RESUMEN GENERAL INSTITUCIONAL"))
    body.append(add_p("El presente informe ha sido elaborado por el Equipo Técnico de Sistemas y Desarrollo de la organización para someter a consideración de la Dirección General del Movimiento Independiente Ganamos Todos (MIGATO) la evaluación técnico-operativa y el estudio de factibilidad de la Plataforma Territorial MIGATO. Dicha herramienta constituye una solución tecnológica integral diseñada para otorgar a la estructura de conducción un control riguroso, fidedigno y en tiempo real de la información comunitaria y electoral en los 13 municipios y 44 parroquias del Estado Monagas, superando de manera definitiva la improvisación, el extravío de datos y las vulnerabilidades de seguridad asociadas a los canales de mensajería informal."))
    body.append(add_p("Frente a la degradación sostenida de los servicios públicos en la entidad y los esquemas centralizados de control social, este sistema articula cinco componentes operativos complementarios: Despacho Parroquial Directo por Token Seguro, Censo Comunitario con Protocolo de Privacidad y Cero Residuos en Dispositivo, Acompañamiento y Resguardo del Padrón Electoral con Registro y Archivo de Actas Oficiales, Cartografía Tridimensional de Infraestructura con Filtro de Focalización Territorial, y Diagnóstico Asistencial de la Red de Salud Regional."))
    body.append(add_p("Para garantizar la estabilidad, la velocidad y la protección absoluta de las bases de datos de la organización, el equipo técnico presenta la solicitud de un presupuesto mínimo de infraestructura cloud de aproximadamente $24.50 USD mensuales ($294.00 USD anuales). Este monto está destinado exclusivamente a la contratación de un Servidor Virtual Privado (VPS) dedicado, un dominio web formal y un certificado de cifrado digital SSL/TLS de 256 bits, garantizando soberanía operativa y capacidad para absorber altos volúmenes de usuarios concurrentes sin interrupciones."))

    # CAPÍTULO I
    body.append(add_h1("CAPÍTULO I: MARCO ESTRATÉGICO Y MODERNIZACIÓN DE LA GESTIÓN"))
    body.append(add_h2("1.1. Superación del Burocrático Centralismo y Eficiencia Institucional"))
    body.append(add_p("Durante años, la administración de los servicios y la gestión comunitaria en el Estado Monagas han padecido un esquema burocrático ineficiente que ha derivado en la precarización generalizada de la calidad de vida de los monaguenses. Hospitales y ambulatorios sin respaldo eléctrico ni agua corriente, comunidades completas con fallas graves de transformadores y redes viales deterioradas son el síntoma directo de una gestión que carece de métricas objetivas y de voluntad técnica."))
    body.append(add_p("Como alternativa política de oposición organizada, el Movimiento Independiente Ganamos Todos (MIGATO) promueve una visión basada en la competencia técnica, la transparencia administrativa, el orden y la modernización de los procesos. La plataforma desarrollada por el equipo de ingeniería responde al compromiso de demostrar que Monagas puede y debe ser gestionada con estándares corporativos de primer mundo, donde cada decisión pública esté respaldada por indicadores auditables, modelos georreferenciados y datos reales de la población."))

    body.append(add_h2("1.2. Protección de la Información Territorial y Privacidad de la Base"))
    body.append(add_p("En el contexto sociopolítico actual, la salvaguarda de la información organizativa es una prioridad institucional. El trabajo de los coordinadores parroquiales, los activistas de campo y los testigos electorales requiere de herramientas digitales que aseguren la compartimentación de responsabilidades y eviten la exposición indebida de datos frente a inspecciones arbitrarias o revisiones no autorizadas de dispositivos móviles en la vía pública."))
    body.append(add_p("Por tales motivos, el diseño arquitectónico de la plataforma prioriza la seguridad por defecto: disocia los accesos, encripta el tráfico de extremo a extremo y suprime cualquier almacenamiento de datos sensibles en la memoria local de los teléfonos, brindando tranquilidad absoluta al personal operativo en el terreno."))

    # CAPÍTULO II
    body.append(add_h1("CAPÍTULO II: ESPECIFICACIONES TÉCNICAS DE LOS CINCO MÓDULOS DE GESTIÓN"))

    body.append(add_h2("2.1. Módulo 1: Despacho Celular Seguro y Coordinación Parroquial (/despacho/)"))
    body.append(add_p("Este módulo centraliza y ordena la comunicación de la Sala Situacional con las 44 parroquias del Estado Monagas mediante una estructura radial controlada, resolviendo la dispersión propia de los grupos masivos de mensajería:"))
    body.append(add_p("Desde la consola central, el operador genera un enlace web cifrado con un identificador temporal único directo al coordinador parroquial autorizado. El coordinador ingresa desde el navegador de su teléfono celular sin requerir la memorización de contraseñas alfanuméricas complejas ni instalar aplicaciones adicionales.", bold_prefix="• Acceso Instantáneo por Token Web:"))
    body.append(add_p("Cada enlace opera exclusivamente dentro de los límites de su parroquia, impidiendo la visualización transversal de incidencias o diagnósticos de otras áreas geográficas.", bold_prefix="• Compartimentación Territorial:"))
    body.append(add_p("En caso de relevo o reasignación de un coordinador, la Sala de Mando desactiva la credencial digital de forma inmediata, emitiendo una nueva para el responsable entrante sin interrumpir el funcionamiento del servidor central.", bold_prefix="• Revocación Rápida de Accesos:"))

    body.append(add_h2("2.2. Módulo 2: Censo Territorial y Protocolo de Privacidad \"Buzón Ciego\" (/carga/)"))
    body.append(add_p("Herramienta ágil orientada al diagnóstico cuantitativo de necesidades comunitarias y estimación organizativa en sectores urbanos y rurales:"))
    body.append(add_p("Registra variables agregadas como número de viviendas, familias, población general y estimación de fuerza comunitaria, junto con el reporte de fallas críticas de servicios (electricidad, agua, vialidad).", bold_prefix="• Métricas Cuantitativas Estandarizadas:"))
    body.append(add_p("Por principio ético e institucional, el sistema no almacena nombres, números de cédula ni teléfonos personales de los vecinos censados, salvaguardando la confidencialidad de las comunidades.", bold_prefix="• Protección de Datos Ciudadanos:"))
    body.append(add_p("Al presionar el botón de envío, los datos se transmiten directamente al servidor central bajo cifrado HTTPS y el formulario en pantalla se restablece por completo. En el teléfono no se almacena caché, historial ni borradores, garantizando que el dispositivo quede totalmente limpio ante cualquier revisión externa.", bold_prefix="• Protocolo de Cero Residuos en Dispositivo (Zero-Byte Device Storage):"))

    body.append(add_h2("2.3. Módulo 3: Padrón Electoral, Centros Electorales y Resguardo de Actas (/centros-maturin/)"))
    body.append(add_p("Diseñado para el seguimiento logístico, caracterización organizativa y archivo documental riguroso en los eventos comiciales del Municipio Maturín:"))
    body.append(add_p("Integra la totalidad de los 175 centros de votación y 361 mesas electorales del Municipio Maturín, permitiendo priorizar los 40 centros que concentran más del 60% del padrón electoral.", bold_prefix="• Catálogo Geoespacial de Centros:"))
    body.append(add_p("Permite ordenar la labor cívica y comunitaria identificando sectores de participación temprana, electores que requieren acompañamiento logístico y nuevos votantes jóvenes.", bold_prefix="• Segmentación de Acompañamiento Ciudadano:"))
    body.append(add_p("El sistema permite cargar los resultados numéricos emitidos por mesa, registrar al testigo responsable y almacenar la fotografía digital de respaldo tanto del acta física como del comprobante emitido por el sistema electoral oficial (incluyendo la captura nítida del código QR impreso en el acta). De esta forma, la organización cuenta con un repositorio fidedigno, seguro y auditable para cotejo institucional, sin intervenir ni suplantar las atribuciones o sistemas del Consejo Nacional Electoral.", bold_prefix="• Registro Técnico y Resguardo de Evidencia Documental:"))

    body.append(add_h2("2.4. Módulo 4: Cartografía Tridimensional de Infraestructura y Logística (/earth-monagas/)"))
    body.append(add_p("Consola geoespacial tridimensional interactiva pensada para el análisis territorial y la planificación táctica de la dirección general:"))
    body.append(add_p("Representa elevaciones topográficas, vías de acceso, distribución de comunidades y ubicación geográfica de transformadores, colectores y centros de atención.", bold_prefix="• Visualización de Infraestructura Territorial:"))
    body.append(add_p("Integra un filtro visual que aplica una atenuación suave sobre las áreas periféricas para resaltar con nitidez la parroquia o sector analizado, reduciendo la saturación visual y permitiendo evaluar prioridades de forma clara durante las sesiones de trabajo.", bold_prefix="• Herramienta de Focalización Territorial:"))
    body.append(add_p("Facilita el cálculo de distancias reales, tiempos de traslado de los equipos de apoyo y análisis de conectividad vial para jornadas de campo.", bold_prefix="• Planificación de Rutas y Despliegue:"))

    body.append(add_h2("2.5. Módulo 5: Diagnóstico y Auditoría de la Red Asistencial de Salud (/salud-monagas/)"))
    body.append(add_p("Módulo enfocado en la supervisión técnica y estado físico de la red de salud regional en Monagas, abarcando 84 centros asistenciales entre hospitales universitarios, ambulatorios urbanos, rurales y centros integrales:"))
    body.append(add_p("Evalúa la operatividad de plantas eléctricas de emergencia, continuidad de suministro de agua por tubería, disponibilidad de gases medicinales y funcionamiento de áreas quirúrgicas o salas de parto.", bold_prefix="• Monitoreo de Servicios Críticos:"))
    body.append(add_p("Registra la ruta de traslado de pacientes hacia centros de mayor resolución técnica cuando los centros primarios se encuentran limitados en su capacidad operativa.", bold_prefix="• Red de Remisión y Referencia:"))
    body.append(add_p("Consolida una base de datos fehaciente que permite fundamentar ante la opinión pública planes de recuperación hospitalaria basados en diagnósticos reales de ingeniería sanitaria.", bold_prefix="• Sustento Técnico para Propuestas de Gobierno:"))

    # CAPÍTULO III
    body.append(add_h1("CAPÍTULO III: INFRAESTRUCTURA DE SERVIDORES, SEGURIDAD Y ESTABILIDAD"))
    body.append(add_h2("3.1. Necesidad Imperativa de un Servidor Cloud VPS Privado"))
    body.append(add_p("El despliegue de una plataforma estratégica no puede sustentarse sobre servidores gratuitos o alojamientos web compartidos básicos. Dicho tipo de servicios presenta graves inconvenientes: limitaciones de ancho de banda, suspensiones imprevistas sin previo aviso, falta de aislamiento de los datos y lentitud extrema ante accesos concurrentes en momentos cruciales."))
    body.append(add_p("La contratación de un Servidor Virtual Privado (VPS) dedicado garantiza independencia y control técnico absoluto: recursos de memoria y procesador exclusivos, cortafuegos configurado a la medida de la organización, respaldo automatizado de bases de datos fuera de línea y disponibilidad ininterrumpida las 24 horas del día."))

    body.append(add_h2("3.2. Protocolo de Blindaje Informático y Pruebas de Carga"))
    body.append(add_p("Para asegurar que la plataforma opere con la máxima robustez antes de incorporar de forma masiva a las estructuras de base, el equipo técnico implementará una batería de pruebas de control de calidad y seguridad informática:"))
    body.append(add_p("Cierre estricto de puertos no esenciales, limitación del acceso al panel de administración únicamente a direcciones IP autorizadas y configuración de reglas de protección contra intentos repetitivos de acceso no autorizado (Fail2ban e iptables).", bold_prefix="• Auditoría de Vulnerabilidades y Puertos:"))
    body.append(add_p("Implementación de certificados SSL/TLS con encriptación de 256 bits en todos los subdominios de la plataforma, evitando la intercepción de información en redes móviles o públicas.", bold_prefix="• Cifrado Integral en Tránsito:"))
    body.append(add_p("Simulación de cargas simultáneas de peticiones para garantizar que el servidor mantenga tiempos de respuesta óptimos (menores a 1 segundo) durante jornadas de alta afluencia de reportes en campo.", bold_prefix="• Pruebas de Estrés y Concurrencia:"))

    # CAPÍTULO IV
    body.append(add_h1("CAPÍTULO IV: ESTUDIO ECONÓMICO Y PRESUPUESTO OPERATIVO"))
    body.append(add_p("El equipo de ingenieros y desarrolladores ha provisto la arquitectura de software y programación del sistema sin costo de honorarios para la organización. El requerimiento financiero presentado se limita estrictamente al pago directo de la infraestructura en la nube requerida para poner en funcionamiento el servidor y validar las parroquias piloto:"))

    headers_presupuesto = [
        "Componente de Infraestructura",
        "Especificación Técnica Mínima",
        "Costo Mensual",
        "Costo Anual Total"
    ]
    rows_presupuesto = [
        [
            "Servidor Cloud VPS Dedicado",
            "4 vCPU / 8 GB RAM / 100 GB SSD NVMe / Red 1 Gbps / Protección contra ataques de tráfico",
            "$20.00 USD",
            "$240.00 USD"
        ],
        [
            "Dominio Institucional Oficial",
            "Registro anual de dominio web + Certificado SSL Wildcard (HTTPS 256 bits)",
            "$1.50 USD",
            "$18.00 USD"
        ],
        [
            "IP Pública Fija Dedicada",
            "Dirección IP estática exclusiva para filtrado seguro de conexiones en consola de mando",
            "$3.00 USD",
            "$36.00 USD"
        ],
        [
            "Software de Servidor y Reglas de Seguridad",
            "Entorno Linux Ubuntu Server, Nginx, PostgreSQL, Fail2ban y módulos FOSS de código abierto",
            "$0.00 USD",
            "$0.00 USD"
        ],
        [
            "TOTAL MÍNIMO SOLICITADO (FASE 1):",
            "Infraestructura cloud soberana y certificada para las pruebas piloto",
            "~$24.50 USD / mes",
            "$294.00 USD / AÑO"
        ]
    ]
    body.append(add_table(headers_presupuesto, rows_presupuesto))

    body.append(add_h2("4.1. Planificación Escalonada por Fases"))
    body.append(add_p("Adquisición de la infraestructura cloud, vinculación de dominio oficial, configuración de reglas de firewall, pruebas de carga y validación en parroquias piloto (Las Cocuizas, San Simón y Alto de Los Godos). Inversión requerida: $294.00 USD.", bold_prefix="• Fase 1 (Inmediata - Objeto de esta solicitud):"))
    body.append(add_p("En una etapa posterior, sujeta a la planificación y disponibilidad del movimiento, se contempla la dotación física del espacio de mando (equipos de computación dedicados, pantallas de visualización general para seguimiento simultáneo y sistemas de respaldo eléctrico con inversores/UPS para operar durante las fallas del servicio eléctrico regional).", bold_prefix="• Fase 2 (Consolidación de Sala Situacional Física):"))

    # CAPÍTULO V
    body.append(add_h1("CAPÍTULO V: CONCLUSIONES Y DICTAMEN TÉCNICO"))
    body.append(add_p("Los cinco módulos de la plataforma MIGATO se encuentran programados y validados en entornos locales de prueba, demostrando plena solvencia operativa para la gestión territorial del estado.", bold_prefix="• Madurez Funcional:"))
    body.append(add_p("El esquema de enlaces mediante token web y el protocolo de borrado de formularios en el dispositivo blindan de manera efectiva la integridad de la militancia de base en el terreno.", bold_prefix="• Seguridad y Protección Humana:"))
    body.append(add_p("La inversión anual solicitada ($294.00 USD) es exclusivamente de costo directo de servidores y representa una fracción mínima en comparación con el valor de mercado de un sistema corporativo de esta envergadura.", bold_prefix="• Máxima Rentabilidad de Inversión:"))

    body.append(add_callout("RECOMENDACIÓN FINAL: El Equipo Técnico de Sistemas y Arquitectura Digital recomienda formalmente a la Dirección General de MIGATO aprobar el presupuesto operativo de $294.00 USD anuales para proceder de inmediato con la contratación del servidor dedicado y el encendido formal de la Fase 1 del proyecto."))

    body.append("""
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:before="360" w:after="40"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="0F172A"/></w:rPr><w:t>Documento técnico institucional elaborado y avalado por el</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="40"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="0284C7"/></w:rPr><w:t>Equipo Técnico de Sistemas y Desarrollo de la Plataforma Territorial MIGATO</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="140"/></w:pPr>
      <w:r><w:rPr><w:sz w:val="20"/><w:color w:val="64748B"/></w:rPr><w:t>Maturín, Estado Monagas, República Bolivariana de Venezuela.</w:t></w:r>
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

    print(f"[✓] DOCX Tesis V3 generado exitosamente: {docx_path} ({os.path.getsize(docx_path)} bytes)")
    return docx_path


def build_thesis_html_v3(filename):
    has_logo = LOGO_PATH.exists()
    logo_b64 = ""
    if has_logo:
        import base64
        logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode("utf-8")

    html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>INFORME_TESIS_PRESUPUESTO_MIGATO_V3 • Dictamen Técnico y Presupuesto Mínimo</title>
  <style>
    @page {{
      size: letter;
      margin: 25mm 20mm 25mm 30mm;
      @top-center {{
        content: "REPÚBLICA BOLIVARIANA DE VENEZUELA • ESTADO MONAGAS | MOVIMIENTO INDEPENDIENTE GANAMOS TODOS (MIGATO)";
        font-family: Arial, sans-serif;
        font-size: 8pt;
        color: #0284C7;
        font-weight: bold;
        border-bottom: 1.5px solid #0284C7;
        padding-bottom: 4px;
      }}
      @bottom-left {{
        content: "Informe Técnico y Propuesta de Factibilidad • Arquitectura MIGATO";
        font-family: Arial, sans-serif;
        font-size: 8pt;
        font-style: italic;
        color: #64748B;
        border-top: 1px solid #CBD5E1;
        padding-top: 4px;
      }}
      @bottom-right {{
        content: "Página " counter(page) " de " counter(pages);
        font-family: Arial, sans-serif;
        font-size: 8pt;
        font-weight: bold;
        color: #0F172A;
        border-top: 1px solid #CBD5E1;
        padding-top: 4px;
      }}
    }}

    body {{
      font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #0F172A;
      background: #F1F5F9;
      margin: 0;
      padding: 20px;
    }}

    .document-container {{
      max-width: 850px;
      margin: 0 auto;
      background: #FFFFFF;
      padding: 50px 60px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border-radius: 4px;
    }}

    /* HEADER & FOOTER ON SCREEN */
    .screen-header {{
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid #0284C7;
      padding-bottom: 6px;
      margin-bottom: 25px;
      font-size: 8.5pt;
      font-weight: bold;
    }}
    .screen-header .left {{ color: #0284C7; }}
    .screen-header .right {{ color: #0F172A; }}

    .screen-footer {{
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #CBD5E1;
      padding-top: 8px;
      margin-top: 35px;
      font-size: 8.5pt;
      color: #64748B;
    }}
    .screen-footer .left {{ font-style: italic; }}
    .screen-footer .right {{ font-weight: bold; color: #0F172A; }}

    /* PORTADA */
    .cover {{
      text-align: center;
      padding: 30px 0 50px 0;
      border-bottom: 2px dashed #E2E8F0;
      margin-bottom: 40px;
    }}
    .cover-top {{
      font-size: 11pt;
      font-weight: bold;
      color: #0F172A;
      margin-bottom: 4px;
    }}
    .cover-party {{
      font-size: 13pt;
      font-weight: bold;
      color: #0284C7;
      margin-bottom: 4px;
    }}
    .cover-dept {{
      font-size: 10pt;
      font-weight: 600;
      color: #475569;
      margin-bottom: 25px;
    }}
    .cover-logo {{
      width: 140px;
      height: 140px;
      object-fit: contain;
      margin: 15px auto 25px auto;
      display: block;
    }}
    .cover-title {{
      font-size: 16pt;
      font-weight: bold;
      color: #0F172A;
      line-height: 1.35;
      margin-bottom: 12px;
    }}
    .cover-subtitle {{
      font-size: 11.5pt;
      font-style: italic;
      color: #0284C7;
      margin-bottom: 30px;
    }}
    .cover-leadership {{
      font-size: 11pt;
      font-weight: bold;
      color: #334155;
      margin-bottom: 4px;
    }}
    .cover-date {{
      font-size: 10pt;
      color: #64748B;
    }}

    /* CONTENIDO */
    h1 {{
      font-size: 14pt;
      color: #0F172A;
      border-left: 4px solid #0284C7;
      padding-left: 12px;
      margin-top: 36px;
      margin-bottom: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }}
    h2 {{
      font-size: 12pt;
      color: #0284C7;
      margin-top: 24px;
      margin-bottom: 10px;
    }}
    p {{
      margin-bottom: 14px;
      text-align: justify;
      color: #1E293B;
    }}
    .callout {{
      background: #F0F9FF;
      border-left: 4px solid #0284C7;
      padding: 14px 18px;
      margin: 20px 0;
      font-style: italic;
      color: #0369A1;
      font-size: 11pt;
      border-radius: 0 6px 6px 0;
    }}
    .bullet-bold {{
      color: #0284C7;
      font-weight: bold;
    }}

    /* TABLA */
    table {{
      width: 100%;
      border-collapse: collapse;
      margin: 25px 0;
      font-size: 10pt;
    }}
    th {{
      background: #0F172A;
      color: #FFFFFF;
      padding: 10px 12px;
      text-align: left;
      font-weight: bold;
      border: 1px solid #1E293B;
    }}
    td {{
      padding: 9px 12px;
      border: 1px solid #E2E8F0;
      color: #1E293B;
    }}
    tr:nth-child(even) td {{
      background: #F8FAFC;
    }}
    tr.total-row td {{
      font-weight: bold;
      background: #F0F9FF;
      border-top: 2px solid #0284C7;
      color: #0284C7;
    }}

    .print-btn {{
      position: fixed;
      bottom: 25px;
      right: 25px;
      background: #0284C7;
      color: #FFFFFF;
      border: none;
      padding: 12px 22px;
      font-weight: bold;
      border-radius: 50px;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);
      cursor: pointer;
      font-size: 11pt;
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 1000;
    }}
    .print-btn:hover {{
      background: #0369A1;
    }}

    @media print {{
      body {{ background: transparent; padding: 0; }}
      .document-container {{ box-shadow: none; padding: 0; max-width: 100%; }}
      .print-btn {{ display: none; }}
      .cover {{ page-break-after: always; border-bottom: none; }}
      .screen-header, .screen-footer {{ display: none; }}
    }}
  </style>
</head>
<body>

  <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>

  <div class="document-container">

    <!-- PORTADA SOLEMNE -->
    <div class="cover">
      <div class="cover-top">REPÚBLICA BOLIVARIANA DE VENEZUELA • ESTADO MONAGAS</div>
      <div class="cover-party">MOVIMIENTO INDEPENDIENTE GANAMOS TODOS (MIGATO)</div>
      <div class="cover-dept">EQUIPO TÉCNICO DE SISTEMAS Y ARQUITECTURA DIGITAL</div>

      {f'<img class="cover-logo" src="data:image/png;base64,{logo_b64}" alt="Logo MIGATO">' if logo_b64 else ''}

      <div class="cover-title">INFORME TÉCNICO Y PROPUESTA DE FACTIBILIDAD: ARQUITECTURA DE GESTIÓN TERRITORIAL, SEGURIDAD DE LA INFORMACIÓN Y PRESUPUESTO OPERATIVO</div>
      <div class="cover-subtitle">Evaluación Integral de los Cinco Módulos de Control, Servidor VPS Privado y Plan de Despliegue Tecnológico</div>

      <div class="cover-leadership">Presentado a la Dirección General del Movimiento Independiente Ganamos Todos</div>
      <div class="cover-date">Maturín, Estado Monagas • Septiembre de 2026</div>
    </div>

    <!-- CABECERA EN PANTALLA -->
    <div class="screen-header">
      <div class="left">REPÚBLICA BOLIVARIANA DE VENEZUELA • ESTADO MONAGAS</div>
      <div class="right">MOVIMIENTO INDEPENDIENTE GANAMOS TODOS (MIGATO)</div>
    </div>

    <!-- RESUMEN GENERAL INSTITUCIONAL -->
    <h1>RESUMEN GENERAL INSTITUCIONAL</h1>
    <p>El presente informe ha sido elaborado por el Equipo Técnico de Sistemas y Desarrollo de la organización para someter a consideración de la Dirección General del Movimiento Independiente Ganamos Todos (MIGATO) la evaluación técnico-operativa y el estudio de factibilidad de la Plataforma Territorial MIGATO. Dicha herramienta constituye una solución tecnológica integral diseñada para otorgar a la estructura de conducción un control riguroso, fidedigno y en tiempo real de la información comunitaria y electoral en los 13 municipios y 44 parroquias del Estado Monagas, superando de manera definitiva la improvisación, el extravío de datos y las vulnerabilidades de seguridad asociadas a los canales de mensajería informal.</p>
    <p>Frente a la degradación sostenida de los servicios públicos en la entidad y los esquemas centralizados de control social, este sistema articula cinco componentes operativos complementarios: Despacho Parroquial Directo por Token Seguro, Censo Comunitario con Protocolo de Privacidad y Cero Residuos en Dispositivo, Acompañamiento y Resguardo del Padrón Electoral con Registro y Archivo de Actas Oficiales, Cartografía Tridimensional de Infraestructura con Filtro de Focalización Territorial, y Diagnóstico Asistencial de la Red de Salud Regional.</p>
    <p>Para garantizar la estabilidad, la velocidad y la protección absoluta de las bases de datos de la organización, el equipo técnico presenta la solicitud de un presupuesto mínimo de infraestructura cloud de aproximadamente <strong>$24.50 USD mensuales ($294.00 USD anuales)</strong>. Este monto está destinado exclusivamente a la contratación de un Servidor Virtual Privado (VPS) dedicado, un dominio web formal y un certificado de cifrado digital SSL/TLS de 256 bits, garantizando soberanía operativa y capacidad para absorber altos volúmenes de usuarios concurrentes sin interrupciones.</p>

    <!-- CAPÍTULO I -->
    <h1>CAPÍTULO I: MARCO ESTRATÉGICO Y MODERNIZACIÓN DE LA GESTIÓN</h1>
    <h2>1.1. Superación del Burocrático Centralismo y Eficiencia Institucional</h2>
    <p>Durante años, la administración de los servicios y la gestión comunitaria en el Estado Monagas han padecido un esquema burocrático ineficiente que ha derivado en la precarización generalizada de la calidad de vida de los monaguenses. Hospitales y ambulatorios sin respaldo eléctrico ni agua corriente, comunidades completas con fallas graves de transformadores y redes viales deterioradas son el síntoma directo de una gestión que carece de métricas objetivas y de voluntad técnica.</p>
    <p>Como alternativa política de oposición organizada, el Movimiento Independiente Ganamos Todos (MIGATO) promueve una visión basada en la competencia técnica, la transparencia administrativa, el orden y la modernización de los procesos. La plataforma desarrollada por el equipo de ingeniería responde al compromiso de demostrar que Monagas puede y debe ser gestionada con estándares corporativos de primer mundo, donde cada decisión pública esté respaldada por indicadores auditables, modelos georreferenciados y datos reales de la población.</p>

    <h2>1.2. Protección de la Información Territorial y Privacidad de la Base</h2>
    <p>En el contexto sociopolítico actual, la salvaguarda de la información organizativa es una prioridad institucional. El trabajo de los coordinadores parroquiales, los activistas de campo y los testigos electorales requiere de herramientas digitales que aseguren la compartimentación de responsabilidades y eviten la exposición indebida de datos frente a inspecciones arbitrarias o revisiones no autorizadas de dispositivos móviles en la vía pública.</p>
    <p>Por tales motivos, el diseño arquitectónico de la plataforma prioriza la seguridad por defecto: disocia los accesos, encripta el tráfico de extremo a extremo y suprime cualquier almacenamiento de datos sensibles en la memoria local de los teléfonos, brindando tranquilidad absoluta al personal operativo en el terreno.</p>

    <!-- CAPÍTULO II -->
    <h1>CAPÍTULO II: ESPECIFICACIONES TÉCNICAS DE LOS CINCO MÓDULOS DE GESTIÓN</h1>
    <h2>2.1. Módulo 1: Despacho Celular Seguro y Coordinación Parroquial (/despacho/)</h2>
    <p>Este módulo centraliza y ordena la comunicación de la Sala Situacional con las 44 parroquias del Estado Monagas mediante una estructura radial controlada, resolviendo la dispersión propia de los grupos masivos de mensajería:</p>
    <p><span class="bullet-bold">• Acceso Instantáneo por Token Web:</span> Desde la consola central, el operador genera un enlace web cifrado con un identificador temporal único directo al coordinador parroquial autorizado. El coordinador ingresa desde el navegador de su teléfono celular sin requerir la memorización de contraseñas alfanuméricas complejas ni instalar aplicaciones adicionales.</p>
    <p><span class="bullet-bold">• Compartimentación Territorial:</span> Cada enlace opera exclusivamente dentro de los límites de su parroquia, impidiendo la visualización transversal de incidencias o diagnósticos de otras áreas geográficas.</p>
    <p><span class="bullet-bold">• Revocación Rápida de Accesos:</span> En caso de relevo o reasignación de un coordinador, la Sala de Mando desactiva la credencial digital de forma inmediata, emitiendo una nueva para el responsable entrante sin interrumpir el funcionamiento del servidor central.</p>

    <h2>2.2. Módulo 2: Censo Territorial y Protocolo de Privacidad "Buzón Ciego" (/carga/)</h2>
    <p>Herramienta ágil orientada al diagnóstico cuantitativo de necesidades comunitarias y estimación organizativa en sectores urbanos y rurales:</p>
    <p><span class="bullet-bold">• Métricas Cuantitativas Estandarizadas:</span> Registra variables agregadas como número de viviendas, familias, población general y estimación de fuerza comunitaria, junto con el reporte de fallas críticas de servicios (electricidad, agua, vialidad).</p>
    <p><span class="bullet-bold">• Protección de Datos Ciudadanos:</span> Por principio ético e institucional, el sistema no almacena nombres, números de cédula ni teléfonos personales de los vecinos censados, salvaguardando la confidencialidad de las comunidades.</p>
    <p><span class="bullet-bold">• Protocolo de Cero Residuos en Dispositivo (Zero-Byte Device Storage):</span> Al presionar el botón de envío, los datos se transmiten directamente al servidor central bajo cifrado HTTPS y el formulario en pantalla se restablece por completo. En el teléfono no se almacena caché, historial ni borradores, garantizando que el dispositivo quede totalmente limpio ante cualquier revisión externa.</p>

    <h2>2.3. Módulo 3: Padrón Electoral, Centros Electorales y Resguardo de Actas (/centros-maturin/)</h2>
    <p>Diseñado para el seguimiento logístico, caracterización organizativa y archivo documental riguroso en los eventos comiciales del Municipio Maturín:</p>
    <p><span class="bullet-bold">• Catálogo Geoespacial de Centros:</span> Integra la totalidad de los 175 centros de votación y 361 mesas electorales del Municipio Maturín, permitiendo priorizar los 40 centros que concentran más del 60% del padrón electoral.</p>
    <p><span class="bullet-bold">• Segmentación de Acompañamiento Ciudadano:</span> Permite ordenar la labor cívica y comunitaria identificando sectores de participación temprana, electores que requieren acompañamiento logístico y nuevos votantes jóvenes.</p>
    <p><span class="bullet-bold">• Registro Técnico y Resguardo de Evidencia Documental:</span> El sistema permite cargar los resultados numéricos emitidos por mesa, registrar al testigo responsable y almacenar la fotografía digital de respaldo tanto del acta física como del comprobante emitido por el sistema electoral oficial (incluyendo la captura nítida del código QR impreso en el acta). De esta forma, la organización cuenta con un repositorio fidedigno, seguro y auditable para cotejo institucional, sin intervenir ni suplantar las atribuciones o sistemas del Consejo Nacional Electoral.</p>

    <h2>2.4. Módulo 4: Cartografía Tridimensional de Infraestructura y Logística (/earth-monagas/)</h2>
    <p>Consola geoespacial tridimensional interactiva pensada para el análisis territorial y la planificación táctica de la dirección general:</p>
    <p><span class="bullet-bold">• Visualización de Infraestructura Territorial:</span> Representa elevaciones topográficas, vías de acceso, distribución de comunidades y ubicación geográfica de transformadores, colectores y centros de atención.</p>
    <p><span class="bullet-bold">• Herramienta de Focalización Territorial:</span> Integra un filtro visual que aplica una atenuación suave sobre las áreas periféricas para resaltar con nitidez la parroquia o sector analizado, reduciendo la saturación visual y permitiendo evaluar prioridades de forma clara durante las sesiones de trabajo.</p>
    <p><span class="bullet-bold">• Planificación de Rutas y Despliegue:</span> Facilita el cálculo de distancias reales, tiempos de traslado de los equipos de apoyo y análisis de conectividad vial para jornadas de campo.</p>

    <h2>2.5. Módulo 5: Diagnóstico y Auditoría de la Red Asistencial de Salud (/salud-monagas/)</h2>
    <p>Módulo enfocado en la supervisión técnica y estado físico de la red de salud regional en Monagas, abarcando 84 centros asistenciales entre hospitales universitarios, ambulatorios urbanos, rurales y centros integrales:</p>
    <p><span class="bullet-bold">• Monitoreo de Servicios Críticos:</span> Evalúa la operatividad de plantas eléctricas de emergencia, continuidad de suministro de agua por tubería, disponibilidad de gases medicinales y funcionamiento de áreas quirúrgicas o salas de parto.</p>
    <p><span class="bullet-bold">• Red de Remisión y Referencia:</span> Registra la ruta de traslado de pacientes hacia centros de mayor resolución técnica cuando los centros primarios se encuentran limitados en su capacidad operativa.</p>
    <p><span class="bullet-bold">• Sustento Técnico para Propuestas de Gobierno:</span> Consolida una base de datos fehaciente que permite fundamentar ante la opinión pública planes de recuperación hospitalaria basados en diagnósticos reales de ingeniería sanitaria.</p>

    <!-- CAPÍTULO III -->
    <h1>CAPÍTULO III: INFRAESTRUCTURA DE SERVIDORES, SEGURIDAD Y ESTABILIDAD</h1>
    <h2>3.1. Necesidad Imperativa de un Servidor Cloud VPS Privado</h2>
    <p>El despliegue de una plataforma estratégica no puede sustentarse sobre servidores gratuitos o alojamientos web compartidos básicos. Dicho tipo de servicios presenta graves inconvenientes: limitaciones de ancho de banda, suspensiones imprevistas sin previo aviso, falta de aislamiento de los datos y lentitud extrema ante accesos concurrentes en momentos cruciales.</p>
    <p>La contratación de un Servidor Virtual Privado (VPS) dedicado garantiza independencia y control técnico absoluto: recursos de memoria y procesador exclusivos, cortafuegos configurado a la medida de la organización, respaldo automatizado de bases de datos fuera de línea y disponibilidad ininterrumpida las 24 horas del día.</p>

    <h2>3.2. Protocolo de Blindaje Informático y Pruebas de Carga</h2>
    <p>Para asegurar que la plataforma opere con la máxima robustez antes de incorporar de forma masiva a las estructuras de base, el equipo técnico implementará una batería de pruebas de control de calidad y seguridad informática:</p>
    <p><span class="bullet-bold">• Auditoría de Vulnerabilidades y Puertos:</span> Cierre estricto de puertos no esenciales, limitación del acceso al panel de administración únicamente a direcciones IP autorizadas y configuración de reglas de protección contra intentos repetitivos de acceso no autorizado (Fail2ban e iptables).</p>
    <p><span class="bullet-bold">• Cifrado Integral en Tránsito:</span> Implementación de certificados SSL/TLS con encriptación de 256 bits en todos los subdominios de la plataforma, evitando la intercepción de información en redes móviles o públicas.</p>
    <p><span class="bullet-bold">• Pruebas de Estrés y Concurrencia:</span> Simulación de cargas simultáneas de peticiones para garantizar que el servidor mantenga tiempos de respuesta óptimos (menores a 1 segundo) durante jornadas de alta afluencia de reportes en campo.</p>

    <!-- CAPÍTULO IV -->
    <h1>CAPÍTULO IV: ESTUDIO ECONÓMICO Y PRESUPUESTO OPERATIVO</h1>
    <p>El equipo de ingenieros y desarrolladores ha provisto la arquitectura de software y programación del sistema sin costo de honorarios para la organización. El requerimiento financiero presentado se limita estrictamente al pago directo de la infraestructura en la nube requerida para poner en funcionamiento el servidor y validar las parroquias piloto:</p>

    <table>
      <thead>
        <tr>
          <th>Componente de Infraestructura</th>
          <th>Especificación Técnica Mínima</th>
          <th style="text-align: center;">Costo Mensual</th>
          <th style="text-align: center;">Costo Anual Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Servidor Cloud VPS Dedicado</strong></td>
          <td>4 vCPU / 8 GB RAM / 100 GB SSD NVMe / Red 1 Gbps / Protección contra ataques de tráfico</td>
          <td style="text-align: center;">$20.00 USD</td>
          <td style="text-align: center;">$240.00 USD</td>
        </tr>
        <tr>
          <td><strong>Dominio Institucional Oficial</strong></td>
          <td>Registro anual de dominio web + Certificado SSL Wildcard (HTTPS 256 bits)</td>
          <td style="text-align: center;">$1.50 USD</td>
          <td style="text-align: center;">$18.00 USD</td>
        </tr>
        <tr>
          <td><strong>IP Pública Fija Dedicada</strong></td>
          <td>Dirección IP estática exclusiva para filtrado seguro de conexiones en consola de mando</td>
          <td style="text-align: center;">$3.00 USD</td>
          <td style="text-align: center;">$36.00 USD</td>
        </tr>
        <tr>
          <td><strong>Software de Servidor y Reglas de Seguridad</strong></td>
          <td>Entorno Linux Ubuntu Server, Nginx, PostgreSQL, Fail2ban y módulos FOSS de código abierto</td>
          <td style="text-align: center;">$0.00 USD</td>
          <td style="text-align: center;">$0.00 USD</td>
        </tr>
        <tr class="total-row">
          <td>TOTAL MÍNIMO SOLICITADO (FASE 1):</td>
          <td>Infraestructura cloud soberana y certificada para las pruebas piloto</td>
          <td style="text-align: center;">~$24.50 USD / mes</td>
          <td style="text-align: center;">$294.00 USD / AÑO</td>
        </tr>
      </tbody>
    </table>

    <h2>4.1. Planificación Escalonada por Fases</h2>
    <p><span class="bullet-bold">• Fase 1 (Inmediata - Objeto de esta solicitud):</span> Adquisición de la infraestructura cloud, vinculación de dominio oficial, configuración de reglas de firewall, pruebas de carga y validación en parroquias piloto (Las Cocuizas, San Simón y Alto de Los Godos). Inversión requerida: <strong>$294.00 USD</strong>.</p>
    <p><span class="bullet-bold">• Fase 2 (Consolidación de Sala Situacional Física):</span> En una etapa posterior, sujeta a la planificación y disponibilidad del movimiento, se contempla la dotación física del espacio de mando (equipos de computación dedicados, pantallas de visualización general para seguimiento simultáneo y sistemas de respaldo eléctrico con inversores/UPS para operar durante las fallas del servicio eléctrico regional).</p>

    <!-- CAPÍTULO V -->
    <h1>CAPÍTULO V: CONCLUSIONES Y DICTAMEN TÉCNICO</h1>
    <p><span class="bullet-bold">• Madurez Funcional:</span> Los cinco módulos de la plataforma MIGATO se encuentran programados y validados en entornos locales de prueba, demostrando plena solvencia operativa para la gestión territorial del estado.</p>
    <p><span class="bullet-bold">• Seguridad y Protección Humana:</span> El esquema de enlaces mediante token web y el protocolo de borrado de formularios en el dispositivo blindan de manera efectiva la integridad de la militancia de base en el terreno.</p>
    <p><span class="bullet-bold">• Máxima Rentabilidad de Inversión:</span> La inversión anual solicitada ($294.00 USD) es exclusivamente de costo directo de servidores y representa una fracción mínima en comparación con el valor de mercado de un sistema corporativo de esta envergadura.</p>

    <div class="callout">
      <strong>RECOMENDACIÓN FINAL:</strong> El Equipo Técnico de Sistemas y Arquitectura Digital recomienda formalmente a la Dirección General de MIGATO aprobar el presupuesto operativo de <strong>$294.00 USD anuales</strong> para proceder de inmediato con la contratación del servidor dedicado y el encendido formal de la Fase 1 del proyecto.
    </div>

    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E2E8F0;">
      <p style="font-size: 11pt; font-weight: bold; color: #0F172A; margin-bottom: 4px;">Documento técnico institucional elaborado y avalado por el</p>
      <p style="font-size: 11.5pt; font-weight: bold; color: #0284C7; margin-bottom: 4px;">Equipo Técnico de Sistemas y Desarrollo de la Plataforma Territorial MIGATO</p>
      <p style="font-size: 10pt; color: #64748B;">Maturín, Estado Monagas, República Bolivariana de Venezuela.</p>
    </div>

    <!-- PIE DE PÁGINA EN PANTALLA -->
    <div class="screen-footer">
      <div class="left">Informe Técnico y Propuesta de Factibilidad • Arquitectura MIGATO</div>
      <div class="right">Página Oficial • Plataforma MIGATO 2026</div>
    </div>

  </div>

</body>
</html>"""

    html_path = Path(filename).resolve()
    html_path.write_text(html_content, encoding="utf-8")
    print(f"[✓] HTML Tesis V3 generado exitosamente: {html_path} ({os.path.getsize(html_path)} bytes)")
    return html_path


if __name__ == "__main__":
    out_docx = PROJECT_ROOT / "INFORME_TESIS_PRESUPUESTO_MIGATO_V3.docx"
    out_html = PROJECT_ROOT / "INFORME_TESIS_PRESUPUESTO_MIGATO_V3.html"
    build_thesis_docx_v3(out_docx)
    build_thesis_html_v3(out_html)
