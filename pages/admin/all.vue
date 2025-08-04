<template>
  <div>
    <h2>All Uploaded Documents</h2>
    <input v-model="search" placeholder="Search by name..." style="margin-bottom: 1em; padding: 6px;" />
    <select v-model="filterLayer" style="margin-left: 10px;">
      <option value="">All Layers</option>
      <option value="tenant">Tenant</option>
      <option value="organization">Organization</option>
      <option value="user">User</option>
    </select>

    <table border="1" cellspacing="0" cellpadding="6">
      <thead>
        <tr>
          <th>Document Name</th>
          <th>Layer</th>
          <th>Required</th>
          <th>Uploaded At</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="doc in paginatedDocs" :key="doc._id">
          <td>{{ doc.name }}</td>
          <td>{{ doc.layer }}</td>
          <td>{{ doc.required ? 'Yes' : 'No' }}</td>
          <td>{{ new Date(doc.uploadedAt).toLocaleString() }}</td>
          <td>
            <a :href="doc.fileUrl" target="_blank">🔍 View</a> |
            <a :href="doc.fileUrl" download>⬇️ Download</a> |
            <button @click="deleteDoc(doc._id)">🗑️ Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 1em;">
      <button :disabled="page === 1" @click="page--">Prev</button>
      Page {{ page }}
      <button :disabled="end >= filteredDocs.length" @click="page++">Next</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
const docs = ref([])
const page = ref(1)
const pageSize = 5
const search = ref('')
const filterLayer = ref('')

onMounted(async () => {
  const res = await fetch('/api/docs')
  docs.value = await res.json()
})

const filteredDocs = computed(() =>
  docs.value.filter(d =>
    d.name.toLowerCase().includes(search.value.toLowerCase()) &&
    (!filterLayer.value || d.layer === filterLayer.value)
  )
)

const start = computed(() => (page.value - 1) * pageSize)
const end = computed(() => start.value + pageSize)
const paginatedDocs = computed(() => filteredDocs.value.slice(start.value, end.value))

async function deleteDoc(id) {
  if (confirm("Are you sure you want to delete this document?")) {
    const res = await fetch(`/api/docs/${id}`, { method: 'DELETE' })
    const result = await res.json()
    if (result.success) {
      docs.value = docs.value.filter(d => d._id !== id)
    }
  }
}
</script>