import mongoose from "mongoose";

const supportRoomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["waiting", "active", "closing"],
      default: "waiting",
    },
    lastActivity: { type: Date, default: Date.now },
    closingAt: Date,
  },
  { timestamps: true }
);

supportRoomSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 300 });

const SupportRoom = mongoose.model("support_room", supportRoomSchema);

export default SupportRoom;
