<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Stats {
  platformsCount: number;
  organizationsCount: number;
  usersCount: number;
  invitesCount: number;
}

const stats = ref<Stats>({
  platformsCount: 0,
  organizationsCount: 0,
  usersCount: 0,
  invitesCount: 0,
});
const loading = ref(false);
const error = ref('');

async function fetchStats() {
  loading.value = true;
  error.value = '';
  try {
    const data = await $fetch('/api/superadmin/stats');
    stats.value = data;
  } catch {
    error.value = 'Failed to load statistics.';
  } finally {
    loading.value = false;
  }
}

onMounted(fetchStats);
</script>

<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold">Super Admin Dashboard Overview</h1>

    <div v-if="loading" class="text-gray-500">Loading statistics...</div>
    <div v-if="error" class="text-red-600">{{ error }}</div>

    <div v-if="!loading && !error" class="grid grid-cols-1 sm:grid-cols-4 gap-6">
      <div class="bg-white shadow p-4 rounded text-center">
        <h2 class="text-lg font-semibold">Platforms</h2>
        <p class="text-3xl">{{ stats.platformsCount }}</p>
      </div>
      <div class="bg-white shadow p-4 rounded text-center">
        <h2 class="text-lg font-semibold">Organizations</h2>
        <p class="text-3xl">{{ stats.organizationsCount }}</p>
      </div>
      <div class="bg-white shadow p-4 rounded text-center">
        <h2 class="text-lg font-semibold">Users</h2>
        <p class="text-3xl">{{ stats.usersCount }}</p>
      </div>
      <div class="bg-white shadow p-4 rounded text-center">
        <h2 class="text-lg font-semibold">Pending Invites</h2>
        <p class="text-3xl">{{ stats.invitesCount }}</p>
      </div>
    </div>
  </div>
</template>
