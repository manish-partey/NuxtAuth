import { u as useRuntimeConfig } from './nitro.mjs';
import nodemailer from 'nodemailer';

const config = useRuntimeConfig();
const transporter = nodemailer.createTransport({
  host: config.emailHost,
  port: Number(config.emailPort),
  secure: false,
  // true for 465, false for other ports
  auth: {
    user: config.emailUser,
    pass: config.emailPass
  }
});
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Nuxt Auth App" <${config.emailUser}>`,
      // sender address
      to,
      // list of receivers
      subject,
      // Subject line
      html
      // html body
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export { sendEmail as s };
//# sourceMappingURL=mail.mjs.map
