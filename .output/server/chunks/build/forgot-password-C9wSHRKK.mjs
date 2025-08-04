import { _ as __nuxt_component_0 } from './nuxt-link-5ia3z20d.mjs';
import { ref, mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderClass, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
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
  __name: "forgot-password",
  __ssrInlineRender: true,
  setup(__props) {
    const email = ref("");
    const message = ref("");
    const messageType = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex justify-center items-center min-h-screen bg-gray-50 px-4" }, _attrs))}><section class="bg-white p-10 rounded-xl shadow-lg w-full max-w-md" aria-labelledby="forgot-password-title"><h1 id="forgot-password-title" class="text-3xl font-extrabold text-gray-900 mb-8 text-center tracking-tight"> Forgot Password </h1><form class="space-y-6"><div><label for="email" class="block text-gray-700 text-sm font-semibold mb-2"> Email </label><input type="email" id="email"${ssrRenderAttr("value", email.value)} required autocomplete="email" class="w-full rounded-md border border-gray-300 px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition"></div><button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md py-3 shadow-md transition focus:outline-none focus:ring-4 focus:ring-blue-400"> Send Reset Link </button></form>`);
      if (message.value) {
        _push(`<p class="${ssrRenderClass([messageType.value === "success" ? "text-green-600" : "text-red-600", "mt-6 text-center font-medium"])}" role="alert">${ssrInterpolate(message.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<p class="mt-6 text-center text-gray-700"> Remember your password? `);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/login",
        class: "text-blue-600 hover:underline font-medium ml-1"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Sign In `);
          } else {
            return [
              createTextVNode(" Sign In ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</p></section></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/forgot-password.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=forgot-password-C9wSHRKK.mjs.map
