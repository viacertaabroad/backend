import { messageTemplates } from "../services/messageTemplate.js";
import { sendMessage } from "../services/whatsappService.js";

// Response configurations
const responses = {
  btn_help: {
    text: "Here's how we can help:",
    buttons: [
      { id: "contact_support", title: "Contact Support" },
      { id: "faq", title: "View FAQs" },
    ],
  },
  btn_order: {
    text: "Please select an option:",
    list: {
      header: "Order Options",
      body: "Choose delivery method",
      sections: [
        {
          title: "Delivery Methods",
          rows: [
            {
              id: "express",
              title: "Express",
              description: "2-3 business days",
            },
            {
              id: "standard",
              title: "Standard",
              description: "5-7 business days",
            },
          ],
        },
      ],
    },
  },
};

export const handleWebhook = async (req, res) => {
  // Verify webhook
  if (req.query["hub.mode"] === "subscribe") {
    if (req.query["hub.verify_token"] === process.env.WEBHOOK_VERIFY_TOKEN) {
      return res.send(req.query["hub.challenge"]);
    }
    return res.sendStatus(403);
  }

  // Process messages
  const entry = req.body.entry?.[0];
  const message = entry?.changes?.[0]?.value?.messages?.[0];

  if (!message) return res.sendStatus(200);

  const phone = message.from;

  try {
    // Handle button replies
    if (message.interactive?.type === "button_reply") {
      const buttonId = message.interactive.button_reply.id;
      const response = responses[buttonId];

      if (response?.buttons) {
        await sendMessage(
          messageTemplates.buttonMessage(
            phone,
            null,
            response.text,
            response.buttons
          )
        );
      } else if (response?.list) {
        await sendMessage(
          messageTemplates.listMessage(
            phone,
            response.list.header,
            response.list.body,
            "Options",
            response.list.sections
          )
        );
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error);
    res.sendStatus(500);
  }
};
