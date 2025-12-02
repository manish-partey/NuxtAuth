<template>
  <div class="min-h-screen bg-red-100">
    <div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Test Header -->
      <div class="md:flex md:items-center md:justify-between mb-6">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-red-900 sm:text-3xl sm:truncate">
            🔧 EDIT PAGE TEST - Platform ID: {{ platformId }}
          </h2>
          <p class="mt-1 text-sm text-red-700">
            This is the EDIT page - should be different from platforms list!
          </p>
          <p class="mt-1 text-sm text-red-600">
            Current route: {{ $route.fullPath }}
          </p>
          <p class="mt-1 text-sm text-red-600">
            Platform ID from params: {{ $route.params.id }}
          </p>
        </div>
        <div class="mt-4 flex md:mt-0 md:ml-4">
          <button
            @click="$router.push('/superadmin/platforms')"
            class="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Platforms
          </button>
        </div>
      </div>

      <!-- Test Content -->
      <div class="bg-red-200 rounded-lg p-8">
        <h3 class="text-xl font-bold text-red-800 mb-4">Edit Page is Working! ✅</h3>
        <p class="text-red-700">
          If you see this red page, the edit route is working correctly.
        </p>
        <div class="mt-4 p-4 bg-red-50 rounded">
          <h4 class="font-semibold text-red-800">Debug Info:</h4>
          <ul class="mt-2 text-sm text-red-700">
            <li>Route: {{ $route.path }}</li>
            <li>Platform ID: {{ $route.params.id }}</li>
            <li>Full Path: {{ $route.fullPath }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth-guard'],
  roles: ['super_admin']
});

const route = useRoute();
const platformId = route.params.id as string;

console.log("=== EDIT PAGE LOADED ===");
console.log("Platform ID:", platformId);
console.log("Route params:", route.params);
console.log("Full route:", route);
</script>
