import type { AppConfig, CraftingInputValues, City } from '../types/meal'
import { CITIES } from '../types/meal'
import { DEFAULT_MARKET_SHARE } from '../calculos/advancedCalculator'

const STORAGE_KEY = 'albion-tool-config'

const DEFAULT_CRAFTING_INPUTS: CraftingInputValues = {
  stationCost: '',
  premium: false,
  focus: false,
  cityBonus: false,
  craftQuantity: '',
  sellingPrice: '',
  calculationMode: 'basic',
}

const DEFAULT_SPECTS: Record<string, number> = {
  cook: 0,
  butchering: 0,
  ingredients: 0,
  sandwich: 0,
  stews: 0,
  tortillas: 0,
  salads: 0,
  cakes: 0,
  roasts: 0,
  soups: 0,
}

function createDefaultCities(): Record<City, { dailySales: number; sellingPrice: number; enabled: boolean; sellQuantity: number }> {
  const cities = {} as Record<City, { dailySales: number; sellingPrice: number; enabled: boolean; sellQuantity: number }>
  for (const city of CITIES) {
    cities[city] = { dailySales: 0, sellingPrice: 0, enabled: false, sellQuantity: 0 }
  }
  return cities
}

function defaultConfig(): AppConfig {
  return {
    meals: {},
    spects: { ...DEFAULT_SPECTS },
    craftingInputs: { ...DEFAULT_CRAFTING_INPUTS },
    advancedConfig: {
      cities: createDefaultCities(),
      marketSharePercent: DEFAULT_MARKET_SHARE,
      followRecommendation: false,
      manualQuantityMode: false,
    },
  }
}

export function loadConfig(): AppConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultConfig()
    const parsed = JSON.parse(raw) as Partial<AppConfig>
    const defaultCities = createDefaultCities()
    const mergedCities = { ...defaultCities }
    if (parsed.advancedConfig?.cities) {
      for (const city of CITIES) {
        if (parsed.advancedConfig.cities[city]) {
          mergedCities[city] = parsed.advancedConfig.cities[city]
        }
      }
    }
    return {
      meals: parsed.meals ?? {},
      spects: { ...DEFAULT_SPECTS, ...parsed.spects },
      craftingInputs: { ...DEFAULT_CRAFTING_INPUTS, ...parsed.craftingInputs },
      advancedConfig: {
        cities: mergedCities,
        marketSharePercent: parsed.advancedConfig?.marketSharePercent ?? DEFAULT_MARKET_SHARE,
        followRecommendation: parsed.advancedConfig?.followRecommendation ?? false,
        manualQuantityMode: parsed.advancedConfig?.manualQuantityMode ?? false,
      },
    }
  } catch {
    return defaultConfig()
  }
}

export function saveConfig(config: AppConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch (e) {
    console.error('Error al guardar la configuración:', e)
  }
}
