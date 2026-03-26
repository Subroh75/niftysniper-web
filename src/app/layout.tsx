import type { Metadata } from 'next'
import '../styles/globals.css'
export const metadata: Metadata = {
  title: "NiftySniper — India's Institutional-Grade Market Terminal",
  description: 'Real-time Nifty 500 scanning. Miro Score hot money detection. AI Investment Council.',
  openGraph: { title: 'NiftySniper', description: 'Institutional market intelligence for Indian equity traders', url: 'https://niftysniper.co', siteName: 'NiftySniper' },
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0e17] text-[#e2e8f0] antialiased">{children}</body>
    </html>
  )
}