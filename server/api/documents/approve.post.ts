import { defineEventHandler, createError, readBody } from 'h3';
import Document from '~/server/models/document';
import User from '~/server/models/User';
import Organization from '~/server/models/Organization';
import { getUserFromEvent } from '~/server/utils/auth';
import { sendEmail } from '~/server/utils/email';

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event);
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });

  const body = await readBody(event);
  const { documentId, comments } = body;

  if (!documentId) {
    throw createError({ statusCode: 400, statusMessage: 'Document ID is required' });
  }

  const doc = await Document.findById(documentId).populate('uploadedBy');
  if (!doc) {
    throw createError({ statusCode: 404, statusMessage: 'Document not found' });
  }

  // Authorization: only platform_admin or organization_admin of same org can approve
  if (user.role !== 'platform_admin') {
    if (user.role !== 'organization_admin' || doc.layer !== 'organization' || doc.layerId !== user.organizationId) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
    }
  }

  // Update document status
  doc.status = 'approved';
  await doc.save();

  // Send notification email to uploader
  try {
    const uploader = await User.findById(doc.uploadedBy);
    if (uploader) {
      let orgName = 'Unknown Organization';
      if (doc.layer === 'organization' && doc.layerId) {
        const org = await Organization.findById(doc.layerId);
        orgName = org?.name || orgName;
      }

      const config = useRuntimeConfig();
      const emailSubject = `✅ Document Approved - ${doc.name}`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">✅ Document Approved</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">${doc.name}</p>
          </div>

          <div style="padding: 30px; background-color: #ffffff;">
            <p>Hello ${uploader.name},</p>
            
            <p>Great news! Your document "<strong>${doc.name}</strong>" has been approved by the ${user.role.replace('_', ' ')}.</p>

            <!-- Document Details -->
            <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; border-radius: 6px; margin: 25px 0;">
              <h3 style="margin-top: 0; color: #166534;">📄 Document Details</h3>
              <p style="margin: 8px 0;"><strong>Document:</strong> ${doc.name}</p>
              <p style="margin: 8px 0;"><strong>Organization:</strong> ${orgName}</p>
              <p style="margin: 8px 0;"><strong>Approved by:</strong> ${user.name} (${user.role.replace('_', ' ')})</p>
              <p style="margin: 8px 0;"><strong>Status:</strong> Approved</p>
              <p style="margin: 8px 0;"><strong>Approved Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            ${comments ? `
            <!-- Comments -->
            <div style="background-color: #e0f2fe; border-left: 4px solid #0284c7; padding: 20px; border-radius: 6px; margin: 25px 0;">
              <h3 style="margin-top: 0; color: #0c4a6e;">💬 Comments</h3>
              <p style="margin: 0; font-style: italic;">${comments}</p>
            </div>
            ` : ''}

            <p>Your document is now active in the system and can be used for verification purposes.</p>

            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                <strong>Best regards,</strong><br>
                ${orgName} Team
              </p>
            </div>
          </div>

          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280;">
            <p style="margin: 0;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `;

      await sendEmail(uploader.email, emailSubject, emailHtml);
    }
  } catch (emailError) {
    console.error('Failed to send approval notification email:', emailError);
    // Continue even if email fails
  }

  return { 
    success: true, 
    message: 'Document approved successfully',
    document: {
      id: doc._id,
      name: doc.name,
      status: doc.status
    }
  };
});