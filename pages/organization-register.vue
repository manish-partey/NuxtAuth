<template>
  <div class="flex justify-center items-center h-screen">
    <form @submit.prevent="registerOrg" class="bg-white p-8 rounded shadow-md w-full max-w-xl">
      <h1 class="text-2xl font-bold mb-6 text-center">Register Organization</h1>
      <input v-model="orgName" placeholder="Organization Name" class="input" />
      <input v-model="orgDomain" placeholder="Organization Domain" class="input" />
      <input v-model="adminName" placeholder="Admin Name" class="input" />
      <input v-model="adminEmail" placeholder="Admin Email" type="email" class="input" />
      <input v-model="adminPassword" placeholder="Admin Password" type="password" class="input" />
      <button type="submit" class="btn-primary w-full">Register</button>
      <p v-if="message" class="mt-4 text-center text-green-500">{{ message }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const orgName = ref('');
const orgDomain = ref('');
const adminName = ref('');
const adminEmail = ref('');
const adminPassword = ref('');
const message = ref('');

const registerOrg = async () => {
  try {
    const res = await $fetch('/api/organization/register', {
      method: 'POST',
      body: { orgName: orgName.value, orgDomain: orgDomain.value, adminName: adminName.value, adminEmail: adminEmail.value, adminPassword: adminPassword.value },
    });
    message.value = res.message;
  } catch (err) {
    message.value = err.statusMessage || 'Registration failed';
  }
};
</script>

<style scoped>
.input {
  display: block;
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.btn-primary {
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>