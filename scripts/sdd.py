#!/usr/bin/env python3
"""
CLI de Asistencia Spec-Driven Development (SDD) — MIGATO Monagas
Basado en la metodología de Brais Moure (@mouredev) adaptada para el Comando Estratégico.

Comandos:
  python3 scripts/sdd.py status              Muestra el estado de todas las specs y avance de tareas.
  python3 scripts/sdd.py new "<nombre>"      Crea una nueva especificación numerada desde las plantillas.
  python3 scripts/sdd.py check <numero>      Audita que la spec cumpla sintaxis EARS y la Constitución.
  python3 scripts/sdd.py sync-vault          Vincula las especificaciones con la Bóveda de Obsidian.
"""

import os
import sys
import re
import shutil
from pathlib import Path
from datetime import datetime

ROOT_DIR = Path(__file__).resolve().parent.parent
SDD_DIR = ROOT_DIR / ".sdd"
SPECS_DIR = SDD_DIR / "specs"
TEMPLATES_DIR = SDD_DIR / "templates"
VAULT_DIR = ROOT_DIR / "vault" / "04-Sistemas-y-Plataforma"

# Léxico chavista prohibido por la Constitución
PROHIBITED_WORDS = [
    "camarada", "revolución", "revolucion", "patria", "bolivariano", 
    "bolivariana", "socialista", "socialismo", "poder popular", 
    "comuna", "comunal", "circuito comunal", "1x10", "1 x 10"
]

def print_banner():
    print("=" * 68)
    print(" 🐱 GESTOR SPEC-DRIVEN DEVELOPMENT (SDD) • COMANDO MIGATO")
    print(" Conducción: José Gregorio 'El Gato' Briceño | Ing. Diego Donado")
    print("=" * 68)

def cmd_status():
    print_banner()
    if not SPECS_DIR.exists():
        print("⚠️ No se encontró el directorio de especificaciones (.sdd/specs).")
        return

    specs = sorted([d for d in SPECS_DIR.iterdir() if d.is_dir()])
    if not specs:
        print("ℹ️ No hay especificaciones registradas aún en .sdd/specs/")
        return

    print(f"\n📁 ESPECIFICACIONES ACTIVAS ({len(specs)} registradas):\n")
    print(f"{'NÚMERO':<8} {'ESPECIFICACIÓN / MÓDULO':<38} {'ESTADO':<15} {'TAREAS'}")
    print("-" * 72)

    for spec_dir in specs:
        spec_file = spec_dir / "spec.md"
        tasks_file = spec_dir / "tasks.md"

        spec_title = spec_dir.name
        spec_status = "Borrador"
        tasks_progress = "0/0 (0%)"

        if spec_file.exists():
            content = spec_file.read_text(encoding="utf-8")
            title_match = re.search(r"^#\s*Spec\s*\d+\s*[—-]\s*(.+)$", content, re.MULTILINE)
            if title_match:
                spec_title = title_match.group(1).strip()
            status_match = re.search(r"\*\*Estado:\*\*\s*([^\n|]+)", content)
            if status_match:
                spec_status = status_match.group(1).strip()

        if tasks_file.exists():
            content = tasks_file.read_text(encoding="utf-8")
            total = len(re.findall(r"-\s*\[[ xX]\]", content))
            done = len(re.findall(r"-\s*\[[xX]\]", content))
            pct = int((done / total) * 100) if total > 0 else 0
            tasks_progress = f"{done}/{total} ({pct}%)"

        print(f"{spec_dir.name[:6]:<8} {spec_title[:36]:<38} {spec_status[:13]:<15} {tasks_progress}")

    print("\n💡 Usa 'python3 scripts/sdd.py new <nombre>' para iniciar una nueva spec.\n")

def cmd_new(name):
    print_banner()
    if not name:
        print("❌ Error: Debes indicar el nombre del módulo. Ej: python3 scripts/sdd.py new 'censo-sectorial'")
        return

    # Normalizar slug
    slug = re.sub(r"[^\w\s-]", "", name).strip().lower()
    slug = re.sub(r"[-\s]+", "-", slug)

    SPECS_DIR.mkdir(parents=True, exist_ok=True)
    existing = [d for d in SPECS_DIR.iterdir() if d.is_dir()]
    next_num = len(existing) + 1
    num_str = f"{next_num:03d}"
    target_dir = SPECS_DIR / f"{num_str}-{slug}"

    if target_dir.exists():
        print(f"❌ Error: La carpeta {target_dir.name} ya existe.")
        return

    target_dir.mkdir(parents=True)

    today = datetime.now().strftime("%Y-%m-%d")
    title = name.replace("-", " ").title()

    # Copiar plantillas reemplazando marcadores
    spec_template = (TEMPLATES_DIR / "spec.md").read_text(encoding="utf-8")
    spec_content = spec_template.replace("NNN", num_str).replace("<Nombre de la Funcionalidad / Módulo>", title).replace("YYYY-MM-DD", today)
    (target_dir / "spec.md").write_text(spec_content, encoding="utf-8")

    plan_template = (TEMPLATES_DIR / "plan.md").read_text(encoding="utf-8")
    plan_content = plan_template.replace("NNN", num_str).replace("<Nombre de la Funcionalidad>", title)
    (target_dir / "plan.md").write_text(plan_content, encoding="utf-8")

    tasks_template = (TEMPLATES_DIR / "tasks.md").read_text(encoding="utf-8")
    tasks_content = tasks_template.replace("NNN", num_str).replace("<Nombre de la Funcionalidad>", title)
    (target_dir / "tasks.md").write_text(tasks_content, encoding="utf-8")

    print(f"\n✅ ¡Especificación creada exitosamente en:\n   📂 {target_dir.relative_to(ROOT_DIR)}/\n")
    print("Archivos generados:")
    print(f"  📄 spec.md   (Requisitos funcionales bajo sintaxis EARS)")
    print(f"  📄 plan.md   (Arquitectura, modelo de datos y alternativas)")
    print(f"  📄 tasks.md  (Tareas atómicas y verificación)")
    print("\n🎯 Próximo Paso (Fase 2 de SDD - Entrevista Guiada):")
    print(f"   Pídele al agente de IA:")
    print(f'   "Revisa .sdd/specs/{target_dir.name}/spec.md y hazme preguntas de clarificación de una en una."\n')

def cmd_check(target_arg=None):
    print_banner()
    specs = sorted([d for d in SPECS_DIR.iterdir() if d.is_dir()])
    if not specs:
        print("ℹ️ No hay especificaciones para auditar.")
        return

    target_specs = []
    if target_arg:
        target_specs = [d for d in specs if target_arg.lower() in d.name.lower()]
        if not target_specs:
            print(f"❌ No se encontró ninguna spec que coincida con '{target_arg}'.")
            return
    else:
        target_specs = specs

    print(f"\n🔍 AUDITORÍA DE CALIDAD Y CONSTITUCIÓN ({len(target_specs)} analizadas):\n")

    for spec_dir in target_specs:
        spec_file = spec_dir / "spec.md"
        print(f"📋 Analizando: {spec_dir.name}/spec.md ...")
        if not spec_file.exists():
            print("   ❌ Archivo spec.md no encontrado.")
            continue

        content = spec_file.read_text(encoding="utf-8")
        issues = []
        warnings = []

        # 1. Comprobación EARS
        has_ears = bool(re.search(r"\b(EL SISTEMA|CUANDO|MIENTRAS|SI .+ ENTONCES)\b", content))
        if not has_ears:
            issues.append("Falta sintaxis EARS en los requisitos funcionales (EL SISTEMA, CUANDO, SI... ENTONCES).")

        # 2. Comprobación léxica constitucional
        content_lower = content.lower()
        for w in PROHIBITED_WORDS:
            if re.search(r"\b" + re.escape(w) + r"\b", content_lower):
                issues.append(f"VIOLACIÓN CONSTITUCIONAL: Contiene léxico chavista prohibido ('{w}').")

        # 3. Comprobación de siglas confusas (PK)
        if re.search(r"\bPK\b", content):
            warnings.append("Detectada sigla técnica 'PK'. Se recomienda reemplazar por distancias directas ('De 0 m a 300 m').")

        # 4. Comprobación de secciones mínimas
        required_sections = ["Contexto y Objetivo", "Historias de Usuario", "Requisitos Funcionales", "Criterios de Finalización"]
        for sec in required_sections:
            if sec.lower() not in content_lower:
                issues.append(f"Sección obligatoria ausente: '{sec}'.")

        # 5. Comprobación de tamaño de tipografía (Constitución Art. 3)
        if "16px" not in content and "text-base" not in content:
            warnings.append("No se menciona explícitamente el requisito ergonómico de 16px/14px de la Constitución.")

        if not issues and not warnings:
            print("   ✅ 100% VÁLIDA: Cumple con la sintaxis EARS y la Constitución MIGATO.")
        else:
            for iss in issues:
                print(f"   ❌ ERROR: {iss}")
            for w in warnings:
                print(f"   ⚠️ AVISO: {w}")
        print()

def cmd_sync_vault():
    print_banner()
    VAULT_DIR.mkdir(parents=True, exist_ok=True)
    specs = sorted([d for d in SPECS_DIR.iterdir() if d.is_dir()])
    print(f"\n🔄 Sincronizando {len(specs)} especificaciones con Obsidian Vault ({VAULT_DIR.relative_to(ROOT_DIR)}/)...")

    for spec_dir in specs:
        spec_file = spec_dir / "spec.md"
        if not spec_file.exists():
            continue

        vault_file = VAULT_DIR / f"Spec_{spec_dir.name}.md"
        content = spec_file.read_text(encoding="utf-8")

        # Añadir enlaces bidireccionales y cabecera de Obsidian
        header = f"""---
aliases: [{spec_dir.name}, Spec-{spec_dir.name[:3]}]
tags: [sdd, especificaciones, ingenieria, migato]
fecha: {datetime.now().strftime('%Y-%m-%d')}
---

# [[MIGATO]] • Especificación {spec_dir.name}
*Enlace a la arquitectura central: [[Arquitectura_Sistemas_MIGATO]] | Conducción: [[José_Gregorio_El_Gato_Briceño]]*

"""
        vault_file.write_text(header + content, encoding="utf-8")
        print(f"   ✅ Sincronizada: {vault_file.name}")

    print("\n✨ Grafo de conocimiento de Obsidian actualizado exitosamente.\n")

def main():
    if len(sys.argv) < 2:
        cmd_status()
        return

    action = sys.argv[1].lower()
    if action == "status":
        cmd_status()
    elif action == "new":
        name = sys.argv[2] if len(sys.argv) > 2 else ""
        cmd_new(name)
    elif action == "check":
        arg = sys.argv[2] if len(sys.argv) > 2 else None
        cmd_check(arg)
    elif action in ["sync", "sync-vault"]:
        cmd_sync_vault()
    else:
        print(f"Comando desconocido: '{action}'. Usa: status, new, check, sync-vault.")

if __name__ == "__main__":
    main()
