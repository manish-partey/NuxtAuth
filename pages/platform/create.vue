<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

definePageMeta({
  middleware: ['auth-guard'],
  roles: ['platform_admin', 'super_admin']
});

const router = useRouter();
const name = ref('');
const type = ref('');
const description = ref('');
const error = ref('');
const loading = ref(false);

const platformTypes = ['grocery', 'college', 'doctor', 'hospital', 'logistics', 'freight', 'shipping', 'hotel', 'other'];

async function createPlatform() {
  error.value = '';
  if (!name.value.trim() || !type.value) {
    error.value = 'Please fill all required fields.';
    return;
  }

  loading.value = true;
  try {
    const response: any = await $fetch('/api/platform-admin/platforms', {
      method: 'POST',
      credentials: 'include',
      body: {
        name: name.value.trim(),
        type: type.value,
        description: description.value.trim(),
      },
    });

    if (response.success) {
      router.push('/platform');
    } else {
      error.value = response.message || 'Failed to create platform.';
    }
  } catch (e: any) {
    error.value = e.data?.message || e.statusMessage || 'Failed to create platform.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="p-6 max-w-lg mx-auto">
    <h1 class="text-2xl font-bold mb-6">Create New Platform</h1>
    <p class="text-gray-600 mb-6">
      Create a new platform for your business vertical. This will allow you to manage organizations and users under this platform.
    </p>

    <form @submit.prevent="createPlatform" class="space-y-4">
      <div>
        <label for="name" class="block font-semibold mb-1">Platform Name *</label>
        <input
          id="name"
          type="text"
          v-model="name"
          placeholder="e.g., Hotel Management Platform"
          class="w-full border border-gray-300 rounded px-3 py-2"
          required
        />
        <p class="text-sm text-gray-500 mt-1">
          Choose a descriptive name for your platform that represents your business vertical
        </p>
      </div>

      <div>
        <label for="type" class="block font-semibold mb-1">Platform Type *</label>
        <select
          id="type"
          v-model="type"
          class="w-full border border-gray-300 rounded px-3 py-2"
          required
        >
          <option value="" disabled>Select Platform Type</option>
          <option v-for="pt in platformTypes" :key="pt" :value="pt">
            {{ pt.replace(/^./, str => str.toUpperCase()) }}
          </option>
        </select>
        <p class="text-sm text-gray-500 mt-1">
          Select the industry type that best describes your platform
        </p>
      </div>

      <div>
        <label for="description" class="block font-semibold mb-1">Description (Optional)</label>
        <textarea
          id="description"
          v-model="description"
          rows="3"
          placeholder="Brief description of the platform and its purpose..."
          class="w-full border border-gray-300 rounded px-3 py-2"
        ></textarea>
        <p class="text-sm text-gray-500 mt-1">
          Provide a brief overview of what this platform will manage
        </p>
      </div>

      <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>

      <div class="flex space-x-4 pt-4">
        <button
          type="button"
          @click="router.push('/platform')"
          class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          :disabled="loading"
        >
          {{ loading ? 'Creating...' : 'Create Platform' }}
        </button>
      </div>
    </form>

    <div class="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 class="text-sm font-semibold text-blue-900 mb-2">What happens next?</h3>
      <ul class="text-sm text-blue-800 space-y-1">
        <li>• Your platform will be created with an approved status</li>
        <li>• You can start creating organizations under this platform</li>
        <li>• Set up document requirements for organizations</li>
        <li>• Manage users across all organizations in your platform</li>
      </ul>
    </div>
  </div>
</template>