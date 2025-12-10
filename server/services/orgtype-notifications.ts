// server/services/orgtype-notifications.ts
// #8 - Email Notifications for Better Admin UX
import { sendEmail } from '~/server/utils/mail';
import User from '~/server/models/User';
import OrganizationType from '~/server/models/OrganizationType';
import Platform from '~/server/models/Platform';

export async function notifySuperAdminsNewType(orgTypeId: string) {
  try {
    const orgType = await OrganizationType.findById(orgTypeId)
      .populate('createdBy', 'name email')
      .populate('platformId', 'name');
    
    if (!orgType) return;
    
    const superAdmins = await User.find({ role: 'super_admin' });
    
    for (const admin of superAdmins) {
      await sendEmail(
        admin.email,
        `New Organization Type Pending Approval: ${orgType.name}`,
        `
          <h2>New Organization Type Request</h2>
          <p>A new organization type has been created and requires your approval.</p>
          
          <h3>Details:</h3>
          <ul>
            <li><strong>Type Name:</strong> ${orgType.name} (${orgType.code})</li>
            <li><strong>Description:</strong> ${orgType.description || 'N/A'}</li>
            <li><strong>Category:</strong> ${orgType.category}</li>
            <li><strong>Platform:</strong> ${orgType.platformId?.name || 'Global'}</li>
            <li><strong>Created By:</strong> ${orgType.createdBy?.name} (${orgType.createdBy?.email})</li>
            <li><strong>Justification:</strong> ${orgType.justification || 'N/A'}</li>
          </ul>
          
          <p><a href="${process.env.APP_URL}/admin/organization-types/pending" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Review Pending Types</a></p>
          
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This is an automated notification from the Organization Type Management System.
          </p>
        `
      );
    }
  } catch (error) {
    console.error('Error sending notification to super admins:', error);
  }
}

export async function notifyPlatformAdminApproval(orgTypeId: string, approved: boolean, rejectionReason?: string) {
  try {
    const orgType = await OrganizationType.findById(orgTypeId)
      .populate('createdBy', 'name email')
      .populate('platformId', 'name')
      .populate('approvedBy', 'name email');
    
    if (!orgType || !orgType.createdBy) return;
    
    const subject = approved 
      ? `Organization Type Approved: ${orgType.name}`
      : `Organization Type Rejected: ${orgType.name}`;
    
    const statusHtml = approved
      ? `<p style="color: #10B981; font-weight: bold;">✅ Your organization type has been APPROVED!</p>`
      : `<p style="color: #EF4444; font-weight: bold;">❌ Your organization type has been REJECTED.</p>`;
    
    const rejectionHtml = !approved && rejectionReason
      ? `<p><strong>Rejection Reason:</strong> ${rejectionReason}</p>`
      : '';
    
    await sendEmail(
      orgType.createdBy.email,
      subject,
      `
        <h2>Organization Type Status Update</h2>
        ${statusHtml}
        
        <h3>Details:</h3>
        <ul>
          <li><strong>Type Name:</strong> ${orgType.name} (${orgType.code})</li>
          <li><strong>Category:</strong> ${orgType.category}</li>
          <li><strong>Platform:</strong> ${orgType.platformId?.name || 'Global'}</li>
          <li><strong>Reviewed By:</strong> ${orgType.approvedBy?.name || 'Super Admin'}</li>
        </ul>
        
        ${rejectionHtml}
        
        ${approved ? `
          <p>You can now use this organization type when registering new organizations.</p>
          <p><a href="${process.env.APP_URL}/platform/organization-types" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Organization Types</a></p>
        ` : `
          <p>If you believe this was rejected in error, please contact the super administrator or create a new request with additional justification.</p>
        `}
        
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          This is an automated notification from the Organization Type Management System.
        </p>
      `
    );
  } catch (error) {
    console.error('Error sending notification to platform admin:', error);
  }
}

export async function notifyTypePromotion(orgTypeId: string, action: 'promoted' | 'merged', targetTypeId?: string) {
  try {
    const orgType = await OrganizationType.findById(orgTypeId)
      .populate('createdBy', 'name email')
      .populate('platformId', 'name');
    
    if (!orgType || !orgType.createdBy) return;
    
    const targetType = targetTypeId ? await OrganizationType.findById(targetTypeId) : null;
    
    const subject = action === 'promoted'
      ? `Your Organization Type Promoted to Global: ${orgType.name}`
      : `Your Organization Type Merged: ${orgType.name}`;
    
    const actionHtml = action === 'promoted'
      ? `<p style="color: #10B981; font-weight: bold;">🎉 Your organization type has been PROMOTED to global!</p>
         <p>This means it is now available to all platforms, not just yours.</p>`
      : `<p style="color: #3B82F6; font-weight: bold;">🔄 Your organization type has been MERGED with global type: ${targetType?.name}</p>
         <p>All organizations using your type have been migrated to the global type "${targetType?.name}".</p>`;
    
    await sendEmail(
      orgType.createdBy.email,
      subject,
      `
        <h2>Organization Type Update</h2>
        ${actionHtml}
        
        <h3>Original Type Details:</h3>
        <ul>
          <li><strong>Type Name:</strong> ${orgType.name} (${orgType.code})</li>
          <li><strong>Category:</strong> ${orgType.category}</li>
          <li><strong>Platform:</strong> ${orgType.platformId?.name || 'N/A'}</li>
          <li><strong>Organizations Using:</strong> ${orgType.usageCount}</li>
        </ul>
        
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          This is an automated notification from the Organization Type Management System.
        </p>
      `
    );
  } catch (error) {
    console.error('Error sending promotion notification:', error);
  }
}
