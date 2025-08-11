import { j as defineNuxtRouteMiddleware, u as useAuthStore, n as navigateTo } from './server.mjs';
import 'vue';
import '../nitro/nitro.mjs';
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
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'vue/server-renderer';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'pinia';
import 'vue-router';

const role = defineNuxtRouteMiddleware((to) => {
  var _a;
  const auth = useAuthStore();
  const userRole = (_a = auth.user) == null ? void 0 : _a.role;
  const allowedRoles = to.meta.roles;
  if (!allowedRoles) {
    return;
  }
  if (!userRole || !allowedRoles.includes(userRole)) {
    return navigateTo("/login");
  }
});

export { role as default };
//# sourceMappingURL=role-CZawdx_I.mjs.map
