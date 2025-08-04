<template>
  <div>
    <h2>{{ config.title || 'Subscription Management' }}</h2>
    <button @click="showForm = !showForm">{{ showForm ? 'Close' : 'Add Subscription' }}</button>
    <div v-if="showForm" class="form-section">
      <form @submit.prevent="handleSubmit">
        <div v-for="field in config.fields" :key="field.name" class="form-group">
          <label :for="field.name">{{ field.label }}</label>
          <select v-if="field.type === 'select' && field.options" v-model="form[field.name]" :id="field.name" :required="field.required">
            <option v-for="opt in field.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <input v-else v-model="form[field.name]" :type="field.type || 'text'" :id="field.name" :placeholder="field.placeholder || ''" :required="field.required" />
        </div>
        <!-- Service selection in form -->
        <div v-if="allServices.length" class="form-group">
          <label><strong>Manage Services:</strong></label>
          <div>
            <label v-for="svc in allServices" :key="svc._id" style="margin-right: 1em;">
              <input
                type="checkbox"
                :value="svc._id"
                v-model="form.services"
              />
              {{ svc.name }}
              <span v-if="svc.pricingType === 'free'" style="color: green; font-size: 0.9em; margin-left: 0.3em;">[Free]</span>
              <span v-else-if="svc.pricingType === 'promotional'" style="color: orange; font-size: 0.9em; margin-left: 0.3em;">[Promo]</span>
              <span v-else style="color: red; font-size: 0.9em; margin-left: 0.3em;">[Paid]</span>
              <a
                v-if="svc.pricingType === 'paid'"
                href="upi://pay?pa=STATIC_UPI_ID@okicici&pn=Your+Name&am=1000&cu=INR"
                target="_blank"
                style="margin-left: 0.5em; color: blue; text-decoration: underline; font-size: 0.9em;"
              >
                Pay via UPI
              </a>
              <a
                v-if="svc.pricingType === 'paid'"
                href="https://netbanking.hdfcbank.com/netbanking/"
                target="_blank"
                style="margin-left: 0.5em; color: green; text-decoration: underline; font-size: 0.9em;"
              >
                Pay via HDFC NetBanking
              </a>
            </label>
          </div>
          <small>Check to add, uncheck to remove services for this subscription.</small>
        </div>
        <button type="submit">{{ editId ? 'Update' : 'Create' }}</button>
      </form>
    </div>
    <table v-if="subscriptions.length">
      <thead>
        <tr>
          <th v-for="field in config.fields" :key="field.name">{{ field.label }}</th>
          <th>Services</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="sub in subscriptions" :key="sub._id">
          <td v-for="field in config.fields" :key="field.name">{{ sub[field.name] }}</td>
          <td>
            <div v-if="allServices.length">
              <div><strong>Manage Services:</strong></div>
              <label v-for="svc in allServices" :key="svc._id" style="margin-right: 1em;">
                <input type="checkbox" :checked="sub.services?.includes(svc._id)" @change="toggleService(sub, svc._id)" />
                {{ svc.name }}
                <span v-if="svc.pricingType === 'free'" style="color: green; font-size: 0.9em; margin-left: 0.3em;">[Free]</span>
                <span v-else-if="svc.pricingType === 'promotional'" style="color: orange; font-size: 0.9em; margin-left: 0.3em;">[Promo]</span>
                <span v-else style="color: red; font-size: 0.9em; margin-left: 0.3em;">[Paid]</span>
                <!-- UPI payment link for paid services -->
                <a
                  v-if="svc.pricingType === 'paid'"
                  href="upi://pay?pa=STATIC_UPI_ID@okicici&pn=Your+Name&am=1000&cu=INR"
                  target="_blank"
                  style="margin-left: 0.5em; color: blue; text-decoration: underline; font-size: 0.9em;"
                >
                  Pay via UPI
                </a>
                <a
                  v-if="svc.pricingType === 'paid'"
                  href="https://netbanking.hdfcbank.com/netbanking/"
                  target="_blank"
                  style="margin-left: 0.5em; color: green; text-decoration: underline; font-size: 0.9em;"
                >
                  Pay via HDFC NetBanking
                </a>
              </label>
            </div>
          </td>
          <td>
            <button @click="editSubscription(sub)">Edit</button>
            <button @click="deleteSubscription(sub._id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else>No subscriptions found.</div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  config: {
    type: Object,
    required: true
  },
  tenantId: {
    type: String,
    required: true
  }
})
const subscriptions = ref([])
const form = ref({})
const showForm = ref(false)
const editId = ref(null)
const allServices = ref([])

async function fetchServices() {
  const res = await fetch('/api/services')
  allServices.value = await res.json()
}

function resetForm() {
  form.value = { services: [] }
  editId.value = null
}

async function fetchSubscriptions() {
  if (!props.tenantId) {
    subscriptions.value = []
    return
  }
  const res = await fetch(`/api/subscriptions?tenantId=${props.tenantId}`)
  subscriptions.value = await res.json()
}

async function handleSubmit() {
  if (!props.tenantId) return
  const payload = { ...form.value, tenantId: props.tenantId }
  if (editId.value) {
    await fetch(`/api/subscriptions/${editId.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  } else {
    await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  }
  showForm.value = false
  resetForm()
  fetchSubscriptions()
}

function editSubscription(sub) {
  form.value = { ...sub }
  // Convert date fields to 'YYYY-MM-DD' for input[type="date"]
  if (form.value.startDate) {
    form.value.startDate = form.value.startDate.slice(0, 10)
  }
  if (form.value.endDate) {
    form.value.endDate = form.value.endDate.slice(0, 10)
  }
  // Ensure services is an array for v-model
  form.value.services = Array.isArray(sub.services) ? [...sub.services] : []
  editId.value = sub._id
  showForm.value = true
}

async function deleteSubscription(id) {
  await fetch(`/api/subscriptions/${id}?tenantId=${props.tenantId}`, { method: 'DELETE' })
  fetchSubscriptions()
}

async function toggleService(sub, serviceId) {
  const isEnabled = sub.services?.includes(serviceId)
  const updatedServices = isEnabled
    ? sub.services.filter(id => id !== serviceId)
    : [...(sub.services || []), serviceId]
  await fetch(`/api/subscriptions/${sub._id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ services: updatedServices })
  })
  fetchSubscriptions()
}

onMounted(() => {
  fetchSubscriptions()
  fetchServices()
})

watch(() => props.tenantId, () => {
  resetForm()
  fetchSubscriptions()
})
</script>

<style scoped>
.form-section { margin: 1em 0; }
.form-group { margin-bottom: 1em; }
table { width: 100%; border-collapse: collapse; margin-top: 1em; }
th, td { border: 1px solid #ccc; padding: 0.5em; }
</style> 