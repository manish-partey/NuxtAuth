<template>
  <div class="max-w-5xl mx-auto py-10 px-4">
    <h1 class="text-3xl font-semibold text-gray-800 mb-6">Pending Invitations</h1>

    <!-- Invite Form -->
    <form @submit.prevent="sendInvite" class="mb-8 p-6 bg-white rounded-xl shadow space-y-4">
      <h2 class="text-xl font-bold text-gray-700">Invite New User</h2>

      <div>
        <label for="invite-email" class="block text-sm font-medium text-gray-700">Email</label>
        <input v-model="inviteEmail" id="invite-email" type="email" class="w-full border px-3 py-2 rounded" required />
      </div>

      <div>
        <label for="invite-role" class="block text-sm font-medium text-gray-700">Role</label>
        <select v-model="inviteRole" id="invite-role" class="w-full border px-3 py-2 rounded" required>
          <option value="user">User</option>
        </select>
      </div>

      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Send Invite</button>

      <!-- Message Display -->
      <p v-if="message" :class="messageType === 'success' ? 'text-green-600' : 'text-red-600'"
         class="text-center font-medium" role="alert">
        {{ message }}
      </p>
    </form>

    <!-- Invite List -->
    <div v-if="loading" class="text-gray-600">Loading invites...</div>

    <div v-else-if="error" class="text-red-600 font-semibold">
      Failed to load invites. Please try again later.
    </div>

    <div v-else-if="invites.length" class="space-y-4">
      <div v-for="invite in invites" :key="invite._id" class="p-4 bg-white rounded-xl shadow space-y-1">
        <div class="flex justify-between items-center">
          <p class="text-gray-800 font-medium">{{ invite.email }}</p>
          <div class="space-x-2">
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
          </div>
        </div>
        <p class="text-sm text-gray-600">Role: {{ invite.role }}</p>
        <p class="text-sm text-gray-500">Inviter: {{ invite.inviterName || 'Unknown' }}</p>
        <p class="text-sm text-gray-500">Status: {{ invite.status }}</p>
        <p class="text-sm text-gray-400">Created At: {{ formatDate(invite.createdAt) }}</p>
        <p class="text-sm text-gray-600">Org: {{ invite.organization?.name || '-' }}</p>
      </div>
    </div>

    <div v-else class="text-gray-600 italic">No pending invitations.</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useFetch, useRequestHeaders } from '#app';

definePageMeta({
  middleware: ['auth-guard'],
  roles: ['organization_admin'],
});

interface Invite {
  _id: string;
  email: string;
  role: string;
  inviterName?: string;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: string;
  revoked?: boolean;
  organization?: {
    name: string;
  } | null;
}

const invites = ref<Invite[]>([]);
const error = ref<unknown>(null);
const loading = ref(true);
const resending = ref<string | null>(null);
const revoking = ref<string | null>(null);

// Message state
const message = ref('');
const messageType = ref<'success' | 'error'>('success');

// Form state
const inviteEmail = ref('');
const inviteRole = ref('user');

try {
  const { data, error: fetchError } = await useFetch<{ invites: Invite[] }>('/api/org/invites', {
    headers: useRequestHeaders(['cookie']),
  });

  if (fetchError.value) error.value = fetchError.value;
  else if (data.value?.invites) invites.value = data.value.invites;
} catch (err) {
  error.value = err;
} finally {
  loading.value = false;
}

function formatDate(date: string) {
  return new Date(date).toLocaleString();
}

async function resendInvite(inviteId: string) {
  message.value = '';
  resending.value = inviteId;
  try {
    await $fetch(`/api/org/invite/resend`, {
      method: 'POST',
      body: { inviteId },
    });
    message.value = 'Invite resent successfully.';
    messageType.value = 'success';
  } catch (e) {
    message.value = 'Failed to resend invite.';
    messageType.value = 'error';
  } finally {
    resending.value = null;
  }
}

async function revokeInvite(inviteId: string) {
  revoking.value = inviteId;
  message.value = '';
  try {
    await $fetch(`/api/org/invite/revoke`, {
      method: 'POST',
      body: { inviteId },
    });
    message.value = 'Invite revoked successfully.';
    messageType.value = 'success';
    invites.value = invites.value.filter((i) => i._id !== inviteId);
  } catch (e) {
    message.value = 'Failed to revoke invite.';
    messageType.value = 'error';
  } finally {
    revoking.value = null;
  }
}

async function sendInvite() {
  message.value = '';
  try {
    await $fetch('/api/org/invite', {
      method: 'POST',
      body: {
        email: inviteEmail.value,
        role: inviteRole.value,
      },
    });
    message.value = 'Invite sent successfully.';
    messageType.value = 'success';
    inviteEmail.value = '';
    inviteRole.value = 'user';
  } catch (err) {
    message.value = 'Failed to send invite.';
    messageType.value = 'error';
    console.error(err);
  }
}
</script>
