export type LuxuryTier = 'standard' | 'premium' | 'luxury' | 'super_luxury'

const TIER_MULTIPLIERS: Record<LuxuryTier, number> = {
  standard: 1.0,
  premium: 1.35,
  luxury: 1.8,
  super_luxury: 2.5,
}

export function getTierMultiplier(tier: string): number {
  return TIER_MULTIPLIERS[tier as LuxuryTier] ?? 1.0
}

export function calculateFinalRate(baseRate: number, tier: string): number {
  return Math.round(baseRate * getTierMultiplier(tier) * 100) / 100
}

export function calculateTotalAmount(quantity: number, finalRate: number): number {
  return Math.round(quantity * finalRate * 100) / 100
}

export function getRateFromTier(
  rates: {
    standard_rate: number
    premium_rate: number
    luxury_rate: number
    super_luxury_rate: number
  },
  tier: string
): number {
  switch (tier) {
    case 'premium':
      return rates.premium_rate
    case 'luxury':
      return rates.luxury_rate
    case 'super_luxury':
      return rates.super_luxury_rate
    default:
      return rates.standard_rate
  }
}
