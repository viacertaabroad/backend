// whatsapp/models/whatsappMessage.model.js

import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    messageId: { type: String, unique: true, required: true }, // WhatsApp message ID
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    }, // Optional internal user
    phoneNumber: { type: String, required: true }, // WhatsApp number

    direction: {
      type: String,
      enum: ["inbound", "outbound"],
      required: true, // inbound = from user, outbound = from business
    },

    type: {
      type: String,
      enum: [
        "text",
        "image",
        "video",
        "audio",
        "document",
        "button",
        "template",
        "sticker",
        "location",
      ],
      required: true,
    },

    text: { type: String }, // Only for text messages
    mediaUrl: { type: String }, // For media messages
    mediaType: { type: String }, // e.g., image/jpeg, audio/mpeg
    caption: { type: String }, // Optional caption

    templateName: { type: String }, // If template was used
    buttons: [{ type: String }], // Button titles if quick replies were sent

    status: {
      type: String,
      enum: ["sent", "delivered", "read", "failed"],
      default: "sent",
    },

    isBroadcast: { type: Boolean, default: false }, // For broadcast use
    tags: [{ type: String }], // Optional tags for segmentation

    meta: { type: Object }, // Optional full raw Meta payload

    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    responseTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WhatsAppMessage",
    },
    isAutoReply: { type: Boolean, default: false },
  },

  {
    timestamps: true, // createdAt and updatedAt
  }
);

const WhatsAppMessage = mongoose.model("WhatsAppMessage", messageSchema);
export default WhatsAppMessage;
