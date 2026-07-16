# Plan: UI compacto de ciudades + fix cantidad recomendada

## Problemas

### 1. Cantidad recomendada no usa marketSharePercent
**Archivo:** `src/calculos/advancedCalculator.ts:91-92`

Fórmula actual:
```typescript
recommendedQuantity = Math.floor((data.dailySales / totalDailySales) * input.craftQuantity * input.unitsPerCraft)
```

Fórmula correcta:
```typescript
recommendedQuantity = Math.floor(data.dailySales * input.marketSharePercent / 100)
```

La cuota de mercado es independiente de la cantidad a craftear. Ejemplo: 500 ventas/día × 5% = 25 unidades.

### 2. UI vertical, necesita grid compacto
**Archivo:** `src/components/food/AdvancedCalculationPanel.tsx`

Actualmente las 5 ciudades se apilan verticalmente. El usuario quiere un grid de 2-3 columnas.

## Cambios

### A. `src/calculos/advancedCalculator.ts`

**Línea 91-92:** Cambiar la fórmula de `recommendedQuantity`:
```typescript
// Antes:
const recommendedQuantity = totalDailySales > 0
  ? Math.floor((data.dailySales / totalDailySales) * input.craftQuantity * input.unitsPerCraft)
  : 0

// Después:
const recommendedQuantity = Math.floor(data.dailySales * input.marketSharePercent / 100)
```

**Líneas 95-97:** `distributedQuantity` se mantiene igual (proporción de craftQuantity).

**Línea 99:** `actualQuantity` se mantiene: `followRecommendation ? recommendedQuantity : distributedQuantity`.

### B. `src/components/food/AdvancedCalculationPanel.tsx`

Reemplazar el layout actual por un grid de ciudades:

**Estructura por ciudad (Card):**
```
┌─────────────────────────────────┐
│ Martlock [toggle]               │
│ Ventas/día    │ Precio          │
│ [input]       │ [input]         │
│ Recomendado: 25 uds             │
└─────────────────────────────────┘
```

**Grid responsive:**
- Mobile: 1 columna
- `md:` (≥768px): 2 columnas
- `lg:` (≥1024px): 3 columnas (5 ciudades: 2 filas, última fila con 2)

**Cambios específicos:**

1. Reemplazar `<div className="space-y-1 mb-4">` (línea 135) por el grid de ciudades
2. La sección de "Cuota de mercado" + "Seguir recomendación" se mantiene arriba del grid
3. Cada `CityRow` se convierte en una card dentro del grid
4. Dentro de cada card: toggle + nombre arriba, inputs en grid 2 columnas, recomendado abajo
5. Los resultados por ciudad se muestran debajo de "Recomendado" (formato compacto inline)

**Resultado por ciudad (debajo de "Recomendado"):**
```
Recomendado: 25 uds
Profit: 12500 silver
```

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/calculos/advancedCalculator.ts` | Fix fórmula recommendedQuantity |
| `src/components/food/AdvancedCalculationPanel.tsx` | Grid 2-3 cols, city cards compactas |

## Verificación
- `npm run build`
- `npm run lint`
