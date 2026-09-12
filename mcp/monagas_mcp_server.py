#!/usr/bin/env python3
"""
Servidor MCP Oficial: Plataforma de Inteligencia Territorial Monagas 2026
Protocolo: Model Context Protocol (MCP) JSON-RPC 2.0 sobre stdio
Cero dependencias externas requeridas (Python 3 standard library).
"""

import sys
import json
import os
import re
from pathlib import Path

# Directorio base del proyecto
PROJECT_ROOT = Path(__file__).resolve().parent.parent

# 1. Base de datos territorial embebida (13 Municipios y 44 Parroquias)
CATALOGO_MUNICIPIOS = [
    {
        "id": "maturin",
        "nombre": "Municipio Maturín",
        "capital": "Maturín",
        "electores": 318601,
        "centros": 175,
        "mesas": 361,
        "parroquias": [
            {"id": "san-simon", "nombre": "San Simón", "codigo": "MAT-SIM", "tipo": "Urbana Central"},
            {"id": "alto-de-los-godos", "nombre": "Alto de Los Godos", "codigo": "MAT-GOD", "tipo": "Urbana Oeste"},
            {"id": "boqueron", "nombre": "Boquerón", "codigo": "MAT-BOQ", "tipo": "Urbana Norte"},
            {"id": "las-cocuizas", "nombre": "Las Cocuizas", "codigo": "MAT-COC", "tipo": "Urbana Este"},
            {"id": "santa-cruz", "nombre": "Santa Cruz", "codigo": "MAT-CRZ", "tipo": "Urbana Suroeste"},
            {"id": "san-vicente", "nombre": "San Vicente", "codigo": "MAT-VIC", "tipo": "Urbana Oeste"},
            {"id": "el-corozo", "nombre": "El Corozo", "codigo": "MAT-COR", "tipo": "Rural Sur"},
            {"id": "el-furrial", "nombre": "El Furrial", "codigo": "MAT-FUR", "tipo": "Suburbana Petrolera"},
            {"id": "jusepin", "nombre": "Jusepín", "codigo": "MAT-JUS", "tipo": "Suburbana Petrolera"},
            {"id": "la-pica", "nombre": "La Pica", "codigo": "MAT-PIC", "tipo": "Suburbana Este"}
        ]
    },
    {
        "id": "acosta",
        "nombre": "Municipio Acosta",
        "capital": "San Antonio",
        "parroquias": [
            {"id": "san-antonio", "nombre": "San Antonio de Capayacuar", "codigo": "ACO-ANT"},
            {"id": "san-francisco", "nombre": "San Francisco", "codigo": "ACO-FRA"}
        ]
    },
    {
        "id": "aguasay",
        "nombre": "Municipio Aguasay",
        "capital": "Aguasay",
        "parroquias": [
            {"id": "aguasay", "nombre": "Aguasay", "codigo": "AGU-AGU"}
        ]
    },
    {
        "id": "bolivar",
        "nombre": "Municipio Bolívar",
        "capital": "Caripito",
        "parroquias": [
            {"id": "caripito", "nombre": "Caripito", "codigo": "BOL-CAR"}
        ]
    },
    {
        "id": "caripe",
        "nombre": "Municipio Caripe",
        "capital": "Caripe",
        "parroquias": [
            {"id": "caripe", "nombre": "Caripe", "codigo": "CAR-CAR"},
            {"id": "el-guacharo", "nombre": "El Guácharo", "codigo": "CAR-GUA"},
            {"id": "la-guanota", "nombre": "La Guanota", "codigo": "CAR-GNT"},
            {"id": "sabana-de-piedra", "nombre": "Sabana de Piedra", "codigo": "CAR-SAB"},
            {"id": "san-agustin", "nombre": "San Agustín", "codigo": "CAR-AGU"},
            {"id": "teresen", "nombre": "Teresén", "codigo": "CAR-TER"}
        ]
    },
    {
        "id": "cedeno",
        "nombre": "Municipio Cedeño",
        "capital": "Caicara de Maturín",
        "parroquias": [
            {"id": "caicara", "nombre": "Caicara", "codigo": "CED-CAI"},
            {"id": "areo", "nombre": "Areo", "codigo": "CED-ARE"},
            {"id": "san-felix", "nombre": "San Félix", "codigo": "CED-FEL"},
            {"id": "viento-fresco", "nombre": "Viento Fresco", "codigo": "CED-VIE"}
        ]
    },
    {
        "id": "ezequiel-zamora",
        "nombre": "Municipio Ezequiel Zamora",
        "capital": "Punta de Mata",
        "parroquias": [
            {"id": "punta-de-mata", "nombre": "Punta de Mata", "codigo": "EZM-PUN"},
            {"id": "el-tejero", "nombre": "El Tejero", "codigo": "EZM-TEJ"}
        ]
    },
    {
        "id": "libertador",
        "nombre": "Municipio Libertador",
        "capital": "Temblador",
        "parroquias": [
            {"id": "temblador", "nombre": "Temblador", "codigo": "LIB-TEM"},
            {"id": "chaguaramas", "nombre": "Chaguaramas", "codigo": "LIB-CHA"},
            {"id": "las-albinas", "nombre": "Las Albinas", "codigo": "LIB-ALB"},
            {"id": "tabasca", "nombre": "Tabasca", "codigo": "LIB-TAB"}
        ]
    },
    {
        "id": "piar",
        "nombre": "Municipio Piar",
        "capital": "Aragua de Maturín",
        "parroquias": [
            {"id": "aragua", "nombre": "Aragua de Maturín", "codigo": "PIA-ARA"},
            {"id": "aparicio", "nombre": "Aparicio", "codigo": "PIA-APA"},
            {"id": "chaguaramal", "nombre": "Chaguaramal", "codigo": "PIA-CHA"}
        ]
    },
    {
        "id": "punceres",
        "nombre": "Municipio Punceres",
        "capital": "Quiriquire",
        "parroquias": [
            {"id": "quiriquire", "nombre": "Quiriquire", "codigo": "PUN-QUI"},
            {"id": "cachipo", "nombre": "Cachipo", "codigo": "PUN-CAC"}
        ]
    },
    {
        "id": "santa-barbara",
        "nombre": "Municipio Santa Bárbara",
        "capital": "Santa Bárbara",
        "parroquias": [
            {"id": "santa-barbara", "nombre": "Santa Bárbara", "codigo": "SBA-SBA"}
        ]
    },
    {
        "id": "sotillo",
        "nombre": "Municipio Sotillo",
        "capital": "Barrancas del Orinoco",
        "parroquias": [
            {"id": "barrancas", "nombre": "Barrancas", "codigo": "SOT-BAR"},
            {"id": "los-barrancos-de-fajardo", "nombre": "Los Barrancos de Fajardo", "codigo": "SOT-LBF"}
        ]
    },
    {
        "id": "uracoa",
        "nombre": "Municipio Uracoa",
        "capital": "Uracoa",
        "parroquias": [
            {"id": "uracoa", "nombre": "Uracoa", "codigo": "URA-URA"}
        ]
    }
]

# 2. Desglose Oficial de la Sub-Parroquia 6 La Puente (11 Sectores)
SECTORES_LAPUENTE_OFICIAL = [
    {
        "numero": 1,
        "nombre": "Monagzal",
        "subparroquia": "Sub-Parroquia 6 (La Puente)",
        "casas": 450,
        "familias": 455,
        "habitantes": 1550,
        "centroVotacion": "Cruz Hernández Quijada"
    },
    {
        "numero": 2,
        "nombre": "Las Vírgenes",
        "subparroquia": "Sub-Parroquia 6 (La Puente)",
        "casas": 1040,
        "familias": 1087,
        "habitantes": 3053,
        "centroVotacion": "Cruz Hernández Quijada"
    },
    {
        "numero": 3,
        "nombre": "Villa de los Ángeles",
        "subparroquia": "Sub-Parroquia 6 (La Puente)",
        "casas": 446,
        "familias": 443,
        "habitantes": 1254,
        "centroVotacion": "Francisco Verde"
    },
    {
        "numero": 4,
        "nombre": "Canadá",
        "subparroquia": "Sub-Parroquia 6 (La Puente)",
        "casas": 546,
        "familias": 580,
        "habitantes": 1848,
        "centroVotacion": "Francisco Verde"
    },
    {
        "numero": 5,
        "nombre": "Sector II",
        "subparroquia": "Sub-Parroquia 6 (La Puente)",
        "casas": 645,
        "familias": 662,
        "habitantes": 2348,
        "centroVotacion": "Francisco Verde"
    },
    {
        "numero": 6,
        "nombre": "Sector IA",
        "subparroquia": "Sub-Parroquia 6 (La Puente)",
        "casas": 735,
        "familias": 750,
        "habitantes": 2215,
        "centroVotacion": "Apolinar Cantor"
    },
    {
        "numero": 7,
        "nombre": "Sector IB",
        "subparroquia": "Sub-Parroquia 6 (La Puente)",
        "casas": 537,
        "familias": 551,
        "habitantes": 1637,
        "centroVotacion": "Apolinar Cantor"
    },
    {
        "numero": 8,
        "nombre": "Valle Real",
        "subparroquia": "Sub-Parroquia 6 (La Puente)",
        "casas": 455,
        "familias": 465,
        "habitantes": 1621,
        "centroVotacion": "Apolinar Cantor"
    },
    {
        "numero": 9,
        "nombre": "El Samán",
        "subparroquia": "Sub-Parroquia 6 (La Puente)",
        "casas": 400,
        "familias": 412,
        "habitantes": 1485,
        "centroVotacion": "Apolinar Cantor"
    },
    {
        "numero": 10,
        "nombre": "La Lucha",
        "subparroquia": "Sub-Parroquia 6 (La Puente)",
        "casas": 721,
        "familias": 743,
        "habitantes": 2228,
        "centroVotacion": "Cruz Figuera Rondón"
    },
    {
        "numero": 11,
        "nombre": "Las Flores",
        "subparroquia": "Sub-Parroquia 6 (La Puente)",
        "casas": 550,
        "familias": 560,
        "habitantes": 1688,
        "centroVotacion": "Cruz Figuera Rondón"
    }
]

# Definición de herramientas MCP
TOOLS_DEFINITIONS = [
    {
        "name": "consultar_territorio",
        "description": "Busca información geográfica y censal de cualquier municipio (13) o parroquia (44) de Monagas.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Nombre, código o ID del municipio o parroquia (ej: 'maturin', 'alto-de-los-godos', 'caripe', 'MAT-SIM')."
                }
            },
            "required": ["query"]
        }
    },
    {
        "name": "obtener_sectores_lapuente",
        "description": "Devuelve la lista oficial de los 11 sectores de La Puente (Sub-Parroquia 6, Los Godos), sus centros electorales asignados, casas y población.",
        "inputSchema": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "consultar_documentacion_tecnica",
        "description": "Consulta anclada sin alucinaciones de la arquitectura técnica, esquema Firestore, protocolo de buzón ciego y despliegue del proyecto.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "tema": {
                    "type": "string",
                    "description": "Tema a consultar (ej: 'buzon_ciego', 'firestore', 'despacho', 'seguridad', 'sectores', 'militantes', 'git')."
                }
            },
            "required": ["tema"]
        }
    },
    {
        "name": "obtener_enlace_despacho",
        "description": "Genera el enlace directo y credenciales de acceso para el formulario de carga móvil (/carga/) de cualquiera de las 44 parroquias.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "parroquia_id": {
                    "type": "string",
                    "description": "ID de la parroquia (ej: 'alto-de-los-godos', 'san-simon', 'boqueron', 'caripe')."
                }
            },
            "required": ["parroquia_id"]
        }
    },
    {
        "name": "generar_resumen_sala_situacional",
        "description": "Genera un balance consolidado para la Dirección General y el Gobernador con estadísticas territoriales y de movilización.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "municipio_id": {
                    "type": "string",
                    "description": "ID del municipio (default: 'maturin')."
                }
            }
        }
    },
    {
        "name": "consultar_perplexity",
        "description": "Búsqueda web viva con Perplexity AI para verificar centros de votación, instituciones, noticias y datos de Monagas con fuentes citadas.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Pregunta o consulta de búsqueda en vivo."
                }
            },
            "required": ["query"]
        }
    }
]

RESOURCES_DEFINITIONS = [
    {
        "uri": "monagas://catalogo-territorial",
        "name": "Catálogo Territorial Oficial Monagas",
        "description": "Estructura completa de 13 Municipios y 44 Parroquias",
        "mimeType": "application/json"
    },
    {
        "uri": "monagas://sectores-lapuente",
        "name": "Sectores Oficiales de La Puente",
        "description": "11 sectores de La Puente, centros electorales y censos sectoriales",
        "mimeType": "application/json"
    },
    {
        "uri": "monagas://documentacion-tecnica",
        "name": "Documentación Técnica del Sistema",
        "description": "Manual técnico de ingeniería, persistencia y seguridad",
        "mimeType": "text/markdown"
    }
]

# Implementación de las funciones de herramientas
def tool_consultar_territorio(query: str):
    q = query.strip().lower()
    coincidencias = []
    for mun in CATALOGO_MUNICIPIOS:
        if q in mun["id"] or q in mun["nombre"].lower() or q in mun["capital"].lower():
            coincidencias.append({"tipo": "Municipio", "datos": mun})
            continue
        for p in mun.get("parroquias", []):
            if q in p["id"] or q in p["nombre"].lower() or q in p.get("codigo", "").lower():
                coincidencias.append({
                    "tipo": "Parroquia",
                    "municipio": mun["nombre"],
                    "municipio_id": mun["id"],
                    "datos": p
                })
    
    if not coincidencias:
        return f"No se encontraron coincidencias para '{query}' en los 13 municipios y 44 parroquias de Monagas."
    
    return json.dumps(coincidencias, indent=2, ensure_ascii=False)

def tool_obtener_sectores_lapuente():
    total_casas = sum(s["casas"] for s in SECTORES_LAPUENTE_OFICIAL)
    total_hab = sum(s["habitantes"] for s in SECTORES_LAPUENTE_OFICIAL)
    
    centros_asignados = {}
    for s in SECTORES_LAPUENTE_OFICIAL:
        cv = s["centroVotacion"]
        centros_asignados.setdefault(cv, []).append(s["nombre"])

    resultado = {
        "subparroquia": "Sub-Parroquia 6 La Puente (Parroquia Alto de Los Godos, Maturín)",
        "totales": {
            "sectores": len(SECTORES_LAPUENTE_OFICIAL),
            "casas": total_casas,
            "habitantes": total_hab
        },
        "centros_electorales": centros_asignados,
        "sectores": SECTORES_LAPUENTE_OFICIAL
    }
    return json.dumps(resultado, indent=2, ensure_ascii=False)

def tool_consultar_documentacion_tecnica(tema: str):
    doc_path = PROJECT_ROOT / "DOCUMENTACION_TECNICA.md"
    if not doc_path.exists():
        return "El archivo DOCUMENTACION_TECNICA.md no fue encontrado."
    
    texto = doc_path.read_text(encoding="utf-8")
    t = tema.lower().strip()
    
    # Búsqueda temática por secciones
    secciones = re.split(r'\n(?=##\s+)', texto)
    relevantes = []
    
    for sec in secciones:
        if t in sec.lower():
            relevantes.append(sec.strip())
            
    if relevantes:
        return "\n\n---\n\n".join(relevantes)
    
    # Si no hubo match por encabezado, devolver resumen general
    return f"No se encontró una sección explícita para '{tema}'. El documento contiene:\n- 1. Introducción y Principios de Diseño\n- 2. Arquitectura del Sistema\n- 3. Módulos de la Plataforma\n- 4. Esquema de Datos Firestore\n- 5. Catálogo Territorial Oficial\n- 6. Guía de Despliegue Git\n- 7. Especificación Servidor MCP"

def tool_obtener_enlace_despacho(parroquia_id: str):
    pid = parroquia_id.strip().lower()
    parroquia_encontrada = None
    mun_encontrado = None
    
    for mun in CATALOGO_MUNICIPIOS:
        for p in mun.get("parroquias", []):
            if p["id"] == pid or pid in p["nombre"].lower():
                parroquia_encontrada = p
                mun_encontrado = mun
                break
        if parroquia_encontrada:
            break
            
    if not parroquia_encontrada:
        return f"No se encontró la parroquia con ID o nombre '{parroquia_id}'."
    
    base_url = "https://diegodona36-netizen.github.io/migato-maturin"
    link_carga = f"{base_url}/carga/?p={parroquia_encontrada['id']}"
    link_earth = f"{base_url}/earth-monagas/?p={parroquia_encontrada['id']}"
    
    res = {
        "parroquia": parroquia_encontrada["nombre"],
        "id": parroquia_encontrada["id"],
        "codigo": parroquia_encontrada.get("codigo", "N/A"),
        "municipio": mun_encontrado["nombre"],
        "clave_oficial": "admin",
        "url_buzon_carga": link_carga,
        "url_visor_earth": link_earth,
        "mensaje_whatsapp": (
            f"Saludos estimado/a Enlace de {parroquia_encontrada['nombre']} ({mun_encontrado['nombre']}).\n\n"
            f"Se le asigna acceso formal al Buzón Territorial Móvil:\n"
            f"🔗 Enlace: {link_carga}\n"
            f"🔑 Clave: admin\n\n"
            f"Por favor proceda con el reporte numérico semanal (Casas, Habitantes, Votantes, Militantes)."
        )
    }
    return json.dumps(res, indent=2, ensure_ascii=False)

def tool_generar_resumen_sala_situacional(municipio_id: str = "maturin"):
    mid = (municipio_id or "maturin").strip().lower()
    mun = next((m for m in CATALOGO_MUNICIPIOS if m["id"] == mid), None)
    
    if not mun:
        return f"Municipio '{municipio_id}' no encontrado."
    
    parroquias_lista = [p["nombre"] for p in mun.get("parroquias", [])]
    res = {
        "sala_situacional": "Dirección General de Operaciones y Campaña Monagas",
        "municipio": mun["nombre"],
        "capital": mun["capital"],
        "parroquias_activas": len(parroquias_lista),
        "listado_parroquias": parroquias_lista,
        "metas_electorales": {
            "electores_cne": mun.get("electores", "Por consolidar"),
            "centros_electorales": mun.get("centros", "Por consolidar"),
            "mesas_electorales": mun.get("mesas", "Por consolidar")
        },
        "protocolo_carga": "Buzón Ciego Semanal (Colección: territorios_monagas)",
        "estado_servidor": "Operacional 100% en GitHub Pages"
    }
    return json.dumps(res, indent=2, ensure_ascii=False)

# Despachador de llamadas MCP
def handle_json_rpc(req):
    method = req.get("method")
    req_id = req.get("id")
    params = req.get("params", {})

    if method == "initialize":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": {},
                    "resources": {}
                },
                "serverInfo": {
                    "name": "monagas-intelligence-mcp",
                    "version": "1.0.0"
                }
            }
        }

    elif method == "notifications/initialized":
        return None

    elif method == "ping":
        return {"jsonrpc": "2.0", "id": req_id, "result": {}}

    elif method == "tools/list":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "tools": TOOLS_DEFINITIONS
            }
        }

    elif method == "tools/call":
        tool_name = params.get("name")
        args = params.get("arguments", {})

        try:
            if tool_name == "consultar_territorio":
                txt = tool_consultar_territorio(args.get("query", ""))
            elif tool_name == "obtener_sectores_lapuente":
                txt = tool_obtener_sectores_lapuente()
            elif tool_name == "consultar_documentacion_tecnica":
                txt = tool_consultar_documentacion_tecnica(args.get("tema", ""))
            elif tool_name == "obtener_enlace_despacho":
                txt = tool_obtener_enlace_despacho(args.get("parroquia_id", ""))
            elif tool_name == "generar_resumen_sala_situacional":
                txt = tool_generar_resumen_sala_situacional(args.get("municipio_id", "maturin"))
            elif tool_name == "consultar_perplexity":
                from scripts.perplexity_client import consultar_perplexity
                txt = consultar_perplexity(args.get("query", ""))
            else:
                return {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "error": {
                        "code": -32601,
                        "message": f"Herramienta desconocida: {tool_name}"
                    }
                }
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "content": [
                        {
                            "type": "text",
                            "text": txt
                        }
                    ]
                }
            }
        except Exception as e:
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "isError": True,
                    "content": [
                        {
                            "type": "text",
                            "text": f"Error ejecutando {tool_name}: {str(e)}"
                        }
                    ]
                }
            }

    elif method == "resources/list":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "resources": RESOURCES_DEFINITIONS
            }
        }

    elif method == "resources/read":
        uri = params.get("uri", "")
        if uri == "monagas://catalogo-territorial":
            txt = json.dumps(CATALOGO_MUNICIPIOS, indent=2, ensure_ascii=False)
            mime = "application/json"
        elif uri == "monagas://sectores-lapuente":
            txt = json.dumps(SECTORES_LAPUENTE_OFICIAL, indent=2, ensure_ascii=False)
            mime = "application/json"
        elif uri == "monagas://documentacion-tecnica":
            doc_path = PROJECT_ROOT / "DOCUMENTACION_TECNICA.md"
            txt = doc_path.read_text(encoding="utf-8") if doc_path.exists() else ""
            mime = "text/markdown"
        else:
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "error": {
                    "code": -32602,
                    "message": f"Recurso no encontrado: {uri}"
                }
            }
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "contents": [
                    {
                        "uri": uri,
                        "mimeType": mime,
                        "text": txt
                    }
                ]
            }
        }

    else:
        if req_id is not None:
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "error": {
                    "code": -32601,
                    "message": f"Método no soportado: {method}"
                }
            }
        return None

def main():
    """Bucle principal de procesamiento stdio para MCP."""
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
            resp = handle_json_rpc(req)
            if resp is not None:
                sys.stdout.write(json.dumps(resp, ensure_ascii=False) + "\n")
                sys.stdout.flush()
        except Exception as e:
            err_resp = {
                "jsonrpc": "2.0",
                "id": None,
                "error": {
                    "code": -32700,
                    "message": f"Error de sintaxis JSON: {str(e)}"
                }
            }
            sys.stdout.write(json.dumps(err_resp) + "\n")
            sys.stdout.flush()

if __name__ == "__main__":
    main()
