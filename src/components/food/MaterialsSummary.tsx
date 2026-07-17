import { memo, useMemo } from 'react'
import type { CraftMaterial, PinnedCraft } from '../../types/meal'

interface Props {
  materials: CraftMaterial[]
  craftQuantity: number
  returnRate: number
  pinnedCrafts: PinnedCraft[]
}

function formatSilver(value: number): string {
  return value.toLocaleString('es-ES', { maximumFractionDigits: 0 })
}

function aggregatePinnedMaterials(pinnedCrafts: PinnedCraft[]): CraftMaterial[] {
  const map = new Map<string, CraftMaterial>()
  for (const craft of pinnedCrafts) {
    for (const mat of craft.materials) {
      const existing = map.get(mat.id)
      const qty = craft.craftQuantity || 1
      if (existing) {
        existing.quantity += mat.quantity * qty
      } else {
        map.set(mat.id, { ...mat, quantity: mat.quantity * qty })
      }
    }
  }
  return Array.from(map.values())
}

export default memo(function MaterialsSummary({ materials, craftQuantity, returnRate, pinnedCrafts }: Props) {
  const hasPins = pinnedCrafts.length > 0
  const effectiveMaterials = hasPins ? aggregatePinnedMaterials(pinnedCrafts) : materials
  const qty = hasPins ? 1 : (craftQuantity || 1)
  const netMultiplier = 1 - returnRate

  const rows = useMemo(() => {
    return effectiveMaterials.map(mat => {
      const cantNecesaria = Math.ceil(mat.quantity * qty * netMultiplier)
      return {
        ...mat,
        cantNecesaria,
        subtotal: cantNecesaria * mat.pricePerUnit,
      }
    })
  }, [effectiveMaterials, qty, netMultiplier])

  const grandTotal = useMemo(() => {
    return rows.reduce((sum, r) => sum + r.subtotal, 0)
  }, [rows])

  if (effectiveMaterials.length === 0) {
    return null
  }

  return (
    <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
        Materiales necesarios
      </h3>

      {hasPins && (
        <div className="bg-amber-900/20 border border-amber-700/40 rounded-lg p-3 mb-4">
          <p className="text-xs text-amber-400">
            Mostrando materiales de {pinnedCrafts.length} crafteo{pinnedCrafts.length > 1 ? 's' : ''} pineado{pinnedCrafts.length > 1 ? 's' : ''}
          </p>
        </div>
      )}

      <div className="flex items-center text-xs text-slate-500 border-b border-slate-800/60 pb-2 mb-1">
        <span className="flex-1">Material</span>
        <span className="w-16 text-right">Cant x craft</span>
        <span className="w-24 text-right">Precio x unidad</span>
        <span className="w-20 text-right">Cant. necesaria</span>
        <span className="w-28 text-right">Subtotal</span>
      </div>

      <ul className="divide-y divide-slate-800/40">
        {rows.map(row => (
          <li key={row.id} className="flex items-center text-sm py-2">
            <span className="flex-1 text-slate-300">{row.name}</span>
            <span className="w-16 text-right text-slate-100 font-mono">{row.quantity}</span>
            <span className="w-24 text-right text-slate-400 font-mono">
              {row.pricePerUnit > 0 ? formatSilver(row.pricePerUnit) : '—'}
            </span>
            <span className="w-20 text-right text-slate-100 font-mono">{row.cantNecesaria}</span>
            <span className="w-28 text-right text-slate-100 font-mono">
              {row.pricePerUnit > 0 ? formatSilver(row.subtotal) : '—'}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex justify-end items-center pt-3 mt-1 border-t border-slate-700/60">
        <span className="text-sm text-slate-400 mr-3">Coste total:</span>
        <span className="text-sm font-semibold text-white font-mono">
          {grandTotal > 0 ? `${formatSilver(grandTotal)} silver` : '—'}
        </span>
      </div>
    </div>
  )
})
