import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  // Basic Info
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ["admission", "visa", "payment", "course", "other"],
  },

  // guestUser: {
  //   type: {
  //     name: { type: String },
  //     email: {
  //       type: String,
  //       required: function () {
  //         return !this.user;
  //       },
  //     },
  //     phone: { type: String },
  //   },
  //   required: false, // Make entire guestUser optional
  // },

  // Status Tracking
  status: {
    type: String,
    default: "open",
    enum: ["open", "in-progress", "resolved", "closed", "archived"],
  },
  priority: {
    type: String,
    default: "medium",
    enum: ["low", "medium", "high", "urgent"],
  },

  // Metadata
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  closedAt: { type: Date },

  // Communication
  messages: [
    {
      text: String,
      sender: { type: String, enum: ["user", "admin", "system"] },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

const Ticket = mongoose.model("ticket", ticketSchema);
export default Ticket;
