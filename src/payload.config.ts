import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Posts } from './collections/Posts'
import { Tags } from './collections/Tags'
import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.PAYLOAD_SECRET) throw new Error('PAYLOAD_SECRET is not set')
if (!process.env.DATABASE_URI) throw new Error('DATABASE_URI is not set')

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '| 0xa09f Artificial from the dumper',
    },
  },

  collections: [Posts, Tags, Media, Users],

  editor: lexicalEditor(),

  secret: process.env.PAYLOAD_SECRET || '',

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
      max: 10,
      connectionTimeoutMillis: 10_000,
    },
  }),

  plugins: [
    vercelBlobStorage({
      enabled: !!process.env.BLOB_READ_WRITE_TOKEN,
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],

  sharp,

  upload: {
    limits: {
      fileSize: 4_000_000, // 4MB
    },
  },
})
