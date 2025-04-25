import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
// import ReactMarkdown from "react-markdown";

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
  const SUPPORT_HOURS = { start: 10, end: 18 };
  const [isActiveHours, setActiveHours] = useState(false);

  const SafeHTML = ({ html }) => {
    return (
      <div className="text-right" dangerouslySetInnerHTML={{ __html: html }} />
    );
  };

  //

  // --- Carousel Component ---
  const Carousel = ({ items }) => {
    const carouselRef = useRef(null);

    // Auto scroll every 3 seconds
    useEffect(() => {
      const interval = setInterval(() => {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        if (scrollLeft + clientWidth >= scrollWidth) {
          // Instantly jump back to the start when reaching the end
          carouselRef.current.scrollTo({ left: 0, behavior: "auto" });
        } else {
          // Scroll to the next item
          carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
        }

        // if (carouselRef.current) {
        //   carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
        // }
      }, 3000);

      return () => clearInterval(interval);
    }, []);

    const scrollLeft = () => {
      if (carouselRef.current) {
        carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
      }
    };

    const scrollRight = () => {
      if (carouselRef.current) {
        carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
      }
    };

    return (
      <div className="relative">
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-gray-300 rounded-full p-2"
        >
          {"<"}
        </button>
        <div
          ref={carouselRef}
          className="flex overflow-x-auto space-x-4 p-2 snap-x snap-mandatory"
        >
          {items.map((student, index) => (
            <div
              key={index}
              className="min-w-[250px] p-4 border rounded-lg shadow-md snap-center"
            >
              <img
                src={student.imageUrl}
                alt={student.name}
                className="mx-auto rounded-full w-24 h-24 object-cover"
              />
              <h3 className="font-bold text-lg">{student.university}</h3>
              <p className="text-sm text-gray-600">{student.country}</p>
              <p className="text-sm">{student.description}</p>
            </div>
          ))}
        </div>
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-gray-300 rounded-full p-2"
        >
          {">"}
        </button>
      </div>
    );
  };
  //
  useEffect(() => {
    let storedUserId = localStorage.getItem("ViaCerta_User");

    if (!storedUserId) {
      storedUserId = uuidv4();
      localStorage.setItem("ViaCerta_User", storedUserId);
    }
    setRoomId(storedUserId);

    socketRef.current = io("http://localhost:8000", {
      autoConnect: false,
    });
    socketRef.current.connect();
    const socket = socketRef.current;

    socket.on("user_count_update", ({ count }) => {
      setConnectedUsers(count);
    });

    const handlePredefinedQuestions = ({ questions }) => {
      if (Array.isArray(questions)) {
        setPreDefinedQuestions(questions);
      }
    };

    socket.emit("joinRoom", { roomId: storedUserId });
    socket.on("predefined_questions", handlePredefinedQuestions);

    socket.on("new_message", (message) => {
      setMessages((prev) => {
        if (
          !prev.some(
            (m) => m.timestamp === message.timestamp && m.text === message.text
          )
        ) {
          return [...prev, message];
        }
        return prev;
      });
    });

    socket.on("bot_message", (response) => {
      const botMessage = {
        text: response.text,
        sender: "bot",
        followUp: response.followUp || [],
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, botMessage]);
    });

    setTimeout(() => {
      setShowPredefined(true);
    }, 1500);

    const currentHour = new Date().getHours();
    if (currentHour >= SUPPORT_HOURS.start && currentHour < SUPPORT_HOURS.end) {
      setActiveHours(true);
    } else {
      setActiveHours(false);
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [SUPPORT_HOURS.start, SUPPORT_HOURS.end]);
  //  this useEffect to handle support room closure events
  useEffect(() => {
    const handleSupportRoomClosed = (data) => {

      if (!roomId || data.roomId === roomId) {
      setIsSupportRoomActive(false);
      setSupportRequested(false);
      localStorage.setItem(
        "isViaCertaSupportRoomActive",
        JSON.stringify(false)
      );
    
    };
  }
    if (socketRef.current) {
      socketRef.current.on("support_room_closed", handleSupportRoomClosed);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("support_room_closed", handleSupportRoomClosed);
      }
    };
  }, [roomId]);

  useEffect(() => {
    if (roomId) {
      socketRef.current.emit("check_support_room", { roomId });

      socketRef.current.on("support_room_status", (status) => {
        setIsSupportRoomActive(status.exists);
      });
    }

    const storedStatus = JSON.parse(
      localStorage.getItem("isViaCertaSupportRoomActive")
    );
    if (storedStatus !== null) {
      setIsSupportRoomActive(storedStatus);
    }

    return () => {
      socketRef.current.off("support_room_status");
    };
  }, [roomId]);

  useEffect(() => {
    localStorage.setItem(
      "isViaCertaSupportRoomActive",
      JSON.stringify(isSupportRoomActive)
    );
  }, [isSupportRoomActive]);

  const isChatbotDisabled = isSupportRoomActive;

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handlePredefinedClick = async (question) => {
    if (question.toLowerCase().includes("successful student")) {
      const carouselMessage = await fetchSuccessStudents();

      // setMessages((prev) => [
      //   ...prev,
      //   {
      //     text: carouselMessage.text, // carousel HTML
      //     sender: "bot",
      //     type: carouselMessage.type,
      //     timestamp: new Date().toLocaleTimeString(),
      //   },
      // ]);

      setMessages((prev) => [
        ...prev,
        {
          type: "carousel",
          items: carouselMessage.items,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } else {
      const userMessage = {
        text: question,
        sender: "user",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setUserMessageCount((prev) => prev + 1);
      socketRef.current.emit("user_message", { message: question, roomId });
    }
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();

    // if (trimmedInput.toLowerCase().includes("success student")) {
    //   const carouselMessage = await fetchSuccessStudents();

    //   setMessages((prev) => [
    //     ...prev,
    //     {
    //       text: carouselMessage.text, // carousel HTML
    //       sender: "bot",
    //       type: carouselMessage.type,
    //       timestamp: new Date().toLocaleTimeString(),
    //     },
    //   ]);
    // }

    if (!trimmedInput) return;

    if (!isSupportRoomActive) {
      const userMessage = {
        text: trimmedInput,
        sender: "user",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, userMessage]);
    }

    setUserMessageCount((prev) => prev + 1);
    socketRef.current.emit("user_message", { message: trimmedInput, roomId });
    setInput("");
  };

  const clearChat = () => {
    setMessages([]);
    setUserMessageCount(0);
    setShowPredefined(false);

    setTimeout(() => {
      setShowPredefined(true);
    }, 3500);
  };

  const requestSupport = () => {
    setSupportRequested(true);
    if (!roomId) {
      alert("Room ID is missing. Please try again.");
      return;
    }

    socketRef.current.emit("request_support", { roomId });
  };

  const handleCloseSupport = () => {
    socketRef.current.emit("cancel_support_request", { roomId });
  };

  async function fetchSuccessStudents() {
    try {
      // const response = await fetch(
      //   "https://viacertaabroad.com/api/our_students"
      // );
      // const students = await response.json();
      const students = [
        {
          _id: "67cff97e37479f32d100b567",
          imageUrl:
            "https://media2.dev.to/dynamic/image/width=320,height=320,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F483102%2F6d940290-12d0-4c4a-8be9-1a9fc955d203.jpeg",
          name: "Kunal K.",
          university: "University of Huddersfield,UK",
          country: "UK",
          scholarship: "£6000 Scholarship",
          description:
            "Securing a £6000 scholarship from the University of Huddersfield was a huge milestone for me. It’s a recognition of my hard work & dedication, & it has made my dream of studying abroad even more achievable. I am excited to be part of the 2024 batch, & the scholarship has eased my financial concerns. I am truly thankful to ViaCerta Abroad for making this opportunity possible & look forward to enhancing my knowledge & skills in the UK.",
          __v: 0,
          createdAt: "2025-03-11T08:51:10.122Z",
          updatedAt: "2025-03-11T08:51:10.122Z",
        },
        {
          _id: "67cff97e37479f32d100b56a",
          name: "Rohit Saini",
          imageUrl:
            "https://media2.dev.to/dynamic/image/width=320,height=320,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F483102%2F6d940290-12d0-4c4a-8be9-1a9fc955d203.jpeg",
          university: "Paris, France",
          country: "France",
          scholarship: "Fully Sponsored Course",
          description:
            "I was fortunate to be awarded a fully sponsored course in Paris, an incredible opportunity that opened doors for my academic & professional future. Studying in a city full of innovation & inspiration has been amazing, & ViaCerta Abroad’s support made it all possible. I’m beyond excited to be here, learning & growing, & I am thankful to ViaCerta Abroad for making this dream come true.",
          __v: 0,
          createdAt: "2025-03-11T08:51:10.122Z",
          updatedAt: "2025-03-11T08:51:10.122Z",
        },
        {
          _id: "67cff97e37479f32d100b568",
          name: "Pankaj Patil",
          imageUrl:
            "https://media2.dev.to/dynamic/image/width=320,height=320,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F483102%2F6d940290-12d0-4c4a-8be9-1a9fc955d203.jpeg",
          university: "ESSEC Business School, Paris, France",
          country: "France",
          scholarship: "70% Scholarship",
          description:
            "My experience at ESSEC Business School in Paris has been amazing. With a 70% scholarship for my Masters in Data Science, I’ve been able to focus entirely on my studies without financial worries. Paris is a great place to grow academically, & ViaCerta Abroad has been instrumental in securing this opportunity. I’m grateful for their support & excited to keep pushing toward my career goals.",
          __v: 0,
          createdAt: "2025-03-11T08:51:10.122Z",
          updatedAt: "2025-03-11T08:51:10.122Z",
        },
        {
          _id: "67cff97e37479f32d100b569",
          name: "Mhd. Mikail Shafique",
          imageUrl:
            "https://media2.dev.to/dynamic/image/width=320,height=320,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F483102%2F6d940290-12d0-4c4a-8be9-1a9fc955d203.jpeg",
          university: "Stevens Institute of Technology, USA",
          country: "USA",
          scholarship: "50% Scholarship",
          description:
            "I feel incredibly fortunate to have received a 50% scholarship to pursue my studies at Stevens Institute of Technology in the USA. This scholarship has eased my financial stress, & I’m grateful for the chance to study at such a prestigious institution. I owe a big thanks to ViaCerta Abroad for helping me secure this opportunity, & I look forward to building a successful career in tech.",
          __v: 0,
          createdAt: "2025-03-11T08:51:10.122Z",
          updatedAt: "2025-03-11T08:51:10.122Z",
        },
        {
          _id: "67cff97e37479f32d100b566",
          name: "Nitin Chauhan",
          imageUrl:
            "https://media2.dev.to/dynamic/image/width=320,height=320,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F483102%2F6d940290-12d0-4c4a-8be9-1a9fc955d203.jpeg",
          university: "University of Chester,UK",
          country: "UK",
          scholarship: "Fully Funded",
          description:
            "I am extremely grateful for the opportunity to pursue my Masters in Medicine (General) at the University of Chester. The fully funded scholarship I received has been life-changing, alleviating my financial burden & allowing me to focus on my studies & personal growth. This journey was made possible thanks to the exceptional support from ViaCerta Abroad, & I can’t wait to continue my academic & professional journey in medicine.",
          __v: 0,
          createdAt: "2025-03-11T08:51:10.121Z",
          updatedAt: "2025-03-11T08:51:10.121Z",
        },
      ];

      const carouselItems = students
        .map(
          (student) => `
          <div class="min-w-[250px] p-4 border rounded-lg shadow-md snap-center">
            <img src="${student.imageUrl}" alt="${student.name}" class="mx-auto rounded-full w-24 h-24 object-cover">
            <h3 class="font-bold text-lg">${student.university}</h3>
            <p class="text-sm text-gray-600">${student.country}</p>
            <p class="text-sm">${student.description}</p>
          </div>
        `
        )
        .join("");

      return {
        type: "carousel",
        items: students,
        // text: `
        //   <div class="flex overflow-x-auto space-x-4 p-2 snap-x snap-mandatory">
        //     ${carouselItems}
        //   </div>
        // `,
      };
    } catch (error) {
      console.error("Error fetching success students:", error);
      return {
        type: "text",
        text: "Failed to load success student data.",
      };
    }
  }

  return (
    <div className="flex flex-col  h-[95vh] w-[60%] bg-gray-100 rounded-lg shadow-lg m-auto">
      {/* Header */}
      <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-t-lg">
        <h2 className="text-lg font-semibold">ViaCerta Bot</h2>

        {messages.length >= 5 && (
          <button
            className="text-sm bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition duration-200"
            onClick={clearChat}
          >
            Clear Chat
          </button>
        )}

        {/* <span className="text-sm bg-green-600 px-2 py-1 rounded">
          👥 {connectedUsers}
        </span> */}
      </div>

      {/* Chat messages container */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-white"
      >
        {/* Welcome message */}
        {!isSupportRoomActive && (
          <div className="flex justify-start">
            <div className="max-w-xs bg-gray-200 text-gray-800 px-4 py-2 rounded-lg shadow">
              🤖 Hello! How can I help you today?
            </div>
          </div>
        )}

        {/* Predefined questions */}
        {!isChatbotDisabled && preDefinedQuestions.length > 0 && (
          // <div className="space-y-2">
          //   {preDefinedQuestions.map((q, index) => (
          //     <button
          //       key={index}
          //       onClick={() => handlePredefinedClick(q)}
          //       className="block w-full text-left bg-blue-200 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-300 transition duration-200"
          //     >
          //       {q}
          //     </button>
          //   ))}
          // </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {showPredefined &&
              preDefinedQuestions.map((q, index) => (
                <button
                  key={index}
                  onClick={() => handlePredefinedClick(q)}
                  className="w-full text-left bg-blue-100 text-blue-900 font-medium px-5 py-3 rounded-xl shadow-md hover:bg-blue-200 active:bg-blue-300 focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                >
                  {q}
                </button>
              ))}
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, index) => {
          if (msg.type === "carousel") {
            return (
              <div key={index} className="flex justify-start">
                <div className="max-w-full">
                  {/* <div dangerouslySetInnerHTML={{ __html: msg.text }} /> */}
                  <Carousel items={msg.items} />
                  <p className="text-xs mt-1 opacity-70 pt-2 text-left">
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            );
          } else
            return (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start max-w-xs px-4 py-2 rounded-lg shadow ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white flex-row-reverse"
                      : msg.sender === "support"
                      ? "bg-purple-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {/* Emoji */}
                  <div className="mr-2">
                    {msg.sender === "bot" && "🤖"}
                    {msg.sender === "user" && "🧑"}
                    {msg.sender === "support" && "👩‍💻"}
                  </div>

                  {/* Message text */}
                  <div>
                    {/* <ReactMarkdown>{msg.text}</ReactMarkdown> */}
                    <SafeHTML html={msg.text} />
                    {/* {msg.followUp && Array.isArray(msg.followUp) && (
                    <div className="mt-2">
                      {msg.followUp.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => handlePredefinedClick(q)}
                          className="block w-full text-left bg-lime-800 text-white px-3 py-1 rounded mb-1 hover:bg-teal-700 transition duration-200"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )} */}

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

                    <p
                      className={`text-xs mt-1 opacity-70 pt-2 ${
                        msg.sender === "user" ? " text-right  " : "text-left"
                      }`}
                    >
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            );
        })}
      </div>

      {/* Input area */}
      <div className="p-4 bg-gray-100 border-t border-gray-200 rounded-b-lg">
        <div className="flex space-x-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSend}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200"
          >
            Send
          </button>
        </div>

        {/* Support buttons */}
        {isSupportRoomActive ? (
          <button
            onClick={handleCloseSupport}
            className="w-full mt-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition duration-200"
          >
            Close Support
          </button>
        ) : (
          userMessageCount >= 5 && (
            <button
              onClick={requestSupport}
              disabled={!isActiveHours || supportRequested}
              title="Live support available from 10 AM to 6 PM"
              className={`w-full mt-2 px-4 py-2 rounded-lg transition duration-200 
                bg-orange-500 text-white hover:bg-orange-600 
                ${isActiveHours ? "" : "opacity-50 cursor-not-allowed"}`}
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
