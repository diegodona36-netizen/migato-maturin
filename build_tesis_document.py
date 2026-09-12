#!/usr/bin/env python3
"""
Generador de Documento Institucional Tipo Tesis / Formato de Gobierno (v2 Corregida)
MIGATO Monagas 2026
Estándar:
- Portada 100% limpia (SIN cabecera ni pie de página, norma UPEL / Gobierno).
- Cabecera formal en páginas interiores:
  Izquierda: REPÚBLICA BOLIVARIANA DE VENEZUELA • ESTADO MONAGAS
  Derecha:   SISTEMA TERRITORIAL MIGATO 2026
  Línea de división inferior azul institucional.
- Pie de página formal en páginas interiores:
  Izquierda: Dictamen Técnico y Operativo • Sala de Mando Territorial
  Derecha:   Página X de Y (campo dinámico)
  Línea de división superior sutil.
- Tipografía: Arial 12pt, Interlineado 1.5, Justificado completo.
- Emblema oficial en portada.
"""

import os
import sys
import json
import zipfile
import html
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent
LOGO_PATH = PROJECT_ROOT / "assets" / "logo-migato.png"

def escape(text):
    return html.escape(str(text))

# ---------------------------------------------------------
# 1. GENERADOR DOCX PROFESIONAL (ESTÁNDAR GOBIERNO / TESIS)
# ---------------------------------------------------------

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
      <w:color w:val="1E3A8A"/>
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
      <w:color w:val="0284C7"/>
      <w:sz w:val="24"/>
    </w:rPr>
  </w:style>
</w:styles>"""

    # CABECERA PORTADA (VACÍA)
    header_first = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p/></w:hdr>"""

    # PIE DE PÁGINA PORTADA (VACÍO)
    footer_first = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p/></w:ftr>"""

    # CABECERA INTERIOR FORMAL (TABLA DE 2 COLUMNAS CON BORDE INFERIOR AZUL)
    header1 = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:tbl>
    <w:tblPr>
      <w:tblW w:w="5000" w:type="pct"/>
      <w:tblBorders>
        <w:top w:val="none"/>
        <w:left w:val="none"/>
        <w:bottom w:val="single" w:sz="8" w:space="6" w:color="1E3A8A"/>
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
            <w:rPr><w:rFonts w:ascii="Arial"/><w:sz w:val="17"/><w:color w:val="1E3A8A"/><w:b/></w:rPr>
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
            <w:t>SISTEMA TERRITORIAL MIGATO 2026</w:t>
          </w:r>
        </w:p>
      </w:tc>
    </w:tr>
  </w:tbl>
</w:hdr>"""

    # PIE DE PÁGINA INTERIOR FORMAL (TABLA CON BORDE SUPERIOR Y NÚMERO DE PÁGINA DINÁMICO)
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
            <w:t>Dictamen Técnico y Operativo • Sala de Mando Territorial (Confidencial)</w:t>
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

    # PORTADA FORMAL (SIN CABECERA/PIE)
    body.append("""
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:before="100" w:after="40"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="0F172A"/></w:rPr><w:t>REPÚBLICA BOLIVARIANA DE VENEZUELA</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="40"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="1E3A8A"/></w:rPr><w:t>MOVIMIENTO INDEPENDIENTE GANAMOS TODOS (MIGATO)</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="200"/></w:pPr>
      <w:r><w:rPr><w:sz w:val="20"/><w:color w:val="475569"/></w:rPr><w:t>DIRECCIÓN GENERAL DE ESTRATEGIA Y SALA SITUACIONAL REGIONAL</w:t></w:r>
    </w:p>
    """)

    if has_logo:
        body.append("""
        <w:p>
          <w:pPr><w:jc w:val="center"/><w:spacing w:before="180" w:after="240"/></w:pPr>
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
      <w:pPr><w:jc w:val="center"/><w:spacing w:before="240" w:after="80"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="32"/><w:color w:val="0F172A"/></w:rPr><w:t>DICTAMEN TÉCNICO Y OPERATIVO: ARQUITECTURA DE INTELIGENCIA TERRITORIAL, SISTEMAS DE INFORMACIÓN GEOGRÁFICA Y DEFENSA DEL VOTO</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="300"/></w:pPr>
      <w:r><w:rPr><w:i/><w:sz w:val="24"/><w:color w:val="1E3A8A"/></w:rPr><w:t>Manual Doctrinal y Casos Prácticos de los Cuatro Módulos de Mando Táctico para el Estado Monagas</w:t></w:r>
    </w:p>

    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:before="500" w:after="30"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="334155"/></w:rPr><w:t>Comando de Campaña y Coordinación General</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="30"/></w:pPr>
      <w:r><w:rPr><w:sz w:val="20"/><w:color w:val="64748B"/></w:rPr><w:t>Bajo el Liderazgo Histórico de José Gregorio "El Gato" Briceño</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="300"/></w:pPr>
      <w:r><w:rPr><w:sz w:val="20"/><w:color w:val="64748B"/></w:rPr><w:t>Maturín, Estado Monagas • Septiembre de 2026</w:t></w:r>
    </w:p>
    <w:p><w:r><w:br w:type="page"/></w:r></w:p>
    """)

    def add_p(text, bold_prefix="", italic=False):
        return f"""
        <w:p>
          <w:pPr><w:jc w:val="both"/><w:spacing w:line="360" w:after="140"/></w:pPr>
          {f'<w:r><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="1E3A8A"/></w:rPr><w:t xml:space="preserve">{escape(bold_prefix)} </w:t></w:r>' if bold_prefix else ''}
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
            <w:pBdr><w:left w:val="single" w:sz="24" w:space="14" w:color="1E3A8A"/></w:pBdr>
            <w:shd w:val="clear" w:color="auto" w:fill="F8FAFC"/>
            <w:spacing w:line="360" w:before="120" w:after="140"/>
            <w:jc w:val="both"/>
          </w:pPr>
          <w:r><w:rPr><w:i/><w:sz w:val="22"/><w:color w:val="0F172A"/></w:rPr><w:t>{escape(text)}</w:t></w:r>
        </w:p>"""

    def add_table(headers, rows):
        t = ['<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders><w:top w:val="single" w:sz="8" w:color="1E3A8A"/><w:bottom w:val="single" w:sz="8" w:color="1E3A8A"/><w:insideH w:val="single" w:sz="4" w:color="E2E8F0"/></w:tblBorders></w:tblPr>']
        t.append('<w:tr><w:trPr><w:tblHeader/></w:trPr>')
        for h in headers:
            t.append(f'<w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="0F172A"/></w:tcPr><w:p><w:pPr><w:spacing w:before="80" w:after="80"/><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="20"/></w:rPr><w:t>{escape(h)}</w:t></w:r></w:p></w:tc>')
        t.append('</w:tr>')
        for r in rows:
            t.append('<w:tr>')
            for cell in r:
                t.append(f'<w:tc><w:p><w:pPr><w:spacing w:before="60" w:after="60"/><w:jc w:val="left"/></w:pPr><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t>{escape(cell)}</w:t></w:r></w:p></w:tc>')
            t.append('</w:tr>')
        t.append('</w:tbl>')
        return "".join(t)

    # CAPÍTULOS
    body.append(add_h1("RESUMEN EJECUTIVO (ABSTRACT INSTITUCIONAL)"))
    body.append(add_p("El presente dictamen técnico y estratégico formaliza la estructura operativa de la Plataforma Territorial MIGATO en el Estado Monagas. Diseñada bajo rigurosos criterios de soberanía de datos, descentralización y eficiencia institucional, la plataforma constituye el núcleo tecnológico del Movimiento Independiente Ganamos Todos para articular la maquinaria de campo, levantar el censo sectorial de necesidades ciudadanas y blindar de forma inexpugnable los 175 centros de votación y 361 mesas del Municipio Maturín."))
    body.append(add_p("Frente a los modelos de control social estatista y centralismo asfixiante, este sistema se fundamenta en principios republicanos, defensa de la propiedad privada y libertad individual. Mediante cuatro módulos autónomos pero estrechamente integrados (Despacho Celular, Censo Sectorial en Cascada, Auditoría Electoral CNE con Actas QR y Cartografía Satelital 3D), la organización política pasa de una conducción reactiva a una conducción científica del territorio."))

    body.append(add_callout("«La defensa del territorio y la recuperación de Monagas no se logran con consignas huecas, sino con orden, datos verificables en el terreno, respeto a las comunidades y control milimétrico de cada acta electoral.» — Dirección Política Regional."))

    body.append(add_h1("CAPÍTULO I: MARCO DOCTRINAL Y GOBERNANZA TERRITORIAL"))
    body.append(add_p("Durante las últimas décadas, la administración pública regional en el Estado Monagas fue desmantelada por estructuras burocráticas ineficientes y clientelares que destruyeron los servicios básicos: acueductos colapsados, apagones sistemáticos, vialidad agrícola abandonada y ambulatorios inoperativos. Dicho deterioro vino acompañado del uso de censos con fines de extorsión política y persecución ciudadana."))
    body.append(add_p("El Movimiento MIGATO, respaldado en la trayectoria de orden, obras tangibles y probada capacidad de gobierno del liderazgo de José Gregorio 'El Gato' Briceño, establece a través de esta plataforma una ruptura definitiva con ese esquema: sustituye la retórica ideológica por ingeniería de datos, protección irrestricta a la identidad del ciudadano y planificación rigurosa para la reconstrucción económica de Monagas."))

    body.append(add_h1("CAPÍTULO II: MÓDULO 1 — DESPACHO DE ENLACES PARROQUIALES"))
    body.append(add_h2("1. Fundamentación Técnica y Arquitectura de Mando"))
    body.append(add_p("El Módulo de Despacho de Enlaces Parroquiales (WhatsApp Dispatch Console) resuelve el principal cuello de botella de las organizaciones políticas: la dispersión y distorsión de las directrices a través de cadenas informales de mensajería. El sistema actúa como un despachador unificado que genera enlaces encriptados y mensajes de acreditación oficial para cada coordinador territorial."))
    body.append(add_p("El enlace no requiere instalar aplicaciones pesadas ni configuraciones complejas que comprometan la memoria o seguridad de su teléfono. Al pulsar el enlace, se abre de inmediato su consola de trabajo en el navegador móvil y su canal directo con la Sala de Mando Central."))

    body.append(add_h2("2. Caso Práctico de Aplicación Operativa"))
    body.append(add_p("Escenario de Despliegue Inmediato:", bold_prefix="EJEMPLO REAL:"))
    body.append(add_p("Viernes, 08:30 hrs. Se reporta la paralización de las bombas de la Planta Potabilizadora del Bajo Guarapiche, dejando sin suministro de agua potable al 70% de la Parroquia San Simón y sectores críticos de Alto de Los Godos. La Sala Situacional requiere en menos de 15 minutos conocer los puntos de mayor vulnerabilidad comunitaria para coordinar apoyo y fijar posición pública."))
    body.append(add_p("El Director Operativo ingresa al Módulo 1 en https://migato-maturin.vercel.app/despacho/, selecciona simultáneamente 'San Simón' y 'Alto de Los Godos', y hace clic en 'Despachar a Coordinadores'. De manera instantánea, los 2 enlaces parroquiales reciben en sus teléfonos móviles su comunicado oficial con enlace seguro a la consola móvil."))
    body.append(add_p("A las 08:42 hrs (12 minutos después), ambos enlaces cargaron los reportes consolidados: 14 centros de salud afectados, 6 escuelas sin reservorio y 4 pozos profundos inoperativos en el Eje La Puente. El comando regional cuenta con el diagnóstico en mano antes de que el oficialismo emita un boletín."))

    body.append(add_h1("CAPÍTULO III: MÓDULO 2 — CENSO SECTORIAL Y BUZÓN CIEGO"))
    body.append(add_h2("1. Metodología de Censo y Protección Contra Persecución"))
    body.append(add_p("El Censo Sectorial es la columna de inteligencia social del sistema. A diferencia de los registros estatales que fichan al ciudadano para amenazarlo con programas de alimentos o despidos, la plataforma MIGATO implementa el Protocolo de Buzón Ciego. Toda la información de campo se procesa a nivel cuantitativo agregado por sector, resguardando la identidad individual de las familias encuestadas."))
    body.append(add_p("El sistema cuenta con un motor de almacenamiento local (Local Offline Cache) que garantiza operatividad continua: si el coordinador está en una comunidad sin cobertura celular o en medio de un apagón, los datos se almacenan localmente en el dispositivo y se sincronizan de forma transparente apenas detecta señal."))

    body.append(add_h2("2. Caso Práctico de Aplicación Operativa"))
    body.append(add_p("Levantamiento Territorial en el Eje La Puente (Parroquia Alto de Los Godos):", bold_prefix="EJEMPLO REAL:"))
    body.append(add_p("El equipo territorial de MIGATO se despliega en los sectores 'La Puente Sector Central', 'Rómulo Gallegos', 'Valle Real' y 'El Rosillo'. Cada encuestador accede a su consola (https://migato-maturin.vercel.app/carga/?p=alto-de-los-godos). A medida que recorren las calles, registran: 1.250 viviendas censadas, 4.800 habitantes, 2.920 electores potenciales, 3 transformadores eléctricos quemados y 1 pozo de agua fuera de servicio."))
    body.append(add_p("Ningún nombre propio de votante vulnerable queda registrado en listas públicas. Los datos alimentan en tiempo real el Tablero de Campaña (https://migato-maturin.vercel.app/dashboard-campana/), generando una alerta roja por 'Colapso Crítico de Agua y Electricidad en Sub-Parroquia 6'. Con base en esta cifra exacta, el plan de reconstrucción regional asigna el presupuesto exacto para reactivar la estación de bombeo de La Puente."))

    body.append(add_h1("CAPÍTULO IV: MÓDULO 3 — TABLILLA ELECTORAL Y ACTAS QR DEL CNE"))
    body.append(add_h2("1. Blindaje Electoral de los 175 Centros de Maturín"))
    body.append(add_p("El Módulo 3 constituye el escudo legal y matemático para asegurar la victoria electoral. Contiene el universo georreferenciado de los 175 centros de votación y 361 mesas del Municipio Maturín (con 318.601 electores registrados), asignando a cada centro sus coordinadores, testigos principales, suplentes y movilizadores."))
    body.append(add_p("La herramienta integra el Protocolo de Validación Rápida de Actas QR: las máquinas electorales del CNE imprimen al cierre de mesa un comprobante físico con un código QR que codifica la totalización de votos. El testigo de MIGATO escanea y fotografía el código desde su teléfono, transmitiendo los datos al servidor en menos de 4 minutos, antes de que el acta física sea retirada del aula de votación."))

    body.append(add_h2("2. Caso Práctico de Aplicación Operativa"))
    body.append(add_p("Defensa del Voto en el Centro de Votación Escuela Básica 'Alberto Ravell' (Código CNE: 160101004):", bold_prefix="EJEMPLO REAL:"))
    body.append(add_p("Día de la Elección, 18:00 hrs. Concluye el acto de votación en la Mesa 1 de la E.B. Alberto Ravell (Parroquia San Simón, 785 electores en mesa, 590 votantes efectivos). La máquina electoral emite el acta de escrutinio impresa. A las 18:04 hrs, el testigo acreditado de MIGATO abre https://migato-maturin.vercel.app/centros-maturin/, pulsa 'Escanear Acta QR', captura la imagen y el sistema decodifica matemáticamente los votos de la mesa."))
    body.append(add_p("A las 18:06 hrs, la Sala Situacional Central de MIGATO ya tiene totalizada la Mesa 1 en su Tablilla Electoral en vivo: 442 votos para la candidatura de la unidad democrática frente a 138 de la opción oficialista. El resultado queda blindado con respaldo criptográfico y fotográfico antes de que se desconecte la máquina o se intente cualquier alteración en el traslado físico."))

    body.append(add_h1("CAPÍTULO V: MÓDULO 4 — CARTOGRAFÍA SATELITAL TÁCTICA 3D"))
    body.append(add_h2("1. Visor Geoespacial y Análisis de Redes Viales"))
    body.append(add_p("El Módulo 4 traslada la inteligencia electoral a la dimensión espacial tridimensional. Construido sobre un motor geoespacial de alta definición (disponible en https://migato-maturin.vercel.app/earth-monagas/), permite visualizar la geografía monaguense con capas de densidad poblacional, ubicación milimétrica de centros de votación, infraestructura de servicios y vías de comunicación."))
    body.append(add_p("Permite eliminar la improvisación logística el día de los comicios: calcula rutas de acceso, distancias kilométricas, tiempos de traslado y corredores viales para la movilización de testigos y asistencia logística."))

    body.append(add_h2("2. Caso Práctico de Aplicación Operativa"))
    body.append(add_p("Operación Logística en el Eje Suburbano-Petrolero El Furrial - Jusepín:", bold_prefix="EJEMPLO REAL:"))
    body.append(add_p("Para cubrir los 14 centros electorales dispersos entre El Furrial y Jusepín, la Sala de Transporte activa en el satélite la capa de centros y cuadrantes viales. El sistema calcula que el tiempo de respuesta desde la base de apoyo en Maturín es de 42 minutos por la Carretera Nacional, pero identifica un punto de contingencia por fallas de drenaje en el Puente de Guanipa."))
    body.append(add_p("El comando reasigna las unidades motorizadas por la vía alterna de La Toscana, asegurando la entrega de alimentos y refrigerios a los 32 testigos acreditados antes de las 12:00 hrs y garantizando la presencia ininterrumpida en las mesas hasta el conteo final."))

    body.append(add_h1("CAPÍTULO VI: MATRIZ COMPARATIVA DE LOS CUATRO MÓDULOS"))
    body.append(add_p("La siguiente tabla resume los atributos funcionales, entradas, salidas y tiempos de respuesta de cada herramienta del sistema:"))

    headers_matriz = ["Módulo", "Propósito Central", "Entrada de Datos", "Salida Estratégica", "Tiempo de Respuesta"]
    rows_matriz = [
        ["Módulo 1: Despacho WhatsApp", "Línea de mando directa sin intermediarios", "Directorio territorial y credenciales", "Enlaces de acceso WhatsApp directos", "< 2 minutos"],
        ["Módulo 2: Censo Sectorial", "Levantamiento de necesidades ciudadanas", "Reportes de campo (Casas, Votos, Servicios)", "Buzón ciego y métricas de sector", "Tiempo real / Offline"],
        ["Módulo 3: Tablilla y Actas QR", "Defensa y auditoría del voto CNE", "175 Centros y fotos/códigos de actas", "Totalización paralela inexpugnable", "< 4 minutos por mesa"],
        ["Módulo 4: Cartografía Satelital", "Vista geoespacial 3D y logística", "Coordenadas GPS y capas de servicios", "Rutas críticas y análisis de cobertura", "Instantáneo (GPU)"]
    ]
    body.append(add_table(headers_matriz, rows_matriz))

    body.append(add_h1("CAPÍTULO VII: CONCLUSIONES Y DICTAMEN FINAL"))
    body.append(add_p("1. Soberanía y Blindaje Tecnológico: La arquitectura MIGATO demostró que es posible construir una plataforma de nivel estatal con recursos propios, sin depender de software privativo costoso ni de infraestructuras vulnerables al bloqueo estatal."))
    body.append(add_p("2. Enfoque Humano y Sin Clientelismo: El censo sectorial recupera la dignidad del ciudadano monaguense, sustituyendo el chantaje social por un diagnóstico real de los servicios para la reconstrucción económica."))
    body.append(add_p("3. Garantía Irrefutable de la Victoria: La combinación de los 175 centros auditados, la digitalización instantánea de actas QR y el despacho disciplinado de enlaces aseguran que la voluntad del pueblo de Monagas se defenderá y se proclamará con actas en mano."))

    body.append(add_p("Notas Metodológicas:", bold_prefix="REFERENCIAS:"))
    body.append(add_p("1. Protocolo CNE-V26: Registro Electoral Definitivo del Municipio Maturín (318.601 electores distribuidos en 10 parroquias y 175 centros de votación)."))
    body.append(add_p("2. Modelo Criptográfico de Buzón Ciego: Esquema de agregación probabilística que disocia identificadores personales de las variables censadas."))
    body.append(add_p("3. Cartografía Geoespacial OGC: Estándar WGS84 para delimitación de cuadrantes y polígonos de sectores territoriales."))

    # ENSAMBLAR EL ARCHIVO DOCX (CON titlePg PARA PORTADA LIMPIA)
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

    print(f"[✓] DOCX v2 generado con éxito: {filename} ({os.path.getsize(filename)} bytes)")

# ---------------------------------------------------------
# 2. GENERADOR HTML OFICIAL / TESIS PARA IMPRESIÓN (PDF)
# ---------------------------------------------------------

def build_thesis_html(filename):
    html_content = """<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>DICTAMEN TÉCNICO • PLATAFORMA TERRITORIAL MIGATO 2026</title>
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
        color: #1e3a8a;
      }
      @top-right {
        content: "SISTEMA TERRITORIAL MIGATO 2026";
        font-family: Arial, sans-serif;
        font-size: 8pt;
        font-weight: bold;
        color: #0f172a;
      }
      @bottom-left {
        content: "Dictamen Técnico y Operativo • Sala de Mando Territorial (Confidencial)";
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
      padding: 14px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    }
    .no-print-bar button {
      background: #2563eb;
      color: white;
      border: none;
      padding: 9px 20px;
      font-weight: bold;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
    }
    .no-print-bar button:hover {
      background: #1d4ed8;
    }

    .paper-container {
      max-width: 216mm;
      margin: 30px auto;
      background: white;
      padding: 25mm 20mm 25mm 25mm;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      border-radius: 4px;
    }

    /* ENCABEZADO Y PIE DE PÁGINA EN PANTALLA */
    .running-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 6px;
      margin-bottom: 28px;
      font-size: 8.5pt;
      color: #1e3a8a;
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
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 15px;
    }

    .logo-container {
      margin: 35px auto;
    }
    .logo-container img {
      width: 145px;
      height: 145px;
      object-fit: contain;
    }

    .portada-title {
      font-size: 17pt;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.35;
      margin: 20px 0;
      text-transform: uppercase;
    }
    .portada-subtitle {
      font-size: 13pt;
      color: #1e3a8a;
      font-weight: 600;
      font-style: italic;
      margin-bottom: 25px;
    }

    .portada-footer {
      font-size: 11pt;
      color: #475569;
      line-height: 1.6;
      border-top: 1px solid #cbd5e1;
      padding-top: 15px;
    }

    h1 {
      font-size: 15pt;
      font-weight: 700;
      color: #0f172a;
      text-transform: uppercase;
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 6px;
      margin-top: 32px;
      margin-bottom: 16px;
      page-break-after: avoid;
    }

    h2 {
      font-size: 13pt;
      font-weight: 700;
      color: #1e3a8a;
      margin-top: 24px;
      margin-bottom: 12px;
      page-break-after: avoid;
    }

    p {
      text-align: justify;
      margin-bottom: 14px;
      text-indent: 0;
    }

    .callout {
      background: #f8fafc;
      border-left: 4px solid #1e3a8a;
      padding: 14px 18px;
      margin: 18px 0;
      font-style: italic;
      color: #1e293b;
    }

    .example-box {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-left: 5px solid #0284c7;
      padding: 16px 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .example-title {
      font-weight: 700;
      color: #0369a1;
      font-size: 11pt;
      text-transform: uppercase;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 22px 0;
      font-size: 10pt;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 10px 12px;
      text-align: left;
    }
    th {
      background: #0f172a;
      color: white;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 9.5pt;
    }
    tr:nth-child(even) {
      background: #f8fafc;
    }

    .footnote {
      margin-top: 40px;
      padding-top: 15px;
      border-top: 1px solid #94a3b8;
      font-size: 9pt;
      color: #64748b;
      line-height: 1.4;
    }

    @media print {
      body {
        background: white;
        font-size: 11.5pt;
      }
      .no-print-bar, .running-header, .running-footer {
        display: none !important;
      }
      .paper-container {
        box-shadow: none;
        margin: 0;
        padding: 0;
        max-width: 100%;
      }
      .page-break {
        page-break-before: always;
      }
    }
  </style>
</head>
<body>

  <div class="no-print-bar">
    <div>
      <b>DICTAMEN TÉCNICO OFICIAL • FORMATO GOBIERNO / TESIS (ARIAL 12)</b>
      <span style="opacity: 0.7; margin-left: 12px;">Estado Monagas 2026</span>
    </div>
    <div>
      <button onclick="window.print()">🖨️ IMPRIMIR / GUARDAR COMO PDF</button>
    </div>
  </div>

  <div class="paper-container">

    <!-- PORTADA FORMAL (COMPLETAMENTE LIMPIA DE CABECERA/PIE) -->
    <div class="portada">
      <div class="portada-header">
        REPÚBLICA BOLIVARIANA DE VENEZUELA<br>
        MOVIMIENTO INDEPENDIENTE GANAMOS TODOS (MIGATO)<br>
        DIRECCIÓN GENERAL DE ESTRATEGIA Y SALA SITUACIONAL REGIONAL
      </div>

      <div class="logo-container">
        <img src="assets/logo-migato.png" alt="Emblema Oficial MIGATO">
      </div>

      <div>
        <div class="portada-title">
          DICTAMEN TÉCNICO Y OPERATIVO: ARQUITECTURA DE INTELIGENCIA TERRITORIAL, SISTEMAS DE INFORMACIÓN GEOGRÁFICA Y DEFENSA DEL VOTO
        </div>
        <div class="portada-subtitle">
          Manual Doctrinal y Casos Prácticos de los Cuatro Módulos de Mando Táctico para el Estado Monagas
        </div>
      </div>

      <div class="portada-footer">
        <b>Comando de Campaña y Coordinación General</b><br>
        Bajo el Liderazgo Histórico de José Gregorio "El Gato" Briceño<br>
        Maturín, Estado Monagas • Septiembre de 2026
      </div>
    </div>

    <!-- PÁGINA 2: CONTENIDO CON CABECERA Y PIE FORMAL -->
    <div class="running-header">
      <span>REPÚBLICA BOLIVARIANA DE VENEZUELA • ESTADO MONAGAS</span>
      <span>SISTEMA TERRITORIAL MIGATO 2026</span>
    </div>

    <!-- RESUMEN EJECUTIVO -->
    <h1>Resumen Ejecutivo (Abstract Institucional)</h1>
    <p>El presente dictamen técnico y estratégico formaliza la estructura operativa de la Plataforma Territorial MIGATO en el Estado Monagas. Diseñada bajo rigurosos criterios de soberanía de datos, descentralización y eficiencia institucional, la plataforma constituye el núcleo tecnológico del Movimiento Independiente Ganamos Todos para articular la maquinaria de campo, levantar el censo sectorial de necesidades ciudadanas y blindar de forma inexpugnable los 175 centros de votación y 361 mesas del Municipio Maturín.</p>
    <p>Frente a los modelos de control social estatista y centralismo asfixiante, este sistema se fundamenta en principios republicanos, defensa de la propiedad privada y libertad individual. Mediante cuatro módulos autónomos pero estrechamente integrados (Despacho Celular, Censo Sectorial en Cascada, Auditoría Electoral CNE con Actas QR y Cartografía Satelital 3D), la organización política pasa de una conducción reactiva a una conducción científica del territorio.</p>

    <div class="callout">
      «La defensa del territorio y la recuperación de Monagas no se logran con consignas huecas, sino con orden, datos verificables en el terreno, respeto a las comunidades y control milimétrico de cada acta electoral.» — Dirección Política Regional.
    </div>

    <!-- CAPÍTULO I -->
    <h1>Capítulo I: Marco Doctrinal y Gobernanza Territorial</h1>
    <p>Durante las últimas décadas, la administración pública regional en el Estado Monagas fue desmantelada por estructuras burocráticas ineficientes y clientelares que destruyeron los servicios básicos: acueductos colapsados, apagones sistemáticos, vialidad agrícola abandonada y ambulatorios inoperativos. Dicho deterioro vino acompañado del uso de censos con fines de extorsión política y persecución ciudadana.</p>
    <p>El Movimiento MIGATO, respaldado en la trayectoria de orden, obras tangibles y probada capacidad de gobierno del liderazgo de José Gregorio "El Gato" Briceño, establece a través de esta plataforma una ruptura definitiva con ese esquema: sustituye la retórica ideológica por ingeniería de datos, protección irrestricta a la identidad del ciudadano y planificación rigurosa para la reconstrucción económica de Monagas.</p>

    <div class="running-footer">
      <span>Dictamen Técnico y Operativo • Sala de Mando Territorial (Confidencial)</span>
      <span>Página 2</span>
    </div>

    <!-- PÁGINA 3 -->
    <div class="page-break"></div>
    <div class="running-header">
      <span>REPÚBLICA BOLIVARIANA DE VENEZUELA • ESTADO MONAGAS</span>
      <span>SISTEMA TERRITORIAL MIGATO 2026</span>
    </div>

    <!-- CAPÍTULO II: MÓDULO 1 -->
    <h1>Capítulo II: Módulo 1 — Despacho de Enlaces Parroquiales</h1>
    <h2>1. Fundamentación Técnica y Arquitectura de Mando</h2>
    <p>El Módulo de Despacho de Enlaces Parroquiales (WhatsApp Dispatch Console) resuelve el principal cuello de botella de las organizaciones políticas: la dispersión y distorsión de las directrices a través de cadenas informales de mensajería. El sistema actúa como un despachador unificado que genera enlaces encriptados y mensajes de acreditación oficial para cada coordinador territorial.</p>
    <p>El enlace no requiere instalar aplicaciones pesadas ni configuraciones complejas que comprometan la memoria o seguridad de su teléfono. Al pulsar el enlace, se abre de inmediato su consola de trabajo en el navegador móvil y su canal directo con la Sala de Mando Central.</p>

    <div class="example-box">
      <div class="example-title">📌 Ejemplo Práctico de Aplicación Operativa (Caso San Simón y Alto de Los Godos)</div>
      <p><b>Escenario de Despliegue Inmediato:</b> Viernes, 08:30 hrs. Se reporta la paralización de las bombas de la Planta Potabilizadora del Bajo Guarapiche, dejando sin suministro de agua potable al 70% de la Parroquia San Simón y sectores críticos de Alto de Los Godos. La Sala Situacional requiere en menos de 15 minutos conocer los puntos de mayor vulnerabilidad comunitaria para coordinar apoyo y fijar posición pública.</p>
      <p><b>Acción en el Sistema:</b> El Director Operativo ingresa al Módulo 1 (<code>/despacho/</code>), selecciona simultáneamente 'San Simón' y 'Alto de Los Godos', y hace clic en 'Despachar a Coordinadores'. De manera instantánea, los 2 enlaces parroquiales reciben en sus teléfonos móviles su comunicado oficial con enlace seguro a la consola móvil.</p>
      <p><b>Resultado en Tiempo:</b> A las 08:42 hrs (12 minutos después), ambos enlaces cargaron los reportes consolidados: 14 centros de salud afectados, 6 escuelas sin reservorio y 4 pozos profundos inoperativos en el Eje La Puente. El comando regional cuenta con el diagnóstico en mano antes de que el oficialismo emita un boletín.</p>
    </div>

    <!-- CAPÍTULO III: MÓDULO 2 -->
    <h1>Capítulo III: Módulo 2 — Censo Sectorial y Buzón Ciego</h1>
    <h2>1. Metodología de Censo y Protección Contra Persecución</h2>
    <p>El Censo Sectorial es la columna de inteligencia social del sistema. A diferencia de los registros estatales que fichan al ciudadano para amenazarlo con programas de alimentos o despidos, la plataforma MIGATO implementa el Protocolo de Buzón Ciego. Toda la información de campo se procesa a nivel cuantitativo agregado por sector, resguardando la identidad individual de las familias encuestadas.</p>
    <p>El sistema cuenta con un motor de almacenamiento local (Local Offline Cache) que garantiza operatividad continua: si el coordinador está en una comunidad sin cobertura celular o en medio de un apagón, los datos se almacenan localmente en el dispositivo y se sincronizan de forma transparente apenas detecta señal.</p>

    <div class="example-box">
      <div class="example-title">📌 Ejemplo Práctico de Campo (Caso Eje La Puente, Parroquia Alto de Los Godos)</div>
      <p><b>Levantamiento Territorial:</b> El equipo territorial de MIGATO se despliega en los sectores 'La Puente Sector Central', 'Rómulo Gallegos', 'Valle Real' y 'El Rosillo'. Cada encuestador accede a su consola (<code>/carga/?p=alto-de-los-godos</code>). A medida que recorren las calles, registran: 1.250 viviendas censadas, 4.800 habitantes, 2.920 electores potenciales, 3 transformadores eléctricos quemados y 1 pozo de agua fuera de servicio.</p>
      <p><b>Blindaje de Privacidad:</b> Ningún nombre propio de votante vulnerable queda registrado en listas públicas. Los datos alimentan en tiempo real el Tablero de Campaña (<code>/dashboard-campana/</code>), generando una alerta roja por 'Colapso Crítico de Agua y Electricidad en Sub-Parroquia 6'. Con base en esta cifra exacta, el plan de reconstrucción regional asigna el presupuesto exacto para reactivar la estación de bombeo de La Puente.</p>
    </div>

    <div class="running-footer">
      <span>Dictamen Técnico y Operativo • Sala de Mando Territorial (Confidencial)</span>
      <span>Página 3</span>
    </div>

    <!-- PÁGINA 4 -->
    <div class="page-break"></div>
    <div class="running-header">
      <span>REPÚBLICA BOLIVARIANA DE VENEZUELA • ESTADO MONAGAS</span>
      <span>SISTEMA TERRITORIAL MIGATO 2026</span>
    </div>

    <!-- CAPÍTULO IV: MÓDULO 3 -->
    <h1>Capítulo IV: Módulo 3 — Tablilla Electoral y Actas QR del CNE</h1>
    <h2>1. Blindaje Electoral de los 175 Centros de Maturín</h2>
    <p>El Módulo 3 constituye el escudo legal y matemático para asegurar la victoria electoral. Contiene el universo georreferenciado de los 175 centros de votación y 361 mesas del Municipio Maturín (con 318.601 electores registrados), asignando a cada centro sus coordinadores, testigos principales, suplentes y movilizadores.</p>
    <p>La herramienta integra el Protocolo de Validación Rápida de Actas QR: las máquinas electorales del CNE imprimen al cierre de mesa un comprobante físico con un código QR que codifica la totalización de votos. El testigo de MIGATO escanea y fotografía el código desde su teléfono, transmitiendo los datos al servidor en menos de 4 minutos, antes de que el acta física sea retirada del aula de votación.</p>

    <div class="example-box">
      <div class="example-title">📌 Ejemplo Práctico de Cómputo (Caso E.B. "Alberto Ravell", Código CNE 160101004)</div>
      <p><b>Escrutinio y Transmisión:</b> Domingo de elección, 18:00 hrs. Concluye el acto de votación en la Mesa 1 de la E.B. Alberto Ravell (Parroquia San Simón, 785 electores en mesa, 590 votantes efectivos). La máquina electoral emite el acta de escrutinio impresa. A las 18:04 hrs, el testigo acreditado de MIGATO abre <code>/centros-maturin/</code>, pulsa 'Escanear Acta QR', captura la imagen y el sistema decodifica matemáticamente los votos de la mesa.</p>
      <p><b>Consolidación Inmediata:</b> A las 18:06 hrs, la Sala Situacional Central de MIGATO ya tiene totalizada la Mesa 1 en su Tablilla Electoral en vivo: 442 votos para la candidatura de la unidad democrática frente a 138 de la opción oficialista. El resultado queda blindado con respaldo criptográfico y fotográfico antes de que se desconecte la máquina o se intente cualquier alteración en el traslado físico.</p>
    </div>

    <!-- CAPÍTULO V: MÓDULO 4 -->
    <h1>Capítulo V: Módulo 4 — Cartografía Satelital Táctica 3D</h1>
    <h2>1. Visor Geoespacial y Análisis de Redes Viales</h2>
    <p>El Módulo 4 traslada la inteligencia electoral a la dimensión espacial tridimensional. Construido sobre un motor geoespacial de alta definición (disponible en <code>/earth-monagas/</code>), permite visualizar la geografía monaguense con capas de densidad poblacional, ubicación milimétrica de centros de votación, infraestructura de servicios y vías de comunicación.</p>
    <p>Permite eliminar la improvisación logística el día de los comicios: calcula rutas de acceso, distancias kilométricas, tiempos de traslado y corredores viales para la movilización de testigos y asistencia logística.</p>

    <div class="example-box">
      <div class="example-title">📌 Ejemplo Práctico de Rutas (Caso Eje Suburbano El Furrial - Jusepín)</div>
      <p><b>Planificación de Despliegue:</b> Para cubrir los 14 centros electorales dispersos entre El Furrial y Jusepín, la Sala de Transporte activa en el satélite la capa de centros y cuadrantes viales. El sistema calcula que el tiempo de respuesta desde la base de apoyo en Maturín es de 42 minutos por la Carretera Nacional, pero identifica un punto de contingencia por fallas de drenaje en el Puente de Guanipa.</p>
      <p><b>Optimización Logística:</b> El comando reasigna las unidades motorizadas por la vía alterna de La Toscana, asegurando la entrega de alimentos y refrigerios a los 32 testigos acreditados antes de las 12:00 hrs y garantizando la presencia ininterrumpida en las mesas hasta el conteo final.</p>
    </div>

    <div class="running-footer">
      <span>Dictamen Técnico y Operativo • Sala de Mando Territorial (Confidencial)</span>
      <span>Página 4</span>
    </div>

    <!-- PÁGINA 5 -->
    <div class="page-break"></div>
    <div class="running-header">
      <span>REPÚBLICA BOLIVARIANA DE VENEZUELA • ESTADO MONAGAS</span>
      <span>SISTEMA TERRITORIAL MIGATO 2026</span>
    </div>

    <!-- CAPÍTULO VI: MATRIZ -->
    <h1>Capítulo VI: Matriz Comparativa de los Cuatro Módulos</h1>
    <p>La siguiente tabla resume los atributos funcionales, entradas, salidas y tiempos de respuesta de cada herramienta del sistema:</p>

    <table>
      <thead>
        <tr>
          <th>Módulo</th>
          <th>Propósito Central</th>
          <th>Entrada de Datos</th>
          <th>Salida Estratégica</th>
          <th>Tiempo de Respuesta</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><b>Módulo 1: Despacho WhatsApp</b></td>
          <td>Línea de mando directa sin intermediarios</td>
          <td>Directorio territorial y credenciales</td>
          <td>Enlaces de acceso WhatsApp directos</td>
          <td>&lt; 2 minutos</td>
        </tr>
        <tr>
          <td><b>Módulo 2: Censo Sectorial</b></td>
          <td>Levantamiento de necesidades ciudadanas</td>
          <td>Reportes de campo (Casas, Votos, Servicios)</td>
          <td>Buzón ciego y métricas de sector</td>
          <td>Tiempo real / Offline</td>
        </tr>
        <tr>
          <td><b>Módulo 3: Tablilla y Actas QR</b></td>
          <td>Defensa y auditoría del voto CNE</td>
          <td>175 Centros y fotos/códigos de actas</td>
          <td>Totalización paralela inexpugnable</td>
          <td>&lt; 4 minutos por mesa</td>
        </tr>
        <tr>
          <td><b>Módulo 4: Cartografía Satelital</b></td>
          <td>Vista geoespacial 3D y logística</td>
          <td>Coordenadas GPS y capas de servicios</td>
          <td>Rutas críticas y análisis de cobertura</td>
          <td>Instantáneo (GPU)</td>
        </tr>
      </tbody>
    </table>

    <!-- CAPÍTULO VII -->
    <h1>Capítulo VII: Conclusiones y Dictamen Final</h1>
    <p><b>1. Soberanía y Blindaje Tecnológico:</b> La arquitectura MIGATO demostró que es posible construir una plataforma de nivel estatal con recursos propios, sin depender de software privativo costoso ni de infraestructuras vulnerables al bloqueo estatal.</p>
    <p><b>2. Enfoque Humano y Sin Clientelismo:</b> El censo sectorial recupera la dignidad del ciudadano monaguense, sustituyendo el chantaje social por un diagnóstico real de los servicios para la reconstrucción económica.</p>
    <p><b>3. Garantía Irrefutable de la Victoria:</b> La combinación de los 175 centros auditados, la digitalización instantánea de actas QR y el despacho disciplinado de enlaces aseguran que la voluntad del pueblo de Monagas se defenderá y se proclamará con actas en mano.</p>

    <div class="footnote">
      <b>Referencias Técnicas Institucionales:</b><br>
      ¹ Protocolo CNE-V26: Registro Electoral Definitivo del Municipio Maturín (318.601 electores distribuidos en 10 parroquias y 175 centros de votación).<br>
      ² Modelo Criptográfico de Buzón Ciego: Esquema de agregación probabilística que disocia identificadores personales de las variables censadas.<br>
      ³ Cartografía Geoespacial OGC: Estándar WGS84 para delimitación de cuadrantes y polígonos de sectores territoriales.
    </div>

    <div class="running-footer">
      <span>Dictamen Técnico y Operativo • Sala de Mando Territorial (Confidencial)</span>
      <span>Página 5</span>
    </div>

  </div>

</body>
</html>"""
    with open(filename, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"[✓] HTML formal v2 generado: {filename} ({os.path.getsize(filename)} bytes)")

if __name__ == "__main__":
    build_thesis_docx("INFORME_TESIS_GOBIERNO_MIGATO.docx")
    build_thesis_html("INFORME_TESIS_GOBIERNO_MIGATO.html")
