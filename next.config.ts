import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  // experimental: { cpus: 1 },
}

export default withPayload(nextConfig)

