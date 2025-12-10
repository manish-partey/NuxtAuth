<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface PlatformSettings {
  name: string;
  description: string;
  type: string;
  category: string;
  allowSelfRegistration: boolean;
  defaultUserRole: string;
  documentRetentionDays: number;
  notificationSettings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    webhookUrl: string;
  };
}

const settings = ref<PlatformSettings>({
  name: '',
  description: '',
  type: '',
  category: 'other',
  allowSelfRegistration: false,
  defaultUserRole: 'user',
  documentRetentionDays: 365,
  notificationSettings: {
    emailNotifications: true,
    smsNotifications: false,
    webhookUrl: ''
  }
});

const loading = ref(false);
const saving = ref(false);
const error = ref('');
const success = ref('');

const platformTypes = ['grocery', 'college', 'doctor', 'hospital', 'logistics', 'freight', 'shipping', 'hotel', 'other'];
const platformCategories = [
  { value: 'healthcare', label: 'Healthcare', description: 'Hospitals, clinics, medical facilities' },
  { value: 'hospitality', label: 'Hospitality', description: 'Hotels, resorts, restaurants' },
  { value: 'education', label: 'Education', description: 'Universities, colleges, schools' },
  { value: 'logistics', label: 'Logistics', description: 'Shipping, freight, cargo' },
  { value: 'other', label: 'Other', description: 'General purpose platform' }
];
const userRoles = ['user', 'organization_admin'];

async function loadSettings() {
  loading.value = true;
  error.value = '';
  try {
    const response: any = await $fetch('/api/platform-admin/settings', {
      credentials: 'include'
    }).catch(() => {
      // Fallback with mock data if API doesn't exist yet
      return {
        success: true,
        settings: {
          name: 'Hotel Booking Platform',
          description: 'Comprehensive hotel management platform',
          type: 'hotel',
          allowSelfRegistration: true,
          defaultUserRole: 'user',
          documentRetentionDays: 365,
          notificationSettings: {
            emailNotifications: true,
            smsNotifications: false,
            webhookUrl: ''
          }
        }
      };
    });

    if (response.success) {
      settings.value = response.settings;
    } else {
      error.value = response.message || 'Failed to load settings.';
    }
  } catch (e) {
    error.value = 'Failed to load settings.';
  } finally {
    loading.value = false;
  }
}

async function saveSettings() {
  saving.value = true;
  error.value = '';
  success.value = '';
  
  try {
    await $fetch('/api/platform-admin/settings', {
      method: 'PUT',
      credentials: 'include',
      body: settings.value
    });
    
    success.value = 'Settings saved successfully!';
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to save settings.';
  } finally {
    saving.value = false;
  }
}

onMounted(loadSettings);
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Platform Settings</h1>
    <p class="text-gray-600 mb-8">Configure your platform-wide settings and preferences</p>

    <div v-if="loading" class="text-gray-500">Loading settings...</div>

    <div v-if="success" class="mb-6 p-4 bg-green-50 border border-green-200 rounded text-green-700">
      {{ success }}
    </div>
    <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
      {{ error }}
    </div>

    <form v-if="!loading" @submit.prevent="saveSettings" class="space-y-8">
      <!-- Basic Platform Information -->
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
            <input v-model="settings.name" type="text" required
              class="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="e.g., Hotel Booking Platform" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Platform Type</label>
            <select v-model="settings.type" required
              class="w-full border border-gray-300 rounded px-3 py-2">
              <option value="">Select Type</option>
              <option v-for="type in platformTypes" :key="type" :value="type">
                {{ type.charAt(0).toUpperCase() + type.slice(1) }}
              </option>
            </select>
          </div>
        </div>
        
        <!-- Organization Type Category -->
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Organization Type Category
            <span class="text-red-500">*</span>
          </label>
          <select v-model="settings.category" required
            class="w-full border border-gray-300 rounded px-3 py-2">
            <option value="">Select Category</option>
            <option v-for="cat in platformCategories" :key="cat.value" :value="cat.value">
              {{ cat.label }} - {{ cat.description }}
            </option>
          </select>
          <p class="text-sm text-gray-500 mt-1">
            📌 This determines which organization types are available during registration.
            For example, 'Healthcare' shows Hospital, Clinic, Pharmacy types.
          </p>
          <div v-if="settings.category !== 'other'" class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
            <p class="text-sm text-blue-700">
              ℹ️ Organizations registering on this platform will only see <strong>{{ settings.category }}</strong> organization types.
            </p>
          </div>
        </div>
        
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea v-model="settings.description" rows="3"
            class="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Brief description of your platform"></textarea>
        </div>
      </div>

      <!-- User Management Settings -->
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
        <div class="space-y-4">
          <div class="flex items-center">
            <input v-model="settings.allowSelfRegistration" type="checkbox" 
              class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <label class="ml-3 text-sm text-gray-700">
              Allow self-registration for new users
            </label>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Default Role for New Users</label>
            <select v-model="settings.defaultUserRole"
              class="w-full md:w-64 border border-gray-300 rounded px-3 py-2">
              <option v-for="role in userRoles" :key="role" :value="role">
                {{ role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Document Settings -->
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Document Management</h3>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Document Retention Period (days)
          </label>
          <input v-model.number="settings.documentRetentionDays" type="number" min="1" max="3650"
            class="w-full md:w-64 border border-gray-300 rounded px-3 py-2"
            placeholder="365" />
          <p class="text-sm text-gray-500 mt-1">
            Documents will be automatically archived after this period
          </p>
        </div>
      </div>

      <!-- Notification Settings -->
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
        <div class="space-y-4">
          <div class="flex items-center">
            <input v-model="settings.notificationSettings.emailNotifications" type="checkbox" 
              class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <label class="ml-3 text-sm text-gray-700">
              Enable email notifications
            </label>
          </div>
          <div class="flex items-center">
            <input v-model="settings.notificationSettings.smsNotifications" type="checkbox" 
              class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <label class="ml-3 text-sm text-gray-700">
              Enable SMS notifications
            </label>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Webhook URL (optional)
            </label>
            <input v-model="settings.notificationSettings.webhookUrl" type="url"
              class="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="https://your-app.com/webhook" />
            <p class="text-sm text-gray-500 mt-1">
              Receive platform events via webhook notifications
            </p>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div class="flex justify-end">
        <button type="submit" :disabled="saving"
          class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
          {{ saving ? 'Saving...' : 'Save Settings' }}
        </button>
      </div>
    </form>
  </div>
</template>