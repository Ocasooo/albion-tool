const SUBCATEGORY_TO_FOOD_TYPE: Record<string, string> = {
  Omelette: 'Tortillas',
  Pie: 'Pasteles',
  Salad: 'Ensaladas',
  Sandwich: 'Bocadillos',
  Soup: 'Sopas',
  Stew: 'Guisos',
  Roast: 'Asados',
}

const FOOD_TYPE_TO_SPEC_KEY: Record<string, string> = {
  Tortillas: 'tortillas',
  Pasteles: 'cakes',
  Ensaladas: 'salads',
  Bocadillos: 'sandwich',
  Sopas: 'soups',
  Guisos: 'stews',
  Asados: 'roasts',
}

export function getFoodTypeFromSubcategory(subcategory: string): string {
  return SUBCATEGORY_TO_FOOD_TYPE[subcategory] ?? ''
}

export function getSpecKeyForFoodType(foodType: string): string {
  return FOOD_TYPE_TO_SPEC_KEY[foodType] ?? 'cook'
}
