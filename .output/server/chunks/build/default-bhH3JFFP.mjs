import { _ as __nuxt_component_0 } from './nuxt-link-5ia3z20d.mjs';
import { mergeProps, withCtx, createTextVNode, defineComponent, computed, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot, ssrInterpolate } from 'vue/server-renderer';
import { u as useAuthStore } from './server.mjs';
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

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "Navbar",
  __ssrInlineRender: true,
  setup(__props) {
    const authStore = useAuthStore();
    useRouter();
    const dashboardLink = computed(() => {
      var _a;
      const role = (_a = authStore.user) == null ? void 0 : _a.role;
      if (!authStore.loggedIn || !role) return "/login";
      switch (role) {
        case "super_admin":
          return "/superadmin";
        case "platform_admin":
          return "/platform";
        case "organization_admin":
          return "/org";
        case "user":
          return "/dashboard";
        default:
          return "/dashboard";
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<nav${ssrRenderAttrs(mergeProps({
        class: "flex items-center space-x-4",
        "aria-label": "Primary navigation"
      }, _attrs))}>`);
      if (unref(authStore).loggedIn && unref(authStore).user) {
        _push(`<!--[--><span class="text-sm hidden sm:inline">Hi, ${ssrInterpolate(unref(authStore).user.name)}</span>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: dashboardLink.value,
          class: "text-sm font-medium text-gray-700 hover:text-blue-600"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Dashboard `);
            } else {
              return [
                createTextVNode(" Dashboard ")
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(authStore).isSuperAdmin) {
          _push(`<!--[-->`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/superadmin/users",
            class: "text-sm font-medium text-gray-700 hover:text-blue-600"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Users`);
              } else {
                return [
                  createTextVNode("Users")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/superadmin/platforms",
            class: "text-sm font-medium text-gray-700 hover:text-blue-600"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Platforms`);
              } else {
                return [
                  createTextVNode("Platforms")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/superadmin/organizations",
            class: "text-sm font-medium text-gray-700 hover:text-blue-600"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Organizations`);
              } else {
                return [
                  createTextVNode("Organizations")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/superadmin/settings",
            class: "text-sm font-medium text-gray-700 hover:text-blue-600"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Settings`);
              } else {
                return [
                  createTextVNode("Settings")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`<!--]-->`);
        } else if (unref(authStore).isPlatformAdmin) {
          _push(`<!--[-->`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/platform/organizations",
            class: "text-sm font-medium text-gray-700 hover:text-blue-600"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Organizations`);
              } else {
                return [
                  createTextVNode("Organizations")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/platform/users",
            class: "text-sm font-medium text-gray-700 hover:text-blue-600"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Users`);
              } else {
                return [
                  createTextVNode("Users")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/platform/invites",
            class: "text-sm font-medium text-gray-700 hover:text-blue-600"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Invites`);
              } else {
                return [
                  createTextVNode("Invites")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/platform/settings",
            class: "text-sm font-medium text-gray-700 hover:text-blue-600"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Settings`);
              } else {
                return [
                  createTextVNode("Settings")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`<!--]-->`);
        } else if (unref(authStore).isOrgAdmin) {
          _push(`<!--[-->`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/org/users",
            class: "text-sm font-medium text-gray-700 hover:text-blue-600"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Users`);
              } else {
                return [
                  createTextVNode("Users")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/org/invites",
            class: "text-sm font-medium text-gray-700 hover:text-blue-600"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Invites`);
              } else {
                return [
                  createTextVNode("Invites")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/org/settings",
            class: "text-sm font-medium text-gray-700 hover:text-blue-600"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Settings`);
              } else {
                return [
                  createTextVNode("Settings")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`<!--]-->`);
        } else if (unref(authStore).userRole === "user") {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/user/profile",
            class: "text-sm font-medium text-gray-700 hover:text-blue-600"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Profile`);
              } else {
                return [
                  createTextVNode("Profile")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="text-sm font-medium bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded transition"> Sign Out </button><!--]-->`);
      } else {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/login",
          class: "text-sm font-medium text-gray-700 hover:text-blue-600"
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
          class: "text-sm font-medium text-gray-700 hover:text-blue-600"
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
          class: "text-sm font-medium text-gray-700 hover:text-blue-600"
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
      _push(`</nav>`);
    };
  }
});
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
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gray-100 text-gray-800" }, _attrs))}><nav class="bg-white shadow fixed top-0 inset-x-0 z-50"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "text-xl font-semibold text-blue-600 hover:text-blue-800"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`EaseMyCargo`);
          } else {
            return [
              createTextVNode("EaseMyCargo")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_sfc_main$1, null, null, _parent));
      _push(`</div></nav><main class="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">`);
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
//# sourceMappingURL=default-bhH3JFFP.mjs.map
