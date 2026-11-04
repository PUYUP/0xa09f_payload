import type { CollectionConfig, CollectionAfterChangeHook } from 'payload'
import { revalidatePath } from 'next/cache'
import { isAdmin, publishedOrAdmin } from './access'
import { slugField } from '../fields/slug'
import { reviewJoins } from '../fields/reviewable'

const revalidateTool: CollectionAfterChangeHook = ({ doc, previousDoc }) => {
  if (doc._status === 'published') {
    revalidatePath(`/tools/${doc.slug}`)
    revalidatePath('/tools')
  }

  if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
    revalidatePath(`/tools/${previousDoc.slug}`)
  }

  return doc
}

export const Tools: CollectionConfig = {
  hooks: {
    afterChange: [revalidateTool],
  },
  slug: 'tools',
  access: { read: publishedOrAdmin, create: isAdmin, update: isAdmin, delete: isAdmin },
  versions: { drafts: true },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'categories', 'isOpenSource', '_status'],
    group: 'Katalog',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Umum',
          fields: [
            { name: 'name', type: 'text', required: true, index: true },
            { name: 'tagline', type: 'text', admin: { description: 'Satu kalimat deskripsi.' } },
            { name: 'description', type: 'richText' },
            { name: 'logo', type: 'upload', relationTo: 'media' },
            { name: 'categories', type: 'relationship', relationTo: 'categories', hasMany: true },
            { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
          ],
        },
        {
          label: 'Spesifikasi',
          fields: [
            { name: 'website', type: 'text' },
            { name: 'docsUrl', type: 'text' },
            { name: 'repoUrl', type: 'text' },
            {
              name: 'platforms',
              type: 'select',
              hasMany: true,
              options: [
                { label: 'Web', value: 'web' },
                { label: 'Desktop App', value: 'desktop' },
                { label: 'CLI / Terminal', value: 'cli' },
                { label: 'VS Code Extension', value: 'vscode' },
                { label: 'JetBrains Plugin', value: 'jetbrains' },
                { label: 'API / SDK', value: 'api' },
              ],
            },
            {
              name: 'models',
              type: 'relationship',
              relationTo: 'models',
              hasMany: true,
              admin: { description: 'Model AI yang didukung tool ini.' },
            },
            { name: 'isOpenSource', type: 'checkbox', defaultValue: false },
            { name: 'releaseDate', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } },
          ],
        },
        {
          label: 'Harga',
          fields: [
            {
              name: 'hasFreeTier',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'pricingPlans',
              type: 'array',
              fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'price', type: 'number', min: 0, admin: { description: 'Kosongkan bila custom/enterprise.' } },
                { name: 'currency', type: 'select', defaultValue: 'USD', options: ['USD', 'IDR'] },
                {
                  name: 'billingPeriod',
                  type: 'select',
                  defaultValue: 'month',
                  options: [
                    { label: 'Per bulan', value: 'month' },
                    { label: 'Per tahun', value: 'year' },
                    { label: 'Sekali bayar', value: 'once' },
                    { label: 'Sesuai pemakaian', value: 'usage' },
                  ],
                },
                { name: 'features', type: 'array', fields: [{ name: 'text', type: 'text', required: true }] },
              ],
            },
          ],
        },
        {
          label: 'Pros & Cons',
          fields: [...reviewJoins()],
        },
      ],
    },
    slugField('name'),
    {
      name: 'overallScore',
      type: 'number',
      min: 0,
      max: 10,
      admin: { position: 'sidebar', step: 0.1, description: 'Skor keseluruhan 0–10 (penilaian admin).' },
    },
    { name: 'verdict', type: 'textarea', admin: { position: 'sidebar', description: 'Kesimpulan singkat.' } },
  ],
}