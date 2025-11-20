// server/api/auth/user.get.ts
import { getCookie } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';


export default defineEventHandler(async (event) => {
  try {
  const token = getCookie(event, 'auth_token');
  // Extract auth token from cookie

  const user = await getUserFromEvent(event);

  // ✅ Return null instead of throwing — avoids SSR crash
  if (!user) {
    return { user: null };
  }

  return { user };
  } catch (err) {
    throw err;
  }
});
