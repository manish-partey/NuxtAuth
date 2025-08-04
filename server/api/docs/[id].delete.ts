import { defineEventHandler } from 'h3'
import { connectDB } from '../../db/mongo'
import Document from '../../models/document'

export default defineEventHandler(async (event) => {
  await connectDB()
  const id = event.context.params.id
  const deleted = await Document.findByIdAndDelete(id)
  return { success: !!deleted }
})