import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_CONNECTION_STRING;

async function clearDatabase() {
  try {
    await mongoose.connect(uri);
    console.log('\n🔗 Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📋 Found', collections.length, 'collections\n');
    
    // Collections to KEEP (only users)
    const keepCollections = ['users'];
    
    // Collections to DELETE (everything else)
    const deleteCollections = collections
      .map(c => c.name)
      .filter(name => !keepCollections.includes(name));
    
    console.log('✅ Collections to KEEP:');
    keepCollections.forEach(name => console.log('   -', name));
    
    console.log('\n❌ Collections to DELETE:');
    deleteCollections.forEach(name => console.log('   -', name));
    
    console.log('\n⚠️  WARNING: This will delete ALL data from the above collections!');
    console.log('⚠️  Only the "users" collection will be preserved.\n');
    
    // Ask for confirmation (auto-confirm in script)
    console.log('🗑️  Starting deletion in 2 seconds...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let deletedCount = 0;
    let totalDocsDeleted = 0;
    
    for (const collectionName of deleteCollections) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        
        if (count > 0) {
          await collection.deleteMany({});
          console.log(`✓ Deleted ${count} documents from "${collectionName}"`);
          totalDocsDeleted += count;
          deletedCount++;
        } else {
          console.log(`○ Collection "${collectionName}" was already empty`);
        }
      } catch (error) {
        console.error(`✗ Error deleting from "${collectionName}":`, error.message);
      }
    }
    
    console.log('\n✅ DELETION COMPLETE');
    console.log(`   - Collections cleared: ${deletedCount}`);
    console.log(`   - Total documents deleted: ${totalDocsDeleted}`);
    
    // Show users collection status
    const usersCount = await db.collection('users').countDocuments();
    console.log(`\n👥 Users collection preserved: ${usersCount} users remaining`);
    
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

clearDatabase();
