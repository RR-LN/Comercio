const requireEnvVar = (name: string): string => {
  const value = process.env[name];
  const isDev = process.env.NODE_ENV === 'development';
  
  if (!value && !isDev) {
    console.error(`Environment variable not found: ${name}`);
    throw new Error(`Missing required environment variable: ${name}`);
  }
  
  // Development fallbacks
  if (isDev) {
    switch (name) {
      case 'NEXT_PUBLIC_API_URL':
        return 'http://localhost:8000/api';
      case 'NEXT_PUBLIC_ASSETS_URL':
        return 'http://localhost:8000/assets';
      case 'NEXT_PUBLIC_AUTH_URL':
        return 'http://localhost:8000/auth';
      default:
        return value || '';
    }
  }
  
  return value;
};

interface EnvConfig {
  // Core API
  apiUrl: string;
  assetsUrl: string;

  // Authentication
  authUrl: string;
  nextAuthSecret: string;
  nextAuthUrl: string;

  // Payments
  stripePublicKey: string;
  stripeSecretKey: string;

  // Database
  databaseUrl: string;

  // Email
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;

  // Social Auth
  googleClientId: string;
  googleClientSecret: string;
  facebookClientId: string;
  facebookClientSecret: string;

  // Storage
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
  awsRegion: string;
  awsBucketName: string;

  // Cache
  redisUrl: string;

  // Feature Flags
  enableReviews: boolean;
  enableWishlist: boolean;
  enableSocialLogin: boolean;

  // Analytics
  gaTrackingId?: string;
  hotjarId?: string;

  // Environment
  isDevelopment: boolean;
  isProduction: boolean;
  port: number;
}

export const env: EnvConfig = {
  // Core API
  apiUrl: requireEnvVar('NEXT_PUBLIC_API_URL'),
  assetsUrl: requireEnvVar('NEXT_PUBLIC_ASSETS_URL'),

  // Authentication
  authUrl: requireEnvVar('NEXT_PUBLIC_AUTH_URL'),
  nextAuthSecret: requireEnvVar('NEXTAUTH_SECRET'),
  nextAuthUrl: requireEnvVar('NEXTAUTH_URL'),

  // Payments
  stripePublicKey: requireEnvVar('NEXT_PUBLIC_STRIPE_PUBLIC_KEY'),
  stripeSecretKey: requireEnvVar('STRIPE_SECRET_KEY'),

  // Database
  databaseUrl: requireEnvVar('DATABASE_URL'),

  // Email
  smtpHost: requireEnvVar('SMTP_HOST'),
  smtpPort: parseInt(requireEnvVar('SMTP_PORT'), 10),
  smtpUser: requireEnvVar('SMTP_USER'),
  smtpPassword: requireEnvVar('SMTP_PASSWORD'),

  // Social Auth
  googleClientId: requireEnvVar('GOOGLE_CLIENT_ID'),
  googleClientSecret: requireEnvVar('GOOGLE_CLIENT_SECRET'),
  facebookClientId: requireEnvVar('FACEBOOK_CLIENT_ID'),
  facebookClientSecret: requireEnvVar('FACEBOOK_CLIENT_SECRET'),

  // Storage
  awsAccessKeyId: requireEnvVar('AWS_ACCESS_KEY_ID'),
  awsSecretAccessKey: requireEnvVar('AWS_SECRET_ACCESS_KEY'),
  awsRegion: requireEnvVar('AWS_REGION'),
  awsBucketName: requireEnvVar('AWS_BUCKET_NAME'),

  // Cache
  redisUrl: requireEnvVar('REDIS_URL'),

  // Feature Flags
  enableReviews: process.env.NEXT_PUBLIC_ENABLE_REVIEWS === 'true',
  enableWishlist: process.env.NEXT_PUBLIC_ENABLE_WISHLIST === 'true',
  enableSocialLogin: process.env.NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN === 'true',

  // Analytics
  gaTrackingId: process.env.NEXT_PUBLIC_GA_TRACKING_ID,
  hotjarId: process.env.NEXT_PUBLIC_HOTJAR_ID,

  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT || '3000', 10),
};

export const API_ENDPOINTS = {
  auth: {
    login: `${env.authUrl}/login`,
    register: `${env.authUrl}/register`,
    logout: `${env.authUrl}/logout`,
    refresh: `${env.authUrl}/refresh`,
  },
  products: {
    list: `${env.apiUrl}/products`,
    detail: (id: string) => `${env.apiUrl}/products/${id}`,
    search: `${env.apiUrl}/products/search`,
    categories: `${env.apiUrl}/products/categories`,
  },
  cart: {
    get: `${env.apiUrl}/cart`,
    add: `${env.apiUrl}/cart/add`,
    update: `${env.apiUrl}/cart/update`,
    remove: `${env.apiUrl}/cart/remove`,
  },
  orders: {
    create: `${env.apiUrl}/orders`,
    list: `${env.apiUrl}/orders`,
    detail: (id: string) => `${env.apiUrl}/orders/${id}`,
  },
  reviews: {
    create: (productId: string) => `${env.apiUrl}/products/${productId}/reviews`,
    list: (productId: string) => `${env.apiUrl}/products/${productId}/reviews`,
  },
  wishlist: {
    get: `${env.apiUrl}/wishlist`,
    add: `${env.apiUrl}/wishlist/add`,
    remove: `${env.apiUrl}/wishlist/remove`,
  },
  user: {
    profile: `${env.apiUrl}/user/profile`,
    orders: `${env.apiUrl}/user/orders`,
    addresses: `${env.apiUrl}/user/addresses`,
  },
};

export default env;

console.log('Available env vars:', process.env.NEXT_PUBLIC_API_URL);
