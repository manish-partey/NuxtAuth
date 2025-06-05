<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-50 px-4">
    <section class="bg-white p-10 rounded-xl shadow-lg w-full max-w-md" aria-labelledby="reset-password-title">
      <h1 id="reset-password-title" class="text-3xl font-extrabold text-gray-900 mb-8 text-center tracking-tight">
        Reset Password
      </h1>

      <form @submit.prevent="handleResetPassword" class="space-y-6">
        <div>
          <label for="newPassword" class="block text-gray-700 text-sm font-semibold mb-2">
            New Password
          </label>
          <input type="password" id="newPassword" v-model="newPassword" required autocomplete="new-password"
            class="w-full rounded-md border border-gray-300 px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition" />
        </div>

        <div>
          <label for="confirmPassword" class="block text-gray-700 text-sm font-semibold mb-2">
            Confirm New Password
          </label>
          <input type="password" id="confirmPassword" v-model="confirmPassword" required autocomplete="new-password"
            class="w-full rounded-md border border-gray-300 px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition" />
        </div>

        <button type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md py-3 shadow-md transition focus:outline-none focus:ring-4 focus:ring-blue-400">
          Reset Password
        </button>
      </form>

      <p v-if="message" :class="messageType === 'success' ? 'text-green-600' : 'text-red-600'"
        class="mt-6 text-center font-medium" role="alert">
        {{ message }}
      </p>

      <p class="mt-4 text-center">
        <NuxtLink v-if="messageType === 'success'" to="/login" class="text-blue-600 hover:underline font-medium">
          Go to Login
        </NuxtLink>
      </p>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const newPassword = ref('');
const confirmPassword = ref('');
const message = ref('');
const messageType = ref('');
const token = ref('');

onMounted(() => {
  token.value = route.query.token;
  if (!token.value) {
    message.value = 'No reset token provided.';
    messageType.value = 'error';
  }
});

const handleResetPassword = async () => {
  message.value = '';
  if (newPassword.value !== confirmPassword.value) {
    message.value = 'Passwords do not match.';
    messageType.value = 'error';
    return;
  }
  if (!token.value) {
    message.value = 'Invalid or missing reset token.';
    messageType.value = 'error';
    return;
  }

  try {
    const response = await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: { token: token.value, newPassword: newPassword.value },
    });
    message.value = response.message;
    messageType.value = 'success';
  } catch (error) {
    message.value = error.statusMessage || 'Password reset failed.';
    messageType.value = 'error';
  }
};
</script>
