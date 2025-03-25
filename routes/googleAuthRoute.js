import express from "express";
import { googleLogin } from "../controller/GoogleAuthController.js";

const route = express.Router();

route.get("/test", (req, res) => {
  res.send("Auth Route");
});
route.get("/google", googleLogin);

export default route;
