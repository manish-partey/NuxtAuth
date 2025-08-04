import { U as User, h as sendError, c as createError, v as verifyJwtToken } from '../../../nitro/nitro.mjs';
import bcrypt from 'bcryptjs';
import 'mongoose';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'applicationinsights';
import 'node:url';
import 'jsonwebtoken';

async function registerUser({
  username,
  email,
  password,
  role = "user",
  platformId,
  organizationId,
  invitedByUserId
}) {
  var _a, _b, _c;
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new Error("Email or username already exists.");
  }
  if (!invitedByUserId) throw new Error("Inviter user ID is required");
  const inviterUser = await User.findById(invitedByUserId);
  if (!inviterUser) throw new Error("Inviter user not found");
  const invitedByRole = inviterUser.role;
  switch (invitedByRole) {
    case "super_admin":
      if (role === "platform_admin" && !platformId) {
        throw new Error("Platform ID required for platform_admin role.");
      }
      if (role === "organization_admin" && (!platformId || !organizationId)) {
        throw new Error("Platform ID and Organization ID required for organization_admin role.");
      }
      break;
    case "platform_admin":
      if (role === "organization_admin" && !organizationId) {
        throw new Error("Organization ID required for organization_admin role.");
      }
      if (role === "user" && !organizationId) {
        throw new Error("Organization ID required for user role.");
      }
      platformId = ((_a = inviterUser.platformId) == null ? void 0 : _a.toString()) || platformId;
      break;
    case "organization_admin":
      if (role !== "user") {
        throw new Error('Org admins can only create users with role "user".');
      }
      if (!organizationId) {
        throw new Error("Organization ID required for user role.");
      }
      platformId = (_b = inviterUser.platformId) == null ? void 0 : _b.toString();
      organizationId = (_c = inviterUser.organizationId) == null ? void 0 : _c.toString();
      break;
    default:
      throw new Error("Inviter role is not authorized to create users.");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    role,
    platformId,
    organizationId,
    isVerified: false
  });
  await newUser.save();
  const safeUser = newUser.toObject();
  delete safeUser.password;
  return safeUser;
}
async function getAuthUserById(userId) {
  return await User.findById(userId).populate("organizationId").populate("platformId").select("-password").lean();
}

async function handler(event) {
  try {
    const authHeader = event.node.req.headers.authorization || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return sendError(event, createError({ statusCode: 401, statusMessage: "Authorization token missing" }));
    }
    const authUserId = verifyJwtToken(token);
    if (!authUserId) {
      return sendError(event, createError({ statusCode: 401, statusMessage: "Invalid or expired token" }));
    }
    const authUser = await getAuthUserById(authUserId);
    if (!authUser) {
      return sendError(event, createError({ statusCode: 401, statusMessage: "User not found" }));
    }
    const body = await useBody(event);
    const { username, email, password, role, organizationId, platformId } = body;
    if (!username || !email || !password || !role) {
      return sendError(event, createError({ statusCode: 400, statusMessage: "Missing required fields" }));
    }
    const newUser = await registerUser({
      username,
      email,
      password,
      role,
      platformId: platformId || (authUser.platform ? authUser.platform.toString() : void 0),
      organizationId: organizationId || (authUser.organization ? authUser.organization.toString() : void 0),
      invitedByRole: authUser.role
    });
    return {
      success: true,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        platform: newUser.platform,
        organization: newUser.organization
      }
    };
  } catch (error) {
    return sendError(event, createError({ statusCode: 400, statusMessage: error.message || "Failed to invite user" }));
  }
}

export { handler as default };
//# sourceMappingURL=invite.mjs.map
