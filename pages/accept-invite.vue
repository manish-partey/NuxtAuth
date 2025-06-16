<template>
  <section class="max-w-lg mx-auto p-8 bg-white rounded-lg shadow mt-12">
    <h1 class="text-3xl font-bold mb-4 text-center">Accept Invitation</h1>

    <div v-if="loading" class="text-center text-gray-600">Loading invitation details...</div>

    <div v-else>
      <div v-if="error" class="text-red-600 text-center mb-4">{{ error }}</div>

      <div v-else>
        <p class="mb-4 text-center">
          You've been invited as <strong>{{ inviteDetails.role }}</strong>
          <span v-if="inviteDetails.organizationName"> to <strong>{{ inviteDetails.organizationName }}</strong></span>
          <span v-else-if="inviteDetails.platformName"> to <strong>{{ inviteDetails.platformName }}</strong></span>.
        </p>

        <form @submit.prevent="submit">
          <input v-model="name" type="text" placeholder="Your Name" class="input mb-3 w-full" required />
          <input v-model="password" type="password" placeholder="Password" class="input mb-3 w-full" required />
          <p v-if="password.length > 0 && password.length < 8" class="text-sm text-red-500 mb-2">
            Password should be at least 8 characters long.
          </p>

          <button :disabled="loading" type="submit" class="btn w-full">
            {{ loading ? 'Submitting...' : 'Accept Invite' }}
          </button>
        </form>

        <p v-if="message" class="mt-4 text-center" :class="{ 'text-green-600': success, 'text-red-600': !success }">
          {{ message }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';

const route = useRoute();
const router = useRouter();
const token = route.query.token as string;

const name = ref('');
const password = ref('');
const message = ref('');
const success = ref(false);
const loading = ref(false);
const error = ref('');
const inviteDetails = ref({
  email: '',
  role: '',
  organizationName: '',
  platformName: ''
});

const fetchInviteDetails = async () => {
  if (!token) {
    error.value = 'Invalid or missing invitation token.';
    return;
  }

  loading.value = true;
  try {
    const res = await $fetch('/api/user/invite', {
      method: 'GET',
      params: { token },
    });

    inviteDetails.value = res.invitation;
  } catch (err: any) {
    error.value = err?.data?.message || 'Failed to load invitation.';
  } finally {
    loading.value = false;
  }
};

const submit = async () => {
  if (password.value.length < 8) {
    message.value = 'Password must be at least 8 characters long.';
    success.value = false;
    return;
  }

  loading.value = true;
  try {
    const res = await $fetch('/api/user/accept-invite', {
      method: 'POST',
      body: {
        token,
        name: name.value.trim(),
        password: password.value.trim(),
      },
    });

    success.value = res.success;
    message.value = res.message;

    if (res.success) {
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  } catch (err: any) {
    success.value = false;
    message.value = err?.data?.message || 'Something went wrong.';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchInviteDetails);
</script>
