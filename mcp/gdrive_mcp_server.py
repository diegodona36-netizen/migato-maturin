#!/usr/bin/env python3
"""
Servidor MCP Oficial para Google Drive (MIGATO / Monagas 2026)
Protocolo: Model Context Protocol (MCP) JSON-RPC 2.0 sobre stdio
Conexión directa a Google Drive API v3.
"""

import sys
import json
import os
import time
import mimetypes
from pathlib import Path
import requests

PROJECT_ROOT = Path(__file__).resolve().parent.parent
MCP_DIR = Path(__file__).resolve().parent
TOKEN_FILE = MCP_DIR / "token.json"
CREDENTIALS_FILE = MCP_DIR / "credentials.json"

DRIVE_API_BASE = "https://www.googleapis.com/drive/v3"
DRIVE_UPLOAD_BASE = "https://www.googleapis.com/upload/drive/v3"
OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token"

def log_err(msg: str):
    sys.stderr.write(f"[gdrive-mcp] {msg}\n")
    sys.stderr.flush()

def get_auth_token():
    """Lee el token y lo refresca automáticamente si está vencido."""
    if not TOKEN_FILE.exists():
        return None, "No se encontró el archivo de autenticación 'token.json'. Ejecuta 'python3 mcp/setup_gdrive_auth.py' para autenticar tu cuenta de Google."

    try:
        data = json.loads(TOKEN_FILE.read_text(encoding="utf-8"))
    except Exception as e:
        return None, f"Error leyendo token.json: {e}"

    access_token = data.get("access_token")
    refresh_token = data.get("refresh_token")
    expires_at = data.get("expires_at", 0)
    client_id = data.get("client_id")
    client_secret = data.get("client_secret")

    # Si expira en menos de 60 segundos y tenemos refresh_token, renovamos
    if time.time() > (expires_at - 60):
        if not refresh_token:
            return None, "El token de acceso expiró y no hay refresh_token. Reautentica con 'python3 mcp/setup_gdrive_auth.py'."
        
        try:
            resp = requests.post(
                OAUTH_TOKEN_URL,
                data={
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "refresh_token": refresh_token,
                    "grant_type": "refresh_token"
                },
                timeout=15
            )
            if resp.status_code != 200:
                return None, f"Error refrescando token: {resp.text}"
            
            token_resp = resp.json()
            access_token = token_resp["access_token"]
            expires_in = token_resp.get("expires_in", 3600)
            data["access_token"] = access_token
            data["expires_at"] = time.time() + expires_in
            if "refresh_token" in token_resp:
                data["refresh_token"] = token_resp["refresh_token"]
                
            TOKEN_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")
        except Exception as e:
            return None, f"Excepción al renovar token: {e}"

    return access_token, None

def get_headers(token: str):
    return {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json"
    }

# --- HERRAMIENTAS GOOGLE DRIVE ---

def tool_gdrive_status():
    token, err = get_auth_token()
    if err:
        return json.dumps({
            "status": "unauthenticated",
            "message": err,
            "instrucciones": "Para conectar Google Drive, ejecuta en la terminal: python3 mcp/setup_gdrive_auth.py"
        }, indent=2, ensure_ascii=False)

    try:
        r = requests.get(
            f"{DRIVE_API_BASE}/about?fields=user,storageQuota",
            headers=get_headers(token),
            timeout=10
        )
        if r.status_code != 200:
            return json.dumps({"status": "error", "code": r.status_code, "response": r.text}, indent=2)
        
        info = r.json()
        user = info.get("user", {})
        quota = info.get("storageQuota", {})
        
        limit_bytes = int(quota.get("limit", 0))
        usage_bytes = int(quota.get("usage", 0))
        limit_gb = round(limit_bytes / (1024**3), 2) if limit_bytes else "Ilimitado"
        usage_gb = round(usage_bytes / (1024**3), 2)

        return json.dumps({
            "status": "connected",
            "usuario": user.get("displayName", "N/A"),
            "email": user.get("emailAddress", "N/A"),
            "almacenamiento": f"{usage_gb} GB usados de {limit_gb} GB",
            "servidor_mcp": "Google Drive MCP Activo"
        }, indent=2, ensure_ascii=False)
    except Exception as e:
        return json.dumps({"status": "error", "error": str(e)}, indent=2)

def tool_gdrive_list_files(folder_id: str = None, query: str = None, page_size: int = 25):
    token, err = get_auth_token()
    if err:
        return err

    q_parts = ["trashed = false"]
    if folder_id:
        q_parts.append(f"'{folder_id}' in parents")
    if query:
        q_parts.append(query)

    q = " and ".join(q_parts)
    params = {
        "q": q,
        "pageSize": min(max(1, page_size), 100),
        "fields": "files(id, name, mimeType, size, modifiedTime, webViewLink, parents)",
        "orderBy": "folder,modifiedTime desc"
    }

    try:
        r = requests.get(f"{DRIVE_API_BASE}/files", headers=get_headers(token), params=params, timeout=15)
        if r.status_code != 200:
            return f"Error ({r.status_code}): {r.text}"
        
        files = r.json().get("files", [])
        return json.dumps({
            "total_encontrados": len(files),
            "archivos": files
        }, indent=2, ensure_ascii=False)
    except Exception as e:
        return f"Error en list_files: {str(e)}"

def tool_gdrive_search(name_contains: str, mime_type: str = None):
    token, err = get_auth_token()
    if err:
        return err

    q_parts = [f"name contains '{name_contains}'", "trashed = false"]
    
    if mime_type:
        mime_map = {
            "folder": "application/vnd.google-apps.folder",
            "doc": "application/vnd.google-apps.document",
            "sheet": "application/vnd.google-apps.spreadsheet",
            "pdf": "application/pdf"
        }
        actual_mime = mime_map.get(mime_type.lower(), mime_type)
        q_parts.append(f"mimeType = '{actual_mime}'")

    q = " and ".join(q_parts)
    params = {
        "q": q,
        "pageSize": 30,
        "fields": "files(id, name, mimeType, size, modifiedTime, webViewLink)",
        "orderBy": "modifiedTime desc"
    }

    try:
        r = requests.get(f"{DRIVE_API_BASE}/files", headers=get_headers(token), params=params, timeout=15)
        if r.status_code != 200:
            return f"Error ({r.status_code}): {r.text}"
        
        files = r.json().get("files", [])
        return json.dumps({"resultados": files}, indent=2, ensure_ascii=False)
    except Exception as e:
        return f"Error en search: {str(e)}"

def tool_gdrive_create_folder(folder_name: str, parent_folder_id: str = None):
    token, err = get_auth_token()
    if err:
        return err

    metadata = {
        "name": folder_name,
        "mimeType": "application/vnd.google-apps.folder"
    }
    if parent_folder_id:
        metadata["parents"] = [parent_folder_id]

    try:
        r = requests.post(
            f"{DRIVE_API_BASE}/files?fields=id,name,webViewLink",
            headers={**get_headers(token), "Content-Type": "application/json"},
            json=metadata,
            timeout=15
        )
        if r.status_code not in (200, 201):
            return f"Error ({r.status_code}): {r.text}"
        
        return json.dumps(r.json(), indent=2, ensure_ascii=False)
    except Exception as e:
        return f"Error creando carpeta: {str(e)}"

def tool_gdrive_upload_file(local_path: str, folder_id: str = None, file_name: str = None, convert_to_doc: bool = False):
    token, err = get_auth_token()
    if err:
        return err

    path = Path(local_path)
    if not path.is_absolute():
        path = PROJECT_ROOT / path

    if not path.exists() or not path.is_file():
        return f"El archivo local no existe: {local_path}"

    target_name = file_name or path.name
    guessed_type, _ = mimetypes.guess_type(str(path))
    content_type = guessed_type or "application/octet-stream"

    metadata = {"name": target_name}
    if folder_id:
        metadata["parents"] = [folder_id]
    
    if convert_to_doc and (content_type.startswith("text/") or path.suffix in [".md", ".txt", ".docx", ".html"]):
        metadata["mimeType"] = "application/vnd.google-apps.document"

    try:
        file_bytes = path.read_bytes()
        files_payload = {
            "data": ("metadata", json.dumps(metadata), "application/json; charset=UTF-8"),
            "file": (target_name, file_bytes, content_type)
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        
        r = requests.post(
            f"{DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink",
            headers=headers,
            files=files_payload,
            timeout=60
        )
        
        if r.status_code not in (200, 201):
            return f"Error en upload ({r.status_code}): {r.text}"
        
        res = r.json()
        return json.dumps({
            "mensaje": "Archivo subido exitosamente a Google Drive",
            "id": res.get("id"),
            "nombre": res.get("name"),
            "enlace_drive": res.get("webViewLink"),
            "tamano_bytes": res.get("size")
        }, indent=2, ensure_ascii=False)
    except Exception as e:
        return f"Error subiendo archivo: {str(e)}"

def tool_gdrive_read_file(file_id: str):
    token, err = get_auth_token()
    if err:
        return err

    try:
        meta_res = requests.get(
            f"{DRIVE_API_BASE}/files/{file_id}?fields=id,name,mimeType,size,webViewLink",
            headers=get_headers(token),
            timeout=10
        )
        if meta_res.status_code != 200:
            return f"Error obteniendo metadatos del archivo ({meta_res.status_code}): {meta_res.text}"
        
        meta = meta_res.json()
        mime = meta.get("mimeType", "")

        if mime == "application/vnd.google-apps.document":
            exp_res = requests.get(
                f"{DRIVE_API_BASE}/files/{file_id}/export?mimeType=text/plain",
                headers=get_headers(token),
                timeout=20
            )
            if exp_res.status_code == 200:
                return f"# {meta.get('name')}\n\n{exp_res.text}"
            return f"Error exportando Google Doc ({exp_res.status_code}): {exp_res.text}"

        elif mime == "application/vnd.google-apps.spreadsheet":
            exp_res = requests.get(
                f"{DRIVE_API_BASE}/files/{file_id}/export?mimeType=text/csv",
                headers=get_headers(token),
                timeout=20
            )
            if exp_res.status_code == 200:
                return exp_res.text
            return f"Error exportando Sheet ({exp_res.status_code}): {exp_res.text}"

        else:
            down_res = requests.get(
                f"{DRIVE_API_BASE}/files/{file_id}?alt=media",
                headers=get_headers(token),
                timeout=30
            )
            if down_res.status_code != 200:
                return f"Error descargando archivo ({down_res.status_code}): {down_res.text}"
            
            if mime.startswith("text/") or "json" in mime or "markdown" in mime:
                return down_res.text
            else:
                return json.dumps({
                    "mensaje": "Archivo binario descargado (no texto).",
                    "id": meta.get("id"),
                    "nombre": meta.get("name"),
                    "tamano_bytes": meta.get("size"),
                    "enlace_drive": meta.get("webViewLink")
                }, indent=2, ensure_ascii=False)

    except Exception as e:
        return f"Error leyendo archivo: {str(e)}"

# --- DEFINICIÓN DE HERRAMIENTAS MCP ---

TOOLS_DEFINITIONS = [
    {
        "name": "gdrive_status",
        "description": "Verifica el estado de autenticación de Google Drive, usuario conectado y cuota de almacenamiento.",
        "inputSchema": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "gdrive_list_files",
        "description": "Lista archivos y carpetas dentro de Google Drive con filtro opcional por carpeta.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "folder_id": {
                    "type": "string",
                    "description": "ID opcional de la carpeta padre en Drive a explorar."
                },
                "query": {
                    "type": "string",
                    "description": "Consulta de filtro adicional en formato Drive API (ej: \"mimeType = 'application/pdf'\")."
                },
                "page_size": {
                    "type": "integer",
                    "description": "Cantidad máxima de archivos a retornar (1-100). Predeterminado: 25."
                }
            }
        }
    },
    {
        "name": "gdrive_search",
        "description": "Busca archivos en Google Drive por coincidencia de nombre y/o tipo.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "name_contains": {
                    "type": "string",
                    "description": "Texto o palabra clave a buscar en los nombres de archivos."
                },
                "mime_type": {
                    "type": "string",
                    "description": "Filtro opcional: 'folder', 'doc', 'sheet', 'pdf' o mimeType exacto."
                }
            },
            "required": ["name_contains"]
        }
    },
    {
        "name": "gdrive_create_folder",
        "description": "Crea una nueva carpeta en Google Drive.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "folder_name": {
                    "type": "string",
                    "description": "Nombre de la nueva carpeta."
                },
                "parent_folder_id": {
                    "type": "string",
                    "description": "ID de la carpeta contenedora en Drive (opcional, si no se indica se crea en la raíz)."
                }
            },
            "required": ["folder_name"]
        }
    },
    {
        "name": "gdrive_upload_file",
        "description": "Sube un archivo local (PDF, DOCX, Markdown, CSV, etc.) a una carpeta de Google Drive.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "local_path": {
                    "type": "string",
                    "description": "Ruta absoluta o relativa del archivo local a subir."
                },
                "folder_id": {
                    "type": "string",
                    "description": "ID de la carpeta de destino en Drive (opcional)."
                },
                "file_name": {
                    "type": "string",
                    "description": "Nombre con el que se guardará en Drive (opcional, por defecto el nombre local)."
                },
                "convert_to_doc": {
                    "type": "boolean",
                    "description": "Si es True, convierte archivos de texto/markdown a Google Docs nativos."
                }
            },
            "required": ["local_path"]
        }
    },
    {
        "name": "gdrive_read_file",
        "description": "Lee el contenido de un archivo en Google Drive (exporta Google Docs a texto y Sheets a CSV).",
        "inputSchema": {
            "type": "object",
            "properties": {
                "file_id": {
                    "type": "string",
                    "description": "ID del archivo en Google Drive."
                }
            },
            "required": ["file_id"]
        }
    }
]

# --- PROTOCOLO JSON-RPC 2.0 (MCP STDIO) ---

def handle_json_rpc(request: dict):
    req_id = request.get("id")
    method = request.get("method")
    params = request.get("params", {})

    if method == "initialize":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": {}
                },
                "serverInfo": {
                    "name": "google-drive-mcp",
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
        name = params.get("name")
        args = params.get("arguments", {})

        try:
            if name == "gdrive_status":
                res = tool_gdrive_status()
            elif name == "gdrive_list_files":
                res = tool_gdrive_list_files(
                    folder_id=args.get("folder_id"),
                    query=args.get("query"),
                    page_size=args.get("page_size", 25)
                )
            elif name == "gdrive_search":
                res = tool_gdrive_search(
                    name_contains=args.get("name_contains", ""),
                    mime_type=args.get("mime_type")
                )
            elif name == "gdrive_create_folder":
                res = tool_gdrive_create_folder(
                    folder_name=args.get("folder_name", ""),
                    parent_folder_id=args.get("parent_folder_id")
                )
            elif name == "gdrive_upload_file":
                res = tool_gdrive_upload_file(
                    local_path=args.get("local_path", ""),
                    folder_id=args.get("folder_id"),
                    file_name=args.get("file_name"),
                    convert_to_doc=args.get("convert_to_doc", False)
                )
            elif name == "gdrive_read_file":
                res = tool_gdrive_read_file(file_id=args.get("file_id", ""))
            else:
                return {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "error": {"code": -32601, "message": f"Herramienta desconocida: {name}"}
                }

            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "content": [{"type": "text", "text": str(res)}]
                }
            }
        except Exception as e:
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "isError": True,
                    "content": [{"type": "text", "text": f"Error ejecutando {name}: {str(e)}"}]
                }
            }

    else:
        if req_id is not None:
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "error": {"code": -32601, "message": f"Método no soportado: {method}"}
            }
        return None

def main():
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
            err = {
                "jsonrpc": "2.0",
                "id": None,
                "error": {"code": -32700, "message": f"Error parseando JSON: {str(e)}"}
            }
            sys.stdout.write(json.dumps(err) + "\n")
            sys.stdout.flush()

if __name__ == "__main__":
    main()
