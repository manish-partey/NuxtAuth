// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  experimental: {
    appManifest: true
  },
  devtools: { enabled: true },
  runtimeConfig: {
    mongodbUri: process.env.MONGO_CONNECTION_STRING,
    jwtSecret: process.env.JWT_SECRET,
    emailHost: process.env.SMTP_HOST,
    emailPort: process.env.SMTP_PORT,
    emailUser: process.env.EMAIL_USER,
    emailPass: process.env.EMAIL_PASS,
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'https://manishdevlab.in'
    }
  },
  // IMPORTANT: UNCOMMENT THIS BLOCK
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'], // <--- Ensure @pinia/nuxt is here
  tailwindcss: { // <--- Uncomment this if you're using Tailwind
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config',
    viewer: true,
  },
})