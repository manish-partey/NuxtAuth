import { ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { u as useAuthStore } from './server.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'pinia';
import 'vue-router';

const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const authStore = useAuthStore();
    const users = ref([]);
    const adminError = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-8" }, _attrs))}><h1 class="text-3xl font-bold mb-6">Admin Dashboard</h1>`);
      if (unref(authStore).user) {
        _push(`<p> Welcome, ${ssrInterpolate(unref(authStore).user.name)} (Admin)! </p>`);
      } else {
        _push(`<p>Loading admin data...</p>`);
      }
      _push(`<h2 class="text-xl font-bold mt-8 mb-4">Manage Users (Example)</h2><div class="bg-white p-6 rounded shadow-md"><p>This is highly restricted content only for users with the &#39;admin&#39; role.</p><button class="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Fetch All Users</button>`);
      if (users.value.length) {
        _push(`<div><h3 class="text-lg font-semibold mt-4">All Users:</h3><ul><!--[-->`);
        ssrRenderList(users.value, (user) => {
          _push(`<li>${ssrInterpolate(user.name)} (${ssrInterpolate(user.email)}) - ${ssrInterpolate(user.role)}</li>`);
        });
        _push(`<!--]--></ul></div>`);
      } else {
        _push(`<!---->`);
      }
      if (adminError.value) {
        _push(`<p class="text-red-500 mt-4">${ssrInterpolate(adminError.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-32HOpUtz.mjs.map
