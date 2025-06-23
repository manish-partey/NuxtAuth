<script setup lang="ts">
defineEmits(['invited']);

const email = ref('');
const name = ref('');
const loading = ref(false);
const error = ref('');

const submitInvite = async () => {
  loading.value = true;
  error.value = '';
  const { error: err } = await useFetch('/api/org/invite', {
    method: 'POST',
    body: { email: email.value, name: name.value },
    credentials: 'include',
    headers: useRequestHeaders(['cookie'])
  });
  loading.value = false;
  if (err?.value) error.value = err.value?.data?.message || 'Failed to send invite';
  else {
    email.value = '';
    name.value = '';
    emit('invited');
  }
};
</script>

<template>
  <form @submit.prevent="submitInvite" class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700">Name (optional)</label>
      <input v-model="name" class="mt-1 w-full border rounded px-3 py-2" />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700">Email</label>
      <input v-model="email" type="email" class="mt-1 w-full border rounded px-3 py-2" required />
    </div>
    <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded" :disabled="loading">
      {{ loading ? 'Sending...' : 'Send Invite' }}
    </button>
    <p v-if="error" class="text-red-600">{{ error }}</p>
  </form>
</template>
