import { _ as __nuxt_component_0 } from './nuxt-link-5ia3z20d.mjs';
import { defineComponent, ref, mergeProps, unref, withCtx, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { u as useAuthStore } from './server.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const authStore = useAuthStore();
    const users = ref([]);
    const adminError = ref("");
    const pending = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-6xl mx-auto py-10 px-4" }, _attrs))}><div class="mb-8"><h1 class="text-4xl font-semibold text-gray-800 mb-2">Admin Dashboard</h1>`);
      if (unref(authStore).user) {
        _push(`<p class="text-gray-700"> Welcome, <span class="font-medium">${ssrInterpolate(unref(authStore).user.name)}</span> (${ssrInterpolate(unref(authStore).user.role)}) </p>`);
      } else {
        _push(`<p class="text-gray-500 italic">Loading admin data...</p>`);
      }
      _push(`</div><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin/users",
        class: "bg-white border hover:shadow-md transition rounded-xl p-5"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h2 class="text-xl font-semibold mb-2"${_scopeId}>Users</h2><p class="text-sm text-gray-600"${_scopeId}>View and manage all users across platforms.</p>`);
          } else {
            return [
              createVNode("h2", { class: "text-xl font-semibold mb-2" }, "Users"),
              createVNode("p", { class: "text-sm text-gray-600" }, "View and manage all users across platforms.")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin/platforms",
        class: "bg-white border hover:shadow-md transition rounded-xl p-5"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h2 class="text-xl font-semibold mb-2"${_scopeId}>Platforms</h2><p class="text-sm text-gray-600"${_scopeId}>Review all registered platforms and their admins.</p>`);
          } else {
            return [
              createVNode("h2", { class: "text-xl font-semibold mb-2" }, "Platforms"),
              createVNode("p", { class: "text-sm text-gray-600" }, "Review all registered platforms and their admins.")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin/invites",
        class: "bg-white border hover:shadow-md transition rounded-xl p-5"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h2 class="text-xl font-semibold mb-2"${_scopeId}>Invites</h2><p class="text-sm text-gray-600"${_scopeId}>Track invitation status for users.</p>`);
          } else {
            return [
              createVNode("h2", { class: "text-xl font-semibold mb-2" }, "Invites"),
              createVNode("p", { class: "text-sm text-gray-600" }, "Track invitation status for users.")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="bg-white rounded-xl shadow-md p-6"><div class="flex items-center justify-between mb-4"><h2 class="text-2xl font-semibold text-gray-800">Manage Users (Quick View)</h2><button class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition"> Fetch All Users </button></div><p class="text-gray-600 mb-4"> Only visible to roles: <code class="bg-gray-100 px-1 rounded">super_admin</code> or <code class="bg-gray-100 px-1 rounded">platform_admin</code>. </p>`);
      if (users.value.length) {
        _push(`<div class="mt-4"><ul class="divide-y divide-gray-200"><!--[-->`);
        ssrRenderList(users.value, (user) => {
          _push(`<li class="py-2 flex justify-between items-center"><div><p class="font-semibold text-gray-800">${ssrInterpolate(user.name)}</p><p class="text-sm text-gray-600">${ssrInterpolate(user.email)}</p></div><span class="${ssrRenderClass([{
            "bg-blue-100 text-blue-800": user.role === "admin",
            "bg-gray-100 text-gray-700": user.role === "user",
            "bg-green-100 text-green-700": user.role === "super_admin" || user.role === "platform_admin"
          }, "inline-block px-3 py-1 text-xs font-medium rounded-full"])}">${ssrInterpolate(user.role)}</span></li>`);
        });
        _push(`<!--]--></ul></div>`);
      } else if (!pending.value) {
        _push(`<p class="text-gray-500 mt-4">No users found. Click &quot;Fetch All Users&quot; to load data.</p>`);
      } else {
        _push(`<!---->`);
      }
      if (adminError.value) {
        _push(`<p class="text-red-600 mt-4">${ssrInterpolate(adminError.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-DIAN0axc.mjs.map
