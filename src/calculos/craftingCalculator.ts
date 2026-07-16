import type { CraftMaterial } from '../types/meal'
import { getSpecKeyForFoodType } from './foodTypeMapping'

const BASE_RETURN_RATE = 0.18
const CITY_BONUS_RATE = 0.15
const FOCUS_BONUS_RATE = 0.59
const STATION_FEE_RATE = 0.1125
const TAX_PREMIUM = 0.065
const TAX_NORMAL = 0.105
const FOCUS_FACTOR_BASE = 0.5
const FOCUS_MAIN_SPEC_WEIGHT = 2.8
const FOCUS_OTHER_SPEC_WEIGHT = 0.3

export interface CraftingInput {
  materials: CraftMaterial[]
  sellingPrice: number
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
}

export interface CraftingResult {
  costPerUnit: number
  profitPerUnit: number
  profitPerBatch: number
  silverPerFocus: number
  totalFocus: number
  returnRate: number
  taxes: number
  stationCommission: number
  numberOfCrafts: number
}

export function calcReturnRate(cityBonus: boolean, focus: boolean): number {
  const totalReturn = (cityBonus ? CITY_BONUS_RATE : 0) + (focus ? FOCUS_BONUS_RATE : 0) + BASE_RETURN_RATE
  return totalReturn / (1 + totalReturn)
}

export function calcTaxes(premium: boolean): number {
  return premium ? TAX_PREMIUM : TAX_NORMAL
}

export function calcFocusFactor(specPrincipal: number, allSpecs: number[]): number {
  const sumSpecsResto = allSpecs.reduce((a, b) => a + b, 0) - specPrincipal
  const exponent = (FOCUS_MAIN_SPEC_WEIGHT * specPrincipal + FOCUS_OTHER_SPEC_WEIGHT * sumSpecsResto) / 100
  return Math.pow(FOCUS_FACTOR_BASE, exponent)
}

export function calcFocusPerUnit(baseFocus: number, focusFactor: number): number {
  return baseFocus * focusFactor
}

export function calcStationCommission(iv: number, stationCost: number): number {
  return STATION_FEE_RATE * iv * stationCost / 100
}

export function calcMaterialCost(materials: CraftMaterial[]): number {
  return materials.reduce((sum, m) => sum + m.pricePerUnit * m.quantity, 0)
}

export function calcCostPerUnit(
  materialCost: number,
  returnRate: number,
  stationCommission: number,
  unitsPerCraft: number,
): number {
  return (materialCost * (1 - returnRate) + stationCommission) / unitsPerCraft
}

export function calcProfitPerUnit(sellingPrice: number, taxes: number, costPerUnit: number): number {
  return sellingPrice - (sellingPrice * taxes) - costPerUnit
}

export function calcFullRecipe(input: CraftingInput): CraftingResult {
  const taxes = calcTaxes(input.premium)
  const returnRate = calcReturnRate(input.cityBonus, input.focus)

  const foodTypeKey = getSpecKeyForFoodType(input.foodType)
  const specPrincipal = input.spects[foodTypeKey] ?? 0
  const allSpecs = Object.values(input.spects)
  const focusFactor = calcFocusFactor(specPrincipal, allSpecs)
  const focusPerUnit = calcFocusPerUnit(input.baseFocus, focusFactor)

  const materialCost = calcMaterialCost(input.materials)
  const stationCommission = calcStationCommission(input.iv, input.stationCost)
  const costPerUnit = calcCostPerUnit(materialCost, returnRate, stationCommission, input.unitsPerCraft)

  const profitPerUnit = calcProfitPerUnit(input.sellingPrice, taxes, costPerUnit)

  const numberOfCrafts = input.craftQuantity
  const totalUnits = numberOfCrafts * input.unitsPerCraft
  const profitPerBatch = profitPerUnit * totalUnits
  const totalFocus = numberOfCrafts * focusPerUnit
  const silverPerFocus = focusPerUnit > 0 ? (profitPerUnit * input.unitsPerCraft) / focusPerUnit : 0

  return {
    costPerUnit,
    profitPerUnit,
    profitPerBatch,
    silverPerFocus,
    totalFocus,
    returnRate: returnRate * 100,
    taxes: taxes * 100,
    stationCommission,
    numberOfCrafts,
  }
}
