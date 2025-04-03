import axios from "axios";
import { whatsappConfig } from "../config/whatsapp.js";
import { messageTemplates } from "./messageTemplate.js";

const apiClient = axios.create({
  baseURL: `${whatsappConfig.baseUrl}/${whatsappConfig.apiVersion}/${whatsappConfig.phoneNumberId}`,
  headers: {
    Authorization: `Bearer ${whatsappConfig.accessToken}`,
    "Content-Type": "application/json",
  },
});

// Enhanced logger
function logMessage(direction, phone, messageType, payload = {}) {
  const timestamp = new Date().toISOString();
  console.log(
    `[${timestamp}] ${direction.toUpperCase()} ${messageType} to ${phone}:`,
    {
      ...payload,
      // Remove sensitive data from logs
      accessToken: payload.accessToken ? "***" : undefined,
    }
  );
}

export async function sendMessage(payload) {
  try {
    logMessage("outgoing", payload.to, payload.type || "text", payload);

    const response = await apiClient.post("/messages", payload);
    // console.log("Message sent:", payload.type, "to", payload.to);
    return {
      success: true,
      messageId: response.data.messages[0].id,
      recipient: response.data.contacts[0].wa_id,
      timestamp: response.data.messages[0].timestamp,
    };
  } catch (error) {
    console.error("Send Message Error:", {
      error: error.response?.data || error.message,
      payload,
    });
    throw error;
  }
}

// Broadcast function with chunking
export async function sendBroadcast(recipients, message) {
  try {
    // Split recipients into chunks
    const chunks = [];
    for (let i = 0; i < recipients.length; i += whatsappConfig.broadcastLimit) {
      chunks.push(recipients.slice(i, i + whatsappConfig.broadcastLimit));
    }

    const results = [];
    for (const chunk of chunks) {
      const payload = messageTemplates.broadcastMessage(chunk, message);
      logMessage("broadcast", `[${chunk.length} recipients]`, "broadcast", {
        recipients: chunk,
        message: message.substring(0, 50) + "...",
      });
      const response = await apiClient.post("/messages", payload);
      results.push(...response.data.messages);
    }

    return {
      success: true,
      sentCount: results.length,
      messageIds: results.map((m) => m.id),
    };
  } catch (error) {
    console.error("Broadcast Error:", error.response?.data || error.message);
    throw error;
  }
}

// Media message builder
function buildMediaMessage(type, to, url, caption = "", filename = "") {
  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type,
  };

  const mediaTypes = {
    image: { image: { link: url, caption } },
    video: { video: { link: url, caption } },
    audio: { audio: { link: url } },
    document: { document: { link: url, caption, filename } },
  };

  return { ...payload, ...mediaTypes[type] };
}

// Text message
export function sendText(to, text) {
  return sendMessage({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: { body: text },
  });
}

// Media messages
export function sendImage(to, url, caption) {
  return sendMessage(buildMediaMessage("image", to, url, caption));
}

export function sendVideo(to, url, caption) {
  return sendMessage(buildMediaMessage("video", to, url, caption));
}

export function sendAudio(to, url) {
  return sendMessage(buildMediaMessage("audio", to, url));
}

export function sendDocument(to, url, caption, filename) {
  return sendMessage(buildMediaMessage("document", to, url, caption, filename));
}

// Text + Media combo
export async function sendTextWithMedia(
  to,
  text,
  mediaType,
  mediaUrl,
  caption = ""
) {
  await sendText(to, text);
  return sendMessage(buildMediaMessage(mediaType, to, mediaUrl, caption));
}

// Template message
export function sendTemplate(to, templateName, language = "en_US") {
  return sendMessage({
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: language },
    },
  });
}

/*
in single export
export default {
  sendText,
  sendImage,
  sendVideo,
  sendAudio,
  sendDocument,
  sendTextWithMedia,
  sendTemplate
};
*/
