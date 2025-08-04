import { defineComponent, withAsyncContext, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
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
  __name: "platforms",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data: platforms, pending, error } = ([__temp, __restore] = withAsyncContext(() => useFetch("/api/platform/listAdmins", { credentials: "include", headers: useRequestHeaders(["cookie"]) }, "$NN_cWGCOie")), __temp = await __temp, __restore(), __temp);
    if (error.value) {
      console.error("Failed to load platforms", error.value);
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}><h1 class="text-2xl font-bold mb-4">All Platforms</h1>`);
      if (unref(pending)) {
        _push(`<div class="text-gray-500">Loading...</div>`);
      } else {
        _push(`<div><table class="min-w-full bg-white border"><thead><tr class="bg-gray-100"><th class="text-left p-2">Name</th><th class="text-left p-2">Admins</th><th class="text-left p-2">Created At</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(platforms), (platform) => {
          _push(`<tr class="border-t"><td class="p-2">${ssrInterpolate(platform.name)}</td><td class="p-2"><ul><!--[-->`);
          ssrRenderList(platform.admins, (admin) => {
            _push(`<li>${ssrInterpolate(admin.email)}</li>`);
          });
          _push(`<!--]--></ul></td><td class="p-2">${ssrInterpolate(new Date(platform.createdAt).toLocaleString())}</td></tr>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/platforms.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=platforms-Beb3qG_m.mjs.map
