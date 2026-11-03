import { getServerSideURL } from '@/utilities/getURL'
import type { MetadataRoute} from 'next'
export default function robots(): MetadataRoute.Robots {

  const url = getServerSideURL()

  return {
    rules: [{
      userAgent: 'GoogleBot',
      allow: '/',
      disallow: '/admin',
    }, {
      userAgent: ['AhrefsBot', 'BingBot'],
      disallow: ['/'],
    }],
    sitemap: `${url}/sitemap.xml`,
  }
}