# Plan — Power Leveling de Cocina (Futuro)

## Objetivo

Calcular el costo de estudiar (power-level) cada receta de cocina hasta un nivel meta, incluyendo el cálculo de fama necesaria, costo de estudio y costo total.

**Estado**: Pendiente — no se implementará por ahora. Este documento sirve como referencia para futura implementación.

---

## Datos necesarios (adicionales a la calculadora)

| Campo | Fuente | API OpenAlbion | Acción |
|-------|--------|----------------|--------|
| `fame` (fama por crafteo) | No | **No** | Hardcodear desde Excel |
| `cumulativeFame` (fama acumulada por nivel) | No | **No** | Calcular desde fame array |
| `currentLevel` (nivel actual de la spec) | No | N/A | Input del usuario |
| `metaLevel` (nivel objetivo) | No | N/A | Input del usuario |
| `currentFame` (fama actual) | No | N/A | Input del usuario |

### Fuentes de datos del Excel

- **Columna P en Recetas**: Fama por crafteo de cada receta
- **Columna W en Recetas**: Fama base por crafteo (misma que P para recetas sin salsa)
- **Columna X en Recetas**: Fama acumulada (suma de W hasta ese punto)
- **Hoja Power Level Study**: Cálculos de costo de estudio por receta

---

## Fórmulas del Excel (Power Level Study)

### 1. Costo de estudio por crafteo

```
studyCost = floor((0.1125 * famePerCraft * (stationCost / 10)) / 10)
```

Donde:
- `famePerCraft` = fama obtenida por crafteo (columna P en Recetas)
- `stationCost` = costo de estación del usuario

Excel: `Power Level Study!J = ROUNDDOWN((0.1125 * Recetas!T * ($C$5/10)) / 10, 0)`

### 2. Plata por fama

```
silverPerFame = (pricePerUnit + studyCost) / famePerCraft
```

Excel: `Power Level Study!K = (I + J) / Recetas!S`

### 3. Fama acumulada

```
cumulativeFame[1] = famePerCraft[1]
cumulativeFame[n] = famePerCraft[n] + cumulativeFame[n-1]
```

Excel: `Recetas!X2 = W2`, `Recetas!X3 = W3 + X2`, etc.

### 4. Fama restante para nivel meta

```
fameNeeded = cumulativeFame[metaLevel] - cumulativeFame[currentLevel] - currentFame
```

Si el resultado es negativo → 0 (ya alcanzado).

Excel: `Recetas!U = IF(INDEX(X, metaLevel) - INDEX(X, currentLevel) - currentFame < 0, 0, ...)`

### 5. Crafteos restantes

```
craftsRemaining = fameNeeded / famePerCraft
```

### 6. Costo total para alcanzar nivel

```
totalLevelUpCost = (pricePerUnit + studyCost) * craftsRemaining
```

Excel: `Power Level Study!M = (I + J) * L`

---

## Mapeo de recetas del Power Level Study

El Excel enumera las recetas en orden de dificultad de level-up:

| # | Receta | Tipo | famePerCraft | studyCost |
|---|--------|------|-------------|-----------|
| 1 | Sopa de Zanahorias | Sopas | bajo | bajo |
| 2 | Ensalada de Frijoles | Ensaladas | bajo | bajo |
| 3 | Sopa de Trigo | Sopas | medio | medio |
| 4 | Pastel de Pollo | Pasteles | bajo | bajo |
| 5 | Tortilla de Pollo | Tortillas | bajo | bajo |
| 6 | Pollo Asado | Asados | bajo | bajo |
| 7 | Ensalada de Rábanos | Ensaladas | medio | medio |
| 8 | Guiso de Cabra | Guisos | bajo | bajo |
| 9 | Bocadillo de Cabra | Bocadillos | bajo | bajo |
| 10 | Sopa de Col | Sopas | alto | alto |
| 11 | Pastel de Ganso | Pasteles | medio | medio |
| 12 | Tortilla de Ganso | Tortillas | medio | medio |
| 13 | Ganso Asado | Asados | medio | medio |
| 14 | Ensalada de Patatas | Ensaladas | alto | alto |
| 15 | Ensalada de Kraken | Ensaladas | muy alto | muy alto |
| 16 | Guiso de Carnero | Guisos | medio | medio |
| 17 | Bocadillo de Carnero | Bocadillos | medio | medio |
| 18 | Pastel de Cerdo | Pasteles | alto | alto |
| 19 | Tortilla de Cerdo | Tortillas | alto | alto |
| 20 | Cerdo Asado | Asados | alto | alto |
| 21 | Guiso de Ternera | Guisos | alto | alto |
| 22 | Guiso de Anguila | Guisos | muy alto | muy alto |
| 23 | Bocadillo de Ternera | Bocadillos | alto | alto |
| 24 | Bocadillo de Locha | Bocadillos | muy alto | muy alto |
| 25 | Pan (Bread) | Bocadillos | bajo | bajo |

---

## Datos hardcodeados del Excel

### Fama por receta (columna P en Recetas)

```typescript
export const RECIPE_FAME: Record<string, number> = {
  T1_MEAL_SOUP: 480,           // Sopa de Zanahorias
  T2_MEAL_SALAD: 480,          // Ensalada de Frijoles
  T3_MEAL_SOUP: 1440,          // Sopa de Trigo
  T3_MEAL_PIE: 180,            // Pastel de Pollo
  T3_MEAL_OMELETTE: 180,       // Tortilla de Pollo
  T3_MEAL_ROAST: 480,          // Pollo Asado
  T4_MEAL_SALAD: 1440,         // Ensalada de Rábanos
  T4_MEAL_STEW: 480,           // Guiso de Cabra
  T4_MEAL_SANDWICH: 420,       // Bocadillo de Cabra
  T5_MEAL_SOUP: 4320,          // Sopa de Col
  T5_MEAL_PIE: 720,            // Pastel de Ganso
  T5_MEAL_OMELETTE: 1260,      // Tortilla de Ganso
  T5_MEAL_ROAST: 1440,         // Ganso Asado
  T6_MEAL_SALAD: 4320,         // Ensalada de Patatas
  T6_MEAL_SALAD_FISH: 360,     // Ensalada de Kraken
  T6_MEAL_STEW: 1440,          // Guiso de Carnero
  T6_MEAL_SANDWICH: 1260,      // Bocadillo de Carnero
  T7_MEAL_PIE: 4320,           // Pastel de Cerdo
  T7_MEAL_OMELETTE: 3780,      // Tortilla de Cerdo
  T7_MEAL_ROAST: 4320,         // Cerdo Asado
  T7_MEAL_PIE_FISH: 750,       // Pastel de Ojo Muerto
  T7_MEAL_OMELETTE_FISH: 540,  // Tortilla de Cangrejo
  T7_MEAL_ROAST_FISH: 4320,    // Cerdo Asado (pescado)
  T8_MEAL_STEW: 4320,          // Guiso de Ternera
  T8_MEAL_SANDWICH: 4320,      // Bocadillo de Ternera
  // ... etc
}
```

### Fama acumulada (columna X en Recetas)

Se calcula automáticamente ordenando las recetas por su posición en la tabla del Excel y sumando las famas de forma acumulada.

```typescript
// Posiciones en el Excel (columna V = índice)
// X[n] = X[n-1] + W[n]
```

---

## UI propuesta

### Nueva pestaña o sección: "Power Level Study"

```
┌─────────────────────────────────────────────┐
│  POWER LEVEL DE COCINA                      │
│                                             │
│  Estacion: [input]    Nivel actual: [input] │
│  Meta nivel: [input]  Fama actual:  [input] │
│                                             │
│  ┌─────────────────────────────────────────┐│
│  │ # │ Receta          │ Precio │ Costo   ││
│  │   │                 │        │ Estudio ││
│  │ 1 │ Sopa Zanahorias │  200   │   24    ││
│  │ 2 │ Ensalada Frijoles│ 426   │   24    ││
│  │ ...                                     ││
│  ├─────────────────────────────────────────┤│
│  │ Total: 5,747,018 silver                 ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

### Datos a mostrar por fila

- Nombre de la receta
- Precio de venta (input del usuario)
- Costo de estudio por crafteo
- Plata/Fama
- Fama restante
- Costo total para alcanzar nivel

---

## Orden de implementación (futuro)

1. Crear `src/calculos/powerLevelCalculator.ts` — funciones de cálculo
2. Crear `src/calculos/recipeData.ts` — agregar `fame` al mapa de datos
3. Crear componente `PowerLevelStudy.tsx` — UI de la tabla
4. Agregar ruta `/power-level` en `App.tsx`
5. Integrar con la configuración existente (spects, stationCost)

---

## Dependencias

- **Plan Calculadora** (implementado primero): necesita `recipeData.ts`, `foodTypeMapping.ts`, `craftingCalculator.ts`
- **Tipos extendidos**: `RecipeMetadata` con `fame` adicional

---

## Notas

- El Excel usa la columna T en las filas 34+ de Recetas como "fame per craft" para el Power Level Study, que es diferente de la columna P (fama del plato). Parece ser la fama de la receta base sin salsa.
- El costo de estudio se calcula como `0.1125 * fame * stationCost / 100`, que es la misma fórmula que la comisión de estación pero redondeada.
- Las recetas de pescado (fish) tienen `per_craft: 1` en vez de 10, lo que afecta significativamente los cálculos.
