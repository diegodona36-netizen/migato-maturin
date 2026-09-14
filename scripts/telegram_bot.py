#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MIGATO - Bot de Ingesta Territorial y Censo Electoral (Telegram)
Estado Monagas / Municipio Maturín
Diseñado para recepción masiva y simultánea de electores vía:
1. Mensajes de texto estructurados o libres.
2. Archivos CSV, TSV y TXT.
3. Fotos de planillas físicas y cuadernos de censo (OCR con Gemini Vision).
"""

import os
import sys
import json
import re
import csv
import time
import base64
import requests
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
os.makedirs(DATA_DIR, exist_ok=True)
JSON_DB = os.path.join(DATA_DIR, "censo_records.json")
CSV_DB = os.path.join(DATA_DIR, "censo_records.csv")

user_sessions = {}

def get_config():
    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    if not token and len(sys.argv) > 1:
        token = sys.argv[1]
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_key and len(sys.argv) > 2:
        gemini_key = sys.argv[2]
    return token, gemini_key

def load_records():
    if os.path.exists(JSON_DB):
        try:
            with open(JSON_DB, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_records(records):
    with open(JSON_DB, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
    # Also write CSV
    fieldnames = ["cedula", "nombre", "telefono", "direccion", "sector", "origen", "timestamp", "usuario"]
    with open(CSV_DB, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in records:
            row = {k: r.get(k, "") for k in fieldnames}
            writer.writerow(row)

def clean_cedula(val):
    if not val:
        return ""
    # Strip dots, spaces, leading V/E
    clean = re.sub(r"[^\d]", "", val)
    if 5 <= len(clean) <= 9:
        return clean
    return ""

def clean_phone(val):
    if not val:
        return ""
    clean = re.sub(r"[^\d]", "", val)
    if len(clean) == 11 and clean.startswith("04"):
        return clean
    if len(clean) == 10 and clean.startswith("4"):
        return "0" + clean
    if len(clean) == 12 and clean.startswith("584"):
        return "0" + clean[2:]
    return clean if 7 <= len(clean) <= 12 else ""

def parse_line_elector(line, default_sector="SIN_SECTOR"):
    line = line.strip()
    if not line or len(line) < 5:
        return None
    
    delims = [",", ";", "|", "\t"]
    tokens = None
    for d in delims:
        if d in line:
            parts = [p.strip() for p in line.split(d) if p.strip()]
            if len(parts) >= 2:
                tokens = parts
                break
    
    cedula = ""
    nombre = ""
    telefono = ""
    direccion = ""
    
    if tokens:
        for t in tokens:
            t_clean = t.strip()
            # Check for phone first (starts with 04 or +58 or 414/424 etc)
            tel_candidate = clean_phone(t_clean)
            ced_candidate = clean_cedula(t_clean)
            
            if not telefono and re.search(r"(?:04\d{2}|4\d{2})[- ]?\d{3}[- ]?\d{4}", t_clean):
                telefono = tel_candidate
            elif not cedula and ced_candidate and re.search(r"^[VEve]?[- .]?\d{1,2}[.]?\d{3}[.]?\d{3}$", t_clean):
                cedula = ced_candidate
            elif not cedula and ced_candidate and (len(ced_candidate) in (7, 8) or t_clean.upper().startswith(('V', 'E'))):
                cedula = ced_candidate
            elif not nombre and not re.search(r"\d", t_clean) and len(t_clean) >= 3:
                nombre = t_clean
            else:
                if not direccion:
                    direccion = t_clean
                else:
                    direccion += (" " + t_clean)
        
        # Fallback for tokens
        if not cedula and tokens:
            c = clean_cedula(tokens[0])
            if c:
                cedula = c
                if len(tokens) > 1 and not nombre:
                    nombre = tokens[1]
    else:
        # Regex search in raw line
        # 1. Phone extraction
        m_tel = re.search(r"\b(04\d{2}[- ]?\d{3}[- ]?\d{4}|4\d{2}[- ]?\d{3}[- ]?\d{4})\b", line)
        if m_tel:
            telefono = clean_phone(m_tel.group(1))
            line = line.replace(m_tel.group(1), " ")
        
        # 2. Cedula extraction
        m_ced = re.search(r"\b[VEve]?[- .]?(\d{1,2}[.]?\d{3}[.]?\d{3}|\d{6,8})\b", line)
        if m_ced:
            cedula = clean_cedula(m_ced.group(0))
            line = line.replace(m_ced.group(0), " ")
        
        # Remainder is name and address
        rem = re.sub(r"[-;,|]", " ", line).strip()
        tokens_rem = [w for w in rem.split() if w]
        if tokens_rem:
            if len(tokens_rem) <= 3:
                nombre = " ".join(tokens_rem)
            else:
                nombre = " ".join(tokens_rem[:2])
                direccion = " ".join(tokens_rem[2:])

    if cedula:
        return {
            "cedula": cedula,
            "nombre": nombre.strip() or "POR VERIFICAR",
            "telefono": telefono.strip(),
            "direccion": direccion.strip(),
            "sector": default_sector
        }
    return None

def telegram_api(token, method, params=None, files=None, timeout=35):
    url = f"https://api.telegram.org/bot{token}/{method}"
    resp = requests.post(url, data=params, files=files, timeout=timeout)
    return resp.json()

def send_msg(token, chat_id, text, parse_mode="Markdown"):
    try:
        return telegram_api(token, "sendMessage", {"chat_id": chat_id, "text": text, "parse_mode": parse_mode})
    except Exception as e:
        print(f"[Error send_msg] {e}")
        return None

def send_doc(token, chat_id, file_path, caption=""):
    try:
        url = f"https://api.telegram.org/bot{token}/sendDocument"
        with open(file_path, "rb") as f:
            resp = requests.post(url, data={"chat_id": chat_id, "caption": caption}, files={"document": f}, timeout=60)
            return resp.json()
    except Exception as e:
        print(f"[Error send_doc] {e}")
        return None

def ocr_gemini(image_bytes, gemini_key):
    try:
        b64 = base64.b64encode(image_bytes).decode("utf-8")
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": (
                                "Eres un asistente de digitalización y OCR de censos electorales de Monagas, Venezuela. "
                                "Analiza esta fotografía o documento y extrae todas las filas de personas (cédula, nombre y apellido, teléfono, dirección/calle/comunidad). "
                                "Devuelve ÚNICAMENTE un arreglo JSON válido sin texto introductorio ni bloques de código markdown: "
                                '[{"cedula": "12345678", "nombre": "Nombre Completo", "telefono": "04141234567", "direccion": "Calle X"}]. '
                                "Si no hay teléfono o dirección pon cadena vacía. Asegúrate de extraer bien los números de cédula."
                            )
                        },
                        {
                            "inline_data": {
                                "mime_type": "image/jpeg",
                                "data": b64
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "maxOutputTokens": 4096
            }
        }
        r = requests.post(url, headers=headers, json=payload, timeout=45)
        data = r.json()
        text_out = data["candidates"][0]["content"]["parts"][0]["text"].strip()
        if text_out.startswith("```"):
            text_out = re.sub(r"^```[a-zA-Z]*\n", "", text_out)
            text_out = re.sub(r"\n```$", "", text_out).strip()
        return json.loads(text_out)
    except Exception as e:
        print(f"[Error Gemini OCR] {e}")
        return []

def main():
    token, gemini_key = get_config()
    if not token:
        print("ERROR: Falta el token de Telegram. Pásalo por argumento o define TELEGRAM_BOT_TOKEN.")
        print("Uso: python3 scripts/telegram_bot.py <TELEGRAM_BOT_TOKEN> [<GEMINI_API_KEY>]")
        sys.exit(1)
    
    ocr_status = "ACTIVADO" if gemini_key else "NO CONFIGURADO (Solo texto y CSV)"
    print("================================================================")
    print("🤖 MIGATO - Bot de Ingesta Territorial (Telegram) Iniciado")
    print(f"📁 Directorio de almacenamiento: {DATA_DIR}")
    print(f"🧠 Gemini OCR: {ocr_status}")
    print("================================================================")
    
    try:
        me = telegram_api(token, "getMe")
        if not me.get("ok"):
            print(f"❌ Error de autenticación con Telegram: {me.get('description')}")
            sys.exit(1)
        bot_info = me.get("result", {})
        print(f"✅ Conectado exitosamente como @{bot_info.get('username')} ({bot_info.get('first_name')})")
    except Exception as e:
        print(f"❌ No se pudo conectar a Telegram: {e}")
        sys.exit(1)

    offset = 0
    print("📡 Escuchando mensajes (Long Polling)...")

    while True:
        try:
            updates = telegram_api(token, "getUpdates", {"offset": offset, "timeout": 25})
            if not updates.get("ok"):
                time.sleep(3)
                continue
            
            for upd in updates.get("result", []):
                offset = upd["update_id"] + 1
                msg = upd.get("message") or upd.get("edited_message")
                if not msg:
                    continue
                
                chat_id = msg["chat"]["id"]
                from_user = msg.get("from", {})
                username = from_user.get("username") or from_user.get("first_name") or str(chat_id)
                
                if chat_id not in user_sessions:
                    user_sessions[chat_id] = {"sector": "VLA-784 (Predeterminado: La Puente)", "count": 0}
                
                text = msg.get("text", "").strip()
                
                # Command /start or /help
                if text.startswith("/start") or text.startswith("/help") or text.startswith("/ayuda"):
                    welcome = (
                        "🏛️ *SISTEMA MIGATO - MONAGAS / MATURÍN*\n"
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                        "¡Bienvenido al canal de Ingesta Territorial y Censo Electoral!\n\n"
                        f"📍 *Sector Activo:* `{user_sessions[chat_id]['sector']}`\n\n"
                        "📋 *¿Cómo cargar datos?*\n"
                        "1️⃣ *Texto directo:* Envía una o varias líneas con los electores:\n"
                        "   `V-14567890, Maria Gomez, 04147654321, Calle Principal Casa 12`\n\n"
                        "2️⃣ *Archivos:* Envía un archivo `.csv`, `.tsv` o `.txt` exportado de Excel.\n\n"
                        "3️⃣ *Fotos / Planillas:* Envía fotos de planillas físicas o listas escritas a mano (procesamiento automático con IA).\n\n"
                        "⚙️ *Comandos disponibles:*\n"
                        "• `/sector <CODIGO>` - Cambiar tu sector (ej: `/sector VLA-784` o `/sector Cocuizas`)\n"
                        "• `/stats` - Ver estadísticas acumuladas de carga\n"
                        "• `/descargar` - Descargar el archivo Excel/CSV consolidado\n"
                    )
                    send_msg(token, chat_id, welcome)
                    continue
                
                # Command /sector
                if text.startswith("/sector"):
                    parts = text.split(maxsplit=1)
                    if len(parts) > 1 and parts[1].strip():
                        new_sector = parts[1].strip().upper()
                        user_sessions[chat_id]["sector"] = new_sector
                        send_msg(token, chat_id, f"✅ Sector actualizado con éxito a: *{new_sector}*.\nTodos los electores que cargues a continuación quedarán asignados a este sector.")
                    else:
                        send_msg(token, chat_id, f"📍 Tu sector actual es: *{user_sessions[chat_id]['sector']}*.\nPara cambiarlo escribe: `/sector CODIGO` (Ejemplo: `/sector VLA-784`)")
                    continue

                # Command /stats
                if text.startswith("/stats"):
                    records = load_records()
                    total = len(records)
                    by_sec = {}
                    for r in records:
                        s = r.get("sector", "DESCONOCIDO")
                        by_sec[s] = by_sec.get(s, 0) + 1
                    sec_str = "\n".join([f"• `{k}`: {v} electores" for k, v in list(by_sec.items())[:10]])
                    stats_msg = (
                        f"📊 *ESTADÍSTICAS DE INGESTA MIGATO*\n"
                        f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                        f"• *Total general:* {total} registros consolidados\n"
                        f"• *Tu sector activo:* `{user_sessions[chat_id]['sector']}`\n\n"
                        f"*Desglose por sectores (Top 10):*\n"
                        f"{sec_str or 'Sin registros aún.'}\n"
                    )
                    send_msg(token, chat_id, stats_msg)
                    continue

                # Command /descargar
                if text.startswith("/descargar"):
                    if os.path.exists(CSV_DB):
                        send_msg(token, chat_id, "⏳ Generando y enviando archivo consolidado...")
                        send_doc(token, chat_id, CSV_DB, caption="📊 Base de datos consolidada de electores MIGATO (CSV/Excel compatible).")
                    else:
                        send_msg(token, chat_id, "ℹ️ Aún no hay registros consolidados para descargar.")
                    continue

                # Handling Document (CSV, TXT)
                if "document" in msg:
                    doc = msg["document"]
                    fname = doc.get("file_name", "data.csv").lower()
                    file_id = doc["file_id"]
                    
                    send_msg(token, chat_id, f"📥 *Procesando archivo:* `{fname}`...")
                    
                    f_info = telegram_api(token, "getFile", {"file_id": file_id})
                    if f_info.get("ok"):
                        f_path = f_info["result"]["file_path"]
                        d_url = f"https://api.telegram.org/file/bot{token}/{f_path}"
                        content = requests.get(d_url).content
                        
                        text_content = ""
                        for enc in ["utf-8", "latin-1", "iso-8859-1"]:
                            try:
                                text_content = content.decode(enc)
                                break
                            except Exception:
                                pass
                        
                        lines = [l.strip() for l in text_content.splitlines() if l.strip()]
                        added = 0
                        current_sector = user_sessions[chat_id]["sector"]
                        existing = load_records()
                        existing_ceds = {r.get("cedula") for r in existing}
                        
                        for line in lines:
                            item = parse_line_elector(line, default_sector=current_sector)
                            if item and item["cedula"] not in existing_ceds:
                                item["timestamp"] = datetime.now().isoformat()
                                item["origen"] = "telegram_csv"
                                item["usuario"] = username
                                existing.append(item)
                                existing_ceds.add(item["cedula"])
                                added += 1
                        
                        save_records(existing)
                        send_msg(token, chat_id, f"✅ *Archivo procesado exitosamente:*\n• Filas leídas: {len(lines)}\n• Nuevos electores agregados: *{added}*\n• Sector asignado: `{current_sector}`\n• Total general acumulado: {len(existing)}")
                    else:
                        send_msg(token, chat_id, "❌ No se pudo descargar el archivo desde Telegram.")
                    continue

                # Handling Photo (Planilla / Cuaderno OCR)
                if "photo" in msg:
                    photos = msg["photo"]
                    best_photo = photos[-1]
                    file_id = best_photo["file_id"]
                    
                    if not gemini_key:
                        send_msg(token, chat_id, "📸 *Foto de planilla recibida.*\n\nℹ️ *Nota:* Para digitalizar fotos con Inteligencia Artificial (OCR de texto manuscrito/impreso), se requiere configurar la clave de Gemini (`GEMINI_API_KEY`).\n\nPor ahora puedes cargar enviando listas en texto o archivos CSV/Excel.")
                        continue
                    
                    send_msg(token, chat_id, "🧠 *Digitalizando planilla con IA (Gemini Vision OCR)...* Por favor espera unos segundos...")
                    
                    f_info = telegram_api(token, "getFile", {"file_id": file_id})
                    if f_info.get("ok"):
                        f_path = f_info["result"]["file_path"]
                        d_url = f"https://api.telegram.org/file/bot{token}/{f_path}"
                        img_bytes = requests.get(d_url).content
                        
                        extracted = ocr_gemini(img_bytes, gemini_key)
                        if not extracted:
                            send_msg(token, chat_id, "⚠️ No se lograron detectar registros legibles en la imagen. Intenta con una foto más nítida e iluminada de la lista.")
                            continue
                        
                        current_sector = user_sessions[chat_id]["sector"]
                        existing = load_records()
                        existing_ceds = {r.get("cedula") for r in existing}
                        added = 0
                        
                        sample_preview = []
                        for item in extracted:
                            ced = str(item.get("cedula", "")).replace(".", "").replace("-", "").strip()
                            if ced and ced not in existing_ceds:
                                rec = {
                                    "cedula": ced,
                                    "nombre": item.get("nombre", "").strip(),
                                    "telefono": item.get("telefono", "").strip(),
                                    "direccion": item.get("direccion", "").strip(),
                                    "sector": current_sector,
                                    "timestamp": datetime.now().isoformat(),
                                    "origen": "telegram_ocr_foto",
                                    "usuario": username
                                }
                                existing.append(rec)
                                existing_ceds.add(ced)
                                added += 1
                                if len(sample_preview) < 4:
                                    sample_preview.append(f"• V-{ced}: {rec['nombre']}")
                        
                        save_records(existing)
                        prev_txt = "\n".join(sample_preview)
                        send_msg(token, chat_id, (
                            f"✨ *Digitalización Exitosa con IA:*\n"
                            f"• Electores extraídos de la foto: *{len(extracted)}*\n"
                            f"• Nuevos registrados: *{added}*\n"
                            f"• Sector: `{current_sector}`\n\n"
                            f"*Vista previa:*\n{prev_txt}\n\n"
                            f"📊 Total en base de datos: {len(existing)}"
                        ))
                    else:
                        send_msg(token, chat_id, "❌ Error al descargar la foto para procesarla.")
                    continue

                # Handling plain text lines
                if text:
                    sec_match = re.match(r"^(?:sector[:\s]*)?([A-Za-z]{2,5}-\d{2,4}|[A-Za-z\s]{3,25})$", text.strip(), re.IGNORECASE)
                    if sec_match and not any(char in text for char in [",", ";", "\t"]) and not re.search(r"\d{6,8}", text):
                        val = sec_match.group(1).strip().upper()
                        user_sessions[chat_id]["sector"] = val
                        send_msg(token, chat_id, f"📍 Sector fijado a: *{val}*.\nAhora puedes enviar la lista de personas para este sector.")
                        continue
                    
                    lines = [l.strip() for l in text.splitlines() if l.strip()]
                    current_sector = user_sessions[chat_id]["sector"]
                    existing = load_records()
                    existing_ceds = {r.get("cedula") for r in existing}
                    added = 0
                    
                    for line in lines:
                        item = parse_line_elector(line, default_sector=current_sector)
                        if item and item["cedula"] not in existing_ceds:
                            item["timestamp"] = datetime.now().isoformat()
                            item["origen"] = "telegram_texto"
                            item["usuario"] = username
                            existing.append(item)
                            existing_ceds.add(item["cedula"])
                            added += 1
                    
                    if added > 0:
                        save_records(existing)
                        send_msg(token, chat_id, f"✅ *Registrados {added} electores* en el sector `{current_sector}`.\nTotal consolidado: *{len(existing)}* registros.\nUsa `/descargar` para obtener el archivo CSV.")
                    else:
                        send_msg(token, chat_id, (
                            "ℹ️ *No se detectaron electores nuevos.*\n"
                            "Asegúrate de incluir al menos la cédula de identidad.\n\n"
                            "*Formato recomendado:*\n"
                            "`V-12345678, Nombre y Apellido, 04147654321, Calle 3 Casa 5`\n"
                            "O envía un archivo CSV / foto de la planilla."
                        ))

        except requests.exceptions.RequestException as e:
            time.sleep(4)
        except Exception as e:
            print(f"[Loop Exception] {e}")
            time.sleep(2)

if __name__ == "__main__":
    main()
