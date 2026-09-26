#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Exportador Maestro de Actas MIGATO: Markdown (Obsidian) + DOCX (IUTIRLA) + Formato WhatsApp
Sincroniza con el Grafo de Conocimiento de la Bóveda en vault/06-Actas-y-Reuniones/
"""

import os
import sys
import json
import re
from pathlib import Path
from datetime import datetime
from build_acta_word import build_acta_docx

PROJECT_ROOT = Path(__file__).resolve().parent.parent
VAULT_ACTAS_DIR = PROJECT_ROOT / "vault" / "06-Actas-y-Reuniones"

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '_', text).strip('_')
    return text[:40]

def export_acta_to_obsidian(data):
    """Genera archivo Markdown con frontmatter y enlaces bidireccionales [[...]]"""
    VAULT_ACTAS_DIR.mkdir(parents=True, exist_ok=True)
    
    fecha = data.get("fecha", datetime.now().strftime("%Y-%m-%d"))
    titulo = data.get("titulo", "Reunión de Mando")
    slug = slugify(titulo)
    filename = f"Acta_{fecha}_{slug}.md"
    file_path = VAULT_ACTAS_DIR / filename

    participantes = data.get("participantes", [])
    part_links = [f"[[{p.split('(')[0].strip()}]]" for p in participantes]

    md = []
    md.append("---")
    md.append(f"title: \"{titulo}\"")
    md.append(f"date: {fecha}")
    md.append(f"duration: \"{data.get('duracion', '02:00:00')}\"")
    md.append(f"location: \"{data.get('lugar', 'Maturín')}\"")
    md.append("tags:")
    md.append("  - migato2026")
    md.append("  - acta-reunion")
    md.append("  - sala-situacional")
    md.append("  - comando-regional")
    md.append("---")
    md.append("")
    md.append(f"# 🏛️ {titulo}")
    md.append(f"**Fecha:** `{fecha}` | **Duración:** `{data.get('duracion', '02:00:00')}` | **Sede:** `{data.get('lugar', 'Maturín')}`")
    md.append(f"**Participantes Clave:** {', '.join(part_links)}")
    md.append("")
    md.append("---")
    md.append("")
    md.append("## 📌 1. Resumen Ejecutivo (BLUF)")
    md.append(data.get("resumen_ejecutivo", "Sin resumen disponible."))
    md.append("")
    
    ideas = data.get("lluvia_ideas", [])
    if ideas:
        md.append("## 💡 2. Matriz de Lluvia de Ideas y Propuestas")
        for i, idea in enumerate(ideas, 1):
            md.append(f"- **[Propuesta {i}]:** {idea}")
        md.append("")

    debates = data.get("debates", [])
    if debates:
        md.append("## ⚖️ 3. Debate Dialéctico: Opiniones vs. Contraopiniones")
        for d in debates:
            md.append(f"### ⚔️ Eje: {d.get('tema', 'Punto en Debate')}")
            md.append(f"- **Propuesta / Opinión:** {d.get('opinion', '')}")
            md.append(f"- **Objeción / Contraopinión:** {d.get('contraopinion', '')}")
            md.append(f"- **Resolución Acordada:** *{d.get('resolucion', '')}*")
            md.append("")

    acuerdos = data.get("acuerdos", [])
    if acuerdos:
        md.append("## 📋 4. Matriz de Acuerdos y Compromisos Adquiridos")
        md.append("| Compromiso / Tarea | Responsable | Plazo | Estado |")
        md.append("| :--- | :--- | :--- | :--- |")
        for a in acuerdos:
            t = a.get("tarea", "")
            r = a.get("responsable", "")
            p = a.get("plazo", "")
            e = a.get("estado", "Aprobado")
            md.append(f"| {t} | **[[{r}]]** | `{p}` | `{e}` |")
        md.append("")

    pendientes = data.get("pendientes", [])
    if pendientes:
        md.append("## ⏳ 5. Puntos Pendientes para la Próxima Sesión")
        for p in pendientes:
            md.append(f"- ⚠️ {p}")
        md.append("")

    md.append("---")
    md.append("### 🔗 Enlaces Relacionales del Grafo (Word Tree)")
    md.append("- [[00-Indice-General]]")
    md.append("- [[Modulo Comandos Territoriales]]")
    md.append("- [[Modulo Sala Situacional]]")
    md.append("- [[Modulo Centros Electorales y Padron CNE]]")
    md.append("")

    with open(file_path, "w", encoding="utf-8") as f:
        f.write("\n".join(md))

    return str(file_path)

def generate_whatsapp_summary(data):
    """Genera resumen formateado listo para enviar por WhatsApp / Telegram"""
    fecha = data.get("fecha", datetime.now().strftime("%Y-%m-%d"))
    titulo = data.get("titulo", "Reunión de Mando")
    
    txt = []
    txt.append(f"🏛️ *MIGATO • MINUTA EJECUTIVA DE REUNIÓN*")
    txt.append(f"📅 *Fecha:* {fecha} | ⏱️ *Duración:* {data.get('duracion', '02:00:00')}")
    txt.append(f"📍 *Asunto:* {titulo}")
    txt.append("")
    txt.append("📌 *RESUMEN ESTRATÉGICO:*")
    txt.append(data.get("resumen_ejecutivo", "")[:350] + "...")
    txt.append("")
    
    debates = data.get("debates", [])
    if debates:
        txt.append("⚖️ *DEBATES Y DEFINICIONES:*")
        for d in debates[:3]:
            txt.append(f"• *{d.get('tema')}:* {d.get('resolucion')}")
        txt.append("")

    acuerdos = data.get("acuerdos", [])
    if acuerdos:
        txt.append("✅ *COMPROMISOS ASIGNADOS:*")
        for a in acuerdos:
            txt.append(f"• *{a.get('responsable')}:* {a.get('tarea')} (Plazo: {a.get('plazo')})")
        txt.append("")

    txt.append("🔒 _Documento foliado en Bóveda Obsidian y Acta DOCX oficial disponible._")
    return "\n".join(txt)

def process_and_save_full_acta(data):
    fecha = data.get("fecha", datetime.now().strftime("%Y-%m-%d"))
    titulo = data.get("titulo", "Reunión de Mando")
    slug = slugify(titulo)
    
    md_path = export_acta_to_obsidian(data)
    docx_path = str(VAULT_ACTAS_DIR / f"Acta_{fecha}_{slug}.docx")
    build_acta_docx(data, docx_path)
    whatsapp_txt = generate_whatsapp_summary(data)
    
    return {
        "success": True,
        "md_path": md_path,
        "docx_path": docx_path,
        "whatsapp_txt": whatsapp_txt
    }

if __name__ == "__main__":
    if len(sys.argv) > 1 and os.path.exists(sys.argv[1]):
        with open(sys.argv[1]) as f:
            d = json.load(f)
        res = process_and_save_full_acta(d)
        print("Resultado:", json.dumps(res, indent=2))
    else:
        print("Uso: python3 export_acta.py datos_reunion.json")
