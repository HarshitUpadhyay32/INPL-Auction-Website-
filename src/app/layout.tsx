import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import { Toaster } from 'sonner'
import { Navbar } from '@/components/layout/navbar'
import { ThemeProvider } from '@/components/theme-provider'
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
  description: 'Official player auction platform for PW IOI INNOVATORS premier LEAGUE. 10 teams, 200 players, live bidding.',
  keywords: ['INPL', 'cricket', 'auction', 'PW IOI', 'innovators premier league', 'college cricket', 'player auction', 'bidding'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} antialiased bg-grid min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
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
        </ThemeProvider>
      </body>
    </html>
  )
}
