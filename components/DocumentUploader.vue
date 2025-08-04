
<template>
  <div>
    <h2>{{ tenant.toUpperCase() }} - {{ industry.toUpperCase() }} Document Upload</h2>
    <div v-if="industryConfig">
      <div>
        <h3>Required Documents</h3>
        <div v-for="doc in industryConfig.required" :key="doc.name" style="margin-bottom: 1em;">
          <label>{{ doc.name }} <span>*</span></label>
          <input type="file" @change="e => handleFileUpload(e, doc)" />
          <span v-if="uploaded[doc.name]">✅ Uploaded</span>
        </div>
      </div>
      <div>
        <h3>Optional Documents</h3>
        <div v-for="doc in industryConfig.optional" :key="doc.name" style="margin-bottom: 1em;">
          <label>{{ doc.name }}</label>
          <input type="file" @change="e => handleFileUpload(e, doc)" />
          <span v-if="uploaded[doc.name]">✅ Uploaded</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
const props = defineProps({ tenant: String, industry: String })
const config = ref({})
const uploaded = ref({})

onMounted(async () => {
  const res = await fetch('/api/docs-config')
  config.value = await res.json()
})

const industryConfig = computed(() => {
  return config.value[props.tenant]?.[props.industry] || { required: [], optional: [] }
})

async function handleFileUpload(e, doc) {
  const file = e.target.files[0]
  const formData = new FormData()
  formData.append('file', file)
  formData.append('tenantId', props.tenant)
  formData.append('industryId', props.industry)

  const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
  const { url } = await uploadRes.json()

  await fetch('/api/docs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: doc.name,
      fileUrl: url,
      required: industryConfig.value.required.some(d => d.name === doc.name),
      tenant: props.tenant,
      industry: props.industry,
      uploadedAt: new Date()
    })
  })

  uploaded.value[doc.name] = true
}
</script>
