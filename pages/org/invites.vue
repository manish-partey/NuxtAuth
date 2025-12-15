<template>
  <div class="max-w-5xl mx-auto py-10 px-4">
    <h1 class="text-3xl font-semibold text-gray-800 mb-6">Sent Invitations</h1>

    <!-- Invite List -->
    <div v-if="loading" class="text-gray-600">Loading invitations...</div>

    <div v-else-if="error" class="text-red-600 font-semibold">
      Failed to load invitations. Please try again later.
    </div>

    <div v-else-if="invites.length" class="space-y-4">
      <div v-for="invite in invites" :key="invite._id" class="p-5 bg-white rounded-xl shadow-md border border-gray-200">
        <div class="flex justify-between items-start mb-3">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <p class="text-lg font-semibold text-gray-900">{{ invite.name }}</p>
              <StatusBadge :status="invite.status" />
            </div>
            <p class="text-sm text-gray-600">{{ invite.email }}</p>
          </div>
          <div class="space-x-2">
            <button
              v-if="!invite.isExpired"
              @click="resendInvite(invite)"
              class="text-blue-600 text-sm hover:underline font-medium"
              :disabled="resending === invite._id"
            >
              {{ resending === invite._id ? 'Resending...' : 'Resend Email' }}
            </button>
            <button
              @click="revokeInvite(invite._id)"
              class="text-red-600 text-sm hover:underline font-medium"
              :disabled="revoking === invite._id"
            >
              {{ revoking === invite._id ? 'Revoking...' : 'Revoke' }}
            </button>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p class="text-gray-500 font-medium">Role</p>
            <p class="text-gray-800">{{ formatRole(invite.role) }}</p>
          </div>
          <div>
            <p class="text-gray-500 font-medium">Invitation Sent</p>
            <p class="text-gray-800">{{ formatDate(invite.emailSentAt) }}</p>
          </div>
          <div>
            <p class="text-gray-500 font-medium">Link Expires</p>
            <p :class="invite.isExpired ? 'text-red-600 font-semibold' : 'text-gray-800'">
              {{ invite.expiresAt ? formatDate(invite.expiresAt) : 'N/A' }}
              <span v-if="invite.isExpired" class="ml-1">(Expired)</span>
            </p>
          </div>
          <div>
            <p class="text-gray-500 font-medium">Invited By</p>
            <p class="text-gray-800">{{ invite.inviterName }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
      <p class="text-gray-600 text-lg">No pending invitations.</p>
      <p class="text-gray-500 text-sm mt-2">Invite users from the Users page to see them here.</p>
    </div>

    <!-- Message Display -->
    <div v-if="message" 
         :class="messageType === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'"
         class="mt-6 p-4 rounded-lg border font-medium" 
         role="alert">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useFetch, useRequestHeaders } from '#app';
import StatusBadge from '~/components/org/shared/StatusBadge.vue';

definePageMeta({
  middleware: ['auth-guard'],
  roles: ['organization_admin'],
});

interface Invite {
  _id: string;
  email: string;
  name: string;
  role: string;
  inviterName?: string;
  status: 'invitation_sent';
  createdAt: string;
  emailSentAt: string;
  expiresAt: string;
  hasToken: boolean;
  isExpired: boolean;
}

const invites = ref<Invite[]>([]);
const error = ref<unknown>(null);
const loading = ref(true);
const resending = ref<string | null>(null);
const revoking = ref<string | null>(null);

// Message state
const message = ref('');
const messageType = ref<'success' | 'error'>('success');

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

function formatRole(role: string) {
  return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

async function resendInvite(invite: Invite) {
  message.value = '';
  resending.value = invite._id;
  try {
    // Resend invitation by calling the invite API again with the same email
    await $fetch('/api/org/users/invite', {
      method: 'POST',
      body: { 
        emails: [invite.email],
        role: invite.role
      },
    });
    message.value = `Invitation email resent to ${invite.email}`;
    messageType.value = 'success';
    
    // Refresh the list
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  } catch (e: any) {
    message.value = e.data?.message || 'Failed to resend invitation.';
    messageType.value = 'error';
  } finally {
    resending.value = null;
  }
}

async function revokeInvite(inviteId: string) {
  revoking.value = inviteId;
  message.value = '';
  try {
    // Delete the user to revoke the invitation
    const response = await $fetch(`/api/org/users/${inviteId}`, {
      method: 'DELETE',
    });
    message.value = response.message || 'Invitation revoked successfully.';
    messageType.value = 'success';
    invites.value = invites.value.filter((i) => i._id !== inviteId);
  } catch (e: any) {
    message.value = e.data?.message || 'Failed to revoke invitation.';
    messageType.value = 'error';
  } finally {
    revoking.value = null;
  }
}
</script>
