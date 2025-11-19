<!-- pages/profile.vue -->
<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="bg-white shadow-lg rounded-lg overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
        <div class="flex items-center space-x-4">
          <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-white">My Profile</h1>
            <p class="text-blue-100">Manage your personal information and preferences</p>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="p-6">
        <!-- Loading state -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-gray-600">Loading profile...</span>
        </div>
        
        <!-- Error state -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            {{ error }}
          </div>
        </div>
        
        <!-- Profile Content -->
        <div v-else-if="profile" class="space-y-6">
          <!-- Action Buttons -->
          <div class="flex justify-between items-center">
            <div class="flex space-x-3">
              <button 
                v-if="!isEditing"
                @click="startEditing"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
              
              <button 
                v-if="isEditing"
                @click="cancelEditing"
                class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
            
            <button 
              @click="refreshProfile"
              class="text-gray-500 hover:text-gray-700 transition flex items-center"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          <!-- View Mode -->
          <div v-if="!isEditing" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <p class="text-lg text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">{{ profile.name || 'Not provided' }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <p class="text-lg text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">{{ profile.email }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  :class="getRoleBadgeClass(profile.role)">
                  {{ formatRole(profile.role) }}
                </span>
              </div>
            </div>

            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <p class="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg min-h-[100px]">
                  {{ profile.bio || 'No bio provided yet. Click "Edit Profile" to add one.' }}
                </p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                <p class="text-lg text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
                  {{ formatDate(profile.createdAt) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Edit Mode -->
          <form v-if="isEditing" @submit.prevent="updateProfile" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-6">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    v-model="editForm.name"
                    type="text"
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    v-model="editForm.email"
                    type="email"
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div class="space-y-6">
                <div>
                  <label for="bio" class="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    v-model="editForm.bio"
                    rows="4"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                    placeholder="Tell us about yourself..."
                    maxlength="500"
                  ></textarea>
                  <p class="mt-1 text-sm text-gray-500">
                    {{ (editForm.bio || '').length }}/500 characters
                  </p>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                :disabled="saving"
                class="flex-1 sm:flex-none bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center"
              >
                <svg v-if="saving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </button>
              
              <button
                type="button"
                @click="cancelEditing"
                :disabled="saving"
                class="flex-1 sm:flex-none bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>

          <!-- Success/Error Messages -->
          <div v-if="successMessage" class="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              {{ successMessage }}
            </div>
          </div>

          <div v-if="updateError" class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              {{ updateError }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Define what our profile data looks like
interface Profile {
  id: string
  name: string
  email: string
  role: string
  bio?: string
  createdAt?: string
}

interface EditForm {
  name: string
  email: string
  bio: string
}

// Reactive variables
const profile = ref<Profile | null>(null)
const loading = ref(false)
const error = ref('')
const isEditing = ref(false)
const saving = ref(false)
const successMessage = ref('')
const updateError = ref('')

// Edit form data
const editForm = ref<EditForm>({
  name: '',
  email: '',
  bio: ''
})

// Function to fetch profile data
const fetchProfile = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await $fetch('/api/user/profile')
    
    if (response.success) {
      profile.value = response.user
    } else {
      error.value = 'Failed to load profile'
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Something went wrong'
  } finally {
    loading.value = false
  }
}

// Start editing mode
const startEditing = () => {
  if (profile.value) {
    editForm.value = {
      name: profile.value.name || '',
      email: profile.value.email || '',
      bio: profile.value.bio || ''
    }
  }
  isEditing.value = true
  successMessage.value = ''
  updateError.value = ''
}

// Cancel editing mode
const cancelEditing = () => {
  isEditing.value = false
  successMessage.value = ''
  updateError.value = ''
  // Reset form to original values
  if (profile.value) {
    editForm.value = {
      name: profile.value.name || '',
      email: profile.value.email || '',
      bio: profile.value.bio || ''
    }
  }
}

// Update profile
const updateProfile = async () => {
  saving.value = true
  updateError.value = ''
  successMessage.value = ''

  try {
    const response = await $fetch('/api/user/profile', {
      method: 'PUT',
      body: {
        name: editForm.value.name,
        email: editForm.value.email,
        bio: editForm.value.bio
      }
    })

    if (response.success) {
      successMessage.value = 'Profile updated successfully!'
      isEditing.value = false
      // Refresh the profile data
      await fetchProfile()
    } else {
      updateError.value = 'Failed to update profile'
    }
  } catch (err: any) {
    updateError.value = err.data?.message || 'Update failed. Please try again.'
  } finally {
    saving.value = false
  }
}

// Function to refresh profile (called by button)
const refreshProfile = () => {
  fetchProfile()
}

// Utility functions
const formatRole = (role: string) => {
  return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const getRoleBadgeClass = (role: string) => {
  const baseClasses = 'bg-blue-100 text-blue-800'
  switch (role) {
    case 'super_admin':
      return 'bg-red-100 text-red-800'
    case 'platform_admin':
      return 'bg-purple-100 text-purple-800'
    case 'organization_admin':
      return 'bg-green-100 text-green-800'
    default:
      return baseClasses
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

// Clear messages after some time
watch([successMessage, updateError], () => {
  if (successMessage.value || updateError.value) {
    setTimeout(() => {
      successMessage.value = ''
      updateError.value = ''
    }, 5000)
  }
})

// Load profile when page opens
onMounted(() => {
  fetchProfile()
})
</script>