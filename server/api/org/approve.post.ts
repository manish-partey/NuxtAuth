// server/api/org/approve.post.ts
import Organization from '~/server/models/Organization';
import User from '~/server/models/User';
import { sendEmail } from '~/server/utils/mail';
import { v4 as uuidv4 } from 'uuid';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { organizationId } = body;

    // Validate required fields
    if (!organizationId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Organization ID is required',
      });
    }

    // Fetch the organization
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Organization not found',
      });
    }

    // Check if the organization is already approved
    if (organization.status === 'approved') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Organization is already approved',
      });
    }

    // Fetch the organization admin
    const adminUser = await User.findOne({
      organizationId: organization._id,
      role: 'organization_admin',
    });

    if (!adminUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Organization admin not found',
      });
    }

    // Update the organization's status to approved
    organization.status = 'approved';
    await organization.save();

    // Generate password reset token for org admin
    const resetPasswordToken = uuidv4();
    const resetPasswordExpiry = new Date(Date.now() + 3600000); // 1 hour validity

    // Mark the organization admin as verified and set reset token
    adminUser.isVerified = true;
    adminUser.isVerificationTokenUsed = true;
    adminUser.resetPasswordToken = resetPasswordToken;
    adminUser.resetPasswordExpiry = resetPasswordExpiry;
    await adminUser.save();
    
    console.log(`[APPROVE] Organization admin marked as verified: ${adminUser.email}, isVerified: ${adminUser.isVerified}`);
    console.log(`[APPROVE] Password reset token generated: ${resetPasswordToken.substring(0, 20)}...`);

    // Send email to the organization admin
    const config = useRuntimeConfig();
    const resetPasswordLink = `${config.public.appUrl}/reset-password?token=${resetPasswordToken}`;
    
    const emailHtml = `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
      <h2 style="color: #3b82f6;">EaseMyCargo App – Organization Approved ✓</h2>
      <p>Hello ${adminUser.name || 'Admin'},</p>
      <p>Great news! Your organization, <strong>${organization.name}</strong>, has been approved by the platform admin.</p>
      <p>Your account is now verified and ready to use!</p>
      
      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; font-weight: bold; color: #856404;">⚠️ Important: Password Reset Required</p>
        <p style="margin: 10px 0 0 0; color: #856404;">Before you can log in to the system, you must reset your password. Follow the steps below:</p>
      </div>
      
      <h3 style="color: #3b82f6; margin-top: 30px; font-size: 18px;">Step 1: Reset Your Password</h3>
      <p style="font-size: 16px; font-weight: bold;">Click the button below to set a new secure password:</p>
      <p style="margin: 20px 0;">
        <a href="${resetPasswordLink}" style="background-color: #dc3545; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
          🔒 Reset Your Password Now
        </a>
      </p>
      <p style="font-size: 14px; color: #666; margin: 10px 0;">
        ⏰ This link will expire in <strong>1 hour</strong> for security purposes.
      </p>
      
      <h3 style="color: #3b82f6; margin-top: 30px; font-size: 18px;">Step 2: Log In</h3>
      <p style="font-size: 16px;">After resetting your password, use these credentials to log in:</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #3b82f6;">
        <p style="margin: 8px 0;"><strong>Email:</strong> ${adminUser.email}</p>
        <p style="margin: 8px 0;"><strong>Password:</strong> The password you just set in Step 1</p>
      </div>
      
      <p style="margin: 20px 0;">
        <a href="${config.public.appUrl}/login" style="background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
          Go to Login
        </a>
      </p>
      
      <h3 style="color: #3b82f6; margin-top: 30px; font-size: 18px;">✓ What You Can Do After Login</h3>
      <ul style="font-size: 15px; line-height: 1.8;">
        <li>✓ Add team members to your organization</li>
        <li>✓ Manage user roles and permissions</li>
        <li>✓ Configure organization settings</li>
        <li>✓ Access all EaseMyCargo features</li>
      </ul>
      
      <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; font-weight: bold; color: #155724;">✅ Summary</p>
        <p style="margin: 8px 0; color: #155724;">1. Click "Reset Your Password Now" above</p>
        <p style="margin: 8px 0; color: #155724;">2. Set a strong password</p>
        <p style="margin: 8px 0; color: #155724;">3. Log in with your email and new password</p>
        <p style="margin: 8px 0; color: #155724;">4. Start managing your organization!</p>
      </div>
      
      <p style="margin-top: 30px;">If you have any questions, please contact the EaseMyCargo support team.</p>
      <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #777;">Thank you,<br>The EaseMyCargo App Team</p>
    </div>
    `;

    await sendEmail(
      adminUser.email,
      'Your Organization Has Been Approved – Set Your Password',
      emailHtml
    );

    return {
      success: true,
      message: 'Organization approved and email sent to the admin.',
    };
  } catch (err: any) {
    console.error('[API] Organization approval error:', err);

    // Generic server error
    throw createError({
      statusCode: 500,
      statusMessage: 'Organization approval failed. Please try again.',
    });
  }
});