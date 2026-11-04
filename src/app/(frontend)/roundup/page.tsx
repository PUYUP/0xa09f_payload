import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { Tag } from '@/payload-types'

export const metadata: Metadata = {
  title: 'AI Roundup - Weekly Newsletter & Insights',
}

export default async function RoundupPage() {
  const payload = await getPayloadClient()

  const { docs: posts } = await payload.find({
    collection: 'posts',
    where: {
      status: { equals: 'published' },
    },
    sort: '-publishedAt',
    depth: 1,
  })

  return (
    <main>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>
        AI Community Roundup
      </h1>

      {posts.length === 0 && (
        <p style={{ color: 'var(--muted)' }}>
          No articles have been published. Log in to{' '}
          <Link href="/admin" style={{ textDecoration: 'underline' }}>
            Admin Panel
          </Link>{' '}
          to create your first article!
        </p>
      )}

      <ul className="post-list">
        {posts.map((post) => {
          const tags = Array.isArray(post.tags) ? post.tags : []

          return (
            <li key={post.id} className="post-card">
              <Link href={`/roundup/${post.slug}`}>
                <h2 className="post-title">{post.title}</h2>
              </Link>

              {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}

              <div className="meta-row">
                {post.publishedAt && (
                  <time dateTime={post.publishedAt}>
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                )}

                {tags.length > 0 && (
                  <div className="tags">
                    {tags
                      ?.filter((tag): tag is Tag => typeof tag === 'object')
                      .map((tag) => (
                        <Link key={tag.id} href={`/roundup/tag/${tag.slug}`}>
                          #{tag.name}
                        </Link>
                      ))}
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
