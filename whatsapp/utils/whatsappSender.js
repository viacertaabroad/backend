import axios from "axios";

const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const BASE_URL = `https://graph.facebook.com/v22.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

export const sendWhatsAppMessage = async ({
  phoneNumber,
  type = "text",
  text,
  mediaUrl,
  mediaType,
  templateName,
  buttons,
}) => {
  try {
    let data = {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type,
    };

    // 1. Plain Text
    if (type === "text") {
      data.text = { body: text };
    }

    // 2. Media (image, video, document, audio)
    if (["image", "video", "document", "audio"].includes(type)) {
      data[type] = { link: mediaUrl };
    }

    // 3. Template Message
    if (type === "template") {
      data.template = {
        name: templateName,
        language: { code: "en_US" },
        components: [], // Optional: Add parameters here
      };
    }

    // 4. Interactive Buttons
    if (type === "interactive" && buttons?.length) {
      data.interactive = {
        type: "button",
        body: { text },
        action: {
          buttons: buttons.map((btn, index) => ({
            type: "reply",
            reply: {
              id: btn.id || `btn_${index}`,
              title: btn.title,
            },
          })),
        },
      };
    }

    const response = await axios.post(BASE_URL, data, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const resData = response.data;
  
    

    return {
      success: true,
      messageId: resData?.messages?.[0]?.id || null,
      meta: resData,
    };
  } catch (err) {
    console.error("❌ Error sending WhatsApp message:", err.response?.data || err.message);
    throw new Error("Failed to send WhatsApp message");
  }
};
