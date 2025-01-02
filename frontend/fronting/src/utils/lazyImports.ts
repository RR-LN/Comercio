import dynamic from 'next/dynamic'

// Components
export const PaymentForm = dynamic(() => import('@/components/PaymentForm'), {
  loading: () => <LoadingSpinner />,
  ssr: false // Para componentes que dependem de window/browser APIs
})

export const ProductGallery = dynamic(() => import('@/components/ProductGallery'), {
  loading: () => <LoadingSpinner />,
})

export const Map = dynamic(() => import('@/components/Map'), {
  loading: () => <LoadingSpinner />,
  ssr: false
})

// Pages
export const DashboardPage = dynamic(() => import('@/pages/dashboard'), {
  loading: () => <PageLoader />,
})

// Utilities
export const ChartLibrary = dynamic(() => import('chart.js'), {
  ssr: false
}) 