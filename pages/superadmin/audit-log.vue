<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface AuditEntry {
  _id: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetName: string;
  timestamp: string;
}

const logs = ref<AuditEntry[]>([]);
const loading = ref(false);
const error = ref('');
const page = ref(1);
const pageSize = 20;
const totalPages = ref(1);

async function fetchLogs() {
  loading.value = true;
  error.value = '';
  try {
    const res = await $fetch('/api/audit/logs', {
      params: { page: page.value, pageSize },
      credentials: 'include' // ✅ Send cookies for auth
    });
    logs.value = res.logs;
    totalPages.value = res.totalPages;
  } catch {
    error.value = 'Failed to load audit logs.';
  } finally {
    loading.value = false;
  }
}

function prevPage() {
  if (page.value > 1) {
    page.value--;
    fetchLogs();
  }
}

function nextPage() {
  if (page.value < totalPages.value) {
    page.value++;
    fetchLogs();
  }
}

onMounted(fetchLogs);
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Audit Logs</h1>
    <p class="mb-6 text-gray-600">Track recent changes and actions by admins across the platform.</p>

    <div v-if="loading" class="text-gray-500">Loading logs...</div>
    <div v-if="error" class="text-red-600">{{ error }}</div>

    <table v-if="!loading && logs.length" class="w-full border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-100">
          <th class="border border-gray-300 p-2">Timestamp</th>
          <th class="border border-gray-300 p-2">Actor</th>
          <th class="border border-gray-300 p-2">Role</th>
          <th class="border border-gray-300 p-2">Action</th>
          <th class="border border-gray-300 p-2">Target</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="log in logs" :key="log._id">
          <td class="border border-gray-300 p-2">{{ new Date(log.timestamp).toLocaleString() }}</td>
          <td class="border border-gray-300 p-2">{{ log.actorName }}</td>
          <td class="border border-gray-300 p-2 capitalize">{{ log.actorRole.replace(/_/g, ' ') }}</td>
          <td class="border border-gray-300 p-2">{{ log.action }}</td>
          <td class="border border-gray-300 p-2">{{ log.targetType }}: {{ log.targetName }}</td>
        </tr>
      </tbody>
    </table>

    <div v-if="!loading && !logs.length" class="text-gray-500">No audit logs found.</div>

    <div class="mt-4 flex justify-between">
      <button @click="prevPage" :disabled="page === 1" class="px-3 py-1 bg-gray-300 rounded disabled:opacity-50">
        Previous
      </button>
      <div>Page {{ page }} / {{ totalPages }}</div>
      <button
        @click="nextPage"
        :disabled="page === totalPages"
        class="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  </div>
</template>
