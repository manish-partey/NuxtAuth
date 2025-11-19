<template>
  <div class="container mx-auto px-4 py-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">User Document Requirements</h1>
      <p class="mt-2 text-gray-600">Manage document requirements for user registration</p>
    </div>

    <!-- Organization-wide Settings -->
    <div class="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Organization-wide Document Requirements</h2>
      <p class="text-sm text-gray-600 mb-4">These settings apply to all new users in your organization</p>
      
      <div v-if="organizationWideSettings && organizationWideSettings.documentTypes.length > 0" class="space-y-4">
        <div 
          v-for="docType in organizationWideSettings.documentTypes" 
          :key="docType.id"
          class="border border-gray-200 rounded-lg p-4"
        >
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-medium text-gray-900">{{ docType.name }}</h4>
            <div class="flex items-center space-x-2">
              <span 
                class="text-sm px-2 py-1 rounded"
                :class="docType.finalRequired ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'"
              >
                {{ docType.finalRequired ? 'Required' : 'Optional' }}
              </span>
              <button
                @click="toggleOrganizationRequirement(docType)"
                :disabled="loading"
                class="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
              >
                Toggle
              </button>
            </div>
          </div>
          <p class="text-sm text-gray-600 mb-2">{{ docType.description }}</p>
          <div class="text-xs text-gray-500">
            <span v-if="docType.organizationRequired !== null">
              Organization setting: {{ docType.organizationRequired ? 'Required' : 'Optional' }} 
              (set {{ formatDate(docType.setAt) }})
            </span>
            <span v-else>
              Default: {{ docType.defaultRequired ? 'Required' : 'Optional' }}
            </span>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-8 text-gray-500">
        No user documents configured
      </div>
    </div>

    <!-- Individual User Requirements -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Individual User Requirements</h2>
      <p class="text-sm text-gray-600 mb-4">Customize document requirements for specific users</p>

      <!-- User Selection -->
      <div class="mb-6">
        <select 
          v-model="selectedUserId" 
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          @change="loadUserRequirements"
        >
          <option value="">Select a user...</option>
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.name }} ({{ user.email }})
          </option>
        </select>
      </div>

      <!-- Selected User Requirements -->
      <div v-if="selectedUser" class="space-y-4">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-blue-900 mb-1">{{ selectedUser.name }}</h3>
          <p class="text-blue-700">{{ selectedUser.email }}</p>
        </div>

        <div v-if="selectedUser.documentTypes.length > 0" class="space-y-4">
          <div 
            v-for="docType in selectedUser.documentTypes" 
            :key="docType.id"
            class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-medium text-gray-900">{{ docType.name }}</h4>
              <div class="flex items-center space-x-2">
                <span 
                  class="text-sm px-2 py-1 rounded"
                  :class="docType.finalRequired ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'"
                >
                  {{ docType.finalRequired ? 'Required' : 'Optional' }}
                </span>
                <span 
                  v-if="docType.scope"
                  class="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600"
                >
                  {{ docType.scope }}
                </span>
                <button
                  @click="toggleUserRequirement(docType)"
                  :disabled="loading"
                  class="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
                >
                  Toggle
                </button>
              </div>
            </div>
            <p class="text-sm text-gray-600 mb-2">{{ docType.description }}</p>
            <div class="text-xs text-gray-500">
              <span v-if="docType.customRequired !== null">
                Custom setting: {{ docType.customRequired ? 'Required' : 'Optional' }} 
                ({{ docType.scope || 'specific' }}, set {{ formatDate(docType.setAt) }})
              </span>
              <span v-else>
                Default: {{ docType.defaultRequired ? 'Required' : 'Optional' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="selectedUserId === ''" class="text-center py-8 text-gray-500">
        Please select a user to view their document requirements
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="message" class="mt-6 p-4 rounded-lg" :class="messageType === 'error' ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-green-50 border border-green-200 text-green-800'">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Layout
definePageMeta({
  layout: 'admin'
});

// Reactive data
const users = ref<any[]>([]);
const selectedUserId = ref('');
const selectedUser = ref<any>(null);
const organizationWideSettings = ref<any>(null);
const loading = ref(false);
const message = ref('');
const messageType = ref('success');

// Load users on component mount
onMounted(async () => {
  await loadUsersAndSettings();
});

const loadUsersAndSettings = async () => {
  try {
    loading.value = true;
    const response = await $fetch('/api/organization/user-document-requirements') as any;
    if (response.success && response.users && response.organizationWideSettings) {
      users.value = response.users;
      organizationWideSettings.value = response.organizationWideSettings;
    }
  } catch (error: any) {
    showMessage(error.data?.message || 'Failed to load users', 'error');
  } finally {
    loading.value = false;
  }
};

const loadUserRequirements = async () => {
  if (!selectedUserId.value) {
    selectedUser.value = null;
    return;
  }

  try {
    loading.value = true;
    const response = await $fetch(`/api/organization/user-document-requirements?userId=${selectedUserId.value}`) as any;
    if (response.success) {
      selectedUser.value = response.user;
    }
  } catch (error: any) {
    showMessage(error.data?.message || 'Failed to load user requirements', 'error');
  } finally {
    loading.value = false;
  }
};

const toggleOrganizationRequirement = async (docType: any) => {
  try {
    loading.value = true;
    const newRequired = !docType.finalRequired;
    
    const response = await $fetch('/api/organization/user-document-requirements', {
      method: 'POST',
      body: {
        documentTypeId: docType.id,
        required: newRequired,
        action: 'set'
      }
    });

    if (response.success) {
      // Update the local data
      docType.organizationRequired = newRequired;
      docType.finalRequired = newRequired;
      docType.setAt = new Date();
      
      showMessage(`Organization-wide document requirement updated successfully`, 'success');
      
      // Reload data to reflect changes
      await loadUsersAndSettings();
    }
  } catch (error: any) {
    showMessage(error.data?.message || 'Failed to update organization requirement', 'error');
  } finally {
    loading.value = false;
  }
};

const toggleUserRequirement = async (docType: any) => {
  try {
    loading.value = true;
    const newRequired = !docType.finalRequired;
    
    const response = await $fetch('/api/organization/user-document-requirements', {
      method: 'POST',
      body: {
        userId: selectedUserId.value,
        documentTypeId: docType.id,
        required: newRequired,
        action: 'set'
      }
    });

    if (response.success) {
      // Update the local data
      docType.customRequired = newRequired;
      docType.finalRequired = newRequired;
      docType.setAt = new Date();
      docType.scope = 'specific';
      
      showMessage(`User-specific document requirement updated successfully`, 'success');
    }
  } catch (error: any) {
    showMessage(error.data?.message || 'Failed to update user requirement', 'error');
  } finally {
    loading.value = false;
  }
};

const showMessage = (msg: string, type: 'success' | 'error') => {
  message.value = msg;
  messageType.value = type;
  setTimeout(() => {
    message.value = '';
  }, 5000);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};
</script>