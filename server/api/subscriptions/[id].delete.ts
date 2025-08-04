import { defineEventHandler } from 'h3'
import { connectDB } from '../../db/mongo'
import Subscription from '../../models/subscription'

export default defineEventHandler(async (event) => {
  await connectDB()
  const id = event.context.params?.id
  const tenantId = event.node.req.url?.split('tenantId=')[1]?.split('&')[0]
  if (!id) throw new Error('Missing subscription id')
  if (!tenantId) throw new Error('Missing tenantId')
  // Only delete if tenantId matches
  const deleted = await Subscription.findOneAndDelete({ _id: id, tenantId })
  if (!deleted) throw new Error('Subscription not found for this tenant')
  return { success: true }
}) 