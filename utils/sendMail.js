import nodemailer from "nodemailer";
import templates from "../helpers/mail_templates/index.js";

export async function sendEmail(to, data, emailType) {
  try {
    if (!process.env.MAIL_USER_ID || !process.env.MAIL_USER_PASS) {
      throw new Error(
        "E-mail credentials are missing in environment variables."
      );
    }

    // for testing mailtrap

    const transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.MAIL_USER_ID,
        pass: process.env.MAIL_USER_PASS,
      },
    });

    // use this below for live gmail
    // const transporter = nodemailer.createTransport({
    //   service: process.env.SERVICE,
    //   auth: {
    //     user: process.env.MAIL_USER_ID,
    //     pass: process.env.MAIL_USER_PASS,
    //   },
    // });

    // ////////// for hostinger
    // const transporter = nodemailer.createTransport({
    //   host: "smtp.hostinger.com", // Check from your email provider!
    //   port: 465, // Usually 465 (SSL) or 587 (TLS)
    //   secure: true, // True for port 465, false for 587
    //   auth: {
    //     user: process.env.MAIL_USER_ID,
    //     pass: process.env.MAIL_USER_PASS,
    //   },
    // });

    // /-----------------------------------------------------
    const templateFn = templates[emailType];
    if (!templateFn)
      throw new Error(`No email template found for type: ${emailType}`);
    const { subject, html } = templateFn(data);

    // --
    const mailOptions = {
      from: process.env.MAIL_USER_ID,
      to: to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);

    console.log(`✅ ${emailType} mail sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending email: ${emailType}`, error.message, error);
    return false;
  }
}
