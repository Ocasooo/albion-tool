import type { MealItem, CraftMaterial, RecipeMetadata } from '../types/meal'

let mealsCache: MealItem[] | null = null
let mealsPending: Promise<MealItem[]> | null = null

type MaterialsResponse = { base: CraftMaterial[]; enchantment: Record<number, CraftMaterial[]>; metadata: RecipeMetadata | null }
const materialsCache = new Map<string, MaterialsResponse>()
const materialsPending = new Map<string, Promise<MaterialsResponse>>()

export async function getAllMeals(): Promise<MealItem[]> {
  if (mealsCache) return mealsCache
  if (mealsPending) return mealsPending

  mealsPending = fetchMealsFromApi()
  try {
    mealsCache = await mealsPending
    return mealsCache
  } finally {
    mealsPending = null
  }
}

async function fetchMealsFromApi(): Promise<MealItem[]> {
  const res = await fetch('/api/meals')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function getMealMaterials(mealId: string): Promise<MaterialsResponse> {
  const cacheKey = mealId

  const cached = materialsCache.get(cacheKey)
  if (cached) return cached

  const existing = materialsPending.get(cacheKey)
  if (existing) return existing

  const promise = fetch(`/api/meals/${encodeURIComponent(mealId)}/materials`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json() as Promise<MaterialsResponse>
    })
    .then(data => {
      materialsCache.set(cacheKey, data)
      materialsPending.delete(cacheKey)
      return data
    })
    .catch(err => {
      materialsPending.delete(cacheKey)
      throw err
    })

  materialsPending.set(cacheKey, promise)
  return promise
}

export function invalidateMealsCache(): void {
  mealsCache = null
}
