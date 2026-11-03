import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | 0xa09f Artificial from the dumper',
    default: '0xa09f Artificial from the dumper',
  },
  description: 'Simple blog powered by Payload CMS and Supabase PostgreSQL.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <div className="container">
          <header className="header">
            <Link href="/blog" className="brand">
              0xA09F
            </Link>
            <nav className="nav-links">
              <Link href="/blog">Blog</Link>
              <Link href="/admin" target="_blank" rel="noopener noreferrer">
                Admin Panel ↗
              </Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  )
}
