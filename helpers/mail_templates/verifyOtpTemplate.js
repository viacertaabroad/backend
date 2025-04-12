export default function verifyOtp(data) {
  return {
    subject: `🔐 Verify Your OTP - ViaCertaAbroad`,
    html: `
                  <h2 style="color: #007BFF;">OTP Verification</h2>
                  <p>Dear <strong>${data.userName}</strong>,</p>
                  <p>Thank you for registering with <strong>ViaCertaAbroad</strong>. To complete your sign-up, please use the OTP below:</p>
                  <h3 style="color: #28a745; font-size: 24px; letter-spacing: 2px;">${data.otp}</h3>
                  <p><strong>Note:</strong> This OTP is valid for <strong>5 minutes</strong>. If it expires, you will need to request a new one.</p>
                  <p>If you did not request this OTP, please ignore this email.</p>
                  <p>For assistance, contact our support team.</p>
                  <p style="margin-top: 20px; font-size: 12px; color: #666;">This is an automated email from ViaCertaAbroad. Please do not reply.</p>
              `,
  };
}
