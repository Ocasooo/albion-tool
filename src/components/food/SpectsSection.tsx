interface Props {
  values: Record<string, number>
  onChange: (key: string, value: number) => void
}

interface SpecField {
  key: string
  label: string
}

const ROW1: SpecField[] = [
  { key: 'cook', label: 'Cocinero' },
  { key: 'butchering', label: 'Carnicería' },
  { key: 'ingredients', label: 'Ingredientes' },
  { key: 'sandwich', label: 'Bocadillo' },
  { key: 'stews', label: 'Guisos' },
]

const ROW2: SpecField[] = [
  { key: 'tortillas', label: 'Tortillas' },
  { key: 'salads', label: 'Ensaladas' },
  { key: 'cakes', label: 'Pasteles' },
  { key: 'roasts', label: 'Asados' },
  { key: 'soups', label: 'Sopas' },
]

export default function SpectsSection({ values, onChange }: Props) {
  const inputClass = 'w-full h-9 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 outline-none focus:border-blue-500/50 transition-colors text-sm'

  function renderRow(fields: SpecField[]) {
    return (
      <div className="flex flex-wrap gap-4">
        {fields.map(f => (
          <div key={f.key} className="flex flex-col gap-1">
            <span className="text-xs text-slate-400 whitespace-nowrap">{f.label}</span>
            <input
              type="number"
              value={values[f.key] === 0 ? '' : values[f.key]}
              onChange={e => onChange(f.key, e.target.value === '' ? 0 : Number(e.target.value))}
              className={inputClass}
              style={{ width: '5rem' }}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-slate-300">Especializaciones</h4>
      <div className="space-y-3">
        {renderRow(ROW1)}
        {renderRow(ROW2)}
      </div>
    </div>
  )
}
