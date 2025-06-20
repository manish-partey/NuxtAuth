<template>
  <nav class="flex items-center space-x-4" aria-label="Primary navigation">
    <template v-if="authStore.loggedIn">
      <span class="text-sm hidden sm:inline">Hi, {{ authStore.user?.name }}</span>

      <NuxtLink :to="dashboardLink" class="text-sm font-medium text-gray-700 hover:text-blue-600">
        Dashboard
      </NuxtLink>

      <NuxtLink
        v-if="authStore.isAdmin"
        to="/admin"
        class="text-sm font-medium text-gray-700 hover:text-blue-600"
      >
        Admin
      </NuxtLink>

      <NuxtLink
        v-if="authStore.isPlatformAdmin"
        to="/platform"
        class="text-sm font-medium text-gray-700 hover:text-blue-600"
      >
        Platform
      </NuxtLink>

      <NuxtLink
        v-if="authStore.isOrgAdmin"
        to="/org"
        class="text-sm font-medium text-gray-700 hover:text-blue-600"
      >
        Organization
      </NuxtLink>

      <NuxtLink
        v-if="authStore.isSuperAdmin"
        to="/superadmin"
        class="text-sm font-medium text-gray-700 hover:text-blue-600"
      >
        Super Admin
      </NuxtLink>

      <button
        @click="handleLogout"
        class="text-sm font-medium bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded transition"
      >
        Sign Out
      </button>
    </template>

    <template v-else>
      <NuxtLink to="/login" class="text-sm font-medium text-gray-700 hover:text-blue-600">
        Sign In
      </NuxtLink>
      <NuxtLink to="/register" class="text-sm font-medium text-gray-700 hover:text-blue-600">
        Sign Up
      </NuxtLink>
      <NuxtLink to="/organization-register" class="text-sm font-medium text-gray-700 hover:text-blue-600">
        Register Org
      </NuxtLink>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useRouter } from 'vue-router';
import { nextTick } from 'vue';

const authStore = useAuthStore();
const router = useRouter();

const dashboardLink = computed(() => {
  if (!authStore.loggedIn || !authStore.user) return '/login';

  switch (authStore.user.role) {
    case 'super_admin':
      return '/superadmin';
    case 'platform_admin':
      return '/platform';
    case 'organization_admin':
      return '/org';
    case 'admin':
      return '/admin';
    case 'user':
      return '/dashboard';
    default:
      return '/dashboard';
  }
});

const handleLogout = async (): Promise<void> => {
  await authStore.logout();
  await nextTick();
  await router.push('/login');
};
</script>
