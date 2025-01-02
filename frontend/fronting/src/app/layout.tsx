'use client'

import { Suspense } from 'react'
import { Providers } from './providers'
import { Header } from '@/components/header'
import { Footer } from '@/components/Footer'
import { LoadingFallback } from '@/components/LoadingFallback'
import { PageTransition } from '@/components/PageTransition'
import { Motion } from '@/components/Motion'
import 'styles/globals.css'
import { Inter } from 'next/font/google';
import { Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ subsets: ['latin'], weight: ['400'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Merriweather&family=Audiowide&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning className={`font-sans antialiased ${inter.className} ${poppins.className}`}>
        <Providers>
          <Motion animation="fadeIn" duration={0.5}>
            <div className="flex flex-col min-h-screen bg-gray-50">
              <Header />
              <main className="flex-grow pt-16">
                <Suspense fallback={<LoadingFallback />}>
                  <PageTransition>
                    <div className={poppins.className}>
                      <div className={poppins.className}>
                        <main>{children}</main>
                      </div>
                    </div>
                  </PageTransition>
                </Suspense>
              </main>
              <Footer />
            </div>
          </Motion>
        </Providers>
      </body>
    </html>
  )
}
