#!/usr/bin/env python3
"""
Servidor local para la Plataforma de Monitoreo Comunitario - Maturín.
Ejecuta un servidor HTTP local en el puerto 8000 (o el siguiente disponible).
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Deshabilitar caché para desarrollo en vivo
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

def run():
    global PORT
    while PORT < 8050:
        try:
            with socketserver.TCPServer(("", PORT), Handler) as httpd:
                print("=" * 65)
                print(f"🚀 SISTEMA DE MONITOREO MATURÍN ACTIVO")
                print(f"📍 Servidor local corriendo en: http://localhost:{PORT}")
                print(f"📁 Directorio base: {DIRECTORY}")
                print("=" * 65)
                print("Presiona Ctrl + C para detener el servidor.\n")
                httpd.serve_forever()
                break
        except OSError:
            PORT += 1

if __name__ == "__main__":
    try:
        run()
    except KeyboardInterrupt:
        print("\n🛑 Servidor detenido con éxito.")
        sys.exit(0)
