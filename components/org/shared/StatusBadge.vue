<template>
  <span class="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full" :class="statusClass">
    <span v-if="showIcon" class="w-2 h-2 rounded-full mr-1" :class="iconClass"></span>
    {{ statusLabel }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  status: {
    type: String,
    required: true
  },
  showIcon: {
    type: Boolean,
    default: true
  }
})

// Computed
const statusClass = computed(() => {
  const classes = {
    active: 'bg-green-100 text-green-800',
    invitation_sent: 'bg-blue-100 text-blue-800',
    suspended: 'bg-red-100 text-red-800',
    removed: 'bg-gray-100 text-gray-800'
  }
  return classes[props.status] || 'bg-gray-100 text-gray-800'
})

const iconClass = computed(() => {
  const classes = {
    active: 'bg-green-400',
    invitation_sent: 'bg-blue-400',
    suspended: 'bg-red-400',
    removed: 'bg-gray-400'
  }
  return classes[props.status] || 'bg-gray-400'
})

const statusLabel = computed(() => {
  const labels = {
    active: 'Active',
    invitation_sent: 'Invitation Sent',
    suspended: 'Suspended',
    removed: 'Removed'
  }
  return labels[props.status] || props.status
})
</script>