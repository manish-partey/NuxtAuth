import { defineEventHandler } from 'h3'
import { connectToDatabase } from '~/server/utils/db'
// import Service from '../models/Service' // TODO: Create Service model

export default defineEventHandler(async (event) => {
  await connectToDatabase()
  
  // TODO: Implement service retrieval once Service model is created
  return { 
    success: false, 
    message: 'Service model not implemented yet',
    services: []
  }
})