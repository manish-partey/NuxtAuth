<template>
  <div class="p-8 text-center">
    <h1 class="text-4xl font-bold mb-4">Welcome to Nuxt Auth App!</h1>
    <p class="text-lg text-gray-700">
      This is your homepage. Use the navigation bar to sign up, sign in, or access protected areas.
    </p>
    <div class="mt-8">
      <NuxtLink to="/register" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-xl mr-4">Sign Up</NuxtLink>
      <NuxtLink to="/login" class="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-xl">Sign In</NuxtLink>
    </div>
  </div>
</template>

<script setup>
// No specific script needed for a basic homepage
</script>

<style scoped>
/* You can add specific styles here if needed */
</style>