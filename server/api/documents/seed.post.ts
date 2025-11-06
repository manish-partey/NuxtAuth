import { defineEventHandler, createError } from 'h3';
import DocumentType from '~/server/models/DocumentType';
import { getUserFromEvent } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event);
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  if (user.role !== 'platform_admin') throw createError({ statusCode: 403, statusMessage: 'Forbidden' });

  const defaultTypes = [
    { name: 'Platform Agreement', key: 'platform_agreement', layer: 'platform', required: true, rolesAllowed: ['platform_admin'], description: 'Agreement document for platform' },
    { name: 'Organization Registration Proof', key: 'org_registration', layer: 'organization', required: true, rolesAllowed: ['organization_admin'], description: 'Proof required for organization registration' },
    { name: 'User ID Proof', key: 'user_id', layer: 'user', required: false, rolesAllowed: ['user', 'organization_admin'], description: 'User identification document' },
  ];

  for (const t of defaultTypes) {
    const exists = await DocumentType.findOne({ key: t.key });
    if (!exists) await DocumentType.create(t);
  }

  return { success: true, message: 'Default document types ensured' };
});
