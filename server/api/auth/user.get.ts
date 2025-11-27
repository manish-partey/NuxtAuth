// server/api/auth/user.get.ts
import { getCookie } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';
export default defineEventHandler(async (event) => {
  try {
    console.log('[USER API] Fetching user from session');
    const token = getCookie(event, 'auth_token');
    console.log('[USER API] Token found:', token ? 'Yes' : 'No');
    
    const user = await getUserFromEvent(event);
    console.log('[USER API] User found:', user ? 'Yes' : 'No');

    // Return null instead of throwing — avoids SSR crash
    if (!user) {
      return { user: null };
    }

    return { user };
  } catch (err) {
    console.error('[USER API] Error:', err);
    return { user: null };
  }
});
