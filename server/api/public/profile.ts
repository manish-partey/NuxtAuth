// Public profile API - no authentication required
export default defineEventHandler(async (event) => {
  // Return mock data immediately without any auth checks
  return {
    user: {
      name: "Demo User",
      email: "demo@easemycargo.com", 
      bio: "This is a public demo profile for testing PWA features without authentication.",
      createdAt: new Date().toISOString(),
      role: "demo"
    },
    success: true
  }
})