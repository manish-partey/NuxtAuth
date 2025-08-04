import { _ as __nuxt_component_0 } from './nuxt-link-5ia3z20d.mjs';
import { defineComponent, mergeProps, withCtx, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
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
import './server.mjs';
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
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-6xl mx-auto py-10 px-4" }, _attrs))} data-v-f3cb24ef><h1 class="text-3xl font-bold text-gray-800 mb-6" data-v-f3cb24ef>Platform Admin Dashboard</h1><div class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" data-v-f3cb24ef>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/platform/organizations",
        class: "dashboard-card"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h2 class="text-xl font-semibold" data-v-f3cb24ef${_scopeId}>Organizations</h2><p class="text-sm text-gray-600" data-v-f3cb24ef${_scopeId}>View and manage all organizations under your platform.</p>`);
          } else {
            return [
              createVNode("h2", { class: "text-xl font-semibold" }, "Organizations"),
              createVNode("p", { class: "text-sm text-gray-600" }, "View and manage all organizations under your platform.")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/platform/users",
        class: "dashboard-card"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h2 class="text-xl font-semibold" data-v-f3cb24ef${_scopeId}>Users</h2><p class="text-sm text-gray-600" data-v-f3cb24ef${_scopeId}>View all users and organization admins in your platform.</p>`);
          } else {
            return [
              createVNode("h2", { class: "text-xl font-semibold" }, "Users"),
              createVNode("p", { class: "text-sm text-gray-600" }, "View all users and organization admins in your platform.")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/platform/settings",
        class: "dashboard-card"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h2 class="text-xl font-semibold" data-v-f3cb24ef${_scopeId}>Settings</h2><p class="text-sm text-gray-600" data-v-f3cb24ef${_scopeId}>Configure platform-specific settings and preferences.</p>`);
          } else {
            return [
              createVNode("h2", { class: "text-xl font-semibold" }, "Settings"),
              createVNode("p", { class: "text-sm text-gray-600" }, "Configure platform-specific settings and preferences.")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/platform/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-f3cb24ef"]]);

export { index as default };
//# sourceMappingURL=index-DM_UA9Ld.mjs.map
