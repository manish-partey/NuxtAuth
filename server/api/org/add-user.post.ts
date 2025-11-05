// server/api/org/add-user.post.ts
import User from '~/server/models/User';
import Organization from '~/server/models/Organization';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { name, email, role, organizationId } = body;

    // Validate required fields
    if (!name || !email || !role || !organizationId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'All fields are required',
      });
    }

    // Validate the organization exists
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Organization not found',
      });
    }

    // Check if the email already exists in the users collection
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: 'User with this email already exists',
      });
    }

    // Create the new user with a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const newUser = new User({
      name,
      email,
      role,
      organizationId,
      password: tempPassword,
      username: email.split('@')[0],
    });
    await newUser.save();

    console.log(`[ADD-USER] User added successfully: ${email}, role: ${role}`);

    return {
      success: true,
      message: 'User added successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    };
  } catch (err: any) {
    console.error('[ADD-USER] Error:', err);

    // Generic server error
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to add user. Please try again.',
    });
  }
});
