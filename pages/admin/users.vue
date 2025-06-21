<script setup lang="ts">
const { data: users, error } = await useFetch('/api/user/list', {
  credentials: 'include',
  headers: useRequestHeaders(['cookie']),
});
</script>

<template>
  <div>
    <h1 class="text-xl font-bold mb-4">Users</h1>
    <div v-if="error" class="text-red-600">Error loading users</div>
    <ul v-else>
      <li v-for="user in users" :key="user.id">{{ user.email }}</li>
    </ul>
  </div>
</template>