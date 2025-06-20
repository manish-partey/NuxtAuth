<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

interface Platform {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
}

const platforms = ref<Platform[]>([]);
const loading = ref(false);
const error = ref('');
const router = useRouter();

async function fetchPlatforms() {
  loading.value = true;
  error.value = '';
  try {
    // Adjust API path as per your backend
    platforms.value = await $fetch('/api/platform/list');
  } catch (e) {
    error.value = 'Failed to load platforms.';
  } finally {
    loading.value = false;
  }
}

function goToEdit(id: string) {
  router.push(`/superadmin/platforms/${id}/edit`);
}

onMounted(() => {
  fetchPlatforms();
});
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Platforms</h1>

    <button
      @click="router.push('/superadmin/create-platform')"
      class="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      + Create New Platform
    </button>

    <div v-if="loading" class="text-gray-500">Loading platforms...</div>
    <div v-if="error" class="text-red-600">{{ error }}</div>

    <table v-if="!loading && platforms.length" class="w-full border border-gray-300 rounded">
      <thead class="bg-gray-100">
        <tr>
          <th class="border border-gray-300 px-4 py-2 text-left">Name</th>
          <th class="border border-gray-300 px-4 py-2 text-left">Description</th>
          <th class="border border-gray-300 px-4 py-2 text-left">Created At</th>
          <th class="border border-gray-300 px-4 py-2 text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="platform in platforms" :key="platform._id" class="hover:bg-gray-50 cursor-pointer">
          <td class="border border-gray-300 px-4 py-2">{{ platform.name }}</td>
          <td class="border border-gray-300 px-4 py-2">{{ platform.description || '-' }}</td>
          <td class="border border-gray-300 px-4 py-2">{{ new Date(platform.createdAt).toLocaleDateString() }}</td>
          <td class="border border-gray-300 px-4 py-2 text-center">
            <button
              @click.stop="goToEdit(platform._id)"
              class="text-blue-600 hover:underline"
            >
              Edit
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="!loading && !platforms.length" class="text-gray-500">No platforms found.</div>
  </div>
</template>
