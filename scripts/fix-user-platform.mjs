import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

const platformSchema = new mongoose.Schema({}, { strict: false });
const Platform = mongoose.model('Platform', platformSchema);

async function fixUserPlatform() {
  try {
    await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
    console.log('✓ Connected to MongoDB');

    // Find HotelHub platform
    const hotelHub = await Platform.findOne({ name: 'HotelHub' });
    if (!hotelHub) {
      console.error('❌ HotelHub platform not found');
      process.exit(1);
    }
    console.log('✓ Found HotelHub platform:', hotelHub._id);

    // Find the current logged-in user (the one with the old platformId)
    const currentUser = await User.findOne({ platformId: new mongoose.Types.ObjectId('690c5ca5ecd171cc3b04149f') });
    
    if (currentUser) {
      console.log(`\n📝 Updating user: ${currentUser.email}`);
      console.log(`   Old platformId: ${currentUser.platformId}`);
      console.log(`   New platformId: ${hotelHub._id}`);
      
      currentUser.platformId = hotelHub._id;
      await currentUser.save();
      console.log('✓ User updated');
    } else {
      console.log('ℹ No users found with old platformId');
    }

    // Show all platform admins
    console.log('\n📋 All platform_admin users:');
    const platformAdmins = await User.find({ role: 'platform_admin' }).select('email platformId');
    platformAdmins.forEach(admin => {
      console.log(`   ${admin.email} → Platform: ${admin.platformId}`);
    });

    await mongoose.disconnect();
    console.log('\n✓ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixUserPlatform();
