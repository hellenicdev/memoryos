export const calculateImportance = (factors: {
  hasFinancialInfo: boolean
  hasImportantDates: boolean
  hasProjectConnection: boolean
  userMarkedFavorite: boolean
  aiDetectedImportance: number
}): number => {
  let score = 0

  if (factors.hasFinancialInfo) score += 20
  if (factors.hasImportantDates) score += 15
  if (factors.hasProjectConnection) score += 20
  if (factors.userMarkedFavorite) score += 15
  score += Math.round(factors.aiDetectedImportance * 20)

  return Math.min(100, Math.max(0, score))
}
