<script setup lang="ts">
const { data: platforms, pending, error } = await useFetch('/api/platform/listAdmins');

if (error.value) {
  console.error('Failed to load platforms', error.value);
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">All Platforms</h1>

    <div v-if="pending" class="text-gray-500">Loading...</div>

    <div v-else>
      <table class="min-w-full bg-white border">
        <thead>
          <tr class="bg-gray-100">
            <th class="text-left p-2">Name</th>
            <th class="text-left p-2">Admins</th>
            <th class="text-left p-2">Created At</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="platform in platforms" :key="platform._id" class="border-t">
            <td class="p-2">{{ platform.name }}</td>
            <td class="p-2">
              <ul>
                <li v-for="admin in platform.admins" :key="admin.email">
                  {{ admin.email }}
                </li>
              </ul>
            </td>
            <td class="p-2">{{ new Date(platform.createdAt).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
