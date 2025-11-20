// server/api/platform/organization/public-approve.post.ts
import { defineEventHandler, readBody, createError } from 'h3';
import Organization from '~/server/models/Organization';
import User from '~/server/models/User';
import Platform from '~/server/models/Platform';
import { connectToDatabase } from '~/server/utils/db';
import { sendEmail } from '~/server/utils/mail';
import { v4 as uuid } from 'uuid';

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

      // Generate password reset token for the admin user
      const resetPasswordToken = uuid();
      const resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

      // Update admin user
      adminUser.organizationId = organization._id;
      adminUser.isVerified = true; // Auto-verify the admin user
      adminUser.resetPasswordToken = resetPasswordToken;
      adminUser.resetPasswordExpiry = resetPasswordExpiry;
      await adminUser.save();

      // Prepare approval email with password reset link
      emailSubject = `🎉 Organization Approved - Welcome to ${platform.name}!`;
      const resetLink = `${config.public.appUrl}/reset-password?token=${resetPasswordToken}`;
      
      emailHtml = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Organization Approved!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Welcome to ${platform.name}</p>
          </div>

          <div style="padding: 30px; background-color: #ffffff;">
            <p>Hello ${adminUser.name},</p>
            
            <p>Great news! Your organization "<strong>${organization.name}</strong>" has been approved and is now active on the ${platform.name} platform.</p>

            <!-- ⚠️ IMPORTANT: Password Reset Required -->
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 6px; margin: 25px 0;">
              <h3 style="margin-top: 0; color: #d97706;">⚠️ IMPORTANT: Complete Your Setup</h3>
              <p style="margin: 0 0 10px 0;"><strong>You must reset your password to complete your account setup.</strong></p>
              <p style="margin: 0; font-size: 14px; color: #92400e;">For security reasons, you need to create a new password using the link below. </p>
            </div>

            <!-- Reset Password CTA -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #dc2626; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                🔑 Reset Your Password
              </a>
            </div>

            <p style="text-align: center; font-size: 12px; color: #6b7280;">
              <em>Or copy this link in your browser:</em><br>
              <code style="background-color: #f3f4f6; padding: 8px; border-radius: 4px; font-size: 11px; word-break: break-all;">${resetLink}</code>
            </p>

            <!-- Organization Details -->
            <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; border-radius: 6px; margin: 25px 0;">
              <h3 style="margin-top: 0; color: #166534;">✅ Organization Details</h3>
              <p style="margin: 8px 0;"><strong>Organization:</strong> ${organization.name}</p>
              <p style="margin: 8px 0;"><strong>Role:</strong> Organization Administrator</p>
              <p style="margin: 8px 0;"><strong>Status:</strong> Active & Verified</p>
            </div>

            <!-- Setup Steps -->
            <div style="background-color: #e0f2fe; border-left: 4px solid #0284c7; padding: 20px; border-radius: 6px; margin: 25px 0;">
              <h3 style="margin-top: 0; color: #0c4a6e;">📋 What to do next:</h3>
              <ol style="margin: 0; padding-left: 20px;">
                <li style="margin: 8px 0;"><strong>Reset your password</strong> using the link above</li>
                <li style="margin: 8px 0;"><strong>Log in</strong> with your email and new password</li>
                <li style="margin: 8px 0;"><strong>Access your dashboard</strong> and start managing your organization</li>
                <li style="margin: 8px 0;"><strong>Invite team members</strong> to join your organization</li>
              </ol>
            </div>

            <!-- Login Info -->
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 25px 0;">
              <h4 style="margin-top: 0;">Your Login Information:</h4>
              <p style="margin: 8px 0;"><strong>Email:</strong> ${adminUser.email}</p>
              <p style="margin: 8px 0;"><strong>Login URL:</strong> <a href="${config.public.appUrl}/login" style="color: #0284c7; text-decoration: none;">${config.public.appUrl}/login</a></p>
            </div>

            <p>If you have any questions or need assistance, please reach out to our support team.</p>

            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                Welcome to ${platform.name}!<br>
                <strong>Best regards,</strong><br>
                Platform Administration Team
              </p>
            </div>
          </div>

          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280;">
            <p style="margin: 0;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `;

    } else if (action === 'reject') {
      // Update organization status
      organization.status = 'rejected';
      organization.rejectedAt = new Date();
      organization.rejectionReason = rejectionReason;
      await organization.save();

      // Prepare rejection email
      emailSubject = `❌ Organization Registration Rejected - ${organization.name}`;
      emailHtml = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">❌ Registration Rejected</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Action Required for ${organization.name}</p>
          </div>

          <div style="padding: 30px; background-color: #ffffff;">
            <p>Hello ${adminUser.name},</p>
            
            <p>Thank you for your interest in joining the <strong>${platform.name}</strong> platform. Unfortunately, your organization registration has been <strong>rejected</strong> by the platform administrators.</p>

            <!-- Rejection Status -->
            <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; border-radius: 6px; margin: 25px 0;">
              <h3 style="margin-top: 0; color: #7f1d1d;">❌ Registration Status: REJECTED</h3>
              <p style="margin: 8px 0;"><strong>Organization:</strong> ${organization.name}</p>
              <p style="margin: 8px 0;"><strong>Domain:</strong> ${organization.domain}</p>
              <p style="margin: 8px 0;"><strong>Rejected Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <!-- Rejection Reason -->
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 6px; margin: 25px 0;">
              <h3 style="margin-top: 0; color: #92400e;">📋 Reason for Rejection</h3>
              <p style="margin: 0; font-size: 15px; line-height: 1.8;">
                <strong style="color: #78350f;">${rejectionReason}</strong>
              </p>
            </div>

            <!-- What to do next -->
            <div style="background-color: #dbeafe; border-left: 4px solid #0284c7; padding: 20px; border-radius: 6px; margin: 25px 0;">
              <h3 style="margin-top: 0; color: #0c4a6e;">📌 Next Steps</h3>
              <p style="margin: 0 0 15px 0;">Please review the rejection reason above and take the following actions:</p>
              <ol style="margin: 0; padding-left: 20px;">
                <li style="margin: 8px 0;">Review the feedback provided by the platform admin</li>
                <li style="margin: 8px 0;">Make the necessary corrections or improvements</li>
                <li style="margin: 8px 0;">Submit a new registration request with the updated information</li>
              </ol>
            </div>

            <!-- Re-registration CTA -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${config.public.appUrl}/organization-register" style="background-color: #0284c7; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                📝 Submit New Registration
              </a>
            </div>

            <!-- Support -->
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 25px 0;">
              <h4 style="margin-top: 0;">Need Assistance?</h4>
              <p style="margin: 8px 0;">If you have questions about the rejection or need clarification on the feedback, please contact our support team. We're here to help you resolve these issues and get your organization approved.</p>
            </div>

            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                <strong>Best regards,</strong><br>
                ${platform.name} Platform Administration Team
              </p>
            </div>
          </div>

          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280;">
            <p style="margin: 0;">This is an automated message. Please do not reply to this email.</p>
          </div>
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
