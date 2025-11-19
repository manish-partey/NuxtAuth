<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

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
    await $fetch('/api/superadmin/platforms', {
      method: 'POST',
      credentials: 'include',
      body: {
        name: name.value.trim(),
        type: type.value,
        description: description.value.trim(),
      },
    });
    router.push('/superadmin/platforms');
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

    <form @submit.prevent="createPlatform" class="space-y-4">
      <div>
        <label for="name" class="block font-semibold mb-1">Platform Name</label>
        <input
          id="name"
          type="text"
          v-model="name"
          placeholder="e.g., Hotel Booking Platform"
          class="w-full border border-gray-300 rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label for="type" class="block font-semibold mb-1">Platform Type</label>
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
      </div>

      <div>
        <label for="description" class="block font-semibold mb-1">Description (Optional)</label>
        <textarea
          id="description"
          v-model="description"
          rows="3"
          placeholder="Brief description of the platform..."
          class="w-full border border-gray-300 rounded px-3 py-2"
        ></textarea>
      </div>

      <div v-if="error" class="text-red-600">{{ error }}</div>

      <div class="flex space-x-4">
        <button
          type="button"
          @click="router.push('/superadmin/platforms')"
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
  </div>
</template>