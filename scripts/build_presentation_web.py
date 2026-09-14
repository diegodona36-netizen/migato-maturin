#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de Presentación Web Corporativa / Gubernamental para MIGATO
Estilo Business / Ejecutivo Institucional - Basado en INFORME_TESIS_PRESUPUESTO_MIGATO_V3
"""

import os
import base64
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
LOGO_PATH = PROJECT_ROOT / "assets" / "logo-migato.png"

def build_web_presentation():
    logo_b64 = ""
    if LOGO_PATH.exists():
        logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode("utf-8")

    html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MIGATO • Presentación Ejecutiva y Presupuesto de Inversión Tecnológica</title>
  <link rel="icon" type="image/png" href="data:image/png;base64,{logo_b64}">
  <style>
    :root {{
      --bg-page: #F8FAFC;
      --bg-slide: #FFFFFF;
      --bg-card: #FFFFFF;
      --bg-subtle: #F1F5F9;
      --border-light: #E2E8F0;
      --border-card: #CBD5E1;
      --navy-dark: #0F172A;
      --navy-corp: #1E3A8A;
      --blue-primary: #0284C7;
      --blue-subtle: #E0F2FE;
      --blue-accent: #0369A1;
      --text-main: #0F172A;
      --text-secondary: #334155;
      --text-muted: #64748B;
      --success: #059669;
      --success-subtle: #ECFDF5;
      --warning: #D97706;
      --warning-subtle: #FFFBEB;
      --danger: #DC2626;
      --danger-subtle: #FEF2F2;
    }}

    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
    }}

    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: var(--bg-page);
      color: var(--text-main);
      min-height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      user-select: none;
    }}

    /* BARRA SUPERIOR DE PROGRESO */
    .progress-container {{
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: #E2E8F0;
      z-index: 100;
    }}
    .progress-bar {{
      height: 100%;
      width: 10%;
      background: var(--navy-corp);
      transition: width 0.3s ease;
    }}

    /* HEADER GUBERNAMENTAL Y CORPORATIVO */
    header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 28px;
      background: #FFFFFF;
      border-bottom: 1px solid var(--border-light);
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      z-index: 90;
    }}
    .brand {{
      display: flex;
      align-items: center;
      gap: 12px;
    }}
    .brand img {{
      width: 36px;
      height: 36px;
      object-fit: contain;
    }}
    .brand-title {{
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.4px;
      color: var(--navy-corp);
      line-height: 1.2;
    }}
    .brand-sub {{
      font-size: 11px;
      color: var(--text-muted);
      font-weight: 600;
    }}

    .header-actions {{
      display: flex;
      align-items: center;
      gap: 10px;
    }}
    .btn-action {{
      background: #FFFFFF;
      color: var(--navy-corp);
      border: 1px solid var(--border-card);
      padding: 7px 14px;
      border-radius: 6px;
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }}
    .btn-action:hover {{
      background: var(--bg-subtle);
      border-color: var(--navy-corp);
    }}
    .btn-action.active {{
      background: var(--navy-corp);
      border-color: var(--navy-corp);
      color: #FFFFFF;
    }}

    /* CONTENEDOR PRINCIPAL DE LÁMINAS */
    .deck-container {{
      flex: 1;
      position: relative;
      width: 100%;
      height: calc(100vh - 125px);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }}

    .slide {{
      position: absolute;
      width: 94%;
      max-width: 1240px;
      height: 92%;
      max-height: 690px;
      background: var(--bg-slide);
      border: 1px solid var(--border-card);
      border-radius: 12px;
      padding: 36px 46px;
      display: flex;
      flex-direction: column;
      opacity: 0;
      pointer-events: none;
      transform: scale(0.98) translateX(25px);
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.08);
      overflow-y: auto;
    }}

    .slide.active {{
      opacity: 1;
      pointer-events: auto;
      transform: scale(1) translateX(0);
      z-index: 10;
    }}

    /* SLIDE HEADER */
    .slide-header {{
      margin-bottom: 22px;
      border-bottom: 2px solid var(--navy-corp);
      padding-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }}
    .slide-tag {{
      display: inline-block;
      font-size: 11.5px;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: var(--blue-primary);
      text-transform: uppercase;
      margin-bottom: 4px;
    }}
    .slide-title {{
      font-size: 26px;
      font-weight: 800;
      color: var(--navy-dark);
      line-height: 1.25;
    }}
    .slide-watermark {{
      width: 38px;
      height: 38px;
      opacity: 0.85;
    }}

    /* SLIDE BODY */
    .slide-body {{
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }}

    /* GRID LAYOUTS */
    .grid-2 {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 22px;
      height: 100%;
    }}
    .grid-3 {{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
      height: 100%;
    }}
    .grid-4 {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 18px;
      height: 100%;
    }}

    /* CARDS CORPORATIVAS */
    .card {{
      background: var(--bg-card);
      border: 1px solid var(--border-light);
      border-radius: 8px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
      transition: border-color 0.15s, box-shadow 0.15s;
    }}
    .card:hover {{
      border-color: var(--border-card);
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }}
    .card.highlight {{
      border-color: #BAE6FD;
      background: #F0F9FF;
    }}
    .card.subtle {{
      background: var(--bg-subtle);
      border-color: var(--border-light);
    }}
    .card.success {{
      border-color: #A7F3D0;
      background: #F0FDF4;
    }}
    .card.warning {{
      border-color: #FDE68A;
      background: #FFFBEB;
    }}

    .card-title {{
      font-size: 17px;
      font-weight: 700;
      color: var(--navy-corp);
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid rgba(0,0,0,0.06);
      padding-bottom: 8px;
    }}
    .card-list {{
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }}
    .card-list li {{
      font-size: 14.5px;
      color: var(--text-secondary);
      line-height: 1.5;
      position: relative;
      padding-left: 18px;
    }}
    .card-list li::before {{
      content: "▪";
      color: var(--navy-corp);
      position: absolute;
      left: 0;
      font-size: 14px;
      top: 0px;
    }}

    /* TABLA PRESUPUESTO BUSINESS */
    .table-container {{
      width: 100%;
      overflow-x: auto;
      background: #FFFFFF;
      border-radius: 8px;
      border: 1px solid var(--border-card);
      margin-top: 6px;
    }}
    table {{
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 14.5px;
    }}
    th {{
      background: var(--navy-corp);
      color: #FFFFFF;
      padding: 12px 16px;
      font-weight: 700;
      letter-spacing: 0.3px;
      font-size: 13.5px;
    }}
    td {{
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-light);
      color: var(--text-secondary);
    }}
    tr:nth-child(even) td {{
      background: #F8FAFC;
    }}
    tr:last-child td {{
      border-bottom: none;
    }}
    .total-row td {{
      background: #EFF6FF !important;
      font-weight: 800;
      font-size: 15.5px;
      color: var(--navy-dark);
      border-top: 2px solid var(--navy-corp);
    }}
    .total-price {{
      color: var(--navy-corp) !important;
      font-size: 17px !important;
      font-weight: 800;
    }}

    /* BANNER DESTACADO */
    .banner-kpi {{
      background: #F0F9FF;
      border: 1.5px solid var(--blue-primary);
      border-radius: 8px;
      padding: 16px 22px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }}
    .banner-kpi-text h3 {{
      font-size: 19px;
      font-weight: 800;
      color: var(--navy-dark);
    }}
    .banner-kpi-text p {{
      font-size: 13.5px;
      color: var(--text-muted);
      margin-top: 3px;
    }}
    .banner-kpi-badge {{
      background: var(--navy-corp);
      color: #FFFFFF;
      font-size: 20px;
      font-weight: 800;
      padding: 8px 18px;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }}

    /* FOOTER DE NAVEGACIÓN */
    footer {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 28px;
      background: #FFFFFF;
      border-top: 1px solid var(--border-light);
      z-index: 90;
    }}
    .nav-controls {{
      display: flex;
      align-items: center;
      gap: 14px;
    }}
    .btn-nav {{
      background: #FFFFFF;
      color: var(--navy-dark);
      border: 1px solid var(--border-card);
      padding: 8px 18px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s;
    }}
    .btn-nav:hover:not(:disabled) {{
      background: var(--navy-corp);
      border-color: var(--navy-corp);
      color: #FFFFFF;
    }}
    .btn-nav:disabled {{
      opacity: 0.3;
      cursor: not-allowed;
    }}
    .slide-indicator {{
      font-size: 14px;
      font-weight: 700;
      color: var(--text-muted);
      min-width: 80px;
      text-align: center;
    }}

    /* DOTS DE NAVEGACIÓN */
    .dots-container {{
      display: flex;
      gap: 6px;
    }}
    .dot {{
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #CBD5E1;
      cursor: pointer;
      transition: all 0.2s ease;
    }}
    .dot.active {{
      background: var(--navy-corp);
      width: 24px;
      border-radius: 4px;
    }}

    /* PANEL DEL GUION DEL ORADOR */
    .speaker-drawer {{
      position: fixed;
      bottom: 65px;
      left: 50%;
      transform: translateX(-50%) translateY(120%);
      width: 90%;
      max-width: 960px;
      background: #FFFFFF;
      border: 2px solid var(--navy-corp);
      border-radius: 10px;
      padding: 18px 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
      z-index: 150;
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }}
    .speaker-drawer.open {{
      transform: translateX(-50%) translateY(0);
    }}
    .speaker-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 6px;
    }}
    .speaker-title {{
      font-size: 13px;
      font-weight: 800;
      color: var(--navy-corp);
      display: flex;
      align-items: center;
      gap: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }}
    .speaker-close {{
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 16px;
      cursor: pointer;
    }}
    .speaker-text {{
      font-size: 14.5px;
      line-height: 1.55;
      color: var(--text-secondary);
      font-style: italic;
    }}

    /* PORTADA BUSINESS */
    .cover-slide {{
      text-align: center;
      justify-content: center;
      align-items: center;
      padding: 30px;
      background: #FFFFFF;
    }}
    .cover-logo {{
      width: 105px;
      height: 105px;
      object-fit: contain;
      margin-bottom: 16px;
    }}
    .cover-badge {{
      display: inline-block;
      padding: 5px 14px;
      border-radius: 4px;
      background: var(--bg-subtle);
      border: 1px solid var(--border-card);
      color: var(--navy-corp);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.8px;
      margin-bottom: 12px;
    }}
    .cover-title {{
      font-size: 30px;
      font-weight: 900;
      color: var(--navy-dark);
      line-height: 1.28;
      max-width: 900px;
      margin-bottom: 10px;
    }}
    .cover-sub {{
      font-size: 16px;
      color: var(--text-muted);
      max-width: 780px;
      margin-bottom: 24px;
      font-weight: 500;
    }}
    .cover-footer {{
      font-size: 13px;
      color: var(--text-secondary);
      border-top: 1px solid var(--border-light);
      padding-top: 14px;
      width: 100%;
      max-width: 580px;
      line-height: 1.6;
    }}

    /* PRINT STYLES */
    @media print {{
      body {{
        background: #FFFFFF;
        overflow: visible;
      }}
      header, footer, .progress-container, .speaker-drawer {{
        display: none !important;
      }}
      .deck-container {{
        height: auto;
        padding: 0;
        display: block;
      }}
      .slide {{
        position: relative !important;
        opacity: 1 !important;
        transform: none !important;
        display: flex !important;
        page-break-after: always;
        width: 100% !important;
        height: 100vh !important;
        max-width: 100% !important;
        max-height: 100% !important;
        border-radius: 0 !important;
        border: none !important;
        background: #FFFFFF !important;
        box-shadow: none !important;
        padding: 30px !important;
      }}
    }}

    @media (max-width: 768px) {{
      .slide {{ padding: 20px 16px; width: 96%; height: 95%; }}
      .slide-title {{ font-size: 20px; }}
      .grid-2, .grid-3, .grid-4 {{ grid-template-columns: 1fr; gap: 12px; }}
      .card-title {{ font-size: 15.5px; }}
      .card-list li {{ font-size: 13.5px; }}
      .cover-title {{ font-size: 22px; }}
      .cover-sub {{ font-size: 14px; }}
      .header-actions .btn-text {{ display: none; }}
    }}
  </style>
</head>
<body>

  <!-- BARRA DE PROGRESO -->
  <div class="progress-container">
    <div class="progress-bar" id="progressBar"></div>
  </div>

  <!-- HEADER CORPORATIVO -->
  <header>
    <div class="brand">
      <img src="data:image/png;base64,{logo_b64}" alt="Logo MIGATO">
      <div>
        <div class="brand-title">MOVIMIENTO INDEPENDIENTE GANAMOS TODOS (MIGATO)</div>
        <div class="brand-sub">Equipo Técnico de Sistemas y Arquitectura Digital • Estado Monagas</div>
      </div>
    </div>

    <div class="header-actions">
      <button class="btn-action" id="btnNotes" onclick="toggleNotes()">
        🎙️ <span class="btn-text">Guion del Orador</span>
      </button>
      <button class="btn-action" onclick="toggleFullScreen()">
        ⛶ <span class="btn-text">Pantalla Completa</span>
      </button>
      <button class="btn-action" onclick="window.print()">
        🖨️ <span class="btn-text">PDF / Imprimir</span>
      </button>
    </div>
  </header>

  <!-- CONTENEDOR DE LÁMINAS -->
  <main class="deck-container" id="deckContainer">

    <!-- LÁMINA 1: PORTADA -->
    <div class="slide active cover-slide" data-note="Estimados miembros de la Dirección General: les presentamos el dictamen técnico y la propuesta de factibilidad para la puesta en marcha de la Plataforma Territorial MIGATO. El desarrollo del software ha sido completado al 100% por nuestro equipo sin costo de honorarios para la organización. El objetivo de esta sesión ejecutiva es someter a su consideración la aprobación de un presupuesto operativo mínimo de $24.50 mensuales para la infraestructura cloud del servidor privado.">
      <div class="cover-badge">REPÚBLICA BOLIVARIANA DE VENEZUELA • ESTADO MONAGAS</div>
      <img class="cover-logo" src="data:image/png;base64,{logo_b64}" alt="Logo MIGATO">
      <h1 class="cover-title">ARQUITECTURA DE GESTIÓN TERRITORIAL Y PROPUESTA DE FACTIBILIDAD TÉCNICA</h1>
      <p class="cover-sub">Evaluación Integral de los Cinco Módulos de Mando, Servidor Cloud VPS Privado y Presupuesto Operativo</p>
      <div class="cover-footer">
        Presentado por el <strong>Equipo Técnico de Sistemas y Arquitectura Digital</strong><br>
        A la Dirección General del Movimiento Independiente Ganamos Todos (MIGATO)<br>
        Maturín, Estado Monagas • Septiembre de 2026
      </div>
    </div>

    <!-- LÁMINA 2: EL DESAFÍO EN MONAGAS -->
    <div class="slide" data-note="La gestión pública en Monagas enfrenta una severa ineficiencia burocrática que ha deteriorado los servicios básicos y la confianza ciudadana. En el ámbito organizativo, operar mediante canales informales de mensajería genera dispersión, pérdida de datos y riesgos de seguridad para los equipos de campo. Frente a este panorama, MIGATO propone un modelo de gestión basado en la competencia técnica, la transparencia administrativa y la toma de decisiones fundamentada en indicadores reales y auditables.">
      <div class="slide-header">
        <div>
          <div class="slide-tag">Diagnóstico Institucional</div>
          <h2 class="slide-title">Marco Estratégico: Superación del Centralismo Burocrático</h2>
        </div>
        <img class="slide-watermark" src="data:image/png;base64,{logo_b64}">
      </div>
      <div class="slide-body">
        <div class="grid-2">
          <div class="card" style="border-left: 4px solid var(--danger);">
            <div class="card-title" style="color: var(--danger);">
              <span>⚠️ Limitaciones del Esquema Tradicional</span>
            </div>
            <ul class="card-list">
              <li><strong>Precarización de servicios esenciales:</strong> Fallas sostenidas en la red eléctrica, suministro de agua y deterioro de la infraestructura pública.</li>
              <li><strong>Gestión sin métricas objetivas:</strong> Ausencia de levantamiento técnico riguroso y decisiones basadas en criterios clientelares.</li>
              <li><strong>Riesgos en canales informales:</strong> La dispersión en grupos de mensajería compromete la confidencialidad y dificulta la consolidación de datos.</li>
              <li><strong>Vulnerabilidad operativa:</strong> Exposición de la dirigencia comunitaria ante revisiones no autorizadas de dispositivos en campo.</li>
            </ul>
          </div>

          <div class="card highlight" style="border-left: 4px solid var(--navy-corp);">
            <div class="card-title" style="color: var(--navy-corp);">
              <span>🏛️ La Propuesta Gerencial de MIGATO</span>
            </div>
            <ul class="card-list">
              <li><strong>Estándares corporativos de primer nivel:</strong> Implementación de orden, método y rigurosidad técnica en la administración territorial.</li>
              <li><strong>Decisiones respaldadas en datos:</strong> Información georreferenciada y métricas confiables de las comunidades en tiempo real.</li>
              <li><strong>Comunicación estructurada y segura:</strong> Canales compartimentados por parroquia con trazabilidad institucional.</li>
              <li><strong>Soberanía de la información:</strong> Bases de datos resguardadas en un servidor cloud dedicado bajo control exclusivo de la organización.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- LÁMINA 3: LA PLATAFORMA EN 5 MÓDULOS -->
    <div class="slide" data-note="La plataforma constituye una solución tecnológica completa y operativa que articula cinco componentes complementarios: despacho parroquial por enlace web seguro, censo comunitario con resguardo de privacidad, seguimiento del padrón electoral con archivo de actas, consola cartográfica 3D y supervisión técnica de la red regional de salud. Todo el sistema opera bajo una arquitectura web unificada, accesible y sin intermediarios.">
      <div class="slide-header">
        <div>
          <div class="slide-tag">Arquitectura de Software</div>
          <h2 class="slide-title">Solución Integral: Plataforma Territorial en 5 Módulos</h2>
        </div>
        <img class="slide-watermark" src="data:image/png;base64,{logo_b64}">
      </div>
      <div class="slide-body">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div class="card" style="padding: 14px 18px; flex-direction: row; align-items: center; justify-content: space-between; border-left: 4px solid var(--navy-corp);">
            <div>
              <strong style="color: var(--navy-corp); font-size: 16px;">Módulo 1: Despacho Celular Seguro (/despacho/)</strong>
              <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 3px;">Enlaces cifrados por token web temporal directo al coordinador. Sin contraseñas complejas y con compartimentación territorial.</p>
            </div>
            <span style="background: var(--bg-subtle); color: var(--navy-corp); padding: 4px 10px; border-radius: 4px; font-size: 11.5px; font-weight: 700; border: 1px solid var(--border-light);">COORDINACIÓN</span>
          </div>

          <div class="card" style="padding: 14px 18px; flex-direction: row; align-items: center; justify-content: space-between; border-left: 4px solid var(--blue-primary);">
            <div>
              <strong style="color: var(--blue-primary); font-size: 16px;">Módulo 2: Censo Territorial y Privacidad (/carga/)</strong>
              <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 3px;">Protocolo de Cero Residuos en Dispositivo: registra variables cuantitativas de servicios sin almacenar datos personales ni cédulas.</p>
            </div>
            <span style="background: var(--bg-subtle); color: var(--blue-primary); padding: 4px 10px; border-radius: 4px; font-size: 11.5px; font-weight: 700; border: 1px solid var(--border-light);">COMUNITARIO</span>
          </div>

          <div class="card" style="padding: 14px 18px; flex-direction: row; align-items: center; justify-content: space-between; border-left: 4px solid var(--warning);">
            <div>
              <strong style="color: #B45309; font-size: 16px;">Módulo 3: Padrón Electoral y Resguardo de Actas (/centros-maturin/)</strong>
              <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 3px;">Catálogo de 175 centros y 361 mesas de Maturín. Organización de testigos y respaldo fotográfico de actas y código QR para auditoría interna.</p>
            </div>
            <span style="background: var(--bg-subtle); color: #B45309; padding: 4px 10px; border-radius: 4px; font-size: 11.5px; font-weight: 700; border: 1px solid var(--border-light);">ELECTORAL</span>
          </div>

          <div class="card" style="padding: 14px 18px; flex-direction: row; align-items: center; justify-content: space-between; border-left: 4px solid #4F46E5;">
            <div>
              <strong style="color: #4F46E5; font-size: 16px;">Módulo 4: Cartografía Tridimensional (/earth-monagas/)</strong>
              <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 3px;">Consola 3D de vialidad, relieve y servicios con filtro de focalización territorial para mesas de planificación estratégica.</p>
            </div>
            <span style="background: var(--bg-subtle); color: #4F46E5; padding: 4px 10px; border-radius: 4px; font-size: 11.5px; font-weight: 700; border: 1px solid var(--border-light);">LOGÍSTICA</span>
          </div>

          <div class="card" style="padding: 14px 18px; flex-direction: row; align-items: center; justify-content: space-between; border-left: 4px solid var(--success);">
            <div>
              <strong style="color: var(--success); font-size: 16px;">Módulo 5: Diagnóstico de la Red de Salud (/salud-monagas/)</strong>
              <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 3px;">Supervisión técnica de 84 centros asistenciales: plantas eléctricas, agua, quirófanos y base fehaciente para planes de gobierno.</p>
            </div>
            <span style="background: var(--bg-subtle); color: var(--success); padding: 4px 10px; border-radius: 4px; font-size: 11.5px; font-weight: 700; border: 1px solid var(--border-light);">SALUD REGIONAL</span>
          </div>
        </div>
      </div>
    </div>

    <!-- LÁMINA 4: MÓDULOS 1 Y 2 -->
    <div class="slide" data-note="En el trabajo de campo, la seguridad de nuestros coordinadores y la privacidad ciudadana son prioritarias. Por ello, el Módulo 1 elimina contraseñas mediante tokens seguros que dan acceso exclusivo a la parroquia asignada. En el Módulo 2, el censo se enfoca en necesidades cuantitativas (familias, viviendas, transformadores) y, por principio ético, no recopila nombres ni cédulas. Al enviar el formulario, los datos viajan cifrados y el teléfono queda completamente limpio.">
      <div class="slide-header">
        <div>
          <div class="slide-tag">Operatividad en Terreno</div>
          <h2 class="slide-title">Módulos 1 y 2: Coordinación Parroquial y Protección de Datos</h2>
        </div>
        <img class="slide-watermark" src="data:image/png;base64,{logo_b64}">
      </div>
      <div class="slide-body">
        <div class="grid-2">
          <div class="card">
            <div class="card-title">
              <span>📲 Módulo 1: Despacho Celular Seguro</span>
            </div>
            <ul class="card-list">
              <li><strong>Acceso Instantáneo por Token Web:</strong> Enlaces temporales cifrados enviados directamente al coordinador; ingreso inmediato sin necesidad de recordar contraseñas alfanuméricas complejas.</li>
              <li><strong>Compartimentación Territorial:</strong> Cada enlace opera exclusivamente en su área asignada, garantizando estricta segmentación de responsabilidades.</li>
              <li><strong>Revocación Inmediata de Credenciales:</strong> Ante cualquier relevo de personal, la credencial se desactiva desde la consola central sin interrumpir el servicio.</li>
              <li><strong>Compatibilidad Universal:</strong> Funciona directamente en navegadores móviles estándar sin requerir instalación de aplicaciones adicionales.</li>
            </ul>
          </div>

          <div class="card highlight">
            <div class="card-title" style="color: var(--navy-corp);">
              <span>🛡️ Módulo 2: Censo Comunitario y Protocolo de Privacidad</span>
            </div>
            <ul class="card-list">
              <li><strong>Protección de Identidad Ciudadana:</strong> Por directriz institucional, el sistema no solicita nombres, números de cédula ni teléfonos personales de los vecinos censados.</li>
              <li><strong>Diagnóstico de Servicios Básicos:</strong> Levantamiento riguroso de familias, viviendas y fallas críticas en suministro eléctrico, agua potable y vialidad.</li>
              <li><strong>Protocolo Zero-Byte Device Storage:</strong> Al presionar enviar, los datos se transmiten al servidor central vía HTTPS y el formulario se restablece. En el teléfono no se almacena historial ni borradores.</li>
              <li><strong>Tranquilidad Operativa:</strong> Blindaje total del activista frente a revisiones no autorizadas de dispositivos en la vía pública.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- LÁMINA 5: MÓDULO 3 (ELECTORAL Y ACTAS) -->
    <div class="slide" data-note="El Módulo 3 está concebido como una herramienta de archivo y auditoría interna para la organización, respetando plenamente el marco institucional. Mapea la totalidad de los 175 centros y 361 mesas de Maturín, identificando los 40 centros que concentran más del 60% del padrón. Facilita la asignación de testigos y permite cargar los resultados con respaldo fotográfico del acta física y comprobante impreso con su código QR, asegurando un expediente fehaciente para nuestro cotejo interno.">
      <div class="slide-header">
        <div>
          <div class="slide-tag">Auditoría Electoral Interna</div>
          <h2 class="slide-title">Módulo 3: Padrón Electoral, Centros de Votación y Resguardo de Actas</h2>
        </div>
        <img class="slide-watermark" src="data:image/png;base64,{logo_b64}">
      </div>
      <div class="slide-body">
        <div class="grid-3">
          <div class="card">
            <div class="card-title" style="font-size: 15.5px;">
              <span>🗺️ Catálogo de Centros</span>
            </div>
            <ul class="card-list">
              <li>Georreferenciación completa de 175 centros y 361 mesas electorales del Municipio Maturín.</li>
              <li>Identificación prioritaria de los 40 centros estratégicos que concentran más del 60% de los electores.</li>
              <li>Mapeo de accesos viales y distancias logísticas para optimizar la movilización.</li>
            </ul>
          </div>

          <div class="card">
            <div class="card-title" style="font-size: 15.5px;">
              <span>👥 Estructura de Testigos</span>
            </div>
            <ul class="card-list">
              <li>Registro y acreditación organizada de testigos principales y suplentes por mesa electoral.</li>
              <li>Segmentación de labores de asistencia ciudadana para adultos mayores y votantes jóvenes.</li>
              <li>Canal de reporte de incidencias y apertura de mesas en comunicación con la Sala Situacional.</li>
            </ul>
          </div>

          <div class="card success">
            <div class="card-title" style="font-size: 15.5px; color: var(--success);">
              <span>📄 Archivo de Evidencia</span>
            </div>
            <ul class="card-list">
              <li>Carga ordenada de resultados numéricos por mesa emitida por los testigos del partido.</li>
              <li>Almacenamiento de respaldo digital del acta física y del comprobante emitido por el sistema oficial.</li>
              <li>Registro fotográfico del código QR para auditoría y cotejo interno de la organización.</li>
              <li>Sin intervenir ni suplantar las competencias del Consejo Nacional Electoral.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- LÁMINA 6: MÓDULOS 4 Y 5 -->
    <div class="slide" data-note="El Módulo 4 ofrece a la Dirección una consola geoespacial tridimensional para evaluar la topografía, la red de carreteras y los servicios públicos. Incorpora un filtro de focalización territorial que atenúa las áreas circundantes para centrar el debate ejecutivo en la parroquia evaluada. Por su parte, el Módulo 5 audita técnicamente 84 centros de salud de Monagas, registrando el estado de plantas eléctricas y quirófanos, lo que provee el fundamento técnico indispensable para nuestras propuestas de gobierno.">
      <div class="slide-header">
        <div>
          <div class="slide-tag">Planificación Territorial y Salud</div>
          <h2 class="slide-title">Módulos 4 y 5: Cartografía Tridimensional y Auditoría Asistencial</h2>
        </div>
        <img class="slide-watermark" src="data:image/png;base64,{logo_b64}">
      </div>
      <div class="slide-body">
        <div class="grid-2">
          <div class="card">
            <div class="card-title">
              <span>🌐 Cartografía 3D de Infraestructura (/earth-monagas/)</span>
            </div>
            <ul class="card-list">
              <li><strong>Análisis Geoespacial Interactivo:</strong> Representación tridimensional de relieve, vialidad, comunidades y equipamiento de servicios en la entidad.</li>
              <li><strong>Herramienta de Focalización Territorial:</strong> Filtro visual que atenúa suavemente las zonas periféricas para concentrar el análisis en la parroquia o sector de interés.</li>
              <li><strong>Planificación de Rutas y Despliegue:</strong> Medición precisa de distancias y estimación de tiempos de traslado para jornadas institucionales de trabajo.</li>
              <li><strong>Optimizado para Sala de Mando:</strong> Interfaz adaptada para proyección en pantallas corporativas de alta definición.</li>
            </ul>
          </div>

          <div class="card highlight">
            <div class="card-title" style="color: var(--navy-corp);">
              <span>🏥 Diagnóstico de la Red Regional de Salud (/salud-monagas/)</span>
            </div>
            <ul class="card-list">
              <li><strong>Supervisión Integral de 84 Centros:</strong> Monitoreo técnico de hospitales universitarios, ambulatorios urbanos, rurales y centros de atención integral.</li>
              <li><strong>Estado de Servicios Críticos:</strong> Operatividad de generadores eléctricos de emergencia, suministro continuo de agua y salas quirúrgicas.</li>
              <li><strong>Red de Referencia y Traslado:</strong> Registro de las rutas de derivación de pacientes cuando la capacidad de resolución local se ve superada.</li>
              <li><strong>Fundamento Técnico para Políticas Públicas:</strong> Base de datos auditable que sustenta propuestas de rehabilitación sanitaria con criterios de ingeniería.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- LÁMINA 7: INFRAESTRUCTURA CLOUD Y SEGURIDAD -->
    <div class="slide" data-note="Una solución estratégica de esta magnitud requiere una infraestructura profesional. A diferencia de los alojamientos compartidos que sufren caídas imprevistas y carecen de aislamiento, un Servidor Virtual Privado dedicado nos otorga independencia, procesamiento exclusivo y respaldo continuo. Implementamos cifrado SSL de 256 bits, reglas de cortafuegos y pruebas de estrés para asegurar que la plataforma mantenga tiempos de respuesta inferiores a un segundo durante picos de concurrencia.">
      <div class="slide-header">
        <div>
          <div class="slide-tag">Infraestructura y Seguridad</div>
          <h2 class="slide-title">Seguridad de la Información y Servidor Cloud VPS Dedicado</h2>
        </div>
        <img class="slide-watermark" src="data:image/png;base64,{logo_b64}">
      </div>
      <div class="slide-body">
        <div class="grid-4">
          <div class="card">
            <div class="card-title" style="font-size: 15.5px;">
              <span>🔒 Cifrado SSL/TLS de 256 Bits</span>
            </div>
            <p style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.5;">
              Encriptación completa de extremo a extremo en todas las sesiones web, impidiendo la intercepción de tráfico o fuga de datos en redes públicas o conexiones móviles.
            </p>
          </div>

          <div class="card">
            <div class="card-title" style="font-size: 15.5px;">
              <span>🛡️ Auditoría de Vulnerabilidades</span>
            </div>
            <p style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.5;">
              Cierre estricto de puertos no esenciales, filtrado de conexiones mediante reglas iptables y mitigación automatizada de intentos de intrusión repetitivos (Fail2ban).
            </p>
          </div>

          <div class="card">
            <div class="card-title" style="font-size: 15.5px;">
              <span>⚡ Pruebas de Estrés y Concurrencia</span>
            </div>
            <p style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.5;">
              Simulaciones de alta demanda de tráfico para certificar que el servidor mantenga tiempos de respuesta óptimos (menores a 1 segundo) durante jornadas intensas de carga.
            </p>
          </div>

          <div class="card">
            <div class="card-title" style="font-size: 15.5px;">
              <span>💾 Respaldos Automatizados</span>
            </div>
            <p style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.5;">
              Generación periódica de copias de seguridad encriptadas fuera del servidor principal para asegurar la continuidad del servicio ante cualquier eventualidad técnica.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- LÁMINA 8: PRESUPUESTO DE INVERSIÓN -->
    <div class="slide" data-note="En esta lámina presentamos el análisis económico con estricta transparencia. El costo del desarrollo de software y arquitectura representa cero bolívares y cero dólares para la organización, habiendo sido aportado íntegramente por el equipo técnico. La inversión solicitada se limita exclusivamente a los costos directos de la nube: $20 mensuales por el VPS dedicado, $1.50 por el dominio y certificados SSL, y $3 por la IP fija. El total asciende a 24 dólares y medio mensuales, o 294 dólares anuales.">
      <div class="slide-header">
        <div>
          <div class="slide-tag">Estudio Económico y Factibilidad</div>
          <h2 class="slide-title">Presupuesto Operativo Mínimo: Fase 1</h2>
        </div>
        <img class="slide-watermark" src="data:image/png;base64,{logo_b64}">
      </div>
      <div class="slide-body">
        <div class="banner-kpi">
          <div class="banner-kpi-text">
            <h3>PRESUPUESTO SOLICITADO: ~$24.50 USD / mes</h3>
            <p>Inversión anual de infraestructura cloud: $294.00 USD • Honorarios de ingeniería y desarrollo: $0.00</p>
          </div>
          <div class="banner-kpi-badge">$294.00 USD / AÑO</div>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Componente de Infraestructura</th>
                <th>Especificación Técnica Mínima</th>
                <th style="text-align: center;">Costo Mensual</th>
                <th style="text-align: center;">Costo Anual</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Servidor Cloud VPS Dedicado</strong></td>
                <td>4 vCPU / 8 GB RAM / 100 GB SSD NVMe / Red 1 Gbps / Protección contra ataques</td>
                <td style="text-align: center;">$20.00 USD</td>
                <td style="text-align: center;">$240.00 USD</td>
              </tr>
              <tr>
                <td><strong>Dominio Institucional Oficial</strong></td>
                <td>Registro anual de dominio web corporativo + Certificado SSL Wildcard (256 bits)</td>
                <td style="text-align: center;">$1.50 USD</td>
                <td style="text-align: center;">$18.00 USD</td>
              </tr>
              <tr>
                <td><strong>IP Pública Fija Dedicada</strong></td>
                <td>Dirección IP estática exclusiva para filtrado de seguridad y acceso a consola de mando</td>
                <td style="text-align: center;">$3.00 USD</td>
                <td style="text-align: center;">$36.00 USD</td>
              </tr>
              <tr>
                <td><strong>Software de Servidor y Código</strong></td>
                <td>Entorno Linux Ubuntu Server, Nginx, PostgreSQL, Fail2ban y módulos FOSS</td>
                <td style="text-align: center; font-weight: bold; color: var(--success);">$0.00 USD</td>
                <td style="text-align: center; font-weight: bold; color: var(--success);">$0.00 USD</td>
              </tr>
              <tr class="total-row">
                <td>TOTAL MÍNIMO SOLICITADO (FASE 1):</td>
                <td>Infraestructura cloud dedicada y certificada para las pruebas piloto</td>
                <td style="text-align: center;" class="total-price">~$24.50 USD</td>
                <td style="text-align: center;" class="total-price">$294.00 USD</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- LÁMINA 9: PLAN DE DESPLIEGUE ESCALONADO -->
    <div class="slide" data-note="Con un criterio gerencial responsable, proponemos una implementación escalonada en dos etapas. La presente solicitud corresponde exclusivamente a la Fase 1, con una inversión única de 294 dólares anuales para encender el servidor y validar la plataforma en tres parroquias piloto de Maturín: Las Cocuizas, San Simón y Alto de Los Godos. La Fase 2, relativa al equipamiento físico de la Sala Situacional, se evaluará posteriormente según la disponibilidad y planificación del partido.">
      <div class="slide-header">
        <div>
          <div class="slide-tag">Estrategia de Ejecución</div>
          <h2 class="slide-title">Plan de Despliegue Escalonado por Fases</h2>
        </div>
        <img class="slide-watermark" src="data:image/png;base64,{logo_b64}">
      </div>
      <div class="slide-body">
        <div class="grid-2">
          <div class="card success" style="border-left: 4px solid var(--success);">
            <div class="card-title" style="color: var(--success);">
              <span>🚀 FASE 1: Inmediata (Objeto de esta Solicitud)</span>
            </div>
            <p style="font-size: 13.5px; color: var(--text-muted); margin-bottom: 12px; font-style: italic;">
              Inversión requerida: <strong>$294.00 USD anuales</strong>
            </p>
            <ul class="card-list">
              <li>Contratación del servidor cloud VPS y vinculación del dominio institucional.</li>
              <li>Instalación de la arquitectura de seguridad, reglas de firewall y certificados SSL de 256 bits.</li>
              <li>Ejecución de pruebas de carga, concurrencia y auditoría técnica de puertos.</li>
              <li><strong>Validación operativa en 3 parroquias piloto de Maturín:</strong> Las Cocuizas, San Simón y Alto de Los Godos.</li>
            </ul>
          </div>

          <div class="card subtle" style="border-left: 4px solid var(--border-card);">
            <div class="card-title" style="color: var(--navy-dark);">
              <span>🏢 FASE 2: Consolidación de Sala Situacional Física</span>
            </div>
            <p style="font-size: 13.5px; color: var(--text-muted); margin-bottom: 12px; font-style: italic;">
              Planificación diferida sujeta a disponibilidad de recursos del partido:
            </p>
            <ul class="card-list">
              <li>Acondicionamiento físico del centro de seguimiento y monitoreo territorial.</li>
              <li>Dotación de equipos de computación dedicados para operadores de consola.</li>
              <li>Instalación de pantallas de visualización general para seguimiento en tiempo real.</li>
              <li>Sistemas de respaldo eléctrico (inversores / UPS) para garantizar continuidad operativa ante fallas del servicio eléctrico regional.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- LÁMINA 10: CONCLUSIÓN Y DICTAMEN -->
    <div class="slide" data-note="Para concluir, reiteramos que la herramienta se encuentra completamente terminada, probada y lista para entrar en operación. Ofrece una alta solvencia funcional y un protocolo estricto de resguardo para la militancia. Con una inversión mínima de 294 dólares anuales, MIGATO se dota de una plataforma corporativa soberana. El Equipo Técnico recomienda formalmente la aprobación de este presupuesto para iniciar el encendido de inmediato. Quedamos a su disposición.">
      <div class="slide-header">
        <div>
          <div class="slide-tag">Dictamen Técnico y Decisión</div>
          <h2 class="slide-title">Conclusión y Recomendación Final del Equipo Técnico</h2>
        </div>
        <img class="slide-watermark" src="data:image/png;base64,{logo_b64}">
      </div>
      <div class="slide-body">
        <div class="card highlight" style="padding: 24px; border: 1.5px solid var(--navy-corp);">
          <div class="card-title" style="font-size: 19px; color: var(--navy-corp); margin-bottom: 14px;">
            <span>✅ Dictamen Favorable y Factibilidad Técnica</span>
          </div>
          <ul class="card-list" style="gap: 12px;">
            <li><strong>Madurez Funcional Comprobada:</strong> Los cinco módulos se encuentran programados y evaluados en entornos de prueba, garantizando plena operatividad sin riesgos de desarrollo.</li>
            <li><strong>Seguridad y Protección Institucional:</strong> El esquema de tokens web efímeros y formularios sin almacenamiento residual en dispositivos brinda tranquilidad y resguardo absoluto a la militancia.</li>
            <li><strong>Alta Rentabilidad de la Inversión:</strong> El monto solicitado ($294.00 USD anuales) cubre exclusivamente costos directos de servidor cloud, representando un valor mínimo frente a su alto impacto estratégico.</li>
          </ul>

          <div style="background: var(--navy-corp); color: #FFFFFF; padding: 14px 18px; border-radius: 6px; margin-top: 20px; display: flex; flex-direction: column; gap: 4px;">
            <strong style="color: #BAE6FD; font-size: 14.5px; text-transform: uppercase; letter-spacing: 0.5px;">RECOMENDACIÓN FINAL DE LA DIRECCIÓN TÉCNICA:</strong>
            <p style="font-size: 14px; line-height: 1.5; color: #FFFFFF;">
              El Equipo Técnico de Sistemas y Arquitectura Digital recomienda formalmente a la Dirección General de MIGATO <strong>aprobar el presupuesto operativo de $294.00 USD anuales</strong> para proceder de inmediato con la contratación del servidor dedicado y el inicio formal de las pruebas piloto.
            </p>
          </div>
        </div>
      </div>
    </div>

  </main>

  <!-- PANEL DE NOTAS DEL ORADOR (COLLAPSIBLE) -->
  <div class="speaker-drawer" id="speakerDrawer">
    <div class="speaker-header">
      <div class="speaker-title">🎙️ GUION DEL EXPOSITOR (DISCURSO SUGERIDO PARA ESTA LÁMINA)</div>
      <button class="speaker-close" onclick="toggleNotes()">✕</button>
    </div>
    <div class="speaker-text" id="speakerNotesText">
      Cargando guion...
    </div>
  </div>

  <!-- FOOTER DE NAVEGACIÓN -->
  <footer>
    <div class="dots-container" id="dotsContainer">
      <!-- Generado dinámicamente -->
    </div>

    <div class="nav-controls">
      <button class="btn-nav" id="btnPrev" onclick="prevSlide()" disabled>
        ← Anterior
      </button>
      <div class="slide-indicator" id="slideIndicator">01 / 10</div>
      <button class="btn-nav" id="btnNext" onclick="nextSlide()">
        Siguiente →
      </button>
    </div>
  </footer>

  <script>
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    const progressBar = document.getElementById('progressBar');
    const slideIndicator = document.getElementById('slideIndicator');
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    const dotsContainer = document.getElementById('dotsContainer');
    const speakerDrawer = document.getElementById('speakerDrawer');
    const speakerNotesText = document.getElementById('speakerNotesText');
    const btnNotes = document.getElementById('btnNotes');

    // Inicializar Dots
    for (let i = 0; i < totalSlides; i++) {{
      const dot = document.createElement('div');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.onclick = () => goToSlide(i);
      dotsContainer.appendChild(dot);
    }}

    function updateView() {{
      slides.forEach((slide, idx) => {{
        slide.classList.toggle('active', idx === currentSlide);
      }});

      const dots = document.querySelectorAll('.dot');
      dots.forEach((dot, idx) => {{
        dot.classList.toggle('active', idx === currentSlide);
      }});

      const slideNum = (currentSlide + 1).toString().padStart(2, '0');
      const totalNum = totalSlides.toString().padStart(2, '0');
      slideIndicator.textContent = `${{slideNum}} / ${{totalNum}}`;
      progressBar.style.width = `${{((currentSlide + 1) / totalSlides) * 100}}%`;

      btnPrev.disabled = currentSlide === 0;
      btnNext.disabled = currentSlide === totalSlides - 1;

      // Actualizar Guion del Orador
      const activeSlide = slides[currentSlide];
      const note = activeSlide.getAttribute('data-note') || "Sin notas específicas para esta lámina.";
      speakerNotesText.textContent = `"${{note}}"`;
    }}

    function nextSlide() {{
      if (currentSlide < totalSlides - 1) {{
        currentSlide++;
        updateView();
      }}
    }}

    function prevSlide() {{
      if (currentSlide > 0) {{
        currentSlide--;
        updateView();
      }}
    }}

    function goToSlide(index) {{
      if (index >= 0 && index < totalSlides) {{
        currentSlide = index;
        updateView();
      }}
    }}

    function toggleNotes() {{
      speakerDrawer.classList.toggle('open');
      btnNotes.classList.toggle('active');
    }}

    function toggleFullScreen() {{
      if (!document.fullscreenElement) {{
        document.documentElement.requestFullscreen().catch(err => {{
          console.log(err);
        }});
      }} else {{
        if (document.exitFullscreen) {{
          document.exitFullscreen();
        }}
      }}
    }}

    // Control por Teclado
    document.addEventListener('keydown', (e) => {{
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {{
        e.preventDefault();
        nextSlide();
      }} else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'Backspace') {{
        e.preventDefault();
        prevSlide();
      }} else if (e.key === 'f' || e.key === 'F') {{
        toggleFullScreen();
      }} else if (e.key === 'g' || e.key === 'G') {{
        toggleNotes();
      }} else if (e.key === 'p' || e.key === 'P') {{
        window.print();
      }}
    }});

    // Soporte Táctil (Swipe en Móviles)
    let touchStartX = 0;
    let touchEndX = 0;
    document.addEventListener('touchstart', e => {{
      touchStartX = e.changedTouches[0].screenX;
    }}, false);
    document.addEventListener('touchend', e => {{
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }}, false);

    function handleSwipe() {{
      const threshold = 50;
      if (touchEndX < touchStartX - threshold) {{
        nextSlide();
      }}
      if (touchEndX > touchStartX + threshold) {{
        prevSlide();
      }}
    }}

    // Iniciar vista
    updateView();
  </script>
</body>
</html>"""

    out_dir = PROJECT_ROOT / "presentacion"
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "index.html").write_text(html_content, encoding="utf-8")
    (PROJECT_ROOT / "presentacion.html").write_text(html_content, encoding="utf-8")
    print(f"[✓] Presentación Web Corporativa / Business generada exitosamente en:")
    print(f"    - {out_dir / 'index.html'}")
    print(f"    - {PROJECT_ROOT / 'presentacion.html'}")

if __name__ == "__main__":
    build_web_presentation()
