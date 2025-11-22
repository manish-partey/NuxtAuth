import { defineEventHandler, createError } from 'h3';
import Document from '../../models/Document';
import { getUserFromEvent } from '~/server/utils/auth';
import { unlink } from 'fs/promises';
import path from 'path';

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event);
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });

  const id = event.context.params?.id;
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Document id is required' });

  const doc = await Document.findById(id);
  if (!doc) throw createError({ statusCode: 404, statusMessage: 'Document not found' });

  // Only uploader, organization_admin of same org, or platform_admin can delete
  if (user.role !== 'platform_admin') {
    if (doc.uploadedBy?.toString() !== user.id) {
      if (!(user.role === 'organization_admin' && doc.layer === 'organization' && doc.layerId === user.organizationId)) {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
      }
    }
  }

  // attempt to remove file from disk
  try {
    const localPath = path.join(process.cwd(), 'public', doc.fileUrl.replace(/^\//, ''));
    await unlink(localPath).catch(() => null);
  } catch (e) {
    // ignore file deletion errors
  }

  await doc.remove();

  return { success: true };
});
