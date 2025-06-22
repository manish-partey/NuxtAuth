// server/api/auth/logout.post.ts
import { defaultClient } from 'applicationinsights';

export default defineEventHandler(async (event) => {
  try {
  // Clear the token cookie
  deleteCookie(event, 'auth_token', { path: '/' });
  return { message: 'Logged out successfully.' };
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});