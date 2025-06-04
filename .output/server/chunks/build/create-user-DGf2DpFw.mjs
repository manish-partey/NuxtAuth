import { defineComponent, ref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';

const _sfc_main$1 = {
  __name: "UserForm",
  __ssrInlineRender: true,
  emits: ["user-created"],
  setup(__props, { emit: __emit }) {
    const username = ref("");
    const name = ref("");
    const email = ref("");
    const password = ref("");
    const role = ref("user");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<form${ssrRenderAttrs(mergeProps({ class: "bg-white shadow p-6 rounded w-full max-w-lg" }, _attrs))} data-v-0a1283c8><input${ssrRenderAttr("value", username.value)} placeholder="Username" class="input" required data-v-0a1283c8><input${ssrRenderAttr("value", name.value)} placeholder="Name" class="input" required data-v-0a1283c8><input${ssrRenderAttr("value", email.value)} type="email" placeholder="Email" class="input" required data-v-0a1283c8><input${ssrRenderAttr("value", password.value)} type="password" placeholder="Password" class="input" required data-v-0a1283c8><select class="input" data-v-0a1283c8><option value="user" data-v-0a1283c8${ssrIncludeBooleanAttr(Array.isArray(role.value) ? ssrLooseContain(role.value, "user") : ssrLooseEqual(role.value, "user")) ? " selected" : ""}>User</option><option value="admin" data-v-0a1283c8${ssrIncludeBooleanAttr(Array.isArray(role.value) ? ssrLooseContain(role.value, "admin") : ssrLooseEqual(role.value, "admin")) ? " selected" : ""}>Admin</option></select><button type="submit" class="btn-primary w-full mt-4" data-v-0a1283c8>Create User</button></form>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Admin/UserForm.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const UserForm = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-0a1283c8"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "create-user",
  __ssrInlineRender: true,
  setup(__props) {
    const message = ref("");
    const handleCreated = (msg) => {
      message.value = msg;
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-8" }, _attrs))}><h1 class="text-3xl font-bold mb-6">Create User</h1>`);
      _push(ssrRenderComponent(UserForm, { onUserCreated: handleCreated }, null, _parent));
      if (message.value) {
        _push(`<p class="mt-4 text-green-600">${ssrInterpolate(message.value)}</p>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/create-user.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=create-user-DGf2DpFw.mjs.map
