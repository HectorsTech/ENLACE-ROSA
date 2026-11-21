# Graph Report - ENLACE-ROSA  (2026-11-21)

## Corpus Check
- 52 files · ~20,708 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 333 nodes · 770 edges · 18 communities (14 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.7)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c3695058`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [id]/page.tsx
- actions.ts
- compilerOptions
- dependencies
- db.ts
- listarJornadas
- eira/layout.tsx
- fechas.ts
- devDependencies
- app/layout.tsx
- next.config.mjs
- tailwind.config.ts
- types.ts
- auth-actions.ts
- CartaEditor.tsx
- graphify.md

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `fechaLimiteDesde()` - 14 edges
3. `formatoFechaHora()` - 14 edges
4. `nuevoId()` - 13 edges
5. `TableroEira()` - 12 edges
6. `mutarDB()` - 12 edges
7. `listarJornadas()` - 12 edges
8. `jornadaPorToken()` - 12 edges
9. `diagnostico` - 12 edges
10. `Expediente()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `leerDB()`  [EXTRACTED]
  src/app/api/version/route.ts → src/lib/db.ts
- `RevisionRequisito()` --calls--> `formatoFechaHora()`  [EXTRACTED]
  src/app/eira/jornadas/[id]/RevisionRequisito.tsx → src/lib/fechas.ts
- `Expediente()` --calls--> `jornadaPorId()`  [EXTRACTED]
  src/app/eira/jornadas/[id]/page.tsx → src/lib/db.ts
- `Condiciones()` --calls--> `formatoFechaHora()`  [EXTRACTED]
  src/app/eira/jornadas/[id]/page.tsx → src/lib/fechas.ts
- `Asistente()` --calls--> `formatoFecha()`  [EXTRACTED]
  src/app/eira/jornadas/nueva/Asistente.tsx → src/lib/fechas.ts

## Import Cycles
- None detected.

## Communities (18 total, 4 thin omitted)

### Community 0 - "[id]/page.tsx"
Cohesion: 0.10
Nodes (43): Condiciones(), dynamic, ETIQUETA_INTERNET, Expediente(), MEDIO, PESTANAS, dynamic, FILTROS (+35 more)

### Community 1 - "actions.ts"
Cohesion: 0.13
Nodes (31): RevisionRequisito(), SUGERENCIAS, CartaEditor(), EstimadoPersonas(), tamanoLegible(), TarjetaRequisito(), Historial(), ICONOS (+23 more)

### Community 2 - "compilerOptions"
Cohesion: 0.07
Nodes (26): dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx (+18 more)

### Community 3 - "dependencies"
Cohesion: 0.12
Nodes (17): @fontsource-variable/inter, @fontsource-variable/newsreader, @fontsource-variable/plus-jakarta-sans, jspdf, lucide-react, dependencies, @fontsource-variable/inter, @fontsource-variable/newsreader (+9 more)

### Community 4 - "db.ts"
Cohesion: 0.09
Nodes (36): dynamic, GET(), dynamic, GET(), CartaCompromiso(), dynamic, dynamic, GET() (+28 more)

### Community 5 - "listarJornadas"
Cohesion: 0.25
Nodes (8): BotonAtendido(), CopiarEnlace(), dynamic, Preguntas(), AccesoGob(), dynamic, marcarAtendido(), listarJornadas()

### Community 6 - "eira/layout.tsx"
Cohesion: 0.15
Nodes (13): BarraLateralEira(), ItemJornada, PUNTO, BuscadorJornadas(), ItemBusqueda, norm(), dynamic, LayoutEira() (+5 more)

### Community 7 - "fechas.ts"
Cohesion: 0.11
Nodes (20): Asistente(), ESTADOS_MX, ICONO_MODULO, PASOS, NuevaJornada(), crearJornada(), slug(), MODULOS (+12 more)

### Community 8 - "devDependencies"
Cohesion: 0.08
Nodes (24): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/node, @types/react, @types/react-dom (+16 more)

### Community 14 - "types.ts"
Cohesion: 0.11
Nodes (18): chip(), Datos, FichaForm(), Opciones(), SENALES, guardarFicha(), AlertaCalculada, EvaluacionFicha (+10 more)

### Community 15 - "auth-actions.ts"
Cohesion: 0.21
Nodes (16): FormIdMunicipal(), FormLoginEira(), entrarMunicipal(), EstadoForm, iniciarSesionEira(), claveEira(), COOKIE_EIRA, crearTokenEira() (+8 more)

### Community 16 - "CartaEditor.tsx"
Cohesion: 0.21
Nodes (7): ContextoCarta, DatosCarta, DocumentoCarta(), vacio(), FirmaPad(), CLAUSULAS_FIJAS, CartaDatos

## Knowledge Gaps
- **102 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+97 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jornadaPorToken()` connect `db.ts` to `[id]/page.tsx`, `auth-actions.ts`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `listarJornadas()` connect `listarJornadas` to `[id]/page.tsx`, `db.ts`, `eira/layout.tsx`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `tokenEiraValido()` connect `auth-actions.ts` to `actions.ts`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _102 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `[id]/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10407239819004525 - nodes in this community are weakly interconnected._
- **Should `actions.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1253968253968254 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._