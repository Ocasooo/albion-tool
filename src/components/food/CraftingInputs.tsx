interface Props {
  stationCost: string
  returnPercent: string
  taxes: string
  premium: boolean
  focus: boolean
  cityBonus: boolean
  onStationCostChange: (v: string) => void
  onPremiumChange: (v: boolean) => void
  onFocusChange: (v: boolean) => void
  onCityBonusChange: (v: boolean) => void
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

function DisplayValue({ label, value, suffix = '' }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-mono text-slate-200 tabular-nums">
        {value || '0'}{suffix}
      </span>
    </div>
  )
}

export default function CraftingInputs({
  stationCost, returnPercent, taxes, premium, focus, cityBonus,
  onStationCostChange, onPremiumChange, onFocusChange, onCityBonusChange,
}: Props) {
  return (
    <div className="p-5 mt-14 bg-slate-900/60 border border-slate-800 rounded-2xl w-120">
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
          <DisplayValue label="Retorno" value={returnPercent} suffix="%" />
          <DisplayValue label="Impuestos" value={taxes} suffix="%" />
        </div>
      </div>
    </div>
  )
}
