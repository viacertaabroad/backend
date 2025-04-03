import { messageTemplates } from "../services/messageTemplate.js";
import { sendMessage } from "../services/whatsappService.js";
import {
  responseFlows,
  conversationStates,
} from "../responses/responsesConfig.js";

const userStates = new Map();
const messageLogs = []; // In-memory store, replace with DB in production

export const handleWebhook = async (req, res) => {
  // Verification handshake
  if (req.query["hub.mode"] === "subscribe") {
    if (req.query["hub.verify_token"] === whatsappConfig.webhookVerifyToken) {
      console.log("Webhook verified successfully");
      return res.send(req.query["hub.challenge"]);
    }
    console.error("Webhook verification failed");
    return res.sendStatus(403);
  }

  // Process incoming message
  const entry = req.body.entry?.[0];
  const message = entry?.changes?.[0]?.value?.messages?.[0];

  if (!message) {
    console.log("Empty message received");
    return res.sendStatus(200);
  }

  const phone = message.from;
  const currentState = userStates.get(phone);
  const messageType = message.type;
  const messageContent =
    messageType === "text"
      ? message.text.body
      : message.interactive?.type || "unknown";

  // Log incoming message
  messageLogs.push({
    timestamp: new Date(),
    phone,
    direction: "incoming",
    type: messageType,
    content: messageContent,
    state: currentState,
  });

  console.log(`Incoming ${messageType} from ${phone}:`, messageContent);

  try {
    // Handle text messages
    if (messageType === "text") {
      const text = message.text.body.toLowerCase().trim();

      if (currentState === conversationStates.awaitingConsultationDetails) {
        await handleConsultationDetails(phone, text);
        return res.sendStatus(200);
      }

      // Keyword-based routing
      if (text.includes("help"))
        return handleInteractiveResponse(phone, "help");
      if (text.includes("hi") || text.includes("hello"))
        return handleInteractiveResponse(phone, "welcome");
      if (text.includes("contact"))
        return handleInteractiveResponse(phone, "contact");
    }

    // Handle interactive messages
    if (messageType === "interactive") {
      const interactiveType = message.interactive.type;
      const responseKey =
        interactiveType === "button_reply"
          ? message.interactive.button_reply.id
          : interactiveType === "list_reply"
          ? message.interactive.list_reply.id
          : null;

      if (responseKey) {
        return handleInteractiveResponse(phone, responseKey);
      }
    }

    // Fallback for unhandled messages
    await handleInteractiveResponse(phone, "fallback");
    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook processing error:", {
      error: error.message,
      stack: error.stack,
      phone,
      message,
    });
    res.sendStatus(500);
  }
};

// Helper function for consultation flow
async function handleConsultationDetails(phone, text) {
  // Process consultation details...
  await sendMessage(
    messageTemplates.textMessage(
      phone,
      "Thank you for your details! Our consultant will contact you shortly."
    )
  );
  userStates.delete(phone);
}

// Get message logs
export const getMessageLogs = (req, res) => {
  res.json({
    success: true,
    count: messageLogs.length,
    logs: messageLogs.slice(-100).reverse(), // Return last 100 messages
  });
};
