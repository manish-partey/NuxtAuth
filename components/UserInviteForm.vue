<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useFetch, useRuntimeConfig } from '#imports';

const auth = useAuthStore();

const email = ref('');
const name = ref('');
const role = ref('');
const platformId = ref('');
const organizationId = ref('');
const loading = ref(false);
const error = ref('');

// Role options based on current user role
const availableRoles = computed(() => {
  switch(auth.user.role) {
    case 'super_admin':
      return ['super_admin', 'platform_admin', 'org_admin', 'user'];
    case 'platform_admin':
      return ['org_admin', 'user'];
    case 'org_admin':
      return ['user'];
    default:
      return [];
  }
});

// Auto-set platformId and organizationId based on current user
if (auth.user.role === 'platform_admin') {
  platformId.value = auth.user.platformId || '';
} else if (auth.user.role === 'org_admin') {
  platformId.value = auth.user.platformId || '';
  organizationId.value = auth.user.organizationId || '';
}

// Submit handler
async function submitInvite() {
  error.value = '';
  loading.value = true;

  try {
    const payload = {
      email: email.value,
      name: name.value,
      role: role.value,
      platformId: platformId.value || undefined,
      organizationId: organizationId.value || undefined
    };

    const config = useRuntimeConfig();
    const res = await $fetch('/api/user/invite', {
      method: 'POST',
      body: payload
    });

    if (res.success) {
      alert('Invitation sent successfully!');
      email.value = '';
      name.value = '';
      role.value = '';
    } else {
      error.value = res.message || 'Failed to send invite.';
    }
  } catch (err: any) {
    error.value = err.message || 'Error occurred.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="submitInvite" class="max-w-md mx-auto p-6 bg-white rounded shadow">
    <h2 class="text-xl font-semibold mb-4">Invite User</h2>

    <div class="mb-4">
      <label class="block mb-1 font-medium" for="email">Email</label>
      <input v-model="email" id="email" type="email" required class="w-full border px-3 py-2 rounded" />
    </div>

    <div class="mb-4">
      <label class="block mb-1 font-medium" for="name">Name</label>
      <input v-model="name" id="name" type="text" required class="w-full border px-3 py-2 rounded" />
    </div>

    <div class="mb-4">
      <label class="block mb-1 font-medium" for="role">Role</label>
      <select v-model="role" id="role" required class="w-full border px-3 py-2 rounded">
        <option value="" disabled>Select role</option>
        <option v-for="r in availableRoles" :key="r" :value="r">{{ r.replace('_', ' ').toUpperCase() }}</option>
      </select>
    </div>

    <!-- Hidden inputs for platformId and organizationId if set -->
    <input v-if="platformId" type="hidden" :value="platformId" />
    <input v-if="organizationId" type="hidden" :value="organizationId" />

    <div v-if="error" class="text-red-600 mb-4">{{ error }}</div>

    <button :disabled="loading" type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
      {{ loading ? 'Inviting...' : 'Invite User' }}
    </button>
  </form>
</template>
