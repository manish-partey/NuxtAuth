<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
      <h1 class="text-3xl font-semibold text-blue-700 text-center mb-6">Create an Account</h1>

      <form @submit.prevent="handleRegister" class="space-y-5">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
          <input id="username" v-model="username" type="text" placeholder="yourusername"
            class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            required />
        </div>

        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
          <input id="name" v-model="name" type="text" placeholder="Your Name"
            class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            required />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
          <input id="email" v-model="email" type="email" placeholder="you@example.com"
            class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            required />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input id="password" v-model="password" type="password" placeholder="••••••••"
            class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            required />
        </div>

        <button type="submit"
          class="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition">
          Sign Up
        </button>
      </form>

      <p v-if="message" :class="messageType === 'success' ? 'text-green-600' : 'text-red-500'"
        class="mt-4 text-center text-sm font-medium">
        {{ message }}
      </p>

      <div class="text-center mt-6 text-sm text-gray-600">
        Already have an account?
        <NuxtLink to="/login" class="text-blue-600 hover:underline">Sign In</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const username = ref('');
const name = ref('');
const email = ref('');
const password = ref('');
const message = ref('');
const messageType = ref('');

const handleRegister = async () => {
  message.value = '';
  try {
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: { username: username.value, name: name.value, email: email.value, password: password.value },
    });
    message.value = response.message;
    messageType.value = 'success';

    username.value = '';
    name.value = '';
    email.value = '';
    password.value = '';
  } catch (error) {
    message.value = error.statusMessage || 'Registration failed.';
    messageType.value = 'error';
  }
};
</script>
