// server/utils/audit-logger.ts
import AuditLog from '../models/AuditLog';
import type { H3Event } from 'h3';

interface AuditLogData {
  organizationId: string;
  userId: string;
  action: string;
  targetType: string;
  targetId?: string;
  details?: object;
}

export async function logAuditAction(event: H3Event, data: AuditLogData) {
  try {
    const ipAddress =
      (event.node.req.headers['x-forwarded-for'] as string) ||
      event.node.req.socket?.remoteAddress ||
      'unknown';
    const userAgent = (event.node.req.headers['user-agent'] as string) || 'unknown';

    await AuditLog.create({
      ...data,
      ipAddress,
      userAgent,
    });

    console.log(`[AUDIT LOG] ${data.action} by user ${data.userId} in org ${data.organizationId}`);
  } catch (error) {
    console.error('[AUDIT LOG] Failed to log action:', error);
    // Don't throw - audit logging should not break the application
  }
}
