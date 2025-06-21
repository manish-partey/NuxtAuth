<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

// Wait until user data is fetched
await auth.fetchUser();

if (auth.user) {
  switch (auth.user.role) {
    case 'super_admin':
      await router.replace('/superadmin');
      break;
    case 'platform_admin':
      await router.replace('/platform');
      break;
    case 'organization_admin':
      await router.replace('/org');
      break;
    case 'admin':
      await router.replace('/admin');
      break;
    case 'user':
      // Allow user dashboard to render
      break;
    default:
      await router.replace('/login');
  }
}
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold text-blue-600">Welcome to Your Dashboard</h1>
    <p class="mt-4 text-gray-600">
      You are successfully logged in. Use the sidebar or navigation to explore the platform.
    </p>
  </div>
</template>
