import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { Tool } from '@/payload-types'
import ReviewItem from '@/app/blocks/review-item'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayloadClient()
  const { docs: models } = await payload.find({
    collection: 'models',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  const model = models[0]
  if (!model) return { title: 'Model Not Found' }

  return {
    title: `${model.name} - Review: Real User Reviews & Experiences Across The Internet`,
    description: model.description?.substring(0, 160),
  }
}

export default async function ModelDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayloadClient()

  const { docs: models } = await payload.find({
    collection: 'models',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  })

  const model = models[0]
  if (!model) notFound()

  const { docs: reviews } = await payload.find({
    collection: 'reviews',
    depth: 2, // memastikan node upload di body terisi objek media
    limit: 100,
    sort: 'order',
    where: {
      and: [
        { 'subject.relationTo': { equals: 'models' } },
        { 'subject.value': { equals: model.id } },
      ],
    },
  })

  const pros = reviews.filter((r) => r.type === 'pros')
  const cons = reviews.filter((r) => r.type === 'cons')

  const modalities = Array.isArray(model.modalities) ? model.modalities : []
  const tools = Array.isArray(model.tools) ? model.tools : []

  return (
    <main>
      <Link href="/models" className="back-link">
        ← Back to Models
      </Link>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          {model.name}
        </h1>
        {model.family && (
          <p style={{ fontSize: '1.25rem', color: 'var(--muted)', marginBottom: '1rem' }}>
            {model.family}
          </p>
        )}

        <div className="meta-row" style={{ marginBottom: '1rem' }}>
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
        </div>
      </div>

      {model.description && (
        <div className="article-content" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Description</h2>
          <p>{model.description}</p>
        </div>
      )}

      {(model.contextWindow || model.maxOutputTokens || model.releaseDate || model.knowledgeCutoff) && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Specifications</h2>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {model.contextWindow && (
              <div>
                <strong>Context Window:</strong> {model.contextWindow.toLocaleString()} tokens
              </div>
            )}
            {model.maxOutputTokens && (
              <div>
                <strong>Max Output Tokens:</strong> {model.maxOutputTokens.toLocaleString()}
              </div>
            )}
            {model.releaseDate && (
              <div>
                <strong>Release Date:</strong>{' '}
                {new Date(model.releaseDate).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            )}
            {model.knowledgeCutoff && (
              <div>
                <strong>Knowledge Cutoff:</strong>{' '}
                {new Date(model.knowledgeCutoff).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {(() => {
        const pricing = model.apiPricing
        const hasInput = pricing?.inputPer1M != null
        const hasOutput = pricing?.outputPer1M != null
        if (!hasInput && !hasOutput) return null

        const symbol = pricing?.currency === 'IDR' ? 'Rp' : '$'

        return (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>API Pricing</h2>
            <div
              style={{
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '1.5rem',
                background: 'var(--card-bg)',
              }}
            >
              {hasInput && (
                <div style={{ marginBottom: hasOutput ? '1rem' : 0 }}>
                  <strong>Input:</strong>{' '}
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>
                    {symbol}
                    {pricing!.inputPer1M!.toLocaleString()}
                  </span>{' '}
                  / 1M tokens
                </div>
              )}
              {hasOutput && (
                <div>
                  <strong>Output:</strong>{' '}
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>
                    {symbol}
                    {pricing!.outputPer1M!.toLocaleString()}
                  </span>{' '}
                  / 1M tokens
                </div>
              )}
            </div>
          </div>
        )
      })()}

      {model.pros && Array.isArray(model.pros.docs) && model.pros.docs.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div className="meta-row">
            <span>
              <strong>{model.pros.docs.length}</strong> pros
            </span>
            {model.cons && Array.isArray(model.cons.docs) && model.cons.docs.length > 0 && (
              <span>
                <strong>{model.cons.docs.length}</strong> cons
              </span>
            )}
          </div>
        </div>
      )}

      {tools.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
            Tools Using This Model
          </h2>
          <ul className="post-list">
            {tools
              ?.filter((tool): tool is Tool => typeof tool === 'object')
              .map((tool) => (
                <li key={tool.id} className="post-card">
                  <Link href={`/tools/${tool.slug}`}>
                    <h3 className="post-title">{tool.name}</h3>
                  </Link>
                  {tool.tagline && <p className="post-excerpt">{tool.tagline}</p>}
                </li>
              ))}
          </ul>
        </div>
      )}

      <div className="review-section">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Reviews</h2>

        {pros && Array.isArray(pros) && pros.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#10b981' }}>
              Pros (Strengths)
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pros.map((review: any) => (
                <ReviewItem key={review.id} review={review} />
              ))}
            </ul>
          </div>
        )}

        {cons && Array.isArray(cons) && cons.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#ef4444' }}>
              Cons (Weaknesses)
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cons.map((review: any) => (
                <ReviewItem key={review.id} review={review} />
              ))}
            </ul>
          </div>
        )}

        {(!pros?.length || pros.length === 0) && (!cons?.length || cons.length === 0) && (
          <p style={{ color: 'var(--muted)' }}>No reviews yet.</p>
        )}
      </div>
    </main>
  )
}
