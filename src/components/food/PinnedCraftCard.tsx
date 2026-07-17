import { memo } from 'react'
import type { PinnedCraft } from '../../types/meal'

interface Props {
  craft: PinnedCraft
  isActive: boolean
  onUnpin: (id: string) => void
  onUpdate: (id: string) => void
}

function fmtSilver(v: number): string {
  if (v === 0) return '0'
  return v.toLocaleString('es-ES', { maximumFractionDigits: 0 })
}

function fmtNum(v: number): string {
  if (v === 0) return '0'
  return v.toLocaleString('es-ES', { maximumFractionDigits: 0 })
}

export default memo(function PinnedCraftCard({ craft, isActive, onUnpin, onUpdate }: Props) {
  return (
    <div className={`p-4 bg-slate-900/60 border rounded-2xl transition-colors ${isActive ? 'border-blue-500/50' : 'border-slate-800'}`}>
      <div className="flex items-center gap-3 mb-3">
        <img
          src={craft.mealIcon}
          alt={craft.mealName}
          className="w-12 h-12 rounded-lg"
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-slate-200 truncate">{craft.mealName}</h4>
          <span className="text-[11px] text-slate-500 font-mono">T{craft.tier}.{craft.enchantment}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {isActive && (
            <button
              onClick={() => onUpdate(craft.id)}
              className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
              title="Actualizar pin"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H4.598a.75.75 0 00-.75.75v3.634a.75.75 0 001.5 0v-2.033l.312.311a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V3.75a.75.75 0 00-1.5 0V5.37l-.312-.311A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h3.634a.75.75 0 00.53-.219z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          <button
            onClick={() => onUnpin(craft.id)}
            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Despinear"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <span className="text-[10px] text-slate-500 block mb-0.5">Profit total</span>
          <span className={`text-sm font-mono tabular-nums ${craft.result.profitPerBatch > 0 ? 'text-green-400' : 'text-slate-300'}`}>
            {fmtSilver(craft.result.profitPerBatch)}
          </span>
        </div>
        <div className="text-center">
          <span className="text-[10px] text-slate-500 block mb-0.5">Foco total</span>
          <span className="text-sm font-mono tabular-nums text-slate-300">
            {fmtNum(craft.result.totalFocus)}
          </span>
        </div>
        <div className="text-center">
          <span className="text-[10px] text-slate-500 block mb-0.5">Coste total</span>
          <span className="text-sm font-mono tabular-nums text-slate-300">
            {fmtSilver(craft.result.costPerUnit * craft.craftQuantity * craft.recipeMeta.unitsPerCraft)}
          </span>
        </div>
      </div>
    </div>
  )
})
