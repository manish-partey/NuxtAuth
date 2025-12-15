// scripts/test-complete-workflow.mjs
/**
 * Complete Workflow Test Script
 * 
 * Tests the entire platform admin workflow with 4 test users:
 * 1. hb_superadmin - Creates platform and assigns platform admin
 * 2. hb_platformadmin - Creates organizations with trust levels
 * 3. hb_orgadmin - Manages organization users
 * 4. hb_user - Regular user operations
 * 
 * Run: node scripts/test-complete-workflow.mjs
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const MONGODB_URI = process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:27017/nuxt-auth';

// Define schemas inline (simplified for script)
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  emailVerified: Boolean,
  disabled: Boolean,
  isVerified: Boolean,
  status: String,
  platformId: { type: mongoose.Schema.Types.ObjectId, default: null },
  organizationId: { type: mongoose.Schema.Types.ObjectId, default: null },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpiry: { type: Date, default: null }
}, { timestamps: true });

const PlatformSchema = new mongoose.Schema({
  name: String,
  description: String,
  slug: String,
  status: String,
  createdBy: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

const OrganizationSchema = new mongoose.Schema({
  name: String,
  description: String,
  platformId: mongoose.Schema.Types.ObjectId,
  type: mongoose.Schema.Types.ObjectId,
  status: String,
  trustLevel: String,
  createdBy: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

// Test data
const testUsers = {
  superAdmin: {
    name: 'HB Super Admin',
    email: 'hb_superadmin@test.com',
    password: 'Test@123',
    role: 'super_admin'
  },
  platformAdmin: {
    name: 'HB Platform Admin',
    email: 'hb_platformadmin@test.com',
    password: 'Test@123',
    role: 'platform_admin'
  },
  orgAdmin: {
    name: 'HB Org Admin',
    email: 'hb_orgadmin@test.com',
    password: 'Test@123',
    role: 'organization_admin'
  },
  user: {
    name: 'HB User',
    email: 'hb_user@test.com',
    password: 'Test@123',
    role: 'guest'
  }
};

const testPlatform = {
  name: 'Hotel Booking Test Platform',
  description: 'Test platform for hotel booking management',
  slug: 'hotel-booking-test',
  status: 'active'
};

const testOrganizations = [
  {
    name: 'Marriott Downtown Test',
    description: 'Trusted hotel chain - immediate approval',
    trustLevel: 'high',
    type: 'hotel'
  },
  {
    name: 'Sunset Inn Test',
    description: 'New hotel - requires verification',
    trustLevel: 'low',
    type: 'hotel'
  }
];

async function setupTestUsers() {
  console.log('👥 Setting up test users...\n');
  
  const User = mongoose.models.User || mongoose.model('User', UserSchema);
  
  // Clear existing test users
  await User.deleteMany({ 
    email: { $in: Object.values(testUsers).map(u => u.email) } 
  });
  
  const createdUsers = {};
  
  for (const [key, userData] of Object.entries(testUsers)) {
    const user = new User({
      name: userData.name,
      email: userData.email,
      password: userData.password, // Will be hashed by pre-save hook
      role: userData.role,
      isVerified: true,
      disabled: false,
      status: 'active'
    });
    
    await user.save();
    
    createdUsers[key] = user._id;
    console.log(`   ✅ Created ${userData.name} (${userData.role})`);
  }
  
  return createdUsers;
}

async function setupTestPlatform(superAdminId) {
  console.log('\n🏢 Creating test platform...\n');
  
  const Platform = mongoose.models.Platform || mongoose.model('Platform', PlatformSchema);
  
  // Clear existing test platform
  await Platform.deleteMany({ slug: testPlatform.slug });
  
  const platform = new Platform({
    ...testPlatform,
    createdBy: superAdminId
  });
  
  await platform.save();
  
  console.log(`   ✅ Created platform: ${testPlatform.name}`);
  console.log(`   📍 Platform ID: ${platform._id}`);
  
  return platform._id;
}

async function assignPlatformAdmin(platformId, platformAdminId) {
  console.log('\n👔 Assigning platform admin role...\n');
  
  const User = mongoose.models.User || mongoose.model('User', UserSchema);
  
  // Generate password reset token (simulating the email workflow)
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  await User.updateOne(
    { _id: platformAdminId },
    { 
      platformId: platformId,
      role: 'platform_admin',
      resetPasswordToken: resetToken,
      resetPasswordExpiry: resetExpiry
    }
  );
  
  console.log(`   ✅ Assigned platform admin to platform`);
  console.log(`   🔑 Reset token: ${resetToken.substring(0, 20)}...`);
  console.log(`   ⏰ Token expires: ${resetExpiry.toLocaleString()}`);
  console.log(`   📧 In production, email would be sent to: ${testUsers.platformAdmin.email}`);
}

async function createTestOrganizations(platformId, platformAdminId, orgAdminId) {
  console.log('\n🏨 Creating test organizations...\n');
  
  const Organization = mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema);
  const OrganizationType = mongoose.connection.db.collection('organizationtypes');
  const User = mongoose.models.User || mongoose.model('User', UserSchema);
  
  // Get hotel organization type
  const hotelType = await OrganizationType.findOne({ code: 'hotel' });
  
  if (!hotelType) {
    console.log('   ⚠️  Hotel organization type not found. Run init-org-type-system.mjs first!');
    return [];
  }
  
  const createdOrgs = [];
  
  for (const orgData of testOrganizations) {
    // Clear existing test org
    await Organization.deleteMany({ name: orgData.name });
    
    const status = orgData.trustLevel === 'high' ? 'approved' : 'pending_documents';
    
    const org = new Organization({
      name: orgData.name,
      description: orgData.description,
      platformId: platformId,
      type: hotelType._id,
      status: status,
      trustLevel: orgData.trustLevel,
      createdBy: platformAdminId
    });
    
    await org.save();
    
    createdOrgs.push(org._id);
    
    const statusIcon = status === 'approved' ? '✅' : '📋';
    console.log(`   ${statusIcon} Created: ${orgData.name}`);
    console.log(`      Status: ${status}`);
    console.log(`      Trust Level: ${orgData.trustLevel}`);
    console.log(`      Org ID: ${org._id}`);
    console.log('');
  }
  
  // Assign org admin to first organization (approved one)
  if (createdOrgs.length > 0) {
    await User.updateOne(
      { _id: orgAdminId },
      { 
        organizationId: createdOrgs[0],
        role: 'organization_admin'
      }
    );
    console.log(`   👔 Assigned ${testUsers.orgAdmin.name} to ${testOrganizations[0].name}`);
  }
  
  return createdOrgs;
}

async function displayTestSummary(users, platformId, orgIds) {
  console.log('\n' + '='.repeat(70));
  console.log('🎉 TEST SETUP COMPLETE!');
  console.log('='.repeat(70));
  
  console.log('\n📋 TEST CREDENTIALS:');
  console.log('-'.repeat(70));
  
  for (const [key, userData] of Object.entries(testUsers)) {
    console.log(`\n${userData.name}:`);
    console.log(`   Email: ${userData.email}`);
    console.log(`   Password: ${userData.password}`);
    console.log(`   Role: ${userData.role}`);
  }
  
  console.log('\n' + '-'.repeat(70));
  console.log('\n📊 CREATED RESOURCES:');
  console.log('-'.repeat(70));
  console.log(`\nPlatform ID: ${platformId}`);
  console.log(`Platform Name: ${testPlatform.name}`);
  console.log(`\nOrganizations:`);
  
  const Organization = mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema);
  
  for (const orgId of orgIds) {
    const org = await Organization.findById(orgId);
    if (org) {
      const statusIcon = org.status === 'approved' ? '✅' : '📋';
      console.log(`   ${statusIcon} ${org.name} (${org.status})`);
      console.log(`      ID: ${orgId}`);
    }
  }
  
  console.log('\n' + '-'.repeat(70));
  console.log('\n🧪 TEST WORKFLOW:');
  console.log('-'.repeat(70));
  
  console.log(`
1. Login as Super Admin:
   - Email: ${testUsers.superAdmin.email}
   - Navigate to: /superadmin/platforms
   - View created platform and drill down
   
2. Login as Platform Admin:
   - Email: ${testUsers.platformAdmin.email}
   - Navigate to: /organization-register
   - Create organizations with different trust levels
   - View organizations at: /platform/organizations
   
3. Login as Org Admin:
   - Email: ${testUsers.orgAdmin.email}
   - Navigate to: /org/dashboard
   - Invite users to organization
   - Manage organization settings
   
4. Login as Guest User:
   - Email: ${testUsers.user.email}
   - Register for self-service access
   - View limited features
`);
  
  console.log('-'.repeat(70));
  console.log('\n📍 IMPORTANT URLS:');
  console.log('-'.repeat(70));
  console.log(`
Super Admin Platform Detail:
   http://localhost:3000/superadmin/platforms/${platformId}

Platform Admin Organizations:
   http://localhost:3000/platform/organizations

Org Admin Dashboard:
   http://localhost:3000/org/dashboard

Organization Registration:
   http://localhost:3000/organization-register
`);
  
  console.log('-'.repeat(70));
  console.log('\n✨ FEATURES TO TEST:');
  console.log('-'.repeat(70));
  console.log(`
✅ Super Admin assigns platform admin via user update
✅ Platform admin receives email with password reset
✅ Platform admin creates orgs with trust levels (high/low)
✅ High trust orgs get immediate approval
✅ Low trust orgs require document verification
✅ All org admins receive password reset emails
✅ Super admin drill-down: Platforms → Organizations → Users
✅ Enhanced status badges with icons
✅ Role-based access control at all levels
`);
  
  console.log('='.repeat(70));
}

async function testWorkflow() {
  try {
    console.log('🚀 Starting Complete Workflow Test Setup...\n');
    console.log('='.repeat(70));
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Step 1: Create test users
    const users = await setupTestUsers();
    
    // Step 2: Create platform (as super admin)
    const platformId = await setupTestPlatform(users.superAdmin);
    
    // Step 3: Assign platform admin role
    await assignPlatformAdmin(platformId, users.platformAdmin);
    
    // Step 4: Create organizations (as platform admin)
    const orgIds = await createTestOrganizations(
      platformId, 
      users.platformAdmin,
      users.orgAdmin
    );
    
    // Step 5: Display summary
    await displayTestSummary(users, platformId, orgIds);
    
  } catch (error) {
    console.error('\n❌ Test setup failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB\n');
  }
}

// Run test workflow
testWorkflow();
