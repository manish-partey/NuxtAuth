<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAuthStore } from '~/stores/auth';

const emit = defineEmits<{
  (e: 'update:role', value: string): void
}>();

const auth = useAuthStore();
const currentRole = computed(() => auth.userRole);

const allowedRolesMap: Record<string, string[]> = {
  'super_admin': ['super_admin', 'platform_admin', 'organization_admin', 'admin', 'user'],
  'platform_admin': ['organization_admin', 'admin', 'user'],
  'organization_admin': ['admin', 'user'],
};

const allowedRoles = computed(() => {
  if (!currentRole.value) return [];
  return allowedRolesMap[currentRole.value] || [];
});

const selectedRole = ref('');

function onChange() {
  emit('update:role', selectedRole.value);
}
</script>

<template>
  <label for="role-select" class="block mb-1 font-semibold">Select Role</label>
  <select
    id="role-select"
    v-model="selectedRole"
    @change="onChange"
    class="border rounded px-3 py-2 w-full"
  >
    <option disabled value="">-- Select a Role --</option>
    <option v-for="role in allowedRoles" :key="role" :value="role">
      {{ role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }}
    </option>
  </select>
</template>
