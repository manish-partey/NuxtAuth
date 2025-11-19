<template>
  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="roleClass">
    {{ roleLabel }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  role: {
    type: String,
    required: true
  }
})

// Computed
const roleClass = computed(() => {
  const classes = {
    organization_admin: 'bg-purple-100 text-purple-800',
    manager: 'bg-blue-100 text-blue-800',
    employee: 'bg-green-100 text-green-800',
    guest: 'bg-gray-100 text-gray-800'
  }
  return classes[props.role] || 'bg-gray-100 text-gray-800'
})

const roleLabel = computed(() => {
  const labels = {
    organization_admin: 'Org Admin',
    manager: 'Manager',
    employee: 'Employee',
    guest: 'Guest'
  }
  return labels[props.role] || props.role
})
</script>