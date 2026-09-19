#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Servidor MCP Oficial: Obsidian Vault & Knowledge Graph (Word Tree)
Protocolo: Model Context Protocol (MCP) JSON-RPC 2.0 sobre stdio
Cero dependencias externas requeridas (Python 3 standard library).
Permite crear, leer, buscar, enlazar y mapear notas en bóvedas de Obsidian.
"""

import sys
import json
import os
import re
from pathlib import Path
from datetime import datetime

# Directorio base del proyecto y bóveda de Obsidian
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_VAULT = PROJECT_ROOT / "vault"
VAULT_DIR = Path(os.environ.get("OBSIDIAN_VAULT_DIR", str(DEFAULT_VAULT))).resolve()

def ensure_vault():
    """Garantiza que la bóveda y sus carpetas base existan."""
    VAULT_DIR.mkdir(parents=True, exist_ok=True)
    obsidian_conf = VAULT_DIR / ".obsidian"
    obsidian_conf.mkdir(parents=True, exist_ok=True)
    
    app_json = obsidian_conf / "app.json"
    if not app_json.exists():
        app_json.write_text(json.dumps({
            "useMarkdownLinks": False,
            "attachmentFolderPath": "00-Adjuntos",
            "livePreview": True
        }, indent=2), encoding="utf-8")

    # Carpetas estructuradas base
    subdirs = [
        "00-Indice",
        "01-Proyectos",
        "02-Modulos",
        "03-Infraestructura-y-Redes",
        "04-Comandos-y-Directivas",
        "05-Territorio-Monagas",
        "06-Actas-y-Reuniones"
    ]
    for s in subdirs:
        (VAULT_DIR / s).mkdir(parents=True, exist_ok=True)

# -------------------------------------------------------------
# FUNCIONES DE HERRAMIENTAS OBSIDIAN
# -------------------------------------------------------------

def parse_frontmatter(content):
    """Extrae metadatos YAML frontmatter de un archivo markdown."""
    frontmatter = {}
    body = content
    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            raw_yaml = parts[1].strip()
            body = parts[2].strip()
            for line in raw_yaml.split("\n"):
                if ":" in line:
                    k, v = line.split(":", 1)
                    k = k.strip()
                    v = v.strip()
                    if v.startswith("[") and v.endswith("]"):
                        v = [item.strip().strip("'\"") for item in v[1:-1].split(",") if item.strip()]
                    frontmatter[k] = v
    return frontmatter, body

def extract_wikilinks(content):
    """Extrae todos los enlaces tipo [[Nota]] o [[Nota|Alias]]."""
    matches = re.findall(r"\[\[([^\]\|]+)(?:\|[^\]]+)?\]\]", content)
    return list(set(m.strip() for m in matches if m.strip()))

def extract_tags(content):
    """Extrae tags #etiqueta del texto."""
    matches = re.findall(r"(?:^|\s)#([a-zA-Z0-9_\-\/]+)", content)
    return list(set(matches))

def resolve_note_path(path_or_title):
    """Resuelve la ruta absoluta de una nota dentro de la bóveda."""
    p = Path(path_or_title)
    if not p.suffix:
        p = p.with_suffix(".md")
    
    # 1. Ruta directa relativa a la bóveda
    direct = (VAULT_DIR / p).resolve()
    if direct.exists() and direct.is_file():
        return direct
    
    # 2. Buscar por nombre de archivo en cualquier subcarpeta
    target_name = p.name.lower()
    for f in VAULT_DIR.rglob("*.md"):
        if f.name.lower() == target_name:
            return f
    
    # 3. Si no existe, devolver la ruta directa propuesta
    return direct

def tool_create_note(title, content, folder="", tags=None, links=None, frontmatter_extra=None):
    """Crea una nueva nota estructurada con wikilinks y metadatos."""
    ensure_vault()
    if not title:
        raise ValueError("El título de la nota es obligatorio.")
    
    clean_title = re.sub(r'[\\/*?:"<>|]', "", title).strip()
    target_dir = VAULT_DIR / folder if folder else VAULT_DIR
    target_dir.mkdir(parents=True, exist_ok=True)
    file_path = target_dir / f"{clean_title}.md"

    tags = tags or []
    links = links or []
    frontmatter_extra = frontmatter_extra or {}

    now_iso = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Construcción de frontmatter
    fm_lines = ["---"]
    fm_lines.append(f'title: "{clean_title}"')
    fm_lines.append(f'created: "{now_iso}"')
    fm_lines.append(f'updated: "{now_iso}"')
    if tags:
        fm_lines.append(f"tags: [{', '.join(tags)}]")
    for k, v in frontmatter_extra.items():
        fm_lines.append(f"{k}: {json.dumps(v, ensure_ascii=False)}")
    fm_lines.append("---\n")

    full_text = "\n".join(fm_lines)
    full_text += f"# {clean_title}\n\n"
    full_text += content.strip() + "\n"

    # Enlaces sugeridos al pie si se suministraron
    if links:
        full_text += "\n\n## Conexiones Relacionadas\n"
        for l in links:
            clean_l = l.strip("[]")
            full_text += f"- [[{clean_l}]]\n"

    file_path.write_text(full_text, encoding="utf-8")
    rel_path = file_path.relative_to(VAULT_DIR)
    return f"Nota creada exitosamente: [[{clean_title}]]\nRuta en bóveda: {rel_path}\nTamaño: {len(full_text)} caracteres."

def tool_read_note(path_or_title):
    """Lee el contenido íntegro de una nota, sus metadatos y conexiones."""
    ensure_vault()
    file_path = resolve_note_path(path_or_title)
    if not file_path.exists():
        return f"Error: La nota '{path_or_title}' no existe en la bóveda ({VAULT_DIR})."
    
    text = file_path.read_text(encoding="utf-8")
    fm, body = parse_frontmatter(text)
    links = extract_wikilinks(text)
    tags = extract_tags(text)
    
    rel_path = file_path.relative_to(VAULT_DIR)
    
    info = {
        "ruta": str(rel_path),
        "titulo": fm.get("title", file_path.stem),
        "metadatos": fm,
        "enlaces_salientes": links,
        "tags": tags,
        "contenido": text
    }
    return json.dumps(info, indent=2, ensure_ascii=False)

def tool_append_note(path_or_title, content, heading=None):
    """Agrega contenido al final de una nota existente."""
    ensure_vault()
    file_path = resolve_note_path(path_or_title)
    if not file_path.exists():
        return f"Error: La nota '{path_or_title}' no existe."
    
    current = file_path.read_text(encoding="utf-8")
    now_stamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    append_block = "\n\n"
    if heading:
        append_block += f"### {heading} ({now_stamp})\n\n"
    else:
        append_block += f"> [!NOTE] Actualización • {now_stamp}\n"
    
    append_block += content.strip() + "\n"
    new_full = current.rstrip() + append_block
    file_path.write_text(new_full, encoding="utf-8")
    
    return f"Contenido agregado exitosamente a [[{file_path.stem}]]."

def tool_update_note(path_or_title, content):
    """Sobrescribe el contenido de una nota existente."""
    ensure_vault()
    file_path = resolve_note_path(path_or_title)
    if not file_path.exists():
        return f"Error: La nota '{path_or_title}' no existe."
    
    file_path.write_text(content, encoding="utf-8")
    return f"Nota [[{file_path.stem}]] actualizada exitosamente."

def tool_list_notes(folder="", tag=""):
    """Lista las notas existentes con filtrado por carpeta o tag."""
    ensure_vault()
    base = (VAULT_DIR / folder) if folder else VAULT_DIR
    if not base.exists():
        return f"La carpeta '{folder}' no existe."
    
    notes = []
    for f in base.rglob("*.md"):
        if f.name.startswith("."):
            continue
        txt = f.read_text(encoding="utf-8", errors="ignore")
        fm, _ = parse_frontmatter(txt)
        tags = extract_tags(txt)
        if "tags" in fm and isinstance(fm["tags"], list):
            tags.extend(fm["tags"])
        tags = list(set(tags))
        
        if tag and (tag.lower() not in [t.lower().lstrip("#") for t in tags]):
            continue
            
        rel = f.relative_to(VAULT_DIR)
        notes.append({
            "titulo": f.stem,
            "ruta": str(rel),
            "tamano_bytes": f.stat().st_size,
            "modificado": datetime.fromtimestamp(f.stat().st_mtime).strftime("%Y-%m-%d %H:%M"),
            "tags": tags
        })
    
    notes.sort(key=lambda x: x["modificado"], reverse=True)
    return json.dumps({"total": len(notes), "boveda": str(VAULT_DIR), "notas": notes}, indent=2, ensure_ascii=False)

def tool_search_notes(query):
    """Búsqueda de texto completo y tags en toda la bóveda."""
    ensure_vault()
    q_lower = query.lower()
    results = []
    
    for f in VAULT_DIR.rglob("*.md"):
        if f.name.startswith("."):
            continue
        txt = f.read_text(encoding="utf-8", errors="ignore")
        if q_lower in txt.lower() or q_lower in f.stem.lower():
            lines = txt.split("\n")
            snippets = []
            for idx, line in enumerate(lines):
                if q_lower in line.lower():
                    snippets.append(f"L{idx+1}: {line.strip()[:140]}")
                    if len(snippets) >= 3:
                        break
            results.append({
                "titulo": f.stem,
                "ruta": str(f.relative_to(VAULT_DIR)),
                "coincidencias": snippets
            })
    
    return json.dumps({"query": query, "total_encontradas": len(results), "resultados": results}, indent=2, ensure_ascii=False)

def tool_get_backlinks(note_title):
    """Encuentra todas las notas que enlazan a la nota especificada."""
    ensure_vault()
    target_clean = note_title.strip("[]").lower()
    backlinks = []
    
    for f in VAULT_DIR.rglob("*.md"):
        if f.stem.lower() == target_clean:
            continue
        txt = f.read_text(encoding="utf-8", errors="ignore")
        links = extract_wikilinks(txt)
        if any(l.lower() == target_clean for l in links):
            backlinks.append({
                "nota": f.stem,
                "ruta": str(f.relative_to(VAULT_DIR))
            })
            
    return json.dumps({
        "nota_objetivo": note_title,
        "total_backlinks": len(backlinks),
        "notas_que_la_enlazan": backlinks
    }, indent=2, ensure_ascii=False)

def tool_get_vault_tree():
    """Genera el árbol jerárquico de carpetas y archivos de la bóveda."""
    ensure_vault()
    tree = {}
    
    for root, dirs, files in os.walk(VAULT_DIR):
        dirs[:] = [d for d in dirs if not d.startswith(".")]
        rel_root = Path(root).relative_to(VAULT_DIR)
        parts = rel_root.parts
        
        curr = tree
        for part in parts:
            curr = curr.setdefault(part, {})
            
        curr_files = [f for f in files if f.endswith(".md") and not f.startswith(".")]
        if curr_files:
            curr["_archivos"] = sorted(curr_files)
            
    return json.dumps({"boveda": str(VAULT_DIR), "arbol_directorios": tree}, indent=2, ensure_ascii=False)

def tool_get_word_tree(root_concept=""):
    """
    Genera el Word Tree / Red de Conocimiento y Grafo Semántico de Obsidian.
    Mapea todos los nodos (notas), aristas (wikilinks [[...]]), etiquetas (#tag)
    y métricas de centralidad para que la IA entienda el contexto global.
    """
    ensure_vault()
    nodes = {}
    edges = []
    
    all_files = [f for f in VAULT_DIR.rglob("*.md") if not f.name.startswith(".")]
    
    for f in all_files:
        stem = f.stem
        txt = f.read_text(encoding="utf-8", errors="ignore")
        fm, _ = parse_frontmatter(txt)
        links = extract_wikilinks(txt)
        tags = extract_tags(txt)
        rel_folder = str(f.relative_to(VAULT_DIR).parent)
        
        nodes[stem] = {
            "id": stem,
            "carpeta": rel_folder if rel_folder != "." else "Raíz",
            "enlaces_salientes": len(links),
            "enlaces_entrantes": 0,
            "tags": tags,
            "tamano": len(txt)
        }
        
        for target in links:
            edges.append({
                "origen": stem,
                "destino": target
            })
            
    # Calcular enlaces entrantes
    for edge in edges:
        dest = edge["destino"]
        if dest in nodes:
            nodes[dest]["enlaces_entrantes"] += 1
        else:
            nodes[dest] = {
                "id": dest,
                "carpeta": "Pendiente / Sin Crear",
                "enlaces_salientes": 0,
                "enlaces_entrantes": 1,
                "tags": [],
                "tamano": 0,
                "fantasma": True
            }
            
    # Filtrar por concepto raíz si se especifica
    if root_concept:
        clean_root = root_concept.strip("[]").lower()
        matched_roots = [nid for nid in nodes if clean_root in nid.lower()]
        if matched_roots:
            first_root = matched_roots[0]
            nivel1 = set([first_root])
            for e in edges:
                if e["origen"] == first_root:
                    nivel1.add(e["destino"])
                elif e["destino"] == first_root:
                    nivel1.add(e["origen"])
            filtered_nodes = {k: v for k, v in nodes.items() if k in nivel1}
            filtered_edges = [e for e in edges if e["origen"] in nivel1 and e["destino"] in nivel1]
            return json.dumps({
                "concepto_raiz": first_root,
                "tipo": "Word Tree Focalizado",
                "total_nodos": len(filtered_nodes),
                "total_conexiones": len(filtered_edges),
                "nodos": filtered_nodes,
                "conexiones": filtered_edges
            }, indent=2, ensure_ascii=False)
            
    # Nodos más conectados
    nodos_destacados = sorted(
        nodes.values(), 
        key=lambda x: x["enlaces_entrantes"] + x["enlaces_salientes"], 
        reverse=True
    )[:15]

    return json.dumps({
        "tipo": "Word Tree Global (Grafo de Conocimiento Obsidian)",
        "boveda": str(VAULT_DIR),
        "total_notas": len(nodes),
        "total_conexiones_wikilinks": len(edges),
        "nodos_clave_mas_conectados": nodos_destacados,
        "nodos": nodes,
        "conexiones": edges
    }, indent=2, ensure_ascii=False)

# -------------------------------------------------------------
# DEFINICIÓN DE HERRAMIENTAS MCP
# -------------------------------------------------------------

TOOLS_DEFINITIONS = [
    {
        "name": "obsidian_create_note",
        "description": "Crea una nueva nota en la bóveda de Obsidian con metadatos frontmatter, tags y wikilinks [[...]].",
        "inputSchema": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "Título de la nota (ej: 'Presupuesto Sala Situacional')"},
                "content": {"type": "string", "description": "Cuerpo de la nota en formato Markdown"},
                "folder": {"type": "string", "description": "Carpeta destino (ej: '01-Proyectos', '03-Infraestructura-y-Redes')"},
                "tags": {"type": "array", "items": {"type": "string"}, "description": "Lista de etiquetas (ej: ['migato', 'servidor', 'raid1'])"},
                "links": {"type": "array", "items": {"type": "string"}, "description": "Notas vinculadas a conectar como wikilinks [[...]]"}
            },
            "required": ["title", "content"]
        }
    },
    {
        "name": "obsidian_read_note",
        "description": "Lee el contenido íntegro de una nota en Obsidian, sus metadatos frontmatter y enlaces salientes.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "path_or_title": {"type": "string", "description": "Título o ruta relativa de la nota a leer"}
            },
            "required": ["path_or_title"]
        }
    },
    {
        "name": "obsidian_append_note",
        "description": "Agrega contenido o una bitácora al final de una nota existente en Obsidian sin borrar lo anterior.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "path_or_title": {"type": "string", "description": "Título o ruta de la nota"},
                "content": {"type": "string", "description": "Texto markdown a anexar"},
                "heading": {"type": "string", "description": "Subtítulo de la sección anexa (opcional)"}
            },
            "required": ["path_or_title", "content"]
        }
    },
    {
        "name": "obsidian_update_note",
        "description": "Sobrescribe completamente el contenido de una nota existente en Obsidian.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "path_or_title": {"type": "string", "description": "Título o ruta de la nota a sobrescribir"},
                "content": {"type": "string", "description": "Nuevo contenido completo en Markdown"}
            },
            "required": ["path_or_title", "content"]
        }
    },
    {
        "name": "obsidian_list_notes",
        "description": "Lista todas las notas de la bóveda de Obsidian, permitiendo filtrar por carpeta o etiqueta.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "folder": {"type": "string", "description": "Filtrar por subcarpeta específica"},
                "tag": {"type": "string", "description": "Filtrar por etiqueta (ej: 'hardware')"}
            }
        }
    },
    {
        "name": "obsidian_search_notes",
        "description": "Busca texto o palabras clave en todas las notas de la bóveda de Obsidian.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Término o frase a buscar dentro de las notas"}
            },
            "required": ["query"]
        }
    },
    {
        "name": "obsidian_get_backlinks",
        "description": "Encuentra todas las notas que contienen un enlace bidireccional [[Nota]] hacia la nota consultada.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "note_title": {"type": "string", "description": "Título de la nota para buscar referencias entrantes"}
            },
            "required": ["note_title"]
        }
    },
    {
        "name": "obsidian_get_vault_tree",
        "description": "Retorna la estructura jerárquica de carpetas y notas de la bóveda de Obsidian.",
        "inputSchema": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "obsidian_get_word_tree",
        "description": "Genera el Word Tree y Grafo de Conocimiento de Obsidian (nodos, wikilinks, conexiones y clusters semánticos) para dar máximo contexto a la IA.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "root_concept": {"type": "string", "description": "Concepto o nota central para enfocar el árbol (opcional, ej: 'MIGATO 2026')"}
            }
        }
    }
]

# -------------------------------------------------------------
# PROTOCOLO MCP JSON-RPC 2.0
# -------------------------------------------------------------

def handle_json_rpc(req):
    method = req.get("method")
    req_id = req.get("id")
    params = req.get("params", {})

    if method == "initialize":
        ensure_vault()
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
                    "name": "obsidian-vault-mcp",
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
            if tool_name == "obsidian_create_note":
                txt = tool_create_note(
                    title=args.get("title", ""),
                    content=args.get("content", ""),
                    folder=args.get("folder", ""),
                    tags=args.get("tags"),
                    links=args.get("links")
                )
            elif tool_name == "obsidian_read_note":
                txt = tool_read_note(args.get("path_or_title", ""))
            elif tool_name == "obsidian_append_note":
                txt = tool_append_note(
                    path_or_title=args.get("path_or_title", ""),
                    content=args.get("content", ""),
                    heading=args.get("heading")
                )
            elif tool_name == "obsidian_update_note":
                txt = tool_update_note(
                    path_or_title=args.get("path_or_title", ""),
                    content=args.get("content", "")
                )
            elif tool_name == "obsidian_list_notes":
                txt = tool_list_notes(
                    folder=args.get("folder", ""),
                    tag=args.get("tag", "")
                )
            elif tool_name == "obsidian_search_notes":
                txt = tool_search_notes(args.get("query", ""))
            elif tool_name == "obsidian_get_backlinks":
                txt = tool_get_backlinks(args.get("note_title", ""))
            elif tool_name == "obsidian_get_vault_tree":
                txt = tool_get_vault_tree()
            elif tool_name == "obsidian_get_word_tree":
                txt = tool_get_word_tree(args.get("root_concept", ""))
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
                    "content": [{"type": "text", "text": txt}]
                }
            }
        except Exception as e:
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "isError": True,
                    "content": [{"type": "text", "text": f"Error en {tool_name}: {str(e)}"}]
                }
            }

    elif method == "resources/list":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "resources": [
                    {
                        "uri": "obsidian://vault-tree",
                        "name": "Árbol Estructural de la Bóveda",
                        "mimeType": "application/json",
                        "description": "Estructura completa de carpetas y archivos de la bóveda Obsidian."
                    },
                    {
                        "uri": "obsidian://word-tree",
                        "name": "Word Tree & Grafo de Conocimiento",
                        "mimeType": "application/json",
                        "description": "Grafo semántico completo de notas y wikilinks interconectados."
                    }
                ]
            }
        }

    elif method == "resources/read":
        uri = params.get("uri", "")
        if uri == "obsidian://vault-tree":
            txt = tool_get_vault_tree()
            mime = "application/json"
        elif uri == "obsidian://word-tree":
            txt = tool_get_word_tree()
            mime = "application/json"
        else:
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "error": {"code": -32602, "message": f"Recurso no encontrado: {uri}"}
            }
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "contents": [{"uri": uri, "mimeType": mime, "text": txt}]
            }
        }

    else:
        if req_id is not None:
            return {"jsonrpc": "2.0", "id": req_id, "error": {"code": -32601, "message": f"Método no soportado: {method}"}}
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
                "error": {"code": -32700, "message": f"Error JSON-RPC: {str(e)}"}
            }
            sys.stdout.write(json.dumps(err_resp) + "\n")
            sys.stdout.flush()

if __name__ == "__main__":
    main()
