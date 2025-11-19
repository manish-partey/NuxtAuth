import { defineEventHandler, readBody } from 'h3'
import { connectToDatabase } from '~/server/utils/db'
// import Service from '../models/Service' // TODO: Create Service model

export default defineEventHandler(async (event) => {
  await connectToDatabase()
  const body = await readBody(event)
  
  // TODO: Implement service creation once Service model is created
  return { 
    success: false, 
    message: 'Service model not implemented yet',
    data: body 
  }
}) 