import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import type { MealItem, CraftMaterial, AppConfig, RecipeMetadata, CalculationMode, City, CityData } from '../types/meal'
import { getAllMeals as getMeals, getMealMaterials } from '../services/mealDbService'
import { loadConfig, saveConfig } from '../services/configService'
import { calcFullRecipe, calcReturnRate } from '../calculos/craftingCalculator'
import type { CraftingResult } from '../calculos/craftingCalculator'
import { calcAdvancedRecipe } from '../calculos/advancedCalculator'
import type { AdvancedCalculationResult } from '../calculos/advancedCalculator'
import FoodSearchBar from '../components/food/FoodSearchBar'
import FoodCard from '../components/food/FoodCard'
import MaterialsSummary from '../components/food/MaterialsSummary'
import CraftingInputs from '../components/food/CraftingInputs'
import ConfigPanel from '../components/food/ConfigPanel'
import AdvancedCalculationPanel from '../components/food/AdvancedCalculationPanel'

function fmtSilver(v: number): string {
  if (v === 0) return '0'
  return v.toLocaleString('es-ES', { maximumFractionDigits: 0 })
}

function fmtNum(v: number): string {
  if (v === 0) return '0'
  return v.toLocaleString('es-ES', { maximumFractionDigits: 0 })
}

function CraftResultRow({ label, value, suffix = '', highlight = false }: { label: string; value: string; suffix?: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={`text-sm font-mono tabular-nums ${highlight ? 'text-green-400' : 'text-slate-200'}`}>
        {value || '0'}{suffix}
      </span>
    </div>
  )
}

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
  const [calculationMode, setCalculationMode] = useState<CalculationMode>('basic')
  const [cityData, setCityData] = useState<Record<City, CityData>>({
    Martlock: { dailySales: 0, sellingPrice: 0, enabled: false, sellQuantity: 0 },
    Bridgewatch: { dailySales: 0, sellingPrice: 0, enabled: false, sellQuantity: 0 },
    Lymhurst: { dailySales: 0, sellingPrice: 0, enabled: false, sellQuantity: 0 },
    'Fort Sterling': { dailySales: 0, sellingPrice: 0, enabled: false, sellQuantity: 0 },
    Thetford: { dailySales: 0, sellingPrice: 0, enabled: false, sellQuantity: 0 },
  })
  const [marketSharePercent, setMarketSharePercent] = useState(5)
  const [followRecommendation, setFollowRecommendation] = useState(false)
  const [manualQuantityMode, setManualQuantityMode] = useState(false)

  const loadedRef = useRef(false)
  const stateRef = useRef({
    spects, stationCost, premium, focus, cityBonus, craftQuantity, sellingPrice,
    baseName: null as string | null,
    baseMaterials: [] as CraftMaterial[],
    enchantmentMaterials: {} as Record<number, CraftMaterial[]>,
    calculationMode: 'basic' as CalculationMode,
    cityData: {} as Record<City, CityData>,
    marketSharePercent: 5,
    followRecommendation: false,
    manualQuantityMode: false,
    selectedEnchantment: 0,
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
    setCalculationMode(config.craftingInputs.calculationMode)
    setCityData(config.advancedConfig.cities)
    setMarketSharePercent(config.advancedConfig.marketSharePercent)
    setFollowRecommendation(config.advancedConfig.followRecommendation)
    setManualQuantityMode(config.advancedConfig.manualQuantityMode)
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
    if (!loadedRef.current || !baseName) return
    const config = loadConfig()
    const saved = config.meals[baseName]?.enchantmentData?.[selectedEnchantment]
    if (saved) {
      setSellingPrice(saved.basicSellingPrice || '')
      setCityData(saved.cityData || {
        Martlock: { dailySales: 0, sellingPrice: 0, enabled: false, sellQuantity: 0 },
        Bridgewatch: { dailySales: 0, sellingPrice: 0, enabled: false, sellQuantity: 0 },
        Lymhurst: { dailySales: 0, sellingPrice: 0, enabled: false, sellQuantity: 0 },
        'Fort Sterling': { dailySales: 0, sellingPrice: 0, enabled: false, sellQuantity: 0 },
        Thetford: { dailySales: 0, sellingPrice: 0, enabled: false, sellQuantity: 0 },
      })
    } else {
      setSellingPrice('')
      setCityData({
        Martlock: { dailySales: 0, sellingPrice: 0, enabled: false, sellQuantity: 0 },
        Bridgewatch: { dailySales: 0, sellingPrice: 0, enabled: false, sellQuantity: 0 },
        Lymhurst: { dailySales: 0, sellingPrice: 0, enabled: false, sellQuantity: 0 },
        'Fort Sterling': { dailySales: 0, sellingPrice: 0, enabled: false, sellQuantity: 0 },
        Thetford: { dailySales: 0, sellingPrice: 0, enabled: false, sellQuantity: 0 },
      })
    }
  }, [baseName, selectedEnchantment])

  useEffect(() => {
    stateRef.current = {
      spects, stationCost, premium, focus, cityBonus, craftQuantity, sellingPrice,
      baseName, baseMaterials, enchantmentMaterials,
      calculationMode, cityData, marketSharePercent, followRecommendation, manualQuantityMode,
      selectedEnchantment,
    }
  }, [spects, stationCost, premium, focus, cityBonus, craftQuantity, sellingPrice, baseName, baseMaterials, enchantmentMaterials, calculationMode, cityData, marketSharePercent, followRecommendation, manualQuantityMode, selectedEnchantment])

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

  const saveEnchantmentDataToConfig = useCallback((config: AppConfig) => {
    if (!baseName) return
    if (!config.meals[baseName]) {
      config.meals[baseName] = { baseName, baseMaterials: [], enchantmentMaterials: {}, enchantmentData: {} }
    }
    if (!config.meals[baseName].enchantmentData) {
      config.meals[baseName].enchantmentData = {}
    }
    config.meals[baseName].enchantmentData[selectedEnchantment] = {
      basicSellingPrice: sellingPrice,
      advancedSellingPrice: sellingPrice,
      cityData: cityData,
    }
  }, [baseName, selectedEnchantment, sellingPrice, cityData])

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!loadedRef.current) return
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    autoSaveTimerRef.current = setTimeout(() => {
      const config: AppConfig = {
        meals: {},
        spects,
        craftingInputs: { stationCost, premium, focus, cityBonus, craftQuantity, sellingPrice, calculationMode },
        advancedConfig: { cities: cityData, marketSharePercent, followRecommendation, manualQuantityMode },
      }
      const existing = loadConfig()
      config.meals = { ...existing.meals }
      if (baseName) {
        config.meals[baseName] = { ...config.meals[baseName], baseName, baseMaterials, enchantmentMaterials }
        saveEnchantmentDataToConfig(config)
      }
      saveConfig(config)
    }, 500)
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current) }
  }, [spects, stationCost, premium, focus, cityBonus, craftQuantity, sellingPrice, calculationMode, cityData, marketSharePercent, followRecommendation, manualQuantityMode, baseName, baseMaterials, enchantmentMaterials, selectedEnchantment, saveEnchantmentDataToConfig])

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

  const advancedResult: AdvancedCalculationResult | null = useMemo(() => {
    if (!recipeMeta || !displayedMeal || calculationMode !== 'advanced') return null
    const enchData = recipeMeta.allEnchantments[selectedEnchantment]
    return calcAdvancedRecipe({
      materials: displayedMaterials,
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
      cities: cityData,
      marketSharePercent,
      followRecommendation,
      manualQuantityMode,
    })
  }, [recipeMeta, selectedEnchantment, displayedMeal, displayedMaterials, spects, premium, focus, cityBonus, stationCost, craftQuantity, calculationMode, cityData, marketSharePercent, followRecommendation, manualQuantityMode])

  const hasFocusData = useMemo(() => {
    if (!recipeMeta) return false
    const enchData = recipeMeta.allEnchantments[selectedEnchantment]
    return (enchData?.baseFocus ?? recipeMeta.baseFocus) > 0
  }, [recipeMeta, selectedEnchantment])

  const returnRate = useMemo(() => calcReturnRate(cityBonus, focus), [cityBonus, focus])

  function handleSelectMeal(meal: MealItem) {
    const config = loadConfig()

    if (loadedRef.current && baseName) {
      config.meals[baseName] = { ...config.meals[baseName], baseName, baseMaterials, enchantmentMaterials }
      saveEnchantmentDataToConfig(config)
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

  function handleEnchantmentSelect(level: number) {
    if (loadedRef.current && baseName) {
      const config = loadConfig()
      saveEnchantmentDataToConfig(config)
      saveConfig(config)
    }
    setSelectedEnchantment(level)
  }

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

  function handleCityChange(city: City, data: CityData) {
    setCityData(prev => ({ ...prev, [city]: data }))
  }

  function handleSave() {
    const config = loadConfig()
    config.spects = spects
    config.craftingInputs = { stationCost, premium, focus, cityBonus, craftQuantity, sellingPrice, calculationMode }
    config.advancedConfig = { cities: cityData, marketSharePercent, followRecommendation, manualQuantityMode }
    if (baseName) {
      config.meals[baseName] = { ...config.meals[baseName], baseName, baseMaterials, enchantmentMaterials }
      saveEnchantmentDataToConfig(config)
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
        calculationMode: s.calculationMode,
      }
      config.advancedConfig = {
        cities: s.cityData,
        marketSharePercent: s.marketSharePercent,
        followRecommendation: s.followRecommendation,
        manualQuantityMode: s.manualQuantityMode,
      }
      if (s.baseName) {
        config.meals[s.baseName] = {
          ...config.meals[s.baseName],
          baseName: s.baseName,
          baseMaterials: s.baseMaterials,
          enchantmentMaterials: s.enchantmentMaterials,
        }
        if (!config.meals[s.baseName].enchantmentData) {
          config.meals[s.baseName].enchantmentData = {}
        }
        config.meals[s.baseName].enchantmentData[s.selectedEnchantment] = {
          basicSellingPrice: s.sellingPrice,
          advancedSellingPrice: s.sellingPrice,
          cityData: s.cityData,
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
            <div className="flex flex-wrap gap-6 justify-center items-start">
              <div className="w-40 h-48 bg-slate-800/60 rounded-xl animate-pulse" />
              <div className="w-72 h-48 bg-slate-800/60 rounded-xl animate-pulse" />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-6 justify-center items-start">
                <FoodCard meal={displayedMeal} />
                <CraftingInputs
                  stationCost={stationCost}
                  premium={premium}
                  focus={focus}
                  cityBonus={cityBonus}
                  hasFocusData={hasFocusData}
                  result={craftResult}
                  availableEnchantments={availableEnchantments}
                  selectedEnchantment={selectedEnchantment}
                  calculationMode={calculationMode}
                  onEnchantmentSelect={handleEnchantmentSelect}
                  onStationCostChange={setStationCost}
                  onPremiumChange={setPremium}
                  onFocusChange={setFocus}
                  onCityBonusChange={setCityBonus}
                  onCalculationModeChange={setCalculationMode}
                />
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

              {calculationMode === 'advanced' ? (
                <div className="space-y-6">
                  <AdvancedCalculationPanel
                    cities={cityData}
                    marketSharePercent={marketSharePercent}
                    followRecommendation={followRecommendation}
                    cityResults={advancedResult?.cityResults ?? []}
                    totalProfit={advancedResult?.totalProfit ?? 0}
                    averageSellingPrice={advancedResult?.averageSellingPrice ?? 0}
                    costPerUnit={advancedResult?.costPerUnit ?? 0}
                    profitPerUnit={advancedResult?.profitPerUnit ?? 0}
                    silverPerFocus={advancedResult?.silverPerFocus ?? 0}
                    totalFocus={advancedResult?.totalFocus ?? 0}
                    hasFocusData={hasFocusData}
                    craftQuantity={craftQuantity}
                    unitsPerCraft={recipeMeta?.unitsPerCraft ?? 10}
                    totalRecommendedQuantity={advancedResult?.totalRecommendedQuantity ?? 0}
                    unassignedQuantity={advancedResult?.unassignedQuantity ?? 0}
                    isOverAssigned={advancedResult?.isOverAssigned ?? false}
                    overAssignedQuantity={advancedResult?.overAssignedQuantity ?? 0}
                    onCityChange={handleCityChange}
                    onMarketShareChange={setMarketSharePercent}
                    onFollowRecommendationChange={setFollowRecommendation}
                    manualQuantityMode={manualQuantityMode}
                    onManualQuantityModeChange={setManualQuantityMode}
                    onCraftQuantityChange={setCraftQuantity}
                  />

                  <MaterialsSummary materials={displayedMaterials} craftQuantity={parseInt(craftQuantity) || 1} returnRate={returnRate} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                      Cantidad a craftear
                    </h3>

                    <div className="space-y-3">
                      <div className="relative">
                        <span className="absolute -top-4 right-1 text-[10px] text-slate-500 tabular-nums">
                          1×{recipeMeta?.unitsPerCraft ?? 10}
                        </span>
                        <div className="flex items-center justify-between gap-5">
                          <span className="text-sm text-slate-400 whitespace-nowrap">Cantidad</span>
                          <input
                            type="number"
                            value={craftQuantity}
                            onChange={e => setCraftQuantity(e.target.value)}
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
                          onChange={e => setSellingPrice(e.target.value)}
                          className="w-28 h-9 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-600 outline-none focus:border-blue-500/50 transition-colors tabular-nums text-right"
                          placeholder="0"
                        />
                      </div>
                      <CraftResultRow label="Foco total" value={!hasFocusData && focus ? 'Sin información' : (craftResult ? fmtNum(craftResult.totalFocus) : '0')} />
                      <CraftResultRow label="Costo / unidad" value={craftResult ? fmtSilver(craftResult.costPerUnit) : '0'} suffix=" silver" />
                      <CraftResultRow label="Profit / unidad" value={craftResult ? fmtSilver(craftResult.profitPerUnit) : '0'} suffix=" silver" highlight={craftResult ? craftResult.profitPerUnit > 0 : false} />
                      <CraftResultRow label="Profit total" value={craftResult ? fmtSilver(craftResult.profitPerBatch) : '0'} suffix=" silver" highlight={craftResult ? craftResult.profitPerBatch > 0 : false} />
                      <CraftResultRow label="Silver / focus" value={!hasFocusData && focus ? '—' : (craftResult ? fmtSilver(craftResult.silverPerFocus) : '0')} />
                    </div>
                  </div>

                  <MaterialsSummary materials={displayedMaterials} craftQuantity={parseInt(craftQuantity) || 1} returnRate={returnRate} />
                </div>
              )}

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
