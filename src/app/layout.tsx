import type { Metadata } from 'next'
import { Readex_Pro } from 'next/font/google'
import './globals.css'

const readexPro = Readex_Pro({
  subsets: ['arabic', 'latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'مِشاع — إدارة المباني المشتركة',
  description: 'منصة حوكمة وإدارة جمعيات الملاك للمباني المشتركة في المملكة العربية السعودية',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${readexPro.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  )
}
