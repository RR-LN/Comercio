import { cdnConfig } from './cdn'

export const cloudfrontConfig = {
  // Configuração básica
  distribution: {
    enabled: true,
    priceClass: 'PriceClass_100', // Use apenas locais mais baratos
    defaultRootObject: 'index.html',
    httpVersion: 'http2',
    isIPV6Enabled: true,
  },

  // Cache behaviors
  behaviors: {
    // Para arquivos estáticos
    static: {
      pathPattern: '/static/*',
      allowedMethods: ['GET', 'HEAD', 'OPTIONS'],
      cachedMethods: ['GET', 'HEAD'],
      defaultTTL: 86400, // 24 horas
      maxTTL: 31536000, // 1 ano
      minTTL: 0,
      forwardedValues: {
        queryString: false,
        cookies: { forward: 'none' },
      },
    },
    // Para imagens
    images: {
      pathPattern: '/images/*',
      allowedMethods: ['GET', 'HEAD', 'OPTIONS'],
      cachedMethods: ['GET', 'HEAD'],
      defaultTTL: 604800, // 1 semana
      maxTTL: 31536000, // 1 ano
      minTTL: 0,
      forwardedValues: {
        queryString: true, // Para parâmetros de otimização
        cookies: { forward: 'none' },
      },
    }
  },

  // Função para gerar URLs do CloudFront
  getUrl: (path: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif';
  }) => {
    const baseUrl = process.env.NEXT_PUBLIC_CLOUDFRONT_URL
    const params = new URLSearchParams()

    if (options) {
      if (options.width) params.append('w', options.width.toString())
      if (options.height) params.append('h', options.height.toString())
      if (options.quality) params.append('q', options.quality.toString())
      if (options.format) params.append('f', options.format)
    }

    const queryString = params.toString()
    return `${baseUrl}${path}${queryString ? `?${queryString}` : ''}`
  }
} 