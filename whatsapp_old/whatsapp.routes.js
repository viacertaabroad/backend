// whatsapp.routes.js
import express from "express";
import { broadcast, sendMessage, sendTemplate } from "./whatsapp.controller.js";
import { handleIncomingMessage, verifyWebhook } from "./whatsapp.webhook.js";

const router = express.Router();

// API Endpoints
router.post("/send", sendMessage);
router.post("/send-template", sendTemplate);
router.post("/broadcast", broadcast);

// Webhook Handlers
router.get("/webhook", verifyWebhook);
router.post("/webhook", handleIncomingMessage);

export default router;
