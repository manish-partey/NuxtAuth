import { defineComponent, ref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { useRouter } from 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const organizations = ref([]);
    const loading = ref(false);
    const error = ref("");
    useRouter();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-6" }, _attrs))}><h1 class="text-2xl font-bold mb-4">All Organizations</h1><p class="mb-6 text-gray-600">View and manage all organizations under platforms.</p><button class="mb-4 bg-blue-600 text-white px-4 py-2 rounded"> + Create New Organization </button>`);
      if (loading.value) {
        _push(`<div class="text-gray-500">Loading organizations...</div>`);
      } else {
        _push(`<!---->`);
      }
      if (error.value) {
        _push(`<div class="text-red-600">${ssrInterpolate(error.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (!loading.value && organizations.value.length) {
        _push(`<table class="w-full border-collapse border border-gray-300"><thead><tr class="bg-gray-100"><th class="border border-gray-300 p-2 text-left">Name</th><th class="border border-gray-300 p-2 text-left">Platform</th><th class="border border-gray-300 p-2 text-left">Type</th><th class="border border-gray-300 p-2 text-left">Status</th><th class="border border-gray-300 p-2 text-left">Created At</th><th class="border border-gray-300 p-2">Actions</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(organizations.value, (org) => {
          _push(`<tr class="hover:bg-gray-50 cursor-pointer"><td class="border border-gray-300 p-2">${ssrInterpolate(org.name)}</td><td class="border border-gray-300 p-2">${ssrInterpolate(org.platformName)}</td><td class="border border-gray-300 p-2 capitalize">${ssrInterpolate(org.type)}</td><td class="border border-gray-300 p-2 capitalize">${ssrInterpolate(org.status)}</td><td class="border border-gray-300 p-2">${ssrInterpolate(new Date(org.createdAt).toLocaleDateString())}</td><td class="border border-gray-300 p-2 text-center"><button class="text-blue-600 hover:underline"> Edit </button></td></tr>`);
        });
        _push(`<!--]--></tbody></table>`);
      } else {
        _push(`<!---->`);
      }
      if (!loading.value && !organizations.value.length) {
        _push(`<div class="text-gray-500"> No organizations found. </div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/superadmin/organizations/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-bmPLuT22.mjs.map
