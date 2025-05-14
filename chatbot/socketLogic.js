// File: chatbot/socketLogic.js
import {
  handleJoinRoom,
  handleUserMessage,
  handleRequestSupport,
  handleCancelSupport,
  handleCheckSupportRoom,
  handleGetActiveRooms,
  handleCloseSupportRoom,
  handleJoinAgent,
  handleSupportMessage,
  handleDisconnect,
} from "./logic.js";

export default function setupChatbot(io) {
  io.on("connection", (socket) => {
    console.log(`✔️ User connected: ${socket.id}`);

    socket.on("joinRoom", (data) => handleJoinRoom(io, socket, data));

    socket.on("user_message", (data) => handleUserMessage(io, socket, data));

    socket.on("request_support", (data) =>
      handleRequestSupport(io, socket, data)
    );

    socket.on("cancel_support_request", (data) =>
      handleCancelSupport(io, socket, data)
    );

    socket.on("check_support_room", (data) =>
      handleCheckSupportRoom(io, socket, data)
    );
    socket.on("get_active_support_rooms", () =>
      handleGetActiveRooms(io, socket)
    );
    socket.on("close_support_room", (data) =>
      handleCloseSupportRoom(io, socket, data)
    );

    socket.on("join_user_room", (data) => handleJoinAgent(io, socket, data));

    socket.on("support_message", (data) =>
      handleSupportMessage(io, socket, data)
    );

    socket.on("disconnect", () => {
      console.log(`❌ Disconnected: ${socket.id}`);
      handleDisconnect(io, socket);
    });
  });
}
