import express from "express";
import {
  addAdminMessage,
  addUserMessage,
  archiveMyTicket,
  createTicket,
  getmyTicket,
  getTickets,
  updateTicket,
} from "../controller/TicketController.js";
import { isAuthenticatedUser, authorizedRole } from "../middleware/auth.js";
 

const router = express.Router();

// Public route (no login needed)
// router.post("/create-guest", createTicket);

router.post("/create", isAuthenticatedUser, createTicket);
router.get("/myticket", isAuthenticatedUser, getmyTicket);
router.put("/addMessage/:id", isAuthenticatedUser, addUserMessage);
router.put("/archive/:id", isAuthenticatedUser, archiveMyTicket);

// Admin routes
router.get(
  "/admin-all",
  isAuthenticatedUser,
  authorizedRole(["admin"]),
  getTickets
);

router.put(
  "/admin-update/ticket-status/:id",
  isAuthenticatedUser,
  authorizedRole(["admin"]),
  updateTicket
);
router.put(
  "/admin-update/ticket-message/:id",
  isAuthenticatedUser,
  authorizedRole(["admin"]),
  addAdminMessage
);

export default router;
