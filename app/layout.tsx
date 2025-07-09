import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VC Finder - Find Industry-Specialized Venture Capitalists',
  description: 'Discover venture capitalists specializing in your industry with validated email addresses',
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
