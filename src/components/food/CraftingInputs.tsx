import { memo } from 'react'
import type { CraftingResult } from '../../calculos/craftingCalculator'

interface Props {
  stationCost: string
  craftQuantity: string
  sellingPrice: string
  premium: boolean
  focus: boolean
  cityBonus: boolean
  unitsPerCraft: number
  result: CraftingResult | null
  onStationCostChange: (v: string) => void
  onPremiumChange: (v: boolean) => void
  onFocusChange: (v: boolean) => void
  onCityBonusChange: (v: boolean) => void
  onCraftQuantityChange: (v: string) => void
  onSellingPriceChange: (v: string) => void
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

function formatSilver(value: number): string {
  if (value === 0) return '0'
  return value.toLocaleString('es-ES', { maximumFractionDigits: 0 })
}

function formatFocus(value: number): string {
  if (value === 0) return '0'
  return value.toLocaleString('es-ES', { maximumFractionDigits: 0 })
}

export default memo(function CraftingInputs({
  stationCost, craftQuantity, sellingPrice,
  premium, focus, cityBonus,
  unitsPerCraft, result,
  onStationCostChange, onPremiumChange, onFocusChange, onCityBonusChange,
  onCraftQuantityChange, onSellingPriceChange,
}: Props) {
  return (
    <div className="space-y-4 w-120">
      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Costes
        </h3>

        <div className="flex gap-5">
          <div className="flex-1 space-y-4">
            <Toggle checked={premium} onChange={onPremiumChange} label="Premium" />
            <Toggle checked={focus} onChange={onFocusChange} label="Foco" />
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

      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Cantidad a craftear
        </h3>

        <div className="space-y-3">
          <div className="relative">
            <span className="absolute -top-4 right-1 text-[10px] text-slate-500 tabular-nums">
              1×{unitsPerCraft}
            </span>
            <div className="flex items-center justify-between gap-5">
              <span className="text-sm text-slate-400 whitespace-nowrap">Cantidad</span>
              <input
                type="number"
                value={craftQuantity}
                onChange={e => onCraftQuantityChange(e.target.value)}
                className="w-16 h-9 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-600 outline-none focus:border-blue-500/50 transition-colors tabular-nums text-right"
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-5">
            <span className="text-sm text-slate-400 whitespace-nowrap">Precio venta</span>
            <input
              type="number"
              value={sellingPrice}
              onChange={e => onSellingPriceChange(e.target.value)}
              className="w-28 h-9 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-600 outline-none focus:border-blue-500/50 transition-colors tabular-nums text-right"
              placeholder="0"
            />
          </div>
          <DisplayValue label="Foco total" value={result ? formatFocus(result.totalFocus) : '0'} />
          <DisplayValue label="Costo / unidad" value={result ? formatSilver(result.costPerUnit) : '0'} suffix=" silver" />
          <DisplayValue label="Profit / unidad" value={result ? formatSilver(result.profitPerUnit) : '0'} suffix=" silver" highlight={result ? result.profitPerUnit > 0 : false} />
          <DisplayValue label="Profit total" value={result ? formatSilver(result.profitPerBatch) : '0'} suffix=" silver" highlight={result ? result.profitPerBatch > 0 : false} />
           <DisplayValue label="Silver / focus" value={result ? formatSilver(result.silverPerFocus) : '0'} suffix="" highlight={result ? result.silverPerFocus > 0 : false} />
        </div>
      </div>
    </div>
  )
})
