import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { RichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import { getPayloadClient } from '@/lib/payload'
import { Tag } from '@/payload-types'

type Props = {
  params: Promise<{ slug: string }>
}

const widths = { small: 400, medium: 768, large: 1280, full: 1280 } as const

const jsxConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  upload: ({ node }) => {
    const media = node.value as any
    if (!media || typeof media !== 'object' || !media.url) return null

    const size = (node.fields?.size ?? 'full') as keyof typeof widths
    const w = widths[size]
    const h = Math.round(w * ((media.height ?? 9) / (media.width ?? 16)))

    return (
      <figure style={{ maxWidth: size === 'full' ? '100%' : w, margin: '1.5rem auto' }}>
        <Image
          src={media.url}
          alt={media.alt ?? ''}
          width={w}
          height={h}
          style={{ width: '100%', height: 'auto' }}
        />
        {node.fields?.caption && <figcaption>{node.fields.caption}</figcaption>}
      </figure>
    )
  },
})

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
      <Link href="/roundup" className="back-link">
        ← Back to Roundup
      </Link>

      <article lang={post.language === 'id' ? 'id' : 'en'}>
        <header>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
            {post.title}
          </h1>

          <div className="meta-row" style={{ marginBottom: '1.5rem' }}>
            {author && (
              <span>
                Written by{' '}
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
        </header>

        {post.content && (
          <div className="article-content">
            <RichText data={post.content as any} converters={jsxConverters} />
          </div>
        )}
      </article>
    </main>
  )
}
