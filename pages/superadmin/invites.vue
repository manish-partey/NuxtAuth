<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Invite {
  _id: string;
  email: string;
  role: string;
  orgName: string;
  platformName: string;
  status: string; // pending, accepted, revoked
  createdAt: string;
}

const invites = ref<Invite[]>([]);
const loading = ref(false);
const error = ref('');

async function fetchInvites() {
  loading.value = true;
  error.value = '';
  try {
    invites.value = await $fetch('/api/org/invites.get', {
      credentials: 'include' // ✅ Include cookies
    });
  } catch {
    error.value = 'Failed to load invites.';
  } finally {
    loading.value = false;
  }
}

async function revokeInvite(id: string) {
  try {
    await $fetch('/api/org/invite/revoke.post', {
      method: 'POST',
      body: { inviteId: id },
      credentials: 'include' // ✅ Include cookies
    });
    await fetchInvites();
  } catch {
    alert('Failed to revoke invite.');
  }
}

async function resendInvite(id: string) {
  try {
    await $fetch('/api/org/invite/resend.post', {
      method: 'POST',
      body: { inviteId: id },
      credentials: 'include' // ✅ Include cookies
    });
    alert('Invite resent successfully.');
  } catch {
    alert('Failed to resend invite.');
  }
}

onMounted(fetchInvites);
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Manage Invitations</h1>
    <p class="mb-6 text-gray-600">View all pending or active invitations across platforms and organizations.</p>

    <div v-if="loading" class="text-gray-500">Loading invites...</div>
    <div v-if="error" class="text-red-600">{{ error }}</div>

    <table v-if="!loading && invites.length" class="w-full border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-100">
          <th class="border border-gray-300 p-2 text-left">Email</th>
          <th class="border border-gray-300 p-2 text-left">Role</th>
          <th class="border border-gray-300 p-2 text-left">Organization</th>
          <th class="border border-gray-300 p-2 text-left">Platform</th>
          <th class="border border-gray-300 p-2 text-left">Status</th>
          <th class="border border-gray-300 p-2 text-left">Created At</th>
          <th class="border border-gray-300 p-2 text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="invite in invites" :key="invite._id">
          <td class="border border-gray-300 p-2">{{ invite.email }}</td>
          <td class="border border-gray-300 p-2 capitalize">{{ invite.role.replace(/_/g, ' ') }}</td>
          <td class="border border-gray-300 p-2">{{ invite.orgName }}</td>
          <td class="border border-gray-300 p-2">{{ invite.platformName }}</td>
          <td class="border border-gray-300 p-2 capitalize">{{ invite.status }}</td>
          <td class="border border-gray-300 p-2">{{ new Date(invite.createdAt).toLocaleDateString() }}</td>
          <td class="border border-gray-300 p-2 text-center space-x-2">
            <button @click="resendInvite(invite._id)" class="text-blue-600 hover:underline">Resend</button>
            <button @click="revokeInvite(invite._id)" class="text-red-600 hover:underline">Revoke</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="!loading && !invites.length" class="text-gray-500">No active invites.</div>
  </div>
</template>
