interface Props {
  available: number[]
  selected: number
  onSelect: (v: number) => void
}

export default function EnchantmentSelector({ available, selected, onSelect }: Props) {
  const levels = [0, 1, 2, 3]

  return (
    <div className="flex gap-2">
      {levels.map(level => {
        const exists = available.includes(level)
        return (
          <button
            key={level}
            disabled={!exists}
            onClick={() => onSelect(level)}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition-all border ${
              selected === level
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
  )
}
