export interface ReviewStats {
  count: number
  prosCount: number
  consCount: number
  averageScore: number
  latestReviewedAt: string | null // verifiedAt/createdAt terbaru (untuk tampilan "Latest")
  latestAddedAt: string | null // createdAt terbaru (untuk pengurutan)
}

export const EMPTY_STATS: ReviewStats = {
  count: 0,
  prosCount: 0,
  consCount: 0,
  averageScore: 0,
  latestReviewedAt: null,
  latestAddedAt: null,
}

export async function getReviewStatsBySubject(
  payload: any,
  relationTo: 'models' | 'tools',
): Promise<Map<string | number, ReviewStats>> {
  const stats = new Map<string | number, ReviewStats>()

  try {
    const { docs: reviews } = await payload.find({
      collection: 'reviews',
      where: { 'subject.relationTo': { equals: relationTo } },
      pagination: false,
      depth: 0,
      select: { subject: true, type: true, impact: true, createdAt: true, verifiedAt: true },
    })

    const impactScores: Record<string, number> = { low: 1, medium: 2, high: 3 }
    const scoreSums = new Map<string | number, number>()

    for (const review of reviews) {
      const id = review.subject?.value
      if (id == null) continue

      const current = stats.get(id) ?? { ...EMPTY_STATS }
      const reviewedAt = review.verifiedAt || review.createdAt

      current.count += 1
      if (review.type === 'pros') current.prosCount += 1
      if (review.type === 'cons') current.consCount += 1

      scoreSums.set(id, (scoreSums.get(id) ?? 0) + (impactScores[review.impact] || 0))

      if (
        review.createdAt &&
        (!current.latestAddedAt || new Date(review.createdAt) > new Date(current.latestAddedAt))
      ) {
        current.latestAddedAt = review.createdAt
      }
      if (
        reviewedAt &&
        (!current.latestReviewedAt || new Date(reviewedAt) > new Date(current.latestReviewedAt))
      ) {
        current.latestReviewedAt = reviewedAt
      }

      stats.set(id, current)
    }

    for (const [id, s] of stats) {
      s.averageScore = (scoreSums.get(id) ?? 0) / s.count
    }
  } catch (error) {
    console.error('Error fetching review stats:', error)
  }

  return stats
}