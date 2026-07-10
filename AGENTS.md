# AGENTS.md — Albion Tool

## Stack
- React 19 + TypeScript 6 + Vite 8 + Tailwind CSS v4 + React Router v7
- Turso (libSQL) — base de datos para datos consistentes (comidas, materiales)
- Vercel Edge Functions — API proxy (credenciales nunca salen del server)

## Commands
```sh
npm run dev       # Vite dev server (sin API routes)
vercel dev        # Frontend + API routes (recomendado)
npm run build     # tsc -b && vite build (requires both to pass)
npm run lint      # eslint .
npm run preview   # vite preview (serve production build)
```

## Build quirks
- `npm run build` runs **typecheck (`tsc -b`) then `vite build`**. Type errors block the build.
- `tsconfig.json` is a root references file only; actual configs are `tsconfig.app.json` (src/) and `tsconfig.node.json` (vite.config.ts).
- `verbatimModuleSyntax: true` — must use `import type` for type-only imports.
- `erasableSyntaxOnly: true` — no enums, no namespaces.
- `noUnusedLocals` and `noUnusedParameters` are enabled.

## Tailwind v4 specifics
- No `tailwind.config.*` or `postcss.config.*`. Config is done via `@theme` in CSS.
- Vite plugin `@tailwindcss/vite` in `vite.config.ts`. No PostCSS pipeline.
- Entrypoint: `src/index.css` with `@import "tailwindcss"`.
- Background animation (moving diagonal lines) defined in `src/index.css`.

## Routing
- `react-router-dom` v7. `<BrowserRouter>` wraps `<App />` in `src/App.tsx`.
- Routes: `/` (empty — add MainContent), `/food` (Food page with meal calculator).

## Project structure
```
api/
├── meals.ts                    # GET /api/meals
└── meals/[id]/materials.ts     # GET /api/meals/:id/materials
src/
├── main.tsx              # Entry — mounts <App /> into #root
├── index.css             # Tailwind import + global styles
├── App.tsx               # BrowserRouter + Routes
├── types/                # TypeScript interfaces
├── services/             # Singleton services
├── components/{feature}/ # Feature-scoped components
└── pages/                # Page-level components
```

## Art direction & styling
- **Fondo**: `bg-slate-950` (#020617) con animación CSS `moveLines` — líneas diagonales 45° cada 25px, opacidad 0.02, movimiento lento (20s linear infinite).
- **Contenedores**: `bg-slate-900/60` o `bg-slate-800/xx` con `border border-slate-700/800`. Efecto glass con `backdrop-blur-sm` en elementos superpuestos.
- **Inputs**: `bg-slate-900 border-slate-700 rounded-lg text-white placeholder-slate-500`.
- **Esquinas**: contenedores `rounded-xl`/`rounded-2xl`, inputs/botones `rounded-lg`.
- **Header**: sticky, `bg-slate-900/70 backdrop-blur-md border-b border-slate-800`. Logo `public/webIcon.jpg` (JPEG, 32x32). Links con ruta activa detectada por `useLocation()` — texto azul + `border-b-2 border-blue-400`.
- **Transiciones**: `transition-colors` en hover y active.
- **Iconos de items**: `https://render.albiononline.com/v1/item/{UniqueName}.png?size=64`.

## Data model (`types/meal.ts`)
- `MealItem`: uniqueName, name, nameEn, tier, enchantment, icon.
- `CraftMaterial`: id, name, quantity, pricePerUnit.
- `MealConfig`: baseName, baseMaterials (compartidos entre todos los encantamientos), enchantmentMaterials (extra por nivel).
- `CraftingInputValues`: stationCost, returnPercent, taxes, premium, focus, cityBonus.
- `AppConfig`: meals (Record<string, MealConfig>), spects, craftingInputs.

## Database schema (Turso)
```sql
-- Comidas (ej: T4_MEAL_SANDWICH)
meals: id (TEXT PK), name_es, name_en, tier

-- Recetas: materiales de cada comida
meal_materials: id (INT PK), meal_id (FK), material_name, quantity, is_base (0/1), enchantment_level (NULL para base)
```

### Seed script
- `scripts/seed.ts` — ejecutar con `npx tsx scripts/seed.ts`
- Usa la API de OpenAlbion (`https://api.openalbion.com/api/v3/...`)
- Obtiene foods, luego fetch de recetas por consumable (con encantamientos)
- Inserta en Turso: meals + meal_materials (batch inserts)
- Puede re-ejecutarse para actualizar datos

## API Routes (Edge Functions)
- `api/meals.ts` — GET /api/meals (retorna todas las comidas con encantamientos)
- `api/meals/[id]/materials.ts` — GET /api/meals/:id/materials (retorna materiales)
- Credenciales en Vercel Dashboard: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`
- Local: mismas variables en `.env` (para seed script)

## Service patterns

### mealService.ts
- Module-level singleton con caché en memoria (`let cache: MealItem[] | null`).
- Fetch único desde Turso (base de datos local).
- Peticiones concurrentes comparten una misma Promise (`pendingPromise`).
- Re-exporta `getMealMaterials` para obtener materiales de una comida específica.

### mealDbService.ts
- Usa `fetch('/api/...')` para llamar a las Edge Functions.
- No tiene conexión directa a Turso.
- `getAllMeals()`: retorna todas las comidas con sus encantamientos.
- `getMealMaterials(mealId)`: retorna materiales base y por encantamiento.
- Caché en memoria para `getAllMeals()`.

### turso.ts
- Solo para seed script (fuera del browser).
- Lee `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` de `.env`.

### configService.ts
- Persistencia en localStorage, clave `albion-tool-config`.
- `loadConfig()` retorna siempre un `AppConfig` válido (merge con defaults).
- `saveConfig()` serializa todo el objeto.
- Almacena: precios por unidad, costos, spects, configuración de craft.

## Food page flow
1. **Búsqueda**: `FoodSearchBar` filtra `allMeals` por nombre (ES o EN) mientras se escribe.
2. **Selección**: al hacer clic en un resultado, se guarda la config de la comida anterior y se carga la nueva desde Turso (materiales) + localStorage (precios).
3. **Encantamiento**: `EnchantmentSelector` muestra botones 0-1-2-3; inhabilitados si no existen variantes para ese nivel.
4. **Materiales**: se combinan `baseMaterials` + `enchantmentMaterials[selectedEnchantment]` para mostrar en `FoodMaterials`.
5. **Config panel**: colapsable, contiene Spects (10 inputs numéricos en 2 hileras), placeholder de configuración adicional, materiales base en modo compact (nombres como texto), sección "Salsas" para materiales de encantamiento, y botón guardar.

## Conventions
- Spanish-first naming: ES-ES localization, fallback EN-US.
- Component imports use `.tsx` extension (allowed by `allowImportingTsExtensions`).

## Componentes clave

### MaterialInputs
- Props: `title?`, `materials`, `compact?`, `onChange`
- `compact=true`: muestra nombre como `<span>` texto (sin label "Nombre"), sin headers de columna
- `compact=false` (default): muestra headers "Nombre/Cantidad/Precio/unidad" y nombre como div read-only
- Sin botones de agregar/eliminar materiales

### ConfigPanel
- Estructura: Spects → Config adicional (placeholder) → Materiales base (compact) → Salsas → Materiales por encantamiento (compact) → Guardar
- "Salsas" es un título `<h4>` separando materiales base de encantamiento

## Skills
- `vercel-react-best-practices`: React/Next.js performance optimization guidelines from Vercel Engineering (70 rules across 8 categories).
  - Location: `.opencode/skills/vercel-react-best-practices/SKILL.md`
  - Use when: writing, reviewing, or refactoring React/Next.js code for performance.
- `sql-optimization`: Universal SQL performance optimization for query tuning, indexing strategies, and database performance analysis.
  - Location: `.opencode/skills/sql-optimization/SKILL.md`
  - Use when: writing, optimizing, or reviewing SQL queries; analyzing execution plans; designing indexes.
- `performance`: Web performance optimization based on Lighthouse audits, Core Web Vitals, and runtime efficiency.
  - Location: `.opencode/skills/performance/SKILL.md`
  - Use when: optimizing load times, reducing bundle size, improving LCP/CLS/TBT, or performing performance audits.
