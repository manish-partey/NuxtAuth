// server/services/auth.ts
import User from '~/server/models/User'; // Assuming you have this model
import bcrypt from 'bcryptjs';

export async function registerUser(username: string, email: string, password: string) {
  // Check if user already exists (though Mongoose unique index will also catch it)
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new Error('Email or username already exists.'); // Or a more specific error type
  }

  const hashedPassword = await bcrypt.hash(password, 10); // Hash password

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
  });

  await newUser.save();
  return newUser;
}

export async function getAuthUserById(userId: string) {
  // Implement logic to fetch user by ID, selecting necessary fields
  const user = await User.findById(userId).select('-password'); // Exclude password
  return user;
}

// You'll also need loginUser, etc.
export async function loginUser(emailOrUsername: string, password: string) {
  const user = await User.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  return user;
}