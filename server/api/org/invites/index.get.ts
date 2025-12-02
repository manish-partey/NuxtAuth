// server/api/org/invites/index.get.ts
import { defineEventHandler, createError } from 'h3';
import { getUserFromEvent } from '~/server/utils/auth';
// Import your Invite/User model here

export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromEvent(event);
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: 'Authentication required' });
    }

    const organizationId = user.organizationId;
    if (!organizationId) {
      throw createError({ statusCode: 403, statusMessage: 'No organization associated' });
    }

    // Fetch invites for the organization
    // Replace with your actual invite model/logic
interface Invite {
  id: string;
  email: string;
  organizationId: string;
  invitedBy: string;
  status: string;
  createdAt: Date;
}

const invites: Invite[] = []; // await Invite.find({ organizationId }).populate('invitedBy');

    return {
      success: true,
      invites
    };
  } catch (error: any) {
    console.error('[API] Get invites error:', error);
    throw error.statusCode ? error : createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch invites'
    });
  }
});