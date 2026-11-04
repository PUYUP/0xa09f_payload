import type { CollectionConfig } from 'payload'
import { isAdmin, publicRead } from './access'
import { REVIEWABLE_SLUGS } from '@/fields/reviewable'

// Satu baris = satu poin kelebihan (pros) ATAU kekurangan (cons) dari sebuah objek (`subject`).
export const Reviews: CollectionConfig = {
  slug: 'reviews',
  access: { read: publicRead, create: isAdmin, update: isAdmin, delete: isAdmin },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'subject', 'type', 'impact', 'order'],
    listSearchableFields: ['title', 'content'],
    group: 'Konten',
  },
  defaultSort: 'order',
  fields: [
    {
      // Polimorfik: bisa menunjuk ke tool, company, atau collection lain di REVIEWABLE_SLUGS.
      name: 'subject',
      type: 'relationship',
      relationTo: [...REVIEWABLE_SLUGS],
      required: true,
      index: true,
      admin: { description: 'Objek yang diulas (tool, perusahaan, dst.).' },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Pros (Kelebihan)', value: 'pros' },
        { label: 'Cons (Kekurangan)', value: 'cons' },
      ],
    },
    { name: 'title', type: 'text', required: true, admin: { description: 'Ringkasan singkat satu kalimat.' } },
    { name: 'content', type: 'textarea', admin: { description: 'Penjelasan detail (opsional).' } },
    {
      name: 'impact',
      type: 'select',
      defaultValue: 'medium',
      options: [
        { label: 'Rendah', value: 'low' },
        { label: 'Sedang', value: 'medium' },
        { label: 'Tinggi', value: 'high' },
      ],
      admin: { description: 'Seberapa berpengaruh poin ini bagi pengguna.' },
    },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    {
      name: 'sourceUrl',
      type: 'text',
      admin: { position: 'sidebar', description: 'Sumber/bukti (dokumentasi, benchmark, dll).' },
    },
    {
      name: 'verifiedAt',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
    },
  ],
}