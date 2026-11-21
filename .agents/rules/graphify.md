---
trigger: always_on
---

# Graphify — Ahorro de tokens y navegación del código

Este proyecto cuenta con un grafo de conocimiento persistente en `graphify-out/`.

- Antes de leer múltiples archivos o explorar el repositorio completo para responder preguntas sobre arquitectura, relaciones entre módulos o ubicación de funciones, consulta primero el grafo:
  - `graphify query "<pregunta>" --budget 1500` (usa `--dfs` para trazar un flujo específico)
  - `graphify path "<NodoA>" "<NodoB>"`
  - `graphify explain "<Nodo>"`
  - `graphify-out/GRAPH_REPORT.md`
- Después de cambios grandes en el código, actualiza el grafo de forma incremental sin usar LLM (0 tokens):
  - `graphify update .`
- El archivo `.graphifyignore` excluye PDFs pesados, `node_modules/`, `.next/` y `data/` para evitar gasto innecesario de tokens.
