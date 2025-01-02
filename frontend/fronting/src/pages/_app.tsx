'use client'

import * as React from 'react'
import Head from 'next/head'
import { AppProps } from 'next/app'
import '../styles/globals.css'
import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { initSentry } from '@/lib/monitoring/sentry'
import { performanceMonitor } from '@/lib/monitoring/performance'
import { uptimeMonitor } from '@/lib/monitoring/uptime'
import { analytics } from '@/lib/monitoring/analytics'
import { apiMonitor } from '@/lib/monitoring/apiMonitor'
import { resourceMonitor } from '@/lib/monitoring/resourceMonitor'
import { renderMonitor } from '@/lib/monitoring/renderMonitor'
import { logger } from '@/lib/monitoring/logger'
import ErrorBoundary from '@/components/ErrorBoundary'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { Providers } from '@/app/providers'
import { WishlistProvider } from '@/contexts/WishlistContext'

export default function MyApp(props: AppProps) {
  const { Component, pageProps } = props

  useEffect(() => {
    // Initialize Sentry first
    initSentry()

    // Start monitoring services
    const startMonitoring = async () => {
      try {
        // Start performance monitoring
        performanceMonitor.trackMetric('app_start', performance.now())
        
        // Start uptime checks
        await uptimeMonitor.checkEndpoint('/api/health')
        
        // Initialize analytics
        analytics.trackEvent({
          category: 'System',
          action: 'AppStart',
          label: window.location.pathname
        })
        
        // Start resource monitoring
        const resources = await resourceMonitor.measureResources()
        logger.log({
          message: 'Initial resource metrics',
          data: resources
        })
        
        // Initialize render monitoring
        renderMonitor()
        
        // Log successful initialization
        logger.log({
          message: 'All monitoring services initialized',
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        Sentry.captureException(error)
        logger.error('Failed to initialize monitoring', { error })
      }
    }

    startMonitoring()
  }, [])

  const testSentryError = () => {
    try {
      throw new Error('Test Sentry Error')
    } catch (error) {
      Sentry.captureException(error)
    }
  }

  return (
    <ErrorBoundary>
      <Providers>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Head>
                <meta name="viewport" content="initial-scale=1, width=device-width" />
              </Head>
              <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
                <button
                  onClick={testSentryError}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Test Sentry Error
                </button>
              </div>
              <Component {...pageProps} />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </Providers>
    </ErrorBoundary>
  )
}
