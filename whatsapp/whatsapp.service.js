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
//
// const buildButtonMessage = (to, text, buttons) => ({
//   messaging_product: "whatsapp",
//   recipient_type: "individual",
//   to,
//   type: "interactive",
//   interactive: {
//     type: "button",
//     body: { text },
//     action: {
//       buttons: buttons.map((btn) => ({
//         type: "reply",
//         reply: { id: btn.id, title: btn.title },
//       })),
//     },
//   },
// });

// Update buildButtonMessage to handle your structure
// const buildButtonMessage = (to, text, buttons) => {
//   const buttonArray = buttons.map((btn) => ({
//     type: "reply",
//     reply: {
//       id: btn.id || btn.title.toLowerCase().replace(/\s+/g, "_"),
//       title: btn.title,
//     },
//   }));

//   return {
//     messaging_product: "whatsapp",
//     recipient_type: "individual",
//     to,
//     type: "interactive",
//     interactive: {
//       type: "button",
//       body: { text },
//       action: { buttons: buttonArray },
//     },
//   };
// };
const buildButtonMessage = (to, message) => ({
  messaging_product: "whatsapp",
  recipient_type: "individual",
  to,
  type: "interactive",
  interactive: {
    type: "button",
    header: message.header ? { type: "text", text: message.header } : undefined,
    body: { text: message.body },
    footer: message.footer ? { text: message.footer } : undefined,
    action: {
      buttons: message.buttons.map((btn) => ({
        type: "reply",
        reply: {
          id: btn.id,
          title: btn.title.length > 20 ? btn.title.substring(0, 20) : btn.title,
        },
      })),
    },
  },
});

// Add to whatsapp.service.js

const buildCarouselMessage = (to, items) => ({
  messaging_product: "whatsapp",
  recipient_type: "individual",
  to,
  type: "interactive",
  interactive: {
    type: "product", // WhatsApp requires 'product' type for carousels
    header: { type: "text", text: "Study Destinations" },
    body: { text: "Choose a destination to learn more" },
    action: {
      catalog_id: "YOUR_CATALOG_ID", // Must be a real catalog ID
      sections: items.map((item) => ({
        title: item.title,
        product_items: [
          {
            product_retailer_id:
              item.id || item.title.toLowerCase().replace(/\s+/g, "_"),
          },
        ],
      })),
    },
    footer: { text: "Scroll to see more options" },
  },
});

//
const buildTemplateMessage = (to, templateName, languageCode = "en_US") => ({
  messaging_product: "whatsapp",
  to,
  type: "template",
  template: {
    name: templateName,
    language: { code: languageCode },
  },
});
// Add to whatsapp.service.js
// const buildListMessage = (to, message) => ({
//   messaging_product: "whatsapp",
//   to,
//   type: "interactive",
//   interactive: {
//     type: "list",
//     header: { type: "text", text: message.header },
//     body: { text: message.body },
//     footer: { text: message.footer },
//     action: {
//       button: message.button.title,
//       sections: message.sections.map((section) => ({
//         title: section.title,
//         rows: section.rows || [
//           {
//             id: section.title.toLowerCase().replace(/\s+/g, "_"),
//             title: section.title,
//             description: section.description,
//           },
//         ],
//       })),
//     },
//   },
// });

const buildListMessage = (to, message) => ({
  messaging_product: "whatsapp",
  recipient_type: "individual",
  to,
  type: "interactive",
  interactive: {
    type: "list",
    header: { type: "text", text: message.header },
    body: { text: message.body },
    footer: message.footer ? { text: message.footer } : undefined,
    action: {
      button: message.buttonText,
      sections: message.sections.map((section) => ({
        title: section.title,
        rows: section.rows.map((row) => ({
          id: row.id,
          title: row.title,
          description: row.description,
        })),
      })),
    },
  },
});

// const buildQuickReplyMessage = (to, message) => ({
//   messaging_product: "whatsapp",
//   recipient_type: "individual",
//   to,
//   type: "interactive",
//   interactive: {
//     type: "list",
//     body: { text: message.text },
//     action: {
//       button: "Options",
//       sections: [
//         {
//           title: message.text,
//           rows: message.options.map((opt) => ({
//             id: opt.id,
//             title: opt.title,
//             description: opt.description || "",
//           })),
//         },
//       ],
//     },
//   },
// });
// Core functions

const buildQuickReplyMessage = (to, message) => ({
  messaging_product: "whatsapp",
  recipient_type: "individual",
  to,
  type: "interactive",
  interactive: {
    type: "list",
    body: { text: message.body },
    action: {
      button: "Options",
      sections: [
        {
          title: "Choose an option",
          rows: message.options.map((opt) => ({
            id: opt.id,
            title: opt.title,
            description: opt.description || "",
          })),
        },
      ],
    },
  },
});
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
export const sendListMessage = async (to, message) => {
  const payload = buildListMessage(to, message);
  return sendMessage(payload);
};
export const sendCarouselMessage = async (to, items) => {
  const payload = buildCarouselMessage(to, items);
  return sendMessage(payload);
};
const sendMessage = async (payload) => {
  try {
    const response = await axiosInstance.post("/messages", payload);

    const logMessage = (payload, response) => {
      console.log(
        `Outgoing response from system: [${new Date().toISOString()}] `,
        {
          to: payload.to,
          type: payload.type,
          length: payload.text?.body?.length || 0,
          status: response.success ? "success" : "failed",
          messageId: response.messageId,
        }
      );
    };

    logMessage(payload, result);

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
  const normalized = input.trim().toLowerCase();
  const responseMap = {
    hi: "welcome",
    hello: "WELCOME",
    1: "services",
    2: "destinations",
    3: "test_prep",
    services: "services",
    destinations: "destinations",
    tests: "test_prep",
    contact: "contact",
    back: "welcome",
  };
  const responseKey = responseMap[normalized];
  if (!responseKey) return responses.fallback;

  const response = responses[responseKey];
  return response || responses.fallback;
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
