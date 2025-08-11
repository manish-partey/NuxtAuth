import { d as defineEventHandler, k as getQuery, c as createError, O as Organization } from '../../../nitro/nitro.mjs';
import { I as Invitation } from '../../../_/Invitation2.mjs';
import { P as Platform } from '../../../_/Platform.mjs';
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

const invite_get = defineEventHandler(async (event) => {
  var _a;
  try {
    const { token } = getQuery(event);
    if (!token || typeof token !== "string") {
      throw createError({ statusCode: 400, statusMessage: "Invalid or missing token" });
    }
    const invitation = await Invitation.findOne({ token }).lean();
    if (!invitation) {
      throw createError({ statusCode: 404, statusMessage: "Invitation not found" });
    }
    const org = invitation.organizationId ? await Organization.findById(invitation.organizationId).select("name") : null;
    const platform = invitation.platformId ? await Platform.findById(invitation.platformId).select("name") : null;
    return {
      success: true,
      invitation: {
        email: invitation.email,
        role: invitation.role,
        organizationName: (org == null ? void 0 : org.name) || "",
        platformName: (platform == null ? void 0 : platform.name) || ""
      }
    };
  } catch (err) {
    if (typeof ((_a = defaultClient) == null ? void 0 : _a.trackException) === "function") {
      defaultClient.trackException({ exception: err });
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Server Error",
      data: err instanceof Error ? err.message : "Unknown error"
    });
  }
});

export { invite_get as default };
//# sourceMappingURL=invite.get.mjs.map
