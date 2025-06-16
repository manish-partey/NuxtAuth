<script setup lang="ts">
const { data: invites, pending, error } = await useFetch('/api/user/invite');

if (error.value) {
  console.error('Failed to fetch invites:', error.value);
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">User Invitations</h1>

    <div v-if="pending">Loading...</div>

    <div v-else>
      <table class="min-w-full border bg-white">
        <thead>
          <tr class="bg-gray-100">
            <th class="text-left p-2">Email</th>
            <th class="text-left p-2">Role</th>
            <th class="text-left p-2">Organization</th>
            <th class="text-left p-2">Status</th>
            <th class="text-left p-2">Created At</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="invite in invites" :key="invite._id" class="border-t">
            <td class="p-2">{{ invite.email }}</td>
            <td class="p-2 capitalize">{{ invite.role }}</td>
            <td class="p-2">{{ invite.organization?.name || '—' }}</td>
            <td class="p-2">
              <span :class="invite.accepted ? 'text-green-600' : 'text-yellow-600'">
                {{ invite.accepted ? 'Accepted' : 'Pending' }}
              </span>
            </td>
            <td class="p-2">{{ new Date(invite.createdAt).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
