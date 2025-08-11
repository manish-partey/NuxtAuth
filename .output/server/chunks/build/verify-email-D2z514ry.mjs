import { _ as __nuxt_component_0 } from './nuxt-link-5ia3z20d.mjs';
import { ref, mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderClass, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
import { useRoute } from 'vue-router';
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

const _sfc_main = {
  __name: "verify-email",
  __ssrInlineRender: true,
  setup(__props) {
    useRoute();
    const message = ref("");
    const messageType = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-center justify-center min-h-screen bg-gray-50 px-4" }, _attrs))}><section class="bg-white p-10 rounded-xl shadow-lg max-w-md w-full text-center" aria-live="polite" aria-atomic="true"><h1 class="text-3xl font-extrabold text-gray-900 mb-8"> Email Verification </h1>`);
      if (message.value) {
        _push(`<p class="${ssrRenderClass([messageType.value === "success" ? "text-green-600" : "text-red-600", "text-lg font-medium"])}" role="alert">${ssrInterpolate(message.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (messageType.value === "success") {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/login",
          class: "mt-8 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md shadow-md transition focus:outline-none focus:ring-4 focus:ring-blue-400"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Go to Login `);
            } else {
              return [
                createTextVNode(" Go to Login ")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</section></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/verify-email.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=verify-email-D2z514ry.mjs.map
