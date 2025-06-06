// server/api/auth/logout.post.ts
export default defineEventHandler(async (event) => {
  // Clear the auth_token cookie
  deleteCookie(event, 'auth_token', { path: '/' });
  return { message: 'Logged out successfully.' };
});