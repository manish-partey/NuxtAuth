<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
    <div class="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-gray-900">Add Users</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <form @submit.prevent="submitInvitation" class="space-y-4">
        <!-- Email Input -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Email Addresses *
          </label>
          <div class="space-y-2">
            <div v-for="(email, index) in emails" :key="index" class="flex space-x-2">
              <input 
                v-model="emails[index]" 
                type="email" 
                placeholder="user@example.com"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                required />
              <button v-if="emails.length > 1" type="button" @click="removeEmail(index)"
                class="px-3 py-2 text-red-600 hover:text-red-800">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Add Email Button -->
          <button v-if="emails.length < 10" type="button" @click="addEmail"
            class="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Add Another Email
          </button>
          <p class="text-xs text-gray-500 mt-1">You can invite up to 10 users at once</p>
        </div>

        <!-- Role Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Role *
          </label>
          <select v-model="selectedRole" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            required>
            <option value="">Select a role...</option>
            <option value="organization_admin">Organization Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
            <option value="guest">Guest</option>
          </select>
          
          <!-- Role Description -->
          <div v-if="roleInfo" class="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
            <strong>{{ roleInfo.label }}:</strong> {{ roleInfo.description }}
          </div>
        </div>

        <!-- Custom Message -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Custom Message (Optional)
          </label>
          <textarea v-model="customMessage" 
            rows="3"
            placeholder="Add a personal message to the invitation..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none">
          </textarea>
          <p class="text-xs text-gray-500 mt-1">This message will be included in the invitation email</p>
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

        <!-- Success Display -->
        <div v-if="success" class="bg-green-50 border border-green-200 rounded-lg p-3">
          <div class="flex">
            <svg class="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <div class="text-green-700 text-sm">
              <p class="font-medium">{{ success.message }}</p>
              <div v-if="success.results" class="mt-2 space-y-1">
                <p v-if="success.results.successful.length > 0" class="text-green-600">
                  ✓ Successfully invited: {{ success.results.successful.join(', ') }}
                </p>
                <div v-if="success.results.failed.length > 0">
                  <p class="text-red-600 font-medium">Failed invitations:</p>
                  <ul class="list-disc list-inside text-red-600 ml-4">
                    <li v-for="fail in success.results.failed" :key="fail.email">
                      {{ fail.email }}: {{ fail.reason }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex space-x-3 pt-4">
          <button type="button" @click="$emit('close')"
            class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition">
            Cancel
          </button>
          <button type="submit" :disabled="isSubmitting || !isFormValid"
            class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition flex items-center justify-center">
            <span v-if="isSubmitting" class="mr-2">
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ isSubmitting ? 'Sending...' : 'Send Invitations' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getRoleInfo } from '~/composables/useRoles'

// Emits
const emit = defineEmits(['close', 'success'])

// Reactive data
const emails = ref([''])
const selectedRole = ref('')
const customMessage = ref('')
const isSubmitting = ref(false)
const error = ref('')
const success = ref(null)

// Computed
const isFormValid = computed(() => {
  return emails.value.every(email => email.trim() && email.includes('@')) && selectedRole.value
})

const roleInfo = computed(() => {
  return selectedRole.value ? getRoleInfo(selectedRole.value) : null
})

// Methods
const addEmail = () => {
  if (emails.value.length < 10) {
    emails.value.push('')
  }
}

const removeEmail = (index) => {
  if (emails.value.length > 1) {
    emails.value.splice(index, 1)
  }
}

const submitInvitation = async () => {
  if (!isFormValid.value) return
  
  // Clear previous messages
  error.value = ''
  success.value = null
  isSubmitting.value = true
  
  try {
    // Filter out empty emails
    const validEmails = emails.value.filter(email => email.trim())
    
    const response = await $fetch('/api/org/users/invite', {
      method: 'POST',
      credentials: 'include',
      body: {
        emails: validEmails,
        role: selectedRole.value,
        message: customMessage.value.trim() || undefined
      }
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
      throw new Error(response.message || 'Failed to send invitations')
    }
  } catch (err) {
    error.value = err.data?.message || err.message || 'Failed to send invitations'
  } finally {
    isSubmitting.value = false
  }
}
</script>