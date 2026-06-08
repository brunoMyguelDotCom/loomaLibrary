import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { DM_Sans, Plus_Jakarta_Sans } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-heading',
  subsets: ['latin'],
  display: 'swap',
  weight: ['500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'LoomaLibrary · Sua biblioteca digital',
  description:
    'Uma biblioteca digital acolhedora inspirada na Psicologia, na leitura e no desenvolvimento humano. Cada PDF vira um livro que você folheia página por página.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#eef2f5' },
    { media: '(prefers-color-scheme: dark)', color: '#0c1620' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${dmSans.variable} ${plusJakarta.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider>{children}</ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
