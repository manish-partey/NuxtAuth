// server/services/audit.ts
import AuditLog from '../models/AuditLog';
import type { H3Event } from 'h3';
import { getHeader } from 'h3';

export async function logAudit(params: {
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  platformId?: string;
  organizationId?: string;
  details?: any;
  changes?: any;
  event?: H3Event;
}) {
  try {
    const auditData: any = {
      action: params.action,
      targetType: params.entityType,
      targetId: params.entityId,
      userId: params.userId,
      platformId: params.platformId || null,
      organizationId: params.organizationId || null,
      details: params.details || {},
      changes: params.changes || null,
    };

    // Extract IP and User Agent from event if provided
    if (params.event) {
      auditData.ipAddress = getClientIp(params.event);
      auditData.userAgent = getHeader(params.event, 'user-agent') || null;
    }

    await AuditLog.create(auditData);
    console.log(`[Audit] ${params.action} logged for ${params.entityType}:${params.entityId}`);
  } catch (error) {
    console.error('[Audit] Failed to log audit:', error);
    // Don't throw - audit failure shouldn't block operations
  }
}

function getClientIp(event: H3Event): string | null {
  const forwardedFor = getHeader(event, 'x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIp = getHeader(event, 'x-real-ip');
  if (realIp) {
    return realIp;
  }

  return event.node.req.socket?.remoteAddress || null;
}

export async function getAuditLogs(filter: {
  entityType?: string;
  entityId?: string;
  userId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  const query: any = {};

  if (filter.entityType) query.entityType = filter.entityType;
  if (filter.entityId) query.entityId = filter.entityId;
  if (filter.userId) query.userId = filter.userId;
  if (filter.action) query.action = filter.action;
  
  if (filter.startDate || filter.endDate) {
    query.createdAt = {};
    if (filter.startDate) query.createdAt.$gte = filter.startDate;
    if (filter.endDate) query.createdAt.$lte = filter.endDate;
  }

  return await AuditLog.find(query)
    .sort({ createdAt: -1 })
    .limit(filter.limit || 100)
    .populate('userId', 'name email')
    .populate('platformId', 'name')
    .populate('organizationId', 'name')
    .lean();
}
