import express from "express";
import {
  addUserMessage,
  createTicket,
  getmyTicket,
  getTickets,
  updateTicket,
} from "../controller/TicketController.js";
import { isAuthenticatedUser, authorizedRole } from "../middleware/auth.js";

const router = express.Router();

// Public route (no login needed)
router.post("/create-guest", createTicket);
router.get("/myticket",isAuthenticatedUser,getmyTicket);
// Private route (login needed)
router.post("/create", isAuthenticatedUser, createTicket);
router.put("/addMessage/:id", isAuthenticatedUser, addUserMessage);

// Admin routes
router.get(
  "/admin-all",
  isAuthenticatedUser,
  authorizedRole(["admin"]),
  getTickets
);

router.put(
  "/admin-update/:id",
  isAuthenticatedUser,
  authorizedRole(["admin"]),
  updateTicket
);

export default router;
