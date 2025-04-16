// whatsapp/utils/responseEngine.js
import messageTemplates from "./messageTemplates.js";
import { Conversation } from "../models/conversation.model.js";

export const handleAutoResponse = async (message) => {
  const conversation = await Conversation.findById(
    message.conversation
  ).populate("messages");

  // Check if within 24-hour window
  const isWithin24h = Date.now() - conversation.lastInteraction < 86400000;

  // Retrieve last user inbound message
  const lastUserMessage = conversation.messages
    .slice() // copy array
    .reverse()
    .find((m) => m.direction === "inbound");

  let response;

  // Handle interactive button responses
  if (lastUserMessage?.buttons?.length) {
    const buttonId = message.text?.toLowerCase();
    response = messageTemplates[buttonId] || messageTemplates.error_fallback;
  }

  // Handle keyword-based responses if no button response was found
  if (!response) {
    const keywords = {
      hello: "welcome",
      help: "services_overview",
      // ... add more keyword mappings as needed
    };

    const matchedKey = Object.keys(keywords).find((key) =>
      message.text?.toLowerCase().includes(key)
    );

    response = matchedKey ? messageTemplates[keywords[matchedKey]] : null;
  }

  // Fallback to a Meta-approved template when the conversation is outside 24h window
  if (!response && !isWithin24h) {
    response = {
      type: "template",
      templateName: "default_fallback",
    };
  }

  return response;
};
