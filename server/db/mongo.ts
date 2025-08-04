import mongoose from 'mongoose'

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return
  const uri = process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:27017/your-db-name'
  await mongoose.connect(uri)
}