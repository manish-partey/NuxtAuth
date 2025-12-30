<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';

definePageMeta({
  middleware: ['auth-guard'],
  roles: ['super_admin']
});

const route = useRoute();
const router = useRouter();
const platformId = route.params.id as string;
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Breadcrumb -->
      <nav class="mb-6 text-sm">
        <ol class="flex items-center space-x-2 text-gray-600">
          <li><NuxtLink to="/superadmin" class="hover:text-blue-600">Super Admin</NuxtLink></li>
          <li>›</li>
          <li><NuxtLink to="/superadmin/platforms" class="hover:text-blue-600">Platforms</NuxtLink></li>
          <li>›</li>
          <li><NuxtLink :to="`/superadmin/platforms/${platformId}`" class="hover:text-blue-600">Platform Details</NuxtLink></li>
          <li>›</li>
          <li class="text-gray-900 font-medium">Organizations</li>
        </ol>
      </nav>

      <div class="bg-white shadow-sm rounded-lg p-6">
        <h1 class="text-2xl font-semibold text-gray-900 mb-4">Organizations</h1>
        
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
          <p class="text-amber-800 mb-4">
            🚧 Organizations list page is under development. The API endpoint needs to be created first.
          </p>
          <button
            @click="router.push(`/superadmin/platforms/${platformId}`)"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ← Back to Platform Details
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
