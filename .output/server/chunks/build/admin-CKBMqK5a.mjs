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

const admin = defineNuxtRouteMiddleware(async (to, from) => {
  var _a;
  const authStore = useAuthStore();
  if (!authStore.loggedIn) {
    return navigateTo("/login");
  }
  if (((_a = authStore.user) == null ? void 0 : _a.role) !== "admin") {
    return navigateTo("/dashboard");
  }
});

export { admin as default };
//# sourceMappingURL=admin-CKBMqK5a.mjs.map
