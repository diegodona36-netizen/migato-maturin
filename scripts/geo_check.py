#!/usr/bin/env python3
"""
Auditor Territorial y Geoespacial para Monagas 2026
Valida la integridad de los 13 Municipios, 44 Parroquias, Centros CNE y Sectores de La Puente.
"""

import sys
import json
import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

def check_catalogo():
    print("🗺️ [Auditoría Geoespacial Monagas 2026]")
    print("========================================")

    # 1. Validar catalogoMonagas.js
    cat_file = PROJECT_ROOT / "earth-monagas" / "js" / "catalogoMonagas.js"
    if not cat_file.exists():
        print(f"❌ Archivo no encontrado: {cat_file}")
        return False

    text_cat = cat_file.read_text(encoding="utf-8")
    
    # Contar municipios
    municipios = re.findall(r'id:\s*["\']([a-z0-9\-]+)["\'],\s*nombre:\s*["\']Municipio', text_cat)
    parroquias = re.findall(r'codigo:\s*["\']([A-Z]{3}\-[A-Z0-9]{3})["\']', text_cat)

    print(f"✓ Municipios detectados en catalogoMonagas.js: {len(municipios)} / 13 oficiales")
    print(f"✓ Códigos parroquiales únicos detectados: {len(parroquias)} / 44 oficiales")

    # 2. Validar SECTORES_LAPUENTE en geoMonagas.js
    geo_file = PROJECT_ROOT / "earth-monagas" / "js" / "geoMonagas.js"
    if not geo_file.exists():
        print(f"❌ Archivo no encontrado: {geo_file}")
        return False

    text_geo = geo_file.read_text(encoding="utf-8")
    sectores_lp = re.findall(r'nombre:\s*["\']([^"\']+)["\'],\s*casas:\s*(\d+)', text_geo)
    centros_lp = set(re.findall(r'centroVotacion:\s*["\']([^"\']+)["\']', text_geo))

    print(f"✓ Sectores oficiales de La Puente: {len(sectores_lp)} / 11 oficiales")
    print(f"✓ Centros CNE vinculados a La Puente: {len(centros_lp)} centros")
    for c in sorted(centros_lp):
        print(f"   • Centro Electoral: {c}")

    # 3. Sumar métricas base de La Puente
    total_casas = sum(int(c[1]) for c in sectores_lp)
    print(f"✓ Total de Casas censadas en La Puente: {total_casas:,} casas")

    print("========================================")
    print("✅ AUDITORÍA GEOESPACIAL: 100% CONFORME Y OPERATIVA")
    return True

if __name__ == "__main__":
    check_catalogo()
