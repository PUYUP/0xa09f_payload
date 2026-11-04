import type { CollectionConfig, CollectionAfterChangeHook } from 'payload'
import { revalidatePath } from 'next/cache'
import { isAdmin, publicRead } from './access'
import { slugField } from '../fields/slug'
import { reviewJoins } from '../fields/reviewable'

const revalidateModel: CollectionAfterChangeHook = ({ doc, previousDoc }) => {
  if (doc.slug) {
    revalidatePath(`/models/${doc.slug}`)
    revalidatePath('/models')
  }

  if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
    revalidatePath(`/models/${previousDoc.slug}`)
  }

  return doc
}

// AI models (GPT, Gemini, Claude, etc.) used by tools.
export const Models: CollectionConfig = {
  hooks: {
    afterChange: [revalidateModel],
  },
  slug: 'models',
  access: { read: publicRead, create: isAdmin, update: isAdmin, delete: isAdmin },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'family', 'releaseDate'],
    listSearchableFields: ['name', 'family'],
    group: 'Catalog',
  },
  fields: [
    { name: 'name', type: 'text', required: true, index: true, admin: { description: 'Version name, e.g. "GPT-5" or "Gemini 3 Pro".' } },
    slugField('name'),
    { name: 'family', type: 'text', index: true, admin: { description: 'Model family, e.g. GPT, Gemini, Claude.' } },
    { name: 'description', type: 'textarea' },
    {
      name: 'modalities',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Text', value: 'text' },
        { label: 'Image', value: 'image' },
        { label: 'Audio', value: 'audio' },
        { label: 'Video', value: 'video' },
        { label: 'Code', value: 'code' },
      ],
    },
    { name: 'contextWindow', type: 'number', min: 0, admin: { description: 'In tokens.' } },
    { name: 'maxOutputTokens', type: 'number', min: 0 },
    { name: 'isOpenWeights', type: 'checkbox', defaultValue: false },
    { name: 'releaseDate', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } },
    { name: 'knowledgeCutoff', type: 'date', admin: { date: { pickerAppearance: 'monthOnly' } } },
    {
      name: 'apiPricing',
      type: 'group',
      admin: { description: 'API pricing per 1 million tokens (optional).' },
      fields: [
        { name: 'inputPer1M', type: 'number', min: 0 },
        { name: 'outputPer1M', type: 'number', min: 0 },
        { name: 'currency', type: 'select', defaultValue: 'USD', options: ['USD', 'IDR'] },
      ],
    },
    // Virtual field: list of tools that support this model (from `tools.models`).
    { name: 'tools', type: 'join', collection: 'tools', on: 'models' },
    ...reviewJoins(),
  ],
}