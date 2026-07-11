# Plan — Calculadora de Crafteo de Comida

## Objetivo

Integrar las ecuaciones del Excel "Cocina 1.3" para calcular costo por unidad, profit, silver/focus e inversión necesaria al craftear comida en Albion Online.

---

## Datos necesarios

| Campo | Fuente actual | API OpenAlbion | Acción |
|-------|--------------|----------------|--------|
| Materiales + cantidades | DB (meal_materials) | Sí | Ya tenemos |
| `per_craft` (unidades por crafteo) | No | Sí (`crafting.per_craft`) | Agregar a DB |
| `foodType` (categoría del plato) | No | Sí (`subcategory.name`) | Agregar a DB, mapear |
| `baseFocus` (foco base de la receta) | No | **No** | Hardcodear desde Excel |
| `iv` (Item Value, comisión de estación) | No | **No** | Hardcodear desde Excel |
| `sellingPrice` (precio de venta del plato) | No | N/A | Input del usuario |
| `spects` (niveles de spec) | localStorage | N/A | Ya tenemos |
| `premium/focus/cityBonus/stationCost` | localStorage | N/A | Ya tenemos |

### Mapeo subcategory → foodType → spec

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

---

## Archivos a crear (3)

### 1. `src/calculos/craftingCalculator.ts`

Motor de cálculo puro. Todas las ecuaciones del Excel como funciones TypeScript.

```typescript
// Constantes del juego (fijas)
const BASE_RETURN_RATE = 0.18
const CITY_BONUS_RATE = 0.15
const FOCUS_BONUS_RATE = 0.59
const STATION_FEE_RATE = 0.1125
const TAX_PREMIUM = 0.065
const TAX_NORMAL = 0.105
const FOCUS_FACTOR_BASE = 0.5
const FOCUS_MAIN_SPEC_WEIGHT = 2.8
const FOCUS_OTHER_SPEC_WEIGHT = 0.3

// Interfaces
interface CraftingInput {
  materials: CraftMaterial[]
  sellingPrice: number
  spects: Record<string, number>
  premium: boolean
  focus: boolean
  cityBonus: boolean
  stationCost: number
  foodType: string
  baseFocus: number
  iv: number
  unitsPerCraft: number
}

interface CraftingResult {
  costPerUnit: number
  profitPerUnit: number
  profitPerBatch: number
  silverPerFocus: number
  totalFocus: number
  returnRate: number
  taxes: number
  stationCommission: number
}

// Funciones a implementar
export function calcReturnRate(cityBonus: boolean, focus: boolean): number
export function calcTaxes(premium: boolean): number
export function calcFocusFactor(specPrincipal: number, allSpecs: number[]): number
export function calcFocusPerUnit(baseFocus: number, focusFactor: number): number
export function calcStationCommission(iv: number, stationCost: number, unitsPerCraft: number): number
export function calcMaterialCost(materials: CraftMaterial[]): number
export function calcCostPerUnit(
  materialCost: number,
  returnRate: number,
  stationCommission: number,
  specialCost: number,
  unitsPerCraft: number
): number
export function calcProfitPerUnit(sellingPrice: number, taxes: number, costPerUnit: number): number
export function calcProfitPerBatch(profitPerUnit: number, unitsPerCraft: number): number
export function calcSilverPerFocus(profitPerUnit: number, focusPerUnit: number): number
export function calcTotalFocus(unitsPerCraft: number, focusPerUnit: number): number
export function calcFullRecipe(input: CraftingInput): CraftingResult
```

### 2. `src/calculos/foodTypeMapping.ts`

Mapeo de categorías de comida.

```typescript
export const SUBCATEGORY_TO_FOOD_TYPE: Record<string, string> = {
  Omelette: 'Tortillas',
  Pie: 'Pasteles',
  Salad: 'Ensaladas',
  Sandwich: 'Bocadillos',
  Soup: 'Sopas',
  Stew: 'Guisos',
  Roast: 'Asados',
}

export const FOOD_TYPE_TO_SPEC_KEY: Record<string, string> = {
  Tortillas: 'tortillas',
  Pasteles: 'cakes',
  Ensaladas: 'salads',
  Bocadillos: 'sandwich',
  Sopas: 'soups',
  Guisos: 'stews',
  Asados: 'roasts',
}

export function getSpecKeyForFoodType(foodType: string): string
```

### 3. `src/calculos/recipeData.ts`

Mapa hardcodeado `mealUniqueId → { baseFocus, iv }` desde el Excel (~67 comidas).

```typescript
export const RECIPE_DATA: Record<string, { baseFocus: number; iv: number }> = {
  T1_MEAL_SOUP: { baseFocus: 560, iv: 64 },
  T2_MEAL_SALAD: { baseFocus: 560, iv: 64 },
  T3_MEAL_SOUP: { baseFocus: 1680, iv: 192 },
  T3_MEAL_PIE: { baseFocus: 530, iv: 56 },
  T3_MEAL_OMELETTE: { baseFocus: 520, iv: 56 },
  T3_MEAL_ROAST: { baseFocus: 580, iv: 64 },
  T4_MEAL_SALAD: { baseFocus: 1680, iv: 192 },
  T4_MEAL_STEW: { baseFocus: 610, iv: 64 },
  T4_MEAL_SANDWICH: { baseFocus: 550, iv: 56 },
  T5_MEAL_SOUP: { baseFocus: 5040, iv: 576 },
  T5_MEAL_PIE: { baseFocus: 1800, iv: 192 },
  T5_MEAL_OMELETTE: { baseFocus: 1550, iv: 168 },
  T5_MEAL_ROAST: { baseFocus: 1760, iv: 192 },
  T6_MEAL_SALAD: { baseFocus: 5040, iv: 576 },
  T6_MEAL_SALAD_FISH: { baseFocus: 672, iv: 750 },
  T6_MEAL_STEW: { baseFocus: 1840, iv: 192 },
  T6_MEAL_SANDWICH: { baseFocus: 1650, iv: 168 },
  T7_MEAL_PIE: { baseFocus: 5400, iv: 576 },
  T7_MEAL_OMELETTE: { baseFocus: 4640, iv: 504 },
  T7_MEAL_ROAST: { baseFocus: 5280, iv: 576 },
  T7_MEAL_PIE_FISH: { baseFocus: 672, iv: 750 },
  T7_MEAL_OMELETTE_FISH: { baseFocus: 788, iv: 750 },
  T7_MEAL_ROAST_FISH: { baseFocus: 7280, iv: 576 },
  T8_MEAL_STEW: { baseFocus: 5470, iv: 750 },
  T8_MEAL_SANDWICH: { baseFocus: 5470, iv: 750 },
  // ... completar con las ~42 comidas restantes del Excel
}
```

---

## Archivos a modificar (9)

### 4. `src/types/meal.ts`

```typescript
// Agregar
export interface RecipeMetadata {
  baseFocus: number
  iv: number
  unitsPerCraft: number
  foodType: string
}

// Modificar MealConfig
export interface MealConfig {
  baseName: string
  baseMaterials: CraftMaterial[]
  enchantmentMaterials: Record<number, CraftMaterial[]>
  recipe?: RecipeMetadata   // ← nuevo
}

// Modificar CraftingInputValues
export interface CraftingInputValues {
  stationCost: string
  returnPercent: string
  taxes: string
  premium: boolean
  focus: boolean
  cityBonus: boolean
  craftQuantity: string
  sellingPrice: string      // ← nuevo
}
```

### 5. `scripts/seed.ts`

- Crear tabla `recipe_data` con columnas `meal_id`, `base_focus`, `iv`
- Agregar columnas `per_craft` y `food_type` a tabla `meals`
- Parsear `per_craft` de `crafting.per_craft` en la respuesta API
- Mapear `subcategory.name` → `food_type` usando `SUBCATEGORY_TO_FOOD_TYPE`
- Insertar `base_focus` e `iv` desde el mapa hardcodeado `RECIPE_DATA`

### 6. `api/meals.ts`

- Agregar `food_type` a la query SQL
- Retornar `foodType` en cada MealItem

### 7. `api/meals/[id]/materials.ts`

- Query adicional a `recipe_data` + `meals` para obtener metadata
- Retornar `{ base, enchantment, metadata }` donde metadata contiene `baseFocus`, `iv`, `unitsPerCraft`, `foodType`

### 8. `src/services/mealDbService.ts`

- Actualizar tipo de retorno de `getMealMaterials` para incluir `metadata: RecipeMetadata`

### 9. `src/services/mealService.ts`

- Re-exportar `RecipeMetadata`

### 10. `src/services/configService.ts`

- Agregar `sellingPrice: ''` a `DEFAULT_CRAFTING_INPUTS`

### 11. `src/components/food/CraftingInputs.tsx`

- Agregar input "Precio de venta"
- Mostrar valores calculados: costo/unit, profit/unit, profit/batch, silver/focus
- Nuevas props: `sellingPrice`, `costPerUnit`, `profitPerUnit`, `profitPerBatch`, `silverPerFocus`, `onSellingPriceChange`

### 12. `src/pages/Food.tsx`

- Agregar estados: `sellingPrice`, `recipeMeta`
- Cargar `recipeMeta` de la API al seleccionar comida
- `useMemo` que calcula resultados usando `calcFullRecipe`
- Guardar/cargar `sellingPrice` de config
- Pasar resultados a `CraftingInputs`

---

## Orden de implementación

1. `recipeData.ts` + `foodTypeMapping.ts` (sin dependencias)
2. `craftingCalculator.ts` (depende de types)
3. `types/meal.ts` (extender tipos)
4. `seed.ts` (schema + datos)
5. `api/meals.ts` + `api/meals/[id]/materials.ts` (respuestas)
6. `mealDbService.ts` + `mealService.ts` (client)
7. `configService.ts` (defaults)
8. `CraftingInputs.tsx` (UI)
9. `Food.tsx` (conexión final)

---

## Verificación

```sh
npm run build   # typecheck + vite build debe pasar
npm run lint    # eslint sin errores
vercel dev      # seleccionar comida → ingresar precios → ver resultados calculados
```

---

## Fórmulas del Excel (resumen rápido)

```
taxes = premium ? 0.065 : 0.105

totalReturn = (cityBonus ? 0.15 : 0) + (focus ? 0.59 : 0) + 0.18
returnRate = totalReturn / (1 + totalReturn)

focusFactor = 0.5 ^ ((2.8 * specPrincipal + 0.3 * sum(specsResto)) / 100)
focusPerUnit = baseFocus * focusFactor

stationCommission = 0.1125 * iv * stationCost * unitsPerCraft / 100

materialCost = Σ(price[i] * qty[i])
costPerUnit = (materialCost * (1 - returnRate) + stationCommission + specialCost) / unitsPerCraft

profitPerUnit = sellingPrice - (sellingPrice * taxes) - costPerUnit
profitPerBatch = profitPerUnit * unitsPerCraft
silverPerFocus = profitPerUnit / focusPerUnit
totalFocus = unitsPerCraft * focusPerUnit
```
