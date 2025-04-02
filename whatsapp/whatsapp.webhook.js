// webhook.controller.js
import { generateResponse } from "./chat_service.js";
import {
  sendTextMessage,
  sendButtonMessage,
  sendListMessage,
  sendQuickReplyMessage,
  sendCarouselMessage,
} from "./whatsapp.service.js";

export const verifyWebhook = (req, res) => {
  const verifyToken = process.env.WEBHOOK_VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (!verifyToken) {
    console.error("WEBHOOK_VERIFY_TOKEN not configured");
    return res.sendStatus(500);
  }

  if (mode === "subscribe" && token === verifyToken) {
    console.log("WEBHOOK_VERIFIED");
    return res.status(200).send(challenge);
  }
  console.warn("Webhook verification failed", { mode, token });
  res.sendStatus(403);
};

// const sendResponse = async (phoneNumber, response) => {
//   try {
//     let result;
//     switch (response.type) {
//       case "list":
//         result = await sendListMessage(phoneNumber, response);
//         break;
//       case "carousel":
//         result = await sendCarouselMessage(phoneNumber, response.items);
//         break;
//       case "quick_reply":
//         result = await sendQuickReplyMessage(phoneNumber, response);
//         break;
//       case "button":
//       case "interactive":
//         if (response.buttons?.length > 0) {
//           result = await sendButtonMessage(
//             phoneNumber,
//             response.text || response.body,
//             response.buttons
//           );
//         } else {
//           result = await sendTextMessage(
//             phoneNumber,
//             response.text || "Please select an option"
//           );
//         }
//         break;
//       default:
//         result = await sendTextMessage(
//           phoneNumber,
//           response.text || response.body
//         );
//     }

//     if (!result?.success) {
//       console.error("Failed to send message:", result?.error);
//       await sendTextMessage(
//         phoneNumber,
//         "We're having technical difficulties. Please try again later."
//       );
//     }

//     return result;
//   } catch (error) {
//     console.error("Response sending failed:", error);
//     throw error; // Re-throw to be handled by the caller
//   }
// };

const sendResponse = async (phoneNumber, response) => {
  try {
    let result;

    switch (response.interactiveType) {
      case "button":
        result = await sendButtonMessage(phoneNumber, response);
        break;

      case "list":
        result = await sendListMessage(phoneNumber, response);
        break;

      case "quick_reply":
        result = await sendQuickReplyMessage(phoneNumber, response);
        break;

      case "product":
        result = await sendCarouselMessage(phoneNumber, response);
        break;

      default:
        result = await sendTextMessage(
          phoneNumber,
          response.text || response.body
        );
    }

    if (!result?.success) {
      console.error("Message failed:", {
        type: response.interactiveType,
        error: result?.error,
        response,
      });

      // Fallback to simple text
      await sendTextMessage(
        phoneNumber,
        response.fallbackText ||
          "We're having technical difficulties. Please try again later."
      );
    }

    return result;
  } catch (error) {
    console.error("Response sending failed:", {
      error: error.message,
      stack: error.stack,
      response,
    });

    throw error;
  }
};

export const handleIncomingMessage = async (req, res) => {
  try {
    // Validate request structure
    if (!req.body?.object || req.body.object !== "whatsapp_business_account") {
      console.log("Invalid webhook payload structure");
      return res.sendStatus(200);
    }
    const entry = req.body.entry?.[0];
    if (!entry) {
      console.log("Empty webhook entry");
      return res.sendStatus(200);
    }
    const message = entry.changes?.[0]?.value?.messages?.[0];
    if (!message) {
      console.log("No message in payload", { body: req.body });
      return res.sendStatus(200);
    }

    const phoneNumber = message.from;
    const messageType = message.type;

    console.log("Incoming message:", {
      from: phoneNumber,
      type: messageType,
      timestamp: message.timestamp,
      text: message.text?.body || "[non-text message]",
      messageId: message.id,
    });

    let userInput;

    switch (messageType) {
      case "text":
        userInput = message.text?.body?.trim();
        break;
      case "interactive":
        if (message.interactive?.type === "button_reply") {
          userInput = message.interactive.button_reply.id?.trim();
        } else if (message.interactive?.type === "list_reply") {
          userInput = message.interactive.list_reply.id?.trim();
        }
        break;
      default:
        console.log(`Unhandled message type: ${messageType}`);
        return res.sendStatus(200);
    }

    if (!userInput) {
      console.log("No valid user input found");
      return res.sendStatus(200);
    }
    // Get and validate response
    const response = generateResponse(phoneNumber, userInput);

    console.log("Generated response:", {
      type: response.type,
      length: response.text?.length || 0,
      hasButtons: !!response.buttons,
      hasSections: !!response.sections,
    });

    await sendResponse(phoneNumber, response);

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook processing error:", {
      error: error.message,
      stack: error.stack,
      body: JSON.stringify(req.body, null, 2),
      headers: req.headers,
    });

    try {
      // Attempt to notify user of error
      if (req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from) {
        await sendTextMessage(
          req.body.entry[0].changes[0].value.messages[0].from,
          "Sorry, we encountered an error. Please try again."
        );
      }
    } catch (fallbackError) {
      console.error("Failed to send error notification:", fallbackError);
    }

    res.sendStatus(500);
  }
};
