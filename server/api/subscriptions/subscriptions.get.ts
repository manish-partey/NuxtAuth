import { defineEventHandler } from 'h3'
import { connectDB } from '../../db/mongo'
import Subscription from '../../models/subscription'

export default defineEventHandler(async (event) => {
  await connectDB()
  const url = event.node.req.url || ''
  const tenantId = url.split('tenantId=')[1]?.split('&')[0]
  if (!tenantId) {
    return []
  }
  const subs = await Subscription.find({ tenantId })
  return subs
})