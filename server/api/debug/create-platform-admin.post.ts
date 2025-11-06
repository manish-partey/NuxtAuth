import { defineEventHandler, readBody } from 'h3';
import bcrypt from 'bcryptjs';
import User from '~/server/models/User';

export default defineEventHandler(async (event) => {
  const { email, password, name } = await readBody(event);

  if (!email || !password || !name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email, password, and name are required'
    });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Update existing user to platform_admin
      existingUser.role = 'platform_admin';
      await existingUser.save();
      return { 
        success: true, 
        message: 'User role updated to platform_admin',
        user: {
          _id: existingUser._id,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role
        }
      };
    }

    // Create new platform admin user
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: 'platform_admin',
      emailVerified: true, // Auto-verify platform admin
      active: true
    });

    return { 
      success: true, 
      message: 'Platform admin user created successfully',
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  } catch (error) {
    console.error('Error creating platform admin:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create platform admin user'
    });
  }
});
