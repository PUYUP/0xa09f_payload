import type { Field } from 'payload'

// List of collections that can be reviewed (pros/cons).
// To add a new entity (e.g. 'models'), just add the slug here,
// then insert `...reviewJoins()` into that collection's fields.
export const REVIEWABLE_SLUGS = ['tools', 'models'] as const

// Virtual fields `pros` & `cons`: pull data from `reviews` via `subject` relationship.
export const reviewJoins = (): Field[] => [
  {
    name: 'pros',
    type: 'join',
    collection: 'reviews',
    on: 'subject',
    where: { type: { equals: 'pros' } },
    defaultSort: 'order',
    defaultLimit: 50,
  },
  {
    name: 'cons',
    type: 'join',
    collection: 'reviews',
    on: 'subject',
    where: { type: { equals: 'cons' } },
    defaultSort: 'order',
    defaultLimit: 50,
  },
]