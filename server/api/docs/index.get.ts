
import { defineEventHandler } from 'h3'
import { connectDB } from '../../db/mongo'
import Document from '../../models/document'

export default defineEventHandler(async () => {
  await connectDB()
  const docs = await Document.find({})
  return { documents: docs }
})
