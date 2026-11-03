import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | 0xa09f',
    default: '0xa09f Artificial from the dumper',
  },
  description: 'Real opinions, experiences, and discoveries about AI tools, collected from people across the web.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="header">
            <Link href="/roundup" className="brand">
              <Image src={'/images/0xa09f-logo.png'} width={48} height={48} alt={'0xa09f-logo'} />
            </Link>
            <nav className="nav-links">
              <Link href="/roundup">0XA09F</Link>
              {/* <Link href="/admin" target="_blank" rel="noopener noreferrer">
                Admin Panel ↗
              </Link> */}
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  )
}
