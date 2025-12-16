<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-lg">
      <div class="text-center mb-6">
        <h1 class="text-3xl font-semibold text-blue-700 mb-2">
          {{ isAdminUser || isSuperAdmin ? 'Create New Organization' : 'Register Your Organization' }}
        </h1>
        <p class="text-sm text-gray-600">
          {{ isAdminUser 
            ? 'Create a new organization under your platform. Choose trust level for immediate activation or document verification.' 
            : isSuperAdmin
            ? 'Create a new organization with full access to all organization types across all platforms.'
            : 'Create your organization account. Your registration will be reviewed and approved by the platform administrator.' 
          }}
        </p>
      </div>
      
      <form @submit.prevent="submitRegistration" class="space-y-5">
        <!-- Platform Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Select Platform *</label>
          <select v-model="form.platformId" required @change="onPlatformChange"
            :disabled="isAdminUser"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed">
            <option value="">Choose a platform...</option>
            <option v-for="platform in platforms" :key="platform.id" :value="platform.id">
              {{ platform.name }}
            </option>
          </select>
          <p v-if="isAdminUser" class="text-xs text-blue-600 mt-1">
            ✓ Creating organization for your assigned platform
          </p>
        </div>
        
        <!-- Trust Level (Platform Admin Only) -->
        <div v-if="isPlatformAdmin" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Organization Trust Level *</label>
          <div class="space-y-2">
            <label class="flex items-start space-x-3 cursor-pointer">
              <input type="radio" v-model="form.trustLevel" value="high" class="mt-1" />
              <div>
                <div class="font-medium text-gray-900">✅ Trusted Partner (Immediate Activation)</div>
                <div class="text-sm text-gray-600">Organization will be approved and active immediately. Use for known, verified partners.</div>
              </div>
            </label>
            <label class="flex items-start space-x-3 cursor-pointer">
              <input type="radio" v-model="form.trustLevel" value="low" class="mt-1" />
              <div>
                <div class="font-medium text-gray-900">📋 Requires Verification (Pending Documents)</div>
                <div class="text-sm text-gray-600">Organization will be pending until required documents are submitted and verified.</div>
              </div>
            </label>
          </div>
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
            <label class="block text-sm font-medium text-gray-700 mb-3">Organization Type *</label>
            
            <!-- Super Admin Badge -->
            <div v-if="isSuperAdmin" class="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div class="flex items-center gap-2 text-purple-700">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span class="font-semibold">Super Admin Access: All organization types available</span>
              </div>
            </div>
            
            <!-- Platform/Org Admin Badge -->
            <div v-else-if="isPlatformAdmin || isOrgAdmin" class="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div class="flex items-center gap-2 text-blue-700">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span class="font-medium">Showing organization types configured for your platform</span>
              </div>
            </div>
            
            <!-- Loading State -->
            <div v-if="loadingTypes" class="flex items-center justify-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
              <span class="text-gray-600">Loading organization types...</span>
            </div>
            
            <!-- No Platform Selected -->
            <div v-else-if="!form.platformId" class="py-8 bg-blue-50 rounded-lg border border-blue-200 text-center">
              <svg class="w-12 h-12 text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-sm text-blue-700">Please select a platform first</p>
            </div>
            
            <!-- No Types Available -->
            <div v-else-if="organizationTypes.length === 0" class="py-8 bg-amber-50 rounded-lg border border-amber-200 text-center">
              <svg class="w-12 h-12 text-amber-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <p class="text-sm text-amber-700 font-medium mb-1">No organization types available</p>
              <p class="text-xs text-amber-600">Please contact the platform administrator to configure organization types.</p>
            </div>
            
            <!-- Organization Type Cards -->
            <div v-else class="space-y-3">
              <label v-for="type in organizationTypes" :key="type._id"
                class="flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                :class="form.organizationType === type._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'">
                <input type="radio" v-model="form.organizationType" :value="type._id" required class="mt-1" />
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-2xl">{{ type.icon }}</span>
                    <span class="font-semibold text-gray-900">{{ type.name }}</span>
                    <span v-if="type.category" class="text-xs px-2 py-1 rounded-full"
                      :class="{
                        'bg-blue-100 text-blue-700': type.category === 'healthcare',
                        'bg-purple-100 text-purple-700': type.category === 'hospitality',
                        'bg-green-100 text-green-700': type.category === 'education',
                        'bg-orange-100 text-orange-700': type.category === 'logistics',
                        'bg-gray-100 text-gray-700': type.category === 'other'
                      }">
                      {{ type.category }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600">{{ type.description }}</p>
                </div>
              </label>
            </div>
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
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

// Detect if admin user (platform or org admin) is creating organization
const isPlatformAdmin = computed(() => {
  return authStore.isAuthenticated && authStore.user?.role === 'platform_admin'
})

const isOrgAdmin = computed(() => {
  return authStore.isAuthenticated && authStore.user?.role === 'organization_admin'
})

const isSuperAdmin = computed(() => {
  return authStore.isAuthenticated && authStore.user?.role === 'super_admin'
})

const isAdminUser = computed(() => {
  return isPlatformAdmin.value || isOrgAdmin.value
})

// Auto-select platform for platform admin and org admin
const form = ref({
  name: '',
  email: '',
  organizationName: '',
  organizationDescription: '',
  organizationType: '',
  platformId: (isPlatformAdmin.value || isOrgAdmin.value) ? (authStore.user?.platformId || '') : '',
  trustLevel: 'low' // For platform admin: 'high' = trusted partner, 'low' = requires verification
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

const navigateToOrgTypes = () => {
  if (form.value.platformId) {
    const url = `/superadmin/platforms/${form.value.platformId}-organization-types`
    console.log('Navigating to:', url)
    window.open(url, '_blank')
  }
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
    let endpoint
    const userRole = authStore.user?.role
    
    // Role-based endpoint selection
    if (userRole === 'super_admin') {
      // Super Admin: ALL organization types (unrestricted)
      endpoint = '/api/organization-types?scope=all&includeInactive=false'
    } else if (userRole === 'platform_admin' || userRole === 'organization_admin') {
      // Platform Admin / Org Admin: Restricted to their platform's configured types
      endpoint = `/api/organization-types?platformId=${form.value.platformId}`
    } else {
      // Public users: Restricted to selected platform's types
      endpoint = `/api/organization-types?platformId=${form.value.platformId}`
    }
    
    const response = await $fetch(endpoint)
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
    // Use different endpoint based on user type
    const endpoint = isPlatformAdmin.value 
      ? '/api/platform/organization/register'  // Platform admin - with trust level
      : '/api/public/register-organization'     // Public - requires approval
    
    const response = await $fetch(endpoint, {
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
        platformId: isPlatformAdmin.value ? (authStore.user?.platformId || '') : '',
        trustLevel: 'low'
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

// Page is accessible to public users for registration
// Platform/Super admins can also use it to create organizations for their platform
definePageMeta({
  middleware: []
})
</script>




