<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const name = ref('');
const type = ref('');
const error = ref('');
const loading = ref(false);

const platformTypes = ['grocery', 'college', 'doctor', 'hospital', 'other']; // Extend as needed

async function createPlatform() {
  error.value = '';
  if (!name.value.trim() || !type.value) {
    error.value = 'Please enter all required fields.';
    return;
  }
  loading.value = true;
  try {
    // Correct API path without '.post' suffix
    const response = await $fetch('/api/platform/create', {
      method: 'POST',
      body: {
        name: name.value.trim(),
        type: type.value, // You may want to handle this on backend
      },
    });

    if (response.success) {
      router.push('/superadmin/platforms');
    } else {
      error.value = response.message || 'Failed to create platform.';
    }
  } catch (e) {
    error.value = 'Failed to create platform.';
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
          class="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="e.g., Grocery Chain"
          required
        />
      </div>

      <div>
        <label for="type" class="block font-semibold mb-1">Platform Type</label>
        <select id="type" v-model="type" class="w-full border border-gray-300 rounded px-3 py-2" required>
          <option value="" disabled>Select Type</option>
          <option v-for="pt in platformTypes" :key="pt" :value="pt">{{ pt }}</option>
        </select>
      </div>

      <div v-if="error" class="text-red-600">{{ error }}</div>

      <button
        type="submit"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        :disabled="loading"
      >
        Create Platform
      </button>
    </form>
  </div>
</template>
