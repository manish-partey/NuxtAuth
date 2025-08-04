<template>
  <div>
    <h2>{{ config.title || 'Services Management' }}</h2>
    <button @click="showForm = !showForm">{{ showForm ? 'Close' : 'Add Service' }}</button>
    <div v-if="showForm" class="form-section">
      <form @submit.prevent="handleSubmit">
        <div v-for="field in config.fields" :key="field.name" class="form-group">
          <label :for="field.name">{{ field.label }}</label>
          <input v-model="form[field.name]" :type="field.type || 'text'" :id="field.name" :placeholder="field.placeholder || ''" :required="field.required" />
        </div>
        <div class="form-group">
          <label for="pricingType">Pricing Type</label>
          <select v-model="form.pricingType" id="pricingType" required>
            <option value="free">Free</option>
            <option value="promotional">Promotional</option>
            <option value="paid">Paid</option>
          </select>
        </div>
        <button type="submit">{{ editId ? 'Update' : 'Create' }}</button>
      </form>
    </div>
    <table v-if="services.length">
      <thead>
        <tr>
          <th v-for="field in config.fields" :key="field.name">{{ field.label }}</th>
          <th>Pricing</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="svc in services" :key="svc._id">
          <td v-for="field in config.fields" :key="field.name">{{ svc[field.name] }}</td>
          <td>
            <span v-if="svc.pricingType === 'free'" style="color: green;">Free</span>
            <span v-else-if="svc.pricingType === 'promotional'" style="color: orange;">Promotional</span>
            <span v-else style="color: red;">Paid</span>
          </td>
          <td>
            <button @click="editService(svc)">Edit</button>
            <button @click="deleteService(svc._id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else>No services found.</div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
const props = defineProps({
  config: {
    type: Object,
    required: true
  }
})
const services = ref([])
const form = ref({})
const showForm = ref(false)
const editId = ref(null)

function resetForm() {
  form.value = {}
  editId.value = null
}

async function fetchServices() {
  const res = await fetch('/api/services')
  services.value = await res.json()
}

async function handleSubmit() {
  if (editId.value) {
    await fetch(`/api/services/${editId.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
  } else {
    await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
  }
  showForm.value = false
  resetForm()
  fetchServices()
}

function editService(svc) {
  form.value = { ...svc }
  editId.value = svc._id
  showForm.value = true
}

async function deleteService(id) {
  await fetch(`/api/services/${id}`, { method: 'DELETE' })
  fetchServices()
}

onMounted(() => {
  fetchServices()
})

watch(() => props.config, () => {
  resetForm()
  fetchServices()
})
</script>

<style scoped>
.form-section { margin: 1em 0; }
.form-group { margin-bottom: 1em; }
table { width: 100%; border-collapse: collapse; margin-top: 1em; }
th, td { border: 1px solid #ccc; padding: 0.5em; }
</style> 