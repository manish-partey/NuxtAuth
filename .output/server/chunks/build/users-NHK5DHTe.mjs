import { defineComponent, withAsyncContext, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
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
import '@vue/shared';
import './server.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'pinia';
import 'vue-router';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "users",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data, error, pending } = ([__temp, __restore] = withAsyncContext(() => useFetch("/api/platform/users", {
      credentials: "include"
    }, "$tnn74gj6Kt")), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-6xl mx-auto py-10 px-4" }, _attrs))}><h1 class="text-3xl font-bold text-gray-800 mb-6">Platform Users</h1>`);
      if (unref(pending)) {
        _push(`<div class="text-gray-600">Loading users...</div>`);
      } else if (unref(error)) {
        _push(`<div class="text-red-600 font-semibold">Failed to load users.</div>`);
      } else {
        _push(`<div><table class="w-full border-collapse"><thead><tr class="bg-gray-100 text-left"><th class="py-2 px-4">Name</th><th class="py-2 px-4">Email</th><th class="py-2 px-4">Role</th><th class="py-2 px-4">Organization</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(data).users, (user) => {
          _push(`<tr class="border-b hover:bg-gray-50"><td class="py-2 px-4">${ssrInterpolate(user.name)}</td><td class="py-2 px-4">${ssrInterpolate(user.email)}</td><td class="py-2 px-4">${ssrInterpolate(user.role)}</td><td class="py-2 px-4">${ssrInterpolate(user.organizationName || "N/A")}</td></tr>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/platform/users.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=users-NHK5DHTe.mjs.map
