#!/usr/bin/env bash
# Script para iniciar el servidor local de MIGATO Monagas
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=================================================="
echo "   MIGATO Monagas - Servidor Local de Presentación"
echo "=================================================="
echo "MODO SIN CONEXIÓN (100% OFFLINE READY)"
echo ""
echo "Acceso Principal en esta computadora:"
echo "👉 Portal de Mando:         http://localhost:8001/"
echo "👉 Dossiers (4 Módulos):    http://localhost:8001/dossiers.html"
echo "👉 Fase 1 (Despacho):       http://localhost:8001/despacho/"
echo "👉 Fase 2 (Buzón Carga):    http://localhost:8001/carga/?p=alto-de-los-godos"
echo "👉 Fase 3 (175 Centros CNE):http://localhost:8001/centros-maturin/"
echo "👉 Fase 4 (Satélite 3D):    http://localhost:8001/earth-monagas/"
echo "👉 Vialidad La Puente:      http://localhost:8001/vialidad-lapuente/"
echo ""
IP=$(hostname -I 2>/dev/null | awk '{print $1}')
if [ -n "$IP" ]; then
  echo "Acceso desde otra laptop/tablet en la misma red:"
  echo "👉 http://$IP:8001/"
fi
echo ""
echo "Presiona Ctrl+C para detener el servidor."
echo "=================================================="

python3 server.py
