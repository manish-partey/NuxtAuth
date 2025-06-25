<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['super_admin'],
});

const users = ref<any[]>([]);
const loading = ref(false);
const error = ref('');
const currentUserId = useAuthStore().user?._id || '';

const fetchUsers = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await $fetch('/api/user/list', {
      credentials: 'include',
      headers: useRequestHeaders(['cookie']),
    });

    if (res.success) {
      users.value = res.users;
    } else {
      error.value = 'Failed to load users.';
    }
  } catch (e) {
    error.value = 'An error occurred while fetching users.';
    console.error('[SuperAdmin] Fetch error:', e);
  } finally {
    loading.value = false;
  }
};

const toggleUserStatus = (user: any) => {
  user.disabled = !user.disabled;
};

const saveUser = async (user: any) => {
  const payload: Record<string, any> = {
    userId: user._id,
  };

  // Optional updates (skip undefined)
  if (user.name) payload.name = user.name;
  if (user.email) payload.email = user.email;
  if (user.role) payload.role = user.role;
  if (typeof user.disabled === 'boolean') payload.disabled = user.disabled;

  try {
    await $fetch('/api/user/update', {
      method: 'POST',
      body: payload,
    });
    alert('User updated successfully.');
  } catch (err: any) {
    alert(err?.data?.message || 'Failed to update user.');
  }
};

onMounted(fetchUsers);
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Manage Users</h1>
    <p class="mb-4 text-gray-600">List of all users across the platform with admin controls.</p>

    <div v-if="loading" class="text-gray-600">Loading users...</div>
    <div v-if="error" class="text-red-600">{{ error }}</div>

    <table
      v-if="!loading && users.length"
      class="min-w-full bg-white rounded-lg overflow-hidden shadow-md text-sm"
    >
      <thead class="bg-gray-100 border-b text-gray-800">
        <tr>
          <th class="text-left px-4 py-2">Name</th>
          <th class="text-left px-4 py-2">Email</th>
          <th class="text-left px-4 py-2">Role</th>
          <th class="text-left px-4 py-2">Organization</th>
          <th class="text-left px-4 py-2">Status</th>
          <th class="text-left px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="user in users"
          :key="user._id"
          class="border-b hover:bg-gray-50"
        >
          <td class="px-4 py-2">
            <input
              v-model="user.name"
              type="text"
              class="border px-2 py-1 w-full rounded"
              :readonly="user._id === currentUserId"
            />
          </td>

          <td class="px-4 py-2">
            <input
              v-model="user.email"
              type="email"
              class="border px-2 py-1 w-full rounded"
              :readonly="user._id === currentUserId"
            />
          </td>

          <td class="px-4 py-2">
            <select
              v-model="user.role"
              class="border rounded px-2 py-1"
              :disabled="user._id === currentUserId"
            >
              <option value="super_admin">Super Admin</option>
              <option value="platform_admin">Platform Admin</option>
              <option value="organization_admin">Organization Admin</option>
              <option value="user">User</option>
            </select>
          </td>

          <td class="px-4 py-2">{{ user.organization?.name || 'N/A' }}</td>

          <td class="px-4 py-2">
            <span
              :class="[
                'text-xs font-semibold px-2 py-1 rounded',
                user.disabled ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              ]"
            >
              {{ user.disabled ? 'Disabled' : 'Active' }}
            </span>
          </td>

          <td class="px-4 py-2 space-x-2">
            <button
              @click="toggleUserStatus(user)"
              class="text-sm text-white px-3 py-1 rounded"
              :class="user.disabled ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-500 hover:bg-yellow-600'"
              :disabled="user._id === currentUserId"
            >
              {{ user.disabled ? 'Enable' : 'Disable' }}
            </button>

            <button
              @click="saveUser(user)"
              class="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
              :disabled="user._id === currentUserId"
            >
              Save
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-if="!loading && !users.length" class="text-gray-600 italic">No users found.</p>
  </div>
</template>
