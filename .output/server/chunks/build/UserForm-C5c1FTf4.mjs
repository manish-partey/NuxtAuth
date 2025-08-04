import { defineComponent, ref, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { u as useAuthStore } from './server.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "UserForm",
  __ssrInlineRender: true,
  props: {
    availableRoles: {},
    organizations: {},
    platforms: {}
  },
  emits: ["user-created"],
  setup(__props, { emit: __emit }) {
    const form = ref({
      name: "",
      email: "",
      role: "",
      organizationId: "",
      platformId: "",
      password: ""
    });
    const loading = ref(false);
    const auth = useAuthStore();
    const isSuperAdmin = computed(() => {
      var _a;
      return ((_a = auth.user) == null ? void 0 : _a.role) === "super_admin";
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<form${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><div><label for="name" class="block font-medium text-gray-700">Name</label><input id="name"${ssrRenderAttr("value", form.value.name)} type="text" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></div><div><label for="email" class="block font-medium text-gray-700">Email</label><input id="email"${ssrRenderAttr("value", form.value.email)} type="email" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></div><div><label for="role" class="block font-medium text-gray-700">Role</label><select id="role" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"><option disabled value=""${ssrIncludeBooleanAttr(Array.isArray(form.value.role) ? ssrLooseContain(form.value.role, "") : ssrLooseEqual(form.value.role, "")) ? " selected" : ""}>Select Role</option><!--[-->`);
      ssrRenderList(_ctx.availableRoles, (role) => {
        _push(`<option${ssrRenderAttr("value", role)}${ssrIncludeBooleanAttr(Array.isArray(form.value.role) ? ssrLooseContain(form.value.role, role) : ssrLooseEqual(form.value.role, role)) ? " selected" : ""}>${ssrInterpolate(role)}</option>`);
      });
      _push(`<!--]--></select></div>`);
      if (isSuperAdmin.value) {
        _push(`<div><label for="organization" class="block font-medium text-gray-700"> Organization </label><select id="organization"${ssrIncludeBooleanAttr(_ctx.organizations.length === 0) ? " disabled" : ""} class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"><option value=""${ssrIncludeBooleanAttr(Array.isArray(form.value.organizationId) ? ssrLooseContain(form.value.organizationId, "") : ssrLooseEqual(form.value.organizationId, "")) ? " selected" : ""}>-- Select Organization --</option><!--[-->`);
        ssrRenderList(_ctx.organizations, (org) => {
          _push(`<option${ssrRenderAttr("value", org.id)}${ssrIncludeBooleanAttr(Array.isArray(form.value.organizationId) ? ssrLooseContain(form.value.organizationId, org.id) : ssrLooseEqual(form.value.organizationId, org.id)) ? " selected" : ""}>${ssrInterpolate(org.name)}</option>`);
        });
        _push(`<!--]--></select></div>`);
      } else {
        _push(`<!---->`);
      }
      if (isSuperAdmin.value) {
        _push(`<div><label for="platform" class="block font-medium text-gray-700">Platform</label><select id="platform"${ssrIncludeBooleanAttr(_ctx.platforms.length === 0) ? " disabled" : ""} class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"><option value=""${ssrIncludeBooleanAttr(Array.isArray(form.value.platformId) ? ssrLooseContain(form.value.platformId, "") : ssrLooseEqual(form.value.platformId, "")) ? " selected" : ""}>-- Select Platform --</option><!--[-->`);
        ssrRenderList(_ctx.platforms, (platform) => {
          _push(`<option${ssrRenderAttr("value", platform.id)}${ssrIncludeBooleanAttr(Array.isArray(form.value.platformId) ? ssrLooseContain(form.value.platformId, platform.id) : ssrLooseEqual(form.value.platformId, platform.id)) ? " selected" : ""}>${ssrInterpolate(platform.name)}</option>`);
        });
        _push(`<!--]--></select></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div><label for="password" class="block font-medium text-gray-700">Password</label><input id="password"${ssrRenderAttr("value", form.value.password)} type="password" required minlength="6" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></div><button type="submit"${ssrIncludeBooleanAttr(loading.value) ? " disabled" : ""} class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">${ssrInterpolate(loading.value ? "Creating..." : "Create User")}</button></form>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Admin/UserForm.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=UserForm-C5c1FTf4.mjs.map
