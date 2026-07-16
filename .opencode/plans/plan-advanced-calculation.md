# Plan — Cálculo Avanzado/Profundo para Calculadora de Crafteo

## Objetivo

Agregar un modo de cálculo avanzado que permita al usuario analizar la viabilidad económica de vender comida en múltiples ciudades de Albion Online, considerando cuota de mercado, precios por ciudad y distribución de ventas.

---

## Requisitos del usuario

1. Toggle switch para cambiar entre cálculo básico (actual) y avanzado (nuevo)
2. El cálculo profundo incluirá:
   - Inputs para cantidad de comida vendida por día en cada ciudad (Martlock, Bridgewatch, Lymhurst, Fort Sterling, Thetford)
   - Inputs para valor de venta en cada ciudad
   - Check para seleccionar ciudades donde se vende
   - Input para cuota de mercado (default 5%)
   - Ver cantidades recomendadas a vender por ciudad
   - Input para cantidad a craftear (igual que básico, es el TOTAL a craftear)
   - Toggle para ver estadísticas según cuota de mercado
   - Desglose por ciudad de ganancias
3. UI: cuando está en profundo, cantidad a craftear y materiales necesarios se separan (uno debajo del otro)
4. El recuento final reflejará información de ciudades, cuota, precio, etc.
5. **Distribución de cantidad**: la cantidad total se reparte proporcionalmente según las ventas diarias de cada ciudad habilitada
6. **Persistencia**: la configuración de ciudades se guarda en localStorage junto con los demás datos
7. **Formato de resultados**: lista compacta por ciudad

---

## Decisiones tomadas (usuario)

| Pregunta | Respuesta |
|----------|-----------|
| Tipo de toggle | Toggle switch (interruptor on/off) |
| Distribución de cantidad | Proporcional a ventas diarias de cada ciudad |
| Persistencia | Guardar en localStorage |
| Formato de resultados | Lista compacta (una línea por ciudad) |
| Cantidad a craftear | Es el TOTAL a craftear (se distribuye entre ciudades) |

---

## Estructura de datos propuesta

### Constantes

```typescript
const CITIES = ['Martlock', 'Bridgewatch', 'Lymhurst', 'Fort Sterling', 'Thetford'] as const
type City = typeof CITIES[number]
const DEFAULT_MARKET_SHARE = 0.05 // 5%
```

### Interface CityData

```typescript
interface CityData {
  dailySales: number      // Cantidad vendida por día en esta ciudad
  sellingPrice: number    // Precio de venta en esta ciudad
  enabled: boolean        // Si se vende en esta ciudad
}
```

### Interface AdvancedCalculationInput

```typescript
interface AdvancedCalculationInput {
  // Datos base (compartidos con modo básico)
  materials: CraftMaterial[]
  spects: Record<string, number>
  premium: boolean
  focus: boolean
  cityBonus: boolean
  stationCost: number
  foodType: string
  baseFocus: number
  iv: number
  unitsPerCraft: number
  craftQuantity: number
  
  // Datos específicos del modo avanzado
  cities: Record<City, CityData>
  marketSharePercent: number  // Porcentaje de cuota (0-100)
  followRecommendation: boolean  // Toggle para seguir recomendación
}
```

### Interface CityResult

```typescript
interface CityResult {
  city: City
  dailySales: number
  sellingPrice: number
  enabled: boolean
  recommendedQuantity: number  // Cuota de mercado en unidades
  actualQuantity: number       // Cantidad que se venderá (min(recommended, available))
  revenuePerUnit: number       // Precio - impuestos
  profitPerUnit: number        // revenuePerUnit - costPerUnit
  totalProfit: number          // profitPerUnit * actualQuantity
}
```

### Interface AdvancedCalculationResult

```typescript
interface AdvancedCalculationResult {
  // Datos base (similares al modo básico pero promediados ponderados)
  costPerUnit: number
  profitPerUnit: number
  profitPerBatch: number
  silverPerFocus: number
  totalFocus: number
  returnRate: number
  taxes: number
  stationCommission: number
  numberOfCrafts: number
  
  // Datos específicos del modo avanzado
  cityResults: CityResult[]
  totalDailyRevenue: number
  totalDailyProfit: number
  averageSellingPrice: number  // Promedio ponderado por ventas
  marketSharePercent: number
}
```

---

## Archivos a crear

### 1. `src/calculos/advancedCalculator.ts`

Motor de cálculo para el modo avanzado.

```typescript
import type { CraftMaterial } from '../types/meal'
import { calcReturnRate, calcTaxes, calcFocusFactor, calcFocusPerUnit, calcStationCommission, calcMaterialCost, calcCostPerUnit } from './craftingCalculator'

export const CITIES = ['Martlock', 'Bridgewatch', 'Lymhurst', 'Fort Sterling', 'Thetford'] as const
export type City = typeof CITIES[number]
export const DEFAULT_MARKET_SHARE = 5

export interface CityData {
  dailySales: number
  sellingPrice: number
  enabled: boolean
}

export interface AdvancedCalculationInput {
  materials: CraftMaterial[]
  spects: Record<string, number>
  premium: boolean
  focus: boolean
  cityBonus: boolean
  stationCost: number
  foodType: string
  baseFocus: number
  iv: number
  unitsPerCraft: number
  craftQuantity: number
  cities: Record<City, CityData>
  marketSharePercent: number
  followRecommendation: boolean
}

export interface CityResult {
  city: City
  dailySales: number
  sellingPrice: number
  enabled: boolean
  recommendedQuantity: number
  actualQuantity: number
  revenuePerUnit: number
  profitPerUnit: number
  totalProfit: number
}

export interface AdvancedCalculationResult {
  costPerUnit: number
  profitPerUnit: number
  profitPerBatch: number
  silverPerFocus: number
  totalFocus: number
  returnRate: number
  taxes: number
  stationCommission: number
  numberOfCrafts: number
  cityResults: CityResult[]
  totalProfit: number
  averageSellingPrice: number
  marketSharePercent: number
}

export function calcAdvancedRecipe(input: AdvancedCalculationInput): AdvancedCalculationResult {
  // 1. Calcular costos base (iguales al modo básico)
  const taxes = calcTaxes(input.premium)
  const returnRate = calcReturnRate(input.cityBonus, input.focus)
  // ... (reutilizar funciones existentes)
  
  // 2. Para cada ciudad habilitada:
  //    - Calcular cuota de mercado: dailySales * marketSharePercent / 100
  //    - Calcular profit por unidad: sellingPrice * (1 - taxes) - costPerUnit
  //    - Calcular profit total para esa ciudad
  
  // 3. Calcular métricas agregadas:
  //    - Promedio ponderado de precios de venta
  //    - Profit total diario
  
  return result
}
```

### 2. `src/components/food/AdvancedCalculationPanel.tsx`

Panel de UI unificado para el modo avanzado. Flujo:
1. Configuración de ciudades + cantidades recomendadas (arriba)
2. Input de cantidad a craftear (medio)
3. Resultados calculados (abajo)

```typescript
interface Props {
  cities: Record<City, CityData>
  marketSharePercent: number
  followRecommendation: boolean
  cityResults: CityResult[]
  totalProfit: number
  averageSellingPrice: number
  costPerUnit: number
  profitPerUnit: number
  silverPerFocus: number
  totalFocus: number
  hasFocusData: boolean
  craftQuantity: string
  unitsPerCraft: number
  onCityChange: (city: City, data: CityData) => void
  onMarketShareChange: (percent: number) => void
  onFollowRecommendationChange: (follow: boolean) => void
  onCraftQuantityChange: (value: string) => void
}

// Componente que renderiza:
// - Cuota de mercado + toggle "Seguir recomendación"
// - Por cada ciudad:
//   - Nombre + toggle enable/disable
//   - Inputs de ventas diarias y precio (SIEMPRE visibles)
//   - Cantidad recomendada (calculada según cuota)
// - Input de cantidad a craftear
// - Profit total + Precio promedio
// - Foco total, Costo/unidad, Profit/unidad, Silver/focus
```

---

## Archivos a modificar

### 3. `src/types/meal.ts`

Agregar nuevas interfaces:

```typescript
export type CalculationMode = 'basic' | 'advanced'

export interface CraftingInputValues {
  stationCost: string
  premium: boolean
  focus: boolean
  cityBonus: boolean
  craftQuantity: string
  sellingPrice: string
  calculationMode: CalculationMode  // ← nuevo
}
```

### 4. `src/components/food/CraftingInputs.tsx`

- Agregar toggle para cambiar entre básico/avanzado
- Recibir `calculationMode` como prop
- Emitir `onCalculationModeChange` callback

### 5. `src/pages/Food.tsx`

- Agregar estado: `calculationMode`, `cityData`, `marketSharePercent`, `followRecommendation`
- Agregar `useMemo` para cálculo avanzado
- Renderizar `AdvancedCalculationPanel` cuando `calculationMode === 'advanced'`
- **Panel unificado**: en modo avanzado, el panel contiene ciudades + resultados + cantidad a craftear
- `sellingPrice` global se elimina del modo avanzado (cada ciudad tiene su propio precio)
- `MaterialsSummary` se mantiene separado fuera del panel unificado

### 6. `src/services/configService.ts`

- Agregar valores por defecto para modo avanzado:
  ```typescript
  calculationMode: 'basic',
  cities: {
    Martlock: { dailySales: 0, sellingPrice: 0, enabled: false },
    Bridgewatch: { dailySales: 0, sellingPrice: 0, enabled: false },
    Lymhurst: { dailySales: 0, sellingPrice: 0, enabled: false },
    'Fort Sterling': { dailySales: 0, sellingPrice: 0, enabled: false },
    Thetford: { dailySales: 0, sellingPrice: 0, enabled: false },
  },
  marketSharePercent: 5,
  followRecommendation: false,
  ```

### 7. `src/calculos/craftingCalculator.ts`

- Exportar funciones individuales para reutilización en `advancedCalculator.ts`

---

## Layout propuesto para modo avanzado

```
┌─────────────────────────────────────────────────────────────────┐
│  Modo: [Básico ═══════════]  ← Toggle switch                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ANÁLISIS POR CIUDAD                                            │
│                                                                 │
│  Cuota de mercado: [5] %                                        │
│  [toggle] Seguir recomendación                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Martlock                          [toggle]                     │
│  Ventas/día: [___]    Precio: [___]                             │
│  Recomendado: 25 uds                                           │
│  ─────────────────────────────────────────────────────────────  │
│  Bridgewatch                       [toggle]                     │
│  Ventas/día: [___]    Precio: [___]                             │
│  Recomendado: 30 uds                                           │
│  ─────────────────────────────────────────────────────────────  │
│  Lymhurst                          [toggle]                     │
│  Ventas/día: [___]    Precio: [___]                             │
│  Recomendado: 20 uds                                           │
│  ─────────────────────────────────────────────────────────────  │
│  Fort Sterling                     [toggle]                     │
│  Ventas/día: [___]    Precio: [___]                             │
│  Recomendado: —                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  Thetford                          [toggle]                     │
│  Ventas/día: [___]    Precio: [___]                             │
│  Recomendado: 15 uds                                           │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  CANTIDAD A CRAFTEAR                                            │
│  Cantidad: [___] 1×10                                           │
│  ─────────────────────────────────────────────────────────────  │
│  Profit total: 39550 silver                                     │
│  Precio promedio: 1190 silver                                   │
│  Foco total: 1234                                               │
│  Costo / unidad: 1234 silver                                    │
│  Profit / unidad: 567 silver                                    │
│  Silver / focus: 4.6                                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  MATERIALES NECESARIOS                                          │
│  Material │ Cant x craft │ Precio │ Cant necesaria │ Subtotal   │
│  ...      │ ...          │ ...    │ ...            │ ...        │
└─────────────────────────────────────────────────────────────────┘
```

**Flujo de datos:**
1. Configuración de ciudades → se muestran cantidades recomendadas (uds)
2. Input de cantidad a craftear → se calculan resultados
3. Resultados: profit total (según cantidad), precio promedio, métricas

**Nota:** El `profit total` depende de la cantidad a craftear. Si "Seguir recomendación" está activo, se usa la cantidad recomendada total.

---

## Orden de implementación

1. **Tipos**: `src/types/meal.ts` — agregar `CalculationMode` y actualizar `CraftingInputValues`
2. **Cálculo**: `src/calculos/advancedCalculator.ts` — crear motor de cálculo avanzado
3. **Config defaults**: `src/services/configService.ts` — agregar defaults para modo avanzado
4. **Componente panel**: `src/components/food/AdvancedCalculationPanel.tsx` — UI del panel de ciudades
5. **CraftingInputs**: `src/components/food/CraftingInputs.tsx` — agregar toggle de modo
6. **Food.tsx**: `src/pages/Food.tsx` — integrar estado y lógica del modo avanzado
7. **Verificación**: `npm run build` + `npm run lint`

---

## Fórmulas del modo avanzado

```
// Distribución proporcional de cantidad total:
totalDailySales = Σ(dailySales[i] para ciudades habilitadas)
for each city enabled:
  proportion = dailySales[i] / totalDailySales
  cityQuantity = craftQuantity * proportion

// Cuota de mercado (por ciudad):
recommendedQuantity = dailySales[i] * marketSharePercent / 100
actualQuantity = followRecommendation ? recommendedQuantity : cityQuantity

// Cálculos por ciudad:
revenuePerUnit = sellingPrice * (1 - taxes)
profitPerUnit = revenuePerUnit - costPerUnit
totalProfit = profitPerUnit * actualQuantity

// Métricas agregadas:
totalDailyProfit = Σ(cityResults[i].totalProfit)
averageSellingPrice = Σ(sellingPrice[i] * actualQuantity[i]) / Σ(actualQuantity[i])
```

---

## Verificación

```sh
npm run build   # typecheck + vite build debe pasar
npm run lint    # eslint sin errores
vercel dev      # seleccionar comida → modo avanzado → configurar ciudades → ver resultados
```

---

## Notas de implementación

- Reutilizar funciones existentes de `craftingCalculator.ts` para costos base
- El modo avanzado no modifica el cálculo de costos, solo agrega análisis de mercado
- **Persistencia**: configuración de ciudades se guarda en localStorage junto con otros datos
- **Distribución**: la cantidad total se reparte proporcionalmente según ventas diarias de cada ciudad habilitada
- El toggle "Seguir recomendación" controla si se usa la cuota calculada o la distribución proporcional
- **Inputs siempre visibles**: dailySales y sellingPrice se muestran independientemente del toggle enabled
- **Panel unificado**: en modo avanzado, ciudades + resultados + cantidad a craftear van en un solo panel
- **Sin revenue diario**: se eliminó "Revenue diario total" — solo se muestra "Profit total"
- **Flujo**: cantidades recomendadas → input cantidad → resultados calculados
- **Profit total**: depende de la cantidad a craftear (o recomendada si "Seguir recomendación" está activo)
- **Formato tabla**: ciudades se muestran en formato vertical (ciudad → toggle → inputs → recomendado)
