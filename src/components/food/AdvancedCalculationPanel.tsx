import { memo } from 'react'
import type { City, CityData } from '../../types/meal'
import { CITIES } from '../../types/meal'
import type { CityResult } from '../../calculos/advancedCalculator'

interface Props {
  cities: Record<City, CityData>
  marketSharePercent: number
  followRecommendation: boolean
  manualQuantityMode: boolean
  cityResults: CityResult[]
  totalProfit: number
  averageSellingPrice: number
  costPerUnit: number
  profitPerUnit: number
  silverPerFocus: number
  totalFocus: number
  hasFocusData: boolean
  craftQuantity: string
  unitsPerCraft: number
  totalRecommendedQuantity: number
  unassignedQuantity: number
  isOverAssigned: boolean
  overAssignedQuantity: number
  onCityChange: (city: City, data: CityData) => void
  onMarketShareChange: (percent: number) => void
  onFollowRecommendationChange: (follow: boolean) => void
  onManualQuantityModeChange: (manual: boolean) => void
  onCraftQuantityChange: (value: string) => void
}

function fmtSilver(v: number): string {
  if (v === 0) return '0'
  return v.toLocaleString('es-ES', { maximumFractionDigits: 0 })
}

function fmtNum(v: number): string {
  if (v === 0) return '0'
  return v.toLocaleString('es-ES', { maximumFractionDigits: 0 })
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
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
  )
}

function CityCard({
  city,
  data,
  result,
  manualQuantityMode,
  onChange,
}: {
  city: City
  data: CityData
  result: CityResult | undefined
  manualQuantityMode: boolean
  onChange: (data: CityData) => void
}) {
  return (
    <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={data.enabled}
              onChange={e => onChange({ ...data, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-8 h-[18px] bg-slate-700 rounded-full peer-checked:bg-blue-600 transition-colors" />
            <div className="absolute left-0.5 top-0.5 w-3.5 h-3.5 bg-slate-400 rounded-full peer-checked:bg-white peer-checked:translate-x-[14px] transition-all" />
          </div>
          <span className="text-xs text-slate-300 group-hover:text-slate-200 transition-colors font-medium">
            {city}
          </span>
        </label>
      </div>

      {manualQuantityMode ? (
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div>
            <span className="text-[10px] text-slate-500 mb-0.5 block">Ventas/d&#x00ED;a</span>
            <input
              type="number"
              value={data.dailySales || ''}
              onChange={e => onChange({ ...data, dailySales: parseInt(e.target.value) || 0 })}
              className="w-full h-7 px-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-600 outline-none focus:border-blue-500/50 transition-colors tabular-nums text-right"
              placeholder="0"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 mb-0.5 block">Precio</span>
            <input
              type="number"
              value={data.sellingPrice || ''}
              onChange={e => onChange({ ...data, sellingPrice: parseInt(e.target.value) || 0 })}
              className="w-full h-7 px-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-600 outline-none focus:border-blue-500/50 transition-colors tabular-nums text-right"
              placeholder="0"
            />
          </div>
          {data.enabled && (
            <div>
              <span className="text-[10px] text-slate-500 mb-0.5 block">A vender</span>
              <input
                type="number"
                value={data.sellQuantity || ''}
                onChange={e => onChange({ ...data, sellQuantity: parseInt(e.target.value) || 0 })}
                className="w-full h-7 px-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-600 outline-none focus:border-blue-500/50 transition-colors tabular-nums text-right"
                placeholder="0"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <span className="text-[10px] text-slate-500 mb-0.5 block">Ventas/d&#x00ED;a</span>
            <input
              type="number"
              value={data.dailySales || ''}
              onChange={e => onChange({ ...data, dailySales: parseInt(e.target.value) || 0 })}
              className="w-full h-7 px-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-600 outline-none focus:border-blue-500/50 transition-colors tabular-nums text-right"
              placeholder="0"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 mb-0.5 block">Precio</span>
            <input
              type="number"
              value={data.sellingPrice || ''}
              onChange={e => onChange({ ...data, sellingPrice: parseInt(e.target.value) || 0 })}
              className="w-full h-7 px-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-600 outline-none focus:border-blue-500/50 transition-colors tabular-nums text-right"
              placeholder="0"
            />
          </div>
        </div>
      )}

      {data.enabled && result && (
        <div className="space-y-0.5">
          {manualQuantityMode && result.isSaturated && (
            <div className="text-[11px] text-red-400 font-medium">Saturaci&#x00F3;n</div>
          )}
          <div className="text-[11px] text-slate-500">
            Recomendado: <span className="text-slate-400 font-mono">{result.recommendedQuantity}</span> uds
            {!manualQuantityMode && (
              <>
                {'  '}A vender: <span className={`font-mono ${result.actualQuantity > result.recommendedQuantity ? 'text-red-400' : 'text-slate-400'}`}>{result.actualQuantity}</span>
              </>
            )}
          </div>
          <div className="text-[11px] text-slate-500">
            Profit: <span className={`font-mono ${result.totalProfit > 0 ? 'text-green-400' : 'text-slate-400'}`}>{fmtSilver(result.totalProfit)}</span> silver
          </div>
        </div>
      )}
    </div>
  )
}

function ResultRow({ label, value, suffix = '', highlight = false }: { label: string; value: string; suffix?: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={`text-sm font-mono tabular-nums ${highlight ? 'text-green-400' : 'text-slate-200'}`}>
        {value || '0'}{suffix}
      </span>
    </div>
  )
}

export default memo(function AdvancedCalculationPanel({
  cities,
  marketSharePercent,
  followRecommendation,
  manualQuantityMode,
  cityResults,
  totalProfit,
  averageSellingPrice,
  costPerUnit,
  profitPerUnit,
  silverPerFocus,
  totalFocus,
  hasFocusData,
  craftQuantity,
  unitsPerCraft,
  totalRecommendedQuantity,
  unassignedQuantity,
  isOverAssigned,
  overAssignedQuantity,
  onCityChange,
  onMarketShareChange,
  onFollowRecommendationChange,
  onManualQuantityModeChange,
  onCraftQuantityChange,
}: Props) {
  return (
    <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
        An&#x00E1;lisis por ciudad
      </h3>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400 whitespace-nowrap">Cuota de mercado</span>
          <input
            type="number"
            value={marketSharePercent}
            onChange={e => onMarketShareChange(parseInt(e.target.value) || 0)}
            className="w-14 h-8 px-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-600 outline-none focus:border-blue-500/50 transition-colors tabular-nums text-right"
            min="0"
            max="100"
          />
          <span className="text-sm text-slate-500">%</span>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer group">
            <span className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors">
              Seguir recomendaci&#x00F3;n
            </span>
            <Toggle
              checked={followRecommendation}
              onChange={checked => {
                onFollowRecommendationChange(checked)
                if (checked && totalRecommendedQuantity > 0) {
                  onCraftQuantityChange(String(Math.ceil(totalRecommendedQuantity / unitsPerCraft)))
                }
              }}
            />
          </label>

          <label className="flex items-center gap-2 cursor-pointer group">
            <span className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors">
              Introducir cantidad
            </span>
            <Toggle
              checked={manualQuantityMode}
              onChange={onManualQuantityModeChange}
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {CITIES.map(city => (
          <CityCard
            key={city}
            city={city}
            data={cities[city]}
            result={cityResults.find(r => r.city === city)}
            manualQuantityMode={manualQuantityMode}
            onChange={data => onCityChange(city, data)}
          />
        ))}
      </div>

      {manualQuantityMode && isOverAssigned && (
        <div className="flex items-center gap-2 py-3 px-4 bg-red-500/20 border border-red-500/50 rounded-xl mb-4">
          <span className="text-lg">&#x26A0;</span>
          <span className="text-sm text-red-400 font-semibold">Necesitas craftear {fmtNum(overAssignedQuantity)} unidades m&#x00E1;s</span>
        </div>
      )}

      <div className="space-y-1 mb-4">
        <div className="flex items-center justify-between py-2 px-3 bg-slate-800/30 rounded-lg">
          <span className="text-xs text-slate-400">Cantidad total recomendada</span>
          <span className="text-sm font-mono text-slate-300 tabular-nums">{fmtNum(totalRecommendedQuantity)} uds</span>
        </div>
        {manualQuantityMode && (
          <div className="flex items-center justify-between py-2 px-3 bg-slate-800/30 rounded-lg">
            <span className="text-xs text-slate-400">Comida sin ubicar</span>
            <span className="text-sm font-mono text-slate-300 tabular-nums">{fmtNum(unassignedQuantity)} uds</span>
          </div>
        )}
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-4" />

      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Cantidad a craftear
      </h4>

      <div className="relative mb-4">
        <span className="absolute -top-4 right-1 text-[10px] text-slate-500 tabular-nums">
          1&#x00D7;{unitsPerCraft}
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

      <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-4" />

      <div className="space-y-3">
        <ResultRow
          label="Profit total"
          value={fmtSilver(totalProfit)}
          suffix=" silver"
          highlight={totalProfit > 0}
        />
        <ResultRow
          label="Precio promedio"
          value={fmtSilver(averageSellingPrice)}
          suffix=" silver"
        />
        <ResultRow
          label="Foco total"
          value={!hasFocusData ? 'Sin informaci&#x00F3;n' : fmtNum(totalFocus)}
        />
        <ResultRow
          label="Costo / unidad"
          value={fmtSilver(costPerUnit)}
          suffix=" silver"
        />
        <ResultRow
          label="Profit / unidad"
          value={fmtSilver(profitPerUnit)}
          suffix=" silver"
          highlight={profitPerUnit > 0}
        />
        <ResultRow
          label="Silver / focus"
          value={!hasFocusData ? '\u2014' : fmtSilver(silverPerFocus)}
        />
      </div>
    </div>
  )
})
