export const bundleConfig = {
  // Módulos que devem ser sempre carregados separadamente
  splitChunks: [
    'react',
    'react-dom',
    '@chakra-ui',
    '@emotion',
    'framer-motion',
    'chart.js',
    'three.js'
  ],

  // Módulos que devem ser carregados juntos
  commonChunks: [
    '@/components',
    '@/hooks',
    '@/utils'
  ],

  // Prefetch de rotas comuns
  prefetchRoutes: [
    '/products',
    '/cart',
    '/checkout',
    '/profile'
  ],

  // Configurações de cache
  cache: {
    maxAge: 31536000, // 1 ano
    immutable: true,
    staleWhileRevalidate: 604800 // 1 semana
  },

  // Configurações de compressão
  compression: {
    brotli: {
      enabled: true,
      quality: 11
    },
    gzip: {
      enabled: true,
      level: 9
    }
  }
} 