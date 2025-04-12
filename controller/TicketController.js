import errorResponse from "../helpers/errorHandler.js";
import Ticket from "../models/ticket.js";
import User from "../models/users.js";
import { sendEmail } from "../utils/sendMail.js";
import {
  notifyMessageToAdmin,
  notifyMessageToUser,
  sendTicketNotification,
  sendTicketUpdateToUser,
} from "../utils/sseManager.js";

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
        return errorResponse(res, 400, "Email is required for guest tickets");
      }
      ticketData.guestUser = { name, email, phone };
    }

    const ticket = new Ticket(ticketData);
    await ticket.save();

    const data = {
      userName: req.user.name,
      userEmail: req.user.email,
      userMobile: req.user.mobile,
      ticket,
    };
    // console.log("data", data);

    // sendEmail("ashvarygidian1996@gmail.com", data, "newTicket");
    //  sendEmail("ashvarygidian1996@gmail.com", data, "newTicketUserSide");

 
    await sendTicketNotification(ticket);

    res.status(201).json(ticket);
  } catch (error) {
    
    return errorResponse(
      res,
      400,
      "Ticket creation failed",
      error,
      "Ticket Controller : create Ticket"
    );
  }
};

export const getmyTicket = async (req, res) => {
  try {
    const userId = req.user._id;
    const { archived = false } = req.query;

    const query = {
      $or: [{ user: userId }, { "guestUser.email": req.user.email }],
    };

     
    if (archived === "false" || archived === false) {
      query.status = { $ne: "archived" };
    }

    const tickets = await Ticket.find(query)
      .sort({ createdAt: -1 })
      .populate({ path: "user", model: "users", select: "name email -_id" });

    res.json({
      success: true,
      total: tickets.length,
      tickets,
      archived: archived === "true" || archived === true,
    });
  } catch (error) {
    
    return errorResponse(
      res,
      500,
      "Failed to fetch tickets",
      error,
      "Ticket Controller : getmyTicket"
    );
  }
};

export const addUserMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || message.trim() === "") {
      
      return errorResponse(res, 400, "Message content is required");
    }

    // Only allow logged-in users
    if (!req.user) {
      // return res.status(401).json({ error: "Authentication required" });
      return errorResponse(res, 401, "Authentication required");
    }

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      
      return errorResponse(res, 404, "Ticket not found");
    }

    //  only ticket owner can add messages
    if (!ticket.user || !ticket.user.equals(req.user._id)) {
      
      return errorResponse(res, 403, "Unauthorized access to ticket");
    }

    // Prevent adding messages to closed tickets
    if (ticket.status === "closed" || ticket.status === "archived") {
      
      return errorResponse(
        res,
        400,
        "This ticket is closed or archived. Please create a new ticket for further assistance."
      );
    }

    // Add the message
    ticket.messages.push({
      text: message,
      sender: "user",
      createdAt: new Date(),
    });

     
    if (ticket.status === "resolved") {
      ticket.status = "in-progress";
    }

    ticket.updatedAt = new Date();
    await ticket.save();

    notifyMessageToAdmin(ticket, message);

    const data = {
      ticketId: ticket._id,
      userName: req.user.name,
      ticketStatus: ticket.status,
      userMessage: message,
    };
    // await sendEmail(
    //   "ashvarygidian1996@gmail.com",
    //   data,
    //   "ticketNewMessageAdmin"
    // );

    //

    res.json({
      success: true,
      message: "Message added successfully",
      ticket,
    });
  } catch (error) {
    console.error("Error adding message:", error);
    
    return errorResponse(
      res,
      500,
      "Failed to add message",
      error,
      "ticket controller : add user message"
    );
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

//Admin message  
export const addAdminMessage = async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  const ticket = await Ticket.findById(id);
  if (!ticket) return errorResponse(res, 404, "Ticket not found");
 

  if (message) {
    ticket.messages.push({
      text: message,
      sender: "admin",
    });

    notifyMessageToUser(ticket, message);
  }

  ticket.updatedAt = new Date();

  await ticket.save();
 
  const data = { ticketId: ticket._id, message, ticketStatus: ticket.status };
  // await sendEmail(userEmail, data, "supportNewMessagetoUser");

  //

  res.json(ticket);
};

// Admin Update Ticket Status
export const updateTicket = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const ticket = await Ticket.findById(id);
  if (!ticket) return errorResponse(res, 404, "Ticket not found");

 
  if (status) {
    ticket.status = status;
    if (status === "closed") ticket.closedAt = new Date();
    sendTicketUpdateToUser(ticket);
  }

  ticket.updatedAt = new Date();

  await ticket.save();

  // const data = { ticketId: ticket._id, ticketStatus: ticket.status };
  // await sendEmail(userEmail, data, "supportNewMessagetoUser");

  res.json(ticket);
};

 
export const archiveMyTicket = async (req, res) => {
  try {
    const { id } = req.params;

 
    if (!req.user) {
      return errorResponse(res, 401, "Authentication required");
    }

    const ticket = await Ticket.findById(id);

    if (!ticket) {
  
      return errorResponse(res, 404, "Ticket not found");
    }

    //  only ticket owner can archive
    if (!ticket.user || !ticket.user.equals(req.user._id)) {
      return errorResponse(res, 403, "Unauthorized access to ticket");
    }

    // Only allow archiving of resolved or closed tickets
    if (ticket.status === "archived") {
      return errorResponse(res, 400, "Ticket alread Archived.");
    } else if (!["resolved", "closed"].includes(ticket.status)) {
      return errorResponse(
        res,
        400,
        "Only resolved or closed tickets can be archived"
      );
    }

    ticket.status = "archived";
    ticket.updatedAt = new Date();
    await ticket.save();

    res.json({
      success: true,
      message: "Ticket archived successfully",
      ticket,
    });
  } catch (error) {
    console.error("Error archiving ticket:", error);

    return errorResponse(
      res,
      500,
      "Failed to archive ticket",
      error,
      "ticket controlelr : archieve Ticket"
    );
  }
};

// Archive Old Tickets (Cron Job will be implementd to trigger this)
export const archiveTickets = async () => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  await Ticket.updateMany(
    { status: "closed", closedAt: { $lte: oneMonthAgo } },
    { status: "archived" }
  );
};
