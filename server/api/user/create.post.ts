import User from '~/server/models/User';
import { getUserFromEvent } from '~/server/utils/auth';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from '~/server/utils/mail';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { name, email, password, role } = body;

  const currentUser = await getUserFromEvent(event);
  if (!currentUser || currentUser.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Only admins can create users.' });
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
    organizationId: currentUser.organizationId,
    verificationToken,
    verificationTokenExpiry: new Date(Date.now() + 3600000),
  });

  await newUser.save();

  const config = useRuntimeConfig();
  const verificationLink = `${config.public.appUrl}/verify-email?token=${verificationToken}`;
  await sendEmail(email, 'Account created', `Verify your email: <a href="${verificationLink}">${verificationLink}</a>`);

  return { message: 'User created and verification email sent.' };
});
