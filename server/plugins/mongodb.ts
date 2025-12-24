// server/plugins/mongodb.ts
import mongoosePkg from 'mongoose';
const { connect } = mongoosePkg;

export default defineNitroPlugin(async (nitroApp) => {
  const config = useRuntimeConfig();
  
  // Debug logging
  console.log('=== MongoDB Connection Debug ===');
  console.log('config.mongodbUri:', config.mongodbUri);
  console.log('process.env.MONGO_CONNECTION_STRING:', process.env.MONGO_CONNECTION_STRING);
  console.log('mongodbUri type:', typeof config.mongodbUri);
  console.log('mongodbUri length:', config.mongodbUri?.length);
  console.log('================================');
  
  try {
    await connect(config.mongodbUri);
    console.log('MongoDB connected successfully!');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Exit the process if database connection fails,
    // or implement a retry mechanism.
    process.exit(1);
  }
});
