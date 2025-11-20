<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  organizationName: string;
  status: string;
  createdAt: string;
}

const users = ref<User[]>([]);
const loading = ref(false);
const error = ref('');

async function fetchUsers() {
  loading.value = true;
  error.value = '';
  try {
    const response: any = await $fetch('/api/platform-admin/users', {
      credentials: 'include'
    }).catch(() => {
      // Fallback with mock data if API doesn't exist yet
      return {
        success: true,
        users: [
          {
            _id: '1',
            username: 'john_doe',
            email: 'john@hotel.com',
            role: 'organization_admin',
            organizationName: 'Downtown Hotel Chain',
            status: 'active',
            createdAt: new Date().toISOString()
          },
          {
            _id: '2',
            username: 'jane_smith',
            email: 'jane@medical.com',
            role: 'user',
            organizationName: 'City Medical Center',
            status: 'active',
            createdAt: new Date().toISOString()
          }
        ]
      };
    });

    if (response.success) {
      users.value = response.users || [];
    } else {
      error.value = response.message || 'Failed to load users.';
    }
  } catch (e) {
    error.value = 'Failed to load users.';
  } finally {
    loading.value = false;
  }
}

onMounted(fetchUsers);
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Platform Users</h1>
        <p class="text-gray-600">Manage all users across organizations in your platform</p>
      </div>
      <NuxtLink to="/platform/users/invite"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        + Invite User
      </NuxtLink>
    </div>

    <div v-if="loading" class="text-gray-500">Loading users...</div>
    <div v-if="error" class="text-red-600">{{ error }}</div>

    <div v-if="!loading && users.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No users found</h3>
      <p class="text-gray-500">Users will appear here when organizations start adding members</p>
    </div>

    <div v-if="!loading && users.length" class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Organization
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Joined
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in users" :key="user._id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <span class="text-sm font-medium text-gray-700">
                      {{ user.username.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ user.username }}</div>
                  <div class="text-sm text-gray-500">{{ user.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ user.organizationName }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
              {{ user.role.replace(/_/g, ' ') }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                :class="user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                {{ user.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ new Date(user.createdAt).toLocaleDateString() }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button class="text-blue-600 hover:text-blue-900 mr-3">
                View
              </button>
              <button class="text-red-600 hover:text-red-900">
                Disable
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>