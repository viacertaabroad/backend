import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:8000/events");

    eventSource.onopen = () => {
      console.log("SSE connection opened");
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // toast(data.message);

      toast(
        <div>
          <div>{data.message}</div>
          <div
            style={{ fontWeight: "bold", color: "#1976d2", cursor: "pointer" }}
            onClick={() => navigate(data.redirectUrl)}
          >
            {data.clickableMessage}
          </div>
        </div>,
        { closeOnClick: true }
      );
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      // Consider reconnecting logic here
    };

    return () => {
      eventSource.close(); // Close the connection when the component unmounts
    };
  }, [navigate]);
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
    </div>
  );
}
