import type { MealItem, CraftMaterial } from '../types/meal'

let mealsCache: MealItem[] | null = null
let pendingPromise: Promise<MealItem[]> | null = null

export async function getAllMeals(): Promise<MealItem[]> {
  if (mealsCache) return mealsCache
  if (pendingPromise) return pendingPromise

  pendingPromise = fetchMealsFromApi()
  try {
    mealsCache = await pendingPromise
    return mealsCache
  } finally {
    pendingPromise = null
  }
}

async function fetchMealsFromApi(): Promise<MealItem[]> {
  const res = await fetch('/api/meals')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function getMealMaterials(mealId: string): Promise<{ base: CraftMaterial[]; enchantment: Record<number, CraftMaterial[]> }> {
  const res = await fetch(`/api/meals/${encodeURIComponent(mealId)}/materials`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export function invalidateMealsCache(): void {
  mealsCache = null
}
