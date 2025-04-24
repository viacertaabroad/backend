import express from "express";
// import { body, validationResult } from "express-validator";
import {
  saveIncomingMessage,
  sendAndSaveMessage,
  updateMessageStatus,
} from "../controllers/messageController.js";
import {
  handleWebhookEvent,
  verifyWebhook,
} from "../webhook/webhookHandler.js";
import { sendBroadcast } from "../controllers/broadcastController.js";

const router = express.Router();

// Webhook to receive inbound messages from WhatsApp
router.post("/incoming", saveIncomingMessage);

// Route to send messages and save them
router.post("/send", sendAndSaveMessage);

// Route to update message status (sent, delivered, read, failed)
router.post("/status", updateMessageStatus);

// ---------
// Validate incoming broadcast request
// const broadcastValidation = [
//   body('templateName').exists().withMessage("Template name is required."),
//   body('message').exists().withMessage("Message content is required."),
//   body('phoneNumbers').isArray().withMessage("Phone numbers must be an array.")
// ];
// const broadcastControllerWrapper = [
//   broadcastValidation,
//   (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//     next();
//   },
//   sendBroadcast
// ];
// router.post("/broadcast", broadcastControllerWrapper);

// ---------

router.get("/webhook", verifyWebhook); // Meta verify endpoint
router.post("/webhook", handleWebhookEvent); // Meta sends events here

export default router;
