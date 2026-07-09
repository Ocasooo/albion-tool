import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import type { MealItem, CraftMaterial, AppConfig } from '../types/meal'
import { getMeals } from '../services/mealService'
import { loadConfig, saveConfig } from '../services/configService'
import FoodSearchBar from '../components/food/FoodSearchBar'
import EnchantmentSelector from '../components/food/EnchantmentSelector'
import FoodCard from '../components/food/FoodCard'
import FoodMaterials from '../components/food/FoodMaterials'
import CraftingInputs from '../components/food/CraftingInputs'
import ConfigPanel from '../components/food/ConfigPanel'

function getBaseName(uniqueName: string): string {
  return uniqueName.replace(/@\d+$/, '')
}

function getVariantName(baseName: string, enchantment: number): string {
  return enchantment === 0 ? baseName : `${baseName}@${enchantment}`
}

let materialIdCounter = 0

export default function Food() {
  const [allMeals, setAllMeals] = useState<MealItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMeal, setSelectedMeal] = useState<MealItem | null>(null)
  const [selectedEnchantment, setSelectedEnchantment] = useState(0)
  const [stationCost, setStationCost] = useState('')
  const [returnPercent, setReturnPercent] = useState('')
  const [taxes, setTaxes] = useState('')
  const [premium, setPremium] = useState('No')
  const [focus, setFocus] = useState('No')
  const [cityBonus, setCityBonus] = useState('')
  const [spects, setSpects] = useState<Record<string, number>>({
    cook: 0,
    butchering: 0,
    ingredients: 0,
    sandwich: 0,
    stews: 0,
    tortillas: 0,
    salads: 0,
    cakes: 0,
    roasts: 0,
    soups: 0,
  })
  const [baseMaterials, setBaseMaterials] = useState<CraftMaterial[]>([])
  const [enchantmentMaterials, setEnchantmentMaterials] = useState<Record<number, CraftMaterial[]>>({})

  const loadedRef = useRef(false)
  const stateRef = useRef({
    spects, stationCost, returnPercent, taxes, premium, focus, cityBonus,
    baseName: null as string | null,
    baseMaterials: [] as CraftMaterial[],
    enchantmentMaterials: {} as Record<number, CraftMaterial[]>,
  })

  useEffect(() => {
    stateRef.current = {
      spects, stationCost, returnPercent, taxes, premium, focus, cityBonus,
      baseName, baseMaterials, enchantmentMaterials,
    }
  })

  useEffect(() => {
    const config = loadConfig()
    setSpects(config.spects)
    setStationCost(config.craftingInputs.stationCost)
    setReturnPercent(config.craftingInputs.returnPercent)
    setTaxes(config.craftingInputs.taxes)
    setPremium(config.craftingInputs.premium)
    setFocus(config.craftingInputs.focus)
    setCityBonus(config.craftingInputs.cityBonus)
  }, [])

  useEffect(() => {
    getMeals()
      .then(setAllMeals)
      .finally(() => setLoading(false))
  }, [])

  const baseName = useMemo(
    () => (selectedMeal ? getBaseName(selectedMeal.uniqueName) : null),
    [selectedMeal],
  )

  const filteredMeals = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return allMeals.filter(
      m => m.name.toLowerCase().includes(q) || m.nameEn.toLowerCase().includes(q),
    ).slice(0, 30)
  }, [allMeals, searchQuery])

  useEffect(() => {
    if (!loadedRef.current) return
    const config: AppConfig = {
      meals: {},
      spects,
      craftingInputs: { stationCost, returnPercent, taxes, premium, focus, cityBonus },
    }
    const existing = loadConfig()
    config.meals = { ...existing.meals }
    if (baseName) {
      config.meals[baseName] = { baseName, baseMaterials, enchantmentMaterials }
    }
    saveConfig(config)
  }, [spects, stationCost, returnPercent, taxes, premium, focus, cityBonus, baseName, baseMaterials, enchantmentMaterials])

  useEffect(() => {
    loadedRef.current = true
  })

  const availableEnchantments = useMemo(() => {
    if (!baseName) return []
    return allMeals
      .filter(m => getBaseName(m.uniqueName) === baseName)
      .map(m => m.enchantment)
      .sort()
  }, [allMeals, baseName])

  const displayedMeal = useMemo(() => {
    if (!baseName || availableEnchantments.length === 0) return null
    const targetName = getVariantName(baseName, selectedEnchantment)
    return allMeals.find(m => m.uniqueName === targetName) ?? selectedMeal
  }, [allMeals, baseName, selectedEnchantment, selectedMeal, availableEnchantments])

  const displayedMaterials = useMemo(() => {
    if (selectedEnchantment === 0) return baseMaterials
    const extra = enchantmentMaterials[selectedEnchantment] ?? []
    return [...baseMaterials, ...extra]
  }, [baseMaterials, enchantmentMaterials, selectedEnchantment])

  function handleSelectMeal(meal: MealItem) {
    if (loadedRef.current && baseName) {
      const config = loadConfig()
      config.meals[baseName] = { baseName, baseMaterials, enchantmentMaterials }
      saveConfig(config)
    }

    const bn = getBaseName(meal.uniqueName)
    const config = loadConfig()
    const mealConfig = config.meals[bn]

    setSelectedMeal(meal)
    setSelectedEnchantment(meal.enchantment)
    setBaseMaterials(mealConfig?.baseMaterials ?? [])
    setEnchantmentMaterials(mealConfig?.enchantmentMaterials ?? {})
  }

  const handleEnchantmentSelect = useCallback((level: number) => {
    setSelectedEnchantment(level)
  }, [])

  function handleSpectsChange(key: string, value: number) {
    setSpects(prev => ({ ...prev, [key]: value }))
  }

  function handleBaseMaterialAdd() {
    materialIdCounter++
    setBaseMaterials(prev => [
      ...prev,
      { id: `mat_${materialIdCounter}`, name: '', quantity: 0, pricePerUnit: 0 },
    ])
  }

  function handleBaseMaterialRemove(id: string) {
    setBaseMaterials(prev => prev.filter(m => m.id !== id))
  }

  function handleBaseMaterialChange(id: string, field: keyof CraftMaterial, value: string | number) {
    setBaseMaterials(prev =>
      prev.map(m => (m.id === id ? { ...m, [field]: value } : m)),
    )
  }

  function handleEnchantMaterialAdd(enchantment: number) {
    materialIdCounter++
    setEnchantmentMaterials(prev => {
      const list = prev[enchantment] ?? []
      return {
        ...prev,
        [enchantment]: [...list, { id: `mat_${materialIdCounter}`, name: '', quantity: 0, pricePerUnit: 0 }],
      }
    })
  }

  function handleEnchantMaterialRemove(enchantment: number, id: string) {
    setEnchantmentMaterials(prev => ({
      ...prev,
      [enchantment]: (prev[enchantment] ?? []).filter(m => m.id !== id),
    }))
  }

  function handleEnchantMaterialChange(enchantment: number, id: string, field: keyof CraftMaterial, value: string | number) {
    setEnchantmentMaterials(prev => ({
      ...prev,
      [enchantment]: (prev[enchantment] ?? []).map(m =>
        m.id === id ? { ...m, [field]: value } : m,
      ),
    }))
  }

  function handleSave() {
    const config = loadConfig()
    config.spects = spects
    config.craftingInputs = { stationCost, returnPercent, taxes, premium, focus, cityBonus }
    if (baseName) {
      config.meals[baseName] = { baseName, baseMaterials, enchantmentMaterials }
    }
    saveConfig(config)
  }

  useEffect(() => {
    if (!loadedRef.current) return
    function handleBeforeUnload() {
      const s = stateRef.current
      const config = loadConfig()
      config.spects = s.spects
      config.craftingInputs = {
        stationCost: s.stationCost,
        returnPercent: s.returnPercent,
        taxes: s.taxes,
        premium: s.premium,
        focus: s.focus,
        cityBonus: s.cityBonus,
      }
      if (s.baseName) {
        config.meals[s.baseName] = {
          baseName: s.baseName,
          baseMaterials: s.baseMaterials,
          enchantmentMaterials: s.enchantmentMaterials,
        }
      }
      saveConfig(config)
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-500 text-lg">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <FoodSearchBar
          query={searchQuery}
          results={filteredMeals}
          onQueryChange={setSearchQuery}
          onSelect={handleSelectMeal}
        />

        {selectedMeal && displayedMeal ? (
          <>
            <div className="flex flex-wrap gap-6">
              <div className="space-y-4">
                <EnchantmentSelector
                  available={availableEnchantments}
                  selected={selectedEnchantment}
                  onSelect={handleEnchantmentSelect}
                />
                <div className="flex flex-wrap gap-4">
                  <FoodCard meal={displayedMeal} />
                  <FoodMaterials materials={displayedMaterials} />
                </div>
              </div>

              <div className="flex-1 min-w-56">
                <CraftingInputs
                  stationCost={stationCost}
                  returnPercent={returnPercent}
                  taxes={taxes}
                  premium={premium}
                  focus={focus}
                  cityBonus={cityBonus}
                  onStationCostChange={setStationCost}
                  onReturnPercentChange={setReturnPercent}
                  onTaxesChange={setTaxes}
                  onPremiumChange={setPremium}
                  onFocusChange={setFocus}
                  onCityBonusChange={setCityBonus}
                />
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

            <ConfigPanel
              spects={spects}
              baseMaterials={baseMaterials}
              enchantmentMaterials={enchantmentMaterials}
              availableEnchantments={availableEnchantments}
              onSpectsChange={handleSpectsChange}
              onBaseMaterialAdd={handleBaseMaterialAdd}
              onBaseMaterialRemove={handleBaseMaterialRemove}
              onBaseMaterialChange={handleBaseMaterialChange}
              onEnchantMaterialAdd={handleEnchantMaterialAdd}
              onEnchantMaterialRemove={handleEnchantMaterialRemove}
              onEnchantMaterialChange={handleEnchantMaterialChange}
              onSave={handleSave}
            />
          </>
        ) : !loading && allMeals.length > 0 ? (
          <div className="text-center text-slate-500 py-16">
            <p className="text-lg">Busca una comida para comenzar</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
