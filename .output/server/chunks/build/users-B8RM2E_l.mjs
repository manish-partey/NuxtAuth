import { defineComponent, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { u as useAuthStore } from './server.mjs';
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
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "users",
  __ssrInlineRender: true,
  setup(__props) {
    var _a;
    const users = ref([]);
    const loading = ref(false);
    const error = ref("");
    const currentUserId = ((_a = useAuthStore().user) == null ? void 0 : _a._id) || "";
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-6 max-w-7xl mx-auto" }, _attrs))}><h1 class="text-2xl font-bold mb-4">Manage Users</h1><p class="mb-4 text-gray-600">List of all users across the platform with admin controls.</p>`);
      if (loading.value) {
        _push(`<div class="text-gray-600">Loading users...</div>`);
      } else {
        _push(`<!---->`);
      }
      if (error.value) {
        _push(`<div class="text-red-600">${ssrInterpolate(error.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (!loading.value && users.value.length) {
        _push(`<table class="min-w-full bg-white rounded-lg overflow-hidden shadow-md text-sm"><thead class="bg-gray-100 border-b text-gray-800"><tr><th class="text-left px-4 py-2">Name</th><th class="text-left px-4 py-2">Email</th><th class="text-left px-4 py-2">Role</th><th class="text-left px-4 py-2">Organization</th><th class="text-left px-4 py-2">Status</th><th class="text-left px-4 py-2">Actions</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(users.value, (user) => {
          var _a2;
          _push(`<tr class="border-b hover:bg-gray-50"><td class="px-4 py-2"><input${ssrRenderAttr("value", user.name)} type="text" class="border px-2 py-1 w-full rounded"${ssrIncludeBooleanAttr(user._id === unref(currentUserId)) ? " readonly" : ""}></td><td class="px-4 py-2"><input${ssrRenderAttr("value", user.email)} type="email" class="border px-2 py-1 w-full rounded"${ssrIncludeBooleanAttr(user._id === unref(currentUserId)) ? " readonly" : ""}></td><td class="px-4 py-2"><select class="border rounded px-2 py-1"${ssrIncludeBooleanAttr(user._id === unref(currentUserId)) ? " disabled" : ""}><option value="super_admin"${ssrIncludeBooleanAttr(Array.isArray(user.role) ? ssrLooseContain(user.role, "super_admin") : ssrLooseEqual(user.role, "super_admin")) ? " selected" : ""}>Super Admin</option><option value="platform_admin"${ssrIncludeBooleanAttr(Array.isArray(user.role) ? ssrLooseContain(user.role, "platform_admin") : ssrLooseEqual(user.role, "platform_admin")) ? " selected" : ""}>Platform Admin</option><option value="organization_admin"${ssrIncludeBooleanAttr(Array.isArray(user.role) ? ssrLooseContain(user.role, "organization_admin") : ssrLooseEqual(user.role, "organization_admin")) ? " selected" : ""}>Organization Admin</option><option value="user"${ssrIncludeBooleanAttr(Array.isArray(user.role) ? ssrLooseContain(user.role, "user") : ssrLooseEqual(user.role, "user")) ? " selected" : ""}>User</option></select></td><td class="px-4 py-2">${ssrInterpolate(((_a2 = user.organization) == null ? void 0 : _a2.name) || "N/A")}</td><td class="px-4 py-2"><span class="${ssrRenderClass([
            "text-xs font-semibold px-2 py-1 rounded",
            user.disabled ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          ])}">${ssrInterpolate(user.disabled ? "Disabled" : "Active")}</span></td><td class="px-4 py-2 space-x-2"><button class="${ssrRenderClass([user.disabled ? "bg-green-600 hover:bg-green-700" : "bg-yellow-500 hover:bg-yellow-600", "text-sm text-white px-3 py-1 rounded"])}"${ssrIncludeBooleanAttr(user._id === unref(currentUserId)) ? " disabled" : ""}>${ssrInterpolate(user.disabled ? "Enable" : "Disable")}</button><button class="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"${ssrIncludeBooleanAttr(user._id === unref(currentUserId)) ? " disabled" : ""}> Save </button></td></tr>`);
        });
        _push(`<!--]--></tbody></table>`);
      } else {
        _push(`<!---->`);
      }
      if (!loading.value && !users.value.length) {
        _push(`<p class="text-gray-600 italic">No users found.</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/superadmin/users.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=users-B8RM2E_l.mjs.map
