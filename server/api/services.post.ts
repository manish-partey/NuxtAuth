import { defineEventHandler, readBody } from 'h3'
import { connectDB } from '../db/mongo'
import Service from '../models/service'

export default defineEventHandler(async (event) => {
  await connectDB()
  const body = await readBody(event)
  const service = await Service.create(body)
  return service
}) 