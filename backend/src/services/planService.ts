import User from '../models/User'

interface PlanLimits {
  storageLimit: number
  aiLimit: number
  projectLimit: number
}

const PLANS: Record<string, PlanLimits> = {
  free: { storageLimit: 500 * 1024 * 1024, aiLimit: 50, projectLimit: 5 },
  premium: { storageLimit: 50 * 1024 * 1024 * 1024, aiLimit: 1000, projectLimit: 100 },
  team: { storageLimit: 100 * 1024 * 1024 * 1024, aiLimit: 5000, projectLimit: 500 },
}

export const getPlanLimits = (plan: string): PlanLimits => {
  return PLANS[plan] || PLANS.free
}

export const checkFeatureAccess = (userPlan: string, requiredPlan: string): boolean => {
  const hierarchy = ['free', 'premium', 'team']
  const userLevel = hierarchy.indexOf(userPlan)
  const requiredLevel = hierarchy.indexOf(requiredPlan)
  return userLevel >= requiredLevel
}

export const checkStorageLimit = async (userId: string, fileSize: number): Promise<boolean> => {
  const user = await User.findById(userId)
  if (!user) return false

  const limits = getPlanLimits(user.plan)
  return user.storageUsed + fileSize <= limits.storageLimit
}

export const checkAIUsageLimit = async (userId: string): Promise<boolean> => {
  const user = await User.findById(userId)
  if (!user) return false

  const now = new Date()
  if (now > user.aiQueriesResetDate) {
    const limits = getPlanLimits(user.plan)
    user.aiQueriesUsed = 0
    user.aiQueriesResetDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    user.aiQueryLimit = limits.aiLimit
    await user.save()
  }

  return user.aiQueriesUsed < user.aiQueryLimit
}
