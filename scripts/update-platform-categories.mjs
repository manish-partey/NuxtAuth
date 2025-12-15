// scripts/update-platform-categories.mjs
/**
 * Update existing platforms with proper categories
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:27017/nuxt-auth';

async function updatePlatformCategories() {
  try {
    console.log('🚀 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const Platform = mongoose.connection.db.collection('platforms');

    // Define category mappings based on platform names
    const categoryMappings = {
      'healthcare': /health|hospital|medical|clinic/i,
      'hospitality': /hotel|resort|restaurant|cafe|hospitality/i,
      'education': /college|university|school|education/i,
      'logistics': /logistics|shipping|delivery|cargo/i,
    };

    const platforms = await Platform.find({}).toArray();
    
    console.log('📝 Updating platform categories...\n');
    
    for (const platform of platforms) {
      let category = 'other'; // default
      
      // Auto-detect category based on name
      for (const [cat, regex] of Object.entries(categoryMappings)) {
        if (regex.test(platform.name)) {
          category = cat;
          break;
        }
      }
      
      // Update the platform
      await Platform.updateOne(
        { _id: platform._id },
        { $set: { category } }
      );
      
      console.log(`✅ Updated "${platform.name}" → category: ${category}`);
    }

    console.log('\n✅ All platforms updated!');
    console.log('\n📋 Summary:');
    
    const updatedPlatforms = await Platform.find({}).toArray();
    const byCat = {};
    updatedPlatforms.forEach(p => {
      byCat[p.category] = (byCat[p.category] || 0) + 1;
    });
    console.log(JSON.stringify(byCat, null, 2));

    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updatePlatformCategories();
