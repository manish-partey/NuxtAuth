<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50 px-4">
    <section class="bg-white p-10 rounded-xl shadow-lg max-w-md w-full text-center" aria-live="polite"
      aria-atomic="true">
      <h1 class="text-3xl font-extrabold text-gray-900 mb-8">
        Email Verification
      </h1>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p class="text-gray-600">Verifying your email...</p>
      </div>

      <!-- Error/Success Message -->
      <div v-else>
        <p v-if="message" :class="messageType === 'success' ? 'text-green-600' : 'text-red-600'"
          class="text-lg font-medium mb-6" role="alert">
          {{ message }}
        </p>

        <!-- Initial State - Verify Button -->
        <div v-if="!verified && !message">
          <p class="text-gray-700 mb-6">Click the button below to verify your email address.</p>
          <button @click="verifyEmail" :disabled="isLoading"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-md shadow-md transition focus:outline-none focus:ring-4 focus:ring-blue-400">
            Verify Email
          </button>
        </div>

        <!-- Retry Button for Failed Verification -->
        <button v-if="messageType === 'error' && !tokenMissing" @click="verifyEmail" :disabled="isLoading"
          class="mt-4 w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-md shadow-md transition focus:outline-none focus:ring-4 focus:ring-orange-400">
          Retry Verification
        </button>

        <!-- Success - Go to Login -->
        <NuxtLink v-if="messageType === 'success'" to="/login"
          class="mt-8 inline-block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-md shadow-md transition focus:outline-none focus:ring-4 focus:ring-green-400">
          Go to Login
        </NuxtLink>

        <!-- Token Missing - Go to Login -->
        <NuxtLink v-if="tokenMissing" to="/login"
          class="mt-8 inline-block w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-md shadow-md transition focus:outline-none focus:ring-4 focus:ring-gray-400">
          Go to Login
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const message = ref('');
const messageType = ref('');
const isLoading = ref(false);
const verified = ref(false);
const tokenMissing = ref(false);

const verifyEmail = async () => {
  const token = route.query.token;
  
  if (!token) {
    message.value = 'No verification token provided. Please check your email link.';
    messageType.value = 'error';
    tokenMissing.value = true;
    return;
  }

  isLoading.value = true;
  message.value = '';

  try {
    console.log('[VERIFY] Attempting verification with token:', token);
    
    const response = await $fetch('/api/auth/verify-email', {
      method: 'POST',
      body: { token },
    });
    
    console.log('[VERIFY] Success:', response);
    message.value = response.message || 'Email verified successfully! You can now log in.';
    messageType.value = 'success';
    verified.value = true;
  } catch (error) {
    console.error('[VERIFY] Error:', error);
    
    // Better error messages
    if (error.statusCode === 400) {
      message.value = 'Invalid or expired verification token. Please request a new verification email.';
    } else if (error.statusCode === 500) {
      message.value = 'Server error during verification. Please try again.';
    } else {
      message.value = error.data?.message || error.statusMessage || 'Email verification failed. Please try again.';
    }
    
    messageType.value = 'error';
  } finally {
    isLoading.value = false;
  }
};

// Auto-verify on mount (can be disabled if you only want manual verification)
onMounted(() => {
  if (route.query.token) {
    verifyEmail();
  } else {
    message.value = 'No verification token provided. Please check your email link.';
    messageType.value = 'error';
    tokenMissing.value = true;
  }
});
</script>
