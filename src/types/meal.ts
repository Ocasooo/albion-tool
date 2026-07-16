export interface MealItem {
  uniqueName: string
  name: string
  nameEn: string
  tier: number
  enchantment: number
  icon: string
  foodType?: string
}

export interface CraftMaterial {
  id: string
  name: string
  quantity: number
  pricePerUnit: number
}

export interface RecipeMetadata {
  baseFocus: number
  iv: number
  unitsPerCraft: number
  foodType: string
  allEnchantments: Record<number, { baseFocus: number; iv: number }>
}

export type CalculationMode = 'basic' | 'advanced'

export const CITIES = ['Martlock', 'Bridgewatch', 'Lymhurst', 'Fort Sterling', 'Thetford'] as const
export type City = typeof CITIES[number]

export interface CityData {
  dailySales: number
  sellingPrice: number
  enabled: boolean
  sellQuantity: number
}

export interface AdvancedConfig {
  cities: Record<City, CityData>
  marketSharePercent: number
  followRecommendation: boolean
  manualQuantityMode: boolean
}

export interface CraftingInputValues {
  stationCost: string
  premium: boolean
  focus: boolean
  cityBonus: boolean
  craftQuantity: string
  sellingPrice: string
  calculationMode: CalculationMode
}

export interface MealEnchantmentData {
  basicSellingPrice: string
  advancedSellingPrice: string
  cityData: Record<City, CityData>
}

export interface MealConfig {
  baseName: string
  baseMaterials: CraftMaterial[]
  enchantmentMaterials: Record<number, CraftMaterial[]>
  recipe?: RecipeMetadata
  enchantmentData: Record<number, MealEnchantmentData>
}

export interface AppConfig {
  meals: Record<string, MealConfig>
  spects: Record<string, number>
  craftingInputs: CraftingInputValues
  advancedConfig: AdvancedConfig
}
