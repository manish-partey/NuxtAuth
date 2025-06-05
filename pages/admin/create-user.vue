<template>
  <section class="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-md">
    <h1 class="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">
      Create User
    </h1>

    <UserForm @user-created="handleCreated" />

    <p v-if="message"
      class="mt-6 text-green-700 bg-green-100 border border-green-300 rounded-md px-4 py-3 font-medium max-w-md"
      role="alert">
      {{ message }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import UserForm from '~/components/Admin/UserForm.vue';

const message = ref('');
const handleCreated = (msg: string) => {
  message.value = msg;
};

// Protect this page: user must be logged in AND an admin
definePageMeta({
  middleware: ['auth', 'admin'],
});
</script>
