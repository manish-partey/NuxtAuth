// server/api/auth/logout.post.ts

export default defineEventHandler(async (event) => {
  try {
  // Clear the token cookie
  deleteCookie(event, 'auth_token', { path: '/' });
  return { message: 'Logged out successfully.' };
  } catch (err) {
    throw err;
  }
});