// whatsapp/controllers/messageController.js
import WhatsAppMessage from "../models/whatsappMessage.model.js";
import { sendWhatsAppMessage } from "../utils/whatsappSender.js";
import { Conversation } from "../models/conversation.model.js";

// Save inbound message from webhook
export const saveIncomingMessage = async (req, res) => {
  try {
    const {
      messageId,
      from,
      type,
      text,
      mediaUrl,
      mediaType,
      caption,
      buttons,
      meta = {},
    } = req.body;
    //   1: Try to extract conversationId from meta
    let conversationId = meta.conversationId;

    //  2: If not present, auto-create or find conversation
    if (!conversationId) {
      const existing = await Conversation.findOne({ phoneNumber: from });
      if (existing) {
        conversationId = existing._id;
      } else {
        const newConversation = await Conversation.create({
          phoneNumber: from,
          lastInteraction: new Date()
        });
        conversationId = newConversation._id;
      }
    }
    const message = await WhatsAppMessage.create({
      messageId,
      phoneNumber: from,
      direction: "inbound",
      type,
      text,
      mediaUrl,
      mediaType,
      caption,
      buttons,

      // Assume you set a valid conversation ID based on your application logic
      conversation: conversationId,
    });
    req.whatsappIo?.emit("new-whatsapp-message", message);
    return res.status(200).json({ success: true, message });
  } catch (err) {
    console.error("❌ Error saving inbound message:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Send and save outbound message
export const sendAndSaveMessage = async (req, res) => {
  try {
    const {
      phoneNumber,
      type,
      text,
      mediaUrl,
      mediaType,
      templateName,
      buttons,
      caption,
      tags,
      conversationId,
      isBroadcast,
    } = req.body;

    // 1. Send using WhatsApp Business API
    const result = await sendWhatsAppMessage({
      phoneNumber,
      type,
      text,
      mediaUrl,
      mediaType,
      templateName,
      buttons,
    });

    // 2. Save in DB
    const message = await WhatsAppMessage.create({
      messageId: result.messageId,
      phoneNumber,
      direction: "outbound",
      type,
      text,
      mediaUrl,
      mediaType,
      templateName,
      buttons,
      caption,
      status: "Message Sent ✅", // update status to new format
      isBroadcast: !!isBroadcast,
      tags,
      meta: result.meta,
      conversation: conversationId,
    });

    req.whatsappIo?.emit("new-whatsapp-message", message);
    return res.status(200).json({ success: true, message });
  } catch (err) {
    console.error("❌ Error sending message:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Update status: Delivered, Read, or Failed
export const updateMessageStatus = async (req, res) => {
  try {
    const { messageId, status } = req.body;
    // expected status values (with emoji) are sent from webhook events
    const updated = await WhatsAppMessage.findOneAndUpdate(
      { messageId },
      {
        $set: { status },
        $push: { statusHistory: { status, timestamp: new Date() } },
      },
      { new: true }
    );

    if (updated) {
      // Update last interaction time for the conversation
      await Conversation.findByIdAndUpdate(updated.conversation, {
        lastInteraction: new Date(),
      });
      req.whatsappIo?.emit("whatsapp-message-status", updated);
      return res.status(200).json({ success: true, updated });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }
  } catch (err) {
    console.error("❌ Error updating status:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
