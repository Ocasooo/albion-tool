import { createClient } from '@libsql/client'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(import.meta.dirname, '..', '.env') })

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
})

const OPENALBION_API = 'https://api.openalbion.com/api/v3'

const SUBCATEGORY_TO_FOOD_TYPE: Record<string, string> = {
  Omelette: 'Tortillas',
  Pie: 'Pasteles',
  Salad: 'Ensaladas',
  Sandwich: 'Bocadillos',
  Soup: 'Sopas',
  Stew: 'Guisos',
  Roast: 'Asados',
}

const RECIPE_DATA: Record<string, { baseFocus: number; iv: number; unitsPerCraft: number }> = {
  T1_MEAL_SOUP: { baseFocus: 560, iv: 64, unitsPerCraft: 1 },
  T2_MEAL_SALAD: { baseFocus: 560, iv: 64, unitsPerCraft: 1 },
  T3_MEAL_SOUP: { baseFocus: 1680, iv: 192, unitsPerCraft: 1 },
  T3_MEAL_PIE: { baseFocus: 530, iv: 56, unitsPerCraft: 1 },
  T3_MEAL_OMELETTE: { baseFocus: 520, iv: 56, unitsPerCraft: 1 },
  T3_MEAL_ROAST: { baseFocus: 580, iv: 64, unitsPerCraft: 1 },
  T4_MEAL_SALAD: { baseFocus: 1680, iv: 192, unitsPerCraft: 1 },
  T4_MEAL_STEW: { baseFocus: 610, iv: 64, unitsPerCraft: 1 },
  T4_MEAL_SANDWICH: { baseFocus: 550, iv: 56, unitsPerCraft: 1 },
  T5_MEAL_SOUP: { baseFocus: 5040, iv: 576, unitsPerCraft: 1 },
  T5_MEAL_PIE: { baseFocus: 1800, iv: 192, unitsPerCraft: 1 },
  T5_MEAL_OMELETTE: { baseFocus: 1550, iv: 168, unitsPerCraft: 1 },
  T5_MEAL_ROAST: { baseFocus: 1760, iv: 192, unitsPerCraft: 1 },
  T6_MEAL_SALAD: { baseFocus: 5040, iv: 576, unitsPerCraft: 1 },
  T6_MEAL_STEW: { baseFocus: 1840, iv: 192, unitsPerCraft: 1 },
  T6_MEAL_SANDWICH: { baseFocus: 1650, iv: 168, unitsPerCraft: 1 },
  T7_MEAL_PIE: { baseFocus: 5400, iv: 576, unitsPerCraft: 1 },
  'T7_MEAL_PIE@1': { baseFocus: 7390, iv: 576, unitsPerCraft: 1 },
  'T7_MEAL_PIE@2': { baseFocus: 11400, iv: 576, unitsPerCraft: 1 },
  'T7_MEAL_PIE@3': { baseFocus: 23410, iv: 576, unitsPerCraft: 1 },
  T7_MEAL_OMELETTE: { baseFocus: 4640, iv: 504, unitsPerCraft: 1 },
  'T7_MEAL_OMELETTE@1': { baseFocus: 6650, iv: 504, unitsPerCraft: 1 },
  'T7_MEAL_OMELETTE@2': { baseFocus: 10650, iv: 504, unitsPerCraft: 1 },
  'T7_MEAL_OMELETTE@3': { baseFocus: 22660, iv: 504, unitsPerCraft: 1 },
  T7_MEAL_ROAST: { baseFocus: 5280, iv: 576, unitsPerCraft: 1 },
  'T7_MEAL_ROAST@1': { baseFocus: 7280, iv: 576, unitsPerCraft: 1 },
  'T7_MEAL_ROAST@2': { baseFocus: 11280, iv: 576, unitsPerCraft: 1 },
  'T7_MEAL_ROAST@3': { baseFocus: 23290, iv: 576, unitsPerCraft: 1 },
  T8_MEAL_STEW: { baseFocus: 5510, iv: 576, unitsPerCraft: 1 },
  'T8_MEAL_STEW@1': { baseFocus: 7520, iv: 576, unitsPerCraft: 1 },
  'T8_MEAL_STEW@2': { baseFocus: 11520, iv: 576, unitsPerCraft: 1 },
  'T8_MEAL_STEW@3': { baseFocus: 23530, iv: 576, unitsPerCraft: 1 },
  T8_MEAL_SANDWICH: { baseFocus: 4940, iv: 504, unitsPerCraft: 1 },
  'T8_MEAL_SANDWICH@1': { baseFocus: 6940, iv: 504, unitsPerCraft: 1 },
  'T8_MEAL_SANDWICH@2': { baseFocus: 10940, iv: 504, unitsPerCraft: 1 },
  'T8_MEAL_SANDWICH@3': { baseFocus: 22950, iv: 504, unitsPerCraft: 1 },
}

const ES_NAMES: Record<string, string> = {
  T1_MEAL_SEAWEEDSALAD: 'Ensalada de Algas',
  T1_MEAL_SOUP: 'Sopa de Zanahoria',
  T1_MEAL_SOUP_FISH: 'Sopa de Almejas Greenmoor',
  T2_MEAL_SALAD: 'Ensalada de Judías',
  T2_MEAL_SALAD_FISH: 'Ensalada de Calamar Shallowshore',
  T3_MEAL_OMELETTE: 'Tortilla de Pollo',
  T3_MEAL_OMELETTE_AVALON: 'Tortilla de Pollo Avaloniana',
  T3_MEAL_OMELETTE_FISH: 'Tortilla de Cangrejo Lowriver',
  T3_MEAL_PIE: 'Pastel de Pollo',
  T3_MEAL_PIE_FISH: 'Pastel de Coldeye Upland',
  T3_MEAL_ROAST: 'Pollo Asado',
  T3_MEAL_ROAST_FISH: 'Pargo Snapper Asado Whitefog',
  T3_MEAL_SOUP: 'Sopa de Trigo',
  T3_MEAL_SOUP_FISH: 'Sopa de Almejas Murkwater',
  T4_MEAL_SALAD: 'Ensalada de Nabo',
  T4_MEAL_SALAD_FISH: 'Ensalada de Pulpo Midwater',
  T4_MEAL_SANDWICH: 'Sándwich de Cabra',
  T4_MEAL_SANDWICH_AVALON: 'Sándwich de Cabra Avaloniano',
  T4_MEAL_SANDWICH_FISH: 'Sándwich de Lurcher Stonestream',
  T4_MEAL_STEW: 'Guiso de Cabra',
  T4_MEAL_STEW_AVALON: 'Guiso de Cabra Avaloniano',
  T4_MEAL_STEW_FISH: 'Guiso de Anguila Greenriver',
  T5_MEAL_OMELETTE: 'Tortilla de Ganso',
  T5_MEAL_OMELETTE_AVALON: 'Tortilla de Ganso Avaloniana',
  T5_MEAL_OMELETTE_FISH: 'Tortilla de Cangrejo Drybrook',
  T5_MEAL_PIE: 'Pastel de Ganso',
  T5_MEAL_PIE_FISH: 'Pastel de Blindeye Mountain',
  T5_MEAL_ROAST: 'Ganso Asado',
  T5_MEAL_ROAST_FISH: 'Pargo Snapper Asado Clearhaze',
  T5_MEAL_SOUP: 'Sopa de Col',
  T5_MEAL_SOUP_FISH: 'Sopa de Almejas Blackbog',
  T6_MEAL_SALAD: 'Ensalada de Patata',
  T6_MEAL_SALAD_FISH: 'Ensalada de Kraken Deepwater',
  T6_MEAL_SANDWICH: 'Sándwich de Cordero',
  T6_MEAL_SANDWICH_AVALON: 'Sándwich de Cordero Avaloniano',
  T6_MEAL_SANDWICH_FISH: 'Sándwich de Lurcher Rushwater',
  T6_MEAL_STEW: 'Guiso de Cordero',
  T6_MEAL_STEW_AVALON: 'Guiso de Cordero Avaloniano',
  T6_MEAL_STEW_FISH: 'Guiso de Anguila Redsprint',
  T7_MEAL_OMELETTE: 'Tortilla de Cerdo',
  T7_MEAL_OMELETTE_AVALON: 'Tortilla de Cerdo Avaloniana',
  T7_MEAL_OMELETTE_FISH: 'Tortilla de Cangrejo Dusthole',
  T7_MEAL_PIE: 'Pastel de Cerdo',
  T7_MEAL_PIE_FISH: 'Pastel de Deadeye Frostpeak',
  T7_MEAL_ROAST: 'Cerdo Asado',
  T7_MEAL_ROAST_FISH: 'Pargo Snapper Asado Puremist',
  T8_MEAL_SANDWICH: 'Sándwich de Res',
  T8_MEAL_SANDWICH_AVALON: 'Sándwich de Res Avaloniano',
  T8_MEAL_SANDWICH_FISH: 'Sándwich de Lurcher Thunderfall',
  T8_MEAL_STEW: 'Guiso de Res',
  T8_MEAL_STEW_AVALON: 'Guiso de Res Avaloniano',
  T8_MEAL_STEW_FISH: 'Guiso de Anguila Deadwater',
}

interface OpenAlbionConsumable {
  id: number
  name: string
  tier: string
  identifier: string
  category: { name: string }
  subcategory?: { name: string }
}

interface OpenAlbionCraftingRequirement {
  name: string
  value: number
  identifier: string
}

interface OpenAlbionCrafting {
  data: Array<{
    enchantment: number
    crafting: {
      per_craft: number
      requirements: OpenAlbionCraftingRequirement[]
    }
  }>
}

interface MealRecipe {
  baseName: string
  nameEn: string
  tier: number
  foodType: string
  perCraft: number
  baseMaterials: { name: string; quantity: number }[]
  enchantmentMaterials: Record<number, { name: string; quantity: number }[]>
}

async function createTables() {
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS meals (
      id TEXT PRIMARY KEY,
      name_es TEXT NOT NULL,
      name_en TEXT NOT NULL,
      tier INTEGER NOT NULL,
      food_type TEXT DEFAULT '',
      per_craft INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS meal_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meal_id TEXT NOT NULL REFERENCES meals(id),
      material_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      is_base INTEGER DEFAULT 1,
      enchantment_level INTEGER
    );

    CREATE TABLE IF NOT EXISTS recipe_data (
      meal_id TEXT NOT NULL,
      enchantment_level INTEGER NOT NULL DEFAULT 0,
      base_focus REAL NOT NULL,
      iv INTEGER NOT NULL,
      units_per_craft INTEGER NOT NULL,
      PRIMARY KEY (meal_id, enchantment_level)
    );
  `)

  await client.executeMultiple(`
    ALTER TABLE meals ADD COLUMN food_type TEXT DEFAULT '';
    ALTER TABLE meals ADD COLUMN per_craft INTEGER DEFAULT 1;
  `).catch(() => {})

  console.log('Tablas creadas/verificadas')
}

async function fetchFoodConsumables(): Promise<OpenAlbionConsumable[]> {
  console.log('Obteniendo consumibles desde OpenAlbion API...')
  const res = await fetch(`${OPENALBION_API}/consumables`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const data = await res.json()
  const consumables: OpenAlbionConsumable[] = data.data
  const foods = consumables.filter(c => c.category.name === 'Foods')
  console.log(`Comidas encontradas: ${foods.length}`)
  return foods
}

async function fetchCraftingRecipe(consumableId: number): Promise<OpenAlbionCrafting | null> {
  try {
    const res = await fetch(`${OPENALBION_API}/consumable-craftings/consumable/${consumableId}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

function formatMaterialName(identifier: string): string {
  return identifier
    .replace(/^T\d+_/, '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
}

async function fetchAndSeed() {
  const foods = await fetchFoodConsumables()
  const mealsMap = new Map<string, MealRecipe>()

  for (const food of foods) {
    const baseName = food.identifier
    const tierMatch = food.tier.match(/^(\d+)/)
    const tier = tierMatch ? parseInt(tierMatch[1]) : 0
    const foodType = SUBCATEGORY_TO_FOOD_TYPE[food.subcategory?.name ?? ''] ?? ''

    const craftingData = await fetchCraftingRecipe(food.id)
    if (!craftingData) continue

    let perCraft = 1
    const baseMaterials: { name: string; quantity: number }[] = []
    const enchantmentMaterials: Record<number, { name: string; quantity: number }[]> = {}

    for (const entry of craftingData.data) {
      if (entry.enchantment === 0) {
        perCraft = entry.crafting.per_craft
      }

      const mats = entry.crafting.requirements.map(req => ({
        name: formatMaterialName(req.identifier),
        quantity: req.value,
      }))

      if (entry.enchantment === 0) {
        baseMaterials.push(...mats)
      } else {
        const baseNames = new Set(baseMaterials.map(m => m.name))
        const extras = mats.filter(m => !baseNames.has(m.name))
        enchantmentMaterials[entry.enchantment] = extras
      }
    }

    mealsMap.set(baseName, {
      baseName,
      nameEn: food.name,
      tier,
      foodType,
      perCraft,
      baseMaterials,
      enchantmentMaterials,
    })
  }

  console.log(`Total comidas: ${mealsMap.size}`)

  await client.execute('DELETE FROM recipe_data')
  await client.execute('DELETE FROM meal_materials')
  await client.execute('DELETE FROM meals')

  const mealStatements: Array<{ sql: string; args: (string | number)[] }> = []
  const materialStatements: Array<{ sql: string; args: (string | number | null)[] }> = []
  const recipeStatements: Array<{ sql: string; args: (string | number)[] }> = []

  for (const [, meal] of mealsMap) {
    mealStatements.push({
      sql: 'INSERT INTO meals (id, name_es, name_en, tier, food_type, per_craft) VALUES (?, ?, ?, ?, ?, ?)',
      args: [meal.baseName, ES_NAMES[meal.baseName] ?? meal.nameEn, meal.nameEn, meal.tier, meal.foodType, meal.perCraft],
    })

    const recipeInfo = RECIPE_DATA[meal.baseName]
    if (recipeInfo) {
      recipeStatements.push({
        sql: 'INSERT INTO recipe_data (meal_id, enchantment_level, base_focus, iv, units_per_craft) VALUES (?, 0, ?, ?, ?)',
        args: [meal.baseName, recipeInfo.baseFocus, recipeInfo.iv, recipeInfo.unitsPerCraft],
      })
    }

    for (const [key, enchInfo] of Object.entries(RECIPE_DATA)) {
      if (key.startsWith(`${meal.baseName}@`)) {
        const enchantment = parseInt(key.split('@')[1])
        recipeStatements.push({
          sql: 'INSERT INTO recipe_data (meal_id, enchantment_level, base_focus, iv, units_per_craft) VALUES (?, ?, ?, ?, ?)',
          args: [meal.baseName, enchantment, enchInfo.baseFocus, enchInfo.iv, enchInfo.unitsPerCraft],
        })
      }
    }

    for (const mat of meal.baseMaterials) {
      materialStatements.push({
        sql: 'INSERT INTO meal_materials (meal_id, material_name, quantity, is_base, enchantment_level) VALUES (?, ?, ?, 1, NULL)',
        args: [meal.baseName, mat.name, mat.quantity],
      })
    }

    for (const [level, mats] of Object.entries(meal.enchantmentMaterials)) {
      for (const mat of mats) {
        materialStatements.push({
          sql: 'INSERT INTO meal_materials (meal_id, material_name, quantity, is_base, enchantment_level) VALUES (?, ?, ?, 0, ?)',
          args: [meal.baseName, mat.name, mat.quantity, parseInt(level)],
        })
      }
    }
  }

  console.log(`Insertando ${mealStatements.length} meals...`)
  await client.batch(mealStatements)

  console.log(`Insertando ${recipeStatements.length} recipe_data...`)
  if (recipeStatements.length > 0) {
    await client.batch(recipeStatements)
  }

  console.log(`Insertando ${materialStatements.length} materiales...`)
  const BATCH_SIZE = 100
  for (let i = 0; i < materialStatements.length; i += BATCH_SIZE) {
    const batch = materialStatements.slice(i, i + BATCH_SIZE)
    await client.batch(batch)
    console.log(`  ${Math.min(i + BATCH_SIZE, materialStatements.length)}/${materialStatements.length}`)
  }

  console.log('\nSeed completado exitosamente')
}

async function main() {
  try {
    await createTables()
    await fetchAndSeed()
  } catch (err) {
    console.error('Error en seed:', err)
    process.exit(1)
  } finally {
    client.close()
  }
}

main()
