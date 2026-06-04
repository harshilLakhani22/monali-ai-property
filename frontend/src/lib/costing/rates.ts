export const COST_RATES = {
  currency: 'ZAR',
  baseRates: {
    economy: 15000,
    mid_range: 20000,
    premium: 30000,
  },
  garageRateMultiplier: 0.6,
  allowances: {
    externalWorks: 250000,
  },
  contingencyPercent: 0.10,
  ranges: {
    low: 0.90,
    high: 1.15,
  },
  multipliers: {
    slope: {
      flat: 1.0,
      moderate: 1.10,
      steep: 1.25,
    },
    complexity: {
      rectangular: 1.0,
      l_shape: 1.05,
      courtyard: 1.12,
    },
  },
} as const
