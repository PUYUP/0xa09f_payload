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
    title: `Artikel dengan tag #${tag.name}`,
    description: tag.description || `Semua artikel dengan tag #${tag.name}`,
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
      <Link href="/blog" className="back-link">
        ← Kembali ke Blog
      </Link>

      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>#{tag.name}</h1>
        {tag.description && (
          <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>{tag.description}</p>
        )}
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          {posts.length} artikel ditemukan
        </p>
      </header>

      {posts.length === 0 && (
        <p style={{ color: 'var(--muted)' }}>Belum ada artikel dengan tag ini.</p>
      )}

      <ul className="post-list">
        {posts.map((post) => (
          <li key={post.id} className="post-card">
            <Link href={`/blog/${post.slug}`}>
              <h2 className="post-title">{post.title}</h2>
            </Link>
            {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}
            {post.publishedAt && (
              <div className="meta-row">
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
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
