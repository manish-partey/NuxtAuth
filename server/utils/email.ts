// server/utils/email.ts
import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

// Email configuration
const getEmailTransporter = () => {
  // Read from environment variables at RUNTIME (not build time)
  // This ensures Azure environment variables are picked up
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const port = process.env.SMTP_PORT || process.env.EMAIL_PORT || '587';
  
  console.log('[EMAIL] Debug - Config values:', {
    host: host || 'NOT SET',
    user: user || 'NOT SET',
    pass: pass ? '***SET***' : 'NOT SET',
    port: port || 'NOT SET'
  });
  
  // Check if SMTP is properly configured
  if (!host || !user || !pass) {
    console.warn('[EMAIL] SMTP not configured. Emails will be logged to console.');
    console.warn('[EMAIL] Missing:', {
      host: !host,
      user: !user,
      pass: !pass
    });
    return null;
  }

  const portNum = Number(port) || 587;
  const transportOptions: SMTPTransport.Options = {
    host: host as string,
    port: portNum,
    secure: portNum === 465, // true for 465, false for other ports (587)
    auth: {
      user: user as string,
      pass: pass as string,
    },
    // Additional options for better reliability
    tls: {
      rejectUnauthorized: false // Allow self-signed certificates in development
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 30000, // 30 seconds
  };

  return nodemailer.createTransport(transportOptions);
};

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Support both old signature (email, subject, content) and new signature (options object)
export async function sendEmail(to: string, subject: string, htmlOrText: string): Promise<{ success: boolean; method: string }>;
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; method: string }>;
export async function sendEmail(
  toOrOptions: string | EmailOptions,
  subject?: string,
  htmlOrText?: string
): Promise<{ success: boolean; method: string }> {
  // Normalize parameters to options object
  const options: EmailOptions = typeof toOrOptions === 'string'
    ? { to: toOrOptions, subject: subject!, html: htmlOrText!, text: htmlOrText }
    : toOrOptions;

  const transporter = getEmailTransporter();
  
  if (!transporter) {
    // Fallback: Log to console
    console.log('\n=== EMAIL NOTIFICATION ===');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Body:', options.text || options.html);
    console.log('=========================\n');
    return { success: true, method: 'console' };
  }

  try {
    // Read emailFrom from environment variables at runtime
    const fromEmail = process.env.EMAIL_FROM || 'noreply@easemycargo.com';
    
    console.log('[EMAIL] Attempting to send email to:', options.to);
    
    await transporter.sendMail({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    
    console.log('[EMAIL] ✅ Successfully sent to:', options.to);
    return { success: true, method: 'smtp' };
  } catch (error: any) {
    console.error('[EMAIL] ❌ Error sending email:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    throw error;
  }
}

// Email Templates
export const emailTemplates = {
  organizationPendingApproval: (data: {
    organizationName: string;
    registrantName: string;
    registrantEmail: string;
    platformName: string;
    reviewUrl: string;
  }) => ({
    subject: `New Organization Pending Approval: ${data.organizationName}`,
    html: `
      <h2>New Organization Registration</h2>
      <p>A new organization has been registered and requires your approval:</p>
      <ul>
        <li><strong>Organization:</strong> ${data.organizationName}</li>
        <li><strong>Platform:</strong> ${data.platformName}</li>
        <li><strong>Registered by:</strong> ${data.registrantName} (${data.registrantEmail})</li>
      </ul>
      <p><a href="${data.reviewUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Review Organization</a></p>
      <p>Please log in to your platform admin dashboard to approve or reject this organization.</p>
    `,
    text: `New Organization Registration\n\nOrganization: ${data.organizationName}\nPlatform: ${data.platformName}\nRegistered by: ${data.registrantName} (${data.registrantEmail})\n\nPlease review: ${data.reviewUrl}`
  }),

  organizationRegistered: (data: {
    organizationName: string;
    registrantName: string;
    platformName: string;
  }) => ({
    subject: `Organization Registration Received: ${data.organizationName}`,
    html: `
      <h2>Thank You for Registering!</h2>
      <p>Dear ${data.registrantName},</p>
      <p>Your organization registration has been received:</p>
      <ul>
        <li><strong>Organization:</strong> ${data.organizationName}</li>
        <li><strong>Platform:</strong> ${data.platformName}</li>
      </ul>
      <p><strong>Status:</strong> Pending Approval</p>
      <p>Your organization is currently under review by the platform administrator. You will receive an email notification once your organization has been approved.</p>
      <p>Thank you for your patience!</p>
    `,
    text: `Thank You for Registering!\n\nYour organization registration has been received:\n\nOrganization: ${data.organizationName}\nPlatform: ${data.platformName}\nStatus: Pending Approval\n\nYou will receive an email once approved.`
  }),

  organizationApproved: (data: {
    organizationName: string;
    registrantName: string;
    loginUrl: string;
  }) => ({
    subject: `Organization Approved: ${data.organizationName}`,
    html: `
      <h2>Congratulations! Your Organization Has Been Approved</h2>
      <p>Dear ${data.registrantName},</p>
      <p>Great news! Your organization <strong>${data.organizationName}</strong> has been approved.</p>
      <p>You can now log in and start managing your organization:</p>
      <p><a href="${data.loginUrl}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Login to Dashboard</a></p>
      <p>As an organization administrator, you can:</p>
      <ul>
        <li>Invite and manage users</li>
        <li>Configure organization settings</li>
        <li>Access all platform features</li>
      </ul>
      <p>Welcome aboard!</p>
    `,
    text: `Congratulations! Your Organization Has Been Approved\n\nYour organization ${data.organizationName} has been approved.\n\nLogin: ${data.loginUrl}\n\nYou can now manage your organization and invite users.`
  }),

  organizationRejected: (data: {
    organizationName: string;
    registrantName: string;
    reason: string;
  }) => ({
    subject: `Organization Registration Update: ${data.organizationName}`,
    html: `
      <h2>Organization Registration Status</h2>
      <p>Dear ${data.registrantName},</p>
      <p>Thank you for your interest in registering <strong>${data.organizationName}</strong>.</p>
      <p>Unfortunately, your organization registration could not be approved at this time.</p>
      <p><strong>Reason:</strong></p>
      <p style="background-color: #fee; padding: 15px; border-left: 4px solid #f00;">${data.reason}</p>
      <p>If you believe this is an error or would like to discuss this further, please contact support.</p>
    `,
    text: `Organization Registration Status\n\nYour organization ${data.organizationName} registration could not be approved.\n\nReason: ${data.reason}\n\nPlease contact support if you have questions.`
  })
};
