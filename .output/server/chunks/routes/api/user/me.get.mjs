import { d as defineEventHandler, e as getUserFromEvent, l as setResponseStatus, U as User } from '../../../nitro/nitro.mjs';
import { defaultClient } from 'applicationinsights';
import 'mongoose';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'jsonwebtoken';
import 'bcryptjs';

const me_get = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  try {
    try {
      const user = await getUserFromEvent(event);
      if (!user) {
        setResponseStatus(event, 401);
        return { message: "Unauthorized: User not found or invalid token" };
      }
      const populatedUser = await User.findById(user.id).populate("organizationId").populate("platformId").lean();
      if (!populatedUser) {
        setResponseStatus(event, 404);
        return { message: "User not found" };
      }
      return {
        user: {
          id: populatedUser._id.toString(),
          username: populatedUser.username,
          email: populatedUser.email,
          role: populatedUser.role,
          isVerified: populatedUser.isVerified,
          organization: populatedUser.organizationId ? {
            id: ((_b = (_a = populatedUser.organizationId._id) == null ? void 0 : _a.toString) == null ? void 0 : _b.call(_a)) || "",
            name: populatedUser.organizationId.name
          } : null,
          platform: populatedUser.platformId ? {
            id: ((_d = (_c = populatedUser.platformId._id) == null ? void 0 : _c.toString) == null ? void 0 : _d.call(_c)) || "",
            name: populatedUser.platformId.name
          } : null
        }
      };
    } catch (error) {
      console.error("Error fetching user /api/user/me:", error);
      setResponseStatus(event, 500);
      return { message: "Internal server error while fetching user data." };
    }
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});

export { me_get as default };
//# sourceMappingURL=me.get.mjs.map
