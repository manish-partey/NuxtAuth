// stores/user.ts
import { defineStore } from 'pinia';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  organizationId?: string;
  platformId?: string;
}

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [] as User[],
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAllUsers() {
      this.loading = true;
      this.error = null;
      try {
        const data = await $fetch<User[]>('/api/user/list.get');
        this.users = data;
      } catch (err: any) {
        this.error = err?.data?.message || 'Failed to fetch users';
        console.error('fetchAllUsers error:', err);
      } finally {
        this.loading = false;
      }
    },

    async createUser(payload: Partial<User> & { password?: string }) {
      this.loading = true;
      this.error = null;
      try {
        const response = await $fetch('/api/user/create', {
          method: 'POST',
          body: payload
        });
        return response;
      } catch (err: any) {
        this.error = err?.data?.message || 'Failed to create user';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async inviteUser(payload: { emails: string[], role: string, customMessage?: string }) {
      this.loading = true;
      this.error = null;
      try {
        const response = await $fetch('/api/org/users/invite', {
          method: 'POST',
          body: payload
        });
        return response;
      } catch (err: any) {
        this.error = err?.data?.message || 'Failed to invite user55';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteUser(userId: string) {
      this.loading = true;
      this.error = null;
      try {
        await $fetch(`/api/user/${userId}`, {
          method: 'DELETE'
        });
        this.users = this.users.filter((u) => u.id !== userId);
      } catch (err: any) {
        this.error = err?.data?.message || 'Failed to delete user';
        throw err;
      } finally {
        this.loading = false;
      }
    }
  }
});
