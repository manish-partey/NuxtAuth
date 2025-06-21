// server/api/org/create.ts
import { defineEventHandler, readBody, createError } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';
import Organization from '~/server/models/Organization';
import Platform from '~/server/models/Platform';

export default defineEventHandler(async (event) => {
  if (event.method !== 'POST') {
    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' });
  }

  const user = await getUserFromEvent(event);

  if (!user || user.role !== 'super_admin') {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized to create organization' });
  }

  const { name, platformId, type } = await readBody(event);

  if (!name || !platformId || !type) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' });
  }

  const platform = await Platform.findById(platformId);
  if (!platform) {
    throw createError({ statusCode: 404, statusMessage: 'Platform not found' });
  }

  const existing = await Organization.findOne({ name, platformId });
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Organization already exists' });
  }

  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const domain = `${slug}-${Date.now()}`; // Unique domain generation

  const organization = new Organization({
    name,
    type,
    slug,
    domain,
    status: 'approved',
    platformId,
    createdBy: user.id
  });



  await organization.save();

  return {
    success: true,
    message: 'Organization created',
    organizationId: organization._id,
  };
});
