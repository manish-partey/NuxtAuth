import { c as defineEventHandler, j as setResponseStatus } from '../../../_/nitro.mjs';
import { U as User } from '../../../_/User.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import 'node:url';
import 'bcryptjs';

async function getAuthUserById(userId) {
  const user = await User.findById(userId).select("-password");
  return user;
}

const me_get = defineEventHandler(async (event) => {
  var _a;
  if (!((_a = event.context.user) == null ? void 0 : _a.userId)) {
    setResponseStatus(event, 401);
    return { message: "Unauthorized: User not found in context" };
  }
  try {
    const user = await getAuthUserById(event.context.user.userId);
    if (!user) {
      setResponseStatus(event, 404);
      return { message: "User not found" };
    }
    return {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    };
  } catch (error) {
    console.error("Error fetching user /api/user/me:", error);
    setResponseStatus(event, 500);
    return { message: "Internal server error while fetching user data." };
  }
});

export { me_get as default };
//# sourceMappingURL=me.get.mjs.map
