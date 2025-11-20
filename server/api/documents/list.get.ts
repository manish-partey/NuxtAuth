import { defineEventHandler, createError } from 'h3';
import Document from '~/server/models/Document';
import { getUserFromEvent } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event);
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });

  // support query params: layer, layerId
  const url = new URL(event.node.req.url || '', `http://${event.node.req.headers.host || 'localhost'}`);
  const layer = url.searchParams.get('layer');
  const layerId = url.searchParams.get('layerId');

  const query: any = {};
  if (layer) query.layer = layer;
  if (layerId) query.layerId = layerId;

  // Basic authorization: platform_admin can see platform docs, org_admin can see org docs for their org
  if (user.role === 'organization_admin' && layer === 'organization') {
    // ensure they only request their own org unless platform_admin
    query.layerId = user.organizationId;
  }

  const docs = await Document.find(query).sort({ uploadedAt: -1 }).lean();
  return { success: true, documents: docs };
});
