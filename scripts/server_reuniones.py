#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Servidor Local y Aislado de Inteligencia de Reuniones MIGATO Monagas 2026
Sirve la interfaz web privada de AudioIntel y procesa el guardado directo
en la Bóveda Obsidian (vault/06-Actas-y-Reuniones/) en Markdown y DOCX nativo IUTIRLA.
"""

import os
import sys
import json
import tempfile
import webbrowser
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse

# Agregar scripts/ al PATH para importar los módulos de compilación
SCRIPTS_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPTS_DIR.parent
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from export_acta import process_and_save_full_acta, VAULT_ACTAS_DIR
from build_acta_word import build_acta_docx

PORT = 8090

class MigatoReunionesHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PROJECT_ROOT), **kwargs)

    def _set_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        self.send_response(204)
        self._set_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path in ["/api/status", "/health"]:
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self._set_cors_headers()
            self.end_headers()
            resp = {
                "status": "online",
                "service": "MIGATO AudioIntel Server",
                "version": "2.6.0",
                "vault_dir": str(VAULT_ACTAS_DIR),
                "vault_exists": VAULT_ACTAS_DIR.exists()
            }
            self.wfile.write(json.dumps(resp, ensure_ascii=False, indent=2).encode("utf-8"))
        elif parsed.path == "/":
            self.send_response(302)
            self.send_header("Location", "/reuniones/")
            self.end_headers()
        else:
            # Sirve los archivos estáticos de forma nativa
            super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length == 0:
            self.send_response(400)
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(b'{"error": "Empty body"}')
            return

        body = self.rfile.read(content_length)
        try:
            data = json.loads(body.decode("utf-8"))
        except Exception as e:
            self.send_response(400)
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"error": f"Invalid JSON: {str(e)}"}).encode("utf-8"))
            return

        if parsed.path == "/api/save-acta":
            try:
                result = process_and_save_full_acta(data)
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps(result, ensure_ascii=False).encode("utf-8"))
                print(f"🏛️ [MIGATO AudioIntel] Acta guardada con éxito en Bóveda: {result.get('docx_path')}")
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))

        elif parsed.path == "/api/build-docx":
            try:
                with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as tmp:
                    tmp_path = tmp.name
                build_acta_docx(data, tmp_path)
                
                with open(tmp_path, "rb") as f:
                    docx_bytes = f.read()
                os.remove(tmp_path)

                filename = f"Acta_{data.get('fecha', '2026')}_MIGATO.docx"
                self.send_response(200)
                self.send_header("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
                self.send_header("Content-Length", str(len(docx_bytes)))
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(docx_bytes)
                print(f"📄 [MIGATO AudioIntel] Acta DOCX oficial transmitida al cliente: {filename}")
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
        else:
            self.send_response(404)
            self._set_cors_headers()
            self.end_headers()

def run_server():
    server_address = ("127.0.0.1", PORT)
    httpd = HTTPServer(server_address, MigatoReunionesHandler)
    url = f"http://127.0.0.1:{PORT}/reuniones/"
    print("=" * 64)
    print("🏛️ SERVIDOR PERSONAL AISLADO • MIGATO AUDIOINTEL & ACTAS")
    print(f"📍 URL de Acceso Local: {url}")
    print(f"📂 Bóveda Obsidian: {VAULT_ACTAS_DIR}")
    print("⚡ Presiona Ctrl + C para detener el servidor")
    print("=" * 64)
    
    try:
        webbrowser.open(url)
    except Exception:
        pass

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido con éxito.")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
