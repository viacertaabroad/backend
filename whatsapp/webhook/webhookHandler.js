// whatsapp/webhook/webhookHandler.js
import {
  saveIncomingMessage,
  updateMessageStatus,
} from "../controllers/messageController.js";
import { logError } from "../utils/logger.js";
import { handleAutoResponse } from "../utils/responseEngine.js";
import { sendAndSaveMessage } from "../controllers/messageController.js";

export const verifyWebhook = (req, res) => {
  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified!");
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
};

export const handleWebhookEvent = async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0]?.value;

    // Handle incoming messages
    if (changes?.messages) {
      const message = changes.messages[0];
      const messageType = message.type;
      const baseData = {
        messageId: message.id,
        from: message.from,
        type: messageType,
        meta: message,
      };

      switch (messageType) {
        case "text":
          baseData.text = message.text?.body;
          break;
        case "image":
        case "video":
        case "document":
        case "audio":
          baseData.mediaUrl = message[messageType]?.link;
          baseData.mediaType = message[messageType]?.mime_type;
          baseData.caption = message[messageType]?.caption;
          break;
        case "location":
          baseData.location = {
            latitude: message.location.latitude,
            longitude: message.location.longitude,
          };
          break;
        case "button":
          baseData.buttons = [message.button.text];
          break;
      }

      req.body = baseData;
      await saveIncomingMessage(req, res);

      // Trigger auto-response logic
      const response = await handleAutoResponse(req.body);
      if (response) {
        await sendAndSaveMessage({ ...response, phoneNumber: message.from, conversationId: baseData.meta.conversationId });
      }
    }

    // Handle status update events
    if (changes?.statuses) {
      const statusData = changes.statuses[0];
      // statusData.status can be: "sent", "delivered", "read", "failed"
      // Map them to your emoji values:
      const statusMap = {
        sent: "Message Sent ✅",
        delivered: "Delivered 📬",
        read: "Read ✅✅",
        failed: "Failed ❌"
      };
      req.body = {
        messageId: statusData.id,
        status: statusMap[statusData.status] || statusData.status,
      };
      await updateMessageStatus(req, res);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook processing error:", err);
    logError(err, req.body);
    res.sendStatus(500);
  }
};
