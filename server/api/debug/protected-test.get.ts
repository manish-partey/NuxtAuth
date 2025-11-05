// server/api/debug/protected-test.get.ts
export default defineEventHandler(async (event) => {
  // This endpoint is NOT in the public paths, so it requires auth
  try {
    const user = event.context.user;
    
    if (!user) {
      return {
        error: 'No user context - auth middleware did not pass',
        context: event.context,
      };
    }

    return {
      success: true,
      message: 'You are authenticated!',
      user: event.context.user,
    };
  } catch (err: any) {
    return { error: err.message };
  }
});
