<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
    <div class="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-gray-900">Bulk Add Users</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Method Selection -->
      <div class="mb-6">
        <div class="flex space-x-4 border-b">
          <button 
            @click="activeMethod = 'manual'"
            :class="[
              'py-2 px-4 border-b-2 font-medium text-sm',
              activeMethod === 'manual' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            ]">
            Manual Entry
          </button>
          <button 
            @click="activeMethod = 'csv'"
            :class="[
              'py-2 px-4 border-b-2 font-medium text-sm',
              activeMethod === 'csv' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            ]">
            CSV Upload
          </button>
          <button 
            @click="activeMethod = 'textarea'"
            :class="[
              'py-2 px-4 border-b-2 font-medium text-sm',
              activeMethod === 'textarea' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            ]">
            Paste List
          </button>
        </div>
      </div>

      <form @submit.prevent="submitInvitation" class="space-y-4">
        <!-- Manual Entry Method -->
        <div v-if="activeMethod === 'manual'">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Email Addresses *
          </label>
          <div class="space-y-2 max-h-60 overflow-y-auto">
            <div v-for="(email, index) in emails" :key="index" class="flex space-x-2">
              <input 
                v-model="emails[index]" 
                type="email" 
                placeholder="user@example.com"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                required />
              <button v-if="emails.length > 1" type="button" @click="removeEmail(index)"
                class="px-3 py-2 text-red-600 hover:text-red-800">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Add Email Button -->
          <button v-if="emails.length < 50" type="button" @click="addEmail"
            class="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Add Another Email ({{ emails.length }}/50)
          </button>
        </div>

        <!-- CSV Upload Method -->
        <div v-if="activeMethod === 'csv'">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Upload CSV File
          </label>
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref="csvFileInput"
              type="file"
              accept=".csv"
              @change="handleFileUpload"
              class="hidden"
            />
            <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <div class="mt-4">
              <button type="button" @click="$refs.csvFileInput.click()" 
                class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Choose CSV File
              </button>
            </div>
            <p class="mt-2 text-sm text-gray-500">
              Upload a CSV with columns: email, role (optional)
            </p>
          </div>

          <!-- CSV Preview -->
          <div v-if="csvPreview.length > 0" class="mt-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Preview ({{ csvPreview.length }} users)</h4>
            <div class="bg-gray-50 border rounded max-h-40 overflow-y-auto">
              <div v-for="(row, index) in csvPreview.slice(0, 10)" :key="index" 
                class="px-3 py-2 border-b text-sm flex justify-between">
                <span>{{ row.email }}</span>
                <span class="text-gray-500">{{ row.role || 'employee' }}</span>
              </div>
              <div v-if="csvPreview.length > 10" class="px-3 py-2 text-sm text-gray-500 text-center">
                ... and {{ csvPreview.length - 10 }} more
              </div>
            </div>
          </div>
        </div>

        <!-- Textarea Method -->
        <div v-if="activeMethod === 'textarea'">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Paste Email List
          </label>
          <textarea
            v-model="bulkEmailText"
            @input="parseEmailList"
            placeholder="Paste emails here (one per line or comma-separated):
john@example.com
jane@example.com, mary@example.com
bob@example.com"
            class="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
          />
          <p class="text-xs text-gray-500 mt-1">
            Detected {{ parsedEmails.length }} emails
          </p>
        </div>

        <!-- Role Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Default Role *
          </label>
          <select v-model="selectedRole" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="guest">Guest</option>
            <option value="organization_admin">Organization Admin</option>
          </select>
          <p class="text-xs text-gray-500 mt-1">
            All invited users will be assigned this role (CSV uploads can override this)
          </p>
        </div>

        <!-- Custom Message -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Custom Message (Optional)
          </label>
          <textarea v-model="customMessage"
            placeholder="Add a personal message to the invitation email..."
            class="w-full h-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"/>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {{ error }}
        </div>

        <!-- Success Display -->
        <div v-if="success" class="p-3 bg-green-50 border border-green-200 rounded text-sm">
          <p class="font-medium text-green-700">{{ success.message }}</p>
          <div v-if="success.results.failed.length > 0" class="mt-2">
            <p class="text-green-600">Failed invitations:</p>
            <ul class="list-disc list-inside text-green-600 text-xs">
              <li v-for="failed in success.results.failed" :key="failed.email">
                {{ failed.email }}: {{ failed.reason }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-3 pt-4">
          <button type="submit" :disabled="!canSubmit || isSubmitting"
            class="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="isSubmitting">Sending...</span>
            <span v-else>Send {{ totalEmails }} Invitation{{ totalEmails !== 1 ? 's' : '' }}</span>
          </button>
          <button type="button" @click="$emit('close')"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const emit = defineEmits(['close', 'success'])

// Method selection
const activeMethod = ref('manual')

// Manual entry
const emails = ref([''])

// CSV upload
const csvPreview = ref([])

// Textarea entry
const bulkEmailText = ref('')
const parsedEmails = ref([])

// Form data
const selectedRole = ref('employee')
const customMessage = ref('')

// UI state
const isSubmitting = ref(false)
const error = ref('')
const success = ref(null)

// Computed
const totalEmails = computed(() => {
  if (activeMethod.value === 'manual') {
    return emails.value.filter(email => email.trim()).length
  } else if (activeMethod.value === 'csv') {
    return csvPreview.value.length
  } else {
    return parsedEmails.value.length
  }
})

const canSubmit = computed(() => {
  return totalEmails.value > 0 && selectedRole.value && !isSubmitting.value
})

// Methods
const addEmail = () => {
  if (emails.value.length < 50) {
    emails.value.push('')
  }
}

const removeEmail = (index) => {
  emails.value.splice(index, 1)
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const text = await file.text()
    const lines = text.split('\n')
    const header = lines[0].toLowerCase()
    
    csvPreview.value = []
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
      
      if (header.includes('email')) {
        const emailIndex = header.split(',').findIndex(h => h.includes('email'))
        const roleIndex = header.split(',').findIndex(h => h.includes('role'))
        
        const email = values[emailIndex]
        const role = roleIndex >= 0 ? values[roleIndex] : null
        
        if (email && validateEmail(email)) {
          csvPreview.value.push({ email, role })
        }
      } else {
        // Assume first column is email
        const email = values[0]
        const role = values[1] || null
        
        if (email && validateEmail(email)) {
          csvPreview.value.push({ email, role })
        }
      }
    }
    
    error.value = ''
    if (csvPreview.value.length === 0) {
      error.value = 'No valid emails found in CSV file'
    }
  } catch (err) {
    error.value = 'Failed to read CSV file: ' + err.message
    csvPreview.value = []
  }
}

const parseEmailList = () => {
  const text = bulkEmailText.value
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
  const matches = text.match(emailRegex) || []
  
  parsedEmails.value = [...new Set(matches)] // Remove duplicates
}

const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

const submitInvitation = async () => {
  isSubmitting.value = true
  error.value = ''
  success.value = null

  try {
    let emailsToInvite = []
    
    if (activeMethod.value === 'manual') {
      emailsToInvite = emails.value.filter(email => email.trim())
    } else if (activeMethod.value === 'csv') {
      emailsToInvite = csvPreview.value.map(row => row.email)
    } else {
      emailsToInvite = parsedEmails.value
    }

    if (emailsToInvite.length === 0) {
      throw new Error('Please add at least one email address')
    }

    if (emailsToInvite.length > 50) {
      throw new Error('Maximum 50 invitations allowed at once')
    }

    const response = await $fetch('/api/org/users/invite', {
      method: 'POST',
      credentials: 'include',
      body: {
        emails: emailsToInvite,
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

// Watch method changes to reset state
watch(activeMethod, () => {
  error.value = ''
  success.value = null
})
</script>