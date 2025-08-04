import { defineComponent, ref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrIncludeBooleanAttr } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "audit-log",
  __ssrInlineRender: true,
  setup(__props) {
    const logs = ref([]);
    const loading = ref(false);
    const error = ref("");
    const page = ref(1);
    const totalPages = ref(1);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-6" }, _attrs))}><h1 class="text-2xl font-bold mb-4">Audit Logs</h1><p class="mb-6 text-gray-600">Track recent changes and actions by admins across the platform.</p>`);
      if (loading.value) {
        _push(`<div class="text-gray-500">Loading logs...</div>`);
      } else {
        _push(`<!---->`);
      }
      if (error.value) {
        _push(`<div class="text-red-600">${ssrInterpolate(error.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (!loading.value && logs.value.length) {
        _push(`<table class="w-full border-collapse border border-gray-300"><thead><tr class="bg-gray-100"><th class="border border-gray-300 p-2">Timestamp</th><th class="border border-gray-300 p-2">Actor</th><th class="border border-gray-300 p-2">Role</th><th class="border border-gray-300 p-2">Action</th><th class="border border-gray-300 p-2">Target</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(logs.value, (log) => {
          _push(`<tr><td class="border border-gray-300 p-2">${ssrInterpolate(new Date(log.timestamp).toLocaleString())}</td><td class="border border-gray-300 p-2">${ssrInterpolate(log.actorName)}</td><td class="border border-gray-300 p-2 capitalize">${ssrInterpolate(log.actorRole.replace(/_/g, " "))}</td><td class="border border-gray-300 p-2">${ssrInterpolate(log.action)}</td><td class="border border-gray-300 p-2">${ssrInterpolate(log.targetType)}: ${ssrInterpolate(log.targetName)}</td></tr>`);
        });
        _push(`<!--]--></tbody></table>`);
      } else {
        _push(`<!---->`);
      }
      if (!loading.value && !logs.value.length) {
        _push(`<div class="text-gray-500">No audit logs found.</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="mt-4 flex justify-between"><button${ssrIncludeBooleanAttr(page.value === 1) ? " disabled" : ""} class="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"> Previous </button><div>Page ${ssrInterpolate(page.value)} / ${ssrInterpolate(totalPages.value)}</div><button${ssrIncludeBooleanAttr(page.value === totalPages.value) ? " disabled" : ""} class="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"> Next </button></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/superadmin/audit-log.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=audit-log-CyUFP4ko.mjs.map
