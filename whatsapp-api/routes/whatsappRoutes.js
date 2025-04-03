import express from "express";
import {
  sendMedia,
  sendTextWithMediafn,
} from "../controllers/mediaController.js";
import { sendButtons, sendList } from "../controllers/interactiveController.js";

import {
  handleWebhook,
  getMessageLogs,
} from "../controllers/webhookController.js";
import { createBroadcast } from "../controllers/broadcastController.js";
const router = express.Router();

// test
router.get("/test", async (req, res) => {
  try {
    console.log("What app route is working");
    res.status(200).json({
      succes: true,
      message: "Whatapp Route Working",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      succes: false,
      message: "Whatapp Route NOT Working",
      error: error.message,
    });
  }
});

// Media endpoints
router.post("/media", sendMedia);
router.post("/media-with-text", sendTextWithMediafn);

// Interactive endpoints
router.post("/buttons", sendButtons);
router.post("/list", sendList);

// Webhook
router.get("/webhook", handleWebhook);
router.post("/webhook", handleWebhook);
router.get("/logs", getMessageLogs);

// Broadcast endpoint
router.post("/broadcast", createBroadcast);

export default router;
