<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-900">Bulk Actions</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <p class="text-sm text-gray-600 mb-4">
        Selected {{ selectedUsers.length }} user{{ selectedUsers.length !== 1 ? 's' : '' }}
      </p>

      <!-- Action Selection -->
      <div class="space-y-3 mb-6">
        <div v-for="action in availableActions" :key="action.value" 
          class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
          :class="{ 'border-blue-500 bg-blue-50': selectedAction === action.value }"
          @click="selectAction(action.value)">
          
          <input type="radio" :value="action.value" v-model="selectedAction" 
            class="mr-3 text-blue-600 focus:ring-blue-500" />
          
          <div class="flex-1">
            <div class="flex items-center space-x-2">
              <span :class="action.iconClass">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="action.icon"/>
                </svg>
              </span>
              <h4 class="font-medium text-gray-900">{{ action.label }}</h4>
            </div>
            <p class="text-sm text-gray-500 mt-1 ml-7">{{ action.description }}</p>
          </div>
        </div>
      </div>

      <!-- Role Selection (for update_role action) -->
      <div v-if="selectedAction === 'update_role'" class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          New Role *
        </label>
        <select v-model="newRole" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="">Select new role...</option>
          <option value="manager">Manager</option>
          <option value="employee">Employee</option>
          <option value="guest">Guest</option>
        </select>
      </div>

      <!-- Reason Input (for suspend/remove actions) -->
      <div v-if="selectedAction === 'suspend' || selectedAction === 'remove'" class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Reason {{ selectedAction === 'remove' ? '*' : '(Optional)' }}
        </label>
        <textarea v-model="reason" 
          rows="3"
          :placeholder="`Reason for ${selectedAction === 'suspend' ? 'suspending' : 'removing'} users...`"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none">
        </textarea>
      </div>

      <!-- Warning for Destructive Actions -->
      <div v-if="selectedAction === 'remove'" class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
        <div class="flex">
          <svg class="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <div class="text-red-800 text-sm">
            <p class="font-medium">This action cannot be undone</p>
            <p>Users will be removed from the organization and lose access to all resources.</p>
          </div>
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
        <div class="flex">
          <svg class="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <p class="text-red-700 text-sm">{{ error }}</p>
        </div>
      </div>

      <!-- Success Display -->
      <div v-if="success" class="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
        <div class="flex">
          <svg class="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <div class="text-green-700 text-sm">
            <p class="font-medium">{{ success.message }}</p>
            <div v-if="success.results" class="mt-2 space-y-1">
              <p v-if="success.results.successful.length > 0" class="text-green-600">
                ✓ Successfully processed: {{ success.results.successful.length }} users
              </p>
              <div v-if="success.results.failed.length > 0">
                <p class="text-red-600 font-medium">Failed operations:</p>
                <ul class="list-disc list-inside text-red-600 ml-4">
                  <li v-for="fail in success.results.failed" :key="fail.userId">
                    User ID {{ fail.userId.substring(0, 8) }}...: {{ fail.reason }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex space-x-3">
        <button type="button" @click="$emit('close')"
          class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition">
          Cancel
        </button>
        <button @click="executeBulkAction" :disabled="isSubmitting || !isFormValid"
          class="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-lg transition flex items-center justify-center">
          <span v-if="isSubmitting" class="mr-2">
            <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          {{ isSubmitting ? 'Processing...' : 'Execute Action' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  selectedUsers: {
    type: Array,
    required: true
  }
})

// Emits
const emit = defineEmits(['close', 'success'])

// Reactive data
const selectedAction = ref('')
const newRole = ref('')
const reason = ref('')
const isSubmitting = ref(false)
const error = ref('')
const success = ref(null)

// Available actions
const availableActions = [
  {
    value: 'update_role',
    label: 'Update Role',
    description: 'Change the role for selected users',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    iconClass: 'text-blue-600'
  },
  {
    value: 'suspend',
    label: 'Suspend Users',
    description: 'Temporarily suspend selected users',
    icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18 18M6 6l12 12',
    iconClass: 'text-yellow-600'
  },
  {
    value: 'activate',
    label: 'Activate Users',
    description: 'Activate suspended users',
    icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
    iconClass: 'text-green-600'
  },
  {
    value: 'remove',
    label: 'Remove Users',
    description: 'Permanently remove users from organization',
    icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    iconClass: 'text-red-600'
  }
]

// Computed
const isFormValid = computed(() => {
  if (!selectedAction.value) return false
  
  if (selectedAction.value === 'update_role' && !newRole.value) return false
  if (selectedAction.value === 'remove' && !reason.value.trim()) return false
  
  return true
})

// Methods
const selectAction = (action) => {
  selectedAction.value = action
  // Reset dependent fields
  newRole.value = ''
  reason.value = ''
  error.value = ''
  success.value = null
}

const executeBulkAction = async () => {
  if (!isFormValid.value) return
  
  error.value = ''
  success.value = null
  isSubmitting.value = true
  
  try {
    const payload = {
      userIds: props.selectedUsers,
      action: selectedAction.value
    }
    
    // Add payload specific data
    if (selectedAction.value === 'update_role') {
      payload.payload = { role: newRole.value }
    } else if (selectedAction.value === 'suspend' || selectedAction.value === 'remove') {
      payload.payload = { reason: reason.value.trim() }
    }
    
    const response = await $fetch('/api/org/users/bulk-update', {
      method: 'POST',
      credentials: 'include',
      body: payload
    })
    
    if (response.success) {
      success.value = {
        message: response.message,
        results: response.results
      }
      
      // Close modal after 3 seconds if all successful
      if (response.results.failed.length === 0) {
        setTimeout(() => {
          emit('success')
        }, 2000)
      }
    } else {
      throw new Error(response.message || 'Bulk operation failed')
    }
  } catch (err) {
    error.value = err.data?.message || err.message || 'Bulk operation failed'
  } finally {
    isSubmitting.value = false
  }
}
</script>