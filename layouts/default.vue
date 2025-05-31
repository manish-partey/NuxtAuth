<template>
  <div>
    <Navbar />
    <main class="container mx-auto p-4">
      <slot /> </main>
  </div>
</template>

<script setup>
import Navbar from '~/components/Shared/Navbar.vue';
</script>

<style>
/* Basic global styles */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  background-color: #f4f4f4;
}
.container {
  max-width: 960px;
}
</style>