// server/api/platform/organization/approve.post.ts
import { defineEventHandler, readBody, createError } from 'h3';
import Organization from '~/server/models/Organization';
import User from '~/server/models/User';
import { connectToDatabase } from '~/server/utils/db';
import { getUserFromEvent } from '~/server/utils/auth';
import { sendEmail } from '~/server/utils/mail';
import { v4 as uuidv4 } from 'uuid';

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase();
    
    // Verify user is platform admin
    const user = await getUserFromEvent(event);
    if (!user || user.role !== 'platform_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only platform admins can approve organizations'
      });
    }

    const body = await readBody(event);
    const { organizationId, action, rejectionReason } = body;

    if (!organizationId || !action) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Organization ID and action are required'
      });
    }

    if (!['approve', 'reject'].includes(action)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Action must be either "approve" or "reject"'
      });
    }

    // Find the organization
    const organization = await Organization.findById(organizationId)
      .populate('createdBy')
      .populate('platformId');

    if (!organization) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Organization not found'
      });
    }

    // Verify this organization belongs to the platform admin's platform
    if (organization.platformId._id.toString() !== user.platformId?.toString()) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only manage organizations under your platform'
      });
    }

    if (organization.status !== 'pending') {
      throw createError({
        statusCode: 400,
        statusMessage: `Organization is already ${organization.status}`
      });
    }

    const config = useRuntimeConfig();
    
    if (action === 'approve') {
      // Approve the organization
      organization.status = 'approved';
      await organization.save();

      // Update the admin user
      const adminUser = await User.findById(organization.createdBy._id);
      if (adminUser) {
        adminUser.organizationId = organization._id;
        // Generate new verification token for email verification
        adminUser.verificationToken = uuidv4();
        adminUser.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await adminUser.save();

        // Send approval and verification email to organization admin
        const verificationLink = `${config.public.appUrl}/verify-email?token=${adminUser.verificationToken}`;
        const approvalEmailHtml = `
          <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
            <h2 style="color: #22c55e;">🎉 Organization Approved!</h2>
            <p>Hello ${adminUser.name},</p>
            <p>Great news! Your organization "<strong>${organization.name}</strong>" has been approved by the platform administrator.</p>
            
            <div style="background-color: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
              <p style="margin: 0;"><strong>Status:</strong> ✅ Approved</p>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>Verify your email address using the button below</li>
              <li>Log in to your admin dashboard</li>
              <li>Start adding users to your organization</li>
            </ol>
            
            <p style="margin: 30px 0;">
              <a href="${verificationLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Verify Email & Activate Account
              </a>
            </p>
            
            <p style="font-size: 14px; color: #666;">
              This verification link will expire in 24 hours. Once verified, you can access your organization dashboard.
            </p>
            
            <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #777;">
              Welcome to the platform!<br>
              Platform Management System
            </p>
          </div>
        `;

        await sendEmail(
          adminUser.email,
          `🎉 Organization Approved - ${organization.name}`,
          approvalEmailHtml
        );
      }

      return {
        success: true,
        message: 'Organization approved successfully. The admin has been notified.',
        organization: {
          id: organization._id,
          name: organization.name,
          status: organization.status
        }
      };

    } else if (action === 'reject') {
      if (!rejectionReason) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Rejection reason is required'
        });
      }

      // Reject the organization
      organization.status = 'rejected';
      await organization.save();

      // Send rejection email to organization admin
      const adminUser = organization.createdBy;
      const rejectionEmailHtml = `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
          <h2 style="color: #ef4444;">Organization Registration Rejected</h2>
          <p>Hello ${adminUser.name},</p>
          <p>We regret to inform you that your organization registration for "<strong>${organization.name}</strong>" has been rejected.</p>
          
          <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <p style="margin: 0;"><strong>Status:</strong> ❌ Rejected</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold;">Reason for rejection:</p>
            <p style="margin: 10px 0 0 0; font-style: italic;">${rejectionReason}</p>
          </div>
          
          <p>If you believe this was a mistake or would like to discuss this decision, please contact the platform administrator.</p>
          
          <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #777;">
            Best regards,<br>
            Platform Management System
          </p>
        </div>
      `;

      await sendEmail(
        adminUser.email,
        `Organization Registration Rejected - ${organization.name}`,
        rejectionEmailHtml
      );

      return {
        success: true,
        message: 'Organization rejected. The admin has been notified.',
        organization: {
          id: organization._id,
          name: organization.name,
          status: organization.status
        }
      };
    }

  } catch (err: any) {
    console.error('[API] Organization approval error:', err);
    
    if (err.statusCode) {
      throw err;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process organization approval',
    });
  }
});
