import { memo } from 'react'
import type { CraftMaterial } from '../../types/meal'

interface Props {
  materials: CraftMaterial[]
}

export default memo(function FoodMaterials({ materials }: Props) {
  if (materials.length === 0) {
    return (
      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl w-48">
        <p className="text-sm text-slate-500 text-center">
          Cargando...
        </p>
      </div>
    )
  }

  return (
    <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl w-48">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Materiales
      </h3>
      <ul className="space-y-2">
        {materials.map(mat => (
          <li key={mat.id} className="flex justify-between items-center text-sm">
            <span className="text-slate-300">{mat.name}</span>
            <span className="text-slate-100 font-mono">{mat.quantity}</span>
          </li>
        ))}
      </ul>
    </div>
  )
})
