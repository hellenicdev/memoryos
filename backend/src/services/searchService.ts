import Memory from '../models/Memory'

interface SearchResult {
  id: string
  title: string
  summary: string
  type: string
  relevance: number
}

export const searchMemories = async (
  userId: string,
  query: string,
  filters?: { type?: string; date?: string; projectId?: string; favorites?: boolean }
): Promise<SearchResult[]> => {
  const searchFilter: any = { userId }

  if (query) {
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    searchFilter.$or = [
      { title: { $regex: escapedQuery, $options: 'i' } },
      { aiSummary: { $regex: escapedQuery, $options: 'i' } },
      { content: { $regex: escapedQuery, $options: 'i' } },
      { tags: { $regex: escapedQuery, $options: 'i' } },
      { description: { $regex: escapedQuery, $options: 'i' } },
    ]
  }

  if (filters?.type) {
    searchFilter.type = filters.type
  }

  if (filters?.favorites) {
    searchFilter.isFavorite = true
  }

  if (filters?.projectId) {
    searchFilter.projectId = filters.projectId
  }

  if (filters?.date) {
    const now = new Date()
    let startDate: Date
    switch (filters.date) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0))
        break
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1))
        break
      default:
        startDate = new Date(0)
    }
    searchFilter.createdAt = { $gte: startDate }
  }

  const memories = await Memory.find(searchFilter)
    .sort({ importanceScore: -1, createdAt: -1 })
    .limit(50)
    .lean()

  return memories.map((m: any) => ({
    id: m._id.toString(),
    title: m.title,
    summary: m.aiSummary || m.description || '',
    type: m.type,
    relevance: m.importanceScore / 100,
  }))
}
