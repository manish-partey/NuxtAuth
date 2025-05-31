<template>
  <nav class="bg-blue-600 p-4 text-white flex justify-between items-center">
    <NuxtLink to="/" class="text-xl font-bold">Nuxt Auth App</NuxtLink>
    <div>
      <template v-if="authStore.loggedIn">
        <span class="mr-4">Welcome, {{ authStore.user?.name }}!</span>
        <NuxtLink to="/dashboard" class="mr-4 hover:underline">Dashboard</NuxtLink>
        <NuxtLink v-if="authStore.isAdmin()" to="/admin" class="mr-4 hover:underline">Admin</NuxtLink>
        <button @click="handleLogout" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          Sign Out
        </button>
      </template>
      <template v-else>
        <NuxtLink to="/login" class="mr-4 hover:underline">Sign In</NuxtLink>
        <NuxtLink to="/register" class="hover:underline">Sign Up</NuxtLink>
      </template>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { useRouter } from 'vue-router';
import { onMounted } from 'vue'; // Make sure to import onMounted if you use it

const authStore = useAuthStore(); // This should typically be fine in components

const router = useRouter();

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};

// If the error persists specifically in Navbar.vue, and NOT in app.vue,
// it might be because Navbar is rendered extremely early on the server.
// A common workaround is to use `onMounted` for parts that rely on client-side state
// or to ensure the store is available, though for Navbar, it's often not needed.
// However, let's try a defensive measure:
//
// onMounted(() => {
//   // This ensures authStore is accessed only after the component is mounted (client-side)
//   // but it might cause a flicker or delay in showing authenticated state on initial load.
//   // It's a last resort for this specific component if other fixes fail.
//   // const authStore = useAuthStore(); // If you move it here, the top-level one needs to be reactive and null initially
// });

</script>