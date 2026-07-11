import { createClient } from '@libsql/client'

export const config = { runtime: 'edge' }

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
})

export default async function handler(request: Request) {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 })
  }

  const url = new URL(request.url)
  const segments = url.pathname.split('/')
  const mealId = decodeURIComponent(segments[3])
  const requestedEnchantment = parseInt(url.searchParams.get('enchantment') ?? '0') || 0

  try {
    const [result, metaResult, allRecipeResult] = await Promise.all([
      client.execute({
        sql: 'SELECT material_name, quantity, is_base, enchantment_level FROM meal_materials WHERE meal_id = ?',
        args: [mealId],
      }),
      client.execute({
        sql: 'SELECT food_type, per_craft FROM meals WHERE id = ?',
        args: [mealId],
      }),
      client.execute({
        sql: 'SELECT enchantment_level, base_focus, iv FROM recipe_data WHERE meal_id = ?',
        args: [mealId],
      }),
    ])

    const metaRow = metaResult.rows[0]
    const allEnchantments: Record<number, { baseFocus: number; iv: number }> = {}
    let fallbackBaseFocus = 0
    let fallbackIv = 0

    for (const row of allRecipeResult.rows) {
      const level = row.enchantment_level as number
      const bf = (row.base_focus as number) || 0
      const iv = (row.iv as number) || 0
      allEnchantments[level] = { baseFocus: bf, iv }
      if (level === 0) {
        fallbackBaseFocus = bf
        fallbackIv = iv
      }
    }

    const selected = allEnchantments[requestedEnchantment] ?? allEnchantments[0]
    const metadata = metaRow ? {
      foodType: (metaRow.food_type as string) || '',
      unitsPerCraft: (metaRow.per_craft as number) || 1,
      baseFocus: selected?.baseFocus ?? fallbackBaseFocus,
      iv: selected?.iv ?? fallbackIv,
      allEnchantments,
    } : null

    const base: Array<{ id: string; name: string; quantity: number; pricePerUnit: number }> = []
    const enchantment: Record<number, Array<{ id: string; name: string; quantity: number; pricePerUnit: number }>> = {}

    for (const row of result.rows) {
      const material = {
        id: `db_${row.material_name}`,
        name: row.material_name as string,
        quantity: row.quantity as number,
        pricePerUnit: 0,
      }

      if (row.is_base === 1) {
        base.push(material)
      } else if (row.enchantment_level !== null) {
        const level = row.enchantment_level as number
        if (!enchantment[level]) {
          enchantment[level] = []
        }
        enchantment[level].push(material)
      }
    }

    return new Response(JSON.stringify({ base, enchantment, metadata }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error fetching meal materials:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
