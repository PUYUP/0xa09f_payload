import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'AI Models Directory - AI Models Catalog',
}

interface ReviewStats {
  count: number
  averageScore: number
  latestReviewedAt: string | null
}

async function getReviewStats(payload: any, modelId: string): Promise<ReviewStats> {
  try {
    const { docs: reviews } = await payload.find({
      collection: 'reviews',
      where: {
        'subject.value': { equals: modelId },
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
        AI Models Directory
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
                    {new Date(model.releaseDate).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
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
                      Latest: {new Date(model.reviewStats.latestReviewedAt).toLocaleDateString('id-ID')}
                    </span>
                  )}
                </div>
              )}

              {model.apiPricing && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--muted)' }}>
                  API: {model.apiPricing.currency === 'IDR' ? 'Rp' : '$'}
                  {model.apiPricing.inputPer1M?.toLocaleString() || 'N/A'} / 1M input,{' '}
                  {model.apiPricing.currency === 'IDR' ? 'Rp' : '$'}
                  {model.apiPricing.outputPer1M?.toLocaleString() || 'N/A'} / 1M output
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </main>
  )
}
