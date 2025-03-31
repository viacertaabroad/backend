import { Server } from "socket.io";
import faqData from "./faqData.js";
import SupportRoom from "./models/supportRoom.js";
import { sendNewRoomNotification } from "./utils/sseNotification.js";
import getAIResponse from "./utils/aiModel.js";

const SUPPORT_HOURS = { start: 10, end: 18 };
const userRooms = new Map();
const activeSupportRooms = new Set();
//
const activityTimers = new Map();
const warningTimers = new Map();
const lastActivityMap = new Map();
const roomUsers = new Map(); // Track connected users per room

//
const conversationContexts = new Map();

function getConversationContext(roomId) {
  return conversationContexts.get(roomId) || {};
}

function updateContext(roomId, newContext) {
  conversationContexts.set(roomId, {
    ...getConversationContext(roomId),
    ...newContext,
  });
}

//

const socketFn = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  const handleRoomCleanup = async (roomId) => {
    try {
      const room = await SupportRoom.findOne({ roomId });
      if (!room) return;

      // Check if room should be closed (either waiting expired or active with no activity)
      const shouldClose =
        (room.status === "waiting" && room.closingAt <= new Date()) ||
        (room.status === "active" &&
          Date.now() - room.lastActivity.getTime() >= 300000);

      if (shouldClose) {
        // io.to(roomId).emit("bot_message", {
        //   text: "Support Room is Closed. Please try again later.",
        //   sender: "bot",
        //   roomId,
        // }); //not check this
        roomUsers.delete(roomId);
        await SupportRoom.deleteOne({ roomId });
        io.to(roomId).emit("support_room_closed", { roomId });
        // io.emit("active_support_rooms", await SupportRoom.find());
        io.emit(
          "active_support_rooms",
          await SupportRoom.find({
            status: { $in: ["active", "waiting"] },
          })
        );
        // Clear timers
        clearTimeout(activityTimers.get(roomId));
        clearTimeout(warningTimers.get(roomId));
        activityTimers.delete(roomId);
        warningTimers.delete(roomId);
        lastActivityMap.delete(roomId);
        activeSupportRooms.delete(roomId);
      }
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  };

  const updateRoomActivity = async (roomId) => {
    const room = await SupportRoom.findOne({ roomId });
    if (!room) return;

    const now = Date.now();
    lastActivityMap.set(roomId, now);

    // Clear existing timers
    clearTimeout(activityTimers.get(roomId));
    clearTimeout(warningTimers.get(roomId));

    // Update database with new activity time
    try {
      await SupportRoom.updateOne(
        { roomId },
        {
          lastActivity: new Date(now),
          closingAt: new Date(now + 300000), // Reset to 5 minutes from now
        }
      );
    } catch (error) {
      console.error("Error updating room activity:", error);
    }

    // Only set timers for active rooms
    if (room.status === "active") {
      // Set warning timer (4 minutes)
      warningTimers.set(
        roomId,
        setTimeout(() => {
          io.to(roomId).emit("bot_message", {
            text: "Room will close in 1 minute due to inactivity",
            sender: "bot",
            roomId,
          });
        }, 240000)
      );

      // Set cleanup timer (5 minutes)
      activityTimers.set(
        roomId,
        setTimeout(() => handleRoomCleanup(roomId), 300000)
      );
    }
  };

  io.on("connection", (socket) => {
    console.log(`✅ New user connected: ${socket.id}`);
    // ____________________________________________________
    socket.on("joinRoom", async ({ roomId }) => {
      //
      if (!roomUsers.has(roomId)) {
        roomUsers.set(roomId, new Set());
      }
      roomUsers.get(roomId).add(socket.id);
      // Emit user count update
      io.to(roomId).emit("user_count_update", {
        count: roomUsers.get(roomId).size,
      });
      //

      userRooms.set(socket.id, roomId);
      socket.join(roomId);
      console.log(`🔵 User ${socket.id} joined room: ${roomId}`);

      const room = await SupportRoom.findOne({ roomId });
      if (room) {
        socket.emit("bot_message", {
          text: "You have an active support request. Please wait for an agent to join.",
          sender: "bot",
          roomId,
        });
        await updateRoomActivity(roomId);
      } else {
        setTimeout(() => {
          socket.emit("predefined_questions", {
            questions: faqData.questions.slice(0, 4).map((q) => q.question),
          });
        }, 2000);
      }
    });

    socket.on("user_message", async ({ message, roomId }) => {
      const room = await SupportRoom.findOne({ roomId });

      if (room) {
        // await updateRoomActivity(roomId);
        if (room?.status === "active") {
          await updateRoomActivity(roomId);
        }

        const userMessage = {
          text: message,
          sender: "user",
          timestamp: new Date().toLocaleTimeString(),
          roomId,
        };
        io.to(roomId).emit("new_message", userMessage);
        // ///////
        // socket.emit("bot_message", {
        //   text: "Chatbot responses are disabled while you have an active support request.",
        //   sender: "bot",
        //   roomId,
        // });
        return;
      }

      const lowerMessage = message.toLowerCase();
      const matchedFaq = faqData.questions.find(
        (q) => lowerMessage === q.question.toLowerCase()
      );
      if (matchedFaq) {
        const botResponse = {
          text: matchedFaq.answer,
          sender: "bot",
          followUp: matchedFaq.followUp || [],
        };
        setTimeout(() => {
          io.to(roomId).emit("bot_message", { ...botResponse, roomId });
        }, 1000);
      } else {
        //
        // try {
        //   const context = getConversationContext(roomId);
        //   const response = await getAIResponse(message, context);

        //   // Update conversation context
        //   updateContext(roomId, {
        //     lastQuery: message,
        //     pendingFollowUp: response.followUp?.[0],
        //   });

        //   const botResponse = {
        //     text: response.text,
        //     sender: "bot",
        //     followUp: response.followUp || [],
        //     roomId,
        //   };

        //   io.to(roomId).emit("bot_message", botResponse);
        // } catch (error) {
        //   console.error("Chat error:", error);
        //   io.to(roomId).emit("bot_message", {
        //     text: "We're experiencing high demand. Please try again shortly.",
        //     sender: "bot",
        //     roomId,
        //   });
        // }

        // const aiResponse = await getAIResponse(message);
        const aiResponse = "Try again later.";

        const botResponse = {
          text: aiResponse,
          sender: "bot",
          followUp: aiResponse.followUp || [],
          roomId,
        };
        setTimeout(() => {
          io.to(roomId).emit("bot_message", { ...botResponse, roomId });
        }, 1000);
      }
    });

    // socket.on("request_support", async ({ roomId }) => {
    //   try {
    //     const existingRoom = await SupportRoom.findOne({ roomId });
    //     if (existingRoom) {
    //       socket.emit("bot_message", {
    //         text: "You have already requested support. Please wait for an agent to join.",
    //         sender: "bot",
    //         roomId,
    //       });
    //       return;
    //     }
    //     socket.emit("support_room_status", { exists: true }); //check this later

    //     const currentHour = new Date().getHours();
    //     if (
    //       currentHour >= SUPPORT_HOURS.start &&
    //       currentHour < SUPPORT_HOURS.end
    //     ) {
    //       const newRoom = new SupportRoom({
    //         roomId,
    //         status: "waiting",
    //         closingAt: new Date(Date.now() + 5 * 60 * 1000),
    //       });

    //       await newRoom.save();
    //       sendNewRoomNotification(roomId);
    //       activeSupportRooms.add(roomId);
    //       await updateRoomActivity(roomId);

    //       io.emit("new_support_room", newRoom);
    //       io.to(roomId).emit("bot_message", {
    //         text: "A support agent will join soon. Please do not refresh this page. Chatbot responses will be disabled.",
    //         sender: "bot",
    //         roomId,
    //       });

    //       //
    //       io.emit("support_request", { roomId });

    //       // Set initial timeout for no-agent-joining scenario
    //       // const timer = setTimeout(async () => {
    //       //   const room = await SupportRoom.findOne({ roomId });
    //       //   if (room && room.status === "waiting") {
    //       //     await handleRoomCleanup(roomId);
    //       //   }
    //       // }, 5 * 60 * 1000);

    //       // activityTimers.set(roomId, timer);
    //       //

    //       //
    //       // supportRoomEmitter.emit('new_support_room',newRoom)
    //       //

    //       setTimeout(async () => {
    //         const room = await SupportRoom.findOne({ roomId });
    //         if (room && room.status === "active") {
    //           await SupportRoom.deleteOne({ roomId });
    //           io.to(roomId).emit("support_room_closed", { roomId });
    //           io.to(roomId).emit("bot_message", {
    //             text: "No support agent joined within 5 minutes. Please try again later.",
    //             sender: "bot",
    //             roomId,
    //           });
    //           activeSupportRooms.delete(roomId);
    //         }
    //       }, 5 * 60 * 1000); // 5 minutes
    //     } else {
    //       io.to(roomId).emit("bot_message", {
    //         text: "Live support is available from 10 AM to 6 PM. Please try again later.",
    //         sender: "bot",
    //         roomId,
    //       });
    //     }
    //   } catch (error) {
    //     console.error("Error handling support request:", error);
    //   }
    // });

    socket.on("request_support", async ({ roomId }) => {
      try {
        const existingRoom = await SupportRoom.findOne({ roomId });
        if (existingRoom) {
          socket.emit("bot_message", {
            text: "You have already requested support. Please wait for an agent to join.",
            sender: "bot",
            roomId,
          });
          return;
        }
        socket.emit("support_room_status", { exists: true }); //check this later

        const currentHour = new Date().getHours();
        if (
          currentHour >= SUPPORT_HOURS.start &&
          currentHour < SUPPORT_HOURS.end
        ) {
          const newRoom = new SupportRoom({
            roomId,
            status: "waiting",
            closingAt: new Date(Date.now() + 300000),
          });

          await newRoom.save();
          sendNewRoomNotification(roomId);
          activeSupportRooms.add(roomId);
          await updateRoomActivity(roomId);

          io.emit("new_support_room", newRoom);
          io.to(roomId).emit("bot_message", {
            text: "A support agent will join soon. Please do not refresh this page. ChatBot Responses are now off.",
            sender: "bot",
            roomId,
          });

          // Set timeout only for waiting status
          activityTimers.set(
            roomId,
            setTimeout(async () => {
              const room = await SupportRoom.findOne({ roomId });
              if (room?.status === "waiting") {
                io.to(roomId).emit("bot_message", {
                  text: "No support agent joined within 5 minutes. Please try again later.",
                  sender: "bot",
                  roomId,
                });
                await handleRoomCleanup(roomId);
              }
            }, 300000)
          );
        } else {
          io.to(roomId).emit("bot_message", {
            text: "Live support is available from 10 AM to 6 PM. Please try again later.",
            sender: "bot",
            roomId,
          });
        }
      } catch (error) {
        console.error("Error handling support request:", error);
      }
    });
    //from user side
    // socket.on("cancel_support_request", async ({ roomId }) => {
    //   try {
    //     const room = await SupportRoom.findOne({ roomId });
    //     if (room) {
    //       await SupportRoom.deleteOne({ roomId });
    //       activeSupportRooms.delete(roomId);
    //       await handleRoomCleanup(roomId);
    //       // io.emit("support_room_closed", { roomId });
    //       io.to(roomId).emit("support_room_closed");
    //       // Send updated room list to admin clients
    //       // io.emit(
    //       //   "active_support_rooms",
    //       //   await SupportRoom.find({ status: "active" })
    //       // );
    //       io.emit(
    //         "active_support_rooms",
    //         await SupportRoom.find({ status: { $in: ["active", "waiting"] } })
    //       );
    //       io.to(roomId).emit("bot_message", {
    //         text: "Support request has been closed.",
    //         sender: "bot",
    //         roomId,
    //       });
    //       socket.emit("support_room_status", { exists: false });
    //     }
    //   } catch (error) {
    //     console.error("Error closing support request:", error);
    //   }
    // });

    socket.on("cancel_support_request", async (data) => {
      try {
        // Add parameter validation
        if (!data || !data.roomId) {
          console.error("cancel_support_request called without roomId");
          return;
        }

        const { roomId } = data;
        const room = await SupportRoom.findOne({ roomId });

        if (room) {
          await SupportRoom.deleteOne({ roomId });
          activeSupportRooms.delete(roomId);
          await handleRoomCleanup(roomId);

          // Include roomId in the emission
          io.to(roomId).emit("support_room_closed", { roomId });

          // Update room list for admin
          io.emit(
            "active_support_rooms",
            await SupportRoom.find({ status: { $in: ["active", "waiting"] } })
          );

          // Notify user
          io.to(roomId).emit("bot_message", {
            text: "Support request has been closed.",
            sender: "bot",
            roomId,
          });

          socket.emit("support_room_status", { exists: false });
        }
      } catch (error) {
        console.error("Error closing support request:", error);
      }
    });

    socket.on("check_support_room", async ({ roomId }) => {
      try {
        const room = await SupportRoom.findOne({ roomId });
        socket.emit("support_room_status", { exists: !!room });
      } catch (error) {
        console.error("Error checking support room:", error);
      }
    });
    // --- admin side
    socket.on("get_active_support_rooms", async () => {
      try {
        const rooms = await SupportRoom.find({
          status: { $in: ["active", "waiting"] },
        });

        socket.emit("active_support_rooms", rooms);
      } catch (error) {
        console.error("Error fetching active support rooms:", error);
      }
    });

    // socket.on("join_support_room", async ({ roomId }) => {
    //   try {
    //     const room = await SupportRoom.findOne({ roomId });
    //     if (room) {
    //       socket.join(roomId);
    //       socket.emit("joined_support_room", { roomId });
    //       io.to(roomId).emit("new_message", {
    //         text: "Support team has joined the chat.",
    //         sender: "bot",
    //         timestamp: new Date().toLocaleTimeString(),
    //       });
    //     }
    //   } catch (error) {
    //     console.error("Error joining support room:", error);
    //   }
    // });
    socket.on("close_support_room", async ({ roomId }) => {
      try {
        await SupportRoom.deleteOne({ roomId });
        await handleRoomCleanup(roomId);
        io.to(roomId).emit("support_room_closed", { roomId });
        // io.emit(
        //   "active_support_rooms",
        //   await SupportRoom.find({ status: "active" })
        // );
        // In close_support_room event
        io.emit(
          "active_support_rooms",
          await SupportRoom.find({ status: { $in: ["active", "waiting"] } })
        );

        io.to(roomId).emit("new_message", {
          text: "Support request has been closed.",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
        });
      } catch (error) {
        console.error("Error closing support room:", error);
      }
    });

    // socket.on("close_support_room", async (data) => {
    //   try {
    //     // Validate input
    //     if (!data || typeof data !== 'object') {
    //       console.error('Invalid data received for close_support_room:', data);
    //       return;
    //     }

    //     const { roomId } = data;

    //     if (!roomId) {
    //       console.error('Missing roomId in close_support_room');
    //       return;
    //     }

    //     console.log(`Attempting to close room ${roomId}`); // Debug log

    //     const room = await SupportRoom.findOne({ roomId });
    //     if (!room) {
    //       console.log(`Room ${roomId} not found - may already be closed`);
    //       return;
    //     }

    //     await SupportRoom.deleteOne({ roomId });
    //     await handleRoomCleanup(roomId);

    //     // Notify all clients in the room
    //     io.to(roomId).emit("support_room_closed", { roomId });

    //     // Update all clients with current room list
    //     io.emit(
    //       "active_support_rooms",
    //       await SupportRoom.find({ status: { $in: ["active", "waiting"] } })
    //     );

    //     // Send closing message to room
    //     io.to(roomId).emit("new_message", {
    //       text: "Support request has been closed by the support team.",
    //       sender: "bot",
    //       timestamp: new Date().toLocaleTimeString(),
    //     });

    //     console.log(`Successfully closed room ${roomId}`); // Debug log
    //   } catch (error) {
    //     console.error("Error closing support room:", error);
    //   }
    // });

    socket.on("support_message", async ({ roomId, message }) => {
      await updateRoomActivity(roomId);
      const supportMessage = {
        text: message,
        sender: "support",
        timestamp: new Date().toLocaleTimeString(),
        roomId,
      };
      io.to(roomId).emit("new_message", supportMessage);
    });
    // ------
    // socket.on("join_user_room", ({ roomId }) => {
    //   console.log(`🔵 Support User ${socket.id} joined room: ${roomId}`);

    //   // if (!activeSupportRooms.has(roomId)) {
    //     activeSupportRooms.add(roomId);
    //   // }

    //   socket.join(roomId);
    //   io.to(roomId).emit("bot_message", {
    //     text: `A support agent has joined the chat Room id : ${roomId} . How can I assist you?`,
    //     sender: "bot",
    //     roomId,
    //   });
    //   io.emit("active_support_rooms", Array.from(activeSupportRooms));
    //   // Log the room joining event
    //   console.log(`✅ Support User ${socket.id} successfully joined room: ${roomId}`);
    // });
    // In your socket.io server code
    socket.on("join_user_room", async ({ roomId }) => {
      console.log(`🔵 Support User ${socket.id} joined room: ${roomId}`);

      try {
        const room = await SupportRoom.findOneAndUpdate(
          { roomId },
          {
            status: "active",
            lastActivity: new Date(),
            closingAt: new Date(Date.now() + 300000), // Reset to 5 minutes from now
          },
          { new: true } // Return updated document
        );

        // const room = await SupportRoom.findOne({ roomId });
        if (!room) {
          console.log(`Room ${roomId} not found in database`);
          io.emit("support_room_closed", { roomId });
          return;
        }

        socket.join(roomId);
        // io.emit(
        //   "active_support_rooms",
        //   // await SupportRoom.find({ status: "active" })
        //   await SupportRoom.find()
        // );
        // In join_user_room event
        io.emit(
          "active_support_rooms",
          await SupportRoom.find({ status: { $in: ["active", "waiting"] } })
        );
        // Clear any existing timers and set new ones for active room
        clearTimeout(activityTimers.get(roomId));
        clearTimeout(warningTimers.get(roomId));
        await updateRoomActivity(roomId);

        io.to(roomId).emit("bot_message", {
          text: `Support agent has joined the chat (Room ID: ${roomId})`,
          sender: "bot",
          roomId,
        });
      } catch (error) {
        console.error("Error joining room:", error);
      }
    });

    // ____________________________________________________

    socket.on("disconnect", () => {
      const roomId = userRooms.get(socket.id);
      console.log(`❌ User ${socket.id} disconnected from room: ${roomId}`);

      if (roomId && roomUsers.has(roomId)) {
        roomUsers.get(roomId).delete(socket.id);
        io.to(roomId).emit("user_count_update", {
          count: roomUsers.get(roomId).size,
        });
      }
      // Cleanup server-side resources
      // if (roomId) {
      //   activeSupportRooms.delete(roomId);
      //   // SupportRoom.deleteOne({ roomId }).catch(console.error);
      //   // io.emit("active_support_rooms", Array.from(activeSupportRooms));
      // }

      userRooms.delete(socket.id);
    });

    // -----------------------------------------------------
  });
  return io;
};

export default socketFn;
