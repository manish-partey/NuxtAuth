import { _ as __nuxt_component_0 } from './nuxt-link-C_CAZIBF.mjs';
import { mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
import { u as useAuthStore } from './server.mjs';
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
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'pinia';
import 'vue-router';

const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const authStore = useAuthStore();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-8" }, _attrs))}><h1 class="text-3xl font-bold mb-6">Dashboard</h1>`);
      if (unref(authStore).user) {
        _push(`<p> Welcome, ${ssrInterpolate(unref(authStore).user.name)} (${ssrInterpolate(unref(authStore).user.email)})! <br> Your role: ${ssrInterpolate(unref(authStore).user.role)}</p>`);
      } else {
        _push(`<p>Loading user data...</p>`);
      }
      if (unref(authStore).isAdmin()) {
        _push(`<div class="mt-6">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/admin/create-user",
          class: "inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` + Create New User `);
            } else {
              return [
                createTextVNode(" + Create New User ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<h2 class="text-xl font-bold mt-8 mb-4">Your Content</h2><div class="bg-white p-6 rounded shadow-md"><p>This is protected content for authenticated users.</p></div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/dashboard/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-DLN95WP7.mjs.map
