import { createClient } from '@libsql/client'

export const config = { runtime: 'edge' }

export default async function handler(request: Request) {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 })
  }

  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  })

  try {
    const result = await client.execute(`
      SELECT
        m.id,
        m.name_es,
        m.name_en,
        m.tier,
        GROUP_CONCAT(DISTINCT mm.enchantment_level) as enchantments
      FROM meals m
      LEFT JOIN meal_materials mm
        ON m.id = mm.meal_id AND mm.is_base = 0 AND mm.enchantment_level IS NOT NULL
      GROUP BY m.id
      ORDER BY m.tier, m.name_es
    `)

    const meals = []

    for (const row of result.rows) {
      const baseName = row.id as string

      meals.push({
        uniqueName: baseName,
        name: row.name_es,
        nameEn: row.name_en,
        tier: row.tier,
        enchantment: 0,
        icon: `https://render.albiononline.com/v1/item/${baseName}.png?size=64`,
      })

      if (row.enchantments) {
        const levels = (row.enchantments as string).split(',').map(Number)
        for (const level of levels) {
          meals.push({
            uniqueName: `${baseName}@${level}`,
            name: row.name_es,
            nameEn: row.name_en,
            tier: row.tier,
            enchantment: level,
            icon: `https://render.albiononline.com/v1/item/${baseName}@${level}.png?size=64`,
          })
        }
      }
    }

    return new Response(JSON.stringify(meals), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching meals:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
