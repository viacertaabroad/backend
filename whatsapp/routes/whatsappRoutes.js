import express from "express";
import {
  saveIncomingMessage,
  sendAndSaveMessage,
  updateMessageStatus,
} from "../controllers/messageController.js";
import {
  handleWebhookEvent,
  verifyWebhook,
} from "../webhook/webhookHandler.js";

const router = express.Router();

// Webhook to receive inbound messages from WhatsApp
router.post("/incoming", saveIncomingMessage);

// Route to send messages and save them
router.post("/send", sendAndSaveMessage);

// Route to update message status (sent, delivered, read, failed)
router.post("/status", updateMessageStatus);

// ---------

router.get("/webhook", verifyWebhook); // Meta verify endpoint
router.post("/webhook", handleWebhookEvent); // Meta sends events here

export default router;
