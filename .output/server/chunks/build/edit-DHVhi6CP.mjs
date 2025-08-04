import { defineComponent, ref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { useRoute, useRouter } from 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "edit",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    useRouter();
    route.params.id;
    const name = ref("");
    const description = ref("");
    const error = ref("");
    const loading = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-6 max-w-xl mx-auto" }, _attrs))}><h1 class="text-2xl font-bold mb-4">Edit Platform</h1><form class="space-y-4"><div><label class="block font-semibold mb-1">Platform Name</label><input${ssrRenderAttr("value", name.value)} type="text" class="w-full border px-3 py-2 rounded" required></div><div><label class="block font-semibold mb-1">Description</label><textarea class="w-full border px-3 py-2 rounded" rows="3">${ssrInterpolate(description.value)}</textarea></div>`);
      if (error.value) {
        _push(`<div class="text-red-600">${ssrInterpolate(error.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"${ssrIncludeBooleanAttr(loading.value) ? " disabled" : ""}> Update Platform </button></form></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/superadmin/platforms/[id]/edit.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=edit-DHVhi6CP.mjs.map
