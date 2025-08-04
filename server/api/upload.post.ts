import { defineEventHandler } from 'h3'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { connectDB } from '../db/mongo'
import Document from '../models/document'

export const config = { api: { bodyParser: false } }

export default defineEventHandler(async (event) => {
  const formidable = (await import('formidable')).default
  const form = formidable({ multiples: false })

  // Parse form fields and files
  const { fields, files } = await new Promise<any>((resolve, reject) => {
    form.parse(event.node.req, (err, fields, files) => {
      if (err) reject(err)
      else resolve({ fields, files })
    })
  })

  const file = Array.isArray(files.file) ? files.file[0] : files.file
  const data = await readFile(file.filepath)
  const uploadDir = path.resolve('public/uploads')
  if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
  const uploadPath = path.join(uploadDir, file.originalFilename)
  await writeFile(uploadPath, data)

  // Prepare metadata
  const tenantId = fields.tenantId || null
  const industryId = fields.industryId || null
  const fileUrl = '/uploads/' + file.originalFilename

  // Save metadata to MongoDB
  await connectDB()
  await Document.create({
    name: file.originalFilename,
    fileUrl,
    uploadedAt: new Date(),
    tenantId,
    industryId
    // Optionally: content: data
  })

  return { url: fileUrl }
})