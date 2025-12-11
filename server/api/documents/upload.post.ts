import { defineEventHandler, createError } from 'h3';
import Document from '~/server/models/document';
import DocumentType from '~/server/models/DocumentType';
import User from '~/server/models/User';
import { getUserFromEvent } from '~/server/utils/auth';
import { saveFile, validateFile } from '~/server/utils/file';
import { sendEmail } from '~/server/utils/email';

export const config = { api: { bodyParser: false } };

export default defineEventHandler(async (event) => {
  // parse multipart
  const user = await getUserFromEvent(event);
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });

  const formidable = (await import('formidable')).default;
  const form = formidable({ multiples: false });

  const { fields, files } = await new Promise<any>((resolve, reject) => {
    form.parse(event.node.req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

  const file = Array.isArray(files?.file) ? files.file[0] : files?.file;
  if (!file) throw createError({ statusCode: 400, statusMessage: 'No file uploaded' });

  // Helper function to extract string value from formidable fields (can be string or array)
  const getFieldValue = (field: any): string | null => {
    if (Array.isArray(field)) {
      return field[0] || null;
    }
    return field || null;
  };

  const layer = getFieldValue(fields.layer) || 'organization';
  const layerId = getFieldValue(fields.layerId) || null;
  const docKey = getFieldValue(fields.docKey) || null; // optional document type key
  const documentTypeId = getFieldValue(fields.documentTypeId) || null;

  // Document type and validation setup

  // Check document type config (if provided)
  let docType = null;
  if (docKey) {
    docType = await DocumentType.findOne({ key: docKey, active: true });
    if (!docType) throw createError({ statusCode: 400, statusMessage: 'Invalid document type' });
    // ensure uploader role allowed
    if ((docType as any)?.rolesAllowed && (docType as any).rolesAllowed.length > 0 && !(docType as any).rolesAllowed.includes(user.role)) {
      throw createError({ statusCode: 403, statusMessage: 'You are not allowed to upload this document' });
    }
  }

  // Prepare file info for validation and saving
  const fileInfo = {
    originalName: file.originalFilename,
    mimeType: file.mimetype,
    size: file.size,
    filepath: file.filepath
  };

  // Use file utility to save with validation
  const savedFile = await saveFile(fileInfo, {
    subPath: `documents/${layer}/${layerId || 'common'}`,
    maxSize: (docType as any)?.maxSize,
    allowedMimeTypes: (docType as any)?.allowedMimeTypes?.length ? (docType as any).allowedMimeTypes : undefined
  });

  // Save metadata
  const doc = await Document.create({
    name: docKey || (docType as any)?.name || file.originalFilename, // Use docKey, docType name, or filename as fallback
    originalName: file.originalFilename,
    fileUrl: savedFile.url,
    mimeType: file.mimetype,
    size: file.size,
    layer,
    layerId,
    uploadedBy: user.id,
    status: (docType as any)?.required ? 'pending' : 'uploaded',
    required: (docType as any)?.required ?? false,
    uploadedAt: new Date(),
    documentTypeId: documentTypeId || (docType as any)?._id // Use documentTypeId if provided
  });

  // Send notification email if document is required (pending approval)
  if ((docType as any)?.required) {
    try {
      // Find admins who can approve this document
      let approvers = [];
      if (layer === 'organization' && layerId) {
        approvers = await User.find({ 
          role: { $in: ['platform_admin', 'organization_admin'] },
          $or: [
            { role: 'platform_admin' },
            { role: 'organization_admin', organizationId: layerId }
          ]
        });
      } else if (layer === 'platform') {
        approvers = await User.find({ role: 'platform_admin' });
      }

      if (approvers.length > 0) {
        const config = useRuntimeConfig();
        const emailSubject = `📄 New Document Requires Approval - ${doc.name}`;
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">📄 Document Pending Approval</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">New ${(docType as any).name} uploaded</p>
            </div>

            <div style="padding: 30px; background-color: #ffffff;">
              <p>Hello Admin,</p>
              
              <p>A new document has been uploaded that requires your approval:</p>

              <!-- Document Details -->
              <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 6px; margin: 25px 0;">
                <h3 style="margin-top: 0; color: #1e40af;">📄 Document Details</h3>
                <p style="margin: 8px 0;"><strong>Document Type:</strong> ${(docType as any).name}</p>
                <p style="margin: 8px 0;"><strong>Original Name:</strong> ${doc.originalName}</p>
                <p style="margin: 8px 0;"><strong>Uploaded by:</strong> ${user.name} (${user.email})</p>
                <p style="margin: 8px 0;"><strong>Layer:</strong> ${layer}</p>
                <p style="margin: 8px 0;"><strong>Size:</strong> ${(file.size / 1024).toFixed(2)} KB</p>
                <p style="margin: 8px 0;"><strong>Upload Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>

              <p>Please review and approve or reject this document in the admin panel.</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${config.public.appUrl}/admin/documents" style="background-color: #3b82f6; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                  🔍 Review Document
                </a>
              </div>

              <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; font-size: 12px; color: #6b7280;">
                  <strong>Best regards,</strong><br>
                  Document Management System
                </p>
              </div>
            </div>

            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280;">
              <p style="margin: 0;">This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        `;

        // Send to all approvers
        for (const approver of approvers) {
          await sendEmail((approver as any).email, emailSubject, emailHtml);
        }
      }
    } catch (emailError) {
      console.error('Failed to send approval notification email:', emailError);
      // Continue even if email fails
    }
  }

  return { success: true, document: { id: doc._id, fileUrl: savedFile.url, name: doc.name, status: doc.status } };
});
