import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'AI Models Reviews - Community Ratings & Feedback',
}

interface ReviewStats {
  count: number
  averageScore: number
  latestReviewedAt: string | null
}

async function getReviewStats(payload: any, modelId: string | number): Promise<ReviewStats> {
  try {
    const { docs: reviews, totalDocs } = await payload.find({
      collection: 'reviews',
      where: {
        and: [
          { 'subject.relationTo': { equals: 'models' } },
          { 'subject.value': { equals: modelId } },
        ],
      },
      pagination: false, // ambil semua, tidak dibatasi 100
      depth: 0,
    })

    if (totalDocs === 0) {
      return { count: 0, averageScore: 0, latestReviewedAt: null }
    }

    const impactScores: Record<string, number> = { low: 1, medium: 2, high: 3 }
    const totalScore = reviews.reduce(
      (sum: number, review: any) => sum + (impactScores[review.impact] || 0),
      0,
    )

    const latestReviewedAt =
      reviews
        .map((r: any) => r.verifiedAt || r.createdAt)
        .filter(Boolean)
        .sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime())[0] || null

    return {
      count: totalDocs,
      averageScore: totalScore / reviews.length,
      latestReviewedAt,
    }
  } catch (error) {
    console.error('Error fetching review stats:', error)
    return { count: 0, averageScore: 0, latestReviewedAt: null }
  }
}

export default async function ModelsPage() {
  const payload = await getPayloadClient()

  const { docs: models } = await payload.find({
    collection: 'models',
    sort: '-releaseDate',
    depth: 1,
  })

  const modelsWithStats = await Promise.all(
    models.map(async (model) => ({
      ...model,
      reviewStats: await getReviewStats(payload, model.id),
    }))
  )

  return (
    <main>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>
        AI Models - Community Ratings & Feedback
      </h1>

      {modelsWithStats.length === 0 && (
        <p style={{ color: 'var(--muted)' }}>
          No models have been added yet.
        </p>
      )}

      <ul className="post-list">
        {modelsWithStats.map((model) => {
          const modalities = Array.isArray(model.modalities) ? model.modalities : []

          return (
            <li key={model.id} className="post-card">
              <Link href={`/models/${model.slug}`}>
                <h2 className="post-title">{model.name}</h2>
              </Link>
              {model.family && (
                <p className="post-excerpt" style={{ fontSize: '0.95rem' }}>
                  <strong>Family:</strong> {model.family}
                </p>
              )}
              {model.description && <p className="post-excerpt">{model.description}</p>}

              <div className="meta-row">
                {modalities.length > 0 && (
                  <div className="tags">
                    {modalities.map((modality) => (
                      <span key={modality} className="tag-badge">
                        {modality}
                      </span>
                    ))}
                  </div>
                )}

                {model.isOpenWeights && (
                  <span className="tag-badge" style={{ background: 'var(--accent)', color: 'white' }}>
                    Open Weights
                  </span>
                )}

                {model.contextWindow && (
                  <span className="tag-badge">
                    {model.contextWindow.toLocaleString()} tokens
                  </span>
                )}

                {model.releaseDate && (
                  <time dateTime={model.releaseDate}>
                    {new Date(model.releaseDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                )}
              </div>

              {model.reviewStats.count > 0 && (
                <div className="meta-row" style={{ marginTop: '0.5rem' }}>
                  <span>
                    <strong>{model.reviewStats.count}</strong> reviews
                  </span>
                  <span>
                    Avg: <strong>{model.reviewStats.averageScore.toFixed(1)}/3</strong>
                  </span>
                  {model.reviewStats.latestReviewedAt && (
                    <span>
                      Latest: {new Date(model.reviewStats.latestReviewedAt).toLocaleDateString('en-US')}
                    </span>
                  )}
                </div>
              )}

              {(() => {
                const pricing = model.apiPricing
                const hasInput = pricing?.inputPer1M != null
                const hasOutput = pricing?.outputPer1M != null
                if (!hasInput && !hasOutput) return null

                const symbol = pricing?.currency === 'IDR' ? 'Rp' : '$'

                return (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--muted)' }}>
                    API:{' '}
                    {[
                      hasInput && `${symbol}${pricing!.inputPer1M!.toLocaleString()} / 1M input`,
                      hasOutput && `${symbol}${pricing!.outputPer1M!.toLocaleString()} / 1M output`,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                )
              })()}
            </li>
          )
        })}
      </ul>
    </main>
  )
}
