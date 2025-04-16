// whatsapp/models/conversation.model.js
import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    phoneNumber: { type: String, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["active", "archived", "pending"],
      default: "active",
    },
    lastInteraction: { type: Date, default: Date.now },
    tags: [String],
    meta: Object,
    messages: [
      { type: mongoose.Schema.Types.ObjectId, ref: "whatsapp_messages" },
    ],
    blocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Conversation = mongoose.model(
  "whatsapp_conversations",
  conversationSchema
);
