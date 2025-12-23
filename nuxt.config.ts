// Corrected nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2024-05-15',
  devtools: { enabled: true },
  nitro: {
    preset: 'node-server'
  },
  runtimeConfig: {
    mongodbUri: process.env.MONGO_CONNECTION_STRING,
    jwtSecret: process.env.JWT_SECRET,
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL || process.env.PUBLIC_APP_URL || 'http://localhost:3000',
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      smtpHost: process.env.SMTP_HOST,
      smtpPort: process.env.SMTP_PORT,
      smtpUser: process.env.SMTP_USER,
      smtpPass: process.env.SMTP_PASS,
      emailFrom: process.env.EMAIL_FROM || 'noreply@easemycargo.com'
    }
  },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config',
    viewer: true,
  },
});