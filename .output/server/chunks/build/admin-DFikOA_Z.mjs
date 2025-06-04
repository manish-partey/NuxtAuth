import { B as executeAsync } from '../_/nitro.mjs';
import { d as defineNuxtRouteMiddleware, u as useAuthStore, n as navigateTo } from './server.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import 'node:url';
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

const admin = defineNuxtRouteMiddleware(async (to, from) => {
  let __temp, __restore;
  const authStore = useAuthStore();
  if (!authStore.user && !authStore.loading) {
    try {
      ;
      [__temp, __restore] = executeAsync(() => authStore.fetchUser()), await __temp, __restore();
      ;
    } catch {
      return navigateTo("/login");
    }
  }
  if (!authStore.isAdmin()) {
    return navigateTo("/");
  }
});

export { admin as default };
//# sourceMappingURL=admin-DFikOA_Z.mjs.map
