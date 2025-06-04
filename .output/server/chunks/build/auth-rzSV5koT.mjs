import { d as defineNuxtRouteMiddleware, u as useAuthStore, n as navigateTo } from './server.mjs';
import 'vue';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'vue/server-renderer';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'pinia';
import 'vue-router';

const auth = defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();
  if (!authStore.loggedIn && to.path !== "/login" && to.path !== "/register" && to.path !== "/forgot-password" && !to.path.startsWith("/verify-email") && !to.path.startsWith("/reset-password")) {
    return navigateTo("/login");
  }
});

export { auth as default };
//# sourceMappingURL=auth-rzSV5koT.mjs.map
