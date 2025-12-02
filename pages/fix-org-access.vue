<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
      <h1 class="text-2xl font-bold mb-6 text-center text-gray-900">
        Fix Organization Access
      </h1>
      
      <!-- Debug Info -->
      <div v-if="debugData" class="mb-6 p-4 bg-gray-50 rounded border text-sm">
        <h3 class="font-semibold mb-2">Current Status:</h3>
        <p><strong>User ID:</strong> {{ debugData.currentUser?._id }}</p>
        <p><strong>Email:</strong> {{ debugData.currentUser?.email }}</p>
        <p><strong>Role:</strong> {{ debugData.currentUser?.role }}</p>
        <p><strong>Current Org ID:</strong> {{ debugData.currentUser?.organizationId || 'None' }}</p>
        <p><strong>Organizations Found:</strong> {{ debugData.userFoundInOrgs?.length || 0 }}</p>
      </div>

      <!-- Fix Result -->
      <div v-if="fixResult" class="mb-6 p-4 rounded border">
        <div v-if="fixResult.success" class="bg-green-50 border-green-200 text-green-800">
          <h3 class="font-semibold mb-2">✅ Fixed Successfully!</h3>
          <p class="mb-2">{{ fixResult.message }}</p>
          <p><strong>Organization:</strong> {{ fixResult.organizationName }}</p>
        </div>
        <div v-else class="bg-red-50 border-red-200 text-red-800">
          <h3 class="font-semibold mb-2">❌ Fix Failed</h3>
          <p>{{ fixResult.message }}</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="space-y-4">
        <button @click="loadDebugInfo" 
          class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          :disabled="loading">
          {{ loading ? 'Loading...' : 'Check Current Status' }}
        </button>

        <button @click="fixAssociation" 
          class="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
          :disabled="loading || fixResult?.success">
          {{ fixResult?.success ? 'Already Fixed' : (loading ? 'Fixing...' : 'Fix Organization Association') }}
        </button>

        <button @click="forceLogout" 
          class="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
          v-if="fixResult?.success">
          Logout & Login Again (Required)
        </button>

        <a href="/org/users" 
          class="block w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 text-center"
          v-if="fixResult?.success">
          Try Accessing Org Users Page
        </a>
      </div>

      <!-- Error -->
      <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

definePageMeta({
  layout: false,
  middleware: 'auth-guard'
})

const loading = ref(false)
const error = ref('')
const debugData = ref(null)
const fixResult = ref(null)

const loadDebugInfo = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await $fetch('/api/debug/user-org-status', {
      credentials: 'include'
    })
    debugData.value = response
    console.log('Debug data:', response)
  } catch (err) {
    error.value = err.data?.message || err.message || 'Failed to load debug info'
  } finally {
    loading.value = false
  }
}

const fixAssociation = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await $fetch('/api/fix/user-org-association', {
      method: 'POST',
      credentials: 'include'
    })
    fixResult.value = response
    console.log('Fix result:', response)
    
    // Reload debug info to show updated status
    if (response.success) {
      await loadDebugInfo()
    }
  } catch (err) {
    error.value = err.data?.message || err.message || 'Failed to fix association'
  } finally {
    loading.value = false
  }
}

const forceLogout = () => {
  // Clear any auth cookies/tokens
  document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  
  // Redirect to login
  window.location.href = '/login'
}

// Auto-load debug info on mount
onMounted(() => {
  loadDebugInfo()
})
</script>