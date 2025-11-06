<template>
  <div class="max-w-6xl mx-auto py-10 px-4">
    <div class="mb-8">
      <h1 class="text-4xl font-semibold text-gray-800 mb-2">Admin Dashboard</h1>
      <p v-if="authStore.user" class="text-gray-700">
        Welcome, <span class="font-medium">{{ authStore.user.name }}</span> ({{ authStore.user.role }})
      </p>
      <p v-else class="text-gray-500 italic">Loading admin data...</p>
    </div>

    <!-- Quick Links to Other Admin Sections -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <NuxtLink to="/admin/users" class="bg-white border hover:shadow-md transition rounded-xl p-5">
        <h2 class="text-xl font-semibold mb-2">Users</h2>
        <p class="text-sm text-gray-600">View and manage all users across platforms.</p>
      </NuxtLink>
      <NuxtLink to="/admin/platforms" class="bg-white border hover:shadow-md transition rounded-xl p-5">
        <h2 class="text-xl font-semibold mb-2">Platforms</h2>
        <p class="text-sm text-gray-600">Review all registered platforms and their admins.</p>
      </NuxtLink>
      <NuxtLink to="/admin/document-types" class="bg-white border hover:shadow-md transition rounded-xl p-5">
        <h2 class="text-xl font-semibold mb-2">Document Types</h2>
        <p class="text-sm text-gray-600">Configure required and optional documents for each layer.</p>
      </NuxtLink>
      <NuxtLink to="/admin/invites" class="bg-white border hover:shadow-md transition rounded-xl p-5">
        <h2 class="text-xl font-semibold mb-2">Invites</h2>
        <p class="text-sm text-gray-600">Track invitation status for users.</p>
      </NuxtLink>
    </div>

    <!-- User List Section -->
    <div class="bg-white rounded-xl shadow-md p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-semibold text-gray-800">Manage Users (Quick View)</h2>
        <button
          @click="fetchUsers"
          class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          Fetch All Users
        </button>
      </div>

      <p class="text-gray-600 mb-4">
        Only visible to roles: <code class="bg-gray-100 px-1 rounded">super_admin</code> or
        <code class="bg-gray-100 px-1 rounded">platform_admin</code>.
      </p>

      <div v-if="users.length" class="mt-4">
        <ul class="divide-y divide-gray-200">
          <li
            v-for="user in users"
            :key="user._id"
            class="py-2 flex justify-between items-center"
          >
            <div>
              <p class="font-semibold text-gray-800">{{ user.name }}</p>
              <p class="text-sm text-gray-600">{{ user.email }}</p>
            </div>
            <span
              class="inline-block px-3 py-1 text-xs font-medium rounded-full"
              :class="{
                'bg-blue-100 text-blue-800': user.role === 'admin',
                'bg-gray-100 text-gray-700': user.role === 'user',
                'bg-green-100 text-green-700': user.role === 'super_admin' || user.role === 'platform_admin'
              }"
            >
              {{ user.role }}
            </span>
          </li>
        </ul>
      </div>

      <p v-else-if="!pending" class="text-gray-500 mt-4">No users found. Click "Fetch All Users" to load data.</p>

      <p v-if="adminError" class="text-red-600 mt-4">{{ adminError }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { ref, onMounted } from 'vue';

const authStore = useAuthStore();
const users = ref<any[]>([]);
const adminError = ref('');
const pending = ref(false);

const fetchUsers = async () => {
  adminError.value = '';
  pending.value = true;
  try {
    const response = await $fetch('/api/user/list');
    users.value = response;
  } catch (error: any) {
    adminError.value = error?.statusMessage || 'Failed to fetch users.';
  } finally {
    pending.value = false;
  }
};

onMounted(async () => {
  if (!authStore.user && !authStore.loading) {
    await authStore.fetchUser();
  }
});

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['admin', 'organization_admin', 'platform_admin', 'super_admin']
});
</script>
