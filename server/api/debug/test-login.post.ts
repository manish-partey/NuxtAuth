// server/api/debug/test-login.post.ts
import User from '~/server/models/User';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event) as { email: string; password: string };
    const { email, password } = body;

    console.log(`[DEBUG-LOGIN] Testing login for: ${email}`);
    console.log(`[DEBUG-LOGIN] Password: ${password}`);
    console.log(`[DEBUG-LOGIN] Password length: ${password.length}`);

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return { error: 'User not found', email };
    }

    console.log(`[DEBUG-LOGIN] User found: ${user.email}`);
    console.log(`[DEBUG-LOGIN] User password hash: ${user.password.substring(0, 40)}...`);
    console.log(`[DEBUG-LOGIN] User isVerified: ${user.isVerified}`);

    // Test password comparison
    const isMatch = await user.comparePassword(password.trim());
    console.log(`[DEBUG-LOGIN] Password match: ${isMatch}`);

    return {
      email: user.email,
      passwordMatch: isMatch,
      isVerified: user.isVerified,
      role: user.role,
      passwordHashStart: user.password.substring(0, 40),
      message: isMatch ? 'Password matches! Login should work.' : 'Password does NOT match.',
    };
  } catch (err: any) {
    console.error('[DEBUG-LOGIN] Error:', err);
    return { error: err.message };
  }
});
