// server/api/auth/user.get.ts
import { getCookie } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token');
  console.debug('[auth/user] Incoming auth_token cookie:', token);

  const user = await getUserFromEvent(event);

  // ✅ Return null instead of throwing — avoids SSR crash
  if (!user) {
    return { user: null };
  }

  return { user };
});
