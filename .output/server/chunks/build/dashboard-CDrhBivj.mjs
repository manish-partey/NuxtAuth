import { defineComponent, withAsyncContext, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs } from 'vue/server-renderer';
import { u as useAuthStore } from './server.mjs';
import { useRouter } from 'vue-router';
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
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'pinia';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "dashboard",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const auth = useAuthStore();
    const router = useRouter();
    [__temp, __restore] = withAsyncContext(() => auth.fetchUser()), await __temp, __restore();
    if (auth.user) {
      switch (auth.user.role) {
        case "super_admin":
          [__temp, __restore] = withAsyncContext(() => router.replace("/superadmin")), await __temp, __restore();
          break;
        case "platform_admin":
          [__temp, __restore] = withAsyncContext(() => router.replace("/platform")), await __temp, __restore();
          break;
        case "organization_admin":
          [__temp, __restore] = withAsyncContext(() => router.replace("/org")), await __temp, __restore();
          break;
        case "admin":
          [__temp, __restore] = withAsyncContext(() => router.replace("/admin")), await __temp, __restore();
          break;
        case "user":
          break;
        default:
          [__temp, __restore] = withAsyncContext(() => router.replace("/login")), await __temp, __restore();
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-8" }, _attrs))}><h1 class="text-2xl font-bold text-blue-600">Welcome to Your Dashboard</h1><p class="mt-4 text-gray-600"> You are successfully logged in. Use the sidebar or navigation to explore the platform. </p></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/dashboard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=dashboard-CDrhBivj.mjs.map
