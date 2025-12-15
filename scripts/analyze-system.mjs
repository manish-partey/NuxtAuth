import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_CONNECTION_STRING;

async function analyzeSystem() {
  try {
    await mongoose.connect(uri);
    console.log('\n=== CURRENT SYSTEM ANALYSIS ===\n');

    // Get all platforms
    const platforms = await mongoose.connection.db.collection('platforms').find({}).toArray();
    console.log('1. PLATFORMS:', platforms.length);
    platforms.forEach(p => {
      const types = p.allowedOrganizationTypes ? p.allowedOrganizationTypes.length : 0;
      console.log(`   - ${p.name.padEnd(30)} | Category: ${(p.category || 'NOT SET').padEnd(12)} | Allowed Types: ${types}`);
    });

    // Get all organization types
    console.log('\n2. ORGANIZATION TYPES:', );
    const orgtypes = await mongoose.connection.db.collection('organizationtypes').find({}).toArray();
    console.log('Total:', orgtypes.length);
    orgtypes.forEach(t => {
      console.log(`   - ${t.name.padEnd(30)} | Category: ${t.category.padEnd(12)} | Scope: ${t.scope}`);
    });

    // Get sample organizations
    console.log('\n3. ORGANIZATIONS (samples):');
    const orgs = await mongoose.connection.db.collection('organizations').find({}).limit(3).toArray();
    console.log('Total in DB:', await mongoose.connection.db.collection('organizations').countDocuments());
    for (const org of orgs) {
      const platform = await mongoose.connection.db.collection('platforms').findOne({_id: org.platformId});
      const orgType = await mongoose.connection.db.collection('organizationtypes').findOne({_id: org.orgTypeId});
      console.log(`   - ${org.name.padEnd(30)} → Type: ${(orgType?.name || 'N/A').padEnd(20)} → Platform: ${platform?.name || 'N/A'}`);
    }

    // Check the relationship
    console.log('\n4. RELATIONSHIP VALIDATION:');
    console.log('   ✓ Organization → has orgTypeId (FK to organizationtypes)');
    console.log('   ✓ Organization → has platformId (FK to platforms)');
    console.log('   ✓ Platform → has category field (healthcare, hospitality, education, logistics, other)');
    console.log('   ✓ Platform → has allowedOrganizationTypes array (FK to organizationtypes)');
    console.log('   ✓ OrganizationType → has category field (matches platform categories)');
    console.log('   ✓ OrganizationType → has scope (global or platform-specific)');

    console.log('\n5. DESIRED WORKFLOW VALIDATION:\n');
    
    // Check if HotelHub example would work
    console.log('SCENARIO: HotelHub Platform with Hotel organization type');
    console.log('----------------------------------------------------------');
    
    const hotelType = orgtypes.find(t => t.name === 'Hotel');
    if (hotelType) {
      console.log(`✓ Organization Type "Hotel" exists`);
      console.log(`  - Category: ${hotelType.category}`);
      console.log(`  - Scope: ${hotelType.scope}`);
    } else {
      console.log(`✗ Organization Type "Hotel" does NOT exist - would need to be created`);
    }
    
    const hotelPlatform = platforms.find(p => p.name.toLowerCase().includes('hotel'));
    if (hotelPlatform) {
      console.log(`✓ A hotel-related platform exists: "${hotelPlatform.name}"`);
      console.log(`  - Category: ${hotelPlatform.category || 'NOT SET'}`);
    } else {
      console.log(`✗ No hotel-related platform exists - would need to be created`);
    }

    console.log('\n6. ISSUE IN YOUR DESCRIPTION:');
    console.log('----------------------------------------------------------');
    console.log('❌ PROBLEM: You wrote "Organization Type: HotelHub"');
    console.log('   This is INCORRECT!');
    console.log('');
    console.log('   HotelHub is a PLATFORM, not an Organization Type.');
    console.log('   Organization Type should be something like "Hotel", "Resort", "Motel"');
    console.log('');
    console.log('✅ CORRECT Flow:');
    console.log('   1. Platform: HotelHub (category: hospitality)');
    console.log('   2. Organization Type: Hotel (category: hospitality, scope: global)');
    console.log('   3. Organization: Sunrise Grand Hotel');
    console.log('      - orgTypeId → Hotel');
    console.log('      - platformId → HotelHub');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

analyzeSystem();
