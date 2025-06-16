// server/utils/db.ts
import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGO_CONNECTION_STRING as string
if (!uri) {
  throw new Error('MONGO_CONNECTION_STRING is not defined in environment variables')
}

let client: MongoClient
let db: Db

export const connectToDatabase = async () => {
  if (!client) {
    client = new MongoClient(uri)
    await client.connect()
    db = client.db() // defaults to DB name from URI
    console.log('MongoDB connected')
  }
  return { client, db }
}

export const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectToDatabase() first.')
  }
  return db
}
