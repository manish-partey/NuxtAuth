import { _ as __nuxt_component_0 } from './server.mjs';
import { defineComponent, ref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderComponent } from 'vue/server-renderer';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const platforms = ref([]);
    const loading = ref(false);
    const error = ref("");
    useRouter();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtPage = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-6" }, _attrs))}><h1 class="text-2xl font-bold mb-4">Manage Platforms</h1><p class="mb-6 text-gray-600"> List of all industry-specific tenant platforms created by super admins. </p><button class="mb-4 bg-blue-600 text-white px-4 py-2 rounded"> + Create New Platform </button>`);
      if (loading.value) {
        _push(`<div class="text-gray-500">Loading platforms...</div>`);
      } else {
        _push(`<!---->`);
      }
      if (error.value) {
        _push(`<div class="text-red-600">${ssrInterpolate(error.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (!loading.value && platforms.value.length) {
        _push(`<table class="w-full border-collapse border border-gray-300"><thead><tr class="bg-gray-100"><th class="border border-gray-300 p-2 text-left">Name</th><th class="border border-gray-300 p-2 text-left">Type</th><th class="border border-gray-300 p-2 text-left">Status</th><th class="border border-gray-300 p-2 text-left">Created At</th><th class="border border-gray-300 p-2">Actions</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(platforms.value, (platform) => {
          _push(`<tr class="hover:bg-gray-50 cursor-pointer"><td class="border border-gray-300 p-2">${ssrInterpolate(platform.name)}</td><td class="border border-gray-300 p-2 capitalize">${ssrInterpolate(platform.type)}</td><td class="border border-gray-300 p-2 capitalize">${ssrInterpolate(platform.status)}</td><td class="border border-gray-300 p-2">${ssrInterpolate(new Date(platform.createdAt).toLocaleDateString())}</td><td class="border border-gray-300 p-2 text-center"><button class="text-blue-600 hover:underline"> Edit </button></td></tr>`);
        });
        _push(`<!--]--></tbody></table>`);
      } else {
        _push(`<!---->`);
      }
      if (!loading.value && !platforms.value.length) {
        _push(`<div class="text-gray-500">No platforms found.</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_NuxtPage, null, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/superadmin/platforms/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-CpWC3GHs.mjs.map
