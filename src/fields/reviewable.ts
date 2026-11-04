import type { Field } from 'payload'

// Daftar collection yang boleh diulas (pros/cons).
// Menambah entitas baru (mis. 'models') cukup menambahkan slug di sini,
// lalu menyisipkan `...reviewJoins()` ke fields collection tersebut.
export const REVIEWABLE_SLUGS = ['tools', 'models'] as const

// Field virtual `pros` & `cons`: menarik data dari `reviews` lewat relasi `subject`.
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