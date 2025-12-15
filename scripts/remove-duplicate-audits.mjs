// scripts/remove-duplicate-audits.mjs
// Script to remove duplicate audit log entries from the database

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nuxtauth';

// Define AuditLog schema
const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  entityType: String,
  entityId: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  platformId: { type: mongoose.Schema.Types.ObjectId, ref: 'Platform' },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  targetId: mongoose.Schema.Types.ObjectId,
  targetType: String,
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  createdAt: { type: Date, default: Date.now }
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function findDuplicates() {
  console.log('\n🔍 Searching for duplicate audit logs...\n');
  
  // Aggregate to find duplicates based on key fields and timestamp (within same minute)
  const duplicates = await AuditLog.aggregate([
    {
      $addFields: {
        // Round timestamp to nearest minute to catch near-duplicates
        roundedTime: {
          $subtract: [
            '$createdAt',
            { $mod: [{ $toLong: '$createdAt' }, 60000] } // 60000ms = 1 minute
          ]
        }
      }
    },
    {
      $group: {
        _id: {
          action: '$action',
          userId: '$userId',
          entityType: '$entityType',
          entityId: '$entityId',
          platformId: '$platformId',
          organizationId: '$organizationId',
          roundedTime: '$roundedTime'
        },
        count: { $sum: 1 },
        ids: { $push: '$_id' },
        timestamps: { $push: '$createdAt' }
      }
    },
    {
      $match: {
        count: { $gt: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  return duplicates;
}

async function removeDuplicates(dryRun = true) {
  const duplicates = await findDuplicates();

  if (duplicates.length === 0) {
    console.log('✅ No duplicates found! Database is clean.\n');
    return { totalGroups: 0, totalRemoved: 0 };
  }

  console.log(`📊 Found ${duplicates.length} groups of duplicate audit logs:\n`);

  let totalRemoved = 0;

  for (const dup of duplicates) {
    const action = dup._id.action;
    const count = dup.count;
    const ids = dup.ids;
    const timestamps = dup.timestamps;

    console.log(`  🔸 Action: ${action}`);
    console.log(`     Duplicates: ${count} entries`);
    console.log(`     Timestamps: ${timestamps.map(t => new Date(t).toLocaleString()).join(', ')}`);

    // Keep the oldest record, remove the rest
    const idsToKeep = [ids[0]]; // Keep first (oldest)
    const idsToRemove = ids.slice(1); // Remove rest

    console.log(`     Keep: ${idsToKeep.length} record`);
    console.log(`     Remove: ${idsToRemove.length} duplicate(s)`);

    if (!dryRun) {
      const result = await AuditLog.deleteMany({
        _id: { $in: idsToRemove }
      });
      console.log(`     ✅ Deleted ${result.deletedCount} duplicate(s)`);
      totalRemoved += result.deletedCount;
    } else {
      console.log(`     ⚠️  DRY RUN - Would delete ${idsToRemove.length} duplicate(s)`);
      totalRemoved += idsToRemove.length;
    }
    console.log('');
  }

  return {
    totalGroups: duplicates.length,
    totalRemoved
  };
}

async function showStats() {
  const total = await AuditLog.countDocuments();
  const byAction = await AuditLog.aggregate([
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    }
  ]);

  console.log('\n📈 Current Audit Log Statistics:');
  console.log(`   Total Records: ${total}`);
  console.log('\n   Top 10 Actions:');
  byAction.forEach(item => {
    console.log(`   - ${item._id}: ${item.count}`);
  });
  console.log('');
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     Duplicate Audit Log Cleanup Script                ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const args = process.argv.slice(2);
  const isExecute = args.includes('--execute');

  await connectDB();
  await showStats();

  if (!isExecute) {
    console.log('⚠️  DRY RUN MODE (no changes will be made)\n');
    console.log('   Run with --execute flag to actually remove duplicates\n');
  } else {
    console.log('⚠️  EXECUTE MODE - Changes will be permanent!\n');
    console.log('   Waiting 3 seconds... Press Ctrl+C to cancel\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  const { totalGroups, totalRemoved } = await removeDuplicates(!isExecute);

  console.log('═══════════════════════════════════════════════════════\n');
  console.log('📋 Summary:');
  console.log(`   Groups with duplicates: ${totalGroups}`);
  console.log(`   ${isExecute ? 'Removed' : 'Would remove'}: ${totalRemoved} duplicate records`);
  console.log('');

  if (!isExecute && totalRemoved > 0) {
    console.log('💡 To actually remove duplicates, run:');
    console.log('   node scripts/remove-duplicate-audits.mjs --execute\n');
  }

  if (isExecute && totalRemoved > 0) {
    await showStats();
    console.log('✅ Cleanup completed successfully!\n');
  }

  await mongoose.connection.close();
  console.log('👋 Database connection closed\n');
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the script
main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
