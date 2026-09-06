#!/usr/bin/env bash
# ==============================================================================
# SKILLS.SH: TOOLBOX TÁCTICO DE OPERACIONES Y DESARROLLO - MONAGAS 2026
# ==============================================================================

set -e

# Colores tácticos
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mostrar_banner() {
    echo -e "${CYAN}${BOLD}"
    echo "  ╔════════════════════════════════════════════════════════════════════╗"
    echo "  ║   🚀 SUITE TERRITORIAL MONAGAS 2026 • SKILLS & AUTOMATION TOOLBOX  ║"
    echo "  ╚════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

mostrar_ayuda() {
    mostrar_banner
    echo -e "${BOLD}Comandos disponibles en skills.sh:${NC}"
    echo ""
    echo -e "  ${GREEN}./skills.sh perplexity \"<consulta>\"${NC}"
    echo "      Realiza búsquedas en la web viva mediante Perplexity AI con fuentes y citas."
    echo ""
    echo -e "  ${GREEN}./skills.sh notebooklm \"<consulta>\"${NC}"
    echo "      Consulta tus cuadernos y fuentes internas de Google NotebookLM con cero alucinación."
    echo ""
    echo -e "  ${GREEN}./skills.sh backup${NC}"
    echo "      Descarga y crea una copia de seguridad en JSON de la base de datos Firestore."
    echo ""
    echo -e "  ${GREEN}./skills.sh report${NC}"
    echo "      Genera el balance ejecutivo para el Gobernador listo para WhatsApp / Telegram."
    echo ""
    echo -e "  ${GREEN}./skills.sh geo-check${NC}"
    echo "      Audita la integridad de los 13 municipios, 44 parroquias y 11 sectores de La Puente."
    echo ""
    echo -e "  ${GREEN}./skills.sh despacho [id_parroquia]${NC}"
    echo "      Muestra los enlaces de carga y credenciales de acceso de las 44 parroquias."
    echo ""
    echo -e "  ${GREEN}./skills.sh test-mcp${NC}"
    echo "      Ejecuta el test de diagnóstico del servidor MCP de Inteligencia Territorial."
    echo ""
    echo -e "  ${GREEN}./skills.sh frontend [detect|doctor|context]${NC}"
    echo "      Audita y evalúa el diseño visual con la suite Impeccable."
    echo ""
}

case "$1" in
    perplexity|pplx)
        shift
        if [ -z "$1" ]; then
            echo -e "${YELLOW}Uso: ./skills.sh perplexity \"pregunta electoral o territorial\"${NC}"
            exit 1
        fi
        python3 "$SCRIPT_DIR/scripts/perplexity_client.py" "$@"
        ;;

    notebooklm|nlm)
        shift
        if [ -z "$1" ]; then
            echo -e "${YELLOW}Uso: ./skills.sh notebooklm \"consulta para tus documentos\"${NC}"
            exit 1
        fi
        "$HOME/.local/bin/nlm" query 34dbbbfb-da92-47cd-89f9-7a8e0ae33430 "$@" 2>/dev/null || "$HOME/.local/bin/nlm" query "$@"
        ;;

    backup)
        mostrar_banner
        python3 "$SCRIPT_DIR/scripts/backup_firestore.py"
        ;;

    report|reporte)
        mostrar_banner
        python3 "$SCRIPT_DIR/scripts/reporte_gobernador.py"
        ;;

    geo-check|audit)
        mostrar_banner
        python3 "$SCRIPT_DIR/scripts/geo_check.py"
        ;;

    despacho)
        mostrar_banner
        if [ -n "$2" ]; then
            python3 -c "from mcp.monagas_mcp_server import tool_obtener_enlace_despacho; print(tool_obtener_enlace_despacho('$2'))"
        else
            echo -e "${CYAN}Matriz de Despacho de Enlaces Activa:${NC}"
            echo "https://diegodona36-netizen.github.io/migato-maturin/despacho/"
            echo ""
            echo "Para ver una parroquia específica: ./skills.sh despacho alto-de-los-godos"
        fi
        ;;

    test-mcp)
        mostrar_banner
        python3 "$SCRIPT_DIR/mcp/test_mcp.py"
        ;;

    frontend|impeccable)
        mostrar_banner
        shift
        export PATH="$SCRIPT_DIR/.bin:$PATH"
        SUBCMD="${1:-doctor}"
        shift || true
        case "$SUBCMD" in
            detect)
                node "$SCRIPT_DIR/.agents/skills/impeccable/scripts/detect.mjs" "$@"
                ;;
            doctor)
                node "$SCRIPT_DIR/.agents/skills/impeccable/scripts/doctor.mjs" "$@"
                ;;
            context)
                node "$SCRIPT_DIR/.agents/skills/impeccable/scripts/context.mjs" "$@"
                ;;
            *)
                if [ -f "$SCRIPT_DIR/.agents/skills/impeccable/scripts/$SUBCMD.mjs" ]; then
                    node "$SCRIPT_DIR/.agents/skills/impeccable/scripts/$SUBCMD.mjs" "$@"
                else
                    echo -e "${RED}Subcomando no reconocido. Disponibles: detect, doctor, context${NC}"
                fi
                ;;
        esac
        ;;

    help|--help|-h|"")
        mostrar_ayuda
        ;;

    *)
        echo -e "${RED}Comando desconocido: $1${NC}"
        mostrar_ayuda
        exit 1
        ;;
esac
