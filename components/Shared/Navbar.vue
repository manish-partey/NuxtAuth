<template>
  <nav class="flex items-center space-x-4" aria-label="Primary navigation">
    <template v-if="authStore.loggedIn && authStore.user">
      <span class="text-sm hidden sm:inline">Hi, {{ authStore.user.name }}</span>

      <!-- Role-specific Dashboard -->
      <NuxtLink :to="dashboardLink" class="text-sm font-medium text-gray-700 hover:text-blue-600">
        Dashboard
      </NuxtLink>

      <!-- Super Admin Menus -->
      <template v-if="authStore.isSuperAdmin">
        <NuxtLink to="/superadmin/platforms" class="text-sm font-medium text-gray-700 hover:text-blue-600">Platforms</NuxtLink>
        <NuxtLink to="/superadmin/organizations" class="text-sm font-medium text-gray-700 hover:text-blue-600">Organizations</NuxtLink>
        <NuxtLink to="/superadmin/users" class="text-sm font-medium text-gray-700 hover:text-blue-600">Users</NuxtLink>
        <NuxtLink to="/superadmin/settings" class="text-sm font-medium text-gray-700 hover:text-blue-600">Settings</NuxtLink>
      </template>

      <!-- Platform Admin Menus -->
      <template v-else-if="authStore.isPlatformAdmin">
        <NuxtLink to="/platform/pending-organizations" class="text-sm font-medium text-gray-700 hover:text-blue-600">Approvals</NuxtLink>
        <NuxtLink to="/platform/organizations" class="text-sm font-medium text-gray-700 hover:text-blue-600">Organizations</NuxtLink>
        <NuxtLink to="/platform/organization-types" class="text-sm font-medium text-gray-700 hover:text-blue-600">Org Types</NuxtLink>
     
        <NuxtLink to="/platform/settings" class="text-sm font-medium text-gray-700 hover:text-blue-600">Settings</NuxtLink>
      </template>

      <!-- Organization Admin Menus -->
      <template v-else-if="authStore.isOrgAdmin">
        <NuxtLink to="/org/users" class="text-sm font-medium text-gray-700 hover:text-blue-600">Users</NuxtLink>
        <NuxtLink to="/organization-register" class="text-sm font-medium text-gray-700 hover:text-blue-600">Create Organization</NuxtLink>
        <NuxtLink to="/org/invites" class="text-sm font-medium text-gray-700 hover:text-blue-600">Invites</NuxtLink>
        <NuxtLink to="/org/settings" class="text-sm font-medium text-gray-700 hover:text-blue-600">Settings</NuxtLink>
      </template>

      <!-- Regular User Menus -->
      <template v-else-if="authStore.userRole === 'user'">
        <NuxtLink to="/user/profile" class="text-sm font-medium text-gray-700 hover:text-blue-600">Profile</NuxtLink>
        <NuxtLink to="/user/documents" class="text-sm font-medium text-gray-700 hover:text-blue-600">My Documents</NuxtLink>
      </template>

      <!-- Sign Out -->
      <button @click="handleLogout"
        class="text-sm font-medium bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded transition">
        Sign Out
      </button>
    </template>

    <template v-else>
      <NuxtLink to="/login" class="text-sm font-medium text-gray-700 hover:text-blue-600">Sign In</NuxtLink>
      <NuxtLink to="/register" class="text-sm font-medium text-gray-700 hover:text-blue-600">Sign Up</NuxtLink>
      <NuxtLink to="/organization-register" class="text-sm font-medium text-gray-700 hover:text-blue-600">Register Organization</NuxtLink>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { computed, nextTick } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const dashboardLink = computed(() => {
  const role = authStore.user?.role
  if (!authStore.loggedIn || !role) return '/login'

  switch (role) {
    case 'super_admin':
      return '/superadmin'
    case 'platform_admin':
      return '/platform'
    case 'organization_admin':
      return '/org'
    case 'user':
      return '/dashboard'
    default:
      return '/dashboard'
  }
})

const handleLogout = async () => {
  await authStore.logout()
  await nextTick()
  await router.push('/login')
}
</script>
