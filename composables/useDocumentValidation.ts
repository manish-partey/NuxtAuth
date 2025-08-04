export async function useDocumentValidation(tenant: string, industry: string) {
  try {
    const [configRes, docsRes] = await Promise.all([
      fetch('/api/docs-config'),
      fetch('/api/docs')
    ])
    console.log('inside usedocumentvalidation')
    const config = await configRes.json()
    const allDocsResponse = await docsRes.json()
    const allDocs = allDocsResponse.documents || []
    console.log(allDocs)
    // Get required and optional docs for the given tenant and industry
    const industryConfig = config[tenant]?.[industry] || { required: [], optional: [] }
    const requiredDocs = industryConfig.required || []
    const optionalDocs = industryConfig.optional || []
    console.log('required', requiredDocs)
    const uploadedDocs = allDocs.filter((doc: any) => doc.tenant === tenant && doc.industry === industry)
    console.log('uploadedDocs', uploadedDocs)
    const missing = requiredDocs.filter((req: any) => {
      return !uploadedDocs.some((uploaded: any) => uploaded.name === req.name)
    })

    return {
      missing,
      isComplete: missing.length === 0,
      requiredDocs,
      optionalDocs,
      uploadedDocs
    }
  } catch (err) {
    console.error('Document validation failed:', err)
    return {
      missing: [],
      isComplete: false,
      requiredDocs: [],
      optionalDocs: [],
      uploadedDocs: []
    }
  }
}
