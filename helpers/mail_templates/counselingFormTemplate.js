export default function counselingForm(data) {
  return {
    subject: `🚀 New Counseling Enquiry Received - ViaCertaAbroad`,
    html: `
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
          `,
    bcc: [
      "admin@viacertaabroad.com",
      "counselor@viacertaabroad.com",
      "notify@viacertaabroad.com",
    ],
  };
}
