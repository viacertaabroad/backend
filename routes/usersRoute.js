import express from "express";
import {
  forgotPassword,
  listSessions,
  login,
  logOut,
  logoutAll,
  logoutSession,
  me,
  resetPassword,
  signUp,
  updatePassword,
  updateProfile,
  verify,
} from "../controller/UserController.js";

import { isAuthenticatedUser, authorizedRole } from "../middleware/auth.js";
import { forgotLinkLimit, logInLimit } from "../middleware/rateLimit.js";
import userAgent from "../middleware/userAgent.js";
 

const route = express.Router();

route.post("/signup", signUp); // working
route.post("/signup/verify", verify); // working  //verify one more time beacause of genToken()
route.post("/login",logInLimit,userAgent, login); //working
route.get("/me", isAuthenticatedUser, authorizedRole(["user","admin"]), me); //working
route.put("/update_profile", isAuthenticatedUser, updateProfile); //working
route.put("/update_password", isAuthenticatedUser, updatePassword); //working
route.post("/forgot-password",forgotLinkLimit, forgotPassword); // working
route.post("/reset-password", resetPassword); // working
route.post("/logout", logOut); //working


// 
// Session management endpoints
route.get("/sessions", isAuthenticatedUser, listSessions);
route.delete("/sessions/:sessionId", isAuthenticatedUser, logoutSession);
route.delete("/sessions", isAuthenticatedUser, logoutAll);
 
// 

export default route;
