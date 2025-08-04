import { defineEventHandler, readBody } from 'h3'
import { connectDB } from '../../db/mongo'
import Service from '../../models/service'

export default defineEventHandler(async (event) => {
  await connectDB()
  const id = event.context.params?.id
  if (!id) throw new Error('Missing service id')
  const body = await readBody(event)
  const updated = await Service.findByIdAndUpdate(id, body, { new: true })
  return updated
}) 