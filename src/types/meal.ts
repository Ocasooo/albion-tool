export interface MealItem {
  uniqueName: string
  name: string
  nameEn: string
  tier: number
  enchantment: number
  icon: string
}

export interface CraftMaterial {
  id: string
  name: string
  quantity: number
  pricePerUnit: number
}

export interface CraftingInputValues {
  stationCost: string
  returnPercent: string
  taxes: string
  premium: boolean
  focus: boolean
  cityBonus: boolean
  craftQuantity: string
}

export interface MealConfig {
  baseName: string
  baseMaterials: CraftMaterial[]
  enchantmentMaterials: Record<number, CraftMaterial[]>
}

export interface AppConfig {
  meals: Record<string, MealConfig>
  spects: Record<string, number>
  craftingInputs: CraftingInputValues
}
