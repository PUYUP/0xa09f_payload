import type { CollectionConfig } from 'payload'
import { isAdmin, publicRead } from './access'
import { REVIEWABLE_SLUGS } from '@/fields/reviewable'
import { lexicalEditor, UploadFeature } from '@payloadcms/richtext-lexical'

// One row = one pros OR cons point of an object (`subject`).
export const Reviews: CollectionConfig = {
  slug: 'reviews',
  access: { read: publicRead, create: isAdmin, update: isAdmin, delete: isAdmin },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'subject', 'type', 'impact', 'order'],
    listSearchableFields: ['title', 'content'],
    group: 'Content',
  },
  defaultSort: 'order',
  fields: [
    {
      // Polymorphic: can point to tool, company, or other collection in REVIEWABLE_SLUGS.
      name: 'subject',
      type: 'relationship',
      relationTo: [...REVIEWABLE_SLUGS],
      required: true,
      index: true,
      admin: { description: 'Object being reviewed (tool, company, etc.).' },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Pros (Strengths)', value: 'pros' },
        { label: 'Cons (Weaknesses)', value: 'cons' },
      ],
    },
    { name: 'title', type: 'text', required: false, admin: { description: 'One sentence summary.' } },
    { name: 'content', type: 'textarea', admin: { description: 'Detailed explanation (optional).' } },
    {
        name: 'body',
        type: 'richText',
        label: 'Body',
        editor: lexicalEditor({
            features: ({ defaultFeatures }) => [
                ...defaultFeatures,
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
        admin: { description: 'Penjelasan detail (opsional). Bisa sisipkan screenshot.' },
    },
    {
      name: 'impact',
      type: 'select',
      defaultValue: 'medium',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
      ],
      admin: { description: 'How impactful this point is for users.' },
    },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    {
      name: 'source',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Source of review, e.g. "WhatsApp Group AI Indonesia, 3 Nov 2026".',
      },
    },
    {
      name: 'sourceUrl',
      type: 'text',
      admin: { position: 'sidebar', description: 'Source/evidence (documentation, benchmark, etc.).' },
    },
    {
      name: 'verifiedAt',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
    },
  ],
}