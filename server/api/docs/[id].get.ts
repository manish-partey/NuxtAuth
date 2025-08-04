import { defineEventHandler, send } from 'h3'
import { connectDB } from '../../db/mongo'
import Document from '../../models/document'

export default defineEventHandler(async (event) => {
  await connectDB()
  const params = event.context && event.context.params ? event.context.params : {}
  const id = params.id
  if (!id) {
    event.res.statusCode = 400
    return { error: 'Missing document id' }
  }
  const doc = await Document.findById(id)
  if (!doc || !doc.content) {
    event.res.statusCode = 404
    return { error: 'File not found' }
  }
  // Set headers for file download
  event.res.setHeader('Content-Type', 'application/octet-stream')
  event.res.setHeader('Content-Disposition', `attachment; filename="${doc.name || 'file'}"`)
  return send(event, doc.content)
}) 