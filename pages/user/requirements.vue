<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="md:flex md:items-center md:justify-between mb-6">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Document Requirements
          </h2>
          <p class="mt-1 text-sm text-gray-500">
            This page has been upgraded to our new hierarchical document system
          </p>
        </div>
      </div>

      <!-- Redirect Notice -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-blue-800">
              New Hierarchical Document System
            </h3>
            <div class="mt-2 text-sm text-blue-700">
              <p>We've upgraded to a new hierarchical document management system that shows:</p>
              <ul class="mt-2 list-disc list-inside space-y-1">
                <li>Document requirements inherited from your platform</li>
                <li>Organization-specific document requirements</li>
                <li>Complete inheritance chain visualization</li>
                <li>Better document categorization</li>
              </ul>
            </div>
            <div class="mt-4">
              <div class="flex space-x-3">
                <NuxtLink 
                  to="/user/documents"
                  class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
                >
                  Go to New Documents Page
                </NuxtLink>
                <NuxtLink 
                  to="/user/dashboard"
                  class="bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
                >
                  Back to Dashboard
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- System Overview -->
      <div class="mt-8 bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">How the New System Works</h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <h4 class="font-medium text-gray-900">Platform Requirements</h4>
                <p class="text-sm text-gray-600">Your organization inherits document requirements from the platform level</p>
              </div>
            </div>
            
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <h4 class="font-medium text-gray-900">Organization Requirements</h4>
                <p class="text-sm text-gray-600">Additional documents may be required specifically by your organization</p>
              </div>
            </div>
            
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <h4 class="font-medium text-gray-900">Your Complete View</h4>
                <p class="text-sm text-gray-600">You see all inherited requirements in one place, clearly categorized</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth-guard'],
  roles: ['user', 'organization_admin', 'platform_admin']
});

// Auto-redirect to new documents page after a brief delay
onMounted(() => {
  setTimeout(() => {
    navigateTo('/user/documents')
  }, 3000)
})
</script>