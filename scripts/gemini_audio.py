#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MIGATO AudioIntel - Conector Nativo Gemini 1.5 Flash Audio API
Sube grabaciones de hasta 9.5 horas de forma nativa sin librerías externas (solo urllib)
y extrae la transcripción y el análisis dialéctico en una sola pasada.
"""

import os
import sys
import json
import time
import urllib.request
import urllib.error
from pathlib import Path

def upload_audio_to_gemini(audio_path, api_key):
    """
    Sube un archivo de audio a la API de Archivos de Gemini (soporta hasta 2 GB y 9.5 horas).
    Usa el protocolo oficial Resumable Upload de Google en Python puro.
    """
    path = Path(audio_path)
    file_size = path.stat().st_size
    mime_type = "audio/mp3" if path.suffix.lower() in [".mp3"] else "audio/wav" if path.suffix.lower() in [".wav"] else "audio/m4a"

    print(f"      📤 Subiendo {path.name} ({round(file_size / (1024*1024), 2)} MB) a Google Gemini Files API...")

    # Paso 1: Inicializar subida resumable
    init_url = f"https://generativelanguage.googleapis.com/upload/v1beta/files?key={api_key}"
    headers = {
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Length": str(file_size),
        "X-Goog-Upload-Header-Content-Type": mime_type,
        "Content-Type": "application/json"
    }
    init_data = json.dumps({"file": {"display_name": path.stem[:40]}}).encode("utf-8")

    req = urllib.request.Request(init_url, data=init_data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            upload_url = resp.headers.get("x-goog-upload-url")
    except urllib.error.HTTPError as e:
        err = e.read().decode('utf-8', errors='ignore')
        raise RuntimeError(f"Error iniciando subida a Gemini: {e.code} - {err}")

    if not upload_url:
        raise RuntimeError("No se recibió la URL de subida de Google Gemini.")

    # Paso 2: Subir los bytes del archivo
    print(f"      📡 Transfiriendo audio...")
    with open(path, "rb") as f:
        file_bytes = f.read()

    upload_headers = {
        "Content-Length": str(file_size),
        "X-Goog-Upload-Offset": "0",
        "X-Goog-Upload-Command": "upload, finalize"
    }

    req_upload = urllib.request.Request(upload_url, data=file_bytes, headers=upload_headers, method="POST")
    with urllib.request.urlopen(req_upload) as resp:
        upload_resp = json.loads(resp.read().decode("utf-8"))

    file_info = upload_resp.get("file", {})
    file_name = file_info.get("name")
    file_uri = file_info.get("uri")

    # Paso 3: Esperar que el archivo esté en estado ACTIVE
    print(f"      ⏳ Esperando acondicionamiento en servidor Gemini ({file_name})...")
    status_url = f"https://generativelanguage.googleapis.com/v1beta/{file_name}?key={api_key}"
    for _ in range(30):
        req_status = urllib.request.Request(status_url, method="GET")
        with urllib.request.urlopen(req_status) as s_resp:
            s_data = json.loads(s_resp.read().decode("utf-8"))
            state = s_data.get("state")
            if state == "ACTIVE":
                print(f"      ✅ Audio listo y activo en Gemini.")
                return s_data
            elif state == "FAILED":
                raise RuntimeError("El archivo de audio falló en el procesamiento de Gemini.")
        time.sleep(2)

    return file_info

def transcribir_y_analizar_con_gemini(audio_path, api_key, titulo="Reunión de Mando"):
    """
    Pasa el audio a Gemini 1.5 Flash para extraer:
    1. Transcripción cronológica completa con marcas de tiempo.
    2. Resumen ejecutivo (BLUF).
    3. Lluvia de ideas.
    4. Matriz dialéctica de Opiniones vs. Contraopiniones y Resoluciones de mando.
    5. Matriz de acuerdos con responsables y plazos.
    6. Puntos pendientes.
    """
    file_info = upload_audio_to_gemini(audio_path, api_key)
    file_uri = file_info.get("uri")
    mime_type = file_info.get("mimeType", "audio/mp3")

    prompt = """Eres el Oficial de Inteligencia y Minutas de la Sala Situacional del Movimiento Independiente Ganamos Todos (MIGATO) en Monagas, al servicio de José Gregorio "El Gato" Briceño y bajo la dirección técnica del Ing. Diego Donado.

Escucha atentamente el audio completo de esta reunión y extrae la inteligencia estratégica en formato JSON con la siguiente estructura exacta:

{
  "titulo": "Título formal y descriptivo de la reunión",
  "fecha": "YYYY-MM-DD",
  "duracion": "HH:MM:SS aproximada",
  "lugar": "Sede o jurisdicción donde se realizó",
  "participantes": ["Nombres y roles identificados de quienes hablaron"],
  "resumen_ejecutivo": "Resumen ejecutivo formal (BLUF) en 1 o 2 párrafos sobre lo acordado",
  "lluvia_ideas": [
    "Idea o propuesta 1 planteada",
    "Idea o propuesta 2 planteada"
  ],
  "debates": [
    {
      "tema": "Eje temático en discusión",
      "opinion": "Argumento o propuesta inicial planteada",
      "contraopinion": "Objeciones, contra-argumentos o dudas planteadas por otros",
      "resolucion": "Decisión o resolución final adoptada por el comando"
    }
  ],
  "acuerdos": [
    {
      "tarea": "Compromiso o tarea específica asignada",
      "responsable": "Nombre de la persona o equipo responsable",
      "plazo": "Tiempo límite fijado (ej: 48 horas, próximo martes)",
      "estado": "Aprobado o En Curso"
    }
  ],
  "pendientes": [
    "Puntos que quedaron sin resolver para la próxima reunión"
  ],
  "transcripcion_literal": "Transcripción palabra por palabra completa de todo lo hablado en el audio con marcas de tiempo cronológicas [HH:MM:SS]"
}

REGLAS ESTRICTAS:
1. Sé extremadamente fiel al audio: extrae los nombres reales de quienes hablaron, los lugares reales de Monagas que mencionaron y los problemas planteados.
2. Identifica con precisión quirúrgica los desacuerdos: quién propuso qué y quién le refutó o alertó sobre riesgos.
3. El léxico es 100% democrático y civil: Municipios, Parroquias, Sectores, Testigos y Comandos Gateros. NUNCA uses léxico chavista.
4. Responde ÚNICAMENTE con el objeto JSON válido, sin bloques de código markdown ni texto adicional."""

    generate_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"file_data": {"mime_type": mime_type, "file_uri": file_uri}},
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "response_mime_type": "application/json",
            "temperature": 0.2
        }
    }

    print(f"      ⚡ Gemini 1.5 Flash analizando audio completo y extrayendo dialéctica...")
    req = urllib.request.Request(generate_url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            gen_resp = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err = e.read().decode('utf-8', errors='ignore')
        raise RuntimeError(f"Error generando contenido en Gemini: {e.code} - {err}")

    # Extraer el texto generado
    candidates = gen_resp.get("candidates", [])
    if not candidates:
        raise RuntimeError("Gemini no devolvió candidatos de respuesta.")

    content = candidates[0].get("content", {})
    parts = content.get("parts", [])
    raw_text = parts[0].get("text", "{}") if parts else "{}"

    # Limpiar posibles delimitadores markdown ```json
    raw_text = raw_text.strip()
    if raw_text.startswith("```json"):
        raw_text = raw_text[7:]
    if raw_text.startswith("```"):
        raw_text = raw_text[3:]
    if raw_text.endswith("```"):
        raw_text = raw_text[:-3]
    raw_text = raw_text.strip()

    try:
        data = json.loads(raw_text)
    except json.JSONDecodeError as err:
        print(f"⚠️ Advertencia JSON, limpiando salida: {err}")
        data = {"resumen_ejecutivo": raw_text[:500], "transcripcion_literal": raw_text}

    return data
