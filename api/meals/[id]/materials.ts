import { createClient } from '@libsql/client'

export const config = { runtime: 'edge' }

export default async function handler(request: Request) {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 })
  }

  const url = new URL(request.url)
  const segments = url.pathname.split('/')
  const mealId = decodeURIComponent(segments[3])

  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  })

  try {
    const result = await client.execute({
      sql: 'SELECT material_name, quantity, is_base, enchantment_level FROM meal_materials WHERE meal_id = ?',
      args: [mealId],
    })

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

    return new Response(JSON.stringify({ base, enchantment }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching meal materials:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
