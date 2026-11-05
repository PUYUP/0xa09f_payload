import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { Category, Tag } from '@/payload-types'
import { EMPTY_STATS, getReviewStatsBySubject } from '@/lib/review-stats'

export const metadata: Metadata = {
  title: 'AI Tools Reviews - Community Reviews & Ratings',
}

export default async function ToolsPage() {
  const payload = await getPayloadClient()

  const [{ docs: tools }, statsByTool] = await Promise.all([
    payload.find({
      collection: 'tools',
      where: {
        _status: { equals: 'published' },
      },
      sort: '-createdAt',
      depth: 1,
      pagination: false,
    }),
    getReviewStatsBySubject(payload, 'tools'),
  ])

  const toolsWithStats = tools
    .map((tool) => ({
      ...tool,
      reviewStats: statsByTool.get(tool.id) ?? EMPTY_STATS,
    }))
    .sort((a, b) => {
      const aAdded = a.reviewStats.latestAddedAt
      const bAdded = b.reviewStats.latestAddedAt

      // Tool dengan review selalu di atas tool tanpa review
      if (aAdded && !bAdded) return -1
      if (!aAdded && bAdded) return 1

      // Sama-sama punya review: review terbaru di atas
      if (aAdded && bAdded) {
        return new Date(bAdded).getTime() - new Date(aAdded).getTime()
      }

      // Sama-sama belum punya review: urut createdAt terbaru
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  return (
    <main>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>
        AI Tools - Community Reviews & Ratings
      </h1>

      {toolsWithStats.length === 0 && (
        <p style={{ color: 'var(--muted)' }}>No tools have been published yet.</p>
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
                      <span style={{ color: '#10b981' }}>
                        <strong>{tool.reviewStats.prosCount}</strong> pros
                      </span>
                      <span style={{ color: '#ef4444' }}>
                        <strong>{tool.reviewStats.consCount}</strong> cons
                      </span>
                      <span>
                        Avg: <strong>{tool.reviewStats.averageScore.toFixed(1)}/3</strong>
                      </span>
                      {tool.reviewStats.latestReviewedAt && (
                        <span>
                          Latest reviewed: {new Date(tool.reviewStats.latestReviewedAt).toLocaleDateString('en-US')}
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