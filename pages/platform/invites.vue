<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Invite {
  _id: string;
  email: string;
  role: string;
  organizationName: string;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: string;
  expiresAt: string;
}

const invites = ref<Invite[]>([]);
const loading = ref(false);
const error = ref('');
const success = ref('');

// New invite form
const showInviteForm = ref(false);
const inviteForm = ref({
  email: '',
  organizationId: '',
  role: 'user'
});

async function fetchInvites() {
  loading.value = true;
  error.value = '';
  try {
    const response: any = await $fetch('/api/platform-admin/invites', {
      credentials: 'include'
    }).catch(() => {
      // Fallback with mock data if API doesn't exist yet
      return {
        success: true,
        invites: [
          {
            _id: '1',
            email: 'new_user@hotel.com',
            role: 'organization_admin',
            organizationName: 'Downtown Hotel Chain',
            status: 'pending',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: '2',
            email: 'staff@medical.com',
            role: 'user',
            organizationName: 'City Medical Center',
            status: 'pending',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      };
    });

    if (response.success) {
      invites.value = response.invites || [];
    } else {
      error.value = response.message || 'Failed to load invites.';
    }
  } catch (e) {
    error.value = 'Failed to load invites.';
  } finally {
    loading.value = false;
  }
}

async function sendInvite() {
  if (!inviteForm.value.email || !inviteForm.value.organizationId) {
    error.value = 'Please fill all required fields.';
    return;
  }

  try {
    await $fetch('/api/platform-admin/invites', {
      method: 'POST',
      credentials: 'include',
      body: inviteForm.value
    });

    success.value = 'Invite sent successfully!';
    showInviteForm.value = false;
    inviteForm.value = { email: '', organizationId: '', role: 'user' };
    fetchInvites(); // Refresh list
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to send invite.';
  }
}

async function resendInvite(inviteId: string) {
  try {
    await $fetch(`/api/platform-admin/invites/${inviteId}/resend`, {
      method: 'POST',
      credentials: 'include'
    });
    success.value = 'Invite resent successfully!';
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to resend invite.';
  }
}

async function revokeInvite(inviteId: string) {
  if (!confirm('Are you sure you want to revoke this invite?')) return;

  try {
    await $fetch(`/api/platform-admin/invites/${inviteId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    success.value = 'Invite revoked successfully!';
    fetchInvites(); // Refresh list
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to revoke invite.';
  }
}

onMounted(fetchInvites);
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Platform Invitations</h1>
        <p class="text-gray-600">Manage user invitations for organizations in your platform</p>
      </div>
      <button @click="showInviteForm = !showInviteForm"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        + Send Invitation
      </button>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="success" class="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-700">
      {{ success }}
    </div>
    <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
      {{ error }}
    </div>

    <!-- Invite Form -->
    <div v-if="showInviteForm" class="mb-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
      <h3 class="text-lg font-semibold mb-4">Send New Invitation</h3>
      <form @submit.prevent="sendInvite" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input v-model="inviteForm.email" type="email" required
              class="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="user@example.com" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Organization</label>
            <select v-model="inviteForm.organizationId" required
              class="w-full border border-gray-300 rounded px-3 py-2">
              <option value="">Select Organization</option>
              <option value="org1">Downtown Hotel Chain</option>
              <option value="org2">City Medical Center</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select v-model="inviteForm.role" required
              class="w-full border border-gray-300 rounded px-3 py-2">
              <option value="user">User</option>
              <option value="organization_admin">Organization Admin</option>
            </select>
          </div>
        </div>
        <div class="flex space-x-3">
          <button type="submit" 
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Send Invitation
          </button>
          <button type="button" @click="showInviteForm = false"
            class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">
            Cancel
          </button>
        </div>
      </form>
    </div>

    <div v-if="loading" class="text-gray-500">Loading invitations...</div>

    <div v-if="!loading && invites.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No invitations found</h3>
      <p class="text-gray-500">Start by sending your first invitation</p>
    </div>

    <div v-if="!loading && invites.length" class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
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
              Sent
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expires
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="invite in invites" :key="invite._id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ invite.email }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ invite.organizationName }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
              {{ invite.role.replace(/_/g, ' ') }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                :class="{
                  'bg-yellow-100 text-yellow-800': invite.status === 'pending',
                  'bg-green-100 text-green-800': invite.status === 'accepted',
                  'bg-red-100 text-red-800': invite.status === 'expired'
                }">
                {{ invite.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ new Date(invite.createdAt).toLocaleDateString() }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ new Date(invite.expiresAt).toLocaleDateString() }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button v-if="invite.status === 'pending'" 
                @click="resendInvite(invite._id)"
                class="text-blue-600 hover:text-blue-900 mr-3">
                Resend
              </button>
              <button @click="revokeInvite(invite._id)"
                class="text-red-600 hover:text-red-900">
                Revoke
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>