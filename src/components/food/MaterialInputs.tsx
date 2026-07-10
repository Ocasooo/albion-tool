import type { CraftMaterial } from '../../types/meal'

interface Props {
  title?: string
  materials: CraftMaterial[]
  compact?: boolean
  onChange: (id: string, field: keyof CraftMaterial, value: string | number) => void
}

export default function MaterialInputs({ title, materials, compact = false, onChange }: Props) {
  const inputClass = 'h-9 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 outline-none focus:border-blue-500/50 transition-colors text-sm'

  return (
    <div className="space-y-3">
      {title && <h4 className="text-sm font-semibold text-slate-300">{title}</h4>}

      {!compact && (
        <div className="flex gap-2 items-end">
          <div className="w-32">
            <span className="text-xs text-slate-500 mb-0.5 block">Nombre</span>
          </div>
          <div className="w-20">
            <span className="text-xs text-slate-500 mb-0.5 block">Cantidad</span>
          </div>
          <div className="w-24">
            <span className="text-xs text-slate-500 mb-0.5 block">Precio/unidad</span>
          </div>
        </div>
      )}

      {materials.map(mat => (
        <div key={mat.id} className="flex gap-2 items-center">
          {compact ? (
            <span className="w-32 text-sm text-slate-300 truncate">{mat.name}</span>
          ) : (
            <div className="w-32 h-9 px-3 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-400 text-sm flex items-center truncate">
              {mat.name || <span className="text-slate-600">Sin nombre</span>}
            </div>
          )}
          <input
            type="number"
            value={mat.quantity || ''}
            onChange={e => onChange(mat.id, 'quantity', Number(e.target.value))}
            className={`${inputClass} w-20`}
            placeholder="0"
          />
          <input
            type="number"
            value={mat.pricePerUnit || ''}
            onChange={e => onChange(mat.id, 'pricePerUnit', Number(e.target.value))}
            className={`${inputClass} w-24`}
            placeholder="0"
          />
        </div>
      ))}
    </div>
  )
}
