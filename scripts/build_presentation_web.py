#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de Presentación Web Interactiva HTML5 para MIGATO
10 Láminas Estratégicas - Basado en INFORME_TESIS_PRESUPUESTO_MIGATO_V3
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
  <title>MIGATO • Presentación Ejecutiva y Presupuesto Mínimo VPS</title>
  <link rel="icon" type="image/png" href="data:image/png;base64,{logo_b64}">
  <style>
    :root {{
      --bg-main: #0B1120;
      --bg-card: #1E293B;
      --bg-card-hover: #334155;
      --border-card: #334155;
      --primary: #0284C7;
      --primary-light: #38BDF8;
      --accent: #F59E0B;
      --success: #10B981;
      --danger: #EF4444;
      --text-main: #FFFFFF;
      --text-muted: #94A3B8;
      --text-light: #E2E8F0;
    }}

    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
    }}

    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      background-color: var(--bg-main);
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
      height: 5px;
      background: rgba(255, 255, 255, 0.08);
      z-index: 100;
    }}
    .progress-bar {{
      height: 100%;
      width: 10%;
      background: linear-gradient(90deg, #0284C7, #38BDF8);
      transition: width 0.3s ease;
    }}

    /* HEADER DE CONTROL */
    header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 24px;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      z-index: 90;
    }}
    .brand {{
      display: flex;
      align-items: center;
      gap: 12px;
    }}
    .brand img {{
      width: 38px;
      height: 38px;
      object-fit: contain;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
    }}
    .brand-title {{
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: var(--text-main);
    }}
    .brand-sub {{
      font-size: 11px;
      color: var(--primary-light);
      font-weight: 600;
    }}

    .header-actions {{
      display: flex;
      align-items: center;
      gap: 10px;
    }}
    .btn-action {{
      background: var(--bg-card);
      color: var(--text-light);
      border: 1px solid var(--border-card);
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
    }}
    .btn-action:hover {{
      background: var(--bg-card-hover);
      border-color: var(--primary-light);
      color: #fff;
    }}
    .btn-action.active {{
      background: var(--primary);
      border-color: var(--primary-light);
      color: #fff;
    }}

    /* CONTENEDOR PRINCIPAL DE LÁMINAS */
    .deck-container {{
      flex: 1;
      position: relative;
      width: 100%;
      height: calc(100vh - 130px);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }}

    .slide {{
      position: absolute;
      width: 92%;
      max-width: 1280px;
      height: 90%;
      max-height: 720px;
      background: radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 40px 50px;
      display: flex;
      flex-direction: column;
      opacity: 0;
      pointer-events: none;
      transform: scale(0.96) translateX(40px);
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7);
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
      margin-bottom: 24px;
      border-bottom: 1px solid var(--border-card);
      padding-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }}
    .slide-tag {{
      display: inline-block;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1px;
      color: var(--primary-light);
      text-transform: uppercase;
      margin-bottom: 6px;
    }}
    .slide-title {{
      font-size: 30px;
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.25;
    }}
    .slide-watermark {{
      width: 44px;
      height: 44px;
      opacity: 0.8;
    }}

    /* SLIDE CONTENT */
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
      gap: 24px;
      height: 100%;
    }}
    .grid-3 {{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      height: 100%;
    }}
    .grid-4 {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 20px;
      height: 100%;
    }}

    /* CARDS */
    .card {{
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid var(--border-card);
      border-radius: 14px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, border-color 0.2s;
    }}
    .card:hover {{
      border-color: var(--primary-light);
    }}
    .card.highlight {{
      border-color: var(--primary);
      background: rgba(2, 132, 199, 0.1);
    }}
    .card.danger {{
      border-color: rgba(239, 68, 68, 0.4);
      background: rgba(239, 68, 68, 0.05);
    }}
    .card.success {{
      border-color: rgba(16, 185, 129, 0.4);
      background: rgba(16, 185, 129, 0.05);
    }}

    .card-title {{
      font-size: 20px;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 10px;
    }}
    .card-list {{
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }}
    .card-list li {{
      font-size: 16px;
      color: var(--text-light);
      line-height: 1.5;
      position: relative;
      padding-left: 20px;
    }}
    .card-list li::before {{
      content: "•";
      color: var(--primary-light);
      position: absolute;
      left: 0;
      font-size: 20px;
      top: -2px;
    }}
    .card-list.danger li::before {{
      color: var(--danger);
    }}
    .card-list.success li::before {{
      color: var(--success);
    }}

    /* TABLA PRESUPUESTO */
    .table-container {{
      width: 100%;
      overflow-x: auto;
      background: rgba(15, 23, 42, 0.6);
      border-radius: 12px;
      border: 1px solid var(--border-card);
      margin-top: 10px;
    }}
    table {{
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 15px;
    }}
    th {{
      background: #0F172A;
      color: var(--primary-light);
      padding: 14px 18px;
      font-weight: 700;
      border-bottom: 2px solid var(--border-card);
    }}
    td {{
      padding: 13px 18px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      color: var(--text-light);
    }}
    tr:last-child td {{
      border-bottom: none;
    }}
    .total-row td {{
      background: rgba(2, 132, 199, 0.15);
      font-weight: 800;
      font-size: 17px;
      color: #FFFFFF;
      border-top: 2px solid var(--primary);
    }}
    .total-price {{
      color: var(--success) !important;
      font-size: 19px !important;
      font-weight: 800;
    }}

    /* BANNER DESTACADO */
    .banner-kpi {{
      background: linear-gradient(135deg, rgba(2, 132, 199, 0.25), rgba(15, 23, 42, 0.9));
      border: 1px solid var(--primary);
      border-radius: 14px;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }}
    .banner-kpi-text h3 {{
      font-size: 22px;
      font-weight: 800;
      color: #FFF;
    }}
    .banner-kpi-text p {{
      font-size: 14px;
      color: var(--text-muted);
      margin-top: 4px;
    }}
    .banner-kpi-badge {{
      background: var(--primary);
      color: #FFF;
      font-size: 26px;
      font-weight: 800;
      padding: 10px 22px;
      border-radius: 10px;
      letter-spacing: 0.5px;
    }}

    /* FOOTER DE NAVEGACIÓN */
    footer {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 30px;
      background: rgba(15, 23, 42, 0.95);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      z-index: 90;
    }}
    .nav-controls {{
      display: flex;
      align-items: center;
      gap: 16px;
    }}
    .btn-nav {{
      background: var(--bg-card);
      color: #FFF;
      border: 1px solid var(--border-card);
      padding: 10px 22px;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }}
    .btn-nav:hover:not(:disabled) {{
      background: var(--primary);
      border-color: var(--primary-light);
      transform: translateY(-1px);
    }}
    .btn-nav:disabled {{
      opacity: 0.35;
      cursor: not-allowed;
    }}
    .slide-indicator {{
      font-size: 15px;
      font-weight: 700;
      color: var(--text-light);
      min-width: 90px;
      text-align: center;
    }}

    /* DOTS DE NAVEGACIÓN */
    .dots-container {{
      display: flex;
      gap: 8px;
    }}
    .dot {{
      width: 11px;
      height: 11px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      cursor: pointer;
      transition: all 0.2s ease;
    }}
    .dot.active {{
      background: var(--primary-light);
      width: 28px;
      border-radius: 6px;
    }}

    /* PANEL DEL GUION DEL ORADOR */
    .speaker-drawer {{
      position: fixed;
      bottom: 75px;
      left: 50%;
      transform: translateX(-50%) translateY(120%);
      width: 90%;
      max-width: 1000px;
      background: #0F172A;
      border: 2px solid var(--primary);
      border-radius: 16px;
      padding: 20px 26px;
      box-shadow: 0 15px 40px rgba(0,0,0,0.8);
      z-index: 150;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }}
    .speaker-drawer.open {{
      transform: translateX(-50%) translateY(0);
    }}
    .speaker-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-card);
      padding-bottom: 8px;
    }}
    .speaker-title {{
      font-size: 14px;
      font-weight: 700;
      color: var(--primary-light);
      display: flex;
      align-items: center;
      gap: 6px;
    }}
    .speaker-close {{
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 18px;
      cursor: pointer;
    }}
    .speaker-text {{
      font-size: 15px;
      line-height: 1.6;
      color: #FFFFFF;
      font-style: italic;
    }}

    /* PORTADA ESPECIAL */
    .cover-slide {{
      text-align: center;
      justify-content: center;
      align-items: center;
      padding: 30px;
    }}
    .cover-logo {{
      width: 120px;
      height: 120px;
      object-fit: contain;
      margin-bottom: 20px;
      filter: drop-shadow(0 4px 12px rgba(2, 132, 199, 0.4));
    }}
    .cover-badge {{
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      background: rgba(2, 132, 199, 0.15);
      border: 1px solid var(--primary);
      color: var(--primary-light);
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.8px;
      margin-bottom: 14px;
    }}
    .cover-title {{
      font-size: 36px;
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.25;
      max-width: 900px;
      margin-bottom: 12px;
    }}
    .cover-sub {{
      font-size: 18px;
      color: var(--text-light);
      max-width: 800px;
      margin-bottom: 26px;
    }}
    .cover-footer {{
      font-size: 13px;
      color: var(--text-muted);
      border-top: 1px solid var(--border-card);
      padding-top: 14px;
      width: 100%;
      max-width: 600px;
    }}

    /* MEDIA PRINT (EXPORTAR A PDF DIAPOSITIVA POR PÁGINA) */
    @media print {{
      body {{
        overflow: visible;
        background: #000;
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
        background: #0F172A !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        padding: 40px !important;
      }}
    }}

    @media (max-width: 768px) {{
      .slide {{ padding: 24px 20px; width: 96%; height: 95%; }}
      .slide-title {{ font-size: 22px; }}
      .grid-2, .grid-3, .grid-4 {{ grid-template-columns: 1fr; gap: 14px; }}
      .card-title {{ font-size: 17px; }}
      .card-list li {{ font-size: 14px; }}
      .cover-title {{ font-size: 24px; }}
      .cover-sub {{ font-size: 15px; }}
      .header-actions .btn-text {{ display: none; }}
    }}
  </style>
</head>
<body>

  <!-- PROGRESO -->
  <div class="progress-container">
    <div class="progress-bar" id="progressBar"></div>
  </div>

  <!-- HEADER DE CONTROL -->
  <header>
    <div class="brand">
      <img src="data:image/png;base64,{logo_b64}" alt="Logo MIGATO">
      <div>
        <div class="brand-title">MIGATO • DIRECCIÓN ESTRATÉGICA</div>
        <div class="brand-sub">Equipo Técnico de Sistemas y Arquitectura Digital</div>
      </div>
    </div>

    <div class="header-actions">
      <button class="btn-action" id="btnNotes" onclick="toggleNotes()">
        🎙️ <span class="btn-text">Guion Orador</span>
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
    <div class="slide active cover-slide" data-note="Saludos cordiales a toda la Dirección de MIGATO. Hoy venimos a presentar la solución tecnológica definitiva para coordinar nuestras 44 parroquias y resguardar el voto. Todo el software ya fue desarrollado por nuestro equipo de ingenieros sin costo alguno de honorarios para el partido; el objetivo de hoy es aprobar un presupuesto mínimo de $24.50 al mes para encender el servidor privado en la nube.">
      <div class="cover-badge">REPÚBLICA BOLIVARIANA DE VENEZUELA • ESTADO MONAGAS</div>
      <img class="cover-logo" src="data:image/png;base64,{logo_b64}" alt="Logo MIGATO">
      <h1 class="cover-title">ARQUITECTURA DE GESTIÓN TERRITORIAL, SEGURIDAD Y PRESUPUESTO OPERATIVO</h1>
      <p class="cover-sub">Evaluación Integral de los 5 Módulos de Control, Servidor Cloud VPS Privado y Plan de Despliegue Tecnológico</p>
      <div class="cover-footer">
        Presentado por el <strong>Equipo Técnico de Sistemas y Arquitectura Digital</strong><br>
        Maturín, Estado Monagas • Septiembre de 2026
      </div>
    </div>

    <!-- LÁMINA 2: EL DESAFÍO EN MONAGAS -->
    <div class="slide" data-note="Compañeros, la administración de los servicios públicos en Monagas colapsó por pura improvisación burocrática. Hospitales a oscuras y apagones constantes. Frente a eso, nosotros en MIGATO representamos orden gerencial, competencia técnica y estándares corporativos. No podemos seguir organizando elecciones ni levantando censos vecinales por grupos de WhatsApp donde cualquiera se infiltra o la policía te revisa el celular en una alcabala.">
      <div class="slide-header">
        <div>
          <div class="slide-tag">Diagnóstico y Visión Política</div>
          <h2 class="slide-title">El Desafío en Monagas: Centralismo Ineficiente vs. Orden Técnico</h2>
        </div>
        <img class="slide-watermark" src="data:image/png;base64,{logo_b64}">
      </div>
      <div class="slide-body">
        <div class="grid-2">
          <div class="card danger">
            <div class="card-title" style="color: #F87171;">⚠️ La Realidad Actual (Improvisación y Colapso)</div>
            <ul class="card-list danger">
              <li><strong>Servicios públicos destrozados:</strong> Hospitales sin luz ni agua, comunidades sin transformadores y vías agrícolas destruidas.</li>
              <li><strong>Manejo clientelar:</strong> Gestión pública ciega, carente de métricas y sin datos técnicos reales.</li>
              <li><strong>Grupos masivos de WhatsApp:</strong> Información desordenada, fugas de datos y riesgo permanente de espionaje.</li>
              <li><strong>Vulnerabilidad de la base:</strong> Exposición de activistas y testigos ante revisiones arbitrarias de teléfonos en la calle.</li>
            </ul>
          </div>
          <div class="card highlight">
            <div class="card-title" style="color: var(--primary-light);">🏛️ La Alternativa MIGATO (Gerencia y Eficiencia)</div>
            <ul class="card-list">
              <li><strong>Supremacía técnica:</strong> Demostrar que Monagas puede gobernarse con estándares corporativos de primer mundo.</li>
              <li><strong>Decisiones con datos reales:</strong> Plataforma digital con indicadores auditables y modelos georreferenciados.</li>
              <li><strong>Canales compartimentados:</strong> Comunicación radial directa y segura con cada parroquia.</li>
              <li><strong>Soberanía informática:</strong> Bases de datos privadas alojadas en un servidor propio blindado.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- LÁMINA 3: LA PLATAFORMA EN 5 MÓDULOS -->
    <div class="slide" data-note="Esta plataforma no es una maqueta ni una promesa a futuro: ya está totalmente programada y probada. Integra cinco módulos neurálgicos: despacho celular sin claves para el coordinador, censo comunitario que se borra del teléfono, defensa del padrón con resguardo de actas, mapa 3D interactivo y diagnóstico de los 84 centros de salud. Todo en una sola plataforma unificada.">
      <div class="slide-header">
        <div>
          <div class="slide-tag">Arquitectura del Sistema</div>
          <h2 class="slide-title">La Solución: Plataforma Territorial MIGATO en 5 Módulos</h2>
        </div>
        <img class="slide-watermark" src="data:image/png;base64,{logo_b64}">
      </div>
      <div class="slide-body">
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div class="card" style="padding: 16px 20px; flex-direction: row; align-items: center; justify-content: space-between; border-left: 5px solid var(--primary);">
            <div>
              <strong style="color: var(--primary-light); font-size: 17px;">Módulo 1: Despacho Celular Seguro (/despacho/)</strong>
              <p style="font-size: 14px; color: var(--text-light); margin-top: 4px;">Enlaces por token web directo al teléfono. Cero contraseñas que olvidar y compartimentación parroquial estricta.</p>
            </div>
            <span style="background: rgba(2, 132, 199, 0.2); color: var(--primary-light); padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700;">ENLACES</span>
          </div>

          <div class="card" style="padding: 16px 20px; flex-direction: row; align-items: center; justify-content: space-between; border-left: 5px solid var(--success);">
            <div>
              <strong style="color: var(--success); font-size: 17px;">Módulo 2: Censo Territorial "Buzón Ciego" (/carga/)</strong>
              <p style="font-size: 14px; color: var(--text-light); margin-top: 4px;">Protocolo Zero-Byte Storage: no guarda nombres ni cédulas. Al enviar se restablece y en el celular queda CERO rastro.</p>
            </div>
            <span style="background: rgba(16, 185, 129, 0.2); color: var(--success); padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700;">COMUNIDAD</span>
          </div>

          <div class="card" style="padding: 16px 20px; flex-direction: row; align-items: center; justify-content: space-between; border-left: 5px solid var(--accent);">
            <div>
              <strong style="color: var(--accent); font-size: 17px;">Módulo 3: Padrón Electoral y Resguardo de Actas (/centros-maturin/)</strong>
              <p style="font-size: 14px; color: var(--text-light); margin-top: 4px;">175 centros y 361 mesas mapeados. Asignación de testigos y respaldo fotográfico de actas y código QR para auditoría interna.</p>
            </div>
            <span style="background: rgba(245, 158, 11, 0.2); color: var(--accent); padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700;">ELECTORAL</span>
          </div>

          <div class="card" style="padding: 16px 20px; flex-direction: row; align-items: center; justify-content: space-between; border-left: 5px solid #818CF8;">
            <div>
              <strong style="color: #818CF8; font-size: 17px;">Módulo 4: Cartografía Tridimensional 3D (/earth-monagas/)</strong>
              <p style="font-size: 14px; color: var(--text-light); margin-top: 4px;">Consola 3D de relieve y vialidad con filtro de atenuación periférica para focalizar reuniones de comando.</p>
            </div>
            <span style="background: rgba(129, 140, 248, 0.2); color: #818CF8; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700;">MAPA 3D</span>
          </div>

          <div class="card" style="padding: 16px 20px; flex-direction: row; align-items: center; justify-content: space-between; border-left: 5px solid var(--primary-light);">
            <div>
              <strong style="color: var(--primary-light); font-size: 17px;">Módulo 5: Diagnóstico y Auditoría de Salud (/salud-monagas/)</strong>
              <p style="font-size: 14px; color: var(--text-light); margin-top: 4px;">Supervisión de 84 centros de salud: plantas eléctricas, agua, quirófanos y base fehaciente para el plan de gobierno.</p>
            </div>
            <span style="background: rgba(56, 189, 248, 0.2); color: var(--primary-light); padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700;">SALUD</span>
          </div>
        </div>
      </div>
    </div>

    <!-- LÁMINA 4: MÓDULOS 1 Y 2 -->
    <div class="slide" data-note="El mayor miedo de nuestra gente en la calle es una alcabala donde les obliguen a desbloquear el teléfono. Por eso diseñamos seguridad por defecto: el coordinador entra con un enlace web único directo, sin claves. Y cuando llena el censo de una comunidad, no pide cédulas ni nombres. Al presionar Enviar, los datos van al servidor cifrados y la pantalla queda en blanco. En la memoria del teléfono queda CERO información sensible.">
      <div class="slide-header">
        <div>
          <div class="slide-tag">Operatividad en Terreno</div>
          <h2 class="slide-title">Módulos 1 y 2: Coordinación Parroquial y Censo Seguro</h2>
        </div>
        <img class="slide-watermark" src="data:image/png;base64,{logo_b64}">
      </div>
      <div class="slide-body">
        <div class="grid-2">
          <div class="card">
            <div class="card-title" style="color: var(--primary-light);">📲 Despacho Celular Seguro (M1)</div>
            <ul class="card-list">
              <li><strong>Token Web Efímero:</strong> El operador central genera un link cifrado y se lo envía al coordinador. Entra con un toque sin memorizar claves complejas.</li>
              <li><strong>Compartimentación Territorial:</strong> El coordinador de Las Cocuizas solo visualiza su parroquia; no tiene acceso al resto del estado.</li>
              <li><strong>Revocación en Segundos:</strong> Si se sustituye a un responsable, la Sala de Mando anula su credencial de inmediato sin reiniciar el servidor.</li>
              <li><strong>Cero Apps:</strong> Funciona directamente en Google Chrome o Safari en cualquier teléfono inteligente.</li>
            </ul>
          </div>
          <div class="card success">
            <div class="card-title" style="color: var(--success);">🛡️ Censo "Buzón Ciego" (M2)</div>
            <ul class="card-list success">
              <li><strong>Protección de Datos Vecinales:</strong> Por principio ético, NO se registran nombres, cédulas ni números telefónicos de los vecinos.</li>
              <li><strong>Variables Cuantitativas:</strong> Registra número de familias, viviendas, fuerza comunitaria y fallas críticas de luz, agua y vialidad.</li>
              <li><strong>Protocolo Zero-Byte Storage:</strong> Al presionar enviar, los datos suben por HTTPS y el formulario se reinicia. En el teléfono no queda caché ni historial.</li>
              <li><strong>Blindaje ante Alcabalas:</strong> Si inspeccionan el teléfono del activista en la calle, el dispositivo está 100% limpio.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- LÁMINA 5: MÓDULO 3 (PADRÓN ELECTORAL Y ACTAS) -->
    <div class="slide" data-note="Aclaramos que el Módulo 3 no es un intermediario del CNE ni promete cosas irreales. Es una herramienta de control y resguardo interno para el partido. Tenemos los 175 centros y 361 mesas de Maturín mapeados. Sabemos que 40 centros concentran más del 60% del padrón. Asignamos testigos y, al cerrar la mesa, el testigo sube el resultado y la foto nítida del acta y del comprobante impreso con su código QR. Así MIGATO tiene sus actas respaldadas e inexpugnables.">
      <div class="slide-header">
        <div>
          <div class="slide-tag">Defensa del Voto y Auditoría Interna</div>
          <h2 class="slide-title">Módulo 3: Padrón Electoral, Testigos y Resguardo de Actas</h2>
        </div>
        <img class="slide-watermark" src="data:image/png;base64,{logo_b64}">
      </div>
      <div class="slide-body">
        <div class="grid-3">
          <div class="card">
            <div class="card-title" style="color: var(--primary-light); font-size: 18px;">🗺️ 175 Centros de Maturín</div>
            <ul class="card-list">
              <li>Georreferenciación exacta de la totalidad de los 175 centros y 361 mesas del Municipio Maturín.</li>
              <li>Priorización de los 40 centros que concentran más del 60% del caudal electoral del municipio.</li>
              <li>Rutas de acceso, vías de movilización y logística para el día de votación.</li>
            </ul>
          </div>
          <div class="card">
            <div class="card-title" style="color: var(--accent); font-size: 18px;">👥 Organización de Testigos</div>
            <ul class="card-list">
              <li>Asignación organizada de testigos principales y suplentes con número de mesa correspondiente.</li>
              <li>Segmentación de acompañamiento ciudadano a votantes mayores y nuevos votantes jóvenes.</li>
              <li>Reporte de apertura de mesas e incidencias en tiempo real hacia la Sala Situacional.</li>
            </ul>
          </div>
          <div class="card success">
            <div class="card-title" style="color: var(--success); font-size: 18px;">📸 Archivo de Actas y QR</div>
            <ul class="card-list success">
              <li>Carga de resultados mesa por mesa por el testigo acreditado.</li>
              <li>Almacenamiento de la fotografía de respaldo del acta física y comprobante impreso oficial.</li>
              <li>Captura nítida del código QR impreso para auditoría y cotejo interno de MIGATO.</li>
              <li>Sin intervenir ni suplantar las atribuciones del CNE.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- LÁMINA 6: MÓDULOS 4 Y 5 -->
    <div class="slide" data-note="El Módulo 4 nos da una consola 3D de terreno para planificar caravanas y despliegues sin perder tiempo. Tiene un filtro visual de velo que atenúa lo que no estamos discutiendo para enfocar la mirada del equipo en la parroquia clave. Y el Módulo 5 es vital para la propuesta política: 84 centros de salud auditados con datos de si hay luz, agua o médicos. Es el sustento técnico para demostrarle a Monagas cómo vamos a rescatar la salud pública.">
      <div class="slide-header">
        <div>
          <div class="slide-tag">Planificación Territorial y Salud</div>
          <h2 class="slide-title">Módulos 4 y 5: Cartografía Tridimensional y Red Asistencial</h2>
        </div>
        <img class="slide-watermark" src="data:image/png;base64,{logo_b64}">
      </div>
      <div class="slide-body">
        <div class="grid-2">
          <div class="card">
            <div class="card-title" style="color: #818CF8;">🌐 Cartografía 3D (/earth-monagas/)</div>
            <ul class="card-list">
              <li><strong>Consola Tridimensional Interactiva:</strong> Mapeo de relieve, elevaciones, vialidad, distribución comunitaria y servicios.</li>
              <li><strong>Filtro de Focalización Territorial:</strong> Atenuación periférica suave que resalta la parroquia analizada durante reuniones ejecutivas de comando.</li>
              <li><strong>Planificación Logística:</strong> Cálculo de distancias reales, tiempos de traslado de los equipos y evaluación de vías de penetración.</li>
              <li><strong>Soporte en Pantalla Gigante:</strong> Diseñado para operar con fluidez en monitores de alta resolución.</li>
            </ul>
          </div>
          <div class="card highlight">
            <div class="card-title" style="color: var(--primary-light);">🏥 Diagnóstico de Salud (/salud-monagas/)</div>
            <ul class="card-list">
              <li><strong>84 Centros Monitoreados:</strong> Hospital Universitario Dr. Manuel Núñez Tovar, ambulatorios urbanos, rurales y centros integrales.</li>
              <li><strong>Servicios Críticos:</strong> Estatus de operatividad de plantas eléctricas de emergencia, agua por tubería, gases medicinales y salas de parto.</li>
              <li><strong>Red de Referencia Médica:</strong> Registro de derivación de pacientes cuando la atención primaria colapsa.</li>
              <li><strong>Sustento para Propuesta de Gobierno:</strong> Datos de ingeniería sanitaria para presentar soluciones hospitalarias concretas al estado.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- LÁMINA 7: BLINDAJE INFORMÁTICO -->
    <div class="slide" data-note="No podemos montar el cerebro de nuestro partido en un hosting compartido gratis de 2 dólares donde nos corten el servicio en medio de una campaña. Necesitamos un VPS dedicado, exclusivo para MIGATO. Toda la información viaja cifrada con algoritmos de 256 bits y haremos pruebas de estrés y concurrencia para certificar que el servidor soporte miles de peticiones simultáneas sin ponerse lento ni caerse jamás.">
      <div class="slide-header">
        <div>
          <div class="slide-tag">Seguridad de la Información</div>
          <h2 class="slide-title">Blindaje Informático y Servidor Cloud VPS Dedicado</h2>
        </div>
        <img class="slide-watermark" src="data:image/png;base64,{logo_b64}">
      </div>
      <div class="slide-body">
        <div class="grid-4">
          <div class="card">
            <div class="card-title" style="color: var(--primary-light); font-size: 18px;">🔒 Cifrado SSL 256 Bits</div>
            <p style="font-size: 14px; color: var(--text-light); line-height: 1.5;">
              Toda la comunicación entre los teléfonos de los coordinadores y la base de datos viaja bajo túnel HTTPS cifrado. Imposible de interceptar en redes WiFi o telefonía celular.
            </p>
          </div>
          <div class="card">
            <div class="card-title" style="color: var(--accent); font-size: 18px;">🛡️ Auditoría de Vulnerabilidades</div>
            <p style="font-size: 14px; color: var(--text-light); line-height: 1.5;">
              Cierre estricto de puertos no esenciales, cortafuegos iptables, protección Fail2ban contra ataques de fuerza bruta y consola de mando restringida a IPs autorizadas.
            </p>
          </div>
          <div class="card">
            <div class="card-title" style="color: var(--success); font-size: 18px;">⚡ Pruebas de Estrés y Carga</div>
            <p style="font-size: 14px; color: var(--text-light); line-height: 1.5;">
              Simulaciones de concurrencia masiva para garantizar tiempos de respuesta inferiores a 1 segundo durante los momentos de mayor volumen de reportes en campo.
            </p>
          </div>
          <div class="card">
            <div class="card-title" style="color: #A78BFA; font-size: 18px;">💾 Respaldos Automatizados</div>
            <p style="font-size: 14px; color: var(--text-light); line-height: 1.5;">
              Copias de seguridad periódicas encriptadas fuera del servidor para garantizar la recuperación inmediata e íntegra de la base de datos ante cualquier contingencia.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- LÁMINA 8: PRESUPUESTO MÍNIMO -->
    <div class="slide" data-note="Miren esta lámina con total atención y transparencia: la inversión que estamos solicitando son exactamente 294 dólares AL AÑO, es decir, 24 dólares y medio al mes. El equipo técnico no cobra ni un solo centavo de honorarios; el software ya está hecho. Esto es costo directo del fierro en la nube: el servidor VPS, el dominio oficial y la IP dedicada. Es una cifra perfectamente viable para cualquier organización seria.">
      <div class="slide-header">
        <div>
          <div class="slide-tag">Estudio Económico y Factibilidad</div>
          <h2 class="slide-title">Presupuesto Mínimo Operativo: Fase 1</h2>
        </div>
        <img class="slide-watermark" src="data:image/png;base64,{logo_b64}">
      </div>
      <div class="slide-body">
        <div class="banner-kpi">
          <div class="banner-kpi-text">
            <h3>TOTAL SOLICITADO: ~$24.50 USD / mes</h3>
            <p>Inversión anual total de $294.00 USD • Costo de desarrollo técnico: $0.00 (Aporte militante)</p>
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
                <td>4 vCPU / 8 GB RAM / 100 GB SSD NVMe / Red 1 Gbps / Protección Anti-DDoS</td>
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
                <td>Dirección IP estática exclusiva para filtrado seguro de conexiones a la consola</td>
                <td style="text-align: center;">$3.00 USD</td>
                <td style="text-align: center;">$36.00 USD</td>
              </tr>
              <tr>
                <td><strong>Software de Servidor y Código</strong></td>
                <td>Entorno Linux Ubuntu Server, Nginx, PostgreSQL, Fail2ban y módulos FOSS</td>
                <td style="text-align: center;">$0.00 USD</td>
                <td style="text-align: center;">$0.00 USD</td>
              </tr>
              <tr class="total-row">
                <td>TOTAL MÍNIMO SOLICITADO (FASE 1):</td>
                <td>Infraestructura cloud soberana para pruebas de estrés y validación piloto</td>
                <td style="text-align: center;" class="total-price">~$24.50 USD</td>
                <td style="text-align: center;" class="total-price">$294.00 USD</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- LÁMINA 9: PLAN DE DESPLIEGUE POR FASES -->
    <div class="slide" data-note="No venimos a pedir un cheque en blanco para comprar computadoras caras o televisores ahora mismo. Hemos estructurado el proyecto en dos fases con criterio gerencial. Hoy solo pedimos la Fase 1: 294 dólares para contratar el VPS y arrancar las pruebas piloto en las tres parroquias con más votantes de Maturín: Las Cocuizas, San Simón y Los Godos. La Fase 2 vendrá después cuando el partido decida acondicionar físicamente la sala situacional.">
      <div class="slide-header">
        <div>
          <div class="slide-tag">Estrategia de Ejecución</div>
          <h2 class="slide-title">Plan de Despliegue Escalonado por Fases</h2>
        </div>
        <img class="slide-watermark" src="data:image/png;base64,{logo_b64}">
      </div>
      <div class="slide-body">
        <div class="grid-2">
          <div class="card success">
            <div class="card-title" style="color: var(--success);">
              <span>🚀 FASE 1: Inmediata (Objeto de esta solicitud)</span>
            </div>
            <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 12px; font-style: italic;">
              Inversión única requerida: <strong>$294.00 USD anuales</strong>
            </p>
            <ul class="card-list success">
              <li>Contratación del VPS dedicado y registro del dominio oficial.</li>
              <li>Instalación del stack tecnológico blindado (Linux, SSL 256 bits, firewall).</li>
              <li>Pruebas de concurrencia, estrés y auditoría de vulnerabilidades.</li>
              <li><strong>Validación en 3 parroquias piloto de Maturín:</strong> Las Cocuizas, San Simón y Alto de Los Godos con coordinadores reales.</li>
            </ul>
          </div>

          <div class="card">
            <div class="card-title" style="color: var(--text-muted);">
              <span>🏢 FASE 2: Consolidación de Sala Física</span>
            </div>
            <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 12px; font-style: italic;">
              Sujeta a etapas posteriores y disponibilidad de recursos del partido:
            </p>
            <ul class="card-list">
              <li>Dotación física del espacio de comando y monitoreo territorial.</li>
              <li>Computadoras dedicadas para los operadores de sala situacional.</li>
              <li>Pantallas de visualización simultánea de los 5 módulos en tiempo real.</li>
              <li>Sistemas de respaldo eléctrico (inversores / UPS) para operar durante fallas de luz regional.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- LÁMINA 10: CONCLUSIÓN Y DICTAMEN -->
    <div class="slide" data-note="Para concluir, señores de la Dirección: la plataforma está terminada. No hay que esperar meses de desarrollo ni contratar empresas privadas que cobran fortunas. Si hoy se aprueba este presupuesto de 294 dólares al año, en menos de 48 horas el servidor estará activo y comenzaremos las pruebas piloto. Estamos listos para responder cualquier pregunta técnica o financiera. Muchas gracias.">
      <div class="slide-header">
        <div>
          <div class="slide-tag">Dictamen Técnico y Decisión</div>
          <h2 class="slide-title">Conclusión: Plataforma Lista y Llamado a la Aprobación</h2>
        </div>
        <img class="slide-watermark" src="data:image/png;base64,{logo_b64}">
      </div>
      <div class="slide-body">
        <div class="card highlight" style="padding: 28px;">
          <div class="card-title" style="font-size: 22px; color: var(--primary-light); margin-bottom: 18px;">
            ✅ Dictamen Técnico Favorable y Conclusiones
          </div>
          <ul class="card-list" style="gap: 16px;">
            <li><strong>Madurez Operativa Total:</strong> Los cinco módulos se encuentran programados y validados localmente. No existe riesgo de desarrollo.</li>
            <li><strong>Protección Humana e Inexpugnabilidad:</strong> Los coordinadores y la militancia de base cuentan con un escudo de privacidad real (tokens web efímeros y formularios sin residuo en dispositivo).</li>
            <li><strong>Máximo Retorno Político y Organizativo:</strong> Con una inversión mínima de $294.00 USD al año, MIGATO adquiere soberanía de datos y se posiciona en la cúspide tecnológica de Monagas.</li>
          </ul>

          <div style="background: rgba(16, 185, 129, 0.15); border-left: 4px solid var(--success); padding: 16px 20px; border-radius: 8px; margin-top: 24px;">
            <strong style="color: var(--success); font-size: 16px;">RECOMENDACIÓN FINAL:</strong>
            <p style="color: #FFFFFF; font-size: 15px; margin-top: 4px;">
              El Equipo Técnico de Sistemas y Arquitectura Digital recomienda formalmente a la Dirección General de MIGATO <strong>aprobar el presupuesto operativo de $294.00 USD anuales</strong> para proceder de inmediato con el encendido formal del servidor cloud y la validación en parroquias piloto.
            </p>
          </div>
        </div>
      </div>
    </div>

  </main>

  <!-- PANEL DE NOTAS DEL ORADOR (COLLAPSIBLE) -->
  <div class="speaker-drawer" id="speakerDrawer">
    <div class="speaker-header">
      <div class="speaker-title">🎙️ GUION DEL ORADOR (QUÉ DECIR EN ESTA LÁMINA)</div>
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
      <div class="slide-indicator" id="slideIndicator">1 / 10</div>
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

      slideIndicator.textContent = `${{currentSlide + 1}} / ${{totalSlides}}`;
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
        nextSlide(); // Swipe izquierda -> siguiente
      }}
      if (touchEndX > touchStartX + threshold) {{
        prevSlide(); // Swipe derecha -> anterior
      }}
    }}

    // Iniciar vista
    updateView();
  </script>
</body>
</html>"""

    # Guardar en presentacion/index.html y presentacion.html
    out_dir = PROJECT_ROOT / "presentacion"
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "index.html").write_text(html_content, encoding="utf-8")
    (PROJECT_ROOT / "presentacion.html").write_text(html_content, encoding="utf-8")
    print(f"[✓] Presentación Web generada exitosamente en:")
    print(f"    - {out_dir / 'index.html'}")
    print(f"    - {PROJECT_ROOT / 'presentacion.html'}")

if __name__ == "__main__":
    build_web_presentation()
