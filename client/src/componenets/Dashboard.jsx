import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState({});
  const navigate = useNavigate();
  useEffect(() => {
    const data = localStorage.getItem("user-info");
    const userData = JSON.parse(data);
    setUser(userData);
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("user-info");
    navigate("/login");
  };
  return (
    <div>
      Dashboard
      <hr />
      <br />
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h1 className="text-2xl font-bold">Welcome {user?.name}</h1>
        <h3 className="text-lg text-gray-600">{user?.email}</h3>
        <img
          src={user?.avatar}
          alt="Profile"
          referrerPolicy="no-referrer"
          width={200}
          height={200}
          className="rounded-full border-2 border-gray-300 shadow-lg mt-4"
        />
      </div>
      <br />
      <hr />
      <br />
      <div>
        <button onClick={handleLogout}>Log-Out</button>
      </div>
    </div>
  );
}

export default Dashboard;
