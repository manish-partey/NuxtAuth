import User from '~/server/models/User';
import { getUserFromEvent } from '~/server/utils/auth';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from '~/server/utils/mail';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { name, email, password, role, organizationId, platformId } = body;

  const currentUser = await getUserFromEvent(event);
  if (!currentUser || !['admin', 'super_admin'].includes(currentUser.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Only admins can create users.' });
  }

  // super_admin can set platform/org; others cannot
  let finalOrgId = currentUser.organizationId;
  let finalPlatformId = currentUser.platformId;

  if (currentUser.role === 'super_admin') {
    finalOrgId = organizationId || null;
    finalPlatformId = platformId || null;
  } else {
    if (organizationId && organizationId !== currentUser.organizationId) {
      throw createError({ statusCode: 403, statusMessage: 'Cannot assign users to a different organization.' });
    }
    if (platformId && platformId !== currentUser.platformId) {
      throw createError({ statusCode: 403, statusMessage: 'Cannot assign users to a different platform.' });
    }
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createError({ statusCode: 409, statusMessage: 'User already exists.' });
  }

  const verificationToken = uuidv4();

  const newUser = new User({
    name,
    email,
    password,
    role,
    organizationId: finalOrgId,
    platformId: finalPlatformId,
    verificationToken,
    verificationTokenExpiry: new Date(Date.now() + 3600000), // 1 hour
  });

  await newUser.save();

  const config = useRuntimeConfig();
  const verificationLink = `${config.public.appUrl}/verify-email?token=${verificationToken}`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
      <h2 style="color: #3b82f6;">Your Account Has Been Created</h2>
      <p>Hello ${name || 'User'},</p>
      <p>An account has been created for you in the <strong>EaseMyCargo App</strong>.</p>
      <p>To activate your account and set your password, please verify your email by clicking the button below:</p>
      <p style="margin: 30px 0;">
        <a href="${verificationLink}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
          Verify Email
        </a>
      </p>
      <p>This link will expire in 1 hour. If you were not expecting this, please ignore this email or contact support.</p>
      <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #777;">Best regards,<br>The EaseMyCargo App Team</p>
    </div>
  `;

  await sendEmail(email, 'Your Account Has Been Created – Verify Email', emailHtml);

  return { success: true, message: 'User created and verification email sent.' };
});
