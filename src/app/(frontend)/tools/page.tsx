import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { Category, Tag } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Tools Directory - AI Tools Catalog',
}

interface ReviewStats {
  count: number
  averageScore: number
  latestReviewedAt: string | null
}

async function getReviewStats(payload: any, toolId: string): Promise<ReviewStats> {
  try {
    const { docs: reviews } = await payload.find({
      collection: 'reviews',
      where: {
        'subject.value': { equals: toolId },
      },
      limit: 100,
    })

    if (reviews.length === 0) {
      return { count: 0, averageScore: 0, latestReviewedAt: null }
    }

    const impactScores: Record<string, number> = { low: 1, medium: 2, high: 3 }
    const totalScore = reviews.reduce((sum: number, review: any) => {
      return sum + (impactScores[review.impact] || 0)
    }, 0)

    const averageScore = totalScore / reviews.length

    const latestReviewedAt = reviews
      .map((r: any) => r.verifiedAt || r.createdAt)
      .filter((d: string) => d)
      .sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime())[0] || null

    return {
      count: reviews.length,
      averageScore,
      latestReviewedAt,
    }
  } catch (error) {
    console.error('Error fetching review stats:', error)
    return { count: 0, averageScore: 0, latestReviewedAt: null }
  }
}

export default async function ToolsPage() {
  const payload = await getPayloadClient()

  const { docs: tools } = await payload.find({
    collection: 'tools',
    where: {
      _status: { equals: 'published' },
    },
    sort: '-createdAt',
    depth: 1,
  })

  const toolsWithStats = await Promise.all(
    tools.map(async (tool) => ({
      ...tool,
      reviewStats: await getReviewStats(payload, tool.id),
    }))
  )

  return (
    <main>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>
        AI Tools Directory
      </h1>

      {toolsWithStats.length === 0 && (
        <p style={{ color: 'var(--muted)' }}>
          No tools have been published yet.
        </p>
      )}

      <ul className="post-list">
        {toolsWithStats.map((tool) => {
          const categories = Array.isArray(tool.categories) ? tool.categories : []
          const tags = Array.isArray(tool.tags) ? tool.tags : []

          return (
            <li key={tool.id} className="post-card">
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                {tool.logo && typeof tool.logo === 'object' && (
                  <div style={{ flexShrink: 0 }}>
                    <img
                      src={tool.logo.url || ''}
                      alt={tool.name}
                      style={{ width: '64px', height: '64px', objectFit: 'contain', borderRadius: '8px' }}
                    />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <Link href={`/tools/${tool.slug}`}>
                    <h2 className="post-title">{tool.name}</h2>
                  </Link>
                  {tool.tagline && <p className="post-excerpt">{tool.tagline}</p>}

                  <div className="meta-row">
                    {categories.length > 0 && (
                      <div className="tags">
                        {categories
                          ?.filter((cat): cat is Category => typeof cat === 'object')
                          .map((cat) => (
                            <span key={cat.id} className="tag-badge">
                              {cat.name}
                            </span>
                          ))}
                      </div>
                    )}

                    {tool.isOpenSource && (
                      <span className="tag-badge" style={{ background: 'var(--accent)', color: 'white' }}>
                        Open Source
                      </span>
                    )}

                    {tool.hasFreeTier && (
                      <span className="tag-badge" style={{ background: '#10b981', color: 'white' }}>
                        Free Tier
                      </span>
                    )}

                    {tags.length > 0 && (
                      <div className="tags">
                        {tags
                          ?.filter((tag): tag is Tag => typeof tag === 'object')
                          .map((tag) => (
                            <span key={tag.id} className="tag-badge">
                              #{tag.name}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>

                  {tool.reviewStats.count > 0 && (
                    <div className="meta-row" style={{ marginTop: '0.5rem' }}>
                      <span>
                        <strong>{tool.reviewStats.count}</strong> reviews
                      </span>
                      <span>
                        Avg: <strong>{tool.reviewStats.averageScore.toFixed(1)}/3</strong>
                      </span>
                      {tool.reviewStats.latestReviewedAt && (
                        <span>
                          Latest: {new Date(tool.reviewStats.latestReviewedAt).toLocaleDateString('id-ID')}
                        </span>
                      )}
                    </div>
                  )}

                  {tool.website && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <a
                        href={tool.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.875rem', color: 'var(--accent)' }}
                      >
                        Visit Website →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
