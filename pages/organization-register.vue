<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-xl bg-white p-8 rounded-2xl shadow-lg">
      <h1 class="text-3xl font-semibold text-center text-blue-700 mb-6">Register Your Organization</h1>

      <form @submit.prevent="registerOrg" class="space-y-5">
        <!-- Platform Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Select Platform *</label>
          <select v-model="selectedPlatform" 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required>
            <option value="">Choose a platform...</option>
            <option v-for="platform in platforms" :key="platform.id" :value="platform.id">
              {{ platform.name }}
            </option>
          </select>
          <p v-if="selectedPlatformDetails" class="text-sm text-gray-600 mt-1">
            {{ selectedPlatformDetails.description }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Organization Name *</label>
          <input v-model="orgName" type="text" placeholder="e.g. Acme Corp"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Organization Type *</label>
          <select v-model="orgType" 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required>
            <option value="">Select organization type...</option>
            <option value="logistics">Logistics Company</option>
            <option value="freight">Freight Forwarder</option>
            <option value="shipping">Shipping Line</option>
            <option value="port">Port Authority</option>
            <option value="customs">Customs Broker</option>
            <option value="warehouse">Warehouse</option>
            <option value="manufacturer">Manufacturer</option>
            <option value="retailer">Retailer</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Organization Domain *</label>
          <input v-model="orgDomain" type="text" placeholder="e.g. acme.com"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required />
          <p class="text-xs text-gray-500 mt-1">This should be your company's primary domain</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Admin Name *</label>
          <input v-model="adminName" type="text" placeholder="John Doe"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Admin Email *</label>
          <input v-model="adminEmail" type="email" placeholder="admin@acme.com"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required />
          <p class="text-xs text-gray-500 mt-1">You'll use this email to log in as the organization admin</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Admin Password *</label>
          <input v-model="adminPassword" type="password" placeholder="••••••••" minlength="8"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required />
          <p class="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
        </div>

        <button type="submit" :disabled="isSubmitting"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center">
          <span v-if="isSubmitting" class="mr-2">
            <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          {{ isSubmitting ? 'Submitting...' : 'Register Organization' }}
        </button>
      </form>

      <!-- Success/Error Messages -->
      <div v-if="message" class="mt-6 p-4 rounded-lg" :class="messageClass">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg v-if="isSuccess" class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium">{{ message }}</p>
          </div>
        </div>
      </div>

      <!-- Information Box -->
      <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-blue-800">Registration Process</h3>
            <div class="mt-2 text-sm text-blue-700">
              <ul class="list-disc list-inside space-y-1">
                <li>Your registration will be reviewed by the platform administrator</li>
                <li>You'll receive an email notification once approved</li>
                <li>After approval, verify your email to activate your admin account</li>
                <li>Once verified, you can start adding users to your organization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// Form data
const selectedPlatform = ref('');
const orgName = ref('');
const orgType = ref('');
const orgDomain = ref('');
const adminName = ref('');
const adminEmail = ref('');
const adminPassword = ref('');

// UI state
const message = ref('');
const isSubmitting = ref(false);
const isSuccess = ref(false);
const platforms = ref([]);

// Computed properties
const selectedPlatformDetails = computed(() => {
  if (!selectedPlatform.value) return null;
  return platforms.value.find(p => p.id === selectedPlatform.value);
});

const messageClass = computed(() => {
  return isSuccess.value 
    ? 'bg-green-50 border border-green-200 text-green-800'
    : 'bg-red-50 border border-red-200 text-red-800';
});

// Load platforms on component mount
onMounted(async () => {
  try {
    const response = await $fetch('/api/platforms/list');
    if (response.success) {
      platforms.value = response.platforms;
    }
  } catch (error) {
    console.error('Failed to load platforms:', error);
    message.value = 'Failed to load platforms. Please refresh the page.';
    isSuccess.value = false;
  }
});

const registerOrg = async () => {
  message.value = '';
  isSubmitting.value = true;
  
  try {
    const res = await $fetch('/api/platform/organization/register', {
      method: 'POST',
      body: {
        platformId: selectedPlatform.value,
        orgName: orgName.value,
        orgType: orgType.value,
        orgDomain: orgDomain.value,
        adminName: adminName.value,
        adminEmail: adminEmail.value,
        adminPassword: adminPassword.value,
      },
    });
    
    message.value = res.message;
    isSuccess.value = true;
    
    // Clear form on success
    selectedPlatform.value = '';
    orgName.value = '';
    orgType.value = '';
    orgDomain.value = '';
    adminName.value = '';
    adminEmail.value = '';
    adminPassword.value = '';
    
  } catch (err) {
    message.value = err.data?.message || err.statusMessage || 'Registration failed. Please try again.';
    isSuccess.value = false;
  } finally {
    isSubmitting.value = false;
  }
};
</script>
