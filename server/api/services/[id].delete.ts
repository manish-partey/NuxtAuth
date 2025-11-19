import { defineEventHandler } from 'h3'
import { connectToDatabase } from '~/server/utils/db'
// import Service from '../../models/Service' // TODO: Create Service model

export default defineEventHandler(async (event) => {
  await connectToDatabase()
  const id = event.context.params?.id
  if (!id) throw new Error('Missing service id')
  
  // TODO: Implement service deletion once Service model is created
  return { 
    success: false, 
    message: 'Service model not implemented yet',
    id 
  }
}) 