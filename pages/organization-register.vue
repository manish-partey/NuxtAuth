<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-xl bg-white p-8 rounded-2xl shadow-lg">
      <h1 class="text-3xl font-semibold text-center text-blue-700 mb-6">Register Your Organization</h1>

      <form @submit.prevent="registerOrg" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
          <input v-model="orgName" type="text" placeholder="e.g. Acme Corp"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Organization Domain</label>
          <input v-model="orgDomain" type="text" placeholder="e.g. acme.com"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Admin Name</label>
          <input v-model="adminName" type="text" placeholder="John Doe"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
          <input v-model="adminEmail" type="email" placeholder="admin@acme.com"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Admin Password</label>
          <input v-model="adminPassword" type="password" placeholder="••••••••"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required />
        </div>

        <button type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition">
          Register Organization
        </button>
      </form>

      <p v-if="message" class="text-center mt-4 text-sm text-green-600 font-medium">{{ message }}</p>
    </div>
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
  message.value = '';
  try {
    const res = await $fetch('/api/organization/register', {
      method: 'POST',
      body: {
        orgName: orgName.value,
        orgDomain: orgDomain.value,
        adminName: adminName.value,
        adminEmail: adminEmail.value,
        adminPassword: adminPassword.value,
      },
    });
    message.value = res.message;
  } catch (err) {
    message.value = err.statusMessage || 'Registration failed.';
  }
};
</script>
