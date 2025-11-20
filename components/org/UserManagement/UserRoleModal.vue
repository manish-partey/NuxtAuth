<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full mx-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-900">Update User Role</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- User Info -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6">
        <div class="flex items-center space-x-3">
          <div class="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
            <span class="text-lg font-medium text-gray-700">
              {{ getUserInitials(user.user) }}
            </span>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">
              {{ user.user?.name || 'Pending User' }}
            </h3>
            <p class="text-sm text-gray-500">{{ user.user?.email || user.invitedEmail }}</p>
            <div class="flex items-center space-x-2 mt-1">
              <span class="text-xs text-gray-500">Current Role:</span>
              <RoleBadge :role="user.role" />
            </div>
          </div>
        </div>
      </div>

      <!-- Role Selection Form -->
      <form @submit.prevent="updateRole" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            New Role *
          </label>
          <div class="space-y-3">
            <div v-for="roleOption in availableRoles" :key="roleOption.value" 
              class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              :class="{ 'border-blue-500 bg-blue-50': selectedRole === roleOption.value }"
              @click="selectedRole = roleOption.value">
              
              <input type="radio" :value="roleOption.value" v-model="selectedRole" 
                class="mr-3 text-blue-600 focus:ring-blue-500" />
              
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <h4 class="font-medium text-gray-900">{{ roleOption.label }}</h4>
                  <RoleBadge :role="roleOption.value" />
                </div>
                <p class="text-sm text-gray-500 mt-1">{{ roleOption.description }}</p>
                
                <!-- Permissions Preview -->
                <div class="mt-2">
                  <p class="text-xs text-gray-400 mb-1">Permissions:</p>
                  <div class="flex flex-wrap gap-1">
                    <span v-for="permission in roleOption.permissions.slice(0, 4)" :key="permission"
                      class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {{ formatPermission(permission) }}
                    </span>
                    <span v-if="roleOption.permissions.length > 4" 
                      class="text-xs text-gray-400">
                      +{{ roleOption.permissions.length - 4 }} more
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Warning for Admin Role -->
        <div v-if="selectedRole === 'organization_admin'" class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div class="flex">
            <svg class="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <div class="text-yellow-800 text-sm">
              <p class="font-medium">Organization Admin Role</p>
              <p>This user will have full administrative access to manage the organization, including the ability to invite users, manage roles, and access sensitive settings.</p>
            </div>
          </div>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
          <div class="flex">
            <svg class="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <p class="text-red-700 text-sm">{{ error }}</p>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex space-x-3 pt-4">
          <button type="button" @click="$emit('close')"
            class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition">
            Cancel
          </button>
          <button type="submit" :disabled="isSubmitting || !selectedRole || selectedRole === user.role"
            class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition flex items-center justify-center">
            <span v-if="isSubmitting" class="mr-2">
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ isSubmitting ? 'Updating...' : 'Update Role' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { organizationRoles } from '~/composables/useRoles'
import RoleBadge from '~/components/org/shared/RoleBadge.vue'

// Props
const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['close', 'success'])

// Reactive data
const selectedRole = ref(props.user.role)
const isSubmitting = ref(false)
const error = ref('')

// Computed
const availableRoles = computed(() => {
  return Object.entries(organizationRoles).map(([key, info]) => ({
    value: key,
    label: info.label,
    description: info.description,
    permissions: info.permissions
  }))
})

// Methods
const getUserInitials = (user) => {
  if (!user?.name) return '?'
  return user.name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const formatPermission = (permission) => {
  return permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const updateRole = async () => {
  if (!selectedRole.value || selectedRole.value === props.user.role) return
  
  error.value = ''
  isSubmitting.value = true
  
  try {
    const response = await $fetch(`/api/org/users/${props.user.user?._id}/role`, {
      method: 'PUT',
      credentials: 'include',
      body: {
        role: selectedRole.value
      }
    })
    
    if (response.success) {
      emit('success')
    } else {
      throw new Error(response.message || 'Failed to update user role')
    }
  } catch (err) {
    error.value = err.data?.message || err.message || 'Failed to update user role'
  } finally {
    isSubmitting.value = false
  }
}
</script>