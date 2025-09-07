// server/api/platform/organization/public-approve.post.ts
import { defineEventHandler, readBody, createError } from 'h3';
import Organization from '~/server/models/Organization';
import User from '~/server/models/User';
import Platform from '~/server/models/Platform';
import { connectToDatabase } from '~/server/utils/db';
import { sendEmail } from '~/server/utils/mail';

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase();
    const body = await readBody(event);
    const { organizationId, action, rejectionReason } = body;

    // Validate required fields
    if (!organizationId || !action) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Organization ID and action are required' 
      });
    }

    if (action === 'reject' && !rejectionReason) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Rejection reason is required when rejecting' 
      });
    }

    // Get organization
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      throw createError({ 
        statusCode: 404, 
        statusMessage: 'Organization not found' 
      });
    }

    // Check if organization is already processed
    if (organization.status !== 'pending') {
      throw createError({ 
        statusCode: 400, 
        statusMessage: `Organization has already been ${organization.status}` 
      });
    }

    // Get organization admin user
    const adminUser = await User.findById(organization.createdBy);
    if (!adminUser) {
      throw createError({ 
        statusCode: 404, 
        statusMessage: 'Organization admin not found' 
      });
    }

    // Get platform details
    const platform = await Platform.findById(organization.platformId);
    if (!platform) {
      throw createError({ 
        statusCode: 404, 
        statusMessage: 'Platform not found' 
      });
    }

    const config = useRuntimeConfig();
    let emailSubject = '';
    let emailHtml = '';

    if (action === 'approve') {
      // Update organization status
      organization.status = 'approved';
      organization.approvedAt = new Date();
      await organization.save();

      // Update admin user
      adminUser.organizationId = organization._id;
      adminUser.isVerified = true; // Auto-verify the admin user
      await adminUser.save();

      // Prepare approval email
      emailSubject = `🎉 Organization Approved - Welcome to ${platform.name}!`;
      emailHtml = `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
          <h2 style="color: #22c55e;">🎉 Congratulations! Your Organization is Approved!</h2>
          <p>Hello ${adminUser.name},</p>
          <p>Excellent news! Your organization "<strong>${organization.name}</strong>" has been approved and is now fully active on the ${platform.name} platform.</p>
          
          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
            <h3 style="margin: 0 0 10px 0; color: #166534;">✅ Organization Status: APPROVED & ACTIVE</h3>
            <p style="margin: 0;"><strong>Organization:</strong> ${organization.name}</p>
            <p style="margin: 0;"><strong>Domain:</strong> ${organization.domain}</p>
            <p style="margin: 0;"><strong>Platform:</strong> ${platform.name}</p>
            <p style="margin: 0;"><strong>Your Role:</strong> Organization Administrator</p>
          </div>
          
          <div style="background-color: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0284c7;">
            <h3 style="margin: 0 0 10px 0; color: #0c4a6e;">🔑 Your Login Credentials</h3>
            <p style="margin: 0;"><strong>Email:</strong> ${adminUser.email}</p>
            <p style="margin: 0;"><strong>Password:</strong> Use the password you created during registration</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #0369a1;"><em>Your account has been automatically verified and is ready to use!</em></p>
          </div>
          
          <p><strong>🚀 What you can do now:</strong></p>
          <ul style="padding-left: 20px;">
            <li><strong>Access Your Dashboard:</strong> Log in to manage your organization</li>
            <li><strong>Invite Team Members:</strong> Add users to your organization</li>
            <li><strong>Configure Settings:</strong> Customize your organization profile</li>
            <li><strong>Explore Platform Features:</strong> Discover all available tools and services</li>
          </ul>
          
          <p style="margin: 30px 0;">
            <a href="${config.public.appUrl}/login" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              🎯 Access Your Dashboard
            </a>
          </p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;"><strong>💡 Need Help?</strong> Visit our documentation or contact support if you have any questions about getting started.</p>
          </div>
          
          <p>Welcome to the ${platform.name} community! We're excited to have you on board.</p>
          
          <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #777;">
            Best regards,<br>
            The ${platform.name} Platform Team<br>
            <em>Platform Management System</em>
          </p>
        </div>
      `;

    } else if (action === 'reject') {
      // Update organization status
      organization.status = 'rejected';
      organization.rejectedAt = new Date();
      organization.rejectionReason = rejectionReason;
      await organization.save();

      // Prepare rejection email
      emailSubject = `Organization Registration - Update Required`;
      emailHtml = `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
          <h2 style="color: #dc2626;">Organization Registration Update</h2>
          <p>Hello ${adminUser.name},</p>
          <p>Thank you for your interest in joining the ${platform.name} platform.</p>
          
          <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p style="margin: 0;"><strong>Status:</strong> Registration requires updates</p>
          </div>
          
          <p><strong>Feedback from Platform Admin:</strong></p>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-style: italic;">"${rejectionReason}"</p>
          </div>
          
          <p>Please review the feedback above and feel free to submit a new registration with the requested updates.</p>
          
          <p style="margin: 30px 0;">
            <a href="${config.public.appUrl}/organization-register" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Submit New Registration
            </a>
          </p>
          
          <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #777;">
            Best regards,<br>
            ${platform.name} Platform Team
          </p>
        </div>
      `;
    }

    // Send email to organization admin
    try {
      await sendEmail(adminUser.email, emailSubject, emailHtml);
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
      // Continue even if email fails
    }

    return { 
      success: true,
      message: action === 'approve' 
        ? `Organization "${organization.name}" has been approved successfully!`
        : `Organization "${organization.name}" has been rejected.`,
      organization: {
        id: organization._id,
        name: organization.name,
        status: organization.status
      }
    };

  } catch (error: any) {
    console.error('[API] Public approve organization error:', error);
    throw createError({ 
      statusCode: error.statusCode || 500, 
      statusMessage: error.statusMessage || 'Failed to process organization approval' 
    });
  }
});
