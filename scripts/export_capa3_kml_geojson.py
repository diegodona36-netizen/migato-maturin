#!/usr/bin/env python3
"""
Generador y Exportador Maestro de Capa 3 (Parroquias de Monagas + Centros Electorales CNE)
Unifica los polígonos oficiales de las 44 Parroquias con los 175 Centros de Votación KML
en formatos estándar GeoJSON y KML listos para importar en GeoJSON.io, QGIS y Google Earth.
"""

import os
import json
import xml.etree.ElementTree as ET
import html

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PARROQUIAS_GEOJSON = os.path.join(BASE_DIR, "earth-monagas", "data", "parroquias_monagas_editable.geojson")
CENTROS_KML = os.path.join(BASE_DIR, "centros-maturin", "centros_electorales_maturin.kml")

OUT_COMBINED_GEOJSON = os.path.join(BASE_DIR, "earth-monagas", "data", "capa3_parroquias_con_centros.geojson")
OUT_SOLO_PARROQUIAS_GEOJSON = os.path.join(BASE_DIR, "earth-monagas", "data", "capa3_parroquias_solo_poligonos.geojson")
OUT_KML = os.path.join(BASE_DIR, "earth-monagas", "data", "capa3_parroquias_monagas.kml")

# Paleta base de Parroquias y Municipios para GeoJSON.io (simple-style spec)
MUN_COLORS = {
    "maturin": "#1d4ed8",
    "caripe": "#dc2626",
    "acosta": "#0891b2",
    "cedeno": "#7c3aed",
    "piar": "#f59e0b",
    "punceres": "#8b5cf6",
    "bolivar": "#0284c7",
    "ezequiel-zamora": "#ea580c",
    "santa-barbara": "#ec4899",
    "aguasay": "#eab308",
    "libertador": "#059669",
    "uracoa": "#14b8a6",
    "sotillo": "#c026d3"
}

PARISH_COLORS = {
    "san-simon": "#2563eb",
    "alto-de-los-godos": "#7c3aed",
    "boqueron": "#ea580c",
    "las-cocuizas": "#059669",
    "santa-cruz": "#0284c7",
    "san-vicente": "#db2777",
    "la-pica": "#dc2626",
    "jusepin": "#d97706",
    "el-furrial": "#65a30d",
    "el-corozo": "#4f46e5",
    "san-simon-sur": "#0d9488"
}

def hex_to_kml_color(hex_str, alpha_pct=0.26):
    """Convierte hex #RRGGBB a formato KML aabbggrr con transparencia"""
    hex_clean = hex_str.lstrip('#')
    if len(hex_clean) == 3:
        hex_clean = ''.join([c*2 for c in hex_clean])
    r = hex_clean[0:2]
    g = hex_clean[2:4]
    b = hex_clean[4:6]
    a = f"{int(alpha_pct * 255):02x}"
    return f"{a}{b}{g}{r}"

def parse_kml_centers():
    """Lee el KML de centros electorales y extrae puntos y metadatos limpios"""
    if not os.path.exists(CENTROS_KML):
        print(f"Error: no existe {CENTROS_KML}")
        return []

    tree = ET.parse(CENTROS_KML)
    root = tree.getroot()
    ns = {'kml': 'http://www.opengis.net/kml/2.2'}
    pms = root.findall('.//kml:Placemark', ns)
    if not pms:
        pms = root.findall('.//Placemark')

    centers = []
    for pm in pms:
        name_el = pm.find('kml:name', ns) if 'kml' in ns else pm.find('name')
        if name_el is None: name_el = pm.find('name')
        name = name_el.text.strip() if name_el is not None and name_el.text else "Centro Electoral"

        coords_el = pm.find('.//kml:coordinates', ns)
        if coords_el is None: coords_el = pm.find('.//coordinates')
        if coords_el is None or not coords_el.text:
            continue

        raw_c = coords_el.text.strip().split(',')
        lon = float(raw_c[0].strip())
        lat = float(raw_c[1].strip())
        elev = float(raw_c[2].strip()) if len(raw_c) > 2 else 0.0

        desc_el = pm.find('kml:description', ns)
        if desc_el is None: desc_el = pm.find('description')
        desc_text = desc_el.text.strip() if desc_el is not None and desc_el.text else ""

        # Extraer campos clave
        codigo_cne = ""
        parroquia = ""
        mesas = ""
        for item in desc_text.split('<br/>'):
            if 'Código CNE:' in item:
                codigo_cne = item.replace('<b>Código CNE:</b>', '').replace('Código CNE:', '').strip()
            elif 'Parroquia:' in item:
                parroquia = item.replace('<b>Parroquia:</b>', '').replace('Parroquia:', '').strip()
            elif 'Mesas:' in item:
                mesas = item.replace('<b>Mesas:</b>', '').replace('Mesas:', '').strip()

        centers.append({
            "name": name,
            "lon": lon,
            "lat": lat,
            "elev": elev,
            "codigo_cne": codigo_cne,
            "parroquia": parroquia,
            "mesas": mesas,
            "raw_desc": desc_text
        })

    return centers

def build_exports():
    print("Iniciando exportación de Capa 3...")

    # 1. Cargar Parroquias Oficiales
    with open(PARROQUIAS_GEOJSON, "r", encoding="utf-8") as f:
        parroquias_geo = json.load(f)

    # 2. Cargar Centros de Votación KML
    centers = parse_kml_centers()
    print(f"✔ Parroquias base cargadas: {len(parroquias_geo.get('features', []))}")
    print(f"✔ Centros electorales extraídos del KML: {len(centers)}")

    # 3. Preparar GeoJSON Solo Parroquias con simple-style spec para geojson.io
    parroquias_features_styled = []
    for feat in parroquias_geo.get("features", []):
        f_copy = json.loads(json.dumps(feat))
        props = f_copy.get("properties", {})
        p_id = props.get("id", "")
        mun_id = props.get("municipioId", "")
        mun_nom = props.get("municipioNombre", "")
        p_nom = props.get("nombre", "")

        color = PARISH_COLORS.get(p_id, MUN_COLORS.get(mun_id, "#2563eb"))
        props["tipo"] = "parroquia"
        props["stroke"] = color
        props["stroke-width"] = 2.5
        props["stroke-opacity"] = 0.85
        props["fill"] = color
        props["fill-opacity"] = 0.26
        props["title"] = f"Parroquia {p_nom} ({mun_nom})"
        props["description"] = f"<b>Parroquia Oficial:</b> {p_nom}<br><b>Municipio:</b> {mun_nom}<br><b>Código PCODE:</b> {props.get('ADM3_PCODE', '')}"
        parroquias_features_styled.append(f_copy)

    solo_parroquias_geojson = {
        "type": "FeatureCollection",
        "name": "Capa_3_Parroquias_Monagas",
        "features": parroquias_features_styled
    }
    with open(OUT_SOLO_PARROQUIAS_GEOJSON, "w", encoding="utf-8") as f:
        json.dump(solo_parroquias_geojson, f, ensure_ascii=False, indent=2)
    print(f"✔ Archivo GeoJSON solo parroquias creado: {OUT_SOLO_PARROQUIAS_GEOJSON}")

    # 4. Preparar GeoJSON Combinado (Parroquias + Centros Electorales KML)
    combined_features = list(parroquias_features_styled)

    for c in centers:
        pt_feat = {
            "type": "Feature",
            "properties": {
                "tipo": "centro_votacion",
                "nombre": c["name"],
                "codigoCne": c["codigo_cne"],
                "parroquiaCne": c["parroquia"],
                "mesas": c["mesas"],
                "marker-color": "#ea580c",
                "marker-size": "medium",
                "marker-symbol": "school",
                "title": f"Centro: {c['name']}",
                "description": f"<b>{c['name']}</b><br><b>Código CNE:</b> {c['codigo_cne']}<br><b>Parroquia CNE:</b> {c['parroquia']}<br><b>Mesas:</b> {c['mesas']}<br><i>Utiliza este punto para calibrar el límite parroquial correspondiente.</i>"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [c["lon"], c["lat"]]
            }
        }
        combined_features.append(pt_feat)

    combined_geojson = {
        "type": "FeatureCollection",
        "name": "Capa_3_Monagas_Parroquias_y_Centros_Electorales",
        "features": combined_features
    }
    with open(OUT_COMBINED_GEOJSON, "w", encoding="utf-8") as f:
        json.dump(combined_geojson, f, ensure_ascii=False, indent=2)
    print(f"✔ Archivo GeoJSON unificado (Capa 3 + KML) creado: {OUT_COMBINED_GEOJSON}")

    # 5. Generar archivo KML nativo unificado
    kml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<kml xmlns="http://www.opengis.net/kml/2.2">',
        '  <Document>',
        '    <name>MIGATO - Monagas 2026: Capa 3 Parroquias y Centros Electorales</name>',
        '    <description>Consolidado Oficial de las 44 Parroquias del Estado Monagas y 175 Centros de Votación Georreferenciados para calibración de límites territoriales.</description>',
        ''
    ]

    # Estilos KML para cada parroquia
    for feat in parroquias_features_styled:
        props = feat["properties"]
        p_id = props.get("id", "default")
        color = props.get("fill", "#2563eb")
        poly_color = hex_to_kml_color(color, 0.35)
        line_color = hex_to_kml_color(color, 0.95)
        kml_lines.append(f'    <Style id="style-parroquia-{p_id}">')
        kml_lines.append(f'      <LineStyle><color>{line_color}</color><width>2.5</width></LineStyle>')
        kml_lines.append(f'      <PolyStyle><color>{poly_color}</color><fill>1</fill><outline>1</outline></PolyStyle>')
        kml_lines.append('    </Style>')

    # Estilo KML para centros electorales
    kml_lines.append('    <Style id="style-centro-electoral">')
    kml_lines.append('      <IconStyle>')
    kml_lines.append('        <color>ff0c58ea</color>') # Naranja en KML (aabbggrr)
    kml_lines.append('        <scale>1.1</scale>')
    kml_lines.append('        <Icon><href>http://maps.google.com/mapfiles/kml/paddle/orange-circle.png</href></Icon>')
    kml_lines.append('      </IconStyle>')
    kml_lines.append('    </Style>')
    kml_lines.append('')

    # Carpeta 1: 44 Parroquias Oficiales
    kml_lines.append('    <Folder>')
    kml_lines.append('      <name>1. Capa 3: 44 Parroquias Oficiales (Polígonos)</name>')
    kml_lines.append('      <open>1</open>')

    for feat in parroquias_features_styled:
        props = feat["properties"]
        geom = feat["geometry"]
        p_id = props.get("id", "default")
        p_nom = html.escape(props.get("nombre", ""))
        mun_nom = html.escape(props.get("municipioNombre", ""))
        desc = html.escape(f"Parroquia {p_nom}, Municipio {mun_nom}. PCODE: {props.get('ADM3_PCODE', '')}")

        kml_lines.append('      <Placemark>')
        kml_lines.append(f'        <name>{p_nom} ({mun_nom})</name>')
        kml_lines.append(f'        <description>{desc}</description>')
        kml_lines.append(f'        <styleUrl>#style-parroquia-{p_id}</styleUrl>')

        gtype = geom["type"]
        coords = geom["coordinates"]

        if gtype == "Polygon":
            kml_lines.append('        <Polygon>')
            kml_lines.append('          <outerBoundaryIs><LinearRing><coordinates>')
            coord_str = " ".join([f"{pt[0]},{pt[1]},0" for pt in coords[0]])
            kml_lines.append(f'            {coord_str}')
            kml_lines.append('          </coordinates></LinearRing></outerBoundaryIs>')
            for inner in coords[1:]:
                kml_lines.append('          <innerBoundaryIs><LinearRing><coordinates>')
                inner_str = " ".join([f"{pt[0]},{pt[1]},0" for pt in inner])
                kml_lines.append(f'            {inner_str}')
                kml_lines.append('          </coordinates></LinearRing></innerBoundaryIs>')
            kml_lines.append('        </Polygon>')
        elif gtype == "MultiPolygon":
            kml_lines.append('        <MultiGeometry>')
            for poly in coords:
                kml_lines.append('          <Polygon>')
                kml_lines.append('            <outerBoundaryIs><LinearRing><coordinates>')
                coord_str = " ".join([f"{pt[0]},{pt[1]},0" for pt in poly[0]])
                kml_lines.append(f'              {coord_str}')
                kml_lines.append('            </coordinates></LinearRing></outerBoundaryIs>')
                for inner in poly[1:]:
                    kml_lines.append('            <innerBoundaryIs><LinearRing><coordinates>')
                    inner_str = " ".join([f"{pt[0]},{pt[1]},0" for pt in inner])
                    kml_lines.append(f'              {inner_str}')
                    kml_lines.append('            </coordinates></LinearRing></innerBoundaryIs>')
                kml_lines.append('          </Polygon>')
            kml_lines.append('        </MultiGeometry>')

        kml_lines.append('      </Placemark>')

    kml_lines.append('    </Folder>')
    kml_lines.append('')

    # Carpeta 2: 175 Centros Electorales
    kml_lines.append('    <Folder>')
    kml_lines.append('      <name>2. Centros Electorales CNE Maturín (175 Puntos)</name>')
    kml_lines.append('      <open>0</open>')

    for c in centers:
        name_esc = html.escape(c["name"])
        desc_esc = html.escape(c["raw_desc"])
        kml_lines.append('      <Placemark>')
        kml_lines.append(f'        <name>{name_esc}</name>')
        kml_lines.append(f'        <description>{desc_esc}</description>')
        kml_lines.append('        <styleUrl>#style-centro-electoral</styleUrl>')
        kml_lines.append(f'        <Point><coordinates>{c["lon"]},{c["lat"]},{c["elev"]}</coordinates></Point>')
        kml_lines.append('      </Placemark>')

    kml_lines.append('    </Folder>')
    kml_lines.append('  </Document>')
    kml_lines.append('</kml>')

    with open(OUT_KML, "w", encoding="utf-8") as f:
        f.write("\n".join(kml_lines))
    print(f"✔ Archivo KML unificado creado: {OUT_KML}")

    print("\nResumen final de archivos listos:")
    print(f"1. GeoJSON Combinado: {OUT_COMBINED_GEOJSON} ({os.path.getsize(OUT_COMBINED_GEOJSON)} bytes)")
    print(f"2. KML Unificado:    {OUT_KML} ({os.path.getsize(OUT_KML)} bytes)")
    print(f"3. GeoJSON Parroquias: {OUT_SOLO_PARROQUIAS_GEOJSON} ({os.path.getsize(OUT_SOLO_PARROQUIAS_GEOJSON)} bytes)")

if __name__ == "__main__":
    build_exports()
