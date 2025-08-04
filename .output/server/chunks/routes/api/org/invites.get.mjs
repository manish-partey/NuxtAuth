import { d as defineEventHandler, e as getUserFromEvent, c as createError, O as Organization } from '../../../nitro/nitro.mjs';
import { c as connectToDatabase } from '../../../_/db.mjs';
import { I as Invitation } from '../../../_/Invitation2.mjs';
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
import 'mongodb';

const invites_get = defineEventHandler(async (event) => {
  try {
    const user = await getUserFromEvent(event);
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }
    await connectToDatabase();
    console.log("[INVITES API] Logged in user:", user);
    let invites;
    if (user.role === "super_admin") {
      invites = await Invitation.aggregate([
        {
          $lookup: {
            from: "organizations",
            localField: "organizationId",
            foreignField: "_id",
            as: "organization"
          }
        },
        { $unwind: "$organization" },
        {
          $lookup: {
            from: "organizations",
            localField: "organization.platformId",
            foreignField: "_id",
            as: "platform"
          }
        },
        { $unwind: { path: "$platform", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            email: 1,
            role: 1,
            status: 1,
            createdAt: 1,
            organizationId: 1,
            organizationName: "$organization.name",
            platformName: "$platform.name"
          }
        },
        { $sort: { createdAt: -1 } }
      ]);
    } else if (user.role === "platform_admin") {
      const orgs = await Organization.find({ platformId: user.platformId }, { _id: 1 }).lean();
      const orgIds = orgs.map((org) => org._id);
      invites = await Invitation.find({
        organizationId: { $in: orgIds },
        status: "pending"
      }).sort({ createdAt: -1 }).lean();
    } else if (user.role === "organization_admin") {
      if (!user.organizationId) {
        throw createError({ statusCode: 400, statusMessage: "User has no organization ID" });
      }
      invites = await Invitation.find({
        organizationId: user.organizationId,
        status: "pending"
        // ✅ Only pending invites
      }).sort({ createdAt: -1 }).lean();
    } else {
      throw createError({ statusCode: 403, statusMessage: "Forbidden" });
    }
    return {
      success: true,
      invites
    };
  } catch (err) {
    defaultClient.trackException({ exception: err });
    console.error("[INVITES API] Error:", err.message || err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || "Internal Server Error",
      data: err.message || "Unexpected error"
    });
  }
});

export { invites_get as default };
//# sourceMappingURL=invites.get.mjs.map
