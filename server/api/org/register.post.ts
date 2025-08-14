// server/api/organization/register.post.ts
import Organization from '~/server/models/Organization';
import User from '~/server/models/User';
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

    // Check if admin email already exists
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      throw createError({ 
        statusCode: 409, 
        statusMessage: 'Admin email already exists. Please use a different email.' 
      });
    }

    const newOrg = await Organization.create({ name: orgName, domain: orgDomain });

    const verificationToken = uuidv4();
    const adminUser = new User({
      username: adminEmail.split('@')[0],
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      organizationId: newOrg._id,
      verificationToken,
      verificationTokenExpiry: new Date(Date.now() + 3600000),
    });
    await adminUser.save();

    const config = useRuntimeConfig();
    const verificationLink = `${config.public.appUrl}/verify-email?token=${verificationToken}`;
    const emailHtml = `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
      <h2 style="color: #3b82f6;">EaseMyCargo App – Email Verification</h2>
      <p>Hello ${adminUser.name || 'Admin'},</p>
      <p>Your organization was successfully registered. Please verify your email address to activate your admin account by clicking the button below:</p>
      <p style="margin: 30px 0;">
        <a href="${verificationLink}" style="background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
          Verify Email
        </a>
      </p>
      <p>This link will expire in 1 hour. If you didn't register, you can safely ignore this email.</p>
      <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #777;">Thank you,<br>The EaseMyCargo App Team</p>
    </div>
    `;

    await sendEmail(
      adminUser.email,
      'Verify Your Email – EaseMyCargo App',
      emailHtml
    );

    return { 
      success: true,
      message: 'Organization and admin registered successfully. Please check your email to verify your account.' 
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
    
    // Safe Application Insights logging (optional)
    try {
      const { defaultClient } = await import('applicationinsights');
      if (typeof defaultClient?.trackException === 'function') {
        defaultClient.trackException({ exception: err });
      }
    } catch (insightsError) {
      console.warn('Application Insights logging failed:', insightsError);
    }
    
    // Generic server error
    throw createError({
      statusCode: 500,
      statusMessage: 'Organization registration failed. Please try again.',
    });
  }
});