import { useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
export default function Home() {
  const navigate = useNavigate();

  //   Central message handler notification
  const handleMessage = useCallback(
    (data) => {
      switch (data.type) {
        case "NEW_TICKET":
          return toast(`${data.message}`);
        case "NEW_USER_MESSAGE":
          return toast(`${data.message}, ${data.userMessage}`);
        case "NEW_ADMIN_MESSAGE":
          return toast(`${data.message}, ${data.adminMessage}`);
        case "TICKET_STATUS_UPDATE":
          return toast(`${data.message}`);
        case "CONNECTED":
          return console.log(data.message);
        case "ROOM_CREATED":
          return toast(
            <div>
              <div>{data.message}</div>
              <div
                style={{
                  fontWeight: "bold",
                  color: "#1976d2",
                  cursor: "pointer",
                }}
                onClick={() => navigate(data.redirectUrl)}
              >
                {data.clickableMessage || "Open"}
              </div>
            </div>,
            { closeOnClick: true }
          );
        default:
          console.warn("⚠️ Unknown SSE check dataType.");
      }
    },
    [navigate]
  );

  useEffect(() => {
    // const eventSource = new EventSource(
    //   "http://localhost:8000/api/tickets/events"
    // );
    const eventSource = new EventSource("http://localhost:8000/events", {
      withCredentials: true,
    });

    eventSource.onopen = () => {
      console.log("✅ SSE connection opened");
    };

    eventSource.onmessage = (event) => {
      try {
        if (!event.data.startsWith("{")) {
          console.log(
            "📨 Ignoring non-JSON message in SSE Events :",
            event.data
          );
          return;
        }

        const data = JSON.parse(event.data);

        console.log("📩 SSE data received:", data);

        handleMessage(data);
      } catch (err) {
        console.error("❌ Error parsing SSE data:", err);
      }
    };

    eventSource.onerror = (error) => {
      console.error("❌ SSE connection error:", error);
    };

    return () => {
      eventSource.close();
      console.log("🛑 SSE connection closed");
    };
  }, [handleMessage]);

  return (
    <div className="home">
      <h1>Home App</h1>
      <div>
        <Link to="/chat">Chat</Link>
        <br />
        <Link to="/support">Support</Link>
      </div>

      <hr />
      <div className="login-buttons">
        <a href="/login" className="login-button google">
          Login with Google Page
        </a>
      </div>
      <Link to="/xss">go to : Xss Page</Link>
    </div>
  );
}

// components/Home.jsx
// import { useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";

// export default function Home() {
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Only establish SSE connection if the user is authenticated
//     const token = localStorage.getItem("token");

//     if (!token) {
//       console.warn("No authentication token found. Skipping SSE connection.");
//       return;
//     }

//     // Use the unified SSE endpoint URL
//     const eventSource = new EventSource(
//       "http://localhost:8000/api/tickets/events",
//       { withCredentials: true }
//     );
//     // const eventSource = new EventSource("http://localhost:8000/events", {
//       // withCredentials: true,
//     // });

//     eventSource.onopen = () => {
//       console.log("SSE connection opened");
//     };

//     eventSource.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);
//         // Handle different notification types
//         switch (data.type) {
//           case "NEW_MESSAGE":
//             toast(
//               <div>
//                 <div>{data.message}</div>
//                 <div
//                   style={{
//                     fontWeight: "bold",
//                     color: "#1976d2",
//                     cursor: "pointer",
//                   }}
//                   onClick={() => navigate(data.redirectUrl)}
//                 >
//                   {data.clickableMessage}
//                 </div>
//                 {data.data && data.data.ticket && (
//                   <div style={{ fontSize: "0.8rem", marginTop: "4px" }}>
//                     Ticket: {data.data.ticket.title}
//                   </div>
//                 )}
//               </div>,
//               {
//                 closeOnClick: false,
//                 autoClose: 5000,
//                 position: "bottom-right",
//               }
//             );
//             break;

//           case "STATUS_CHANGE":
//             toast(
//               <div>
//                 <div>{data.message}</div>
//                 <div
//                   style={{
//                     fontWeight: "bold",
//                     color:
//                       data.data.ticket.status === "resolved"
//                         ? "#4CAF50"
//                         : "#1976d2",
//                     cursor: "pointer",
//                   }}
//                   onClick={() => navigate(data.redirectUrl)}
//                 >
//                   {data.clickableMessage}
//                 </div>
//                 {data.data && data.data.ticket && (
//                   <div style={{ fontSize: "0.8rem", marginTop: "4px" }}>
//                     Status changed to: {data.data.ticket.status}
//                   </div>
//                 )}
//               </div>,
//               {
//                 closeOnClick: false,
//                 autoClose: 5000,
//                 position: "bottom-right",
//               }
//             );
//             break;

//           default:
//             toast(data.message || "New notification");
//         }
//       } catch (error) {
//         console.error("Error parsing SSE data:", error);
//       }
//     };

//     eventSource.onerror = (error) => {
//       console.error("SSE error:", error);
//       eventSource.close();
//       // Optionally implement reconnection logic with backoff here
//       setTimeout(() => {
//         // Example: Reconnect after 5 seconds
//         // (Consider implementing exponential backoff in production)
//       }, 5000);
//     };

//     return () => {
//       eventSource.close();
//     };
//   }, [navigate]);

//   return (
//     <div className="home">
//       <h1>Home App</h1>
//       <div>
//         <Link to="/chat">Chat</Link>
//         <br />
//         <Link to="/support">Support</Link>
//       </div>
//       <hr />
//       <div className="login-buttons">
//         <a href="/login" className="login-button google">
//           Login with Google
//         </a>
//       </div>
//     </div>
//   );
// }
