let clients = [];

export const addClient = (res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); // important for some setups!

  clients.push(res);

  res.write("data: Connected\n\n");

  res.on("close", () => {
    clients = clients.filter((client) => client !== res);
  });
};

export const sendNewRoomNotification = (room) => {
  clients.forEach((client) => {
    client.write(
      `data: ${JSON.stringify({
        type: "ROOM_CREATED",
        message: "New Support Room created.",
        clickableMessage: "Join Room",
        redirectUrl: `/support`,
      })}\n\n`
    );
  });
};

/////////////////////////////////
// New ticket notifications
export const sendTicketNotification = (ticket) => {
  clients.forEach((client) => {
    client.write(
      `data: ${JSON.stringify({
        type: "NEW_TICKET",
        message: `New ${ticket.category} ticket created`,
        clickableMessage: "View Ticket",
        redirectUrl: `/admin/tickets/${ticket._id}`,
        data: ticket,
      })}\n\n`
    );
  });
};

// notify to admin when user send a new message
export const notifyMessageToAdmin = (ticket, userMessage) => {
  clients.forEach((client) => {
    client.write(
      `data: ${JSON.stringify({
        type: "NEW_USER_MESSAGE",
        message: `New Message Received from User.`,
        clickableMessage: "View Ticket",
        redirectUrl: `/admin/tickets/${ticket._id}`,
        ticketData: ticket,
        userMessage: userMessage,
      })}\n\n`
    );
  });
};

export const notifyMessageToUser = (ticket, adminMessage) => {
  clients.forEach((client) => {
    client.write(
      `data: ${JSON.stringify({
        type: "NEW_ADMIN_MESSAGE",
        message: `New Message Received from Support Side.`,
        clickableMessage: "View Ticket",
        redirectUrl: `/admin/tickets/${ticket._id}`,
        ticketData: ticket,
        adminMessage: adminMessage,
      })}\n\n`
    );
  });
};
export const sendTicketUpdateToUser = (ticket, userMessage) => {
  clients.forEach((client) => {
    client.write(
      `data: ${JSON.stringify({
        type: "TICKET_STATUS_UPDATE",
        message: `Ticket #${ticket._id} updated to ${ticket.status}`,
        clickableMessage: "Check Update",
        redirectUrl: `/admin/tickets/${ticket._id}`,
        ticketData: ticket,
      })}\n\n`
    );
  });
};
