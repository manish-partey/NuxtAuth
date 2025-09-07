// server/api/platform/organization/register.post.ts
import { defineEventHandler, readBody, createError } from 'h3';
import Organization from '~/server/models/Organization';
import User from '~/server/models/User';
import Platform from '~/server/models/Platform';
import { connectToDatabase } from '~/server/utils/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from '~/server/utils/mail';

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase();
    const body = await readBody(event);
    const { 
      platformId, 
      orgName, 
      orgType,
      orgDomain, 
      adminName, 
      adminEmail, 
      adminPassword 
    } = body;

    // Validate required fields
    if (!platformId || !orgName || !orgType || !orgDomain || !adminName || !adminEmail || !adminPassword) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'All fields are required' 
      });
    }

    // Verify platform exists
    const platform = await Platform.findById(platformId);
    if (!platform) {
      throw createError({ 
        statusCode: 404, 
        statusMessage: 'Platform not found' 
      });
    }

    // Check if organization with this domain already exists under this platform
    const existingOrg = await Organization.findOne({ 
      domain: orgDomain,
      platformId: platformId 
    });
    if (existingOrg) {
      throw createError({ 
        statusCode: 409, 
        statusMessage: 'Organization with this domain already exists under this platform' 
      });
    }

    // Check if admin email already exists
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      throw createError({ 
        statusCode: 409, 
        statusMessage: `Admin email ${adminEmail} already exists. Please use a different email.` 
      });
    }

    // Create organization slug with uniqueness check
    let baseSlug = orgName.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    
    // Check for existing slug and make it unique
    while (await Organization.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create organization with pending status
    const newOrg = new Organization({
      name: orgName,
      type: orgType,
      slug: slug,
      domain: orgDomain,
      status: 'pending', // Important: starts as pending
      platformId: platformId,
      createdBy: null // Will be set after admin user is created
    });

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    // Create admin user with verification token
    const verificationToken = uuidv4();
    const adminUser = new User({
      username: adminEmail.split('@')[0],
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'organization_admin',
      organizationId: null, // Will be set after organization is approved
      platformId: platformId,
      verificationToken,
      verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      isVerified: false
    });

    await adminUser.save();
    
    // Update organization with createdBy
    newOrg.createdBy = adminUser._id;
    await newOrg.save();

    // Get platform admins and platform creator for notification
    const platformAdmins = await User.find({ 
      platformId: platformId, 
      role: 'platform_admin',
      isVerified: true 
    });

    // Get platform creator (if different from platform admins)
    let platformCreator = null;
    if (platform.createdBy) {
      platformCreator = await User.findById(platform.createdBy);
    }

    // Create a list of recipients (platform admins + platform creator, avoiding duplicates)
    const recipients = [...platformAdmins];
    if (platformCreator && !platformAdmins.some(admin => admin._id.equals(platformCreator._id))) {
      recipients.push(platformCreator);
    }

    console.log(`[DEBUG] Found ${recipients.length} recipients for approval emails`);

    // Send approval email to platform admins and platform creator
    const config = useRuntimeConfig();
    const approvalLink = `${config.public.appUrl}/approve-organization?orgId=${newOrg._id}`;
    
    try {
      for (const recipient of recipients) {
        const recipientRole = recipient.role === 'platform_admin' ? 'Platform Administrator' : 'Platform Creator';
        const adminEmailHtml = `
          <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
            <h2 style="color: #3b82f6;">New Organization Registration Pending Approval</h2>
            <p>Hello ${recipient.name} (${recipientRole}),</p>
            <p>A new organization has been registered under your platform "<strong>${platform.name}</strong>" and requires your approval:</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Organization Name:</strong> ${orgName}</p>
              <p><strong>Organization Type:</strong> ${orgType}</p>
              <p><strong>Domain:</strong> ${orgDomain}</p>
              <p><strong>Admin Name:</strong> ${adminName}</p>
              <p><strong>Admin Email:</strong> ${adminEmail}</p>
              <p><strong>Requested on:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p style="margin: 30px 0;">
              <a href="${approvalLink}" style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Review & Approve Organization
              </a>
            </p>
            
            <p style="font-size: 14px; color: #666;">
              Click the button above to review the organization details and approve or reject the registration request. No login required.
            </p>
            
            <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #777;">
              Best regards,<br>
              Platform Management System
            </p>
          </div>
        `;

        await sendEmail(
          recipient.email,
          `New Organization Registration - ${orgName}`,
          adminEmailHtml
        );
        console.log(`[EMAIL] Approval notification sent to ${recipient.email} (${recipientRole})`);
      }
    } catch (emailError) {
      console.error('Failed to send notification emails to platform admins/creator:', emailError);
      // Continue with registration even if email fails
    }

    // Send confirmation email to the organization admin
    try {
      const userEmailHtml = `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
          <h2 style="color: #3b82f6;">🎉 Organization Registration Submitted Successfully!</h2>
          <p>Hello ${adminName},</p>
          <p>Thank you for registering your organization with us! Your registration has been successfully submitted and is currently under review.</p>
          
          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
            <h3 style="margin: 0 0 10px 0; color: #166534;">✅ Registration Details Confirmed</h3>
            <p style="margin: 0;"><strong>Organization:</strong> ${orgName}</p>
            <p style="margin: 0;"><strong>Type:</strong> ${orgType}</p>
            <p style="margin: 0;"><strong>Domain:</strong> ${orgDomain}</p>
            <p style="margin: 0;"><strong>Platform:</strong> ${platform.name}</p>
            <p style="margin: 0;"><strong>Your Role:</strong> Organization Administrator</p>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0;"><strong>Current Status:</strong> ⏳ Pending Platform Admin Approval</p>
          </div>
          
          <p><strong>What happens next?</strong></p>
          <ol style="padding-left: 20px;">
            <li><strong>Platform Review:</strong> The platform administrator will review your registration details</li>
            <li><strong>Approval Decision:</strong> You'll receive an email notification with the approval decision</li>
            <li><strong>Account Activation:</strong> Once approved, your account will be automatically activated</li>
            <li><strong>Start Managing:</strong> You can then log in and begin managing your organization</li>
          </ol>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;"><strong>💡 Pro Tip:</strong> Keep this email for your records. You'll need your login credentials once your organization is approved.</p>
          </div>
          
          <p style="font-size: 14px; color: #666;">
            <strong>Expected Processing Time:</strong> Most registrations are reviewed within 1-2 business days.
          </p>
          
          <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #777;">
            Best regards,<br>
            The ${platform.name} Platform Team<br>
            <em>Platform Management System</em>
          </p>
        </div>
      `;

      await sendEmail(
        adminEmail,
        `Registration Confirmed - ${orgName} | Pending Approval`,
        userEmailHtml
      );
      console.log(`[EMAIL] Confirmation email sent to organization admin: ${adminEmail}`);
    } catch (emailError) {
      console.error('Failed to send confirmation email to organization admin:', emailError);
      // Continue with registration even if email fails
    }

    return { 
      success: true,
      message: `🎉 Registration successful! Your organization "${orgName}" has been submitted for approval. Check your email (${adminEmail}) for confirmation details and next steps.`,
      organizationId: newOrg._id,
      details: {
        organizationName: orgName,
        adminEmail: adminEmail,
        platform: platform.name,
        status: 'pending',
        nextSteps: 'Platform administrator will review your registration and send approval notification via email.'
      }
    };

  } catch (err: any) {
    console.error('[API] Platform organization register error:', err);
    
    // Handle specific MongoDB duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0];
      let message = 'This organization already exists';
      
      if (field === 'domain') {
        message = 'Organization with this domain already exists under this platform';
      } else if (field === 'name') {
        message = 'Organization with this name already exists under this platform';
      } else if (field === 'email') {
        message = 'This email is already registered';
      }
      
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
    
    // Generic server error
    throw createError({
      statusCode: 500,
      statusMessage: 'Organization registration failed. Please try again.',
    });
  }
});
