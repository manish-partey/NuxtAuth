// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  runtimeConfig: {
    mongodbUri: process.env.MONGO_CONNECTION_STRING,
    jwtSecret: process.env.JWT_SECRET,
    emailHost: process.env.SMTP_HOST,
    emailPort: process.env.SMTP_PORT,
    emailUser: process.env.EMAIL_USER,
    emailPass: process.env.EMAIL_PASS,
    appInsightsKey: process.env.APPINSIGHTS_INSTRUMENTATIONKEY, // 🔹 Add this
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'https://devtesting.in'
    }
  },

  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],

  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config',
    viewer: true,
  },

  nitro: {
    preset: 'azure',
    serveStatic: true,
    compressPublicAssets: true,
    routeRules: {
      '/api/**': {
        cors: {
          origin: 'https://devtesting.in',
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
          exposedHeaders: ['Set-Cookie'],
          credentials: true,
        }
      }
    }
  },

  app: {
    baseURL: '/',
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },

  devServer: {
    proxy: true,
    proxyHeaders: true
  }
});
