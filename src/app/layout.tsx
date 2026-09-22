import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import { Toaster } from 'sonner'
import { Navbar } from '@/components/layout/navbar'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'INPL Season 3 | Player Auction Platform',
  description: 'Official player auction platform for INPL Season 3 - India\'s premier college cricket tournament. 15 teams, 400 players, live bidding.',
  keywords: ['INPL', 'cricket', 'auction', 'college cricket', 'player auction', 'bidding'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${outfit.variable} antialiased bg-grid min-h-screen`}>
        <Navbar />
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(30, 41, 59, 0.9)',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              backdropFilter: 'blur(16px)',
              color: '#f1f5f9',
            },
          }}
        />
      </body>
    </html>
  )
}
