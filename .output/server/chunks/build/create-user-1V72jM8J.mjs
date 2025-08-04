import { defineComponent, ref, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrInterpolate } from 'vue/server-renderer';
import { u as useAuthStore } from './server.mjs';
import { _ as _sfc_main$1 } from './UserForm-C5c1FTf4.mjs';
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
  __name: "create-user",
  __ssrInlineRender: true,
  setup(__props) {
    const message = ref("");
    const isSuccess = ref(false);
    const authStore = useAuthStore();
    const currentOrg = authStore.organization;
    const availableRoles = ref(["user"]);
    const messageClass = computed(
      () => isSuccess.value ? "text-green-700 bg-green-100 border-green-300" : "text-red-700 bg-red-100 border-red-300"
    );
    const handleCreated = ({
      success,
      message: msg
    }) => {
      message.value = msg;
      isSuccess.value = success;
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-md" }, _attrs))}><h1 class="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight"> Invite User to Organization </h1>`);
      _push(ssrRenderComponent(_sfc_main$1, {
        availableRoles: availableRoles.value,
        organizations: [unref(currentOrg)],
        platforms: [],
        onUserCreated: handleCreated
      }, null, _parent));
      if (message.value) {
        _push(`<p class="${ssrRenderClass([messageClass.value, "mt-6 max-w-md rounded-md px-4 py-3 font-medium border"])}" role="alert">${ssrInterpolate(message.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/org/create-user.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=create-user-1V72jM8J.mjs.map
