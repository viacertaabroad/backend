import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Chat from "./componenets/Chat";
import Support from "./componenets/Support";
import Home from "./componenets/Home";

import GoogleLogin from "./componenets/GoogleLogin";
import Dashboard from "./componenets/Dashboard";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from 'react-toastify';
import Xss from "./componenets/Xss";
function App() {
  const clientId = process.env.REACT_APP_CLIENT_ID;
  const GoogleAuthWrapper = () => {
    return (
      <GoogleOAuthProvider clientId={clientId}>
        <GoogleLogin></GoogleLogin>
      </GoogleOAuthProvider>
    );
  };

  return (
    <div className="App">
      <ToastContainer/>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/support" element={<Support />} />

          <Route path="/login" element={<GoogleAuthWrapper />} />
          {/* <Route path="/" element={<Navigate to={"/login"} />} /> */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/xss" element={<Xss />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
