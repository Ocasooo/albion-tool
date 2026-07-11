import type { CraftMaterial } from '../types/meal'

export const RECIPE_DATA: Record<string, { baseFocus: number; iv: number; unitsPerCraft: number }> = {
  // T1
  T1_MEAL_SOUP: { baseFocus: 560, iv: 64, unitsPerCraft: 1 },
  // T2
  T2_MEAL_SALAD: { baseFocus: 560, iv: 64, unitsPerCraft: 1 },
  // T3
  T3_MEAL_SOUP: { baseFocus: 1680, iv: 192, unitsPerCraft: 1 },
  T3_MEAL_PIE: { baseFocus: 530, iv: 56, unitsPerCraft: 1 },
  T3_MEAL_OMELETTE: { baseFocus: 520, iv: 56, unitsPerCraft: 1 },
  T3_MEAL_ROAST: { baseFocus: 580, iv: 64, unitsPerCraft: 1 },
  // T4
  T4_MEAL_SALAD: { baseFocus: 1680, iv: 192, unitsPerCraft: 1 },
  T4_MEAL_STEW: { baseFocus: 610, iv: 64, unitsPerCraft: 1 },
  T4_MEAL_SANDWICH: { baseFocus: 550, iv: 56, unitsPerCraft: 1 },
  // T5
  T5_MEAL_SOUP: { baseFocus: 5040, iv: 576, unitsPerCraft: 1 },
  T5_MEAL_PIE: { baseFocus: 1800, iv: 192, unitsPerCraft: 1 },
  T5_MEAL_OMELETTE: { baseFocus: 1550, iv: 168, unitsPerCraft: 1 },
  T5_MEAL_ROAST: { baseFocus: 1760, iv: 192, unitsPerCraft: 1 },
  // T6
  T6_MEAL_SALAD: { baseFocus: 5040, iv: 576, unitsPerCraft: 1 },
  T6_MEAL_STEW: { baseFocus: 1840, iv: 192, unitsPerCraft: 1 },
  T6_MEAL_SANDWICH: { baseFocus: 1650, iv: 168, unitsPerCraft: 1 },
  // T7
  T7_MEAL_PIE: { baseFocus: 5400, iv: 576, unitsPerCraft: 1 },
  'T7_MEAL_PIE@1': { baseFocus: 7390, iv: 576, unitsPerCraft: 1 },
  'T7_MEAL_PIE@2': { baseFocus: 11400, iv: 576, unitsPerCraft: 1 },
  'T7_MEAL_PIE@3': { baseFocus: 23410, iv: 576, unitsPerCraft: 1 },
  T7_MEAL_OMELETTE: { baseFocus: 4640, iv: 504, unitsPerCraft: 1 },
  'T7_MEAL_OMELETTE@1': { baseFocus: 6650, iv: 504, unitsPerCraft: 1 },
  'T7_MEAL_OMELETTE@2': { baseFocus: 10650, iv: 504, unitsPerCraft: 1 },
  'T7_MEAL_OMELETTE@3': { baseFocus: 22660, iv: 504, unitsPerCraft: 1 },
  T7_MEAL_ROAST: { baseFocus: 5280, iv: 576, unitsPerCraft: 1 },
  'T7_MEAL_ROAST@1': { baseFocus: 7280, iv: 576, unitsPerCraft: 1 },
  'T7_MEAL_ROAST@2': { baseFocus: 11280, iv: 576, unitsPerCraft: 1 },
  'T7_MEAL_ROAST@3': { baseFocus: 23290, iv: 576, unitsPerCraft: 1 },
  // T8
  T8_MEAL_STEW: { baseFocus: 5510, iv: 576, unitsPerCraft: 1 },
  'T8_MEAL_STEW@1': { baseFocus: 7520, iv: 576, unitsPerCraft: 1 },
  'T8_MEAL_STEW@2': { baseFocus: 11520, iv: 576, unitsPerCraft: 1 },
  'T8_MEAL_STEW@3': { baseFocus: 23530, iv: 576, unitsPerCraft: 1 },
  T8_MEAL_SANDWICH: { baseFocus: 4940, iv: 504, unitsPerCraft: 1 },
  'T8_MEAL_SANDWICH@1': { baseFocus: 6940, iv: 504, unitsPerCraft: 1 },
  'T8_MEAL_SANDWICH@2': { baseFocus: 10940, iv: 504, unitsPerCraft: 1 },
  'T8_MEAL_SANDWICH@3': { baseFocus: 22950, iv: 504, unitsPerCraft: 1 },
}

export function getRecipeData(mealId: string, enchantment: number): { baseFocus: number; iv: number; unitsPerCraft: number } | null {
  const key = enchantment === 0 ? mealId : `${mealId}@${enchantment}`
  return RECIPE_DATA[key] ?? RECIPE_DATA[mealId] ?? null
}

export function getMaterialCost(materials: CraftMaterial[]): number {
  return materials.reduce((sum, m) => sum + m.pricePerUnit * m.quantity, 0)
}
