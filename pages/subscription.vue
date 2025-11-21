<template>
  <div>
    <div style="margin-bottom: 1em;">
      <label>Tenant ID:
        <select v-model="tenantId">
          <option disabled value="">Select Tenant</option>
          <option v-for="id in tenantIds" :key="id" :value="id">{{ id }}</option>
        </select>
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFetch } from '#app'

const tenantId = ref('')
const { data: config } = useFetch('/api/docs-config')
const tenantIds = computed(() => config.value ? Object.keys(config.value) : [])

const subscriptionConfig = {
  title: 'Manage Subscriptions',
  fields: [
    { name: 'name', label: 'Name', required: true },
    { name: 'plan', label: 'Plan', required: true, type: 'select', options: [
      { label: 'Plan 1', value: 'plan1' },
      { label: 'Plan 2', value: 'plan2' }
    ] },
    { name: 'status', label: 'Status', required: false, type: 'select', options: [
      { label: 'Active', value: 'Active' },
      { label: 'InActive', value: 'InActive' }
    ] },
    { name: 'startDate', label: 'Start Date', type: 'date', required: false },
    { name: 'endDate', label: 'End Date', type: 'date', required: false }
  ]
}
</script>