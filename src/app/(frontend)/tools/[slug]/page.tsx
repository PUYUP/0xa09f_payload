import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPayloadClient } from '@/lib/payload'
import { Category, Tag, Model } from '@/payload-types'
import ReviewItem from '@/app/blocks/review-item'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayloadClient()
  const { docs: tools } = await payload.find({
    collection: 'tools',
    where: {
      and: [
        { slug: { equals: slug } },
        { _status: { equals: 'published' } },
      ],
    },
    limit: 1,
  })

  const tool = tools[0]
  if (!tool) return { title: 'Tool Not Found' }

  return {
    title: `${tool.name} - Review: Real User Reviews & Experiences Across The Internet`,
    description: tool.tagline || '',
  }
}

export default async function ToolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayloadClient()

  const { docs: tools } = await payload.find({
    collection: 'tools',
    where: {
      and: [
        { slug: { equals: slug } },
        { _status: { equals: 'published' } },
      ],
    },
    depth: 1,
    limit: 1,
  })

  const tool = tools[0]
  if (!tool) notFound()

  const { docs: reviews } = await payload.find({
    collection: 'reviews',
    depth: 2, // memastikan node upload di body terisi objek media
    limit: 100,
    sort: 'order',
    where: {
      and: [
        { 'subject.relationTo': { equals: 'tools' } },
        { 'subject.value': { equals: tool.id } },
      ],
    },
  })

  const pros = reviews.filter((r) => r.type === 'pros')
  const cons = reviews.filter((r) => r.type === 'cons')

  const categories = Array.isArray(tool.categories) ? tool.categories : []
  const tags = Array.isArray(tool.tags) ? tool.tags : []
  const models = Array.isArray(tool.models) ? tool.models : []

  return (
    <main>
      <Link href="/tools" className="back-link">
        ← Back to Tools
      </Link>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', marginBottom: '2rem' }}>
        {tool.logo && typeof tool.logo === 'object' && (
          <div style={{ flexShrink: 0 }}>
            <img
              src={tool.logo.url || ''}
              alt={tool.name}
              style={{ width: '120px', height: '120px', objectFit: 'contain', borderRadius: '12px' }}
            />
          </div>
        )}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {tool.name}
          </h1>
          {tool.tagline && (
            <p style={{ fontSize: '1.25rem', color: 'var(--muted)', marginBottom: '1rem' }}>
              {tool.tagline}
            </p>
          )}

          <div className="meta-row" style={{ marginBottom: '1rem' }}>
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
          </div>

          {tool.overallScore && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>Overall Score: </strong>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' }}>
                {tool.overallScore}/10
              </span>
            </div>
          )}

          {tool.verdict && (
            <div style={{ background: 'var(--tag-bg)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <strong>Verdict:</strong> {tool.verdict}
            </div>
          )}
        </div>
      </div>

      {tool.description && (
        <div className="article-content" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Description</h2>
          <RichText data={tool.description as any} />
        </div>
      )}

      {(tool.website || tool.docsUrl || tool.repoUrl || tool.releaseDate || (tool.platforms && tool.platforms.length > 0)) && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Specifications</h2>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {tool.website && (
              <div>
                <strong>Website:</strong>{' '}
                <a href={tool.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
                  {tool.website}
                </a>
              </div>
            )}
            {tool.docsUrl && (
              <div>
                <strong>Documentation:</strong>{' '}
                <a href={tool.docsUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
                  {tool.docsUrl}
                </a>
              </div>
            )}
            {tool.repoUrl && (
              <div>
                <strong>Repository:</strong>{' '}
                <a href={tool.repoUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
                  {tool.repoUrl}
                </a>
              </div>
            )}
            {tool.releaseDate && (
              <div>
                <strong>Release Date:</strong>{' '}
                {new Date(tool.releaseDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            )}
            {tool.platforms && tool.platforms.length > 0 && (
              <div>
                <strong>Platforms:</strong> {tool.platforms.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      {models.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Supported AI Models</h2>
          <div className="tags">
            {models
              ?.filter((model): model is Model => typeof model === 'object')
              .map((model) => (
                <span key={model.id} className="tag-badge">
                  {model.name}
                </span>
              ))}
          </div>
        </div>
      )}

      {tool.pricingPlans && tool.pricingPlans.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Pricing Plans</h2>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            {tool.pricingPlans.map((plan, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  background: 'var(--card-bg)',
                }}
              >
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>{plan.name}</h3>
                {plan.price !== null && plan.price !== undefined ? (
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    {plan.currency === 'IDR' ? 'Rp' : '$'}{plan.price}
                    <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--muted)' }}>
                      /{plan.billingPeriod === 'month' ? 'month' : plan.billingPeriod === 'year' ? 'year' : plan.billingPeriod === 'once' ? 'one-time' : 'usage-based'}
                    </span>
                  </div>
                ) : (
                  <div style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Custom / Enterprise</div>
                )}
                {plan.features && plan.features.length > 0 && (
                  <ul style={{ listStyle: 'none', marginTop: '1rem' }}>
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                        ✓ {feature.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {pros && Array.isArray(pros) && pros.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div className="meta-row">
            <span>
              <strong>{pros.length}</strong> pros
            </span>
            {cons && Array.isArray(cons) && cons.length > 0 && (
              <span>
                <strong>{cons.length}</strong> cons
              </span>
            )}
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Tags</h2>
          <div className="tags">
            {tags
              ?.filter((tag): tag is Tag => typeof tag === 'object')
              .map((tag) => (
                <span key={tag.id} className="tag-badge">
                  #{tag.name}
                </span>
              ))}
          </div>
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
