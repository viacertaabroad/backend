import express from "express";
import { googleLogin } from "../controller/GoogleAuthController.js"; 
import { sessionMiddleware } from "../utils/sessionUtils.js";

const route = express.Router();

route.get("/test", (req, res) => {
  res.send("test google Auth Route");
});
route.get("/google",sessionMiddleware, googleLogin);

export default route;
