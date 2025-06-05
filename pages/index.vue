<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-white text-center px-4">
    <h1 class="text-4xl sm:text-5xl font-extrabold text-blue-700 mb-4">
      Welcome to EaseMyCargo App
    </h1>
    <p class="text-lg sm:text-xl text-gray-600 max-w-xl">
      A secure and modern authentication system powered by Nuxt 3. Get started by signing up or logging in below.
    </p>

    <div class="mt-8 flex flex-col sm:flex-row gap-4">
      <NuxtLink
        to="/register"
        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-lg transition duration-200"
      >
        Sign Up
      </NuxtLink>
      <NuxtLink
        to="/login"
        class="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg text-lg transition duration-200"
      >
        Sign In
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
// No script logic needed
</script>
