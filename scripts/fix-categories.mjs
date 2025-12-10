// scripts/fix-categories.mjs
/**
 * Fix organization type categories to lowercase
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:27017/nuxt-auth';

async function fixCategories() {
  try {
    console.log('🚀 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const OrganizationType = mongoose.model('OrganizationType', new mongoose.Schema({}, { strict: false }));

    // Update Healthcare -> healthcare
    const healthcareResult = await OrganizationType.updateMany(
      { category: 'Healthcare' },
      { $set: { category: 'healthcare' } }
    );
    console.log(`✅ Updated ${healthcareResult.modifiedCount} Healthcare -> healthcare`);

    // Update Hospitality -> hospitality
    const hospitalityResult = await OrganizationType.updateMany(
      { category: 'Hospitality' },
      { $set: { category: 'hospitality' } }
    );
    console.log(`✅ Updated ${hospitalityResult.modifiedCount} Hospitality -> hospitality`);

    // Update Education -> education
    const educationResult = await OrganizationType.updateMany(
      { category: 'Education' },
      { $set: { category: 'education' } }
    );
    console.log(`✅ Updated ${educationResult.modifiedCount} Education -> education`);

    // Update Logistics -> logistics (if any)
    const logisticsResult = await OrganizationType.updateMany(
      { category: 'Logistics' },
      { $set: { category: 'logistics' } }
    );
    console.log(`✅ Updated ${logisticsResult.modifiedCount} Logistics -> logistics`);

    // Update Other -> other (if any)
    const otherResult = await OrganizationType.updateMany(
      { category: 'Other' },
      { $set: { category: 'other' } }
    );
    console.log(`✅ Updated ${otherResult.modifiedCount} Other -> other`);

    console.log('\n✅ All categories fixed!');

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixCategories();
