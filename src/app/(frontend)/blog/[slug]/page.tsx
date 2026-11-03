import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPayloadClient } from '@/lib/payload'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    depth: 0,
  })

  const post = docs[0]
  if (!post) return {}

  const metaTitle = post.meta?.title || post.title
  const metaDesc = post.meta?.description || post.excerpt || ''

  return {
    title: metaTitle,
    description: metaDesc,
  }
}

export async function generateStaticParams() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    where: { status: { equals: 'published' } },
    select: { slug: true },
    limit: 1000,
  })
  return docs.map((post) => ({ slug: post.slug }))
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { slug: { equals: slug } },
        { status: { equals: 'published' } },
      ],
    },
    depth: 2,
  })

  const post = docs[0]
  if (!post) notFound()

  const tags = Array.isArray(post.tags) ? post.tags : []
  const author = typeof post.author === 'object' && post.author !== null ? post.author : null

  return (
    <main>
      <Link href="/blog" className="back-link">
        ← Kembali ke Blog
      </Link>

      <article>
        <header>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
            {post.title}
          </h1>

          <div className="meta-row" style={{ marginBottom: '1.5rem' }}>
            {author && (
              <span>
                Ditulis oleh{' '}
                <strong>
                  {author.firstName || ''} {author.lastName || ''}
                </strong>
              </span>
            )}

            {post.publishedAt && (
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
            )}

            {tags.length > 0 && (
              <div className="tags">
                {tags.map((tag) => {
                  if (typeof tag === 'string') return null
                  return (
                    <Link
                      key={tag.id}
                      href={`/blog/tag/${tag.slug}`}
                      className="tag-badge"
                    >
                      #{tag.name}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </header>

        {post.content && (
          <div className="article-content">
            <RichText data={post.content as any} />
          </div>
        )}
      </article>
    </main>
  )
}
