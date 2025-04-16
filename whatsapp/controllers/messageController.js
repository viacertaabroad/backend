// whatsapp/controllers/messageController.js
import WhatsAppMessage from "../models/whatsappMessage.model.js";
import { sendWhatsAppMessage } from "../utils/whatsappSender.js";
import { Conversation } from "../models/conversation.model.js";

// Save inbound message from webhook
export const saveIncomingMessage = async (req, res) => {
  try {
    const body = req.body;

    // ✅ Message status update (read, delivered, etc.)
    const statusData = body?.entry?.[0]?.changes?.[0]?.value?.statuses?.[0];
    if (statusData) {
      const { id: messageId, status, timestamp, recipient_id } = statusData;

      const updated = await WhatsAppMessage.findOneAndUpdate(
        { messageId },
        { status, updatedAt: new Date(Number(timestamp) * 1000) },
        { new: true }
      );

      if (updated) {
        // ✅ Emit status update to the frontend in real-time
        io.emit("messageStatusUpdate", {
          messageId: updated.messageId,
          status: updated.status,
        });
      }

      return res.sendStatus(200);
    }

    // ///////////////
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
          lastInteraction: new Date(),
        });
        conversationId = newConversation._id;
      }
    }
    //  Create and Save the Incoming Message
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
      conversation: conversationId,
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastInteraction: new Date(),
      $push: { messages: message._id },
    });

    req.whatsappIo?.emit("new-whatsapp-message", message);

    console.log("📥 Incoming:", {
      from: message.phoneNumber,
      type: message.type,
      text: message.text,
      conversation: message.conversation,
      timestamp: message.createdAt,
    });

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
      status: "sent", // update status to new format
      isBroadcast: !!isBroadcast,
      tags,
      meta: result.meta,
      conversation: conversationId,
    });
    await Conversation.findByIdAndUpdate(conversationId, {
      lastInteraction: new Date(),
      $push: { messages: message._id },
    });

    console.log("📤 Outgoing:", {
      to: message.phoneNumber,
      type: message.type,
      text: message.text || message.caption || "[non-text]",
      conversation: message.conversation,
      timestamp: message.createdAt,
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
