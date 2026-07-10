import type { AppConfig, CraftingInputValues } from '../types/meal'

const STORAGE_KEY = 'albion-tool-config'

const DEFAULT_CRAFTING_INPUTS: CraftingInputValues = {
  stationCost: '',
  returnPercent: '',
  taxes: '',
  premium: false,
  focus: false,
  cityBonus: false,
  craftQuantity: '',
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

function defaultConfig(): AppConfig {
  return {
    meals: {},
    spects: { ...DEFAULT_SPECTS },
    craftingInputs: { ...DEFAULT_CRAFTING_INPUTS },
  }
}

export function loadConfig(): AppConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultConfig()
    const parsed = JSON.parse(raw) as Partial<AppConfig>
    return {
      meals: parsed.meals ?? {},
      spects: { ...DEFAULT_SPECTS, ...parsed.spects },
      craftingInputs: { ...DEFAULT_CRAFTING_INPUTS, ...parsed.craftingInputs },
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
