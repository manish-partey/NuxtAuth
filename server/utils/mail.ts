// server/utils/mail.ts
import nodemailer from 'nodemailer';

const config = useRuntimeConfig();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Example for Gmail, use your SMTP server
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: config.emailUser,
    pass: config.emailPass,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    await transporter.sendMail({
      from: `"Auth App" <${config.emailUser}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      html, // html body
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};