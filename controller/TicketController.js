import Ticket from "../models/ticket.js";
import User from "../models/users.js";
import { sendEmail } from "../utils/sendMail.js";
import { sendTicketNotification } from "../utils/sseNotification.js";

// Creating Ticket (works for both logged-in and guest users)
export const createTicket = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    const ticketData = {
      title,
      description,
      category,
    };

    // Handle user/guest differentiation
    if (req.user) {
      // Logged-in user
      ticketData.user = req.user._id;
    } else {
      const { name, email, phone } = req.body;
      if (!email) {
        return res.status(400).json({
          error: "Email is required for guest tickets",
          user: req.user,
        });
      }
      ticketData.guestUser = { name, email, phone };
    }

    const ticket = new Ticket(ticketData);
    await ticket.save();

    // Uncomment these when ready
    // await sendEmail(
    //   req.user ? req.user.email : email,
    //   `New Support Ticket #${ticket._id}`,
    //   `Your ticket "${title}" has been received.`
    // );

    // await sendTicketNotification(ticket);

    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({
      error: "Ticket creation failed",
      details: error.message,
    });
  }
};

export const getmyTicket = async (req, res) => {
  try {
    const userId = req.user._id;

    const tickets = await Ticket.find({
      $or: [
        { user: userId },
        { "guestUser.email": req.user.email }, // If guests later register
      ],
    })
      .sort({ createdAt: -1 }) // Newest first
      .populate({ path: "user", model: "users", select: "name email -_id" }); // Only if user exists

    if (!tickets.length) {
      return res.status(404).json({
        message: "No tickets found for your account",
      });
    }

    res.json({ total: tickets.length, tickets });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch tickets",
      details: error.message,
    });
  }
};

export const addUserMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message content is required" });
    }

    // Only allow logged-in users
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Authorization check - only ticket owner can add messages
    if (!ticket.user || !ticket.user.equals(req.user._id)) {
      return res.status(403).json({ error: "Unauthorized access to ticket" });
    }

    // Prevent adding messages to closed tickets
    if (ticket.status === "closed") {
      return res.status(400).json({
        error:
          "This ticket is closed. Please create a new ticket for further assistance.",
      });
    }

    // Add the message
    ticket.messages.push({
      text: message,
      sender: "user",
      createdAt: new Date(),
    });

    // Change status from resolved to in-progress if needed
    if (ticket.status === "resolved") {
      ticket.status = "in-progress";
    }

    ticket.updatedAt = new Date();
    await ticket.save();

    // // Notifications
    // if (process.env.NODE_ENV === "production") {
    //   try {
    //     // Notify admin
    //     await sendTicketNotification(ticket);

    //     // Send email confirmation to user
    //     await sendEmail(
    //       req.user.email,
    //       `Message added to Ticket #${ticket._id}`,
    //       `Your message has been added to ticket "${ticket.title}".\n\nMessage: ${message}`
    //     );

    //     // Notify admin via email
    //     await sendEmail(
    //       process.env.ADMIN_EMAIL,
    //       `New reply on Ticket #${ticket._id}`,
    //       `User replied: "${message}"\n\nTicket status: ${ticket.status}`
    //     );
    //   } catch (emailError) {
    //     console.error("Notification email failed:", emailError);
    //   }
    // }

    res.json({
      success: true,
      message: "Message added successfully",
      ticket,
    });
  } catch (error) {
    console.error("Error adding message:", error);
    res.status(500).json({
      error: "Failed to add message",
      details: error.message,
    });
  }
};

// ///////////////
// Get All Tickets (Admin Only)
export const getTickets = async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  if (status) {
    filter.status = status.toLowerCase();
  }
  const tickets = await Ticket.find(filter).populate({
    path: "user",
    model: "users",
    select: "name email -_id",
  });
  // .populate({
  //   path: "assignedTo",
  //   model: "users",
  //   select: "name email -_id",
  // });

  res.json({
    success: true,
    total: tickets.length,
    tickets,
  });
};

// Update Ticket Status
export const updateTicket = async (req, res) => {
  const { id } = req.params;
  const { status, message } = req.body;

  const ticket = await Ticket.findById(id);
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });

  // Status change logic
  if (status) {
    ticket.status = status;
    if (status === "closed") ticket.closedAt = new Date();
  }

  // Add admin reply
  if (message) {
    ticket.messages.push({
      text: message,
      sender: "admin",
    });

    // Email notification to user
    // const userEmail = ticket.user?.email || ticket.guestUser.email;
    // await sendEmail(
    //   userEmail,
    //   `Update on Ticket #${ticket._id}`,
    //   `Admin replied: "${message}"`
    // );
  }

  ticket.updatedAt = new Date();
  await ticket.save();

  // Real-time update
  // addClient.emit("ticketUpdated", ticket);

  res.json(ticket);
};

// Archive Old Tickets (Cron Job)
export const archiveTickets = async () => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  await Ticket.updateMany(
    { status: "Closed", closedAt: { $lte: oneMonthAgo } },
    { status: "Archived" }
  );
};
