// whatsapp/controllers/broadcastController.js
import { sendWhatsAppMessage } from "../utils/whatsappSender.js";
import { Conversation } from "../models/conversation.model.js";

export const sendBroadcast = async (req, res) => {
  try {
    const { templateName, message, phoneNumbers } = req.body;

    // Fetch conversations based on phone numbers instead of recipientIds
    const conversations = await Conversation.find({
      phoneNumber: { $in: phoneNumbers },
      lastInteraction: { $gte: new Date(Date.now() - 86400000) }, // Last interaction within 24 hours
    });

    // Broadcasting messages to the phone numbers
    const results = await Promise.allSettled(
      conversations.map(async (convo) => {
        const isWithin24h =
          convo.lastInteraction >= new Date(Date.now() - 86400000);
        const msgData = {
          phoneNumber: convo.phoneNumber,
          type: isWithin24h ? message.type : "template", // Send template if last interaction was > 24 hours
          ...(isWithin24h ? message : { templateName }),
          // Include conversation id for associating the message
          conversationId: convo._id,
        };
        return sendWhatsAppMessage(msgData); // Sending message
      })
    );

    res.json({ success: true, results });
  } catch (err) {
    console.error("Broadcast error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
