import { defineComponent, ref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "invites",
  __ssrInlineRender: true,
  setup(__props) {
    const invites = ref([]);
    const loading = ref(false);
    const error = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-6" }, _attrs))}><h1 class="text-2xl font-bold mb-4">Manage Invitations</h1><p class="mb-6 text-gray-600">View all pending or active invitations across platforms and organizations.</p>`);
      if (loading.value) {
        _push(`<div class="text-gray-500">Loading invites...</div>`);
      } else {
        _push(`<!---->`);
      }
      if (error.value) {
        _push(`<div class="text-red-600">${ssrInterpolate(error.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (!loading.value && invites.value.length) {
        _push(`<table class="w-full border-collapse border border-gray-300"><thead><tr class="bg-gray-100"><th class="border border-gray-300 p-2 text-left">Email</th><th class="border border-gray-300 p-2 text-left">Role</th><th class="border border-gray-300 p-2 text-left">Organization</th><th class="border border-gray-300 p-2 text-left">Platform</th><th class="border border-gray-300 p-2 text-left">Status</th><th class="border border-gray-300 p-2 text-left">Created At</th><th class="border border-gray-300 p-2 text-center">Actions</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(invites.value, (invite) => {
          _push(`<tr><td class="border border-gray-300 p-2">${ssrInterpolate(invite.email)}</td><td class="border border-gray-300 p-2 capitalize">${ssrInterpolate(invite.role.replace(/_/g, " "))}</td><td class="border border-gray-300 p-2">${ssrInterpolate(invite.orgName)}</td><td class="border border-gray-300 p-2">${ssrInterpolate(invite.platformName)}</td><td class="border border-gray-300 p-2 capitalize">${ssrInterpolate(invite.status)}</td><td class="border border-gray-300 p-2">${ssrInterpolate(new Date(invite.createdAt).toLocaleDateString())}</td><td class="border border-gray-300 p-2 text-center space-x-2"><button class="text-blue-600 hover:underline">Resend</button><button class="text-red-600 hover:underline">Revoke</button></td></tr>`);
        });
        _push(`<!--]--></tbody></table>`);
      } else {
        _push(`<!---->`);
      }
      if (!loading.value && !invites.value.length) {
        _push(`<div class="text-gray-500">No active invites.</div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/superadmin/invites.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=invites-BKuXD8Md.mjs.map
