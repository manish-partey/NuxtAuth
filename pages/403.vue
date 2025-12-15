<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full text-center">
      <!-- 403 Icon -->
      <div class="mb-8">
        <svg class="mx-auto h-24 w-24 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>

      <!-- Error Message -->
      <h1 class="text-6xl font-bold text-gray-900 mb-4">403</h1>
      <h2 class="text-2xl font-semibold text-gray-800 mb-4">Access Denied</h2>
      <p class="text-gray-600 mb-8">
        You don't have permission to access this page. This area is restricted to users with specific roles or privileges.
      </p>

      <!-- User Info -->
      <div v-if="authStore.loggedIn && authStore.user" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div class="flex items-center justify-center space-x-2 text-sm">
          <svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span class="text-gray-700">Logged in as:</span>
          <span class="font-semibold text-gray-900">{{ authStore.user.name }}</span>
          <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
            {{ authStore.user.role.replace('_', ' ') }}
          </span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button 
          @click="goBack"
          class="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
        >
          <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Go Back
        </button>
        
        <NuxtLink 
          :to="dashboardLink"
          class="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
        >
          <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Go to Your Dashboard
        </NuxtLink>
      </div>

      <!-- Additional Help -->
      <div class="mt-8 text-sm text-gray-500">
        <p>If you need access to this page, please contact your administrator.</p>
        <p class="mt-2">
          <NuxtLink to="/profile" class="text-blue-600 hover:text-blue-800 underline">
            View your account details
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const dashboardLink = computed(() => {
  if (!authStore.loggedIn || !authStore.user) return '/login';
  
  const role = authStore.user.role;
  switch (role) {
    case 'super_admin':
      return '/superadmin';
    case 'platform_admin':
      return '/platform';
    case 'organization_admin':
    case 'manager':
      return '/org/dashboard';
    case 'employee':
    case 'guest':
      return '/user';
    default:
      return '/dashboard';
  }
});

const goBack = () => {
  router.back();
};
</script>
