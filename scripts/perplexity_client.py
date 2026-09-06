#!/usr/bin/env python3
"""
Cliente Oficial de Perplexity AI para Monagas 2026
Permite realizar búsquedas en la web en tiempo real con citas y fuentes bibliográficas.
Usa la API de Perplexity (modelos sonar, sonar-pro, sonar-reasoning).
"""

import sys
import os
import json
import urllib.request
import urllib.error
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

def get_api_key():
    # 1. Variable de entorno
    key = os.environ.get("PERPLEXITY_API_KEY") or os.environ.get("PPLX_API_KEY")
    if key and key.strip():
        return key.strip()

    # 2. Archivo .env en el proyecto
    env_file = PROJECT_ROOT / ".env"
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line.startswith("PERPLEXITY_API_KEY=") or line.startswith("PPLX_API_KEY="):
                val = line.split("=", 1)[1].strip().strip('"').strip("'")
                if val:
                    return val

    # 3. Archivo en ~/.config/perplexity.token
    token_file = Path.home() / ".config" / "perplexity.token"
    if token_file.exists():
        val = token_file.read_text(encoding="utf-8").strip()
        if val:
            return val

    return None

def consultar_perplexity(query: str, model: str = "sonar"):
    api_key = get_api_key()
    if not api_key:
        return (
            "⚠️ [Perplexity] Clave API no configurada.\n\n"
            "Para activar las búsquedas web con Perplexity:\n"
            "1. Obtén tu clave en: https://www.perplexity.ai/settings/api\n"
            "2. Configúrala con cualquiera de estas opciones:\n"
            "   - En terminal: export PERPLEXITY_API_KEY=\"tu_clave_aqui\"\n"
            "   - O crea un archivo .env en el proyecto: PERPLEXITY_API_KEY=tu_clave_aqui\n"
            "   - O guárdala en: ~/.config/perplexity.token"
        )

    url = "https://api.perplexity.ai/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "MonagasIntel/1.0"
    }

    payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": (
                    "Eres un asistente de investigación táctica y territorial para el Estado Monagas, Venezuela. "
                    "Proporciona respuestas precisas, con datos verificados, fechas y fuentes sobre centros electorales, "
                    "instituciones, demografía e infraestructura comunal."
                )
            },
            {
                "role": "user",
                "content": query
            }
        ],
        "temperature": 0.2
    }

    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers=headers,
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            choice = data.get("choices", [{}])[0]
            answer = choice.get("message", {}).get("content", "")
            citations = data.get("citations", [])

            resultado = f"🌐 **Resultado Perplexity AI ({model}):**\n\n{answer}\n"
            if citations:
                resultado += "\n\n**Fuentes citadas:**\n"
                for idx, c in enumerate(citations, 1):
                    resultado += f"- [{idx}] {c}\n"
            return resultado
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="ignore")
        return f"❌ Error API Perplexity ({e.code}): {err_body}"
    except Exception as e:
        return f"❌ Error de conexión con Perplexity: {str(e)}"

def main():
    if len(sys.argv) < 2:
        print("Uso: python3 perplexity_client.py \"tu pregunta o consulta electoral\" [modelo]")
        print("Ejemplo: python3 perplexity_client.py \"Centros de votación en Parroquia Boquerón Maturín\" sonar")
        sys.exit(1)

    query = sys.argv[1]
    model = sys.argv[2] if len(sys.argv) > 2 else "sonar"
    print(consultar_perplexity(query, model))

if __name__ == "__main__":
    main()
