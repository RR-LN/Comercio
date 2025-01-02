export const cdnConfig = {
  baseUrl: process.env.NEXT_PUBLIC_CLOUDFRONT_URL,
  imageOptimization: {
    quality: 80,
    formats: ['webp', 'avif'],
    sizes: [640, 750, 828, 1080, 1200, 1920],
  }
} 