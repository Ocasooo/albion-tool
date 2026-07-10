import { useState } from 'react'
import type { CraftMaterial } from '../../types/meal'
import SpectsSection from './SpectsSection'
import MaterialInputs from './MaterialInputs'

interface Props {
  spects: Record<string, number>
  baseMaterials: CraftMaterial[]
  enchantmentMaterials: Record<number, CraftMaterial[]>
  availableEnchantments: number[]
  onSpectsChange: (key: string, value: number) => void
  onBaseMaterialChange: (id: string, field: keyof CraftMaterial, value: string | number) => void
  onEnchantMaterialChange: (enchantment: number, id: string, field: keyof CraftMaterial, value: string | number) => void
  onSave: () => void
}

export default function ConfigPanel({
  spects,
  baseMaterials,
  enchantmentMaterials,
  availableEnchantments,
  onSpectsChange,
  onBaseMaterialChange,
  onEnchantMaterialChange,
  onSave,
}: Props) {
  const [open, setOpen] = useState(false)
  const [saved, setSaved] = useState(false)

  const enchants = availableEnchantments.filter(e => e > 0)

  return (
    <div className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800/40 transition-colors"
      >
        <span>Panel de configuración</span>
        <span className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {open && (
        <div className="px-6 pb-6 space-y-6 border-t border-slate-800 pt-5">
          <SpectsSection values={spects} onChange={onSpectsChange} />

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-300">Configuración adicional</h4>
            <div className="flex flex-wrap gap-4">
              {['Config 1', 'Config 2', 'Config 3'].map(cfg => (
                <div key={cfg} className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500">{cfg}</span>
                  <input
                    type="text"
                    disabled
                    className="h-9 w-28 px-3 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-600 text-sm placeholder-slate-700"
                    placeholder="Próximamente"
                  />
                </div>
              ))}
            </div>
          </div>

          <MaterialInputs
            title="Materiales base (compartidos en todos los encantamientos)"
            materials={baseMaterials}
            compact
            onChange={onBaseMaterialChange}
          />

          <h4 className="text-sm font-semibold text-slate-300">Salsas</h4>

          {enchants.map(level => (
            <MaterialInputs
              key={level}
              materials={enchantmentMaterials[level] ?? []}
              compact
              onChange={(id, field, value) => onEnchantMaterialChange(level, id, field, value)}
            />
          ))}

          <button
            onClick={() => { onSave(); setSaved(true); setTimeout(() => setSaved(false), 1500) }}
            className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {saved ? '\u2713 Guardado' : 'Guardar configuración'}
          </button>
        </div>
      )}
    </div>
  )
}
