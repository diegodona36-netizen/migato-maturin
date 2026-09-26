#!/usr/bin/env bash
# ==============================================================================
# Lanzador Local y Aislado: MIGATO AudioIntel & Actas de Reunión
# Movimiento Independiente Ganamos Todos (MIGATO) • Uso Personal Exclusivo
# ==============================================================================

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "=================================================================="
echo "🏛️  INICIANDO MIGATO AUDIOINTEL (MODO PRIVADO / AISLADO)"
echo "📍  Acceso Local: http://127.0.0.1:8090/reuniones/"
echo "📂  Bóveda Obsidian: vault/06-Actas-y-Reuniones/"
echo "=================================================================="

python3 scripts/server_reuniones.py
