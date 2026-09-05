#!/usr/bin/env bash
# Script para iniciar el servidor local de MIGATO Monagas
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=================================================="
echo "   MIGATO Monagas - Servidor Local Directo"
echo "=================================================="
echo "Conectado directamente a Google Cloud Firestore."
echo ""
echo "Acceso en esta computadora:"
echo "👉 http://localhost:8000/earth-monagas/"
echo ""
echo "Acceso desde celular o tablet (en la misma red WiFi):"
IP=$(hostname -I 2>/dev/null | awk '{print $1}')
if [ -n "$IP" ]; then
  echo "👉 http://$IP:8000/earth-monagas/"
fi
echo ""
echo "Presiona Ctrl+C para detener el servidor."
echo "=================================================="

python3 server.py
