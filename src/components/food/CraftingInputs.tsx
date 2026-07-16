import { memo } from 'react'
import type { CraftingResult } from '../../calculos/craftingCalculator'
import type { CalculationMode } from '../../types/meal'

interface Props {
  stationCost: string
  premium: boolean
  focus: boolean
  cityBonus: boolean
  hasFocusData: boolean
  result: CraftingResult | null
  availableEnchantments: number[]
  selectedEnchantment: number
  calculationMode: CalculationMode
  onEnchantmentSelect: (v: number) => void
  onStationCostChange: (v: string) => void
  onPremiumChange: (v: boolean) => void
  onFocusChange: (v: boolean) => void
  onCityBonusChange: (v: boolean) => void
  onCalculationModeChange: (mode: CalculationMode) => void
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors">
        {label}
      </span>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-9 h-5 bg-slate-700 rounded-full peer-checked:bg-blue-600 transition-colors" />
        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-slate-400 rounded-full peer-checked:bg-white peer-checked:translate-x-4 transition-all" />
      </div>
    </label>
  )
}

function DisplayValue({ label, value, suffix = '', highlight = false }: { label: string; value: string; suffix?: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={`text-sm font-mono tabular-nums ${highlight ? 'text-green-400' : 'text-slate-200'}`}>
        {value || '0'}{suffix}
      </span>
    </div>
  )
}

export default memo(function CraftingInputs({
  stationCost,
  premium, focus, cityBonus,
  hasFocusData, result,
  availableEnchantments, selectedEnchantment,
  calculationMode,
  onEnchantmentSelect,
  onStationCostChange, onPremiumChange, onFocusChange, onCityBonusChange,
  onCalculationModeChange,
}: Props) {
  return (
    <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Modo de cálculo
        </h3>
        <label className="flex items-center gap-2 cursor-pointer group">
          <span className={`text-xs transition-colors ${calculationMode === 'basic' ? 'text-blue-400' : 'text-slate-500'}`}>
            Básico
          </span>
          <div className="relative">
            <input
              type="checkbox"
              checked={calculationMode === 'advanced'}
              onChange={e => onCalculationModeChange(e.target.checked ? 'advanced' : 'basic')}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-slate-700 rounded-full peer-checked:bg-blue-600 transition-colors" />
            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-slate-400 rounded-full peer-checked:bg-white peer-checked:translate-x-5 transition-all" />
          </div>
          <span className={`text-xs transition-colors ${calculationMode === 'advanced' ? 'text-blue-400' : 'text-slate-500'}`}>
            Avanzado
          </span>
        </label>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-4" />

      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Encantamientos
      </h3>
      <div className="flex gap-2 mb-4">
        {[0, 1, 2, 3].map(level => {
          const exists = availableEnchantments.includes(level)
          return (
            <button
              key={level}
              disabled={!exists}
              onClick={() => onEnchantmentSelect(level)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-all border ${
                selectedEnchantment === level
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30'
                  : exists
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-900/50 border-slate-800/50 text-slate-700 cursor-not-allowed opacity-40'
              }`}
            >
              {level}
            </button>
          )
        })}
      </div>

      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
        Costes
      </h3>

      <div className="flex gap-5">
        <div className="flex-1 space-y-4">
          <Toggle checked={premium} onChange={onPremiumChange} label="Premium" />
          <Toggle checked={focus} onChange={onFocusChange} label="Foco" />
          {focus && !hasFocusData && (
            <p className="text-[11px] text-amber-400/80 -mt-1 ml-1">Sin información de foco para esta receta</p>
          )}
          <Toggle checked={cityBonus} onChange={onCityBonusChange} label="Bono ciudad" />
        </div>

        <div className="w-px bg-slate-800" />

        <div className="flex-1 space-y-3 -mt-2">
          <div className="flex items-center justify-between gap-5">
            <span className="text-sm text-slate-400 whitespace-nowrap">Coste estacion</span>
            <input
              type="number"
              value={stationCost}
              onChange={e => onStationCostChange(e.target.value)}
              className="w-16 h-9 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-600 outline-none focus:border-blue-500/50 transition-colors tabular-nums text-right"
              placeholder="0"
            />
          </div>
          <DisplayValue label="Retorno" value={result ? result.returnRate.toFixed(1) : '15.3'} suffix="%" />
          <DisplayValue label="Impuestos" value={result ? result.taxes.toFixed(1) : '10.5'} suffix="%" />
        </div>
      </div>
    </div>
  )
})
