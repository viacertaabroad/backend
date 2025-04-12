export default function mbbsUser(data) {
  return {
    subject: `📩 New MBBS Form Submission - ${data.name} | ViaCertaAbroad`,
    html: `
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
        `,
  };
}
