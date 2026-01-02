// Corrected nuxt.config.ts
import { resolve } from 'path'

export default defineNuxtConfig({
  compatibilityDate: '2024-05-15',
  devtools: { enabled: true },
  nitro: {
    preset: 'node-server'
  },
  // Workaround for Vite import analysis failing to resolve Nuxt's virtual module
  // "#app-manifest" in dev. We alias it to a local stub so analysis succeeds.
  vite: {
    resolve: {
      alias: {
        '#app-manifest': resolve(__dirname, 'stubs/app-manifest.ts')
      }
    },
    build: {
      cssMinify: 'lightningcss',
      rollupOptions: {
        onwarn(warning, warn) {
          // Suppress CSS minification warnings from Tailwind
          if (warning.code === 'CSS_SYNTAX_ERROR') return
          warn(warning)
        }
      }
    },
    css: {
      postcss: {
        plugins: []
      }
    }
  },
  runtimeConfig: {
    mongodbUri: process.env.MONGO_CONNECTION_STRING,
    jwtSecret: process.env.JWT_SECRET,
    jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    // SMTP configuration (private - server-only)
    // Support both SMTP_* and EMAIL_* variable names for Azure compatibility
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpUser: process.env.SMTP_USER || process.env.EMAIL_USER,
    smtpPass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
    emailFrom: process.env.EMAIL_FROM || 'noreply@easemycargo.com',
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL || process.env.PUBLIC_APP_URL || 'http://localhost:3000',
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    }
  },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config',
    viewer: true,
  },
});