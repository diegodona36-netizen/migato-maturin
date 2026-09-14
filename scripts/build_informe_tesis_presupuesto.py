#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de Informe Técnico-Estratégico en Formato Académico / Tesis Universitaria (Estándar Dutila / UPEL)
Movimiento Independiente Ganamos Todos (MIGATO) • Comando de El Gato Briceño
Estado Monagas, Septiembre 2026
"""

import os
import sys
import json
import zipfile
import html
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
LOGO_PATH = PROJECT_ROOT / "assets" / "logo-migato.png"

def escape(text):
    return html.escape(str(text))

def build_thesis_docx(filename):
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
            <w:t>Dictamen Técnico-Estratégico y Presupuesto • Sala de Mando El Gato Briceño</w:t>
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
    # PORTADA SOLEMNE UNIVERSITARIA / GOBIERNO
    # =========================================================
    body.append("""
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:before="120" w:after="40"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="0F172A"/></w:rPr><w:t>REPÚBLICA BOLIVARIANA DE VENEZUELA</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="40"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="0284C7"/></w:rPr><w:t>MOVIMIENTO INDEPENDIENTE GANAMOS TODOS (MIGATO)</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="200"/></w:pPr>
      <w:r><w:rPr><w:sz w:val="20"/><w:color w:val="475569"/></w:rPr><w:t>DIRECCIÓN GENERAL DE ESTRATEGIA Y SALA SITUACIONAL REGIONAL</w:t></w:r>
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
      <w:r><w:rPr><w:b/><w:sz w:val="30"/><w:color w:val="0F172A"/></w:rPr><w:t>DICTAMEN TÉCNICO-ESTRATÉGICO Y ESTUDIO DE FACTIBILIDAD: ARQUITECTURA DE INTELIGENCIA TERRITORIAL, BLINDAJE CIBERNÉTICO Y PRESUPUESTO MÍNIMO OPERATIVO</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="260"/></w:pPr>
      <w:r><w:rPr><w:i/><w:sz w:val="23"/><w:color w:val="0284C7"/></w:rPr><w:t>Manual Doctrinal, Evaluación de los Cinco Módulos de Mando Táctico y Protocolo de Pruebas de Hacking Ético en Servidor VPS Soberano</w:t></w:r>
    </w:p>

    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:before="380" w:after="30"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="334155"/></w:rPr><w:t>Comando de Campaña y Dirección Estratégica</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="30"/></w:pPr>
      <w:r><w:rPr><w:sz w:val="20"/><w:color w:val="64748B"/></w:rPr><w:t>Bajo el Liderazgo Político y Gerencial de José Gregorio "El Gato" Briceño</w:t></w:r>
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

    def add_h3(text):
        return f'<w:p><w:pPr><w:pStyle w:val="Heading3"/></w:pPr><w:r><w:t>{escape(text)}</w:t></w:r></w:p>'

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
            for cell in r:
                t.append(f'<w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="{bg}"/></w:tcPr><w:p><w:pPr><w:spacing w:before="60" w:after="60"/><w:jc w:val="left"/></w:pPr><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t>{escape(cell)}</w:t></w:r></w:p></w:tc>')
            t.append('</w:tr>')
        t.append('</w:tbl>')
        return "".join(t)

    # =========================================================
    # CUERPO DEL INFORME (5 CAPÍTULOS RIGUROSOS)
    # =========================================================

    # RESUMEN EJECUTIVO (ABSTRACT)
    body.append(add_h1("RESUMEN EJECUTIVO (ABSTRACT INSTITUCIONAL Y FINANCIERO)"))
    body.append(add_p("El presente dictamen formaliza la evaluación técnico-operativa y el estudio de factibilidad financiera para el despliegue soberano de la Plataforma Territorial MIGATO en el Estado Monagas. Concebida bajo la doctrina gerencial de libre mercado y eficiencia privada liderada por José Gregorio 'El Gato' Briceño, la herramienta le otorga al movimiento el control estratégico absoluto de la información en tiempo real, erradicando la improvisación, el espionaje y la dispersión en grupos vulnerables de mensajería."))
    body.append(add_p("A diferencia de la administración pública oficialista que colapsó los servicios del estado y somete a la ciudadanía mediante censos de extorsión, MIGATO articula cinco módulos complementarios (Despacho Celular Seguro, Censo con Protocolo de Buzón Ciego de Cero Residuos, Auditoría Electoral CNE con Validación QR en 2 Segundos, Cartografía Satelital 3D con Atenuación Velo Blanco y Auditoría de la Red Asistencial de 84 Centros de Salud)."))
    body.append(add_p("Se somete a consideración del Comando Estratégico la aprobación de un presupuesto mínimo indispensable de arranque de ~$24.50 USD mensuales ($294.00 USD anuales) destinado exclusivamente a la contratación de un Servidor Virtual Privado (VPS) soberano y un Dominio Institucional Oficial con cifrado SSL de 256 bits. Dicha infraestructura permitirá realizar pruebas de estrés de concurrencia y ejecutar tests de penetración y hacking ético para blindar la base de datos frente a adversarios antes de la incorporación masiva de la estructura de base."))
    body.append(add_callout("«La reconstrucción de Monagas exige rigor gerencial, datos fidedignos e inexpugnabilidad tecnológica. Cada voto y cada comunidad deben defenderse con pruebas matemáticas en la mano.» — Comando Estratégico MIGATO."))

    # CAPÍTULO I
    body.append(add_h1("CAPÍTULO I: MARCO DOCTRINAL Y GOBERNANZA CAPITALISTA DE EL GATO BRICEÑO"))
    body.append(add_h2("1. Ruptura con el Estatismo y el Clientelismo Centralista"))
    body.append(add_p("Durante las últimas décadas, el modelo estatista y burocrático destruyó el aparato productivo y los servicios públicos del Estado Monagas. Hospitales sin insumos ni plantas de emergencia, acueductos paralizados, vialidad agrícola intransitable y apagones permanentes son el saldo de una gestión sustentada en la demagogia y la ineficiencia."))
    body.append(add_p("El Movimiento Independiente Ganamos Todos (MIGATO), enraizado en la memoria de orden, grandes obras de infraestructura y probada solvencia gerencial del gobierno de El Gato Briceño, plantea un modelo diametralmente opuesto: supremacía del mérito técnico, defensa irrestricta de la iniciativa privada, transparencia contable y soberanía tecnológica. Esta plataforma es el instrumento operativo para demostrar que Monagas puede ser gobernada con estándares corporativos de primer mundo."))

    body.append(add_h2("2. Soberanía de Datos y Protección Contra Persecución"))
    body.append(add_p("En un entorno político hostil, la seguridad de la información es una premisa innegociable. La plataforma MIGATO se diseñó para operar con protocolos forenses que disocian la información de las personas. La dirigencia de base, los testigos electorales y los profesionales de la salud trabajan bajo un escudo criptográfico que neutraliza cualquier intento de amedrentamiento o confiscación en alcabalas."))

    # CAPÍTULO II
    body.append(add_h1("CAPÍTULO II: ARQUITECTURA TÉCNICA DE LOS CINCO MÓDULOS DE MANDO TÁCTICO"))
    
    body.append(add_h2("1. Módulo 1: Despacho Celular Seguro (/despacho/)"))
    body.append(add_p("Resuelve el problema histórico del 'teléfono roto' y la filtración de contraseñas. El director de la Sala Situacional pulsa el botón correspondiente a cualquiera de las 44 parroquias de Monagas y el sistema genera automáticamente un enlace encriptado con token individual directo al WhatsApp del coordinador territorial."))
    body.append(add_p("El coordinador opera en su jurisdicción sin comprometer las demás parroquias. Si se releva a un cuadro parroquial, su acceso se revoca en 2 segundos sin alterar la configuración del servidor ni afectar a los restantes coordinadores.", bold_prefix="Blindaje Operativo:"))

    body.append(add_h2("2. Módulo 2: Censo Territorial y Protocolo Forense de Buzón Ciego (/carga/)"))
    body.append(add_p("Herramienta ligera para el levantamiento cuantitativo de viviendas, familias, votantes seguros y fallas de servicios (agua, transformadores, vialidad). Implementa el Protocolo de Buzón Ciego (Zero-Byte Memory): al pulsar 'Registrar y Enviar', la memoria del teléfono celular se borra automáticamente."))
    body.append(add_p("Si un activista es interceptado por organismos de seguridad, el dispositivo móvil no contiene ningún registro ni lista incautable. La información viaja encriptada directamente al repositorio central del Comando.", bold_prefix="Seguridad de Base:"))

    body.append(add_h2("3. Módulo 3: Padrón Electoral, Tablilla CNE y Validación de Actas QR (/centros-maturin/)"))
    body.append(add_p("Georreferenciación milimétrica de las 175 escuelas electorales de Maturín y 419.000 electores categorizados bajo semáforo independiente (Voto Duro leal, Voto Blando persuasible y Voto Joven)."))
    body.append(add_p("Incorpora el Escáner de Códigos QR de Actas Oficiales del CNE: el testigo escanea el comprobante impreso por la máquina de votación y el sistema decodifica y totaliza el acta en 2 segundos. Permite a El Gato Briceño tener el conteo paralelo definitivo antes de que el oficialismo intente manipular la transmisión.", bold_prefix="Auditoría Irrefutable:"))

    body.append(add_h2("4. Módulo 4: Cartografía Táctica Satelital 3D y Efecto Velo Blanco (/earth-monagas/)"))
    body.append(add_p("Consola tridimensional de alta definición construida sobre MapLibre 3D. Diseñada específicamente para optimizar la toma de decisiones de El Gato Briceño y su Estado Mayor, evitando la sobrecarga visual."))
    body.append(add_p("El algoritmo de 'Velo Blanco' cubre con niebla suave los municipios y parroquias periféricas, iluminando únicamente el territorio bajo análisis. Permite planificar rutas de movilización, monitorear la logística de testigos y calcular tiempos de traslado al segundo.", bold_prefix="Focalización Táctica:"))

    body.append(add_h2("5. Módulo 5: Red Hospitalaria y Auditoría de Servicios Asistenciales (/salud-monagas/)"))
    body.append(add_p("Monitoreo en tiempo real de los 84 centros asistenciales de Monagas (Hospital Universitario Dr. Manuel Núñez Tovar, ambulatorios urbanos tipo II/III y CDIs)."))
    body.append(add_p("Supervisa cinco variables críticas de supervivencia: operatividad de plantas eléctricas, suministro continuo de agua, gases medicinales, quirófanos activos y camas disponibles. Permite documentar técnica y jurídicamente la crisis asistencial, ofreciendo propuestas gerenciales inmediatas y desmontando la propaganda del régimen con datos irrefutables.", bold_prefix="Semáforo de Soporte Vital:"))

    # CAPÍTULO III
    body.append(add_h1("CAPÍTULO III: CIBERSEGURIDAD, DEFENSAS ACTIVAS Y PROTOCOLO DE HACKING ÉTICO"))
    body.append(add_h2("1. Necesidad Imperativa de un Servidor VPS Dedicado Soberano"))
    body.append(add_p("La dependencia de plataformas gratuitas o servidores compartidos constituye un riesgo de seguridad inaceptable: están sujetas a suspensión arbitraria, no soportan tráfico masivo concurrente el día de las elecciones y exponen los datos a vulnerabilidades ajenas."))
    body.append(add_p("Un Servidor Cloud VPS Dedicado garantiza soberanía técnica: cortafuegos configurado a la medida, aislamiento de bases de datos, copias de respaldo automatizadas fuera de línea y ancho de banda garantizado para soportar miles de conexiones simultáneas sin caídas."))

    body.append(add_h2("2. Protocolo de Pentesting y Pruebas de Resistencia al Ataque"))
    body.append(add_p("Antes de abrir la plataforma a la totalidad de la estructura de base, el equipo técnico someterá el servidor a simulaciones controladas de intrusión (Pentesting Ético): escaneo de puertos vulnerables, pruebas de inyección SQL, simulación de ataques de denegación distribuida de servicio (DDoS) y auditoría de certificados SSL."))
    body.append(add_p("El objetivo es garantizar que ningún actor malicioso u organismo de contrainteligencia pueda hackear el sistema, ralentizar el despacho de órdenes o vulnerar la confidencialidad de la militancia independiente.", bold_prefix="Cero Brechas:"))

    # CAPÍTULO IV
    body.append(add_h1("CAPÍTULO IV: ESTUDIO ECONÓMICO Y PRESUPUESTO MÍNIMO OPERATIVO"))
    body.append(add_h2("1. Desglose del Presupuesto Mínimo de Arranque (Fase 1)"))
    body.append(add_p("El presupuesto solicitado representa el costo estricto de los recursos en la nube indispensables para encender los motores y validar la plataforma con tres parroquias piloto (Las Cocuizas, San Simón y Alto de Los Godos):"))

    headers_presupuesto = ["Concepto de Infraestructura", "Especificación Técnica Mínima", "Costo Mensual", "Costo Anual Total"]
    rows_presupuesto = [
        ["Servidor Cloud VPS Dedicado", "4 vCPU / 8 GB RAM / 100 GB SSD NVMe / Red 1 Gbps (Anti-DDoS)", "$20.00 USD", "$240.00 USD"],
        ["Dominio Institucional Oficial", "Registro anual + Certificado SSL Wildcard (HTTPS 256 bits)", "$1.50 USD", "$18.00 USD"],
        ["IP Pública Fija Dedicada", "Dirección IP exclusiva para firewall y Sala de Mando", "$3.00 USD", "$36.00 USD"],
        ["Software de Pentesting y Blindaje", "Herramientas FOSS de hacking ético, Fail2ban e iptables", "$0.00 (Libre)", "$0.00 (Incluido)"],
        ["TOTAL MÍNIMO SOLICITADO (FASE 1)", "Infraestructura lista para pruebas de campo y seguridad", "~$24.50 USD / mes", "$294.00 USD / AÑO"]
    ]
    body.append(add_table(headers_presupuesto, rows_presupuesto))

    body.append(add_callout("«ANÁLISIS DE RETORNO DE INVERSIÓN: En el mercado privado corporativo, el desarrollo desde cero de una plataforma integrada de 5 módulos supera los $25.000 USD. El desarrollo técnico ya fue donado al equipo de El Gato Briceño sin costo alguno. La aprobación de $294 USD anuales cubre el 100% de la infraestructura tecnológica requerida.»"))

    body.append(add_h2("2. Planificación por Fases: Fase 1 (Digital) vs. Fase 2 (Física)"))
    body.append(add_p("Fase 1 (Inmediata - Objeto de esta solicitud):", bold_prefix="FASE 1:"))
    body.append(add_p("Contratación del VPS, configuración de dominios, despliegue de cortafuegos, test de hacking ético y prueba de estrés con coordinadores de campo. Inversión: $294.00 USD."))
    body.append(add_p("Fase 2 (Consolidación - A mediano plazo según disponga el Comando):", bold_prefix="FASE 2:"))
    body.append(add_p("Equipamiento de la Sala Situacional física de El Gato Briceño: 2 a 3 computadoras de escritorio, pantallas de 55 pulgadas para videowall, sistema de respaldo eléctrico con inversores de corriente y baterías UPS para operar sin interrupciones durante los apagones de Corpoelec, y enlace satelital de respaldo. Su ejecución se programará una vez concluida exitosamente la Fase 1."))

    # CAPÍTULO V
    body.append(add_h1("CAPÍTULO V: CONCLUSIONES, DICTAMEN TÉCNICO Y FIRMAS"))
    body.append(add_p("1. Viabilidad Técnica Plena: Los cinco módulos de la plataforma MIGATO se encuentran programados, probados y plenamente funcionales."))
    body.append(add_p("2. Seguridad Inexpugnable: El protocolo de Buzón Ciego de Cero Bytes y la validación de actas QR blindan la integridad de la militancia y la defensa matemática del voto."))
    body.append(add_p("3. Eficiencia de Costos Sobresaliente: Un costo operativo de menos de $25 dólares al mes representa una relación costo-beneficio inigualable para la conducción política regional."))
    body.append(add_p("Dictamen: Se recomienda al Comando Estratégico la inmediata aprobación y desembolso del monto de $294.00 USD para la contratación de la infraestructura cloud de la Fase 1.", bold_prefix="DICTAMEN FINAL:"))

    body.append("""
    <w:p><w:pPr><w:spacing w:before="360"/></w:pPr></w:p>
    <w:tbl>
      <w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders><w:top w:val="none"/><w:bottom w:val="none"/><w:left w:val="none"/><w:right w:val="none"/><w:insideH w:val="none"/><w:insideV w:val="none"/></w:tblBorders></w:tblPr>
      <w:tr>
        <w:tc>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="350" w:after="30"/></w:pPr><w:r><w:t>__________________________________</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/><w:color w:val="0F172A"/></w:rPr><w:t>COMANDO ESTRATÉGICO MIGATO</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr><w:r><w:rPr><w:color w:val="64748B"/><w:sz w:val="17"/></w:rPr><w:t>Equipo Político y Territorial de El Gato Briceño</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="350" w:after="30"/></w:pPr><w:r><w:t>__________________________________</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/><w:color w:val="0F172A"/></w:rPr><w:t>RESPONSABLE TÉCNICO Y DESARROLLO</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr><w:r><w:rPr><w:color w:val="64748B"/><w:sz w:val="17"/></w:rPr><w:t>Equipo de Ingeniería de Sistemas Plataforma MIGATO</w:t></w:r></w:p>
        </w:tc>
      </w:tr>
    </w:tbl>
    """)

    # ENSAMBLAR EL ARCHIVO DOCX CON LA SECCIÓN DE TESIS
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
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1700" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>"""

    with zipfile.ZipFile(filename, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr('[Content_Types].xml', content_types)
        z.writestr('_rels/.rels', rels)
        z.writestr('word/_rels/document.xml.rels', doc_rels)
        z.writestr('word/document.xml', document_xml)
        z.writestr('word/styles.xml', styles)
        z.writestr('word/header1.xml', header1)
        z.writestr('word/header_first.xml', header_first)
        z.writestr('word/footer1.xml', footer1)
        z.writestr('word/footer_first.xml', footer_first)
        if has_logo:
            z.writestr('word/media/logo.png', logo_bytes)

    print(f"[✓] DOCX Tesis generado exitosamente: {filename} ({os.path.getsize(filename)} bytes)")

if __name__ == "__main__":
    out_docx = PROJECT_ROOT / "INFORME_TESIS_PRESUPUESTO_MIGATO_V2.docx"
    build_thesis_docx(out_docx)

def build_thesis_html(filename):
    html_content = """<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>DICTAMEN TÉCNICO Y PRESUPUESTO OPERATIVO • MIGATO MONAGAS</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/png" href="assets/logo-migato.png">
  <style>
    @page {
      size: letter;
      margin: 25mm 20mm 25mm 25mm;
      @top-left {
        content: "REPÚBLICA BOLIVARIANA DE VENEZUELA • ESTADO MONAGAS";
        font-family: Arial, sans-serif;
        font-size: 8pt;
        font-weight: bold;
        color: #0284c7;
      }
      @top-right {
        content: "MOVIMIENTO INDEPENDIENTE GANAMOS TODOS (MIGATO)";
        font-family: Arial, sans-serif;
        font-size: 8pt;
        font-weight: bold;
        color: #0f172a;
      }
      @bottom-left {
        content: "Dictamen Técnico-Estratégico y Presupuesto • Sala de Mando El Gato Briceño";
        font-family: Arial, sans-serif;
        font-size: 8pt;
        font-style: italic;
        color: #64748b;
      }
      @bottom-right {
        content: "Página " counter(page);
        font-family: Arial, sans-serif;
        font-size: 8pt;
        font-weight: bold;
        color: #0f172a;
      }
    }

    @page :first {
      @top-left { content: normal; }
      @top-right { content: normal; }
      @bottom-left { content: normal; }
      @bottom-right { content: normal; }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #0f172a;
      background-color: #f1f5f9;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .no-print-bar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: #0f172a;
      color: white;
      padding: 12px 24px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      border-bottom: 3px solid #0284c7;
    }
    .no-print-bar .title-area {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .no-print-bar .badge {
      background: #0284c7;
      color: white;
      font-size: 10px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 4px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .no-print-bar h1 {
      font-size: 14px;
      font-weight: 800;
      color: #f8fafc;
    }
    .no-print-bar .actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .btn-action {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #0284c7;
      color: white;
      text-decoration: none;
      padding: 8px 16px;
      font-size: 12px;
      font-weight: 700;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-action:hover {
      background: #0369a1;
      transform: translateY(-1px);
    }
    .btn-action.success {
      background: #059669;
    }
    .btn-action.success:hover {
      background: #047857;
    }
    .btn-action.secondary {
      background: #334155;
    }
    .btn-action.secondary:hover {
      background: #475569;
    }

    .paper-container {
      max-width: 216mm;
      margin: 28px auto;
      background: white;
      padding: 25mm 20mm 25mm 25mm;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      border-radius: 4px;
    }

    /* ENCABEZADO Y PIE DE PÁGINA EN PANTALLA */
    .running-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0284c7;
      padding-bottom: 6px;
      margin-bottom: 28px;
      font-size: 8.5pt;
      color: #0284c7;
      font-weight: bold;
      text-transform: uppercase;
    }
    .running-header span:last-child {
      color: #0f172a;
    }

    .running-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #cbd5e1;
      padding-top: 8px;
      margin-top: 35px;
      font-size: 8.5pt;
      color: #64748b;
      font-style: italic;
    }

    .portada {
      text-align: center;
      min-height: 85vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding-bottom: 40px;
      page-break-after: always;
    }

    .portada-header {
      font-weight: 700;
      font-size: 13pt;
      line-height: 1.4;
      color: #0f172a;
      text-transform: uppercase;
      border-bottom: 2px solid #0284c7;
      padding-bottom: 15px;
    }

    .logo-container {
      margin: 30px auto;
    }
    .logo-container img {
      width: 140px;
      height: 140px;
      object-fit: contain;
    }

    .portada-title {
      font-size: 16pt;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.35;
      margin: 18px 0;
      text-transform: uppercase;
    }
    .portada-subtitle {
      font-size: 12.5pt;
      color: #0284c7;
      font-weight: 600;
      font-style: italic;
      margin-bottom: 22px;
      line-height: 1.4;
    }

    .portada-footer {
      font-size: 11pt;
      color: #475569;
      line-height: 1.6;
      border-top: 1px solid #cbd5e1;
      padding-top: 15px;
    }

    h1 {
      font-size: 14.5pt;
      font-weight: 700;
      color: #0f172a;
      text-transform: uppercase;
      border-bottom: 2px solid #0284c7;
      padding-bottom: 6px;
      margin-top: 32px;
      margin-bottom: 16px;
      page-break-after: avoid;
    }

    h2 {
      font-size: 12.5pt;
      font-weight: 700;
      color: #0284c7;
      margin-top: 24px;
      margin-bottom: 12px;
      page-break-after: avoid;
    }

    p {
      text-align: justify;
      margin-bottom: 14px;
      font-size: 11.5pt;
      color: #1e293b;
    }

    .callout-box {
      background: #f0f9ff;
      border-left: 5px solid #0284c7;
      border-top: 1px solid #bae6fd;
      border-right: 1px solid #bae6fd;
      border-bottom: 1px solid #bae6fd;
      padding: 14px 18px;
      margin: 20px 0;
      font-size: 11pt;
      font-style: italic;
      color: #0369a1;
      border-radius: 0 4px 4px 0;
    }

    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 10pt;
      page-break-inside: avoid;
    }
    table.data-table th {
      background-color: #0f172a;
      color: white;
      text-align: left;
      padding: 9px 12px;
      font-weight: bold;
      border: 1px solid #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    table.data-table td {
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      color: #1e293b;
    }
    table.data-table tr:nth-child(even) td {
      background-color: #f8fafc;
    }
    table.data-table tr.total-row td {
      background-color: #f0f9ff;
      font-weight: bold;
      border-top: 2px solid #0284c7;
      color: #0284c7;
      font-size: 10.5pt;
    }

    .signatures-grid {
      display: flex;
      justify-content: space-between;
      gap: 40px;
      margin-top: 50px;
      page-break-inside: avoid;
    }
    .sig-block {
      flex: 1;
      text-align: center;
    }
    .sig-line {
      border-top: 1.5px solid #0f172a;
      padding-top: 8px;
      font-weight: bold;
      font-size: 10.5pt;
      color: #0f172a;
    }
    .sig-sub {
      font-size: 8.5pt;
      color: #64748b;
      margin-top: 2px;
    }

    @media print {
      .no-print-bar {
        display: none !important;
      }
      body {
        background-color: white !important;
      }
      .paper-container {
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        max-width: 100% !important;
      }
      .running-header, .running-footer {
        display: none !important;
      }
    }
  </style>
</head>
<body>

  <!-- BARRA DE CONTROL SUPERIOR -->
  <div class="no-print-bar">
    <div class="title-area">
      <span class="badge">DICTAMEN TÉCNICO OFICIAL</span>
      <h1>Plataforma Territorial MIGATO • Dictamen y Presupuesto Mínimo Operativo</h1>
    </div>
    <div class="actions">
      <button class="btn-action success" onclick="window.print()">
        <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/><path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"/></svg>
        Imprimir / Guardar PDF
      </button>
      <a class="btn-action" href="INFORME_TESIS_PRESUPUESTO_MIGATO_V2.docx" download>
        <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/></svg>
        Descargar Word (.docx)
      </a>
      <a class="btn-action secondary" href="https://docs.google.com/document/d/14w06CGT_yEYZKOV_wWUNEpuF3lJL4LRp_yBDTSqgw6k/edit?usp=drivesdk" target="_blank">
        <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M14 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM4 4h8v2H4V4zm8 4H4V7h8v1zm-4 3H4v-1h4v1z"/></svg>
        Ver en Google Docs
      </a>
      <a class="btn-action secondary" href="presentacion.html">
        <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8.5v1.5H10a.5.5 0 0 1 0 1H6a.5.5 0 0 1 0-1h1.5V14H2a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2z"/></svg>
        Presentación Diapositivas
      </a>
      <a class="btn-action secondary" href="index.html">
        Portal MIGATO
      </a>
    </div>
  </div>

  <div class="paper-container">

    <!-- PORTADA UNIVERSITARIA SOLEMNE -->
    <div class="portada">
      <div class="portada-header">
        REPÚBLICA BOLIVARIANA DE VENEZUELA<br>
        <span style="color: #0284c7;">MOVIMIENTO INDEPENDIENTE GANAMOS TODOS (MIGATO)</span><br>
        <span style="font-size: 10.5pt; color: #475569;">DIRECCIÓN GENERAL DE ESTRATEGIA Y SALA SITUACIONAL REGIONAL</span>
      </div>

      <div class="logo-container">
        <img src="assets/logo-migato.png" alt="Logo Oficial MIGATO" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'140\' height=\'140\'><rect width=\'140\' height=\'140\' fill=\'%230284c7\'/><text x=\'70\' y=\'80\' fill=\'%23fff\' font-size=\'22\' font-weight=\'bold\' text-anchor=\'middle\'>MIGATO</text></svg>'">
      </div>

      <div>
        <div class="portada-title">
          DICTAMEN TÉCNICO-ESTRATÉGICO Y ESTUDIO DE FACTIBILIDAD: ARQUITECTURA DE INTELIGENCIA TERRITORIAL, BLINDAJE CIBERNÉTICO Y PRESUPUESTO MÍNIMO OPERATIVO
        </div>
        <div class="portada-subtitle">
          Manual Doctrinal, Evaluación de los Cinco Módulos de Mando Táctico y Protocolo de Pruebas de Hacking Ético en Servidor VPS Soberano
        </div>
      </div>

      <div class="portada-footer">
        <strong>Comando de Campaña y Dirección Estratégica</strong><br>
        Bajo el Liderazgo Político y Gerencial de José Gregorio "El Gato" Briceño<br>
        Maturín, Estado Monagas • Septiembre de 2026
      </div>
    </div>

    <!-- ENCABEZADO DE PÁGINA VISIBLE EN PANTALLA -->
    <div class="running-header">
      <span>REPÚBLICA BOLIVARIANA DE VENEZUELA • ESTADO MONAGAS</span>
      <span>MOVIMIENTO INDEPENDIENTE GANAMOS TODOS (MIGATO)</span>
    </div>

    <!-- RESUMEN EJECUTIVO (ABSTRACT) -->
    <h1>RESUMEN EJECUTIVO (ABSTRACT INSTITUCIONAL Y FINANCIERO)</h1>
    <p>
      El presente dictamen formaliza la evaluación técnico-operativa y el estudio de factibilidad financiera para el despliegue soberano de la Plataforma Territorial MIGATO en el Estado Monagas. Concebida bajo la doctrina gerencial de libre mercado y eficiencia privada liderada por José Gregorio "El Gato" Briceño, la herramienta le otorga al movimiento el control estratégico absoluto de la información territorial y electoral en tiempo real, erradicando la improvisación, el espionaje y la dispersión en grupos vulnerables de mensajería.
    </p>
    <p>
      A diferencia de la administración pública oficialista que colapsó los servicios del estado y somete a la ciudadanía mediante censos de extorsión, MIGATO articula cinco módulos complementarios (Despacho Celular Seguro, Censo con Protocolo de Buzón Ciego de Cero Residuos, Auditoría Electoral CNE con Validación QR en 2 Segundos, Cartografía Satelital 3D con Atenuación Velo Blanco y Auditoría de la Red Asistencial de 84 Centros de Salud).
    </p>
    <p>
      Se somete a consideración del Comando Estratégico la aprobación de un <strong>presupuesto mínimo indispensable de arranque de ~$24.50 USD mensuales ($294.00 USD anuales)</strong> destinado exclusivamente a la contratación de un Servidor Virtual Privado (VPS) soberano y un Dominio Institucional Oficial con cifrado SSL de 256 bits. Dicha infraestructura permitirá realizar pruebas de estrés de concurrencia y ejecutar tests de penetración y hacking ético para blindar la base de datos frente a adversarios antes de la incorporación masiva de la estructura de base.
    </p>

    <div class="callout-box">
      «La reconstrucción de Monagas exige rigor gerencial, datos fidedignos e inexpugnabilidad tecnológica. Cada voto y cada comunidad deben defenderse con pruebas matemáticas en la mano.» — Comando Estratégico MIGATO.
    </div>

    <!-- CAPÍTULO I -->
    <h1>CAPÍTULO I: MARCO DOCTRINAL Y GOBERNANZA CAPITALISTA DE EL GATO BRICEÑO</h1>
    <h2>1. Ruptura con el Estatismo y el Clientelismo Centralista</h2>
    <p>
      Durante las últimas décadas, el modelo estatista y burocrático destruyó el aparato productivo y los servicios públicos del Estado Monagas. Hospitales sin insumos ni plantas de emergencia, acueductos paralizados, vialidad agrícola intransitable y apagones permanentes son el saldo de una gestión sustentada en la demagogia y la ineficiencia.
    </p>
    <p>
      El Movimiento Independiente Ganamos Todos (MIGATO), enraizado en la memoria de orden, grandes obras de infraestructura y probada solvencia gerencial del gobierno de El Gato Briceño, plantea un modelo diametralmente opuesto: supremacía del mérito técnico, defensa irrestricta de la iniciativa privada, transparencia contable y soberanía tecnológica. Esta plataforma es el instrumento operativo para demostrar que Monagas puede ser gobernada con estándares corporativos de primer mundo.
    </p>

    <h2>2. Soberanía de Datos y Protección Contra Persecución</h2>
    <p>
      En un entorno político hostil, la seguridad de la información es una premisa innegociable. La plataforma MIGATO se diseñó para operar con protocolos forenses que disocian la información de las personas. La dirigencia de base, los testigos electorales y los profesionales de la salud trabajan bajo un escudo criptográfico que neutraliza cualquier intento de amedrentamiento o confiscación en alcabalas.
    </p>

    <!-- CAPÍTULO II -->
    <h1>CAPÍTULO II: ARQUITECTURA TÉCNICA DE LOS CINCO MÓDULOS DE MANDO TÁCTICO</h1>
    
    <h2>1. Módulo 1: Despacho Celular Seguro (/despacho/)</h2>
    <p>
      Resuelve el problema histórico del "teléfono roto" y la filtración de contraseñas. El director de la Sala Situacional pulsa el botón correspondiente a cualquiera de las 44 parroquias de Monagas y el sistema genera automáticamente un enlace encriptado con token individual directo al WhatsApp del coordinador territorial.
    </p>
    <p>
      <strong>Blindaje Operativo:</strong> El coordinador opera en su jurisdicción sin comprometer las demás parroquias. Si se releva a un cuadro parroquial, su acceso se revoca en 2 segundos sin alterar la configuración del servidor ni afectar a los restantes coordinadores.
    </p>

    <h2>2. Módulo 2: Censo Territorial y Protocolo Forense de Buzón Ciego (/carga/)</h2>
    <p>
      Herramienta ligera para el levantamiento cuantitativo de viviendas, familias, votantes seguros y fallas de servicios (agua, transformadores, vialidad). Implementa el Protocolo de Buzón Ciego (Zero-Byte Memory): al pulsar "Registrar y Enviar", la memoria del teléfono celular se borra automáticamente.
    </p>
    <p>
      <strong>Seguridad de Base:</strong> Si un activista es interceptado por organismos de seguridad, el dispositivo móvil no contiene ningún registro ni lista incautable. La información viaja encriptada directamente al repositorio central del Comando.
    </p>

    <h2>3. Módulo 3: Padrón Electoral, Tablilla CNE y Validación de Actas QR (/centros-maturin/)</h2>
    <p>
      Georreferenciación milimétrica de las 175 escuelas electorales de Maturín y 419.000 electores categorizados bajo semáforo independiente (Voto Duro leal, Voto Blando persuasible y Voto Joven).
    </p>
    <p>
      <strong>Auditoría Irrefutable:</strong> Incorpora el Escáner de Códigos QR de Actas Oficiales del CNE: el testigo escanea el comprobante impreso por la máquina de votación y el sistema decodifica y totaliza el acta en 2 segundos. Permite a El Gato Briceño tener el conteo paralelo definitivo antes de que el oficialismo intente manipular la transmisión.
    </p>

    <h2>4. Módulo 4: Cartografía Táctica Satelital 3D y Efecto Velo Blanco (/earth-monagas/)</h2>
    <p>
      Consola tridimensional de alta definición construida sobre MapLibre 3D. Diseñada específicamente para optimizar la toma de decisiones de El Gato Briceño y su Estado Mayor, evitando la sobrecarga visual.
    </p>
    <p>
      <strong>Focalización Táctica:</strong> El algoritmo de "Velo Blanco" cubre con niebla suave los municipios y parroquias periféricas, iluminando únicamente el territorio bajo análisis. Permite planificar rutas de movilización, monitorear la logística de testigos y calcular tiempos de traslado al segundo.
    </p>

    <h2>5. Módulo 5: Red Hospitalaria y Auditoría de Servicios Asistenciales (/salud-monagas/)</h2>
    <p>
      Monitoreo en tiempo real de los 84 centros asistenciales de Monagas (Hospital Universitario Dr. Manuel Núñez Tovar, ambulatorios urbanos tipo II/III y CDIs).
    </p>
    <p>
      <strong>Semáforo de Soporte Vital:</strong> Supervisa cinco variables críticas de supervivencia: operatividad de plantas eléctricas, suministro continuo de agua, gases medicinales, quirófanos activos y camas disponibles. Permite documentar técnica y jurídicamente la crisis asistencial, ofreciendo propuestas gerenciales inmediatas y desmontando la propaganda del régimen con datos irrefutables.
    </p>

    <!-- CAPÍTULO III -->
    <h1>CAPÍTULO III: CIBERSEGURIDAD, DEFENSAS ACTIVAS Y PROTOCOLO DE HACKING ÉTICO</h1>
    <h2>1. Necesidad Imperativa de un Servidor VPS Dedicado Soberano</h2>
    <p>
      La dependencia de plataformas gratuitas o servidores compartidos constituye un riesgo de seguridad inaceptable: están sujetas a suspensión arbitraria, no soportan tráfico masivo concurrente el día de las elecciones y exponen los datos a vulnerabilidades ajenas.
    </p>
    <p>
      Un Servidor Cloud VPS Dedicado garantiza soberanía técnica: cortafuegos configurado a la medida, aislamiento de bases de datos, copias de respaldo automatizadas fuera de línea y ancho de banda garantizado para soportar miles de conexiones simultáneas sin caídas.
    </p>

    <h2>2. Protocolo de Pentesting y Pruebas de Resistencia al Ataque</h2>
    <p>
      Antes de abrir la plataforma a la totalidad de la estructura de base, el equipo técnico someterá el servidor a simulaciones controladas de intrusión (Pentesting Ético): escaneo de puertos vulnerables, pruebas de inyección SQL, simulación de ataques de denegación distribuida de servicio (DDoS) y auditoría de certificados SSL.
    </p>
    <p>
      <strong>Cero Brechas:</strong> El objetivo es garantizar que ningún actor malicioso u organismo de contrainteligencia pueda hackear el sistema, ralentizar el despacho de órdenes o vulnerar la confidencialidad de la militancia independiente.
    </p>

    <!-- CAPÍTULO IV -->
    <h1>CAPÍTULO IV: ESTUDIO ECONÓMICO Y PRESUPUESTO MÍNIMO OPERATIVO</h1>
    <h2>1. Desglose del Presupuesto Mínimo de Arranque (Fase 1)</h2>
    <p>
      El presupuesto solicitado representa el costo estricto de los recursos en la nube indispensables para encender los motores y validar la plataforma con tres parroquias piloto (Las Cocuizas, San Simón y Alto de Los Godos):
    </p>

    <table class="data-table">
      <thead>
        <tr>
          <th>Concepto de Infraestructura</th>
          <th>Especificación Técnica Mínima</th>
          <th>Costo Mensual</th>
          <th>Costo Anual Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Servidor Cloud VPS Dedicado</strong></td>
          <td>4 vCPU / 8 GB RAM / 100 GB SSD NVMe / Red 1 Gbps (Anti-DDoS)</td>
          <td>$20.00 USD</td>
          <td>$240.00 USD</td>
        </tr>
        <tr>
          <td><strong>Dominio Institucional Oficial</strong></td>
          <td>Registro anual + Certificado SSL Wildcard (HTTPS 256 bits)</td>
          <td>$1.50 USD</td>
          <td>$18.00 USD</td>
        </tr>
        <tr>
          <td><strong>IP Pública Fija Dedicada</strong></td>
          <td>Dirección IP exclusiva para firewall y Sala de Mando</td>
          <td>$3.00 USD</td>
          <td>$36.00 USD</td>
        </tr>
        <tr>
          <td><strong>Software de Pentesting y Blindaje</strong></td>
          <td>Herramientas FOSS de hacking ético, Fail2ban e iptables</td>
          <td>$0.00 (Libre)</td>
          <td>$0.00 (Incluido)</td>
        </tr>
        <tr class="total-row">
          <td colspan="2">TOTAL MÍNIMO SOLICITADO (FASE 1)</td>
          <td>~$24.50 USD / mes</td>
          <td>$294.00 USD / AÑO</td>
        </tr>
      </tbody>
    </table>

    <div class="callout-box">
      «ANÁLISIS DE RETORNO DE INVERSIÓN: En el mercado privado corporativo, el desarrollo desde cero de una plataforma integrada de 5 módulos supera los $25.000 USD. El desarrollo técnico ya fue donado al equipo de El Gato Briceño sin costo alguno. La aprobación de $294 USD anuales cubre el 100% de la infraestructura tecnológica requerida.»
    </div>

    <h2>2. Planificación por Fases: Fase 1 (Digital) vs. Fase 2 (Física)</h2>
    <p>
      <strong>FASE 1 (Inmediata - Objeto de esta solicitud):</strong> Contratación del VPS, configuración de dominios, despliegue de cortafuegos, test de hacking ético y prueba de estrés con coordinadores de campo. Inversión: $294.00 USD.
    </p>
    <p>
      <strong>FASE 2 (Consolidación - A mediano plazo según disponga el Comando):</strong> Equipamiento de la Sala Situacional física de El Gato Briceño: 2 a 3 computadoras de escritorio, pantallas de 55 pulgadas para videowall, sistema de respaldo eléctrico con inversores de corriente y baterías UPS para operar sin interrupciones durante los apagones de Corpoelec, y enlace satelital de respaldo. Su ejecución se programará una vez concluida exitosamente la Fase 1.
    </p>

    <!-- CAPÍTULO V -->
    <h1>CAPÍTULO V: CONCLUSIONES, DICTAMEN TÉCNICO Y FIRMAS</h1>
    <p>
      <strong>1. Viabilidad Técnica Plena:</strong> Los cinco módulos de la plataforma MIGATO se encuentran programados, probados y plenamente funcionales.
    </p>
    <p>
      <strong>2. Seguridad Inexpugnable:</strong> El protocolo de Buzón Ciego de Cero Bytes y la validación de actas QR blindan la integridad de la militancia y la defensa matemática del voto.
    </p>
    <p>
      <strong>3. Eficiencia de Costos Sobresaliente:</strong> Un costo operativo de menos de $25 dólares al mes representa una relación costo-beneficio inigualable para la conducción política regional.
    </p>
    <p>
      <strong>DICTAMEN FINAL:</strong> Se recomienda al Comando Estratégico la inmediata aprobación y desembolso del monto de $294.00 USD para la contratación de la infraestructura cloud de la Fase 1.
    </p>

    <div class="signatures-grid">
      <div class="sig-block">
        <div class="sig-line">COMANDO ESTRATÉGICO MIGATO</div>
        <div class="sig-sub">
          Equipo Político y Territorial de El Gato Briceño<br>
          Movimiento Independiente Ganamos Todos • Monagas
        </div>
      </div>
      <div class="sig-block">
        <div class="sig-line">RESPONSABLE TÉCNICO Y DESARROLLO</div>
        <div class="sig-sub">
          Equipo de Ingeniería de Sistemas Plataforma MIGATO<br>
          Eficiencia Gerencial, Tecnología y Control Territorial
        </div>
      </div>
    </div>

    <!-- PIE DE PÁGINA VISIBLE EN PANTALLA -->
    <div class="running-footer">
      <span>Dictamen Técnico-Estratégico y Presupuesto • Sala de Mando El Gato Briceño</span>
      <span>Página 1 de 1</span>
    </div>

  </div>

</body>
</html>
"""
    with open(filename, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"[✓] HTML Tesis generado exitosamente: {filename} ({os.path.getsize(filename)} bytes)")

if __name__ == "__main__":
    out_docx = PROJECT_ROOT / "INFORME_TESIS_PRESUPUESTO_MIGATO_V2.docx"
    build_thesis_docx(out_docx)
    out_html = PROJECT_ROOT / "INFORME_TESIS_PRESUPUESTO_MIGATO_V2.html"
    build_thesis_html(out_html)
