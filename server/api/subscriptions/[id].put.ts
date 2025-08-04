import { defineEventHandler, readBody } from 'h3'
import { connectDB } from '../../db/mongo'
import Subscription from '../../models/subscription'

export default defineEventHandler(async (event) => {
  await connectDB()
  const id = event.context.params?.id
  if (!id) throw new Error('Missing subscription id')
  const body = await readBody(event)
  if (!body.tenantId) throw new Error('Missing tenantId')
  // Only update if tenantId matches
  const updated = await Subscription.findOneAndUpdate({ _id: id, tenantId: body.tenantId }, body, { new: true })
  if (!updated) throw new Error('Subscription not found for this tenant')
  return updated
}) 