// server/utils/emailTemplates/inviteUser.ts
export const generateInviteEmail = ({
  name,
  inviteLink,
  inviterName = 'Admin',
}: {
  name: string;
  inviteLink: string;
  inviterName?: string;
}) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f9fafb; border-radius: 8px; color: #333;">
      <h2 style="color: #1d4ed8;">Welcome to EaseMyCargo!</h2>
      <p>Hi ${name},</p>
      <p><strong>${inviterName}</strong> has invited you to join the <strong>EaseMyCargo</strong> platform.</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${inviteLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
          Accept Invitation
        </a>
      </p>
      <p style="font-size: 0.9em; color: #6b7280;">This invitation link will expire in 24 hours.</p>
      <p>Cheers,<br/>The EaseMyCargo Team</p>
    </div>
  `;
};
