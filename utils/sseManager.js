// Store connected clients: Map<clientId, { id, role, res }>
const clients = new Map();
/**
 * Add a new SSE client connection
 * @param {Object} res - Express Response object
 * @param {string} id - Unique client ID (user ID, session ID, etc.)
 * @param {string} role - 'admin' or 'client'
 */
export const addClient = (res, id, role = "user") => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Close old connection if already connected
  if (clients.has(id)) {
    console.log(`⚠️ User ${id} reconnected. Closing previous connection.`);
    clients.get(id).res.end(); // Close old response
  }

  clients.set(id, { id, role, res });
  console.log(`✅ New SSE Client Connected:`, {
    total: clients.size,
    id,
    role,
  });

  res.write(
    `data: ${JSON.stringify({
      type: "CONNECTED",
      message: "🔔 SSE Connected Sussessfully",
    })}\n\n`
  );

  res.on("close", () => {
    clients.delete(id);
  });
};

/**
 * Send an SSE event to specific clients or roles
 * @param {Object} payload - Data object to send
 * @param {Array<string>} roles - Optional list of roles to target
 * @param {Array<string>} ids - Optional list of specific client IDs
 */
const sendToClients = (payload, roles = [], ids = []) => {
  clients.forEach(({ id, role, res }) => {
    if (roles.length && !roles.includes(role)) return;
    if (ids.length && !ids.includes(id)) return;

    try {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch (err) {
      console.error(`Error sending SSE to ${id}`, err);
      clients.delete(id);
    }
  });
};

// Notification Types

export const sendNewRoomNotification = () => {
  sendToClients(
    {
      type: "ROOM_CREATED",
      message: "New Support Room created.",
      clickableMessage: "Join Room",
      redirectUrl: "/support",
    },
    [] //add : "admin"
  );
};

export const sendTicketNotification = (ticket) => {
  sendToClients(
    {
      type: "NEW_TICKET",
      message: `New ${ticket.category} ticket created`,
      clickableMessage: "View Ticket",
      redirectUrl: `/admin/tickets/${ticket._id}`,
      data: ticket,
    },
    ["admin"]
  );
};

export const notifyMessageToAdmin = (ticket, userMessage) => {
  sendToClients(
    {
      type: "NEW_USER_MESSAGE",
      message: "New message received from user.",
      clickableMessage: "View Ticket",
      redirectUrl: `/admin/tickets/${ticket._id}`,
      ticketData: ticket,
      userMessage: userMessage,
    },
    ["admin"],
    []
  );
};

export const notifyMessageToUser = (ticket, adminMessage) => {
  sendToClients(
    {
      type: "NEW_ADMIN_MESSAGE",
      message: "New message received from support.",
      clickableMessage: "View Ticket",
      redirectUrl: `/user/tickets/${ticket._id}`,
      ticketData: ticket,
      adminMessage: adminMessage,
    },
    [],
    [ticket.user.toString()] //"67f0d4b07de4e60e9cf9bc3a"
  );
};

export const sendTicketUpdateToUser = (ticket) => {
  sendToClients(
    {
      type: "TICKET_STATUS_UPDATE",
      message: `Ticket #${ticket._id} updated to ${ticket.status}`,
      clickableMessage: "Check Update",
      redirectUrl: `/user/tickets/${ticket._id}`,
      ticketData: ticket,
    },
    [],
    [ticket.user.toString()]
  );
};

export const logAllSSeClients = () => {
  console.log("🔍 Active SSE Clients:");
  clients.forEach((value, key) => {
    console.log(`  - ID: ${key}, Role: ${value.role}`);
  });
};
