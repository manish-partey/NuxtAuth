import { defineComponent, ref, withAsyncContext, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { a as useRequestHeaders } from './server.mjs';
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
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'pinia';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "users",
  __ssrInlineRender: true,
  async setup(__props) {
    var _a;
    let __temp, __restore;
    const users = ref([]);
    const error = ref(null);
    const loading = ref(true);
    try {
      const { data, error: fetchError } = ([__temp, __restore] = withAsyncContext(() => useFetch("/api/org/users", {
        headers: useRequestHeaders(["cookie"])
      }, "$VQYzwg7u3l")), __temp = await __temp, __restore(), __temp);
      if (fetchError.value) {
        error.value = "Failed to load users";
      } else if (((_a = data.value) == null ? void 0 : _a.success) && data.value.users) {
        users.value = data.value.users;
      }
    } catch (err) {
      error.value = "An unexpected error occurred";
    } finally {
      loading.value = false;
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-5xl mx-auto py-10 px-4" }, _attrs))}><h1 class="text-3xl font-semibold text-gray-800 mb-6">Organization Users</h1>`);
      if (loading.value) {
        _push(`<div class="text-gray-600">Loading users...</div>`);
      } else if (error.value) {
        _push(`<div class="text-red-600 font-semibold">${ssrInterpolate(error.value)}</div>`);
      } else if (users.value.length === 0) {
        _push(`<div class="text-gray-600 italic">No users found.</div>`);
      } else {
        _push(`<div class="space-y-4"><!--[-->`);
        ssrRenderList(users.value, (user) => {
          _push(`<div class="p-4 bg-white rounded-xl shadow flex flex-col md:flex-row justify-between items-start md:items-center"><div><p class="text-lg font-medium text-gray-900">${ssrInterpolate(user.name || "No Name")}</p><p class="text-sm text-gray-600">${ssrInterpolate(user.email)}</p><p class="text-sm text-gray-500">Role: ${ssrInterpolate(user.role)}</p></div><p class="text-sm text-gray-400 mt-2 md:mt-0">Joined: ${ssrInterpolate(new Date(user.createdAt).toLocaleDateString())}</p></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/org/users.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=users-D6Cm1gf7.mjs.map
