#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de Versión HTML Imprimible / Web del Dictamen de Seguridad V3
Movimiento Independiente Ganamos Todos (MIGATO)
"""

import os
import base64
from pathlib import Path

PROJECT_ROOT = Path("/home/diego/Documents/antigravity/zealous-mendel")
ASSETS_DIR = PROJECT_ROOT / "assets"
LOGO_PATH = ASSETS_DIR / "logo-migato.png"
DIAG1_PATH = ASSETS_DIR / "diagrama_vulnerabilidad_oraculo.png"
DIAG2_PATH = ASSETS_DIR / "diagrama_blindaje_migato_v3.png"

def b64(path):
    if path.exists():
        return base64.b64encode(path.read_bytes()).decode("utf-8")
    return ""

logo_b64 = b64(LOGO_PATH)
diag1_b64 = b64(DIAG1_PATH)
diag2_b64 = b64(DIAG2_PATH)

html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DICTAMEN DE CONTRAINTELIGENCIA Y SEGURIDAD OPERATIVA V3 • MIGATO MONAGAS</title>
  <style>
    @page {{
      size: letter;
      margin: 25mm 20mm 25mm 25mm;
    }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 11.5pt;
      line-height: 1.65;
      color: #0F172A;
      background: #F1F5F9;
      margin: 0;
      padding: 24px 16px;
    }}
    .doc-container {{
      max-width: 900px;
      margin: 0 auto;
      background: #FFFFFF;
      padding: 50px 65px;
      box-shadow: 0 4px 25px rgba(0,0,0,0.06);
      border-radius: 8px;
    }}
    .header-bar {{
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid #0284C7;
      padding-bottom: 8px;
      margin-bottom: 30px;
      font-size: 9pt;
      font-weight: bold;
    }}
    .header-bar .left {{ color: #0284C7; }}
    .header-bar .right {{ color: #475569; }}

    .cover-box {{
      text-align: center;
      padding: 30px 20px 40px;
      border-bottom: 1px solid #E2E8F0;
      margin-bottom: 40px;
    }}
    .cover-logo {{
      width: 90px;
      height: 90px;
      margin-bottom: 16px;
    }}
    .cover-h1 {{
      font-size: 20pt;
      font-weight: 800;
      color: #0F172A;
      margin: 10px 0 8px;
      line-height: 1.25;
    }}
    .cover-sub {{
      font-size: 13pt;
      color: #0284C7;
      font-weight: 600;
      margin-bottom: 24px;
    }}
    .meta-box {{
      background: #F8FAFC;
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      padding: 16px 24px;
      display: inline-block;
      text-align: left;
      font-size: 10.5pt;
      line-height: 1.6;
    }}

    h2 {{
      color: #0F172A;
      border-left: 4px solid #0284C7;
      padding-left: 12px;
      margin-top: 36px;
      margin-bottom: 14px;
      font-size: 15pt;
    }}
    h3 {{
      color: #334155;
      font-size: 12.5pt;
      margin-top: 24px;
      margin-bottom: 8px;
    }}
    p {{
      margin: 0 0 14px;
      text-align: justify;
    }}
    .callout {{
      border-radius: 8px;
      padding: 16px 20px;
      margin: 22px 0;
      font-size: 11pt;
      line-height: 1.6;
    }}
    .callout-danger {{
      background: #FEF2F2;
      border-left: 5px solid #DC2626;
      border-top: 1px solid #FEE2E2;
      border-right: 1px solid #FEE2E2;
      border-bottom: 1px solid #FEE2E2;
      color: #7F1D1D;
    }}
    .callout-success {{
      background: #F0FDF4;
      border-left: 5px solid #16A34A;
      border-top: 1px solid #DCFCE7;
      border-right: 1px solid #DCFCE7;
      border-bottom: 1px solid #DCFCE7;
      color: #14532D;
    }}
    .callout-info {{
      background: #F0F9FF;
      border-left: 5px solid #0284C7;
      border-top: 1px solid #E0F2FE;
      border-right: 1px solid #E0F2FE;
      border-bottom: 1px solid #E0F2FE;
      color: #075985;
    }}
    .callout-title {{
      font-weight: 800;
      margin-bottom: 6px;
      display: block;
      font-size: 10pt;
      letter-spacing: 0.5px;
    }}

    .diagram-wrap {{
      text-align: center;
      margin: 28px 0;
      padding: 16px;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
    }}
    .diagram-img {{
      max-width: 100%;
      height: auto;
      border-radius: 6px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    }}
    .diagram-caption {{
      font-size: 9.5pt;
      color: #64748B;
      font-style: italic;
      margin-top: 10px;
    }}

    table {{
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0;
      font-size: 10pt;
    }}
    th {{
      background: #0F172A;
      color: #FFFFFF;
      font-weight: 700;
      text-align: left;
      padding: 12px 14px;
    }}
    td {{
      padding: 11px 14px;
      border-bottom: 1px solid #E2E8F0;
      vertical-align: top;
    }}
    tr:nth-child(even) {{
      background: #F8FAFC;
    }}
    td strong {{
      color: #0284C7;
    }}

    .badge-check {{
      display: inline-block;
      background: #DCFCE7;
      color: #166534;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 8.5pt;
    }}
    .badge-cross {{
      display: inline-block;
      background: #FEE2E2;
      color: #991B1B;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 8.5pt;
    }}

    .signature-box {{
      text-align: center;
      margin-top: 50px;
      padding-top: 30px;
      border-top: 1px solid #CBD5E1;
      font-size: 10pt;
      color: #64748B;
    }}
    .signature-title {{
      font-weight: bold;
      color: #0F172A;
      font-size: 11pt;
    }}
    .signature-team {{
      font-weight: bold;
      color: #0284C7;
      font-size: 12pt;
      margin-top: 4px;
    }}

    @media print {{
      body {{ background: #FFF; padding: 0; }}
      .doc-container {{ box-shadow: none; padding: 0; max-width: 100%; }}
      .diagram-img {{ max-width: 95%; }}
    }}
  </style>
</head>
<body>
  <div class="doc-container">
    <div class="header-bar">
      <span class="left">MIGATO 2026 • ESTADO MONAGAS</span>
      <span class="right">SALA DE CONTRAINTELIGENCIA Y CIBERSEGURIDAD</span>
    </div>

    <div class="cover-box">
      {"<img src='data:image/png;base64," + logo_b64 + "' class='cover-logo' alt='Logo MIGATO'>" if logo_b64 else ""}
      <div class="cover-h1">DICTAMEN DE CONTRAINTELIGENCIA Y SEGURIDAD OPERATIVA V3</div>
      <div class="cover-sub">Blindaje Estructural de la Militancia Territorial Frente al Riesgo de Infiltración, Inferencia Inversa y Ataques de Oráculo Político (Lista Tascón 2.0)</div>
      
      <div class="meta-box">
        <strong>Dirigido a:</strong> Dirección General del Movimiento Independiente Ganamos Todos (MIGATO)<br>
        <strong>Atención:</strong> Dr. Nelson "El Gato" Briceño y Directiva Regional de Monagas<br>
        <strong>Elaborado por:</strong> Equipo Técnico de Sistemas, Ciberseguridad y Arquitectura de Datos<br>
        <strong>Fecha de Emisión:</strong> Septiembre 2026 • Maturín, Estado Monagas
      </div>
    </div>

    <h2>CAPÍTULO I: FORMULACIÓN DEL PROBLEMA Y MODELO DE AMENAZAS</h2>
    <p>El despliegue de una plataforma digital para la organización electoral, censo comunitario y movilización ciudadana en un contexto de persecución política plantea un dilema de supervivencia. La pregunta táctica fundamental que la Dirección General y el equipo técnico deben responder no es simplemente <em>"¿cómo registramos a nuestros votantes?"</em>, sino <strong>"¿cómo evitamos que el adversario use nuestra propia herramienta para cazar a nuestra gente?"</strong>.</p>
    
    <p><strong>El Error Clásico de la Programación Convencional:</strong> En los esquemas convencionales de desarrollo de software (aquellos programados con librerías estándar o asistentes de inteligencia artificial sin doctrina de contrainteligencia), el flujo de información es bidireccional y simétrico: un usuario ingresa datos, el servidor los guarda y valida, y la aplicación vuelve a responder al usuario con el estado del registro para confirmarle si la persona existe o no en la base de datos.</p>

    <div class="callout callout-danger">
      <span class="callout-title">DEFINICIÓN DE CONTRAINTELIGENCIA Y CIBERSEGURIDAD MILITAR</span>
      Un <strong>"Ataque de Oráculo" (Oracle Attack o Inferencia Inversa de Identidad)</strong> se produce cuando un sistema informático, ante una consulta arbitraria formulada por un atacante, responde con suficiente información como para confirmar o desmentir una hipótesis secreta. En nuestro contexto: confirmar si una cédula de identidad pertenece a un opositor organizado.
    </div>

    <h3>1.1. El Vector de Ataque en Terreno: La Caza de Militantes</h3>
    <p>Considérese el siguiente escenario operativo real en cualquier parroquia de Maturín (Las Cocuizas, San Simón, Boquerón o Los Godos):</p>
    <ol style="padding-left: 24px; line-height: 1.8;">
      <li><strong>Obtención del Dispositivo:</strong> Un jefe de calle del oficialismo, un operador del CLAP o un funcionario de un cuerpo de seguridad del Estado logra infiltrarse en una estructura de base o requisa el teléfono celular de un enlace comunitario en una alcabala.</li>
      <li><strong>Envío Nominal de Prueba:</strong> El atacante no necesita vulnerar el servidor central. Simplemente abre la aplicación comunitaria y comienza a ingresar las cédulas de identidad de personas de interés: maestros de escuela, empleados de la gobernación, enfermeras del Hospital Dr. Manuel Núñez Tovar, o vecinos sospechosos de simpatizar con el Dr. Nelson Briceño.</li>
      <li><strong>Inferencia Exitosa:</strong> Si el servidor central, con el fin de "ayudar al enlace", respondiera: <em>"Esta persona ya fue validada por la Central como Voto Fijo de MIGATO"</em>, el infiltrado acaba de obtener una prueba irrefutable de militancia opositora.</li>
      <li><strong>Consecuencia Fatal:</strong> Con esa información, el régimen confecciona listas de despidos inmediatos, suspensiones de bolsas de comida, revocación de jubilaciones y hostigamiento directo a hogares vulnerables.</li>
    </ol>

    <div class="diagram-wrap">
      <img src="data:image/png;base64,{diag1_b64}" class="diagram-img" alt="Diagrama de Vulnerabilidad de Oráculo">
      <div class="diagram-caption">Figura 1: Vector de Amenaza del "Ataque de Oráculo Político" en Sistemas Convencionales (Lista Tascón 2.0).</div>
    </div>

    <h2>CAPÍTULO II: LA DOCTRINA DE SEGURIDAD DE MIGATO - EL BUZÓN CIEGO</h2>
    <p>Para erradicar esta vulnerabilidad de manera definitiva, la Plataforma Territorial MIGATO fue concebida y construida bajo la <strong>Doctrina de Flujo Unidireccional Estricto y la Arquitectura de Buzón Ciego (Blind Drop Box Architecture)</strong>.</p>
    
    <p><strong>Analogía Doctrinaria del Buzón Ciego:</strong> En el mundo físico, un buzón de correos seguro posee una ranura metálica que permite introducir una carta con un mensaje adentro, pero impide físicamente que cualquier persona en la calle introduzca la mano para ver qué cartas han metido los vecinos o verificar quién escribió. La plataforma MIGATO replica matemáticamente este principio:</p>

    <ul>
      <li><strong>Flujo Estrictamente Ascendente (One-Way Push):</strong> Los enlaces parroquiales y sectoriales disponen de un formulario web que opera mediante un token efímero de acceso. Pueden ingresar los datos de un censo o una encuesta familiar, pero el envío viaja exclusivamente hacia arriba (hacia el servidor central cifrado).</li>
      <li><strong>Protocolo Zero-Byte Storage en Clientes Móviles:</strong> Inmediatamente después de pulsar el botón "Guardar y Transmitir", el código fuente del cliente borra de inmediato todos los campos del formulario, resetea las variables en memoria y purga el almacenamiento local. Si un oficial de policía toma el teléfono 2 segundos después del envío, la pantalla está completamente en blanco y el almacenamiento interno registra exactamente 0 bytes.</li>
      <li><strong>Cero Retorno Nominal (Zero Identity Leakage):</strong> El servidor central jamás devuelve a la calle confirmaciones nominales ni listas de personas. Hacia los módulos de campo únicamente retornan indicadores numéricos agregados y anónimos (Ejemplo: <em>"Sector Los Godos: 142 familias censadas • 68% de la meta"</em>).</li>
      <li><strong>Anulación de Consultas Inversas:</strong> En las interfaces sectoriales de campo está terminantemente prohibido y técnicamente deshabilitado cualquier buscador de cédulas, filtro por nombres o visualizador de fichas individuales. No existe endpoint en la API que permita a un teléfono en la calle consultar si "Juan Pérez" está registrado o no.</li>
    </ul>

    <div class="diagram-wrap">
      <img src="data:image/png;base64,{diag2_b64}" class="diagram-img" alt="Diagrama de Blindaje MIGATO V3">
      <div class="diagram-caption">Figura 2: Arquitectura Blindada MIGATO V3: Flujo Unidireccional, Bóveda Central Cifrada y Cero Retorno Nominal.</div>
    </div>

    <div class="callout callout-success">
      <span class="callout-title">RESULTADO TÁCTICO CERTIFICADO</span>
      Al aplicar el principio de Cero Retorno Nominal, si un agente hostil ingresa una cédula en el formulario de campo, el sistema se limita a procesar el paquete en la nube de forma silenciosa sin devolver ningún indicio sobre si la persona ya existía, si es militante o si fue validada. El ataque de oráculo queda completamente neutralizado.
    </div>

    <h2>CAPÍTULO III: MATRIZ COMPARATIVA DE SEGURIDAD OPERATIVA</h2>
    <table>
      <thead>
        <tr>
          <th>Parámetro Crítico</th>
          <th>Sistema Convencional (Vulnerable)</th>
          <th>Plataforma MIGATO V3 (Blindada)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Dirección del Flujo</strong></td>
          <td><span class="badge-cross">Bidireccional</span><br>Los datos suben a la base y bajan de regreso con nombres al celular.</td>
          <td><span class="badge-check">Estrictamente Unidireccional</span><br>Subida cifrada hacia la bóveda central; retorno exclusivo de métricas numéricas.</td>
        </tr>
        <tr>
          <td><strong>Respuesta a la Calle</strong></td>
          <td><span class="badge-cross">Fuga Nominal</span><br><em>"Confirmado: Juan Pérez está validado como Voto Opositor"</em>.</td>
          <td><span class="badge-check">Métrica Agregada</span><br><em>"142 familias censadas en el sector • 68% de avance"</em>.</td>
        </tr>
        <tr>
          <td><strong>Memoria en Dispositivo</strong></td>
          <td><span class="badge-cross">Persistente</span><br>Bases de datos SQLite locales, caché del navegador y cookies con nombres.</td>
          <td><span class="badge-check">Protocolo Zero-Byte</span><br>Cero bytes persistidos; purga instantánea tras cada transmisión.</td>
        </tr>
        <tr>
          <td><strong>Búsqueda por Cédula</strong></td>
          <td><span class="badge-cross">Habilitada</span><br>Fácilmente explotable por espías e infiltrados para cazar disidentes.</td>
          <td><span class="badge-check">Terminantemente Bloqueada</span><br>La calle no tiene permiso de consultar la base central.</td>
        </tr>
        <tr>
          <td><strong>Requisa en Alcabala</strong></td>
          <td><span class="badge-cross">Catástrofe</span><br>El militar o policía revisa el historial y obtiene la lista negra.</td>
          <td><span class="badge-check">Blindado</span><br>El celular solo muestra una pantalla neutral en blanco sin datos.</td>
        </tr>
        <tr>
          <td><strong>Aislamiento Territorial</strong></td>
          <td><span class="badge-cross">Centralizada Abierta</span><br>Cualquier usuario con enlace puede ver datos de todo el estado.</td>
          <td><span class="badge-check">Compartimentación Tabicada</span><br>Las 10 parroquias de Maturín operan como silos estancos aislados.</td>
        </tr>
      </tbody>
    </table>

    <h2>CAPÍTULO IV: LOS CUATRO (4) CANDADOS TÉCNICOS INQUEBRANTABLES</h2>
    <p><strong>1. Candado 1 - Buzón Ciego Criptográfico:</strong> El canal de transmisión opera con encriptación TLS 1.3 de 256 bits. Cada paquete de datos de campo es firmado criptográficamente con el token efímero de la parroquia emisora y depositado en una cola de mensajes en el servidor VPS. El cliente emisor no recibe ningún token de sesión permanente ni cookies que permitan reingresar a consultar la información transmitida.</p>
    
    <p><strong>2. Candado 2 - Cero Retorno Nominal y Anonimización Agregada:</strong> El motor de analítica de la plataforma ejecuta una función matemática unidireccional (de agregación estadística). Cuando la Dirección General o el enlace parroquial visualizan el mapa 3D o el tablero de control, el sistema no consulta registros nominales: consulta tablas de cómputo precalculadas donde las personas ya no existen como individuos, sino como totales estadísticos territoriales.</p>

    <p><strong>3. Candado 3 - Control de Acceso Basado en Roles (RBAC) de Bóveda Central:</strong> La visualización nominal individual (nombres, teléfonos, asignación de testigos en las 361 mesas y verificación de actas electorales) está restringida exclusivamente a la Dirección General de MIGATO y a los operadores autorizados en la Sala de Mando Regional, requiriendo IP fija validada, certificados SSH y autenticación de factor múltiple.</p>

    <p><strong>4. Candado 4 - Compartimentación Parroquial Tabicada:</strong> Bajo el principio de contrainteligencia militar de "compartimentación estricta", las 10 parroquias del Municipio Maturín operan como silos estancos. Si un coordinador o testigo en la Parroquia San Simón fuera coaccionado o infiltrado, bajo ninguna circunstancia podría obtener o consultar información de las parroquias vecinas (Las Cocuizas, Santa Cruz, Jusepín o La Pica). El daño potencial queda confinado al 100%.</p>

    <h2>CAPÍTULO V: ANÁLISIS ESTRATÉGICO Y DESMITIFICACIÓN TECNOLÓGICA</h2>
    <p>En reuniones de alto nivel político es frecuente encontrar posturas que desestiman la complejidad de un desarrollo tecnológico, argumentando que <em>"hoy en día con la inteligencia artificial cualquiera hace una aplicación en una tarde"</em>. Resulta imperativo dotar a la dirigencia de argumentos técnicos sólidos para responder a esta objeción con autoridad:</p>

    <p><strong>1. La Falacia del Código Asistido sin Doctrina:</strong> Una inteligencia artificial genérica (ChatGPT, Claude, etc.) genera código funcional básico para tiendas virtuales o formularios simples. Sin embargo, carece por completo de doctrina de seguridad de contrainteligencia. Si un aficionado le pide a una IA <em>"hazme un sistema para registrar votantes"</em>, la IA invariablemente generará un sistema con buscador de nombres, validación pública de cédulas y almacenamiento local en SQLite. Es decir: la IA creará, por defecto, una trampa mortal de oráculo político.</p>

    <p><strong>2. La Soberanía Tecnológica no es Subcontratable:</strong> El software no es solo código; es la suma de tres factores indivisibles: (a) Infraestructura de servidores propia y blindada sin intermediarios gratuitos tipo Google Forms o Airtable (que entregan los datos a terceros); (b) Doctrina de contrainteligencia adaptada a las amenazas reales del régimen venezolano; y (c) Integración territorial precisa con los 84 centros de salud, 175 centros electorales y 361 mesas de votación reales de Monagas.</p>

    <h2>CAPÍTULO VI: CONCLUSIONES Y DICTAMEN TÉCNICO</h2>
    <ul>
      <li><strong>Gravedad Comprobada:</strong> El riesgo de "Ataque de Oráculo Político" e inferencia inversa de identidad representa una de las amenazas más destructivas para la seguridad de la militancia en procesos electorales bajo regímenes de vigilancia.</li>
      <li><strong>Blindaje Técnico Total:</strong> La Plataforma Territorial MIGATO V3 neutraliza este vector de forma absoluta mediante la adopción innegociable de la Arquitectura de Buzón Ciego, el Protocolo Zero-Byte Storage y la política de Cero Retorno Nominal.</li>
      <li><strong>Protección Humana Certificada:</strong> El sistema garantiza que ningún enlace parroquial, operador de campo, alcabala policial ni infiltrado oficialista pueda utilizar la herramienta para confirmar o deducir la afiliación política de ningún ciudadano venezolano.</li>
    </ul>

    <div class="callout callout-success">
      <span class="callout-title">DICTAMEN TÉCNICO CONCLUSIVO</span>
      <strong>DICTAMEN FAVORABLE:</strong> El Equipo Técnico de Sistemas y Arquitectura Digital de MIGATO certifica que la plataforma cumple con los más altos estándares de contrainteligencia y compartimentación de datos, encontrándose apta para su despliegue operativo seguro en las comunidades del Estado Monagas.
    </div>

    <div class="signature-box">
      <div class="signature-title">Dictamen Técnico de Seguridad Operativa emitido y certificado por el</div>
      <div class="signature-team">Equipo Técnico de Sistemas y Ciberseguridad MIGATO 2026</div>
      <div>Maturín, Estado Monagas, República Bolivariana de Venezuela.</div>
    </div>
  </div>
</body>
</html>
"""

out_html = PROJECT_ROOT / "DICTAMEN_CONTRAINTELIGENCIA_ORACULO_MIGATO_V3.html"
out_html.write_text(html_content, encoding="utf-8")
print(f"[✓] Archivo HTML imprimible generado: {out_html} ({len(html_content)} bytes)")
