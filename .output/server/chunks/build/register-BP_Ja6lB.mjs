import { defineComponent, reactive, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate } from 'vue/server-renderer';
import { b as useRouter } from './server.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "register",
  __ssrInlineRender: true,
  setup(__props) {
    const form = reactive({
      name: "",
      email: "",
      password: ""
    });
    const error = ref("");
    useRouter();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-xl mx-auto py-10" }, _attrs))}><h1 class="text-2xl font-bold mb-6">Register Your Organization</h1><form class="space-y-4"><input${ssrRenderAttr("value", unref(form).name)} type="text" placeholder="Organization Name" class="input input-bordered w-full" required><input${ssrRenderAttr("value", unref(form).email)} type="email" placeholder="Admin Email" class="input input-bordered w-full" required><input${ssrRenderAttr("value", unref(form).password)} type="password" placeholder="Password" class="input input-bordered w-full" required><button type="submit" class="btn btn-primary w-full">Register</button></form>`);
      if (unref(error)) {
        _push(`<p class="text-red-500 mt-4">${ssrInterpolate(unref(error))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/org/register.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=register-BP_Ja6lB.mjs.map
