// server/api/debug/verify-user-exists.get.ts
import User from '~/server/models/User';

export default defineEventHandler(async (event) => {
  try {
    const email = getQuery(event).email as string;

    if (!email) {
      return { error: 'Email query parameter is required' };
    }

    console.log(`[VERIFY-USER] Checking user: ${email}`);

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return {
        found: false,
        email,
        message: 'User not found in database',
      };
    }

    return {
      found: true,
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified,
      organizationId: user.organizationId?.toString() || null,
      passwordHashLength: user.password.length,
      passwordHashStart: user.password.substring(0, 40),
      isPasswordHashed: user.password.startsWith('$2'),
    };
  } catch (err: any) {
    console.error('[VERIFY-USER] Error:', err);
    return { error: err.message };
  }
});
