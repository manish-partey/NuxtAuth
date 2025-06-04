import { _ as __nuxt_component_0 } from './nuxt-link-C_CAZIBF.mjs';
import { ref, mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderClass, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
import { useRoute } from 'vue-router';
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

const _sfc_main = {
  __name: "verify-email",
  __ssrInlineRender: true,
  setup(__props) {
    useRoute();
    const message = ref("");
    const messageType = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex justify-center items-center h-screen" }, _attrs))}><div class="bg-white p-8 rounded shadow-md w-full max-w-md text-center"><h1 class="text-2xl font-bold mb-6">Email Verification</h1>`);
      if (message.value) {
        _push(`<p class="${ssrRenderClass(messageType.value === "success" ? "text-green-500" : "text-red-500")}">${ssrInterpolate(message.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (messageType.value === "success") {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/login",
          class: "mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Go to Login`);
            } else {
              return [
                createTextVNode("Go to Login")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
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
//# sourceMappingURL=verify-email-Cm4wYC4h.mjs.map
