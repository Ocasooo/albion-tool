import { memo } from 'react'
import type { MealItem } from '../../types/meal'

interface Props {
  meal: MealItem
}

export default memo(function FoodCard({ meal }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
      <span className="text-lg font-semibold text-white text-center leading-tight">
        {meal.name}
      </span>
      <div className="w-24 h-24 bg-slate-800/80 rounded-xl flex items-center justify-center border border-slate-700">
        <img
          src={meal.icon}
          alt={meal.name}
          className="w-16 h-16 object-contain" loading="lazy" decoding="async"
        />
      </div>
      <span className="text-xs text-slate-500">T{meal.tier}</span>
    </div>
  )
})
