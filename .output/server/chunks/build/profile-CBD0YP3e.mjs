import { defineComponent, ref, withAsyncContext, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { u as useAuthStore, a as useRequestHeaders } from './server.mjs';
import { u as useFetch } from './fetch-DfM37FnY.mjs';
import { useRouter } from 'vue-router';
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
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'pinia';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "profile",
  __ssrInlineRender: true,
  async setup(__props) {
    var _a;
    let __temp, __restore;
    useAuthStore();
    useRouter();
    const name = ref("");
    const email = ref("");
    const loading = ref(true);
    const saving = ref(false);
    const message = ref("");
    const error = ref("");
    try {
      const { data, error: fetchError } = ([__temp, __restore] = withAsyncContext(() => useFetch("/api/user/me", {
        credentials: "include",
        headers: useRequestHeaders(["cookie"])
      }, "$y78J4zF_Ll")), __temp = await __temp, __restore(), __temp);
      if (fetchError.value) {
        error.value = "Failed to load user profile";
      } else if ((_a = data.value) == null ? void 0 : _a.user) {
        name.value = data.value.user.username || "";
        email.value = data.value.user.email || "";
      }
    } catch (err) {
      error.value = "Something went wrong loading profile.";
    } finally {
      loading.value = false;
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-3xl mx-auto py-10 px-4" }, _attrs))}><h1 class="text-3xl font-semibold text-gray-800 mb-6">User Profile</h1><p class="mb-8 text-gray-600">Manage your personal profile information below.</p>`);
      if (loading.value) {
        _push(`<div class="text-gray-500">Loading...</div>`);
      } else {
        _push(`<div><form class="space-y-6"><div><label for="name" class="block text-sm font-medium text-gray-700">Full Name</label><input id="name"${ssrRenderAttr("value", name.value)} type="text" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring focus:ring-blue-200"></div><div><label for="email" class="block text-sm font-medium text-gray-700">Email Address</label><input id="email"${ssrRenderAttr("value", email.value)} type="email" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring focus:ring-blue-200"></div><div class="flex items-center space-x-4"><button type="submit"${ssrIncludeBooleanAttr(saving.value) ? " disabled" : ""} class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md shadow transition">${ssrInterpolate(saving.value ? "Saving..." : "Update Profile")}</button>`);
        if (message.value) {
          _push(`<span class="text-green-600 text-sm">${ssrInterpolate(message.value)}</span>`);
        } else {
          _push(`<!---->`);
        }
        if (error.value) {
          _push(`<span class="text-red-600 text-sm">${ssrInterpolate(error.value)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></form></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/user/profile.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=profile-CBD0YP3e.mjs.map
