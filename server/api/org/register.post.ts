// server/api/organization/register.post.ts
import Organization from '~/server/models/Organization';
import User from '~/server/models/User';
import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from '~/server/utils/mail';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { orgName, orgDomain, adminName, adminEmail, adminPassword } = body;

    // Validate required fields
    if (!orgName || !orgDomain || !adminName || !adminEmail || !adminPassword) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'All fields are required' 
      });
    }

    const existingOrg = await Organization.findOne({ domain: orgDomain });
    if (existingOrg) {
      throw createError({ 
        statusCode: 409, 
        statusMessage: 'Organization with this domain already exists' 
      });
    }

    // Check for duplicate combination of organization name and admin email
    const existingCombination = await User.findOne({ 
      email: adminEmail 
    });
    
    if (existingCombination) {
      const userOrg = await Organization.findById(existingCombination.organizationId);
      if (userOrg && userOrg.name === orgName) {
        throw createError({
          statusCode: 409,
          statusMessage: 'An organization with this name and admin email combination already exists. Please use different details.',
        });
      }
    }

    // Check if email is already registered with a different organization
    if (existingCombination) {
      throw createError({
        statusCode: 409,
        statusMessage: 'This email is already registered. Please use a different email address.',
      });
    }

    // Get or create a default platform
    let platform = await Organization.findOne({ name: 'Default Platform' });
    if (!platform) {
      // If no platform exists, you may need to create one or handle this differently
      throw createError({
        statusCode: 500,
        statusMessage: 'Platform not configured. Please contact the administrator.',
      });
    }

    const newOrg = await Organization.create({ 
      name: orgName, 
      domain: orgDomain,
      type: 'organization',
      slug: orgDomain.toLowerCase().replace(/\s+/g, '-'),
      platformId: platform._id,
      createdBy: null, // Will be set to platform admin later if needed
    });

    const verificationToken = uuidv4();
    const resetPasswordToken = uuidv4();
    
    // Hash password using bcrypt (secure mode)
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(adminPassword, salt);
    
    const adminUser = new User({
      username: adminEmail.split('@')[0],
      name: adminName,
      email: adminEmail,
      password: hashedPassword, // Store hashed password
      role: 'organization_admin',
      organizationId: newOrg._id,
      verificationToken,
      verificationTokenExpiry: new Date(Date.now() + 3600000),
      resetPasswordToken, // Add reset token
      resetPasswordExpiry: new Date(Date.now() + 3600000), // Token valid for 1 hour
    });
    
    console.log(`[REGISTER] User password hashed with bcrypt for: ${adminUser.email}`);
    
    await adminUser.save();
    
    console.log(`[REGISTER] Organization admin created: ${adminUser.email}, ID: ${adminUser._id}`);
    console.log(`[REGISTER] Reset password token generated: ${resetPasswordToken.substring(0, 20)}...`);

    // Fetch platform admin emails from the users collection
    const platformAdmins = await User.find({ role: 'platform_admin' });
    const platformAdminEmails = platformAdmins.map(admin => admin.email);

    if (platformAdminEmails.length === 0) {
      throw createError({
        statusCode: 500,
        statusMessage: 'No platform admins found. Please ensure at least one user has the role "platform_admin".',
      });
    }

    const config = useRuntimeConfig();
    
    // Email to platform admin for approval
    const platformAdminEmailHtml = `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
      <h2 style="color: #3b82f6;">EaseMyCargo App – New Organization Registration</h2>
      <p>Hello Platform Admin,</p>
      <p>A new organization has been registered with the following details:</p>
      <ul>
        <li><strong>Organization Name:</strong> ${orgName}</li>
        <li><strong>Organization Domain:</strong> ${orgDomain}</li>
        <li><strong>Admin Name:</strong> ${adminName}</li>
        <li><strong>Admin Email:</strong> ${adminEmail}</li>
      </ul>
      <p>Please review the registration and take appropriate action:</p>
      <p style="margin: 30px 0;">
        <a href="${config.public.appUrl}/platform/organization-approval" style="background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
          Approve or Reject Organization
        </a>
      </p>
      <p>If you have any questions, please contact the EaseMyCargo support team.</p>
      <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #777;">Thank you,<br>The EaseMyCargo App Team</p>
    </div>
    `;

    // Email to organization admin to set password
    const orgAdminEmailHtml = `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
      <h2 style="color: #3b82f6;">EaseMyCargo App – Welcome to ${orgName}</h2>
      <p>Hello ${adminName},</p>
      <p>Thank you for registering your organization, <strong>${orgName}</strong>, with EaseMyCargo App!</p>
      <p>Your registration is now pending approval from our platform admin. Once approved, you'll be able to log in and manage your organization.</p>
      <p><strong>To prepare for login, please set a secure password by clicking the link below:</strong></p>
      <p style="margin: 30px 0;">
        <a href="${config.public.appUrl}/reset-password?token=${resetPasswordToken}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
          Set Your Password
        </a>
      </p>
      <p>This link will expire in 1 hour. If you didn't register, you can safely ignore this email.</p>
      <p><strong>Next Steps:</strong></p>
      <ol>
        <li>Click the link above to set your password</li>
        <li>Wait for platform admin to approve your organization</li>
        <li>Once approved, log in with your email and the password you set</li>
      </ol>
      <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #777;">Thank you,<br>The EaseMyCargo App Team</p>
    </div>
    `;

    // Send email to platform admins
    for (const email of platformAdminEmails) {
      await sendEmail(
        email,
        'New Organization Registration – EaseMyCargo App',
        platformAdminEmailHtml
      );
    }
    
    // Send email to organization admin
    await sendEmail(
      adminEmail,
      'Welcome to EaseMyCargo App – Set Your Password',
      orgAdminEmailHtml
    );

    return { 
      success: true,
      message: 'Organization registered successfully! Please check your email to set your password. Your organization is pending approval from the platform admin.' 
    };

  } catch (err: any) {
    console.error('[API] Organization register error:', err);
    
    // Handle specific MongoDB duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0];
      const message = field === 'domain' 
        ? 'Organization with this domain already exists' 
        : 'This email is already registered';
      
      throw createError({
        statusCode: 409,
        statusMessage: message,
      });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      throw createError({
        statusCode: 400,
        statusMessage: err.message,
      });
    }

    // If it's already a createError, re-throw it
    if (err.statusCode) {
      throw err;
    }
    
    console.error('❌ Organization registration error:', err as Error);
    
    // Generic server error
    throw createError({
      statusCode: 500,
      statusMessage: 'Organization registration failed. Please try again.',
    });
  }
});