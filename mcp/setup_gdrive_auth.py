#!/usr/bin/env python3
"""
Asistente Interactivo de Autenticación para Google Drive MCP
MIGATO / Monagas 2026
"""

import sys
import os
import json
import time
import webbrowser
import urllib.parse
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
import requests

MCP_DIR = Path(__file__).resolve().parent
TOKEN_FILE = MCP_DIR / "token.json"
CREDENTIALS_FILE = MCP_DIR / "credentials.json"

AUTH_PORT = 8085
REDIRECT_URI = f"http://localhost:{AUTH_PORT}"
AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"

# Scopes seguros: gestión de archivos creados/abiertos por la app, lectura de metadatos y perfil
SCOPES = [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive.metadata.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
]

auth_code_received = None

class OAuthCallbackHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        global auth_code_received
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)

        if "code" in params:
            auth_code_received = params["code"][0]
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            html = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Google Drive Conectado</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                    .card { background: #1e293b; padding: 2.5rem; border-radius: 1rem; border: 1px solid #334155; text-align: center; max-width: 480px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5); }
                    h1 { color: #38bdf8; margin-bottom: 0.5rem; }
                    p { color: #94a3b8; line-height: 1.6; }
                    .success { display: inline-block; background: #059669; color: white; padding: 0.5rem 1rem; border-radius: 9999px; font-weight: bold; margin-top: 1rem; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>¡Conexión Exitosa!</h1>
                    <p>Tu cuenta de Google Drive ha sido autorizada correctamente para el sistema MIGATO.</p>
                    <div class="success">✓ Puedes cerrar esta pestaña y volver a la terminal</div>
                </div>
            </body>
            </html>
            """
            self.wfile.write(html.encode("utf-8"))
        elif "error" in params:
            err = params.get("error", ["desconocido"])[0]
            self.send_response(400)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(f"<h1>Error de autorización: {err}</h1><p>Por favor intenta de nuevo.</p>".encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        # Silenciar logs HTTP
        pass

def main():
    print("\n" + "="*70)
    print(" 🚀 CONFIGURADOR DE AUTENTICACIÓN GOOGLE DRIVE MCP")
    print("="*70)

    client_id = None
    client_secret = None

    # 1. Comprobar si existe credentials.json descargado de Google Cloud
    if CREDENTIALS_FILE.exists():
        print(f"\n[✓] Se detectó archivo local: {CREDENTIALS_FILE.name}")
        try:
            creds_data = json.loads(CREDENTIALS_FILE.read_text(encoding="utf-8"))
            installed = creds_data.get("installed") or creds_data.get("web") or {}
            client_id = installed.get("client_id")
            client_secret = installed.get("client_secret")
        except Exception as e:
            print(f"[!] Error leyendo {CREDENTIALS_FILE}: {e}")

    # 2. Si no hay credentials.json, pedir los datos o buscar variables de entorno
    if not client_id or not client_secret:
        client_id = os.environ.get("GOOGLE_DRIVE_CLIENT_ID")
        client_secret = os.environ.get("GOOGLE_DRIVE_CLIENT_SECRET")

    if not client_id or not client_secret:
        print("\nPara conectar Google Drive necesitas un 'ID de cliente de OAuth 2.0'.")
        print("Si aún no lo tienes, puedes obtenerlo gratis en 2 minutos:")
        print(" 1. Entra a: https://console.cloud.google.com/apis/credentials")
        print(" 2. En 'Pantalla de consentimiento de OAuth', pon tu correo como Usuario de prueba.")
        print(" 3. En 'Biblioteca de APIs', activa la 'Google Drive API'.")
        print(" 4. En 'Credenciales', haz clic en '+ CREAR CREDENCIALES' -> 'ID de cliente de OAuth'.")
        print(" 5. Tipo: 'App de escritorio' (Desktop App).")
        print(" 6. Descarga el JSON y guárdalo como 'mcp/credentials.json', o pega tus datos abajo.\n")

        print("Pega tus credenciales:")
        client_id = input(" ➤ Client ID: ").strip()
        client_secret = input(" ➤ Client Secret: ").strip()

        if not client_id or not client_secret:
            print("\n[!] Error: No se proporcionaron Client ID y Client Secret válidos.")
            sys.exit(1)

        # Guardar credentials.json para futuros refrescos
        CREDENTIALS_FILE.write_text(json.dumps({
            "installed": {
                "client_id": client_id,
                "client_secret": client_secret
            }
        }, indent=2), encoding="utf-8")
        print(f"[✓] Guardadas credenciales en: {CREDENTIALS_FILE.name}")

    # 3. Construir URL de autorización
    auth_params = {
        "client_id": client_id,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": " ".join(SCOPES),
        "access_type": "offline",
        "prompt": "consent"
    }
    auth_url = f"{AUTH_ENDPOINT}?{urllib.parse.urlencode(auth_params)}"

    # 4. Iniciar servidor local para recibir el código de retorno
    server = HTTPServer(("127.0.0.1", AUTH_PORT), OAuthCallbackHandler)
    server.timeout = 600

    print("\n" + "-"*70)
    print("Abriendo tu navegador para iniciar sesión con Google...")
    print(f"Si el navegador no abre automáticamente, copia y abre este enlace:")
    print(f"\n{auth_url}\n")
    print("-"*70)

    try:
        webbrowser.open(auth_url)
    except Exception:
        pass

    print(f"Esperando confirmación en el navegador (puerto {AUTH_PORT})... (Tiempo límite: 10 min)")
    
    start_time = time.time()
    while auth_code_received is None and (time.time() - start_time) < 600:
        server.handle_request()

    if not auth_code_received:
        print("\n[!] No se recibió el código de autorización a tiempo.")
        sys.exit(1)

    print("\n[✓] Código de autorización recibido de Google.")
    print("Intercambiando código por Token de acceso y Refresh Token...")

    # 5. Canjear código por tokens
    token_payload = {
        "code": auth_code_received,
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code"
    }

    resp = requests.post(TOKEN_ENDPOINT, data=token_payload, timeout=20)
    if resp.status_code != 200:
        print(f"\n[!] Error obteniendo tokens ({resp.status_code}): {resp.text}")
        sys.exit(1)

    tokens = resp.json()
    access_token = tokens.get("access_token")
    refresh_token = tokens.get("refresh_token")
    expires_in = tokens.get("expires_in", 3600)

    # 6. Guardar token.json
    token_data = {
        "client_id": client_id,
        "client_secret": client_secret,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "expires_at": time.time() + expires_in,
        "token_type": tokens.get("token_type", "Bearer"),
        "scope": tokens.get("scope", "")
    }

    TOKEN_FILE.write_text(json.dumps(token_data, indent=2), encoding="utf-8")
    print(f"[✓] Token guardado exitosamente en: {TOKEN_FILE}")

    # 7. Verificar estado de conexión con Google Drive
    print("\nVerificando conexión con Google Drive API...")
    try:
        about_res = requests.get(
            "https://www.googleapis.com/drive/v3/about?fields=user,storageQuota",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10
        )
        if about_res.status_code == 200:
            info = about_res.json()
            user = info.get("user", {})
            quota = info.get("storageQuota", {})
            limit_gb = round(int(quota.get("limit", 0)) / (1024**3), 2) if quota.get("limit") else "Ilimitado"
            usage_gb = round(int(quota.get("usage", 0)) / (1024**3), 2)

            print("\n" + "="*70)
            print(f" 🎉 ¡GOOGLE DRIVE CONECTADO CON ÉXITO!")
            print(f" 👤 Usuario: {user.get('displayName')}")
            print(f" 📧 Correo:  {user.get('emailAddress')}")
            print(f" 💾 Cuota:   {usage_gb} GB usados de {limit_gb} GB")
            print("="*70)
            print("\nEl servidor MCP de Google Drive ya está listo para usarse desde Antigravity.\n")
        else:
            print(f"[!] Respuesta de verificación: {about_res.status_code} - {about_res.text}")
    except Exception as e:
        print(f"[!] Error verificando API: {e}")

if __name__ == "__main__":
    main()
