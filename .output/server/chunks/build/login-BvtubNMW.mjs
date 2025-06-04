import { _ as __nuxt_component_0 } from './nuxt-link-C_CAZIBF.mjs';
import { ref, mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
import { u as useAuthStore } from './server.mjs';
import { useRouter } from 'vue-router';
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

const _sfc_main = {
  __name: "login",
  __ssrInlineRender: true,
  setup(__props) {
    useAuthStore();
    useRouter();
    const email = ref("");
    const password = ref("");
    const error = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex justify-center items-center h-screen" }, _attrs))}><div class="bg-white p-8 rounded shadow-md w-full max-w-md"><h1 class="text-2xl font-bold mb-6 text-center">Sign In</h1><form><div class="mb-4"><label for="email" class="block text-gray-700 text-sm font-bold mb-2">Email:</label><input type="email" id="email"${ssrRenderAttr("value", email.value)} class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required></div><div class="mb-6"><label for="password" class="block text-gray-700 text-sm font-bold mb-2">Password:</label><input type="password" id="password"${ssrRenderAttr("value", password.value)} class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" required></div><button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"> Sign In </button></form>`);
      if (error.value) {
        _push(`<p class="text-red-500 mt-4 text-center">${ssrInterpolate(error.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<p class="mt-4 text-center"> Don&#39;t have an account? `);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/register",
        class: "text-blue-500 hover:underline"
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
      _push(`</p><p class="mt-2 text-center">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/forgot-password",
        class: "text-blue-500 hover:underline"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Forgot Password?`);
          } else {
            return [
              createTextVNode("Forgot Password?")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</p></div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/login.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=login-BvtubNMW.mjs.map
