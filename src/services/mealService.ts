import type { MealItem } from '../types/meal'

let cache: MealItem[] | null = null
let pendingPromise: Promise<MealItem[]> | null = null

const ITEMS_URL = 'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json'

export function getMeals(): Promise<MealItem[]> {
  if (cache) return Promise.resolve(cache)
  if (pendingPromise) return pendingPromise

  pendingPromise = fetch(ITEMS_URL)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    })
    .then((data: Record<string, any>[]) => {
      const meals: MealItem[] = []

      for (const item of data) {
        const un: string = item.UniqueName
        if (!un?.includes('_MEAL_')) continue

        const tierMatch = un.match(/^T(\d+)/)
        const enchMatch = un.match(/@(\d+)$/)
        const tier = tierMatch ? parseInt(tierMatch[1]) : 0
        const enchantment = enchMatch ? parseInt(enchMatch[1]) : 0

        const localized = item.LocalizedNames ?? {}
        const nameEs: string | undefined = localized['ES-ES']
        const nameEn: string | undefined = localized['EN-US']
        const name = nameEs || nameEn || un

        meals.push({
          uniqueName: un,
          name,
          nameEn: nameEn || nameEs || un,
          tier,
          enchantment,
          icon: `https://render.albiononline.com/v1/item/${un}.png?size=64`,
        })
      }

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
