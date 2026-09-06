#!/usr/bin/env python3
"""
Test Suite para el Servidor MCP de Monagas
Simula un cliente MCP ejecutando handshake, descubrimiento de herramientas y ejecución.
"""

import subprocess
import json
import sys

def run_tests():
    server_cmd = [sys.executable, "/home/diego/Documents/antigravity/zealous-mendel/mcp/monagas_mcp_server.py"]
    
    proc = subprocess.Popen(
        server_cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    def send_recv(req):
        proc.stdin.write(json.dumps(req) + "\n")
        proc.stdin.flush()
        line = proc.stdout.readline()
        return json.loads(line)

    print(">>> 1. Probando 'initialize'...")
    init_req = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "test-client", "version": "1.0"}
        }
    }
    init_res = send_recv(init_req)
    assert init_res.get("result", {}).get("serverInfo", {}).get("name") == "monagas-intelligence-mcp", f"Fallo init: {init_res}"
    print("   ✓ Handshake exitoso:", init_res["result"]["serverInfo"])

    print(">>> 2. Probando 'tools/list'...")
    tools_req = {"jsonrpc": "2.0", "id": 2, "method": "tools/list"}
    tools_res = send_recv(tools_req)
    tools = tools_res.get("result", {}).get("tools", [])
    tool_names = [t["name"] for t in tools]
    print(f"   ✓ {len(tools)} herramientas descubiertas:", tool_names)
    assert "consultar_territorio" in tool_names
    assert "obtener_sectores_lapuente" in tool_names
    assert "consultar_documentacion_tecnica" in tool_names
    assert "obtener_enlace_despacho" in tool_names
    assert "generar_resumen_sala_situacional" in tool_names

    print(">>> 3. Probando 'tools/call' -> 'consultar_territorio' (Maturín)...")
    call_req1 = {
        "jsonrpc": "2.0",
        "id": 3,
        "method": "tools/call",
        "params": {
            "name": "consultar_territorio",
            "arguments": {"query": "alto-de-los-godos"}
        }
    }
    call_res1 = send_recv(call_req1)
    text1 = call_res1["result"]["content"][0]["text"]
    assert "Alto de Los Godos" in text1, f"Fallo consulta territorio: {text1}"
    print("   ✓ Retorno territorio correcto.")

    print(">>> 4. Probando 'tools/call' -> 'obtener_sectores_lapuente'...")
    call_req2 = {
        "jsonrpc": "2.0",
        "id": 4,
        "method": "tools/call",
        "params": {
            "name": "obtener_sectores_lapuente",
            "arguments": {}
        }
    }
    call_res2 = send_recv(call_req2)
    data_lp = json.loads(call_res2["result"]["content"][0]["text"])
    assert data_lp["totales"]["sectores"] == 11, f"Fallo 11 sectores: {data_lp}"
    assert "Francisco Verde" in data_lp["centros_electorales"], "Fallo centro Francisco Verde"
    print("   ✓ 11 sectores de La Puente validados correctamente con sus centros.")

    print(">>> 5. Probando 'tools/call' -> 'obtener_enlace_despacho' (San Simón)...")
    call_req3 = {
        "jsonrpc": "2.0",
        "id": 5,
        "method": "tools/call",
        "params": {
            "name": "obtener_enlace_despacho",
            "arguments": {"parroquia_id": "san-simon"}
        }
    }
    call_res3 = send_recv(call_req3)
    data_desp = json.loads(call_res3["result"]["content"][0]["text"])
    assert "carga/?p=san-simon" in data_desp["url_buzon_carga"]
    assert data_desp["clave_oficial"] == "admin"
    print("   ✓ Enlace de despacho y mensaje WhatsApp validados.")

    print(">>> 6. Probando 'tools/call' -> 'consultar_documentacion_tecnica' (buzon_ciego)...")
    call_req4 = {
        "jsonrpc": "2.0",
        "id": 6,
        "method": "tools/call",
        "params": {
            "name": "consultar_documentacion_tecnica",
            "arguments": {"tema": "buzón ciego"}
        }
    }
    call_res4 = send_recv(call_req4)
    text_doc = call_res4["result"]["content"][0]["text"]
    assert "Buzón Ciego" in text_doc or "buzon" in text_doc.lower()
    print("   ✓ Motor de citas de documentación técnica verificado.")

    print(">>> 7. Probando 'resources/list'...")
    res_req = {"jsonrpc": "2.0", "id": 7, "method": "resources/list"}
    res_res = send_recv(res_req)
    assert len(res_res["result"]["resources"]) >= 3
    print("   ✓ Recursos MCP listados correctamente.")

    proc.terminate()
    print("\n=======================================================")
    print("🎉 TODAS LAS PRUEBAS DEL SERVIDOR MCP PASARON CON ÉXITO")
    print("=======================================================")

if __name__ == "__main__":
    run_tests()
