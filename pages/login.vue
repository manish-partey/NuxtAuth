<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
      <h1 class="text-3xl font-semibold text-blue-700 text-center mb-6">Sign In</h1>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
          <input
            type="email"
            id="email"
            v-model="email"
            placeholder="you@example.com"
            class="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="••••••••"
            class="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
          :disabled="loading"
        >
          Sign In
        </button>
      </form>

      <p v-if="error" class="text-red-500 text-center mt-4 text-sm font-medium">
        {{ error }}
      </p>

      <div class="text-center mt-6 text-sm text-gray-600">
        <p>
          Don't have an account?
          <NuxtLink to="/register" class="text-blue-600 hover:underline">Sign Up</NuxtLink>
        </p>
        <p class="mt-2">
          <NuxtLink to="/forgot-password" class="text-blue-600 hover:underline">Forgot Password?</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const handleLogin = async () => {
  error.value = '';
  loading.value = true;
  try {
    const success = await authStore.login(email.value, password.value);
    if (success && authStore.user) {
      const role = authStore.user.role.toLowerCase();

      if (role === 'super_admin') {
        await router.push('/superadmin');
      } else if (role === 'platform_admin') {
        await router.push('/platform');
      } else if (role === 'organization_admin' || role === 'organization_admin') {
        await router.push('/org');
      } else {
        await router.push('/dashboard');
      }
    } else {
      error.value = 'Login failed: Unknown error.';
    }
  } catch (err: any) {
    console.error('Login error:', err);
    error.value = err?.statusMessage || 'Login failed. Please check your credentials.';
  } finally {
    loading.value = false;
  }
};
</script>
