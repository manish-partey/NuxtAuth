import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_CONNECTION_STRING;
if (!uri) {
  throw new Error("MONGO_CONNECTION_STRING is not defined in environment variables");
}
let client;
let db;
const connectToDatabase = async () => {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db();
    console.log("MongoDB connected");
  }
  return { client, db };
};
const getDb = () => {
  if (!db) {
    throw new Error("Database not initialized. Call connectToDatabase() first.");
  }
  return db;
};

export { connectToDatabase as c, getDb as g };
//# sourceMappingURL=db.mjs.map
