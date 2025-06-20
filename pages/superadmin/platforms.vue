<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

interface Platform {
  _id: string;
  name: string;
  type: string;
  status: string;
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
    const response = await $fetch('/api/platform/list');
    if (response.success) {
      platforms.value = response.platforms;
    } else {
      error.value = response.message || 'Failed to load platforms.';
    }
  } catch (e) {
    error.value = 'Failed to load platforms.';
  } finally {
    loading.value = false;
  }
}

function goToPlatformDetails(id: string) {
  router.push(`/superadmin/platforms/${id}`);
}

onMounted(fetchPlatforms);
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Manage Platforms</h1>
    <p class="mb-6 text-gray-600">
      List of all industry-specific tenant platforms created by super admins.
    </p>

    <button
      @click="router.push('/superadmin/create-platform')"
      class="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
    >
      + Create New Platform
    </button>

    <div v-if="loading" class="text-gray-500">Loading platforms...</div>
    <div v-if="error" class="text-red-600">{{ error }}</div>

    <table v-if="!loading && platforms.length" class="w-full border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-100">
          <th class="border border-gray-300 p-2 text-left">Name</th>
          <th class="border border-gray-300 p-2 text-left">Type</th>
          <th class="border border-gray-300 p-2 text-left">Status</th>
          <th class="border border-gray-300 p-2 text-left">Created At</th>
          <th class="border border-gray-300 p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="platform in platforms"
          :key="platform._id"
          class="hover:bg-gray-50 cursor-pointer"
          @click="goToPlatformDetails(platform._id)"
        >
          <td class="border border-gray-300 p-2">{{ platform.name }}</td>
          <td class="border border-gray-300 p-2 capitalize">{{ platform.type }}</td>
          <td class="border border-gray-300 p-2 capitalize">{{ platform.status }}</td>
          <td class="border border-gray-300 p-2">{{ new Date(platform.createdAt).toLocaleDateString() }}</td>
          <td class="border border-gray-300 p-2 text-center">
            <button
              @click.stop="router.push(`/superadmin/platforms/${platform._id}/edit`)"
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
