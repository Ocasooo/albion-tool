import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import type { MealItem, CraftMaterial, AppConfig, RecipeMetadata } from '../types/meal'
import { getAllMeals as getMeals, getMealMaterials } from '../services/mealDbService'
import { loadConfig, saveConfig } from '../services/configService'
import { calcFullRecipe } from '../calculos/craftingCalculator'
import type { CraftingResult } from '../calculos/craftingCalculator'
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

export default function Food() {
  const [allMeals, setAllMeals] = useState<MealItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedMeal, setSelectedMeal] = useState<MealItem | null>(null)
  const [selectedEnchantment, setSelectedEnchantment] = useState(0)
  const [stationCost, setStationCost] = useState('')
  const [premium, setPremium] = useState(false)
  const [focus, setFocus] = useState(false)
  const [cityBonus, setCityBonus] = useState(false)
  const [craftQuantity, setCraftQuantity] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [recipeMeta, setRecipeMeta] = useState<RecipeMetadata | null>(null)
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
  const [materialsLoading, setMaterialsLoading] = useState(false)

  const loadedRef = useRef(false)
  const stateRef = useRef({
    spects, stationCost, premium, focus, cityBonus, craftQuantity, sellingPrice,
    baseName: null as string | null,
    baseMaterials: [] as CraftMaterial[],
    enchantmentMaterials: {} as Record<number, CraftMaterial[]>,
  })

  useEffect(() => {
    const config = loadConfig()
    setSpects(config.spects)
    setStationCost(config.craftingInputs.stationCost)
    setPremium(config.craftingInputs.premium)
    setFocus(config.craftingInputs.focus)
    setCityBonus(config.craftingInputs.cityBonus)
    setCraftQuantity(config.craftingInputs.craftQuantity)
    setSellingPrice(config.craftingInputs.sellingPrice)
    loadedRef.current = true
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

  useEffect(() => {
    stateRef.current = {
      spects, stationCost, premium, focus, cityBonus, craftQuantity, sellingPrice,
      baseName, baseMaterials, enchantmentMaterials,
    }
  }, [spects, stationCost, premium, focus, cityBonus, craftQuantity, sellingPrice, baseName, baseMaterials, enchantmentMaterials])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 150)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const filteredMeals = useMemo(() => {
    if (!debouncedQuery.trim()) return []
    const q = debouncedQuery.toLowerCase()
    return allMeals.filter(
      m => m.name.toLowerCase().includes(q) || m.nameEn.toLowerCase().includes(q),
    ).slice(0, 30)
  }, [allMeals, debouncedQuery])

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!loadedRef.current) return
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    autoSaveTimerRef.current = setTimeout(() => {
      const config: AppConfig = {
        meals: {},
        spects,
        craftingInputs: { stationCost, premium, focus, cityBonus, craftQuantity, sellingPrice },
      }
      const existing = loadConfig()
      config.meals = { ...existing.meals }
      if (baseName) {
        config.meals[baseName] = { baseName, baseMaterials, enchantmentMaterials }
      }
      saveConfig(config)
    }, 500)
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current) }
  }, [spects, stationCost, premium, focus, cityBonus, craftQuantity, sellingPrice, baseName, baseMaterials, enchantmentMaterials])

  const availableEnchantments = useMemo(() => {
    if (!baseName) return []
    if (selectedMeal && selectedMeal.tier < 4) return [0]
    return allMeals
      .filter(m => getBaseName(m.uniqueName) === baseName)
      .map(m => m.enchantment)
      .sort()
  }, [allMeals, baseName, selectedMeal])

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

  const craftResult: CraftingResult | null = useMemo(() => {
    if (!recipeMeta || !displayedMeal) return null
    const enchData = recipeMeta.allEnchantments[selectedEnchantment]
    return calcFullRecipe({
      materials: displayedMaterials,
      sellingPrice: parseFloat(sellingPrice) || 0,
      spects,
      premium,
      focus,
      cityBonus,
      stationCost: parseFloat(stationCost) || 0,
      foodType: recipeMeta.foodType,
      baseFocus: enchData?.baseFocus ?? recipeMeta.baseFocus,
      iv: enchData?.iv ?? recipeMeta.iv,
      unitsPerCraft: recipeMeta.unitsPerCraft,
      craftQuantity: parseInt(craftQuantity) || 0,
    })
  }, [recipeMeta, selectedEnchantment, displayedMeal, displayedMaterials, sellingPrice, spects, premium, focus, cityBonus, stationCost, craftQuantity])

  function handleSelectMeal(meal: MealItem) {
    const config = loadConfig()

    if (loadedRef.current && baseName) {
      config.meals[baseName] = { baseName, baseMaterials, enchantmentMaterials }
      saveConfig(config)
    }

    const bn = getBaseName(meal.uniqueName)
    const savedMeal = config.meals[bn]

    setMaterialsLoading(true)
    getMealMaterials(bn).then(dbMaterials => {
      const mergeMaterials = (dbMats: CraftMaterial[], savedMats: CraftMaterial[]) => {
        return dbMats.map(dbMat => {
          const saved = savedMats.find(s => s.name === dbMat.name)
          return { ...dbMat, pricePerUnit: saved?.pricePerUnit ?? 0 }
        })
      }

      setBaseMaterials(mergeMaterials(dbMaterials.base, savedMeal?.baseMaterials ?? []))

      const enchMats: Record<number, CraftMaterial[]> = {}
      for (const [level, mats] of Object.entries(dbMaterials.enchantment)) {
        const levelNum = parseInt(level)
        enchMats[levelNum] = mergeMaterials(mats, savedMeal?.enchantmentMaterials[levelNum] ?? [])
      }
      setEnchantmentMaterials(enchMats)
      setRecipeMeta(dbMaterials.metadata)
      setMaterialsLoading(false)
    })

    setSelectedMeal(meal)
    setSelectedEnchantment(meal.enchantment)
  }

  const handleEnchantmentSelect = useCallback((level: number) => {
    setSelectedEnchantment(level)
  }, [])

  function handleSpectsChange(key: string, value: number) {
    setSpects(prev => ({ ...prev, [key]: value }))
  }

  function handleBaseMaterialChange(id: string, field: keyof CraftMaterial, value: string | number) {
    setBaseMaterials(prev =>
      prev.map(m => (m.id === id ? { ...m, [field]: value } : m)),
    )
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
    config.craftingInputs = { stationCost, premium, focus, cityBonus, craftQuantity, sellingPrice }
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
        premium: s.premium,
        focus: s.focus,
        cityBonus: s.cityBonus,
        craftQuantity: s.craftQuantity,
        sellingPrice: s.sellingPrice,
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
          materialsLoading ? (
            <div className="flex flex-wrap gap-6 justify-center">
              <div className="space-y-4 items-center">
                <div className="w-64 h-10 bg-slate-800/60 rounded-lg animate-pulse" />
                <div className="flex flex-wrap gap-4 justify-center">
                  <div className="w-40 h-48 bg-slate-800/60 rounded-xl animate-pulse" />
                  <div className="w-72 h-48 bg-slate-800/60 rounded-xl animate-pulse" />
                </div>
              </div>
              <div className="min-w-56 space-y-3">
                <div className="h-8 bg-slate-800/60 rounded-lg animate-pulse" />
                <div className="h-8 bg-slate-800/60 rounded-lg animate-pulse" />
                <div className="h-8 bg-slate-800/60 rounded-lg animate-pulse" />
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-6 justify-center">
                <div className="space-y-4 items-center">
                  <EnchantmentSelector
                    available={availableEnchantments}
                    selected={selectedEnchantment}
                    onSelect={handleEnchantmentSelect}
                  />
                  <div className="flex flex-wrap gap-4 justify-center">
                    <FoodCard meal={displayedMeal} />
                    <FoodMaterials materials={displayedMaterials} />
                  </div>
                </div>

                <div className="min-w-56">
                  <CraftingInputs
                    stationCost={stationCost}
                    craftQuantity={craftQuantity}
                    sellingPrice={sellingPrice}
                    premium={premium}
                    focus={focus}
                    cityBonus={cityBonus}
                    unitsPerCraft={recipeMeta?.unitsPerCraft ?? 10}
                    result={craftResult}
                    onStationCostChange={setStationCost}
                    onPremiumChange={setPremium}
                    onFocusChange={setFocus}
                    onCityBonusChange={setCityBonus}
                    onCraftQuantityChange={setCraftQuantity}
                    onSellingPriceChange={setSellingPrice}
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
                onBaseMaterialChange={handleBaseMaterialChange}
                onEnchantMaterialChange={handleEnchantMaterialChange}
                onSave={handleSave}
              />
            </>
          )
        ) : !loading && allMeals.length > 0 ? (
          <div className="text-center text-slate-500 py-16">
            <p className="text-lg">Busca una comida para comenzar</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
