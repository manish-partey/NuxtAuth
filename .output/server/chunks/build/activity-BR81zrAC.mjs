import { defineComponent, ref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "activity",
  __ssrInlineRender: true,
  setup(__props) {
    const stats = ref({
      platformsCount: 0,
      organizationsCount: 0,
      usersCount: 0,
      invitesCount: 0
    });
    const loading = ref(false);
    const error = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-6 space-y-6" }, _attrs))}><h1 class="text-2xl font-bold">Super Admin Dashboard Overview</h1>`);
      if (loading.value) {
        _push(`<div class="text-gray-500">Loading statistics...</div>`);
      } else {
        _push(`<!---->`);
      }
      if (error.value) {
        _push(`<div class="text-red-600">${ssrInterpolate(error.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (!loading.value && !error.value) {
        _push(`<div class="grid grid-cols-1 sm:grid-cols-4 gap-6"><div class="bg-white shadow rounded-lg p-4"><div class="text-lg font-semibold">${ssrInterpolate(stats.value.platformsCount)}</div><div class="text-gray-500">Platforms</div></div><div class="bg-white shadow rounded-lg p-4"><div class="text-lg font-semibold">${ssrInterpolate(stats.value.organizationsCount)}</div><div class="text-gray-500">Organizations</div></div><div class="bg-white shadow rounded-lg p-4"><div class="text-lg font-semibold">${ssrInterpolate(stats.value.usersCount)}</div><div class="text-gray-500">Users</div></div><div class="bg-white shadow rounded-lg p-4"><div class="text-lg font-semibold">${ssrInterpolate(stats.value.invitesCount)}</div><div class="text-gray-500">Pending Invites</div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/superadmin/activity.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=activity-BR81zrAC.mjs.map
