import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'Finlex Platform',
  description: 'Financial and legal services platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      {/* suppressHydrationWarning prevents false positives from browser
          extensions (e.g. Language Tool, MetaMask) that inject attributes
          into <html> before React hydrates */}
      <html lang="en" suppressHydrationWarning>
        <body className="antialiased" suppressHydrationWarning>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
