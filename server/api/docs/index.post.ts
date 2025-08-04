
import { defineEventHandler, readBody } from 'h3'
import { connectDB } from '../../db/mongo'
import Document from '../../models/document'
import { readFile } from 'fs/promises'
import path from 'path'

export default defineEventHandler(async (event) => {
  await connectDB()
  const body = await readBody(event)

  // If fileUrl is present, read file content from disk
  let content
  if (body.fileUrl) {
    try {
      let filePath = body.fileUrl.startsWith('/') ? body.fileUrl.slice(1) : body.fileUrl
      filePath = path.resolve(filePath)
      const fileData = await readFile(filePath)
      content = Buffer.isBuffer(fileData) ? fileData : Buffer.from(fileData)
    } catch (e) {
      content = undefined
    }
  }

  const doc = await Document.create({ ...body, content })
  return { success: true, doc }
})
