#!/usr/bin/env python3
"""
Generador de Reporte Situacional de Movilización (WhatsApp & Telegram)
Para la Dirección de Campaña y el Gobernador del Estado Monagas.
"""

import sys
import json
from datetime import datetime
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

def generar_reporte():
    fecha_hoy = datetime.now().strftime("%d/%m/%Y - %I:%M %p")
    
    # Revisar si hay un respaldo reciente en backups/
    latest_file = PROJECT_ROOT / "backups" / "territorios_backup_latest.json"
    registros = []
    if latest_file.exists():
        try:
            data = json.loads(latest_file.read_text(encoding="utf-8"))
            registros = data.get("registros", [])
        except Exception:
            pass

    total_reportes = len(registros)
    total_casas = sum(r.get("casas", 0) for r in registros)
    total_hab = sum(r.get("habitantes", 0) for r in registros)
    total_votantes = sum(r.get("votantes", 0) for r in registros)
    total_militantes = sum(r.get("militantes", 0) for r in registros)

    reporte = f"""🏛️ *SALA SITUACIONAL MONAGAS 2026*
📊 *REPORTE DE MOVILIZACIÓN Y DESPLIEGUE TERRITORIAL*
🗓️ *Fecha:* {fecha_hoy}
───────────────────────────────
📍 *ESTADO DE LA RED TERRITORIAL:*
• *Municipios Activos:* 13 / 13
• *Parroquias Monitoreadas:* 44 / 44
• *Sectores Reportados:* {total_reportes} comunidades

📈 *CONSOLIDADO NUMÉRICO:*
🏠 *Casas Censadas:* {total_casas:,}
👥 *Habitantes Resaltados:* {total_hab:,}
🗳️ *Intención de Voto Seguro:* {total_votantes:,}
✊ *Fuerza Militante Activa:* {total_militantes:,}

🚨 *FOCO PRIORITARIO: MATURÍN*
• Parroquia Alto de Los Godos • Sub-Parroquia 6 (La Puente):
  - 11 Sectores Oficiales asignados.
  - Centros Clave: Francisco Verde, Apolinar Cantor, Cruz Figuera Rondón.

🔗 *ENLACES DE SALA DE CONTROL:*
• Mapa Master 3D: https://diegodona36-netizen.github.io/migato-maturin/earth-monagas/?v=90&u=admin
• Despacho de Enlaces: https://diegodona36-netizen.github.io/migato-maturin/despacho/
───────────────────────────────
*Comando de Campaña Monagas • Operaciones 2026*"""

    print(reporte)
    return reporte

if __name__ == "__main__":
    generar_reporte()
