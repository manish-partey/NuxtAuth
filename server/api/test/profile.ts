import { defineEventHandler } from 'h3'

// Public test route that bypasses authentication
export default defineEventHandler(async (event) => {
  // Return mock data without authentication check
  return {
    user: {
      name: "Test User (No Auth)",
      email: "test@example.com",
      bio: "This is a public test profile for PWA testing.",
      createdAt: new Date().toISOString(),
      role: "user"
    },
    success: true
  }
})