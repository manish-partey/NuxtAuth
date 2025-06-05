// stores/auth.ts
import { defineStore } from 'pinia';
import { useCookie } from '#app';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthState {
  user: User | null;
  loggedIn: boolean;
  loading: boolean;
  token: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    loggedIn: false,
    loading: true,
    token: null
  }),
  actions: {
    async fetchUser() {
      this.loading = true;
      try {
        const authCookie = useCookie('auth_token');
        if (!authCookie.value) throw new Error('No token');

        const data = await $fetch('/api/user/me', {
          headers: {
            Authorization: `Bearer ${authCookie.value}`
          }
        });

        if (data && data.user) {
          this.user = data.user;
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
    }
    ,

    async login(email: string, password: string) {
      this.loading = true;
      try {
        const response = await $fetch('/api/auth/login', {
          method: 'POST',
          body: { email, password }
        });

        if (response.user && response.token) {
          this.user = response.user as User;
          this.loggedIn = true;
          this.token = response.token;

          // ✅ Set token in cookie for server-side access
          const authCookie = useCookie('auth_token');
          authCookie.value = response.token;

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
        await $fetch('/api/auth/logout', { method: 'POST' });
        this.user = null;
        this.loggedIn = false;
        this.token = null;

        const authCookie = useCookie('auth_token');
        authCookie.value = null;
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        this.loading = false;
      }
    },

    isAdmin(): boolean {
      return this.user?.role === 'admin';
    }
  }
});
