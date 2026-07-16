import type { CraftMaterial, City, CityData } from '../types/meal'
import {
  calcReturnRate,
  calcTaxes,
  calcFocusFactor,
  calcFocusPerUnit,
  calcStationCommission,
  calcMaterialCost,
  calcCostPerUnit,
} from './craftingCalculator'
import { getSpecKeyForFoodType } from './foodTypeMapping'

export const DEFAULT_MARKET_SHARE = 5

export interface AdvancedCalculationInput {
  materials: CraftMaterial[]
  spects: Record<string, number>
  premium: boolean
  focus: boolean
  cityBonus: boolean
  stationCost: number
  foodType: string
  baseFocus: number
  iv: number
  unitsPerCraft: number
  craftQuantity: number
  cities: Record<City, CityData>
  marketSharePercent: number
  followRecommendation: boolean
  manualQuantityMode: boolean
}

export interface CityResult {
  city: City
  dailySales: number
  sellingPrice: number
  enabled: boolean
  recommendedQuantity: number
  distributedQuantity: number
  actualQuantity: number
  revenuePerUnit: number
  profitPerUnit: number
  totalProfit: number
  isSaturated: boolean
}

export interface AdvancedCalculationResult {
  costPerUnit: number
  profitPerUnit: number
  profitPerBatch: number
  silverPerFocus: number
  totalFocus: number
  returnRate: number
  taxes: number
  stationCommission: number
  numberOfCrafts: number
  cityResults: CityResult[]
  totalRecommendedQuantity: number
  totalProfit: number
  averageSellingPrice: number
  marketSharePercent: number
  unassignedQuantity: number
  isOverAssigned: boolean
  overAssignedQuantity: number
}

export function calcAdvancedRecipe(input: AdvancedCalculationInput): AdvancedCalculationResult {
  const taxes = calcTaxes(input.premium)
  const returnRate = calcReturnRate(input.cityBonus, input.focus)

  const foodTypeKey = getSpecKeyForFoodType(input.foodType)
  const specPrincipal = input.spects[foodTypeKey] ?? 0
  const allSpecs = Object.values(input.spects)
  const focusFactor = calcFocusFactor(specPrincipal, allSpecs)
  const focusPerUnit = calcFocusPerUnit(input.baseFocus, focusFactor)

  const materialCost = calcMaterialCost(input.materials)
  const stationCommission = calcStationCommission(input.iv, input.stationCost, input.unitsPerCraft)
  const costPerUnit = calcCostPerUnit(materialCost, returnRate, stationCommission, input.unitsPerCraft)

  const numberOfCrafts = input.craftQuantity
  const totalUnits = numberOfCrafts * input.unitsPerCraft
  const totalFocus = numberOfCrafts * focusPerUnit
  const silverPerFocus = focusPerUnit > 0 ? (costPerUnit > 0 ? totalUnits / totalFocus : 0) : 0

  const enabledCities = Object.entries(input.cities)
    .filter(([, data]) => data.enabled)
    .map(([city]) => city as City)

  const totalDailySales = enabledCities.reduce(
    (sum, city) => sum + (input.cities[city]?.dailySales ?? 0),
    0,
  )

  const cityResults: CityResult[] = (Object.entries(input.cities) as [City, CityData][]).map(
    ([city, data]) => {
      const recommendedQuantity = Math.floor(data.dailySales * input.marketSharePercent / 100)

      const distributedQuantity = totalDailySales > 0
        ? Math.floor((data.dailySales / totalDailySales) * totalUnits)
        : 0

      const actualQuantity = input.manualQuantityMode
        ? (data.sellQuantity > 0 ? data.sellQuantity : 0)
        : (input.followRecommendation ? recommendedQuantity : distributedQuantity)

      const isSaturated = input.manualQuantityMode
        ? (data.sellQuantity > 0 && data.sellQuantity > recommendedQuantity)
        : (actualQuantity > recommendedQuantity)

      const revenuePerUnit = data.sellingPrice * (1 - taxes)
      const profitPerUnit = revenuePerUnit - costPerUnit
      const totalProfit = profitPerUnit * actualQuantity

      return {
        city,
        dailySales: data.dailySales,
        sellingPrice: data.sellingPrice,
        enabled: data.enabled,
        recommendedQuantity,
        distributedQuantity,
        actualQuantity,
        revenuePerUnit,
        profitPerUnit,
        totalProfit,
        isSaturated,
      }
    },
  )

  const enabledCityResults = cityResults.filter(r => r.enabled)
  const totalProfit = enabledCityResults.reduce(
    (sum, r) => sum + r.totalProfit,
    0,
  )

  const totalSoldUnits = enabledCityResults.reduce((sum, r) => sum + r.actualQuantity, 0)
  const averageSellingPrice = totalSoldUnits > 0
    ? enabledCityResults.reduce((sum, r) => sum + r.sellingPrice * r.actualQuantity, 0) / totalSoldUnits
    : 0

  const profitPerUnitAvg = enabledCityResults.length > 0
    ? enabledCityResults.reduce((sum, r) => sum + r.profitPerUnit, 0) / enabledCityResults.length
    : 0

  const profitPerBatch = profitPerUnitAvg * totalUnits

  const totalRecommendedQuantity = enabledCityResults.reduce(
    (sum, r) => sum + r.recommendedQuantity,
    0,
  )

  const totalAssigned = enabledCityResults.reduce(
    (sum, r) => sum + r.actualQuantity,
    0,
  )
  const unassignedQuantity = Math.max(0, totalUnits - totalAssigned)
  const isOverAssigned = totalAssigned > totalUnits
  const overAssignedQuantity = isOverAssigned ? totalAssigned - totalUnits : 0

  return {
    costPerUnit,
    profitPerUnit: profitPerUnitAvg,
    profitPerBatch,
    silverPerFocus,
    totalFocus,
    returnRate: returnRate * 100,
    taxes: taxes * 100,
    stationCommission,
    numberOfCrafts,
    cityResults,
    totalProfit,
    averageSellingPrice,
    marketSharePercent: input.marketSharePercent,
    totalRecommendedQuantity,
    unassignedQuantity,
    isOverAssigned,
    overAssignedQuantity,
  }
}
