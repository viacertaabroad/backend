import express from "express";
import { googleLogin } from "../controller/GoogleAuthController.js";
import userAgent from "../middleware/userAgent.js";

const route = express.Router();

route.get("/test", (req, res) => {
  res.send("test google Auth Route");
});
route.get("/google",userAgent, googleLogin);

export default route;
