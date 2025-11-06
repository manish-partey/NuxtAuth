<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Navigation Test Page</h1>
    <p class="mb-4">Test various navigation functions:</p>
    
    <div class="space-y-4">
      <button
        @click="navigateToOrgDocuments"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Navigate to /org/documents
      </button>
      
      <button
        @click="navigateToPlatformDocuments"
        class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Navigate to /platform/documents
      </button>
      
      <button
        @click="navigateToOrgDashboard"
        class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        Navigate to /org/dashboard
      </button>
    </div>
    
    <div class="mt-6">
      <h2 class="text-lg font-semibold mb-2">Regular Links (for comparison):</h2>
      <div class="space-x-4">
        <NuxtLink to="/org/documents" class="text-blue-600 hover:underline">Link to /org/documents</NuxtLink>
        <NuxtLink to="/platform/documents" class="text-green-600 hover:underline">Link to /platform/documents</NuxtLink>
        <NuxtLink to="/org/dashboard" class="text-purple-600 hover:underline">Link to /org/dashboard</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Test navigation functions
const navigateToOrgDocuments = () => {
  console.log('Attempting to navigate to /org/documents');
  navigateTo('/org/documents');
};

const navigateToPlatformDocuments = () => {
  console.log('Attempting to navigate to /platform/documents');
  navigateTo('/platform/documents');
};

const navigateToOrgDashboard = () => {
  console.log('Attempting to navigate to /org/dashboard');
  navigateTo('/org/dashboard');
};
</script>