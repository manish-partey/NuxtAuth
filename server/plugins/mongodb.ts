// server/plugins/mongodb.ts
import mongoosePkg from 'mongoose';
const { connect } = mongoosePkg;

export default defineNitroPlugin(async (nitroApp) => {
  // Use process.env directly for runtime environment variables
  const mongoUri = process.env.MONGO_CONNECTION_STRING;
  
  if (!mongoUri) {
    console.error('MONGO_CONNECTION_STRING environment variable is not set');
    process.exit(1);
  }
  
  console.log('MongoDB URI found, attempting connection...');
  
  try {
    await connect(mongoUri);
    console.log('MongoDB connected successfully!');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
});
