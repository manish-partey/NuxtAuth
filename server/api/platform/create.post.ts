// /server/api/platform/create.post.ts
import { readBody, createError } from 'h3';
import { createPlatform } from '~/server/services/platform';
import { getUserFromEvent } from '~/server/utils/auth';
import { connectToDatabase } from '~/server/utils/db';

// Remove Application Insights for now since it's causing issues
// 
// Add a slug generation helper function
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Remove consecutive hyphens
}

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase();

    // Get user from authentication
    const user = await getUserFromEvent(event);
    if (!user || user.role !== 'super_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only super admins can create platforms'
      });
    }

    const body = await readBody(event);
    const { name, type, slug: clientSlug } = body;

    // Validate name
    if (!name || typeof name !== 'string' || !name.trim()) {
      return { success: false, message: 'Platform name is required' };
    }

    // Validate type (optional: adjust allowed types if you want)
    const allowedTypes = ['grocery', 'college', 'doctor', 'hospital', 'other'];
    if (!type || typeof type !== 'string' || !allowedTypes.includes(type)) {
      return { success: false, message: 'Valid platform type is required' };
    }

    // Use the provided slug if present and valid, else generate from name
    let slug = typeof clientSlug === 'string' && clientSlug.trim() ? clientSlug.trim() : generateSlug(name);

    if (!slug) {
      return { success: false, message: 'Platform slug is required' };
    }

    const platform = await createPlatform({
      name: name.trim(),
      type,
      slug,
      createdByUserId: user.id,
    });

    return { success: true, platform };
  } catch (err: any) {
    console.error('Platform creation error:', err);
    return { success: false, message: err.message || 'Failed to create platform' };
  }
});