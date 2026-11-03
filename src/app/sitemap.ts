import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getServerSideURL } from '@/utilities/getURL'

export const dynamic = 'force-dynamic' // Force Next.js re-evaluate sitemap on request
export const revalidate = 0            // Disable revalidation cache

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })
  
  const posts = await payload.find({
    collection: 'posts',
    limit: 1000, // Adjust or use pagination if you have a very large number of posts
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  const url = getServerSideURL()

  // Filter out posts that don't have a slug to prevent /null or /undefined URLs
  const validPosts = posts.docs.filter((post) => Boolean(post.slug))

  return [
    ...validPosts.map(({ slug, updatedAt }) => ({
      url: `${url}/roundup/${slug}`,
      lastModified: new Date(updatedAt),
      alternates: {
        languages: {
          es: `${url}/roundup/${slug}`,
        },
      },
    })),
  ]
}