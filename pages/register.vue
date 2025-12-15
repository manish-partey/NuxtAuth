<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
      <h1 class="text-3xl font-semibold text-blue-700 text-center mb-6">Create an Account</h1>

      <!-- Registration Form -->
      <form @submit.prevent="handleRegister" class="space-y-5">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">Username *</label>
            <input id="username" v-model="username" type="text" placeholder="yourusername"
              class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
              required />
          </div>

          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Full Name *</label>
            <input id="name" v-model="name" type="text" placeholder="Your Name"
              class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
              required />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email address *</label>
            <input id="email" v-model="email" type="email" placeholder="you@example.com"
              class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
              required />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password *</label>
            <input id="password" v-model="password" type="password" placeholder="••••••••" minlength="8"
              class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
              required />
            <p class="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
          </div>

          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700">Phone Number</label>
            <input id="phone" v-model="phone" type="tel" placeholder="+1 (555) 123-4567"
              class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div class="flex space-x-4">
            <button type="button" @click="$router.push('/login')"
              class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 rounded-lg transition">
              Back to Login
            </button>
            <button type="submit" :disabled="isRegistering"
              class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center">
              <span v-if="isRegistering" class="mr-2">
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ isRegistering ? 'Creating Account...' : 'Create Account' }}
            </button>
          </div>
        </form>

      <!-- Success/Error Messages -->
      <div v-if="message" class="mt-6 p-4 rounded-lg" :class="messageClass">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg v-if="messageType === 'success'" class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium">{{ message }}</p>
          </div>
        </div>
      </div>

      <div class="text-center mt-6 text-sm text-gray-600">
        Already have an account?
        <NuxtLink to="/login" class="text-blue-600 hover:underline">Sign In</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// Form data
const username = ref('');
const name = ref('');
const email = ref('');
const password = ref('');
const phone = ref('');

// UI state
const message = ref('');
const messageType = ref('');
const isRegistering = ref(false);

// Computed properties
const messageClass = computed(() => {
  return messageType.value === 'success' 
    ? 'bg-green-50 border border-green-200 text-green-800'
    : 'bg-red-50 border border-red-200 text-red-800';
});

const handleRegister = async () => {
  message.value = '';
  
  // Validation
  if (!username.value.trim() || !name.value.trim() || !email.value.trim() || !password.value) {
    message.value = 'Please fill in all required fields.';
    messageType.value = 'error';
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value.trim())) {
    message.value = 'Please enter a valid email address.';
    messageType.value = 'error';
    return;
  }

  // Validate password length
  if (password.value.length < 8) {
    message.value = 'Password must be at least 8 characters long.';
    messageType.value = 'error';
    return;
  }

  isRegistering.value = true;
  
  try {
    const registrationData = {
      username: username.value.trim(),
      name: name.value.trim(),
      email: email.value.trim().toLowerCase(),
      password: password.value,
      phone: phone.value.trim()
    };

    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: registrationData
    });

    message.value = response.message;
    messageType.value = 'success';

    // Clear form on success
    username.value = '';
    name.value = '';
    email.value = '';
    password.value = '';
    phone.value = '';
    
  } catch (error: any) {
    message.value = error?.data?.message || error?.statusMessage || 'Registration failed.';
    messageType.value = 'error';
  } finally {
    isRegistering.value = false;
  }
};
</script>
