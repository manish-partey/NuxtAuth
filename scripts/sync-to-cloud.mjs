import { MongoClient } from 'mongodb';

const LOCAL_URI = 'mongodb://localhost:27017/nuxt-auth';
const CLOUD_URI = 'mongodb+srv://manishkpartey:Info%402025@cluster0.akb30y9.mongodb.net/Usermanagment?retryWrites=true&w=majority';

async function syncToCloud() {
  const localClient = new MongoClient(LOCAL_URI);
  const cloudClient = new MongoClient(CLOUD_URI);

  try {
    console.log('Connecting to local database...');
    await localClient.connect();
    const localDb = localClient.db('nuxt-auth');

    console.log('Connecting to cloud database...');
    await cloudClient.connect();
    const cloudDb = cloudClient.db('Usermanagment');

    // Collections to sync
    const collections = [
      'platforms',
      'organizationTypes',
      'users',
      'organizations'
    ];

    for (const collectionName of collections) {
      console.log(`\nSyncing ${collectionName}...`);
      
      // Get data from local
      const localCollection = localDb.collection(collectionName);
      const documents = await localCollection.find().toArray();
      
      console.log(`  Found ${documents.length} documents in local ${collectionName}`);
      
      if (documents.length > 0) {
        // Clear cloud collection
        const cloudCollection = cloudDb.collection(collectionName);
        const deleteResult = await cloudCollection.deleteMany({});
        console.log(`  Deleted ${deleteResult.deletedCount} existing documents from cloud`);
        
        // Insert into cloud
        const insertResult = await cloudCollection.insertMany(documents);
        console.log(`  ✓ Inserted ${insertResult.insertedCount} documents to cloud`);
      }
    }

    console.log('\n✅ All collections synced successfully!');
    
  } catch (error) {
    console.error('❌ Error syncing to cloud:', error);
    process.exit(1);
  } finally {
    await localClient.close();
    await cloudClient.close();
  }
}

syncToCloud();
