import { _ as __nuxt_component_0 } from './nuxt-link-C_CAZIBF.mjs';
import { useSSRContext, mergeProps, withCtx, createTextVNode } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
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
import './server.mjs';
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
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-8 text-center" }, _attrs))} data-v-c6ce1f73><h1 class="text-4xl font-bold mb-4" data-v-c6ce1f73>Welcome to Nuxt Auth App!</h1><p class="text-lg text-gray-700" data-v-c6ce1f73> This is your homepage. Use the navigation bar to sign up, sign in, or access protected areas. </p><div class="mt-8" data-v-c6ce1f73>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/register",
        class: "bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-xl mr-4"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Sign Up`);
          } else {
            return [
              createTextVNode("Sign Up")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/login",
        class: "bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-xl"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Sign In`);
          } else {
            return [
              createTextVNode("Sign In")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c6ce1f73"]]);

export { index as default };
//# sourceMappingURL=index-fezo8gR8.mjs.map
