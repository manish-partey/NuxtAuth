import { defineComponent, ref, withAsyncContext, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { a as useRequestHeaders } from './server.mjs';
import { u as useFetch } from './fetch-DfM37FnY.mjs';
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
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "invites",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const email = ref("");
    const role = ref("organization_admin");
    const successMessage = ref("");
    const errorMessage = ref("");
    const resending = ref(null);
    const revoking = ref(null);
    const { data, error, pending, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch("/api/platform/invites", {
      credentials: "include",
      headers: useRequestHeaders(["cookie"])
    }, "$YNv8LT3JNr")), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-6xl mx-auto py-10 px-4" }, _attrs))}><h1 class="text-3xl font-bold text-gray-800 mb-6">Platform Invitations</h1><div class="mb-8 p-4 bg-white shadow rounded-xl space-y-4 border border-gray-200"><h2 class="text-lg font-semibold">Send New Platform Invitation</h2><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label class="block text-sm font-medium text-gray-700 mb-1">Email</label><input${ssrRenderAttr("value", email.value)} type="email" class="w-full border border-gray-300 rounded px-3 py-2" placeholder="admin@company.com" required></div><div><label class="block text-sm font-medium text-gray-700 mb-1">Role</label><select class="w-full border border-gray-300 rounded px-3 py-2"><option value="organization_admin"${ssrIncludeBooleanAttr(Array.isArray(role.value) ? ssrLooseContain(role.value, "organization_admin") : ssrLooseEqual(role.value, "organization_admin")) ? " selected" : ""}>Organization Admin</option><option value="user"${ssrIncludeBooleanAttr(Array.isArray(role.value) ? ssrLooseContain(role.value, "user") : ssrLooseEqual(role.value, "user")) ? " selected" : ""}>Regular User</option></select></div></div><button class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded transition"> Send Invite </button>`);
      if (successMessage.value) {
        _push(`<p class="text-green-600 text-sm mt-2">${ssrInterpolate(successMessage.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (errorMessage.value) {
        _push(`<p class="text-red-600 text-sm mt-2">${ssrInterpolate(errorMessage.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(pending)) {
        _push(`<div class="text-gray-600">Loading invites...</div>`);
      } else if (unref(error)) {
        _push(`<div class="text-red-600 font-semibold">Failed to load invites.</div>`);
      } else if ((_b = (_a = unref(data)) == null ? void 0 : _a.invites) == null ? void 0 : _b.length) {
        _push(`<div><table class="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden"><thead class="bg-gray-100 text-left"><tr><th class="py-2 px-4">Email</th><th class="py-2 px-4">Role</th><th class="py-2 px-4">Platform</th><th class="py-2 px-4">Status</th><th class="py-2 px-4">Created At</th><th class="py-2 px-4">Actions</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(data).invites, (invite) => {
          var _a2;
          _push(`<tr class="border-b hover:bg-gray-50"><td class="py-2 px-4">${ssrInterpolate(invite.email)}</td><td class="py-2 px-4 capitalize">${ssrInterpolate(invite.role.replace(/_/g, " "))}</td><td class="py-2 px-4">${ssrInterpolate(((_a2 = invite.platform) == null ? void 0 : _a2.name) || "N/A")}</td><td class="py-2 px-4 capitalize">${ssrInterpolate(invite.status)}</td><td class="py-2 px-4">${ssrInterpolate(new Date(invite.createdAt).toLocaleString())}</td><td class="py-2 px-4 space-x-2"><button class="text-blue-600 text-sm hover:underline"${ssrIncludeBooleanAttr(resending.value === invite._id) ? " disabled" : ""}>${ssrInterpolate(resending.value === invite._id ? "Resending..." : "Resend")}</button><button class="text-red-600 text-sm hover:underline"${ssrIncludeBooleanAttr(revoking.value === invite._id) ? " disabled" : ""}>${ssrInterpolate(revoking.value === invite._id ? "Revoking..." : "Revoke")}</button></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      } else {
        _push(`<div class="text-gray-500">No invitations found.</div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/platform/invites.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=invites-WTp07-ri.mjs.map
