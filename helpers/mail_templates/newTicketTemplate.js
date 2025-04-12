export default function newTicket(data) {
  return {
    subject: `🎫 New Support Ticket Created - ViaCertaAbroad (Ticket id: #${data.ticket._id})`,
    html: `
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
          `,
  };
}
