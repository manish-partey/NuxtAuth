import { d as defineEventHandler, e as getUserFromEvent, c as createError, O as Organization } from '../../../nitro/nitro.mjs';
import { c as connectToDatabase } from '../../../_/db.mjs';
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

const listAll = defineEventHandler(async (event) => {
  try {
    const user = await getUserFromEvent(event);
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }
    await connectToDatabase();
    try {
      const orgs = await Organization.aggregate([
        {
          $lookup: {
            from: "platforms",
            // ✅ Corrected from 'organizations' to 'platforms'
            localField: "platformId",
            foreignField: "_id",
            as: "platform"
          }
        },
        { $unwind: { path: "$platform", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            name: 1,
            type: 1,
            platformId: 1,
            platformName: "$platform.name",
            // ✅ This now works
            status: 1,
            createdAt: 1
          }
        },
        { $sort: { name: 1 } }
      ]);
      return {
        success: true,
        organizations: orgs
      };
    } catch (err) {
      console.error("Failed to fetch organizations:", err);
      throw createError({ statusCode: 500, statusMessage: "Failed to load organizations" });
    }
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});

export { listAll as default };
//# sourceMappingURL=listAll.mjs.map
