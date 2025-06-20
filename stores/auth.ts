// stores/auth.ts
import { defineStore } from 'pinia';

type UserRole = 'user' | 'admin' | 'super-admin' | 'platform-admin' | 'organization-admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  platformId?: string;
}

interface AuthState {
  user: User | null;
  loggedIn: boolean;
  loading: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    loggedIn: false,
    loading: true,
  }),

  getters: {
    isUser: (state): boolean => state.user?.role === 'user',

    isSuperAdmin: (state): boolean => state.user?.role === 'super-admin',

    isOrgAdmin: (state): boolean =>
      state.user?.role === 'organization-admin' ||
      (state.user?.role === 'admin' && !!state.user.organizationId && !state.user.platformId),

    isPlatformAdmin: (state): boolean =>
      state.user?.role === 'platform-admin' ||
      (state.user?.role === 'admin' && !!state.user.platformId && !state.user.organizationId),

    isAdmin: (state): boolean =>
      ['admin', 'organization-admin', 'platform-admin', 'super-admin'].includes(state.user?.role ?? ''),

    userRole: (state): UserRole | null => state.user?.role ?? null,
    userOrgId: (state): string | null => state.user?.organizationId ?? null,
    userPlatformId: (state): string | null => state.user?.platformId ?? null,
  },

  actions: {
    async fetchUser() {
      this.loading = true;
      try {
        const data = await $fetch('/api/auth/user', {
          credentials: 'include',
        });

        if (data && data.user) {
          this.user = data.user as User;
          this.loggedIn = true;
        } else {
          this.user = null;
          this.loggedIn = false;
        }
      } catch (error: any) {
        if (error?.statusCode === 401) {
          this.user = null;
          this.loggedIn = false;
        } else {
          console.error('Error fetching user:', error);
          this.user = null;
          this.loggedIn = false;
        }
      } finally {
        this.loading = false;
      }
    },

    async login(email: string, password: string): Promise<boolean> {
      this.loading = true;
      try {
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

    canAccessOrg(orgId: string): boolean {
      if (this.isAdmin || this.isSuperAdmin) return true;
      return this.user?.organizationId === orgId;
    },
  },
});