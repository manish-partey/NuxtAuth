// scripts/migrate-organization-types.mjs
/**
 * Migration script to convert Organization.type from String to ObjectId
 * 
 * Steps:
 * 1. Loads all organizations with string type
 * 2. Matches each type string to OrganizationType.code
 * 3. Updates Organization.type to ObjectId reference
 * 4. Preserves original string in Organization.typeString for rollback
 * 5. Increments usageCount on each OrganizationType
 * 
 * Run: node scripts/migrate-organization-types.mjs
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nuxt-auth';

async function migrate() {
  console.log('🚀 Starting organization type migration...\n');
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    const organizationsCollection = db.collection('organizations');
    const orgTypesCollection = db.collection('organizationtypes');
    
    // Get all organizations
    const organizations = await organizationsCollection.find({}).toArray();
    console.log(`📊 Found ${organizations.length} organizations\n`);
    
    // Get all organization types
    const orgTypes = await orgTypesCollection.find({ status: 'active' }).toArray();
    const typeMap = new Map(orgTypes.map(t => [t.code, t._id]));
    console.log(`📊 Loaded ${orgTypes.size} organization types\n`);
    
    let migrated = 0;
    let skipped = 0;
    let failed = 0;
    const unmatchedTypes = new Set();
    
    for (const org of organizations) {
      // Skip if already migrated (type is ObjectId)
      if (org.type instanceof mongoose.Types.ObjectId) {
        skipped++;
        continue;
      }
      
      // Skip if type is null or undefined
      if (!org.type) {
        console.warn(`⚠️  Organization "${org.name}" has no type, skipping...`);
        skipped++;
        continue;
      }
      
      const typeString = org.type.toString().toLowerCase();
      
      // Try exact match first
      let matchedTypeId = typeMap.get(typeString);
      
      // Try common variations
      if (!matchedTypeId) {
        const variations = [
          typeString.replace(/\s+/g, '_'),
          typeString.replace(/_/g, ' '),
          typeString.replace(/-/g, '_'),
        ];
        
        for (const variation of variations) {
          matchedTypeId = typeMap.get(variation);
          if (matchedTypeId) break;
        }
      }
      
      if (matchedTypeId) {
        try {
          await organizationsCollection.updateOne(
            { _id: org._id },
            {
              $set: {
                type: matchedTypeId,
                typeString: org.type // Preserve original string
              }
            }
          );
          
          // Increment usage count
          await orgTypesCollection.updateOne(
            { _id: matchedTypeId },
            { $inc: { usageCount: 1 } }
          );
          
          migrated++;
          console.log(`✅ Migrated "${org.name}": ${org.type} → ${matchedTypeId}`);
        } catch (error) {
          console.error(`❌ Failed to migrate "${org.name}":`, error.message);
          failed++;
        }
      } else {
        unmatchedTypes.add(typeString);
        console.warn(`⚠️  No matching type for "${org.name}": "${typeString}"`);
        failed++;
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Migrated: ${migrated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Failed: ${failed}`);
    
    if (unmatchedTypes.size > 0) {
      console.log('\n⚠️  Unmatched types found:');
      unmatchedTypes.forEach(type => console.log(`   - ${type}`));
      console.log('\n💡 Recommendation: Create these types manually or update organizations to use existing types.');
    }
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run migration
migrate();
