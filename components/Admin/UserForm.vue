<template>
  <form @submit.prevent="handleCreate" class="bg-white shadow p-6 rounded w-full max-w-lg">
    <input v-model="name" placeholder="Name" class="input" required />
    <input v-model="email" type="email" placeholder="Email" class="input" required />
    <input v-model="password" type="password" placeholder="Password" class="input" required />
    <select v-model="role" class="input">
      <option value="user">User</option>
      <option value="admin">Admin</option>
    </select>
    <button type="submit" class="btn-primary w-full mt-4">Create User</button>
  </form>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['user-created']);
const name = ref('');
const email = ref('');
const password = ref('');
const role = ref('user');

const handleCreate = async () => {
  try {
    const res = await $fetch('/api/user/create', {
      method: 'POST',
      body: { name: name.value, email: email.value, password: password.value, role: role.value },
    });
    emit('user-created', res.message);
    name.value = email.value = password.value = '';
    role.value = 'user';
  } catch (err) {
    emit('user-created', err.statusMessage || 'Creation failed');
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