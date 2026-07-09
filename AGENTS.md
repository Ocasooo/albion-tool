# AGENTS.md — Albion Tool

## Stack
- React 19 + TypeScript 6 + Vite 8 + Tailwind CSS v4 + React Router v7

## Commands
```sh
npm run dev       # Vite dev server
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

## Service patterns

### mealService.ts
- Module-level singleton con caché en memoria (`let cache: MealItem[] | null`).
- Fetch único desde `https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json`.
- Peticiones concurrentes comparten una misma Promise (`pendingPromise`).
- Filtra items que contienen `_MEAL_` en UniqueName.
- Extrae tier (`T(\d+)`) y enchantment (`@(\d+)`) del UniqueName.
- Usa `LocalizedNames["ES-ES"]` con fallback a `"EN-US"`.

### configService.ts
- Persistencia en localStorage, clave `albion-tool-config`.
- `loadConfig()` retorna siempre un `AppConfig` válido (merge con defaults).
- `saveConfig()` serializa todo el objeto.
- Se guarda en cada cambio vía `useEffect` + guardado explícito al cambiar de comida.

## Food page flow
1. **Búsqueda**: `FoodSearchBar` filtra `allMeals` por nombre (ES o EN) mientras se escribe.
2. **Selección**: al hacer clic en un resultado, se guarda la config de la comida anterior y se carga la nueva desde localStorage.
3. **Encantamiento**: `EnchantmentSelector` muestra botones 0-1-2-3; inhabilitados si no existen variantes para ese nivel.
4. **Materiales**: se combinan `baseMaterials` + `enchantmentMaterials[selectedEnchantment]` para mostrar en `FoodMaterials`.
5. **Config panel**: colapsable, contiene Spects (10 inputs numéricos en 2 hileras), placeholder de configuración adicional, y materiales separados por base / encantamiento.

## Conventions
- Spanish-first naming: ES-ES localization, fallback EN-US.
- Component imports use `.tsx` extension (allowed by `allowImportingTsExtensions`).
- Módulo `materialIdCounter` global para IDs únicos de `CraftMaterial`.
