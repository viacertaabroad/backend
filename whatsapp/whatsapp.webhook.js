// webhook.controller.js
import {
  sendTextMessage,
  sendButtonMessage,
  getAutoResponse,
} from "./whatsapp.service.js";

export const verifyWebhook = (req, res) => {
  const verifyToken = process.env.WEBHOOK_VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === verifyToken) {
    console.log("WEBHOOK_VERIFIED");
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
};

export const handleIncomingMessage = async (req, res) => {
  try {
    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return res.sendStatus(200);

    console.log("Incoming message:", {
      from: message.from,
      type: message.type,
      text: message.text?.body || "[non-text message]",
      timestamp: message.timestamp,
    });

    let userInput;
    if (message.type === "text") {
      userInput = message.text.body;
    } else if (message.type === "interactive") {
      userInput = message.interactive.button_reply.id;
    } else {
      return res.sendStatus(200);
    }

    const response = getAutoResponse(userInput);
    if (response.buttons) {
      await sendButtonMessage(message.from, response.text, response.buttons);
    } else {
      await sendTextMessage(message.from, response.text);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error);
    res.sendStatus(500);
  }
};
