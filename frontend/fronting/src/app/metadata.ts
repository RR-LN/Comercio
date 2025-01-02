import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Minha Loja - E-commerce',
  description: 'Sua loja online com os melhores produtos',
  keywords: 'ecommerce, loja online, produtos, compras',
  authors: [{ name: 'Minha Loja' }],
  openGraph: {
    title: 'Minha Loja - E-commerce',
    description: 'Sua loja online com os melhores produtos',
    url: 'https://minhaloja.com',
    siteName: 'Minha Loja',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Minha Loja - E-commerce'
      }
    ],
    locale: 'pt_BR',
    type: 'website'
  },
  robots: {
    index: true,
    follow: true
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png'
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1
  },
  verification: {
    google: 'google-site-verification-code',
  },
  category: 'ecommerce'
}
