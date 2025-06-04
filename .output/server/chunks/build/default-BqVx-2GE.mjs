import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot, ssrInterpolate } from 'vue/server-renderer';
import { _ as __nuxt_component_0 } from './nuxt-link-C_CAZIBF.mjs';
import { mergeProps, withCtx, createTextVNode, unref, useSSRContext } from 'vue';
import { u as useAuthStore } from './server.mjs';
import { useRouter } from 'vue-router';
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

const _sfc_main$1 = {
  __name: "Navbar",
  __ssrInlineRender: true,
  setup(__props) {
    const authStore = useAuthStore();
    useRouter();
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<nav${ssrRenderAttrs(mergeProps({ class: "bg-blue-600 p-4 text-white flex justify-between items-center" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "text-xl font-bold"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Nuxt Auth App`);
          } else {
            return [
              createTextVNode("Nuxt Auth App")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div>`);
      if (unref(authStore).loggedIn) {
        _push(`<!--[--><span class="mr-4">Welcome, ${ssrInterpolate((_a = unref(authStore).user) == null ? void 0 : _a.name)}!</span>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/dashboard",
          class: "mr-4 hover:underline"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Dashboard`);
            } else {
              return [
                createTextVNode("Dashboard")
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(authStore).isAdmin()) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/admin",
            class: "mr-4 hover:underline"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Admin`);
              } else {
                return [
                  createTextVNode("Admin")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"> Sign Out </button><!--]-->`);
      } else {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/login",
          class: "mr-4 hover:underline"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Sign In`);
            } else {
              return [
                createTextVNode("Sign In")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/register",
          class: "mr-4 hover:underline"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Sign Up`);
            } else {
              return [
                createTextVNode("Sign Up")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/organization-register",
          class: "hover:underline"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Register Org`);
            } else {
              return [
                createTextVNode("Register Org")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<!--]-->`);
      }
      _push(`</div></nav>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Shared/Navbar.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "default",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_sfc_main$1, null, null, _parent));
      _push(`<main class="container mx-auto p-4">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=default-BqVx-2GE.mjs.map
