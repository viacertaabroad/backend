import { Server as SocketIOServer } from "socket.io";
import { sendAndSaveMessage } from "../controllers/messageController.js";

// Initialize the separate socket server for WhatsApp
export const initializeWhatsappSocket = (server) => {
  const whatsappIo = new SocketIOServer(server, {
    path: "/whatsapp", // Define the socket path for WhatsApp
  });

  whatsappIo.on("connection", (socket) => {
    console.log("WhatsApp socket connected");

    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId);
    });

    socket.on("sendMessage", async (messageData, callback) => {
      try {
        // Ensure messageData contains conversationId among other required fields
        const message = await sendAndSaveMessage(messageData);
        // Use the initialized socket server instance (whatsappIo) for broadcasting
        whatsappIo.to(message.conversation.toString()).emit("newMessage", message);
        callback({ success: true });
      } catch (err) {
        callback({ success: false, error: err.message });
      }
    });
    

    socket.on("disconnect", () => {
      console.log("WhatsApp socket disconnected");
    });
  });

  return whatsappIo;
};
