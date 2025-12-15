import { readBody, createError } from 'h3';
import crypto from 'crypto';
import User from '~/server/models/User';
import Platform from '~/server/models/Platform';
import { getUserFromEvent } from '~/server/utils/auth';
import { sendEmail } from '~/server/utils/email';
import { getPlatformAdminAssignedEmailTemplate } from '~/server/utils/email-templates/platform-admin-assigned';
import { z } from 'zod';

const updateSchema = z.object({
  userId: z.string(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['super_admin', 'platform_admin', 'organization_admin', 'manager', 'employee', 'guest']).optional(),
  platformId: z.string().optional(),
  organizationId: z.string().optional(),
  disabled: z.boolean().optional(),
});

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await getUserFromEvent(event);
    if (!currentUser || !currentUser.role) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    // Check if user has required role
    const allowedRoles = ['super_admin', 'platform_admin', 'organization_admin', 'manager', 'employee', 'guest'];
    if (!allowedRoles.includes(currentUser.role)) {
      throw createError({ statusCode: 403, statusMessage: 'Insufficient permissions' });
    }

    // Validate input
    const body = await readBody(event);
    const { userId, name, email, role, platformId, organizationId, disabled } = updateSchema.parse(body);

    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' });
    }

    // ✅ Prevent user from modifying themselves
    const currentUserId = currentUser.id?.toString?.() || currentUser.id || null;
    const isSelf = currentUserId && userId === currentUserId;

    if (isSelf) {
      if (role && role !== currentUser.role) {
        throw createError({ statusCode: 400, statusMessage: 'You cannot change your own role' });
      }
      if (disabled === true) {
        throw createError({ statusCode: 400, statusMessage: 'You cannot disable your own account' });
      }
    }

    // ✅ Compare orgs safely
    let sameOrg = false;
    if (userToUpdate.organizationId && currentUser.organizationId) {
      sameOrg =
        userToUpdate.organizationId.toString() === currentUser.organizationId.toString();
    }

    // ✅ Role-based enforcement
    switch (currentUser.role) {
      case 'super_admin':
        break;

      case 'platform_admin':
        if (userToUpdate.role === 'super_admin') {
          throw createError({ statusCode: 403, statusMessage: 'Cannot update Super Admins' });
        }
        break;

      case 'organization_admin':
        if (!sameOrg) {
          throw createError({ statusCode: 403, statusMessage: 'Cannot update users outside your organization' });
        }
        if (role && !['organization_admin', 'manager', 'employee', 'guest'].includes(role)) {
          throw createError({ statusCode: 403, statusMessage: 'Cannot assign elevated roles' });
        }
        break;

      case 'manager':
      case 'employee':
      case 'guest':
        if (!isSelf) {
          throw createError({ statusCode: 403, statusMessage: 'You can only update your own profile' });
        }
        if (role || disabled !== undefined) {
          throw createError({ statusCode: 403, statusMessage: 'Users cannot change role or status' });
        }
        break;
    }

    // ✅ Validate platformId for platform_admin role
    if (role === 'platform_admin' && !platformId && !userToUpdate.platformId) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Platform ID is required for platform_admin role' 
      });
    }

    // ✅ Detect role change to platform_admin
    const isNewPlatformAdmin = role === 'platform_admin' && userToUpdate.role !== 'platform_admin';
    
    // ✅ Apply updates
    if (name) userToUpdate.name = name;
    if (email) userToUpdate.email = email;
    if (role) userToUpdate.role = role;
    if (platformId) userToUpdate.platformId = platformId;
    if (organizationId) userToUpdate.organizationId = organizationId;
    if (disabled !== undefined) userToUpdate.disabled = disabled;

    // ✅ Generate password reset token for new platform admins
    if (isNewPlatformAdmin) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      userToUpdate.resetPasswordToken = resetToken;
      userToUpdate.resetPasswordExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }

    await userToUpdate.save();

    // ✅ Send welcome email to new platform admin
    if (isNewPlatformAdmin) {
      try {
        const finalPlatformId = platformId || userToUpdate.platformId;
        const platform = await Platform.findById(finalPlatformId);
        
        if (platform) {
          const config = useRuntimeConfig();
          const resetLink = `${config.public.appUrl}/reset-password?token=${userToUpdate.resetPasswordToken}`;
          
          const emailHtml = getPlatformAdminAssignedEmailTemplate({
            userName: userToUpdate.name,
            platformName: platform.name,
            resetLink,
          });

          await sendEmail({
            to: userToUpdate.email,
            subject: `Welcome as Platform Admin - ${platform.name}`,
            html: emailHtml,
          });

          console.log('[INFO] Platform admin welcome email sent to:', userToUpdate.email);
        }
      } catch (emailError) {
        // Don't block user update if email fails
        console.error('[ERROR] Failed to send platform admin email:', emailError);
      }
    }

    return { success: true, user: userToUpdate };
  } catch (err: any) {
    console.error('[ERROR] User update failed:', err);
    throw createError({
      statusCode: 500,
      statusMessage: err?.message || 'User update failed',
    });
  }
});
