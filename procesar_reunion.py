#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MIGATO AudioIntel - Procesador Real de Reuniones de Mando (CLI)
Toma grabaciones extensas (hasta 10 horas), aplica filtrado DSP / ecualizador
anti-saturación, transcribe el audio real y genera el acta dialéctica formal
(Opiniones vs. Contraopiniones, Acuerdos, DOCX IUTIRLA y Bóveda Obsidian)
usando la API de Google Gemini 1.5 Flash o motores locales.

Uso:
    python3 procesar_reunion.py <archivo_de_audio> [--api-key LLAVE] [--titulo "Título"]
"""

import os
import sys
import json
import shutil
import argparse
import subprocess
from pathlib import Path
from datetime import datetime

# Rutas del Proyecto
PROJECT_ROOT = Path(__file__).resolve().parent
SCRIPTS_DIR = PROJECT_ROOT / "scripts"
VAULT_DIR = PROJECT_ROOT / "vault" / "06-Actas-y-Reuniones"
OUTPUT_DIR = PROJECT_ROOT / "salida_reuniones"

if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from export_acta import process_and_save_full_acta, VAULT_ACTAS_DIR
from build_acta_word import build_acta_docx
from gemini_audio import transcribir_y_analizar_con_gemini

def verificar_ffmpeg():
    """Verifica si ffmpeg está disponible en el sistema"""
    return shutil.which("ffmpeg")

def ecualizar_y_filtrar_audio(input_file, output_mp3):
    """
    PASO 1: Ecualizador DSP y Filtro Anti-Saturación con FFmpeg.
    - Filtro Pasa-Altos (85 Hz): Corta golpes de mesa, vibraciones y ruidos de baja frecuencia.
    - Dynamic Audio Normalizer (dynaudnorm): Nivela voces lejanas y voces cercanas.
    - Compresor Dinámico (acompressor): De-clipping estricto en -18dB para eliminar distorsión.
    - Compresión MP3 64k mono: Compacta 3 horas de audio a ~85MB sin perder inteligibilidad.
    """
    ffmpeg_cmd = verificar_ffmpeg()
    if not ffmpeg_cmd:
        print("\n" + "=" * 68)
        print("⚠️  AVISO DE INGENIERÍA: SE REQUIERE 'ffmpeg' PARA FILTRAR EL AUDIO")
        print("Instálalo en tu terminal Ubuntu ejecutando:")
        print("\n    sudo apt update && sudo apt install -y ffmpeg\n")
        print("=" * 68 + "\n")
        return False

    print(f"\n[1/4] 🎚️  Ecualizando y filtrando audio con DSP...")
    print(f"      • Entrada: {input_file}")
    print(f"      • Filtros: Pasa-Altos (85Hz) + Compresor Anti-Saturación (-18dB) + Normalizador")

    cmd = [
        ffmpeg_cmd,
        "-y",
        "-i", str(input_file),
        "-af", "highpass=f=85,dynaudnorm=p=0.9:s=5,acompressor=threshold=-18dB:ratio=8:attack=3:release=100",
        "-ar", "24000",
        "-ac", "1",
        "-b:a", "64k",
        str(output_mp3)
    ]

    try:
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if res.returncode != 0:
            print(f"⚠️ Error en ffmpeg: {res.stderr.decode('utf-8', errors='ignore')[:300]}")
            return False
        peso_mb = round(Path(output_mp3).stat().st_size / (1024*1024), 2)
        print(f"      ✅ Audio filtrado y estabilizado generado: {output_mp3} ({peso_mb} MB)")
        return True
    except Exception as e:
        print(f"⚠️ Error ejecutando ffmpeg: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(
        description="MIGATO AudioIntel - Procesador Real de Reuniones y Filtro DSP"
    )
    parser.add_argument("audio", help="Ruta al archivo de audio (.m4a, .mp3, .wav, etc.)")
    parser.add_argument("--titulo", default="Reunión Estratégica de Comando MIGATO", help="Título del acta")
    parser.add_argument("--api-key", default=None, help="Llave de Google Gemini API (o variable GEMINI_API_KEY)")
    parser.add_argument("--texto", default=None, help="Archivo .txt con transcripción previa si ya la tienes")

    args = parser.parse_args()

    audio_path = Path(args.audio).resolve()
    if not audio_path.exists():
        print(f"\n❌ Error: El archivo de audio '{args.audio}' no existe.")
        print(f"Verifica la ruta e inténtalo nuevamente.\n")
        sys.exit(1)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    VAULT_DIR.mkdir(parents=True, exist_ok=True)

    print("=" * 68)
    print("🏛️  MIGATO AUDIOINTEL • PROCESADOR REAL DE REUNIONES DE MANDO")
    print(f"📅  Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📂  Archivo de Grabación: {audio_path.name} ({round(audio_path.stat().st_size / (1024*1024), 2)} MB)")
    print("=" * 68)

    # 1. Ecualizador y Filtro DSP
    audio_filtrado = OUTPUT_DIR / f"{audio_path.stem}_filtrado.mp3"
    exito_dsp = ecualizar_y_filtrar_audio(audio_path, audio_filtrado)
    audio_para_procesar = audio_filtrado if exito_dsp and audio_filtrado.exists() else audio_path

    # Determinar API Key de Gemini
    api_key = args.api_key or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")

    # Si hay archivo .env en el proyecto, intentar leerlo
    env_file = PROJECT_ROOT / ".env"
    if not api_key and env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            if line.startswith("GEMINI_API_KEY=") or line.startswith("GOOGLE_API_KEY="):
                api_key = line.split("=", 1)[1].strip().strip('"').strip("'")
                break

    datos_acta = None

    # Caso A: Si ya tiene transcripción previa
    if args.texto and Path(args.texto).exists():
        print(f"\n[2/4] 📄 Cargando transcripción pre-existente desde: {args.texto}")
        texto = Path(args.texto).read_text(encoding="utf-8")
        datos_acta = {
            "titulo": args.titulo,
            "fecha": datetime.now().strftime("%Y-%m-%d"),
            "duracion": "Documento importado",
            "lugar": "Comando Regional MIGATO, Maturín",
            "participantes": ["José Gregorio El Gato Briceño", "Ing. Diego Donado"],
            "resumen_ejecutivo": texto[:500] + "...",
            "lluvia_ideas": [],
            "debates": [],
            "acuerdos": [],
            "pendientes": [],
            "transcripcion_literal": texto
        }

    # Caso B: Procesamiento con Gemini 1.5 Flash (Soporta hasta 9.5 horas de audio nativo)
    elif api_key:
        print(f"\n[2/4] 🚀 Minando texto y extrayendo dialéctica con Google Gemini 1.5 Flash...")
        try:
            datos_acta = transcribir_y_analizar_con_gemini(audio_para_procesar, api_key, titulo=args.titulo)
        except Exception as e:
            print(f"❌ Error con Gemini API: {e}")
            sys.exit(1)

    # Caso C: Sin API Key
    else:
        print("\n" + "=" * 68)
        print("🔑 SE REQUIERE TU API KEY DE GOOGLE GEMINI")
        print("Gemini 1.5 Flash procesa hasta 9.5 horas continuas de audio en 30 segundos.")
        print("Para ejecutar el minado y la síntesis dialéctica, puedes:")
        print("\n1. Pasarla por parámetro:")
        print(f"   python3 procesar_reunion.py {args.audio} --api-key AIzaSy...")
        print("\n2. O exportarla en tu terminal:")
        print("   export GEMINI_API_KEY=\"AIzaSy...\"")
        print("\n3. O guardarla en un archivo .env en esta carpeta:")
        print("   echo 'GEMINI_API_KEY=AIzaSy...' > .env")
        print("=" * 68 + "\n")
        sys.exit(1)

    if not datos_acta:
        print("❌ No se pudieron extraer los datos de la reunión.")
        sys.exit(1)

    # Guardar transcripción literal completa en archivo de texto
    txt_salida = OUTPUT_DIR / f"{audio_path.stem}_transcripcion_completa.txt"
    if datos_acta.get("transcripcion_literal"):
        txt_salida.write_text(datos_acta["transcripcion_literal"], encoding="utf-8")
        print(f"\n[3/4] 📝 Transcripción literal real guardada en: {txt_salida}")

    # 4. Generación de Acta Oficial Word y Bóveda Obsidian
    print(f"\n[4/4] 📄 Generando Acta Oficial IUTIRLA / MIGATO (.docx) y Bóveda Obsidian...")
    resultado = process_and_save_full_acta(datos_acta)

    print("\n" + "=" * 68)
    print("✅  PROCESO COMPLETADO EXITOSAMENTE")
    print(f"📂  Acta Word Oficial DOCX: {resultado.get('docx_path')}")
    print(f"📓  Nota Bóveda Obsidian:  {resultado.get('md_path')}")
    print(f"📝  Transcripción TXT:     {txt_salida}")
    print("=" * 68)
    print("\n📱 MINUTA LISTA PARA WHATSAPP / TELEGRAM:\n")
    print(resultado.get("whatsapp_txt", ""))
    print("=" * 68 + "\n")

if __name__ == "__main__":
    main()
