// server/api/org/users/[id]/trigger-reset.post.ts
import { defineEventHandler, createError, getRouterParam } from 'h3';
import { requireOrganizationAccess } from '~/server/utils/auth';
import { requireFeature } from '~/server/utils/feature-guard';
import User from '~/server/models/User';
import crypto from 'crypto';
import { sendEmail } from '~/server/utils/mail';
import { logAuditAction } from '~/server/utils/audit-logger';

export default defineEventHandler(async (event) => {
  try {
    // Check if password reset trigger feature is enabled
    requireFeature(event, 'orgAdmin.passwordResetTrigger', 'Password reset trigger is not enabled');
    
    const currentUser = await requireOrganizationAccess(event);
    const userId = getRouterParam(event, 'id');

    if (!userId) {
      throw createError({ statusCode: 400, statusMessage: 'User ID required' });
    }

    // Find user and verify they belong to same organization
    const user = await User.findById(userId);

    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' });
    }

    if (user.organizationId?.toString() !== currentUser.organizationId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Cannot trigger password reset for users outside your organization',
      });
    }

    // Generate reset token
    const resetPasswordToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpiry = resetPasswordExpiry;
    await user.save();

    // Send email
    const config = useRuntimeConfig();
    const resetUrl = `${config.public.appUrl}/reset-password?token=${resetPasswordToken}`;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background-color: #22c55e; color: white; padding: 12px 24px; 
                 text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { margin-top: 20px; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Password Reset Request</h1>
    </div>
    <div class="content">
        <p>Hello ${user.name},</p>
        <p>A password reset has been requested for your account by your organization administrator.</p>
        <p>Click the button below to reset your password:</p>
        <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
        </p>
        <p><strong>This link will expire in 24 hours.</strong></p>
        <p>If you did not request this reset, please contact your organization administrator.</p>
        <p>Best regards,<br>Your Organization Team</p>
    </div>
</body>
</html>
    `;

    await sendEmail(user.email, 'Password Reset Request', emailHtml);

    // Log audit action
    await logAuditAction(event, {
      organizationId: currentUser.organizationId!,
      userId: currentUser.id!,
      action: 'password_reset_sent',
      targetType: 'user',
      targetId: userId,
      details: { targetEmail: user.email, targetName: user.name },
    });

    return { success: true, message: 'Password reset email sent successfully' };
  } catch (error: any) {
    console.error('[PASSWORD RESET] Error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to send password reset email',
    });
  }
});
