<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-lg">
      <div class="text-center mb-6">
        <h1 class="text-3xl font-semibold text-blue-700 mb-2">Register Your Organization</h1>
        <p class="text-sm text-gray-600">Create your organization account. Your registration will be reviewed and approved by the platform administrator.</p>
      </div>
      
      <form @submit.prevent="submitRegistration" class="space-y-5">
        <!-- Platform Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Select Platform *</label>
          <select v-model="form.platformId" required @change="onPlatformChange"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Choose a platform...</option>
            <option v-for="platform in platforms" :key="platform.id" :value="platform.id">
              {{ platform.name }}
            </option>
          </select>
        </div>

        <!-- Personal Information -->
        <div class="border-t pt-4">
          <h3 class="text-lg font-medium text-gray-900 mb-3">Account Admin Details</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input v-model="form.name" type="text" required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"> Email *</label>
              <input v-model="form.email" type="email" required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              <p class="text-xs text-gray-500 mt-1">You'll receive a password reset link after approval</p>
            </div>
          </div>

          <!-- Additional  Admins (inside Account Admin Details) -->
          <div class="mt-6">
            <div class="flex items-center justify-between mb-3">
              <div>
                <h4 class="text-base font-medium text-gray-900">Additional  Admins</h4>
                <p class="text-sm text-gray-600 mt-1">Optional: Add more admins who will have full access to manage the organization</p>
              </div>
              <button type="button" @click="addAdmin"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Add Admin
              </button>
            </div>
            
            <div v-if="additionalAdmins.length === 0" class="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p class="text-sm text-gray-500">No additional admins added yet. Click "Add Admin" to add more.</p>
            </div>
            
            <div v-else class="space-y-4">
              <div v-for="(admin, index) in additionalAdmins" :key="index"
                class="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div class="flex items-start justify-between mb-3">
                  <h4 class="text-sm font-semibold text-gray-700">Admin {{ index + 1 }}</h4>
                  <button type="button" @click="removeAdmin(index)"
                    class="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Remove
                  </button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input v-model="admin.name" type="text" required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input v-model="admin.email" type="email" required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Organization Information -->
        <div class="border-t pt-4">
          <h3 class="text-lg font-medium text-gray-900 mb-3">Organization Details</h3>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Organization Name *</label>
            <input v-model="form.organizationName" type="text" required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Organization Type *</label>
            <select v-model="form.organizationType" required :disabled="!form.platformId || loadingTypes"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed">
              <option value="">{{ loadingTypes ? 'Loading types...' : (form.platformId ? 'Select organization type...' : 'Please select a platform first') }}</option>
              <option v-for="type in organizationTypes" :key="type._id" :value="type._id">
                {{ type.icon }} {{ type.name }} - {{ type.description }}
              </option>
            </select>
            <p v-if="organizationTypes.length === 0 && form.platformId && !loadingTypes" class="text-sm text-amber-600 mt-1">
              No organization types available for this platform. Please contact the administrator.
            </p>
          </div>
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea v-model="form.organizationDescription" rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
          </div>
        </div>

        <button type="submit" :disabled="isSubmitting || organizationTypes.length === 0"
          class="w-full h-16 text-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 rounded-xl transition flex items-center justify-center">
          <span v-if="isSubmitting" class="mr-2">
            <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          {{ isSubmitting ? 'Registering...' : 'Register Organization' }}
        </button>
      </form>

      <!-- Success/Error Messages -->
      <div v-if="successMessage" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div class="flex items-start">
          <svg class="w-5 h-5 text-green-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <div class="flex-1">
            <h4 class="text-sm font-medium text-green-800">Registration Successful!</h4>
            <p class="text-sm text-green-700 mt-1">{{ successMessage }}</p>
            <p class="text-sm text-green-700 mt-2">You can now <NuxtLink to="/login" class="underline font-medium">login</NuxtLink> to your account.</p>
          </div>
        </div>
      </div>

      <div v-if="errorMessage" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-start">
          <svg class="w-5 h-5 text-red-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <div class="flex-1">
            <h4 class="text-sm font-medium text-red-800">Registration Failed</h4>
            <p class="text-sm text-red-700 mt-1">{{ errorMessage }}</p>
          </div>
        </div>
      </div>

      <div class="mt-6 text-center text-sm text-gray-600">
        Already have an account? <NuxtLink to="/login" class="text-blue-600 hover:text-blue-700 font-medium">Login here</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
// This page is public - no authentication required
definePageMeta({
  middleware: []
})

const form = ref({
  name: '',
  email: '',
  organizationName: '',
  organizationDescription: '',
  organizationType: '',
  platformId: ''
})

const additionalAdmins = ref([])

const successMessage = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)
const platforms = ref([])
const organizationTypes = ref([])
const loadingTypes = ref(false)

onMounted(async () => {
  try {
    const response = await $fetch('/api/platforms/list')
    if (response.success) {
      platforms.value = response.platforms
    }
  } catch (error) {
    errorMessage.value = 'Failed to load platforms.'
  }
})

const addAdmin = () => {
  additionalAdmins.value.push({ name: '', email: '' })
}

const removeAdmin = (index) => {
  additionalAdmins.value.splice(index, 1)
}

const validateEmails = () => {
  const emails = [form.value.email, ...additionalAdmins.value.map(a => a.email)].filter(e => e)
  const uniqueEmails = new Set(emails.map(e => e.toLowerCase()))
  return uniqueEmails.size === emails.length
}

const onPlatformChange = async () => {
  organizationTypes.value = []
  form.value.organizationType = ''
  errorMessage.value = ''
  successMessage.value = ''
  
  if (!form.value.platformId) {
    return
  }
  
  loadingTypes.value = true
  try {
    const response = await $fetch(`/api/organization-types?platformId=${form.value.platformId}`)
    if (response.success) {
      organizationTypes.value = response.organizationTypes
    }
  } catch (error) {
    console.error('Failed to load organization types:', error)
    errorMessage.value = 'Failed to load organization types.'
  } finally {
    loadingTypes.value = false
  }
}

const submitRegistration = async () => {
  successMessage.value = ''
  errorMessage.value = ''
  
  // Validate unique emails
  if (!validateEmails()) {
    errorMessage.value = 'All email addresses must be unique'
    return
  }
  
  // Validate additional admins have complete data
  const incompleteAdmins = additionalAdmins.value.filter(a => !a.name || !a.email)
  if (incompleteAdmins.length > 0) {
    errorMessage.value = 'Please fill in all fields for additional admins or remove empty entries'
    return
  }
  
  isSubmitting.value = true

  try {
    const response = await $fetch('/api/public/register-organization', {
      method: 'POST',
      body: {
        ...form.value,
        additionalAdmins: additionalAdmins.value
      }
    })
    
    if (response.success) {
      successMessage.value = response.message
      // Reset form
      form.value = {
        name: '',
        email: '',
        organizationName: '',
        organizationDescription: '',
        organizationType: '',
        platformId: ''
      }
      additionalAdmins.value = []
      organizationTypes.value = []
    }
  } catch (err) {
    errorMessage.value = err.data?.message || err.statusMessage || 'Registration failed. Please try again.'
    console.error('Registration error:', err)
  } finally {
    isSubmitting.value = false
  }
}
</script>




