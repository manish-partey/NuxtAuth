import { defineComponent, ref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { useRouter } from 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "create-platform",
  __ssrInlineRender: true,
  setup(__props) {
    useRouter();
    const name = ref("");
    const type = ref("");
    const error = ref("");
    const loading = ref(false);
    const platformTypes = ["grocery", "college", "doctor", "hospital", "other"];
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-6 max-w-lg mx-auto" }, _attrs))}><h1 class="text-2xl font-bold mb-6">Create New Platform</h1><form class="space-y-4"><div><label for="name" class="block font-semibold mb-1">Platform Name</label><input id="name" type="text"${ssrRenderAttr("value", name.value)} class="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g., Grocery Chain" required></div><div><label for="type" class="block font-semibold mb-1">Platform Type</label><select id="type" class="w-full border border-gray-300 rounded px-3 py-2" required><option value="" disabled${ssrIncludeBooleanAttr(Array.isArray(type.value) ? ssrLooseContain(type.value, "") : ssrLooseEqual(type.value, "")) ? " selected" : ""}>Select Type</option><!--[-->`);
      ssrRenderList(platformTypes, (pt) => {
        _push(`<option${ssrRenderAttr("value", pt)}${ssrIncludeBooleanAttr(Array.isArray(type.value) ? ssrLooseContain(type.value, pt) : ssrLooseEqual(type.value, pt)) ? " selected" : ""}>${ssrInterpolate(pt)}</option>`);
      });
      _push(`<!--]--></select></div>`);
      if (error.value) {
        _push(`<div class="text-red-600">${ssrInterpolate(error.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"${ssrIncludeBooleanAttr(loading.value) ? " disabled" : ""}> Create Platform </button></form></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/superadmin/create-platform.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=create-platform-DWb8PTxn.mjs.map
