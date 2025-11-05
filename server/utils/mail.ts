// server/utils/mail.ts
import nodemailer from 'nodemailer';

const config = useRuntimeConfig();

const transporter = nodemailer.createTransport({
  host: config.emailHost,
  port: Number(config.emailPort),
  secure: false, // true for 465, false for other ports
  auth: {
    user: config.emailUser,
    pass: config.emailPass,
  },
  debug: true, // Enable detailed debugging
  logger: true, // Log SMTP communication
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    // Check if email configuration is available
    if (!config.emailHost || !config.emailUser || !config.emailPass) {
      console.log(`[DEV MODE] Email would be sent to: ${to}`);
      console.log(`[DEV MODE] Subject: ${subject}`);
      console.log('Email configuration not complete. Skipping email send in development.');
      return;
    }

    console.log(`Attempting to send email to ${to} with subject: ${subject}`);
console.log('before sendMail');
    await transporter.sendMail({
      from: `"EaseMyCargo App" <${config.emailUser}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      html, // html body
    });
    console.log(`Email successfully sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('SMTP Debug Info:', (error as any)?.response); // Log detailed SMTP response
    // Don't throw error to prevent registration failure due to email issues
    console.warn('Email sending failed, but continuing with registration process');
  }
};
