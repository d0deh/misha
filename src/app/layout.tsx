import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600'],
  display: 'swap',
})

const appIconUrl = '/icon.svg?v=misha-20260428-2'

export const metadata: Metadata = {
  title: 'مِشاع — إدارة الملكيات المشتركة',
  description: 'منصة سعودية لإدارة جمعيات الملاك والملكيات المشتركة بهدوء ووضوح.',
  icons: {
    icon: [{ url: appIconUrl, type: 'image/svg+xml', sizes: 'any' }],
    shortcut: [{ url: appIconUrl, type: 'image/svg+xml' }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  )
}
