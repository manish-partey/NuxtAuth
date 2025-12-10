<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-lg">
      <h1 class="text-3xl font-semibold text-center text-blue-700 mb-6">Register Your Organization</h1>
      <form @submit.prevent="submitRegistration" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Select Platform *</label>
          <select v-model="selectedPlatform" required @change="onPlatformChange"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Choose a platform...</option>
            <option v-for="platform in platforms" :key="platform.id" :value="platform.id">
              {{ platform.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Organization Name *</label>
          <input v-model="orgName" type="text" required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Organization Type *</label>
          <select v-model="orgTypeId" required :disabled="!selectedPlatform || loadingTypes"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed">
            <option value="">{{ loadingTypes ? 'Loading types...' : (selectedPlatform ? 'Select organization type...' : 'Please select a platform first') }}</option>
            <option v-for="type in organizationTypes" :key="type._id" :value="type._id">
              {{ type.icon }} {{ type.name }} - {{ type.description }}
            </option>
          </select>
          <p v-if="organizationTypes.length === 0 && selectedPlatform && !loadingTypes" class="text-sm text-amber-600 mt-1">
            No organization types available for this platform. Please contact the administrator.
          </p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Admin Name *</label>
          <input v-model="adminName" type="text" required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Admin Email *</label>
          <input v-model="adminEmail" type="email" required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <button type="submit" :disabled="isSubmitting"
          class="w-full h-16 text-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 rounded-xl transition flex items-center justify-center">
          <span v-if="isSubmitting" class="mr-2">
            <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          {{ isSubmitting ? 'Validating...' : 'Submit' }}
        </button>
      </form>
      <div v-if="message" :class="messageClass">{{ message }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const selectedPlatform = ref('');
const orgName = ref('');
const orgTypeId = ref('');
const adminName = ref('');
const adminEmail = ref('');
const message = ref('');
const isSubmitting = ref(false);
const platforms = ref([]);
const organizationTypes = ref([]);
const loadingTypes = ref(false);

onMounted(async () => {
  try {
    const response = await $fetch('/api/platforms/list');
    if (response.success) {
      platforms.value = response.platforms;
    }
  } catch (error) {
    message.value = 'Failed to load platforms.';
  }
});

const onPlatformChange = async () => {
  organizationTypes.value = [];
  orgTypeId.value = '';
  message.value = '';
  
  if (!selectedPlatform.value) {
    return;
  }
  
  loadingTypes.value = true;
  try {
    const response = await $fetch(`/api/organization-types?platformId=${selectedPlatform.value}`);
    if (response.success) {
      organizationTypes.value = response.organizationTypes;
    }
  } catch (error) {
    console.error('Failed to load organization types:', error);
    message.value = 'Failed to load organization types.';
  } finally {
    loadingTypes.value = false;
  }
};

const submitRegistration = async () => {
  message.value = '';
  isSubmitting.value = true;
  try {
    const registrationData = {
      platformId: selectedPlatform.value,
      orgName: orgName.value,
      organizationTypeId: orgTypeId.value,
      adminName: adminName.value,
      adminEmail: adminEmail.value
    };
    const res = await $fetch('/api/platform/organization/register', {
      method: 'POST',
      body: registrationData,
    });
    
    message.value = res.message;
    selectedPlatform.value = '';
    orgName.value = '';
    orgTypeId.value = '';
    organizationTypes.value = [];
    adminName.value = '';
    adminEmail.value = '';
  } catch (err) {
    message.value = err.data?.message || err.statusMessage || 'Registration failed.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>




