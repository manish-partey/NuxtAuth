import { defineComponent, ref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderClass } from 'vue/server-renderer';
import { useRoute, useRouter } from 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "accept-invite",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    useRouter();
    route.query.token;
    const name = ref("");
    const password = ref("");
    const message = ref("");
    const success = ref(false);
    const loading = ref(false);
    const error = ref("");
    const inviteDetails = ref({
      email: "",
      role: "",
      organizationName: "",
      platformName: ""
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "max-w-lg mx-auto p-8 bg-white rounded-lg shadow mt-12" }, _attrs))}><h1 class="text-3xl font-bold mb-4 text-center">Accept Invitation</h1>`);
      if (loading.value) {
        _push(`<div class="text-center text-gray-600">Loading invitation details...</div>`);
      } else {
        _push(`<div>`);
        if (error.value) {
          _push(`<div class="text-red-600 text-center mb-4">${ssrInterpolate(error.value)}</div>`);
        } else {
          _push(`<div><p class="mb-4 text-center"> You&#39;ve been invited as <strong>${ssrInterpolate(inviteDetails.value.role)}</strong>`);
          if (inviteDetails.value.organizationName) {
            _push(`<span> to <strong>${ssrInterpolate(inviteDetails.value.organizationName)}</strong></span>`);
          } else if (inviteDetails.value.platformName) {
            _push(`<span> to <strong>${ssrInterpolate(inviteDetails.value.platformName)}</strong></span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`. </p><form><input${ssrRenderAttr("value", name.value)} type="text" placeholder="Your Name" class="input mb-3 w-full" required><input${ssrRenderAttr("value", password.value)} type="password" placeholder="Password" class="input mb-3 w-full" required>`);
          if (password.value.length > 0 && password.value.length < 8) {
            _push(`<p class="text-sm text-red-500 mb-2"> Password should be at least 8 characters long. </p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<button${ssrIncludeBooleanAttr(loading.value) ? " disabled" : ""} type="submit" class="btn w-full">${ssrInterpolate(loading.value ? "Submitting..." : "Accept Invite")}</button></form>`);
          if (message.value) {
            _push(`<p class="${ssrRenderClass([{ "text-green-600": success.value, "text-red-600": !success.value }, "mt-4 text-center"])}">${ssrInterpolate(message.value)}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        }
        _push(`</div>`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/accept-invite.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=accept-invite-Cdssofwp.mjs.map
