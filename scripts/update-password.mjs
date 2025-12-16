import bcrypt from 'bcrypt';
import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb://localhost:27017/nuxt-auth';
const email = 'superadmin88@yopmail.com';
const newPassword = 'Kodak7869$';

async function updatePassword() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log(`New password hash: ${hashedPassword}`);
    
    // Update the user's password
    const result = await db.collection('users').updateOne(
      { email },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );
    
    console.log(`\n✅ Password updated successfully!`);
    console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
    console.log(`\nYou can now login with:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${newPassword}`);
    
  } catch (error) {
    console.error('❌ Error updating password:', error);
  } finally {
    await client.close();
  }
}

updatePassword();
