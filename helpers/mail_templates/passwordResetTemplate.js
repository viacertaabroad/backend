export default function passwordReset(data) {
  return {
    subject: `🔑 Reset Your Password - ViaCertaAbroad`,
    html: `
              <h2 style="color: #007BFF;">Password Reset Request</h2>
              <p>Dear <strong>${data.name}</strong>,</p>
              <p>We received a request to reset your password for your <strong>ViaCertaAbroad</strong> account.</p>
              <p>Please use the OTP below to proceed with resetting your password:</p>
              <h3 style="color: #28a745; font-size: 24px; letter-spacing: 2px;">${data.otp}</h3>
              <p><strong>Note:</strong> This OTP is valid for <strong>5 minutes</strong>. If it expires, you will need to request a new one.</p>
              <p>If you did not request a password reset, please ignore this email.</p>
              <p>For security reasons, never share your OTP with anyone.</p>
              <p style="margin-top: 20px; font-size: 12px; color: #666;">This is an automated email from ViaCertaAbroad. Please do not reply.</p>
          `,
  };
}
