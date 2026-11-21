# Graph Report - .  (2026-11-21)

## Corpus Check
- Corpus is ~13,200 words - fits in a single context window. You may not need a graph.

## Summary
- 226 nodes · 506 edges · 14 communities (11 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Tablero y Vistas EIRA
- Expediente y Portal Municipal
- Configuración TypeScript
- Dependencias y Fuentes
- Persistencia Local y API
- Revisión y Acciones de Servidor
- Navegación y Layout EIRA
- Asistente de Nueva Jornada
- Herramientas de Build y Estilos
- Layout Raíz Next.js
- Configuración Next.js
- Tema y Paleta Tailwind

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `TableroEira()` - 12 edges
3. `diagnostico` - 12 edges
4. `Expediente()` - 11 edges
5. `fechaLimiteDesde()` - 11 edges
6. `formatoFecha()` - 11 edges
7. `crearJornada()` - 10 edges
8. `leerDB()` - 10 edges
9. `listarJornadas()` - 10 edges
10. `nuevoId()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `leerDB()`  [EXTRACTED]
  src/app/api/version/route.ts → src/lib/db.ts
- `BotonAtendido()` --calls--> `marcarAtendido()`  [EXTRACTED]
  src/app/eira/jornadas/[id]/Acciones.tsx → src/lib/actions.ts
- `RevisionRequisito()` --calls--> `formatoFechaHora()`  [EXTRACTED]
  src/app/eira/jornadas/[id]/RevisionRequisito.tsx → src/lib/fechas.ts
- `Expediente()` --calls--> `jornadaPorId()`  [EXTRACTED]
  src/app/eira/jornadas/[id]/page.tsx → src/lib/db.ts
- `Expediente()` --calls--> `formatoFechaHora()`  [EXTRACTED]
  src/app/eira/jornadas/[id]/page.tsx → src/lib/fechas.ts

## Import Cycles
- None detected.

## Communities (14 total, 3 thin omitted)

### Community 0 - "Tablero y Vistas EIRA"
Cohesion: 0.13
Nodes (30): Expediente(), dynamic, FILTROS, TableroEira(), dynamic, SelectorGob(), dynamic, PortalMunicipal() (+22 more)

### Community 1 - "Expediente y Portal Municipal"
Cohesion: 0.11
Nodes (24): BotonAtendido(), CopiarEnlace(), dynamic, MEDIO, PESTANAS, SUGERENCIAS, tamanoLegible(), TarjetaRequisito() (+16 more)

### Community 2 - "Configuración TypeScript"
Cohesion: 0.07
Nodes (26): dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx (+18 more)

### Community 3 - "Dependencias y Fuentes"
Cohesion: 0.09
Nodes (22): @fontsource-variable/inter, @fontsource-variable/plus-jakarta-sans, lucide-react, dependencies, @fontsource-variable/inter, @fontsource-variable/plus-jakarta-sans, lucide-react, next (+14 more)

### Community 4 - "Persistencia Local y API"
Cohesion: 0.17
Nodes (19): dynamic, GET(), escribir(), jornadaPorId(), jornadaPorToken(), leerDB(), reiniciarDB(), RUTA (+11 more)

### Community 5 - "Revisión y Acciones de Servidor"
Cohesion: 0.23
Nodes (19): RevisionRequisito(), Asistente(), NuevaJornada(), aprobarRequisito(), conRequisito(), crearJornada(), marcarAtendido(), observarRequisito() (+11 more)

### Community 6 - "Navegación y Layout EIRA"
Cohesion: 0.17
Nodes (13): BarraLateralEira(), ItemJornada, PUNTO, dynamic, LayoutEira(), dynamic, dynamic, Inicio() (+5 more)

### Community 7 - "Asistente de Nueva Jornada"
Cohesion: 0.16
Nodes (14): ESTADOS_MX, ICONO_MODULO, PASOS, NuevaJornadaInput, DefinicionModulo, DefinicionRequisito, GRUPOS, MODULOS (+6 more)

### Community 8 - "Herramientas de Build y Estilos"
Cohesion: 0.13
Nodes (15): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/node, @types/react, @types/react-dom (+7 more)

## Knowledge Gaps
- **82 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+77 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Herramientas de Build y Estilos` to `Dependencias y Fuentes`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `diagnostico` connect `Navegación y Layout EIRA` to `Tablero y Vistas EIRA`, `Expediente y Portal Municipal`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _82 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Tablero y Vistas EIRA` be split into smaller, more focused modules?**
  _Cohesion score 0.12912912912912913 - nodes in this community are weakly interconnected._
- **Should `Expediente y Portal Municipal` be split into smaller, more focused modules?**
  _Cohesion score 0.10606060606060606 - nodes in this community are weakly interconnected._
- **Should `Configuración TypeScript` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `Dependencias y Fuentes` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._