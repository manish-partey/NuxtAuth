import { defineEventHandler } from 'h3'
import { connectDB } from '../db/mongo'
import Service from '../models/service'

export default defineEventHandler(async (event) => {
  await connectDB()
  const services = await Service.find({})
  return services
})