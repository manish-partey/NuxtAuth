// stores/auth.ts
import { defineStore } from 'pinia';
import { useCookie } from '#app';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'super-admin' | 'platform-admin' | 'organization-admin';
  organizationId?: string;
  platformId?: string;
}

interface AuthState {
  user: User | null;
  loggedIn: boolean;
  loading: boolean;
  // token is removed because auth is via cookie
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    loggedIn: false,
    loading: true,
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    isUser: (state) => state.user?.role === 'user',
    isSuperAdmin: (state) => state.user?.role === 'super-admin',

    isOrgAdmin: (state) =>
      state.user?.role === 'organization-admin' ||
      (state.user?.role === 'admin' && !!state.user?.organizationId && !state.user?.platformId),

    isPlatformAdmin: (state) =>
      state.user?.role === 'platform-admin' ||
      (state.user?.role === 'admin' && !!state.user?.platformId && !state.user?.organizationId),

    userOrgId: (state) => state.user?.organizationId ?? null,
    userPlatformId: (state) => state.user?.platformId ?? null,
    userRole: (state) => state.user?.role ?? null,
  },

  actions: {
    async fetchUser() {
      this.loading = true;
      try {
        // fetch /api/user/me with credentials: 'include' to send cookies
        const data = await $fetch('/api/user/me', {
          credentials: 'include',
        });

        if (data && data.user) {
          this.user = data.user as User;
          this.loggedIn = true;
        } else {
          this.user = null;
          this.loggedIn = false;
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        this.user = null;
        this.loggedIn = false;
      } finally {
        this.loading = false;
      }
    },

    async login(email: string, password: string) {
      this.loading = true;
      try {
        // login sets HttpOnly cookie; include credentials for cookie management
        const response = await $fetch('/api/auth/login', {
          method: 'POST',
          body: { email, password },
          credentials: 'include',
        });

        if (response.user) {
          this.user = response.user as User;
          this.loggedIn = true;
          return true;
        }

        return false;
      } catch (error: any) {
        console.error('Login error:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      this.loading = true;
      try {
        await $fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });

        this.user = null;
        this.loggedIn = false;
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        this.loading = false;
      }
    },

    canAccessOrg(orgId: string) {
      if (this.isAdmin || this.isSuperAdmin) return true;
      return this.user?.organizationId === orgId;
    },
  },
});
