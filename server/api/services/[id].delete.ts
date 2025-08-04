import { defineEventHandler } from 'h3'
import { connectDB } from '../../db/mongo'
import Service from '../../models/service'

export default defineEventHandler(async (event) => {
  await connectDB()
  const id = event.context.params?.id
  if (!id) throw new Error('Missing service id')
  await Service.findByIdAndDelete(id)
  return { success: true }
}) 