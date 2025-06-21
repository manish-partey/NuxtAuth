<template>
  <div class="max-w-5xl mx-auto py-10 px-4">
    <h1 class="text-3xl font-semibold text-gray-800 mb-6">Pending Invitations</h1>

    <div v-if="loading" class="text-gray-600">Loading invites...</div>

    <div v-else-if="error" class="text-red-600 font-semibold">
      Failed to load invites. Please try again later.
    </div>

    <div v-else-if="invites.length" class="space-y-4">
      <div
        v-for="invite in invites"
        :key="invite._id"
        class="p-4 bg-white rounded-xl shadow space-y-1"
      >
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
import { useFetch, useRequestHeaders, useNuxtApp } from '#app';

definePageMeta({
  middleware: ['auth', 'role'],
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

try {
  const { data, error: fetchError } = await useFetch<{ invites: Invite[] }>('/api/org/invites', {
    headers: useRequestHeaders(['cookie']),
  });

  if (fetchError.value) {
  error.value = fetchError.value;
} else if (data.value?.invites) {
  invites.value = data.value.invites;
}
} catch (err) {
  error.value = err;
} finally {
  loading.value = false;
}

function formatDate(date: string) {
  return new Date(date).toLocaleString();
}

async function resendInvite(inviteId: string) {
  resending.value = inviteId;
  try {
    await $fetch(`/api/org/invite/resend`, {
      method: 'POST',
      body: { inviteId },
    });
    alert('Invite resent successfully.');
  } catch (e) {
    alert('Failed to resend invite.');
  } finally {
    resending.value = null;
  }
}

async function revokeInvite(inviteId: string) {
  revoking.value = inviteId;
  try {
    await $fetch(`/api/org/invite/revoke`, {
      method: 'POST',
      body: { inviteId },
    });
    alert('Invite revoked successfully.');
    invites.value = invites.value.filter((i) => i._id !== inviteId);
  } catch (e) {
    alert('Failed to revoke invite.');
  } finally {
    revoking.value = null;
  }
}
</script>
