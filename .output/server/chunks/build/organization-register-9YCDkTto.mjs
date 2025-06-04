import { ref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';

const _sfc_main = {
  __name: "organization-register",
  __ssrInlineRender: true,
  setup(__props) {
    const orgName = ref("");
    const orgDomain = ref("");
    const adminName = ref("");
    const adminEmail = ref("");
    const adminPassword = ref("");
    const message = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex justify-center items-center h-screen" }, _attrs))} data-v-576494aa><form class="bg-white p-8 rounded shadow-md w-full max-w-xl" data-v-576494aa><h1 class="text-2xl font-bold mb-6 text-center" data-v-576494aa>Register Organization</h1><input${ssrRenderAttr("value", orgName.value)} placeholder="Organization Name" class="input" data-v-576494aa><input${ssrRenderAttr("value", orgDomain.value)} placeholder="Organization Domain" class="input" data-v-576494aa><input${ssrRenderAttr("value", adminName.value)} placeholder="Admin Name" class="input" data-v-576494aa><input${ssrRenderAttr("value", adminEmail.value)} placeholder="Admin Email" type="email" class="input" data-v-576494aa><input${ssrRenderAttr("value", adminPassword.value)} placeholder="Admin Password" type="password" class="input" data-v-576494aa><button type="submit" class="btn-primary w-full" data-v-576494aa>Register</button>`);
      if (message.value) {
        _push(`<p class="mt-4 text-center text-green-500" data-v-576494aa>${ssrInterpolate(message.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</form></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/organization-register.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const organizationRegister = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-576494aa"]]);

export { organizationRegister as default };
//# sourceMappingURL=organization-register-9YCDkTto.mjs.map
