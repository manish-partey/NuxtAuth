<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

// Redirect to dashboard if user has organization access
onMounted(async () => {
  // Wait for user to be loaded
  await auth.fetchUser()
  
  if (auth.user) {
    // If user is org admin or has org access, redirect to dashboard
    if (['organization_admin', 'manager', 'employee', 'guest'].includes(auth.user.role)) {
      await router.replace('/org/dashboard')
    } else {
      // Redirect to appropriate dashboard based on role
      switch (auth.user.role) {
        case 'super_admin':
          await router.replace('/superadmin')
          break
        case 'platform_admin':
          await router.replace('/platform')
          break
        default:
          await router.replace('/dashboard')
      }
    }
  }
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Redirecting to dashboard...</p>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
@layer components {
  .org-card {
    @apply bg-white rounded-2xl shadow p-6 hover:bg-gray-50 transition;
  }
}
</style>


