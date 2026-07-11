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

export interface CraftingInputValues {
  stationCost: string
  premium: boolean
  focus: boolean
  cityBonus: boolean
  craftQuantity: string
  sellingPrice: string
}

export interface MealConfig {
  baseName: string
  baseMaterials: CraftMaterial[]
  enchantmentMaterials: Record<number, CraftMaterial[]>
  recipe?: RecipeMetadata
}

export interface AppConfig {
  meals: Record<string, MealConfig>
  spects: Record<string, number>
  craftingInputs: CraftingInputValues
}
