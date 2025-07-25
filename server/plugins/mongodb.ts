// server/plugins/mongodb.ts
import mongoosePkg from 'mongoose';
const { connect } = mongoosePkg;

export default defineNitroPlugin(async (nitroApp) => {
  const config = useRuntimeConfig();
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
