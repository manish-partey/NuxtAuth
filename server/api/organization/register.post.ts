import Organization from '~/server/models/Organization';
import User from '~/server/models/User';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from '~/server/utils/mail';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { orgName, orgDomain, adminName, adminEmail, adminPassword } = body;

  const existingOrg = await Organization.findOne({ domain: orgDomain });
  if (existingOrg) throw createError({ statusCode: 409, statusMessage: 'Organization already exists' });

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
  await sendEmail(adminUser.email, 'Verify your email', `Click <a href="${verificationLink}">here</a>`);

  return { message: 'Organization and admin registered successfully' };
});