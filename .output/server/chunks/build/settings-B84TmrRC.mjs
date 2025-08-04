import { defineComponent, reactive, ref, withAsyncContext, watchEffect, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderClass } from 'vue/server-renderer';
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
    let __temp, __restore;
    const form = reactive({
      name: "",
      slug: "",
      description: "",
      status: "active"
    });
    const message = ref("");
    const success = ref(false);
    const { data, error, pending } = ([__temp, __restore] = withAsyncContext(() => useFetch("/api/platform/settings/get", {
      credentials: "include"
    }, "$2yoiRuNAzc")), __temp = await __temp, __restore(), __temp);
    watchEffect(() => {
      var _a;
      if ((_a = data.value) == null ? void 0 : _a.settings) {
        const s = data.value.settings;
        form.name = s.name || "";
        form.slug = s.slug || "";
        form.description = s.description || "";
        form.status = s.status || "active";
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-3xl mx-auto py-10 px-4" }, _attrs))}><h1 class="text-3xl font-bold text-gray-800 mb-6">Platform Settings</h1>`);
      if (unref(pending)) {
        _push(`<div class="text-gray-600">Loading settings...</div>`);
      } else if (unref(error)) {
        _push(`<div class="text-red-600 font-semibold">Failed to load settings.</div>`);
      } else {
        _push(`<form class="space-y-6 bg-white border border-gray-200 rounded-xl shadow p-6"><div><label class="block text-sm font-medium text-gray-700">Name</label><input${ssrRenderAttr("value", form.name)} type="text" class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"></div><div><label class="block text-sm font-medium text-gray-700">Slug</label><input${ssrRenderAttr("value", form.slug)} type="text" class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"></div><div><label class="block text-sm font-medium text-gray-700">Description</label><textarea rows="4" class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">${ssrInterpolate(form.description)}</textarea></div><div><label class="block text-sm font-medium text-gray-700">Status</label><select class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="active"${ssrIncludeBooleanAttr(Array.isArray(form.status) ? ssrLooseContain(form.status, "active") : ssrLooseEqual(form.status, "active")) ? " selected" : ""}>Active</option><option value="inactive"${ssrIncludeBooleanAttr(Array.isArray(form.status) ? ssrLooseContain(form.status, "inactive") : ssrLooseEqual(form.status, "inactive")) ? " selected" : ""}>Inactive</option></select></div><div class="flex items-center gap-4"><button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"> Save Settings </button>`);
        if (message.value) {
          _push(`<span class="${ssrRenderClass(success.value ? "text-green-600" : "text-red-600")}">${ssrInterpolate(message.value)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></form>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/platform/settings.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=settings-B84TmrRC.mjs.map
