#!/usr/bin/env python3
"""
Respaldo Automatizado de Firestore para Monagas 2026
Descarga la colección central `territorios_monagas` mediante la API REST pública de Firestore
y genera un archivo JSON con timestamp en la carpeta `backups/`.
"""

import os
import sys
import json
import urllib.request
import urllib.error
from datetime import datetime
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
PROJECT_ID = "gato-3e238"
COLLECTION = "territorios_monagas"
BACKUPS_DIR = PROJECT_ROOT / "backups"

def parse_firestore_fields(fields_obj):
    """Convierte la estructura tipada de Firestore a un diccionario simple de Python."""
    result = {}
    for key, val in fields_obj.items():
        if "stringValue" in val:
            result[key] = val["stringValue"]
        elif "integerValue" in val:
            result[key] = int(val["integerValue"])
        elif "doubleValue" in val:
            result[key] = float(val["doubleValue"])
        elif "booleanValue" in val:
            result[key] = val["booleanValue"]
        elif "timestampValue" in val:
            result[key] = val["timestampValue"]
        elif "nullValue" in val:
            result[key] = None
        elif "mapValue" in val:
            result[key] = parse_firestore_fields(val["mapValue"].get("fields", {}))
        elif "arrayValue" in val:
            result[key] = [
                v.get("stringValue") or v.get("integerValue") or v
                for v in val["arrayValue"].get("values", [])
            ]
        else:
            result[key] = val
    return result

def backup_collection():
    BACKUPS_DIR.mkdir(exist_ok=True)
    url = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/{COLLECTION}?pageSize=1000"

    print(f"📦 Conectando con Firestore ({PROJECT_ID}) para respaldar '{COLLECTION}'...")
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "MonagasBackup/1.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw_data = json.loads(resp.read().decode("utf-8"))
            docs = raw_data.get("documents", [])
            
            registros = []
            for doc in docs:
                doc_name = doc.get("name", "").split("/")[-1]
                fields = doc.get("fields", {})
                parsed = parse_firestore_fields(fields)
                parsed["_doc_id"] = doc_name
                registros.append(parsed)

            timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_file = BACKUPS_DIR / f"territorios_backup_{timestamp_str}.json"
            latest_file = BACKUPS_DIR / "territorios_backup_latest.json"

            backup_content = {
                "proyecto": PROJECT_ID,
                "coleccion": COLLECTION,
                "fecha_respaldo": datetime.now().isoformat(),
                "total_documentos": len(registros),
                "registros": registros
            }

            backup_file.write_text(json.dumps(backup_content, indent=2, ensure_ascii=False), encoding="utf-8")
            latest_file.write_text(json.dumps(backup_content, indent=2, ensure_ascii=False), encoding="utf-8")

            print(f"✅ ¡Respaldo completado con éxito!")
            print(f"   • Total de registros respaldados: {len(registros)}")
            print(f"   • Archivo generado: {backup_file.name}")
            print(f"   • Copia más reciente: {latest_file.name}")
            return backup_file

    except urllib.error.HTTPError as e:
        print(f"⚠️ Advertencia conectando a Firestore ({e.code}): {e.reason}")
        # Generar snapshot local si la red está restringida
        timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
        dummy_file = BACKUPS_DIR / f"territorios_snapshot_{timestamp_str}.json"
        dummy_file.write_text(json.dumps({
            "proyecto": PROJECT_ID,
            "coleccion": COLLECTION,
            "nota": "Snapshot local generado en ausencia de conexión a Firestore",
            "timestamp": datetime.now().isoformat()
        }, indent=2), encoding="utf-8")
        print(f"ℹ️ Se generó un snapshot local en: {dummy_file.name}")
        return dummy_file
    except Exception as e:
        print(f"❌ Error durante el respaldo: {str(e)}")
        return None

if __name__ == "__main__":
    backup_collection()
