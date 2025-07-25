<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['platform_admin'],
});

import { ref } from 'vue';
import { useRequestHeaders } from '#app';

// Form state
const email = ref('');
const role = ref('organization_admin');
const successMessage = ref('');
const errorMessage = ref('');

const resending = ref<string | null>(null);
const revoking = ref<string | null>(null);

// Fetch platform-specific invites
const { data, error, pending, refresh } = await useFetch('/api/platform/invites', {
  credentials: 'include',
  headers: useRequestHeaders(['cookie']),
});

// Send new invite
const sendInvite = async () => {
  successMessage.value = '';
  errorMessage.value = '';

  try {
    await $fetch('/api/platform/invite', {
      method: 'POST',
      credentials: 'include',
      body: {
        email: email.value,
        role: role.value,
      },
    });

    successMessage.value = 'Invitation sent successfully.';
    email.value = '';
    role.value = 'organization_admin';
    await refresh();
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'Failed to send invitation.';
  }
};

const resendInvite = async (inviteId: string) => {
  resending.value = inviteId;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    await $fetch('/api/platform/invite/resend', {
      method: 'POST',
      body: { inviteId },
    });

    successMessage.value = 'Invite resent successfully.';
    await refresh();
  } catch (err: any) {
    errorMessage.value = 'Failed to resend invite.';
  } finally {
    resending.value = null;
  }
};

const revokeInvite = async (inviteId: string) => {
  revoking.value = inviteId;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    await $fetch('/api/platform/invite/revoke', {
      method: 'POST',
      body: { inviteId },
    });

    successMessage.value = 'Invite revoked successfully.';
    await refresh();
  } catch (err: any) {
    errorMessage.value = 'Failed to revoke invite.';
  } finally {
    revoking.value = null;
  }
};
</script>

<template>
  <div class="max-w-6xl mx-auto py-10 px-4">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Platform Invitations</h1>

    <!-- Invite Form -->
    <div class="mb-8 p-4 bg-white shadow rounded-xl space-y-4 border border-gray-200">
      <h2 class="text-lg font-semibold">Send New Platform Invitation</h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            class="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="admin@company.com"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            v-model="role"
            class="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="organization_admin">Organization Admin</option>
            <option value="user">Regular User</option>
          </select>
        </div>
      </div>

      <button
        @click="sendInvite"
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded transition"
      >
        Send Invite
      </button>

      <p v-if="successMessage" class="text-green-600 text-sm mt-2">{{ successMessage }}</p>
      <p v-if="errorMessage" class="text-red-600 text-sm mt-2">{{ errorMessage }}</p>
    </div>

    <!-- Invite Table -->
    <div v-if="pending" class="text-gray-600">Loading invites...</div>
    <div v-else-if="error" class="text-red-600 font-semibold">Failed to load invites.</div>

    <div v-else-if="data?.invites?.length">
      <table class="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
        <thead class="bg-gray-100 text-left">
          <tr>
            <th class="py-2 px-4">Email</th>
            <th class="py-2 px-4">Role</th>
            <th class="py-2 px-4">Platform</th>
            <th class="py-2 px-4">Status</th>
            <th class="py-2 px-4">Created At</th>
            <th class="py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="invite in data.invites"
            :key="invite._id"
            class="border-b hover:bg-gray-50"
          >
            <td class="py-2 px-4">{{ invite.email }}</td>
            <td class="py-2 px-4 capitalize">{{ invite.role.replace(/_/g, ' ') }}</td>
            <td class="py-2 px-4">{{ invite.platform?.name || 'N/A' }}</td>
            <td class="py-2 px-4 capitalize">{{ invite.status }}</td>
            <td class="py-2 px-4">{{ new Date(invite.createdAt).toLocaleString() }}</td>
            <td class="py-2 px-4 space-x-2">
              <button
                @click="resendInvite(invite._id)"
                class="text-blue-600 text-sm hover:underline"
                :disabled="resending === invite._id"
              >
                {{ resending === invite._id ? 'Resending...' : 'Resend' }}
              </button>
              <button
                @click="revokeInvite(invite._id)"
                class="text-red-600 text-sm hover:underline"
                :disabled="revoking === invite._id"
              >
                {{ revoking === invite._id ? 'Revoking...' : 'Revoke' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="text-gray-500">No invitations found.</div>
  </div>
</template>
