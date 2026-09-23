#!/usr/bin/env python3
"""
Sincronizador Automático de GeoJSON Editado en QGIS / GeoJSON.io
Convierte los archivos .geojson editados en el archivo maestro earth-monagas/js/geoOficialMonagas.js
Preserva la integridad de los módulos Earth 3D y Lámina 120".
"""

import os
import json
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEO_JS_PATH = os.path.join(BASE_DIR, "earth-monagas", "js", "geoOficialMonagas.js")
PARROQUIAS_GEOJSON = os.path.join(BASE_DIR, "earth-monagas", "data", "parroquias_monagas_editable.geojson")
MUNICIPIOS_GEOJSON = os.path.join(BASE_DIR, "earth-monagas", "data", "municipios_monagas_editable.geojson")

def sync_geojson():
    if not os.path.exists(GEO_JS_PATH):
        print(f"Error: No se encontró {GEO_JS_PATH}")
        return

    with open(GEO_JS_PATH, "r", encoding="utf-8") as f:
        js_content = f.read()

    # 1. Sincronizar Parroquias
    if os.path.exists(PARROQUIAS_GEOJSON):
        with open(PARROQUIAS_GEOJSON, "r", encoding="utf-8") as f:
            parroquias_data = json.load(f)
        
        parroquias_json_str = json.dumps(parroquias_data, ensure_ascii=False)
        pattern_par = r'(export const GEO_PARROQUIAS_OFICIAL\s*=\s*)\{.*?\}(;)'
        if re.search(pattern_par, js_content, re.DOTALL):
            js_content = re.sub(pattern_par, rf'\g<1>{parroquias_json_str}\g<2>', js_content, flags=re.DOTALL)
            print(f"✔ Parroquias sincronizadas con éxito ({len(parroquias_data.get('features', []))} features)")
        else:
            print("⚠ Advertencia: No se encontró el bloque GEO_PARROQUIAS_OFICIAL")

    # 2. Sincronizar Municipios
    if os.path.exists(MUNICIPIOS_GEOJSON):
        with open(MUNICIPIOS_GEOJSON, "r", encoding="utf-8") as f:
            municipios_data = json.load(f)
        
        municipios_json_str = json.dumps(municipios_data, ensure_ascii=False)
        pattern_mun = r'(export const GEO_MUNICIPIOS_OFICIAL\s*=\s*)\{.*?\}(;)'
        if re.search(pattern_mun, js_content, re.DOTALL):
            js_content = re.sub(pattern_mun, rf'\g<1>{municipios_json_str}\g<2>', js_content, flags=re.DOTALL)
            print(f"✔ Municipios sincronizados con éxito ({len(municipios_data.get('features', []))} features)")
        else:
            print("⚠ Advertencia: No se encontró el bloque GEO_MUNICIPIOS_OFICIAL")

    with open(GEO_JS_PATH, "w", encoding="utf-8") as f:
        f.write(js_content)

    print("✔ Sincronización completa en geoOficialMonagas.js.")

if __name__ == "__main__":
    sync_geojson()
