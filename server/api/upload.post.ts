import { defineEventHandler, createError } from 'h3'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { connectDB } from '~/server/db/mongo'
import Document from '~/server/models/document'

export const config = { api: { bodyParser: false } }

export default defineEventHandler(async (event) => {
  const formidable = (await import('formidable')).default
  const form = formidable({ multiples: false })

  const parsed: any = await new Promise((resolve, reject) => {
    form.parse(event.node.req, (err: any, fields: any, files: any) => {
      if (err) return reject(err)
      resolve({ fields, files })
    })
  })

  const { fields, files } = parsed
  const incomingFile = Array.isArray(files?.file) ? files.file[0] : files?.file
  if (!incomingFile) throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })

  const data = await readFile(incomingFile.filepath)
  const uploadDir = path.resolve(process.cwd(), 'public', 'uploads')
  if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })

  // avoid filename collisions by prefixing timestamp
  const safeName = `${Date.now()}-${incomingFile.originalFilename}`
  const uploadPath = path.join(uploadDir, safeName)
  await writeFile(uploadPath, data)

  const fileUrl = `/uploads/${safeName}`

  // Try to persist metadata, but don't fail the request if DB/schema differs
  try {
    await connectDB()
    // Use best-effort fields; Document schema may vary across branches
    await Document.create({
      name: incomingFile.originalFilename || safeName,
      originalName: incomingFile.originalFilename || safeName,
      fileUrl,
      mimeType: incomingFile.mimetype || incomingFile.type || 'application/octet-stream',
      size: incomingFile.size || data.length,
      uploadedAt: new Date()
    } as any)
  } catch (err) {
    // Log and continue — failing to write metadata should not block the file upload
    // eslint-disable-next-line no-console
    console.warn('[upload.post] failed to save document metadata:', (err as any)?.message || err)
  }

  return { url: fileUrl }
})