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

  // hours for “Connect with Support” button
  const SUPPORT_HOURS = { start: 10, end: 18 };
  const [isActiveHours, setActiveHours] = useState(false);

  // — initialize socket & joinRoom
  useEffect(() => {
    // persist a stable roomId
    let stored = localStorage.getItem("ViaCerta_User");
    if (!stored) {
      stored = uuidv4();
      localStorage.setItem("ViaCerta_User", stored);
    }
    setRoomId(stored);

    // <— change port here to match your server
    const socket = io("http://localhost:8000", { autoConnect: false });
    socketRef.current = socket;
    socket.connect();

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

    // join or re-join the room
    socket.emit("joinRoom", { roomId: stored });

    // show the FAQ buttons after a short delay
    setTimeout(() => setShowPredefined(true), 1500);

    // support-hours toggle
    const nowH = new Date().getHours();
    setActiveHours(nowH >= SUPPORT_HOURS.start && nowH < SUPPORT_HOURS.end);

    return () => {
      socket.disconnect();
    };
  }, []);

  // — watch for support-room closure
  useEffect(() => {
    const handleClosed = ({ roomId: closedId }) => {
      if (closedId === roomId) {
        setIsSupportRoomActive(false);
        setSupportRequested(false);
        localStorage.setItem("isViaCertaSupportRoomActive", "false");
      }
    };

    socketRef.current.on("support_room_closed", handleClosed);

    setTimeout(() => setShowPredefined(true), 3500);
    return () => {
      socketRef.current.off("support_room_closed", handleClosed);
    };
  }, [roomId]);

  // — check existing support-room on mount
  useEffect(() => {
    if (!roomId) return;
    const sock = socketRef.current;

    sock.emit("check_support_room", { roomId });
    const handler = ({ exists }) => setIsSupportRoomActive(exists);
    sock.on("support_room_status", handler);

    // persist flag across reloads
    const saved = localStorage.getItem("isViaCertaSupportRoomActive");
    if (saved !== null) setIsSupportRoomActive(saved === "true");

    return () => {
      sock.off("support_room_status", handler);
    };
  }, [roomId]);

  // persist active-room flag
  useEffect(() => {
    localStorage.setItem(
      "isViaCertaSupportRoomActive",
      String(isSupportRoomActive)
    );
  }, [isSupportRoomActive]);

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
    if (!txt) return;

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
    // setUserMessageCount(0);
    setShowPredefined(false);
    setTimeout(() => setShowPredefined(true), 3500);
  };

  // — request live support
  const requestSupport = () => {
    setSupportRequested(true);
    socketRef.current.emit("request_support", { roomId });
  };
  const closeSupport = () => {
    socketRef.current.emit("cancel_support_request", { roomId });
    setSupportRequested(false);
    setTimeout(() => setShowPredefined(true), 3500);
  };

  return (
    <div className="flex flex-col h-[95vh] w-[60%] bg-gray-100 rounded-lg shadow-lg m-auto">
      {/* Header */}
      <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-t-lg">
        <h2 className="text-lg font-semibold">ViaCerta Bot</h2>
        {messages.length >= 5 && (
          <button
            onClick={clearChat}
            className="text-sm bg-red-500 px-3 py-1 rounded hover:bg-red-600"
          >
            Clear Chat
          </button>
        )}
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

        {/* FAQ buttons */}
        {!isSupportRoomActive && showPredefined && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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
                <div className="flex items-left">
                  {msg.followUp && Array.isArray(msg.followUp) && (
                    <div className="mt-3 space-y-2">
                      {msg.followUp.map((q, i) => (
                        <button
                          key={i}
                          disabled={isSupportRoomActive}
                          onClick={() => handlePredefinedClick(q)}
                          className={`w-full text-left bg-green-600 text-white font-medium px-4 py-2 rounded-lg shadow-md hover:bg-green-700 active:bg-green-800 focus:ring-2 focus:ring-green-400 transition-all duration-300 ${
                            isSupportRoomActive
                              ? "cursor-not-allowed bg-gray-200 "
                              : null
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSend}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            Send
          </button>
        </div>

        {isSupportRoomActive ? (
          <button
            onClick={closeSupport}
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            Close Support
          </button>
        ) : (
          userMessageCount >= 5 && (
            <button
              onClick={requestSupport}
              // disabled={!isActiveHours || supportRequested}
              className={`w-full px-4 py-2 rounded-lg text-white 
              ${
                isActiveHours
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
