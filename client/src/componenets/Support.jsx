import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import { io } from "socket.io-client";

// Card to display each active room
const SupportRoomCard = memo(
  ({ roomId, handleJoinRoom, selectedRoom, socketRef }) => {
    const isActive = selectedRoom === roomId;

    return (
      <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Room: {roomId}</h3>
          {isActive && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
              Active
            </span>
          )}
        </div>

        <div className="mt-2 flex space-x-2">
          <button
            onClick={() => handleJoinRoom(roomId)}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
          >
            Join
          </button>
          <button
            onClick={() => {
              if (socketRef.current && window.confirm("Close this room?")) {
                socketRef.current.emit("close_support_room", { roomId });
              }
            }}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
          >
            Close
          </button>
        </div>
        <div></div>
      </div>
    );
  }
);

const Support = () => {
  const [activeRooms, setActiveRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Handle cleaning up a room when agent or user closes it
  const handleRoomClosed = useCallback(
    ({ roomId }) => {
      setActiveRooms((prev) => prev.filter((id) => id !== roomId));
      if (selectedRoom === roomId) {
        setSelectedRoom(null);
        setMessages([]);
      }
    },
    [selectedRoom]
  );

  // Initialize socket and room list
  useEffect(() => {
    const socket = io("http://localhost:8000");
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("get_active_support_rooms");
    });

    socket.on("active_support_rooms", (rooms) => {
      setActiveRooms(Array.isArray(rooms) ? rooms : []);
    });

    socket.on("new_support_room", (roomId) => {
      setActiveRooms((prev) =>
        prev.includes(roomId) ? prev : [...prev, roomId]
      );
    });

    return () => {
      socket.off("active_support_rooms");
      socket.off("new_support_room");

      socket.disconnect();
    };
  }, []);

  // Listen for messages and room closure in selected room // Per-room listeners
  useEffect(() => {
    if (!socketRef.current || !selectedRoom) return;
    const socket = socketRef.current;

    // Incoming chat messages
    const onMessage = (msg) => {
      if (msg.roomId === selectedRoom) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    const onBot = (msg) => {
      if (msg.roomId === selectedRoom) {
        setMessages((prev) => [
          ...prev,
          { ...msg, sender: "bot", timestamp: new Date().toLocaleTimeString() },
        ]);
      }
    };
    // const onCloseTime = ({ roomId, closeTime }) => {
    //   setCloseTimes((prev) => ({ ...prev, [roomId]: closeTime }));
    // }

    socket.on("new_message", onMessage);
    socket.on("bot_message", onBot);
    // socket.on("room_close_time", onCloseTime);
    socket.on("support_room_closed", handleRoomClosed);

    return () => {
      socket.off("new_message", onMessage);
      socket.off("bot_message", onBot);
      // socket.off("room_close_time", onCloseTime);
      socket.off("support_room_closed", handleRoomClosed);
    };
  }, [selectedRoom, handleRoomClosed]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Join a room as agent
  const handleJoinRoom = (roomId) => {
    if (socketRef.current) {
      socketRef.current.emit("join_user_room", { roomId });
      setSelectedRoom(roomId);
      setMessages([]);
    }
  };

  // Send support message
  const handleSend = () => {
    const text = input.trim();
    if (!text || !selectedRoom) return;
    socketRef.current.emit("support_message", {
      roomId: selectedRoom,
      message: text,
    });
    setInput("");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">
        Active Support Rooms ({activeRooms.length})
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {activeRooms.map((id) => (
          <SupportRoomCard
            key={id}
            roomId={id}
            handleJoinRoom={handleJoinRoom}
            selectedRoom={selectedRoom}
            socketRef={socketRef}
          />
        ))}
      </div>

      {selectedRoom && (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Room: {selectedRoom}</h2>

            <button
              onClick={() => setSelectedRoom(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="h-64 overflow-y-auto mb-4 p-2 bg-gray-50 rounded">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex mb-2 ${
                  msg.sender === "support" ? "justify-end" : "justify-start"
                }`}
              >
                <div className="mr-2 text-xl">
                  {msg.sender === "bot" && "🤖"}
                  {msg.sender === "user" && "🧑"}
                  {msg.sender === "support" && "👩‍💻"}
                </div>
                <div
                  className={`px-3 py-2 rounded-lg shadow-md max-w-xs ${
                    {
                      support: "bg-purple-500 text-white",
                      bot: "bg-gray-200 text-black",
                      user: "bg-blue-500 text-white",
                    }[msg.sender]
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs mt-1 opacity-70 text-right">
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex space-x-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSend}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
