import type { CollectionConfig } from 'payload'
import { isAdmin, publicRead } from './access'
import { slugField } from '../fields/slug'

// Kategori tool: AI IDE, CLI Agent, Code Completion, dst. Mendukung hierarki (parent).
export const Categories: CollectionConfig = {
  slug: 'categories',
  access: { read: publicRead, create: isAdmin, update: isAdmin, delete: isAdmin },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'parent'], group: 'Katalog' },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField('name'),
    { name: 'description', type: 'textarea' },
    { name: 'parent', type: 'relationship', relationTo: 'categories', index: true },
  ],
}