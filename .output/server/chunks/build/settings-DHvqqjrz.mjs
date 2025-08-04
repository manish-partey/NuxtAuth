import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs } from 'vue/server-renderer';

const _sfc_main = {
  __name: "settings",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-4xl mx-auto py-10 px-4" }, _attrs))}><h1 class="text-3xl font-semibold text-gray-800 mb-6">Admin Settings</h1><div class="bg-white rounded-xl shadow p-6 space-y-4"><p class="text-gray-700">Here you can configure platform-level settings (e.g., global toggles, feature flags, user limits, etc.).</p><div class="text-sm text-gray-500 italic">\u{1F527} Feature coming soon...</div></div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/settings.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=settings-DHvqqjrz.mjs.map
