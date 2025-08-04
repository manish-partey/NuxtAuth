import { defineComponent, ref, withAsyncContext, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderClass, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
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
  __name: "invites",
  __ssrInlineRender: true,
  async setup(__props) {
    var _a;
    let __temp, __restore;
    const invites = ref([]);
    const error = ref(null);
    const loading = ref(true);
    const resending = ref(null);
    const revoking = ref(null);
    const message = ref("");
    const messageType = ref("success");
    const inviteEmail = ref("");
    const inviteRole = ref("user");
    try {
      const { data, error: fetchError } = ([__temp, __restore] = withAsyncContext(() => useFetch("/api/org/invites", {
        headers: useRequestHeaders(["cookie"])
      }, "$UD_M3tc-dV")), __temp = await __temp, __restore(), __temp);
      if (fetchError.value) error.value = fetchError.value;
      else if ((_a = data.value) == null ? void 0 : _a.invites) invites.value = data.value.invites;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
    function formatDate(date) {
      return new Date(date).toLocaleString();
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-5xl mx-auto py-10 px-4" }, _attrs))}><h1 class="text-3xl font-semibold text-gray-800 mb-6">Pending Invitations</h1><form class="mb-8 p-6 bg-white rounded-xl shadow space-y-4"><h2 class="text-xl font-bold text-gray-700">Invite New User</h2><div><label for="invite-email" class="block text-sm font-medium text-gray-700">Email</label><input${ssrRenderAttr("value", inviteEmail.value)} id="invite-email" type="email" class="w-full border px-3 py-2 rounded" required></div><div><label for="invite-role" class="block text-sm font-medium text-gray-700">Role</label><select id="invite-role" class="w-full border px-3 py-2 rounded" required><option value="user"${ssrIncludeBooleanAttr(Array.isArray(inviteRole.value) ? ssrLooseContain(inviteRole.value, "user") : ssrLooseEqual(inviteRole.value, "user")) ? " selected" : ""}>User</option></select></div><button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Send Invite</button>`);
      if (message.value) {
        _push(`<p class="${ssrRenderClass([messageType.value === "success" ? "text-green-600" : "text-red-600", "text-center font-medium"])}" role="alert">${ssrInterpolate(message.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</form>`);
      if (loading.value) {
        _push(`<div class="text-gray-600">Loading invites...</div>`);
      } else if (error.value) {
        _push(`<div class="text-red-600 font-semibold"> Failed to load invites. Please try again later. </div>`);
      } else if (invites.value.length) {
        _push(`<div class="space-y-4"><!--[-->`);
        ssrRenderList(invites.value, (invite) => {
          var _a2;
          _push(`<div class="p-4 bg-white rounded-xl shadow space-y-1"><div class="flex justify-between items-center"><p class="text-gray-800 font-medium">${ssrInterpolate(invite.email)}</p><div class="space-x-2"><button class="text-blue-600 text-sm hover:underline"${ssrIncludeBooleanAttr(resending.value === invite._id) ? " disabled" : ""}>${ssrInterpolate(resending.value === invite._id ? "Resending..." : "Resend")}</button><button class="text-red-600 text-sm hover:underline"${ssrIncludeBooleanAttr(revoking.value === invite._id) ? " disabled" : ""}>${ssrInterpolate(revoking.value === invite._id ? "Revoking..." : "Revoke")}</button></div></div><p class="text-sm text-gray-600">Role: ${ssrInterpolate(invite.role)}</p><p class="text-sm text-gray-500">Inviter: ${ssrInterpolate(invite.inviterName || "Unknown")}</p><p class="text-sm text-gray-500">Status: ${ssrInterpolate(invite.status)}</p><p class="text-sm text-gray-400">Created At: ${ssrInterpolate(formatDate(invite.createdAt))}</p><p class="text-sm text-gray-600">Org: ${ssrInterpolate(((_a2 = invite.organization) == null ? void 0 : _a2.name) || "-")}</p></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<div class="text-gray-600 italic">No pending invitations.</div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/org/invites.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=invites-CXWpRPfP.mjs.map
