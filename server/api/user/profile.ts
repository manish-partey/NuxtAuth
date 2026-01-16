import { defineEventHandler } from 'h3'

// Mock user profile data for testing
export default defineEventHandler(async (event) => {
  // In a real app, fetch user info from DB using auth/session
  return {
    user: {
      name: "Test User",
      email: "test@example.com",
      bio: "This is a mock profile for testing PWA and API integration.",
      createdAt: new Date().toISOString(),
      role: "user"
    },
    success: true
  }
})
