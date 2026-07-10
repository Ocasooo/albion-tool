import { useState, useRef, useEffect } from 'react'
import type { MealItem } from '../../types/meal'

interface Props {
  query: string
  results: MealItem[]
  onQueryChange: (v: string) => void
  onSelect: (meal: MealItem) => void
}

export default function FoodSearchBar({ query, results, onQueryChange, onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSelect(meal: MealItem) {
    onSelect(meal)
    setOpen(false)
    onQueryChange('')
  }

  return (
    <div ref={ref} className="relative w-full max-w-xl mx-auto">
      <input
        type="text"
        value={query}
        onChange={e => {
          onQueryChange(e.target.value)
          setOpen(e.target.value.trim().length > 0)
        }}
        onFocus={() => { if (query.trim()) setOpen(true) }}
        placeholder="Buscar comida..."
        className="w-full h-12 px-5 text-base bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 outline-none focus:border-blue-500/50 transition-colors"
      />
      {open && results.length > 0 && (
        <ul className="absolute top-14 left-0 right-0 z-50 max-h-72 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-xl shadow-black/50">
          {results.map(meal => (
            <li key={meal.uniqueName}>
              <button
                onClick={() => handleSelect(meal)}
                className="w-full px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-3"
              >
                <img src={meal.icon} alt="" className="w-8 h-8 object-contain" />
                <span>{meal.name}</span>
                <span className="text-slate-500 text-xs ml-auto">T{meal.tier}.{meal.enchantment}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && query.trim() && results.length === 0 && (
        <div className="absolute top-14 left-0 right-0 z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-xl shadow-black/50 px-4 py-3 text-sm text-slate-500">
          Sin resultados
        </div>
      )}
    </div>
  )
}
