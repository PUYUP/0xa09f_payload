import type { Access, FieldAccess } from 'payload'

// Publik boleh membaca, hanya admin yang boleh menulis.
export const isAdmin: Access = ({ req: { user } }) => user?.role === 'admin'
export const isAdminField: FieldAccess = ({ req: { user } }) => user?.role === 'admin'
export const publicRead: Access = () => true

// Publik hanya melihat data yang sudah dipublikasikan; admin melihat semua.
export const publishedOrAdmin: Access = ({ req: { user } }) => {
  if (user?.role === 'admin') return true
  return { _status: { equals: 'published' } }
}