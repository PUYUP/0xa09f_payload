import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'

type Props = {
  params: Promise<{ tagSlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tagSlug } = await params
  const payload = await getPayloadClient()

  const { docs: tags } = await payload.find({
    collection: 'tags',
    where: { slug: { equals: tagSlug } },
  })

  const tag = tags[0]
  if (!tag) return {}

  return {
    title: `Articles with tag #${tag.name}`,
    description: tag.description || `All articles with tag #${tag.name}`,
  }
}

export default async function TagPage({ params }: Props) {
  const { tagSlug } = await params
  const payload = await getPayloadClient()

  const { docs: tags } = await payload.find({
    collection: 'tags',
    where: { slug: { equals: tagSlug } },
  })

  const tag = tags[0]
  if (!tag) notFound()

  const { docs: posts } = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { status: { equals: 'published' } },
        { tags: { contains: tag.id } },
      ],
    },
    sort: '-publishedAt',
    depth: 1,
  })

  return (
    <main>
      <Link href="/roundup" className="back-link">
        ← Back to Roundup
      </Link>

      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>#{tag.name}</h1>
        {tag.description && (
          <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>{tag.description}</p>
        )}
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          {posts.length} articles found
        </p>
      </header>

      {posts.length === 0 && (
        <p style={{ color: 'var(--muted)' }}>No articles found with this tag.</p>
      )}

      <ul className="post-list">
        {posts.map((post) => (
          <li key={post.id} className="post-card">
            <Link href={`/roundup/${post.slug}`}>
              <h2 className="post-title">{post.title}</h2>
            </Link>
            {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}
            {post.publishedAt && (
              <div className="meta-row">
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  )
}
