import { defineComponent, withAsyncContext, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { u as useFetch } from './fetch-DfM37FnY.mjs';
import { a as useRequestHeaders } from './server.mjs';
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
import '@vue/shared';
import 'perfect-debounce';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'pinia';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "invites",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data: invites, pending, error } = ([__temp, __restore] = withAsyncContext(() => useFetch("/api/user/invite", { credentials: "include", headers: useRequestHeaders(["cookie"]) }, "$vKYDm7XZwD")), __temp = await __temp, __restore(), __temp);
    if (error.value) {
      console.error("Failed to fetch invites:", error.value);
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}><h1 class="text-2xl font-bold mb-4">User Invitations</h1>`);
      if (unref(pending)) {
        _push(`<div>Loading...</div>`);
      } else {
        _push(`<div><table class="min-w-full border bg-white"><thead><tr class="bg-gray-100"><th class="text-left p-2">Email</th><th class="text-left p-2">Role</th><th class="text-left p-2">Organization</th><th class="text-left p-2">Status</th><th class="text-left p-2">Created At</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(invites), (invite) => {
          var _a;
          _push(`<tr class="border-t"><td class="p-2">${ssrInterpolate(invite.email)}</td><td class="p-2 capitalize">${ssrInterpolate(invite.role)}</td><td class="p-2">${ssrInterpolate(((_a = invite.organization) == null ? void 0 : _a.name) || "\u2014")}</td><td class="p-2"><span class="${ssrRenderClass(invite.accepted ? "text-green-600" : "text-yellow-600")}">${ssrInterpolate(invite.accepted ? "Accepted" : "Pending")}</span></td><td class="p-2">${ssrInterpolate(new Date(invite.createdAt).toLocaleString())}</td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/invites.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=invites-M_oAYbzp.mjs.map
