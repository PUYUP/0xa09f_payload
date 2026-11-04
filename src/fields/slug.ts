import type { Field, FieldHook } from 'payload'

// Isi slug otomatis dari field `name` bila kosong.
export const formatSlug =
  (source: string): FieldHook =>
  ({ value, data }) => {
    const raw: string = value || data?.[source] || ''
    return raw
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

export const slugField = (source = 'name'): Field => ({
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: { position: 'sidebar', description: 'Otomatis dari nama, bisa diubah.' },
  hooks: { beforeValidate: [formatSlug(source)] },
})