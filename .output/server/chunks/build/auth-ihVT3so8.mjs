import { E as executeAsync } from '../nitro/nitro.mjs';
import { j as defineNuxtRouteMiddleware, u as useAuthStore, n as navigateTo } from './server.mjs';
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
import 'bcryptjs';
import 'vue';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'vue/server-renderer';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'pinia';
import 'vue-router';

const auth = defineNuxtRouteMiddleware(async (to) => {
  var _a, _b;
  let __temp, __restore;
  const authStore = useAuthStore();
  try {
    if (!authStore.user && !authStore.loading) {
      ;
      [__temp, __restore] = executeAsync(() => authStore.fetchUser()), await __temp, __restore();
      ;
    }
  } catch (err) {
    console.warn("[Auth Middleware] fetchUser failed:", err);
  }
  const publicPages = ["/", "/login", "/register", "/forgot-password"];
  const isPublic = publicPages.includes(to.path) || to.path.startsWith("/verify-email") || to.path.startsWith("/reset-password");
  if (!authStore.loggedIn && !isPublic) {
    return navigateTo("/login");
  }
  const role = (_a = authStore.user) == null ? void 0 : _a.role;
  if (to.path === "/dashboard") {
    switch (role) {
      case "user":
        return;
      case "super_admin":
        return navigateTo("/superadmin");
      case "platform_admin":
        return navigateTo("/platform");
      case "organization_admin":
        return navigateTo("/org");
      case "admin":
        return navigateTo("/admin");
      default:
        return navigateTo("/login");
    }
  }
  const allowedRoles = ((_b = to.meta) == null ? void 0 : _b.roles) || [];
  if (allowedRoles.length && role && !allowedRoles.includes(role)) {
    return navigateTo("/login");
  }
});

export { auth as default };
//# sourceMappingURL=auth-ihVT3so8.mjs.map
