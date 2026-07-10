import { createClient } from '@libsql/client'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(import.meta.dirname, '..', '.env') })

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
})

const OPENALBION_API = 'https://api.openalbion.com/api/v3'

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
      requirements: OpenAlbionCraftingRequirement[]
    }
  }>
}

interface MealRecipe {
  baseName: string
  nameEn: string
  tier: number
  baseMaterials: { name: string; quantity: number }[]
  enchantmentMaterials: Record<number, { name: string; quantity: number }[]>
}

async function createTables() {
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS meals (
      id TEXT PRIMARY KEY,
      name_es TEXT NOT NULL,
      name_en TEXT NOT NULL,
      tier INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS meal_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meal_id TEXT NOT NULL REFERENCES meals(id),
      material_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      is_base INTEGER DEFAULT 1,
      enchantment_level INTEGER
    );
  `)
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

    const craftingData = await fetchCraftingRecipe(food.id)
    if (!craftingData) continue

    const baseMaterials: { name: string; quantity: number }[] = []
    const enchantmentMaterials: Record<number, { name: string; quantity: number }[]> = {}

    for (const entry of craftingData.data) {
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
      baseMaterials,
      enchantmentMaterials,
    })
  }

  console.log(`Total comidas: ${mealsMap.size}`)

  await client.execute('DELETE FROM meal_materials')
  await client.execute('DELETE FROM meals')

  const mealStatements: Array<{ sql: string; args: (string | number)[] }> = []
  const materialStatements: Array<{ sql: string; args: (string | number | null)[] }> = []

  for (const [, meal] of mealsMap) {
    mealStatements.push({
      sql: 'INSERT INTO meals (id, name_es, name_en, tier) VALUES (?, ?, ?, ?)',
      args: [meal.baseName, ES_NAMES[meal.baseName] ?? meal.nameEn, meal.nameEn, meal.tier],
    })

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
