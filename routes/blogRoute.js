import express from "express";
import {
  createBlog,
  getBlogById,
  getBlogs,
  updateBlog,
} from "../controller/BlogController.js";

const route = express.Router();

route.get("/all", getBlogs); //working
route.get("/:blogId", getBlogById);//working
route.post("/create", createBlog);
route.put("/:id", updateBlog);
export default route; 
