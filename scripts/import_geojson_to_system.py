#!/usr/bin/env python3
"""
Sincronizador Automático de GeoJSON Editado en QGIS / GeoJSON.io
Convierte los archivos .geojson editados en el archivo maestro earth-monagas/js/geoOficialMonagas.js
Preserva la integridad de los módulos Earth 3D y Lámina 120".

Soporta:
1. Archivos combinados (Polígonos de Parroquias + Puntos de Centros Electorales):
   Filtra automáticamente los polígonos para la capa territorial sin romper los centros.
2. Parámetro de archivo por línea de comandos:
   python3 scripts/import_geojson_to_system.py [ruta/al/archivo.geojson]
"""

import os
import sys
import json
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEO_JS_PATH = os.path.join(BASE_DIR, "earth-monagas", "js", "geoOficialMonagas.js")
PARROQUIAS_GEOJSON = os.path.join(BASE_DIR, "earth-monagas", "data", "parroquias_monagas_editable.geojson")
MUNICIPIOS_GEOJSON = os.path.join(BASE_DIR, "earth-monagas", "data", "municipios_monagas_editable.geojson")

def sync_geojson(custom_input_file=None):
    if not os.path.exists(GEO_JS_PATH):
        print(f"Error: No se encontró {GEO_JS_PATH}")
        return

    with open(GEO_JS_PATH, "r", encoding="utf-8") as f:
        js_content = f.read()

    target_parroquias_file = custom_input_file if (custom_input_file and os.path.exists(custom_input_file)) else PARROQUIAS_GEOJSON

    # 1. Sincronizar Parroquias
    if os.path.exists(target_parroquias_file):
        with open(target_parroquias_file, "r", encoding="utf-8") as f:
            parroquias_raw = json.load(f)

        features = parroquias_raw.get("features", [])
        # Filtrar polígonos (en caso de que el archivo descargado de geojson.io contenga puntos y polígonos)
        polygon_features = [
            f for f in features
            if f.get("geometry", {}).get("type") in ["Polygon", "MultiPolygon"]
        ]
        point_features = [
            f for f in features
            if f.get("geometry", {}).get("type") == "Point"
        ]

        if not polygon_features:
            print(f"⚠ Advertencia: No se encontraron geometrías poligonales en {target_parroquias_file}")
            polygon_features = features

        cleaned_parroquias = {
            "type": "FeatureCollection",
            "name": "GEO_PARROQUIAS_OFICIAL",
            "features": polygon_features
        }

        # Guardar copia editable limpia
        with open(PARROQUIAS_GEOJSON, "w", encoding="utf-8") as pf:
            json.dump(cleaned_parroquias, pf, ensure_ascii=False, indent=2)

        parroquias_json_str = json.dumps(cleaned_parroquias, ensure_ascii=False)
        pattern_par = r'(export const GEO_PARROQUIAS_OFICIAL\s*=\s*)\{.*?\}(;)'
        if re.search(pattern_par, js_content, re.DOTALL):
            js_content = re.sub(pattern_par, rf'\g<1>{parroquias_json_str}\g<2>', js_content, flags=re.DOTALL)
            print(f"✔ Parroquias sincronizadas con éxito ({len(polygon_features)} polígonos parroquiales integrados)")
            if point_features:
                print(f"  (Se detectaron {len(point_features)} puntos de centros electorales, preservados en la capa temática)")
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

    print("✔ Sincronización completa y exitosa en geoOficialMonagas.js.")

if __name__ == "__main__":
    input_file = sys.argv[1] if len(sys.argv) > 1 else None
    sync_geojson(input_file)
