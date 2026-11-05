import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { EMPTY_STATS, getReviewStatsBySubject } from '@/lib/review-stats'

export const metadata: Metadata = {
  title: 'AI Models Reviews - Community Ratings & Feedback',
}

export default async function ModelsPage() {
  const payload = await getPayloadClient()

  const [{ docs: models }, statsByModel] = await Promise.all([
    payload.find({
      collection: 'models',
      sort: '-releaseDate',
      depth: 1,
      pagination: false,
    }),
    getReviewStatsBySubject(payload, 'models'),
  ])

  const modelsWithStats = models
    .map((model) => ({
      ...model,
      reviewStats: statsByModel.get(model.id) ?? EMPTY_STATS,
    }))
    .sort((a, b) => {
      const aAdded = a.reviewStats.latestAddedAt
      const bAdded = b.reviewStats.latestAddedAt

      // Model dengan review selalu di atas model tanpa review
      if (aAdded && !bAdded) return -1
      if (!aAdded && bAdded) return 1

      // Sama-sama punya review: review terbaru di atas
      if (aAdded && bAdded) {
        return new Date(bAdded).getTime() - new Date(aAdded).getTime()
      }

      // Sama-sama belum punya review: urut releaseDate terbaru
      return new Date(b.releaseDate ?? 0).getTime() - new Date(a.releaseDate ?? 0).getTime()
    })

  return (
    <main>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>
        AI Models - Community Ratings & Feedback
      </h1>

      {modelsWithStats.length === 0 && (
        <p style={{ color: 'var(--muted)' }}>No models have been added yet.</p>
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
                  <span className="tag-badge">{model.contextWindow.toLocaleString()} tokens</span>
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
                  <span style={{ color: '#10b981' }}>
                    <strong>{model.reviewStats.prosCount}</strong> pros
                  </span>
                  <span style={{ color: '#ef4444' }}>
                    <strong>{model.reviewStats.consCount}</strong> cons
                  </span>
                  <span>
                    Avg: <strong>{model.reviewStats.averageScore.toFixed(1)}/3</strong>
                  </span>
                  {model.reviewStats.latestReviewedAt && (
                    <span>
                      Latest reviewed: {new Date(model.reviewStats.latestReviewedAt).toLocaleDateString('en-US')}
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