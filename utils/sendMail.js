import nodemailer from "nodemailer";

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

    // --------------------------------------------------------------------------------
    let customSubject = "";
    let htmlContent = "";

    switch (emailType) {
      case "mbbs_Users":
        customSubject = `📩 New MBBS Form Submission - ${data.name} | ViaCertaAbroad`;
        htmlContent = `
            <h2 style="color: #007BFF;">New Submission Received</h2>
            <p><strong>${data.name}</strong> has just submitted the MBBS form on <strong>ViaCertaAbroad</strong>. Here are the details:</p>
            <ul>
                <li><strong>Name:</strong> ${data.name}</li>
                <li><strong>Mobile:</strong> ${data.mobile}</li>
                <li><strong>Email:</strong> ${data.email}</li>
                <li><strong>Qualification:</strong> ${data.qualification}</li>
                <li><strong>Selected Country:</strong> ${data.selectedCountry}</li>
            </ul>
            <p>Click the button below to download the latest MBBS data:</p>
            <a href="https://viacertaabroad.com/api/campaign/mbbs/export" 
               style="display: inline-block; padding: 10px 15px; background: #28a745; color: white; text-decoration: none; border-radius: 5px;">
               📥 Download Excel Data
            </a>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">This is an automated notification from ViaCertaAbroad.</p>
        `;
        break;
      case "verifyOtp":
        customSubject = `🔐 Verify Your OTP - ViaCertaAbroad`;
        htmlContent = `
              <h2 style="color: #007BFF;">OTP Verification</h2>
              <p>Dear <strong>${data.userName}</strong>,</p>
              <p>Thank you for registering with <strong>ViaCertaAbroad</strong>. To complete your sign-up, please use the OTP below:</p>
              <h3 style="color: #28a745; font-size: 24px; letter-spacing: 2px;">${data.otp}</h3>
              <p><strong>Note:</strong> This OTP is valid for <strong>5 minutes</strong>. If it expires, you will need to request a new one.</p>
              <p>If you did not request this OTP, please ignore this email.</p>
              <p>For assistance, contact our support team.</p>
              <p style="margin-top: 20px; font-size: 12px; color: #666;">This is an automated email from ViaCertaAbroad. Please do not reply.</p>
          `;
        break;
      case "password_Reset_Otp":
        customSubject = `🔑 Reset Your Password - ViaCertaAbroad`;
        htmlContent = `
              <h2 style="color: #007BFF;">Password Reset Request</h2>
              <p>Dear <strong>${data.name}</strong>,</p>
              <p>We received a request to reset your password for your <strong>ViaCertaAbroad</strong> account.</p>
              <p>Please use the OTP below to proceed with resetting your password:</p>
              <h3 style="color: #28a745; font-size: 24px; letter-spacing: 2px;">${data.otp}</h3>
              <p><strong>Note:</strong> This OTP is valid for <strong>5 minutes</strong>. If it expires, you will need to request a new one.</p>
              <p>If you did not request a password reset, please ignore this email.</p>
              <p>For security reasons, never share your OTP with anyone.</p>
              <p style="margin-top: 20px; font-size: 12px; color: #666;">This is an automated email from ViaCertaAbroad. Please do not reply.</p>
          `;
        break;
      case "counselingForm":
        customSubject = `🚀 New Counseling Enquiry Received - ViaCertaAbroad`;
        htmlContent = `
            <h2 style="color: #007BFF;">New Counseling Enquiry!</h2>
            <p>Hello Team,</p>
            <p>A new counseling enquiry has been submitted via the ViaCertaAbroad website. Here are the details:</p>
        
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Name:</strong> ${data.name}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Mobile:</strong> ${data.mobile}</p>
              <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
            </div>
        
            <p><strong>Action Required:</strong></p>
            <ul>
              <li>Please follow up with <strong>${
                data.name
              }</strong> at the earliest.</li>
              <li>Contact them via email (<a href="mailto:${data.email}">${
          data.email
        }</a>) or phone (<strong>${data.mobile}</strong>).</li>
              <li>Ensure to schedule a counseling session and provide the necessary guidance.</li>
            </ul>
        
            <p>Let's make sure we provide them with the best support for their study abroad journey!</p>
        
            <p style="margin-top: 20px; font-size: 12px; color: #666;">This is an automated notification from ViaCertaAbroad. Please do not reply to this email.</p>
          `;
        break;
      case "newTicket":
        customSubject = `🎫 New Support Ticket Created - ViaCertaAbroad (Ticket id: #${data.ticket._id})`;
        htmlContent = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #007BFF; border-bottom: 2px solid #007BFF; padding-bottom: 10px;">New Support Ticket Created</h2>
                  
                  <p>Hello Team,</p>
                  <p>A new support ticket has been created by <strong>${
                    data.userName
                  }</strong>. Here are the details:</p>
                  
                  <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                      <h3 style="margin-top: 0; color: #343a40;">Ticket id: #${
                        data.ticket._id
                      }</h3>
                      <p><strong>Created By:</strong> ${
                        data.userName
                      } (<a href="mailto:${data.userEmail}">${
          data.userEmail
        }</a>)</p>
         ${
           data.userMobile
             ? `<p><strong>Mobile:</strong> ${data.userMobile}</p>`
             : ""
         }
        
                      <p><strong>Title:</strong> ${data.ticket.title}</p>
                      <p><strong>Category:</strong> ${data.ticket.category}</p>
                      <p><strong>Status:</strong> <span style="color: ${
                        data.ticket.status === "open" ? "#28a745" : "#dc3545"
                      }">${data.ticket.status}</span></p>
                      <p><strong>Priority:</strong> <span style="color: ${
                        data.ticket.priority === "high" ||
                        data.ticket.priority === "urgent"
                          ? "#dc3545"
                          : "#ffc107"
                      }">${data.ticket.priority}</span></p>
                      <p><strong>Created At:</strong> ${new Date(
                        data.ticket.createdAt
                      ).toLocaleString()}</p>
                  </div>
                  
                  <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
                      <h4 style="margin-top: 0;">Description:</h4>
                      <p>${data.ticket.description}</p>
                  </div>
                  
                  <p><strong>Action Required:</strong></p>
                  <ul>
                      <li>Please address this ticket within 24 hours</li>
                      <li>Contact ${data.userName} via email (<a href="mailto:${
          data.userEmail
        }">${data.userEmail}</a>) if more information is needed</li>
                      <li>Update the ticket status as you progress</li>
                  </ul>
                  
                  <p style="text-align: center; margin-top: 30px;">
                      <a href="${process.env.ADMIN_PORTAL_URL}/tickets/${
          data.ticket._id
        }" 
                         style="background-color: #007BFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                          View Ticket in Admin Portal
                      </a>
                  </p>
                  
                  <p style="margin-top: 30px; font-size: 12px; color: #666;">
                      This is an automated notification from ViaCertaAbroad Support System. Please do not reply to this email.
                  </p>
              </div>
          `;
        break;
      default:
        throw new Error(`Unknown emailType: ${emailType}`);
    }

    // /-----------------------------------------------------
    const mailOptions = {
      from: process.env.MAIL_USER_ID,
      to: to,
      subject: customSubject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    console.log(`✅ ${emailType} mail sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending email: ${emailType}`, error.message, error);
    return false;
  }
}
