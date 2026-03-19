import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PricingRules {
  siteLevels: Record<string, number>
  regionMultipliers: Record<string, number>
  categoryMultipliers: Record<string, number>
}

interface PricingMatrixState {
  rules: PricingRules
  setSiteLevelPrice: (level: string, price: number) => void
  setRegionMultiplier: (region: string, mult: number) => void
  setCategoryMultiplier: (category: string, mult: number) => void
  calculatePrice: (
    level: string,
    region: string,
    category: string,
    days: number,
  ) => number
}

export const usePricingMatrixStore = create<PricingMatrixState>()(
  persist(
    (set, get) => ({
      rules: {
        siteLevels: {
          Bronze: 50,
          Silver: 100,
          Gold: 200,
          Premium: 500,
        },
        regionMultipliers: {
          BR: 1,
          US: 1.5,
          Other: 1.2,
        },
        categoryMultipliers: {
          Construction: 1.5,
          Maintenance: 1.2,
          Cleaning: 1.0,
          Technology: 2.0,
        },
      },
      setSiteLevelPrice: (level, price) =>
        set((state) => ({
          rules: {
            ...state.rules,
            siteLevels: { ...state.rules.siteLevels, [level]: price },
          },
        })),
      setRegionMultiplier: (region, mult) =>
        set((state) => ({
          rules: {
            ...state.rules,
            regionMultipliers: {
              ...state.rules.regionMultipliers,
              [region]: mult,
            },
          },
        })),
      setCategoryMultiplier: (category, mult) =>
        set((state) => ({
          rules: {
            ...state.rules,
            categoryMultipliers: {
              ...state.rules.categoryMultipliers,
              [category]: mult,
            },
          },
        })),
      calculatePrice: (level, region, category, days) => {
        const { rules } = get()
        const base = rules.siteLevels[level] || 50
        const rMult = rules.regionMultipliers[region] || 1
        const cMult = rules.categoryMultipliers[category] || 1
        // Charge proportionally by months (minimum 1 month)
        const months = Math.max(1, Math.ceil(days / 30))
        return base * rMult * cMult * months
      },
    }),
    { name: 'pricing-matrix-storage' },
  ),
)
