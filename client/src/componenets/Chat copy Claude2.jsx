import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

function Chat() {
  const socketRef = useRef(null);
  const chatRef = useRef(null);

  const [roomId, setRoomId] = useState(null);
  const [preDefinedQuestions, setPreDefinedQuestions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showPredefined, setShowPredefined] = useState(false);
  const [isSupportRoomActive, setIsSupportRoomActive] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(5);
  const [supportRequested, setSupportRequested] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState(1);
  const [isConnected, setIsConnected] = useState(false);

  // hours for "Connect with Support" button
  const SUPPORT_HOURS = { start: 10, end: 18 };
  const [isActiveHours, setActiveHours] = useState(false);

  // — initialize socket & joinRoom
 // Replace the current useEffect for socket initialization with this updated version:

useEffect(() => {
  // persist a stable roomId
  let stored = localStorage.getItem("ViaCerta_User");
  if (!stored) {
    stored = uuidv4();
    localStorage.setItem("ViaCerta_User", stored);
  }
  setRoomId(stored);

  // Clean up any existing socket connection first
  if (socketRef.current) {
    socketRef.current.disconnect();
    socketRef.current = null;
  }

  // Socket initialization with proper error handling and reconnection
  const socket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:8000", {
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    autoConnect: true,
    transports: ["websocket", "polling"], // Try websocket first, fallback to polling
    withCredentials: true,
    timeout: 10000, // Increase timeout for initial connection
    forceNew: true  // Force a new connection each time
  });
  
  socketRef.current = socket;

  // Connection events
  socket.on("connect", () => {
    console.log("User Connected Socket id:", socket.id);
    setIsConnected(true);
    
    // Join the room once we're connected
    socket.emit("joinRoom", { roomId: stored });
    
    // Check for existing support room
    socket.emit("check_support_room", { roomId: stored });
  });

  socket.io.on("error", (error) => {
    console.error("Transport error:", error);
  });

  socket.on("connect_error", (error) => {
    console.error("Connection error:", error);
    setIsConnected(false);
  });

  socket.on("disconnect", (reason) => {
    console.log(`Socket disconnected. Reason: ${reason}`);
    setIsConnected(false);
    
    // If the server closed the connection, try to reconnect manually
    if (reason === "io server disconnect") {
      socket.connect();
    }
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log(`Reconnected after ${attemptNumber} attempts`);
    setIsConnected(true);
    
    // Re-establish room connection after reconnect
    socket.emit("joinRoom", { roomId: stored });
    socket.emit("check_support_room", { roomId: stored });
  });

  socket.on("reconnect_attempt", (attemptNumber) => {
    console.log(`Reconnection attempt ${attemptNumber}`);
  });

  socket.on("reconnect_error", (error) => {
    console.error("Reconnection error:", error);
  });

  socket.on("reconnect_failed", () => {
    console.error("Failed to reconnect after all attempts");
    // Consider showing a UI element to let the user manually retry
  });

  // Rest of your socket event handlers...
  // update connected-users badge if you ever show it
  socket.on("user_count_update", ({ count }) => {
    setConnectedUsers(count);
  });

  // FAQ snippet
  socket.on("predefined_questions", ({ questions }) => {
    if (Array.isArray(questions)) setPreDefinedQuestions(questions);
  });

  // new chat messages
  socket.on("new_message", (msg) => {
    setMessages((prev) =>
      prev.some((m) => m.timestamp === msg.timestamp && m.text === msg.text)
        ? prev
        : [...prev, msg]
    );
  });

  // direct bot replies
  socket.on("bot_message", (resp) => {
    setMessages((prev) => [
      ...prev,
      {
        text: resp.text,
        sender: "bot",
        followUp: resp.followUp || [],
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  });

  // Room state (if reconnecting)
  socket.on("support_room_state", ({ status, closeTime, messages: roomMessages }) => {
    if (status === "active") {
      setIsSupportRoomActive(true);
      setSupportRequested(true);
    }
    
    if (roomMessages && roomMessages.length > 0) {
      setMessages(roomMessages);
    }
  });

  // show the FAQ buttons after a short delay
  setTimeout(() => setShowPredefined(true), 1500);

  // support-hours toggle
  const nowH = new Date().getHours();
  setActiveHours(nowH >= SUPPORT_HOURS.start && nowH < SUPPORT_HOURS.end);

  return () => {
    console.log("Cleaning up socket connection");
    if (socket) {
      // Properly unsubscribe from all events before disconnecting
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("reconnect");
      socket.off("reconnect_attempt");
      socket.off("reconnect_error");
      socket.off("reconnect_failed");
      socket.off("user_count_update");
      socket.off("predefined_questions");
      socket.off("new_message");
      socket.off("bot_message");
      socket.off("support_room_state");
      
      socket.disconnect();
    }
  };
}, []); // Empty dependency array means this runs once on component mount

  // — watch for support-room closure
  useEffect(() => {
    if (!socketRef.current) return;
    
    const handleClosed = ({ roomId: closedId }) => {
      if (closedId === roomId) {
        setIsSupportRoomActive(false);
        setSupportRequested(false);
      }
    };

    socketRef.current.on("support_room_closed", handleClosed);

    return () => {
      if (socketRef.current) {
        socketRef.current.off("support_room_closed", handleClosed);
      }
    };
  }, [roomId]);

  // — check existing support-room status updates
  useEffect(() => {
    if (!socketRef.current || !roomId) return;
    
    const handleSupportStatus = ({ exists }) => {
      setIsSupportRoomActive(exists);
      setSupportRequested(exists);
    };
    
    socketRef.current.on("support_room_status", handleSupportStatus);
    
    return () => {
      if (socketRef.current) {
        socketRef.current.off("support_room_status", handleSupportStatus);
      }
    };
  }, [roomId]);

  // auto-scroll
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // — user clicks an FAQ button
  const handlePredefinedClick = (question) => {
    if (!isConnected) {
      console.log("Cannot send message: Socket not connected");
      return;
    }
    
    if (!isSupportRoomActive) {
      setMessages((prev) => [
        ...prev,
        {
          text: question,
          sender: "user",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      socketRef.current.emit("user_message", { message: question, roomId });
    }
  };

  // — when user types and sends
  const handleSend = () => {
    const txt = input.trim();
    if (!txt || !isConnected) return;

    if (!isSupportRoomActive) {
      setMessages((prev) => [
        ...prev,
        {
          text: txt,
          sender: "user",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }
    socketRef.current.emit("user_message", { message: txt, roomId });
    setUserMessageCount((c) => c + 1);
    setInput("");
  };

  const clearChat = () => {
    setMessages([]);
    setShowPredefined(false);
    setTimeout(() => setShowPredefined(true), 3500);
  };

  // — request live support
  const requestSupport = () => {
    if (!isConnected) return;
    
    setSupportRequested(true);
    socketRef.current.emit("request_support", { roomId });
  };
  
  const closeSupport = () => {
    if (!isConnected) return;
    
    socketRef.current.emit("cancel_support_request", { roomId });
    setSupportRequested(false);
    setTimeout(() => setShowPredefined(true), 3500);
  };

  return (
    <div className="flex flex-col h-[95vh] w-[60%] bg-gray-100 rounded-lg shadow-lg m-auto">
      {/* Header */}
      <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-t-lg">
        <h2 className="text-lg font-semibold">ViaCerta Bot</h2>
        <div className="flex items-center">
          <span className={`h-3 w-3 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-500'}`}></span>
          {messages.length >= 5 && (
            <button
              onClick={clearChat}
              className="text-sm bg-red-500 px-3 py-1 rounded hover:bg-red-600"
            >
              Clear Chat
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-white"
      >
        {/* Welcome */}
        {!isSupportRoomActive && (
          <div className="flex justify-start">
            <div className="max-w-xs bg-gray-200 px-4 py-2 rounded-lg shadow">
              🤖 Hello! How can I help you today?
            </div>
          </div>
        )}

        {/* Connection Status */}
        {!isConnected && (
          <div className="flex justify-center my-4">
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg">
              Connecting to server... Please wait.
            </div>
          </div>
        )}

        {/* FAQ buttons */}
        {!isSupportRoomActive && showPredefined && isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {preDefinedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handlePredefinedClick(q)}
                className="bg-blue-100 text-blue-900 px-5 py-3 rounded-xl shadow-md hover:bg-blue-200"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Chat bubbles */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.sender === "user" ? "justify-end " : "justify-start "
            }`}
          >
            <div
              className={`px-4 py-2 rounded-lg shadow 
              ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white"
                  : msg.sender === "support"
                  ? "bg-purple-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              <div className="flex items-left">
                <span className="mr-2">
                  {msg.sender === "bot"
                    ? "🤖"
                    : msg.sender === "user"
                    ? "🧑"
                    : "👩‍💻"}
                </span>
                <div dangerouslySetInnerHTML={{ __html: msg.text }} />
              </div>
              
              {msg.followUp && Array.isArray(msg.followUp) && msg.followUp.length > 0 && (
                <div className="mt-3 space-y-2">
                  {msg.followUp.map((q, i) => (
                    <button
                      key={i}
                      disabled={isSupportRoomActive || !isConnected}
                      onClick={() => handlePredefinedClick(q)}
                      className={`w-full text-left bg-green-600 text-white font-medium px-4 py-2 rounded-lg shadow-md hover:bg-green-700 active:bg-green-800 focus:ring-2 focus:ring-green-400 transition-all duration-300 ${
                        isSupportRoomActive || !isConnected
                          ? "cursor-not-allowed bg-gray-400"
                          : null
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
              
              <div className="text-xs opacity-70 mt-1 text-right">
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input & support CTA */}
      <div className="p-4 bg-gray-100 border-t border-gray-200 rounded-b-lg">
        <div className="flex space-x-2 mb-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={!isConnected}
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
          />
          <button
            onClick={handleSend}
            disabled={!isConnected}
            className={`text-white px-4 py-2 rounded-lg ${
              isConnected ? "bg-green-500 hover:bg-green-600" : "bg-gray-400"
            }`}
          >
            Send
          </button>
        </div>

        {isSupportRoomActive ? (
          <button
            onClick={closeSupport}
            disabled={!isConnected}
            className={`w-full text-white px-4 py-2 rounded-lg ${
              isConnected ? "bg-gray-700 hover:bg-gray-800" : "bg-gray-400"
            }`}
          >
            Close Support
          </button>
        ) : (
          userMessageCount >= 5 && (
            <button
              onClick={requestSupport}
              disabled={!isActiveHours || supportRequested || !isConnected}
              className={`w-full px-4 py-2 rounded-lg text-white 
              ${
                isActiveHours && isConnected && !supportRequested
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Connect with Support
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default Chat;