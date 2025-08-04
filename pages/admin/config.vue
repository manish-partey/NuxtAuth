
<template>
  <div>
    <h2>Configure Document Requirements</h2>
    <form @submit.prevent="saveConfig">
      <!-- Tenant Selection -->
      <div>
        <label>Tenant:</label>
        <select v-model="selectedTenant">
          <option v-for="tenant in tenantList" :key="tenant" :value="tenant">{{ tenant }}</option>
        </select>
        <input v-model="newTenant" placeholder="Add new tenant" />
        <button v-if="selectedTenant" type="button" @click="deleteTenant">Delete Tenant</button>
      </div>
      <br />
      <!-- Industry Selection -->
      <div v-if="selectedTenant">
        <label>Industry:</label>
        <select v-model="selectedIndustry">
          <option v-for="industry in industryList" :key="industry" :value="industry">{{ industry }}</option>
        </select>
        <input v-model="newIndustry" placeholder="Add new industry" />
        <button v-if="selectedIndustry" type="button" @click="deleteIndustry">Delete Industry</button>
      </div>
      <br />
      <!-- Required/Optional Docs -->
      <div v-if="selectedTenant && selectedIndustry">
        <h3>Required Documents</h3>
        <div v-for="(doc, i) in requiredDocs" :key="'req-' + i" style="margin-bottom:1em;">
          <input v-model="doc.name" placeholder="Document Name" />
          <button type="button" @click="removeDoc('required', i)">Remove</button>
          <!-- Upload for required doc -->
          <input type="file" :id="'req-upload-' + i" style="margin-left:1em;" @change="e => handleNamedFileUpload(e, doc.name, true)" />
          <span v-if="uploadingDoc[doc.name]">Uploading...</span>
          <template v-if="getUploadedDoc(doc.name)">
            <a :href="getUploadedDoc(doc.name).fileUrl" target="_blank">View</a>
          </template>
        </div>
        <button type="button" @click="addDoc('required')">Add Required Doc</button>
        <h3>Optional Documents</h3>
        <div v-for="(doc, i) in optionalDocs" :key="'opt-' + i" style="margin-bottom:1em;">
          <input v-model="doc.name" placeholder="Document Name" />
          <button type="button" @click="removeDoc('optional', i)">Remove</button>
          <!-- Upload for optional doc -->
          <input type="file" :id="'opt-upload-' + i" style="margin-left:1em;" @change="e => handleNamedFileUpload(e, doc.name, false)" />
          <span v-if="uploadingDoc[doc.name]">Uploading...</span>
          <template v-if="getUploadedDoc(doc.name)">
            <a :href="getUploadedDoc(doc.name).fileUrl" target="_blank">View</a>
          </template>
        </div>
        <button type="button" @click="addDoc('optional')">Add Optional Doc</button>
      </div>
      <br />
      <button type="submit">Save</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
const config = ref({})
const selectedTenant = ref('')
const selectedIndustry = ref('')
const newTenant = ref('')
const newIndustry = ref('')
const requiredDocs = ref([])
const optionalDocs = ref([])

const tenantList = ref([])
const industryList = ref([])

// Upload state
const uploading = ref(false)
const uploadError = ref('')
const uploadedDocs = ref([])
const uploadingDoc = ref({}) // { [docName]: boolean }

onMounted(async () => {
  const res = await fetch('/api/docs-config')
  config.value = await res.json()
  tenantList.value = Object.keys(config.value)
  await fetchUploadedDocs()
})

watch(selectedTenant, (tenant) => {
  if (tenant) {
    industryList.value = Object.keys(config.value[tenant] || {})
    selectedIndustry.value = industryList.value[0] || ''
  } else {
    industryList.value = []
    selectedIndustry.value = ''
  }
  fetchUploadedDocs()
})

watch(selectedIndustry, () => {
  fetchUploadedDocs()
})

watch([selectedTenant, selectedIndustry], ([tenant, industry]) => {
  if (tenant && industry) {
    const industryConfig = config.value[tenant]?.[industry] || { required: [], optional: [] }
    requiredDocs.value = JSON.parse(JSON.stringify(industryConfig.required || []))
    optionalDocs.value = JSON.parse(JSON.stringify(industryConfig.optional || []))
  } else {
    requiredDocs.value = []
    optionalDocs.value = []
  }
})

function addTenant() {
  const tenant = newTenant.value.trim()
  if (tenant && !config.value[tenant]) {
    config.value[tenant] = {}
    config.value = { ...config.value } // Force reactivity
    tenantList.value.push(tenant)
    selectedTenant.value = tenant
    newTenant.value = ''
    industryList.value = []
    selectedIndustry.value = ''
  }
}

function deleteTenant() {
  if (selectedTenant.value && config.value[selectedTenant.value]) {
    delete config.value[selectedTenant.value]
    const idx = tenantList.value.indexOf(selectedTenant.value)
    if (idx !== -1) tenantList.value.splice(idx, 1)
    selectedTenant.value = tenantList.value[0] || ''
  }
}

function addIndustry() {
  const industry = newIndustry.value.trim()
  if (selectedTenant.value && industry && !config.value[selectedTenant.value][industry]) {
    config.value[selectedTenant.value][industry] = { required: [], optional: [] }
    config.value[selectedTenant.value] = { ...config.value[selectedTenant.value] } // Force reactivity
    industryList.value = Object.keys(config.value[selectedTenant.value])
    selectedIndustry.value = industry
    newIndustry.value = ''
  }
}

function deleteIndustry() {
  if (selectedTenant.value && selectedIndustry.value && config.value[selectedTenant.value][selectedIndustry.value]) {
    delete config.value[selectedTenant.value][selectedIndustry.value]
    const idx = industryList.value.indexOf(selectedIndustry.value)
    if (idx !== -1) industryList.value.splice(idx, 1)
    selectedIndustry.value = industryList.value[0] || ''
  }
}

function addDoc(type) {
  if (type === 'required') requiredDocs.value.push({ name: '' })
  else optionalDocs.value.push({ name: '' })
}

function removeDoc(type, idx) {
  if (type === 'required') requiredDocs.value.splice(idx, 1)
  else optionalDocs.value.splice(idx, 1)
}

async function saveConfig() {
  if (selectedTenant.value && selectedIndustry.value) {
    config.value[selectedTenant.value][selectedIndustry.value] = {
      required: requiredDocs.value.filter(d => d.name.trim()),
      optional: optionalDocs.value.filter(d => d.name.trim())
    }
  }
  await fetch('/api/docs-config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config.value)
  })
  alert('Saved!')
}

async function handleNamedFileUpload(e, docName, isRequired) {
  const file = e.target.files[0]
  if (!file) return
  uploadingDoc.value[docName] = true
  try {
    // Upload file
    const formData = new FormData()
    formData.append('file', file)
    const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
    const { url } = await uploadRes.json()
    // Save doc record
    await fetch('/api/docs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: docName,
        fileUrl: url,
        required: isRequired,
        tenant: selectedTenant.value,
        industry: selectedIndustry.value,
        uploadedAt: new Date()
      })
    })
    await fetchUploadedDocs()
  } catch (err) {
    uploadError.value = 'Upload failed.'
  } finally {
    uploadingDoc.value[docName] = false
  }
}

function getUploadedDoc(docName) {
  return uploadedDocs.value.find(
    d => d.name === docName && d.tenant === selectedTenant.value && d.industry === selectedIndustry.value
  )
}

async function fetchUploadedDocs() {
  if (!selectedTenant.value || !selectedIndustry.value) {
    uploadedDocs.value = []
    return
  }
  try {
    const res = await fetch('/api/docs')
    const data = await res.json()
    uploadedDocs.value = (data.documents || []).filter(
      d => d.tenant === selectedTenant.value && d.industry === selectedIndustry.value
    )
  } catch {
    uploadedDocs.value = []
  }
}
</script>
