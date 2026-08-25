import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sweet Grass - Plant Care',
  description: 'Photo-based plant care companion with AI identification and watering advice',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
