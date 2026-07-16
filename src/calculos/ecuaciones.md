# Ecuaciones de Cocina — Albion Online

Fuente: Excel "Cocina 1.3 (Dave Okey YT)"
Traducción de fórmulas Excel a pseudocódigo para implementación en TypeScript.

---

## 1. Variables de entrada (Configuración del usuario)

### 1.1 Specs / Especializaciones (0–100 cada una)

| Variable | Descripción | Excel ref |
|----------|-------------|-----------|
| `specCocinero` | Nivel de Cocinero | Cocina!E8 |
| `specCarniceria` | Nivel de Carniceria | Cocina!E9 |
| `specIngredientes` | Nivel de Ingredientes | Cocina!E10 |
| `specBocadillos` | Nivel de Bocadillos | Cocina!E11 |
| `specGuisos` | Nivel de Guisos | Cocina!E12 |
| `specTortillas` | Nivel de Tortillas | Cocina!H8 |
| `specEnsaladas` | Nivel de Ensaladas | Cocina!H9 |
| `specPasteles` | Nivel de Pasteles | Cocina!H10 |
| `specAsados` | Nivel de Asados | Cocina!H11 |
| `specSopas` | Nivel de Sopas | Cocina!H12 |

### 1.2 Configuración general

| Variable | Descripción | Valores | Excel ref |
|----------|-------------|---------|-----------|
| `premium` | Cuenta premium activa | boolean | Cocina!N12 |
| `focus` | Uso de foco activado | boolean | Cocina!N13 |
| `cityBonus` | Bono de ciudad activado | boolean | Cocina!N14 |
| `stationCost` | Costo de la estación de crafteo | number (silver) | Cocina!P12 |

### 1.3 Precios de materiales (input del usuario)

| Variable | Descripción |
|----------|-------------|
| `pricePerUnit[materialName]` | Precio por unidad de cada material (Lista de Precios) |
| `sellingPrice[mealName]` | Precio de venta del plato terminado |

---

## 2. Parámetros derivados de configuración

### 2.1 Tasa de impuestos

```
taxes = premium ? 0.065 : 0.105
```

- Premium: 6.5%
- No premium: 10.5%

Excel: `Cocina!P14 = IF(N12, 0.065, 0.105)`

### 2.2 Retorno de recursos (resource return rate)

```
cityBonusRate    = cityBonus ? 0.15 : 0
focusBonusRate   = focus ? 0.59 : 0
baseReturnRate   = 0.18

totalReturn = cityBonusRate + focusBonusRate + baseReturnRate

returnRate = totalReturn / (1 + totalReturn)
```

**Equivalente Excel**: `Calculos!G5 = (1 - 100 / (100 + (SUM(G2:G4) * 100)))`

Donde:
- G2 = cityBonusRate (0.15 si activo, 0 si no)
- G3 = focusBonusRate (0.59 si activo, 0 si no)
- G4 = 0.18 (base return, fijo)

**Simplificación matemática**: `1 - 100/(100 + x*100) = 1 - 1/(1+x) = x/(1+x)`

---

## 3. Factor de eficiencia de foco (Focus Efficiency Factor)

Cada tipo de plato tiene una categoría de especialización principal. El factor se calcula como:

```
focusFactor = 0.5 ^ ((2.8 * specPrincipal + 0.3 * sum(specsResto)) / 100)
```

Donde:
- `specPrincipal` = la spec de la categoría del plato
- `specsResto` = suma de las otras 9 specs

### Mapeo de categorías

| Categoría (Tipo) | Spec principal | Variable | Excel |
|-------------------|----------------|----------|-------|
| Carniceria | specCarniceria | E9 | Recetas!U13 |
| Ingredientes | specIngredientes | E10 | Recetas!U14 |
| Bocadillos | specBocadillos | E11 | Recetas!U15 |
| Guisos | specGuisos | E12 | Recetas!U16 |
| Tortillas | specTortillas | H8 | Recetas!U17 |
| Ensaladas | specEnsaladas | H9 | Recetas!U18 |
| Pasteles | specPasteles | H10 | Recetas!U19 |
| Asados | specAsados | H11 | Recetas!U20 |
| Sopas | specSopas | H12 | Recetas!U21 |

### Ejemplo concreto (Carniceria, specs del Excel)

```
specPrincipal = specCarniceria = 100
specsResto = 100 + 51 + 100 + 100 + 100 + 77 + 77 + 100 + 100 = 805

focusFactor = 0.5 ^ ((2.8 * 100 + 0.3 * 805) / 100)
            = 0.5 ^ ((280 + 241.5) / 100)
            = 0.5 ^ 5.215
            ≈ 0.02673
```

---

## 4. Foco por unidad (Focus per Unit)

```
focusPerUnit = baseFocus * focusFactor
```

Donde:
- `baseFocus` = foco base de la receta (columna B en Recetas, campo `Base Focus`)
- `focusFactor` = calculado en el paso 3

Excel: `Calculos!V21 = VLOOKUP($B20, Recetas!$A$2:$Q$90, 2, 0) * VLOOKUP(tipo, Recetas!$T$2:$U$10, 2, 0)`

---

## 5. Comisión de estación (Station Commission)

```
stationCommission = 0.1125 * ivValue * (stationCost / 10) / (10 / unitsPerCraft)
```

Simplificado:
```
stationCommission = 0.1125 * ivValue * stationCost / 100
```

Donde:
- `ivValue` = valor IV de la receta (columna Q en Recetas)
- `stationCost` = costo de estación del usuario
- `unitsPerCraft` = unidades producidas por crafteo (columna O en Recetas, "Unidades")

Excel: `Calculos!X21 = 0.1125 * VLOOKUP($B20, Recetas!$A$2:$Q$90, 17, 0) * (Cocina!$P$12/10) / (10 / VLOOKUP($B20, Recetas!$A$2:$Q$90, 15, 0))`

---

## 6. Costo por unidad (Cost per Unit)

### 6.1 Costo total de materiales

```
materialCost = Σ (pricePerUnit[i] * quantity[i])   para i = 1..4 (ingredientes regulares)
             + pricePerUnit[sauce] * quantity[sauce]  (si aplica)
```

Los ingredientes son:
- Ingrediente 1 (C/D en Recetas: nombre/cantidad)
- Ingrediente 2 (E/F en Recetas)
- Ingrediente 3 (G/H en Recetas)
- Ingrediente 4 (I/J en Recetas, puede estar vacío)
- Salsa (M/N en Recetas, puede estar vacío)

### 6.2 Costo del ingrediente especial

```
specialCost = pricePerUnit[specialIngredient] * quantitySpecial
```

Donde el ingrediente especial es la "Energía Ava." (columna K/L en Recetas, puede estar vacío).

### 6.3 Fórmula final de costo por unidad

```
costPerUnit = (materialCost * (1 - returnRate) + stationCommission + specialCost) / unitsPerCraft
```

Donde:
- `materialCost * (1 - returnRate)` = costo neto de materiales después del retorno de recursos
- `stationCommission` = comisión de la estación
- `specialCost` = costo del ingrediente especial (energía)
- `unitsPerCraft` = unidades producidas por crafteo

Excel: `Calculos!D21 = ((((J21*K21)+(L21*M21)+(N21*O21)+(P21*Q21)+(R21*S21))*(1-$G$5))+X21+(T21*U21))/W21`

---

## 7. Cálculos de profit (Ganancias)

### 7.1 Profit por unidad

```
taxAmount      = sellingPrice * taxes
profitPerUnit  = sellingPrice - taxAmount - costPerUnit
```

Excel: `Calculos!F21 = E21 - (E21 * G$6) - D21`

Donde:
- E21 = precio de venta
- G$6 = tasa de impuestos (Cocina!P14)
- D21 = costo por unidad

### 7.2 Profit por bache (lote completo)

```
profitPerBatch = profitPerUnit * unitsPerCraft
```

Excel: `Calculos!G21 = (F21 * W21) / V21 * I21`

**Nota**: La fórmula Excel es equivalente a `profitPerUnit * unitsPerCraft` pero dividido y multiplicado por foco (para mostrar también silver/focus).

### 7.3 Silver por Focus (eficiencia de foco)

```
totalFocus     = craftQuantity * focusPerUnit
silverPerFocus = profitPerBatch / totalFocus
```

Simplificado:
```
silverPerFocus = (profitPerUnit * craftQuantity * unitsPerCraft) / (craftQuantity * focusPerUnit)
               = (profitPerUnit * unitsPerCraft) / focusPerUnit
```

Excel: `Calculos!H21 = (F21 * W21) / V21`

### 7.4 Foco total utilizado

```
totalFocus = unitsPerCraft * focusPerUnit
```

Excel: `Calculos!I21 = A20 * V21`

---

## 8. Calculos para cada nivel de encantamiento

El Excel calcula 4 variantes por comida: base (.0), .1, .2, .3.

Cada variante usa la misma fórmula pero con:
- **Materiales diferentes**: materiales base + materiales de encantamiento
- **Cantidad de crafteo diferente**: multiplicador de unidades por nivel
- **Mismo factor de foco**: la categoría determina el factor, no el encantamiento

### Estructura de filas en Calculos

| Fila | Variante | Unidades multiplier |
|------|----------|---------------------|
| 20-21 | Base (.0) | Cocina!K20 |
| 22-23 | .1 | Cocina!K23 (ej: 45) |
| 24-25 | .2 | Cocina!K26 (ej: 24) |
| 26-27 | .3 | Cocina!K29 |

### Materiales por encantamiento

Los materiales de encantamiento se suman a los base:

```
totalMaterials[i] = baseMaterial[i].quantity + enchantmentMaterials[level][i].quantity
```

---

## 9. Lista de compras (Shopping List)

### 9.1 Cantidad total por material

```
totalQuantity[material] = Σ (quantityPerCraft[i] * batchMultiplier[i])   para cada variante i (.0, .1, .2, .3)
```

### 9.2 Cantidad neta (con retorno de recursos)

```
netQuantity[material] = totalQuantity[material] * (1 - returnRate)
```

Excel: `Cocina!F21 = Calculos!K28 * (1 - P13)`

### 9.3 Costo total del material

```
totalMaterialCost[material] = netQuantity[material] * pricePerUnit[material]
```

### 9.4 Inversión total

```
totalInvestment = Σ totalMaterialCost[material] + totalStationCommission
```

---

## 10. Power Level Study (Coste de estudio)

### 10.1 Costo de estudio por crafteo

```
studyCost = ROUNDDOWN((0.1125 * famePerCraft * (stationCost / 10)) / 10, 0)
```

Donde:
- `famePerCraft` = fama obtenida por crafteo (Recetas!T column para cada receta)
- `stationCost` = costo de estación

Excel: `Power Level Study!J = ROUNDDOWN((0.1125 * Recetas!T * ($C$5/10)) / 10, 0)`

### 10.2 Plata por fama

```
silverPerFame = (pricePerUnit + studyCost) / famePerCraft
```

Excel: `Power Level Study!K = (I + J) / Recetas!S`

### 10.3 Fama restante para nivel meta

```
fameNeeded = cumulativeFame[metaLevel] - cumulativeFame[currentLevel] - currentFame
```

Excel: `Recetas!U = IF(INDEX(X, metaLevel) - INDEX(X, currentLevel) - currentFame < 0, 0, ...)`

### 10.4 Costo total para alcanzar nivel

```
totalLevelUpCost = (pricePerUnit + studyCost) * (fameRemaining / famePerCraft)
```

Excel: `Power Level Study!M = (I + J) * L`

---

## 11. Fama acumulada (Cumulative Fame)

La columna X en Recetas es la suma acumulada de la columna W (fama base por crafteo):

```
cumulativeFame[1] = famePerCraft[1]
cumulativeFame[n] = famePerCraft[n] + cumulativeFame[n-1]
```

Excel:
- `Recetas!X2 = W2`
- `Recetas!X3 = W3 + X2`
- `Recetas!X4 = W4 + X3`
- ...

---

## 12. Tabla de referencia: Mapeo Tipo → Categoría de foco

Cada receta en la columna R de Recetas indica su tipo. Este tipo se usa para buscar el focusFactor en la tabla T/U de Recetas:

| Tipo (columna R) | focusFactor ref |
|-------------------|-----------------|
| Sopas | Recetas!U21 |
| Ensaladas | Recetas!U18 |
| Pasteles | Recetas!U19 |
| Tortillas | Recetas!U17 |
| Asados | Recetas!U20 |
| Guisos | Recetas!U16 |
| Bocadillos | Recetas!U15 |
| Carniceria* | Recetas!U13 |
| Ingredientes* | Recetas!U14 |

*Carniceria e Ingredientes son categorías de materiales, no de platos terminados.

---

## 13. Resumen de fórmulas para implementar

```typescript
// 1. Impuestos
const taxes = premium ? 0.065 : 0.105

// 2. Retorno de recursos
const totalReturn = (cityBonus ? 0.15 : 0) + (focus ? 0.59 : 0) + 0.18
const returnRate = totalReturn / (1 + totalReturn)

// 3. Factor de foco
const focusFactor = Math.pow(0.5, (2.8 * specPrincipal + 0.3 * sumSpecsResto) / 100)

// 4. Foco por unidad
const focusPerUnit = baseFocus * focusFactor

// 5. Comisión de estación
const stationCommission = 0.1125 * ivValue * stationCost * unitsPerCraft / 100

// 6. Costo por unidad
const materialCost = materials.reduce((sum, m) => sum + m.price * m.qty, 0)
const specialCost = special ? special.price * special.qty : 0
const costPerUnit = (materialCost * (1 - returnRate) + stationCommission + specialCost) / unitsPerCraft

// 7. Profit
const profitPerUnit = sellingPrice - (sellingPrice * taxes) - costPerUnit
const profitPerBatch = profitPerUnit * unitsPerCraft

// 8. Silver per Focus
const totalFocus = unitsPerCraft * focusPerUnit
const silverPerFocus = profitPerBatch / totalFocus

// 9. Costo de estudio
const studyCost = Math.floor((0.1125 * fame * (stationCost / 10)) / 10)

// 10. Fama acumulada
const cumulativeFame = fameArray.reduce((acc, f) => [...acc, (acc.length ? acc[acc.length-1] : 0) + f], [])
```

---

## 14. Constantes fijas del juego

| Constante | Valor | Descripción |
|-----------|-------|-------------|
| `baseReturnRate` | 0.18 | Retorno base de recursos (18%) |
| `cityBonusRate` | 0.15 | Bono de ciudad (15%) |
| `focusBonusRate` | 0.59 | Bono de foco (59%) |
| `stationFeeRate` | 0.1125 | Tasa base de comisión de estación |
| `taxPremium` | 0.065 | Impuesto con premium (6.5%) |
| `taxNormal` | 0.105 | Impuesto sin premium (10.5%) |
| `focusFactorBase` | 0.5 | Base del exponente de eficiencia de foco |
| `focusFactorMainSpec` | 2.8 | Peso de la spec principal |
| `focusFactorOtherSpec` | 0.3 | Peso de cada spec secundaria |
