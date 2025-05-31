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
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    loggedIn: false,
    loading: true, // Initially true while checking session
  }),
  actions: {
    async fetchUser() {
      this.loading = true;
      try {
        const data = await $fetch('/api/user/me');
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
    },
    async login(email: string, password: string) {
      this.loading = true;
      try {
        const response = await $fetch('/api/auth/login', {
          method: 'POST',
          body: { email, password },
        });
        if (response.user) {
          this.user = response.user as User;
          this.loggedIn = true;
          return true;
        }
        return false;
      } catch (error: any) {
        console.error('Login error:', error);
        throw error; // Re-throw to handle in component
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
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        this.loading = false;
      }
    },
    isAdmin(): boolean {
      return this.user?.role === 'admin';
    }
  },
});