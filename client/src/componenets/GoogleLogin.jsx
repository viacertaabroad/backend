import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function GoogleLogin() {
  const navigate = useNavigate();

  const googleLogin = useGoogleLogin({
    onSuccess: async (authResult) => {
      try {
        console.log("authResult", authResult);

        if (authResult["code"]) {
          //   const result = await googlAuth(authResult["code"]);
          const { data } = await axios.get(
            `http://localhost:8000/auth/google?code=${authResult.code}`,
            {
              withCredentials: true,
            }
          );
          const { email, name, avatar } = data.user;
          localStorage.setItem(
            "user-info",
            JSON.stringify({ email, name, avatar })
          );

          console.log("User logged in:", data.user);
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("error while requesting google code : ", error);
      }
    },
    onError: (error) => console.error("Google login error:", error),
    flow: "auth-code",
  });

  return (
    <div className="App">
      <button onClick={googleLogin}>Login with Google</button>
    </div>
  );
}

export default GoogleLogin;
