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
  // T1 Fish
  T1_MEAL_SEAWEEDSALAD: { baseFocus: 4, iv: 0, unitsPerCraft: 1 },
  // T3 Fish (wiki)
  T3_MEAL_SOUP_FISH: { baseFocus: 77, iv: 750, unitsPerCraft: 1 },
  T3_MEAL_PIE_FISH: { baseFocus: 81, iv: 750, unitsPerCraft: 1 },
  T3_MEAL_OMELETTE_FISH: { baseFocus: 77, iv: 750, unitsPerCraft: 1 },
  T3_MEAL_ROAST_FISH: { baseFocus: 77, iv: 750, unitsPerCraft: 1 },
  // T3 Avalon (wiki)
  T3_MEAL_OMELETTE_AVALON: { baseFocus: 52, iv: 1080, unitsPerCraft: 1 },
  // T4 Fish (wiki)
  T4_MEAL_SALAD_FISH: { baseFocus: 77, iv: 750, unitsPerCraft: 1 },
  T4_MEAL_STEW_FISH: { baseFocus: 77, iv: 750, unitsPerCraft: 1 },
  T4_MEAL_SANDWICH_FISH: { baseFocus: 81, iv: 750, unitsPerCraft: 1 },
  // T4 Avalon (wiki)
  T4_MEAL_SANDWICH_AVALON: { baseFocus: 55, iv: 1080, unitsPerCraft: 1 },
  T4_MEAL_STEW_AVALON: { baseFocus: 58, iv: 1152, unitsPerCraft: 1 },
  // T5 Fish (wiki)
  T5_MEAL_SOUP_FISH: { baseFocus: 231, iv: 750, unitsPerCraft: 1 },
  T5_MEAL_PIE_FISH: { baseFocus: 225, iv: 750, unitsPerCraft: 1 },
  T5_MEAL_OMELETTE_FISH: { baseFocus: 225, iv: 750, unitsPerCraft: 1 },
  T5_MEAL_ROAST_FISH: { baseFocus: 225, iv: 750, unitsPerCraft: 1 },
  // T5 Avalon (wiki)
  T5_MEAL_OMELETTE_AVALON: { baseFocus: 155, iv: 1080, unitsPerCraft: 1 },
  // T6 Fish
  T6_MEAL_SALAD_FISH: { baseFocus: 672, iv: 750, unitsPerCraft: 1 },
  'T6_MEAL_SALAD_FISH@1': { baseFocus: 1272, iv: 750, unitsPerCraft: 1 },
  'T6_MEAL_SALAD_FISH@2': { baseFocus: 2473, iv: 750, unitsPerCraft: 1 },
  'T6_MEAL_SALAD_FISH@3': { baseFocus: 6076, iv: 750, unitsPerCraft: 1 },
  T6_MEAL_STEW_FISH: { baseFocus: 225, iv: 750, unitsPerCraft: 1 },
  T6_MEAL_SANDWICH_FISH: { baseFocus: 231, iv: 750, unitsPerCraft: 1 },
  // T6 Avalon
  T6_MEAL_SANDWICH_AVALON: { baseFocus: 165, iv: 1080, unitsPerCraft: 1 },
  T6_MEAL_STEW_AVALON: { baseFocus: 176, iv: 1152, unitsPerCraft: 1 },
  // T7 Fish
  T7_MEAL_PIE_FISH: { baseFocus: 672, iv: 750, unitsPerCraft: 1 },
  'T7_MEAL_PIE_FISH@1': { baseFocus: 1272, iv: 750, unitsPerCraft: 1 },
  'T7_MEAL_PIE_FISH@2': { baseFocus: 2473, iv: 750, unitsPerCraft: 1 },
  'T7_MEAL_PIE_FISH@3': { baseFocus: 6076, iv: 750, unitsPerCraft: 1 },
  T7_MEAL_OMELETTE_FISH: { baseFocus: 672, iv: 750, unitsPerCraft: 1 },
  'T7_MEAL_OMELETTE_FISH@1': { baseFocus: 1272, iv: 750, unitsPerCraft: 1 },
  'T7_MEAL_OMELETTE_FISH@2': { baseFocus: 2473, iv: 750, unitsPerCraft: 1 },
  'T7_MEAL_OMELETTE_FISH@3': { baseFocus: 6076, iv: 750, unitsPerCraft: 1 },
  T7_MEAL_ROAST_FISH: { baseFocus: 652, iv: 750, unitsPerCraft: 1 },
  'T7_MEAL_ROAST_FISH@1': { baseFocus: 1272, iv: 750, unitsPerCraft: 1 },
  'T7_MEAL_ROAST_FISH@2': { baseFocus: 2473, iv: 750, unitsPerCraft: 1 },
  'T7_MEAL_ROAST_FISH@3': { baseFocus: 6076, iv: 750, unitsPerCraft: 1 },
  // T7 Avalon
  T7_MEAL_OMELETTE_AVALON: { baseFocus: 4640, iv: 1080, unitsPerCraft: 1 },
  'T7_MEAL_OMELETTE_AVALON@1': { baseFocus: 6650, iv: 1080, unitsPerCraft: 1 },
  'T7_MEAL_OMELETTE_AVALON@2': { baseFocus: 10650, iv: 1080, unitsPerCraft: 1 },
  'T7_MEAL_OMELETTE_AVALON@3': { baseFocus: 22660, iv: 1080, unitsPerCraft: 1 },
  // T8 Fish
  T8_MEAL_STEW_FISH: { baseFocus: 652, iv: 750, unitsPerCraft: 1 },
  'T8_MEAL_STEW_FISH@1': { baseFocus: 1253, iv: 750, unitsPerCraft: 1 },
  'T8_MEAL_STEW_FISH@2': { baseFocus: 2454, iv: 750, unitsPerCraft: 1 },
  'T8_MEAL_STEW_FISH@3': { baseFocus: 6053, iv: 750, unitsPerCraft: 1 },
  T8_MEAL_SANDWICH_FISH: { baseFocus: 672, iv: 750, unitsPerCraft: 1 },
  'T8_MEAL_SANDWICH_FISH@1': { baseFocus: 1272, iv: 750, unitsPerCraft: 1 },
  'T8_MEAL_SANDWICH_FISH@2': { baseFocus: 2473, iv: 750, unitsPerCraft: 1 },
  'T8_MEAL_SANDWICH_FISH@3': { baseFocus: 6076, iv: 750, unitsPerCraft: 1 },
  // T8 Avalon
  T8_MEAL_STEW_AVALON: { baseFocus: 5280, iv: 1152, unitsPerCraft: 1 },
  'T8_MEAL_STEW_AVALON@1': { baseFocus: 7280, iv: 1152, unitsPerCraft: 1 },
  'T8_MEAL_STEW_AVALON@2': { baseFocus: 11280, iv: 1152, unitsPerCraft: 1 },
  'T8_MEAL_STEW_AVALON@3': { baseFocus: 23290, iv: 1152, unitsPerCraft: 1 },
  T8_MEAL_SANDWICH_AVALON: { baseFocus: 4940, iv: 1080, unitsPerCraft: 1 },
  'T8_MEAL_SANDWICH_AVALON@1': { baseFocus: 6940, iv: 1080, unitsPerCraft: 1 },
  'T8_MEAL_SANDWICH_AVALON@2': { baseFocus: 10940, iv: 1080, unitsPerCraft: 1 },
  'T8_MEAL_SANDWICH_AVALON@3': { baseFocus: 22950, iv: 1080, unitsPerCraft: 1 },
}

export function getRecipeData(mealId: string, enchantment: number): { baseFocus: number; iv: number; unitsPerCraft: number } | null {
  const key = enchantment === 0 ? mealId : `${mealId}@${enchantment}`
  return RECIPE_DATA[key] ?? RECIPE_DATA[mealId] ?? null
}

export function getMaterialCost(materials: CraftMaterial[]): number {
  return materials.reduce((sum, m) => sum + m.pricePerUnit * m.quantity, 0)
}
