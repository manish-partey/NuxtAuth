import { defineEventHandler, readBody, createError } from 'h3'
import { connectDB } from '../../db/mongo'
import Subscription from '../../models/subscription'

export default defineEventHandler(async (event) => {
  await connectDB()
  const body = await readBody(event)
  if (!body.tenantId) {
    throw createError({ statusCode: 400, statusMessage: 'tenantId is required' })
  }
  const sub = await Subscription.create(body)
  return sub
}) 