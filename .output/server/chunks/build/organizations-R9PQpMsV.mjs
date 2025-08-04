import { defineComponent, ref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "organizations",
  __ssrInlineRender: true,
  setup(__props) {
    const organizations = ref([]);
    const loading = ref(false);
    const error = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-6xl mx-auto py-10 px-4" }, _attrs))}><h1 class="text-3xl font-bold text-gray-800 mb-6">Organizations in Your Platform</h1>`);
      if (loading.value) {
        _push(`<div class="text-gray-500">Loading organizations...</div>`);
      } else {
        _push(`<!---->`);
      }
      if (error.value) {
        _push(`<div class="text-red-600 font-semibold">${ssrInterpolate(error.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (!loading.value && organizations.value.length) {
        _push(`<div><table class="min-w-full bg-white shadow-md rounded-lg overflow-hidden"><thead class="bg-gray-100 text-gray-700 text-sm font-medium"><tr><th class="text-left px-4 py-2">Name</th><th class="text-left px-4 py-2">Slug</th><th class="text-left px-4 py-2">Status</th><th class="text-left px-4 py-2">Created At</th></tr></thead><tbody class="text-gray-800 text-sm"><!--[-->`);
        ssrRenderList(organizations.value, (org) => {
          _push(`<tr class="border-t hover:bg-gray-50"><td class="px-4 py-2">${ssrInterpolate(org.name)}</td><td class="px-4 py-2">${ssrInterpolate(org.slug)}</td><td class="px-4 py-2 capitalize">${ssrInterpolate(org.status)}</td><td class="px-4 py-2">${ssrInterpolate(new Date(org.createdAt).toLocaleString())}</td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      } else if (!loading.value) {
        _push(`<div class="text-gray-600 italic">No organizations found under your platform.</div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/platform/organizations.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=organizations-R9PQpMsV.mjs.map
