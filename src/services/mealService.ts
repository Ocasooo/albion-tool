import type { MealItem, CraftMaterial } from '../types/meal'
import { getAllMeals, getMealMaterials } from './mealDbService'

export { getMealMaterials }
export type { CraftMaterial }

let cache: MealItem[] | null = null
let pendingPromise: Promise<MealItem[]> | null = null

export function getMeals(): Promise<MealItem[]> {
  if (cache) return Promise.resolve(cache)
  if (pendingPromise) return pendingPromise

  pendingPromise = getAllMeals()
    .then(meals => {
      cache = meals
      pendingPromise = null
      return meals
    })
    .catch(err => {
      pendingPromise = null
      throw err
    })

  return pendingPromise
}
