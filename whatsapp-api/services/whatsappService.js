import axios from "axios";
import { whatsappConfig } from "../config/whatsapp.js";

const apiClient = axios.create({
  baseURL: `${whatsappConfig.baseUrl}/${whatsappConfig.apiVersion}/${whatsappConfig.phoneNumberId}`,
  headers: {
    Authorization: `Bearer ${whatsappConfig.accessToken}`,
    "Content-Type": "application/json",
  },
});

export async function sendMessage(payload) {
  try {
    const response = await apiClient.post("/messages", payload);
    console.log("Message sent:", payload.type, "to", payload.to);
    return {
      success: true,
      messageId: response.data.messages[0].id,
      recipient: response.data.contacts[0].wa_id,
    };
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to send message",
    };
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
