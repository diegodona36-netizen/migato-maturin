#!/usr/bin/env bash
# ==============================================================
# LANZADOR LOCAL SOBERANO - PLATAFORMA TERRITORIAL MIGATO 2026
# Estado Monagas • 100% Offline Ready (Sin dependencias externas)
# ==============================================================
set -e
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "Iniciando servidor local MIGATO Monagas..."
python3 server.py
