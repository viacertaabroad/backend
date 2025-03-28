import mongoose from "mongoose";

const supportRoomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true },
    status: { type: String, enum: ["active", "closed"], default: "active" },
    // Record the timestamp of the last activity in the room.
    lastActivity: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Update the TTL index to remove the room only if there’s no activity for 5 minutes (300 seconds).
supportRoomSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 300 });

const SupportRoom = mongoose.model("support_room", supportRoomSchema);

export default SupportRoom;
