export default function mbbsUser(data) {
  return {
    subject: `📩 New MBBS Form Submission - ${data.name} | ViaCertaAbroad`,
    html: 
    `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style type="text/css">
        /* CLIENT-SPECIFIC RESET */
        body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
        table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
        img { -ms-interpolation-mode:bicubic; }
    
        /* RESET STYLES */
        img { border:0; height:auto; line-height:100%; outline:none; text-decoration:none; }
        table { border-collapse: collapse !important; }
        body { margin:0; padding:0; width:100% !important; }
    
        /* MOBILE STYLES */
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; }
          .mobile-padding { padding: 15px !important; }
          .mobile-center { text-align: center !important; }
          h2 { font-size: 24px !important; }
          h3 { font-size: 20px !important; }
          .btn { width: 100% !important; box-sizing: border-box; }
        }
      </style>
    </head>
    <body style="background: #f9f9fb; margin: 0; padding: 20px;">
      <center>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center">
              <!--[if (gte mso 9)|(IE)]>
              <table width="650" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td>
              <![endif]-->
              <table role="presentation" class="container" width="650" cellpadding="0" cellspacing="0" border="0"
                     style="max-width:650px; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 5px 15px rgba(0,0,0,0.05);">
                <!-- HEADER -->
                <tr>
                  <td class="mobile-padding"
                      style="background:linear-gradient(90deg,#007BFF,#00c6ff); color:#fff; padding:20px 30px; font-family:'Segoe UI',sans-serif;">
                    <h2 style="margin:0;">🚀 New MBBS Form Submission</h2>
                    <p style="margin:5px 0 0;">Submitted by <strong>${
                      data.name
                    }</strong> on ViaCertaAbroad</p>
                  </td>
                </tr>
                <!-- BODY -->
                <tr>
                  <td class="mobile-padding"
                      style="padding:25px 30px; font-family:'Segoe UI',sans-serif; color:#333;">
                    <h3 style="margin-top:0;">📝 Submission Details</h3>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                           style="font-size:15px;">
                      <tbody>
                        <tr>
                          <td style="padding:8px; vertical-align:top;"><strong>📛 Name:</strong></td>
                          <td style="padding:8px; vertical-align:top;">${
                            data.name
                          }</td>
                        </tr>
                        <tr>
                          <td style="padding:8px; vertical-align:top;"><strong>📞 Mobile:</strong></td>
                          <td style="padding:8px; vertical-align:top;">${
                            data.mobile
                          }</td>
                        </tr>
                        <tr>
                          <td style="padding:8px; vertical-align:top;"><strong>💬 WhatsApp Same:</strong></td>
                          <td style="padding:8px; vertical-align:top;">${
                            data.isWhatsappSameAsMobile ? "Yes" : "No"
                          }</td>
                        </tr>
                        ${
                          !data.isWhatsappSameAsMobile
                            ? `
                        <tr>
                          <td style="padding:8px; vertical-align:top;"><strong>📲 WhatsApp Number:</strong></td>
                          <td style="padding:8px; vertical-align:top;">${data.whatsappNumber}</td>
                        </tr>`
                            : ""
                        }
                        <tr>
                          <td style="padding:8px; vertical-align:top;"><strong>📧 Email:</strong></td>
                          <td style="padding:8px; vertical-align:top;">${
                            data.email
                          }</td>
                        </tr>
                        <tr>
                          <td style="padding:8px; vertical-align:top;"><strong>⚧️ Gender:</strong></td>
                          <td style="padding:8px; vertical-align:top;">${
                            data.gender
                          }</td>
                        </tr>
                        <tr>
                          <td style="padding:8px; vertical-align:top;"><strong>🏙️ City:</strong></td>
                          <td style="padding:8px; vertical-align:top;">${
                            data.city
                          }</td>
                        </tr>
                        <tr>
                          <td style="padding:8px; vertical-align:top;"><strong>🌍 State:</strong></td>
                          <td style="padding:8px; vertical-align:top;">${
                            data.state
                          }</td>
                        </tr>
                        <tr>
                          <td style="padding:8px; vertical-align:top;"><strong>📮 Pincode:</strong></td>
                          <td style="padding:8px; vertical-align:top;">${
                            data.pincode
                          }</td>
                        </tr>
                        <tr>
                          <td style="padding:8px; vertical-align:top;"><strong>🎓 Qualification:</strong></td>
                          <td style="padding:8px; vertical-align:top;">${
                            data.qualification
                          }</td>
                        </tr>
                        <tr>
                          <td style="padding:8px; vertical-align:top;"><strong>📊 12th %:</strong></td>
                          <td style="padding:8px; vertical-align:top;">${
                            data.percentage12
                          }</td>
                        </tr>
                        <tr>
                          <td style="padding:8px; vertical-align:top;"><strong>🏫 Board:</strong></td>
                          <td style="padding:8px; vertical-align:top;">${
                            data.board
                          }</td>
                        </tr>
                        <tr>
                          <td style="padding:8px; vertical-align:top;"><strong>🧪 Appeared in NEET:</strong></td>
                          <td style="padding:8px; vertical-align:top;">${
                            data.hasAppearedNeet ? "Yes" : "No"
                          }</td>
                        </tr>
                        ${
                          data.hasAppearedNeet
                            ? `
                        <tr>
                          <td style="padding:8px; vertical-align:top;"><strong>📅 NEET Year(s):</strong></td>
                          <td style="padding:8px; vertical-align:top;">${data.neetAttemptYears?.join(
                            ", "
                          )}</td>
                        </tr>
                        <tr>
                          <td style="padding:8px; vertical-align:top;"><strong>🆔 Roll No.:</strong></td>
                          <td style="padding:8px; vertical-align:top;">${
                            data.neetRollNumber || "N/A"
                          }</td>
                        </tr>
                        <tr>
                          <td style="padding:8px; vertical-align:top;"><strong>📈 Expected Marks:</strong></td>
                          <td style="padding:8px; vertical-align:top;">${
                            data.expectedNeetMarks
                          }</td>
                        </tr>`
                            : ""
                        }
                        <tr>
                          <td style="padding:8px; vertical-align:top;"><strong>🌐 Country:</strong></td>
                          <td style="padding:8px; vertical-align:top;">${data.selectedCountry?.join(
                            ", "
                          )}</td>
                        </tr>
                        <tr>
                          <td style="padding:8px; vertical-align:top;"><strong>📅 Intake Year:</strong></td>
                          <td style="padding:8px; vertical-align:top;">${
                            data.preferredIntakeYear
                          }</td>
                        </tr>
                        <tr>
                          <td style="padding:8px; vertical-align:top;"><strong>🛂 Has Passport:</strong></td>
                          <td style="padding:8px; vertical-align:top;">${
                            data.hasPassport ? "Yes" : "No"
                          }</td>
                        </tr>
                        <tr>
                          <td style="padding:8px; vertical-align:top;"><strong>📝 Applied Before:</strong></td>
                          <td style="padding:8px; vertical-align:top;">${
                            data.hasAppliedBefore ? "Yes" : "No"
                          }</td>
                        </tr>
                        <tr>
                          <td style="padding:8px; vertical-align:top;"><strong>👨‍👩‍👧‍👦 Relative Abroad:</strong></td>
                          <td style="padding:8px; vertical-align:top;">${
                            data.siblingsAbroad ? "Yes" : "No"
                          }</td>
                        </tr>
                        <tr>
                          <td style="padding:8px; vertical-align:top;"><strong>🎯 Scholarship Interest:</strong></td>
                          <td style="padding:8px; vertical-align:top;">${
                            data.interestedInScholarships
                          }</td>
                        </tr>
                        ${
                          data.specificQuestions
                            ? `
                        <tr>
                          <td style="padding:8px; vertical-align:top;"><strong>❓ Questions:</strong></td>
                          <td style="padding:8px; vertical-align:top;">${data.specificQuestions}</td>
                        </tr>`
                            : ""
                        }
                      </tbody>
                    </table>
                    <div class="mobile-center" style="margin:30px 0; text-align:center;">
                      <a href="https://docs.google.com/spreadsheets/d/1joOj3OTOgIcAsFayG0wN_ghCCbK5UAIEeCTY7ewQPKM/edit?gid=2037323830"
                         class="btn"
                         style="display:inline-block; padding:12px 25px; background:#007BFF; color:#fff; text-decoration:none; border-radius:6px; font-weight:bold; box-shadow:0 4px 12px rgba(0,123,255,0.3);">
                        🪟 View Excel Data
                      </a>
                    </div>
                  </td>
                </tr>
                <!-- FOOTER -->
                <tr>
                  <td class="mobile-padding"
                      style="background:#f1f1f1; color:#666; font-size:13px; text-align:center; padding:15px; font-family:'Segoe UI',sans-serif;">
                    This is an automated email from <strong>ViaCertaAbroad</strong>. Please do not reply directly.
                  </td>
                </tr>
              </table>
              <!--[if (gte mso 9)|(IE)]>
              </td></tr></table>
              <![endif]-->
            </td>
          </tr>
        </table>
      </center>
    </body>
    </html>
    `,
  };
}
