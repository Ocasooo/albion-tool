# AGENTS.md — Albion Tool

## Stack
- React 19 + TypeScript 6 + Vite 8 + Tailwind CSS v4 + React Router v7
- Turso (libSQL) — base de datos para datos consistentes (comidas, materiales)
- Vercel Edge Functions

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
├── calculos/             # Ecuaciones y lógica de cálculo
│   └── ecuaciones.md     # Fórmulas del Excel traducidas a pseudocódigo
├── planes/               # Planes de implementación
│   ├── plan-calculadora.md    # Plan calculadora de crafteo
│   └── plan-power-leveling.md # Plan power leveling (futuro)
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
- `MealItem`: uniqueName, name, nameEn, tier, enchantment, icon, foodType?.
- `CraftMaterial`: id, name, quantity, pricePerUnit.
- `RecipeMetadata`: baseFocus, iv, unitsPerCraft, foodType.
- `MealConfig`: baseName, baseMaterials (compartidos entre todos los encantamientos), enchantmentMaterials (extra por nivel), recipe?.
- `CraftingInputValues`: stationCost, premium, focus, cityBonus, craftQuantity, sellingPrice.
- `AppConfig`: meals (Record<string, MealConfig>), spects, craftingInputs.

## Database schema (Turso)
```sql
-- Comidas (ej: T4_MEAL_SANDWICH)
meals: id (TEXT PK), name_es, name_en, tier, food_type (TEXT), per_craft (INT)

-- Recetas: materiales de cada comida
meal_materials: id (INT PK), meal_id (FK), material_name, quantity, is_base (0/1), enchantment_level (NULL para base)

-- Datos de crafteo hardcodeados del Excel (baseFocus, IV)
recipe_data: meal_id (TEXT), enchantment_level (INT), base_focus (REAL), iv (INT), units_per_craft (INT)
-- PK compuesta: (meal_id, enchantment_level)
```

### Seed script
- `scripts/seed.ts` — ejecutar con `npx tsx scripts/seed.ts`
- Usa la API de OpenAlbion (`https://api.openalbion.com/api/v3/...`)
- Obtiene foods, luego fetch de recetas por consumable (con encantamientos)
- Inserta en Turso: meals + meal_materials + recipe_data (batch inserts)
- recipe_data se pobla desde el mapa hardcodeado `RECIPE_DATA` en el propio seed.ts
- Puede re-ejecutarse para actualizar datos

## API Routes (Edge Functions)
- `api/meals.ts` — GET /api/meals (retorna todas las comidas con encantamientos)
- `api/meals/[id]/materials.ts` — GET /api/meals/:id/materials (retorna materiales + metadata de recipe_data)
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
2. **Selección**: al hacer clic en un resultado, se guarda la config de la comida anterior y se carga la nueva desde Turso (materiales + metadata) + localStorage (precios).
3. **Encantamiento**: `EnchantmentSelector` muestra botones 0-1-2-3; inhabilitados si no existen variantes para ese nivel.
4. **Materiales**: se combinan `baseMaterials` + `enchantmentMaterials[selectedEnchantment]` para mostrar en `FoodMaterials`.
5. **Cálculo en tiempo real**: `useMemo` ejecuta `calcFullRecipe()` cada vez que cambian materiales/precios/toggles/specs, y pasa `CraftingResult` a `CraftingInputs`.
6. **Config panel**: colapsable, contiene Spects (10 inputs numéricos en 2 hileras), placeholder de configuración adicional, materiales base en modo compact (nombres como texto), sección "Salsas" para materiales de encantamiento, y botón guardar.

## Crafting calculator — Lógica y ecuaciones

Fuente: Excel "Cocina 1.3 (Dave Okey YT)". Implementado en `src/calculos/craftingCalculator.ts`.

### Constantes del juego

| Constante | Valor | Descripción |
|-----------|-------|-------------|
| `BASE_RETURN_RATE` | 0.18 | Retorno base de recursos (18%) |
| `CITY_BONUS_RATE` | 0.15 | Bono de ciudad (15%) |
| `FOCUS_BONUS_RATE` | 0.59 | Bono de foco (59%) |
| `STATION_FEE_RATE` | 0.1125 | Tasa base de comisión de estación |
| `TAX_PREMIUM` | 0.065 | Impuesto con premium (6.5%) |
| `TAX_NORMAL` | 0.105 | Impuesto sin premium (10.5%) |
| `FOCUS_FACTOR_BASE` | 0.5 | Base del exponente de eficiencia de foco |
| `FOCUS_MAIN_SPEC_WEIGHT` | 2.8 | Peso de la spec principal |
| `FOCUS_OTHER_SPEC_WEIGHT` | 0.3 | Peso de cada spec secundaria |

### Datos hardcodeados del Excel (`recipeData.ts`)

Cada receta tiene `baseFocus`, `iv` (Item Value) y `unitsPerCraft` hardcodeados. La API de OpenAlbion no provee estos valores. El mapa está en `src/calculos/recipeData.ts` y también se usa en `scripts/seed.ts` para poblar la tabla `recipe_data`.

### Mapeo subcategory → foodType → specKey

La API retorna `subcategory.name` (ej: "Omelette"). Se mapea a `foodType` (ej: "Tortillas") y luego a `specKey` (ej: "tortillas") para buscar el nivel de spec del usuario.

```
API subcategory  →  foodType (Excel)  →  spec key
─────────────────────────────────────────────────
Omelette         →  Tortillas         →  tortillas
Pie              →  Pasteles          →  cakes
Salad            →  Ensaladas         →  salads
Sandwich         →  Bocadillos        →  sandwich
Soup             →  Sopas             →  soups
Stew             →  Guisos            →  stews
Roast            →  Asados            →  roasts
```

Implementado en `src/calculos/foodTypeMapping.ts`.

### Fórmulas

#### 1. Retorno de recursos (Return Rate)

```
totalReturn = (cityBonus ? 0.15 : 0) + (focus ? 0.59 : 0) + 0.18
returnRate  = totalReturn / (1 + totalReturn)
```

| Configuración | returnRate |
|---------------|------------|
| Sin foco, sin ciudad | 15.3% |
| Solo foco | 43.5% |
| Solo ciudad | 24.8% |
| Foco + ciudad | 47.9% |

El return rate indica qué porcentaje de materiales se recuperan al craftear. Afecta directamente el costo: `materialCost * (1 - returnRate)`.

#### 2. Impuestos (Taxes)

```
taxes = premium ? 0.065 : 0.105
```

Se aplican sobre el precio de venta: `taxAmount = sellingPrice * taxes`.

#### 3. Factor de eficiencia de foco (Focus Factor)

Cada tipo de plato tiene una **spec principal**. El factor reduce el foco necesario según el nivel de especialización.

```
focusFactor = 0.5 ^ ((2.8 * specPrincipal + 0.3 * sum(specsResto)) / 100)
```

Donde:
- `specPrincipal` = nivel de la spec correspondiente al foodType del plato (0–100)
- `specsResto` = suma de las otras 9 specs

Ejemplo: specPrincipal=100, sumSpecsResto=805 → focusFactor ≈ 0.027

#### 4. Foco por unidad (Focus per Unit)

```
focusPerUnit = baseFocus * focusFactor
```

`baseFocus` viene de la tabla `recipe_data` (hardcodeado del Excel). varía por receta y nivel de encantamiento.

#### 5. Comisión de estación (Station Commission)

```
stationCommission = 0.1125 * iv * stationCost * unitsPerCraft / 100
```

- `iv` = Item Value de la receta (hardcodeado del Excel)
- `stationCost` = costo que el usuario paga por usar la estación
- Se calcula por crafteo (un batch de `unitsPerCraft` unidades)

#### 6. Costo por unidad (Cost per Unit)

```
materialCost    = Σ (pricePerUnit[i] * quantity[i])
costPerUnit     = (materialCost * (1 - returnRate) + stationCommission) / unitsPerCraft
```

El return rate reduce el costo efectivo de los materiales.

#### 7. Profit

```
profitPerUnit = sellingPrice - (sellingPrice * taxes) - costPerUnit
```

#### 8. Cantidad y batch

El input del usuario (`craftQuantity`) representa **número de crafteos**, no unidades. Un crafteo produce `unitsPerCraft` unidades (generalmente 10 para la mayoría de comidas).

```
totalUnits   = craftQuantity * unitsPerCraft
profitBatch  = profitPerUnit * totalUnits
totalFocus   = craftQuantity * focusPerUnit
```

El texto flotante `1×{unitsPerCraft}` sobre el input de cantidad indica la relación.

#### 9. Silver per Focus

```
silverPerFocus = profitPerUnit / focusPerUnit
```

Indica cuántos silver se ganan por cada punto de foco utilizado. Solo es relevante cuando foco está activado.

### Flujo de datos

```
API /api/meals/:id/materials
  → { base: CraftMaterial[], enchantment: Record<level, CraftMaterial[]>, metadata: RecipeMetadata }
    → Food.tsx: displayedMaterials + recipeMeta
      → calcFullRecipe({ materials, sellingPrice, spects, premium, focus, cityBonus, stationCost, foodType, baseFocus, iv, unitsPerCraft, craftQuantity })
        → CraftingResult { costPerUnit, profitPerUnit, profitPerBatch, silverPerFocus, totalFocus, returnRate, taxes, stationCommission, numberOfCrafts }
          → CraftingInputs: display
```

### Archivos clave

| Archivo | Función |
|---------|---------|
| `src/calculos/craftingCalculator.ts` | Todas las funciones de cálculo |
| `src/calculos/foodTypeMapping.ts` | Mapeo subcategory → foodType → specKey |
| `src/calculos/recipeData.ts` | Datos hardcodeados del Excel (baseFocus, iv) |
| `src/calculos/ecuaciones.md` | Documentación completa de todas las ecuaciones del Excel |
| `scripts/seed.ts` | Pobla `recipe_data` con datos hardcodeados + API |

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
