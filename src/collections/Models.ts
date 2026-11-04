import type { CollectionConfig } from 'payload'
import { isAdmin, publicRead } from './access'
import { slugField } from '../fields/slug'
import { reviewJoins } from '../fields/reviewable'

// Model AI (GPT, Gemini, Claude, dst.) yang dipakai oleh tools.
export const Models: CollectionConfig = {
  slug: 'models',
  access: { read: publicRead, create: isAdmin, update: isAdmin, delete: isAdmin },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'family', 'releaseDate'],
    listSearchableFields: ['name', 'family'],
    group: 'Katalog',
  },
  fields: [
    { name: 'name', type: 'text', required: true, index: true, admin: { description: 'Nama versi, mis. "GPT-5" atau "Gemini 3 Pro".' } },
    slugField('name'),
    { name: 'family', type: 'text', index: true, admin: { description: 'Rumpun model, mis. GPT, Gemini, Claude.' } },
    { name: 'description', type: 'textarea' },
    {
      name: 'modalities',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Teks', value: 'text' },
        { label: 'Gambar', value: 'image' },
        { label: 'Audio', value: 'audio' },
        { label: 'Video', value: 'video' },
        { label: 'Kode', value: 'code' },
      ],
    },
    { name: 'contextWindow', type: 'number', min: 0, admin: { description: 'Dalam token.' } },
    { name: 'maxOutputTokens', type: 'number', min: 0 },
    { name: 'isOpenWeights', type: 'checkbox', defaultValue: false },
    { name: 'releaseDate', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } },
    { name: 'knowledgeCutoff', type: 'date', admin: { date: { pickerAppearance: 'monthOnly' } } },
    {
      name: 'apiPricing',
      type: 'group',
      admin: { description: 'Harga API per 1 juta token (opsional).' },
      fields: [
        { name: 'inputPer1M', type: 'number', min: 0 },
        { name: 'outputPer1M', type: 'number', min: 0 },
        { name: 'currency', type: 'select', defaultValue: 'USD', options: ['USD', 'IDR'] },
      ],
    },
    // Field virtual: daftar tools yang mendukung model ini (dari `tools.models`).
    { name: 'tools', type: 'join', collection: 'tools', on: 'models' },
    ...reviewJoins(),
  ],
}