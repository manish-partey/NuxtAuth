import { defineEventHandler, createError } from 'h3';
import Document from '~/server/models/document';
import { getUserFromEvent } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event);
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });

  const id = event.context.params?.id;
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Document id is required' });

  const doc = await Document.findById(id).lean() as any;
  if (!doc) throw createError({ statusCode: 404, statusMessage: 'Document not found' });

  // Authorization: allow if uploadedBy or platform_admin, or org_admin for same org
  if (user.role === 'platform_admin') return { success: true, document: doc };
  if (user.role === 'organization_admin' && doc.layer === 'organization' && doc.layerId === user.organizationId) return { success: true, document: doc };
  if (doc.uploadedBy?.toString() === user.id) return { success: true, document: doc };

  throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
});
