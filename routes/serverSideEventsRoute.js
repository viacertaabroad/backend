import express from "express";
import { isAuthenticatedUser } from "../middleware/auth.js";
import { addClient } from "../utils/sseManager.js";

const route = express.Router();

const fn = (req, res) => {
  const userId = req.user._id.toString();
  const role = req.user.role || "user";
  addClient(res, userId, role);
  console.log("/event triggerd", userId, role);
};

route.get("/", isAuthenticatedUser, fn);

export default route;
