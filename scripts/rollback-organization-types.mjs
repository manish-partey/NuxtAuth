// scripts/rollback-organization-types.mjs
/**
 * Rollback script to revert Organization.type from ObjectId to String
 * 
 * This script restores the original string values from Organization.typeString
 * Use if migration causes issues and you need to rollback
 * 
 * Run: node scripts/rollback-organization-types.mjs
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nuxt-auth';

async function rollback() {
  console.log('🔄 Starting organization type rollback...\n');
  
  const confirm = process.argv.includes('--confirm');
  
  if (!confirm) {
    console.error('⚠️  This will rollback all organization types to string format.');
    console.error('⚠️  Add --confirm flag to proceed: node scripts/rollback-organization-types.mjs --confirm');
    process.exit(0);
  }
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    const organizationsCollection = db.collection('organizations');
    const orgTypesCollection = db.collection('organizationtypes');
    
    // Get all organizations with ObjectId type
    const organizations = await organizationsCollection.find({
      type: { $type: 'objectId' },
      typeString: { $exists: true }
    }).toArray();
    
    console.log(`📊 Found ${organizations.length} organizations to rollback\n`);
    
    let rolledBack = 0;
    let failed = 0;
    
    for (const org of organizations) {
      try {
        await organizationsCollection.updateOne(
          { _id: org._id },
          {
            $set: {
              type: org.typeString
            }
          }
        );
        
        // Decrement usage count
        if (org.type instanceof mongoose.Types.ObjectId) {
          await orgTypesCollection.updateOne(
            { _id: org.type },
            { $inc: { usageCount: -1 } }
          );
        }
        
        rolledBack++;
        console.log(`✅ Rolled back "${org.name}": ObjectId → ${org.typeString}`);
      } catch (error) {
        console.error(`❌ Failed to rollback "${org.name}":`, error.message);
        failed++;
      }
    }
    
    console.log('\n📊 Rollback Summary:');
    console.log(`   ✅ Rolled back: ${rolledBack}`);
    console.log(`   ❌ Failed: ${failed}`);
    
    console.log('\n✅ Rollback completed successfully!');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run rollback
rollback();
