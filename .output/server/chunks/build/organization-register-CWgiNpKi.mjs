import { ref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate } from 'vue/server-renderer';

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
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen flex items-center justify-center bg-gray-50 px-4" }, _attrs))}><div class="w-full max-w-xl bg-white p-8 rounded-2xl shadow-lg"><h1 class="text-3xl font-semibold text-center text-blue-700 mb-6">Register Your Organization</h1><form class="space-y-5"><div><label class="block text-sm font-medium text-gray-700 mb-1">Organization Name</label><input${ssrRenderAttr("value", orgName.value)} type="text" placeholder="e.g. Acme Corp" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required></div><div><label class="block text-sm font-medium text-gray-700 mb-1">Organization Domain</label><input${ssrRenderAttr("value", orgDomain.value)} type="text" placeholder="e.g. acme.com" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required></div><div><label class="block text-sm font-medium text-gray-700 mb-1">Admin Name</label><input${ssrRenderAttr("value", adminName.value)} type="text" placeholder="John Doe" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required></div><div><label class="block text-sm font-medium text-gray-700 mb-1">Admin Email</label><input${ssrRenderAttr("value", adminEmail.value)} type="email" placeholder="admin@acme.com" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required></div><div><label class="block text-sm font-medium text-gray-700 mb-1">Admin Password</label><input${ssrRenderAttr("value", adminPassword.value)} type="password" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required></div><button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"> Register Organization </button></form>`);
      if (message.value) {
        _push(`<p class="text-center mt-4 text-sm text-green-600 font-medium">${ssrInterpolate(message.value)}</p>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/organization-register.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=organization-register-CWgiNpKi.mjs.map
