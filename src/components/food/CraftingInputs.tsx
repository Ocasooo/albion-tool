interface Props {
  stationCost: string
  returnPercent: string
  taxes: string
  premium: string
  focus: string
  cityBonus: string
  onStationCostChange: (v: string) => void
  onReturnPercentChange: (v: string) => void
  onTaxesChange: (v: string) => void
  onPremiumChange: (v: string) => void
  onFocusChange: (v: string) => void
  onCityBonusChange: (v: string) => void
}

const CITIES = ['Caerleon', 'Bridgewatch', 'Fort Sterling', 'Lymhurst', 'Martlock', 'Thetford']

export default function CraftingInputs({
  stationCost, returnPercent, taxes, premium, focus, cityBonus,
  onStationCostChange, onReturnPercentChange, onTaxesChange,
  onPremiumChange, onFocusChange, onCityBonusChange,
}: Props) {
  const inputClass = 'w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 outline-none focus:border-blue-500/50 transition-colors text-sm'
  const labelClass = 'text-xs text-slate-400 mb-1 block'
  const selectClass = 'w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500/50 transition-colors text-sm appearance-none cursor-pointer'

  return (
    <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl min-w-56 space-y-4">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Costes
      </h3>

      <div>
        <label className={labelClass}>Coste estación</label>
        <input type="number" value={stationCost} onChange={e => onStationCostChange(e.target.value)} className={inputClass} placeholder="0" />
      </div>

      <div>
        <label className={labelClass}>Retorno %</label>
        <input type="number" value={returnPercent} onChange={e => onReturnPercentChange(e.target.value)} className={inputClass} placeholder="0" />
      </div>

      <div>
        <label className={labelClass}>Impuestos %</label>
        <input type="number" value={taxes} onChange={e => onTaxesChange(e.target.value)} className={inputClass} placeholder="0" />
      </div>

      <div>
        <label className={labelClass}>Premium</label>
        <select value={premium} onChange={e => onPremiumChange(e.target.value)} className={selectClass}>
          <option value="No">No</option>
          <option value="Sí">Sí</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>Foco</label>
        <select value={focus} onChange={e => onFocusChange(e.target.value)} className={selectClass}>
          <option value="No">No</option>
          <option value="Sí">Sí</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>Bono de ciudad</label>
        <select value={cityBonus} onChange={e => onCityBonusChange(e.target.value)} className={selectClass}>
          <option value="">Sin bono</option>
          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>
  )
}
