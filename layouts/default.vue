<template>
  <div class="min-h-screen bg-gray-100 text-gray-800">
    <!-- Top Navbar -->
    <nav class="bg-white shadow fixed top-0 inset-x-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="text-xl font-semibold text-blue-600 hover:text-blue-800">EaseMyCargo</NuxtLink>
        <Navbar />
      </div>
    </nav>

    <!-- Main content with top padding to avoid nav overlap -->
    <main class="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <slot />
    </main>
  </div>
</template>

<script setup>
import Navbar from '~/components/Shared/Navbar.vue';
</script>

<style>
/* Tailwind already handles most global styles cleanly. */
body {
  font-family: 'Inter', system-ui, sans-serif;
  margin: 0;
}
</style>
