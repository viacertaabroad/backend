import axios from "axios";
import responses from "./responses.js";

const API_VERSION = "v22.0";
const PHONE_NUMBER_ID = "599723043218457";
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

const BASE_URL = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}`;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  },
  timeout: 10000,
});
// Message builders
const buildTextMessage = (to, text) => ({
  messaging_product: "whatsapp",
  recipient_type: "individual",
  to,
  type: "text",
  text: { body: text },
});

const buildButtonMessage = (to, text, buttons) => ({
  messaging_product: "whatsapp",
  recipient_type: "individual",
  to,
  type: "interactive",
  interactive: {
    type: "button",
    body: { text },
    action: {
      buttons: buttons.map((btn) => ({
        type: "reply",
        reply: { id: btn.id, title: btn.title },
      })),
    },
  },
});

const buildTemplateMessage = (to, templateName, languageCode = "en_US") => ({
  messaging_product: "whatsapp",
  to,
  type: "template",
  template: {
    name: templateName,
    language: { code: languageCode },
  },
});

// Core functions
export const sendTextMessage = async (to, text) => {
  const payload = buildTextMessage(to, text);
  return sendMessage(payload);
};

export const sendButtonMessage = async (to, text, buttons) => {
  const payload = buildButtonMessage(to, text, buttons);
  return sendMessage(payload);
};

export const sendTemplateMessage = async (to, templateName) => {
  const payload = buildTemplateMessage(to, templateName);
  return sendMessage(payload);
};

export const broadcastMessage = async (recipients, message) => {
  const results = [];
  for (const phone of recipients) {
    const result = await sendTextMessage(phone, message);
    results.push({ phone, ...result });
  }
  return results;
};

const sendMessage = async (payload) => {
  try {
    const response = await axiosInstance.post("/messages", payload);
    return {
      success: true,
      messageId: response.data?.messages?.[0]?.id,
      recipient: response.data?.contacts?.[0]?.wa_id,
    };
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to send message",
    };
  }
};

// Response handler
export const getAutoResponse = (input) => {
  const normalized = input.trim().toUpperCase();
  const responseMap = {
    HI: "WELCOME",
    HELLO: "WELCOME",
    1: "SERVICES",
    2: "CONTACT",
    3: "FAQ",
    SERVICES: "SERVICES",
    CONTACT: "CONTACT",
    FAQ: "FAQ",
  };
  return responses[responseMap[normalized]] || responses.DEFAULT;
};

// export const sendWhatsAppMessage = async (phone, message) => {
//   try {
//     const response = await axiosInstance.post("/messages", {
//       messaging_product: "whatsapp",
//       recipient_type: "individual",
//       to: phone,
//       type: "text",
//       text: { body: message },
//     });

//     return {
//       success: true,
//       messageId: response.data?.messages?.[0]?.id,
//       recipient: response.data?.contacts?.[0]?.wa_id,
//     };
//   } catch (error) {
//     console.error("WhatsApp API Error:", error.response?.data || error.message);
//     return {
//       success: false,
//       error: error.response?.data?.error?.message || "Failed to send message",
//     };
//   }
// };
