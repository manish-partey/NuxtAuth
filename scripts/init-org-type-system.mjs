// scripts/init-org-type-system.mjs
/**
 * Initialization script for Organization Type Management System
 * 
 * This script:
 * 1. Seeds default organization types
 * 2. Initializes system configuration
 * 3. Sets up default platform settings
 * 
 * Run: node scripts/init-org-type-system.mjs
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:27017/nuxt-auth';

const DEFAULT_ORG_TYPES = [
  // Healthcare
  {
    code: 'hospital',
    name: 'Hospital',
    description: 'Medical facility providing inpatient and outpatient care',
    icon: '🏥',
    category: 'healthcare',
    scope: 'global',
    status: 'active',
    active: true,
    displayOrder: 1
  },
  {
    code: 'clinic',
    name: 'Clinic',
    description: 'Healthcare facility for outpatient medical services',
    icon: '🏥',
    category: 'healthcare',
    scope: 'global',
    status: 'active',
    active: true,
    displayOrder: 2
  },
  {
    code: 'pharmacy',
    name: 'Pharmacy',
    description: 'Store dispensing medications and medical supplies',
    icon: '💊',
    category: 'healthcare',
    scope: 'global',
    status: 'active',
    active: true,
    displayOrder: 3
  },
  {
    code: 'diagnostic_center',
    name: 'Diagnostic Center',
    description: 'Facility providing medical testing and diagnostic services',
    icon: '🔬',
    category: 'healthcare',
    scope: 'global',
    status: 'active',
    active: true,
    displayOrder: 4
  },
  // Hospitality
  {
    code: 'hotel',
    name: 'Hotel',
    description: 'Accommodation facility providing lodging services',
    icon: '🏨',
    category: 'hospitality',
    scope: 'global',
    status: 'active',
    active: true,
    displayOrder: 5
  },
  {
    code: 'resort',
    name: 'Resort',
    description: 'Vacation destination with accommodation and recreational facilities',
    icon: '🏖️',
    category: 'hospitality',
    scope: 'global',
    status: 'active',
    active: true,
    displayOrder: 6
  },
  {
    code: 'restaurant',
    name: 'Restaurant',
    description: 'Food service establishment',
    icon: '🍽️',
    category: 'hospitality',
    scope: 'global',
    status: 'active',
    active: true,
    displayOrder: 7
  },
  {
    code: 'cafe',
    name: 'Cafe',
    description: 'Casual dining establishment serving beverages and light meals',
    icon: '☕',
    category: 'hospitality',
    scope: 'global',
    status: 'active',
    active: true,
    displayOrder: 8
  },
  // Education
  {
    code: 'university',
    name: 'University',
    description: 'Higher education institution offering degrees',
    icon: '🎓',
    category: 'education',
    scope: 'global',
    status: 'active',
    active: true,
    displayOrder: 9
  },
  {
    code: 'college',
    name: 'College',
    description: 'Educational institution providing tertiary education',
    icon: '🏛️',
    category: 'education',
    scope: 'global',
    status: 'active',
    active: true,
    displayOrder: 10
  },
  {
    code: 'school',
    name: 'School',
    description: 'Primary or secondary educational institution',
    icon: '🏫',
    category: 'education',
    scope: 'global',
    status: 'active',
    active: true,
    displayOrder: 11
  }
];

const DEFAULT_CONFIGS = [
  {
    key: 'org_type_management_mode',
    value: 'centralized',
    description: 'Organization type management mode: centralized or decentralized',
    category: 'org_type_management'
  },
  {
    key: 'org_type_approval_required',
    value: true,
    description: 'Whether new organization types require super admin approval',
    category: 'org_type_management'
  },
  {
    key: 'org_type_allow_custom_per_platform',
    value: true,
    description: 'Allow platforms to create custom organization types',
    category: 'org_type_management'
  },
  {
    key: 'org_type_rate_limit_per_day',
    value: 5,
    description: 'Maximum org types a user can create per 24 hours',
    category: 'org_type_management'
  },
  {
    key: 'org_type_auto_approve_threshold',
    value: 3,
    description: 'Number of platforms using same type code to trigger promotion eligibility',
    category: 'org_type_management'
  },
  {
    key: 'org_type_review_period_days',
    value: 90,
    description: 'Days after which platform-specific types are reviewed for promotion',
    category: 'org_type_management'
  }
];

async function init() {
  console.log('🚀 Initializing Organization Type Management System...\n');
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    const orgTypesCollection = db.collection('organizationtypes');
    const configsCollection = db.collection('systemconfigs');
    
    // Seed organization types
    console.log('📝 Seeding default organization types...');
    let typesCreated = 0;
    let typesSkipped = 0;
    
    for (const type of DEFAULT_ORG_TYPES) {
      const existing = await orgTypesCollection.findOne({ 
        code: type.code, 
        scope: 'global' 
      });
      
      if (existing) {
        console.log(`   ⏭️  Skipped "${type.name}" (already exists)`);
        typesSkipped++;
      } else {
        await orgTypesCollection.insertOne({
          ...type,
          usageCount: 0,
          promotionEligible: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`   ✅ Created "${type.name}"`);
        typesCreated++;
      }
    }
    
    console.log(`\n📊 Organization Types Summary:`);
    console.log(`   ✅ Created: ${typesCreated}`);
    console.log(`   ⏭️  Skipped: ${typesSkipped}`);
    
    // Initialize system configuration
    console.log('\n⚙️  Initializing system configuration...');
    let configsCreated = 0;
    let configsSkipped = 0;
    
    for (const config of DEFAULT_CONFIGS) {
      const existing = await configsCollection.findOne({ key: config.key });
      
      if (existing) {
        console.log(`   ⏭️  Skipped "${config.key}" (already exists)`);
        configsSkipped++;
      } else {
        await configsCollection.insertOne({
          ...config,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`   ✅ Created "${config.key}"`);
        configsCreated++;
      }
    }
    
    console.log(`\n📊 Configuration Summary:`);
    console.log(`   ✅ Created: ${configsCreated}`);
    console.log(`   ⏭️  Skipped: ${configsSkipped}`);
    
    console.log('\n✅ Initialization completed successfully!\n');
    
    console.log('📋 Next Steps:');
    console.log('   1. Review system configuration in admin panel');
    console.log('   2. Configure platform allowed organization types');
    console.log('   3. Run migration script if you have existing organizations');
    console.log('      node scripts/migrate-organization-types.mjs\n');
    
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run initialization
init();
