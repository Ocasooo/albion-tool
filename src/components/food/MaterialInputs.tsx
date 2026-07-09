import type { CraftMaterial } from '../../types/meal'

interface Props {
  title?: string
  materials: CraftMaterial[]
  onAdd: () => void
  onRemove: (id: string) => void
  onChange: (id: string, field: keyof CraftMaterial, value: string | number) => void
}

export default function MaterialInputs({ title = 'Materiales requeridos', materials, onAdd, onRemove, onChange }: Props) {
  const inputClass = 'w-full h-9 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 outline-none focus:border-blue-500/50 transition-colors text-sm'

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-300">{title}</h4>
      {materials.map(mat => (
        <div key={mat.id} className="flex gap-2 items-end">
          <div className="flex-1">
            <span className="text-xs text-slate-500 mb-0.5 block">Nombre</span>
            <input
              type="text"
              value={mat.name}
              onChange={e => onChange(mat.id, 'name', e.target.value)}
              className={inputClass}
              placeholder="Ej: Carne"
            />
          </div>
          <div className="w-20">
            <span className="text-xs text-slate-500 mb-0.5 block">Cantidad</span>
            <input
              type="number"
              value={mat.quantity || ''}
              onChange={e => onChange(mat.id, 'quantity', Number(e.target.value))}
              className={inputClass}
              placeholder="0"
            />
          </div>
          <div className="w-24">
            <span className="text-xs text-slate-500 mb-0.5 block">Precio/unidad</span>
            <input
              type="number"
              value={mat.pricePerUnit || ''}
              onChange={e => onChange(mat.id, 'pricePerUnit', Number(e.target.value))}
              className={inputClass}
              placeholder="0"
            />
          </div>
          <button
            onClick={() => onRemove(mat.id)}
            className="h-9 px-2 text-slate-500 hover:text-red-400 transition-colors text-lg leading-none"
            title="Eliminar"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        onClick={onAdd}
        className="mt-2 px-4 h-9 text-sm text-slate-400 bg-slate-800 border border-slate-700 border-dashed rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
      >
        + Agregar material
      </button>
    </div>
  )
}
