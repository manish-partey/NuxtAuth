import { P as Platform } from './Platform.mjs';
import { U as User } from '../nitro/nitro.mjs';

async function createPlatform(data) {
  const { name, createdByUserId, description } = data;
  if (!name) {
    throw new Error("Platform name is required");
  }
  const existingPlatform = await Platform.findOne({ name });
  if (existingPlatform) {
    throw new Error("Platform with this name already exists");
  }
  const creator = await User.findById(createdByUserId);
  if (!creator || creator.role !== "super_admin") {
    throw new Error("Only super admins can create platforms");
  }
  const newPlatform = new Platform({ name, description });
  await newPlatform.save();
  return newPlatform;
}
async function assignPlatformAdmin(platformId, userId, assignedByUserId) {
  var _a;
  const assigner = await User.findById(assignedByUserId);
  if (!assigner || !(assigner.role === "super_admin" || assigner.role === "platform_admin" && ((_a = assigner.platformId) == null ? void 0 : _a.toString()) === platformId)) {
    throw new Error("Permission denied to assign platform admins");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User to assign not found");
  }
  user.role = "platform_admin";
  user.platformId = platformId;
  await user.save();
  return user;
}
async function removePlatformAdmin(platformId, userId, removedByUserId) {
  var _a, _b;
  const remover = await User.findById(removedByUserId);
  if (!remover || !(remover.role === "super_admin" || remover.role === "platform_admin" && ((_a = remover.platformId) == null ? void 0 : _a.toString()) === platformId)) {
    throw new Error("Permission denied to remove platform admins");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  if (user.role !== "platform_admin" || ((_b = user.platformId) == null ? void 0 : _b.toString()) !== platformId) {
    throw new Error("User is not a platform admin of this platform");
  }
  user.role = "user";
  user.platformId = null;
  await user.save();
  return user;
}
async function listPlatformAdmins(platformId) {
  const admins = await User.find({
    role: "platform_admin",
    platformId
  }).select("name email username");
  return admins;
}

export { assignPlatformAdmin as a, createPlatform as c, listPlatformAdmins as l, removePlatformAdmin as r };
//# sourceMappingURL=platform2.mjs.map
