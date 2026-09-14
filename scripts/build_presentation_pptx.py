#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de Presentación Ejecutiva PowerPoint (.pptx) para MIGATO
10 Láminas Estratégicas - Basado en INFORME_TESIS_PRESUPUESTO_MIGATO_V3
"""

import os
from pathlib import Path
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

PROJECT_ROOT = Path(__file__).resolve().parent.parent
LOGO_PATH = PROJECT_ROOT / "assets" / "logo-migato.png"

# Colores Ejecutivos MIGATO
COLOR_BG = RGBColor(15, 23, 42)        # Slate 900 (#0F172A)
COLOR_CARD = RGBColor(30, 41, 59)      # Slate 800 (#1E293B)
COLOR_BORDER = RGBColor(51, 65, 85)    # Slate 700 (#334155)
COLOR_PRIMARY = RGBColor(2, 132, 199)   # Sky 600 (#0284C7)
COLOR_ACCENT = RGBColor(56, 189, 248)  # Sky 400 (#38BDF8)
COLOR_WHITE = RGBColor(255, 255, 255)
COLOR_MUTED = RGBColor(148, 163, 184)  # Slate 400 (#94A3B8)
COLOR_LIGHT = RGBColor(226, 232, 240)  # Slate 200 (#E2E8F0)
COLOR_SUCCESS = RGBColor(74, 222, 128) # Emerald 400

def create_deck(filename):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_slide_layout = prs.slide_layouts[6]

    def set_slide_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = COLOR_BG
        bg.line.fill.background()
        return bg

    def add_header(slide, title_text, category_text="MIGATO • EQUIPO TÉCNICO DE SISTEMAS"):
        # Top banner category
        tb_cat = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(10), Inches(0.4))
        tf_cat = tb_cat.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.name = "Arial"
        p_cat.font.size = Pt(11)
        p_cat.font.bold = True
        p_cat.font.color.rgb = COLOR_ACCENT

        # Title
        tb_title = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(10.5), Inches(0.8))
        tf_title = tb_title.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.name = "Arial"
        p_title.font.size = Pt(24)
        p_title.font.bold = True
        p_title.font.color.rgb = COLOR_WHITE

        # Logo top right
        if LOGO_PATH.exists():
            slide.shapes.add_picture(str(LOGO_PATH), Inches(11.8), Inches(0.4), Inches(0.8), Inches(0.8))

        # Bottom subtle separator
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.6), Inches(11.733), Inches(0.02))
        line.fill.solid()
        line.fill.fore_color.rgb = COLOR_BORDER
        line.line.fill.background()

    def add_speaker_note(slide, note_text):
        notes_slide = slide.notes_slide
        tf = notes_slide.notes_text_frame
        tf.text = note_text

    # ==========================================
    # SLIDE 1: PORTADA
    # ==========================================
    s1 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s1)

    # Big Logo
    if LOGO_PATH.exists():
        s1.shapes.add_picture(str(LOGO_PATH), Inches(5.8), Inches(0.8), Inches(1.8), Inches(1.8))

    tb1 = s1.shapes.add_textbox(Inches(1.0), Inches(2.8), Inches(11.333), Inches(4.0))
    tf1 = tb1.text_frame
    tf1.word_wrap = True

    p = tf1.paragraphs[0]
    p.text = "REPÚBLICA BOLIVARIANA DE VENEZUELA • ESTADO MONAGAS"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = "Arial"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = COLOR_ACCENT

    p = tf1.add_paragraph()
    p.text = "MOVIMIENTO INDEPENDIENTE GANAMOS TODOS (MIGATO)"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = "Arial"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = COLOR_WHITE
    p.space_after = Pt(14)

    p = tf1.add_paragraph()
    p.text = "ARQUITECTURA DE GESTIÓN TERRITORIAL, SEGURIDAD\nY PRESUPUESTO OPERATIVO DE SERVIDORES"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = "Arial"
    p.font.size = Pt(26)
    p.font.bold = True
    p.font.color.rgb = COLOR_WHITE
    p.space_after = Pt(10)

    p = tf1.add_paragraph()
    p.text = "Propuesta de Factibilidad Técnica de los 5 Módulos y Servidor Cloud VPS Privado"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = "Arial"
    p.font.size = Pt(15)
    p.font.italic = True
    p.font.color.rgb = COLOR_LIGHT
    p.space_after = Pt(20)

    p = tf1.add_paragraph()
    p.text = "Presentado por el Equipo Técnico de Sistemas y Arquitectura Digital • Maturín, Septiembre 2026"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = "Arial"
    p.font.size = Pt(12)
    p.font.color.rgb = COLOR_MUTED

    add_speaker_note(s1, "GUION: Saludos cordiales a la Dirección de MIGATO. Hoy venimos a presentar la solución tecnológica definitiva para coordinar las 44 parroquias de Monagas y resguardar el voto. Todo el software ya fue desarrollado por nuestro equipo sin costo de honorarios; el único objetivo de hoy es aprobar un presupuesto mínimo de $24.50 al mes para el servidor cloud.")

    # ==========================================
    # SLIDE 2: EL DESAFÍO EN MONAGAS
    # ==========================================
    s2 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s2)
    add_header(s2, "El Desafío en Monagas: Centralismo Ineficiente vs. Rigor Gerencial")

    # Card 1: La Realidad Actual
    c1 = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.9), Inches(5.6), Inches(4.8))
    c1.fill.solid()
    c1.fill.fore_color.rgb = COLOR_CARD
    c1.line.color.rgb = RGBColor(239, 68, 68) # Red border

    tb_c1 = s2.shapes.add_textbox(Inches(1.1), Inches(2.1), Inches(5.0), Inches(4.4))
    tf_c1 = tb_c1.text_frame
    tf_c1.word_wrap = True
    p = tf_c1.paragraphs[0]
    p.text = "⚠️ El Esquema Actual (Colapso e Improvisación)"
    p.font.name = "Arial"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = RGBColor(248, 113, 113)
    p.space_after = Pt(14)

    bullets_c1 = [
        "Servicios públicos colapsados: hospitales sin luz ni agua, transformadores dañados y vialidad destruida.",
        "Manejo burocrático y clientelar que carece de métricas técnicas reales de la población.",
        "Comunicaciones en grupos masivos de WhatsApp: datos dispersos, fugas de información y riesgo de espionaje.",
        "Exposición de la militancia ante revisiones indebidas de teléfonos en la calle."
    ]
    for b in bullets_c1:
        p = tf_c1.add_paragraph()
        p.text = "• " + b
        p.font.name = "Arial"
        p.font.size = Pt(13)
        p.font.color.rgb = COLOR_LIGHT
        p.space_after = Pt(8)

    # Card 2: Nuestra Propuesta
    c2 = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.9), Inches(5.7), Inches(4.8))
    c2.fill.solid()
    c2.fill.fore_color.rgb = COLOR_CARD
    c2.line.color.rgb = COLOR_PRIMARY

    tb_c2 = s2.shapes.add_textbox(Inches(7.1), Inches(2.1), Inches(5.1), Inches(4.4))
    tf_c2 = tb_c2.text_frame
    tf_c2.word_wrap = True
    p = tf_c2.paragraphs[0]
    p.text = "🏛️ La Alternativa MIGATO (Orden y Gerencia Privada)"
    p.font.name = "Arial"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = COLOR_ACCENT
    p.space_after = Pt(14)

    bullets_c2 = [
        "Supremacía del mérito técnico, eficiencia y estándares corporativos de primer mundo.",
        "Toma de decisiones fundamentada en mapas georreferenciados y datos reales no manipulables.",
        "Plataforma centralizada con canales de comunicación compartimentados y enlaces directos seguros.",
        "Soberanía tecnológica: las bases de datos pertenecen al partido en un servidor privado exclusivo."
    ]
    for b in bullets_c2:
        p = tf_c2.add_paragraph()
        p.text = "• " + b
        p.font.name = "Arial"
        p.font.size = Pt(13)
        p.font.color.rgb = COLOR_LIGHT
        p.space_after = Pt(8)

    add_speaker_note(s2, "GUION: Compañeros, la gestión pública actual fracasó por falta de método y exceso de politiquería. Nosotros proponemos orden gerencial y competencia técnica. No podemos seguir organizando elecciones ni levantando censos por WhatsApp. Necesitamos un sistema profesional que proteja a nuestra gente.")

    # ==========================================
    # SLIDE 3: LA PLATAFORMA EN 5 MÓDULOS
    # ==========================================
    s3 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s3)
    add_header(s3, "La Solución: Plataforma Territorial MIGATO en 5 Módulos")

    modulos = [
        ("Módulo 1: Despacho Celular", "/despacho/", "Enlaces por token web único directo al teléfono del coordinador parroquial. Cero contraseñas complicadas y compartimentación geográfica.", COLOR_PRIMARY),
        ("Módulo 2: Censo Comunitario", "/carga/", "Protocolo 'Buzón Ciego': no guarda datos personales ni cédulas. Al enviar se borra del teléfono (Zero-Byte Storage).", COLOR_ACCENT),
        ("Módulo 3: Padrón y Actas", "/centros-maturin/", "175 centros y 361 mesas de Maturín. Asignación de testigos y resguardo fotográfico de actas y código QR para cotejo interno.", COLOR_SUCCESS),
        ("Módulo 4: Cartografía 3D", "/earth-monagas/", "Consola 3D de vialidad, relieve y servicios, con filtro de focalización territorial para resaltar el área analizada.", COLOR_PRIMARY),
        ("Módulo 5: Red de Salud", "/salud-monagas/", "Auditoría en tiempo real de 84 centros asistenciales: plantas eléctricas, agua, quirófanos y rutas de derivación médica.", COLOR_ACCENT),
    ]

    for idx, (m_title, m_route, m_desc, m_color) in enumerate(modulos):
        y_pos = Inches(1.8 + idx * 0.98)
        c = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), y_pos, Inches(11.733), Inches(0.88))
        c.fill.solid()
        c.fill.fore_color.rgb = COLOR_CARD
        c.line.color.rgb = m_color

        tb = s3.shapes.add_textbox(Inches(1.0), y_pos + Inches(0.08), Inches(11.3), Inches(0.72))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"{m_title}  "
        p.font.name = "Arial"
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = m_color

        p2 = tf.add_paragraph()
        p2.text = f"Ruta: {m_route} • {m_desc}"
        p2.font.name = "Arial"
        p2.font.size = Pt(11.5)
        p2.font.color.rgb = COLOR_LIGHT

    add_speaker_note(s3, "GUION: Esta plataforma no es un concepto en papel: ya está programada. Cubre las 5 áreas neurálgicas: despacho de enlaces, censo vecinal, defensa electoral, mapa estratégico 3D y auditoría de hospitales. Todo integrado en un solo entorno web.")

    # ==========================================
    # SLIDE 4: MÓDULOS 1 Y 2 (SEGURIDAD DE CAMPO)
    # ==========================================
    s4 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s4)
    add_header(s4, "Módulos 1 y 2: Coordinación Parroquial y Censo Protegido")

    c1 = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.9), Inches(5.6), Inches(4.8))
    c1.fill.solid()
    c1.fill.fore_color.rgb = COLOR_CARD
    c1.line.color.rgb = COLOR_PRIMARY

    tb1 = s4.shapes.add_textbox(Inches(1.1), Inches(2.1), Inches(5.0), Inches(4.4))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    p = tf1.paragraphs[0]
    p.text = "📲 Módulo 1: Despacho Celular Seguro"
    p.font.name = "Arial"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = COLOR_ACCENT
    p.space_after = Pt(12)

    bullets_s4_1 = [
        "Token Web Efímero: El operador central envía un link único por WhatsApp o SMS. El coordinador hace clic y entra directo sin memorizar claves.",
        "Compartimentación: El líder de Las Cocuizas solo ve Las Cocuizas; no tiene acceso al resto del estado.",
        "Revocación en 1 Segundo: Si un coordinador es relevado, se desactiva su token desde la Sala de Mando sin afectar el resto del sistema.",
        "Sin Apps Pesadas: Funciona 100% en el navegador de cualquier teléfono inteligente."
    ]
    for b in bullets_s4_1:
        p = tf1.add_paragraph()
        p.text = "• " + b
        p.font.name = "Arial"
        p.font.size = Pt(12.5)
        p.font.color.rgb = COLOR_LIGHT
        p.space_after = Pt(8)

    c2 = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.9), Inches(5.7), Inches(4.8))
    c2.fill.solid()
    c2.fill.fore_color.rgb = COLOR_CARD
    c2.line.color.rgb = COLOR_SUCCESS

    tb2 = s4.shapes.add_textbox(Inches(7.1), Inches(2.1), Inches(5.1), Inches(4.4))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "🛡️ Módulo 2: Censo Territorial 'Buzón Ciego'"
    p.font.name = "Arial"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = COLOR_SUCCESS
    p.space_after = Pt(12)

    bullets_s4_2 = [
        "Protección de la Ciudadanía: Por principio institucional, NO se solicitan nombres, cédulas ni números de teléfono de los vecinos.",
        "Datos Numéricos y Servicios: Registra familias, viviendas, estimación de fuerza y fallas críticas de luz, agua y vialidad.",
        "Protocolo Zero-Byte Storage: Al pulsar 'Enviar', los datos viajan encriptados por HTTPS al servidor y la pantalla se reinicia a cero.",
        "Dispositivo Limpio: En el teléfono no queda caché, historial ni borradores. Tranquilidad total ante revisiones en alcabalas."
    ]
    for b in bullets_s4_2:
        p = tf2.add_paragraph()
        p.text = "• " + b
        p.font.name = "Arial"
        p.font.size = Pt(12.5)
        p.font.color.rgb = COLOR_LIGHT
        p.space_after = Pt(8)

    add_speaker_note(s4, "GUION: El mayor temor de nuestra gente en la calle es que les revisen el teléfono. Diseñamos la plataforma con seguridad por defecto: el coordinador entra con un solo clic y, al llenar el censo, en su celular queda CERO información. Si le revisan el teléfono, no hay absolutamente nada.")

    # ==========================================
    # SLIDE 5: MÓDULO 3 (DEFENSA ELECTORAL Y ACTAS)
    # ==========================================
    s5 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s5)
    add_header(s5, "Módulo 3: Padrón Electoral, Centros de Votación y Resguardo de Actas")

    # 3 horizontal columns
    cols_s5 = [
        ("🗺️ 175 Centros y 361 Mesas", [
            "Mapeo geoespacial completo del Municipio Maturín.",
            "Priorización matemática de los 40 centros que concentran más del 60% del padrón electoral.",
            "Ubicación satelital y rutas de acceso para movilización el día de la votación."
        ], COLOR_PRIMARY),
        ("👥 Organización de Testigos", [
            "Registro ordenado del testigo principal y suplente por cada mesa electoral.",
            "Segmentación de acompañamiento ciudadano a votantes de tercera edad y jóvenes.",
            "Reporte de incidencias y apertura de mesas en tiempo real."
        ], COLOR_ACCENT),
        ("📸 Archivo de Actas y Código QR", [
            "Carga de resultados mesa por mesa por parte del testigo acreditado.",
            "Almacenamiento fotográfico en alta resolución del acta física y comprobante oficial.",
            "Captura del código QR del acta para cotejo y auditoría interna de la organización.",
            "Sin intervenir ni suplantar atribuciones del CNE."
        ], COLOR_SUCCESS),
    ]

    for idx, (col_title, col_bullets, col_color) in enumerate(cols_s5):
        x_pos = Inches(0.8 + idx * 4.0)
        c = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x_pos, Inches(1.9), Inches(3.733), Inches(4.8))
        c.fill.solid()
        c.fill.fore_color.rgb = COLOR_CARD
        c.line.color.rgb = col_color

        tb = s5.shapes.add_textbox(x_pos + Inches(0.2), Inches(2.1), Inches(3.333), Inches(4.4))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = col_title
        p.font.name = "Arial"
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = col_color
        p.space_after = Pt(12)

        for b in col_bullets:
            p = tf.add_paragraph()
            p.text = "• " + b
            p.font.name = "Arial"
            p.font.size = Pt(12)
            p.font.color.rgb = COLOR_LIGHT
            p.space_after = Pt(8)

    add_speaker_note(s5, "GUION: El Módulo 3 no es un intermediario del CNE ni promete milagros: es una herramienta de control interno del partido. Tenemos georreferenciados los 175 centros de Maturín. Nuestros testigos suben la foto del acta con su código QR para tener nuestro propio respaldo auditable y blindado.")

    # ==========================================
    # SLIDE 6: MÓDULOS 4 Y 5 (3D Y SALUD)
    # ==========================================
    s6 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s6)
    add_header(s6, "Módulos 4 y 5: Cartografía Tridimensional y Red Asistencial de Salud")

    c1 = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.9), Inches(5.6), Inches(4.8))
    c1.fill.solid()
    c1.fill.fore_color.rgb = COLOR_CARD
    c1.line.color.rgb = COLOR_PRIMARY

    tb1 = s6.shapes.add_textbox(Inches(1.1), Inches(2.1), Inches(5.0), Inches(4.4))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    p = tf1.paragraphs[0]
    p.text = "🌐 Módulo 4: Cartografía 3D de Infraestructura"
    p.font.name = "Arial"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = COLOR_ACCENT
    p.space_after = Pt(12)

    bullets_s6_1 = [
        "Visualización Geoespacial 3D: Elevaciones topográficas, vialidad, distribución comunitaria y servicios críticos en Monagas.",
        "Filtro de Focalización Territorial: Aplica una atenuación suave sobre la periferia para concentrar la atención en la parroquia o sector bajo análisis.",
        "Planificación Táctica y Logística: Cálculo de distancias reales, tiempos de traslado y rutas óptimas para los equipos de campo.",
        "Uso en Sala de Mando: Ideal para proyectar en pantallas grandes durante reuniones estratégicas de la dirección."
    ]
    for b in bullets_s6_1:
        p = tf1.add_paragraph()
        p.text = "• " + b
        p.font.name = "Arial"
        p.font.size = Pt(12.5)
        p.font.color.rgb = COLOR_LIGHT
        p.space_after = Pt(8)

    c2 = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.9), Inches(5.7), Inches(4.8))
    c2.fill.solid()
    c2.fill.fore_color.rgb = COLOR_CARD
    c2.line.color.rgb = COLOR_ACCENT

    tb2 = s6.shapes.add_textbox(Inches(7.1), Inches(2.1), Inches(5.1), Inches(4.4))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "🏥 Módulo 5: Diagnóstico y Red de Salud"
    p.font.name = "Arial"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY
    p.space_after = Pt(12)

    bullets_s6_2 = [
        "Censo Sanitario Exhaustivo: Monitoreo técnico de 84 centros asistenciales (Hospital Central, ambulatorios urbanos, rurales y CDI).",
        "Servicios Críticos: Estado real de plantas eléctricas de emergencia, suministro de agua por tubería, quirófanos y salas de parto.",
        "Red de Derivación Médica: Registro de rutas de traslado de pacientes cuando un ambulatorio no tiene capacidad de resolución.",
        "Base para el Plan de Gobierno: Sustento con datos reales de ingeniería para proponer soluciones hospitalarias concretas ante la opinión pública."
    ]
    for b in bullets_s6_2:
        p = tf2.add_paragraph()
        p.text = "• " + b
        p.font.name = "Arial"
        p.font.size = Pt(12.5)
        p.font.color.rgb = COLOR_LIGHT
        p.space_after = Pt(8)

    add_speaker_note(s6, "GUION: El Módulo 4 nos da visión tridimensional para planificar logística sin perdernos en el mapa. Y el Módulo 5 de Salud es nuestra mejor bandera: 84 centros diagnosticados. Le mostramos a Monagas exactamente qué falla y cómo lo vamos a solucionar con datos en la mano.")

    # ==========================================
    # SLIDE 7: BLINDAJE INFORMÁTICO
    # ==========================================
    s7 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s7)
    add_header(s7, "Seguridad y Blindaje Informático: Soberanía de los Datos")

    boxes_s7 = [
        ("🔒 Cifrado SSL/TLS 256 bits", "Toda la comunicación entre los teléfonos de los coordinadores y el servidor viaja encriptada. Es imposible interceptar la información en redes móviles o puntos WiFi.", COLOR_PRIMARY),
        ("🛡️ Auditoría de Vulnerabilidades", "Cierre estricto de puertos, cortafuegos iptables, protección Fail2ban contra intentos de acceso forzado y acceso al panel restringido a IPs autorizadas.", COLOR_ACCENT),
        ("⚡ Pruebas de Estrés y Concurrencia", "Simulaciones de alta carga para garantizar que el servidor responda en menos de 1 segundo incluso durante las horas más intensas del día electoral.", COLOR_SUCCESS),
        ("💾 Respaldos Automatizados Fuera de Línea", "Copias de seguridad encriptadas periódicas para evitar cualquier pérdida de información ante fallas técnicas imprevistas.", COLOR_LIGHT)
    ]

    for idx, (b_title, b_desc, b_color) in enumerate(boxes_s7):
        row = idx // 2
        col = idx % 2
        x_pos = Inches(0.8 + col * 6.0)
        y_pos = Inches(1.9 + row * 2.5)

        c = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x_pos, y_pos, Inches(5.7), Inches(2.2))
        c.fill.solid()
        c.fill.fore_color.rgb = COLOR_CARD
        c.line.color.rgb = b_color

        tb = s7.shapes.add_textbox(x_pos + Inches(0.25), y_pos + Inches(0.2), Inches(5.2), Inches(1.8))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = b_title
        p.font.name = "Arial"
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = b_color
        p.space_after = Pt(6)

        p2 = tf.add_paragraph()
        p2.text = b_desc
        p2.font.name = "Arial"
        p2.font.size = Pt(12)
        p2.font.color.rgb = COLOR_LIGHT

    add_speaker_note(s7, "GUION: Una plataforma de este calibre no puede vivir en un hosting gratuito ni en servidores compartidos baratos donde te suspenden la cuenta sin aviso. Necesitamos un VPS privado dedicado con cifrado de 256 bits y pruebas de estrés para que jamás se caiga.")

    # ==========================================
    # SLIDE 8: PRESUPUESTO MÍNIMO OPERATIVO
    # ==========================================
    s8 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s8)
    add_header(s8, "Estudio Económico: Presupuesto Mínimo Solicitado (Fase 1)")

    # Highlight Banner
    c_banner = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(11.733), Inches(0.9))
    c_banner.fill.solid()
    c_banner.fill.fore_color.rgb = COLOR_PRIMARY
    c_banner.line.fill.background()

    tb_b = s8.shapes.add_textbox(Inches(1.0), Inches(1.85), Inches(11.333), Inches(0.8))
    tf_b = tb_b.text_frame
    tf_b.word_wrap = True
    p = tf_b.paragraphs[0]
    p.text = "Inversión Mínima: ~$24.50 USD / mes   |   $294.00 USD / AÑO TOTAL"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = "Arial"
    p.font.size = Pt(19)
    p.font.bold = True
    p.font.color.rgb = COLOR_WHITE

    p2 = tf_b.add_paragraph()
    p2.text = "El desarrollo de software y arquitectura fue provisto sin costo de honorarios por el Equipo Técnico"
    p2.alignment = PP_ALIGN.CENTER
    p2.font.name = "Arial"
    p2.font.size = Pt(11.5)
    p2.font.color.rgb = COLOR_LIGHT

    # Table
    rows = 6
    cols = 4
    left = Inches(0.8)
    top = Inches(2.9)
    width = Inches(11.733)
    height = Inches(3.6)

    table_shape = s8.shapes.add_table(rows, cols, left, top, width, height)
    t = table_shape.table

    t.columns[0].width = Inches(3.2)
    t.columns[1].width = Inches(5.133)
    t.columns[2].width = Inches(1.7)
    t.columns[3].width = Inches(1.7)

    headers = ["Componente", "Especificación Técnica", "Mensual", "Anual Total"]
    for i, h in enumerate(headers):
        cell = t.cell(0, i)
        cell.text = h
        cell.fill.solid()
        cell.fill.fore_color.rgb = RGBColor(15, 23, 42)
        p = cell.text_frame.paragraphs[0]
        p.font.bold = True
        p.font.size = Pt(12)
        p.font.color.rgb = COLOR_ACCENT
        if i >= 2:
            p.alignment = PP_ALIGN.CENTER

    data = [
        ("Servidor Cloud VPS Dedicado", "4 vCPU / 8 GB RAM / 100 GB SSD NVMe / Red 1 Gbps / Anti-DDoS", "$20.00 USD", "$240.00 USD"),
        ("Dominio Institucional Oficial", "Registro anual de dominio web + Certificado SSL 256 bits", "$1.50 USD", "$18.00 USD"),
        ("IP Pública Fija Dedicada", "Dirección IP estática exclusiva para filtrado seguro de conexiones", "$3.00 USD", "$36.00 USD"),
        ("Software de Servidor y Código", "Linux Ubuntu Server, Nginx, PostgreSQL, Fail2ban (FOSS)", "$0.00 USD", "$0.00 USD"),
        ("TOTAL MÍNIMO SOLICITADO:", "Infraestructura soberana y certificada para las pruebas piloto", "~$24.50 USD", "$294.00 USD")
    ]

    for row_idx, row_data in enumerate(data, start=1):
        is_total = (row_idx == 5)
        for col_idx, text in enumerate(row_data):
            cell = t.cell(row_idx, col_idx)
            cell.text = text
            cell.fill.solid()
            cell.fill.fore_color.rgb = COLOR_CARD if not is_total else RGBColor(2, 44, 75)
            p = cell.text_frame.paragraphs[0]
            p.font.name = "Arial"
            p.font.size = Pt(11 if not is_total else 12)
            p.font.bold = is_total or (col_idx == 0)
            p.font.color.rgb = COLOR_WHITE if is_total else (COLOR_ACCENT if col_idx == 0 else COLOR_LIGHT)
            if col_idx >= 2:
                p.alignment = PP_ALIGN.CENTER
                if is_total:
                    p.font.color.rgb = COLOR_SUCCESS

    add_speaker_note(s8, "GUION: Miren los números con total transparencia: son exactamente 294 dólares AL AÑO. No estamos cobrando un solo centavo por el desarrollo de la plataforma, que en el mercado corporativo costaría miles de dólares. Solo pedimos el costo directo de la nube: 24 dólares y medio al mes para encender el servidor.")

    # ==========================================
    # SLIDE 9: PLAN DE DESPLIEGUE POR FASES
    # ==========================================
    s9 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s9)
    add_header(s9, "Plan de Despliegue Escalonado por Fases")

    # Fase 1 Card
    c1 = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.9), Inches(5.6), Inches(4.8))
    c1.fill.solid()
    c1.fill.fore_color.rgb = COLOR_CARD
    c1.line.color.rgb = COLOR_SUCCESS

    tb1 = s9.shapes.add_textbox(Inches(1.1), Inches(2.1), Inches(5.0), Inches(4.4))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    p = tf1.paragraphs[0]
    p.text = "🚀 FASE 1: Inmediata ($294.00 USD)"
    p.font.name = "Arial"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = COLOR_SUCCESS
    p.space_after = Pt(10)

    p = tf1.add_paragraph()
    p.text = "Objeto directo de esta solicitud de financiamiento:"
    p.font.name = "Arial"
    p.font.size = Pt(12)
    p.font.italic = True
    p.font.color.rgb = COLOR_MUTED
    p.space_after = Pt(12)

    f1_bullets = [
        "Contratación del VPS dedicado y registro del dominio oficial.",
        "Instalación del entorno Linux blindado con cortafuegos y certificados SSL 256 bits.",
        "Ejecución de pruebas de carga y concurrencia con simulación de tráfico real.",
        "Despliegue y validación en 3 parroquias piloto de Maturín: Las Cocuizas, San Simón y Alto de Los Godos."
    ]
    for b in f1_bullets:
        p = tf1.add_paragraph()
        p.text = "• " + b
        p.font.name = "Arial"
        p.font.size = Pt(12)
        p.font.color.rgb = COLOR_LIGHT
        p.space_after = Pt(8)

    # Fase 2 Card
    c2 = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.9), Inches(5.7), Inches(4.8))
    c2.fill.solid()
    c2.fill.fore_color.rgb = COLOR_CARD
    c2.line.color.rgb = COLOR_BORDER

    tb2 = s9.shapes.add_textbox(Inches(7.1), Inches(2.1), Inches(5.1), Inches(4.4))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "🏢 FASE 2: Consolidación Futura"
    p.font.name = "Arial"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = COLOR_MUTED
    p.space_after = Pt(10)

    p = tf2.add_paragraph()
    p.text = "Sujeta a etapas posteriores y disponibilidad de recursos:"
    p.font.name = "Arial"
    p.font.size = Pt(12)
    p.font.italic = True
    p.font.color.rgb = COLOR_MUTED
    p.space_after = Pt(12)

    f2_bullets = [
        "Dotación física del centro de mando y monitoreo regional.",
        "Equipos de computación dedicados para operadores de sala situacional.",
        "Pantallas de visualización simultánea de los 5 módulos.",
        "Sistemas de respaldo eléctrico (inversores / UPS) para operar durante las fallas del servicio eléctrico."
    ]
    for b in f2_bullets:
        p = tf2.add_paragraph()
        p.text = "• " + b
        p.font.name = "Arial"
        p.font.size = Pt(12)
        p.font.color.rgb = COLOR_MUTED
        p.space_after = Pt(8)

    add_speaker_note(s9, "GUION: No venimos a pedir presupuestos gigantescos para computadoras o pantallas ahora mismo. Eso es la Fase 2. Hoy solo venimos por la Fase 1: los 294 dólares para encender el servidor y validar las 3 parroquias piloto más grandes de Maturín.")

    # ==========================================
    # SLIDE 10: CONCLUSIÓN Y DICTAMEN TÉCNICO
    # ==========================================
    s10 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s10)
    add_header(s10, "Conclusión y Dictamen Técnico: El Momento es Ahora")

    c_box = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.5), Inches(1.9), Inches(10.333), Inches(4.8))
    c_box.fill.solid()
    c_box.fill.fore_color.rgb = COLOR_CARD
    c_box.line.color.rgb = COLOR_PRIMARY

    tb_box = s10.shapes.add_textbox(Inches(1.8), Inches(2.1), Inches(9.733), Inches(4.4))
    tf_box = tb_box.text_frame
    tf_box.word_wrap = True

    p = tf_box.paragraphs[0]
    p.text = "✅ Dictamen Favorable del Equipo Técnico"
    p.font.name = "Arial"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_ACCENT
    p.space_after = Pt(14)

    conclusions = [
        ("Madurez del Software:", "Los 5 módulos están programados, probados y listos para operar. No hay riesgo de desarrollo."),
        ("Protección Total:", "Nuestra militancia y coordinadores están blindados con tokens efímeros y formularios sin residuo en teléfono."),
        ("Máxima Rentabilidad Política:", "Con solo $294.00 USD anuales, MIGATO se posiciona a la vanguardia organizativa del oriente del país.")
    ]
    for title, desc in conclusions:
        p = tf_box.add_paragraph()
        p.text = f"• {title} "
        p.font.name = "Arial"
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = COLOR_WHITE
        p.space_after = Pt(4)

        p_desc = tf_box.add_paragraph()
        p_desc.text = f"   {desc}"
        p_desc.font.name = "Arial"
        p_desc.font.size = Pt(12)
        p_desc.font.color.rgb = COLOR_LIGHT
        p_desc.space_after = Pt(10)

    p_rec = tf_box.add_paragraph()
    p_rec.text = "RECOMENDACIÓN FINAL: Aprobar la contratación de la Fase 1 ($294.00 USD) para encender el servidor y comenzar de inmediato las pruebas piloto en Maturín."
    p_rec.font.name = "Arial"
    p_rec.font.size = Pt(13)
    p_rec.font.bold = True
    p_rec.font.color.rgb = COLOR_SUCCESS
    p_rec.space_before = Pt(8)

    add_speaker_note(s10, "GUION: Para cerrar: la herramienta está lista. No hay que esperar meses de desarrollo. Si la dirección aprueba hoy los 294 dólares, en 48 horas tenemos el servidor arriba y los coordinadores probando en Las Cocuizas, San Simón y Los Godos. Quedamos a su disposición para cualquier pregunta técnica.")

    # Guardar
    prs.save(str(filename))
    print(f"[✓] Presentación PowerPoint generada exitosamente: {filename} ({os.path.getsize(filename)} bytes)")

if __name__ == "__main__":
    out_file = PROJECT_ROOT / "PRESENTACION_EJECUTIVA_MIGATO_V3.pptx"
    create_deck(out_file)
