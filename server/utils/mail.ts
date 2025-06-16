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
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    await transporter.sendMail({
      from: `"EaseMyCargo App" <${config.emailUser}>`, // sender address
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
