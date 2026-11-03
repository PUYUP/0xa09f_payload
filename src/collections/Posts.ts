import type { CollectionConfig, CollectionAfterChangeHook } from 'payload'
import { lexicalEditor, UploadFeature } from '@payloadcms/richtext-lexical'
import { revalidatePath } from 'next/cache'

const revalidatePost: CollectionAfterChangeHook = ({ doc, previousDoc }) => {
  if (doc.status === 'published') {
    revalidatePath(`/roundup/${doc.slug}`)
    revalidatePath('/roundup')
  }

  // kalau slug berubah atau post di-unpublish, buang cache slug lama
  if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
    revalidatePath(`/roundup/${previousDoc.slug}`)
  }

  return doc
}

export const Posts: CollectionConfig = {
  slug: 'posts',
  hooks: {
    afterChange: [revalidatePost],
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'author', 'publishedAt', 'updatedAt'],
    preview: (doc) => {
      if (doc?.slug) {
        return `${process.env.NEXT_PUBLIC_SERVER_URL}/roundup/${doc.slug}`
      }
      return null
    },
  },
  access: {
    read: ({ req: { user } }) => {
      // Published posts are publicly readable; drafts only for logged-in users
      if (user) return true
      return {
        status: {
          equals: 'published',
        },
      }
    },
  },
  versions: {
    drafts: {
      autosave: {
        interval: 375,
      },
    },
  },
  fields: [
    // ── Core ──────────────────────────────────────────────────────────────
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Title',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
      admin: {
        position: 'sidebar',
        description: 'URL path for this post. Auto-generated from title.',
      },
      hooks: {
        beforeValidate: [
          ({ data, value }) => {
            if (!value && data?.title) {
              return (data.title as string)
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '')
            }
            return value
          },
        ],
      },
    },

    // ── SEO / Meta ────────────────────────────────────────────────────────
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Excerpt',
      admin: {
        description: 'Short summary used in post listings and SEO meta description.',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Cover Image',
    },

    // ── Body ──────────────────────────────────────────────────────────────
    {
      name: 'content',
      type: 'richText',
      label: 'Content',
      required: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          // buang upload bawaan supaya tidak dobel
          ...defaultFeatures.filter((f) => f.key !== 'upload'),
          UploadFeature({
            collections: {
              media: {
                fields: [
                  {
                    name: 'size',
                    type: 'select',
                    label: 'Ukuran',
                    defaultValue: 'full',
                    options: [
                      { label: 'Kecil (400px)', value: 'small' },
                      { label: 'Sedang (768px)', value: 'medium' },
                      { label: 'Besar (1280px)', value: 'large' },
                      { label: 'Penuh', value: 'full' },
                    ],
                  },
                  { name: 'caption', type: 'text', label: 'Caption' },
                ],
              },
            },
          }),
        ],
      }),
    },

    // ── Taxonomy ──────────────────────────────────────────────────────────
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      label: 'Tags',
      admin: {
        position: 'sidebar',
      },
    },

    // ── Authorship ────────────────────────────────────────────────────────
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      hasMany: false,
      label: 'Author',
      admin: {
        position: 'sidebar',
      },
    },

    // ── Publishing ────────────────────────────────────────────────────────
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'draft',
      required: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Published At',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
        condition: (_, siblingData) => siblingData?.status === 'published',
      },
    },

    // ── SEO (meta group) ─────────────────────────────────────────────────
    {
      name: 'meta',
      type: 'group',
      label: 'SEO',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Meta Title',
          admin: {
            description: 'Defaults to post title if empty.',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Meta Description',
          admin: {
            description: 'Defaults to excerpt if empty.',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'OG Image',
          admin: {
            description: 'Defaults to cover image if empty.',
          },
        },
      ],
    },
  ],
}

