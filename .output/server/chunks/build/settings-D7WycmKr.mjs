import { defineComponent, withAsyncContext, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { u as useFetch } from './fetch-DfM37FnY.mjs';
import '../nitro/nitro.mjs';
import 'mongoose';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'applicationinsights';
import 'node:url';
import 'jsonwebtoken';
import 'bcryptjs';
import '@vue/shared';
import './server.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'pinia';
import 'vue-router';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "settings",
  __ssrInlineRender: true,
  async setup(__props) {
    var _a;
    let __temp, __restore;
    const { data, error, pending } = ([__temp, __restore] = withAsyncContext(() => useFetch("/api/settings", "$bjkPxXzqHI")), __temp = await __temp, __restore(), __temp);
    const settings = ref(((_a = data.value) == null ? void 0 : _a.settings) || {});
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-3xl mx-auto py-10 px-6" }, _attrs))}><h1 class="text-3xl font-bold mb-6 text-gray-800">Platform Settings</h1>`);
      if (unref(pending)) {
        _push(`<div>Loading settings...</div>`);
      } else if (unref(error)) {
        _push(`<div class="text-red-600">Failed to load settings.</div>`);
      } else {
        _push(`<div><form class="space-y-4"><div><label class="block font-medium text-gray-700">Max Platforms</label><input type="number"${ssrRenderAttr("value", unref(settings).maxPlatforms)} class="mt-1 block w-full border rounded px-3 py-2"></div><div><label class="block font-medium text-gray-700">Max Orgs per Platform</label><input type="number"${ssrRenderAttr("value", unref(settings).maxOrganizationsPerPlatform)} class="mt-1 block w-full border rounded px-3 py-2"></div><div><label class="block font-medium text-gray-700">Enable Self Registration</label><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(settings).enableSelfRegistration) ? ssrLooseContain(unref(settings).enableSelfRegistration, null) : unref(settings).enableSelfRegistration) ? " checked" : ""} class="mt-1"></div><div><label class="block font-medium text-gray-700">Default User Role</label><select class="mt-1 block w-full border rounded px-3 py-2"><option value="user"${ssrIncludeBooleanAttr(Array.isArray(unref(settings).defaultUserRole) ? ssrLooseContain(unref(settings).defaultUserRole, "user") : ssrLooseEqual(unref(settings).defaultUserRole, "user")) ? " selected" : ""}>User</option><option value="organization_admin"${ssrIncludeBooleanAttr(Array.isArray(unref(settings).defaultUserRole) ? ssrLooseContain(unref(settings).defaultUserRole, "organization_admin") : ssrLooseEqual(unref(settings).defaultUserRole, "organization_admin")) ? " selected" : ""}>Organization Admin</option></select></div><div><label class="block font-medium text-gray-700">Maintenance Mode</label><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(settings).maintenanceMode) ? ssrLooseContain(unref(settings).maintenanceMode, null) : unref(settings).maintenanceMode) ? " checked" : ""} class="mt-1"></div><button type="submit" class="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"> Save Settings </button></form></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/superadmin/settings.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=settings-D7WycmKr.mjs.map
