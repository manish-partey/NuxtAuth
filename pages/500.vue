<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full text-center">
      <!-- 500 Icon -->
      <div class="mb-8">
        <svg class="mx-auto h-24 w-24 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <!-- Error Message -->
      <h1 class="text-6xl font-bold text-gray-900 mb-4">500</h1>
      <h2 class="text-2xl font-semibold text-gray-800 mb-4">Server Error</h2>
      <p class="text-gray-600 mb-8">
        Oops! Something went wrong on our end. Our team has been notified and is working to fix the issue.
      </p>

      <!-- Error Details (optional, shown if error prop exists) -->
      <div v-if="showDetails && errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
        <div class="flex items-start space-x-2">
          <svg class="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="flex-1">
            <p class="text-sm font-medium text-red-800 mb-1">Error Details:</p>
            <p class="text-sm text-red-700 font-mono break-words">{{ errorMessage }}</p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center mb-6">
        <button 
          @click="retryAction"
          class="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
        >
          <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
        </button>
        
        <NuxtLink 
          :to="dashboardLink"
          class="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
        >
          <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Go to Dashboard
        </NuxtLink>
      </div>

      <!-- Additional Help -->
      <div class="mt-8 text-sm text-gray-500">
        <p>If this problem persists, please contact support.</p>
        <p class="mt-2">
          <button @click="toggleDetails" class="text-blue-600 hover:text-blue-800 underline">
            {{ showDetails ? 'Hide' : 'Show' }} technical details
          </button>
        </p>
      </div>

      <!-- Status Indicator -->
      <div class="mt-6 flex items-center justify-center space-x-2 text-xs text-gray-400">
        <span>Error Code: 500</span>
        <span>•</span>
        <span>{{ new Date().toLocaleString() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useRouter, useRoute } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const showDetails = ref(false);
const errorMessage = computed(() => route.query.error as string || 'An unexpected error occurred');

const dashboardLink = computed(() => {
  if (!authStore.loggedIn || !authStore.user) return '/';
  
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

const retryAction = () => {
  // Reload the current page
  router.go(-1);
};

const toggleDetails = () => {
  showDetails.value = !showDetails.value;
};
</script>
