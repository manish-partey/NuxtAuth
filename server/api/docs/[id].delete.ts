import { defineEventHandler, createError } from 'h3'
import { connectDB } from '../../db/mongo'
import Document from '../../models/document'

export default defineEventHandler(async (event) => {
  await connectDB()
  const id = event.context.params?.id
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID parameter is required' })
  }
  const deleted = await Document.findByIdAndDelete(id)
  return { success: !!deleted }
})