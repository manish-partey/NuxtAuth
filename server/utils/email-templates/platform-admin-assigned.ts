// server/utils/email-templates/platform-admin-assigned.ts
export function getPlatformAdminAssignedEmailTemplate(data: {
  userName: string;
  platformName: string;
  resetLink: string;
}) {
  return {
    subject: `🎉 You've Been Assigned as Platform Admin - ${data.platformName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      padding: 30px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      background-color: #f8f9fa;
      padding: 30px;
      border-radius: 0 0 8px 8px;
    }
    .button {
      display: inline-block;
      background-color: #22c55e;
      color: white;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: bold;
    }
    .info-box {
      background-color: #e0f2fe;
      padding: 20px;
      border-radius: 6px;
      margin: 20px 0;
      border-left: 4px solid #3b82f6;
    }
    .responsibilities {
      background-color: white;
      padding: 20px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .responsibilities ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .responsibilities li {
      margin: 8px 0;
    }
    .warning {
      background-color: #fef3c7;
      padding: 15px;
      border-radius: 6px;
      margin: 15px 0;
      border-left: 4px solid #f59e0b;
    }
    .footer {
      text-align: center;
      color: #666;
      font-size: 12px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 New Role Assignment</h1>
    <p style="margin: 10px 0 0 0; font-size: 16px;">You're now a Platform Administrator!</p>
  </div>
  
  <div class="content">
    <p>Hello <strong>${data.userName}</strong>,</p>
    
    <p>Great news! You have been assigned as a <strong>Platform Administrator</strong> for:</p>
    
    <div class="info-box">
      <h3 style="margin-top: 0; color: #1e40af;">🏢 ${data.platformName}</h3>
      <p style="margin-bottom: 0;">As a Platform Admin, you now have elevated privileges to manage this platform.</p>
    </div>
    
    <p><strong>First Step:</strong> Set up your password to access your new role:</p>
    
    <p style="text-align: center;">
      <a href="${data.resetLink}" class="button">Set Your Password</a>
    </p>
    
    <div class="responsibilities">
      <h3 style="margin-top: 0; color: #1f2937;">👔 Your Responsibilities:</h3>
      <ul>
        <li><strong>Manage Organizations:</strong> Review and approve organization registrations</li>
        <li><strong>User Management:</strong> Oversee users across all organizations in your platform</li>
        <li><strong>Configuration:</strong> Set up organization types and platform settings</li>
        <li><strong>Document Verification:</strong> Review and approve organization documents</li>
        <li><strong>Support:</strong> Assist organizations with onboarding and issues</li>
      </ul>
    </div>
    
    <div class="warning">
      <p><strong>⚠️ Important Security Information:</strong></p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>This password reset link will expire in <strong>24 hours</strong></li>
        <li>Never share your admin credentials with anyone</li>
        <li>Use a strong, unique password for your account</li>
        <li>Enable two-factor authentication if available</li>
      </ul>
    </div>
    
    <h3 style="color: #1f2937;">🚀 What's Next?</h3>
    <ol>
      <li>Click the "Set Your Password" button above</li>
      <li>Create a strong password for your account</li>
      <li>Log in to your platform admin dashboard</li>
      <li>Explore your new capabilities and settings</li>
      <li>Review any pending organization approvals</li>
    </ol>
    
    <p>If you have any questions or need assistance getting started, please contact your system administrator.</p>
    
    <p>Welcome to the team!</p>
    
    <p style="margin-top: 30px;">Best regards,<br>
    <strong>The Platform Team</strong></p>
  </div>
  
  <div class="footer">
    <p>This is an automated system notification. Please do not reply to this email.</p>
    <p>If you did not expect this role assignment, please contact your administrator immediately.</p>
  </div>
</body>
</html>
    `,
    text: `
Hello ${data.userName},

You have been assigned as a Platform Administrator for ${data.platformName}!

Set your password here: ${data.resetLink}

Your Responsibilities:
- Manage Organizations: Review and approve organization registrations
- User Management: Oversee users across all organizations
- Configuration: Set up organization types and platform settings
- Document Verification: Review and approve organization documents
- Support: Assist organizations with onboarding

Important: This password reset link expires in 24 hours.

What's Next:
1. Set your password using the link above
2. Log in to your platform admin dashboard
3. Explore your new capabilities
4. Review any pending approvals

Welcome to the team!

Best regards,
The Platform Team
    `
  };
}
