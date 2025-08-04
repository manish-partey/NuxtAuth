import { defineComponent, ref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "settings",
  __ssrInlineRender: true,
  setup(__props) {
    const orgName = ref("");
    const saving = ref(false);
    const success = ref(false);
    const error = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-xl mx-auto py-10 px-4" }, _attrs))}><h1 class="text-3xl font-semibold text-gray-800 mb-6">Organization Settings</h1><form class="bg-white p-6 shadow rounded-xl space-y-4"><div><label class="block text-sm font-medium text-gray-700 mb-1">Organization Name</label><input${ssrRenderAttr("value", orgName.value)} type="text" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"></div><button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"${ssrIncludeBooleanAttr(saving.value) ? " disabled" : ""}>${ssrInterpolate(saving.value ? "Saving..." : "Update Settings")}</button></form>`);
      if (success.value) {
        _push(`<p class="text-green-600 mt-4">Organization updated successfully.</p>`);
      } else {
        _push(`<!---->`);
      }
      if (error.value) {
        _push(`<p class="text-red-600 mt-4">Failed to update. Try again later.</p>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/org/settings.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=settings-Dt496KBc.mjs.map
