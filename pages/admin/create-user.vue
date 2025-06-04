<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold mb-6">Create User</h1>
    <UserForm @user-created="handleCreated" />
    <p v-if="message" class="mt-4 text-green-600">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import UserForm from '~/components/Admin/UserForm.vue';
import { ref } from 'vue';

const message = ref('');
const handleCreated = (msg: string) => {
  message.value = msg;
};

// Protect this page: user must be logged in AND an admin
definePageMeta({
  middleware: ['auth', 'admin']
});
</script>
