---
title: "Arquitectura Hibrida Nube y Boveda"
created: "2026-09-19 16:46:19"
updated: "2026-09-19 16:46:19"
tags: [arquitectura, seguridad, vps, boveda]
---
# Arquitectura Hibrida Nube y Boveda

Estrategia defensiva de dos capas para blindar los datos electorales contra bloqueos de Conatel y apagones:

1. **Vanguardia en la Nube ([[Cloud VPS Hetzner]]):** Recibe el tráfico masivo de teléfonos de los testigos en los 13 municipios (4,50 USD/mes). Absorbe ataques DDoS y oculta la ubicación física de la oficina.
2. **Túnel Cifrado ([[Tunel VPN WireGuard]]):** Conexión punto a punto administrada por el [[Gateway MikroTik hEX]].
3. **Bóveda Física Local ([[Servidor Fisico Dell OptiPlex 5040]]):** Réplica continua en tiempo real hacia el arreglo [[Almacenamiento RAID 1 Espejo]]. Si tumban el internet o bloquean la nube, MIGATO mantiene el 100% de los datos y actas en físico.


## Conexiones Relacionadas
- [[Cloud VPS Hetzner]]
- [[Tunel VPN WireGuard]]
- [[Gateway MikroTik hEX]]
- [[Servidor Fisico Dell OptiPlex 5040]]
- [[Almacenamiento RAID 1 Espejo]]
