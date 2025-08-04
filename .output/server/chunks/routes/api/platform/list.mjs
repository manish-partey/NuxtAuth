import { d as defineEventHandler, e as getUserFromEvent, c as createError } from '../../../nitro/nitro.mjs';
import { c as connectToDatabase } from '../../../_/db.mjs';
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
import 'mongodb';

const list = defineEventHandler(async (event) => {
  try {
    const user = await getUserFromEvent(event);
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }
    await connectToDatabase();
    try {
      const platformsRaw = await Platform.find({}).sort({ createdAt: -1 }).lean();
      const platforms = platformsRaw.map((p) => ({
        _id: p._id,
        name: p.name,
        description: p.description || "",
        type: "platform",
        // fallback static value
        status: "active",
        // fallback static value
        createdAt: p.createdAt
      }));
      return {
        success: true,
        platforms
      };
    } catch (err) {
      console.error("Failed to fetch platforms:", err);
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to load platforms"
      });
    }
  } catch (err) {
    defaultClient.trackException({ exception: err });
    throw err;
  }
});

export { list as default };
//# sourceMappingURL=list.mjs.map
